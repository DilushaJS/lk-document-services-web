import { createAdminClient } from '@/lib/supabase/admin'
import { formatDate } from '@/lib/utils'

export const revalidate = 0

const STATUS_COLORS: Record<string, string> = {
  pending:     '#fdebd0',
  confirmed:   '#d4ede6',
  rescheduled: '#d4e6f5',
  completed:   '#d5f5e3',
  cancelled:   '#fde8e6',
}

const STATUS_TEXT: Record<string, string> = {
  pending:     '#a0620a',
  confirmed:   '#256e54',
  rescheduled: '#1a5276',
  completed:   '#1e8449',
  cancelled:   '#922b21',
}

const SERVICE_LABELS: Record<string, string> = {
  notary_mobile: 'Mobile Notary',
  notary_home:   'Notary (Home)',
  rent_ejectment: 'Rent / Ejectment',
  intellectual_property: 'IP Services',
  immigration: 'Immigration',
  trademark: 'Trademark',
  sri_lankan_documents: 'Sri Lankan Documents',
}

export default async function AppointmentsPage() {
  const supabase = createAdminClient()
  const { data: appointments } = await supabase
    .from('appointments')
    .select('*, clients(first_name, last_name, email, phone)')
    .order('requested_date', { ascending: true })

  return (
    <div>
      <h1 style={{ fontFamily: 'serif', fontSize: '28px', marginBottom: '8px' }}>Appointments</h1>
      <p style={{ color: '#8a9bb0', marginBottom: '32px', fontSize: '14px' }}>
        All appointment requests. Confirm or reschedule from here.
      </p>

      <div style={{ background: 'white', borderRadius: '10px', border: '1px solid #ede6d8' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f9f7f3' }}>
              {['Client', 'Service', 'Requested Date', 'Time', 'Location', 'Status'].map((h) => (
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
            {(appointments ?? []).map((apt: any, i: number) => (
              <tr key={apt.id} style={{ borderTop: i > 0 ? '1px solid #f0ebe0' : 'none' }}>
                <td style={{ padding: '14px 24px' }}>
                  <div style={{ fontSize: '14px', fontWeight: 500 }}>
                    {apt.clients?.first_name} {apt.clients?.last_name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#8a9bb0' }}>{apt.clients?.phone}</div>
                </td>
                <td style={{ padding: '14px 24px', fontSize: '14px' }}>
                  {SERVICE_LABELS[apt.service_type] ?? apt.service_type}
                </td>
                <td style={{ padding: '14px 24px', fontSize: '14px' }}>
                  {formatDate(apt.requested_date)}
                </td>
                <td style={{ padding: '14px 24px', fontSize: '14px' }}>
                  {apt.confirmed_time ?? apt.requested_time}
                </td>
                <td style={{ padding: '14px 24px', fontSize: '13px', color: '#8a9bb0' }}>
                  {apt.location_address ?? '—'}
                </td>
                <td style={{ padding: '14px 24px' }}>
                  <span style={{
                    background: STATUS_COLORS[apt.status] ?? '#eee',
                    color: STATUS_TEXT[apt.status] ?? '#333',
                    padding: '3px 10px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 500,
                    textTransform: 'capitalize',
                  }}>
                    {apt.status}
                  </span>
                </td>
              </tr>
            ))}
            {(appointments ?? []).length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#8a9bb0', fontSize: '14px' }}>
                  No appointments yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}