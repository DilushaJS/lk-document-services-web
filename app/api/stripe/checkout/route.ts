import { NextRequest, NextResponse } from 'next/server'
import { stripe, PACKAGE_PRICES, PACKAGE_LABELS } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import { getPublicCorsHeaders, handleCorsPreFlight } from '@/lib/utils/cors'
import { z } from 'zod'

const schema = z.object({
  submission_id: z.string().uuid(),
  client_id: z.string().uuid(),
  package: z.enum(['basic', 'standard', 'premium']),
  client_email: z.string().email(),
  client_name: z.string().min(1),
})

export async function OPTIONS() {
  return handleCorsPreFlight(getPublicCorsHeaders())
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = schema.safeParse(body)

    if (!validated.success) {
      const response = NextResponse.json(
        { error: 'Invalid request', details: validated.error.flatten() },
        { status: 400 }
      )
      Object.entries(getPublicCorsHeaders()).forEach(([key, value]) => {
        response.headers.set(key, value)
      })
      return response
    }

    const { submission_id, client_id, package: pkg, client_email, client_name } = validated.data
    const amount = PACKAGE_PRICES[pkg]
    const label = PACKAGE_LABELS[pkg]

    // Verify submission exists and belongs to the client
    const supabase = createAdminClient()
    const { data: submission, error: submissionError } = await supabase
      .from('submissions')
      .select('id, client_id, status')
      .eq('id', submission_id)
      .single()

    if (submissionError || !submission) {
      const response = NextResponse.json(
        { error: 'Invalid request' },
        { status: 400 }
      )
      Object.entries(getPublicCorsHeaders()).forEach(([key, value]) => {
        response.headers.set(key, value)
      })
      return response
    }

    // Verify client_id matches
    if (submission.client_id !== client_id) {
      const response = NextResponse.json(
        { error: 'Invalid request' },
        { status: 403 }
      )
      Object.entries(getPublicCorsHeaders()).forEach(([key, value]) => {
        response.headers.set(key, value)
      })
      return response
    }

    // Create Stripe Checkout Session
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: client_email,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: amount * 100, // Stripe uses cents
            product_data: {
              name: `LK Document Services — ${label}`,
              description: 'State filing fee not included. Service fee only.',
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        submission_id,
        client_id,
        package: pkg,
        client_name,
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/cancelled`,
    })

    // Update payment record with session ID
    await supabase
      .from('payments')
      .update({ stripe_session_id: checkoutSession.id })
      .eq('submission_id', submission_id)

    const response = NextResponse.json({
      success: true,
      checkout_url: checkoutSession.url,
      session_id: checkoutSession.id,
    })
    Object.entries(getPublicCorsHeaders()).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
    return response

  } catch (error) {
    console.error('Stripe checkout error:', error)
    const response = NextResponse.json(
      { error: 'Could not create payment session.' },
      { status: 500 }
    )
    Object.entries(getPublicCorsHeaders()).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
    return response
  }
}