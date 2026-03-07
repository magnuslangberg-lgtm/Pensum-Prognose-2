# Pensum V2 – Produktadmin som rapportmotor

## Mål
Gjør **Pensum Løsninger** til stedet der rådgiverteamet og/eller admin vedlikeholder innholdet som senere brukes i investeringsforslagene.

## Hva som bør redigeres per produkt

### Faste metadata
- Produktnavn
- Benchmark
- Risikonivå
- Likviditet
- Tidshorisont
- Forventet avkastning
- Forventet yield

### Narrativ / tekst
- Kort pitch
- Lang pitch
- Rolle i porteføljen
- Hvorfor produktet brukes
- Investeringscase
- Viktigste risikomomenter
- Rådgiverpoenger

### Diagram- og slidepreferanser
- Hvilke diagrammer som skal brukes først
- Min/max antall slides for produktet
- Hvilke KPI-er som skal løftes
- Hvilke produkter som skal få mer plass ved høy vekt

### Kildemapping
- Hvordan produktet matcher månedlig datafeed
- Hvordan produktet matcher Morningstar/PPT-kilde
- Hvilke keys som brukes for region/sektor/top holdings

## Praktisk anbefaling
1. Behold månedlig CSV/Excel som sannhetskilde for tallserier.
2. Bruk produktadmin for språk, rolle og slidepreferanser.
3. Bruk Morningstar-/produkt-PPT som kilde for eksponeringsdata inntil dette også blir strukturert i Excel.
4. La generatoren flette disse tre kildene sammen.

## Neste UI-steg
- Egen "Rapport"-seksjon under hvert produkt i Pensum Løsninger
- En enkel valideringsstatus: grønn/gul/rød
- En knapp for "Se produktnode" før rapportgenerering
- Mulighet for å lagre standardtekster og justere dem over tid
