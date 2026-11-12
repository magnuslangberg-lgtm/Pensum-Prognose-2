// Datamodell for investeringsforslaget. Én ren funksjon samler alle tall som vises i
// presentasjonen, med de samme beregningene som appen bruker (lib/pensumCore.js).
// Presentasjonsgeneratoren (lib/forslagPptx.js) tegner bare det som står i modellen.
import {
  RAPPORT_DATO, RAPPORT_AAR_TALL, RISIKOFRI_RENTE, CMA_KLASSER,
  aggregerEksponering, aggregerVerdensdeler, tilVerdensdeler, oversettEksponering,
  beregnKostnader, beregnPortefoljeStatistikk, beregnProduktStatistikk, beregnSisteAarNokkeltall,
  beregnScenarioAvkastning, byggMaanedssluttSerie, erGyldigTall, fremskrivVerdi, parseHistorikkDato, periodeStartDato
} from './pensumCore.js';

const ROLLER = {
  kjerne: { navn: 'Kjerne', tekst: 'Gir bred eksponering og er sentral kilde til forventet langsiktig avkastning.' },
  stabilisator: { navn: 'Stabilisator', tekst: 'Skal dempe svingninger og bidra med løpende avkastning i samlet portefølje.' },
  satellitt: { navn: 'Satellitter', tekst: 'Kompletterer kjernen med mer selektive investeringer som kan styrke diversifiseringen og øke avkastningspotensialet.' }
};

// Samme inndeling som rapporten har brukt: kategorien i produktets rapportdata avgjør
// rollen. Produkter uten kategori (f.eks. fond fra Morningstar) plasseres etter aktivatype.
const ROLLE_FOR_KATEGORI = {
  'equity-core': 'kjerne', 'equity-satellite': 'kjerne', balanced: 'kjerne',
  'fixed-income': 'stabilisator', 'fixed-income-specialist': 'stabilisator',
  'equity-nordic': 'satellitt', 'equity-thematic': 'satellitt', 'equity-sector': 'satellitt'
};
const rolleFor = (p, meta = {}) => {
  if (ROLLE_FOR_KATEGORI[meta.category]) return ROLLE_FOR_KATEGORI[meta.category];
  if (p.aktivatype === 'rente' || p.aktivatype === 'kontanter') return 'stabilisator';
  if (p.aktivatype === 'alternativ' || p.rolle === 'spisset') return 'satellitt';
  return 'kjerne';
};

// Hvordan historikken før oppstart er estimert (fra Morningstar Direct-presentasjonen).
const ESTIMATNOTER = {
  basis: 'Estimert med Pensum Global Dynamisk, forvaltet av samme forvalter (oppstart sept. 2023).',
  'global-core-active': 'Estimert med underliggende fonds utvikling før oppstart 01.01.2026, med samme vekting tilbake i tid.',
  'global-edge': 'Estimert med underliggende fonds utvikling før oppstart 01.01.2026, med samme vekting tilbake i tid.',
  'norge-a': 'Estimert med 2/3 Pensum Norske Aksjer Utbytte og 1/3 Pensum Norske Aksjer Vekst (oppstart nov. 2023).',
  'energy-a': 'Estimert med et lignende diskresjonært mandat, Pensum Energi, forvaltet av samme forvalter (oppstart des. 2022).',
  'banking-d': 'Estimert med et lignende diskresjonært mandat, Pensum Sparebank +, forvaltet av samme forvalter (oppstart 29. januar 2025).',
  'nordisk-hoyrente': 'Estimert med underliggende fonds utvikling før oppstart i feb. 2024.',
  'financial-d': 'Estimert med indeksen Bloomberg Global High Yield, valutasikret til NOK (oppstart april 2025).',
  'kairos-a': 'Estimert med fondets indeks, MSCI ACWI NR, før oppstart av fondet 15. april 2026.'
};

// Avrunder til hele prosent slik at summen blir 100 (største rest får det som mangler).
export const tilHeleProsent = (verdier = []) => {
  const sum = verdier.reduce((s, v) => s + v, 0);
  if (!(sum > 0)) return verdier.map(() => 0);
  const skalert = verdier.map((v) => (v / sum) * 100);
  const hele = skalert.map(Math.floor);
  let rest = 100 - hele.reduce((s, v) => s + v, 0);
  skalert.map((v, i) => ({ i, r: v - hele[i] })).sort((a, b) => b.r - a.r).forEach(({ i }) => { if (rest > 0) { hele[i] += 1; rest -= 1; } });
  return hele;
};

const AKTIVA_NAVN = { aksje: 'Aksjer', rente: 'Renter', alternativ: 'Alternativer', kontanter: 'Kontanter' };

// Månedlig indeksert utvikling (prosent fra start) for en vektet portefølje, rebalansert
// månedlig mellom produktene som har kurs i hele perioden. Returnerer også hvilke
// produkter som er med, slik at dekningen kan oppgis.
export const byggPortefoljeSerie = (allokering = [], historikkMap = {}, startDato) => {
  const start = startDato.getTime();
  const serier = allokering
    .filter((a) => (a?.vekt || 0) > 0 && Array.isArray(historikkMap?.[a.id]?.data))
    .map((a) => {
      const mnd = byggMaanedssluttSerie(historikkMap[a.id].data).map((p) => ({ ...p, t: parseHistorikkDato(p.dato).getTime() }));
      const forste = mnd[0]?.t;
      return { id: a.id, vekt: a.vekt, mnd, dekker: forste != null && forste - start <= 45 * 86400000 };
    })
    .filter((s) => s.dekker);
  if (!serier.length) return { punkter: [], produkter: [], dekketVekt: 0 };
  const etterStart = (s) => s.mnd.filter((p) => p.t >= start - 31 * 86400000);
  const datoer = etterStart(serier[0]).map((p) => p.dato).filter((d) => serier.every((s) => s.mnd.some((p) => p.dato === d)));
  const sumVekt = serier.reduce((sum, s) => sum + s.vekt, 0);
  const verdi = (s, dato) => s.mnd.find((p) => p.dato === dato).verdi;
  let indeks = 100;
  const punkter = datoer.map((dato, i) => {
    if (i > 0) {
      const avk = serier.reduce((sum, s) => sum + (s.vekt / sumVekt) * (verdi(s, dato) / verdi(s, datoer[i - 1]) - 1), 0);
      indeks *= 1 + avk;
    }
    return { dato, verdi: Number((indeks - 100).toFixed(2)) };
  });
  return { punkter, produkter: serier.map((s) => s.id), dekketVekt: sumVekt };
};

const indeksSerie = (data, datoer) => {
  const mnd = byggMaanedssluttSerie(data || []);
  const start = mnd.find((p) => p.dato === datoer[0]);
  if (!start) return null;
  return datoer.map((d) => {
    const p = mnd.find((x) => x.dato === d);
    return p ? Number(((p.verdi / start.verdi - 1) * 100).toFixed(2)) : null;
  });
};

export function byggForslagModell({
  kundeNavn = '', kundeSelskap = '', radgiver = {}, dato = new Date(),
  belop = 0, horisont = 10, risikoprofil = 'Moderat', formaal = '', likviditetsbehov = '',
  nettoKontantstrom = 0,
  allokering = [], produkter = [], produktRapportMeta = {}, produktEksponering = {},
  produktHistorikk = {}, indeksHistorikk = {}, referanseEksponering = null,
  historiskAarsavkastning = {}, scenarioOverstyring = {}, selskap = {}, forventetAvkastning: oppgittAvkastning = null, referanser = [
    { id: 'msci-world', navn: 'MSCI World' }, { id: 'oslo-bors', navn: 'Oslo Børs' }, { id: 'norske-statsobl', navn: 'Norske statsobl.' }
  ]
} = {}) {
  // Mangler beløpet, vises det som «Avklares», og fremskrivningene regnes per 1 mill. kr.
  const belopKjent = Number(belop) > 0;
  if (!belopKjent) belop = 1000000;
  const aktive = allokering.filter((a) => (a?.vekt || 0) > 0);
  const sumVekt = aktive.reduce((s, a) => s + a.vekt, 0) || 1;
  const finn = (id) => produkter.find((p) => p.id === id) || {};

  // ---- Produkter ----
  const produktliste = aktive.map((a) => {
    const p = finn(a.id);
    const meta = produktRapportMeta?.[a.id] || {};
    const hist = produktHistorikk?.[a.id];
    const s1 = hist ? beregnProduktStatistikk(hist, periodeStartDato(1)) : null;
    const n3 = hist ? beregnSisteAarNokkeltall(hist, 3) : null;
    const n5 = hist ? beregnSisteAarNokkeltall(hist, 5) : null;
    const dekker1 = hist ? beregnSisteAarNokkeltall(hist, 1) : null;
    const eks = produktEksponering?.[a.id] || {};
    const vekt = (a.vekt / sumVekt) * 100;
    return {
      id: a.id,
      navn: p.navn || a.navn || a.id,
      vekt,
      belop: belop * vekt / 100,
      aktivatype: p.aktivatype || 'aksje',
      rolle: rolleFor(p, meta),
      likvid: p.likviditet !== 'illikvid',
      sharpe: n5 ? n5.sharpe : (n3 ? n3.sharpe : null),
      valuta: p.valuta || null,
      forventetAvkastning: erGyldigTall(p.forventetAvkastning) ? p.forventetAvkastning : (meta.expectedReturn ?? null),
      forventetRisiko: erGyldigTall(p.forventetRisiko) ? p.forventetRisiko : null,
      forventetYield: erGyldigTall(p.forventetYield) ? p.forventetYield : (meta.expectedYield ?? null),
      avk1: dekker1 && s1 ? s1.totalAvkastning : null,
      avk3: n3 ? n3.aarlig : (p.kilde === 'morningstar' && erGyldigTall(p.aarlig3ar) ? p.aarlig3ar : null),
      avk5: n5 ? n5.aarlig : null,
      volatilitet: n5 ? n5.risiko : (n3 ? n3.risiko : (p.kilde === 'morningstar' && erGyldigTall(p.risiko3ar) ? p.risiko3ar : null)),
      maxDrawdown: n5 ? n5.maxDrawdown : (n3 ? n3.maxDrawdown : null),
      tittel: meta.slideTitle || p.navn || a.navn,
      undertittel: meta.slideSubtitle || p.morningstarKategori || '',
      pitch: meta.pitch || meta.caseText || '',
      hvorfor: meta.whyIncluded || '',
      rolleTekst: meta.role || '',
      risikoTekst: meta.riskText || '',
      referanse: meta.benchmark || '',
      eksponering: {
        underliggende: (eks.underliggende || []).filter((r) => r.navn !== 'Other').slice(0, 10),
        regioner: (eks.regioner || []).slice(0, 8).map((r) => ({ navn: oversettEksponering(r.navn), vekt: r.vekt })),
        sektorer: (eks.sektorer || []).slice(0, 8).map((r) => ({ navn: oversettEksponering(r.navn), vekt: r.vekt }))
      },
      merknad: eks.disclaimer || ''
    };
  }).sort((x, y) => y.vekt - x.vekt);

  // ---- Samlet ----
  const vektet = (hent) => {
    const med = produktliste.filter((p) => erGyldigTall(hent(p)));
    const v = med.reduce((s, p) => s + p.vekt, 0);
    return v > 0 ? med.reduce((s, p) => s + p.vekt * hent(p), 0) / v : null;
  };
  const forventetAvkastning = erGyldigTall(oppgittAvkastning) ? oppgittAvkastning : (vektet((p) => p.forventetAvkastning) ?? 0);
  const forventetYield = vektet((p) => p.forventetYield);
  const forventetRisiko = vektet((p) => p.forventetRisiko);

  const aktiva = {};
  produktliste.forEach((p) => {
    if (p.aktivatype === 'dynamisk' || p.aktivatype === 'blandet') {
      aktiva.Aksjer = (aktiva.Aksjer || 0) + p.vekt / 2; aktiva.Renter = (aktiva.Renter || 0) + p.vekt / 2;
    } else {
      const navn = AKTIVA_NAVN[p.aktivatype] || 'Aksjer';
      aktiva[navn] = (aktiva[navn] || 0) + p.vekt;
    }
  });
  const aktivaNavn = ['Aksjer', 'Renter', 'Alternativer', 'Kontanter'].filter((n) => aktiva[n] > 0);
  const aktivaHele = tilHeleProsent(aktivaNavn.map((n) => aktiva[n]));
  const aktivafordeling = aktivaNavn.map((navn, i) => ({ navn, vekt: Number(aktiva[navn].toFixed(1)), hel: aktivaHele[i] }));

  const roller = Object.keys(ROLLER).map((id) => {
    const liste = produktliste.filter((p) => p.rolle === id);
    const vekt = liste.reduce((s, p) => s + p.vekt, 0);
    const yieldSnitt = vekt > 0 ? liste.reduce((s, p) => s + (p.forventetYield || 0) * p.vekt, 0) / vekt : 0;
    const bidrag = {
      kjerne: ['Global basiseksponering', 'God forvalterdiversifisering', 'Tydelig rolle som hovedmotor'],
      stabilisator: [`Forv. yield ${yieldSnitt.toFixed(1).replace('.', ',')}\u00a0%`, 'Lavere svingninger enn aksjer', 'Demper total porteføljerisiko'],
      satellitt: ['Meravkastningspotensial', liste.some((p) => p.id.startsWith('norge')) ? 'Norsk eksponering og lokal innsikt' : 'Selektive investeringer', 'Tematisk diversifisering']
    }[id];
    return { id, ...ROLLER[id], vekt, bidrag, produkter: liste.map((p) => ({ navn: p.navn.replace('Pensum ', ''), vekt: p.vekt })) };
  }).filter((r) => r.vekt > 0);

  // ---- Historikk ----
  const stat5 = beregnPortefoljeStatistikk(aktive, produktHistorikk, periodeStartDato(5));
  const stat3 = beregnPortefoljeStatistikk(aktive, produktHistorikk, periodeStartDato(3));
  const periodeAar = stat5 ? 5 : 3;
  const serie = byggPortefoljeSerie(aktive, produktHistorikk, periodeStartDato(periodeAar));
  const datoer = serie.punkter.map((p) => p.dato);
  const referanseSerier = datoer.length
    ? referanser.map((r) => ({ navn: r.navn, verdier: indeksSerie(indeksHistorikk?.[r.id]?.data, datoer) })).filter((r) => r.verdier)
    : [];
  const aarsavkastning = Array.from({ length: 5 }, (_, i) => RAPPORT_AAR_TALL - 4 + i).map((aar) => ({
    aar, etikett: aar === RAPPORT_AAR_TALL ? `${aar} hittil` : String(aar), verdi: historiskAarsavkastning?.[`aar${aar}`] ?? null
  }));
  const utenHistorikk = produktliste.filter((p) => !serie.produkter.includes(p.id)).map((p) => p.navn);

  // ---- Scenarioer ----
  const scenarioVol = forventetRisiko ?? stat5?.risiko ?? stat3?.risiko ?? 10;
  const scen = beregnScenarioAvkastning(forventetAvkastning, scenarioVol, horisont);
  const svak = scenarioOverstyring.pessimistisk ?? scen.svak;
  const sterk = scenarioOverstyring.optimistisk ?? scen.sterk;
  const startAar = dato.getFullYear();
  const scenarioer = [
    { id: 'svak', navn: 'Svakt scenario', undertittel: '1 av 20 utfall blir svakere', avkastning: svak },
    { id: 'hoved', navn: 'Hovedscenario', undertittel: 'Forventet utvikling', avkastning: Number(forventetAvkastning.toFixed(1)) },
    { id: 'sterk', navn: 'Sterkt scenario', undertittel: '1 av 20 utfall blir sterkere', avkastning: sterk }
  ].map((s) => ({ ...s, sluttverdi: fremskrivVerdi(belop, s.avkastning, horisont, nettoKontantstrom) }));
  const scenarioSerie = Array.from({ length: horisont + 1 }, (_, i) => ({
    aar: startAar + i,
    ...Object.fromEntries(scenarioer.map((s) => [s.id, fremskrivVerdi(belop, s.avkastning, i, nettoKontantstrom)]))
  }));

  // ---- Eksponering (aksjedelen) ----
  const aksjeAllokering = aktive.filter((a) => !['rente', 'kontanter'].includes(finn(a.id).aktivatype) && (produktEksponering?.[a.id]?.regioner?.length || produktEksponering?.[a.id]?.sektorer?.length));
  const norsk = (liste) => liste.map((r) => ({ navn: oversettEksponering(r.navn), vekt: r.vekt }));
  const eksponering = {
    gjelder: aksjeAllokering.map((a) => (finn(a.id).navn || a.navn || '').replace('Pensum ', '')),
    verdensdeler: aggregerVerdensdeler(aksjeAllokering, produktEksponering),
    regioner: norsk(aggregerEksponering(aksjeAllokering, produktEksponering, 'regioner', 8)),
    sektorer: norsk(aggregerEksponering(aksjeAllokering, produktEksponering, 'sektorer', 8)),
    referanse: referanseEksponering ? {
      navn: referanseEksponering.navn, dato: referanseEksponering.dato,
      verdensdeler: tilVerdensdeler(referanseEksponering.regioner),
      sektorer: norsk(referanseEksponering.sektorer)
    } : null
  };

  const kostnader = beregnKostnader(aktive, produkter, belop);
  const stat = stat5 ?? stat3;
  const likvidVekt = produktliste.filter((p) => p.likvid).reduce((s, p) => s + p.vekt, 0);
  const portefolje = {
    avk1: vektet((p) => p.avk1), avk3: vektet((p) => p.avk3), avk5: vektet((p) => p.avk5),
    risiko: stat?.risiko ?? null, sharpe: stat?.sharpe ?? null, maxDrawdown: stat?.maxDrawdown ?? null
  };
  const periodeStart = periodeStartDato(periodeAar);
  const fall = [
    { navn: 'Porteføljen', verdi: stat?.maxDrawdown ?? null, egen: true },
    ...referanser.filter((r) => r.id !== 'norske-statsobl').map((r) => ({ navn: r.navn, verdi: beregnProduktStatistikk(indeksHistorikk?.[r.id], periodeStart)?.maxDrawdown ?? null }))
  ].filter((f) => erGyldigTall(f.verdi));
  // Renters rente: investert beløp, enkel avkastning og effekten av at avkastningen selv gir avkastning.
  const r = Number(forventetAvkastning.toFixed(1)) / 100;
  const rentersRente = Array.from({ length: horisont + 1 }, (_, t) => ({
    aar: startAar + t, kapital: belop, enkel: belop * r * t, effekt: belop * (Math.pow(1 + r, t) - 1 - r * t)
  }));
  const estimatnoter = produktliste.filter((p) => ESTIMATNOTER[p.id]).map((p) => ({ navn: p.navn, tekst: ESTIMATNOTER[p.id] }));

  return {
    kunde: kundeNavn || kundeSelskap || 'Kunde',
    selskap: kundeNavn && kundeSelskap ? kundeSelskap : '',
    radgiver: { navn: radgiver.navn || '', tittel: radgiver.tittel || 'Investeringsrådgiver', telefon: radgiver.telefon || '', epost: radgiver.epost || '' },
    dato, rapportDato: RAPPORT_DATO, risikofriRente: RISIKOFRI_RENTE,
    belop, belopKjent, horisont, risikoprofil, formaal, likviditetsbehov, nettoKontantstrom,
    forventetAvkastning, forventetYield, forventetRisiko,
    historiskRisiko: stat5?.risiko ?? stat3?.risiko ?? null,
    historiskMaksFall: stat5?.maxDrawdown ?? stat3?.maxDrawdown ?? null,
    aktivafordeling, roller, produkter: produktliste, portefolje, estimatnoter, fall, rentersRente,
    likviditet: likvidVekt >= 90 ? 'Daglig' : likvidVekt >= 50 ? 'Delvis daglig' : 'Begrenset',
    historikk: {
      periodeAar, datoer, portefolje: serie.punkter.map((p) => p.verdi), referanser: referanseSerier,
      aarligAvkastning: (stat5 ?? stat3)?.aarlig ?? null, aarsavkastning, utenHistorikk
    },
    scenarioer, scenarioSerie, scenarioVolatilitet: scenarioVol,
    eksponering, kostnader, pensum: { ansatte: selskap.ansatte || null, forvaltningskapital: selskap.forvaltningskapital || null },
    cmaKilde: `Forventet avkastning og risiko bygger på Pensums langsiktige kapitalmarkedsforutsetninger (risikofri rente ${String(RISIKOFRI_RENTE).replace('.', ',')} %).`,
    cmaKlasser: CMA_KLASSER
  };
}
