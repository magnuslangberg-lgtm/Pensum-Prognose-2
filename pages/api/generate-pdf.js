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
  softBlue: 'EFF6FF',
  softAmber: 'FFF7ED'
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
    slideTitle: 'Global kjerneeksponering',
    slideSubtitle: 'Bred global aksjeportefølje med aktiv fondsseleksjon',
    role: 'Kjernebyggestein i aksjedelen',
    benchmark: 'MSCI World / bred global aksjereferanse',
    expectedReturn: 9.0,
    expectedYield: 1.8,
    pitch: 'Gir bred global aksjeeksponering og fungerer som hovedmotor i porteføljens aksjedel.',
    caseText: 'Kombinerer kvalitet, geografi og forvalterdiversifisering i én samlet løsning.',
    whyIncluded: 'Passer godt som basiseksponering når målet er robust global allokering over tid.',
    riskText: 'Verdien vil svinge med globale aksjemarkeder og valutautvikling.',
    category: 'equity-core'
  },
  'global-edge': {
    slideTitle: 'Global offensiv satellitt',
    slideSubtitle: 'Mer aktiv og spisset global aksjeløsning',
    role: 'Satellitt for meravkastning i aksjedelen',
    benchmark: 'Global aktiv aksjereferanse',
    expectedReturn: 9.5,
    expectedYield: 1.4,
    pitch: 'Supplerer kjerneporteføljen med mer konsentrerte og aktive globale idéer.',
    caseText: 'Brukes når man ønsker høyere aktiv andel og flere tydelige forvalterbets.',
    whyIncluded: 'Kan øke diversifiseringen på forvalterstil og gi meravkastningspotensial.',
    riskText: 'Høyere stil- og faktoravvik enn brede globale indekser.',
    category: 'equity-satellite'
  },
  basis: {
    slideTitle: 'Balansert totalportefølje',
    slideSubtitle: 'Kombinasjon av aksjer og renter i én løsning',
    role: 'Helhetlig blandet byggestein',
    benchmark: 'Blandet referanse / 50-50 aksjer-renter',
    expectedReturn: 7.0,
    expectedYield: 3.0,
    pitch: 'Gir en ferdig sammensatt blanding av aksjer, renter og utvalgte spesialmandater.',
    caseText: 'Egnet når man ønsker en enkel, balansert løsning med moderat risikonivå.',
    whyIncluded: 'Kan fungere som selvstendig løsning eller som stabil kjerne i en bredere portefølje.',
    riskText: 'Lavere forventet avkastning enn rene aksjeløsninger, men også lavere svingninger.',
    category: 'balanced'
  },
  'global-hoyrente': {
    slideTitle: 'Global rente- og kontantstrømmotor',
    slideSubtitle: 'Seleksjon av globale high yield- og kredittfond',
    role: 'Rentedel med fokus på løpende avkastning',
    benchmark: 'Global high yield / kredittreferanse',
    expectedReturn: 7.5,
    expectedYield: 7.0,
    pitch: 'Skal bidra med løpende renteinntekter og lavere volatilitet enn aksjer.',
    caseText: 'Bygger robusthet i porteføljen og gir kontantstrøm i et mer defensivt segment.',
    whyIncluded: 'Passer som stabilisator mot aksjer og som bærer av løpende yield.',
    riskText: 'Kredittrisiko og spreadutvidelser kan gi kursfall i stressperioder.',
    category: 'fixed-income'
  },
  'nordisk-hoyrente': {
    slideTitle: 'Nordisk høyrente',
    slideSubtitle: 'Kredittportefølje med nordisk fokus',
    role: 'Regional rentedel med løpende avkastning',
    benchmark: 'Nordisk high yield / kredittreferanse',
    expectedReturn: 7.0,
    expectedYield: 6.5,
    pitch: 'Gir eksponering mot nordisk kredittmarked gjennom utvalgte fond.',
    caseText: 'Egnet når man ønsker mer regional kredittkompetanse og løpende yield.',
    whyIncluded: 'Kan være et godt supplement til globale renteløsninger.',
    riskText: 'Likviditet og kredittspread kan påvirke avkastningen i urolige perioder.',
    category: 'fixed-income'
  },
  'norge-a': {
    slideTitle: 'Norske aksjer',
    slideSubtitle: 'Aktivt norsk aksjefond',
    role: 'Hjemmemarkeds- og stock-picking-eksponering',
    benchmark: 'OSEBX / norsk aksjereferanse',
    expectedReturn: 10.0,
    expectedYield: 2.5,
    pitch: 'Gir aktiv eksponering mot norske børsnoterte selskaper og sektorer.',
    caseText: 'Brukes for å utnytte lokal markedskunnskap og tilføre tydelige norske idéer.',
    whyIncluded: 'Kan gi god diversifisering relativt til globale porteføljer og passer godt i NOK-porteføljer.',
    riskText: 'Mer konsentrert marked og høyere sektoravhengighet enn global eksponering.',
    category: 'equity-nordic'
  },
  'energy-a': {
    slideTitle: 'Tematisk energi-eksponering',
    slideSubtitle: 'Konsentrert energirelatert mandat',
    role: 'Tematisk satellitt',
    benchmark: 'Energi-/råvareorientert aksjereferanse',
    expectedReturn: 11.0,
    expectedYield: 3.5,
    pitch: 'Gir målrettet eksponering mot energi, råvarer og tilhørende verdikjeder.',
    caseText: 'Kan bidra med meravkastningspotensial når energisektoren er attraktivt priset.',
    whyIncluded: 'Passer som mindre satellittandel i en bredere portefølje.',
    riskText: 'Kan svinge betydelig og er sensitiv for råvarepriser og geopolitikk.',
    category: 'equity-thematic'
  },
  'banking-d': {
    slideTitle: 'Nordisk banksektor',
    slideSubtitle: 'Sektorspesialist mot banker og finans',
    role: 'Sektorsatellitt',
    benchmark: 'Nordisk bank-/finansreferanse',
    expectedReturn: 10.0,
    expectedYield: 4.0,
    pitch: 'Gir eksponering mot nordiske banker og finansinstitusjoner med tydelig sektorvinkel.',
    caseText: 'Kan brukes når man ønsker særskilt eksponering mot en sektor med attraktive utbytter og soliditet.',
    whyIncluded: 'Gir en mer spesialisert og målrettet eksponering enn brede nordiske aksjefond.',
    riskText: 'Sektorkonsentrasjon og regulatoriske endringer kan gi høy volatilitet.',
    category: 'equity-sector'
  },
  'financial-d': {
    slideTitle: 'Finansiell kredittspesialist',
    slideSubtitle: 'Rente-/kredittmandat med finanssektor som fokus',
    role: 'Spesialist i rentedelen',
    benchmark: 'Finansiell kreditt / high yield referanse',
    expectedReturn: 8.0,
    expectedYield: 7.5,
    pitch: 'Gir målrettet kreditt- og renteeksponering mot finansrelaterte utstedere.',
    caseText: 'Kan bidra med attraktiv løpende avkastning fra et avgrenset og analysekrevende segment.',
    whyIncluded: 'Passer som supplement i rentedelen for å øke spesialisering og yield.',
    riskText: 'Kredittevent, likviditet og sektorspesifikk risiko kan påvirke utviklingen.',
    category: 'fixed-income'
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

function topRows(arr = [], top = 8) {
  return (Array.isArray(arr) ? arr : [])
    .map((row) => ({ navn: row?.navn || 'Ukjent', vekt: n(row?.vekt) }))
    .filter((row) => row.navn)
    .slice(0, top);
}

function normalizeProducts(payload = {}) {
  const exposureMap = payload.produktEksponering || {};
  const allokMap = new Map((Array.isArray(payload.pensumAllokering) ? payload.pensumAllokering : []).map((p) => [p.id, n(p.vekt)]));
  const products = Array.isArray(payload.pensumProdukter) ? payload.pensumProdukter : [];
  const selectedIds = Array.isArray(payload.produkterIBruk) && payload.produkterIBruk.length
    ? payload.produkterIBruk
    : products.map((p) => p.id);

  const byId = new Map(products.filter((p) => p?.id).map((p) => [p.id, p]));
  const selected = selectedIds
    .map((id) => {
      const raw = byId.get(id) || { id, navn: PRODUCT_LABELS[id] || id };
      const meta = PRODUCT_META[id] || {};
      const reportMeta = {
        slideTitle: raw.slideTitle || meta.slideTitle || raw.navn || PRODUCT_LABELS[id] || id,
        slideSubtitle: raw.slideSubtitle || meta.slideSubtitle || '',
        role: raw.role || meta.role || 'Byggestein i porteføljen',
        benchmark: raw.benchmark || meta.benchmark || '—',
        expectedReturn: Number.isFinite(n(raw.expectedReturn, NaN)) ? n(raw.expectedReturn, NaN) : n(meta.expectedReturn, NaN),
        expectedYield: Number.isFinite(n(raw.expectedYield, NaN)) ? n(raw.expectedYield, NaN) : n(meta.expectedYield, NaN),
        pitch: raw.pitch || meta.pitch || '',
        caseText: raw.caseText || meta.caseText || '',
        whyIncluded: raw.whyIncluded || meta.whyIncluded || '',
        riskText: raw.riskText || meta.riskText || '',
        category: raw.category || meta.category || raw.aktivatype || ''
      };
      return {
        id,
        navn: raw.navn || PRODUCT_LABELS[id] || id,
        vekt: n(raw.vekt, allokMap.get(id) ?? 0),
        exposure: exposureMap[id] || {},
        report: reportMeta
      };
    })
    .filter((p) => p.vekt > 0)
    .sort((a, b) => b.vekt - a.vekt);

  if (!selected.length) return [];
  const total = selected.reduce((s, p) => s + n(p.vekt), 0) || 1;
  return selected.map((p) => ({ ...p, vekt: Number(((p.vekt / total) * 100).toFixed(1)) }));
}

function normalizePayload(payload = {}) {
  const investerbarKapital = n(payload.investerbarKapital, n(payload.totalKapital, 0));
  const totalFormue = n(payload.totalFormue, investerbarKapital);
  const horisont = Math.max(1, Math.round(n(payload.horisont, 10)));
  const expected = n(payload.vektetAvkastning, 7.5);
  const alloc = (Array.isArray(payload.allokering) ? payload.allokering : [])
    .map((a) => ({
      navn: a.navn || 'Ukjent',
      vekt: n(a.vekt),
      kategori: a.kategori || '',
      belop: n(a.belop, ((n(a.vekt) / 100) * investerbarKapital))
    }))
    .filter((a) => a.vekt > 0)
    .sort((a, b) => b.vekt - a.vekt);
  const products = normalizeProducts(payload);
  const eksponering = payload.eksponering || { sektorer: [], regioner: [] };
  const kundeinfo = payload.kundeinfo || {};
  return {
    kundeNavn: payload.kundeNavn || 'Investor',
    risikoProfil: payload.risikoProfil || 'Moderat',
    dato: payload.dato || new Date().toISOString().slice(0, 10),
    totalFormue,
    investerbarKapital,
    horisont,
    expected,
    alloc,
    products,
    expValue: investerbarKapital * Math.pow(1 + (expected / 100), horisont),
    eksponering: {
      sektorer: topRows(eksponering.sektorer, 8),
      regioner: topRows(eksponering.regioner, 8)
    },
    kundeinfo
  };
}

function addChrome(slide, pageNo, rightText = '') {
  slide.background = { color: COLORS.light };
  slide.addShape('rect', { x: 0, y: 0, w: 13.33, h: 0.55, fill: { color: COLORS.white }, line: { color: COLORS.white, pt: 0 } });
  slide.addText('PENSUM ASSET MANAGEMENT', { x: 0.65, y: 0.14, w: 5.5, h: 0.2, fontSize: 10, color: COLORS.navy, bold: true });
  if (rightText) slide.addText(rightText, { x: 8.3, y: 0.14, w: 4.3, h: 0.2, fontSize: 10, color: COLORS.muted, align: 'right' });
  slide.addShape('line', { x: 0.65, y: 7.08, w: 12.05, h: 0, line: { color: COLORS.line, pt: 1 } });
  slide.addText(`Side ${pageNo}`, { x: 0.65, y: 7.11, w: 1.8, h: 0.2, fontSize: 9, color: COLORS.muted });
}

function addTitle(slide, title, subtitle = '') {
  slide.addText(title, { x: 0.8, y: 0.95, w: 9.8, h: 0.44, fontSize: 24, bold: true, color: COLORS.navy });
  if (subtitle) slide.addText(subtitle, { x: 0.8, y: 1.38, w: 11.9, h: 0.28, fontSize: 11, color: COLORS.muted });
}

function addKpiCard(slide, x, y, w, title, value, accent = COLORS.navy, sub = '') {
  slide.addShape('roundRect', { x, y, w, h: 0.95, rectRadius: 0.06, fill: { color: COLORS.white }, line: { color: COLORS.line, pt: 1 } });
  slide.addText(title, { x: x + 0.16, y: y + 0.11, w: w - 0.3, h: 0.14, fontSize: 8.5, color: COLORS.muted, bold: true });
  slide.addText(String(value), { x: x + 0.16, y: y + 0.31, w: w - 0.3, h: 0.25, fontSize: 18, color: accent, bold: true });
  if (sub) slide.addText(sub, { x: x + 0.16, y: y + 0.68, w: w - 0.3, h: 0.12, fontSize: 7.5, color: COLORS.muted });
}

function addInfoCallout(slide, x, y, w, title, body) {
  slide.addShape('roundRect', { x, y, w, h: 0.82, rectRadius: 0.05, fill: { color: COLORS.softBlue }, line: { color: COLORS.line, pt: 1 } });
  slide.addText(title, { x: x + 0.14, y: y + 0.12, w: w - 0.28, h: 0.12, fontSize: 8.5, color: COLORS.muted, bold: true });
  slide.addText(body, { x: x + 0.14, y: y + 0.33, w: w - 0.28, h: 0.28, fontSize: 12, color: COLORS.navy, bold: true, valign: 'mid' });
}

function addBodyParagraph(slide, text, x, y, w, h, fontSize = 13, color = COLORS.text) {
  slide.addText(text, { x, y, w, h, fontSize, color, breakLine: true, valign: 'top', margin: 0.02 });
}

function addBulletSection(slide, title, bullets, x, y, w, h) {
  slide.addText(title, { x, y, w, h: 0.16, fontSize: 11, color: COLORS.muted, bold: true });
  slide.addText(
    bullets.filter(Boolean).map((line) => ({ text: line, options: { bullet: { indent: 12 } } })),
    { x, y: y + 0.22, w, h: h - 0.22, fontSize: 14, color: COLORS.text, breakLine: true, margin: 0.02 }
  );
}

function addBarRows(slide, title, rows, x, y, w, h, barColor = COLORS.blue) {
  slide.addShape('roundRect', { x, y, w, h, rectRadius: 0.05, fill: { color: COLORS.white }, line: { color: COLORS.line, pt: 1 } });
  slide.addText(title, { x: x + 0.16, y: y + 0.12, w: w - 0.3, h: 0.14, fontSize: 10, color: COLORS.navy, bold: true });
  const safeRows = rows && rows.length ? rows.slice(0, 8) : [{ navn: 'Ingen data registrert', vekt: 0 }];
  const startY = y + 0.42;
  const rowH = Math.min(0.28, (h - 0.52) / safeRows.length);
  safeRows.forEach((row, idx) => {
    const yy = startY + (idx * rowH);
    slide.addText(row.navn, { x: x + 0.16, y: yy, w: 1.55, h: rowH - 0.04, fontSize: 8.5, color: COLORS.text, fit: 'shrink' });
    slide.addShape('roundRect', { x: x + 1.8, y: yy + 0.05, w: Math.max(0.05, (Math.min(n(row.vekt), 100) / 100) * (w - 2.7)), h: 0.12, rectRadius: 0.03, fill: { color: barColor }, line: { color: barColor, pt: 0 } });
    slide.addText(pct(row.vekt), { x: x + w - 0.7, y: yy, w: 0.55, h: rowH - 0.04, fontSize: 8.5, align: 'right', color: COLORS.muted });
  });
}

function addKeyValueTable(slide, title, rows, x, y, w, rowH = 0.27) {
  slide.addTable(
    [
      [{ text: title, options: { bold: true, color: COLORS.navy } }, { text: 'Verdi', options: { bold: true, color: COLORS.navy } }],
      ...rows
    ],
    {
      x,
      y,
      w,
      rowH,
      fontSize: 9.5,
      border: { pt: 1, color: COLORS.line },
      fill: COLORS.white,
      color: COLORS.text,
      margin: 0.04
    }
  );
}

function buildAllocationNarrative(d) {
  const allocMap = new Map(d.alloc.map((a) => [a.navn, a.vekt]));
  const aksjer = (allocMap.get('Globale Aksjer') || 0) + (allocMap.get('Norske Aksjer') || 0);
  const renter = (allocMap.get('Høyrente') || 0) + (allocMap.get('Investment Grade') || 0);
  const alternatives = (allocMap.get('Private Equity') || 0) + (allocMap.get('Eiendom') || 0);
  return [
    `Porteføljen tar utgangspunkt i ${pct(aksjer)} aksjeeksponering, ${pct(renter)} rentedel og ${pct(alternatives)} alternative komponenter.`,
    aksjer > renter
      ? 'Hovedvekten ligger i aksjedelen, der brede globale byggesteiner kombineres med mer selektiv nordisk og tematisk eksponering.'
      : 'Rentedelen er tillagt betydelig vekt for å gi porteføljen løpende avkastning og en mer stabil utviklingsbane.',
    alternatives > 0
      ? 'Alternative komponenter er ment å tilføre ytterligere diversifisering og bidra til bedre balanse i totalporteføljen.'
      : 'Porteføljen er i hovedsak bygget opp av likvide aksje- og renteløsninger med daglig verdsettelse.'
  ];
}

function productSummaryRows(products) {
  return products.map((p) => [
    p.navn,
    pct(p.vekt),
    p.report.role || 'Byggestein i porteføljen',
    p.report.benchmark || '—'
  ]);
}

function buildSectionNarratives(products, type) {
  const filtered = products.filter((p) => {
    const role = String(p.report?.role || '').toLowerCase();
    const cat = String(p.report?.category || '').toLowerCase();
    if (type === 'equity') return role.includes('aksje') || cat.includes('equity');
    return role.includes('rente') || cat.includes('fixed');
  });
  if (!filtered.length) {
    return {
      heading: type === 'equity' ? 'Aksjedelen' : 'Rentedelen',
      body: type === 'equity'
        ? 'Det er ikke valgt egne aksjeprodukter i denne illustrasjonen.'
        : 'Det er ikke valgt egne renteprodukter i denne illustrasjonen.'
    };
  }
  const topNames = filtered.slice(0, 3).map((p) => p.navn).join(', ');
  const body = type === 'equity'
    ? `Aksjedelen er bygget rundt ${topNames}. Hensikten er å kombinere bred global eksponering med utvalgte satellitter og nordiske idéer, slik at porteføljen får både robusthet og potensial for meravkastning.`
    : `Rentedelen er bygget rundt ${topNames}. Hensikten er å kombinere løpende kontantstrøm med kredittseleksjon og en stabiliserende effekt mot aksjedelen.`;
  return {
    heading: type === 'equity' ? 'Aksjedelen' : 'Rentedelen',
    body
  };
}


function buildClientAssetRows(kundeinfo = {}) {
  const mapping = [
    ['Aksjer', kundeinfo.aksjerKunde],
    ['Aksjefond', kundeinfo.aksjefondKunde],
    ['Renter', kundeinfo.renterKunde],
    ['Kontanter', kundeinfo.kontanterKunde],
    ['PE-fond', kundeinfo.peFondKunde],
    ['Unoterte aksjer', kundeinfo.unoterteAksjerKunde],
    ['Shipping', kundeinfo.shippingKunde],
    ['Egen eiendom', kundeinfo.egenEiendomKunde],
    ['Eiendomssyndikat', kundeinfo.eiendomSyndikatKunde],
    ['Eiendomsfond', kundeinfo.eiendomFondKunde]
  ];
  return mapping
    .map(([navn, verdi]) => ({ navn, verdi: n(verdi) }))
    .filter((row) => row.verdi > 0)
    .sort((a, b) => b.verdi - a.verdi)
    .map((row) => [row.navn, `${currency(row.verdi)} kr`]);
}

function buildProductMixRows(products = [], investerbarKapital = 0) {
  return products.map((p) => [p.navn, pct(p.vekt), `${currency((n(p.vekt) / 100) * investerbarKapital)} kr`]);
}

function aggregateExposure(products = [], exposureKey = 'regioner', filterFn = () => true) {
  const totals = new Map();
  const relevantProducts = products.filter(filterFn);
  relevantProducts.forEach((product) => {
    const weightFactor = n(product.vekt) / 100;
    const rows = Array.isArray(product.exposure?.[exposureKey]) ? product.exposure[exposureKey] : [];
    rows.forEach((row) => {
      const navn = row?.navn || 'Ukjent';
      const current = totals.get(navn) || 0;
      totals.set(navn, current + (n(row?.vekt) * weightFactor));
    });
  });
  return Array.from(totals.entries())
    .map(([navn, vekt]) => ({ navn, vekt: Number(vekt.toFixed(1)) }))
    .sort((a, b) => b.vekt - a.vekt)
    .slice(0, 8);
}

function addInsightCard(slide, x, y, w, title, body, accent = COLORS.blue) {
  slide.addShape('roundRect', { x, y, w, h: 1.18, rectRadius: 0.05, fill: { color: COLORS.white }, line: { color: COLORS.line, pt: 1 } });
  slide.addShape('rect', { x, y, w: 0.08, h: 1.18, fill: { color: accent }, line: { color: accent, pt: 0 } });
  slide.addText(title, { x: x + 0.18, y: y + 0.12, w: w - 0.28, h: 0.14, fontSize: 9, color: COLORS.muted, bold: true });
  slide.addText(body, { x: x + 0.18, y: y + 0.31, w: w - 0.28, h: 0.68, fontSize: 12, color: COLORS.text, breakLine: true, margin: 0.02 });
}

function addSectionBand(slide, label, x, y, w, color = COLORS.navy) {
  slide.addShape('roundRect', { x, y, w, h: 0.32, rectRadius: 0.05, fill: { color }, line: { color, pt: 0 } });
  slide.addText(label, { x: x + 0.14, y: y + 0.08, w: w - 0.28, h: 0.12, fontSize: 9, color: COLORS.white, bold: true, align: 'center' });
}

function buildDeck(payload = {}) {
  const d = normalizePayload(payload);
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_WIDE';
  pptx.author = 'OpenAI';
  pptx.company = 'Pensum Asset Management';
  pptx.subject = 'Investeringsforslag';
  pptx.title = `Investeringsforslag ${d.kundeNavn}`;
  let page = 1;
  const assetRows = buildClientAssetRows(d.kundeinfo || {});
  const productMixRows = buildProductMixRows(d.products, d.investerbarKapital);
  const equityProducts = d.products.filter((p) => String(p.report.category || '').includes('equity'));
  const fixedIncomeProducts = d.products.filter((p) => String(p.report.category || '').includes('fixed'));
  const equityRegions = aggregateExposure(d.products, 'regioner', (p) => String(p.report.category || '').includes('equity'));
  const equitySectors = aggregateExposure(d.products, 'sektorer', (p) => String(p.report.category || '').includes('equity'));
  const fixedRegions = aggregateExposure(d.products, 'regioner', (p) => String(p.report.category || '').includes('fixed'));
  const fixedSectors = aggregateExposure(d.products, 'sektorer', (p) => String(p.report.category || '').includes('fixed'));

  // 1 Forside
  {
    const s = pptx.addSlide();
    addChrome(s, page++, formatDateLabel(d.dato));
    s.addText('Illustrativ investeringsskisse', { x: 0.8, y: 1.55, w: 8.8, h: 0.55, fontSize: 28, bold: true, color: COLORS.navy });
    s.addText(d.kundeNavn, { x: 0.8, y: 2.18, w: 8.8, h: 0.45, fontSize: 22, bold: true, color: COLORS.salmon });
    addBodyParagraph(s, 'Utarbeidet av Pensum Asset Management med utgangspunkt i kundeinformasjon, investerbar kapital og valgte Pensum-løsninger.', 0.8, 2.78, 8.6, 0.5, 12, COLORS.text);
    addKpiCard(s, 0.8, 4.1, 2.55, 'Investerbar kapital', `${currency(d.investerbarKapital)} kr`);
    addKpiCard(s, 3.55, 4.1, 2.35, 'Risikoprofil', d.risikoProfil, COLORS.salmon);
    addKpiCard(s, 6.1, 4.1, 2.2, 'Forv. avkastning', pct(d.expected), COLORS.green, 'årlig');
    addKpiCard(s, 8.5, 4.1, 3.0, 'Forv. sluttverdi', `${currency(d.expValue)} kr`, COLORS.navy, `${d.horisont} år`);
    if (d.totalFormue > d.investerbarKapital) {
      addBodyParagraph(s, `Merk: kundens oppgitte samlede aktiva er ${currency(d.totalFormue)} kr, mens denne illustrasjonen tar utgangspunkt i ${currency(d.investerbarKapital)} kr investerbar kapital.`, 0.8, 5.55, 11.4, 0.45, 11, COLORS.muted);
    }
  }

  // 2 Viktig informasjon
  {
    const s = pptx.addSlide();
    addChrome(s, page++, 'Viktig informasjon');
    addTitle(s, 'Viktig informasjon', 'Illustrativ skisse – ikke personlig investeringsråd');
    addBodyParagraph(
      s,
      'Dette dokumentet er utarbeidet som en illustrativ investeringsskisse basert på overordnede og ikke-verifiserte opplysninger gitt i dialog med potensiell kunde. Dokumentet utgjør ikke investeringsrådgivning, ikke en personlig anbefaling, og forutsetter at Pensum Asset Management AS ikke har gjennomført egnethetsvurdering eller full kundeetablering.',
      0.9, 1.95, 11.8, 1.3, 14
    );
    addBodyParagraph(
      s,
      'Ethvert eventuelt kundeforhold og konkrete investeringsråd forutsetter separat kundeetablering, nærmere kartlegging av finansiell situasjon, erfaring, målsetninger, risikobærende evne og øvrige relevante forhold.',
      0.9, 3.5, 11.8, 1.1, 14
    );
    addBodyParagraph(
      s,
      'Porteføljen som presenteres videre er en modellportefølje og er ment som et eksempel på sammensetning og risikospredning. Historisk avkastning er ingen garanti for fremtidig avkastning.',
      0.9, 5.05, 11.8, 0.9, 14
    );
  }

  // 3 Overordnede forutsetninger
  {
    const s = pptx.addSlide();
    addChrome(s, page++, 'Forutsetninger');
    addTitle(s, 'Overordnede forutsetninger', 'Illustrasjonen skiller mellom samlet formue, investerbar kapital og den foreslåtte modellporteføljen');
    addInfoCallout(s, 0.9, 1.9, 2.55, 'Samlet oppgitt formue', `${currency(d.totalFormue)} kr`);
    addInfoCallout(s, 3.7, 1.9, 2.55, 'Investerbar kapital', `${currency(d.investerbarKapital)} kr`);
    addInfoCallout(s, 6.5, 1.9, 2.15, 'Risikoprofil', d.risikoProfil);
    addInfoCallout(s, 8.9, 1.9, 1.7, 'Horisont', `${d.horisont} år`);
    addInfoCallout(s, 10.85, 1.9, 1.65, 'Mål', pct(d.expected));
    addBodyParagraph(
      s,
      'Dette skillet er viktig: kundens totale aktiva beskriver helheten i formuesbildet, mens den investerbare kapitalen er beløpet som faktisk settes i arbeid i modellen som presenteres videre.',
      0.95, 3.1, 11.4, 0.55, 13.5
    );
    addKeyValueTable(s, 'Oppgitt formuesbilde', assetRows.length ? assetRows : [['Ingen aktivafordeling registrert', '—']], 0.95, 4.0, 5.45, 0.24);
    addKeyValueTable(s, 'Foreslått rammeverk', [
      ['Formål', 'Utvikle finansiell formue gjennom en diversifisert modellportefølje'],
      ['Likviditet', 'Likvide hovedbyggesteiner med mulighet for selektive satellitter'],
      ['Porteføljelogikk', 'Kombinasjon av aksjedel, rentedel og utvalgte spesialistmandater'],
      ['Arbeidsmetode', 'Produktene vurderes enkeltvis, før de settes inn i en helhetlig portefølje']
    ], 6.75, 4.0, 5.55, 0.24);
  }

  // 4 Hvordan porteføljen er bygget opp
  {
    const s = pptx.addSlide();
    addChrome(s, page++, 'Porteføljelogikk');
    addTitle(s, 'Hvordan porteføljen er bygget opp', 'Fra kundens kapitalramme til konkrete Pensum-byggesteiner');
    addSectionBand(s, 'TRINN 1 · Kapital og mandat', 0.95, 1.95, 2.5, COLORS.navy);
    addSectionBand(s, 'TRINN 2 · Allokering', 3.65, 1.95, 2.1, COLORS.blue);
    addSectionBand(s, 'TRINN 3 · Produkter', 5.95, 1.95, 2.1, COLORS.teal);
    addSectionBand(s, 'TRINN 4 · Rapport', 8.25, 1.95, 2.0, COLORS.salmon);

    addInsightCard(s, 0.95, 2.45, 3.0, 'Kapitalramme', `Investerbar kapital: ${currency(d.investerbarKapital)} kr`, COLORS.navy);
    addInsightCard(s, 4.15, 2.45, 3.0, 'Allokeringsvalg', `${d.alloc.length} aktivaklasser / ${d.products.length} valgte produkter`, COLORS.blue);
    addInsightCard(s, 7.35, 2.45, 3.0, 'Produktlogikk', 'Hvert produkt brukes med en tydelig rolle i totalporteføljen.', COLORS.teal);

    addBulletSection(s, 'Hovedpoenger', buildAllocationNarrative(d), 0.95, 4.05, 5.65, 1.85);
    addBarRows(s, 'Produktmiks i modellen', d.products.map((p) => ({ navn: p.navn, vekt: p.vekt })), 6.9, 4.05, 5.35, 1.95, COLORS.salmon);
  }

  // 5 Eksempel på illustrativ porteføljesammensetning
  {
    const s = pptx.addSlide();
    addChrome(s, page++, 'Porteføljesammensetning');
    addTitle(s, 'Eksempel på illustrativ porteføljesammensetning', 'Fordeling av investerbar kapital mellom aktivaklasser og valgte byggesteiner');
    addBarRows(s, 'Aktivaklasser', d.alloc, 0.95, 1.95, 5.55, 2.4, COLORS.blue);
    addBarRows(s, 'Valgte produkter', d.products.map((p) => ({ navn: p.navn, vekt: p.vekt })), 6.75, 1.95, 5.55, 2.4, COLORS.teal);
    addKeyValueTable(s, 'Produktmiks og kapital i arbeid', productMixRows.length ? productMixRows : [['Ingen produkter valgt', '—', '—']], 0.95, 4.7, 11.35, 0.24);
  }

  // 6 Aksjedelen
  {
    const s = pptx.addSlide();
    const narrative = buildSectionNarratives(d.products, 'equity');
    const equityRows = equityProducts.map((p) => [p.navn, pct(p.vekt), p.report.role || 'Aksjeeksponering']);
    addChrome(s, page++, narrative.heading);
    addTitle(s, narrative.heading, 'Hvordan aksjedelen er tenkt å bidra i totalporteføljen');
    addBodyParagraph(s, narrative.body, 0.95, 1.95, 5.95, 0.95, 14);
    addBulletSection(s, 'Hva aksjedelen skal bidra med', [
      'Bred global eksponering som hovedmotor for langsiktig verdiskaping.',
      'Nordiske og tematiske tilleggsmandater brukes selektivt for å øke potensialet for meravkastning.',
      'Produktene er valgt for å gi komplementære egenskaper snarere enn overlapp.'
    ], 0.95, 3.05, 5.95, 1.95);
    addBarRows(s, 'Regioneksponering i aksjedelen', equityRegions, 7.0, 1.95, 5.25, 1.95, COLORS.teal);
    addBarRows(s, 'Sektoreksponering i aksjedelen', equitySectors, 7.0, 4.1, 5.25, 1.95, COLORS.blue);
    if (equityRows.length) addKeyValueTable(s, 'Valgte aksjeprodukter', equityRows, 0.95, 5.25, 5.95, 0.22);
  }

  // 7 Rentedelen
  {
    const s = pptx.addSlide();
    const narrative = buildSectionNarratives(d.products, 'fixed-income');
    const fixedRows = fixedIncomeProducts.map((p) => [p.navn, pct(p.vekt), p.report.role || 'Renteeksponering']);
    addChrome(s, page++, narrative.heading);
    addTitle(s, narrative.heading, 'Hvordan rentedelen er tenkt å bidra i totalporteføljen');
    addBodyParagraph(s, narrative.body, 0.95, 1.95, 5.95, 0.95, 14);
    addBulletSection(s, 'Hva rentedelen skal bidra med', [
      'Løpende avkastning og lavere volatilitet enn aksjedelen.',
      'Kredittseleksjon og geografisk spredning brukes for å bygge robust kontantstrøm.',
      'Rentedelen skal fungere som en stabiliserende buffer i totalporteføljen.'
    ], 0.95, 3.05, 5.95, 1.95);
    addBarRows(s, 'Regioneksponering i rentedelen', fixedRegions, 7.0, 1.95, 5.25, 1.95, COLORS.teal);
    addBarRows(s, 'Sektoreksponering i rentedelen', fixedSectors, 7.0, 4.1, 5.25, 1.95, COLORS.salmon);
    if (fixedRows.length) addKeyValueTable(s, 'Valgte renteprodukter', fixedRows, 0.95, 5.25, 5.95, 0.22);
  }

  // 8 Hvorfor denne sammensetningen
  {
    const s = pptx.addSlide();
    addChrome(s, page++, 'Hvorfor denne sammensetningen');
    addTitle(s, 'Hvorfor denne sammensetningen', 'Helheten er viktigere enn enkeltproduktene hver for seg');
    addInsightCard(s, 0.95, 1.95, 3.65, '1. Kjerne og satellitter', 'Porteføljen er bygget rundt robuste kjerneprodukter, supplert med mer spissede ideer der det gir mening.', COLORS.navy);
    addInsightCard(s, 4.8, 1.95, 3.65, '2. Diversifisering', 'Løsningene utfyller hverandre på tvers av geografi, aktivaklasse og investeringsstil.', COLORS.blue);
    addInsightCard(s, 8.65, 1.95, 3.65, '3. Rådgiverlogikk', 'Produktslidene som følger viser hva hver byggestein faktisk tilfører i totalporteføljen.', COLORS.teal);
    addBarRows(s, 'Aggregert regioneksponering', d.eksponering.regioner, 0.95, 3.65, 5.7, 2.25, COLORS.teal);
    addBarRows(s, 'Aggregert sektoreksponering', d.eksponering.sektorer, 6.85, 3.65, 5.45, 2.25, COLORS.salmon);
  }

  // Product modules
  d.products.forEach((product) => {
    const exposure = product.exposure || {};
    const regions = topRows(exposure.regioner, 8);
    const sectors = topRows(exposure.sektorer, 8);
    const underlying = topRows(exposure.underliggende, 10);
    const style = topRows(exposure.stil, 8);

    {
      const s = pptx.addSlide();
      addChrome(s, page++, product.navn);
      addTitle(s, product.report.slideTitle || product.navn, product.report.slideSubtitle || '');
      addKpiCard(s, 0.95, 1.85, 1.7, 'Vekt', pct(product.vekt), COLORS.navy);
      addKpiCard(s, 2.85, 1.85, 2.2, 'Forv. avkastning', Number.isFinite(n(product.report.expectedReturn, NaN)) ? pct(product.report.expectedReturn) : '—', COLORS.green);
      addKpiCard(s, 5.25, 1.85, 2.0, 'Forv. yield', Number.isFinite(n(product.report.expectedYield, NaN)) ? pct(product.report.expectedYield) : '—', COLORS.teal);
      addKpiCard(s, 7.45, 1.85, 4.6, 'Benchmark', product.report.benchmark || '—', COLORS.salmon);
      addBulletSection(s, 'Rolle og investeringscase', [
        product.report.pitch || '',
        product.report.caseText || '',
        product.report.whyIncluded || ''
      ], 0.95, 3.05, 6.0, 1.95);
      addInsightCard(s, 7.2, 3.05, 5.15, 'Rolle i porteføljen', product.report.role || '—', COLORS.blue);
      addInsightCard(s, 7.2, 4.35, 2.45, 'Hvorfor valgt', product.report.whyIncluded || 'Kompletterer helheten i totalporteføljen.', COLORS.teal);
      addInsightCard(s, 9.9, 4.35, 2.45, 'Nøkkelrisiko', product.report.riskText || 'Normal markedsrisiko i tråd med mandatet.', COLORS.salmon);
      if (exposure.disclaimer) {
        addBodyParagraph(s, exposure.disclaimer, 0.95, 5.55, 11.2, 0.4, 10, COLORS.muted);
      }
    }

    {
      const s = pptx.addSlide();
      addChrome(s, page++, `${product.navn} – eksponering`);
      addTitle(s, `${product.navn} – innhold og eksponering`, 'Produkt for produkt – ikke bare aggregert portefølje');
      addBarRows(s, 'Sektorer', sectors, 0.95, 1.95, 5.6, 2.2, COLORS.blue);
      addBarRows(s, 'Regioner', regions, 6.8, 1.95, 5.55, 2.2, COLORS.teal);
      addKeyValueTable(s, 'Underliggende investeringer', underlying.length ? underlying.map((r) => [r.navn, pct(r.vekt)]) : [['Ingen underliggende data', '—']], 0.95, 4.45, 5.7, 0.23);
      addKeyValueTable(s, 'Stil / øvrig', style.length ? style.map((r) => [r.navn, pct(r.vekt)]) : [['Ingen stilfaktorer registrert', '—']], 6.85, 4.45, 5.45, 0.23);
    }
  });

  return pptx;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    if (!PptxGenJS) throw new Error('pptxgenjs er ikke tilgjengelig');
    const pptx = buildDeck(req.body || {});
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
