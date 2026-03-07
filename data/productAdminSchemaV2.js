export const PRODUCT_ADMIN_SCHEMA_V2 = {
  version: 1,
  sections: [
    {
      key: 'identity',
      label: 'Identitet',
      fields: [
        { key: 'name', label: 'Produktnavn', type: 'text', required: true },
        { key: 'slug', label: 'Intern nøkkel', type: 'text', required: true },
        { key: 'category', label: 'Kategori', type: 'select', options: ['kjerne', 'satellitt', 'rente', 'norge', 'sektor', 'alternativ'] },
        { key: 'benchmark', label: 'Benchmark', type: 'text' },
        { key: 'riskLevel', label: 'Risikonivå', type: 'select', options: ['Lav', 'Moderat', 'Moderat/Høy', 'Høy'] },
        { key: 'liquidityProfile', label: 'Likviditet', type: 'select', options: ['Daglig', 'Ukentlig', 'Månedlig', 'Kvartalsvis', 'Begrenset'] }
      ]
    },
    {
      key: 'portfolioRole',
      label: 'Porteføljerolle',
      fields: [
        { key: 'roleLabel', label: 'Rolle i porteføljen', type: 'text', placeholder: 'Kjerneeksponering / kontantstrøm / sektor-tillegg' },
        { key: 'roleSummary', label: 'Kort rollebeskrivelse', type: 'textarea' },
        { key: 'investmentCase', label: 'Investeringscase', type: 'textarea' },
        { key: 'whyIncluded', label: 'Hvorfor med i forslag', type: 'textarea' },
        { key: 'keyRisks', label: 'Viktige risikomomenter', type: 'textarea' }
      ]
    },
    {
      key: 'performance',
      label: 'Forventningstall',
      fields: [
        { key: 'expectedReturn', label: 'Forventet avkastning p.a.', type: 'number', unit: '%' },
        { key: 'expectedYield', label: 'Forventet yield', type: 'number', unit: '%' },
        { key: 'volatilityBand', label: 'Forventet volatilitet', type: 'text' },
        { key: 'timeHorizon', label: 'Anbefalt tidshorisont', type: 'text' }
      ]
    },
    {
      key: 'content',
      label: 'Tekstblokker',
      fields: [
        { key: 'pitchShort', label: 'Kort pitch', type: 'textarea' },
        { key: 'pitchLong', label: 'Lang pitch', type: 'textarea' },
        { key: 'clientFriendlySummary', label: 'Kundevennlig oppsummering', type: 'textarea' },
        { key: 'advisorTalkingPoints', label: 'Rådgiverpoenger', type: 'textarea' }
      ]
    },
    {
      key: 'charts',
      label: 'Diagram- og slidepreferanser',
      fields: [
        { key: 'preferredCharts', label: 'Foretrukne diagrammer', type: 'multiselect', options: ['historikk', 'region', 'sektor', 'stil', 'topHoldings', 'yield', 'kredittkvalitet'] },
        { key: 'minSlides', label: 'Min slides', type: 'number' },
        { key: 'maxSlides', label: 'Maks slides', type: 'number' },
        { key: 'primaryKpis', label: 'Primære KPI-er', type: 'multiselect', options: ['return', 'yield', 'risk', 'topHolding', 'regionTilt', 'sectorTilt', 'duration', 'quality'] }
      ]
    },
    {
      key: 'sourceMapping',
      label: 'Kildemapping',
      fields: [
        { key: 'datafeedLabel', label: 'Navn i månedlig datafeed', type: 'text' },
        { key: 'morningstarDeckLabel', label: 'Navn i produkt-PPT', type: 'text' },
        { key: 'regionSourceKey', label: 'Regionnøkkel', type: 'text' },
        { key: 'sectorSourceKey', label: 'Sektornøkkel', type: 'text' },
        { key: 'topHoldingsSourceKey', label: 'Top holdings-nøkkel', type: 'text' }
      ]
    }
  ]
};

export function getDefaultAdminModel(product = {}) {
  return {
    slug: product.slug || '',
    name: product.name || '',
    category: product.category || 'kjerne',
    benchmark: product.benchmark || '',
    riskLevel: product.riskLevel || 'Moderat',
    liquidityProfile: product.liquidityProfile || 'Daglig',
    roleLabel: product.roleLabel || '',
    roleSummary: product.roleSummary || '',
    investmentCase: product.investmentCase || '',
    whyIncluded: product.whyIncluded || '',
    keyRisks: product.keyRisks || '',
    expectedReturn: product.expectedReturn ?? null,
    expectedYield: product.expectedYield ?? null,
    volatilityBand: product.volatilityBand || '',
    timeHorizon: product.timeHorizon || '',
    pitchShort: product.pitchShort || '',
    pitchLong: product.pitchLong || '',
    clientFriendlySummary: product.clientFriendlySummary || '',
    advisorTalkingPoints: product.advisorTalkingPoints || '',
    preferredCharts: product.preferredCharts || [],
    minSlides: product.minSlides ?? 1,
    maxSlides: product.maxSlides ?? 2,
    primaryKpis: product.primaryKpis || [],
    datafeedLabel: product.datafeedLabel || '',
    morningstarDeckLabel: product.morningstarDeckLabel || '',
    regionSourceKey: product.regionSourceKey || '',
    sectorSourceKey: product.sectorSourceKey || '',
    topHoldingsSourceKey: product.topHoldingsSourceKey || ''
  };
}
