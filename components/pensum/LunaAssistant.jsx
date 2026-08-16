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

export default function LunaAssistant({ onApply }) {
  const inputRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resultat, setResultat] = useState(null);

  const analyser = async (event) => {
    const files = Array.from(event.target.files || []).slice(0, 4);
    event.target.value = '';
    if (!files.length) return;
    const forStor = files.find((file) => file.size > 4 * 1024 * 1024);
    if (forStor) {
      setError(`${forStor.name} er større enn 4 MB.`);
      return;
    }
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
      setResultat(data);
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
        <div className="mb-3 w-[360px] max-w-[calc(100vw-2rem)] rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
          <div className="px-4 py-3 text-white flex items-center justify-between" style={{ backgroundColor: '#0D2841' }}>
            <div><p className="font-bold">Luna</p><p className="text-[11px] text-blue-200">Fyll kundekort fra skjermbilder</p></div>
            <button onClick={() => setOpen(false)} aria-label="Lukk Luna" className="text-blue-100 hover:text-white text-xl">×</button>
          </div>
          <div className="p-4 space-y-3">
            <p className="text-xs leading-relaxed text-slate-600">Last opp inntil fire skjermbilder. Luna finner relevante kundedata, men du får kontrollere alt før feltene fylles inn.</p>
            <button onClick={() => inputRef.current?.click()} disabled={loading} className="w-full rounded-xl border-2 border-dashed border-sky-200 bg-sky-50 px-4 py-4 text-sm font-semibold text-sky-800 hover:bg-sky-100 disabled:opacity-60">
              {loading ? 'Luna analyserer …' : 'Velg skjermbilder'}
            </button>
            <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" multiple onChange={analyser} className="hidden" />
            <p className="text-[10px] text-slate-400">Skjermbildene sendes til Pensums AI-tjeneste for analyse. Kontroller at behandlingen er tillatt før opplasting.</p>
            {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{error}</div>}
            {resultat && (
              <div className="space-y-3">
                <div className="rounded-xl bg-slate-50 p-3 max-h-56 overflow-y-auto">
                  <p className="text-xs font-bold text-slate-700 mb-2">Luna fant {felter.length} felt</p>
                  {felter.length ? felter.map(([key, value]) => (
                    <div key={key} className="flex justify-between gap-4 py-1.5 border-b border-slate-100 last:border-0 text-xs">
                      <span className="text-slate-500">{FELTNAVN[key] || key}</span><span className="font-semibold text-right text-slate-800">{typeof value === 'number' ? value.toLocaleString('nb-NO') : value}</span>
                    </div>
                  )) : <p className="text-xs text-slate-500">Ingen sikre kundedata ble funnet.</p>}
                </div>
                {resultat.merknad && <p className="text-[11px] text-slate-500">{resultat.merknad}</p>}
                <button disabled={!felter.length} onClick={() => { onApply(resultat.fields); setResultat(null); }} className="w-full rounded-xl px-4 py-2.5 text-sm font-bold text-white disabled:opacity-40" style={{ backgroundColor: '#2D6A6A' }}>Fyll inn på kundekortet</button>
              </div>
            )}
          </div>
        </div>
      )}
      <button onClick={() => setOpen((value) => !value)} className="ml-auto h-14 px-5 rounded-full text-white shadow-xl flex items-center gap-2 font-bold" style={{ backgroundColor: '#0D2841' }} aria-expanded={open}>
        <span className="w-7 h-7 rounded-full bg-sky-200 text-slate-800 flex items-center justify-center">L</span>Luna
      </button>
    </div>
  );
}
