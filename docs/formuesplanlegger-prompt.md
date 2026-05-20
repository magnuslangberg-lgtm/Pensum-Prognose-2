# Bygg ut Indekser-siden til en Formuesplanlegger

## Kontekst

Vi har i dag et verktøy `pensum-prognose-2.vercel.app` som brukes i kundemøter hos Pensum Group (rådgivnings- og forvaltningshus i Oslo). Verktøyet har i dag faner for kundeinformasjon, allokering & prognose, Pensum Løsninger, scenarioanalyse, rapport og generering. Det finnes også en "Indekser"-side med historiske tidsserier (norske aksjer, globale aksjer, Pensum-mandater osv.).

**Oppdraget:** Bygg om "Indekser"-siden til en fullverdig **Formuesplanlegger** som rådgivere kan bruke direkte i kundemøter med formuende privatpersoner. Den må kunne ta utgangspunkt i kundens nåsituasjon og modellere realistiske scenarioer fremover, med tydelige visuelle illustrasjoner egnet for projektor/skjerm i møterom.

Behold alt eksisterende — dette er en utvidelse, ikke en omskriving.

## Designprinsipper

- **Norsk språk** gjennomgående
- **Pensum-design**: behold eksisterende fargepalett, typografi, og komponentstil
- **Rådgivningskontekst, ikke selvbetjening**: rådgiver leder kunden gjennom, så UX skal være rolig, oversiktlig, og store nok elementer til å vises på projektor
- **Forsiktige standardverdier**: konservative forventninger, tydelige forutsetninger som vises eksplisitt
- **Persistens via localStorage**: rådgiver må kunne hente opp kundeprofiler mellom møter

## Arkitektur — flyt gjennom planleggeren

Planleggeren skal følge denne logiske rekkefølgen, presentert som en tydelig stegrekkefølge øverst (med mulighet for fri navigering mellom stegene):

```
1. Nåsituasjon  →  2. Mål & rammer  →  3. Allokering  →  4. Prognose  →  5. Scenarioer  →  6. Uttak & pensjon  →  7. Oppsummering
```

Alle stegene deler ett felles **kunde-state-objekt** som persistes til localStorage. Gjør state-objektet lett å eksportere/importere som JSON.

---

## Steg 1: Nåsituasjon — Formuesbalansen

Dette er det viktigste nye steget. Bygg en interaktiv balanse med eiendeler og gjeld.

### Eiendeler — kategorier

Hver kategori skal støtte flere posisjoner som kan legges til/fjernes:

- **Bolig & eiendom**: Primærbolig, fritidsbolig, utleieeiendom
- **Likvid portefølje**: Pensum-mandater (Global Core Active, Global Edge, Norge, Financial Opportunities, Nordic Banking, Energy, Nordisk Høyrente, Basis), andre forvaltere, fond hos andre, direkte aksjer, bank/innskudd
- **Illikvide investeringer**: PE-fond, eiendomsfond, shippingfond, unoterte aksjer, egen virksomhet/holdingselskap
- **Pensjon**: FTP, IPS, fripoliser, offentlig pensjon (forventet)
- **Annet**: Bil, båt, kunst, andre verdier

### Felter per posisjon

- Navn (fritekst)
- Verdi i NOK
- Forventet årlig avkastning (%)
- Forventet årlig volatilitet/standardavvik (%) — kan defaulte basert på kategori
- Likviditet: Umiddelbar / Dager / Uker / Måneder / År
- Eierskap: Privat / Holdingselskap / Felles / Ektefelle (dropdown — viktig for skatt senere)
- Kommentar (fritekst, valgfri)

### Gjeld

- Boliglån, verdipapirbelåning, andre lån
- Felter: Navn, hovedstol, rente (%), avdragsplan (annuitet/serielån/avdragsfri), bindingstid, månedlig avdrag

### Visning

Øverst på siden:

- **Stor "Netto formue"-teller** (sum eiendeler − sum gjeld), formatert som NOK med tusenskilletegn
- **Tre nøkkeltall** ved siden av: Sum eiendeler, Sum gjeld, Likviditetsandel (umiddelbar + dager + uker som andel av netto)
- **Donut-/kakediagram** for sammensetning av eiendeler etter kategori
- **Sekundærdiagram**: Likviditetsfordeling (stablet bar med fem likviditetsklasser)
- **Eierskapsfordeling**: Bar eller donut som viser hvor mye som ligger privat vs. holding vs. felles

Bruk Recharts for alle diagrammer.

### Standardverdier for forventet avkastning per kategori

- Primærbolig: 3 %
- Fritidsbolig: 2 %
- Utleieeiendom: 5 %
- Pensum Global Core Active: 7 %
- Pensum Global Edge: 8 %
- Pensum Norge: 8 %
- Pensum Financial Opportunities: 7 %
- Pensum Nordic Banking: 9 %
- Pensum Energy: 9 %
- Pensum Nordisk Høyrente: 6 %
- Pensum Basis: 5 %
- Andre aksjefond: 7 %
- Rentefond: 4 %
- Bank/innskudd: 3 %
- PE-fond: 12 %
- Eiendomsfond: 7 %
- Shippingfond: 10 %
- Unoterte aksjer: 12 %

Disse skal være redigerbare i et eget "Forutsetninger"-panel.

---

## Steg 2: Mål & rammer

En enkel form med fire blokker:

### Tidshorisont
- Hovedhorisont (år) — slider eller input
- Mulighet for å definere flere "potter" med ulik horisont (pensjon 20 år, hytte 8 år, barnegave 15 år)

### Likviditetsbehov
- "Må kunne realisere innen 12 måneder" (NOK-beløp)
- "Buffer for uventede utgifter" (NOK)

### Risikotoleranse
- Skala 1–7 (slik som EU-PRIIPs SRI)
- **Tap-stresstest under**: "Med din formue og risikotoleranse ville et dårlig år bety ca. NOK X i verditap. Kan du leve med dette?" — beregnet som -1 × standardavvik × portefølje (vis tallet i fet skrift)

### Inntektsbehov og fremtidige hendelser
- Årlig uttak (NOK, indeksregulert)
- Fra hvilket år starter uttaket
- Liste over diskrete fremtidige hendelser:
  - Type (Boligsalg, Boligkjøp, Virksomhetssalg, Arv inn, Generasjonsoverføring ut, Annet)
  - År
  - Beløp (positivt = innskudd, negativt = uttak)
  - Kommentar

---

## Steg 3: Allokering — fra dagens til foreslått

To kolonner side-om-side:

**Venstre — Dagens allokering** (auto-utledet fra Steg 1 likvid portefølje):
- Pie eller stablet bar med kategoriene (norske aksjer, globale aksjer, høyrente, investment grade, eiendomsfond, PE, andre)
- Aggregert forventet avkastning, vektet
- Aggregert standardavvik (forenklet — bare vektet, ikke kovarians)

**Høyre — Foreslått allokering**:
- Sliders per Pensum-mandat (sum tvinges til 100 %)
- Samme nøkkeltall som dagens
- Tydelig "diff": +X mill flyttes fra A til B

### Byggestein-kort

Under sliderne, en horisontal rad med kort for hvert Pensum-mandat:
- Navn
- Risikoprofil (lav/middels/høy med fargekoder)
- Forventet avkastning
- Historisk avkastning 1/3/5 år (hent fra eksisterende data)
- Forvaltningskostnad
- Kort beskrivelse

---

## Steg 4: Prognose — visualisering av fremtiden

### Hovedgrafen

**Stablet arealdiagram** som viser utvikling per aktivaklasse over hele horisonten. X-akse = år, Y-akse = NOK. Hver aktivaklasse er sitt eget felt i stablen.

To linjer over arealdiagrammet:
1. **Nominell verdi** (heltrukket)
2. **Reell verdi** (stiplet, justert for inflasjon — default 2,5 %)

### Sannsynlighetsbånd

Beregn en enkel Monte Carlo (1000 simuleringer er nok) basert på forventet avkastning og standardavvik per aktivaklasse. Vis:
- Forventet utfall (median, heltrukket linje)
- Bånd: 10. til 90. percentil (lyst skravert)
- Bånd: 25. til 75. percentil (mørkere skravert)

Bruk geometric Brownian motion, log-normalfordeling, årlige steg. Hold koden enkel — dette er en illustrasjon, ikke en kvant-modell.

### Milestone-markører

Hendelsene fra Steg 2 vises som vertikale linjer/markører på grafen med små etiketter ("Boligsalg +12 MNOK", "Pensjon starter", osv.).

### Kontantstrømsvisualisering

Under hovedgrafen, en mindre seksjon:
- Bar-graf per år: positive bar = innskudd/utbytte/renteinntekt, negative = uttak/kostnader
- Velg år med slider for å se sankey-diagram (hvis enkelt å implementere — ellers tabell) av inn- og utstrømmer det året

### Nøkkeltall under grafen

- Sluttformue (forventet, nominell)
- Sluttformue (forventet, reell)
- Sluttformue (10. percentil) — "i et dårlig scenario"
- Sluttformue (90. percentil) — "i et godt scenario"
- Total avkastning i kr og %
- Sannsynlighet for å nå hovedmål (hvis mål er definert)

---

## Steg 5: Scenarioer — stresstest

Predefinerte scenarioer som kan aktiveres med ett klikk:

### Krisescenarioer
- **Finanskrise (2008)**: Aksjer −40 %, høyrente −25 %, eiendom −15 % i år 1, deretter normal vekst
- **COVID-sjokk (2020)**: Aksjer −30 %, rask gjeninnhenting
- **Inflasjonsåret (2022)**: Aksjer −15 %, obligasjoner −10 %, eiendom flat
- **Stagflasjon**: 0 % realavkastning aksjer, −2 % realavkastning renter, 6 % inflasjon i 5 år
- **Renteoppgang**: Renter +3 pp, obligasjoner −10 % år 1, lånekostnader øker

### Personlige scenarioer
- **Tidlig pensjon**: Stopp arbeidsinntekt 5 år tidligere
- **Stort uttak år X**: NOK-beløp og år, brukerdefinert
- **Salg av illikvid posisjon år X**: konverter en bestemt eiendel til kontant/portefølje
- **Generasjonsoverføring**: Ut NOK X år Y

### Sammenligning

Side-om-side-graf av **basisscenario** vs. **valgt stresscenario** med:
- To linjer for sluttformue over tid
- Differanse i sluttformue (NOK og %)
- "År til pengene tar slutt" hvis uttaksraten er for høy under stress
- Tabell med årlig sammenligning

### Robusthetsscore

Stor visuell indikator: **"X % sannsynlighet for å nå målet ditt"** — basert på Monte Carlo der vi teller andel simuleringer som ender med positiv formue ved slutten av horisonten (eller når uttaksmålet).

---

## Steg 6: Uttak & pensjon

### Bærekraftig uttak

- Slider for årlig uttak (NOK, indeksregulert)
- Graf: Formuesutvikling med dette uttaket
- "Pengene varer til år: ____" — beregnet
- Sammenligning med 4 %-regelen tilpasset norsk skatt

### Sekvensrisiko-visualisering

Vis to scenarier:
- A: Krakk år 1, deretter normalt
- B: Krakk år 10, deretter normalt

Begge med samme gjennomsnittsavkastning, men dramatisk forskjellig utfall pga. sekvensrisiko. Dette er pedagogisk gull.

### Anbefalt uttaksrate

Beregn "trygt uttak" som det høyeste årlige uttaket som gir 90 % sannsynlighet for å nå horisonten med positiv formue.

---

## Steg 7: Oppsummering

En komprimert side egnet for å vises på projektor og eksporteres som PDF:

- Kundens navn og dato øverst
- Netto formue i dag (stort tall)
- Foreslått allokering (visuell)
- Forventet utvikling (hovedgraf, forenklet)
- Tre scenarier sammenlignet i en liten tabell
- Sannsynlighet for målnåing
- Anbefaling i fritekstboks (rådgiver fyller inn)
- Forutsetninger som er lagt til grunn (liste)
- Pensum-disclaimer nederst

### Eksport

- **PDF-eksport** av oppsummeringssiden med Pensum-branding
- **JSON-eksport** av hele kundetilstanden (for backup og deling mellom rådgivere)
- **JSON-import** for å laste opp en lagret kundeprofil

---

## Tverrgående funksjoner

### Presentasjonsmodus

Knapp øverst som skjuler navigasjon, øker fontstørrelser, og viser kun innholdet — egnet for projektor.

### Forutsetninger-panel

Alltid tilgjengelig (kollapsbar sidepanel eller modal):
- Inflasjon (default 2,5 %)
- Forventet avkastning per aktivaklasse
- Standardavvik per aktivaklasse
- Skattesatser (formuesskatt, utbytte, gevinst)
- Antall Monte Carlo-simuleringer
- "Tilbakestill til Pensum-anbefalinger"

### Kundeprofil-håndtering

- Lagre nåværende state som navngitt profil i localStorage
- Last opp tidligere profiler
- Slett profiler
- "Ny kunde"-knapp som nullstiller

### Snapshot/versjonering

- "Lagre snapshot" lagrer dagens state med dato/navn
- Mulighet for å sammenligne to snapshots side-om-side (f.eks. "før møtet" vs. "etter justeringer")

---

## Tekniske krav

- **Stack**: Behold eksisterende Next.js + React + Recharts + Tailwind
- **State**: useState/useReducer på toppnivå, persistens via useEffect + localStorage
- **Beregninger**: Hold dem som rene funksjoner i en egen fil `lib/finansmatte.js` — Monte Carlo, kontantstrøm, skatt, sannsynligheter
- **Komponenter**: Modulariser per steg — `components/planlegger/Steg1Balanse.jsx`, `Steg2Mal.jsx` osv.
- **Ingen breaking changes**: Eksisterende faner og funksjonalitet skal fungere som før. Erstatt KUN "Indekser"-fanen med "Formuesplanlegger"-fanen, og behold tilgangen til de gamle indeks-grafene som en undermeny eller knapp inne i den nye fanen ("Vis historiske indekser").

## Leveranse — i denne rekkefølgen

Bygg som en serie commits jeg kan reviewe:

1. **Skjelett**: Ny fane "Formuesplanlegger" med syv tomme steg-komponenter, state-objektet, og localStorage-persistens
2. **Steg 1 Balanse**: Full implementering inkludert nøkkeltall og kakediagrammer
3. **Steg 2 Mål**: Form med alle felter, tap-stresstest
4. **Steg 3 Allokering**: To-kolonne med sliders og byggestein-kort
5. **Steg 4 Prognose**: Stablet arealgraf + Monte Carlo + sannsynlighetsbånd
6. **Steg 5 Scenarioer**: Predefinerte stresscenarioer + sammenligning
7. **Steg 6 Uttak**: Bærekraftig uttak + sekvensrisiko
8. **Steg 7 Oppsummering** + PDF-eksport
9. **Tverrgående**: Presentasjonsmodus, forutsetninger-panel, profil-håndtering

Etter hver leveranse: kort statusrapport som beskriver hva som er gjort, hva som mangler, og kjente begrensninger. Spør hvis noe er uklart før du går videre til neste steg.

## Når du er ferdig

- Sjekk at alle eksisterende faner fortsatt fungerer
- Verifiser at localStorage-persistens overlever en sideoppdatering
- Bekreft at byggesteinene fra Pensums faktiske produktsortiment er korrekt navngitt
- Bygg lokalt og verifiser at det kan deployes til Vercel uten feil
