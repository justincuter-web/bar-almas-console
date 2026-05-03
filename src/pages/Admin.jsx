import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  collection, onSnapshot, addDoc, deleteDoc, updateDoc, doc, serverTimestamp,
} from 'firebase/firestore'
import { db } from '../lib/firebase.js'
import { eur, dtFull } from '../lib/format.js'
import { CATEGORIE } from '../data/seedProducts.js'

export default function Admin() {
  const [tab, setTab] = useState('prodotti')
  const [prodotti, setProdotti] = useState([])
  const [conti, setConti] = useState([])

  useEffect(() => {
    const u1 = onSnapshot(collection(db, 'prodotti'), (s) => {
      const list = s.docs.map((d) => ({ id: d.id, ...d.data() }))
      list.sort((a, b) =>
        (a.categoria || '').localeCompare(b.categoria || '', 'it') ||
        a.nome.localeCompare(b.nome, 'it')
      )
      setProdotti(list)
    })
    const u2 = onSnapshot(collection(db, 'conti'), (s) => {
      setConti(s.docs.map((d) => ({ id: d.id, ...d.data() })))
    })
    return () => { u1(); u2() }
  }, [])

  return (
    <div className="min-h-full">
      <header className="bg-stone-900 text-stone-50 px-6 py-4 flex items-center justify-between">
        <div>
          <p className="text-amber-300 text-xs tracking-[0.25em] uppercase">Gestione</p>
          <h1 className="font-display text-3xl">Admin</h1>
        </div>
        <div className="flex gap-2">
          <Link to="/bancone" className="px-4 py-2 rounded-full border border-stone-700 text-sm hover:bg-stone-800">Bancone</Link>
          <Link to="/" className="px-4 py-2 rounded-full border border-stone-700 text-sm hover:bg-stone-800">Home</Link>
        </div>
      </header>

      <nav className="border-b border-stone-200 px-6 flex gap-1 bg-white">
        {[
          ['prodotti', 'Prodotti'],
          ['magazzino', 'Magazzino'],
          ['statistiche', 'Statistiche'],
        ].map(([k, label]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`px-4 py-3 text-sm font-medium border-b-2 -mb-px transition ${
              tab === k
                ? 'border-stone-900 text-stone-900'
                : 'border-transparent text-stone-500 hover:text-stone-700'
            }`}
          >
            {label}
          </button>
        ))}
      </nav>

      <main className="px-6 py-6">
        {tab === 'prodotti' && <Prodotti prodotti={prodotti} />}
        {tab === 'magazzino' && <Magazzino prodotti={prodotti} />}
        {tab === 'statistiche' && <Statistiche conti={conti} />}
      </main>
    </div>
  )
}

function Prodotti({ prodotti }) {
  const empty = { nome: '', prezzo: '', categoria: 'Caffetteria', magazzino: '0', attivo: true }
  const [form, setForm] = useState(empty)
  const [busy, setBusy] = useState(false)
  const [editing, setEditing] = useState(null)

  const reset = () => { setForm(empty); setEditing(null) }

  const submit = async (e) => {
    e.preventDefault()
    if (!form.nome.trim() || form.prezzo === '') return
    setBusy(true)
    const data = {
      nome: form.nome.trim(),
      prezzo: Number(form.prezzo),
      categoria: form.categoria,
      magazzino: Number(form.magazzino),
      attivo: !!form.attivo,
    }
    try {
      if (editing) {
        await updateDoc(doc(db, 'prodotti', editing), data)
      } else {
        await addDoc(collection(db, 'prodotti'), { ...data, creato: serverTimestamp() })
      }
      reset()
    } finally {
      setBusy(false)
    }
  }

  const startEdit = (p) => {
    setEditing(p.id)
    setForm({
      nome: p.nome,
      prezzo: String(p.prezzo),
      categoria: p.categoria,
      magazzino: String(p.magazzino ?? 0),
      attivo: !!p.attivo,
    })
  }

  const elimina = async (id) => {
    if (!confirm('Eliminare il prodotto?')) return
    await deleteDoc(doc(db, 'prodotti', id))
    if (editing === id) reset()
  }

  const toggle = async (p) => {
    await updateDoc(doc(db, 'prodotti', p.id), { attivo: !p.attivo })
  }

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <form onSubmit={submit} className="lg:col-span-1 bg-white border border-stone-200 rounded-2xl p-5 space-y-3 self-start">
        <h3 className="font-display text-xl">{editing ? 'Modifica prodotto' : 'Nuovo prodotto'}</h3>
        <div>
          <label className="text-xs text-stone-600">Nome</label>
          <input
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
            className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-stone-600">Prezzo €</label>
            <input
              type="number" step="0.10" min="0"
              value={form.prezzo}
              onChange={(e) => setForm({ ...form, prezzo: e.target.value })}
              className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm tnum"
              required
            />
          </div>
          <div>
            <label className="text-xs text-stone-600">Magazzino</label>
            <input
              type="number" min="0"
              value={form.magazzino}
              onChange={(e) => setForm({ ...form, magazzino: e.target.value })}
              className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm tnum"
            />
          </div>
        </div>
        <div>
          <label className="text-xs text-stone-600">Categoria</label>
          <select
            value={form.categoria}
            onChange={(e) => setForm({ ...form, categoria: e.target.value })}
            className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm bg-white"
          >
            {CATEGORIE.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.attivo}
            onChange={(e) => setForm({ ...form, attivo: e.target.checked })}
          />
          Attivo (visibile sul menù)
        </label>
        <div className="flex gap-2 pt-2">
          <button type="submit" disabled={busy}
            className="flex-1 bg-stone-900 text-stone-50 rounded-xl py-2 font-medium disabled:opacity-50">
            {editing ? 'Salva' : 'Aggiungi'}
          </button>
          {editing && (
            <button type="button" onClick={reset} className="px-4 border border-stone-300 rounded-xl">
              Annulla
            </button>
          )}
        </div>
      </form>

      <div className="lg:col-span-2 overflow-x-auto">
        <table className="w-full text-sm bg-white border border-stone-200 rounded-2xl overflow-hidden">
          <thead className="bg-stone-100 text-stone-600 text-xs uppercase">
            <tr>
              <th className="text-left px-4 py-2">Nome</th>
              <th className="text-left px-4 py-2">Categoria</th>
              <th className="text-right px-4 py-2">Prezzo</th>
              <th className="text-right px-4 py-2">Magazzino</th>
              <th className="text-center px-4 py-2">Attivo</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {prodotti.map((p) => (
              <tr key={p.id} className="border-t border-stone-100">
                <td className="px-4 py-2">
                  <span className={p.attivo ? '' : 'line-through text-stone-400'}>{p.nome}</span>
                </td>
                <td className="px-4 py-2 text-stone-500">{p.categoria}</td>
                <td className="px-4 py-2 text-right tnum">{eur(p.prezzo)}</td>
                <td className="px-4 py-2 text-right tnum">{p.magazzino ?? 0}</td>
                <td className="px-4 py-2 text-center">
                  <input type="checkbox" checked={!!p.attivo} onChange={() => toggle(p)} />
                </td>
                <td className="px-4 py-2 text-right space-x-2 whitespace-nowrap">
                  <button onClick={() => startEdit(p)} className="text-stone-700 underline text-xs">modifica</button>
                  <button onClick={() => elimina(p.id)} className="text-red-600 underline text-xs">elimina</button>
                </td>
              </tr>
            ))}
            {prodotti.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-stone-500">
                  Nessun prodotto. Vai su <Link to="/seed" className="underline">Seed</Link>.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Magazzino({ prodotti }) {
  const aggiorna = async (id, magazzino) => {
    const v = Number(magazzino)
    if (Number.isNaN(v) || v < 0) return
    await updateDoc(doc(db, 'prodotti', id), { magazzino: v })
  }
  const totale = prodotti.reduce((s, p) => s + (p.magazzino ?? 0), 0)
  const sotto = prodotti.filter((p) => (p.magazzino ?? 0) < 10)

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-white border border-stone-200 rounded-2xl p-5">
          <p className="text-xs text-stone-500 uppercase tracking-wider">Totale articoli</p>
          <p className="font-display text-3xl tnum mt-1">{totale}</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
          <p className="text-xs text-amber-700 uppercase tracking-wider">Sotto soglia (&lt; 10)</p>
          <p className="font-display text-3xl tnum mt-1">{sotto.length}</p>
          {sotto.length > 0 && (
            <p className="text-xs text-stone-700 mt-1">{sotto.map((p) => p.nome).join(', ')}</p>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm bg-white border border-stone-200 rounded-2xl overflow-hidden">
          <thead className="bg-stone-100 text-stone-600 text-xs uppercase">
            <tr>
              <th className="text-left px-4 py-2">Prodotto</th>
              <th className="text-left px-4 py-2">Categoria</th>
              <th className="text-right px-4 py-2 w-40">Magazzino</th>
            </tr>
          </thead>
          <tbody>
            {prodotti.map((p) => (
              <tr key={p.id} className="border-t border-stone-100">
                <td className="px-4 py-2">{p.nome}</td>
                <td className="px-4 py-2 text-stone-500">{p.categoria}</td>
                <td className="px-4 py-2 text-right">
                  <input
                    key={p.magazzino}
                    type="number"
                    min="0"
                    defaultValue={p.magazzino ?? 0}
                    onBlur={(e) => aggiorna(p.id, e.target.value)}
                    className="w-24 border border-stone-300 rounded-lg px-2 py-1 text-right tnum"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Statistiche({ conti }) {
  const oggi = useMemo(() => {
    const start = new Date()
    start.setHours(0, 0, 0, 0)
    return conti.filter((c) => {
      const d = c.chiusoAt?.toDate?.()
      return d && d >= start
    })
  }, [conti])

  const incassoOggi = oggi.reduce((s, c) => s + (c.totale || 0), 0)
  const incassoTotale = conti.reduce((s, c) => s + (c.totale || 0), 0)

  const topProdotti = useMemo(() => {
    const map = {}
    for (const c of conti) {
      for (const r of c.righe || []) {
        const k = r.nome
        if (!map[k]) map[k] = { nome: k, qty: 0, valore: 0 }
        map[k].qty += r.quantita
        map[k].valore += r.prezzo * r.quantita
      }
    }
    return Object.values(map).sort((a, b) => b.qty - a.qty).slice(0, 10)
  }, [conti])

  const ultimi = useMemo(
    () => [...conti]
      .sort((a, b) => (b.chiusoAt?.toMillis?.() || 0) - (a.chiusoAt?.toMillis?.() || 0))
      .slice(0, 15),
    [conti]
  )

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-3 gap-4">
        <Card label="Incasso oggi" value={eur(incassoOggi)} />
        <Card label="Conti chiusi oggi" value={oggi.length} />
        <Card label="Incasso totale" value={eur(incassoTotale)} />
      </div>

      <div>
        <h3 className="font-display text-xl mb-3">Prodotti più venduti</h3>
        <table className="w-full text-sm bg-white border border-stone-200 rounded-2xl overflow-hidden">
          <thead className="bg-stone-100 text-stone-600 text-xs uppercase">
            <tr>
              <th className="text-left px-4 py-2">Prodotto</th>
              <th className="text-right px-4 py-2">Quantità</th>
              <th className="text-right px-4 py-2">Valore</th>
            </tr>
          </thead>
          <tbody>
            {topProdotti.map((p) => (
              <tr key={p.nome} className="border-t border-stone-100">
                <td className="px-4 py-2">{p.nome}</td>
                <td className="px-4 py-2 text-right tnum">{p.qty}</td>
                <td className="px-4 py-2 text-right tnum">{eur(p.valore)}</td>
              </tr>
            ))}
            {topProdotti.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-stone-500">
                  Nessun conto chiuso ancora.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div>
        <h3 className="font-display text-xl mb-3">Ultimi conti</h3>
        <ul className="bg-white border border-stone-200 rounded-2xl divide-y divide-stone-100">
          {ultimi.map((c) => (
            <li key={c.id} className="px-4 py-3 flex justify-between text-sm">
              <span>
                Tavolo {c.tavolo}{' '}
                <span className="text-stone-400 text-xs ml-2">{dtFull(c.chiusoAt)}</span>
              </span>
              <span className="tnum">{eur(c.totale)}</span>
            </li>
          ))}
          {ultimi.length === 0 && (
            <li className="px-4 py-6 text-center text-stone-500 text-sm">—</li>
          )}
        </ul>
      </div>
    </div>
  )
}

function Card({ label, value }) {
  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-5">
      <p className="text-xs text-stone-500 uppercase tracking-wider">{label}</p>
      <p className="font-display text-3xl tnum mt-1">{value}</p>
    </div>
  )
}
