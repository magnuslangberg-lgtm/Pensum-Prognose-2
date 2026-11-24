import React, { useRef, useState } from 'react';
import { DAGENS_TYPER, DAGENS_MAKS } from '../../lib/dagensPortefolje';
import { MAKS_VEDLEGG, MAKS_SAMLET_BYTES, vedleggstype, regnearkTilTekst, tabellFraUtklipp } from '../../lib/lunaVedlegg';
import { PENSUM_COLORS, formatCurrency, formatNumber, parseBelop } from '../../lib/pensumCore';

const tilBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(String(reader.result).split(',')[1]);
  reader.onerror = reject;
  reader.readAsDataURL(file);
});
const p1 = (v) => (Number.isFinite(v) ? v.toFixed(1).replace('.', ',') : '–');
const KLASSEFARGE = { Aksjer: PENSUM_COLORS.darkBlue, Renter: PENSUM_COLORS.salmon, Blandet: PENSUM_COLORS.lightBlue, Alternativer: PENSUM_COLORS.teal, Kontanter: PENSUM_COLORS.gray, Annet: '#B8A9C9' };
const nyId = () => `pos-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

// Fanen «Dagens portefølje»: kundens nåværende beholdning, lest inn fra vedlegg eller lagt inn
// for hånd, med en analyse som regnes ut fra posisjonene. Hver posisjon merkes som «flyttes»
// eller «beholdes», og det brukes til å sette beløpet hos Pensum og kundens øvrige investeringer.
export default function DagensPortefolje({ posisjoner, setPosisjoner, plattformAvkastning, setPlattformAvkastning, analyse, sammenligning, onBrukIForslaget, bruktIForslaget }) {
  const filRef = useRef(null);
  const [leser, setLeser] = useState(false);
  const [feil, setFeil] = useState('');
  const [melding, setMelding] = useState('');
  const [drar, setDrar] = useState(false);

  const oppdater = (id, endring) => setPosisjoner((prev) => prev.map((x) => (x.id === id ? { ...x, ...endring } : x)));
  const leggTil = () => setPosisjoner((prev) => (prev.length >= DAGENS_MAKS ? prev : [...prev, { id: nyId(), navn: '', plattform: prev[prev.length - 1]?.plattform || '', type: 'aksjefond', verdi: 0, urealisert: null, behandling: 'flyttes' }]));
  const settAlle = (behandling) => setPosisjoner((prev) => prev.map((x) => ({ ...x, behandling })));

  // Leser vedlegg med Luna og legger posisjonene til i listen.
  const lesVedlegg = async ({ filer = [], tabell = null }) => {
    if (leser) return;
    setFeil(''); setMelding('');
    const klare = { images: [], dokumenter: [], tabeller: tabell ? [{ navn: tabell.navn, tekst: tabell.tekst }] : [] };
    const avvist = []; let bytes = tabell ? tabell.tekst.length : 0;
    if (filer.length + (tabell ? 1 : 0) > MAKS_VEDLEGG) { setFeil(`Du kan lese inn ${MAKS_VEDLEGG} vedlegg om gangen.`); return; }
    setLeser(true);
    try {
      for (const fil of filer) {
        const type = vedleggstype(fil);
        if (type === 'bilde') { klare.images.push({ mediaType: fil.type, data: await tilBase64(fil) }); bytes += fil.size; }
        else if (type === 'pdf') { klare.dokumenter.push({ mediaType: 'application/pdf', navn: fil.name, data: await tilBase64(fil) }); bytes += fil.size; }
        else if (type === 'tabell') {
          const XLSX = await import('xlsx');
          const t = regnearkTilTekst(XLSX, await fil.arrayBuffer(), fil.name || 'regneark');
          if (t.tekst) { klare.tabeller.push({ navn: t.navn, tekst: t.tekst }); bytes += t.tekst.length; } else avvist.push(`${fil.name} (tomt)`);
        } else avvist.push(fil.name || 'fil');
      }
      if (bytes > MAKS_SAMLET_BYTES) throw new Error(`Vedleggene er for store til sammen (grensen er ${Math.round(MAKS_SAMLET_BYTES / 1024 / 1024)} MB). Les inn færre om gangen.`);
      if (!klare.images.length && !klare.dokumenter.length && !klare.tabeller.length) throw new Error(avvist.length ? `Kunne ikke lese ${avvist.join(', ')}. Luna leser bilder, PDF og Excel/CSV.` : 'Ingen vedlegg å lese.');
      const svar = await fetch('/api/analyze-kundeskjermbilde', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...klare, modus: 'dagens' }) });
      const data = await svar.json();
      if (!svar.ok) throw new Error(data.error || 'Luna kunne ikke lese vedlegget.');
      const nye = (data.posisjoner || []).map((x) => ({ ...x, id: nyId(), behandling: 'flyttes' }));
      if (nye.length) setPosisjoner((prev) => [...prev, ...nye].slice(0, DAGENS_MAKS));
      if ((data.plattformer || []).length) setPlattformAvkastning((prev) => [...prev.filter((p) => !data.plattformer.some((n) => n.navn === p.navn)), ...data.plattformer]);
      const deler = [nye.length ? `Luna la inn ${nye.length} posisjoner. Se over navn, type og verdi.` : 'Luna fant ingen posisjoner i vedleggene.'];
      if ((data.utenVerdi || []).length) deler.push(`Uten lesbar verdi, ikke tatt med: ${data.utenVerdi.join(', ')}.`);
      if (data.merknad) deler.push(data.merknad);
      if (avvist.length) deler.push(`Kunne ikke lese ${avvist.join(', ')}.`);
      setMelding(deler.join(' '));
    } catch (err) {
      setFeil(err?.message || 'Luna kunne ikke lese vedlegget.');
    } finally {
      setLeser(false);
    }
  };
  const limInn = (event) => {
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target?.tagName)) return; // vanlig liming i feltene
    const filer = Array.from(event.clipboardData?.files || []);
    const tabell = tabellFraUtklipp(event.clipboardData?.getData('text/plain'));
    if (tabell && filer.every((f) => f.type.startsWith('image/'))) { event.preventDefault(); lesVedlegg({ tabell }); return; }
    if (filer.length) { event.preventDefault(); lesVedlegg({ filer }); }
  };

  const plattformer = [...new Set(posisjoner.map((x) => x.plattform).filter(Boolean))];
  const avkFor = (navn) => plattformAvkastning.find((p) => p.navn === navn)?.avkastningIaar;
  const settAvk = (navn, tekst) => {
    const t = String(tekst).replace(',', '.').replace('−', '-').replace(/[%\s]/g, ''); const v = Number(t);
    setPlattformAvkastning((prev) => [...prev.filter((p) => p.navn !== navn), ...(t !== '' && Number.isFinite(v) ? [{ navn, avkastningIaar: v }] : [])]);
  };

  return (
    <div className="space-y-6 no-print" onPaste={limInn} data-dagens>
      {/* Innlesing */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4" style={{ backgroundColor: PENSUM_COLORS.darkBlue }}>
          <h3 className="text-lg font-semibold text-white">Dagens portefølje</h3>
          <p className="text-xs text-blue-200 mt-0.5">Det kunden har i dag, for eksempel hos andre banker. Analysen under regnes ut fra posisjonene, og kan tas med som egne sider i investeringsforslaget.</p>
        </div>
        <div className="p-6">
          <div onDragOver={(e) => { e.preventDefault(); setDrar(true); }} onDragLeave={() => setDrar(false)}
            onDrop={(e) => { e.preventDefault(); setDrar(false); lesVedlegg({ filer: Array.from(e.dataTransfer?.files || []) }); }}
            className={"rounded-xl border-2 border-dashed px-6 py-5 flex flex-wrap items-center justify-between gap-4 transition-colors " + (drar ? "border-sky-400 bg-sky-50" : "border-gray-200 bg-slate-50")} data-dagens-slipp>
            <div>
              <p className="text-sm font-semibold" style={{ color: PENSUM_COLORS.darkBlue }}>{leser ? 'Luna leser vedleggene …' : 'La Luna lese porteføljen'}</p>
              <p className="text-xs text-gray-500 mt-0.5">Dra inn eller lim inn skjermbilder, PDF eller Excel fra banken (Ctrl+V), opptil {MAKS_VEDLEGG} om gangen. Posisjonene legges til i listen under.</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => filRef.current?.click()} disabled={leser} className="px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50" style={{ backgroundColor: PENSUM_COLORS.darkBlue }}>Velg filer</button>
              <button onClick={leggTil} className="px-4 py-2 rounded-lg text-sm font-semibold border border-gray-200 bg-white hover:bg-gray-50" style={{ color: PENSUM_COLORS.darkBlue }}>Legg til for hånd</button>
              <input ref={filRef} type="file" multiple accept="image/png,image/jpeg,image/webp,image/gif,application/pdf,.pdf,.xlsx,.xlsm,.xls,.csv,.tsv" className="hidden"
                onChange={(e) => { const filer = Array.from(e.target.files || []); e.target.value = ''; lesVedlegg({ filer }); }} />
            </div>
          </div>
          {feil && <div className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700" data-dagens-feil>{feil}</div>}
          {melding && <div className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-800" data-dagens-melding>{melding}</div>}
          <p className="text-[11px] text-gray-400 mt-2">AI kan lese feil. Kontroller tallene mot kilden. Vedleggene sendes til Pensums AI-tjeneste slik de er.</p>

          {posisjoner.length > 0 && (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-sm" data-dagens-tabell>
                <thead>
                  <tr className="text-[11px] uppercase tracking-wider text-gray-400 border-b border-gray-200">
                    <th className="py-2 text-left font-semibold">Verdipapir</th>
                    <th className="py-2 text-left font-semibold">Plattform</th>
                    <th className="py-2 text-left font-semibold">Type</th>
                    <th className="py-2 text-right font-semibold">Markedsverdi</th>
                    <th className="py-2 text-right font-semibold" title="Urealisert gevinst eller tap siden kjøp. Valgfritt.">Ureal. gevinst</th>
                    <th className="py-2 text-center font-semibold" title="Flyttes: selges og inngår i Pensum-forslaget. Beholdes: blir liggende utenfor og vises som kundens øvrige investeringer.">I ny portefølje</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {posisjoner.map((x) => (
                    <tr key={x.id} className="border-b border-gray-100">
                      <td className="py-1.5 pr-2"><input type="text" value={x.navn} onChange={(e) => oppdater(x.id, { navn: e.target.value.slice(0, 100) })} placeholder="Navn" aria-label="Verdipapir" className="w-full min-w-[12rem] border border-gray-200 rounded-lg py-1.5 px-2.5 text-sm focus:border-blue-400 focus:outline-none" /></td>
                      <td className="py-1.5 pr-2"><input type="text" value={x.plattform} onChange={(e) => oppdater(x.id, { plattform: e.target.value.slice(0, 40) })} placeholder="F.eks. Nordnet" list="dagens-plattformer" aria-label="Plattform" className="w-32 border border-gray-200 rounded-lg py-1.5 px-2.5 text-sm focus:border-blue-400 focus:outline-none" /></td>
                      <td className="py-1.5 pr-2"><select value={x.type} onChange={(e) => oppdater(x.id, { type: e.target.value })} aria-label="Type" className="border border-gray-200 rounded-lg py-1.5 px-2 text-sm bg-white">{Object.entries(DAGENS_TYPER).map(([id, t]) => <option key={id} value={id}>{t.navn}</option>)}</select></td>
                      <td className="py-1.5 pr-2"><input type="text" inputMode="numeric" value={x.verdi ? formatNumber(x.verdi) : ''} onChange={(e) => { const v = parseBelop(e.target.value); oppdater(x.id, { verdi: Number.isFinite(v) && v > 0 ? Math.min(1e12, v) : 0 }); }} placeholder="0" aria-label="Markedsverdi" className="w-32 border border-gray-200 rounded-lg py-1.5 px-2.5 text-sm text-right tabular-nums focus:border-blue-400 focus:outline-none" /></td>
                      <td className="py-1.5 pr-2"><input type="text" inputMode="numeric" key={`${x.id}:${x.urealisert}`} defaultValue={x.urealisert === null || x.urealisert === undefined ? '' : formatNumber(x.urealisert)}
                        onBlur={(e) => { const t = e.target.value.replace('−', '-').replace(/[\s ]/g, '').replace(/kr/i, ''); const v = Number(t); oppdater(x.id, { urealisert: t === '' || !Number.isFinite(v) ? null : Math.round(v) }); }}
                        onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur(); }} placeholder="–" aria-label="Urealisert gevinst" className="w-28 border border-gray-200 rounded-lg py-1.5 px-2.5 text-sm text-right tabular-nums focus:border-blue-400 focus:outline-none" /></td>
                      <td className="py-1.5 px-1 text-center whitespace-nowrap">
                        <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden text-xs font-semibold" role="group" aria-label="Behandling i ny portefølje">
                          {[['flyttes', 'Flyttes'], ['beholdes', 'Beholdes']].map(([verdi, etikett]) => (
                            <button key={verdi} onClick={() => oppdater(x.id, { behandling: verdi })} aria-pressed={x.behandling === verdi}
                              className={"px-2.5 py-1.5 " + (x.behandling === verdi ? "text-white" : "bg-white text-gray-500 hover:bg-gray-50")}
                              style={x.behandling === verdi ? { backgroundColor: verdi === 'flyttes' ? PENSUM_COLORS.darkBlue : PENSUM_COLORS.salmon } : {}}>{etikett}</button>
                          ))}
                        </div>
                      </td>
                      <td className="py-1.5 text-right"><button onClick={() => setPosisjoner((prev) => prev.filter((y) => y.id !== x.id))} aria-label={`Fjern ${x.navn || 'posisjonen'}`} className="text-gray-300 hover:text-red-600 text-lg leading-none px-1">×</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <datalist id="dagens-plattformer">{plattformer.map((pl) => <option key={pl} value={pl} />)}</datalist>
              <div className="flex flex-wrap items-center gap-3 mt-3 text-xs">
                <button onClick={leggTil} className="font-semibold underline" style={{ color: PENSUM_COLORS.darkBlue }}>+ Legg til posisjon</button>
                <span className="text-gray-300">|</span>
                <button onClick={() => settAlle('flyttes')} className="text-gray-500 underline">Alle flyttes</button>
                <button onClick={() => settAlle('beholdes')} className="text-gray-500 underline">Alle beholdes</button>
                <button onClick={() => { if (window.confirm('Fjerne alle posisjonene i dagens portefølje?')) { setPosisjoner([]); setPlattformAvkastning([]); setMelding(''); } }} className="text-gray-500 underline ml-auto">Tøm listen</button>
              </div>
              {plattformer.length > 0 && (
                <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-gray-600">
                  <span className="font-semibold uppercase tracking-wider text-gray-400" title="Hentes fra kildedokumentene. Verktøyet har ikke kurshistorikk for eksterne posisjoner.">Avkastning hittil i år</span>
                  {plattformer.map((pl) => (
                    <label key={pl} className="flex items-center gap-1.5">{pl}
                      <input type="text" inputMode="decimal" key={`${pl}:${avkFor(pl)}`} defaultValue={avkFor(pl) === undefined ? '' : String(avkFor(pl)).replace('.', ',')} onBlur={(e) => settAvk(pl, e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur(); }} placeholder="–" aria-label={`Avkastning hittil i år hos ${pl}`} className="w-16 border border-gray-200 rounded-lg py-1 px-2 text-right tabular-nums" /> %
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {analyse && (
        <>
          {/* Nøkkeltall */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" data-dagens-nokkeltall>
            {[
              ['Samlet markedsverdi', formatCurrency(analyse.total), analyse.urealisert !== null ? `Urealisert ${analyse.urealisert >= 0 ? '+' : '−'}${formatNumber(Math.abs(analyse.urealisert))} kr` : ''],
              ['Posisjoner', `${analyse.antallPosisjoner}${analyse.harKontanter ? ' + kontanter' : ''}`, `${analyse.antallFond} fond · ${analyse.antallEnkeltaksjer} enkeltaksjer${analyse.plattformer.length > 1 ? ` · ${analyse.plattformer.length} plattformer` : ''}`],
              ['Kontanter', `${p1(analyse.kontanter.andel)} %`, formatCurrency(analyse.kontanter.belop)],
              ['Største posisjon', `${p1(analyse.storsteAndel)} %`, analyse.storste[0]?.navn || ''],
            ].map(([etikett, verdi, under]) => (
              <div key={etikett} className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4">
                <div className="text-[11px] uppercase tracking-wider text-gray-400">{etikett}</div>
                <div className="text-2xl font-bold tabular-nums mt-1" style={{ color: PENSUM_COLORS.darkBlue }}>{verdi}</div>
                <div className="text-xs text-gray-500 mt-0.5 truncate" title={under}>{under || ' '}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-6">
            {/* Beholdning per aktivaklasse og plattform */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6" data-dagens-beholdning>
              <h4 className="font-semibold mb-4 text-sm tracking-wide uppercase" style={{ color: PENSUM_COLORS.darkBlue }}>Beholdning per aktivaklasse</h4>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ backgroundColor: PENSUM_COLORS.darkBlue }}>
                    <th className="py-2 px-3 text-left text-white font-semibold">Aktivaklasse</th>
                    {analyse.plattformer.length > 1 && analyse.plattformer.length <= 3 && analyse.plattformer.map((pl) => <th key={pl} className="py-2 px-3 text-right text-white font-semibold">{pl}</th>)}
                    <th className="py-2 px-3 text-right text-white font-semibold">Totalt</th>
                    <th className="py-2 px-3 text-right text-white font-semibold">Andel</th>
                    {analyse.urealisert !== null && <th className="py-2 px-3 text-right text-white font-semibold">Ureal. gevinst</th>}
                  </tr>
                </thead>
                <tbody>
                  {analyse.perType.map((t, i) => (
                    <tr key={t.type} className={i % 2 ? 'bg-gray-50' : ''}>
                      <td className="py-2 px-3 font-medium" style={{ color: PENSUM_COLORS.darkBlue }}>{t.navn}{t.type !== 'kontanter' ? ` (${t.antall})` : ''}</td>
                      {analyse.plattformer.length > 1 && analyse.plattformer.length <= 3 && analyse.plattformer.map((pl) => <td key={pl} className="py-2 px-3 text-right tabular-nums text-gray-600">{t.perPlattform[pl] ? formatNumber(t.perPlattform[pl]) : '–'}</td>)}
                      <td className="py-2 px-3 text-right tabular-nums">{formatNumber(t.total)}</td>
                      <td className="py-2 px-3 text-right tabular-nums">{p1(t.andel)} %</td>
                      {analyse.urealisert !== null && <td className="py-2 px-3 text-right tabular-nums" style={{ color: t.urealisert === null ? '#9CA3AF' : (t.urealisert < 0 ? PENSUM_COLORS.red : PENSUM_COLORS.teal) }}>{t.urealisert === null ? '–' : `${t.urealisert >= 0 ? '+' : '−'}${formatNumber(Math.abs(t.urealisert))}`}</td>}
                    </tr>
                  ))}
                  <tr style={{ backgroundColor: PENSUM_COLORS.darkBlue }}>
                    <td className="py-2 px-3 font-bold text-white">Totalt</td>
                    {analyse.plattformer.length > 1 && analyse.plattformer.length <= 3 && analyse.perPlattform.map((pl) => <td key={pl.navn} className="py-2 px-3 text-right tabular-nums font-bold text-white">{formatNumber(pl.total)}</td>)}
                    <td className="py-2 px-3 text-right tabular-nums font-bold text-white">{formatNumber(analyse.total)}</td>
                    <td className="py-2 px-3 text-right tabular-nums font-bold text-white">100 %</td>
                    {analyse.urealisert !== null && <td className="py-2 px-3 text-right tabular-nums font-bold text-white">{analyse.urealisert >= 0 ? '+' : '−'}{formatNumber(Math.abs(analyse.urealisert))}</td>}
                  </tr>
                </tbody>
              </table>
              <h4 className="font-semibold mt-6 mb-3 text-sm tracking-wide uppercase" style={{ color: PENSUM_COLORS.darkBlue }}>Største enkeltposisjoner</h4>
              <div className="space-y-1.5">
                {analyse.storste.map((s) => (
                  <div key={s.navn + s.verdi} className="grid grid-cols-[11rem_1fr_6.5rem] items-center gap-3 text-xs">
                    <span className="truncate text-gray-700 text-right" title={s.navn}>{s.navn}</span>
                    <span className="h-3 rounded-sm" style={{ width: `${Math.max(2, (s.verdi / analyse.storste[0].verdi) * 100)}%`, backgroundColor: PENSUM_COLORS.salmon }}></span>
                    <span className="tabular-nums text-gray-600">{formatNumber(s.verdi)} · {p1(s.andel)} %</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              {/* Flyttes og beholdes */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6" data-dagens-struktur>
                <h4 className="font-semibold mb-3 text-sm tracking-wide uppercase" style={{ color: PENSUM_COLORS.darkBlue }}>Ny struktur</h4>
                <div className="h-8 rounded-lg overflow-hidden flex text-[11px] font-semibold text-white">
                  {analyse.flyttes > 0 && <div className="flex items-center px-2 whitespace-nowrap overflow-hidden" style={{ width: `${(analyse.flyttes / analyse.total) * 100}%`, backgroundColor: PENSUM_COLORS.darkBlue }}>Pensum {p1((analyse.flyttes / analyse.total) * 100)} %</div>}
                  {analyse.beholdes > 0 && <div className="flex items-center px-2 whitespace-nowrap overflow-hidden" style={{ width: `${(analyse.beholdes / analyse.total) * 100}%`, backgroundColor: PENSUM_COLORS.salmon }}>Beholdes {p1((analyse.beholdes / analyse.total) * 100)} %</div>}
                </div>
                <div className="mt-3 space-y-1 text-sm">
                  <div className="flex justify-between"><span className="text-gray-600">Flyttes til Pensum-forslaget</span><strong className="tabular-nums" style={{ color: PENSUM_COLORS.darkBlue }}>{formatCurrency(analyse.flyttes)}</strong></div>
                  <div className="flex justify-between"><span className="text-gray-600">Beholdes utenfor ({analyse.beholdtePosisjoner.length} posisjoner)</span><strong className="tabular-nums" style={{ color: PENSUM_COLORS.darkBlue }}>{formatCurrency(analyse.beholdes)}</strong></div>
                </div>
                <button onClick={onBrukIForslaget} className="mt-4 w-full px-4 py-2.5 rounded-lg text-sm font-semibold text-white" style={{ backgroundColor: PENSUM_COLORS.darkBlue }} data-dagens-bruk>Bruk i forslaget</button>
                <p className="text-[11px] text-gray-500 mt-2">{bruktIForslaget
                  ? 'Forslaget bruker disse tallene nå.'
                  : `Setter beløpet som skal investeres hos Pensum til ${formatCurrency(analyse.flyttes)}${analyse.beholdes > 0 ? ', og legger det som beholdes inn under «Kundens øvrige investeringer»' : ''}.`}</p>
              </div>

              {/* Dagens mot ny */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6" data-dagens-motny>
                <h4 className="font-semibold mb-1 text-sm tracking-wide uppercase" style={{ color: PENSUM_COLORS.darkBlue }}>Dagens mot ny portefølje</h4>
                {!sammenligning ? <p className="text-sm text-gray-500 mt-2">Bygg Pensum-porteføljen under Porteføljebygging for å se sammenligningen.</p> : (
                  <>
                    <p className="text-[11px] text-gray-500 mb-3">Ny = Pensum-forslaget ({formatCurrency(sammenligning.pensumBelop)}){sammenligning.beholdtBelop > 0 ? ` + det som beholdes (${formatCurrency(sammenligning.beholdtBelop)})` : ''}.</p>
                    <div className="space-y-2.5">
                      {sammenligning.klasser.map((k) => (
                        <div key={k.navn} className="text-xs">
                          <div className="flex justify-between text-gray-700 mb-1"><span className="font-semibold">{k.navn}</span><span className="tabular-nums">{p1(k.dagens)} % → <strong style={{ color: PENSUM_COLORS.darkBlue }}>{p1(k.ny)} %</strong></span></div>
                          <div className="h-2 rounded-full" style={{ backgroundColor: '#EEF2F6' }}><div className="h-2 rounded-full" style={{ width: `${Math.min(100, k.dagens)}%`, backgroundColor: '#CBD5E1' }}></div></div>
                          <div className="h-2 rounded-full mt-0.5" style={{ backgroundColor: '#EEF2F6' }}><div className="h-2 rounded-full" style={{ width: `${Math.min(100, k.ny)}%`, backgroundColor: KLASSEFARGE[k.navn] || PENSUM_COLORS.darkBlue }}></div></div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-3 border-t border-gray-100 grid grid-cols-[1fr_auto_auto] gap-x-4 gap-y-1 text-xs">
                      <span></span><span className="text-gray-400 text-right">Dagens</span><span className="text-gray-400 text-right">Ny</span>
                      <span className="text-gray-600">Posisjoner</span><span className="tabular-nums text-right">{sammenligning.posisjoner.dagens}</span><span className="tabular-nums text-right font-semibold" style={{ color: PENSUM_COLORS.darkBlue }}>{sammenligning.posisjoner.nyProdukter} produkter{sammenligning.posisjoner.nyBeholdt ? ` + ${sammenligning.posisjoner.nyBeholdt} beholdt` : ''}</span>
                      <span className="text-gray-600">Kontanter</span><span className="tabular-nums text-right">{p1(sammenligning.kontanter.dagens)} %</span><span className="tabular-nums text-right font-semibold" style={{ color: PENSUM_COLORS.darkBlue }}>{p1(sammenligning.kontanter.ny)} %</span>
                      {sammenligning.forventetAvkastning !== null && <><span className="text-gray-600">Forventet avkastning</span><span className="text-right text-gray-400">ikke definert</span><span className="tabular-nums text-right font-semibold" style={{ color: PENSUM_COLORS.darkBlue }}>{p1(sammenligning.forventetAvkastning)} % (Pensum-delen)</span></>}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-400">Sidene «Dagens portefølje» og «Dagens mot ny portefølje» kan velges under Investeringsforslag. Vurderingsteksten («Vår vurdering») kommer i neste versjon.</p>
        </>
      )}
    </div>
  );
}
