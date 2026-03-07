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
  if (subtitle) {
    slide.addText(subtitle, { x: 0.7, y: 1.28, w: 9.8, h: 0.22, fontSize: 10.5, color: COLORS.muted });
  }
  slide.addShape(pptx.ShapeType.line, { x: 0.7, y: 7.1, w: 11.95, h: 0, line: { color: COLORS.line, pt: 1 } });
}

function addKpiCard(pptx, slide, x, y, w, h, label, value, accent = COLORS.blue) {
  slide.addShape(pptx.ShapeType.roundRect, { x, y, w, h, rectRadius: 0.08, fill: { color: COLORS.white }, line: { color: COLORS.line, pt: 1 } });
  slide.addShape(pptx.ShapeType.rect, { x: x + 0.02, y: y + 0.02, w: 0.08, h: h - 0.04, fill: { color: accent }, line: { color: accent, pt: 0 } });
  slide.addText(label, { x: x + 0.18, y: y + 0.16, w: w - 0.28, h: 0.2, fontSize: 9.5, color: COLORS.muted });
  slide.addText(value, { x: x + 0.18, y: y + 0.44, w: w - 0.28, h: 0.3, fontSize: 19, bold: true, color: COLORS.navy });
}

function addBulletList(slide, bullets, x, y, w, h) {
  const runs = [];
  safeArray(bullets).forEach((item, idx) => {
    if (!item) return;
    runs.push({ text: item, options: { bullet: { indent: 12 } } });
    if (idx < bullets.length - 1) runs.push({ text: '\n' });
  });
  slide.addText(runs, { x, y, w, h, fontSize: 12, color: COLORS.text, breakLine: false, paraSpaceAfterPt: 9, valign: 'top' });
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

function addBarChart(pptx, slide, title, rows, x, y, w, h) {
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
    chartColors: [COLORS.blue],
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
    labels: s.labels || ['Jan', 'Feb', 'Mar', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Des'],
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

function toMonthlySeries(product) {
  const returns = product?.returns || {};
  return [{
    navn: product?.kortnavn || product?.navn || 'Produkt',
    labels: ['1M', '3M', 'YTD', '1Y', '3Y', '5Y'],
    vals: [num(returns.m1), num(returns.m3), num(returns.ytd), num(returns.y1), num(returns.y3), num(returns.y5)]
  }];
}

export async function createProposalPresentationV2(proposalModel) {
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_WIDE';
  pptx.author = 'OpenAI for Pensum Asset Management';
  pptx.company = 'Pensum Asset Management';
  pptx.subject = 'Investeringsforslag';
  pptx.title = `Investeringsforslag – ${proposalModel?.meta?.kundeNavn || 'Investor'}`;
  pptx.lang = 'nb-NO';
  pptx.theme = {
    headFontFace: 'Aptos Display',
    bodyFontFace: 'Aptos',
    lang: 'nb-NO'
  };

  const meta = proposalModel?.meta || {};
  const portfolio = proposalModel?.portfolio || {};
  const selectedProducts = safeArray(portfolio.selectedProducts);

  {
    const slide = pptx.addSlide();
    slide.background = { color: COLORS.bg };
    slide.addText('Illustrativ investeringsskisse', { x: 0.9, y: 1.1, w: 6.4, h: 0.45, fontSize: 22, bold: true, color: COLORS.navy });
    slide.addText('Eksempel på porteføljesammensetning', { x: 0.9, y: 1.62, w: 6.4, h: 0.42, fontSize: 19, color: COLORS.text });
    slide.addText(`Utarbeidet av Pensum Asset Management AS for: ${meta.kundeNavn || 'Investor'}`, { x: 0.9, y: 2.35, w: 8.6, h: 0.25, fontSize: 11, color: COLORS.muted });
    slide.addText(meta.reportDate || '', { x: 0.9, y: 2.65, w: 2, h: 0.2, fontSize: 10, color: COLORS.muted });
    slide.addShape(pptx.ShapeType.roundRect, { x: 0.9, y: 5.7, w: 3.5, h: 0.95, rectRadius: 0.08, fill: { color: COLORS.white }, line: { color: COLORS.line, pt: 1 } });
    slide.addText('Totalt investeringsbeløp', { x: 1.15, y: 5.98, w: 2.4, h: 0.18, fontSize: 9.5, color: COLORS.muted });
    slide.addText(fmtNok(meta.totalKapital), { x: 1.15, y: 6.22, w: 2.8, h: 0.26, fontSize: 18, bold: true, color: COLORS.navy });
  }

  {
    const slide = pptx.addSlide();
    addFrame(pptx, slide, 'Viktig informasjon', 'Illustrativt materiale før eventuell egnethetsvurdering');
    slide.addText([
      { text: 'Dette dokumentet er utarbeidet som en illustrativ investeringsskisse basert på overordnede opplysninger mottatt i dialog med potensiell kunde.\n\n' },
      { text: 'Dokumentet utgjør ikke investeringsrådgivning, ikke en personlig anbefaling og forutsetter at Pensum Asset Management AS ikke har gjennomført egnethetsvurdering eller fullstendige kundetiltak.\n\n' },
      { text: 'Eventuelt senere kundeforhold og konkrete investeringsråd forutsetter separat kundeetablering, kundeklassifisering, egnethetsvurdering og gjennomføring av relevante KYC/AML-tiltak.' }
    ], { x: 0.9, y: 1.5, w: 11.3, h: 4.5, fontSize: 16, color: COLORS.text, valign: 'top' });
  }

  {
    const slide = pptx.addSlide();
    addFrame(pptx, slide, 'Executive summary', 'Overordnet investeringsforslag og hovedbegrunnelse');
    addKpiCard(pptx, slide, 0.9, 1.55, 2.6, 1.0, 'Risikoprofil', meta.risikoProfil || 'Moderat', COLORS.blue);
    addKpiCard(pptx, slide, 3.7, 1.55, 2.6, 1.0, 'Forventet avkastning', fmtPct(meta.forventetAvkastning), COLORS.salmon);
    addKpiCard(pptx, slide, 6.5, 1.55, 2.6, 1.0, 'Utvalgte løsninger', String(selectedProducts.length), COLORS.green);
    addKpiCard(pptx, slide, 9.3, 1.55, 2.9, 1.0, 'Kapital', fmtNok(meta.totalKapital), COLORS.gold);
    addBulletList(slide, portfolio.summaryBullets || [], 0.9, 2.95, 5.8, 2.3);

    const rows = [['Løsning', 'Vekt', 'Aktivaklasse', 'Rolle']].concat(selectedProducts.slice(0, 6).map((p) => [
      p.kortnavn || p.navn,
      fmtPct(p.portfolioWeight),
      p.aktivaklasse || '—',
      p.rolle || '—'
    ]));
    addSimpleTable(slide, rows, 6.9, 3.0, 5.1, [1.5, 0.8, 1.1, 1.7]);
  }

  {
    const slide = pptx.addSlide();
    addFrame(pptx, slide, 'Anbefalt porteføljesammensetning', 'Allokering på aktivaklasser og valgte Pensum-løsninger');
    addBarChart(pptx, slide, 'Aktivaklasseallokering', portfolio.allocations, 0.9, 1.8, 5.6, 2.35);
    addBarChart(pptx, slide, 'Pensum-løsninger i porteføljen', selectedProducts.map((p) => ({ navn: p.kortnavn || p.navn, vekt: p.portfolioWeight })), 6.8, 1.8, 5.2, 2.35);
    const rows = [['Løsning', 'Vekt', 'Benchmark', 'Likviditet']].concat(selectedProducts.map((p) => [
      p.kortnavn || p.navn,
      fmtPct(p.portfolioWeight),
      p.benchmark || '—',
      p.likviditet || '—'
    ]));
    addSimpleTable(slide, rows, 0.9, 4.55, 11.1, [2.4, 0.8, 4.0, 1.8]);
  }

  {
    const slide = pptx.addSlide();
    addFrame(pptx, slide, 'Hvorfor denne sammensetningen', 'Porteføljelogikk og risikospredning');
    const bullets = [
      'Porteføljen er bygget med tydelig rollefordeling mellom kjerneeksponering, satellitter og stabiliserende byggesteiner.',
      'Kombinasjonen av globale aksjer, renteeksponering og eventuelle tematiske eller sektorielle mandater skal gi en bedre balanse mellom avkastningspotensial og robusthet.',
      'Utvalgte Pensum-løsninger er satt sammen for å gi spredning på regioner, sektorer, stilarter og underliggende forvaltere.',
      'Løsningene kan skaleres opp eller ned over tid i takt med investorens risikotoleranse, likviditetsbehov og markedsvurdering.'
    ];
    addBulletList(slide, bullets, 0.9, 1.75, 6.1, 4.3);
    addKpiCard(pptx, slide, 7.5, 1.8, 4.0, 0.95, 'Kjernebyggestein', selectedProducts[0]?.kortnavn || '—', COLORS.blue);
    addKpiCard(pptx, slide, 7.5, 2.95, 4.0, 0.95, 'Renteside', selectedProducts.some((p) => /renter|kreditt/i.test(p.aktivaklasse || '')) ? 'Inkludert' : 'Ikke inkludert', COLORS.green);
    addKpiCard(pptx, slide, 7.5, 4.1, 4.0, 0.95, 'Tematisk/sektor', selectedProducts.some((p) => /tema|sektor/i.test(p.rolle || '')) ? 'Inkludert' : 'Begrenset', COLORS.salmon);
  }

  {
    const slide = pptx.addSlide();
    addFrame(pptx, slide, 'Historisk utvikling og nøkkeltall', 'Månedlige data og nøkkelavkastning fra gjeldende datagrunnlag');
    addLineChart(pptx, slide, 'Avkastningspunkter per valgt løsning', selectedProducts.slice(0, 3).map((p) => ({ navn: p.kortnavn || p.navn, labels: ['1M','3M','YTD','1Y','3Y','5Y'], vals: [num(p.returns?.m1), num(p.returns?.m3), num(p.returns?.ytd), num(p.returns?.y1), num(p.returns?.y3), num(p.returns?.y5)] })), 0.9, 1.9, 6.2, 2.6);
    const rows = [['Løsning', '1M', '3M', 'YTD', '1Y', '3Y', '5Y']].concat(selectedProducts.map((p) => [
      p.kortnavn || p.navn,
      fmtPct(p.returns?.m1),
      fmtPct(p.returns?.m3),
      fmtPct(p.returns?.ytd),
      fmtPct(p.returns?.y1),
      fmtPct(p.returns?.y3),
      fmtPct(p.returns?.y5)
    ]));
    addSimpleTable(slide, rows, 0.9, 4.85, 11.2, [2.3, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8]);
  }

  selectedProducts.forEach((product) => {
    const exposure = product.exposureData || {};

    {
      const slide = pptx.addSlide();
      addFrame(pptx, slide, `${product.navn}`, `${fmtPct(product.portfolioWeight)} av porteføljen • ${product.aktivaklasse || ''}`);
      addKpiCard(pptx, slide, 0.9, 1.55, 2.7, 0.95, 'Vekt i porteføljen', fmtPct(product.portfolioWeight), COLORS.blue);
      addKpiCard(pptx, slide, 3.8, 1.55, 2.7, 0.95, 'Benchmark', product.benchmark || '—', COLORS.salmon);
      addKpiCard(pptx, slide, 6.7, 1.55, 2.3, 0.95, 'Risikonivå', product.risikonivaa || '—', COLORS.green);
      addKpiCard(pptx, slide, 9.2, 1.55, 2.3, 0.95, 'Likviditet', product.likviditet || '—', COLORS.gold);
      addBulletList(slide, [product.caseKort, product.caseLang, `Rolle i porteføljen: ${product.rolle}`].filter(Boolean), 0.9, 2.8, 6.2, 3.1);
      const rows = [['Periode', 'Avkastning']].concat([
        ['1 måned', fmtPct(product.returns?.m1)],
        ['3 måneder', fmtPct(product.returns?.m3)],
        ['YTD', fmtPct(product.returns?.ytd)],
        ['1 år', fmtPct(product.returns?.y1)],
        ['3 år', fmtPct(product.returns?.y3)],
        ['5 år', fmtPct(product.returns?.y5)]
      ]);
      addSimpleTable(slide, rows, 7.45, 2.9, 3.8, [1.8, 1.4]);
    }

    {
      const slide = pptx.addSlide();
      addFrame(pptx, slide, `${product.kortnavn || product.navn} – eksponering og underliggende`, 'Produktspesifikk informasjon fra Pensum-løsninger og tilgjengelige eksponeringsdata');
      addBarChart(pptx, slide, 'Regioner', exposure.regioner || [], 0.9, 1.95, 3.7, 2.1);
      addBarChart(pptx, slide, 'Sektorer', exposure.sektorer || [], 4.9, 1.95, 3.7, 2.1);
      addBarChart(pptx, slide, 'Stil / faktor', exposure.stil || [], 8.9, 1.95, 3.1, 2.1);
      const underliggendeRows = [['Underliggende', 'Vekt']].concat(topRows(exposure.underliggende || [], 10).map((r) => [r.navn, fmtPct(r.vekt)]));
      addSimpleTable(slide, underliggendeRows, 0.9, 4.45, 7.6, [5.8, 1.2]);
      if (exposure.disclaimer) {
        slide.addShape(pptx.ShapeType.roundRect, { x: 8.9, y: 4.45, w: 3.1, h: 1.25, rectRadius: 0.05, fill: { color: COLORS.white }, line: { color: COLORS.line, pt: 1 } });
        slide.addText('Kommentar', { x: 9.12, y: 4.64, w: 1.0, h: 0.15, fontSize: 9.5, bold: true, color: COLORS.navy });
        slide.addText(exposure.disclaimer, { x: 9.12, y: 4.86, w: 2.7, h: 0.65, fontSize: 8.8, color: COLORS.muted, valign: 'top' });
      }
    }
  });

  {
    const slide = pptx.addSlide();
    addFrame(pptx, slide, 'Implementering og oppfølging', 'Forslag til videre prosess ved eventuell videre dialog');
    addBulletList(slide, [
      'Gjennomføre full kundeetablering, innhente nødvendig dokumentasjon og gjennomføre egnethetsvurdering.',
      'Bekrefte investeringsmål, likviditetsbehov, tidshorisont og relevante skatte- eller strukturhensyn før eventuell implementering.',
      'Fastsette endelig porteføljestørrelse og eventuell trinnvis innfasing basert på markedssituasjon og eksisterende plasseringer.',
      'Etablere løpende oppfølging med regelmessig porteføljerapportering og vurdering av rebalansering ved behov.'
    ], 0.9, 1.7, 6.8, 4.0);
    addKpiCard(pptx, slide, 8.4, 1.9, 3.0, 0.95, 'Oppfølging', 'Løpende', COLORS.blue);
    addKpiCard(pptx, slide, 8.4, 3.05, 3.0, 0.95, 'Rebalansering', 'Ved behov', COLORS.green);
    addKpiCard(pptx, slide, 8.4, 4.2, 3.0, 0.95, 'Rapportering', 'Regelmessig', COLORS.salmon);
  }

  {
    const slide = pptx.addSlide();
    addFrame(pptx, slide, 'Oppsummering og neste steg', 'Illustrativ portefølje som grunnlag for videre dialog');
    addBulletList(slide, [
      `Porteføljen er bygget for en ${String(meta.risikoProfil || '').toLowerCase()} investor med forventet årlig avkastning på ${fmtPct(meta.forventetAvkastning)}.`,
      `Forslaget kombinerer ${selectedProducts.length} Pensum-løsninger med tydelig rollefordeling mellom kjerne, stabilisatorer og eventuelle satellitter.`,
      'Neste steg vil være å gjennomføre formell kartlegging og egnethetsvurdering før eventuell endelig anbefaling og implementering.'
    ], 0.9, 1.75, 6.4, 3.1);
    const rows = [['Valgt løsning', 'Porteføljevekt']].concat(selectedProducts.map((p) => [p.kortnavn || p.navn, fmtPct(p.portfolioWeight)]));
    addSimpleTable(slide, rows, 7.5, 1.85, 3.7, [2.7, 1.0]);
  }

  const buffer = await pptx.write({ outputType: 'nodebuffer' });
  return buffer;
}
