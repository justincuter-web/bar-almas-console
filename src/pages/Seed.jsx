import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  collection, getDocs, addDoc, doc, setDoc,
  deleteDoc, serverTimestamp,
} from 'firebase/firestore'
import { db } from '../lib/firebase.js'
import { SEED_PRODUCTS } from '../data/seedProducts.js'

export default function Seed() {
  const [count, setCount] = useState(null)
  const [busy, setBusy] = useState(false)
  const [log, setLog] = useState([])
  const [done, setDone] = useState(false)

  useEffect(() => {
    getDocs(collection(db, 'prodotti'))
      .then((s) => setCount(s.size))
      .catch(() => setCount(0))
  }, [])

  const aggiungi = (msg) => setLog((l) => [...l, msg])

  const inserisciProdotti = async () => {
    aggiungi(`> Inserimento ${SEED_PRODUCTS.length} prodotti…`)
    for (const p of SEED_PRODUCTS) {
      await addDoc(collection(db, 'prodotti'), {
        ...p,
        attivo: true,
        creato: serverTimestamp(),
      })
      aggiungi(`  + ${p.nome}`)
    }
  }

  const inizializzaTavoli = async () => {
    aggiungi('> Inizializzo 12 tavoli…')
    for (let n = 1; n <= 12; n++) {
      await setDoc(
        doc(db, 'tavoli', String(n)),
        { tavolo: n, righe: [], totale: 0, aperto: false, chiusoAt: null },
        { merge: true },
      )
    }
  }

  const popola = async () => {
    setBusy(true); setLog([]); setDone(false)
    try {
      await inserisciProdotti()
      await inizializzaTavoli()
      aggiungi('✓ Seed completato.')
      setDone(true)
      const s = await getDocs(collection(db, 'prodotti'))
      setCount(s.size)
    } catch (e) {
      console.error(e)
      aggiungi(`✗ Errore: ${e.message}`)
    } finally {
      setBusy(false)
    }
  }

  const ricarica = async () => {
    if (!confirm('Cancellare TUTTI i prodotti esistenti e ricaricare il menù da zero? I conti chiusi e i tavoli aperti restano intatti.')) return
    setBusy(true); setLog([]); setDone(false)
    try {
      aggiungi('> Cancello prodotti esistenti…')
      const snap = await getDocs(collection(db, 'prodotti'))
      for (const d of snap.docs) {
        await deleteDoc(doc(db, 'prodotti', d.id))
        aggiungi(`  − ${d.data().nome || d.id}`)
      }
      await inserisciProdotti()
      await inizializzaTavoli()
      aggiungi('✓ Ricarica completata.')
      setDone(true)
      const s = await getDocs(collection(db, 'prodotti'))
      setCount(s.size)
    } catch (e) {
      console.error(e)
      aggiungi(`✗ Errore: ${e.message}`)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-full p-8 max-w-2xl mx-auto">
      <Link to="/" className="text-stone-500 text-sm">← home</Link>
      <h1 className="font-display text-4xl mt-2 mb-1">Seed iniziale</h1>
      <p className="text-stone-600 mb-6">
        Inserisce i 12 prodotti di partenza e prepara i 20 tavoli su Firestore.
        Eseguilo <strong>una sola volta</strong>: rilanciandolo verrebbero <em>aggiunti</em> duplicati ai prodotti.
      </p>

      <div className="bg-white border border-stone-200 rounded-2xl p-5 mb-6">
        <p className="text-sm text-stone-700">
          Prodotti già presenti su Firestore:{' '}
          <strong className="tnum">{count === null ? '…' : count}</strong>
        </p>
      </div>

      {count > 0 && !done && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-amber-900 text-sm mb-6">
          Sono già presenti <strong>{count}</strong> prodotti.
          Procedendo verrebbero <strong>duplicati</strong>. Vai su{' '}
          <Link to="/admin" className="underline">Admin</Link> per ripulirli prima, oppure conferma sotto.
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          onClick={popola}
          disabled={busy}
          className="bg-stone-900 text-stone-50 rounded-xl px-6 py-3 font-medium disabled:opacity-50"
        >
          {busy ? 'In corso…' : 'Esegui seed (aggiunge)'}
        </button>
        <button
          onClick={ricarica}
          disabled={busy}
          className="bg-red-600 text-white rounded-xl px-6 py-3 font-medium disabled:opacity-50"
        >
          {busy ? 'In corso…' : '⚠ Cancella tutto e ricarica'}
        </button>
      </div>
      <p className="text-stone-500 text-xs mt-2">
        "Aggiunge" inserisce i prodotti senza toccare gli esistenti (rischio duplicati).
        "Cancella tutto e ricarica" elimina prima TUTTI i prodotti, poi inserisce il menù pulito.
      </p>

      {log.length > 0 && (
        <pre className="mt-6 bg-stone-900 text-stone-100 text-xs rounded-xl p-4 max-h-80 overflow-auto whitespace-pre-wrap font-mono">
          {log.join('\n')}
        </pre>
      )}

      {done && (
        <div className="mt-6 flex flex-wrap gap-3 text-sm">
          <Link to="/admin" className="underline text-stone-700">→ Admin</Link>
          <Link to="/bancone" className="underline text-stone-700">→ Bancone</Link>
          <Link to="/tavolo/1" className="underline text-stone-700">→ Tavolo 1</Link>
        </div>
      )}
    </div>
  )
}
