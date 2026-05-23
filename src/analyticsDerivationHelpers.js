import {
  ANALYTICS_BAR_FIELD_DEFINITIONS,
  ANALYTICS_HEATMAP_FIELD_DEFINITIONS,
  ANALYTICS_SEGMENT_FIELD_DEFINITIONS,
} from './analyticsConfig';

function normalizeText(value) {
  const text = String(value ?? '').trim();
  if (!text || text === '-' || text === '0') return '';
  return text;
}

function getDatePartsFromRow(row) {
  const parsedYear = row?.parsedDate?.year;
  const parsedMonth = row?.parsedDate?.month;
  const yearFromParsed = Number.isFinite(parsedYear) && parsedYear > 0 ? parsedYear : null;
  const monthFromParsed = Number.isFinite(parsedMonth) && parsedMonth >= 1 && parsedMonth <= 12 ? parsedMonth : null;

  if (yearFromParsed) {
    return { year: yearFromParsed, month: monthFromParsed || 1 };
  }

  const dateText = String(row?.date ?? '').trim();
  const match = dateText.match(/^(\d{4})(?:[-/](\d{1,2}))?/);
  if (!match || match[1] === '0000') return null;

  const year = Number(match[1]);
  const month = match[2] ? Math.min(12, Math.max(1, Number(match[2]))) : 1;
  return { year, month };
}

function getYearFromRow(row) {
  const parts = getDatePartsFromRow(row);
  return parts ? String(parts.year) : '';
}

function getPeriodGranularity(startYear, endYear) {
  const start = Number(startYear);
  const end = Number(endYear);
  const span = Math.max(0, end - start);

  if (span <= 1) return 'month';
  if (span <= 3) return 'quarter';
  if (span <= 5) return 'half';
  return 'year';
}

function formatPeriod({ year, month }, granularity) {
  if (granularity === 'month') {
    const monthLabel = String(month).padStart(2, '0');
    return `${year}-${monthLabel}`;
  }

  if (granularity === 'quarter') {
    const quarter = Math.floor((month - 1) / 3) + 1;
    return `${year} Q${quarter}`;
  }

  if (granularity === 'half') {
    const half = month <= 6 ? 'H1' : 'H2';
    return `${year} ${half}`;
  }

  return String(year);
}

function periodSortValue(label) {
  const yearMatch = String(label).match(/^(\d{4})/);
  const year = yearMatch ? Number(yearMatch[1]) : 0;

  if (label.includes('Q')) {
    const quarter = Number(label.match(/Q(\d)/)?.[1] || 1);
    return year * 12 + (quarter - 1) * 3;
  }

  if (label.includes('H2')) return year * 12 + 6;
  if (label.includes('H1')) return year * 12;

  const monthMatch = String(label).match(/^\d{4}-(\d{2})$/);
  if (monthMatch) return year * 12 + Number(monthMatch[1]) - 1;

  return year * 12;
}

function fieldValue(row, fieldKey) {
  if (fieldKey === 'route') {
    const source = normalizeText(row.sourceLoc);
    const target = normalizeText(row.targetLoc);
    if (!source || !target) return '';
    return `${source} → ${target}`;
  }

  return normalizeText(row[fieldKey]);
}

function hasRequiredField(rows, definition) {
  return rows.some((row) => {
    if (definition.key === 'route') {
      return Boolean(normalizeText(row.sourceLoc) && normalizeText(row.targetLoc));
    }

    return definition.requiredFields.some((field) => Boolean(normalizeText(row[field])));
  });
}

function incrementNestedMap(map, outerKey, innerKey, increment = 1) {
  if (!map.has(outerKey)) map.set(outerKey, new Map());
  const inner = map.get(outerKey);
  inner.set(innerKey, (inner.get(innerKey) || 0) + increment);
}

function topKeysByTotal(counts, topN) {
  return Array.from(counts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
    .slice(0, Math.max(1, Number(topN) || 10))
    .map((item) => item.label);
}

function filterRowsByAnalyticsDateRange(rows, startYear, endYear) {
  const start = Number(startYear);
  const end = Number(endYear);

  if (!Number.isFinite(start) || !Number.isFinite(end)) return rows;
  const minYear = Math.min(start, end);
  const maxYear = Math.max(start, end);

  return rows.filter((row) => {
    const parts = getDatePartsFromRow(row);
    if (!parts) return false;
    return parts.year >= minYear && parts.year <= maxYear;
  });
}

function periodLabelForRow(row, granularity) {
  const parts = getDatePartsFromRow(row);
  if (!parts) return '';
  return formatPeriod(parts, granularity);
}

export function getAnalyticsYearRange(rows = []) {
  const years = Array.from(
    new Set(
      rows
        .map((row) => getDatePartsFromRow(row)?.year)
        .filter((year) => Number.isFinite(year) && year > 0)
    )
  ).sort((a, b) => a - b);

  return {
    years,
    minYear: years[0] || null,
    maxYear: years[years.length - 1] || null,
  };
}

export function getAnalyticsPeriodGranularity(startYear, endYear) {
  return getPeriodGranularity(startYear, endYear);
}

export function getAvailableAnalyticsFields(rows = []) {
  const barGroupOptions = ANALYTICS_BAR_FIELD_DEFINITIONS.filter((definition) =>
    hasRequiredField(rows, definition)
  );

  const segmentGroupOptions = ANALYTICS_SEGMENT_FIELD_DEFINITIONS.filter((definition) =>
    hasRequiredField(rows, definition)
  );

  const heatmapOptions = ANALYTICS_HEATMAP_FIELD_DEFINITIONS.filter((definition) =>
    hasRequiredField(rows, definition)
  );

  return {
    barGroupOptions,
    pieGroupOptions: barGroupOptions,
    segmentGroupOptions,
    heatmapRowOptions: heatmapOptions,
    heatmapColumnOptions: heatmapOptions,
    hasYearData: rows.some((row) => Boolean(getYearFromRow(row))),
  };
}

export function buildBarChartData(rows = [], groupBy = 'sourcePerson', topN = 10) {
  const counts = new Map();

  rows.forEach((row) => {
    const label = fieldValue(row, groupBy);
    if (!label) return;
    counts.set(label, (counts.get(label) || 0) + 1);
  });

  return Array.from(counts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
    .slice(0, Math.max(1, Number(topN) || 10));
}

export function buildLettersByPeriodData(rows = [], startYear, endYear) {
  const granularity = getPeriodGranularity(startYear, endYear);
  const counts = new Map();

  rows.forEach((row) => {
    const label = periodLabelForRow(row, granularity);
    if (!label) return;
    counts.set(label, (counts.get(label) || 0) + 1);
  });

  return {
    granularity,
    data: Array.from(counts.entries())
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => periodSortValue(a.label) - periodSortValue(b.label)),
  };
}

export function buildGroupedBarChartData(rows = [], groupBy = 'sourcePerson', topN = 10, startYear, endYear) {
  const granularity = getPeriodGranularity(startYear, endYear);
  const groupTotals = new Map();
  const periodGroupCounts = new Map();
  const periods = new Set();

  rows.forEach((row) => {
    const period = periodLabelForRow(row, granularity);
    const group = fieldValue(row, groupBy);
    if (!period || !group) return;

    periods.add(period);
    groupTotals.set(group, (groupTotals.get(group) || 0) + 1);
    incrementNestedMap(periodGroupCounts, period, group);
  });

  const series = topKeysByTotal(groupTotals, topN);
  const data = Array.from(periods)
    .sort((a, b) => periodSortValue(a) - periodSortValue(b))
    .map((period) => ({
      label: period,
      groups: series.map((label) => ({
        label,
        count: periodGroupCounts.get(period)?.get(label) || 0,
      })),
    }));

  return { granularity, series, data };
}

export function buildStackedBarChartData(rows = [], segmentBy = 'sourcePerson', topN = 10, startYear, endYear) {
  const granularity = getPeriodGranularity(startYear, endYear);
  const segmentTotals = new Map();
  const periodSegmentCounts = new Map();

  rows.forEach((row) => {
    const period = periodLabelForRow(row, granularity);
    const segment = fieldValue(row, segmentBy);
    if (!period || !segment) return;

    segmentTotals.set(segment, (segmentTotals.get(segment) || 0) + 1);
    incrementNestedMap(periodSegmentCounts, period, segment);
  });

  const series = topKeysByTotal(segmentTotals, topN);
  const data = Array.from(periodSegmentCounts.keys())
    .sort((a, b) => periodSortValue(a) - periodSortValue(b))
    .map((period) => {
      const counts = periodSegmentCounts.get(period) || new Map();
      const segments = series.map((label) => ({
        label,
        count: counts.get(label) || 0,
      }));
      return {
        label: period,
        segments,
        total: segments.reduce((sum, item) => sum + item.count, 0),
      };
    });

  return { granularity, series, data };
}

export function buildMultiLineChartData(rows = [], groupBy = 'sourcePerson', topN = 10, startYear, endYear) {
  const granularity = getPeriodGranularity(startYear, endYear);
  const groupTotals = new Map();
  const periodGroupCounts = new Map();
  const periods = new Set();

  rows.forEach((row) => {
    const period = periodLabelForRow(row, granularity);
    const group = fieldValue(row, groupBy);
    if (!period || !group) return;

    periods.add(period);
    groupTotals.set(group, (groupTotals.get(group) || 0) + 1);
    incrementNestedMap(periodGroupCounts, period, group);
  });

  const selectedGroups = topKeysByTotal(groupTotals, topN);
  const sortedPeriods = Array.from(periods).sort((a, b) => periodSortValue(a) - periodSortValue(b));

  const series = selectedGroups.map((label) => ({
    label,
    points: sortedPeriods.map((period) => ({
      label: period,
      count: periodGroupCounts.get(period)?.get(label) || 0,
    })),
  }));

  return {
    granularity,
    periods: sortedPeriods,
    series,
  };
}

export function buildHeatmapChartData(rows = [], rowField = 'sourcePerson', columnField = 'targetPerson', topN = 10) {
  const rowTotals = new Map();
  const columnTotals = new Map();
  const matrix = new Map();

  rows.forEach((row) => {
    const rowLabel = fieldValue(row, rowField);
    const columnLabel = fieldValue(row, columnField);
    if (!rowLabel || !columnLabel) return;

    rowTotals.set(rowLabel, (rowTotals.get(rowLabel) || 0) + 1);
    columnTotals.set(columnLabel, (columnTotals.get(columnLabel) || 0) + 1);
    incrementNestedMap(matrix, rowLabel, columnLabel);
  });

  const rowLabels = topKeysByTotal(rowTotals, topN);
  const columnLabels = topKeysByTotal(columnTotals, topN);
  const cells = [];

  rowLabels.forEach((rowLabel) => {
    columnLabels.forEach((columnLabel) => {
      cells.push({
        rowLabel,
        columnLabel,
        count: matrix.get(rowLabel)?.get(columnLabel) || 0,
      });
    });
  });

  return {
    rows: rowLabels,
    columns: columnLabels,
    cells,
  };
}

export function buildHistogramChartData(rows = [], groupBy = 'sourcePerson') {
  const groupCounts = buildBarChartData(rows, groupBy, 100000);
  const bins = [
    { label: '1', min: 1, max: 1, count: 0 },
    { label: '2–5', min: 2, max: 5, count: 0 },
    { label: '6–10', min: 6, max: 10, count: 0 },
    { label: '11–20', min: 11, max: 20, count: 0 },
    { label: '21–50', min: 21, max: 50, count: 0 },
    { label: '51+', min: 51, max: Infinity, count: 0 },
  ];

  groupCounts.forEach((item) => {
    const bin = bins.find((candidate) => item.count >= candidate.min && item.count <= candidate.max);
    if (bin) bin.count += 1;
  });

  return bins.map(({ label, count }) => ({ label, count }));
}

export function buildSunburstChartData(rows = [], parentBy = 'sourceLoc', childBy = 'sourcePerson', topN = 10) {
  const parentTotals = new Map();
  const childCounts = new Map();

  rows.forEach((row) => {
    const parent = fieldValue(row, parentBy);
    const child = fieldValue(row, childBy);
    if (!parent || !child) return;

    parentTotals.set(parent, (parentTotals.get(parent) || 0) + 1);
    incrementNestedMap(childCounts, parent, child);
  });

  const parents = topKeysByTotal(parentTotals, topN).map((parentLabel) => {
    const children = Array.from((childCounts.get(parentLabel) || new Map()).entries())
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
      .slice(0, Math.max(1, Number(topN) || 10));

    return {
      label: parentLabel,
      count: parentTotals.get(parentLabel) || 0,
      children,
    };
  });

  return {
    total: parents.reduce((sum, parent) => sum + parent.count, 0),
    parents,
  };
}

export function buildAnalyticsChartData({
  rows = [],
  chartType = 'bar',
  barGroupBy = 'sourcePerson',
  barOrientation = 'vertical',
  pieGroupBy = 'language',
  histogramGroupBy = 'sourcePerson',
  stackSegmentBy = 'sourcePerson',
  groupedBarGroupBy = 'sourcePerson',
  heatmapRowBy = 'sourcePerson',
  heatmapColumnBy = 'targetPerson',
  multiLineGroupBy = 'sourcePerson',
  sunburstParentBy = 'sourceLoc',
  sunburstChildBy = 'sourcePerson',
  topN = 10,
  startYear,
  endYear,
} = {}) {
  const filteredRows = filterRowsByAnalyticsDateRange(rows, startYear, endYear);
  const rangeSuffix = startYear && endYear ? ` Selected range: ${Math.min(startYear, endYear)}–${Math.max(startYear, endYear)}.` : '';

  if (chartType === 'line') {
    const { granularity, data } = buildLettersByPeriodData(filteredRows, startYear, endYear);
    return {
      chartType: 'line',
      title: `Correspondence volume by ${granularity}`,
      subtitle: `Letter count by ${granularity} in the current filtered data.${rangeSuffix}`,
      xLabel: 'Time period',
      yLabel: 'Letters',
      data,
    };
  }

  if (chartType === 'pie') {
    const field = ANALYTICS_BAR_FIELD_DEFINITIONS.find((option) => option.key === pieGroupBy);
    const data = buildBarChartData(filteredRows, pieGroupBy, topN);
    return {
      chartType: 'pie',
      title: `${field?.label || 'Category'} share`,
      subtitle: `${field?.description || 'Letters grouped by selected category'}${rangeSuffix}`,
      data,
    };
  }

  if (chartType === 'histogram') {
    const field = ANALYTICS_SEGMENT_FIELD_DEFINITIONS.find((option) => option.key === histogramGroupBy);
    const data = buildHistogramChartData(filteredRows, histogramGroupBy);
    return {
      chartType: 'histogram',
      title: `Distribution by ${field?.label || 'category'} volume`,
      subtitle: `Number of categories falling into each letter-count range.${rangeSuffix}`,
      data,
    };
  }

  if (chartType === 'groupedBar') {
    const field = ANALYTICS_SEGMENT_FIELD_DEFINITIONS.find((option) => option.key === groupedBarGroupBy);
    const { granularity, series, data } = buildGroupedBarChartData(filteredRows, groupedBarGroupBy, topN, startYear, endYear);
    return {
      chartType: 'groupedBar',
      title: `${field?.label || 'Category'} by ${granularity}`,
      subtitle: `Side-by-side period counts for top ${Math.max(1, Number(topN) || 10)} categories.${rangeSuffix}`,
      series,
      data,
    };
  }

  if (chartType === 'stackedBar') {
    const field = ANALYTICS_SEGMENT_FIELD_DEFINITIONS.find((option) => option.key === stackSegmentBy);
    const { granularity, series, data } = buildStackedBarChartData(filteredRows, stackSegmentBy, topN, startYear, endYear);
    return {
      chartType: 'stackedBar',
      title: `Letters by ${granularity} and ${field?.label || 'category'}`,
      subtitle: `Period letter counts split by ${field?.label || 'category'}.${rangeSuffix}`,
      series,
      data,
    };
  }

  if (chartType === 'multiLine') {
    const field = ANALYTICS_SEGMENT_FIELD_DEFINITIONS.find((option) => option.key === multiLineGroupBy);
    const data = buildMultiLineChartData(filteredRows, multiLineGroupBy, topN, startYear, endYear);
    return {
      chartType: 'multiLine',
      title: `Period trends by ${field?.label || 'category'}`,
      subtitle: `Top ${Math.max(1, Number(topN) || 10)} categories shown across available periods.${rangeSuffix}`,
      ...data,
    };
  }

  if (chartType === 'heatmap') {
    const rowField = ANALYTICS_HEATMAP_FIELD_DEFINITIONS.find((option) => option.key === heatmapRowBy);
    const columnField = ANALYTICS_HEATMAP_FIELD_DEFINITIONS.find((option) => option.key === heatmapColumnBy);
    const data = buildHeatmapChartData(filteredRows, heatmapRowBy, heatmapColumnBy, topN);
    return {
      chartType: 'heatmap',
      title: `${rowField?.label || 'Rows'} × ${columnField?.label || 'columns'}`,
      subtitle: `Letter count by paired categorical fields.${rangeSuffix}`,
      ...data,
    };
  }

  if (chartType === 'sunburst') {
    const parentField = ANALYTICS_SEGMENT_FIELD_DEFINITIONS.find((option) => option.key === sunburstParentBy);
    const childField = ANALYTICS_SEGMENT_FIELD_DEFINITIONS.find((option) => option.key === sunburstChildBy);
    const data = buildSunburstChartData(filteredRows, sunburstParentBy, sunburstChildBy, topN);
    return {
      chartType: 'sunburst',
      title: `${parentField?.label || 'Parent'} → ${childField?.label || 'child'}`,
      subtitle: `Hierarchical part-to-whole view by selected parent and child fields.${rangeSuffix}`,
      ...data,
    };
  }

  const field = ANALYTICS_BAR_FIELD_DEFINITIONS.find((option) => option.key === barGroupBy);
  const data = buildBarChartData(filteredRows, barGroupBy, topN);

  return {
    chartType: 'bar',
    orientation: barOrientation,
    title: `Top ${Math.max(1, Number(topN) || 10)} ${field?.label || 'categories'}`,
    subtitle: `${field?.description || 'Letters grouped by selected category'}${rangeSuffix}`,
    xLabel: field?.label || 'Category',
    yLabel: 'Letters',
    data,
  };
}
