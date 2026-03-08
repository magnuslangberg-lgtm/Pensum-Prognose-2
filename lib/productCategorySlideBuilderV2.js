import { inferProductCategoryTemplate } from '../data/productCategoryTemplatesV2.js';

function num(v, fb = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fb;
}

function safeArray(arr) {
  return Array.isArray(arr) ? arr : [];
}

function pickTop(rows = [], count = 5) {
  return safeArray(rows)
    .map((r) => ({ navn: r?.navn || 'Ukjent', vekt: num(r?.vekt) }))
    .filter((r) => r.vekt > 0)
    .sort((a, b) => b.vekt - a.vekt)
    .slice(0, count);
}

function pct(v) {
  return Number.isFinite(Number(v)) ? `${Number(v).toFixed(1)}%` : '—';
}

function buildKpiCards(reportNode = {}, category = {}) {
  const labels = {
    forventetAvkastning: reportNode.primaryKpiLabel || 'Forv. avkastning',
    forventetYield: 'Forv. yield',
    benchmark: 'Benchmark',
    likviditet: 'Likviditet',
    portfolioWeight: 'Porteføljevekt',
    styleBias: 'Stil / bias',
  };
  const values = {
    forventetAvkastning: pct(reportNode.forventetAvkastning),
    forventetYield: pct(reportNode.forventetYield),
    benchmark: reportNode.benchmark || '—',
    likviditet: reportNode.likviditet || '—',
    portfolioWeight: pct(reportNode.portfolioWeight),
    styleBias: reportNode.styleBias || '—',
  };

  return safeArray(category.kpis).map((key) => ({
    key,
    label: labels[key] || key,
    value: values[key] || '—'
  })).filter((item) => item.value && item.value !== '—');
}

export function buildProductSlideBlueprintV2(reportNode = {}) {
  const category = inferProductCategoryTemplate(reportNode);
  const regions = pickTop(reportNode.topRegions, 5);
  const sectors = pickTop(reportNode.topSectors, 5);
  const holdings = pickTop(reportNode.topHoldings, 8);

  const visuals = {
    historikk: true,
    regioner: regions.length > 0,
    sektorer: sectors.length > 0,
    holdings: holdings.length > 0,
  };

  const chartPlan = safeArray(category.preferredCharts).filter((chart) => visuals[chart]);
  const bullets = [
    reportNode.pitchKort,
    reportNode.investeringscase,
    reportNode.whyIncluded,
    reportNode.keyRisks ? `Viktig risiko: ${reportNode.keyRisks}` : '',
  ].filter(Boolean);

  return {
    categoryId: category.id,
    categoryLabel: category.label,
    chartPlan: chartPlan.length ? chartPlan : safeArray(reportNode.chartPlan),
    kpiCards: buildKpiCards(reportNode, category),
    narrativeFocus: safeArray(category.narrativeFocus),
    rows: {
      regioner: regions,
      sektorer: sectors,
      holdings,
    },
    bullets,
    slides: safeArray(category.defaultSlides).map((id, idx) => ({
      id: `${reportNode.id}-${id}-${idx + 1}`,
      templateId: id,
      title: idx === 0
        ? (reportNode.slideTitleOverride || `${reportNode.navn} i porteføljen`)
        : (reportNode.produktUndertittel || `${reportNode.navn} – eksponering og nøkkeltall`),
      subtitle: reportNode.produktUndertittel || category.label,
      chartPlan: idx === 0 ? chartPlan.slice(0, 2) : chartPlan.slice(0, 3),
      kpiCards: buildKpiCards(reportNode, category),
      bullets,
    }))
  };
}
