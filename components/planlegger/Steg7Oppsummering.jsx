import React, { useMemo, useRef } from 'react';
import {
  PieChart, Pie, Cell,
  ComposedChart, Line, Area,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  KRISE_SCENARIOER,
  exportStateJSON,
  importStateJSON,
} from '../../lib/formuesplanleggerState';

/* ─── Constants ─── */
const NAVY = '#012441';
const SALMON = '#C4967E';
const TEAL = '#2D6A6A';
const RED = '#B91C1C';
const GOLD = '#A67B3D';

const MANDAT_FARGER = [
  '#6B9DB8', '#2D6A6A', '#A67B3D', '#C4967E',
  '#012441', '#D97706', '#059669', '#7C3AED',
];

const PENSUM_MANDATER = [
  { navn: 'Pensum Global Core Active', avk: 7, vol: 12 },
  { navn: 'Pensum Global Edge', avk: 8, vol: 16 },
  { navn: 'Pensum Norge', avk: 8, vol: 18 },
  { navn: 'Pensum Financial Opportunities', avk: 7, vol: 14 },
  { navn: 'Pensum Nordic Banking', avk: 9, vol: 20 },
  { navn: 'Pensum Energy', avk: 9, vol: 22 },
  { navn: 'Pensum Nordisk Høyrente', avk: 6, vol: 5 },
  { navn: 'Pensum Basis', avk: 5, vol: 8 },
];

/* ─── Formatting ─── */
const fmtNOK = (v) =>
  new Intl.NumberFormat('nb-NO', {
    style: 'currency',
    currency: 'NOK',
    maximumFractionDigits: 0,
  }).format(v);

const fmtNOKShort = (v) => {
  const abs = Math.abs(v);
  if (abs >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1).replace('.', ',')} mrd`;
  if (abs >= 1_000_000) return `${(v / 1_000_000).toFixed(1).replace('.', ',')} MNOK`;
  if (abs >= 1_000) return `${(v / 1_000).toFixed(0)} TNOK`;
  return `${Math.round(v)}`;
};

const fmtPct = (v) => `${Number(v).toFixed(1).replace('.', ',')} %`;

/* ─── Box-Muller ─── */
function boxMuller() {
  let u1, u2;
  do { u1 = Math.random(); } while (u1 === 0);
  u2 = Math.random();
  const mag = Math.sqrt(-2 * Math.log(u1));
  return [mag * Math.cos(2 * Math.PI * u2), mag * Math.sin(2 * Math.PI * u2)];
}

/* ─── Percentile helper ─── */
function percentile(sortedArr, p) {
  if (sortedArr.length === 0) return 0;
  const idx = (p / 100) * (sortedArr.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return sortedArr[lo];
  return sortedArr[lo] + (sortedArr[hi] - sortedArr[lo]) * (idx - lo);
}

/* ─── Simplified chart tooltip ─── */
function SummaryChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const dataPoint = payload[0]?.payload;
  return (
    <div className="bg-white shadow-lg rounded-lg border border-gray-200 px-4 py-3 text-sm max-w-xs">
      <div className="font-semibold text-gray-800 mb-2">År {label}</div>
      {dataPoint && (
        <>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: NAVY }} />
            <span className="text-gray-600">Median:</span>
            <span className="font-semibold text-gray-900">{fmtNOK(dataPoint.median)}</span>
          </div>
          <div className="mt-1 pt-1 border-t border-gray-100 text-gray-500 space-y-0.5 text-xs">
            <div>90. persentil: {fmtNOK(dataPoint.p90)}</div>
            <div>10. persentil: {fmtNOK(dataPoint.p10)}</div>
          </div>
        </>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Main component
   ═══════════════════════════════════════════════════════════════ */
export default function Steg7Oppsummering({ state, dispatch }) {
  const fileInputRef = useRef(null);
  const currentYear = new Date().getFullYear();
  const horizon = state.hovedhorisont || 10;
  const inflasjon = (state.forutsetninger?.inflasjon ?? 2.5) / 100;
  const nSim = state.forutsetninger?.monteCarloSimuleringer || 1000;

  const eiendeler = state.eiendeler || [];
  const gjeld = state.gjeld || [];
  const hendelser = state.hendelser || [];
  const aarligUttak = state.aarligUttak || 0;
  const uttakStartAar = state.uttakStartAar || (currentYear + 10);
  const forslaattAllokering = state.forslaattAllokering || {};

  /* ─── Net wealth ─── */
  const sumEiendeler = useMemo(
    () => eiendeler.reduce((s, e) => s + (Number(e.verdi) || 0), 0),
    [eiendeler],
  );
  const sumGjeld = useMemo(
    () => gjeld.reduce((s, g) => s + (Number(g.hovedstol) || 0), 0),
    [gjeld],
  );
  const nettoFormue = sumEiendeler - sumGjeld;
  const startVerdi = Math.max(0, nettoFormue);

  /* ─── Weighted return and volatility ─── */
  const { mu, sigma } = useMemo(() => {
    const allokKeys = Object.keys(forslaattAllokering);
    const hasAllokering = allokKeys.length > 0 && allokKeys.some(k => forslaattAllokering[k] > 0);

    if (hasAllokering) {
      const avkMap = state.forutsetninger?.avkastningPerKategori || {};
      const volMap = state.forutsetninger?.volatilitetPerKategori || {};
      let totalWeight = 0;
      let wMu = 0;
      let wSigma2 = 0;

      for (const [prod, vekt] of Object.entries(forslaattAllokering)) {
        const w = Number(vekt) || 0;
        if (w <= 0) continue;
        totalWeight += w;
        const r = (avkMap[prod] ?? 5) / 100;
        const v = (volMap[prod] ?? 10) / 100;
        wMu += w * r;
        wSigma2 += w * v * v;
      }

      if (totalWeight > 0) {
        return { mu: wMu / totalWeight, sigma: Math.sqrt(wSigma2 / totalWeight) };
      }
    }

    if (eiendeler.length === 0) return { mu: 0.05, sigma: 0.10 };

    let totalVal = 0;
    let wMu = 0;
    let wSigma2 = 0;
    for (const e of eiendeler) {
      const v = Number(e.verdi) || 0;
      if (v <= 0) continue;
      totalVal += v;
      const r = (Number(e.forventetAvkastning) || 5) / 100;
      const vol = (Number(e.forventetVolatilitet) || 10) / 100;
      wMu += v * r;
      wSigma2 += v * vol * vol;
    }

    if (totalVal > 0) {
      return { mu: wMu / totalVal, sigma: Math.sqrt(wSigma2 / totalVal) };
    }
    return { mu: 0.05, sigma: 0.10 };
  }, [eiendeler, forslaattAllokering, state.forutsetninger]);

  /* ─── Cash flow map ─── */
  const cashFlowByYear = useMemo(() => {
    const map = {};
    for (let y = 0; y <= horizon; y++) map[y] = { inn: 0, ut: 0 };
    for (const h of hendelser) {
      const yearOffset = (Number(h.aar) || currentYear) - currentYear;
      if (yearOffset >= 0 && yearOffset <= horizon) {
        const belop = Number(h.belop) || 0;
        if (belop > 0) map[yearOffset].inn += belop;
        else if (belop < 0) map[yearOffset].ut += belop;
      }
    }
    for (let y = 0; y <= horizon; y++) {
      const absYear = currentYear + y;
      if (absYear >= uttakStartAar && aarligUttak > 0) {
        map[y].ut -= aarligUttak;
      }
    }
    return map;
  }, [hendelser, horizon, currentYear, uttakStartAar, aarligUttak]);

  /* ─── Monte Carlo simulation ─── */
  const simulation = useMemo(() => {
    if (startVerdi <= 0) return null;
    const years = horizon;
    const allPaths = [];

    for (let sim = 0; sim < nSim; sim++) {
      const path = new Array(years + 1);
      path[0] = startVerdi;
      for (let y = 1; y <= years; y++) {
        const [z] = boxMuller();
        const drift = mu - (sigma * sigma) / 2;
        let nextVal = path[y - 1] * Math.exp(drift + sigma * z);
        const cf = cashFlowByYear[y] || { inn: 0, ut: 0 };
        nextVal += cf.inn + cf.ut;
        path[y] = Math.max(0, nextVal);
      }
      allPaths.push(path);
    }

    const chartData = [];
    for (let y = 0; y <= years; y++) {
      const vals = allPaths.map(p => p[y]);
      vals.sort((a, b) => a - b);
      const absYear = currentYear + y;
      const p10v = Math.round(percentile(vals, 10));
      const p25v = Math.round(percentile(vals, 25));
      const p75v = Math.round(percentile(vals, 75));
      const p90v = Math.round(percentile(vals, 90));
      const median = Math.round(percentile(vals, 50));

      chartData.push({
        year: absYear,
        p10: p10v,
        p25: p25v,
        median,
        p75: p75v,
        p90: p90v,
        band1090: [p10v, p90v],
        band2575: [p25v, p75v],
      });
    }

    // Goal robustness: % of paths that end above starting value (preserve capital)
    const finalVals = allPaths.map(p => p[years]);
    finalVals.sort((a, b) => a - b);
    const goalCount = finalVals.filter(v => v >= startVerdi).length;
    const robustnessPct = Math.round((goalCount / nSim) * 100);

    return { chartData, robustnessPct };
  }, [startVerdi, horizon, mu, sigma, nSim, cashFlowByYear, currentYear]);

  /* ─── Scenario comparison (3 scenarios) ─── */
  const scenarioComparison = useMemo(() => {
    if (startVerdi <= 0) return [];
    const aktivt = state.aktivtScenario;
    // Pick the active scenario (if set) plus the top scenarios
    let selected = [];
    if (aktivt) {
      const match = KRISE_SCENARIOER.find(s => s.id === aktivt);
      if (match) selected.push(match);
    }
    for (const s of KRISE_SCENARIOER) {
      if (selected.length >= 3) break;
      if (!selected.find(x => x.id === s.id)) selected.push(s);
    }
    if (selected.length > 3) selected = selected.slice(0, 3);

    return selected.map(scenario => {
      // Simple impact: apply scenario shocks to the allocation
      let impact = 0;
      const allokKeys = Object.keys(forslaattAllokering);
      const hasAllokering = allokKeys.length > 0 && allokKeys.some(k => forslaattAllokering[k] > 0);

      if (hasAllokering) {
        let totalWeight = 0;
        for (const [prod, vekt] of Object.entries(forslaattAllokering)) {
          const w = Number(vekt) || 0;
          if (w <= 0) continue;
          totalWeight += w;
          // Classify product: høyrente if name includes "Høyrente" or "Basis", eiendom if eiendom, else aksjer
          let shock = scenario.aksjer;
          const lower = prod.toLowerCase();
          if (lower.includes('høyrente') || lower.includes('basis') || lower.includes('rente')) {
            shock = scenario.hoyrente;
          } else if (lower.includes('eiendom')) {
            shock = scenario.eiendom;
          }
          impact += w * shock;
        }
        if (totalWeight > 0) impact = impact / totalWeight;
      } else {
        // Fallback: assume 60% aksjer, 30% hoyrente, 10% eiendom
        impact = 0.6 * scenario.aksjer + 0.3 * scenario.hoyrente + 0.1 * scenario.eiendom;
      }

      const tapKr = Math.round(startVerdi * (impact / 100));
      return {
        label: scenario.label,
        varighet: scenario.varighet,
        impactPct: impact,
        tapKr,
        restVerdi: startVerdi + tapKr,
      };
    });
  }, [startVerdi, forslaattAllokering, state.aktivtScenario]);

  /* ─── Allocation donut data ─── */
  const allokeringData = useMemo(() => {
    const entries = Object.entries(forslaattAllokering)
      .filter(([, v]) => Number(v) > 0)
      .map(([navn, vekt], idx) => ({
        name: navn,
        value: Number(vekt),
        fill: MANDAT_FARGER[idx % MANDAT_FARGER.length],
      }));
    return entries;
  }, [forslaattAllokering]);

  /* ─── Export handlers ─── */
  const handlePDFExport = () => {
    window.print();
  };

  const handleJSONExport = () => {
    const json = exportStateJSON(state);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `formuesplan-${state.kundeNavn || 'ukjent'}-${state.opprettetDato || 'dato'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleJSONImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const imported = importStateJSON(ev.target.result);
        dispatch(imported);
      } catch (err) {
        alert('Kunne ikke lese filen. Kontroller at det er en gyldig JSON-fil.');
      }
    };
    reader.readAsText(file);
    // Reset the input so the same file can be re-imported
    e.target.value = '';
  };

  /* ─── Forutsetninger ─── */
  const forut = state.forutsetninger || {};

  return (
    <div className="space-y-6 print:space-y-4">

      {/* ═══ HEADER ═══ */}
      <div
        className="rounded-xl overflow-hidden print:rounded-none"
        style={{ backgroundColor: NAVY }}
      >
        <div className="px-8 py-6 print:px-4 print:py-3 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white print:text-xl">
              Formuesplan — Oppsummering
            </h1>
            <p className="text-blue-200 text-sm mt-1">
              {state.kundeNavn || 'Kunde ikke navngitt'}
            </p>
          </div>
          <div className="text-right text-sm text-blue-200">
            <div>{state.opprettetDato || new Date().toISOString().split('T')[0]}</div>
            <div className="text-xs text-blue-300 mt-1">Pensum Kapitalforvaltning AS</div>
          </div>
        </div>
      </div>

      {/* ═══ KEY FIGURES — 3 columns ═══ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print:grid-cols-3 print:gap-2">
        {/* Net wealth */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center print:p-3">
          <div className="text-sm text-gray-500 font-medium mb-1">Netto formue i dag</div>
          <div className="text-3xl font-bold print:text-xl" style={{ color: NAVY }}>
            {fmtNOK(nettoFormue)}
          </div>
        </div>
        {/* Horizon */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center print:p-3">
          <div className="text-sm text-gray-500 font-medium mb-1">Investeringshorisont</div>
          <div className="text-3xl font-bold print:text-xl" style={{ color: TEAL }}>
            {horizon} år
          </div>
        </div>
        {/* Risk tolerance */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center print:p-3">
          <div className="text-sm text-gray-500 font-medium mb-1">Risikotoleranse</div>
          <div className="text-3xl font-bold print:text-xl" style={{ color: GOLD }}>
            {state.risikotoleranse || 4} / 7
          </div>
        </div>
      </div>

      {/* ═══ CHARTS — 2 columns ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:grid-cols-2 print:gap-3">

        {/* Donut chart — proposed allocation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700">Foreslått allokering</h3>
          </div>
          <div className="px-6 py-4">
            {allokeringData.length > 0 ? (
              <div className="flex items-center gap-4">
                <div style={{ width: 200, height: 200 }} className="flex-shrink-0">
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={allokeringData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={85}
                        paddingAngle={2}
                        isAnimationActive={false}
                      >
                        {allokeringData.map((entry, idx) => (
                          <Cell key={idx} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(val) => `${Number(val).toFixed(1)} %`}
                        contentStyle={{ fontSize: 12 }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-1.5 text-xs flex-1 min-w-0">
                  {allokeringData.map((entry, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-sm flex-shrink-0"
                        style={{ backgroundColor: entry.fill }}
                      />
                      <span className="text-gray-600 truncate">{entry.name}</span>
                      <span className="ml-auto font-semibold text-gray-800 flex-shrink-0">
                        {Number(entry.value).toFixed(1)} %
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400 text-sm">
                Ingen allokering definert. Sett opp allokering i steg 3.
              </div>
            )}
          </div>
        </div>

        {/* Expected development chart — simplified prognosis */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700">Forventet utvikling</h3>
          </div>
          <div className="px-6 py-4">
            {simulation ? (
              <div style={{ width: '100%', height: 200 }}>
                <ResponsiveContainer>
                  <ComposedChart
                    data={simulation.chartData}
                    margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="year"
                      tick={{ fontSize: 10, fill: '#6b7280' }}
                      tickLine={false}
                      axisLine={{ stroke: '#d1d5db' }}
                    />
                    <YAxis
                      tickFormatter={(v) => fmtNOKShort(v)}
                      tick={{ fontSize: 10, fill: '#6b7280' }}
                      tickLine={false}
                      axisLine={{ stroke: '#d1d5db' }}
                      width={70}
                    />
                    <Tooltip content={<SummaryChartTooltip />} />

                    {/* 10-90 band */}
                    <Area
                      type="monotone"
                      dataKey="band1090"
                      stroke="none"
                      fill="rgba(107, 157, 184, 0.15)"
                      name="10.–90. persentil"
                      isAnimationActive={false}
                      legendType="none"
                    />

                    {/* 25-75 band */}
                    <Area
                      type="monotone"
                      dataKey="band2575"
                      stroke="none"
                      fill="rgba(107, 157, 184, 0.3)"
                      name="25.–75. persentil"
                      isAnimationActive={false}
                      legendType="none"
                    />

                    {/* Median line */}
                    <Line
                      type="monotone"
                      dataKey="median"
                      stroke={NAVY}
                      strokeWidth={2.5}
                      dot={false}
                      name="Median"
                      isAnimationActive={false}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400 text-sm">
                Legg inn eiendeler i steg 1 for å se prognose.
              </div>
            )}
            {/* Legend */}
            {simulation && (
              <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-500 justify-center">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-0.5 rounded" style={{ backgroundColor: NAVY }} />
                  <span>Median</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-3 rounded" style={{ backgroundColor: 'rgba(107, 157, 184, 0.3)' }} />
                  <span>25.–75. persentil</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-3 rounded" style={{ backgroundColor: 'rgba(107, 157, 184, 0.15)' }} />
                  <span>10.–90. persentil</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══ SCENARIO TABLE + ROBUSTNESS — 2 columns ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:grid-cols-3 print:gap-3">

        {/* Scenario comparison table — 2/3 width */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700">Stresstest — scenariosammenligning</h3>
          </div>
          <div className="px-6 py-4">
            {scenarioComparison.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 pr-4 text-gray-500 font-medium">Scenario</th>
                      <th className="text-right py-2 px-3 text-gray-500 font-medium">Varighet</th>
                      <th className="text-right py-2 px-3 text-gray-500 font-medium">Effekt</th>
                      <th className="text-right py-2 px-3 text-gray-500 font-medium">Tap (kr)</th>
                      <th className="text-right py-2 pl-3 text-gray-500 font-medium">Restverdi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scenarioComparison.map((s, idx) => (
                      <tr key={idx} className="border-b border-gray-50 last:border-b-0">
                        <td className="py-2.5 pr-4 font-medium text-gray-800">{s.label}</td>
                        <td className="py-2.5 px-3 text-right text-gray-600">
                          {s.varighet} {s.varighet === 1 ? 'år' : 'år'}
                        </td>
                        <td className="py-2.5 px-3 text-right font-semibold text-red-700">
                          {s.impactPct.toFixed(1).replace('.', ',')} %
                        </td>
                        <td className="py-2.5 px-3 text-right font-semibold text-red-700">
                          {fmtNOK(s.tapKr)}
                        </td>
                        <td className="py-2.5 pl-3 text-right font-semibold text-gray-800">
                          {fmtNOK(s.restVerdi)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-6 text-gray-400 text-sm">
                Ingen scenarioer tilgjengelig.
              </div>
            )}
          </div>
        </div>

        {/* Robustness score — 1/3 width */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="px-6 py-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700">Sannsynlighet for å nå mål</h3>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center px-6 py-6">
            {simulation ? (
              <>
                <div
                  className="text-5xl font-bold print:text-3xl"
                  style={{
                    color: simulation.robustnessPct >= 70 ? TEAL
                      : simulation.robustnessPct >= 50 ? GOLD
                      : RED,
                  }}
                >
                  {simulation.robustnessPct} %
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center leading-relaxed">
                  Andel av {nSim} simuleringer der porteføljen bevarer
                  kapitalen over {horizon} år.
                </p>
              </>
            ) : (
              <div className="text-center text-gray-400 text-sm">
                Legg inn data for beregning.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══ ADVISOR RECOMMENDATION ═══ */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-3 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700">Rådgivers anbefaling</h3>
        </div>
        <div className="px-6 py-4">
          <textarea
            className="w-full border border-gray-200 rounded-lg p-4 text-sm text-gray-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent resize-y print:border-0 print:p-0"
            rows={4}
            placeholder="Skriv inn rådgivers anbefaling og begrunnelse her..."
            value={state.radgiverAnbefaling || ''}
            onChange={(e) => dispatch({ radgiverAnbefaling: e.target.value })}
          />
        </div>
      </div>

      {/* ═══ ASSUMPTIONS ═══ */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-3 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700">Forutsetninger</h3>
        </div>
        <div className="px-6 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm print:grid-cols-4 print:gap-2 print:text-xs">
            <div>
              <div className="text-gray-500 text-xs font-medium mb-0.5">Inflasjon</div>
              <div className="font-semibold text-gray-800">{fmtPct(forut.inflasjon ?? 2.5)}</div>
            </div>
            <div>
              <div className="text-gray-500 text-xs font-medium mb-0.5">Formuesskatt</div>
              <div className="font-semibold text-gray-800">{fmtPct(forut.formuesskatt ?? 1.1)}</div>
            </div>
            <div>
              <div className="text-gray-500 text-xs font-medium mb-0.5">Utbytteskatt</div>
              <div className="font-semibold text-gray-800">{fmtPct(forut.utbytteskatt ?? 37.84)}</div>
            </div>
            <div>
              <div className="text-gray-500 text-xs font-medium mb-0.5">Gevinstskatt</div>
              <div className="font-semibold text-gray-800">{fmtPct(forut.gevinstskatt ?? 37.84)}</div>
            </div>
            <div>
              <div className="text-gray-500 text-xs font-medium mb-0.5">Monte Carlo-simuleringer</div>
              <div className="font-semibold text-gray-800">{forut.monteCarloSimuleringer ?? 1000}</div>
            </div>
            <div>
              <div className="text-gray-500 text-xs font-medium mb-0.5">Forventet avkastning (vektet)</div>
              <div className="font-semibold text-gray-800">{fmtPct(mu * 100)}</div>
            </div>
            <div>
              <div className="text-gray-500 text-xs font-medium mb-0.5">Volatilitet (vektet)</div>
              <div className="font-semibold text-gray-800">{fmtPct(sigma * 100)}</div>
            </div>
            <div>
              <div className="text-gray-500 text-xs font-medium mb-0.5">Årlig uttak</div>
              <div className="font-semibold text-gray-800">
                {aarligUttak > 0 ? `${fmtNOK(aarligUttak)} fra ${uttakStartAar}` : 'Ingen'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ EXPORT / IMPORT BUTTONS ═══ */}
      <div className="flex flex-wrap gap-3 print:hidden">
        <button
          onClick={handlePDFExport}
          className="px-5 py-2.5 rounded-lg text-white text-sm font-medium transition-colors hover:opacity-90"
          style={{ backgroundColor: NAVY }}
        >
          Eksporter til PDF
        </button>
        <button
          onClick={handleJSONExport}
          className="px-5 py-2.5 rounded-lg text-white text-sm font-medium transition-colors hover:opacity-90"
          style={{ backgroundColor: TEAL }}
        >
          Eksporter JSON
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium transition-colors hover:bg-gray-50"
        >
          Importer JSON
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={handleJSONImport}
        />
      </div>

      {/* ═══ DISCLAIMER ═══ */}
      <div className="text-xs text-gray-400 leading-relaxed px-2 print:text-[9px] print:leading-tight">
        <p className="font-semibold text-gray-500 mb-1">Disclaimer</p>
        <p>
          Denne rapporten er utarbeidet av Pensum Kapitalforvaltning AS og er kun ment som
          informasjon og generell rådgivning. Beregningene er basert på forenklede modeller
          og historiske data, og gir ingen garanti for fremtidig avkastning. Alle investeringer
          innebærer risiko, herunder risiko for tap av investert kapital. Monte Carlo-simuleringene
          illustrerer mulige utfall basert på statistiske forutsetninger og skal ikke tolkes som
          prognoser. Skattesatser og regelverk kan endres. Kunden oppfordres til å søke
          uavhengig skatte- og juridisk rådgivning. Pensum Kapitalforvaltning AS påtar seg
          intet ansvar for beslutninger tatt på bakgrunn av denne rapporten.
        </p>
      </div>
    </div>
  );
}
