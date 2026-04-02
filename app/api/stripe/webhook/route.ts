import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendAdminNotification, sendClientConfirmation } from '@/lib/resend'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event

  // Verify webhook signature
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = createAdminClient()

  // Handle the event
  switch (event.type) {

    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session

      const submissionId = session.metadata?.submission_id
      const clientId = session.metadata?.client_id
      const clientName = session.metadata?.client_name
      const pkg = session.metadata?.package

      if (!submissionId || !clientId) {
        console.error('Missing metadata in session:', session.id)
        break
      }

      // 1. Update payment status to paid
      await supabase
        .from('payments')
        .update({
          status: 'paid',
          stripe_session_id: session.id,
          stripe_payment_intent: session.payment_intent as string,
          receipt_url: null,
          paid_at: new Date().toISOString(),
        })
        .eq('submission_id', submissionId)

      // 2. Update submission status to reviewing
      await supabase
        .from('submissions')
        .update({ status: 'reviewing' })
        .eq('id', submissionId)

      // 3. Get client email for confirmation
      const { data: client } = await supabase
        .from('clients')
        .select('email, first_name')
        .eq('id', clientId)
        .single()

      // 4. Send emails
      if (client) {
        await Promise.allSettled([
          sendAdminNotification({
            subject: `✅ Payment Received — ${clientName} — ${pkg} Package`,
            clientName: clientName ?? 'Client',
            clientEmail: client.email,
            clientPhone: '',
            serviceType: `Business Registration — ${pkg} Package`,
            submissionId,
            extraDetails: `Amount: $${(session.amount_total ?? 0) / 100} | Payment Intent: ${session.payment_intent}`,
          }),
          sendClientConfirmation({
            toEmail: client.email,
            clientName: client.first_name,
            serviceLabel: `Business Formation — ${pkg} Package`,
            message: `Your payment of <strong>$${(session.amount_total ?? 0) / 100}</strong> has been received. We will begin processing your filing and send you updates within 1–3 business days. If you have any questions, call or text us at <strong>951-437-9289</strong>.`,
          }),
        ])
      }

      break
    }

    case 'checkout.session.expired': {
      const session = event.data.object as Stripe.Checkout.Session
      const submissionId = session.metadata?.submission_id

      if (submissionId) {
        await supabase
          .from('payments')
          .update({ status: 'failed' })
          .eq('submission_id', submissionId)
      }

      break
    }

    case 'charge.refunded': {
      const charge = event.data.object as Stripe.Charge

      await supabase
        .from('payments')
        .update({
          status: 'refunded',
          refunded_at: new Date().toISOString(),
        })
        .eq('stripe_payment_intent', charge.payment_intent as string)

      break
    }

    default:
      console.log(`Unhandled event type: ${event.type}`)
  }

  return NextResponse.json({ received: true })
}