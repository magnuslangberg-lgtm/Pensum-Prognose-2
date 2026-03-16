import { CHART_THEME, normalizeColor } from './chartTheme.js';


function sanitizeCategoryValues(categories = [], values = []) {
  const n = Math.min(Array.isArray(categories) ? categories.length : 0, Array.isArray(values) ? values.length : 0);
  const paired = [];
  for (let i = 0; i < n; i += 1) {
    const value = Number(values[i]);
    if (!Number.isFinite(value)) continue;
    paired.push({ category: String(categories[i] ?? ''), value });
  }
  return {
    categories: paired.map((p) => p.category),
    values: paired.map((p) => p.value),
  };
}

function sanitizeSeries(series = []) {
  return series
    .map((s) => {
      const labels = Array.isArray(s.labels) ? s.labels : [];
      const values = Array.isArray(s.values) ? s.values : [];
      const n = Math.min(labels.length, values.length);
      const paired = [];
      for (let i = 0; i < n; i += 1) {
        const value = Number(values[i]);
        if (!Number.isFinite(value)) continue;
        paired.push({ label: String(labels[i] ?? ''), value });
      }
      return {
        name: s.name || 'Serie',
        labels: paired.map((p) => p.label),
        values: paired.map((p) => p.value),
        color: normalizeColor(s.color),
      };
    })
    .filter((s) => s.labels.length > 2 && s.values.length > 2 && s.labels.length === s.values.length);
}

export function createHistorikkVsReferanserSpec({ title, subtitle, series }) {
  return {
    id: 'historikk-vs-referanser',
    type: 'line',
    title,
    subtitle,
    series: sanitizeSeries(series),
    style: { theme: CHART_THEME, yNumFmt: '#,##0.0' },
  };
}

export function createMaxDrawdownSpec({ title, subtitle, series }) {
  return {
    id: 'max-drawdown',
    type: 'area',
    title,
    subtitle,
    series: sanitizeSeries(series),
    style: { theme: CHART_THEME, yNumFmt: '#,##0.0' },
  };
}

export function createAnnualHistoricalReturnsSpec({ title, subtitle, categories, values, color }) {
  return {
    id: 'arlig-historisk-avkastning',
    type: 'bar',
    title,
    subtitle,
    ...sanitizeCategoryValues(categories, values),
    color: normalizeColor(color, CHART_THEME.colors.accent),
    style: { theme: CHART_THEME, yNumFmt: '#,##0.0' },
  };
}

export function createRegionExposureSpec({ title, subtitle, categories, values, color }) {
  return {
    id: 'region-eksponering',
    type: 'bar',
    title,
    subtitle,
    ...sanitizeCategoryValues(categories, values),
    color: normalizeColor(color, CHART_THEME.colors.accent),
    style: { theme: CHART_THEME, yNumFmt: '#,##0.0' },
  };
}

export function createSectorExposureSpec({ title, subtitle, categories, values, color }) {
  return {
    id: 'sektor-eksponering',
    type: 'bar',
    title,
    subtitle,
    ...sanitizeCategoryValues(categories, values),
    color: normalizeColor(color, CHART_THEME.colors.salmon),
    style: { theme: CHART_THEME, yNumFmt: '#,##0.0' },
  };
}
