'use client'

import { useState } from 'react'

export default function FileUpload({
  name,
  label,
  required = false,
  accept = '.pdf,.jpg,.jpeg,.png,.doc,.docx',
  onFileSelect,
}: {
  name: string
  label: string
  required?: boolean
  accept?: string
  onFileSelect?: (file: File | null) => void
}) {
  const [fileName, setFileName] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const MAX_SIZE = 10 * 1024 * 1024 // 10MB

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null
    setError(null)

    if (file) {
      if (file.size > MAX_SIZE) {
        setError('File too large. Maximum size is 10MB.')
        setFileName(null)
        onFileSelect?.(null)
        return
      }
      setFileName(file.name)
      onFileSelect?.(file)
    } else {
      setFileName(null)
      onFileSelect?.(null)
    }
  }

  return (
    <div style={{ marginBottom: '20px' }}>
      <label
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

      <label
        htmlFor={name}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px 16px',
          border: '1.5px dashed #ede6d8',
          borderRadius: '6px',
          cursor: 'pointer',
          background: '#faf8f4',
        }}
      >
        <span style={{ fontSize: '20px' }}>📎</span>
        <span style={{ fontSize: '13px', color: fileName ? '#0d1b2a' : '#8a9bb0' }}>
          {fileName ?? 'Click to upload or drag and drop'}
        </span>
        <input
          id={name}
          name={name}
          type="file"
          accept={accept}
          onChange={handleChange}
          style={{ display: 'none' }}
        />
      </label>

      <p style={{ fontSize: '11px', color: '#8a9bb0', marginTop: '4px' }}>
        PDF, JPG, PNG, DOC, DOCX — max 10MB
      </p>

      {error && (
        <p style={{ fontSize: '12px', color: '#c0392b', marginTop: '4px' }}>{error}</p>
      )}
    </div>
  )
}