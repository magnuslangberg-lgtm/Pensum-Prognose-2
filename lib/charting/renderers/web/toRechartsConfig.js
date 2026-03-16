export function toRechartsConfig(spec) {
  if (!spec) return null;

  if (spec.type === 'line' || spec.type === 'area') {
    const labels = spec.series?.[0]?.labels || [];
    const data = labels.map((label, idx) => {
      const row = { label };
      (spec.series || []).forEach((s) => {
        row[s.name] = s.values[idx];
      });
      return row;
    });

    return {
      type: spec.type,
      data,
      series: (spec.series || []).map((s) => ({ key: s.name, color: s.color })),
    };
  }

  if (spec.type === 'bar') {
    const data = (spec.categories || []).map((name, idx) => ({ name, value: spec.values?.[idx] }));
    return { type: 'bar', data, color: spec.color };
  }

  return null;
}
