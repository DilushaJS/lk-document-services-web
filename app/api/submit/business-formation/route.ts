import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendAdminNotification, sendClientConfirmation } from '@/lib/resend'
import { BusinessFormationInput } from '@/types'
import { z } from 'zod'

const schema = z.object({
  client_type: z.enum(['individual', 'business']),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(7),
  entity_type: z.enum(['LLC', 'Corporation', 'LLP', 'GP', 'Amendment']),
  package: z.enum(['basic', 'standard', 'premium']),
  business_name_1: z.string().min(1),
  business_name_2: z.string().optional(),
  business_name_3: z.string().optional(),
  business_purpose: z.string().min(1),
  principal_address: z.string().min(1),
  mailing_address: z.string().optional(),
  registered_agent: z.enum(['client', 'third_party']),
  owners: z.array(z.object({
    full_name: z.string().min(1),
    address: z.string().min(1),
    title: z.string().min(1),
    ownership_percentage: z.number().min(0).max(100),
  })).min(1),
  manager_managed: z.enum(['manager', 'member']).optional(),
  number_of_directors: z.number().optional(),
  effective_date: z.string().optional(),
  need_ein: z.boolean().optional(),
  need_operating_agreement: z.boolean().optional(),
  need_initial_resolutions: z.boolean().optional(),
  need_amendment: z.boolean().optional(),
})

const PACKAGE_PRICES: Record<string, number> = {
  basic: 100,
  standard: 150,
  premium: 750,
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

    // 1. Create or find client
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .insert({
        client_type: data.client_type,
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
        service_type: 'business_registration',
        package: data.package,
        status: 'pending',
        form_data: {
          entity_type: data.entity_type,
          business_name_1: data.business_name_1,
          business_name_2: data.business_name_2,
          business_name_3: data.business_name_3,
          business_purpose: data.business_purpose,
          principal_address: data.principal_address,
          mailing_address: data.mailing_address,
          registered_agent: data.registered_agent,
          owners: data.owners,
          manager_managed: data.manager_managed,
          number_of_directors: data.number_of_directors,
          effective_date: data.effective_date,
          need_ein: data.need_ein,
          need_operating_agreement: data.need_operating_agreement,
          need_initial_resolutions: data.need_initial_resolutions,
          need_amendment: data.need_amendment,
        },
      })
      .select()
      .single()

    if (submissionError) throw submissionError

    // 3. Create pending payment record
    const { error: paymentError } = await supabase
      .from('payments')
      .insert({
        submission_id: submission.id,
        client_id: client.id,
        provider: 'stripe',
        status: 'pending',
        amount: PACKAGE_PRICES[data.package],
        currency: 'USD',
      })

    if (paymentError) throw paymentError

    // 4. Send emails (non-blocking)
    const clientName = `${data.first_name} ${data.last_name}`
    const packageLabel = data.package.charAt(0).toUpperCase() + data.package.slice(1)

    await Promise.allSettled([
      sendAdminNotification({
        subject: `New Business Formation — ${clientName} (${packageLabel})`,
        clientName,
        clientEmail: data.email,
        clientPhone: data.phone,
        serviceType: `Business Registration — ${packageLabel} Package`,
        submissionId: submission.id,
        extraDetails: `Entity: ${data.entity_type} | Business Name: ${data.business_name_1}`,
      }),
      sendClientConfirmation({
        toEmail: data.email,
        clientName,
        serviceLabel: `Business Formation — ${packageLabel} Package ($${PACKAGE_PRICES[data.package]} + state fee)`,
        message: `We will review your information and send you a payment link and next steps within 1 business day. If you have any questions in the meantime, call or text us at 951-437-9289.`,
      }),
    ])

    return NextResponse.json({
      success: true,
      submission_id: submission.id,
      client_id: client.id,
      amount: PACKAGE_PRICES[data.package],
    })

  } catch (error) {
    console.error('Business formation submission error:', error)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}