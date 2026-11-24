// Lager investeringsforslaget som ekte, redigerbare PowerPoint-lysbilder i Pensums
// tilbudsmal (lys grå bunn, hvite kort, mørkeblå felt, kobberfargede etiketter).
// Tar en ferdig modell fra lib/forslagModell.js og tegner bare det som står der.

const F = { navy: '0F2A44', kobber: 'D98A6A', blaa: '4F86A4', graa: '6B7A89', moerkGraa: '4D5F72', linje: 'D5D9DE', bunn: 'E6E6E6', lys: 'EEF1F4', hvit: 'FFFFFF', groenn: '2D6A4F', roed: 'B4442F', gull: 'A67B3D', teal: '2D6A6A' };
const SERIEFARGER = ['0F2A44', '4F86A4', 'D98A6A', '2D6A6A', 'A67B3D', '5B4FA0', '2D6A4F', '8FA3B5', 'B4442F', 'C9B38F', '1B4F72', '9C6B98', '7A8B3A', 'E0B080', '566573', 'A93226'];
// Skriftene i Pensums selskapsmal. Open Sans må være installert der filen åpnes.
const FONT = 'Open Sans';
const LETT = 'Open Sans Light';
const SERIF = 'Georgia';
const B = 10; const H = 5.625; const M = 0.3; // lysbilde 16:9 i tommer

const kutt = (t, n) => (String(t).length > n ? `${String(t).slice(0, n - 1).trimEnd()}…` : String(t));
const NB = ' ';
const tall = (v, d = 1) => Number(v).toFixed(d).replace('.', ',').replace('-', '−');
export const pst = (v, d = 1) => (v == null || !Number.isFinite(v) ? '–' : `${tall(v, d)}${NB}%`);
const pstFortegn = (v, d = 1) => (v == null || !Number.isFinite(v) ? '–' : `${v > 0 ? '+' : ''}${tall(v, d)}${NB}%`);
// Vekter vises eksakt: 25 %, 27,5 %, 11,25 %.
export const vektTekst = (v) => (v == null || !Number.isFinite(v) ? '–' : `${String(Math.round(v * 100) / 100).replace('.', ',')}${NB}%`);
export const kr = (v) => `${Math.round(v).toLocaleString('nb-NO').replace(/\s/g, NB)}${NB}kr`;
export const mill = (v) => (Math.abs(v) >= 1e6 ? `${tall(v / 1e6, Math.abs(v) >= 1e8 ? 0 : 1)}${NB}mill.${NB}kr` : kr(v));
const datoTekst = (d) => `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
const MND = ['jan', 'feb', 'mar', 'apr', 'mai', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'des'];

// Sider som alltid er med, og valgfrie tilleggssider (fra tilbudsmalen).
export const FORSLAG_SIDER = [
  { id: 'forside', navn: 'Forside', fast: true },
  { id: 'kapitler', navn: 'Innholdsside og kapittelsider' },
  { id: 'kortetrekk', navn: 'Forslaget i korte trekk', fast: true },
  { id: 'mandat', navn: 'Kundeprofil og mandat', valgfri: true, kapittel: 1 },
  { id: 'utgangspunkt', navn: 'Utgangspunkt og investeringsmandat', kapittel: 1 },
  // Vises bare som valg når rådgiveren har lagt inn kundens dagens portefølje.
  { id: 'dagens', navn: 'Dagens portefølje', valgfri: true, kapittel: 1 },
  { id: 'dagensmotny', navn: 'Dagens mot ny portefølje', valgfri: true, kapittel: 1 },
  { id: 'derfor', navn: 'Derfor Pensum', kapittel: 1 },
  { id: 'oppbygging', navn: 'Hvordan porteføljen er bygget', kapittel: 2 },
  { id: 'portefolje', navn: 'Porteføljesammensetning', kapittel: 2 },
  { id: 'eksponering', navn: 'Hvor er pengene investert?', kapittel: 2 },
  // Vises bare som valg når rådgiveren har lagt inn kundens øvrige investeringer.
  { id: 'totalbilde', navn: 'Totalbildet med kundens øvrige investeringer', valgfri: true, kapittel: 2 },
  { id: 'historikk', navn: 'Historisk avkastning mot referanseindekser', kapittel: 3 },
  { id: 'scenarioer', navn: 'Forventet utvikling', kapittel: 3 },
  { id: 'rentersrente', navn: 'Renters rente', kapittel: 3 },
  { id: 'risiko', navn: 'Risikofaktorer og mulige tap', kapittel: 3 },
  { id: 'faktaark', navn: 'Faktaark per produkt', kapittel: 4 },
  { id: 'pris', navn: 'Pris og hva som er inkludert', tillegg: true },
  { id: 'kostnader', navn: 'Kostnader per produkt', tillegg: true },
  { id: 'filosofi', navn: 'Investeringsfilosofi', tillegg: true },
  { id: 'risikostyring', navn: 'Risikostyring og risikokontroll', tillegg: true },
  { id: 'oppfolging', navn: 'Rebalansering og forvalteroppfølging', tillegg: true },
  { id: 'rapportering', navn: 'Rapportering og oppfølging', tillegg: true },
  { id: 'organisasjon', navn: 'Organisering, kompetanse og soliditet', tillegg: true },
  { id: 'nestesteg', navn: 'Neste steg', fast: true },
  { id: 'viktig', navn: 'Viktig informasjon', fast: true },
  { id: 'kontakt', navn: 'Kontakt oss', fast: true }
];
const KAPITLER = { 1: 'Utgangspunkt', 2: 'Porteføljen', 3: 'Avkastning og risiko', 4: 'Byggesteinene' };
// Standardutvalget: alt unntatt tilleggssidene og sider som er valgfrie tilvalg.
export const standardSider = () => FORSLAG_SIDER.filter((s) => !s.tillegg && !s.valgfri).map((s) => s.id);

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
    tekst(s, tittel, { x: M, y: 0.24, w: B - 2 * M - 1.3, h: 0.5, fontFace: LETT, fontSize: 18, valign: 'middle', fit: 'shrink' });
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

  const tabell = (s, x, y, w, hode, rader, kolW, { fontSize = 8, radH = 0.26, sum = null, hodeVenstre = false } = {}) => {
    const celle = (t, o = {}) => ({ text: String(t), options: { fontFace: FONT, fontSize, color: F.navy, valign: 'middle', margin: [0.03, 0.07, 0.03, 0.07], border: [{ type: 'none' }, { type: 'none' }, { type: 'solid', pt: 0.5, color: F.linje }, { type: 'none' }], ...o } });
    const hodeRad = hode.map((h, i) => celle(h, { bold: true, color: F.hvit, fill: { color: F.navy }, fontSize: fontSize - 0.5, align: i === 0 || hodeVenstre ? 'left' : 'right' }));
    const kropp = rader.map((r) => r.map((c, i) => (typeof c === 'object' && c !== null ? celle(c.t, { align: i === 0 ? 'left' : 'right', ...c.o }) : celle(c, { align: i === 0 ? 'left' : 'right' }))));
    const sumRad = sum ? [sum.map((c, i) => celle(c, { bold: true, fill: { color: F.lys }, align: i === 0 ? 'left' : 'right' }))] : [];
    s.addTable([hodeRad, ...kropp, ...sumRad], { x, y, w, colW: kolW, rowH: radH, fill: { color: F.hvit } });
  };

  const punktliste = (s, x, y, w, h, punkter, { farge = F.navy, fontSize = 8.5, etter = 4 } = {}) =>
    tekst(s, punkter.map((p) => ({ text: p, options: { bullet: { indent: 11 }, breakLine: true, paraSpaceAfter: etter } })), { x, y, w, h, fontSize, color: farge });

  const harSide = (id) => sider.includes(id) || FORSLAG_SIDER.find((x) => x.id === id)?.fast;
  const beloep = (v) => (m.belopKjent ? mill(v) : 'Avklares');
  const perMill = m.belopKjent ? '' : ' per 1 mill. kr investert';
  // Kapittelsider og innholdsside. Innholdssiden fylles til slutt, når sidetallene er kjent.
  const innhold = [];
  let innholdsside = null;
  const kapittel = (nr) => {
    if (!sider.includes('kapitler')) return;
    const iKapittel = FORSLAG_SIDER.filter((x) => x.kapittel === nr && harSide(x.id));
    if (!iKapittel.length) return;
    skille(String(nr).padStart(2, '0'), KAPITLER[nr], iKapittel.map((x) => x.navn));
    innhold.push({ nr: String(nr).padStart(2, '0'), navn: KAPITLER[nr], side: sidenr });
  };
  const hoved = m.scenarioer.find((x) => x.id === 'hoved');
  const svak = m.scenarioer.find((x) => x.id === 'svak');
  const sterk = m.scenarioer.find((x) => x.id === 'sterk');
  const aksjer = m.aktivafordeling.find((a) => a.navn === 'Aksjer')?.hel || 0;

  // ---------- forside ----------
  {
    const s = pptx.addSlide(); sidenr += 1;
    s.background = { color: F.navy };
    // Bildet er laget for hele lysbildet (16:9, med overgang til mørkeblått til venstre) og skal ikke beskjæres.
    if (assets.forside) s.addImage({ path: assets.forside, x: 0, y: 0, w: B, h: H });
    if (assets.logoMork) s.addImage({ path: assets.logoMork, x: 0.45, y: 0.4, w: 0.95, h: 0.464 });
    etikett(s, `Investeringsforslag  ·  ${MND[m.dato.getMonth()]} ${m.dato.getFullYear()}`, 0.45, 1.95, 4.3);
    tekst(s, `Forslag til portefølje\n${m.kunde}`, { x: 0.45, y: 2.2, w: 4.3, h: 1.1, fontSize: 22, color: F.hvit, fit: 'shrink' });
    tekst(s, `${m.radgiver.navn ? `Utarbeidet av ${m.radgiver2 ? `${m.radgiver.navn} og ${m.radgiver2.navn}` : `${m.radgiver.navn}, ${m.radgiver.tittel}`}\n` : ''}Pensum Asset Management  ·  ${datoTekst(m.dato)}`, { x: 0.45, y: 3.5, w: 4.3, h: 0.5, fontSize: 8.5, color: 'B8C4D0', lineSpacingMultiple: 1.2 });
    tekst(s, 'Markedsføringsmateriell', { x: 0.45, y: H - 0.45, w: 3, h: 0.2, fontSize: 6.5, color: '8FA3B5' });
  }

  // ---------- forslaget i korte trekk ----------
  {
    const s = side('Forslaget i korte trekk', {
      ingress: `En ${m.risikoprofil.toLowerCase()} portefølje${m.belopKjent ? ` på ${mill(m.belop)}` : ''} med ${aksjer}${NB}% aksjer og ${m.horisont} års horisont. Forventet avkastning er ${pst(m.forventetAvkastning)} per år.`
    });
    const y = TOPP_INGRESS + 0.05; const w = (B - 2 * M - 0.45) / 4;
    noekkeltall(s, M, y, w, 'Investert beløp', beloep(m.belop));
    noekkeltall(s, M + (w + 0.15), y, w, 'Forventet avkastning', `${pst(m.forventetAvkastning)} p.a.`, { under: 'Ikke garantert' });
    noekkeltall(s, M + 2 * (w + 0.15), y, w, 'Forventet svingning', pst(m.scenarioVolatilitet), { under: 'Årlig standardavvik' });
    noekkeltall(s, M + 3 * (w + 0.15), y, w, `Forventet om ${m.horisont} år`, mill(hoved.sluttverdi), { moerk: true, under: m.belopKjent ? `Svakt scenario: ${mill(svak.sluttverdi)}` : 'Per 1 mill. kr investert' });

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
      tekst(s, kutt(p.navn.replace('Pensum ', ''), 34), { x: M + 1.86, y: yy, w: vW - 2.6, h: radH, fontSize: 8, valign: 'middle', fit: 'shrink' });
      tekst(s, vektTekst(p.vekt), { x: M + vW - 0.72, y: yy, w: 0.58, h: radH, fontSize: 8, bold: true, align: 'right', valign: 'middle' });
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

  if (sider.includes('kapitler')) {
    innholdsside = side('Innhold');
  }
  kapittel(1);

  // ---------- kundeprofil og mandat (tilvalg) ----------
  if (harSide('mandat')) {
    const s = side('Kundeprofil og mandat', { ingress: 'Forslaget bygger på opplysningene under. Endres de, kan vurderingen og forslaget endres.' });
    const y = TOPP_INGRESS; const h = BUNN - y; const vW = 5.4;
    kort(s, M, y, vW, h);
    etikett(s, 'Opplysninger lagt til grunn', M + 0.18, y + 0.14, 3);
    const rader = [
      ['Kunde', m.selskap ? `${m.kunde} / ${m.selskap}` : m.kunde], ['Investert beløp', m.belopKjent ? kr(m.belop) : 'Avklares'], ['Tidshorisont', `${m.horisont} år`],
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

  // ---------- utgangspunkt og investeringsmandat ----------
  if (harSide('utgangspunkt')) {
    const s = side('Utgangspunkt og investeringsmandat');
    const y = TOPP; const h = BUNN - y; const w = (B - 2 * M - 0.3) / 3;
    const x2 = M + w + 0.15; const x3 = M + 2 * (w + 0.15);
    kort(s, M, y, w, h); kort(s, x2, y, w, h); kort(s, x3, y, w, h, F.navy);
    etikett(s, 'Forutsetninger', M + 0.2, y + 0.18, w - 0.4);
    const rader = [['Investerbar kapital', m.belopKjent ? kr(m.belop) : 'Avklares'], ['Risikoprofil', m.risikoprofil], ['Tidshorisont', `${m.horisont} år`], ...(m.formaal ? [['Formål', m.formaal]] : []), ['Forventet avkastning (modell)', `${pst(m.forventetAvkastning)} p.a.`], ['Likviditet', m.likviditet]];
    rader.forEach(([k, v], i) => {
      const yy = y + 0.5 + i * 0.5;
      tekst(s, k, { x: M + 0.2, y: yy, w: 1.25, h: 0.5, fontSize: 9, color: F.graa, valign: 'middle' });
      tekst(s, v, { x: M + 1.45, y: yy, w: w - 1.65, h: 0.5, fontSize: 10, bold: true, align: 'right', valign: 'middle', fit: 'shrink' });
      strek(s, M + 0.2, yy + 0.5, w - 0.4);
    });
    // Byggesettet: kjernen er grunnmuren, rentene bærer veggene, satellittene er taket.
    etikett(s, 'Porteføljelogikk · byggesett', x2 + 0.2, y + 0.18, w - 0.4);
    const rolleVekt = (id) => m.roller.find((r) => r.id === id)?.vekt || 0;
    const hus = x2 + (w - 2.0) / 2; const hy = y + 0.48;
    s.addShape(pptx.ShapeType.triangle, { x: hus - 0.12, y: hy, w: 2.24, h: 0.56, fill: { color: F.kobber }, line: { color: F.kobber, width: 0 } });
    tekst(s, pst(rolleVekt('satellitt'), 0), { x: hus, y: hy + 0.26, w: 2.0, h: 0.26, fontSize: 9.5, bold: true, color: F.hvit, align: 'center', valign: 'middle' });
    [['stabilisator', 'Stabilisator', F.blaa, hus + 0.12, 1.76, hy + 0.56], ['kjerne', 'Kjerne', F.navy, hus, 2.0, hy + 1.16]].forEach(([id, navn, farge, bx, bw, by]) => {
      s.addShape(pptx.ShapeType.rect, { x: bx, y: by, w: bw, h: 0.6, fill: { color: farge }, line: { color: 'FFFFFF', width: 0.75 } });
      tekst(s, pst(rolleVekt(id), 0), { x: bx, y: by + 0.06, w: bw, h: 0.3, fontSize: 13, bold: true, color: F.hvit, align: 'center', valign: 'middle' });
      tekst(s, navn.toUpperCase(), { x: bx, y: by + 0.36, w: bw, h: 0.16, fontSize: 6.5, bold: true, color: F.hvit, align: 'center', charSpacing: 2 });
    });
    [['1', 'Bygg bred kjerne', 'Bred global eksponering og hovedkilden til langsiktig avkastning.', F.navy],
      ['2', 'Stabiliser porteføljen', 'Renter gir løpende avkastning og demper svingningene.', F.blaa],
      ['3', 'Bruk satellitter selektivt', 'Utvalgte investeringer for diversifisering og meravkastning.', F.kobber]].forEach(([nr, t, b, farge], i) => {
      const yy = hy + 1.94 + i * 0.56;
      s.addShape(pptx.ShapeType.rect, { x: x2 + 0.2, y: yy + 0.02, w: 0.24, h: 0.24, fill: { color: farge }, line: { color: farge, width: 0 } });
      tekst(s, nr, { x: x2 + 0.2, y: yy + 0.02, w: 0.24, h: 0.24, fontSize: 8.5, bold: true, color: F.hvit, align: 'center', valign: 'middle' });
      tekst(s, t, { x: x2 + 0.54, y: yy, w: w - 0.74, h: 0.2, fontSize: 9, bold: true, valign: 'middle' });
      tekst(s, b, { x: x2 + 0.54, y: yy + 0.21, w: w - 0.74, h: 0.32, fontSize: 7.5, color: F.moerkGraa });
    });
    etikett(s, 'Rådgivers vurdering', x3 + 0.2, y + 0.18, w - 0.4);
    tekst(s, tekster.vurdering || 'Forslaget er satt sammen for å gi en robust og balansert portefølje, der hver byggestein har en tydelig rolle i helheten.', { x: x3 + 0.2, y: y + 0.5, w: w - 0.4, h: 0.9, fontFace: SERIF, fontSize: 10.5, color: F.hvit, lineSpacingMultiple: 1.15 });
    // En ren aksjeportefølje kan ikke beskrives som mer stabil enn en ren aksjeportefølje.
    const harDemper = m.aktivafordeling.some((a) => (a.navn === 'Renter' || a.navn === 'Kontanter') && a.vekt >= 10);
    (tekster.vurderingPunkter || [
      harDemper ? 'Porteføljen er bygget for å stå bedre gjennom svingninger enn en ren aksjeportefølje' : 'Porteføljen er bygget for langsiktig vekst og må tåle store svingninger underveis',
      harDemper ? 'Sammensetningen kombinerer langsiktig verdiskaping med løpende avkastning og stabilitet' : 'Sammensetningen er rettet mot langsiktig verdiskaping, med lang tidshorisont som forutsetning',
      'De utvalgte løsningene utfyller hverandre på tvers av aktivaklasse, geografi og investeringsstil'
    ]).forEach((t, i) => {
      const yy = y + 1.6 + i * 0.72; const farge = ['8FB3C7', F.blaa, F.kobber][i % 3];
      s.addShape(pptx.ShapeType.ellipse, { x: x3 + 0.2, y: yy + 0.06, w: 0.12, h: 0.12, fill: { color: farge }, line: { color: farge, width: 0 } });
      tekst(s, t, { x: x3 + 0.45, y: yy, w: w - 0.65, h: 0.62, fontSize: 9, color: 'D9E0E6' });
    });
  }

  // ---------- dagens portefølje (tilvalg): det kunden har i dag ----------
  const fortegnKr = (v) => `${v >= 0 ? '+' : '−'}${Math.abs(Math.round(v)).toLocaleString('nb-NO').replace(/\s/g, NB)}`;
  const heltall = (v) => Math.round(v).toLocaleString('nb-NO').replace(/\s/g, NB);
  if (harSide('dagens') && m.dagens) {
    const d = m.dagens;
    const visPlattformer = d.plattformer.length > 1 && d.plattformer.length <= 3;
    const s = side(d.plattformer.length && d.plattformer.length <= 3 ? `Dagens portefølje hos ${d.plattformer.join(' og ')}` : 'Dagens portefølje');
    const y = TOPP; const h = BUNN - y; const vW = 6.1; const hW = B - 2 * M - vW - 0.2; const hx = M + vW + 0.2;
    kort(s, M, y, vW, h);
    etikett(s, 'Beholdning per aktivaklasse (NOK)', M + 0.2, y + 0.16, vW - 0.4);
    const harGevinst = d.urealisert !== null;
    const hode = ['Aktivaklasse', ...(visPlattformer ? d.plattformer : []), 'Totalt', 'Andel', ...(harGevinst ? ['Ureal. gevinst'] : [])];
    const rader = d.perType.map((t) => [
      { t: `${t.navn}${t.type !== 'kontanter' ? ` (${t.antall})` : ''}`, o: { bold: true } },
      ...(visPlattformer ? d.plattformer.map((pl) => (t.perPlattform[pl] ? heltall(t.perPlattform[pl]) : '–')) : []),
      heltall(t.total), pst(t.andel),
      ...(harGevinst ? [t.urealisert === null ? '–' : { t: fortegnKr(t.urealisert), o: { color: t.urealisert < 0 ? F.roed : F.groenn } }] : []),
    ]);
    const tW = vW - 0.4; const fasteW = 0.95 + 0.7 + (harGevinst ? 1.05 : 0) + (visPlattformer ? d.plattformer.length * 0.95 : 0);
    const kolW = [tW - fasteW, ...(visPlattformer ? d.plattformer.map(() => 0.95) : []), 0.95, 0.7, ...(harGevinst ? [1.05] : [])];
    const radH = 0.25;
    tabell(s, M + 0.2, y + 0.42, tW, hode, rader, kolW, { radH, sum: ['Totalt', ...(visPlattformer ? d.perPlattform.map((pl) => heltall(pl.total)) : []), heltall(d.total), '100 %', ...(harGevinst ? [fortegnKr(d.urealisert)] : [])] });
    // Største enkeltposisjoner som liggende søyler, i tusen kroner.
    const sy = y + 0.42 + radH * (rader.length + 2) + 0.28;
    etikett(s, 'Største enkeltposisjoner (NOK 1 000)', M + 0.2, sy, vW - 0.4);
    const plass = y + h - 0.32 - (sy + 0.3); const antall = Math.max(0, Math.min(d.storste.length, Math.floor(plass / 0.2)));
    const soyleH = antall ? Math.min(0.24, plass / antall) : 0; const navnW = 1.9; const maksW = tW - navnW - 0.75; const storst = d.storste[0]?.verdi || 1;
    d.storste.slice(0, antall).forEach((p, i) => {
      const yy = sy + 0.3 + i * soyleH;
      tekst(s, p.navn, { x: M + 0.2, y: yy, w: navnW - 0.1, h: soyleH, fontSize: 7.5, align: 'right', valign: 'middle', fit: 'shrink' });
      s.addShape(pptx.ShapeType.rect, { x: M + 0.2 + navnW, y: yy + soyleH * 0.18, w: Math.max(0.02, maksW * (p.verdi / storst)), h: soyleH * 0.64, fill: { color: F.kobber }, line: { color: F.kobber, width: 0 } });
      tekst(s, heltall(p.verdi / 1000), { x: M + 0.2 + navnW + maksW * (p.verdi / storst) + 0.08, y: yy, w: 0.6, h: soyleH, fontSize: 7.5, valign: 'middle' });
    });
    tekst(s, `Kilde: oppgitt av deg og plattformene${harGevinst ? '. Urealisert gevinst er beregnet siden kjøp (kostpris)' : ''}.`, { x: M + 0.2, y: y + h - 0.26, w: tW, h: 0.18, fontSize: 6.5, color: F.graa });
    // Nøkkeltall
    kort(s, hx, y, hW, h, F.navy);
    etikett(s, 'Nøkkeltall dagens portefølje', hx + 0.22, y + 0.2, hW - 0.4, F.kobber);
    const avk = d.plattformAvkastning;
    const tall4 = [
      [kr(d.total), 'Samlet markedsverdi'],
      [`${d.antallPosisjoner}${d.harKontanter ? ' + kontanter' : ''}`, d.plattformer.length > 1 ? `Posisjoner på ${d.plattformer.length} plattformer` : 'Posisjoner'],
      [pst(d.kontanter.andel), `Kontanter (${kr(d.kontanter.belop)})`],
      avk.length ? [avk.slice(0, 2).map((a) => pstFortegn(a.avkastningIaar)).join('  /  '), `Hittil i år: ${avk.slice(0, 2).map((a) => a.navn).join(' / ')}`] : [pst(d.storsteAndel), `Største posisjon: ${d.storste[0]?.navn || '–'}`],
    ];
    const trinn = (h - 0.6) / tall4.length;
    tall4.forEach(([verdi, under], i) => {
      const yy = y + 0.52 + i * trinn;
      tekst(s, verdi, { x: hx + 0.22, y: yy, w: hW - 0.4, h: 0.36, fontSize: 17, color: F.hvit, valign: 'middle', fit: 'shrink' });
      tekst(s, under.toUpperCase(), { x: hx + 0.22, y: yy + 0.4, w: hW - 0.4, h: 0.2, fontSize: 6.5, color: 'C9D5E3', charSpacing: 2, bold: true, fit: 'shrink' });
    });
  }

  // ---------- dagens mot ny portefølje (tilvalg) ----------
  if (harSide('dagensmotny') && m.dagens?.motNy) {
    const d = m.dagens; const n = d.motNy;
    const s = side('Dagens portefølje mot ny portefølje');
    const y = TOPP; const h = BUNN - y; const vW = 3.7; const hx = M + vW + 0.2; const hW = B - 2 * M - vW - 0.2;
    kort(s, M, y, vW, h);
    etikett(s, 'Aktivafordeling, samlet (%)', M + 0.2, y + 0.16, vW - 0.4);
    // Tegnforklaring
    const ly = y + 0.46;
    s.addShape(pptx.ShapeType.rect, { x: M + vW / 2 - 0.85, y: ly + 0.04, w: 0.1, h: 0.1, fill: { color: 'C5D2DE' }, line: { color: 'C5D2DE', width: 0 } });
    tekst(s, 'Dagens', { x: M + vW / 2 - 0.71, y: ly, w: 0.55, h: 0.18, fontSize: 7.5 });
    s.addShape(pptx.ShapeType.rect, { x: M + vW / 2 + 0.05, y: ly + 0.04, w: 0.1, h: 0.1, fill: { color: F.navy }, line: { color: F.navy, width: 0 } });
    tekst(s, 'Ny', { x: M + vW / 2 + 0.19, y: ly, w: 0.4, h: 0.18, fontSize: 7.5 });
    // Søyler i par per aktivaklasse
    const gy = ly + 0.5; const gH = h - (gy - y) - 0.75; const maks = Math.max(1, ...n.klasser.map((k) => Math.max(k.dagens, k.ny)));
    const gruppeW = (vW - 0.4) / n.klasser.length; const sW = Math.min(0.36, gruppeW * 0.32);
    n.klasser.forEach((k, i) => {
      const midt = M + 0.2 + gruppeW * (i + 0.5);
      [[k.dagens, 'C5D2DE', midt - sW - 0.02], [k.ny, F.navy, midt + 0.02]].forEach(([v, farge, x]) => {
        const hh = Math.max(0.01, gH * (v / maks));
        if (v >= 0.5) {
          s.addShape(pptx.ShapeType.rect, { x, y: gy + gH - hh, w: sW, h: hh, fill: { color: farge }, line: { color: farge, width: 0 } });
          tekst(s, String(Math.round(v)), { x: x - 0.1, y: gy + gH - hh - 0.2, w: sW + 0.2, h: 0.18, fontSize: 7.5, align: 'center' });
        }
      });
      tekst(s, k.navn, { x: midt - gruppeW / 2, y: gy + gH + 0.06, w: gruppeW, h: 0.2, fontSize: 7.5, align: 'center', fit: 'shrink' });
    });
    s.addShape(pptx.ShapeType.line, { x: M + 0.2, y: gy + gH, w: vW - 0.4, h: 0, line: { color: 'C5D2DE', width: 0.75 } });
    tekst(s, `Ny = forslaget fra Pensum (${mill(n.pensumBelop)})${n.beholdtBelop > 0 ? ` + det du beholder (${mill(n.beholdtBelop)})` : ''}.`, { x: M + 0.2, y: y + h - 0.36, w: vW - 0.4, h: 0.3, fontSize: 6.5, color: F.graa });
    // Sammenligningstabell: bare tall som følger av posisjonene og forslaget.
    const avk = d.plattformAvkastning;
    const rader = [
      ['Posisjoner', `${n.posisjoner.dagens}${d.harKontanter ? ' + kontanter' : ''}${d.antallFond ? ` (${d.antallFond} fond)` : ''}`, `${n.posisjoner.nyProdukter} produkter${n.posisjoner.nyBeholdt ? ` + ${n.posisjoner.nyBeholdt} du beholder` : ''}`],
      ...(d.plattformer.length > 1 ? [['Plattformer', `${d.plattformer.length} (${d.plattformer.join(', ')})`, n.beholdtBelop > 0 ? 'Samlet hos Pensum, pluss det du beholder' : 'Samlet hos Pensum']] : []),
      ['Kontanter', `${pst(n.kontanter.dagens)} (${kr(d.kontanter.belop)})`, n.kontanter.ny < 0.5 ? 'Fullt investert' : pst(n.kontanter.ny)],
      ['Aksjeandel', pst(n.aksjeandel.dagens, 0), pst(n.aksjeandel.ny, 0)],
      ['Renteandel', pst(n.renteandel.dagens, 0), pst(n.renteandel.ny, 0)],
      ...(n.alternativer.dagens >= 0.5 || n.alternativer.ny >= 0.5 ? [['Alternativer', pst(n.alternativer.dagens, 0), pst(n.alternativer.ny, 0)]] : []),
      ...(avk.length ? [['Avkastning i år', avk.map((a) => `${a.navn} ${pstFortegn(a.avkastningIaar)}`).join(', '), '–']] : []),
      ['Forventet avkastning', 'Ikke definert', n.forventetAvkastning !== null ? `${pst(n.forventetAvkastning)} p.a. (Pensum-delen, modell)` : '–'],
    ].map(([a, b, c]) => [{ t: a, o: { bold: true } }, { t: b, o: { align: 'left' } }, { t: c, o: { align: 'left' } }]);
    tabell(s, hx, y, hW, ['', 'Dagens', 'Ny'], rader, [1.35, (hW - 1.35) / 2, (hW - 1.35) / 2], { radH: Math.min(0.42, (h - 0.1) / (rader.length + 1)), fontSize: 8, hodeVenstre: true });
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

  kapittel(2);

  // ---------- oppbygging ----------
  if (harSide('oppbygging') && m.roller.length) {
    const s = side('Hvordan porteføljen er bygget', { ingress: 'Porteføljen er bygget rundt tydelige roller: en bred kjerne, en stabiliserende rentedel og utvalgte satellitter som kan bidra til meravkastning.' });
    const y = TOPP_INGRESS; const nedH = 1.32; const h = BUNN - y - nedH - 0.12; const n = m.roller.length; const w = (B - 2 * M - 0.15 * (n - 1)) / n;
    const farger = { kjerne: F.navy, stabilisator: F.blaa, satellitt: F.kobber };
    m.roller.forEach((r, i) => {
      const x = M + i * (w + 0.15); const farge = farger[r.id];
      kort(s, x, y, w, h);
      s.addShape(pptx.ShapeType.rect, { x, y, w, h: 0.05, fill: { color: farge }, line: { color: farge, width: 0 } });
      etikett(s, r.navn, x + 0.18, y + 0.15, w - 0.36, farge);
      tekst(s, pst(r.vekt, 0), { x: x + 0.18, y: y + 0.32, w: 1.15, h: 0.4, fontSize: 22, valign: 'middle' });
      tekst(s, 'av porteføljen', { x: x + 1.3, y: y + 0.32, w: w - 1.5, h: 0.4, fontSize: 8, color: F.graa, valign: 'middle' });
      tekst(s, kutt(r.produkter.map((p) => p.navn).join(', '), 90), { x: x + 0.18, y: y + 0.76, w: w - 0.36, h: 0.32, fontSize: 9, bold: true, fit: 'shrink' });
      tekst(s, r.tekst, { x: x + 0.18, y: y + 1.1, w: w - 0.36, h: 0.4, fontSize: 8, color: F.moerkGraa });
      strek(s, x + 0.18, y + 1.54, w - 0.36);
      tekst(s, 'Rolle i porteføljen', { x: x + 0.18, y: y + 1.59, w: w - 0.36, h: 0.15, fontSize: 7, bold: true, color: F.graa });
      (r.bidrag || []).forEach((b, j) => {
        const yy = y + 1.77 + j * 0.17;
        s.addShape(pptx.ShapeType.ellipse, { x: x + 0.18, y: yy + 0.045, w: 0.08, h: 0.08, fill: { color: farge }, line: { color: farge, width: 0 } });
        tekst(s, b, { x: x + 0.34, y: yy, w: w - 0.52, h: 0.17, fontSize: 8, valign: 'middle' });
      });
    });
    // Nederst: porteføljefordeling og aktivafordeling som smultringer.
    const ny = y + h + 0.12; const vW = 5.7; const hW = B - 2 * M - 0.15 - vW;
    const aFarger = { Aksjer: F.navy, Renter: F.kobber, Alternativer: F.teal, Kontanter: '8FA3B5' };
    const smultring = (x, nw, tittel, rader, fargeliste) => {
      kort(s, x, ny, nw, nedH);
      etikett(s, tittel, x + 0.16, ny + 0.1, nw - 0.3, F.navy);
      s.addChart(pptx.ChartType.doughnut, [{ name: 'Vekt', labels: rader.map((r) => r.navn), values: rader.map((r) => r.vekt) }], {
        x: x + 0.08, y: ny + 0.24, w: 1.05, h: 1.05, holeSize: 60, showLegend: false, showLabel: false, showValue: false, showPercent: false, showTitle: false,
        chartColors: fargeliste, dataBorder: { pt: 1, color: 'FFFFFF' }
      });
      const kol = rader.length > 6 ? 2 : 1; const perKol = Math.ceil(rader.length / kol); const kw = (nw - 1.4) / kol;
      const rH = Math.min(0.2, (nedH - 0.36) / perKol);
      const start = ny + 0.3 + Math.max(0, (nedH - 0.36 - perKol * rH) / 2);
      rader.forEach((r, i) => {
        const lx = x + 1.28 + Math.floor(i / perKol) * kw; const yy = start + (i % perKol) * rH;
        s.addShape(pptx.ShapeType.rect, { x: lx, y: yy + rH / 2 - 0.04, w: 0.08, h: 0.08, fill: { color: fargeliste[i % fargeliste.length] }, line: { color: 'FFFFFF', width: 0 } });
        tekst(s, kutt(r.navn, kol === 2 ? 30 : 44), { x: lx + 0.14, y: yy, w: kw - 0.72, h: rH, fontSize: kol === 2 ? 7 : 8, valign: 'middle' });
        tekst(s, vektTekst(r.vekt), { x: lx + kw - 0.58, y: yy, w: 0.5, h: rH, fontSize: kol === 2 ? 7 : 8, bold: true, align: 'right', valign: 'middle' });
      });
    };
    smultring(M, vW, 'Porteføljefordeling', m.produkter.map((p) => ({ navn: p.navn.replace('Pensum ', ''), vekt: p.vekt })), SERIEFARGER);
    smultring(M + vW + 0.15, hW, 'Aktivafordeling', m.aktivafordeling.map((a) => ({ navn: a.navn, vekt: a.hel })), m.aktivafordeling.map((a) => aFarger[a.navn]));
  }

  // ---------- porteføljesammensetning ----------
  if (harSide('portefolje')) {
    const s = side(`Porteføljen: ${m.aktivafordeling.map((a) => `${a.hel}${NB}% ${a.navn.toLowerCase()}`).join(', ')}`);
    const hi = m.historikk; const po = m.portefolje;
    const visAar = m.produkter.length <= 9 && hi.aarsavkastning.some((a) => a.verdi != null);
    const farget = (v) => ({ t: pstFortegn(v), o: { color: v == null ? F.graa : (v < 0 ? F.roed : F.groenn) } });
    const sharpe = (v) => (v == null || !Number.isFinite(v) ? '–' : tall(v, 2));
    const fall = (v) => ({ t: pst(v), o: { color: v == null ? F.graa : F.roed } });
    const hode = ['Produkt', 'Vekt', '1 år', '3 år p.a.', '5 år p.a.', 'Volatilitet', 'Sharpe', 'Maks fall'];
    const rader = m.produkter.map((p) => [p.navn, vektTekst(p.vekt), farget(p.avk1), farget(p.avk3), farget(p.avk5), pst(p.volatilitet), sharpe(p.sharpe), fall(p.maxDrawdown)]);
    const kolW = [3.5, 0.8, 0.85, 0.9, 0.9, 0.9, 0.75, 0.8];
    const plass = BUNN - TOPP - 0.5 - (visAar ? 1.0 : 0);
    const radH = Math.min(0.3, plass / (rader.length + 2));
    tabell(s, M, TOPP, B - 2 * M, hode, rader, kolW, { radH, sum: ['Porteføljen (vektet)', '100 %', pstFortegn(po.avk1), pstFortegn(po.avk3), pstFortegn(po.avk5), pst(po.risiko), sharpe(po.sharpe), pst(po.maxDrawdown)] });
    if (visAar) {
      const ay = BUNN - 0.5 - 0.92; const aw = B - 2 * M;
      kort(s, M, ay, aw, 0.86);
      etikett(s, 'Forslagets historiske avkastning per år (vektet)', M + 0.16, ay + 0.1, 5);
      const bw = (aw - 0.32) / 5;
      hi.aarsavkastning.slice().reverse().forEach((a, i) => {
        tekst(s, a.etikett, { x: M + 0.16 + i * bw, y: ay + 0.3, w: bw, h: 0.16, fontSize: 7.5, color: F.graa });
        tekst(s, pstFortegn(a.verdi), { x: M + 0.16 + i * bw, y: ay + 0.46, w: bw, h: 0.32, fontSize: 15, bold: true, valign: 'middle', color: a.verdi == null ? F.graa : (a.verdi < 0 ? F.roed : F.groenn) });
      });
    }
    tekst(s, `Avkastning beregnet fra daglige kurser per ${m.rapportDato}, etter kostnader i fondene. 3 og 5 år er årlig snitt. Sharpe med risikofri rente ${pst(m.risikofriRente)}. Volatilitet, Sharpe og maks fall gjelder siste ${hi.periodeAar} år; for porteføljen er de beregnet fra den vektede, daglig rebalanserte porteføljen. Historisk avkastning er ingen garanti for fremtidig avkastning.${hi.utenHistorikk.length ? ` Uten kurshistorikk: ${hi.utenHistorikk.join(', ')}.` : ''}`, { x: M, y: BUNN - 0.42, w: B - 2 * M, h: 0.4, fontSize: 7, color: F.graa, italic: true });
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

  // ---------- totalbildet (tilvalg): forslaget sammen med kundens øvrige investeringer ----------
  if (harSide('totalbilde') && m.totalbilde) {
    const t = m.totalbilde;
    const s = side(`Totalbildet: ${pst(t.pensumAndel, 0)} av investeringene i dette forslaget`, { ingress: `Samlet har du ${mill(t.total)} investert. ${mill(t.pensum)} inngår i forslaget fra Pensum, og ${mill(t.ovrig)} ligger andre steder.` });
    const y = TOPP_INGRESS; const h = BUNN - y - 0.3; const vW = 5.9; const hW = B - 2 * M - vW - 0.15;
    const hode = ['Investering', 'Type', 'Verdi', 'Andel', 'Forv. avk.'];
    const rader = [
      [{ t: 'Pensum-forslaget', o: { bold: true } }, 'Portefølje', mill(t.pensum), pst(t.pensumAndel), pst(m.forventetAvkastning)],
      ...t.linjer.map((x) => [x.navn, x.typeNavn, mill(x.belop), pst(x.andel), x.type === 'annet' && x.avkastning == null ? '–' : pst(x.brukAvkastning)]),
    ];
    const radH = Math.min(0.3, (h - 0.1) / (rader.length + 2));
    tabell(s, M, y, vW, hode, rader, [2.35, 1.35, 0.9, 0.6, 0.7], { radH, sum: ['Samlet', '', mill(t.total), '100 %', pst(t.totalAvkastning)] });
    const hx = M + vW + 0.15; const klH = Math.min(1.75, 0.5 + t.klasser.length * 0.26);
    kort(s, hx, y, hW, klH);
    etikett(s, 'Aktivaklasser samlet', hx + 0.16, y + 0.12, hW - 0.3);
    soyler(s, hx + 0.16, y + 0.4, hW - 0.32, t.klasser.map((k) => ({ navn: k.navn, vekt: k.andel })), { farge: F.navy, radH: 0.25, navnW: 0.95 });
    const fy = y + klH + 0.12; const fH = 1.3;
    kort(s, hx, fy, hW, fH, F.navy);
    etikett(s, `Forventet verdi om ${m.horisont} år`, hx + 0.16, fy + 0.12, hW - 0.3, F.kobber);
    tekst(s, mill(t.sluttverdi.total), { x: hx + 0.16, y: fy + 0.34, w: hW - 0.32, h: 0.36, fontSize: 20, bold: true, color: F.hvit, fontFace: SERIF });
    tekst(s, `Pensum-forslaget ${mill(t.sluttverdi.pensum)}\nØvrige investeringer ${mill(t.sluttverdi.ovrig)}`, { x: hx + 0.16, y: fy + 0.76, w: hW - 0.32, h: 0.4, fontSize: 8, color: 'C9D5E3' });
    tekst(s, `Øvrige investeringer er oppgitt av deg eller rådgiver og er ikke forvaltet av Pensum. De er fremskrevet med anslått årlig avkastning, uten innskudd og uttak, og inngår ikke i forslagets historikk, risikotall eller kostnader.${t.manglerAvkastning.length ? ' Investeringer uten oppgitt avkastning er regnet med uendret verdi.' : ''} Tallene er en fremskrivning, ikke en garanti.`, { x: M, y: BUNN - 0.24, w: B - 2 * M, h: 0.24, fontSize: 6.5, color: F.graa });
  }

  kapittel(3);

  // ---------- historisk utvikling ----------
  if (harSide('historikk') && m.historikk.datoer.length > 6) {
    const hi = m.historikk;
    const slutt = hi.portefolje[hi.portefolje.length - 1];
    const s = side(`Historisk avkastning: ${pstFortegn(slutt, 0)} siste ${hi.periodeAar} år`, { ingress: `Samme sammensetning som i forslaget, ${pst(hi.aarligAvkastning)} i årlig snitt. Største fall i perioden var ${pst(m.historiskMaksFall)}. ${hi.referanser.map((r) => `${r.navn} ${pstFortegn(r.verdier[r.verdier.length - 1], 0)}`).join(', ')}.` });
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

  // ---------- hvordan historikken er estimert ----------
  if (harSide('historikk') && m.historikk.datoer.length > 6 && m.estimatnoter.length) {
    const s = side('Viktig informasjon om avkastningsestimatet', { ingress: 'Posisjonene har oppstart på ulike tidspunkt. Avkastningen før oppstart er estimert slik:' });
    const y = TOPP_INGRESS; const h = BUNN - y;
    kort(s, M, y, B - 2 * M, h);
    const rH = Math.min(0.42, (h - 0.75) / m.estimatnoter.length);
    m.estimatnoter.forEach((n, i) => {
      const yy = y + 0.15 + i * rH;
      tekst(s, n.navn, { x: M + 0.2, y: yy, w: 2.6, h: rH, fontSize: 9, bold: true, valign: 'middle', fit: 'shrink' });
      tekst(s, n.tekst, { x: M + 2.9, y: yy, w: B - 2 * M - 3.1, h: rH, fontSize: 9, color: F.moerkGraa, valign: 'middle', fit: 'shrink' });
      strek(s, M + 0.2, yy + rH, B - 2 * M - 0.4);
    });
    tekst(s, 'Avkastningstall for diskresjonært forvaltede porteføljer er netto et kostnadsestimat på 1,2 %; avkastningstall for fond er netto kostnader. Historisk avkastning er ingen garanti for fremtidig avkastning.', { x: M + 0.2, y: y + h - 0.5, w: B - 2 * M - 0.4, h: 0.4, fontSize: 8, color: F.graa, italic: true, valign: 'bottom' });
  }

  // ---------- scenarioer ----------
  if (harSide('scenarioer')) {
    const s = side(`Forventet verdi om ${m.horisont} år: ${mill(hoved.sluttverdi)}`, { ingress: `I 9 av 10 utfall anslår modellen en verdi mellom ${mill(svak.sluttverdi)} og ${mill(sterk.sluttverdi)}${perMill}. Underveis kan verdien falle betydelig.` });
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

  // ---------- renters rente ----------
  if (harSide('rentersrente') && m.rentersRente.length > 1) {
    const rr = m.rentersRente; const siste = rr[rr.length - 1];
    // Med årlige innskudd eller uttak er dette en egen illustrasjon, ikke kundens hovedscenario.
    const medKs = !!m.nettoKontantstrom; const ks = m.nettoKontantstrom > 0 ? 'innskudd' : 'uttak';
    const s = side(`Renters rente står for ${mill(siste.effekt)} av veksten`, { ingress: `Med ${pst(m.forventetAvkastning)} per år vokser ${m.belopKjent ? mill(m.belop) : '1 mill. kr'} til ${mill(siste.kapital + siste.enkel + siste.effekt)} på ${m.horisont} år. Jo lenger horisont, jo større del kommer fra avkastning på avkastning.${medKs ? ` Vist uten årlige ${ks}; se «Forventet utvikling» for hovedscenariet.` : ''}` });
    const y = TOPP_INGRESS; const h = BUNN - y; const gW = 6.3;
    kort(s, M, y, gW, h);
    etikett(s, `${medKs ? `Illustrasjon uten ${ks}` : 'Hovedscenario'}, mill. kr${perMill}`, M + 0.16, y + 0.12, gW - 0.3);
    const aar = rr.map((p) => String(p.aar));
    s.addChart(pptx.ChartType.bar, [
      { name: 'Investert kapital', labels: aar, values: rr.map((p) => p.kapital / 1e6) },
      { name: 'Enkel avkastning', labels: aar, values: rr.map((p) => p.enkel / 1e6) },
      { name: 'Renters rente-effekt', labels: aar, values: rr.map((p) => p.effekt / 1e6) }
    ], {
      x: M + 0.05, y: y + 0.3, w: gW - 0.1, h: h - 0.62, barDir: 'col', barGrouping: 'stacked', barGapWidthPct: 45, chartColors: [F.navy, F.blaa, F.kobber],
      showLegend: true, legendPos: 'b', legendFontSize: 8, legendFontFace: FONT, legendColor: F.moerkGraa,
      catAxisLabelFontSize: 7.5, catAxisLabelFontFace: FONT, catAxisLabelColor: F.graa, catAxisLineShow: false,
      valAxisLabelFontSize: 7.5, valAxisLabelFontFace: FONT, valAxisLabelColor: F.graa, valAxisLabelFormatCode: '0" mill."', valAxisLineShow: false,
      valGridLine: { color: 'E3E7EB', width: 0.5 }, catGridLine: { style: 'none' }
    });
    tekst(s, `Beregnet med forventet avkastning ${pst(m.forventetAvkastning)} per år før kostnader, uten innskudd eller uttak. Illustrasjon, ikke en garanti.`, { x: M + 0.16, y: y + h - 0.3, w: gW - 0.32, h: 0.24, fontSize: 7, color: F.graa, italic: true });
    const hx = M + gW + 0.15; const hW = B - M - hx;
    kort(s, hx, y, hW, h, F.navy);
    etikett(s, `Etter ${m.horisont} år${medKs ? `, uten ${ks}` : ''}${perMill}`, hx + 0.2, y + 0.16, hW - 0.4);
    [[m.belopKjent ? mill(siste.kapital) : '1,0 mill. kr', 'Investert kapital'], [mill(siste.kapital + siste.enkel + siste.effekt), medKs ? `Verdi ${siste.aar} uten ${ks}` : `Forventet verdi ${siste.aar}`], [mill(siste.enkel + siste.effekt), 'Samlet avkastning'], [mill(siste.effekt), 'Herav renters rente-effekt']].forEach(([v, e], i) => {
      const yy = y + 0.5 + i * ((h - 0.6) / 4);
      tekst(s, v, { x: hx + 0.2, y: yy, w: hW - 0.4, h: 0.36, fontFace: LETT, fontSize: 18, color: i === 3 ? F.kobber : F.hvit, valign: 'middle' });
      tekst(s, e, { x: hx + 0.2, y: yy + 0.38, w: hW - 0.4, h: 0.2, fontSize: 8, color: 'B8C4D0' });
    });
  }

  // ---------- risikofaktorer og mulige tap ----------
  if (harSide('risiko')) {
    const egen = m.fall.find((f) => f.egen);
    const s = side(egen && !m.historikk.utenHistorikk.length ? `Største fall siste ${m.historikk.periodeAar} år: ${pst(egen.verdi)}` : 'Risikofaktorer og mulige tap', { ingress: 'Porteføljen kan svinge betydelig, og du må kunne tåle perioder med vesentlige fall. Ved markedsuro kan aksjefond og rentefond falle samtidig.' });
    const y = TOPP_INGRESS; const h = BUNN - y; const vW = 5.3;
    kort(s, M, y, vW, h);
    etikett(s, 'Sentrale risikofaktorer', M + 0.18, y + 0.14, vW - 0.36);
    const risikoer = tekster.risikofaktorer || [
      ['Aksjemarkedsrisiko', 'Verdiene følger aksjemarkedene og kan falle raskt.'],
      ['Kreditt- og spreadrisiko', 'Rentefond kan falle ved mislighold og økte kredittpåslag.'],
      ['Valutarisiko', 'Flere fond har eksponering mot fremmed valuta.'],
      ['Konsentrasjonsrisiko', 'Eksponering mot Norge, Norden eller enkeltsektorer kan øke svingningene.'],
      ['Forvalterrisiko', 'Aktive fond kan gjøre det svakere enn indeks.'],
      ['Likviditetsrisiko', 'Enkelte posisjoner kan være vanskelige å selge i urolige perioder.'],
      ['Modellrisiko', 'Scenarioer og forventet avkastning er modellberegninger.']
    ];
    const rH = (h - 0.5) / risikoer.length;
    risikoer.forEach(([t, b], i) => {
      const yy = y + 0.42 + i * rH;
      s.addShape(pptx.ShapeType.ellipse, { x: M + 0.18, y: yy + rH / 2 - 0.05, w: 0.1, h: 0.1, fill: { color: F.kobber }, line: { color: F.kobber, width: 0 } });
      tekst(s, [{ text: `${t}. `, options: { bold: true } }, { text: b, options: { color: F.moerkGraa } }], { x: M + 0.42, y: yy, w: vW - 0.62, h: rH, fontSize: 9, valign: 'middle' });
    });
    const hx = M + vW + 0.15; const hW = B - M - hx;
    kort(s, hx, y, hW, h);
    etikett(s, `Største fall fra topp til bunn, siste ${m.historikk.periodeAar} år`, hx + 0.18, y + 0.14, hW - 0.36);
    const verst = Math.min(-1, ...m.fall.map((f) => f.verdi));
    const sH = Math.min(0.62, (h - 1.9) / Math.max(m.fall.length, 1));
    const uten = m.historikk.utenHistorikk;
    m.fall.forEach((f, i) => {
      const yy = y + 0.5 + i * sH; const farge = f.egen ? F.kobber : F.navy; const full = hW - 2.5;
      tekst(s, f.egen && uten.length ? 'Porteføljen*' : f.navn, { x: hx + 0.18, y: yy, w: 1.3, h: sH, fontSize: 9, bold: !!f.egen, valign: 'middle' });
      s.addShape(pptx.ShapeType.rect, { x: hx + 1.5, y: yy + sH * 0.28, w: Math.max(0.02, full * f.verdi / verst), h: sH * 0.44, fill: { color: farge }, line: { color: farge, width: 0 } });
      tekst(s, pst(f.verdi), { x: hx + hW - 0.95, y: yy, w: 0.77, h: sH, fontFace: LETT, fontSize: 13, color: farge, align: 'right', valign: 'middle' });
    });
    const merknadH = uten.length ? 1.12 : 0.78;
    strek(s, hx + 0.18, y + h - merknadH - 0.08, hW - 0.36);
    tekst(s, `Historiske fall begrenser ikke fremtidige tap. Tapet kan bli vesentlig større, og du kan tape deler av investert kapital. Beregnet fra daglige kurser.${uten.length ? ` *Gjelder bare produktene med kurshistorikk. Ikke med: ${uten.join(', ')}.` : ''}`, { x: hx + 0.18, y: y + h - merknadH, w: hW - 0.36, h: merknadH - 0.1, fontSize: 8.5, color: F.moerkGraa, fit: 'shrink' });
  }

  kapittel(4);

  // ---------- faktaark ----------
  if (harSide('faktaark')) {
    m.produkter.filter((p) => p.pitch || p.hvorfor || p.rolleTekst || Object.values(p.eksponering).some((l) => l.length)).forEach((p, idx) => {
      const s = side(`${p.navn}: ${vektTekst(p.vekt)} av porteføljen`, { ingress: p.pitch || p.undertittel || undefined });
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
      tekst(s, vektTekst(p.vekt), { x: hx + 0.16, y: y + 0.34, w: hW - 0.32, h: 0.42, fontSize: 22, color: F.hvit, valign: 'middle' });
      tekst(s, [m.belopKjent ? `${mill(p.belop)} investert` : '', p.valuta && p.valuta !== 'NOK' ? `handles i ${p.valuta}` : ''].filter(Boolean).join('  ·  '), { x: hx + 0.16, y: y + 0.78, w: hW - 0.32, h: 0.18, fontSize: 7.5, color: 'B8C4D0' });
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
  if (tillegg.length) {
    skille('Vedlegg', 'Slik jobber Pensum', tillegg.map((x) => x.navn));
    innhold.push({ nr: '', navn: 'Vedlegg: slik jobber Pensum', side: sidenr });
  }

  // ---------- pris og hva som er inkludert (tillegg) ----------
  if (sider.includes('pris') && m.kostnader?.linjer?.length) {
    const k = m.kostnader;
    const s = side(`Samlet løpende kostnad: ${pst(k.pst, 2)} per år`, { ingress: 'Ett samlet honorar dekker rådgivning, forvaltning, plattform, depot og rapportering. Kostnadene i fondene kommer i tillegg.' });
    const y = TOPP_INGRESS; const h = BUNN - y; const w = (B - 2 * M - 0.3) / 3;
    const x2 = M + w + 0.15; const x3 = M + 2 * (w + 0.15);
    kort(s, M, y, w, h); kort(s, x2, y, w, h); kort(s, x3, y, w, h, F.navy);
    // 1: samlet tall og hva det består av
    etikett(s, 'Forslaget', M + 0.2, y + 0.18, w - 0.4);
    tekst(s, pst(k.pst, 2), { x: M + 0.2, y: y + 0.4, w: w - 0.4, h: 0.55, fontFace: LETT, fontSize: 28, valign: 'middle' });
    tekst(s, m.belopKjent ? `${kr(k.kroner)} per år` : `${kr(k.kroner)} per år per 1 mill. kr`, { x: M + 0.2, y: y + 0.98, w: w - 0.4, h: 0.22, fontSize: 10 });
    tekst(s, m.aktivafordeling.map((a) => `${a.hel}${NB}% ${a.navn.toLowerCase()}`).join('  ·  '), { x: M + 0.2, y: y + 1.22, w: w - 0.4, h: 0.2, fontSize: 8, color: F.graa });
    const sh = k.suksesshonorar || [];
    [['Pensums honorar', pst(k.honorarPst, 2)], ['Kostnad i fondene', pst(k.produktkostnadPst, 2)], ['Depot og plattform', `0${NB}%`], ['Transaksjonshonorar', `${pst(k.transaksjonshonorarPst, 2)} per handel`], ['Resultatbasert honorar', sh.length ? kutt(sh.map((x) => x.navn.replace('Pensum ', '')).join(', '), 26) : 'Ingen']].forEach(([e, v], i) => {
      const yy = y + 1.55 + i * 0.42;
      strek(s, M + 0.2, yy, w - 0.4);
      tekst(s, e, { x: M + 0.2, y: yy, w: 1.5, h: 0.42, fontSize: 8.5, valign: 'middle' });
      tekst(s, v, { x: M + 1.7, y: yy, w: w - 1.9, h: 0.42, fontSize: 8.5, bold: i < 2, align: 'right', valign: 'middle', fit: 'shrink' });
    });
    // 2: honoraret faller med beløpet
    etikett(s, 'Honorar etter samlet beløp', x2 + 0.2, y + 0.18, w - 0.4);
    k.trinnListe.forEach((t, i) => {
      const yy = y + 0.5 + i * 0.5;
      if (t.gjeldende) s.addShape(pptx.ShapeType.rect, { x: x2 + 0.1, y: yy + 0.04, w: w - 0.2, h: 0.42, fill: { color: F.lys }, line: { color: F.lys, width: 0 } });
      tekst(s, t.navn, { x: x2 + 0.2, y: yy, w: w - 1.4, h: 0.5, fontSize: 9.5, bold: !!t.gjeldende, valign: 'middle' });
      tekst(s, pst(t.sats, 2), { x: x2 + w - 1.2, y: yy, w: 1.0, h: 0.5, fontFace: LETT, fontSize: 14, color: t.gjeldende ? F.kobber : F.navy, align: 'right', valign: 'middle' });
      strek(s, x2 + 0.2, yy + 0.5, w - 0.4);
    });
    tekst(s, `${m.belopKjent ? 'Trinnet for dette forslaget er uthevet. ' : ''}Honoraret gjelder mandater og eksterne fond og er ekskl. mva. Pensums egne fond har bare fondets egen kostnad.`, { x: x2 + 0.2, y: y + 2.65, w: w - 0.4, h: 0.8, fontSize: 8, color: F.moerkGraa });
    // 3: hva som er inkludert
    etikett(s, 'Inkludert i honoraret', x3 + 0.2, y + 0.18, w - 0.4);
    punktliste(s, x3 + 0.2, y + 0.48, w - 0.4, 2.3, tekster.inkludert || ['Mandat og egnethetsvurdering', 'Fondsseleksjon og løpende forvaltning', 'Rebalansering og risikokontroll', 'Portal med BankID og Pensum-app', 'Måneds-, kvartals- og årsrapportering', 'Oppfølgingsmøter og skattegrunnlag'], { farge: F.hvit, fontSize: 9.5, etter: 6 });
    tekst(s, 'Ingen returprovisjon: mottar Pensum returprovisjon fra en fondsleverandør, betales den tilbake til kunden.', { x: x3 + 0.2, y: y + h - 0.8, w: w - 0.4, h: 0.65, fontSize: 8.5, italic: true, color: 'B8C4D0', valign: 'bottom' });
  }

  // ---------- kostnader (tillegg) ----------
  if (sider.includes('kostnader') && m.kostnader?.linjer?.length) {
    const k = m.kostnader;
    // Uten beløp er honorartrinnet ukjent. Da vises laveste trinn, og det sies rett ut.
    const ingress = m.belopKjent
      ? `Tilsvarer om lag ${kr(k.kroner)} per år på ${mill(m.belop)}. Honorartrinn ${k.trinn.navn.toLowerCase()}: ${pst(k.trinn.sats, 2)}. Resultatbasert honorar og transaksjonskostnader kommer i tillegg.`
      : `Beløpet er ikke avklart. Tallene viser laveste honorartrinn (${k.trinn.navn.toLowerCase()}: ${pst(k.trinn.sats, 2)}) per 1 mill. kr; honoraret faller med høyere beløp. Resultatbasert honorar og transaksjonskostnader kommer i tillegg.`;
    const s = side(`Anslåtte løpende kostnader: ${pst(k.pst, 2)} per år`, { ingress });
    const y = TOPP_INGRESS; const kortH = 1.4; const kortY = BUNN - kortH;
    const rader = k.linjer.map((l) => [`${l.navn}${l.andelsklasse && !l.navn.endsWith(` ${l.andelsklasse}`) ? ` (klasse ${l.andelsklasse})` : ''}`, vektTekst(l.vekt), l.honorarPst ? pst(l.honorarPst, 2) : '–', l.produktkostnadPst != null ? pst(l.produktkostnadPst, 2) : (l.honorarPst === 0 ? '–' : 'ikke oppgitt'), pst(l.totalPst, 2), kr(l.kroner)]);
    tabell(s, M, y, B - 2 * M, ['Produkt', 'Vekt', 'Pensums honorar', 'Kostnad i fond', 'Sum per år', 'Kroner per år'], rader, [3.6, 0.8, 1.25, 1.25, 1.2, 1.3], { radH: Math.min(0.3, (kortY - y - 0.12) / (rader.length + 2)), sum: ['Porteføljen', '100 %', '', '', pst(k.pst, 2), kr(k.kroner)] });
    const kw = (B - 2 * M - 0.3) / 3;
    const felt = (i, tittel, linjer) => {
      const x = M + i * (kw + 0.15);
      kort(s, x, kortY, kw, kortH);
      etikett(s, tittel, x + 0.16, kortY + 0.12, kw - 0.3);
      punktliste(s, x + 0.16, kortY + 0.34, kw - 0.32, kortH - 0.42, linjer, { fontSize: 7.5, etter: 2.5 });
    };
    const sh = k.suksesshonorar || [];
    felt(0, 'Resultatbasert honorar', sh.length
      ? [...sh.slice(0, 3).map((x) => `${x.navn.replace('Pensum ', '')} (${vektTekst(x.vekt)}): ${x.tekst}.`), ...(sh.length > 3 ? [`Og ${sh.length - 3} produkter til.`] : []), 'Påløper bare ved meravkastning, og er ikke med i tallene over.']
      : ['Ingen av produktene i porteføljen har resultatbasert honorar.', 'Pensum tar ikke resultatbasert honorar på porteføljen som helhet.']);
    felt(1, 'Transaksjonskostnader', [
      `Transaksjonshonorar til Pensum: ${pst(k.transaksjonshonorarPst, 2)} av handelsbeløpet ved kjøp og salg av fond.`,
      m.belopKjent ? `Etablering: om lag ${kr(k.etablering)} som engangskostnad når porteføljen kjøpes.` : `Etablering: ${pst(k.transaksjonshonorarPst, 2)} av beløpet som engangskostnad når porteføljen kjøpes.`,
      'Fondenes egne transaksjonskostnader står i fondenes nøkkelinformasjon (KID) og er ikke med i tallene over.'
    ]);
    felt(2, 'Slik leser du tallene', [
      'Kostnad i fond er løpende kostnad i fondet, eller vektet snitt for de underliggende fondene i et mandat. Den endres når fondssammensetningen endres.',
      'Honoraret er ekskl. mva. Depot og plattform inngår.',
      `Endelig kostnadsoversikt gis før avtale inngås.${k.mangler.length ? ` Kostnad i fond er ikke oppgitt for: ${k.mangler.join(', ')}.` : ''}`
    ]);
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
    const radgivere = [m.radgiver, m.radgiver2].filter((r) => r && r.navn);
    etikett(s, radgivere.length > 1 ? 'Dine rådgivere' : 'Din rådgiver', 0.45, 3.95, 3);
    if (!radgivere.length) tekst(s, 'Pensum Asset Management', { x: 0.45, y: 4.15, w: 4, h: 0.3, fontSize: 14, color: F.hvit });
    radgivere.forEach((r, i) => {
      const x = 0.45 + i * 2.85; const bredde = radgivere.length > 1 ? 2.7 : 5;
      tekst(s, r.navn, { x, y: 4.15, w: bredde, h: 0.3, fontSize: radgivere.length > 1 ? 12 : 14, color: F.hvit, fit: 'shrink' });
      tekst(s, radgivere.length > 1 ? [r.tittel, r.telefon, r.epost].filter(Boolean).join('\n') : [r.tittel, r.telefon, r.epost].filter(Boolean).join('  ·  '), { x, y: 4.47, w: bredde, h: 0.6, fontSize: 8.5, color: 'B8C4D0', lineSpacingMultiple: 1.15 });
    });
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

  // ---------- kontakt oss ----------
  {
    const s = pptx.addSlide(); sidenr += 1;
    s.background = { color: F.navy };
    if (assets.kontakt) s.addImage({ path: assets.kontakt, x: 0, y: 0, w: B, h: H });
    if (assets.logoMork) s.addImage({ path: assets.logoMork, x: 0.45, y: 0.4, w: 0.95, h: 0.464 });
    etikett(s, 'Kontakt', 0.45, 1.3, 3);
    tekst(s, 'Kontakt oss', { x: 0.45, y: 1.5, w: 4, h: 0.5, fontFace: LETT, fontSize: 24, color: F.hvit });
    tekst(s, [...[m.radgiver, m.radgiver2].filter((r) => r && r.navn).flatMap((r) => [`${r.navn}, ${r.tittel}`, [r.telefon, r.epost].filter(Boolean).join('  ·  ')]), 'Frøyas gate 15, 0273 Oslo', '+47 23 89 68 44', 'www.pensumgroup.no'].filter(Boolean).join('\n'), { x: 0.45, y: m.radgiver2 ? 2.08 : 2.15, w: 4.3, h: 1.4, fontSize: m.radgiver2 ? 9 : 9.5, color: F.hvit, lineSpacingMultiple: m.radgiver2 ? 1.15 : 1.35, fit: 'shrink' });
    etikett(s, 'Våre kontorer', 0.45, 3.6, 3);
    [['Oslo', 'Frøyas gate 15, 0273 Oslo'], ['Fredrikstad', 'Storgaten 3, 1607 Fredrikstad'], ['Stavanger', 'Løkkeveien 107 (Smedvigkvartalet)'], ['Trondheim', 'Brøsetveien 164, 7069 Trondheim']].forEach(([by, adr], i) => {
      const x = 0.45 + (i % 2) * 2.0; const yy = 3.85 + Math.floor(i / 2) * 0.5;
      tekst(s, by, { x, y: yy, w: 1.9, h: 0.18, fontSize: 8.5, bold: true, color: F.hvit });
      tekst(s, adr, { x, y: yy + 0.18, w: 1.9, h: 0.26, fontSize: 7, color: 'B8C4D0' });
    });
  }

  // ---------- innholdssiden fylles når sidetallene er kjent ----------
  if (innholdsside && innhold.length) {
    const y = TOPP + 0.1; const rH = Math.min(0.72, (BUNN - y) / innhold.length);
    innhold.forEach((k, i) => {
      const yy = y + i * rH;
      kort(innholdsside, M, yy, B - 2 * M, rH - 0.1);
      tekst(innholdsside, k.nr, { x: M + 0.25, y: yy, w: 0.8, h: rH - 0.1, fontFace: LETT, fontSize: 20, color: F.kobber, valign: 'middle' });
      tekst(innholdsside, k.navn, { x: M + 1.1, y: yy, w: 6.5, h: rH - 0.1, fontSize: 12, valign: 'middle' });
      tekst(innholdsside, `Side ${k.side}`, { x: B - M - 1.5, y: yy, w: 1.25, h: rH - 0.1, fontSize: 9, color: F.graa, align: 'right', valign: 'middle' });
    });
  }

  return pptx;
}
