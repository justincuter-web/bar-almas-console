import { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  collection, onSnapshot, query, where,
  addDoc, serverTimestamp,
} from 'firebase/firestore'
import { db } from '../lib/firebase.js'
import { eur } from '../lib/format.js'
import { CATEGORIE } from '../data/seedProducts.js'

export default function Tavolo() {
  const { numero } = useParams()
  const tavolo = Number(numero)
  const [prodotti, setProdotti] = useState([])
  const [carrello, setCarrello] = useState({})
  const [note, setNote] = useState('')
  const [stato, setStato] = useState('idle')
  const [errMsg, setErrMsg] = useState('')

  useEffect(() => {
    const q = query(collection(db, 'prodotti'), where('attivo', '==', true))
    return onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      list.sort((a, b) => a.nome.localeCompare(b.nome, 'it'))
      setProdotti(list)
    })
  }, [])

  const perCategoria = useMemo(() => {
    const map = {}
    for (const p of prodotti) (map[p.categoria] ||= []).push(p)
    return map
  }, [prodotti])

  const righe = useMemo(() =>
    Object.entries(carrello)
      .map(([id, q]) => {
        const p = prodotti.find((x) => x.id === id)
        if (!p || q <= 0) return null
        return { prodottoId: id, nome: p.nome, prezzo: p.prezzo, quantita: q }
      })
      .filter(Boolean), [carrello, prodotti])

  const totale = righe.reduce((s, r) => s + r.prezzo * r.quantita, 0)
  const totQty = righe.reduce((s, r) => s + r.quantita, 0)

  const inc = (id) => setCarrello((c) => ({ ...c, [id]: (c[id] || 0) + 1 }))
  const dec = (id) => setCarrello((c) => {
    const next = { ...c, [id]: (c[id] || 0) - 1 }
    if (next[id] <= 0) delete next[id]
    return next
  })

  const inviaOrdine = async () => {
    if (righe.length === 0) return
    setStato('sending')
    setErrMsg('')
    try {
      await addDoc(collection(db, 'ordini'), {
        tavolo,
        righe,
        totale,
        stato: 'pending',
        note: note.trim(),
        inviatoAt: serverTimestamp(),
        gestitoAt: null,
      })
      setCarrello({})
      setNote('')
      setStato('sent')
      setTimeout(() => setStato('idle'), 4500)
    } catch (e) {
      console.error(e)
      setErrMsg(e.message || 'Errore invio')
      setStato('error')
    }
  }

  if (!tavolo || tavolo < 1 || tavolo > 12) {
    return (
      <div className="p-8 text-center">
        <h1 className="font-display text-3xl mb-2">Tavolo non valido</h1>
        <p className="text-stone-500 mb-4">Il numero deve essere tra 1 e 12.</p>
        <Link to="/" className="text-amber-700 underline">torna alla home</Link>
      </div>
    )
  }

  return (
    <div className="min-h-full pb-32">
      <header className="bg-stone-900 text-stone-50 px-5 py-6">
        <p className="text-amber-300 text-xs tracking-[0.25em] uppercase">Tavolo</p>
        <h1 className="font-display text-4xl">N° {tavolo}</h1>
        <p className="text-stone-400 text-sm mt-1">
          Scegli i prodotti e invia l'ordine al bancone.
        </p>
      </header>

      {stato === 'sent' && (
        <div className="bg-emerald-50 border-b border-emerald-200 text-emerald-900 px-5 py-3 text-sm">
          ✓ Ordine inviato. Attendi la conferma del bancone.
        </div>
      )}
      {stato === 'error' && (
        <div className="bg-red-50 border-b border-red-200 text-red-900 px-5 py-3 text-sm">
          Errore: {errMsg}
        </div>
      )}

      <main className="px-5 py-6 space-y-8">
        {prodotti.length === 0 && (
          <p className="text-stone-500 text-center py-12">Caricamento menù…</p>
        )}

        {CATEGORIE.map((cat) => {
          const items = perCategoria[cat] || []
          if (items.length === 0) return null
          return (
            <section key={cat}>
              <h2 className="font-display text-2xl text-stone-900 mb-3">{cat}</h2>
              <ul className="divide-y divide-stone-200 border-y border-stone-200">
                {items.map((p) => {
                  const q = carrello[p.id] || 0
                  const esaurito = (p.magazzino ?? 0) === 0
                  return (
                    <li key={p.id} className="flex items-center gap-3 py-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-stone-900">{p.nome}</p>
                        {p.descrizione && (
                          <p className="text-stone-500 text-xs mt-0.5">{p.descrizione}</p>
                        )}
                        <p className="text-stone-700 text-sm tnum mt-0.5">{eur(p.prezzo)}</p>
                        {esaurito && <p className="text-red-600 text-xs mt-0.5">Esaurito</p>}
                      </div>
                      {q === 0 ? (
                        <button
                          onClick={() => inc(p.id)}
                          disabled={esaurito}
                          className="rounded-full bg-stone-900 text-stone-50 text-sm font-medium px-4 py-2 disabled:opacity-40"
                        >
                          Aggiungi
                        </button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button onClick={() => dec(p.id)} className="w-9 h-9 rounded-full border border-stone-300 text-lg leading-none">−</button>
                          <span className="w-6 text-center font-medium tnum">{q}</span>
                          <button onClick={() => inc(p.id)} className="w-9 h-9 rounded-full bg-stone-900 text-stone-50 text-lg leading-none">+</button>
                        </div>
                      )}
                    </li>
                  )
                })}
              </ul>
            </section>
          )
        })}

        {totQty > 0 && (
          <div>
            <label className="block text-sm text-stone-700 mb-1">Note (opzionale)</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="Senza zucchero, latte freddo…"
              className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        )}
      </main>

      {totQty > 0 && (
        <div className="fixed bottom-0 inset-x-0 bg-white border-t border-stone-200 px-5 py-4 shadow-2xl">
          <div className="flex items-center justify-between gap-4 max-w-2xl mx-auto">
            <div>
              <p className="text-stone-500 text-xs">{totQty} {totQty === 1 ? 'articolo' : 'articoli'}</p>
              <p className="font-display text-2xl tnum">{eur(totale)}</p>
            </div>
            <button
              onClick={inviaOrdine}
              disabled={stato === 'sending'}
              className="flex-1 max-w-xs rounded-full bg-amber-600 text-white font-medium px-6 py-3 hover:bg-amber-700 disabled:opacity-50"
            >
              {stato === 'sending' ? 'Invio…' : 'Invia ordine'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
