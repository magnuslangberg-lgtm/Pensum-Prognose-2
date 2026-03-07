# Pensum V2 – template alignment

Denne runden strammer v2-generatoren inn mot strukturen i investeringsmalen:

- Slide 1: Forside
- Slide 2: Viktig informasjon
- Slide 3: Executive summary
- Slide 4: Overordnede forutsetninger
- Slide 5: Intro til illustrativ portefølje
- Slide 6: Aktivaklasseallokering og produktvekter
- Slide 7: Pensum-løsningene i porteføljen
- Slide 8: Hvorfor denne sammensetningen
- Slide 9-13: Produktslides for de største valgte byggesteinene

## Viktige grep

- Produktvekter normaliseres nå til prosentvisning selv om frontend sender 0.30 i stedet for 30.
- Produktslides bruker feltene som vedlikeholdes under Pensum Løsninger / rapportinnhold.
- Generatoren har nå et tydelig hoveddekk og et appendix for øvrige produkter.
- Previewen viser planlagte hovedslides slik at rådgiver ser hva som faktisk blir generert.

## Videre steg

1. Koble Morningstar-/produkt-PPT-data tettere til produktnoden månedlig.
2. Innføre produktspesifikke diagrammaler per kategori.
3. La LLM skrive kontrollert slide-tekst basert på ferdig proposal model.
