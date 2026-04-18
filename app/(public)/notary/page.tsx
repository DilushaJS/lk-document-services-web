'use client'

import { useState } from 'react'
import FormField from '@/components/forms/FormField'
import FileUpload from '@/components/forms/FileUpload'
import SubmitButton from '@/components/forms/SubmitButton'
import SuccessMessage from '@/components/forms/SuccessMessage'

export default function NotaryPage() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [serviceType, setServiceType] = useState('notary_mobile')
  const [docFile, setDocFile] = useState<File | null>(null)

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
      service_type: serviceType,
      preferred_date: data.get('preferred_date') as string,
      preferred_time_range: data.get('preferred_time_range') as string,
      signing_address: data.get('signing_address') as string || undefined,
      number_of_signers: Number(data.get('number_of_signers')),
      document_type: data.get('document_type') as string,
      need_witnesses: data.get('need_witnesses') as string || undefined,
      id_available: data.get('id_available') as string,
    }

    try {
      const res = await fetch('/api/submit/notary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error ?? 'Submission failed')

      if (docFile && result.submission_id) {
        const uploadData = new FormData()
        uploadData.append('file', docFile)
        uploadData.append('submission_id', result.submission_id)
        uploadData.append('client_id', result.client_id)
        uploadData.append('document_type', 'supporting_file')
        await fetch('/api/upload', { method: 'POST', body: uploadData })
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
      <SuccessMessage
        title="Appointment Request Received"
        message="We will confirm availability, location, travel fee (if applicable), and appointment details within 1 business day. Please have your valid ID ready."
      />
    </div>
  )

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '48px 24px' }}>
      <div style={{ marginBottom: '40px' }}>
        <div style={{ display: 'inline-block', background: '#d4e6f5', color: '#1a5276', fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '4px 10px', borderRadius: '4px', marginBottom: '12px' }}>
          Notary Services
        </div>
        <h1 style={{ fontFamily: 'serif', fontSize: '32px', color: '#0d1b2a', marginBottom: '8px' }}>Book a Notary Appointment</h1>
        <p style={{ color: '#8a9bb0', fontSize: '15px', lineHeight: '1.6' }}>Mobile notary available throughout Southern California. Fill out the form and we will confirm your appointment within 1 business day.</p>
        <div style={{ background: '#fdebd0', border: '1px solid #f0d0a0', borderRadius: '6px', padding: '12px 16px', marginTop: '16px', fontSize: '12px', color: '#a0620a' }}>
          <strong>Disclaimer:</strong> LK Document Services is not a law firm and does not provide legal advice. Notary fees are subject to California law. Travel fees are disclosed separately.
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Service type */}
        <div style={{ marginBottom: '24px' }}>
          <p style={{ fontSize: '13px', fontWeight: 500, marginBottom: '10px' }}>Service Type</p>
          <div style={{ display: 'flex', gap: '16px' }}>
            {[{ value: 'notary_mobile', label: 'Mobile Notary (we come to you)' }, { value: 'notary_home', label: 'Office Visit' }].map((opt) => (
              <label key={opt.value} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px' }}>
                <input type="radio" name="service_type" value={opt.value} checked={serviceType === opt.value} onChange={() => setServiceType(opt.value)} />
                {opt.label}
              </label>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <FormField label="First Name" name="first_name" required placeholder="John" />
          <FormField label="Last Name" name="last_name" required placeholder="Smith" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <FormField label="Email Address" name="email" type="email" required placeholder="john@example.com" />
          <FormField label="Phone Number" name="phone" type="tel" required placeholder="(951) 555-0000" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <FormField label="Preferred Date" name="preferred_date" type="date" required />
          <FormField label="Preferred Time Range" name="preferred_time_range" required>
            <select name="preferred_time_range" required style={{ width: '100%', padding: '10px 14px', border: '1px solid #ede6d8', borderRadius: '6px', fontSize: '14px', background: 'white', color: '#0d1b2a' }}>
              <option value="morning">Morning (9am – 12pm)</option>
              <option value="afternoon">Afternoon (12pm – 5pm)</option>
              <option value="evening">Evening (5pm – 8pm)</option>
            </select>
          </FormField>
        </div>

        {serviceType === 'notary_mobile' && (
          <FormField label="Signing Address" name="signing_address" required={serviceType === 'notary_mobile'} placeholder="123 Main St, Riverside, CA 92501" />
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <FormField label="Number of Signers" name="number_of_signers" type="number" required placeholder="1" />
          <FormField label="Document Type" name="document_type" required placeholder="e.g. Power of Attorney, Deed, Affidavit" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <FormField label="Need Witnesses?" name="need_witnesses">
            <select name="need_witnesses" style={{ width: '100%', padding: '10px 14px', border: '1px solid #ede6d8', borderRadius: '6px', fontSize: '14px', background: 'white', color: '#0d1b2a' }}>
              <option value="unsure">Not sure</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </FormField>
          <FormField label="ID Available?" name="id_available" required>
            <select name="id_available" required style={{ width: '100%', padding: '10px 14px', border: '1px solid #ede6d8', borderRadius: '6px', fontSize: '14px', background: 'white', color: '#0d1b2a' }}>
              <option value="">Select ID type</option>
              <option value="ca_id">California ID</option>
              <option value="passport">Passport</option>
              <option value="drivers_license">Driver's License</option>
              <option value="other">Other acceptable ID</option>
            </select>
          </FormField>
        </div>

        <FileUpload name="doc_file" label="Upload Document for Review (optional)" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" onFileSelect={setDocFile} />

        {error && <div style={{ background: '#fde8e6', border: '1px solid #f5c1c1', borderRadius: '6px', padding: '12px 16px', marginBottom: '20px', fontSize: '14px', color: '#922b21' }}>{error}</div>}

        <SubmitButton loading={loading} label="Request Appointment" loadingLabel="Submitting..." />
        <p style={{ fontSize: '12px', color: '#8a9bb0', textAlign: 'center', marginTop: '10px' }}>No payment required now. We will confirm availability and fees before your appointment.</p>
      </form>
    </div>
  )
}