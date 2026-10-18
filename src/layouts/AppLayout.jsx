import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { FileText, LayoutDashboard, LogOut, Menu, PlusCircle, X } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '../features/auth/useAuth'
import { Button } from '../components/ui/Button'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/quotations', label: 'Quotations', icon: FileText },
  { to: '/quotations/new', label: 'New Quotation', icon: PlusCircle },
]

export function AppLayout() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  async function handleLogout() {
    try {
      await signOut()
      toast.success('Signed out')
      navigate('/login', { replace: true })
    } catch (error) {
      toast.error(error.message || 'Failed to sign out')
    }
  }

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="border-b border-border px-5 py-5">
        <div className="text-xl font-bold tracking-tight text-ink">QMS</div>
        <p className="mt-1 text-xs text-muted">Quotation Management</p>
      </div>

      <nav className="flex-1 space-y-1 p-3" aria-label="Main">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100 hover:text-ink'
              }`
            }
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-border p-4">
        <div className="mb-3 truncate text-sm text-muted" title={user?.email}>
          {user?.email}
        </div>
        <Button variant="secondary" className="w-full" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-surface lg:flex">
      <aside className="no-print hidden w-64 shrink-0 border-r border-border bg-white lg:block">
        {sidebar}
      </aside>

      {open ? (
        <div className="no-print fixed inset-0 z-40 lg:hidden">
          <button type="button" className="absolute inset-0 bg-slate-900/40" aria-label="Close menu" onClick={() => setOpen(false)} />
          <aside className="relative z-50 h-full w-72 bg-white shadow-xl">{sidebar}</aside>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="no-print sticky top-0 z-20 flex items-center justify-between border-b border-border bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
          <div className="font-semibold text-ink">QMS</div>
          <Button variant="ghost" size="sm" onClick={() => setOpen(true)} aria-label="Open menu">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </header>
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
