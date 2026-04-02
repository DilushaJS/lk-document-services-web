import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendAdminNotification, sendClientConfirmation } from '@/lib/resend'
import { z } from 'zod'

const schema = z.object({
  // Client info — same across all quote services
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(7),

  // Which service
  service_type: z.enum([
    'rent_ejectment',
    'immigration',
    'trademark',
    'sri_lankan_documents',
  ]),

  // All other fields stored as flexible JSON
  form_data: z.record(z.string(), z.unknown()),
})

const SERVICE_LABELS: Record<string, string> = {
  rent_ejectment: 'Rent / Lease Documents',
  immigration: 'Immigration Forms Assistance',
  trademark: 'Trademark Services',
  sri_lankan_documents: 'Sri Lankan Documents',
}

const CLIENT_MESSAGES: Record<string, string> = {
  rent_ejectment:
    'We will review your property details and send you a custom quote within 1–2 business days. No payment is required until you approve the quote and service agreement.',
  immigration:
    'We will review your immigration matter and send you a custom quote and service scope within 1–2 business days. Please note: LK Document Services provides form preparation assistance only — we do not provide legal advice or legal representation.',
  trademark:
    'We will review your trademark details and send you a custom quote and engagement terms within 1–2 business days. No payment is required until you approve the scope.',
  sri_lankan_documents:
    'We will review your request and send you a fee quote and service scope within 1–2 business days. You can also reach us via WhatsApp at 951-437-9289 for faster communication.',
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = schema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { error: 'Invalid form data', details: validated.error.flatten() },
        { status: 400 }
      )
    }

    const data = validated.data
    const supabase = createAdminClient()
    const clientName = `${data.first_name} ${data.last_name}`
    const serviceLabel = SERVICE_LABELS[data.service_type]

    // 1. Create client
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .insert({
        client_type: 'individual',
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone: data.phone,
      })
      .select()
      .single()

    if (clientError) throw clientError

    // 2. Create submission
    const { data: submission, error: submissionError } = await supabase
      .from('submissions')
      .insert({
        client_id: client.id,
        service_type: data.service_type,
        status: 'pending',
        form_data: data.form_data,
      })
      .select()
      .single()

    if (submissionError) throw submissionError

    // 3. Send emails
    await Promise.allSettled([
      sendAdminNotification({
        subject: `New Intake — ${serviceLabel} — ${clientName}`,
        clientName,
        clientEmail: data.email,
        clientPhone: data.phone,
        serviceType: serviceLabel,
        submissionId: submission.id,
      }),
      sendClientConfirmation({
        toEmail: data.email,
        clientName,
        serviceLabel,
        message: CLIENT_MESSAGES[data.service_type],
      }),
    ])

    return NextResponse.json({
      success: true,
      submission_id: submission.id,
      client_id: client.id,
    })

  } catch (error) {
    console.error('Quote intake submission error:', error)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}