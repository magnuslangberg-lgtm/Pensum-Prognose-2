# Pensum V2 – anbefalt datakontrakt

## Månedlig datafeed

Den månedlige Excel/CSV-filen bør på sikt inneholde følgende faner eller logiske tabeller:

1. **ProductReturns**
   - produktnavn
   - dato / rapportdato
   - 1M
   - 3M
   - YTD
   - 1Y
   - 3Y p.a.
   - 5Y p.a.
   - volatilitet
   - drawdown

2. **ProductMaster**
   - productId
   - navn
   - kategori
   - aktivaklasse
   - benchmark
   - likviditet
   - risikonivaa
   - rolle
   - caseKort
   - caseLang

3. **ProductExposureRegion**
   - productId
   - navn
   - vekt

4. **ProductExposureSector**
   - productId
   - navn
   - vekt

5. **ProductTopHoldings**
   - productId
   - navn
   - vekt

6. **Benchmarks**
   - benchmarknavn
   - 1M
   - 3M
   - YTD
   - 1Y
   - 3Y
   - 5Y

## Det viktigste prinsippet

- Excel/CSV er sannhetskilde for tall
- produktmaster er sannhetskilde for produktfakta og standardtekst
- generatoren setter dette sammen til investorforslag
- LLM bør bare forbedre språk, ikke finne opp produktdata eller tall

## Morningstar / produkt-PPT

Produkt-PowerPointen bør ikke være eneste datakilde. Den bør brukes som:
- redaksjonell referanse
- kvalitetssikring av innhold
- kilde til å vedlikeholde strukturert eksponeringsdata

Det beste er at nøkkelinformasjonen også legges i strukturert form, slik at generatoren kan bruke den direkte i grafer, tabeller og tekst.
