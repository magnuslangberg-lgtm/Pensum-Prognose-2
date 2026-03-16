/**
 * Pensum 20-25 Slide Full Investment Proposal Generator
 *
 * Comprehensive, documented investment proposal with:
 * - Standard Pensum slides (Om oss, Team, Viktig info, etc.)
 * - Deep portfolio analytics from Porteføljebygger
 * - Product sheets per mandate
 * - Historical performance vs benchmarks (1, 3, 5 yr)
 * - Max drawdown charts
 * - Detailed exposure breakdowns
 *
 * NO scenario analysis / prognosis — only Porteføljebygger data.
 *
 * Structure:
 * Part 1: Introduction
 *   1. Forside
 *   2. Viktig informasjon
 *   3. Om oss
 *   4. Kundens mål og utgangspunkt
 *   5. Investeringsmandat
 *
 * Part 2: Portfolio
 *   6. Executive porteføljesnapshot
 *   7. Aktivaallokering & porteføljefordeling
 *   8. Porteføljelogikk (kjerne/stabilisator/satellitt)
 *   9. Historisk utvikling vs referanser
 *  10. Max drawdown og risikobilde
 *  11. Årlig historisk avkastning
 *  12. Regioneksponering
 *  13. Sektoreksponering
 *  14. Hvorfor denne sammensetningen
 *
 * Part 3: Product sheets (dynamic, 1 per product)
 *  15-N. Produktark per mandat
 *
 * Part 4: Closing
 *  N+1. Forvaltningsteamet
 *  N+2. Kommunikasjon og rapportering
 *  N+3. Neste steg / kontakt
 */
import {
  COLORS as C, PRODUCT_COLORS, ALLOC_COLORS, AKTIVA_COLORS, FONT, LAYOUT, TYPE,
  fmt, fmtPct, fmtKr, fmtMnok, cagr, safeColor,
  classifyProductRole, ROLE_GROUPS,
  addHeader, addFooter, addKpiCard, addKpiRow, addDonutChart, addHBarChart,
  addInfoBox, buildTable, addNumberedCard, addStepItem, createPensumPptx,
} from './pptxDesignSystem.js';
import {
  renderOmOssSlide, renderTeamSlide, renderRapporteringSlide, renderNesteStegSlide,
  renderViktigInformasjonSlide, renderHvorforPensumSlide,
} from './standardSlideLibrary.js';
import { defaultProduktEksponering } from '../data/pensumDefaults.js';

// ─── HELPERS (shared with 10-slide) ───
function buildProductList(payload) {
  const { pensumProdukter = [], pensumAllokering = [], produkterIBruk = [] } = payload;
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

function buildHistorikkChartData(payload, months) {
  const { produktHistorikk = {}, pensumAllokering = [], produkterIBruk = [] } = payload;
  const aktiveAllok = (pensumAllokering || []).filter(a => a.vekt > 0 && produkterIBruk.includes(a.id));
  if (aktiveAllok.length === 0) return null;

  const allDates = new Set();
  aktiveAllok.forEach(a => {
    const hist = produktHistorikk[a.id];
    if (hist?.data) hist.data.forEach(d => allDates.add(d.dato));
  });
  if (allDates.size === 0) return null;

  const sortedDates = [...allDates].sort();
  const cutoffIdx = months ? Math.max(0, sortedDates.length - months * 30) : 0;
  const dates = sortedDates.slice(cutoffIdx);

  const productMaps = {};
  aktiveAllok.forEach(a => {
    const hist = produktHistorikk[a.id];
    if (!hist?.data) return;
    const map = {};
    hist.data.forEach(d => { map[d.dato] = d.verdi; });
    productMaps[a.id] = map;
  });

  const portfolioValues = [];
  const labels = [];
  let baseValues = null;

  dates.forEach((dato, di) => {
    if (di > 0 && di < dates.length - 1 && di % 22 !== 0) return;
    let weightedReturn = 0, totalWeight = 0;
    aktiveAllok.forEach(a => {
      const map = productMaps[a.id];
      if (!map) return;
      const val = map[dato];
      if (val == null) return;
      if (!baseValues) baseValues = {};
      if (baseValues[a.id] == null) baseValues[a.id] = val;
      weightedReturn += (val / baseValues[a.id]) * a.vekt;
      totalWeight += a.vekt;
    });
    if (totalWeight > 0) {
      portfolioValues.push((weightedReturn / totalWeight) * 100);
      const d = new Date(dato);
      labels.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    }
  });

  return labels.length > 2 ? { labels, portfolioValues } : null;
}

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

  const fiveYearsDates = sortedDates.slice(Math.max(0, sortedDates.length - 5 * 252));
  const productMaps = {};
  aktiveAllok.forEach(a => {
    const hist = produktHistorikk[a.id];
    if (!hist?.data) return;
    const map = {};
    hist.data.forEach(d => { map[d.dato] = d.verdi; });
    productMaps[a.id] = map;
  });

  // Build full daily portfolio series (no sampling yet)
  const dailySeries = [];
  let baseValues = null;
  fiveYearsDates.forEach((dato) => {
    let weightedReturn = 0, totalWeight = 0;
    aktiveAllok.forEach(a => {
      const map = productMaps[a.id];
      if (!map) return;
      const val = map[dato];
      if (val == null) return;
      if (!baseValues) baseValues = {};
      if (baseValues[a.id] == null) baseValues[a.id] = val;
      weightedReturn += (val / baseValues[a.id]) * a.vekt;
      totalWeight += a.vekt;
    });
    if (totalWeight > 0) {
      dailySeries.push({ dato, value: (weightedReturn / totalWeight) * 100 });
    }
  });

  if (dailySeries.length < 10) return null;

  // Calculate drawdown on full daily data
  let peak = dailySeries[0].value;
  const fullDrawdown = dailySeries.map(pt => {
    if (pt.value > peak) peak = pt.value;
    return { dato: pt.dato, dd: ((pt.value - peak) / peak) * 100 };
  });

  // Sample weekly (~every 5 trading days) - single pass
  const drawdownValues = [];
  const labels = [];
  let maxDD = 0;
  fullDrawdown.forEach((pt, i) => {
    if (i > 0 && i < fullDrawdown.length - 1 && i % 5 !== 0) return;
    drawdownValues.push(pt.dd);
    if (pt.dd < maxDD) maxDD = pt.dd;
    const d = new Date(pt.dato);
    labels.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  });

  return { labels, drawdownValues, maxDrawdown: maxDD };
}

/**
 * Build single-product historikk chart data
 */
function buildProductHistorikkChart(produktHistorikk, productId, months) {
  const hist = produktHistorikk?.[productId];
  if (!hist?.data || hist.data.length < 10) return null;

  const data = hist.data;
  const cutoffIdx = months ? Math.max(0, data.length - months * 30) : 0;
  const sliced = data.slice(cutoffIdx);

  const baseVal = sliced[0]?.verdi || 100;
  const values = [];
  const labels = [];

  sliced.forEach((pt, i) => {
    if (i > 0 && i < sliced.length - 1 && i % 22 !== 0) return;
    values.push((pt.verdi / baseVal) * 100);
    const d = new Date(pt.dato);
    labels.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  });

  const totalReturn = sliced.length > 1 ? ((sliced[sliced.length - 1].verdi / baseVal) - 1) * 100 : 0;
  return labels.length > 2 ? { labels, values, totalReturn } : null;
}


// ─── MAIN GENERATOR ───
export async function generateProposal25SlidePptx(payload) {
  // Diagnostic: verify COLORS are strings (debug Vercel bundling issues)
  if (typeof C.navy !== 'string') {
    throw new Error(`COLORS import broken: C.navy is ${typeof C.navy} (${JSON.stringify(C.navy)}), C type=${typeof C}`);
  }
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
    produktEksponering = {},
    produktHistorikk = {},
  } = payload;

  const pptx = createPensumPptx(kundeNavn);
  const invKapital = investerbarKapital || totalFormue || 0;
  const forventetAvk = pensumForventetAvkastning || vektetAvkastning || 0;
  const { produkterMedVekt, produktMap } = buildProductList(payload);
  const vektetYield = computeWeightedYield(produkterMedVekt);

  const aktivaSplit = Array.isArray(aktivafordeling) ? aktivafordeling : [];
  const aksjeAndel = aktivaSplit.find(a => a.name === 'Aksjer')?.value || 0;
  const renteAndel = aktivaSplit.find(a => a.name === 'Renter')?.value || 0;
  const blandetAndel = aktivaSplit.find(a => a.name === 'Blandet')?.value || 0;
  const aksjeTotal = Math.round(aksjeAndel + blandetAndel * 0.5);
  const renteTotal = Math.round(renteAndel + blandetAndel * 0.5);

  let slide;
  let pageNum = 0;

  // ══════════════════════════════════════════════════════════════════
  // PART 1: INTRODUCTION
  // ══════════════════════════════════════════════════════════════════

  // ── SLIDE 1: FORSIDE ──
  slide = pptx.addSlide();
  slide.background = { color: C.white };
  slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 0.4, h: 7.5, fill: { color: C.navy } });
  slide.addShape(pptx.ShapeType.rect, { x: 0.4, y: 0, w: 0.05, h: 7.5, fill: { color: C.accent } });
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 7.6, y: 0.6, w: 5.3, h: 4.6, rectRadius: 0.1, fill: { color: C.warmGray },
  });

  slide.addText('Investeringsforslag', {
    x: 1.3, y: 1.2, w: 5.8, h: 0.65,
    fontFace: FONT, ...TYPE.heroTitle, color: C.navy,
  });
  slide.addShape(pptx.ShapeType.line, { x: 1.3, y: 2.0, w: 2.5, h: 0, line: { color: C.salmon, pt: 2.5 } });
  slide.addText(`Utarbeidet for ${kundeNavn}`, {
    x: 1.3, y: 2.25, w: 5.8, h: 0.35, fontFace: FONT, fontSize: 15, color: C.text,
  });
  slide.addText('Pensum Asset Management AS', {
    x: 1.3, y: 2.7, w: 5.8, h: 0.24, fontFace: FONT, ...TYPE.bodyLarge, color: C.muted,
  });
  slide.addText(dato || new Date().toLocaleDateString('nb-NO'), {
    x: 1.3, y: 2.98, w: 5.8, h: 0.22, fontFace: FONT, ...TYPE.bodyLarge, color: C.muted,
  });
  if (radgiver) {
    slide.addText(`Rådgiver: ${radgiver}`, {
      x: 1.3, y: 3.24, w: 5.8, h: 0.22, fontFace: FONT, ...TYPE.bodyLarge, color: C.muted,
    });
  }

  const coverKpis = [
    { label: 'Investerbar kapital', value: fmtMnok(invKapital), accentColor: C.navy },
    { label: 'Forventet avkastning', value: fmtPct(forventetAvk), accentColor: C.accent },
    { label: 'Aksjer / Renter', value: `${aksjeTotal}% / ${renteTotal}%`, accentColor: C.salmon },
    { label: 'Horisont', value: `${horisont} år`, accentColor: C.teal },
  ];
  coverKpis.forEach((kpi, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    addKpiCard(pptx, slide, 8.0 + col * 2.35, 1.0 + row * 1.35, 2.15, 1.1, kpi.label, kpi.value, {
      valueFontSize: 16, accentColor: kpi.accentColor, bg: C.white, borderColor: C.line,
    });
  });

  const likvidTekst = (pensumLikviditet?.likvid || 0) > 80 ? 'Høy' : (pensumLikviditet?.likvid || 0) > 50 ? 'Middels' : 'Lav';
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 1.3, y: 5.3, w: 5.8, h: 0.75, rectRadius: 0.08,
    fill: { color: C.lightBlue }, line: { color: C.line, pt: 0.5 },
  });
  slide.addText(`Risikoprofil: ${risikoProfil}  |  Likviditet: ${likvidTekst}  |  Yield: ${fmtPct(vektetYield)}`, {
    x: 1.5, y: 5.4, w: 5.4, h: 0.55,
    fontFace: FONT, ...TYPE.body, bold: true, color: C.navy, valign: 'mid',
  });
  addFooter(pptx, slide);

  // ── SLIDE 2: VIKTIG INFORMASJON ──
  pageNum++;
  renderViktigInformasjonSlide(pptx, pageNum);

  // ── SLIDE 3: OM OSS ──
  pageNum++;
  renderOmOssSlide(pptx, pageNum);

  // ── SLIDE 4: KUNDENS MÅL OG UTGANGSPUNKT ──
  pageNum++;
  slide = pptx.addSlide();
  slide.background = { color: C.white };
  addHeader(pptx, slide, 'Kundens mål og utgangspunkt', 'Formuesstruktur, mål og rammebetingelser');

  const mandatFacts = [
    ['Investerbar kapital', fmtMnok(invKapital)],
    ['Total formue', fmtMnok(totalFormue || invKapital)],
    ['Risikoprofil', risikoProfil],
    ['Horisont', `${horisont} år`],
    ['Forventet avkastning', fmtPct(forventetAvk)],
    ['Likviditetsbehov', (pensumLikviditet?.likvid || 0) > 80 ? 'Lavt' : 'Moderat'],
    ['Målsetting', 'Langsiktig kapitalvekst med disiplinert risikostyring'],
  ];
  mandatFacts.forEach(([label, val], i) => {
    const iy = 1.4 + i * 0.52;
    const accentCol = [C.accent, C.salmon, C.teal, C.navy, C.gold, C.green, C.accent][i % 7];
    slide.addShape(pptx.ShapeType.rect, { x: 0.7, y: iy, w: 0.06, h: 0.35, fill: { color: safeColor(accentCol) } });
    slide.addText(label, {
      x: 1.0, y: iy, w: 2.5, h: 0.35,
      fontFace: FONT, ...TYPE.body, color: C.muted, valign: 'mid',
    });
    slide.addText(String(val), {
      x: 3.5, y: iy, w: 3.0, h: 0.35,
      fontFace: FONT, ...TYPE.bodyLarge, bold: true, color: C.navy, valign: 'mid',
    });
  });

  // Formuesstruktur on right
  const formueItems = [];
  if (kundeinfo.aksjerKunde > 0) formueItems.push({ name: 'Aksjer', value: kundeinfo.aksjerKunde });
  if (kundeinfo.aksjefondKunde > 0) formueItems.push({ name: 'Aksjefond', value: kundeinfo.aksjefondKunde });
  if (kundeinfo.renterKunde > 0) formueItems.push({ name: 'Renter', value: kundeinfo.renterKunde });
  if (kundeinfo.kontanterKunde > 0) formueItems.push({ name: 'Kontanter', value: kundeinfo.kontanterKunde });
  if (kundeinfo.peFondKunde > 0) formueItems.push({ name: 'Private Equity', value: kundeinfo.peFondKunde });
  if (kundeinfo.egenEiendomKunde > 0) formueItems.push({ name: 'Eiendom', value: kundeinfo.egenEiendomKunde });

  if (formueItems.length >= 2) {
    addInfoBox(pptx, slide, 7.2, 1.4, 5.4, 3.5, 'Eksisterende formuesstruktur',
      formueItems.map(i => [i.name, fmtKr(i.value)]));
  }

  addInfoBox(pptx, slide, 7.2, 5.1, 5.4, 1.3, 'Rådgivers vurdering', [
    ['Profil', `${risikoProfil} – tilpasset investor`],
    ['Allokering', `${aksjeTotal}% aksjer, ${renteTotal}% renter`],
    ['Kontantstrøm', `Yield ${fmtPct(vektetYield)} p.a.`],
  ]);

  addFooter(pptx, slide, String(pageNum));

  // ── SLIDE 5: INVESTERINGSMANDAT ──
  pageNum++;
  slide = pptx.addSlide();
  slide.background = { color: C.white };
  addHeader(pptx, slide, 'Investeringsmandat', 'Rammer for forvaltningen og tilpasning til kundens behov');

  addInfoBox(pptx, slide, LAYOUT.marginL, 1.35, 5.5, 4.5, 'Mandatbeskrivelse', [
    ['Forvaltningsmål', 'Langsiktig kapitalvekst'],
    ['Risikoprofil', risikoProfil],
    ['Investeringshorisont', `${horisont} år`],
    ['Forventet avkastning', fmtPct(forventetAvk)],
    ['Forventet yield', fmtPct(vektetYield)],
    ['Aktivaklasser', `${aksjeTotal}% aksjer, ${renteTotal}% renter`],
    ['Likviditet', (pensumLikviditet?.likvid || 0) > 80 ? 'Hovedsakelig likvid' : 'Blanding likvid/illikvid'],
    ['Rebalansering', 'Aktiv, periodisk'],
    ['Rapportering', 'Daglig digital + kvartalsmessig skriftlig'],
    ['Egnethetsvurdering', 'Gjennomføres ved kundeetablering'],
  ]);

  addInfoBox(pptx, slide, 6.5, 1.35, 6.1, 4.5, 'Investeringsretningslinjer', [
    ['Geografisk spredning', 'Global med norsk hjemmemarkedsvekt'],
    ['Sektorspredning', 'Bred – ingen sektorkonsentrasjon'],
    ['Maksimal enkeltvekt', 'Normalt < 35% per produkt'],
    ['Valutasikring', 'Delvis, vurderes løpende'],
    ['Forvaltningstype', 'Aktiv, diversifisert forvalterseleksjon'],
    ['Referanseindeks', 'Sammensatt referanseindeks'],
    ['Beslutningsmyndighet', 'Investeringskomité'],
    ['Minsteinvestering', fmtMnok(invKapital)],
  ]);

  addFooter(pptx, slide, String(pageNum));

  // ══════════════════════════════════════════════════════════════════
  // PART 2: PORTFOLIO ANALYTICS
  // ══════════════════════════════════════════════════════════════════

  // ── SLIDE 6: EXECUTIVE PORTEFØLJESNAPSHOT ──
  pageNum++;
  slide = pptx.addSlide();
  slide.background = { color: C.white };
  addHeader(pptx, slide, 'Porteføljesammensetning', 'Executive oversikt – allokering, nøkkeltall og aktivafordeling');

  addKpiRow(pptx, slide, [
    { label: 'Startkapital', value: fmtMnok(invKapital), accentColor: C.navy },
    { label: 'Forventet avkastning', value: fmtPct(forventetAvk), accentColor: C.accent },
    { label: 'Forventet yield', value: fmtPct(vektetYield), accentColor: C.salmon },
    { label: 'Antall produkter', value: String(produkterMedVekt.length), accentColor: C.teal },
  ], 1.25, { h: 0.8 });

  // Donut
  const donutData = produkterMedVekt.map(p => ({
    name: p.navn || p.id, value: p.vekt, color: safeColor(p.color),
  }));
  if (donutData.length > 0) {
    slide.addText('Porteføljefordeling', {
      x: LAYOUT.marginL, y: 2.25, w: 3, h: 0.22,
      fontFace: FONT, ...TYPE.sectionTitle, color: C.navy,
    });
    addDonutChart(pptx, slide, donutData, LAYOUT.marginL, 2.55, { size: 2.4, legendW: 2.4 });
  }

  // Aktiva donut
  const aktivaDonutData = aktivaSplit.filter(a => a.value > 0).map(a => ({
    name: a.name, value: a.value, color: safeColor(AKTIVA_COLORS[a.name] || C.accent),
  }));
  if (aktivaDonutData.length > 0) {
    slide.addText('Aktivafordeling', {
      x: 5.8, y: 2.25, w: 2.5, h: 0.22,
      fontFace: FONT, ...TYPE.sectionTitle, color: C.navy,
    });
    addDonutChart(pptx, slide, aktivaDonutData, 5.8, 2.55, { size: 1.6, legendW: 1.5 });
  }

  // Product table
  const allokeringRows = produkterMedVekt.map(p => [
    p.navn || p.id, fmtPct(p.vekt), fmtKr((p.vekt / 100) * invKapital),
    p.rolle || p.role || '–',
    fmtPct(p.forventetAvkastning ?? p.expectedReturn), fmtPct(p.forventetYield ?? p.expectedYield),
  ]);
  if (allokeringRows.length > 0) {
    const tData = buildTable(['Produkt', 'Vekt', 'Beløp', 'Rolle', 'Forv. avk.', 'Yield'], allokeringRows,
      { colAlign: [null, 'center', 'right', null, 'center', 'center'] });
    slide.addTable(tData, {
      x: LAYOUT.marginL, y: 5.15, w: LAYOUT.contentW,
      border: { type: 'solid', pt: 0.5, color: C.line },
      rowH: 0.27, valign: 'mid',
      colW: [2.8, 0.6, 1.5, 2.8, 0.8, 0.6],
    });
  }
  addFooter(pptx, slide, String(pageNum));

  // ── SLIDE 7: AKTIVAALLOKERING & PORTEFØLJEFORDELING (detailed) ──
  pageNum++;
  slide = pptx.addSlide();
  slide.background = { color: C.white };
  addHeader(pptx, slide, 'Aktivaallokering', 'Fordeling mellom aktivaklasser og produktdetaljer');

  // Larger aktiva donut on left
  if (aktivaDonutData.length > 0) {
    addDonutChart(pptx, slide, aktivaDonutData, LAYOUT.marginL, 1.4, {
      size: 3.0, legendW: 2.0, holeSize: 50,
    });
  }

  // Detailed product breakdown table on right
  const detailRows = produkterMedVekt.map(p => [
    p.navn || p.id, p.aktivaklasse || p.aktivatype || '–', fmtPct(p.vekt),
    fmtKr((p.vekt / 100) * invKapital), p.likviditet || 'Daglig', p.risikonivaa || '–',
  ]);
  if (detailRows.length > 0) {
    const tData = buildTable(
      ['Produkt', 'Aktivaklasse', 'Vekt', 'Beløp', 'Likviditet', 'Risikonivå'],
      detailRows,
      { colAlign: [null, null, 'center', 'right', null, null] }
    );
    slide.addTable(tData, {
      x: 6.0, y: 1.35, w: 6.6,
      border: { type: 'solid', pt: 0.5, color: C.line },
      rowH: 0.3, valign: 'mid',
      colW: [1.6, 1.0, 0.55, 1.0, 0.7, 0.85],
    });
  }

  // Likviditet badge
  slide.addShape(pptx.ShapeType.roundRect, {
    x: LAYOUT.marginL, y: 5.8, w: 3.5, h: 0.5, rectRadius: 0.08,
    fill: { color: C.lightBlue }, line: { color: C.accent, pt: 1 },
  });
  slide.addText(`Porteføljelikviditet: ${fmtPct(pensumLikviditet?.likvid)} likvid`, {
    x: LAYOUT.marginL, y: 5.8, w: 3.5, h: 0.5,
    fontFace: FONT, ...TYPE.body, color: C.navy, align: 'center', valign: 'mid',
  });

  addFooter(pptx, slide, String(pageNum));

  // ── SLIDE 8: PORTEFØLJELOGIKK ──
  pageNum++;
  slide = pptx.addSlide();
  slide.background = { color: C.white };
  addHeader(pptx, slide, 'Porteføljelogikk', 'Kjerne, stabilisator og satellitter – slik er porteføljen konstruert');

  const productsByRole = { kjerne: [], stabilisator: [], satellitt: [] };
  produkterMedVekt.forEach(p => productsByRole[classifyProductRole(p)].push(p));

  let gy = 1.35;
  ['kjerne', 'stabilisator', 'satellitt'].forEach(roleKey => {
    const items = productsByRole[roleKey];
    if (items.length === 0) return;
    const group = ROLE_GROUPS[roleKey];
    const groupWeight = items.reduce((s, p) => s + (p.vekt || 0), 0);

    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.7, y: gy, w: 11.9, h: 0.38, rectRadius: 0.06, fill: { color: safeColor(group.color) },
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
        fill: { color: safeColor(group.bgColor) }, line: { color: C.line, pt: 0.5 },
      });
      slide.addShape(pptx.ShapeType.ellipse, {
        x: 0.9, y: gy + 0.1, w: 0.22, h: 0.22, fill: { color: safeColor(p.color) },
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
      slide.addText(p.rolle || p.role || p.caseKort || '–', {
        x: 7.1, y: gy, w: 5.3, h: 0.42,
        fontFace: FONT, ...TYPE.bodySmall, color: C.muted, valign: 'mid',
      });
      gy += 0.48;
    });
    gy += 0.15;
  });
  addFooter(pptx, slide, String(pageNum));

  // ── SLIDE 9: HISTORISK UTVIKLING VS REFERANSER ──
  pageNum++;
  slide = pptx.addSlide();
  slide.background = { color: C.white };
  addHeader(pptx, slide, 'Historisk utvikling', 'Porteføljens utvikling – indeksert til 100 ved periodens start');

  const histChartData = buildHistorikkChartData(payload);
  if (histChartData && histChartData.labels.length > 3) {
    slide.addChart(pptx.ChartType.line, [{
      name: 'Din portefølje', labels: histChartData.labels, values: histChartData.portfolioValues,
    }], {
      x: LAYOUT.marginL, y: 1.3, w: LAYOUT.contentW, h: 3.6,
      showLegend: true, legendPos: 'b', legendFontSize: 8, legendFontFace: FONT,
      legendColor: safeColor(C.text),
      showTitle: false, lineDataSymbol: 'none', lineSmooth: false, lineSize: 2.5,
      chartColors: [safeColor(C.navy)],
      catAxisLabelFontFace: FONT, catAxisLabelFontSize: 7, catAxisLabelColor: safeColor(C.muted),
      catAxisLabelRotate: 0,
      catAxisLineShow: true, catAxisLineColor: safeColor(C.line),
      valAxisLabelFontFace: FONT, valAxisLabelFontSize: 7, valAxisLabelColor: safeColor(C.muted),
      valAxisNumFmt: '#,##0.0',
      valAxisLineShow: false,
      valAxisMajorGridColor: safeColor(C.line),
      valAxisMajorGridShow: true,
      plotArea: { fill: { color: safeColor(C.white) } },
    });
  }

  // Historical returns table
  const histYears = ['aar2025', 'aar2024', 'aar2023', 'aar2022'];
  const histLabels = ['2025', '2024', '2023', '2022'];
  const histHeader = ['Produkt', ...histLabels, 'Årl. 3 år', 'Volatilitet'];
  const histRows = produkterMedVekt.slice(0, 10).map(p => {
    const prod = produktMap[p.id] || p;
    return [
      (p.navn || p.id).replace('Pensum ', ''),
      ...histYears.map(y => fmtPct(prod[y])),
      fmtPct(prod.aarlig3ar), fmtPct(prod.risiko3ar),
    ];
  });
  if (historiskPortefolje?.aarligAvkastning) {
    const portRow = ['Porteføljen (vektet)'];
    histYears.forEach(y => portRow.push(fmtPct(historiskPortefolje[y])));
    portRow.push(fmtPct(historiskPortefolje.aarligAvkastning));
    portRow.push(fmtPct(historiskPortefolje.risiko));
    histRows.push(portRow);
  }
  if (histRows.length > 0) {
    const tData = buildTable(histHeader, histRows, {
      colAlign: [null, 'center', 'center', 'center', 'center', 'center', 'center'],
      colBold: { 5: true },
    });
    slide.addTable(tData, {
      x: LAYOUT.marginL, y: 5.1, w: LAYOUT.contentW,
      border: { type: 'solid', pt: 0.5, color: C.line },
      rowH: 0.24, valign: 'mid', colW: [2.5, 1.0, 1.0, 1.0, 1.0, 1.1, 1.1],
    });
  }

  slide.addText('Historisk avkastning er ingen garanti for fremtidig avkastning.', {
    x: LAYOUT.marginL, y: 6.55, w: LAYOUT.contentW, h: 0.15,
    fontFace: FONT, ...TYPE.micro, color: C.muted, italic: true,
  });
  addFooter(pptx, slide, String(pageNum));

  // ── SLIDE 10: MAX DRAWDOWN OG RISIKOBILDE ──
  pageNum++;
  slide = pptx.addSlide();
  slide.background = { color: C.white };
  addHeader(pptx, slide, 'Risikobilde og nedsidebeskyttelse', 'Drawdown-analyse og nøkkelrisikotall – siste 5 år');

  const ddData = buildDrawdownData(payload);
  if (ddData && ddData.labels.length > 5) {
    slide.addChart(pptx.ChartType.area, [{
      name: 'Drawdown', labels: ddData.labels, values: ddData.drawdownValues,
    }], {
      x: LAYOUT.marginL, y: 1.3, w: 8.0, h: 3.0,
      showLegend: false, showTitle: false, lineDataSymbol: 'none', lineSmooth: false, lineSize: 1.5,
      chartColors: ['B91C1C'],
      chartColorsOpacity: 30,
      catAxisLabelFontFace: FONT, catAxisLabelFontSize: 7, catAxisLabelColor: safeColor(C.muted),
      catAxisLabelRotate: 0,
      catAxisLineShow: true, catAxisLineColor: safeColor(C.line),
      valAxisLabelFontFace: FONT, valAxisLabelFontSize: 7, valAxisLabelColor: safeColor(C.muted),
      valAxisNumFmt: '0.0"%"',
      valAxisLineShow: false,
      valAxisMajorGridColor: safeColor(C.line),
      valAxisMajorGridShow: true,
      plotArea: { fill: { color: safeColor(C.white) } },
    });

    slide.addShape(pptx.ShapeType.roundRect, {
      x: LAYOUT.marginL, y: 4.45, w: 3.5, h: 0.45, rectRadius: 0.06,
      fill: { color: C.softRed }, line: { color: C.red, pt: 1 },
    });
    slide.addText(`Portefølje maks drawdown: ${fmtPct(ddData.maxDrawdown)}`, {
      x: LAYOUT.marginL + 0.1, y: 4.45, w: 3.3, h: 0.45,
      fontFace: FONT, ...TYPE.body, bold: true, color: C.red, valign: 'mid',
    });
  }

  // Risk metrics panel
  const riskItems = [];
  if (historiskPortefolje?.aarligAvkastning != null) riskItems.push(['Annualisert avkastning', fmtPct(historiskPortefolje.aarligAvkastning), C.accent]);
  if (historiskPortefolje?.risiko != null) riskItems.push(['Volatilitet (ann.)', fmtPct(historiskPortefolje.risiko), C.salmon]);
  if (historiskPortefolje?.maxDrawdown != null) riskItems.push(['Maks drawdown', fmtPct(historiskPortefolje.maxDrawdown), C.red]);
  if (historiskPortefolje?.besteAar != null) riskItems.push(['Beste år', fmtPct(historiskPortefolje.besteAar), C.green]);
  if (historiskPortefolje?.svaakesteAar != null) riskItems.push(['Svakeste år', fmtPct(historiskPortefolje.svaakesteAar), C.red]);
  if (historiskPortefolje?.aarligAvkastning != null && historiskPortefolje?.risiko > 0) {
    riskItems.push(['Sharpe ratio', fmt(historiskPortefolje.aarligAvkastning / historiskPortefolje.risiko, 2), C.teal]);
  }

  if (riskItems.length > 0) {
    const rx = 9.0, rw = 3.6;
    slide.addShape(pptx.ShapeType.roundRect, {
      x: rx, y: 1.3, w: rw, h: riskItems.length * 0.46 + 0.5,
      rectRadius: 0.08, fill: { color: C.lightBlue }, line: { color: C.line, pt: 0.5 },
    });
    slide.addText('Nøkkelrisikotall', {
      x: rx + 0.15, y: 1.38, w: rw - 0.3, h: 0.26,
      fontFace: FONT, ...TYPE.cardTitle, color: C.navy,
    });
    riskItems.forEach(([label, val, accentCol], i) => {
      const iy = 1.72 + i * 0.44;
      slide.addShape(pptx.ShapeType.rect, { x: rx + 0.15, y: iy + 0.02, w: 0.05, h: 0.28, fill: { color: safeColor(accentCol) } });
      slide.addText(label, { x: rx + 0.32, y: iy, w: rw * 0.55, h: 0.32, fontFace: FONT, ...TYPE.bodySmall, color: C.muted, valign: 'mid' });
      slide.addText(String(val), { x: rx + rw * 0.55, y: iy, w: rw * 0.38, h: 0.32, fontFace: FONT, ...TYPE.body, bold: true, color: C.navy, valign: 'mid', align: 'right' });
    });
  }

  // Interpretation
  slide.addShape(pptx.ShapeType.roundRect, {
    x: LAYOUT.marginL, y: 5.1, w: LAYOUT.contentW, h: 1.3, rectRadius: 0.08,
    fill: { color: C.warmGray }, line: { color: C.line, pt: 0.5 },
  });
  slide.addText('Tolkning av risikobildet', {
    x: 0.9, y: 5.15, w: 11.3, h: 0.24, fontFace: FONT, ...TYPE.cardTitle, color: C.navy,
  });
  [
    'Drawdown viser det dypeste fallet fra topp til bunn – den mest relevante indikatoren på nedsiderisiko.',
    `Porteføljens ${risikoProfil.toLowerCase()} profil er designet for å balansere avkastningspotensial mot akseptabelt svingningsnivå.`,
    'Historiske tall er basert på baktest og faktisk utvikling. Fremtidig utvikling kan avvike vesentlig.',
  ].forEach((text, i) => {
    slide.addText(`•  ${text}`, {
      x: 0.9, y: 5.45 + i * 0.28, w: 11.3, h: 0.26,
      fontFace: FONT, ...TYPE.bodySmall, color: C.text,
    });
  });
  addFooter(pptx, slide, String(pageNum));

  // ── SLIDE 11: ÅRLIG HISTORISK AVKASTNING ──
  pageNum++;
  slide = pptx.addSlide();
  slide.background = { color: C.white };
  addHeader(pptx, slide, 'Årlig historisk avkastning', 'Avkastning per produkt og portefølje – kalenderår');

  // Full table with all years + stats
  const fullHistHeader = ['Produkt', 'Vekt', '2025', '2024', '2023', '2022', 'Årl. 3 år', 'Maks DD', 'Sharpe', 'Yield'];
  const fullHistRows = produkterMedVekt.map(p => {
    const prod = produktMap[p.id] || p;
    const sharpe = prod.risiko3ar > 0 ? fmt((prod.aarlig3ar || 0) / prod.risiko3ar, 2) : '–';
    return [
      (p.navn || p.id).replace('Pensum ', ''),
      fmtPct(p.vekt),
      fmtPct(prod.aar2025), fmtPct(prod.aar2024), fmtPct(prod.aar2023), fmtPct(prod.aar2022),
      fmtPct(prod.aarlig3ar),
      '–', // Max DD per product not in payload
      sharpe,
      fmtPct(prod.forventetYield ?? prod.expectedYield),
    ];
  });

  // Portfolio weighted row
  if (historiskPortefolje?.aarligAvkastning) {
    const portSharpe = historiskPortefolje.risiko > 0 ? fmt(historiskPortefolje.aarligAvkastning / historiskPortefolje.risiko, 2) : '–';
    fullHistRows.push([
      'Vektet portefølje', '100%',
      fmtPct(historiskPortefolje.aar2025), fmtPct(historiskPortefolje.aar2024),
      fmtPct(historiskPortefolje.aar2023), fmtPct(historiskPortefolje.aar2022),
      fmtPct(historiskPortefolje.aarligAvkastning),
      fmtPct(historiskPortefolje.maxDrawdown),
      portSharpe,
      fmtPct(vektetYield),
    ]);
  }

  if (fullHistRows.length > 0) {
    const tData = buildTable(fullHistHeader, fullHistRows, {
      colAlign: [null, 'center', 'center', 'center', 'center', 'center', 'center', 'center', 'center', 'center'],
      colBold: { 6: true },
    });
    slide.addTable(tData, {
      x: LAYOUT.marginL, y: 1.35, w: LAYOUT.contentW,
      border: { type: 'solid', pt: 0.5, color: C.line },
      rowH: 0.32, valign: 'mid',
      colW: [2.2, 0.6, 0.85, 0.85, 0.85, 0.85, 0.85, 0.75, 0.65, 0.6],
    });
  }

  slide.addText('Alle avkastningstall er oppgitt brutto med mindre annet er spesifisert. Historisk avkastning er ingen garanti for fremtidig avkastning.', {
    x: LAYOUT.marginL, y: 6.55, w: LAYOUT.contentW, h: 0.15,
    fontFace: FONT, ...TYPE.micro, color: C.muted, italic: true,
  });
  addFooter(pptx, slide, String(pageNum));

  // ── SLIDE 12: REGIONEKSPONERING ──
  pageNum++;
  slide = pptx.addSlide();
  slide.background = { color: C.white };
  addHeader(pptx, slide, 'Regioneksponering', 'Geografisk fordeling av den samlede porteføljen');

  const regioner = (eksponering?.regioner || []).filter(r => r.vekt > 0).slice(0, 12);
  if (regioner.length > 0) {
    addHBarChart(pptx, slide, regioner.map(r => ({ name: r.navn, value: r.vekt, color: C.accent })),
      LAYOUT.marginL, 1.4, 6.0, { labelW: 1.8 });

    // Also show as donut on right
    const regionDonut = regioner.slice(0, 6).map((r, i) => ({
      name: r.navn, value: r.vekt,
      color: [C.navy, C.accent, C.salmon, C.teal, C.gold, C.green][i % 6],
    }));
    addDonutChart(pptx, slide, regionDonut, 7.5, 1.5, { size: 2.5, legendW: 2.2 });
  }

  // Per-product region breakdown table
  const regionProduktRows = produkterMedVekt.slice(0, 6).map(p => {
    const exp = produktEksponering[p.id] || defaultProduktEksponering[p.id] || {};
    const topRegions = (exp.regioner || []).slice(0, 3).map(r => `${r.navn} ${r.vekt.toFixed(0)}%`).join(', ');
    return [(p.navn || p.id).replace('Pensum ', ''), fmtPct(p.vekt), topRegions || '–'];
  });
  if (regionProduktRows.length > 0) {
    const tData = buildTable(['Produkt', 'Vekt', 'Topp 3 regioner'], regionProduktRows);
    slide.addTable(tData, {
      x: LAYOUT.marginL, y: 5.0, w: LAYOUT.contentW,
      border: { type: 'solid', pt: 0.5, color: C.line },
      rowH: 0.27, valign: 'mid', colW: [2.5, 0.8, 8.6],
    });
  }

  addFooter(pptx, slide, String(pageNum));

  // ── SLIDE 13: SEKTOREKSPONERING ──
  pageNum++;
  slide = pptx.addSlide();
  slide.background = { color: C.white };
  addHeader(pptx, slide, 'Sektoreksponering', 'Sektorfordeling i den samlede porteføljen');

  const sektorer = (eksponering?.sektorer || []).filter(s => s.vekt > 0).slice(0, 12);
  if (sektorer.length > 0) {
    addHBarChart(pptx, slide, sektorer.map(s => ({ name: s.navn, value: s.vekt, color: C.salmon })),
      LAYOUT.marginL, 1.4, 6.0, { labelW: 2.2 });

    const sektorDonut = sektorer.slice(0, 6).map((s, i) => ({
      name: s.navn, value: s.vekt,
      color: [C.salmon, C.navy, C.accent, C.teal, C.gold, C.green][i % 6],
    }));
    addDonutChart(pptx, slide, sektorDonut, 7.5, 1.5, { size: 2.5, legendW: 2.2 });
  }

  // Per-product sector breakdown
  const sektorProduktRows = produkterMedVekt.slice(0, 6).map(p => {
    const exp = produktEksponering[p.id] || defaultProduktEksponering[p.id] || {};
    const topSectors = (exp.sektorer || []).slice(0, 3).map(s => `${s.navn} ${s.vekt.toFixed(0)}%`).join(', ');
    return [(p.navn || p.id).replace('Pensum ', ''), fmtPct(p.vekt), topSectors || '–'];
  });
  if (sektorProduktRows.length > 0) {
    const tData = buildTable(['Produkt', 'Vekt', 'Topp 3 sektorer'], sektorProduktRows);
    slide.addTable(tData, {
      x: LAYOUT.marginL, y: 5.0, w: LAYOUT.contentW,
      border: { type: 'solid', pt: 0.5, color: C.line },
      rowH: 0.27, valign: 'mid', colW: [2.5, 0.8, 8.6],
    });
  }

  addFooter(pptx, slide, String(pageNum));

  // ── SLIDE 14: HVORFOR DENNE SAMMENSETNINGEN ──
  pageNum++;
  slide = pptx.addSlide();
  slide.background = { color: C.white };
  addHeader(pptx, slide, 'Hvorfor denne sammensetningen', 'Investeringslogikk og porteføljekonstruksjon');

  const rationale = [
    { title: 'Diversifisering', text: 'Porteføljen sprer risiko over flere aktivaklasser, regioner og forvaltere – og reduserer avhengigheten av enkelthendelser.', accent: C.accent },
    { title: 'Kontantstrøm', text: 'Rentedelen sikrer løpende yield og bidrar til stabilitet, mens aksjedelen gir langsiktig vekstpotensial.', accent: C.salmon },
    { title: 'Tilpasset profil', text: `Sammensetningen er skreddersydd for ${risikoProfil.toLowerCase()} risikoprofil med ${horisont} års horisont.`, accent: C.teal },
    { title: 'Aktiv forvaltning', text: 'Porteføljen bruker utvalgte aktive forvaltere som kan utnytte prisforskjeller mellom regioner og sektorer.', accent: C.navy },
    { title: 'Risikostyring', text: 'Løpende overvåking av eksponering, mandatetterlevelse og risiko med rebalansering ved avvik.', accent: C.gold },
    { title: 'Tilgjengelighet', text: 'Hovedsakelig likvide produkter med daglig verdifastsettelse og transparent rapportering.', accent: C.green },
  ];

  rationale.forEach((r, i) => {
    const col = i % 3, row = Math.floor(i / 3);
    const bx = LAYOUT.marginL + col * 4.1, by = 1.4 + row * 2.7;

    slide.addShape(pptx.ShapeType.roundRect, {
      x: bx, y: by, w: 3.85, h: 2.4, rectRadius: 0.06,
      fill: { color: C.white }, line: { color: C.line, pt: 0.5 },
      shadow: { type: 'outer', blur: 3, offset: 1, opacity: 0.06, color: '000000' },
    });
    slide.addShape(pptx.ShapeType.rect, {
      x: bx + 0.1, y: by + 0.1, w: 0.05, h: 0.3, fill: { color: r.accent },
    });
    slide.addText(r.title, {
      x: bx + 0.25, y: by + 0.08, w: 3.45, h: 0.32,
      fontFace: FONT, ...TYPE.cardTitle, color: C.navy,
    });
    slide.addText(r.text, {
      x: bx + 0.15, y: by + 0.5, w: 3.55, h: 1.7,
      fontFace: FONT, ...TYPE.bodySmall, color: C.text, lineSpacingMultiple: 1.3, valign: 'top',
    });
  });
  addFooter(pptx, slide, String(pageNum));

  // ══════════════════════════════════════════════════════════════════
  // PART 3: PRODUCT SHEETS (1 slide per product in portfolio)
  // ══════════════════════════════════════════════════════════════════

  for (const prod of produkterMedVekt) {
    pageNum++;
    slide = pptx.addSlide();
    slide.background = { color: C.white };

    const prodName = prod.navn || prod.id;
    const slideTitle = prod.slideTitle || prodName;
    const slideSubtitle = prod.rolle || prod.role || prod.caseKort || 'Rolle i porteføljen';
    addHeader(pptx, slide, slideTitle, slideSubtitle);

    // KPI row
    addKpiRow(pptx, slide, [
      { label: 'Porteføljevekt', value: fmtPct(prod.vekt), accentColor: C.navy },
      { label: 'Beløp', value: fmtKr((prod.vekt / 100) * invKapital), accentColor: C.accent },
      { label: 'Forv. avkastning', value: fmtPct(prod.forventetAvkastning ?? prod.expectedReturn), accentColor: C.salmon },
      { label: 'Forv. yield', value: fmtPct(prod.forventetYield ?? prod.expectedYield), accentColor: C.teal },
    ], 1.25, { h: 0.75 });

    // Get exposure data
    const exp = produktEksponering[prod.id] || defaultProduktEksponering[prod.id] || {};

    // LEFT: Mini historikk chart
    const prodHistChart = buildProductHistorikkChart(produktHistorikk, prod.id);
    if (prodHistChart && prodHistChart.labels.length > 3) {
      slide.addText('Historisk utvikling (indeksert)', {
        x: LAYOUT.marginL, y: 2.15, w: 5, h: 0.2,
        fontFace: FONT, ...TYPE.caption, bold: true, color: C.navy,
      });
      slide.addChart(pptx.ChartType.line, [{
        name: prodName, labels: prodHistChart.labels, values: prodHistChart.values,
      }], {
        x: LAYOUT.marginL, y: 2.4, w: 5.5, h: 2.2,
        showLegend: false, showTitle: false, lineDataSymbol: 'none', lineSmooth: false, lineSize: 2,
        chartColors: [safeColor(prod.color || C.navy)],
        catAxisLabelFontFace: FONT, catAxisLabelFontSize: 6.5, catAxisLabelColor: safeColor(C.muted),
        catAxisLineShow: true, catAxisLineColor: safeColor(C.line),
        valAxisLabelFontFace: FONT, valAxisLabelFontSize: 6.5, valAxisLabelColor: safeColor(C.muted),
        valAxisNumFmt: '#,##0',
        valAxisLineShow: false,
        valAxisMajorGridColor: safeColor(C.line),
        valAxisMajorGridShow: true,
        plotArea: { fill: { color: safeColor(C.white) } },
      });

      // Return badge
      slide.addShape(pptx.ShapeType.roundRect, {
        x: LAYOUT.marginL, y: 4.7, w: 2.5, h: 0.35, rectRadius: 0.04,
        fill: { color: prodHistChart.totalReturn >= 0 ? C.softGreen : C.softRed },
      });
      slide.addText(`Avkastning: ${fmtPct(prodHistChart.totalReturn)}`, {
        x: LAYOUT.marginL + 0.1, y: 4.7, w: 2.3, h: 0.35,
        fontFace: FONT, ...TYPE.bodySmall, bold: true,
        color: prodHistChart.totalReturn >= 0 ? C.green : C.red, valign: 'mid',
      });
    }

    // RIGHT: Product info box
    addInfoBox(pptx, slide, 6.7, 2.15, 5.9, 2.9, 'Nøkkelinformasjon', [
      ['Kategori', prod.kategori || prod.aktivaklasse || '–'],
      ['Aktivaklasse', prod.aktivaklasse || prod.aktivatype || '–'],
      ['Benchmark', prod.benchmark || '–'],
      ['Risikonivå', prod.risikonivaa || '–'],
      ['Likviditet', prod.likviditet || 'Daglig'],
      ['Rolle', prod.rolle || prod.role || '–'],
    ]);

    // Investment case text
    const caseText = prod.caseLang || prod.caseKort || prod.pitch || prod.caseText || '';
    if (caseText) {
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 6.7, y: 5.2, w: 5.9, h: 0.8, rectRadius: 0.06,
        fill: { color: C.warmGray }, line: { color: C.line, pt: 0.5 },
      });
      slide.addText('Investeringscase', {
        x: 6.85, y: 5.22, w: 5.6, h: 0.18,
        fontFace: FONT, ...TYPE.caption, bold: true, color: C.navy,
      });
      slide.addText(caseText, {
        x: 6.85, y: 5.42, w: 5.6, h: 0.5,
        fontFace: FONT, ...TYPE.bodySmall, color: C.text, lineSpacingMultiple: 1.2,
      });
    }

    // BOTTOM: Exposure mini-charts (sectors + regions)
    const prodRegioner = (exp.regioner || []).filter(r => r.vekt > 0).slice(0, 6);
    const prodSektorer = (exp.sektorer || []).filter(s => s.vekt > 0).slice(0, 6);

    if (prodRegioner.length > 0) {
      slide.addText('Regioner', {
        x: LAYOUT.marginL, y: 5.15, w: 2, h: 0.2,
        fontFace: FONT, ...TYPE.caption, bold: true, color: C.navy,
      });
      addHBarChart(pptx, slide, prodRegioner.map(r => ({ name: r.navn, value: r.vekt, color: C.accent })),
        LAYOUT.marginL, 5.4, 2.8, { labelW: 1.2, barH: 0.18 });
    }

    if (prodSektorer.length > 0) {
      slide.addText('Sektorer', {
        x: 3.7, y: 5.15, w: 2, h: 0.2,
        fontFace: FONT, ...TYPE.caption, bold: true, color: C.navy,
      });
      addHBarChart(pptx, slide, prodSektorer.map(s => ({ name: s.navn, value: s.vekt, color: C.salmon })),
        3.7, 5.4, 2.8, { labelW: 1.3, barH: 0.18 });
    }

    // Underlying holdings table (if available)
    const underliggende = (exp.underliggende || []).slice(0, 5);
    if (underliggende.length > 0) {
      const ulRows = underliggende.map(u => [u.navn, fmtPct(u.vekt)]);
      const ulData = buildTable(['Underliggende', 'Andel'], ulRows, { colAlign: [null, 'center'] });
      slide.addTable(ulData, {
        x: LAYOUT.marginL, y: 6.15, w: 5.5,
        border: { type: 'solid', pt: 0.3, color: C.line },
        rowH: 0.2, valign: 'mid', colW: [4.5, 1.0],
      });
    }

    // Disclaimer if available
    if (exp.disclaimer) {
      slide.addText(exp.disclaimer, {
        x: 6.7, y: 6.2, w: 5.9, h: 0.35,
        fontFace: FONT, ...TYPE.micro, color: C.muted, italic: true,
      });
    }

    addFooter(pptx, slide, String(pageNum));
  }

  // ══════════════════════════════════════════════════════════════════
  // PART 4: CLOSING
  // ══════════════════════════════════════════════════════════════════

  // ── FORVALTNINGSTEAMET (standard slide) ──
  pageNum++;
  renderTeamSlide(pptx, pageNum);

  // ── RAPPORTERING (standard slide) ──
  pageNum++;
  renderRapporteringSlide(pptx, pageNum);

  // ── NESTE STEG (standard slide) ──
  pageNum++;
  renderNesteStegSlide(pptx, pageNum);

  // ─── GENERATE BUFFER ───
  const buffer = await pptx.write({ outputType: 'nodebuffer' });
  return buffer;
}

export default generateProposal25SlidePptx;
