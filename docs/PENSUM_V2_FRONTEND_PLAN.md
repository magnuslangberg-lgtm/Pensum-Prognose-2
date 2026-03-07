# Pensum V2 – frontend og testflyt

Denne patchen kobler V2-generatoren inn i eksisterende app.

## Nytt i UI
- Knapp for **Forhåndsvis forslag v2**
- Knapp for **Last ned PowerPoint v2**
- Enkel preview-boks som viser meta, utvalgte produkter og hovedpoenger

## Nye API-endepunkter
- `POST /api/proposal-v2-debug`
- `POST /api/generate-pptx-v2`

## Testrekkefølge
1. Åpne modal for investeringsforslag
2. Trykk **Forhåndsvis forslag v2**
3. Kontroller at riktige produkter og vekter vises
4. Trykk **Last ned PowerPoint v2**
5. Verifiser at bare produkter med vekt > 0 kommer med

## Neste steg
- Erstatt legacy-knappen med v2 når kvaliteten er høy nok
- Lag egne layoutregler per produktkategori
- Bygg administrasjon for produktmetadata og eksponeringsdata
