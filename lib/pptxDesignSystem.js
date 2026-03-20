/**
 * Pensum PPTX Design System
 *
 * Shared design tokens, layout helpers, and reusable slide components
 * for both the 10-slide compact version and future 20-25 slide full proposal.
 *
 * Design philosophy:
 * - Bloomberg-level information discipline and credibility
 * - Pensum visual identity: warmth, space, premium feel
 * - Consistent typography hierarchy and spacing
 */
import pptxgen from 'pptxgenjs';

// ─── DESIGN TOKENS ───────────────────────────────────────────────

export const COLORS = {
  // Primary
  navy: '0D2841',
  darkBlue: '012441',
  midBlue: '123C6A',
  accent: '6B9DB8',

  // Warm accents
  salmon: 'C4967E',
  gold: 'A67B3D',

  // Supplementary
  teal: '2D6A6A',
  purple: '5B4FA0',
  green: '2D6A4F',

  // Backgrounds
  lightBlue: 'E8F0F4',
  lightGray: 'F5F5F5',
  warmGray: 'F9F7F5',
  softAmber: 'FDF6F2',
  softGreen: 'E8F5F0',
  softRed: 'FDF2F2',

  // Text
  text: '262626',
  muted: '4A5568',
  white: 'FFFFFF',

  // Structural
  line: 'D1D5DB',
  lineDark: 'B0B8C4',
  red: 'B91C1C',
};

export const PRODUCT_COLORS = [
  '0D2841', '6B9DB8', 'C4967E', '2D6A6A', 'A67B3D',
  '5B4FA0', '2D6A4F', '123C6A', '8B6BB8',
];

export const ALLOC_COLORS = {
  'Globale Aksjer': '6B9DB8',
  'Norske Aksjer': '0D2841',
  'Høyrente': 'C4967E',
  'Investment Grade': 'D4B8A8',
  'Private Equity': '2D6A6A',
  'Eiendom': 'A67B3D',
};

export const AKTIVA_COLORS = {
  Aksjer: '0D2841',
  Renter: 'C4967E',
  Alternativer: '2D6A6A',
  Blandet: 'A67B3D',
};

// Runtime safety: ensure all color values are strings (guards against bundler issues)
function _ensureStrings(obj) {
  for (const k of Object.keys(obj)) {
    if (typeof obj[k] !== 'string') obj[k] = String(obj[k] ?? '');
  }
}
_ensureStrings(COLORS);
_ensureStrings(ALLOC_COLORS);
_ensureStrings(AKTIVA_COLORS);
PRODUCT_COLORS.forEach((v, i, a) => { if (typeof v !== 'string') a[i] = String(v ?? ''); });

export const FONT = 'Merriweather Sans';

// Layout constants
export const LAYOUT = {
  slideW: 13.33,
  slideH: 7.5,
  marginL: 0.7,
  marginR: 0.5,
  contentW: 11.9,
  headerY: 0.32,
  contentStartY: 1.3,
  footerLineY: 6.75,
  footerTextY: 6.82,
  navyStripeW: 0.12,
};

// Typography scale
export const TYPE = {
  heroTitle: { fontSize: 38, bold: true },
  slideTitle: { fontSize: 22, bold: true },
  sectionTitle: { fontSize: 13, bold: true },
  cardTitle: { fontSize: 10, bold: true },
  bodyLarge: { fontSize: 10 },
  body: { fontSize: 9 },
  bodySmall: { fontSize: 8.5 },
  caption: { fontSize: 8 },
  micro: { fontSize: 7 },
  kpiValue: { fontSize: 18, bold: true },
  kpiValueSmall: { fontSize: 14, bold: true },
  kpiLabel: { fontSize: 8 },
};

// ─── COLOR HELPERS ──────────────────────────────────────────────
// pptxgenjs requires color values to be hex strings without '#'.
// This helper ensures any color value is safe to pass to the library.
export function safeColor(c) {
  if (typeof c === 'string') return c.replace('#', '');
  if (c == null) return '';
  return String(c).replace('#', '');
}

// ─── FORMATTERS ──────────────────────────────────────────────────

export const fmt = (v, dec = 0) =>
  typeof v === 'number' && Number.isFinite(v)
    ? v.toLocaleString('nb-NO', { maximumFractionDigits: dec, minimumFractionDigits: dec })
    : '–';

export const fmtPct = (v, dec = 1) =>
  typeof v === 'number' && Number.isFinite(v) ? `${v.toFixed(dec)}%` : '–';

export const fmtKr = (v) =>
  typeof v === 'number' && Number.isFinite(v)
    ? `kr ${Math.round(v).toLocaleString('nb-NO')}`
    : '–';

export const fmtMnok = (v) => {
  if (typeof v !== 'number' || !Number.isFinite(v)) return '–';
  if (v >= 1e6) return `${(v / 1e6).toFixed(1)} MNOK`;
  if (v >= 1e3) return `${Math.round(v / 1e3)} TNOK`;
  return fmtKr(v);
};

export function cagr(start, end, years) {
  if (!start || !end || !years || start <= 0) return null;
  return (Math.pow(end / start, 1 / years) - 1) * 100;
}

// ─── PRODUCT ROLE MAPPING ────────────────────────────────────────
// Central mapping function for consistent product categorization.
// Uses .rolle / .aktivaklasse / .aktivatype with fallback logic.

const ROLE_KEYWORDS = {
  kjerne: ['kjerne', 'core', 'kjerneeksponering', 'hovedmotor', 'balansert'],
  stabilisator: ['stabilisator', 'kontantstrøm', 'renteavkastning', 'yield', 'kreditt', 'rente'],
  satellitt: ['satellitt', 'tematisk', 'spisset', 'sektor', 'offensiv', 'meravkastning'],
};

const AKTIVATYPE_MAP = {
  rente: 'stabilisator',
  blandet: 'kjerne',
  alternativ: 'satellitt',
};

const ID_FALLBACK_MAP = {
  'global-core-active': 'kjerne',
  'global-edge': 'kjerne',
  'basis': 'kjerne',
  'global-hoyrente': 'stabilisator',
  'nordisk-hoyrente': 'stabilisator',
  'financial-d': 'stabilisator',
  'norge-a': 'satellitt',
  'energy-a': 'satellitt',
  'banking-d': 'satellitt',
};

/**
 * Classify a product into kjerne/stabilisator/satellitt.
 * Priority: rolle text analysis → aktivaklasse/aktivatype → ID fallback → 'satellitt'
 */
export function classifyProductRole(product) {
  if (!product) return 'satellitt';

  // 1. Try rolle/caseKort text
  const rolleText = (product.rolle || product.role || product.caseKort || '').toLowerCase();
  if (rolleText) {
    for (const [category, keywords] of Object.entries(ROLE_KEYWORDS)) {
      if (keywords.some(kw => rolleText.includes(kw))) return category;
    }
  }

  // 2. Try aktivaklasse
  const aktivaklasse = (product.aktivaklasse || '').toLowerCase();
  if (aktivaklasse.includes('renter') || aktivaklasse.includes('kreditt')) return 'stabilisator';
  if (aktivaklasse.includes('blandet')) return 'kjerne';

  // 3. Try aktivatype
  const aktivatype = (product.aktivatype || '').toLowerCase();
  if (AKTIVATYPE_MAP[aktivatype]) return AKTIVATYPE_MAP[aktivatype];

  // 4. ID fallback
  if (product.id && ID_FALLBACK_MAP[product.id]) return ID_FALLBACK_MAP[product.id];

  return 'satellitt';
}

// Group definitions for portfolio construction
export const ROLE_GROUPS = {
  kjerne: {
    label: 'Kjerne',
    desc: 'Hovedmotor – global og norsk aksjeeksponering',
    color: COLORS.navy,
    bgColor: COLORS.lightBlue,
  },
  stabilisator: {
    label: 'Stabilisator / Rentedel',
    desc: 'Kontantstrøm og lavere volatilitet',
    color: COLORS.salmon,
    bgColor: COLORS.softAmber,
  },
  satellitt: {
    label: 'Satellitter',
    desc: 'Tematisk og spisset eksponering',
    color: COLORS.teal,
    bgColor: COLORS.softGreen,
  },
};

// ─── SLIDE COMPONENTS ────────────────────────────────────────────

/**
 * Standard slide header with navy left accent stripe, title, subtitle, divider.
 */
export function addHeader(pptx, slide, title, subtitle = '') {
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: LAYOUT.navyStripeW, h: LAYOUT.slideH,
    fill: { color: COLORS.navy },
  });
  slide.addText(title, {
    x: LAYOUT.marginL, y: LAYOUT.headerY, w: 11.5, h: 0.45,
    fontFace: FONT, ...TYPE.slideTitle, color: COLORS.navy,
  });
  if (subtitle) {
    slide.addText(subtitle, {
      x: LAYOUT.marginL, y: 0.8, w: 11.5, h: 0.22,
      fontFace: FONT, ...TYPE.bodyLarge, color: COLORS.muted,
    });
  }
  slide.addShape(pptx.ShapeType.line, {
    x: LAYOUT.marginL, y: 1.1, w: LAYOUT.contentW, h: 0,
    line: { color: COLORS.line, pt: 1 },
  });
}

/**
 * Standard footer with disclaimer, company name, and page number.
 */
export function addFooter(pptx, slide, pageNum = '') {
  slide.addShape(pptx.ShapeType.line, {
    x: LAYOUT.marginL, y: LAYOUT.footerLineY, w: LAYOUT.contentW, h: 0,
    line: { color: COLORS.line, pt: 0.5 },
  });
  slide.addText(
    'Illustrativ modellportefølje – ikke personlig investeringsråd eller egnethetsvurdering.',
    {
      x: LAYOUT.marginL, y: LAYOUT.footerTextY, w: 9, h: 0.18,
      fontFace: FONT, ...TYPE.micro, color: COLORS.muted,
    }
  );
  slide.addText('Pensum Asset Management AS', {
    x: 10.2, y: LAYOUT.footerTextY, w: 2.8, h: 0.18,
    fontFace: FONT, ...TYPE.micro, color: COLORS.muted, align: 'right',
  });
  if (pageNum) {
    slide.addText(String(pageNum), {
      x: 12.5, y: LAYOUT.footerTextY, w: 0.5, h: 0.18,
      fontFace: FONT, ...TYPE.micro, color: COLORS.muted, align: 'right',
    });
  }
}

/**
 * Premium KPI card with subtle shadow and accent stripe.
 */
export function addKpiCard(pptx, slide, x, y, w, h, label, value, opts = {}) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x, y, w, h, rectRadius: 0.06,
    fill: { color: safeColor(opts.bg || COLORS.lightBlue) },
    line: { color: safeColor(opts.borderColor || COLORS.line), pt: 0.5 },
    shadow: { type: 'outer', blur: 3, offset: 1, opacity: 0.08, color: '000000' },
  });
  // Top accent stripe
  slide.addShape(pptx.ShapeType.rect, {
    x: x + 0.08, y: y + 0.05, w: w - 0.16, h: 0.04,
    fill: { color: safeColor(opts.accentColor || COLORS.accent) },
  });
  slide.addText(label, {
    x: x + 0.12, y: y + 0.16, w: w - 0.24, h: 0.18,
    fontFace: FONT, ...TYPE.kpiLabel, color: COLORS.muted,
  });
  slide.addText(String(value), {
    x: x + 0.12, y: y + 0.36, w: w - 0.24, h: 0.35,
    fontFace: FONT, fontSize: opts.valueFontSize || TYPE.kpiValue.fontSize,
    bold: true, color: COLORS.navy,
  });
}

/**
 * Row of evenly spaced KPI cards.
 */
export function addKpiRow(pptx, slide, metrics, y, opts = {}) {
  const count = Math.min(metrics.length, 6);
  if (!count) return;
  const totalW = opts.totalW || LAYOUT.contentW;
  const gap = opts.gap || 0.15;
  const w = (totalW - gap * (count - 1)) / count;
  const startX = opts.startX || LAYOUT.marginL;
  metrics.slice(0, count).forEach((m, i) => {
    addKpiCard(pptx, slide, startX + i * (w + gap), y, w, opts.h || 0.85, m.label, m.value, m);
  });
}

/**
 * Donut chart with optional legend.
 */
export function addDonutChart(pptx, slide, data, x, y, opts = {}) {
  const size = opts.size || 2.4;
  const filtered = data.filter(d => d.value > 0);
  if (!filtered.length) return;
  const donutPairs = filtered
    .map((d) => ({ label: String(d.name ?? ''), value: Number(d.value) }))
    .filter((d) => Number.isFinite(d.value));
  if (!donutPairs.length) return;
  slide.addChart(pptx.ChartType.doughnut, [{
    name: opts.title || 'Fordeling',
    labels: donutPairs.map((d) => d.label),
    values: donutPairs.map((d) => d.value),
  }], {
    x, y, w: size, h: size,
    showLegend: false,
    showTitle: false,
    holeSize: opts.holeSize || 55,
    chartColors: filtered.map((d, i) => safeColor(d.color || PRODUCT_COLORS[i % PRODUCT_COLORS.length])),
  });
  if (opts.showLegend !== false) {
    const lx = x + size + 0.2;
    const ly = y + 0.15;
    filtered.forEach((d, i) => {
      const cy = ly + i * 0.28;
      slide.addShape(pptx.ShapeType.ellipse, {
        x: lx, y: cy + 0.04, w: 0.13, h: 0.13,
        fill: { color: safeColor(d.color || PRODUCT_COLORS[i % PRODUCT_COLORS.length]) },
      });
      slide.addText(d.name, {
        x: lx + 0.2, y: cy, w: opts.legendW || 2.4, h: 0.21,
        fontFace: FONT, ...TYPE.bodySmall, color: COLORS.text,
      });
      slide.addText(`${d.value.toFixed(1)}%`, {
        x: lx + (opts.legendW || 2.4) + 0.08, y: cy, w: 0.65, h: 0.21,
        fontFace: FONT, ...TYPE.bodySmall, bold: true, color: COLORS.navy, align: 'right',
      });
    });
  }
}

/**
 * Horizontal bar chart with labels and values.
 */
export function addHBarChart(pptx, slide, data, x, y, w, opts = {}) {
  const barH = opts.barH || 0.26;
  const gap = 0.06;
  const maxVal = opts.maxVal || Math.max(...data.map(d => d.value), 1);
  const labelW = opts.labelW || 1.8;
  data.forEach((d, i) => {
    const cy = y + i * (barH + gap);
    slide.addText(d.name, {
      x, y: cy, w: labelW, h: barH,
      fontFace: FONT, ...TYPE.bodySmall, color: COLORS.text, valign: 'mid',
    });
    // Background track
    slide.addShape(pptx.ShapeType.roundRect, {
      x: x + labelW + 0.08, y: cy + 0.03, w: w - labelW - 0.08, h: barH - 0.06,
      rectRadius: 0.04, fill: { color: COLORS.lightGray },
    });
    // Value bar
    const barW = Math.max(0.04, (d.value / maxVal) * (w - labelW - 0.08));
    slide.addShape(pptx.ShapeType.roundRect, {
      x: x + labelW + 0.08, y: cy + 0.03, w: barW, h: barH - 0.06,
      rectRadius: 0.04, fill: { color: safeColor(d.color || COLORS.accent) },
    });
    slide.addText(fmtPct(d.value), {
      x: x + w - 0.65, y: cy, w: 0.65, h: barH,
      fontFace: FONT, ...TYPE.caption, bold: true, color: COLORS.navy, align: 'right', valign: 'mid',
    });
  });
}

/**
 * Info box with key-value pairs.
 */
export function addInfoBox(pptx, slide, x, y, w, h, title, items, opts = {}) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x, y, w, h, rectRadius: 0.08,
    fill: { color: safeColor(opts.bg || COLORS.lightBlue) },
    line: { color: safeColor(opts.borderColor || COLORS.line), pt: 0.5 },
  });
  slide.addText(title, {
    x: x + 0.15, y: y + 0.1, w: w - 0.3, h: 0.24,
    fontFace: FONT, ...TYPE.cardTitle, color: COLORS.navy,
  });
  items.forEach(([label, val], i) => {
    const iy = y + 0.42 + i * 0.36;
    slide.addText(label, {
      x: x + 0.15, y: iy, w: w * 0.45, h: 0.16,
      fontFace: FONT, ...TYPE.bodySmall, color: COLORS.muted,
    });
    slide.addText(String(val), {
      x: x + w * 0.45, y: iy, w: w * 0.5, h: 0.16,
      fontFace: FONT, ...TYPE.body, bold: true, color: COLORS.navy, align: 'right',
    });
  });
}

/**
 * Build a styled table with header and alternating row colors.
 */
export function buildTable(headerCols, rows, opts = {}) {
  const headerRow = headerCols.map(col => ({
    text: col,
    options: {
      fontFace: FONT, ...TYPE.bodySmall, bold: true,
      color: COLORS.white, fill: { color: COLORS.navy },
      align: 'left', valign: 'mid',
    },
  }));
  const dataRows = rows.map((row, ri) => row.map((cell, ci) => ({
    text: String(cell ?? '–'),
    options: {
      fontFace: FONT, ...TYPE.bodySmall, color: COLORS.text, valign: 'mid',
      fill: { color: ri % 2 === 0 ? COLORS.white : COLORS.lightGray },
      ...(opts.colAlign?.[ci] ? { align: opts.colAlign[ci] } : {}),
      ...(opts.colBold?.[ci] ? { bold: true } : {}),
    },
  })));
  return [headerRow, ...dataRows];
}

/**
 * Numbered reason/feature card with circle number and text.
 */
export function addNumberedCard(pptx, slide, x, y, w, h, num, title, text, opts = {}) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x, y, w, h, rectRadius: 0.06,
    fill: { color: safeColor(opts.bg || COLORS.lightBlue) },
    line: { color: COLORS.line, pt: 0.5 },
  });
  // Number circle
  slide.addShape(pptx.ShapeType.ellipse, {
    x: x + 0.12, y: y + 0.12, w: 0.3, h: 0.3,
    fill: { color: safeColor(opts.circleColor || COLORS.navy) },
  });
  slide.addText(String(num), {
    x: x + 0.12, y: y + 0.12, w: 0.3, h: 0.3,
    fontFace: FONT, fontSize: 11, bold: true, color: COLORS.white, align: 'center', valign: 'mid',
  });
  slide.addText(title, {
    x: x + 0.5, y: y + 0.1, w: w - 0.65, h: 0.3,
    fontFace: FONT, ...TYPE.cardTitle, color: COLORS.navy, valign: 'mid',
  });
  slide.addText(text, {
    x: x + 0.15, y: y + 0.48, w: w - 0.3, h: h - 0.58,
    fontFace: FONT, ...TYPE.bodySmall, color: COLORS.text, valign: 'top', lineSpacingMultiple: 1.25,
  });
}

/**
 * Step indicator with number circle, title, and description (vertical layout).
 */
export function addStepItem(pptx, slide, x, y, num, title, desc, opts = {}) {
  const circleSize = opts.circleSize || 0.32;
  slide.addShape(pptx.ShapeType.ellipse, {
    x, y: y + 0.02, w: circleSize, h: circleSize,
    fill: { color: safeColor(opts.circleColor || COLORS.navy) },
  });
  slide.addText(String(num), {
    x, y: y + 0.02, w: circleSize, h: circleSize,
    fontFace: FONT, fontSize: 12, bold: true, color: COLORS.white, align: 'center', valign: 'mid',
  });
  slide.addText(title, {
    x: x + circleSize + 0.12, y, w: opts.titleW || 3.6, h: 0.24,
    fontFace: FONT, ...TYPE.cardTitle, color: COLORS.navy,
  });
  slide.addText(desc, {
    x: x + circleSize + 0.12, y: y + 0.28, w: opts.descW || 3.6, h: opts.descH || 0.4,
    fontFace: FONT, ...TYPE.bodySmall, color: COLORS.text, lineSpacingMultiple: 1.2,
  });
}

/**
 * Create a new pptxgen instance with Pensum defaults.
 */
export function createPensumPptx(kundeNavn = 'Kunde') {
  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_WIDE';
  pptx.author = 'Pensum Asset Management';
  pptx.company = 'Pensum Asset Management AS';
  pptx.subject = 'Investeringsforslag';
  pptx.title = `Pensum – Investeringsforslag – ${kundeNavn}`;
  return pptx;
}
