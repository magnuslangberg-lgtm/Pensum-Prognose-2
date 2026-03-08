import { buildProductNodes } from './productReportEngineV2';

function normalizeWeight(value) {
  const n = Number(value || 0);
  if (!Number.isFinite(n) || n <= 0) return 0;
  return n > 1 ? n / 100 : n;
}

function normalizePortfolioWeights(weights = {}) {
  const entries = Object.entries(weights || {}).map(([k, v]) => [k, normalizeWeight(v)]);
  const filtered = entries.filter(([, v]) => v > 0);
  const sum = filtered.reduce((acc, [, v]) => acc + v, 0);
  if (!sum) return {};
  return Object.fromEntries(filtered.map(([k, v]) => [k, v / sum]));
}

function buildExecutiveSummary(productNodes = []) {
  if (!productNodes.length) return [];
  const top = productNodes.slice(0, 3);
  return [
    `Porteføljen er bygget rundt ${top.map((p) => p.name).join(', ')}.`,
    'Sammensetningen er ment å kombinere bred diversifisering med tydelige Pensum-byggesteiner.',
    'Produkter med høyest vekt får egne produktslides med rolle, nøkkeltall og forklaring.',
  ];
}

export function buildProposalWorldClassV2({ dataset, portfolioWeights = {}, customer = {} }) {
  const normalizedWeights = normalizePortfolioWeights(portfolioWeights);
  const productNodes = buildProductNodes(dataset, normalizedWeights);
  const totalWeight = productNodes.reduce((a, p) => a + p.weight, 0);
  return {
    meta: {
      reportDate: dataset?.reportDate || null,
      customerName: customer.customerName || customer.kundeNavn || 'Kunde',
      riskProfile: customer.riskProfile || customer.risikoprofil || 'Balansert',
      investmentAmount: customer.investmentAmount || customer.investerbartBelop || null,
    },
    normalizedWeights,
    productNodes,
    overview: {
      totalProducts: productNodes.length,
      totalWeight,
      plannedProductSlides: productNodes.reduce((acc, p) => acc + (p.blueprint?.slideCount || 0), 0),
    },
    executiveSummary: buildExecutiveSummary(productNodes),
    slidePlan: [
      'Forside',
      'Viktig informasjon',
      'Executive summary',
      'Porteføljebyggesteiner',
      ...productNodes.flatMap((p) => Array.from({ length: p.blueprint.slideCount }, (_, i) => `${p.name} – slide ${i + 1}`)),
      'Oppsummering og neste steg',
    ],
  };
}

export default buildProposalWorldClassV2;
