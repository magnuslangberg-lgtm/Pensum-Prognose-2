import { getProductContent } from './productContentLibraryV2';
import { buildProductSlideBlueprint } from './productCategorySlideBuilderV2';

function pctFromSeries(points = []) {
  if (!points.length) return null;
  const first = points[0]?.value;
  const last = points[points.length - 1]?.value;
  if (!Number.isFinite(first) || !Number.isFinite(last) || !first) return null;
  return last / first - 1;
}

export function buildProductNode(product = {}, weight = 0) {
  const content = getProductContent(product.name || 'Produkt');
  const merged = { ...product, ...content, weight };
  const returnSinceStart = pctFromSeries(product.points || []);
  const blueprint = buildProductSlideBlueprint(merged);
  return {
    key: merged.key,
    name: merged.name,
    weight,
    benchmark: merged.benchmark,
    roleInPortfolio: merged.roleInPortfolio,
    pitchShort: merged.pitchShort,
    investmentCase: merged.investmentCase,
    slideTitle: merged.slideTitle,
    slideSubtitle: merged.slideSubtitle,
    categoryKey: merged.categoryKey,
    points: product.points || [],
    latestValue: product.latestValue ?? null,
    returnSinceStart,
    blueprint,
    topMetrics: [
      { label: 'Porteføljevekt', value: `${(weight * 100).toFixed(1)}%` },
      { label: 'Benchmark', value: merged.benchmark || '–' },
      { label: 'Avkastning siden start', value: Number.isFinite(returnSinceStart) ? `${(returnSinceStart * 100).toFixed(1)}%` : '–' },
    ],
  };
}

export function buildProductNodes(dataset = { products: [] }, portfolioWeights = {}) {
  const mapped = [];
  for (const product of dataset.products || []) {
    const weight = Number(portfolioWeights?.[product.name] ?? 0);
    if (!(weight > 0)) continue;
    mapped.push(buildProductNode(product, weight));
  }
  return mapped.sort((a, b) => b.weight - a.weight);
}
