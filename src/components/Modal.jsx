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
  }, [])

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(8,7,4,0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
        animation: 'fadeIn 0.2s ease',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="modal-inner"
        style={{
          background: 'linear-gradient(145deg, var(--surface) 0%, var(--bg2) 100%)',
          border: '1px solid var(--border)',
          borderRadius: 24,
          padding: 36,
          width: '100%',
          maxWidth: width,
          maxHeight: '92vh',
          overflowY: 'auto',
          boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
          animation: 'scaleIn 0.25s cubic-bezier(0.34,1.56,0.64,1)',
          position: 'relative',
        }}
      >
        {/* Top decorative line */}
        <div style={{
          position: 'absolute', top: 0, left: '20%', right: '20%',
          height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(245,158,11,0.4), transparent)',
        }} />

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ paddingRight: 16 }}>
              <h2 style={{ fontFamily: 'var(--serif)', fontSize: 22, lineHeight: 1.2, color: 'var(--text)', marginBottom: subtitle ? 5 : 0 }}>
                {title}
              </h2>
              {subtitle && <p style={{ fontSize: 13, color: 'var(--muted)' }}>{subtitle}</p>}
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'var(--surface2)',
                border: '1px solid var(--border)',
                color: 'var(--muted)',
                width: 32, height: 32,
                borderRadius: 8, fontSize: 14,
                cursor: 'pointer', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.18s',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.borderColor = 'var(--border2)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--muted)'; e.currentTarget.style.borderColor = 'var(--border)' }}
            >✕</button>
          </div>
          <div style={{
            height: 1,
            background: 'linear-gradient(90deg, rgba(245,158,11,0.2), transparent)',
            marginTop: 18,
          }} />
        </div>

        {children}
      </div>
    </div>
  )
}