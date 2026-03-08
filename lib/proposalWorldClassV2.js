import { buildProductReportNode } from './productReportEngineV2.js';

function safeArray(arr) {
  return Array.isArray(arr) ? arr : [];
}

function nonZeroProducts(products = []) {
  return safeArray(products).filter((p) => Number(p?.portfolioWeight || p?.reportNode?.portfolioWeight || 0) > 0.001);
}

export function enrichProposalModelForWorldClassSlides(model = {}) {
  const selectedProducts = nonZeroProducts(model.portfolio?.selectedProducts || model.selectedProducts || []);
  const productSlideBlueprints = selectedProducts.map((product) => ({
    productId: product.id,
    navn: product.navn || product.kortnavn || product.id,
    weight: product.portfolioWeight || product.reportNode?.portfolioWeight || 0,
    blueprint: product.reportNode?.slideBlueprint || buildProductReportNode({
      product,
      weight: product.portfolioWeight || 0,
      exposureData: product.exposureData || null,
    }).slideBlueprint
  }));

  return {
    ...model,
    worldClassSlides: {
      plannedProductSlides: productSlideBlueprints.flatMap((p) => p.blueprint?.slides || []),
      plannedProductCount: productSlideBlueprints.length,
      productSlideBlueprints
    }
  };
}
