/*
 * Analytics data-derivation layer.
 * 
 * This module converts the current filtered rows into chart-ready structures. It detects available categorical/numeric fields, applies Analytics-local date scopes, builds grouped/stacked/multi-series data, computes record-count and numeric aggregations, and formats time periods.
 * 
 * Important relationships:
 * - `AnalyticsPanel.jsx` calls this file to build data for the selected chart configuration.
 * - `analyticsConfig.js` supplies curated semantic field definitions and chart defaults.
 * - `analyticsChartComponents.jsx` expects this file to return already-shaped data rather than raw application rows.
 * 
 * Maintenance cautions:
 * - Dynamic field detection must stay conservative. Avoid admitting ID columns, raw coordinates, long notes, object values, or near-unique identifiers as categorical chart variables.
 * - Record count is a first-class metric; do not hide it as an implicit fallback when aggregate charts need a metric.
 */

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

function parseNumber(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  const text = String(value ?? '').trim();
  if (!text) return null;
  const cleaned = text.replace(/[,$£€]/g, '').replace(/%$/, '').trim();
  if (!/^[-+]?\d*\.?\d+(e[-+]?\d+)?$/i.test(cleaned)) return null;
  const number = Number(cleaned);
  return Number.isFinite(number) ? number : null;
}

function getDatePartsFromRow(row) {
  const parsedYear = row?.parsedDate?.year;
  const parsedMonth = row?.parsedDate?.month;
  const yearFromParsed = Number.isFinite(parsedYear) && parsedYear > 0 ? parsedYear : null;
  const monthFromParsed = Number.isFinite(parsedMonth) && parsedMonth >= 1 && parsedMonth <= 12 ? parsedMonth : null;

  if (yearFromParsed) {
    return { year: yearFromParsed, month: monthFromParsed || 1, sort: yearFromParsed * 12 + ((monthFromParsed || 1) - 1) };
  }

  const candidateValues = [row?.date, row?.Date, row?.Date_Start, row?.Date_End, row?.Date_Display];
  for (const candidate of candidateValues) {
    const dateText = String(candidate ?? '').trim();
    const match = dateText.match(/^(\d{3,4})(?:[-/](\d{1,2}))?/);
    if (!match || match[1] === '0000') continue;
    const year = Number(match[1]);
    const month = match[2] ? Math.min(12, Math.max(1, Number(match[2]))) : 1;
    return { year, month, sort: year * 12 + (month - 1) };
  }

  return null;
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
  const yearMatch = String(label).match(/^(\d{3,4})/);
  const year = yearMatch ? Number(yearMatch[1]) : 0;

  if (label.includes('Q')) {
    const quarter = Number(label.match(/Q(\d)/)?.[1] || 1);
    return year * 12 + (quarter - 1) * 3;
  }

  if (label.includes('H2')) return year * 12 + 6;
  if (label.includes('H1')) return year * 12;

  const monthMatch = String(label).match(/^\d{3,4}-(\d{2})$/);
  if (monthMatch) return year * 12 + Number(monthMatch[1]) - 1;

  return year * 12;
}

function fieldValue(row, fieldKey) {
  if (fieldKey === 'timePeriod') return periodLabelForRow(row, 'year');
  if (fieldKey === 'recordCount') return 'Record count';

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

  if (fieldKey === 'route') return fieldValue(row, 'routePlace');

  const definition = getFieldDefinition(fieldKey);
  if (definition) return getAliasedRowValue(row, definition.key, definition.aliases || []);

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

function aggregateValues(values, aggregation = 'count') {
  if (aggregation === 'count') return values.length;
  const numericValues = values.map(parseNumber).filter((value) => value !== null);
  if (!numericValues.length) return 0;
  if (aggregation === 'sum') return numericValues.reduce((sum, value) => sum + value, 0);
  if (aggregation === 'min') return Math.min(...numericValues);
  if (aggregation === 'max') return Math.max(...numericValues);
  return numericValues.reduce((sum, value) => sum + value, 0) / numericValues.length;
}

function metricValue(row, metricField) {
  if (!metricField || metricField === 'recordCount') return 1;
  return parseNumber(row?.[metricField]);
}

function unitForMetric(metricField) {
  return metricField === 'recordCount' ? 'records' : 'value';
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

function sortAxisLabels(labels, rows, fieldKey) {
  if (fieldKey === 'timePeriod') return labels.sort((a, b) => periodSortValue(a) - periodSortValue(b));
  const numericValues = new Map();
  rows.forEach((row) => {
    const label = fieldValue(row, fieldKey);
    const number = parseNumber(label);
    if (label && number !== null) numericValues.set(label, number);
  });
  if (numericValues.size === labels.length) {
    return labels.sort((a, b) => numericValues.get(a) - numericValues.get(b));
  }
  return labels.sort((a, b) => String(a).localeCompare(String(b)));
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
    timePeriod: 'Time period',
    recordCount: 'Record count',
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
    'id', 'row id', 'parsed date', 'mappable', 'map able', 'source place id', 'target place id',
    'source id', 'target id', 'person id', 'place id', 'source lat', 'source long', 'source lng',
    'target lat', 'target long', 'target lng', 'lat', 'lng', 'long', 'latitude', 'longitude',
    'source latitude', 'source longitude', 'target latitude', 'target longitude',
  ]);

  if (exactExclusions.has(normalized)) return true;
  if (normalized.startsWith('__')) return true;
  if (/\b(id|uuid|guid)\b/.test(normalized)) return true;
  if (/\b(lat|lng|long|latitude|longitude)\b/.test(normalized)) return true;
  if (/\bmappable\b/.test(normalized)) return true;

  return false;
}

function isDateLikeFieldKey(key) {
  const normalized = normalizeKey(key);
  return normalized === 'date'
    || normalized === 'year'
    || normalized === 'date start'
    || normalized === 'date end'
    || normalized === 'date display'
    || /\b(date|year|period|time)\b/.test(normalized);
}

function isEvidenceLikeFieldKey(key) {
  const normalized = normalizeKey(key);
  return /\b(source|citation|archive|collection|repository|page|folio|link|url|image|note|description|transcription|translation)\b/.test(normalized);
}

function numericFieldStats(rows, key) {
  const values = rows.map((row) => row?.[key]).filter((value) => value !== null && value !== undefined && String(value).trim() !== '');
  if (!values.length) return { count: 0, ratio: 0 };
  const numericValues = values.map(parseNumber).filter((value) => value !== null);
  return { count: numericValues.length, ratio: numericValues.length / values.length };
}

function isUsableDynamicFieldValue(value) {
  if (value == null) return false;
  if (Array.isArray(value)) return false;
  if (typeof value === 'object') return false;

  const text = normalizeText(value);
  if (!text) return false;
  if (text.length > 140) return false;

  return true;
}

function isDynamicFieldCandidate(rows, key) {
  if (!key || isTechnicalFieldKey(key)) return false;

  const values = rows.map((row) => row?.[key]).filter((value) => value != null);
  if (!values.length) return false;

  const usableValues = values.filter(isUsableDynamicFieldValue);
  if (!usableValues.length) return false;

  const uniqueValues = new Set(usableValues.map((value) => normalizeText(value)));
  if (!uniqueValues.size) return false;
  if (values.length >= 5 && uniqueValues.size / values.length > 0.98) return false;

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
      description: `Use the uploaded “${humanizeFieldLabel(key)}” field.`,
      requiredFields: [key],
      dynamic: true,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

function buildNumericMeasureDefinitions(rows = []) {
  const keys = Array.from(new Set(rows.flatMap((row) => Object.keys(row || {}))));
  return keys
    .filter((key) => !isTechnicalFieldKey(key))
    .filter((key) => !isDateLikeFieldKey(key))
    .filter((key) => !isEvidenceLikeFieldKey(key))
    .filter((key) => numericFieldStats(rows, key).ratio >= 0.65)
    .map((key) => ({
      key,
      label: humanizeFieldLabel(key),
      description: `Use numeric values from the uploaded “${humanizeFieldLabel(key)}” column.`,
      requiredFields: [key],
      dynamic: true,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

function buildDateFieldDefinitions(rows = []) {
  const keys = Array.from(new Set(rows.flatMap((row) => Object.keys(row || {}))));
  const definitions = [];

  if (rows.some((row) => Boolean(getDatePartsFromRow(row)))) {
    definitions.push({ key: 'timePeriod', label: 'Time period', description: 'Derived from the mapped date/date-start/date-end values.' });
  }

  keys.forEach((key) => {
    if (!isDateLikeFieldKey(key)) return;
    if (definitions.some((definition) => definition.key === key)) return;
    const hasValues = rows.some((row) => normalizeText(row?.[key]));
    if (!hasValues) return;
    definitions.push({ key, label: humanizeFieldLabel(key), description: `Use values from “${humanizeFieldLabel(key)}” as the x-axis.` });
  });

  return definitions;
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
  const years = Array.from(new Set(rows.map((row) => getDatePartsFromRow(row)?.year).filter((year) => Number.isFinite(year) && year > 0))).sort((a, b) => a - b);
  return { years, minYear: years[0] || null, maxYear: years[years.length - 1] || null };
}

export function getAnalyticsPeriodGranularity(startYear, endYear) {
  return getPeriodGranularity(startYear, endYear);
}

export function getAvailableAnalyticsFields(rows = []) {
  const dynamicDefinitions = buildDynamicFieldDefinitions(rows, ANALYTICS_BAR_FIELD_DEFINITIONS);
  const numericMeasureOptions = buildNumericMeasureDefinitions(rows);
  const dateFieldOptions = buildDateFieldDefinitions(rows);
  const allBarDefinitions = mergeFieldDefinitions(ANALYTICS_BAR_FIELD_DEFINITIONS, dynamicDefinitions);
  const allSegmentDefinitions = mergeFieldDefinitions(ANALYTICS_SEGMENT_FIELD_DEFINITIONS, dynamicDefinitions, { allowRoutes: false });
  const allHeatmapDefinitions = mergeFieldDefinitions(ANALYTICS_HEATMAP_FIELD_DEFINITIONS, dynamicDefinitions, { allowRoutes: false });

  const barGroupOptions = allBarDefinitions.filter((definition) => hasRequiredField(rows, definition));
  const segmentGroupOptions = allSegmentDefinitions.filter((definition) => hasRequiredField(rows, definition));
  const heatmapOptions = allHeatmapDefinitions.filter((definition) => hasRequiredField(rows, definition));

  const genericXAxisOptions = [
    ...dateFieldOptions,
    ...barGroupOptions.filter((definition) => !dateFieldOptions.some((dateDefinition) => dateDefinition.key === definition.key)),
  ];

  return {
    barGroupOptions,
    pieGroupOptions: barGroupOptions,
    segmentGroupOptions,
    heatmapRowOptions: heatmapOptions,
    heatmapColumnOptions: heatmapOptions,
    xAxisOptions: genericXAxisOptions,
    dateFieldOptions,
    numericMeasureOptions,
    yMetricOptions: [{ key: 'recordCount', label: 'Record count', description: 'Count records in each group.' }, ...numericMeasureOptions],
    hasYearData: rows.some((row) => Boolean(getYearFromRow(row))),
    hasMeasureTimeSeries: dateFieldOptions.length > 0 && numericMeasureOptions.length > 0,
  };
}

export function buildBarChartData(rows = [], groupBy = 'sourcePerson', topN = 10, metricField = 'recordCount', aggregation = 'count') {
  const grouped = new Map();
  rows.forEach((row) => {
    const label = fieldValue(row, groupBy);
    if (!label) return;
    if (!grouped.has(label)) grouped.set(label, []);
    grouped.get(label).push(metricField === 'recordCount' ? 1 : row?.[metricField]);
  });
  return Array.from(grouped.entries())
    .map(([label, values]) => ({ label, count: aggregateValues(values, metricField === 'recordCount' ? 'count' : aggregation), unit: metricField === 'recordCount' ? 'records' : 'value' }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
    .slice(0, Math.max(1, Number(topN) || 10));
}

export function buildLineChartData(rows = [], xField = 'timePeriod', metricField = 'recordCount', aggregation = 'count', startYear, endYear) {
  const granularity = getPeriodGranularity(startYear, endYear);
  const grouped = new Map();
  rows.forEach((row) => {
    const label = xField === 'timePeriod' ? periodLabelForRow(row, granularity) : fieldValue(row, xField);
    if (!label) return;
    if (!grouped.has(label)) grouped.set(label, []);
    grouped.get(label).push(metricField === 'recordCount' ? 1 : row?.[metricField]);
  });
  return sortAxisLabels(Array.from(grouped.keys()), rows, xField).map((label) => ({
    label,
    count: aggregateValues(grouped.get(label) || [], metricField === 'recordCount' ? 'count' : aggregation),
    unit: metricField === 'recordCount' ? 'records' : 'value',
  }));
}

export function buildGroupedBarChartData(rows = [], xField = 'timePeriod', groupBy = 'sourcePerson', topN = 10, metricField = 'recordCount', aggregation = 'count', startYear, endYear) {
  const granularity = getPeriodGranularity(startYear, endYear);
  const groupTotals = new Map();
  const groupedValues = new Map();
  const xLabels = new Set();
  rows.forEach((row) => {
    const xLabel = xField === 'timePeriod' ? periodLabelForRow(row, granularity) : fieldValue(row, xField);
    const group = fieldValue(row, groupBy);
    if (!xLabel || !group) return;
    const rawValue = metricField === 'recordCount' ? 1 : row?.[metricField];
    xLabels.add(xLabel);
    groupTotals.set(group, (groupTotals.get(group) || 0) + (metricField === 'recordCount' ? 1 : (parseNumber(rawValue) || 0)));
    incrementNestedMap(groupedValues, xLabel, group, 0);
    const inner = groupedValues.get(xLabel);
    if (!Array.isArray(inner.get(group))) inner.set(group, []);
    inner.get(group).push(rawValue);
  });
  const series = topKeysByTotal(groupTotals, topN);
  const data = sortAxisLabels(Array.from(xLabels), rows, xField).map((label) => ({
    label,
    groups: series.map((seriesLabel) => ({
      label: seriesLabel,
      count: aggregateValues(groupedValues.get(label)?.get(seriesLabel) || [], metricField === 'recordCount' ? 'count' : aggregation),
      unit: unitForMetric(metricField),
    })),
  }));
  return { granularity, series, data };
}

export function buildStackedBarChartData(rows = [], xField = 'timePeriod', segmentBy = 'sourcePerson', topN = 10, metricField = 'recordCount', aggregation = 'count', startYear, endYear) {
  const grouped = buildGroupedBarChartData(rows, xField, segmentBy, topN, metricField, aggregation, startYear, endYear);
  return {
    ...grouped,
    data: grouped.data.map((row) => ({
      label: row.label,
      segments: row.groups,
      total: row.groups.reduce((sum, group) => sum + group.count, 0),
    })),
  };
}

export function buildMultiLineChartData(rows = [], xField = 'timePeriod', seriesMode = 'wide', seriesFields = [], groupBy = 'sourcePerson', metricField = 'recordCount', aggregation = 'average', topN = 10, startYear, endYear) {
  const granularity = getPeriodGranularity(startYear, endYear);
  const xLabels = new Set();
  const xLabelForRow = (row) => xField === 'timePeriod' ? periodLabelForRow(row, granularity) : fieldValue(row, xField);

  if (seriesMode === 'wide') {
    const series = seriesFields.slice(0, Math.max(1, Number(topN) || 10)).map((field) => {
      const grouped = new Map();
      rows.forEach((row) => {
        const label = xLabelForRow(row);
        const value = row?.[field.key || field];
        if (!label || parseNumber(value) === null) return;
        xLabels.add(label);
        if (!grouped.has(label)) grouped.set(label, []);
        grouped.get(label).push(value);
      });
      return { label: field.label || humanizeFieldLabel(field.key || field), grouped };
    });
    const sortedLabels = sortAxisLabels(Array.from(xLabels), rows, xField);
    return {
      granularity,
      periods: sortedLabels,
      series: series.map((item) => ({
        label: item.label,
        points: sortedLabels.map((label) => ({ label, count: aggregateValues(item.grouped.get(label) || [], aggregation), unit: 'value' })),
      })),
    };
  }

  const totals = new Map();
  const groupedValues = new Map();
  rows.forEach((row) => {
    const xLabel = xLabelForRow(row);
    const group = fieldValue(row, groupBy);
    if (!xLabel || !group) return;
    const rawValue = metricField === 'recordCount' ? 1 : row?.[metricField];
    xLabels.add(xLabel);
    totals.set(group, (totals.get(group) || 0) + (metricField === 'recordCount' ? 1 : (parseNumber(rawValue) || 0)));
    incrementNestedMap(groupedValues, group, xLabel, 0);
    const inner = groupedValues.get(group);
    if (!Array.isArray(inner.get(xLabel))) inner.set(xLabel, []);
    inner.get(xLabel).push(rawValue);
  });
  const selectedGroups = topKeysByTotal(totals, topN);
  const sortedLabels = sortAxisLabels(Array.from(xLabels), rows, xField);
  return {
    granularity,
    periods: sortedLabels,
    series: selectedGroups.map((label) => ({
      label,
      points: sortedLabels.map((xLabel) => ({ label: xLabel, count: aggregateValues(groupedValues.get(label)?.get(xLabel) || [], metricField === 'recordCount' ? 'count' : aggregation), unit: unitForMetric(metricField) })),
    })),
  };
}

export function buildHeatmapChartData(rows = [], rowField = 'sourcePerson', columnField = 'targetPerson', topN = 10, metricField = 'recordCount', aggregation = 'count') {
  const rowTotals = new Map();
  const columnTotals = new Map();
  const matrix = new Map();
  rows.forEach((row) => {
    const rowLabel = fieldValue(row, rowField);
    const columnLabel = fieldValue(row, columnField);
    if (!rowLabel || !columnLabel) return;
    const rawValue = metricField === 'recordCount' ? 1 : row?.[metricField];
    rowTotals.set(rowLabel, (rowTotals.get(rowLabel) || 0) + (metricField === 'recordCount' ? 1 : (parseNumber(rawValue) || 0)));
    columnTotals.set(columnLabel, (columnTotals.get(columnLabel) || 0) + (metricField === 'recordCount' ? 1 : (parseNumber(rawValue) || 0)));
    if (!matrix.has(rowLabel)) matrix.set(rowLabel, new Map());
    const inner = matrix.get(rowLabel);
    if (!Array.isArray(inner.get(columnLabel))) inner.set(columnLabel, []);
    inner.get(columnLabel).push(rawValue);
  });
  const rowLabels = topKeysByTotal(rowTotals, topN);
  const columnLabels = topKeysByTotal(columnTotals, topN);
  const cells = [];
  rowLabels.forEach((rowLabel) => {
    columnLabels.forEach((columnLabel) => {
      cells.push({ rowLabel, columnLabel, count: aggregateValues(matrix.get(rowLabel)?.get(columnLabel) || [], metricField === 'recordCount' ? 'count' : aggregation), unit: unitForMetric(metricField) });
    });
  });
  return { rows: rowLabels, columns: columnLabels, cells };
}

export function buildHistogramChartData(rows = [], valueField = 'recordCount', groupBy = 'sourcePerson') {
  const values = valueField === 'recordCount'
    ? buildBarChartData(rows, groupBy, 100000, 'recordCount', 'count').map((item) => item.count).filter((value) => Number.isFinite(value))
    : rows.map((row) => parseNumber(row?.[valueField])).filter((value) => value !== null);
  if (!values.length) return [];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const binCount = Math.min(8, Math.max(4, Math.ceil(Math.sqrt(values.length))));
  const width = max === min ? 1 : (max - min) / binCount;
  const bins = Array.from({ length: binCount }, (_, index) => {
    const start = min + width * index;
    const end = index === binCount - 1 ? max : min + width * (index + 1);
    return { label: `${Math.round(start * 100) / 100}–${Math.round(end * 100) / 100}`, min: start, max: end, count: 0 };
  });
  values.forEach((value) => {
    const index = Math.min(binCount - 1, Math.max(0, Math.floor((value - min) / width)));
    bins[index].count += 1;
  });
  return bins.map(({ label, count }) => ({ label, count, unit: valueField === 'recordCount' ? 'categories' : 'records' }));
}

export function buildSunburstChartData(rows = [], parentBy = 'sourceLoc', childBy = 'sourcePerson', topN = 10, metricField = 'recordCount', aggregation = 'count') {
  const parentValues = new Map();
  const childValues = new Map();
  rows.forEach((row) => {
    const parent = fieldValue(row, parentBy);
    const child = fieldValue(row, childBy);
    if (!parent || !child) return;
    const rawValue = metricField === 'recordCount' ? 1 : row?.[metricField];

    if (!parentValues.has(parent)) parentValues.set(parent, []);
    parentValues.get(parent).push(rawValue);

    if (!childValues.has(parent)) childValues.set(parent, new Map());
    const children = childValues.get(parent);
    if (!children.has(child)) children.set(child, []);
    children.get(child).push(rawValue);
  });

  const parentTotals = new Map(
    Array.from(parentValues.entries()).map(([label, values]) => [
      label,
      aggregateValues(values, metricField === 'recordCount' ? 'count' : aggregation),
    ]),
  );

  const parents = topKeysByTotal(parentTotals, topN).map((parentLabel) => {
    const children = Array.from((childValues.get(parentLabel) || new Map()).entries())
      .map(([label, values]) => ({
        label,
        count: aggregateValues(values, metricField === 'recordCount' ? 'count' : aggregation),
        unit: unitForMetric(metricField),
      }))
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
      .slice(0, Math.max(1, Number(topN) || 10));
    return { label: parentLabel, count: parentTotals.get(parentLabel) || 0, unit: unitForMetric(metricField), children };
  });
  return { total: parents.reduce((sum, parent) => sum + parent.count, 0), parents };
}

/**
 * Build the chart-ready payload consumed by `AnalyticsChartPreview`.
 *
 * Extension contract:
 * - Every chartType returned here must have a corresponding renderer branch in
 *   `analyticsChartComponents.jsx`.
 * - Every chartType that needs user choices should have matching controls in
 *   `AnalyticsPanel.jsx`.
 * - Keep this function focused on shaping already-filtered rows into chart data;
 *   global Search/Filter scope, timeline playback scope, and export behavior are
 *   owned by higher-level workspaces.
 */
export function buildAnalyticsChartData({
  rows = [],
  chartType = 'bar',
  xField = 'timePeriod',
  yField = 'recordCount',
  aggregation = 'count',
  barGroupBy = 'sourcePerson',
  barOrientation = 'vertical',
  pieGroupBy = 'language',
  histogramValueField = 'recordCount',
  histogramGroupBy = 'sourcePerson',
  stackSegmentBy = 'sourcePerson',
  groupedBarGroupBy = 'sourcePerson',
  heatmapRowBy = 'sourcePerson',
  heatmapColumnBy = 'targetPerson',
  multiLineMode = 'wide',
  multiLineGroupBy = 'sourcePerson',
  multiLineSeriesFields = [],
  sunburstParentBy = 'sourceLoc',
  sunburstChildBy = 'sourcePerson',
  topN = 10,
  startYear,
  endYear,
} = {}) {
  const filteredRows = filterRowsByAnalyticsDateRange(rows, startYear, endYear);
  const rangeSuffix = startYear && endYear ? ` Selected range: ${Math.min(startYear, endYear)}–${Math.max(startYear, endYear)}.` : '';
  const metricLabel = yField === 'recordCount' ? 'record count' : `${aggregation} ${humanizeFieldLabel(yField)}`;

  if (chartType === 'line') {
    const data = buildLineChartData(filteredRows, xField, yField, aggregation, startYear, endYear);
    return { chartType: 'line', title: `${humanizeFieldLabel(yField)} by ${humanizeFieldLabel(xField)}`, subtitle: `${metricLabel} by selected x-axis.${rangeSuffix}`, xLabel: humanizeFieldLabel(xField), yLabel: humanizeFieldLabel(yField), data };
  }
  if (chartType === 'pie') {
    const data = buildBarChartData(filteredRows, pieGroupBy, topN, yField, aggregation);
    return { chartType: 'pie', title: `${humanizeFieldLabel(pieGroupBy)} share`, subtitle: `${metricLabel} grouped by selected category.${rangeSuffix}`, data };
  }
  if (chartType === 'histogram') {
    const valueField = histogramValueField || yField || 'recordCount';
    const data = buildHistogramChartData(filteredRows, valueField, histogramGroupBy);
    if (valueField === 'recordCount') {
      return {
        chartType: 'histogram',
        title: `Distribution of record counts by ${humanizeFieldLabel(histogramGroupBy)}`,
        subtitle: `Binned counts of records per selected category.${rangeSuffix}`,
        data,
      };
    }
    return { chartType: 'histogram', title: `Distribution of ${humanizeFieldLabel(valueField)}`, subtitle: `Binned numeric values from the selected field.${rangeSuffix}`, data };
  }
  if (chartType === 'groupedBar') {
    const { series, data } = buildGroupedBarChartData(filteredRows, xField, groupedBarGroupBy, topN, yField, aggregation, startYear, endYear);
    return { chartType: 'groupedBar', title: `${humanizeFieldLabel(groupedBarGroupBy)} by ${humanizeFieldLabel(xField)}`, subtitle: `Side-by-side groups using ${metricLabel}.${rangeSuffix}`, series, data };
  }
  if (chartType === 'stackedBar') {
    const { series, data } = buildStackedBarChartData(filteredRows, xField, stackSegmentBy, topN, yField, aggregation, startYear, endYear);
    return { chartType: 'stackedBar', title: `${humanizeFieldLabel(xField)} split by ${humanizeFieldLabel(stackSegmentBy)}`, subtitle: `Stacked segments using ${metricLabel}.${rangeSuffix}`, series, data };
  }
  if (chartType === 'multiLine') {
    const data = buildMultiLineChartData(filteredRows, xField, multiLineMode, multiLineSeriesFields, multiLineGroupBy, yField, aggregation, topN, startYear, endYear);
    return {
      chartType: 'multiLine',
      title: `Trends by ${humanizeFieldLabel(xField)}`,
      subtitle: multiLineMode === 'wide'
        ? `Selected numeric columns shown as separate series.${rangeSuffix}`
        : `One line per ${humanizeFieldLabel(multiLineGroupBy)} using ${metricLabel}.${rangeSuffix}`,
      ...data,
    };
  }
  if (chartType === 'heatmap') {
    const data = buildHeatmapChartData(filteredRows, heatmapRowBy, heatmapColumnBy, topN, yField, aggregation);
    return { chartType: 'heatmap', title: `${humanizeFieldLabel(heatmapRowBy)} × ${humanizeFieldLabel(heatmapColumnBy)}`, subtitle: `Matrix cells use ${metricLabel}.${rangeSuffix}`, ...data };
  }
  if (chartType === 'sunburst') {
    const data = buildSunburstChartData(filteredRows, sunburstParentBy, sunburstChildBy, topN, yField, aggregation);
    return { chartType: 'sunburst', title: `${humanizeFieldLabel(sunburstParentBy)} → ${humanizeFieldLabel(sunburstChildBy)}`, subtitle: `Hierarchical part-to-whole view using ${metricLabel}.${rangeSuffix}`, ...data };
  }
  const data = buildBarChartData(filteredRows, barGroupBy, topN, yField, aggregation);
  return { chartType: 'bar', orientation: barOrientation, title: `${humanizeFieldLabel(yField)} by ${humanizeFieldLabel(barGroupBy)}`, subtitle: `${metricLabel} grouped by selected category.${rangeSuffix}`, xLabel: humanizeFieldLabel(barGroupBy), yLabel: humanizeFieldLabel(yField), data };
}
