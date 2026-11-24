import React, { useEffect, useRef, useState } from 'react';
import { defaultPensumProdukter } from '../../data/pensumDefaults';
import { MAKS_VEDLEGG, MAKS_SAMLET_BYTES, vedleggstype, regnearkTilTekst, tabellFraUtklipp } from '../../lib/lunaVedlegg';

const FELTNAVN = {
  kundeNavn: 'Kundenavn', kundeSelskap: 'Selskap', risikoprofil: 'Risikoprofil', horisont: 'Tidshorisont',
  aksjerKunde: 'Aksjer', aksjefondKunde: 'Aksjefond', renterKunde: 'Renter', kontanterKunde: 'Kontanter',
  peFondKunde: 'Private Equity', unoterteAksjerKunde: 'Unoterte aksjer', shippingKunde: 'Shipping',
  egenEiendomKunde: 'Egen eiendom', eiendomSyndikatKunde: 'Eiendomssyndikat', eiendomFondKunde: 'Eiendomsfond',
  investeringsFormaal: 'Investeringsformål', likviditetsbehov: 'Likviditetsbehov',
};

const FELTNAVN_HANDLING = { ...FELTNAVN, radgiver: 'Rådgiver', dato: 'Dato', investertBelop: 'Beløp som skal investeres', fjernInvestertBelop: 'Bruk total kapital' };
const FANENAVN = {
  input: 'Kundeinformasjon', dagens: 'Dagens portefølje', losninger: 'Porteføljebygging', rapport: 'Investeringsforslag',
  formuesplanlegger: 'Formuesplanlegger', scenario: 'Fondssammenligning', belaning: 'Belåning',
};
const PRODUKTNAVN = Object.fromEntries(
  [...defaultPensumProdukter.enkeltfond, ...defaultPensumProdukter.fondsportefoljer, ...(defaultPensumProdukter.eksterneFond || []), ...defaultPensumProdukter.alternative].map((p) => [p.id, p.navn]),
);

const TYPENAVN = { aksjer: 'aksjer', renter: 'renter', eiendom: 'eiendom', pe: 'private equity/unotert', kontanter: 'kontanter', annet: 'annet' };

const visVerdi = (key, value) => {
  if (typeof value === 'boolean') return value ? 'Ja' : 'Nei';
  if (typeof value === 'number') return key === 'horisont' ? `${value} år` : `${value.toLocaleString('nb-NO')} kr`;
  return String(value);
};

// Én linje per ting som skjer hvis rådgiveren godkjenner forslaget.
const beskrivHandling = (handling) => {
  const p = handling?.payload || {};
  switch (handling?.type) {
    case 'set_customer_fields':
    case 'set_capital_fields':
      return Object.entries(p).map(([key, value]) => `${FELTNAVN_HANDLING[key] || key}: ${visVerdi(key, value)}`);
    case 'reset_capital_fields': return ['Nullstill alle formuespostene'];
    case 'recalculate_allocation': return ['Sett porteføljen på nytt fra risikoprofilen'];
    case 'set_pensum_portfolio':
      return [`Bygg portefølje fra profilen ${p.profile}`, ...(p.weights || []).map((w) => `${PRODUKTNAVN[w.productId] || w.productId}: ${w.constraint === 'minimum' ? 'minst ' : ''}${String(w.weight).replace('.', ',')} %`)];
    case 'set_exact_portfolio': {
      const rader = p.holdings || [];
      const sum = rader.reduce((acc, h) => acc + (h.amount || h.weight || 0), 0) || 1;
      const medBelop = rader.every((h) => h.amount > 0);
      return [
        medBelop ? `Legg inn porteføljen i byggeren, ${Math.round(sum).toLocaleString('nb-NO')} kr totalt` : 'Legg inn porteføljen i byggeren',
        ...rader.map((h) => `${PRODUKTNAVN[h.productId] || h.productId}: ${medBelop ? `${h.amount.toLocaleString('nb-NO')} kr (${((h.amount / sum) * 100).toFixed(1).replace('.', ',')} %)` : `${String(h.weight).replace('.', ',')} %`}`),
        'Erstatter porteføljen som ligger i byggeren nå',
      ];
    }
    case 'set_other_investments':
      return [
        p.mode === 'replace' ? 'Erstatt kundens øvrige investeringer' : 'Legg til under kundens øvrige investeringer',
        ...(p.items || []).map((x) => `${x.navn} (${TYPENAVN[x.type] || x.type}): ${Number(x.belop).toLocaleString('nb-NO')} kr${x.avkastning != null ? `, ${String(x.avkastning).replace('.', ',')} % per år` : ''}`),
      ];
    case 'navigate': return [`Gå til ${FANENAVN[p.tab] || p.tab}`];
    case 'open_investment_proposal': return ['Åpne nedlasting av investeringsforslaget'];
    case 'save_customer': return ['Lagre kundekortet'];
    default: return [];
  }
};

const tilBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(String(reader.result).split(',')[1]);
  reader.onerror = reject;
  reader.readAsDataURL(file);
});

// Lagring og nullstilling er varige eller ødeleggende, og krever fortsatt godkjenning.
const KREVER_GODKJENNING = new Set(['save_customer', 'reset_capital_fields']);
// Fanebytte og åpning av dialoger trenger verken oppsummering eller angreknapp.
const UFARLIGE = new Set(['navigate', 'open_investment_proposal']);

export default function LunaAssistant({ onUtfor, context = {} }) {
  const inputRef = useRef(null);
  const bunnRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resultat, setResultat] = useState(null);
  const [tekst, setTekst] = useState('');
  const [lytter, setLytter] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hei! Jeg er Luna. Spør meg om kunden, porteføljen eller produktene, eller be meg fylle ut kundekortet og bygge en portefølje. Endringer jeg gjør kan du angre med ett klikk.' },
  ]);
  const [handlinger, setHandlinger] = useState(null);
  const [drar, setDrar] = useState(false);
  const [vedlegg, setVedlegg] = useState([]);
  const vedleggRef = useRef([]);
  const [utfort, setUtfort] = useState(null);

  useEffect(() => { bunnRef.current?.scrollIntoView({ block: 'end' }); }, [messages, loading, handlinger, resultat, open]);

  const leggTilLunaSvar = (content, fields = null, merknad = '') => {
    setMessages((prev) => [...prev, { role: 'assistant', content }]);
    if (fields && Object.keys(fields).length) setResultat({ fields, merknad });
  };

  // Utfører forslag med en gang og tilbyr «Angre». Forslag som krever godkjenning vises i stedet som før.
  const behandleForslag = async (actions = [], fields = null) => {
    const harFelt = fields && Object.keys(fields).length > 0;
    if (!actions.length && !harFelt) return;
    if (actions.some((a) => KREVER_GODKJENNING.has(a.type))) { setHandlinger(actions); if (harFelt) setResultat({ fields, merknad: '' }); return; }
    try {
      const angreFn = await onUtfor({ actions, fields: harFelt ? fields : null });
      const linjer = [
        ...actions.filter((a) => !UFARLIGE.has(a.type)).flatMap(beskrivHandling).filter((l) => !l.startsWith('Erstatter porteføljen')),
        ...(harFelt ? Object.entries(fields).map(([key, value]) => `${FELTNAVN[key] || key}: ${visVerdi(key, value)}`) : []),
      ];
      if (linjer.length) setUtfort({ linjer, angre: angreFn });
    } catch (err) {
      setError(err?.message || 'Kunne ikke utføre forslaget.');
    }
  };

  const sendMelding = async () => {
    if (vedlegg.length) return sendBilder();
    const content = tekst.trim();
    if (!content || loading) return;
    const neste = [...messages, { role: 'user', content }];
    setMessages(neste);
    setTekst('');
    setLoading(true);
    setError('');
    setHandlinger(null);
    setUtfort(null);
    try {
      const response = await fetch('/api/luna-chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: neste.slice(-12), context }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Luna kunne ikke svare.');
      leggTilLunaSvar(data.message);
      await behandleForslag(Array.isArray(data.actions) ? data.actions : []);
    } catch (err) {
      setError(err.message || 'Luna kunne ikke svare.');
    } finally {
      setLoading(false);
    }
  };

  const startDiktering = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Diktering støttes ikke av denne nettleseren. Du kan fortsatt skrive til Luna.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'nb-NO';
    recognition.interimResults = false;
    recognition.onstart = () => { setLytter(true); setError(''); };
    recognition.onend = () => setLytter(false);
    recognition.onerror = () => { setLytter(false); setError('Kunne ikke høre mikrofonen. Kontroller nettlesertilgangen.'); };
    recognition.onresult = (event) => setTekst((prev) => `${prev}${prev ? ' ' : ''}${event.results[0][0].transcript}`);
    recognition.start();
  };

  // Bilder kan velges med bindersen, limes inn (Ctrl+V) eller dras inn i chatten.
  // Vedlegg kan være bilder, PDF-er og regneark. De legges ved meldingen og sendes først når
  // rådgiveren trykker Enter eller send, slik at flere vedlegg og en forklaring kan sendes samlet.
  // Hvert vedlegg er { type: 'bilde' | 'pdf' | 'tabell', navn, file?, url?, tabell? }.
  const byteFor = (v) => (v.file ? v.file.size : (v.tabell?.tekst.length || 0));
  // Listen holdes også i en ref, slik at kontrollen av antall og størrelse alltid gjelder det
  // som faktisk ligger ved nå, også når et regneark blir ferdig lest etter at mer er lagt til.
  const settVedlegg = (liste) => { vedleggRef.current = liste; setVedlegg(liste); };
  const leggTilVedlegg = (nye, melding = '') => {
    if (!nye.length) { if (melding) setError(melding); return; }
    const gjeldende = vedleggRef.current;
    const plass = Math.max(0, MAKS_VEDLEGG - gjeldende.length);
    const tatt = nye.slice(0, plass);
    nye.slice(plass).forEach((v) => v.url && URL.revokeObjectURL(v.url));
    const samlet = [...gjeldende, ...tatt].reduce((sum, v) => sum + byteFor(v), 0);
    if (samlet > MAKS_SAMLET_BYTES) {
      tatt.forEach((v) => v.url && URL.revokeObjectURL(v.url));
      setError(`Vedleggene er for store til sammen (grensen er ${Math.round(MAKS_SAMLET_BYTES / 1024 / 1024)} MB). Send færre om gangen, eller ta et skjermbilde av den delen som gjelder.`);
      return;
    }
    setError(nye.length > plass ? `Du kan sende ${MAKS_VEDLEGG} vedlegg om gangen.` : melding);
    if (tatt.length) settVedlegg([...gjeldende, ...tatt]);
  };
  const leggVed = async (alle) => {
    if (!alle.length) return;
    const nye = []; const avvist = [];
    for (const file of alle) {
      const type = vedleggstype(file);
      if (type === 'bilde') nye.push({ type, navn: file.name || 'Skjermbilde', file, url: URL.createObjectURL(file) });
      else if (type === 'pdf') nye.push({ type, navn: file.name || 'dokument.pdf', file });
      else if (type === 'tabell') {
        try {
          const XLSX = await import('xlsx');
          const tabell = regnearkTilTekst(XLSX, await file.arrayBuffer(), file.name || 'regneark');
          if (tabell.tekst) nye.push({ type, navn: tabell.navn, tabell }); else avvist.push(`${file.name} (tomt)`);
        } catch { avvist.push(`${file.name} (kunne ikke leses)`); }
      } else avvist.push(file.name || 'fil');
    }
    leggTilVedlegg(nye, avvist.length ? `Kunne ikke legge ved ${avvist.join(', ')}. Luna leser bilder, PDF og Excel/CSV.` : '');
  };
  const fjernVedlegg = (index) => { const gjeldende = vedleggRef.current; if (gjeldende[index]?.url) URL.revokeObjectURL(gjeldende[index].url); settVedlegg(gjeldende.filter((_, i) => i !== index)); };
  const analyser = (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = '';
    leggVed(files);
  };
  const limInn = (event) => {
    const filer = Array.from(event.clipboardData?.files || []);
    // Celler kopiert fra Excel kommer som både bilde og tekst. Teksten er mest nøyaktig.
    const tabell = tabellFraUtklipp(event.clipboardData?.getData('text/plain'));
    if (tabell && (filer.length === 0 || filer.every((f) => f.type.startsWith('image/')))) {
      event.preventDefault();
      leggTilVedlegg([{ type: 'tabell', navn: tabell.navn, tabell }]);
      return;
    }
    if (!filer.length) return; // vanlig tekst limes inn som før
    event.preventDefault();
    leggVed(filer);
  };
  const slipp = (event) => {
    event.preventDefault();
    setDrar(false);
    leggVed(Array.from(event.dataTransfer?.files || []));
  };
  const sendBilder = async () => {
    if (loading || !vedlegg.length) return;
    const sendes = vedleggRef.current;
    const melding = tekst.trim();
    setMessages((prev) => [...prev, { role: 'user', content: `${melding ? melding + '\n' : ''}(${sendes.length} vedlegg: ${sendes.map((v) => v.navn).join(', ')})` }]);
    sendes.forEach((v) => v.url && URL.revokeObjectURL(v.url));
    settVedlegg([]);
    setTekst('');
    setLoading(true);
    setError('');
    setResultat(null);
    setHandlinger(null);
    setUtfort(null);
    try {
      const images = await Promise.all(sendes.filter((v) => v.type === 'bilde').map(async (v) => ({ mediaType: v.file.type, data: await tilBase64(v.file) })));
      const dokumenter = await Promise.all(sendes.filter((v) => v.type === 'pdf').map(async (v) => ({ mediaType: 'application/pdf', navn: v.navn, data: await tilBase64(v.file) })));
      const tabeller = sendes.filter((v) => v.type === 'tabell').map((v) => ({ navn: v.navn, tekst: v.tabell.tekst }));
      const response = await fetch('/api/analyze-kundeskjermbilde', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ images, dokumenter, tabeller, melding }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Luna kunne ikke lese vedlegget.');
      const antall = Object.keys(data.fields || {}).length;
      const forslag = Array.isArray(data.actions) ? data.actions : [];
      const ukjente = Array.isArray(data.ukjente) ? data.ukjente : [];
      const deler = [];
      if (forslag.some((a) => a.type === 'set_exact_portfolio')) deler.push('Jeg fant en beholdning i Pensum-produkter og har lagt den inn i porteføljebyggeren.');
      if (forslag.some((a) => a.type === 'set_other_investments')) deler.push('Posisjoner utenfor Pensum har jeg lagt inn som kundens øvrige investeringer. Se over type og forventet avkastning.');
      if (antall) deler.push(`Jeg fylte inn ${antall} felt på kundekortet.`);
      if (ukjente.length) deler.push(`Disse fant jeg ikke beløp for, så de er ikke tatt med:\n${ukjente.map((u) => `• ${u.navn}${u.belop ? ` (${u.belop.toLocaleString('nb-NO')} kr)` : ''}`).join('\n')}`);
      if (!deler.length) deler.push('Jeg fant ingen sikre kundedata eller posisjoner i vedleggene.');
      if (data.merknad) deler.push(data.merknad);
      leggTilLunaSvar(deler.join('\n\n'));
      await behandleForslag(forslag, data.fields);
    } catch (err) {
      setError(err.message || 'Luna kunne ikke lese vedlegget.');
    } finally {
      setLoading(false);
    }
  };

  const felter = Object.entries(resultat?.fields || {}).filter(([, value]) => value !== null && value !== '');

  return (
    <div className="fixed bottom-5 right-5 z-[70] no-print">
      {open && (
        <div className={"relative mb-3 w-[390px] max-w-[calc(100vw-2rem)] rounded-2xl border bg-white shadow-2xl overflow-hidden " + (drar ? "border-sky-400 ring-2 ring-sky-200" : "border-slate-200")}
          onPaste={limInn}
          onDragOver={(e) => { if (Array.from(e.dataTransfer?.types || []).includes('Files')) { e.preventDefault(); setDrar(true); } }}
          onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setDrar(false); }}
          onDrop={slipp} data-luna-panel>
          {drar && <div className="absolute inset-0 z-10 flex items-center justify-center bg-sky-50/90 text-sm font-semibold text-sky-800 pointer-events-none">Slipp filen her</div>}
          <div className="px-4 py-3 text-white flex items-center justify-between" style={{ backgroundColor: '#0D2841' }}>
            <div><p className="font-bold">Luna</p><p className="text-[11px] text-blue-200">Din assistent i rådgiververktøyet</p></div>
            <button onClick={() => setOpen(false)} aria-label="Lukk Luna" className="text-blue-100 hover:text-white text-xl">×</button>
          </div>
          <div className="h-64 overflow-y-auto bg-slate-50 px-4 py-3 space-y-3" aria-live="polite">
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${message.role === 'user' ? 'bg-sky-700 text-white rounded-br-sm' : 'bg-white border border-slate-200 text-slate-700 rounded-bl-sm'} whitespace-pre-wrap`}>{message.content}</div>
              </div>
            ))}
            {loading && <div className="text-xs text-slate-400">Luna arbeider …</div>}
            <div ref={bunnRef}></div>
          </div>
          <div className="p-3 space-y-2 border-t border-slate-100">
            {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{error}</div>}
            {utfort && (
              <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3 space-y-2" data-luna-utfort>
                <p className="text-xs font-bold text-slate-700">Lagt inn</p>
                <ul className="max-h-36 overflow-y-auto space-y-1 text-[11px] text-slate-700">
                  {utfort.linjer.map((linje, i) => <li key={i} className="flex gap-1.5"><span className="text-emerald-600">•</span><span>{linje}</span></li>)}
                </ul>
                <div className="flex gap-2">
                  <button onClick={() => { utfort.angre(); setUtfort(null); leggTilLunaSvar('Angret. Verktøyet er satt tilbake til slik det var.'); }} className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">Angre</button>
                  <button onClick={() => setUtfort(null)} className="rounded-lg px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700">Skjul</button>
                </div>
              </div>
            )}
            {handlinger && (
              <div className="rounded-xl border border-sky-100 bg-sky-50 p-3 space-y-2" data-luna-forslag>
                <p className="text-xs font-bold text-slate-700">Luna foreslår</p>
                <ul className="max-h-36 overflow-y-auto space-y-1 text-[11px] text-slate-700">
                  {handlinger.flatMap(beskrivHandling).map((linje, i) => <li key={i} className="flex gap-1.5"><span className="text-sky-600">•</span><span>{linje}</span></li>)}
                </ul>
                <div className="flex gap-2">
                  <button disabled={loading} onClick={async () => {
                    const valgte = handlinger; setHandlinger(null); setError('');
                    try { await onUtfor({ actions: valgte }); leggTilLunaSvar('Gjort.'); }
                    catch (err) { setError(err?.message || 'Kunne ikke utføre forslaget.'); }
                  }} className="flex-1 rounded-lg px-3 py-2 text-xs font-bold text-white disabled:opacity-40" style={{ backgroundColor: '#2D6A6A' }}>Godkjenn</button>
                  <button onClick={() => { setHandlinger(null); leggTilLunaSvar('Greit, jeg gjør ingen endringer.'); }} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">Avvis</button>
                </div>
              </div>
            )}
            {resultat && (
              <div className="rounded-xl border border-sky-100 bg-sky-50 p-3 space-y-2">
                <p className="text-xs font-bold text-slate-700">Foreslåtte endringer ({felter.length})</p>
                <div className="max-h-32 overflow-y-auto">
                  {felter.map(([key, value]) => <div key={key} className="flex justify-between gap-3 py-1 text-[11px]"><span className="text-slate-500">{FELTNAVN[key] || key}</span><span className="font-semibold text-right">{typeof value === 'number' ? value.toLocaleString('nb-NO') : value}</span></div>)}
                </div>
                {resultat.merknad && <p className="text-[10px] text-slate-500">{resultat.merknad}</p>}
                <div className="flex gap-2">
                  <button disabled={!felter.length} onClick={async () => { const f = resultat.fields; setResultat(null); await onUtfor({ fields: f }); leggTilLunaSvar('Feltene er fylt inn.'); }} className="flex-1 rounded-lg px-3 py-2 text-xs font-bold text-white disabled:opacity-40" style={{ backgroundColor: '#2D6A6A' }}>Fyll inn</button>
                  <button onClick={() => setResultat(null)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-600">Avvis</button>
                </div>
              </div>
            )}
            {vedlegg.length > 0 && (
              <div className="flex flex-wrap items-center gap-2" data-luna-vedlegg>
                {vedlegg.map((v, i) => (
                  <div key={`${v.navn}-${i}`} className="relative" data-vedleggstype={v.type}>
                    {v.type === 'bilde' ? (
                      <img src={v.url} alt={`Skjermbilde ${i + 1}`} className="h-14 w-20 rounded-lg border border-slate-200 object-cover" />
                    ) : (
                      <div className="h-14 max-w-[9.5rem] rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 flex flex-col justify-center" title={v.navn}>
                        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: v.type === 'pdf' ? '#B91C1C' : '#2D6A6A' }}>{v.type === 'pdf' ? 'PDF' : 'Tabell'}</span>
                        <span className="text-[11px] text-slate-700 truncate">{v.navn}</span>
                        <span className="text-[10px] text-slate-400">{v.type === 'pdf' ? `${(v.file.size / 1024 / 1024).toFixed(1).replace('.', ',')} MB` : `${v.tabell.rader} rader${v.tabell.kuttet ? ' (kuttet)' : ''}`}</span>
                      </div>
                    )}
                    <button onClick={() => fjernVedlegg(i)} aria-label={`Fjern ${v.navn}`} className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-slate-700 text-white text-xs leading-none">×</button>
                  </div>
                ))}
                <span className="text-[11px] text-slate-500">Trykk Enter for å sende{vedlegg.length < MAKS_VEDLEGG ? ', eller legg ved flere' : ''}.</span>
              </div>
            )}
            <div className="flex items-end gap-2">
              <button onClick={() => inputRef.current?.click()} disabled={loading} title="Legg ved skjermbilde, PDF eller Excel (du kan også lime inn eller dra dem hit)" className="h-10 w-10 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50">📎</button>
              <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif,application/pdf,.pdf,.xlsx,.xlsm,.xls,.csv,.tsv" multiple onChange={analyser} className="hidden" />
              <textarea value={tekst} onChange={(e) => setTekst(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMelding(); } }} rows={1} placeholder={vedlegg.length ? "Skriv en forklaring (valgfritt) …" : "Skriv til Luna, eller lim inn skjermbilde, PDF eller Excel …"} className="min-h-10 max-h-24 flex-1 resize-y rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-sky-400 focus:outline-none" />
              <button onClick={startDiktering} title="Dikter melding" className={`h-10 w-10 rounded-xl border ${lytter ? 'border-red-300 bg-red-50' : 'border-slate-200'} text-slate-600`}>{lytter ? '●' : '🎙'}</button>
              <button onClick={sendMelding} disabled={(!tekst.trim() && !vedlegg.length) || loading} title="Send melding" className="h-10 w-10 rounded-xl text-white disabled:opacity-40" style={{ backgroundColor: '#0D2841' }}>➤</button>
            </div>
            <p className="text-[9px] text-slate-400">AI kan gjøre feil. Kontroller det Luna legger inn. Meldinger, vedlegg og porteføljen i verktøyet sendes til Pensums AI-tjeneste. Vedlegg sendes slik de er, også med navn som står i dem.</p>
          </div>
        </div>
      )}
      <button onClick={() => setOpen((value) => !value)} className="ml-auto h-14 px-5 rounded-full text-white shadow-xl flex items-center gap-2 font-bold" style={{ backgroundColor: '#0D2841' }} aria-expanded={open}>
        <span className="w-7 h-7 rounded-full bg-sky-200 text-slate-800 flex items-center justify-center">L</span>Luna
      </button>
    </div>
  );
}
