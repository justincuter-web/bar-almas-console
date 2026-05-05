import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'

export default function QR() {
  const defaultBase = typeof window !== 'undefined' ? window.location.origin : ''
  const [base, setBase] = useState(defaultBase)
  const [n, setN] = useState(12)

  const tavoli = useMemo(() => Array.from({ length: n }, (_, i) => i + 1), [n])

  const cleanBase = base.replace(/\/+$/, '')

  return (
    <div className="min-h-full bg-stone-100">
      <div className="qr-toolbar bg-stone-900 text-stone-50 px-6 py-4 print:hidden">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-amber-300 text-xs tracking-[0.25em] uppercase">Stampa</p>
            <h1 className="font-display text-2xl">QR Code tavoli</h1>
          </div>
          <div className="flex gap-2 items-center">
            <Link to="/" className="px-4 py-2 rounded-full border border-stone-700 text-sm hover:bg-stone-800">Home</Link>
            <button
              onClick={() => window.print()}
              className="px-4 py-2 rounded-full bg-amber-500 text-stone-900 text-sm font-medium hover:bg-amber-400"
            >
              🖨 Stampa
            </button>
          </div>
        </div>
        <div className="mt-3 grid sm:grid-cols-2 gap-3">
          <label className="block">
            <span className="text-xs text-stone-300">URL base del sito</span>
            <input
              value={base}
              onChange={(e) => setBase(e.target.value)}
              className="w-full mt-1 bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-sm"
              placeholder="https://bar-almas-console-oevy.vercel.app"
            />
          </label>
          <label className="block">
            <span className="text-xs text-stone-300">Numero tavoli</span>
            <input
              type="number" min="1" max="40"
              value={n}
              onChange={(e) => setN(Math.max(1, Math.min(40, Number(e.target.value) || 1)))}
              className="w-full mt-1 bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-sm tnum"
            />
          </label>
        </div>
        <p className="text-stone-400 text-xs mt-2">
          Suggerimento: usa la finestra di stampa per salvare in PDF (opzione "Salva come PDF").
        </p>
      </div>

      <div className="qr-sheet">
        {tavoli.map((t) => {
          const url = `${cleanBase}/tavolo/${t}`
          return (
            <div key={t} className="qr-cell">
              <p className="qr-label">Tavolo</p>
              <p className="qr-num">{t}</p>
              <div className="qr-img">
                <QRCodeSVG value={url} size={180} level="M" includeMargin={false} />
              </div>
              <p className="qr-cta">Scansiona per ordinare</p>
            </div>
          )
        })}
      </div>

      <style>{`
        .qr-sheet {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 6mm;
          padding: 8mm;
          background: white;
        }
        .qr-cell {
          border: 1px dashed #a8a29e;
          border-radius: 8px;
          padding: 6mm 4mm;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 3mm;
          background: white;
          break-inside: avoid;
          page-break-inside: avoid;
        }
        .qr-label {
          font-family: 'Inter', sans-serif;
          font-size: 9px;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: #78716c;
          margin: 0;
        }
        .qr-num {
          font-family: 'Fraunces', serif;
          font-size: 32px;
          font-weight: 600;
          color: #1c1917;
          line-height: 1;
          margin: 0;
        }
        .qr-img {
          padding: 4px;
          background: white;
        }
        .qr-cta {
          font-family: 'Inter', sans-serif;
          font-size: 9px;
          color: #57534e;
          margin: 0;
        }

        @media (max-width: 900px) {
          .qr-sheet { grid-template-columns: repeat(2, 1fr); }
        }

        @media print {
          @page { size: A4; margin: 6mm; }
          body { background: white !important; }
          .qr-sheet {
            padding: 0;
            gap: 5mm;
            grid-template-columns: repeat(4, 1fr);
          }
          .qr-cell { padding: 4mm 3mm; }
        }
      `}</style>
    </div>
  )
}
