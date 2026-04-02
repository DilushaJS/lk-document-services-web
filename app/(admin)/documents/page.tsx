import { createAdminClient } from '@/lib/supabase/admin'
import { formatDateTime } from '@/lib/utils'

export const revalidate = 0

export default async function DocumentsPage() {
  const supabase = createAdminClient()
  const { data: documents } = await supabase
    .from('documents')
    .select('*, clients(first_name, last_name, email)')
    .order('created_at', { ascending: false })

  return (
    <div>
      <h1 style={{ fontFamily: 'serif', fontSize: '28px', marginBottom: '8px' }}>Documents</h1>
      <p style={{ color: '#8a9bb0', marginBottom: '32px', fontSize: '14px' }}>
        All uploaded files from clients.
      </p>

      <div style={{ background: 'white', borderRadius: '10px', border: '1px solid #ede6d8' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f9f7f3' }}>
              {['File', 'Client', 'Type', 'Size', 'Uploaded', 'Action'].map((h) => (
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
            {(documents ?? []).map((doc: any, i: number) => (
              <tr key={doc.id} style={{ borderTop: i > 0 ? '1px solid #f0ebe0' : 'none' }}>
                <td style={{ padding: '14px 24px' }}>
                  <div style={{ fontSize: '14px', fontWeight: 500 }}>{doc.file_name}</div>
                  <div style={{ fontSize: '12px', color: '#8a9bb0' }}>{doc.mime_type}</div>
                </td>
                <td style={{ padding: '14px 24px' }}>
                  <div style={{ fontSize: '14px' }}>
                    {doc.clients?.first_name} {doc.clients?.last_name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#8a9bb0' }}>{doc.clients?.email}</div>
                </td>
                <td style={{ padding: '14px 24px', fontSize: '13px', textTransform: 'capitalize' }}>
                  {doc.document_type?.replace(/_/g, ' ')}
                </td>
                <td style={{ padding: '14px 24px', fontSize: '13px', color: '#8a9bb0' }}>
                  {doc.file_size ? `${(doc.file_size / 1024).toFixed(1)} KB` : '—'}
                </td>
                <td style={{ padding: '14px 24px', fontSize: '13px', color: '#8a9bb0' }}>
                  {formatDateTime(doc.created_at)}
                </td>
                <td style={{ padding: '14px 24px' }}>
                  <a
                    href={`/admin/submissions/${doc.submission_id}`}
                    style={{ fontSize: '13px', color: '#0d1b2a', fontWeight: 500 }}
                  >
                    {'View →'}
                  </a>
                </td>
              </tr>
            ))}
            {(documents ?? []).length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#8a9bb0', fontSize: '14px' }}>
                  No documents uploaded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}