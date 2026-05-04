import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  collection, query, where, onSnapshot,
  doc, runTransaction, updateDoc, addDoc, serverTimestamp,
} from 'firebase/firestore'
import { db } from '../lib/firebase.js'
import { eur, dt } from '../lib/format.js'
import { playOrderBeep, unlockAudio } from '../lib/audio.js'

export default function Bancone() {
  const [audioOn, setAudioOn] = useState(false)
  const [ordini, setOrdini] = useState([])
  const [tavoli, setTavoli] = useState([])
  const [busy, setBusy] = useState({})
  const [errore, setErrore] = useState('')
  const seenRef = useRef(new Set())
  const firstSnapshotRef = useRef(true)

  // Ordini in attesa
  useEffect(() => {
    const q = query(collection(db, 'ordini'), where('stato', '==', 'pending'))
    return onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      list.sort((a, b) => (a.inviatoAt?.toMillis?.() || 0) - (b.inviatoAt?.toMillis?.() || 0))

      const newOnes = list.filter((o) => !seenRef.current.has(o.id))
      if (!firstSnapshotRef.current && audioOn && newOnes.length > 0) {
        playOrderBeep()
      }
      list.forEach((o) => seenRef.current.add(o.id))
      firstSnapshotRef.current = false
      setOrdini(list)
    })
  }, [audioOn])

  // Conti aperti
  useEffect(() => {
    return onSnapshot(collection(db, 'tavoli'), (snap) => {
      const list = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((t) => t.aperto)
      list.sort((a, b) => a.tavolo - b.tavolo)
      setTavoli(list)
    })
  }, [])

  const abilitaAudio = () => {
    unlockAudio()
    setAudioOn(true)
  }

  const accetta = async (ordine) => {
    setBusy((b) => ({ ...b, [ordine.id]: true }))
    setErrore('')
    try {
      const tavoloRef = doc(db, 'tavoli', String(ordine.tavolo))
      const ordineRef = doc(db, 'ordini', ordine.id)
      const prodottoRefs = ordine.righe.map((r) => doc(db, 'prodotti', r.prodottoId))

      await runTransaction(db, async (tx) => {
        const tavoloSnap = await tx.get(tavoloRef)
        const ordineSnap = await tx.get(ordineRef)
        const prodottoSnaps = []
        for (const r of prodottoRefs) prodottoSnaps.push(await tx.get(r))

        if (!ordineSnap.exists()) throw new Error('Ordine non trovato')
        if (ordineSnap.data().stato !== 'pending') throw new Error('Ordine già gestito')

        const tavoloData = tavoloSnap.exists() ? tavoloSnap.data() : null
        const erano = (tavoloData?.aperto && tavoloData.righe) || []
        const nuoveRighe = [
          ...erano,
          ...ordine.righe.map((r) => ({
            prodottoId: r.prodottoId,
            nome: r.nome,
            prezzo: r.prezzo,
            quantita: r.quantita,
            aggiuntoAt: Date.now(),
          })),
        ]
        const nuovoTotale = nuoveRighe.reduce((s, r) => s + r.prezzo * r.quantita, 0)

        tx.set(tavoloRef, {
          tavolo: ordine.tavolo,
          righe: nuoveRighe,
          totale: nuovoTotale,
          aperto: true,
          apertoAt: tavoloData?.aperto && tavoloData.apertoAt ? tavoloData.apertoAt : serverTimestamp(),
          chiusoAt: null,
          ultimoOrdineAt: serverTimestamp(),
        })

        prodottoSnaps.forEach((pSnap, i) => {
          if (!pSnap.exists()) return
          const cur = pSnap.data().magazzino ?? 0
          if (cur < 0) return
          const next = Math.max(0, cur - ordine.righe[i].quantita)
          tx.update(prodottoRefs[i], { magazzino: next })
        })

        tx.update(ordineRef, { stato: 'accepted', gestitoAt: serverTimestamp() })
      })
    } catch (e) {
      console.error(e)
      setErrore(e.message || 'Errore accettazione')
    } finally {
      setBusy((b) => {
        const { [ordine.id]: _, ...rest } = b
        return rest
      })
    }
  }

  const rifiuta = async (ordine) => {
    setBusy((b) => ({ ...b, [ordine.id]: true }))
    try {
      await updateDoc(doc(db, 'ordini', ordine.id), {
        stato: 'rejected',
        gestitoAt: serverTimestamp(),
      })
    } catch (e) {
      console.error(e)
      setErrore(e.message || 'Errore rifiuto')
    } finally {
      setBusy((b) => {
        const { [ordine.id]: _, ...rest } = b
        return rest
      })
    }
  }

  const chiudiConto = async (tavolo) => {
    if (!confirm(`Chiudi conto tavolo ${tavolo.tavolo}? Totale ${eur(tavolo.totale)}`)) return
    try {
      await addDoc(collection(db, 'conti'), {
        tavolo: tavolo.tavolo,
        righe: tavolo.righe,
        totale: tavolo.totale,
        apertoAt: tavolo.apertoAt || null,
        chiusoAt: serverTimestamp(),
      })
      await updateDoc(doc(db, 'tavoli', String(tavolo.tavolo)), {
        aperto: false,
        chiusoAt: serverTimestamp(),
        righe: [],
        totale: 0,
      })
    } catch (e) {
      console.error(e)
      setErrore(e.message || 'Errore chiusura conto')
    }
  }

  return (
    <div className="min-h-full">
      <header className="bg-stone-900 text-stone-50 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div>
          <p className="text-amber-300 text-xs tracking-[0.25em] uppercase">Postazione</p>
          <h1 className="font-display text-3xl">Bancone</h1>
        </div>
        <div className="flex gap-2 items-center">
          {!audioOn ? (
            <button onClick={abilitaAudio} className="px-4 py-2 rounded-full bg-amber-500 text-stone-900 text-sm font-medium hover:bg-amber-400">
              🔔 Abilita suoni
            </button>
          ) : (
            <span className="text-emerald-400 text-sm pr-2">🔔 Audio attivo</span>
          )}
          <Link to="/admin" className="px-4 py-2 rounded-full border border-stone-700 text-sm hover:bg-stone-800">Admin</Link>
        </div>
      </header>

      {errore && (
        <div className="bg-red-50 border-b border-red-200 text-red-900 px-6 py-2 text-sm flex justify-between">
          <span>{errore}</span>
          <button onClick={() => setErrore('')} className="underline">chiudi</button>
        </div>
      )}

      <main className="px-6 py-6 grid lg:grid-cols-2 gap-6">
        <section>
          <h2 className="font-display text-2xl mb-3">
            Ordini in arrivo <span className="text-stone-400 tnum">({ordini.length})</span>
          </h2>
          {ordini.length === 0 ? (
            <p className="text-stone-500 text-sm py-6">Nessun ordine in attesa.</p>
          ) : (
            <ul className="space-y-3">
              {ordini.map((o) => (
                <li key={o.id} className="border border-stone-200 rounded-2xl p-4 bg-white shadow-sm">
                  <div className="flex items-baseline justify-between mb-2">
                    <div>
                      <span className="inline-block bg-stone-900 text-stone-50 text-xs font-medium px-2 py-1 rounded-full mr-2">
                        Tavolo {o.tavolo}
                      </span>
                      <span className="text-stone-500 text-xs">{dt(o.inviatoAt)}</span>
                    </div>
                    <span className="font-display text-xl tnum">{eur(o.totale)}</span>
                  </div>
                  <ul className="text-sm text-stone-700 mb-3 space-y-1">
                    {o.righe.map((r, i) => (
                      <li key={i} className="flex justify-between">
                        <span>{r.quantita}× {r.nome}</span>
                        <span className="tnum text-stone-500">{eur(r.prezzo * r.quantita)}</span>
                      </li>
                    ))}
                  </ul>
                  {o.note && (
                    <p className="text-xs text-amber-900 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1.5 mb-3">
                      Nota: {o.note}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => accetta(o)}
                      disabled={!!busy[o.id]}
                      className="flex-1 bg-emerald-600 text-white rounded-xl py-2 font-medium hover:bg-emerald-700 disabled:opacity-50"
                    >
                      Accetta
                    </button>
                    <button
                      onClick={() => rifiuta(o)}
                      disabled={!!busy[o.id]}
                      className="flex-1 bg-stone-100 text-stone-900 border border-stone-300 rounded-xl py-2 font-medium hover:bg-stone-200 disabled:opacity-50"
                    >
                      Rifiuta
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="font-display text-2xl mb-3">
            Conti aperti <span className="text-stone-400 tnum">({tavoli.length})</span>
          </h2>
          {tavoli.length === 0 ? (
            <p className="text-stone-500 text-sm py-6">Nessun tavolo aperto.</p>
          ) : (
            <ul className="space-y-3">
              {tavoli.map((t) => (
                <li key={t.id} className="border border-stone-200 rounded-2xl p-4 bg-white shadow-sm">
                  <div className="flex items-baseline justify-between mb-2">
                    <h3 className="font-display text-xl">Tavolo {t.tavolo}</h3>
                    <span className="font-display text-xl tnum">{eur(t.totale)}</span>
                  </div>
                  <ul className="text-sm text-stone-700 mb-3 space-y-1 max-h-56 overflow-auto pr-1">
                    {t.righe.map((r, i) => (
                      <li key={i} className="flex justify-between">
                        <span>{r.quantita}× {r.nome}</span>
                        <span className="tnum text-stone-500">{eur(r.prezzo * r.quantita)}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => chiudiConto(t)}
                    className="w-full bg-stone-900 text-stone-50 rounded-xl py-2 font-medium hover:bg-stone-800"
                  >
                    Chiudi conto
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>

    </div>
  )
}
