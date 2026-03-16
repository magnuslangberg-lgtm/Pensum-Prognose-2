import { normalizeColor } from '../../specs/chartTheme.js';

export function renderPptChartFromSpec(pptx, slide, spec, { x, y, w, h }) {
  if (!spec) return false;

  if (spec.type === 'line' || spec.type === 'area') {
    const chartType = spec.type === 'line' ? pptx.ChartType.line : pptx.ChartType.area;
    const data = (spec.series || []).map((s) => ({ name: s.name, labels: s.labels, values: s.values }));
    if (data.length === 0) return false;

    slide.addChart(chartType, data, {
      x, y, w, h,
      showLegend: true,
      legendPos: 'b',
      legendFontSize: 8,
      legendFontFace: spec?.style?.theme?.fontFace || 'Merriweather Sans',
      legendColor: normalizeColor(spec?.style?.theme?.colors?.muted, '4A5568'),
      showTitle: false,
      lineDataSymbol: 'none',
      lineSmooth: false,
      lineSize: spec.type === 'line' ? 2.5 : 1.8,
      chartColors: (spec.series || []).map((s) => normalizeColor(s.color)),
      catAxisLabelFontFace: spec?.style?.theme?.fontFace || 'Merriweather Sans',
      catAxisLabelFontSize: 7,
      catAxisLabelColor: normalizeColor(spec?.style?.theme?.colors?.muted, '4A5568'),
      catAxisLineShow: true,
      catAxisLineColor: normalizeColor(spec?.style?.theme?.colors?.line, 'D1D5DB'),
      valAxisLabelFontFace: spec?.style?.theme?.fontFace || 'Merriweather Sans',
      valAxisLabelFontSize: 7,
      valAxisLabelColor: normalizeColor(spec?.style?.theme?.colors?.muted, '4A5568'),
      valAxisNumFmt: spec?.style?.yNumFmt || '#,##0.0',
      valAxisLineShow: false,
      valAxisMajorGridColor: normalizeColor(spec?.style?.theme?.colors?.line, 'D1D5DB'),
      valAxisMajorGridShow: true,
      plotArea: { fill: { color: normalizeColor(spec?.style?.theme?.colors?.white, 'FFFFFF') } },
    });
    return true;
  }

  if (spec.type === 'bar' && Array.isArray(spec.categories) && Array.isArray(spec.values) && spec.categories.length === spec.values.length) {
    slide.addChart(pptx.ChartType.bar, [{
      name: spec.title || 'Serie',
      labels: spec.categories,
      values: spec.values,
    }], {
      x, y, w, h,
      barDir: 'bar',
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
