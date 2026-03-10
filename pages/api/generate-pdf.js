import PptxGenJSImport from 'pptxgenjs';

const PptxGenJS = typeof PptxGenJSImport === 'function'
  ? PptxGenJSImport
  : (PptxGenJSImport?.default || PptxGenJSImport?.PptxGenJS);

const COLORS = {
  navy: '0D2240',
  blue: '4C84C4',
  salmon: 'D4886B',
  teal: '0F9888',
  green: '1F8A3B',
  gold: 'B8860B',
  text: '1E293B',
  muted: '64748B',
  light: 'F8FAFC',
  line: 'D9E2EC',
  white: 'FFFFFF',
  danger: 'B42318',
  paleBlue: 'EFF6FF',
  paleAmber: 'FFFBEB',
  paleGreen: 'ECFDF3'
};

const PRODUCT_LABELS = {
  'global-core-active': 'Pensum Global Core Active',
  'global-edge': 'Pensum Global Edge',
  basis: 'Pensum Basis',
  'global-hoyrente': 'Pensum Global Høyrente',
  'nordisk-hoyrente': 'Pensum Nordisk Høyrente',
  'norge-a': 'Pensum Norge A',
  'energy-a': 'Pensum Global Energy A',
  'banking-d': 'Pensum Nordic Banking Sector D',
  'financial-d': 'Pensum Financial Opportunity Fund D'
};

const PRODUCT_META = {
  'global-core-active': {
    title: 'Global kjerneeksponering',
    subtitle: 'Bred global aksjeportefølje med aktiv fondsseleksjon',
    role: 'Kjernebyggestein i aksjedelen',
    pitch: 'Gir bred global aksjeeksponering og fungerer som hovedmotor i porteføljens aksjedel.',
    case: 'Kombinerer kvalitet, geografi og forvalterdiversifisering i én samlet løsning.',
    why: 'Passer godt som basiseksponering når målet er robust global allokering over tid.',
    risk: 'Verdien vil svinge med globale aksjemarkeder og valutautvikling.',
    benchmark: 'MSCI World / bred global aksjereferanse',
    expectedReturn: 9.0,
    expectedYield: 1.8,
    bucket: 'equity'
  },
  'global-edge': {
    title: 'Global offensiv satellitt',
    subtitle: 'Mer aktiv og spisset global aksjeløsning',
    role: 'Satellitt for meravkastning i aksjedelen',
    pitch: 'Supplerer kjerneporteføljen med mer konsentrerte og aktive globale ideer.',
    case: 'Brukes når man ønsker høyere aktiv andel og flere tydelige forvalterbets.',
    why: 'Kan øke diversifiseringen på forvalterstil og gi meravkastningspotensial.',
    risk: 'Høyere stil- og faktoravvik enn brede globale indekser.',
    benchmark: 'Global aktiv aksjereferanse',
    expectedReturn: 9.5,
    expectedYield: 1.4,
    bucket: 'equity'
  },
  basis: {
    title: 'Balansert totalportefølje',
    subtitle: 'Kombinasjon av aksjer og renter i én løsning',
    role: 'Helhetlig blandet byggestein',
    pitch: 'Gir en ferdig sammensatt blanding av aksjer, renter og utvalgte spesialmandater.',
    case: 'Egnet når man ønsker en enkel, balansert løsning med moderat risikonivå.',
    why: 'Kan fungere som selvstendig løsning eller som stabil kjerne i en bredere portefølje.',
    risk: 'Lavere forventet avkastning enn rene aksjeløsninger, men også lavere svingninger.',
    benchmark: 'Blandet referanse / 50-50 aksjer-renter',
    expectedReturn: 7.0,
    expectedYield: 3.0,
    bucket: 'mixed'
  },
  'global-hoyrente': {
    title: 'Global rente- og kontantstrømmotor',
    subtitle: 'Seleksjon av globale high yield- og kredittfond',
    role: 'Rentedel med fokus på løpende avkastning',
    pitch: 'Skal bidra med løpende renteinntekter og lavere volatilitet enn aksjer.',
    case: 'Bygger robusthet i porteføljen og gir kontantstrøm i et mer defensivt segment.',
    why: 'Passer som stabilisator mot aksjer og som bærer av løpende yield.',
    risk: 'Kredittrisiko og spreadutvidelser kan gi kursfall i stressperioder.',
    benchmark: 'Global high yield / kredittreferanse',
    expectedReturn: 7.5,
    expectedYield: 7.0,
    bucket: 'fixedIncome'
  },
  'nordisk-hoyrente': {
    title: 'Nordisk høyrente',
    subtitle: 'Kredittportefølje med nordisk fokus',
    role: 'Regional rentedel med løpende avkastning',
    pitch: 'Gir eksponering mot nordisk kredittmarked gjennom utvalgte fond.',
    case: 'Egnet når man ønsker mer regional kredittkompetanse og løpende yield.',
    why: 'Kan være et godt supplement til globale renteløsninger.',
    risk: 'Likviditet og kredittspread kan påvirke avkastningen i urolige perioder.',
    benchmark: 'Nordisk high yield / kredittreferanse',
    expectedReturn: 7.0,
    expectedYield: 6.5,
    bucket: 'fixedIncome'
  },
  'norge-a': {
    title: 'Norske aksjer',
    subtitle: 'Aktivt norsk aksjefond',
    role: 'Hjemmemarkeds- og stock-picking-eksponering',
    pitch: 'Gir aktiv eksponering mot norske børsnoterte selskaper og sektorer.',
    case: 'Brukes for å utnytte lokal markedskunnskap og tilføre tydelige norske idéer.',
    why: 'Kan gi god diversifisering relativt til globale porteføljer og passer godt i NOK-porteføljer.',
    risk: 'Mer konsentrert marked og høyere sektoravhengighet enn global eksponering.',
    benchmark: 'OSEBX / norsk aksjereferanse',
    expectedReturn: 10.0,
    expectedYield: 2.5,
    bucket: 'equity'
  },
  'energy-a': {
    title: 'Tematisk energi-eksponering',
    subtitle: 'Konsentrert energirelatert mandat',
    role: 'Tematisk satellitt',
    pitch: 'Gir målrettet eksponering mot energi, råvarer og tilhørende verdikjeder.',
    case: 'Kan bidra med meravkastningspotensial når energisektoren er attraktivt priset.',
    why: 'Passer som mindre satellittandel i en bredere portefølje.',
    risk: 'Kan svinge betydelig og er sensitiv for råvarepriser og geopolitikk.',
    benchmark: 'Energi-/råvareorientert aksjereferanse',
    expectedReturn: 11.0,
    expectedYield: 3.5,
    bucket: 'equity'
  },
  'banking-d': {
    title: 'Nordisk banksektor',
    subtitle: 'Sektorspesialist mot banker og finans',
    role: 'Sektorsatellitt',
    pitch: 'Gir eksponering mot nordiske banker og finansinstitusjoner med tydelig sektorvinkel.',
    case: 'Kan brukes når man ønsker særskilt eksponering mot en sektor med attraktive utbytter og soliditet.',
    why: 'Gir en mer spesialisert og målrettet eksponering enn brede nordiske aksjefond.',
    risk: 'Sektorkonsentrasjon og regulatoriske endringer kan gi høy volatilitet.',
    benchmark: 'Nordisk bank-/finansreferanse',
    expectedReturn: 10.0,
    expectedYield: 4.0,
    bucket: 'equity'
  },
  'financial-d': {
    title: 'Finansiell kredittspesialist',
    subtitle: 'Rente-/kredittmandat med finanssektor som fokus',
    role: 'Spesialist i rentedelen',
    pitch: 'Gir målrettet kreditt- og renteeksponering mot finansrelaterte utstedere.',
    case: 'Kan bidra med attraktiv løpende avkastning fra et avgrenset og analysekrevende segment.',
    why: 'Passer som supplement i rentedelen for å øke spesialisering og yield.',
    risk: 'Kredittevent, likviditet og sektorspesifikk risiko kan påvirke utviklingen.',
    benchmark: 'Finansiell kreditt / high yield referanse',
    expectedReturn: 8.0,
    expectedYield: 7.5,
    bucket: 'fixedIncome'
  }
};

function n(v, fb = 0) {
  const x = Number(v);
  return Number.isFinite(x) ? x : fb;
}

function pct(v, digits = 1) {
  return `${n(v).toFixed(digits)}%`;
}

function currency(v) {
  return new Intl.NumberFormat('nb-NO', { maximumFractionDigits: 0 }).format(n(v));
}

function safeFilename(text = 'Kunde') {
  return String(text || 'Kunde')
    .replace(/\s+/g, '_')
    .replace(/[^A-Za-z0-9_\-.æøåÆØÅ]/g, '');
}

function formatDateLabel(dateStr = '') {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('nb-NO');
}

function historicalMetrics(product) {
  const annuals = [
    n(product.aar2026, NaN),
    n(product.aar2025, NaN),
    n(product.aar2024, NaN),
    n(product.aar2023, NaN),
    n(product.aar2022, NaN)
  ].filter((v) => Number.isFinite(v));

  if (!annuals.length) {
    return {
      annualReturn: null,
      volatility: null,
      maxDrawdown: null,
      sharpe: null,
      totalReturn: null
    };
  }

  const mean = annuals.reduce((s, v) => s + v, 0) / annuals.length;
  const variance = annuals.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / annuals.length;
  const vol = Math.sqrt(Math.max(variance, 0));

  let indexValue = 100;
  let peak = 100;
  let maxDd = 0;
  annuals.forEach((ret) => {
    indexValue *= (1 + ret / 100);
    peak = Math.max(peak, indexValue);
    const dd = ((indexValue / peak) - 1) * 100;
    maxDd = Math.min(maxDd, dd);
  });

  const totalReturn = ((indexValue / 100) - 1) * 100;
  const rf = 2.0;
  const sharpe = vol > 0 ? (mean - rf) / vol : null;

  return {
    annualReturn: mean,
    volatility: vol,
    maxDrawdown: maxDd,
    sharpe,
    totalReturn
  };
}

function topRows(arr = [], top = 8) {
  return (Array.isArray(arr) ? arr : []).slice(0, top).map((row) => ({
    navn: row?.navn || 'Ukjent',
    vekt: n(row?.vekt)
  }));
}

function bulletLines(product) {
  return [product.pitch, product.case, product.why]
    .filter(Boolean)
    .map((line) => `• ${line}`);
}

function isShortHistory(product) {
  const annuals = [product.aar2026, product.aar2025, product.aar2024, product.aar2023, product.aar2022]
    .map((v) => n(v, NaN))
    .filter((v) => Number.isFinite(v));
  return annuals.length < 3;
}

function pickProducts(payload) {
  const selectedIds = Array.isArray(payload.produkterIBruk) ? payload.produkterIBruk : [];
  const exposureMap = payload.produktEksponering || {};
  const products = Array.isArray(payload.pensumProdukter) ? payload.pensumProdukter : [];
  const allokMap = new Map(
    (Array.isArray(payload.pensumAllokering) ? payload.pensumAllokering : []).map((p) => [p.id, n(p.vekt)])
  );
  const byId = new Map(products.map((p) => [p.id, p]));

  const selected = (selectedIds.length ? selectedIds : products.map((p) => p.id))
    .map((id) => {
      const raw = byId.get(id) || { id, navn: PRODUCT_LABELS[id] || id };
      const meta = PRODUCT_META[id] || {};
      const exposure = exposureMap[id] || {};
      const metrics = historicalMetrics(raw);

      return {
        ...meta,
        ...raw,
        id,
        navn: raw.navn || PRODUCT_LABELS[id] || id,
        vekt: n(raw.vekt, allokMap.get(id) ?? 0),
        exposure,
        metrics,
        aar2026: n(raw.aar2026, NaN),
        aar2025: n(raw.aar2025, NaN),
        aar2024: n(raw.aar2024, NaN),
        aar2023: n(raw.aar2023, NaN),
        aar2022: n(raw.aar2022, NaN)
      };
    })
    .filter((p) => p.vekt > 0)
    .sort((a, b) => b.vekt - a.vekt);

  if (!selected.length) return [];

  const total = selected.reduce((s, p) => s + n(p.vekt), 0) || 1;
  return selected.map((p) => ({
    ...p,
    vekt: Number(((p.vekt / total) * 100).toFixed(1))
  }));
}

function normalizePayload(payload = {}) {
  const total = n(payload.totalKapital, 0);
  const horisont = Math.max(1, Math.round(n(payload.horisont, 10)));
  const expected = n(payload.vektetAvkastning, 7.5);
  const products = pickProducts(payload);

  const alloc = (Array.isArray(payload.allokering) ? payload.allokering : [])
    .map((a) => ({
      navn: a.navn || 'Ukjent',
      vekt: n(a.vekt),
      kategori: a.kategori || ''
    }))
    .filter((a) => a.vekt > 0)
    .sort((a, b) => b.vekt - a.vekt);

  const expValue = total * Math.pow(1 + (expected / 100), horisont);
  const eksponering = payload.eksponering || { sektorer: [], regioner: [] };
  const kundeAktiva = Array.isArray(payload.kundeAktiva) ? payload.kundeAktiva : [];
  const samletFormue = kundeAktiva.reduce((s, item) => s + n(item.verdi), 0);

  return {
    kundeNavn: payload.kundeNavn || 'Investor',
    risikoProfil: payload.risikoProfil || 'Moderat',
    dato: payload.dato || new Date().toISOString().slice(0, 10),
    total,
    horisont,
    expected,
    alloc,
    products,
    expValue,
    eksponering,
    kundeAktiva,
    samletFormue
  };
}

function addChrome(slide, pageNo, rightText = '') {
  slide.background = { color: COLORS.light };

  slide.addShape('rect', {
    x: 0,
    y: 0,
    w: 13.33,
    h: 0.55,
    fill: { color: COLORS.white },
    line: { color: COLORS.white, pt: 0 }
  });

  slide.addText('PENSUM ASSET MANAGEMENT', {
    x: 0.65,
    y: 0.14,
    w: 5.5,
    h: 0.2,
    fontSize: 10,
    color: COLORS.navy,
    bold: true
  });

  if (rightText) {
    slide.addText(rightText, {
      x: 8.5,
      y: 0.14,
      w: 4.1,
      h: 0.2,
      fontSize: 10,
      color: COLORS.muted,
      align: 'right'
    });
  }

  slide.addShape('line', {
    x: 0.65,
    y: 7.1,
    w: 12.05,
    h: 0,
    line: { color: COLORS.line, pt: 1 }
  });

  slide.addText(`Side ${pageNo}`, {
    x: 0.65,
    y: 7.12,
    w: 2,
    h: 0.2,
    fontSize: 9,
    color: COLORS.muted
  });
}

function addTitle(slide, title, subtitle = '') {
  slide.addText(title, {
    x: 0.8,
    y: 0.95,
    w: 8.8,
    h: 0.5,
    fontSize: 24,
    bold: true,
    color: COLORS.navy
  });

  if (subtitle) {
    slide.addText(subtitle, {
      x: 0.8,
      y: 1.42,
      w: 11.7,
      h: 0.35,
      fontSize: 12,
      color: COLORS.muted
    });
  }
}

function addKpiCard(slide, x, y, w, title, value, accent = COLORS.navy, sub = '') {
  slide.addShape('roundRect', {
    x,
    y,
    w,
    h: 1.0,
    rectRadius: 0.08,
    fill: { color: COLORS.white },
    line: { color: COLORS.line, pt: 1 }
  });

  slide.addText(title, {
    x: x + 0.18,
    y: y + 0.12,
    w: w - 0.3,
    h: 0.15,
    fontSize: 9,
    color: COLORS.muted,
    bold: true
  });

  slide.addText(String(value), {
    x: x + 0.18,
    y: y + 0.35,
    w: w - 0.3,
    h: 0.28,
    fontSize: 20,
    color: accent,
    bold: true
  });

  if (sub) {
    slide.addText(sub, {
      x: x + 0.18,
      y: y + 0.72,
      w: w - 0.3,
      h: 0.12,
      fontSize: 8,
      color: COLORS.muted
    });
  }
}

function addSimpleTable(slide, rows, x, y, w, fontSize = 9, rowH = 0.24) {
  slide.addTable(rows, {
    x,
    y,
    w,
    fontSize,
    rowH,
    border: { pt: 1, color: COLORS.line }
  });
}

function addBarChart(slide, labels, values, x, y, w, h, name = 'Serie') {
  if (!labels.length || !values.length) return;

  slide.addChart('bar', [
    { name, labels, values }
  ], {
    x,
    y,
    w,
    h,
    showLegend: false,
    catAxisLabelFontSize: 10,
    valAxisLabelFontSize: 9,
    barDir: 'bar'
  });
}

function addBulletParagraphs(slide, bullets, x, y, w, h, fontSize = 15) {
  slide.addText(
    bullets.map((b) => ({ text: `• ${b}`, options: { bullet: { indent: 18 } } })),
    {
      x,
      y,
      w,
      h,
      fontSize,
      color: COLORS.text,
      breakLine: true
    }
  );
}

function buildGeneratedDeck(payload = {}) {
  const d = normalizePayload(payload);
  const pptx = new PptxGenJS();

  pptx.layout = 'LAYOUT_WIDE';
  pptx.author = 'OpenAI';
  pptx.company = 'Pensum Asset Management';
  pptx.subject = 'Investeringsforslag';
  pptx.title = `Investeringsforslag ${d.kundeNavn}`;

  let page = 1;

  // 1 Forside
  {
    const s = pptx.addSlide();
    addChrome(s, page++, formatDateLabel(d.dato));

    s.addText('Investeringsforslag', {
      x: 0.8,
      y: 1.55,
      w: 8.8,
      h: 0.7,
      fontSize: 30,
      bold: true,
      color: COLORS.navy
    });

    s.addText(d.kundeNavn, {
      x: 0.8,
      y: 2.3,
      w: 8.8,
      h: 0.45,
      fontSize: 22,
      color: COLORS.salmon,
      bold: true
    });

    s.addText('Pensum Asset Management', {
      x: 0.8,
      y: 2.92,
      w: 8.8,
      h: 0.28,
      fontSize: 14,
      color: COLORS.text
    });

    addKpiCard(s, 0.8, 4.05, 2.5, 'Investerbar kapital', `${currency(d.total)} kr`);
    addKpiCard(s, 3.55, 4.05, 2.25, 'Risikoprofil', d.risikoProfil, COLORS.salmon);
    addKpiCard(s, 6.0, 4.05, 2.25, 'Forv. avkastning', pct(d.expected), COLORS.green, 'årlig');
    addKpiCard(s, 8.45, 4.05, 3.2, 'Forv. sluttverdi', `${currency(d.expValue)} kr`, COLORS.navy, `${d.horisont} år`);

    s.addText('Forslaget er utarbeidet på illustrativ basis og skal vurderes i lys av kundens totale balanse, likviditetsbehov og risikoprofil.', {
      x: 0.82,
      y: 5.55,
      w: 10.9,
      h: 0.45,
      fontSize: 11,
      color: COLORS.muted
    });
  }

  // 2 Viktig informasjon
  {
    const s = pptx.addSlide();
    addChrome(s, page++, 'Viktig informasjon');
    addTitle(s, 'Viktig informasjon', 'Forslaget er illustrativt og bygger på tilgjengelig kundeinformasjon og Pensums vurderinger');

    addBulletParagraphs(s, [
      'Historisk avkastning er ingen garanti for fremtidig avkastning.',
      'Verdien av investeringer kan både stige og falle, og ulike byggesteiner har ulik risiko og likviditet.',
      'Forslaget bør vurderes i sammenheng med kundens samlede formue, kontantstrøm, tidshorisont og eventuelle restriksjoner.',
      'Endelig sammensetning må vurderes av rådgiver sammen med kunden før gjennomføring.'
    ], 0.95, 2.0, 11.3, 2.0, 16);

    addSimpleTable(s, [
      [{ text: 'Formål med forslaget', options: { bold: true } }],
      ['Å vise en illustrativ modellportefølje basert på oppgitte forutsetninger og Pensums investeringssyn.'],
      ['Porteføljen er sammensatt for å balansere vekst, robusthet og løpende avkastning innenfor valgt risikoprofil.']
    ], 0.95, 4.5, 11.3, 10, 0.32);
  }

  // 3 Overordnede forutsetninger
  {
    const s = pptx.addSlide();
    addChrome(s, page++, 'Overordnede forutsetninger');
    addTitle(s, 'Overordnede forutsetninger', 'Skille mellom samlet formue, investerbar kapital og modellportefølje');

    addKpiCard(s, 0.85, 1.95, 2.35, 'Samlet formue', `${currency(d.samletFormue)} kr`, COLORS.navy);
    addKpiCard(s, 3.45, 1.95, 2.35, 'Investerbar kapital', `${currency(d.total)} kr`, COLORS.salmon);
    addKpiCard(s, 6.05, 1.95, 2.1, 'Horisont', `${d.horisont} år`, COLORS.teal);
    addKpiCard(s, 8.4, 1.95, 2.1, 'Risikoprofil', d.risikoProfil, COLORS.navy);
    addKpiCard(s, 10.75, 1.95, 1.5, 'Avkastning', pct(d.expected), COLORS.green);

    const aktivaRows = d.kundeAktiva.length
      ? d.kundeAktiva.map((a) => [
          a.navn || 'Ukjent',
          `${currency(n(a.verdi))} kr`,
          d.samletFormue > 0 ? pct((n(a.verdi) / d.samletFormue) * 100) : '—'
        ])
      : [['Ingen aktiva registrert', '—', '—']];

    addSimpleTable(s, [
      [
        { text: 'Oppgitte aktiva i dag', options: { bold: true } },
        { text: 'Verdi', options: { bold: true } },
        { text: 'Andel av formue', options: { bold: true } }
      ],
      ...aktivaRows
    ], 0.9, 3.45, 6.25);

    addSimpleTable(s, [
      [{ text: 'Kommentarer', options: { bold: true } }],
      ['Modellporteføljen nedenfor gjelder investerbar kapital i dette caset.'],
      ['Eksisterende aktiva som skal bli stående må vurderes separat i helheten.'],
      ['Dette skillet er viktig for å unngå at illustrativ portefølje og totalbalanse blandes sammen.']
    ], 7.4, 3.45, 4.8, 10, 0.32);
  }

  // 4 Porteføljen i dag
  if (d.kundeAktiva.length) {
    const s = pptx.addSlide();
    addChrome(s, page++, 'Porteføljen i dag');
    addTitle(s, 'Porteføljen i dag', 'Oppgitt formuesbilde og hvor stor andel som faktisk foreslås satt i arbeid');

    const investedShare = d.samletFormue > 0 ? (d.total / d.samletFormue) * 100 : 0;
    addKpiCard(s, 0.9, 2.0, 2.7, 'Andel investerbar kapital', pct(investedShare), COLORS.salmon);
    addKpiCard(s, 3.9, 2.0, 2.7, 'Oppgitt formue', `${currency(d.samletFormue)} kr`, COLORS.navy);
    addKpiCard(s, 6.9, 2.0, 2.7, 'Kapital i forslag', `${currency(d.total)} kr`, COLORS.green);

    addSimpleTable(s, [
      [
        { text: 'Aktivaklasse / beholdning', options: { bold: true } },
        { text: 'Verdi', options: { bold: true } },
        { text: 'Andel', options: { bold: true } }
      ],
      ...d.kundeAktiva.map((a) => [
        a.navn || 'Ukjent',
        `${currency(n(a.verdi))} kr`,
        d.samletFormue > 0 ? pct((n(a.verdi) / d.samletFormue) * 100) : '—'
      ])
    ], 0.9, 3.55, 11.2);
  }

  // 5 Hvordan porteføljen er bygget opp
  {
    const s = pptx.addSlide();
    addChrome(s, page++, 'Hvordan porteføljen er bygget opp');
    addTitle(s, 'Hvordan porteføljen er bygget opp', 'Porteføljen er satt sammen av byggesteiner med ulike roller');

    const top = d.products[0];
    addBulletParagraphs(s, [
      top ? `${top.navn} er største byggestein i porteføljen med ${pct(top.vekt)} vekt.` : 'Porteføljen er sammensatt av utvalgte Pensum-løsninger.',
      'Aksjedelen skal være den viktigste langsiktige vekstmotoren i porteføljen.',
      'Rentedelen skal bidra med robusthet, løpende avkastning og lavere svingninger.',
      'Spesialist- og satellittmandater brukes selektivt for å tilføre tydelig eksponering og meravkastningspotensial.'
    ], 0.95, 2.0, 6.0, 2.2, 15);

    addSimpleTable(s, [
      [
        { text: 'Produkt', options: { bold: true } },
        { text: 'Vekt', options: { bold: true } },
        { text: 'Rolle', options: { bold: true } }
      ],
      ...(d.products.length
        ? d.products.slice(0, 7).map((p) => [p.navn, pct(p.vekt), p.role || 'Byggestein'])
        : [['Ingen produkter valgt', '—', '—']])
    ], 7.15, 2.0, 5.05);
  }

  // 6 Illustrativ porteføljesammensetning
  {
    const s = pptx.addSlide();
    addChrome(s, page++, 'Illustrativ porteføljesammensetning');
    addTitle(s, 'Illustrativ porteføljesammensetning', 'Aktivaklasser, produktmiks og beløpsmessig fordeling');

    if (d.alloc.length) {
      s.addChart('pie', [
        {
          name: 'Aktivaklasser',
          labels: d.alloc.map((a) => a.navn),
          values: d.alloc.map((a) => a.vekt)
        }
      ], {
        x: 0.9,
        y: 2.0,
        w: 3.9,
        h: 3.0,
        showLegend: false,
        showValue: true,
        dataLabelPosition: 'bestFit'
      });
    }

    addSimpleTable(s, [
      [
        { text: 'Aktivaklasse', options: { bold: true } },
        { text: 'Vekt', options: { bold: true } },
        { text: 'Beløp', options: { bold: true } }
      ],
      ...(d.alloc.length
        ? d.alloc.map((a) => [a.navn, pct(a.vekt), `${currency((a.vekt / 100) * d.total)} kr`])
        : [['Ingen data', '—', '—']])
    ], 5.05, 2.05, 3.2);

    addSimpleTable(s, [
      [
        { text: 'Produktmiks', options: { bold: true } },
        { text: 'Vekt', options: { bold: true } }
      ],
      ...(d.products.length
        ? d.products.map((p) => [p.navn, pct(p.vekt)])
        : [['Ingen produkter valgt', '—']])
    ], 8.55, 2.05, 3.65);
  }

  // 7 Aksjedelen
  {
    const s = pptx.addSlide();
    addChrome(s, page++, 'Aksjedelen');
    addTitle(s, 'Aksjedelen', 'Motoren for langsiktig verdiskaping i porteføljen');

    const equityProducts = d.products.filter((p) =>
      (p.bucket || '').includes('equity') || /aksje|global|norge|energy|bank/i.test((p.role || '') + ' ' + p.navn + ' ' + p.title)
    );

    addBulletParagraphs(s, [
      'Aksjedelen skal gi bred eksponering mot langsiktig verdiskaping og fungere som porteføljens viktigste vekstmotor.',
      'Kjerneprodukter gir robust basiseksponering, mens satellitter brukes mer selektivt for å forsterke særskilte investeringscase.',
      'Sammensetningen skal balansere bredde, aktiv forvaltning og målrettet spesialisering.'
    ], 0.95, 2.0, 6.0, 1.95, 15);

    addSimpleTable(s, [
      [
        { text: 'Aksjeeksponering', options: { bold: true } },
        { text: 'Vekt', options: { bold: true } },
        { text: 'Rolle', options: { bold: true } }
      ],
      ...(equityProducts.length
        ? equityProducts.map((p) => [p.navn, pct(p.vekt), p.role || 'Aksjebidrag'])
        : [['Ingen aksjeprodukter identifisert', '—', '—']])
    ], 7.15, 2.0, 5.05);

    const sectors = topRows(d.eksponering?.sektorer, 6);
    if (sectors.length) {
      addBarChart(
        s,
        sectors.map((r) => r.navn),
        sectors.map((r) => r.vekt),
        0.95,
        4.55,
        11.25,
        1.9,
        'Sektorfordeling'
      );
    }
  }

  // 8 Rentedelen
  {
    const s = pptx.addSlide();
    addChrome(s, page++, 'Rentedelen');
    addTitle(s, 'Rentedelen', 'Robusthet, kontantstrøm og demping av volatilitet');

    const fixedIncomeProducts = d.products.filter((p) =>
      (p.bucket || '').includes('fixedIncome') || /rente|kreditt|yield|income|finansiell/i.test((p.role || '') + ' ' + p.navn + ' ' + p.title)
    );

    addBulletParagraphs(s, [
      'Rentedelen skal bidra med løpende avkastning og redusere svingningene i totalporteføljen.',
      'Spesialistmandater kan gi høyere løpende yield, men krever god kredittvurdering og bevisst risikohåndtering.',
      'Balansen mellom rente- og aksjedel er sentral for porteføljens samlede risikoprofil.'
    ], 0.95, 2.0, 6.0, 1.95, 15);

    addSimpleTable(s, [
      [
        { text: 'Renteeksponering', options: { bold: true } },
        { text: 'Vekt', options: { bold: true } },
        { text: 'Rolle', options: { bold: true } }
      ],
      ...(fixedIncomeProducts.length
        ? fixedIncomeProducts.map((p) => [p.navn, pct(p.vekt), p.role || 'Rentebidrag'])
        : [['Ingen renteprodukter identifisert', '—', '—']])
    ], 7.15, 2.0, 5.05);

    const regions = topRows(d.eksponering?.regioner, 6);
    if (regions.length) {
      addBarChart(
        s,
        regions.map((r) => r.navn),
        regions.map((r) => r.vekt),
        0.95,
        4.55,
        11.25,
        1.9,
        'Regional eksponering'
      );
    }
  }

  // 9 Hvorfor denne sammensetningen
  {
    const s = pptx.addSlide();
    addChrome(s, page++, 'Hvorfor denne sammensetningen');
    addTitle(s, 'Hvorfor denne sammensetningen', 'Oppsummert investeringslogikk for den foreslåtte porteføljen');

    addBulletParagraphs(s, [
      'Porteføljen søker å kombinere langsiktig vekst med robusthet og løpende avkastning.',
      'Byggesteinene er valgt ut fra tydelige roller, ikke bare enkeltstående avkastningsforventninger.',
      'Sammensetningen er ment å fungere innenfor oppgitt risikoprofil og tidshorisont.',
      'Produktene som følger vises enkeltvis for å synliggjøre faktisk innhold og eksponering.'
    ], 0.95, 2.0, 11.2, 2.0, 16);

    if (d.alloc.length) {
      addSimpleTable(s, [
        [
          { text: 'Modellporteføljens byggesteiner', options: { bold: true } },
          { text: 'Vekt', options: { bold: true } }
        ],
        ...d.products.map((p) => [p.navn, pct(p.vekt)])
      ], 0.95, 4.5, 11.2);
    }
  }

  // 10 Metodikk / historikk
  {
    const hasDisclaimers = d.products.some((p) => p.exposure?.disclaimer);
    const hasShortHistory = d.products.some((p) => isShortHistory(p));

    if (hasDisclaimers || hasShortHistory) {
      const s = pptx.addSlide();
      addChrome(s, page++, 'Viktig informasjon om historikk');
      addTitle(s, 'Viktig informasjon om avkastningshistorikken', 'Metodiske forhold som bør hensyntas ved tolkning av historiske tall');

      const bullets = [
        'Noen produkter har kortere historikk enn øvrige byggesteiner og må derfor tolkes med forsiktighet.',
        'I enkelte tilfeller bygger historikken på andelsklasser, nærliggende mandater eller estimerte serier fra samme forvalter.',
        'Historiske nøkkeltall er tatt inn for å gi kontekst, men må ikke leses som en garanti for fremtidig utvikling.'
      ];

      addBulletParagraphs(s, bullets, 0.95, 2.0, 11.2, 1.8, 15);

      const rows = d.products
        .filter((p) => p.exposure?.disclaimer || isShortHistory(p))
        .map((p) => [
          p.navn,
          isShortHistory(p) ? 'Kort historikk' : 'Historikk / metode',
          p.exposure?.disclaimer || 'Kort tilgjengelig historikk'
        ]);

      addSimpleTable(s, [
        [
          { text: 'Produkt', options: { bold: true } },
          { text: 'Forhold', options: { bold: true } },
          { text: 'Kommentar', options: { bold: true } }
        ],
        ...(rows.length ? rows : [['Ingen særskilte forhold', '—', '—']])
      ], 0.95, 4.15, 11.2, 9, 0.3);
    }
  }

  // Produktslides
  d.products.forEach((p) => {
    const sectors = topRows(p.exposure?.sektorer, 8);
    const regions = topRows(p.exposure?.regioner, 8);
    const holdings = topRows(p.exposure?.underliggende, 10);
    const style = topRows(p.exposure?.stil, 8);
    const m = p.metrics || {};

    // Slide 1: investeringscase
    {
      const s = pptx.addSlide();
      addChrome(s, page++, p.navn);
      addTitle(s, p.title || p.navn, p.subtitle || 'Produktmodul');

      addKpiCard(s, 0.85, 1.9, 1.5, 'Vekt', pct(p.vekt), COLORS.navy);
      addKpiCard(s, 2.55, 1.9, 1.8, 'Forv. avkastning', pct(p.expectedReturn ?? 0), COLORS.green);
      addKpiCard(s, 4.55, 1.9, 1.6, 'Yield', pct(p.expectedYield ?? 0), COLORS.teal);
      addKpiCard(s, 6.35, 1.9, 1.8, 'Volatilitet', m.volatility != null ? pct(m.volatility) : '—', COLORS.salmon);
      addKpiCard(s, 8.35, 1.9, 1.8, 'Maks DD', m.maxDrawdown != null ? pct(m.maxDrawdown) : '—', COLORS.danger);
      addKpiCard(s, 10.35, 1.9, 1.8, 'Sharpe', m.sharpe != null ? n(m.sharpe).toFixed(2) : '—', COLORS.navy);

      s.addText('Rolle i porteføljen', {
        x: 0.95, y: 3.25, w: 2.4, h: 0.18, fontSize: 10, color: COLORS.muted, bold: true
      });
      s.addText(p.role || 'Byggestein i porteføljen', {
        x: 0.95, y: 3.48, w: 4.8, h: 0.35, fontSize: 16, color: COLORS.navy, bold: true
      });

      s.addText('Benchmark', {
        x: 6.8, y: 3.25, w: 1.7, h: 0.18, fontSize: 10, color: COLORS.muted, bold: true
      });
      s.addText(p.benchmark || '—', {
        x: 6.8, y: 3.48, w: 5.1, h: 0.35, fontSize: 13, color: COLORS.text
      });

      const bullets = [
        p.pitch,
        p.case,
        p.why ? `Hvorfor valgt: ${p.why}` : null
      ].filter(Boolean);

      addBulletParagraphs(s, bullets, 0.95, 4.0, 6.2, 1.95, 14);

      addSimpleTable(s, [
        [
          { text: 'Rapportgrunnlag', options: { bold: true } },
          { text: 'Verdi', options: { bold: true } }
        ],
        ['Årlig historikk', m.annualReturn != null ? pct(m.annualReturn) : '—'],
        ['Total historisk avkastning', m.totalReturn != null ? pct(m.totalReturn) : '—'],
        ['Nøkkelrisiko', p.risk || '—'],
        ['Datakilde', p.exposure?.kilde || 'Produktdata / intern modell']
      ], 7.45, 4.0, 4.75, 9, 0.28);
    }

    // Slide 2: eksponering
    {
      const s = pptx.addSlide();
      addChrome(s, page++, `${p.navn} – eksponering`);
      addTitle(s, `${p.navn} – innhold og eksponering`, 'Produktspesifikk eksponering og underliggende innhold');

      if (sectors.length) {
        addBarChart(
          s,
          sectors.map((r) => r.navn),
          sectors.map((r) => r.vekt),
          0.85, 1.95, 5.9, 2.35, 'Sektorer'
        );
      }

      if (regions.length) {
        addBarChart(
          s,
          regions.map((r) => r.navn),
          regions.map((r) => r.vekt),
          6.85, 1.95, 5.55, 2.35, 'Regioner'
        );
      }

      addSimpleTable(s, [
        [
          { text: 'Underliggende investeringer', options: { bold: true } },
          { text: 'Vekt', options: { bold: true } }
        ],
        ...(holdings.length ? holdings.map((r) => [r.navn, pct(r.vekt)]) : [['Ingen underliggende data', '—']])
      ], 0.85, 4.65, 6.0);

      addSimpleTable(s, [
        [
          { text: 'Stil / øvrig', options: { bold: true } },
          { text: 'Vekt', options: { bold: true } }
        ],
        ...(style.length ? style.map((r) => [r.navn, pct(r.vekt)]) : [['Ingen stilfaktorer registrert', '—']])
      ], 7.05, 4.65, 5.2);
    }
  });

  return pptx;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    if (!PptxGenJS) {
      throw new Error('pptxgenjs er ikke tilgjengelig');
    }

    const pptx = buildGeneratedDeck(req.body || {});
    const buffer = await pptx.write({ outputType: 'nodebuffer' });
    const kunde = safeFilename(req.body?.kundeNavn || 'Kunde');
    const filnavn = `Pensum_Investeringsforslag_${kunde}_${new Date().toISOString().slice(0, 10)}.pptx`;

    res.setHeader('X-Pensum-Output-Format', 'pptx-generated');
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    );
    res.setHeader('Content-Disposition', `attachment; filename="${filnavn}"`);

    return res.send(buffer);
  } catch (err) {
    return res.status(500).json({
      error: err?.message || 'Ukjent feil ved PPTX-generering'
    });
  }
}

export const config = {
  api: {
    bodyParser: { sizeLimit: '20mb' },
    responseLimit: '20mb'
  }
};
