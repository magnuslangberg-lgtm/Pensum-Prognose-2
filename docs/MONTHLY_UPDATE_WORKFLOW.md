# Månedlig oppdatering

1. **Last opp** til `uploads/`:
   - `Datafeed til rådgiververktøy_<dato>.xlsx` (arkene `indekser`, `Pensumløsninger`, `Fondsfokuslisten`)
   - `Pensumprodukter-eksponeringsdata <dato>.pdf` (Morningstar)
   - eventuelt oppdatert CMA-metodikk
2. **Datafeed:** sett `XLSX_FILENAME` i `scripts/generateHistorikk.js` og kjør `npm run data:generate`.
   Generatoren stopper hvis et ark mangler eller en serie ikke slutter på rapportdatoen.
3. **Rapportdato og YTD:** oppdater `RAPPORT_DATO` og `HISTORIKK_2026_YTD` i `lib/pensumCore.js`
   og `aar<år>`-feltene i `data/pensumDefaults.js` (YTD = kurs på rapportdato / kurs 31.12 i fjor − 1).
4. **Eksponering:** oppdater `defaultProduktEksponering` og `referanseEksponering` i `data/pensumDefaults.js`.
   Behold Morningstars engelske navn – appen oversetter dem ved visning (`oversettEksponering`).
   Skriv riktig «Eksponeringsdata per …» i disclaimer for hvert produkt.
5. **CMA:** ved ny metodikk, oppdater `forventetAvkastning`/`forventetRisiko` i `data/pensumDefaults.js`,
   `expectedReturn` i `defaultProduktRapportMeta`, `RISIKOFRI_RENTE` og `CMA_METODIKK.dokumentLenke` i `lib/pensumCore.js`.
6. **Kontroll:** `npm test` og `npm run build`. Åpne appen, gå gjennom fanene og last ned et investeringsforslag.

3-årstall, volatilitet, Sharpe og maks fall beregnes automatisk fra datafeeden og trenger ingen manuell oppdatering.
