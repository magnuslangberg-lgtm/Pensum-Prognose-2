export const defaultPensumProdukter = {
    enkeltfond: [
      { id: 'norge-a', navn: 'Pensum Norge A', aktivatype: 'aksje', likviditet: 'likvid', aar2026: null, aar2025: 21.5, aar2024: 12.5, aar2023: 13.2, aar2022: 5.0, forventetAvkastning: 11.0, forventetYield: 3.0, aarlig3ar: 15.6, risiko3ar: 4.5 },
      { id: 'energy-a', navn: 'Pensum Global Energy A', aktivatype: 'aksje', likviditet: 'likvid', aar2026: null, aar2025: 7.3, aar2024: -1.0, aar2023: 11.0, aar2022: 55.5, forventetAvkastning: 11.0, forventetYield: 3.5, aarlig3ar: 5.6, risiko3ar: 5.0 },
      { id: 'banking-d', navn: 'Pensum Nordic Banking Sector D', aktivatype: 'aksje', likviditet: 'likvid', aar2026: null, aar2025: 26.6, aar2024: 24.9, aar2023: 17.5, aar2022: -8.4, forventetAvkastning: 12.0, forventetYield: 5.0, aarlig3ar: 22.9, risiko3ar: 3.9 },
      { id: 'financial-d', navn: 'Pensum Financial Opportunity Fund D', aktivatype: 'rente', likviditet: 'likvid', aar2026: null, aar2025: 9.4, aar2024: 9.8, aar2023: 11.3, aar2022: -12.6, forventetAvkastning: 9.0, forventetYield: 8.0, aarlig3ar: 10.2, risiko3ar: 0.8 }
    ],
    fondsportefoljer: [
      { id: 'global-core-active', navn: 'Pensum Global Core Active', aktivatype: 'aksje', likviditet: 'likvid', aar2026: null, aar2025: 8.0, aar2024: 31.8, aar2023: 25.6, aar2022: -7.2, forventetAvkastning: 10.0, forventetYield: 1.8, aarlig3ar: 21.3, risiko3ar: 10.4 },
      { id: 'global-edge', navn: 'Pensum Global Edge', aktivatype: 'aksje', likviditet: 'likvid', aar2026: -2.1, aar2025: 14.1, aar2024: 26.8, aar2023: 23.6, aar2022: -6.3, forventetAvkastning: 10.5, forventetYield: 1.2, aarlig3ar: 21.3, risiko3ar: 5.4 },
      { id: 'basis', navn: 'Pensum Basis', aktivatype: 'blandet', likviditet: 'likvid', aar2026: null, aar2025: 5.0, aar2024: 13.3, aar2023: 12.9, aar2022: -2.1, forventetAvkastning: 8.0, forventetYield: 3.4, aarlig3ar: 10.3, risiko3ar: 3.7 },
      { id: 'global-hoyrente', navn: 'Pensum Global Høyrente', aktivatype: 'rente', likviditet: 'likvid', aar2026: null, aar2025: 6.2, aar2024: 6.5, aar2023: 7.9, aar2022: -5.1, forventetAvkastning: 7.5, forventetYield: 7.0, aarlig3ar: 6.9, risiko3ar: 0.7 },
      { id: 'nordisk-hoyrente', navn: 'Pensum Nordisk Høyrente', aktivatype: 'rente', likviditet: 'likvid', aar2026: null, aar2025: 6.5, aar2024: 9.1, aar2023: 11.3, aar2022: 4.7, forventetAvkastning: 7.5, forventetYield: 7.2, aarlig3ar: 8.9, risiko3ar: 2.0 }
    ],
    alternative: [
      { id: 'turnstone-pe', navn: 'Turnstone Private Equity', aktivatype: 'alternativ', likviditet: 'illikvid', aar2026: null, aar2025: null, aar2024: null, aar2023: null, aar2022: null, forventetAvkastning: 15.0, forventetYield: 0, aarlig3ar: null, risiko3ar: null },
      { id: 'amaron-re', navn: 'Amaron Real Estate', aktivatype: 'alternativ', likviditet: 'illikvid', aar2026: null, aar2025: null, aar2024: null, aar2023: null, aar2022: null, forventetAvkastning: 8.0, forventetYield: 4.0, aarlig3ar: null, risiko3ar: null },
      { id: 'unoterte-aksjer', navn: 'Unoterte aksjer', aktivatype: 'alternativ', likviditet: 'illikvid', aar2026: null, aar2025: null, aar2024: null, aar2023: null, aar2022: null, forventetAvkastning: 12.0, forventetYield: 0, aarlig3ar: null, risiko3ar: null }
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
        {navn: 'United States', vekt: 53.6}, {navn: 'Japan', vekt: 6.7}, {navn: 'United Kingdom', vekt: 4.7},
        {navn: 'France', vekt: 3.5}, {navn: 'Taiwan', vekt: 3.3}, {navn: 'China', vekt: 2.7},
        {navn: 'Switzerland', vekt: 2.7}, {navn: 'Germany', vekt: 2.6}, {navn: 'Sweden', vekt: 2.3},
        {navn: 'South Korea', vekt: 1.9}, {navn: 'Other', vekt: 16.0}
      ],
      sektorer: [
        {navn: 'Technology', vekt: 24.0}, {navn: 'Financial Services', vekt: 17.2}, {navn: 'Industrials', vekt: 13.5},
        {navn: 'Healthcare', vekt: 10.8}, {navn: 'Communication Services', vekt: 9.0}, {navn: 'Consumer Cyclical', vekt: 8.6},
        {navn: 'Consumer Defensive', vekt: 5.3}, {navn: 'Basic Materials', vekt: 2.7}, {navn: 'Energy', vekt: 2.5},
        {navn: 'Utilities', vekt: 1.0}, {navn: 'Other', vekt: 5.4}
      ],
      stil: [
        {navn: 'Large Value', vekt: 25.1}, {navn: 'Large Core', vekt: 41.7}, {navn: 'Large Growth', vekt: 17.7},
        {navn: 'Mid Value', vekt: 4.8}, {navn: 'Mid Core', vekt: 5.8}, {navn: 'Mid Growth', vekt: 0.8},
        {navn: 'Small Value', vekt: 1.2}, {navn: 'Small Core', vekt: 1.2}, {navn: 'Small Growth', vekt: 0.6}
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
        {navn: 'United States', vekt: 40.8}, {navn: 'United Kingdom', vekt: 6.3}, {navn: 'China', vekt: 6.1},
        {navn: 'Sweden', vekt: 6.0}, {navn: 'Japan', vekt: 4.5}, {navn: 'Canada', vekt: 3.7},
        {navn: 'Denmark', vekt: 2.7}, {navn: 'Taiwan', vekt: 2.5}, {navn: 'Germany', vekt: 2.5},
        {navn: 'Other', vekt: 24.9}
      ],
      sektorer: [
        {navn: 'Technology', vekt: 22.8}, {navn: 'Industrials', vekt: 16.0}, {navn: 'Healthcare', vekt: 14.6},
        {navn: 'Financial Services', vekt: 11.8}, {navn: 'Basic Materials', vekt: 9.7}, {navn: 'Consumer Cyclical', vekt: 5.9},
        {navn: 'Communication Services', vekt: 5.1}, {navn: 'Utilities', vekt: 2.6}, {navn: 'Energy', vekt: 2.0},
        {navn: 'Consumer Defensive', vekt: 2.0}
      ],
      stil: [
        {navn: 'Large Value', vekt: 11.1}, {navn: 'Large Core', vekt: 24.7}, {navn: 'Large Growth', vekt: 12.8},
        {navn: 'Mid Value', vekt: 8.0}, {navn: 'Mid Core', vekt: 8.0}, {navn: 'Mid Growth', vekt: 6.8},
        {navn: 'Small Value', vekt: 10.5}, {navn: 'Small Core', vekt: 13.2}, {navn: 'Small Growth', vekt: 4.9}
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
      regioner: [
        {navn: 'United States', vekt: 34.0}, {navn: 'Norway', vekt: 13.7}, {navn: 'Sweden', vekt: 7.7},
        {navn: 'United Kingdom', vekt: 4.6}, {navn: 'Switzerland', vekt: 4.1}, {navn: 'China', vekt: 3.4},
        {navn: 'Japan', vekt: 3.2}, {navn: 'Taiwan', vekt: 2.1}, {navn: 'South Korea', vekt: 2.1},
        {navn: 'Germany', vekt: 2.0}, {navn: 'Other', vekt: 23.1}
      ],
      sektorer: [
        {navn: 'Industrials', vekt: 19.0}, {navn: 'Technology', vekt: 15.4}, {navn: 'Financial Services', vekt: 14.4},
        {navn: 'Consumer Cyclical', vekt: 13.4}, {navn: 'Healthcare', vekt: 12.7}, {navn: 'Real Estate', vekt: 4.3},
        {navn: 'Consumer Defensive', vekt: 4.2}, {navn: 'Communication Services', vekt: 5.3},
        {navn: 'Basic Materials', vekt: 2.7}, {navn: 'Energy', vekt: 3.2}, {navn: 'Other', vekt: 5.4}
      ],
      stil: [
        {navn: 'Large Value', vekt: 44.5}, {navn: 'Large Core', vekt: 21.3}, {navn: 'Large Growth', vekt: 9.2},
        {navn: 'Mid Value', vekt: 4.5}, {navn: 'Mid Core', vekt: 5.2}, {navn: 'Mid Growth', vekt: 4.3},
        {navn: 'Small Value', vekt: 0.8}, {navn: 'Small Core', vekt: 10.2}, {navn: 'Small Growth', vekt: 0.0}
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
      regioner: [
        {navn: 'United States', vekt: 33.6}, {navn: 'Norway', vekt: 30.5}, {navn: 'United Kingdom', vekt: 7.8},
        {navn: 'Canada', vekt: 9.7}, {navn: 'Denmark', vekt: 3.0}, {navn: 'France', vekt: 2.9},
        {navn: 'Japan', vekt: 2.0}, {navn: 'Pakistan', vekt: 1.9}, {navn: 'China', vekt: 0.9},
        {navn: 'Other', vekt: 7.7}
      ],
      sektorer: [
        {navn: 'Energy', vekt: 84.3}, {navn: 'Industrials', vekt: 5.5}, {navn: 'Technology', vekt: 3.8},
        {navn: 'Basic Materials', vekt: 3.0}, {navn: 'Consumer Cyclical', vekt: 1.0}, {navn: 'Financial Services', vekt: 0.7},
        {navn: 'Real Estate', vekt: 0.6}, {navn: 'Consumer Defensive', vekt: 0.5}, {navn: 'Healthcare', vekt: 0.3},
        {navn: 'Other', vekt: 0.3}
      ],
      stil: [
        {navn: 'Large Value', vekt: 28.7}, {navn: 'Large Core', vekt: 9.0}, {navn: 'Large Growth', vekt: 2.5},
        {navn: 'Mid Value', vekt: 24.7}, {navn: 'Mid Core', vekt: 6.5}, {navn: 'Mid Growth', vekt: 0.0},
        {navn: 'Small Value', vekt: 10.8}, {navn: 'Small Core', vekt: 10.8}, {navn: 'Small Growth', vekt: 3.7}
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
      regioner: [
        {navn: 'Norway', vekt: 66.6}, {navn: 'Sweden', vekt: 26.5}, {navn: 'Denmark', vekt: 6.0},
        {navn: 'Other', vekt: 0.9}
      ],
      sektorer: [
        {navn: 'Financial Services', vekt: 100.0}
      ],
      stil: [
        {navn: 'Large Value', vekt: 56.3}, {navn: 'Mid Value', vekt: 15.0}, {navn: 'Small Value', vekt: 28.6},
        {navn: 'Small Core', vekt: 0.1}
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
      regioner: [
        {navn: 'Norway', vekt: 91.2}, {navn: 'Singapore', vekt: 2.7}, {navn: 'Greece', vekt: 3.0},
        {navn: 'United States', vekt: 2.5}, {navn: 'Netherlands', vekt: 1.1}
      ],
      sektorer: [
        {navn: 'Industrials', vekt: 28.2}, {navn: 'Financial Services', vekt: 27.9}, {navn: 'Consumer Defensive', vekt: 13.7},
        {navn: 'Consumer Cyclical', vekt: 8.0}, {navn: 'Energy', vekt: 6.6}, {navn: 'Communication Services', vekt: 4.2},
        {navn: 'Technology', vekt: 3.9}, {navn: 'Real Estate', vekt: 3.5}, {navn: 'Utilities', vekt: 2.1},
        {navn: 'Basic Materials', vekt: 1.9}
      ],
      stil: [
        {navn: 'Large Value', vekt: 11.8}, {navn: 'Large Core', vekt: 0.0}, {navn: 'Large Growth', vekt: 8.2},
        {navn: 'Mid Value', vekt: 9.2}, {navn: 'Mid Core', vekt: 17.5}, {navn: 'Mid Growth', vekt: 13.4},
        {navn: 'Small Value', vekt: 10.6}, {navn: 'Small Core', vekt: 25.3}, {navn: 'Small Growth', vekt: 9.2}
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



export const defaultProduktRapportMeta = {
  'global-core-active': {
    slideTitle: 'Global kjerneeksponering',
    slideSubtitle: 'Bred global aksjeportefølje med aktiv fondsseleksjon',
    role: 'Kjernebyggestein i aksjedelen',
    benchmark: 'MSCI World / bred global aksjereferanse',
    expectedReturn: 10.0,
    expectedYield: 1.8,
    pitch: 'Gir bred global aksjeeksponering og fungerer som hovedmotor i porteføljens aksjedel.',
    caseText: 'Kombinerer kvalitet, geografi og forvalterdiversifisering i én samlet løsning.',
    whyIncluded: 'Passer godt som basiseksponering når målet er robust global allokering over tid.',
    riskText: 'Verdien vil svinge med globale aksjemarkeder og valutautvikling.',
    diagramType: 'region-sector',
    slideCount: 2,
    category: 'equity-core'
  },
  'global-edge': {
    slideTitle: 'Global offensiv satellitt',
    slideSubtitle: 'Mer aktiv og spisset global aksjeløsning',
    role: 'Satellitt for meravkastning i aksjedelen',
    benchmark: 'Global aktiv aksjereferanse',
    expectedReturn: 10.5,
    expectedYield: 1.2,
    pitch: 'Supplerer kjerneporteføljen med mer konsentrerte og aktive globale idéer.',
    caseText: 'Brukes når man ønsker høyere aktiv andel og flere tydelige forvalterbets.',
    whyIncluded: 'Kan øke diversifiseringen på forvalterstil og gi meravkastningspotensial.',
    riskText: 'Høyere stil- og faktoravvik enn brede globale indekser.',
    diagramType: 'region-sector',
    slideCount: 2,
    category: 'equity-satellite'
  },
  basis: {
    slideTitle: 'Balansert totalportefølje',
    slideSubtitle: 'Kombinasjon av aksjer og renter i én løsning',
    role: 'Helhetlig blandet byggestein',
    benchmark: 'Blandet referanse / 50-50 aksjer-renter',
    expectedReturn: 8.0,
    expectedYield: 3.4,
    pitch: 'Gir en ferdig sammensatt blanding av aksjer, renter og utvalgte spesialmandater.',
    caseText: 'Egnet når man ønsker en enkel, balansert løsning med moderat risikonivå.',
    whyIncluded: 'Kan fungere som selvstendig løsning eller som stabil kjerne i en bredere portefølje.',
    riskText: 'Lavere forventet avkastning enn rene aksjeløsninger, men også lavere svingninger.',
    diagramType: 'underlying',
    slideCount: 2,
    category: 'balanced'
  },
  'global-hoyrente': {
    slideTitle: 'Global rente- og kontantstrømmotor',
    slideSubtitle: 'Seleksjon av globale high yield- og kredittfond',
    role: 'Rentedel med fokus på løpende avkastning',
    benchmark: 'Global high yield / kredittreferanse',
    expectedReturn: 7.5,
    expectedYield: 7.0,
    pitch: 'Skal bidra med løpende renteinntekter og lavere volatilitet enn aksjer.',
    caseText: 'Bygger robusthet i porteføljen og gir kontantstrøm i et mer defensivt segment.',
    whyIncluded: 'Passer som stabilisator mot aksjer og som bærer av løpende yield.',
    riskText: 'Kredittrisiko og spreadutvidelser kan gi kursfall i stressperioder.',
    diagramType: 'underlying',
    slideCount: 2,
    category: 'fixed-income'
  },
  'nordisk-hoyrente': {
    slideTitle: 'Nordisk høyrente',
    slideSubtitle: 'Kredittportefølje med nordisk fokus',
    role: 'Regional rentedel med løpende avkastning',
    benchmark: 'Nordisk high yield / kredittreferanse',
    expectedReturn: 7.5,
    expectedYield: 7.2,
    pitch: 'Gir eksponering mot nordisk kredittmarked gjennom utvalgte fond.',
    caseText: 'Egnet når man ønsker mer regional kredittkompetanse og løpende yield.',
    whyIncluded: 'Kan være et godt supplement til globale renteløsninger.',
    riskText: 'Likviditet og kredittspread kan påvirke avkastningen i urolige perioder.',
    diagramType: 'underlying',
    slideCount: 2,
    category: 'fixed-income'
  },
  'norge-a': {
    slideTitle: 'Norske aksjer',
    slideSubtitle: 'Aktivt norsk aksjefond',
    role: 'Hjemmemarkeds- og stock-picking-eksponering',
    benchmark: 'OSEBX / norsk aksjereferanse',
    expectedReturn: 11.0,
    expectedYield: 3.0,
    pitch: 'Gir aktiv eksponering mot norske børsnoterte selskaper og sektorer.',
    caseText: 'Brukes for å utnytte lokal markedskunnskap og tilføre tydelige norske idéer.',
    whyIncluded: 'Kan gi god diversifisering relativt til globale porteføljer og passer godt i NOK-porteføljer.',
    riskText: 'Mer konsentrert marked og høyere sektoravhengighet enn global eksponering.',
    diagramType: 'underlying',
    slideCount: 2,
    category: 'equity-nordic'
  },
  'energy-a': {
    slideTitle: 'Tematisk energi-eksponering',
    slideSubtitle: 'Konsentrert energirelatert mandat',
    role: 'Tematisk satellitt',
    benchmark: 'Energi-/råvareorientert aksjereferanse',
    expectedReturn: 11.0,
    expectedYield: 3.5,
    pitch: 'Gir målrettet eksponering mot energi, råvarer og tilhørende verdikjeder.',
    caseText: 'Kan bidra med meravkastningspotensial når energisektoren er attraktivt priset.',
    whyIncluded: 'Passer som mindre satellittandel i en bredere portefølje.',
    riskText: 'Kan svinge betydelig og er sensitiv for råvarepriser og geopolitikk.',
    diagramType: 'underlying',
    slideCount: 2,
    category: 'equity-thematic'
  },
  'banking-d': {
    slideTitle: 'Nordisk banksektor',
    slideSubtitle: 'Sektorspesialist mot banker og finans',
    role: 'Sektorsatellitt',
    benchmark: 'Nordisk bank-/finansreferanse',
    expectedReturn: 12.0,
    expectedYield: 5.0,
    pitch: 'Gir eksponering mot nordiske banker og finansinstitusjoner med tydelig sektorvinkel.',
    caseText: 'Kan brukes når man ønsker særskilt eksponering mot en sektor med attraktive utbytter og soliditet.',
    whyIncluded: 'Gir en mer spesialisert og målrettet eksponering enn brede nordiske aksjefond.',
    riskText: 'Sektorkonsentrasjon og regulatoriske endringer kan gi høy volatilitet.',
    diagramType: 'underlying',
    slideCount: 2,
    category: 'equity-sector'
  },
  'financial-d': {
    slideTitle: 'Finansiell kredittspesialist',
    slideSubtitle: 'Rente-/kredittmandat med finanssektor som fokus',
    role: 'Spesialist i rentedelen',
    benchmark: 'Finansiell kreditt / high yield referanse',
    expectedReturn: 9.0,
    expectedYield: 8.0,
    pitch: 'Gir målrettet kreditt- og renteeksponering mot finansrelaterte utstedere.',
    caseText: 'Kan bidra med attraktiv løpende avkastning fra et avgrenset og analysekrevende segment.',
    whyIncluded: 'Passer som supplement i rentedelen for å øke spesialisering og yield.',
    riskText: 'Kredittevent, likviditet og sektorspesifikk risiko kan påvirke utviklingen.',
    diagramType: 'underlying',
    slideCount: 2,
    category: 'fixed-income-specialist'
  }
};
