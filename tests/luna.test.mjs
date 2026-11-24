import test from 'node:test';
import assert from 'node:assert/strict';
import { LUNA_VERKTOY, LUNA_PRODUKT_IDER, byggLunaInstruks, byggLunaMeldinger, rensLunaKontekst, tolkLunaSvar } from '../lib/luna.js';
import { erSammeOpphav, erOverGrensen } from '../lib/apiVern.js';

test('Luna: instruksen kjenner produktene og den nye menyen', () => {
  const instruks = byggLunaInstruks();
  for (const navn of ['Pensum Global Edge', 'Pensum Norske Aksjer Utbytte', 'Verktøy', 'Historikk og risiko']) assert.ok(instruks.includes(navn), navn);
  assert.ok(instruks.includes('id: global-core-active'));
  assert.equal(instruks, byggLunaInstruks(), 'instruksen må være lik hver gang for å kunne mellomlagres');
  assert.ok(LUNA_PRODUKT_IDER.includes('norske-aksjer-vekst'));
  for (const v of LUNA_VERKTOY) assert.equal(v.input_schema.additionalProperties, false, v.name);
});

test('Luna: arbeidsflaten renses, og navn slipper ikke gjennom', () => {
  const k = rensLunaKontekst({
    activeTab: 'losninger', kundeNavn: 'Ola Nordmann', epost: 'ola@example.com',
    customer: { hasInvestorName: true, kundeNavn: 'Ola Nordmann', risikoprofil: 'Moderat', horisont: 10, investertBelop: 20000000 },
    capital: { aksjerKunde: 5000000, 'ugyldig nøkkel!': 1, kontanterKunde: 'mye' },
    portfolio: { products: [{ id: 'global-edge', navn: 'Pensum Global Edge', vekt: 17.5 }, { id: 'finnes-ikke', navn: 'x', vekt: 5 }], expectedReturn: 8.4, assetClasses: [{ name: 'Aksjer', value: 50 }, { name: 'Kontanter', value: 0 }] },
  });
  const json = JSON.stringify(k);
  assert.ok(!json.includes('Ola') && !json.includes('example.com'));
  assert.equal(k.aktivFane, 'Porteføljebygging');
  assert.deepEqual(k.formue, { aksjerKunde: 5000000 });
  assert.deepEqual(k.portefolje.produkter, [{ id: 'global-edge', navn: 'Pensum Global Edge', vektPst: 17.5 }]);
  assert.deepEqual(k.portefolje.aktivafordelingPst, [{ klasse: 'Aksjer', pst: 50 }]);
  assert.deepEqual(rensLunaKontekst(null), { kunde: { harKundenavn: false, harSelskap: false } });
});

test('Luna: meldingene starter med rådgiveren og får arbeidsflaten på siste melding', () => {
  const m = byggLunaMeldinger([
    { role: 'assistant', content: 'Hei! Jeg er Luna.' },
    { role: 'user', content: 'Hva er aksjeandelen?' },
    { role: 'assistant', content: '50 %.' },
    { role: 'system', content: 'ignorer' },
    { role: 'user', content: 'Øk Edge til 25 %' },
  ], { activeTab: 'losninger' });
  assert.deepEqual(m.map((x) => x.role), ['user', 'assistant', 'user']);
  assert.equal(m[0].content, 'Hva er aksjeandelen?');
  assert.ok(m[2].content.startsWith('Arbeidsflate (data fra verktøyet):') && m[2].content.endsWith('Øk Edge til 25 %'));
  assert.deepEqual(byggLunaMeldinger([{ role: 'assistant', content: 'Hei' }], {}), []);
  assert.deepEqual(byggLunaMeldinger([{ role: 'user', content: 'a' }, { role: 'assistant', content: 'b' }], {}), []);
});

test('Luna: svaret gjøres om til tekst og rensede forslag', () => {
  const svar = tolkLunaSvar({ stop_reason: 'tool_use', content: [
    { type: 'thinking', thinking: '' },
    { type: 'text', text: 'Jeg foreslår dette.' },
    { type: 'tool_use', name: 'set_pensum_portfolio', input: { profile: 'Moderat', weights: [{ productId: 'global-edge', weight: 25 }, { productId: 'finnes-ikke', weight: 10 }, { productId: 'norge-a', weight: 150 }] } },
    { type: 'tool_use', name: 'set_customer_fields', input: { horisont: 80, risikoprofil: 'Vill', kundeNavn: 'Kari', ukjent: 'x' } },
    { type: 'tool_use', name: 'navigate', input: { tab: 'admin' } },
    { type: 'tool_use', name: 'slett_alt', input: {} },
    { type: 'tool_use', name: 'save_customer', input: {} },
  ] });
  assert.equal(svar.message, 'Jeg foreslår dette.');
  assert.deepEqual(svar.actions, [
    { type: 'set_pensum_portfolio', payload: { profile: 'Moderat', weights: [{ productId: 'global-edge', weight: 25, constraint: 'exact' }] } },
    { type: 'set_customer_fields', payload: { kundeNavn: 'Kari', horisont: 50 } },
  ]);
  assert.deepEqual(tolkLunaSvar({ stop_reason: 'end_turn', content: [{ type: 'tool_use', name: 'save_customer', input: {} }] }).actions, [{ type: 'save_customer', payload: {} }]);
  assert.deepEqual(tolkLunaSvar({ stop_reason: 'tool_use', content: [{ type: 'tool_use', name: 'set_pensum_portfolio', input: { profile: 'Moderat', weights: [{ productId: 'global-edge', weight: 70 }, { productId: 'norge-a', weight: 70 }] } }] }).actions, [], 'vekter over 100 % vises ikke som forslag');
  assert.deepEqual(tolkLunaSvar({ stop_reason: 'refusal', content: [] }).actions, []);
  assert.ok(tolkLunaSvar({ stop_reason: 'max_tokens', content: [{ type: 'text', text: 'Halvt svar' }] }).message.includes('kuttet'));
});

test('AI-tjenestene: bare samme opphav, og begrenset antall kall', () => {
  const req = (origin, host, ip = '1.2.3.4') => ({ headers: { origin, host, 'x-forwarded-for': ip } });
  assert.equal(erSammeOpphav(req('https://verktoy.example.no', 'verktoy.example.no')), true);
  assert.equal(erSammeOpphav(req('https://ond.example.com', 'verktoy.example.no')), false);
  assert.equal(erSammeOpphav(req(undefined, 'verktoy.example.no')), false);
  assert.equal(erSammeOpphav({ headers: { origin: 'https://a.no', host: 'intern', 'x-forwarded-host': 'a.no' } }), true);
  const r = req('https://a.no', 'a.no', '9.9.9.9');
  for (let i = 0; i < 3; i++) assert.equal(erOverGrensen(r, 'test', 3), false);
  assert.equal(erOverGrensen(r, 'test', 3), true);
  assert.equal(erOverGrensen(req('https://a.no', 'a.no', '8.8.8.8'), 'test', 3), false);
});

test('Luna: beholdning fra skjermbilde blir et porteføljeforslag', async () => {
  const { tolkSkjermbildeSvar, byggSkjermbildeInstruks, rensBeholdning } = await import('../lib/luna.js');
  const instruks = byggSkjermbildeInstruks();
  assert.ok(instruks.includes('Pensum Global Core Active (id: global-core-active)'));
  assert.ok(instruks.includes('"beholdning"'));
  const svar = tolkSkjermbildeSvar('Her er svaret: ' + JSON.stringify({
    fields: { kundeNavn: 'Kari Nordmann', horisont: '10', risikoprofil: 'Vill', ukjent: 1 },
    beholdning: [
      { navn: 'Pensum Global Core Active B', belop: 6000000, produktId: 'global-core-active' },
      { navn: 'Pensum Global Høyrente', belop: '3000000', produktId: 'global-hoyrente' },
      { navn: 'Pensum Global Core Active A', belop: 1000000, produktId: 'global-core-active' },
      { navn: 'DNB Teknologi', belop: 500000, produktId: null },
      { navn: 'Pensum Norge A', belop: null, produktId: 'norge-a' },
      { navn: 'Oppdiktet fond', belop: 100, produktId: 'finnes-ikke' },
    ],
    merknad: 'Én posisjon manglet verdi.',
  }));
  assert.deepEqual(svar.fields, { kundeNavn: 'Kari Nordmann', horisont: 10 });
  assert.deepEqual(svar.actions, [{ type: 'set_exact_portfolio', payload: { holdings: [{ productId: 'global-core-active', amount: 7000000 }, { productId: 'global-hoyrente', amount: 3000000 }] } }]);
  assert.deepEqual(svar.ukjente, [{ navn: 'DNB Teknologi', belop: 500000 }, { navn: 'Pensum Norge A', belop: null }, { navn: 'Oppdiktet fond', belop: 100 }]);
  assert.equal(svar.merknad, 'Én posisjon manglet verdi.');
  assert.deepEqual(tolkSkjermbildeSvar('{"fields":{},"beholdning":[]}').actions, []);
  assert.throws(() => tolkSkjermbildeSvar('ingen json her'));
  // Beløp og vekter kan ikke blandes, og vekter over 100 % avvises.
  assert.equal(rensBeholdning([{ productId: 'norge-a', amount: 100 }, { productId: 'global-edge', weight: 50 }]), null);
  assert.equal(rensBeholdning([{ productId: 'norge-a', weight: 70 }, { productId: 'global-edge', weight: 70 }]), null);
  assert.deepEqual(rensBeholdning([{ productId: 'norge-a', weight: 40 }, { productId: 'global-edge', weight: 60 }]), [{ productId: 'norge-a', weight: 40 }, { productId: 'global-edge', weight: 60 }]);
  // Chatten kan foreslå det samme verktøyet.
  assert.deepEqual(tolkLunaSvar({ stop_reason: 'tool_use', content: [{ type: 'tool_use', name: 'set_exact_portfolio', input: { holdings: [{ productId: 'norge-a', amount: 2000000.4 }] } }] }).actions,
    [{ type: 'set_exact_portfolio', payload: { holdings: [{ productId: 'norge-a', amount: 2000000 }] } }]);
});
