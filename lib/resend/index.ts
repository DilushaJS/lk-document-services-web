import { Resend } from 'resend'

export const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendAdminNotification({
  subject,
  clientName,
  clientEmail,
  clientPhone,
  serviceType,
  submissionId,
  extraDetails,
}: {
  subject: string
  clientName: string
  clientEmail: string
  clientPhone: string
  serviceType: string
  submissionId: string
  extraDetails?: string
}) {
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: process.env.RESEND_FROM_EMAIL!,
    subject,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:#0d1b2a">New Submission — LK Document Services</h2>
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold">Submission ID</td><td style="padding:8px;border-bottom:1px solid #eee">${submissionId}</td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold">Client</td><td style="padding:8px;border-bottom:1px solid #eee">${clientName}</td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold">Email</td><td style="padding:8px;border-bottom:1px solid #eee">${clientEmail}</td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold">Phone</td><td style="padding:8px;border-bottom:1px solid #eee">${clientPhone}</td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold">Service</td><td style="padding:8px;border-bottom:1px solid #eee">${serviceType}</td></tr>
          ${extraDetails ? `<tr><td style="padding:8px;font-weight:bold">Details</td><td style="padding:8px">${extraDetails}</td></tr>` : ''}
        </table>
        <p style="margin-top:24px">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/submissions/${submissionId}" 
             style="background:#0d1b2a;color:white;padding:12px 24px;text-decoration:none;border-radius:6px">
            View Submission
          </a>
        </p>
      </div>
    `,
  })
}

export async function sendClientConfirmation({
  toEmail,
  clientName,
  serviceLabel,
  message,
}: {
  toEmail: string
  clientName: string
  serviceLabel: string
  message: string
}) {
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: toEmail,
    subject: `We received your request — LK Document Services`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:#0d1b2a">Thank you, ${clientName}</h2>
        <p>We have received your request for <strong>${serviceLabel}</strong>.</p>
        <p>${message}</p>
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0"/>
        <p style="color:#666;font-size:14px">
          LK Document Services is not a law firm and does not provide legal advice.<br/>
          Questions? Call or text us at <strong>951-437-9289</strong> or reply to this email.
        </p>
      </div>
    `,
  })
}