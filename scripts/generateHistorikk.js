const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// --- Config ---
const XLSX_PATH = path.join(__dirname, '..', 'uploads', 'Datafeed til rådgiververktøy.xlsx');
const OUTPUT_PATH = path.join(__dirname, '..', 'data', 'pensumDatafeedHistorikk.js');

// Excel serial number -> YYYY-MM-DD
function serialToDate(serial) {
  if (serial == null || typeof serial !== 'number') return null;
  // Excel epoch is 1899-12-30, but Excel has a leap year bug (treats 1900 as leap year)
  const epoch = new Date(Date.UTC(1899, 11, 30));
  const ms = epoch.getTime() + serial * 86400000;
  const d = new Date(ms);
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// --- Product mapping (Pensumløsninger) ---
const PRODUKT_MAP = [
  { col: 1, key: 'basis' },
  { col: 3, key: 'financial-d' },
  { col: 5, key: 'global-core-active' },
  { col: 7, key: 'global-edge' },
  { col: 9, key: 'energy-a' },
  { col: 11, key: 'global-hoyrente' },
  { col: 13, key: 'banking-d' },
  { col: 15, key: 'nordisk-hoyrente' },
  { col: 17, key: 'norge-a' },
];

// --- Index mapping (indekser) ---
const INDEKS_MAP = [
  { col: 1, key: 'msci-acwi', navn: 'MSCI ACWI' },
  { col: 3, key: 'msci-world', navn: 'MSCI World' },
  { col: 5, key: 'sp500', navn: 'S&P 500' },
  { col: 7, key: 'msci-europe', navn: 'MSCI Europe' },
  { col: 9, key: 'msci-em', navn: 'MSCI EM' },
  { col: 11, key: 'topix', navn: 'TOPIX' },
  { col: 13, key: 'oslo-bors', navn: 'Oslo Børs' },
  { col: 15, key: 'norske-statsobl', navn: 'Norske Statsobl.' },
];

// --- Parse a sheet ---
function parseSheet(rows, mapping) {
  const result = {};
  for (const { col, key, navn } of mapping) {
    const dateCol = col - 1; // date is in column before value
    // For col 1 the date column is 0
    const data = [];
    for (let r = 6; r < rows.length; r++) {
      const row = rows[r];
      const dateSerial = row[dateCol];
      const value = row[col];
      if (dateSerial == null || dateSerial === '' || value == null || value === '') continue;
      const dato = serialToDate(dateSerial);
      if (!dato) continue;
      data.push({ dato, verdi: Math.round(value * 100) / 100 });
    }
    const entry = {};
    if (navn) {
      entry.navn = navn;
      entry.valuta = 'NOK';
    }
    entry.startDato = data.length > 0 ? data[0].dato : null;
    entry.data = data;
    result[key] = entry;
  }
  return result;
}

// --- Main ---
console.log('Reading:', XLSX_PATH);
const wb = XLSX.readFile(XLSX_PATH);

const indekserRows = XLSX.utils.sheet_to_json(wb.Sheets['indekser'], { header: 1, defval: null });
const produktRows = XLSX.utils.sheet_to_json(wb.Sheets['Pensumløsninger'], { header: 1, defval: null });

console.log('indekser rows:', indekserRows.length);
console.log('Pensumløsninger rows:', produktRows.length);

const produktHistorikk = parseSheet(produktRows, PRODUKT_MAP);
const indeksHistorikk = parseSheet(indekserRows, INDEKS_MAP);

// Report
for (const [k, v] of Object.entries(produktHistorikk)) {
  console.log(`  Produkt "${k}": ${v.data.length} datapunkter, start: ${v.startDato}`);
}
for (const [k, v] of Object.entries(indeksHistorikk)) {
  console.log(`  Indeks "${k}" (${v.navn}): ${v.data.length} datapunkter, start: ${v.startDato}`);
}

// --- Generate output ---
const output = `// Generert fra uploads/Datafeed til rådgiververktøy.xlsx - DAGLIGE datapunkter
export const DATAFEED_KILDE = "uploads/Datafeed til rådgiververktøy.xlsx";

export const DATAFEED_PRODUKT_HISTORIKK = ${JSON.stringify(produktHistorikk, null, 2)};

export const DATAFEED_INDEKS_HISTORIKK = ${JSON.stringify(indeksHistorikk, null, 2)};
`;

fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
fs.writeFileSync(OUTPUT_PATH, output, 'utf-8');
console.log('\nWrote:', OUTPUT_PATH, '(' + (fs.statSync(OUTPUT_PATH).size / 1024 / 1024).toFixed(1) + ' MB)');
