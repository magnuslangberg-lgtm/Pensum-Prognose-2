export const REPORT_BLUEPRINT_V2 = [
  { id: 'cover', type: 'static', title: 'Forside' },
  { id: 'important-info', type: 'static', title: 'Viktig informasjon' },
  { id: 'executive-summary', type: 'portfolio', title: 'Executive summary' },
  { id: 'allocation', type: 'portfolio', title: 'Anbefalt porteføljesammensetning' },
  { id: 'portfolio-metrics', type: 'portfolio', title: 'Nøkkeltall og forventninger' },
  { id: 'portfolio-rationale', type: 'portfolio', title: 'Hvorfor denne sammensetningen' },
  { id: 'portfolio-history', type: 'portfolio', title: 'Historisk utvikling og referanser' },
  { id: 'portfolio-exposure', type: 'portfolio', title: 'Samlet eksponering' },
  { id: 'product-modules', type: 'product-module', title: 'Produktmoduler', repeatPerSelectedProduct: true },
  { id: 'implementation', type: 'static', title: 'Implementering og oppfølging' },
  { id: 'next-steps', type: 'static', title: 'Oppsummering og neste steg' }
];

export const PRODUCT_SLIDE_TEMPLATES_V2 = {
  'equity-core': ['product-summary', 'product-exposure'],
  'equity-satellite': ['product-summary', 'product-exposure'],
  'equity-country': ['product-summary', 'product-exposure'],
  'equity-sector': ['product-summary', 'product-exposure'],
  'equity-thematic': ['product-summary', 'product-exposure'],
  'multi-asset': ['product-summary', 'product-exposure'],
  'fixed-income': ['product-summary', 'product-exposure'],
  'fixed-income-specialist': ['product-summary', 'product-exposure']
};
