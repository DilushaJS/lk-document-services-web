'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DeleteRowButton({ submissionId }: { submissionId: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    if (!window.confirm('Delete this submission and all its files? This cannot be undone.')) return

    setLoading(true)
    try {
      const res = await fetch('/api/admin/delete-submission', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submission_id: submissionId }),
      })

      if (res.ok) {
        router.refresh()
      } else {
        alert('Could not delete submission.')
      }
    } catch {
      alert('Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      style={{
        background: 'none',
        border: 'none',
        color: '#c0392b',
        cursor: loading ? 'not-allowed' : 'pointer',
        fontSize: '13px',
        fontWeight: 500,
      }}
    >
      {loading ? 'Deleting...' : 'Delete'}
    </button>
  )
}