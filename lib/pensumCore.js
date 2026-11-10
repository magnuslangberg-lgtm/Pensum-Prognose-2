export const PENSUM_COLORS = {
  navy: '#0D2841', darkBlue: '#012441', lightBlue: '#6B9DB8', salmon: '#C4967E',
  gray: '#9EAAB4', darkGray: '#4A5568', lightGray: '#F5F5F5', white: '#FFFFFF',
  green: '#2D6A4F', red: '#B91C1C', gold: '#A67B3D', teal: '#2D6A6A', purple: '#5B4FA0',
  accent: '#6B9DB8', midBlue: '#123C6A', charcoal: '#262626', warmGray: '#8B8B8B'
};

// Farger per produkt i porteføljen (samme rekkefølge i alle faner). 14 tydelig ulike
// farger, slik at mange produkter ikke deler farge.
export const PORTEFOLJE_FARGER = ['#0D2841', '#6B9DB8', '#C4967E', '#2D6A6A', '#A67B3D', '#5B4FA0', '#2D6A4F', '#123C6A', '#D97706', '#9EAAB4', '#7AADAD', '#8B5E3C', '#BE6A8A', '#E0B84C'];

export const CATEGORY_COLORS = { aksjer: '#0D2841', renter: '#C4967E', privateMarkets: '#2D6A6A', eiendom: '#A67B3D', shipping: '#1E5F74' };
export const ASSET_COLORS = { 'Globale Aksjer': '#6B9DB8', 'Norske Aksjer': '#0D2841', 'Høyrente': '#C4967E', 'Investment Grade': '#D4B8A8', 'Private Equity': '#2D6A6A', 'Eiendom': '#A67B3D', 'Shipping': '#1E5F74' };
export const ASSET_COLORS_LIGHT = { 'Globale Aksjer': '#A8C8D8', 'Norske Aksjer': '#6B9DB8', 'Høyrente': '#DCCABE', 'Investment Grade': '#E8D8CE', 'Private Equity': '#7AADAD', 'Eiendom': '#D4B888', 'Shipping': '#5A8FA0' };

export const erGyldigTall = (v) => typeof v === 'number' && Number.isFinite(v);
export const formatCurrency = (v) => new Intl.NumberFormat('nb-NO', { style: 'currency', currency: 'NOK', maximumFractionDigits: 0 }).format(erGyldigTall(v) ? v : 0);
export const formatNumber = (v) => new Intl.NumberFormat('nb-NO', { maximumFractionDigits: 0 }).format(erGyldigTall(v) ? v : 0);
// Norsk prosentformat: komma som desimaltegn og mellomrom før prosenttegnet (8,7 %).
export const formatPercent = (v) => erGyldigTall(v) ? v.toFixed(1).replace('.', ',') + ' %' : '—';
export const formatDateEuro = (d) => { const dt = new Date(d); return dt.getDate().toString().padStart(2,'0') + '.' + (dt.getMonth()+1).toString().padStart(2,'0') + '.' + dt.getFullYear(); };

export const RISK_PROFILES = {
  'Defensiv': { aksjer: 30, renter: 70, hoyrenteAndel: 75 },
  'Moderat': { aksjer: 50, renter: 50, hoyrenteAndel: 75 },
  'Dynamisk': { aksjer: 70, renter: 30, hoyrenteAndel: 100 },
  'Offensiv': { aksjer: 100, renter: 0, hoyrenteAndel: 100 }
};

// Fallback-avkastningsrater dersom rater ikke leveres (legacy/standalone bruk).
const DEFAULT_AVKASTNINGSRATER = {
  globaleAksjer: 10, norskeAksjer: 11, hoyrente: 7.5,
  investmentGrade: 5, privateEquity: 15, eiendom: 8
};

export function beregnAllokering(likvid, pe, eiendom, profilNavn, rater) {
  const r = { ...DEFAULT_AVKASTNINGSRATER, ...(rater || {}) };
  const profile = RISK_PROFILES[profilNavn] || RISK_PROFILES['Moderat'];
  const total = likvid + pe + eiendom;
  // Uten registrert kapital finnes det ingen faktisk fordeling å regne på. Da lar
  // vi risikoprofilen alene bestemme vektene, slik at profilknappene fortsatt gir
  // en prosentfordeling å jobbe videre fra.
  const harKapital = total > 0;
  const aksjeAndel = harKapital ? (likvid * profile.aksjer / 100) / total * 100 : profile.aksjer;
  const renteAndel = harKapital ? (likvid * profile.renter / 100) / total * 100 : profile.renter;
  const peAndel = harKapital && pe > 0 ? (pe / total) * 100 : 0;
  const eiendomAndel = harKapital && eiendom > 0 ? (eiendom / total) * 100 : 0;

  return [
    { navn: 'Globale Aksjer', vekt: parseFloat((aksjeAndel * 0.75).toFixed(1)), avkastning: r.globaleAksjer, kategori: 'aksjer' },
    { navn: 'Norske Aksjer', vekt: parseFloat((aksjeAndel * 0.25).toFixed(1)), avkastning: r.norskeAksjer, kategori: 'aksjer' },
    { navn: 'Høyrente', vekt: parseFloat((renteAndel * profile.hoyrenteAndel / 100).toFixed(1)), avkastning: r.hoyrente, kategori: 'renter' },
    { navn: 'Investment Grade', vekt: parseFloat((renteAndel * (100 - profile.hoyrenteAndel) / 100).toFixed(1)), avkastning: r.investmentGrade, kategori: 'renter' },
    { navn: 'Private Equity', vekt: parseFloat(peAndel.toFixed(1)), avkastning: r.privateEquity, kategori: 'privateMarkets' },
    { navn: 'Eiendom', vekt: parseFloat(eiendomAndel.toFixed(1)), avkastning: r.eiendom, kategori: 'eiendom' }
  ];
}

export const RAPPORT_DATO = '31.10.2026';
// Risikofri rente brukt i Sharpe-ratio. Samme nivå som i CMA-metodikken (14.10.2026).
export const RISIKOFRI_RENTE = 4.5;
export const HISTORIKK_ARFELT = ['aar2026', 'aar2025', 'aar2024', 'aar2023', 'aar2022'];

export function beregnProduktNokkeltall(produkt, historikkData = null) {
  // Med historikk: annualisert avkastning og volatilitet siste 3 år fra datafeeden.
  const fraHistorikk = historikkData ? beregnSisteAarNokkeltall(historikkData, 3) : null;
  if (fraHistorikk) {
    return { aarlig3ar: parseFloat(fraHistorikk.aarlig.toFixed(1)), risiko3ar: parseFloat(fraHistorikk.risiko.toFixed(1)) };
  }
  return beregnProduktNokkeltallFraAarsfelt(produkt);
}

// Uten historikk: snitt av siste tre hele kalenderår. Spredningen mellom tre årstall
// er ikke volatilitet, så risiko hentes bare fra et eksplisitt risiko3ar-felt.
function beregnProduktNokkeltallFraAarsfelt(produkt) {
  // Ekskluder inneværende år (2026 YTD) — kun hele kalenderår i 3-års beregning
  const heleAarFelt = HISTORIKK_ARFELT.filter((felt) => felt !== 'aar2026');
  const gyldigeAvkastninger = heleAarFelt
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

  return {
    aarlig3ar: parseFloat(annualisert.toFixed(1)),
    risiko3ar: erGyldigTall(produkt.risiko3ar) ? produkt.risiko3ar : null
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


const [RAPPORT_DAG, RAPPORT_MAANED_NUMMER, RAPPORT_AAR] = RAPPORT_DATO.split('.');
export const RAPPORT_MAANED = `${RAPPORT_AAR}-${RAPPORT_MAANED_NUMMER}`;
export const RAPPORT_AAR_TALL = Number(RAPPORT_AAR);
export const RAPPORT_DATO_ISO = `${RAPPORT_AAR}-${RAPPORT_MAANED_NUMMER}-${RAPPORT_DAG}`;
export const DEFAULT_TEMPLATE_FILENAME = 'Mal - Forslag til investeringsportefølje 2026.pptx';
export const erPptTemplateFilnavn = (filnavn = '') => /\.(ppt|pptx)$/i.test(String(filnavn || '').trim());
export const RAPPORT_DATO_OBJEKT = (() => {
  const [d, m, y] = RAPPORT_DATO.split('.').map(Number);
  return new Date(y, m - 1, d);
})();

// Historikken har tusenvis av daglige datoer som parses på nytt ved hver render.
// Cacher tidspunktet per datostreng; returnerer alltid et nytt Date-objekt.
const parsetDatoCache = new Map();
const parseHistorikkDatoUncached = (trimmed) => {
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

export const parseHistorikkDato = (datoStr) => {
  if (!datoStr || typeof datoStr !== 'string') return null;
  let tid = parsetDatoCache.get(datoStr);
  if (tid === undefined) {
    const dato = parseHistorikkDatoUncached(datoStr.trim());
    tid = dato ? dato.getTime() : null;
    if (parsetDatoCache.size > 50000) parsetDatoCache.clear();
    parsetDatoCache.set(datoStr, tid);
  }
  return tid === null ? null : new Date(tid);
};

// Resultater som avhenger kun av en (uendret) historikk-array caches per array-referanse,
// slik at tunge beregninger ikke kjøres på nytt for hvert tastetrykk i skjemaene.
const maanedsserieCache = new WeakMap();

export const byggMaanedssluttSerie = (historikkData = []) => {
  if (!Array.isArray(historikkData)) return [];
  const cached = maanedsserieCache.get(historikkData);
  if (cached) return cached.map((punkt) => ({ ...punkt }));
  const serie = byggMaanedssluttSerieUncached(historikkData);
  maanedsserieCache.set(historikkData, serie);
  return serie.map((punkt) => ({ ...punkt }));
};

const byggMaanedssluttSerieUncached = (historikkData) => {
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

  // Beregn faktiske perioder per år fra dataspenn
  const totalDager = (datoer[datoer.length - 1] - datoer[0]) / (1000 * 60 * 60 * 24);
  if (totalDager <= 0) return 12;
  const totalAar = totalDager / 365.25;
  if (totalAar > 0) return Math.round((datoer.length - 1) / totalAar);
  return 12;
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
  'global-core-active': -0.5,
  'global-edge': -3.0,
  'basis': 1.3,
  'global-hoyrente': 1.8,
  'nordisk-hoyrente': 3.7,
  'norge-a': 19.3,
  'energy-a': 45.2,
  'banking-d': 8.9,
  'financial-d': 2.7,
  // Pensum Kairos har ikke publisert YTD-tall i månedsrapporten per 31.10.2026.
  'kairos-a': null,
  'acadian-global-equity': 26.4,
  'capital-group-new-pers': 3.3,
  'dnb-global-enhanced': 1.3,
  'guinness-global-equity-income': 18.9,
  'janus-henderson-glb-sc': 8.3
};

// Norske visningsnavn for Morningstar-kategorier. Dataene beholder de engelske navnene
// (slik de kommer fra Morningstar), og oversettes bare når de vises.
const EKSPONERING_NORSK = {
  // Regioner og land
  'United States': 'USA', 'United Kingdom': 'Storbritannia', 'Norway': 'Norge', 'Sweden': 'Sverige',
  'Denmark': 'Danmark', 'Finland': 'Finland', 'Japan': 'Japan', 'China': 'Kina', 'Taiwan': 'Taiwan',
  'South Korea': 'Sør-Korea', 'India': 'India', 'Canada': 'Canada', 'Germany': 'Tyskland', 'France': 'Frankrike',
  'Switzerland': 'Sveits', 'Netherlands': 'Nederland', 'Italy': 'Italia', 'Spain': 'Spania', 'Belgium': 'Belgia',
  'Greece': 'Hellas', 'Singapore': 'Singapore', 'Mexico': 'Mexico', 'Brazil': 'Brasil', 'Australia': 'Australia',
  'Hong Kong': 'Hongkong', 'Ireland': 'Irland', 'Israel': 'Israel', 'Poland': 'Polen', 'Argentina': 'Argentina',
  'New Zealand': 'New Zealand', 'Pakistan': 'Pakistan', 'Peru': 'Peru', 'Philippines': 'Filippinene',
  'North America': 'Nord-Amerika', 'Latin America': 'Latin-Amerika', 'Europe dev': 'Europa (utviklet)',
  'Europe emrg': 'Europa (fremvoksende)', 'Africa/Middle East': 'Afrika/Midtøsten', 'Australasia': 'Australasia',
  'Asia dev': 'Asia (utviklet)', 'Asia emrg': 'Asia (fremvoksende)',
  // Sektorer
  'Technology': 'Teknologi', 'Financial Services': 'Finans', 'Industrials': 'Industri', 'Healthcare': 'Helse',
  'Communication Services': 'Kommunikasjon', 'Consumer Cyclical': 'Syklisk konsum', 'Consumer Defensive': 'Defensivt konsum',
  'Energy': 'Energi', 'Basic Materials': 'Råvarer', 'Utilities': 'Forsyning', 'Real Estate': 'Eiendom',
  // Stil
  'Large Value': 'Store selskaper – verdi', 'Large Core': 'Store selskaper – blanding', 'Large Growth': 'Store selskaper – vekst',
  'Mid Value': 'Mellomstore – verdi', 'Mid Core': 'Mellomstore – blanding', 'Mid Growth': 'Mellomstore – vekst',
  'Small Value': 'Små selskaper – verdi', 'Small Core': 'Små selskaper – blanding', 'Small Growth': 'Små selskaper – vekst',
  // Rest
  'Other': 'Øvrige', 'Other Countries': 'Øvrige land'
};
export const oversettEksponering = (navn) => EKSPONERING_NORSK[String(navn ?? '').trim()] ?? navn;

// Verdensdeler for geografisk oversikt. Morningstar oppgir både land og regioner
// (Kairos rapporterer f.eks. "North America" og "Europe dev"); alt mappes hit.
// "Other" er land Morningstar ikke spesifiserer, og vises som "Ikke fordelt".
export const VERDENSDELER = ['Nord-Amerika', 'Europa', 'Asia', 'Resten av verden', 'Ikke fordelt'];
const VERDENSDEL_FOR = {
  'United States': 'Nord-Amerika', 'Canada': 'Nord-Amerika', 'North America': 'Nord-Amerika',
  'Norway': 'Europa', 'Sweden': 'Europa', 'Denmark': 'Europa', 'Finland': 'Europa', 'Iceland': 'Europa',
  'United Kingdom': 'Europa', 'Ireland': 'Europa', 'Germany': 'Europa', 'France': 'Europa', 'Switzerland': 'Europa',
  'Netherlands': 'Europa', 'Belgium': 'Europa', 'Luxembourg': 'Europa', 'Austria': 'Europa', 'Italy': 'Europa',
  'Spain': 'Europa', 'Portugal': 'Europa', 'Greece': 'Europa', 'Poland': 'Europa', 'Czech Republic': 'Europa',
  'Hungary': 'Europa', 'Europe dev': 'Europa', 'Europe emrg': 'Europa', 'Eurozone': 'Europa',
  'Japan': 'Asia', 'China': 'Asia', 'Taiwan': 'Asia', 'South Korea': 'Asia', 'India': 'Asia', 'Singapore': 'Asia',
  'Hong Kong': 'Asia', 'Indonesia': 'Asia', 'Malaysia': 'Asia', 'Thailand': 'Asia', 'Philippines': 'Asia',
  'Pakistan': 'Asia', 'Vietnam': 'Asia', 'Asia dev': 'Asia', 'Asia emrg': 'Asia',
  'Mexico': 'Resten av verden', 'Brazil': 'Resten av verden', 'Argentina': 'Resten av verden', 'Peru': 'Resten av verden',
  'Chile': 'Resten av verden', 'Colombia': 'Resten av verden', 'Latin America': 'Resten av verden',
  'Australia': 'Resten av verden', 'New Zealand': 'Resten av verden', 'Australasia': 'Resten av verden',
  'Israel': 'Resten av verden', 'South Africa': 'Resten av verden', 'Saudi Arabia': 'Resten av verden',
  'United Arab Emirates': 'Resten av verden', 'Africa/Middle East': 'Resten av verden', 'Turkey': 'Resten av verden',
  'Other': 'Ikke fordelt', 'Other Countries': 'Ikke fordelt'
};
export const verdensdelFor = (navn) => VERDENSDEL_FOR[String(navn ?? '').trim()] ?? 'Ikke fordelt';

// Summerer en regionliste (land/regioner med vekt) til verdensdeler, skalert til 100 %.
export const tilVerdensdeler = (regioner = []) => {
  const sum = new Map();
  regioner.forEach((r) => {
    const v = Number(r?.vekt) || 0;
    if (v > 0) sum.set(verdensdelFor(r.navn), (sum.get(verdensdelFor(r.navn)) || 0) + v);
  });
  const total = [...sum.values()].reduce((a, b) => a + b, 0);
  if (total <= 0) return [];
  const rader = VERDENSDELER.filter((d) => sum.has(d)).map((navn) => ({ navn, vekt: Number(((sum.get(navn) / total) * 100).toFixed(1)) }));
  const rest = Number((100 - rader.reduce((a, r) => a + r.vekt, 0)).toFixed(1));
  if (rader.length && rest !== 0) {
    const storst = rader.reduce((m, r) => (r.vekt > m.vekt ? r : m), rader[0]);
    storst.vekt = Number((storst.vekt + rest).toFixed(1));
  }
  return rader;
};

// Vektet fordeling på verdensdeler for porteføljen (aksjedelen, samme vekting som regionene).
export const aggregerVerdensdeler = (allokering = [], produktEksponering = {}) =>
  tilVerdensdeler(aggregerEksponering(allokering, produktEksponering, 'regioner', 10000));

// ---- Fond fra Morningstar-universet (public/data/eksterne-fond.json) ----
export const MORNINGSTAR_DATO = 'mars 2026';
// CMA-forutsetninger per aktivaklasse (CMA-metodikk 14.10.2026, risikofri rente 4,5 %).
export const CMA_KLASSER = {
  kontanter: { navn: 'Kontanter / pengemarked', avk: 4.5, risiko: 1 },
  stat: { navn: 'Statsobligasjoner', avk: 5.3, risiko: 6 },
  ig: { navn: 'Investment grade kreditt', avk: 6.3, risiko: 7 },
  hy: { navn: 'High yield global', avk: 7.7, risiko: 10 },
  globaleAksjer: { navn: 'Globale aksjer', avk: 8.5, risiko: 16 },
  nordiskeAksjer: { navn: 'Nordiske aksjer', avk: 9.0, risiko: 17 },
  emAksjer: { navn: 'EM aksjer', avk: 9.4, risiko: 19 },
  norskeAksjer: { navn: 'Norske aksjer', avk: 10.0, risiko: 19 },
  eiendom: { navn: 'Eiendom', avk: 7.7, risiko: 11 },
  infrastruktur: { navn: 'Infrastruktur', avk: 8.2, risiko: 10 }
};

// Velger CMA-klasse for et Morningstar-fond ut fra kategori og landfordeling.
export const cmaKlasseForMorningstarFond = (f = {}) => {
  const kat = String(f.cat || '');
  if (/Fixed Income|Credit/i.test(kat)) return /Emerging/i.test(kat) ? 'hy' : 'ig';
  if (/Real Estate/i.test(kat)) return 'eiendom';
  if (/Infrastructure/i.test(kat)) return 'infrastruktur';
  if ((Number(f.cNO) || 0) >= 50) return 'norskeAksjer';
  if ((Number(f.cNO) || 0) + (Number(f.cSE) || 0) + (Number(f.cDK) || 0) >= 50) return 'nordiskeAksjer';
  if (/Emerging|Asia|China|India|Latin America|Africa/i.test(kat)) return 'emAksjer';
  return 'globaleAksjer';
};

const MS_LAND = { cUS: 'United States', cUK: 'United Kingdom', cJP: 'Japan', cDE: 'Germany', cFR: 'France', cNO: 'Norway', cSE: 'Sweden', cDK: 'Denmark', cCN: 'China' };
const MS_SEKTOR = { sTech: 'Technology', sFin: 'Financial Services', sHlt: 'Healthcare', sInd: 'Industrials', sCyc: 'Consumer Cyclical', sDef: 'Consumer Defensive', sEng: 'Energy', sComm: 'Communication Services', sMat: 'Basic Materials', sRE: 'Real Estate', sUtil: 'Utilities' };
const MS_VALUTA = { 'Norwegian Krone': 'NOK', 'Swedish Krona': 'SEK', 'Danish Krone': 'DKK', 'Euro': 'EUR', 'US Dollar': 'USD', 'Pound Sterling': 'GBP', 'Swiss Franc': 'CHF', 'Yen': 'JPY' };

// Lister med Morningstar-felt; det Morningstar ikke spesifiserer legges i "Other".
const msListe = (f, felt) => {
  const rader = Object.entries(felt)
    .filter(([k]) => erGyldigTall(f[k]) && f[k] > 0)
    .map(([k, navn]) => ({ navn, vekt: Number(f[k].toFixed(1)) }))
    .sort((a, b) => b.vekt - a.vekt);
  if (!rader.length) return null;
  const rest = Number((100 - rader.reduce((s, r) => s + r.vekt, 0)).toFixed(1));
  return rest > 0.05 ? [...rader, { navn: 'Other', vekt: rest }] : rader;
};

// Lager et produkt (samme form som produktene i pensumDefaults) og eksponering fra et
// Morningstar-fond. Forventet avkastning/risiko er CMA-anslag for fondets aktivaklasse.
export const lagProduktFraMorningstar = (f = {}) => {
  const klasse = cmaKlasseForMorningstarFond(f);
  const cma = CMA_KLASSER[klasse];
  const tall = (v) => (erGyldigTall(v) ? Number(v.toFixed(1)) : null);
  const produkt = {
    id: `ms-${f.isin}`,
    navn: f.n,
    isin: f.isin,
    kilde: 'morningstar',
    morningstarKategori: f.cat || null,
    cmaKlasse: cma.navn,
    valuta: MS_VALUTA[f.cur] || f.cur || null,
    aktivatype: ['ig', 'hy', 'stat'].includes(klasse) ? 'rente' : 'aksje',
    likviditet: 'likvid',
    rolle: 'spisset',
    // YTD i Morningstar-filen er fra da filen ble lastet ned, ikke rapportdato – vises ikke.
    aar2026: null, aar2025: tall(f.a25), aar2024: tall(f.a24), aar2023: tall(f.a23), aar2022: tall(f.a22),
    forventetAvkastning: cma.avk,
    forventetRisiko: cma.risiko,
    forventetYield: null,
    aarlig3ar: tall(f.r3y),
    risiko3ar: tall(f.sd3y)
  };
  const eksponering = {};
  const regioner = msListe(f, MS_LAND);
  const sektorer = msListe(f, MS_SEKTOR);
  if (regioner) eksponering.regioner = regioner;
  if (sektorer) eksponering.sektorer = sektorer;
  eksponering.disclaimer = `Data fra Morningstar per ${MORNINGSTAR_DATO} (${f.cat || 'ukjent kategori'}). Forventet avkastning og risiko er CMA-anslag for ${cma.navn.toLowerCase()}.`;
  return { produkt, eksponering };
};

// Vektet eksponering (regioner/sektorer/stil) på tvers av produkter. Vektene skaleres mot
// produktene som faktisk har data for feltet, slik at fordelingen summerer til 100 %.
// Viser de største radene og samler resten i "Other", i stedet for å kutte halen.
export const aggregerEksponering = (allokering = [], produktEksponering = {}, felt, maksRader = 10) => {
  const medData = allokering.filter((a) => (a?.vekt || 0) > 0 && Array.isArray(produktEksponering?.[a.id]?.[felt]));
  const dekketVekt = medData.reduce((s, a) => s + a.vekt, 0);
  if (dekketVekt <= 0) return [];
  const sumMap = new Map();
  medData.forEach((a) => {
    const faktor = a.vekt / dekketVekt;
    produktEksponering[a.id][felt].forEach((rad) => {
      const navn = /^other( countries)?$/i.test(String(rad?.navn || '').trim()) ? 'Other' : rad.navn;
      sumMap.set(navn, (sumMap.get(navn) || 0) + (Number(rad?.vekt) || 0) * faktor);
    });
  });
  const total = Array.from(sumMap.values()).reduce((s, v) => s + v, 0) || 1;
  const rader = Array.from(sumMap.entries())
    .filter(([navn]) => navn !== 'Other')
    .map(([navn, vekt]) => ({ navn, vekt: (vekt / total) * 100 }))
    .filter((r) => Number(r.vekt.toFixed(1)) > 0)
    .sort((a, b) => b.vekt - a.vekt);
  const harRest = rader.length > maksRader || sumMap.has('Other');
  const topp = (harRest ? rader.slice(0, maksRader - 1) : rader).map((r) => ({ navn: r.navn, vekt: Number(r.vekt.toFixed(1)) }));
  const rest = Number((100 - topp.reduce((s, r) => s + r.vekt, 0)).toFixed(1));
  if (harRest && rest > 0) topp.push({ navn: 'Other', vekt: rest });
  else if (!harRest && topp.length && rest !== 0) topp[0].vekt = Number((topp[0].vekt + rest).toFixed(1)); // avrunding
  return topp;
};

// CMA-metodikk dokumentasjon — referert i UI for forventet avkastning
export const CMA_METODIKK = {
  beskrivelse: 'Forventet avkastning er basert på CMA-metodikk (Capital Market Assumptions) — institusjonell konsensus fra BlackRock, Vanguard og J.P. Morgan Asset Management, med en eksplisitt nordisk/norsk overlay.',
  kortTekst: 'CMA-metodikk: BlackRock + Vanguard + J.P. Morgan Asset Management',
  dokumentLenke: 'uploads/CMA_metodikk_oppdatert 14.10.2026.docx',
  kilder: [
    { navn: 'BlackRock CMA', url: 'https://www.blackrock.com/us/financial-professionals/insights/capital-market-assumptions' },
    { navn: 'Vanguard VCMM', url: 'https://corporate.vanguard.com/content/corporatesite/us/en/corp/vemo/vemo-return-forecasts.html' },
    { navn: 'J.P. Morgan 2026 LTCMA', url: 'https://am.jpmorgan.com/content/dam/jpm-am-aem/americas/us/en/institutional/insights/portfolio-insights/ltcma-full-report.pdf' }
  ]
};

// Dedupliser historikkdata — behold første forekomst per dato
const dedup = (sortert) => {
  const sett = new Set();
  return sortert.filter(p => { if (sett.has(p.dato)) return false; sett.add(p.dato); return true; });
};

export const oppdaterHistorikkTilRapportDato = (historikkMap = {}) => {
  const oppdatert = {};
  Object.entries(historikkMap || {}).forEach(([id, historikk]) => {
    const originalData = Array.isArray(historikk?.data) ? historikk.data : [];
    const sortert = [...originalData]
      .filter((punkt) => parseHistorikkDato(punkt?.dato) && erGyldigTall(punkt?.verdi))
      .sort((a, b) => parseHistorikkDato(a.dato) - parseHistorikkDato(b.dato));
    const dedupData = dedup(sortert);
    const harRapportMaaned = dedupData.some((punkt) => String(punkt?.dato || '').startsWith(RAPPORT_MAANED));

    if (harRapportMaaned || dedupData.length === 0) {
      oppdatert[id] = { ...historikk, data: dedupData };
      return;
    }
    const sistePunkt = dedupData[dedupData.length - 1];
    if (!sistePunkt) {
      oppdatert[id] = { ...historikk, data: dedupData };
      return;
    }
    const ytd = HISTORIKK_2026_YTD[id];
    const faktor = typeof ytd === 'number' ? (1 + (ytd / 100)) : 1;
    const nyVerdi = parseFloat((sistePunkt.verdi * faktor).toFixed(2));

    oppdatert[id] = {
      ...historikk,
      data: [...dedupData, { dato: RAPPORT_DATO_ISO, verdi: nyVerdi }]
    };
  });

  return oppdatert;
};

// ===== AVANSERTE RISIKOMETRIKKER =====

/**
 * Filtrer og sorter rå historikkdata (daglig eller månedlig).
 * Returnerer sortert array av { dato, verdi } for en gitt periode.
 */
const sortertHistorikkCache = new WeakMap();
const filtrerHistorikk = (data, startDato) => {
  if (!Array.isArray(data)) return [];
  let sortert = sortertHistorikkCache.get(data);
  if (!sortert) {
    sortert = data
      .map((d) => ({ d, t: parseHistorikkDato(d?.dato)?.getTime() }))
      .filter(({ d, t }) => t != null && erGyldigTall(d?.verdi))
      .sort((a, b) => a.t - b.t);
    sortertHistorikkCache.set(data, sortert);
  }
  const fra = startDato ? startDato.getTime() : null;
  return (fra == null ? sortert : sortert.filter(({ t }) => t >= fra)).map(({ d }) => d);
};

// Kalenderårsavkastning (%) fra en historikk-serie: fra siste kurs før/lik 1. januar
// (eller første kurs etter) til siste kurs i året (rapportdato for 2026).
const aarsavkastningCache = new WeakMap();
export const beregnAarsavkastningFraData = (data, aar) => {
  if (!Array.isArray(data)) return null;
  let perAar = aarsavkastningCache.get(data);
  if (!perAar) { perAar = new Map(); aarsavkastningCache.set(data, perAar); }
  if (perAar.has(aar)) return perAar.get(aar);
  const sortert = filtrerHistorikk(data, null);
  let resultat = null;
  if (sortert.length >= 2) {
    const startDato = new Date(aar, 0, 1);
    const aarsslutt = new Date(aar, 11, 31);
    const sluttDato = aarsslutt < RAPPORT_DATO_OBJEKT ? aarsslutt : RAPPORT_DATO_OBJEKT;
    const tid = (punkt) => parseHistorikkDato(punkt.dato);
    // Serier som starter etter første uke i året gir bare et delår – det skal
    // ikke vises som kalenderårsavkastning.
    const sisteGyldigeStart = new Date(aar, 0, 8);
    const startKandidat = sortert.filter((punkt) => tid(punkt) <= startDato).slice(-1)[0]
      || sortert.find((punkt) => tid(punkt) >= startDato);
    const sluttKandidat = sortert.filter((punkt) => {
      const dato = tid(punkt);
      return dato && dato >= startDato && dato <= sluttDato;
    }).slice(-1)[0];
    const delaar = !startKandidat || tid(startKandidat) > sisteGyldigeStart;
    if (!delaar && startDato <= RAPPORT_DATO_OBJEKT && sluttKandidat && startKandidat !== sluttKandidat && erGyldigTall(startKandidat.verdi) && startKandidat.verdi !== 0) {
      resultat = ((sluttKandidat.verdi / startKandidat.verdi) - 1) * 100;
    }
  }
  perAar.set(aar, resultat);
  return resultat;
};

// Startdato for en periode på N år bakover fra rapportdato (samme dag og måned).
export const periodeStartDato = (aar, ref = RAPPORT_DATO_OBJEKT) =>
  new Date(ref.getFullYear() - aar, ref.getMonth(), ref.getDate());

// Annualisert avkastning og volatilitet for siste N år. Returnerer null når serien
// ikke dekker hele perioden (f.eks. produkter med kortere historikk).
export const beregnSisteAarNokkeltall = (historikkData, aar = 3) => {
  const data = historikkData?.data;
  if (!Array.isArray(data) || data.length < 3) return null;
  const start = periodeStartDato(aar);
  const sortert = filtrerHistorikk(data, null);
  const forste = sortert[0] ? parseHistorikkDato(sortert[0].dato) : null;
  if (!forste || (forste - start) > 7 * 86400000) return null;
  const stat = beregnProduktStatistikk(historikkData, start);
  if (!stat) return null;
  return { aarlig: stat.aarligAvkastning, risiko: stat.standardavvik, maxDrawdown: stat.maxDrawdown, sharpe: stat.sharpe };
};

// Nøkkeltall for en vektet portefølje (daglig rebalansert) fra produktenes egne
// avkastningsserier. Tar hensyn til samvariasjon, i motsetning til et vektet snitt
// av enkeltproduktenes volatilitet. Vekter skaleres mot produktene som har historikk,
// og bare datoer der alle produktene har kurs brukes.
export const beregnPortefoljeStatistikk = (allokering = [], historikkMap = {}, startDato = periodeStartDato(3), riskFreeRate = RISIKOFRI_RENTE) => {
  const fra = startDato ? startDato.getTime() : null;
  const serier = allokering
    .filter((a) => (a?.vekt || 0) > 0 && Array.isArray(historikkMap?.[a.id]?.data))
    .map((a) => {
      const punkter = filtrerHistorikk(historikkMap[a.id].data, null);
      const avk = new Map();
      for (let i = 1; i < punkter.length; i++) {
        const t = parseHistorikkDato(punkter[i].dato).getTime();
        if (fra != null && t <= fra) continue;
        const forrige = punkter[i - 1].verdi;
        if (forrige > 0) avk.set(punkter[i].dato, punkter[i].verdi / forrige - 1);
      }
      return { id: a.id, vekt: a.vekt, avk, forste: punkter[0] ? parseHistorikkDato(punkter[0].dato) : null };
    })
    .filter((s) => s.avk.size > 0);
  if (!serier.length) return null;
  // Krev at alle produktene dekker hele perioden, ellers blir tallene ikke sammenlignbare.
  if (fra != null && serier.some((x) => !x.forste || x.forste.getTime() - fra > 7 * 86400000)) return null;
  const felles = [...serier[0].avk.keys()].filter((d) => serier.every((x) => x.avk.has(d))).sort();
  if (felles.length < 30) return null;
  const sumVekt = serier.reduce((sum, x) => sum + x.vekt, 0);
  const port = felles.map((d) => serier.reduce((sum, x) => sum + (x.vekt / sumVekt) * x.avk.get(d), 0));
  const snitt = port.reduce((sum, v) => sum + v, 0) / port.length;
  const varians = port.reduce((sum, v) => sum + (v - snitt) ** 2, 0) / port.length;
  const aarSpenn = ((parseHistorikkDato(felles[felles.length - 1]) - (fra ?? parseHistorikkDato(felles[0]).getTime())) / 86400000) / 365.25;
  const perioderPerAar = aarSpenn > 0 ? port.length / aarSpenn : 12;
  let indeks = 1; let topp = 1; let maxDD = 0;
  port.forEach((r) => { indeks *= (1 + r); if (indeks > topp) topp = indeks; maxDD = Math.min(maxDD, indeks / topp - 1); });
  const aarlig = aarSpenn > 0 ? (Math.pow(indeks, 1 / aarSpenn) - 1) * 100 : null;
  const risiko = Math.sqrt(varians) * Math.sqrt(perioderPerAar) * 100;
  return {
    aarlig,
    risiko,
    maxDrawdown: maxDD * 100,
    sharpe: risiko > 0 && aarlig != null ? (aarlig - riskFreeRate) / risiko : null,
    dekketVekt: sumVekt,
    produkter: serier.map((x) => x.id)
  };
};

// Risikobaserte scenarioer for årlig snittavkastning over en horisont. Med årlig
// volatilitet σ har snittavkastningen over h år et standardavvik på σ/√h. z = 1,645
// gir 5- og 95-persentilen: 1 av 20 utfall blir svakere enn det svake scenarioet.
export const SCENARIO_Z = 1.645;
export const beregnScenarioAvkastning = (forventet, volatilitet, horisontAar, z = SCENARIO_Z) => {
  const h = Math.max(1, Number(horisontAar) || 1);
  const sigma = erGyldigTall(volatilitet) && volatilitet > 0 ? volatilitet : 0;
  const spenn = z * sigma / Math.sqrt(h);
  const avrund = (v) => Math.round(v * 10) / 10;
  return { svak: avrund(forventet - spenn), forventet: avrund(forventet), sterk: avrund(forventet + spenn) };
};

// Verdi etter n år med fast årlig avkastning og en årlig kontantstrøm (innskudd minus
// uttak) som tilføres i starten av hvert år – samme konvensjon som prognosegrafene.
// Verdien kan ikke bli negativ.
export const fremskrivVerdi = (kapital, avkastningPct, aar, aarligKontantstrom = 0) => {
  let verdi = Number(kapital) || 0;
  const r = (Number(avkastningPct) || 0) / 100;
  for (let i = 0; i < aar; i++) verdi = Math.max(0, (verdi + aarligKontantstrom) * (1 + r));
  return verdi;
};

// Som fremskrivVerdi, men returnerer også summen av innskudd/uttak som faktisk ble
// gjennomført. Uttak begrenses til det som finnes i porteføljen, slik at gevinst/tap
// (verdi − kapital − faktisk kontantstrøm) blir riktig også når porteføljen tømmes.
export const fremskrivMedKontantstrom = (kapital, avkastningPct, aar, aarligKontantstrom = 0) => {
  let verdi = Number(kapital) || 0;
  let nettoKontantstrom = 0;
  const r = (Number(avkastningPct) || 0) / 100;
  for (let i = 0; i < aar; i++) {
    const ks = Math.max(aarligKontantstrom, -verdi);
    nettoKontantstrom += ks;
    verdi = Math.max(0, (verdi + ks) * (1 + r));
  }
  return { verdi, nettoKontantstrom };
};

export const beregnPortefoljeVolatilitet = (allokering = [], historikkMap = {}, startDato = periodeStartDato(3)) =>
  beregnPortefoljeStatistikk(allokering, historikkMap, startDato)?.risiko ?? null;

/**
 * Beregn statistikk fra historikkdata (daglig eller månedlig) for en gitt periode.
 * Bruker daglige datapunkter direkte for mer presis drawdown og volatilitet.
 * Returnerer: aarligAvkastning, totalAvkastning, standardavvik, maxDrawdown, sharpe, drawdownSerie, avkSidenOppstart
 */
const statistikkCache = new WeakMap();
export function beregnProduktStatistikk(historikkData, startDato, riskFreeRate = RISIKOFRI_RENTE) {
  if (!historikkData || !Array.isArray(historikkData.data)) return null;
  const nokkel = `${startDato instanceof Date ? startDato.getTime() : String(startDato ?? '')}|${riskFreeRate}`;
  let perData = statistikkCache.get(historikkData.data);
  if (!perData) { perData = new Map(); statistikkCache.set(historikkData.data, perData); }
  if (!perData.has(nokkel)) perData.set(nokkel, beregnProduktStatistikkUncached(historikkData, startDato, riskFreeRate));
  const res = perData.get(nokkel);
  return res ? { ...res, drawdownSerie: res.drawdownSerie.map((p) => ({ ...p })) } : null;
}

function beregnProduktStatistikkUncached(historikkData, startDato, riskFreeRate) {
  const filtrert = filtrerHistorikk(historikkData.data, startDato);
  if (filtrert.length < 3) return null;

  const avkastninger = [];
  for (let i = 1; i < filtrert.length; i++) {
    const prev = filtrert[i - 1].verdi;
    const curr = filtrert[i].verdi;
    if (erGyldigTall(prev) && prev !== 0 && erGyldigTall(curr)) {
      avkastninger.push((curr - prev) / prev);
    }
  }
  const n = avkastninger.length;
  if (n === 0) return null;

  const perioderPerAar = inferPerioderPerAarFraHistorikk(filtrert);
  const gjennomsnitt = avkastninger.reduce((s, v) => s + v, 0) / n;
  const aarligAvkastning = ((filtrert[filtrert.length - 1].verdi / filtrert[0].verdi) ** (perioderPerAar / n) - 1) * 100;
  const varians = avkastninger.reduce((s, v) => s + (v - gjennomsnitt) ** 2, 0) / n;
  const stdAvvik = Math.sqrt(varians) * Math.sqrt(perioderPerAar) * 100;

  let maxDD = 0, peak = filtrert[0].verdi;
  const drawdownSerie = filtrert.map(d => {
    if (d.verdi > peak) peak = d.verdi;
    const dd = peak > 0 ? (d.verdi - peak) / peak * 100 : 0;
    if (dd < maxDD) maxDD = dd;
    return { dato: d.dato, dd: parseFloat(dd.toFixed(2)) };
  });

  const totalAvk = ((filtrert[filtrert.length - 1].verdi / filtrert[0].verdi) - 1) * 100;
  const sharpe = stdAvvik > 0 ? (aarligAvkastning - riskFreeRate) / stdAvvik : 0;

  // Annualisert avkastning siden oppstart (all tilgjengelig data)
  const fullSerie = filtrerHistorikk(historikkData.data, null);
  let avkSidenOppstart = null;
  if (fullSerie.length >= 2) {
    const nFull = fullSerie.length - 1;
    const fullPerioderPerAar = inferPerioderPerAarFraHistorikk(fullSerie);
    avkSidenOppstart = ((fullSerie[fullSerie.length - 1].verdi / fullSerie[0].verdi) ** (fullPerioderPerAar / nFull) - 1) * 100;
  }

  return {
    aarligAvkastning: parseFloat(aarligAvkastning.toFixed(2)),
    totalAvkastning: parseFloat(totalAvk.toFixed(2)),
    standardavvik: parseFloat(stdAvvik.toFixed(1)),
    maxDrawdown: parseFloat(maxDD.toFixed(1)),
    sharpe: parseFloat(sharpe.toFixed(2)),
    drawdownSerie,
    avkSidenOppstart: avkSidenOppstart !== null ? parseFloat(avkSidenOppstart.toFixed(2)) : null
  };
}

/**
 * Beregn korrelasjonsmatrise mellom produkter basert på daglige avkastninger.
 * Input: objekt med { [produktId]: historikkData }
 * Output: { matrix: number[][], labels: string[] }
 */
export function beregnKorrelasjonsmatrise(historikkMap, startDato) {
  const ids = Object.keys(historikkMap).filter(id => historikkMap[id]?.data?.length > 0);
  if (ids.length < 2) return { matrix: [], labels: [] };

  // Bygg daglige avkastningsserier per produkt
  const avkastningSerier = {};
  const alleDatoer = new Set();

  ids.forEach(id => {
    const serie = filtrerHistorikk(historikkMap[id].data, startDato);

    const avk = {};
    for (let i = 1; i < serie.length; i++) {
      if (serie[i - 1].verdi > 0) {
        avk[serie[i].dato] = (serie[i].verdi - serie[i - 1].verdi) / serie[i - 1].verdi;
        alleDatoer.add(serie[i].dato);
      }
    }
    avkastningSerier[id] = avk;
  });

  const datoerSortert = Array.from(alleDatoer).sort();

  // Pearson korrelasjon
  const pearson = (xArr, yArr) => {
    const n = xArr.length;
    if (n < 3) return null;
    const meanX = xArr.reduce((s, v) => s + v, 0) / n;
    const meanY = yArr.reduce((s, v) => s + v, 0) / n;
    let sumXY = 0, sumX2 = 0, sumY2 = 0;
    for (let i = 0; i < n; i++) {
      const dx = xArr[i] - meanX;
      const dy = yArr[i] - meanY;
      sumXY += dx * dy;
      sumX2 += dx * dx;
      sumY2 += dy * dy;
    }
    const denom = Math.sqrt(sumX2 * sumY2);
    return denom > 0 ? sumXY / denom : 0;
  };

  const matrix = ids.map((idA) => {
    return ids.map((idB) => {
      if (idA === idB) return 1.0;
      const xArr = [], yArr = [];
      datoerSortert.forEach(d => {
        const xv = avkastningSerier[idA]?.[d];
        const yv = avkastningSerier[idB]?.[d];
        if (xv !== undefined && yv !== undefined) {
          xArr.push(xv);
          yArr.push(yv);
        }
      });
      const r = pearson(xArr, yArr);
      return r !== null ? parseFloat(r.toFixed(2)) : null;
    });
  });

  return { matrix, labels: ids };
}

// Kundeinformasjon starter tom: rådgiver fyller inn kundens faktiske beløp.
// beregnAllokering gir likevel en prosentfordeling ut fra risikoprofilen når
// total kapital er 0, så profilknappene virker fra start.
export const DEFAULT_LIKVID = 0;
export const DEFAULT_PE = 0;
export const DEFAULT_EIENDOM = 0;

export const DEFAULT_KUNDEKAPITAL = {
  aksjerKunde: 0,
  aksjefondKunde: 0,
  renterKunde: 0,
  kontanterKunde: 0,
  peFondKunde: 0,
  unoterteAksjerKunde: 0,
  shippingKunde: 0,
  egenEiendomKunde: 0,
  eiendomSyndikatKunde: 0,
  eiendomFondKunde: 0
};
