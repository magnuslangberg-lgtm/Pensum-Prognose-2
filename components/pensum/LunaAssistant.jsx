import React, { useRef, useState } from 'react';

const FELTNAVN = {
  kundeNavn: 'Kundenavn', kundeSelskap: 'Selskap', risikoprofil: 'Risikoprofil', horisont: 'Tidshorisont',
  aksjerKunde: 'Aksjer', aksjefondKunde: 'Aksjefond', renterKunde: 'Renter', kontanterKunde: 'Kontanter',
  peFondKunde: 'Private Equity', unoterteAksjerKunde: 'Unoterte aksjer', shippingKunde: 'Shipping',
  egenEiendomKunde: 'Egen eiendom', eiendomSyndikatKunde: 'Eiendomssyndikat', eiendomFondKunde: 'Eiendomsfond',
  investeringsFormaal: 'Investeringsformål', likviditetsbehov: 'Likviditetsbehov',
};

const tilBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(String(reader.result).split(',')[1]);
  reader.onerror = reject;
  reader.readAsDataURL(file);
});

export default function LunaAssistant({ onApply, context = {} }) {
  const inputRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resultat, setResultat] = useState(null);
  const [tekst, setTekst] = useState('');
  const [lytter, setLytter] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hei! Jeg er Luna. Du kan spørre meg om kundekortet og verktøyet, diktere med mikrofonen eller laste opp skjermbilder.' },
  ]);

  const leggTilLunaSvar = (content, fields = null, merknad = '') => {
    setMessages((prev) => [...prev, { role: 'assistant', content }]);
    if (fields && Object.keys(fields).length) setResultat({ fields, merknad });
  };

  const sendMelding = async () => {
    const content = tekst.trim();
    if (!content || loading) return;
    const neste = [...messages, { role: 'user', content }];
    setMessages(neste);
    setTekst('');
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/luna-chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: neste.slice(-12), context }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Luna kunne ikke svare.');
      leggTilLunaSvar(data.message, data.fields, data.merknad);
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

  const analyser = async (event) => {
    const files = Array.from(event.target.files || []).slice(0, 4);
    event.target.value = '';
    if (!files.length) return;
    const forStor = files.find((file) => file.size > 4 * 1024 * 1024);
    if (forStor) { setError(`${forStor.name} er større enn 4 MB.`); return; }
    setMessages((prev) => [...prev, { role: 'user', content: `Lastet opp ${files.length} skjermbilde${files.length > 1 ? 'r' : ''} for analyse.` }]);
    setLoading(true);
    setError('');
    setResultat(null);
    try {
      const images = await Promise.all(files.map(async (file) => ({ mediaType: file.type, data: await tilBase64(file) })));
      const response = await fetch('/api/analyze-kundeskjermbilde', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ images }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Luna kunne ikke analysere skjermbildet.');
      const antall = Object.keys(data.fields || {}).length;
      leggTilLunaSvar(antall ? `Jeg fant ${antall} relevante felt. Kontroller forslaget under før du fyller inn.` : 'Jeg fant ingen sikre kundedata i skjermbildet.', data.fields, data.merknad);
    } catch (err) {
      setError(err.message || 'Luna kunne ikke analysere skjermbildet.');
    } finally {
      setLoading(false);
    }
  };

  const felter = Object.entries(resultat?.fields || {}).filter(([, value]) => value !== null && value !== '');

  return (
    <div className="fixed bottom-5 right-5 z-[70] no-print">
      {open && (
        <div className="mb-3 w-[390px] max-w-[calc(100vw-2rem)] rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
          <div className="px-4 py-3 text-white flex items-center justify-between" style={{ backgroundColor: '#0D2841' }}>
            <div><p className="font-bold">Luna</p><p className="text-[11px] text-blue-200">Din assistent i rådgiververktøyet</p></div>
            <button onClick={() => setOpen(false)} aria-label="Lukk Luna" className="text-blue-100 hover:text-white text-xl">×</button>
          </div>
          <div className="h-64 overflow-y-auto bg-slate-50 px-4 py-3 space-y-3" aria-live="polite">
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${message.role === 'user' ? 'bg-sky-700 text-white rounded-br-sm' : 'bg-white border border-slate-200 text-slate-700 rounded-bl-sm'}`}>{message.content}</div>
              </div>
            ))}
            {loading && <div className="text-xs text-slate-400">Luna arbeider …</div>}
          </div>
          <div className="p-3 space-y-2 border-t border-slate-100">
            {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{error}</div>}
            {resultat && (
              <div className="rounded-xl border border-sky-100 bg-sky-50 p-3 space-y-2">
                <p className="text-xs font-bold text-slate-700">Foreslåtte endringer ({felter.length})</p>
                <div className="max-h-32 overflow-y-auto">
                  {felter.map(([key, value]) => <div key={key} className="flex justify-between gap-3 py-1 text-[11px]"><span className="text-slate-500">{FELTNAVN[key] || key}</span><span className="font-semibold text-right">{typeof value === 'number' ? value.toLocaleString('nb-NO') : value}</span></div>)}
                </div>
                {resultat.merknad && <p className="text-[10px] text-slate-500">{resultat.merknad}</p>}
                <div className="flex gap-2">
                  <button disabled={!felter.length} onClick={() => { onApply(resultat.fields); setResultat(null); leggTilLunaSvar('Feltene er fylt inn. Kontroller kundekortet og trykk «Lagre kundekort» når alt stemmer.'); }} className="flex-1 rounded-lg px-3 py-2 text-xs font-bold text-white disabled:opacity-40" style={{ backgroundColor: '#2D6A6A' }}>Fyll inn</button>
                  <button onClick={() => setResultat(null)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-600">Avvis</button>
                </div>
              </div>
            )}
            <div className="flex items-end gap-2">
              <button onClick={() => inputRef.current?.click()} disabled={loading} title="Legg ved skjermbilder" className="h-10 w-10 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50">📎</button>
              <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" multiple onChange={analyser} className="hidden" />
              <textarea value={tekst} onChange={(e) => setTekst(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMelding(); } }} rows={1} placeholder="Skriv til Luna …" className="min-h-10 max-h-24 flex-1 resize-y rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-sky-400 focus:outline-none" />
              <button onClick={startDiktering} title="Dikter melding" className={`h-10 w-10 rounded-xl border ${lytter ? 'border-red-300 bg-red-50' : 'border-slate-200'} text-slate-600`}>{lytter ? '●' : '🎙'}</button>
              <button onClick={sendMelding} disabled={!tekst.trim() || loading} title="Send melding" className="h-10 w-10 rounded-xl text-white disabled:opacity-40" style={{ backgroundColor: '#0D2841' }}>➤</button>
            </div>
            <p className="text-[9px] text-slate-400">AI kan gjøre feil. Kontroller forslag før lagring. Bilder og meldinger sendes til Pensums AI-tjeneste.</p>
          </div>
        </div>
      )}
      <button onClick={() => setOpen((value) => !value)} className="ml-auto h-14 px-5 rounded-full text-white shadow-xl flex items-center gap-2 font-bold" style={{ backgroundColor: '#0D2841' }} aria-expanded={open}>
        <span className="w-7 h-7 rounded-full bg-sky-200 text-slate-800 flex items-center justify-center">L</span>Luna
      </button>
    </div>
  );
}
