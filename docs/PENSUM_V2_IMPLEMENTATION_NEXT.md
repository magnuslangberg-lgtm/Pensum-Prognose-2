# Neste implementasjonssteg

## Dette er på plass med denne patchen
- Dataskjema for produktadmin
- Produktbasert report engine
- API for å inspisere produktnoder

## Dette bør bygges inn i appen neste runde
1. UI-felt under Pensum Løsninger for rapportdata
2. Lagring av rapportoverride per produkt i localStorage/adminstate
3. Knapper for å teste produktnode mot generatoren
4. Bruk produktnode direkte i proposal-v2 og generate-pptx-v2

## Målbildet
- Rådgiver velger portefølje
- Generator bygger totalportefølje
- For hvert produkt med vekt > 0 bygges en egen produktnode
- Produktnoden bestemmer slides, grafer og tekstinnhold
- PPTX bygges fra modulene
