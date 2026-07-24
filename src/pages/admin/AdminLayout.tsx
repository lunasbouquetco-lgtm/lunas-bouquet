import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { getPassword, clearPassword } from '@/lib/adminApi'
import markGold from '@/assets/mark-gold.png'
import AdminGate from './AdminGate'

// The admin lives outside the marketing shell — no public nav, no footer, and it is
// deliberately not linked from anywhere on the site.
export default function AdminLayout() {
  const [unlocked, setUnlocked] = useState(() => getPassword() !== '')
  const navigate = useNavigate()

  if (!unlocked) return <AdminGate onUnlock={() => setUnlocked(true)} />

  function signOut() {
    clearPassword()
    setUnlocked(false)
    navigate('/admin')
  }

  return (
    <div className="min-h-screen bg-ivory">
      <header className="border-b border-edge bg-surface">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-8 gap-y-4 px-6 py-5">
          <img src={markGold} alt="Luna's Bouquet" className="h-7 w-auto" />

          <nav className="flex gap-6">
            <Tab to="/admin" end>
              Overview
            </Tab>
            <Tab to="/admin/orders">Orders</Tab>
            <Tab to="/admin/customers">Customers</Tab>
            <Tab to="/admin/events">Events</Tab>
          </nav>

          <button
            type="button"
            onClick={signOut}
            className="label ml-auto inline-flex items-center gap-1.5 text-[0.58rem] text-muted transition-colors hover:text-rosewood"
          >
            <LogOut size={13} /> Sign out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <Outlet />
      </main>
    </div>
  )
}

function Tab({
  to,
  end,
  children,
}: {
  to: string
  end?: boolean
  children: React.ReactNode
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `label text-[0.6rem] transition-colors ${
          isActive ? 'text-rosewood' : 'text-muted hover:text-gold'
        }`
      }
    >
      {children}
    </NavLink>
  )
}
