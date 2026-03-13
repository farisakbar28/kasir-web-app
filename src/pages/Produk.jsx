import { useState, useEffect, useCallback } from 'react'
import { getAllProduk, createProduk, updateProduk, deleteProduk } from '../api/client'
import Modal from '../components/Modal'
import Toast from '../components/Toast'

const EMPTY = { name: '', price: '', stock: '' }
const fmt = (n) => 'Rp\u00a0' + Number(n).toLocaleString('id-ID')

function FormField({ label, children }) {
  return (
    <div>
      <label className="input-label">{label}</label>
      {children}
    </div>
  )
}

export default function Produk() {
  const [produk,   setProduk]   = useState([])
  const [loading,  setLoading]  = useState(true)
  const [search,   setSearch]   = useState('')
  const [modal,    setModal]    = useState(null)
  const [selected, setSelected] = useState(null)
  const [form,     setForm]     = useState(EMPTY)
  const [saving,   setSaving]   = useState(false)
  const [toast,    setToast]    = useState(null)

  const toast$ = (msg, type = 'success') => setToast({ message: msg, type })

  const load = useCallback(async () => {
    setLoading(true)
    try { setProduk((await getAllProduk(search)).data) }
    catch { toast$('Gagal memuat produk', 'error') }
    finally { setLoading(false) }
  }, [search])

  useEffect(() => {
    const t = setTimeout(load, 380)
    return () => clearTimeout(t)
  }, [load])

  const openAdd  = () => { setForm(EMPTY); setModal('add') }
  const openEdit = p  => { setSelected(p); setForm({ name: p.name, price: String(p.price), stock: String(p.stock) }); setModal('edit') }
  const openDel  = p  => { setSelected(p); setModal('delete') }
  const close    = () => { setModal(null); setSelected(null); setForm(EMPTY) }
  const f        = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const save = async () => {
    if (!form.name.trim() || !form.price || !form.stock) { toast$('Semua field wajib diisi', 'error'); return }
    setSaving(true)
    const body = { name: form.name.trim(), price: +form.price, stock: +form.stock }
    try {
      modal === 'add' ? await createProduk(body) : await updateProduk(selected.id, body)
      toast$(modal === 'add' ? 'Produk ditambahkan' : 'Produk diperbarui')
      close(); load()
    } catch (e) { toast$(e.response?.data || 'Gagal menyimpan', 'error') }
    finally { setSaving(false) }
  }

  const del = async () => {
    setSaving(true)
    try { await deleteProduk(selected.id); toast$('Produk dihapus'); close(); load() }
    catch (e) { toast$(e.response?.data || 'Gagal menghapus', 'error') }
    finally { setSaving(false) }
  }

  return (
    <div className="page">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="page-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
        <div>
          <div className="page-eyebrow">Manajemen</div>
          <h1 className="page-title">Daftar Produk</h1>
          <p className="page-sub">{loading ? '—' : `${produk.length} produk terdaftar`}</p>
        </div>
        <button className="btn btn-primary btn-lg" onClick={openAdd}>
          <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> Produk Baru
        </button>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 20, position: 'relative' }}>
        <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', fontSize: 16 }}>⌕</span>
        <input
          className="input"
          style={{ paddingLeft: 42, fontSize: 15 }}
          placeholder="Cari nama produk..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {search && (
          <button onClick={() => setSearch('')} style={{
            position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
            background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 16,
          }}>✕</button>
        )}
      </div>

      {/* Table */}
      <div className="card card-flush">
        {loading ? (
          <div style={{ padding: '60px 0', textAlign: 'center' }}>
            <div className="spinner" style={{ width: 28, height: 28, borderWidth: 3, margin: '0 auto 14px' }} />
            <div style={{ color: 'var(--muted)', fontSize: 13 }}>Memuat data...</div>
          </div>
        ) : produk.length === 0 ? (
          <div style={{ padding: '70px 0', textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 14, opacity: 0.2 }}>▦</div>
            <div style={{ color: 'var(--muted)', fontSize: 15 }}>
              {search ? `Tidak ada hasil untuk "${search}"` : 'Belum ada produk'}
            </div>
            {!search && (
              <button className="btn btn-outline-amber" style={{ marginTop: 16 }} onClick={openAdd}>
                Tambah produk pertama
              </button>
            )}
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nama Produk</th>
                  <th>Harga</th>
                  <th>Stok</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {produk.map((p, i) => (
                  <tr key={p.id} style={{ animation: `fadeUp 0.3s ease ${i * 30}ms both` }}>
                    <td>
                      <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--muted)' }}>
                        #{String(p.id).padStart(3, '0')}
                      </span>
                    </td>
                    <td><span style={{ fontWeight: 600 }}>{p.name}</span></td>
                    <td>
                      <span style={{ fontFamily: 'var(--mono)', fontWeight: 700, color: 'var(--amber)', fontSize: 14 }}>
                        {fmt(p.price)}
                      </span>
                    </td>
                    <td><span style={{ fontFamily: 'var(--mono)', fontWeight: 600 }}>{p.stock}</span></td>
                    <td>
                      {p.stock === 0
                        ? <span className="badge badge-red">Habis</span>
                        : p.stock < 5
                        ? <span className="badge badge-amber">Menipis</span>
                        : <span className="badge badge-green">Tersedia</span>}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(p)}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => openDel(p)}>Hapus</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Add/Edit */}
      {(modal === 'add' || modal === 'edit') && (
        <Modal
          title={modal === 'add' ? 'Tambah Produk' : 'Edit Produk'}
          subtitle={modal === 'edit' ? `Mengubah: ${selected?.name}` : 'Isi detail produk baru'}
          onClose={close}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <FormField label="Nama Produk">
              <input className="input" placeholder="mis. Indomie Goreng Jumbo" value={form.name} onChange={e => f('name', e.target.value)} autoFocus />
            </FormField>
            <FormField label="Harga (Rupiah)">
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', fontSize: 13, fontFamily: 'var(--mono)' }}>Rp</span>
                <input className="input" style={{ paddingLeft: 36 }} type="number" placeholder="3500" value={form.price} onChange={e => f('price', e.target.value)} />
              </div>
            </FormField>
            <FormField label="Stok Awal">
              <input className="input" type="number" placeholder="100" value={form.stock} onChange={e => f('stock', e.target.value)} />
            </FormField>
            {form.name && form.price && (
              <div style={{ background: 'var(--amber-dim)', border: '1px solid rgba(245,158,11,0.15)', borderRadius: 10, padding: '12px 16px' }}>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700 }}>Preview</div>
                <div style={{ fontWeight: 700, color: 'var(--text)' }}>{form.name}</div>
                <div style={{ fontFamily: 'var(--mono)', color: 'var(--amber)', fontSize: 15 }}>{fmt(form.price || 0)}</div>
              </div>
            )}
            <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
              <button className="btn btn-ghost w-full" onClick={close}>Batal</button>
              <button className="btn btn-primary w-full" onClick={save} disabled={saving}>
                {saving ? <span className="spinner" /> : modal === 'add' ? 'Tambah Produk' : 'Simpan'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal Delete */}
      {modal === 'delete' && (
        <Modal title="Hapus Produk" subtitle="Tindakan ini tidak dapat dibatalkan" onClose={close}>
          <div style={{ background: 'var(--red-dim)', border: '1px solid rgba(252,165,165,0.15)', borderRadius: 12, padding: '16px 20px', marginBottom: 24 }}>
            <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 4 }}>Produk yang akan dihapus:</div>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 22, color: 'var(--text)' }}>{selected?.name}</div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-ghost w-full" onClick={close}>Batalkan</button>
            <button className="btn btn-danger w-full" onClick={del} disabled={saving}>
              {saving ? <span className="spinner" /> : 'Ya, Hapus'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}