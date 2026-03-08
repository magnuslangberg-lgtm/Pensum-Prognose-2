# Pensum V2 – World class produktslides

Denne runden bygger et mer robust lag mellom produktdata og PowerPoint-generatoren.

## Hovedgrep
- hver Pensum-løsning får en kategorimal
- kategorien styrer:
  - foretrukne diagrammer
  - KPI-kort
  - narrativ fokus
  - standard slide-typer
- produktnoden lager nå et `slideBlueprint` som senere kan mates direkte inn i `generate-pptx-v2`

## Nye filer
- `data/productCategoryTemplatesV2.js`
- `lib/productCategorySlideBuilderV2.js`
- `lib/productReportEngineV2.js`
- `lib/proposalWorldClassV2.js`

## Hvorfor dette er viktig
Dette gjør det mulig å presentere:
- Global Core Active som global kjernebyggestein
- Global Høyrente som rente-/kontantstrømmotor
- Norge som hjemmemarked/aktivt aksjevalg
- Nordic Banking Sector som sektorspesialist
- Global Energy som tematisk satellitt

med ulike slideoppsett uten å hardkode alt direkte i én generator.
