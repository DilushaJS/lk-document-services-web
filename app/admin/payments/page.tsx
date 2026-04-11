import { createAdminClient } from '@/lib/supabase/admin'
import { formatDateTime, formatCurrency } from '@/lib/utils'

export const revalidate = 0

const STATUS_COLORS: Record<string, string> = {
  pending:  '#fdebd0',
  paid:     '#d5f5e3',
  failed:   '#fde8e6',
  refunded: '#d4e6f5',
}

const STATUS_TEXT: Record<string, string> = {
  pending:  '#a0620a',
  paid:     '#1e8449',
  failed:   '#922b21',
  refunded: '#1a5276',
}

export default async function PaymentsPage() {
  const supabase = createAdminClient()
  const { data: payments } = await supabase
    .from('payments')
    .select('*, clients(first_name, last_name, email)')
    .order('created_at', { ascending: false })

  const total = (payments ?? [])
    .filter((p: any) => p.status === 'paid')
    .reduce((sum: number, p: any) => sum + Number(p.amount), 0)

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontFamily: 'serif', fontSize: '28px', marginBottom: '8px' }}>Payments</h1>
          <p style={{ color: '#8a9bb0', fontSize: '14px' }}>All Stripe transactions.</p>
        </div>
        <div style={{ background: 'white', border: '1px solid #ede6d8', borderRadius: '10px', padding: '16px 24px', textAlign: 'right' }}>
          <div style={{ fontSize: '11px', color: '#8a9bb0', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Total Collected</div>
          <div style={{ fontFamily: 'serif', fontSize: '28px', color: '#1e8449', marginTop: '4px' }}>{formatCurrency(total)}</div>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '10px', border: '1px solid #ede6d8' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f9f7f3' }}>
              {['Client', 'Amount', 'Provider', 'Status', 'Date', 'Submission'].map((h) => (
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
            {(payments ?? []).map((pay: any, i: number) => (
              <tr key={pay.id} style={{ borderTop: i > 0 ? '1px solid #f0ebe0' : 'none' }}>
                <td style={{ padding: '14px 24px' }}>
                  <div style={{ fontSize: '14px', fontWeight: 500 }}>
                    {pay.clients?.first_name} {pay.clients?.last_name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#8a9bb0' }}>{pay.clients?.email}</div>
                </td>
                <td style={{ padding: '14px 24px', fontSize: '14px', fontWeight: 500 }}>
                  {formatCurrency(pay.amount)}
                </td>
                <td style={{ padding: '14px 24px', fontSize: '14px', textTransform: 'capitalize' }}>
                  {pay.provider}
                </td>
                <td style={{ padding: '14px 24px' }}>
                  <span style={{
                    background: STATUS_COLORS[pay.status] ?? '#eee',
                    color: STATUS_TEXT[pay.status] ?? '#333',
                    padding: '3px 10px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 500,
                    textTransform: 'capitalize',
                  }}>
                    {pay.status}
                  </span>
                </td>
                <td style={{ padding: '14px 24px', fontSize: '13px', color: '#8a9bb0' }}>
                  {formatDateTime(pay.created_at)}
                </td>
                <td style={{ padding: '14px 24px' }}>
                  <a
                    href={`/admin/submissions/${pay.submission_id}`}
                    style={{ fontSize: '13px', color: '#0d1b2a', fontWeight: 500 }}
                  >
                    {'View →'}
                  </a>
                </td>
              </tr>
            ))}
            {(payments ?? []).length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#8a9bb0', fontSize: '14px' }}>
                  No payments yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}