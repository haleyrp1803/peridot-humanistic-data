import { ANALYTICS_BAR_FIELD_DEFINITIONS } from './analyticsConfig';

function normalizeText(value) {
  const text = String(value ?? '').trim();
  if (!text || text === '-' || text === '0') return '';
  return text;
}

function getYearFromRow(row) {
  const parsedYear = row?.parsedDate?.year;
  if (Number.isFinite(parsedYear) && parsedYear > 0) return String(parsedYear);

  const dateText = String(row?.date ?? '').trim();
  const match = dateText.match(/^(\d{4})/);
  if (!match || match[1] === '0000') return '';
  return match[1];
}

function valueForBarField(row, fieldKey) {
  if (fieldKey === 'route') {
    const source = normalizeText(row.sourceLoc);
    const target = normalizeText(row.targetLoc);
    if (!source || !target) return '';
    return `${source} → ${target}`;
  }

  return normalizeText(row[fieldKey]);
}

function hasRequiredBarField(rows, definition) {
  return rows.some((row) => {
    if (definition.key === 'route') {
      return Boolean(normalizeText(row.sourceLoc) && normalizeText(row.targetLoc));
    }

    return definition.requiredFields.some((field) => Boolean(normalizeText(row[field])));
  });
}

export function getAvailableAnalyticsFields(rows = []) {
  const barGroupOptions = ANALYTICS_BAR_FIELD_DEFINITIONS.filter((definition) =>
    hasRequiredBarField(rows, definition)
  );

  return {
    barGroupOptions,
    hasYearData: rows.some((row) => Boolean(getYearFromRow(row))),
  };
}

export function buildBarChartData(rows = [], groupBy = 'sourcePerson', topN = 10) {
  const counts = new Map();

  rows.forEach((row) => {
    const label = valueForBarField(row, groupBy);
    if (!label) return;
    counts.set(label, (counts.get(label) || 0) + 1);
  });

  return Array.from(counts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
    .slice(0, Math.max(1, Number(topN) || 10));
}

export function buildLettersByYearData(rows = []) {
  const counts = new Map();

  rows.forEach((row) => {
    const year = getYearFromRow(row);
    if (!year) return;
    counts.set(year, (counts.get(year) || 0) + 1);
  });

  return Array.from(counts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => Number(a.label) - Number(b.label));
}

export function buildAnalyticsChartData({
  rows = [],
  chartType = 'bar',
  barGroupBy = 'sourcePerson',
  topN = 10,
} = {}) {
  if (chartType === 'line') {
    const data = buildLettersByYearData(rows);
    return {
      chartType: 'line',
      title: 'Correspondence volume by year',
      subtitle: 'Letter count by year in the current filtered data.',
      xLabel: 'Year',
      yLabel: 'Letters',
      data,
    };
  }

  const field = ANALYTICS_BAR_FIELD_DEFINITIONS.find((option) => option.key === barGroupBy);
  const data = buildBarChartData(rows, barGroupBy, topN);

  return {
    chartType: 'bar',
    title: `Top ${Math.max(1, Number(topN) || 10)} ${field?.label || 'categories'}`,
    subtitle: `${field?.description || 'Letters grouped by selected category'} Current filtered data.`,
    xLabel: field?.label || 'Category',
    yLabel: 'Letters',
    data,
  };
}
