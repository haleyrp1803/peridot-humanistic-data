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

function getYearFromRow(row) {
  const parsedYear = row?.parsedDate?.year;
  if (Number.isFinite(parsedYear) && parsedYear > 0) return String(parsedYear);

  const dateText = String(row?.date ?? '').trim();
  const match = dateText.match(/^(\d{4})/);
  if (!match || match[1] === '0000') return '';
  return match[1];
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

export function buildStackedBarChartData(rows = [], segmentBy = 'sourcePerson', topN = 10) {
  const segmentTotals = new Map();
  const yearSegmentCounts = new Map();

  rows.forEach((row) => {
    const year = getYearFromRow(row);
    const segment = fieldValue(row, segmentBy);
    if (!year || !segment) return;

    segmentTotals.set(segment, (segmentTotals.get(segment) || 0) + 1);
    incrementNestedMap(yearSegmentCounts, year, segment);
  });

  const series = topKeysByTotal(segmentTotals, topN);
  const data = Array.from(yearSegmentCounts.keys())
    .sort((a, b) => Number(a) - Number(b))
    .map((year) => {
      const counts = yearSegmentCounts.get(year) || new Map();
      const segments = series.map((label) => ({
        label,
        count: counts.get(label) || 0,
      }));
      return {
        label: year,
        segments,
        total: segments.reduce((sum, item) => sum + item.count, 0),
      };
    });

  return { series, data };
}

export function buildMultiLineChartData(rows = [], groupBy = 'sourcePerson', topN = 10) {
  const groupTotals = new Map();
  const yearGroupCounts = new Map();
  const years = new Set();

  rows.forEach((row) => {
    const year = getYearFromRow(row);
    const group = fieldValue(row, groupBy);
    if (!year || !group) return;

    years.add(year);
    groupTotals.set(group, (groupTotals.get(group) || 0) + 1);
    incrementNestedMap(yearGroupCounts, year, group);
  });

  const selectedGroups = topKeysByTotal(groupTotals, topN);
  const sortedYears = Array.from(years).sort((a, b) => Number(a) - Number(b));

  const series = selectedGroups.map((label) => ({
    label,
    points: sortedYears.map((year) => ({
      label: year,
      count: yearGroupCounts.get(year)?.get(label) || 0,
    })),
  }));

  return {
    years: sortedYears,
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

export function buildAnalyticsChartData({
  rows = [],
  chartType = 'bar',
  barGroupBy = 'sourcePerson',
  pieGroupBy = 'language',
  stackSegmentBy = 'sourcePerson',
  heatmapRowBy = 'sourcePerson',
  heatmapColumnBy = 'targetPerson',
  multiLineGroupBy = 'sourcePerson',
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

  if (chartType === 'pie') {
    const field = ANALYTICS_BAR_FIELD_DEFINITIONS.find((option) => option.key === pieGroupBy);
    const data = buildBarChartData(rows, pieGroupBy, topN);
    return {
      chartType: 'pie',
      title: `${field?.label || 'Category'} share`,
      subtitle: `${field?.description || 'Letters grouped by selected category'} Current filtered data.`,
      data,
    };
  }

  if (chartType === 'stackedBar') {
    const field = ANALYTICS_SEGMENT_FIELD_DEFINITIONS.find((option) => option.key === stackSegmentBy);
    const { series, data } = buildStackedBarChartData(rows, stackSegmentBy, topN);
    return {
      chartType: 'stackedBar',
      title: `Letters by year and ${field?.label || 'category'}`,
      subtitle: `Yearly letter counts split by ${field?.label || 'category'}.`,
      series,
      data,
    };
  }

  if (chartType === 'multiLine') {
    const field = ANALYTICS_SEGMENT_FIELD_DEFINITIONS.find((option) => option.key === multiLineGroupBy);
    const data = buildMultiLineChartData(rows, multiLineGroupBy, topN);
    return {
      chartType: 'multiLine',
      title: `Yearly trends by ${field?.label || 'category'}`,
      subtitle: `Top ${Math.max(1, Number(topN) || 10)} categories shown across available years.`,
      ...data,
    };
  }

  if (chartType === 'heatmap') {
    const rowField = ANALYTICS_HEATMAP_FIELD_DEFINITIONS.find((option) => option.key === heatmapRowBy);
    const columnField = ANALYTICS_HEATMAP_FIELD_DEFINITIONS.find((option) => option.key === heatmapColumnBy);
    const data = buildHeatmapChartData(rows, heatmapRowBy, heatmapColumnBy, topN);
    return {
      chartType: 'heatmap',
      title: `${rowField?.label || 'Rows'} × ${columnField?.label || 'columns'}`,
      subtitle: 'Letter count by paired categorical fields.',
      ...data,
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
