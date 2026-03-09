import PptxGenJSImport from 'pptxgenjs';

const PptxGenJS = typeof PptxGenJSImport === 'function'
  ? PptxGenJSImport
  : (PptxGenJSImport?.default || PptxGenJSImport?.PptxGenJS);

const COLORS = {
  navy: '0D2240',
  blue: '4C84C4',
  salmon: 'D4886B',
  teal: '0F9888',
  green: '1F8A3B',
  gold: 'B8860B',
  text: '1E293B',
  muted: '64748B',
  light: 'F8FAFC',
  line: 'D9E2EC',
  white: 'FFFFFF',
  danger: 'B42318'
};

const PRODUCT_LABELS = {
  'global-core-active': 'Pensum Global Core Active',
  'global-edge': 'Pensum Global Edge',
  basis: 'Pensum Basis',
  'global-hoyrente': 'Pensum Global Høyrente',
  'nordisk-hoyrente': 'Pensum Nordisk Høyrente',
  'norge-a': 'Pensum Norge A',
  'energy-a': 'Pensum Global Energy A',
  'banking-d': 'Pensum Nordic Banking Sector D',
  'financial-d': 'Pensum Financial Opportunity Fund D'
};

const PRODUCT_META = {
  'global-core-active': {
    title: 'Global kjerneeksponering',
    subtitle: 'Bred global aksjeportefølje med aktiv fondsseleksjon',
    role: 'Kjernebyggestein i aksjedelen',
    pitch: 'Gir bred global aksjeeksponering og fungerer som hovedmotor i porteføljens aksjedel.',
    case: 'Kombinerer kvalitet, geografi og forvalterdiversifisering i én samlet løsning.',
    why: 'Passer godt som basiseksponering når målet er robust global allokering over tid.',
    risk: 'Verdien vil svinge med globale aksjemarkeder og valutautvikling.',
    benchmark: 'MSCI World / bred global aksjereferanse',
    expectedReturn: 9.0,
    expectedYield: 1.8,
    preferredChart: 'region-sector'
  },
  'global-edge': {
    title: 'Global offensiv satellitt',
    subtitle: 'Mer aktiv og spisset global aksjeløsning',
    role: 'Satellitt for meravkastning i aksjedelen',
    pitch: 'Supplerer kjerneporteføljen med mer konsentrerte og aktive globale ideer.',
    case: 'Brukes når man ønsker høyere aktiv andel og flere tydelige forvalterbets.',
    why: 'Kan øke diversifiseringen på forvalterstil og gi meravkastningspotensial.',
    risk: 'Høyere stil- og faktoravvik enn brede globale indekser.',
    benchmark: 'Global aktiv aksjereferanse',
    expectedReturn: 9.5,
    expectedYield: 1.4,
    preferredChart: 'region-sector'
  },
  basis: {
    title: 'Balansert totalportefølje',
    subtitle: 'Kombinasjon av aksjer og renter i én løsning',
    role: 'Helhetlig blandet byggestein',
    pitch: 'Gir en ferdig sammensatt blanding av aksjer, renter og utvalgte spesialmandater.',
    case: 'Egnet når man ønsker en enkel, balansert løsning med moderat risikonivå.',
    why: 'Kan fungere som selvstendig løsning eller som stabil kjerne i en bredere portefølje.',
    risk: 'Lavere forventet avkastning enn rene aksjeløsninger, men også lavere svingninger.',
    benchmark: 'Blandet referanse / 50-50 aksjer-renter',
    expectedReturn: 7.0,
    expectedYield: 3.0,
    preferredChart: 'underlying'
  },
  'global-hoyrente': {
    title: 'Global rente- og kontantstrømmotor',
    subtitle: 'Seleksjon av globale high yield- og kredittfond',
    role: 'Rentedel med fokus på løpende avkastning',
    pitch: 'Skal bidra med løpende renteinntekter og lavere volatilitet enn aksjer.',
    case: 'Bygger robusthet i porteføljen og gir kontantstrøm i et mer defensivt segment.',
    why: 'Passer som stabilisator mot aksjer og som bærer av løpende yield.',
    risk: 'Kredittrisiko og spreadutvidelser kan gi kursfall i stressperioder.',
    benchmark: 'Global high yield / kredittreferanse',
    expectedReturn: 7.5,
    expectedYield: 7.0,
    preferredChart: 'underlying'
  },
  'nordisk-hoyrente': {
    title: 'Nordisk høyrente',
    subtitle: 'Kredittportefølje med nordisk fokus',
    role: 'Regional rentedel med løpende avkastning',
    pitch: 'Gir eksponering mot nordisk kredittmarked gjennom utvalgte fond.',
    case: 'Egnet når man ønsker mer regional kredittkompetanse og løpende yield.',
    why: 'Kan være et godt supplement til globale renteløsninger.',
    risk: 'Likviditet og kredittspread kan påvirke avkastningen i urolige perioder.',
    benchmark: 'Nordisk high yield / kredittreferanse',
    expectedReturn: 7.0,
    expectedYield: 6.5,
    preferredChart: 'underlying'
  },
  'norge-a': {
    title: 'Norske aksjer',
    subtitle: 'Aktivt norsk aksjefond',
    role: 'Hjemmemarkeds- og stock-picking-eksponering',
    pitch: 'Gir aktiv eksponering mot norske børsnoterte selskaper og sektorer.',
    case: 'Brukes for å utnytte lokal markedskunnskap og tilføre tydelige norske idéer.',
    why: 'Kan gi god diversifisering relativt til globale porteføljer og passer godt i NOK-porteføljer.',
    risk: 'Mer konsentrert marked og høyere sektoravhengighet enn global eksponering.',
    benchmark: 'OSEBX / norsk aksjereferanse',
    expectedReturn: 10.0,
    expectedYield: 2.5,
    preferredChart: 'underlying'
  },
  'energy-a': {
    title: 'Tematisk energi-eksponering',
    subtitle: 'Konsentrert energirelatert mandat',
    role: 'Tematisk satellitt',
    pitch: 'Gir målrettet eksponering mot energi, råvarer og tilhørende verdikjeder.',
    case: 'Kan bidra med meravkastningspotensial når energisektoren er attraktivt priset.',
    why: 'Passer som mindre satellittandel i en bredere portefølje.',
    risk: 'Kan svinge betydelig og er sensitiv for råvarepriser og geopolitikk.',
    benchmark: 'Energi-/råvareorientert aksjereferanse',
    expectedReturn: 11.0,
    expectedYield: 3.5,
    preferredChart: 'underlying'
  },
  'banking-d': {
    title: 'Nordisk banksektor',
    subtitle: 'Sektorspesialist mot banker og finans',
    role: 'Sektorsatellitt',
    pitch: 'Gir eksponering mot nordiske banker og finansinstitusjoner med tydelig sektorvinkel.',
    case: 'Kan brukes når man ønsker særskilt eksponering mot en sektor med attraktive utbytter og soliditet.',
    why: 'Gir en mer spesialisert og målrettet eksponering enn brede nordiske aksjefond.',
    risk: 'Sektorkonsentrasjon og regulatoriske endringer kan gi høy volatilitet.',
    benchmark: 'Nordisk bank-/finansreferanse',
    expectedReturn: 10.0,
    expectedYield: 4.0,
    preferredChart: 'underlying'
  },
  'financial-d': {
    title: 'Finansiell kredittspesialist',
    subtitle: 'Rente-/kredittmandat med finanssektor som fokus',
    role: 'Spesialist i rentedelen',
    pitch: 'Gir målrettet kreditt- og renteeksponering mot finansrelaterte utstedere.',
    case: 'Kan bidra med attraktiv løpende avkastning fra et avgrenset og analysekrevende segment.',
    why: 'Passer som supplement i rentedelen for å øke spesialisering og yield.',
    risk: 'Kredittevent, likviditet og sektorspesifikk risiko kan påvirke utviklingen.',
    benchmark: 'Finansiell kreditt / high yield referanse',
    expectedReturn: 8.0,
    expectedYield: 7.5,
    preferredChart: 'underlying'
  }
};

function n(v, fb = 0) {
  const x = Number(v);
  return Number.isFinite(x) ? x : fb;
}

function pct(v, digits = 1) {
  return `${n(v).toFixed(digits)}%`;
}

function currency(v) {
  return new Intl.NumberFormat('nb-NO', { maximumFractionDigits: 0 }).format(n(v));
}

function safeFilename(text = 'Kunde') {
  return String(text || 'Kunde').replace(/\s+/g, '_').replace(/[^A-Za-z0-9_\-.æøåÆØÅ]/g, '');
}

function formatDateLabel(dateStr = '') {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('nb-NO');
}

function pickProducts(payload) {
  const selectedIds = Array.isArray(payload.produkterIBruk) ? payload.produkterIBruk : [];
  const exposureMap = payload.produktEksponering || {};
  const products = Array.isArray(payload.pensumProdukter) ? payload.pensumProdukter : [];
  const allokMap = new Map((Array.isArray(payload.pensumAllokering) ? payload.pensumAllokering : []).map((p) => [p.id, n(p.vekt)]));
  const byId = new Map(products.map((p) => [p.id, p]));
  const selected = (selectedIds.length ? selectedIds : products.map((p) => p.id))
    .map((id) => {
      const raw = byId.get(id) || { id, navn: PRODUCT_LABELS[id] || id };
      const meta = PRODUCT_META[id] || {};
      const exposure = exposureMap[id] || {};
      return {
        ...meta,
        ...raw,
        id,
        navn: raw.navn || PRODUCT_LABELS[id] || id,
        vekt: n(raw.vekt, allokMap.get(id) ?? 0),
        exposure,
        aar2026: n(raw.aar2026, NaN),
        aar2025: n(raw.aar2025, NaN),
        aar2024: n(raw.aar2024, NaN),
        aar2023: n(raw.aar2023, NaN),
        aar2022: n(raw.aar2022, NaN),
      };
    })
    .filter((p) => p.vekt > 0)
    .sort((a, b) => b.vekt - a.vekt);
  if (selected.length === 0) return [];
  const total = selected.reduce((s, p) => s + n(p.vekt), 0) || 1;
  return selected.map((p) => ({ ...p, vekt: Number(((p.vekt / total) * 100).toFixed(1)) }));
}

function normalizePayload(payload = {}) {
  const total = n(payload.totalKapital, 0);
  const horisont = Math.max(1, Math.round(n(payload.horisont, 10)));
  const expected = n(payload.vektetAvkastning, 7.5);
  const products = pickProducts(payload);
  const alloc = (Array.isArray(payload.allokering) ? payload.allokering : [])
    .map((a) => ({ navn: a.navn || 'Ukjent', vekt: n(a.vekt), kategori: a.kategori || '' }))
    .filter((a) => a.vekt > 0)
    .sort((a, b) => b.vekt - a.vekt);
  const expValue = total * Math.pow(1 + (expected / 100), horisont);
  const eksponering = payload.eksponering || { sektorer: [], regioner: [] };
  return {
    kundeNavn: payload.kundeNavn || 'Investor',
    risikoProfil: payload.risikoProfil || 'Moderat',
    dato: payload.dato || new Date().toISOString().slice(0, 10),
    total,
    horisont,
    expected,
    alloc,
    products,
    expValue,
    eksponering,
    produktHistorikk: payload.produktHistorikk || {}
  };
}

function addChrome(slide, pageNo, rightText = '') {
  slide.background = { color: COLORS.light };
  slide.addShape('rect', { x: 0, y: 0, w: 13.33, h: 0.55, fill: { color: COLORS.white }, line: { color: COLORS.white, pt: 0 } });
  slide.addText('PENSUM ASSET MANAGEMENT', { x: 0.65, y: 0.14, w: 5.5, h: 0.2, fontSize: 10, color: COLORS.navy, bold: true });
  if (rightText) slide.addText(rightText, { x: 8.5, y: 0.14, w: 4.1, h: 0.2, fontSize: 10, color: COLORS.muted, align: 'right' });
  slide.addShape('line', { x: 0.65, y: 7.1, w: 12.05, h: 0, line: { color: COLORS.line, pt: 1 } });
  slide.addText(`Side ${pageNo}`, { x: 0.65, y: 7.12, w: 2, h: 0.2, fontSize: 9, color: COLORS.muted });
}

function addTitle(slide, title, subtitle = '') {
  slide.addText(title, { x: 0.8, y: 0.95, w: 8.6, h: 0.5, fontSize: 24, bold: true, color: COLORS.navy });
  if (subtitle) slide.addText(subtitle, { x: 0.8, y: 1.42, w: 11.7, h: 0.35, fontSize: 12, color: COLORS.muted });
}

function addKpiCard(slide, x, y, w, title, value, accent = COLORS.navy, sub = '') {
  slide.addShape('roundRect', { x, y, w, h: 1.0, rectRadius: 0.08, fill: { color: COLORS.white }, line: { color: COLORS.line, pt: 1 } });
  slide.addText(title, { x: x + 0.18, y: y + 0.12, w: w - 0.3, h: 0.15, fontSize: 9, color: COLORS.muted, bold: true });
  slide.addText(String(value), { x: x + 0.18, y: y + 0.35, w: w - 0.3, h: 0.28, fontSize: 20, color: accent, bold: true });
  if (sub) slide.addText(sub, { x: x + 0.18, y: y + 0.72, w: w - 0.3, h: 0.12, fontSize: 8, color: COLORS.muted });
}

function bulletLines(product) {
  return [product.pitch, product.case, product.why].filter(Boolean).map((line) => `• ${line}`);
}

function topRows(arr = [], top = 8) {
  return (Array.isArray(arr) ? arr : []).slice(0, top).map((row) => ({ navn: row.navn || 'Ukjent', vekt: n(row.vekt) }));
}

function buildGeneratedDeck(payload = {}) {
  const d = normalizePayload(payload);
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_WIDE';
  pptx.author = 'OpenAI';
  pptx.company = 'Pensum Asset Management';
  pptx.subject = 'Investeringsforslag';
  pptx.title = `Investeringsforslag ${d.kundeNavn}`;
  let page = 1;

  {
    const s = pptx.addSlide();
    addChrome(s, page++, formatDateLabel(d.dato));
    s.addText('Investeringsforslag', { x: 0.8, y: 1.6, w: 8.5, h: 0.7, fontSize: 30, bold: true, color: COLORS.navy });
    s.addText(d.kundeNavn, { x: 0.8, y: 2.35, w: 8.5, h: 0.45, fontSize: 22, color: COLORS.salmon, bold: true });
    s.addText('Pensum Asset Management', { x: 0.8, y: 3.0, w: 8.5, h: 0.3, fontSize: 14, color: COLORS.text });
    addKpiCard(s, 0.8, 4.2, 2.4, 'Kapital', `${currency(d.total)} kr`);
    addKpiCard(s, 3.45, 4.2, 2.3, 'Risikoprofil', d.risikoProfil, COLORS.salmon);
    addKpiCard(s, 6.0, 4.2, 2.3, 'Forv. avkastning', pct(d.expected), COLORS.green, 'årlig');
    addKpiCard(s, 8.55, 4.2, 3.1, 'Forv. sluttverdi', `${currency(d.expValue)} kr`, COLORS.navy, `${d.horisont} år`);
  }

  {
    const s = pptx.addSlide();
    addChrome(s, page++, 'Executive summary');
    addTitle(s, 'Anbefalt portefølje', 'Oppsummering av foreslått sammensetning og hovedpoenger');
    addKpiCard(s, 0.8, 1.95, 2.6, 'Kapital', `${currency(d.total)} kr`);
    addKpiCard(s, 3.6, 1.95, 2.1, 'Risikoprofil', d.risikoProfil, COLORS.salmon);
    addKpiCard(s, 5.95, 1.95, 2.1, 'Forv. avkastning', pct(d.expected), COLORS.green);
    addKpiCard(s, 8.3, 1.95, 2.8, 'Forv. sluttverdi', `${currency(d.expValue)} kr`, COLORS.navy, `${d.horisont} år`);
    const top = d.products[0];
    const bullets = [
      top ? `${top.navn} er største byggestein i porteføljen med ${pct(top.vekt)} vekt.` : 'Porteføljen er sammensatt av utvalgte Pensum-løsninger.',
      'Porteføljen kombinerer vekstdrivere, kontantstrømbærende rentedel og utvalgte spesialistmandater.',
      'Produktslidene som følger viser hva hvert valgt produkt faktisk inneholder – ikke bare aggregert totalportefølje.'
    ];
    s.addText(bullets.map((b) => ({ text: `• ${b}`, options: { bullet: { indent: 18 } } })), { x: 0.95, y: 3.3, w: 7.3, h: 1.8, fontSize: 16, color: COLORS.text, breakLine: true });
    if (d.alloc.length) {
      s.addChart('pie', [{ name: 'Allokering', labels: d.alloc.map((a) => a.navn), values: d.alloc.map((a) => a.vekt) }], { x: 8.6, y: 3.05, w: 3.3, h: 2.5, showLegend: false, showValue: true, dataLabelPosition: 'bestFit' });
    }
  }

  {
    const s = pptx.addSlide();
    addChrome(s, page++, 'Aktivaklasseallokering');
    addTitle(s, 'Aktivaklasseallokering', 'Fordeling mellom aksjer, renter og alternative komponenter');
    if (d.alloc.length) {
      s.addChart('bar', [{ name: 'Vekt', labels: d.alloc.map((a) => a.navn), values: d.alloc.map((a) => a.vekt) }], { x: 0.9, y: 1.95, w: 6.0, h: 3.6, showLegend: false, catAxisLabelFontSize: 11, valAxisLabelFontSize: 10 });
      s.addTable([
        [{ text: 'Aktivaklasse', options: { bold: true } }, { text: 'Vekt', options: { bold: true } }, { text: 'Beløp', options: { bold: true } }],
        ...d.alloc.map((a) => [a.navn, pct(a.vekt), `${currency((a.vekt / 100) * d.total)} kr`])
      ], { x: 7.25, y: 2.0, w: 5.2, rowH: 0.28, fontSize: 10, border: { pt: 1, color: COLORS.line } });
    }
  }

  {
    const s = pptx.addSlide();
    addChrome(s, page++, 'Pensum-løsninger');
    addTitle(s, 'Valgte Pensum-løsninger', 'Produktene under vil få egne moduler i forslaget');
    s.addTable([
      [{ text: 'Produkt', options: { bold: true } }, { text: 'Vekt', options: { bold: true } }, { text: 'Rolle', options: { bold: true } }, { text: 'Benchmark', options: { bold: true } }],
      ...d.products.map((p) => [p.navn, pct(p.vekt), p.role || 'Byggestein i porteføljen', p.benchmark || '—'])
    ], { x: 0.85, y: 1.9, w: 11.8, fontSize: 10, rowH: 0.28, border: { pt: 1, color: COLORS.line } });
  }

  if ((d.eksponering?.sektorer || []).length || (d.eksponering?.regioner || []).length) {
    const s = pptx.addSlide();
    addChrome(s, page++, 'Porteføljeeksponering');
    addTitle(s, 'Aggregert porteføljeeksponering', 'Sekundær oppsummering av vektet eksponering på tvers av valgte produkter');
    const sekt = topRows(d.eksponering?.sektorer, 8);
    const reg = topRows(d.eksponering?.regioner, 8);
    if (sekt.length) s.addChart('bar', [{ name: 'Sektorer', labels: sekt.map((r) => r.navn), values: sekt.map((r) => r.vekt) }], { x: 0.9, y: 1.95, w: 5.8, h: 3.8, showLegend: false, barDir: 'bar', catAxisLabelFontSize: 10 });
    if (reg.length) s.addChart('bar', [{ name: 'Regioner', labels: reg.map((r) => r.navn), values: reg.map((r) => r.vekt) }], { x: 6.9, y: 1.95, w: 5.8, h: 3.8, showLegend: false, barDir: 'bar', catAxisLabelFontSize: 10 });
  }

  d.products.forEach((p) => {
    const sectors = topRows(p.exposure?.sektorer, 8);
    const regions = topRows(p.exposure?.regioner, 8);
    const holdings = topRows(p.exposure?.underliggende, 10);
    const style = topRows(p.exposure?.stil, 8);

    {
      const s = pptx.addSlide();
      addChrome(s, page++, p.navn);
      addTitle(s, p.title || p.navn, p.subtitle || 'Produktmodul');
      addKpiCard(s, 0.85, 1.9, 1.8, 'Vekt', pct(p.vekt), COLORS.navy);
      addKpiCard(s, 2.9, 1.9, 2.2, 'Forv. avkastning', pct(p.expectedReturn ?? 0), COLORS.green);
      addKpiCard(s, 5.35, 1.9, 2.2, 'Forv. yield', pct(p.expectedYield ?? 0), COLORS.teal);
      addKpiCard(s, 7.8, 1.9, 4.2, 'Benchmark', p.benchmark || '—', COLORS.salmon);
      s.addText('Rolle i porteføljen', { x: 0.95, y: 3.15, w: 2.8, h: 0.2, fontSize: 11, color: COLORS.muted, bold: true });
      s.addText(p.role || 'Byggestein i porteføljen', { x: 0.95, y: 3.38, w: 3.6, h: 0.6, fontSize: 16, color: COLORS.navy, bold: true });
      const bullets = bulletLines(p);
      if (bullets.length) {
        s.addText(bullets.map((line) => ({ text: line, options: { bullet: { indent: 16 } } })), { x: 0.95, y: 4.1, w: 6.2, h: 1.8, fontSize: 14, color: COLORS.text, breakLine: true });
      }
      s.addText('Nøkkelrisiko', { x: 7.75, y: 3.15, w: 2.4, h: 0.2, fontSize: 11, color: COLORS.muted, bold: true });
      s.addText(p.risk || 'Markedsrisiko og normal verdiutvikling i tråd med produktets mandat.', { x: 7.75, y: 3.42, w: 4.4, h: 0.8, fontSize: 14, color: COLORS.text });
      if (p.exposure?.disclaimer) {
        s.addText(p.exposure.disclaimer, { x: 7.75, y: 4.45, w: 4.5, h: 0.8, fontSize: 10, color: COLORS.muted, italic: true });
      }
    }

    {
      const s = pptx.addSlide();
      addChrome(s, page++, `${p.navn} – eksponering`);
      addTitle(s, `${p.navn} – innhold og eksponering`, 'Underliggende eksponering vises produkt for produkt');
      if (sectors.length) {
        s.addChart('bar', [{ name: 'Sektorer', labels: sectors.map((r) => r.navn), values: sectors.map((r) => r.vekt) }], { x: 0.85, y: 1.9, w: 5.9, h: 2.45, showLegend: false, barDir: 'bar', catAxisLabelFontSize: 10 });
      }
      if (regions.length) {
        s.addChart('bar', [{ name: 'Regioner', labels: regions.map((r) => r.navn), values: regions.map((r) => r.vekt) }], { x: 6.85, y: 1.9, w: 5.6, h: 2.45, showLegend: false, barDir: 'bar', catAxisLabelFontSize: 10 });
      }
      const leftRows = holdings.length
        ? holdings.map((r) => [r.navn, pct(r.vekt)])
        : [['Ingen underliggende data', '—']];
      s.addTable([
        [{ text: 'Underliggende investeringer', options: { bold: true } }, { text: 'Vekt', options: { bold: true } }],
        ...leftRows
      ], { x: 0.85, y: 4.65, w: 6.1, fontSize: 9, rowH: 0.24, border: { pt: 1, color: COLORS.line } });
      const styleRows = style.length
        ? style.map((r) => [r.navn, pct(r.vekt)])
        : [['Ingen stilfaktorer registrert', '—']];
      s.addTable([
        [{ text: 'Stil / øvrig', options: { bold: true } }, { text: 'Vekt', options: { bold: true } }],
        ...styleRows
      ], { x: 7.2, y: 4.65, w: 5.3, fontSize: 9, rowH: 0.24, border: { pt: 1, color: COLORS.line } });
    }
  });

  return pptx;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    if (!PptxGenJS) throw new Error('pptxgenjs er ikke tilgjengelig');
    const pptx = buildGeneratedDeck(req.body || {});
    const buffer = await pptx.write({ outputType: 'nodebuffer' });
    const kunde = safeFilename(req.body?.kundeNavn || 'Kunde');
    const filnavn = `Pensum_Investeringsforslag_${kunde}_${new Date().toISOString().slice(0, 10)}.pptx`;
    res.setHeader('X-Pensum-Output-Format', 'pptx-generated');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
    res.setHeader('Content-Disposition', `attachment; filename="${filnavn}"`);
    return res.send(buffer);
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Ukjent feil ved PPTX-generering' });
  }
}

export const config = {
  api: { bodyParser: { sizeLimit: '20mb' }, responseLimit: '20mb' }
};
