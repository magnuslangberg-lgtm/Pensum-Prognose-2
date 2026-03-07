import { PENSUM_PRODUCT_MASTER_V2 } from '../data/pensumProductMasterV2.js';
import { defaultProduktEksponering } from '../data/pensumDefaults.js';
import { REPORT_BLUEPRINT_V2, PRODUCT_SLIDE_TEMPLATES_V2 } from '../data/reportBlueprintV2.js';
import { PRODUCT_SLIDE_REGISTRY_V2 } from '../data/productSlideRegistryV2.js';
import { buildPortfolioNarrativeV2, buildProductNarrativeV2 } from './proposalNarrativeV2.js';
import { PRODUCT_CONTENT_LIBRARY_V2 } from '../data/productContentLibraryV2.js';
import { buildProductReportNode } from './productReportEngineV2.js';

function num(v, fb = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fb;
}

function normalizeWeight(weight, sourceMax = null) {
  const w = num(weight);
  if (sourceMax !== null && sourceMax <= 1.0001) return w * 100;
  if (w > 0 && w <= 1.0001) return w * 100;
  return w;
}

function formatPercentOne(v) {
  return Number.isFinite(v) ? `${v.toFixed(1)}%` : '—';
}

export function buildProposalModelV2({ formData = {}, monthlyDataset = null } = {}) {
  const selectedIds = Array.isArray(formData.produkterIBruk) ? formData.produkterIBruk : [];
  const allocationsInput = Array.isArray(formData.allokering) ? formData.allokering : [];
  const allocationsRaw = Array.isArray(formData.pensumAllokering) ? formData.pensumAllokering : [];
  const productOverrides = formData.productReportOverrides || {};
  const rawMaxWeight = allocationsRaw.length ? Math.max(...allocationsRaw.map((item) => num(item.vekt))) : null;
  const portfolioWeightMap = new Map(allocationsRaw.map((item) => [item.id, normalizeWeight(item.vekt, rawMaxWeight)]));

  const selectedProducts = selectedIds
    .map((id) => {
      const baseProduct = {
        ...(PENSUM_PRODUCT_MASTER_V2[id] || { id, navn: id, kortnavn: id, standardSlides: ['product-summary'] }),
        ...(PRODUCT_CONTENT_LIBRARY_V2[id] || {}),
        ...(productOverrides[id] || {}),
        portfolioWeight: portfolioWeightMap.get(id) ?? 0,
        marketData: monthlyDataset?.products?.find((p) => p.productId === id) || null,
        exposureData: defaultProduktEksponering[id] || null,
        slideRegistry: PRODUCT_SLIDE_REGISTRY_V2[id] || null
      };
      return {
        ...baseProduct,
        reportNode: buildProductReportNode({
          product: baseProduct,
          override: productOverrides[id] || {},
          exposureData: baseProduct.exposureData,
          weight: baseProduct.portfolioWeight,
        })
      };
    })
    .filter((p) => p.portfolioWeight > 0.001 || selectedIds.includes(p.id))
    .sort((a, b) => b.portfolioWeight - a.portfolioWeight);

  const expectedReturn = num(formData.vektetAvkastning, 7.5);
  const totalCapital = num(formData.totalKapital);
  const riskProfile = formData.risikoProfil || 'Moderat';
  const assetClassMax = allocationsInput.length ? Math.max(...allocationsInput.map((item) => num(item.andel ?? item.vekt))) : null;
  const allocations = allocationsInput
    .map((item) => ({ navn: item.navn, vekt: normalizeWeight(item.andel ?? item.vekt, assetClassMax) }))
    .filter((item) => item.vekt > 0);

  const summaryBullets = [];
  const topProduct = selectedProducts[0];
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

  const selectedForMainDeck = selectedProducts.slice(0, 5);
  const appendixProducts = selectedProducts.slice(5);

  const slidePlan = [
    { slideNo: 1, type: 'cover', title: 'Illustrativ investeringsskisse' },
    { slideNo: 2, type: 'information', title: 'Viktig informasjon' },
    { slideNo: 3, type: 'summary', title: 'Executive summary' },
    { slideNo: 4, type: 'assumptions', title: 'Overordnede forutsetninger' },
    { slideNo: 5, type: 'portfolio-intro', title: 'Eksempel på illustrativ porteføljesammensetning' },
    { slideNo: 6, type: 'asset-allocation', title: 'Anbefalt porteføljesammensetning' },
    { slideNo: 7, type: 'solution-grid', title: 'Pensum-løsningene i porteføljen' },
    { slideNo: 8, type: 'portfolio-rationale', title: 'Hvorfor denne sammensetningen' },
    ...selectedForMainDeck.map((product, idx) => ({
      slideNo: 9 + idx,
      type: 'product',
      title: product.reportNode?.slideTitleOverride || `${product.kortnavn || product.navn} i porteføljen`,
      productId: product.id,
      chartPlan: product.reportNode?.chartPlan || [],
    }))
  ];

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
      allocations,
      aggregateExposure: {
        sektorer: Array.isArray(formData?.eksponering?.sektorer) ? formData.eksponering.sektorer : [],
        regioner: Array.isArray(formData?.eksponering?.regioner) ? formData.eksponering.regioner : []
      },
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
        narrative: buildProductNarrativeV2(p),
        reportNode: p.reportNode
      })),
      selectedForMainDeck: selectedForMainDeck.map((p) => ({
        id: p.id,
        navn: p.navn,
        kortnavn: p.kortnavn,
        portfolioWeight: p.portfolioWeight,
        reportNode: p.reportNode
      })),
      appendixProducts: appendixProducts.map((p) => ({
        id: p.id,
        navn: p.navn,
        kortnavn: p.kortnavn,
        portfolioWeight: p.portfolioWeight
      })),
      productModules,
      slidePlan
    }
  };
}
