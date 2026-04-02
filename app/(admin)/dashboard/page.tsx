import { createAdminClient } from '@/lib/supabase/admin'
import { formatDateTime } from '@/lib/utils'

export const revalidate = 0

async function getStats() {
  const supabase = createAdminClient()

  const [submissions, appointments, messages, payments] = await Promise.all([
    supabase.from('submissions').select('*', { count: 'exact' }).eq('status', 'pending'),
    supabase.from('appointments').select('*', { count: 'exact' }).eq('status', 'pending'),
    supabase.from('contact_messages').select('*', { count: 'exact' }).eq('is_read', false),
    supabase.from('payments').select('*', { count: 'exact' }).eq('status', 'pending'),
  ])

  return {
    pending_submissions: submissions.count ?? 0,
    pending_appointments: appointments.count ?? 0,
    unread_messages: messages.count ?? 0,
    pending_payments: payments.count ?? 0,
  }
}

async function getRecentSubmissions() {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('submissions')
    .select(`*, clients(first_name, last_name, email, phone)`)
    .order('submitted_at', { ascending: false })
    .limit(5)
  return data ?? []
}

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

export default async function DashboardPage() {
  const [stats, recent] = await Promise.all([getStats(), getRecentSubmissions()])

  return (
    <div>
      <h1 style={{ fontFamily: 'serif', fontSize: '28px', marginBottom: '8px' }}>Dashboard</h1>
      <p style={{ color: '#8a9bb0', marginBottom: '32px', fontSize: '14px' }}>
        Welcome back. Here is what needs your attention.
      </p>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '40px' }}>
        {[
          { label: 'Pending Submissions', value: stats.pending_submissions, href: '/admin/submissions', color: '#fdebd0' },
          { label: 'Pending Appointments', value: stats.pending_appointments, href: '/admin/appointments', color: '#d4e6f5' },
          { label: 'Unread Messages', value: stats.unread_messages, href: '/admin/submissions', color: '#fde8e6' },
          { label: 'Pending Payments', value: stats.pending_payments, href: '/admin/payments', color: '#d4ede6' },
        ].map((stat) => (
          <a key={stat.label} href={stat.href} style={{ textDecoration: 'none' }}>
            <div style={{
              background: 'white',
              border: '1px solid #ede6d8',
              borderRadius: '10px',
              padding: '24px',
              cursor: 'pointer',
            }}>
              <div style={{
                fontSize: '36px',
                fontFamily: 'serif',
                color: '#0d1b2a',
                marginBottom: '6px',
              }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '13px', color: '#8a9bb0' }}>{stat.label}</div>
            </div>
          </a>
        ))}
      </div>

      {/* Recent submissions */}
      <div style={{ background: 'white', borderRadius: '10px', border: '1px solid #ede6d8' }}>
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #ede6d8',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <h2 style={{ fontFamily: 'serif', fontSize: '18px' }}>Recent Submissions</h2>
          <a href="/admin/submissions" style={{ fontSize: '13px', color: '#8a9bb0' }}>View all →</a>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f9f7f3' }}>
              {['Client', 'Service', 'Status', 'Submitted', 'Action'].map((h) => (
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
            {recent.map((sub: any, i: number) => (
              <tr key={sub.id} style={{ borderTop: i > 0 ? '1px solid #f0ebe0' : 'none' }}>
                <td style={{ padding: '14px 24px' }}>
                  <div style={{ fontSize: '14px', fontWeight: 500 }}>
                    {sub.clients?.first_name} {sub.clients?.last_name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#8a9bb0' }}>{sub.clients?.email}</div>
                </td>
                <td style={{ padding: '14px 24px', fontSize: '14px' }}>
                  {SERVICE_LABELS[sub.service_type] ?? sub.service_type}
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
                    View →
                  </a>
                </td>
              </tr>
            ))}
            {recent.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#8a9bb0', fontSize: '14px' }}>
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