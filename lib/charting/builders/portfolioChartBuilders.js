import {
  createHistorikkVsReferanserSpec,
  createMaxDrawdownSpec,
  createAnnualHistoricalReturnsSpec,
  createRegionExposureSpec,
  createSectorExposureSpec,
} from '../specs/chartSpecs.js';

function toYmLabel(dato) {
  const d = new Date(dato);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function getActiveAllocations(payload) {
  const allok = Array.isArray(payload?.pensumAllokering) ? payload.pensumAllokering : [];
  const iBruk = Array.isArray(payload?.produkterIBruk) ? payload.produkterIBruk : [];
  return allok.filter((a) => a?.vekt > 0 && iBruk.includes(a.id));
}

function buildWeightedPortfolioSeries(payload, { months = null } = {}) {
  const { produktHistorikk = {} } = payload || {};
  const aktiveAllok = getActiveAllocations(payload);
  if (aktiveAllok.length === 0) return null;

  const allDates = new Set();
  aktiveAllok.forEach((a) => {
    const hist = produktHistorikk[a.id];
    if (hist?.data) hist.data.forEach((d) => allDates.add(d.dato));
  });
  if (allDates.size === 0) return null;

  const sortedDates = [...allDates].sort();
  const cutoffIdx = months ? Math.max(0, sortedDates.length - months * 30) : 0;
  const dates = sortedDates.slice(cutoffIdx);

  const productMaps = {};
  aktiveAllok.forEach((a) => {
    const hist = produktHistorikk[a.id];
    if (!hist?.data) return;
    const map = {};
    hist.data.forEach((d) => { map[d.dato] = d.verdi; });
    productMaps[a.id] = map;
  });

  const labels = [];
  const values = [];
  let baseValues = null;

  dates.forEach((dato, idx) => {
    if (idx > 0 && idx < dates.length - 1 && idx % 22 !== 0) return;

    let weightedReturn = 0;
    let totalWeight = 0;

    aktiveAllok.forEach((a) => {
      const map = productMaps[a.id];
      if (!map) return;
      const val = map[dato];
      if (val == null) return;
      if (!baseValues) baseValues = {};
      if (baseValues[a.id] == null) baseValues[a.id] = val > 0 ? val : null;
      if (!baseValues[a.id]) return;

      const ret = val / baseValues[a.id];
      if (!Number.isFinite(ret)) return;

      weightedReturn += ret * a.vekt;
      totalWeight += a.vekt;
    });

    if (totalWeight <= 0) return;
    const indexedValue = (weightedReturn / totalWeight) * 100;
    if (!Number.isFinite(indexedValue)) return;

    labels.push(toYmLabel(dato));
    values.push(indexedValue);
  });

  if (labels.length < 3 || values.length < 3) return null;
  return { labels, values };
}

export function buildHistorikkVsReferanserChartSpec(payload) {
  const series = buildWeightedPortfolioSeries(payload);
  if (!series) return null;

  return createHistorikkVsReferanserSpec({
    title: 'Historisk utvikling',
    subtitle: 'Porteføljens utvikling sammenlignet med relevante referanser',
    series: [{
      name: 'Din portefølje',
      labels: series.labels,
      values: series.values,
      color: '0D2841',
    }],
  });
}

export function buildMaxDrawdownChartSpec(payload) {
  const weighted = buildWeightedPortfolioSeries(payload, { months: 60 });
  if (!weighted || weighted.values.length < 3) return null;

  let peak = weighted.values[0];
  const ddValues = weighted.values.map((value) => {
    if (value > peak) peak = value;
    return ((value - peak) / peak) * 100;
  }).filter(Number.isFinite);

  if (ddValues.length !== weighted.labels.length) return null;

  return createMaxDrawdownSpec({
    title: 'Risikobilde og nedsidebeskyttelse',
    subtitle: 'Max drawdown, volatilitet og nøkkelrisikotall',
    series: [{
      name: 'Drawdown',
      labels: weighted.labels,
      values: ddValues,
      color: 'C4967E',
    }],
  });
}

export function buildAnnualHistoricalReturnsChartSpec(payload) {
  const hist = payload?.historiskPortefolje || {};
  const years = ['aar2025', 'aar2024', 'aar2023', 'aar2022'];
  const categories = ['2025', '2024', '2023', '2022'];
  const values = years.map((k) => Number(hist[k])).filter(Number.isFinite);
  if (values.length < 2) return null;

  return createAnnualHistoricalReturnsSpec({
    title: 'Årlig historisk avkastning',
    subtitle: 'Kalenderårsavkastning for porteføljen',
    categories: categories.slice(0, values.length),
    values,
    color: '6B9DB8',
  });
}

export function buildRegionExposureChartSpec(payload) {
  const regioner = (payload?.eksponering?.regioner || [])
    .filter((r) => Number(r?.vekt) > 0)
    .slice(0, 10);
  if (regioner.length === 0) return null;

  return createRegionExposureSpec({
    title: 'Regioneksponering',
    subtitle: 'Geografisk fordeling av porteføljen',
    categories: regioner.map((r) => r.navn),
    values: regioner.map((r) => Number(r.vekt)),
    color: '6B9DB8',
  });
}

export function buildSectorExposureChartSpec(payload) {
  const sektorer = (payload?.eksponering?.sektorer || [])
    .filter((s) => Number(s?.vekt) > 0)
    .slice(0, 10);
  if (sektorer.length === 0) return null;

  return createSectorExposureSpec({
    title: 'Sektoreksponering',
    subtitle: 'Sektorfordeling i porteføljen',
    categories: sektorer.map((s) => s.navn),
    values: sektorer.map((s) => Number(s.vekt)),
    color: 'C4967E',
  });
}
