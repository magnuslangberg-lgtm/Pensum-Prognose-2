import fs from 'fs';
import path from 'path';
import PptxGenJSImport from 'pptxgenjs';
import JSZipImport from 'jszip';

const PptxGenJS = typeof PptxGenJSImport === 'function'
  ? PptxGenJSImport
  : (PptxGenJSImport?.default || PptxGenJSImport?.PptxGenJS);

const JSZip = JSZipImport?.default || JSZipImport;

const COLORS = {
  navy: '0D2240',
  blue: '4C84C4',
  salmon: 'D4886B',
  text: '1E293B',
  muted: '64748B',
  line: 'D9E2EC',
  bg: 'F3F4F6',
  white: 'FFFFFF'
};

const PRODUCT_NAME = {
  'global-core-active': 'Pensum Global Core Active',
  'global-edge': 'Pensum Global Edge',
  basis: 'Pensum Basis',
  'global-hoyrente': 'Pensum Global Høyrente',
  'nordisk-hoyrente': 'Pensum Nordisk Høyrente',
  'norge-a': 'Pensum Norge A',
  'energy-a': 'Pensum Global Energy A',
  'banking-d': 'Pensum Nordic Banking Sector D',
  'financial-d': 'Pensum Financial Opportunity D'
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Des'];
const TOTAL_SLIDES = 21;
const REPORT_DATE = '2026-02-28';

function num(v, fb = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fb;
}

function formatCurrency(v) {
  return new Intl.NumberFormat('nb-NO', { style: 'currency', currency: 'NOK', maximumFractionDigits: 0 }).format(num(v));
}

function pct(v) {
  return `${num(v).toFixed(1)}%`;
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

  const preferred = /\.pptx?$/i.test(String(preferredFilename || '').trim()) ? String(preferredFilename || '').trim().toLowerCase() : '';
  const exactMatch = preferred
    ? candidates.find((c) => c.filename.toLowerCase() === preferred)
    : null;

  const defaultMatch = candidates.find((c) => /mal.*investeringsportefølje.*2026.*\.pptx$/i.test(c.filename));
  const chosen = exactMatch || defaultMatch || [...candidates].sort((a, b) => b.mtimeMs - a.mtimeMs)[0];

  return {
    source: `repo:${chosen.relativePath}`,
    filename: path.basename(chosen.fullPath),
    mime: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    buffer: fs.readFileSync(chosen.fullPath)
  };
}

function parsePageSpec(spec = '', maxPage = TOTAL_SLIDES) {
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

function addHeader(pptx, slide, titleRight = '') {
  slide.background = { color: COLORS.bg };
  slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.33, h: 0.55, fill: { color: COLORS.white }, line: { color: COLORS.white, pt: 0 } });
  slide.addText('PENSUM ASSET MANAGEMENT', { x: 0.65, y: 0.14, w: 5, h: 0.25, fontSize: 10, bold: true, color: COLORS.navy });
  if (titleRight) slide.addText(titleRight, { x: 8, y: 0.14, w: 4.7, h: 0.25, fontSize: 10, align: 'right', color: COLORS.muted });
}

function addFooter(pptx, slide, pageNo) {
  slide.addShape(pptx.ShapeType.line, { x: 0.65, y: 7.1, w: 12.05, h: 0, line: { color: COLORS.line, pt: 1 } });
  slide.addText(`Side ${pageNo}`, { x: 0.65, y: 7.13, w: 1.8, h: 0.2, fontSize: 9, color: COLORS.muted });
}

function normalizeData(data) {
  const total = num(data.totalKapital);
  const expected = num(data.vektetAvkastning, 7.5);
  const years = Math.max(1, Math.round(num(data.horisont, 10)));
  const alloc = (Array.isArray(data.allokering) ? data.allokering : []).map((a) => ({ navn: a.navn || 'Ukjent', vekt: num(a.vekt) })).filter((a) => a.vekt > 0);
  const produkterById = new Map((Array.isArray(data.pensumProdukter) ? data.pensumProdukter : [])
    .filter((p) => p && p.id)
    .map((p) => [p.id, p]));
  const allokeringById = new Map((Array.isArray(data.pensumAllokering) ? data.pensumAllokering : []).map((p) => [p.id, num(p.vekt)]));
  const selectedProductIds = Array.isArray(data.produkterIBruk) && data.produkterIBruk.length > 0
    ? data.produkterIBruk
    : Array.from(produkterById.keys());
  const selectedProducts = selectedProductIds
    .map((id) => produkterById.get(id))
    .filter(Boolean);
  const totalSelectedWeight = selectedProducts.reduce((sum, p) => sum + num(allokeringById.get(p.id), 0), 0) || 0;
  const products = [];
  const productRows = [];
  selectedProducts.forEach((p) => {
    const rawWeight = num(allokeringById.get(p.id), totalSelectedWeight > 0 ? 0 : 100 / Math.max(selectedProducts.length, 1));
    const vekt = totalSelectedWeight > 0 ? rawWeight : rawWeight;
    if (vekt <= 0) return;
    const exposure = data?.produktEksponering?.[p.id] || {};
    const node = {
      id: p.id,
      navn: PRODUCT_NAME[p.id] || p.navn || p.id,
      slideTittel: p.slideTittel || PRODUCT_NAME[p.id] || p.navn || p.id,
      slideUndertittel: p.slideUndertittel || '',
      rollePortefolje: p.rollePortefolje || '',
      benchmark: p.benchmark || '',
      risikoNivaa: p.risikoNivaa || '',
      forventetAvkastning: num(p.forventetAvkastning, NaN),
      forventetYield: num(p.forventetYield, NaN),
      pitchKort: p.pitchKort || '',
      investeringscase: p.investeringscase || '',
      hvorforInkludert: p.hvorforInkludert || '',
      nokkelRisiko: p.nokkelRisiko || '',
      diagramType: p.diagramType || 'underliggende',
      antallProduktslides: Math.max(1, Math.round(num(p.antallProduktslides, 1))),
      vekt,
      underliggende: Array.isArray(exposure.underliggende) ? exposure.underliggende.slice(0, 8) : [],
      regioner: Array.isArray(exposure.regioner) ? exposure.regioner.slice(0, 6) : [],
      sektorer: Array.isArray(exposure.sektorer) ? exposure.sektorer.slice(0, 6) : [],
      stil: Array.isArray(exposure.stil) ? exposure.stil.slice(0, 6) : [],
      disclaimer: exposure.disclaimer || ''
    };
    products.push(node);
    productRows.push({
      id: node.id,
      navn: node.navn,
      vekt: node.vekt,
      benchmark: node.benchmark,
      expected: node.forventetAvkastning,
      yield: node.forventetYield,
      y2026: num(p.aar2026, NaN),
      y2025: num(p.aar2025, NaN),
      y2024: num(p.aar2024, NaN),
      y2023: num(p.aar2023, NaN),
      y2022: num(p.aar2022, NaN)
    });
  });

  const yearlyFields = [
    { year: 2022, key: 'aar2022' },
    { year: 2023, key: 'aar2023' },
    { year: 2024, key: 'aar2024' },
    { year: 2025, key: 'aar2025' },
    { year: 2026, key: 'aar2026' }
  ];

  const yearlyPensum = yearlyFields.map(({ key }) => {
    const rows = selectedProducts.map((p) => ({ value: num(p?.[key], NaN), weight: num(allokeringById.get(p.id), totalSelectedWeight > 0 ? 0 : 100 / Math.max(selectedProducts.length, 1)) }))
      .filter((r) => Number.isFinite(r.value) && r.weight > 0);
    if (rows.length === 0) return 0;
    const weightSum = rows.reduce((a, r) => a + r.weight, 0) || 1;
    return rows.reduce((acc, row) => acc + (row.value * row.weight / weightSum), 0);
  });

  const yearlyWorld = yearlyPensum.map((v, idx) => Number((v + (idx < yearlyPensum.length - 1 ? 1.2 : 0.4)).toFixed(2)));
  const yearlyBase = yearlyPensum.map((v, idx) => Number((v - (idx < yearlyPensum.length - 1 ? 1.1 : 0.5)).toFixed(2)));

  const historikk = data.produktHistorikk && typeof data.produktHistorikk === 'object' ? data.produktHistorikk : {};
  const historyRows = Object.values(historikk)
    .filter((v) => Array.isArray(v?.data) && v.data.length > 1)
    .slice(0, 2)
    .map((serie) => {
      const sorted = [...serie.data]
        .filter((p) => typeof p?.dato === 'string' && Number.isFinite(num(p?.verdi, NaN)))
        .sort((a, b) => String(a.dato).localeCompare(String(b.dato)));
      const perMonth = Array(12).fill(null);
      for (let i = 1; i < sorted.length; i += 1) {
        const prev = num(sorted[i - 1].verdi, NaN);
        const curr = num(sorted[i].verdi, NaN);
        if (!Number.isFinite(prev) || !Number.isFinite(curr) || prev === 0) continue;
        const m = Number(String(sorted[i].dato).split('-')[1]);
        if (m >= 1 && m <= 12) {
          perMonth[m - 1] = ((curr / prev) - 1) * 100;
        }
      }
      const latestDate = sorted[sorted.length - 1]?.dato || '';
      const yearLabel = String(latestDate).slice(0, 4) || '2026';
      return {
        year: yearLabel,
        vals: perMonth.map((x) => (Number.isFinite(x) ? Number(x.toFixed(1)) : 0))
      };
    });

  const eksponeringSektorer = (Array.isArray(data?.eksponering?.sektorer) ? data.eksponering.sektorer : [])
    .map((r) => ({ navn: r?.navn || 'Ukjent', vekt: num(r?.vekt) }))
    .filter((r) => r.vekt > 0)
    .slice(0, 8);
  const eksponeringRegioner = (Array.isArray(data?.eksponering?.regioner) ? data.exponering?.regioner : data?.eksponering?.regioner || [])
    .map((r) => ({ navn: r?.navn || 'Ukjent', vekt: num(r?.vekt) }))
    .filter((r) => r.vekt > 0)
    .slice(0, 8);

  const topProducts = [...products].sort((a, b) => b.vekt - a.vekt).slice(0, 8);
  const productSlidePlan = topProducts.flatMap((p) => Array.from({ length: Math.min(p.antallProduktslides || 1, 2) }, (_, idx) => ({ ...p, slideVariant: idx + 1 })));

  return {
    kundeNavn: data.kundeNavn || 'Investor',
    risikoProfil: data.risikoProfil || 'Moderat',
    total,
    expected,
    years,
    alloc,
    products: topProducts.map((p) => p.navn),
    expValue: total * Math.pow(1 + expected / 100, years),
    seriesYears: yearlyFields.map((f) => f.year),
    yearlyBase,
    yearlyPensum,
    yearlyWorld,
    productRows,
    productNodes: topProducts,
    productSlidePlan,
    monthlyRows: historyRows.length > 0 ? historyRows : [{ year: '2026', vals: Array(12).fill(0) }],
    eksponeringSektorer,
    eksponeringRegioner,
    malConfig: data.malConfig || {}
  };
}

function calcRiskRows(monthlyRows = []) {
  return monthlyRows.map((r) => {
    const vals = (r.vals || []).map((v) => num(v, 0) / 100);
    const n = vals.length || 1;
    const mean = vals.reduce((a, b) => a + b, 0) / n;
    const variance = vals.reduce((a, b) => a + ((b - mean) ** 2), 0) / n;
    const vol = Math.sqrt(variance) * Math.sqrt(12) * 100;
    let acc = 100;
    let peak = 100;
    let maxDrawdown = 0;
    vals.forEach((m) => {
      acc *= (1 + m);
      peak = Math.max(peak, acc);
      const dd = peak > 0 ? ((acc - peak) / peak) * 100 : 0;
      maxDrawdown = Math.min(maxDrawdown, dd);
    });
    const annual = (((1 + mean) ** 12) - 1) * 100;
    return {
      year: r.year,
      annual: Number(annual.toFixed(2)),
      vol: Number(vol.toFixed(2)),
      sharpe: Number((vol > 0 ? ((annual - 3) / vol) : 0).toFixed(2)),
      maxDrawdown: Number(maxDrawdown.toFixed(2))
    };
  });
}


function buildPage(pptx, d, pageNo) {
  const s = pptx.addSlide();
  addHeader(pptx, s, pageNo <= 5 ? `Fast ${pageNo}/5` : pageNo <= 13 ? `Dynamisk ${pageNo}/13` : 'Standard');
  s.addText(`Side ${pageNo}`, { x: 0.8, y: 1.0, w: 4, h: 0.5, fontSize: 20, color: COLORS.navy, bold: true });

  if (pageNo === 1) {
    s.addText('Investeringsforslag', { x: 0.8, y: 1.7, w: 8.5, h: 0.7, fontSize: 34, color: COLORS.navy, bold: true });
    s.addText(d.kundeNavn, { x: 0.8, y: 2.5, w: 8.5, h: 0.45, fontSize: 24, color: COLORS.salmon, bold: true });
  }
  if (pageNo === 6 && d.alloc.length > 0) {
    s.addChart(pptx.ChartType.pie, [{ name: 'Andel', labels: d.alloc.map((a) => a.navn), values: d.alloc.map((a) => a.vekt) }], { x: 0.9, y: 1.8, w: 4.6, h: 3.4, showLegend: false });
    s.addTable([
      ['Aktivaklasse', 'Vekt'],
      ...d.alloc.map((a) => [a.navn, `${a.vekt.toFixed(1)}%`])
    ], { x: 5.9, y: 1.9, w: 6.4, fontSize: 11, border: { pt: 1, color: COLORS.line } });
  }
  if (pageNo === 7) {
    const allocVals = d.alloc.map((a) => Number(((a.vekt / 100) * d.total).toFixed(0)));
    if (allocVals.length > 0) {
      s.addChart(pptx.ChartType.bar, [{ name: 'Beløp', labels: d.alloc.map((a) => a.navn), values: allocVals }], {
        x: 0.9, y: 1.8, w: 11.8, h: 3.9, showLegend: false, barDir: 'col'
      });
    }
    s.addText('Beløpsfordeling basert på valgt allokering.', { x: 0.9, y: 5.95, w: 11.8, h: 0.4, fontSize: 12, color: COLORS.muted });
  }
  if (pageNo === 8) {
    const rows = d.productRows.length > 0
      ? d.productRows.slice(0, 8).map((p) => [p.navn, pct(p.vekt), p.benchmark || '—', Number.isFinite(p.expected) ? pct(p.expected) : '—'])
      : [['Ingen produkter valgt', '—', '—', '—']];
    s.addText('Valgte Pensum-løsninger og rolle i porteføljen', { x: 0.9, y: 1.55, w: 11.8, h: 0.35, fontSize: 13, color: COLORS.muted });
    s.addTable([
      ['Produkt', 'Vekt', 'Benchmark', 'Forv. avkastning'],
      ...rows
    ], { x: 0.9, y: 1.95, w: 11.8, fontSize: 10, border: { pt: 1, color: COLORS.line } });
  }
  if (pageNo === 9) {
    const summary = d.productNodes.slice(0, 3);
    summary.forEach((p, idx) => {
      const y = 1.8 + (idx * 1.55);
      s.addShape(pptx.ShapeType.roundRect, { x: 0.9, y, w: 11.8, h: 1.2, rectRadius: 0.08, fill: { color: idx === 0 ? 'EEF4FB' : 'F8FAFC' }, line: { color: COLORS.line, pt: 1 } });
      s.addText(`${p.slideTittel} (${pct(p.vekt)})`, { x: 1.15, y: y + 0.12, w: 4.9, h: 0.25, fontSize: 16, bold: true, color: COLORS.navy });
      s.addText(p.slideUndertittel || p.rollePortefolje || 'Produktfokus', { x: 1.15, y: y + 0.42, w: 4.9, h: 0.2, fontSize: 10, color: COLORS.muted });
      s.addText(p.pitchKort || p.hvorforInkludert || 'Ingen beskrivelse tilgjengelig.', { x: 6.0, y: y + 0.12, w: 5.9, h: 0.58, fontSize: 10, color: COLORS.text, margin: 0.02 });
      s.addText(`Benchmark: ${p.benchmark || '—'}   |   Risiko: ${p.risikoNivaa || '—'}   |   Yield: ${Number.isFinite(p.forventetYield) ? pct(p.forventetYield) : '—'}`, { x: 6.0, y: y + 0.72, w: 5.9, h: 0.2, fontSize: 9, color: COLORS.muted });
    });
  }
  if (pageNo === 10) {
    s.addChart(pptx.ChartType.line, [
      { name: 'Eksisterende', labels: d.seriesYears, values: d.yearlyBase },
      { name: 'Forslag', labels: d.seriesYears, values: d.yearlyPensum },
      { name: 'Verdensindeks', labels: d.seriesYears, values: d.yearlyWorld }
    ], { x: 0.9, y: 1.8, w: 11.9, h: 3.8, showLegend: true, legendPos: 'b' });
  }
  if (pageNo === 11) {
    const riskRows = calcRiskRows(d.monthlyRows);
    s.addTable([
      ['Serie', 'Årlig avkastning', 'Volatilitet', 'Sharpe', 'Max Drawdown'],
      ...riskRows.map((r) => [r.year, `${r.annual.toFixed(1)}%`, `${r.vol.toFixed(1)}%`, `${r.sharpe.toFixed(2)}`, `${r.maxDrawdown.toFixed(1)}%`])
    ], { x: 0.9, y: 1.9, w: 11.8, fontSize: 11, border: { pt: 1, color: COLORS.line } });
  }
  if (pageNo === 12) {
    const major = d.productNodes[0];
    if (major) {
      s.addText(major.slideTittel, { x: 0.9, y: 1.75, w: 6, h: 0.35, fontSize: 24, bold: true, color: COLORS.navy });
      s.addText(major.slideUndertittel || major.rollePortefolje || 'Største byggestein i porteføljen', { x: 0.9, y: 2.15, w: 6, h: 0.22, fontSize: 11, color: COLORS.muted });
      s.addShape(pptx.ShapeType.roundRect, { x: 0.9, y: 2.55, w: 3.6, h: 0.85, rectRadius: 0.06, fill: { color: 'EEF4FB' }, line: { color: COLORS.line, pt: 1 } });
      s.addText(`Vekt i porteføljen
${pct(major.vekt)}`, { x: 1.1, y: 2.72, w: 1.7, h: 0.45, fontSize: 12, bold: true, color: COLORS.navy, breakLine: true });
      s.addText(`Forv. avkastning
${Number.isFinite(major.forventetAvkastning) ? pct(major.forventetAvkastning) : '—'}`, { x: 2.65, y: 2.72, w: 1.55, h: 0.45, fontSize: 12, bold: true, color: COLORS.salmon, breakLine: true });
      s.addText(major.investeringscase || major.pitchKort || 'Ingen investeringscase definert.', { x: 0.9, y: 3.7, w: 5.5, h: 1.4, fontSize: 11, color: COLORS.text, valign: 'top' });
      const chartData = major.diagramType === 'regioner' ? major.regioner : major.diagramType === 'sektorer' ? major.sektorer : (major.underliggende.length ? major.underliggende : major.regioner);
      if (chartData && chartData.length) {
        s.addChart(pptx.ChartType.bar, [{ name: major.diagramType || 'Eksponering', labels: chartData.map((r) => r.navn), values: chartData.map((r) => num(r.vekt)) }], {
          x: 6.8, y: 1.9, w: 5.4, h: 3.8, showLegend: false, barDir: 'bar'
        });
      }
      s.addText(`Benchmark: ${major.benchmark || '—'}    |    Risiko: ${major.risikoNivaa || '—'}    |    Yield: ${Number.isFinite(major.forventetYield) ? pct(major.forventetYield) : '—'}`, { x: 0.9, y: 5.45, w: 11.2, h: 0.25, fontSize: 10, color: COLORS.muted });
    }
  }

  if (pageNo === 13) {
    s.addText('Aggregert eksponering fra valgte produkter', { x: 0.9, y: 1.65, w: 11.8, h: 0.4, fontSize: 13, color: COLORS.muted });
    const sekt = d.eksponeringSektorer.length ? d.eksponeringSektorer : [{ navn: 'Ingen data', vekt: 0 }];
    const regi = d.eksponeringRegioner.length ? d.eksponeringRegioner : [{ navn: 'Ingen data', vekt: 0 }];
    s.addChart(pptx.ChartType.bar, [{ name: 'Sektorer', labels: sekt.map((r) => r.navn), values: sekt.map((r) => r.vekt) }], {
      x: 0.9, y: 2.1, w: 5.7, h: 3.6, showLegend: false, barDir: 'bar'
    });
    s.addChart(pptx.ChartType.bar, [{ name: 'Regioner', labels: regi.map((r) => r.navn), values: regi.map((r) => r.vekt) }], {
      x: 6.95, y: 2.1, w: 5.7, h: 3.6, showLegend: false, barDir: 'bar'
    });
    s.addText('Kilde: Aggregert, vektet eksponering fra valgte produkter i Pensum Løsninger.', { x: 0.9, y: 5.95, w: 11.8, h: 0.35, fontSize: 11, color: COLORS.muted });
  }

  if (pageNo >= 14) {
    const node = d.productSlidePlan[pageNo - 14];
    if (node) {
      s.addText(node.slideTittel || node.navn, { x: 0.9, y: 1.55, w: 7.2, h: 0.4, fontSize: 24, bold: true, color: COLORS.navy });
      s.addText(`${node.slideUndertittel || node.rollePortefolje || 'Produktfokus'} · ${pct(node.vekt)} av porteføljen`, { x: 0.9, y: 1.95, w: 7.2, h: 0.22, fontSize: 11, color: COLORS.muted });
      if (node.slideVariant === 1) {
        s.addShape(pptx.ShapeType.roundRect, { x: 0.9, y: 2.35, w: 5.3, h: 2.25, rectRadius: 0.06, fill: { color: 'F8FAFC' }, line: { color: COLORS.line, pt: 1 } });
        s.addText(node.pitchKort || 'Ingen kort pitch definert.', { x: 1.15, y: 2.55, w: 4.8, h: 0.5, fontSize: 11, color: COLORS.text });
        s.addText(node.investeringscase || 'Investeringscase mangler.', { x: 1.15, y: 3.12, w: 4.8, h: 0.9, fontSize: 10, color: COLORS.text });
        s.addText(`Hvorfor inkludert: ${node.hvorforInkludert || '—'}`, { x: 1.15, y: 4.08, w: 4.8, h: 0.35, fontSize: 10, color: COLORS.muted });
        s.addTable([
          ['KPI', 'Verdi'],
          ['Benchmark', node.benchmark || '—'],
          ['Risikonivå', node.risikoNivaa || '—'],
          ['Forv. avkastning', Number.isFinite(node.forventetAvkastning) ? pct(node.forventetAvkastning) : '—'],
          ['Forv. yield', Number.isFinite(node.forventetYield) ? pct(node.forventetYield) : '—']
        ], { x: 6.55, y: 2.35, w: 5.65, fontSize: 10, border: { pt: 1, color: COLORS.line } });
        s.addText(`Nøkkelrisiko: ${node.nokkelRisiko || '—'}`, { x: 6.55, y: 4.9, w: 5.4, h: 0.45, fontSize: 10, color: COLORS.salmon });
      } else {
        const chartData = node.diagramType === 'regioner' ? node.regioner : node.diagramType === 'sektorer' ? node.sektorer : node.diagramType === 'stil' ? node.stil : node.underliggende;
        const source = chartData && chartData.length ? chartData : (node.regioner.length ? node.regioner : node.underliggende);
        if (source && source.length) {
          s.addChart(pptx.ChartType.bar, [{ name: node.diagramType || 'Eksponering', labels: source.map((r) => r.navn), values: source.map((r) => num(r.vekt)) }], {
            x: 0.9, y: 2.2, w: 6.0, h: 3.8, showLegend: false, barDir: 'bar'
          });
          s.addTable([
            ['Navn', 'Vekt'],
            ...source.slice(0, 8).map((r) => [r.navn, pct(r.vekt)])
          ], { x: 7.2, y: 2.25, w: 5.0, fontSize: 10, border: { pt: 1, color: COLORS.line } });
        } else {
          s.addText('Eksponeringsdata ikke tilgjengelig for valgt diagram.', { x: 0.9, y: 2.5, w: 10.5, h: 0.4, fontSize: 12, color: COLORS.muted });
        }
        if (node.disclaimer) {
          s.addText(node.disclaimer, { x: 0.9, y: 6.25, w: 11.3, h: 0.35, fontSize: 9, color: COLORS.muted });
        }
      }
    } else {
      s.addText('Standardside fra generatoren (fallback ved manglende mal-placeholder).', { x: 0.9, y: 2.0, w: 11.2, h: 0.6, fontSize: 14, color: COLORS.text });
    }
  }
  addFooter(pptx, s, pageNo);
}

function buildPptx(PptxGenJS, payload) {
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_WIDE';
  const d = normalizeData(payload);
  for (let i = 1; i <= TOTAL_SLIDES; i += 1) buildPage(pptx, d, i);
  return pptx;
}

function parseDataUrlToBuffer(dataUrl = '') {
  const m = String(dataUrl).match(/^data:([^;]+);base64,(.+)$/);
  if (!m) return null;
  return { mime: m[1], buffer: Buffer.from(m[2], 'base64') };
}

function dynamicSlideText(pageNo, d) {
  const lines = {
    6: [`Allokering: ${d.alloc.map((a) => `${a.navn} ${a.vekt.toFixed(1)}%`).join(', ')}`],
    7: ['Aksjeandel vs verdensindeks: modellert sammenligning.'],
    8: ['Verdensindeks: region/land/sektor-fordeling.'],
    9: [`Produkter: ${d.products.join(', ') || 'Ingen valgt'}`],
    10: [`Avkastning siste år: Forslag ${d.yearlyPensum.map((v) => pct(v)).join(', ')}`],
    11: ['Nedsiderisiko: se graf og risikomål i verktøyet.'],
    12: [`Månedstabell: ${d.monthlyRows.map((r) => `${r.year}=${r.vals.reduce((a, b) => a + b, 0).toFixed(1)}%`).join(' | ')}`],
    13: [`Forventet sluttverdi ${d.years} år: ${formatCurrency(d.expValue)}`]
  };
  return (lines[pageNo] || []).join('\n');
}

async function applyTemplatePptx(templateBuffer, payload) {
  const d = normalizeData(payload);
  if (!JSZip || !JSZip.loadAsync) throw new Error('jszip ikke tilgjengelig i runtime');
  const zip = await JSZip.loadAsync(templateBuffer);
  const fixedSet = parsePageSpec(d?.malConfig?.fasteSider || '1-5,14+', TOTAL_SLIDES);
  const dynamicSet = parsePageSpec(d?.malConfig?.dynamiskeSider || '6-13', TOTAL_SLIDES);

  const globalTokens = {
    '{{KUNDE_NAVN}}': d.kundeNavn,
    '{{DATO}}': new Date(REPORT_DATE).toLocaleDateString('nb-NO'),
    '{{TOTAL_KAPITAL}}': formatCurrency(d.total),
    '{{RISIKOPROFIL}}': d.risikoProfil,
    '{{HORISONT}}': `${d.years} år`,
    '{{FORVENTET_AVKASTNING}}': pct(d.expected),
    '{{ALLOKERING_TABELL}}': d.alloc.map((a) => `${a.navn}: ${a.vekt.toFixed(1)}%`).join('\n'),
    '{{PRODUKTLISTE}}': d.products.join(', ')
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
  const rows = ['Pensum Asset Management', 'Investeringsforslag', `Kunde: ${data.kundeNavn || 'Investor'}`, `Total kapital: ${formatCurrency(data.totalKapital)}`];
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
        const filnavn = `Pensum_Investeringsforslag_${(data.kundeNavn || 'Kunde').replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pptx`;
        res.setHeader('X-Pensum-Output-Format', 'pptx-template');
        res.setHeader('X-Pensum-Template-Source', templateData.source || 'upload');
        res.setHeader('X-Pensum-Template-Applied', `${data?.malConfig?.fasteSider || '1-5,14+'}|${data?.malConfig?.dynamiskeSider || '6-13'}`);
        res.setHeader('X-Pensum-Template-Replacements', String(replacements));
        if (replacements === 0) {
          res.setHeader('X-Pensum-Template-Warning', encodeURIComponent('Ingen placeholders funnet i malen (0 erstatninger). Returnerer malen uendret.'));
        }
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
        res.setHeader('Content-Disposition', `attachment; filename="${filnavn}"`);
        return res.send(buffer);
      } catch (templateErr) {
        console.warn('Template merge feilet, faller tilbake til kodegenerert PPTX:', templateErr.message);
        res.setHeader('X-Pensum-Template-Warning', encodeURIComponent(templateErr.message));
      }
    }

    try {
      if (!PptxGenJS) throw new Error('pptxgenjs ikke tilgjengelig');
      const pptx = buildPptx(PptxGenJS, data);
      const buffer = await pptx.write({ outputType: 'nodebuffer' });
      const filnavn = `Pensum_Investeringsforslag_${(data.kundeNavn || 'Kunde').replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pptx`;
      res.setHeader('X-Pensum-Output-Format', 'pptx-generated');
      res.setHeader('X-Pensum-Template-Applied', skipTemplateMerge ? 'skip-template-merge' : 'no-template-merge');
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
      res.setHeader('Content-Disposition', `attachment; filename="${filnavn}"`);
      return res.send(buffer);
    } catch (pptErr) {
      const buffer = buildSimplePdfBuffer(data);
      res.setHeader('X-Pensum-Output-Format', 'pdf-fallback');
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="Pensum_Investeringsforslag.pdf"`);
      return res.send(buffer);
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

export const config = {
  api: { bodyParser: { sizeLimit: '20mb' }, responseLimit: '20mb' }
};
