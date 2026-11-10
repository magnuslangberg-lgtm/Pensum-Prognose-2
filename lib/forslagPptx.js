// Lager investeringsforslaget som ekte, redigerbare PowerPoint-lysbilder i Pensums
// tilbudsmal (lys grå bunn, hvite kort, mørkeblå felt, kobberfargede etiketter).
// Tar en ferdig modell fra lib/forslagModell.js og tegner bare det som står der.

const F = { navy: '0F2A44', kobber: 'D98A6A', blaa: '4F86A4', graa: '6B7A89', moerkGraa: '4D5F72', linje: 'D5D9DE', bunn: 'E6E6E6', lys: 'EEF1F4', hvit: 'FFFFFF', groenn: '2D6A4F', roed: 'B4442F', gull: 'A67B3D', teal: '2D6A6A' };
const SERIEFARGER = ['0F2A44', '4F86A4', 'D98A6A', '2D6A6A', 'A67B3D', '5B4FA0', '2D6A4F', '8FA3B5', 'B4442F', 'C9B38F', '1B4F72', '9C6B98', '7A8B3A', 'E0B080', '566573', 'A93226'];
const FONT = 'Calibri';
const SERIF = 'Cambria';
const B = 10; const H = 5.625; const M = 0.3; // lysbilde 16:9 i tommer

const kutt = (t, n) => (String(t).length > n ? `${String(t).slice(0, n - 1).trimEnd()}…` : String(t));
const NB = ' ';
const tall = (v, d = 1) => Number(v).toFixed(d).replace('.', ',').replace('-', '−');
export const pst = (v, d = 1) => (v == null || !Number.isFinite(v) ? '–' : `${tall(v, d)}${NB}%`);
const pstFortegn = (v, d = 1) => (v == null || !Number.isFinite(v) ? '–' : `${v > 0 ? '+' : ''}${tall(v, d)}${NB}%`);
export const kr = (v) => `${Math.round(v).toLocaleString('nb-NO').replace(/\s/g, NB)}${NB}kr`;
export const mill = (v) => (Math.abs(v) >= 1e6 ? `${tall(v / 1e6, Math.abs(v) >= 1e8 ? 0 : 1)}${NB}mill.${NB}kr` : kr(v));
const datoTekst = (d) => `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
const MND = ['jan', 'feb', 'mar', 'apr', 'mai', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'des'];

// Sider som alltid er med, og valgfrie tilleggssider (fra tilbudsmalen).
export const FORSLAG_SIDER = [
  { id: 'forside', navn: 'Forside', fast: true },
  { id: 'kortetrekk', navn: 'Forslaget i korte trekk', fast: true },
  { id: 'mandat', navn: 'Kundeprofil og mandat', fast: true },
  { id: 'derfor', navn: 'Derfor Pensum' },
  { id: 'portefolje', navn: 'Porteføljesammensetning' },
  { id: 'oppbygging', navn: 'Slik er porteføljen bygget' },
  { id: 'historikk', navn: 'Historisk utvikling' },
  { id: 'scenarioer', navn: 'Forventet utvikling' },
  { id: 'eksponering', navn: 'Hvor er pengene investert?' },
  { id: 'faktaark', navn: 'Faktaark per produkt' },
  { id: 'kostnader', navn: 'Kostnader', tillegg: true },
  { id: 'filosofi', navn: 'Investeringsfilosofi', tillegg: true },
  { id: 'risikostyring', navn: 'Risikostyring og risikokontroll', tillegg: true },
  { id: 'oppfolging', navn: 'Rebalansering og forvalteroppfølging', tillegg: true },
  { id: 'rapportering', navn: 'Rapportering og oppfølging', tillegg: true },
  { id: 'organisasjon', navn: 'Organisering, kompetanse og soliditet', tillegg: true },
  { id: 'nestesteg', navn: 'Neste steg', fast: true },
  { id: 'viktig', navn: 'Viktig informasjon', fast: true }
];
export const standardSider = () => FORSLAG_SIDER.filter((s) => !s.tillegg).map((s) => s.id);

export function lagForslagPptx(PptxGenJS, modell, { sider = standardSider(), assets = {}, tekster = {} } = {}) {
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_16x9';
  pptx.author = 'Pensum Asset Management';
  pptx.company = 'Pensum Asset Management';
  pptx.title = `Investeringsforslag ${modell.kunde}`;
  const m = modell;
  let sidenr = 0;
  const bunntekst = `Pensum Asset Management  ·  Investeringsforslag  ·  ${m.kunde}  ·  ${datoTekst(m.dato)}`;

  // ---------- byggeklosser ----------
  const tekst = (s, t, o) => s.addText(t, { fontFace: FONT, fontSize: 9, color: F.navy, margin: 0, valign: 'top', ...o });
  const etikett = (s, t, x, y, w, farge = F.kobber) => tekst(s, String(t).toUpperCase(), { x, y, w, h: 0.18, fontSize: 6.5, color: farge, charSpacing: 2.5, bold: true });
  const kort = (s, x, y, w, h, fyll = F.hvit) => s.addShape(pptx.ShapeType.rect, { x, y, w, h, fill: { color: fyll }, line: { color: fyll, width: 0 } });
  const strek = (s, x, y, w, farge = F.linje) => s.addShape(pptx.ShapeType.line, { x, y, w, h: 0, line: { color: farge, width: 0.5 } });

  const side = (tittel, { ingress } = {}) => {
    const s = pptx.addSlide(); sidenr += 1;
    s.background = { color: F.bunn };
    tekst(s, tittel, { x: M, y: 0.24, w: B - 2 * M - 1.3, h: 0.5, fontSize: 19, valign: 'middle', fit: 'shrink' });
    if (assets.logoLys) s.addImage({ path: assets.logoLys, x: B - M - 0.95, y: 0.2, w: 0.95, h: 0.464 });
    if (ingress) tekst(s, ingress, { x: M, y: 0.86, w: B - 2 * M - 0.6, h: 0.42, fontFace: SERIF, fontSize: 10.5, color: F.navy });
    tekst(s, bunntekst, { x: M, y: H - 0.3, w: 7, h: 0.18, fontSize: 6.5, color: F.graa });
    tekst(s, String(sidenr), { x: B - M - 0.5, y: H - 0.3, w: 0.5, h: 0.18, fontSize: 6.5, color: F.graa, align: 'right' });
    return s;
  };
  const TOPP = 1.02; const TOPP_INGRESS = 1.38; const BUNN = H - 0.42;

  const skille = (nr, tittel, punkter = []) => {
    const s = pptx.addSlide(); sidenr += 1;
    s.background = { color: F.navy };
    if (assets.logoMork) s.addImage({ path: assets.logoMork, x: M, y: 0.25, w: 0.95, h: 0.464 });
    s.addShape(pptx.ShapeType.ellipse, { x: 6.0, y: 0.9, w: 3.6, h: 3.6, fill: { color: '1B3A5A' }, line: { color: '2C4763', width: 0.75 } });
    tekst(s, nr, { x: 6.0, y: 2.15, w: 3.6, h: 1.1, fontSize: String(nr).length > 2 ? 30 : 54, color: F.kobber, align: 'center', valign: 'middle' });
    tekst(s, tittel, { x: M + 0.1, y: 2.0, w: 5, h: 0.6, fontSize: 28, color: F.hvit });
    tekst(s, punkter.join('\n'), { x: M + 0.1, y: 2.7, w: 5, h: 1.6, fontSize: 10, color: 'B8C4D0', lineSpacingMultiple: 1.25 });
    return s;
  };

  const noekkeltall = (s, x, y, w, etikettTekst, verdi, { under, moerk = false, farge } = {}) => {
    kort(s, x, y, w, 0.86, moerk ? F.navy : F.hvit);
    etikett(s, etikettTekst, x + 0.14, y + 0.11, w - 0.28, moerk ? F.kobber : F.graa);
    tekst(s, verdi, { x: x + 0.14, y: y + 0.3, w: w - 0.28, h: 0.34, fontSize: 17, color: farge || (moerk ? F.hvit : F.navy), valign: 'middle', fit: 'shrink' });
    if (under) tekst(s, under, { x: x + 0.14, y: y + 0.64, w: w - 0.28, h: 0.16, fontSize: 7, color: moerk ? 'B8C4D0' : F.graa });
  };

  // Vannrette søyler med navn og prosent (ev. sammenlignet med en referanse).
  const soyler = (s, x, y, w, rader, { farge = F.navy, ref = null, radH = 0.21, navnW = 1.5 } = {}) => {
    const maks = Math.max(1, ...rader.map((r) => r.vekt), ...(ref ? rader.map((r) => ref[r.navn] || 0) : []));
    const tallW = ref ? 0.95 : 0.5; const soyleW = w - navnW - tallW - 0.1;
    rader.forEach((r, i) => {
      const yy = y + i * radH;
      tekst(s, r.navn, { x, y: yy, w: navnW, h: radH, fontSize: 7.5, valign: 'middle', fit: 'shrink' });
      s.addShape(pptx.ShapeType.rect, { x: x + navnW, y: yy + radH * 0.28, w: Math.max(0.01, soyleW * r.vekt / maks), h: radH * (ref ? 0.22 : 0.44), fill: { color: farge }, line: { color: farge, width: 0 } });
      if (ref) {
        s.addShape(pptx.ShapeType.rect, { x: x + navnW, y: yy + radH * 0.56, w: Math.max(0.01, soyleW * (ref[r.navn] || 0) / maks), h: radH * 0.22, fill: { color: 'B8C4D0' }, line: { color: 'B8C4D0', width: 0 } });
        tekst(s, [{ text: pst(r.vekt), options: { bold: true } }, { text: `   ${pst(ref[r.navn] ?? null)}`, options: { color: F.graa } }], { x: x + w - tallW, y: yy, w: tallW, h: radH, fontSize: 7.5, align: 'right', valign: 'middle' });
      } else {
        tekst(s, pst(r.vekt), { x: x + w - tallW, y: yy, w: tallW, h: radH, fontSize: 7.5, bold: true, align: 'right', valign: 'middle' });
      }
    });
  };

  const tabell = (s, x, y, w, hode, rader, kolW, { fontSize = 8, radH = 0.26, sum = null } = {}) => {
    const celle = (t, o = {}) => ({ text: String(t), options: { fontFace: FONT, fontSize, color: F.navy, valign: 'middle', margin: [0.03, 0.07, 0.03, 0.07], border: [{ type: 'none' }, { type: 'none' }, { type: 'solid', pt: 0.5, color: F.linje }, { type: 'none' }], ...o } });
    const hodeRad = hode.map((h, i) => celle(h, { bold: true, color: F.hvit, fill: { color: F.navy }, fontSize: fontSize - 0.5, align: i === 0 ? 'left' : 'right' }));
    const kropp = rader.map((r) => r.map((c, i) => (typeof c === 'object' && c !== null ? celle(c.t, { align: i === 0 ? 'left' : 'right', ...c.o }) : celle(c, { align: i === 0 ? 'left' : 'right' }))));
    const sumRad = sum ? [sum.map((c, i) => celle(c, { bold: true, fill: { color: F.lys }, align: i === 0 ? 'left' : 'right' }))] : [];
    s.addTable([hodeRad, ...kropp, ...sumRad], { x, y, w, colW: kolW, rowH: radH, fill: { color: F.hvit } });
  };

  const punktliste = (s, x, y, w, h, punkter, { farge = F.navy, fontSize = 8.5, etter = 4 } = {}) =>
    tekst(s, punkter.map((p) => ({ text: p, options: { bullet: { indent: 11 }, breakLine: true, paraSpaceAfter: etter } })), { x, y, w, h, fontSize, color: farge });

  const harSide = (id) => sider.includes(id) || FORSLAG_SIDER.find((x) => x.id === id)?.fast;
  const hoved = m.scenarioer.find((x) => x.id === 'hoved');
  const svak = m.scenarioer.find((x) => x.id === 'svak');
  const sterk = m.scenarioer.find((x) => x.id === 'sterk');
  const aksjer = m.aktivafordeling.find((a) => a.navn === 'Aksjer')?.hel || 0;

  // ---------- forside ----------
  {
    const s = pptx.addSlide(); sidenr += 1;
    s.background = { color: F.navy };
    if (assets.forside) s.addImage({ path: assets.forside, x: 5, y: 0, w: 5, h: H, sizing: { type: 'cover', w: 5, h: H } });
    if (assets.logoMork) s.addImage({ path: assets.logoMork, x: 0.45, y: 0.4, w: 0.95, h: 0.464 });
    etikett(s, `Investeringsforslag  ·  ${MND[m.dato.getMonth()]} ${m.dato.getFullYear()}`, 0.45, 1.95, 4.3);
    tekst(s, `Forslag til portefølje\n${m.kunde}`, { x: 0.45, y: 2.2, w: 4.3, h: 1.1, fontSize: 22, color: F.hvit, fit: 'shrink' });
    tekst(s, `${m.radgiver.navn ? `Utarbeidet av ${m.radgiver.navn}, ${m.radgiver.tittel}\n` : ''}Pensum Asset Management  ·  ${datoTekst(m.dato)}`, { x: 0.45, y: 3.5, w: 4.3, h: 0.5, fontSize: 8.5, color: 'B8C4D0', lineSpacingMultiple: 1.2 });
    tekst(s, 'Markedsføringsmateriell', { x: 0.45, y: H - 0.45, w: 3, h: 0.2, fontSize: 6.5, color: '8FA3B5' });
  }

  // ---------- forslaget i korte trekk ----------
  {
    const s = side('Forslaget i korte trekk', {
      ingress: `En ${m.risikoprofil.toLowerCase()} portefølje på ${mill(m.belop)} med ${aksjer}${NB}% aksjer og ${m.horisont} års horisont. Forventet avkastning er ${pst(m.forventetAvkastning)} per år.`
    });
    const y = TOPP_INGRESS + 0.05; const w = (B - 2 * M - 0.45) / 4;
    noekkeltall(s, M, y, w, 'Investert beløp', mill(m.belop));
    noekkeltall(s, M + (w + 0.15), y, w, 'Forventet avkastning', `${pst(m.forventetAvkastning)} p.a.`, { under: 'Før kostnader, ikke garantert' });
    noekkeltall(s, M + 2 * (w + 0.15), y, w, 'Forventet svingning', pst(m.scenarioVolatilitet), { under: 'Årlig standardavvik' });
    noekkeltall(s, M + 3 * (w + 0.15), y, w, `Forventet verdi om ${m.horisont} år`, mill(hoved.sluttverdi), { moerk: true, under: `Svakt scenario: ${mill(svak.sluttverdi)}` });

    const y2 = y + 1.02; const h2 = BUNN - y2; const vW = 4.3;
    kort(s, M, y2, vW, h2);
    etikett(s, 'Sammensetning', M + 0.16, y2 + 0.14, 2);
    s.addChart(pptx.ChartType.doughnut, [{ name: 'Vekt', labels: m.produkter.map((p) => p.navn), values: m.produkter.map((p) => p.vekt) }], {
      x: M + 0.05, y: y2 + 0.32, w: 1.55, h: h2 - 0.42, holeSize: 62, showLegend: false, showLabel: false, showValue: false, showPercent: false, showTitle: false,
      chartColors: SERIEFARGER.slice(0, m.produkter.length), dataBorder: { pt: 1, color: 'FFFFFF' }
    });
    const radH = Math.min(0.24, (h2 - 0.5) / Math.max(m.produkter.length, 1));
    m.produkter.forEach((p, i) => {
      const yy = y2 + 0.4 + i * radH;
      s.addShape(pptx.ShapeType.rect, { x: M + 1.7, y: yy + radH / 2 - 0.045, w: 0.09, h: 0.09, fill: { color: SERIEFARGER[i % SERIEFARGER.length] }, line: { color: 'FFFFFF', width: 0 } });
      tekst(s, p.navn, { x: M + 1.86, y: yy, w: vW - 2.6, h: radH, fontSize: 8, valign: 'middle', fit: 'shrink' });
      tekst(s, pst(p.vekt), { x: M + vW - 0.72, y: yy, w: 0.58, h: radH, fontSize: 8, bold: true, align: 'right', valign: 'middle' });
    });

    const hx = M + vW + 0.15; const hW = B - M - hx;
    kort(s, hx, y2, hW, h2, F.navy);
    etikett(s, 'Hvorfor denne porteføljen', hx + 0.18, y2 + 0.14, hW - 0.36);
    const grunner = tekster.grunner || [
      ...m.roller.map((r) => `${r.navn} (${pst(r.vekt, 0)}): ${r.tekst}`),
      `Tilpasset ${m.risikoprofil.toLowerCase()} risikoprofil og ${m.horisont} års horisont.`
    ];
    punktliste(s, hx + 0.18, y2 + 0.45, hW - 0.36, h2 - 0.55, grunner, { farge: F.hvit, fontSize: 10.5, etter: 9 });
  }

  // ---------- kundeprofil og mandat ----------
  {
    const s = side('Kundeprofil og mandat', { ingress: 'Forslaget bygger på opplysningene under. Endres de, kan vurderingen og forslaget endres.' });
    const y = TOPP_INGRESS; const h = BUNN - y; const vW = 5.4;
    kort(s, M, y, vW, h);
    etikett(s, 'Opplysninger lagt til grunn', M + 0.18, y + 0.14, 3);
    const rader = [
      ['Kunde', m.selskap ? `${m.kunde} / ${m.selskap}` : m.kunde], ['Investert beløp', kr(m.belop)], ['Tidshorisont', `${m.horisont} år`],
      ['Risikoprofil', m.risikoprofil], ['Formål', m.formaal || '–'], ['Likviditetsbehov', m.likviditetsbehov || '–'],
      ...(m.nettoKontantstrom ? [[m.nettoKontantstrom > 0 ? 'Årlige innskudd' : 'Årlige uttak', kr(Math.abs(m.nettoKontantstrom))]] : []),
      ['Kundeklassifisering', 'Ikke-profesjonell, med mindre annet er avtalt'], ['Bærekraftspreferanser', 'Avklares i egnethetsvurderingen']
    ];
    const rH = Math.min(0.34, (h - 0.5) / rader.length);
    rader.forEach(([k, v], i) => {
      const yy = y + 0.42 + i * rH;
      tekst(s, k, { x: M + 0.18, y: yy, w: 1.7, h: rH, fontSize: 8.5, color: F.graa, valign: 'middle' });
      tekst(s, v, { x: M + 1.9, y: yy, w: vW - 2.1, h: rH, fontSize: 9, bold: true, valign: 'middle', fit: 'shrink' });
      strek(s, M + 0.18, yy + rH, vW - 0.36);
    });
    const hx = M + vW + 0.15; const hW = B - M - hx;
    kort(s, hx, y, hW, h, F.navy);
    etikett(s, 'Status', hx + 0.18, y + 0.14, hW - 0.36);
    tekst(s, tekster.status || 'Dette er et forslag som grunnlag for videre samtale. Før en eventuell investering gjennomfører Pensum en full egnethetsvurdering, og kunden mottar egnethetserklæring og kostnadsoversikt.', { x: hx + 0.18, y: y + 0.4, w: hW - 0.36, h: 1.1, fontSize: 9, color: F.hvit, lineSpacingMultiple: 1.15 });
    etikett(s, 'Vurderingen bygger på', hx + 0.18, y + 1.6, hW - 0.36);
    punktliste(s, hx + 0.18, y + 1.84, hW - 0.36, h - 1.95, ['Investeringsmål og tidshorisont', 'Risikotoleranse og evne til å bære tap', 'Finansiell situasjon og likviditetsbehov', 'Kunnskap og erfaring'], { farge: 'D9E0E6', fontSize: 8.5 });
  }

  // ---------- derfor Pensum ----------
  if (harSide('derfor')) {
    const s = side('Derfor Pensum', { ingress: tekster.derforIngress || 'En fast rådgiver, fritt fondsvalg og en portefølje som følges opp hver dag.' });
    const y = TOPP_INGRESS; const h = BUNN - y; const vW = 6.3;
    const grunner = tekster.derfor || [
      ['Fritt fondsvalg', 'Vi velger fritt blant forvaltere globalt og setter sammen de beste vi finner. Meravkastningen skal komme fra forvalterne i fondene.'],
      ['Én fast rådgiver', 'Du har en fast rådgiver som kjenner din situasjon, med faste oppfølgingsmøter og løpende rapportering.'],
      ['Tydelig risikostyring', 'Porteføljen holdes på avtalt risikonivå og rebalanseres. Compliance kontrollerer mandatet uavhengig av forvaltningen.'],
      ['Åpenhet om kostnader', 'Institusjonelle andelsklasser der det er mulig, og full kostnadsoversikt før avtale inngås.']
    ];
    const kH = (h - 0.12 * (grunner.length - 1)) / grunner.length;
    grunner.forEach(([t, b], i) => {
      const yy = y + i * (kH + 0.12);
      kort(s, M, yy, vW, kH);
      s.addShape(pptx.ShapeType.rect, { x: M, y: yy, w: 0.06, h: kH, fill: { color: F.kobber }, line: { color: F.kobber, width: 0 } });
      tekst(s, t, { x: M + 0.25, y: yy + 0.1, w: vW - 0.45, h: 0.24, fontSize: 11.5, bold: true, valign: 'middle' });
      tekst(s, b, { x: M + 0.25, y: yy + 0.36, w: vW - 0.45, h: kH - 0.42, fontSize: 9, color: F.moerkGraa });
    });
    const hx = M + vW + 0.15; const hW = B - M - hx;
    kort(s, hx, y, hW, h, F.navy);
    etikett(s, 'Pensum i tall', hx + 0.2, y + 0.16, hW - 0.4);
    const tallene = [[m.pensum?.forvaltningskapital, 'til forvaltning'], [m.pensum?.ansatte, 'ansatte'], ['4', 'kontorer: Oslo, Fredrikstad, Stavanger og Trondheim']].filter((r) => r[0]);
    const tH = (h - 1.1) / tallene.length;
    tallene.forEach(([v, e], i) => {
      const yy = y + 0.45 + i * tH;
      tekst(s, String(v).replace(/^NOK\s*/, '').replace(/Mrd/i, 'mrd. kr'), { x: hx + 0.2, y: yy, w: hW - 0.4, h: 0.42, fontSize: 24, color: F.hvit, valign: 'middle' });
      tekst(s, e, { x: hx + 0.2, y: yy + 0.44, w: hW - 0.4, h: 0.3, fontSize: 8.5, color: 'B8C4D0' });
    });
    tekst(s, 'Verdipapirforetak under tilsyn av Finanstilsynet.', { x: hx + 0.2, y: y + h - 0.4, w: hW - 0.4, h: 0.28, fontSize: 7.5, color: '8FA3B5', valign: 'bottom' });
  }

  // ---------- porteføljesammensetning ----------
  if (harSide('portefolje')) {
    const s = side(`Porteføljen: ${m.aktivafordeling.map((a) => `${a.hel}${NB}% ${a.navn.toLowerCase()}`).join(', ')}`);
    const har5 = m.produkter.some((p) => p.avk5 != null);
    const hode = ['Produkt', 'Vekt', 'Beløp', 'Forv. avk.', '1 år', '3 år p.a.', ...(har5 ? ['5 år p.a.'] : []), 'Svingning'];
    const farget = (v) => ({ t: pstFortegn(v), o: { color: v == null ? F.graa : (v < 0 ? F.roed : F.groenn) } });
    const rader = m.produkter.map((p) => [p.navn, pst(p.vekt), mill(p.belop), pst(p.forventetAvkastning), farget(p.avk1), farget(p.avk3), ...(har5 ? [farget(p.avk5)] : []), pst(p.volatilitet)]);
    const kolW = har5 ? [3.3, 0.7, 1.25, 0.9, 0.8, 0.85, 0.85, 0.75] : [3.6, 0.75, 1.35, 1.0, 0.9, 0.95, 0.85];
    const radH = Math.min(0.3, (BUNN - TOPP - 0.75) / (rader.length + 2));
    tabell(s, M, TOPP, B - 2 * M, hode, rader, kolW, { radH, sum: ['Porteføljen', '100 %', mill(m.belop), pst(m.forventetAvkastning), '', pstFortegn(m.historikk.periodeAar === 3 ? m.historikk.aarligAvkastning : null), ...(har5 ? [pstFortegn(m.historikk.periodeAar === 5 ? m.historikk.aarligAvkastning : null)] : []), pst(m.historiskRisiko)] });
    tekst(s, `Historisk avkastning per ${m.rapportDato}, etter kostnader i fondene. 3 og 5 år er årlig snitt. Svingning er årlig standardavvik siste ${m.historikk.periodeAar} år; for porteføljen er den målt på den samlede porteføljen. Historisk avkastning er ingen garanti for fremtidig avkastning.${m.historikk.utenHistorikk.length ? ` Uten kurshistorikk: ${m.historikk.utenHistorikk.join(', ')}.` : ''}`, { x: M, y: BUNN - 0.42, w: B - 2 * M, h: 0.4, fontSize: 7, color: F.graa, italic: true });
  }

  // ---------- oppbygging ----------
  if (harSide('oppbygging') && m.roller.length) {
    const s = side('Slik er porteføljen bygget', { ingress: 'Hver del har en tydelig rolle. Sammen skal de gi avkastning over tid og tåle urolige perioder.' });
    const y = TOPP_INGRESS; const baandH = 0.78; const h = BUNN - y - baandH - 0.15; const n = m.roller.length; const w = (B - 2 * M - 0.15 * (n - 1)) / n;
    const farger = { kjerne: F.navy, stabilisator: F.blaa, satellitt: F.kobber };
    m.roller.forEach((r, i) => {
      const x = M + i * (w + 0.15);
      kort(s, x, y, w, h);
      s.addShape(pptx.ShapeType.rect, { x, y, w, h: 0.06, fill: { color: farger[r.id] }, line: { color: farger[r.id], width: 0 } });
      etikett(s, r.navn, x + 0.18, y + 0.2, w - 0.36, farger[r.id]);
      tekst(s, pst(r.vekt, 0), { x: x + 0.18, y: y + 0.4, w: 1.3, h: 0.5, fontSize: 26, valign: 'middle' });
      tekst(s, `av porteføljen\n${mill(m.belop * r.vekt / 100)}`, { x: x + 1.45, y: y + 0.47, w: w - 1.6, h: 0.38, fontSize: 7.5, color: F.graa, valign: 'middle' });
      tekst(s, r.tekst, { x: x + 0.18, y: y + 1.0, w: w - 0.36, h: 0.45, fontFace: SERIF, fontSize: 9.5 });
      strek(s, x + 0.18, y + 1.5, w - 0.36);
      const rH = Math.min(0.24, (h - 1.62) / Math.max(r.produkter.length, 1));
      r.produkter.forEach((p, j) => {
        tekst(s, p.navn, { x: x + 0.18, y: y + 1.56 + j * rH, w: w - 1.0, h: rH, fontSize: 8.5, valign: 'middle', fit: 'shrink' });
        tekst(s, pst(p.vekt), { x: x + w - 0.8, y: y + 1.56 + j * rH, w: 0.62, h: rH, fontSize: 8.5, bold: true, align: 'right', valign: 'middle' });
      });
    });
    // Bånd nederst: fordeling på aktivaklasser.
    const by = y + h + 0.15; const bw = B - 2 * M;
    kort(s, M, by, bw, baandH);
    etikett(s, 'Aktivafordeling', M + 0.18, by + 0.12, 2);
    const aFarger = { Aksjer: F.navy, Renter: F.blaa, Alternativer: F.kobber, Kontanter: '8FA3B5' };
    let bx = M + 0.18; const full = bw - 0.36;
    m.aktivafordeling.forEach((a) => {
      const aw = full * a.vekt / 100;
      s.addShape(pptx.ShapeType.rect, { x: bx, y: by + 0.36, w: aw, h: 0.28, fill: { color: aFarger[a.navn] }, line: { color: 'FFFFFF', width: 0.75 } });
      if (aw > 0.75) tekst(s, `${a.navn} ${a.hel}${NB}%`, { x: bx + 0.08, y: by + 0.36, w: aw - 0.1, h: 0.28, fontSize: 8, bold: true, color: F.hvit, valign: 'middle' });
      bx += aw;
    });
  }

  // ---------- historisk utvikling ----------
  if (harSide('historikk') && m.historikk.datoer.length > 6) {
    const hi = m.historikk;
    const slutt = hi.portefolje[hi.portefolje.length - 1];
    const s = side(`Porteføljen har gitt ${pstFortegn(slutt, 0)} siste ${hi.periodeAar} år`, { ingress: `Samme sammensetning som i forslaget, ${pst(hi.aarligAvkastning)} i årlig snitt. Største fall i perioden var ${pst(m.historiskMaksFall)}.` });
    const y = TOPP_INGRESS; const h = BUNN - y; const gW = 6.3;
    kort(s, M, y, gW, h);
    etikett(s, `Utvikling siste ${hi.periodeAar} år, prosent`, M + 0.16, y + 0.12, 3.5);
    const etiketter = hi.datoer.map((d) => `${MND[Number(d.slice(5, 7)) - 1]} ${d.slice(2, 4)}`);
    const serier = [{ name: 'Porteføljen', labels: etiketter, values: hi.portefolje }, ...hi.referanser.map((r) => ({ name: r.navn, labels: etiketter, values: r.verdier }))];
    s.addChart(pptx.ChartType.line, serier, {
      x: M + 0.05, y: y + 0.3, w: gW - 0.1, h: h - 0.36, chartColors: [F.navy, F.blaa, F.kobber, F.graa], lineSize: 1.75, lineDataSymbol: 'none', lineSmooth: false,
      showLegend: true, legendPos: 'b', legendFontSize: 8, legendFontFace: FONT, legendColor: F.moerkGraa,
      catAxisLabelFontSize: 7.5, catAxisLabelFontFace: FONT, catAxisLabelColor: F.graa, catAxisLabelFrequency: 12, catAxisLineShow: false,
      valAxisLabelFontSize: 7.5, valAxisLabelFontFace: FONT, valAxisLabelColor: F.graa, valAxisLabelFormatCode: '0" %"', valAxisLineShow: false,
      valGridLine: { color: 'E3E7EB', width: 0.5 }, catGridLine: { style: 'none' }
    });
    const hx = M + gW + 0.15; const hW = B - M - hx;
    kort(s, hx, y, hW, h);
    etikett(s, 'Avkastning per kalenderår', hx + 0.16, y + 0.12, hW - 0.3);
    const rH = 0.3;
    hi.aarsavkastning.slice().reverse().forEach((a, i) => {
      const yy = y + 0.4 + i * rH;
      tekst(s, a.etikett, { x: hx + 0.16, y: yy, w: 1.4, h: rH, fontSize: 9, valign: 'middle' });
      tekst(s, pstFortegn(a.verdi), { x: hx + hW - 1.36, y: yy, w: 1.2, h: rH, fontSize: 10, bold: true, align: 'right', valign: 'middle', color: a.verdi == null ? F.graa : (a.verdi < 0 ? F.roed : F.groenn) });
      strek(s, hx + 0.16, yy + rH, hW - 0.32);
    });
    const ny = y + 0.56 + 5 * rH;
    etikett(s, `Siste ${hi.periodeAar} år`, hx + 0.16, ny, hW - 0.3);
    [['Årlig snitt', pstFortegn(hi.aarligAvkastning)], ['Svingning', pst(m.historiskRisiko)], ['Største fall', pst(m.historiskMaksFall)]].forEach(([e, v], i) => {
      const kw = (hW - 0.32) / 3;
      tekst(s, v, { x: hx + 0.16 + i * kw, y: ny + 0.22, w: kw, h: 0.26, fontSize: 12, valign: 'middle' });
      tekst(s, e, { x: hx + 0.16 + i * kw, y: ny + 0.48, w: kw, h: 0.16, fontSize: 7, color: F.graa });
    });
    tekst(s, `Tall per ${m.rapportDato}. Deler av historikken er beregnet med dagens sammensetning for perioder før løsningene ble etablert. Historisk avkastning er ingen garanti for fremtidig avkastning.${hi.utenHistorikk.length ? ` Ikke med: ${hi.utenHistorikk.join(', ')}.` : ''}`, { x: hx + 0.16, y: ny + 0.78, w: hW - 0.32, h: y + h - ny - 0.86, fontSize: 7, color: F.graa, italic: true, valign: 'bottom', fit: 'shrink' });
  }

  // ---------- scenarioer ----------
  if (harSide('scenarioer')) {
    const s = side(`Forventet verdi om ${m.horisont} år: ${mill(hoved.sluttverdi)}`, { ingress: `I 9 av 10 utfall anslår modellen en verdi mellom ${mill(svak.sluttverdi)} og ${mill(sterk.sluttverdi)}. Underveis kan verdien falle betydelig.` });
    const y = TOPP_INGRESS; const w = (B - 2 * M - 0.3) / 3;
    [svak, hoved, sterk].forEach((sc, i) => {
      const x = M + i * (w + 0.15); const moerk = sc.id === 'hoved';
      kort(s, x, y, w, 1.02, moerk ? F.navy : F.hvit);
      etikett(s, sc.navn, x + 0.16, y + 0.12, w - 0.3, moerk ? F.kobber : (sc.id === 'svak' ? F.roed : F.groenn));
      tekst(s, mill(sc.sluttverdi), { x: x + 0.16, y: y + 0.32, w: w - 0.32, h: 0.36, fontSize: 18, color: moerk ? F.hvit : F.navy, valign: 'middle' });
      tekst(s, `${pst(sc.avkastning)} per år  ·  ${sc.undertittel}`, { x: x + 0.16, y: y + 0.72, w: w - 0.32, h: 0.2, fontSize: 7.5, color: moerk ? 'B8C4D0' : F.graa });
    });
    const y2 = y + 1.17; const h2 = BUNN - y2 - 0.3;
    kort(s, M, y2, B - 2 * M, h2);
    const aar = m.scenarioSerie.map((p) => String(p.aar));
    s.addChart(pptx.ChartType.line, [
      { name: 'Sterkt scenario', labels: aar, values: m.scenarioSerie.map((p) => p.sterk / 1e6) },
      { name: 'Hovedscenario', labels: aar, values: m.scenarioSerie.map((p) => p.hoved / 1e6) },
      { name: 'Svakt scenario', labels: aar, values: m.scenarioSerie.map((p) => p.svak / 1e6) }
    ], {
      x: M + 0.05, y: y2 + 0.05, w: B - 2 * M - 0.1, h: h2 - 0.1, chartColors: [F.groenn, F.navy, F.roed], lineSize: 2, lineDataSymbol: 'none',
      showLegend: true, legendPos: 'r', legendFontSize: 8, legendFontFace: FONT, legendColor: F.moerkGraa,
      catAxisLabelFontSize: 7.5, catAxisLabelFontFace: FONT, catAxisLabelColor: F.graa, catAxisLineShow: false,
      valAxisLabelFontSize: 7.5, valAxisLabelFontFace: FONT, valAxisLabelColor: F.graa, valAxisLabelFormatCode: '0" mill."', valAxisLineShow: false,
      valGridLine: { color: 'E3E7EB', width: 0.5 }, catGridLine: { style: 'none' }
    });
    tekst(s, `Modellberegning, ikke en prognose eller garanti. Hovedscenariet bruker forventet avkastning ${pst(m.forventetAvkastning)} per år før kostnader. Svakt og sterkt scenario er 5- og 95-prosentilen for årlig snittavkastning med ${pst(m.scenarioVolatilitet)} årlig svingning.${m.nettoKontantstrom ? ` Inkluderer ${m.nettoKontantstrom > 0 ? 'årlige innskudd' : 'årlige uttak'} på ${kr(Math.abs(m.nettoKontantstrom))}.` : ''} ${m.cmaKilde}`, { x: M, y: BUNN - 0.26, w: B - 2 * M, h: 0.26, fontSize: 7, color: F.graa, italic: true });
  }

  // ---------- eksponering ----------
  if (harSide('eksponering') && m.eksponering.regioner.length) {
    const e = m.eksponering; const ref = e.referanse;
    const storst = e.verdensdeler.slice().sort((a, b) => b.vekt - a.vekt)[0];
    const s = side(`Aksjedelen: ${pst(storst?.vekt, 0)} i ${storst?.navn || '–'}`, { ingress: `Gjelder ${e.gjelder.length > 4 ? `${e.gjelder.length} produkter med aksjeeksponering` : e.gjelder.join(', ')}.${ref ? ` Sammenlignet med ${ref.navn}.` : ''}` });
    const y = TOPP_INGRESS; const h = BUNN - y; const w = (B - 2 * M - 0.3) / 3;
    const refMap = (liste) => (liste ? Object.fromEntries(liste.map((r) => [r.navn, r.vekt])) : null);
    [['Verdensdeler', e.verdensdeler, refMap(ref?.verdensdeler), F.navy], ['Største land', e.regioner, null, F.teal], ['Sektorer', e.sektorer, refMap(ref?.sektorer), F.blaa]].forEach(([navn, rader, r, farge], i) => {
      const x = M + i * (w + 0.15);
      kort(s, x, y, w, h);
      etikett(s, navn, x + 0.16, y + 0.12, w - 0.3);
      if (r) tekst(s, [{ text: 'Porteføljen', options: { bold: true } }, { text: `   ${ref.navn}`, options: { color: F.graa } }], { x: x + 0.16, y: y + 0.12, w: w - 0.32, h: 0.18, fontSize: 6.5, align: 'right' });
      soyler(s, x + 0.16, y + 0.42, w - 0.32, rader, { farge, ref: r, radH: Math.min(0.3, (h - 0.55) / Math.max(rader.length, 1)), navnW: 1.15 });
    });
  }

  // ---------- faktaark ----------
  if (harSide('faktaark')) {
    m.produkter.filter((p) => p.pitch || p.hvorfor || p.rolleTekst || Object.values(p.eksponering).some((l) => l.length)).forEach((p, idx) => {
      const s = side(`${p.navn}: ${pst(p.vekt)} av porteføljen`, { ingress: p.pitch || p.undertittel || undefined });
      const y = p.pitch || p.undertittel ? TOPP_INGRESS : TOPP; const h = BUNN - y;
      const hW = 2.45; const vW = B - 2 * M - hW - 0.15;
      const nokkel = [['Forv. avk.', pst(p.forventetAvkastning)], ['Forv. yield', pst(p.forventetYield)], ['1 år', pstFortegn(p.avk1)], ['3 år p.a.', pstFortegn(p.avk3)], ['Svingning', pst(p.volatilitet)]];
      const kW = (vW - 0.1 * 4) / 5;
      nokkel.forEach(([e, v], i) => {
        const x = M + i * (kW + 0.1);
        kort(s, x, y, kW, 0.62);
        etikett(s, e, x + 0.1, y + 0.09, kW - 0.2, F.graa);
        tekst(s, v, { x: x + 0.1, y: y + 0.27, w: kW - 0.2, h: 0.28, fontSize: 13, valign: 'middle' });
      });
      const y2 = y + 0.74; const h2 = BUNN - y2;
      const blokker = [['Underliggende', p.eksponering.underliggende, F.kobber], ['Land', p.eksponering.regioner, F.teal], ['Sektorer', p.eksponering.sektorer, F.blaa]].filter((b) => b[1].length);
      if (blokker.length) {
        // Underliggende fond har lange navn og får en bredere kolonne.
        const andeler = blokker.map((b) => (b[0] === 'Underliggende' && blokker.length > 1 ? 1.5 : 1));
        const enhet = (vW - 0.12 * (blokker.length - 1)) / andeler.reduce((a, b) => a + b, 0);
        let x = M;
        blokker.forEach(([navn, rader, farge], i) => {
          const bW = enhet * andeler[i];
          kort(s, x, y2, bW, h2);
          etikett(s, navn, x + 0.12, y2 + 0.1, bW - 0.24);
          const lang = navn === 'Underliggende';
          soyler(s, x + 0.12, y2 + 0.34, bW - 0.24, lang ? rader.map((r) => ({ ...r, navn: kutt(r.navn, 38) })) : rader, { farge, radH: Math.min(0.26, (h2 - 0.44) / rader.length), navnW: lang ? Math.min(2.3, bW * 0.62) : Math.min(1.5, bW * 0.5) });
          x += bW + 0.12;
        });
      } else {
        kort(s, M, y2, vW, h2);
        etikett(s, 'Hvorfor i porteføljen', M + 0.16, y2 + 0.12, vW - 0.3);
        tekst(s, p.hvorfor || p.pitch || 'Bidrar til løpende avkastning og lavere svingninger i porteføljen.', { x: M + 0.16, y: y2 + 0.38, w: vW - 0.32, h: h2 - 0.5, fontFace: SERIF, fontSize: 10 });
      }
      const hx = M + vW + 0.15;
      kort(s, hx, y, hW, h, F.navy);
      etikett(s, p.rolle === 'kjerne' ? 'Kjerne' : p.rolle === 'stabilisator' ? 'Stabilisator' : 'Satellitt', hx + 0.16, y + 0.14, hW - 0.3);
      tekst(s, pst(p.vekt), { x: hx + 0.16, y: y + 0.34, w: hW - 0.32, h: 0.42, fontSize: 22, color: F.hvit, valign: 'middle' });
      tekst(s, `${mill(p.belop)} investert${p.valuta && p.valuta !== 'NOK' ? `  ·  handles i ${p.valuta}` : ''}`, { x: hx + 0.16, y: y + 0.78, w: hW - 0.32, h: 0.18, fontSize: 7.5, color: 'B8C4D0' });
      let yy = y + 1.12;
      [['Rolle i porteføljen', p.rolleTekst], ['Referanseindeks', p.referanse], ['Viktigste risiko', p.risikoTekst]].filter((r) => r[1]).forEach(([e, t]) => {
        etikett(s, e, hx + 0.16, yy, hW - 0.3);
        tekst(s, t, { x: hx + 0.16, y: yy + 0.2, w: hW - 0.32, h: 0.5, fontSize: 8.5, color: F.hvit });
        yy += 0.78;
      });
      if (p.merknad) tekst(s, p.merknad, { x: hx + 0.16, y: y + h - 0.62, w: hW - 0.32, h: 0.54, fontSize: 6.5, color: '8FA3B5', italic: true, valign: 'bottom', fit: 'shrink' });
      void idx;
    });
  }

  const tillegg = FORSLAG_SIDER.filter((x) => x.tillegg && sider.includes(x.id));
  if (tillegg.length) skille('Vedlegg', 'Slik jobber Pensum', tillegg.map((x) => x.navn));

  // ---------- kostnader (tillegg) ----------
  if (sider.includes('kostnader') && m.kostnader?.linjer?.length) {
    const k = m.kostnader;
    const s = side(`Anslåtte kostnader: ${pst(k.pst, 2)} per år`, { ingress: `Tilsvarer om lag ${kr(k.kroner)} per år på ${mill(m.belop)}. Honorartrinn ${k.trinn.navn.toLowerCase()}: ${pst(k.trinn.sats, 2)}.` });
    const rader = k.linjer.map((l) => [`${l.navn}${l.andelsklasse && !l.navn.endsWith(` ${l.andelsklasse}`) ? ` (klasse ${l.andelsklasse})` : ''}`, pst(l.vekt), l.honorarPst ? pst(l.honorarPst, 2) : '–', l.produktkostnadPst != null ? pst(l.produktkostnadPst, 2) : (l.honorarPst === 0 ? '–' : 'ikke oppgitt'), pst(l.totalPst, 2), kr(l.kroner)]);
    tabell(s, M, TOPP_INGRESS, B - 2 * M, ['Produkt', 'Vekt', 'Pensums honorar', 'Kostnad i fond', 'Sum per år', 'Kroner per år'], rader, [3.6, 0.8, 1.25, 1.25, 1.2, 1.3], { radH: Math.min(0.28, (BUNN - TOPP_INGRESS - 0.7) / (rader.length + 2)), sum: ['Porteføljen', '100 %', '', '', pst(k.pst, 2), kr(k.kroner)] });
    tekst(s, `Anslag basert på Pensums honorarstruktur (ekskl. mva) og fondenes oppgitte løpende kostnader. Resultatavhengige honorarer og transaksjonskostnader kommer i tillegg. Endelig kostnadsoversikt gis før avtale inngås.${k.mangler.length ? ` Kostnad i fond er ikke oppgitt for: ${k.mangler.join(', ')}.` : ''}`, { x: M, y: BUNN - 0.36, w: B - 2 * M, h: 0.34, fontSize: 7, color: F.graa, italic: true });
  }

  // ---------- tilleggssider fra tilbudsmalen ----------
  const toKolonner = (tittel, ingress, venstre, hoyre) => {
    const s = side(tittel, { ingress });
    const y = TOPP_INGRESS; const h = BUNN - y; const vW = 5.6;
    kort(s, M, y, vW, h);
    etikett(s, venstre.etikett, M + 0.18, y + 0.14, vW - 0.36);
    if (venstre.rader) {
      const rH = Math.min(0.62, (h - 0.5) / venstre.rader.length);
      venstre.rader.forEach(([a, b], i) => {
        const yy = y + 0.42 + i * rH;
        tekst(s, a, { x: M + 0.18, y: yy, w: 1.6, h: rH, fontSize: 9.5, bold: true, valign: 'middle' });
        tekst(s, b, { x: M + 1.85, y: yy, w: vW - 2.05, h: rH, fontSize: 9.5, valign: 'middle', fit: 'shrink' });
        strek(s, M + 0.18, yy + rH, vW - 0.36);
      });
    } else punktliste(s, M + 0.18, y + 0.46, vW - 0.36, h - 0.55, venstre.punkter, { fontSize: 10.5, etter: 10 });
    const hx = M + vW + 0.15; const hW = B - M - hx;
    kort(s, hx, y, hW, h, F.navy);
    etikett(s, hoyre.etikett, hx + 0.18, y + 0.14, hW - 0.36);
    punktliste(s, hx + 0.18, y + 0.46, hW - 0.36, h - 0.55, hoyre.punkter, { farge: F.hvit, fontSize: 10, etter: 10 });
  };
  if (sider.includes('filosofi')) toKolonner('Investeringsfilosofi', 'Aktiv forvaltning, satt sammen av de beste forvalterne vi finner.',
    { etikett: 'Slik investerer vi', rader: [['Bred global kjerne', 'Regioner og sektorer ligger nær verdensindeksen, med små avvik.'], ['De beste forvalterne', 'Fondene velges i en fast prosess og følges opp mot egen indeks.'], ['Seleksjon, ikke timing', 'Vi tar ikke store taktiske veddemål på når markedet snur.'], ['Lave kostnader', 'Institusjonelle andelsklasser. Returprovisjon betales tilbake til kunden.']] },
    { etikett: 'Fritt fondsvalg', punkter: ['Vi velger fritt blant forvaltere globalt og bruker ulike fond i hvert mandat.', 'Meravkastningen skal komme fra forvalterne i de underliggende fondene.', 'Indeksfond brukes der aktiv forvaltning ikke forventes å gi merverdi.'] });
  if (sider.includes('risikostyring')) toKolonner('Risikostyring og risikokontroll', 'Risikoen styres gjennom mandatet, spredning og uavhengig kontroll.',
    { etikett: 'Slik styres risikoen', rader: [['Markedsrisiko', 'Allokeringen fastsettes i mandatet og rebalanseres til målvekt.'], ['Forvalterrisiko', 'Flere forvaltere, slik at ingen enkeltforvalter avgjør resultatet.'], ['Konsentrasjon', 'Grenser for største fond og største enkeltselskaper.'], ['Valuta', 'Globale aksjer valutasikres ikke. Kronekursen påvirker avkastningen.'], ['Likviditet', 'Fond med daglig handel, med mindre annet er avtalt.'], ['Mandatavvik', 'Kontrolleres av compliance. Avvik rapporteres skriftlig.']] },
    { etikett: 'Marked og behov', punkter: ['Forvalter justerer fondsvalg og vekter innenfor mandatet.', 'Egnethetsvurderingen oppdateres minst årlig, og når likviditetsbehov, horisont eller risikovilje endres.', 'Endringer i mandatet avtales skriftlig.'] });
  if (sider.includes('oppfolging')) toKolonner('Rebalansering og forvalteroppfølging', 'Porteføljen holdes på målvekt, og forvalterne følges opp fast.',
    { etikett: 'Rebalansering', punkter: ['Vurderes kvartalsvis og ved hvert innskudd og uttak.', 'Foreslått terskel: avvik over 2,5 prosentpoeng fra målvekt.', 'Innskudd kjøper først det som er undervektet.', 'Kostnaden inngår i transaksjonskostnadene.'] },
    { etikett: 'Dette ser vi etter i et fond', punkter: ['Høy kvalitet på forvaltningsselskapet.', 'Erfarent og kompetent team.', 'Solid historikk: jevne resultater, ikke enkeltår.', 'Repeterbar idégenerering og god risikostyring.', 'Fond byttes ut ved endret team, strategi eller vedvarende svake resultater.'] });
  if (sider.includes('rapportering')) toKolonner('Rapportering og oppfølging', 'Daglig innsyn, månedlig rapport og faste møter.',
    { etikett: 'Innhold og hyppighet', rader: [['Avkastning', 'Daglig i portal og app, månedlig, kvartalsvis og årlig.'], ['Mot referanseindeks', 'Månedlig, kvartalsvis og årlig.'], ['Risiko og risikomål', 'Månedlig, kvartalsvis og årlig.'], ['Sammensetning', 'Daglig i portal, samt i alle rapporter.'], ['Endringer', 'Transaksjoner i portal, kommentar i rapportene.'], ['Kostnader', 'Honorar kvartalsvis og samlet rapport årlig.']] },
    { etikett: 'Oppfølging', punkter: ['Portal og app med BankID.', 'Månedsrapport fra forvalterne.', 'To faste oppfølgingsmøter i året, flere ved behov.', 'Fast rådgiver følger kundeforholdet.'] });
  if (sider.includes('organisasjon')) toKolonner('Organisering, kompetanse og soliditet', 'Pensum Asset Management AS er et verdipapirforetak under tilsyn av Finanstilsynet.',
    { etikett: 'Organisering', rader: [['Forvaltning', 'Egne porteføljeforvaltere og egen trader.'], ['Rådgivning', 'Rådgiverne har ansvaret for kundeforholdet: kartlegging, mandat, oppfølging og rapportering.'], ['Kontroll', 'Compliance og risikostyring, uavhengig av forvaltningen.'], ['Analyse', 'Egne modeller og Morningstar Direct.']] },
    { etikett: 'Kontinuitet og sikkerhet', punkter: ['To rådgivere følger kundeforholdet.', 'Hvert mandat har ansvarlig forvalter med teamet som støtte.', 'Fondsandelene tilhører kunden og holdes adskilt fra Pensums egne midler.', 'Kontorer i Oslo, Fredrikstad, Stavanger og Trondheim.'] });

  // ---------- neste steg ----------
  {
    const s = pptx.addSlide(); sidenr += 1;
    s.background = { color: F.navy };
    if (assets.logoMork) s.addImage({ path: assets.logoMork, x: 0.45, y: 0.4, w: 0.95, h: 0.464 });
    etikett(s, 'Neste steg', 0.45, 1.3, 4);
    tekst(s, 'Vi ser frem til å høre fra deg', { x: 0.45, y: 1.52, w: 6, h: 0.5, fontSize: 24, color: F.hvit });
    [['1', 'Gjennomgang', 'Vi går gjennom forslaget sammen og justerer allokering og produktvalg.'], ['2', 'Avtale og egnethet', 'Egnethetsvurdering, kostnadsoversikt og avtale. Kundeetablering gjøres digitalt.'], ['3', 'Etablering', 'Porteføljen settes opp, og du får tilgang til portal og løpende rapportering.']].forEach(([nr, t, b], i) => {
      const x = 0.45 + i * 3.05;
      s.addShape(pptx.ShapeType.ellipse, { x, y: 2.4, w: 0.34, h: 0.34, fill: { color: F.kobber }, line: { color: F.kobber, width: 0 } });
      tekst(s, nr, { x, y: 2.4, w: 0.34, h: 0.34, fontSize: 11, bold: true, color: F.hvit, align: 'center', valign: 'middle' });
      tekst(s, t, { x: x + 0.45, y: 2.4, w: 2.4, h: 0.34, fontSize: 11, bold: true, color: F.hvit, valign: 'middle' });
      tekst(s, b, { x: x + 0.45, y: 2.78, w: 2.4, h: 0.7, fontSize: 8.5, color: 'B8C4D0' });
    });
    strek(s, 0.45, 3.75, B - 0.9, '2C4763');
    etikett(s, 'Din rådgiver', 0.45, 3.95, 3);
    tekst(s, m.radgiver.navn || 'Pensum Asset Management', { x: 0.45, y: 4.15, w: 4, h: 0.3, fontSize: 14, color: F.hvit });
    tekst(s, [m.radgiver.navn ? m.radgiver.tittel : '', m.radgiver.telefon, m.radgiver.epost].filter(Boolean).join('  ·  '), { x: 0.45, y: 4.47, w: 5, h: 0.2, fontSize: 8.5, color: 'B8C4D0' });
    etikett(s, 'Pensum Asset Management', 6.2, 3.95, 3.3);
    tekst(s, 'Frøyas gate 15, 0273 Oslo\n+47 23 89 68 44  ·  www.pensumgroup.no', { x: 6.2, y: 4.15, w: 3.4, h: 0.5, fontSize: 8.5, color: 'B8C4D0', lineSpacingMultiple: 1.2 });
  }

  // ---------- viktig informasjon ----------
  {
    const s = side('Viktig informasjon');
    const y = TOPP; const h = BUNN - y; const w = (B - 2 * M - 0.15) / 2;
    kort(s, M, y, w, h); kort(s, M + w + 0.15, y, w, h);
    etikett(s, 'Forutsetninger', M + 0.18, y + 0.14, w - 0.36);
    punktliste(s, M + 0.18, y + 0.4, w - 0.36, h - 0.5, tekster.forutsetninger || [
      'Dokumentet er et forslag og markedsføringsmateriell. Det er ikke en personlig anbefaling før egnethetsvurdering er gjennomført.',
      `Tall og historikk er per ${m.rapportDato}.`,
      m.cmaKilde,
      'Scenarioene er modellberegninger. Faktisk utvikling vil avvike og kan bli vesentlig svakere.',
      'Deler av historikken er beregnet med dagens sammensetning for perioder før løsningene ble etablert.'
    ], { fontSize: 9.5, etter: 8 });
    etikett(s, 'Risiko og interessekonflikter', M + w + 0.33, y + 0.14, w - 0.36);
    punktliste(s, M + w + 0.33, y + 0.4, w - 0.36, h - 0.5, tekster.risiko || [
      'Historisk avkastning er ingen garanti for fremtidig avkastning. Verdien kan falle, og du kan tape hele eller deler av investert beløp.',
      'Avkastningen påvirkes av markedsutvikling, renter, valuta, kredittrisiko, likviditet og forvalternes beslutninger.',
      'Kostnader, gebyrer og skatt reduserer nettoavkastningen. Kostnadsoversikt gis før avtale inngås.',
      'Forslaget inneholder Pensums egne produkter. Pensum har økonomisk interesse i at disse velges og yter ikke uavhengig rådgivning i lovens forstand.',
      'Pensum Asset Management AS er et verdipapirforetak under tilsyn av Finanstilsynet.'
    ], { fontSize: 9.5, etter: 8 });
  }

  return pptx;
}
