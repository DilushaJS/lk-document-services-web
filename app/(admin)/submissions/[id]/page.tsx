import { createAdminClient } from '@/lib/supabase/admin'
import { formatDateTime, formatDate, formatCurrency } from '@/lib/utils'
import { notFound } from 'next/navigation'

export const revalidate = 0

const SERVICE_LABELS: Record<string, string> = {
  business_registration: 'Business Registration',
  notary_mobile: 'Mobile Notary',
  notary_home: 'Notary (Home)',
  rent_ejectment: 'Rent / Ejectment',
  immigration: 'Immigration',
  trademark: 'Trademark',
  sri_lankan_documents: 'Sri Lankan Documents',
}

export default async function SubmissionDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createAdminClient()

  const { data: submission } = await supabase
    .from('submissions')
    .select('*, clients(*)')
    .eq('id', params.id)
    .single()

  if (!submission) notFound()

  const { data: documents } = await supabase
    .from('documents')
    .select('*')
    .eq('submission_id', params.id)

  const { data: payment } = await supabase
    .from('payments')
    .select('*')
    .eq('submission_id', params.id)
    .single()

  const { data: appointment } = await supabase
    .from('appointments')
    .select('*')
    .eq('submission_id', params.id)
    .single()

  const client = submission.clients as any
  const formData = submission.form_data as Record<string, any>

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <a href="/admin/submissions" style={{ fontSize: '13px', color: '#8a9bb0', textDecoration: 'none' }}>
          {'← Back to submissions'}
        </a>
        <h1 style={{ fontFamily: 'serif', fontSize: '28px', marginTop: '12px', marginBottom: '4px' }}>
          {SERVICE_LABELS[submission.service_type] ?? submission.service_type}
        </h1>
        <p style={{ color: '#8a9bb0', fontSize: '13px' }}>
          Submitted {formatDateTime(submission.submitted_at)} · ID: {submission.id}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

        {/* Client info */}
        <Section title="Client Information">
          <Field label="Name" value={`${client?.first_name} ${client?.last_name}`} />
          <Field label="Email" value={client?.email} />
          <Field label="Phone" value={client?.phone} />
          <Field label="Type" value={client?.client_type} />
          {client?.business_name && <Field label="Business" value={client.business_name} />}
        </Section>

        {/* Status */}
        <Section title="Submission Status">
          <Field label="Current Status" value={submission.status} />
          {submission.package && (
            <Field label="Package" value={submission.package.charAt(0).toUpperCase() + submission.package.slice(1)} />
          )}
          {submission.assigned_to && <Field label="Assigned To" value={submission.assigned_to} />}
          {submission.completed_at && <Field label="Completed" value={formatDateTime(submission.completed_at)} />}
          {submission.admin_notes && <Field label="Admin Notes" value={submission.admin_notes} />}
        </Section>

        {/* Form data */}
        <Section title="Form Data">
          {Object.entries(formData).map(([key, value]) => (
            <Field
              key={key}
              label={key.replace(/_/g, ' ')}
              value={typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value ?? '—')}
            />
          ))}
        </Section>

        {/* Payment */}
        {payment && (
          <Section title="Payment">
            <Field label="Status" value={payment.status} />
            <Field label="Amount" value={formatCurrency(payment.amount)} />
            <Field label="Provider" value={payment.provider} />
            {payment.paid_at && <Field label="Paid At" value={formatDateTime(payment.paid_at)} />}
            {payment.stripe_session_id && <Field label="Stripe Session" value={payment.stripe_session_id} />}
          </Section>
        )}

        {/* Appointment */}
        {appointment && (
          <Section title="Appointment">
            <Field label="Status" value={appointment.status} />
            <Field label="Requested Date" value={formatDate(appointment.requested_date)} />
            <Field label="Requested Time" value={appointment.requested_time} />
            {appointment.confirmed_date && <Field label="Confirmed Date" value={formatDate(appointment.confirmed_date)} />}
            {appointment.confirmed_time && <Field label="Confirmed Time" value={appointment.confirmed_time} />}
            {appointment.location_address && <Field label="Location" value={appointment.location_address} />}
            {appointment.admin_notes && <Field label="Notes" value={appointment.admin_notes} />}
          </Section>
        )}

        {/* Documents */}
        {documents && documents.length > 0 && (
          <Section title={`Documents (${documents.length})`}>
            {documents.map((doc: any) => (
              <div key={doc.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 0',
                borderBottom: '1px solid #f0ebe0',
              }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 500 }}>{doc.file_name}</div>
                  <div style={{ fontSize: '12px', color: '#8a9bb0' }}>
                    {doc.document_type} · {doc.mime_type}
                  </div>
                </div>
                <DownloadButton fileKey={doc.file_key} />
              </div>
            ))}
          </Section>
        )}
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'white', borderRadius: '10px', border: '1px solid #ede6d8', padding: '24px' }}>
      <h2 style={{ fontFamily: 'serif', fontSize: '16px', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #f0ebe0' }}>
        {title}
      </h2>
      {children}
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ marginBottom: '12px' }}>
      <div style={{ fontSize: '11px', color: '#8a9bb0', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '2px' }}>
        {label}
      </div>
      <div style={{ fontSize: '14px', color: '#0d1b2a', textTransform: 'capitalize' }}>
        {value || '—'}
      </div>
    </div>
  )
}

function DownloadButton({ fileKey }: { fileKey: string }) {
  return (
    <span style={{ fontSize: '12px', color: '#8a9bb0' }}>
      {fileKey ? 'Available' : '—'}
    </span>
  )
}