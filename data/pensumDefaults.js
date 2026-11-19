// Kostnader (andelsklasser, lopendeKostnad) er hentet fra offentlige kilder november 2026:
// Pensums månedsrapporter og fondssider, FCG Fonders informasjonsbrosjyrer og fondenes faktaark.
// Pensums egne fond: klasse A 1,25 %, klasse D 0,75 % fra 10 mill. Mandatene: kostnad i underliggende fond.
// Mandatene: Global Core Active 0,8 %, Global Edge 0,8 %, Global Høyrente 0,5 %, Nordisk Høyrente 0,5 % (Edge og
// Nordisk Høyrente bekreftet av forvalter 16.11.2026). Tallene er vektede snitt og endres når fondssammensetningen endres.
// Tallene er estimater og bør bekreftes mot gjeldende prisliste. `honorar: false` = ingen tjenestekostnad i tillegg.
// Forventet avkastning er basert på CMA-metodikk (BlackRock, Vanguard, J.P. Morgan + nordisk overlay).
// Se uploads/CMA_metodikk_oppdatert 14.10.2026.docx for full metodikk.
// Volatilitet (forventet risiko) angir illustrativ årlig standardavvik.
export const PENSUM_SELSKAPSNOEKKELTALL = {
  ansatte: '43',
  forvaltningskapital: 'NOK 14,0 Mrd',
  forvaltningskapitalKort: 'NOK 14,0',
  vekstForvaltningskapital: '29,0%',
  vekstInntekter: '16,9%',
};

export const defaultPensumProdukter = {
    enkeltfond: [
      { id: 'norge-a', honorar: false, andelsklasser: [{ klasse: 'A', minBelop: 0, lopendeKostnad: 1.25 }, { klasse: 'D', minBelop: 10000000, lopendeKostnad: 0.75 }], suksesshonorar: '20 % av meravkastning mot referanseindeks', valuta: 'NOK', navn: 'Pensum Norge A', aktivatype: 'aksje', likviditet: 'likvid', rolle: 'spisset', aar2026: 19.3, aar2025: 21.5, aar2024: 12.5, aar2023: 13.2, aar2022: 5.0, forventetAvkastning: 10.0, forventetRisiko: 19.0, forventetYield: 3.0, aarlig3ar: 15.7, risiko3ar: 4.1 },
      { id: 'energy-a', honorar: false, andelsklasser: [{ klasse: 'A', minBelop: 0, lopendeKostnad: 1.25 }], suksesshonorar: '20 % av meravkastning mot referanseindeks', valuta: 'NOK', navn: 'Pensum Global Energy A', aktivatype: 'aksje', likviditet: 'likvid', rolle: 'spisset', aar2026: 45.2, aar2025: 7.3, aar2024: -1.0, aar2023: 11.0, aar2022: 55.5, forventetAvkastning: 9.5, forventetRisiko: 22.0, forventetYield: 3.5, aarlig3ar: 5.6, risiko3ar: 5.0 },
      { id: 'banking-d', honorar: false, andelsklasser: [{ klasse: 'A', minBelop: 0, lopendeKostnad: 1.25 }, { klasse: 'D', minBelop: 10000000, lopendeKostnad: 0.75 }], suksesshonorar: '20 % av meravkastning mot referanseindeks', valuta: 'NOK', navn: 'Pensum Nordic Banking Sector D', aktivatype: 'aksje', likviditet: 'likvid', rolle: 'spisset', aar2026: 8.9, aar2025: 26.6, aar2024: 24.9, aar2023: 17.5, aar2022: -8.4, forventetAvkastning: 9.5, forventetRisiko: 18.0, forventetYield: 5.0, aarlig3ar: 22.9, risiko3ar: 4.0 },
      { id: 'financial-d', honorar: false, andelsklasser: [{ klasse: 'A', minBelop: 0, lopendeKostnad: 1.25 }, { klasse: 'D', minBelop: 10000000, lopendeKostnad: 0.75 }], suksesshonorar: '20 % av meravkastning mot referanseindeks', valuta: 'NOK', navn: 'Pensum Financial Opportunity Fund D', aktivatype: 'rente', likviditet: 'likvid', rolle: 'spisset', aar2026: 2.7, aar2025: 9.4, aar2024: 9.8, aar2023: 11.3, aar2022: -12.6, forventetAvkastning: 8.0, forventetRisiko: 10.0, forventetYield: 8.0, aarlig3ar: 10.2, risiko3ar: 0.8 },
      { id: 'kairos-a', honorar: false, andelsklasser: [{ klasse: 'A', minBelop: 0, lopendeKostnad: 1.25 }, { klasse: 'D', minBelop: 10000000, lopendeKostnad: 0.75 }], suksesshonorar: '20 % av meravkastning mot referanseindeks', valuta: 'NOK', navn: 'Pensum Kairos A', aktivatype: 'aksje', likviditet: 'likvid', rolle: 'spisset', aar2026: null, aar2025: null, aar2024: null, aar2023: null, aar2022: null, forventetAvkastning: 9.5, forventetRisiko: 20.0, forventetYield: 1.0, aarlig3ar: null, risiko3ar: null, kortHistorikk: true },
      // Diskresjonært forvaltede norske aksjeporteføljer (enkeltaksjer, ikke fond). Tall fra datafeed per 31.10.2026.
      // Forventet avkastning, risiko og yield er samme CMA-forutsetning som for Pensum Norge A, til de er bekreftet.
      // Kostnad i fond er ikke oppgitt (enkeltaksjer): Pensums honorar for mandater gjelder.
      { id: 'norske-aksjer-utbytte', mandat: true, valuta: 'NOK', navn: 'Pensum Norske Aksjer Utbytte', aktivatype: 'aksje', likviditet: 'likvid', rolle: 'spisset', aar2026: 16.9, aar2025: 25.0, aar2024: 13.6, aar2023: 7.5, aar2022: 6.0, forventetAvkastning: 10.0, forventetRisiko: 19.0, forventetYield: 3.0, aarlig3ar: 18.5, risiko3ar: 11.4 },
      { id: 'norske-aksjer-vekst', mandat: true, valuta: 'NOK', navn: 'Pensum Norske Aksjer Vekst', aktivatype: 'aksje', likviditet: 'likvid', rolle: 'spisset', aar2026: 36.5, aar2025: 25.6, aar2024: 2.8, aar2023: 24.8, aar2022: 2.9, forventetAvkastning: 10.0, forventetRisiko: 19.0, forventetYield: 3.0, aarlig3ar: 18.3, risiko3ar: 17.2 }
    ],
    fondsportefoljer: [
      { id: 'global-core-active', lopendeKostnad: 0.8, valuta: 'NOK', navn: 'Pensum Global Core Active', aktivatype: 'aksje', likviditet: 'likvid', rolle: 'kjerne', aar2026: -0.5, aar2025: 8.0, aar2024: 31.8, aar2023: 25.6, aar2022: -7.2, forventetAvkastning: 8.5, forventetRisiko: 16.0, forventetYield: 1.8, aarlig3ar: 21.4, risiko3ar: 10.1 },
      { id: 'global-edge', lopendeKostnad: 0.8, suksesshonorar: '20 % av avkastning over MSCI ACWI All Cap NR, beregnet kvartalsvis', valuta: 'NOK', navn: 'Pensum Global Edge', aktivatype: 'aksje', likviditet: 'likvid', rolle: 'kjerne', aar2026: -3.0, aar2025: 14.1, aar2024: 26.8, aar2023: 23.6, aar2022: -6.3, forventetAvkastning: 9.0, forventetRisiko: 17.0, forventetYield: 1.2, aarlig3ar: 21.4, risiko3ar: 5.4 },
      { id: 'basis', valuta: 'NOK', navn: 'Pensum Basis', aktivatype: 'dynamisk', likviditet: 'likvid', rolle: 'kjerne', aar2026: 1.3, aar2025: 5.0, aar2024: 13.3, aar2023: 12.9, aar2022: -2.1, forventetAvkastning: 7.5, forventetRisiko: 9.0, forventetYield: 3.4, aarlig3ar: 10.3, risiko3ar: 3.8 },
      { id: 'global-hoyrente', lopendeKostnad: 0.5, valuta: 'NOK', navn: 'Pensum Global Høyrente', aktivatype: 'rente', likviditet: 'likvid', rolle: 'kjerne', aar2026: 1.8, aar2025: 6.2, aar2024: 6.5, aar2023: 7.9, aar2022: -5.1, forventetAvkastning: 7.7, forventetRisiko: 10.0, forventetYield: 7.0, aarlig3ar: 6.8, risiko3ar: 0.8 },
      { id: 'nordisk-hoyrente', lopendeKostnad: 0.5, valuta: 'NOK', navn: 'Pensum Nordisk Høyrente', aktivatype: 'rente', likviditet: 'likvid', rolle: 'spisset', aar2026: 3.7, aar2025: 6.5, aar2024: 9.1, aar2023: 11.3, aar2022: 4.7, forventetAvkastning: 8.0, forventetRisiko: 12.0, forventetYield: 7.2, aarlig3ar: 9.0, risiko3ar: 2.0 }
    ],
    eksterneFond: [
      { id: 'acadian-global-equity', lopendeKostnad: 0.87, valuta: 'EUR', navn: 'Acadian Global Equity UCITS A EUR', aktivatype: 'aksje', likviditet: 'likvid', rolle: 'kjerne', aar2026: 26.4, aar2025: 2.6, aar2024: 32.3, aar2023: 21.5, aar2022: -13.4, forventetAvkastning: 8.5, forventetRisiko: 16.0, forventetYield: 1.5, aarlig3ar: 18.1, risiko3ar: 12.3 },
      { id: 'capital-group-new-pers', lopendeKostnad: 0.84, valuta: 'USD', navn: 'Capital Group New Pers (LUX) Z', aktivatype: 'aksje', likviditet: 'likvid', rolle: 'kjerne', aar2026: 3.3, aar2025: 20.5, aar2024: 16.1, aar2023: 24.2, aar2022: -26.2, forventetAvkastning: 8.5, forventetRisiko: 17.0, forventetYield: 1.0, aarlig3ar: 20.2, risiko3ar: 3.3 },
      { id: 'dnb-global-enhanced', lopendeKostnad: 0.2, valuta: 'NOK', navn: 'DNB Global Enhanced Index A', aktivatype: 'aksje', likviditet: 'likvid', rolle: 'kjerne', aar2026: 1.3, aar2025: 7.9, aar2024: 33.7, aar2023: null, aar2022: null, forventetAvkastning: 8.5, forventetRisiko: 16.0, forventetYield: 1.5, aarlig3ar: null, risiko3ar: null, kortHistorikk: true },
      { id: 'guinness-global-equity-income', lopendeKostnad: 0.77, valuta: 'EUR', navn: 'Guinness Global Equity Income Y EUR Acc', aktivatype: 'aksje', likviditet: 'likvid', rolle: 'kjerne', aar2026: 18.9, aar2025: -1.8, aar2024: 20.1, aar2023: 11.9, aar2022: -3.4, forventetAvkastning: 8.5, forventetRisiko: 15.0, forventetYield: 2.5, aarlig3ar: 9.7, risiko3ar: 9.0 },
      { id: 'janus-henderson-glb-sc', lopendeKostnad: 1.12, valuta: 'USD', navn: 'Janus Henderson Hrzn Glb SC IU2 USD', aktivatype: 'aksje', likviditet: 'likvid', rolle: 'spisset', aar2026: 8.3, aar2025: 26.1, aar2024: 19.7, aar2023: 27.3, aar2022: -19.0, forventetAvkastning: 9.5, forventetRisiko: 20.0, forventetYield: 0.8, aarlig3ar: 24.3, risiko3ar: 3.3 },
      // Kontanter og pengemarked: CMA-forutsetning "Kontanter / pengemarked" (4,5 % / 1 %).
      { id: 'kontanter-bank', gruppe: 'kontanter', valuta: 'NOK', navn: 'Bankinnskudd', aktivatype: 'kontanter', likviditet: 'likvid', rolle: 'kjerne', aar2026: null, aar2025: null, aar2024: null, aar2023: null, aar2022: null, forventetAvkastning: 4.5, forventetRisiko: 1.0, forventetYield: 4.5, aarlig3ar: null, risiko3ar: null, kortHistorikk: true },
      { id: 'pengemarkedsfond', gruppe: 'kontanter', valuta: 'NOK', navn: 'Pengemarkedsfond', aktivatype: 'kontanter', likviditet: 'likvid', rolle: 'kjerne', aar2026: null, aar2025: null, aar2024: null, aar2023: null, aar2022: null, forventetAvkastning: 4.5, forventetRisiko: 1.0, forventetYield: 4.5, aarlig3ar: null, risiko3ar: null, kortHistorikk: true },
      // Gull: J.P. Morgan 2027 LTCMA (USD): forventet avkastning 5,5 %, volatilitet 17,2 %. Ingen løpende yield.
      { id: 'gull', gruppe: 'kontanter', valuta: 'USD', navn: 'Gull', aktivatype: 'alternativ', likviditet: 'likvid', rolle: 'spisset', aar2026: null, aar2025: null, aar2024: null, aar2023: null, aar2022: null, forventetAvkastning: 5.5, forventetRisiko: 17.2, forventetYield: 0, aarlig3ar: null, risiko3ar: null, kortHistorikk: true }
    ],
    alternative: [
      { id: 'turnstone-pe', honorar: false, lopendeKostnad: 1.0, valuta: 'EUR', navn: 'Turnstone Private Equity', aktivatype: 'alternativ', likviditet: 'illikvid', rolle: 'spisset', aar2026: null, aar2025: null, aar2024: null, aar2023: null, aar2022: null, forventetAvkastning: 11.0, forventetRisiko: 25.0, forventetYield: 0, aarlig3ar: null, risiko3ar: null },
      { id: 'amaron-re', honorar: false, lopendeKostnad: 0.85, suksesshonorar: '20 % ved exit over 5 % terskel', valuta: 'SEK', navn: 'Amaron Real Estate', aktivatype: 'alternativ', likviditet: 'illikvid', rolle: 'spisset', aar2026: null, aar2025: null, aar2024: null, aar2023: null, aar2022: null, forventetAvkastning: 7.7, forventetRisiko: 11.0, forventetYield: 4.0, aarlig3ar: null, risiko3ar: null },
      { id: 'unoterte-aksjer', valuta: 'NOK', navn: 'Unoterte aksjer', aktivatype: 'alternativ', likviditet: 'illikvid', rolle: 'spisset', aar2026: null, aar2025: null, aar2024: null, aar2023: null, aar2022: null, forventetAvkastning: 10.0, forventetRisiko: 22.0, forventetYield: 0, aarlig3ar: null, risiko3ar: null }
    ]
  };

// Definerte porteføljer fra "Skisse ulike eksempelporteføljer.xlsx"
// 4 portefølje-typer × 3 allokerings-varianter (Kjerne, Blandet, Spisset)
export const defaultPensumStandardLosninger = {
  '100% Aksjer': {
    beskrivelse: 'Ren aksjeportefølje med fokus på vekst og langsiktig avkastning',
    allokeringer: {
      'Allokering 1 (Kjerne)': [
        { id: 'global-core-active', vekt: 40, kategori: 'fondsportefoljer' },
        { id: 'global-edge', vekt: 40, kategori: 'fondsportefoljer' },
        { id: 'norge-a', vekt: 20, kategori: 'enkeltfond' }
      ],
      'Allokering 2 (Blandet)': [
        { id: 'global-core-active', vekt: 30, kategori: 'fondsportefoljer' },
        { id: 'global-edge', vekt: 30, kategori: 'fondsportefoljer' },
        { id: 'kairos-a', vekt: 10, kategori: 'enkeltfond' },
        { id: 'norge-a', vekt: 15, kategori: 'enkeltfond' },
        { id: 'energy-a', vekt: 5, kategori: 'enkeltfond' },
        { id: 'banking-d', vekt: 10, kategori: 'enkeltfond' }
      ],
      'Allokering 3 (Spisset)': [
        { id: 'global-core-active', vekt: 20, kategori: 'fondsportefoljer' },
        { id: 'global-edge', vekt: 20, kategori: 'fondsportefoljer' },
        { id: 'kairos-a', vekt: 20, kategori: 'enkeltfond' },
        { id: 'norge-a', vekt: 15, kategori: 'enkeltfond' },
        { id: 'energy-a', vekt: 10, kategori: 'enkeltfond' },
        { id: 'banking-d', vekt: 15, kategori: 'enkeltfond' }
      ]
    }
  },
  '70/30 med basis': {
    beskrivelse: 'Balansert med Pensum Basis som grunnmur. 70% aksjeeksponering, 30% renter',
    allokeringer: {
      'Allokering 1 (Kjerne)': [
        { id: 'basis', vekt: 40, kategori: 'fondsportefoljer' },
        { id: 'global-core-active', vekt: 17.5, kategori: 'fondsportefoljer' },
        { id: 'global-edge', vekt: 17.5, kategori: 'fondsportefoljer' },
        { id: 'global-hoyrente', vekt: 10, kategori: 'fondsportefoljer' },
        { id: 'norge-a', vekt: 15, kategori: 'enkeltfond' }
      ],
      'Allokering 2 (Blandet)': [
        { id: 'basis', vekt: 30, kategori: 'fondsportefoljer' },
        { id: 'global-core-active', vekt: 10, kategori: 'fondsportefoljer' },
        { id: 'global-edge', vekt: 10, kategori: 'fondsportefoljer' },
        { id: 'global-hoyrente', vekt: 10, kategori: 'fondsportefoljer' },
        { id: 'kairos-a', vekt: 5, kategori: 'enkeltfond' },
        { id: 'norge-a', vekt: 15, kategori: 'enkeltfond' },
        { id: 'energy-a', vekt: 5, kategori: 'enkeltfond' },
        { id: 'banking-d', vekt: 5, kategori: 'enkeltfond' },
        { id: 'nordisk-hoyrente', vekt: 5, kategori: 'fondsportefoljer' },
        { id: 'financial-d', vekt: 5, kategori: 'enkeltfond' }
      ],
      'Allokering 3 (Spisset)': [
        { id: 'basis', vekt: 20, kategori: 'fondsportefoljer' },
        { id: 'global-core-active', vekt: 10, kategori: 'fondsportefoljer' },
        { id: 'global-edge', vekt: 10, kategori: 'fondsportefoljer' },
        { id: 'global-hoyrente', vekt: 5, kategori: 'fondsportefoljer' },
        { id: 'kairos-a', vekt: 10, kategori: 'enkeltfond' },
        { id: 'norge-a', vekt: 10, kategori: 'enkeltfond' },
        { id: 'energy-a', vekt: 10, kategori: 'enkeltfond' },
        { id: 'banking-d', vekt: 10, kategori: 'enkeltfond' },
        { id: 'nordisk-hoyrente', vekt: 5, kategori: 'fondsportefoljer' },
        { id: 'financial-d', vekt: 10, kategori: 'enkeltfond' }
      ]
    }
  },
  '70/30 uten basis': {
    beskrivelse: '70% aksjer, 30% renter uten Pensum Basis. Direkte bygging av aksje- og rentedelen',
    allokeringer: {
      'Allokering 1 (Kjerne)': [
        { id: 'global-core-active', vekt: 27.5, kategori: 'fondsportefoljer' },
        { id: 'global-edge', vekt: 27.5, kategori: 'fondsportefoljer' },
        { id: 'global-hoyrente', vekt: 30, kategori: 'fondsportefoljer' },
        { id: 'norge-a', vekt: 15, kategori: 'enkeltfond' }
      ],
      'Allokering 2 (Blandet)': [
        { id: 'global-core-active', vekt: 17.5, kategori: 'fondsportefoljer' },
        { id: 'global-edge', vekt: 17.5, kategori: 'fondsportefoljer' },
        { id: 'global-hoyrente', vekt: 20, kategori: 'fondsportefoljer' },
        { id: 'kairos-a', vekt: 5, kategori: 'enkeltfond' },
        { id: 'norge-a', vekt: 15, kategori: 'enkeltfond' },
        { id: 'energy-a', vekt: 5, kategori: 'enkeltfond' },
        { id: 'banking-d', vekt: 10, kategori: 'enkeltfond' },
        { id: 'financial-d', vekt: 10, kategori: 'enkeltfond' }
      ],
      'Allokering 3 (Spisset)': [
        { id: 'global-core-active', vekt: 15, kategori: 'fondsportefoljer' },
        { id: 'global-edge', vekt: 15, kategori: 'fondsportefoljer' },
        { id: 'global-hoyrente', vekt: 10, kategori: 'fondsportefoljer' },
        { id: 'kairos-a', vekt: 10, kategori: 'enkeltfond' },
        { id: 'norge-a', vekt: 10, kategori: 'enkeltfond' },
        { id: 'energy-a', vekt: 10, kategori: 'enkeltfond' },
        { id: 'banking-d', vekt: 10, kategori: 'enkeltfond' },
        { id: 'nordisk-hoyrente', vekt: 10, kategori: 'fondsportefoljer' },
        { id: 'financial-d', vekt: 10, kategori: 'enkeltfond' }
      ]
    }
  },
  '50/50 med basis': {
    beskrivelse: 'Balansert med Pensum Basis. 50% aksjer, 50% renter',
    allokeringer: {
      'Allokering 1 (Kjerne)': [
        { id: 'basis', vekt: 30, kategori: 'fondsportefoljer' },
        { id: 'global-core-active', vekt: 12.5, kategori: 'fondsportefoljer' },
        { id: 'global-edge', vekt: 12.5, kategori: 'fondsportefoljer' },
        { id: 'global-hoyrente', vekt: 35, kategori: 'fondsportefoljer' },
        { id: 'norge-a', vekt: 10, kategori: 'enkeltfond' }
      ],
      'Allokering 2 (Blandet)': [
        { id: 'basis', vekt: 20, kategori: 'fondsportefoljer' },
        { id: 'global-core-active', vekt: 10, kategori: 'fondsportefoljer' },
        { id: 'global-edge', vekt: 10, kategori: 'fondsportefoljer' },
        { id: 'global-hoyrente', vekt: 25, kategori: 'fondsportefoljer' },
        { id: 'kairos-a', vekt: 5, kategori: 'enkeltfond' },
        { id: 'norge-a', vekt: 10, kategori: 'enkeltfond' },
        { id: 'energy-a', vekt: 5, kategori: 'enkeltfond' },
        { id: 'nordisk-hoyrente', vekt: 10, kategori: 'fondsportefoljer' },
        { id: 'financial-d', vekt: 5, kategori: 'enkeltfond' }
      ],
      'Allokering 3 (Spisset)': [
        { id: 'basis', vekt: 10, kategori: 'fondsportefoljer' },
        { id: 'global-core-active', vekt: 7.5, kategori: 'fondsportefoljer' },
        { id: 'global-edge', vekt: 7.5, kategori: 'fondsportefoljer' },
        { id: 'global-hoyrente', vekt: 20, kategori: 'fondsportefoljer' },
        { id: 'kairos-a', vekt: 7.5, kategori: 'enkeltfond' },
        { id: 'norge-a', vekt: 10, kategori: 'enkeltfond' },
        { id: 'energy-a', vekt: 7.5, kategori: 'enkeltfond' },
        { id: 'banking-d', vekt: 5, kategori: 'enkeltfond' },
        { id: 'nordisk-hoyrente', vekt: 15, kategori: 'fondsportefoljer' },
        { id: 'financial-d', vekt: 10, kategori: 'enkeltfond' }
      ]
    }
  },
  '50/50 uten basis': {
    beskrivelse: '50% aksjer, 50% renter uten Pensum Basis',
    allokeringer: {
      'Allokering 1 (Kjerne)': [
        { id: 'global-core-active', vekt: 22.5, kategori: 'fondsportefoljer' },
        { id: 'global-edge', vekt: 17.5, kategori: 'fondsportefoljer' },
        { id: 'global-hoyrente', vekt: 40, kategori: 'fondsportefoljer' },
        { id: 'norge-a', vekt: 10, kategori: 'enkeltfond' },
        { id: 'nordisk-hoyrente', vekt: 10, kategori: 'fondsportefoljer' }
      ],
      'Allokering 2 (Blandet)': [
        { id: 'global-core-active', vekt: 15, kategori: 'fondsportefoljer' },
        { id: 'global-edge', vekt: 15, kategori: 'fondsportefoljer' },
        { id: 'global-hoyrente', vekt: 30, kategori: 'fondsportefoljer' },
        { id: 'kairos-a', vekt: 5, kategori: 'enkeltfond' },
        { id: 'norge-a', vekt: 10, kategori: 'enkeltfond' },
        { id: 'banking-d', vekt: 5, kategori: 'enkeltfond' },
        { id: 'nordisk-hoyrente', vekt: 10, kategori: 'fondsportefoljer' },
        { id: 'financial-d', vekt: 10, kategori: 'enkeltfond' }
      ],
      'Allokering 3 (Spisset)': [
        { id: 'global-core-active', vekt: 10, kategori: 'fondsportefoljer' },
        { id: 'global-edge', vekt: 10, kategori: 'fondsportefoljer' },
        { id: 'global-hoyrente', vekt: 25, kategori: 'fondsportefoljer' },
        { id: 'kairos-a', vekt: 7.5, kategori: 'enkeltfond' },
        { id: 'norge-a', vekt: 10, kategori: 'enkeltfond' },
        { id: 'energy-a', vekt: 7.5, kategori: 'enkeltfond' },
        { id: 'banking-d', vekt: 5, kategori: 'enkeltfond' },
        { id: 'nordisk-hoyrente', vekt: 15, kategori: 'fondsportefoljer' },
        { id: 'financial-d', vekt: 10, kategori: 'enkeltfond' }
      ]
    }
  },
  '30/70 med basis': {
    beskrivelse: 'Konservativ med Pensum Basis. 30% aksjer, 70% renter',
    allokeringer: {
      'Allokering 1 (Kjerne)': [
        { id: 'basis', vekt: 25, kategori: 'fondsportefoljer' },
        { id: 'global-core-active', vekt: 7.5, kategori: 'fondsportefoljer' },
        { id: 'global-edge', vekt: 7.5, kategori: 'fondsportefoljer' },
        { id: 'global-hoyrente', vekt: 50, kategori: 'fondsportefoljer' },
        { id: 'norge-a', vekt: 10, kategori: 'enkeltfond' }
      ],
      'Allokering 2 (Blandet)': [
        { id: 'basis', vekt: 15, kategori: 'fondsportefoljer' },
        { id: 'global-core-active', vekt: 7.5, kategori: 'fondsportefoljer' },
        { id: 'global-edge', vekt: 7.5, kategori: 'fondsportefoljer' },
        { id: 'global-hoyrente', vekt: 35, kategori: 'fondsportefoljer' },
        { id: 'kairos-a', vekt: 2.5, kategori: 'enkeltfond' },
        { id: 'norge-a', vekt: 7.5, kategori: 'enkeltfond' },
        { id: 'nordisk-hoyrente', vekt: 15, kategori: 'fondsportefoljer' },
        { id: 'financial-d', vekt: 10, kategori: 'enkeltfond' }
      ],
      'Allokering 3 (Spisset)': [
        { id: 'basis', vekt: 10, kategori: 'fondsportefoljer' },
        { id: 'global-core-active', vekt: 5, kategori: 'fondsportefoljer' },
        { id: 'global-edge', vekt: 5, kategori: 'fondsportefoljer' },
        { id: 'global-hoyrente', vekt: 30, kategori: 'fondsportefoljer' },
        { id: 'kairos-a', vekt: 5, kategori: 'enkeltfond' },
        { id: 'norge-a', vekt: 5, kategori: 'enkeltfond' },
        { id: 'energy-a', vekt: 5, kategori: 'enkeltfond' },
        { id: 'banking-d', vekt: 5, kategori: 'enkeltfond' },
        { id: 'nordisk-hoyrente', vekt: 20, kategori: 'fondsportefoljer' },
        { id: 'financial-d', vekt: 10, kategori: 'enkeltfond' }
      ]
    }
  },
  '30/70 uten basis': {
    beskrivelse: '30% aksjer, 70% renter uten Pensum Basis',
    allokeringer: {
      'Allokering 1 (Kjerne)': [
        { id: 'global-core-active', vekt: 12.5, kategori: 'fondsportefoljer' },
        { id: 'global-edge', vekt: 12.5, kategori: 'fondsportefoljer' },
        { id: 'global-hoyrente', vekt: 60, kategori: 'fondsportefoljer' },
        { id: 'norge-a', vekt: 5, kategori: 'enkeltfond' },
        { id: 'nordisk-hoyrente', vekt: 10, kategori: 'fondsportefoljer' }
      ],
      'Allokering 2 (Blandet)': [
        { id: 'global-core-active', vekt: 10, kategori: 'fondsportefoljer' },
        { id: 'global-edge', vekt: 10, kategori: 'fondsportefoljer' },
        { id: 'global-hoyrente', vekt: 40, kategori: 'fondsportefoljer' },
        { id: 'kairos-a', vekt: 2.5, kategori: 'enkeltfond' },
        { id: 'norge-a', vekt: 5, kategori: 'enkeltfond' },
        { id: 'banking-d', vekt: 2.5, kategori: 'enkeltfond' },
        { id: 'nordisk-hoyrente', vekt: 20, kategori: 'fondsportefoljer' },
        { id: 'financial-d', vekt: 10, kategori: 'enkeltfond' }
      ],
      'Allokering 3 (Spisset)': [
        { id: 'global-core-active', vekt: 5, kategori: 'fondsportefoljer' },
        { id: 'global-edge', vekt: 5, kategori: 'fondsportefoljer' },
        { id: 'global-hoyrente', vekt: 30, kategori: 'fondsportefoljer' },
        { id: 'kairos-a', vekt: 5, kategori: 'enkeltfond' },
        { id: 'norge-a', vekt: 5, kategori: 'enkeltfond' },
        { id: 'energy-a', vekt: 5, kategori: 'enkeltfond' },
        { id: 'banking-d', vekt: 5, kategori: 'enkeltfond' },
        { id: 'nordisk-hoyrente', vekt: 25, kategori: 'fondsportefoljer' },
        { id: 'financial-d', vekt: 15, kategori: 'enkeltfond' }
      ]
    }
  }
};

// Beskrivelser av produktroller (kjerne vs spisset)
export const produktBeskrivelser = {
  'basis': { rolle: 'Kjerne', kategoriBeskrivelse: 'Helhetlig portefølje', beskrivelse: 'Grunnmur i en helhetlig forvaltet portefølje. Diversifisert eksponering mot ulike typer rentefond, aksjefond og i tillegg et knippe norske enkeltaksjer.' },
  'global-core-active': { rolle: 'Kjerne', kategoriBeskrivelse: 'Globale aksjer', beskrivelse: 'Kjerneeksponering mot globale aksjer. Bred eksponering mot det globale aksjemarkedet. Porteføljen består av aktivt forvaltede fond som i stor grad investerer i store kvalitetsselskaper. Sektor og regionseksponering ligner indekssammensetningen.' },
  'global-edge': { rolle: 'Kjerne', kategoriBeskrivelse: 'Globale aksjer', beskrivelse: 'Kjerneeksponering mot globale aksjer gjennom 8–12 aktivt forvaltede fond fra spesialiserte forvaltere. Porteføljen dekker alle regioner, sektorer og stilarter, med en tilt mot mindre selskaper og smalere investeringsunivers der forvalterne har spisskompetanse. Kan brukes som hele den globale aksjedelen eller som supplement til en bredere global kjerne. Eksponeringen kan avvike fra verdensindeksen.' },
  'global-hoyrente': { rolle: 'Kjerne', kategoriBeskrivelse: 'Globale renter', beskrivelse: 'Kjerneeksponering innen rentefond. Porteføljen består av bred eksponering mot det globale rentemarkedet. Brorparten av kapitalen er plassert i høyrenteobligasjoner, men det er også oftest innslag av investment grade.' },
  'norske-aksjer-utbytte': { rolle: 'Spisset', kategoriBeskrivelse: 'Norske aksjer', beskrivelse: 'Spisset eksponering. Diskresjonært forvaltet portefølje av norske enkeltaksjer, med vekt på selskaper som betaler utbytte. Konsentrert, med stor vekt på finans og energi.' },
  'norske-aksjer-vekst': { rolle: 'Spisset', kategoriBeskrivelse: 'Norske aksjer', beskrivelse: 'Spisset eksponering. Diskresjonært forvaltet portefølje av norske enkeltaksjer, med vekt på vekst. Konsentrert, med stor vekt på industri (blant annet shipping) og energi.' },
  'norge-a': { rolle: 'Spisset', kategoriBeskrivelse: 'Norske aksjer', beskrivelse: 'Spisset eksponering. Fondet investerer i norske enkeltaksjer, med en tilt mot utbyttebetalende kvalitetsselskaper.' },
  'kairos-a': { rolle: 'Spisset', kategoriBeskrivelse: 'Globale, tematiske aksjer', beskrivelse: 'Spisset eksponering. Fondet investerer i enkeltaksjer innen utvalgte aktuelle tema, eksempler kan være energi, forsvar, AI osv.' },
  'energy-a': { rolle: 'Spisset', kategoriBeskrivelse: 'Globale energiaksjer', beskrivelse: 'Spisset eksponering. Fondet investerer i globale energiselskaper og kan investere i både fossil og fornybar energi.' },
  'banking-d': { rolle: 'Spisset', kategoriBeskrivelse: 'Nordisk banksektor', beskrivelse: 'Spisset eksponering. Fondet investerer i den nordiske banksektoren og plasserer midler i både aksjer og obligasjoner.' },
  'nordisk-hoyrente': { rolle: 'Spisset', kategoriBeskrivelse: 'Nordiske høyrenteobligasjoner', beskrivelse: 'Spisset eksponering. Portefølje av rentefond, hovedsakelig nordisk høyrente, men kan også plassere kapital i sikrere IG papirer. Relativt kort rentedurasjon.' },
  'financial-d': { rolle: 'Spisset', kategoriBeskrivelse: 'Europeiske bankobligasjoner', beskrivelse: 'Spisset eksponering. Fondet investerer i renteinstrumenter utstedt av europeiske banker og andre finansinstitusjoner, med hovedvekt på såkalt hybridkapital, også kjent som CoCos (contingent convertibles).' }
};

export const defaultProduktEksponering = {
    'global-core-active': {
      underliggende: [
        {navn: 'AB Select US Equity S1 USD', vekt: 20.4},
        {navn: 'Capital Group InvCoAmer (LUX) A4', vekt: 19.7},
        {navn: 'Acadian Global Equity UCITS A EUR', vekt: 13.4},
        {navn: 'Guinness Global Equity Income Y EUR Acc', vekt: 10.7},
        {navn: 'Capital Group New Pers (LUX) Z L', vekt: 9.9},
        {navn: 'Acadian Emerg Mkts Eq II C USD Ins Acc', vekt: 9.5},
        {navn: 'DNB Teknologi A', vekt: 6.5},
        {navn: 'BGF European Value D2', vekt: 5},
        {navn: 'JPM Japan Strategic Value C acc JPY', vekt: 5}
      ],
      regioner: [
        {navn: 'United States', vekt: 65}, {navn: 'Japan', vekt: 6.3}, {navn: 'Taiwan', vekt: 4.3},
        {navn: 'United Kingdom', vekt: 2.8}, {navn: 'South Korea', vekt: 2.7}, {navn: 'China', vekt: 2.7},
        {navn: 'Switzerland', vekt: 2.4}, {navn: 'France', vekt: 2.2}, {navn: 'Germany', vekt: 1.6},
        {navn: 'Netherlands', vekt: 1.5}, {navn: 'Other', vekt: 8.5}
      ],
      sektorer: [
        {navn: 'Technology', vekt: 34.5}, {navn: 'Financial Services', vekt: 15.2}, {navn: 'Healthcare', vekt: 10.4},
        {navn: 'Industrials', vekt: 10.3}, {navn: 'Communication Services', vekt: 8.4}, {navn: 'Consumer Cyclical', vekt: 8},
        {navn: 'Consumer Defensive', vekt: 5.3}, {navn: 'Energy', vekt: 3.9}, {navn: 'Basic Materials', vekt: 2},
        {navn: 'Utilities', vekt: 1.4}, {navn: 'Other', vekt: 0.7}
      ],
      stil: [
        {navn: 'Large Value', vekt: 24.8}, {navn: 'Large Core', vekt: 37}, {navn: 'Large Growth', vekt: 19.5},
        {navn: 'Mid Value', vekt: 4.3}, {navn: 'Mid Core', vekt: 7.8}, {navn: 'Mid Growth', vekt: 3.1},
        {navn: 'Small Value', vekt: 1.1}, {navn: 'Small Core', vekt: 1.6}, {navn: 'Small Growth', vekt: 0.7}
      ],
      disclaimer: 'Oppstart 01.01.2026. Historikk er estimert med den samme allokeringen som i oppstartsporteføljene bakover i tid. Eksponeringsdata per 31.10.2026.'
    },
    'global-edge': {
      underliggende: [
        {navn: 'Janus Henderson Hrzn Glb SC IU2 USD', vekt: 16.1},
        {navn: 'DNB Teknologi A', vekt: 15.3},
        {navn: 'Capital Group InvCoAmer (LUX) Z', vekt: 11.3},
        {navn: 'Arctic Aurora LifeScience I', vekt: 8.7},
        {navn: 'Acadian Emerg Mkts Eq II C USD Ins Acc', vekt: 8.4},
        {navn: 'PineBridge India Equity Y', vekt: 8.1},
        {navn: 'ORIGO SELEQT A', vekt: 7.4},
        {navn: 'Granahan US Focused Growth A USD Acc', vekt: 6.9},
        {navn: 'Guinness Sustainable Energy Y USD Acc', vekt: 6.2},
        {navn: 'FIRST Impact', vekt: 5.9},
        {navn: 'Bakersteel Glb Fds SICAV- Elctm I USD', vekt: 5.6}
      ],
      regioner: [
        {navn: 'United States', vekt: 49.6}, {navn: 'India', vekt: 8.4}, {navn: 'Sweden', vekt: 6.6},
        {navn: 'Japan', vekt: 4.3}, {navn: 'China', vekt: 4.2}, {navn: 'Canada', vekt: 3.5},
        {navn: 'Taiwan', vekt: 2.7}, {navn: 'South Korea', vekt: 2.5}, {navn: 'Denmark', vekt: 2.4},
        {navn: 'France', vekt: 2.2}, {navn: 'Other', vekt: 13.6}
      ],
      sektorer: [
        {navn: 'Technology', vekt: 26.8}, {navn: 'Healthcare', vekt: 15.1}, {navn: 'Industrials', vekt: 14.6},
        {navn: 'Financial Services', vekt: 11.8}, {navn: 'Consumer Cyclical', vekt: 9.9}, {navn: 'Basic Materials', vekt: 7.6},
        {navn: 'Communication Services', vekt: 6.9}, {navn: 'Energy', vekt: 2.5}, {navn: 'Utilities', vekt: 2.4},
        {navn: 'Consumer Defensive', vekt: 1.4}, {navn: 'Other', vekt: 1}
      ],
      stil: [
        {navn: 'Large Value', vekt: 12.6}, {navn: 'Large Core', vekt: 20}, {navn: 'Large Growth', vekt: 12.6},
        {navn: 'Mid Value', vekt: 4}, {navn: 'Mid Core', vekt: 8.7}, {navn: 'Mid Growth', vekt: 8.3},
        {navn: 'Small Value', vekt: 5.4}, {navn: 'Small Core', vekt: 15.3}, {navn: 'Small Growth', vekt: 13}
      ],
      disclaimer: 'Oppstart 01.01.2026. Historikk er estimert med den samme allokeringen som i oppstartsporteføljene bakover i tid. Eksponeringsdata per 09.11.2026.'
    },
    'basis': {
      underliggende: [
        {navn: 'Arctic Nordic Corporate Bond Class D', vekt: 19.3},
        {navn: 'Arctic Return Class I', vekt: 15.3},
        {navn: 'Acadian Global Equity UCITS A EUR', vekt: 12.4},
        {navn: 'KLP Obligasjon Global S', vekt: 9.8},
        {navn: 'Guinness Global Equity Income Y EUR Acc', vekt: 8.5},
        {navn: 'Acadian Emerg Mkts Eq II C USD Ins Acc', vekt: 7.2},
        {navn: 'Janus Henderson Hrzn Glb SC IU2 USD', vekt: 5.7},
        {navn: 'DNB Teknologi A', vekt: 4.2},
        {navn: 'ORIGO SELEQT A', vekt: 3.9},
        {navn: 'JPM Japan Strategic Value C acc JPY', vekt: 3.9},
        {navn: 'Sentia ASA Registered Shares', vekt: 3.8},
        {navn: 'AutoStore Holdings Ltd Ordinary Shares', vekt: 3.2},
        {navn: 'Scatec ASA Ordinary Shares', vekt: 2.7}
      ],
      regioner: [
        {navn: 'United States', vekt: 37.2}, {navn: 'Norway', vekt: 18.2}, {navn: 'Japan', vekt: 8.9},
        {navn: 'Sweden', vekt: 6.2}, {navn: 'Taiwan', vekt: 4.6}, {navn: 'China', vekt: 3.6},
        {navn: 'South Korea', vekt: 3.1}, {navn: 'Switzerland', vekt: 2.8}, {navn: 'United Kingdom', vekt: 2.1},
        {navn: 'France', vekt: 1.6}, {navn: 'Other', vekt: 11.7}
      ],
      sektorer: [
        {navn: 'Technology', vekt: 26.2}, {navn: 'Industrials', vekt: 23.3}, {navn: 'Financial Services', vekt: 12.5},
        {navn: 'Healthcare', vekt: 9.6}, {navn: 'Consumer Cyclical', vekt: 7}, {navn: 'Communication Services', vekt: 5.3},
        {navn: 'Consumer Defensive', vekt: 5.1}, {navn: 'Utilities', vekt: 5}, {navn: 'Energy', vekt: 3.3},
        {navn: 'Basic Materials', vekt: 1.8}, {navn: 'Other', vekt: 0.8}
      ],
      stil: [
        {navn: 'Large Value', vekt: 18.1}, {navn: 'Large Core', vekt: 23.7}, {navn: 'Large Growth', vekt: 11.6},
        {navn: 'Mid Value', vekt: 4.2}, {navn: 'Mid Core', vekt: 8}, {navn: 'Mid Growth', vekt: 11},
        {navn: 'Small Value', vekt: 3.2}, {navn: 'Small Core', vekt: 15.1}, {navn: 'Small Growth', vekt: 4.9}
      ],
      disclaimer: 'Avkastning før oppstart 12. september 2023 er estimert med en lignende portefølje med 50% rentefond og 50% aksjer. Eksponeringsdata per 31.10.2026.'
    },
    'global-hoyrente': {
      underliggende: [
        {navn: 'Arctic Nordic Corporate Bond Class D', vekt: 30.3},
        {navn: 'Barings Global High Yield Bd I NOK Acc', vekt: 23.2},
        {navn: 'Storm Bond ICN NOK', vekt: 16.2},
        {navn: 'BlueBay Global High Yield Bd I NOK', vekt: 15.2},
        {navn: 'KLP Obligasjon Global S', vekt: 15.2}
      ],
      disclaimer: 'Eksponeringsdata per 31.10.2026.'
    },
    'nordisk-hoyrente': {
      underliggende: [
        {navn: 'Arctic Nordic Corporate Bond Class D', vekt: 33.9},
        {navn: 'Storm Bond ICN NOK', vekt: 33.7},
        {navn: 'Alfred Berg Nordic HY C (NOK)', vekt: 32.4}
      ],
      disclaimer: 'Oppstart februar 2024. Utvikling før dette er estimert med underliggende fonds utvikling før oppstart. Eksponeringsdata per 31.10.2026.'
    },
    'energy-a': {
      underliggende: [
        {navn: 'ExxonMobil Holdings Corp', vekt: 8},
        {navn: 'Equinor ASA', vekt: 7.9},
        {navn: 'Var Energi ASA', vekt: 7.7},
        {navn: 'Chevron Corp', vekt: 6.1},
        {navn: 'Shell PLC', vekt: 4.9},
        {navn: 'Harbour Energy PLC', vekt: 4.1},
        {navn: 'Aker BP ASA', vekt: 4},
        {navn: 'Cheniere Energy Inc', vekt: 3.6},
        {navn: 'DNO ASA', vekt: 3.3},
        {navn: 'ConocoPhillips', vekt: 3.2},
        {navn: 'TotalEnergies SE', vekt: 3.1},
        {navn: 'Canadian Natural Resources Ltd', vekt: 3},
        {navn: 'International Petroleum Corp', vekt: 2.6},
        {navn: 'EOG Resources Inc', vekt: 2.5},
        {navn: 'Valero Energy Corp', vekt: 2.5},
        {navn: 'BP PLC', vekt: 2.5},
        {navn: 'Eni SpA', vekt: 2.3},
        {navn: 'Marathon Petroleum Corp', vekt: 2.2},
        {navn: 'Occidental Petroleum Corp', vekt: 2},
        {navn: 'Frontline PLC', vekt: 1.9},
        {navn: 'Okeanis Eco Tankers Corp', vekt: 1.5},
        {navn: 'Hafnia Ltd Ordinary Shares', vekt: 1.5},
        {navn: 'Devon Energy Corp', vekt: 1.4},
        {navn: 'Subsea 7 SA', vekt: 1.4},
        {navn: 'DOF Group ASA', vekt: 1.3},
        {navn: 'Williams Companies Inc', vekt: 1.3},
        {navn: 'Valaris Ltd', vekt: 1.2},
        {navn: 'Noble Corp PLC Class A', vekt: 1.1},
        {navn: 'Okea ASA', vekt: 1},
        {navn: 'TGS ASA', vekt: 1},
        {navn: 'Repsol SA', vekt: 1},
        {navn: 'Vestas Wind Systems AS', vekt: 1},
        {navn: 'SLB Ltd', vekt: 1},
        {navn: 'Iberdrola SA', vekt: 0.9},
        {navn: 'Cenovus Energy Inc', vekt: 0.9},
        {navn: 'Gulf Keystone Petroleum Ltd', vekt: 0.9},
        {navn: 'ABB Ltd', vekt: 0.9},
        {navn: 'Nextpower Inc', vekt: 0.9},
        {navn: 'First Solar Inc', vekt: 0.9},
        {navn: 'Baker Hughes Co Class A', vekt: 0.8},
        {navn: 'Other', vekt: 0.8}
      ],
      regioner: [
        {navn: 'United States', vekt: 38.2}, {navn: 'Norway', vekt: 27.6}, {navn: 'United Kingdom', vekt: 12.3},
        {navn: 'Canada', vekt: 6.5}, {navn: 'France', vekt: 3.1}, {navn: 'Italy', vekt: 2.3},
        {navn: 'Other Countries', vekt: 1.9}, {navn: 'Spain', vekt: 1.9}, {navn: 'Greece', vekt: 1.5},
        {navn: 'Singapore', vekt: 1.5}, {navn: 'Brazil', vekt: 1.2}, {navn: 'Denmark', vekt: 1},
        {navn: 'Switzerland', vekt: 0.9}
      ],
      sektorer: [
        {navn: 'Energy', vekt: 90.3}, {navn: 'Industrials', vekt: 7}, {navn: 'Technology', vekt: 1.8},
        {navn: 'Utilities', vekt: 0.9}
      ],
      stil: [
        {navn: 'Large Value', vekt: 43.1}, {navn: 'Large Core', vekt: 10.3}, {navn: 'Large Growth', vekt: 2.9},
        {navn: 'Mid Value', vekt: 13.7}, {navn: 'Mid Core', vekt: 8.7}, {navn: 'Mid Growth', vekt: 10.5},
        {navn: 'Small Value', vekt: 6.5}, {navn: 'Small Core', vekt: 3.3}, {navn: 'Small Growth', vekt: 0.9}
      ],
      disclaimer: 'Avkastning før oppstart desember 2022 er estimert med et lignende diskresjonært mandat forvaltet av samme forvalter. Eksponeringsdata per 31.10.2026.'
    },
    'banking-d': {
      underliggende: [
        {navn: 'DNB Bank ASA', vekt: 16.5},
        {navn: 'SpareBank 1 SMN Depository Receipts', vekt: 15.3},
        {navn: 'Sparebanken Norge Depository Receipts', vekt: 8.7},
        {navn: 'SpareBank 1 Sor Norge ASA', vekt: 8.2},
        {navn: 'Nordea Bank Abp', vekt: 8.1},
        {navn: 'Sparebank 1 Sorost-Norge', vekt: 4.9},
        {navn: 'Danske Bank AS', vekt: 4.7},
        {navn: 'SpareBank 1 Nord-Norge Depository Receipts', vekt: 4.1},
        {navn: 'Sparebanken More', vekt: 3.7},
        {navn: 'SpareBank 1 Ostlandet Depository Receipts', vekt: 2.4},
        {navn: 'Sparebank 1 Ostiold Akershus Depository Receipts', vekt: 2.4},
        {navn: 'Pareto Bank ASA', vekt: 2.1},
        {navn: 'Sparebank 1 Sogn Og Fjordane', vekt: 2},
        {navn: 'SpareBank 1 Ostlandet', vekt: 1.3},
        {navn: 'Sparebanken Norge AS', vekt: 1.2},
        {navn: 'Haugesund Sparebank', vekt: 1.2},
        {navn: 'SpareBank 1 Ringerike Hadeland', vekt: 1.2},
        {navn: 'SpareBank 1 Nord-Norge', vekt: 1.2},
        {navn: 'Sparebank 1 Sorost-Norge', vekt: 1.2},
        {navn: 'Sparebanken Ost', vekt: 1.2},
        {navn: 'Sparebanken Ost', vekt: 1.2},
        {navn: 'Morrow Bank AB', vekt: 1.1},
        {navn: 'NOBA Bank Group AB (publ)', vekt: 1.1},
        {navn: 'Rogaland Sparebank', vekt: 1},
        {navn: 'SpareBank 1 Ringerike Hadeland', vekt: 1},
        {navn: 'Swedbank AB Class A', vekt: 0.9},
        {navn: 'SpareBank 1 Helgeland Depository Receipts', vekt: 0.6},
        {navn: 'Sparebanken Øst Depository Receipts', vekt: 0.5},
        {navn: 'Skandinaviska Enskilda Banken AB Class A', vekt: 0.5},
        {navn: 'SpareBank 1 Nordmore Depository Receipts', vekt: 0.3},
        {navn: 'Enity Holding AB', vekt: 0}
      ],
      regioner: [
        {navn: 'Norway', vekt: 80.2}, {navn: 'Sweden', vekt: 13.7}, {navn: 'Denmark', vekt: 6.1}
      ],
      sektorer: [
        {navn: 'Financial Services', vekt: 100}
      ],
      stil: [
        {navn: 'Large Value', vekt: 40.2}, {navn: 'Mid Value', vekt: 31.4}, {navn: 'Mid Core', vekt: 10.7},
        {navn: 'Small Value', vekt: 4.7}, {navn: 'Small Core', vekt: 11.6}, {navn: 'Small Growth', vekt: 1.4}
      ],
      disclaimer: 'Oppstart 29. januar 2025. Utvikling før dette er estimert med det lignende mandatet Pensum Sparebank+. Eksponeringsdata per 31.10.2026.'
    },
    'norge-a': {
      underliggende: [
        {navn: 'DNB Bank ASA', vekt: 7.2},
        {navn: 'Equinor ASA', vekt: 5.6},
        {navn: 'Aker ASA Class A', vekt: 5.2},
        {navn: 'Kongsberg Gruppen ASA', vekt: 5},
        {navn: 'Protector Forsikring ASA', vekt: 4.5},
        {navn: 'Storebrand ASA', vekt: 4.3},
        {navn: 'Mowi ASA', vekt: 4.3},
        {navn: 'AutoStore Holdings Ltd Ordinary Shares', vekt: 4.1},
        {navn: 'Capital Tankers Corp', vekt: 4},
        {navn: 'Volare Shipping Ltd', vekt: 3.8},
        {navn: 'Odtiell Drilling Ltd', vekt: 3.7},
        {navn: 'Klaveness Combination Carriers ASA', vekt: 3.2},
        {navn: 'Endur ASA', vekt: 3.1},
        {navn: 'Nordic Semiconductor ASA', vekt: 3},
        {navn: 'DOF Group ASA', vekt: 2.9},
        {navn: 'Gjensidige Forsikring ASA', vekt: 2.9},
        {navn: 'SpareBank 1 Sor Norge ASA', vekt: 2.9},
        {navn: 'Hafnia Ltd Ordinary Shares', vekt: 2.8},
        {navn: 'SpareBank 1 SMN Depository Receipts', vekt: 2.7},
        {navn: 'BW LPG Ltd', vekt: 2.6},
        {navn: 'Sentia ASA Registered Shares', vekt: 2.6},
        {navn: 'SATS ASA Ordinary Shares', vekt: 2.5},
        {navn: 'Scatec ASA Ordinary Shares', vekt: 2.4},
        {navn: 'Europris ASA', vekt: 2.2},
        {navn: 'Okeanis Eco Tankers Corp', vekt: 2.1},
        {navn: 'SalMar ASA', vekt: 1.9},
        {navn: 'Smartoptics Group ASA Ordinary Shares', vekt: 1.9},
        {navn: 'ABG Sundal Collier Holding ASA', vekt: 1.5},
        {navn: 'Paratus Energy Services Ltd', vekt: 1.4},
        {navn: 'PPI Public Property Invest AB', vekt: 1.3},
        {navn: 'Kongsberg Maritime ASA', vekt: 1},
        {navn: 'B2 Impact ASA', vekt: 0.8},
        {navn: 'Dellia Group ASA Ordinary Shares', vekt: 0.7}
      ],
      regioner: [
        {navn: 'Norway', vekt: 82}, {navn: 'Singapore', vekt: 9.2}, {navn: 'Greece', vekt: 6.1},
        {navn: 'Mexico', vekt: 1.4}, {navn: 'Sweden', vekt: 1.3}
      ],
      sektorer: [
        {navn: 'Industrials', vekt: 39.8}, {navn: 'Financial Services', vekt: 26.8}, {navn: 'Energy', vekt: 13.2},
        {navn: 'Consumer Defensive', vekt: 9.1}, {navn: 'Technology', vekt: 4.8}, {navn: 'Consumer Cyclical', vekt: 2.5},
        {navn: 'Utilities', vekt: 2.4}, {navn: 'Real Estate', vekt: 1.3}
      ],
      stil: [
        {navn: 'Large Value', vekt: 14.3}, {navn: 'Large Core', vekt: 5.5}, {navn: 'Mid Value', vekt: 12},
        {navn: 'Mid Core', vekt: 24.4}, {navn: 'Mid Growth', vekt: 16.3}, {navn: 'Small Value', vekt: 1.6},
        {navn: 'Small Core', vekt: 18.1}, {navn: 'Small Growth', vekt: 7.9}
      ],
      disclaimer: 'Oppstart 27. november 2023. Utvikling før dette er estimert med lignende porteføljer. Eksponeringsdata per 31.10.2026.'
    },
    'financial-d': {
      underliggende: [
        {navn: 'IuteCredit Finance S.a r.l.', vekt: 33.4},
        {navn: 'Worldline SA', vekt: 17.8},
        {navn: 'Eleving Group SA', vekt: 15.4},
        {navn: 'Stichting AK Rabobank Certiﬁcaten', vekt: 14.9},
        {navn: 'Multitude Capital Oyj', vekt: 8.8},
        {navn: 'Sherwood Financing PLC', vekt: 5.6},
        {navn: 'Mogoﬁ 9 10/15/32', vekt: 4.1}
      ],
      disclaimer: 'Oppstart 05.04.2025. Utvikling før dette er estimert med indeksen Bloomberg Global High Yield, valutasikret til NOK. Eksponeringsdata per 31.10.2026.'
    },
    'kairos-a': {
      underliggende: [
        {navn: 'Caterpillar Inc', vekt: 3.5},
        {navn: 'Alphabet Inc Class A', vekt: 3.5},
        {navn: 'Baker Hughes Co Class A', vekt: 3.4},
        {navn: 'Scorpio Tankers Inc', vekt: 3.3},
        {navn: 'ABB Ltd', vekt: 3.2},
        {navn: 'Kurita Water Industries Ltd', vekt: 3.2},
        {navn: 'Micron Technology Inc', vekt: 3.2},
        {navn: 'TotalEnergies SE', vekt: 3.1},
        {navn: 'Eni SpA', vekt: 3.1},
        {navn: 'Taiwan Semiconductor Manufacturing Co Ltd ADR', vekt: 3.1},
        {navn: 'Acciona SA', vekt: 3.1},
        {navn: 'Schneider Electric SE', vekt: 3},
        {navn: 'ASML Holding NV', vekt: 3},
        {navn: 'Companhia De Saneamento Basico Do Estado De Sao Paulo ADR', vekt: 3},
        {navn: 'Teradyne Inc', vekt: 2.9},
        {navn: 'Illumina Inc', vekt: 2.9},
        {navn: 'Vinci SA', vekt: 2.9},
        {navn: 'Bloom Energy Corp Class A', vekt: 2.6},
        {navn: 'Alamos Gold Inc Class A', vekt: 2.6}
      ],
      regioner: [
        {navn: 'North America', vekt: 57.1}, {navn: 'Europe dev', vekt: 28.7}, {navn: 'Asia dev', vekt: 4.7},
        {navn: 'Asia emrg', vekt: 3.4}, {navn: 'Africa/Middle East', vekt: 2.4}, {navn: 'United Kingdom', vekt: 2.3},
        {navn: 'Japan', vekt: 0.9}, {navn: 'Australasia', vekt: 0.5}
      ],
      sektorer: [
        {navn: 'Healthcare', vekt: 22.9}, {navn: 'Technology', vekt: 21.1}, {navn: 'Industrials', vekt: 16.8},
        {navn: 'Financial Services', vekt: 16.6}, {navn: 'Energy', vekt: 9.1}, {navn: 'Basic Materials', vekt: 8.3},
        {navn: 'Utilities', vekt: 3.4}, {navn: 'Communication Services', vekt: 1.7}
      ],
      stil: [
        {navn: 'Large Value', vekt: 19.2}, {navn: 'Large Core', vekt: 20.1}, {navn: 'Large Growth', vekt: 13.7},
        {navn: 'Mid Value', vekt: 2.4}, {navn: 'Mid Core', vekt: 4}, {navn: 'Mid Growth', vekt: 25.6},
        {navn: 'Small Core', vekt: 13.2}, {navn: 'Small Growth', vekt: 1.8}
      ],
      disclaimer: 'Tematisk global aksjeløsning. Konsentrert tematisk aksjefond. Region-, sektor- og stildata per 31.10.2026. Underliggende beholdninger per 30.04.2026.'
    },
    'norske-aksjer-utbytte': {
      underliggende: [
        {navn: 'Protector Forsikring ASA', vekt: 9.4},
        {navn: 'Storebrand ASA', vekt: 9.4},
        {navn: 'Subsea 7 SA', vekt: 9.3},
        {navn: 'Var Energi ASA', vekt: 8.3},
        {navn: 'Aker BP ASA', vekt: 7.8},
        {navn: 'DNB Bank ASA', vekt: 7.1},
        {navn: 'Klaveness Combination Carriers ASA', vekt: 7.1},
        {navn: 'Sentia ASA Registered Shares', vekt: 5.8},
        {navn: 'SpareBank 1 Sor Norge ASA', vekt: 5.7},
        {navn: 'SpareBank 1 SMN Depository Receipts', vekt: 5.1},
        {navn: 'ABG Sundal Collier Holding ASA', vekt: 5},
        {navn: 'Atea ASA', vekt: 4.6},
        {navn: 'Mowi ASA', vekt: 4.5},
        {navn: 'PPI Public Property Invest AB', vekt: 4.3},
        {navn: 'Europris ASA', vekt: 3.9},
        {navn: 'Leroy Seafood Group ASA', vekt: 2.7}
      ],
      regioner: [
        {navn: 'Europe dev', vekt: 100}
      ],
      sektorer: [
        {navn: 'Financial Services', vekt: 41.7}, {navn: 'Energy', vekt: 25.3}, {navn: 'Industrials', vekt: 12.9},
        {navn: 'Consumer Defensive', vekt: 11.1}, {navn: 'Technology', vekt: 4.6}, {navn: 'Real Estate', vekt: 4.3}
      ],
      stil: [
        {navn: 'Large Value', vekt: 7.6}, {navn: 'Large Core', vekt: 8.3}, {navn: 'Mid Value', vekt: 5.4},
        {navn: 'Mid Core', vekt: 30.7}, {navn: 'Mid Growth', vekt: 18.7}, {navn: 'Small Value', vekt: 2.9},
        {navn: 'Small Core', vekt: 21.9}, {navn: 'Small Growth', vekt: 4.6}
      ],
      disclaimer: 'Diskresjonært forvaltet portefølje av norske aksjer. Eksponeringsdata per 31.10.2026.'
    },
    'norske-aksjer-vekst': {
      underliggende: [
        {navn: 'Protector Forsikring ASA', vekt: 10.9},
        {navn: 'Equinor ASA', vekt: 10.9},
        {navn: 'Volare Shipping Ltd', vekt: 10.4},
        {navn: 'CMB.Tech NV', vekt: 8.5},
        {navn: 'DOF Group ASA', vekt: 8.5},
        {navn: 'Storebrand ASA', vekt: 8.4},
        {navn: 'Endur ASA', vekt: 7.4},
        {navn: 'Hafnia Ltd Ordinary Shares', vekt: 6.7},
        {navn: 'BW LPG Ltd', vekt: 6.5},
        {navn: 'Bruton Ltd', vekt: 6.1},
        {navn: 'AutoStore Holdings Ltd Ordinary Shares', vekt: 6.1},
        {navn: 'Nordic Semiconductor ASA', vekt: 5},
        {navn: 'Norwegian Air Shuttle ASA', vekt: 4.5}
      ],
      regioner: [
        {navn: 'Europe dev', vekt: 76.4}, {navn: 'Asia dev', vekt: 23.6}
      ],
      sektorer: [
        {navn: 'Industrials', vekt: 49.8}, {navn: 'Energy', vekt: 25.9}, {navn: 'Financial Services', vekt: 19.4},
        {navn: 'Technology', vekt: 5}
      ],
      stil: [
        {navn: 'Large Value', vekt: 13.1}, {navn: 'Mid Value', vekt: 18.2}, {navn: 'Mid Core', vekt: 28},
        {navn: 'Mid Growth', vekt: 26.4}, {navn: 'Small Value', vekt: 5.4}, {navn: 'Small Growth', vekt: 8.9}
      ],
      disclaimer: 'Diskresjonært forvaltet portefølje av norske aksjer. Eksponeringsdata per 31.10.2026.'
    }
};

// Referanseindeks for eksponeringssammenligning: MSCI ACWI All Cap NR (Morningstar,
// "Pensumprodukter-eksponeringsdata 31.10.26", porteføljedato 31.10.2026).
export const referanseEksponering = {
  navn: 'MSCI ACWI All Cap',
  dato: '31.10.2026',
  regioner: [
    {navn: 'United States', vekt: 63.2}, {navn: 'Japan', vekt: 5.9}, {navn: 'Taiwan', vekt: 3.2},
    {navn: 'Canada', vekt: 3.1}, {navn: 'United Kingdom', vekt: 3.1}, {navn: 'Switzerland', vekt: 2.3},
    {navn: 'South Korea', vekt: 2.1}, {navn: 'China', vekt: 2.1}, {navn: 'Germany', vekt: 1.8},
    {navn: 'France', vekt: 1.7}, {navn: 'Other', vekt: 11.4}
  ],
  sektorer: [
    {navn: 'Technology', vekt: 30}, {navn: 'Financial Services', vekt: 16.2}, {navn: 'Industrials', vekt: 10.8},
    {navn: 'Healthcare', vekt: 9.7}, {navn: 'Consumer Cyclical', vekt: 8.8}, {navn: 'Communication Services', vekt: 6.7},
    {navn: 'Consumer Defensive', vekt: 4.9}, {navn: 'Energy', vekt: 4.6}, {navn: 'Basic Materials', vekt: 3.8},
    {navn: 'Utilities', vekt: 2.4}, {navn: 'Other', vekt: 2.3}
  ],
  stil: [
    {navn: 'Large Value', vekt: 20.7}, {navn: 'Large Core', vekt: 34}, {navn: 'Large Growth', vekt: 19.4},
    {navn: 'Mid Value', vekt: 5.5}, {navn: 'Mid Core', vekt: 8.3}, {navn: 'Mid Growth', vekt: 4.7},
    {navn: 'Small Value', vekt: 2.5}, {navn: 'Small Core', vekt: 3.1}, {navn: 'Small Growth', vekt: 1.8}
  ]
};

export const defaultProduktRapportMeta = {
  'global-core-active': {
    slideTitle: 'Global kjerneeksponering',
    slideSubtitle: 'Bred global aksjeportefølje med aktiv fondsseleksjon',
    role: 'Kjernebyggestein i aksjedelen',
    benchmark: 'MSCI World / bred global aksjereferanse',
    expectedReturn: 8.5,
    expectedYield: 1.8,
    pitch: 'Gir bred global aksjeeksponering og fungerer som hovedmotor i porteføljens aksjedel.',
    caseText: 'Kombinerer kvalitet, geografi og forvalterdiversifisering i én samlet løsning.',
    whyIncluded: 'Passer godt som basiseksponering når målet er robust global allokering over tid.',
    riskText: 'Verdien vil svinge med globale aksjemarkeder og valutautvikling.',
    diagramType: 'region-sector',
    slideCount: 2,
    category: 'equity-core'
  },
  // Beskrivelsen følger forvalterens presentasjon «Pensum Global Edge» (tall per 31.10.2026).
  'global-edge': {
    slideTitle: 'Global aksjeløsning med nisjeforvaltere',
    slideSubtitle: 'Globale aksjer gjennom spesialiserte forvaltere med spisset kompetanse',
    role: 'Global aksjekjerne gjennom spesialiserte forvaltere',
    benchmark: 'MSCI ACWI All Cap NR (i NOK)',
    expectedReturn: 9.0,
    expectedYield: 1.2,
    pitch: 'Et utvalg på 8–12 fond som til sammen dekker alle regioner, sektorer og stilarter, med en tilt mot mindre selskaper.',
    caseText: 'Kan utgjøre hele den globale aksjedelen i en kundeportefølje, eller være et supplement til en bredere global kjerne.',
    whyIncluded: 'Forvaltere med spisset kompetanse på avgrensede og mindre analyserte markeder har bedre forutsetninger for å skape merverdi over tid. Daglig likviditet.',
    riskText: 'Tilt mot mindre selskaper og nisjer gir større svingninger og avvik fra verdensindeksen.',
    diagramType: 'region-sector',
    slideCount: 2,
    category: 'equity-core'
  },
  basis: {
    slideTitle: 'Balansert totalportefølje',
    slideSubtitle: 'Kombinasjon av aksjer og renter i én løsning',
    role: 'Helhetlig blandet byggestein',
    benchmark: 'Blandet referanse / 50-50 aksjer-renter',
    expectedReturn: 7.5,
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
    expectedReturn: 7.7,
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
    expectedReturn: 8.0,
    expectedYield: 7.2,
    pitch: 'Gir eksponering mot nordisk kredittmarked gjennom utvalgte fond.',
    caseText: 'Egnet når man ønsker mer regional kredittkompetanse og løpende yield.',
    whyIncluded: 'Kan være et godt supplement til globale renteløsninger.',
    riskText: 'Likviditet og kredittspread kan påvirke avkastningen i urolige perioder.',
    diagramType: 'underlying',
    slideCount: 2,
    category: 'fixed-income'
  },
  'norske-aksjer-utbytte': {
    slideTitle: 'Norske aksjer med utbytte',
    slideSubtitle: 'Diskresjonært forvaltet portefølje av norske aksjer',
    role: 'Norsk aksjeeksponering med utbyttefokus',
    benchmark: 'Oslo Børs Fondsindeks (OSEFX)',
    expectedReturn: 10.0,
    expectedYield: 3.0,
    pitch: 'Konsentrert portefølje av norske aksjer med vekt på selskaper som betaler utbytte. Finans, energi og industri utgjør størstedelen.',
    caseText: 'Egnet for investorer som ønsker norsk aksjeeksponering der utbytte er en del av avkastningen.',
    whyIncluded: 'Gir tilgang til norske selskaper valgt ut av Pensums forvaltere, og passer godt i NOK-porteføljer.',
    riskText: 'Ett marked, med høy eksponering mot finans og energi. Konsentrert portefølje.',
    diagramType: 'underlying',
    slideCount: 2,
    category: 'equity-nordic'
  },
  'norske-aksjer-vekst': {
    slideTitle: 'Norske aksjer med vekt på vekst',
    slideSubtitle: 'Diskresjonært forvaltet portefølje av norske aksjer',
    role: 'Norsk aksjeeksponering med vekstfokus',
    benchmark: 'Oslo Børs Fondsindeks (OSEFX)',
    expectedReturn: 10.0,
    expectedYield: 3.0,
    pitch: 'Konsentrert portefølje av norske aksjer med vekt på vekst. Industri (blant annet shipping), energi og finans utgjør størstedelen.',
    caseText: 'Egnet for investorer som ønsker norsk aksjeeksponering med høyere vekstpotensial og aksepterer større svingninger.',
    whyIncluded: 'Gir tilgang til norske vekstselskaper valgt ut av Pensums forvaltere, og passer godt i NOK-porteføljer.',
    riskText: 'Ett marked, med høy eksponering mot sykliske sektorer som shipping og energi. Konsentrert portefølje med store svingninger.',
    diagramType: 'underlying',
    slideCount: 2,
    category: 'equity-nordic'
  },
  'norge-a': {
    slideTitle: 'Norske aksjer',
    slideSubtitle: 'Aktivt norsk aksjefond',
    role: 'Hjemmemarkeds- og stock-picking-eksponering',
    benchmark: 'OSEBX / norsk aksjereferanse',
    expectedReturn: 10.0,
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
    expectedReturn: 9.5,
    expectedYield: 3.5,
    pitch: 'Gir målrettet eksponering mot energi, råvarer og tilhørende verdikjeder.',
    caseText: 'Kan bidra med mulighet for meravkastning (med tilhørende risiko for mindreavkastning) når energisektoren er attraktivt priset.',
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
    expectedReturn: 9.5,
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
    expectedReturn: 8.0,
    expectedYield: 8.0,
    pitch: 'Gir målrettet kreditt- og renteeksponering mot finansrelaterte utstedere.',
    caseText: 'Kan bidra med attraktiv løpende avkastning fra et avgrenset og analysekrevende segment.',
    whyIncluded: 'Passer som supplement i rentedelen for å øke spesialisering og yield.',
    riskText: 'Kredittevent, likviditet og sektorspesifikk risiko kan påvirke utviklingen.',
    diagramType: 'underlying',
    slideCount: 2,
    category: 'fixed-income-specialist'
  },
  'kairos-a': {
    slideTitle: 'Tematisk global aksjeløsning',
    slideSubtitle: 'Konsentrert tematisk aksjefond',
    role: 'Spisset tematisk satellitt',
    benchmark: 'MSCI ACWI / global aksjereferanse',
    expectedReturn: 9.5,
    expectedYield: 1.0,
    pitch: 'Investerer i utvalgte aktuelle tema, eksempler kan være energi, forsvar, AI osv.',
    caseText: 'Brukes som tematisk satellitt for å fange strukturelle vekstdrivere.',
    whyIncluded: 'Gir spisset eksponering mot dagens viktigste investeringstema.',
    riskText: 'Konsentrert portefølje med høy temaspesifikk risiko og kort historikk.',
    diagramType: 'underlying',
    slideCount: 2,
    category: 'equity-thematic'
  },
  'turnstone-pe': {
    slideTitle: 'Private Equity',
    slideSubtitle: 'Illikvid eksponering mot unoterte selskaper',
    role: 'Illikvid satellitt',
    benchmark: 'Globale private markets',
    expectedReturn: 11.0,
    expectedYield: 0,
    pitch: 'Gir tilgang til unoterte selskaper med høyere forventet avkastning og illikviditetspremie.',
    caseText: 'Egnet for langsiktige investorer som tåler bindingstid og lavere likviditet.',
    whyIncluded: 'Bidrar med diversifisering og potensiell meravkastning utover børsnoterte aksjer.',
    riskText: 'Illikvid, høyere equity-beta og avhengig av forvalterseleksjon. Lang bindingstid.',
    diagramType: 'underlying',
    slideCount: 2,
    category: 'private-equity'
  },
  'amaron-re': {
    slideTitle: 'Eiendom',
    slideSubtitle: 'Realaktiva med løpende inntekter',
    role: 'Inflasjonsbeskyttende realaktiva',
    benchmark: 'Nordiske/europeiske eiendomsbenchmarks',
    expectedReturn: 7.7,
    expectedYield: 4.0,
    pitch: 'Eksponering mot fysiske eiendommer for løpende leieinntekter og verdivekst.',
    caseText: 'Realaktiva med inflasjonsbeskyttelse og kontantstrøm.',
    whyIncluded: 'Diversifiserer porteføljen med realaktiva og lav korrelasjon mot aksjer.',
    riskText: 'Illikvid, sensitiv for renter og lokale eiendomsmarkeder.',
    diagramType: 'underlying',
    slideCount: 2,
    category: 'real-estate'
  },
  'unoterte-aksjer': {
    slideTitle: 'Unoterte aksjer',
    slideSubtitle: 'Direkte eksponering mot enkeltselskaper',
    role: 'Spisset illikvid satellitt',
    benchmark: 'Privat egenkapital / vekst',
    expectedReturn: 10.0,
    expectedYield: 0,
    pitch: 'Direkte investering i utvalgte unoterte selskaper med vekstpotensial.',
    caseText: 'Egnet for investorer som ønsker eksponering mot enkeltselskaper utenfor børs.',
    whyIncluded: 'Bidrar med spisset eksponering mot kvalitetsselskaper i tidlige eller mellomsene faser.',
    riskText: 'Høy idiosynkratisk risiko, illikvid og selskapsavhengig.',
    diagramType: 'underlying',
    slideCount: 2,
    category: 'private-equity'
  }
};
