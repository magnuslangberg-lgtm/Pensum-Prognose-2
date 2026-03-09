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
  danger: 'B42318',
  amber: 'B54708'
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
    title: 'Global kjerneeksponering', role: 'Kjernebyggestein i aksjedelen',
    pitch: 'Gir bred global aksjeeksponering og fungerer som hovedmotor i porteføljens aksjedel.',
    case: 'Kombinerer kvalitet, geografi og forvalterdiversifisering i én samlet løsning.',
    why: 'Passer godt som basiseksponering når målet er robust global allokering over tid.',
    risk: 'Verdien vil svinge med globale aksjemarkeder og valutautvikling.',
    benchmark: 'MSCI World / bred global aksjereferanse', expectedReturn: 9.0, expectedYield: 1.8,
  },
  'global-edge': {
    title: 'Global offensiv satellitt', role: 'Satellitt for meravkastning i aksjedelen',
    pitch: 'Supplerer kjerneporteføljen med mer konsentrerte og aktive globale ideer.',
    case: 'Brukes når man ønsker høyere aktiv andel og flere tydelige forvalterbets.',
    why: 'Kan øke diversifiseringen på forvalterstil og gi meravkastningspotensial.',
    risk: 'Høyere stil- og faktoravvik enn brede globale indekser.',
    benchmark: 'Global aktiv aksjereferanse', expectedReturn: 9.5, expectedYield: 1.4,
  },
  basis: {
    title: 'Balansert totalportefølje', role: 'Helhetlig blandet byggestein',
    pitch: 'Gir en ferdig sammensatt blanding av aksjer, renter og utvalgte spesialmandater.',
    case: 'Egnet når man ønsker en enkel, balansert løsning med moderat risikonivå.',
    why: 'Kan fungere som selvstendig løsning eller som stabil kjerne i en bredere portefølje.',
    risk: 'Lavere forventet avkastning enn rene aksjeløsninger, men også lavere svingninger.',
    benchmark: 'Blandet referanse / 50-50 aksjer-renter', expectedReturn: 7.0, expectedYield: 3.0,
  },
  'global-hoyrente': {
    title: 'Global rente- og kontantstrømmotor', role: 'Rentedel med fokus på løpende avkastning',
    pitch: 'Skal bidra med løpende renteinntekter og lavere volatilitet enn aksjer.',
    case: 'Bygger robusthet i porteføljen og gir kontantstrøm i et mer defensivt segment.',
    why: 'Passer som stabilisator mot aksjer og som bærer av løpende yield.',
    risk: 'Kredittrisiko og spreadutvidelser kan gi kursfall i stressperioder.',
    benchmark: 'Global high yield / kredittreferanse', expectedReturn: 7.5, expectedYield: 7.0,
  },
  'nordisk-hoyrente': {
    title: 'Nordisk høyrente', role: 'Regional rentedel med løpende avkastning',
    pitch: 'Gir eksponering mot nordisk kredittmarked gjennom utvalgte fond.',
    case: 'Egnet når man ønsker mer regional kredittkompetanse og løpende yield.',
    why: 'Kan være et godt supplement til globale renteløsninger.',
    risk: 'Likviditet og kredittspread kan påvirke avkastningen i urolige perioder.',
    benchmark: 'Nordisk high yield / kredittreferanse', expectedReturn: 7.0, expectedYield: 6.5,
  },
  'norge-a': {
    title: 'Norske aksjer', role: 'Hjemmemarkeds- og stock-picking-eksponering',
    pitch: 'Gir aktiv eksponering mot norske børsnoterte selskaper og sektorer.',
    case: 'Brukes for å utnytte lokal markedskunnskap og tilføre tydelige norske idéer.',
    why: 'Kan gi god diversifisering relativt til globale porteføljer og passer godt i NOK-porteføljer.',
    risk: 'Mer konsentrert marked og høyere sektoravhengighet enn global eksponering.',
    benchmark: 'OSEBX / norsk aksjereferanse', expectedReturn: 10.0, expectedYield: 2.5,
  },
  'energy-a': {
    title: 'Tematisk energi-eksponering', role: 'Tematisk satellitt',
    pitch: 'Gir målrettet eksponering mot energi, råvarer og tilhørende verdikjeder.',
    case: 'Kan bidra med meravkastningspotensial når energisektoren er attraktivt priset.',
    why: 'Passer som mindre satellittandel i en bredere portefølje.',
    risk: 'Kan svinge betydelig og er sensitiv for råvarepriser og geopolitikk.',
    benchmark: 'Energi-/råvareorientert aksjereferanse', expectedReturn: 11.0, expectedYield: 3.5,
  },
  'banking-d': {
    title: 'Nordisk banksektor', role: 'Sektorsatellitt',
    pitch: 'Gir eksponering mot nordiske banker og finansinstitusjoner med tydelig sektorvinkel.',
    case: 'Kan brukes når man ønsker særskilt eksponering mot en sektor med attraktive utbytter og soliditet.',
    why: 'Gir en mer spesialisert og målrettet eksponering enn brede nordiske aksjefond.',
    risk: 'Sektorkonsentrasjon og regulatoriske endringer kan gi høy volatilitet.',
    benchmark: 'Nordisk bank-/finansreferanse', expectedReturn: 10.0, expectedYield: 4.0,
  },
  'financial-d': {
    title: 'Finansiell kredittspesialist', role: 'Spesialist i rentedelen',
    pitch: 'Gir målrettet kreditt- og renteeksponering mot finansrelaterte utstedere.',
    case: 'Kan bidra med attraktiv løpende avkastning fra et avgrenset og analysekrevende segment.',
    why: 'Passer som supplement i rentedelen for å øke spesialisering og yield.',
    risk: 'Kredittevent, likviditet og sektorspesifikk risiko kan påvirke utviklingen.',
    benchmark: 'Finansiell kreditt / high yield referanse', expectedReturn: 8.0, expectedYield: 7.5,
  }
};

function num(v, fb = 0) {
  const x = Number(v);
  return Number.isFinite(x) ? x : fb;
}
function pct(v, digits = 1) { return `${num(v).toFixed(digits)}%`; }
function currency(v) { return new Intl.NumberFormat('nb-NO', { maximumFractionDigits: 0 }).format(num(v)); }
function safeFilename(text = 'Kunde') { return String(text || 'Kunde').replace(/\s+/g, '_').replace(/[^A-Za-z0-9_\-.æøåÆØÅ]/g, ''); }
function fmtDate(s = '') { const d = new Date(s); return Number.isNaN(d.getTime()) ? String(s || '') : d.toLocaleDateString('nb-NO'); }
function topRows(rows, limit = 8) {
  return (Array.isArray(rows) ? rows : [])
    .map((r) => ({ navn: r?.navn || r?.name || 'Ukjent', vekt: num(r?.vekt ?? r?.weight ?? r?.value) }))
    .filter((r) => r.vekt > 0)
    .sort((a, b) => b.vekt - a.vekt)
    .slice(0, limit);
}

function normalizeProducts(payload = {}) {
  const selectedIds = Array.isArray(payload.produkterIBruk) ? payload.produkterIBruk : [];
  const exposureMap = payload.produktEksponering || {};
  const products = Array.isArray(payload.pensumProdukter) ? payload.pensumProdukter : [];
  const allokMap = new Map((Array.isArray(payload.pensumAllokering) ? payload.pensumAllokering : []).map((p) => [p.id, num(p.vekt)]));
  const byId = new Map(products.map((p) => [p.id, p]));
  const ids = selectedIds.length ? selectedIds : products.map((p) => p.id);
  const selected = ids.map((id) => {
    const raw = byId.get(id) || { id, navn: PRODUCT_LABELS[id] || id };
    const meta = PRODUCT_META[id] || {};
    return {
      id,
      navn: raw.navn || PRODUCT_LABELS[id] || id,
      vekt: num(raw.vekt, allokMap.get(id) ?? 0),
      exposure: exposureMap[id] || {},
      benchmark: raw.benchmark || meta.benchmark || '—',
      role: raw.rolle || meta.role || '—',
      pitch: raw.pitch || meta.pitch || '',
      case: raw.case || meta.case || '',
      why: raw.why || meta.why || '',
      risk: raw.risk || meta.risk || '',
      expectedReturn: num(raw.expectedReturn ?? raw.forventetAvkastning, meta.expectedReturn ?? 0),
      expectedYield: num(raw.expectedYield ?? raw.forventetYield, meta.expectedYield ?? 0),
      title: raw.slideTitle || meta.title || raw.navn || PRODUCT_LABELS[id] || id,
      subtitle: raw.slideSubtitle || '',
      preferredChart: raw.diagramtype || meta.preferredChart || 'underlying'
    };
  }).filter((p) => p.vekt > 0).sort((a, b) => b.vekt - a.vekt);
  const totalWeight = selected.reduce((s, p) => s + num(p.vekt), 0) || 1;
  return selected.map((p) => ({ ...p, vekt: Number(((p.vekt / totalWeight) * 100).toFixed(1)) }));
}

function normalizePayload(payload = {}) {
  const total = num(payload.totalKapital, 0);
  const expected = num(payload.vektetAvkastning, 7.5);
  const horizon = Math.max(1, Math.round(num(payload.horisont, 10)));
  const alloc = (Array.isArray(payload.allokering) ? payload.allokering : [])
    .map((a) => ({ navn: a.navn || 'Ukjent', vekt: num(a.vekt), kategori: a.kategori || '' }))
    .filter((a) => a.vekt > 0)
    .sort((a, b) => b.vekt - a.vekt);
  const products = normalizeProducts(payload);
  const exposure = payload.eksponering || { sektorer: [], regioner: [], underliggende: [], stil: [] };
  return {
    kundeNavn: payload.kundeNavn || 'Investor',
    risikoProfil: payload.risikoProfil || 'Moderat',
    dato: payload.dato || new Date().toISOString().slice(0, 10),
    total,
    expected,
    horizon,
    alloc,
    products,
    exposure,
    expValue: total * Math.pow(1 + expected / 100, horizon)
  };
}

function addChrome(slide, pageNo, rightText = '') {
  slide.background = { color: COLORS.light };
  slide.addShape(PptxGenJS.ShapeType.rect, { x: 0, y: 0, w: 13.33, h: 0.55, fill: { color: COLORS.white }, line: { color: COLORS.white, pt: 0 } });
  slide.addText('PENSUM ASSET MANAGEMENT', { x: 0.65, y: 0.14, w: 5.5, h: 0.2, fontSize: 10, color: COLORS.navy, bold: true });
  if (rightText) slide.addText(rightText, { x: 8.3, y: 0.14, w: 4.3, h: 0.2, fontSize: 10, color: COLORS.muted, align: 'right' });
  slide.addShape(PptxGenJS.ShapeType.line, { x: 0.65, y: 7.1, w: 12.05, h: 0, line: { color: COLORS.line, pt: 1 } });
  slide.addText(`Side ${pageNo}`, { x: 0.65, y: 7.12, w: 2.0, h: 0.2, fontSize: 9, color: COLORS.muted });
}

function addTitle(slide, title, subtitle = '') {
  slide.addText(title, { x: 0.8, y: 0.9, w: 9.5, h: 0.45, fontSize: 22, bold: true, color: COLORS.navy });
  if (subtitle) slide.addText(subtitle, { x: 0.8, y: 1.32, w: 11.7, h: 0.3, fontSize: 11, color: COLORS.muted });
}

function addKpiCard(slide, x, y, w, title, value, accent = COLORS.navy, sub = '') {
  slide.addShape(PptxGenJS.ShapeType.rect, { x, y, w, h: 0.95, fill: { color: COLORS.white }, line: { color: COLORS.line, pt: 1 } });
  slide.addText(title, { x: x + 0.15, y: y + 0.11, w: w - 0.2, h: 0.12, fontSize: 8, color: COLORS.muted, bold: true });
  slide.addText(String(value), { x: x + 0.15, y: y + 0.33, w: w - 0.2, h: 0.2, fontSize: 18, color: accent, bold: true });
  if (sub) slide.addText(sub, { x: x + 0.15, y: y + 0.68, w: w - 0.2, h: 0.12, fontSize: 7, color: COLORS.muted });
}

function addMiniBars(slide, title, rows, x, y, w, h, color) {
  slide.addShape(PptxGenJS.ShapeType.rect, { x, y, w, h, fill: { color: COLORS.white }, line: { color: COLORS.line, pt: 1 } });
  slide.addText(title, { x: x + 0.15, y: y + 0.1, w: w - 0.3, h: 0.15, fontSize: 9, color: COLORS.navy, bold: true });
  const list = topRows(rows, 6);
  if (!list.length) {
    slide.addText('Ingen tilgjengelige data', { x: x + 0.15, y: y + 0.45, w: w - 0.3, h: 0.2, fontSize: 10, color: COLORS.muted });
    return;
  }
  const maxVal = Math.max(...list.map((r) => r.vekt), 1);
  const rowH = Math.min(0.36, (h - 0.45) / list.length);
  list.forEach((row, idx) => {
    const yy = y + 0.35 + idx * rowH;
    const barMax = w - 2.2;
    const barW = Math.max(0.2, (row.vekt / maxVal) * barMax);
    slide.addText(row.navn, { x: x + 0.15, y: yy + 0.03, w: 1.3, h: 0.12, fontSize: 8, color: COLORS.text });
    slide.addShape(PptxGenJS.ShapeType.rect, { x: x + 1.45, y: yy + 0.02, w: barW, h: 0.12, fill: { color }, line: { color, pt: 0.5 } });
    slide.addText(pct(row.vekt), { x: x + w - 0.55, y: yy + 0.01, w: 0.4, h: 0.12, fontSize: 8, color: COLORS.muted, align: 'right' });
  });
}

function addBulletBox(slide, title, lines, x, y, w, h) {
  slide.addShape(PptxGenJS.ShapeType.rect, { x, y, w, h, fill: { color: COLORS.white }, line: { color: COLORS.line, pt: 1 } });
  slide.addText(title, { x: x + 0.15, y: y + 0.1, w: w - 0.3, h: 0.15, fontSize: 9, color: COLORS.navy, bold: true });
  const txt = (Array.isArray(lines) ? lines.filter(Boolean) : []).map((line) => `• ${line}`).join('\n');
  slide.addText(txt || 'Ingen tekst tilgjengelig', { x: x + 0.18, y: y + 0.35, w: w - 0.3, h: h - 0.45, fontSize: 11, color: COLORS.text, valign: 'top', breakLine: false, margin: 0.03 });
}

function addSimpleTable(slide, title, rows, x, y, w, h, leftHeader = 'Navn', rightHeader = 'Vekt') {
  slide.addShape(PptxGenJS.ShapeType.rect, { x, y, w, h, fill: { color: COLORS.white }, line: { color: COLORS.line, pt: 1 } });
  slide.addText(title, { x: x + 0.15, y: y + 0.1, w: w - 0.3, h: 0.15, fontSize: 9, color: COLORS.navy, bold: true });
  slide.addText(leftHeader, { x: x + 0.15, y: y + 0.33, w: w - 1.0, h: 0.12, fontSize: 8, color: COLORS.muted, bold: true });
  slide.addText(rightHeader, { x: x + w - 0.9, y: y + 0.33, w: 0.7, h: 0.12, fontSize: 8, color: COLORS.muted, bold: true, align: 'right' });
  const list = (Array.isArray(rows) ? rows : []).slice(0, 8);
  if (!list.length) {
    slide.addText('Ingen tilgjengelige data', { x: x + 0.15, y: y + 0.6, w: w - 0.3, h: 0.18, fontSize: 10, color: COLORS.muted });
    return;
  }
  const rowH = Math.min(0.28, (h - 0.55) / list.length);
  list.forEach((row, idx) => {
    const yy = y + 0.55 + idx * rowH;
    slide.addText(row.navn, { x: x + 0.15, y: yy, w: w - 1.0, h: 0.12, fontSize: 8.5, color: COLORS.text });
    slide.addText(pct(row.vekt), { x: x + w - 0.9, y: yy, w: 0.7, h: 0.12, fontSize: 8.5, color: COLORS.text, align: 'right' });
  });
}

function buildDeck(payload) {
  const d = normalizePayload(payload);
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_WIDE';
  pptx.author = 'OpenAI';
  pptx.company = 'Pensum Asset Management';
  pptx.subject = 'Investeringsforslag';
  pptx.title = `Pensum investeringsforslag – ${d.kundeNavn}`;
  pptx.lang = 'nb-NO';
  pptx.theme = {
    headFontFace: 'Aptos', bodyFontFace: 'Aptos', lang: 'nb-NO'
  };

  let page = 1;

  {
    const s = pptx.addSlide();
    addChrome(s, page++, 'Investeringsforslag');
    s.addText('Pensum Asset Management', { x: 0.85, y: 1.25, w: 5.5, h: 0.35, fontSize: 18, bold: true, color: COLORS.navy });
    s.addText('Investeringsforslag', { x: 0.85, y: 1.68, w: 5.5, h: 0.45, fontSize: 28, bold: true, color: COLORS.text });
    s.addText(`Kunde: ${d.kundeNavn}`, { x: 0.85, y: 2.5, w: 4.5, h: 0.22, fontSize: 16, color: COLORS.text });
    s.addText(`Rapportdato: ${fmtDate(d.dato)}`, { x: 0.85, y: 2.88, w: 4.5, h: 0.22, fontSize: 16, color: COLORS.text });
    addKpiCard(s, 0.9, 4.2, 2.5, 'Total kapital', `${currency(d.total)} kr`, COLORS.navy);
    addKpiCard(s, 3.6, 4.2, 2.1, 'Risikoprofil', d.risikoProfil, COLORS.blue);
    addKpiCard(s, 5.9, 4.2, 2.4, 'Forventet avkastning', `${d.expected.toFixed(1)}% p.a.`, COLORS.green);
    addKpiCard(s, 8.5, 4.2, 3.0, 'Illustrativ verdi', `${currency(d.expValue)} kr`, COLORS.teal, `etter ${d.horizon} år`);
    addBulletBox(s, 'Hovedpoenger', [
      `${(d.products[0]?.navn || 'Kjerneløsning')} er største byggestein med ${pct(d.products[0]?.vekt || 0)} vekt.`,
      'Produkter med vekt over null får egne moduler i presentasjonen.',
      'Porteføljen søker å kombinere robust kjerneeksponering med utvalgte satellitter og rentedel.'
    ], 8.0, 1.45, 4.4, 1.9);
  }

  {
    const s = pptx.addSlide();
    addChrome(s, page++, 'Porteføljesammendrag');
    addTitle(s, 'Porteføljesammendrag', 'Fordeling mellom aktivaklasser og valgte Pensum-løsninger');
    addMiniBars(s, 'Aktivaklasseallokering', d.alloc, 0.85, 1.8, 5.5, 2.4, COLORS.blue);
    addSimpleTable(s, 'Valgte Pensum-løsninger', d.products.map((p) => ({ navn: p.navn, vekt: p.vekt })), 6.65, 1.8, 5.8, 2.4, 'Produkt', 'Vekt');
    addKpiCard(s, 0.9, 4.5, 2.2, 'Aksjer/renter', `${pct(d.alloc.filter(a=>a.kategori==='aksjer').reduce((s,a)=>s+a.vekt,0),0)} / ${pct(d.alloc.filter(a=>a.kategori==='renter').reduce((s,a)=>s+a.vekt,0),0)}`, COLORS.navy);
    addKpiCard(s, 3.3, 4.5, 2.2, 'Produkter i bruk', d.products.length, COLORS.blue);
    addKpiCard(s, 5.7, 4.5, 2.2, 'Forv. yield', `${(d.products.reduce((s,p)=>s+(p.expectedYield*p.vekt/100),0)).toFixed(1)}%`, COLORS.green);
    addKpiCard(s, 8.1, 4.5, 2.2, 'Forv. avkastning', `${d.expected.toFixed(1)}%`, COLORS.teal);
  }

  {
    const s = pptx.addSlide();
    addChrome(s, page++, 'Aggregert eksponering');
    addTitle(s, 'Aggregert eksponering', 'Sekundær oversikt på tvers av valgte produkter');
    addMiniBars(s, 'Sektorer', d.exposure?.sektorer, 0.85, 1.8, 5.8, 4.7, COLORS.blue);
    addMiniBars(s, 'Regioner', d.exposure?.regioner, 6.65, 1.8, 5.8, 4.7, COLORS.teal);
  }

  d.products.forEach((p) => {
    const sectors = topRows(p.exposure?.sektorer, 6);
    const regions = topRows(p.exposure?.regioner, 6);
    const holdings = topRows(p.exposure?.underliggende, 8);
    const styles = topRows(p.exposure?.stil, 6);

    const s1 = pptx.addSlide();
    addChrome(s1, page++, `${p.navn} – produktmodul`);
    addTitle(s1, p.title || p.navn, p.subtitle || p.role || 'Produktmodul');
    addKpiCard(s1, 0.9, 1.85, 2.2, 'Porteføljevekt', pct(p.vekt), COLORS.navy);
    addKpiCard(s1, 3.3, 1.85, 2.8, 'Benchmark', p.benchmark || '—', COLORS.blue);
    addKpiCard(s1, 6.3, 1.85, 2.2, 'Forv. avkastning', `${num(p.expectedReturn).toFixed(1)}%`, COLORS.green);
    addKpiCard(s1, 8.7, 1.85, 2.2, 'Forv. yield', `${num(p.expectedYield).toFixed(1)}%`, COLORS.teal);
    addBulletBox(s1, 'Investeringscase', [p.pitch, p.case, p.why], 0.9, 3.1, 6.0, 2.9);
    addBulletBox(s1, 'Rolle og nøkkelrisiko', [
      p.role ? `Rolle: ${p.role}` : '',
      p.benchmark ? `Benchmark: ${p.benchmark}` : '',
      p.risk ? `Risiko: ${p.risk}` : ''
    ], 7.15, 3.1, 5.25, 2.9);

    const s2 = pptx.addSlide();
    addChrome(s2, page++, `${p.navn} – innhold`);
    addTitle(s2, `${p.navn} – innhold og eksponering`, 'Produkt-for-produkt eksponering brukes som grunnlag for presentasjonen');
    addMiniBars(s2, 'Sektorer', sectors, 0.85, 1.8, 5.8, 2.25, COLORS.blue);
    addMiniBars(s2, 'Regioner', regions, 6.65, 1.8, 5.8, 2.25, COLORS.teal);
    addSimpleTable(s2, 'Underliggende investeringer', holdings, 0.85, 4.25, 5.8, 2.3, 'Holding', 'Vekt');
    addSimpleTable(s2, 'Stilfaktorer / øvrig', styles, 6.65, 4.25, 5.8, 2.3, 'Faktor', 'Vekt');
  });

  return { pptx, filename: `Pensum_Investeringsforslag_${safeFilename(d.kundeNavn)}_${String(d.dato).replace(/-/g, '')}.pptx` };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { pptx, filename } = buildDeck(req.body || {});
    const buffer = await pptx.write({ outputType: 'nodebuffer' });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.status(200).send(Buffer.from(buffer));
  } catch (error) {
    console.error('PPTX generation error:', error);
    return res.status(500).json({ error: error?.message || 'Ukjent feil ved generering av PowerPoint' });
  }
}
