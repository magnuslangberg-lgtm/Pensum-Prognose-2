// Tar opp det presentasjonsgeneratoren (lib/forslagPptx.js) tegner, i stedet for å skrive
// en PowerPoint-fil. Brukes til forhåndsvisningen i appen, slik at skjermen og den
// nedlastede filen kommer fra nøyaktig samme kode.
export class ForslagOpptak {
  constructor() {
    this.slides = [];
    this.ShapeType = { rect: 'rect', line: 'line', ellipse: 'ellipse' };
    this.ChartType = { doughnut: 'doughnut', line: 'line' };
  }

  addSlide() {
    const slide = {
      background: null,
      elementer: [],
      addText(tekst, o = {}) { this.elementer.push({ type: 'tekst', tekst, o }); return this; },
      addShape(form, o = {}) { this.elementer.push({ type: 'form', form, o }); return this; },
      addImage(o = {}) { this.elementer.push({ type: 'bilde', o }); return this; },
      addChart(graf, data, o = {}) { this.elementer.push({ type: 'graf', graf, data, o }); return this; },
      addTable(rader, o = {}) { this.elementer.push({ type: 'tabell', rader, o }); return this; }
    };
    this.slides.push(slide);
    return slide;
  }
}
