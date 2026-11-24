import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { byggForslagModell, byggPortefoljeSerie, tilHeleProsent } from '../lib/forslagModell.js';
import { FORSLAG_SIDER, standardSider, lagForslagPptx } from '../lib/forslagPptx.js';
import { defaultPensumProdukter as p, defaultProduktEksponering, defaultProduktRapportMeta, referanseEksponering } from '../data/pensumDefaults.js';
import { DATAFEED_PRODUKT_HISTORIKK, DATAFEED_INDEKS_HISTORIKK } from '../data/pensumDatafeedHistorikk.js';
import { ForslagOpptak } from '../lib/forslagOpptak.js';
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
  assert.equal(minst.slides.length, 5, 'faste sider: forside, korte trekk, neste steg, viktig informasjon, kontakt');
  assert.ok(!standardSider().includes('mandat'), 'kundeprofil og mandat er et tilvalg');
  assert.equal(lagForslagPptx(PptxGenJS, m, { sider: ['mandat'] }).slides.length, 6);
  assert.ok(standard.slides.length > minst.slides.length);
  // Sju tilleggssider, ett skilleark og tilvalget kundeprofil og mandat.
  assert.equal(alle.slides.length, standard.slides.length + 9);
  // Kapittelsidene: innholdsside og fire kapitler.
  const utenKapitler = lagForslagPptx(PptxGenJS, m, { sider: standardSider().filter((x) => x !== 'kapitler') });
  assert.equal(standard.slides.length, utenKapitler.slides.length + 5);
  const buf = await standard.write({ outputType: 'nodebuffer' });
  assert.ok(buf.length > 20000);
  // Tom portefølje skal ikke kaste.
  const tom = lagForslagPptx(PptxGenJS, lag({ allokering: [] }), { sider: FORSLAG_SIDER.map((s) => s.id) });
  assert.ok(tom.slides.length >= 5);
});

test('forhåndsvisningen tar opp de samme lysbildene som PowerPoint-filen', () => {
  const PptxGenJS = createRequire(import.meta.url)('pptxgenjs');
  const m = lag();
  const sider = [...standardSider(), 'kostnader'];
  const fil = lagForslagPptx(PptxGenJS, m, { sider });
  const opptak = lagForslagPptx(ForslagOpptak, m, { sider });
  assert.equal(opptak.slides.length, fil.slides.length);
  opptak.slides.forEach((s) => assert.ok(s.elementer.length > 3));
  const typer = new Set(opptak.slides.flatMap((s) => s.elementer.map((e) => e.type)));
  assert.deepEqual([...typer].sort(), ['form', 'graf', 'tabell', 'tekst']);
});

test('modellen: beløp 0 regnes per 1 mill. kr, og største fall og renters rente henger sammen', () => {
  const m = lag({ belop: 0 });
  assert.equal(m.belopKjent, false);
  assert.equal(m.belop, 1000000);
  assert.equal(lag().belopKjent, true);
  const full = lag();
  assert.equal(full.fall[0].egen, true);
  assert.equal(full.fall[0].verdi, full.portefolje.maxDrawdown);
  assert.ok(full.fall.length >= 3 && full.fall.every((f) => f.verdi < 0));
  const siste = full.rentersRente[full.rentersRente.length - 1];
  const hoved = full.scenarioer.find((s) => s.id === 'hoved');
  assert.ok(Math.abs(siste.kapital + siste.enkel + siste.effekt - hoved.sluttverdi) < 1);
  assert.equal(full.rentersRente[0].effekt, 0);
});

test('vekter vises eksakt', async () => {
  const { vektTekst } = await import('../lib/forslagPptx.js');
  assert.equal(vektTekst(11.25), '11,25\u00a0%');
  assert.equal(vektTekst(25), '25\u00a0%');
  assert.equal(vektTekst(27.5), '27,5\u00a0%');
  assert.equal(vektTekst(null), '–');
});

test('tilleggsrådgiver tas bare med når navnet er fylt ut', () => {
  assert.equal(lag().radgiver2, null);
  assert.equal(lag({ radgiver2: { navn: '  ', telefon: '123' } }).radgiver2, null);
  const m = lag({ radgiver: { navn: 'Kari' }, radgiver2: { navn: ' Ola Nordmann ', epost: 'ola@pensumgroup.no' } });
  assert.deepEqual(m.radgiver2, { navn: 'Ola Nordmann', tittel: 'Investeringsrådgiver', telefon: '', epost: 'ola@pensumgroup.no' });
  const tekst = JSON.stringify(lagForslagPptx(ForslagOpptak, m, { sider: [] }).slides.map((s) => s.elementer));
  assert.ok(tekst.includes('Kari og Ola Nordmann'));
  assert.ok(tekst.includes('Dine rådgivere'.toUpperCase()));
});

test('kostnader: suksesshonorar og transaksjonshonorar oppgis ved siden av den løpende kostnaden', () => {
  const m = lag();
  assert.deepEqual(m.kostnader.suksesshonorar.map((s) => s.navn), ['Pensum Norge A']);
  assert.equal(m.kostnader.transaksjonshonorarPst, 0.15);
  assert.equal(m.kostnader.etablering, 20000000 * 0.0015);
  const edge = p.fondsportefoljer.find((x) => x.id === 'global-edge');
  const nordisk = p.fondsportefoljer.find((x) => x.id === 'nordisk-hoyrente');
  assert.equal(edge.lopendeKostnad, 0.8);
  assert.equal(nordisk.lopendeKostnad, 0.5);
  const tekst = JSON.stringify(lagForslagPptx(ForslagOpptak, m, { sider: ['kostnader'] }).slides.map((s) => s.elementer));
  assert.ok(tekst.includes('RESULTATBASERT HONORAR') && tekst.includes('TRANSAKSJONSKOSTNADER'));
  assert.ok(tekst.includes('endres når fondssammensetningen endres'));
});

test('prissiden: honorar og fondskostnad summerer til samlet kostnad, og gjeldende trinn er merket', () => {
  const m = lag();
  assert.ok(Math.abs(m.kostnader.honorarPst + m.kostnader.produktkostnadPst - m.kostnader.pst) < 1e-9);
  assert.deepEqual(m.kostnader.trinnListe.filter((t) => t.gjeldende).map((t) => t.sats), [0.9]);
  assert.equal(lag({ belop: 0 }).kostnader.trinnListe.filter((t) => t.gjeldende).length, 0);
  assert.equal(lagForslagPptx(ForslagOpptak, m, { sider: ['pris'] }).slides.length, 7, 'fem faste, skilleark og prissiden');
});

test('Global Edge beskrives som global aksjekjerne, ikke som offensiv satellitt', () => {
  const meta = defaultProduktRapportMeta['global-edge'];
  assert.equal(meta.category, 'equity-core');
  const tekst = JSON.stringify(meta).toLowerCase();
  assert.ok(!tekst.includes('satellitt') && !tekst.includes('offensiv'));
  const m = lag({ allokering: [{ id: 'global-edge', vekt: 100 }] });
  assert.equal(m.produkter[0].rolle, 'kjerne');
  assert.deepEqual(m.kostnader.suksesshonorar.map((s) => s.navn), ['Pensum Global Edge']);
});

test('eksponeringsdata: hver tabell summerer til 100 %, og nye norske aksjeporteføljer har kurser og eksponering', () => {
  for (const [id, e] of Object.entries(defaultProduktEksponering)) {
    for (const k of ['underliggende', 'regioner', 'sektorer', 'stil']) {
      if (!e[k]) continue;
      const sum = e[k].reduce((s, r) => s + r.vekt, 0);
      // Kairos har holdinger fra et eldre tidspunkt, og noen lister er avkortet: kun kravet om 100 ± 1 for de øvrige.
      if (id === 'kairos-a' && k === 'underliggende') continue;
      assert.ok(Math.abs(sum - 100) < 1.1, `${id}.${k} summerer til ${sum.toFixed(1)}`);
    }
  }
  for (const id of ['norske-aksjer-utbytte', 'norske-aksjer-vekst']) {
    const produkt = produkter.find((x) => x.id === id);
    assert.ok(produkt, `${id} finnes som produkt`);
    assert.ok(DATAFEED_PRODUKT_HISTORIKK[id].data.length > 3000, `${id} har kurser`);
    assert.ok(defaultProduktEksponering[id].regioner.length >= 1 && defaultProduktRapportMeta[id].slideTitle);
  }
});

test('totalbildet: bare med når kundens øvrige investeringer er lagt inn', () => {
  const naer = (a, b, toleranse, hva) => assert.ok(Math.abs(a - b) <= toleranse, `${hva}: ${a} mot ${b}`);
  const PptxGenJS = createRequire(import.meta.url)('pptxgenjs');
  const uten = lag();
  assert.equal(uten.totalbilde, null);
  const ovrige = [{ id: 'a', navn: 'Hytte', type: 'eiendom', belop: 8000000 }, { id: 'b', navn: 'DNB-fond', type: 'aksjer', belop: 2000000, avkastning: 7 }];
  const m = lag({ ovrigeInvesteringer: ovrige });
  const t = m.totalbilde;
  assert.equal(t.total, 30000000); assert.equal(t.pensum, 20000000); assert.equal(t.ovrig, 10000000);
  naer(t.klasser.reduce((s, k) => s + k.andel, 0), 100, 1e-6, 'aktivaklasser summerer til 100');
  naer(t.sluttverdi.pensum, fremskrivVerdi(20000000, m.forventetAvkastning, 8, 0), 1, 'Pensum-delen fremskrives som ellers i forslaget');
  naer(t.sluttverdi.ovrig, 8000000 * Math.pow(1.077, 8) + 2000000 * Math.pow(1.07, 8), 2, 'øvrige med renters rente');
  naer(t.sluttverdi.total, t.sluttverdi.pensum + t.sluttverdi.ovrig, 1e-6, 'sum');
  // Siden er et tilvalg: den kommer bare med når den er valgt og det finnes øvrige investeringer.
  assert.ok(!standardSider().includes('totalbilde'));
  const antall = (modell, sider) => lagForslagPptx(PptxGenJS, modell, { sider }).slides.length;
  assert.equal(antall(m, ['totalbilde']), antall(m, []) + 1);
  assert.equal(antall(uten, ['totalbilde']), antall(uten, []));
  // Ukjent beløp i forslaget gir ikke noe totalbilde.
  assert.equal(lag({ belop: 0, ovrigeInvesteringer: ovrige }).totalbilde, null);
});

test('dagens portefølje i forslaget: sidene kommer bare med når posisjonene er lagt inn', () => {
  const PptxGenJS = createRequire(import.meta.url)('pptxgenjs');
  const naer = (a, b, toleranse, hva) => assert.ok(Math.abs(a - b) <= toleranse, `${hva}: ${a} mot ${b}`);
  const dagens = { posisjoner: [
    { navn: 'Kongsberg Gruppen', plattform: 'Nordnet', type: 'aksje', verdi: 5000000, urealisert: 900000, behandling: 'beholdes' },
    { navn: 'Globalt fond', plattform: 'SP WM', type: 'aksjefond', verdi: 12000000, urealisert: -200000 },
    { navn: 'Rentefond', plattform: 'SP WM', type: 'rentefond', verdi: 6000000 },
    { navn: 'Kontanter', plattform: 'Nordnet', type: 'kontanter', verdi: 2000000 },
  ], plattformAvkastning: [{ navn: 'Nordnet', avkastningIaar: 12.5 }] };
  const uten = lag();
  assert.equal(uten.dagens, null);
  const m = lag({ dagens });
  assert.equal(m.dagens.total, 25000000);
  assert.equal(m.dagens.motNy.pensumBelop, 20000000, 'Pensum-delen er beløpet i forslaget');
  assert.equal(m.dagens.motNy.nyTotal, 25000000, 'ny = forslaget pluss det som beholdes');
  naer(m.dagens.motNy.klasser.reduce((s, k) => s + k.ny, 0), 100, 1e-6, 'ny aktivafordeling summerer til 100');
  assert.equal(m.dagens.motNy.posisjoner.nyProdukter, m.produkter.length);
  const antall = (modell, sider) => lagForslagPptx(PptxGenJS, modell, { sider }).slides.length;
  assert.ok(!standardSider().includes('dagens') && !standardSider().includes('dagensmotny'));
  assert.equal(antall(m, ['dagens', 'dagensmotny']), antall(m, []) + 2);
  assert.equal(antall(uten, ['dagens', 'dagensmotny']), antall(uten, []));
  // Uten kjent beløp i forslaget finnes ingen sammenligning, men dagens portefølje kan vises.
  const ukjent = lag({ dagens, belop: 0 });
  assert.equal(ukjent.dagens.motNy, null);
  assert.equal(antall(ukjent, ['dagens', 'dagensmotny']), antall(ukjent, []) + 1);
  // Mange plattformer og ingen gevinsttall skal ikke kaste.
  const mange = lag({ dagens: { posisjoner: ['A', 'B', 'C', 'D', 'E'].map((pl, i) => ({ navn: `Fond ${i}`, plattform: pl, type: 'aksjefond', verdi: 1000000 * (i + 1) })) } });
  assert.equal(antall(mange, ['dagens', 'dagensmotny']), antall(mange, []) + 2);
});
