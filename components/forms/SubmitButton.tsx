'use client'

export default function SubmitButton({
  loading,
  label = 'Submit',
  loadingLabel = 'Submitting...',
}: {
  loading: boolean
  label?: string
  loadingLabel?: string
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      style={{
        width: '100%',
        padding: '14px',
        background: loading ? '#8a9bb0' : '#0d1b2a',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        fontSize: '15px',
        fontWeight: 500,
        cursor: loading ? 'not-allowed' : 'pointer',
        transition: 'background 0.2s',
      }}
    >
      {loading ? loadingLabel : label}
    </button>
  )
}