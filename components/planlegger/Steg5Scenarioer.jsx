import React, { useState, useMemo, useCallback } from 'react';
import {
  ComposedChart, Line, Area,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { KRISE_SCENARIOER } from '../../lib/formuesplanleggerState';

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

/* ─── Classify asset to crisis category (aksjer / hoyrente / eiendom) ─── */
function classifyForCrisis(pos) {
  const uk = (pos.underkategori || '').toLowerCase();
  const kat = (pos.kategori || '').toLowerCase();

  // Eiendom
  if (kat.includes('bolig') || uk.includes('bolig') || uk.includes('eiendom') || uk.includes('utleie')) {
    return 'eiendom';
  }
  // Hoyrente / renter
  if (uk.includes('høyrente') || uk.includes('rente') || uk.includes('rentefond') || uk.includes('basis') || uk.includes('bank') || uk.includes('innskudd')) {
    return 'hoyrente';
  }
  // Aksjer (default for equity-like positions)
  if (uk.includes('aksje') || uk.includes('aksjefond') || uk.includes('global') || uk.includes('norge') ||
      uk.includes('financial') || uk.includes('banking') || uk.includes('energy') || uk.includes('edge') ||
      uk.includes('pe-fond') || uk.includes('shipping') || uk.includes('unoterte') || uk.includes('virksomhet')) {
    return 'aksjer';
  }
  // Fallback: treat as aksjer for stress purposes
  return 'aksjer';
}

/* ─── Classify forslaattAllokering products ─── */
function classifyProductForCrisis(productName) {
  const lower = productName.toLowerCase();
  if (lower.includes('høyrente') || lower.includes('basis') || lower.includes('rentefond') || lower.includes('bank')) {
    return 'hoyrente';
  }
  if (lower.includes('eiendom') || lower.includes('bolig')) {
    return 'eiendom';
  }
  return 'aksjer';
}

/* ─── Custom tooltip for comparison chart ─── */
function ComparisonTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white shadow-lg rounded-lg border border-gray-200 px-4 py-3 text-sm max-w-xs">
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
      {payload.length >= 2 && (
        <div className="mt-2 pt-2 border-t border-gray-100 text-gray-500">
          Differanse: {fmtNOK((payload[0]?.value || 0) - (payload[1]?.value || 0))}
        </div>
      )}
    </div>
  );
}

/* ─── Personal scenario types ─── */
const PERSONLIGE_TYPER = [
  { id: 'tidlig_pensjon', label: 'Tidlig pensjon', beskrivelse: 'Stopp arbeidsinntekt 5 år tidligere' },
  { id: 'stort_uttak', label: 'Stort uttak', beskrivelse: 'Engangsuttak av et gitt beløp i et bestemt år' },
  { id: 'salg_illikvid', label: 'Salg av illikvid posisjon', beskrivelse: 'Konverter en spesifikk eiendel til likvid portefølje' },
  { id: 'generasjonsoverforing', label: 'Generasjonsoverføring', beskrivelse: 'Overfør et beløp ut av porteføljen i et bestemt år' },
];

/* ═══════════════════════════════════════════════════════════════
   Main component
   ═══════════════════════════════════════════════════════════════ */
export default function Steg5Scenarioer({ state, dispatch }) {
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
  const aktivtScenario = state.aktivtScenario || null;
  const egneScenarioer = state.egneScenarioer || [];

  // Local UI state
  const [visPersonligForm, setVisPersonligForm] = useState(false);
  const [nyType, setNyType] = useState('stort_uttak');
  const [nyBelop, setNyBelop] = useState(1000000);
  const [nyAar, setNyAar] = useState(currentYear + 5);
  const [nyKommentar, setNyKommentar] = useState('');

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

  /* ─── Compute crisis category weights from portfolio ─── */
  const crisisWeights = useMemo(() => {
    const weights = { aksjer: 0, hoyrente: 0, eiendom: 0 };
    let total = 0;

    const allokKeys = Object.keys(forslaattAllokering);
    const hasAllokering = allokKeys.length > 0 && allokKeys.some(k => forslaattAllokering[k] > 0);

    if (hasAllokering) {
      for (const [prod, vekt] of Object.entries(forslaattAllokering)) {
        const w = Number(vekt) || 0;
        if (w <= 0) continue;
        total += w;
        const cat = classifyProductForCrisis(prod);
        weights[cat] += w;
      }
    } else {
      for (const e of eiendeler) {
        const v = Number(e.verdi) || 0;
        if (v <= 0) continue;
        total += v;
        const cat = classifyForCrisis(e);
        weights[cat] += v;
      }
    }

    if (total > 0) {
      weights.aksjer /= total;
      weights.hoyrente /= total;
      weights.eiendom /= total;
    }
    return weights;
  }, [eiendeler, forslaattAllokering]);

  /* ─── Build cash flow map by year offset ─── */
  const cashFlowByYear = useMemo(() => {
    const map = {};
    for (let y = 0; y <= horizon; y++) {
      map[y] = { inn: 0, ut: 0 };
    }
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

  /* ─── Find the active scenario details ─── */
  const activeScenarioDetails = useMemo(() => {
    if (!aktivtScenario) return null;
    // Check predefined
    const krise = KRISE_SCENARIOER.find(s => s.id === aktivtScenario);
    if (krise) return { ...krise, type: 'krise' };
    // Check personal
    const egen = egneScenarioer.find(s => s.id === aktivtScenario);
    if (egen) return { ...egen, type: 'personlig' };
    return null;
  }, [aktivtScenario, egneScenarioer]);

  /* ─── Compute portfolio-level shock percentage for a crisis scenario ─── */
  const computeShockPct = useCallback((scenario) => {
    const shockAksjer = (scenario.aksjer || 0) / 100;
    const shockHoyrente = (scenario.hoyrente || 0) / 100;
    const shockEiendom = (scenario.eiendom || 0) / 100;
    return crisisWeights.aksjer * shockAksjer +
           crisisWeights.hoyrente * shockHoyrente +
           crisisWeights.eiendom * shockEiendom;
  }, [crisisWeights]);

  /* ─── Build extra cash flow adjustments from personal scenario ─── */
  const buildPersonalCashFlows = useCallback((scenario) => {
    const extra = {};
    for (let y = 0; y <= horizon; y++) extra[y] = 0;

    if (!scenario || scenario.type !== 'personlig') return extra;

    if (scenario.scenarioType === 'tidlig_pensjon') {
      // Stop withdrawals 5 years earlier => additional drain for those years where
      // income would have covered expenses. Model as extra withdrawal.
      const tidligAar = 5;
      for (let y = 0; y <= horizon; y++) {
        const absYear = currentYear + y;
        const normalPensjonStart = uttakStartAar;
        if (absYear >= (normalPensjonStart - tidligAar) && absYear < normalPensjonStart) {
          extra[y] = -(aarligUttak || 500000);
        }
      }
    } else if (scenario.scenarioType === 'stort_uttak') {
      const yearOffset = (Number(scenario.aar) || (currentYear + 5)) - currentYear;
      if (yearOffset >= 0 && yearOffset <= horizon) {
        extra[yearOffset] = -(Number(scenario.belop) || 0);
      }
    } else if (scenario.scenarioType === 'salg_illikvid') {
      // Net zero impact (asset sold, cash comes in) but model a small loss on forced sale
      const yearOffset = (Number(scenario.aar) || (currentYear + 5)) - currentYear;
      if (yearOffset >= 0 && yearOffset <= horizon) {
        const belop = Number(scenario.belop) || 0;
        extra[yearOffset] = -Math.round(belop * 0.1); // 10% haircut on forced sale
      }
    } else if (scenario.scenarioType === 'generasjonsoverforing') {
      const yearOffset = (Number(scenario.aar) || (currentYear + 5)) - currentYear;
      if (yearOffset >= 0 && yearOffset <= horizon) {
        extra[yearOffset] = -(Number(scenario.belop) || 0);
      }
    }

    return extra;
  }, [horizon, currentYear, uttakStartAar, aarligUttak]);

  /* ─── Monte Carlo simulation: basis + stress ─── */
  const simulation = useMemo(() => {
    if (startVerdi <= 0) return null;

    const years = horizon;
    const basisPaths = [];
    const stressPaths = [];

    const isKrise = activeScenarioDetails?.type === 'krise';
    const isPersonlig = activeScenarioDetails?.type === 'personlig';
    const shockPct = isKrise ? computeShockPct(activeScenarioDetails) : 0;
    const varighet = isKrise ? (activeScenarioDetails.varighet || 1) : 0;
    const personalCF = isPersonlig ? buildPersonalCashFlows(activeScenarioDetails) : {};

    for (let sim = 0; sim < nSim; sim++) {
      const basisPath = new Array(years + 1);
      const stressPath = new Array(years + 1);
      basisPath[0] = startVerdi;
      stressPath[0] = startVerdi;

      for (let y = 1; y <= years; y++) {
        const [z] = boxMuller();
        const drift = mu - (sigma * sigma) / 2;
        const growthFactor = Math.exp(drift + sigma * z);

        // Basis path
        let bVal = basisPath[y - 1] * growthFactor;
        const cf = cashFlowByYear[y] || { inn: 0, ut: 0 };
        bVal += cf.inn + cf.ut;
        basisPath[y] = Math.max(0, bVal);

        // Stress path
        let sVal = stressPath[y - 1];
        if (isKrise && y <= varighet) {
          // During crisis years: apply shock instead of normal growth
          // Shock is the annual equivalent: for 1-year events the full shock,
          // for multi-year (e.g. stagflasjon) the shock is per-year
          sVal = sVal * (1 + shockPct);
        } else {
          sVal = sVal * growthFactor;
        }
        sVal += cf.inn + cf.ut;
        if (isPersonlig) {
          sVal += personalCF[y] || 0;
        }
        stressPath[y] = Math.max(0, sVal);
      }

      basisPaths.push(basisPath);
      stressPaths.push(stressPath);
    }

    // Compute medians at each year
    const chartData = [];
    for (let y = 0; y <= years; y++) {
      const basisVals = basisPaths.map(p => p[y]).sort((a, b) => a - b);
      const stressVals = stressPaths.map(p => p[y]).sort((a, b) => a - b);
      const absYear = currentYear + y;

      const bMedian = Math.round(percentile(basisVals, 50));
      const sMedian = Math.round(percentile(stressVals, 50));

      chartData.push({
        year: absYear,
        basis: bMedian,
        stress: sMedian,
        basisP25: Math.round(percentile(basisVals, 25)),
        basisP75: Math.round(percentile(basisVals, 75)),
        basisBand: [Math.round(percentile(basisVals, 25)), Math.round(percentile(basisVals, 75))],
      });
    }

    // Final values
    const basisFinal = basisPaths.map(p => p[years]).sort((a, b) => a - b);
    const stressFinal = stressPaths.map(p => p[years]).sort((a, b) => a - b);
    const basisMedianFinal = Math.round(percentile(basisFinal, 50));
    const stressMedianFinal = Math.round(percentile(stressFinal, 50));

    // Robustness: % of basis simulations ending positive
    const basisPositive = basisFinal.filter(v => v > 0).length;
    const stressPositive = stressFinal.filter(v => v > 0).length;
    const basisRobustness = Math.round((basisPositive / nSim) * 100);
    const stressRobustness = Math.round((stressPositive / nSim) * 100);

    // Years until money runs out (median stress path)
    let stressRunsOutYear = null;
    for (let y = 1; y <= years; y++) {
      if (chartData[y].stress <= 0) {
        stressRunsOutYear = chartData[y].year;
        break;
      }
    }

    // Difference
    const diffKr = basisMedianFinal - stressMedianFinal;
    const diffPct = basisMedianFinal > 0 ? (diffKr / basisMedianFinal) * 100 : 0;

    // Annual table data (every year or every 5 years for long horizons)
    const step = years > 15 ? 5 : (years > 8 ? 2 : 1);
    const tableData = [];
    for (let y = 0; y <= years; y += step) {
      tableData.push(chartData[y]);
    }
    // Always include last year
    if (tableData.length === 0 || tableData[tableData.length - 1].year !== currentYear + years) {
      tableData.push(chartData[years]);
    }

    return {
      chartData,
      tableData,
      basisMedianFinal,
      stressMedianFinal,
      diffKr,
      diffPct,
      basisRobustness,
      stressRobustness,
      stressRunsOutYear,
    };
  }, [startVerdi, horizon, mu, sigma, nSim, cashFlowByYear, currentYear,
      activeScenarioDetails, computeShockPct, buildPersonalCashFlows]);

  /* ─── Handlers ─── */
  const handleSelectScenario = (scenarioId) => {
    dispatch({ aktivtScenario: aktivtScenario === scenarioId ? null : scenarioId });
  };

  const handleAddPersonalScenario = () => {
    const newScenario = {
      id: `egen_${Date.now()}`,
      scenarioType: nyType,
      label: nyType === 'tidlig_pensjon' ? 'Tidlig pensjon (-5 år)'
           : nyType === 'stort_uttak' ? `Stort uttak ${fmtNOKShort(nyBelop)} i ${nyAar}`
           : nyType === 'salg_illikvid' ? `Salg illikvid ${fmtNOKShort(nyBelop)} i ${nyAar}`
           : `Generasjonsoverføring ${fmtNOKShort(nyBelop)} i ${nyAar}`,
      belop: nyBelop,
      aar: nyAar,
      kommentar: nyKommentar,
    };
    dispatch(prev => ({
      ...prev,
      egneScenarioer: [...(prev.egneScenarioer || []), newScenario],
      aktivtScenario: newScenario.id,
    }));
    setVisPersonligForm(false);
    setNyKommentar('');
  };

  const handleDeletePersonalScenario = (id) => {
    dispatch(prev => ({
      ...prev,
      egneScenarioer: (prev.egneScenarioer || []).filter(s => s.id !== id),
      aktivtScenario: prev.aktivtScenario === id ? null : prev.aktivtScenario,
    }));
  };

  /* ─── Robustness color ─── */
  const robustnessColor = (pct) => {
    if (pct >= 90) return { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', ring: 'ring-green-500' };
    if (pct >= 70) return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', ring: 'ring-amber-500' };
    return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', ring: 'ring-red-500' };
  };

  /* ─── Empty state ─── */
  if (startVerdi <= 0 || !simulation) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4" style={{ backgroundColor: COLORS.navy }}>
            <h2 className="text-lg font-semibold text-white">Scenarioer</h2>
          </div>
          <div className="px-6 py-12 text-center">
            <p className="text-gray-500 text-lg mb-2">
              Ingen portefølje å stressteste.
            </p>
            <p className="text-gray-400 text-sm">
              Legg inn eiendeler i steg 1 (Nåsituasjon) for å kjøre scenarioanalyser.
              Netto porteføljeverdien må være større enn null.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const {
    chartData, tableData,
    basisMedianFinal, stressMedianFinal,
    diffKr, diffPct,
    basisRobustness, stressRobustness,
    stressRunsOutYear,
  } = simulation;

  const bRob = robustnessColor(basisRobustness);
  const sRob = activeScenarioDetails ? robustnessColor(stressRobustness) : null;

  return (
    <div className="space-y-6">

      {/* ═══ ROBUSTNESS SCORE ═══ */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4" style={{ backgroundColor: COLORS.navy }}>
          <h2 className="text-lg font-semibold text-white">Robusthetsscore</h2>
        </div>
        <div className="px-6 py-8">
          <div className={`grid gap-6 ${activeScenarioDetails ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
            {/* Basis robustness */}
            <div className="flex flex-col items-center">
              <div className={`w-36 h-36 rounded-full flex items-center justify-center border-4 ${bRob.border} ${bRob.bg}`}>
                <div className="text-center">
                  <div className={`text-4xl font-bold ${bRob.text}`}>{basisRobustness}%</div>
                  <div className="text-xs text-gray-500 mt-1">sannsynlighet</div>
                </div>
              </div>
              <p className="mt-4 text-sm font-semibold text-gray-700 text-center">Basisscenario</p>
              <p className="text-xs text-gray-500 text-center mt-1">
                {basisRobustness}% sannsynlighet for positiv formue etter {horizon} år
              </p>
            </div>

            {/* Stress robustness */}
            {activeScenarioDetails && sRob && (
              <div className="flex flex-col items-center">
                <div className={`w-36 h-36 rounded-full flex items-center justify-center border-4 ${sRob.border} ${sRob.bg}`}>
                  <div className="text-center">
                    <div className={`text-4xl font-bold ${sRob.text}`}>{stressRobustness}%</div>
                    <div className="text-xs text-gray-500 mt-1">sannsynlighet</div>
                  </div>
                </div>
                <p className="mt-4 text-sm font-semibold text-gray-700 text-center">
                  {activeScenarioDetails.label}
                </p>
                <p className="text-xs text-gray-500 text-center mt-1">
                  {stressRobustness}% sannsynlighet for positiv formue etter {horizon} år
                </p>
                {stressRunsOutYear && (
                  <p className="text-xs font-semibold text-red-600 text-center mt-2">
                    Pengene tar slutt i {stressRunsOutYear} (median)
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══ PREDEFINED STRESS SCENARIOS ═══ */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4" style={{ backgroundColor: COLORS.navy }}>
          <h2 className="text-lg font-semibold text-white">Historiske krisescenarioer</h2>
        </div>
        <div className="px-6 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
            {KRISE_SCENARIOER.map(scenario => {
              const isActive = aktivtScenario === scenario.id;
              const portfolioShock = computeShockPct(scenario);
              return (
                <button
                  key={scenario.id}
                  onClick={() => handleSelectScenario(scenario.id)}
                  className={`text-left rounded-xl border-2 p-4 transition-all ${
                    isActive
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm'
                  }`}
                >
                  <div className="text-sm font-semibold text-gray-800 mb-2">{scenario.label}</div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Aksjer</span>
                      <span className={scenario.aksjer < 0 ? 'font-semibold text-red-600' : 'text-gray-600'}>
                        {scenario.aksjer}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Høyrente</span>
                      <span className={scenario.hoyrente < 0 ? 'font-semibold text-red-600' : 'text-gray-600'}>
                        {scenario.hoyrente}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Eiendom</span>
                      <span className={scenario.eiendom < 0 ? 'font-semibold text-red-600' : 'text-gray-600'}>
                        {scenario.eiendom}%
                      </span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-gray-100">
                      <span className="text-gray-500">Varighet</span>
                      <span className="text-gray-600">{scenario.varighet} år</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Din portefølje</span>
                      <span className="font-bold text-red-700">{fmtPct(portfolioShock * 100)}</span>
                    </div>
                  </div>
                  {isActive && (
                    <div className="mt-3 text-center">
                      <span className="inline-block px-2 py-0.5 rounded-full bg-blue-500 text-white text-[10px] font-semibold">
                        Valgt
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ═══ PERSONAL SCENARIOS ═══ */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 flex items-center justify-between" style={{ backgroundColor: COLORS.navy }}>
          <h2 className="text-lg font-semibold text-white">Personlige scenarioer</h2>
          <button
            onClick={() => setVisPersonligForm(!visPersonligForm)}
            className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-colors"
          >
            {visPersonligForm ? 'Avbryt' : '+ Nytt scenario'}
          </button>
        </div>
        <div className="px-6 py-6">
          {/* Form */}
          {visPersonligForm && (
            <div className="bg-gray-50 rounded-xl p-6 mb-6 border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Type scenario</label>
                  <select
                    value={nyType}
                    onChange={e => setNyType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                  >
                    {PERSONLIGE_TYPER.map(t => (
                      <option key={t.id} value={t.id}>{t.label}</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-400 mt-1">
                    {PERSONLIGE_TYPER.find(t => t.id === nyType)?.beskrivelse}
                  </p>
                </div>
                {nyType !== 'tidlig_pensjon' && (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Beløp (NOK)</label>
                      <input
                        type="number"
                        value={nyBelop}
                        onChange={e => setNyBelop(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">År</label>
                      <input
                        type="number"
                        value={nyAar}
                        min={currentYear}
                        max={currentYear + horizon}
                        onChange={e => setNyAar(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                      />
                    </div>
                  </>
                )}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Kommentar (valgfritt)</label>
                  <input
                    type="text"
                    value={nyKommentar}
                    onChange={e => setNyKommentar(e.target.value)}
                    placeholder="F.eks. salg av hytte"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleAddPersonalScenario}
                  className="px-5 py-2 rounded-lg text-white text-sm font-semibold transition-colors"
                  style={{ backgroundColor: COLORS.navy }}
                >
                  Legg til scenario
                </button>
              </div>
            </div>
          )}

          {/* List of personal scenarios */}
          {egneScenarioer.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {egneScenarioer.map(s => {
                const isActive = aktivtScenario === s.id;
                return (
                  <div
                    key={s.id}
                    className={`rounded-xl border-2 p-4 transition-all cursor-pointer ${
                      isActive
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-gray-100 bg-white hover:border-gray-200'
                    }`}
                    onClick={() => handleSelectScenario(s.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-sm font-semibold text-gray-800">{s.label}</div>
                        {s.kommentar && <div className="text-xs text-gray-500 mt-1">{s.kommentar}</div>}
                        {s.belop && s.scenarioType !== 'tidlig_pensjon' && (
                          <div className="text-xs text-gray-500 mt-1">
                            {fmtNOK(s.belop)} i {s.aar}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeletePersonalScenario(s.id); }}
                        className="text-gray-400 hover:text-red-500 text-sm ml-2"
                        title="Slett scenario"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    {isActive && (
                      <div className="mt-2 text-center">
                        <span className="inline-block px-2 py-0.5 rounded-full bg-blue-500 text-white text-[10px] font-semibold">
                          Valgt
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-4">
              Ingen personlige scenarioer lagt til ennå. Klikk «+ Nytt scenario» for å lage et.
            </p>
          )}
        </div>
      </div>

      {/* ═══ SIDE-BY-SIDE COMPARISON CHART ═══ */}
      {activeScenarioDetails && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 flex items-center justify-between" style={{ backgroundColor: COLORS.navy }}>
            <h2 className="text-lg font-semibold text-white">
              Sammenligning: Basis vs. {activeScenarioDetails.label}
            </h2>
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
                <span className="text-gray-500">Forv. avkastning:</span>{' '}
                <span className="font-semibold text-gray-800">{fmtPct(mu * 100)}</span>
              </div>
              {activeScenarioDetails.type === 'krise' && (
                <div className="bg-red-50 rounded-lg px-4 py-2">
                  <span className="text-gray-500">Krise-sjokk:</span>{' '}
                  <span className="font-semibold text-red-700">
                    {fmtPct(computeShockPct(activeScenarioDetails) * 100)} i {activeScenarioDetails.varighet} år
                  </span>
                </div>
              )}
            </div>

            {/* Chart */}
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
                  <Tooltip content={<ComparisonTooltip />} />

                  {/* Basis confidence band */}
                  <Area
                    type="monotone"
                    dataKey="basisBand"
                    stroke="none"
                    fill={COLORS.lighterBlue}
                    name="Basis 25.–75. persentil"
                    isAnimationActive={false}
                    legendType="none"
                  />

                  {/* Basis median — solid navy */}
                  <Line
                    type="monotone"
                    dataKey="basis"
                    stroke={COLORS.navy}
                    strokeWidth={2.5}
                    dot={false}
                    name="Basis (median)"
                    isAnimationActive={false}
                  />

                  {/* Stress median — dashed red */}
                  <Line
                    type="monotone"
                    dataKey="stress"
                    stroke={COLORS.red}
                    strokeWidth={2.5}
                    strokeDasharray="8 4"
                    dot={false}
                    name={activeScenarioDetails.label}
                    isAnimationActive={false}
                  />

                  {/* Zero line */}
                  <ReferenceLine y={0} stroke="#9ca3af" strokeWidth={1} />

                  {/* Crisis years marker */}
                  {activeScenarioDetails.type === 'krise' && activeScenarioDetails.varighet > 0 && (
                    <ReferenceLine
                      x={currentYear + activeScenarioDetails.varighet}
                      stroke={COLORS.gold}
                      strokeDasharray="4 3"
                      strokeWidth={1.5}
                      label={{
                        value: 'Krise slutt',
                        position: 'top',
                        fill: COLORS.gold,
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
                <div className="w-6 h-0.5 rounded" style={{ backgroundColor: COLORS.navy }} />
                <span>Basis (median)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-0.5 rounded border-dashed border-t-2" style={{ borderColor: COLORS.red }} />
                <span>{activeScenarioDetails.label} (median)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-3 rounded" style={{ backgroundColor: COLORS.lighterBlue }} />
                <span>Basis 25.–75. persentil</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ KEY METRICS ═══ */}
      {activeScenarioDetails && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4" style={{ backgroundColor: COLORS.navy }}>
            <h2 className="text-lg font-semibold text-white">Nøkkeltall — scenariosammenligning</h2>
          </div>
          <div className="px-6 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Basis final */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-xs text-gray-500 font-medium mb-1">Sluttformue (basis)</div>
                <div className="text-xl font-bold" style={{ color: COLORS.navy }}>
                  {fmtNOKShort(basisMedianFinal)}
                </div>
                <div className="text-xs text-gray-400 mt-1">Median etter {horizon} år</div>
              </div>

              {/* Stress final */}
              <div className="bg-red-50 rounded-lg p-4">
                <div className="text-xs text-gray-500 font-medium mb-1">Sluttformue (stress)</div>
                <div className="text-xl font-bold text-red-700">
                  {fmtNOKShort(stressMedianFinal)}
                </div>
                <div className="text-xs text-gray-400 mt-1">{activeScenarioDetails.label}</div>
              </div>

              {/* Difference NOK */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-xs text-gray-500 font-medium mb-1">Differanse (NOK)</div>
                <div className={`text-xl font-bold ${diffKr >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                  {diffKr >= 0 ? '+' : ''}{fmtNOKShort(diffKr)}
                </div>
                <div className="text-xs text-gray-400 mt-1">Tapt verdiskaping</div>
              </div>

              {/* Difference % */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-xs text-gray-500 font-medium mb-1">Differanse (%)</div>
                <div className={`text-xl font-bold ${diffPct >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                  {diffPct >= 0 ? '+' : ''}{fmtPct(diffPct)}
                </div>
                <div className="text-xs text-gray-400 mt-1">Relativ endring</div>
              </div>
            </div>

            {/* Runs out warning */}
            {stressRunsOutYear && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4 text-sm">
                <div className="flex items-center gap-2 text-red-700 font-semibold">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
                  </svg>
                  Pengene tar slutt i {stressRunsOutYear}
                </div>
                <p className="text-red-600 mt-1">
                  Under dette stressscenariet viser medianprognosen at porteføljen tømmes i {stressRunsOutYear},
                  {' '}{stressRunsOutYear - currentYear} år fra nå. Vurder å redusere uttaksraten eller øke bufferen.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══ ANNUAL COMPARISON TABLE ═══ */}
      {activeScenarioDetails && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4" style={{ backgroundColor: COLORS.navy }}>
            <h2 className="text-lg font-semibold text-white">Årlig sammenligning</h2>
          </div>
          <div className="px-6 py-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">År</th>
                  <th className="text-right py-3 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Basis (median)</th>
                  <th className="text-right py-3 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Stress (median)</th>
                  <th className="text-right py-3 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Differanse</th>
                  <th className="text-right py-3 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Endring %</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, i) => {
                  const diff = row.basis - row.stress;
                  const diffP = row.basis > 0 ? (diff / row.basis) * 100 : 0;
                  return (
                    <tr key={row.year} className={`border-b border-gray-50 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                      <td className="py-2.5 px-2 font-medium text-gray-800">{row.year}</td>
                      <td className="py-2.5 px-2 text-right font-semibold" style={{ color: COLORS.navy }}>
                        {fmtNOK(row.basis)}
                      </td>
                      <td className="py-2.5 px-2 text-right font-semibold text-red-700">
                        {fmtNOK(row.stress)}
                      </td>
                      <td className={`py-2.5 px-2 text-right font-semibold ${diff >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                        {diff >= 0 ? '+' : ''}{fmtNOKShort(diff)}
                      </td>
                      <td className={`py-2.5 px-2 text-right text-xs ${diffP >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {diffP >= 0 ? '+' : ''}{fmtPct(diffP)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═══ NO SCENARIO SELECTED ═══ */}
      {!activeScenarioDetails && (
        <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-12 text-center text-gray-400">
          <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
          </svg>
          <p className="text-lg font-medium mb-2">Velg et scenario for å se sammenligningen</p>
          <p className="text-sm">
            Klikk på et historisk krisescenario eller legg til et personlig scenario ovenfor
            for å se side-om-side sammenligning med basisprognosen.
          </p>
        </div>
      )}

      {/* ═══ EXPLANATION ═══ */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4" style={{ backgroundColor: COLORS.navy }}>
          <h2 className="text-lg font-semibold text-white">Om scenarioanalysen</h2>
        </div>
        <div className="px-6 py-6">
          <div className="bg-blue-50 rounded-lg p-4 text-sm text-gray-600 leading-relaxed">
            <p className="font-semibold text-gray-700 mb-1">Metode</p>
            <p>
              Scenarioanalysen bruker {nSim} Monte Carlo-simuleringer for å estimere
              porteføljens utvikling under ulike stressscenarioer. Krisescenarioene
              anvender historiske sjokk (aksjer, høyrente, eiendom) vektet etter din
              porteføljesammensetning. Robusthetsscoren viser andelen simuleringer
              som ender med positiv formue etter {horizon} år.
            </p>
            <p className="mt-2">
              Porteføljevektene brukt til stressberegning: aksjer {fmtPct(crisisWeights.aksjer * 100)},
              høyrente {fmtPct(crisisWeights.hoyrente * 100)},
              eiendom {fmtPct(crisisWeights.eiendom * 100)}.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
