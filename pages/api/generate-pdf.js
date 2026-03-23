import PptxGenJSImport from 'pptxgenjs';

const PptxGenJS = typeof PptxGenJSImport === 'function'
  ? PptxGenJSImport
  : (PptxGenJSImport?.default || PptxGenJSImport?.PptxGenJS);

const COLORS = {
  navy: '0D2841',
  darkBlue: '012441',
  blue: '6B9DB8',
  salmon: 'C4967E',
  teal: '2D6A6A',
  green: '2D6A4F',
  gold: 'A67B3D',
  purple: '5B4FA0',
  danger: 'B91C1C',
  text: '262626',
  muted: '4A5568',
  light: 'F5F5F5',
  lightBlue: 'E8F0F4',
  line: 'D1D5DB',
  white: 'FFFFFF',
  midBlue: '123C6A',
  softBlue: 'E8F0F4',
  softAmber: 'FDF6F2',
  softGreen: 'E8F0F0',
  softRed: 'FDF6F2'
};

const PRODUCT_CHART_COLORS = ['0D2841', '6B9DB8', 'C4967E', '2D6A6A', 'A67B3D', '5B4FA0', '2D6A4F', '8B5CF6', '059669'];

const ALLOC_COLORS = {
  'Globale Aksjer': '6B9DB8',
  'Norske Aksjer': '0D2841',
  'Høyrente': 'C4967E',
  'Investment Grade': 'D4B8A8',
  'Private Equity': '2D6A6A',
  'Eiendom': 'A67B3D'
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
  'financial-d': 'Pensum Financial Opportunity Fund D',
  'turnstone-pe': 'Turnstone Private Equity',
  'amaron-re': 'Amaron Real Estate',
  'unoterte-aksjer': 'Unoterte aksjer'
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
  },
  'turnstone-pe': {
    slideTitle: 'Private Equity',
    slideSubtitle: 'Illikvid alternativ investering med høyt avkastningspotensial',
    role: 'Alternativ komponent – Private Equity',
    benchmark: 'PE-indeks / illikvid referanse',
    expectedReturn: 15.0,
    expectedYield: 0,
    pitch: 'Gir tilgang til private equity-investeringer med potensial for høyere avkastning enn likvide markeder.',
    caseText: 'Egnet for investorer med lang horisont som tåler illikviditet og J-kurve-effekt.',
    whyIncluded: 'Tilfører diversifisering og avkastningspotensial utover likvide markeder.',
    riskText: 'Illikvid, lang bindingsperiode, J-kurve i tidlig fase.',
    category: 'alternative'
  },
  'amaron-re': {
    slideTitle: 'Eiendom',
    slideSubtitle: 'Illikvid eiendomsinvestering med løpende avkastning',
    role: 'Alternativ komponent – Eiendom',
    benchmark: 'Eiendomsindeks / illikvid referanse',
    expectedReturn: 8.0,
    expectedYield: 4.0,
    pitch: 'Gir eksponering mot eiendomsmarkedet med potensial for stabil løpende avkastning.',
    caseText: 'Passer for investorer som ønsker kontantstrøm og inflasjonsbeskyttelse.',
    whyIncluded: 'Bidrar med diversifisering og stabil yield i totalporteføljen.',
    riskText: 'Illikvid, sensitiv for renteendringer og eiendomsmarkedet.',
    category: 'alternative'
  },
  'unoterte-aksjer': {
    slideTitle: 'Unoterte aksjer',
    slideSubtitle: 'Direkte eierskap i unoterte selskaper',
    role: 'Alternativ komponent – Unoterte aksjer',
    benchmark: 'Unotert aksjereferanse',
    expectedReturn: 12.0,
    expectedYield: 0,
    pitch: 'Gir eksponering mot unoterte selskaper med vekstpotensial.',
    caseText: 'Egnet for investorer med lang horisont og kompetanse på direkte investeringer.',
    whyIncluded: 'Tilfører avkastningspotensial og diversifisering utover børsnoterte markeder.',
    riskText: 'Illikvid, høy konsentrasjonsrisiko, begrenset transparens.',
    category: 'alternative'
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

function parseHistDate(dateStr = '') {
  if (!dateStr) return null;
  const trimmed = String(dateStr).trim();
  const monthly = trimmed.match(/^(\d{4})-(\d{2})$/);
  if (monthly) {
    const [, y, m] = monthly;
    return new Date(Number(y), Number(m) - 1, 1);
  }
  const daily = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (daily) {
    const [, y, m, d] = daily;
    return new Date(Number(y), Number(m) - 1, Number(d));
  }
  const parsed = new Date(trimmed);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function getMonthlyData(productId, historikkMap = {}) {
  const hist = historikkMap?.[productId];
  const raw = Array.isArray(hist?.data) ? hist.data : [];
  const data = raw
    .map((row) => ({ dato: row?.dato, verdi: n(row?.verdi, NaN), parsed: parseHistDate(row?.dato) }))
    .filter((row) => row.parsed && Number.isFinite(row.verdi))
    .sort((a, b) => a.parsed - b.parsed);
  if (data.length < 3) return null;

  const monthMap = new Map();
  data.forEach((row) => {
    const key = `${row.parsed.getFullYear()}-${String(row.parsed.getMonth() + 1).padStart(2, '0')}`;
    monthMap.set(key, { dato: key, verdi: row.verdi, parsed: row.parsed });
  });
  const monthly = Array.from(monthMap.values()).sort((a, b) => a.parsed - b.parsed);
  return monthly.length >= 3 ? monthly : null;
}

function computeStatsFromMonthly(monthly) {
  if (!monthly || monthly.length < 3) return null;
  const returns = [];
  for (let i = 1; i < monthly.length; i += 1) {
    const prev = monthly[i - 1].verdi;
    const curr = monthly[i].verdi;
    if (Number.isFinite(prev) && prev !== 0 && Number.isFinite(curr)) returns.push((curr - prev) / prev);
  }
  if (!returns.length) return null;

  const mean = returns.reduce((sum, v) => sum + v, 0) / returns.length;
  const variance = returns.reduce((sum, v) => sum + ((v - mean) ** 2), 0) / returns.length;
  const volatility = Math.sqrt(variance) * Math.sqrt(12) * 100;
  const annualized = ((monthly[monthly.length - 1].verdi / monthly[0].verdi) ** (12 / returns.length) - 1) * 100;
  const totalReturn = ((monthly[monthly.length - 1].verdi / monthly[0].verdi) - 1) * 100;
  let peak = monthly[0].verdi;
  let maxDrawdown = 0;
  monthly.forEach((point) => {
    if (point.verdi > peak) peak = point.verdi;
    const dd = peak > 0 ? ((point.verdi - peak) / peak) * 100 : 0;
    if (dd < maxDrawdown) maxDrawdown = dd;
  });
  const sharpe = volatility > 0 ? (annualized - 3) / volatility : 0;
  return {
    annualized: parseFloat(annualized.toFixed(1)),
    totalReturn: parseFloat(totalReturn.toFixed(1)),
    volatility: parseFloat(volatility.toFixed(1)),
    maxDrawdown: parseFloat(maxDrawdown.toFixed(1)),
    sharpe: parseFloat(sharpe.toFixed(2))
  };
}

function computeProductStats(productId, historikkMap = {}) {
  const monthly = getMonthlyData(productId, historikkMap);
  return computeStatsFromMonthly(monthly);
}

function computeProductStatsPeriod(productId, historikkMap, yearsBack) {
  const monthly = getMonthlyData(productId, historikkMap);
  if (!monthly) return null;
  const lastDate = monthly[monthly.length - 1].parsed;
  const cutoff = new Date(lastDate.getFullYear() - yearsBack, lastDate.getMonth(), 1);
  const filtered = monthly.filter((m) => m.parsed >= cutoff);
  return computeStatsFromMonthly(filtered);
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
  const historiskPortefolje = payload.historiskPortefolje || {};
  const aktivafordeling = Array.isArray(payload.aktivafordeling) ? payload.aktivafordeling : [];
  const scenarioData = Array.isArray(payload.scenarioData) ? payload.scenarioData : [];
  const scenarioParams = payload.scenarioParams || {};
  const verdiutvikling = Array.isArray(payload.verdiutvikling) ? payload.verdiutvikling : [];
  const pensumForventetAvkastning = n(payload.pensumForventetAvkastning, expected);
  const pensumLikviditet = payload.pensumLikviditet || { likvid: 100, illikvid: 0 };

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
    kundeinfo,
    produktHistorikk: payload.produktHistorikk || {},
    historiskPortefolje,
    aktivafordeling,
    scenarioData,
    scenarioParams,
    verdiutvikling,
    pensumForventetAvkastning,
    pensumLikviditet,
    rapportMode: !!payload.rapportMode,
    snapshotCharts: payload.snapshotCharts || [],
    drawdownChart: payload.drawdownChart || null,
    aggregertEksponering: payload.aggregertEksponering || null
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
  // Use aktivafordeling (from Pensum products) instead of index-based alloc
  const fordeling = Array.isArray(d.aktivafordeling) ? d.aktivafordeling : [];
  const aksjer = n(fordeling.find(a => a.name === 'Aksjer')?.value, 0);
  const renter = n(fordeling.find(a => a.name === 'Renter')?.value, 0);
  const alternatives = n(fordeling.find(a => a.name === 'Alternativer')?.value, 0);
  const blandet = n(fordeling.find(a => a.name === 'Blandet')?.value, 0);
  return [
    `Porteføljen tar utgangspunkt i ${pct(aksjer)} aksjeeksponering${renter > 0 ? ', ' + pct(renter) + ' rentedel' : ''}${blandet > 0 ? ', ' + pct(blandet) + ' blandet' : ''}` + (alternatives > 0 ? ` og ${pct(alternatives)} alternative komponenter.` : '.'),
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
    if (type === 'alternative') return cat.includes('alternativ') || cat === 'alternative';
    return role.includes('rente') || cat.includes('fixed');
  });
  if (!filtered.length) {
    const labels = { equity: 'Aksjedelen', 'fixed-income': 'Rentedelen', alternative: 'Alternative investeringer' };
    return {
      heading: labels[type] || type,
      body: `Det er ikke valgt egne ${type === 'equity' ? 'aksje' : type === 'alternative' ? 'alternative' : 'rente'}produkter i denne illustrasjonen.`
    };
  }
  const topNames = filtered.slice(0, 3).map((p) => p.navn).join(', ');
  const bodies = {
    equity: `Aksjedelen er bygget rundt ${topNames}. Hensikten er å kombinere bred global eksponering med utvalgte satellitter og nordiske idéer, slik at porteføljen får både robusthet og potensial for meravkastning.`,
    'fixed-income': `Rentedelen er bygget rundt ${topNames}. Hensikten er å kombinere løpende kontantstrøm med kredittseleksjon og en stabiliserende effekt mot aksjedelen.`,
    alternative: `Den alternative delen består av ${topNames}. Disse komponentene er ment å tilføre diversifisering, illikviditetspremie og eksponering mot aktivaklasser som ikke korrelerer fullt ut med likvide markeder.`
  };
  const headings = { equity: 'Aksjedelen', 'fixed-income': 'Rentedelen', alternative: 'Alternative investeringer' };
  return {
    heading: headings[type] || type,
    body: bodies[type] || ''
  };
}

function buildDeck(payload = {}) {
  const d = normalizePayload(payload);
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_WIDE';
  pptx.author = 'Pensum Asset Management';
  pptx.company = 'Pensum Asset Management';
  pptx.subject = 'Investeringsforslag';
  pptx.title = `Investeringsforslag ${d.kundeNavn}`;
  let page = 1;

  const hasAlternatives = d.products.some((p) => {
    const cat = String(p.report?.category || '').toLowerCase();
    return cat.includes('alternativ') || cat === 'alternative';
  });

  // Compute weighted yield
  let yieldSum = 0, yieldTotal = 0;
  d.products.forEach((p) => {
    const y = n(p.report.expectedYield, NaN);
    if (Number.isFinite(y) && p.vekt > 0) { yieldSum += y * (p.vekt / 100); yieldTotal += p.vekt / 100; }
  });
  const vektetYield = yieldTotal > 0 ? yieldSum / yieldTotal : 0;

  // Aksje/rente split from aktivafordeling
  const aksjeAndel = d.aktivafordeling.find((a) => a.name === 'Aksjer')?.value || 0;
  const renteAndel = d.aktivafordeling.find((a) => a.name === 'Renter')?.value || 0;

  // 1 Forside
  {
    const s = pptx.addSlide();
    addChrome(s, page++, formatDateLabel(d.dato));
    s.addText('Investeringsforslag', { x: 0.8, y: 1.55, w: 8.8, h: 0.55, fontSize: 28, bold: true, color: COLORS.navy });
    s.addText(d.kundeNavn, { x: 0.8, y: 2.18, w: 8.8, h: 0.45, fontSize: 22, bold: true, color: COLORS.salmon });
    addBodyParagraph(s, 'Utarbeidet av Pensum Asset Management med utgangspunkt i kundeinformasjon, investerbar kapital og valgte Pensum-løsninger.', 0.8, 2.78, 8.6, 0.5, 12, COLORS.text);

    // 6 KPI cards on front page
    const kpiY = 3.85;
    addKpiCard(s, 0.8, kpiY, 2.0, 'Investert beløp', `${currency(d.investerbarKapital)} kr`);
    addKpiCard(s, 3.0, kpiY, 1.85, 'Forv. avkastning', pct(d.pensumForventetAvkastning), COLORS.green, 'årlig');
    addKpiCard(s, 5.05, kpiY, 1.65, 'Forv. yield', Number.isFinite(vektetYield) ? pct(vektetYield) : '—', COLORS.teal, 'årlig');
    addKpiCard(s, 6.9, kpiY, 1.65, 'Aksje / Rente', `${aksjeAndel.toFixed(0)} / ${renteAndel.toFixed(0)}%`);
    addKpiCard(s, 8.75, kpiY, 1.65, 'Likviditet', `${d.pensumLikviditet.likvid.toFixed(0)}% likvid`);
    addKpiCard(s, 10.6, kpiY, 1.9, 'Forv. sluttverdi', `${currency(d.expValue)} kr`, COLORS.navy, `${d.horisont} år`);

    if (d.totalFormue > d.investerbarKapital) {
      addBodyParagraph(s, `Merk: kundens oppgitte samlede aktiva er ${currency(d.totalFormue)} kr, mens denne illustrasjonen tar utgangspunkt i ${currency(d.investerbarKapital)} kr investerbar kapital.`, 0.8, 5.35, 11.4, 0.45, 11, COLORS.muted);
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
    addTitle(s, 'Overordnede forutsetninger', 'Illustrasjonen skiller mellom samlet formue og kapitalen som faktisk settes i arbeid');
    addInfoCallout(s, 0.9, 1.9, 2.55, 'Samlet oppgitt formue', `${currency(d.totalFormue)} kr`);
    addInfoCallout(s, 3.7, 1.9, 2.55, 'Investerbar kapital', `${currency(d.investerbarKapital)} kr`);
    addInfoCallout(s, 6.5, 1.9, 2.15, 'Risikoprofil', d.risikoProfil);
    addInfoCallout(s, 8.9, 1.9, 1.7, 'Horisont', `${d.horisont} år`);
    addInfoCallout(s, 10.85, 1.9, 1.65, 'Mål', pct(d.expected));
    addBodyParagraph(
      s,
      'Dette er et viktig skille i forslaget: kundens totale aktiva beskriver helheten i formuesbildet, mens den investerbare kapitalen er beløpet som faktisk brukes i modellen som presenteres videre.',
      0.95, 3.25, 11.6, 0.7, 14
    );
    addKeyValueTable(s, 'Foreslått rammeverk', [
      ['Formål', 'Utvikle finansiell formue gjennom en diversifisert modellportefølje'],
      ['Likviditet', 'Likvide hovedbyggesteiner, med eventuelle tillegg av spesialmandater der det er relevant'],
      ['Porteføljelogikk', 'Kombinasjon av aksjedel, rentedel og utvalgte satellitter'],
      ['Arbeidsmetode', 'Produktslidene viser innhold og eksponering produkt for produkt']
    ], 0.95, 4.3, 11.2);
  }

  // 4 Porteføljelogikk
  {
    const s = pptx.addSlide();
    addChrome(s, page++, 'Porteføljelogikk');
    addTitle(s, 'Hvordan porteføljen er bygget opp', 'Fra overordnet allokering til konkrete byggesteiner');
    const bullets = buildAllocationNarrative(d);
    addBulletSection(s, 'Hovedpoenger', bullets, 0.95, 1.95, 6.1, 2.1);
    addKeyValueTable(s, 'Valgte byggesteiner', productSummaryRows(d.products), 7.25, 1.95, 5.1);
    addBodyParagraph(
      s,
      'Modellen er bevisst bygget slik at hver løsning skal ha en tydelig rolle. Kjerneprodukter bærer hovedvekten, mens mer spissede løsninger brukes for å forbedre diversifisering og forventet avkastningsprofil.',
      0.95, 4.55, 11.2, 0.9, 14
    );
  }

  // 5 Porteføljesammensetning — aktivafordeling + produkter side-by-side
  {
    const s = pptx.addSlide();
    addChrome(s, page++, 'Porteføljesammensetning');
    addTitle(s, 'Anbefalt porteføljesammensetning', 'Aktivafordeling og Pensum-produkter');

    // Left: Aktivafordeling (basert på valgte Pensum-produkter)
    const rapportAktiva = d.aktivafordeling.filter(a => n(a.value, 0) > 0);
    const rapportTotalVekt = rapportAktiva.reduce((s, a) => s + n(a.value, 0), 0) || 1;
    const AKTIVA_COLORS = { 'Aksjer': COLORS.navy, 'Renter': COLORS.salmon, 'Alternativer': COLORS.teal, 'Blandet': COLORS.gold };
    const allocHeaders = [[
      { text: 'Aktivaklasse', options: { bold: true, color: COLORS.navy, fontSize: 9 } },
      { text: 'Andel', options: { bold: true, color: COLORS.navy, fontSize: 9, align: 'center' } },
      { text: 'Beløp', options: { bold: true, color: COLORS.navy, fontSize: 9, align: 'right' } }
    ]];
    const allocRows = rapportAktiva.map((a) => {
      const normVekt = (n(a.value, 0) / rapportTotalVekt) * 100;
      return [
        { text: a.name, options: { fontSize: 9 } },
        { text: pct(normVekt), options: { fontSize: 9, align: 'center' } },
        { text: `${currency((normVekt / 100) * d.investerbarKapital)} kr`, options: { fontSize: 9, align: 'right' } }
      ];
    });
    s.addText('Aktivafordeling', { x: 0.95, y: 1.85, w: 5.5, h: 0.18, fontSize: 11, color: COLORS.navy, bold: true });
    s.addTable([...allocHeaders, ...allocRows], {
      x: 0.95, y: 2.08, w: 5.5, rowH: 0.26, fontSize: 9, border: { pt: 1, color: COLORS.line }, fill: COLORS.white, color: COLORS.text, margin: 0.04
    });

    // Right: Produktsammensetning
    const prodHeaders = [[
      { text: 'Produkt', options: { bold: true, color: COLORS.navy, fontSize: 9 } },
      { text: 'Vekt', options: { bold: true, color: COLORS.navy, fontSize: 9, align: 'center' } },
      { text: 'Type', options: { bold: true, color: COLORS.navy, fontSize: 9, align: 'center' } },
      { text: 'Forv. avk.', options: { bold: true, color: COLORS.navy, fontSize: 9, align: 'right' } },
      { text: 'Yield', options: { bold: true, color: COLORS.navy, fontSize: 9, align: 'right' } }
    ]];
    const prodRows = d.products.map((p) => {
      const cat = String(p.report?.category || '').toLowerCase();
      const typeLbl = cat.includes('equity') || cat.includes('nordic') || cat.includes('thematic') || cat.includes('sector') ? 'Aksje' : cat.includes('fixed') ? 'Rente' : cat.includes('balanced') || cat.includes('blandet') ? 'Blandet' : cat.includes('alternativ') || cat === 'alternative' ? 'Alt.' : 'Annet';
      return [
        { text: p.navn, options: { fontSize: 8.5, bold: true } },
        { text: pct(p.vekt), options: { fontSize: 8.5, align: 'center' } },
        { text: typeLbl, options: { fontSize: 8, align: 'center', color: typeLbl === 'Aksje' ? '1D4ED8' : typeLbl === 'Rente' ? 'C2410C' : typeLbl === 'Alt.' ? COLORS.teal : COLORS.muted } },
        { text: Number.isFinite(n(p.report.expectedReturn, NaN)) ? pct(p.report.expectedReturn) : '—', options: { fontSize: 8.5, align: 'right', color: COLORS.green } },
        { text: Number.isFinite(n(p.report.expectedYield, NaN)) ? pct(p.report.expectedYield) : '—', options: { fontSize: 8.5, align: 'right', color: COLORS.teal } }
      ];
    });
    s.addText('Pensum Porteføljesammensetning', { x: 6.7, y: 1.85, w: 5.7, h: 0.18, fontSize: 11, color: COLORS.navy, bold: true });
    s.addTable([...prodHeaders, ...prodRows], {
      x: 6.7, y: 2.08, w: 5.7, rowH: 0.25, fontSize: 9, border: { pt: 1, color: COLORS.line }, fill: COLORS.white, color: COLORS.text, margin: 0.04
    });

    // Donut chart: Aktivafordeling (left) + Produktvekter (right)
    const chartY = Math.max(2.08 + (allocRows.length + 1) * 0.26 + 0.25, 2.08 + (prodRows.length + 1) * 0.25 + 0.25);
    if (chartY < 5.4 && rapportAktiva.length > 0) {
      const AKTIVA_CHART_COLORS = { 'Aksjer': COLORS.navy, 'Renter': COLORS.salmon, 'Alternativer': COLORS.teal, 'Blandet': COLORS.gold };
      s.addText('Aktivafordeling', { x: 0.95, y: chartY, w: 5.5, h: 0.18, fontSize: 10, color: COLORS.navy, bold: true });
      s.addChart('doughnut', [{
        name: 'Aktivafordeling',
        labels: rapportAktiva.map(a => a.name),
        values: rapportAktiva.map(a => n(a.value, 0)),
      }], {
        x: 0.95, y: chartY + 0.22, w: 2.5, h: 2.5,
        showLegend: false, showTitle: false, showValue: false, showPercent: false, showLabel: false,
        holeSize: 55,
        chartColors: rapportAktiva.map(a => AKTIVA_CHART_COLORS[a.name] || COLORS.blue),
        border: { pt: 0 }, shadow: { type: 'none' },
      });
      // Legend for aktivafordeling
      rapportAktiva.forEach((a, i) => {
        const ly = chartY + 0.35 + i * 0.32;
        const normVekt = (n(a.value, 0) / rapportTotalVekt) * 100;
        s.addShape('roundRect', { x: 3.6, y: ly + 0.03, w: 0.16, h: 0.16, rectRadius: 0.02, fill: { color: AKTIVA_CHART_COLORS[a.name] || COLORS.blue } });
        s.addText(`${a.name}  ${pct(normVekt)}`, { x: 3.82, y: ly, w: 2.4, h: 0.22, fontSize: 9, color: COLORS.text });
      });
    }
    if (chartY < 5.4 && d.products.length > 0) {
      s.addText('Produktvekter', { x: 6.7, y: chartY, w: 5.7, h: 0.18, fontSize: 10, color: COLORS.navy, bold: true });
      s.addChart('doughnut', [{
        name: 'Produkter',
        labels: d.products.map(p => p.navn),
        values: d.products.map(p => p.vekt),
      }], {
        x: 6.7, y: chartY + 0.22, w: 2.5, h: 2.5,
        showLegend: false, showTitle: false, showValue: false, showPercent: false, showLabel: false,
        holeSize: 55,
        chartColors: d.products.map((_, i) => PRODUCT_CHART_COLORS[i % PRODUCT_CHART_COLORS.length]),
        border: { pt: 0 }, shadow: { type: 'none' },
      });
      // Legend for products
      d.products.slice(0, 7).forEach((p, i) => {
        const ly = chartY + 0.35 + i * 0.28;
        s.addShape('roundRect', { x: 9.35, y: ly + 0.03, w: 0.14, h: 0.14, rectRadius: 0.02, fill: { color: PRODUCT_CHART_COLORS[i % PRODUCT_CHART_COLORS.length] } });
        s.addText(`${p.navn}`, { x: 9.55, y: ly, w: 2.2, h: 0.2, fontSize: 8, color: COLORS.text, fit: 'shrink' });
        s.addText(pct(p.vekt), { x: 11.8, y: ly, w: 0.65, h: 0.2, fontSize: 8, bold: true, color: COLORS.navy, align: 'right' });
      });
    }
  }

  // 6 Historisk avkastning (1, 3, 5 år)
  {
    const s = pptx.addSlide();
    addChrome(s, page++, 'Historisk avkastning');
    addTitle(s, 'Historisk avkastning per produkt', 'Avkastning på 1, 3 og 5 års basis med risikometrikker');

    const headerRow = [
      { text: 'Produkt', options: { bold: true, color: COLORS.white, fontSize: 8.5, fill: COLORS.navy } },
      { text: 'Vekt', options: { bold: true, color: COLORS.white, fontSize: 8.5, fill: COLORS.navy, align: 'center' } },
      { text: '1 år', options: { bold: true, color: 'BAD8FF', fontSize: 8.5, fill: COLORS.navy, align: 'right' } },
      { text: '3 år p.a.', options: { bold: true, color: 'BAD8FF', fontSize: 8.5, fill: COLORS.navy, align: 'right' } },
      { text: '5 år p.a.', options: { bold: true, color: 'BAD8FF', fontSize: 8.5, fill: COLORS.navy, align: 'right' } },
      { text: 'Volatilitet', options: { bold: true, color: COLORS.white, fontSize: 8.5, fill: COLORS.navy, align: 'right' } },
      { text: 'Sharpe', options: { bold: true, color: COLORS.white, fontSize: 8.5, fill: COLORS.navy, align: 'right' } },
      { text: 'Maks DD', options: { bold: true, color: COLORS.white, fontSize: 8.5, fill: COLORS.navy, align: 'right' } }
    ];

    const fmtRet = (v) => Number.isFinite(v) ? (v >= 0 ? '+' : '') + v.toFixed(1) + '%' : '—';
    const retColor = (v) => Number.isFinite(v) ? (v >= 0 ? COLORS.green : COLORS.danger) : COLORS.muted;
    const sharpeColor = (v) => !Number.isFinite(v) ? COLORS.muted : v >= 1 ? COLORS.green : v >= 0.5 ? 'D97706' : COLORS.danger;

    const dataRows = d.products.map((p) => {
      const s1 = computeProductStatsPeriod(p.id, d.produktHistorikk, 1);
      const s3 = computeProductStatsPeriod(p.id, d.produktHistorikk, 3);
      const s5 = computeProductStatsPeriod(p.id, d.produktHistorikk, 5);
      const fullStats = computeProductStats(p.id, d.produktHistorikk);
      return [
        { text: p.navn, options: { fontSize: 8.5, bold: true, color: COLORS.navy } },
        { text: pct(p.vekt), options: { fontSize: 8.5, align: 'center', color: COLORS.muted } },
        { text: fmtRet(s1?.totalReturn), options: { fontSize: 8.5, align: 'right', bold: true, color: retColor(s1?.totalReturn) } },
        { text: fmtRet(s3?.annualized), options: { fontSize: 8.5, align: 'right', bold: true, color: retColor(s3?.annualized) } },
        { text: fmtRet(s5?.annualized), options: { fontSize: 8.5, align: 'right', bold: true, color: retColor(s5?.annualized) } },
        { text: fullStats ? pct(fullStats.volatility) : '—', options: { fontSize: 8.5, align: 'right', color: COLORS.text } },
        { text: fullStats ? String(fullStats.sharpe) : '—', options: { fontSize: 8.5, align: 'right', bold: true, color: sharpeColor(fullStats?.sharpe) } },
        { text: fullStats ? pct(fullStats.maxDrawdown) : '—', options: { fontSize: 8.5, align: 'right', color: COLORS.danger } }
      ];
    });

    s.addTable([headerRow, ...dataRows], {
      x: 0.65, y: 1.85, w: 12.05, rowH: 0.3, fontSize: 9, border: { pt: 1, color: COLORS.line }, fill: COLORS.white, color: COLORS.text, margin: 0.05
    });

    const footY = 1.85 + (dataRows.length + 1) * 0.3 + 0.15;
    if (footY < 6.6) {
      addBodyParagraph(s, 'Avkastning beregnet fra månedlige indeksverdier. Sharpe (risikofri rente 3%). Volatilitet og maks drawdown basert på hele tilgjengelige perioden.', 0.65, footY, 12.0, 0.35, 9, COLORS.muted);
    }

    // Historical portfolio returns at bottom if data available
    const histPort = d.historiskPortefolje;
    const histYears = [
      { label: '2026 YTD', key: 'aar2026' },
      { label: '2025', key: 'aar2025' },
      { label: '2024', key: 'aar2024' },
      { label: '2023', key: 'aar2023' },
      { label: '2022', key: 'aar2022' }
    ];
    const hasHistPort = histYears.some(({ key }) => Number.isFinite(n(histPort[key], NaN)));
    if (hasHistPort) {
      const boxY = footY + 0.45;
      if (boxY < 5.9) {
        s.addShape('roundRect', { x: 0.65, y: boxY, w: 12.05, h: 1.15, rectRadius: 0.06, fill: { color: COLORS.softBlue }, line: { color: COLORS.navy, pt: 2 } });
        s.addText('Din porteføljes historiske avkastning (vektet)', { x: 0.95, y: boxY + 0.1, w: 6, h: 0.16, fontSize: 10, color: COLORS.navy, bold: true });
        const cardW = 2.2;
        histYears.forEach(({ label, key }, idx) => {
          const v = n(histPort[key], NaN);
          const cx = 0.95 + idx * (cardW + 0.15);
          s.addShape('roundRect', { x: cx, y: boxY + 0.35, w: cardW, h: 0.65, rectRadius: 0.04, fill: { color: COLORS.white }, line: { color: COLORS.line, pt: 1 } });
          s.addText(label, { x: cx, y: boxY + 0.38, w: cardW, h: 0.16, fontSize: 8, color: COLORS.muted, align: 'center', bold: true });
          const valTxt = Number.isFinite(v) ? (v >= 0 ? '+' : '') + v.toFixed(1) + '%' : '—';
          const valCol = Number.isFinite(v) ? (v >= 0 ? COLORS.green : COLORS.danger) : COLORS.muted;
          s.addText(valTxt, { x: cx, y: boxY + 0.55, w: cardW, h: 0.3, fontSize: 16, color: valCol, align: 'center', bold: true });
        });
      }
    }
  }

  // 6b Historisk indeksert utvikling (linjediagram)
  {
    const chartSeries = [];
    const allDates = new Set();
    d.products.forEach((p) => {
      const monthly = getMonthlyData(p.id, d.produktHistorikk);
      if (!monthly || monthly.length < 3) return;
      const base = monthly[0].verdi;
      if (!base) return;
      const indexed = monthly.map(m => ({ dato: m.dato, verdi: (m.verdi / base) * 100 }));
      indexed.forEach(m => allDates.add(m.dato));
      chartSeries.push({ id: p.id, navn: p.navn, data: indexed });
    });
    if (chartSeries.length >= 2) {
      const sortedDates = Array.from(allDates).sort();
      // Thin out labels for readability
      const labelInterval = Math.max(1, Math.floor(sortedDates.length / 12));
      const labels = sortedDates.map((d, i) => i % labelInterval === 0 ? d : '');
      const series = chartSeries.map((s, idx) => ({
        name: s.navn,
        labels,
        values: sortedDates.map(date => {
          const point = s.data.find(d => d.dato === date);
          return point ? point.verdi : null;
        }),
      }));

      const sl = pptx.addSlide();
      addChrome(sl, page++, 'Historisk utvikling');
      addTitle(sl, 'Indeksert historisk utvikling', 'Alle produkter indeksert til 100 ved periodens start');

      sl.addChart('line', series, {
        x: 0.65, y: 1.85, w: 11.7, h: 4.8,
        showLegend: true,
        legendPos: 'b',
        legendFontSize: 8,
        showTitle: false,
        lineSize: 2,
        lineSmooth: false,
        showValue: false,
        catAxisLabelFontSize: 7,
        catAxisLabelColor: COLORS.muted,
        catAxisOrientation: 'minMax',
        valAxisLabelFontSize: 8,
        valAxisLabelColor: COLORS.muted,
        valAxisNumFmt: '0',
        catGridLine: { style: 'none' },
        valGridLine: { color: COLORS.line, style: 'dash', size: 0.5 },
        chartColors: chartSeries.map((_, i) => PRODUCT_CHART_COLORS[i % PRODUCT_CHART_COLORS.length]),
        plotArea: { fill: { color: COLORS.white }, border: { color: COLORS.line, pt: 0.5 } },
      });
    }
  }

  // 6c Avkastning & yield sammenligning (søylediagram)
  {
    const productsWithReturn = d.products.filter(p => Number.isFinite(n(p.report.expectedReturn, NaN)));
    if (productsWithReturn.length >= 2) {
      const sl = pptx.addSlide();
      addChrome(sl, page++, 'Avkastning og yield');
      addTitle(sl, 'Forventet avkastning og yield per produkt', 'Sammenligning av produktenes forventede bidrag');

      const chartData = [
        {
          name: 'Forventet avkastning',
          labels: productsWithReturn.map(p => p.navn),
          values: productsWithReturn.map(p => n(p.report.expectedReturn, 0)),
        },
        {
          name: 'Forventet yield',
          labels: productsWithReturn.map(p => p.navn),
          values: productsWithReturn.map(p => n(p.report.expectedYield, 0)),
        }
      ];

      sl.addChart('bar', chartData, {
        x: 0.65, y: 1.85, w: 11.7, h: 3.5,
        showLegend: true,
        legendPos: 'b',
        legendFontSize: 9,
        showTitle: false,
        showValue: true,
        valueFontSize: 8,
        valAxisNumFmt: '0.0"%"',
        catAxisLabelFontSize: 8,
        catAxisLabelColor: COLORS.text,
        valAxisLabelFontSize: 8,
        valAxisLabelColor: COLORS.muted,
        catGridLine: { style: 'none' },
        valGridLine: { color: COLORS.line, style: 'dash', size: 0.5 },
        chartColors: [COLORS.navy, COLORS.teal],
        plotArea: { fill: { color: COLORS.white }, border: { color: COLORS.line, pt: 0.5 } },
      });

      // Product weight bar below
      sl.addText('Porteføljevekt per produkt', { x: 0.65, y: 5.55, w: 11.7, h: 0.18, fontSize: 10, color: COLORS.navy, bold: true });
      const weightData = [{
        name: 'Vekt',
        labels: d.products.map(p => p.navn),
        values: d.products.map(p => p.vekt),
      }];
      sl.addChart('bar', weightData, {
        x: 0.65, y: 5.75, w: 11.7, h: 1.0,
        showLegend: false,
        showTitle: false,
        showValue: true,
        valueFontSize: 8,
        valAxisNumFmt: '0.0"%"',
        catAxisLabelFontSize: 7,
        catAxisLabelColor: COLORS.text,
        valAxisHidden: true,
        catGridLine: { style: 'none' },
        valGridLine: { style: 'none' },
        chartColors: [COLORS.salmon],
        plotArea: { fill: { color: COLORS.white } },
      });
    }
  }

  // 6d Kundeoversikt (vis kundens eksisterende formue om data finnes)
  {
    const ki = d.kundeinfo;
    const kundeAktiva = [
      { navn: 'Aksjer', verdi: n(ki.aksjerKunde, 0) },
      { navn: 'Aksjefond', verdi: n(ki.aksjefondKunde, 0) },
      { navn: 'Renter', verdi: n(ki.renterKunde, 0) },
      { navn: 'Kontanter', verdi: n(ki.kontanterKunde, 0) },
      { navn: 'PE-fond', verdi: n(ki.peFondKunde, 0) },
      { navn: 'Unoterte aksjer', verdi: n(ki.unoterteAksjerKunde, 0) },
      { navn: 'Shipping', verdi: n(ki.shippingKunde, 0) },
      { navn: 'Egen eiendom', verdi: n(ki.egenEiendomKunde, 0) },
      { navn: 'Eiendom syndikat', verdi: n(ki.eiendomSyndikatKunde, 0) },
      { navn: 'Eiendom fond', verdi: n(ki.eiendomFondKunde, 0) },
    ].filter(a => a.verdi > 0);

    if (kundeAktiva.length > 0) {
      const totalKunde = kundeAktiva.reduce((s, a) => s + a.verdi, 0);
      const sl = pptx.addSlide();
      addChrome(sl, page++, 'Kundeoversikt');
      addTitle(sl, 'Eksisterende formuesoversikt', `${d.kundeNavn} – samlet oppgitt formue ${currency(d.totalFormue)} kr`);

      // KPI summary
      addKpiCard(sl, 0.95, 1.85, 2.6, 'Samlet formue', `${currency(d.totalFormue)} kr`);
      addKpiCard(sl, 3.75, 1.85, 2.6, 'Investerbar kapital', `${currency(d.investerbarKapital)} kr`, COLORS.green);
      addKpiCard(sl, 6.55, 1.85, 2.4, 'Risikoprofil', d.risikoProfil, COLORS.navy);
      addKpiCard(sl, 9.15, 1.85, 2.4, 'Horisont', `${d.horisont} år`, COLORS.teal);

      // Donut chart for existing assets
      const KI_COLORS = ['0D2841', '6B9DB8', 'C4967E', '2D6A6A', 'A67B3D', '5B4FA0', '2D6A4F', '8B5CF6', '059669', 'DC2626'];
      sl.addChart('doughnut', [{
        name: 'Formue',
        labels: kundeAktiva.map(a => a.navn),
        values: kundeAktiva.map(a => a.verdi),
      }], {
        x: 0.95, y: 3.1, w: 3.0, h: 3.0,
        showLegend: false, showTitle: false, showValue: false, showPercent: false, showLabel: false,
        holeSize: 50,
        chartColors: kundeAktiva.map((_, i) => KI_COLORS[i % KI_COLORS.length]),
        border: { pt: 0 }, shadow: { type: 'none' },
      });

      // Table with amounts
      const kiHeaders = [[
        { text: 'Aktivaklasse', options: { bold: true, color: COLORS.white, fontSize: 9, fill: COLORS.navy } },
        { text: 'Beløp', options: { bold: true, color: COLORS.white, fontSize: 9, fill: COLORS.navy, align: 'right' } },
        { text: 'Andel', options: { bold: true, color: COLORS.white, fontSize: 9, fill: COLORS.navy, align: 'center' } },
      ]];
      const kiRows = kundeAktiva.map((a, i) => [
        { text: a.navn, options: { fontSize: 9, color: COLORS.text } },
        { text: `${currency(a.verdi)} kr`, options: { fontSize: 9, align: 'right', color: COLORS.navy, bold: true } },
        { text: pct((a.verdi / totalKunde) * 100), options: { fontSize: 9, align: 'center', color: COLORS.muted } },
      ]);
      sl.addTable([...kiHeaders, ...kiRows], {
        x: 4.3, y: 3.1, w: 8.0, rowH: 0.28, fontSize: 9,
        border: { pt: 1, color: COLORS.line }, fill: COLORS.white, color: COLORS.text, margin: 0.04
      });
    }
  }

  // 7 Rapport-modus: indeksert avkastning + drawdown, ellers scenarioanalyse
  if (d.rapportMode && d.snapshotCharts.length > 0) {
    // Indexed performance slides (1yr, 3yr, 5yr)
    const SNAP_CHART_COLORS = [COLORS.navy, COLORS.blue, COLORS.salmon, COLORS.muted];
    d.snapshotCharts.forEach((snap) => {
      if (!snap.labels || snap.labels.length < 2) return;
      const sl = pptx.addSlide();
      addChrome(sl, page++, `Siste ${snap.label}`);
      addTitle(sl, `Porteføljeavkastning — siste ${snap.label}`, 'Indeksert til 100 ved periodens start, sammenlignet med referanseindekser');

      // Return summary boxes
      const serieNames = snap.series.map(s => s.name);
      const boxW = Math.min(3.0, 11.4 / serieNames.length);
      snap.series.forEach((serie, si) => {
        const avk = serie.avkastning;
        const isPort = serie.name === 'Din portefølje';
        const bx = 0.95 + si * (boxW + 0.15);
        const bgColor = isPort ? COLORS.navy : COLORS.softBlue;
        const txtColor = isPort ? COLORS.white : COLORS.navy;
        const valColor = avk >= 0 ? (isPort ? '86EFAC' : COLORS.green) : COLORS.danger;
        sl.addShape('roundRect', { x: bx, y: 1.85, w: boxW, h: 0.75, rectRadius: 0.06, fill: { color: bgColor }, line: { color: isPort ? COLORS.navy : COLORS.line, pt: 1 } });
        sl.addText(serie.name, { x: bx, y: 1.9, w: boxW, h: 0.18, fontSize: 8, color: isPort ? '93C5FD' : COLORS.muted, align: 'center', bold: true });
        sl.addText(`${avk >= 0 ? '+' : ''}${avk.toFixed(1)}%`, { x: bx, y: 2.12, w: boxW, h: 0.28, fontSize: 16, color: valColor, align: 'center', bold: true });
      });

      // Line chart
      const chartSeries = snap.series.map((serie) => ({
        name: serie.name,
        labels: snap.labels,
        values: serie.values,
      }));
      sl.addChart('line', chartSeries, {
        x: 0.65, y: 2.85, w: 11.7, h: 3.9,
        showLegend: true, legendPos: 'b', legendFontSize: 8,
        showTitle: false, lineSize: 2, lineSmooth: false, showValue: false,
        catAxisLabelFontSize: 7, catAxisLabelColor: COLORS.muted,
        catAxisOrientation: 'minMax',
        valAxisLabelFontSize: 8, valAxisLabelColor: COLORS.muted, valAxisNumFmt: '0',
        catGridLine: { style: 'none' },
        valGridLine: { color: COLORS.line, style: 'dash', size: 0.5 },
        chartColors: snap.series.map((_, i) => SNAP_CHART_COLORS[i % SNAP_CHART_COLORS.length]),
        plotArea: { fill: { color: COLORS.white }, border: { color: COLORS.line, pt: 0.5 } },
      });
    });

    // Drawdown slide
    if (d.drawdownChart && d.drawdownChart.labels && d.drawdownChart.labels.length >= 5) {
      const ddSlide = pptx.addSlide();
      addChrome(ddSlide, page++, 'Nedsiderisiko');
      addTitle(ddSlide, 'Risiko og nedsidebeskyttelse', 'Drawdown fra løpende toppverdi (0% = all-time high i perioden)');

      // Max drawdown summary boxes
      const DD_COLORS = [COLORS.teal, COLORS.navy, COLORS.salmon];
      d.drawdownChart.series.forEach((serie, si) => {
        const bx = 0.95 + si * 3.2;
        const isPort = serie.name === 'Din portefølje';
        ddSlide.addShape('roundRect', { x: bx, y: 1.85, w: 2.8, h: 0.65, rectRadius: 0.06, fill: { color: isPort ? COLORS.softRed : COLORS.light }, line: { color: isPort ? 'FCA5A5' : COLORS.line, pt: 1 } });
        ddSlide.addText(serie.name, { x: bx, y: 1.88, w: 2.8, h: 0.16, fontSize: 8, color: COLORS.muted, align: 'center', bold: true });
        ddSlide.addText(`${serie.maxDD.toFixed(1)}%`, { x: bx, y: 2.08, w: 2.8, h: 0.25, fontSize: 16, color: COLORS.danger, align: 'center', bold: true });
      });

      const ddChartSeries = d.drawdownChart.series.map((serie) => ({
        name: serie.name,
        labels: d.drawdownChart.labels,
        values: serie.values,
      }));
      ddSlide.addChart('line', ddChartSeries, {
        x: 0.65, y: 2.75, w: 11.7, h: 4.0,
        showLegend: true, legendPos: 'b', legendFontSize: 8,
        showTitle: false, lineSize: 2, lineSmooth: false, showValue: false,
        catAxisLabelFontSize: 7, catAxisLabelColor: COLORS.muted,
        valAxisLabelFontSize: 8, valAxisLabelColor: COLORS.muted, valAxisNumFmt: '0.0"%"',
        catGridLine: { style: 'none' },
        valGridLine: { color: COLORS.line, style: 'dash', size: 0.5 },
        chartColors: d.drawdownChart.series.map((_, i) => DD_COLORS[i % DD_COLORS.length]),
        plotArea: { fill: { color: COLORS.white }, border: { color: COLORS.line, pt: 0.5 } },
      });
    }

    // Aggregated exposure slide (rapport mode)
    if (d.aggregertEksponering) {
      const ae = d.aggregertEksponering;
      if ((ae.regioner && ae.regioner.length > 0) || (ae.sektorer && ae.sektorer.length > 0)) {
        const aeSlide = pptx.addSlide();
        addChrome(aeSlide, page++, 'Porteføljeeksponering');
        addTitle(aeSlide, 'Hvor er pengene investert?', ae.beskrivelse || 'Vektet eksponering for den samlede porteføljen');
        if (ae.regioner && ae.regioner.length > 0) addBarRows(aeSlide, 'Regioner', ae.regioner, 0.95, 1.95, 5.6, 2.4, COLORS.teal);
        if (ae.sektorer && ae.sektorer.length > 0) addBarRows(aeSlide, 'Sektorer', ae.sektorer, 6.8, 1.95, 5.55, 2.4, COLORS.blue);
        if (ae.stil && ae.stil.length > 0) addBarRows(aeSlide, 'Stil', ae.stil, 0.95, 4.6, 5.6, 2.0, COLORS.gold);
      }
    }
  } else if (d.scenarioData.length > 0) {
    const s = pptx.addSlide();
    addChrome(s, page++, 'Scenarioanalyse');
    addTitle(s, `Scenarioanalyse — ${d.horisont} års horisont`, 'Forventet, optimistisk og pessimistisk utvikling');

    const lastScenario = d.scenarioData[d.scenarioData.length - 1] || {};
    const forventetV = n(lastScenario.forventet);
    const optimistiskV = n(lastScenario.optimistisk);
    const pessimistiskV = n(lastScenario.pessimistisk);

    // Scenario boxes
    if (pessimistiskV > 0) {
      s.addShape('roundRect', { x: 0.95, y: 1.95, w: 3.6, h: 1.1, rectRadius: 0.06, fill: { color: COLORS.softRed }, line: { color: 'FCA5A5', pt: 1 } });
      s.addText('PESSIMISTISK', { x: 0.95, y: 2.05, w: 3.6, h: 0.16, fontSize: 9, color: COLORS.danger, align: 'center', bold: true });
      s.addText(`${currency(pessimistiskV)} kr`, { x: 0.95, y: 2.28, w: 3.6, h: 0.32, fontSize: 20, color: COLORS.danger, align: 'center', bold: true });
      s.addText(`CAGR ${pct(n(d.scenarioParams.pessimistisk))}`, { x: 0.95, y: 2.68, w: 3.6, h: 0.16, fontSize: 8, color: COLORS.danger, align: 'center' });
    }

    const forventetX = pessimistiskV > 0 ? 4.85 : 0.95;
    s.addShape('roundRect', { x: forventetX, y: 1.95, w: 3.6, h: 1.1, rectRadius: 0.06, fill: { color: COLORS.navy }, line: { color: COLORS.navy, pt: 2 } });
    s.addText('FORVENTET', { x: forventetX, y: 2.05, w: 3.6, h: 0.16, fontSize: 9, color: '93C5FD', align: 'center', bold: true });
    s.addText(`${currency(forventetV)} kr`, { x: forventetX, y: 2.28, w: 3.6, h: 0.32, fontSize: 20, color: COLORS.white, align: 'center', bold: true });
    s.addText(`CAGR ${pct(d.expected)}`, { x: forventetX, y: 2.68, w: 3.6, h: 0.16, fontSize: 8, color: '93C5FD', align: 'center' });

    const optX = pessimistiskV > 0 ? 8.75 : 4.85;
    s.addShape('roundRect', { x: optX, y: 1.95, w: 3.6, h: 1.1, rectRadius: 0.06, fill: { color: COLORS.softGreen }, line: { color: '86EFAC', pt: 1 } });
    s.addText('OPTIMISTISK', { x: optX, y: 2.05, w: 3.6, h: 0.16, fontSize: 9, color: COLORS.green, align: 'center', bold: true });
    s.addText(`${currency(optimistiskV)} kr`, { x: optX, y: 2.28, w: 3.6, h: 0.32, fontSize: 20, color: COLORS.green, align: 'center', bold: true });
    s.addText(`CAGR ${pct(n(d.scenarioParams.optimistisk))}`, { x: optX, y: 2.68, w: 3.6, h: 0.16, fontSize: 8, color: COLORS.green, align: 'center' });

    // Scenario line chart
    if (d.scenarioData.length > 1) {
      const scenarioChartData = [];
      const scenarioLabels = d.scenarioData.map((row, i) => String(row.year || i));
      if (d.scenarioData[0].pessimistisk !== undefined) {
        scenarioChartData.push({
          name: 'Pessimistisk',
          labels: scenarioLabels,
          values: d.scenarioData.map(row => n(row.pessimistisk)),
        });
      }
      scenarioChartData.push({
        name: 'Forventet',
        labels: scenarioLabels,
        values: d.scenarioData.map(row => n(row.forventet)),
      });
      if (d.scenarioData[0].optimistisk !== undefined) {
        scenarioChartData.push({
          name: 'Optimistisk',
          labels: scenarioLabels,
          values: d.scenarioData.map(row => n(row.optimistisk)),
        });
      }
      if (scenarioChartData.length > 0) {
        const scChartColors = [];
        if (d.scenarioData[0].pessimistisk !== undefined) scChartColors.push(COLORS.danger);
        scChartColors.push(COLORS.navy);
        if (d.scenarioData[0].optimistisk !== undefined) scChartColors.push(COLORS.green);

        s.addChart('line', scenarioChartData, {
          x: 0.65, y: 3.2, w: 11.7, h: 3.5,
          showLegend: true,
          legendPos: 'b',
          legendFontSize: 9,
          showTitle: false,
          lineSize: 2.5,
          lineSmooth: false,
          showValue: false,
          catAxisLabelFontSize: 8,
          catAxisLabelColor: COLORS.muted,
          valAxisLabelFontSize: 8,
          valAxisLabelColor: COLORS.muted,
          valAxisNumFmt: '#,##0',
          catGridLine: { style: 'none' },
          valGridLine: { color: COLORS.line, style: 'dash', size: 0.5 },
          chartColors: scChartColors,
          plotArea: { fill: { color: COLORS.white }, border: { color: COLORS.line, pt: 0.5 } },
        });
      }
    }

    // Verdiutvikling table (on separate slide if scenario chart used space)
    if (d.verdiutvikling.length > 0) {
      const vSlide = pptx.addSlide();
      addChrome(vSlide, page++, 'Verdiutvikling');
      addTitle(vSlide, 'Forventet verdiutvikling per aktivaklasse', `${d.horisont} års horisont med ${pct(d.expected)} årlig avkastning`);

      const vHeaders = [[
        { text: 'År', options: { bold: true, color: COLORS.white, fontSize: 8.5, fill: COLORS.navy } },
        ...d.alloc.map((a) => ({ text: a.navn, options: { bold: true, color: COLORS.white, fontSize: 8, fill: COLORS.navy, align: 'right' } })),
        { text: 'Total', options: { bold: true, color: COLORS.white, fontSize: 8.5, fill: COLORS.navy, align: 'right' } }
      ]];
      const vRows = d.verdiutvikling.slice(0, 15).map((row, ri) => [
        { text: String(row.year || ''), options: { fontSize: 8.5, bold: true, color: COLORS.navy } },
        ...d.alloc.map((a) => ({ text: `${currency(n(row[a.navn]))} kr`, options: { fontSize: 8, align: 'right', color: COLORS.muted } })),
        { text: `${currency(n(row.total))} kr`, options: { fontSize: 8.5, align: 'right', bold: true, color: COLORS.navy } }
      ]);
      vSlide.addTable([...vHeaders, ...vRows], {
        x: 0.65, y: 1.85, w: 12.05, rowH: 0.27, fontSize: 8.5, border: { pt: 1, color: COLORS.line }, fill: COLORS.white, color: COLORS.text, margin: 0.04
      });
    }
  }

  // 8 Aksjedelen
  {
    const s = pptx.addSlide();
    const narrative = buildSectionNarratives(d.products, 'equity');
    const equityRows = d.products
      .filter((p) => {
        const cat = String(p.report.category || '').toLowerCase();
        return cat.includes('equity') || cat.includes('nordic') || cat.includes('thematic') || cat.includes('sector') || cat.includes('balanced');
      })
      .map((p) => [p.navn, pct(p.vekt), p.report.role || 'Aksjeeksponering']);
    addChrome(s, page++, narrative.heading);
    addTitle(s, narrative.heading, 'Hvordan aksjedelen er tenkt å bidra i totalporteføljen');
    addBodyParagraph(s, narrative.body, 0.95, 1.95, 5.95, 1.05, 14);
    addBulletSection(s, 'Hva aksjedelen skal bidra med', [
      'Bred global eksponering som hovedmotor for langsiktig verdiskaping.',
      'Nordiske og tematiske tilleggsmandater brukes selektivt for å øke potensialet for meravkastning.',
      'Produktene er valgt for å gi komplementære egenskaper snarere enn overlapp.'
    ], 0.95, 3.2, 5.95, 2.0);
    addKeyValueTable(s, 'Valgte aksjeprodukter', equityRows.length ? equityRows : [['Ingen aksjeprodukter valgt', '—', '—']], 7.15, 1.95, 5.1);
  }

  // 9 Rentedelen
  {
    const s = pptx.addSlide();
    const narrative = buildSectionNarratives(d.products, 'fixed-income');
    const fixedRows = d.products
      .filter((p) => String(p.report.category || '').includes('fixed'))
      .map((p) => [p.navn, pct(p.vekt), p.report.role || 'Renteeksponering']);
    addChrome(s, page++, narrative.heading);
    addTitle(s, narrative.heading, 'Hvordan rentedelen er tenkt å bidra i totalporteføljen');
    addBodyParagraph(s, narrative.body, 0.95, 1.95, 5.95, 1.05, 14);
    addBulletSection(s, 'Hva rentedelen skal bidra med', [
      'Løpende avkastning og lavere volatilitet enn aksjedelen.',
      'Kredittseleksjon og geografisk spredning brukes for å bygge robust kontantstrøm.',
      'Rentedelen skal fungere som en stabiliserende buffer i totalporteføljen.'
    ], 0.95, 3.2, 5.95, 2.0);
    addKeyValueTable(s, 'Valgte renteprodukter', fixedRows.length ? fixedRows : [['Ingen renteprodukter valgt', '—', '—']], 7.15, 1.95, 5.1);
  }

  // 10 Alternative investeringer (only if there are alternatives)
  if (hasAlternatives) {
    const s = pptx.addSlide();
    const narrative = buildSectionNarratives(d.products, 'alternative');
    const altRows = d.products
      .filter((p) => {
        const cat = String(p.report.category || '').toLowerCase();
        return cat.includes('alternativ') || cat === 'alternative';
      })
      .map((p) => [p.navn, pct(p.vekt), p.report.role || 'Alternativ komponent']);
    addChrome(s, page++, narrative.heading);
    addTitle(s, narrative.heading, 'Illikvide komponenter for diversifisering og meravkastningspotensial');
    addBodyParagraph(s, narrative.body, 0.95, 1.95, 5.95, 1.05, 14);
    addBulletSection(s, 'Hva alternative investeringer bidrar med', [
      'Tilgang til aktivaklasser som ikke er tilgjengelige i likvide markeder.',
      'Illikviditetspremie som kan gi høyere langsiktig avkastning.',
      'Diversifiseringseffekt gjennom lav korrelasjon med børsnoterte markeder.'
    ], 0.95, 3.2, 5.95, 2.0);
    addKeyValueTable(s, 'Valgte alternative produkter', altRows.length ? altRows : [['Ingen alternative produkter valgt', '—', '—']], 7.15, 1.95, 5.1);
  }

  // 11 Hvorfor denne sammensetningen
  {
    const s = pptx.addSlide();
    addChrome(s, page++, 'Hvorfor denne sammensetningen');
    addTitle(s, 'Hvorfor denne sammensetningen', 'Helheten er viktigere enn enkeltproduktene hver for seg');
    addBulletSection(s, 'Rådgivers vurdering', [
      'Porteføljen er satt sammen for å kombinere robust kjerneeksponering med utvalgte satellitter.',
      'Løsningene er valgt for å utfylle hverandre på tvers av geografi, aktivaklasse og investeringsstil.',
      'Produktene som følger er ment å illustrere hvordan hver byggestein skal bidra i totalporteføljen.'
    ], 0.95, 1.95, 6.2, 2.0);
    addBarRows(s, 'Aggregert regioneksponering', d.eksponering.regioner, 7.35, 1.95, 5.0, 2.1, COLORS.teal);
    addBarRows(s, 'Aggregert sektoreksponering', d.eksponering.sektorer, 7.35, 4.25, 5.0, 2.1, COLORS.salmon);
  }

  // 11b Aggregert eksponering visuelt (donut + bar chart)
  {
    const hasRegions = d.eksponering.regioner.length > 0;
    const hasSectors = d.eksponering.sektorer.length > 0;
    if (hasRegions || hasSectors) {
      const s = pptx.addSlide();
      addChrome(s, page++, 'Aggregert eksponering');
      addTitle(s, 'Hvor er pengene investert?', 'Samlet eksponering på tvers av alle valgte Pensum-produkter');

      if (hasRegions) {
        s.addText('Regionfordeling', { x: 0.95, y: 1.85, w: 5.5, h: 0.18, fontSize: 10, color: COLORS.navy, bold: true });
        const regionColors = ['0D2841', '6B9DB8', 'C4967E', '2D6A6A', 'A67B3D', '5B4FA0', '2D6A4F', '8B5CF6'];
        s.addChart('doughnut', [{
          name: 'Regioner',
          labels: d.eksponering.regioner.map(r => r.navn),
          values: d.eksponering.regioner.map(r => r.vekt),
        }], {
          x: 0.95, y: 2.1, w: 2.4, h: 2.4,
          showLegend: false, showTitle: false, showValue: false, showPercent: false, showLabel: false,
          holeSize: 50,
          chartColors: regionColors.slice(0, d.eksponering.regioner.length),
          border: { pt: 0 }, shadow: { type: 'none' },
        });
        d.eksponering.regioner.slice(0, 8).forEach((r, i) => {
          const ly = 2.2 + i * 0.28;
          s.addShape('roundRect', { x: 3.5, y: ly + 0.03, w: 0.14, h: 0.14, rectRadius: 0.02, fill: { color: regionColors[i % regionColors.length] } });
          s.addText(r.navn, { x: 3.7, y: ly, w: 1.8, h: 0.2, fontSize: 8, color: COLORS.text });
          s.addText(pct(r.vekt), { x: 5.5, y: ly, w: 0.8, h: 0.2, fontSize: 8, bold: true, color: COLORS.navy, align: 'right' });
        });
      }

      if (hasSectors) {
        s.addText('Sektorfordeling', { x: 6.8, y: 1.85, w: 5.5, h: 0.18, fontSize: 10, color: COLORS.navy, bold: true });
        const sektorColors = ['C4967E', '0D2841', '6B9DB8', '2D6A6A', 'A67B3D', '5B4FA0', '2D6A4F', '8B5CF6'];
        s.addChart('doughnut', [{
          name: 'Sektorer',
          labels: d.eksponering.sektorer.map(r => r.navn),
          values: d.eksponering.sektorer.map(r => r.vekt),
        }], {
          x: 6.8, y: 2.1, w: 2.4, h: 2.4,
          showLegend: false, showTitle: false, showValue: false, showPercent: false, showLabel: false,
          holeSize: 50,
          chartColors: sektorColors.slice(0, d.eksponering.sektorer.length),
          border: { pt: 0 }, shadow: { type: 'none' },
        });
        d.eksponering.sektorer.slice(0, 8).forEach((r, i) => {
          const ly = 2.2 + i * 0.28;
          s.addShape('roundRect', { x: 9.35, y: ly + 0.03, w: 0.14, h: 0.14, rectRadius: 0.02, fill: { color: sektorColors[i % sektorColors.length] } });
          s.addText(r.navn, { x: 9.55, y: ly, w: 1.8, h: 0.2, fontSize: 8, color: COLORS.text });
          s.addText(pct(r.vekt), { x: 11.4, y: ly, w: 0.8, h: 0.2, fontSize: 8, bold: true, color: COLORS.navy, align: 'right' });
        });
      }

      // Bottom note
      s.addShape('roundRect', { x: 0.65, y: 5.0, w: 12.05, h: 0.6, rectRadius: 0.05, fill: { color: COLORS.softBlue }, line: { color: COLORS.line, pt: 1 } });
      addBodyParagraph(s, 'Eksponeringsdata er basert på sist tilgjengelige rapportering fra hvert underliggende produkt og kan avvike noe over tid ved endringer i fondenes sammensetning.', 0.85, 5.1, 11.5, 0.4, 9, COLORS.muted);
    }
  }

  // Product modules
  d.products.forEach((product) => {
    const exposure = product.exposure || {};
    const regions = topRows(exposure.regioner, 8);
    const sectors = topRows(exposure.sektorer, 8);
    const underlying = topRows(exposure.underliggende, 10);
    const style = topRows(exposure.stil, 8);

    const isAlternative = String(product.report?.category || '').toLowerCase().includes('alternativ') || String(product.report?.category || '').toLowerCase() === 'alternative';

    // Product overview slide
    {
      const stats = computeProductStats(product.id, d.produktHistorikk);
      const s1 = computeProductStatsPeriod(product.id, d.produktHistorikk, 1);
      const s3 = computeProductStatsPeriod(product.id, d.produktHistorikk, 3);
      const s5 = computeProductStatsPeriod(product.id, d.produktHistorikk, 5);
      const s = pptx.addSlide();
      addChrome(s, page++, product.navn);
      addTitle(s, product.report.slideTitle || product.navn, product.report.slideSubtitle || '');

      // KPI cards with more metrics
      addKpiCard(s, 0.95, 1.85, 1.5, 'Vekt', pct(product.vekt), COLORS.navy);
      addKpiCard(s, 2.65, 1.85, 1.8, 'Forv. avkastning', Number.isFinite(n(product.report.expectedReturn, NaN)) ? pct(product.report.expectedReturn) : '—', COLORS.green);
      addKpiCard(s, 4.65, 1.85, 1.6, 'Forv. yield', Number.isFinite(n(product.report.expectedYield, NaN)) ? pct(product.report.expectedYield) : '—', COLORS.teal);
      addKpiCard(s, 6.45, 1.85, 1.5, 'Volatilitet', stats ? pct(stats.volatility) : '—', COLORS.navy);
      addKpiCard(s, 8.15, 1.85, 1.5, 'Sharpe', stats ? String(stats.sharpe) : '—', stats && stats.sharpe >= 1 ? COLORS.green : stats && stats.sharpe >= 0.5 ? 'D97706' : COLORS.danger);
      addKpiCard(s, 9.85, 1.85, 1.5, 'Maks DD', stats ? pct(stats.maxDrawdown) : '—', stats && stats.maxDrawdown < 0 ? COLORS.danger : COLORS.salmon);

      addBulletSection(s, 'Rolle og investeringscase', [
        product.report.pitch || '',
        product.report.caseText || '',
        product.report.whyIncluded || ''
      ], 0.95, 3.05, 5.8, 1.8);

      // Enhanced rapportgrunnlag with period returns
      const reportRows = [
        ['Rolle i porteføljen', product.report.role || '—'],
        ['Benchmark', product.report.benchmark || '—']
      ];
      if (s1) reportRows.push(['Avkastning 1 år', (s1.totalReturn >= 0 ? '+' : '') + pct(s1.totalReturn)]);
      if (s3) reportRows.push(['Avkastning 3 år p.a.', (s3.annualized >= 0 ? '+' : '') + pct(s3.annualized)]);
      if (s5) reportRows.push(['Avkastning 5 år p.a.', (s5.annualized >= 0 ? '+' : '') + pct(s5.annualized)]);
      reportRows.push(['Nøkkelrisiko', product.report.riskText || '—']);

      addKeyValueTable(s, 'Nøkkeltall', reportRows, 7.0, 3.05, 5.4, 0.24);

      if (exposure.disclaimer) {
        addBodyParagraph(s, exposure.disclaimer, 0.95, 5.55, 11.2, 0.55, 10, COLORS.muted);
      }
    }

    // Exposure slide (skip for alternative products without exposure data)
    if (!isAlternative || sectors.length > 0 || regions.length > 0 || underlying.length > 0) {
      const stats = computeProductStats(product.id, d.produktHistorikk);
      const s = pptx.addSlide();
      addChrome(s, page++, `${product.navn} – eksponering`);
      addTitle(s, `${product.navn} – innhold og eksponering`, 'Produkt for produkt – ikke bare aggregert portefølje');

      // Donut charts for sektorer and regioner
      const expColors = ['0D2841', '6B9DB8', 'C4967E', '2D6A6A', 'A67B3D', '5B4FA0', '2D6A4F', '8B5CF6'];
      if (sectors.length > 0) {
        s.addText('Sektorer', { x: 0.95, y: 1.85, w: 5.6, h: 0.16, fontSize: 10, color: COLORS.navy, bold: true });
        s.addChart('doughnut', [{
          name: 'Sektorer',
          labels: sectors.map(r => r.navn),
          values: sectors.map(r => r.vekt),
        }], {
          x: 0.95, y: 2.05, w: 2.0, h: 2.0,
          showLegend: false, showTitle: false, showValue: false, showPercent: false, showLabel: false,
          holeSize: 50,
          chartColors: expColors.slice(0, sectors.length),
          border: { pt: 0 }, shadow: { type: 'none' },
        });
        sectors.slice(0, 8).forEach((r, i) => {
          const ly = 2.1 + i * 0.24;
          s.addShape('roundRect', { x: 3.1, y: ly + 0.03, w: 0.12, h: 0.12, rectRadius: 0.02, fill: { color: expColors[i % expColors.length] } });
          s.addText(r.navn, { x: 3.28, y: ly, w: 1.6, h: 0.18, fontSize: 7.5, color: COLORS.text });
          s.addText(pct(r.vekt), { x: 4.9, y: ly, w: 0.6, h: 0.18, fontSize: 7.5, bold: true, color: COLORS.navy, align: 'right' });
        });
      } else {
        addBarRows(s, 'Sektorer', sectors, 0.95, 1.95, 5.6, 2.2, COLORS.blue);
      }

      if (regions.length > 0) {
        const regColors = ['2D6A6A', '6B9DB8', '0D2841', 'C4967E', 'A67B3D', '5B4FA0', '2D6A4F', '8B5CF6'];
        s.addText('Regioner', { x: 6.8, y: 1.85, w: 5.55, h: 0.16, fontSize: 10, color: COLORS.navy, bold: true });
        s.addChart('doughnut', [{
          name: 'Regioner',
          labels: regions.map(r => r.navn),
          values: regions.map(r => r.vekt),
        }], {
          x: 6.8, y: 2.05, w: 2.0, h: 2.0,
          showLegend: false, showTitle: false, showValue: false, showPercent: false, showLabel: false,
          holeSize: 50,
          chartColors: regColors.slice(0, regions.length),
          border: { pt: 0 }, shadow: { type: 'none' },
        });
        regions.slice(0, 8).forEach((r, i) => {
          const ly = 2.1 + i * 0.24;
          s.addShape('roundRect', { x: 8.95, y: ly + 0.03, w: 0.12, h: 0.12, rectRadius: 0.02, fill: { color: regColors[i % regColors.length] } });
          s.addText(r.navn, { x: 9.13, y: ly, w: 1.6, h: 0.18, fontSize: 7.5, color: COLORS.text });
          s.addText(pct(r.vekt), { x: 10.75, y: ly, w: 0.6, h: 0.18, fontSize: 7.5, bold: true, color: COLORS.navy, align: 'right' });
        });
      } else {
        addBarRows(s, 'Regioner', regions, 6.8, 1.95, 5.55, 2.2, COLORS.teal);
      }

      // Underlying investments table
      const undHeaders = [[
        { text: 'Underliggende investeringer', options: { bold: true, color: COLORS.white, fontSize: 9, fill: COLORS.navy } },
        { text: 'Vekt', options: { bold: true, color: COLORS.white, fontSize: 9, fill: COLORS.navy, align: 'right' } },
      ]];
      const undRows = underlying.length ? underlying.map((r) => [
        { text: r.navn, options: { fontSize: 8.5, color: COLORS.text } },
        { text: pct(r.vekt), options: { fontSize: 8.5, align: 'right', color: COLORS.navy, bold: true } },
      ]) : [[
        { text: 'Ingen underliggende data', options: { fontSize: 8.5, color: COLORS.muted } },
        { text: '—', options: { fontSize: 8.5, align: 'right', color: COLORS.muted } },
      ]];
      s.addTable([...undHeaders, ...undRows], {
        x: 0.95, y: 4.35, w: 6.5, rowH: 0.22, fontSize: 9,
        border: { pt: 1, color: COLORS.line }, fill: COLORS.white, color: COLORS.text, margin: 0.04
      });

      // Style + stats on right
      const statsHeaders = [[
        { text: 'Historiske nøkkeltall', options: { bold: true, color: COLORS.white, fontSize: 9, fill: COLORS.navy } },
        { text: '', options: { bold: true, color: COLORS.white, fontSize: 9, fill: COLORS.navy } },
      ]];
      const statsRows = [
        [{ text: 'Årlig avkastning', options: { fontSize: 9 } }, { text: stats ? pct(stats.annualized) : '—', options: { fontSize: 9, align: 'right', bold: true, color: stats && stats.annualized >= 0 ? COLORS.green : COLORS.danger } }],
        [{ text: 'Total avkastning', options: { fontSize: 9 } }, { text: stats ? pct(stats.totalReturn) : '—', options: { fontSize: 9, align: 'right', bold: true, color: stats && stats.totalReturn >= 0 ? COLORS.green : COLORS.danger } }],
        [{ text: 'Volatilitet', options: { fontSize: 9 } }, { text: stats ? pct(stats.volatility) : '—', options: { fontSize: 9, align: 'right', color: COLORS.navy } }],
        [{ text: 'Sharpe', options: { fontSize: 9 } }, { text: stats ? String(stats.sharpe) : '—', options: { fontSize: 9, align: 'right', bold: true, color: stats && stats.sharpe >= 1 ? COLORS.green : COLORS.navy } }],
        [{ text: 'Maks drawdown', options: { fontSize: 9 } }, { text: stats ? pct(stats.maxDrawdown) : '—', options: { fontSize: 9, align: 'right', color: COLORS.danger } }],
      ];
      s.addTable([...statsHeaders, ...statsRows], {
        x: 7.7, y: 4.35, w: 4.65, rowH: 0.24, fontSize: 9,
        border: { pt: 1, color: COLORS.line }, fill: COLORS.white, color: COLORS.text, margin: 0.04
      });

      // Style breakdown if available
      if (style.length > 0) {
        addBarRows(s, 'Stil', style, 7.7, 5.65, 4.65, Math.min(1.2, 6.8 - 5.65), COLORS.gold);
      }
    }
  });

  // FINAL SLIDE: Oppsummering og neste steg
  {
    const s = pptx.addSlide();
    addChrome(s, page++, 'Oppsummering');
    addTitle(s, 'Oppsummering og neste steg', 'Forslaget er illustrativt og må kvalitetssikres i rådgiverløpet');

    // Summary KPIs
    addKpiCard(s, 0.95, 1.85, 2.6, 'Investert beløp', `${currency(d.investerbarKapital)} kr`);
    addKpiCard(s, 3.75, 1.85, 2.2, 'Produkter', `${d.products.length} løsninger`, COLORS.accent);
    addKpiCard(s, 6.15, 1.85, 2.2, 'Forventet avkastning', pct(d.pensumForventetAvkastning), COLORS.green);
    addKpiCard(s, 8.55, 1.85, 2.0, 'Yield', Number.isFinite(vektetYield) ? pct(vektetYield) : '—', COLORS.teal);
    addKpiCard(s, 10.75, 1.85, 1.7, 'Horisont', `${d.horisont} år`, COLORS.navy);

    // Numbered steps
    const steps = [
      { title: 'Gjennomgå foreslått sammensetning', desc: 'Vurder produktvalg, vekter og om sammensetningen reflekterer kundens preferanser og behov.' },
      { title: 'Tilpass ved behov', desc: 'Juster vekter, legg til eller fjern produkter basert på dialog med kunden og eventuell ny informasjon.' },
      { title: 'Formell kundeetablering', desc: 'Gjennomfør full egnethetsvurdering, kundeetablering og dokumentasjon i henhold til gjeldende regelverk.' },
      { title: 'Implementering og oppfølging', desc: 'Iverksett porteføljen og etabler rutiner for løpende oppfølging, rapportering og rebalansering.' },
    ];
    steps.forEach((step, i) => {
      const sy = 3.1 + i * 0.85;
      // Number circle
      s.addShape('ellipse', { x: 0.95, y: sy + 0.05, w: 0.36, h: 0.36, fill: { color: COLORS.navy } });
      s.addText(String(i + 1), { x: 0.95, y: sy + 0.05, w: 0.36, h: 0.36, fontSize: 14, bold: true, color: COLORS.white, align: 'center', valign: 'mid' });
      // Step text
      s.addText(step.title, { x: 1.5, y: sy, w: 10.5, h: 0.22, fontSize: 12, bold: true, color: COLORS.navy });
      s.addText(step.desc, { x: 1.5, y: sy + 0.26, w: 10.5, h: 0.38, fontSize: 10, color: COLORS.muted });
    });

    // Contact box
    s.addShape('roundRect', { x: 0.65, y: 6.2, w: 12.05, h: 0.7, rectRadius: 0.06, fill: { color: COLORS.softBlue }, line: { color: COLORS.navy, pt: 1.5 } });
    s.addText('Kontakt din rådgiver i Pensum Asset Management for videre oppfølging.', { x: 0.85, y: 6.3, w: 8, h: 0.2, fontSize: 11, bold: true, color: COLORS.navy });
    s.addText('www.pensumgroup.no  |  post@pensumgroup.no', { x: 0.85, y: 6.55, w: 8, h: 0.18, fontSize: 9, color: COLORS.muted });
    s.addText('Pensum Asset Management AS', { x: 9.5, y: 6.35, w: 3, h: 0.35, fontSize: 10, color: COLORS.navy, align: 'right', bold: true });
  }

  return pptx;
}

function buildRapportDeck(payload = {}) {
  const d = normalizePayload(payload);
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_WIDE';
  pptx.author = 'Pensum Asset Management';
  pptx.company = 'Pensum Asset Management';
  pptx.subject = 'Kunderapport';
  pptx.title = `Kunderapport ${d.kundeNavn}`;
  let page = 1;

  // Compute weighted yield
  let yieldSum = 0, yieldTotal = 0;
  d.products.forEach((p) => {
    const y = n(p.report.expectedYield, NaN);
    if (Number.isFinite(y) && p.vekt > 0) { yieldSum += y * (p.vekt / 100); yieldTotal += p.vekt / 100; }
  });
  const vektetYield = yieldTotal > 0 ? yieldSum / yieldTotal : 0;
  const aksjeAndel = d.aktivafordeling.find((a) => a.name === 'Aksjer')?.value || 0;
  const renteAndel = d.aktivafordeling.find((a) => a.name === 'Renter')?.value || 0;

  // 1 Forside
  {
    const s = pptx.addSlide();
    addChrome(s, page++, formatDateLabel(d.dato));
    s.addText('Kunderapport', { x: 0.8, y: 1.55, w: 8.8, h: 0.55, fontSize: 28, bold: true, color: COLORS.navy });
    s.addText(d.kundeNavn, { x: 0.8, y: 2.18, w: 8.8, h: 0.45, fontSize: 22, bold: true, color: COLORS.salmon });
    s.addText('Utarbeidet av Pensum Asset Management', { x: 0.8, y: 2.78, w: 8.6, h: 0.3, fontSize: 12, color: COLORS.muted });

    // KPI stripe
    const kpiY = 3.85;
    addKpiCard(s, 0.8, kpiY, 2.0, 'Investert beløp', `${currency(d.investerbarKapital)} kr`);
    addKpiCard(s, 3.0, kpiY, 1.85, 'Forv. avkastning', pct(d.pensumForventetAvkastning), COLORS.green, 'årlig');
    addKpiCard(s, 5.05, kpiY, 1.65, 'Forv. yield', Number.isFinite(vektetYield) ? pct(vektetYield) : '—', COLORS.teal, 'årlig');
    addKpiCard(s, 6.9, kpiY, 1.65, 'Aksje / Rente', `${aksjeAndel.toFixed(0)} / ${renteAndel.toFixed(0)}%`);
    addKpiCard(s, 8.75, kpiY, 1.65, 'Likviditet', `${d.pensumLikviditet.likvid.toFixed(0)}% likvid`);
    addKpiCard(s, 10.6, kpiY, 1.9, 'Forv. sluttverdi', `${currency(d.expValue)} kr`, COLORS.navy, `${d.horisont} år`);

    // Customer info
    s.addText([
      { text: 'Risikoprofil: ', options: { fontSize: 10, color: COLORS.muted } },
      { text: d.risikoProfil, options: { fontSize: 10, color: COLORS.navy, bold: true } },
      { text: '    |    Horisont: ', options: { fontSize: 10, color: COLORS.muted } },
      { text: `${d.horisont} år`, options: { fontSize: 10, color: COLORS.navy, bold: true } },
    ], { x: 0.8, y: 5.2, w: 11.4, h: 0.25 });
  }

  // 2 Porteføljesammensetning
  {
    const s = pptx.addSlide();
    addChrome(s, page++, 'Porteføljesammensetning');
    addTitle(s, 'Anbefalt porteføljesammensetning', 'Aktivafordeling og Pensum-produkter');

    // Asset allocation donut (left)
    const rapportAktiva = d.aktivafordeling.filter(a => n(a.value, 0) > 0);
    const AKTIVA_COLORS = { 'Aksjer': COLORS.navy, 'Renter': COLORS.salmon, 'Alternativer': COLORS.teal, 'Blandet': COLORS.gold };
    if (rapportAktiva.length > 0) {
      s.addText('Aktivafordeling', { x: 0.95, y: 1.85, w: 5.5, h: 0.2, fontSize: 11, color: COLORS.navy, bold: true });
      s.addChart('doughnut', [{
        name: 'Aktiva',
        labels: rapportAktiva.map(a => a.name),
        values: rapportAktiva.map(a => n(a.value, 0)),
      }], {
        x: 0.95, y: 2.15, w: 2.4, h: 2.4,
        showLegend: false, showTitle: false, showValue: false, showPercent: false, showLabel: false,
        holeSize: 50,
        chartColors: rapportAktiva.map(a => AKTIVA_COLORS[a.name] || COLORS.blue),
        border: { pt: 0 },
      });
      // Legend
      rapportAktiva.forEach((a, i) => {
        const ly = 2.25 + i * 0.35;
        s.addShape('ellipse', { x: 3.6, y: ly + 0.02, w: 0.18, h: 0.18, fill: { color: AKTIVA_COLORS[a.name] || COLORS.blue } });
        s.addText(`${a.name}: ${n(a.value, 0).toFixed(0)}%`, { x: 3.85, y: ly, w: 2.5, h: 0.22, fontSize: 10, color: COLORS.text });
      });
    }

    // Products table (right)
    const prodHeaders = [[
      { text: 'Produkt', options: { bold: true, color: COLORS.white, fontSize: 9, fill: COLORS.navy } },
      { text: 'Vekt', options: { bold: true, color: COLORS.white, fontSize: 9, fill: COLORS.navy, align: 'center' } },
      { text: 'Forv. avk.', options: { bold: true, color: COLORS.white, fontSize: 9, fill: COLORS.navy, align: 'right' } },
      { text: 'Yield', options: { bold: true, color: COLORS.white, fontSize: 9, fill: COLORS.navy, align: 'right' } },
    ]];
    const prodRows = d.products.map((p) => [
      { text: p.navn, options: { fontSize: 9, color: COLORS.text } },
      { text: pct(p.vekt), options: { fontSize: 9, align: 'center', bold: true, color: COLORS.navy } },
      { text: Number.isFinite(n(p.report.expectedReturn, NaN)) ? pct(p.report.expectedReturn) : '—', options: { fontSize: 9, align: 'right', color: COLORS.green } },
      { text: Number.isFinite(n(p.report.expectedYield, NaN)) ? pct(p.report.expectedYield) : '—', options: { fontSize: 9, align: 'right', color: COLORS.teal } },
    ]);
    s.addTable([...prodHeaders, ...prodRows], {
      x: 6.5, y: 1.85, w: 5.8, rowH: 0.3, fontSize: 9,
      border: { pt: 1, color: COLORS.line }, fill: COLORS.white, color: COLORS.text, margin: 0.04
    });

    // Product donut
    if (d.products.length >= 2) {
      s.addChart('doughnut', [{
        name: 'Produkter',
        labels: d.products.map(p => p.navn),
        values: d.products.map(p => p.vekt),
      }], {
        x: 6.5, y: 4.7, w: 2.2, h: 2.2,
        showLegend: false, showTitle: false, showValue: false, showPercent: false, showLabel: false,
        holeSize: 50,
        chartColors: d.products.map((_, i) => PRODUCT_CHART_COLORS[i % PRODUCT_CHART_COLORS.length]),
        border: { pt: 0 },
      });
    }
  }

  // 3 Historisk avkastning per produkt
  {
    const s = pptx.addSlide();
    addChrome(s, page++, 'Historisk avkastning');
    addTitle(s, 'Historisk avkastning per produkt', 'Avkastning på 1, 3 og 5 års basis med risikometrikker');

    const hHeaders = [[
      { text: 'Produkt', options: { bold: true, color: COLORS.white, fontSize: 8.5, fill: COLORS.navy } },
      { text: 'Vekt', options: { bold: true, color: COLORS.white, fontSize: 8.5, fill: COLORS.navy, align: 'center' } },
      { text: '1 år', options: { bold: true, color: COLORS.white, fontSize: 8.5, fill: COLORS.navy, align: 'right' } },
      { text: '3 år p.a.', options: { bold: true, color: COLORS.white, fontSize: 8.5, fill: COLORS.navy, align: 'right' } },
      { text: '5 år p.a.', options: { bold: true, color: COLORS.white, fontSize: 8.5, fill: COLORS.navy, align: 'right' } },
      { text: 'Volatilitet', options: { bold: true, color: COLORS.white, fontSize: 8.5, fill: COLORS.navy, align: 'right' } },
      { text: 'Sharpe', options: { bold: true, color: COLORS.white, fontSize: 8.5, fill: COLORS.navy, align: 'right' } },
      { text: 'Maks DD', options: { bold: true, color: COLORS.white, fontSize: 8.5, fill: COLORS.navy, align: 'right' } },
    ]];
    const hRows = d.products.map((p) => {
      const s1 = computeProductStatsPeriod(p.id, d.produktHistorikk, 1);
      const s3 = computeProductStatsPeriod(p.id, d.produktHistorikk, 3);
      const s5 = computeProductStatsPeriod(p.id, d.produktHistorikk, 5);
      const avkColor = (v) => v >= 0 ? COLORS.green : COLORS.danger;
      return [
        { text: p.navn, options: { fontSize: 9, color: COLORS.navy, bold: true } },
        { text: pct(p.vekt), options: { fontSize: 9, align: 'center', color: COLORS.muted } },
        { text: s1 ? pct(s1.totalReturn) : '—', options: { fontSize: 9, align: 'right', bold: true, color: s1 ? avkColor(s1.totalReturn) : COLORS.muted } },
        { text: s3 ? pct(s3.annualized) : '—', options: { fontSize: 9, align: 'right', bold: true, color: s3 ? avkColor(s3.annualized) : COLORS.muted } },
        { text: s5 ? pct(s5.annualized) : '—', options: { fontSize: 9, align: 'right', bold: true, color: s5 ? avkColor(s5.annualized) : COLORS.muted } },
        { text: s5 ? pct(s5.volatility) : '—', options: { fontSize: 9, align: 'right', color: COLORS.muted } },
        { text: s5 ? String(s5.sharpe) : '—', options: { fontSize: 9, align: 'right', bold: true, color: s5 && s5.sharpe >= 1 ? COLORS.green : s5 && s5.sharpe >= 0.5 ? 'D97706' : COLORS.danger } },
        { text: s5 ? pct(s5.maxDrawdown) : '—', options: { fontSize: 9, align: 'right', color: COLORS.danger } },
      ];
    });
    s.addTable([...hHeaders, ...hRows], {
      x: 0.65, y: 1.85, w: 12.0, rowH: 0.32, fontSize: 9,
      border: { pt: 1, color: COLORS.line }, fill: COLORS.white, color: COLORS.text, margin: 0.04
    });

    // Calendar year returns
    const hist = d.historiskPortefolje;
    const calYears = [
      { label: '2026 YTD', key: 'aar2026' },
      { label: '2025', key: 'aar2025' },
      { label: '2024', key: 'aar2024' },
      { label: '2023', key: 'aar2023' },
      { label: '2022', key: 'aar2022' },
    ];
    const calBoxY = 5.2;
    s.addText('Porteføljens historiske avkastning (vektet)', { x: 0.65, y: calBoxY - 0.35, w: 12.0, h: 0.25, fontSize: 11, color: COLORS.navy, bold: true });
    calYears.forEach((cy, i) => {
      const cx = 0.95 + i * 2.3;
      const v = n(hist?.[cy.key], NaN);
      const hasVal = Number.isFinite(v);
      s.addShape('roundRect', { x: cx, y: calBoxY, w: 2.0, h: 1.0, rectRadius: 0.06, fill: { color: COLORS.white }, line: { color: COLORS.line, pt: 1 } });
      s.addText(cy.label, { x: cx, y: calBoxY + 0.1, w: 2.0, h: 0.16, fontSize: 9, color: COLORS.muted, align: 'center', bold: true });
      s.addText(hasVal ? `${v >= 0 ? '+' : ''}${v.toFixed(1)}%` : '—', {
        x: cx, y: calBoxY + 0.35, w: 2.0, h: 0.4, fontSize: 20, bold: true, align: 'center',
        color: hasVal ? (v >= 0 ? COLORS.green : COLORS.danger) : COLORS.muted
      });
    });
  }

  // 4–6 Indexed performance snapshots (1yr, 3yr, 5yr)
  const snapshotCharts = payload.snapshotCharts || [];
  const SNAP_CHART_COLORS = [COLORS.navy, COLORS.blue, COLORS.salmon, COLORS.muted];
  snapshotCharts.forEach((snap) => {
    if (!snap.labels || snap.labels.length < 2) return;
    const sl = pptx.addSlide();
    addChrome(sl, page++, `Siste ${snap.label}`);
    addTitle(sl, `Porteføljeavkastning — siste ${snap.label}`, 'Indeksert til 100 ved periodens start, sammenlignet med referanseindekser');

    // Return summary boxes
    const boxW = Math.min(3.0, 11.4 / snap.series.length);
    snap.series.forEach((serie, si) => {
      const avk = serie.avkastning;
      const isPort = serie.name === 'Din portefølje';
      const bx = 0.95 + si * (boxW + 0.15);
      const bgColor = isPort ? COLORS.navy : COLORS.softBlue;
      const txtColor = isPort ? COLORS.white : COLORS.navy;
      const valColor = avk >= 0 ? (isPort ? '86EFAC' : COLORS.green) : COLORS.danger;
      sl.addShape('roundRect', { x: bx, y: 1.85, w: boxW, h: 0.75, rectRadius: 0.06, fill: { color: bgColor }, line: { color: isPort ? COLORS.navy : COLORS.line, pt: 1 } });
      sl.addText(serie.name, { x: bx, y: 1.9, w: boxW, h: 0.18, fontSize: 8, color: isPort ? '93C5FD' : COLORS.muted, align: 'center', bold: true });
      sl.addText(`${avk >= 0 ? '+' : ''}${avk.toFixed(1)}%`, { x: bx, y: 2.12, w: boxW, h: 0.28, fontSize: 16, color: valColor, align: 'center', bold: true });
    });

    const chartSeries = snap.series.map((serie) => ({
      name: serie.name,
      labels: snap.labels,
      values: serie.values,
    }));
    sl.addChart('line', chartSeries, {
      x: 0.65, y: 2.85, w: 11.7, h: 3.9,
      showLegend: true, legendPos: 'b', legendFontSize: 8,
      showTitle: false, lineSize: 2, lineSmooth: false, showValue: false,
      catAxisLabelFontSize: 7, catAxisLabelColor: COLORS.muted,
      catAxisOrientation: 'minMax',
      valAxisLabelFontSize: 8, valAxisLabelColor: COLORS.muted, valAxisNumFmt: '0',
      catGridLine: { style: 'none' },
      valGridLine: { color: COLORS.line, style: 'dash', size: 0.5 },
      chartColors: snap.series.map((_, i) => SNAP_CHART_COLORS[i % SNAP_CHART_COLORS.length]),
      plotArea: { fill: { color: COLORS.white }, border: { color: COLORS.line, pt: 0.5 } },
    });
  });

  // 7 Drawdown
  const drawdownChart = payload.drawdownChart || null;
  if (drawdownChart && drawdownChart.labels && drawdownChart.labels.length >= 5) {
    const ddSlide = pptx.addSlide();
    addChrome(ddSlide, page++, 'Nedsiderisiko');
    addTitle(ddSlide, 'Risiko og nedsidebeskyttelse', 'Drawdown fra løpende toppverdi (0% = all-time high i perioden)');

    const DD_COLORS = [COLORS.teal, COLORS.navy, COLORS.salmon];
    drawdownChart.series.forEach((serie, si) => {
      const bx = 0.95 + si * 3.2;
      const isPort = serie.name === 'Din portefølje';
      ddSlide.addShape('roundRect', { x: bx, y: 1.85, w: 2.8, h: 0.65, rectRadius: 0.06, fill: { color: isPort ? COLORS.softRed : COLORS.light }, line: { color: isPort ? 'FCA5A5' : COLORS.line, pt: 1 } });
      ddSlide.addText(serie.name, { x: bx, y: 1.88, w: 2.8, h: 0.16, fontSize: 8, color: COLORS.muted, align: 'center', bold: true });
      ddSlide.addText(`${serie.maxDD.toFixed(1)}%`, { x: bx, y: 2.08, w: 2.8, h: 0.25, fontSize: 16, color: COLORS.danger, align: 'center', bold: true });
    });

    const ddChartSeries = drawdownChart.series.map((serie) => ({
      name: serie.name,
      labels: drawdownChart.labels,
      values: serie.values,
    }));
    ddSlide.addChart('line', ddChartSeries, {
      x: 0.65, y: 2.75, w: 11.7, h: 4.0,
      showLegend: true, legendPos: 'b', legendFontSize: 8,
      showTitle: false, lineSize: 2, lineSmooth: false, showValue: false,
      catAxisLabelFontSize: 7, catAxisLabelColor: COLORS.muted,
      valAxisLabelFontSize: 8, valAxisLabelColor: COLORS.muted, valAxisNumFmt: '0.0"%"',
      catGridLine: { style: 'none' },
      valGridLine: { color: COLORS.line, style: 'dash', size: 0.5 },
      chartColors: drawdownChart.series.map((_, i) => DD_COLORS[i % DD_COLORS.length]),
      plotArea: { fill: { color: COLORS.white }, border: { color: COLORS.line, pt: 0.5 } },
    });
  }

  // 8 Aggregated exposure
  const ae = payload.aggregertEksponering;
  if (ae && ((ae.regioner && ae.regioner.length > 0) || (ae.sektorer && ae.sektorer.length > 0))) {
    const aeSlide = pptx.addSlide();
    addChrome(aeSlide, page++, 'Porteføljeeksponering');
    addTitle(aeSlide, 'Hvor er pengene investert?', ae.beskrivelse || 'Vektet eksponering for den samlede porteføljen');
    if (ae.regioner && ae.regioner.length > 0) addBarRows(aeSlide, 'Regioner', ae.regioner, 0.95, 1.95, 5.6, 2.4, COLORS.teal);
    if (ae.sektorer && ae.sektorer.length > 0) addBarRows(aeSlide, 'Sektorer', ae.sektorer, 6.8, 1.95, 5.55, 2.4, COLORS.blue);
    if (ae.stil && ae.stil.length > 0) addBarRows(aeSlide, 'Stil', ae.stil, 0.95, 4.6, 5.6, 2.0, COLORS.gold);
  }

  // 9 Verdiutvikling
  if (d.verdiutvikling.length > 0) {
    const vSlide = pptx.addSlide();
    addChrome(vSlide, page++, 'Verdiutvikling');
    addTitle(vSlide, 'Forventet verdiutvikling per aktivaklasse', `${d.horisont} års horisont med ${pct(d.expected)} årlig avkastning`);

    const vHeaders = [[
      { text: 'År', options: { bold: true, color: COLORS.white, fontSize: 8.5, fill: COLORS.navy } },
      ...d.alloc.map((a) => ({ text: a.navn, options: { bold: true, color: COLORS.white, fontSize: 8, fill: COLORS.navy, align: 'right' } })),
      { text: 'Total', options: { bold: true, color: COLORS.white, fontSize: 8.5, fill: COLORS.navy, align: 'right' } }
    ]];
    const vRows = d.verdiutvikling.slice(0, 15).map((row) => [
      { text: String(row.year || ''), options: { fontSize: 8.5, bold: true, color: COLORS.navy } },
      ...d.alloc.map((a) => ({ text: `${currency(n(row[a.navn]))} kr`, options: { fontSize: 8, align: 'right', color: COLORS.muted } })),
      { text: `${currency(n(row.total))} kr`, options: { fontSize: 8.5, align: 'right', bold: true, color: COLORS.navy } }
    ]);
    vSlide.addTable([...vHeaders, ...vRows], {
      x: 0.65, y: 1.85, w: 12.0, rowH: 0.28, fontSize: 9,
      border: { pt: 1, color: COLORS.line }, fill: COLORS.white, color: COLORS.text, margin: 0.04
    });
  }

  // 10 Disclaimer
  {
    const s = pptx.addSlide();
    addChrome(s, page++, 'Viktig informasjon');
    addTitle(s, 'Viktig informasjon', '');
    addBodyParagraph(
      s,
      'Denne rapporten er kun veiledende og basert på historiske avkastningsforventninger. Historisk avkastning er ingen garanti for fremtidig avkastning. Verdien av investeringer kan både øke og synke.',
      0.9, 1.95, 11.8, 1.0, 14
    );
    addBodyParagraph(
      s,
      'Sharpe Ratio er beregnet med risikofri rente på 3% p.a. Volatilitet er annualisert standardavvik basert på månedlige avkastninger. Maks Drawdown viser det største kursfallet fra topp til bunn.',
      0.9, 3.1, 11.8, 0.8, 14
    );
    // Contact box
    s.addShape('roundRect', { x: 0.65, y: 5.5, w: 12.05, h: 0.7, rectRadius: 0.06, fill: { color: COLORS.softBlue }, line: { color: COLORS.navy, pt: 1.5 } });
    s.addText('Kontakt din rådgiver i Pensum Asset Management for videre oppfølging.', { x: 0.85, y: 5.6, w: 8, h: 0.2, fontSize: 11, bold: true, color: COLORS.navy });
    s.addText('www.pensumgroup.no  |  post@pensumgroup.no', { x: 0.85, y: 5.85, w: 8, h: 0.18, fontSize: 9, color: COLORS.muted });
    s.addText('Pensum Asset Management AS', { x: 9.5, y: 5.65, w: 3, h: 0.35, fontSize: 10, color: COLORS.navy, align: 'right', bold: true });
  }

  return pptx;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    if (!PptxGenJS) throw new Error('pptxgenjs er ikke tilgjengelig');
    const isRapport = !!req.body?.rapportMode;
    const pptx = isRapport ? buildRapportDeck(req.body || {}) : buildDeck(req.body || {});
    const buffer = await pptx.write({ outputType: 'nodebuffer' });
    const kunde = safeFilename(req.body?.kundeNavn || 'Kunde');
    const filnavn = isRapport
      ? `Pensum_Kunderapport_${kunde}_${new Date().toISOString().slice(0, 10)}.pptx`
      : `Pensum_Investeringsforslag_${kunde}_${new Date().toISOString().slice(0, 10)}.pptx`;

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
