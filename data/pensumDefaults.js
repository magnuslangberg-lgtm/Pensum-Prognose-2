export const defaultPensumProdukter = {
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


export const defaultProduktMetadata = {
  'global-core-active': {
    kategoriLabel: 'Global aksjeportefølje',
    rolle: 'Kjerneeksponering i aksjer',
    beskrivelse: 'Bred global aksjeeksponering satt sammen av utvalgte aktive forvaltere med tydelig diversifisering på regioner, stil og sektorer.',
    investeringside: 'Skal være den stabile vekstmotoren i porteføljen og gi bred, robust aksjeeksponering over tid.',
    riskLabel: 'Moderat–høy',
    expectedReturn: 9.0,
    expectedYield: 1.8,
    likviditetLabel: 'Daglig likviditet',
    hovedpoenger: ['Bred global diversifisering', 'Aktiv managerseleksjon', 'God som kjerne i aksjedelen']
  },
  'global-edge': {
    kategoriLabel: 'Satellitt / global aksje',
    rolle: 'Ekstra vekst og spesialisering',
    beskrivelse: 'Mer offensiv global aksjeportefølje med høyere andel nisjeforvaltere, små/mellomstore selskaper og tydeligere aktiv risiko.',
    investeringside: 'Skal løfte forventet meravkastning og gi porteføljen flere uavhengige avkastningsdrivere.',
    riskLabel: 'Høy',
    expectedReturn: 10.0,
    expectedYield: 1.2,
    likviditetLabel: 'Daglig likviditet',
    hovedpoenger: ['Mer offensiv enn kjerneporteføljen', 'Høy andel aktiv risiko', 'God satellitt rundt Global Core Active']
  },
  basis: {
    kategoriLabel: 'Balansert multi-asset',
    rolle: 'Balansering og totalportefølje',
    beskrivelse: 'Blandet løsning med både aksjer og renter som gir en mer balansert risiko og kan fungere som fundament i moderate profiler.',
    investeringside: 'Skal redusere svingningene og bidra til en mer robust helhetlig portefølje.',
    riskLabel: 'Moderat',
    expectedReturn: 7.0,
    expectedYield: 3.0,
    likviditetLabel: 'Daglig likviditet',
    hovedpoenger: ['Balansert aksje/rente-miks', 'God i moderate profiler', 'Kan brukes som base i totalporteføljen']
  },
  'global-hoyrente': {
    kategoriLabel: 'Global rente / high yield',
    rolle: 'Kontantstrøm og stabiliserende rentebein',
    beskrivelse: 'Renteportefølje med utvalgte globale high yield- og obligasjonsfond som søker attraktiv løpende yield med moderat volatilitet.',
    investeringside: 'Skal bidra med løpende avkastning og jevne ut risikoen mot aksjedelen.',
    riskLabel: 'Moderat',
    expectedReturn: 7.0,
    expectedYield: 7.5,
    likviditetLabel: 'Daglig likviditet',
    hovedpoenger: ['Attraktiv løpende yield', 'Lavere volatilitet enn aksjer', 'God diversifisering mot aksjedelen']
  },
  'nordisk-hoyrente': {
    kategoriLabel: 'Nordisk rente / high yield',
    rolle: 'Komplementær nordisk renteeksponering',
    beskrivelse: 'Nordisk high yield-portefølje med fokus på attraktiv kontantstrøm, kortere vei til kreditthistoriene og god regional diversifisering.',
    investeringside: 'Skal komplettere den globale rentedelen med nordisk kreditt og høy løpende rente.',
    riskLabel: 'Moderat',
    expectedReturn: 7.0,
    expectedYield: 7.0,
    likviditetLabel: 'Daglig likviditet',
    hovedpoenger: ['Nordisk kredittmarked', 'Løpende kontantstrøm', 'Komplement til global høyrente']
  },
  'norge-a': {
    kategoriLabel: 'Norske aksjer',
    rolle: 'Norsk hjemmemarkedseksponering',
    beskrivelse: 'Norsk aksjeløsning med konsentrert eksponering mot selskaper og sektorer Pensum kjenner godt, inkludert bank, finans, energi og utvalgte industriselskaper.',
    investeringside: 'Skal gi lokal markedsforståelse og eksponering mot attraktive norske enkelthistorier.',
    riskLabel: 'Høy',
    expectedReturn: 9.0,
    expectedYield: 2.5,
    likviditetLabel: 'Likvid',
    hovedpoenger: ['Norsk markedskompetanse', 'Konsentrert og aktiv', 'Relevant for investorer med lokal preferanse']
  },
  'energy-a': {
    kategoriLabel: 'Tematisk aksje / energi',
    rolle: 'Tematisk og syklisk satellitt',
    beskrivelse: 'Tematisk mandat med eksponering mot energi, olje, gass og tilknyttede verdikjeder, med potensial for høy meravkastning men også høyere svingninger.',
    investeringside: 'Skal gi målrettet eksponering mot energikomplekset som en mindre satellitt i totalporteføljen.',
    riskLabel: 'Høy',
    expectedReturn: 10.0,
    expectedYield: 3.0,
    likviditetLabel: 'Likvid',
    hovedpoenger: ['Tematisk energi-eksponering', 'Kan gi høy meravkastning', 'Bør normalt være mindre satellittandel']
  },
  'banking-d': {
    kategoriLabel: 'Nordisk bank/finans-aksjer',
    rolle: 'Sektorspesifikk satellitt',
    beskrivelse: 'Konsentrert aksjeløsning mot nordisk bank og finans, et område Pensum har særlig kompetanse og tett oppfølging på.',
    investeringside: 'Skal gi spesialisert eksponering mot en sektor med attraktive inntjenings- og utbytteegenskaper.',
    riskLabel: 'Høy',
    expectedReturn: 9.5,
    expectedYield: 4.0,
    likviditetLabel: 'Likvid',
    hovedpoenger: ['Spisset finanssektoreksponering', 'Utbytte- og lønnsomhetscase', 'Best som satellitt']
  },
  'financial-d': {
    kategoriLabel: 'Finans/rente-spesialist',
    rolle: 'Yield og spesialisert kreditt',
    beskrivelse: 'Spesialisert løsning med fokus på finansrelatert kreditt og selekterte finansnavn, med mål om høy løpende avkastning.',
    investeringside: 'Skal gi porteføljen et spesialisert rente-/kredittbein med attraktiv yield.',
    riskLabel: 'Moderat–høy',
    expectedReturn: 8.5,
    expectedYield: 8.0,
    likviditetLabel: 'Likvid',
    hovedpoenger: ['Spesialisert finanskreditt', 'Høy løpende yield', 'God som nisjekomponent i rentedelen']
  },
  'turnstone-pe': {
    kategoriLabel: 'Private equity',
    rolle: 'Illikvid meravkastningsmotor',
    beskrivelse: 'Illikvid private equity-eksponering for investorer som kan binde kapital over tid og søker høy langsiktig avkastning.',
    investeringside: 'Skal øke forventet totalavkastning over tid for investorer med lang horisont og høy risikobærende evne.',
    riskLabel: 'Høy / illikvid',
    expectedReturn: 12.0,
    expectedYield: 0.0,
    likviditetLabel: 'Illikvid',
    hovedpoenger: ['Lang horisont', 'Illikvid premie', 'Bør tilpasses nøye til kundeprofil']
  },
  'amaron-re': {
    kategoriLabel: 'Eiendom',
    rolle: 'Realaktiva og diversifisering',
    beskrivelse: 'Eiendomseksponering som kan gi diversifisering, kontantstrøm og delvis inflasjonsbeskyttelse i totalporteføljen.',
    investeringside: 'Skal tilføre realaktiva og robusthet i porteføljen for investorer som ønsker bredere aktivaklassemiks.',
    riskLabel: 'Moderat / delvis illikvid',
    expectedReturn: 8.0,
    expectedYield: 5.0,
    likviditetLabel: 'Delvis illikvid',
    hovedpoenger: ['Realaktivum', 'Kontantstrøm', 'Diversifisering mot aksjer og renter']
  },
  'unoterte-aksjer': {
    kategoriLabel: 'Unoterte aksjer',
    rolle: 'Idiosynkratisk oppside',
    beskrivelse: 'Unoterte investeringer med høyere usikkerhet og lav likviditet, men potensielt betydelig oppside i utvalgte case.',
    investeringside: 'Skal kun brukes som begrenset andel for investorer som forstår risikoen og tåler illikviditet.',
    riskLabel: 'Høy / illikvid',
    expectedReturn: 11.0,
    expectedYield: 0.0,
    likviditetLabel: 'Illikvid',
    hovedpoenger: ['Case-drevet oppside', 'Høy risiko', 'Bør holdes som begrenset andel']
  }
};
