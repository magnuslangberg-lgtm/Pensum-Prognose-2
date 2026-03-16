# Presentation System Architecture (Kortversjon + Fullversjon)

Dette dokumentet etablerer en felles arkitektur for to separate generatorer:

- **Kortversjon (10–12 sider)** for møtesituasjoner og rask beslutningsstøtte.
- **Fullversjon (20–25 sider)** for dokumentasjon, dybde og mandatnivå.

Begge skal bruke samme designfamilie (theme/grid/KPI/tabell/chart), men være ulike narrative produkter.

## 1) Felles arkitektur

### Standard slide library
- Innhold/tekst: `data/standardSlideDefaults.js` (default/fallback i repo)
- Renderer: `lib/standardSlideLibrary.js`
- Generatorene konsumerer biblioteket i stedet for hardkodede blokker der det er mulig.

Neste steg: flytte defaults til `content/standardSlides/*.json` og beholde samme renderer-API.

### Chart-spec layer
Nytt felles chartlag er lagt i:

- `lib/charting/specs/`
  - `chartTheme.js` (felles chart-theme/tokens)
  - `chartSpecs.js` (normalisert spec per graf-type)
- `lib/charting/builders/`
  - `portfolioChartBuilders.js` (bygger spec kun fra Porteføljebygger-data)
- `lib/charting/renderers/`
  - `ppt/renderFromSpec.js` (PPT-renderer fra spec)
  - `web/toRechartsConfig.js` (web-adapter fra samme spec)

Første graf-typer i spec:
- Historisk utvikling vs referanser
- Max drawdown
- Årlig historisk avkastning
- Regioneksponering
- Sektoreksponering

## 2) Dataprinsipp (midlertidig låst)

Dynamiske slides i PPT skal kun bruke Porteføljebygger-data:
- allokeringer, produktvekter, historikk, risikomål og eksponering.

Scenario/prognose brukes ikke i den dynamiske PPT-logikken.

## 3) 10-siders generator (nå)

`lib/pptxGenerator10Slide.js` bruker nå chart-spec builders + PPT-renderer for:
- historisk utvikling
- drawdown
- eksponeringsgrunnlag

Dette gjør at vi kan gjenbruke samme chartlogikk i web/PPT og redusere duplisert kode.

## 4) Klargjøring for fullversjon

Fullversjon beholder separat generator (`lib/pptxGenerator25Slide.js`), men kan gradvis flyttes over til samme chart-spec/builders.

Planlagt rekkefølge:
1. Migrere historikk- og drawdown-slides til chart-spec også i fullversjon.
2. Innføre standardisert produktark-builder (per mandat).
3. Koble standardslide-valg per generatorprofil (kort/full).
