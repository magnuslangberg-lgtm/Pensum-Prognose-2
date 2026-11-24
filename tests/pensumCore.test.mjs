import test from 'node:test';
import assert from 'node:assert/strict';
import {
  RAPPORT_DATO_OBJEKT, RISIKOFRI_RENTE, RISK_PROFILES,
  aggregerEksponering, beregnAarsavkastningFraData, beregnAllokering, beregnPortefoljeStatistikk,
  beregnProduktNokkeltall, beregnProduktStatistikk, beregnSisteAarNokkeltall, byggMaanedssluttSerie,
  parseHistorikkDato, periodeStartDato, skalerVekterTilHundreListe
} from '../lib/pensumCore.js';
import { defaultProduktEksponering } from '../data/pensumDefaults.js';
import { DATAFEED_PRODUKT_HISTORIKK } from '../data/pensumDatafeedHistorikk.js';

const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
// Daglig serie fra start til rapportdato der hver dag gir avkastningen fra avkFn(i).
const lagSerie = (start, avkFn = () => 0) => {
  const data = []; let verdi = 100; let i = 0;
  for (let d = new Date(start); d <= RAPPORT_DATO_OBJEKT; d.setDate(d.getDate() + 1), i++) {
    if (i > 0) verdi *= 1 + avkFn(i);
    data.push({ dato: iso(d), verdi });
  }
  return { data };
};
const naer = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);

test('parseHistorikkDato håndterer dag, måned og ugyldig', () => {
  assert.equal(iso(parseHistorikkDato('2026-10-31')), '2026-10-31');
  assert.equal(iso(parseHistorikkDato('2026-10')), '2026-10-01');
  assert.equal(parseHistorikkDato('tull'), null);
  // Cachen må ikke dele Date-objekter mellom kall.
  const a = parseHistorikkDato('2026-01-01'); a.setFullYear(1999);
  assert.equal(parseHistorikkDato('2026-01-01').getFullYear(), 2026);
});

test('beregnAllokering summerer til 100 for alle profiler, med og uten kapital', () => {
  for (const profil of Object.keys(RISK_PROFILES)) {
    for (const [l, pe, e] of [[0, 0, 0], [8e6, 1e6, 1e6]]) {
      const sum = beregnAllokering(l, pe, e, profil).reduce((s, r) => s + r.vekt, 0);
      naer(sum, 100, 0.3, `${profil} ${l}`);
    }
  }
});

test('skalerVekterTilHundreListe gir 100', () => {
  const liste = skalerVekterTilHundreListe([{ id: 'a', vekt: 33.3 }, { id: 'b', vekt: 33.3 }, { id: 'c', vekt: 20 }]);
  naer(liste.reduce((s, r) => s + r.vekt, 0), 100, 0.05, 'sum');
});

test('kalenderårsavkastning: delår gir null, inneværende år stopper på rapportdato', () => {
  const sep = lagSerie(new Date(2023, 8, 22), () => 0.0005);
  assert.equal(beregnAarsavkastningFraData(sep.data, 2023), null, 'serie som starter i september skal ikke gi 2023-tall');
  assert.ok(beregnAarsavkastningFraData(sep.data, 2024) > 0, '2024 er et helt år');
  // Et år etter rapportdato finnes ikke.
  assert.equal(beregnAarsavkastningFraData(sep.data, RAPPORT_DATO_OBJEKT.getFullYear() + 1), null);
  const ytd = beregnAarsavkastningFraData(sep.data, RAPPORT_DATO_OBJEKT.getFullYear());
  // Startkurs er 1. januar (i datafeeden lik kursen 31. desember).
  const dager = Math.round((RAPPORT_DATO_OBJEKT - new Date(RAPPORT_DATO_OBJEKT.getFullYear(), 0, 1)) / 86400000);
  naer(ytd, (Math.pow(1.0005, dager) - 1) * 100, 0.01, 'YTD');
});

test('siste 3 år: jevn vekst gir riktig årlig avkastning og ~0 volatilitet; for kort historikk gir null', () => {
  const r = Math.pow(1.08, 1 / 365.25) - 1;
  const n = beregnSisteAarNokkeltall(lagSerie(new Date(2019, 0, 1), () => r), 3);
  naer(n.aarlig, 8, 0.05, 'årlig');
  naer(n.risiko, 0, 0.01, 'risiko');
  assert.equal(beregnSisteAarNokkeltall(lagSerie(new Date(2025, 0, 1), () => r), 3), null);
});

test('volatilitet annualiseres riktig for daglige data', () => {
  // ±1 % annenhver dag ⇒ daglig std ≈ 1 % ⇒ årlig ≈ 1 % * √365,25 ≈ 19,1 %.
  const serie = lagSerie(new Date(2021, 0, 1), (i) => (i % 2 ? 0.01 : -0.01));
  const stat = beregnProduktStatistikk(serie, periodeStartDato(3));
  naer(stat.standardavvik, Math.sqrt(365.25), 0.4, 'årlig vol');
});

test('beregnProduktNokkeltall bruker historikk, og ikke spredning mellom årstall som risiko', () => {
  const serie = lagSerie(new Date(2021, 0, 1), (i) => (i % 2 ? 0.01 : -0.01));
  const medHist = beregnProduktNokkeltall({ aar2025: 10, aar2024: 12, aar2023: 14 }, serie);
  assert.ok(medHist.risiko3ar > 15, 'risiko fra faktisk volatilitet');
  const utenHist = beregnProduktNokkeltall({ aar2025: 10, aar2024: 12, aar2023: 14 });
  assert.equal(utenHist.risiko3ar, null, 'uten historikk og uten eksplisitt felt: ingen risiko');
  naer(utenHist.aarlig3ar, 12, 0.1, 'snitt av tre år');
});

test('porteføljevolatilitet tar hensyn til samvariasjon', () => {
  const a = lagSerie(new Date(2021, 0, 1), (i) => (i % 2 ? 0.01 : -0.01));
  const b = lagSerie(new Date(2021, 0, 1), (i) => (i % 2 ? -0.01 : 0.01));
  const hver = beregnProduktStatistikk(a, periodeStartDato(3)).standardavvik;
  const port = beregnPortefoljeStatistikk([{ id: 'a', vekt: 50 }, { id: 'b', vekt: 50 }], { a, b });
  assert.ok(port.risiko < hver / 10, `motsatte serier skal nesten nulle hverandre ut (${port.risiko})`);
  const lik = beregnPortefoljeStatistikk([{ id: 'a', vekt: 50 }, { id: 'c', vekt: 50 }], { a, c: a });
  naer(lik.risiko, hver, 0.2, 'like serier');
  assert.ok(lik.sharpe < 0, `ingen avkastning gir negativ Sharpe med rf=${RISIKOFRI_RENTE}`);
});

test('ekte datafeed: porteføljevol ligger mellom ingen og vektet snitt', () => {
  const allok = [{ id: 'global-core-active', vekt: 40 }, { id: 'global-edge', vekt: 40 }, { id: 'norge-a', vekt: 20 }];
  const port = beregnPortefoljeStatistikk(allok, DATAFEED_PRODUKT_HISTORIKK);
  const snitt = allok.reduce((s, a) => s + beregnProduktStatistikk(DATAFEED_PRODUKT_HISTORIKK[a.id], periodeStartDato(3)).standardavvik * a.vekt / 100, 0);
  assert.ok(port.risiko > 5 && port.risiko <= snitt + 0.01, `port ${port.risiko} snitt ${snitt}`);
});

test('månedsserie bruker siste kurs i hver måned', () => {
  const m = byggMaanedssluttSerie([{ dato: '2026-01-05', verdi: 1 }, { dato: '2026-01-30', verdi: 2 }, { dato: '2026-02-02', verdi: 3 }]);
  assert.deepEqual(m, [{ dato: '2026-01', verdi: 2 }, { dato: '2026-02', verdi: 3 }]);
});

test('aggregert eksponering summerer til 100', () => {
  const allok = [{ id: 'global-core-active', vekt: 27.5 }, { id: 'global-edge', vekt: 17.5 }, { id: 'kairos-a', vekt: 5 }, { id: 'norge-a', vekt: 15 }, { id: 'energy-a', vekt: 5 }];
  for (const felt of ['regioner', 'sektorer', 'stil']) {
    naer(aggregerEksponering(allok, defaultProduktEksponering, felt).reduce((s, r) => s + r.vekt, 0), 100, 0.05, felt);
  }
});

test('fremskrivning: uttak begrenses til det som finnes i porteføljen', async () => {
  const { fremskrivMedKontantstrom, fremskrivVerdi } = await import('../lib/pensumCore.js');
  // 1 mill, 0 % avkastning, 200 000 i årlige uttak i 10 år: bare 5 uttak kan gjennomføres.
  const r = fremskrivMedKontantstrom(1_000_000, 0, 10, -200_000);
  assert.equal(r.verdi, 0);
  assert.equal(r.nettoKontantstrom, -1_000_000);
  assert.equal(r.verdi - 1_000_000 - r.nettoKontantstrom, 0, 'ingen gevinst uten avkastning');
  naer(fremskrivMedKontantstrom(1e6, 7, 10, 50_000).verdi, fremskrivVerdi(1e6, 7, 10, 50_000), 1e-6, 'samme verdi som fremskrivVerdi');
});

test('verdensdeler summerer til 100 og håndterer både land og regioner', async () => {
  const { aggregerVerdensdeler, tilVerdensdeler, verdensdelFor } = await import('../lib/pensumCore.js');
  assert.equal(verdensdelFor('Singapore'), 'Asia');
  assert.equal(verdensdelFor('Europe dev'), 'Europa');
  assert.equal(verdensdelFor('Other'), 'Ikke fordelt');
  const rader = tilVerdensdeler([{ navn: 'United States', vekt: 60 }, { navn: 'Norway', vekt: 20 }, { navn: 'North America', vekt: 10 }, { navn: 'Other', vekt: 10 }]);
  assert.deepEqual(rader, [{ navn: 'Nord-Amerika', vekt: 70 }, { navn: 'Europa', vekt: 20 }, { navn: 'Ikke fordelt', vekt: 10 }]);
  const allok = [{ id: 'global-core-active', vekt: 40 }, { id: 'norge-a', vekt: 30 }, { id: 'kairos-a', vekt: 30 }];
  const v = aggregerVerdensdeler(allok, defaultProduktEksponering);
  naer(v.reduce((s, r) => s + r.vekt, 0), 100, 0.05, 'sum');
  assert.ok(v.find(r => r.navn === 'Europa').vekt > 25, 'Norge A og Kairos gir stor Europa-andel');
});

test('Morningstar-fond blir produkt med CMA-anslag, valuta og eksponering', async () => {
  const { lagProduktFraMorningstar, cmaKlasseForMorningstarFond } = await import('../lib/pensumCore.js');
  const fs = await import('node:fs');
  const univers = JSON.parse(fs.readFileSync(new URL('../public/data/eksterne-fond.json', import.meta.url)));
  const svensk = univers.find(f => f.cSE > 80);
  const { produkt, eksponering } = lagProduktFraMorningstar(svensk);
  assert.equal(produkt.id, `ms-${svensk.isin}`);
  assert.equal(produkt.valuta, 'SEK');
  assert.equal(produkt.forventetAvkastning, 9.0, 'nordiske aksjer');
  naer(eksponering.regioner.reduce((s, r) => s + r.vekt, 0), 100, 0.15, 'regioner inkl. Other');
  assert.equal(cmaKlasseForMorningstarFond({ cat: 'Europe Fixed Income' }), 'ig');
  assert.equal(cmaKlasseForMorningstarFond({ cat: 'Emerging Markets Fixed Income' }), 'hy');
  assert.equal(cmaKlasseForMorningstarFond({ cat: 'Global Emerging Markets Equity' }), 'emAksjer');
  assert.equal(lagProduktFraMorningstar({ isin: 'X', n: 'Rente', cat: 'Global Fixed Income', cur: 'Euro' }).produkt.aktivatype, 'rente');
});

test('rentefond fra Morningstar klassifiseres etter navn (høyrente, stat, IG)', async () => {
  const { cmaKlasseForMorningstarFond } = await import('../lib/pensumCore.js');
  assert.equal(cmaKlasseForMorningstarFond({ n: 'AXAWF US High Yield Bonds I Cap USD', cat: 'US Fixed Income' }), 'hy');
  assert.equal(cmaKlasseForMorningstarFond({ n: 'JPM EU Government Bond C (acc) EUR', cat: 'Europe Fixed Income' }), 'stat');
  assert.equal(cmaKlasseForMorningstarFond({ n: 'Storm Nordic High Yield', cat: 'Europe Fixed Income' }), 'nordiskHy');
  assert.equal(cmaKlasseForMorningstarFond({ n: 'Arctic Nordic Investment Grade B', cat: 'Europe Fixed Income' }), 'ig');
});

test('kostnader: honorartrinn, andelsklasse etter beløp og ingen dobbeltbelastning på egne fond', async () => {
  const { beregnKostnader, velgAndelsklasse, honorarTrinnForBelop } = await import('../lib/pensumCore.js');
  assert.equal(honorarTrinnForBelop(4_999_999).sats, 1.25);
  assert.equal(honorarTrinnForBelop(5_000_000).sats, 1.05);
  assert.equal(honorarTrinnForBelop(150_000_000).sats, 0.75);
  const klasser = [{ klasse: 'A', minBelop: 0, lopendeKostnad: 1.5 }, { klasse: 'B', minBelop: 5_000_000, lopendeKostnad: 1.0 }];
  assert.equal(velgAndelsklasse(klasser, 4_000_000).klasse, 'A');
  assert.equal(velgAndelsklasse(klasser, 5_000_000).klasse, 'B');
  const produkter = [
    { id: 'eget', navn: 'Eget fond', honorar: false, andelsklasser: klasser },
    { id: 'mandat', navn: 'Mandat', lopendeKostnad: 0.5 },
    { id: 'ukjent', navn: 'Ukjent fond' }
  ];
  const k = beregnKostnader([{ id: 'eget', vekt: 40 }, { id: 'mandat', vekt: 40 }, { id: 'ukjent', vekt: 20 }], produkter, 10_000_000);
  const [eget, mandat, ukjent] = k.linjer;
  assert.equal(eget.andelsklasse, 'A'); assert.equal(eget.honorarPst, 0); naer(eget.kroner, 60_000, 0.01, 'eget fond');
  assert.equal(eget.nesteKlasse.klasse, 'B'); naer(eget.nesteKlasse.mangler, 1_000_000, 0.01, 'mangler til B');
  naer(mandat.kroner, 4_000_000 * (1.05 + 0.5) / 100, 0.01, 'mandat');
  naer(ukjent.kroner, 2_000_000 * 1.05 / 100, 0.01, 'ukjent fond: bare honorar');
  assert.deepEqual(k.mangler, ['Ukjent fond']);
  naer(k.pst, (k.kroner / 10_000_000) * 100, 1e-9, 'prosent');
});

test('parseBelop: norske beløp med mellomrom, punktum og øre', async () => {
  const { parseBelop } = await import('../lib/pensumCore.js');
  assert.equal(parseBelop('5 000 000'), 5000000);
  assert.equal(parseBelop('5 000 000,00'), 5000000);
  assert.equal(parseBelop('5.000.000,50 kr'), 5000000);
  assert.equal(parseBelop('1 250 000,'), 1250000);
  assert.equal(parseBelop('12,345'), 12345);
  assert.ok(Number.isNaN(parseBelop('')));
  assert.ok(Number.isNaN(parseBelop(null)));
});

test('fall fra topp: største fall, datoer og innhenting', async () => {
  const { beregnFallFraTopp, byggPortefoljeSerie, beregnPortefoljeStatistikk, periodeStartDato } = await import('../lib/pensumCore.js');
  const serie = [100, 110, 99, 88, 104.5, 110, 121, 115].map((verdi, i) => ({ dato: `2025-01-${String(i + 1).padStart(2, '0')}`, verdi }));
  const f = beregnFallFraTopp(serie);
  naer(f.storsteFall, -20, 1e-9, 'største fall');
  assert.equal(f.toppDato, '2025-01-02');
  assert.equal(f.bunnDato, '2025-01-04');
  assert.equal(f.hentetInnDato, '2025-01-06');
  naer(f.fallNaa, (115 / 121 - 1) * 100, 1e-9, 'fall nå');
  assert.equal(f.serie.length, 8);
  assert.equal(beregnFallFraTopp(serie.slice(0, 4)).hentetInnDato, null);
  assert.equal(beregnFallFraTopp(serie.slice(0, 1)), null);

  // Porteføljeserien gir samme største fall som nøkkeltallene i tabellen.
  const allokering = [{ id: 'global-core-active', vekt: 60 }, { id: 'global-hoyrente', vekt: 40 }];
  const start = periodeStartDato(3);
  const port = byggPortefoljeSerie(allokering, DATAFEED_PRODUKT_HISTORIKK, start);
  assert.ok(port.length > 500);
  const stat = beregnPortefoljeStatistikk(allokering, DATAFEED_PRODUKT_HISTORIKK, start);
  naer(beregnFallFraTopp(port).storsteFall, stat.maxDrawdown, 0.05, 'samme metode som porteføljestatistikken');
  assert.deepEqual(byggPortefoljeSerie([{ id: 'finnes-ikke', vekt: 100 }], DATAFEED_PRODUKT_HISTORIKK, start), []);
});

test('øvrige investeringer: rensing, fremskrivning og totalbilde', async () => {
  const { TILLEGG_TYPER, rensTillegg, tilleggAvkastning, fremskrivTillegg, beregnTotalbilde } = await import('../lib/pensumCore.js');
  const liste = rensTillegg([
    { id: 'a', navn: 'Hytte på Hvaler', type: 'eiendom', belop: 8000000 },
    { id: 'b', navn: 'DNB-fond', type: 'aksjer', belop: '3000000', avkastning: 7 },
    { id: 'c', navn: '', type: 'finnes-ikke', belop: 500000 },
    { id: 'd', navn: 'Uten beløp', type: 'renter', belop: -5 },
    null,
  ]);
  assert.equal(liste.length, 4);
  assert.equal(liste[2].type, 'annet'); assert.equal(liste[2].navn, 'Annet'); assert.equal(liste[3].belop, 0);
  assert.equal(tilleggAvkastning(liste[0]), TILLEGG_TYPER.eiendom.avk);
  assert.equal(tilleggAvkastning(liste[1]), 7);
  assert.equal(tilleggAvkastning(liste[2]), 0, '«Annet» uten oppgitt avkastning vokser ikke');
  const f = fremskrivTillegg(liste, 10);
  assert.equal(f.length, 11);
  assert.equal(f[0].total, 11500000);
  naer(f[10].verdier[1], 3000000 * Math.pow(1.07, 10), 1, 'renters rente');
  assert.equal(f[10].verdier.length, 3, 'linjer uten beløp er ikke med');
  const t = beregnTotalbilde({ pensumBelop: 10000000, pensumKlasser: [{ name: 'Aksjer', value: 50 }, { name: 'Renter', value: 50 }, { name: 'Kontanter', value: 0 }], pensumAvkastning: 8, tillegg: liste });
  assert.equal(t.total, 21500000); assert.equal(t.ovrig, 11500000);
  naer(t.pensumAndel + t.ovrigAndel, 100, 1e-9, 'andeler');
  assert.deepEqual(t.klasser.map((k) => [k.navn, k.belop]), [['Aksjer', 8000000], ['Renter', 5000000], ['Alternativer', 8000000], ['Annet', 500000]]);
  naer(t.klasser.reduce((s, k) => s + k.andel, 0), 100, 1e-9, 'klasser summerer til 100');
  naer(t.totalAvkastning, (10000000 * 8 + 8000000 * TILLEGG_TYPER.eiendom.avk + 3000000 * 7 + 0) / 21500000, 1e-9, 'vektet avkastning');
  assert.deepEqual(t.manglerAvkastning, ['Annet']);
  assert.equal(beregnTotalbilde({ pensumBelop: 0, tillegg: [] }), null);
  assert.equal(rensTillegg(Array.from({ length: 30 }, () => ({ type: 'aksjer', belop: 1 }))).length, 20);
});
