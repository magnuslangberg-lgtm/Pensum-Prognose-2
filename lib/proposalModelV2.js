import { PENSUM_PRODUCT_MASTER_V2 } from '../data/pensumProductMasterV2.js';
import { defaultProduktEksponering } from '../data/pensumDefaults.js';
import { REPORT_BLUEPRINT_V2, PRODUCT_SLIDE_TEMPLATES_V2 } from '../data/reportBlueprintV2.js';
import { PRODUCT_SLIDE_REGISTRY_V2 } from '../data/productSlideRegistryV2.js';
import { buildPortfolioNarrativeV2, buildProductNarrativeV2 } from './proposalNarrativeV2.js';

function num(v, fb = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fb;
}

function formatPercentOne(v) {
  return Number.isFinite(v) ? `${v.toFixed(1)}%` : '—';
}

export function buildProposalModelV2({ formData = {}, monthlyDataset = null } = {}) {
  const selectedIds = Array.isArray(formData.produkterIBruk) ? formData.produkterIBruk : [];
  const allocations = Array.isArray(formData.pensumAllokering) ? formData.pensumAllokering : [];
  const portfolioWeightMap = new Map(allocations.map((item) => [item.id, num(item.vekt)]));
  const selectedProducts = selectedIds
    .map((id) => ({
      ...(PENSUM_PRODUCT_MASTER_V2[id] || { id, navn: id, kortnavn: id, standardSlides: ['product-summary'] }),
      portfolioWeight: portfolioWeightMap.get(id) ?? 0,
      marketData: monthlyDataset?.products?.find((p) => p.productId === id) || null,
      exposureData: defaultProduktEksponering[id] || null,
      slideRegistry: PRODUCT_SLIDE_REGISTRY_V2[id] || null
    }))
    .filter((p) => p.portfolioWeight > 0 || selectedIds.includes(p.id));

  const expectedReturn = num(formData.vektetAvkastning, 7.5);
  const totalCapital = num(formData.totalKapital);
  const riskProfile = formData.risikoProfil || 'Moderat';

  const summaryBullets = [];
  const topProduct = [...selectedProducts].sort((a, b) => b.portfolioWeight - a.portfolioWeight)[0];
  if (topProduct) {
    summaryBullets.push(`${topProduct.kortnavn} er største byggestein i porteføljen med ${formatPercentOne(topProduct.portfolioWeight)} vekt og fungerer som ${topProduct.rolle?.toLowerCase() || 'kjerneeksponering'}.`);
  }
  if (selectedProducts.some((p) => p.aktivaklasse?.toLowerCase().includes('renter') || p.aktivaklasse?.toLowerCase().includes('kreditt'))) {
    summaryBullets.push('Rentedelen skal bidra med løpende kontantstrøm, stabilitet og bedre robusthet i perioder med markedsuro.');
  }
  if (selectedProducts.some((p) => p.aktivaklasse?.toLowerCase().includes('globale aksjer'))) {
    summaryBullets.push('Aksjedelen gir global eksponering og bred diversifisering på tvers av regioner, sektorer og forvalterstiler.');
  }

  const productModules = selectedProducts.flatMap((product) => {
    const templates = PRODUCT_SLIDE_TEMPLATES_V2[product.slideTemplate] || product.standardSlides || ['product-summary'];
    return templates.map((templateId) => ({
      productId: product.id,
      templateId,
      title: templateId === 'product-summary' ? `${product.kortnavn} – rolle i porteføljen` : `${product.kortnavn} – eksponering og nøkkeltall`,
      product,
      narrative: buildProductNarrativeV2(product)
    }));
  });

  const portfolioNarrative = buildPortfolioNarrativeV2({
    meta: {
      risikoProfil: riskProfile,
      totalKapital: totalCapital,
      forventetAvkastning: expectedReturn
    },
    portfolio: { selectedProducts }
  });

  return {
    meta: {
      reportDate: monthlyDataset?.reportDate || null,
      kundeNavn: formData.kundeNavn || 'Investor',
      risikoProfil: riskProfile,
      totalKapital: totalCapital,
      forventetAvkastning: expectedReturn
    },
    blueprint: REPORT_BLUEPRINT_V2,
    narrative: portfolioNarrative,
    portfolio: {
      summaryBullets,
      allocations: (formData.allokering || []).map((item) => ({ navn: item.navn, vekt: num(item.vekt) })),
      selectedProducts: selectedProducts.map((p) => ({
        id: p.id,
        navn: p.navn,
        kortnavn: p.kortnavn,
        rolle: p.rolle,
        portfolioWeight: p.portfolioWeight,
        aktivaklasse: p.aktivaklasse,
        benchmark: p.benchmark,
        risikonivaa: p.risikonivaa,
        likviditet: p.likviditet,
        caseKort: p.caseKort,
        narrativeTags: p.narrativeTags,
        returns: p.marketData?.returns || null,
        latest: p.marketData?.latest || null,
        exposureData: p.exposureData || null,
        slideRegistry: p.slideRegistry || null,
        narrative: buildProductNarrativeV2(p)
      })),
      productModules
    }
  };
}
