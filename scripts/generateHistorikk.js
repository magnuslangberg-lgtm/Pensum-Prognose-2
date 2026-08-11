const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// --- Config ---
const XLSX_FILENAME = 'Datafeed til rådgiververktøy - juli26.xlsx';
const requestedFile = process.argv[2] || XLSX_FILENAME;
const XLSX_PATH = path.isAbsolute(requestedFile)
  ? requestedFile
  : path.join(__dirname, '..', 'uploads', requestedFile);
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
  { col: 19, key: 'kairos-a' },
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
      if (typeof value !== 'number' || !Number.isFinite(value)) continue;
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

function requireSheet(wb, sheetName) {
  const sheet = wb.Sheets[sheetName];
  if (!sheet) throw new Error(`Mangler obligatorisk ark: "${sheetName}"`);
  return XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null });
}

function validateSeries(seriesMap, reportDate, label) {
  for (const [key, entry] of Object.entries(seriesMap)) {
    if (!entry.data.length) throw new Error(`${label} "${key}" har ingen datapunkter`);
    for (let i = 1; i < entry.data.length; i++) {
      if (entry.data[i].dato <= entry.data[i - 1].dato) {
        throw new Error(`${label} "${key}" har duplikat eller usortert dato: ${entry.data[i].dato}`);
      }
    }
    const lastDate = entry.data.at(-1).dato;
    if (lastDate !== reportDate) {
      throw new Error(`${label} "${key}" slutter ${lastDate}, forventet ${reportDate}`);
    }
  }
}

// --- Main ---
console.log('Reading:', XLSX_PATH);
const wb = XLSX.readFile(XLSX_PATH);

const indekserRows = requireSheet(wb, 'indekser');
const produktRows = requireSheet(wb, 'Pensumløsninger');
const eksternRows = wb.Sheets['Fondsfokuslisten'] ? XLSX.utils.sheet_to_json(wb.Sheets['Fondsfokuslisten'], { header: 1, defval: null }) : [];

const reportDate = serialToDate(indekserRows?.[1]?.[1]);
if (!reportDate) throw new Error('Fant ikke gyldig rapportdato i arket "indekser"');
const reportDateDisplay = reportDate.split('-').reverse().join('.');

console.log('indekser rows:', indekserRows.length);
console.log('Pensumløsninger rows:', produktRows.length);
console.log('Fondsfokuslisten rows:', eksternRows.length);

const EKSTERN_MAP = [
  { col: 1, key: 'acadian-global-equity' },
  { col: 3, key: 'capital-group-new-pers' },
  { col: 5, key: 'dnb-global-enhanced' },
  { col: 7, key: 'guinness-global-equity-income' },
  { col: 9, key: 'janus-henderson-glb-sc' },
];

const produktHistorikkBase = parseSheet(produktRows, PRODUKT_MAP);
const eksternHistorikk = eksternRows.length > 0 ? parseSheet(eksternRows, EKSTERN_MAP) : {};
const produktHistorikk = { ...produktHistorikkBase, ...eksternHistorikk };
const indeksHistorikk = parseSheet(indekserRows, INDEKS_MAP);

validateSeries(produktHistorikk, reportDate, 'Produkt');
validateSeries(indeksHistorikk, reportDate, 'Indeks');

// Report
for (const [k, v] of Object.entries(produktHistorikk)) {
  console.log(`  Produkt "${k}": ${v.data.length} datapunkter, start: ${v.startDato}`);
}
for (const [k, v] of Object.entries(indeksHistorikk)) {
  console.log(`  Indeks "${k}" (${v.navn}): ${v.data.length} datapunkter, start: ${v.startDato}`);
}

// --- Generate output ---
const sourceFilename = path.basename(XLSX_PATH);
const output = `// Generert fra uploads/${sourceFilename} - DAGLIGE datapunkter per ${reportDateDisplay}
export const DATAFEED_KILDE = "Datafeed til rådgiververktøy per ${reportDateDisplay}";

export const DATAFEED_PRODUKT_HISTORIKK = ${JSON.stringify(produktHistorikk, null, 2)};

export const DATAFEED_INDEKS_HISTORIKK = ${JSON.stringify(indeksHistorikk, null, 2)};
`;

fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
fs.writeFileSync(OUTPUT_PATH, output, 'utf-8');
console.log('\nWrote:', OUTPUT_PATH, '(' + (fs.statSync(OUTPUT_PATH).size / 1024 / 1024).toFixed(1) + ' MB)');
