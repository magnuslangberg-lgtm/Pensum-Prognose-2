import { CHART_THEME, normalizeColor } from './chartTheme.js';

function sanitizeSeries(series = []) {
  return series
    .map((s) => ({
      name: s.name || 'Serie',
      labels: Array.isArray(s.labels) ? s.labels : [],
      values: Array.isArray(s.values) ? s.values.filter(Number.isFinite) : [],
      color: normalizeColor(s.color),
    }))
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
    categories: Array.isArray(categories) ? categories : [],
    values: Array.isArray(values) ? values.filter(Number.isFinite) : [],
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
    categories: Array.isArray(categories) ? categories : [],
    values: Array.isArray(values) ? values.filter(Number.isFinite) : [],
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
    categories: Array.isArray(categories) ? categories : [],
    values: Array.isArray(values) ? values.filter(Number.isFinite) : [],
    color: normalizeColor(color, CHART_THEME.colors.salmon),
    style: { theme: CHART_THEME, yNumFmt: '#,##0.0' },
  };
}
