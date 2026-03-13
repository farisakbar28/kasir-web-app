import { useEffect, useState } from 'react'

export default function Toast({ message, type = 'success', onClose }) {
  const [alive, setAlive] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => {
      setAlive(false)
      setTimeout(onClose, 350)
    }, 3200)
    return () => clearTimeout(t)
  }, [])

  const cfg = {
    success: { icon: '✓', border: 'rgba(110,231,183,0.25)', color: '#6ee7b7' },
    error:   { icon: '✕', border: 'rgba(252,165,165,0.25)', color: '#fca5a5' },
    info:    { icon: '◆', border: 'rgba(245,158,11,0.3)',   color: '#f59e0b' },
  }
  const c = cfg[type] || cfg.success

  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 16, zIndex: 9999,
      maxWidth: 'calc(100vw - 32px)',
      display: 'flex', alignItems: 'center', gap: 10,
      background: 'var(--surface)',
      border: `1px solid ${c.border}`,
      backdropFilter: 'blur(16px)',
      padding: '12px 16px',
      borderRadius: 12,
      boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
      transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)',
      opacity: alive ? 1 : 0,
      transform: alive ? 'translateY(0) scale(1)' : 'translateY(8px) scale(0.96)',
      animation: 'slideIn 0.3s cubic-bezier(0.34,1.56,0.64,1)',
    }}>
      <span style={{
        width: 24, height: 24, borderRadius: '50%',
        background: `${c.color}18`,
        border: `1px solid ${c.border}`,
        color: c.color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 11, fontWeight: 800, flexShrink: 0,
      }}>{c.icon}</span>
      <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', lineHeight: 1.4 }}>{message}</span>
    </div>
  )
}