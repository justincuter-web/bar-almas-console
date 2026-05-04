// Menù completo Bar da Almas (allineato al sito vetrina bar-da-almas-3d)
export const SEED_PRODUCTS = [
  // ── Caffetteria ─────────────────────────────────────────
  { nome: 'Caffè',             descrizione: 'Espresso tradizionale',         prezzo: 1.10, categoria: 'Caffetteria', magazzino: 500 },
  { nome: 'Cappuccino',        descrizione: 'Con latte montato al momento',  prezzo: 1.50, categoria: 'Caffetteria', magazzino: 300 },
  { nome: 'Crema Caffè',       descrizione: 'Fredda o calda',                prezzo: 2.00, categoria: 'Caffetteria', magazzino: 150 },

  // ── Colazione ───────────────────────────────────────────
  { nome: 'Brioche Classica',  descrizione: 'Semplice o con marmellata',     prezzo: 1.20, categoria: 'Colazione',   magazzino: 60 },
  { nome: 'Brioche Farcita',   descrizione: 'Crema, Nutella, misto',         prezzo: 1.20, categoria: 'Colazione',   magazzino: 50 },
  { nome: 'Torta della Nonna', descrizione: 'Ricetta di casa, ogni mattina', prezzo: 2.50, categoria: 'Colazione',   magazzino: 25 },
  { nome: 'Donut / Krapfen',   descrizione: 'Freshly baked',                 prezzo: 1.50, categoria: 'Colazione',   magazzino: 30 },

  // ── Cibo (pranzo) ───────────────────────────────────────
  { nome: 'Panino',            descrizione: 'Crudo&Stracchino, Speck&Brie, Caprese al Pesto, Bresaola&Grana e altri', prezzo: 4.00, categoria: 'Cibo', magazzino: 40 },
  { nome: 'Piadina',           descrizione: '6 farciture a scelta',          prezzo: 4.50, categoria: 'Cibo',         magazzino: 30 },
  { nome: 'Toast',             descrizione: '5 gusti a scelta',              prezzo: 2.50, categoria: 'Cibo',         magazzino: 50 },
  { nome: 'Maxi Toast',        descrizione: '5 gusti a scelta, formato grande', prezzo: 3.50, categoria: 'Cibo',      magazzino: 40 },
  { nome: 'Insalata',          descrizione: 'Nizzarda, Caprese, Mediterranea, Ortolana', prezzo: 5.00, categoria: 'Cibo', magazzino: 25 },
  { nome: 'Menu del Giorno',   descrizione: 'Primo + bibita o calice di vino + caffè', prezzo: 9.00, categoria: 'Cibo', magazzino: 20 },

  // ── Aperitivi (cocktail classici) ───────────────────────
  { nome: 'Spritz',            descrizione: 'Aperol o Campari, Prosecco, seltz',  prezzo: 4.50, categoria: 'Aperitivi', magazzino: 120 },
  { nome: 'Negroni',           descrizione: 'Gin, Campari, vermouth rosso',       prezzo: 6.00, categoria: 'Aperitivi', magazzino: 80 },
  { nome: 'Mojito',            descrizione: 'Rum bianco, menta fresca, lime',     prezzo: 6.00, categoria: 'Aperitivi', magazzino: 80 },
  { nome: 'Piña Colada',       descrizione: 'Rum, cocco, ananas',                 prezzo: 6.00, categoria: 'Aperitivi', magazzino: 60 },
  { nome: 'Cuba Libre',        descrizione: 'Rum, Coca-Cola, lime',               prezzo: 6.00, categoria: 'Aperitivi', magazzino: 60 },
  { nome: 'Gin Tonic',         descrizione: 'Gin premium + tonica artigianale',   prezzo: 7.00, categoria: 'Aperitivi', magazzino: 80 },

  // ── Aperitivi (signature drinks) ────────────────────────
  { nome: 'Almas',             descrizione: 'Vodka fragola, mix sciroppi, gin, ananas — il cocktail della casa', prezzo: 7.00, categoria: 'Aperitivi', magazzino: 50 },
  { nome: 'Serio Smash',       descrizione: 'Gin, lime fresco, menta, tonica artigianale',  prezzo: 7.00, categoria: 'Aperitivi', magazzino: 50 },
  { nome: 'Mura Tropical',     descrizione: 'Rum Havana, ananas, lime, granatina',          prezzo: 7.00, categoria: 'Aperitivi', magazzino: 50 },
  { nome: 'Capo Sour',         descrizione: 'Amaro del Capo, vodka, limone, zucchero di canna', prezzo: 7.00, categoria: 'Aperitivi', magazzino: 50 },
  { nome: 'Barbie',            descrizione: 'Vodka, soft drink rosso, limone, zucchero colorato', prezzo: 6.00, categoria: 'Aperitivi', magazzino: 50 },

  // ── Bevande (analcolici) ────────────────────────────────
  { nome: 'Mojito Analcolico', descrizione: 'Menta, lime, zucchero, seltz',  prezzo: 5.00, categoria: 'Bevande', magazzino: 60 },
  { nome: 'San Francisco',     descrizione: 'Succhi misti, granatina',       prezzo: 5.00, categoria: 'Bevande', magazzino: 60 },
  { nome: 'Virgin Bellini',    descrizione: 'Pesca, Prosecco analcolico',    prezzo: 5.00, categoria: 'Bevande', magazzino: 60 },
  { nome: 'Virgin Colada',     descrizione: 'Ananas, cocco, panna',          prezzo: 5.00, categoria: 'Bevande', magazzino: 60 },
]

export const CATEGORIE = ['Caffetteria', 'Colazione', 'Aperitivi', 'Bevande', 'Cibo']
