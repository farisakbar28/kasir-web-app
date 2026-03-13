import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import Navbar from './components/Navbar'
import Produk from './pages/Produk'
import Kasir from './pages/Kasir'
import Laporan from './pages/Laporan'

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Produk />} />
          <Route path="/kasir" element={<Kasir />} />
          <Route path="/laporan" element={<Laporan />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}