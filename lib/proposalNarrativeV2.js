import { PRODUCT_SLIDE_REGISTRY_V2 } from '../data/productSlideRegistryV2.js';

function pct(v) {
  return Number.isFinite(Number(v)) ? `${Number(v).toFixed(1)}%` : '—';
}

function firstNonEmpty(arr) {
  return (Array.isArray(arr) ? arr : []).find(Boolean) || '';
}

function exposureLead(product) {
  const exposure = product?.exposureData || {};
  const topRegion = firstNonEmpty(exposure.regioner)?.navn;
  const topSector = firstNonEmpty(exposure.sektorer)?.navn;
  const topHolding = firstNonEmpty(exposure.underliggende)?.navn;
  const bits = [];
  if (topRegion) bits.push(`størst regional eksponering mot ${topRegion}`);
  if (topSector) bits.push(`tydelig innslag av ${topSector}`);
  if (topHolding) bits.push(`med ${topHolding} blant de største underliggende posisjonene`);
  return bits.length ? bits.join(', ') : 'bred og diversifisert underliggende eksponering';
}

export function buildPortfolioNarrativeV2(proposalModel) {
  const products = Array.isArray(proposalModel?.portfolio?.selectedProducts)
    ? proposalModel.portfolio.selectedProducts
    : [];
  const meta = proposalModel?.meta || {};
  const sorted = [...products].sort((a, b) => Number(b.portfolioWeight || 0) - Number(a.portfolioWeight || 0));
  const lead = sorted[0];
  const hasRates = products.some((p) => /renter|kreditt/i.test(p.aktivaklasse || ''));
  const hasThematic = products.some((p) => /tema|sektor/i.test(p.rolle || '') || /tematisk|sektor/i.test(p.aktivaklasse || ''));

  const executiveSummary = [
    `Forslaget er bygget for en ${String(meta.risikoProfil || 'moderat').toLowerCase()} investor med utgangspunkt i ${products.length} utvalgte Pensum-løsninger.`,
    lead ? `${lead.kortnavn || lead.navn} utgjør porteføljens største byggestein med ${pct(lead.portfolioWeight)} og fungerer som ${String(lead.rolle || 'kjerneeksponering').toLowerCase()}.` : '',
    hasRates ? 'Rentedelen er inkludert for å gi løpende kontantstrøm, stabilitet og bedre robusthet i perioder med økt markedsuro.' : '',
    hasThematic ? 'Tematiske eller sektorielle satellitter brukes selektivt for å øke avkastningspotensialet og gi mer spisset eksponering der det vurderes som attraktivt.' : ''
  ].filter(Boolean);

  return {
    executiveSummary,
    implementationText: [
      'Porteføljen kan implementeres trinnvis dersom kunden ønsker å fase inn risiko over tid eller ta hensyn til eksisterende plasseringer og likviditetsbehov.',
      'Pensum følger porteføljen løpende og vurderer ved behov rebalansering, justering av risikonivå og oppdatering av produktmiks i lys av markedsutvikling og kundens situasjon.'
    ],
    whyThisMix: [
      'Porteføljen er bygget med tydelig rollefordeling mellom kjerneeksponering, stabiliserende elementer og mer spissede satellitter.',
      'Kombinasjonen av flere Pensum-løsninger skal gi bedre spredning på aktivaklasse, geografi, sektor og underliggende drivere enn én enkeltstående plassering.',
      meta.forventetAvkastning ? `Samlet er porteføljen kalibrert mot en forventet årlig avkastning på om lag ${pct(meta.forventetAvkastning)} før kostnader og skatt.` : ''
    ].filter(Boolean)
  };
}

export function buildProductNarrativeV2(product) {
  const registry = PRODUCT_SLIDE_REGISTRY_V2[product?.id] || {};
  const focus = Array.isArray(registry.descriptionFocus) ? registry.descriptionFocus.join(', ') : '';
  return {
    title: registry.sectionTitle || product?.kortnavn || product?.navn || 'Produkt',
    rationale: [
      `${product?.kortnavn || product?.navn} er inkludert med ${pct(product?.portfolioWeight)} vekt og er ment å fylle rollen som ${String(product?.rolle || 'byggestein').toLowerCase()} i porteføljen.`,
      product?.caseKort || '',
      focus ? `Særlig relevant på grunn av ${focus}.` : '',
      `Produktet har ${product?.likviditet || 'ukjent'} likviditet og vurderes til ${String(product?.risikonivaa || 'ukjent').toLowerCase()} risiko.`
    ].filter(Boolean),
    exposureCommentary: [
      `Underliggende eksponering viser ${exposureLead(product)}.`,
      product?.benchmark ? `Produktet vurderes mot ${product.benchmark} som overordnet referanse.` : ''
    ].filter(Boolean)
  };
}
