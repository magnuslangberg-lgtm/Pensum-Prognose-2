import test from 'node:test';
import assert from 'node:assert/strict';
import { analyserDagens, beholdteSomTillegg, erTilleggFraDagens, rensPosisjoner, rensPlattformAvkastning, sammenlignDagensMotNy } from '../lib/dagensPortefolje.js';

const naer = (a, b, toleranse, hva) => assert.ok(Math.abs(a - b) <= toleranse, `${hva}: ${a} mot ${b}`);
// Samme hovedtall som eksempelet fra rådgiverne: Nordnet og SP WM, 6 089 415 kr.
const posisjoner = [
  { id: 'a', navn: 'Kongsberg Gruppen', plattform: 'Nordnet', type: 'aksje', verdi: 696000, urealisert: 150000, behandling: 'beholdes' },
  { id: 'b', navn: 'Øvrige enkeltaksjer', plattform: 'Nordnet', type: 'aksje', verdi: 1329328, urealisert: 99294, behandling: 'beholdes' },
  { id: 'c', navn: 'SGA Global Growth', plattform: 'Nordnet', type: 'aksjefond', verdi: 186440, urealisert: 11011 },
  { id: 'd', navn: 'Schroder Global Recovery', plattform: 'SP WM', type: 'aksjefond', verdi: 1564945, urealisert: 80000 },
  { id: 'e', navn: 'AB Nordic Investment Grade', plattform: 'SP WM', type: 'rentefond', verdi: 931000, urealisert: 74190 },
  { id: 'f', navn: 'AB Nordic High Yield', plattform: 'SP WM', type: 'rentefond', verdi: 659712, urealisert: 60000 },
  { id: 'g', navn: 'Kontanter', plattform: 'Nordnet', type: 'kontanter', verdi: 713324 },
  { id: 'h', navn: 'Kontanter', plattform: 'SP WM', type: 'kontanter', verdi: 8666 },
];

test('dagens portefølje: analysen stemmer med tallene i eksempelet', () => {
  const a = analyserDagens(posisjoner, [{ navn: 'Nordnet', avkastningIaar: 18.9 }, { navn: 'SP WM', avkastningIaar: '0.8' }, { navn: 'Tom', avkastningIaar: '' }]);
  assert.equal(a.total, 6089415);
  assert.deepEqual(a.plattformer, ['Nordnet', 'SP WM']);
  assert.deepEqual(a.perPlattform.map((p) => p.total), [2925092, 3164323]);
  assert.deepEqual(a.perType.map((t) => [t.navn, t.antall, t.total]), [['Enkeltaksjer', 2, 2025328], ['Aksjefond', 2, 1751385], ['Rentefond', 2, 1590712], ['Kontanter', 2, 721990]]);
  assert.deepEqual(a.perType.map((t) => Number(t.andel.toFixed(1))), [33.3, 28.8, 26.1, 11.9]);
  assert.deepEqual(a.perType[1].perPlattform, { Nordnet: 186440, 'SP WM': 1564945 });
  assert.equal(a.perType[0].urealisert, 249294);
  assert.equal(a.perType[3].urealisert, null, 'kontanter har ingen gevinst');
  assert.equal(a.urealisert, 474495);
  assert.equal(a.antallPosisjoner, 6); assert.equal(a.antallFond, 4); assert.equal(a.antallEnkeltaksjer, 2);
  naer(a.kontanter.andel, 11.9, 0.05, 'kontantandel');
  assert.equal(a.storste[0].navn, 'Schroder Global Recovery');
  assert.ok(!a.storste.some((s) => s.navn === 'Kontanter'), 'kontanter er ikke en enkeltposisjon');
  naer(a.klasser.reduce((s, k) => s + k.andel, 0), 100, 1e-9, 'aktivaklasser summerer til 100');
  assert.deepEqual(a.klasser.map((k) => k.navn), ['Aksjer', 'Renter', 'Kontanter']);
  assert.equal(a.beholdes, 2025328); assert.equal(a.flyttes, 6089415 - 2025328);
  assert.deepEqual(a.plattformAvkastning, [{ navn: 'Nordnet', avkastningIaar: 18.9 }, { navn: 'SP WM', avkastningIaar: 0.8 }]);
  assert.equal(analyserDagens([]), null);
  assert.equal(analyserDagens([{ navn: 'Tom', type: 'aksje', verdi: 0 }]), null);
});

test('dagens portefølje: rensing og det som beholdes utenfor Pensum', () => {
  const renset = rensPosisjoner([{ navn: '  ', type: 'ukjent', verdi: '1 000', urealisert: '' }, { navn: 'X', type: 'aksje', verdi: 500.4, urealisert: -20.6, behandling: 'beholdes' }, null, 'tekst']);
  assert.equal(renset.length, 2);
  assert.deepEqual([renset[0].type, renset[0].navn, renset[0].verdi, renset[0].urealisert, renset[0].behandling], ['annet', 'Annet', 0, null, 'flyttes']);
  assert.deepEqual([renset[1].verdi, renset[1].urealisert, renset[1].behandling], [500, -21, 'beholdes']);
  assert.deepEqual(rensPlattformAvkastning([{ navn: 'A', avkastningIaar: 9999 }, { navn: '', avkastningIaar: 5 }]), []);

  const tillegg = beholdteSomTillegg(posisjoner);
  assert.deepEqual(tillegg.map((t) => [t.navn, t.type, t.belop]), [['Kongsberg Gruppen', 'aksjer', 696000], ['Øvrige enkeltaksjer', 'aksjer', 1329328]]);
  assert.ok(tillegg.every(erTilleggFraDagens));
  assert.equal(erTilleggFraDagens({ id: 't-123' }), false);
  // Mange beholdte posisjoner slås sammen per type.
  const mange = Array.from({ length: 15 }, (_, i) => ({ navn: `Aksje ${i}`, type: 'aksje', verdi: 1000, behandling: 'beholdes' }));
  assert.deepEqual(beholdteSomTillegg(mange).map((t) => [t.navn, t.belop]), [['Enkeltaksjer (15 posisjoner)', 15000]]);
});

test('dagens portefølje mot ny: aktivafordeling og nøkkeltall', () => {
  const a = analyserDagens(posisjoner);
  const s = sammenlignDagensMotNy(a, {
    pensumBelop: a.flyttes, pensumProdukter: 8, pensumAvkastning: 8.8,
    pensumKlasser: [{ name: 'Aksjer', value: 60 }, { name: 'Renter', value: 30 }, { name: 'Alternativer', value: 10 }, { name: 'Kontanter', value: 0 }],
    beholdt: a.beholdtePosisjoner,
  });
  assert.equal(s.nyTotal, a.total, 'alt som ikke flyttes, beholdes');
  naer(s.klasser.reduce((sum, k) => sum + k.ny, 0), 100, 1e-9, 'ny summerer til 100');
  naer(s.klasser.reduce((sum, k) => sum + k.dagens, 0), 100, 1e-9, 'dagens summerer til 100');
  naer(s.aksjeandel.ny, ((a.flyttes * 0.6 + 2025328) / a.total) * 100, 1e-9, 'aksjeandel ny: Pensum-delen pluss egne aksjer');
  naer(s.kontanter.dagens, 11.86, 0.01, 'kontanter i dag'); assert.equal(s.kontanter.ny, 0);
  assert.deepEqual(s.klasser.map((k) => k.navn), ['Aksjer', 'Renter', 'Alternativer', 'Kontanter']);
  assert.deepEqual(s.posisjoner, { dagens: 6, nyProdukter: 8, nyBeholdt: 2 });
  assert.equal(s.forventetAvkastning, 8.8);
  assert.equal(sammenlignDagensMotNy(null, {}), null);
  assert.equal(sammenlignDagensMotNy(a, { pensumBelop: 0, beholdt: [] }), null);
});

test('dagens portefølje: svaret fra Luna renses til en posisjonsliste', async () => {
  const { byggDagensInstruks, tolkDagensSvar } = await import('../lib/luna.js');
  assert.ok(byggDagensInstruks().includes('rentefond') && byggDagensInstruks().includes('"posisjoner"'));
  const svar = tolkDagensSvar('```json\n' + JSON.stringify({
    posisjoner: [
      { navn: 'Kongsberg Gruppen', plattform: 'Nordnet', type: 'aksje', verdi: 696000, urealisert: 150000 },
      { navn: 'AB Nordic High Yield', plattform: 'SP WM', type: 'rentefond', verdi: '660000', urealisert: null },
      { navn: 'Fond i USD', plattform: 'SP WM', type: 'aksjefond', verdi: null },
      { navn: 'Rart papir', type: 'obligasjonslån', verdi: 5000, behandling: 'beholdes' },
    ],
    plattformer: [{ navn: 'Nordnet', avkastningIaar: 18.9 }, { navn: 'SP WM', avkastningIaar: null }],
    merknad: 'Ett fond stod bare i USD.',
  }) + '\n```');
  assert.deepEqual(svar.posisjoner, [
    { navn: 'Kongsberg Gruppen', plattform: 'Nordnet', type: 'aksje', verdi: 696000, urealisert: 150000 },
    { navn: 'AB Nordic High Yield', plattform: 'SP WM', type: 'rentefond', verdi: 660000, urealisert: null },
    { navn: 'Rart papir', plattform: '', type: 'annet', verdi: 5000, urealisert: null },
  ]);
  assert.deepEqual(svar.utenVerdi, ['Fond i USD']);
  assert.deepEqual(svar.plattformer, [{ navn: 'Nordnet', avkastningIaar: 18.9 }]);
  assert.throws(() => tolkDagensSvar('ingen json'));
});
