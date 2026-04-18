export default function FormField({
  label,
  name,
  type = 'text',
  required = false,
  placeholder,
  error,
  children,
}: {
  label: string
  name: string
  type?: string
  required?: boolean
  placeholder?: string
  error?: string
  children?: React.ReactNode
}) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <label
        htmlFor={name}
        style={{
          display: 'block',
          fontSize: '13px',
          fontWeight: 500,
          color: '#0d1b2a',
          marginBottom: '6px',
        }}
      >
        {label}
        {required && <span style={{ color: '#c0392b', marginLeft: '3px' }}>*</span>}
      </label>

      {children ?? (
        <input
          id={name}
          name={name}
          type={type}
          placeholder={placeholder}
          required={required}
          style={{
            width: '100%',
            padding: '10px 14px',
            border: `1px solid ${error ? '#c0392b' : '#ede6d8'}`,
            borderRadius: '6px',
            fontSize: '14px',
            outline: 'none',
            boxSizing: 'border-box',
            background: 'white',
            color: '#0d1b2a',
          }}
        />
      )}

      {error && (
        <p style={{ fontSize: '12px', color: '#c0392b', marginTop: '4px' }}>
          {error}
        </p>
      )}
    </div>
  )
}