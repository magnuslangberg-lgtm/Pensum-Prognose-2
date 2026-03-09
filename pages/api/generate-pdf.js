
import PptxGenJS from 'pptxgenjs';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

function safeNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function fmtNok(value) {
  const n = safeNumber(value, 0);
  return `${Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} kr`;
}

function fmtPct(value, digits = 1) {
  const n = safeNumber(value, 0);
  return `${n.toFixed(digits)}%`;
}

function cleanText(value, fallback = '—') {
  if (value === null || value === undefined) return fallback;
  const s = String(value).trim();
  return s || fallback;
}

function normalizeProducts(payload) {
  const raw =
    payload?.pensumProdukter ||
    payload?.valgteProdukter ||
    payload?.products ||
    payload?.pensumAllokering ||
    [];

  let list = [];

  if (Array.isArray(raw)) {
    list = raw.map((item, index) => {
      if (typeof item === 'string') {
        return { navn: item, vekt: 0, id: `product-${index}` };
      }
      return {
        id: item?.id || item?.slug || `product-${index}`,
        navn: item?.navn || item?.name || item?.produktnavn || `Produkt ${index + 1}`,
        vekt: safeNumber(item?.vekt ?? item?.weight ?? item?.andel, 0),
        benchmark: item?.benchmark || '',
        risiko: item?.risiko || item?.risikonivaa || '',
        forventetAvkastning: safeNumber(item?.forventetAvkastning ?? item?.expectedReturn, NaN),
        forventetYield: safeNumber(item?.forventetYield ?? item?.yield, NaN),
        rolle: item?.rolle || '',
        pitch: item?.pitch || item?.kortPitch || '',
        investeringscase: item?.investeringscase || item?.case || '',
        hvorforInkludert: item?.hvorforInkludert || '',
        nokkelrisiko: item?.nokkelrisiko || '',
        regioner: Array.isArray(item?.regioner) ? item.regioner : [],
        sektorer: Array.isArray(item?.sektorer) ? item.sektorer : [],
        underliggende: Array.isArray(item?.underliggende) ? item.underliggende : [],
        stil: Array.isArray(item?.stil) ? item.stil : [],
      };
    });
  } else if (raw && typeof raw === 'object') {
    list = Object.entries(raw).map(([key, item], index) => ({
      id: key,
      navn: item?.navn || item?.name || key,
      vekt: safeNumber(item?.vekt ?? item?.weight ?? item?.andel, 0),
      benchmark: item?.benchmark || '',
      risiko: item?.risiko || item?.risikonivaa || '',
      forventetAvkastning: safeNumber(item?.forventetAvkastning ?? item?.expectedReturn, NaN),
      forventetYield: safeNumber(item?.forventetYield ?? item?.yield, NaN),
      rolle: item?.rolle || '',
      pitch: item?.pitch || item?.kortPitch || '',
      investeringscase: item?.investeringscase || item?.case || '',
      hvorforInkludert: item?.hvorforInkludert || '',
      nokkelrisiko: item?.nokkelrisiko || '',
      regioner: Array.isArray(item?.regioner) ? item.regioner : [],
      sektorer: Array.isArray(item?.sektorer) ? item.sektorer : [],
      underliggende: Array.isArray(item?.underliggende) ? item.underliggende : [],
      stil: Array.isArray(item?.stil) ? item.stil : [],
    }));
  }

  list = list
    .filter((p) => cleanText(p.navn) !== '—')
    .map((p) => ({
      ...p,
      vekt: p.vekt > 0 && p.vekt <= 1 ? p.vekt * 100 : p.vekt,
    }))
    .sort((a, b) => safeNumber(b.vekt) - safeNumber(a.vekt));

  return list;
}

function normalizeAllocation(payload) {
  const raw = payload?.allokering || payload?.aktivafordeling || payload?.allocation || [];
  if (Array.isArray(raw) && raw.length) {
    return raw.map((a) => ({
      navn: a?.navn || a?.name || 'Aktivaklasse',
      vekt: safeNumber(a?.vekt ?? a?.weight ?? a?.andel, 0),
    }));
  }
  const products = normalizeProducts(payload);
  const aksjer = products
    .filter((p) => !/høyrente|hoyrente|rente|basis/i.test(p.navn))
    .reduce((s, p) => s + safeNumber(p.vekt), 0);
  const renter = products
    .filter((p) => /høyrente|hoyrente|rente|basis/i.test(p.navn))
    .reduce((s, p) => s + safeNumber(p.vekt), 0);
  return [
    { navn: 'Aksjer', vekt: aksjer },
    { navn: 'Renter', vekt: renter },
  ];
}

function topLines(items, fallbackLabel) {
  if (!Array.isArray(items) || items.length === 0) return [`• Ingen ${fallbackLabel.toLowerCase()} tilgjengelig`];
  return items.slice(0, 8).map((item) => {
    if (typeof item === 'string') return `• ${item}`;
    const name = item?.navn || item?.name || item?.label || fallbackLabel;
    const weight = item?.vekt ?? item?.weight ?? item?.andel;
    if (weight === undefined || weight === null || weight === '') return `• ${name}`;
    const w = safeNumber(weight);
    return `• ${name}: ${fmtPct(w)}`;
  });
}

function addTitle(slide, title, subtitle = '') {
  slide.addText(title, { x: 0.6, y: 0.4, w: 8.8, h: 0.4, fontSize: 24, bold: true, color: '0B2341' });
  if (subtitle) {
    slide.addText(subtitle, { x: 0.6, y: 0.88, w: 8.8, h: 0.3, fontSize: 10, color: '5A6B7B' });
  }
  slide.addShape(PptxGenJS.ShapeType.line, { x: 0.6, y: 1.22, w: 12.1, h: 0, line: { color: 'D9E2EC', pt: 1 } });
}

function addBulletBox(slide, title, lines, x, y, w, h) {
  slide.addShape(PptxGenJS.ShapeType.roundRect, {
    x, y, w, h,
    rectRadius: 0.06,
    line: { color: 'D9E2EC', pt: 1 },
    fill: { color: 'FFFFFF' },
  });
  slide.addText(title, { x: x + 0.18, y: y + 0.12, w: w - 0.36, h: 0.22, fontSize: 11, bold: true, color: '0B2341' });
  slide.addText((lines || []).join('\n'), {
    x: x + 0.18, y: y + 0.42, w: w - 0.36, h: h - 0.5,
    fontSize: 10, color: '243B53', valign: 'top', breakLine: false, margin: 0.02
  });
}

function addKpiRow(slide, items, y = 1.5) {
  const width = 2.7;
  items.slice(0, 4).forEach((item, i) => {
    const x = 0.6 + i * 3.0;
    slide.addShape(PptxGenJS.ShapeType.roundRect, {
      x, y, w: width, h: 1.05,
      rectRadius: 0.06,
      line: { color: 'D9E2EC', pt: 1 },
      fill: { color: 'F8FAFC' },
    });
    slide.addText(cleanText(item.label), { x: x + 0.14, y: y + 0.12, w: width - 0.28, h: 0.2, fontSize: 10, color: '5A6B7B' });
    slide.addText(cleanText(item.value), { x: x + 0.14, y: y + 0.38, w: width - 0.28, h: 0.3, fontSize: 19, bold: true, color: '102A43' });
    if (item.sub) {
      slide.addText(item.sub, { x: x + 0.14, y: y + 0.72, w: width - 0.28, h: 0.16, fontSize: 8, color: '7B8794' });
    }
  });
}

function addSimpleTable(slide, title, rows, x, y, w) {
  slide.addText(title, { x, y, w, h: 0.22, fontSize: 11, bold: true, color: '0B2341' });
  const tableRows = [['Navn', 'Vekt']].concat(
    (rows || []).slice(0, 8).map((r) => [
      cleanText(r?.navn || r?.name || r?.label || '—'),
      r?.vekt !== undefined && r?.vekt !== null ? fmtPct(safeNumber(r.vekt)) : '—'
    ])
  );
  slide.addTable(tableRows, {
    x, y: y + 0.26, w,
    border: { type: 'solid', color: 'D9E2EC', pt: 1 },
    fill: 'FFFFFF',
    color: '102A43',
    fontSize: 9,
    rowH: 0.24,
    margin: 0.03,
  });
}

function buildPptx(payload) {
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_WIDE';
  pptx.author = 'OpenAI';
  pptx.company = 'Pensum Asset Management';
  pptx.subject = 'Investeringsforslag';
  pptx.title = 'Pensum Investeringsforslag';
  pptx.lang = 'nb-NO';

  const kunde = cleanText(payload?.kundeNavn || payload?.kunde || payload?.investor || 'Investor');
  const rapportdato = cleanText(payload?.rapportdato || payload?.rapportDato || new Date().toLocaleDateString('nb-NO'));
  const totalKapital = safeNumber(payload?.totalKapital || payload?.kapital || payload?.belop || 10000000, 10000000);
  const risikoprofil = cleanText(payload?.risikoprofil || payload?.profil || 'Moderat');
  const forventetAvkastning = safeNumber(payload?.forventetAvkastning || payload?.forvAvkastning || 8.9, 8.9);
  const produkter = normalizeProducts(payload);
  const allokering = normalizeAllocation(payload);

  let slide = pptx.addSlide();
  addTitle(slide, 'Pensum Asset Management', 'Investeringsforslag');
  slide.addText(kunde, { x: 0.6, y: 1.8, w: 10.5, h: 0.45, fontSize: 28, bold: true, color: '102A43' });
  slide.addText(`Rapportdato: ${rapportdato}`, { x: 0.6, y: 2.35, w: 5, h: 0.22, fontSize: 11, color: '486581' });
  slide.addText(`Total kapital: ${fmtNok(totalKapital)}`, { x: 0.6, y: 2.7, w: 5, h: 0.22, fontSize: 12, color: '102A43', bold: true });
  slide.addText(`Risikoprofil: ${risikoprofil}`, { x: 0.6, y: 3.0, w: 5, h: 0.22, fontSize: 12, color: '102A43' });

  slide = pptx.addSlide();
  addTitle(slide, 'Sammendrag', 'Overordnet anbefaling og nøkkeltall');
  addKpiRow(slide, [
    { label: 'Kapital', value: fmtNok(totalKapital) },
    { label: 'Risikoprofil', value: risikoprofil },
    { label: 'Forv. avkastning', value: fmtPct(forventetAvkastning) },
    { label: 'Valgte produkter', value: String(produkter.filter((p) => p.vekt > 0).length || produkter.length) },
  ], 1.55);
  addBulletBox(slide, 'Hovedpoenger', [
    `• Porteføljen er satt opp for ${risikoprofil.toLowerCase()} risikoprofil.`,
    `• Valgte Pensum-løsninger brukes som modulære byggesteiner i forslaget.`,
    `• Produktvalg og eksponering presenteres produkt for produkt, ikke bare aggregert.`,
    `• Forventet avkastning i modellen er ${fmtPct(forventetAvkastning)} p.a.`,
  ], 0.6, 3.0, 6.1, 3.3);
  addSimpleTable(slide, 'Valgte Pensum-løsninger', produkter.filter((p) => p.vekt > 0), 7.0, 3.0, 5.2);

  slide = pptx.addSlide();
  addTitle(slide, 'Aktivaklasseallokering', 'Illustrativ fordeling av porteføljen');
  addSimpleTable(slide, 'Fordeling', allokering, 0.7, 1.6, 4.6);
  addBulletBox(slide, 'Kommentar', allokering.map((a) => `• ${cleanText(a.navn)}: ${fmtPct(safeNumber(a.vekt))}`), 5.6, 1.6, 6.6, 2.4);

  slide = pptx.addSlide();
  addTitle(slide, 'Pensum-løsninger i porteføljen', 'Valgte byggesteiner og deres rolle');
  addSimpleTable(slide, 'Produkter og vekter', produkter.filter((p) => p.vekt > 0), 0.7, 1.6, 4.8);
  addBulletBox(slide, 'Brukslogikk', produkter.filter((p) => p.vekt > 0).slice(0, 8).map((p) => {
    const rolle = cleanText(p.rolle, 'Rolle ikke angitt');
    return `• ${p.navn}: ${rolle}`;
  }), 5.8, 1.6, 6.3, 4.6);

  (produkter.filter((p) => p.vekt > 0).slice(0, 6)).forEach((p) => {
    let s = pptx.addSlide();
    addTitle(s, p.navn, cleanText(p.rolle, 'Produktmodul'));
    addKpiRow(s, [
      { label: 'Porteføljevekt', value: fmtPct(p.vekt) },
      { label: 'Benchmark', value: cleanText(p.benchmark) },
      { label: 'Forv. avkastning', value: Number.isFinite(p.forventetAvkastning) ? fmtPct(p.forventetAvkastning) : '—' },
      { label: 'Forv. yield', value: Number.isFinite(p.forventetYield) ? fmtPct(p.forventetYield) : '—' },
    ], 1.55);
    addBulletBox(s, 'Produktets rolle', topLines([
      p.pitch ? `Produktpitch: ${p.pitch}` : null,
      p.investeringscase ? `Investeringscase: ${p.investeringscase}` : null,
      p.hvorforInkludert ? `Hvorfor inkludert: ${p.hvorforInkludert}` : null,
      p.nokkelrisiko ? `Nøkkelrisiko: ${p.nokkelrisiko}` : null,
    ].filter(Boolean), 'punkter'), 0.6, 3.0, 6.1, 3.3);
    addBulletBox(s, 'Eksponering — oversikt', [
      `• Regioner: ${Array.isArray(p.regioner) ? p.regioner.length : 0} datapunkter`,
      `• Sektorer: ${Array.isArray(p.sektorer) ? p.sektorer.length : 0} datapunkter`,
      `• Underliggende: ${Array.isArray(p.underliggende) ? p.underliggende.length : 0} datapunkter`,
      `• Stilfaktorer: ${Array.isArray(p.stil) ? p.stil.length : 0} datapunkter`,
    ], 7.0, 3.0, 5.2, 3.3);

    s = pptx.addSlide();
    addTitle(s, `${p.navn} — eksponering`, 'Regioner, sektorer og underliggende');
    addBulletBox(s, 'Regioner', topLines(p.regioner, 'regioner'), 0.6, 1.6, 3.0, 4.9);
    addBulletBox(s, 'Sektorer', topLines(p.sektorer, 'sektorer'), 3.9, 1.6, 3.0, 4.9);
    addBulletBox(s, 'Underliggende', topLines(p.underliggende, 'underliggende'), 7.2, 1.6, 5.0, 3.1);
    addBulletBox(s, 'Stilfaktorer', topLines(p.stil, 'stilfaktorer'), 7.2, 4.95, 5.0, 1.55);
  });

  return pptx;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const pptx = buildPptx(req.body || {});
    const buffer = await pptx.write({ outputType: 'nodebuffer' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
    res.setHeader('Content-Disposition', 'attachment; filename="Pensum_Investeringsforslag.pptx"');
    return res.status(200).send(Buffer.from(buffer));
  } catch (error) {
    console.error('PPTX generation failed:', error);
    return res.status(500).json({ error: error?.message || 'Ukjent feil ved generering av presentasjon' });
  }
}
