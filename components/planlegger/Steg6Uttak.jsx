import React, { useMemo, useCallback } from 'react';
import {
  ComposedChart, Line, Area,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';

/* ─── Colors ─── */
const COLORS = {
  navy: '#012441',
  salmon: '#C4967E',
  teal: '#2D6A6A',
  red: '#B91C1C',
  gold: '#A67B3D',
  lightBlue: 'rgba(107, 157, 184, 0.3)',
  lighterBlue: 'rgba(107, 157, 184, 0.15)',
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

/* ─── Custom tooltip for wealth chart ─── */
function WealthTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const items = payload.filter(e => e.dataKey !== 'band1090' && e.dataKey !== 'band2575');
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
      {dataPoint?.p90 != null && (
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

/* ─── Custom tooltip for sequence risk chart ─── */
function SekvensTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white shadow-lg rounded-lg border border-gray-200 px-4 py-3 text-sm">
      <div className="font-semibold text-gray-800 mb-2">År {label}</div>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-full inline-block flex-shrink-0"
            style={{ backgroundColor: entry.color || entry.stroke }}
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
export default function Steg6Uttak({ state, dispatch }) {
  const currentYear = new Date().getFullYear();
  const horizon = state.hovedhorisont || 10;
  const inflasjon = (state.forutsetninger?.inflasjon ?? 2.5) / 100;
  const nSim = state.forutsetninger?.monteCarloSimuleringer || 1000;

  const eiendeler = state.eiendeler || [];
  const gjeld = state.gjeld || [];
  const forslaattAllokering = state.forslaattAllokering || {};

  const uttakSlider = state.uttakSlider || 0;

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

  /* ─── Slider config ─── */
  const sliderMax = useMemo(() => {
    // Max is about 8% of portfolio or at least 500k, in 50k steps
    const pctBased = Math.ceil((startVerdi * 0.08) / 50000) * 50000;
    return Math.max(500000, pctBased);
  }, [startVerdi]);

  const uttakPct = startVerdi > 0 ? ((uttakSlider / startVerdi) * 100) : 0;

  const handleSliderChange = useCallback((e) => {
    const val = Number(e.target.value);
    dispatch({ uttakSlider: val });
  }, [dispatch]);

  /* ─── 4% rule adapted for Norwegian tax ─── */
  const fireRegelBrutto = useMemo(() => {
    // The 4% rule: 4% of portfolio annually, but Norwegian capital gains tax is ~37.84%
    // So the gross withdrawal needs to be higher to get 4% net after tax
    // Net = Gross - Tax on gains portion. Simplified: assume ~50% of withdrawal is gains.
    // Gross needed = 4% / (1 - tax * gains_fraction)
    const gevinstskatt = (state.forutsetninger?.gevinstskatt ?? 37.84) / 100;
    const gainsShare = 0.5; // assume half of withdrawal is taxable gains
    const netRate = 0.04;
    const grossRate = netRate / (1 - gevinstskatt * gainsShare);
    return Math.round(startVerdi * grossRate);
  }, [startVerdi, state.forutsetninger]);

  /* ─── Monte Carlo simulation with withdrawal ─── */
  const withdrawalSim = useMemo(() => {
    if (startVerdi <= 0) return null;
    const years = horizon;
    const annualWithdrawal = uttakSlider;
    const allPaths = [];

    for (let sim = 0; sim < nSim; sim++) {
      const path = new Array(years + 1);
      path[0] = startVerdi;
      for (let y = 1; y <= years; y++) {
        const [z] = boxMuller();
        const drift = mu - (sigma * sigma) / 2;
        let nextVal = path[y - 1] * Math.exp(drift + sigma * z);
        // Subtract inflation-adjusted withdrawal
        const inflAdj = annualWithdrawal * Math.pow(1 + inflasjon, y - 1);
        nextVal -= inflAdj;
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
      const p10v = Math.round(percentile(vals, 10));
      const p25v = Math.round(percentile(vals, 25));
      const med = Math.round(percentile(vals, 50));
      const p75v = Math.round(percentile(vals, 75));
      const p90v = Math.round(percentile(vals, 90));

      chartData.push({
        year: absYear,
        p10: p10v,
        p25: p25v,
        median: med,
        p75: p75v,
        p90: p90v,
        band1090: [p10v, p90v],
        band2575: [p25v, p75v],
      });
    }

    // "Pengene varer til" — find the first year where median hits 0
    let pengerVarerTil = null;
    for (let y = 1; y <= years; y++) {
      if (chartData[y].median <= 0) {
        pengerVarerTil = chartData[y - 1].year;
        break;
      }
    }
    // If median never hits 0, money lasts beyond the horizon
    if (pengerVarerTil === null && annualWithdrawal > 0) {
      pengerVarerTil = currentYear + years; // lasts the whole horizon
    }

    // Probability of ruin: fraction of paths that hit 0 before horizon
    const ruinCount = allPaths.filter(p => p[years] <= 0).length;
    const ruinPct = (ruinCount / nSim) * 100;

    return { chartData, pengerVarerTil, ruinPct };
  }, [startVerdi, horizon, mu, sigma, nSim, inflasjon, currentYear, uttakSlider]);

  /* ─── Safe withdrawal rate calculation (binary search) ─── */
  const safeWithdrawal = useMemo(() => {
    if (startVerdi <= 0) return { belop: 0, pct: 0 };

    const years = horizon;
    const targetSuccessRate = 0.90; // 90% probability
    const simCount = Math.min(nSim, 500); // use fewer sims for speed in binary search

    // Binary search for highest withdrawal where >= 90% of sims end with positive wealth
    let lo = 0;
    let hi = startVerdi * 0.10; // max 10% of portfolio
    let bestWithdrawal = 0;

    for (let iter = 0; iter < 30; iter++) {
      const mid = (lo + hi) / 2;
      let successCount = 0;

      for (let sim = 0; sim < simCount; sim++) {
        let wealth = startVerdi;
        for (let y = 1; y <= years; y++) {
          const [z] = boxMuller();
          const drift = mu - (sigma * sigma) / 2;
          wealth = wealth * Math.exp(drift + sigma * z);
          wealth -= mid * Math.pow(1 + inflasjon, y - 1);
          if (wealth <= 0) { wealth = 0; break; }
        }
        if (wealth > 0) successCount++;
      }

      const successRate = successCount / simCount;
      if (successRate >= targetSuccessRate) {
        bestWithdrawal = mid;
        lo = mid;
      } else {
        hi = mid;
      }
    }

    // Round to nearest 10,000
    const rounded = Math.round(bestWithdrawal / 10000) * 10000;
    return {
      belop: rounded,
      pct: startVerdi > 0 ? (rounded / startVerdi) * 100 : 0,
    };
  }, [startVerdi, horizon, mu, sigma, nSim, inflasjon]);

  /* ─── Sequence risk: deterministic scenarios ─── */
  const sekvensData = useMemo(() => {
    if (startVerdi <= 0) return [];

    const years = Math.max(horizon, 20);
    const annualWithdrawal = uttakSlider || safeWithdrawal.belop || Math.round(startVerdi * 0.04);
    const crashReturn = -0.40;
    const normalReturn = mu;

    // Scenario A: crash year 1, then normal returns
    const pathA = [startVerdi];
    for (let y = 1; y <= years; y++) {
      const r = y === 1 ? crashReturn : normalReturn;
      let val = pathA[y - 1] * (1 + r);
      val -= annualWithdrawal * Math.pow(1 + inflasjon, y - 1);
      pathA.push(Math.max(0, val));
    }

    // Scenario B: normal returns, then crash at year 10
    const crashYear = Math.min(10, years);
    const pathB = [startVerdi];
    for (let y = 1; y <= years; y++) {
      const r = y === crashYear ? crashReturn : normalReturn;
      let val = pathB[y - 1] * (1 + r);
      val -= annualWithdrawal * Math.pow(1 + inflasjon, y - 1);
      pathB.push(Math.max(0, val));
    }

    // No withdrawal reference line (just growth, no withdrawal)
    const pathNoUttak = [startVerdi];
    for (let y = 1; y <= years; y++) {
      const val = pathNoUttak[y - 1] * (1 + normalReturn);
      pathNoUttak.push(val);
    }

    const data = [];
    for (let y = 0; y <= years; y++) {
      data.push({
        year: currentYear + y,
        scenarioA: Math.round(pathA[y]),
        scenarioB: Math.round(pathB[y]),
      });
    }

    return data;
  }, [startVerdi, horizon, mu, inflasjon, currentYear, uttakSlider, safeWithdrawal.belop]);

  /* ─── Empty state ─── */
  if (startVerdi <= 0) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4" style={{ backgroundColor: COLORS.navy }}>
            <h2 className="text-lg font-semibold text-white">Uttak &amp; pensjon</h2>
          </div>
          <div className="px-6 py-12 text-center">
            <p className="text-gray-500 text-lg mb-2">
              Ingen portefolje a vise.
            </p>
            <p className="text-gray-400 text-sm">
              Legg inn eiendeler i steg 1 (Nasituasjon) for a analysere uttak.
              Netto portefoljeverdi ma vaere storre enn null.
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

  const simData = withdrawalSim;

  return (
    <div className="space-y-6">

      {/* ═══ KEY METRIC CARDS ═══ */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4" style={{ backgroundColor: COLORS.navy }}>
          <h2 className="text-lg font-semibold text-white">Uttak &amp; pensjon</h2>
        </div>
        <div className="px-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Annual withdrawal */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-xs text-gray-500 font-medium mb-1">Arlig uttak</div>
              <div className="text-xl font-bold" style={{ color: COLORS.navy }}>
                {fmtNOK(uttakSlider)}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {fmtPct(uttakPct)} av portefoljen
              </div>
            </div>

            {/* Money lasts until */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-xs text-gray-500 font-medium mb-1">Pengene varer til</div>
              <div className="text-xl font-bold" style={{ color: COLORS.teal }}>
                {uttakSlider === 0
                  ? 'Ingen uttak'
                  : simData?.pengerVarerTil
                    ? `${simData.pengerVarerTil}`
                    : 'Beregner...'}
              </div>
              {uttakSlider > 0 && simData && (
                <div className="text-xs text-gray-400 mt-1">
                  Sannsynlighet for tom konto: {fmtPct(simData.ruinPct)}
                </div>
              )}
            </div>

            {/* Safe withdrawal (90%) */}
            <div className="rounded-lg p-4" style={{ backgroundColor: '#f0fdf4' }}>
              <div className="text-xs text-gray-500 font-medium mb-1">Trygt uttak (90 %)</div>
              <div className="text-xl font-bold text-green-700">
                {fmtNOK(safeWithdrawal.belop)}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {fmtPct(safeWithdrawal.pct)} av portefoljen
              </div>
            </div>

            {/* 4% rule adapted */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-xs text-gray-500 font-medium mb-1">4 %-regelen tilpasset</div>
              <div className="text-xl font-bold" style={{ color: COLORS.gold }}>
                {fmtNOK(fireRegelBrutto)}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Brutto for norsk skatt
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ SUSTAINABLE WITHDRAWAL — SLIDER + CHART ═══ */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4" style={{ backgroundColor: COLORS.navy }}>
          <h2 className="text-lg font-semibold text-white">Baerekraftig uttak</h2>
        </div>

        <div className="px-6 py-6">
          {/* Slider */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">
                Arlig uttak (inflasjonsjustert)
              </label>
              <div className="text-sm font-semibold" style={{ color: COLORS.navy }}>
                {fmtNOK(uttakSlider)} / ar ({fmtPct(uttakPct)})
              </div>
            </div>
            <input
              type="range"
              min={0}
              max={sliderMax}
              step={50000}
              value={uttakSlider}
              onChange={handleSliderChange}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer"
              style={{
                accentColor: COLORS.navy,
                background: `linear-gradient(to right, ${COLORS.navy} 0%, ${COLORS.navy} ${(uttakSlider / sliderMax) * 100}%, #e5e7eb ${(uttakSlider / sliderMax) * 100}%, #e5e7eb 100%)`,
              }}
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>{fmtNOK(0)}</span>
              <span>{fmtNOK(sliderMax)}</span>
            </div>

            {/* Quick select buttons */}
            <div className="flex flex-wrap gap-2 mt-3">
              {[
                { label: 'Trygt (90 %)', value: safeWithdrawal.belop },
                { label: '4 %-regelen', value: fireRegelBrutto },
                { label: '2 % forsiktig', value: Math.round((startVerdi * 0.02) / 50000) * 50000 },
                { label: '6 % aggressiv', value: Math.round((startVerdi * 0.06) / 50000) * 50000 },
              ].map((btn) => (
                <button
                  key={btn.label}
                  onClick={() => dispatch({ uttakSlider: Math.min(btn.value, sliderMax) })}
                  className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${
                    uttakSlider === btn.value
                      ? 'border-blue-300 bg-blue-50 text-blue-700 font-semibold'
                      : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {btn.label}: {fmtNOKShort(btn.value)}
                </button>
              ))}
            </div>
          </div>

          {/* Wealth development chart with withdrawal */}
          {simData && (
            <>
              <div style={{ width: '100%', height: 400 }}>
                <ResponsiveContainer>
                  <ComposedChart data={simData.chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
                    <Tooltip content={<WealthTooltip />} />

                    {/* 10-90 percentile band */}
                    <Area
                      type="monotone"
                      dataKey="band1090"
                      stroke="none"
                      fill={COLORS.lighterBlue}
                      name="10.--90. persentil"
                      isAnimationActive={false}
                      legendType="none"
                    />

                    {/* 25-75 percentile band */}
                    <Area
                      type="monotone"
                      dataKey="band2575"
                      stroke="none"
                      fill={COLORS.lightBlue}
                      name="25.--75. persentil"
                      isAnimationActive={false}
                      legendType="none"
                    />

                    {/* Median line */}
                    <Line
                      type="monotone"
                      dataKey="median"
                      stroke={COLORS.navy}
                      strokeWidth={2.5}
                      dot={false}
                      name="Median formue"
                      isAnimationActive={false}
                    />

                    {/* Zero reference line */}
                    <ReferenceLine y={0} stroke="#9ca3af" strokeWidth={1} />

                    {/* Start value reference */}
                    <ReferenceLine
                      y={startVerdi}
                      stroke={COLORS.salmon}
                      strokeDasharray="6 4"
                      strokeWidth={1}
                      label={{
                        value: 'Startverdi',
                        position: 'right',
                        fill: COLORS.salmon,
                        fontSize: 11,
                      }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-6 mt-4 text-xs text-gray-600 justify-center">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-0.5 rounded" style={{ backgroundColor: COLORS.navy }} />
                  <span>Median formue</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-3 rounded" style={{ backgroundColor: COLORS.lightBlue }} />
                  <span>25.--75. persentil</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-3 rounded" style={{ backgroundColor: COLORS.lighterBlue }} />
                  <span>10.--90. persentil</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-0.5 rounded border-dashed border-t-2" style={{ borderColor: COLORS.salmon }} />
                  <span>Startverdi</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ═══ SEQUENCE RISK VISUALIZATION ═══ */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4" style={{ backgroundColor: COLORS.navy }}>
          <h2 className="text-lg font-semibold text-white">Sekvensrisiko-visualisering</h2>
        </div>

        <div className="px-6 py-6">
          <div className="mb-4">
            <p className="text-sm text-gray-600 leading-relaxed">
              Rekkef&oslash;lgen p&aring; avkastningen er avgj&oslash;rende n&aring;r du tar ut penger.
              To scenarier med <span className="font-semibold">identisk gjennomsnittlig avkastning</span> gir
              dramatisk forskjellige utfall avhengig av <span className="font-semibold">n&aring;r</span> krakket
              inntreffer.
            </p>
          </div>

          {/* Scenario descriptions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="rounded-lg p-4 border-l-4" style={{ borderColor: COLORS.red, backgroundColor: '#fef2f2' }}>
              <div className="text-sm font-semibold" style={{ color: COLORS.red }}>
                Scenario A: Krakk &aring;r 1
              </div>
              <div className="text-xs text-gray-600 mt-1">
                -40 % f&oslash;rste &aring;r, deretter {fmtPct(mu * 100)} &aring;rlig avkastning.
                Et tidlig krakk treffer hardt fordi du selger p&aring; bunn.
              </div>
            </div>
            <div className="rounded-lg p-4 border-l-4" style={{ borderColor: COLORS.teal, backgroundColor: '#f0fdfa' }}>
              <div className="text-sm font-semibold" style={{ color: COLORS.teal }}>
                Scenario B: Krakk &aring;r 10
              </div>
              <div className="text-xs text-gray-600 mt-1">
                {fmtPct(mu * 100)} &aring;rlig avkastning i 9 &aring;r, deretter -40 % i &aring;r 10.
                Sent krakk gir buffer fordi formuen har vokst.
              </div>
            </div>
          </div>

          {/* Sequence risk chart */}
          {sekvensData.length > 0 && (
            <>
              <div style={{ width: '100%', height: 380 }}>
                <ResponsiveContainer>
                  <ComposedChart data={sekvensData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
                    <Tooltip content={<SekvensTooltip />} />

                    {/* Scenario A: early crash */}
                    <Line
                      type="monotone"
                      dataKey="scenarioA"
                      stroke={COLORS.red}
                      strokeWidth={2.5}
                      dot={false}
                      name="A: Krakk ar 1"
                      isAnimationActive={false}
                    />

                    {/* Scenario B: late crash */}
                    <Line
                      type="monotone"
                      dataKey="scenarioB"
                      stroke={COLORS.teal}
                      strokeWidth={2.5}
                      dot={false}
                      name="B: Krakk ar 10"
                      isAnimationActive={false}
                    />

                    {/* Zero line */}
                    <ReferenceLine y={0} stroke="#9ca3af" strokeWidth={1} />

                    {/* Crash markers */}
                    <ReferenceLine
                      x={currentYear + 1}
                      stroke={COLORS.red}
                      strokeDasharray="4 3"
                      strokeWidth={1}
                      label={{
                        value: 'Krakk A',
                        position: 'top',
                        fill: COLORS.red,
                        fontSize: 10,
                        fontWeight: 600,
                      }}
                    />
                    <ReferenceLine
                      x={currentYear + Math.min(10, Math.max(horizon, 20))}
                      stroke={COLORS.teal}
                      strokeDasharray="4 3"
                      strokeWidth={1}
                      label={{
                        value: 'Krakk B',
                        position: 'top',
                        fill: COLORS.teal,
                        fontSize: 10,
                        fontWeight: 600,
                      }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-6 mt-4 text-xs text-gray-600 justify-center">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-0.5 rounded" style={{ backgroundColor: COLORS.red }} />
                  <span>Scenario A: Krakk ar 1</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-0.5 rounded" style={{ backgroundColor: COLORS.teal }} />
                  <span>Scenario B: Krakk ar 10</span>
                </div>
              </div>

              {/* Outcome comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="bg-red-50 rounded-lg p-4">
                  <div className="text-xs text-gray-500 font-medium mb-1">Sluttformue Scenario A (krakk ar 1)</div>
                  <div className="text-xl font-bold text-red-700">
                    {fmtNOK(sekvensData[sekvensData.length - 1]?.scenarioA ?? 0)}
                  </div>
                </div>
                <div className="rounded-lg p-4" style={{ backgroundColor: '#f0fdfa' }}>
                  <div className="text-xs text-gray-500 font-medium mb-1">Sluttformue Scenario B (krakk ar 10)</div>
                  <div className="text-xl font-bold" style={{ color: COLORS.teal }}>
                    {fmtNOK(sekvensData[sekvensData.length - 1]?.scenarioB ?? 0)}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Educational note */}
          <div className="mt-6 bg-amber-50 rounded-lg p-4 text-sm text-gray-600 leading-relaxed border border-amber-100">
            <p className="font-semibold text-gray-700 mb-1">Hvorfor er dette viktig?</p>
            <p>
              Sekvensrisiko er den st&oslash;rste trusselen mot din pensjon. Selv med identisk
              gjennomsnittlig avkastning kan et krakk tidlig i uttaksperioden t&oslash;mme kontoen
              &aring;r f&oslash;r forventet. Tiltak som kan redusere sekvensrisiko:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-gray-500">
              <li>Hold 2--3 &aring;rs uttaksbehov i kontanter eller korte rentefond</li>
              <li>Reduser aksjeandelen gradvis inn mot uttaksstart</li>
              <li>Vurder fleksibelt uttak: ta ut mindre i d&aring;rlige &aring;r</li>
              <li>Start med lavere uttak og &oslash;k over tid (&laquo;guardrails&raquo;-metoden)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* ═══ RECOMMENDED WITHDRAWAL RATE ═══ */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4" style={{ backgroundColor: COLORS.navy }}>
          <h2 className="text-lg font-semibold text-white">Anbefalt uttaksrate</h2>
        </div>

        <div className="px-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Safe withdrawal highlight */}
            <div className="md:col-span-1">
              <div className="rounded-xl p-6 text-center" style={{ backgroundColor: '#f0fdf4', border: '2px solid #bbf7d0' }}>
                <div className="text-xs text-gray-500 font-medium mb-2">Trygt arlig uttak</div>
                <div className="text-3xl font-bold text-green-700 mb-1">
                  {fmtNOK(safeWithdrawal.belop)}
                </div>
                <div className="text-lg font-semibold text-green-600">
                  {fmtPct(safeWithdrawal.pct)} av portefoljen
                </div>
                <div className="text-xs text-gray-400 mt-2">
                  90 % sannsynlighet for at pengene varer i {horizon} ar
                </div>
              </div>
            </div>

            {/* Comparison table */}
            <div className="md:col-span-2">
              <div className="text-sm font-medium text-gray-700 mb-3">Sammenligning av uttaksniva</div>
              <div className="overflow-hidden rounded-lg border border-gray-200">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">Strategi</th>
                      <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">Arlig uttak</th>
                      <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">Andel</th>
                      <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">Kommentar</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-gray-100">
                      <td className="px-4 py-2.5 font-medium text-gray-700">Forsiktig (2 %)</td>
                      <td className="px-4 py-2.5 text-right text-gray-800">{fmtNOK(Math.round(startVerdi * 0.02))}</td>
                      <td className="px-4 py-2.5 text-right text-gray-500">2,0 %</td>
                      <td className="px-4 py-2.5 text-right text-xs text-gray-400">Svart lav risiko</td>
                    </tr>
                    <tr className="border-t border-gray-100 bg-green-50">
                      <td className="px-4 py-2.5 font-semibold text-green-700">Trygt (90 %)</td>
                      <td className="px-4 py-2.5 text-right font-semibold text-green-700">{fmtNOK(safeWithdrawal.belop)}</td>
                      <td className="px-4 py-2.5 text-right text-green-600">{fmtPct(safeWithdrawal.pct)}</td>
                      <td className="px-4 py-2.5 text-right text-xs text-green-600">Anbefalt</td>
                    </tr>
                    <tr className="border-t border-gray-100">
                      <td className="px-4 py-2.5 font-medium text-gray-700">4 %-regelen</td>
                      <td className="px-4 py-2.5 text-right text-gray-800">{fmtNOK(Math.round(startVerdi * 0.04))}</td>
                      <td className="px-4 py-2.5 text-right text-gray-500">4,0 %</td>
                      <td className="px-4 py-2.5 text-right text-xs text-gray-400">Klassisk (for skatt)</td>
                    </tr>
                    <tr className="border-t border-gray-100">
                      <td className="px-4 py-2.5 font-medium" style={{ color: COLORS.gold }}>4 %-regelen (etter skatt)</td>
                      <td className="px-4 py-2.5 text-right" style={{ color: COLORS.gold }}>{fmtNOK(fireRegelBrutto)}</td>
                      <td className="px-4 py-2.5 text-right text-gray-500">{fmtPct((fireRegelBrutto / startVerdi) * 100)}</td>
                      <td className="px-4 py-2.5 text-right text-xs text-gray-400">Brutto for norsk skatt</td>
                    </tr>
                    <tr className="border-t border-gray-100">
                      <td className="px-4 py-2.5 font-medium text-red-600">Aggressiv (6 %)</td>
                      <td className="px-4 py-2.5 text-right text-red-600">{fmtNOK(Math.round(startVerdi * 0.06))}</td>
                      <td className="px-4 py-2.5 text-right text-gray-500">6,0 %</td>
                      <td className="px-4 py-2.5 text-right text-xs text-red-400">Hoy risiko for tom konto</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Explanation */}
          <div className="mt-6 bg-blue-50 rounded-lg p-4 text-sm text-gray-600 leading-relaxed">
            <p className="font-semibold text-gray-700 mb-1">Om beregningen</p>
            <p>
              Trygt uttak er beregnet med {nSim > 500 ? 500 : nSim} Monte Carlo-simuleringer
              (binar sokning etter hoyeste uttak med 90 % suksessrate over {horizon} ar).
              Uttaket er inflasjonsjustert ({fmtPct(inflasjon * 100)} arlig).
              Forventet avkastning: {fmtPct(mu * 100)}, volatilitet: {fmtPct(sigma * 100)}.
              4 %-regelen er tilpasset norsk gevinstbeskatning pa {fmtPct(state.forutsetninger?.gevinstskatt ?? 37.84)}.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
