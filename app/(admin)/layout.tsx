import { adminLogout } from '@/app/admin-login/action'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f5f0e8' }}>

      {/* Sidebar */}
      <aside style={{
        width: '240px',
        background: '#0d1b2a',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        padding: '0',
        flexShrink: 0,
      }}>
        {/* Logo */}
        <div style={{ padding: '28px 24px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontFamily: 'serif', fontSize: '16px', color: '#f5f0e8' }}>
            LK Document Services
          </div>
          <div style={{ fontSize: '11px', color: '#8a9bb0', marginTop: '4px', letterSpacing: '0.1em' }}>
            ADMIN PANEL
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '16px 0' }}>
            {[
                { href: '/admin/dashboard', label: 'Dashboard', icon: '▦' },
                { href: '/admin/submissions', label: 'Submissions', icon: '📋' },
                { href: '/admin/appointments', label: 'Appointments', icon: '📅' },
                { href: '/admin/documents', label: 'Documents', icon: '📁' },
                { href: '/admin/payments', label: 'Payments', icon: '💳' },
                ].map((item) => (
                <a
                    key={item.href}
                    href={item.href}
                    style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 24px',
                    color: '#8a9bb0',
                    textDecoration: 'none',
                    fontSize: '14px',
                    transition: 'color 0.15s',
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.color = 'white')}
                    onMouseOut={(e) => (e.currentTarget.style.color = '#8a9bb0')}
                >
                    <span style={{ fontSize: '14px' }}>{item.icon}</span>
                    {item.label}
                </a>
                ))}
        </nav>

        {/* Logout */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <form action={adminLogout}>
            <button
              type="submit"
              style={{
                background: 'none',
                border: 'none',
                color: '#8a9bb0',
                cursor: 'pointer',
                fontSize: '14px',
                padding: 0,
              }}
            >
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  )
}