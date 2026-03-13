import { useState, useEffect } from 'react'
import { getReportHariIni, getReportByDateRange } from '../api/client'
import Toast from '../components/Toast'

const fmt = (n) => 'Rp\u00a0' + Number(n || 0).toLocaleString('id-ID')

function StatCard({ icon, eyebrow, value, sub, color, delay = 0 }) {
  return (
    <div className="card" style={{ flex: 1, animation: `fadeUp 0.5s ease ${delay}ms both`, position: 'relative', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', top: -40, right: -40,
        width: 120, height: 120,
        background: `radial-gradient(circle, ${color}18, transparent 70%)`,
        pointerEvents: 'none',
      }} />
      <div style={{ fontSize: 26, marginBottom: 14, opacity: 0.85 }}>{icon}</div>
      <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8 }}>
        {eyebrow}
      </div>
      <div className="stat-value" style={{
        fontFamily: value.toString().startsWith('Rp') ? 'var(--mono)' : 'var(--serif)',
        fontSize: 'clamp(18px, 2.5vw, 30px)',
        fontWeight: 700, color, lineHeight: 1.15, marginBottom: 6, wordBreak: 'break-word',
      }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: 'var(--muted)' }}>{sub}</div>}
    </div>
  )
}

export default function Laporan() {
  const [report,  setReport]  = useState(null)
  const [loading, setLoading] = useState(true)
  const [toast,   setToast]   = useState(null)
  const [mode,    setMode]    = useState('today')
  const [start,   setStart]   = useState('')
  const [end,     setEnd]     = useState('')

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

      <div className="page-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
        <div>
          <div className="page-eyebrow">Analytics</div>
          <h1 className="page-title">Laporan Penjualan</h1>
          <p className="page-sub">Ringkasan transaksi dan performa produk</p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={load} disabled={loading}>
          {loading ? <><span className="spinner" /> Memuat</> : '↺ Refresh'}
        </button>
      </div>

      {/* Filter */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: mode === 'range' ? 18 : 0 }}>
          <button className={`btn ${mode === 'today' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setMode('today')}>
            ◉ Hari Ini
          </button>
          <button className={`btn ${mode === 'range' ? 'btn-outline-amber' : 'btn-ghost'}`} onClick={() => setMode('range')}>
            ◈ Rentang Tanggal
          </button>
        </div>
        {mode === 'range' && (
          <div className="filter-range" style={{ display: 'flex', gap: 12, alignItems: 'flex-end', animation: 'fadeUp 0.3s ease' }}>
            <div style={{ flex: 1 }}>
              <label className="input-label">Dari</label>
              <input className="input" type="date" value={start} onChange={e => setStart(e.target.value)} />
            </div>
            <div style={{ flex: 1 }}>
              <label className="input-label">Sampai</label>
              <input className="input" type="date" value={end} onChange={e => setEnd(e.target.value)} />
            </div>
            <button className="btn btn-primary" onClick={load} disabled={!start || !end || loading} style={{ flexShrink: 0 }}>
              Tampilkan
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
          {[...Array(3)].map((_, i) => <div key={i} className="skeleton" style={{ flex: '1 1 200px', height: 150, borderRadius: 20 }} />)}
        </div>
      ) : report ? (
        <>
          <div className="stat-row" style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
            <StatCard icon="◈" eyebrow="Total Pendapatan" value={fmt(report.total_revenue)} sub={mode === 'today' ? 'Hari ini' : `${start} s/d ${end}`} color="var(--green)" delay={0} />
            <StatCard icon="▦" eyebrow="Total Transaksi"  value={report.total_transaksi}    sub="transaksi selesai" color="var(--amber)" delay={80} />
            <StatCard icon="◉" eyebrow="Rata-rata / Transaksi"
              value={report.total_transaksi > 0 ? fmt(Math.round(report.total_revenue / report.total_transaksi)) : fmt(0)}
              sub="per transaksi" color="var(--text2)" delay={160}
            />
          </div>

          <div className="card" style={{ animation: 'fadeUp 0.5s ease 240ms both' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 4 }}>Terlaris</div>
                <div style={{ fontFamily: 'var(--serif)', fontSize: 22, color: 'var(--text)' }}>Produk Terbaik</div>
              </div>
              <span className="badge badge-amber">{mode === 'today' ? 'Hari ini' : 'Periode ini'}</span>
            </div>

            {report.produk_terlaris ? (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 18,
                background: 'var(--amber-dim)', border: '1px solid rgba(245,158,11,0.15)',
                borderRadius: 16, padding: '18px 20px',
                flexWrap: 'wrap',
              }}>
                <div style={{
                  width: 56, height: 56, flexShrink: 0,
                  background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)',
                  borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26,
                }}>◉</div>
                <div style={{ flex: 1, minWidth: 180 }}>
                  <div style={{ fontFamily: 'var(--serif)', fontSize: 24, marginBottom: 4, color: 'var(--text)' }}>
                    {report.produk_terlaris.nama}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--muted)' }}>
                    Terjual{' '}
                    <span style={{ fontFamily: 'var(--mono)', color: 'var(--amber)', fontWeight: 700, fontSize: 16 }}>
                      {report.produk_terlaris.qty_terjual}
                    </span>
                    {' '}unit
                  </div>
                </div>
                <div style={{
                  fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 700,
                  color: 'var(--amber)', background: 'rgba(245,158,11,0.08)',
                  border: '1px solid rgba(245,158,11,0.15)',
                  padding: '8px 14px', borderRadius: 10, flexShrink: 0,
                }}>#1</div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '44px 0', color: 'var(--muted)', border: '1px dashed var(--border)', borderRadius: 16 }}>
                <div style={{ fontSize: 34, marginBottom: 10, opacity: 0.25 }}>◉</div>
                <div style={{ fontSize: 14 }}>
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