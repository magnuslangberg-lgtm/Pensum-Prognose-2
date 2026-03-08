import pptxgen from 'pptxgenjs';

const COLORS = {
  navy: '102A43',
  blue: '1F5AA6',
  lightBlue: 'EAF1FB',
  text: '243B53',
  muted: '627D98',
  line: 'D9E2EC',
  white: 'FFFFFF',
};

function addHeader(slide, title, subtitle = '') {
  slide.addText(title, { x: 0.7, y: 0.4, w: 11.5, h: 0.4, fontFace: 'Aptos', fontSize: 22, bold: true, color: COLORS.navy });
  if (subtitle) slide.addText(subtitle, { x: 0.7, y: 0.82, w: 11.5, h: 0.25, fontFace: 'Aptos', fontSize: 10, color: COLORS.muted });
  slide.addShape(pptx.ShapeType.line, { x: 0.7, y: 1.15, w: 11.6, h: 0, line: { color: COLORS.line, pt: 1 } });
}

function addFooter(slide) {
  slide.addText('Illustrativ modellportefølje – ikke personlig investeringsråd eller egnethetsvurdering.', {
    x: 0.7, y: 6.95, w: 11.5, h: 0.2, fontFace: 'Aptos', fontSize: 8, color: COLORS.muted,
  });
}

function addBullets(slide, items, x, y, w) {
  const runs = [];
  items.filter(Boolean).forEach((item) => {
    runs.push({ text: `• ${item}`, options: { breakLine: true } });
  });
  slide.addText(runs, { x, y, w, h: 2, fontFace: 'Aptos', fontSize: 11, color: COLORS.text, valign: 'top' });
}

function addKpiCards(slide, metrics = [], y = 1.5) {
  const gap = 0.2;
  const width = 3.6;
  metrics.slice(0, 3).forEach((metric, idx) => {
    const x = 0.7 + idx * (width + gap);
    slide.addShape(pptx.ShapeType.roundRect, { x, y, w: width, h: 0.9, rectRadius: 0.08, fill: { color: COLORS.lightBlue }, line: { color: COLORS.lightBlue, pt: 1 } });
    slide.addText(metric.label || 'KPI', { x: x + 0.15, y: y + 0.12, w: width - 0.3, h: 0.18, fontFace: 'Aptos', fontSize: 9, color: COLORS.muted });
    slide.addText(metric.value || '–', { x: x + 0.15, y: y + 0.35, w: width - 0.3, h: 0.28, fontFace: 'Aptos', fontSize: 18, bold: true, color: COLORS.navy });
  });
}

export async function generateProposalPptxV2(model) {
  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_WIDE';
  pptx.author = 'OpenAI';
  pptx.company = 'Pensum Asset Management';
  pptx.subject = 'Illustrativ investeringsskisse';
  pptx.title = `Pensum – ${model?.meta?.customerName || 'Kunde'}`;
  pptx.lang = 'nb-NO';
  pptx.theme = {
    headFontFace: 'Aptos',
    bodyFontFace: 'Aptos',
    lang: 'nb-NO',
  };

  let slide = pptx.addSlide();
  slide.background = { color: COLORS.white };
  slide.addText('Illustrativ investeringsskisse', { x: 0.9, y: 1.1, w: 6.2, h: 0.55, fontFace: 'Aptos', fontSize: 24, bold: true, color: COLORS.navy });
  slide.addText(`Utarbeidet av Pensum Asset Management AS for ${model?.meta?.customerName || 'Kunde'}`, { x: 0.9, y: 1.75, w: 7.5, h: 0.28, fontFace: 'Aptos', fontSize: 12, color: COLORS.text });
  slide.addText(model?.meta?.reportDate || '', { x: 0.9, y: 2.1, w: 2.5, h: 0.2, fontFace: 'Aptos', fontSize: 10, color: COLORS.muted });
  addFooter(slide);

  slide = pptx.addSlide();
  addHeader(slide, 'Executive summary', 'Hovedtrekk i den illustrerte porteføljesammensetningen');
  addBullets(slide, model.executiveSummary || [], 0.9, 1.5, 10.8);
  addKpiCards(slide, [
    { label: 'Risikoprofil', value: model?.meta?.riskProfile || 'Balansert' },
    { label: 'Antall Pensum-produkter', value: String(model?.overview?.totalProducts || 0) },
    { label: 'Planlagte produktslides', value: String(model?.overview?.plannedProductSlides || 0) },
  ], 3.2);
  addFooter(slide);

  slide = pptx.addSlide();
  addHeader(slide, 'Porteføljebyggesteiner', 'Valgte produkter med faktisk vekt i illustrasjonen');
  const rows = (model.productNodes || []).map((p) => [p.name, `${(p.weight * 100).toFixed(1)}%`, p.roleInPortfolio || 'Byggestein', p.benchmark || '–']);
  slide.addTable([['Produkt', 'Vekt', 'Rolle', 'Benchmark'], ...rows], {
    x: 0.7, y: 1.45, w: 11.5, h: 0.3,
    border: { type: 'solid', pt: 1, color: COLORS.line },
    fill: COLORS.white,
    color: COLORS.text,
    fontFace: 'Aptos',
    fontSize: 10,
    rowH: 0.34,
    bold: false,
    valign: 'mid',
    autoFit: true,
    margin: 0.05,
    colW: [4.0, 1.1, 2.6, 3.2],
  });
  addFooter(slide);

  for (const product of model.productNodes || []) {
    const [focus1, focus2, focus3] = product.blueprint?.narrativeFocus || [];
    slide = pptx.addSlide();
    addHeader(slide, product.slideTitle || product.name, product.slideSubtitle || 'Rolle i porteføljen');
    addKpiCards(slide, product.topMetrics, 1.45);
    addBullets(slide, [
      product.pitchShort,
      product.investmentCase,
      focus1 && `Fremhever ${focus1}.`,
      focus2 && `Bidrar med ${focus2}.`,
      focus3 && `Rollen i porteføljen er knyttet til ${focus3}.`,
    ], 0.9, 2.7, 10.8);
    addFooter(slide);

    if ((product.blueprint?.slideCount || 0) > 1) {
      slide = pptx.addSlide();
      addHeader(slide, `${product.name} – nøkkeltall og dataplan`, 'Plassholder for regioner, sektorer, holdings og historikk');
      slide.addText(`Foretrukne diagrammer: ${(product.blueprint?.preferredCharts || []).join(', ')}`, { x: 0.9, y: 1.5, w: 10.5, h: 0.25, fontFace: 'Aptos', fontSize: 11, color: COLORS.text });
      addBullets(slide, [
        'Neste steg er å koble strukturerte eksponeringsdata per produkt direkte inn i denne modulen.',
        'Morningstar-data bør fylles inn som regionfordeling, sektorfordeling og topposisjoner.',
        'Da kan denne sliden rendres med ekte diagrammer i samme Pensum-drakt.',
      ], 0.9, 2.0, 10.8);
      addFooter(slide);
    }
  }

  slide = pptx.addSlide();
  addHeader(slide, 'Oppsummering og neste steg', 'Forslaget er illustrativt og må kvalitetssikres i rådgiverløpet');
  addBullets(slide, [
    'Gjennomgå foreslått sammensetning og eventuelle kundespesifikke preferanser.',
    'Oppdater porteføljevekter, produktinnhold og relevante forutsetninger ved behov.',
    'Ved videre prosess må løsningene vurderes i en full kundeetablering og egnethetsvurdering.',
  ], 0.9, 1.5, 10.8);
  addFooter(slide);

  const buffer = await pptx.write({ outputType: 'nodebuffer' });
  return buffer;
}

export default generateProposalPptxV2;
