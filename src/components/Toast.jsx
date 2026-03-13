import { useEffect, useState } from 'react'

export default function Toast({ message, type = 'success', onClose }) {
  const [alive, setAlive] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => {
      setAlive(false)
      setTimeout(onClose, 350)
    }, 3200)
    return () => clearTimeout(t)
  }, [onClose])

  const cfg = {
    success: { icon: 'OK', bg: 'rgba(110,231,183,0.08)', border: 'rgba(110,231,183,0.25)', color: 'var(--green)' },
    error: { icon: 'ER', bg: 'rgba(252,165,165,0.08)', border: 'rgba(252,165,165,0.25)', color: 'var(--red)' },
    info: { icon: 'IN', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.3)', color: 'var(--amber)' },
  }
  const c = cfg[type] || cfg.success

  return (
    <div style={{
      position: 'fixed', bottom: 28, right: 28, zIndex: 9999,
      display: 'flex', alignItems: 'center', gap: 10,
      background: 'var(--toast-bg)',
      border: `1px solid ${c.border}`,
      backdropFilter: 'blur(16px)',
      padding: '12px 18px',
      borderRadius: 12,
      boxShadow: 'var(--toast-shadow)',
      transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)',
      opacity: alive ? 1 : 0,
      transform: alive ? 'translateY(0) scale(1)' : 'translateY(8px) scale(0.96)',
      animation: 'slideIn 0.3s cubic-bezier(0.34,1.56,0.64,1)',
      maxWidth: 320,
    }}>
      <span style={{
        width: 26, height: 26,
        borderRadius: '50%',
        background: c.bg,
        border: `1px solid ${c.border}`,
        color: c.color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 9, fontWeight: 700, flexShrink: 0,
      }}>{c.icon}</span>
      <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', lineHeight: 1.4 }}>{message}</span>
    </div>
  )
}
