import { NavLink, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useTheme } from '../theme'

const NAV = [
  { to: '/', label: 'Produk', icon: 'P' },
  { to: '/kasir', label: 'Kasir', icon: 'K' },
  { to: '/laporan', label: 'Laporan', icon: 'L' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const { theme, isDark, toggleTheme } = useTheme()

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', h)
    return () => window.removeEventListener('scroll', h)
  }, [])

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 200,
      padding: '0 48px',
      height: 68,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      background: scrolled ? 'var(--nav-bg-scrolled)' : 'var(--nav-bg)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid',
      borderColor: scrolled ? 'var(--border)' : 'var(--nav-border-soft)',
      transition: 'all 0.3s',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{
          width: 36, height: 36,
          background: 'linear-gradient(135deg, var(--amber), #d97706)',
          borderRadius: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, fontWeight: 800, color: 'var(--ink)',
          boxShadow: '0 4px 14px rgba(245,158,11,0.35)',
          fontFamily: "'JetBrains Mono', monospace",
        }}>K</div>
        <div>
          <div style={{
            fontFamily: "'Instrument Serif', serif",
            fontSize: 20, lineHeight: 1, color: 'var(--text)',
          }}>Kasir</div>
          <div style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '0.12em', fontWeight: 600 }}>
            POS SYSTEM
          </div>
        </div>
      </div>

      <nav style={{ display: 'flex', gap: 2, background: 'var(--nav-pill-bg)', padding: 4, borderRadius: 12, border: '1px solid var(--border)' }}>
        {NAV.map(({ to, label, icon }) => {
          const active = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)
          return (
            <NavLink
              key={to}
              to={to}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '7px 16px',
                borderRadius: 9,
                fontSize: 13, fontWeight: 600,
                textDecoration: 'none',
                transition: 'all 0.2s',
                color: active ? 'var(--ink)' : 'var(--muted)',
                background: active ? 'linear-gradient(135deg, var(--amber), #d97706)' : 'transparent',
                boxShadow: active ? '0 2px 8px rgba(245,158,11,0.3)' : 'none',
                letterSpacing: '0.01em',
              }}
            >
              <span style={{ fontSize: 12, fontFamily: 'var(--mono)' }}>{icon}</span>
              {label}
            </NavLink>
          )
        })}
      </nav>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          className="btn btn-ghost btn-sm"
          onClick={toggleTheme}
          aria-label={`Ganti ke ${isDark ? 'light mode' : 'dark mode'}`}
          title={`Mode saat ini: ${theme}`}
        >
          {isDark ? 'Light' : 'Dark'}
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            width: 7, height: 7, borderRadius: '50%',
            background: 'var(--green)',
            boxShadow: '0 0 8px rgba(110,231,183,0.6)',
            animation: 'pulse 2s infinite',
            display: 'inline-block',
          }} />
          <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 500 }}>Live</span>
        </div>
      </div>
    </header>
  )
}
