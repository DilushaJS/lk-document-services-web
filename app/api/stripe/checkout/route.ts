import { NextRequest, NextResponse } from 'next/server'
import { stripe, PACKAGE_PRICES, PACKAGE_LABELS } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import { z } from 'zod'

const schema = z.object({
  submission_id: z.string().uuid(),
  client_id: z.string().uuid(),
  package: z.enum(['basic', 'standard', 'premium']),
  client_email: z.string().email(),
  client_name: z.string().min(1),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = schema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validated.error.flatten() },
        { status: 400 }
      )
    }

    const { submission_id, client_id, package: pkg, client_email, client_name } = validated.data
    const amount = PACKAGE_PRICES[pkg]
    const label = PACKAGE_LABELS[pkg]

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
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
    const supabase = createAdminClient()
    await supabase
      .from('payments')
      .update({ stripe_session_id: session.id })
      .eq('submission_id', submission_id)

    return NextResponse.json({
      success: true,
      checkout_url: session.url,
      session_id: session.id,
    })

  } catch (error) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json(
      { error: 'Could not create payment session.' },
      { status: 500 }
    )
  }
}