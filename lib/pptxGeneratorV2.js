import pptxgen from 'pptxgenjs';

const COLORS = {
  navy: '0D2841',
  blue: '012441',
  accent: '6B9DB8',
  salmon: 'C4967E',
  teal: '2D6A6A',
  lightBlue: 'E8F0F4',
  lightGray: 'F5F5F5',
  text: '262626',
  muted: '4A5568',
  line: 'D1D5DB',
  white: 'FFFFFF',
  gold: 'A67B3D',
};

const PRODUCT_COLORS = ['0D2841', '6B9DB8', 'C4967E', '2D6A6A', 'A67B3D', '5B4FA0', '2D6A4F'];

function addHeader(pptx, slide, title, subtitle = '') {
  // Navy accent stripe at top
  slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 0.12, h: 7.5, fill: { color: COLORS.navy } });
  slide.addText(title, { x: 0.7, y: 0.35, w: 11.5, h: 0.45, fontFace: 'Merriweather Sans', fontSize: 22, bold: true, color: COLORS.navy });
  if (subtitle) slide.addText(subtitle, { x: 0.7, y: 0.82, w: 11.5, h: 0.22, fontFace: 'Merriweather Sans', fontSize: 10, color: COLORS.muted });
  slide.addShape(pptx.ShapeType.line, { x: 0.7, y: 1.12, w: 11.9, h: 0, line: { color: COLORS.line, pt: 1 } });
}

function addFooter(pptx, slide, pageNum = '') {
  // Footer line + text
  slide.addShape(pptx.ShapeType.line, { x: 0.7, y: 6.75, w: 11.9, h: 0, line: { color: COLORS.line, pt: 0.5 } });
  slide.addText('Illustrativ modellportefølje – ikke personlig investeringsråd eller egnethetsvurdering.', {
    x: 0.7, y: 6.82, w: 9, h: 0.18, fontFace: 'Merriweather Sans', fontSize: 7, color: COLORS.muted,
  });
  slide.addText('Pensum Asset Management AS', {
    x: 10.2, y: 6.82, w: 2.8, h: 0.18, fontFace: 'Merriweather Sans', fontSize: 7, color: COLORS.muted, align: 'right',
  });
  if (pageNum) {
    slide.addText(pageNum, { x: 12.5, y: 6.82, w: 0.5, h: 0.18, fontFace: 'Merriweather Sans', fontSize: 7, color: COLORS.muted, align: 'right' });
  }
}

function addBullets(slide, items, x, y, w, opts = {}) {
  const runs = [];
  items.filter(Boolean).forEach((item, idx) => {
    if (idx > 0) runs.push({ text: '\n', options: { breakLine: true, fontSize: 6 } });
    runs.push({ text: `•  ${item}`, options: { breakLine: true } });
  });
  slide.addText(runs, {
    x, y, w, h: opts.h || 2.5,
    fontFace: 'Merriweather Sans', fontSize: opts.fontSize || 11, color: COLORS.text,
    valign: 'top', lineSpacingMultiple: 1.3,
  });
}

function addKpiCards(pptx, slide, metrics = [], y = 1.5, opts = {}) {
  const count = Math.min(metrics.length, 4);
  if (count === 0) return;
  const totalW = opts.totalW || 11.5;
  const gap = 0.2;
  const width = (totalW - gap * (count - 1)) / count;
  const startX = opts.startX || 0.7;

  metrics.slice(0, count).forEach((metric, idx) => {
    const x = startX + idx * (width + gap);
    // Card background
    slide.addShape(pptx.ShapeType.roundRect, {
      x, y, w: width, h: 0.95, rectRadius: 0.06,
      fill: { color: COLORS.lightBlue },
      line: { color: COLORS.line, pt: 0.5 },
      shadow: { type: 'outer', blur: 3, offset: 1, opacity: 0.1, color: '000000' },
    });
    // Accent bar at top of card
    slide.addShape(pptx.ShapeType.rect, {
      x: x + 0.1, y: y + 0.06, w: width - 0.2, h: 0.04,
      fill: { color: metric.color || COLORS.accent },
    });
    // Label
    slide.addText(metric.label || 'KPI', {
      x: x + 0.15, y: y + 0.18, w: width - 0.3, h: 0.18,
      fontFace: 'Merriweather Sans', fontSize: 9, color: COLORS.muted,
    });
    // Value
    slide.addText(metric.value || '–', {
      x: x + 0.15, y: y + 0.4, w: width - 0.3, h: 0.35,
      fontFace: 'Merriweather Sans', fontSize: 20, bold: true, color: COLORS.navy,
    });
  });
}

function addDonutChart(pptx, slide, data, x, y, opts = {}) {
  const size = opts.size || 2.2;
  const total = data.reduce((s, d) => s + d.value, 0) || 1;

  // Draw donut segments as colored arcs
  // Since pptxgenjs doesn't have native donut charts, we'll use a pie chart
  slide.addChart(pptx.ChartType.doughnut, [{
    name: opts.title || 'Fordeling',
    labels: data.map(d => d.name),
    values: data.map(d => d.value),
  }], {
    x, y, w: size, h: size,
    showLegend: false,
    showTitle: false,
    showValue: false,
    showPercent: false,
    showLabel: false,
    holeSize: 55,
    chartColors: data.map((d, i) => String(d.color || PRODUCT_COLORS[i % PRODUCT_COLORS.length])),
    border: { pt: 0 },
    shadow: { type: 'none' },
  });

  // Legend to the right of chart
  if (opts.showLegend !== false) {
    const legendX = x + size + 0.2;
    const legendY = y + 0.3;
    data.forEach((d, i) => {
      const ly = legendY + i * 0.3;
      slide.addShape(pptx.ShapeType.ellipse, {
        x: legendX, y: ly + 0.04, w: 0.14, h: 0.14,
        fill: { color: d.color || PRODUCT_COLORS[i % PRODUCT_COLORS.length] },
      });
      slide.addText(d.name, {
        x: legendX + 0.22, y: ly, w: opts.legendW || 2.2, h: 0.22,
        fontFace: 'Merriweather Sans', fontSize: 9, color: COLORS.text,
      });
      slide.addText(`${d.value.toFixed(1)}%`, {
        x: legendX + (opts.legendW || 2.2) + 0.1, y: ly, w: 0.7, h: 0.22,
        fontFace: 'Merriweather Sans', fontSize: 9, bold: true, color: COLORS.navy, align: 'right',
      });
    });
  }
}

function addHorizontalBar(pptx, slide, data, x, y, w, opts = {}) {
  const barH = 0.28;
  const gap = 0.08;
  const maxVal = opts.maxVal || Math.max(...data.map(d => d.value), 1);
  const labelW = opts.labelW || 2.0;

  data.forEach((d, i) => {
    const cy = y + i * (barH + gap);
    // Label
    slide.addText(d.name, {
      x, y: cy, w: labelW, h: barH,
      fontFace: 'Merriweather Sans', fontSize: 9, color: COLORS.text, align: 'left', valign: 'mid',
    });
    // Background bar
    slide.addShape(pptx.ShapeType.roundRect, {
      x: x + labelW + 0.1, y: cy + 0.04, w: w - labelW - 0.1, h: barH - 0.08,
      rectRadius: 0.04, fill: { color: COLORS.lightGray },
    });
    // Value bar
    const barW = Math.max(0.05, ((d.value / maxVal) * (w - labelW - 0.1)));
    slide.addShape(pptx.ShapeType.roundRect, {
      x: x + labelW + 0.1, y: cy + 0.04, w: barW, h: barH - 0.08,
      rectRadius: 0.04, fill: { color: d.color || COLORS.accent },
    });
    // Value text
    slide.addText(`${d.value.toFixed(1)}%`, {
      x: x + w - 0.8, y: cy, w: 0.8, h: barH,
      fontFace: 'Merriweather Sans', fontSize: 8, bold: true, color: COLORS.navy, align: 'right', valign: 'mid',
    });
  });
}

export async function generateProposalPptxV2(model) {
  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_WIDE';
  pptx.author = 'Pensum Asset Management';
  pptx.company = 'Pensum Asset Management AS';
  pptx.subject = 'Illustrativ investeringsskisse';
  pptx.title = `Pensum – ${model?.meta?.customerName || 'Kunde'}`;
  pptx.lang = 'nb-NO';
  pptx.theme = { headFontFace: 'Aptos', bodyFontFace: 'Aptos' };

  let slide;
  let pageNum = 0;

  // ─── SLIDE 1: POLISHED COVER ───
  slide = pptx.addSlide();
  slide.background = { color: COLORS.white };
  // Navy left accent band
  slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 0.35, h: 7.5, fill: { color: COLORS.navy } });
  // Accent stripe
  slide.addShape(pptx.ShapeType.rect, { x: 0.35, y: 0, w: 0.06, h: 7.5, fill: { color: COLORS.accent } });
  // Title block
  slide.addText('Illustrativ\ninvesteringsskisse', {
    x: 1.2, y: 1.5, w: 7, h: 1.4,
    fontFace: 'Merriweather Sans', fontSize: 36, bold: true, color: COLORS.navy,
    lineSpacingMultiple: 1.1,
  });
  // Separator line
  slide.addShape(pptx.ShapeType.line, { x: 1.2, y: 3.1, w: 3, h: 0, line: { color: COLORS.accent, pt: 2 } });
  // Subtitle
  slide.addText(`Utarbeidet for ${model?.meta?.customerName || 'Kunde'}`, {
    x: 1.2, y: 3.4, w: 7, h: 0.3,
    fontFace: 'Merriweather Sans', fontSize: 14, color: COLORS.text,
  });
  slide.addText(`Pensum Asset Management AS  |  ${model?.meta?.reportDate || ''}`, {
    x: 1.2, y: 3.85, w: 7, h: 0.25,
    fontFace: 'Merriweather Sans', fontSize: 10, color: COLORS.muted,
  });
  // Right-side info cards
  const infoY = 1.5;
  const infoCards = [
    { label: 'Risikoprofil', value: model?.meta?.riskProfile || 'Balansert' },
    { label: 'Investert beløp', value: model?.meta?.investmentAmount ? `kr ${Number(model.meta.investmentAmount).toLocaleString('nb-NO')}` : '–' },
    { label: 'Antall produkter', value: String(model?.overview?.totalProducts || 0) },
  ];
  infoCards.forEach((card, i) => {
    const cy = infoY + i * 1.2;
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 9.2, y: cy, w: 3.5, h: 0.9, rectRadius: 0.06,
      fill: { color: COLORS.lightBlue }, line: { color: COLORS.line, pt: 0.5 },
    });
    slide.addText(card.label, { x: 9.4, y: cy + 0.12, w: 3.1, h: 0.18, fontFace: 'Merriweather Sans', fontSize: 9, color: COLORS.muted });
    slide.addText(card.value, { x: 9.4, y: cy + 0.38, w: 3.1, h: 0.32, fontFace: 'Merriweather Sans', fontSize: 18, bold: true, color: COLORS.navy });
  });
  addFooter(pptx, slide);

  // ─── SLIDE 2: EXECUTIVE SUMMARY ───
  pageNum++;
  slide = pptx.addSlide();
  slide.background = { color: COLORS.white };
  addHeader(pptx, slide, 'Executive summary', 'Hovedtrekk i den illustrerte porteføljesammensetningen');
  addKpiCards(pptx, slide, [
    { label: 'Risikoprofil', value: model?.meta?.riskProfile || 'Balansert', color: COLORS.navy },
    { label: 'Antall produkter', value: String(model?.overview?.totalProducts || 0), color: COLORS.accent },
    { label: 'Planlagte slides', value: String(model?.overview?.plannedProductSlides || 0), color: COLORS.teal },
  ], 1.35);
  addBullets(slide, model.executiveSummary || [], 0.9, 2.7, 10.8);
  addFooter(pptx, slide, String(pageNum));

  // ─── SLIDE 3: PORTFOLIO OVERVIEW WITH DONUT ───
  pageNum++;
  slide = pptx.addSlide();
  slide.background = { color: COLORS.white };
  addHeader(pptx, slide, 'Porteføljesammensetning', 'Allokering per produkt med tilhørende rolle');

  // Donut chart - left side
  const productData = (model.productNodes || []).filter(p => p.weight > 0).map((p, i) => ({
    name: p.name,
    value: p.weight * 100,
    color: PRODUCT_COLORS[i % PRODUCT_COLORS.length],
  }));
  if (productData.length > 0) {
    addDonutChart(pptx, slide, productData, 0.7, 1.5, { size: 2.8, legendW: 2.8 });
  }

  // Table - right side
  const tableRows = (model.productNodes || []).map((p, i) => [
    { text: p.name, options: { fontFace: 'Merriweather Sans', fontSize: 10, color: COLORS.text, bold: true } },
    { text: `${(p.weight * 100).toFixed(1)}%`, options: { fontFace: 'Merriweather Sans', fontSize: 10, color: COLORS.navy, bold: true, align: 'center' } },
    { text: p.roleInPortfolio || '–', options: { fontFace: 'Merriweather Sans', fontSize: 9, color: COLORS.muted } },
    { text: p.benchmark || '–', options: { fontFace: 'Merriweather Sans', fontSize: 9, color: COLORS.muted } },
  ]);
  const headerRow = [
    { text: 'Produkt', options: { fontFace: 'Merriweather Sans', fontSize: 9, bold: true, color: COLORS.white, fill: { color: COLORS.navy } } },
    { text: 'Vekt', options: { fontFace: 'Merriweather Sans', fontSize: 9, bold: true, color: COLORS.white, fill: { color: COLORS.navy }, align: 'center' } },
    { text: 'Rolle', options: { fontFace: 'Merriweather Sans', fontSize: 9, bold: true, color: COLORS.white, fill: { color: COLORS.navy } } },
    { text: 'Benchmark', options: { fontFace: 'Merriweather Sans', fontSize: 9, bold: true, color: COLORS.white, fill: { color: COLORS.navy } } },
  ];
  slide.addTable([headerRow, ...tableRows], {
    x: 6.8, y: 1.4, w: 5.9,
    border: { type: 'solid', pt: 0.5, color: COLORS.line },
    fill: COLORS.white,
    fontFace: 'Merriweather Sans',
    fontSize: 10,
    rowH: 0.36,
    valign: 'mid',
    colW: [2.0, 0.7, 1.5, 1.7],
    autoPageRepeatHeader: true,
  });
  addFooter(pptx, slide, String(pageNum));

  // ─── PRODUCT SLIDES ───
  for (const product of model.productNodes || []) {
    pageNum++;
    const [focus1, focus2, focus3] = product.blueprint?.narrativeFocus || [];
    slide = pptx.addSlide();
    slide.background = { color: COLORS.white };
    addHeader(pptx, slide, product.slideTitle || product.name, product.slideSubtitle || 'Rolle i porteføljen');

    // KPI cards
    addKpiCards(pptx, slide, product.topMetrics || [], 1.35);

    // Two-column layout: narrative left, info box right
    addBullets(slide, [
      product.pitchShort,
      product.investmentCase,
      focus1 && `Fremhever ${focus1}.`,
      focus2 && `Bidrar med ${focus2}.`,
      focus3 && `Rollen i porteføljen er knyttet til ${focus3}.`,
    ], 0.9, 2.65, 7.2, { h: 3.5 });

    // Right side: product info card
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 8.5, y: 2.65, w: 4.2, h: 3.2, rectRadius: 0.08,
      fill: { color: COLORS.lightBlue }, line: { color: COLORS.line, pt: 0.5 },
    });
    slide.addText('Nøkkelinformasjon', {
      x: 8.7, y: 2.75, w: 3.8, h: 0.28,
      fontFace: 'Merriweather Sans', fontSize: 11, bold: true, color: COLORS.navy,
    });
    const infoItems = [
      ['Kategori', product.categoryKey || '–'],
      ['Benchmark', product.benchmark || '–'],
      ['Vekt', `${(product.weight * 100).toFixed(1)}%`],
      ['Rolle', product.roleInPortfolio || '–'],
    ];
    infoItems.forEach(([label, val], i) => {
      const iy = 3.15 + i * 0.55;
      slide.addText(label, { x: 8.7, y: iy, w: 1.5, h: 0.2, fontFace: 'Merriweather Sans', fontSize: 9, color: COLORS.muted });
      slide.addText(val, { x: 8.7, y: iy + 0.2, w: 3.8, h: 0.22, fontFace: 'Merriweather Sans', fontSize: 10, bold: true, color: COLORS.navy });
    });

    addFooter(pptx, slide, String(pageNum));

    // ─── PRODUCT DATA SLIDE (if slideCount > 1) ───
    if ((product.blueprint?.slideCount || 0) > 1) {
      pageNum++;
      slide = pptx.addSlide();
      slide.background = { color: COLORS.white };
      addHeader(pptx, slide, `${product.name} – nøkkeltall`, 'Eksponering, sektorer og historisk utvikling');

      // Create placeholder chart areas with structure
      const chartTypes = product.blueprint?.preferredCharts || [];

      // 2x2 grid of chart placeholders
      const positions = [
        { x: 0.7, y: 1.4, w: 5.5, h: 2.4, label: chartTypes[0] || 'Allokering' },
        { x: 6.7, y: 1.4, w: 5.5, h: 2.4, label: chartTypes[1] || 'Regioner' },
        { x: 0.7, y: 4.0, w: 5.5, h: 2.4, label: chartTypes[2] || 'Sektorer' },
        { x: 6.7, y: 4.0, w: 5.5, h: 2.4, label: chartTypes[3] || 'Historikk' },
      ];

      positions.forEach((pos) => {
        // Card background
        slide.addShape(pptx.ShapeType.roundRect, {
          x: pos.x, y: pos.y, w: pos.w, h: pos.h, rectRadius: 0.06,
          fill: { color: COLORS.lightGray }, line: { color: COLORS.line, pt: 0.5 },
        });
        // Chart type label
        slide.addText(pos.label.charAt(0).toUpperCase() + pos.label.slice(1), {
          x: pos.x + 0.15, y: pos.y + 0.1, w: pos.w - 0.3, h: 0.25,
          fontFace: 'Merriweather Sans', fontSize: 10, bold: true, color: COLORS.navy,
        });
        // Placeholder text
        slide.addText('Data kobles fra Morningstar / intern kilde', {
          x: pos.x + 0.15, y: pos.y + pos.h / 2 - 0.1, w: pos.w - 0.3, h: 0.25,
          fontFace: 'Merriweather Sans', fontSize: 9, color: COLORS.muted, align: 'center',
        });
      });

      addFooter(pptx, slide, String(pageNum));
    }
  }

  // ─── FINAL SLIDE: SUMMARY & NEXT STEPS ───
  pageNum++;
  slide = pptx.addSlide();
  slide.background = { color: COLORS.white };
  addHeader(pptx, slide, 'Oppsummering og neste steg', 'Forslaget er illustrativt og må kvalitetssikres i rådgiverløpet');

  // Numbered steps with accent
  const steps = [
    'Gjennomgå foreslått sammensetning og eventuelle kundespesifikke preferanser.',
    'Oppdater porteføljevekter, produktinnhold og relevante forutsetninger ved behov.',
    'Ved videre prosess må løsningene vurderes i en full kundeetablering og egnethetsvurdering.',
  ];
  steps.forEach((step, i) => {
    const sy = 1.5 + i * 1.1;
    // Number circle
    slide.addShape(pptx.ShapeType.ellipse, {
      x: 0.9, y: sy, w: 0.4, h: 0.4,
      fill: { color: COLORS.navy },
    });
    slide.addText(String(i + 1), {
      x: 0.9, y: sy, w: 0.4, h: 0.4,
      fontFace: 'Merriweather Sans', fontSize: 14, bold: true, color: COLORS.white, align: 'center', valign: 'mid',
    });
    // Step text
    slide.addText(step, {
      x: 1.55, y: sy + 0.03, w: 10.5, h: 0.4,
      fontFace: 'Merriweather Sans', fontSize: 12, color: COLORS.text,
    });
  });

  // Contact info box at bottom
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.7, y: 5.2, w: 11.9, h: 1.0, rectRadius: 0.08,
    fill: { color: COLORS.lightBlue }, line: { color: COLORS.line, pt: 0.5 },
  });
  slide.addText('Kontakt din rådgiver i Pensum Asset Management for videre oppfølging.', {
    x: 0.9, y: 5.35, w: 11.5, h: 0.25,
    fontFace: 'Merriweather Sans', fontSize: 11, bold: true, color: COLORS.navy,
  });
  slide.addText('www.pensumgroup.no  |  post@pensumgroup.no', {
    x: 0.9, y: 5.7, w: 11.5, h: 0.2,
    fontFace: 'Merriweather Sans', fontSize: 9, color: COLORS.muted,
  });

  addFooter(pptx, slide, String(pageNum));

  const buffer = await pptx.write({ outputType: 'nodebuffer' });
  return buffer;
}

export default generateProposalPptxV2;
