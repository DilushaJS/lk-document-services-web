import { createAdminClient } from '@/lib/supabase/admin'
import { formatDateTime } from '@/lib/utils'

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

const STATUS_COLORS: Record<string, string> = {
  pending:     '#fdebd0',
  reviewing:   '#d4ede6',
  in_progress: '#d4e6f5',
  completed:   '#d5f5e3',
  cancelled:   '#fde8e6',
}

const STATUS_TEXT: Record<string, string> = {
  pending:     '#a0620a',
  reviewing:   '#256e54',
  in_progress: '#1a5276',
  completed:   '#1e8449',
  cancelled:   '#922b21',
}

export default async function SubmissionsPage() {
  const supabase = createAdminClient()
  const { data: submissions } = await supabase
    .from('submissions')
    .select('*, clients(first_name, last_name, email, phone)')
    .order('submitted_at', { ascending: false })

  return (
    <div>
      <h1 style={{ fontFamily: 'serif', fontSize: '28px', marginBottom: '8px' }}>Submissions</h1>
      <p style={{ color: '#8a9bb0', marginBottom: '32px', fontSize: '14px' }}>
        All service requests from clients.
      </p>

      <div style={{ background: 'white', borderRadius: '10px', border: '1px solid #ede6d8' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f9f7f3' }}>
              {['Client', 'Service', 'Package', 'Status', 'Submitted', 'Action'].map((h) => (
                <th key={h} style={{
                  padding: '12px 24px',
                  textAlign: 'left',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#8a9bb0',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(submissions ?? []).map((sub: any, i: number) => (
              <tr key={sub.id} style={{ borderTop: i > 0 ? '1px solid #f0ebe0' : 'none' }}>
                <td style={{ padding: '14px 24px' }}>
                  <div style={{ fontSize: '14px', fontWeight: 500 }}>
                    {sub.clients?.first_name} {sub.clients?.last_name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#8a9bb0' }}>{sub.clients?.phone}</div>
                </td>
                <td style={{ padding: '14px 24px', fontSize: '14px' }}>
                  {SERVICE_LABELS[sub.service_type] ?? sub.service_type}
                </td>
                <td style={{ padding: '14px 24px', fontSize: '14px', color: '#8a9bb0' }}>
                  {sub.package ? sub.package.charAt(0).toUpperCase() + sub.package.slice(1) : '—'}
                </td>
                <td style={{ padding: '14px 24px' }}>
                  <span style={{
                    background: STATUS_COLORS[sub.status] ?? '#eee',
                    color: STATUS_TEXT[sub.status] ?? '#333',
                    padding: '3px 10px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 500,
                    textTransform: 'capitalize',
                  }}>
                    {sub.status}
                  </span>
                </td>
                <td style={{ padding: '14px 24px', fontSize: '13px', color: '#8a9bb0' }}>
                  {formatDateTime(sub.submitted_at)}
                </td>
                <td style={{ padding: '14px 24px' }}>
                  <a
                    href={`/admin/submissions/${sub.id}`}
                    style={{ fontSize: '13px', color: '#0d1b2a', fontWeight: 500 }}
                  >
                    {'View →'}
                  </a>
                </td>
              </tr>
            ))}
            {(submissions ?? []).length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#8a9bb0', fontSize: '14px' }}>
                  No submissions yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}