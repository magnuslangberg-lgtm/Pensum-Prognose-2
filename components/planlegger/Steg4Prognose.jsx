import React, { useMemo } from 'react';
import {
  Area, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, ComposedChart,
} from 'recharts';

/* ─── Colors ─── */
const COLORS = {
  navy: '#012441',
  lightBlue: 'rgba(107, 157, 184, 0.3)',
  lighterBlue: 'rgba(107, 157, 184, 0.15)',
  salmon: '#C4967E',
  teal: '#2D6A6A',
  red: '#B91C1C',
  medianLine: '#012441',
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
  if (abs >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1).replace('.', ',')} mrd`;
  if (abs >= 1_000_000) return `${(v / 1_000_000).toFixed(1).replace('.', ',')} MNOK`;
  if (abs >= 1_000) return `${(v / 1_000).toFixed(0)} TNOK`;
  return `${Math.round(v)}`;
};

const fmtPct = (v) => `${Number(v).toFixed(1).replace('.', ',')} %`;

/* ─── Box-Muller: generate two standard normal random numbers ─── */
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

/* ─── Custom tooltip for main chart ─── */
function MainChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  // Filter out the raw band entries and show meaningful data
  const items = payload.filter(e => e.dataKey !== 'band1090' && e.dataKey !== 'band2575');
  // Find the original data point to show percentile info
  const dataPoint = payload[0]?.payload;
  return (
    <div className="bg-white shadow-lg rounded-lg border border-gray-200 px-4 py-3 text-sm max-w-xs">
      <div className="font-semibold text-gray-800 mb-2">År {label}</div>
      {items.map((entry, i) => (
        <div key={i} className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-full inline-block flex-shrink-0"
            style={{ backgroundColor: entry.color || entry.stroke }}
          />
          <span className="text-gray-600">{entry.name}:</span>
          <span className="font-semibold text-gray-900">{fmtNOK(entry.value)}</span>
        </div>
      ))}
      {dataPoint && (
        <div className="mt-2 pt-2 border-t border-gray-100 text-gray-500 space-y-0.5">
          <div>90. persentil: {fmtNOK(dataPoint.p90)}</div>
          <div>75. persentil: {fmtNOK(dataPoint.p75)}</div>
          <div>25. persentil: {fmtNOK(dataPoint.p25)}</div>
          <div>10. persentil: {fmtNOK(dataPoint.p10)}</div>
        </div>
      )}
    </div>
  );
}

/* ─── Custom tooltip for cash flow chart ─── */
function CashFlowTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white shadow-lg rounded-lg border border-gray-200 px-4 py-3 text-sm">
      <div className="font-semibold text-gray-800 mb-1">År {label}</div>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-full inline-block flex-shrink-0"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-gray-600">{entry.name}:</span>
          <span className="font-semibold text-gray-900">{fmtNOK(entry.value)}</span>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Main component
   ═══════════════════════════════════════════════════════════════ */
export default function Steg4Prognose({ state, dispatch }) {
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

  /* ─── Compute initial portfolio value ─── */
  const sumEiendeler = useMemo(
    () => eiendeler.reduce((s, e) => s + (Number(e.verdi) || 0), 0),
    [eiendeler],
  );
  const sumGjeld = useMemo(
    () => gjeld.reduce((s, g) => s + (Number(g.hovedstol) || 0), 0),
    [gjeld],
  );
  const startVerdi = Math.max(0, sumEiendeler - sumGjeld);

  /* ─── Compute weighted return and volatility ─── */
  const { mu, sigma } = useMemo(() => {
    const allokKeys = Object.keys(forslaattAllokering);
    const hasAllokering = allokKeys.length > 0 && allokKeys.some(k => forslaattAllokering[k] > 0);

    if (hasAllokering) {
      // Use forslaattAllokering weights with asset class params from forutsetninger
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
        wSigma2 += w * v * v; // simplified: ignore correlation
      }

      if (totalWeight > 0) {
        return { mu: wMu / totalWeight, sigma: Math.sqrt(wSigma2 / totalWeight) };
      }
    }

    // Fallback: weight by eiendeler
    if (eiendeler.length === 0) {
      return { mu: 0.05, sigma: 0.10 };
    }

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

  /* ─── Build cash flow map by year offset ─── */
  const cashFlowByYear = useMemo(() => {
    const map = {};
    for (let y = 0; y <= horizon; y++) {
      map[y] = { inn: 0, ut: 0 };
    }

    // Hendelser
    for (const h of hendelser) {
      const yearOffset = (Number(h.aar) || currentYear) - currentYear;
      if (yearOffset >= 0 && yearOffset <= horizon) {
        const belop = Number(h.belop) || 0;
        if (belop > 0) {
          map[yearOffset].inn += belop;
        } else if (belop < 0) {
          map[yearOffset].ut += belop;
        }
      }
    }

    // Withdrawals
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
    // For each year: collect all ending values across simulations
    const allPaths = []; // nSim arrays, each of length years+1

    for (let sim = 0; sim < nSim; sim++) {
      const path = new Array(years + 1);
      path[0] = startVerdi;
      for (let y = 1; y <= years; y++) {
        // Box-Muller: generate Z
        const [z] = boxMuller();
        // GBM step
        const drift = mu - (sigma * sigma) / 2;
        let nextVal = path[y - 1] * Math.exp(drift + sigma * z);

        // Apply cash flows for this year
        const cf = cashFlowByYear[y] || { inn: 0, ut: 0 };
        nextVal += cf.inn + cf.ut;

        path[y] = Math.max(0, nextVal);
      }
      allPaths.push(path);
    }

    // Compute percentiles at each year
    const chartData = [];
    for (let y = 0; y <= years; y++) {
      const vals = allPaths.map(p => p[y]);
      vals.sort((a, b) => a - b);

      const absYear = currentYear + y;
      const inflFactor = Math.pow(1 + inflasjon, y);
      const median = percentile(vals, 50);

      const p10v = Math.round(percentile(vals, 10));
      const p25v = Math.round(percentile(vals, 25));
      const p75v = Math.round(percentile(vals, 75));
      const p90v = Math.round(percentile(vals, 90));

      chartData.push({
        year: absYear,
        p10: p10v,
        p25: p25v,
        median: Math.round(median),
        p75: p75v,
        p90: p90v,
        // Range arrays for Recharts Area bands
        band1090: [p10v, p90v],
        band2575: [p25v, p75v],
        nominalMedian: Math.round(median),
        realMedian: Math.round(median / inflFactor),
      });
    }

    // Final year stats
    const finalVals = allPaths.map(p => p[years]);
    finalVals.sort((a, b) => a - b);
    const inflFactorFinal = Math.pow(1 + inflasjon, years);

    return {
      chartData,
      finalExpected: Math.round(percentile(finalVals, 50)),
      finalExpectedReal: Math.round(percentile(finalVals, 50) / inflFactorFinal),
      finalP10: Math.round(percentile(finalVals, 10)),
      finalP90: Math.round(percentile(finalVals, 90)),
      totalReturnKr: Math.round(percentile(finalVals, 50) - startVerdi),
      totalReturnPct: ((percentile(finalVals, 50) / startVerdi - 1) * 100),
    };
  }, [startVerdi, horizon, mu, sigma, nSim, cashFlowByYear, inflasjon, currentYear]);

  /* ─── Cash flow chart data ─── */
  const cashFlowChartData = useMemo(() => {
    const data = [];
    for (let y = 0; y <= horizon; y++) {
      const cf = cashFlowByYear[y] || { inn: 0, ut: 0 };
      // Only include years with actual cash flows
      if (cf.inn !== 0 || cf.ut !== 0) {
        data.push({
          year: currentYear + y,
          innskudd: cf.inn,
          uttak: cf.ut,
        });
      }
    }
    // If no cash flow data, generate array of zeros for all years so chart still renders
    if (data.length === 0) {
      for (let y = 0; y <= horizon; y++) {
        data.push({
          year: currentYear + y,
          innskudd: 0,
          uttak: 0,
        });
      }
    }
    return data;
  }, [cashFlowByYear, horizon, currentYear]);

  /* ─── Hendelse markers mapped to chart ─── */
  const hendelseMarkers = useMemo(() => {
    return hendelser
      .filter(h => {
        const yr = Number(h.aar) || 0;
        return yr >= currentYear && yr <= currentYear + horizon;
      })
      .map(h => {
        const belop = Number(h.belop) || 0;
        const belopStr = Math.abs(belop) >= 1_000_000
          ? `${belop > 0 ? '+' : ''}${(belop / 1_000_000).toFixed(1).replace('.', ',')} MNOK`
          : `${belop > 0 ? '+' : ''}${fmtNOKShort(belop)}`;
        const label = h.kommentar
          ? `${h.kommentar} ${belopStr}`
          : `${h.type} ${belopStr}`;
        return { year: Number(h.aar), label };
      });
  }, [hendelser, currentYear, horizon]);

  /* ─── Empty state ─── */
  if (startVerdi <= 0 || !simulation) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4" style={{ backgroundColor: COLORS.navy }}>
            <h2 className="text-lg font-semibold text-white">Prognose</h2>
          </div>
          <div className="px-6 py-12 text-center">
            <p className="text-gray-500 text-lg mb-2">
              Ingen portefølje å vise.
            </p>
            <p className="text-gray-400 text-sm">
              Legg inn eiendeler i steg 1 (Nåsituasjon) for å se prognosen.
              Netto porteføljeverdien må være større enn null.
            </p>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto text-left">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-xs text-gray-500 font-medium mb-1">Sum eiendeler</div>
                <div className="text-lg font-bold text-gray-800">{fmtNOK(sumEiendeler)}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-xs text-gray-500 font-medium mb-1">Sum gjeld</div>
                <div className="text-lg font-bold text-gray-800">{fmtNOK(sumGjeld)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { chartData, finalExpected, finalExpectedReal, finalP10, finalP90, totalReturnKr, totalReturnPct } = simulation;

  return (
    <div className="space-y-6">

      {/* ═══ MAIN CHART: Monte Carlo probability bands ═══ */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 flex items-center justify-between" style={{ backgroundColor: COLORS.navy }}>
          <h2 className="text-lg font-semibold text-white">Prognose — forventet formuesutvikling</h2>
          <span className="text-blue-300 text-sm font-medium">
            {horizon} år | {nSim} simuleringer
          </span>
        </div>

        <div className="px-6 py-6">
          {/* Parameters summary */}
          <div className="flex flex-wrap gap-4 mb-6 text-sm">
            <div className="bg-gray-50 rounded-lg px-4 py-2">
              <span className="text-gray-500">Startverdi:</span>{' '}
              <span className="font-semibold text-gray-800">{fmtNOK(startVerdi)}</span>
            </div>
            <div className="bg-gray-50 rounded-lg px-4 py-2">
              <span className="text-gray-500">Forventet avkastning:</span>{' '}
              <span className="font-semibold text-gray-800">{fmtPct(mu * 100)}</span>
            </div>
            <div className="bg-gray-50 rounded-lg px-4 py-2">
              <span className="text-gray-500">Volatilitet:</span>{' '}
              <span className="font-semibold text-gray-800">{fmtPct(sigma * 100)}</span>
            </div>
            <div className="bg-gray-50 rounded-lg px-4 py-2">
              <span className="text-gray-500">Inflasjon:</span>{' '}
              <span className="font-semibold text-gray-800">{fmtPct(inflasjon * 100)}</span>
            </div>
          </div>

          {/* Main chart */}
          <div style={{ width: '100%', height: 420 }}>
            <ResponsiveContainer>
              <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="year"
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  tickLine={false}
                  axisLine={{ stroke: '#d1d5db' }}
                />
                <YAxis
                  tickFormatter={(v) => fmtNOKShort(v)}
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  tickLine={false}
                  axisLine={{ stroke: '#d1d5db' }}
                  width={80}
                />
                <Tooltip content={<MainChartTooltip />} />

                {/* 10-90 percentile band (range area) */}
                <Area
                  type="monotone"
                  dataKey="band1090"
                  stroke="none"
                  fill="rgba(107, 157, 184, 0.15)"
                  name="10.–90. persentil"
                  isAnimationActive={false}
                  legendType="none"
                />

                {/* 25-75 percentile band (range area) */}
                <Area
                  type="monotone"
                  dataKey="band2575"
                  stroke="none"
                  fill="rgba(107, 157, 184, 0.3)"
                  name="25.–75. persentil"
                  isAnimationActive={false}
                  legendType="none"
                />

                {/* Median / expected line (nominal) */}
                <Line
                  type="monotone"
                  dataKey="nominalMedian"
                  stroke={COLORS.medianLine}
                  strokeWidth={2.5}
                  dot={false}
                  name="Forventet (nominell)"
                  isAnimationActive={false}
                />

                {/* Real value line (dashed) */}
                <Line
                  type="monotone"
                  dataKey="realMedian"
                  stroke={COLORS.salmon}
                  strokeWidth={2}
                  strokeDasharray="6 4"
                  dot={false}
                  name="Forventet (realverdi)"
                  isAnimationActive={false}
                />

                {/* Hendelse markers */}
                {hendelseMarkers.map((m, i) => (
                  <ReferenceLine
                    key={`h-${i}`}
                    x={m.year}
                    stroke="#A67B3D"
                    strokeDasharray="4 3"
                    strokeWidth={1.5}
                    label={{
                      value: m.label,
                      position: 'top',
                      fill: '#A67B3D',
                      fontSize: 11,
                      fontWeight: 600,
                    }}
                  />
                ))}

                {/* Withdrawal start marker */}
                {aarligUttak > 0 && uttakStartAar >= currentYear && uttakStartAar <= currentYear + horizon && (
                  <ReferenceLine
                    x={uttakStartAar}
                    stroke={COLORS.red}
                    strokeDasharray="4 3"
                    strokeWidth={1.5}
                    label={{
                      value: `Uttak starter (${fmtNOKShort(-aarligUttak)}/år)`,
                      position: 'top',
                      fill: COLORS.red,
                      fontSize: 11,
                      fontWeight: 600,
                    }}
                  />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-6 mt-4 text-xs text-gray-600 justify-center">
            <div className="flex items-center gap-2">
              <div className="w-6 h-0.5 rounded" style={{ backgroundColor: COLORS.medianLine }} />
              <span>Forventet (nominell)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-0.5 rounded border-dashed border-t-2" style={{ borderColor: COLORS.salmon }} />
              <span>Forventet (realverdi)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-3 rounded" style={{ backgroundColor: 'rgba(107, 157, 184, 0.3)' }} />
              <span>25.–75. persentil</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-3 rounded" style={{ backgroundColor: 'rgba(107, 157, 184, 0.15)' }} />
              <span>10.–90. persentil</span>
            </div>
            {hendelseMarkers.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-6 h-0.5 rounded border-dashed border-t-2" style={{ borderColor: '#A67B3D' }} />
                <span>Hendelser</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══ CASH FLOW VISUALIZATION ═══ */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4" style={{ backgroundColor: COLORS.navy }}>
          <h2 className="text-lg font-semibold text-white">Kontantstrøm per år</h2>
        </div>

        <div className="px-6 py-6">
          <div style={{ width: '100%', height: 220 }}>
            <ResponsiveContainer>
              <BarChart data={cashFlowChartData} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="year"
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                  tickLine={false}
                  axisLine={{ stroke: '#d1d5db' }}
                />
                <YAxis
                  tickFormatter={(v) => fmtNOKShort(v)}
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                  tickLine={false}
                  axisLine={{ stroke: '#d1d5db' }}
                  width={80}
                />
                <Tooltip content={<CashFlowTooltip />} />
                <ReferenceLine y={0} stroke="#9ca3af" strokeWidth={1} />
                <Bar
                  dataKey="innskudd"
                  fill={COLORS.teal}
                  name="Innskudd / innbetalinger"
                  radius={[3, 3, 0, 0]}
                  isAnimationActive={false}
                />
                <Bar
                  dataKey="uttak"
                  fill={COLORS.red}
                  name="Uttak / kostnader"
                  radius={[0, 0, 3, 3]}
                  isAnimationActive={false}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-6 mt-3 text-xs text-gray-600 justify-center">
            <div className="flex items-center gap-2">
              <div className="w-4 h-3 rounded" style={{ backgroundColor: COLORS.teal }} />
              <span>Innskudd / innbetalinger</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-3 rounded" style={{ backgroundColor: COLORS.red }} />
              <span>Uttak / kostnader</span>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ KEY FIGURES ═══ */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4" style={{ backgroundColor: COLORS.navy }}>
          <h2 className="text-lg font-semibold text-white">Nøkkeltall</h2>
        </div>

        <div className="px-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {/* Final wealth — expected, nominal */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-xs text-gray-500 font-medium mb-1">
                Sluttformue (nominell)
              </div>
              <div className="text-xl font-bold" style={{ color: COLORS.navy }}>
                {fmtNOKShort(finalExpected)}
              </div>
              <div className="text-xs text-gray-400 mt-1">Forventet median</div>
            </div>

            {/* Final wealth — expected, real */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-xs text-gray-500 font-medium mb-1">
                Sluttformue (realverdi)
              </div>
              <div className="text-xl font-bold" style={{ color: COLORS.salmon }}>
                {fmtNOKShort(finalExpectedReal)}
              </div>
              <div className="text-xs text-gray-400 mt-1">Justert for inflasjon</div>
            </div>

            {/* 10th percentile */}
            <div className="bg-red-50 rounded-lg p-4">
              <div className="text-xs text-gray-500 font-medium mb-1">
                10. persentil
              </div>
              <div className="text-xl font-bold text-red-700">
                {fmtNOKShort(finalP10)}
              </div>
              <div className="text-xs text-gray-400 mt-1">I et dårlig scenario</div>
            </div>

            {/* 90th percentile */}
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-xs text-gray-500 font-medium mb-1">
                90. persentil
              </div>
              <div className="text-xl font-bold text-green-700">
                {fmtNOKShort(finalP90)}
              </div>
              <div className="text-xs text-gray-400 mt-1">I et godt scenario</div>
            </div>

            {/* Total return kr */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-xs text-gray-500 font-medium mb-1">
                Totalavkastning (kr)
              </div>
              <div className={`text-xl font-bold ${totalReturnKr >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                {totalReturnKr >= 0 ? '+' : ''}{fmtNOKShort(totalReturnKr)}
              </div>
              <div className="text-xs text-gray-400 mt-1">Median etter {horizon} år</div>
            </div>

            {/* Total return % */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-xs text-gray-500 font-medium mb-1">
                Totalavkastning (%)
              </div>
              <div className={`text-xl font-bold ${totalReturnPct >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                {totalReturnPct >= 0 ? '+' : ''}{fmtPct(totalReturnPct)}
              </div>
              <div className="text-xs text-gray-400 mt-1">Median etter {horizon} år</div>
            </div>
          </div>

          {/* Explanation text */}
          <div className="mt-6 bg-blue-50 rounded-lg p-4 text-sm text-gray-600 leading-relaxed">
            <p className="font-semibold text-gray-700 mb-1">Om prognosen</p>
            <p>
              Prognosen er basert på {nSim} Monte Carlo-simuleringer med geometrisk
              brownsk bevegelse (GBM). Forventet årlig avkastning er{' '}
              <span className="font-semibold">{fmtPct(mu * 100)}</span> med
              volatilitet på{' '}
              <span className="font-semibold">{fmtPct(sigma * 100)}</span>.
              Inflasjon er satt til{' '}
              <span className="font-semibold">{fmtPct(inflasjon * 100)}</span> per år.
              Sannsynlighetsbåndene viser 10.–90. og 25.–75. persentil.
              Dette er en illustrasjon og ikke en kvantitativ modell.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
