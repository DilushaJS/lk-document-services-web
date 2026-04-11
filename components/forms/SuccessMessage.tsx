export default function SuccessMessage({
  title,
  message,
}: {
  title: string
  message: string
}) {
  return (
    <div style={{
      background: '#d4ede6',
      border: '1px solid #3a8c6e',
      borderRadius: '10px',
      padding: '32px',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: '32px', marginBottom: '12px' }}>✓</div>
      <h3 style={{ fontFamily: 'serif', fontSize: '20px', color: '#0d1b2a', marginBottom: '8px' }}>
        {title}
      </h3>
      <p style={{ fontSize: '14px', color: '#256e54', lineHeight: '1.6' }}>
        {message}
      </p>
      <p style={{ fontSize: '13px', color: '#256e54', marginTop: '12px' }}>
        Questions? Call or text <strong>951-437-9289</strong>
      </p>
    </div>
  )
}