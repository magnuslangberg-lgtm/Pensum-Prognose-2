/**
 * Pensum 10-Slide Compact Investment Proposal Generator
 *
 * Premium, authoritative presentation for client meetings.
 * Uses shared design system + standard slide library.
 *
 * Structure (per user spec):
 * 1. Forside / executive snapshot
 * 2. Om oss (standard slide)
 * 3. Investeringsmandat / utgangspunkt
 * 4. Executive porteføljeoversikt (Kunderapport-inspirert)
 * 5. Hvordan porteføljen er bygget
 * 6. Historisk utvikling vs referanser
 * 7. Risikobilde / max drawdown
 * 8. Eksponering (regioner, sektorer)
 * 9. Forvaltning og rapportering (standard/hybrid)
 * 10. Neste steg / viktig informasjon
 *
 * NO scenario analysis / prognosis — only Porteføljebygger data.
 */
import {
  COLORS as C, PRODUCT_COLORS, ALLOC_COLORS, AKTIVA_COLORS, FONT, LAYOUT, TYPE,
  fmt, fmtPct, fmtKr, fmtMnok, cagr,
  classifyProductRole, ROLE_GROUPS,
  addHeader, addFooter, addKpiCard, addKpiRow, addDonutChart, addHBarChart,
  addInfoBox, buildTable, addNumberedCard, addStepItem, createPensumPptx,
} from './pptxDesignSystem.js';
import {
  renderOmOssSlide, renderTeamSlide, renderRapporteringSlide, renderNesteStegSlide,
} from './standardSlideLibrary.js';

// ─── HELPERS ───
function buildProductList(payload) {
  const {
    pensumProdukter = [], pensumAllokering = [], produkterIBruk = [],
  } = payload;
  const alleProdukter = Array.isArray(pensumProdukter)
    ? pensumProdukter
    : [...(pensumProdukter?.enkeltfond || []), ...(pensumProdukter?.fondsportefoljer || []), ...(pensumProdukter?.alternative || [])];
  const produktMap = {};
  alleProdukter.forEach(p => { if (p?.id) produktMap[p.id] = p; });

  const produkterMedVekt = (Array.isArray(pensumAllokering) ? pensumAllokering : [])
    .filter(a => a.vekt > 0 && produkterIBruk.includes(a.id))
    .map((a, i) => {
      const p = produktMap[a.id] || {};
      return { ...p, ...a, color: PRODUCT_COLORS[i % PRODUCT_COLORS.length] };
    })
    .sort((a, b) => (b.vekt || 0) - (a.vekt || 0));

  return { produkterMedVekt, produktMap };
}

function computeWeightedYield(produkterMedVekt) {
  return produkterMedVekt.reduce((s, p) => {
    const y = p.forventetYield ?? p.expectedYield ?? 0;
    return s + y * (p.vekt / 100);
  }, 0);
}

/**
 * Build historikk line chart data from produktHistorikk + vekter.
 * Returns { labels, portfolioValues, benchmarks: { name, values }[] }
 */
function buildHistorikkChartData(payload, months) {
  const { produktHistorikk = {}, pensumAllokering = [], produkterIBruk = [] } = payload;
  const aktiveAllok = (pensumAllokering || []).filter(a => a.vekt > 0 && produkterIBruk.includes(a.id));
  if (aktiveAllok.length === 0) return null;

  // Find common date range
  const allDates = new Set();
  aktiveAllok.forEach(a => {
    const hist = produktHistorikk[a.id];
    if (hist?.data) hist.data.forEach(d => allDates.add(d.dato));
  });
  if (allDates.size === 0) return null;

  const sortedDates = [...allDates].sort();
  const cutoffIdx = months ? Math.max(0, sortedDates.length - months * 30) : 0;
  const dates = sortedDates.slice(cutoffIdx);

  // Build date→value maps per product
  const productMaps = {};
  aktiveAllok.forEach(a => {
    const hist = produktHistorikk[a.id];
    if (!hist?.data) return;
    const map = {};
    hist.data.forEach(d => { map[d.dato] = d.verdi; });
    productMaps[a.id] = map;
  });

  // Compute weighted portfolio index
  const portfolioValues = [];
  const labels = [];
  let baseValues = null;

  dates.forEach((dato, di) => {
    // Only sample monthly (every ~22 trading days) for chart readability
    if (di > 0 && di < dates.length - 1 && di % 22 !== 0) return;

    let weightedReturn = 0;
    let totalWeight = 0;
    aktiveAllok.forEach(a => {
      const map = productMaps[a.id];
      if (!map) return;
      const val = map[dato];
      if (val == null) return;
      if (!baseValues) baseValues = {};
      if (baseValues[a.id] == null) baseValues[a.id] = val;
      const ret = val / baseValues[a.id];
      weightedReturn += ret * a.vekt;
      totalWeight += a.vekt;
    });

    if (totalWeight > 0) {
      portfolioValues.push((weightedReturn / totalWeight) * 100);
      // Format date label
      const d = new Date(dato);
      const lbl = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      labels.push(lbl);
    }
  });

  return labels.length > 2 ? { labels, portfolioValues } : null;
}

/**
 * Build drawdown series from portfolio historikk.
 */
function buildDrawdownData(payload) {
  const { produktHistorikk = {}, pensumAllokering = [], produkterIBruk = [] } = payload;
  const aktiveAllok = (pensumAllokering || []).filter(a => a.vekt > 0 && produkterIBruk.includes(a.id));
  if (aktiveAllok.length === 0) return null;

  const allDates = new Set();
  aktiveAllok.forEach(a => {
    const hist = produktHistorikk[a.id];
    if (hist?.data) hist.data.forEach(d => allDates.add(d.dato));
  });
  const sortedDates = [...allDates].sort();
  if (sortedDates.length < 30) return null;

  // Use last 5 years
  const fiveYearsDates = sortedDates.slice(Math.max(0, sortedDates.length - 5 * 252));

  const productMaps = {};
  aktiveAllok.forEach(a => {
    const hist = produktHistorikk[a.id];
    if (!hist?.data) return;
    const map = {};
    hist.data.forEach(d => { map[d.dato] = d.verdi; });
    productMaps[a.id] = map;
  });

  const portfolioSeries = [];
  let baseValues = null;

  fiveYearsDates.forEach((dato, di) => {
    if (di > 0 && di < fiveYearsDates.length - 1 && di % 5 !== 0) return;

    let weightedReturn = 0;
    let totalWeight = 0;
    aktiveAllok.forEach(a => {
      const map = productMaps[a.id];
      if (!map) return;
      const val = map[dato];
      if (val == null) return;
      if (!baseValues) baseValues = {};
      if (baseValues[a.id] == null) baseValues[a.id] = val;
      const ret = val / baseValues[a.id];
      weightedReturn += ret * a.vekt;
      totalWeight += a.vekt;
    });

    if (totalWeight > 0) {
      portfolioSeries.push({
        dato,
        value: (weightedReturn / totalWeight) * 100,
      });
    }
  });

  if (portfolioSeries.length < 10) return null;

  // Calculate drawdown from running peak
  let peak = portfolioSeries[0].value;
  const drawdownValues = [];
  const labels = [];
  let maxDD = 0;

  portfolioSeries.forEach((pt, i) => {
    // Sample monthly for chart
    if (i > 0 && i < portfolioSeries.length - 1 && i % 4 !== 0) return;

    if (pt.value > peak) peak = pt.value;
    const dd = ((pt.value - peak) / peak) * 100;
    drawdownValues.push(dd);
    if (dd < maxDD) maxDD = dd;

    const d = new Date(pt.dato);
    labels.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  });

  return { labels, drawdownValues, maxDrawdown: maxDD };
}


// ─── MAIN GENERATOR ───
export async function generateProposal10SlidePptx(payload) {
  const {
    kundeNavn = 'Investor',
    risikoProfil = 'Moderat',
    horisont = 5,
    investerbarKapital = 0,
    totalFormue = 0,
    vektetAvkastning = 0,
    pensumForventetAvkastning = 0,
    pensumLikviditet = {},
    aktivafordeling = [],
    historiskPortefolje = {},
    eksponering = {},
    kundeinfo = {},
    radgiver = '',
    dato = '',
  } = payload;

  const pptx = createPensumPptx(kundeNavn);
  const invKapital = investerbarKapital || totalFormue || 0;
  const forventetAvk = pensumForventetAvkastning || vektetAvkastning || 0;
  const { produkterMedVekt, produktMap } = buildProductList(payload);
  const vektetYield = computeWeightedYield(produkterMedVekt);

  // Aktiva split
  const aktivaSplit = Array.isArray(aktivafordeling) ? aktivafordeling : [];
  const aksjeAndel = aktivaSplit.find(a => a.name === 'Aksjer')?.value || 0;
  const renteAndel = aktivaSplit.find(a => a.name === 'Renter')?.value || 0;
  const blandetAndel = aktivaSplit.find(a => a.name === 'Blandet')?.value || 0;
  const aksjeTotal = Math.round(aksjeAndel + blandetAndel * 0.5);
  const renteTotal = Math.round(renteAndel + blandetAndel * 0.5);

  let slide;
  let pageNum = 0;

  // ══════════════════════════════════════════════════════════════
  // SLIDE 1: FORSIDE – PREMIUM EXECUTIVE SNAPSHOT
  // ══════════════════════════════════════════════════════════════
  slide = pptx.addSlide();
  slide.background = { color: C.white };

  // Navy left band + accent line
  slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 0.4, h: 7.5, fill: { color: C.navy } });
  slide.addShape(pptx.ShapeType.rect, { x: 0.4, y: 0, w: 0.05, h: 7.5, fill: { color: C.accent } });

  // Right-side KPI panel background
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 7.6, y: 0.6, w: 5.3, h: 4.6, rectRadius: 0.1,
    fill: { color: C.warmGray },
  });

  // Title block
  slide.addText('Investeringsforslag', {
    x: 1.3, y: 1.2, w: 5.8, h: 0.65,
    fontFace: FONT, ...TYPE.heroTitle, color: C.navy,
  });
  slide.addShape(pptx.ShapeType.line, {
    x: 1.3, y: 2.0, w: 2.5, h: 0,
    line: { color: C.salmon, pt: 2.5 },
  });
  slide.addText(`Utarbeidet for ${kundeNavn}`, {
    x: 1.3, y: 2.25, w: 5.8, h: 0.35,
    fontFace: FONT, fontSize: 15, color: C.text,
  });
  slide.addText('Pensum Asset Management AS', {
    x: 1.3, y: 2.7, w: 5.8, h: 0.24,
    fontFace: FONT, ...TYPE.bodyLarge, color: C.muted,
  });
  slide.addText(dato || new Date().toLocaleDateString('nb-NO'), {
    x: 1.3, y: 2.98, w: 5.8, h: 0.22,
    fontFace: FONT, ...TYPE.bodyLarge, color: C.muted,
  });
  if (radgiver) {
    slide.addText(`Rådgiver: ${radgiver}`, {
      x: 1.3, y: 3.24, w: 5.8, h: 0.22,
      fontFace: FONT, ...TYPE.bodyLarge, color: C.muted,
    });
  }

  // Right-side KPI cards
  const coverKpis = [
    { label: 'Investerbar kapital', value: fmtMnok(invKapital), accentColor: C.navy },
    { label: 'Forventet avkastning', value: fmtPct(forventetAvk), accentColor: C.accent },
    { label: 'Aksjer / Renter', value: `${aksjeTotal}% / ${renteTotal}%`, accentColor: C.salmon },
    { label: 'Horisont', value: `${horisont} år`, accentColor: C.teal },
  ];
  coverKpis.forEach((kpi, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    addKpiCard(pptx, slide, 8.0 + col * 2.35, 1.0 + row * 1.35, 2.15, 1.1, kpi.label, kpi.value, {
      valueFontSize: 16, accentColor: kpi.accentColor, bg: C.white, borderColor: C.line,
    });
  });

  // Bottom hero strip
  const likvidTekst = (pensumLikviditet?.likvid || 0) > 80 ? 'Høy' : (pensumLikviditet?.likvid || 0) > 50 ? 'Middels' : 'Lav';
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 1.3, y: 5.3, w: 5.8, h: 0.75, rectRadius: 0.08,
    fill: { color: C.lightBlue }, line: { color: C.line, pt: 0.5 },
  });
  slide.addText(`Risikoprofil: ${risikoProfil}`, {
    x: 1.5, y: 5.35, w: 2.6, h: 0.3,
    fontFace: FONT, ...TYPE.body, bold: true, color: C.navy, valign: 'mid',
  });
  slide.addText(`Likviditet: ${likvidTekst}`, {
    x: 4.3, y: 5.35, w: 2.6, h: 0.3,
    fontFace: FONT, ...TYPE.body, bold: true, color: C.navy, valign: 'mid',
  });
  slide.addText(`Forventet yield: ${fmtPct(vektetYield)}  |  Antall produkter: ${produkterMedVekt.length}`, {
    x: 1.5, y: 5.7, w: 5.4, h: 0.25,
    fontFace: FONT, ...TYPE.bodySmall, color: C.muted, valign: 'mid',
  });

  addFooter(pptx, slide);

  // ══════════════════════════════════════════════════════════════
  // SLIDE 2: OM OSS (Standard slide)
  // ══════════════════════════════════════════════════════════════
  pageNum++;
  renderOmOssSlide(pptx, pageNum);

  // ══════════════════════════════════════════════════════════════
  // SLIDE 3: INVESTERINGSMANDAT OG UTGANGSPUNKT
  // ══════════════════════════════════════════════════════════════
  pageNum++;
  slide = pptx.addSlide();
  slide.background = { color: C.white };
  addHeader(pptx, slide, 'Utgangspunkt og investeringsmandat', 'Mål, horisont, risikovillighet og rådgivers vurdering');

  const mandatFacts = [
    ['Investerbar kapital', fmtMnok(invKapital)],
    ['Risikoprofil', risikoProfil],
    ['Horisont', `${horisont} år`],
    ['Forventet avkastning', fmtPct(forventetAvk)],
    ['Likviditetsbehov', (pensumLikviditet?.likvid || 0) > 80 ? 'Lavt – hovedsakelig likvide produkter' : 'Moderat – blanding av likvide og illikvide'],
    ['Målsetting', 'Langsiktig kapitalvekst med disiplinert risikostyring'],
  ];
  mandatFacts.forEach(([label, val], i) => {
    const iy = 1.4 + i * 0.58;
    const accentCol = i % 3 === 0 ? C.accent : i % 3 === 1 ? C.salmon : C.teal;
    slide.addShape(pptx.ShapeType.rect, { x: 0.7, y: iy, w: 0.06, h: 0.38, fill: { color: accentCol } });
    slide.addText(label, {
      x: 1.0, y: iy, w: 2.3, h: 0.38,
      fontFace: FONT, ...TYPE.body, color: C.muted, valign: 'mid',
    });
    slide.addText(String(val), {
      x: 3.3, y: iy, w: 3.2, h: 0.38,
      fontFace: FONT, ...TYPE.bodyLarge, bold: true, color: C.navy, valign: 'mid',
    });
  });

  addInfoBox(pptx, slide, 7.2, 1.4, 5.4, 3.2, 'Rådgivers vurdering', [
    ['Profil', `${risikoProfil} – tilpasset investors preferanser`],
    ['Allokering', `${aksjeTotal}% aksjer, ${renteTotal}% renter`],
    ['Horisont', `${horisont} år med årlig rapportering`],
    ['Tilnærming', 'Diversifisert, aktiv forvaltning'],
    ['Kontantstrøm', `Forventet yield ${fmtPct(vektetYield)} p.a.`],
    ['Rebalansering', 'Aktiv oppfølging og periodisk tilpasning'],
  ]);

  // Existing wealth structure (if data exists)
  const formueItems = [];
  if (kundeinfo.aksjerKunde > 0) formueItems.push({ name: 'Aksjer', value: kundeinfo.aksjerKunde });
  if (kundeinfo.aksjefondKunde > 0) formueItems.push({ name: 'Aksjefond', value: kundeinfo.aksjefondKunde });
  if (kundeinfo.renterKunde > 0) formueItems.push({ name: 'Renter', value: kundeinfo.renterKunde });
  if (kundeinfo.kontanterKunde > 0) formueItems.push({ name: 'Kontanter', value: kundeinfo.kontanterKunde });
  if (kundeinfo.peFondKunde > 0) formueItems.push({ name: 'Private Equity', value: kundeinfo.peFondKunde });
  if (kundeinfo.egenEiendomKunde > 0) formueItems.push({ name: 'Eiendom', value: kundeinfo.egenEiendomKunde });

  const harReellFormueData = formueItems.length >= 2 && formueItems.reduce((s, i) => s + i.value, 0) > 0;
  if (harReellFormueData) {
    slide.addText('Eksisterende formuesstruktur', {
      x: 7.2, y: 4.85, w: 5.4, h: 0.25,
      fontFace: FONT, ...TYPE.cardTitle, color: C.navy,
    });
    formueItems.slice(0, 5).forEach((item, i) => {
      const iy = 5.18 + i * 0.27;
      slide.addText(item.name, { x: 7.4, y: iy, w: 2.5, h: 0.22, fontFace: FONT, ...TYPE.bodySmall, color: C.text });
      slide.addText(fmtKr(item.value), { x: 10.0, y: iy, w: 2.4, h: 0.22, fontFace: FONT, ...TYPE.bodySmall, bold: true, color: C.navy, align: 'right' });
    });
  }

  addFooter(pptx, slide, String(pageNum));

  // ══════════════════════════════════════════════════════════════
  // SLIDE 4: EXECUTIVE PORTEFØLJEOVERSIKT
  // Inspired by Kunderapport top section: KPI strip + donut + table
  // ══════════════════════════════════════════════════════════════
  pageNum++;
  slide = pptx.addSlide();
  slide.background = { color: C.white };
  addHeader(pptx, slide, 'Porteføljesammensetning', 'Executive oversikt – allokering, nøkkeltall og aktivafordeling');

  // KPI strip (Kunderapport-inspired)
  const execKpis = [
    { label: 'Startkapital', value: fmtMnok(invKapital), accentColor: C.navy },
    { label: 'Forventet avkastning', value: fmtPct(forventetAvk), accentColor: C.accent },
    { label: 'Forventet yield', value: fmtPct(vektetYield), accentColor: C.salmon },
    { label: 'Antall produkter', value: String(produkterMedVekt.length), accentColor: C.teal },
  ];
  addKpiRow(pptx, slide, execKpis, 1.25, { h: 0.8 });

  // Porteføljefordeling donut (left)
  const donutData = produkterMedVekt.map(p => ({
    name: p.navn || p.id, value: p.vekt, color: p.color,
  }));
  if (donutData.length > 0) {
    slide.addText('Porteføljefordeling', {
      x: LAYOUT.marginL, y: 2.25, w: 3, h: 0.22,
      fontFace: FONT, ...TYPE.sectionTitle, color: C.navy,
    });
    addDonutChart(pptx, slide, donutData, LAYOUT.marginL, 2.55, { size: 2.4, legendW: 2.4 });
  }

  // Aktivafordeling donut (center)
  const aktivaDonutData = aktivaSplit.filter(a => a.value > 0).map(a => ({
    name: a.name, value: a.value, color: (AKTIVA_COLORS[a.name] || C.accent).replace('#', ''),
  }));
  if (aktivaDonutData.length > 0) {
    slide.addText('Aktivafordeling', {
      x: 5.8, y: 2.25, w: 2.5, h: 0.22,
      fontFace: FONT, ...TYPE.sectionTitle, color: C.navy,
    });
    addDonutChart(pptx, slide, aktivaDonutData, 5.8, 2.55, { size: 1.6, legendW: 1.5 });
  }

  // Product table (right side)
  const allokeringRows = produkterMedVekt.map(p => [
    p.navn || p.id,
    fmtPct(p.vekt),
    fmtKr((p.vekt / 100) * invKapital),
    fmtPct(p.forventetAvkastning ?? p.expectedReturn),
    fmtPct(p.forventetYield ?? p.expectedYield),
  ]);
  if (allokeringRows.length > 0) {
    const tableData = buildTable(
      ['Produkt', 'Vekt', 'Beløp', 'Forv. avk.', 'Yield'],
      allokeringRows,
      { colAlign: [null, 'center', 'right', 'center', 'center'] }
    );
    slide.addTable(tableData, {
      x: LAYOUT.marginL, y: 5.2, w: LAYOUT.contentW,
      border: { type: 'solid', pt: 0.5, color: C.line },
      rowH: 0.28, valign: 'mid',
      colW: [3.8, 0.7, 1.8, 0.9, 0.7],
      autoPageRepeatHeader: true,
    });
  }

  addFooter(pptx, slide, String(pageNum));

  // ══════════════════════════════════════════════════════════════
  // SLIDE 5: HVORDAN PORTEFØLJEN ER BYGGET
  // ══════════════════════════════════════════════════════════════
  pageNum++;
  slide = pptx.addSlide();
  slide.background = { color: C.white };
  addHeader(pptx, slide, 'Hvordan porteføljen er bygget', 'Kjerne, stabilisator og satellitter');

  const productsByRole = { kjerne: [], stabilisator: [], satellitt: [] };
  produkterMedVekt.forEach(p => {
    const role = classifyProductRole(p);
    productsByRole[role].push(p);
  });

  let gy = 1.35;
  ['kjerne', 'stabilisator', 'satellitt'].forEach(roleKey => {
    const items = productsByRole[roleKey];
    if (items.length === 0) return;
    const group = ROLE_GROUPS[roleKey];
    const groupWeight = items.reduce((s, p) => s + (p.vekt || 0), 0);

    // Group header
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.7, y: gy, w: 11.9, h: 0.38, rectRadius: 0.06,
      fill: { color: group.color },
    });
    slide.addText(`${group.label}  ·  ${group.desc}`, {
      x: 0.9, y: gy, w: 8.5, h: 0.38,
      fontFace: FONT, ...TYPE.cardTitle, color: C.white, valign: 'mid',
    });
    slide.addText(fmtPct(groupWeight), {
      x: 10.0, y: gy, w: 2.4, h: 0.38,
      fontFace: FONT, ...TYPE.cardTitle, color: C.white, valign: 'mid', align: 'right',
    });
    gy += 0.45;

    items.forEach(p => {
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 0.7, y: gy, w: 11.9, h: 0.42, rectRadius: 0.04,
        fill: { color: group.bgColor }, line: { color: C.line, pt: 0.5 },
      });
      slide.addShape(pptx.ShapeType.ellipse, {
        x: 0.9, y: gy + 0.1, w: 0.22, h: 0.22,
        fill: { color: p.color },
      });
      slide.addText(p.navn || p.id, {
        x: 1.25, y: gy, w: 3.2, h: 0.42,
        fontFace: FONT, ...TYPE.body, bold: true, color: C.navy, valign: 'mid',
      });
      slide.addText(fmtPct(p.vekt), {
        x: 4.5, y: gy, w: 0.8, h: 0.42,
        fontFace: FONT, ...TYPE.body, bold: true, color: C.navy, valign: 'mid', align: 'center',
      });
      slide.addText(fmtKr((p.vekt / 100) * invKapital), {
        x: 5.35, y: gy, w: 1.5, h: 0.42,
        fontFace: FONT, ...TYPE.body, color: C.text, valign: 'mid', align: 'right',
      });
      const desc = p.rolle || p.role || p.caseKort || p.pitch || '–';
      slide.addText(desc, {
        x: 7.1, y: gy, w: 5.3, h: 0.42,
        fontFace: FONT, ...TYPE.bodySmall, color: C.muted, valign: 'mid',
      });
      gy += 0.48;
    });
    gy += 0.15;
  });

  addFooter(pptx, slide, String(pageNum));

  // ══════════════════════════════════════════════════════════════
  // SLIDE 6: HISTORISK UTVIKLING VS REFERANSER
  // Key slide – uses actual historikk data from Porteføljebygger
  // ══════════════════════════════════════════════════════════════
  pageNum++;
  slide = pptx.addSlide();
  slide.background = { color: C.white };
  addHeader(pptx, slide, 'Historisk utvikling', 'Porteføljens utvikling sammenlignet med relevante referanser');

  // Build chart data from historikk
  const histChartData = buildHistorikkChartData(payload);

  if (histChartData && histChartData.labels.length > 3) {
    // Portfolio line chart
    slide.addChart(pptx.ChartType.line, [{
      name: 'Din portefølje',
      labels: histChartData.labels,
      values: histChartData.portfolioValues,
    }], {
      x: LAYOUT.marginL, y: 1.3, w: 11.9, h: 3.3,
      showLegend: true, legendPos: 'b', legendFontSize: 8, legendFontFace: FONT,
      showTitle: false,
      lineDataSymbol: 'none',
      lineSmooth: true,
      lineSize: 2.5,
      chartColors: [C.navy],
      catAxisLabelFontFace: FONT, catAxisLabelFontSize: 7, catAxisLabelColor: C.muted,
      valAxisLabelFontFace: FONT, valAxisLabelFontSize: 7, valAxisLabelColor: C.muted,
      valAxisNumFmt: '#,##0.0',
      plotArea: { fill: { color: C.white } },
    });
  }

  // Historical returns table
  const histYears = ['aar2025', 'aar2024', 'aar2023', 'aar2022'];
  const histLabels = ['2025', '2024', '2023', '2022'];
  const histHeader = ['Produkt', ...histLabels, 'Årl. 3 år', 'Sharpe'];
  const histRows = produkterMedVekt.slice(0, 8).map(p => {
    const prod = produktMap[p.id] || p;
    return [
      (p.navn || p.id).replace('Pensum ', ''),
      ...histYears.map(y => fmtPct(prod[y])),
      fmtPct(prod.aarlig3ar),
      prod.risiko3ar ? fmt(prod.aarlig3ar / prod.risiko3ar, 2) : '–',
    ];
  });

  // Portfolio row
  if (historiskPortefolje?.aarligAvkastning) {
    const portRow = ['Porteføljen (vektet)'];
    histYears.forEach(y => portRow.push(fmtPct(historiskPortefolje[y])));
    portRow.push(fmtPct(historiskPortefolje.aarligAvkastning));
    portRow.push(historiskPortefolje.risiko ? fmt(historiskPortefolje.aarligAvkastning / historiskPortefolje.risiko, 2) : '–');
    histRows.push(portRow);
  }

  if (histRows.length > 0) {
    const tData = buildTable(histHeader, histRows, {
      colAlign: [null, 'center', 'center', 'center', 'center', 'center', 'center'],
      colBold: { 5: true },
    });
    slide.addTable(tData, {
      x: LAYOUT.marginL, y: 4.85, w: LAYOUT.contentW,
      border: { type: 'solid', pt: 0.5, color: C.line },
      rowH: 0.26, valign: 'mid',
      colW: [2.8, 1.1, 1.1, 1.1, 1.1, 1.1, 1.1],
      autoPageRepeatHeader: true,
    });
  }

  // Disclaimer
  slide.addText('Viktig: Historisk avkastning er ingen garanti for fremtidig avkastning. Alle grafer er indeksert til 100 ved periodens start.', {
    x: LAYOUT.marginL, y: 6.55, w: LAYOUT.contentW, h: 0.16,
    fontFace: FONT, ...TYPE.micro, color: C.muted, italic: true,
  });

  addFooter(pptx, slide, String(pageNum));

  // ══════════════════════════════════════════════════════════════
  // SLIDE 7: RISIKOBILDE / MAX DRAWDOWN
  // ══════════════════════════════════════════════════════════════
  pageNum++;
  slide = pptx.addSlide();
  slide.background = { color: C.white };
  addHeader(pptx, slide, 'Risikobilde og nedsidebeskyttelse', 'Max drawdown, volatilitet og nøkkelrisikotall');

  // Drawdown chart
  const ddData = buildDrawdownData(payload);
  if (ddData && ddData.labels.length > 5) {
    slide.addChart(pptx.ChartType.area, [{
      name: 'Drawdown',
      labels: ddData.labels,
      values: ddData.drawdownValues,
    }], {
      x: LAYOUT.marginL, y: 1.3, w: 8.0, h: 3.0,
      showLegend: false, showTitle: false,
      lineDataSymbol: 'none',
      lineSmooth: true,
      lineSize: 1.5,
      chartColors: ['B91C1C'],
      catAxisLabelFontFace: FONT, catAxisLabelFontSize: 7, catAxisLabelColor: C.muted,
      valAxisLabelFontFace: FONT, valAxisLabelFontSize: 7, valAxisLabelColor: C.muted,
      valAxisNumFmt: '0.0"%"',
      plotArea: { fill: { color: C.white } },
      fill: { type: 'solid', color: 'FDF2F2' },
    });

    // Max drawdown callout
    slide.addShape(pptx.ShapeType.roundRect, {
      x: LAYOUT.marginL, y: 4.45, w: 3.5, h: 0.45, rectRadius: 0.06,
      fill: { color: C.softRed }, line: { color: C.red, pt: 1 },
    });
    slide.addText(`Portefølje maks: ${fmtPct(ddData.maxDrawdown)}`, {
      x: LAYOUT.marginL + 0.1, y: 4.45, w: 3.3, h: 0.45,
      fontFace: FONT, ...TYPE.body, bold: true, color: C.red, valign: 'mid',
    });
  }

  // Risk metrics panel (right)
  const riskMetricX = 9.0;
  const riskMetricW = 3.6;
  const riskItems = [];
  if (historiskPortefolje?.aarligAvkastning != null) riskItems.push(['Annualisert avkastning', fmtPct(historiskPortefolje.aarligAvkastning), C.accent]);
  if (historiskPortefolje?.risiko != null) riskItems.push(['Volatilitet (ann.)', fmtPct(historiskPortefolje.risiko), C.salmon]);
  if (historiskPortefolje?.maxDrawdown != null) riskItems.push(['Maks drawdown', fmtPct(historiskPortefolje.maxDrawdown), C.red]);
  if (historiskPortefolje?.besteAar != null) riskItems.push(['Beste år', fmtPct(historiskPortefolje.besteAar), C.green]);
  if (historiskPortefolje?.svaakesteAar != null) riskItems.push(['Svakeste år', fmtPct(historiskPortefolje.svaakesteAar), C.red]);

  // Compute Sharpe if possible
  if (historiskPortefolje?.aarligAvkastning != null && historiskPortefolje?.risiko > 0) {
    const sharpe = historiskPortefolje.aarligAvkastning / historiskPortefolje.risiko;
    riskItems.push(['Sharpe ratio', fmt(sharpe, 2), C.teal]);
  }

  if (riskItems.length > 0) {
    slide.addShape(pptx.ShapeType.roundRect, {
      x: riskMetricX, y: 1.3, w: riskMetricW, h: riskItems.length * 0.48 + 0.5,
      rectRadius: 0.08, fill: { color: C.lightBlue }, line: { color: C.line, pt: 0.5 },
    });
    slide.addText('Nøkkelrisikotall', {
      x: riskMetricX + 0.15, y: 1.38, w: riskMetricW - 0.3, h: 0.26,
      fontFace: FONT, ...TYPE.cardTitle, color: C.navy,
    });
    riskItems.forEach(([label, val, accentCol], i) => {
      const iy = 1.72 + i * 0.45;
      slide.addShape(pptx.ShapeType.rect, {
        x: riskMetricX + 0.15, y: iy + 0.02, w: 0.05, h: 0.28,
        fill: { color: accentCol },
      });
      slide.addText(label, {
        x: riskMetricX + 0.32, y: iy, w: riskMetricW * 0.55, h: 0.32,
        fontFace: FONT, ...TYPE.bodySmall, color: C.muted, valign: 'mid',
      });
      slide.addText(String(val), {
        x: riskMetricX + riskMetricW * 0.55, y: iy, w: riskMetricW * 0.38, h: 0.32,
        fontFace: FONT, ...TYPE.body, bold: true, color: C.navy, valign: 'mid', align: 'right',
      });
    });
  }

  // Interpretation box
  slide.addShape(pptx.ShapeType.roundRect, {
    x: LAYOUT.marginL, y: 5.1, w: LAYOUT.contentW, h: 1.3, rectRadius: 0.08,
    fill: { color: C.warmGray }, line: { color: C.line, pt: 0.5 },
  });
  slide.addText('Tolkning av risikobildet', {
    x: 0.9, y: 5.15, w: 11.3, h: 0.24,
    fontFace: FONT, ...TYPE.cardTitle, color: C.navy,
  });
  const riskInterpretation = [
    'Drawdown-grafen viser det dypeste fallet fra topp til bunn over tid — den viktigste indikatoren på nedsiderisiko.',
    `Porteføljens ${risikoProfil.toLowerCase()} profil er designet for å balansere avkastningspotensial mot akseptabelt svingningsnivå.`,
    'Historiske tall er basert på baktest og faktisk utvikling. Fremtidig utvikling kan avvike.',
  ];
  riskInterpretation.forEach((text, i) => {
    slide.addText(`•  ${text}`, {
      x: 0.9, y: 5.45 + i * 0.28, w: 11.3, h: 0.26,
      fontFace: FONT, ...TYPE.bodySmall, color: C.text,
    });
  });

  addFooter(pptx, slide, String(pageNum));

  // ══════════════════════════════════════════════════════════════
  // SLIDE 8: EKSPONERING
  // ══════════════════════════════════════════════════════════════
  pageNum++;
  slide = pptx.addSlide();
  slide.background = { color: C.white };
  addHeader(pptx, slide, 'Porteføljeeksponering', 'Regioner, sektorer og porteføljelogikk');

  // Region bar chart - left
  const regioner = (eksponering?.regioner || []).filter(r => r.vekt > 0).slice(0, 8);
  if (regioner.length > 0) {
    slide.addText('Regioneksponering', {
      x: LAYOUT.marginL, y: 1.3, w: 5, h: 0.25,
      fontFace: FONT, ...TYPE.sectionTitle, color: C.navy,
    });
    addHBarChart(pptx, slide, regioner.map(r => ({ name: r.navn, value: r.vekt, color: C.accent })), LAYOUT.marginL, 1.65, 5.5, { labelW: 1.6 });
  }

  // Sector bar chart - right
  const sektorer = (eksponering?.sektorer || []).filter(s => s.vekt > 0).slice(0, 8);
  if (sektorer.length > 0) {
    slide.addText('Sektoreksponering', {
      x: 6.8, y: 1.3, w: 5, h: 0.25,
      fontFace: FONT, ...TYPE.sectionTitle, color: C.navy,
    });
    addHBarChart(pptx, slide, sektorer.map(s => ({ name: s.navn, value: s.vekt, color: C.salmon })), 6.8, 1.65, 5.8, { labelW: 2.0 });
  }

  // Investment rationale
  slide.addText('Tre hovedgrunner til denne sammensetningen', {
    x: LAYOUT.marginL, y: 4.5, w: LAYOUT.contentW, h: 0.3,
    fontFace: FONT, ...TYPE.sectionTitle, color: C.navy,
  });

  const reasons = [
    { title: 'Diversifisering', text: 'Porteføljen sprer risiko over flere aktivaklasser, regioner og forvaltere – og reduserer avhengigheten av enkelthendelser.' },
    { title: 'Kontantstrøm', text: 'Rentedelen sikrer løpende yield og bidrar til stabilitet, mens aksjedelen gir langsiktig vekst.' },
    { title: 'Tilpasset profil', text: `Sammensetningen er skreddersydd for ${risikoProfil.toLowerCase()} risikoprofil med ${horisont} års horisont.` },
  ];
  reasons.forEach((r, i) => {
    addNumberedCard(pptx, slide, LAYOUT.marginL + i * 4.1, 4.9, 3.85, 1.5, i + 1, r.title, r.text);
  });

  addFooter(pptx, slide, String(pageNum));

  // ══════════════════════════════════════════════════════════════
  // SLIDE 9: FORVALTNING OG RAPPORTERING (hybrid: team + rapportering)
  // ══════════════════════════════════════════════════════════════
  pageNum++;
  slide = pptx.addSlide();
  slide.background = { color: C.white };
  addHeader(pptx, slide, 'Forvaltning og rapportering', 'Team, investeringsprosess og løpende oppfølging');

  // Compact team section (top half)
  const team = [
    { name: 'Lars Kirkeby-Garstad', rolle: 'CEO / Porteføljeforvalter' },
    { name: 'Lars Erik Moen', rolle: 'CIO / Porteføljeforvalter' },
    { name: 'Petter Bakken', rolle: 'Porteføljeforvalter' },
    { name: 'Mads Opsahl', rolle: 'Porteføljeforvalter / analytiker' },
  ];
  team.forEach((person, i) => {
    const cx = LAYOUT.marginL + i * 3.1;
    slide.addShape(pptx.ShapeType.roundRect, {
      x: cx, y: 1.35, w: 2.85, h: 1.2, rectRadius: 0.06,
      fill: { color: C.lightBlue }, line: { color: C.line, pt: 0.5 },
    });
    const initials = person.name.split(' ').map(n => n[0]).join('').slice(0, 2);
    slide.addShape(pptx.ShapeType.ellipse, {
      x: cx + 0.15, y: 1.5, w: 0.5, h: 0.5,
      fill: { color: C.navy },
    });
    slide.addText(initials, {
      x: cx + 0.15, y: 1.5, w: 0.5, h: 0.5,
      fontFace: FONT, fontSize: 12, bold: true, color: C.white, align: 'center', valign: 'mid',
    });
    slide.addText(person.name, {
      x: cx + 0.75, y: 1.45, w: 1.95, h: 0.22,
      fontFace: FONT, ...TYPE.bodySmall, bold: true, color: C.navy,
    });
    slide.addText(person.rolle, {
      x: cx + 0.75, y: 1.7, w: 1.95, h: 0.35,
      fontFace: FONT, ...TYPE.caption, color: C.accent,
    });
  });

  // Decision process strip
  slide.addShape(pptx.ShapeType.roundRect, {
    x: LAYOUT.marginL, y: 2.7, w: LAYOUT.contentW, h: 0.4, rectRadius: 0.04,
    fill: { color: C.navy },
  });
  slide.addText('Investeringskomité → Aktiv rebalansering → Løpende risikoovervåking → Periodisk rapportering', {
    x: 0.9, y: 2.7, w: 11.3, h: 0.4,
    fontFace: FONT, ...TYPE.bodySmall, bold: true, color: C.white, valign: 'mid', align: 'center',
  });

  // Reporting features (bottom half) – compact 2×3 grid
  const miniFeatures = [
    { title: 'BankID-tilgang', desc: 'Se porteføljens utvikling i sanntid, netto etter kostnader.', accent: C.accent },
    { title: 'Transaksjoner', desc: 'Full oversikt over alle bevegelser, kjøp, salg og rebalanseringer.', accent: C.salmon },
    { title: 'Allokering', desc: 'Mandatetterlevelse med avviksovervåking og oppfølging.', accent: C.teal },
    { title: 'Skatterapport', desc: 'Årlig rapport med gevinst, tap, utbytte og relevante beløp.', accent: C.gold },
    { title: 'Kvartalsrapport', desc: 'Skriftlig oppsummering av utvikling, endringer og utsikter.', accent: C.navy },
    { title: 'Strategimøte', desc: 'Årlig gjennomgang av portefølje, mål og eventuelle tilpasninger.', accent: C.green },
  ];
  miniFeatures.forEach((feat, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const fx = LAYOUT.marginL + col * 4.1;
    const fy = 3.3 + row * 1.55;

    slide.addShape(pptx.ShapeType.roundRect, {
      x: fx, y: fy, w: 3.85, h: 1.3, rectRadius: 0.06,
      fill: { color: C.white }, line: { color: C.line, pt: 0.5 },
    });
    slide.addShape(pptx.ShapeType.rect, {
      x: fx + 0.08, y: fy + 0.1, w: 0.05, h: 0.22,
      fill: { color: feat.accent },
    });
    slide.addText(feat.title, {
      x: fx + 0.22, y: fy + 0.08, w: 3.48, h: 0.25,
      fontFace: FONT, ...TYPE.cardTitle, color: C.navy,
    });
    slide.addText(feat.desc, {
      x: fx + 0.15, y: fy + 0.4, w: 3.55, h: 0.75,
      fontFace: FONT, ...TYPE.bodySmall, color: C.text, lineSpacingMultiple: 1.2,
    });
  });

  addFooter(pptx, slide, String(pageNum));

  // ══════════════════════════════════════════════════════════════
  // SLIDE 10: NESTE STEG (Standard slide)
  // ══════════════════════════════════════════════════════════════
  pageNum++;
  renderNesteStegSlide(pptx, pageNum);

  // ─── GENERATE BUFFER ───
  const buffer = await pptx.write({ outputType: 'nodebuffer' });
  return buffer;
}

export default generateProposal10SlidePptx;
