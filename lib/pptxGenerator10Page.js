import pptxgen from 'pptxgenjs';

// ═══════════════════════════════════════════════════════════════════
// Pensum Asset Management – 10-Page Premium Proposal Generator
// ═══════════════════════════════════════════════════════════════════

const COLORS = {
  navy: '0D2841',
  darkBlue: '012441',
  accent: '6B9DB8',
  salmon: 'C4967E',
  teal: '2D6A6A',
  gold: 'A67B3D',
  purple: '5B4FA0',
  lightBlue: 'E8F0F4',
  lightGray: 'F5F5F5',
  text: '262626',
  muted: '4A5568',
  line: 'D1D5DB',
  white: 'FFFFFF',
  midBlue: '123C6A',
};

const PRODUCT_COLORS = ['0D2841', '6B9DB8', 'C4967E', '2D6A6A', 'A67B3D', '5B4FA0', '123C6A'];

const FONT = 'Aptos';

// ─── Helpers ─────────────────────────────────────────────────────

function safe(val, fallback = null) {
  if (val === undefined || val === null || (typeof val === 'number' && isNaN(val))) return fallback;
  return val;
}

function fmtNum(n, decimals = 0) {
  const v = safe(n);
  if (v === null) return '–';
  return Number(v).toLocaleString('nb-NO', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function fmtKr(n) {
  const v = safe(n);
  if (v === null) return '–';
  return `kr ${fmtNum(v)}`;
}

function fmtPct(n, decimals = 1) {
  const v = safe(n);
  if (v === null) return '–';
  return `${fmtNum(v, decimals)} %`;
}

function todayFormatted() {
  const d = new Date();
  const months = ['januar', 'februar', 'mars', 'april', 'mai', 'juni',
    'juli', 'august', 'september', 'oktober', 'november', 'desember'];
  return `${d.getDate()}. ${months[d.getMonth()]} ${d.getFullYear()}`;
}

// ─── Layout primitives ──────────────────────────────────────────

function addHeader(pptx, slide, title, subtitle = '') {
  // Left navy accent stripe
  slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 0.12, h: 7.5, fill: { color: COLORS.navy } });
  // Salmon thin accent next to navy
  slide.addShape(pptx.ShapeType.rect, { x: 0.12, y: 0, w: 0.04, h: 7.5, fill: { color: COLORS.salmon } });

  slide.addText(title, {
    x: 0.7, y: 0.32, w: 11.5, h: 0.48,
    fontFace: FONT, fontSize: 22, bold: true, color: COLORS.navy,
  });
  if (subtitle) {
    slide.addText(subtitle, {
      x: 0.7, y: 0.82, w: 11.5, h: 0.22,
      fontFace: FONT, fontSize: 10, color: COLORS.muted,
    });
  }
  slide.addShape(pptx.ShapeType.line, {
    x: 0.7, y: 1.12, w: 11.93, h: 0,
    line: { color: COLORS.line, pt: 1 },
  });
}

function addFooter(pptx, slide, pageNum = '') {
  slide.addShape(pptx.ShapeType.line, {
    x: 0.7, y: 6.78, w: 11.93, h: 0,
    line: { color: COLORS.line, pt: 0.5 },
  });
  slide.addText('Illustrativ modellportefolje – ikke personlig investeringsrad eller egnethetsvurdering.', {
    x: 0.7, y: 6.85, w: 9, h: 0.18,
    fontFace: FONT, fontSize: 7, color: COLORS.muted,
  });
  slide.addText('Pensum Asset Management AS', {
    x: 10.2, y: 6.85, w: 2.5, h: 0.18,
    fontFace: FONT, fontSize: 7, color: COLORS.muted, align: 'right',
  });
  if (pageNum) {
    slide.addText(String(pageNum), {
      x: 12.73, y: 6.85, w: 0.4, h: 0.18,
      fontFace: FONT, fontSize: 7, color: COLORS.muted, align: 'right',
    });
  }
}

function addKpiCards(pptx, slide, metrics = [], y = 1.35, opts = {}) {
  const count = metrics.filter(m => m && safe(m.value) !== null).length;
  if (count === 0) return;
  const items = metrics.filter(m => m && safe(m.value) !== null).slice(0, 4);
  const totalW = opts.totalW || 11.93;
  const gap = 0.22;
  const cardW = (totalW - gap * (items.length - 1)) / items.length;
  const startX = opts.startX || 0.7;
  const cardH = opts.cardH || 1.0;

  items.forEach((metric, idx) => {
    const x = startX + idx * (cardW + gap);
    // Card background
    slide.addShape(pptx.ShapeType.roundRect, {
      x, y, w: cardW, h: cardH, rectRadius: 0.07,
      fill: { color: COLORS.lightBlue },
      line: { color: COLORS.line, pt: 0.5 },
      shadow: { type: 'outer', blur: 4, offset: 1.5, opacity: 0.08, color: '000000' },
    });
    // Color accent bar at top
    slide.addShape(pptx.ShapeType.rect, {
      x: x + 0.12, y: y + 0.07, w: cardW - 0.24, h: 0.045,
      fill: { color: metric.color || COLORS.accent },
    });
    // Label
    slide.addText(metric.label || '', {
      x: x + 0.16, y: y + 0.2, w: cardW - 0.32, h: 0.18,
      fontFace: FONT, fontSize: 9, color: COLORS.muted,
    });
    // Value
    slide.addText(String(metric.value), {
      x: x + 0.16, y: y + 0.42, w: cardW - 0.32, h: 0.4,
      fontFace: FONT, fontSize: 20, bold: true, color: COLORS.navy,
    });
  });
}

function addBullets(slide, items, x, y, w, opts = {}) {
  const filtered = items.filter(Boolean);
  if (filtered.length === 0) return;
  const runs = [];
  filtered.forEach((item, idx) => {
    if (idx > 0) runs.push({ text: '\n', options: { breakLine: true, fontSize: 4 } });
    runs.push({ text: `\u2022  ${item}`, options: { breakLine: true } });
  });
  slide.addText(runs, {
    x, y, w, h: opts.h || 2.5,
    fontFace: FONT, fontSize: opts.fontSize || 11, color: COLORS.text,
    valign: 'top', lineSpacingMultiple: 1.35,
  });
}

function addDonutChart(pptx, slide, data, x, y, opts = {}) {
  const size = opts.size || 2.8;
  if (!data || data.length === 0) return;

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
    holeSize: 58,
    chartColors: data.map((d, i) => d.color || PRODUCT_COLORS[i % PRODUCT_COLORS.length]),
    border: { pt: 0 },
    shadow: { type: 'none' },
  });
}

function addHorizontalBar(pptx, slide, data, x, y, w, opts = {}) {
  if (!data || data.length === 0) return;
  const barH = opts.barH || 0.3;
  const gap = 0.1;
  const maxVal = opts.maxVal || Math.max(...data.map(d => d.value), 1);
  const labelW = opts.labelW || 2.2;

  data.forEach((d, i) => {
    const cy = y + i * (barH + gap);
    // Label
    slide.addText(d.name, {
      x, y: cy, w: labelW, h: barH,
      fontFace: FONT, fontSize: 9, color: COLORS.text, align: 'left', valign: 'middle',
    });
    // Background track
    slide.addShape(pptx.ShapeType.roundRect, {
      x: x + labelW + 0.1, y: cy + 0.05, w: w - labelW - 0.1, h: barH - 0.1,
      rectRadius: 0.04, fill: { color: COLORS.lightGray },
    });
    // Value bar
    const barW = Math.max(0.06, (d.value / maxVal) * (w - labelW - 0.1));
    slide.addShape(pptx.ShapeType.roundRect, {
      x: x + labelW + 0.1, y: cy + 0.05, w: barW, h: barH - 0.1,
      rectRadius: 0.04, fill: { color: d.color || COLORS.accent },
    });
    // Value text
    slide.addText(fmtPct(d.value), {
      x: x + w - 1.0, y: cy, w: 1.0, h: barH,
      fontFace: FONT, fontSize: 8.5, bold: true, color: COLORS.navy, align: 'right', valign: 'middle',
    });
  });
}

function addInfoRow(slide, label, value, x, y, labelW = 2.5, valW = 3.5) {
  if (safe(value) === null) return;
  slide.addText(label, {
    x, y, w: labelW, h: 0.28,
    fontFace: FONT, fontSize: 9.5, color: COLORS.muted, valign: 'middle',
  });
  slide.addText(String(value), {
    x: x + labelW, y, w: valW, h: 0.28,
    fontFace: FONT, fontSize: 10, bold: true, color: COLORS.navy, valign: 'middle',
  });
}


// ═══════════════════════════════════════════════════════════════════
// MAIN GENERATOR
// ═══════════════════════════════════════════════════════════════════

export async function generate10PagePptx(payload) {
  if (!payload) throw new Error('Payload is required');

  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_WIDE'; // 13.33 x 7.5
  pptx.author = 'Pensum Asset Management';
  pptx.company = 'Pensum Asset Management AS';
  pptx.subject = 'Investeringsforslag';
  pptx.title = `Investeringsforslag – ${safe(payload.kundeNavn, 'Investor')}`;
  pptx.lang = 'nb-NO';
  pptx.theme = { headFontFace: FONT, bodyFontFace: FONT };

  const kundeNavn = safe(payload.kundeNavn, 'Investor');
  const totalKapital = safe(payload.totalKapital) ?? safe(payload.investerbarKapital);
  const risikoProfil = safe(payload.risikoProfil, 'Moderat');
  const horisont = safe(payload.horisont);
  const forventetAvkastning = safe(payload.vektetAvkastning) ?? safe(payload.pensumForventetAvkastning);
  const allokering = (payload.allokering || []).filter(a => a && safe(a.vekt) > 0);
  const pensumAllokering = (payload.pensumAllokering || []).filter(a => a && safe(a.vekt) > 0);
  const pensumProdukter = payload.pensumProdukter || [];
  const scenarioData = payload.scenarioData || [];
  const scenarioParams = payload.scenarioParams || {};
  const likviditet = payload.pensumLikviditet || {};
  const aktivafordeling = (payload.aktivafordeling || []).filter(a => a && safe(a.prosent) > 0);
  const historisk = payload.historiskPortefolje || {};
  const eksponering = payload.eksponering || {};
  const kundeinfo = payload.kundeinfo || {};

  let slide;
  let pageNum = 0;


  // ═══════════════════════════════════════════════════════════════
  // SLIDE 1: COVER
  // ═══════════════════════════════════════════════════════════════
  slide = pptx.addSlide();
  slide.background = { color: COLORS.white };

  // Dark navy left panel (40%)
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: 5.33, h: 7.5,
    fill: { color: COLORS.darkBlue },
  });

  // Salmon accent vertical line on panel edge
  slide.addShape(pptx.ShapeType.rect, {
    x: 5.33, y: 0, w: 0.06, h: 7.5,
    fill: { color: COLORS.salmon },
  });

  // Title on dark panel
  slide.addText('Investeringsforslag', {
    x: 0.6, y: 1.6, w: 4.2, h: 0.7,
    fontFace: FONT, fontSize: 32, bold: true, color: COLORS.white,
  });

  // Salmon accent line below title
  slide.addShape(pptx.ShapeType.line, {
    x: 0.6, y: 2.45, w: 2.2, h: 0,
    line: { color: COLORS.salmon, pt: 2.5 },
  });

  // Subtitle
  slide.addText(`Utarbeidet for ${kundeNavn}`, {
    x: 0.6, y: 2.7, w: 4.2, h: 0.35,
    fontFace: FONT, fontSize: 14, color: COLORS.accent,
  });

  // Date
  slide.addText(todayFormatted(), {
    x: 0.6, y: 3.3, w: 4.2, h: 0.25,
    fontFace: FONT, fontSize: 10, color: 'A0B8C8',
  });

  // Bottom branding on dark panel
  slide.addShape(pptx.ShapeType.line, {
    x: 0.6, y: 6.0, w: 4.0, h: 0,
    line: { color: '1A3A5C', pt: 0.5 },
  });
  slide.addText('Pensum Asset Management AS', {
    x: 0.6, y: 6.15, w: 4.2, h: 0.25,
    fontFace: FONT, fontSize: 9, color: 'A0B8C8',
  });
  slide.addText('www.pensumgroup.no', {
    x: 0.6, y: 6.42, w: 4.2, h: 0.2,
    fontFace: FONT, fontSize: 8, color: '7A9AB0',
  });

  // Right panel – 3 KPI info cards
  const coverCardX = 6.1;
  const coverCardW = 6.5;
  const coverCards = [
    totalKapital != null ? { label: 'Investert belop', value: fmtKr(totalKapital), color: COLORS.accent } : null,
    { label: 'Risikoprofil', value: risikoProfil, color: COLORS.salmon },
    forventetAvkastning != null ? { label: 'Forventet avkastning', value: fmtPct(forventetAvkastning), color: COLORS.teal } : null,
  ].filter(Boolean);

  coverCards.forEach((card, i) => {
    const cy = 1.8 + i * 1.35;
    slide.addShape(pptx.ShapeType.roundRect, {
      x: coverCardX, y: cy, w: coverCardW, h: 1.05, rectRadius: 0.08,
      fill: { color: COLORS.lightBlue },
      line: { color: COLORS.line, pt: 0.5 },
      shadow: { type: 'outer', blur: 5, offset: 2, opacity: 0.07, color: '000000' },
    });
    // Color accent bar
    slide.addShape(pptx.ShapeType.rect, {
      x: coverCardX + 0.14, y: cy + 0.09, w: coverCardW - 0.28, h: 0.05,
      fill: { color: card.color },
    });
    slide.addText(card.label, {
      x: coverCardX + 0.2, y: cy + 0.22, w: coverCardW - 0.4, h: 0.2,
      fontFace: FONT, fontSize: 10, color: COLORS.muted,
    });
    slide.addText(card.value, {
      x: coverCardX + 0.2, y: cy + 0.48, w: coverCardW - 0.4, h: 0.4,
      fontFace: FONT, fontSize: 24, bold: true, color: COLORS.navy,
    });
  });


  // ═══════════════════════════════════════════════════════════════
  // SLIDE 2: INVESTERINGSHYPOTESE
  // ═══════════════════════════════════════════════════════════════
  pageNum++;
  slide = pptx.addSlide();
  slide.background = { color: COLORS.white };
  addHeader(pptx, slide, 'Investeringshypotese', 'Overordnet strategi og nøkkeltall');

  addKpiCards(pptx, slide, [
    totalKapital != null ? { label: 'Investert belop', value: fmtKr(totalKapital), color: COLORS.navy } : null,
    forventetAvkastning != null ? { label: 'Forventet avkastning', value: fmtPct(forventetAvkastning), color: COLORS.accent } : null,
    { label: 'Risikoprofil', value: risikoProfil, color: COLORS.salmon },
    horisont != null ? { label: 'Tidshorisont', value: `${horisont} ar`, color: COLORS.teal } : null,
  ].filter(Boolean), 1.35);

  // Investment thesis bullets
  const thesisBullets = [];
  if (totalKapital != null && risikoProfil) {
    thesisBullets.push(`Portefoljen er satt sammen for en investor med ${risikoProfil.toLowerCase()} risikoprofil og et investerbart belop pa ${fmtKr(totalKapital)}.`);
  }
  if (horisont != null) {
    thesisBullets.push(`Tidshorisonten er ${horisont} ar, noe som gir rom for langsiktig verdiskaping gjennom diversifisert eksponering.`);
  }
  if (forventetAvkastning != null) {
    thesisBullets.push(`Forventet arlig avkastning er estimert til ${fmtPct(forventetAvkastning)}, basert pa valgt allokering og historiske markedsdata.`);
  }
  if (allokering.length > 0) {
    const aksjer = allokering.filter(a => (a.navn || '').toLowerCase().includes('aksje'));
    const rente = allokering.filter(a => (a.navn || '').toLowerCase().includes('rente') || (a.navn || '').toLowerCase().includes('obligasjon'));
    if (aksjer.length > 0 || rente.length > 0) {
      const aksjeVekt = aksjer.reduce((s, a) => s + (a.vekt || 0), 0);
      const renteVekt = rente.reduce((s, a) => s + (a.vekt || 0), 0);
      if (aksjeVekt > 0 || renteVekt > 0) {
        thesisBullets.push(`Portefoljen har en aksjeandel pa ca. ${fmtPct(aksjeVekt, 0)} og renteandel pa ca. ${fmtPct(renteVekt, 0)}, tilpasset risikoprofilen.`);
      }
    }
  }

  addBullets(slide, thesisBullets, 0.7, 2.65, 11.93, { h: 3.5, fontSize: 11.5 });
  addFooter(pptx, slide, String(pageNum));


  // ═══════════════════════════════════════════════════════════════
  // SLIDE 3: FORUTSETNINGER
  // ═══════════════════════════════════════════════════════════════
  pageNum++;
  slide = pptx.addSlide();
  slide.background = { color: COLORS.white };
  addHeader(pptx, slide, 'Forutsetninger', 'Sentrale premisser for investeringsforslaget');

  // Left column – Key assumptions card
  const assumpCardX = 0.7;
  const assumpCardW = 5.8;
  slide.addShape(pptx.ShapeType.roundRect, {
    x: assumpCardX, y: 1.4, w: assumpCardW, h: 4.6, rectRadius: 0.08,
    fill: { color: COLORS.lightBlue },
    line: { color: COLORS.line, pt: 0.5 },
    shadow: { type: 'outer', blur: 3, offset: 1, opacity: 0.06, color: '000000' },
  });
  slide.addText('Nokkelforutsetninger', {
    x: assumpCardX + 0.2, y: 1.55, w: assumpCardW - 0.4, h: 0.3,
    fontFace: FONT, fontSize: 13, bold: true, color: COLORS.navy,
  });
  slide.addShape(pptx.ShapeType.line, {
    x: assumpCardX + 0.2, y: 1.9, w: assumpCardW - 0.4, h: 0,
    line: { color: COLORS.line, pt: 0.5 },
  });

  const assumptions = [
    ['Risikoprofil', risikoProfil],
    ['Tidshorisont', horisont != null ? `${horisont} ar` : null],
    ['Forventet avkastning (p.a.)', forventetAvkastning != null ? fmtPct(forventetAvkastning) : null],
    ['Investerbart belop', totalKapital != null ? fmtKr(totalKapital) : null],
    ['Total formue', safe(payload.totalFormue) != null ? fmtKr(payload.totalFormue) : null],
  ];

  let rowY = 2.1;
  assumptions.forEach(([label, value]) => {
    if (value == null) return;
    addInfoRow(slide, label, value, assumpCardX + 0.25, rowY, 2.6, 2.8);
    rowY += 0.38;
  });

  // Aksje/rente split if available
  if (kundeinfo.aksjerKunde != null || allokering.length > 0) {
    rowY += 0.15;
    slide.addShape(pptx.ShapeType.line, {
      x: assumpCardX + 0.25, y: rowY - 0.05, w: assumpCardW - 0.5, h: 0,
      line: { color: COLORS.line, pt: 0.5 },
    });
    slide.addText('Aksje / Rente-fordeling', {
      x: assumpCardX + 0.25, y: rowY + 0.05, w: assumpCardW - 0.5, h: 0.25,
      fontFace: FONT, fontSize: 10, bold: true, color: COLORS.navy,
    });
    rowY += 0.4;
    const aksjeAndel = safe(kundeinfo.aksjerKunde) ?? allokering.filter(a => (a.navn || '').toLowerCase().includes('aksje')).reduce((s, a) => s + (a.vekt || 0), 0);
    const renteAndel = safe(kundeinfo.renteKunde) ?? allokering.filter(a => (a.navn || '').toLowerCase().includes('rente') || (a.navn || '').toLowerCase().includes('obligasjon')).reduce((s, a) => s + (a.vekt || 0), 0);
    if (aksjeAndel > 0) addInfoRow(slide, 'Aksjer', fmtPct(aksjeAndel, 0), assumpCardX + 0.25, rowY, 2.6, 2.8);
    rowY += 0.35;
    if (renteAndel > 0) addInfoRow(slide, 'Rente / obligasjoner', fmtPct(renteAndel, 0), assumpCardX + 0.25, rowY, 2.6, 2.8);
  }

  // Right column – Likviditetsprofil
  const liqX = 6.85;
  const liqW = 5.78;
  slide.addShape(pptx.ShapeType.roundRect, {
    x: liqX, y: 1.4, w: liqW, h: 2.8, rectRadius: 0.08,
    fill: { color: COLORS.lightBlue },
    line: { color: COLORS.line, pt: 0.5 },
    shadow: { type: 'outer', blur: 3, offset: 1, opacity: 0.06, color: '000000' },
  });
  slide.addText('Likviditetsprofil', {
    x: liqX + 0.2, y: 1.55, w: liqW - 0.4, h: 0.3,
    fontFace: FONT, fontSize: 13, bold: true, color: COLORS.navy,
  });
  slide.addShape(pptx.ShapeType.line, {
    x: liqX + 0.2, y: 1.9, w: liqW - 0.4, h: 0,
    line: { color: COLORS.line, pt: 0.5 },
  });

  const liqItems = [
    { label: 'Likvid', value: safe(likviditet.likvid), color: COLORS.teal },
    { label: 'Semi-likvid', value: safe(likviditet.semiLikvid), color: COLORS.gold },
    { label: 'Illikvid', value: safe(likviditet.illikvid), color: COLORS.salmon },
  ].filter(l => l.value != null);

  if (liqItems.length > 0) {
    // Stacked horizontal bar
    const barX = liqX + 0.3;
    const barY = 2.15;
    const barW = liqW - 0.6;
    const barH = 0.45;
    const total = liqItems.reduce((s, l) => s + l.value, 0) || 100;
    let offsetX = barX;

    liqItems.forEach((item) => {
      const segW = (item.value / total) * barW;
      slide.addShape(pptx.ShapeType.roundRect, {
        x: offsetX, y: barY, w: Math.max(segW, 0.1), h: barH,
        rectRadius: 0.06, fill: { color: item.color },
      });
      if (segW > 0.5) {
        slide.addText(`${fmtNum(item.value, 0)}%`, {
          x: offsetX, y: barY, w: segW, h: barH,
          fontFace: FONT, fontSize: 10, bold: true, color: COLORS.white, align: 'center', valign: 'middle',
        });
      }
      offsetX += segW;
    });

    // Legend below bar
    liqItems.forEach((item, i) => {
      const ly = 2.8 + i * 0.35;
      slide.addShape(pptx.ShapeType.roundRect, {
        x: liqX + 0.35, y: ly + 0.04, w: 0.16, h: 0.16,
        rectRadius: 0.03, fill: { color: item.color },
      });
      slide.addText(`${item.label}: ${fmtPct(item.value, 0)}`, {
        x: liqX + 0.6, y: ly, w: liqW - 1.0, h: 0.24,
        fontFace: FONT, fontSize: 9.5, color: COLORS.text,
      });
    });
  }

  // Aktivafordeling summary on right lower
  if (aktivafordeling.length > 0) {
    slide.addShape(pptx.ShapeType.roundRect, {
      x: liqX, y: 4.45, w: liqW, h: 1.55, rectRadius: 0.08,
      fill: { color: COLORS.lightGray },
      line: { color: COLORS.line, pt: 0.5 },
    });
    slide.addText('Aktivafordeling (oversikt)', {
      x: liqX + 0.2, y: 4.55, w: liqW - 0.4, h: 0.25,
      fontFace: FONT, fontSize: 10, bold: true, color: COLORS.navy,
    });
    aktivafordeling.slice(0, 5).forEach((a, i) => {
      addInfoRow(slide, a.navn, fmtPct(a.prosent, 0), liqX + 0.25, 4.9 + i * 0.28, 2.8, 2.2);
    });
  }

  addFooter(pptx, slide, String(pageNum));


  // ═══════════════════════════════════════════════════════════════
  // SLIDE 4: AKTIVAALLOKERING
  // ═══════════════════════════════════════════════════════════════
  pageNum++;
  slide = pptx.addSlide();
  slide.background = { color: COLORS.white };
  addHeader(pptx, slide, 'Aktivaallokering', 'Fordeling per aktivaklasse');

  if (allokering.length > 0) {
    // Donut chart – left side
    const donutData = allokering.map((a, i) => ({
      name: a.navn || `Klasse ${i + 1}`,
      value: a.vekt,
      color: PRODUCT_COLORS[i % PRODUCT_COLORS.length],
    }));
    addDonutChart(pptx, slide, donutData, 0.8, 1.7, { size: 3.2 });

    // Legend below/right of donut
    donutData.forEach((d, i) => {
      const ly = 1.85 + i * 0.36;
      const lx = 4.3;
      slide.addShape(pptx.ShapeType.roundRect, {
        x: lx, y: ly + 0.04, w: 0.16, h: 0.16,
        rectRadius: 0.03, fill: { color: d.color },
      });
      slide.addText(d.name, {
        x: lx + 0.24, y: ly, w: 2.2, h: 0.24,
        fontFace: FONT, fontSize: 9, color: COLORS.text,
      });
      slide.addText(fmtPct(d.value, 1), {
        x: lx + 2.3, y: ly, w: 0.8, h: 0.24,
        fontFace: FONT, fontSize: 9, bold: true, color: COLORS.navy, align: 'right',
      });
    });

    // Table – right side
    const headerRow = [
      { text: 'Aktivaklasse', options: { fontFace: FONT, fontSize: 9, bold: true, color: COLORS.white, fill: { color: COLORS.navy } } },
      { text: 'Andel', options: { fontFace: FONT, fontSize: 9, bold: true, color: COLORS.white, fill: { color: COLORS.navy }, align: 'center' } },
      { text: 'Belop (kr)', options: { fontFace: FONT, fontSize: 9, bold: true, color: COLORS.white, fill: { color: COLORS.navy }, align: 'right' } },
    ];
    const tableRows = allokering.map((a, i) => [
      { text: a.navn || '–', options: { fontFace: FONT, fontSize: 10, color: COLORS.text } },
      { text: fmtPct(a.vekt, 1), options: { fontFace: FONT, fontSize: 10, color: COLORS.navy, bold: true, align: 'center' } },
      { text: safe(a.belop) != null ? fmtKr(a.belop) : '–', options: { fontFace: FONT, fontSize: 10, color: COLORS.text, align: 'right' } },
    ]);

    slide.addTable([headerRow, ...tableRows], {
      x: 7.2, y: 1.5, w: 5.43,
      border: { type: 'solid', pt: 0.5, color: COLORS.line },
      fill: COLORS.white,
      fontFace: FONT,
      fontSize: 10,
      rowH: 0.38,
      valign: 'middle',
      colW: [2.3, 1.1, 2.03],
      autoPageRepeatHeader: true,
    });

    // Total row
    const totalVekt = allokering.reduce((s, a) => s + (a.vekt || 0), 0);
    const totalBelop = allokering.reduce((s, a) => s + (safe(a.belop) || 0), 0);
    const totalRowY = 1.5 + (allokering.length + 1) * 0.38 + 0.05;
    slide.addShape(pptx.ShapeType.rect, {
      x: 7.2, y: totalRowY, w: 5.43, h: 0.35,
      fill: { color: COLORS.lightBlue },
    });
    slide.addText('Totalt', {
      x: 7.3, y: totalRowY, w: 2.1, h: 0.35,
      fontFace: FONT, fontSize: 10, bold: true, color: COLORS.navy, valign: 'middle',
    });
    slide.addText(fmtPct(totalVekt, 1), {
      x: 9.4, y: totalRowY, w: 1.1, h: 0.35,
      fontFace: FONT, fontSize: 10, bold: true, color: COLORS.navy, align: 'center', valign: 'middle',
    });
    if (totalBelop > 0) {
      slide.addText(fmtKr(totalBelop), {
        x: 10.6, y: totalRowY, w: 2.03, h: 0.35,
        fontFace: FONT, fontSize: 10, bold: true, color: COLORS.navy, align: 'right', valign: 'middle',
      });
    }
  }

  addFooter(pptx, slide, String(pageNum));


  // ═══════════════════════════════════════════════════════════════
  // SLIDE 5: PORTEFØLJELOGIKK
  // ═══════════════════════════════════════════════════════════════
  pageNum++;
  slide = pptx.addSlide();
  slide.background = { color: COLORS.white };
  addHeader(pptx, slide, 'Porteføljelogikk', 'Hvorfor denne sammensetningen');

  // Info cards for roles
  const roleCards = [
    {
      title: 'Aksjer – vekstmotor',
      body: 'Aksjeandelen gir portefoljen langsiktig vekstpotensial. Bred geografisk diversifisering reduserer konsentrasjonsrisiko.',
      color: COLORS.navy,
    },
    {
      title: 'Renter – stabilisator',
      body: 'Renteinvesteringer demper svingninger og gir lopende avkastning. De fungerer som en stabiliserende motvekt til aksjer.',
      color: COLORS.accent,
    },
    {
      title: 'Diversifisering',
      body: 'Spredning pa tvers av aktivaklasser, regioner og sektorer reduserer total risiko uten a vesentlig redusere forventet avkastning.',
      color: COLORS.teal,
    },
    {
      title: 'Pensum-tilnærmingen',
      body: 'Vi kombinerer aktiv og passiv forvaltning for a oppna best mulig risikojustert avkastning over tid. Kostnadskontroll er sentralt.',
      color: COLORS.salmon,
    },
  ];

  roleCards.forEach((card, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const cx = 0.7 + col * 6.32;
    const cy = 1.4 + row * 2.55;
    const cw = 5.98;
    const ch = 2.3;

    slide.addShape(pptx.ShapeType.roundRect, {
      x: cx, y: cy, w: cw, h: ch, rectRadius: 0.08,
      fill: { color: COLORS.lightBlue },
      line: { color: COLORS.line, pt: 0.5 },
      shadow: { type: 'outer', blur: 3, offset: 1, opacity: 0.06, color: '000000' },
    });
    // Color accent bar at top
    slide.addShape(pptx.ShapeType.rect, {
      x: cx + 0.15, y: cy + 0.1, w: cw - 0.3, h: 0.05,
      fill: { color: card.color },
    });
    slide.addText(card.title, {
      x: cx + 0.2, y: cy + 0.28, w: cw - 0.4, h: 0.3,
      fontFace: FONT, fontSize: 13, bold: true, color: COLORS.navy,
    });
    slide.addText(card.body, {
      x: cx + 0.2, y: cy + 0.65, w: cw - 0.4, h: 1.4,
      fontFace: FONT, fontSize: 10.5, color: COLORS.text, valign: 'top', lineSpacingMultiple: 1.35,
    });
  });

  addFooter(pptx, slide, String(pageNum));


  // ═══════════════════════════════════════════════════════════════
  // SLIDE 6: HISTORISK UTVIKLING
  // ═══════════════════════════════════════════════════════════════
  pageNum++;
  slide = pptx.addSlide();
  slide.background = { color: COLORS.white };
  addHeader(pptx, slide, 'Historisk utvikling', 'Annualisert avkastning for portefoljen');

  const histCards = [
    safe(historisk.aar1) != null ? { label: 'Siste 1 ar', value: fmtPct(historisk.aar1), color: COLORS.accent } : null,
    safe(historisk.aar3) != null ? { label: 'Siste 3 ar (p.a.)', value: fmtPct(historisk.aar3), color: COLORS.teal } : null,
    safe(historisk.aar5) != null ? { label: 'Siste 5 ar (p.a.)', value: fmtPct(historisk.aar5), color: COLORS.navy } : null,
  ].filter(Boolean);

  if (histCards.length > 0) {
    addKpiCards(pptx, slide, histCards, 1.4, { cardH: 1.15 });
  }

  // Product historikk metrics if available
  const produktHistorikk = payload.produktHistorikk || {};
  const histMetrics = [];
  Object.entries(produktHistorikk).forEach(([id, hist]) => {
    if (!hist || !hist.data) return;
    const produkt = pensumProdukter.find(p => p.id === id);
    if (!produkt) return;
    const data = hist.data;
    // Look for volatility, sharpe, maxDD
    const vol = safe(hist.volatilitet) ?? safe(hist.volatility);
    const sharpe = safe(hist.sharpe) ?? safe(hist.sharpeRatio);
    const maxDD = safe(hist.maxDrawdown) ?? safe(hist.maxDD);
    if (vol != null || sharpe != null || maxDD != null) {
      histMetrics.push({ name: produkt.navn || id, vol, sharpe, maxDD });
    }
  });

  if (histMetrics.length > 0) {
    const tableHeaderRow = [
      { text: 'Produkt', options: { fontFace: FONT, fontSize: 9, bold: true, color: COLORS.white, fill: { color: COLORS.navy } } },
      { text: 'Volatilitet', options: { fontFace: FONT, fontSize: 9, bold: true, color: COLORS.white, fill: { color: COLORS.navy }, align: 'center' } },
      { text: 'Sharpe', options: { fontFace: FONT, fontSize: 9, bold: true, color: COLORS.white, fill: { color: COLORS.navy }, align: 'center' } },
      { text: 'Max DD', options: { fontFace: FONT, fontSize: 9, bold: true, color: COLORS.white, fill: { color: COLORS.navy }, align: 'center' } },
    ];
    const metricRows = histMetrics.map(m => [
      { text: m.name, options: { fontFace: FONT, fontSize: 9.5, color: COLORS.text } },
      { text: m.vol != null ? fmtPct(m.vol) : '–', options: { fontFace: FONT, fontSize: 9.5, color: COLORS.navy, align: 'center' } },
      { text: m.sharpe != null ? fmtNum(m.sharpe, 2) : '–', options: { fontFace: FONT, fontSize: 9.5, color: COLORS.navy, align: 'center' } },
      { text: m.maxDD != null ? fmtPct(m.maxDD) : '–', options: { fontFace: FONT, fontSize: 9.5, color: COLORS.navy, align: 'center' } },
    ]);

    slide.addTable([tableHeaderRow, ...metricRows], {
      x: 0.7, y: histCards.length > 0 ? 2.9 : 1.5,
      w: 11.93,
      border: { type: 'solid', pt: 0.5, color: COLORS.line },
      fill: COLORS.white,
      rowH: 0.36,
      valign: 'middle',
      colW: [5.0, 2.31, 2.31, 2.31],
    });
  }

  // If no historical data at all, show a message
  if (histCards.length === 0 && histMetrics.length === 0) {
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 2.5, y: 2.5, w: 8.33, h: 2.0, rectRadius: 0.1,
      fill: { color: COLORS.lightGray },
      line: { color: COLORS.line, pt: 0.5 },
    });
    slide.addText('Historiske data er ikke tilgjengelig for denne portefoljen.', {
      x: 2.5, y: 2.5, w: 8.33, h: 2.0,
      fontFace: FONT, fontSize: 13, color: COLORS.muted, align: 'center', valign: 'middle',
    });
  }

  addFooter(pptx, slide, String(pageNum));


  // ═══════════════════════════════════════════════════════════════
  // SLIDE 7: SCENARIOANALYSE
  // ═══════════════════════════════════════════════════════════════
  pageNum++;
  slide = pptx.addSlide();
  slide.background = { color: COLORS.white };
  addHeader(pptx, slide, 'Scenarioanalyse', 'Tre mulige utfall basert pa ulike markedsforutsetninger');

  // Get final scenario values
  const lastScenario = scenarioData.length > 0 ? scenarioData[scenarioData.length - 1] : null;

  const scenarios = [
    {
      label: 'Pessimistisk',
      return: safe(scenarioParams.pessimistisk),
      endValue: lastScenario ? safe(lastScenario.pessimistisk) : null,
      color: COLORS.salmon,
      bgColor: 'FDF2ED',
    },
    {
      label: 'Forventet',
      return: forventetAvkastning,
      endValue: lastScenario ? safe(lastScenario.forventet) : null,
      color: COLORS.navy,
      bgColor: COLORS.lightBlue,
    },
    {
      label: 'Optimistisk',
      return: safe(scenarioParams.optimistisk),
      endValue: lastScenario ? safe(lastScenario.optimistisk) : null,
      color: COLORS.teal,
      bgColor: 'EDF5F5',
    },
  ];

  const scenarioCardW = 3.8;
  const scenarioGap = 0.27;
  const scenarioStartX = (13.33 - (scenarioCardW * 3 + scenarioGap * 2)) / 2;

  scenarios.forEach((sc, i) => {
    const sx = scenarioStartX + i * (scenarioCardW + scenarioGap);
    const sy = 1.55;
    const sh = 4.5;

    // Card
    slide.addShape(pptx.ShapeType.roundRect, {
      x: sx, y: sy, w: scenarioCardW, h: sh, rectRadius: 0.1,
      fill: { color: sc.bgColor },
      line: { color: COLORS.line, pt: 0.5 },
      shadow: { type: 'outer', blur: 4, offset: 1.5, opacity: 0.07, color: '000000' },
    });
    // Top accent bar
    slide.addShape(pptx.ShapeType.rect, {
      x: sx + 0.15, y: sy + 0.12, w: scenarioCardW - 0.3, h: 0.06,
      fill: { color: sc.color },
    });
    // Scenario label
    slide.addText(sc.label, {
      x: sx + 0.2, y: sy + 0.35, w: scenarioCardW - 0.4, h: 0.35,
      fontFace: FONT, fontSize: 16, bold: true, color: sc.color, align: 'center',
    });

    // Divider
    slide.addShape(pptx.ShapeType.line, {
      x: sx + 0.4, y: sy + 0.85, w: scenarioCardW - 0.8, h: 0,
      line: { color: COLORS.line, pt: 0.5 },
    });

    // Annual return
    if (sc.return != null) {
      slide.addText('Arlig avkastning', {
        x: sx + 0.2, y: sy + 1.1, w: scenarioCardW - 0.4, h: 0.22,
        fontFace: FONT, fontSize: 9, color: COLORS.muted, align: 'center',
      });
      slide.addText(fmtPct(sc.return), {
        x: sx + 0.2, y: sy + 1.35, w: scenarioCardW - 0.4, h: 0.5,
        fontFace: FONT, fontSize: 26, bold: true, color: sc.color, align: 'center',
      });
    }

    // End value
    if (sc.endValue != null) {
      slide.addShape(pptx.ShapeType.line, {
        x: sx + 0.4, y: sy + 2.1, w: scenarioCardW - 0.8, h: 0,
        line: { color: COLORS.line, pt: 0.5 },
      });
      slide.addText('Sluttverdi', {
        x: sx + 0.2, y: sy + 2.3, w: scenarioCardW - 0.4, h: 0.22,
        fontFace: FONT, fontSize: 9, color: COLORS.muted, align: 'center',
      });
      slide.addText(fmtKr(sc.endValue), {
        x: sx + 0.2, y: sy + 2.55, w: scenarioCardW - 0.4, h: 0.5,
        fontFace: FONT, fontSize: 22, bold: true, color: sc.color, align: 'center',
      });

      // Gain/loss
      if (totalKapital != null) {
        const diff = sc.endValue - totalKapital;
        const diffPct = ((sc.endValue / totalKapital - 1) * 100);
        slide.addText(`${diff >= 0 ? '+' : ''}${fmtKr(diff)} (${diff >= 0 ? '+' : ''}${fmtPct(diffPct, 1)})`, {
          x: sx + 0.2, y: sy + 3.15, w: scenarioCardW - 0.4, h: 0.3,
          fontFace: FONT, fontSize: 9.5, color: COLORS.muted, align: 'center',
        });
      }
    }

    // Time period
    if (horisont != null) {
      slide.addText(`Over ${horisont} ar`, {
        x: sx + 0.2, y: sy + sh - 0.6, w: scenarioCardW - 0.4, h: 0.3,
        fontFace: FONT, fontSize: 9, color: COLORS.muted, align: 'center',
      });
    }
  });

  addFooter(pptx, slide, String(pageNum));


  // ═══════════════════════════════════════════════════════════════
  // SLIDE 8: PRODUKTOVERSIKT
  // ═══════════════════════════════════════════════════════════════
  pageNum++;
  slide = pptx.addSlide();
  slide.background = { color: COLORS.white };
  addHeader(pptx, slide, 'Produktoversikt', 'Alle produkter i portefoljen');

  // Build product list sorted by weight desc
  const productList = pensumAllokering
    .map(pa => {
      const prod = pensumProdukter.find(p => p.id === pa.id);
      return {
        id: pa.id,
        navn: prod?.navn || pa.id,
        vekt: pa.vekt || 0,
        type: prod?.type || prod?.kategori || prod?.categoryKey || '–',
        forventetAvkastning: safe(prod?.forventetAvkastning) ?? safe(prod?.expectedReturn),
      };
    })
    .filter(p => p.vekt > 0)
    .sort((a, b) => b.vekt - a.vekt);

  if (productList.length > 0) {
    const prodHeaderRow = [
      { text: 'Produkt', options: { fontFace: FONT, fontSize: 9, bold: true, color: COLORS.white, fill: { color: COLORS.navy } } },
      { text: 'Vekt', options: { fontFace: FONT, fontSize: 9, bold: true, color: COLORS.white, fill: { color: COLORS.navy }, align: 'center' } },
      { text: 'Type / rolle', options: { fontFace: FONT, fontSize: 9, bold: true, color: COLORS.white, fill: { color: COLORS.navy } } },
      { text: 'Forv. avk.', options: { fontFace: FONT, fontSize: 9, bold: true, color: COLORS.white, fill: { color: COLORS.navy }, align: 'center' } },
    ];
    const prodRows = productList.map((p, i) => [
      { text: p.navn, options: { fontFace: FONT, fontSize: 10, color: COLORS.text, bold: i < 3, fill: { color: i % 2 === 0 ? COLORS.white : COLORS.lightGray } } },
      { text: fmtPct(p.vekt, 1), options: { fontFace: FONT, fontSize: 10, color: COLORS.navy, bold: true, align: 'center', fill: { color: i % 2 === 0 ? COLORS.white : COLORS.lightGray } } },
      { text: p.type, options: { fontFace: FONT, fontSize: 9.5, color: COLORS.muted, fill: { color: i % 2 === 0 ? COLORS.white : COLORS.lightGray } } },
      { text: p.forventetAvkastning != null ? fmtPct(p.forventetAvkastning) : '–', options: { fontFace: FONT, fontSize: 10, color: COLORS.navy, align: 'center', fill: { color: i % 2 === 0 ? COLORS.white : COLORS.lightGray } } },
    ]);

    slide.addTable([prodHeaderRow, ...prodRows], {
      x: 0.7, y: 1.45, w: 11.93,
      border: { type: 'solid', pt: 0.5, color: COLORS.line },
      rowH: 0.4,
      valign: 'middle',
      colW: [5.0, 1.8, 3.33, 1.8],
    });
  } else {
    slide.addText('Ingen produkter valgt.', {
      x: 0.7, y: 3.0, w: 11.93, h: 1.5,
      fontFace: FONT, fontSize: 14, color: COLORS.muted, align: 'center', valign: 'middle',
    });
  }

  addFooter(pptx, slide, String(pageNum));


  // ═══════════════════════════════════════════════════════════════
  // SLIDE 9: PRODUKTDETALJER (Top 3-4 products)
  // ═══════════════════════════════════════════════════════════════
  const topProducts = productList.slice(0, 4);

  if (topProducts.length > 0) {
    pageNum++;
    slide = pptx.addSlide();
    slide.background = { color: COLORS.white };
    addHeader(pptx, slide, 'Produktdetaljer', 'De storste posisjonene i portefoljen');

    // Horizontal bar chart showing top allocations
    const barData = topProducts.map((p, i) => ({
      name: p.navn.length > 28 ? p.navn.substring(0, 26) + '...' : p.navn,
      value: p.vekt,
      color: PRODUCT_COLORS[i % PRODUCT_COLORS.length],
    }));

    addHorizontalBar(pptx, slide, barData, 0.7, 1.5, 5.8, {
      maxVal: Math.max(...topProducts.map(p => p.vekt), 1),
      labelW: 2.4,
      barH: 0.35,
    });

    // Detail cards on the right side
    const detailX = 7.0;
    const detailW = 5.63;
    const cardH = topProducts.length <= 3 ? 1.55 : 1.15;
    const detailGap = 0.2;

    topProducts.forEach((prod, i) => {
      const dy = 1.45 + i * (cardH + detailGap);
      const prodInfo = pensumProdukter.find(p => p.id === prod.id);

      slide.addShape(pptx.ShapeType.roundRect, {
        x: detailX, y: dy, w: detailW, h: cardH, rectRadius: 0.07,
        fill: { color: COLORS.lightBlue },
        line: { color: COLORS.line, pt: 0.5 },
      });
      // Accent dot
      slide.addShape(pptx.ShapeType.ellipse, {
        x: detailX + 0.15, y: dy + 0.15, w: 0.14, h: 0.14,
        fill: { color: PRODUCT_COLORS[i % PRODUCT_COLORS.length] },
      });
      // Product name
      slide.addText(prod.navn, {
        x: detailX + 0.38, y: dy + 0.08, w: detailW - 1.5, h: 0.25,
        fontFace: FONT, fontSize: 10.5, bold: true, color: COLORS.navy,
      });
      // Weight badge
      slide.addText(fmtPct(prod.vekt, 1), {
        x: detailX + detailW - 1.0, y: dy + 0.08, w: 0.85, h: 0.25,
        fontFace: FONT, fontSize: 10, bold: true, color: COLORS.accent, align: 'right',
      });
      // Type
      slide.addText(prod.type !== '–' ? prod.type : '', {
        x: detailX + 0.38, y: dy + 0.36, w: detailW - 0.6, h: 0.2,
        fontFace: FONT, fontSize: 8.5, color: COLORS.muted,
      });
      // Description/narrative if available
      const desc = prodInfo?.beskrivelse || prodInfo?.description || prodInfo?.roleInPortfolio || prodInfo?.pitchShort || '';
      if (desc && cardH > 1.2) {
        slide.addText(desc.length > 120 ? desc.substring(0, 118) + '...' : desc, {
          x: detailX + 0.2, y: dy + 0.6, w: detailW - 0.4, h: cardH - 0.75,
          fontFace: FONT, fontSize: 9, color: COLORS.text, valign: 'top', lineSpacingMultiple: 1.3,
        });
      }
    });

    addFooter(pptx, slide, String(pageNum));
  }


  // ═══════════════════════════════════════════════════════════════
  // SLIDE 10: VIKTIG INFORMASJON & NESTE STEG
  // ═══════════════════════════════════════════════════════════════
  pageNum++;
  slide = pptx.addSlide();
  slide.background = { color: COLORS.white };
  addHeader(pptx, slide, 'Viktig informasjon & neste steg', 'Forslaget er illustrativt og ma kvalitetssikres i radgiverlopet');

  // Numbered steps
  const steps = [
    'Gjennomga foreslatt porteføljesammensetning og vurder eventuelle kundespesifikke tilpasninger.',
    'Diskuter risikoprofil, tidshorisont og investeringsmal med din radgiver i Pensum.',
    'Ved videre prosess gjennomfores en formell egnethetsvurdering og kundeetablering.',
  ];

  steps.forEach((step, i) => {
    const sy = 1.5 + i * 1.05;
    // Number circle
    slide.addShape(pptx.ShapeType.ellipse, {
      x: 0.9, y: sy, w: 0.42, h: 0.42,
      fill: { color: COLORS.navy },
      shadow: { type: 'outer', blur: 3, offset: 1, opacity: 0.1, color: '000000' },
    });
    slide.addText(String(i + 1), {
      x: 0.9, y: sy, w: 0.42, h: 0.42,
      fontFace: FONT, fontSize: 15, bold: true, color: COLORS.white, align: 'center', valign: 'middle',
    });
    // Step text
    slide.addText(step, {
      x: 1.55, y: sy + 0.02, w: 10.5, h: 0.42,
      fontFace: FONT, fontSize: 12, color: COLORS.text, valign: 'middle',
    });
  });

  // Disclaimer box
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.7, y: 4.35, w: 11.93, h: 1.4, rectRadius: 0.08,
    fill: { color: COLORS.lightGray },
    line: { color: COLORS.line, pt: 0.5 },
  });
  slide.addText('Viktig informasjon', {
    x: 0.9, y: 4.5, w: 11.53, h: 0.25,
    fontFace: FONT, fontSize: 10, bold: true, color: COLORS.navy,
  });
  slide.addText(
    'Dette dokumentet er utarbeidet av Pensum Asset Management AS og er kun ment som et illustrativt investeringsforslag. ' +
    'Innholdet utgjor ikke personlig investeringsradgivning eller en egnethetsvurdering iht. verdipapirhandelloven. ' +
    'Historisk avkastning er ingen garanti for fremtidig avkastning. Investeringer i verdipapirer er forbundet med risiko, ' +
    'og du kan tape hele eller deler av investert belop. Kontakt din radgiver for en fullstendig vurdering.',
    {
      x: 0.9, y: 4.8, w: 11.53, h: 0.85,
      fontFace: FONT, fontSize: 8.5, color: COLORS.muted, valign: 'top', lineSpacingMultiple: 1.35,
    }
  );

  // Contact info box
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.7, y: 5.95, w: 11.93, h: 0.65, rectRadius: 0.08,
    fill: { color: COLORS.lightBlue },
    line: { color: COLORS.line, pt: 0.5 },
    shadow: { type: 'outer', blur: 3, offset: 1, opacity: 0.06, color: '000000' },
  });
  // Salmon accent on left edge
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.7, y: 5.95, w: 0.06, h: 0.65,
    fill: { color: COLORS.salmon },
  });
  slide.addText('Kontakt din radgiver i Pensum Asset Management for videre oppfolging.', {
    x: 0.95, y: 5.98, w: 8, h: 0.25,
    fontFace: FONT, fontSize: 11, bold: true, color: COLORS.navy,
  });
  slide.addText('www.pensumgroup.no  |  post@pensumgroup.no', {
    x: 0.95, y: 6.28, w: 8, h: 0.2,
    fontFace: FONT, fontSize: 9, color: COLORS.muted,
  });
  slide.addText('Pensum Asset Management AS', {
    x: 9.0, y: 6.05, w: 3.5, h: 0.45,
    fontFace: FONT, fontSize: 10, bold: true, color: COLORS.navy, align: 'right', valign: 'middle',
  });

  addFooter(pptx, slide, String(pageNum));


  // ═══════════════════════════════════════════════════════════════
  // GENERATE BUFFER
  // ═══════════════════════════════════════════════════════════════
  const buffer = await pptx.write({ outputType: 'nodebuffer' });
  return buffer;
}

export default generate10PagePptx;
