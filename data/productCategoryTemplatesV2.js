export const PRODUCT_CATEGORY_TEMPLATES_V2 = {
  core_equity: {
    label: 'Kjerneaksjer',
    slideCount: 2,
    preferredCharts: ['allocation', 'regions', 'sectors', 'historical'],
    primaryKpis: ['weight', 'returnSinceStart', 'volatility'],
    narrativeFocus: ['global diversifisering', 'kjerneeksponering', 'langsiktig avkastningsmotor'],
  },
  fixed_income: {
    label: 'Renter',
    slideCount: 2,
    preferredCharts: ['allocation', 'yield', 'creditQuality', 'historical'],
    primaryKpis: ['weight', 'yield', 'duration'],
    narrativeFocus: ['løpende kontantstrøm', 'stabilitet', 'lavere forventet volatilitet'],
  },
  nordic_equity: {
    label: 'Nordiske aksjer',
    slideCount: 1,
    preferredCharts: ['sectors', 'topHoldings', 'historical'],
    primaryKpis: ['weight', 'returnSinceStart'],
    narrativeFocus: ['aktiv forvaltning', 'lokal kunnskap', 'konsentrert kvalitetsportefølje'],
  },
  sector_satellite: {
    label: 'Sektoreksponering',
    slideCount: 1,
    preferredCharts: ['topHoldings', 'historical', 'sectors'],
    primaryKpis: ['weight', 'returnSinceStart'],
    narrativeFocus: ['målrettet tematik', 'spesialisert eksponering', 'høyere aktiv risiko'],
  },
  alternatives: {
    label: 'Alternativer',
    slideCount: 1,
    preferredCharts: ['allocation', 'historical'],
    primaryKpis: ['weight', 'yield'],
    narrativeFocus: ['diversifisering', 'annen risikokilde', 'porteføljekomplement'],
  },
};

export function getCategoryTemplate(categoryKey = 'core_equity') {
  return PRODUCT_CATEGORY_TEMPLATES_V2[categoryKey] || PRODUCT_CATEGORY_TEMPLATES_V2.core_equity;
}
