import { useState, useEffect } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import markGold from '@/assets/mark-gold.png'

const links = [
  { to: '/', label: 'Home' },
  { to: '/bouquets', label: 'Bouquets' },
  { to: '/about', label: 'Our Story' },
  { to: '/contact', label: 'Contact' },
]

export default function Nav() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 backdrop-blur-sm transition-colors duration-500 ${
        scrolled
          ? 'bg-ivory/95 shadow-[0_1px_0_rgba(169,124,36,0.18)]'
          : 'bg-ivory/85 shadow-[0_1px_0_rgba(169,124,36,0.10)]'
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
        {/* Left links (desktop) */}
        <div className="hidden flex-1 items-center gap-8 md:flex">
          {links.slice(0, 2).map((l) => (
            <NavItem key={l.to} to={l.to} label={l.label} />
          ))}
        </div>

        {/* Center mark */}
        <Link to="/" className="shrink-0" aria-label="Luna's Bouquet home">
          <img src={markGold} alt="Luna's Bouquet" className="h-16 w-auto sm:h-20" />
        </Link>

        {/* Right links (desktop) */}
        <div className="hidden flex-1 items-center justify-end gap-8 md:flex">
          {links.slice(2).map((l) => (
            <NavItem key={l.to} to={l.to} label={l.label} />
          ))}
          <Link
            to="/order"
            className="label rounded-full bg-rosewood px-5 py-2.5 text-white transition-colors hover:bg-rosewood-dark"
          >
            Order
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="ml-auto text-plum md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          {open ? <X size={26} /> : <Menu size={26} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-gold/20 bg-ivory px-6 pb-8 pt-4 md:hidden">
          <ul className="flex flex-col gap-1">
            {links.map((l) => (
              <li key={l.to}>
                <NavLink
                  to={l.to}
                  className="label block py-3 text-plum"
                >
                  {l.label}
                </NavLink>
              </li>
            ))}
            <li className="pt-3">
              <Link
                to="/order"
                className="label inline-block rounded-full bg-rosewood px-6 py-3 text-white"
              >
                Order flowers
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  )
}

function NavItem({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `label transition-colors hover:text-gold ${
          isActive ? 'text-gold' : 'text-plum'
        }`
      }
    >
      {label}
    </NavLink>
  )
}
