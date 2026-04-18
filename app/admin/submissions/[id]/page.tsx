import { createAdminClient } from '@/lib/supabase/admin'
import { formatDateTime, formatDate, formatCurrency } from '@/lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DownloadButton } from '@/components/admin/DownloadButton'
import { notFound } from 'next/navigation'
import DeleteButton from '@/app/admin/submissions/[id]/DeleteButton'
import Link from 'next/link'

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

const STATUS_BADGE_CONFIG: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending: { variant: 'outline' },
  reviewing: { variant: 'secondary' },
  in_progress: { variant: 'secondary' },
  completed: { variant: 'default' },
  cancelled: { variant: 'destructive' },
}

export default async function SubmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = createAdminClient()

  const { data: submission } = await supabase
    .from('submissions')
    .select('*, clients(*)')
    .eq('id', id)
    .single()

  if (!submission) notFound()

  const { data: documents } = await supabase
    .from('documents')
    .select('*')
    .eq('submission_id', id)

  const { data: payment } = await supabase
    .from('payments')
    .select('*')
    .eq('submission_id', id)
    .single()

  const { data: appointment } = await supabase
    .from('appointments')
    .select('*')
    .eq('submission_id', id)
    .single()

  const client = submission.clients as any
  const formData = submission.form_data as Record<string, any>

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="mb-4">
          <Link href="/admin/submissions" className="text-sm text-muted-foreground hover:text-foreground">
            ← Back to submissions
          </Link>
        </div>
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {SERVICE_LABELS[submission.service_type] ?? submission.service_type}
            </h1>
            <p className="text-sm text-muted-foreground mt-2">
              Submitted {formatDateTime(submission.submitted_at)} · ID: {submission.id}
            </p>
          </div>
          <DeleteButton submissionId={submission.id} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Client info */}
        <Card>
          <CardHeader>
            <CardTitle>Client Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field label="Name" value={`${client?.first_name} ${client?.last_name}`} />
            <Field label="Email" value={client?.email} />
            <Field label="Phone" value={client?.phone} />
            <Field label="Type" value={client?.client_type} />
            {client?.business_name && <Field label="Business" value={client.business_name} />}
          </CardContent>
        </Card>

        {/* Status */}
        <Card>
          <CardHeader>
            <CardTitle>Submission Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">Status</label>
              <div className="mt-1">
                <Badge variant={STATUS_BADGE_CONFIG[submission.status]?.variant || 'outline'}>
                  {submission.status}
                </Badge>
              </div>
            </div>
            {submission.package && (
              <Field label="Package" value={submission.package.charAt(0).toUpperCase() + submission.package.slice(1)} />
            )}
            {submission.assigned_to && <Field label="Assigned To" value={submission.assigned_to} />}
            {submission.completed_at && <Field label="Completed" value={formatDateTime(submission.completed_at)} />}
            {submission.admin_notes && <Field label="Admin Notes" value={submission.admin_notes} />}
          </CardContent>
        </Card>

        {/* Form data */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Form Data</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(formData).map(([key, value]) => (
              <Field
                key={key}
                label={key.replace(/_/g, ' ')}
                value={typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value ?? '—')}
              />
            ))}
          </CardContent>
        </Card>

        {/* Payment */}
        {payment && (
          <Card>
            <CardHeader>
              <CardTitle>Payment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">Status</label>
                <div className="mt-1">
                  <Badge variant={STATUS_BADGE_CONFIG[payment.status]?.variant || 'outline'}>
                    {payment.status}
                  </Badge>
                </div>
              </div>
              <Field label="Amount" value={formatCurrency(payment.amount)} />
              <Field label="Provider" value={payment.provider} />
              {payment.paid_at && <Field label="Paid At" value={formatDateTime(payment.paid_at)} />}
              {payment.stripe_session_id && <Field label="Stripe Session" value={payment.stripe_session_id} />}
            </CardContent>
          </Card>
        )}

        {/* Appointment */}
        {appointment && (
          <Card>
            <CardHeader>
              <CardTitle>Appointment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">Status</label>
                <div className="mt-1">
                  <Badge variant={STATUS_BADGE_CONFIG[appointment.status]?.variant || 'outline'}>
                    {appointment.status}
                  </Badge>
                </div>
              </div>
              <Field label="Requested Date" value={formatDate(appointment.requested_date)} />
              <Field label="Requested Time" value={appointment.requested_time} />
              {appointment.confirmed_date && <Field label="Confirmed Date" value={formatDate(appointment.confirmed_date)} />}
              {appointment.confirmed_time && <Field label="Confirmed Time" value={appointment.confirmed_time} />}
              {appointment.location_address && <Field label="Location" value={appointment.location_address} />}
              {appointment.admin_notes && <Field label="Notes" value={appointment.admin_notes} />}
            </CardContent>
          </Card>
        )}

        {/* Documents */}
        {documents && documents.length > 0 && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Documents ({documents.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {documents.map((doc: any) => (
                  <div key={doc.id} className="flex items-center justify-between pb-4 border-b last:border-0 last:pb-0">
                    <div>
                      <div className="font-medium text-sm">{doc.file_name}</div>
                      <div className="text-xs text-muted-foreground">
                        {doc.document_type} · {doc.mime_type}
                      </div>
                    </div>
                    <DownloadButton fileKey={doc.file_key} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">{label}</label>
      <div className="mt-1 text-sm capitalize">{value || '—'}</div>
    </div>
  )
}