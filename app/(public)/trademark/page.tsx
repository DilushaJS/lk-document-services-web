'use client'

import { useState } from 'react'
import FormField from '@/components/forms/FormField'
import FileUpload from '@/components/forms/FileUpload'
import SubmitButton from '@/components/forms/SubmitButton'
import SuccessMessage from '@/components/forms/SuccessMessage'

export default function TrademarkPage() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [markType, setMarkType] = useState('word_mark')
  const [useStatus, setUseStatus] = useState('in_use')
  const [files, setFiles] = useState<{ logo: File | null; specimens: File | null }>({ logo: null, specimens: null })

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const form = e.currentTarget
    const data = new FormData(form)

    const payload = {
      first_name: data.get('first_name') as string,
      last_name: data.get('last_name') as string,
      email: data.get('email') as string,
      phone: data.get('phone') as string,
      service_type: 'trademark',
      form_data: {
        business_name: data.get('business_name') || undefined,
        mark_type: markType,
        mark_wording: markType === 'word_mark' || markType === 'slogan' ? data.get('mark_wording') : undefined,
        logo_description: markType === 'logo' || markType === 'design' ? data.get('logo_description') : undefined,
        goods_services: data.get('goods_services'),
        use_status: useStatus,
        first_use_date: useStatus === 'in_use' ? data.get('first_use_date') : undefined,
        geographic_market: data.get('geographic_market') || undefined,
      },
    }

    try {
      const res = await fetch('/api/submit/quote-intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error ?? 'Submission failed')

      for (const [key, file] of Object.entries(files)) {
        if (file && result.submission_id) {
          const uploadData = new FormData()
          uploadData.append('file', file)
          uploadData.append('submission_id', result.submission_id)
          uploadData.append('client_id', result.client_id)
          uploadData.append('document_type', 'supporting_file')
          await fetch('/api/upload', { method: 'POST', body: uploadData })
        }
      }

      setSuccess(true)
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  if (success) return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '48px 24px' }}>
      <SuccessMessage title="Trademark Intake Submitted" message="We will review your trademark details and send you a custom quote and engagement terms within 1–2 business days. No payment is required until you approve the scope." />
    </div>
  )

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '48px 24px' }}>
      <div style={{ marginBottom: '40px' }}>
        <div style={{ display: 'inline-block', background: '#fdebd0', color: '#a0620a', fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '4px 10px', borderRadius: '4px', marginBottom: '12px' }}>
          Trademark Services
        </div>
        <h1 style={{ fontFamily: 'serif', fontSize: '32px', color: '#0d1b2a', marginBottom: '8px' }}>Trademark Registration Support</h1>
        <p style={{ color: '#8a9bb0', fontSize: '15px', lineHeight: '1.6' }}>We assist with trademark registration support and document preparation. Submit your intake and we will review and send a quote.</p>
        <div style={{ background: '#fdebd0', border: '1px solid #f0d0a0', borderRadius: '6px', padding: '12px 16px', marginTop: '16px', fontSize: '12px', color: '#a0620a' }}>
          <strong>Disclaimer:</strong> LK Document Services provides trademark registration support and document preparation only. We do not provide legal advice. For complex trademark matters, consult a licensed attorney.
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <FormField label="First Name" name="first_name" required placeholder="John" />
          <FormField label="Last Name" name="last_name" required placeholder="Smith" />
        </div>
        <FormField label="Business Name (if applicable)" name="business_name" placeholder="Acme LLC" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <FormField label="Email Address" name="email" type="email" required placeholder="john@example.com" />
          <FormField label="Phone Number" name="phone" type="tel" required placeholder="(951) 555-0000" />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <p style={{ fontSize: '13px', fontWeight: 500, marginBottom: '10px' }}>Mark Type <span style={{ color: '#c0392b' }}>*</span></p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {[{ value: 'word_mark', label: 'Word Mark' }, { value: 'logo', label: 'Logo' }, { value: 'design', label: 'Design' }, { value: 'slogan', label: 'Slogan' }].map((opt) => (
              <label key={opt.value} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', padding: '10px', border: `1px solid ${markType === opt.value ? '#0d1b2a' : '#ede6d8'}`, borderRadius: '6px', background: markType === opt.value ? '#f5f0e8' : 'white' }}>
                <input type="radio" name="mark_type" value={opt.value} checked={markType === opt.value} onChange={() => setMarkType(opt.value)} />
                {opt.label}
              </label>
            ))}
          </div>
        </div>

        {(markType === 'word_mark' || markType === 'slogan') && (
          <FormField label="Exact Mark Wording" name="mark_wording" required placeholder="e.g. ACME SERVICES" />
        )}
        {(markType === 'logo' || markType === 'design') && (
          <FormField label="Describe Your Logo / Design" name="logo_description">
            <textarea name="logo_description" placeholder="Describe the logo or design mark..." rows={3} style={{ width: '100%', padding: '10px 14px', border: '1px solid #ede6d8', borderRadius: '6px', fontSize: '14px', background: 'white', color: '#0d1b2a', resize: 'vertical', boxSizing: 'border-box' }} />
          </FormField>
        )}

        <FormField label="Goods / Services Summary" name="goods_services" required>
          <textarea name="goods_services" required placeholder="Describe what you sell or offer..." rows={3} style={{ width: '100%', padding: '10px 14px', border: '1px solid #ede6d8', borderRadius: '6px', fontSize: '14px', background: 'white', color: '#0d1b2a', resize: 'vertical', boxSizing: 'border-box' }} />
        </FormField>

        <div style={{ marginBottom: '24px' }}>
          <p style={{ fontSize: '13px', fontWeight: 500, marginBottom: '10px' }}>Current Use Status <span style={{ color: '#c0392b' }}>*</span></p>
          <div style={{ display: 'flex', gap: '16px' }}>
            {[{ value: 'in_use', label: 'Already in use' }, { value: 'planned_use', label: 'Planned use' }].map((opt) => (
              <label key={opt.value} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px' }}>
                <input type="radio" name="use_status" value={opt.value} checked={useStatus === opt.value} onChange={() => setUseStatus(opt.value)} />
                {opt.label}
              </label>
            ))}
          </div>
        </div>

        {useStatus === 'in_use' && (
          <FormField label="First Use Date" name="first_use_date" type="date" />
        )}

        <FormField label="Geographic Market (optional)" name="geographic_market" placeholder="e.g. U.S., California, online" />

        <FileUpload name="logo_file" label="Upload Logo File (optional)" accept=".pdf,.jpg,.jpeg,.png" onFileSelect={(f) => setFiles(prev => ({ ...prev, logo: f }))} />
        <FileUpload name="specimens_file" label="Upload Specimens / Screenshots (optional)" accept=".pdf,.jpg,.jpeg,.png" onFileSelect={(f) => setFiles(prev => ({ ...prev, specimens: f }))} />

        {error && <div style={{ background: '#fde8e6', border: '1px solid #f5c1c1', borderRadius: '6px', padding: '12px 16px', marginBottom: '20px', fontSize: '14px', color: '#922b21' }}>{error}</div>}

        <SubmitButton loading={loading} label="Submit Trademark Intake" loadingLabel="Submitting..." />
        <p style={{ fontSize: '12px', color: '#8a9bb0', textAlign: 'center', marginTop: '10px' }}>No payment required now. We will review and send a custom quote within 1–2 business days.</p>
      </form>
    </div>
  )
}