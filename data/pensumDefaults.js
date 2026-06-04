// Forventet avkastning er basert på CMA-metodikk (BlackRock, Vanguard, J.P. Morgan + nordisk overlay).
// Se uploads/CMA_metodikk_.docx for full metodikk.
// Volatilitet (forventet risiko) angir illustrativ årlig standardavvik.
export const defaultPensumProdukter = {
    enkeltfond: [
      { id: 'norge-a', navn: 'Pensum Norge A', aktivatype: 'aksje', likviditet: 'likvid', rolle: 'spisset', aar2026: 9.5, aar2025: 21.5, aar2024: 12.5, aar2023: 13.2, aar2022: 5.0, forventetAvkastning: 9.5, forventetRisiko: 19.0, forventetYield: 3.0, aarlig3ar: 15.7, risiko3ar: 4.1 },
      { id: 'energy-a', navn: 'Pensum Global Energy A', aktivatype: 'aksje', likviditet: 'likvid', rolle: 'spisset', aar2026: 28.6, aar2025: 7.3, aar2024: -1.0, aar2023: 11.0, aar2022: 55.5, forventetAvkastning: 9.0, forventetRisiko: 22.0, forventetYield: 3.5, aarlig3ar: 5.6, risiko3ar: 5.0 },
      { id: 'banking-d', navn: 'Pensum Nordic Banking Sector D', aktivatype: 'aksje', likviditet: 'likvid', rolle: 'spisset', aar2026: 2.8, aar2025: 26.6, aar2024: 24.9, aar2023: 17.5, aar2022: -8.4, forventetAvkastning: 9.0, forventetRisiko: 18.0, forventetYield: 5.0, aarlig3ar: 22.9, risiko3ar: 4.0 },
      { id: 'financial-d', navn: 'Pensum Financial Opportunity Fund D', aktivatype: 'rente', likviditet: 'likvid', rolle: 'spisset', aar2026: 1.0, aar2025: 9.4, aar2024: 9.8, aar2023: 11.3, aar2022: -12.6, forventetAvkastning: 7.5, forventetRisiko: 10.0, forventetYield: 8.0, aarlig3ar: 10.2, risiko3ar: 0.8 },
      { id: 'kairos-a', navn: 'Pensum Kairos A', aktivatype: 'aksje', likviditet: 'likvid', rolle: 'spisset', aar2026: null, aar2025: null, aar2024: null, aar2023: null, aar2022: null, forventetAvkastning: 9.0, forventetRisiko: 20.0, forventetYield: 1.0, aarlig3ar: null, risiko3ar: null, kortHistorikk: true }
    ],
    fondsportefoljer: [
      { id: 'global-core-active', navn: 'Pensum Global Core Active', aktivatype: 'aksje', likviditet: 'likvid', rolle: 'kjerne', aar2026: -2.9, aar2025: 8.0, aar2024: 31.8, aar2023: 25.6, aar2022: -7.2, forventetAvkastning: 8.0, forventetRisiko: 16.0, forventetYield: 1.8, aarlig3ar: 21.4, risiko3ar: 10.1 },
      { id: 'global-edge', navn: 'Pensum Global Edge', aktivatype: 'aksje', likviditet: 'likvid', rolle: 'kjerne', aar2026: -4.4, aar2025: 14.1, aar2024: 26.8, aar2023: 23.6, aar2022: -6.3, forventetAvkastning: 8.5, forventetRisiko: 17.0, forventetYield: 1.2, aarlig3ar: 21.4, risiko3ar: 5.4 },
      { id: 'basis', navn: 'Pensum Basis', aktivatype: 'dynamisk', likviditet: 'likvid', rolle: 'kjerne', aar2026: -2.1, aar2025: 5.0, aar2024: 13.3, aar2023: 12.9, aar2022: -2.1, forventetAvkastning: 7.0, forventetRisiko: 9.0, forventetYield: 3.4, aarlig3ar: 10.3, risiko3ar: 3.8 },
      { id: 'global-hoyrente', navn: 'Pensum Global Høyrente', aktivatype: 'rente', likviditet: 'likvid', rolle: 'kjerne', aar2026: 1.1, aar2025: 6.2, aar2024: 6.5, aar2023: 7.9, aar2022: -5.1, forventetAvkastning: 7.2, forventetRisiko: 10.0, forventetYield: 7.0, aarlig3ar: 6.8, risiko3ar: 0.8 },
      { id: 'nordisk-hoyrente', navn: 'Pensum Nordisk Høyrente', aktivatype: 'rente', likviditet: 'likvid', rolle: 'spisset', aar2026: 1.8, aar2025: 6.5, aar2024: 9.1, aar2023: 11.3, aar2022: 4.7, forventetAvkastning: 7.5, forventetRisiko: 12.0, forventetYield: 7.2, aarlig3ar: 9.0, risiko3ar: 2.0 }
    ],
    eksterneFond: [
      { id: 'acadian-global-equity', navn: 'Acadian Global Equity UCITS A EUR', aktivatype: 'aksje', likviditet: 'likvid', rolle: 'kjerne', aar2026: 10.2, aar2025: 2.6, aar2024: 32.3, aar2023: 21.5, aar2022: -13.4, forventetAvkastning: 8.0, forventetRisiko: 16.0, forventetYield: 1.5, aarlig3ar: 18.1, risiko3ar: 12.3 },
      { id: 'capital-group-new-pers', navn: 'Capital Group New Pers (LUX) Z', aktivatype: 'aksje', likviditet: 'likvid', rolle: 'kjerne', aar2026: 2.2, aar2025: 20.5, aar2024: 16.1, aar2023: 24.2, aar2022: -26.2, forventetAvkastning: 8.0, forventetRisiko: 17.0, forventetYield: 1.0, aarlig3ar: 20.2, risiko3ar: 3.3 },
      { id: 'dnb-global-enhanced', navn: 'DNB Global Enhanced Index A', aktivatype: 'aksje', likviditet: 'likvid', rolle: 'kjerne', aar2026: -2.0, aar2025: 7.9, aar2024: 33.7, aar2023: null, aar2022: null, forventetAvkastning: 8.0, forventetRisiko: 16.0, forventetYield: 1.5, aarlig3ar: null, risiko3ar: null, kortHistorikk: true },
      { id: 'guinness-global-equity-income', navn: 'Guinness Global Equity Income Y EUR Acc', aktivatype: 'aksje', likviditet: 'likvid', rolle: 'kjerne', aar2026: 5.3, aar2025: -1.8, aar2024: 20.1, aar2023: 11.9, aar2022: -3.4, forventetAvkastning: 8.0, forventetRisiko: 15.0, forventetYield: 2.5, aarlig3ar: 9.7, risiko3ar: 9.0 },
      { id: 'janus-henderson-glb-sc', navn: 'Janus Henderson Hrzn Glb SC IU2 USD', aktivatype: 'aksje', likviditet: 'likvid', rolle: 'spisset', aar2026: 8.4, aar2025: 26.1, aar2024: 19.7, aar2023: 27.3, aar2022: -19.0, forventetAvkastning: 9.0, forventetRisiko: 20.0, forventetYield: 0.8, aarlig3ar: 24.3, risiko3ar: 3.3 }
    ],
    alternative: [
      { id: 'turnstone-pe', navn: 'Turnstone Private Equity', aktivatype: 'alternativ', likviditet: 'illikvid', rolle: 'spisset', aar2026: null, aar2025: null, aar2024: null, aar2023: null, aar2022: null, forventetAvkastning: 10.5, forventetRisiko: 25.0, forventetYield: 0, aarlig3ar: null, risiko3ar: null },
      { id: 'amaron-re', navn: 'Amaron Real Estate', aktivatype: 'alternativ', likviditet: 'illikvid', rolle: 'spisset', aar2026: null, aar2025: null, aar2024: null, aar2023: null, aar2022: null, forventetAvkastning: 7.2, forventetRisiko: 11.0, forventetYield: 4.0, aarlig3ar: null, risiko3ar: null },
      { id: 'unoterte-aksjer', navn: 'Unoterte aksjer', aktivatype: 'alternativ', likviditet: 'illikvid', rolle: 'spisset', aar2026: null, aar2025: null, aar2024: null, aar2023: null, aar2022: null, forventetAvkastning: 9.5, forventetRisiko: 22.0, forventetYield: 0, aarlig3ar: null, risiko3ar: null }
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
  'global-edge': { rolle: 'Kjerne', kategoriBeskrivelse: 'Globale aksjer', beskrivelse: 'Kjerneeksponering mot globale aksjer. Porteføljen består av aktivt forvaltede fond, med en overvekt mot nisjesegmenter og smalere investeringsunivers, hvor forvalterne har spisskompetanse på dette feltet. Eksempler kan være sektorfond, fond med eksponering mot enkeltland, enkelttema eller kun små selskaper. Eksponeringen kan avvike til dels mye fra indeks.' },
  'global-hoyrente': { rolle: 'Kjerne', kategoriBeskrivelse: 'Globale renter', beskrivelse: 'Kjerneeksponering innen rentefond. Porteføljen består av bred eksponering mot det globale rentemarkedet. Brorparten av kapitalen er plassert i høyrenteobligasjoner, men det er også oftest innslag av investment grade.' },
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
        {navn: 'Capital Group InvCoAmer (LUX) A4', vekt: 20.0},
        {navn: 'AB Select US Equity S1 USD', vekt: 19.9},
        {navn: 'Acadian Global Equity UCITS A EUR', vekt: 10.5},
        {navn: 'Guinness Global Equity Income Y EUR Acc', vekt: 10.0},
        {navn: 'Capital Group New Pers (LUX) ZL', vekt: 9.7},
        {navn: 'BGF European Value D2', vekt: 9.6},
        {navn: 'Acadian Emerg Mkts Eq II C USD Ins Acc', vekt: 8.8},
        {navn: 'DNB Teknologi A', vekt: 6.0},
        {navn: 'JPM Japan Strategic Value C acc JPY', vekt: 5.4}
      ],
      regioner: [
        {navn: 'United States', vekt: 60.9}, {navn: 'Japan', vekt: 6.4}, {navn: 'United Kingdom', vekt: 4.3},
        {navn: 'Taiwan', vekt: 4.0}, {navn: 'France', vekt: 3.5}, {navn: 'China', vekt: 2.7},
        {navn: 'Switzerland', vekt: 2.6}, {navn: 'Germany', vekt: 2.1}, {navn: 'South Korea', vekt: 2.1},
        {navn: 'Sweden', vekt: 2.0}, {navn: 'Other', vekt: 9.5}
      ],
      sektorer: [
        {navn: 'Technology', vekt: 30.2}, {navn: 'Financial Services', vekt: 15.3}, {navn: 'Industrials', vekt: 13.1},
        {navn: 'Communication Services', vekt: 9.4}, {navn: 'Healthcare', vekt: 9.1}, {navn: 'Consumer Cyclical', vekt: 8.6},
        {navn: 'Consumer Defensive', vekt: 5.1}, {navn: 'Energy', vekt: 4.0}, {navn: 'Basic Materials', vekt: 2.6},
        {navn: 'Utilities', vekt: 1.9}, {navn: 'Other', vekt: 0.8}
      ],
      stil: [
        {navn: 'Large Value', vekt: 27.7}, {navn: 'Large Core', vekt: 33.0}, {navn: 'Large Growth', vekt: 22.8},
        {navn: 'Mid Value', vekt: 3.9}, {navn: 'Mid Core', vekt: 7.0}, {navn: 'Mid Growth', vekt: 3.2},
        {navn: 'Small Value', vekt: 1.1}, {navn: 'Small Core', vekt: 1.1}, {navn: 'Small Growth', vekt: 0.3}
      ],
      disclaimer: 'Oppstart 01.01.2026. Historikk er estimert med den samme allokeringen som i oppstartsporteføljene bakover i tid. Eksponeringsdata per 30.04.2026.'
    },
    'global-edge': {
      underliggende: [
        {navn: 'Janus Henderson Hrzn Glb SC IU2 USD', vekt: 16.8},
        {navn: 'Capital Group InvCoAmer (LUX) Z', vekt: 13.7},
        {navn: 'DNB Teknologi A', vekt: 13.3},
        {navn: 'Acadian Emerg Mkts Eq II C USD Ins Acc', vekt: 10.2},
        {navn: 'BGF European Value D2', vekt: 7.9},
        {navn: 'ORIGO SELEQT A', vekt: 7.3},
        {navn: 'Arctic Aurora LifeScience I', vekt: 7.0},
        {navn: 'Bakersteel Glb Fds SICAV- Elctm I USD', vekt: 6.5},
        {navn: 'Granahan US Focused Growth A USD Acc', vekt: 6.5},
        {navn: 'Guinness Sustainable Energy Y USD Acc', vekt: 5.4},
        {navn: 'FIRST Impact', vekt: 5.3}
      ],
      regioner: [
        {navn: 'United States', vekt: 48.6}, {navn: 'Sweden', vekt: 6.6}, {navn: 'United Kingdom', vekt: 4.6},
        {navn: 'China', vekt: 4.2}, {navn: 'Canada', vekt: 3.8}, {navn: 'Japan', vekt: 3.7},
        {navn: 'France', vekt: 3.2}, {navn: 'Taiwan', vekt: 3.0}, {navn: 'Denmark', vekt: 2.7},
        {navn: 'Germany', vekt: 2.3}, {navn: 'Other', vekt: 17.3}
      ],
      sektorer: [
        {navn: 'Technology', vekt: 25.2}, {navn: 'Industrials', vekt: 16.5}, {navn: 'Healthcare', vekt: 13.4},
        {navn: 'Financial Services', vekt: 10.5}, {navn: 'Consumer Cyclical', vekt: 9.7}, {navn: 'Basic Materials', vekt: 8.6},
        {navn: 'Communication Services', vekt: 7.1}, {navn: 'Energy', vekt: 3.1}, {navn: 'Utilities', vekt: 2.5},
        {navn: 'Consumer Defensive', vekt: 1.9}, {navn: 'Other', vekt: 1.5}
      ],
      stil: [
        {navn: 'Large Value', vekt: 12.9}, {navn: 'Large Core', vekt: 22.1}, {navn: 'Large Growth', vekt: 14.7},
        {navn: 'Mid Value', vekt: 4.0}, {navn: 'Mid Core', vekt: 7.9}, {navn: 'Mid Growth', vekt: 9.1},
        {navn: 'Small Value', vekt: 7.0}, {navn: 'Small Core', vekt: 10.5}, {navn: 'Small Growth', vekt: 11.9}
      ],
      disclaimer: 'Oppstart 01.01.2026. Historikk er estimert med den samme allokeringen som i oppstartsporteføljene bakover i tid. Eksponeringsdata per 30.04.2026.'
    },
    'basis': {
      underliggende: [
        {navn: 'Arctic Nordic Corporate Bond Class D', vekt: 19.4},
        {navn: 'Arctic Return Class I', vekt: 15.5},
        {navn: 'Acadian Global Equity UCITS A EUR', vekt: 12.0},
        {navn: 'KLP Obligasjon Global S', vekt: 10.3},
        {navn: 'Guinness Global Equity Income Y EUR Acc', vekt: 8.3},
        {navn: 'Acadian Emerg Mkts Eq II C USD Ins Acc', vekt: 7.3},
        {navn: 'Janus Henderson Hrzn Glb SC IU2 USD', vekt: 6.0},
        {navn: 'BGF European Value D2', vekt: 4.2},
        {navn: 'ORIGO SELEQT A', vekt: 4.1},
        {navn: 'JPM Japan Strategic Value C acc JPY', vekt: 3.9},
        {navn: 'Sentia ASA Registered Shares', vekt: 3.8},
        {navn: 'PPI Public Property Invest AB', vekt: 2.6},
        {navn: 'Elopak ASA', vekt: 2.6}
      ],
      regioner: [
        {navn: 'United States', vekt: 31.0}, {navn: 'Norway', vekt: 17.0}, {navn: 'Japan', vekt: 8.7},
        {navn: 'Sweden', vekt: 6.3}, {navn: 'Taiwan', vekt: 4.8}, {navn: 'United Kingdom', vekt: 4.2},
        {navn: 'China', vekt: 4.1}, {navn: 'Switzerland', vekt: 3.4}, {navn: 'France', vekt: 2.9},
        {navn: 'South Korea', vekt: 2.9}, {navn: 'Other', vekt: 14.7}
      ],
      sektorer: [
        {navn: 'Industrials', vekt: 22.2}, {navn: 'Technology', vekt: 19.8}, {navn: 'Financial Services', vekt: 13.1},
        {navn: 'Consumer Cyclical', vekt: 11.8}, {navn: 'Healthcare', vekt: 8.9}, {navn: 'Real Estate', vekt: 6.1},
        {navn: 'Consumer Defensive', vekt: 5.3}, {navn: 'Communication Services', vekt: 4.9},
        {navn: 'Energy', vekt: 4.1}, {navn: 'Basic Materials', vekt: 2.8}, {navn: 'Other', vekt: 0.9}
      ],
      stil: [
        {navn: 'Large Value', vekt: 17.3}, {navn: 'Large Core', vekt: 20.6}, {navn: 'Large Growth', vekt: 12.6},
        {navn: 'Mid Value', vekt: 4.6}, {navn: 'Mid Core', vekt: 7.5}, {navn: 'Mid Growth', vekt: 5.5},
        {navn: 'Small Value', vekt: 4.0}, {navn: 'Small Core', vekt: 17.3}, {navn: 'Small Growth', vekt: 10.5}
      ],
      disclaimer: 'Avkastning før oppstart 12. september 2023 er estimert med en lignende portefølje med 50% rentefond og 50% aksjer. Eksponeringsdata per 30.04.2026.'
    },
    'global-hoyrente': {
      underliggende: [
        {navn: 'Barings Global High Yield Bd I NOK Acc', vekt: 23.2},
        {navn: 'Storm Bond ICN NOK', vekt: 16.2},
        {navn: 'Alfred Berg Nordic IG Medium Dur C (NOK)', vekt: 15.2},
        {navn: 'Arctic Nordic Corporate Bond Class D', vekt: 15.2},
        {navn: 'BlueBay Global High Yield Bd I NOK', vekt: 15.2},
        {navn: 'KLP Obligasjon Global S', vekt: 15.2}
      ],
      disclaimer: 'Eksponeringsdata per 30.04.2026.'
    },
    'nordisk-hoyrente': {
      underliggende: [
        {navn: 'Arctic Nordic Corporate Bond Class D', vekt: 33.8},
        {navn: 'Storm Bond ICN NOK', vekt: 33.6},
        {navn: 'Alfred Berg Nordic HY C (NOK)', vekt: 17.3},
        {navn: 'Alfred Berg Nordic IG Medium Dur C (NOK)', vekt: 15.2}
      ],
      disclaimer: 'Oppstart februar 2024. Utvikling før dette er estimert med underliggende fonds utvikling før oppstart. Eksponeringsdata per 30.04.2026.'
    },
    'energy-a': {
      underliggende: [
        {navn: 'Equinor ASA', vekt: 7.2}, {navn: 'Var Energi ASA', vekt: 6.4}, {navn: 'Exxon Mobil Corp', vekt: 5.5},
        {navn: 'Aker BP ASA', vekt: 5.4}, {navn: 'International Petroleum Corp', vekt: 4.7}, {navn: 'DNO ASA', vekt: 4.4},
        {navn: 'Valero Energy Corp', vekt: 4.2}, {navn: 'Frontline PLC', vekt: 3.9}, {navn: 'Shell PLC', vekt: 3.8},
        {navn: 'Cheniere Energy Inc', vekt: 3.6}, {navn: 'BP PLC', vekt: 3.1}, {navn: 'Chevron Corp', vekt: 3.0},
        {navn: 'TotalEnergies SE', vekt: 3.0}
      ],
      regioner: [
        {navn: 'United States', vekt: 37.7}, {navn: 'Norway', vekt: 34.3}, {navn: 'United Kingdom', vekt: 8.9},
        {navn: 'Canada', vekt: 5.6}, {navn: 'Other Countries', vekt: 3.9}, {navn: 'France', vekt: 3.0},
        {navn: 'Italy', vekt: 2.6}, {navn: 'Denmark', vekt: 1.8}, {navn: 'Spain', vekt: 1.2},
        {navn: 'Brazil', vekt: 0.9}
      ],
      sektorer: [
        {navn: 'Energy', vekt: 91.2}, {navn: 'Industrials', vekt: 5.4}, {navn: 'Utilities', vekt: 2.2},
        {navn: 'Technology', vekt: 1.2}
      ],
      stil: [
        {navn: 'Large Value', vekt: 39.4}, {navn: 'Large Core', vekt: 1.3}, {navn: 'Large Growth', vekt: 4.1},
        {navn: 'Mid Value', vekt: 25.0}, {navn: 'Mid Core', vekt: 9.6}, {navn: 'Mid Growth', vekt: 4.5},
        {navn: 'Small Value', vekt: 6.8}, {navn: 'Small Core', vekt: 9.2}, {navn: 'Small Growth', vekt: 0.0}
      ],
      disclaimer: 'Avkastning før oppstart desember 2022 er estimert med et lignende diskresjonært mandat forvaltet av samme forvalter. Eksponeringsdata per 30.04.2026.'
    },
    'banking-d': {
      underliggende: [
        {navn: 'DNB Bank ASA', vekt: 16.6},
        {navn: 'Sparebank 1 Sorost-Norge', vekt: 14.1},
        {navn: 'SpareBank 1 SMN Depository Receipts', vekt: 10.7},
        {navn: 'Sparebanken Norge Depository Receipts', vekt: 7.4},
        {navn: 'Sparebanken More', vekt: 4.3},
        {navn: 'SpareBank 1 SMN', vekt: 4.3},
        {navn: 'Swedbank AB Class A', vekt: 4.2},
        {navn: 'SpareBank 1 Ostfold Akershus Depository Receipts', vekt: 2.8},
        {navn: 'SpareBank 1 Nord-Norge', vekt: 2.8},
        {navn: 'Sparebank 1 Ostfold Akershus', vekt: 2.8},
        {navn: 'Nordea Bank Abp', vekt: 2.4},
        {navn: 'Sparebank 1 Sogn Og Fjordane', vekt: 2.3},
        {navn: 'SpareBank 1 Ringerike Hadeland', vekt: 2.3}
      ],
      regioner: [
        {navn: 'Norway', vekt: 83.4}, {navn: 'Sweden', vekt: 14.4}, {navn: 'Denmark', vekt: 2.2}
      ],
      sektorer: [
        {navn: 'Financial Services', vekt: 100.0}
      ],
      stil: [
        {navn: 'Large Value', vekt: 44.7}, {navn: 'Mid Value', vekt: 19.6}, {navn: 'Mid Core', vekt: 16.2},
        {navn: 'Mid Growth', vekt: 2.2}, {navn: 'Small Value', vekt: 6.1}, {navn: 'Small Core', vekt: 11.3}
      ],
      disclaimer: 'Oppstart 29. januar 2025. Utvikling før dette er estimert med det lignende mandatet Pensum Sparebank+. Eksponeringsdata per 30.04.2026.'
    },
    'norge-a': {
      underliggende: [
        {navn: 'DNB Bank ASA', vekt: 6.4}, {navn: 'Protector Forsikring ASA', vekt: 5.5},
        {navn: 'Equinor ASA', vekt: 4.8}, {navn: 'Mowi ASA', vekt: 4.7},
        {navn: 'Storebrand ASA', vekt: 4.6}, {navn: 'Aker ASA Class A', vekt: 4.5},
        {navn: 'BW LPG Ltd', vekt: 3.6}, {navn: 'DOF Group ASA', vekt: 3.6},
        {navn: 'SpareBank 1 SMN Depository Receipts', vekt: 3.4}, {navn: 'Capital Tankers Corp', vekt: 3.3},
        {navn: 'SpareBank 1 Sor Norge ASA', vekt: 3.3}, {navn: 'Endur ASA', vekt: 3.2},
        {navn: 'AutoStore Holdings Ltd Ordinary Shares', vekt: 3.1}
      ],
      regioner: [
        {navn: 'Norway', vekt: 86.0}, {navn: 'Singapore', vekt: 5.2}, {navn: 'Greece', vekt: 4.9},
        {navn: 'Other Countries', vekt: 2.2}, {navn: 'Mexico', vekt: 1.7}
      ],
      sektorer: [
        {navn: 'Industrials', vekt: 28.8}, {navn: 'Financial Services', vekt: 24.8}, {navn: 'Energy', vekt: 14.2},
        {navn: 'Consumer Defensive', vekt: 12.8}, {navn: 'Technology', vekt: 6.7}, {navn: 'Consumer Cyclical', vekt: 6.1},
        {navn: 'Real Estate', vekt: 2.6}, {navn: 'Utilities', vekt: 2.3}, {navn: 'Communication Services', vekt: 1.7}
      ],
      stil: [
        {navn: 'Large Value', vekt: 12.1}, {navn: 'Large Core', vekt: 0.0}, {navn: 'Large Growth', vekt: 3.3},
        {navn: 'Mid Value', vekt: 10.2}, {navn: 'Mid Core', vekt: 26.6}, {navn: 'Mid Growth', vekt: 14.3},
        {navn: 'Small Value', vekt: 4.2}, {navn: 'Small Core', vekt: 18.4}, {navn: 'Small Growth', vekt: 11.0}
      ],
      disclaimer: 'Oppstart 27. november 2023. Utvikling før dette er estimert med lignende porteføljer. Eksponeringsdata per 30.04.2026.'
    },
    'financial-d': {
      underliggende: [
        {navn: 'IuteCredit Finance S.a r.l.', vekt: 27.2},
        {navn: 'Eleving Group SA', vekt: 19.2},
        {navn: 'Stichting AK Rabobank Certificaten', vekt: 18.0},
        {navn: 'Worldline SA', vekt: 17.4},
        {navn: 'Multitude Capital Oyj', vekt: 10.3},
        {navn: 'Sherwood Financing PLC', vekt: 7.9}
      ],
      disclaimer: 'Oppstart 05.04.2025. Utvikling før dette er estimert med indeksen Bloomberg Global High Yield, valutasikret til NOK. Eksponeringsdata per 30.04.2026.'
    },
    'kairos-a': {
      underliggende: [
        {navn: 'Caterpillar Inc', vekt: 3.5}, {navn: 'Alphabet Inc Class A', vekt: 3.5},
        {navn: 'Baker Hughes Co Class A', vekt: 3.4}, {navn: 'Scorpio Tankers Inc', vekt: 3.3},
        {navn: 'ABB Ltd', vekt: 3.2}, {navn: 'Kurita Water Industries Ltd', vekt: 3.2},
        {navn: 'Micron Technology Inc', vekt: 3.2}, {navn: 'TotalEnergies SE', vekt: 3.1},
        {navn: 'Eni SpA', vekt: 3.1}, {navn: 'Taiwan Semiconductor Manufacturing Co Ltd ADR', vekt: 3.1},
        {navn: 'Acciona SA', vekt: 3.1}, {navn: 'Schneider Electric SE', vekt: 3.0},
        {navn: 'ASML Holding NV', vekt: 3.0}, {navn: 'Companhia De Saneamento Basico Do Estado De Sao Paulo ADR', vekt: 3.0},
        {navn: 'Teradyne Inc', vekt: 2.9}, {navn: 'Illumina Inc', vekt: 2.9},
        {navn: 'Vinci SA', vekt: 2.9}, {navn: 'Bloom Energy Corp Class A', vekt: 2.6},
        {navn: 'Alamos Gold Inc Class A', vekt: 2.6}
      ],
      disclaimer: 'Tematisk global aksjeløsning. Konsentrert tematisk aksjefond. Eksponeringsdata per 30.04.2026.'
    }
  };


export const defaultProduktRapportMeta = {
  'global-core-active': {
    slideTitle: 'Global kjerneeksponering',
    slideSubtitle: 'Bred global aksjeportefølje med aktiv fondsseleksjon',
    role: 'Kjernebyggestein i aksjedelen',
    benchmark: 'MSCI World / bred global aksjereferanse',
    expectedReturn: 8.0,
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
    expectedReturn: 8.5,
    expectedYield: 1.2,
    pitch: 'Supplerer kjerneporteføljen med mer konsentrerte og aktive globale idéer.',
    caseText: 'Brukes når man ønsker høyere aktiv andel og flere tydelige forvalterbets.',
    whyIncluded: 'Kan øke diversifiseringen på forvalterstil og gi mulighet for meravkastning (med tilhørende risiko for mindreavkastning).',
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
    expectedReturn: 7.0,
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
    expectedReturn: 7.2,
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
    expectedReturn: 9.5,
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
    expectedReturn: 9.0,
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
    expectedReturn: 9.0,
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
    expectedReturn: 7.5,
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
    expectedReturn: 9.0,
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
    expectedReturn: 10.5,
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
    expectedReturn: 7.2,
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
    expectedReturn: 9.5,
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
