import PptxGenJSImport from 'pptxgenjs';

const PptxGenJS = typeof PptxGenJSImport === 'function'
  ? PptxGenJSImport
  : (PptxGenJSImport?.default || PptxGenJSImport?.PptxGenJS);

const COLORS = {
  navy: '0D2240',
  blue: '4C84C4',
  blueLight: 'EAF2FB',
  salmon: 'D4886B',
  green: '1F7A5C',
  gold: 'B8860B',
  bg: 'F5F7FA',
  line: 'D9E2EC',
  text: '1F2937',
  muted: '6B7280',
  white: 'FFFFFF'
};

function num(v, fb = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fb;
}

function fmtPct(v, digits = 1) {
  return Number.isFinite(Number(v)) ? `${Number(v).toFixed(digits)}%` : '—';
}

function fmtNok(v) {
  return new Intl.NumberFormat('nb-NO', { style: 'currency', currency: 'NOK', maximumFractionDigits: 0 }).format(num(v));
}

function safeArray(arr) {
  return Array.isArray(arr) ? arr : [];
}

function topRows(rows, count = 8) {
  return safeArray(rows)
    .map((r) => ({ navn: r?.navn || 'Ukjent', vekt: num(r?.vekt) }))
    .filter((r) => r.vekt > 0)
    .sort((a, b) => b.vekt - a.vekt)
    .slice(0, count);
}

function addFrame(pptx, slide, title, subtitle = '') {
  slide.background = { color: COLORS.bg };
  slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.33, h: 0.6, fill: { color: COLORS.white }, line: { color: COLORS.white, pt: 0 } });
  slide.addText('PENSUM ASSET MANAGEMENT', { x: 0.7, y: 0.16, w: 4.4, h: 0.18, fontSize: 10, bold: true, color: COLORS.navy });
  slide.addText(title, { x: 0.7, y: 0.86, w: 10.4, h: 0.42, fontSize: 22, bold: true, color: COLORS.navy });
  if (subtitle) slide.addText(subtitle, { x: 0.7, y: 1.28, w: 10.4, h: 0.22, fontSize: 10.5, color: COLORS.muted });
  slide.addShape(pptx.ShapeType.line, { x: 0.7, y: 7.1, w: 11.95, h: 0, line: { color: COLORS.line, pt: 1 } });
}

function addKpiCard(pptx, slide, x, y, w, h, label, value, accent = COLORS.blue) {
  slide.addShape(pptx.ShapeType.roundRect, { x, y, w, h, rectRadius: 0.08, fill: { color: COLORS.white }, line: { color: COLORS.line, pt: 1 } });
  slide.addShape(pptx.ShapeType.rect, { x: x + 0.02, y: y + 0.02, w: 0.08, h: h - 0.04, fill: { color: accent }, line: { color: accent, pt: 0 } });
  slide.addText(label, { x: x + 0.18, y: y + 0.14, w: w - 0.28, h: 0.18, fontSize: 9.2, color: COLORS.muted });
  slide.addText(String(value || '—'), { x: x + 0.18, y: y + 0.38, w: w - 0.28, h: 0.32, fontSize: 17, bold: true, color: COLORS.navy, fit: 'shrink' });
}

function addBulletList(slide, bullets, x, y, w, h, fontSize = 12) {
  const runs = [];
  safeArray(bullets).forEach((item, idx) => {
    if (!item) return;
    runs.push({ text: item, options: { bullet: { indent: 12 } } });
    if (idx < bullets.length - 1) runs.push({ text: '\n' });
  });
  slide.addText(runs, { x, y, w, h, fontSize, color: COLORS.text, breakLine: false, paraSpaceAfterPt: 9, valign: 'top' });
}

function addSimpleTable(slide, rows, x, y, w, colWidths) {
  if (!rows || rows.length < 2) return;
  slide.addTable(rows, {
    x, y, w,
    colW: colWidths,
    border: { type: 'solid', pt: 1, color: COLORS.line },
    fill: COLORS.white,
    color: COLORS.text,
    fontSize: 10,
    margin: 0.06,
    rowH: 0.28,
    bold: false,
    autoFit: false,
    valign: 'mid',
    fillHeader: COLORS.blueLight,
    boldHeader: true,
    colorHeader: COLORS.navy
  });
}

function addBarChart(pptx, slide, title, rows, x, y, w, h, color = COLORS.blue) {
  const prepared = topRows(rows, 6);
  if (prepared.length === 0) return;
  slide.addText(title, { x, y: y - 0.18, w, h: 0.18, fontSize: 11, bold: true, color: COLORS.navy });
  slide.addChart(pptx.ChartType.bar, [{
    name: title,
    labels: prepared.map((r) => r.navn),
    values: prepared.map((r) => r.vekt)
  }], {
    x, y, w, h,
    catAxisLabelFontSize: 9,
    valAxisLabelFontSize: 9,
    valAxisMinVal: 0,
    valAxisMaxVal: Math.max(25, Math.ceil(Math.max(...prepared.map((r) => r.vekt)) / 5) * 5),
    showTitle: false,
    showLegend: false,
    showValue: true,
    dataLabelPosition: 'outEnd',
    chartColors: [color],
    showCatName: false,
    showValAxisTitle: false,
    showCatAxisTitle: false,
    gridLine: { color: 'E5E7EB', pt: 1 }
  });
}

function addLineChart(pptx, slide, title, seriesRows, x, y, w, h) {
  const series = safeArray(seriesRows).filter((s) => Array.isArray(s?.vals) && s.vals.some((v) => Number.isFinite(Number(v))));
  if (series.length === 0) return;
  slide.addText(title, { x, y: y - 0.18, w, h: 0.18, fontSize: 11, bold: true, color: COLORS.navy });
  slide.addChart(pptx.ChartType.line, series.map((s, idx) => ({
    name: s.navn || s.year || `Serie ${idx + 1}`,
    labels: s.labels || ['1M', '3M', 'YTD', '1Y', '3Y', '5Y'],
    values: s.vals
  })), {
    x, y, w, h,
    catAxisLabelFontSize: 8.5,
    valAxisLabelFontSize: 8.5,
    showLegend: true,
    legendFontSize: 9,
    showTitle: false,
    chartColors: [COLORS.blue, COLORS.salmon, COLORS.green],
    lineSize: 2,
    showValue: false,
    gridLine: { color: 'E5E7EB', pt: 1 }
  });
}

function addProductSlide(pptx, slide, product) {
  const node = product.reportNode || {};
  const exposure = product.exposureData || {};
  const title = node.slideTitleOverride || `${product.kortnavn || product.navn} i porteføljen`;
  addFrame(pptx, slide, title, node.produktUndertittel || product.narrative?.title || product.rolle || '');
  addKpiCard(pptx, slide, 0.9, 1.55, 2.2, 0.95, 'Porteføljevekt', fmtPct(product.portfolioWeight), COLORS.blue);
  addKpiCard(pptx, slide, 3.25, 1.55, 2.4, 0.95, node.primaryKpiLabel || 'Forv. avkastning', product.reportNode?.forventetAvkastning ? fmtPct(product.reportNode.forventetAvkastning) : (product.reportNode?.forventetYield ? fmtPct(product.reportNode.forventetYield) : '—'), COLORS.salmon);
  addKpiCard(pptx, slide, 5.85, 1.55, 2.2, 0.95, node.secondaryKpiLabel || 'Likviditet', product.likviditet || '—', COLORS.green);
  addKpiCard(pptx, slide, 8.2, 1.55, 3.0, 0.95, 'Benchmark', product.benchmark || '—', COLORS.gold);

  const narrativeBullets = [
    node.pitchKort || product.caseKort || '',
    node.whyIncluded || '',
    node.keyRisks ? `Viktige risikomomenter: ${node.keyRisks}` : ''
  ].filter(Boolean);
  addBulletList(slide, narrativeBullets, 0.9, 2.8, 5.2, 2.3, 10.8);

  const chartPlan = node.chartPlan || ['regioner', 'sektorer'];
  if (chartPlan.includes('regioner')) addBarChart(pptx, slide, 'Regionfordeling', exposure.regioner || node.topRegions || [], 6.3, 2.05, 2.85, 2.0, COLORS.blue);
  if (chartPlan.includes('sektorer')) addBarChart(pptx, slide, 'Sektorfordeling', exposure.sektorer || node.topSectors || [], 9.35, 2.05, 2.85, 2.0, COLORS.green);
  if (chartPlan.includes('holdings')) addBarChart(pptx, slide, 'Største underliggende', exposure.underliggende || node.topHoldings || [], 6.3, 4.55, 5.9, 1.85, COLORS.salmon);
  else {
    addSimpleTable(slide, [
      ['Nøkkelfelt', 'Verdi'],
      ['Aktivaklasse', product.aktivaklasse || '—'],
      ['Rolle', product.rolle || '—'],
      ['Stil / bias', node.styleBias || '—'],
      ['Morningstar-mapping', node.morningstarMapping || '—']
    ], 6.45, 4.5, 5.45, [2.0, 3.0]);
  }
}

export async function createProposalPresentationV2(proposalModel) {
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_WIDE';
  pptx.author = 'OpenAI for Pensum Asset Management';
  pptx.company = 'Pensum Asset Management';
  pptx.subject = 'Investeringsforslag';
  pptx.title = `Investeringsforslag – ${proposalModel?.meta?.kundeNavn || 'Investor'}`;
  pptx.lang = 'nb-NO';
  pptx.theme = { headFontFace: 'Aptos Display', bodyFontFace: 'Aptos', lang: 'nb-NO' };

  const meta = proposalModel?.meta || {};
  const portfolio = proposalModel?.portfolio || {};
  const narrative = proposalModel?.narrative || {};
  const selectedProducts = safeArray(portfolio.selectedProducts);
  const mainDeckProducts = safeArray(portfolio.selectedForMainDeck).map((p) => selectedProducts.find((full) => full.id === p.id)).filter(Boolean);

  const cover = pptx.addSlide();
  cover.background = { color: COLORS.bg };
  cover.addText('Illustrativ investeringsskisse', { x: 0.9, y: 1.1, w: 6.4, h: 0.45, fontSize: 22, bold: true, color: COLORS.navy });
  cover.addText('Eksempel på porteføljesammensetning', { x: 0.9, y: 1.62, w: 6.4, h: 0.42, fontSize: 19, color: COLORS.text });
  cover.addText(`Utarbeidet av Pensum Asset Management AS for: ${meta.kundeNavn || 'Investor'}`, { x: 0.9, y: 2.35, w: 8.6, h: 0.25, fontSize: 11, color: COLORS.muted });
  cover.addText(meta.reportDate || '', { x: 0.9, y: 2.65, w: 2, h: 0.2, fontSize: 10, color: COLORS.muted });
  cover.addShape(pptx.ShapeType.roundRect, { x: 0.9, y: 5.7, w: 3.5, h: 0.95, rectRadius: 0.08, fill: { color: COLORS.white }, line: { color: COLORS.line, pt: 1 } });
  cover.addText('Totalt investeringsbeløp', { x: 1.15, y: 5.98, w: 2.4, h: 0.18, fontSize: 9.5, color: COLORS.muted });
  cover.addText(fmtNok(meta.totalKapital), { x: 1.15, y: 6.22, w: 2.8, h: 0.26, fontSize: 18, bold: true, color: COLORS.navy });

  const info = pptx.addSlide();
  addFrame(pptx, info, 'Viktig informasjon', 'Illustrativt materiale før eventuell egnethetsvurdering');
  info.addText([
    { text: 'Dette dokumentet er utarbeidet som en illustrativ investeringsskisse basert på overordnede opplysninger mottatt i dialog med potensiell kunde.\n\n' },
    { text: 'Dokumentet utgjør ikke investeringsrådgivning, ikke en personlig anbefaling og forutsetter at Pensum Asset Management AS ikke har gjennomført egnethetsvurdering eller fullstendige kundetiltak.\n\n' },
    { text: 'Eventuelt senere kundeforhold og konkrete investeringsråd forutsetter separat kundeetablering, kundeklassifisering, egnethetsvurdering og gjennomføring av relevante KYC/AML-tiltak.' }
  ], { x: 0.9, y: 1.5, w: 11.3, h: 4.5, fontSize: 16, color: COLORS.text, valign: 'top' });

  const summary = pptx.addSlide();
  addFrame(pptx, summary, 'Executive summary', 'Overordnet investeringsforslag og hovedbegrunnelse');
  addKpiCard(pptx, summary, 0.9, 1.55, 2.6, 1.0, 'Risikoprofil', meta.risikoProfil || 'Moderat', COLORS.blue);
  addKpiCard(pptx, summary, 3.7, 1.55, 2.6, 1.0, 'Forventet avkastning', fmtPct(meta.forventetAvkastning), COLORS.salmon);
  addKpiCard(pptx, summary, 6.5, 1.55, 2.6, 1.0, 'Utvalgte løsninger', String(selectedProducts.length), COLORS.green);
  addKpiCard(pptx, summary, 9.3, 1.55, 2.9, 1.0, 'Kapital', fmtNok(meta.totalKapital), COLORS.gold);
  addBulletList(summary, narrative.executiveSummary || portfolio.summaryBullets || [], 0.9, 2.95, 5.8, 2.5);
  addSimpleTable(summary, [['Løsning', 'Vekt', 'Aktivaklasse', 'Rolle']].concat(selectedProducts.slice(0, 6).map((p) => [p.kortnavn || p.navn, fmtPct(p.portfolioWeight), p.aktivaklasse || '—', p.rolle || '—'])), 6.9, 3.0, 5.1, [1.5, 0.8, 1.1, 1.7]);

  const assumptions = pptx.addSlide();
  addFrame(pptx, assumptions, 'Overordnede forutsetninger (illustrative)', 'Utgangspunkt for den foreslåtte porteføljen');
  addBulletList(assumptions, [
    'Illustrasjonen er ikke basert på full egnethetsvurdering, men på overordnede opplysninger oppgitt i dialog.',
    'Porteføljen er ment som eksempel på sammensetning og risikospredning med Pensums løsninger.',
    `Risikoprofil er foreløpig lagt til grunn som ${meta.risikoProfil || 'Moderat'}.`,
    'Likviditetsbehov, struktur, skattemessige forhold og eksisterende plasseringer bør vurderes nærmere før eventuell implementering.'
  ], 0.9, 1.8, 7.0, 3.3);
  addSimpleTable(assumptions, [
    ['Forutsetning', 'Status'],
    ['Investeringshorisont', 'Langsiktig, 5 år +'],
    ['Overordnet risikonivå', meta.risikoProfil || 'Moderat'],
    ['Likviditetsbehov', 'Bør avklares i videre prosess'],
    ['Mål med porteføljen', 'Balansert langsiktig avkastning og risikospredning']
  ], 7.9, 1.95, 4.0, [1.8, 2.0]);

  const intro = pptx.addSlide();
  addFrame(pptx, intro, 'Eksempel på illustrativ porteføljesammensetning', 'Porteføljen under er en modell og må ikke forstås som endelig anbefaling');
  addBulletList(intro, [
    'Porteføljen presenteres som en modell for å vise hvordan Pensums løsninger kan settes sammen i én helhet.',
    'Hensikten er å illustrere sammensetning, risikospredning og rollen de ulike byggesteinene kan spille.',
    'Produkter med 0 % vekt vises ikke i hoveddekket.'
  ], 0.9, 1.75, 7.4, 2.1);
  addSimpleTable(intro, [['Løsning', 'Vekt', 'Kommentar']].concat(mainDeckProducts.map((p) => [p.kortnavn || p.navn, fmtPct(p.portfolioWeight), p.reportNode?.pitchKort || p.caseKort || '—'])), 0.9, 4.1, 11.0, [2.2, 0.9, 7.3]);

  const alloc = pptx.addSlide();
  addFrame(pptx, alloc, 'Anbefalt porteføljesammensetning', 'Allokering på aktivaklasser og valgte Pensum-løsninger');
  addBarChart(pptx, alloc, 'Aktivaklasseallokering', portfolio.allocations, 0.9, 1.8, 5.6, 2.35);
  addBarChart(pptx, alloc, 'Pensum-løsninger i porteføljen', selectedProducts.map((p) => ({ navn: p.kortnavn || p.navn, vekt: p.portfolioWeight })), 6.8, 1.8, 5.2, 2.35);
  addSimpleTable(alloc, [['Løsning', 'Vekt', 'Benchmark', 'Likviditet']].concat(selectedProducts.slice(0,8).map((p) => [p.kortnavn || p.navn, fmtPct(p.portfolioWeight), p.benchmark || '—', p.likviditet || '—'])), 0.9, 4.55, 11.1, [2.4, 0.8, 4.0, 1.8]);

  const grid = pptx.addSlide();
  addFrame(pptx, grid, 'Pensum-løsningene i porteføljen', 'Produktroller, forventninger og narrativ i hoveddekket');
  addSimpleTable(grid, [
    ['Løsning', 'Vekt', 'Rolle', 'Primærfunksjon', 'Slides'],
    ...selectedProducts.slice(0, 8).map((p) => [p.kortnavn || p.navn, fmtPct(p.portfolioWeight), p.rolle || '—', p.reportNode?.pitchKort || '—', String(p.reportNode?.slideCount || 1)])
  ], 0.9, 1.9, 11.2, [1.8, 0.8, 1.6, 5.2, 0.8]);
  addBulletList(grid, [
    'Produkter med vekt > 0 vises i forslaget. De største byggesteinene prioriteres i hoveddekket.',
    'Produktfeltene som vedlikeholdes under Pensum Løsninger brukes direkte til tekst, KPI-er og diagramvalg.',
    'På sikt bør Morningstar-/ekstern produktdata kobles til disse produktnodene som månedlige overrides.'
  ], 0.9, 5.4, 11.0, 1.2, 10.2);

  const rationale = pptx.addSlide();
  addFrame(pptx, rationale, 'Hvorfor denne sammensetningen', 'Porteføljelogikk, samlet eksponering og nøkkelpoenger');
  addBulletList(rationale, narrative.whyThisMix || portfolio.summaryBullets || [], 0.9, 1.75, 5.4, 3.4);
  addBarChart(pptx, rationale, 'Samlet regioneksponering', portfolio.aggregateExposure?.regioner || [], 6.5, 1.95, 2.7, 2.1, COLORS.blue);
  addBarChart(pptx, rationale, 'Samlet sektoreksponering', portfolio.aggregateExposure?.sektorer || [], 9.45, 1.95, 2.7, 2.1, COLORS.green);
  addLineChart(pptx, rationale, 'Nøkkelavkastning for største byggesteiner', selectedProducts.slice(0, 3).map((p) => ({ navn: p.kortnavn || p.navn, labels: ['1M','3M','YTD','1Y','3Y','5Y'], vals: [num(p.returns?.m1), num(p.returns?.m3), num(p.returns?.ytd), num(p.returns?.y1), num(p.returns?.y3), num(p.returns?.y5)] })), 6.5, 4.65, 5.65, 1.7);

  mainDeckProducts.forEach((product) => {
    const slide = pptx.addSlide();
    addProductSlide(pptx, slide, product);
  });

  if (portfolio.appendixProducts?.length) {
    const appendix = pptx.addSlide();
    addFrame(pptx, appendix, 'Tilleggsprodukter / appendix', 'Valgte produkter som ikke fikk egne hovedslides i denne versjonen');
    addSimpleTable(appendix, [['Løsning', 'Vekt']].concat(portfolio.appendixProducts.map((p) => [p.kortnavn || p.navn, fmtPct(p.portfolioWeight)])), 0.9, 1.8, 4.1, [2.8, 1.0]);
    addBulletList(appendix, [
      'I world-class-versjonen bør også disse produktene kunne få egne moduler ved behov.',
      'Det kan styres via slidebudsjett, produktprioritet og egen rådgiverstyring i generatoren.'
    ], 5.5, 1.95, 6.0, 1.8);
  }

  return pptx.write({ outputType: 'nodebuffer' });
}
