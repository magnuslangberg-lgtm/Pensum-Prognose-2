import React from 'react';

// Viser lysbildene fra lib/forslagOpptak.js på skjerm. Mål i tommer (lysbildet er 10 x 5,625)
// regnes om til cqw, slik at alt skalerer med bredden på forhåndsvisningen.
const B = 10; const H = 5.625;
const tomme = (v) => `${(v || 0) * 10}cqw`;
const punkt = (v) => `${(v || 0) * (10 / 72)}cqw`;
const farge = (c) => (c ? `#${c}` : undefined);
// Skriften settes med klasser (se pages/_document.js), fordi appens globale skriftregel ellers vinner.
const skriftklasse = (f) => (f === 'Georgia' ? 'forslag-serif' : f === 'Open Sans Light' ? 'forslag-lett' : 'forslag-sans');

function Tekst({ el }) {
  const { tekst, o } = el;
  const deler = Array.isArray(tekst) ? tekst : [{ text: String(tekst ?? ''), options: {} }];
  const punktliste = deler.some((d) => d.options?.bullet);
  const stil = {
    position: 'absolute', left: tomme(o.x), top: tomme(o.y), width: tomme(o.w), height: tomme(o.h),
    display: 'flex', flexDirection: 'column',
    justifyContent: o.valign === 'middle' ? 'center' : o.valign === 'bottom' ? 'flex-end' : 'flex-start',
    fontSize: punkt(o.fontSize || 9), color: farge(o.color),
    fontWeight: o.bold ? 700 : (o.fontFace === 'Open Sans Light' ? 300 : 400), fontStyle: o.italic ? 'italic' : 'normal', textAlign: o.align || 'left',
    letterSpacing: o.charSpacing ? punkt(o.charSpacing) : undefined, lineHeight: 1.2 * (o.lineSpacingMultiple || 1),
    whiteSpace: 'pre-line', overflow: 'visible'
  };
  const run = (d, i) => (
    <span key={i} style={{ fontWeight: d.options?.bold ? 700 : undefined, color: farge(d.options?.color) }}>{d.text}</span>
  );
  return (
    <div style={stil} className={skriftklasse(o.fontFace)}>
      {punktliste ? deler.map((d, i) => (
        <div key={i} style={{ display: 'flex', marginBottom: punkt(d.options?.paraSpaceAfter || 0) }}>
          <span style={{ flex: 'none', width: punkt(11) }}>•</span>
          <span>{d.text}</span>
        </div>
      )) : <div>{deler.map(run)}</div>}
    </div>
  );
}

function Form({ el }) {
  const { form, o } = el;
  const strek = o.line?.width ? `${punkt(o.line.width)} solid ${farge(o.line.color)}` : undefined;
  if (form === 'line') return <div style={{ position: 'absolute', left: tomme(o.x), top: tomme(o.y), width: tomme(o.w), borderTop: `${punkt(o.line?.width || 0.5)} solid ${farge(o.line?.color)}` }} />;
  return <div style={{ position: 'absolute', left: tomme(o.x), top: tomme(o.y), width: tomme(o.w), height: tomme(o.h), background: farge(o.fill?.color), border: strek, borderRadius: form === 'ellipse' ? '50%' : 0, boxSizing: 'border-box' }} />;
}

function Bilde({ el }) {
  const { o } = el;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={o.path} alt="" style={{ position: 'absolute', left: tomme(o.x), top: tomme(o.y), width: tomme(o.w), height: tomme(o.h), objectFit: o.sizing?.type === 'cover' ? 'cover' : 'fill' }} />;
}

function Tabell({ el }) {
  const { rader, o } = el;
  return (
    <div className="forslag-sans" style={{ position: 'absolute', left: tomme(o.x), top: tomme(o.y), width: tomme(o.w), background: farge(o.fill?.color) }}>
      {rader.map((rad, r) => (
        <div key={r} style={{ display: 'flex', height: tomme(o.rowH) }}>
          {rad.map((c, i) => {
            const co = c.options || {};
            return (
              <div key={i} style={{
                width: tomme(o.colW[i]), flex: 'none', display: 'flex', alignItems: 'center', boxSizing: 'border-box',
                justifyContent: co.align === 'right' ? 'flex-end' : 'flex-start', padding: `0 ${tomme(0.07)}`,
                fontSize: punkt(co.fontSize || 8), fontWeight: co.bold ? 700 : 400,
                color: farge(co.color), background: farge(co.fill?.color), borderBottom: `${punkt(0.5)} solid #D5D9DE`,
                whiteSpace: 'nowrap', overflow: 'hidden'
              }}>{c.text}</div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function Smultring({ el }) {
  const { data, o } = el;
  const verdier = data[0]?.values || [];
  const sum = verdier.reduce((s, v) => s + v, 0) || 1;
  const r = 42; const indre = r * (o.holeSize || 60) / 100;
  let vinkel = -Math.PI / 2;
  const pkt = (rad, a) => `${50 + rad * Math.cos(a)} ${50 + rad * Math.sin(a)}`;
  return (
    <svg viewBox="0 0 100 100" style={{ position: 'absolute', left: tomme(o.x), top: tomme(o.y), width: tomme(o.w), height: tomme(o.h) }}>
      {verdier.map((v, i) => {
        const a0 = vinkel; const a1 = vinkel + (v / sum) * Math.PI * 2 * 0.99999; vinkel += (v / sum) * Math.PI * 2;
        const stor = a1 - a0 > Math.PI ? 1 : 0;
        return <path key={i} d={`M ${pkt(r, a0)} A ${r} ${r} 0 ${stor} 1 ${pkt(r, a1)} L ${pkt(indre, a1)} A ${indre} ${indre} 0 ${stor} 0 ${pkt(indre, a0)} Z`} fill={farge(o.chartColors[i % o.chartColors.length])} stroke="#fff" strokeWidth="0.8" />;
      })}
    </svg>
  );
}

const pentSteg = (spenn) => {
  const raa = spenn / 6; const p = Math.pow(10, Math.floor(Math.log10(raa || 1))); const f = raa / p;
  return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * p;
};

function Soylegraf({ el }) {
  const { data, o } = el;
  const S = 100; const W = o.w * S; const Ht = o.h * S; const pt = (v) => v * S / 72;
  const fs = pt(o.catAxisLabelFontSize || 7.5); const venstre = 52; const topp = 12; const hoyreMarg = 14; const bunn = 62;
  const etiketter = data[0]?.labels || [];
  const summer = etiketter.map((_, i) => data.reduce((s, d) => s + (d.values[i] || 0), 0));
  const steg = pentSteg(Math.max(...summer, 1)); const maks = Math.ceil(Math.max(...summer, 1) / steg) * steg;
  const bredde = (W - venstre - hoyreMarg) / Math.max(etiketter.length, 1); const soyle = bredde / (1 + (o.barGapWidthPct || 50) / 100);
  const y = (v) => topp + (Ht - topp - bunn) * (1 - v / maks);
  const ticks = []; for (let v = 0; v <= maks + steg / 1000; v += steg) ticks.push(Number(v.toFixed(6)));
  const enhet = (o.valAxisLabelFormatCode || '').includes('mill') ? ' mill.' : '';
  return (
    <svg viewBox={`0 0 ${W} ${Ht}`} className="forslag-sans" style={{ position: 'absolute', left: tomme(o.x), top: tomme(o.y), width: tomme(o.w), height: tomme(o.h) }}>
      {ticks.map((v) => (
        <g key={v}>
          <line x1={venstre} x2={W - hoyreMarg} y1={y(v)} y2={y(v)} stroke="#E3E7EB" strokeWidth="0.7" />
          <text x={venstre - 6} y={y(v) + fs * 0.35} textAnchor="end" fontSize={fs} fill="#6B7A89">{String(v).replace('.', ',')}{enhet}</text>
        </g>
      ))}
      {etiketter.map((e, i) => {
        let bunnV = 0; const x = venstre + i * bredde + (bredde - soyle) / 2;
        return (
          <g key={i}>
            {data.map((d, si) => { const v = d.values[i] || 0; const r = <rect key={si} x={x} y={y(bunnV + v)} width={soyle} height={Math.max(0, y(bunnV) - y(bunnV + v))} fill={farge(o.chartColors[si % o.chartColors.length])} />; bunnV += v; return r; })}
            <text x={x + soyle / 2} y={Ht - bunn + fs * 1.6} textAnchor="middle" fontSize={fs} fill="#6B7A89">{e}</text>
          </g>
        );
      })}
      {data.map((d, si) => {
        const lf = pt(o.legendFontSize || 8); const lx = venstre + si * ((W - venstre - hoyreMarg) / data.length) + 10; const ly = Ht - 14;
        return <g key={`l${si}`}><rect x={lx} y={ly - lf * 0.4} width={lf * 0.8} height={lf * 0.8} fill={farge(o.chartColors[si % o.chartColors.length])} /><text x={lx + lf * 1.3} y={ly + lf * 0.35} fontSize={lf} fill="#4D5F72">{d.name}</text></g>;
      })}
    </svg>
  );
}

function Linjegraf({ el }) {
  const { data, o } = el;
  const S = 100; const W = o.w * S; const Ht = o.h * S; // 100 enheter per tomme
  const pt = (v) => v * S / 72;
  const hoyre = o.legendPos === 'r'; const fs = pt(o.catAxisLabelFontSize || 7.5);
  const venstre = 52; const topp = 12; const hoyreMarg = hoyre ? 130 : 14; const bunn = hoyre ? 26 : 62;
  const etiketter = data[0]?.labels || [];
  const alle = data.flatMap((s) => s.values).filter((v) => v != null && Number.isFinite(v));
  const steg = pentSteg((Math.max(...alle, 0) - Math.min(...alle, 0)) || 1);
  const min = Math.floor(Math.min(...alle, 0) / steg) * steg; const maks = Math.ceil(Math.max(...alle, 0) / steg) * steg || steg;
  const x = (i) => venstre + (W - venstre - hoyreMarg) * (etiketter.length > 1 ? i / (etiketter.length - 1) : 0.5);
  const y = (v) => topp + (Ht - topp - bunn) * (1 - (v - min) / (maks - min));
  const enhet = (o.valAxisLabelFormatCode || '').includes('mill') ? ' mill.' : (o.valAxisLabelFormatCode || '').includes('%') ? ' %' : '';
  const ticks = []; for (let v = min; v <= maks + steg / 1000; v += steg) ticks.push(Number(v.toFixed(6)));
  const frekvens = o.catAxisLabelFrequency || 1;
  return (
    <svg viewBox={`0 0 ${W} ${Ht}`} className="forslag-sans" style={{ position: 'absolute', left: tomme(o.x), top: tomme(o.y), width: tomme(o.w), height: tomme(o.h) }}>
      {ticks.map((v) => (
        <g key={v}>
          <line x1={venstre} x2={W - hoyreMarg} y1={y(v)} y2={y(v)} stroke="#E3E7EB" strokeWidth="0.7" />
          <text x={venstre - 6} y={y(v) + fs * 0.35} textAnchor="end" fontSize={fs} fill="#6B7A89">{String(v).replace('.', ',').replace('-', '−')}{enhet}</text>
        </g>
      ))}
      {etiketter.map((e, i) => (i % frekvens === 0 ? <text key={i} x={x(i)} y={Ht - bunn + fs * 1.6} textAnchor="middle" fontSize={fs} fill="#6B7A89">{e}</text> : null))}
      {data.map((s, si) => {
        const d = s.values.map((v, i) => (v == null ? null : `${x(i)},${y(v)}`)).filter(Boolean).join(' ');
        return <polyline key={si} points={d} fill="none" stroke={farge(o.chartColors[si % o.chartColors.length])} strokeWidth={pt(o.lineSize || 1.75)} strokeLinejoin="round" />;
      })}
      {data.map((s, si) => {
        const lf = pt(o.legendFontSize || 8);
        const lx = hoyre ? W - hoyreMarg + 14 : venstre + si * ((W - venstre - hoyreMarg) / data.length) + 10;
        const ly = hoyre ? Ht / 2 - (data.length - 1) * lf * 0.9 + si * lf * 1.8 : Ht - 14;
        return (
          <g key={`l${si}`}>
            <line x1={lx} x2={lx + 22} y1={ly} y2={ly} stroke={farge(o.chartColors[si % o.chartColors.length])} strokeWidth={pt(2)} />
            <text x={lx + 28} y={ly + lf * 0.35} fontSize={lf} fill="#4D5F72">{s.name}</text>
          </g>
        );
      })}
    </svg>
  );
}

export function ForslagLysbilde({ slide, nr }) {
  return (
    <div data-forslag-lysbilde={nr} style={{ containerType: 'inline-size', width: '100%' }}>
      <div style={{ position: 'relative', width: '100cqw', height: `${(H / B) * 100}cqw`, background: farge(slide.background?.color) || '#fff', overflow: 'hidden' }}>
        {slide.elementer.map((el, i) => {
          if (el.type === 'tekst') return <Tekst key={i} el={el} />;
          if (el.type === 'form') return <Form key={i} el={el} />;
          if (el.type === 'bilde') return <Bilde key={i} el={el} />;
          if (el.type === 'tabell') return <Tabell key={i} el={el} />;
          if (el.type === 'graf') return el.graf === 'doughnut' ? <Smultring key={i} el={el} /> : el.graf === 'bar' ? <Soylegraf key={i} el={el} /> : <Linjegraf key={i} el={el} />;
          return null;
        })}
      </div>
    </div>
  );
}

export default function ForslagForhandsvisning({ slides = [] }) {
  return (
    <div className="space-y-5">
      {slides.map((slide, i) => (
        <div key={i} className="shadow-lg rounded-sm overflow-hidden border border-gray-200">
          <ForslagLysbilde slide={slide} nr={i + 1} />
        </div>
      ))}
    </div>
  );
}
