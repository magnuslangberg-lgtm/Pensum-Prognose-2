import { normalizeColor } from '../../specs/chartTheme.js';

function normalizeLineAreaSeries(spec) {
  return (spec?.series || [])
    .map((s) => {
      const labels = Array.isArray(s?.labels) ? s.labels : [];
      const values = Array.isArray(s?.values) ? s.values : [];
      const n = Math.min(labels.length, values.length);
      const paired = [];
      for (let i = 0; i < n; i += 1) {
        const value = Number(values[i]);
        if (!Number.isFinite(value)) continue;
        paired.push({ label: String(labels[i] ?? ''), value });
      }
      return {
        name: s?.name || 'Serie',
        labels: paired.map((p) => p.label),
        values: paired.map((p) => p.value),
        color: normalizeColor(s?.color),
      };
    })
    .filter((s) => s.labels.length > 2 && s.values.length > 2 && s.labels.length === s.values.length);
}

export function renderPptChartFromSpec(pptx, slide, spec, { x, y, w, h }) {
  if (!spec) return false;

  if (spec.type === 'line') {
    const data = normalizeLineAreaSeries(spec).map((s) => ({ name: s.name, labels: s.labels, values: s.values }));
    if (data.length === 0) return false;

    slide.addChart(pptx.ChartType.line, data, {
      x, y, w, h,
      showLegend: true,
      legendPos: 'b',
      showTitle: false,
      lineDataSymbol: 'none',
      lineSmooth: false,
      chartColors: normalizeLineAreaSeries(spec).map((s) => s.color),
      valAxisNumFmt: spec?.style?.yNumFmt || '#,##0.0',
    });
    return true;
  }

  if (spec.type === 'area') {
    const data = normalizeLineAreaSeries(spec).map((s) => ({ name: s.name, labels: s.labels, values: s.values }));
    if (data.length === 0) return false;

    slide.addChart(pptx.ChartType.area, data, {
      x, y, w, h,
      showLegend: false,
      showTitle: false,
      lineDataSymbol: 'none',
      lineSmooth: false,
      chartColors: normalizeLineAreaSeries(spec).map((s) => s.color),
      valAxisNumFmt: spec?.style?.yNumFmt || '#,##0.0',
    });
    return true;
  }

  if (spec.type === 'bar' && Array.isArray(spec.categories) && Array.isArray(spec.values) && spec.categories.length === spec.values.length && spec.categories.length > 0) {
    slide.addChart(pptx.ChartType.bar, [{
      name: spec.title || 'Serie',
      labels: spec.categories.map((v) => String(v ?? '')),
      values: spec.values.map(Number),
    }], {
      x, y, w, h,
      showLegend: false,
      showTitle: false,
      chartColors: [normalizeColor(spec.color)],
      valAxisNumFmt: spec?.style?.yNumFmt || '#,##0.0',
    });
    return true;
  }

  return false;
}
