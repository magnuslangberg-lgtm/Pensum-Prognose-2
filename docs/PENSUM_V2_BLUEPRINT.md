# Pensum Investeringsforslag v2

## Målbilde
Bygg verktøyet rundt én kanonisk datamodell som oppdateres månedlig, og en modulær presentasjonsmotor som kun viser relevante produkter og relevante slides.

## Kjerneprinsipper
- Excel/CSV er månedlig kilde for markeds- og avkastningsdata.
- Hvert Pensum-produkt er et førsteklasses objekt med egen metadata, eksponering og egen slidetype.
- Totalporteføljen brukes til sammendrag, allokering, scenario og samlet eksponering.
- Produktinnhold bygges modulært: hvis vekten er 0, skal produktslidene ikke med.
- LLM skal brukes som språk- og narrativlag, ikke som sannhetskilde for tall.

## Datakilder
1. `Datafeed til rådgiververktøy.csv`
   - månedlige/daglige avkastningsserier
   - referansedato
   - produktserier for Pensum-løsninger
2. `Pensumprodukter-eksponeringsdata-fra pres studio.pptx`
   - designreferanse / kilde til produktspesifikke eksponeringsmoduler
3. `Mal - Forslag til investeringsportefolje 2026.pptx`
   - hovedmal for faste slides og visuell drakt

## Foreslått målstruktur for månedlig oppdatering
- `uploads/Datafeed til rådgiververktøy.csv`
- `uploads/Pensumprodukter-eksponeringsdata-fra pres studio.pptx`
- `uploads/Mal - Forslag til investeringsportefolje 2026.pptx`

## Ny datamodell
- `data/pensumProductMasterV2.js`
  - produktmetadata
  - rolle i porteføljen
  - benchmark
  - risikonivå
  - likviditet
  - slide-template
- `lib/monthlyDataImport.js`
  - parser for CSV-data
  - mappe aliaser til produktene
  - beregne nøkkeltall som 1M, 3M, YTD, 1Y, 3Y, 5Y
- `lib/proposalModelV2.js`
  - bygger porteføljelogikk og produktmoduler
- `data/reportBlueprintV2.js`
  - definerer slide-rekkefølge og typer

## Slidearkitektur
### Faste slides
1. Forside
2. Viktig informasjon
3. Executive summary
4. Anbefalt porteføljesammensetning
5. Nøkkeltall og forventninger
6. Hvorfor denne sammensetningen
7. Historisk utvikling
8. Samlet eksponering

### Produktmoduler
For hvert produkt med positiv vekt:
- Produktslide A: rolle i porteføljen, investeringscase, nøkkeltall
- Produktslide B: region, sektor, stil, topposisjoner

### Avslutning
- Implementering og oppfølging
- Oppsummering og neste steg

## API som er lagt til i v2-grunnlaget
- `POST /api/proposal-v2`
  - leser siste CSV i uploads eller mottar base64-CSV
  - bygger en kanonisk proposal model
  - returnerer JSON for validering/debugging før PPTX-generering

## Hva som bør bygges videre
1. UI for å se proposal model direkte i admin
2. PPTX-generator v2 som bygger modulære slides fra proposal model
3. månedlig import av produkt-PPT som strukturert eksponeringskilde
4. LLM-lag for executive summary og forklaringstekst
5. validering og versjonering av opplastede månedlige datasett
