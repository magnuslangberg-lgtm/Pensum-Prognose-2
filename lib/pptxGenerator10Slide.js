import pptxgen from 'pptxgenjs';

// ─── COLOR PALETTE ───
const C = {
  navy: '0D2841',
  darkBlue: '012441',
  accent: '6B9DB8',
  salmon: 'C4967E',
  teal: '2D6A6A',
  gold: 'A67B3D',
  purple: '5B4FA0',
  green: '2D6A4F',
  lightBlue: 'E8F0F4',
  lightGray: 'F5F5F5',
  warmGray: 'F9F7F5',
  text: '262626',
  muted: '4A5568',
  line: 'D1D5DB',
  white: 'FFFFFF',
  softAmber: 'FDF6F2',
  softGreen: 'E8F5F0',
  softRed: 'FDF2F2',
  midBlue: '123C6A',
};

const PRODUCT_COLORS = ['0D2841', '6B9DB8', 'C4967E', '2D6A6A', 'A67B3D', '5B4FA0', '2D6A4F', '123C6A', '8B6BB8'];
const ALLOC_COLORS = {
  'Globale Aksjer': '6B9DB8', 'Norske Aksjer': '0D2841', 'Høyrente': 'C4967E',
  'Investment Grade': 'D4B8A8', 'Private Equity': '2D6A6A', 'Eiendom': 'A67B3D',
};
const AKTIVA_COLORS = { Aksjer: '0D2841', Renter: 'C4967E', Alternativer: '2D6A6A', Blandet: 'A67B3D' };

const FONT = 'Merriweather Sans';
const fmt = (v, dec = 0) => typeof v === 'number' && Number.isFinite(v) ? v.toLocaleString('nb-NO', { maximumFractionDigits: dec, minimumFractionDigits: dec }) : '–';
const fmtPct = (v, dec = 1) => typeof v === 'number' && Number.isFinite(v) ? `${v.toFixed(dec)}%` : '–';
const fmtKr = (v) => typeof v === 'number' && Number.isFinite(v) ? `kr ${Math.round(v).toLocaleString('nb-NO')}` : '–';
const fmtMnok = (v) => {
  if (typeof v !== 'number' || !Number.isFinite(v)) return '–';
  if (v >= 1e6) return `${(v / 1e6).toFixed(1)} MNOK`;
  if (v >= 1e3) return `${Math.round(v / 1e3)} TNOK`;
  return fmtKr(v);
};

// ─── SLIDE HELPERS ───
function addHeader(pptx, slide, title, subtitle = '') {
  slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 0.12, h: 7.5, fill: { color: C.navy } });
  slide.addText(title, { x: 0.7, y: 0.32, w: 11.5, h: 0.45, fontFace: FONT, fontSize: 22, bold: true, color: C.navy });
  if (subtitle) slide.addText(subtitle, { x: 0.7, y: 0.8, w: 11.5, h: 0.22, fontFace: FONT, fontSize: 10, color: C.muted });
  slide.addShape(pptx.ShapeType.line, { x: 0.7, y: 1.1, w: 11.9, h: 0, line: { color: C.line, pt: 1 } });
}

function addFooter(pptx, slide, pageNum = '') {
  slide.addShape(pptx.ShapeType.line, { x: 0.7, y: 6.75, w: 11.9, h: 0, line: { color: C.line, pt: 0.5 } });
  slide.addText('Illustrativ modellportefølje – ikke personlig investeringsråd eller egnethetsvurdering.', {
    x: 0.7, y: 6.82, w: 9, h: 0.18, fontFace: FONT, fontSize: 7, color: C.muted,
  });
  slide.addText('Pensum Asset Management AS', {
    x: 10.2, y: 6.82, w: 2.8, h: 0.18, fontFace: FONT, fontSize: 7, color: C.muted, align: 'right',
  });
  if (pageNum) {
    slide.addText(String(pageNum), { x: 12.5, y: 6.82, w: 0.5, h: 0.18, fontFace: FONT, fontSize: 7, color: C.muted, align: 'right' });
  }
}

function addKpiCard(pptx, slide, x, y, w, h, label, value, opts = {}) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x, y, w, h, rectRadius: 0.06,
    fill: { color: opts.bg || C.lightBlue },
    line: { color: C.line, pt: 0.5 },
    shadow: { type: 'outer', blur: 3, offset: 1, opacity: 0.08, color: '000000' },
  });
  slide.addShape(pptx.ShapeType.rect, {
    x: x + 0.08, y: y + 0.05, w: w - 0.16, h: 0.04,
    fill: { color: opts.accentColor || C.accent },
  });
  slide.addText(label, { x: x + 0.12, y: y + 0.16, w: w - 0.24, h: 0.18, fontFace: FONT, fontSize: 8, color: C.muted });
  slide.addText(String(value), { x: x + 0.12, y: y + 0.36, w: w - 0.24, h: 0.35, fontFace: FONT, fontSize: opts.valueFontSize || 18, bold: true, color: C.navy });
}

function addKpiRow(pptx, slide, metrics, y, opts = {}) {
  const count = Math.min(metrics.length, 6);
  if (!count) return;
  const totalW = opts.totalW || 11.9;
  const gap = 0.15;
  const w = (totalW - gap * (count - 1)) / count;
  const startX = opts.startX || 0.7;
  metrics.slice(0, count).forEach((m, i) => {
    addKpiCard(pptx, slide, startX + i * (w + gap), y, w, opts.h || 0.85, m.label, m.value, m);
  });
}

function addDonutChart(pptx, slide, data, x, y, opts = {}) {
  const size = opts.size || 2.4;
  const filtered = data.filter(d => d.value > 0);
  if (!filtered.length) return;
  slide.addChart(pptx.ChartType.doughnut, [{
    name: opts.title || 'Fordeling',
    labels: filtered.map(d => d.name),
    values: filtered.map(d => d.value),
  }], {
    x, y, w: size, h: size,
    showLegend: false, showTitle: false, showValue: false, showPercent: false, showLabel: false,
    holeSize: 55,
    chartColors: filtered.map((d, i) => d.color || PRODUCT_COLORS[i % PRODUCT_COLORS.length]),
    border: { pt: 0 }, shadow: { type: 'none' },
  });
  if (opts.showLegend !== false) {
    const lx = x + size + 0.2;
    const ly = y + 0.15;
    filtered.forEach((d, i) => {
      const cy = ly + i * 0.28;
      slide.addShape(pptx.ShapeType.ellipse, {
        x: lx, y: cy + 0.04, w: 0.13, h: 0.13,
        fill: { color: d.color || PRODUCT_COLORS[i % PRODUCT_COLORS.length] },
      });
      slide.addText(d.name, { x: lx + 0.2, y: cy, w: opts.legendW || 2.4, h: 0.21, fontFace: FONT, fontSize: 8.5, color: C.text });
      slide.addText(`${d.value.toFixed(1)}%`, { x: lx + (opts.legendW || 2.4) + 0.08, y: cy, w: 0.65, h: 0.21, fontFace: FONT, fontSize: 8.5, bold: true, color: C.navy, align: 'right' });
    });
  }
}

function addHBarChart(pptx, slide, data, x, y, w, opts = {}) {
  const barH = 0.26;
  const gap = 0.06;
  const maxVal = opts.maxVal || Math.max(...data.map(d => d.value), 1);
  const labelW = opts.labelW || 1.8;
  data.forEach((d, i) => {
    const cy = y + i * (barH + gap);
    slide.addText(d.name, { x, y: cy, w: labelW, h: barH, fontFace: FONT, fontSize: 8.5, color: C.text, valign: 'mid' });
    slide.addShape(pptx.ShapeType.roundRect, {
      x: x + labelW + 0.08, y: cy + 0.03, w: w - labelW - 0.08, h: barH - 0.06,
      rectRadius: 0.04, fill: { color: C.lightGray },
    });
    const barW = Math.max(0.04, (d.value / maxVal) * (w - labelW - 0.08));
    slide.addShape(pptx.ShapeType.roundRect, {
      x: x + labelW + 0.08, y: cy + 0.03, w: barW, h: barH - 0.06,
      rectRadius: 0.04, fill: { color: d.color || C.accent },
    });
    slide.addText(fmtPct(d.value), { x: x + w - 0.65, y: cy, w: 0.65, h: barH, fontFace: FONT, fontSize: 8, bold: true, color: C.navy, align: 'right', valign: 'mid' });
  });
}

function addInfoBox(pptx, slide, x, y, w, h, title, items) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x, y, w, h, rectRadius: 0.08,
    fill: { color: C.lightBlue }, line: { color: C.line, pt: 0.5 },
  });
  slide.addText(title, { x: x + 0.15, y: y + 0.1, w: w - 0.3, h: 0.24, fontFace: FONT, fontSize: 10, bold: true, color: C.navy });
  items.forEach(([label, val], i) => {
    const iy = y + 0.42 + i * 0.36;
    slide.addText(label, { x: x + 0.15, y: iy, w: w * 0.45, h: 0.16, fontFace: FONT, fontSize: 8.5, color: C.muted });
    slide.addText(String(val), { x: x + w * 0.45, y: iy, w: w * 0.5, h: 0.16, fontFace: FONT, fontSize: 9, bold: true, color: C.navy, align: 'right' });
  });
}

function buildTable(headerCols, rows, opts = {}) {
  const headerRow = headerCols.map(col => ({
    text: col, options: { fontFace: FONT, fontSize: 8.5, bold: true, color: C.white, fill: { color: C.navy }, align: 'left', valign: 'mid' },
  }));
  const dataRows = rows.map((row, ri) => row.map((cell, ci) => ({
    text: String(cell ?? '–'),
    options: {
      fontFace: FONT, fontSize: 8.5, color: C.text, valign: 'mid',
      fill: { color: ri % 2 === 0 ? C.white : C.lightGray },
      ...(opts.colAlign?.[ci] ? { align: opts.colAlign[ci] } : {}),
    },
  })));
  return [headerRow, ...dataRows];
}

// ─── CAGR helper ───
function cagr(start, end, years) {
  if (!start || !end || !years || start <= 0) return null;
  return (Math.pow(end / start, 1 / years) - 1) * 100;
}

// ─── MAIN GENERATOR ───
export async function generateProposal10SlidePptx(payload) {
  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_WIDE';
  pptx.author = 'Pensum Asset Management';
  pptx.company = 'Pensum Asset Management AS';
  pptx.subject = 'Investeringsforslag';
  pptx.title = `Pensum – Investeringsforslag – ${payload.kundeNavn || 'Kunde'}`;
  pptx.lang = 'nb-NO';
  pptx.theme = { headFontFace: FONT, bodyFontFace: FONT };

  const {
    kundeNavn = 'Investor',
    risikoProfil = 'Moderat',
    horisont = 5,
    investerbarKapital = 0,
    totalFormue = 0,
    vektetAvkastning = 0,
    allokering = [],
    pensumAllokering = [],
    pensumProdukter = [],
    produkterIBruk = [],
    produktEksponering = {},
    pensumForventetAvkastning = 0,
    pensumLikviditet = {},
    aktivafordeling = [],
    scenarioParams = {},
    scenarioData = [],
    verdiutvikling = [],
    historiskPortefolje = {},
    eksponering = {},
    kundeinfo = {},
    radgiver = '',
    dato = '',
  } = payload;

  const invKapital = investerbarKapital || totalFormue || 0;
  const forventetAvk = pensumForventetAvkastning || vektetAvkastning || 0;

  // Merge product data
  const alleProdukter = Array.isArray(pensumProdukter) ? pensumProdukter : [
    ...(pensumProdukter?.enkeltfond || []),
    ...(pensumProdukter?.fondsportefoljer || []),
    ...(pensumProdukter?.alternative || []),
  ];
  const produktMap = {};
  alleProdukter.forEach(p => { if (p?.id) produktMap[p.id] = p; });

  // Build product list with weights from pensumAllokering
  const produkterMedVekt = (Array.isArray(pensumAllokering) ? pensumAllokering : [])
    .filter(a => a.vekt > 0 && produkterIBruk.includes(a.id))
    .map((a, i) => {
      const p = produktMap[a.id] || {};
      return { ...p, ...a, color: PRODUCT_COLORS[i % PRODUCT_COLORS.length] };
    })
    .sort((a, b) => (b.vekt || 0) - (a.vekt || 0));

  // Weighted yield
  const vektetYield = produkterMedVekt.reduce((s, p) => {
    const y = p.forventetYield ?? p.expectedYield ?? 0;
    return s + y * (p.vekt / 100);
  }, 0);

  // Scenario end values
  const lastScenario = scenarioData?.length > 0 ? scenarioData[scenarioData.length - 1] : {};
  const sluttverdiForventet = lastScenario?.forventet || (verdiutvikling?.length > 0 ? verdiutvikling[verdiutvikling.length - 1]?.total : invKapital);
  const sluttverdiLav = lastScenario?.pessimistisk || sluttverdiForventet * 0.8;
  const sluttverdiHoy = lastScenario?.optimistisk || sluttverdiForventet * 1.3;

  // Aktiva split for badges
  const aktivaSplit = Array.isArray(aktivafordeling) ? aktivafordeling : [];
  const aksjeAndel = aktivaSplit.find(a => a.name === 'Aksjer')?.value || 0;
  const renteAndel = aktivaSplit.find(a => a.name === 'Renter')?.value || 0;
  const blandetAndel = aktivaSplit.find(a => a.name === 'Blandet')?.value || 0;

  let slide;
  let pageNum = 0;

  // ══════════════════════════════════════════════════════════════
  // SLIDE 1: FORSIDE / EXECUTIVE SNAPSHOT
  // ══════════════════════════════════════════════════════════════
  slide = pptx.addSlide();
  slide.background = { color: C.white };
  // Navy left band
  slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 0.35, h: 7.5, fill: { color: C.navy } });
  slide.addShape(pptx.ShapeType.rect, { x: 0.35, y: 0, w: 0.06, h: 7.5, fill: { color: C.accent } });
  // Title
  slide.addText('Investeringsforslag', {
    x: 1.2, y: 1.0, w: 7, h: 0.7,
    fontFace: FONT, fontSize: 36, bold: true, color: C.navy,
  });
  slide.addShape(pptx.ShapeType.line, { x: 1.2, y: 1.85, w: 3, h: 0, line: { color: C.accent, pt: 2 } });
  slide.addText(`Utarbeidet for ${kundeNavn}`, {
    x: 1.2, y: 2.1, w: 7, h: 0.3, fontFace: FONT, fontSize: 14, color: C.text,
  });
  slide.addText(`Pensum Asset Management AS  |  ${dato || new Date().toLocaleDateString('nb-NO')}`, {
    x: 1.2, y: 2.5, w: 7, h: 0.22, fontFace: FONT, fontSize: 10, color: C.muted,
  });
  if (radgiver) {
    slide.addText(`Rådgiver: ${radgiver}`, {
      x: 1.2, y: 2.78, w: 7, h: 0.22, fontFace: FONT, fontSize: 10, color: C.muted,
    });
  }

  // Right-side KPI cards
  const coverKpis = [
    ['Investerbar kapital', fmtMnok(invKapital)],
    ['Forventet avkastning', fmtPct(forventetAvk)],
    ['Forventet yield', fmtPct(vektetYield)],
    ['Aksjer / Renter', `${Math.round(aksjeAndel + blandetAndel * 0.5)}% / ${Math.round(renteAndel + blandetAndel * 0.5)}%`],
    ['Sluttverdi (base)', fmtMnok(sluttverdiForventet)],
    ['Horisont', `${horisont} år`],
  ];
  coverKpis.forEach(([label, value], i) => {
    const row = Math.floor(i / 2);
    const col = i % 2;
    const cx = 8.0 + col * 2.4;
    const cy = 1.0 + row * 1.15;
    addKpiCard(pptx, slide, cx, cy, 2.2, 0.95, label, value, { valueFontSize: 15 });
  });

  // Badges
  const badges = [
    `Likviditet: ${(pensumLikviditet?.likvid || 0) > 80 ? 'Høy' : (pensumLikviditet?.likvid || 0) > 50 ? 'Middels' : 'Lav'}`,
    `Risikoprofil: ${risikoProfil}`,
  ];
  badges.forEach((badge, i) => {
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 1.2 + i * 3.0, y: 5.8, w: 2.7, h: 0.38, rectRadius: 0.19,
      fill: { color: C.lightBlue }, line: { color: C.accent, pt: 1 },
    });
    slide.addText(badge, { x: 1.2 + i * 3.0, y: 5.8, w: 2.7, h: 0.38, fontFace: FONT, fontSize: 9, color: C.navy, align: 'center', valign: 'mid' });
  });

  addFooter(pptx, slide);

  // ══════════════════════════════════════════════════════════════
  // SLIDE 2: UTGANGSPUNKT OG INVESTERINGSMANDAT
  // ══════════════════════════════════════════════════════════════
  pageNum++;
  slide = pptx.addSlide();
  slide.background = { color: C.white };
  addHeader(pptx, slide, 'Utgangspunkt og investeringsmandat', 'Kundens mål, horisont og risikovillighet');

  // Left: Key facts
  const mandatFacts = [
    ['Samlet formue', fmtMnok(totalFormue || invKapital)],
    ['Investerbar kapital', fmtMnok(invKapital)],
    ['Risikoprofil', risikoProfil],
    ['Horisont', `${horisont} år`],
    ['Forventet avkastning', fmtPct(forventetAvk)],
    ['Likviditetsbehov', (pensumLikviditet?.likvid || 0) > 80 ? 'Lavt – hovedsakelig likvide produkter' : 'Moderat – blanding av likvide og illikvide'],
  ];
  mandatFacts.forEach(([label, val], i) => {
    const iy = 1.4 + i * 0.55;
    slide.addShape(pptx.ShapeType.rect, { x: 0.7, y: iy, w: 0.08, h: 0.35, fill: { color: i % 2 === 0 ? C.accent : C.salmon } });
    slide.addText(label, { x: 1.0, y: iy, w: 2.5, h: 0.35, fontFace: FONT, fontSize: 9.5, color: C.muted, valign: 'mid' });
    slide.addText(String(val), { x: 3.5, y: iy, w: 3.0, h: 0.35, fontFace: FONT, fontSize: 10, bold: true, color: C.navy, valign: 'mid' });
  });

  // Right: Advisor assessment box
  addInfoBox(pptx, slide, 7.2, 1.4, 5.4, 3.0, 'Rådgivers vurdering', [
    ['Målsetting', 'Langsiktig kapitalvekst'],
    ['Profil', `${risikoProfil} – tilpasset investors preferanser`],
    ['Allokering', `${Math.round(aksjeAndel + blandetAndel * 0.5)}% aksjer, ${Math.round(renteAndel + blandetAndel * 0.5)}% renter`],
    ['Horisont', `${horisont} år med årlig rapportering`],
    ['Tilnærming', 'Diversifisert, aktiv forvaltning'],
  ]);

  // Kundeformue breakdown
  const formueItems = [];
  if (kundeinfo.aksjerKunde > 0) formueItems.push({ name: 'Aksjer', value: kundeinfo.aksjerKunde });
  if (kundeinfo.aksjefondKunde > 0) formueItems.push({ name: 'Aksjefond', value: kundeinfo.aksjefondKunde });
  if (kundeinfo.renterKunde > 0) formueItems.push({ name: 'Renter', value: kundeinfo.renterKunde });
  if (kundeinfo.kontanterKunde > 0) formueItems.push({ name: 'Kontanter', value: kundeinfo.kontanterKunde });
  if (kundeinfo.peFondKunde > 0) formueItems.push({ name: 'Private Equity', value: kundeinfo.peFondKunde });
  if (kundeinfo.egenEiendomKunde > 0) formueItems.push({ name: 'Eiendom', value: kundeinfo.egenEiendomKunde });
  if (formueItems.length > 0) {
    slide.addText('Eksisterende formuesstruktur', { x: 0.7, y: 4.8, w: 5, h: 0.25, fontFace: FONT, fontSize: 10, bold: true, color: C.navy });
    formueItems.slice(0, 6).forEach((item, i) => {
      const iy = 5.15 + i * 0.28;
      slide.addText(item.name, { x: 0.9, y: iy, w: 2.5, h: 0.24, fontFace: FONT, fontSize: 8.5, color: C.text });
      slide.addText(fmtKr(item.value), { x: 3.4, y: iy, w: 2, h: 0.24, fontFace: FONT, fontSize: 8.5, bold: true, color: C.navy, align: 'right' });
    });
  }

  addFooter(pptx, slide, String(pageNum));

  // ══════════════════════════════════════════════════════════════
  // SLIDE 3: ANBEFALT PORTEFØLJESAMMENSETNING
  // ══════════════════════════════════════════════════════════════
  pageNum++;
  slide = pptx.addSlide();
  slide.background = { color: C.white };
  addHeader(pptx, slide, 'Anbefalt porteføljesammensetning', 'Allokering per produkt med rolle og nøkkeltall');

  // Donut chart left
  const donutData = produkterMedVekt.map((p, i) => ({
    name: p.navn || p.id,
    value: p.vekt,
    color: p.color,
  }));
  if (donutData.length > 0) {
    addDonutChart(pptx, slide, donutData, 0.7, 1.35, { size: 2.6, legendW: 2.6 });
  }

  // Table right
  const allokeringRows = produkterMedVekt.map(p => [
    p.navn || p.id,
    fmtPct(p.vekt),
    fmtKr((p.vekt / 100) * invKapital),
    p.role || p.rolle || '–',
    fmtPct(p.forventetAvkastning ?? p.expectedReturn),
    p.risikonivaa || p.riskText?.split('.')[0] || '–',
  ]);
  if (allokeringRows.length > 0) {
    const tableData = buildTable(
      ['Produkt', 'Vekt', 'Beløp', 'Rolle', 'Forv. avk.', 'Risiko'],
      allokeringRows,
      { colAlign: [null, 'center', 'right', null, 'center', null] }
    );
    slide.addTable(tableData, {
      x: 6.3, y: 1.3, w: 6.3,
      border: { type: 'solid', pt: 0.5, color: C.line },
      rowH: 0.32, valign: 'mid',
      colW: [1.6, 0.55, 0.95, 1.15, 0.65, 1.05],
      autoPageRepeatHeader: true,
    });
  }

  // Bottom KPI summary
  addKpiRow(pptx, slide, [
    { label: 'Antall produkter', value: String(produkterMedVekt.length), accentColor: C.navy },
    { label: 'Forventet avkastning', value: fmtPct(forventetAvk), accentColor: C.accent },
    { label: 'Forventet yield', value: fmtPct(vektetYield), accentColor: C.salmon },
    { label: 'Sluttverdi (base)', value: fmtMnok(sluttverdiForventet), accentColor: C.teal },
  ], 5.7, { h: 0.75 });

  addFooter(pptx, slide, String(pageNum));

  // ══════════════════════════════════════════════════════════════
  // SLIDE 4: HVORDAN PORTEFØLJEN ER BYGGET
  // ══════════════════════════════════════════════════════════════
  pageNum++;
  slide = pptx.addSlide();
  slide.background = { color: C.white };
  addHeader(pptx, slide, 'Hvordan porteføljen er bygget', 'Kjerne, stabilisator og satellitter');

  // Categorize products
  const kjerneIds = ['global-core-active', 'global-edge', 'basis'];
  const stabilisatorIds = ['global-hoyrente', 'nordisk-hoyrente', 'financial-d'];
  const kjerne = produkterMedVekt.filter(p => kjerneIds.includes(p.id));
  const stabilisator = produkterMedVekt.filter(p => stabilisatorIds.includes(p.id));
  const satellitter = produkterMedVekt.filter(p => !kjerneIds.includes(p.id) && !stabilisatorIds.includes(p.id));

  const groups = [
    { label: 'Kjerne', desc: 'Hovedmotor – global og norsk aksjeeksponering', items: kjerne, color: C.navy, bgColor: C.lightBlue },
    { label: 'Stabilisator / Rentedel', desc: 'Kontantstrøm og lavere volatilitet', items: stabilisator, color: C.salmon, bgColor: C.softAmber },
    { label: 'Satellitter', desc: 'Tematisk og spisset eksponering', items: satellitter, color: C.teal, bgColor: C.softGreen },
  ];

  let gy = 1.35;
  groups.forEach((group) => {
    if (group.items.length === 0) return;
    // Group header bar
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.7, y: gy, w: 11.9, h: 0.38, rectRadius: 0.06,
      fill: { color: group.color },
    });
    slide.addText(`${group.label}  •  ${group.desc}`, {
      x: 0.9, y: gy, w: 11.5, h: 0.38,
      fontFace: FONT, fontSize: 10, bold: true, color: C.white, valign: 'mid',
    });
    gy += 0.45;

    // Product rows
    group.items.forEach((p) => {
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 0.7, y: gy, w: 11.9, h: 0.42, rectRadius: 0.04,
        fill: { color: group.bgColor }, line: { color: C.line, pt: 0.5 },
      });
      slide.addShape(pptx.ShapeType.ellipse, {
        x: 0.9, y: gy + 0.1, w: 0.22, h: 0.22,
        fill: { color: p.color },
      });
      slide.addText(p.navn || p.id, { x: 1.25, y: gy, w: 3.5, h: 0.42, fontFace: FONT, fontSize: 9.5, bold: true, color: C.navy, valign: 'mid' });
      slide.addText(fmtPct(p.vekt), { x: 4.8, y: gy, w: 0.8, h: 0.42, fontFace: FONT, fontSize: 9.5, bold: true, color: C.navy, valign: 'mid', align: 'center' });
      slide.addText(fmtKr((p.vekt / 100) * invKapital), { x: 5.65, y: gy, w: 1.5, h: 0.42, fontFace: FONT, fontSize: 9, color: C.text, valign: 'mid', align: 'right' });
      slide.addText(p.role || p.rolle || p.pitch || '–', { x: 7.4, y: gy, w: 5.0, h: 0.42, fontFace: FONT, fontSize: 8.5, color: C.muted, valign: 'mid' });
      gy += 0.48;
    });
    gy += 0.15;
  });

  addFooter(pptx, slide, String(pageNum));

  // ══════════════════════════════════════════════════════════════
  // SLIDE 5: SCENARIOANALYSE OG FORVENTET UTVIKLING
  // ══════════════════════════════════════════════════════════════
  pageNum++;
  slide = pptx.addSlide();
  slide.background = { color: C.white };
  addHeader(pptx, slide, 'Scenarioanalyse og forventet utvikling', 'Lav, base og høy – sluttverdi og CAGR per scenario');

  // Scenario KPIs
  const cagrBase = cagr(invKapital, sluttverdiForventet, horisont);
  const cagrLav = cagr(invKapital, sluttverdiLav, horisont);
  const cagrHoy = cagr(invKapital, sluttverdiHoy, horisont);

  const scenarioMetrics = [
    { label: 'Pessimistisk', value: fmtMnok(sluttverdiLav), accentColor: C.salmon, bg: C.softRed },
    { label: 'Base (forventet)', value: fmtMnok(sluttverdiForventet), accentColor: C.accent, bg: C.lightBlue },
    { label: 'Optimistisk', value: fmtMnok(sluttverdiHoy), accentColor: C.green, bg: C.softGreen },
  ];
  addKpiRow(pptx, slide, scenarioMetrics, 1.3, { h: 0.95 });

  // CAGR row below
  const cagrCards = [
    { label: 'CAGR pessimistisk', value: fmtPct(cagrLav), accentColor: C.salmon },
    { label: 'CAGR base', value: fmtPct(cagrBase), accentColor: C.accent },
    { label: 'CAGR optimistisk', value: fmtPct(cagrHoy), accentColor: C.green },
  ];
  addKpiRow(pptx, slide, cagrCards, 2.4, { h: 0.7 });

  // Line chart for scenarios
  if (scenarioData?.length > 1) {
    const labels = scenarioData.map(d => String(d.year));
    slide.addChart(pptx.ChartType.line, [
      { name: 'Pessimistisk', labels, values: scenarioData.map(d => d.pessimistisk || 0) },
      { name: 'Forventet', labels, values: scenarioData.map(d => d.forventet || 0) },
      { name: 'Optimistisk', labels, values: scenarioData.map(d => d.optimistisk || 0) },
    ], {
      x: 0.7, y: 3.3, w: 7.5, h: 3.1,
      showLegend: true, legendPos: 'b', legendFontSize: 8, legendFontFace: FONT,
      showTitle: false,
      lineDataSymbol: 'none',
      lineSmooth: true,
      lineSize: 2,
      chartColors: [C.salmon, C.accent, C.green],
      catAxisLabelFontFace: FONT, catAxisLabelFontSize: 8, catAxisLabelColor: C.muted,
      valAxisLabelFontFace: FONT, valAxisLabelFontSize: 8, valAxisLabelColor: C.muted,
      valAxisNumFmt: '#,##0',
      plotArea: { fill: { color: C.white } },
    });
  }

  // Right side: explanation box
  addInfoBox(pptx, slide, 8.6, 3.3, 4.0, 2.8, 'Hva driver forskjellene?', [
    ['Pess. avkastning', fmtPct(scenarioParams?.pessimistisk)],
    ['Base avkastning', fmtPct(forventetAvk)],
    ['Opt. avkastning', fmtPct(scenarioParams?.optimistisk)],
    ['Horisont', `${horisont} år`],
    ['Startkapital', fmtMnok(invKapital)],
  ]);

  addFooter(pptx, slide, String(pageNum));

  // ══════════════════════════════════════════════════════════════
  // SLIDE 6: HISTORIKK OG RISIKOBILDE
  // ══════════════════════════════════════════════════════════════
  pageNum++;
  slide = pptx.addSlide();
  slide.background = { color: C.white };
  addHeader(pptx, slide, 'Historikk og risikobilde', 'Historisk utvikling, volatilitet og drawdown');

  // Historical performance table
  const histYears = ['aar2026', 'aar2025', 'aar2024', 'aar2023', 'aar2022'];
  const histLabels = ['2026 YTD', '2025', '2024', '2023', '2022'];
  const histHeader = ['Produkt', ...histLabels, 'Årl. 3 år', 'Risiko 3 år'];
  const histRows = produkterMedVekt.slice(0, 9).map(p => {
    const prod = produktMap[p.id] || p;
    return [
      (p.navn || p.id).replace('Pensum ', ''),
      ...histYears.map(y => fmtPct(prod[y])),
      fmtPct(prod.aarlig3ar),
      fmtPct(prod.risiko3ar),
    ];
  });

  // Add weighted portfolio row
  if (historiskPortefolje?.aarligAvkastning) {
    const portRow = ['Porteføljen (vektet)'];
    histYears.forEach(y => {
      const val = historiskPortefolje[y];
      portRow.push(fmtPct(val));
    });
    portRow.push(fmtPct(historiskPortefolje.aarligAvkastning));
    portRow.push(fmtPct(historiskPortefolje.risiko));
    histRows.push(portRow);
  }

  if (histRows.length > 0) {
    const tData = buildTable(histHeader, histRows, {
      colAlign: [null, 'center', 'center', 'center', 'center', 'center', 'center', 'center'],
    });
    slide.addTable(tData, {
      x: 0.7, y: 1.3, w: 11.9,
      border: { type: 'solid', pt: 0.5, color: C.line },
      rowH: 0.3, valign: 'mid',
      colW: [2.3, 1.0, 1.0, 1.0, 1.0, 1.0, 1.8, 1.8],
      autoPageRepeatHeader: true,
    });
  }

  // Risk metrics cards at bottom
  const riskMetrics = [];
  if (historiskPortefolje?.aarligAvkastning != null) riskMetrics.push({ label: 'Annualisert avkastning', value: fmtPct(historiskPortefolje.aarligAvkastning), accentColor: C.accent });
  if (historiskPortefolje?.risiko != null) riskMetrics.push({ label: 'Volatilitet (ann.)', value: fmtPct(historiskPortefolje.risiko), accentColor: C.salmon });
  if (historiskPortefolje?.maxDrawdown != null) riskMetrics.push({ label: 'Maks drawdown', value: fmtPct(historiskPortefolje.maxDrawdown), accentColor: 'B91C1C' });
  if (historiskPortefolje?.besteAar != null) riskMetrics.push({ label: 'Beste år', value: fmtPct(historiskPortefolje.besteAar), accentColor: C.green });
  if (historiskPortefolje?.svaakesteAar != null) riskMetrics.push({ label: 'Svakeste år', value: fmtPct(historiskPortefolje.svaakesteAar), accentColor: 'B91C1C' });

  if (riskMetrics.length > 0) {
    addKpiRow(pptx, slide, riskMetrics.slice(0, 5), 5.5, { h: 0.85 });
  }

  addFooter(pptx, slide, String(pageNum));

  // ══════════════════════════════════════════════════════════════
  // SLIDE 7: HVORFOR SAMMENSETNINGEN KAN FUNGERE
  // ══════════════════════════════════════════════════════════════
  pageNum++;
  slide = pptx.addSlide();
  slide.background = { color: C.white };
  addHeader(pptx, slide, 'Hvorfor sammensetningen kan fungere', 'Regioner, sektorer og porteføljelogikk');

  // Region bar chart - left
  const regioner = (eksponering?.regioner || []).filter(r => r.vekt > 0).slice(0, 8);
  if (regioner.length > 0) {
    slide.addText('Regioneksponering', { x: 0.7, y: 1.3, w: 5, h: 0.25, fontFace: FONT, fontSize: 11, bold: true, color: C.navy });
    addHBarChart(pptx, slide, regioner.map(r => ({ name: r.navn, value: r.vekt, color: C.accent })), 0.7, 1.65, 5.5, { labelW: 1.6 });
  }

  // Sector bar chart - right
  const sektorer = (eksponering?.sektorer || []).filter(s => s.vekt > 0).slice(0, 8);
  if (sektorer.length > 0) {
    slide.addText('Sektoreksponering', { x: 6.8, y: 1.3, w: 5, h: 0.25, fontFace: FONT, fontSize: 11, bold: true, color: C.navy });
    addHBarChart(pptx, slide, sektorer.map(s => ({ name: s.navn, value: s.vekt, color: C.salmon })), 6.8, 1.65, 5.8, { labelW: 2.0 });
  }

  // 3 reasons box
  slide.addText('Tre hovedgrunner til denne sammensetningen', {
    x: 0.7, y: 4.5, w: 11.9, h: 0.3, fontFace: FONT, fontSize: 11, bold: true, color: C.navy,
  });

  const reasons = [
    { title: 'Diversifisering', text: 'Porteføljen sprer risiko over flere aktivaklasser, regioner og forvaltere – og reduserer avhengigheten av enkelthendelser.' },
    { title: 'Kontantstrøm', text: 'Rentedelen sikrer løpende yield og bidrar til stabilitet, mens aksjedelen gir langsiktig vekst.' },
    { title: 'Tilpasset profil', text: `Sammensetningen er skreddersydd for ${risikoProfil.toLowerCase()} risikoprofil med ${horisont} års horisont.` },
  ];
  reasons.forEach((r, i) => {
    const rx = 0.7 + i * 4.1;
    slide.addShape(pptx.ShapeType.roundRect, {
      x: rx, y: 4.9, w: 3.85, h: 1.5, rectRadius: 0.06,
      fill: { color: C.lightBlue }, line: { color: C.line, pt: 0.5 },
    });
    // Number circle
    slide.addShape(pptx.ShapeType.ellipse, {
      x: rx + 0.12, y: 5.0, w: 0.3, h: 0.3,
      fill: { color: C.navy },
    });
    slide.addText(String(i + 1), {
      x: rx + 0.12, y: 5.0, w: 0.3, h: 0.3,
      fontFace: FONT, fontSize: 11, bold: true, color: C.white, align: 'center', valign: 'mid',
    });
    slide.addText(r.title, { x: rx + 0.5, y: 5.0, w: 3.2, h: 0.3, fontFace: FONT, fontSize: 10, bold: true, color: C.navy, valign: 'mid' });
    slide.addText(r.text, { x: rx + 0.15, y: 5.4, w: 3.55, h: 0.9, fontFace: FONT, fontSize: 8.5, color: C.text, valign: 'top', lineSpacingMultiple: 1.25 });
  });

  addFooter(pptx, slide, String(pageNum));

  // ══════════════════════════════════════════════════════════════
  // SLIDE 8: PRODUKTOVERSIKT
  // ══════════════════════════════════════════════════════════════
  pageNum++;
  slide = pptx.addSlide();
  slide.background = { color: C.white };
  addHeader(pptx, slide, 'Produktoversikt', 'Full oversikt over alle produkter i porteføljen');

  const produktRows = produkterMedVekt.map(p => {
    const prod = produktMap[p.id] || p;
    return [
      (p.navn || p.id),
      fmtPct(p.vekt),
      p.role || p.rolle || '–',
      fmtPct(prod.forventetAvkastning ?? prod.expectedReturn),
      fmtPct(prod.forventetYield ?? prod.expectedYield),
      prod.likviditet || (prod.aktivatype === 'alternativ' ? 'Illikvid' : 'Daglig'),
      prod.kategori || prod.aktivatype || '–',
    ];
  });

  if (produktRows.length > 0) {
    const tData = buildTable(
      ['Produkt', 'Vekt', 'Rolle', 'Forv. avk.', 'Yield', 'Likviditet', 'Kategori'],
      produktRows,
      { colAlign: [null, 'center', null, 'center', 'center', 'center', null] }
    );
    slide.addTable(tData, {
      x: 0.7, y: 1.3, w: 11.9,
      border: { type: 'solid', pt: 0.5, color: C.line },
      rowH: 0.36, valign: 'mid',
      colW: [2.5, 0.65, 2.0, 0.85, 0.7, 1.1, 1.5],
      autoPageRepeatHeader: true,
    });
  }

  // Aktiva split donut at bottom
  const aktivaDonutData = aktivaSplit.filter(a => a.value > 0).map(a => ({
    name: a.name, value: a.value, color: (AKTIVA_COLORS[a.name] || C.accent).replace('#', ''),
  }));
  if (aktivaDonutData.length > 0) {
    addDonutChart(pptx, slide, aktivaDonutData, 0.7, 4.6, { size: 1.8, legendW: 1.8 });
  }

  // Liquidity badge
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 6.5, y: 5.2, w: 3.0, h: 0.5, rectRadius: 0.08,
    fill: { color: C.lightBlue }, line: { color: C.accent, pt: 1 },
  });
  slide.addText(`Likviditet: ${fmtPct(pensumLikviditet?.likvid)} likvid`, {
    x: 6.5, y: 5.2, w: 3.0, h: 0.5, fontFace: FONT, fontSize: 9.5, color: C.navy, align: 'center', valign: 'mid',
  });

  addFooter(pptx, slide, String(pageNum));

  // ══════════════════════════════════════════════════════════════
  // SLIDE 9: MARKEDSKONTEKST
  // ══════════════════════════════════════════════════════════════
  pageNum++;
  slide = pptx.addSlide();
  slide.background = { color: C.white };
  addHeader(pptx, slide, 'Markedskontekst', 'Hvorfor en diversifisert portefølje gir mening nå');

  // 4 market observations
  const observations = [
    { title: 'Renter og inflasjon', text: 'Sentralbankene har justert pengepolitikken og rentetoppen synes nådd. Rentefall gir medvind for obligasjoner og bedrer forutsetningene for aksjer.' },
    { title: 'Globale aksjer', text: 'Aksjemarkedene er høyt priset historisk, men med store variasjoner mellom regioner og sektorer. Diversifisering er viktigere enn noen gang.' },
    { title: 'Nordisk kreditt', text: 'Nordisk høyrente tilbyr attraktive kredittspreader og god underliggende kvalitet. Misligholdsratene er lave, noe som støtter løpende avkastning.' },
    { title: 'Geopolitikk', text: 'Geopolitisk usikkerhet understreker behovet for en robust portefølje som tåler ulike utfall – ikke én bestemt prognose.' },
  ];

  observations.forEach((obs, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const ox = 0.7 + col * 6.2;
    const oy = 1.35 + row * 1.6;
    slide.addShape(pptx.ShapeType.roundRect, {
      x: ox, y: oy, w: 5.9, h: 1.35, rectRadius: 0.06,
      fill: { color: row === 0 ? C.lightBlue : C.warmGray }, line: { color: C.line, pt: 0.5 },
    });
    // Number circle
    slide.addShape(pptx.ShapeType.ellipse, {
      x: ox + 0.12, y: oy + 0.12, w: 0.28, h: 0.28,
      fill: { color: C.navy },
    });
    slide.addText(String(i + 1), {
      x: ox + 0.12, y: oy + 0.12, w: 0.28, h: 0.28,
      fontFace: FONT, fontSize: 10, bold: true, color: C.white, align: 'center', valign: 'mid',
    });
    slide.addText(obs.title, { x: ox + 0.5, y: oy + 0.1, w: 5.2, h: 0.3, fontFace: FONT, fontSize: 10, bold: true, color: C.navy });
    slide.addText(obs.text, { x: ox + 0.15, y: oy + 0.48, w: 5.6, h: 0.75, fontFace: FONT, fontSize: 8.5, color: C.text, lineSpacingMultiple: 1.25 });
  });

  // Implications box
  slide.addText('Implikasjoner for porteføljen', { x: 0.7, y: 4.75, w: 11.9, h: 0.3, fontFace: FONT, fontSize: 11, bold: true, color: C.navy });

  const implications = [
    'Diversifisering mellom aksjer og renter er avgjørende – begge aktivaklasser har attraktive egenskaper i dagens marked.',
    'Aktiv forvaltning kan utnytte prisforskjeller mellom regioner og sektorer bedre enn passiv indeksering alene.',
    'En langsiktig tilnærming beskytter mot kortsiktig volatilitet og utnytter renters-rente-effekten.',
  ];
  implications.forEach((imp, i) => {
    const iy = 5.15 + i * 0.42;
    slide.addText(`→  ${imp}`, {
      x: 0.9, y: iy, w: 11.5, h: 0.38,
      fontFace: FONT, fontSize: 9, color: C.text, valign: 'mid',
    });
  });

  addFooter(pptx, slide, String(pageNum));

  // ══════════════════════════════════════════════════════════════
  // SLIDE 10: FORVALTNING OG MENNESKENE BAK
  // ══════════════════════════════════════════════════════════════
  pageNum++;
  slide = pptx.addSlide();
  slide.background = { color: C.white };
  addHeader(pptx, slide, 'Forvaltning og menneskene bak', 'Hvem som følger opp porteføljen din');

  const team = [
    { name: 'Lars Kirkeby-Garstad', rolle: 'CEO / Porteføljeforvalter', area: 'Overordnet porteføljestyring og kunderelasjoner', bg: 'Bred erfaring fra finans og kapitalforvaltning' },
    { name: 'Lars Erik Moen', rolle: 'CIO / Porteføljeforvalter', area: 'Aksjeforvaltning og fondsseleksjon', bg: 'Tidligere erfaring fra aksjeforvaltning og analyse' },
    { name: 'Petter Bakken', rolle: 'Porteføljeforvalter', area: 'Renteforvaltning og kredittanalyse', bg: 'Spesialisert på rentemarkedene og kredittseleksjon' },
    { name: 'Mads Opsahl', rolle: 'Porteføljeforvalter / analytiker', area: 'Analyse og spesialmandater', bg: 'Erfaring fra investeringsanalyse og kapitalforvaltning' },
  ];

  team.forEach((person, i) => {
    const row = Math.floor(i / 2);
    const col = i % 2;
    const px = 0.7 + col * 6.2;
    const py = 1.4 + row * 2.2;
    // Card
    slide.addShape(pptx.ShapeType.roundRect, {
      x: px, y: py, w: 5.9, h: 1.9, rectRadius: 0.08,
      fill: { color: C.lightBlue }, line: { color: C.line, pt: 0.5 },
    });
    // Initials circle
    const initials = person.name.split(' ').map(n => n[0]).join('').slice(0, 2);
    slide.addShape(pptx.ShapeType.ellipse, {
      x: px + 0.2, y: py + 0.3, w: 0.7, h: 0.7,
      fill: { color: C.navy },
    });
    slide.addText(initials, {
      x: px + 0.2, y: py + 0.3, w: 0.7, h: 0.7,
      fontFace: FONT, fontSize: 16, bold: true, color: C.white, align: 'center', valign: 'mid',
    });
    slide.addText(person.name, { x: px + 1.1, y: py + 0.2, w: 4.6, h: 0.28, fontFace: FONT, fontSize: 12, bold: true, color: C.navy });
    slide.addText(person.rolle, { x: px + 1.1, y: py + 0.5, w: 4.6, h: 0.22, fontFace: FONT, fontSize: 9, color: C.accent, bold: true });
    slide.addText(person.area, { x: px + 1.1, y: py + 0.8, w: 4.6, h: 0.22, fontFace: FONT, fontSize: 8.5, color: C.text });
    slide.addText(person.bg, { x: px + 1.1, y: py + 1.1, w: 4.6, h: 0.22, fontFace: FONT, fontSize: 8.5, color: C.muted, italic: true });
  });

  // Decision process box
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.7, y: 5.9, w: 11.9, h: 0.6, rectRadius: 0.06,
    fill: { color: C.warmGray }, line: { color: C.line, pt: 0.5 },
  });
  slide.addText('Hvordan investeringsbeslutninger tas', {
    x: 0.9, y: 5.92, w: 3.5, h: 0.24, fontFace: FONT, fontSize: 9, bold: true, color: C.navy,
  });
  slide.addText('Alle porteføljebeslutninger fattes i investeringskomitéen. Porteføljene rebalanseres regelmessig, med løpende overvåking av risiko, eksponering og markedsutsikter.', {
    x: 0.9, y: 6.18, w: 11.5, h: 0.28, fontFace: FONT, fontSize: 8, color: C.text,
  });

  addFooter(pptx, slide, String(pageNum));

  // ══════════════════════════════════════════════════════════════
  // SLIDE 11: OPPFØLGING, KOMMUNIKASJON OG RAPPORTERING
  // ══════════════════════════════════════════════════════════════
  pageNum++;
  slide = pptx.addSlide();
  slide.background = { color: C.white };
  addHeader(pptx, slide, 'Oppfølging og rapportering', 'Hvordan du opplever samarbeidet etter at pengene er investert');

  // Main reporting features grid
  const reportingFeatures = [
    { icon: '📊', title: 'Nettoavkastning', desc: 'Se porteføljens utvikling etter alle kostnader – alltid oppdatert og transparent.' },
    { icon: '📋', title: 'Transaksjoner', desc: 'Full oversikt over alle kjøp, salg og rebalanseringer i porteføljen.' },
    { icon: '📈', title: 'Allokering', desc: 'Løpende visning av aktivafordeling og produktvekter relativt til mandat.' },
    { icon: '📅', title: 'Daglig oversikt', desc: 'Tilgang til daglig oppdatert porteføljestatus via sikker innlogging.' },
    { icon: '🔗', title: 'Samlet visning', desc: 'Se alle dine porteføljer og kundeforhold samlet i ett grensesnitt.' },
    { icon: '📑', title: 'Skatterapportering', desc: 'Årlig skatterapport og hendelsesoversikt klart til selvangivelsen.' },
  ];

  reportingFeatures.forEach((feat, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const fx = 0.7 + col * 4.1;
    const fy = 1.35 + row * 1.55;
    slide.addShape(pptx.ShapeType.roundRect, {
      x: fx, y: fy, w: 3.85, h: 1.3, rectRadius: 0.06,
      fill: { color: row === 0 ? C.lightBlue : C.warmGray }, line: { color: C.line, pt: 0.5 },
    });
    slide.addText(feat.title, { x: fx + 0.15, y: fy + 0.1, w: 3.55, h: 0.28, fontFace: FONT, fontSize: 10, bold: true, color: C.navy });
    slide.addText(feat.desc, { x: fx + 0.15, y: fy + 0.45, w: 3.55, h: 0.7, fontFace: FONT, fontSize: 8.5, color: C.text, lineSpacingMultiple: 1.25 });
  });

  // Communication row at bottom
  slide.addText('Løpende kommunikasjon', { x: 0.7, y: 4.6, w: 11.9, h: 0.28, fontFace: FONT, fontSize: 11, bold: true, color: C.navy });

  const commItems = [
    { label: 'Markedsbrev', desc: 'Regelmessige oppdateringer om markeder og porteføljeutvikling' },
    { label: 'Rebalansering', desc: 'Proaktiv oppfølging og justeringer ved behov' },
    { label: 'Årlig gjennomgang', desc: 'Detaljert gjennomgang av portefølje, mål og strategi' },
    { label: 'Pensum TV / Media', desc: 'Videooppdateringer og markedskommentarer' },
  ];
  commItems.forEach((item, i) => {
    const cx = 0.7 + i * 3.1;
    slide.addShape(pptx.ShapeType.roundRect, {
      x: cx, y: 5.0, w: 2.85, h: 1.1, rectRadius: 0.06,
      fill: { color: C.softGreen }, line: { color: C.line, pt: 0.5 },
    });
    slide.addText(item.label, { x: cx + 0.1, y: 5.05, w: 2.65, h: 0.26, fontFace: FONT, fontSize: 9, bold: true, color: C.navy });
    slide.addText(item.desc, { x: cx + 0.1, y: 5.35, w: 2.65, h: 0.65, fontFace: FONT, fontSize: 8, color: C.text, lineSpacingMultiple: 1.2 });
  });

  addFooter(pptx, slide, String(pageNum));

  // ══════════════════════════════════════════════════════════════
  // SLIDE 12: VIKTIG INFORMASJON / NESTE STEG
  // ══════════════════════════════════════════════════════════════
  pageNum++;
  slide = pptx.addSlide();
  slide.background = { color: C.white };
  addHeader(pptx, slide, 'Viktig informasjon og neste steg', '');

  // Important information section
  slide.addText('Viktig informasjon', { x: 0.7, y: 1.3, w: 7, h: 0.3, fontFace: FONT, fontSize: 13, bold: true, color: C.navy });

  const disclaimers = [
    'Denne presentasjonen er en illustrativ investeringsskisse og utgjør ikke personlig investeringsråd eller en individuell egnethetsvurdering.',
    'Historisk avkastning er ingen garanti for fremtidig avkastning. Verdien av investeringer kan gå ned så vel som opp.',
    'Før kundeetablering gjennomføres en fullstendig egnethetsvurdering og KYC-prosess i henhold til gjeldende regelverk.',
    'Alle avkastningstall er oppgitt brutto med mindre annet er spesifisert. Faktisk avkastning kan avvike fra illustrerte scenarier.',
    'Pensum Asset Management AS har konsesjon fra Finanstilsynet til å drive investeringsrådgivning og aktiv porteføljeforvaltning.',
  ];
  disclaimers.forEach((d, i) => {
    const dy = 1.7 + i * 0.45;
    slide.addText(`${i + 1}.`, { x: 0.7, y: dy, w: 0.3, h: 0.4, fontFace: FONT, fontSize: 9, color: C.navy, bold: true, valign: 'top' });
    slide.addText(d, { x: 1.05, y: dy, w: 6.5, h: 0.42, fontFace: FONT, fontSize: 9, color: C.text, lineSpacingMultiple: 1.2, valign: 'top' });
  });

  // "Neste steg" box - right side
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 8.0, y: 1.3, w: 4.6, h: 4.2, rectRadius: 0.1,
    fill: { color: C.lightBlue }, line: { color: C.accent, pt: 1.5 },
  });
  slide.addText('Neste steg', {
    x: 8.2, y: 1.4, w: 4.2, h: 0.35,
    fontFace: FONT, fontSize: 14, bold: true, color: C.navy,
  });
  slide.addShape(pptx.ShapeType.line, { x: 8.2, y: 1.82, w: 4.0, h: 0, line: { color: C.accent, pt: 1 } });

  const steps = [
    { num: '1', title: 'Gjennomgang', desc: 'Vi gjennomgår forslaget og tilpasser til dine ønsker og behov.' },
    { num: '2', title: 'Eventuelle justeringer', desc: 'Allokering, produktvalg og horisont justeres etter samtale.' },
    { num: '3', title: 'Kundeetablering', desc: 'Formell prosess med egnethetsvurdering, KYC og avtaleverk.' },
    { num: '4', title: 'Implementering', desc: 'Porteføljen settes opp og du får tilgang til løpende rapportering.' },
  ];
  steps.forEach((step, i) => {
    const sy = 2.05 + i * 0.8;
    slide.addShape(pptx.ShapeType.ellipse, {
      x: 8.3, y: sy + 0.02, w: 0.32, h: 0.32,
      fill: { color: C.navy },
    });
    slide.addText(step.num, {
      x: 8.3, y: sy + 0.02, w: 0.32, h: 0.32,
      fontFace: FONT, fontSize: 12, bold: true, color: C.white, align: 'center', valign: 'mid',
    });
    slide.addText(step.title, { x: 8.8, y: sy, w: 3.6, h: 0.24, fontFace: FONT, fontSize: 10, bold: true, color: C.navy });
    slide.addText(step.desc, { x: 8.8, y: sy + 0.28, w: 3.6, h: 0.4, fontFace: FONT, fontSize: 8.5, color: C.text, lineSpacingMultiple: 1.2 });
  });

  // Contact info at bottom
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.7, y: 5.9, w: 11.9, h: 0.65, rectRadius: 0.08,
    fill: { color: C.navy },
  });
  slide.addText('Kontakt din rådgiver i Pensum Asset Management for videre oppfølging.', {
    x: 0.9, y: 5.95, w: 11.5, h: 0.25,
    fontFace: FONT, fontSize: 11, bold: true, color: C.white,
  });
  slide.addText('www.pensumgroup.no  |  post@pensumgroup.no  |  +47 22 01 27 00', {
    x: 0.9, y: 6.22, w: 11.5, h: 0.2,
    fontFace: FONT, fontSize: 9, color: C.accent,
  });

  addFooter(pptx, slide, String(pageNum));

  // ─── GENERATE BUFFER ───
  const buffer = await pptx.write({ outputType: 'nodebuffer' });
  return buffer;
}

export default generateProposal10SlidePptx;
