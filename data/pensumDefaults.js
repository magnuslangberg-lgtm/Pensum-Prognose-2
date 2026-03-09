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


const defaultProduktRapportinnhold = {
  'global-core-active': {
    slideTittel: 'Pensum Global Core Active',
    slideUndertittel: 'Global kjerneeksponering',
    rollePortefolje: 'Kjernebyggestein i aksjedelen',
    benchmark: 'MSCI World',
    risikoNivaa: 'Moderat til høy',
    forventetAvkastning: 9.0,
    forventetYield: 2.0,
    pitchKort: 'Global kjerneportefølje med bred diversifisering på tvers av regioner og forvalterstiler.',
    investeringscase: 'Løsningen er bygget for å være hovedmotoren i aksjeeksponeringen og gi robust, langsiktig avkastning med bred global spredning.',
    hvorforInkludert: 'Gir global eksponering og forankrer porteføljen i en bred, disiplinert aksjestrategi.',
    nokkelRisiko: 'Generell markedsrisiko og perioder med svak global aksjeutvikling.',
    diagramType: 'regioner',
    antallProduktslides: 2
  },
  'global-edge': {
    slideTittel: 'Pensum Global Edge',
    slideUndertittel: 'Global satellitt og spesialistforvaltning',
    rollePortefolje: 'Satellitt i aksjedelen',
    benchmark: 'MSCI ACWI',
    risikoNivaa: 'Høy',
    forventetAvkastning: 10.0,
    forventetYield: 1.5,
    pitchKort: 'Mer opportunistisk global aksjeløsning med større innslag av spesialister, småselskaper og tematiske ideer.',
    investeringscase: 'Målet er å løfte forventet meravkastning gjennom spesialiserte forvaltere og mindre konsensuspreget eksponering.',
    hvorforInkludert: 'Bidrar med meravkastningspotensial og bredere stilspredning enn en ren global kjerneportefølje.',
    nokkelRisiko: 'Større svingninger, høyere aktiv risiko og større følsomhet for små-/mellomstore selskaper.',
    diagramType: 'stil',
    antallProduktslides: 1
  },
  'basis': {
    slideTittel: 'Pensum Basis',
    slideUndertittel: 'Balansert totalportefølje',
    rollePortefolje: 'Balansert multi-asset-byggestein',
    benchmark: 'Sammensatt referanseindeks',
    risikoNivaa: 'Moderat',
    forventetAvkastning: 7.0,
    forventetYield: 3.5,
    pitchKort: 'Kombinerer aksjer, renter og selekterte enkeltcase i én helhetlig løsning.',
    investeringscase: 'Gir en ferdig diversifisert løsning med god balanse mellom avkastningsmuligheter og robusthet.',
    hvorforInkludert: 'Passer når man ønsker en effektiv og balansert kjerne i porteføljen.',
    nokkelRisiko: 'Både aksje- og renterisiko, men lavere svingninger enn rene aksjeporteføljer.',
    diagramType: 'underliggende',
    antallProduktslides: 1
  },
  'global-hoyrente': {
    slideTittel: 'Pensum Global Høyrente',
    slideUndertittel: 'Global rente- og kontantstrømmotor',
    rollePortefolje: 'Hovedbyggestein i rentedelen',
    benchmark: 'Global High Yield hedget NOK',
    risikoNivaa: 'Moderat',
    forventetAvkastning: 7.5,
    forventetYield: 7.0,
    pitchKort: 'Diversifisert høyrenteportefølje med mål om attraktiv løpende yield og moderat volatilitet.',
    investeringscase: 'Løsningen skal gi løpende kontantstrøm og bedre robusthet enn aksjer i perioder med markedsuro.',
    hvorforInkludert: 'Styrker porteføljens løpende avkastning og demper total volatilitet.',
    nokkelRisiko: 'Kredittrisiko og perioder med svakhet i globale kredittmarkeder.',
    diagramType: 'underliggende',
    antallProduktslides: 1
  },
  'nordisk-hoyrente': {
    slideTittel: 'Pensum Nordisk Høyrente',
    slideUndertittel: 'Nordisk kredittspesialist',
    rollePortefolje: 'Supplerende rentedel',
    benchmark: 'Nordic HY',
    risikoNivaa: 'Moderat',
    forventetAvkastning: 7.0,
    forventetYield: 6.5,
    pitchKort: 'Konsentrert nordisk kredittløsning med fokus på løpende avkastning og lokal markedsforståelse.',
    investeringscase: 'Gir spesialisert nordisk kreditt-eksponering og øker diversifiseringen innen rentedelen.',
    hvorforInkludert: 'Kan gi attraktiv løpende yield med annen sammensetning enn global kreditt.',
    nokkelRisiko: 'Kredittrisiko og relativt konsentrert nordisk marked.',
    diagramType: 'underliggende',
    antallProduktslides: 1
  },
  'norge-a': {
    slideTittel: 'Pensum Norge A',
    slideUndertittel: 'Aktiv norsk aksjeforvaltning',
    rollePortefolje: 'Hjemmemarkeds-eksponering',
    benchmark: 'OSEFX',
    risikoNivaa: 'Høy',
    forventetAvkastning: 10.0,
    forventetYield: 3.0,
    pitchKort: 'Aktiv norsk aksjeløsning med fokus på de mest attraktive idéene i hjemmemarkedet.',
    investeringscase: 'Gir målrettet eksponering mot norske kvalitets- og verdicaser, inkludert finans og energi.',
    hvorforInkludert: 'Bidrar med lokalkunnskap og eksponering mot det norske markedet.',
    nokkelRisiko: 'Selskaps- og sektor-konsentrasjon i et relativt smalt marked.',
    diagramType: 'underliggende',
    antallProduktslides: 1
  },
  'energy-a': {
    slideTittel: 'Pensum Global Energy A',
    slideUndertittel: 'Tematisk energi-eksponering',
    rollePortefolje: 'Tematisk satellitt',
    benchmark: 'MSCI World Energy',
    risikoNivaa: 'Høy',
    forventetAvkastning: 11.0,
    forventetYield: 4.0,
    pitchKort: 'Tematisk mandat med eksponering mot energisektoren globalt og i Norge.',
    investeringscase: 'Løsningen brukes for å hente ut meravkastning i en sektor med sterk kontantstrøm og betydelig syklikalitet.',
    hvorforInkludert: 'Gir tematisk diversifisering og eksponering mot en sektor med attraktiv kontantstrøm.',
    nokkelRisiko: 'Høy sektor- og råvaresensitivitet.',
    diagramType: 'underliggende',
    antallProduktslides: 1
  },
  'banking-d': {
    slideTittel: 'Pensum Nordic Banking Sector D',
    slideUndertittel: 'Nordisk bankspesialist',
    rollePortefolje: 'Sektorspesialist i aksjedelen',
    benchmark: 'Nordic Banks Index',
    risikoNivaa: 'Høy',
    forventetAvkastning: 10.5,
    forventetYield: 5.0,
    pitchKort: 'Sektorstrategi med fokus på nordiske banker og finansinstitusjoner.',
    investeringscase: 'Nordiske banker kombinerer sterke balanser, attraktiv utbyttekapasitet og ofte moderate multipler.',
    hvorforInkludert: 'Gir målrettet eksponering mot en attraktiv nordisk sektor med god lønnsomhet.',
    nokkelRisiko: 'Sektor- og regulatorisk risiko, samt følsomhet for rente- og kredittsyklus.',
    diagramType: 'underliggende',
    antallProduktslides: 1
  },
  'financial-d': {
    slideTittel: 'Pensum Financial Opportunities',
    slideUndertittel: 'Spesialisert finans- og kredittløsning',
    rollePortefolje: 'Alternativ rente-/kredittmotor',
    benchmark: 'Bloomberg Global HY hedged NOK',
    risikoNivaa: 'Moderat til høy',
    forventetAvkastning: 8.5,
    forventetYield: 8.0,
    pitchKort: 'Spesialisert strategi med eksponering mot finansrelatert kreditt og opportunistiske case.',
    investeringscase: 'Gir tilgang til nisjer i finans- og kredittmarkedet som kan gi attraktiv risikojustert avkastning.',
    hvorforInkludert: 'Supplerer tradisjonell rentedel med annen kilde til løpende avkastning.',
    nokkelRisiko: 'Kredittrisiko, likviditetsrisiko og case-spesifikk risiko.',
    diagramType: 'underliggende',
    antallProduktslides: 1
  }
};

const withReportDefaults = (produkt) => ({
  ...defaultProduktRapportinnhold[produkt.id],
  ...produkt,
});

export const defaultPensumProdukterMedRapport = {
  enkeltfond: defaultPensumProdukter.enkeltfond.map(withReportDefaults),
  fondsportefoljer: defaultPensumProdukter.fondsportefoljer.map(withReportDefaults),
  alternative: defaultPensumProdukter.alternative.map(withReportDefaults)
};
