import fs from 'fs';
import path from 'path';

function parseCsvLine(line = '') {
  const out = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      out.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out.map((v) => String(v || '').trim());
}

function toNumber(value) {
  if (value === null || value === undefined || value === '') return null;
  const normalized = String(value)
    .replace(/\s/g, '')
    .replace(/\./g, '')
    .replace(',', '.');
  const n = Number(normalized);
  return Number.isFinite(n) ? n : null;
}

function findLatestCsvFile() {
  const candidates = [
    path.join(process.cwd(), 'uploads'),
    path.join(process.cwd(), 'public', 'uploads'),
  ];

  const hits = [];
  for (const dir of candidates) {
    if (!fs.existsSync(dir)) continue;
    for (const name of fs.readdirSync(dir)) {
      if (!name.toLowerCase().endsWith('.csv')) continue;
      const fullPath = path.join(dir, name);
      const stat = fs.statSync(fullPath);
      hits.push({ fullPath, name, mtimeMs: stat.mtimeMs });
    }
  }

  hits.sort((a, b) => b.mtimeMs - a.mtimeMs);
  return hits[0] || null;
}

function normalizeProductId(name = '') {
  const n = String(name || '').toLowerCase();
  if (n.includes('global core')) return 'global-core-active';
  if (n.includes('global edge')) return 'global-edge';
  if (n.includes('basis')) return 'basis';
  if (n.includes('global høyrente') || n.includes('global hoyrente')) return 'global-hoyrente';
  if (n.includes('nordisk høyrente') || n.includes('nordisk hoyrente')) return 'nordisk-hoyrente';
  if (n.includes('norge')) return 'norge';
  if (n.includes('global energy')) return 'global-energy';
  if (n.includes('banking')) return 'nordic-banking-sector';
  if (n.includes('financial opportunities')) return 'financial-opportunities';
  return n.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function inferReportDate(headerRow = [], lines = []) {
  const headerText = `${headerRow.join(' ')} ${lines.slice(0, 6).join(' ')}`;
  const m = headerText.match(/(\d{2}\.\d{2}\.\d{4})/);
  return m ? m[1] : null;
}

export function parsePensumCsv(csvText = '') {
  const lines = String(csvText || '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (!lines.length) {
    return { reportDate: null, products: [], source: 'empty' };
  }

  const rows = lines.map(parseCsvLine);
  const reportDate = inferReportDate(rows[0], lines);
  const products = [];

  for (const row of rows) {
    const first = String(row[0] || '');
    if (!first) continue;
    const lower = first.toLowerCase();
    if (
      lower.includes('pensum global') ||
      lower.includes('pensum nordisk') ||
      lower.includes('pensum norge') ||
      lower.includes('pensum basis') ||
      lower.includes('nordic banking') ||
      lower.includes('financial opportunities')
    ) {
      const returns = {
        '1M': toNumber(row[1]),
        '3M': toNumber(row[2]),
        'YTD': toNumber(row[3]),
        '1Y': toNumber(row[4]),
        '3Y': toNumber(row[5]),
        '5Y': toNumber(row[6]),
      };
      products.push({
        productId: normalizeProductId(first),
        productName: first,
        latest: toNumber(row[1]),
        returns,
        raw: row,
      });
    }
  }

  return {
    reportDate,
    products,
    source: 'csv',
  };
}

export function loadLatestPensumCsvFromUploads() {
  const latest = findLatestCsvFile();
  if (!latest) return { reportDate: null, products: [], source: 'no-file' };
  const csvText = fs.readFileSync(latest.fullPath, 'utf8');
  const parsed = parsePensumCsv(csvText);
  return {
    ...parsed,
    fileName: latest.name,
    filePath: latest.fullPath,
  };
}

export default loadLatestPensumCsvFromUploads;
