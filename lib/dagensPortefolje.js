// Kundens dagens portefølje: posisjonene kunden har i dag, ofte hos andre banker, og en
// analyse av dem som regnes ut fra tallene. Ren logikk uten nettverkskall, slik at den kan testes.
import { erGyldigTall } from './pensumCore.js';

// Typen styrer hvilken aktivaklasse posisjonen teller som, og hva den blir til hvis den
// beholdes utenfor Pensum (se TILLEGG_TYPER i pensumCore).
export const DAGENS_TYPER = {
  aksje: { navn: 'Enkeltaksjer', klasse: 'Aksjer', tillegg: 'aksjer', fond: false },
  aksjefond: { navn: 'Aksjefond', klasse: 'Aksjer', tillegg: 'aksjer', fond: true },
  rentefond: { navn: 'Rentefond', klasse: 'Renter', tillegg: 'renter', fond: true },
  kombinasjonsfond: { navn: 'Kombinasjonsfond', klasse: 'Blandet', tillegg: 'annet', fond: true },
  kontanter: { navn: 'Kontanter', klasse: 'Kontanter', tillegg: 'kontanter', fond: false },
  eiendom: { navn: 'Eiendom', klasse: 'Alternativer', tillegg: 'eiendom', fond: false },
  pe: { navn: 'Private equity og unotert', klasse: 'Alternativer', tillegg: 'pe', fond: false },
  annet: { navn: 'Annet', klasse: 'Annet', tillegg: 'annet', fond: false },
};
export const DAGENS_MAKS = 80;
const KLASSEREKKEFOLGE = ['Aksjer', 'Renter', 'Blandet', 'Alternativer', 'Kontanter', 'Annet'];
const TYPEREKKEFOLGE = Object.keys(DAGENS_TYPER);

const tallEllerNull = (v) => {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

// Renser en posisjonsliste: kjent type, verdi over 0, og urealisert gevinst bare når den er oppgitt.
export const rensPosisjoner = (liste = []) => (Array.isArray(liste) ? liste : [])
  .filter((x) => x && typeof x === 'object')
  .slice(0, DAGENS_MAKS)
  .map((x, i) => {
    const type = DAGENS_TYPER[x.type] ? x.type : 'annet';
    const verdi = tallEllerNull(x.verdi);
    const gevinst = tallEllerNull(x.urealisert);
    return {
      id: String(x.id || `pos-${i}`).slice(0, 60),
      navn: String(x.navn || '').trim().slice(0, 100) || DAGENS_TYPER[type].navn,
      plattform: String(x.plattform || '').trim().slice(0, 40),
      type,
      verdi: verdi !== null && verdi > 0 ? Math.min(1e12, Math.round(verdi)) : 0,
      urealisert: gevinst !== null ? Math.max(-1e12, Math.min(1e12, Math.round(gevinst))) : null,
      // Standard er at posisjonen flyttes til Pensum. Det som beholdes, blir kundens øvrige investeringer.
      behandling: x.behandling === 'beholdes' ? 'beholdes' : 'flyttes',
    };
  });

// Avkastning hittil i år per plattform, slik den står i kildedokumentene. Verktøyet har ikke
// kurshistorikk for eksterne posisjoner og kan ikke regne dette ut selv.
export const rensPlattformAvkastning = (liste = []) => (Array.isArray(liste) ? liste : [])
  .filter((x) => x && typeof x === 'object' && String(x.navn || '').trim())
  .slice(0, 8)
  .map((x) => ({ navn: String(x.navn).trim().slice(0, 40), avkastningIaar: tallEllerNull(x.avkastningIaar) }))
  .filter((x) => x.avkastningIaar !== null && Math.abs(x.avkastningIaar) <= 500);

const sum = (liste, f) => liste.reduce((s, x) => s + f(x), 0);

// Analysen av dagens portefølje. Alt her er regnet ut fra posisjonene; ingenting er vurderinger.
export const analyserDagens = (posisjoner = [], plattformAvkastning = []) => {
  const pos = rensPosisjoner(posisjoner).filter((x) => x.verdi > 0);
  const total = sum(pos, (x) => x.verdi);
  if (!(total > 0)) return null;
  const plattformer = [...new Set(pos.map((x) => x.plattform).filter(Boolean))];
  const utenKontanter = pos.filter((x) => x.type !== 'kontanter');
  const harGevinst = pos.some((x) => x.urealisert !== null);

  const perType = TYPEREKKEFOLGE.map((type) => {
    const rader = pos.filter((x) => x.type === type);
    if (!rader.length) return null;
    const belop = sum(rader, (x) => x.verdi);
    return {
      type, navn: DAGENS_TYPER[type].navn, antall: rader.length, total: belop, andel: (belop / total) * 100,
      perPlattform: Object.fromEntries(plattformer.map((pl) => [pl, sum(rader.filter((x) => x.plattform === pl), (x) => x.verdi)])),
      urealisert: rader.some((x) => x.urealisert !== null) ? sum(rader, (x) => x.urealisert || 0) : null,
    };
  }).filter(Boolean);

  const klasser = new Map();
  pos.forEach((x) => { const k = DAGENS_TYPER[x.type].klasse; klasser.set(k, (klasser.get(k) || 0) + x.verdi); });
  const kontanter = sum(pos.filter((x) => x.type === 'kontanter'), (x) => x.verdi);
  const storste = utenKontanter.slice().sort((a, b) => b.verdi - a.verdi).slice(0, 8)
    .map((x) => ({ navn: x.navn, verdi: x.verdi, andel: (x.verdi / total) * 100, type: x.type }));
  const flyttes = sum(pos.filter((x) => x.behandling === 'flyttes'), (x) => x.verdi);

  return {
    total,
    antallPosisjoner: utenKontanter.length,
    antallFond: pos.filter((x) => DAGENS_TYPER[x.type].fond).length,
    antallEnkeltaksjer: pos.filter((x) => x.type === 'aksje').length,
    harKontanter: kontanter > 0,
    plattformer,
    perPlattform: plattformer.map((pl) => ({ navn: pl, total: sum(pos.filter((x) => x.plattform === pl), (x) => x.verdi) })),
    perType,
    klasser: KLASSEREKKEFOLGE.filter((k) => klasser.has(k)).map((navn) => ({ navn, belop: klasser.get(navn), andel: (klasser.get(navn) / total) * 100 })),
    kontanter: { belop: kontanter, andel: (kontanter / total) * 100 },
    storste,
    storsteAndel: storste[0]?.andel ?? 0,
    urealisert: harGevinst ? sum(pos, (x) => x.urealisert || 0) : null,
    flyttes, beholdes: total - flyttes,
    beholdtePosisjoner: pos.filter((x) => x.behandling === 'beholdes'),
    plattformAvkastning: rensPlattformAvkastning(plattformAvkastning),
  };
};

// Posisjonene som beholdes utenfor Pensum, som linjer under «Kundens øvrige investeringer».
// Linjer av samme type slås sammen når det er mange, slik at listen holder seg oversiktlig.
export const beholdteSomTillegg = (posisjoner = [], maksLinjer = 12) => {
  const beholdt = rensPosisjoner(posisjoner).filter((x) => x.behandling === 'beholdes' && x.verdi > 0);
  const linje = (x, i) => ({ id: `t-dagens-${i}`, navn: x.navn, type: DAGENS_TYPER[x.type].tillegg, belop: x.verdi, avkastning: null });
  if (beholdt.length <= maksLinjer) return beholdt.map(linje);
  return TYPEREKKEFOLGE.map((type, i) => {
    const rader = beholdt.filter((x) => x.type === type);
    if (!rader.length) return null;
    return { id: `t-dagens-${i}`, navn: `${DAGENS_TYPER[type].navn} (${rader.length} posisjoner)`, type: DAGENS_TYPER[type].tillegg, belop: sum(rader, (x) => x.verdi), avkastning: null };
  }).filter(Boolean);
};
export const erTilleggFraDagens = (linje) => String(linje?.id || '').startsWith('t-dagens-');

// Dagens portefølje mot den nye: aktivafordeling side om side, og nøkkeltallene som kan regnes ut.
// «Ny» er Pensum-forslaget pluss det kunden beholder utenfor (totalbildet fra pensumCore).
// pensumKlasser er [{ name, value }] i prosent, slik porteføljebyggeren har dem.
export const sammenlignDagensMotNy = (analyse, { pensumBelop = 0, pensumKlasser = [], pensumProdukter = 0, pensumAvkastning = null, beholdt = [] } = {}) => {
  if (!analyse) return null;
  const pensum = Math.max(0, Number(pensumBelop) || 0);
  const beholdtBelop = sum(beholdt, (x) => Number(x.verdi ?? x.belop) || 0);
  const nyTotal = pensum + beholdtBelop;
  if (!(nyTotal > 0)) return null;
  const ny = new Map();
  const leggTil = (navn, belop) => { if (belop > 0) ny.set(navn, (ny.get(navn) || 0) + belop); };
  const sumKlasser = sum(pensumKlasser, (k) => (k?.value > 0 ? k.value : 0)) || 1;
  pensumKlasser.forEach((k) => leggTil(k.name, pensum * ((k?.value > 0 ? k.value : 0) / sumKlasser)));
  beholdt.forEach((x) => leggTil(DAGENS_TYPER[x.type]?.klasse || 'Annet', Number(x.verdi ?? x.belop) || 0));
  const dagens = new Map(analyse.klasser.map((k) => [k.navn, k.andel]));
  const navn = KLASSEREKKEFOLGE.filter((k) => dagens.has(k) || ny.has(k));
  const andelNy = (k) => ((ny.get(k) || 0) / nyTotal) * 100;
  return {
    nyTotal, pensumBelop: pensum, beholdtBelop,
    klasser: navn.map((k) => ({ navn: k, dagens: dagens.get(k) || 0, ny: andelNy(k) })),
    posisjoner: { dagens: analyse.antallPosisjoner, nyProdukter: pensumProdukter, nyBeholdt: beholdt.length },
    kontanter: { dagens: analyse.kontanter.andel, ny: andelNy('Kontanter') },
    aksjeandel: { dagens: dagens.get('Aksjer') || 0, ny: andelNy('Aksjer') },
    renteandel: { dagens: dagens.get('Renter') || 0, ny: andelNy('Renter') },
    alternativer: { dagens: dagens.get('Alternativer') || 0, ny: andelNy('Alternativer') },
    forventetAvkastning: erGyldigTall(pensumAvkastning) ? pensumAvkastning : null,
  };
};
