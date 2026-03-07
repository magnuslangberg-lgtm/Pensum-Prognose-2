import { getProductContentPreset } from '../data/productContentLibraryV2';
import { PRODUCT_ADMIN_SCHEMA_V2, getDefaultAdminModel } from '../data/productAdminSchemaV2';

function cleanText(value) {
  return typeof value === 'string' ? value.trim() : value;
}

function pct(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return null;
  return num > 1 ? num : num * 100;
}

function scoreWeight(weight) {
  const w = pct(weight) || 0;
  if (w >= 35) return 'high';
  if (w >= 15) return 'medium';
  return 'low';
}

export function buildProductAdminModel(product = {}) {
  return getDefaultAdminModel(product);
}

export function validateProductAdminModel(model = {}) {
  const errors = [];
  PRODUCT_ADMIN_SCHEMA_V2.sections.forEach((section) => {
    section.fields.forEach((field) => {
      if (field.required && !cleanText(model[field.key])) {
        errors.push({ field: field.key, message: `${field.label} mangler` });
      }
    });
  });
  return {
    valid: errors.length === 0,
    errors
  };
}

export function mergeProductReportData({ product = {}, adminOverride = {}, exposure = {}, monthly = {}, allocationWeight = 0 }) {
  const preset = getProductContentPreset(product.slug || adminOverride.slug);
  const merged = {
    ...product,
    ...adminOverride,
    exposure,
    monthly,
    allocationWeight,
    effectiveWeightPct: pct(allocationWeight),
    chartPriority: adminOverride.preferredCharts?.length ? adminOverride.preferredCharts : preset.chartPriority,
    kpiFocus: adminOverride.primaryKpis?.length ? adminOverride.primaryKpis : preset.kpiFocus,
    slideIntent: adminOverride.slideIntent || preset.slideIntent,
    narrativeRules: adminOverride.narrativeRules?.length ? adminOverride.narrativeRules : preset.narrativeRules,
    weightBand: scoreWeight(allocationWeight)
  };

  merged.reportNarrative = buildNarrative(merged);
  merged.kpiCards = buildKpiCards(merged);
  merged.slidePlan = buildSlidePlan(merged);
  return merged;
}

export function buildNarrative(product = {}) {
  const lines = [];
  if (product.roleLabel || product.roleSummary) {
    lines.push(`${product.name || 'Produktet'} brukes som ${cleanText(product.roleLabel || 'del av porteføljen')}. ${cleanText(product.roleSummary || '')}`.trim());
  }
  if (product.whyIncluded) lines.push(cleanText(product.whyIncluded));
  if (product.investmentCase) lines.push(cleanText(product.investmentCase));
  if (!lines.length && Array.isArray(product.narrativeRules)) {
    lines.push(...product.narrativeRules.slice(0, 2));
  }
  return lines.filter(Boolean);
}

export function buildKpiCards(product = {}) {
  const cards = [];
  const weightPct = pct(product.allocationWeight);
  if (weightPct != null) cards.push({ label: 'Vekt i porteføljen', value: `${weightPct.toFixed(1)}%` });
  if (product.expectedReturn != null) cards.push({ label: 'Forventet avkastning', value: `${Number(product.expectedReturn).toFixed(1)}%` });
  if (product.expectedYield != null) cards.push({ label: 'Forventet yield', value: `${Number(product.expectedYield).toFixed(1)}%` });
  if (product.riskLevel) cards.push({ label: 'Risikonivå', value: product.riskLevel });
  if (product.liquidityProfile) cards.push({ label: 'Likviditet', value: product.liquidityProfile });
  if (product.benchmark) cards.push({ label: 'Benchmark', value: product.benchmark });
  return cards;
}

export function buildSlidePlan(product = {}) {
  const minSlides = Number(product.minSlides ?? 1);
  const maxSlides = Number(product.maxSlides ?? 2);
  const base = [
    {
      key: 'overview',
      title: product.name,
      intent: 'Produktoversikt',
      charts: [],
      contentBlocks: ['pitch', 'role', 'kpis']
    }
  ];

  const chartSlides = (product.chartPriority || []).slice(0, Math.max(0, maxSlides - 1)).map((chartKey, idx) => ({
    key: `chart_${chartKey}_${idx + 1}`,
    title: chartTitle(chartKey),
    intent: `Vis ${chartKey}`,
    charts: [chartKey],
    contentBlocks: ['narrative', 'dataNotes']
  }));

  const slides = [...base, ...chartSlides].slice(0, maxSlides);
  while (slides.length < minSlides) {
    slides.push({
      key: `support_${slides.length + 1}`,
      title: 'Supplerende innsikt',
      intent: 'Støtteslide',
      charts: [],
      contentBlocks: ['narrative', 'risks']
    });
  }
  return slides;
}

function chartTitle(chartKey) {
  switch (chartKey) {
    case 'historikk': return 'Historisk utvikling';
    case 'region': return 'Regional eksponering';
    case 'sektor': return 'Sektoreksponering';
    case 'stil': return 'Stilfaktorer';
    case 'topHoldings': return 'Største underliggende posisjoner';
    case 'yield': return 'Yield og kontantstrøm';
    case 'kredittkvalitet': return 'Kredittkvalitet';
    default: return 'Produktinnsikt';
  }
}
