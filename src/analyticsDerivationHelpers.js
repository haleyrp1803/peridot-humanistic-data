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

function normalizeKey(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/["'’‘“”]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function keyMatchesCandidate(key, candidate) {
  return normalizeKey(key) === normalizeKey(candidate);
}

function getAliasedRowValue(row, canonicalKey, aliases = []) {
  if (!row) return '';

  const direct = normalizeText(row[canonicalKey]);
  if (direct) return direct;

  const candidates = [canonicalKey, ...aliases];
  const rowKeys = Object.keys(row);

  for (const candidate of candidates) {
    const foundKey = rowKeys.find((key) => keyMatchesCandidate(key, candidate));
    if (!foundKey) continue;

    const value = normalizeText(row[foundKey]);
    if (value) return value;
  }

  return '';
}

function getFieldDefinition(fieldKey) {
  return [
    ...ANALYTICS_BAR_FIELD_DEFINITIONS,
    ...ANALYTICS_HEATMAP_FIELD_DEFINITIONS,
    ...ANALYTICS_SEGMENT_FIELD_DEFINITIONS,
  ].find((definition) => definition.key === fieldKey);
}

function getDatePartsFromRow(row) {
  const parsedYear = row?.parsedDate?.year;
  const parsedMonth = row?.parsedDate?.month;
  const yearFromParsed = Number.isFinite(parsedYear) && parsedYear > 0 ? parsedYear : null;
  const monthFromParsed = Number.isFinite(parsedMonth) && parsedMonth >= 1 && parsedMonth <= 12 ? parsedMonth : null;

  if (yearFromParsed) {
    return { year: yearFromParsed, month: monthFromParsed || 1 };
  }

  const dateText = String(row?.date ?? row?.Date ?? '').trim();
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
  if (fieldKey === 'routePlace') {
    const source = fieldValue(row, 'sourceLoc');
    const target = fieldValue(row, 'targetLoc');
    if (!source || !target) return '';
    return `${source} → ${target}`;
  }

  if (fieldKey === 'routePerson') {
    const source = fieldValue(row, 'sourcePerson');
    const target = fieldValue(row, 'targetPerson');
    if (!source || !target) return '';
    return `${source} → ${target}`;
  }

  // Backward compatibility with the former place-route key.
  if (fieldKey === 'route') {
    return fieldValue(row, 'routePlace');
  }

  const definition = getFieldDefinition(fieldKey);
  if (definition) {
    return getAliasedRowValue(row, definition.key, definition.aliases || []);
  }

  return normalizeText(row[fieldKey]);
}

function hasRequiredField(rows, definition) {
  return rows.some((row) => Boolean(fieldValue(row, definition.key)));
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

function humanizeFieldLabel(key) {
  const explicitLabels = {
    sourcePerson: 'Source person',
    targetPerson: 'Target person',
    sourceLoc: 'Source place',
    targetLoc: 'Target place',
    routePlace: 'Route (Place)',
    routePerson: 'Route (Person)',
    archivalCollection: 'Archival collection',
  };

  if (explicitLabels[key]) return explicitLabels[key];

  return String(key)
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^./, (first) => first.toUpperCase());
}

function isTechnicalFieldKey(key) {
  const normalized = normalizeKey(key);
  if (!normalized) return true;

  const exactExclusions = new Set([
    'id',
    'row id',
    'parsed date',
    'date',
    'mappable',
    'map able',
    'source place id',
    'target place id',
    'source id',
    'target id',
    'person id',
    'place id',
    'source lat',
    'source long',
    'source lng',
    'target lat',
    'target long',
    'target lng',
    'lat',
    'lng',
    'long',
    'latitude',
    'longitude',
    'source latitude',
    'source longitude',
    'target latitude',
    'target longitude',
  ]);

  if (exactExclusions.has(normalized)) return true;
  if (normalized.startsWith('__')) return true;
  if (/\b(id|uuid|guid)\b/.test(normalized)) return true;
  if (/\b(lat|lng|long|latitude|longitude)\b/.test(normalized)) return true;
  if (/\bmappable\b/.test(normalized)) return true;

  return false;
}

function isUsableDynamicFieldValue(value) {
  if (value == null) return false;
  if (Array.isArray(value)) return false;
  if (typeof value === 'object') return false;

  const text = normalizeText(value);
  if (!text) return false;
  if (text.length > 140) return false;
  if (/^-?\d+(\.\d+)?$/.test(text)) return false;

  return true;
}

function isDynamicFieldCandidate(rows, key) {
  if (!key || isTechnicalFieldKey(key)) return false;

  const values = rows
    .map((row) => row?.[key])
    .filter((value) => value != null);

  if (!values.length) return false;

  const usableValues = values.filter(isUsableDynamicFieldValue);
  if (!usableValues.length) return false;

  const uniqueValues = new Set(usableValues.map((value) => normalizeText(value)));
  if (!uniqueValues.size) return false;

  // Avoid fields that are effectively unique row identifiers or long notes.
  if (values.length >= 5 && uniqueValues.size / values.length > 0.95) return false;

  return true;
}

function canonicalKeyForUploadedKey(key, existingDefinitions = []) {
  const normalized = normalizeKey(key);

  for (const definition of existingDefinitions) {
    const candidates = [definition.key, definition.label, ...(definition.aliases || [])].map(normalizeKey);
    if (candidates.includes(normalized)) return definition.key;
  }

  return null;
}

function buildDynamicFieldDefinitions(rows = [], existingDefinitions = []) {
  const existingKeys = new Set(existingDefinitions.map((definition) => definition.key));
  const keys = Array.from(new Set(rows.flatMap((row) => Object.keys(row || {}))));

  return keys
    .filter((key) => !canonicalKeyForUploadedKey(key, existingDefinitions))
    .filter((key) => !existingKeys.has(key))
    .filter((key) => isDynamicFieldCandidate(rows, key))
    .map((key) => ({
      key,
      label: humanizeFieldLabel(key),
      description: `Letters grouped by the uploaded “${humanizeFieldLabel(key)}” field.`,
      requiredFields: [key],
      dynamic: true,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

function mergeFieldDefinitions(baseDefinitions, dynamicDefinitions, { allowRoutes = true } = {}) {
  const byKey = new Map();

  baseDefinitions
    .filter((definition) => allowRoutes || (definition.key !== 'routePlace' && definition.key !== 'routePerson'))
    .forEach((definition) => byKey.set(definition.key, definition));

  dynamicDefinitions
    .filter((definition) => allowRoutes || (definition.key !== 'routePlace' && definition.key !== 'routePerson'))
    .forEach((definition) => {
      if (!byKey.has(definition.key)) byKey.set(definition.key, definition);
    });

  return Array.from(byKey.values());
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
  const dynamicDefinitions = buildDynamicFieldDefinitions(rows, ANALYTICS_BAR_FIELD_DEFINITIONS);
  const allBarDefinitions = mergeFieldDefinitions(ANALYTICS_BAR_FIELD_DEFINITIONS, dynamicDefinitions);
  const allSegmentDefinitions = mergeFieldDefinitions(ANALYTICS_SEGMENT_FIELD_DEFINITIONS, dynamicDefinitions, { allowRoutes: false });
  const allHeatmapDefinitions = mergeFieldDefinitions(ANALYTICS_HEATMAP_FIELD_DEFINITIONS, dynamicDefinitions, { allowRoutes: false });

  const barGroupOptions = allBarDefinitions.filter((definition) =>
    hasRequiredField(rows, definition)
  );

  const segmentGroupOptions = allSegmentDefinitions.filter((definition) =>
    hasRequiredField(rows, definition)
  );

  const heatmapOptions = allHeatmapDefinitions.filter((definition) =>
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
    const data = buildBarChartData(filteredRows, pieGroupBy, topN);
    return {
      chartType: 'pie',
      title: `${humanizeFieldLabel(pieGroupBy)} share`,
      subtitle: `Letters grouped by selected category.${rangeSuffix}`,
      data,
    };
  }

  if (chartType === 'histogram') {
    const data = buildHistogramChartData(filteredRows, histogramGroupBy);
    return {
      chartType: 'histogram',
      title: `Distribution by ${humanizeFieldLabel(histogramGroupBy)} volume`,
      subtitle: `Number of categories falling into each letter-count range.${rangeSuffix}`,
      data,
    };
  }

  if (chartType === 'groupedBar') {
    const { granularity, series, data } = buildGroupedBarChartData(filteredRows, groupedBarGroupBy, topN, startYear, endYear);
    return {
      chartType: 'groupedBar',
      title: `${humanizeFieldLabel(groupedBarGroupBy)} by ${granularity}`,
      subtitle: `Side-by-side period counts for top ${Math.max(1, Number(topN) || 10)} categories.${rangeSuffix}`,
      series,
      data,
    };
  }

  if (chartType === 'stackedBar') {
    const { granularity, series, data } = buildStackedBarChartData(filteredRows, stackSegmentBy, topN, startYear, endYear);
    return {
      chartType: 'stackedBar',
      title: `Letters by ${granularity} and ${humanizeFieldLabel(stackSegmentBy)}`,
      subtitle: `Period letter counts split by ${humanizeFieldLabel(stackSegmentBy)}.${rangeSuffix}`,
      series,
      data,
    };
  }

  if (chartType === 'multiLine') {
    const data = buildMultiLineChartData(filteredRows, multiLineGroupBy, topN, startYear, endYear);
    return {
      chartType: 'multiLine',
      title: `Period trends by ${humanizeFieldLabel(multiLineGroupBy)}`,
      subtitle: `Top ${Math.max(1, Number(topN) || 10)} categories shown across available periods.${rangeSuffix}`,
      ...data,
    };
  }

  if (chartType === 'heatmap') {
    const data = buildHeatmapChartData(filteredRows, heatmapRowBy, heatmapColumnBy, topN);
    return {
      chartType: 'heatmap',
      title: `${humanizeFieldLabel(heatmapRowBy)} × ${humanizeFieldLabel(heatmapColumnBy)}`,
      subtitle: `Letter count by paired categorical fields.${rangeSuffix}`,
      ...data,
    };
  }

  if (chartType === 'sunburst') {
    const data = buildSunburstChartData(filteredRows, sunburstParentBy, sunburstChildBy, topN);
    return {
      chartType: 'sunburst',
      title: `${humanizeFieldLabel(sunburstParentBy)} → ${humanizeFieldLabel(sunburstChildBy)}`,
      subtitle: `Hierarchical part-to-whole view by selected parent and child fields.${rangeSuffix}`,
      ...data,
    };
  }

  const data = buildBarChartData(filteredRows, barGroupBy, topN);

  return {
    chartType: 'bar',
    orientation: barOrientation,
    title: `Top ${Math.max(1, Number(topN) || 10)} ${humanizeFieldLabel(barGroupBy)}`,
    subtitle: `Letters grouped by selected category.${rangeSuffix}`,
    xLabel: humanizeFieldLabel(barGroupBy),
    yLabel: 'Letters',
    data,
  };
}
