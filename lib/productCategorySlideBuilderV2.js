import { getCategoryTemplate } from './productCategoryTemplatesV2';

export function buildProductSlideBlueprint(product = {}) {
  const template = getCategoryTemplate(product.categoryKey);
  const safeName = product.name || 'Produkt';
  const weightPct = Number.isFinite(product.weight) ? product.weight * 100 : 0;
  return {
    productKey: product.key,
    title: product.slideTitle || safeName,
    subtitle: product.slideSubtitle || `${safeName} – rolle i porteføljen`,
    slideCount: product.slideCountOverride || template.slideCount,
    preferredCharts: product.preferredCharts?.length ? product.preferredCharts : template.preferredCharts,
    kpis: template.primaryKpis,
    narrativeFocus: template.narrativeFocus,
    teaser: `${safeName} utgjør ${weightPct.toFixed(1)}% av den illustrerte porteføljen.`,
  };
}
