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
  slide.addText(title, { x: 0.7, y: 0.86, w: 9.8, h: 0.42, fontSize: 22, bold: true, color: COLORS.navy });
  if (subtitle) slide.addText(subtitle, { x: 0.7, y: 1.28, w: 9.8, h: 0.22, fontSize: 10.5, color: COLORS.muted });
  slide.addShape(pptx.ShapeType.line, { x: 0.7, y: 7.1, w: 11.95, h: 0, line: { color: COLORS.line, pt: 1 } });
}

function addKpiCard(pptx, slide, x, y, w, h, label, value, accent = COLORS.blue) {
  slide.addShape(pptx.ShapeType.roundRect, { x, y, w, h, rectRadius: 0.08, fill: { color: COLORS.white }, line: { color: COLORS.line, pt: 1 } });
  slide.addShape(pptx.ShapeType.rect, { x: x + 0.02, y: y + 0.02, w: 0.08, h: h - 0.04, fill: { color: accent }, line: { color: accent, pt: 0 } });
  slide.addText(label, { x: x + 0.18, y: y + 0.16, w: w - 0.28, h: 0.2, fontSize: 9.5, color: COLORS.muted });
  slide.addText(value, { x: x + 0.18, y: y + 0.44, w: w - 0.28, h: 0.3, fontSize: 19, bold: true, color: COLORS.navy });
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
  const prepared = topRows(rows, 8);
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
  const series = safeArray(seriesRows).filter((s) => Array.isArray(s?.vals) && s.vals.length > 0);
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

  const alloc = pptx.addSlide();
  addFrame(pptx, alloc, 'Anbefalt porteføljesammensetning', 'Allokering på aktivaklasser og valgte Pensum-løsninger');
  addBarChart(pptx, alloc, 'Aktivaklasseallokering', portfolio.allocations, 0.9, 1.8, 5.6, 2.35);
  addBarChart(pptx, alloc, 'Pensum-løsninger i porteføljen', selectedProducts.map((p) => ({ navn: p.kortnavn || p.navn, vekt: p.portfolioWeight })), 6.8, 1.8, 5.2, 2.35);
  addSimpleTable(alloc, [['Løsning', 'Vekt', 'Benchmark', 'Likviditet']].concat(selectedProducts.map((p) => [p.kortnavn || p.navn, fmtPct(p.portfolioWeight), p.benchmark || '—', p.likviditet || '—'])), 0.9, 4.55, 11.1, [2.4, 0.8, 4.0, 1.8]);

  const logic = pptx.addSlide();
  addFrame(pptx, logic, 'Hvorfor denne sammensetningen', 'Porteføljelogikk og risikospredning');
  addBulletList(logic, narrative.whyThisMix || [], 0.9, 1.75, 6.1, 4.3);
  addKpiCard(pptx, logic, 7.5, 1.8, 4.0, 0.95, 'Kjernebyggestein', selectedProducts[0]?.kortnavn || '—', COLORS.blue);
  addKpiCard(pptx, logic, 7.5, 2.95, 4.0, 0.95, 'Renteside', selectedProducts.some((p) => /renter|kreditt/i.test(p.aktivaklasse || '')) ? 'Inkludert' : 'Ikke inkludert', COLORS.green);
  addKpiCard(pptx, logic, 7.5, 4.1, 4.0, 0.95, 'Tematisk/sektor', selectedProducts.some((p) => /tema|sektor/i.test(p.rolle || '') || /tematisk|sektor/i.test(p.aktivaklasse || '')) ? 'Inkludert' : 'Begrenset', COLORS.salmon);

  const hist = pptx.addSlide();
  addFrame(pptx, hist, 'Historisk utvikling og nøkkeltall', 'Månedlige data og nøkkelavkastning fra gjeldende datagrunnlag');
  addLineChart(pptx, hist, 'Avkastningspunkter per valgt løsning', selectedProducts.slice(0, 3).map((p) => ({ navn: p.kortnavn || p.navn, labels: ['1M','3M','YTD','1Y','3Y','5Y'], vals: [num(p.returns?.m1), num(p.returns?.m3), num(p.returns?.ytd), num(p.returns?.y1), num(p.returns?.y3), num(p.returns?.y5)] })), 0.9, 1.9, 6.2, 2.6);
  addSimpleTable(hist, [['Løsning', '1M', '3M', 'YTD', '1Y', '3Y p.a.']].concat(selectedProducts.map((p) => [p.kortnavn || p.navn, fmtPct(p.returns?.m1), fmtPct(p.returns?.m3), fmtPct(p.returns?.ytd), fmtPct(p.returns?.y1), fmtPct(p.returns?.y3)])), 7.4, 1.95, 4.5, [1.45, 0.52, 0.52, 0.52, 0.52, 0.75]);
  addBulletList(hist, ['Historiske tall brukes her som informasjonsgrunnlag og må ikke tolkes som garanti for fremtidig utvikling.', 'På sikt bør denne siden erstattes eller suppleres med modellert porteføljeutvikling og sammenligning mot relevant referanseportefølje.'], 0.9, 4.9, 11.1, 1.2, 10.5);

  selectedProducts.forEach((product) => {
    const exposure = product.exposureData || {};
    const rationale = pptx.addSlide();
    addFrame(pptx, rationale, `${product.kortnavn || product.navn} i porteføljen`, product.narrative?.title || product.rolle || 'Produktrolle og investeringscase');
    addKpiCard(pptx, rationale, 0.9, 1.55, 2.6, 1.0, 'Porteføljevekt', fmtPct(product.portfolioWeight), COLORS.blue);
    addKpiCard(pptx, rationale, 3.7, 1.55, 2.6, 1.0, 'Benchmark', product.benchmark || '—', COLORS.salmon);
    addKpiCard(pptx, rationale, 6.5, 1.55, 2.6, 1.0, 'Risiko', product.risikonivaa || '—', COLORS.green);
    addKpiCard(pptx, rationale, 9.3, 1.55, 2.9, 1.0, 'Likviditet', product.likviditet || '—', COLORS.gold);
    addBulletList(rationale, product.narrative?.rationale || [product.caseKort || '', product.rolle || ''].filter(Boolean), 0.9, 2.95, 5.9, 2.5);
    addSimpleTable(rationale, [['Nøkkelfelt', 'Verdi'], ['Aktivaklasse', product.aktivaklasse || '—'], ['Rolle', product.rolle || '—'], ['Kort investeringscase', product.caseKort || '—']], 6.95, 3.0, 4.9, [1.7, 3.0]);

    const expo = pptx.addSlide();
    addFrame(pptx, expo, `${product.kortnavn || product.navn} – eksponering`, 'Regioner, sektorer og underliggende posisjoner');
    addBarChart(pptx, expo, 'Regionfordeling', exposure.regioner || [], 0.9, 1.9, 3.7, 2.2, COLORS.blue);
    addBarChart(pptx, expo, 'Sektorfordeling', exposure.sektorer || [], 4.8, 1.9, 3.7, 2.2, COLORS.green);
    addBarChart(pptx, expo, 'Største underliggende', exposure.underliggende || [], 8.7, 1.9, 3.5, 2.2, COLORS.salmon);
    addBulletList(expo, product.narrative?.exposureCommentary || [], 0.9, 4.55, 5.6, 1.1, 10.5);
    addSimpleTable(expo, [['Målepunkt', 'Verdi'], ['1M', fmtPct(product.returns?.m1)], ['3M', fmtPct(product.returns?.m3)], ['YTD', fmtPct(product.returns?.ytd)], ['1Y', fmtPct(product.returns?.y1)], ['3Y p.a.', fmtPct(product.returns?.y3)]], 7.25, 4.35, 3.2, [1.1, 1.2]);
  });

  const impl = pptx.addSlide();
  addFrame(pptx, impl, 'Implementering og oppfølging', 'Hvordan porteføljen kan settes i arbeid og følges opp');
  addBulletList(impl, narrative.implementationText || [], 0.9, 1.8, 7.1, 2.2);
  addSimpleTable(impl, [['Neste steg', 'Beskrivelse'], ['1', 'Gjennomgang av investeringsskissen og avklaring av eventuelle endringer'], ['2', 'Kundeetablering, klassifisering og egnethetsvurdering ved videre prosess'], ['3', 'Implementering av porteføljen og løpende oppfølging fra rådgiver']], 0.9, 4.2, 10.8, [0.9, 8.9]);

  const closing = pptx.addSlide();
  addFrame(pptx, closing, 'Oppsummering', 'Investeringsskissen samler Pensum-løsninger med tydelige roller i én helhetlig portefølje');
  addBulletList(closing, [
    `Porteføljen er bygget rundt ${selectedProducts.length} utvalgte Pensum-løsninger med tydelig rollefordeling.`,
    'Forslaget er ment som utgangspunkt for videre dialog og finjustering før eventuell implementering.',
    'Ved neste steg bør både risikotoleranse, likviditetsbehov, eksisterende plasseringer og skattemessig struktur vurderes samlet.'
  ], 0.9, 1.8, 8.2, 2.2);
  addKpiCard(pptx, closing, 9.3, 1.8, 2.4, 0.9, 'Kapital', fmtNok(meta.totalKapital), COLORS.blue);
  addKpiCard(pptx, closing, 9.3, 2.85, 2.4, 0.9, 'Risikoprofil', meta.risikoProfil || 'Moderat', COLORS.salmon);
  addKpiCard(pptx, closing, 9.3, 3.9, 2.4, 0.9, 'Forv. avkastning', fmtPct(meta.forventetAvkastning), COLORS.green);

  return pptx.write({ outputType: 'nodebuffer' });
}
