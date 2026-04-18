import { adminLogout } from '@/app/admin-login/action'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-slate-50">

      {/* Sidebar */}
      <aside className="w-60 bg-slate-900 text-white flex flex-col flex-shrink-0 border-r">
        {/* Logo */}
        <div className="px-6 py-7 border-b border-slate-700">
          <div className="text-base font-semibold text-slate-50">
            LK Document Services
          </div>
          <div className="text-xs text-slate-400 mt-1 tracking-wide uppercase">
            Admin Panel
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          <NavLink href="/admin/dashboard" label="Dashboard" icon="▦" />
          <NavLink href="/admin/submissions" label="Submissions" icon="📋" />
          <NavLink href="/admin/appointments" label="Appointments" icon="📅" />
          <NavLink href="/admin/documents" label="Documents" icon="📁" />
          <NavLink href="/admin/payments" label="Payments" icon="💳" />
        </nav>

        {/* Logout */}
        <div className="px-6 py-4 border-t border-slate-700">
          <form action={adminLogout}>
            <Button
              type="submit"
              variant="ghost"
              className="w-full justify-start h-auto py-2 px-3 text-sm text-slate-300 hover:text-white hover:bg-slate-800"
            >
              Sign out
            </Button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-10">
        {children}
      </main>
    </div>
  )
}

function NavLink({ href, label, icon }: { href: string; label: string; icon: string }) {
  return (
    <Link 
      href={href}
      className="flex items-center gap-3 px-3 py-2 text-sm text-slate-300 rounded-md hover:bg-slate-800 hover:text-white transition-colors"
    >
      <span>{icon}</span>
      <span>{label}</span>
    </Link>
  )
}