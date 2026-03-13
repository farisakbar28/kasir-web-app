import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL
const API_KEY = import.meta.env.VITE_API_KEY

// Client publik — tanpa API key
export const publicClient = axios.create({
  baseURL: BASE_URL,
})

// Client private — dengan API key
export const privateClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'X-API-Key': API_KEY,
  },
})

// ── Product API ──────────────────────────────────────
export const getAllProduk = (name = '') =>
  publicClient.get(`/api/produk${name ? `?name=${name}` : ''}`)

export const getProdukByID = (id) =>
  privateClient.get(`/api/produk/${id}`)

export const createProduk = (data) =>
  publicClient.post('/api/produk', data)

export const updateProduk = (id, data) =>
  privateClient.put(`/api/produk/${id}`, data)

export const deleteProduk = (id) =>
  privateClient.delete(`/api/produk/${id}`)

// ── Checkout API ─────────────────────────────────────
export const checkout = (items) =>
  privateClient.post('/api/checkout', { items })

// ── Report API ────────────────────────────────────────
export const getReportHariIni = () =>
  publicClient.get('/api/report/hari-ini')

export const getReportByDateRange = (start, end) =>
  publicClient.get(`/api/report/hari-ini?start_date=${start}&end_date=${end}`)