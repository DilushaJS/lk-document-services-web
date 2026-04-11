'use client'

import { useState } from 'react'
import FormField from '@/components/forms/FormField'
import FileUpload from '@/components/forms/FileUpload'
import SubmitButton from '@/components/forms/SubmitButton'
import SuccessMessage from '@/components/forms/SuccessMessage'

export default function RentLeasePage() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [files, setFiles] = useState<{ deed: File | null; lease: File | null; evidence: File | null }>({ deed: null, lease: null, evidence: null })

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
      service_type: 'rent_ejectment',
      form_data: {
        matter_type: data.get('matter_type'),
        property_address: data.get('property_address'),
        landlord_info: data.get('landlord_info'),
        tenant_info: data.get('tenant_info'),
        lease_start_date: data.get('lease_start_date') || undefined,
        lease_end_date: data.get('lease_end_date') || undefined,
        monthly_rent: data.get('monthly_rent') || undefined,
        security_deposit: data.get('security_deposit') || undefined,
        reason: data.get('reason') || undefined,
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
          uploadData.append('document_type', key === 'deed' ? 'legal_document' : 'supporting_file')
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
      <SuccessMessage title="Intake Submitted Successfully" message="We will review your property details and send you a custom quote within 1–2 business days. No payment is required until you approve the quote and service agreement." />
    </div>
  )

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '48px 24px' }}>
      <div style={{ marginBottom: '40px' }}>
        <div style={{ display: 'inline-block', background: '#d4ede6', color: '#256e54', fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '4px 10px', borderRadius: '4px', marginBottom: '12px' }}>
          Rent & Lease Documents
        </div>
        <h1 style={{ fontFamily: 'serif', fontSize: '32px', color: '#0d1b2a', marginBottom: '8px' }}>Rent & Lease Document Preparation</h1>
        <p style={{ color: '#8a9bb0', fontSize: '15px', lineHeight: '1.6' }}>Submit your intake form and we will review your request and send a custom quote within 1–2 business days.</p>
        <div style={{ background: '#fdebd0', border: '1px solid #f0d0a0', borderRadius: '6px', padding: '12px 16px', marginTop: '16px', fontSize: '12px', color: '#a0620a' }}>
          <strong>Disclaimer:</strong> LK Document Services is not a law firm. We prepare documents at the client's direction and do not provide legal advice.
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <FormField label="First Name" name="first_name" required placeholder="John" />
          <FormField label="Last Name" name="last_name" required placeholder="Smith" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <FormField label="Email Address" name="email" type="email" required placeholder="john@example.com" />
          <FormField label="Phone Number" name="phone" type="tel" required placeholder="(951) 555-0000" />
        </div>

        <FormField label="Matter Type" name="matter_type" required>
          <select name="matter_type" required style={{ width: '100%', padding: '10px 14px', border: '1px solid #ede6d8', borderRadius: '6px', fontSize: '14px', background: 'white', color: '#0d1b2a' }}>
            <option value="">Select matter type</option>
            <option value="residential_lease">Residential Lease</option>
            <option value="commercial_lease">Commercial Lease</option>
            <option value="amendment">Lease Amendment</option>
            <option value="assignment">Lease Assignment</option>
            <option value="notice_to_quit">Notice to Quit</option>
            <option value="ejectment">Ejectment-related Papers</option>
          </select>
        </FormField>

        <FormField label="Property Address" name="property_address" required placeholder="123 Main St, Riverside, CA 92501" />

        <FormField label="Landlord Information" name="landlord_info" required>
          <textarea name="landlord_info" required placeholder="Full name and address of landlord..." rows={3} style={{ width: '100%', padding: '10px 14px', border: '1px solid #ede6d8', borderRadius: '6px', fontSize: '14px', background: 'white', color: '#0d1b2a', resize: 'vertical', boxSizing: 'border-box' }} />
        </FormField>

        <FormField label="Tenant Information" name="tenant_info" required>
          <textarea name="tenant_info" required placeholder="Full name and address of tenant(s)..." rows={3} style={{ width: '100%', padding: '10px 14px', border: '1px solid #ede6d8', borderRadius: '6px', fontSize: '14px', background: 'white', color: '#0d1b2a', resize: 'vertical', boxSizing: 'border-box' }} />
        </FormField>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <FormField label="Lease Start Date (optional)" name="lease_start_date" type="date" />
          <FormField label="Lease End Date (optional)" name="lease_end_date" type="date" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <FormField label="Monthly Rent (optional)" name="monthly_rent" type="number" placeholder="2500" />
          <FormField label="Security Deposit (optional)" name="security_deposit" type="number" placeholder="5000" />
        </div>

        <FormField label="Reason / Additional Notes (optional)" name="reason">
          <textarea name="reason" placeholder="Any background or additional context..." rows={3} style={{ width: '100%', padding: '10px 14px', border: '1px solid #ede6d8', borderRadius: '6px', fontSize: '14px', background: 'white', color: '#0d1b2a', resize: 'vertical', boxSizing: 'border-box' }} />
        </FormField>

        <FileUpload name="deed_file" label="Upload Deed / Ownership Proof (recommended)" accept=".pdf,.jpg,.jpeg,.png" onFileSelect={(f) => setFiles(prev => ({ ...prev, deed: f }))} />
        <FileUpload name="lease_file" label="Upload Existing Lease (recommended)" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" onFileSelect={(f) => setFiles(prev => ({ ...prev, lease: f }))} />
        <FileUpload name="evidence_file" label="Upload Additional Evidence (optional)" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" onFileSelect={(f) => setFiles(prev => ({ ...prev, evidence: f }))} />

        {error && <div style={{ background: '#fde8e6', border: '1px solid #f5c1c1', borderRadius: '6px', padding: '12px 16px', marginBottom: '20px', fontSize: '14px', color: '#922b21' }}>{error}</div>}

        <SubmitButton loading={loading} label="Submit Intake Form" loadingLabel="Submitting..." />
        <p style={{ fontSize: '12px', color: '#8a9bb0', textAlign: 'center', marginTop: '10px' }}>No payment required now. We will review and send a custom quote within 1–2 business days.</p>
      </form>
    </div>
  )
}