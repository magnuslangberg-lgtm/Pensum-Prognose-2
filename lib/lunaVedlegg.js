// Vedlegg til Luna: bilder, PDF-er og regneark. Regneark leses i nettleseren og sendes
// som tekst, slik at tallene kommer nøyaktig frem. Ren logikk, slik at den kan testes.
export const BILDETYPER = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
export const MAKS_VEDLEGG = 4;
// Hele forespørselen må holde seg under grensen for tjenesten (ca. 4,5 MB etter koding).
export const MAKS_SAMLET_BYTES = 3 * 1024 * 1024;
export const MAKS_TABELLTEGN = 60000;
const MAKS_ARK = 6;

// Hva slags vedlegg en fil er, ut fra type og filendelse. null betyr at Luna ikke kan lese den.
export const vedleggstype = (fil) => {
  const type = String(fil?.type || '').toLowerCase();
  const navn = String(fil?.name || '').toLowerCase();
  if (BILDETYPER.includes(type)) return 'bilde';
  if (type === 'application/pdf' || navn.endsWith('.pdf')) return 'pdf';
  if (/\.(xlsx|xlsm|xls|csv|tsv)$/.test(navn) || /spreadsheet|ms-excel|text\/csv|tab-separated/.test(type)) return 'tabell';
  return null;
};

// Rydder en tabell som tekst: fjerner tomme linjer og tomme celler på slutten av hver linje.
const ryddTabell = (tekst) => String(tekst || '')
  .split(/\r?\n/)
  .map((linje) => linje.replace(/[\t ]+$/, ''))
  .filter((linje) => linje.replace(/\t/g, '').trim() !== '')
  .join('\n');

const kutt = (tekst) => (tekst.length > MAKS_TABELLTEGN
  ? { tekst: tekst.slice(0, tekst.lastIndexOf('\n', MAKS_TABELLTEGN) > 0 ? tekst.lastIndexOf('\n', MAKS_TABELLTEGN) : MAKS_TABELLTEGN), kuttet: true }
  : { tekst, kuttet: false });

// Gjør et regneark om til tekst med tabulator mellom cellene, ett avsnitt per ark.
// XLSX er biblioteket «xlsx», sendt inn slik at funksjonen kan brukes både i nettleser og test.
export const regnearkTilTekst = (XLSX, data, navn = 'regneark') => {
  const erTekstfil = /\.(csv|tsv)$/i.test(navn);
  const bok = erTekstfil
    ? XLSX.read(typeof data === 'string' ? data : new TextDecoder('utf-8').decode(data), { type: 'string', raw: true })
    : XLSX.read(data, { type: 'array' });
  const deler = bok.SheetNames.slice(0, MAKS_ARK).map((arknavn) => {
    const innhold = ryddTabell(XLSX.utils.sheet_to_csv(bok.Sheets[arknavn], { FS: '\t', blankrows: false }));
    return innhold ? (bok.SheetNames.length > 1 ? `Ark «${arknavn}»:\n${innhold}` : innhold) : '';
  }).filter(Boolean);
  const { tekst, kuttet } = kutt(deler.join('\n\n'));
  return { navn, tekst, rader: tekst ? tekst.split('\n').length : 0, kuttet, arkUtelatt: Math.max(0, bok.SheetNames.length - MAKS_ARK) };
};

// Celler kopiert fra Excel ligger på utklippstavlen som tekst med tabulator mellom kolonnene
// (i tillegg til et bilde av cellene). Teksten er mer nøyaktig enn bildet, så den brukes.
export const tabellFraUtklipp = (tekstFraUtklipp) => {
  const ryddet = ryddTabell(tekstFraUtklipp);
  if (!ryddet.includes('\t') || ryddet.split('\n').length < 2) return null;
  const { tekst, kuttet } = kutt(ryddet);
  return { navn: 'Innlimt tabell', tekst, rader: tekst.split('\n').length, kuttet, arkUtelatt: 0 };
};

// Serverens kontroll av vedleggene, og innholdet som sendes til modellen.
// Returnerer { feil } eller { innhold }.
export const byggVedleggInnhold = ({ images = [], dokumenter = [], tabeller = [], melding = '' } = {}) => {
  const bilder = (Array.isArray(images) ? images : []).slice(0, MAKS_VEDLEGG);
  const pdfer = (Array.isArray(dokumenter) ? dokumenter : []).slice(0, MAKS_VEDLEGG);
  const ark = (Array.isArray(tabeller) ? tabeller : []).slice(0, MAKS_VEDLEGG);
  if (!bilder.length && !pdfer.length && !ark.length) return { feil: 'Ingen vedlegg mottatt.' };
  if (bilder.length + pdfer.length + ark.length > MAKS_VEDLEGG) return { feil: `Du kan sende ${MAKS_VEDLEGG} vedlegg om gangen.` };
  const base64 = (v) => typeof v === 'string' && v.length > 0 && /^[A-Za-z0-9+/]+=*$/.test(v);
  if (bilder.some((b) => !BILDETYPER.includes(b?.mediaType) || !base64(b?.data))) return { feil: 'Ugyldig bildeformat.' };
  if (pdfer.some((d) => d?.mediaType !== 'application/pdf' || !base64(d?.data))) return { feil: 'Ugyldig PDF.' };
  if (ark.some((t) => typeof t?.tekst !== 'string' || !t.tekst.trim())) return { feil: 'Regnearket var tomt eller kunne ikke leses.' };
  const navn = (v, reserve) => String(v || reserve).replace(/[\r\n]/g, ' ').slice(0, 120);
  const beskjed = typeof melding === 'string' ? melding.trim().slice(0, 2000) : '';
  return {
    innhold: [
      ...bilder.map((b) => ({ type: 'image', source: { type: 'base64', media_type: b.mediaType, data: b.data } })),
      ...pdfer.map((d) => ({ type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: d.data }, title: navn(d.navn, 'dokument.pdf') })),
      ...ark.map((t) => ({ type: 'text', text: `Tabell fra ${navn(t.navn, 'regneark')} (tabulator mellom kolonnene):\n${t.tekst.slice(0, MAKS_TABELLTEGN)}` })),
      { type: 'text', text: `${beskjed ? `Rådgiveren skriver om vedleggene:\n${beskjed}\n\n` : ''}Les vedleggene og svar med JSON som beskrevet.` },
    ],
  };
};
