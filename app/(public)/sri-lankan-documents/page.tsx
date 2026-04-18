'use client'

import { useState } from 'react'
import FormField from '@/components/forms/FormField'
import FileUpload from '@/components/forms/FileUpload'
import SubmitButton from '@/components/forms/SubmitButton'
import SuccessMessage from '@/components/forms/SuccessMessage'

export default function SriLankanDocumentsPage() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [docType, setDocType] = useState('power_of_attorney')
  const [files, setFiles] = useState<{ id: File | null; deeds: File | null }>({ id: null, deeds: null })

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
      service_type: 'sri_lankan_documents',
      form_data: {
        document_type: docType,
        document_language: data.get('document_language'),
        country_of_residence: data.get('country_of_residence'),
        recipient_in_sri_lanka: docType === 'power_of_attorney' ? data.get('recipient_in_sri_lanka') : undefined,
        asset_details: data.get('asset_details') || undefined,
        special_instructions: data.get('special_instructions') || undefined,
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
      <SuccessMessage title="Request Submitted Successfully" message="We will review your request and send you a fee quote and service scope within 1–2 business days. You can also reach us via WhatsApp at 951-437-9289 for faster communication." />
    </div>
  )

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '48px 24px' }}>
      <div style={{ marginBottom: '40px' }}>
        <div style={{ display: 'inline-block', background: '#d4e6f5', color: '#1a5276', fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '4px 10px', borderRadius: '4px', marginBottom: '12px' }}>
          Sri Lankan Documents
        </div>
        <h1 style={{ fontFamily: 'serif', fontSize: '32px', color: '#0d1b2a', marginBottom: '8px' }}>Sri Lankan Documents for Overseas Clients</h1>
        <p style={{ color: '#8a9bb0', fontSize: '15px', lineHeight: '1.6' }}>We assist overseas Sri Lankan clients with power of attorney, wills, affidavits, and other document preparation. WhatsApp communication available.</p>
        <div style={{ background: '#fdebd0', border: '1px solid #f0d0a0', borderRadius: '6px', padding: '12px 16px', marginTop: '16px', fontSize: '12px', color: '#a0620a' }}>
          <strong>Disclaimer:</strong> LK Document Services is not a law firm and does not provide legal advice. Document preparation services are performed at the client's direction.
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <FormField label="First Name" name="first_name" required placeholder="Nimal" />
          <FormField label="Last Name" name="last_name" required placeholder="Perera" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <FormField label="Email Address" name="email" type="email" required placeholder="nimal@example.com" />
          <FormField label="Phone / WhatsApp" name="phone" type="tel" required placeholder="+1 (951) 555-0000" />
        </div>

        <FormField label="Document Type" name="document_type" required>
          <select name="document_type" value={docType} onChange={(e) => setDocType(e.target.value)} required style={{ width: '100%', padding: '10px 14px', border: '1px solid #ede6d8', borderRadius: '6px', fontSize: '14px', background: 'white', color: '#0d1b2a' }}>
            <option value="power_of_attorney">Power of Attorney</option>
            <option value="will">Will</option>
            <option value="affidavit">Affidavit</option>
            <option value="authorization_letter">Authorization Letter</option>
            <option value="other">Other</option>
          </select>
        </FormField>

        <FormField label="Document Language" name="document_language" required>
          <select name="document_language" required style={{ width: '100%', padding: '10px 14px', border: '1px solid #ede6d8', borderRadius: '6px', fontSize: '14px', background: 'white', color: '#0d1b2a' }}>
            <option value="english">English</option>
            <option value="sinhala">Sinhala</option>
            <option value="tamil">Tamil</option>
            <option value="bilingual">Bilingual</option>
          </select>
        </FormField>

        <FormField label="Country of Current Residence" name="country_of_residence" required placeholder="e.g. United States" />

        {docType === 'power_of_attorney' && (
          <FormField label="Person Receiving Authority in Sri Lanka" name="recipient_in_sri_lanka" required={docType === 'power_of_attorney'}>
            <textarea name="recipient_in_sri_lanka" required={docType === 'power_of_attorney'} placeholder="Full name, address, ID/passport details if available..." rows={3} style={{ width: '100%', padding: '10px 14px', border: '1px solid #ede6d8', borderRadius: '6px', fontSize: '14px', background: 'white', color: '#0d1b2a', resize: 'vertical', boxSizing: 'border-box' }} />
          </FormField>
        )}

        <FormField label="Property / Asset Details (optional)" name="asset_details">
          <textarea name="asset_details" placeholder="Land, bank accounts, litigation details, etc..." rows={3} style={{ width: '100%', padding: '10px 14px', border: '1px solid #ede6d8', borderRadius: '6px', fontSize: '14px', background: 'white', color: '#0d1b2a', resize: 'vertical', boxSizing: 'border-box' }} />
        </FormField>

        <FormField label="Special Instructions (optional)" name="special_instructions">
          <textarea name="special_instructions" placeholder="Any specific requirements or instructions..." rows={3} style={{ width: '100%', padding: '10px 14px', border: '1px solid #ede6d8', borderRadius: '6px', fontSize: '14px', background: 'white', color: '#0d1b2a', resize: 'vertical', boxSizing: 'border-box' }} />
        </FormField>

        <FileUpload name="id_file" label="Upload Passport / ID (recommended)" accept=".pdf,.jpg,.jpeg,.png" onFileSelect={(f) => setFiles(prev => ({ ...prev, id: f }))} />
        <FileUpload name="deeds_file" label="Upload Old Deeds / Prior Documents (optional)" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" onFileSelect={(f) => setFiles(prev => ({ ...prev, deeds: f }))} />

        {error && <div style={{ background: '#fde8e6', border: '1px solid #f5c1c1', borderRadius: '6px', padding: '12px 16px', marginBottom: '20px', fontSize: '14px', color: '#922b21' }}>{error}</div>}

        <SubmitButton loading={loading} label="Submit Request" loadingLabel="Submitting..." />
        <p style={{ fontSize: '12px', color: '#8a9bb0', textAlign: 'center', marginTop: '10px' }}>No payment required now. We will review and send a quote within 1–2 business days. WhatsApp: 951-437-9289</p>
      </form>
    </div>
  )
}