# Pensum V2 – neste leveranse

Denne patchen legger til en første stabil `generate-pptx-v2`-generator som bygger PowerPoint direkte fra den nye proposal model v2.

## Hva som er nytt
- `lib/pptxGeneratorV2.js`
- `pages/api/generate-pptx-v2.js`

## Hva generatoren gjør
- bygger en egen Pensum-stilet PPTX uten avhengighet til template-merge
- bruker månedlig CSV-data fra `uploads`
- bruker produktmaster og eksponeringsdata per Pensum-løsning
- genererer modulære produktslides for kun de løsningene som faktisk er valgt i porteføljen

## Viktig begrensning
Denne generatoren er laget for stabilitet og struktur, ikke pixelperfekt match mot designmalen ennå.
Den riktige neste jobben er å matche layouten tettere mot designmalen slide for slide.

## Anbefalt neste fase
1. Koble frontend til `/api/generate-pptx-v2`
2. Legge til preview/debug av `proposal-v2`
3. Lage egen JSON-import for Morningstar-produktinnhold hvis PPTX ikke skal være eneste kilde
4. Stramme inn layout mot designmalens slide 6–13
