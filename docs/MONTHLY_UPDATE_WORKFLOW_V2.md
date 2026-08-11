# Pensum V2 – monthly update workflow

## Fast månedlig prosess
1. Oppdater CSV/Excel med markeds- og produktdata.
2. Oppdater Morningstar-/produktgrunnlag for hver Pensum-løsning.
3. Last opp filer til `uploads/`.
4. Oppdater standardfilen i `scripts/generateHistorikk.js`, og kjør `npm run data:generate`. Alternativt kan filnavnet oppgis direkte: `npm run data:generate -- "filnavn.xlsx"`.
5. Kontroller at generatoren finner alle obligatoriske ark og at alle produkt- og indeksserier slutter på rapportdatoen.
6. Verifiser at `report-config-v2` viser riktige produkter og rapportdato.
7. Test `proposal-v2-debug` og `generate-pptx-v2` før bruk i kundemøter.

## Målbilde
- Datafeed er sannhetskilde for historikk og rapportdato.
- Pensum Løsninger er sannhetskilde for pitch, rolle, benchmark og rapporttekst.
- Generatoren setter dette sammen til porteføljeslides og modulære produktslides.

## Neste naturlige steg
- Egen admin-editor for rapportfelter per produkt.
- Persistens for produktmetadata utover hardkodet state.
- Styring av hvilke diagrammer som vises per produkt.
