export const PRODUCT_ADMIN_SCHEMA_V2 = [
  { key: 'rolle', label: 'Rolle i porteføljen', type: 'text', placeholder: 'Kjerneeksponering / stabilisator / satellitt' },
  { key: 'benchmark', label: 'Benchmark', type: 'text', placeholder: 'MSCI World / STIBOR 3M + 4%' },
  { key: 'risikonivaa', label: 'Risikonivå', type: 'select', options: ['Lav', 'Moderat', 'Høy'] },
  { key: 'likviditet', label: 'Likviditet', type: 'select', options: ['Likvid', 'Middels', 'Illikvid'] },
  { key: 'forventetAvkastning', label: 'Forventet avkastning p.a.', type: 'number', step: '0.1' },
  { key: 'forventetYield', label: 'Forventet yield p.a.', type: 'number', step: '0.1' },
  { key: 'pitchKort', label: 'Kort pitch', type: 'textarea', rows: 2, placeholder: 'Kort investorpitch som kan brukes i rapporten' },
  { key: 'investeringscase', label: 'Investeringscase', type: 'textarea', rows: 4, placeholder: 'Hvorfor produktet er med i porteføljen' },
  { key: 'whyIncluded', label: 'Hvorfor inkludert', type: 'textarea', rows: 3, placeholder: 'Hvordan produktet styrker totalporteføljen' },
  { key: 'keyRisks', label: 'Viktige risikofaktorer', type: 'textarea', rows: 3, placeholder: 'Hva rådgiver bør være oppmerksom på' },
  { key: 'chartPreference', label: 'Foretrukket diagram', type: 'select', options: ['auto', 'regioner', 'sektorer', 'holdings', 'historikk', 'yield'] },
  { key: 'slideCount', label: 'Antall produktslides', type: 'select', options: ['1', '2', '3'] },
]
