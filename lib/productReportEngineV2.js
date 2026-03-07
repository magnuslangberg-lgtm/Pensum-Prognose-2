import { PRODUCT_CONTENT_LIBRARY_V2 } from '../data/productContentLibraryV2.js';

export function buildProductReportNode({ product = {}, override = {}, exposureData = null, weight = 0 } = {}) {
  const merged = { ...(PRODUCT_CONTENT_LIBRARY_V2[product.id] || {}), ...product, ...override };
  const topRegions = Array.isArray(exposureData?.regioner) ? exposureData.regioner.slice(0, 3) : [];
  const topSectors = Array.isArray(exposureData?.sektorer) ? exposureData.sektorer.slice(0, 3) : [];
  const topHoldings = Array.isArray(exposureData?.underliggende) ? exposureData.underliggende.slice(0, 5) : [];
  return {
    id: merged.id,
    navn: merged.navn,
    portfolioWeight: Number(weight) || 0,
    rolle: merged.rolle || '',
    benchmark: merged.benchmark || '',
    risikonivaa: merged.risikonivaa || '',
    likviditet: merged.likviditet || '',
    forventetAvkastning: merged.forventetAvkastning ?? null,
    forventetYield: merged.forventetYield ?? null,
    pitchKort: merged.pitchKort || merged.caseKort || '',
    investeringscase: merged.investeringscase || '',
    whyIncluded: merged.whyIncluded || '',
    keyRisks: merged.keyRisks || '',
    chartPreference: merged.chartPreference || 'auto',
    slideCount: Number(merged.slideCount) || 2,
    topRegions,
    topSectors,
    topHoldings,
  };
}
