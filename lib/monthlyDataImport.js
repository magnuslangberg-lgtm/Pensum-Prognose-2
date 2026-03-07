import fs from 'fs';
import path from 'path';

function decodeNumber(value) {
  if (value == null) return null;
  const s = String(value).replace(/\u00a0/g, '').replace(/ /g, '').replace(',', '.').trim();
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

export function parsePensumCsv(filePath) {
  const raw = fs.readFileSync(filePath, 'latin1');
  const rows = raw.split(/\r?\n/).map((line) => line.split(';'));
  const reportDate = rows?.[1]?.[1] || null;
  const productHeaderRow = rows?.[3] || [];

  const products = [];
  for (let i = 1; i < productHeaderRow.length; i += 2) {
    const name = productHeaderRow[i];
    if (!name) continue;
    products.push({ name: String(name).replace(/\(lang\)$/i, '').trim(), valueColumn: i });
  }

  return {
    reportDate,
    products,
    rawRows: rows.length,
  };
}

export function findLatestPensumDataFile(baseDir) {
  const candidates = [
    'Datafeed til rådgiververktøy.csv',
    'Datafeed til r#U00e5dgiververkt#U00f8y.csv',
    'Datafeed til rådgiververktøy.xlsx',
  ];
  for (const rel of candidates) {
    const full = path.join(baseDir, rel);
    if (fs.existsSync(full)) return full;
  }
  return null;
}

export function buildMonthlyDataSnapshot(uploadsDir) {
  const file = findLatestPensumDataFile(uploadsDir);
  if (!file) return { found: false, products: [], reportDate: null };
  const parsed = parsePensumCsv(file);
  return {
    found: true,
    file,
    reportDate: parsed.reportDate,
    products: parsed.products,
    rawRows: parsed.rawRows,
  };
}
