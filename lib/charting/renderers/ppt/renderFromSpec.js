import { normalizeColor } from '../../specs/chartTheme.js';

function normalizeLineAreaSeries(spec) {
  return (spec?.series || [])
    .map((s) => ({
      name: s?.name || 'Serie',
      labels: Array.isArray(s?.labels) ? s.labels.map((v) => String(v ?? '')) : [],
      values: Array.isArray(s?.values) ? s.values.map(Number).filter(Number.isFinite) : [],
      color: normalizeColor(s?.color),
    }))
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
      legendFontSize: 8,
      legendFontFace: spec?.style?.theme?.fontFace || 'Merriweather Sans',
      showTitle: false,
      lineDataSymbol: 'none',
      lineSmooth: false,
      lineSize: 2.2,
      chartColors: normalizeLineAreaSeries(spec).map((s) => s.color),
      catAxisLabelFontFace: spec?.style?.theme?.fontFace || 'Merriweather Sans',
      catAxisLabelFontSize: 7,
      catAxisLineShow: true,
      catAxisLineColor: normalizeColor(spec?.style?.theme?.colors?.line, 'D1D5DB'),
      valAxisLabelFontFace: spec?.style?.theme?.fontFace || 'Merriweather Sans',
      valAxisLabelFontSize: 7,
      valAxisNumFmt: spec?.style?.yNumFmt || '#,##0.0',
      valAxisLineShow: false,
      valAxisMajorGridColor: normalizeColor(spec?.style?.theme?.colors?.line, 'D1D5DB'),
      valAxisMajorGridShow: true,
      plotArea: { fill: { color: normalizeColor(spec?.style?.theme?.colors?.white, 'FFFFFF') } },
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
      lineSize: 1.5,
      chartColors: normalizeLineAreaSeries(spec).map((s) => s.color),
      catAxisLabelFontFace: spec?.style?.theme?.fontFace || 'Merriweather Sans',
      catAxisLabelFontSize: 7,
      catAxisLineShow: true,
      catAxisLineColor: normalizeColor(spec?.style?.theme?.colors?.line, 'D1D5DB'),
      valAxisLabelFontFace: spec?.style?.theme?.fontFace || 'Merriweather Sans',
      valAxisLabelFontSize: 7,
      valAxisNumFmt: spec?.style?.yNumFmt || '#,##0.0',
      valAxisLineShow: false,
      valAxisMajorGridColor: normalizeColor(spec?.style?.theme?.colors?.line, 'D1D5DB'),
      valAxisMajorGridShow: true,
      plotArea: { fill: { color: normalizeColor(spec?.style?.theme?.colors?.white, 'FFFFFF') } },
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
      catAxisLabelFontFace: spec?.style?.theme?.fontFace || 'Merriweather Sans',
      catAxisLabelFontSize: 7,
      valAxisNumFmt: spec?.style?.yNumFmt || '#,##0.0',
      valAxisLabelFontFace: spec?.style?.theme?.fontFace || 'Merriweather Sans',
      valAxisLabelFontSize: 7,
    });
    return true;
  }

  return false;
}
