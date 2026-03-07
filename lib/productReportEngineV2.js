import { PRODUCT_CONTENT_LIBRARY_V2 } from '../data/productContentLibraryV2.js';

function num(v, fb = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fb;
}

function normalizeWeight(weight) {
  const w = num(weight);
  if (w > 0 && w <= 1.0001) return w * 100;
  return w;
}

function sortRows(rows = [], count = 5) {
  return (Array.isArray(rows) ? rows : [])
    .map((r) => ({ navn: r?.navn || 'Ukjent', vekt: num(r?.vekt) }))
    .filter((r) => r.vekt > 0)
    .sort((a, b) => b.vekt - a.vekt)
    .slice(0, count);
}

function inferChartPlan(chartPreference, exposureData, returns) {
  const plan = [];
  const hasRegions = Array.isArray(exposureData?.regioner) && exposureData.regioner.length > 0;
  const hasSectors = Array.isArray(exposureData?.sektorer) && exposureData.sektorer.length > 0;
  const hasHoldings = Array.isArray(exposureData?.underliggende) && exposureData.underliggende.length > 0;
  const hasReturns = returns && Object.values(returns).some((v) => Number.isFinite(Number(v)));

  if (chartPreference && chartPreference !== 'auto') plan.push(chartPreference);
  if (!plan.includes('regioner') && hasRegions) plan.push('regioner');
  if (!plan.includes('sektorer') && hasSectors) plan.push('sektorer');
  if (!plan.includes('holdings') && hasHoldings) plan.push('holdings');
  if (!plan.includes('historikk') && hasReturns) plan.push('historikk');

  return plan.slice(0, 3);
}

export function buildProductReportNode({ product = {}, override = {}, exposureData = null, weight = 0 } = {}) {
  const merged = { ...(PRODUCT_CONTENT_LIBRARY_V2[product.id] || {}), ...product, ...override };
  const topRegions = sortRows(exposureData?.regioner, 4);
  const topSectors = sortRows(exposureData?.sektorer, 4);
  const topHoldings = sortRows(exposureData?.underliggende, 6);
  const normalizedWeight = normalizeWeight(weight);

  return {
    id: merged.id,
    navn: merged.navn,
    portfolioWeight: normalizedWeight,
    rolle: merged.rolle || '',
    benchmark: merged.benchmark || '',
    risikonivaa: merged.risikonivaa || '',
    likviditet: merged.likviditet || '',
    forventetAvkastning: merged.forventetAvkastning ?? null,
    forventetYield: merged.forventetYield ?? null,
    pitchKort: merged.pitchKort || merged.caseKort || '',
    produktUndertittel: merged.produktUndertittel || '',
    investeringscase: merged.investeringscase || '',
    whyIncluded: merged.whyIncluded || '',
    keyRisks: merged.keyRisks || '',
    chartPreference: merged.chartPreference || 'auto',
    chartPlan: inferChartPlan(merged.chartPreference, exposureData, product.returns || product.marketData?.returns),
    slideCount: Math.max(1, Math.min(3, Number(merged.slideCount) || 2)),
    slideTitleOverride: merged.slideTitleOverride || '',
    styleBias: merged.styleBias || '',
    morningstarMapping: merged.morningstarMapping || '',
    primaryKpiLabel: merged.primaryKpiLabel || 'Forv. avkastning',
    secondaryKpiLabel: merged.secondaryKpiLabel || 'Likviditet',
    topRegions,
    topSectors,
    topHoldings,
  };
}
