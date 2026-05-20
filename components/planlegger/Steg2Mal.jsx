import React, { useMemo } from 'react';
import { HENDELSE_TYPER, tomHendelse } from '../../lib/formuesplanleggerState';

/* ─── Formatting helpers ─── */
const fmtNOK = (v) =>
  new Intl.NumberFormat('nb-NO', {
    style: 'currency',
    currency: 'NOK',
    maximumFractionDigits: 0,
  }).format(v);

const genId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

/* ─── Risk scale config (1-7 PRIIPs SRI style) ─── */
const RISK_LABELS = [
  { level: 1, label: 'Svært lav',  color: '#16a34a' },
  { level: 2, label: 'Lav',        color: '#65a30d' },
  { level: 3, label: 'Lav–middels', color: '#ca8a04' },
  { level: 4, label: 'Middels',    color: '#eab308' },
  { level: 5, label: 'Middels–høy', color: '#f97316' },
  { level: 6, label: 'Høy',        color: '#ef4444' },
  { level: 7, label: 'Svært høy',  color: '#dc2626' },
];

/* ─── Shared input class ─── */
const INPUT_CLS =
  'w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300';

/* ═══════════════════════════════════════════════════════════════
   Main component
   ═══════════════════════════════════════════════════════════════ */
export default function Steg2Mal({ state, dispatch }) {
  const hovedhorisont = state.hovedhorisont ?? 10;
  const potter = state.potter || [];
  const likviditetMaaRealisere = state.likviditetMaaRealisere ?? 0;
  const likviditetBuffer = state.likviditetBuffer ?? 0;
  const risikotoleranse = state.risikotoleranse ?? 4;
  const aarligUttak = state.aarligUttak ?? 0;
  const uttakStartAar = state.uttakStartAar ?? new Date().getFullYear() + 10;
  const hendelser = state.hendelser || [];
  const eiendeler = state.eiendeler || [];

  /* ─── Computed: sum eiendeler for stresstest ─── */
  const sumEiendeler = useMemo(
    () => eiendeler.reduce((s, e) => s + (Number(e.verdi) || 0), 0),
    [eiendeler],
  );

  /* Stresstest: worst-case yearly loss at given risk level */
  const stressTap = useMemo(() => {
    const drawdownPct = (risikotoleranse / 7) * 0.4;
    return Math.round(drawdownPct * sumEiendeler);
  }, [risikotoleranse, sumEiendeler]);

  const currentRiskMeta = RISK_LABELS[risikotoleranse - 1] || RISK_LABELS[3];

  /* ─── Potter helpers ─── */
  const addPotte = () => {
    dispatch(prev => ({
      ...prev,
      potter: [
        ...(prev.potter || []),
        { id: genId(), navn: '', horisont: 10, belop: 0 },
      ],
    }));
  };

  const updatePotte = (id, field, value) => {
    dispatch(prev => ({
      ...prev,
      potter: (prev.potter || []).map(p =>
        p.id === id ? { ...p, [field]: value } : p,
      ),
    }));
  };

  const removePotte = (id) => {
    dispatch(prev => ({
      ...prev,
      potter: (prev.potter || []).filter(p => p.id !== id),
    }));
  };

  /* ─── Hendelser helpers ─── */
  const addHendelse = () => {
    dispatch(prev => ({
      ...prev,
      hendelser: [...(prev.hendelser || []), tomHendelse()],
    }));
  };

  const updateHendelse = (id, field, value) => {
    dispatch(prev => ({
      ...prev,
      hendelser: (prev.hendelser || []).map(h =>
        h.id === id ? { ...h, [field]: value } : h,
      ),
    }));
  };

  const removeHendelse = (id) => {
    dispatch(prev => ({
      ...prev,
      hendelser: (prev.hendelser || []).filter(h => h.id !== id),
    }));
  };

  /* ─── Simple field setter ─── */
  const set = (field, value) => dispatch({ [field]: value });

  return (
    <div className="space-y-6">

      {/* ═══ 1. TIDSHORISONT ═══ */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div
          className="px-6 py-4 flex items-center justify-between"
          style={{ backgroundColor: '#012441' }}
        >
          <h2 className="text-lg font-semibold text-white">Tidshorisont</h2>
          <span className="text-blue-300 text-sm font-medium">
            Hovedhorisont: {hovedhorisont} år
          </span>
        </div>

        <div className="px-6 py-6 space-y-6">
          {/* Hovedhorisont slider + input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Hovedhorisont (år)
            </label>
            <div className="flex items-center gap-6">
              <input
                type="range"
                min={1}
                max={40}
                value={hovedhorisont}
                onChange={e => set('hovedhorisont', Number(e.target.value))}
                className="flex-1 h-2 rounded-lg appearance-none cursor-pointer accent-[#012441]"
                style={{
                  background: `linear-gradient(to right, #012441 ${((hovedhorisont - 1) / 39) * 100}%, #e5e7eb ${((hovedhorisont - 1) / 39) * 100}%)`,
                }}
              />
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={40}
                  value={hovedhorisont}
                  onChange={e => {
                    const v = Math.min(40, Math.max(1, Number(e.target.value) || 1));
                    set('hovedhorisont', v);
                  }}
                  className="w-20 px-3 py-2 border border-gray-200 rounded-md text-sm text-center font-semibold focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300"
                />
                <span className="text-sm text-gray-500">år</span>
              </div>
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1 px-0.5">
              <span>1</span>
              <span>10</span>
              <span>20</span>
              <span>30</span>
              <span>40</span>
            </div>
          </div>

          {/* Potter (sub-horizons) */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold text-gray-700">
                Potter (delmål)
              </label>
              <button
                onClick={addPotte}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium border border-dashed transition-colors hover:bg-gray-50"
                style={{ borderColor: '#012441', color: '#012441' }}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Legg til potte
              </button>
            </div>

            {potter.length === 0 && (
              <p className="text-sm text-gray-400 italic">
                Ingen potter definert. Legg til for eksempel Pensjon, Hytte, Barnegave.
              </p>
            )}

            <div className="space-y-3">
              {potter.map(potte => (
                <div
                  key={potte.id}
                  className="bg-gray-50 rounded-lg border border-gray-200 px-4 py-3"
                >
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Navn</label>
                      <input
                        type="text"
                        value={potte.navn}
                        onChange={e => updatePotte(potte.id, 'navn', e.target.value)}
                        placeholder="F.eks. Pensjon, Hytte"
                        className={INPUT_CLS}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Horisont (år)</label>
                      <input
                        type="number"
                        min={1}
                        max={40}
                        value={potte.horisont || ''}
                        onChange={e => updatePotte(potte.id, 'horisont', e.target.value === '' ? 0 : Number(e.target.value))}
                        className={`${INPUT_CLS} text-right`}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Beløp (NOK)</label>
                      <input
                        type="number"
                        value={potte.belop || ''}
                        onChange={e => updatePotte(potte.id, 'belop', e.target.value === '' ? 0 : Number(e.target.value))}
                        placeholder="0"
                        className={`${INPUT_CLS} text-right`}
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={() => removePotte(potte.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors p-2"
                        title="Fjern potte"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ═══ 2. LIKVIDITETSBEHOV ═══ */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div
          className="px-6 py-4"
          style={{ backgroundColor: '#012441' }}
        >
          <h2 className="text-lg font-semibold text-white">Likviditetsbehov</h2>
        </div>

        <div className="px-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Må kunne realisere innen 12 måneder
              </label>
              <p className="text-xs text-gray-400 mb-2">
                Midler du trenger tilgjengelig på kort sikt
              </p>
              <div className="relative">
                <input
                  type="number"
                  value={likviditetMaaRealisere || ''}
                  onChange={e => set('likviditetMaaRealisere', e.target.value === '' ? 0 : Number(e.target.value))}
                  placeholder="0"
                  className={`${INPUT_CLS} text-right pr-14`}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">
                  NOK
                </span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Buffer for uventede utgifter
              </label>
              <p className="text-xs text-gray-400 mb-2">
                Ekstra sikkerhetsbuffer utover vanlig likviditet
              </p>
              <div className="relative">
                <input
                  type="number"
                  value={likviditetBuffer || ''}
                  onChange={e => set('likviditetBuffer', e.target.value === '' ? 0 : Number(e.target.value))}
                  placeholder="0"
                  className={`${INPUT_CLS} text-right pr-14`}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">
                  NOK
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ 3. RISIKOTOLERANSE ═══ */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div
          className="px-6 py-4"
          style={{ backgroundColor: '#012441' }}
        >
          <h2 className="text-lg font-semibold text-white">Risikotoleranse</h2>
        </div>

        <div className="px-6 py-6 space-y-6">
          {/* Scale 1-7 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-4">
              Risikonivå (EU PRIIPs SRI-skala)
            </label>

            {/* Visual 1-7 button strip */}
            <div className="flex gap-0 rounded-xl overflow-hidden border border-gray-200 mb-3">
              {RISK_LABELS.map(({ level, label, color }) => {
                const isSelected = risikotoleranse === level;
                return (
                  <button
                    key={level}
                    onClick={() => set('risikotoleranse', level)}
                    className="flex-1 py-4 flex flex-col items-center gap-1 transition-all relative"
                    style={{
                      backgroundColor: isSelected ? color : `${color}18`,
                      color: isSelected ? '#fff' : color,
                    }}
                  >
                    <span className="text-2xl font-bold leading-none">{level}</span>
                    <span
                      className="text-[10px] font-medium leading-tight text-center px-1"
                      style={{ opacity: isSelected ? 1 : 0.8 }}
                    >
                      {label}
                    </span>
                    {isSelected && (
                      <div
                        className="absolute -bottom-0 left-1/2 -translate-x-1/2 w-0 h-0"
                        style={{
                          borderLeft: '8px solid transparent',
                          borderRight: '8px solid transparent',
                          borderTop: `8px solid ${color}`,
                          bottom: '-8px',
                        }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Gradient bar underneath */}
            <div
              className="h-2 rounded-full mb-1"
              style={{
                background: 'linear-gradient(to right, #16a34a, #65a30d, #ca8a04, #eab308, #f97316, #ef4444, #dc2626)',
              }}
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>Lavest risiko</span>
              <span>Høyest risiko</span>
            </div>
          </div>

          {/* Stresstest */}
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              Tap-stresstest
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Med din formue på{' '}
              <span className="font-semibold">{fmtNOK(sumEiendeler)}</span>{' '}
              og risikonivå{' '}
              <span className="font-semibold" style={{ color: currentRiskMeta.color }}>
                {risikotoleranse} ({currentRiskMeta.label})
              </span>
              {' '}ville et dårlig år bety ca.
            </p>
            <div className="mt-3 mb-2">
              <span className="text-3xl font-bold text-red-600">
                {fmtNOK(-stressTap)}
              </span>
              <span className="text-sm text-gray-500 ml-2">
                i verditap ({((risikotoleranse / 7) * 40).toFixed(1).replace('.', ',')} % drawdown)
              </span>
            </div>
            <p className="text-sm text-gray-500 italic">
              Kan du leve med dette? Juster risikonivået over om dette er for mye.
            </p>
          </div>
        </div>
      </div>

      {/* ═══ 4. INNTEKTSBEHOV OG FREMTIDIGE HENDELSER ═══ */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div
          className="px-6 py-4"
          style={{ backgroundColor: '#012441' }}
        >
          <h2 className="text-lg font-semibold text-white">
            Inntektsbehov og fremtidige hendelser
          </h2>
        </div>

        <div className="px-6 py-6 space-y-8">
          {/* Uttaksplan */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Uttaksplan
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Årlig uttak (NOK, indeksregulert)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={aarligUttak || ''}
                    onChange={e => set('aarligUttak', e.target.value === '' ? 0 : Number(e.target.value))}
                    placeholder="0"
                    className={`${INPUT_CLS} text-right pr-14`}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">
                    NOK
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Fra hvilket år starter uttaket
                </label>
                <input
                  type="number"
                  value={uttakStartAar || ''}
                  onChange={e => set('uttakStartAar', e.target.value === '' ? 0 : Number(e.target.value))}
                  className={`${INPUT_CLS} text-right`}
                />
              </div>
            </div>
          </div>

          {/* Fremtidige hendelser */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold text-gray-700">
                Diskrete fremtidige hendelser
              </label>
              <button
                onClick={addHendelse}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium border border-dashed transition-colors hover:bg-gray-50"
                style={{ borderColor: '#012441', color: '#012441' }}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Legg til hendelse
              </button>
            </div>

            {hendelser.length === 0 && (
              <p className="text-sm text-gray-400 italic">
                Ingen hendelser lagt til. Eksempler: boligsalg, arv, generasjonsoverføring.
              </p>
            )}

            <div className="space-y-3">
              {hendelser.map(h => (
                <div
                  key={h.id}
                  className="bg-gray-50 rounded-lg border border-gray-200 px-4 py-3"
                >
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
                    {/* Type */}
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Type</label>
                      <select
                        value={h.type}
                        onChange={e => updateHendelse(h.id, 'type', e.target.value)}
                        className={`${INPUT_CLS} bg-white`}
                      >
                        {HENDELSE_TYPER.map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>

                    {/* År */}
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">År</label>
                      <input
                        type="number"
                        value={h.aar || ''}
                        onChange={e => updateHendelse(h.id, 'aar', e.target.value === '' ? 0 : Number(e.target.value))}
                        className={`${INPUT_CLS} text-right`}
                      />
                    </div>

                    {/* Beløp */}
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        Beløp (+ inn / &minus; ut)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={h.belop === 0 ? '' : h.belop}
                          onChange={e => updateHendelse(h.id, 'belop', e.target.value === '' ? 0 : Number(e.target.value))}
                          placeholder="0"
                          className={`${INPUT_CLS} text-right pr-14`}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">
                          NOK
                        </span>
                      </div>
                    </div>

                    {/* Kommentar */}
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Kommentar</label>
                      <input
                        type="text"
                        value={h.kommentar || ''}
                        onChange={e => updateHendelse(h.id, 'kommentar', e.target.value)}
                        placeholder="Valgfri"
                        className={INPUT_CLS}
                      />
                    </div>

                    {/* Remove */}
                    <div className="flex items-end">
                      <button
                        onClick={() => removeHendelse(h.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors p-2"
                        title="Fjern hendelse"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
