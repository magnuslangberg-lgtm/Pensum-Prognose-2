export const CHART_THEME = {
  fontFace: 'Merriweather Sans',
  colors: {
    navy: '0D2841',
    accent: '6B9DB8',
    salmon: 'C4967E',
    teal: '2D6A6A',
    muted: '4A5568',
    line: 'D1D5DB',
    white: 'FFFFFF',
  },
};

export function normalizeColor(color, fallback = CHART_THEME.colors.navy) {
  if (typeof color !== 'string' || !color) return fallback;
  return color.replace('#', '');
}
