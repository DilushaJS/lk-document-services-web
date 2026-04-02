import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendAdminNotification, sendClientConfirmation } from '@/lib/resend'
import { z } from 'zod'

const schema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(7),
  service_type: z.enum(['notary_mobile', 'notary_home']),
  preferred_date: z.string().min(1),
  preferred_time_range: z.enum(['morning', 'afternoon', 'evening']),
  signing_address: z.string().optional(),
  number_of_signers: z.number().min(1),
  document_type: z.string().min(1),
  need_witnesses: z.enum(['yes', 'no', 'unsure']).optional(),
  id_available: z.string().min(1),
})

const TIME_RANGE_LABELS: Record<string, string> = {
  morning: '9:00 AM – 12:00 PM',
  afternoon: '12:00 PM – 5:00 PM',
  evening: '5:00 PM – 8:00 PM',
}

const TIME_RANGE_SLOTS: Record<string, string> = {
  morning: '09:00',
  afternoon: '13:00',
  evening: '17:00',
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
    const serviceLabel = data.service_type === 'notary_mobile'
      ? 'Mobile Notary'
      : 'Notary (Office Visit)'

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
        form_data: {
          preferred_time_range: data.preferred_time_range,
          number_of_signers: data.number_of_signers,
          document_type: data.document_type,
          need_witnesses: data.need_witnesses,
          id_available: data.id_available,
        },
      })
      .select()
      .single()

    if (submissionError) throw submissionError

    // 3. Create appointment request
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .insert({
        submission_id: submission.id,
        client_id: client.id,
        service_type: data.service_type,
        status: 'pending',
        requested_date: data.preferred_date,
        requested_time: TIME_RANGE_SLOTS[data.preferred_time_range],
        location_address: data.signing_address,
      })
      .select()
      .single()

    if (appointmentError) throw appointmentError

    // 4. Send emails
    await Promise.allSettled([
      sendAdminNotification({
        subject: `New Notary Request — ${clientName} — ${data.preferred_date}`,
        clientName,
        clientEmail: data.email,
        clientPhone: data.phone,
        serviceType: serviceLabel,
        submissionId: submission.id,
        extraDetails: `Date: ${data.preferred_date} | Time: ${TIME_RANGE_LABELS[data.preferred_time_range]} | Signers: ${data.number_of_signers} | Document: ${data.document_type}${data.signing_address ? ` | Address: ${data.signing_address}` : ''}`,
      }),
      sendClientConfirmation({
        toEmail: data.email,
        clientName,
        serviceLabel,
        message: `Your appointment request for <strong>${data.preferred_date}</strong> (${TIME_RANGE_LABELS[data.preferred_time_range]}) has been received. We will confirm availability, travel fee (if applicable), and appointment details within 1 business day. Please have your valid ID ready.`,
      }),
    ])

    return NextResponse.json({
      success: true,
      submission_id: submission.id,
      appointment_id: appointment.id,
      client_id: client.id,
    })

  } catch (error) {
    console.error('Notary submission error:', error)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}