import { chartsIIEligibleBin } from './chartsIITemporalAggregation.js';
/* Charts II B3.5: record-level numerical relationships. No aggregation or data mutation. */
function numeric(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  if (!text) return null;
  const cleaned = text.replace(/[,$£€]/g, '').replace(/%$/, '').trim();
  if (!/^[-+]?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?$/i.test(cleaned)) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}
const absent = value => value === null || value === undefined || String(value).trim() === '';

export function deriveChartsIIScatter(rows = [], { xField, yField, sizeField = '' } = {}) {
  const records = Array.isArray(rows) ? rows : [];
  const excluded = { missingX: 0, invalidX: 0, insufficientDatePrecision: 0, missingY: 0, invalidY: 0, missingSize: 0, invalidSize: 0, negativeSize: 0 };
  const points = [];
  const exactCoordinates = new Map();
  for (let index = 0; index < records.length; index += 1) {
    const row = records[index] || {};
    // One exclusion reason per record, with axis priority. Do not double-count.
    let x;
    if (xField === '__canonicalDate__') {
      const dateResult = chartsIIEligibleBin(row, 'day');
      if (dateResult.excluded) {
        if (dateResult.excluded === 'insufficientPrecision') excluded.insufficientDatePrecision++;
        else if (dateResult.excluded === 'missingDate') excluded.missingX++;
        else excluded.invalidX++;
        continue;
      }
      x = dateResult.bin.start;
    } else {
      const xRaw = row[xField];
      if (absent(xRaw)) { excluded.missingX++; continue; }
      x = numeric(xRaw);
      if (x === null) { excluded.invalidX++; continue; }
    }
    const yRaw = row[yField];
    if (absent(yRaw)) { excluded.missingY++; continue; }
    const y = numeric(yRaw);
    if (y === null) { excluded.invalidY++; continue; }
    let size = null;
    if (sizeField) {
      const raw = row[sizeField];
      if (absent(raw)) { excluded.missingSize++; continue; }
      size = numeric(raw);
      if (size === null) { excluded.invalidSize++; continue; }
      if (size < 0) { excluded.negativeSize++; continue; }
    }
    const coordinateKey = JSON.stringify([x, y]);
    const overlapIndex = exactCoordinates.get(coordinateKey) || 0;
    exactCoordinates.set(coordinateKey, overlapIndex + 1);
    points.push({ index, x, y, size, overlapIndex, coordinateKey });
  }
  const overlappingCoordinates = [...exactCoordinates.values()].filter(count => count > 1).length;
  const overlappingRecords = [...exactCoordinates.values()].reduce((count, value) => count + Math.max(0, value - 1), 0);
  return { points, reporting: { scope: records.length, plotted: points.length, excluded,
    overlappingCoordinates, overlappingRecords, xField, yField, sizeField,
    note: 'Each point represents one record. Small display-only offsets distinguish identical coordinates; tooltips show original values.' } };
}
