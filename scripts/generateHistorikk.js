const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// --- Config ---
const XLSX_FILENAME = 'Datafeed til rådgiververktøy 31.08.26.xlsx';
const args = process.argv.slice(2);
const checkOnly = args.includes('--check');
const requestedFile = args.find((arg) => arg !== '--check') || XLSX_FILENAME;
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
  { col: 1, key: 'basis', header: /Pensum Basis/i },
  { col: 3, key: 'financial-d', header: /Pensum Financial Opportunity/i },
  { col: 5, key: 'global-core-active', header: /Pensum Global Core Active/i },
  { col: 7, key: 'global-edge', header: /Pensum Global Edge/i },
  { col: 9, key: 'energy-a', header: /Pensum Global Energy/i },
  { col: 11, key: 'global-hoyrente', header: /Pensum Global Høyrente/i },
  { col: 13, key: 'banking-d', header: /Pensum Nordic Banking Sector/i },
  { col: 15, key: 'nordisk-hoyrente', header: /Pensum Nordisk Høyrente/i },
  { col: 17, key: 'norge-a', header: /Pensum Norske Aksjer/i },
  { col: 19, key: 'kairos-a', header: /Pensum Kairos/i },
];

// --- Index mapping (indekser) ---
const INDEKS_MAP = [
  { col: 1, key: 'msci-acwi', navn: 'MSCI ACWI', header: /MSCI ACWI All Cap/i },
  { col: 3, key: 'msci-world', navn: 'MSCI World', header: /MSCI World/i },
  { col: 5, key: 'sp500', navn: 'S&P 500', header: /S&P 500/i },
  { col: 7, key: 'msci-europe', navn: 'MSCI Europe', header: /MSCI Europe/i },
  { col: 9, key: 'msci-em', navn: 'MSCI EM', header: /MSCI EM/i },
  { col: 11, key: 'topix', navn: 'TOPIX', header: /TOPIX/i },
  { col: 13, key: 'oslo-bors', navn: 'Oslo Børs', header: /OSE Oslo Børs Benchmark/i },
  { col: 15, key: 'norske-statsobl', navn: 'Norske Statsobl.', header: /Norske Statsobligasjoner/i },
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

function validateHeaders(rows, mapping, sheetName) {
  for (const { col, key, header } of mapping) {
    const actual = String(rows?.[3]?.[col] || '').trim();
    if (!header.test(actual)) {
      throw new Error(`Uventet kolonne for "${key}" i arket "${sheetName}": "${actual}"`);
    }
  }
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
const eksternRows = requireSheet(wb, 'Fondsfokuslisten');

const reportDate = serialToDate(indekserRows?.[1]?.[1]);
if (!reportDate) throw new Error('Fant ikke gyldig rapportdato i arket "indekser"');
for (const [sheetName, rows] of [['Pensumløsninger', produktRows], ['Fondsfokuslisten', eksternRows]]) {
  const sheetDate = serialToDate(rows?.[1]?.[1]);
  if (sheetDate !== reportDate) {
    throw new Error(`Rapportdato i "${sheetName}" er ${sheetDate || 'ugyldig'}, forventet ${reportDate}`);
  }
}
const reportDateDisplay = reportDate.split('-').reverse().join('.');

console.log('indekser rows:', indekserRows.length);
console.log('Pensumløsninger rows:', produktRows.length);
console.log('Fondsfokuslisten rows:', eksternRows.length);

const EKSTERN_MAP = [
  { col: 1, key: 'acadian-global-equity', header: /Acadian Global Equity/i },
  { col: 3, key: 'capital-group-new-pers', header: /Capital Group New\s*Pers/i },
  { col: 5, key: 'dnb-global-enhanced', header: /DNB Global Enhanced/i },
  { col: 7, key: 'guinness-global-equity-income', header: /Guinness Global Equity Income/i },
  { col: 9, key: 'janus-henderson-glb-sc', header: /Janus Henderson.*Glb SC/i },
];

validateHeaders(produktRows, PRODUKT_MAP, 'Pensumløsninger');
validateHeaders(eksternRows, EKSTERN_MAP, 'Fondsfokuslisten');
validateHeaders(indekserRows, INDEKS_MAP, 'indekser');

const produktHistorikkBase = parseSheet(produktRows, PRODUKT_MAP);
const eksternHistorikk = parseSheet(eksternRows, EKSTERN_MAP);
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
export const DATAFEED_RAPPORT_DATO = "${reportDate}";

export const DATAFEED_PRODUKT_HISTORIKK = ${JSON.stringify(produktHistorikk, null, 2)};

export const DATAFEED_INDEKS_HISTORIKK = ${JSON.stringify(indeksHistorikk, null, 2)};
`;

if (checkOnly) {
  if (!fs.existsSync(OUTPUT_PATH) || fs.readFileSync(OUTPUT_PATH, 'utf-8') !== output) {
    throw new Error('Generert historikk er ikke oppdatert. Kjør `npm run data:generate`.');
  }
  console.log('\nOK: generert historikk er oppdatert og komplett.');
} else {
  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, output, 'utf-8');
  console.log('\nWrote:', OUTPUT_PATH, '(' + (fs.statSync(OUTPUT_PATH).size / 1024 / 1024).toFixed(1) + ' MB)');
}
