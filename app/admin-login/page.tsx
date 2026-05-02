import { adminLogin } from './action'

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; from?: string }>
}) {
  const params = await searchParams
  const LOCKOUT_MINUTES = 15

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
        maxWidth: '400px',
        border: '1px solid #ede6d8',
      }}>
        <h1 style={{ fontFamily: 'serif', fontSize: '24px', marginBottom: '8px' }}>
          LK Document Services
        </h1>
        <p style={{ color: '#8a9bb0', fontSize: '14px', marginBottom: '32px' }}>
          Admin Dashboard
        </p>

        {params.error === '1' && (
          <p style={{
            background: '#fde8e6',
            color: '#922b21',
            padding: '12px',
            borderRadius: '6px',
            fontSize: '14px',
            marginBottom: '20px',
          }}>
            Incorrect password. Try again.
          </p>
        )}

        {params.error === 'locked' && (
          <p style={{
            background: '#fde8e6',
            color: '#922b21',
            padding: '12px',
            borderRadius: '6px',
            fontSize: '14px',
            marginBottom: '20px',
          }}>
            Too many failed attempts. Access locked for {LOCKOUT_MINUTES} minutes.
            Contact support if you need immediate access.
          </p>
        )}

        <form action={adminLogin}>
          <input type="hidden" name="from" value={params.from || '/admin/dashboard'} />
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>
              Password
            </label>
            <input
              type="password"
              name="password"
              required
              autoFocus
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '1px solid #ede6d8',
                borderRadius: '6px',
                fontSize: '15px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
          <button
            type="submit"
            style={{
              width: '100%',
              padding: '12px',
              background: '#0d1b2a',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '15px',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  )
}