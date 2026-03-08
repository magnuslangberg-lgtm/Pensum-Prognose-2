export const PRODUCT_CATEGORY_TEMPLATES_V2 = {
  core_equity: {
    id: 'core_equity',
    label: 'Global kjerneaksjer',
    preferredCharts: ['historikk', 'regioner', 'holdings'],
    kpis: ['forventetAvkastning', 'benchmark', 'portfolioWeight'],
    defaultSlides: ['product-summary', 'product-exposure'],
    narrativeFocus: ['rolle', 'diversifisering', 'aktiv forvaltning']
  },
  norwegian_equity: {
    id: 'norwegian_equity',
    label: 'Norske aksjer',
    preferredCharts: ['historikk', 'sektorer', 'holdings'],
    kpis: ['forventetAvkastning', 'benchmark', 'portfolioWeight'],
    defaultSlides: ['product-summary', 'product-exposure'],
    narrativeFocus: ['rolle', 'hjemmemarked', 'aktiv forvaltning']
  },
  thematic_equity: {
    id: 'thematic_equity',
    label: 'Tematisk aksjeeksponering',
    preferredCharts: ['historikk', 'regioner', 'sektorer'],
    kpis: ['forventetAvkastning', 'styleBias', 'portfolioWeight'],
    defaultSlides: ['product-summary', 'product-exposure'],
    narrativeFocus: ['rolle', 'tematikk', 'vekstdrivere']
  },
  sector_specialist: {
    id: 'sector_specialist',
    label: 'Sektorspesialist',
    preferredCharts: ['historikk', 'holdings', 'regioner'],
    kpis: ['forventetAvkastning', 'benchmark', 'portfolioWeight'],
    defaultSlides: ['product-summary', 'product-exposure'],
    narrativeFocus: ['rolle', 'sektoreksponering', 'selektivitet']
  },
  fixed_income: {
    id: 'fixed_income',
    label: 'Rente og kreditt',
    preferredCharts: ['historikk', 'holdings', 'regioner'],
    kpis: ['forventetYield', 'likviditet', 'portfolioWeight'],
    defaultSlides: ['product-summary', 'product-exposure'],
    narrativeFocus: ['rolle', 'løpende kontantstrøm', 'robusthet']
  },
  mixed: {
    id: 'mixed',
    label: 'Blandet profil',
    preferredCharts: ['historikk', 'regioner', 'sektorer'],
    kpis: ['forventetAvkastning', 'forventetYield', 'portfolioWeight'],
    defaultSlides: ['product-summary', 'product-exposure'],
    narrativeFocus: ['rolle', 'balanse', 'fleksibilitet']
  }
};

export function inferProductCategoryTemplate(product = {}) {
  const id = String(product.id || '').toLowerCase();
  const name = String(product.navn || '').toLowerCase();
  const asset = String(product.aktivaklasse || '').toLowerCase();

  if (id.includes('global-core') || name.includes('global core')) return PRODUCT_CATEGORY_TEMPLATES_V2.core_equity;
  if (id.includes('norge') || name.includes('norske aksjer')) return PRODUCT_CATEGORY_TEMPLATES_V2.norwegian_equity;
  if (id.includes('energy') || name.includes('energy')) return PRODUCT_CATEGORY_TEMPLATES_V2.thematic_equity;
  if (id.includes('bank') || name.includes('banking')) return PRODUCT_CATEGORY_TEMPLATES_V2.sector_specialist;
  if (name.includes('høyrente') || asset.includes('renter') || asset.includes('kreditt')) return PRODUCT_CATEGORY_TEMPLATES_V2.fixed_income;
  if (asset.includes('aksjer')) return PRODUCT_CATEGORY_TEMPLATES_V2.core_equity;
  return PRODUCT_CATEGORY_TEMPLATES_V2.mixed;
}
