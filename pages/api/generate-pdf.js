import fs from 'fs';
import path from 'path';
import PptxGenJSImport from 'pptxgenjs';
import JSZipImport from 'jszip';
import { defaultPensumProdukter, defaultProduktEksponering, defaultProduktMetadata } from '../../data/pensumDefaults';

const PptxGenJS = typeof PptxGenJSImport === 'function'
  ? PptxGenJSImport
  : (PptxGenJSImport?.default || PptxGenJSImport?.PptxGenJS);

const JSZip = JSZipImport?.default || JSZipImport;

const COLORS = {
  navy: '0D2240',
  navy2: '17365D',
  blue: '5B9BD5',
  lightBlue: 'DCEAF7',
  salmon: 'D4886B',
  green: '2E8B57',
  yellow: 'D6A64F',
  text: '243447',
  muted: '6B7C93',
  line: 'D9E2EC',
  bg: 'F5F7FA',
  card: 'FFFFFF',
  soft: 'EEF3F8',
  red: 'A94442',
  white: 'FFFFFF'
};

const DEFAULT_TEMPLATE_FILENAMES = [
  'Mal - Forslag til investeringsportefolje 2026.pptx',
  'Mal - Forslag til investeringsportefølje 2026.pptx'
];

const REPORT_DATE = '2026-02-28';

const PRODUCT_NAME = {
  'global-core-active': 'Pensum Global Core Active',
  'global-edge': 'Pensum Global Edge',
  basis: 'Pensum Basis',
  'global-hoyrente': 'Pensum Global Høyrente',
  'nordisk-hoyrente': 'Pensum Nordisk Høyrente',
  'norge-a': 'Pensum Norge A',
  'energy-a': 'Pensum Global Energy A',
  'banking-d': 'Pensum Nordic Banking Sector D',
  'financial-d': 'Pensum Financial Opportunity Fund D',
  'turnstone-pe': 'Turnstone Private Equity',
  'amaron-re': 'Amaron Real Estate',
  'unoterte-aksjer': 'Unoterte aksjer'
};

const PRODUCT_COLORS = {
  'global-core-active': '0D2240',
  'global-edge': '5B9BD5',
  basis: '1B3A5F',
  'global-hoyrente': '2E8B57',
  'nordisk-hoyrente': '7C3AED',
  'norge-a': 'B22222',
  'energy-a': 'D6A64F',
  'banking-d': '0891B2',
  'financial-d': 'D4886B',
  'turnstone-pe': '444444',
  'amaron-re': '8B5E3C',
  'unoterte-aksjer': '7A7A7A'
};

function num(v, fb = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fb;
}

function round1(v) {
  return Math.round(num(v) * 10) / 10;
}

function cleanFilename(name = '') {
  return String(name || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function formatCurrency(v) {
  return new Intl.NumberFormat('nb-NO', {
    style: 'currency',
    currency: 'NOK',
    maximumFractionDigits: 0
  }).format(num(v));
}

function formatCompactCurrency(v) {
  const value = num(v);
  if (Math.abs(value) >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)} mrd. kr`;
  if (Math.abs(value) >= 1_000_000) return `${(value / 1_000_000).toFixed(1)} mill. kr`;
  if (Math.abs(value) >= 1_000) return `${(value / 1_000).toFixed(0)}k kr`;
  return `${value.toFixed(0)} kr`;
}

function pct(v, digits = 1) {
  return `${num(v).toFixed(digits)}%`;
}

function safeText(v, fallback = '—') {
  const str = String(v ?? '').trim();
  return str || fallback;
}

function flattenProducts() {
  const all = [
    ...(defaultPensumProdukter?.enkeltfond || []),
    ...(defaultPensumProdukter?.fondsportefoljer || []),
    ...(defaultPensumProdukter?.alternative || [])
  ];
  return all.reduce((acc, p) => {
    if (!p?.id) return acc;
    acc[p.id] = {
      ...p,
      ...(defaultProduktMetadata?.[p.id] || {})
    };
    return acc;
  }, {});
}

function aggregateWeightedRows(rows = [], weightField = 'vekt') {
  const totalWeight = rows.reduce((sum, row) => sum + num(row?.[weightField]), 0) || 1;
  return rows.map((row) => ({ ...row, normalizedWeight: num(row?.[weightField]) / totalWeight }));
}

function aggregateExposureByField(productExposure = {}, solutionRows = [], field = 'regioner', limit = 8) {
  const weighted = aggregateWeightedRows(solutionRows, 'vekt');
  const map = new Map();
  weighted.forEach((solution) => {
    const arr = productExposure?.[solution.id]?.[field];
    if (!Array.isArray(arr)) return;
    arr.forEach((item) => {
      const key = safeText(item?.navn, 'Ukjent');
      const current = map.get(key) || 0;
      map.set(key, current + (num(item?.vekt) * solution.normalizedWeight));
    });
  });
  return [...map.entries()]
    .map(([navn, vekt]) => ({ navn, vekt: round1(vekt) }))
    .sort((a, b) => b.vekt - a.vekt)
    .slice(0, limit);
}

function aggregateUnderlyingHoldings(productExposure = {}, solutionRows = [], limit = 10) {
  const weighted = aggregateWeightedRows(solutionRows, 'vekt');
  const map = new Map();
  weighted.forEach((solution) => {
    const arr = productExposure?.[solution.id]?.underliggende;
    if (!Array.isArray(arr)) return;
    arr.forEach((item) => {
      const key = safeText(item?.navn, 'Ukjent');
      const current = map.get(key) || 0;
      map.set(key, current + (num(item?.vekt) * solution.normalizedWeight));
    });
  });
  return [...map.entries()]
    .map(([navn, vekt]) => ({ navn, vekt: round1(vekt) }))
    .sort((a, b) => b.vekt - a.vekt)
    .slice(0, limit);
}

function pickTemplateFromRepo(preferredFilename = '') {
  const baseDir = process.cwd();
  const templateDirs = [
    path.join(baseDir, 'uploads'),
    path.join(baseDir, 'public', 'uploads'),
    path.join(baseDir, 'public', 'templates')
  ];

  const candidates = [];
  templateDirs.forEach((dirPath) => {
    if (!fs.existsSync(dirPath)) return;
    fs.readdirSync(dirPath, { withFileTypes: true }).forEach((entry) => {
      if (!entry.isFile()) return;
      if (!/\.pptx?$/i.test(entry.name)) return;
      const fullPath = path.join(dirPath, entry.name);
      const stat = fs.statSync(fullPath);
      candidates.push({
        fullPath,
        filename: entry.name,
        relativePath: path.relative(baseDir, fullPath),
        mtimeMs: stat.mtimeMs
      });
    });
  });

  if (candidates.length === 0) return null;

  const preferred = cleanFilename(preferredFilename);
  const exactMatch = preferred
    ? candidates.find((c) => cleanFilename(c.filename) === preferred)
    : null;

  const defaultMatch = candidates.find((c) => {
    const cleaned = cleanFilename(c.filename);
    return DEFAULT_TEMPLATE_FILENAMES.some((name) => cleanFilename(name) === cleaned)
      || /mal.*investeringsportefolje.*2026.*\.pptx$/i.test(cleaned);
  });

  const chosen = exactMatch || defaultMatch || [...candidates].sort((a, b) => b.mtimeMs - a.mtimeMs)[0];

  return {
    source: `repo:${chosen.relativePath}`,
    filename: path.basename(chosen.fullPath),
    mime: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    buffer: fs.readFileSync(chosen.fullPath)
  };
}

function parseDataUrlToBuffer(dataUrl = '') {
  const m = String(dataUrl).match(/^data:([^;]+);base64,(.+)$/);
  if (!m) return null;
  return { mime: m[1], buffer: Buffer.from(m[2], 'base64') };
}

function buildNormalizedData(data = {}) {
  const productUniverse = flattenProducts();
  const reportDate = data.dato || new Date(REPORT_DATE).toLocaleDateString('nb-NO');
  const total = num(data.totalKapital);
  const expected = num(data.vektetAvkastning, 7.5);
  const years = Math.max(1, Math.round(num(data.horisont, 10)));
  const assetAlloc = (Array.isArray(data.allokering) ? data.allokering : [])
    .map((a) => ({
      navn: safeText(a?.navn, 'Ukjent'),
      vekt: round1(a?.vekt),
      avkastning: num(a?.avkastning, 0),
      belop: total * (num(a?.vekt, 0) / 100)
    }))
    .filter((a) => a.vekt > 0);

  const selectedIds = Array.isArray(data.produkterIBruk) && data.produkterIBruk.length > 0
    ? data.produkterIBruk
    : Object.keys(productUniverse);

  const payloadProducts = Array.isArray(data.pensumProdukter) ? data.pensumProdukter : [];
  const payloadProductMap = payloadProducts.reduce((acc, p) => {
    if (p?.id) acc[p.id] = p;
    return acc;
  }, {});

  const selectedSolutionRows = ((Array.isArray(data.pensumAllokering) && data.pensumAllokering.length > 0)
    ? data.pensumAllokering.filter((p) => selectedIds.includes(p.id))
    : selectedIds.map((id) => ({ id, vekt: 100 / Math.max(1, selectedIds.length) })))
    .map((row) => {
      const meta = productUniverse[row.id] || {};
      const fromPayload = payloadProductMap[row.id] || {};
      const merged = { ...meta, ...fromPayload };
      return {
        id: row.id,
        navn: PRODUCT_NAME[row.id] || merged.navn || row.id,
        vekt: round1(row.vekt),
        kategoriLabel: merged.kategoriLabel || merged.aktivatype || 'Pensum-løsning',
        rolle: merged.rolle || 'Rolle ikke definert',
        beskrivelse: merged.beskrivelse || 'Pensum-løsning',
        investeringside: merged.investeringside || merged.beskrivelse || 'Pensum-løsning',
        riskLabel: merged.riskLabel || 'Moderat',
        likviditetLabel: merged.likviditetLabel || merged.likviditet || 'Likvid',
        expectedReturn: num(merged.expectedReturn, merged.aarlig3ar ?? expected),
        expectedYield: num(merged.expectedYield, 0),
        hovedpoenger: Array.isArray(merged.hovedpoenger) ? merged.hovedpoenger : [],
        aar2026: merged.aar2026,
        aar2025: merged.aar2025,
        aar2024: merged.aar2024,
        aar2023: merged.aar2023,
        aar2022: merged.aar2022,
        color: PRODUCT_COLORS[row.id] || COLORS.blue
      };
    })
    .filter((row) => row.vekt > 0)
    .sort((a, b) => b.vekt - a.vekt);

  const weightedSolutions = aggregateWeightedRows(selectedSolutionRows, 'vekt');
  const weightedExpectedReturn = weightedSolutions.reduce((sum, row) => sum + row.normalizedWeight * num(row.expectedReturn, expected), 0) || expected;
  const weightedYield = weightedSolutions.reduce((sum, row) => sum + row.normalizedWeight * num(row.expectedYield, 0), 0);

  const productExposure = data.produktEksponering || {};
  const sectors = (data?.eksponering?.sektorer?.length ? data.eksponering.sektorer : aggregateExposureByField(productExposure, selectedSolutionRows, 'sektorer', 8))
    .map((r) => ({ navn: safeText(r?.navn, 'Ukjent'), vekt: round1(r?.vekt) }));
  const regions = (data?.eksponering?.regioner?.length ? data.eksponering.regioner : aggregateExposureByField(productExposure, selectedSolutionRows, 'regioner', 8))
    .map((r) => ({ navn: safeText(r?.navn, 'Ukjent'), vekt: round1(r?.vekt) }));
  const styles = aggregateExposureByField(productExposure, selectedSolutionRows, 'stil', 6);
  const holdings = aggregateUnderlyingHoldings(productExposure, selectedSolutionRows, 10);

  const weightedYear = (field) => {
    const vals = weightedSolutions
      .map((row) => ({ weight: row.normalizedWeight, value: num(row?.[field], NaN) }))
      .filter((row) => Number.isFinite(row.value));
    if (!vals.length) return null;
    return round1(vals.reduce((sum, row) => sum + row.weight * row.value, 0));
  };

  const yearlySummary = [
    { year: '2026 YTD', value: weightedYear('aar2026') },
    { year: '2025', value: weightedYear('aar2025') },
    { year: '2024', value: weightedYear('aar2024') },
    { year: '2023', value: weightedYear('aar2023') },
    { year: '2022', value: weightedYear('aar2022') }
  ];

  const portfolioSeries = buildWeightedPortfolioSeries(data.produktHistorikk || {}, selectedSolutionRows);
  const annualizedVol = calcAnnualizedVolatility(portfolioSeries.monthlyReturns);
  const maxDrawdown = calcMaxDrawdown(portfolioSeries.indexValues);

  const scenario = {
    conservative: total * Math.pow(1 + Math.max(expected - 2.5, 2) / 100, years),
    base: total * Math.pow(1 + expected / 100, years),
    optimistic: total * Math.pow(1 + (expected + 2.5) / 100, years)
  };

  const liquiditySplit = {
    likvid: assetAlloc.filter((a) => !/private|eiendom/i.test(a.navn)).reduce((sum, a) => sum + a.vekt, 0),
    illikvid: assetAlloc.filter((a) => /private|eiendom/i.test(a.navn)).reduce((sum, a) => sum + a.vekt, 0)
  };

  return {
    kundeNavn: safeText(data.kundeNavn, 'Investor'),
    radgiver: safeText(data.radgiver, 'Pensum Asset Management'),
    reportDate,
    risikoProfil: safeText(data.risikoProfil, 'Moderat'),
    years,
    total,
    assetAlloc,
    selectedSolutionRows,
    weightedExpectedReturn,
    weightedYield,
    sectors,
    regions,
    styles,
    holdings,
    yearlySummary,
    portfolioSeries,
    annualizedVol,
    maxDrawdown,
    scenario,
    liquiditySplit,
    malConfig: data.malConfig || {}
  };
}

function buildWeightedPortfolioSeries(historikkMap = {}, selectedSolutionRows = []) {
  const weighted = aggregateWeightedRows(selectedSolutionRows, 'vekt');
  const seriesById = weighted.map((solution) => {
    const points = Array.isArray(historikkMap?.[solution.id]?.data) ? historikkMap[solution.id].data : [];
    const cleaned = points
      .map((p) => ({ dato: String(p?.dato || ''), verdi: num(p?.verdi, NaN) }))
      .filter((p) => p.dato && Number.isFinite(p.verdi))
      .sort((a, b) => a.dato.localeCompare(b.dato));
    return { id: solution.id, weight: solution.normalizedWeight, data: cleaned };
  }).filter((row) => row.data.length > 1);

  if (!seriesById.length) return { labels: [], indexValues: [], monthlyReturns: [] };

  const commonDates = seriesById.reduce((acc, row) => {
    const dateSet = new Set(row.data.map((p) => p.dato));
    return acc.filter((d) => dateSet.has(d));
  }, seriesById[0].data.map((p) => p.dato));

  const usedDates = commonDates.slice(-24);
  const dateIndex = {};
  usedDates.forEach((d, idx) => { dateIndex[d] = idx; });

  const indexed = usedDates.map(() => 0);
  seriesById.forEach((row) => {
    const firstVal = row.data.find((p) => usedDates.includes(p.dato))?.verdi;
    if (!Number.isFinite(firstVal) || firstVal === 0) return;
    row.data.forEach((p) => {
      if (dateIndex[p.dato] === undefined) return;
      indexed[dateIndex[p.dato]] += ((p.verdi / firstVal) * 100) * row.weight;
    });
  });

  const monthlyReturns = [];
  for (let i = 1; i < indexed.length; i += 1) {
    const prev = indexed[i - 1];
    const curr = indexed[i];
    if (prev > 0 && curr > 0) monthlyReturns.push((curr / prev) - 1);
  }

  const labels = usedDates.map((d) => {
    const [year, month] = d.split('-');
    return `${month}.${String(year).slice(2)}`;
  });

  return { labels, indexValues: indexed.map((v) => round1(v)), monthlyReturns };
}

function calcAnnualizedVolatility(monthlyReturns = []) {
  if (!monthlyReturns.length) return 0;
  const mean = monthlyReturns.reduce((a, b) => a + b, 0) / monthlyReturns.length;
  const variance = monthlyReturns.reduce((sum, v) => sum + ((v - mean) ** 2), 0) / monthlyReturns.length;
  return round1(Math.sqrt(variance) * Math.sqrt(12) * 100);
}

function calcMaxDrawdown(indexValues = []) {
  let peak = indexValues[0] || 100;
  let maxDD = 0;
  indexValues.forEach((value) => {
    if (value > peak) peak = value;
    const dd = peak > 0 ? ((value - peak) / peak) * 100 : 0;
    if (dd < maxDD) maxDD = dd;
  });
  return round1(maxDD);
}

function addBrandHeader(slide, title, subtitle = '') {
  slide.addShape(PptxGenJS.ShapeType.rect, { x: 0, y: 0, w: 13.33, h: 0.7, fill: { color: COLORS.white }, line: { color: COLORS.white, pt: 0 } });
  slide.addText('PENSUM ASSET MANAGEMENT', { x: 0.6, y: 0.18, w: 3.6, h: 0.2, fontSize: 11, bold: true, color: COLORS.navy });
  slide.addText(title, { x: 0.6, y: 0.9, w: 8.4, h: 0.35, fontSize: 24, bold: true, color: COLORS.navy });
  if (subtitle) {
    slide.addText(subtitle, { x: 0.6, y: 1.28, w: 8.9, h: 0.28, fontSize: 11, color: COLORS.muted });
  }
  slide.addShape(PptxGenJS.ShapeType.line, { x: 0.6, y: 1.62, w: 12.1, h: 0, line: { color: COLORS.line, pt: 1.2 } });
}

function addFooter(slide, pageNo) {
  slide.addShape(PptxGenJS.ShapeType.line, { x: 0.6, y: 7.05, w: 12.1, h: 0, line: { color: COLORS.line, pt: 1 } });
  slide.addText(`Pensum Asset Management  |  Side ${pageNo}`, { x: 0.6, y: 7.1, w: 4.5, h: 0.2, fontSize: 8.5, color: COLORS.muted });
}

function addCard(slide, { x, y, w, h, title, value, subtitle, accent = COLORS.navy, fill = COLORS.card, valueSize = 20 }) {
  slide.addShape(PptxGenJS.ShapeType.roundRect, { x, y, w, h, rectRadius: 0.08, fill: { color: fill }, line: { color: COLORS.line, pt: 1 } });
  slide.addShape(PptxGenJS.ShapeType.rect, { x: x + 0.16, y: y + 0.16, w: 0.08, h: h - 0.32, fill: { color: accent }, line: { color: accent, pt: 0 } });
  slide.addText(title, { x: x + 0.35, y: y + 0.18, w: w - 0.5, h: 0.18, fontSize: 9, color: COLORS.muted, bold: true });
  slide.addText(value, { x: x + 0.35, y: y + 0.5, w: w - 0.45, h: 0.34, fontSize: valueSize, bold: true, color: COLORS.navy });
  if (subtitle) {
    slide.addText(subtitle, { x: x + 0.35, y: y + h - 0.45, w: w - 0.45, h: 0.2, fontSize: 8.5, color: COLORS.muted });
  }
}

function addBulletList(slide, items = [], { x, y, w, h, fontSize = 12, color = COLORS.text, bulletIndent = 16 }) {
  const runs = [];
  items.forEach((item) => {
    runs.push({ text: item, options: { bullet: { indent: bulletIndent } } });
  });
  slide.addText(runs, { x, y, w, h, fontSize, color, paraSpaceAfterPt: 10, breakLine: true, valign: 'top' });
}

function addSectionLabel(slide, text, x, y, w = 4) {
  slide.addText(text, { x, y, w, h: 0.22, fontSize: 10, bold: true, color: COLORS.salmon, allCaps: true });
}

function addDataTable(slide, rows, opts = {}) {
  slide.addTable(rows, {
    x: opts.x || 0.7,
    y: opts.y || 1.8,
    w: opts.w || 12,
    h: opts.h,
    fontSize: opts.fontSize || 10,
    border: { pt: 1, color: COLORS.line },
    fill: COLORS.white,
    color: COLORS.text,
    margin: 0.06,
    bold: opts.bold,
    autoFit: true,
    rowH: opts.rowH || 0.28,
    ...opts.extra
  });
}

function addBarList(slide, items = [], { x = 0.8, y = 2.0, w = 5.5, maxValue = 100, color = COLORS.navy, rowGap = 0.48, labelW = 2.2, valueDigits = 1 } = {}) {
  const innerW = Math.max(0.8, w - labelW - 0.85);
  items.forEach((item, idx) => {
    const yy = y + idx * rowGap;
    const value = num(item?.vekt, 0);
    const ratio = Math.max(0, Math.min(1, value / Math.max(1, maxValue)));
    slide.addText(safeText(item?.navn, 'Ukjent'), { x, y: yy - 0.02, w: labelW, h: 0.18, fontSize: 9.5, color: COLORS.text, bold: idx < 3 });
    slide.addShape(PptxGenJS.ShapeType.roundRect, { x: x + labelW + 0.1, y: yy + 0.01, w: innerW, h: 0.14, rectRadius: 0.03, fill: { color: COLORS.soft }, line: { color: COLORS.soft, pt: 0 } });
    slide.addShape(PptxGenJS.ShapeType.roundRect, { x: x + labelW + 0.1, y: yy + 0.01, w: Math.max(0.08, innerW * ratio), h: 0.14, rectRadius: 0.03, fill: { color }, line: { color, pt: 0 } });
    slide.addText(`${value.toFixed(valueDigits)}%`, { x: x + labelW + innerW + 0.18, y: yy - 0.02, w: 0.65, h: 0.18, fontSize: 9.2, color: COLORS.muted, align: 'right' });
  });
}

function buildProfessionalPptx(payload) {
  const pptx = new PptxGenJS();
  const d = buildNormalizedData(payload);
  pptx.layout = 'LAYOUT_WIDE';
  pptx.author = 'OpenAI for Pensum Asset Management';
  pptx.company = 'Pensum Asset Management';
  pptx.subject = `Investeringsforslag - ${d.kundeNavn}`;
  pptx.title = `Pensum investeringsforslag - ${d.kundeNavn}`;
  pptx.lang = 'nb-NO';
  pptx.theme = { headFontFace: 'Aptos', bodyFontFace: 'Aptos', lang: 'nb-NO' };

  const topSolutions = d.selectedSolutionRows.slice(0, 6);
  const sectorRows = d.sectors.slice(0, 7);
  const regionRows = d.regions.slice(0, 7);
  const styleRows = d.styles.slice(0, 6);
  const holdingRows = d.holdings.slice(0, 8);
  const summaryRows = d.yearlySummary.slice(0, 6);

  {
    const s = pptx.addSlide();
    s.background = { color: COLORS.bg };
    s.addShape(PptxGenJS.ShapeType.rect, { x: 0, y: 0, w: 13.33, h: 0.82, fill: { color: COLORS.white }, line: { color: COLORS.white, pt: 0 } });
    s.addText('PENSUM ASSET MANAGEMENT', { x: 0.6, y: 0.22, w: 4.0, h: 0.2, fontSize: 12, bold: true, color: COLORS.navy });
    s.addText('Forslag til investeringsportefølje', { x: 0.75, y: 1.35, w: 6.9, h: 0.45, fontSize: 26, bold: true, color: COLORS.navy });
    s.addText('Illustrativ modellportefølje basert på valgt risikoprofil, tidshorisont og Pensum-løsninger.', { x: 0.75, y: 1.82, w: 6.8, h: 0.35, fontSize: 12, color: COLORS.muted });
    s.addShape(PptxGenJS.ShapeType.roundRect, { x: 0.75, y: 2.45, w: 4.9, h: 1.45, rectRadius: 0.08, fill: { color: COLORS.white }, line: { color: COLORS.line, pt: 1 } });
    s.addText('Utarbeidet for', { x: 1.05, y: 2.72, w: 1.8, h: 0.18, fontSize: 9, color: COLORS.muted, bold: true });
    s.addText(d.kundeNavn, { x: 1.05, y: 3.0, w: 3.4, h: 0.28, fontSize: 20, bold: true, color: COLORS.navy });
    s.addText(`Dato: ${d.reportDate}`, { x: 1.05, y: 3.35, w: 2.1, h: 0.18, fontSize: 9.5, color: COLORS.muted });
    s.addShape(PptxGenJS.ShapeType.roundRect, { x: 7.15, y: 1.4, w: 5.35, h: 4.25, rectRadius: 0.08, fill: { color: COLORS.navy }, line: { color: COLORS.navy, pt: 0 } });
    addCard(s, { x: 7.55, y: 1.85, w: 2.1, h: 1.05, title: 'Investerbar kapital', value: formatCompactCurrency(d.total), subtitle: 'Oppgitt kapital', accent: COLORS.salmon, valueSize: 16 });
    addCard(s, { x: 9.9, y: 1.85, w: 2.1, h: 1.05, title: 'Risikoprofil', value: d.risikoProfil, subtitle: `${d.years} års horisont`, accent: COLORS.blue, valueSize: 16 });
    addCard(s, { x: 7.55, y: 3.15, w: 2.1, h: 1.05, title: 'Forv. avkastning', value: pct(d.weightedExpectedReturn), subtitle: 'Årlig estimat', accent: COLORS.green, valueSize: 16 });
    addCard(s, { x: 9.9, y: 3.15, w: 2.1, h: 1.05, title: 'Forv. yield', value: pct(d.weightedYield), subtitle: 'Løpende estimat', accent: COLORS.yellow, valueSize: 16 });
    s.addText('Porteføljen er satt sammen for å være forklarbar i møte, robust i oppfølging og enkel å sende som investorvennlig oppsummering i etterkant.', { x: 7.55, y: 4.55, w: 4.5, h: 0.55, fontSize: 10.5, color: COLORS.white });
    addFooter(s, 1);
  }

  {
    const s = pptx.addSlide();
    s.background = { color: COLORS.bg };
    addBrandHeader(s, 'Viktig informasjon', 'Dette dokumentet er en illustrativ investeringsskisse i pre-kundefase.');
    addSectionLabel(s, 'Formål', 0.8, 1.95);
    addBulletList(s, [
      'Presentasjonen viser en modellportefølje basert på overordnede opplysninger og skal brukes som diskusjonsgrunnlag i tidlig fase.',
      'Dokumentet er ikke en personlig investeringsanbefaling og erstatter ikke egnethetsvurdering, kundeetablering eller ordinær rådgivningsprosess.',
      'Skatt, struktur, juridiske forhold og investorens samlede økonomiske situasjon må vurderes særskilt før eventuell implementering.'
    ], { x: 0.85, y: 2.25, w: 11.6, h: 2.2, fontSize: 12 });
    addSectionLabel(s, 'Hva denne skissen skal vise', 0.8, 4.95);
    addBulletList(s, [
      'Hvordan kapitalen kan fordeles mellom aktivaklasser og Pensum-løsninger.',
      'Hvorfor de valgte løsningene kan fungere sammen i én helhetlig portefølje.',
      'Hvordan forslaget kan kommuniseres tydelig og profesjonelt til investor.'
    ], { x: 0.85, y: 5.25, w: 11.6, h: 1.2, fontSize: 11.5 });
    addFooter(s, 2);
  }

  {
    const s = pptx.addSlide();
    s.background = { color: COLORS.bg };
    addBrandHeader(s, 'Executive summary', 'Kort oppsummering av hovedtrekkene i forslaget.');
    addCard(s, { x: 0.75, y: 2.0, w: 2.6, h: 1.0, title: 'Kapital', value: formatCompactCurrency(d.total), subtitle: 'Til fordeling', accent: COLORS.navy, valueSize: 16 });
    addCard(s, { x: 3.55, y: 2.0, w: 2.6, h: 1.0, title: 'Likvid / illikvid', value: `${pct(d.liquiditySplit.likvid,0)} / ${pct(d.liquiditySplit.illikvid,0)}`, subtitle: 'Andel av porteføljen', accent: COLORS.blue, valueSize: 15 });
    addCard(s, { x: 6.35, y: 2.0, w: 2.6, h: 1.0, title: 'Forv. avkastning', value: pct(d.weightedExpectedReturn), subtitle: 'Årlig forventning', accent: COLORS.green, valueSize: 16 });
    addCard(s, { x: 9.15, y: 2.0, w: 2.6, h: 1.0, title: 'Base case', value: formatCompactCurrency(d.scenario.base), subtitle: `${d.years} år frem`, accent: COLORS.salmon, valueSize: 15 });
    addSectionLabel(s, 'Vår vurdering', 0.8, 3.45);
    addBulletList(s, [
      'Forslaget bygger på en tydelig kjerne/satellitt-struktur der brede løsninger danner fundamentet og mer spesialiserte løsninger brukes selektivt.',
      'Rentedelen skal bidra med robusthet og løpende kontantstrøm, mens aksjedelen skal være viktigste langsiktige avkastningsdriver.',
      'Porteføljen er satt opp for å være enkel å forklare i møte og enkel å følge opp i løpende rådgivning.'
    ], { x: 0.85, y: 3.75, w: 7.0, h: 2.1, fontSize: 11.5 });
    addDataTable(s, [
      [{ text: 'Kjerne i forslaget', options: { bold: true, color: COLORS.navy } }, { text: 'Vekt', options: { bold: true, color: COLORS.navy } }],
      ...topSolutions.slice(0,5).map((row) => [row.navn, pct(row.vekt)])
    ], { x: 8.1, y: 3.7, w: 4.2, fontSize: 9.5, rowH: 0.34 });
    addFooter(s, 3);
  }

  {
    const s = pptx.addSlide();
    s.background = { color: COLORS.bg };
    addBrandHeader(s, 'Anbefalt porteføljesammensetning', 'Fordeling på aktivaklasser og forventet profil.');
    addSectionLabel(s, 'Aktivaklasser', 0.8, 1.95);
    addBarList(s, d.assetAlloc.length ? d.assetAlloc : [{ navn: 'Ingen data', vekt: 0 }], { x: 0.85, y: 2.35, w: 5.4, maxValue: 100, color: COLORS.navy, labelW: 2.1 });
    addDataTable(s, [
      [{ text: 'Aktivaklasse', options: { bold: true, color: COLORS.navy } }, { text: 'Vekt', options: { bold: true, color: COLORS.navy } }, { text: 'Beløp', options: { bold: true, color: COLORS.navy } }, { text: 'Forv. avkastning', options: { bold: true, color: COLORS.navy } }],
      ...d.assetAlloc.map((a) => [a.navn, pct(a.vekt), formatCompactCurrency(a.belop), pct(a.avkastning)])
    ], { x: 6.55, y: 2.1, w: 5.7, fontSize: 9.8, rowH: 0.35 });
    addCard(s, { x: 6.55, y: 5.85, w: 1.8, h: 0.9, title: 'Risikoprofil', value: d.risikoProfil, accent: COLORS.navy, valueSize: 15 });
    addCard(s, { x: 8.45, y: 5.85, w: 1.8, h: 0.9, title: 'Horisont', value: `${d.years} år`, accent: COLORS.blue, valueSize: 15 });
    addCard(s, { x: 10.35, y: 5.85, w: 1.9, h: 0.9, title: 'Yield', value: pct(d.weightedYield), accent: COLORS.green, valueSize: 15 });
    addFooter(s, 4);
  }

  {
    const s = pptx.addSlide();
    s.background = { color: COLORS.bg };
    addBrandHeader(s, 'Pensum-løsningene i porteføljen', 'Hver løsning skal ha en tydelig rolle i totalporteføljen.');
    addDataTable(s, [
      [
        { text: 'Løsning', options: { bold: true, color: COLORS.navy } },
        { text: 'Vekt', options: { bold: true, color: COLORS.navy } },
        { text: 'Rolle', options: { bold: true, color: COLORS.navy } },
        { text: 'Forv. avk.', options: { bold: true, color: COLORS.navy } },
        { text: 'Yield', options: { bold: true, color: COLORS.navy } },
        { text: 'Likviditet', options: { bold: true, color: COLORS.navy } }
      ],
      ...d.selectedSolutionRows.map((row) => [row.navn, pct(row.vekt), row.rolle, pct(row.expectedReturn), pct(row.expectedYield), row.likviditetLabel])
    ], { x: 0.75, y: 2.0, w: 11.8, fontSize: 9.4, rowH: 0.34 });
    addFooter(s, 5);
  }

  {
    const s = pptx.addSlide();
    s.background = { color: COLORS.bg };
    addBrandHeader(s, 'Hvorfor denne sammensetningen', 'Logikken bak porteføljen.');
    const cards = [
      ['Vekst', 'Aksjedelen skal være viktigste langsiktige avkastningsdriver gjennom brede og forklarbare eksponeringer.', COLORS.navy],
      ['Robusthet', 'Renteeksponering skal dempe svingninger og gi en mer balansert samlet portefølje.', COLORS.blue],
      ['Kontantstrøm', 'Yield-komponentene bidrar med løpende avkastning og bedre totalprofil for investoren.', COLORS.green],
      ['Diversifisering', 'Utvalgte satellitter skal skape flere uavhengige avkastningsdrivere i porteføljen.', COLORS.salmon]
    ];
    cards.forEach((card, idx) => {
      const x = 0.8 + (idx % 2) * 6.0;
      const y = 2.1 + Math.floor(idx / 2) * 1.7;
      addCard(s, { x, y, w: 5.5, h: 1.25, title: card[0], value: ' ', subtitle: card[1], accent: card[2], valueSize: 8 });
    });
    addSectionLabel(s, 'Budskap i kundemøte', 0.8, 5.65);
    addBulletList(s, [
      'Dette er en helhetlig portefølje, ikke en tilfeldig liste produkter.',
      'Forslaget er laget for å være enkelt å forstå for investor og enkelt å følge opp for rådgiver.',
      'Porteføljen kan fases inn trinnvis dersom investor ønsker en mer gradvis implementering.'
    ], { x: 0.85, y: 5.95, w: 11.3, h: 0.9, fontSize: 11 });
    addFooter(s, 6);
  }

  {
    const s = pptx.addSlide();
    s.background = { color: COLORS.bg };
    addBrandHeader(s, 'Historikk og nøkkeltall', 'Oppsummering av tilgjengelig utviklingsdata og risikoindikatorer.');
    addDataTable(s, [
      [{ text: 'Periode', options: { bold: true, color: COLORS.navy } }, { text: 'Modellportefølje', options: { bold: true, color: COLORS.navy } }],
      ...summaryRows.map((row) => [row.year, row.value === null ? '—' : pct(row.value)])
    ], { x: 0.8, y: 2.05, w: 4.3, fontSize: 10, rowH: 0.38 });
    addCard(s, { x: 5.45, y: 2.0, w: 2.0, h: 1.0, title: 'Volatilitet', value: pct(d.annualizedVol), subtitle: 'Annualisert', accent: COLORS.blue, valueSize: 16 });
    addCard(s, { x: 7.65, y: 2.0, w: 2.0, h: 1.0, title: 'Max drawdown', value: pct(d.maxDrawdown), subtitle: 'Tilgjengelig serie', accent: COLORS.salmon, valueSize: 16 });
    addCard(s, { x: 9.85, y: 2.0, w: 2.0, h: 1.0, title: 'Forv. avkastning', value: pct(d.weightedExpectedReturn), subtitle: 'Årlig estimat', accent: COLORS.green, valueSize: 16 });
    addSectionLabel(s, 'Kommentar', 5.45, 3.45);
    addBulletList(s, [
      'Historikk og nøkkeltall må leses som illustrasjoner basert på tilgjengelig datagrunnlag.',
      'Jo bedre og mer konsistent historikk per Pensum-løsning, jo sterkere blir denne delen av rapporten.',
      'Neste versjon bør vise faktisk porteføljeserie med benchmark og tydeligere månedsoppdatering.'
    ], { x: 5.45, y: 3.75, w: 6.5, h: 1.65, fontSize: 11 });
    addFooter(s, 7);
  }

  {
    const s = pptx.addSlide();
    s.background = { color: COLORS.bg };
    addBrandHeader(s, 'Scenarioanalyse', 'Illustrasjon av mulig verdiutvikling over tid.');
    addCard(s, { x: 0.85, y: 2.05, w: 3.55, h: 1.2, title: 'Konservativt scenario', value: formatCompactCurrency(d.scenario.conservative), subtitle: `${Math.max(d.weightedExpectedReturn - 2.5, 2).toFixed(1)}% p.a.`, accent: COLORS.blue, valueSize: 18 });
    addCard(s, { x: 4.9, y: 2.05, w: 3.55, h: 1.2, title: 'Forventet scenario', value: formatCompactCurrency(d.scenario.base), subtitle: `${d.weightedExpectedReturn.toFixed(1)}% p.a.`, accent: COLORS.green, valueSize: 18 });
    addCard(s, { x: 8.95, y: 2.05, w: 3.55, h: 1.2, title: 'Optimistisk scenario', value: formatCompactCurrency(d.scenario.optimistic), subtitle: `${(d.weightedExpectedReturn + 2.5).toFixed(1)}% p.a.`, accent: COLORS.salmon, valueSize: 18 });
    addBulletList(s, [
      'Scenarioene er ikke prognoser, men en enkel illustrasjon av hvordan sluttverdien påvirkes av ulike avkastningsforutsetninger.',
      'De største forskjellene i sluttverdi kommer ofte fra tidshorisont, disiplin og hvor mye av porteføljen som faktisk blir investert over tid.',
      'Illikvide plasseringer bør bare utgjøre den delen av kapitalen som investor kan binde over lengre perioder.'
    ], { x: 0.9, y: 4.0, w: 11.2, h: 1.7, fontSize: 11.2 });
    addFooter(s, 8);
  }

  {
    const s = pptx.addSlide();
    s.background = { color: COLORS.bg };
    addBrandHeader(s, 'Eksponeringsoversikt', 'Aggregert eksponering basert på de valgte løsningene.');
    addSectionLabel(s, 'Sektorer', 0.8, 1.95);
    addBarList(s, sectorRows.length ? sectorRows : [{ navn: 'Ingen data', vekt: 0 }], { x: 0.85, y: 2.35, w: 5.2, maxValue: 100, color: COLORS.navy, labelW: 2.0 });
    addSectionLabel(s, 'Regioner', 6.65, 1.95);
    addBarList(s, regionRows.length ? regionRows : [{ navn: 'Ingen data', vekt: 0 }], { x: 6.7, y: 2.35, w: 5.2, maxValue: 100, color: COLORS.salmon, labelW: 2.0 });
    addFooter(s, 9);
  }

  {
    const s = pptx.addSlide();
    s.background = { color: COLORS.bg };
    addBrandHeader(s, 'Underliggende eksponering', 'Største underliggende posisjoner og stilprofil.');
    addDataTable(s, [
      [{ text: 'Største underliggende', options: { bold: true, color: COLORS.navy } }, { text: 'Vektet andel', options: { bold: true, color: COLORS.navy } }],
      ...(holdingRows.length ? holdingRows : [{ navn: 'Ingen data', vekt: 0 }]).map((row) => [row.navn, pct(row.vekt)])
    ], { x: 0.8, y: 2.0, w: 6.0, fontSize: 9.6, rowH: 0.34 });
    addBarList(s, styleRows.length ? styleRows : [{ navn: 'Ingen data', vekt: 0 }], { x: 7.15, y: 2.25, w: 5.0, maxValue: 100, color: COLORS.green, labelW: 2.1 });
    addFooter(s, 10);
  }

  {
    const s = pptx.addSlide();
    s.background = { color: COLORS.bg };
    addBrandHeader(s, 'Investeringscase per løsning', 'Hvorfor de viktigste løsningene er med i forslaget.');
    topSolutions.slice(0,4).forEach((row, idx) => {
      const x = 0.8 + (idx % 2) * 6.0;
      const y = 2.0 + Math.floor(idx / 2) * 2.1;
      s.addShape(PptxGenJS.ShapeType.roundRect, { x, y, w: 5.45, h: 1.7, rectRadius: 0.08, fill: { color: COLORS.white }, line: { color: COLORS.line, pt: 1 } });
      s.addShape(PptxGenJS.ShapeType.rect, { x: x + 0.16, y: y + 0.16, w: 0.12, h: 1.38, fill: { color: row.color }, line: { color: row.color, pt: 0 } });
      s.addText(row.navn, { x: x + 0.4, y: y + 0.18, w: 3.8, h: 0.22, fontSize: 13, bold: true, color: COLORS.navy });
      s.addText(`${pct(row.vekt)} | ${row.rolle}`, { x: x + 0.4, y: y + 0.46, w: 4.0, h: 0.18, fontSize: 9.5, color: COLORS.salmon, bold: true });
      s.addText(row.investeringside || row.beskrivelse || 'Pensum-løsning', { x: x + 0.4, y: y + 0.74, w: 4.7, h: 0.45, fontSize: 9.8, color: COLORS.text });
      const bullets = Array.isArray(row.hovedpoenger) && row.hovedpoenger.length ? row.hovedpoenger.slice(0,2).join('  •  ') : 'Tydelig rolle i totalporteføljen og enkel å forklare i investoroppfølging.';
      s.addText(`• ${bullets}`, { x: x + 0.4, y: y + 1.28, w: 4.6, h: 0.18, fontSize: 8.5, color: COLORS.muted });
    });
    addFooter(s, 11);
  }

  {
    const s = pptx.addSlide();
    s.background = { color: COLORS.bg };
    addBrandHeader(s, 'Implementering og oppfølging', 'Hvordan forslaget kan settes i arbeid og følges opp videre.');
    const steps = [
      ['1. Avklaring', 'Bekrefte investorens mål, likviditetsbehov og eventuelle eksisterende plasseringer som skal vurderes.'],
      ['2. Egnethet', 'Gjennomføre kundeetablering, kundeklassifisering og egnethetsvurdering før implementering.'],
      ['3. Innfasing', 'Bygge porteføljen samlet eller trinnvis, avhengig av markedssyn og investorpreferanser.'],
      ['4. Oppfølging', 'Løpende rapportering, rebalansering og oppdatering ved endrede markedsforhold eller behov.']
    ];
    steps.forEach((step, idx) => {
      const y = 2.0 + idx * 1.15;
      s.addShape(PptxGenJS.ShapeType.roundRect, { x: 0.9, y, w: 11.4, h: 0.82, rectRadius: 0.05, fill: { color: COLORS.white }, line: { color: COLORS.line, pt: 1 } });
      s.addShape(PptxGenJS.ShapeType.roundRect, { x: 1.05, y: y + 0.16, w: 1.15, h: 0.48, rectRadius: 0.05, fill: { color: COLORS.navy }, line: { color: COLORS.navy, pt: 0 } });
      s.addText(step[0], { x: 1.22, y: y + 0.24, w: 0.9, h: 0.16, fontSize: 9, color: COLORS.white, bold: true, align: 'center' });
      s.addText(step[1], { x: 2.45, y: y + 0.18, w: 8.9, h: 0.35, fontSize: 10.4, color: COLORS.text });
    });
    addFooter(s, 12);
  }

  {
    const s = pptx.addSlide();
    s.background = { color: COLORS.bg };
    addBrandHeader(s, 'Oppsummering og neste steg', 'Forslaget oppsummert i én side.');
    addCard(s, { x: 0.8, y: 2.0, w: 3.7, h: 1.15, title: 'Anbefalt profil', value: d.risikoProfil, subtitle: `${d.years} års horisont`, accent: COLORS.navy, valueSize: 18 });
    addCard(s, { x: 4.8, y: 2.0, w: 3.7, h: 1.15, title: 'Forventet avkastning', value: pct(d.weightedExpectedReturn), subtitle: 'Årlig estimat', accent: COLORS.green, valueSize: 18 });
    addCard(s, { x: 8.8, y: 2.0, w: 3.7, h: 1.15, title: 'Forventet yield', value: pct(d.weightedYield), subtitle: 'Løpende estimat', accent: COLORS.salmon, valueSize: 18 });
    addBulletList(s, [
      'Porteføljen er bygget for å være tydelig, balansert og kommersielt forklarbar.',
      'Forslaget kan brukes som utgangspunkt for videre rådgivning og egnethetsvurdering.',
      'Neste steg er å validere investorens situasjon og beslutte om porteføljen skal implementeres samlet eller trinnvis.'
    ], { x: 0.9, y: 3.8, w: 11.1, h: 1.7, fontSize: 11.5 });
    s.addText('Pensum Asset Management', { x: 0.9, y: 6.05, w: 3.2, h: 0.2, fontSize: 13, bold: true, color: COLORS.navy });
    s.addText('Profesjonell kapitalforvaltning og rådgivning', { x: 0.9, y: 6.32, w: 4.5, h: 0.18, fontSize: 9.5, color: COLORS.muted });
    addFooter(s, 13);
  }

  return pptx;
}

function dynamicSlideText(pageNo, d) {
  const lines = {
    6: [`Allokering: ${d.assetAlloc.map((a) => `${a.navn} ${pct(a.vekt)}`).join(', ')}`],
    7: ['Pensum-løsningene har tydelige roller i totalporteføljen: kjerne, satellitt, yield og robusthet.'],
    8: [`Valgte løsninger: ${d.selectedSolutionRows.map((row) => row.navn).join(', ')}`],
    9: [`Vektet porteføljeavkastning: ${d.yearlySummary.map((row) => `${row.year} ${row.value === null ? '—' : pct(row.value)}`).join(' | ')}`],
    10: [`Scenarioverdi etter ${d.years} år: ${formatCurrency(d.scenario.base)}`],
    11: ['Se vedlagt datadrevet eksponeringsoversikt i den genererte presentasjonen.'],
    12: [`Sektorer: ${d.sectors.map((r) => `${r.navn} ${pct(r.vekt)}`).join(', ')}`],
    13: [`Regioner: ${d.regions.map((r) => `${r.navn} ${pct(r.vekt)}`).join(', ')}`]
  };
  return (lines[pageNo] || []).join('\n');
}

function parsePageSpec(spec = '', maxPage = 20) {
  const set = new Set();
  String(spec).split(',').map((p) => p.trim()).filter(Boolean).forEach((token) => {
    if (/^\d+\+$/.test(token)) {
      const start = Number(token.replace('+', ''));
      for (let i = start; i <= maxPage; i += 1) set.add(i);
    } else if (/^\d+-\d+$/.test(token)) {
      const [a, b] = token.split('-').map(Number);
      for (let i = Math.min(a, b); i <= Math.max(a, b); i += 1) set.add(i);
    } else if (/^\d+$/.test(token)) {
      set.add(Number(token));
    }
  });
  return set;
}

async function applyTemplatePptx(templateBuffer, payload) {
  const d = buildNormalizedData(payload);
  if (!JSZip || !JSZip.loadAsync) throw new Error('jszip ikke tilgjengelig i runtime');
  const zip = await JSZip.loadAsync(templateBuffer);
  const fixedSet = parsePageSpec(d?.malConfig?.fasteSider || '1-5,14+', 25);
  const dynamicSet = parsePageSpec(d?.malConfig?.dynamiskeSider || '6-13', 25);

  const globalTokens = {
    '{{KUNDE_NAVN}}': d.kundeNavn,
    '{{DATO}}': d.reportDate,
    '{{TOTAL_KAPITAL}}': formatCurrency(d.total),
    '{{RISIKOPROFIL}}': d.risikoProfil,
    '{{HORISONT}}': `${d.years} år`,
    '{{FORVENTET_AVKASTNING}}': pct(d.weightedExpectedReturn),
    '{{FORVENTET_YIELD}}': pct(d.weightedYield),
    '{{RADGIVER}}': d.radgiver,
    '{{PRODUKTLISTE}}': d.selectedSolutionRows.map((row) => row.navn).join(', '),
    '{{ALLOKERING_TABELL}}': d.assetAlloc.map((a) => `${a.navn}: ${pct(a.vekt)} / ${formatCurrency(a.belop)}`).join('\n')
  };

  let replacements = 0;
  const slideFiles = Object.keys(zip.files).filter((p) => /^ppt\/slides\/slide\d+\.xml$/.test(p));

  for (const slidePath of slideFiles) {
    const pageNo = Number(slidePath.match(/slide(\d+)\.xml$/)?.[1] || 0);
    let xml = await zip.file(slidePath).async('text');

    Object.entries(globalTokens).forEach(([token, value]) => {
      if (xml.includes(token)) {
        const before = xml;
        xml = xml.split(token).join(value);
        if (xml !== before) replacements += 1;
      }
    });

    if (dynamicSet.has(pageNo)) {
      const dynToken = `{{DYNAMIC_${pageNo}}}`;
      if (xml.includes(dynToken)) {
        const before = xml;
        xml = xml.split(dynToken).join(dynamicSlideText(pageNo, d));
        if (xml !== before) replacements += 1;
      }
    }

    if (!fixedSet.has(pageNo) && !dynamicSet.has(pageNo) && pageNo > 0) {
      const removeToken = '{{SKIP_SLIDE}}';
      if (xml.includes(removeToken)) {
        const before = xml;
        xml = xml.split(removeToken).join('');
        if (xml !== before) replacements += 1;
      }
    }

    zip.file(slidePath, xml);
  }

  const out = await zip.generateAsync({ type: 'nodebuffer' });
  return { buffer: out, replacements };
}

function escapePdfText(text = '') {
  return String(text).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

function buildSimplePdfBuffer(data) {
  const rows = [
    'Pensum Asset Management',
    'Investeringsforslag',
    `Kunde: ${data.kundeNavn || 'Investor'}`,
    `Total kapital: ${formatCurrency(data.totalKapital)}`
  ];
  const streamCmd = rows.map((line, i) => `BT /F1 12 Tf 50 ${810 - (i * 20)} Td (${escapePdfText(line)}) Tj ET`).join('\n');
  return Buffer.from(`%PDF-1.4\n1 0 obj<< /Type /Catalog /Pages 2 0 R >>endobj\n2 0 obj<< /Type /Pages /Kids [3 0 R] /Count 1 >>endobj\n3 0 obj<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>endobj\n4 0 obj<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>endobj\n5 0 obj<< /Length ${Buffer.byteLength(streamCmd, 'utf8')} >>stream\n${streamCmd}\nendstream endobj\ntrailer<< /Root 1 0 R >>\n%%EOF`, 'utf8');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const data = req.body || {};
    const skipTemplateMerge = Boolean(data?.skipTemplateMerge);
    const uploadedTemplateData = skipTemplateMerge ? null : parseDataUrlToBuffer(data?.malConfig?.filDataUrl || '');
    const repoTemplateData = skipTemplateMerge || uploadedTemplateData ? null : pickTemplateFromRepo(data?.malConfig?.filnavn || '');
    const templateData = uploadedTemplateData || repoTemplateData;

    if (templateData && /presentationml|ms-powerpoint/.test(templateData.mime)) {
      try {
        const { buffer, replacements } = await applyTemplatePptx(templateData.buffer, data);
        if (replacements > 0) {
          const filnavn = `Pensum_Investeringsforslag_${(data.kundeNavn || 'Kunde').replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pptx`;
          res.setHeader('X-Pensum-Output-Format', 'pptx-template');
          res.setHeader('X-Pensum-Template-Source', templateData.source || 'upload');
          res.setHeader('X-Pensum-Template-Replacements', String(replacements));
          res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
          res.setHeader('Content-Disposition', `attachment; filename="${filnavn}"`);
          return res.send(buffer);
        }
      } catch (templateErr) {
        res.setHeader('X-Pensum-Template-Warning', encodeURIComponent(templateErr.message));
      }
    }

    try {
      if (!PptxGenJS) throw new Error('pptxgenjs ikke tilgjengelig');
      const pptx = buildProfessionalPptx(data);
      const buffer = await pptx.write({ outputType: 'nodebuffer' });
      const filnavn = `Pensum_Investeringsforslag_${(data.kundeNavn || 'Kunde').replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pptx`;
      res.setHeader('X-Pensum-Output-Format', 'pptx-generated');
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
      res.setHeader('Content-Disposition', `attachment; filename="${filnavn}"`);
      return res.send(buffer);
    } catch (pptErr) {
      res.setHeader('X-Pensum-Ppt-Error', encodeURIComponent(pptErr.message || 'pptx-generation-failed'));
      const buffer = buildSimplePdfBuffer(data);
      res.setHeader('X-Pensum-Output-Format', 'pdf-fallback');
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="Pensum_Investeringsforslag.pdf"');
      return res.send(buffer);
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

export const config = {
  api: { bodyParser: { sizeLimit: '20mb' }, responseLimit: '20mb' }
};
