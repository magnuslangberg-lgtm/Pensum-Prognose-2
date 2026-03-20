import { normalizeColor } from '../../specs/chartTheme.js';

const SVG_W = 1200;
const SVG_H = 720;

function svgDataUri(svg) {
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function normalizeLineAreaSeries(spec) {
  return (spec?.series || [])
    .map((series) => {
      const labels = Array.isArray(series?.labels) ? series.labels : [];
      const values = Array.isArray(series?.values) ? series.values : [];
      const paired = [];
      const n = Math.min(labels.length, values.length);
      for (let i = 0; i < n; i += 1) {
        const value = Number(values[i]);
        if (!Number.isFinite(value)) continue;
        paired.push({ label: String(labels[i] ?? ''), value });
      }
      return {
        name: series?.name || 'Serie',
        labels: paired.map((point) => point.label),
        values: paired.map((point) => point.value),
        color: normalizeColor(series?.color),
      };
    })
    .filter((series) => series.labels.length > 1 && series.values.length > 1 && series.labels.length === series.values.length);
}

function buildLineOrAreaSvg(spec, { area = false } = {}) {
  const seriesList = normalizeLineAreaSeries(spec);
  if (!seriesList.length) return null;

  const labels = seriesList[0].labels;
  const allValues = seriesList.flatMap((series) => series.values);
  const minValue = Math.min(...allValues);
  const maxValue = Math.max(...allValues);
  const range = maxValue - minValue || 1;

  const theme = spec?.style?.theme;
  const colors = theme?.colors || {};
  const fontFace = theme?.fontFace || 'Arial';

  const margin = { top: 34, right: 20, bottom: 86, left: 76 };
  const chartW = SVG_W - margin.left - margin.right;
  const chartH = SVG_H - margin.top - margin.bottom;

  const xFor = (index) => margin.left + (labels.length <= 1 ? chartW / 2 : (index / (labels.length - 1)) * chartW);
  const yFor = (value) => margin.top + chartH - ((value - minValue) / range) * chartH;

  const grid = Array.from({ length: 5 }, (_, i) => {
    const ratio = i / 4;
    const y = margin.top + ratio * chartH;
    const value = maxValue - ratio * range;
    return `
      <line x1="${margin.left}" y1="${y}" x2="${SVG_W - margin.right}" y2="${y}" stroke="#${normalizeColor(colors.line, 'D1D5DB')}" stroke-width="1"/>
      <text x="${margin.left - 10}" y="${y + 5}" font-family="${esc(fontFace)}" font-size="20" text-anchor="end" fill="#${normalizeColor(colors.muted, '4A5568')}">${esc(value.toFixed(1))}</text>
    `;
  }).join('');

  const xTicks = labels.map((label, index) => {
    if (labels.length > 8 && index % Math.ceil(labels.length / 8) !== 0 && index !== labels.length - 1) return '';
    const x = xFor(index);
    return `<text x="${x}" y="${SVG_H - 28}" font-family="${esc(fontFace)}" font-size="18" text-anchor="middle" fill="#${normalizeColor(colors.muted, '4A5568')}">${esc(label)}</text>`;
  }).join('');

  const seriesSvg = seriesList.map((series) => {
    const points = series.values.map((value, index) => `${xFor(index)},${yFor(value)}`).join(' ');
    const line = `<polyline fill="none" stroke="#${series.color}" stroke-width="${area ? 4 : 5}" stroke-linecap="round" stroke-linejoin="round" points="${points}"/>`;
    if (!area) return line;

    const areaPoints = `${margin.left},${margin.top + chartH} ${points} ${margin.left + chartW},${margin.top + chartH}`;
    return `
      <polygon fill="#${series.color}" fill-opacity="0.22" points="${areaPoints}"/>
      ${line}
    `;
  }).join('');

  const legend = area ? '' : seriesList.map((series, index) => `
    <rect x="${margin.left + index * 180}" y="${SVG_H - 68}" width="24" height="24" rx="4" fill="#${series.color}"/>
    <text x="${margin.left + 34 + index * 180}" y="${SVG_H - 49}" font-family="${esc(fontFace)}" font-size="22" fill="#${normalizeColor(colors.text, '262626')}">${esc(series.name)}</text>
  `).join('');

  return svgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${SVG_W}" height="${SVG_H}" viewBox="0 0 ${SVG_W} ${SVG_H}">
      <rect width="${SVG_W}" height="${SVG_H}" fill="#${normalizeColor(colors.white, 'FFFFFF')}"/>
      ${grid}
      <line x1="${margin.left}" y1="${margin.top + chartH}" x2="${SVG_W - margin.right}" y2="${margin.top + chartH}" stroke="#${normalizeColor(colors.line, 'D1D5DB')}" stroke-width="1.5"/>
      ${seriesSvg}
      ${xTicks}
      ${legend}
    </svg>
  `);
}

function buildBarSvg(spec) {
  const categories = Array.isArray(spec?.categories) ? spec.categories.map((value) => String(value ?? '')) : [];
  const values = Array.isArray(spec?.values) ? spec.values.map(Number).filter(Number.isFinite) : [];
  if (!categories.length || categories.length !== values.length) return null;

  const theme = spec?.style?.theme;
  const colors = theme?.colors || {};
  const fontFace = theme?.fontFace || 'Arial';
  const margin = { top: 24, right: 36, bottom: 24, left: 240 };
  const chartW = SVG_W - margin.left - margin.right;
  const rowH = (SVG_H - margin.top - margin.bottom) / categories.length;
  const maxValue = Math.max(...values, 1);
  const fill = normalizeColor(spec?.color, normalizeColor(colors.accent, '6B9DB8'));

  const rows = categories.map((category, index) => {
    const y = margin.top + index * rowH;
    const barY = y + rowH * 0.23;
    const barH = rowH * 0.54;
    const width = Math.max(6, (values[index] / maxValue) * chartW);
    return `
      <text x="${margin.left - 16}" y="${y + rowH * 0.56}" font-family="${esc(fontFace)}" font-size="22" text-anchor="end" fill="#${normalizeColor(colors.text, '262626')}">${esc(category)}</text>
      <rect x="${margin.left}" y="${barY}" width="${chartW}" height="${barH}" rx="10" fill="#${normalizeColor(colors.line, 'D1D5DB')}" fill-opacity="0.35"/>
      <rect x="${margin.left}" y="${barY}" width="${width}" height="${barH}" rx="10" fill="#${fill}"/>
      <text x="${margin.left + chartW + 12}" y="${y + rowH * 0.56}" font-family="${esc(fontFace)}" font-size="22" fill="#${normalizeColor(colors.navy, '0D2841')}">${esc(values[index].toFixed(1))}%</text>
    `;
  }).join('');

  return svgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${SVG_W}" height="${SVG_H}" viewBox="0 0 ${SVG_W} ${SVG_H}">
      <rect width="${SVG_W}" height="${SVG_H}" fill="#${normalizeColor(colors.white, 'FFFFFF')}"/>
      ${rows}
    </svg>
  `);
}

export function renderPptChartFromSpec(pptx, slide, spec, { x, y, w, h }) {
  if (!spec) return false;

  let dataUri = null;
  if (spec.type === 'line') dataUri = buildLineOrAreaSvg(spec, { area: false });
  if (spec.type === 'area') dataUri = buildLineOrAreaSvg(spec, { area: true });
  if (spec.type === 'bar') dataUri = buildBarSvg(spec);
  if (!dataUri) return false;

  slide.addImage({ data: dataUri, x, y, w, h });
  return true;
}
