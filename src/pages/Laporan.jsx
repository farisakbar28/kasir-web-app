import { useState, useEffect } from 'react'
import { getReportHariIni, getReportByDateRange } from '../api/client'
import Toast from '../components/Toast'

const fmt = (n) => 'Rp\u00a0' + Number(n || 0).toLocaleString('id-ID')

function StatCard({ icon, eyebrow, value, sub, color, delay = 0 }) {
  return (
    <div className="card" style={{
      flex: 1,
      animation: `fadeUp 0.5s ease ${delay}ms both`,
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Glow effect */}
      <div style={{
        position: 'absolute', top: -40, right: -40,
        width: 120, height: 120,
        background: `radial-gradient(circle, ${color}18, transparent 70%)`,
        pointerEvents: 'none',
      }} />
      <div style={{ fontSize: 28, marginBottom: 16, opacity: 0.9 }}>{icon}</div>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8 }}>
        {eyebrow}
      </div>
      <div style={{
        fontFamily: typeof value === 'string' && value.startsWith('Rp') ? 'var(--mono)' : "'Instrument Serif', serif",
        fontSize: 'clamp(22px, 3vw, 32px)',
        fontWeight: 700,
        color: color,
        lineHeight: 1.1,
        marginBottom: 8,
        wordBreak: 'break-all',
      }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: 'var(--muted)' }}>{sub}</div>}
    </div>
  )
}

export default function Laporan() {
  const [report,  setReport]    = useState(null)
  const [loading, setLoading]   = useState(true)
  const [toast,   setToast]     = useState(null)
  const [mode,    setMode]      = useState('today')
  const [start,   setStart]     = useState('')
  const [end,     setEnd]       = useState('')

  const toast$ = (m, t = 'success') => setToast({ message: m, type: t })

  const load = async () => {
    setLoading(true)
    try {
      const res = mode === 'range' && start && end
        ? await getReportByDateRange(start, end)
        : await getReportHariIni()
      setReport(res.data)
    } catch { toast$('Gagal memuat laporan', 'error') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  return (
    <div className="page">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 36 }}>
        <div>
          <div className="page-eyebrow">Analytics</div>
          <h1 className="page-title">Laporan Penjualan</h1>
          <p className="page-sub">Ringkasan transaksi dan performa produk</p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={load} disabled={loading}>
          {loading ? <><span className="spinner" /> Memuat</> : 'â†º Refresh'}
        </button>
      </div>

      {/* Filter */}
      <div className="card" style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: mode === 'range' ? 20 : 0 }}>
          <button
            className={`btn ${mode === 'today' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => { setMode('today'); }}
          >
            â—‰ Hari Ini
          </button>
          <button
            className={`btn ${mode === 'range' ? 'btn-outline-amber' : 'btn-ghost'}`}
            onClick={() => setMode('range')}
          >
            â—ˆ Rentang Tanggal
          </button>
        </div>

        {mode === 'range' && (
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', animation: 'fadeUp 0.3s ease' }}>
            <div style={{ flex: 1 }}>
              <label className="input-label">Dari</label>
              <input className="input" type="date" value={start} onChange={e => setStart(e.target.value)} />
            </div>
            <div style={{ flex: 1 }}>
              <label className="input-label">Sampai</label>
              <input className="input" type="date" value={end} onChange={e => setEnd(e.target.value)} />
            </div>
            <button className="btn btn-primary" onClick={load} disabled={!start || !end || loading}>
              Tampilkan
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="skeleton" style={{ flex: 1, height: 160, borderRadius: 20 }} />
          ))}
        </div>
      ) : report ? (
        <>
          {/* Stat cards */}
          <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
            <StatCard
              icon="â—ˆ"
              eyebrow="Total Pendapatan"
              value={fmt(report.total_revenue)}
              sub={mode === 'today' ? 'Hari ini' : `${start} s/d ${end}`}
              color="var(--green)"
              delay={0}
            />
            <StatCard
              icon="â–¦"
              eyebrow="Total Transaksi"
              value={report.total_transaksi}
              sub="transaksi selesai"
              color="var(--amber)"
              delay={80}
            />
            <StatCard
              icon="â—‰"
              eyebrow="Rata-rata / Transaksi"
              value={report.total_transaksi > 0
                ? fmt(Math.round(report.total_revenue / report.total_transaksi))
                : 'Rp\u00a00'}
              sub="per transaksi"
              color="var(--text2)"
              delay={160}
            />
          </div>

          {/* Produk terlaris */}
          <div className="card" style={{ animation: 'fadeUp 0.5s ease 240ms both' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 4 }}>
                  Terlaris
                </div>
                <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 22 }}>Produk Terbaik</div>
              </div>
              <span className="badge badge-amber">
                {mode === 'today' ? 'Hari ini' : 'Periode ini'}
              </span>
            </div>

            {report.produk_terlaris ? (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 20,
                background: 'linear-gradient(135deg, rgba(245,158,11,0.06), rgba(245,158,11,0.02))',
                border: '1px solid rgba(245,158,11,0.15)',
                borderRadius: 16, padding: '20px 24px',
              }}>
                <div style={{
                  width: 64, height: 64, flexShrink: 0,
                  background: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(245,158,11,0.05))',
                  border: '1px solid rgba(245,158,11,0.2)',
                  borderRadius: 18,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 28,
                }}>â—‰</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 26, marginBottom: 4 }}>
                    {report.produk_terlaris.nama}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--muted)' }}>
                    Terjual{' '}
                    <span style={{ fontFamily: 'var(--mono)', color: 'var(--amber)', fontWeight: 700, fontSize: 16 }}>
                      {report.produk_terlaris.qty_terjual}
                    </span>
                    {' '}unit{mode === 'today' ? ' hari ini' : ' dalam periode ini'}
                  </div>
                </div>
                <div style={{
                  fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 700,
                  color: 'var(--amber)',
                  background: 'rgba(245,158,11,0.08)',
                  border: '1px solid rgba(245,158,11,0.15)',
                  padding: '8px 14px', borderRadius: 10,
                }}>
                  #1
                </div>
              </div>
            ) : (
              <div style={{
                textAlign: 'center', padding: '48px 0',
                color: 'var(--muted)',
                border: '1px dashed var(--border)',
                borderRadius: 16,
              }}>
                <div style={{ fontSize: 36, marginBottom: 10, opacity: 0.3 }}>â—‰</div>
                <div style={{ fontSize: 15 }}>
                  {mode === 'today' ? 'Belum ada transaksi hari ini' : 'Tidak ada transaksi di periode ini'}
                </div>
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  )
}
