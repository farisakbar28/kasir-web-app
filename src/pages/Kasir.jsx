import { useState, useEffect } from 'react'
import { getAllProduk, checkout } from '../api/client'
import Toast from '../components/Toast'
import Modal from '../components/Modal'

const fmt = (n) => 'Rp\u00a0' + Number(n).toLocaleString('id-ID')

export default function Kasir() {
  const [produk,  setProduk]  = useState([])
  const [search,  setSearch]  = useState('')
  const [cart,    setCart]    = useState([])
  const [loading, setLoading] = useState(true)
  const [paying,  setPaying]  = useState(false)
  const [toast,   setToast]   = useState(null)
  const [receipt, setReceipt] = useState(null)

  const toast$ = (m, t = 'success') => setToast({ message: m, type: t })

  useEffect(() => {
    const t = setTimeout(async () => {
      setLoading(true)
      try { setProduk((await getAllProduk(search)).data) }
      catch { toast$('Gagal memuat produk', 'error') }
      finally { setLoading(false) }
    }, 380)
    return () => clearTimeout(t)
  }, [search])

  const inCart = (id) => cart.find(i => i.product_id === id)

  const add = (p) => {
    if (p.stock === 0) { toast$('Stok habis!', 'error'); return }
    setCart(prev => {
      const ex = prev.find(i => i.product_id === p.id)
      if (ex) {
        if (ex.quantity >= p.stock) { toast$('Melebihi stok', 'error'); return prev }
        return prev.map(i => i.product_id === p.id ? { ...i, quantity: i.quantity + 1 } : i)
      }
      return [...prev, { product_id: p.id, name: p.name, price: p.price, stock: p.stock, quantity: 1 }]
    })
  }

  const setQty = (id, qty) => {
    if (qty < 1) { setCart(p => p.filter(i => i.product_id !== id)); return }
    const item = cart.find(i => i.product_id === id)
    if (item && qty > item.stock) { toast$('Melebihi stok', 'error'); return }
    setCart(p => p.map(i => i.product_id === id ? { ...i, quantity: qty } : i))
  }

  const remove  = (id) => setCart(p => p.filter(i => i.product_id !== id))
  const total    = cart.reduce((s, i) => s + i.price * i.quantity, 0)
  const totalQty = cart.reduce((s, i) => s + i.quantity, 0)

  const pay = async () => {
    if (!cart.length) { toast$('Keranjang kosong', 'error'); return }
    setPaying(true)
    try {
      const res = await checkout(cart.map(i => ({ product_id: i.product_id, quantity: i.quantity })))
      setReceipt(res.data)
      setCart([])
      toast$('Transaksi berhasil!')
    } catch (e) { toast$(e.response?.data || 'Transaksi gagal', 'error') }
    finally { setPaying(false) }
  }

  return (
    <div className="page">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div style={{ marginBottom: 32 }}>
        <div className="page-eyebrow">Point of Sale</div>
        <h1 className="page-title">Kasir</h1>
        <p className="page-sub">Pilih produk lalu proses pembayaran</p>
      </div>

      <div className="kasir-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24, alignItems: 'start' }}>

        {/* ── Kiri: Produk ── */}
        <div>
          <div style={{ marginBottom: 16, position: 'relative' }}>
            <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', fontSize: 16 }}>⌕</span>
            <input className="input" style={{ paddingLeft: 44, fontSize: 15 }} placeholder="Cari produk..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          {loading ? (
            <div className="product-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12 }}>
              {[...Array(8)].map((_, i) => <div key={i} className="skeleton" style={{ height: 130, borderRadius: 16 }} />)}
            </div>
          ) : produk.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--muted)' }}>
              <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.3 }}>⌕</div>
              <div>Produk tidak ditemukan</div>
            </div>
          ) : (
            <div className="product-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12 }}>
              {produk.map(p => {
                const inC = inCart(p.id)
                const sold = p.stock === 0
                return (
                  <button
                    key={p.id}
                    onClick={() => add(p)}
                    disabled={sold}
                    style={{
                      background: inC ? 'linear-gradient(135deg, var(--amber-dim), var(--amber-glow))' : 'var(--surface)',
                      border: inC ? '1px solid rgba(245,158,11,0.4)' : '1px solid var(--border)',
                      borderRadius: 16,
                      padding: '16px 14px',
                      textAlign: 'left',
                      cursor: sold ? 'not-allowed' : 'pointer',
                      opacity: sold ? 0.45 : 1,
                      transition: 'all 0.2s',
                      position: 'relative',
                      boxShadow: inC ? '0 0 0 1px rgba(245,158,11,0.1), 0 4px 20px rgba(245,158,11,0.06)' : 'none',
                    }}
                  >
                    {inC && (
                      <div style={{
                        position: 'absolute', top: -8, right: -8,
                        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                        color: '#0c0a08', width: 24, height: 24, borderRadius: '50%',
                        fontSize: 12, fontWeight: 800,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 2px 8px rgba(245,158,11,0.5)',
                        fontFamily: 'var(--mono)',
                      }}>{inC.quantity}</div>
                    )}
                    <div style={{ fontSize: 24, marginBottom: 8 }}>{sold ? '⊘' : '◈'}</div>
                    <div style={{
                      fontWeight: 700, fontSize: 13, marginBottom: 5, color: 'var(--text)',
                      lineHeight: 1.3, display: '-webkit-box',
                      WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                    }}>{p.name}</div>
                    <div style={{ fontFamily: 'var(--mono)', fontWeight: 700, color: inC ? 'var(--amber)' : 'var(--text2)', fontSize: 13, marginBottom: 7 }}>
                      {fmt(p.price)}
                    </div>
                    <span className={`badge ${sold ? 'badge-red' : p.stock < 5 ? 'badge-amber' : 'badge-muted'}`} style={{ fontSize: 10 }}>
                      {sold ? 'Habis' : `${p.stock} stok`}
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* ── Kanan: Cart ── */}
        <div className="kasir-cart-sticky cart-sticky" style={{ position: 'sticky', top: 80 }}>
          <div className="card card-flush" style={{ overflow: 'hidden' }}>
            {/* Header */}
            <div style={{
              padding: '18px 22px',
              borderBottom: '1px solid var(--border)',
              background: 'rgba(0,0,0,0.1)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div>
                <div style={{ fontFamily: 'var(--serif)', fontSize: 20, color: 'var(--text)' }}>Keranjang</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
                  {cart.length > 0 ? `${totalQty} item` : 'Kosong'}
                </div>
              </div>
              {cart.length > 0 && (
                <button className="btn btn-ghost btn-sm" onClick={() => setCart([])}>Reset</button>
              )}
            </div>

            {/* Items */}
            <div style={{ minHeight: 180, maxHeight: 360, overflowY: 'auto', padding: '10px 0' }}>
              {cart.length === 0 ? (
                <div style={{ padding: '50px 20px', textAlign: 'center', color: 'var(--muted)' }}>
                  <div style={{ fontSize: 32, marginBottom: 10, opacity: 0.25 }}>◈</div>
                  <div style={{ fontSize: 13 }}>Klik produk untuk menambahkan</div>
                </div>
              ) : cart.map((item, i) => (
                <div key={item.product_id} style={{
                  padding: '11px 22px',
                  borderBottom: i < cart.length - 1 ? '1px solid rgba(58,52,32,0.35)' : 'none',
                  display: 'flex', gap: 10, alignItems: 'center',
                  animation: 'fadeUp 0.2s ease',
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text)' }}>
                      {item.name}
                    </div>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--amber)' }}>
                      {fmt(item.price * item.quantity)}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <button onClick={() => setQty(item.product_id, item.quantity - 1)}
                      style={{ width: 26, height: 26, borderRadius: 7, background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                    <span style={{ fontFamily: 'var(--mono)', fontWeight: 700, fontSize: 14, minWidth: 20, textAlign: 'center', color: 'var(--text)' }}>{item.quantity}</span>
                    <button onClick={() => setQty(item.product_id, item.quantity + 1)}
                      style={{ width: 26, height: 26, borderRadius: 7, background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                    <button onClick={() => remove(item.product_id)}
                      style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 14, padding: '0 2px', marginLeft: 2 }}
                      onMouseEnter={e => e.target.style.color = 'var(--red)'}
                      onMouseLeave={e => e.target.style.color = 'var(--muted)'}
                    >✕</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Total & Bayar */}
            {cart.length > 0 && (
              <div style={{ padding: '18px 22px', borderTop: '1px solid var(--border)', background: 'rgba(0,0,0,0.08)' }}>
                <div className="cart-breakdown" style={{ marginBottom: 12 }}>
                  {cart.map(item => (
                    <div key={item.product_id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontSize: 12, color: 'var(--muted)' }}>{item.name} ×{item.quantity}</span>
                      <span style={{ fontSize: 12, fontFamily: 'var(--mono)', color: 'var(--text2)' }}>{fmt(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div style={{ height: 1, background: 'linear-gradient(90deg, rgba(245,158,11,0.3), transparent)', marginBottom: 14 }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <span style={{ fontFamily: 'var(--serif)', fontSize: 18, color: 'var(--text)' }}>Total</span>
                  <span style={{ fontFamily: 'var(--mono)', fontWeight: 800, fontSize: 22, color: 'var(--green)', textShadow: '0 0 20px rgba(110,231,183,0.2)' }}>
                    {fmt(total)}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setCart([])}>Kosongkan</button>
                  <button className="btn btn-primary" style={{ flex: 2, justifyContent: 'center' }} onClick={pay} disabled={paying}>
                    {paying ? <><span className="spinner" /> Memproses...</> : '◈ Bayar'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Struk */}
      {receipt && (
        <Modal title="Transaksi Berhasil" subtitle={`ID #${receipt.id} · ${new Date().toLocaleString('id-ID')}`} onClose={() => setReceipt(null)}>
          <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 14, padding: '20px 22px', fontFamily: 'var(--mono)', marginBottom: 22 }}>
            <div style={{ textAlign: 'center', marginBottom: 14, paddingBottom: 12, borderBottom: '1px dashed var(--border)' }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                color: '#0c0a08', fontFamily: 'var(--serif)',
                padding: '4px 16px', borderRadius: 99, fontSize: 17, marginBottom: 6,
              }}>Kasir</div>
              <div style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '0.1em' }}>BUKTI TRANSAKSI</div>
            </div>
            {receipt.details.map((d, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)', marginBottom: 2 }}>{d.product_name}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>{d.quantity}× {fmt(d.subtotal / d.quantity)}</div>
                </div>
                <div style={{ fontWeight: 700, color: 'var(--text2)' }}>{fmt(d.subtotal)}</div>
              </div>
            ))}
            <div style={{ borderTop: '1px dashed var(--border)', marginTop: 12, paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: 'var(--serif)', fontSize: 20, color: 'var(--text)' }}>TOTAL</span>
              <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--green)' }}>{fmt(receipt.total_amount)}</span>
            </div>
          </div>
          <button className="btn btn-primary btn-lg w-full" style={{ justifyContent: 'center' }} onClick={() => setReceipt(null)}>
            ◈ Transaksi Baru
          </button>
        </Modal>
      )}
    </div>
  )
}