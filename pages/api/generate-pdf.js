import fs from 'fs';
import path from 'path';
import PptxGenJSImport from 'pptxgenjs';
import JSZipImport from 'jszip';
import { PENSUM_PRODUCT_MASTER } from '../../data/pensumProduktmaster';

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

const PRODUCT_NAME = Object.fromEntries(Object.entries(PENSUM_PRODUCT_MASTER).map(([id, meta]) => [id, meta.navn]));

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

  const defaultMatch = candidates.find((c) => /mal.*investeringsportef[øo]lje.*2026.*\.pptx$/i.test(c.filename));
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


function weightedAverage(rows = [], key) {
  const valid = rows.filter((r) => Number.isFinite(num(r[key], NaN)) && Number.isFinite(num(r.weight, NaN)) && num(r.weight) > 0);
  const totalWeight = valid.reduce((sum, r) => sum + num(r.weight), 0);
  if (totalWeight <= 0) return null;
  const value = valid.reduce((sum, r) => sum + (num(r[key]) * num(r.weight)), 0) / totalWeight;
  return Number(value.toFixed(1));
}

function aggregateWeightedExposure(selectedProducts = [], exposureById = {}, field = 'sektorer', topN = 6) {
  const totals = new Map();
  selectedProducts.forEach((product) => {
    const rows = Array.isArray(exposureById?.[product.id]?.[field]) ? exposureById[product.id][field] : [];
    rows.forEach((row) => {
      const name = row?.navn || 'Other';
      const contribution = (num(product.weight) / 100) * num(row?.vekt);
      if (contribution > 0) totals.set(name, (totals.get(name) || 0) + contribution);
    });
  });
  const sorted = [...totals.entries()].map(([navn, vekt]) => ({ navn, vekt: Number(vekt.toFixed(1)) })).sort((a, b) => b.vekt - a.vekt);
  if (sorted.length <= topN) return sorted;
  const head = sorted.slice(0, topN);
  const tail = sorted.slice(topN).reduce((sum, row) => sum + row.vekt, 0);
  return [...head, { navn: 'Andre', vekt: Number(tail.toFixed(1)) }];
}

function bulletText(items = []) {
  return items.filter(Boolean).map((item) => `• ${item}`).join('
');
}

function normalizeData(data) {
  const total = num(data.totalKapital);
  const expected = num(data.vektetAvkastning, 7.5);
  const years = Math.max(1, Math.round(num(data.horisont, 10)));
  const alloc = (Array.isArray(data.allokering) ? data.allokering : []).map((a) => ({ navn: a.navn || 'Ukjent', vekt: num(a.vekt) })).filter((a) => a.vekt > 0);
  const produkterById = new Map((Array.isArray(data.pensumProdukter) ? data.pensumProdukter : [])
    .filter((p) => p && p.id)
    .map((p) => [p.id, p]));
  const selectedProductIds = Array.isArray(data.produkterIBruk) && data.produkterIBruk.length > 0
    ? data.produkterIBruk
    : Array.from(produkterById.keys());
  const weightById = new Map((Array.isArray(data.pensumAllokering) ? data.pensumAllokering : [])
    .filter((p) => p && p.id)
    .map((p) => [p.id, num(p.vekt)]));

  const exposureById = data.produktEksponering && typeof data.produktEksponering === 'object' ? data.produktEksponering : {};

  const selectedProducts = selectedProductIds
    .map((id) => {
      const base = produkterById.get(id) || { id, navn: PRODUCT_NAME[id] || id };
      const meta = PENSUM_PRODUCT_MASTER[id] || {};
      return {
        ...meta,
        ...base,
        id,
        navn: meta.navn || base.navn || id,
        weight: num(weightById.get(id), selectedProductIds.length ? 100 / selectedProductIds.length : 0)
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.weight - a.weight);

  const normalizedProductWeightTotal = selectedProducts.reduce((sum, p) => sum + num(p.weight), 0) || 100;
  selectedProducts.forEach((p) => {
    p.weight = Number(((num(p.weight) / normalizedProductWeightTotal) * 100).toFixed(1));
  });

  const products = selectedProducts.map((p) => p.navn);
  const productRows = selectedProducts.map((p) => ({
    id: p.id,
    navn: p.navn,
    rolle: p.rolle || 'Pensum-løsning',
    kategori: p.kategori || p.aktivatype || 'Produkt',
    weight: p.weight,
    forventetAvkastning: num(p.forventetAvkastning, NaN),
    forventetYield: num(p.forventetYield, NaN),
    y2026: num(p.aar2026, NaN),
    y2025: num(p.aar2025, NaN),
    y2024: num(p.aar2024, NaN),
    y2023: num(p.aar2023, NaN),
    y2022: num(p.aar2022, NaN),
    pitch: p.investeringscase || '',
    hvorfor: p.hvorforIportefolje || '',
    argumenter: Array.isArray(p.hovedargumenter) ? p.hovedargumenter : []
  }));

  const yearlyFields = [
    { year: 2022, key: 'aar2022' },
    { year: 2023, key: 'aar2023' },
    { year: 2024, key: 'aar2024' },
    { year: 2025, key: 'aar2025' },
    { year: 2026, key: 'aar2026' }
  ];

  const yearlyPensum = yearlyFields.map(({ key }) => {
    const weighted = selectedProducts.filter((p) => Number.isFinite(num(p[key], NaN)));
    const totalWeight = weighted.reduce((sum, p) => sum + num(p.weight), 0);
    if (totalWeight <= 0) return 0;
    const value = weighted.reduce((sum, p) => sum + (num(p[key]) * num(p.weight)), 0) / totalWeight;
    return Number(value.toFixed(2));
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
        if (m >= 1 && m <= 12) perMonth[m - 1] = ((curr / prev) - 1) * 100;
      }
      const latestDate = sorted[sorted.length - 1]?.dato || '';
      const yearLabel = String(latestDate).slice(0, 4) || '2026';
      return { year: yearLabel, vals: perMonth.map((x) => (Number.isFinite(x) ? Number(x.toFixed(1)) : 0)) };
    });

  const eksponeringSektorerInput = (Array.isArray(data?.eksponering?.sektorer) ? data.eksponering.sektorer : [])
    .map((r) => ({ navn: r?.navn || 'Ukjent', vekt: num(r?.vekt) }))
    .filter((r) => r.vekt > 0)
    .slice(0, 8);
  const eksponeringRegionerInput = (Array.isArray(data?.eksponering?.regioner) ? data.eksponering.regioner : [])
    .map((r) => ({ navn: r?.navn || 'Ukjent', vekt: num(r?.vekt) }))
    .filter((r) => r.vekt > 0)
    .slice(0, 8);

  const eksponeringSektorer = eksponeringSektorerInput.length ? eksponeringSektorerInput : aggregateWeightedExposure(selectedProducts, exposureById, 'sektorer', 6);
  const eksponeringRegioner = eksponeringRegionerInput.length ? eksponeringRegionerInput : aggregateWeightedExposure(selectedProducts, exposureById, 'regioner', 6);
  const eksponeringStil = aggregateWeightedExposure(selectedProducts, exposureById, 'stil', 5);
  const topHoldings = aggregateWeightedExposure(selectedProducts, exposureById, 'underliggende', 8);

  const weightedReturn = weightedAverage(selectedProducts, 'forventetAvkastning') ?? expected;
  const weightedYield = weightedAverage(selectedProducts, 'forventetYield') ?? null;
  const weightedRisk = weightedAverage(selectedProducts, 'risiko3ar') ?? null;

  const implementationSteps = [
    'Verifiser endelig kapital, risikoprofil og investeringshorisont.',
    'Beslut porteføljesammensetning og eventuelle innfasingstrinn.',
    'Implementer valgte Pensum-løsninger og etabler rapporteringsrutine.',
    'Følg opp med rebalansering og løpende rådgivning ved behov.'
  ];

  return {
    kundeNavn: data.kundeNavn || 'Investor',
    risikoProfil: data.risikoProfil || 'Moderat',
    total,
    expected,
    weightedReturn,
    weightedYield,
    weightedRisk,
    years,
    alloc,
    products,
    expValue: total * Math.pow(1 + expected / 100, years),
    seriesYears: yearlyFields.map((f) => f.year),
    yearlyBase,
    yearlyPensum,
    yearlyWorld,
    productRows,
    monthlyRows: historyRows.length > 0 ? historyRows : [{ year: '2026', vals: Array(12).fill(0) }],
    eksponeringSektorer,
    eksponeringRegioner,
    eksponeringStil,
    topHoldings,
    implementationSteps,
    summaryBullets: [
      `Anbefalt risikoprofil er ${data.risikoProfil || 'Moderat'} med forventet porteføljeavkastning på ${pct(weightedReturn)} p.a.`,
      weightedYield !== null ? `Forventet løpende yield i porteføljen er om lag ${pct(weightedYield)}.` : '',
      `Porteføljen kombinerer ${alloc.map((a) => `${a.navn.toLowerCase()} ${pct(a.vekt)}`).join(', ')}.`,
      `Utvalgte Pensum-løsninger er valgt for å gi diversifisering, robusthet og tydelige roller i porteføljen.`
    ].filter(Boolean),
    malConfig: data.malConfig || {}
  };
}

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
    s.addText('Investeringslogikk og nøkkeltall', { x: 0.9, y: 1.55, w: 8, h: 0.3, fontSize: 18, color: COLORS.navy, bold: true });
    s.addText(bulletText(d.summaryBullets), { x: 0.95, y: 2.0, w: 6.0, h: 2.8, fontSize: 16, color: COLORS.text, breakLine: false, margin: 0.04 });
    s.addTable([
      ['Nøkkeltall', 'Portefølje'],
      ['Forventet avkastning', pct(d.weightedReturn)],
      ['Forventet yield', d.weightedYield !== null ? pct(d.weightedYield) : '—'],
      ['Estimert 3-års risiko', d.weightedRisk !== null ? pct(d.weightedRisk) : '—'],
      ['Investeringshorisont', `${d.years} år`]
    ], { x: 7.5, y: 1.95, w: 4.7, fontSize: 11, border: { pt: 1, color: COLORS.line } });
  }
  if (pageNo === 9) {
    const rows = d.productRows.length > 0
      ? d.productRows.slice(0, 8).map((p) => [p.navn, `${p.weight.toFixed(1)}%`, p.rolle || 'Pensum-løsning', Number.isFinite(p.forventetAvkastning) ? pct(p.forventetAvkastning) : '—'])
      : [['Ingen produkter valgt', '—', '—', '—']];
    s.addText('Pensum-løsningene i porteføljen', { x: 0.9, y: 1.55, w: 8, h: 0.3, fontSize: 18, color: COLORS.navy, bold: true });
    s.addTable([
      ['Løsning', 'Vekt', 'Rolle', 'Forv. avkastning'],
      ...rows
    ], { x: 0.9, y: 1.95, w: 11.8, fontSize: 10, border: { pt: 1, color: COLORS.line } });
    const first = d.productRows[0];
    if (first) {
      s.addText(`Hovedidé: ${first.pitch || first.hvorfor || ''}`, { x: 0.95, y: 5.75, w: 11.5, h: 0.45, fontSize: 11, color: COLORS.muted });
    }
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
    s.addText('Historikk og risikomål', { x: 0.9, y: 1.55, w: 8, h: 0.3, fontSize: 18, color: COLORS.navy, bold: true });
    s.addTable([
      ['Serie', 'Årlig avkastning', 'Volatilitet', 'Sharpe', 'Max Drawdown'],
      ...riskRows.map((r) => [r.year, `${r.annual.toFixed(1)}%`, `${r.vol.toFixed(1)}%`, `${r.sharpe.toFixed(2)}`, `${r.maxDrawdown.toFixed(1)}%`])
    ], { x: 0.9, y: 1.95, w: 11.8, fontSize: 11, border: { pt: 1, color: COLORS.line } });
  }
  if (pageNo === 12) {
    s.addText('Rullerende månedsutvikling', { x: 0.9, y: 1.55, w: 8, h: 0.3, fontSize: 18, color: COLORS.navy, bold: true });
    s.addTable([['År', ...MONTHS, 'År'], ...d.monthlyRows.map((r) => [r.year, ...r.vals.map((v) => v.toFixed(1)), r.vals.reduce((a, b) => a + b, 0).toFixed(1)])], { x: 0.8, y: 1.95, w: 12, colW: [0.8, ...Array(12).fill(0.75), 1.0], fontSize: 9 });
  }

  if (pageNo === 13) {
    s.addText('Eksponeringsoversikt fra Pensum-løsninger', { x: 0.9, y: 1.55, w: 11.8, h: 0.35, fontSize: 18, color: COLORS.navy, bold: true });
    const sekt = d.eksponeringSektorer.length ? d.eksponeringSektorer : [{ navn: 'Ingen data', vekt: 0 }];
    const regi = d.eksponeringRegioner.length ? d.eksponeringRegioner : [{ navn: 'Ingen data', vekt: 0 }];
    const stil = d.eksponeringStil.length ? d.eksponeringStil : [{ navn: 'Ingen data', vekt: 0 }];
    s.addChart(pptx.ChartType.bar, [{ name: 'Sektorer', labels: sekt.map((r) => r.navn), values: sekt.map((r) => r.vekt) }], { x: 0.9, y: 2.0, w: 3.8, h: 3.1, showLegend: false, barDir: 'bar' });
    s.addChart(pptx.ChartType.bar, [{ name: 'Regioner', labels: regi.map((r) => r.navn), values: regi.map((r) => r.vekt) }], { x: 4.95, y: 2.0, w: 3.8, h: 3.1, showLegend: false, barDir: 'bar' });
    s.addChart(pptx.ChartType.bar, [{ name: 'Stil', labels: stil.map((r) => r.navn), values: stil.map((r) => r.vekt) }], { x: 9.0, y: 2.0, w: 3.0, h: 3.1, showLegend: false, barDir: 'bar' });
    const holdings = d.topHoldings.length ? d.topHoldings.slice(0, 6).map((r) => `${r.navn}: ${pct(r.vekt)}`).join('  •  ') : 'Ingen holdings-data tilgjengelig';
    s.addText(`Største underliggende: ${holdings}`, { x: 0.95, y: 5.55, w: 11.4, h: 0.45, fontSize: 10, color: COLORS.muted });
  }

  if (pageNo === 14) {
    s.addText('Implementering og oppfølging', { x: 0.9, y: 1.55, w: 8, h: 0.3, fontSize: 18, color: COLORS.navy, bold: true });
    s.addText(bulletText(d.implementationSteps), { x: 1.0, y: 2.0, w: 10.8, h: 2.6, fontSize: 18, color: COLORS.text, breakLine: false, margin: 0.04 });
    s.addText('Pensum følger porteføljen løpende og vurderer rebalansering, markedstilpasninger og rapportering sammen med kunden.', { x: 1.0, y: 5.15, w: 10.8, h: 0.5, fontSize: 12, color: COLORS.muted });
  }

  if (pageNo >= 15) {
    s.addText('Standardside fra generatoren (fallback ved manglende mal-placeholder).', { x: 0.9, y: 2.0, w: 11.2, h: 0.6, fontSize: 14, color: COLORS.text });
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
      const filnavn = `Pensum_Investeringsforslag_${(data.kundeNavn || 'Kunde').replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pptx`;
      try {
        const { buffer, replacements } = await applyTemplatePptx(templateData.buffer, data);
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
        console.warn('Template merge feilet, returnerer rå mal i stedet:', templateErr.message);
        res.setHeader('X-Pensum-Output-Format', 'pptx-template-raw');
        res.setHeader('X-Pensum-Template-Source', templateData.source || 'upload');
        res.setHeader('X-Pensum-Template-Warning', encodeURIComponent(`Template-merge feilet: ${templateErr.message}. Returnerer rå mal.`));
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
        res.setHeader('Content-Disposition', `attachment; filename="${filnavn}"`);
        return res.send(templateData.buffer);
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
  runtime: 'nodejs',
  api: { bodyParser: { sizeLimit: '20mb' }, responseLimit: '20mb' }
};
