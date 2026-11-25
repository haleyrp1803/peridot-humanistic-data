/* Charts II Inspector display formatting. Do not turn absent observations into zero. */
export function formatPeridotChartInspectorNumber(value) {
  if (value === null || value === undefined || value === '' || (typeof value === 'string' && value.trim() === '')) return 'Not observed';
  const numerical = Number(value);
  return Number.isFinite(numerical) ? numerical.toLocaleString() : String(value);
}

export function formatPeridotChartInspectorValue(value, unit = '') {
  const valueLabel = formatPeridotChartInspectorNumber(value);
  if (valueLabel === 'Not observed') return valueLabel;
  if (unit === 'records' && Number(value) === 1) return `${valueLabel} record`;
  return `${valueLabel}${unit ? ` ${unit}` : ''}`;
}
