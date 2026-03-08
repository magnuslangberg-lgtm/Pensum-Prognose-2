import fs from 'fs';
import path from 'path';

const CSV_CANDIDATES = [
  'Datafeed til rådgiververktøy.csv',
  'Datafeed til radgiververktoy.csv',
  'datafeed-radgiververktoy.csv',
  'datafeed.csv',
];

const UPLOAD_DIR_CANDIDATES = ['uploads', 'public/uploads'];

const PRODUCT_ALIASES = {
  'pensum global core active (lang)': 'Pensum Global Core Active',
  'pensum global edge(lang)': 'Pensum Global Edge',
  'pensum global energy(lang)': 'Pensum Global Energy',
  'pensum global høyrente': 'Pensum Global Høyrente',
  'pensum global hoyrente': 'Pensum Global Høyrente',
  'pensum norge': 'Pensum Norge',
  'pensum norske aksjer (lang)': 'Pensum Norge',
  'pensum nordisk høyrente(lang)': 'Pensum Nordisk Høyrente',
  'pensum nordisk hoyrente(lang)': 'Pensum Nordisk Høyrente',
  'pensum nordic banking sector(lang)': 'Pensum Nordic Banking Sector',
  'pensum financial opportunity(lang)': 'Pensum Financial Opportunities',
  'pensum basis - lang': 'Pensum Basis',
};

function resolveRepoPath(relativePath) {
  return path.join(process.cwd(), relativePath);
}

function fileExists(p) {
  try {
    return fs.existsSync(p);
  } catch {
    return false;
  }
}

function chooseLatestFile(paths = []) {
  const existing = paths.filter((p) => fileExists(p));
  if (!existing.length) return null;
  return existing
    .map((p) => ({ p, mtime: fs.statSync(p).mtimeMs }))
    .sort((a, b) => b.mtime - a.mtime)[0].p;
}

function parseNumber(raw) {
  if (raw == null) return null;
  const text = String(raw).replace(/\u00a0/g, '').replace(/\s+/g, '').trim();
  if (!text) return null;
  const normalized = text.replace(/\./g, '').replace(',', '.');
  const n = Number(normalized);
  return Number.isFinite(n) ? n : null;
}

function normalizeProductName(name = '') {
  const base = String(name).trim().replace(/\s+/g, ' ');
  const key = base.toLowerCase();
  return PRODUCT_ALIASES[key] || base;
}

function parseDelimitedCsv(content) {
  return content
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .map((line) => line.split(';'));
}

function parseDateText(raw) {
  if (!raw) return null;
  const text = String(raw).trim();
  if (/^\d{2}\.\d{2}\.\d{4}$/.test(text)) {
    const [dd, mm, yyyy] = text.split('.');
    return `${yyyy}-${mm}-${dd}`;
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  return null;
}

function extractSeries(rows, colIdx) {
  const out = [];
  for (let i = 6; i < rows.length; i += 1) {
    const row = rows[i] || [];
    const date = parseDateText(row[colIdx]);
    const value = parseNumber(row[colIdx + 1]);
    if (date && Number.isFinite(value)) out.push({ date, value });
  }
  return out;
}

export function parsePensumCsvBuffer(buffer) {
  const content = buffer.toString('latin1');
  const rows = parseDelimitedCsv(content);
  const reportDate = parseDateText(rows?.[1]?.[1]) || null;
  const products = [];

  const headerRow = rows[3] || [];
  for (let c = 1; c < headerRow.length; c += 2) {
    const rawName = headerRow[c];
    if (!rawName || !String(rawName).trim()) continue;
    const name = normalizeProductName(rawName);
    const id = (rows?.[4]?.[c] || '').trim();
    const dri = (rows?.[5]?.[c] || '').trim();
    const series = extractSeries(rows, c);
    if (!series.length) continue;
    const latestValue = series[series.length - 1]?.value ?? null;
    const firstValue = series[0]?.value ?? null;
    const totalReturn = Number.isFinite(firstValue) && Number.isFinite(latestValue) && firstValue !== 0
      ? latestValue / firstValue - 1
      : null;

    products.push({
      key: name.toLowerCase().replace(/[^a-z0-9]+/gi, '-'),
      name,
      sourceId: id || null,
      driId: dri || null,
      points: series,
      latestValue,
      startValue: firstValue,
      totalReturn,
      lastDate: series[series.length - 1]?.date || reportDate,
    });
  }

  return {
    reportDate,
    products,
    discoveredProductNames: products.map((p) => p.name),
  };
}

export function loadLatestPensumCsvFromUploads() {
  const candidates = [];
  for (const dir of UPLOAD_DIR_CANDIDATES) {
    for (const file of CSV_CANDIDATES) {
      candidates.push(resolveRepoPath(path.join(dir, file)));
    }
    try {
      const absDir = resolveRepoPath(dir);
      if (fileExists(absDir)) {
        for (const entry of fs.readdirSync(absDir)) {
          if (entry.toLowerCase().endsWith('.csv')) candidates.push(path.join(absDir, entry));
        }
      }
    } catch {}
  }

  const chosen = chooseLatestFile(candidates);
  if (!chosen) {
    return {
      found: false,
      filepath: null,
      reportDate: null,
      products: [],
      discoveredProductNames: [],
    };
  }

  const buffer = fs.readFileSync(chosen);
  const parsed = parsePensumCsvBuffer(buffer);
  return {
    found: true,
    filepath: chosen,
    ...parsed,
  };
}

export default loadLatestPensumCsvFromUploads;
