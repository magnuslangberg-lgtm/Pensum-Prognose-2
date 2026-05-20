const STORAGE_KEY = 'pensum-formuesplanlegger';
const PROFILES_KEY = 'pensum-fp-profiler';

export const STEG_LABELS = [
  { id: 1, key: 'nasituasjon', label: 'Nåsituasjon' },
  { id: 2, key: 'mal', label: 'Mål & rammer' },
  { id: 3, key: 'allokering', label: 'Allokering' },
  { id: 4, key: 'prognose', label: 'Prognose' },
  { id: 5, key: 'scenarioer', label: 'Scenarioer' },
  { id: 6, key: 'uttak', label: 'Uttak & pensjon' },
  { id: 7, key: 'oppsummering', label: 'Oppsummering' },
];

export const LIKVIDITET_VALG = ['Umiddelbar', 'Dager', 'Uker', 'Måneder', 'År'];
export const EIERSKAP_VALG = ['Privat', 'Holdingselskap', 'Felles', 'Ektefelle'];

export const DEFAULT_AVKASTNING = {
  'Primærbolig': 3,
  'Fritidsbolig': 2,
  'Utleieeiendom': 5,
  'Pensum Global Core Active': 7,
  'Pensum Global Edge': 8,
  'Pensum Norge': 8,
  'Pensum Financial Opportunities': 7,
  'Pensum Nordic Banking': 9,
  'Pensum Energy': 9,
  'Pensum Nordisk Høyrente': 6,
  'Pensum Basis': 5,
  'Andre aksjefond': 7,
  'Rentefond': 4,
  'Bank/innskudd': 3,
  'PE-fond': 12,
  'Eiendomsfond': 7,
  'Shippingfond': 10,
  'Unoterte aksjer': 12,
};

export const DEFAULT_VOLATILITET = {
  'Primærbolig': 5,
  'Fritidsbolig': 5,
  'Utleieeiendom': 8,
  'Pensum Global Core Active': 12,
  'Pensum Global Edge': 16,
  'Pensum Norge': 18,
  'Pensum Financial Opportunities': 14,
  'Pensum Nordic Banking': 20,
  'Pensum Energy': 22,
  'Pensum Nordisk Høyrente': 5,
  'Pensum Basis': 8,
  'Andre aksjefond': 15,
  'Rentefond': 3,
  'Bank/innskudd': 0,
  'PE-fond': 20,
  'Eiendomsfond': 12,
  'Shippingfond': 25,
  'Unoterte aksjer': 25,
};

export const HENDELSE_TYPER = [
  'Boligsalg', 'Boligkjøp', 'Virksomhetssalg', 'Arv inn',
  'Generasjonsoverføring ut', 'Annet',
];

export const KRISE_SCENARIOER = [
  { id: 'finanskrise', label: 'Finanskrise (2008)', aksjer: -40, hoyrente: -25, eiendom: -15, varighet: 1 },
  { id: 'covid', label: 'COVID-sjokk (2020)', aksjer: -30, hoyrente: -5, eiendom: -5, varighet: 1 },
  { id: 'inflasjon2022', label: 'Inflasjonsåret (2022)', aksjer: -15, hoyrente: -10, eiendom: 0, varighet: 1 },
  { id: 'stagflasjon', label: 'Stagflasjon', aksjer: 0, hoyrente: -2, eiendom: 0, varighet: 5 },
  { id: 'renteoppgang', label: 'Renteoppgang', aksjer: -5, hoyrente: -10, eiendom: -5, varighet: 1 },
];

function tomPosisjon(kategori, underkategori) {
  return {
    id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    kategori,
    underkategori: underkategori || '',
    navn: '',
    verdi: 0,
    forventetAvkastning: DEFAULT_AVKASTNING[underkategori] ?? 5,
    forventetVolatilitet: DEFAULT_VOLATILITET[underkategori] ?? 10,
    likviditet: 'Måneder',
    eierskap: 'Privat',
    kommentar: '',
  };
}

function tomGjeld() {
  return {
    id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    navn: '',
    hovedstol: 0,
    rente: 4,
    avdragsplan: 'annuitet',
    bindingstid: 0,
    maanedligAvdrag: 0,
  };
}

function tomHendelse() {
  return {
    id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type: 'Annet',
    aar: new Date().getFullYear() + 5,
    belop: 0,
    kommentar: '',
  };
}

export function initialState() {
  return {
    kundeNavn: '',
    opprettetDato: new Date().toISOString().split('T')[0],

    // Steg 1 — Nåsituasjon
    eiendeler: [],
    gjeld: [],

    // Steg 2 — Mål & rammer
    hovedhorisont: 10,
    potter: [],
    likviditetMaaRealisere: 0,
    likviditetBuffer: 0,
    risikotoleranse: 4,
    aarligUttak: 0,
    uttakStartAar: new Date().getFullYear() + 10,
    hendelser: [],

    // Steg 3 — Allokering
    forslaattAllokering: {},

    // Steg 4 — Prognose (beregnes, ingen input)

    // Steg 5 — Scenarioer
    aktivtScenario: null,
    egneScenarioer: [],

    // Steg 6 — Uttak
    uttakSlider: 0,

    // Steg 7 — Oppsummering
    radgiverAnbefaling: '',

    // Forutsetninger
    forutsetninger: {
      inflasjon: 2.5,
      avkastningPerKategori: { ...DEFAULT_AVKASTNING },
      volatilitetPerKategori: { ...DEFAULT_VOLATILITET },
      formuesskatt: 1.1,
      utbytteskatt: 37.84,
      gevinstskatt: 37.84,
      monteCarloSimuleringer: 1000,
    },
  };
}

export function loadState() {
  if (typeof window === 'undefined') return initialState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState();
    const parsed = JSON.parse(raw);
    const defaults = initialState();
    return { ...defaults, ...parsed, forutsetninger: { ...defaults.forutsetninger, ...(parsed.forutsetninger || {}) } };
  } catch {
    return initialState();
  }
}

export function saveState(state) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch { /* quota exceeded — ignore */ }
}

export function listProfiles() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(PROFILES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function saveProfile(name, state) {
  const profiles = listProfiles();
  const entry = { name, date: new Date().toISOString(), state: JSON.parse(JSON.stringify(state)) };
  const idx = profiles.findIndex(p => p.name === name);
  if (idx >= 0) profiles[idx] = entry; else profiles.push(entry);
  try { localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles)); } catch {}
}

export function loadProfile(name) {
  const profiles = listProfiles();
  const match = profiles.find(p => p.name === name);
  return match ? match.state : null;
}

export function deleteProfile(name) {
  const profiles = listProfiles().filter(p => p.name !== name);
  try { localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles)); } catch {}
}

export function exportStateJSON(state) {
  return JSON.stringify(state, null, 2);
}

export function importStateJSON(jsonString) {
  const parsed = JSON.parse(jsonString);
  const defaults = initialState();
  return { ...defaults, ...parsed, forutsetninger: { ...defaults.forutsetninger, ...(parsed.forutsetninger || {}) } };
}

export { tomPosisjon, tomGjeld, tomHendelse };
