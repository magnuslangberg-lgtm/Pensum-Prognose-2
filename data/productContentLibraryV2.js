export const PRODUCT_CONTENT_LIBRARY_V2 = {
  global_core_active: {
    chartPriority: ['historikk', 'region', 'topHoldings'],
    slideIntent: 'Vis produktet som global kjerne i porteføljen med bred diversifisering og tydelig rolle som hovedmotor.',
    kpiFocus: ['return', 'risk', 'regionTilt'],
    narrativeRules: [
      'Trekk frem bred global diversifisering.',
      'Beskriv produktet som kjerneeksponering i aksjedelen.',
      'Understrek at produktet skal bidra til robust langsiktig verdiskaping.'
    ]
  },
  global_hoyrente: {
    chartPriority: ['historikk', 'yield', 'kredittkvalitet'],
    slideIntent: 'Vis produktet som kontantstrøm- og stabilitetskomponent i porteføljen.',
    kpiFocus: ['yield', 'risk', 'quality'],
    narrativeRules: [
      'Trekk frem løpende avkastning og mer defensiv karakter enn aksjer.',
      'Beskriv produktet som bidrag til kontantstrøm og lavere total volatilitet.',
      'Løft frem diversifisering på tvers av kreditt- og rentemarkeder der relevant.'
    ]
  },
  norge: {
    chartPriority: ['historikk', 'sektor', 'topHoldings'],
    slideIntent: 'Vis produktet som fokusert norsk aksjeeksponering og supplement til globale mandater.',
    kpiFocus: ['return', 'sectorTilt', 'topHolding'],
    narrativeRules: [
      'Trekk frem lokal markedsforståelse og potensialet for aktiv forvaltning i Norge.',
      'Beskriv hvordan løsningen kompletterer global aksjeeksponering.',
      'Forklar sektorprofilen i norsk marked når den er tydelig.'
    ]
  },
  nordic_banking_sector: {
    chartPriority: ['historikk', 'sektor', 'topHoldings'],
    slideIntent: 'Vis produktet som et målrettet sektorbidrag med tydelig investeringscase.',
    kpiFocus: ['return', 'sectorTilt', 'topHolding'],
    narrativeRules: [
      'Trekk frem at produktet er mer konsentrert og tematisk enn kjerneallokeringen.',
      'Forklar hvorfor bank/sektorcaset er relevant nå.',
      'Beskriv produktet som satelitt rundt bredere kjerneeksponering.'
    ]
  },
  financial_opportunities: {
    chartPriority: ['historikk', 'region', 'topHoldings'],
    slideIntent: 'Vis produktet som et spesialisert mandat med potensial for meravkastning.',
    kpiFocus: ['return', 'risk', 'topHolding'],
    narrativeRules: [
      'Trekk frem fleksibilitet og evne til å identifisere attraktive finansmuligheter.',
      'Beskriv hvorfor mandatet kan gi differensiert avkastningsprofil.',
      'Understrek at dette er et mer aktivt og opportunistisk tillegg.'
    ]
  }
};

export function getProductContentPreset(slug) {
  return PRODUCT_CONTENT_LIBRARY_V2[slug] || {
    chartPriority: ['historikk', 'region', 'sektor'],
    slideIntent: 'Vis produktet tydelig som del av den anbefalte porteføljen.',
    kpiFocus: ['return', 'risk'],
    narrativeRules: [
      'Forklar produktets rolle i porteføljen.',
      'Trekk frem viktigste styrker.',
      'Beskriv hvordan produktet bidrar til total diversifisering.'
    ]
  };
}
