'use client'

import { useState } from 'react'
import FormField from '@/components/forms/FormField'
import FileUpload from '@/components/forms/FileUpload'
import SubmitButton from '@/components/forms/SubmitButton'
import SuccessMessage from '@/components/forms/SuccessMessage'

export default function ImmigrationPage() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [files, setFiles] = useState<{ id: File | null; notices: File | null; civil: File | null }>({ id: null, notices: null, civil: null })

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
      service_type: 'immigration',
      form_data: {
        preferred_language: data.get('preferred_language') || undefined,
        matter_type: data.get('matter_type'),
        country_of_birth: data.get('country_of_birth'),
        current_us_status: data.get('current_us_status') || undefined,
        a_number: data.get('a_number') || undefined,
        urgency: data.get('urgency') || undefined,
        description: data.get('description'),
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
          uploadData.append('document_type', key === 'id' ? 'identification' : 'supporting_file')
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
      <SuccessMessage title="Intake Submitted Successfully" message="We will review your immigration matter and send you a custom quote and service scope within 1–2 business days. Please note: LK Document Services provides form preparation assistance only — we do not provide legal advice or legal representation." />
    </div>
  )

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '48px 24px' }}>
      <div style={{ marginBottom: '40px' }}>
        <div style={{ display: 'inline-block', background: '#fde8e6', color: '#922b21', fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '4px 10px', borderRadius: '4px', marginBottom: '12px' }}>
          Immigration Forms
        </div>
        <h1 style={{ fontFamily: 'serif', fontSize: '32px', color: '#0d1b2a', marginBottom: '8px' }}>Immigration Form Assistance</h1>
        <p style={{ color: '#8a9bb0', fontSize: '15px', lineHeight: '1.6' }}>We help you prepare immigration forms at your direction. Submit your intake and we will review and send a quote within 1–2 business days.</p>
        <div style={{ background: '#fde8e6', border: '1px solid #f5c1c1', borderRadius: '6px', padding: '12px 16px', marginTop: '16px', fontSize: '12px', color: '#922b21' }}>
          <strong>Important:</strong> LK Document Services is not a law firm, attorney, or accredited immigration representative. We provide immigration form preparation services only. We do not provide legal advice, legal opinions, or legal representation. Immigration services are limited to lawful non-attorney form preparation activities permitted under California law.
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <FormField label="First Name (as on ID)" name="first_name" required placeholder="John" />
          <FormField label="Last Name (as on ID)" name="last_name" required placeholder="Smith" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <FormField label="Email Address" name="email" type="email" required placeholder="john@example.com" />
          <FormField label="Phone / WhatsApp" name="phone" type="tel" required placeholder="(951) 555-0000" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <FormField label="Preferred Language (optional)" name="preferred_language">
            <select name="preferred_language" style={{ width: '100%', padding: '10px 14px', border: '1px solid #ede6d8', borderRadius: '6px', fontSize: '14px', background: 'white', color: '#0d1b2a' }}>
              <option value="english">English</option>
              <option value="spanish">Spanish</option>
              <option value="sinhala">Sinhala</option>
              <option value="tamil">Tamil</option>
              <option value="other">Other</option>
            </select>
          </FormField>
          <FormField label="Urgency (optional)" name="urgency">
            <select name="urgency" style={{ width: '100%', padding: '10px 14px', border: '1px solid #ede6d8', borderRadius: '6px', fontSize: '14px', background: 'white', color: '#0d1b2a' }}>
              <option value="standard">Standard</option>
              <option value="urgent">Urgent</option>
            </select>
          </FormField>
        </div>

        <FormField label="Immigration Matter Type" name="matter_type" required>
          <select name="matter_type" required style={{ width: '100%', padding: '10px 14px', border: '1px solid #ede6d8', borderRadius: '6px', fontSize: '14px', background: 'white', color: '#0d1b2a' }}>
            <option value="">Select matter type</option>
            <option value="family_based">Family-based form preparation</option>
            <option value="renewal">Renewal</option>
            <option value="replacement">Replacement</option>
            <option value="naturalization">Naturalization-related paperwork</option>
            <option value="affidavit">Affidavit / Supporting forms</option>
            <option value="other">Other</option>
          </select>
        </FormField>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <FormField label="Country of Birth" name="country_of_birth" required placeholder="e.g. Sri Lanka" />
          <FormField label="Current U.S. Status (optional)" name="current_us_status" placeholder="e.g. Permanent Resident" />
        </div>

        <FormField label="A-Number / USCIS Number (optional)" name="a_number" placeholder="A000-000-000" />

        <FormField label="Description of Request" name="description" required>
          <textarea name="description" required placeholder="Please describe what you need help with..." rows={4} style={{ width: '100%', padding: '10px 14px', border: '1px solid #ede6d8', borderRadius: '6px', fontSize: '14px', background: 'white', color: '#0d1b2a', resize: 'vertical', boxSizing: 'border-box' }} />
        </FormField>

        <FileUpload name="id_file" label="Upload Passport / ID (recommended)" accept=".pdf,.jpg,.jpeg,.png" onFileSelect={(f) => setFiles(prev => ({ ...prev, id: f }))} />
        <FileUpload name="notices_file" label="Upload Immigration Notices (recommended)" accept=".pdf,.jpg,.jpeg,.png" onFileSelect={(f) => setFiles(prev => ({ ...prev, notices: f }))} />
        <FileUpload name="civil_file" label="Upload Supporting Civil Documents (optional)" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" onFileSelect={(f) => setFiles(prev => ({ ...prev, civil: f }))} />

        {error && <div style={{ background: '#fde8e6', border: '1px solid #f5c1c1', borderRadius: '6px', padding: '12px 16px', marginBottom: '20px', fontSize: '14px', color: '#922b21' }}>{error}</div>}

        <SubmitButton loading={loading} label="Submit Intake Form" loadingLabel="Submitting..." />
        <p style={{ fontSize: '12px', color: '#8a9bb0', textAlign: 'center', marginTop: '10px' }}>No payment required now. We will review and send a custom quote within 1–2 business days.</p>
      </form>
    </div>
  )
}