export const PENSUM_COLORS = {
  navy: '#0D2841', darkBlue: '#012441', lightBlue: '#6B9DB8', salmon: '#C4967E',
  gray: '#9EAAB4', darkGray: '#4A5568', lightGray: '#F5F5F5', white: '#FFFFFF',
  green: '#2D6A4F', red: '#B91C1C', gold: '#A67B3D', teal: '#2D6A6A', purple: '#5B4FA0',
  accent: '#6B9DB8', midBlue: '#123C6A', charcoal: '#262626', warmGray: '#8B8B8B'
};

export const CATEGORY_COLORS = { aksjer: '#0D2841', renter: '#C4967E', privateMarkets: '#2D6A6A', eiendom: '#A67B3D', shipping: '#1E5F74' };
export const ASSET_COLORS = { 'Globale Aksjer': '#6B9DB8', 'Norske Aksjer': '#0D2841', 'Høyrente': '#C4967E', 'Investment Grade': '#D4B8A8', 'Private Equity': '#2D6A6A', 'Eiendom': '#A67B3D', 'Shipping': '#1E5F74' };
export const ASSET_COLORS_LIGHT = { 'Globale Aksjer': '#A8C8D8', 'Norske Aksjer': '#6B9DB8', 'Høyrente': '#DCCABE', 'Investment Grade': '#E8D8CE', 'Private Equity': '#7AADAD', 'Eiendom': '#D4B888', 'Shipping': '#5A8FA0' };

export const erGyldigTall = (v) => typeof v === 'number' && Number.isFinite(v);
export const formatCurrency = (v) => new Intl.NumberFormat('nb-NO', { style: 'currency', currency: 'NOK', maximumFractionDigits: 0 }).format(erGyldigTall(v) ? v : 0);
export const formatNumber = (v) => new Intl.NumberFormat('nb-NO', { maximumFractionDigits: 0 }).format(erGyldigTall(v) ? v : 0);
export const formatPercent = (v) => erGyldigTall(v) ? v.toFixed(1) + '%' : '—';
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

export const RAPPORT_DATO = '31.07.2026';
export const HISTORIKK_ARFELT = ['aar2026', 'aar2025', 'aar2024', 'aar2023', 'aar2022'];

export function beregnProduktNokkeltall(produkt) {
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


const [RAPPORT_DAG, RAPPORT_MAANED_NUMMER, RAPPORT_AAR] = RAPPORT_DATO.split('.');
export const RAPPORT_MAANED = `${RAPPORT_AAR}-${RAPPORT_MAANED_NUMMER}`;
export const RAPPORT_DATO_ISO = `${RAPPORT_AAR}-${RAPPORT_MAANED_NUMMER}-${RAPPORT_DAG}`;
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
  'global-core-active': 2.7,
  'global-edge': -0.2,
  'basis': 1.2,
  'global-hoyrente': 2.2,
  'nordisk-hoyrente': 3.3,
  'norge-a': 10.8,
  'energy-a': 25.6,
  'banking-d': 5.9,
  'financial-d': 4.1,
  'kairos-a': -1.2,
  'acadian-global-equity': 19.6,
  'capital-group-new-pers': 4.7,
  'dnb-global-enhanced': 3.8,
  'guinness-global-equity-income': 13.0,
  'janus-henderson-glb-sc': 10.5
};

// CMA-metodikk dokumentasjon — referert i UI for forventet avkastning
export const CMA_METODIKK = {
  beskrivelse: 'Forventet avkastning er basert på CMA-metodikk (Capital Market Assumptions) — institusjonell konsensus fra BlackRock, Vanguard og J.P. Morgan Asset Management, med en eksplisitt nordisk/norsk overlay.',
  kortTekst: 'CMA-metodikk: BlackRock + Vanguard + J.P. Morgan Asset Management',
  dokumentLenke: 'uploads/CMA_metodikk_.docx',
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
const filtrerHistorikk = (data, startDato) => {
  if (!Array.isArray(data)) return [];
  return data
    .filter(d => {
      const parsed = parseHistorikkDato(d?.dato);
      return parsed && (!startDato || parsed >= startDato) && erGyldigTall(d?.verdi);
    })
    .sort((a, b) => parseHistorikkDato(a.dato) - parseHistorikkDato(b.dato));
};

/**
 * Beregn statistikk fra historikkdata (daglig eller månedlig) for en gitt periode.
 * Bruker daglige datapunkter direkte for mer presis drawdown og volatilitet.
 * Returnerer: aarligAvkastning, totalAvkastning, standardavvik, maxDrawdown, sharpe, drawdownSerie, avkSidenOppstart
 */
export function beregnProduktStatistikk(historikkData, startDato, riskFreeRate = 3) {
  if (!historikkData || !Array.isArray(historikkData.data)) return null;
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

export const DEFAULT_LIKVID = 8000000;
export const DEFAULT_PE = 1000000;
export const DEFAULT_EIENDOM = 1000000;

// Utgangspunktet i kundeinformasjon: 10 mill totalt, fordelt som DEFAULT_LIKVID
// (8 mill), DEFAULT_PE (1 mill) og DEFAULT_EIENDOM (1 mill).
export const DEFAULT_KUNDEKAPITAL = {
  aksjerKunde: 1000000,
  aksjefondKunde: 3000000,
  renterKunde: 2000000,
  kontanterKunde: 2000000,
  peFondKunde: 1000000,
  unoterteAksjerKunde: 0,
  shippingKunde: 0,
  egenEiendomKunde: 1000000,
  eiendomSyndikatKunde: 0,
  eiendomFondKunde: 0
};
