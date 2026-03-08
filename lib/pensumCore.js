export const PENSUM_COLORS = {
  navy: '#0D2240', darkBlue: '#1B3A5F', lightBlue: '#5B9BD5', salmon: '#D4886B',
  gray: '#A6A6A6', darkGray: '#6B7280', lightGray: '#F5F7FA', white: '#FFFFFF',
  green: '#2E7D32', red: '#C62828', gold: '#B8860B', teal: '#0D9488', purple: '#7C3AED'
};

export const CATEGORY_COLORS = { aksjer: '#0D2240', renter: '#D4886B', privateMarkets: '#0D9488', eiendom: '#B8860B' };
export const ASSET_COLORS = { 'Globale Aksjer': '#5B9BD5', 'Norske Aksjer': '#0D2240', 'Høyrente': '#D4886B', 'Investment Grade': '#E8A690', 'Private Equity': '#0D9488', 'Eiendom': '#B8860B' };
export const ASSET_COLORS_LIGHT = { 'Globale Aksjer': '#93C5FD', 'Norske Aksjer': '#60A5FA', 'Høyrente': '#FDBA74', 'Investment Grade': '#FED7AA', 'Private Equity': '#5EEAD4', 'Eiendom': '#FDE047' };

export const erGyldigTall = (v) => typeof v === 'number' && Number.isFinite(v);
export const formatCurrency = (v) => new Intl.NumberFormat('nb-NO', { style: 'currency', currency: 'NOK', maximumFractionDigits: 0 }).format(erGyldigTall(v) ? v : 0);
export const formatNumber = (v) => new Intl.NumberFormat('nb-NO', { maximumFractionDigits: 0 }).format(erGyldigTall(v) ? v : 0);
export const formatPercent = (v) => erGyldigTall(v) ? v.toFixed(1) + '%' : '—';
export const formatDateEuro = (d) => { const dt = new Date(d); return dt.getDate().toString().padStart(2,'0') + '.' + (dt.getMonth()+1).toString().padStart(2,'0') + '.' + dt.getFullYear(); };


export const DEFAULT_LIKVID = 8000000;
export const DEFAULT_PE = 1000000;
export const DEFAULT_EIENDOM = 1000000;

export const RISK_PROFILES = {
  'Defensiv': { aksjer: 30, renter: 70, hoyrenteAndel: 75 },
  'Moderat': { aksjer: 50, renter: 50, hoyrenteAndel: 75 },
  'Dynamisk': { aksjer: 70, renter: 30, hoyrenteAndel: 100 },
  'Offensiv': { aksjer: 100, renter: 0, hoyrenteAndel: 100 }
};

export function beregnAllokering(likvid, pe, eiendom, profilNavn) {
  const total = likvid + pe + eiendom;
  if (total === 0) {
    // Returner standard allokering med 0 vekt, men med alle aktivaklasser
    return [
      { navn: 'Globale Aksjer', vekt: 0, avkastning: 9, kategori: 'aksjer' },
      { navn: 'Norske Aksjer', vekt: 0, avkastning: 10, kategori: 'aksjer' },
      { navn: 'Høyrente', vekt: 0, avkastning: 8, kategori: 'renter' },
      { navn: 'Investment Grade', vekt: 0, avkastning: 5, kategori: 'renter' },
      { navn: 'Private Equity', vekt: 0, avkastning: 15, kategori: 'privateMarkets' },
      { navn: 'Eiendom', vekt: 0, avkastning: 8, kategori: 'eiendom' }
    ];
  }
  const profile = RISK_PROFILES[profilNavn];
  const aksjeAndel = (likvid * profile.aksjer / 100) / total * 100;
  const renteAndel = (likvid * profile.renter / 100) / total * 100;
  const peAndel = pe > 0 ? (pe / total) * 100 : 0;
  const eiendomAndel = eiendom > 0 ? (eiendom / total) * 100 : 0;
  
  // Alltid inkluder alle aktivaklasser, men med 0 vekt hvis ikke relevant
  return [
    { navn: 'Globale Aksjer', vekt: parseFloat((aksjeAndel * 0.75).toFixed(1)), avkastning: 9, kategori: 'aksjer' },
    { navn: 'Norske Aksjer', vekt: parseFloat((aksjeAndel * 0.25).toFixed(1)), avkastning: 10, kategori: 'aksjer' },
    { navn: 'Høyrente', vekt: parseFloat((renteAndel * profile.hoyrenteAndel / 100).toFixed(1)), avkastning: 8, kategori: 'renter' },
    { navn: 'Investment Grade', vekt: parseFloat((renteAndel * (100 - profile.hoyrenteAndel) / 100).toFixed(1)), avkastning: 5, kategori: 'renter' },
    { navn: 'Private Equity', vekt: parseFloat(peAndel.toFixed(1)), avkastning: 15, kategori: 'privateMarkets' },
    { navn: 'Eiendom', vekt: parseFloat(eiendomAndel.toFixed(1)), avkastning: 8, kategori: 'eiendom' }
  ];
}

export const RAPPORT_DATO = '28.02.2026';
export const HISTORIKK_ARFELT = ['aar2026', 'aar2025', 'aar2024', 'aar2023', 'aar2022'];

export function beregnProduktNokkeltall(produkt) {
  const gyldigeAvkastninger = HISTORIKK_ARFELT
    .map((felt) => produkt[felt])
    .filter((verdi) => typeof verdi === 'number' && Number.isFinite(verdi))
    .slice(0, 3);

  if (gyldigeAvkastninger.length < 3) {
    return {
      aarlig3ar: erGyldigTall(produkt.aarlig3ar) ? produkt.aarlig3ar : null,
      risiko3ar: erGyldigTall(produkt.risiko3ar) ? produkt.risiko3ar : null
    };
  }

  const vekstfaktor = gyldigeAvkastninger.reduce((acc, verdi) => acc * (1 + (verdi / 100)), 1);
  const annualisert = (Math.pow(vekstfaktor, 1 / gyldigeAvkastninger.length) - 1) * 100;
  const snitt = gyldigeAvkastninger.reduce((sum, verdi) => sum + verdi, 0) / gyldigeAvkastninger.length;
  const varians = gyldigeAvkastninger.reduce((sum, verdi) => sum + Math.pow(verdi - snitt, 2), 0) / gyldigeAvkastninger.length;

  return {
    aarlig3ar: parseFloat(annualisert.toFixed(1)),
    risiko3ar: parseFloat(Math.sqrt(varians).toFixed(1))
  };
}

export function validerSiderFormat(tekst) {
  if (!tekst || !tekst.trim()) return false;
  const biter = tekst.split(',').map((b) => b.trim()).filter(Boolean);
  if (biter.length === 0) return false;
  return biter.every((bit) => /^(\d+|\d+-\d+|\d+\+)$/.test(bit));
}

export function skalerVekterTilHundreListe(items = []) {
  const liste = Array.isArray(items) ? items.map((i) => ({ ...i })) : [];
  if (liste.length === 0) return liste;
  const total = liste.reduce((s, i) => s + (Number(i.vekt) || 0), 0);
  if (total <= 0) {
    const lik = Number((100 / liste.length).toFixed(1));
    const fordelt = liste.map((i) => ({ ...i, vekt: lik }));
    const sum = fordelt.reduce((s, i) => s + i.vekt, 0);
    fordelt[0].vekt = Number((fordelt[0].vekt + (100 - sum)).toFixed(1));
    return fordelt;
  }
  const skalert = liste.map((i) => ({ ...i, vekt: Number((((Number(i.vekt) || 0) / total) * 100).toFixed(1)) }));
  const sum = skalert.reduce((s, i) => s + i.vekt, 0);
  const diff = Number((100 - sum).toFixed(1));
  if (Math.abs(diff) > 0) skalert[0].vekt = Number((skalert[0].vekt + diff).toFixed(1));
  return skalert;
}

export function fordelRestVektListe(items = [], index, newVekt) {
  const liste = Array.isArray(items) ? items.map((i) => ({ ...i })) : [];
  if (liste.length === 0 || index < 0 || index >= liste.length) return liste;
  const clamped = Math.max(0, Math.min(100, Number(newVekt) || 0));
  liste[index].vekt = Number(clamped.toFixed(1));
  const andreIdx = liste.map((_, i) => i).filter((i) => i !== index);
  if (andreIdx.length === 0) {
    liste[index].vekt = 100;
    return liste;
  }
  const rest = 100 - liste[index].vekt;
  const sumAndre = andreIdx.reduce((s, i) => s + (Number(liste[i].vekt) || 0), 0);
  if (sumAndre <= 0) {
    const lik = Number((rest / andreIdx.length).toFixed(1));
    andreIdx.forEach((i) => { liste[i].vekt = lik; });
  } else {
    andreIdx.forEach((i) => {
      const andel = (Number(liste[i].vekt) || 0) / sumAndre;
      liste[i].vekt = Number((andel * rest).toFixed(1));
    });
  }
  const sum = liste.reduce((s, i) => s + i.vekt, 0);
  const diff = Number((100 - sum).toFixed(1));
  if (Math.abs(diff) > 0) {
    const justerIdx = andreIdx[0] ?? index;
    liste[justerIdx].vekt = Number((liste[justerIdx].vekt + diff).toFixed(1));
  }
  return liste;
}


export const RAPPORT_MAANED = '2026-02';
export const RAPPORT_DATO_ISO = '2026-02-28';
export const DEFAULT_TEMPLATE_FILENAME = 'Mal - Forslag til investeringsportefølje 2026.pptx';
export const erPptTemplateFilnavn = (filnavn = '') => /\.(ppt|pptx)$/i.test(String(filnavn || '').trim());
export const RAPPORT_DATO_OBJEKT = (() => {
  const [d, m, y] = RAPPORT_DATO.split('.').map(Number);
  return new Date(y, m - 1, d);
})();

export const parseHistorikkDato = (datoStr) => {
  if (!datoStr || typeof datoStr !== 'string') return null;
  const trimmed = datoStr.trim();
  const daily = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (daily) {
    const [, y, m, d] = daily;
    return new Date(Number(y), Number(m) - 1, Number(d));
  }
  const monthly = trimmed.match(/^(\d{4})-(\d{2})$/);
  if (monthly) {
    const [, y, m] = monthly;
    return new Date(Number(y), Number(m) - 1, 1);
  }
  const parsed = new Date(trimmed);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export const byggMaanedssluttSerie = (historikkData = []) => {
  if (!Array.isArray(historikkData)) return [];
  const sortert = [...historikkData]
    .filter((punkt) => parseHistorikkDato(punkt?.dato) && erGyldigTall(punkt?.verdi))
    .sort((a, b) => parseHistorikkDato(a.dato) - parseHistorikkDato(b.dato));

  const maanedsMap = new Map();
  sortert.forEach((punkt) => {
    const dato = parseHistorikkDato(punkt.dato);
    const maanedKey = `${dato.getFullYear()}-${String(dato.getMonth() + 1).padStart(2, '0')}`;
    const eksisterende = maanedsMap.get(maanedKey);
    if (!eksisterende || dato >= parseHistorikkDato(eksisterende.dato)) {
      maanedsMap.set(maanedKey, { dato: maanedKey, verdi: punkt.verdi });
    }
  });

  return Array.from(maanedsMap.values()).sort((a, b) => parseHistorikkDato(a.dato) - parseHistorikkDato(b.dato));
};

export const formatHistorikkEtikett = (datoStr) => {
  const dato = parseHistorikkDato(datoStr);
  if (!dato) return datoStr;
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Des'];
  const month = monthNames[dato.getMonth()];
  if (/^\d{4}-\d{2}-\d{2}$/.test(String(datoStr).trim())) {
    return `${String(dato.getDate()).padStart(2, '0')}. ${month} ${dato.getFullYear()}`;
  }
  return `${month} ${dato.getFullYear()}`;
};

export const inferPerioderPerAarFraHistorikk = (sortertData = []) => {
  if (!Array.isArray(sortertData) || sortertData.length < 3) return 12;
  const datoer = sortertData
    .map((punkt) => parseHistorikkDato(punkt?.dato))
    .filter(Boolean)
    .sort((a, b) => a - b);
  if (datoer.length < 3) return 12;

  const diffs = [];
  for (let i = 1; i < datoer.length; i += 1) {
    const diffDager = (datoer[i] - datoer[i - 1]) / (1000 * 60 * 60 * 24);
    if (diffDager > 0) diffs.push(diffDager);
  }
  if (diffs.length === 0) return 12;
  const gjennomsnittDiff = diffs.reduce((sum, d) => sum + d, 0) / diffs.length;
  if (gjennomsnittDiff <= 2.5) return 252; // daglige datapunkt
  if (gjennomsnittDiff <= 10) return 52; // ukentlige datapunkt
  return 12; // månedlige datapunkt
};

export const finnStartVerdiVedPeriode = (data = [], startDato) => {
  if (!Array.isArray(data) || data.length === 0) return 100;
  const sortert = [...data]
    .filter((punkt) => parseHistorikkDato(punkt?.dato) && erGyldigTall(punkt?.verdi))
    .sort((a, b) => parseHistorikkDato(a.dato) - parseHistorikkDato(b.dato));
  if (sortert.length === 0) return 100;

  let sisteFoerEllerLik = null;
  let forsteEtter = null;
  sortert.forEach((punkt) => {
    const dato = parseHistorikkDato(punkt.dato);
    if (!dato) return;
    if (dato <= startDato) sisteFoerEllerLik = punkt;
    if (!forsteEtter && dato >= startDato) forsteEtter = punkt;
  });
  return (sisteFoerEllerLik || forsteEtter || sortert[0]).verdi || 100;
};
export const HISTORIKK_2026_YTD = {
  'global-core-active': -2.0,
  'global-edge': 0.6,
  'basis': -0.1,
  'global-hoyrente': 0.7,
  'nordisk-hoyrente': 0.6,
  'norge-a': 2.2,
  'energy-a': 7.8,
  'banking-d': -1.1,
  'financial-d': 0.9
};

export const oppdaterHistorikkTilRapportDato = (historikkMap = {}) => {
  const oppdatert = {};
  Object.entries(historikkMap || {}).forEach(([id, historikk]) => {
    const originalData = Array.isArray(historikk?.data) ? historikk.data : [];
    const harRapportMaaned = originalData.some((punkt) => String(punkt?.dato || '').startsWith(RAPPORT_MAANED));

    if (harRapportMaaned || originalData.length === 0) {
      oppdatert[id] = historikk;
      return;
    }

    const sortert = [...originalData]
      .filter((punkt) => parseHistorikkDato(punkt?.dato) && erGyldigTall(punkt?.verdi))
      .sort((a, b) => parseHistorikkDato(a.dato) - parseHistorikkDato(b.dato));
    const sistePunkt = sortert[sortert.length - 1];
    if (!sistePunkt) {
      oppdatert[id] = historikk;
      return;
    }
    const ytd = HISTORIKK_2026_YTD[id];
    const faktor = typeof ytd === 'number' ? (1 + (ytd / 100)) : 1;
    const nyVerdi = parseFloat((sistePunkt.verdi * faktor).toFixed(2));

    oppdatert[id] = {
      ...historikk,
      data: [...sortert, { dato: RAPPORT_DATO_ISO, verdi: nyVerdi }]
    };
  });

  return oppdatert;
};

const DEFAULT_LIKVID = 8000000;  // 3 mill aksjefond + 1 mill aksjer + 2 mill renter + 2 mill kontanter
const DEFAULT_PE = 1000000;
const DEFAULT_EIENDOM = 1000000;

