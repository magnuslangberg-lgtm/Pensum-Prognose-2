import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { byggForslagModell, byggPortefoljeSerie, tilHeleProsent } from '../lib/forslagModell.js';
import { FORSLAG_SIDER, standardSider, lagForslagPptx } from '../lib/forslagPptx.js';
import { defaultPensumProdukter as p, defaultProduktEksponering, defaultProduktRapportMeta, referanseEksponering } from '../data/pensumDefaults.js';
import { DATAFEED_PRODUKT_HISTORIKK, DATAFEED_INDEKS_HISTORIKK } from '../data/pensumDatafeedHistorikk.js';
import { oppdaterHistorikkTilRapportDato, periodeStartDato, fremskrivVerdi, beregnKostnader } from '../lib/pensumCore.js';

const produkter = [...p.enkeltfond, ...p.fondsportefoljer, ...p.eksterneFond, ...p.alternative];
const produktHistorikk = oppdaterHistorikkTilRapportDato(DATAFEED_PRODUKT_HISTORIKK);
const allokering = [
  { id: 'global-core-active', vekt: 30 }, { id: 'basis', vekt: 20 }, { id: 'global-hoyrente', vekt: 30 },
  { id: 'norge-a', vekt: 10 }, { id: 'gull', vekt: 5 }, { id: 'pengemarkedsfond', vekt: 5 }, { id: 'energy-a', vekt: 0 }
];
const lag = (ekstra = {}) => byggForslagModell({
  kundeNavn: 'Test Kunde', belop: 20000000, horisont: 8, risikoprofil: 'Moderat', dato: new Date(2026, 10, 10),
  allokering, produkter, produktRapportMeta: defaultProduktRapportMeta, produktEksponering: defaultProduktEksponering,
  produktHistorikk, indeksHistorikk: DATAFEED_INDEKS_HISTORIKK, referanseEksponering, ...ekstra
});

test('tilHeleProsent summerer alltid til 100', () => {
  assert.deepEqual(tilHeleProsent([62.5, 37.5]), [63, 37]);
  assert.equal(tilHeleProsent([33.3, 33.3, 33.4]).reduce((a, b) => a + b, 0), 100);
  assert.deepEqual(tilHeleProsent([]), []);
});

test('modellen: vekter, beløp og aktivafordeling henger sammen', () => {
  const m = lag();
  assert.equal(m.produkter.length, 6, 'produkter med vekt 0 er ikke med');
  assert.ok(Math.abs(m.produkter.reduce((s, x) => s + x.vekt, 0) - 100) < 1e-9);
  assert.ok(Math.abs(m.produkter.reduce((s, x) => s + x.belop, 0) - 20000000) < 1);
  assert.equal(m.aktivafordeling.reduce((s, a) => s + a.hel, 0), 100);
  // Basis (dynamisk) deles likt mellom aksjer og renter: 30 + 10 + 10 = 50 % aksjer.
  assert.equal(m.aktivafordeling.find((a) => a.navn === 'Aksjer').vekt, 50);
  assert.equal(m.aktivafordeling.find((a) => a.navn === 'Kontanter').vekt, 5);
  assert.ok(Math.abs(m.roller.reduce((s, r) => s + r.vekt, 0) - 100) < 1e-9);
});

test('modellen: scenarioene følger forventet avkastning og kostnadene følger kjernen', () => {
  const m = lag();
  const hoved = m.scenarioer.find((s) => s.id === 'hoved');
  assert.ok(Math.abs(hoved.sluttverdi - fremskrivVerdi(20000000, hoved.avkastning, 8)) < 1);
  const [svak, , sterk] = m.scenarioer;
  assert.ok(svak.sluttverdi < hoved.sluttverdi && hoved.sluttverdi < sterk.sluttverdi);
  assert.equal(m.scenarioSerie.length, 9);
  assert.equal(m.scenarioSerie[0].hoved, 20000000);
  assert.equal(m.kostnader.kroner, beregnKostnader(allokering.filter((a) => a.vekt > 0), produkter, 20000000).kroner);
  assert.equal(lag({ forventetAvkastning: 6 }).forventetAvkastning, 6);
});

test('modellen: historikken starter på 0 og oppgir produkter uten kurshistorikk', () => {
  const m = lag();
  assert.equal(m.historikk.portefolje[0], 0);
  assert.ok(m.historikk.datoer.length > 30);
  assert.deepEqual(m.historikk.utenHistorikk.sort(), ['Gull', 'Pengemarkedsfond']);
  m.historikk.referanser.forEach((r) => assert.equal(r.verdier.length, m.historikk.datoer.length));
  const serie = byggPortefoljeSerie([{ id: 'finnes-ikke', vekt: 100 }], produktHistorikk, periodeStartDato(3));
  assert.deepEqual(serie.punkter, []);
});

test('presentasjonen bygges med alle sider og med bare standardsidene', async () => {
  const PptxGenJS = createRequire(import.meta.url)('pptxgenjs');
  const m = lag();
  const alle = lagForslagPptx(PptxGenJS, m, { sider: FORSLAG_SIDER.map((s) => s.id) });
  const standard = lagForslagPptx(PptxGenJS, m, { sider: standardSider() });
  const minst = lagForslagPptx(PptxGenJS, m, { sider: [] });
  assert.equal(minst.slides.length, 5, 'faste sider: forside, korte trekk, mandat, neste steg, viktig informasjon');
  assert.ok(standard.slides.length > minst.slides.length);
  // Seks tilleggssider og ett skilleark.
  assert.equal(alle.slides.length, standard.slides.length + 7);
  const buf = await standard.write({ outputType: 'nodebuffer' });
  assert.ok(buf.length > 20000);
  // Tom portefølje skal ikke kaste.
  const tom = lagForslagPptx(PptxGenJS, lag({ allokering: [] }), { sider: FORSLAG_SIDER.map((s) => s.id) });
  assert.ok(tom.slides.length >= 5);
});
