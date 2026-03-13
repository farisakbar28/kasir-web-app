import { useEffect } from 'react'

export default function Modal({ title, subtitle, onClose, children, width = 480 }) {
  useEffect(() => {
    const h = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', h)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', h)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'var(--modal-overlay)',
        backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
        animation: 'fadeIn 0.2s ease',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--modal-surface)',
          border: '1px solid var(--border)',
          borderRadius: 24,
          padding: 36,
          width: '100%',
          maxWidth: width,
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: 'var(--modal-shadow)',
          animation: 'scaleIn 0.25s cubic-bezier(0.34,1.56,0.64,1)',
          position: 'relative',
        }}
      >
        <div style={{
          position: 'absolute', top: 0, left: '20%', right: '20%',
          height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(245,158,11,0.4), transparent)',
        }} />

        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 24, lineHeight: 1.2, marginBottom: subtitle ? 6 : 0 }}>
                {title}
              </h2>
              {subtitle && <p style={{ fontSize: 13, color: 'var(--muted)' }}>{subtitle}</p>}
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid var(--border)',
                color: 'var(--muted)',
                width: 32, height: 32,
                borderRadius: 8, fontSize: 14,
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, marginLeft: 16,
                transition: 'all 0.18s',
              }}
              onMouseEnter={e => { e.target.style.color = 'var(--text)'; e.target.style.borderColor = 'var(--border2)' }}
              onMouseLeave={e => { e.target.style.color = 'var(--muted)'; e.target.style.borderColor = 'var(--border)' }}
            >x</button>
          </div>
          <div style={{
            height: 1,
            background: 'linear-gradient(90deg, rgba(245,158,11,0.2), transparent)',
            marginTop: 20,
          }} />
        </div>
        {children}
      </div>
    </div>
  )
}
