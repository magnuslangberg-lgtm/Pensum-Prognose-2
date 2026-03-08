const defaultPensumProdukterRaw = {
    enkeltfond: [
      { id: 'norge-a', navn: 'Pensum Norge A', aktivatype: 'aksje', likviditet: 'likvid', aar2024: 21.5, aar2023: 17.7, aar2022: null, aar2021: null, aar2020: null, aarlig3ar: null, risiko3ar: null },
      { id: 'energy-a', navn: 'Pensum Global Energy A', aktivatype: 'aksje', likviditet: 'likvid', aar2024: 7.3, aar2023: -1.1, aar2022: 11.0, aar2021: null, aar2020: null, aarlig3ar: null, risiko3ar: null },
      { id: 'banking-d', navn: 'Pensum Nordic Banking Sector D', aktivatype: 'aksje', likviditet: 'likvid', aar2024: null, aar2023: null, aar2022: null, aar2021: null, aar2020: null, aarlig3ar: null, risiko3ar: null },
      { id: 'financial-d', navn: 'Pensum Financial Opportunity Fund D', aktivatype: 'rente', likviditet: 'likvid', aar2024: null, aar2023: null, aar2022: null, aar2021: null, aar2020: null, aarlig3ar: null, risiko3ar: null }
    ],
    fondsportefoljer: [
      { id: 'global-core-active', navn: 'Pensum Global Core Active', aktivatype: 'aksje', likviditet: 'likvid', aar2024: null, aar2023: null, aar2022: null, aar2021: null, aar2020: null, aarlig3ar: null, risiko3ar: null },
      { id: 'global-edge', navn: 'Pensum Global Edge', aktivatype: 'aksje', likviditet: 'likvid', aar2024: null, aar2023: null, aar2022: null, aar2021: null, aar2020: null, aarlig3ar: null, risiko3ar: null },
      { id: 'basis', navn: 'Pensum Basis', aktivatype: 'blandet', likviditet: 'likvid', aar2024: 6.2, aar2023: 13.1, aar2022: null, aar2021: null, aar2020: null, aarlig3ar: null, risiko3ar: null },
      { id: 'global-hoyrente', navn: 'Pensum Global Høyrente', aktivatype: 'rente', likviditet: 'likvid', aar2024: 6.5, aar2023: 7.9, aar2022: -5.1, aar2021: 5.3, aar2020: 3.0, aarlig3ar: 6.9, risiko3ar: 2.3 },
      { id: 'nordisk-hoyrente', navn: 'Pensum Nordisk Høyrente', aktivatype: 'rente', likviditet: 'likvid', aar2024: 6.5, aar2023: null, aar2022: null, aar2021: null, aar2020: null, aarlig3ar: null, risiko3ar: null }
    ],
    alternative: [
      { id: 'turnstone-pe', navn: 'Turnstone Private Equity', aktivatype: 'alternativ', likviditet: 'illikvid', aar2024: null, aar2023: null, aar2022: null, aar2021: null, aar2020: null, aarlig3ar: null, risiko3ar: null },
      { id: 'amaron-re', navn: 'Amaron Real Estate', aktivatype: 'alternativ', likviditet: 'illikvid', aar2024: null, aar2023: null, aar2022: null, aar2021: null, aar2020: null, aarlig3ar: null, risiko3ar: null },
      { id: 'unoterte-aksjer', navn: 'Unoterte aksjer', aktivatype: 'alternativ', likviditet: 'illikvid', aar2024: null, aar2023: null, aar2022: null, aar2021: null, aar2020: null, aarlig3ar: null, risiko3ar: null }
    ]
  };


const REPORT_DEFAULTS = {
  'global-core-active': {
    produktkategori: 'kjerne',
    slideTittel: 'Pensum Global Core Active',
    slideUndertittel: 'Global kjerneeksponering med bred diversifisering',
    rollePortefolje: 'Kjernebyggestein',
    benchmark: 'MSCI World NR',
    risikonivaa: 'Middels/Høy',
    forventetAvkastning: 8.5,
    forventetYield: 2.0,
    kortPitch: 'Porteføljens globale aksjemotor med bred eksponering på tvers av regioner, sektorer og stil.',
    investeringscase: 'Gir robust global aksjeeksponering gjennom utvalgte underfond og kan fungere som hovedmotor i en langsiktig vekstportefølje.',
    hvorforInkludert: 'Bygger den globale aksjedelen i porteføljen og gir bred diversifisering.',
    nokkelrisiko: 'Aksjemarkedsrisiko og perioder med høy markedsvolatilitet.',
    foretrukketDiagram: 'regioner',
    antallProduktslides: 2
  },
  'global-edge': {
    produktkategori: 'satellitt',
    slideTittel: 'Pensum Global Edge',
    slideUndertittel: 'Mer opportunistisk global aksjeeksponering',
    rollePortefolje: 'Satellitt/meravkastning',
    benchmark: 'MSCI ACWI',
    risikonivaa: 'Høy',
    forventetAvkastning: 9.5,
    forventetYield: 1.5,
    kortPitch: 'Satellittmandat med større frihetsgrader og høyere aktiv andel enn kjerneporteføljene.',
    investeringscase: 'Kan øke langsiktig meravkastningspotensial gjennom mer konsentrerte og tematiske posisjoner.',
    hvorforInkludert: 'Brukes når porteføljen skal ha noe mer offensiv aksjeeksponering.',
    nokkelrisiko: 'Høyere aktiv risiko og større svingninger enn globale kjerneprodukter.',
    foretrukketDiagram: 'stil',
    antallProduktslides: 2
  },
  'basis': {
    produktkategori: 'blandet',
    slideTittel: 'Pensum Basis',
    slideUndertittel: 'Balansert løsning på tvers av aksjer og renter',
    rollePortefolje: 'Helhetlig basisløsning',
    benchmark: 'Sammensatt referanseindeks',
    risikonivaa: 'Middels',
    forventetAvkastning: 6.5,
    forventetYield: 3.0,
    kortPitch: 'Balansert multi-asset løsning som kombinerer vekst, kontantstrøm og risikodemping.',
    investeringscase: 'Egner seg som kjerne i en moderat profil eller som supplement til andre Pensum-løsninger.',
    hvorforInkludert: 'Effektiv byggekloss for investorer som ønsker både aksjer og renter i én løsning.',
    nokkelrisiko: 'Avkastningen vil være lavere enn rene aksjeprodukter i sterke aksjemarkeder.',
    foretrukketDiagram: 'allokering',
    antallProduktslides: 2
  },
  'global-hoyrente': {
    produktkategori: 'rente',
    slideTittel: 'Pensum Global Høyrente',
    slideUndertittel: 'Løpende renteavkastning med global spredning',
    rollePortefolje: 'Kontantstrøm og stabilisering',
    benchmark: 'Global High Yield hedged to NOK',
    risikonivaa: 'Lav/Middels',
    forventetAvkastning: 7.0,
    forventetYield: 7.0,
    kortPitch: 'Renteportefølje med fokus på løpende yield og moderat volatilitet sammenlignet med aksjer.',
    investeringscase: 'Gir porteføljen løpende kontantstrøm og kan redusere samlet svingningsnivå.',
    hvorforInkludert: 'Brukes som bærende rentekomponent i mange rådgiverporteføljer.',
    nokkelrisiko: 'Kredittpåslag og svakere likviditet i perioder med markedsuro.',
    foretrukketDiagram: 'kreditt',
    antallProduktslides: 2
  },
  'nordisk-hoyrente': {
    produktkategori: 'rente',
    slideTittel: 'Pensum Nordisk Høyrente',
    slideUndertittel: 'Nordisk renteeksponering med fokus på yield',
    rollePortefolje: 'Nordisk rentesatellitt',
    benchmark: 'Nordic High Yield',
    risikonivaa: 'Lav/Middels',
    forventetAvkastning: 6.5,
    forventetYield: 6.5,
    kortPitch: 'Komplementær nordisk renteløsning med attraktiv løpende avkastning.',
    investeringscase: 'Kan brukes for investorer som ønsker mer nordisk eksponering i rentedelen.',
    hvorforInkludert: 'Gir regional spiss i rentedelen og styrker diversifiseringen.',
    nokkelrisiko: 'Konsentrasjon mot nordisk kredittmarked.',
    foretrukketDiagram: 'kreditt',
    antallProduktslides: 1
  },
  'norge-a': {
    produktkategori: 'norden',
    slideTittel: 'Pensum Norge A',
    slideUndertittel: 'Aktivt norsk aksjefond med høy conviction',
    rollePortefolje: 'Norsk aksjesatellitt',
    benchmark: 'Oslo Børs Fondsindeks',
    risikonivaa: 'Høy',
    forventetAvkastning: 8.0,
    forventetYield: 3.0,
    kortPitch: 'Aktiv norsk aksjeforvaltning med eksponering mot kvalitets- og verdiaksjer på Oslo Børs.',
    investeringscase: 'Gir hjemmemarkedseksponering og potensial for meravkastning gjennom aktivt aksjevalg.',
    hvorforInkludert: 'Relevant for investorer som ønsker norsk aksjeeksponering i porteføljen.',
    nokkelrisiko: 'Høy konsentrasjon mot norsk marked og enkeltsektorer.',
    foretrukketDiagram: 'sektorer',
    antallProduktslides: 2
  },
  'energy-a': {
    produktkategori: 'tema',
    slideTittel: 'Pensum Global Energy A',
    slideUndertittel: 'Tematisk eksponering mot energi og råvarer',
    rollePortefolje: 'Tematisk satellitt',
    benchmark: 'MSCI World Energy',
    risikonivaa: 'Høy',
    forventetAvkastning: 9.0,
    forventetYield: 3.5,
    kortPitch: 'Tematisk aksjeeksponering mot globale energi- og råvareverdikjeder.',
    investeringscase: 'Kan gi diversifisering og oppside i perioder med sterk energisyklus og inflasjonspress.',
    hvorforInkludert: 'Brukes som satellitt når investor ønsker målrettet energi-eksponering.',
    nokkelrisiko: 'Høy syklikalitet og råvareprisfølsomhet.',
    foretrukketDiagram: 'holdings',
    antallProduktslides: 1
  },
  'banking-d': {
    produktkategori: 'sektor',
    slideTittel: 'Pensum Nordic Banking Sector D',
    slideUndertittel: 'Konsentrert nordisk bankeksponering',
    rollePortefolje: 'Sektorspesialist',
    benchmark: 'Nordic Banks Index',
    risikonivaa: 'Høy',
    forventetAvkastning: 8.5,
    forventetYield: 4.0,
    kortPitch: 'Spisset bankmandat med fokus på solide nordiske finansinstitusjoner.',
    investeringscase: 'Kan gi attraktiv lønnsomhets- og utbytteeksponering mot en sektor Pensum kjenner godt.',
    hvorforInkludert: 'Brukes som sektorbet for investorer med positivt syn på nordiske banker.',
    nokkelrisiko: 'Sektorkonsentrasjon og sensitivitet mot makro/renter.',
    foretrukketDiagram: 'holdings',
    antallProduktslides: 1
  },
  'financial-d': {
    produktkategori: 'kreditt',
    slideTittel: 'Pensum Financial Opportunity Fund D',
    slideUndertittel: 'Spesialisert kreditt- og finansmandat',
    rollePortefolje: 'Spesialistkreditt',
    benchmark: 'Bloomberg Global High Yield hedged to NOK',
    risikonivaa: 'Middels',
    forventetAvkastning: 8.0,
    forventetYield: 8.0,
    kortPitch: 'Spesialistmandat innen kreditt og finans med høy løpende yield.',
    investeringscase: 'Kan gi attraktiv risikokorrigert avkastning som komplement til tradisjonelle rentefond.',
    hvorforInkludert: 'Brukes når porteføljen skal ha mer spisset kreditt- og finansinnretning.',
    nokkelrisiko: 'Kreditt- og likviditetsrisiko i underliggende posisjoner.',
    foretrukketDiagram: 'holdings',
    antallProduktslides: 1
  },
  'turnstone-pe': {
    produktkategori: 'alternativ',
    slideTittel: 'Turnstone Private Equity',
    slideUndertittel: 'Illikvid alternativ eksponering',
    rollePortefolje: 'Alternativ vekst',
    benchmark: 'Ingen direkte benchmark',
    risikonivaa: 'Høy',
    forventetAvkastning: 12.0,
    forventetYield: 0.0,
    kortPitch: 'Private equity-løsning for investorer med lang horisont og evne til å binde kapital.',
    investeringscase: 'Gir tilgang til unoterte verdiskapingsløp utenfor børs.',
    hvorforInkludert: 'Brukes for å øke andelen alternativer og langsiktig avkastningspotensial.',
    nokkelrisiko: 'Illikviditet, lang kapitalbinding og verdsettelsesusikkerhet.',
    foretrukketDiagram: 'ingen',
    antallProduktslides: 1
  },
  'amaron-re': {
    produktkategori: 'alternativ',
    slideTittel: 'Amaron Real Estate',
    slideUndertittel: 'Eiendomseksponering i alternativdelen',
    rollePortefolje: 'Alternativ diversifisering',
    benchmark: 'Ingen direkte benchmark',
    risikonivaa: 'Middels',
    forventetAvkastning: 9.0,
    forventetYield: 5.0,
    kortPitch: 'Eiendomseksponering med fokus på løpende yield og diversifisering.',
    investeringscase: 'Kan gi jevn kontantstrøm og lavere korrelasjon mot børsnoterte aksjer.',
    hvorforInkludert: 'Brukes som diversifiserende alternativandel.',
    nokkelrisiko: 'Illikviditet og rente-/verdivurderingsrisiko.',
    foretrukketDiagram: 'ingen',
    antallProduktslides: 1
  },
  'unoterte-aksjer': {
    produktkategori: 'alternativ',
    slideTittel: 'Unoterte aksjer',
    slideUndertittel: 'Skreddersydd alternativ aksjeandel',
    rollePortefolje: 'Spesialsituasjoner',
    benchmark: 'Ingen direkte benchmark',
    risikonivaa: 'Høy',
    forventetAvkastning: 10.0,
    forventetYield: 0.0,
    kortPitch: 'Eksponering mot unoterte case med høy potensiell oppside og høy risiko.',
    investeringscase: 'Kan brukes for erfarne investorer som ønsker unoterte muligheter i porteføljen.',
    hvorforInkludert: 'Aktuelt ved særskilte case eller familieoffice-lignende porteføljer.',
    nokkelrisiko: 'Lav likviditet, usikker verdsettelse og idiosynkratisk risiko.',
    foretrukketDiagram: 'ingen',
    antallProduktslides: 1
  }
};

function enrichProduct(product) {
  const meta = REPORT_DEFAULTS[product.id] || {};
  return {
    ...product,
    produktkategori: product.produktkategori || meta.produktkategori || '',
    slideTittel: product.slideTittel || meta.slideTittel || product.navn,
    slideUndertittel: product.slideUndertittel || meta.slideUndertittel || '',
    rollePortefolje: product.rollePortefolje || meta.rollePortefolje || '',
    benchmark: product.benchmark || meta.benchmark || '',
    risikonivaa: product.risikonivaa || meta.risikonivaa || '',
    forventetAvkastning: product.forventetAvkastning ?? meta.forventetAvkastning ?? null,
    forventetYield: product.forventetYield ?? meta.forventetYield ?? null,
    kortPitch: product.kortPitch || meta.kortPitch || '',
    investeringscase: product.investeringscase || meta.investeringscase || '',
    hvorforInkludert: product.hvorforInkludert || meta.hvorforInkludert || '',
    nokkelrisiko: product.nokkelrisiko || meta.nokkelrisiko || '',
    foretrukketDiagram: product.foretrukketDiagram || meta.foretrukketDiagram || 'regioner',
    antallProduktslides: product.antallProduktslides ?? meta.antallProduktslides ?? 1
  };
}

export const defaultPensumProdukter = Object.fromEntries(
  Object.entries(defaultPensumProdukterRaw).map(([kategori, produkter]) => [
    kategori,
    produkter.map(enrichProduct)
  ])
);

export const defaultProduktEksponering = {
    'global-core-active': {
      underliggende: [
        {navn: 'AB Select US Equity S1 USD', vekt: 19.9},
        {navn: 'Capital Group InvCoAmer (LUX) A4', vekt: 19.8},
        {navn: 'BGF European Value D2', vekt: 10.3},
        {navn: 'Guinness Global Equity Income Y EUR Acc', vekt: 10.2},
        {navn: 'Acadian Global Equity UCITS A EUR', vekt: 10.1},
        {navn: 'Capital Group New Pers (LUX) ZL', vekt: 10.0},
        {navn: 'Acadian Emerg Mkts Eq II C USD Ins Acc', vekt: 8.6},
        {navn: 'DNB Teknologi A', vekt: 5.8},
        {navn: 'JPM Japan Strategic Value C (acc) JPY', vekt: 5.3}
      ],
      regioner: [
        {navn: 'United States', vekt: 59.8}, {navn: 'Japan', vekt: 6.3}, {navn: 'United Kingdom', vekt: 4.6},
        {navn: 'France', vekt: 3.6}, {navn: 'Taiwan', vekt: 3.3}, {navn: 'Other', vekt: 22.4}
      ],
      sektorer: [
        {navn: 'Technology', vekt: 26.9}, {navn: 'Financial Services', vekt: 17.3}, {navn: 'Industrials', vekt: 13.5},
        {navn: 'Healthcare', vekt: 10.8}, {navn: 'Communication Services', vekt: 9.8}, {navn: 'Consumer Cyclical', vekt: 8.6},
        {navn: 'Other', vekt: 13.1}
      ],
      stil: [
        {navn: 'Large Value', vekt: 23.7}, {navn: 'Large Core', vekt: 42.1}, {navn: 'Large Growth', vekt: 17.8},
        {navn: 'Mid Cap', vekt: 13.9}, {navn: 'Small Cap', vekt: 2.5}
      ],
      disclaimer: 'Oppstart 01.01.2026. Historikk er estimert med den samme allokeringen som i oppstartsporteføljene bakover i tid.'
    },
    'global-edge': {
      underliggende: [
        {navn: 'Janus Henderson Hrzn Glb SC IU2 USD', vekt: 16.8},
        {navn: 'Capital Group InvCoAmer (LUX) Z', vekt: 13.3},
        {navn: 'DNB Teknologi A', vekt: 12.2},
        {navn: 'Acadian Emerg Mkts Eq II C USD Ins Acc', vekt: 10.1},
        {navn: 'BGF European Value D2', vekt: 8.4},
        {navn: 'ORIGO SELEQT A', vekt: 7.6},
        {navn: 'Arctic Aurora LifeScience I', vekt: 7.5},
        {navn: 'Bakersteel Glb Fds SICAV- Elctm I USD', vekt: 7.1},
        {navn: 'Granahan US Focused Growth A USD Acc', vekt: 6.4},
        {navn: 'Guinness Sustainable Energy Y USD Acc', vekt: 5.5},
        {navn: 'FIRST Impact', vekt: 5.2}
      ],
      regioner: [
        {navn: 'United States', vekt: 46.8}, {navn: 'Sweden', vekt: 7.1}, {navn: 'United Kingdom', vekt: 4.9},
        {navn: 'China', vekt: 4.3}, {navn: 'Canada', vekt: 4.0}, {navn: 'Other', vekt: 32.9}
      ],
      sektorer: [
        {navn: 'Technology', vekt: 22.8}, {navn: 'Industrials', vekt: 16.0}, {navn: 'Healthcare', vekt: 14.6},
        {navn: 'Financial Services', vekt: 11.8}, {navn: 'Basic Materials', vekt: 9.7}, {navn: 'Other', vekt: 25.1}
      ],
      stil: [
        {navn: 'Large Value', vekt: 11.1}, {navn: 'Large Core', vekt: 24.7}, {navn: 'Large Growth', vekt: 12.8},
        {navn: 'Mid Cap', vekt: 22.1}, {navn: 'Small Cap', vekt: 29.3}
      ],
      disclaimer: 'Oppstart 01.01.2026. Historikk er estimert med den samme allokeringen som i oppstartsporteføljene bakover i tid.'
    },
    'basis': {
      underliggende: [
        {navn: 'Arctic Nordic Corporate Bond Class D', vekt: 21.2},
        {navn: 'Arctic Return Class I', vekt: 17.5},
        {navn: 'Acadian Global Equity UCITS A EUR', vekt: 11.5},
        {navn: 'Guinness Global Equity Income Y EUR Acc', vekt: 10.8},
        {navn: 'KLP Obligasjon Global S', vekt: 10.1},
        {navn: 'Janus Henderson Hrzn Glb SC IU2 USD', vekt: 5.9},
        {navn: 'Acadian Emerg Mkts Eq II C USD Ins Acc', vekt: 4.6},
        {navn: 'ORIGO SELEQT A', vekt: 4.4},
        {navn: 'BGF European Value D2', vekt: 4.4},
        {navn: 'Elopak ASA', vekt: 3.5},
        {navn: 'Public Property Invest ASA', vekt: 3.1},
        {navn: 'Sentia ASA Registered Shares', vekt: 3.0}
      ],
      disclaimer: 'Avkastning før oppstart 12. september 2023 er estimert med en lignende portefølje med 50% rentefond og 50% aksjer.'
    },
    'global-hoyrente': {
      underliggende: [
        {navn: 'Arctic Nordic Corporate Bond Class D', vekt: 25.3},
        {navn: 'Barings Global High Yield Bond I NOK Acc', vekt: 23.2},
        {navn: 'BlueBay Global High Yield Bd I NOK', vekt: 20.2},
        {navn: 'Storm Bond ICN NOK', vekt: 16.2},
        {navn: 'KLP Obligasjon Global S', vekt: 15.2}
      ]
    },
    'nordisk-hoyrente': {
      underliggende: [
        {navn: 'Storm Bond ICN NOK', vekt: 33.7},
        {navn: 'Arctic Nordic Corporate Bond Class D', vekt: 33.7},
        {navn: 'Alfred Berg Nordic HY C (NOK)', vekt: 32.6}
      ],
      disclaimer: 'Oppstart februar 2024. Utvikling før dette er estimert med underliggende fonds utvikling før oppstart.'
    },
    'energy-a': {
      underliggende: [
        {navn: 'Var Energi ASA', vekt: 5.7}, {navn: 'DNO ASA', vekt: 5.7}, {navn: 'Aker BP ASA', vekt: 5.6},
        {navn: 'Valero Energy Corp', vekt: 5.1}, {navn: 'Exxon Mobil Corp', vekt: 5.1}, {navn: 'Equinor ASA', vekt: 4.5},
        {navn: 'Chevron Corp', vekt: 4.3}, {navn: 'International Petroleum Corp', vekt: 4.3},
        {navn: 'Frontline PLC', vekt: 4.1}, {navn: 'DOF Group ASA', vekt: 4.1}, {navn: 'Subsea 7 SA', vekt: 4.0}
      ],
      disclaimer: 'Avkastning før oppstart desember 2022 er estimert med et lignende diskresjonært mandat forvaltet av samme forvalter.'
    },
    'banking-d': {
      underliggende: [
        {navn: 'DNB Bank ASA', vekt: 15.6}, {navn: 'Nordea Bank Abp', vekt: 13.6},
        {navn: 'SpareBank 1 SMN Depository Receipts', vekt: 12.2}, {navn: 'Sparebank 1 Sorost-Norge', vekt: 10.3},
        {navn: 'Sparebanken Norge Depository Receipts', vekt: 8.9}, {navn: 'Danske Bank AS', vekt: 4.7},
        {navn: 'Swedbank AB Class A', vekt: 4.4}
      ],
      disclaimer: 'Oppstart 29. januar 2025. Utvikling før dette er estimert med det lignende mandatet Pensum Sparebank+.'
    },
    'norge-a': {
      underliggende: [
        {navn: 'DNB Bank ASA', vekt: 7.0}, {navn: 'Protector Forsikring ASA', vekt: 6.8},
        {navn: 'Storebrand ASA', vekt: 5.1}, {navn: 'Equinor ASA', vekt: 4.2},
        {navn: 'Aker ASA Class A', vekt: 4.1}, {navn: 'DOF Group ASA', vekt: 4.0},
        {navn: 'Mowi ASA', vekt: 4.0}, {navn: 'Public Property Invest ASA', vekt: 3.5},
        {navn: 'SpareBank 1 Sor Norge ASA', vekt: 3.5}
      ],
      disclaimer: 'Oppstart 27. november 2023. Utvikling før dette er estimert med lignende porteføljer.'
    },
    'financial-d': {
      underliggende: [
        {navn: 'IuteCredit Finance S.a r.l.', vekt: 26.5}, {navn: 'Stichting AK Rabobank Certificaten', vekt: 18.3},
        {navn: 'Eleving Group SA', vekt: 14.1}, {navn: 'Worldline SA', vekt: 10.3},
        {navn: 'Axactor ASA', vekt: 9.9}, {navn: 'Multitude PLC', vekt: 8.0},
        {navn: 'Sherwood Financing PLC', vekt: 7.8}, {navn: 'Landsbankinn hf.', vekt: 5.2}
      ],
      disclaimer: 'Oppstart 05.04.2025. Utvikling før dette er estimert med indeksen Bloomberg Global High Yield, valutasikret til NOK. NB: Allokeringen er foreløpig ikke korrekt.'
    }
  };
