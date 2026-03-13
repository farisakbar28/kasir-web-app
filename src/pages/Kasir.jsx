import { useState, useEffect } from 'react'
import { getAllProduk, checkout } from '../api/client'
import Toast from '../components/Toast'
import Modal from '../components/Modal'

const fmt = (n) => 'Rp\u00a0' + Number(n).toLocaleString('id-ID')

export default function Kasir() {
  const [produk,  setProduk]     = useState([])
  const [search,  setSearch]     = useState('')
  const [cart,    setCart]       = useState([])
  const [loading, setLoading]    = useState(true)
  const [paying,  setPaying]     = useState(false)
  const [toast,   setToast]      = useState(null)
  const [receipt, setReceipt]    = useState(null)

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

  const remove = (id) => setCart(p => p.filter(i => i.product_id !== id))

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
    <div className="page" style={{ paddingBottom: 60 }}>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div style={{ marginBottom: 36 }}>
        <div className="page-eyebrow">Point of Sale</div>
        <h1 className="page-title">Kasir</h1>
        <p className="page-sub">Pilih produk lalu proses pembayaran</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 28, alignItems: 'start' }}>

        {/* â”€â”€â”€ Kiri: Produk â”€â”€â”€ */}
        <div>
          {/* Search */}
          <div style={{ marginBottom: 20, position: 'relative' }}>
            <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', fontSize: 16 }}>âŒ•</span>
            <input
              className="input"
              style={{ paddingLeft: 44, fontSize: 15 }}
              placeholder="Cari produk..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
              {[...Array(8)].map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 130, borderRadius: 16 }} />
              ))}
            </div>
          ) : produk.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--muted)' }}>
              <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.4 }}>âŒ•</div>
              <div>Produk tidak ditemukan</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
              {produk.map(p => {
                const inC = inCart(p.id)
                const sold = p.stock === 0
                return (
                  <button
                    key={p.id}
                    onClick={() => add(p)}
                    disabled={sold}
                    style={{
                      background: inC
                        ? 'linear-gradient(135deg, rgba(245,158,11,0.12), rgba(245,158,11,0.06))'
                        : 'var(--surface)',
                      border: inC ? '1px solid rgba(245,158,11,0.4)' : '1px solid var(--border)',
                      borderRadius: 16,
                      padding: '18px 16px',
                      textAlign: 'left',
                      cursor: sold ? 'not-allowed' : 'pointer',
                      opacity: sold ? 0.45 : 1,
                      transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
                      position: 'relative',
                      boxShadow: inC ? '0 0 0 1px rgba(245,158,11,0.15), 0 4px 20px rgba(245,158,11,0.08)' : 'none',
                    }}
                    onMouseEnter={e => { if (!sold && !inC) e.currentTarget.style.borderColor = 'var(--border2)' }}
                    onMouseLeave={e => { if (!sold && !inC) e.currentTarget.style.borderColor = 'var(--border)' }}
                  >
                    {inC && (
                      <div style={{
                        position: 'absolute', top: -8, right: -8,
                        background: 'linear-gradient(135deg, var(--amber), #d97706)',
                        color: 'var(--ink)',
                        width: 24, height: 24,
                        borderRadius: '50%',
                        fontSize: 12, fontWeight: 800,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 2px 8px rgba(245,158,11,0.5)',
                        fontFamily: 'var(--mono)',
                      }}>{inC.quantity}</div>
                    )}
                    <div style={{ fontSize: 26, marginBottom: 10, lineHeight: 1 }}>
                      {sold ? 'âŠ˜' : 'â—ˆ'}
                    </div>
                    <div style={{
                      fontWeight: 700, fontSize: 13, marginBottom: 6,
                      color: 'var(--text)', lineHeight: 1.3,
                      display: '-webkit-box', WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical', overflow: 'hidden',
                    }}>{p.name}</div>
                    <div style={{
                      fontFamily: 'var(--mono)', fontWeight: 700,
                      color: inC ? 'var(--amber)' : 'var(--text2)',
                      fontSize: 13, marginBottom: 8,
                    }}>{fmt(p.price)}</div>
                    <span className={`badge ${sold ? 'badge-red' : p.stock < 5 ? 'badge-amber' : 'badge-muted'}`} style={{ fontSize: 10 }}>
                      {sold ? 'Habis' : `${p.stock} stok`}
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* â”€â”€â”€ Kanan: Cart â”€â”€â”€ */}
        <div style={{ position: 'sticky', top: 84 }}>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {/* Cart header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid var(--border)',
              background: 'var(--overlay-soft)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div>
                <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 20 }}>Keranjang</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
                  {cart.length > 0 ? `${totalQty} item dipilih` : 'Belum ada item'}
                </div>
              </div>
              {cart.length > 0 && (
                <button className="btn btn-ghost btn-sm" onClick={() => setCart([])}>Kosongkan</button>
              )}
            </div>

            {/* Cart items */}
            <div style={{ minHeight: 200, maxHeight: 380, overflowY: 'auto', padding: '12px 0' }}>
              {cart.length === 0 ? (
                <div style={{ padding: '60px 24px', textAlign: 'center', color: 'var(--muted)' }}>
                  <div style={{ fontSize: 36, marginBottom: 10, opacity: 0.3 }}>â—ˆ</div>
                  <div style={{ fontSize: 14 }}>Klik produk untuk menambahkan</div>
                </div>
              ) : (
                cart.map((item, i) => (
                  <div key={item.product_id} style={{
                    padding: '12px 24px',
                    borderBottom: i < cart.length - 1 ? '1px solid var(--line-soft)' : 'none',
                    display: 'flex', gap: 12, alignItems: 'center',
                    animation: 'fadeUp 0.2s ease',
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.name}
                      </div>
                      <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--amber)' }}>
                        {fmt(item.price * item.quantity)}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <button
                        onClick={() => setQty(item.product_id, item.quantity - 1)}
                        style={{
                          width: 26, height: 26, borderRadius: 7,
                          background: 'var(--surface2)', border: '1px solid var(--border)',
                          color: 'var(--text)', fontSize: 15, cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'all 0.15s',
                        }}
                      >âˆ’</button>
                      <span style={{ fontFamily: 'var(--mono)', fontWeight: 700, fontSize: 14, minWidth: 20, textAlign: 'center' }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => setQty(item.product_id, item.quantity + 1)}
                        style={{
                          width: 26, height: 26, borderRadius: 7,
                          background: 'var(--surface2)', border: '1px solid var(--border)',
                          color: 'var(--text)', fontSize: 15, cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'all 0.15s',
                        }}
                      >+</button>
                      <button
                        onClick={() => remove(item.product_id)}
                        style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 14, padding: '0 4px', transition: 'color 0.15s' }}
                        onMouseEnter={e => e.target.style.color = 'var(--red)'}
                        onMouseLeave={e => e.target.style.color = 'var(--muted)'}
                      >âœ•</button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Total & Bayar */}
            {cart.length > 0 && (
              <div style={{ padding: '20px 24px', borderTop: '1px solid var(--border)', background: 'var(--overlay-soft-2)' }}>
                {/* Breakdown */}
                <div style={{ marginBottom: 14 }}>
                  {cart.map(item => (
                    <div key={item.product_id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 12, color: 'var(--muted)' }}>{item.name} Ã—{item.quantity}</span>
                      <span style={{ fontSize: 12, fontFamily: 'var(--mono)', color: 'var(--text2)' }}>{fmt(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div style={{ height: 1, background: 'linear-gradient(90deg, rgba(245,158,11,0.3), transparent)', marginBottom: 14 }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                  <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: 18 }}>Total</span>
                  <span style={{
                    fontFamily: 'var(--mono)', fontWeight: 800, fontSize: 22,
                    color: 'var(--green)',
                    textShadow: '0 0 20px rgba(110,231,183,0.3)',
                  }}>{fmt(total)}</span>
                </div>
                <button
                  className="btn btn-primary btn-lg w-full"
                  onClick={pay}
                  disabled={paying}
                  style={{ justifyContent: 'center', fontSize: 15, letterSpacing: '0.02em' }}
                >
                  {paying ? <><span className="spinner" /> Memproses...</> : 'â—ˆ Proses Pembayaran'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* â”€â”€â”€ Struk â”€â”€â”€ */}
      {receipt && (
        <Modal title="Transaksi Berhasil" subtitle={`ID #${receipt.id} Â· ${new Date().toLocaleString('id-ID')}`} onClose={() => setReceipt(null)}>
          <div style={{
            background: 'var(--ink)',
            border: '1px solid var(--border)',
            borderRadius: 14,
            padding: '20px 24px',
            fontFamily: 'var(--mono)',
            marginBottom: 24,
            position: 'relative',
          }}>
            {/* Receipt header */}
            <div style={{ textAlign: 'center', marginBottom: 16, paddingBottom: 14 }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'linear-gradient(135deg, var(--amber), #d97706)',
                color: 'var(--ink)', fontFamily: "'Instrument Serif', serif",
                padding: '4px 16px', borderRadius: 99, fontSize: 18, marginBottom: 8,
              }}>Kasir</div>
              <div style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '0.1em' }}>BUKTI TRANSAKSI</div>
            </div>

            <div style={{ borderTop: '1px dashed var(--border)', paddingTop: 14, marginBottom: 14 }}>
              {receipt.details.map((d, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)', marginBottom: 2 }}>{d.product_name}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>{d.quantity} Ã— {fmt(d.subtotal / d.quantity)}</div>
                  </div>
                  <div style={{ fontWeight: 700, color: 'var(--text2)' }}>{fmt(d.subtotal)}</div>
                </div>
              ))}
            </div>

            <div style={{
              borderTop: '1px dashed var(--border)', paddingTop: 14,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: 20, color: 'var(--text)' }}>TOTAL</span>
              <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--green)' }}>
                {fmt(receipt.total_amount)}
              </span>
            </div>
          </div>

          <button className="btn btn-primary btn-lg w-full" style={{ justifyContent: 'center' }} onClick={() => setReceipt(null)}>
            â—ˆ Transaksi Baru
          </button>
        </Modal>
      )}
    </div>
  )
}
