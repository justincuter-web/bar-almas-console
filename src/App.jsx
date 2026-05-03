import { Routes, Route, Navigate, Link } from 'react-router-dom'
import Tavolo from './pages/Tavolo.jsx'
import Bancone from './pages/Bancone.jsx'
import Admin from './pages/Admin.jsx'
import Seed from './pages/Seed.jsx'

function Home() {
  return (
    <div className="min-h-full flex flex-col items-center justify-center p-8 text-center">
      <p className="text-amber-700 text-xs tracking-[0.3em] uppercase mb-2">Gestione ordini</p>
      <h1 className="font-display text-5xl text-stone-900 mb-1">Bar — QR</h1>
      <p className="text-stone-600 mb-10">Seleziona la sezione</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-md">
        <Link to="/bancone" className="rounded-2xl bg-stone-900 text-stone-50 px-6 py-5 font-medium hover:bg-stone-800 transition">
          Bancone
        </Link>
        <Link to="/admin" className="rounded-2xl border border-stone-300 px-6 py-5 font-medium hover:bg-stone-100 transition">
          Admin
        </Link>
        <Link to="/tavolo/1" className="rounded-2xl border border-stone-300 px-6 py-5 font-medium hover:bg-stone-100 transition">
          Tavolo demo (1)
        </Link>
        <Link to="/seed" className="rounded-2xl border border-amber-300 bg-amber-50 text-amber-900 px-6 py-5 font-medium hover:bg-amber-100 transition">
          Seed iniziale
        </Link>
      </div>
      <p className="text-stone-400 text-xs mt-10 max-w-sm">
        Stampa QR con URL del tipo <code className="bg-stone-100 px-1 rounded">/tavolo/&lt;numero&gt;</code> e attaccali ai tavoli.
      </p>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/tavolo/:numero" element={<Tavolo />} />
      <Route path="/bancone" element={<Bancone />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/seed" element={<Seed />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
