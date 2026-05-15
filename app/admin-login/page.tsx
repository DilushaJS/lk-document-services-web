import { adminLogin } from './action'

const LOCKOUT_MINUTES = 15

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; from?: string }>
}) {
  const params = await searchParams

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f5f0e8',
    }}>
      <div style={{
        background: 'white',
        padding: '48px',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '420px',
        border: '1px solid #ede6d8',
        boxShadow: '0 4px 24px rgba(13,27,42,0.08)',
      }}>
        {/* Logo */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontFamily: 'serif', fontSize: '22px', marginBottom: '4px', color: '#0d1b2a' }}>
            LK Document Services
          </h1>
          <p style={{ color: '#8a9bb0', fontSize: '13px' }}>
            Admin Dashboard — Secure Sign In
          </p>
        </div>

        {/* Error messages */}
        {params.error === '1' && (
          <p style={{
            background: '#fde8e6', color: '#922b21',
            padding: '12px', borderRadius: '6px',
            fontSize: '13px', marginBottom: '20px',
          }}>
            Incorrect email or password. Please try again.
          </p>
        )}
        {params.error === 'locked' && (
          <p style={{
            background: '#fde8e6', color: '#922b21',
            padding: '12px', borderRadius: '6px',
            fontSize: '13px', marginBottom: '20px',
          }}>
            Too many failed attempts. Access locked for {LOCKOUT_MINUTES} minutes.
          </p>
        )}
        {params.error === 'unauthorized' && (
          <p style={{
            background: '#fde8e6', color: '#922b21',
            padding: '12px', borderRadius: '6px',
            fontSize: '13px', marginBottom: '20px',
          }}>
            Your account does not have admin access.
          </p>
        )}

        <form action={adminLogin}>
          <input type="hidden" name="from" value={params.from || '/admin/dashboard'} />

          {/* Email */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block', fontSize: '13px',
              fontWeight: 500, marginBottom: '6px', color: '#0d1b2a',
            }}>
              Email Address
            </label>
            <input
              type="email"
              name="email"
              required
              autoFocus
              placeholder="info@lkdoc.com"
              style={{
                width: '100%', padding: '10px 14px',
                border: '1px solid #ede6d8', borderRadius: '6px',
                fontSize: '15px', outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block', fontSize: '13px',
              fontWeight: 500, marginBottom: '6px', color: '#0d1b2a',
            }}>
              Password
            </label>
            <input
              type="password"
              name="password"
              required
              style={{
                width: '100%', padding: '10px 14px',
                border: '1px solid #ede6d8', borderRadius: '6px',
                fontSize: '15px', outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              width: '100%', padding: '12px',
              background: '#0d1b2a', color: 'white',
              border: 'none', borderRadius: '6px',
              fontSize: '15px', cursor: 'pointer', fontWeight: 500,
            }}
          >
            Sign In
          </button>
        </form>

        <p style={{
          fontSize: '12px', color: '#8a9bb0',
          textAlign: 'center', marginTop: '24px',
        }}>
          Protected by Supabase Auth · LK Document Services
        </p>
      </div>
    </div>
  )
}