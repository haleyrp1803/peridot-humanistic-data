/* B4.1 — presentation-only 100% Stacked Bar normalization. No source mutation. */
export function normalizeChartsIIStackedBars(data = []) {
  let invalid = false;
  const rows = data.map(row => {
    const values = (row?.segments || []).map(segment => Number(segment?.count));
    if (values.some(value => !Number.isFinite(value) || value < 0)) invalid = true;
    const total = values.reduce((sum, value) => sum + (Number.isFinite(value) ? value : 0), 0);
    // Percentages derive from displayed constituent segments, rather than a
    // potentially stale row.total, so they form a coherent 100% composition.
    return { label: row?.label, total, segments: (row?.segments || []).map((segment, index) => ({
      label: segment.label, value: values[index], percent: total > 0 ? (values[index] / total) * 100 : 0,
    })) };
  });
  return { invalid, rows };
}
