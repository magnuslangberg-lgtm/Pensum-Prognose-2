import React, { useMemo } from 'react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
} from 'recharts';

/* ─── Constants ─── */
const NAVY = '#012441';

const PENSUM_MANDATER = [
  { navn: 'Pensum Global Core Active', avk: 7, vol: 12, kostnad: '0.75%', risiko: 'middels', beskrivelse: 'Kjernemandat i globale aksjer' },
  { navn: 'Pensum Global Edge', avk: 8, vol: 16, kostnad: '1.00%', risiko: 'høy', beskrivelse: 'Konsentrert global vekstportefølje' },
  { navn: 'Pensum Norge', avk: 8, vol: 18, kostnad: '0.75%', risiko: 'høy', beskrivelse: 'Norske aksjer med aktiv forvaltning' },
  { navn: 'Pensum Financial Opportunities', avk: 7, vol: 14, kostnad: '1.00%', risiko: 'middels', beskrivelse: 'Finanssektoren globalt' },
  { navn: 'Pensum Nordic Banking', avk: 9, vol: 20, kostnad: '1.00%', risiko: 'høy', beskrivelse: 'Nordiske bankaksjer' },
  { navn: 'Pensum Energy', avk: 9, vol: 22, kostnad: '1.00%', risiko: 'høy', beskrivelse: 'Global energisektor' },
  { navn: 'Pensum Nordisk Høyrente', avk: 6, vol: 5, kostnad: '0.50%', risiko: 'lav', beskrivelse: 'Nordisk høyrenteobligasjoner' },
  { navn: 'Pensum Basis', avk: 5, vol: 8, kostnad: '0.40%', risiko: 'lav', beskrivelse: 'Balansert kjernefond 50/50' },
];

const KATEGORI_FARGER = {
  'Aksjer':      '#6B9DB8',
  'Renter':      '#2D6A6A',
  'Alternative': '#A67B3D',
  'Kontanter':   '#9EAAB4',
  'Annet':       '#C4967E',
};

const MANDAT_FARGER = [
  '#6B9DB8', '#2D6A6A', '#A67B3D', '#C4967E',
  '#012441', '#D97706', '#059669', '#7C3AED',
];

const RISIKO_FARGE = {
  'lav': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', dot: 'bg-green-500' },
  'middels': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' },
  'høy': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500' },
};

/* ─── Formatting helpers ─── */
const fmtNOK = (v) =>
  new Intl.NumberFormat('nb-NO', {
    style: 'currency',
    currency: 'NOK',
    maximumFractionDigits: 0,
  }).format(v);

const fmtNOKShort = (v) => {
  const abs = Math.abs(v);
  if (abs >= 1_000_000) return `${(v / 1_000_000).toFixed(1).replace('.', ',')} MNOK`;
  if (abs >= 1_000) return `${(v / 1_000).toFixed(0)} TNOK`;
  return `${v}`;
};

const fmtPct = (v) => `${Number(v).toFixed(1).replace('.', ',')} %`;

/* ─── Category classification ─── */
function classifyPosition(pos) {
  const uk = (pos.underkategori || '').toLowerCase();
  if (uk.includes('aksje') || uk.includes('aksjefond')) return 'Aksjer';
  if (uk.includes('høyrente') || uk.includes('rente') || uk.includes('rentefond')) return 'Renter';
  if (uk.includes('pe') || uk.includes('eiendom') || uk.includes('shipping')) return 'Alternative';
  if (uk.includes('bank') || uk.includes('innskudd')) return 'Kontanter';
  // Check if it's a Pensum mandate name
  const mandatNavnLower = PENSUM_MANDATER.map(m => m.navn.toLowerCase());
  if (mandatNavnLower.some(n => uk.includes(n) || n.includes(uk))) return 'Aksjer';
  return 'Annet';
}

/* ─── Recharts custom tooltip ─── */
function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white shadow-lg rounded-lg border border-gray-200 px-4 py-3 text-sm">
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: entry.payload?.fill || entry.color }} />
          <span className="text-gray-700">{entry.name}:</span>
          <span className="font-semibold text-gray-900">{fmtPct(entry.value)}</span>
        </div>
      ))}
    </div>
  );
}

function ChartTooltipNOK({ active, payload }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white shadow-lg rounded-lg border border-gray-200 px-4 py-3 text-sm">
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: entry.payload?.fill || entry.color }} />
          <span className="text-gray-700">{entry.name}:</span>
          <span className="font-semibold text-gray-900">{fmtNOK(entry.value)}</span>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Main component
   ═══════════════════════════════════════════════════════════════ */
export default function Steg3Allokering({ state, dispatch }) {
  const eiendeler = state.eiendeler || [];
  const forslaattAllokering = state.forslaattAllokering || {};

  /* ─── Dagens allokering: group likvid portfolio by high-level categories ─── */
  const dagensData = useMemo(() => {
    // Only include items from Likvid portefolje category
    const likvide = eiendeler.filter(e => e.kategori === 'Likvid portefølje');
    const sumLikvid = likvide.reduce((s, e) => s + (Number(e.verdi) || 0), 0);

    const groups = {};
    likvide.forEach(pos => {
      const cat = classifyPosition(pos);
      if (!groups[cat]) {
        groups[cat] = { verdi: 0, vektetAvk: 0, vektetVol: 0 };
      }
      const v = Number(pos.verdi) || 0;
      groups[cat].verdi += v;
      groups[cat].vektetAvk += v * (Number(pos.forventetAvkastning) || 0);
      groups[cat].vektetVol += v * (Number(pos.forventetVolatilitet) || 0);
    });

    const result = Object.entries(groups)
      .filter(([, g]) => g.verdi > 0)
      .map(([name, g]) => ({
        name,
        value: sumLikvid > 0 ? (g.verdi / sumLikvid) * 100 : 0,
        verdi: g.verdi,
        fill: KATEGORI_FARGER[name] || '#9EAAB4',
      }));

    // Aggregated figures
    const aggAvk = sumLikvid > 0
      ? Object.values(groups).reduce((s, g) => s + g.vektetAvk, 0) / sumLikvid
      : 0;
    const aggVol = sumLikvid > 0
      ? Object.values(groups).reduce((s, g) => s + g.vektetVol, 0) / sumLikvid
      : 0;

    return { pieData: result, sumLikvid, aggAvk, aggVol };
  }, [eiendeler]);

  /* ─── Foreslatt allokering computed metrics ─── */
  const forslaattData = useMemo(() => {
    const sumPct = Object.values(forslaattAllokering).reduce((s, v) => s + (Number(v) || 0), 0);
    let aggAvk = 0;
    let aggVol = 0;
    let aggKostnad = 0;

    const pieData = PENSUM_MANDATER
      .filter(m => (Number(forslaattAllokering[m.navn]) || 0) > 0)
      .map((m, idx) => {
        const pct = Number(forslaattAllokering[m.navn]) || 0;
        aggAvk += (pct / 100) * m.avk;
        aggVol += (pct / 100) * m.vol;
        aggKostnad += (pct / 100) * parseFloat(m.kostnad);
        return {
          name: m.navn.replace('Pensum ', ''),
          value: pct,
          fill: MANDAT_FARGER[idx % MANDAT_FARGER.length],
        };
      });

    return { pieData, sumPct, aggAvk, aggVol, aggKostnad };
  }, [forslaattAllokering]);

  /* ─── Diff between today and proposed ─── */
  const diffData = useMemo(() => {
    if (dagensData.sumLikvid === 0 || forslaattData.sumPct === 0) return [];

    // Map today's categories to values
    const todayMap = {};
    dagensData.pieData.forEach(d => { todayMap[d.name] = d.verdi; });
    const totalToday = dagensData.sumLikvid;

    // Proposed: map mandates to high-level categories
    const proposedMap = {};
    PENSUM_MANDATER.forEach(m => {
      const pct = Number(forslaattAllokering[m.navn]) || 0;
      if (pct <= 0) return;
      // Classify mandate
      let cat;
      const nameLower = m.navn.toLowerCase();
      if (nameLower.includes('høyrente')) cat = 'Renter';
      else if (nameLower.includes('basis')) cat = 'Renter'; // 50/50 mixed, approximate
      else cat = 'Aksjer';
      proposedMap[cat] = (proposedMap[cat] || 0) + (pct / 100) * totalToday;
    });

    // Build diff entries
    const allCats = new Set([...Object.keys(todayMap), ...Object.keys(proposedMap)]);
    const diffs = [];
    allCats.forEach(cat => {
      const fra = todayMap[cat] || 0;
      const til = proposedMap[cat] || 0;
      const diff = til - fra;
      if (Math.abs(diff) > 1000) { // Only show meaningful diffs
        diffs.push({ kategori: cat, fra, til, diff });
      }
    });

    return diffs.sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff));
  }, [dagensData, forslaattData, forslaattAllokering]);

  /* ─── Slider handler ─── */
  const handleSliderChange = (mandatNavn, newValue) => {
    dispatch(prev => ({
      ...prev,
      forslaattAllokering: {
        ...(prev.forslaattAllokering || {}),
        [mandatNavn]: Number(newValue),
      },
    }));
  };

  const sumPct = forslaattData.sumPct;
  const sumOk = Math.abs(sumPct - 100) < 0.01;

  return (
    <div className="space-y-6">

      {/* ═══ HEADER ═══ */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-8 py-5" style={{ backgroundColor: NAVY }}>
          <h2 className="text-xl font-semibold text-white text-center">
            Allokering — fra dagens til foreslatt
          </h2>
          <p className="text-blue-300 text-sm text-center mt-1">
            Sammenlign dagens portefolje med foreslatt Pensum-allokering
          </p>
        </div>
      </div>

      {/* ═══ TWO COLUMNS: Dagens vs Foreslatt ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ─── LEFT: Dagens allokering ─── */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100" style={{ backgroundColor: NAVY }}>
            <h3 className="text-base font-semibold text-white">Dagens allokering</h3>
            <p className="text-blue-300 text-xs mt-0.5">Auto-utledet fra likvid portefolje (Steg 1)</p>
          </div>

          <div className="p-6">
            {dagensData.sumLikvid > 0 ? (
              <>
                {/* Pie chart */}
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={dagensData.pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={90}
                      paddingAngle={2}
                      stroke="none"
                    >
                      {dagensData.pieData.map((entry, idx) => (
                        <Cell key={idx} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                    <Legend
                      verticalAlign="bottom"
                      iconType="circle"
                      iconSize={10}
                      formatter={(val) => <span className="text-xs text-gray-600">{val}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>

                {/* Category breakdown table */}
                <div className="mt-4 space-y-2">
                  {dagensData.pieData.map(d => (
                    <div key={d.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: d.fill }} />
                        <span className="text-gray-700">{d.name}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-gray-500 text-xs">{fmtNOKShort(d.verdi)}</span>
                        <span className="font-semibold text-gray-800 w-14 text-right">{fmtPct(d.value)}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Key figures */}
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <div className="text-xs text-gray-500 font-medium mb-1">Total likvid</div>
                    <div className="text-lg font-bold text-gray-800">{fmtNOKShort(dagensData.sumLikvid)}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <div className="text-xs text-gray-500 font-medium mb-1">Forv. avkastning</div>
                    <div className="text-lg font-bold text-gray-800">{fmtPct(dagensData.aggAvk)}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-center col-span-2">
                    <div className="text-xs text-gray-500 font-medium mb-1">Forv. volatilitet (std.avvik)</div>
                    <div className="text-lg font-bold text-gray-800">{fmtPct(dagensData.aggVol)}</div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-2">
                  <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
                  </svg>
                </div>
                <p className="text-gray-500 text-sm font-medium">Ingen likvide posisjoner registrert</p>
                <p className="text-gray-400 text-xs mt-1">Legg til eiendeler under "Likvid portefolje" i Steg 1</p>
              </div>
            )}
          </div>
        </div>

        {/* ─── RIGHT: Foreslatt allokering ─── */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100" style={{ backgroundColor: NAVY }}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-white">Foreslatt allokering</h3>
                <p className="text-blue-300 text-xs mt-0.5">Juster vektene per Pensum-mandat</p>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                sumOk
                  ? 'bg-green-500/20 text-green-300'
                  : 'bg-red-500/20 text-red-300'
              }`}>
                Sum: {fmtPct(sumPct)}
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Sum warning */}
            {!sumOk && sumPct > 0 && (
              <div className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium ${
                sumPct > 100
                  ? 'bg-red-50 text-red-700 border border-red-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}>
                {sumPct > 100
                  ? `Summen er ${fmtPct(sumPct)} — reduser med ${fmtPct(sumPct - 100)}`
                  : `Summen er ${fmtPct(sumPct)} — ${fmtPct(100 - sumPct)} gjenstår`
                }
              </div>
            )}

            {/* Sliders */}
            <div className="space-y-4">
              {PENSUM_MANDATER.map((mandat, idx) => {
                const val = Number(forslaattAllokering[mandat.navn]) || 0;
                const risikoStyle = RISIKO_FARGE[mandat.risiko] || RISIKO_FARGE['middels'];
                const barColor = MANDAT_FARGER[idx % MANDAT_FARGER.length];

                return (
                  <div key={mandat.navn} className="group">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: barColor }} />
                        <span className="text-sm font-medium text-gray-700">{mandat.navn.replace('Pensum ', '')}</span>
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold ${risikoStyle.bg} ${risikoStyle.text}`}>
                          {mandat.risiko}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          step={1}
                          value={val || ''}
                          onChange={e => handleSliderChange(mandat.navn, e.target.value === '' ? 0 : Math.min(100, Math.max(0, Number(e.target.value))))}
                          className="w-16 px-2 py-1 border border-gray-200 rounded text-sm text-right font-semibold focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300"
                        />
                        <span className="text-xs text-gray-400 w-4">%</span>
                      </div>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      value={val}
                      onChange={e => handleSliderChange(mandat.navn, Number(e.target.value))}
                      className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, ${barColor} ${val}%, #e5e7eb ${val}%)`,
                        accentColor: barColor,
                      }}
                    />
                  </div>
                );
              })}
            </div>

            {/* Proposed pie chart (only if allocations exist) */}
            {forslaattData.pieData.length > 0 && (
              <div className="mt-6">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={forslaattData.pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={2}
                      stroke="none"
                    >
                      {forslaattData.pieData.map((entry, idx) => (
                        <Cell key={idx} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                    <Legend
                      verticalAlign="bottom"
                      iconType="circle"
                      iconSize={8}
                      formatter={(val) => <span className="text-[11px] text-gray-600">{val}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Key figures for proposed */}
            {forslaattData.sumPct > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="text-xs text-gray-500 font-medium mb-1">Forv. avkastning</div>
                  <div className="text-base font-bold text-gray-800">{fmtPct(forslaattData.aggAvk)}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="text-xs text-gray-500 font-medium mb-1">Forv. volatilitet</div>
                  <div className="text-base font-bold text-gray-800">{fmtPct(forslaattData.aggVol)}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="text-xs text-gray-500 font-medium mb-1">Vektet kostnad</div>
                  <div className="text-base font-bold text-gray-800">{fmtPct(forslaattData.aggKostnad)}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══ DIFF SECTION ═══ */}
      {diffData.length > 0 && sumOk && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100" style={{ backgroundColor: NAVY }}>
            <h3 className="text-base font-semibold text-white">Endringer fra dagens til foreslatt</h3>
            <p className="text-blue-300 text-xs mt-0.5">
              Basert pa likvid portefolje: {fmtNOKShort(dagensData.sumLikvid)}
            </p>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {diffData.map(d => (
                <div key={d.kategori} className="flex items-center gap-4">
                  <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: KATEGORI_FARGER[d.kategori] || '#9EAAB4' }} />
                  <span className="text-sm font-medium text-gray-700 w-24">{d.kategori}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-20 text-right">{fmtNOKShort(d.fra)}</span>
                      <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                      <span className="text-xs text-gray-500 w-20">{fmtNOKShort(d.til)}</span>
                    </div>
                  </div>
                  <span className={`text-sm font-bold w-28 text-right ${
                    d.diff > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {d.diff > 0 ? '+' : ''}{fmtNOKShort(d.diff)}
                  </span>
                </div>
              ))}
            </div>

            {/* Summary comparison */}
            <div className="mt-6 pt-4 border-t border-gray-100">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Dagens</h4>
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm text-gray-600">Avkastning:</span>
                    <span className="font-bold text-gray-800">{fmtPct(dagensData.aggAvk)}</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm text-gray-600">Volatilitet:</span>
                    <span className="font-bold text-gray-800">{fmtPct(dagensData.aggVol)}</span>
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Foreslatt</h4>
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm text-gray-600">Avkastning:</span>
                    <span className="font-bold" style={{ color: forslaattData.aggAvk >= dagensData.aggAvk ? '#059669' : '#DC2626' }}>
                      {fmtPct(forslaattData.aggAvk)}
                      {dagensData.aggAvk > 0 && (
                        <span className="text-xs ml-1">
                          ({forslaattData.aggAvk >= dagensData.aggAvk ? '+' : ''}{fmtPct(forslaattData.aggAvk - dagensData.aggAvk)})
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm text-gray-600">Volatilitet:</span>
                    <span className="font-bold" style={{ color: forslaattData.aggVol <= dagensData.aggVol ? '#059669' : '#DC2626' }}>
                      {fmtPct(forslaattData.aggVol)}
                      {dagensData.aggVol > 0 && (
                        <span className="text-xs ml-1">
                          ({forslaattData.aggVol >= dagensData.aggVol ? '+' : ''}{fmtPct(forslaattData.aggVol - dagensData.aggVol)})
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ BYGGESTEIN-KORT ═══ */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100" style={{ backgroundColor: NAVY }}>
          <h3 className="text-base font-semibold text-white">Pensum-mandater (byggesteiner)</h3>
          <p className="text-blue-300 text-xs mt-0.5">Tilgjengelige investeringsmandater</p>
        </div>

        <div className="p-6">
          <div className="flex gap-4 overflow-x-auto pb-2">
            {PENSUM_MANDATER.map((mandat, idx) => {
              const risikoStyle = RISIKO_FARGE[mandat.risiko] || RISIKO_FARGE['middels'];
              const barColor = MANDAT_FARGER[idx % MANDAT_FARGER.length];
              const isActive = (Number(forslaattAllokering[mandat.navn]) || 0) > 0;

              return (
                <div
                  key={mandat.navn}
                  className={`flex-shrink-0 w-56 rounded-xl border-2 transition-all ${
                    isActive
                      ? 'border-blue-300 shadow-md'
                      : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  {/* Color bar top */}
                  <div className="h-1.5 rounded-t-lg" style={{ backgroundColor: barColor }} />

                  <div className="p-4">
                    {/* Name and risk badge */}
                    <div className="mb-3">
                      <h4 className="text-sm font-bold text-gray-800 leading-tight mb-1.5">
                        {mandat.navn.replace('Pensum ', '')}
                      </h4>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${risikoStyle.bg} ${risikoStyle.text} ${risikoStyle.border} border`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${risikoStyle.dot}`} />
                        {mandat.risiko.charAt(0).toUpperCase() + mandat.risiko.slice(1)} risiko
                      </span>
                    </div>

                    {/* Metrics */}
                    <div className="space-y-1.5 mb-3">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Forv. avkastning</span>
                        <span className="font-semibold text-gray-800">{mandat.avk} %</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Volatilitet</span>
                        <span className="font-semibold text-gray-800">{mandat.vol} %</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Kostnad</span>
                        <span className="font-semibold text-gray-800">{mandat.kostnad}</span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-[11px] text-gray-500 leading-relaxed">
                      {mandat.beskrivelse}
                    </p>

                    {/* Active indicator */}
                    {isActive && (
                      <div className="mt-3 pt-2 border-t border-gray-100 text-center">
                        <span className="text-xs font-bold" style={{ color: barColor }}>
                          {fmtPct(Number(forslaattAllokering[mandat.navn]))} allokert
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
