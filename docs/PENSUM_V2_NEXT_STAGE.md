# Pensum V2 – neste steg

Denne patchen gjør tre ting:

1. Leser månedlig CSV robust fra `uploads/` eller `public/uploads/`
2. Bygger en world-class proposal model med produktnoder og slideplan
3. Genererer en egen `generate-pptx-v2`-PowerPoint uten å være avhengig av skjør template-merge

## Nye API-ruter

- `POST /api/proposal-v2-debug`
- `POST /api/generate-pptx-v2`

## Forventet payload

```json
{
  "customer": {
    "customerName": "Eksempelkunde AS",
    "riskProfile": "Balansert",
    "investmentAmount": 25000000
  },
  "portfolioWeights": {
    "Pensum Global Core Active": 0.5,
    "Pensum Global Høyrente": 0.25,
    "Pensum Norge": 0.15,
    "Pensum Nordic Banking Sector": 0.10
  }
}
```

## Hva som fortsatt gjenstår

- Koble ekte produkt-adminfelter i frontend direkte inn i denne modellen
- Bruke Morningstar-/produkt-PPT-data til faktiske region-, sektor- og holdingsdiagrammer
- Stramme designet enda nærmere hovedmalen slide for slide
