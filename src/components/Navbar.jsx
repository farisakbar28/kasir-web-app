import { NavLink, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'

const NAV = [
  { to: '/',        label: 'Produk',  icon: '▦' },
  { to: '/kasir',   label: 'Kasir',   icon: '◈' },
  { to: '/laporan', label: 'Laporan', icon: '◉' },
]

export default function Navbar() {
  const [scrolled,  setScrolled] = useState(false)
  const [menuOpen,  setMenuOpen] = useState(false)
  const { dark, toggle } = useTheme()
  const location = useLocation()

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', h)
    return () => window.removeEventListener('scroll', h)
  }, [])

  useEffect(() => { setMenuOpen(false) }, [location])

  return (
    <>
      <header style={{
        position: 'sticky', top: 0, zIndex: 200,
        padding: '0 24px',
        height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: scrolled
          ? dark ? 'rgba(12,10,8,0.95)' : 'rgba(250,248,244,0.97)'
          : dark ? 'rgba(12,10,8,0.7)'  : 'rgba(250,248,244,0.8)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)',
        transition: 'all 0.3s',
        gap: 12,
      }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <div style={{
            width: 34, height: 34,
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 15, fontWeight: 800, color: '#0c0a08',
            boxShadow: '0 4px 14px rgba(245,158,11,0.35)',
            fontFamily: 'var(--mono)', flexShrink: 0,
          }}>K</div>
          <div>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 18, lineHeight: 1, color: 'var(--text)' }}>
              Kasir
            </div>
            <div style={{ fontSize: 9, color: 'var(--muted)', letterSpacing: '0.12em', fontWeight: 600 }}>
              POS SYSTEM
            </div>
          </div>
        </div>

        {/* Desktop Nav */}
        <nav
          className="desktop-nav"
          style={{
            display: 'flex', gap: 2,
            background: 'var(--surface2)',
            padding: 4, borderRadius: 12,
            border: '1px solid var(--border)',
          }}
        >
          {NAV.map(({ to, label, icon }) => {
            const active = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)
            return (
              <NavLink key={to} to={to} style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '7px 14px', borderRadius: 9,
                fontSize: 13, fontWeight: 600,
                textDecoration: 'none', transition: 'all 0.2s',
                color: active ? '#0c0a08' : 'var(--muted)',
                background: active ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'transparent',
                boxShadow: active ? '0 2px 8px rgba(245,158,11,0.3)' : 'none',
              }}>
                <span>{icon}</span>{label}
              </NavLink>
            )
          })}
        </nav>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>

          {/* Live indicator — desktop only */}
          <div className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{
              width: 7, height: 7, borderRadius: '50%',
              background: '#6ee7b7',
              boxShadow: '0 0 8px rgba(110,231,183,0.6)',
              animation: 'pulse 2s infinite',
              display: 'inline-block',
            }} />
            <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 500 }}>Live</span>
          </div>

          {/* Theme toggle */}
          <button
            onClick={toggle}
            title={dark ? 'Light Mode' : 'Dark Mode'}
            style={{
              width: 38, height: 38,
              background: 'var(--surface2)',
              border: '1px solid var(--border)',
              borderRadius: 10,
              cursor: 'pointer', fontSize: 17,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s', color: 'var(--text)', flexShrink: 0,
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--amber)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            {dark ? '☀️' : '🌙'}
          </button>

          {/* Hamburger — mobile only */}
          <button
            onClick={() => setMenuOpen(o => !o)}
            className="mobile-menu-btn"
            style={{
              width: 38, height: 38,
              background: 'var(--surface2)',
              border: '1px solid var(--border)',
              borderRadius: 10,
              cursor: 'pointer', fontSize: 18,
              display: 'none',
              alignItems: 'center', justifyContent: 'center',
              color: 'var(--text)', flexShrink: 0,
            }}
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </header>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div style={{
          position: 'fixed', top: 64, left: 0, right: 0, zIndex: 199,
          background: dark ? 'rgba(12,10,8,0.97)' : 'rgba(250,248,244,0.97)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--border)',
          padding: '10px 12px 14px',
          animation: 'fadeUp 0.2s ease',
        }}>
          {NAV.map(({ to, label, icon }) => {
            const active = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)
            return (
              <NavLink key={to} to={to} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '13px 16px', borderRadius: 12,
                fontSize: 15, fontWeight: 600,
                textDecoration: 'none', transition: 'all 0.2s',
                color: active ? 'var(--amber)' : 'var(--text)',
                background: active ? 'var(--amber-dim)' : 'transparent',
                marginBottom: 4,
              }}>
                <span style={{ fontSize: 18 }}>{icon}</span>{label}
              </NavLink>
            )
          })}
        </div>
      )}
    </>
  )
}