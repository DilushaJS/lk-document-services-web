'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DeleteButton({ submissionId }: { submissionId: string }) {
  const [loading, setLoading] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    if (!confirm) {
      setConfirm(true)
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/admin/delete-submission', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submission_id: submissionId }),
      })

      if (res.ok) {
        router.push('/admin/submissions')
        router.refresh()
      } else {
        const data = await res.json()
        alert(data.error ?? 'Could not delete submission.')
        setLoading(false)
        setConfirm(false)
      }
    } catch (err) {
      alert('Something went wrong.')
      setLoading(false)
      setConfirm(false)
    }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      {confirm && (
        <span style={{ fontSize: '13px', color: '#922b21' }}>
          Are you sure? This cannot be undone.
        </span>
      )}
      <button
        onClick={handleDelete}
        disabled={loading}
        style={{
          background: confirm ? '#c0392b' : 'white',
          color: confirm ? 'white' : '#c0392b',
          border: '1.5px solid #c0392b',
          borderRadius: '6px',
          padding: '8px 16px',
          fontSize: '13px',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.6 : 1,
          fontWeight: 500,
        }}
      >
        {loading ? 'Deleting...' : confirm ? 'Confirm Delete' : 'Delete Submission'}
      </button>
      {confirm && (
        <button
          onClick={() => setConfirm(false)}
          style={{
            background: 'none',
            border: 'none',
            color: '#8a9bb0',
            cursor: 'pointer',
            fontSize: '13px',
          }}
        >
          Cancel
        </button>
      )}
    </div>
  )
}