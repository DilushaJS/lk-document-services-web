'use client'

import { useState } from 'react'
import FormField from '@/components/forms/FormField'
import FileUpload from '@/components/forms/FileUpload'
import SubmitButton from '@/components/forms/SubmitButton'
import SuccessMessage from '@/components/forms/SuccessMessage'

const PACKAGES = [
  { value: 'basic',    label: 'Basic Formation',           price: '$100 + state fee', description: 'Entity registration filing support' },
  { value: 'standard', label: 'Standard Formation + EIN',  price: '$150 + state fee', description: 'Registration + EIN assistance' },
  { value: 'premium',  label: 'Premium Compliance',        price: '$750 + state fee', description: 'Full formation, EIN, documents, compliance' },
]

export default function BusinessFormationPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedPackage, setSelectedPackage] = useState('basic')
  const [entityType, setEntityType] = useState('LLC')
  const [clientType, setClientType] = useState('individual')
  const [idFile, setIdFile] = useState<File | null>(null)
  const [supportingFile, setSupportingFile] = useState<File | null>(null)
  const [owners, setOwners] = useState([{ full_name: '', address: '', title: '', ownership_percentage: 100 }])

  function addOwner() {
    setOwners([...owners, { full_name: '', address: '', title: '', ownership_percentage: 0 }])
  }

  function removeOwner(index: number) {
    setOwners(owners.filter((_, i) => i !== index))
  }

  function updateOwner(index: number, field: string, value: string | number) {
    setOwners(owners.map((o, i) => i === index ? { ...o, [field]: value } : o))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const form = e.currentTarget
    const data = new FormData(form)

    const payload = {
      client_type: clientType,
      first_name: data.get('first_name') as string,
      last_name: data.get('last_name') as string,
      email: data.get('email') as string,
      phone: data.get('phone') as string,
      entity_type: entityType,
      package: selectedPackage,
      business_name_1: data.get('business_name_1') as string,
      business_name_2: data.get('business_name_2') as string || undefined,
      business_name_3: data.get('business_name_3') as string || undefined,
      business_purpose: data.get('business_purpose') as string,
      principal_address: data.get('principal_address') as string,
      mailing_address: data.get('mailing_address') as string || undefined,
      registered_agent: data.get('registered_agent') as string,
      owners,
      manager_managed: entityType === 'LLC' ? data.get('manager_managed') as string : undefined,
      number_of_directors: entityType === 'Corporation' ? Number(data.get('number_of_directors')) : undefined,
      effective_date: data.get('effective_date') as string || undefined,
      need_ein: data.get('need_ein') === 'on',
      need_operating_agreement: data.get('need_operating_agreement') === 'on',
      need_initial_resolutions: data.get('need_initial_resolutions') === 'on',
      need_amendment: data.get('need_amendment') === 'on',
    }

    try {
      // 1. Submit form
      const res = await fetch('/api/submit/business-formation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const result = await res.json()
      if (!res.ok) throw new Error(result.error ?? 'Submission failed')

      // 2. Upload ID file if provided
      if (idFile && result.submission_id) {
        const uploadData = new FormData()
        uploadData.append('file', idFile)
        uploadData.append('submission_id', result.submission_id)
        uploadData.append('client_id', result.client_id)
        uploadData.append('document_type', 'identification')
        await fetch('/api/upload', { method: 'POST', body: uploadData })
      }

      // 3. Upload supporting file if provided
      if (supportingFile && result.submission_id) {
        const uploadData = new FormData()
        uploadData.append('file', supportingFile)
        uploadData.append('submission_id', result.submission_id)
        uploadData.append('client_id', result.client_id)
        uploadData.append('document_type', 'supporting_file')
        await fetch('/api/upload', { method: 'POST', body: uploadData })
      }

      // 4. Create Stripe checkout session
      const checkoutRes = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submission_id: result.submission_id,
          client_id: result.client_id,
          package: selectedPackage,
          client_email: payload.email,
          client_name: `${payload.first_name} ${payload.last_name}`,
        }),
      })

      const checkout = await checkoutRes.json()
      if (!checkoutRes.ok) throw new Error(checkout.error ?? 'Payment setup failed')

      // 5. Redirect to Stripe
      window.location.href = checkout.checkout_url

    } catch (err: any) {
      setError(err.message ?? 'Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '48px 24px', background: 'white', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>

      {/* Header */}
      <div style={{ marginBottom: '40px' }}>
        <div style={{
          display: 'inline-block',
          background: '#fdebd0',
          color: '#a0620a',
          fontSize: '11px',
          fontWeight: 600,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          padding: '4px 10px',
          borderRadius: '4px',
          marginBottom: '12px',
        }}>
          Business Formation
        </div>
        <h1 style={{ fontFamily: 'serif', fontSize: '32px', color: '#0d1b2a', marginBottom: '8px' }}>
          Start Your Business in California
        </h1>
        <p style={{ color: '#8a9bb0', fontSize: '15px', lineHeight: '1.6' }}>
          Complete the form below. We will prepare and file your business registration documents.
        </p>
        <div style={{
          background: '#fdebd0',
          border: '1px solid #f0d0a0',
          borderRadius: '6px',
          padding: '12px 16px',
          marginTop: '16px',
          fontSize: '12px',
          color: '#a0620a',
        }}>
          <strong>Disclaimer:</strong> LK Document Services is not a law firm and does not provide legal advice. Document preparation services are performed at the client's direction.
        </div>
      </div>

      <form onSubmit={handleSubmit}>

        {/* Package selection */}
        <div style={{ marginBottom: '32px' }}>
          <p style={{ fontSize: '13px', fontWeight: 500, marginBottom: '12px' }}>
            Select Package <span style={{ color: '#c0392b' }}>*</span>
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            {PACKAGES.map((pkg) => (
              <div
                key={pkg.value}
                onClick={() => setSelectedPackage(pkg.value)}
                style={{
                  border: `2px solid ${selectedPackage === pkg.value ? '#0d1b2a' : '#ede6d8'}`,
                  borderRadius: '8px',
                  padding: '16px',
                  cursor: 'pointer',
                  background: selectedPackage === pkg.value ? '#f5f0e8' : 'white',
                }}
              >
                <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>{pkg.label}</div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#0d1b2a', marginBottom: '4px' }}>{pkg.price}</div>
                <div style={{ fontSize: '11px', color: '#8a9bb0' }}>{pkg.description}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Client type */}
        <div style={{ marginBottom: '24px' }}>
          <p style={{ fontSize: '13px', fontWeight: 500, marginBottom: '10px' }}>Client Type</p>
          <div style={{ display: 'flex', gap: '16px' }}>
            {['individual', 'business'].map((type) => (
              <label key={type} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px' }}>
                <input
                  type="radio"
                  name="client_type"
                  value={type}
                  checked={clientType === type}
                  onChange={() => setClientType(type)}
                />
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </label>
            ))}
          </div>
        </div>

        {/* Personal info */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <FormField label="First Name" name="first_name" required placeholder="John" />
          <FormField label="Last Name" name="last_name" required placeholder="Smith" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <FormField label="Email Address" name="email" type="email" required placeholder="john@example.com" />
          <FormField label="Phone Number" name="phone" type="tel" required placeholder="(951) 555-0000" />
        </div>

        {/* Entity type */}
        <FormField label="Entity Type" name="entity_type" required>
          <select
            name="entity_type"
            value={entityType}
            onChange={(e) => setEntityType(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '10px 14px',
              border: '1px solid #ede6d8',
              borderRadius: '6px',
              fontSize: '14px',
              background: 'white',
              color: '#0d1b2a',
            }}
          >
            <option value="LLC">LLC</option>
            <option value="Corporation">Corporation</option>
            <option value="LLP">LLP</option>
            <option value="GP">General Partnership</option>
            <option value="Amendment">Amendment</option>
          </select>
        </FormField>

        {/* Business names */}
        <FormField label="Proposed Business Name (1st choice)" name="business_name_1" required placeholder="Acme LLC" />
        <FormField label="Proposed Business Name (2nd choice)" name="business_name_2" placeholder="Acme Services LLC" />
        <FormField label="Proposed Business Name (3rd choice)" name="business_name_3" placeholder="Acme Group LLC" />

        {/* Business purpose */}
        <FormField label="Business Purpose / Description" name="business_purpose" required>
          <textarea
            name="business_purpose"
            required
            placeholder="Describe the general business activity..."
            rows={3}
            style={{
              width: '100%',
              padding: '10px 14px',
              border: '1px solid #ede6d8',
              borderRadius: '6px',
              fontSize: '14px',
              background: 'white',
              color: '#0d1b2a',
              resize: 'vertical',
              boxSizing: 'border-box',
            }}
          />
        </FormField>

        {/* Address */}
        <FormField label="Principal Business Address" name="principal_address" required placeholder="123 Main St, Riverside, CA 92501" />
        <FormField label="Mailing Address (if different)" name="mailing_address" placeholder="Leave blank if same as above" />

        {/* Registered agent */}
        <FormField label="Registered Agent" name="registered_agent" required>
          <select
            name="registered_agent"
            required
            style={{
              width: '100%',
              padding: '10px 14px',
              border: '1px solid #ede6d8',
              borderRadius: '6px',
              fontSize: '14px',
              background: 'white',
              color: '#0d1b2a',
            }}
          >
            <option value="client">I will be my own registered agent</option>
            <option value="third_party">Third party registered agent</option>
          </select>
        </FormField>

        {/* LLC specific */}
        {entityType === 'LLC' && (
          <FormField label="Management Structure" name="manager_managed" required>
            <select
              name="manager_managed"
              required
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '1px solid #ede6d8',
                borderRadius: '6px',
                fontSize: '14px',
                background: 'white',
                color: '#0d1b2a',
              }}
            >
              <option value="member">Member-managed</option>
              <option value="manager">Manager-managed</option>
            </select>
          </FormField>
        )}

        {/* Corporation specific */}
        {entityType === 'Corporation' && (
          <FormField label="Number of Directors" name="number_of_directors" type="number" required placeholder="1" />
        )}

        {/* Owners */}
        <div style={{ marginBottom: '24px' }}>
          <p style={{ fontSize: '13px', fontWeight: 500, marginBottom: '12px' }}>
            Owner / Member / Shareholder Details <span style={{ color: '#c0392b' }}>*</span>
          </p>
          {owners.map((owner, i) => (
            <div key={i} style={{
              border: '1px solid #ede6d8',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '12px',
              background: '#faf8f4',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '13px', fontWeight: 500 }}>Owner {i + 1}</span>
                {owners.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeOwner(i)}
                    style={{ background: 'none', border: 'none', color: '#c0392b', cursor: 'pointer', fontSize: '13px' }}
                  >
                    Remove
                  </button>
                )}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#8a9bb0', display: 'block', marginBottom: '4px' }}>Full Legal Name</label>
                  <input
                    value={owner.full_name}
                    onChange={(e) => updateOwner(i, 'full_name', e.target.value)}
                    required
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #ede6d8', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#8a9bb0', display: 'block', marginBottom: '4px' }}>Title</label>
                  <input
                    value={owner.title}
                    onChange={(e) => updateOwner(i, 'title', e.target.value)}
                    required
                    placeholder="Member / Manager / Director"
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #ede6d8', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#8a9bb0', display: 'block', marginBottom: '4px' }}>Address</label>
                  <input
                    value={owner.address}
                    onChange={(e) => updateOwner(i, 'address', e.target.value)}
                    required
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #ede6d8', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#8a9bb0', display: 'block', marginBottom: '4px' }}>Ownership %</label>
                  <input
                    type="number"
                    value={owner.ownership_percentage}
                    onChange={(e) => updateOwner(i, 'ownership_percentage', Number(e.target.value))}
                    required
                    min={0}
                    max={100}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #ede6d8', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addOwner}
            style={{
              background: 'none',
              border: '1.5px dashed #ede6d8',
              borderRadius: '6px',
              padding: '10px 20px',
              fontSize: '13px',
              color: '#8a9bb0',
              cursor: 'pointer',
              width: '100%',
            }}
          >
            + Add another owner
          </button>
        </div>

        {/* Optional date */}
        <FormField label="Requested Effective Date (optional)" name="effective_date" type="date" />

        {/* Checkboxes */}
        <div style={{ marginBottom: '24px' }}>
          <p style={{ fontSize: '13px', fontWeight: 500, marginBottom: '12px' }}>Additional Services Needed</p>
          {[
            { name: 'need_ein', label: 'EIN assistance (included in Standard & Premium)' },
            { name: 'need_operating_agreement', label: 'Operating agreement / bylaws' },
            { name: 'need_initial_resolutions', label: 'Initial resolutions / minutes' },
            { name: 'need_amendment', label: 'Amendment support' },
          ].map((cb) => (
            <label key={cb.name} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', fontSize: '14px', cursor: 'pointer' }}>
              <input type="checkbox" name={cb.name} />
              {cb.label}
            </label>
          ))}
        </div>

        {/* File uploads */}
        <FileUpload
          name="id_file"
          label="Upload ID (recommended)"
          accept=".pdf,.jpg,.jpeg,.png"
          onFileSelect={setIdFile}
        />
        <FileUpload
          name="supporting_file"
          label="Upload Supporting Documents (optional)"
          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
          onFileSelect={setSupportingFile}
        />

        {/* Error */}
        {error && (
          <div style={{
            background: '#fde8e6',
            border: '1px solid #f5c1c1',
            borderRadius: '6px',
            padding: '12px 16px',
            marginBottom: '20px',
            fontSize: '14px',
            color: '#922b21',
          }}>
            {error}
          </div>
        )}

        {/* Submit */}
        <div style={{ marginTop: '8px' }}>
          <SubmitButton
            loading={loading}
            label="Continue to Payment →"
            loadingLabel="Processing..."
          />
          <p style={{ fontSize: '12px', color: '#8a9bb0', textAlign: 'center', marginTop: '10px' }}>
            You will be redirected to secure payment after submission. State filing fees are not included.
          </p>
        </div>

      </form>
    </div>
  )
}