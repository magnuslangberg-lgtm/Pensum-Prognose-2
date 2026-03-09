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
  danger: 'B42318'
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
    preferredChart: 'region-sector'
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
    preferredChart: 'region-sector'
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
    preferredChart: 'underlying'
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
    preferredChart: 'underlying'
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
    preferredChart: 'underlying'
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
    preferredChart: 'underlying'
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
    preferredChart: 'underlying'
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
    preferredChart: 'underlying'
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
    preferredChart: 'underlying'
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
  return String(text || 'Kunde').replace(/\s+/g, '_').replace(/[^A-Za-z0-9_\-.æøåÆØÅ]/g, '');
}

function formatDateLabel(dateStr = '') {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('nb-NO');
}

function pickProducts(payload) {
  const selectedIds = Array.isArray(payload.produkterIBruk) ? payload.produkterIBruk : [];
  const exposureMap = payload.produktEksponering || {};
  const products = Array.isArray(payload.pensumProdukter) ? payload.pensumProdukter : [];
  const allokMap = new Map((Array.isArray(payload.pensumAllokering) ? payload.pensumAllokering : []).map((p) => [p.id, n(p.vekt)]));
  const byId = new Map(products.map((p) => [p.id, p]));
  const selected = (selectedIds.length ? selectedIds : products.map((p) => p.id))
    .map((id) => {
      const raw = byId.get(id) || { id, navn: PRODUCT_LABELS[id] || id };
      const meta = PRODUCT_META[id] || {};
      const exposure = exposureMap[id] || {};
      return {
        ...meta,
        ...raw,
        id,
        navn: raw.navn || PRODUCT_LABELS[id] || id,
        vekt: n(raw.vekt, allokMap.get(id) ?? 0),
        exposure,
        aar2026: n(raw.aar2026, NaN),
        aar2025: n(raw.aar2025, NaN),
        aar2024: n(raw.aar2024, NaN),
        aar2023: n(raw.aar2023, NaN),
        aar2022: n(raw.aar2022, NaN),
      };
    })
    .filter((p) => p.vekt > 0)
    .sort((a, b) => b.vekt - a.vekt);
  if (selected.length === 0) return [];
  const total = selected.reduce((s, p) => s + n(p.vekt), 0) || 1;
  return selected.map((p) => ({ ...p, vekt: Number(((p.vekt / total) * 100).toFixed(1)) }));
}

function normalizePayload(payload = {}) {
  const total = n(payload.totalKapital, 0);
  const horisont = Math.max(1, Math.round(n(payload.horisont, 10)));
  const expected = n(payload.vektetAvkastning, 7.5);
  const products = pickProducts(payload);
  const alloc = (Array.isArray(payload.allokering) ? payload.allokering : [])
    .map((a) => ({ navn: a.navn || 'Ukjent', vekt: n(a.vekt), kategori: a.kategori || '' }))
    .filter((a) => a.vekt > 0)
    .sort((a, b) => b.vekt - a.vekt);
  const expValue = total * Math.pow(1 + (expected / 100), horisont);
  const eksponering = payload.eksponering || { sektorer: [], regioner: [] };
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
    produktHistorikk: payload.produktHistorikk || {}
  };
}

function normalizePayload(payload = {}) {
  const total = n(payload.totalKapital, 0);
  const horisont = Math.max(1, Math.round(n(payload.horisont, 10)));
  const expected = n(payload.vektetAvkastning, 7.5);
  const products = pickProducts(payload);
  const alloc = (Array.isArray(payload.allokering) ? payload.allokering : [])
    .map((a) => ({ navn: a.navn || 'Ukjent', vekt: n(a.vekt), kategori: a.kategori || '' }))
    .filter((a) => a.vekt > 0)
    .sort((a, b) => b.vekt - a.vekt);
  const expValue = total * Math.pow(1 + (expected / 100), horisont);
  const eksponering = payload.eksponering || { sektorer: [], regioner: [] };
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
    produktHistorikk: payload.produktHistorikk || {}
  };
}


function addHeader(slide, title, subtitle = '', pageNo = '') {
  slide.background = { color: COLORS.white };
  slide.addText('PENSUM ASSET MANAGEMENT', { x: 0.55, y: 0.22, w: 4.5, h: 0.18, fontSize: 10, color: COLORS.navy, bold: true });
  if (pageNo) slide.addText(`Side ${pageNo}`, { x: 11.6, y: 0.22, w: 1.0, h: 0.18, fontSize: 9, color: COLORS.muted, align: 'right' });
  slide.addText(title, { x: 0.8, y: 0.8, w: 10.5, h: 0.45, fontSize: 24, bold: true, color: COLORS.navy });
  if (subtitle) slide.addText(subtitle, { x: 0.8, y: 1.22, w: 11.6, h: 0.25, fontSize: 11, color: COLORS.muted });
}

function addSectionLabel(slide, text, x, y, w = 3.0) {
  slide.addText(text, { x, y, w, h: 0.18, fontSize: 10, color: COLORS.muted, bold: true });
}

function addInfoBlock(slide, x, y, w, title, body, accent = COLORS.navy) {
  slide.addText(title, { x, y, w, h: 0.18, fontSize: 10, color: COLORS.muted, bold: true });
  slide.addText(String(body || '—'), { x, y: y + 0.2, w, h: 0.42, fontSize: 16, color: accent, bold: true });
}

function addNarrative(slide, x, y, w, paragraphs = []) {
  const textRuns = [];
  paragraphs.filter(Boolean).forEach((p, idx) => {
    textRuns.push({ text: p });
    if (idx < paragraphs.length - 1) textRuns.push({ text: '\n' });
  });
  slide.addText(textRuns, { x, y, w, h: 2.2, fontSize: 14, color: COLORS.text, breakLine: false, valign: 'top', margin: 0 });
}

function bulletLines(product) {
  return [product.pitch, product.case, product.why].filter(Boolean).map((line) => `• ${line}`);
}

function topRows(arr = [], top = 8) {
  return (Array.isArray(arr) ? arr : []).slice(0, top).map((row) => ({ navn: row.navn || 'Ukjent', vekt: n(row.vekt) }));
}

function tableRowsWithHeader(header, rows) {
  return [header, ...(rows.length ? rows : [['—', '—']])];
}

function safePctRows(arr = [], top = 8) {
  return topRows(arr, top).map((r) => [r.navn, pct(r.vekt)]);
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
    addHeader(s, 'Investeringsforslag', d.kundeNavn, page++);
    s.addText('Illustrativ porteføljesammensetning utarbeidet av Pensum Asset Management.', {
      x: 0.8, y: 2.0, w: 8.4, h: 0.35, fontSize: 16, color: COLORS.text
    });
    addInfoBlock(s, 0.9, 3.0, 2.4, 'Kapital', `${currency(d.total)} kr`);
    addInfoBlock(s, 3.6, 3.0, 2.1, 'Risikoprofil', d.risikoProfil, COLORS.salmon);
    addInfoBlock(s, 5.9, 3.0, 2.2, 'Forv. avkastning', pct(d.expected), COLORS.green);
    addInfoBlock(s, 8.4, 3.0, 3.4, 'Forv. sluttverdi', `${currency(d.expValue)} kr`, COLORS.navy);
    s.addText(formatDateLabel(d.dato), { x: 0.9, y: 6.5, w: 2.4, h: 0.2, fontSize: 11, color: COLORS.muted });
  }

  // 2 Viktig informasjon
  {
    const s = pptx.addSlide();
    addHeader(s, 'Viktig informasjon', 'Illustrativt forslag – ikke investeringsråd før egnethetsvurdering', page++);
    addNarrative(s, 0.9, 1.9, 11.6, [
      'Dette dokumentet er utarbeidet som en illustrativ investeringsskisse basert på overordnede opplysninger og valgt porteføljesammensetning i verktøyet.',
      'Forslaget er ikke vurdert opp mot kundens samlede finansielle situasjon, skatteforhold eller likviditetsbehov, og utgjør derfor ikke en endelig investeringsanbefaling.',
      'Før en eventuell investering må det gjennomføres ordinær egnethetsvurdering, og endelig sammensetning kan avvike fra illustrasjonen under.'
    ]);
  }

  // 3 Overordnede forutsetninger
  {
    const s = pptx.addSlide();
    addHeader(s, 'Overordnede forutsetninger', 'Hva porteføljen bygger på', page++);
    addInfoBlock(s, 0.9, 1.9, 2.6, 'Investerbart beløp', `${currency(d.total)} kr`);
    addInfoBlock(s, 3.9, 1.9, 2.0, 'Risikoprofil', d.risikoProfil, COLORS.salmon);
    addInfoBlock(s, 6.2, 1.9, 2.2, 'Tidshorisont', `${d.horisont} år`, COLORS.teal);
    addInfoBlock(s, 8.7, 1.9, 2.2, 'Målsetting', 'Langsiktig verdiskaping', COLORS.green);
    addNarrative(s, 0.9, 3.1, 11.5, [
      'Porteføljen er satt sammen for å gi en balansert kombinasjon av globale vekstdrivere, nordisk spesialeksponering og en rentedel som skal bidra med løpende avkastning og stabilitet.',
      'Produktsidene som følger viser hva hvert valgt produkt faktisk inneholder, slik at porteføljen kan vurderes både på totalnivå og byggesteinsnivå.'
    ]);
  }

  // 4 Allokering
  {
    const s = pptx.addSlide();
    addHeader(s, 'Forslag til porteføljesammensetning', 'Illustrativ sammensetning av valgt portefølje', page++);
    const allocRows = d.alloc.map((a) => [a.navn, pct(a.vekt), `${currency((a.vekt / 100) * d.total)} kr`]);
    s.addTable(
      tableRowsWithHeader(
        [{ text: 'Aktivaklasse', options: { bold: true, color: COLORS.navy } }, { text: 'Vekt', options: { bold: true, color: COLORS.navy } }, { text: 'Beløp', options: { bold: true, color: COLORS.navy } }],
        allocRows
      ),
      { x: 0.9, y: 1.9, w: 5.6, fontSize: 11, rowH: 0.34, margin: 0.06 }
    );
    const productRows = d.products.map((p) => [p.navn, pct(p.vekt), `${currency((p.vekt / 100) * d.total)} kr`]);
    s.addTable(
      tableRowsWithHeader(
        [{ text: 'Produkt', options: { bold: true, color: COLORS.navy } }, { text: 'Vekt', options: { bold: true, color: COLORS.navy } }, { text: 'Beløp', options: { bold: true, color: COLORS.navy } }],
        productRows
      ),
      { x: 6.9, y: 1.9, w: 5.5, fontSize: 10, rowH: 0.3, margin: 0.05 }
    );
    addNarrative(s, 0.9, 5.55, 11.4, [
      'Aksjedelen er bygget opp med globale og nordiske strategier som skal gi bred eksponering og flere uavhengige avkastningsdrivere.',
      'Rentedelen skal bidra med løpende avkastning og fungere som en stabiliserende komponent i den samlede porteføljen.'
    ]);
  }

  // 5 Aksjedelen / rentedelen
  {
    const s = pptx.addSlide();
    addHeader(s, 'Hvordan porteføljen er bygget opp', 'Aksjedelen og rentedelen', page++);
    const aksjeprodukter = d.products.filter((p) => ['aksjer', 'equity', 'fondsportefolje', 'enkeltfond'].some((k) => String(p.kategori || '').toLowerCase().includes(k)) || !String(p.kategori || '').toLowerCase().includes('rente'));
    const renteprodukter = d.products.filter((p) => String(p.kategori || '').toLowerCase().includes('rente'));
    addSectionLabel(s, 'Aksjedelen', 0.9, 1.9);
    addNarrative(s, 0.9, 2.15, 5.5, [
      'Aksjedelen fordeler kapitalen mellom globale og nordiske aksjer. Størstedelen plasseres i brede, aktivt forvaltede løsninger som kan kombinere kvalitetsforvaltere med ulike investeringsstiler og markedssegmenter.',
      aksjeprodukter.length ? `Valgte byggesteiner i aksjedelen er blant annet ${aksjeprodukter.map((p) => p.navn).join(', ')}.` : null
    ]);
    addSectionLabel(s, 'Rentedelen', 6.9, 1.9);
    addNarrative(s, 6.9, 2.15, 5.3, [
      'Rentedelen er ment å gi løpende avkastning og samtidig fungere som en stabiliserende buffer i perioder med markedsuro.',
      renteprodukter.length ? `Valgte byggesteiner i rentedelen er ${renteprodukter.map((p) => p.navn).join(', ')}.` : 'Rentedelen synliggjøres i allokeringen og kan utvides med flere renteprodukter ved behov.'
    ]);
  }

  // 6 Hvorfor denne sammensetningen
  {
    const s = pptx.addSlide();
    addHeader(s, 'Hvorfor denne sammensetningen', 'Porteføljelogikk og rollefordeling', page++);
    const top = d.products[0];
    const bullets = [
      top ? `${top.navn} er største byggestein i porteføljen med ${pct(top.vekt)} vekt og fungerer som sentral driver i porteføljen.` : null,
      'Porteføljen kombinerer globale og nordiske eksponeringer for å balansere bredde og spesialisering.',
      'Hver byggestein er valgt med en tydelig rolle i porteføljen, slik at totalen skal bli mer robust enn summen av enkeltproduktene.',
      'Produktsidene som følger viser eksponering produkt for produkt, ikke bare aggregert totalportefølje.'
    ].filter(Boolean).map((b) => [b]);
    s.addTable(
      tableRowsWithHeader([{ text: 'Hovedpoenger', options: { bold: true, color: COLORS.navy } }], bullets),
      { x: 0.9, y: 1.9, w: 11.4, fontSize: 12, rowH: 0.45, margin: 0.08 }
    );
  }

  // 7 Aggregert eksponering (sekundær)
  {
    const s = pptx.addSlide();
    addHeader(s, 'Aggregert porteføljeeksponering', 'Sekundær oppsummering på tvers av valgte produkter', page++);
    const sekt = safePctRows(d.eksponering?.sektorer, 8);
    const reg = safePctRows(d.eksponering?.regioner, 8);
    s.addTable(
      tableRowsWithHeader([{ text: 'Sektorer', options: { bold: true, color: COLORS.navy } }, { text: 'Vekt', options: { bold: true, color: COLORS.navy } }], sekt),
      { x: 0.9, y: 1.9, w: 5.5, fontSize: 10, rowH: 0.28, margin: 0.05 }
    );
    s.addTable(
      tableRowsWithHeader([{ text: 'Regioner', options: { bold: true, color: COLORS.navy } }, { text: 'Vekt', options: { bold: true, color: COLORS.navy } }], reg),
      { x: 6.9, y: 1.9, w: 5.4, fontSize: 10, rowH: 0.28, margin: 0.05 }
    );
  }

  d.products.forEach((p) => {
    const sectors = safePctRows(p.exposure?.sektorer, 8);
    const regions = safePctRows(p.exposure?.regioner, 8);
    const holdings = safePctRows(p.exposure?.underliggende, 10);
    const style = safePctRows(p.exposure?.stil, 8);

    // Produktslide 1
    {
      const s = pptx.addSlide();
      addHeader(s, p.title || p.navn, p.subtitle || 'Rolle og investeringscase', page++);
      addInfoBlock(s, 0.9, 1.9, 1.8, 'Vekt', pct(p.vekt), COLORS.navy);
      addInfoBlock(s, 3.0, 1.9, 2.3, 'Forv. avkastning', pct(p.expectedReturn ?? 0), COLORS.green);
      addInfoBlock(s, 5.6, 1.9, 2.2, 'Forv. yield', pct(p.expectedYield ?? 0), COLORS.teal);
      addInfoBlock(s, 8.1, 1.9, 3.9, 'Benchmark', p.benchmark || '—', COLORS.salmon);

      addSectionLabel(s, 'Rolle i porteføljen', 0.9, 3.0);
      s.addText(p.role || 'Byggestein i porteføljen', { x: 0.9, y: 3.25, w: 4.8, h: 0.38, fontSize: 18, color: COLORS.navy, bold: true });

      addSectionLabel(s, 'Hvorfor inkludert', 0.9, 3.95);
      addNarrative(s, 0.9, 4.2, 5.7, [p.pitch, p.case, p.why].filter(Boolean));

      addSectionLabel(s, 'Nøkkelrisiko', 7.0, 3.0);
      addNarrative(s, 7.0, 3.25, 5.2, [p.risk || 'Markedsrisiko og normal verdiutvikling i tråd med produktets mandat.']);

      if (p.exposure?.disclaimer) {
        addSectionLabel(s, 'Kommentar', 7.0, 5.0);
        s.addText(p.exposure.disclaimer, { x: 7.0, y: 5.25, w: 5.0, h: 0.8, fontSize: 10, color: COLORS.muted, italic: true });
      }
    }

    // Produktslide 2
    {
      const s = pptx.addSlide();
      addHeader(s, `${p.navn} – innhold og eksponering`, 'Produktspesifikk eksponering', page++);
      s.addTable(
        tableRowsWithHeader([{ text: 'Sektorer', options: { bold: true, color: COLORS.navy } }, { text: 'Vekt', options: { bold: true, color: COLORS.navy } }], sectors),
        { x: 0.9, y: 1.9, w: 5.4, fontSize: 9, rowH: 0.25, margin: 0.05 }
      );
      s.addTable(
        tableRowsWithHeader([{ text: 'Regioner', options: { bold: true, color: COLORS.navy } }, { text: 'Vekt', options: { bold: true, color: COLORS.navy } }], regions),
        { x: 6.8, y: 1.9, w: 5.4, fontSize: 9, rowH: 0.25, margin: 0.05 }
      );
      s.addTable(
        tableRowsWithHeader([{ text: 'Underliggende investeringer', options: { bold: true, color: COLORS.navy } }, { text: 'Vekt', options: { bold: true, color: COLORS.navy } }], holdings),
        { x: 0.9, y: 4.35, w: 5.8, fontSize: 9, rowH: 0.23, margin: 0.05 }
      );
      s.addTable(
        tableRowsWithHeader([{ text: 'Stil / øvrig', options: { bold: true, color: COLORS.navy } }, { text: 'Vekt', options: { bold: true, color: COLORS.navy } }], style),
        { x: 7.1, y: 4.35, w: 5.1, fontSize: 9, rowH: 0.23, margin: 0.05 }
      );
    }
  });

  return pptx;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    if (!PptxGenJS) throw new Error('pptxgenjs er ikke tilgjengelig');
    const pptx = buildGeneratedDeck(req.body || {});
    const buffer = await pptx.write({ outputType: 'nodebuffer' });
    const kunde = safeFilename(req.body?.kundeNavn || 'Kunde');
    const filnavn = `Pensum_Investeringsforslag_${kunde}_${new Date().toISOString().slice(0, 10)}.pptx`;
    res.setHeader('X-Pensum-Output-Format', 'pptx-generated');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
    res.setHeader('Content-Disposition', `attachment; filename="${filnavn}"`);
    return res.send(buffer);
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Ukjent feil ved PPTX-generering' });
  }
}

export const config = {
  api: { bodyParser: { sizeLimit: '20mb' }, responseLimit: '20mb' }
};
