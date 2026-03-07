import fs from 'fs';
import path from 'path';
import { PENSUM_PRODUCT_MASTER_V2, PRODUCT_NAME_ALIASES_V2 } from '../data/pensumProductMasterV2.js';

function normalizeText(value = '') {
  return String(value || '')
    .toLowerCase()
    .replace(/["']/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseNbNumber(value) {
  if (value === null || value === undefined) return null;
  const cleaned = String(value)
    .replace(/\u00a0/g, '')
    .replace(/\s/g, '')
    .replace(/\./g, '')
    .replace(',', '.');
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

function parseDate(value) {
  if (!value) return null;
  const txt = String(value).trim();
  if (/^\d{2}\.\d{2}\.\d{4}$/.test(txt)) {
    const [dd, mm, yyyy] = txt.split('.');
    return `${yyyy}-${mm}-${dd}`;
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(txt)) return txt;
  return null;
}

function computeReturn(series, monthsBackApprox) {
  if (!Array.isArray(series) || series.length < 2) return null;
  const latest = series[series.length - 1]?.verdi;
  const targetIdx = Math.max(0, series.length - 1 - monthsBackApprox * 21);
  const earlier = series[targetIdx]?.verdi;
  if (!Number.isFinite(latest) || !Number.isFinite(earlier) || earlier === 0) return null;
  return ((latest / earlier) - 1) * 100;
}

function computeYtd(series) {
  if (!Array.isArray(series) || series.length < 2) return null;
  const latest = series[series.length - 1];
  if (!latest?.dato) return null;
  const year = latest.dato.slice(0, 4);
  const firstOfYear = series.find((p) => String(p.dato || '').startsWith(year));
  if (!firstOfYear || !Number.isFinite(firstOfYear.verdi) || firstOfYear.verdi === 0) return null;
  return ((latest.verdi / firstOfYear.verdi) - 1) * 100;
}

export function parsePensumCsvText(text) {
  const rows = String(text || '')
    .split(/\r?\n/)
    .map((line) => line.split(';'));

  const reportDate = rows?.[1]?.[1] || rows?.[0]?.[1] || '';
  const reportDateIso = parseDate(reportDate);
  const headerRow = rows?.[3] || [];

  const products = [];
  for (let col = 1; col < headerRow.length; col += 2) {
    const rawName = headerRow[col];
    if (!rawName || !String(rawName).trim()) continue;
    const aliasKey = normalizeText(rawName);
    const productId = PRODUCT_NAME_ALIASES_V2[aliasKey] || null;
    const series = [];
    for (let r = 6; r < rows.length; r += 1) {
      const a = rows[r]?.[col];
      const b = rows[r]?.[col + 1];
      const dato = parseDate(a) || parseDate(b);
      const verdi = Number.isFinite(parseNbNumber(a)) ? parseNbNumber(a) : parseNbNumber(b);
      if (!dato || !Number.isFinite(verdi)) continue;
      series.push({ dato, verdi });
    }
    if (series.length === 0) continue;
    const latest = series[series.length - 1]?.verdi ?? null;
    const returns = {
      m1: computeReturn(series, 1),
      m3: computeReturn(series, 3),
      ytd: computeYtd(series),
      y1: computeReturn(series, 12),
      y3: computeReturn(series, 36),
      y5: computeReturn(series, 60)
    };
    products.push({
      rawName,
      productId,
      productMeta: productId ? PENSUM_PRODUCT_MASTER_V2[productId] : null,
      series,
      latest,
      returns
    });
  }

  return {
    reportDate: reportDateIso,
    products,
    unresolvedProducts: products.filter((p) => !p.productId).map((p) => p.rawName)
  };
}

export function parsePensumCsvBuffer(buffer) {
  return parsePensumCsvText(Buffer.isBuffer(buffer) ? buffer.toString('latin1') : String(buffer || ''));
}

export function loadLatestPensumCsvFromUploads() {
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) return null;
  const csvFiles = fs.readdirSync(uploadsDir)
    .filter((name) => /datafeed.*rådgiververktøy.*\.csv$/i.test(name) || /datafeed.*radgiververktoy.*\.csv$/i.test(name))
    .map((name) => ({
      name,
      fullPath: path.join(uploadsDir, name),
      mtimeMs: fs.statSync(path.join(uploadsDir, name)).mtimeMs
    }))
    .sort((a, b) => b.mtimeMs - a.mtimeMs);
  if (csvFiles.length === 0) return null;
  return parsePensumCsvBuffer(fs.readFileSync(csvFiles[0].fullPath));
}
