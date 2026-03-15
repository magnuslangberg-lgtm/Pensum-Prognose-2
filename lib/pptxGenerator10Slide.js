/**
 * Pensum 10-Slide Compact Investment Proposal Generator
 *
 * Premium, authoritative presentation for client meetings.
 * Uses shared design system for consistency with future full-version generator.
 */
import {
  COLORS as C, PRODUCT_COLORS, ALLOC_COLORS, AKTIVA_COLORS, FONT, LAYOUT, TYPE,
  fmt, fmtPct, fmtKr, fmtMnok, cagr,
  classifyProductRole, ROLE_GROUPS,
  addHeader, addFooter, addKpiCard, addKpiRow, addDonutChart, addHBarChart,
  addInfoBox, buildTable, addNumberedCard, addStepItem, createPensumPptx,
} from './pptxDesignSystem.js';

// ─── MAIN GENERATOR ───
export async function generateProposal10SlidePptx(payload) {
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

  const pptx = createPensumPptx(kundeNavn);

  const invKapital = investerbarKapital || totalFormue || 0;
  const forventetAvk = pensumForventetAvkastning || vektetAvkastning || 0;

  // Merge product data
  const alleProdukter = Array.isArray(pensumProdukter)
    ? pensumProdukter
    : [
        ...(pensumProdukter?.enkeltfond || []),
        ...(pensumProdukter?.fondsportefoljer || []),
        ...(pensumProdukter?.alternative || []),
      ];
  const produktMap = {};
  alleProdukter.forEach(p => { if (p?.id) produktMap[p.id] = p; });

  // Build product list with weights
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

  // Navy left band + accent line (premium hero feel)
  slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 0.4, h: 7.5, fill: { color: C.navy } });
  slide.addShape(pptx.ShapeType.rect, { x: 0.4, y: 0, w: 0.05, h: 7.5, fill: { color: C.accent } });

  // Top-right subtle background panel for KPIs
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 7.6, y: 0.6, w: 5.3, h: 4.6, rectRadius: 0.1,
    fill: { color: C.warmGray },
  });

  // Title block — spacious and authoritative
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
  slide.addText(`Pensum Asset Management AS`, {
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

  // Right-side KPI cards — 3 strong KPIs (2x2 grid, fewer but stronger)
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

  // Bottom hero strip — Risikoprofil and Likviditet
  const likvidTekst = (pensumLikviditet?.likvid || 0) > 80 ? 'Høy' : (pensumLikviditet?.likvid || 0) > 50 ? 'Middels' : 'Lav';
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 1.3, y: 5.3, w: 5.8, h: 0.75, rectRadius: 0.08,
    fill: { color: C.lightBlue },
    line: { color: C.line, pt: 0.5 },
  });
  // Two-column badge inside the strip
  slide.addText(`Risikoprofil: ${risikoProfil}`, {
    x: 1.5, y: 5.35, w: 2.6, h: 0.3,
    fontFace: FONT, ...TYPE.body, bold: true, color: C.navy, valign: 'mid',
  });
  slide.addText(`Likviditet: ${likvidTekst}`, {
    x: 4.3, y: 5.35, w: 2.6, h: 0.3,
    fontFace: FONT, ...TYPE.body, bold: true, color: C.navy, valign: 'mid',
  });
  slide.addText(`Forventet yield: ${fmtPct(vektetYield)}  |  Sluttverdi (base): ${fmtMnok(sluttverdiForventet)}`, {
    x: 1.5, y: 5.7, w: 5.4, h: 0.25,
    fontFace: FONT, ...TYPE.bodySmall, color: C.muted, valign: 'mid',
  });

  // Footer
  addFooter(pptx, slide);

  // ══════════════════════════════════════════════════════════════
  // SLIDE 2: UTGANGSPUNKT OG INVESTERINGSMANDAT
  // ══════════════════════════════════════════════════════════════
  pageNum++;
  slide = pptx.addSlide();
  slide.background = { color: C.white };
  addHeader(pptx, slide, 'Utgangspunkt og investeringsmandat', 'Mål, horisont, risikovillighet og rådgivers vurdering');

  // Left column: Key mandate facts with accent bars
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

  // Right: Rådgivers vurdering box
  addInfoBox(pptx, slide, 7.2, 1.4, 5.4, 3.2, 'Rådgivers vurdering', [
    ['Profil', `${risikoProfil} – tilpasset investors preferanser`],
    ['Allokering', `${aksjeTotal}% aksjer, ${renteTotal}% renter`],
    ['Horisont', `${horisont} år med årlig rapportering`],
    ['Tilnærming', 'Diversifisert, aktiv forvaltning'],
    ['Kontantstrøm', `Forventet yield ${fmtPct(vektetYield)} p.a.`],
    ['Rebalansering', 'Aktiv oppfølging og periodisk tilpasning'],
  ]);

  // Conditional: formuesstruktur only if meaningful real data exists
  const formueItems = [];
  if (kundeinfo.aksjerKunde > 0) formueItems.push({ name: 'Aksjer', value: kundeinfo.aksjerKunde });
  if (kundeinfo.aksjefondKunde > 0) formueItems.push({ name: 'Aksjefond', value: kundeinfo.aksjefondKunde });
  if (kundeinfo.renterKunde > 0) formueItems.push({ name: 'Renter', value: kundeinfo.renterKunde });
  if (kundeinfo.kontanterKunde > 0) formueItems.push({ name: 'Kontanter', value: kundeinfo.kontanterKunde });
  if (kundeinfo.peFondKunde > 0) formueItems.push({ name: 'Private Equity', value: kundeinfo.peFondKunde });
  if (kundeinfo.egenEiendomKunde > 0) formueItems.push({ name: 'Eiendom', value: kundeinfo.egenEiendomKunde });

  // Only show if there are at least 2 distinct items with actual values — skip if generic/empty
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
  // SLIDE 3: ANBEFALT PORTEFØLJESAMMENSETNING
  // ══════════════════════════════════════════════════════════════
  pageNum++;
  slide = pptx.addSlide();
  slide.background = { color: C.white };
  addHeader(pptx, slide, 'Anbefalt porteføljesammensetning', 'Allokering per produkt med rolle og nøkkeltall');

  // Donut chart left
  const donutData = produkterMedVekt.map(p => ({
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

  // Role-based product categorization (not hardcoded IDs)
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

    // Group header bar
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.7, y: gy, w: 11.9, h: 0.38, rectRadius: 0.06,
      fill: { color: group.color },
    });
    // Weight subtotal on the right
    const groupWeight = items.reduce((s, p) => s + (p.vekt || 0), 0);
    slide.addText(`${group.label}  ·  ${group.desc}`, {
      x: 0.9, y: gy, w: 8.5, h: 0.38,
      fontFace: FONT, ...TYPE.cardTitle, color: C.white, valign: 'mid',
    });
    slide.addText(fmtPct(groupWeight), {
      x: 10.0, y: gy, w: 2.4, h: 0.38,
      fontFace: FONT, ...TYPE.cardTitle, color: C.white, valign: 'mid', align: 'right',
    });
    gy += 0.45;

    // Product rows
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
      // Use rolle/caseKort for description — more informative than generic role
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

  const cagrCards = [
    { label: 'CAGR pessimistisk', value: fmtPct(cagrLav), accentColor: C.salmon },
    { label: 'CAGR base', value: fmtPct(cagrBase), accentColor: C.accent },
    { label: 'CAGR optimistisk', value: fmtPct(cagrHoy), accentColor: C.green },
  ];
  addKpiRow(pptx, slide, cagrCards, 2.4, { h: 0.7 });

  // Line chart
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

  // Right side explanation box
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
  // Graph-driven, credible, fewer but stronger metrics
  // ══════════════════════════════════════════════════════════════
  pageNum++;
  slide = pptx.addSlide();
  slide.background = { color: C.white };
  addHeader(pptx, slide, 'Historikk og risikobilde', 'Dokumentert utvikling, risiko og nedsidebeskyttelse');

  // Line chart for portfolio historical performance (if data available)
  const hasHistoriskGraf = verdiutvikling?.length > 2;
  if (hasHistoriskGraf) {
    const grafLabels = verdiutvikling.map(d => String(d.year || d.dato || ''));
    const grafValues = verdiutvikling.map(d => d.total || d.verdi || 0);
    slide.addChart(pptx.ChartType.line, [{
      name: 'Porteføljeverdi',
      labels: grafLabels,
      values: grafValues,
    }], {
      x: 0.7, y: 1.3, w: 7.0, h: 2.8,
      showLegend: false, showTitle: false,
      lineDataSymbol: 'none',
      lineSmooth: true,
      lineSize: 2.5,
      chartColors: [C.navy],
      catAxisLabelFontFace: FONT, catAxisLabelFontSize: 7.5, catAxisLabelColor: C.muted,
      valAxisLabelFontFace: FONT, valAxisLabelFontSize: 7.5, valAxisLabelColor: C.muted,
      valAxisNumFmt: '#,##0',
      plotArea: { fill: { color: C.white } },
    });
  }

  // Right side: key risk metrics as stacked KPI cards
  const riskCardX = hasHistoriskGraf ? 8.1 : 0.7;
  const riskCardW = hasHistoriskGraf ? 4.5 : 11.9;
  const riskItems = [];
  if (historiskPortefolje?.aarligAvkastning != null) riskItems.push(['Annualisert avkastning', fmtPct(historiskPortefolje.aarligAvkastning), C.accent]);
  if (historiskPortefolje?.risiko != null) riskItems.push(['Volatilitet (ann.)', fmtPct(historiskPortefolje.risiko), C.salmon]);
  if (historiskPortefolje?.maxDrawdown != null) riskItems.push(['Maks drawdown', fmtPct(historiskPortefolje.maxDrawdown), C.red]);
  if (historiskPortefolje?.sharpe != null) riskItems.push(['Sharpe ratio', fmt(historiskPortefolje.sharpe, 2), C.teal]);
  if (historiskPortefolje?.besteAar != null) riskItems.push(['Beste år', fmtPct(historiskPortefolje.besteAar), C.green]);
  if (historiskPortefolje?.svaakesteAar != null) riskItems.push(['Svakeste år', fmtPct(historiskPortefolje.svaakesteAar), C.red]);

  if (riskItems.length > 0) {
    // Render as a compact metrics panel
    slide.addShape(pptx.ShapeType.roundRect, {
      x: riskCardX, y: 1.3, w: riskCardW, h: Math.min(riskItems.length * 0.46 + 0.5, 2.8),
      rectRadius: 0.08, fill: { color: C.lightBlue }, line: { color: C.line, pt: 0.5 },
    });
    slide.addText('Nøkkelmetrikker', {
      x: riskCardX + 0.15, y: 1.38, w: riskCardW - 0.3, h: 0.26,
      fontFace: FONT, ...TYPE.cardTitle, color: C.navy,
    });
    riskItems.slice(0, 6).forEach(([label, val, accentCol], i) => {
      const iy = 1.72 + i * 0.42;
      slide.addShape(pptx.ShapeType.rect, {
        x: riskCardX + 0.15, y: iy + 0.02, w: 0.05, h: 0.28,
        fill: { color: accentCol },
      });
      slide.addText(label, {
        x: riskCardX + 0.32, y: iy, w: riskCardW * 0.5, h: 0.32,
        fontFace: FONT, ...TYPE.bodySmall, color: C.muted, valign: 'mid',
      });
      slide.addText(String(val), {
        x: riskCardX + riskCardW * 0.55, y: iy, w: riskCardW * 0.38, h: 0.32,
        fontFace: FONT, ...TYPE.body, bold: true, color: C.navy, valign: 'mid', align: 'right',
      });
    });
  }

  // Compact historical returns table below the chart — only product names + key years
  const histYears = ['aar2025', 'aar2024', 'aar2023'];
  const histLabels = ['2025', '2024', '2023'];
  const histHeader = ['Produkt', ...histLabels, 'Årl. 3 år'];
  const histRows = produkterMedVekt.slice(0, 8).map(p => {
    const prod = produktMap[p.id] || p;
    return [
      (p.navn || p.id).replace('Pensum ', ''),
      ...histYears.map(y => fmtPct(prod[y])),
      fmtPct(prod.aarlig3ar),
    ];
  });

  // Add portfolio weighted row
  if (historiskPortefolje?.aarligAvkastning) {
    const portRow = ['Porteføljen (vektet)'];
    histYears.forEach(y => portRow.push(fmtPct(historiskPortefolje[y])));
    portRow.push(fmtPct(historiskPortefolje.aarligAvkastning));
    histRows.push(portRow);
  }

  if (histRows.length > 0) {
    const tableY = hasHistoriskGraf ? 4.3 : (riskItems.length > 0 ? 1.3 + riskItems.length * 0.46 + 0.7 : 1.3);
    const tData = buildTable(histHeader, histRows, {
      colAlign: [null, 'center', 'center', 'center', 'center'],
      colBold: { 4: true },
    });
    slide.addTable(tData, {
      x: 0.7, y: tableY, w: 11.9,
      border: { type: 'solid', pt: 0.5, color: C.line },
      rowH: 0.28, valign: 'mid',
      colW: [3.4, 2.0, 2.0, 2.0, 2.5],
      autoPageRepeatHeader: true,
    });
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
    slide.addText('Regioneksponering', {
      x: 0.7, y: 1.3, w: 5, h: 0.25,
      fontFace: FONT, ...TYPE.sectionTitle, color: C.navy,
    });
    addHBarChart(pptx, slide, regioner.map(r => ({ name: r.navn, value: r.vekt, color: C.accent })), 0.7, 1.65, 5.5, { labelW: 1.6 });
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

  // 3 reasons
  slide.addText('Tre hovedgrunner til denne sammensetningen', {
    x: 0.7, y: 4.5, w: 11.9, h: 0.3,
    fontFace: FONT, ...TYPE.sectionTitle, color: C.navy,
  });

  const reasons = [
    { title: 'Diversifisering', text: 'Porteføljen sprer risiko over flere aktivaklasser, regioner og forvaltere – og reduserer avhengigheten av enkelthendelser.' },
    { title: 'Kontantstrøm', text: 'Rentedelen sikrer løpende yield og bidrar til stabilitet, mens aksjedelen gir langsiktig vekst.' },
    { title: 'Tilpasset profil', text: `Sammensetningen er skreddersydd for ${risikoProfil.toLowerCase()} risikoprofil med ${horisont} års horisont.` },
  ];
  reasons.forEach((r, i) => {
    addNumberedCard(pptx, slide, 0.7 + i * 4.1, 4.9, 3.85, 1.5, i + 1, r.title, r.text);
  });

  addFooter(pptx, slide, String(pageNum));

  // ══════════════════════════════════════════════════════════════
  // SLIDE 8: PRODUKTOVERSIKT
  // Stram, nyttig, with investment case column
  // ══════════════════════════════════════════════════════════════
  pageNum++;
  slide = pptx.addSlide();
  slide.background = { color: C.white };
  addHeader(pptx, slide, 'Produktoversikt', 'Nøkkelegenskaper og investeringscase per produkt');

  const produktRows = produkterMedVekt.map(p => {
    const prod = produktMap[p.id] || p;
    // Use caseKort from master data for the investment case column
    const invCase = p.caseKort || prod.caseKort || p.pitch || p.rolle || '–';
    // Truncate long case text for table readability
    const caseTrunc = invCase.length > 80 ? invCase.slice(0, 77) + '...' : invCase;
    return [
      (p.navn || p.id),
      fmtPct(p.vekt),
      fmtPct(prod.forventetAvkastning ?? prod.expectedReturn),
      fmtPct(prod.forventetYield ?? prod.expectedYield),
      prod.likviditet || (prod.aktivatype === 'alternativ' ? 'Illikvid' : 'Daglig'),
      caseTrunc,
    ];
  });

  if (produktRows.length > 0) {
    const tData = buildTable(
      ['Produkt', 'Vekt', 'Forv. avk.', 'Yield', 'Likviditet', 'Investeringscase'],
      produktRows,
      { colAlign: [null, 'center', 'center', 'center', 'center', null] }
    );
    slide.addTable(tData, {
      x: 0.7, y: 1.3, w: 11.9,
      border: { type: 'solid', pt: 0.5, color: C.line },
      rowH: 0.38, valign: 'mid',
      colW: [2.2, 0.6, 0.75, 0.6, 0.9, 6.85],
      autoPageRepeatHeader: true,
    });
  }

  // Bottom: aktiva split donut + likviditet badge
  const aktivaDonutData = aktivaSplit.filter(a => a.value > 0).map(a => ({
    name: a.name, value: a.value, color: (AKTIVA_COLORS[a.name] || C.accent).replace('#', ''),
  }));
  if (aktivaDonutData.length > 0) {
    addDonutChart(pptx, slide, aktivaDonutData, 0.7, 5.0, { size: 1.5, legendW: 1.6 });
  }

  slide.addShape(pptx.ShapeType.roundRect, {
    x: 6.5, y: 5.45, w: 3.0, h: 0.45, rectRadius: 0.08,
    fill: { color: C.lightBlue }, line: { color: C.accent, pt: 1 },
  });
  slide.addText(`Likviditet: ${fmtPct(pensumLikviditet?.likvid)} likvid`, {
    x: 6.5, y: 5.45, w: 3.0, h: 0.45,
    fontFace: FONT, ...TYPE.body, color: C.navy, align: 'center', valign: 'mid',
  });

  addFooter(pptx, slide, String(pageNum));

  // ══════════════════════════════════════════════════════════════
  // SLIDE 9: MARKEDSKONTEKST
  // Concrete, credible — no placeholder feel
  // ══════════════════════════════════════════════════════════════
  pageNum++;
  slide = pptx.addSlide();
  slide.background = { color: C.white };
  addHeader(pptx, slide, 'Markedskontekst', 'Hvorfor en diversifisert portefølje gir mening nå');

  // 3 focused market observations (not 4 — tighter, more authoritative)
  const observations = [
    {
      title: 'Renter og pengepolitikk',
      text: 'Sentralbankene har justert pengepolitikken og rentetoppen synes nådd i de fleste utviklede markeder. Rentekutt gir medvind for obligasjoner og bedrer forutsetningene for aksjer. Nordisk høyrente tilbyr attraktive kredittspreader med lave misligholdsrater.',
      implication: 'Rentedelen i porteføljen er godt posisjonert for løpende avkastning og eventuell kursgevinst.',
    },
    {
      title: 'Globale aksjer og verdsettelse',
      text: 'Aksjemarkedene prises høyere enn historisk snitt, men med store variasjoner mellom regioner og sektorer. Teknologi og amerikanske storselskaper leder, mens europeiske og nordiske aksjer tilbyr mer attraktiv verdsettelse relativt til inntjening.',
      implication: 'Aktiv forvaltning og diversifisering mellom regioner kan utnytte prisforskjellene bedre enn indeksering.',
    },
    {
      title: 'Geopolitikk og usikkerhet',
      text: 'Geopolitisk usikkerhet, handelspolitiske endringer og inflasjonsdynamikk understreker behovet for en robust portefølje som tåler ulike utfall — ikke én bestemt markedsprognose.',
      implication: 'Porteføljens spredning over aktivaklasser, regioner og forvaltere gir beskyttelse mot konsentrasjonsrisiko.',
    },
  ];

  observations.forEach((obs, i) => {
    const oy = 1.35 + i * 1.6;
    const bgColor = i === 0 ? C.lightBlue : i === 1 ? C.warmGray : C.softGreen;
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.7, y: oy, w: 8.0, h: 1.35, rectRadius: 0.06,
      fill: { color: bgColor }, line: { color: C.line, pt: 0.5 },
    });
    // Title with accent bar
    slide.addShape(pptx.ShapeType.rect, {
      x: 0.85, y: oy + 0.12, w: 0.05, h: 0.28,
      fill: { color: i === 0 ? C.accent : i === 1 ? C.salmon : C.teal },
    });
    slide.addText(obs.title, {
      x: 1.05, y: oy + 0.08, w: 7.5, h: 0.3,
      fontFace: FONT, ...TYPE.cardTitle, color: C.navy,
    });
    slide.addText(obs.text, {
      x: 0.85, y: oy + 0.45, w: 7.7, h: 0.8,
      fontFace: FONT, ...TYPE.bodySmall, color: C.text, lineSpacingMultiple: 1.25,
    });
  });

  // Right side: Implikasjoner panel
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 9.0, y: 1.35, w: 3.6, h: 4.45, rectRadius: 0.08,
    fill: { color: C.navy },
  });
  slide.addText('Implikasjoner for porteføljen', {
    x: 9.2, y: 1.45, w: 3.2, h: 0.3,
    fontFace: FONT, ...TYPE.cardTitle, color: C.white,
  });
  slide.addShape(pptx.ShapeType.line, {
    x: 9.2, y: 1.82, w: 3.0, h: 0,
    line: { color: C.accent, pt: 1 },
  });

  observations.forEach((obs, i) => {
    const iy = 2.0 + i * 1.35;
    const accentCol = i === 0 ? C.accent : i === 1 ? C.salmon : C.teal;
    slide.addShape(pptx.ShapeType.rect, {
      x: 9.2, y: iy + 0.02, w: 0.04, h: 0.85,
      fill: { color: accentCol },
    });
    slide.addText(obs.implication, {
      x: 9.4, y: iy, w: 3.0, h: 0.95,
      fontFace: FONT, ...TYPE.bodySmall, color: C.white, lineSpacingMultiple: 1.3, valign: 'top',
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
    slide.addShape(pptx.ShapeType.roundRect, {
      x: px, y: py, w: 5.9, h: 1.9, rectRadius: 0.08,
      fill: { color: C.lightBlue }, line: { color: C.line, pt: 0.5 },
    });
    const initials = person.name.split(' ').map(n => n[0]).join('').slice(0, 2);
    slide.addShape(pptx.ShapeType.ellipse, {
      x: px + 0.2, y: py + 0.3, w: 0.7, h: 0.7,
      fill: { color: C.navy },
    });
    slide.addText(initials, {
      x: px + 0.2, y: py + 0.3, w: 0.7, h: 0.7,
      fontFace: FONT, fontSize: 16, bold: true, color: C.white, align: 'center', valign: 'mid',
    });
    slide.addText(person.name, {
      x: px + 1.1, y: py + 0.2, w: 4.6, h: 0.28,
      fontFace: FONT, fontSize: 12, bold: true, color: C.navy,
    });
    slide.addText(person.rolle, {
      x: px + 1.1, y: py + 0.5, w: 4.6, h: 0.22,
      fontFace: FONT, ...TYPE.body, color: C.accent, bold: true,
    });
    slide.addText(person.area, {
      x: px + 1.1, y: py + 0.8, w: 4.6, h: 0.22,
      fontFace: FONT, ...TYPE.bodySmall, color: C.text,
    });
    slide.addText(person.bg, {
      x: px + 1.1, y: py + 1.1, w: 4.6, h: 0.22,
      fontFace: FONT, ...TYPE.bodySmall, color: C.muted, italic: true,
    });
  });

  // Decision process box
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.7, y: 5.9, w: 11.9, h: 0.6, rectRadius: 0.06,
    fill: { color: C.warmGray }, line: { color: C.line, pt: 0.5 },
  });
  slide.addText('Hvordan investeringsbeslutninger tas', {
    x: 0.9, y: 5.92, w: 3.5, h: 0.24,
    fontFace: FONT, ...TYPE.body, bold: true, color: C.navy,
  });
  slide.addText('Alle porteføljebeslutninger fattes i investeringskomitéen. Porteføljene rebalanseres regelmessig, med løpende overvåking av risiko, eksponering og markedsutsikter.', {
    x: 0.9, y: 6.18, w: 11.5, h: 0.28,
    fontFace: FONT, ...TYPE.caption, color: C.text,
  });

  addFooter(pptx, slide, String(pageNum));

  // ══════════════════════════════════════════════════════════════
  // SLIDE 11: OPPFØLGING OG RAPPORTERING
  // Premium, substantive — not a feature list
  // ══════════════════════════════════════════════════════════════
  pageNum++;
  slide = pptx.addSlide();
  slide.background = { color: C.white };
  addHeader(pptx, slide, 'Oppfølging og rapportering', 'Hva du får tilgang til etter at pengene er investert');

  // Main: 2 rows × 3 columns — premium feature cards
  const reportingFeatures = [
    { title: 'Daglig porteføljeoversikt', desc: 'Logg inn med BankID og se porteføljens utvikling i sanntid – alltid oppdatert med netto avkastning etter alle kostnader.', accent: C.accent },
    { title: 'Transaksjoner og bevegelser', desc: 'Full oversikt over alle kjøp, salg, rebalanseringer og utbytter. Alt dokumentert og sporbart.', accent: C.salmon },
    { title: 'Allokering og mandatetterlevelse', desc: 'Løpende visning av aktivafordeling og produktvekter relativt til mandatet. Avvik flagges og følges opp.', accent: C.teal },
    { title: 'Samlet kundevisning', desc: 'Se alle dine porteføljer, konti og kundeforhold samlet i ett grensesnitt med helhetlig oversikt.', accent: C.navy },
    { title: 'Skatterapportering', desc: 'Årlig skatterapport med oversikt over realisert gevinst, tap, utbytte og relevante beløp til selvangivelsen.', accent: C.gold },
    { title: 'Markedsbrev og oppdateringer', desc: 'Regelmessige markedskommentarer, porteføljegjennomganger og videooppdateringer fra forvalterteamet.', accent: C.green },
  ];

  reportingFeatures.forEach((feat, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const fx = 0.7 + col * 4.1;
    const fy = 1.35 + row * 1.65;
    slide.addShape(pptx.ShapeType.roundRect, {
      x: fx, y: fy, w: 3.85, h: 1.4, rectRadius: 0.06,
      fill: { color: C.white },
      line: { color: C.line, pt: 0.5 },
      shadow: { type: 'outer', blur: 3, offset: 1, opacity: 0.06, color: '000000' },
    });
    // Left accent bar
    slide.addShape(pptx.ShapeType.rect, {
      x: fx + 0.08, y: fy + 0.12, w: 0.05, h: 0.28,
      fill: { color: feat.accent },
    });
    slide.addText(feat.title, {
      x: fx + 0.22, y: fy + 0.1, w: 3.48, h: 0.3,
      fontFace: FONT, ...TYPE.cardTitle, color: C.navy,
    });
    slide.addText(feat.desc, {
      x: fx + 0.15, y: fy + 0.48, w: 3.55, h: 0.82,
      fontFace: FONT, ...TYPE.bodySmall, color: C.text, lineSpacingMultiple: 1.25,
    });
  });

  // Bottom strip: communication cadence
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.7, y: 4.8, w: 11.9, h: 1.65, rectRadius: 0.06,
    fill: { color: C.lightBlue }, line: { color: C.line, pt: 0.5 },
  });
  slide.addText('Løpende kommunikasjon og kontaktpunkter', {
    x: 0.9, y: 4.88, w: 11.5, h: 0.28,
    fontFace: FONT, ...TYPE.sectionTitle, color: C.navy,
  });

  const commItems = [
    { label: 'Oppstartsgjennomgang', desc: 'Detaljert gjennomgang av mandat, portefølje og forventninger ved oppstart' },
    { label: 'Kvartalsrapport', desc: 'Skriftlig oppsummering av utvikling, endringer og markedsutsikter' },
    { label: 'Årlig strategimøte', desc: 'Grundig gjennomgang av portefølje, mål, risiko og eventuelle tilpasninger' },
    { label: 'Løpende tilgjengelighet', desc: 'Din rådgiver er tilgjengelig for spørsmål og dialog gjennom året' },
  ];
  commItems.forEach((item, i) => {
    const cx = 0.9 + i * 3.0;
    slide.addText(item.label, {
      x: cx, y: 5.22, w: 2.7, h: 0.24,
      fontFace: FONT, ...TYPE.body, bold: true, color: C.navy,
    });
    slide.addText(item.desc, {
      x: cx, y: 5.5, w: 2.7, h: 0.8,
      fontFace: FONT, ...TYPE.bodySmall, color: C.text, lineSpacingMultiple: 1.2,
    });
  });

  addFooter(pptx, slide, String(pageNum));

  // ══════════════════════════════════════════════════════════════
  // SLIDE 12: NESTE STEG OG VIKTIG INFORMASJON
  // Neste steg = primary focus. Disclaimers compressed.
  // ══════════════════════════════════════════════════════════════
  pageNum++;
  slide = pptx.addSlide();
  slide.background = { color: C.white };
  addHeader(pptx, slide, 'Neste steg', 'Veien videre mot en ferdig investeringsløsning');

  // Neste steg — LEFT SIDE, primary, prominent
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.7, y: 1.3, w: 7.0, h: 4.5, rectRadius: 0.1,
    fill: { color: C.lightBlue }, line: { color: C.accent, pt: 1.5 },
  });

  const steps = [
    { num: '1', title: 'Gjennomgang av forslaget', desc: 'Vi gjennomgår denne presentasjonen sammen og diskuterer dine mål, preferanser og eventuelle spørsmål.' },
    { num: '2', title: 'Tilpasning og justering', desc: 'Allokering, produktvalg, risikoprofil og horisont justeres etter samtale, slik at løsningen er skreddersydd for deg.' },
    { num: '3', title: 'Kundeetablering', desc: 'Formell prosess med egnethetsvurdering, KYC og avtaleverk i henhold til gjeldende regelverk. Alt håndteres digitalt.' },
    { num: '4', title: 'Implementering og oppstart', desc: 'Porteføljen settes opp, du får tilgang til løpende rapportering, og vi etablerer en fast kommunikasjonsrytme.' },
  ];

  steps.forEach((step, i) => {
    const sy = 1.55 + i * 1.02;
    addStepItem(pptx, slide, 1.0, sy, step.num, step.title, step.desc, {
      titleW: 5.8, descW: 5.8, descH: 0.5,
    });
    // Connecting line between steps (except last)
    if (i < steps.length - 1) {
      slide.addShape(pptx.ShapeType.line, {
        x: 1.16, y: sy + 0.42, w: 0, h: 0.5,
        line: { color: C.accent, pt: 1, dashType: 'dash' },
      });
    }
  });

  // Right side: Compressed disclaimers
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 8.1, y: 1.3, w: 4.5, h: 4.5, rectRadius: 0.08,
    fill: { color: C.warmGray }, line: { color: C.line, pt: 0.5 },
  });
  slide.addText('Viktig informasjon', {
    x: 8.3, y: 1.4, w: 4.1, h: 0.3,
    fontFace: FONT, ...TYPE.cardTitle, color: C.navy,
  });
  slide.addShape(pptx.ShapeType.line, {
    x: 8.3, y: 1.75, w: 3.8, h: 0,
    line: { color: C.line, pt: 0.5 },
  });

  const disclaimers = [
    'Denne presentasjonen er en illustrativ investeringsskisse og utgjør ikke personlig investeringsråd eller en individuell egnethetsvurdering.',
    'Historisk avkastning er ingen garanti for fremtidig avkastning. Verdien av investeringer kan gå ned så vel som opp.',
    'Før kundeetablering gjennomføres en fullstendig egnethetsvurdering og KYC-prosess.',
    'Alle avkastningstall er oppgitt brutto med mindre annet er spesifisert.',
    'Pensum Asset Management AS har konsesjon fra Finanstilsynet til å drive investeringsrådgivning og aktiv porteføljeforvaltning.',
  ];
  disclaimers.forEach((d, i) => {
    const dy = 1.88 + i * 0.48;
    slide.addText(`${i + 1}.`, {
      x: 8.3, y: dy, w: 0.25, h: 0.42,
      fontFace: FONT, ...TYPE.caption, color: C.navy, bold: true, valign: 'top',
    });
    slide.addText(d, {
      x: 8.6, y: dy, w: 3.8, h: 0.44,
      fontFace: FONT, ...TYPE.caption, color: C.text, lineSpacingMultiple: 1.15, valign: 'top',
    });
  });

  // Bottom contact bar — full width, authoritative close
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.7, y: 6.0, w: 11.9, h: 0.55, rectRadius: 0.08,
    fill: { color: C.navy },
  });
  slide.addText('Ta kontakt med din rådgiver i Pensum Asset Management for å komme i gang.', {
    x: 0.9, y: 6.02, w: 7.5, h: 0.25,
    fontFace: FONT, ...TYPE.bodyLarge, bold: true, color: C.white,
  });
  slide.addText('www.pensumgroup.no  |  post@pensumgroup.no  |  +47 22 01 27 00', {
    x: 0.9, y: 6.28, w: 11.5, h: 0.2,
    fontFace: FONT, ...TYPE.body, color: C.accent,
  });

  addFooter(pptx, slide, String(pageNum));

  // ─── GENERATE BUFFER ───
  const buffer = await pptx.write({ outputType: 'nodebuffer' });
  return buffer;
}

export default generateProposal10SlidePptx;
