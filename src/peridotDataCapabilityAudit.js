/*
 * Peridot data capability audit helper.
 *
 * This module is intentionally pure and UI-agnostic. It inspects arbitrary
 * uploaded table rows and reports what the dataset appears able to support:
 * Inspector records, Search, point maps, route maps, networks, timelines,
 * charts, and export.
 *
 * It does not mutate uploaded data, clean researcher-entered values, geocode
 * places, or force a dataset into the existing correspondence schema.
 */

export const PERIDOT_FIELD_ROLES = Object.freeze({
  RECORD_LABEL: 'record_label',
  RECORD_TYPE: 'record_type',
  RECORD_ID: 'record_id',
  SOURCE_CITATION: 'source_citation',
  LINK: 'link',
  DATE: 'date',
  DATE_START: 'date_start',
  DATE_END: 'date_end',
  DATE_DISPLAY: 'date_display',
  DATE_SORT: 'date_sort',
  DATE_PRECISION: 'date_precision',
  POINT_PLACE: 'point_place',
  POINT_LATITUDE: 'point_latitude',
  POINT_LONGITUDE: 'point_longitude',
  POINT_COORDINATES: 'point_coordinates',
  SOURCE_ENTITY: 'source_entity',
  SOURCE_PLACE: 'source_place',
  SOURCE_LATITUDE: 'source_latitude',
  SOURCE_LONGITUDE: 'source_longitude',
  TARGET_ENTITY: 'target_entity',
  TARGET_PLACE: 'target_place',
  TARGET_LATITUDE: 'target_latitude',
  TARGET_LONGITUDE: 'target_longitude',
  RELATIONSHIP_TYPE: 'relationship_type',
  PERSON: 'person',
  INSTITUTION: 'institution',
  WORK: 'work',
  OBJECT: 'object',
  GROUP: 'group',
  CATEGORY: 'category',
  MEASURE: 'measure',
  SERIES: 'series',
  LONG_TEXT: 'long_text',
  BOOLEAN_FLAG: 'boolean_flag',
});

export const PERIDOT_CAPABILITY_FLAGS = Object.freeze({
  INSPECTOR_READY: 'inspectorReady',
  SEARCH_READY: 'searchReady',
  POINT_MAP_READY: 'pointMapReady',
  ROUTE_MAP_READY: 'routeMapReady',
  NETWORK_READY: 'networkReady',
  TIMELINE_READY: 'timelineReady',
  CHART_READY: 'chartReady',
  EXPORT_READY: 'exportReady',
});

export const PERIDOT_RECORD_SHAPES = Object.freeze({
  DIRECTED_RELATIONSHIP: 'directedRelationship',
  POINT_SITE: 'pointSite',
  TIME_SERIES_MEASUREMENT: 'timeSeriesMeasurement',
  GENERIC_EVIDENCE: 'genericEvidence',
});

const ROLE = PERIDOT_FIELD_ROLES;
const CAPABILITY = PERIDOT_CAPABILITY_FLAGS;

const EARLIEST_REASONABLE_YEAR = 500;
const LATEST_REASONABLE_YEAR = 2200;
const MAX_CATEGORICAL_UNIQUE_VALUES = 80;
const LONG_TEXT_AVERAGE_LENGTH = 80;
const LONG_TEXT_MAX_LENGTH = 180;

const ROLE_PATTERNS = [
  { role: ROLE.SOURCE_LATITUDE, patterns: [/^source.*lat/i, /^sender.*lat/i, /^origin.*lat/i, /^from.*lat/i] },
  { role: ROLE.SOURCE_LONGITUDE, patterns: [/^source.*lon/i, /^source.*long/i, /^sender.*lon/i, /^origin.*lon/i, /^from.*lon/i] },
  { role: ROLE.TARGET_LATITUDE, patterns: [/^target.*lat/i, /^recipient.*lat/i, /^destination.*lat/i, /^to.*lat/i] },
  { role: ROLE.TARGET_LONGITUDE, patterns: [/^target.*lon/i, /^target.*long/i, /^recipient.*lon/i, /^destination.*lon/i, /^to.*lon/i] },
  { role: ROLE.POINT_LATITUDE, patterns: [/^lat$/i, /^latitude$/i, /\blatitude\b/i] },
  { role: ROLE.POINT_LONGITUDE, patterns: [/^lon$/i, /^lng$/i, /^long$/i, /^longitude$/i, /\blongitude\b/i] },
  { role: ROLE.POINT_COORDINATES, patterns: [/^coordinates?$/i, /^coord/i, /lat.*lon/i, /lon.*lat/i, /coordinate pair/i] },
  { role: ROLE.SOURCE_ENTITY, patterns: [/^source(_|\s|-)?name$/i, /^source$/i, /^sender$/i, /^author$/i, /^from person$/i, /^source entity$/i] },
  { role: ROLE.TARGET_ENTITY, patterns: [/^target(_|\s|-)?name$/i, /^target$/i, /^recipient$/i, /^addressee$/i, /^to person$/i, /^target entity$/i] },
  { role: ROLE.SOURCE_PLACE, patterns: [/^source(_|\s|-)?location$/i, /^source.*place$/i, /^origin$/i, /^from place$/i, /^sender.*place$/i] },
  { role: ROLE.TARGET_PLACE, patterns: [/^target(_|\s|-)?location$/i, /^target.*place$/i, /^destination$/i, /^to place$/i, /^recipient.*place$/i] },
  { role: ROLE.DATE_START, patterns: [/^date start$/i, /^start date$/i, /^start$/i, /^date_begin$/i, /^begin/i, /^from date$/i, /^start year$/i] },
  { role: ROLE.DATE_END, patterns: [/^end date$/i, /^date end$/i, /^end$/i, /^date_finish$/i, /^finish/i, /^to date$/i, /^end year$/i] },
  { role: ROLE.DATE, patterns: [/^date\b/i, /letter date/i, /event date/i, /record date/i] },
  { role: ROLE.DATE_DISPLAY, patterns: [/display date/i, /date display/i, /uncertain date/i] },
  { role: ROLE.DATE_SORT, patterns: [/sort date/i, /date sort/i, /sortable date/i] },
  { role: ROLE.DATE_PRECISION, patterns: [/date precision/i, /precision/i] },
  { role: ROLE.RECORD_LABEL, patterns: [/^name$/i, /^title$/i, /name of site/i, /site name/i, /item label/i, /record label/i, /^label$/i] },
  { role: ROLE.RECORD_TYPE, patterns: [/record type/i, /^type$/i, /^genre$/i, /^format$/i] },
  { role: ROLE.RECORD_ID, patterns: [/^id$/i, /record id/i, /item id/i, /accession/i, /catalog/i, /catalogue/i, /identifier/i, /number$/i] },
  { role: ROLE.SOURCE_CITATION, patterns: [/^source$/i, /citation/i, /archive/i, /collection/i, /repository/i, /page/i, /folio/i] },
  { role: ROLE.LINK, patterns: [/^link/i, /^url/i, /uri/i, /digital/i, /image link/i] },
  { role: ROLE.RELATIONSHIP_TYPE, patterns: [/relationship/i, /relation/i, /edge type/i, /action/i] },
  { role: ROLE.PERSON, patterns: [/person/i, /people/i, /traveler/i, /owner/i, /member/i] },
  { role: ROLE.INSTITUTION, patterns: [/institution/i, /department/i, /company/i, /publisher/i, /printer/i, /archive/i, /office/i] },
  { role: ROLE.WORK, patterns: [/work/i, /book/i, /text/i, /publication/i, /cited/i] },
  { role: ROLE.OBJECT, patterns: [/object/i, /artifact/i, /artefact/i, /manuscript/i, /item/i] },
  { role: ROLE.GROUP, patterns: [/group/i, /order/i, /community/i, /affiliation/i] },
  { role: ROLE.MEASURE, patterns: [/magnitude/i, /price/i, /value/i, /count/i, /amount/i, /quantity/i, /total/i, /measure/i, /score/i, /rate/i] },
  { role: ROLE.SERIES, patterns: [/series/i, /company/i, /commodity/i] },
  { role: ROLE.BOOLEAN_FLAG, patterns: [/\?$/i, /^is /i, /^has /i, /flag/i] },
  { role: ROLE.LONG_TEXT, patterns: [/transcription/i, /translation/i, /notes?/i, /description/i, /abstract/i, /summary/i, /comment/i] },
  { role: ROLE.CATEGORY, patterns: [/category/i, /department/i, /reason/i, /language/i, /topic/i, /genre/i, /type/i, /status/i] },
];

function normalizeHeader(header) {
  return String(header ?? '')
    .trim()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

function normalizeTextValue(value) {
  if (value === null || value === undefined) return '';
  return String(value).trim();
}

function isBlankValue(value) {
  return normalizeTextValue(value) === '';
}

function uniqueValues(values) {
  return Array.from(new Set(values));
}

function toFiniteNumber(value) {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }
  const raw = normalizeTextValue(value);
  if (!raw) return null;
  const cleaned = raw
    .replace(/[,$£€]/g, '')
    .replace(/%$/, '')
    .trim();
  if (!/^[-+]?\d*\.?\d+(e[-+]?\d+)?$/i.test(cleaned)) return null;
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

function excelSerialDateToUtcMs(serial) {
  if (!Number.isFinite(serial)) return null;
  const excelEpoch = Date.UTC(1899, 11, 30);
  return excelEpoch + Math.round(serial) * 24 * 60 * 60 * 1000;
}

function makeUtcDateMs(year, month = 1, day = 1) {
  return Date.UTC(year, month - 1, day);
}

function isReasonableYear(year) {
  return Number.isInteger(year) && year >= EARLIEST_REASONABLE_YEAR && year <= LATEST_REASONABLE_YEAR;
}

function makeTemporalResult({ display, startSort = null, endSort = null, startYear = null, endYear = null, precision = 'unknown', warnings = [] }) {
  return {
    display: normalizeTextValue(display),
    startSort,
    endSort: endSort ?? startSort,
    startYear,
    endYear: endYear ?? startYear,
    precision,
    hasRange: startSort !== null && endSort !== null && endSort !== startSort,
    isSortable: startSort !== null,
    warnings,
  };
}

export function parsePeridotTemporalValue(value, options = {}) {
  const { allowExcelSerialDates = true } = options;
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    const year = value.getUTCFullYear();
    return makeTemporalResult({
      display: value.toISOString().slice(0, 10),
      startSort: Date.UTC(year, value.getUTCMonth(), value.getUTCDate()),
      startYear: year,
      precision: 'exact',
    });
  }

  if (typeof value === 'number' && allowExcelSerialDates && value > 1 && value < 100000) {
    const startSort = excelSerialDateToUtcMs(value);
    const year = new Date(startSort).getUTCFullYear();
    return makeTemporalResult({
      display: String(value),
      startSort,
      startYear: year,
      precision: 'exact',
    });
  }

  const raw = normalizeTextValue(value);
  if (!raw) return makeTemporalResult({ display: raw, precision: 'unknown' });

  if (/^(s\.?d\.?|n\.?d\.?|unknown|undated|no date|null|na|n\/a)$/i.test(raw)) {
    return makeTemporalResult({ display: raw, precision: 'unknown' });
  }

  if (/^0{4}([/-]0{2}){0,2}$/.test(raw)) {
    return makeTemporalResult({
      display: raw,
      precision: 'invalid',
      warnings: ['Date value is preserved as evidence but is not sortable.'],
    });
  }

  const circaMatch = raw.match(/^(?:c\.?|ca\.?|circa)\s*(\d{3,4})$/i);
  if (circaMatch) {
    const year = Number(circaMatch[1]);
    if (isReasonableYear(year)) {
      return makeTemporalResult({
        display: raw,
        startSort: makeUtcDateMs(year, 1, 1),
        endSort: makeUtcDateMs(year, 12, 31),
        startYear: year,
        endYear: year,
        precision: 'circa',
      });
    }
  }

  const rangeMatch = raw.match(/^(\d{3,4})(?:\s*[-–—]\s*)(\d{3,4})$/);
  if (rangeMatch) {
    const startYear = Number(rangeMatch[1]);
    const endYear = Number(rangeMatch[2]);
    if (isReasonableYear(startYear) && isReasonableYear(endYear) && endYear >= startYear) {
      return makeTemporalResult({
        display: raw,
        startSort: makeUtcDateMs(startYear, 1, 1),
        endSort: makeUtcDateMs(endYear, 12, 31),
        startYear,
        endYear,
        precision: 'range',
      });
    }
  }

  const isoMatch = raw.match(/^(\d{3,4})[-/](\d{1,2})[-/](\d{1,2})$/);
  if (isoMatch) {
    const year = Number(isoMatch[1]);
    const month = Number(isoMatch[2]);
    const day = Number(isoMatch[3]);
    if (isReasonableYear(year) && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return makeTemporalResult({
        display: raw,
        startSort: makeUtcDateMs(year, month, day),
        startYear: year,
        precision: 'exact',
      });
    }
  }

  const slashMatch = raw.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{3,4})$/);
  if (slashMatch) {
    const month = Number(slashMatch[1]);
    const day = Number(slashMatch[2]);
    const year = Number(slashMatch[3]);
    if (isReasonableYear(year) && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return makeTemporalResult({
        display: raw,
        startSort: makeUtcDateMs(year, month, day),
        startYear: year,
        precision: 'exact',
      });
    }
  }

  const yearMonthMatch = raw.match(/^(\d{3,4})[-/](\d{1,2})$/);
  if (yearMonthMatch) {
    const year = Number(yearMonthMatch[1]);
    const month = Number(yearMonthMatch[2]);
    if (isReasonableYear(year) && month >= 1 && month <= 12) {
      const endDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
      return makeTemporalResult({
        display: raw,
        startSort: makeUtcDateMs(year, month, 1),
        endSort: makeUtcDateMs(year, month, endDay),
        startYear: year,
        endYear: year,
        precision: 'month',
      });
    }
  }

  const yearOnlyMatch = raw.match(/^(\d{3,4})$/);
  if (yearOnlyMatch) {
    const year = Number(yearOnlyMatch[1]);
    if (isReasonableYear(year)) {
      return makeTemporalResult({
        display: raw,
        startSort: makeUtcDateMs(year, 1, 1),
        endSort: makeUtcDateMs(year, 12, 31),
        startYear: year,
        endYear: year,
        precision: 'year',
      });
    }
  }

  return makeTemporalResult({
    display: raw,
    precision: 'invalid',
    warnings: ['Date value is preserved as evidence but is not currently sortable.'],
  });
}

export function parsePeridotCoordinatePair(value) {
  const raw = normalizeTextValue(value);
  if (!raw) return null;

  const pointMatch = raw.match(/^point\s*\(\s*([-+]?\d*\.?\d+)\s+([-+]?\d*\.?\d+)\s*\)$/i);
  if (pointMatch) {
    const longitude = Number(pointMatch[1]);
    const latitude = Number(pointMatch[2]);
    return isValidCoordinate(latitude, longitude) ? { latitude, longitude, format: 'wktPoint' } : null;
  }

  const numericParts = raw.match(/[-+]?\d*\.?\d+/g);
  if (!numericParts || numericParts.length < 2) return null;

  const first = Number(numericParts[0]);
  const second = Number(numericParts[1]);
  if (isValidCoordinate(first, second)) {
    return { latitude: first, longitude: second, format: 'latLongPair' };
  }
  if (isValidCoordinate(second, first)) {
    return { latitude: second, longitude: first, format: 'longLatPair' };
  }
  return null;
}

export function isValidCoordinate(latitude, longitude) {
  return Number.isFinite(latitude)
    && Number.isFinite(longitude)
    && latitude >= -90
    && latitude <= 90
    && longitude >= -180
    && longitude <= 180;
}

function inferRolesFromHeader(header) {
  const normalized = normalizeHeader(header);
  if (!normalized) return [];
  const roles = [];
  for (const { role, patterns } of ROLE_PATTERNS) {
    if (patterns.some((pattern) => pattern.test(normalized))) {
      roles.push(role);
    }
  }
  return uniqueValues(roles);
}

function normalizeManualRoleMap(fieldRoleMap = {}) {
  const roleToHeaders = new Map();
  Object.entries(fieldRoleMap).forEach(([role, headers]) => {
    if (!role || headers === null || headers === undefined) return;
    const headerList = Array.isArray(headers) ? headers : [headers];
    roleToHeaders.set(role, headerList.map((header) => String(header)));
  });
  return roleToHeaders;
}

function buildFieldSummaries(rows, headers, options) {
  const manualRoleMap = normalizeManualRoleMap(options.fieldRoleMap);
  const manualRolesByHeader = new Map();
  manualRoleMap.forEach((headerList, role) => {
    headerList.forEach((header) => {
      const key = String(header);
      if (!manualRolesByHeader.has(key)) manualRolesByHeader.set(key, []);
      manualRolesByHeader.get(key).push(role);
    });
  });

  return headers.map((header) => {
    const values = rows.map((row) => row?.[header]);
    const filledValues = values.filter((value) => !isBlankValue(value));
    const textValues = filledValues.map(normalizeTextValue);
    const numericValues = filledValues.map(toFiniteNumber).filter((value) => value !== null);
    const initialRoles = uniqueValues([...(manualRolesByHeader.get(header) || []), ...inferRolesFromHeader(header)]);
    const headerHasTemporalRole = initialRoles.some((role) => [ROLE.DATE, ROLE.DATE_START, ROLE.DATE_END, ROLE.DATE_SORT, ROLE.DATE_DISPLAY].includes(role));
    const temporalValues = filledValues.map((value) => parsePeridotTemporalValue(value, { allowExcelSerialDates: headerHasTemporalRole }));
    const sortableTemporalValues = temporalValues.filter((value) => value.isSortable);
    const coordinateValues = filledValues.map(parsePeridotCoordinatePair).filter(Boolean);
    const inferredRoles = inferRolesFromHeader(header);
    const manualRoles = manualRolesByHeader.get(header) || [];
    const roles = uniqueValues([...manualRoles, ...inferredRoles]);
    const avgTextLength = textValues.length
      ? textValues.reduce((sum, value) => sum + value.length, 0) / textValues.length
      : 0;
    const maxTextLength = textValues.length
      ? Math.max(...textValues.map((value) => value.length))
      : 0;
    const uniqueNonBlankValues = uniqueValues(textValues);

    const numericRatio = filledValues.length ? numericValues.length / filledValues.length : 0;
    const temporalRatio = filledValues.length ? sortableTemporalValues.length / filledValues.length : 0;
    const coordinateRatio = filledValues.length ? coordinateValues.length / filledValues.length : 0;
    const uniqueRatio = filledValues.length ? uniqueNonBlankValues.length / filledValues.length : 0;

    const appearsLongText = avgTextLength >= LONG_TEXT_AVERAGE_LENGTH || maxTextLength >= LONG_TEXT_MAX_LENGTH;
    const appearsNumeric = numericRatio >= 0.65 && !roles.includes(ROLE.RECORD_ID);
    const appearsTemporal = temporalRatio >= 0.65 || roles.some((role) => [ROLE.DATE, ROLE.DATE_START, ROLE.DATE_END, ROLE.DATE_SORT].includes(role));
    const appearsCoordinatePair = coordinateRatio >= 0.65 || roles.includes(ROLE.POINT_COORDINATES);
    const appearsCategorical = filledValues.length > 0
      && uniqueNonBlankValues.length <= MAX_CATEGORICAL_UNIQUE_VALUES
      && uniqueRatio <= 0.75
      && !appearsLongText
      && !appearsCoordinatePair
      && !appearsNumeric
      && !isCoordinateOrDateRole(roles);

    const enrichedRoles = [...roles];
    if (appearsLongText && !enrichedRoles.includes(ROLE.LONG_TEXT)) enrichedRoles.push(ROLE.LONG_TEXT);
    if (appearsNumeric && !enrichedRoles.includes(ROLE.MEASURE)) enrichedRoles.push(ROLE.MEASURE);
    if (appearsCategorical && !enrichedRoles.includes(ROLE.CATEGORY)) enrichedRoles.push(ROLE.CATEGORY);

    return {
      header,
      normalizedHeader: normalizeHeader(header),
      roles: uniqueValues(enrichedRoles),
      inferredRoles,
      manualRoles,
      filledCount: filledValues.length,
      blankCount: values.length - filledValues.length,
      uniqueCount: uniqueNonBlankValues.length,
      sampleValues: uniqueNonBlankValues.slice(0, 8),
      numeric: {
        count: numericValues.length,
        ratio: numericRatio,
        min: numericValues.length ? Math.min(...numericValues) : null,
        max: numericValues.length ? Math.max(...numericValues) : null,
        appearsNumeric,
      },
      temporal: {
        count: sortableTemporalValues.length,
        ratio: temporalRatio,
        appearsTemporal,
        precisions: uniqueValues(temporalValues.map((value) => value.precision)).filter(Boolean),
      },
      coordinates: {
        count: coordinateValues.length,
        ratio: coordinateRatio,
        appearsCoordinatePair,
      },
      text: {
        averageLength: avgTextLength,
        maxLength: maxTextLength,
        appearsLongText,
      },
      categorical: {
        appearsCategorical,
        uniqueRatio,
      },
    };
  });
}

function headersForRole(fieldSummaries, role) {
  return fieldSummaries.filter((field) => field.roles.includes(role)).map((field) => field.header);
}

function firstValueForRoles(row, roleHeaders) {
  for (const header of roleHeaders) {
    const value = row?.[header];
    if (!isBlankValue(value)) return value;
  }
  return null;
}

function coordinateFromSeparateFields(row, latHeaders, longHeaders) {
  const lat = toFiniteNumber(firstValueForRoles(row, latHeaders));
  const long = toFiniteNumber(firstValueForRoles(row, longHeaders));
  if (!isValidCoordinate(lat, long)) return null;
  return { latitude: lat, longitude: long, format: 'separateLatitudeLongitude' };
}

function coordinateFromCombinedField(row, coordinateHeaders) {
  for (const header of coordinateHeaders) {
    const parsed = parsePeridotCoordinatePair(row?.[header]);
    if (parsed) return parsed;
  }
  return null;
}

function temporalFromRow(row, roleHeaders) {
  const singleValue = firstValueForRoles(row, roleHeaders.dateHeaders);
  const startValue = firstValueForRoles(row, roleHeaders.dateStartHeaders);
  const endValue = firstValueForRoles(row, roleHeaders.dateEndHeaders);
  const displayValue = firstValueForRoles(row, roleHeaders.dateDisplayHeaders);

  if (!isBlankValue(startValue) || !isBlankValue(endValue)) {
    const start = parsePeridotTemporalValue(startValue ?? displayValue);
    const end = parsePeridotTemporalValue(endValue ?? startValue ?? displayValue);
    const display = normalizeTextValue(displayValue || [startValue, endValue].filter((value) => !isBlankValue(value)).join(' – '));
    const isSortable = start.isSortable || end.isSortable;
    return {
      display,
      startSort: start.startSort ?? end.startSort,
      endSort: end.endSort ?? start.endSort ?? start.startSort,
      startYear: start.startYear ?? end.startYear,
      endYear: end.endYear ?? start.endYear ?? start.startYear,
      precision: start.isSortable && end.isSortable && (start.startSort !== end.endSort) ? 'range' : (start.precision || end.precision),
      hasRange: Boolean(start.isSortable && end.isSortable && (start.startSort !== end.endSort)),
      isSortable,
      warnings: [...(start.warnings || []), ...(end.warnings || [])],
    };
  }

  if (!isBlankValue(singleValue)) {
    return parsePeridotTemporalValue(singleValue);
  }

  if (!isBlankValue(displayValue)) {
    return parsePeridotTemporalValue(displayValue);
  }

  return makeTemporalResult({ display: '', precision: 'unknown' });
}

function auditRow(row, index, roleHeaders, fieldSummaries) {
  const sourceEntity = firstValueForRoles(row, roleHeaders.sourceEntityHeaders);
  const targetEntity = firstValueForRoles(row, roleHeaders.targetEntityHeaders);
  const sourcePlace = firstValueForRoles(row, roleHeaders.sourcePlaceHeaders);
  const targetPlace = firstValueForRoles(row, roleHeaders.targetPlaceHeaders);
  const pointPlace = firstValueForRoles(row, roleHeaders.pointPlaceHeaders);
  const recordLabel = firstValueForRoles(row, roleHeaders.recordLabelHeaders);
  const sourceCitation = firstValueForRoles(row, roleHeaders.sourceCitationHeaders);
  const relationshipType = firstValueForRoles(row, roleHeaders.relationshipTypeHeaders);

  const pointCoordinate = coordinateFromSeparateFields(row, roleHeaders.pointLatitudeHeaders, roleHeaders.pointLongitudeHeaders)
    || coordinateFromCombinedField(row, roleHeaders.pointCoordinateHeaders);
  const sourceCoordinate = coordinateFromSeparateFields(row, roleHeaders.sourceLatitudeHeaders, roleHeaders.sourceLongitudeHeaders);
  const targetCoordinate = coordinateFromSeparateFields(row, roleHeaders.targetLatitudeHeaders, roleHeaders.targetLongitudeHeaders);
  const temporal = temporalFromRow(row, roleHeaders);

  const filledHeaders = fieldSummaries
    .map((field) => field.header)
    .filter((header) => !isBlankValue(row?.[header]));
  const hasAnyValue = filledHeaders.length > 0;
  const hasEvidence = Boolean(recordLabel || sourceCitation || relationshipType || filledHeaders.length);
  const hasPointLocation = Boolean(pointCoordinate || pointPlace);
  const hasRouteLocation = Boolean((sourceCoordinate || sourcePlace) && (targetCoordinate || targetPlace));
  const hasNetworkRelationship = Boolean(sourceEntity && targetEntity);
  const hasTemporalValue = Boolean(temporal?.isSortable);

  const numericHeaders = fieldSummaries
    .filter((field) => field.numeric.appearsNumeric && !isCoordinateOrDateRole(field.roles))
    .map((field) => field.header)
    .filter((header) => toFiniteNumber(row?.[header]) !== null);
  const categoricalHeaders = fieldSummaries
    .filter((field) => field.categorical.appearsCategorical)
    .map((field) => field.header)
    .filter((header) => !isBlankValue(row?.[header]));

  const capabilities = {
    [CAPABILITY.INSPECTOR_READY]: hasEvidence,
    [CAPABILITY.SEARCH_READY]: hasAnyValue,
    [CAPABILITY.POINT_MAP_READY]: hasPointLocation,
    [CAPABILITY.ROUTE_MAP_READY]: hasRouteLocation,
    [CAPABILITY.NETWORK_READY]: hasNetworkRelationship,
    [CAPABILITY.TIMELINE_READY]: hasTemporalValue,
    [CAPABILITY.CHART_READY]: Boolean(numericHeaders.length || categoricalHeaders.length || hasTemporalValue),
    [CAPABILITY.EXPORT_READY]: hasAnyValue,
  };

  return {
    index,
    label: normalizeTextValue(recordLabel || sourceEntity || pointPlace || sourcePlace || sourceCitation || `Row ${index + 1}`),
    capabilities,
    temporal,
    locations: {
      point: pointCoordinate ? { ...pointCoordinate, place: normalizeTextValue(pointPlace) || null } : (pointPlace ? { place: normalizeTextValue(pointPlace) } : null),
      source: sourceCoordinate ? { ...sourceCoordinate, place: normalizeTextValue(sourcePlace) || null } : (sourcePlace ? { place: normalizeTextValue(sourcePlace) } : null),
      target: targetCoordinate ? { ...targetCoordinate, place: normalizeTextValue(targetPlace) || null } : (targetPlace ? { place: normalizeTextValue(targetPlace) } : null),
    },
    relationship: {
      sourceEntity: normalizeTextValue(sourceEntity) || null,
      targetEntity: normalizeTextValue(targetEntity) || null,
      type: normalizeTextValue(relationshipType) || null,
    },
    chartFields: {
      numeric: numericHeaders,
      categorical: categoricalHeaders,
    },
    filledHeaders,
  };
}

function isCoordinateOrDateRole(roles) {
  return roles.some((role) => [
    ROLE.DATE,
    ROLE.DATE_START,
    ROLE.DATE_END,
    ROLE.DATE_SORT,
    ROLE.DATE_DISPLAY,
    ROLE.DATE_PRECISION,
    ROLE.POINT_LATITUDE,
    ROLE.POINT_LONGITUDE,
    ROLE.POINT_COORDINATES,
    ROLE.SOURCE_LATITUDE,
    ROLE.SOURCE_LONGITUDE,
    ROLE.TARGET_LATITUDE,
    ROLE.TARGET_LONGITUDE,
  ].includes(role));
}

function summarizeCapabilityCounts(rowAudits) {
  const counts = Object.values(CAPABILITY).reduce((acc, capability) => {
    acc[capability] = 0;
    return acc;
  }, {});
  rowAudits.forEach((row) => {
    Object.entries(row.capabilities).forEach(([capability, enabled]) => {
      if (enabled) counts[capability] += 1;
    });
  });
  return counts;
}

function summarizeRecordShapes(rowAudits, fieldSummaries) {
  const capabilityCounts = summarizeCapabilityCounts(rowAudits);
  const totalRows = rowAudits.length || 1;
  const numericMeasureFields = fieldSummaries.filter((field) => field.numeric.appearsNumeric && !isCoordinateOrDateRole(field.roles));
  const temporalFields = fieldSummaries.filter((field) => field.temporal.appearsTemporal);

  return {
    [PERIDOT_RECORD_SHAPES.DIRECTED_RELATIONSHIP]: capabilityCounts.networkReady > 0 || capabilityCounts.routeMapReady > 0,
    [PERIDOT_RECORD_SHAPES.POINT_SITE]: capabilityCounts.pointMapReady > 0 && capabilityCounts.routeMapReady / totalRows < 0.5,
    [PERIDOT_RECORD_SHAPES.TIME_SERIES_MEASUREMENT]: temporalFields.length > 0 && numericMeasureFields.length >= 2,
    [PERIDOT_RECORD_SHAPES.GENERIC_EVIDENCE]: capabilityCounts.inspectorReady > 0 || capabilityCounts.searchReady > 0,
  };
}

function buildRoleHeaders(fieldSummaries) {
  return {
    recordLabelHeaders: headersForRole(fieldSummaries, ROLE.RECORD_LABEL),
    sourceCitationHeaders: headersForRole(fieldSummaries, ROLE.SOURCE_CITATION),
    relationshipTypeHeaders: headersForRole(fieldSummaries, ROLE.RELATIONSHIP_TYPE),
    dateHeaders: headersForRole(fieldSummaries, ROLE.DATE),
    dateStartHeaders: headersForRole(fieldSummaries, ROLE.DATE_START),
    dateEndHeaders: headersForRole(fieldSummaries, ROLE.DATE_END),
    dateDisplayHeaders: headersForRole(fieldSummaries, ROLE.DATE_DISPLAY),
    pointPlaceHeaders: headersForRole(fieldSummaries, ROLE.POINT_PLACE),
    pointLatitudeHeaders: headersForRole(fieldSummaries, ROLE.POINT_LATITUDE),
    pointLongitudeHeaders: headersForRole(fieldSummaries, ROLE.POINT_LONGITUDE),
    pointCoordinateHeaders: headersForRole(fieldSummaries, ROLE.POINT_COORDINATES),
    sourceEntityHeaders: headersForRole(fieldSummaries, ROLE.SOURCE_ENTITY),
    sourcePlaceHeaders: headersForRole(fieldSummaries, ROLE.SOURCE_PLACE),
    sourceLatitudeHeaders: headersForRole(fieldSummaries, ROLE.SOURCE_LATITUDE),
    sourceLongitudeHeaders: headersForRole(fieldSummaries, ROLE.SOURCE_LONGITUDE),
    targetEntityHeaders: headersForRole(fieldSummaries, ROLE.TARGET_ENTITY),
    targetPlaceHeaders: headersForRole(fieldSummaries, ROLE.TARGET_PLACE),
    targetLatitudeHeaders: headersForRole(fieldSummaries, ROLE.TARGET_LATITUDE),
    targetLongitudeHeaders: headersForRole(fieldSummaries, ROLE.TARGET_LONGITUDE),
  };
}

function summarizeDataset(rows, fieldSummaries, rowAudits) {
  const totalRows = rows.length;
  const capabilityCounts = summarizeCapabilityCounts(rowAudits);
  const capabilityPercentages = Object.fromEntries(
    Object.entries(capabilityCounts).map(([capability, count]) => [
      capability,
      totalRows ? count / totalRows : 0,
    ]),
  );
  const numericMeasureFields = fieldSummaries
    .filter((field) => field.numeric.appearsNumeric && !isCoordinateOrDateRole(field.roles))
    .map((field) => field.header);
  const categoricalFields = fieldSummaries
    .filter((field) => field.categorical.appearsCategorical)
    .map((field) => field.header);
  const temporalFields = fieldSummaries
    .filter((field) => field.temporal.appearsTemporal)
    .map((field) => field.header);
  const coordinateFields = fieldSummaries
    .filter((field) => field.coordinates.appearsCoordinatePair || field.roles.some((role) => [ROLE.POINT_LATITUDE, ROLE.POINT_LONGITUDE, ROLE.SOURCE_LATITUDE, ROLE.SOURCE_LONGITUDE, ROLE.TARGET_LATITUDE, ROLE.TARGET_LONGITUDE].includes(role)))
    .map((field) => field.header);

  return {
    totalRows,
    totalFields: fieldSummaries.length,
    capabilityCounts,
    capabilityPercentages,
    recordShapes: summarizeRecordShapes(rowAudits, fieldSummaries),
    fieldsByRole: Object.fromEntries(
      Object.values(ROLE).map((role) => [role, headersForRole(fieldSummaries, role)]),
    ),
    analytics: {
      numericMeasureFields,
      categoricalFields,
      temporalFields,
      coordinateFields,
      wideNumericSeriesLikely: temporalFields.length > 0 && numericMeasureFields.length >= 2,
    },
    warnings: buildDatasetWarnings(totalRows, capabilityCounts, fieldSummaries),
  };
}

function buildDatasetWarnings(totalRows, capabilityCounts, fieldSummaries) {
  const warnings = [];
  if (!totalRows) warnings.push('No rows were available for capability auditing.');
  if (totalRows && capabilityCounts.pointMapReady === 0 && capabilityCounts.routeMapReady === 0) {
    warnings.push('No map-ready point or route records were detected.');
  }
  if (totalRows && capabilityCounts.networkReady === 0) {
    warnings.push('No source-target entity relationships were detected for network views.');
  }
  if (totalRows && capabilityCounts.timelineReady === 0) {
    warnings.push('No sortable temporal values were detected for timeline or time-based filters.');
  }
  if (!fieldSummaries.some((field) => field.numeric.appearsNumeric && !isCoordinateOrDateRole(field.roles))) {
    warnings.push('No numeric measure fields were detected for quantitative charts.');
  }
  return warnings;
}

export function inferPeridotFieldRoles(headers = []) {
  return Object.fromEntries(
    headers.map((header) => [header, inferRolesFromHeader(header)]),
  );
}

export function auditPeridotDataCapabilities(rows = [], options = {}) {
  const safeRows = Array.isArray(rows) ? rows.filter(Boolean) : [];
  const explicitHeaders = Array.isArray(options.headers) ? options.headers : [];
  const detectedHeaders = uniqueValues(
    safeRows.flatMap((row) => Object.keys(row || {})),
  );
  const headers = explicitHeaders.length ? explicitHeaders : detectedHeaders;
  const fieldSummaries = buildFieldSummaries(safeRows, headers, options);
  const roleHeaders = buildRoleHeaders(fieldSummaries);
  const rowAudits = safeRows.map((row, index) => auditRow(row, index, roleHeaders, fieldSummaries));
  const dataset = summarizeDataset(safeRows, fieldSummaries, rowAudits);

  return {
    version: 1,
    generatedAt: new Date().toISOString(),
    fields: fieldSummaries,
    rows: rowAudits,
    dataset,
  };
}

export function createPeridotCapabilitySummary(audit) {
  const dataset = audit?.dataset;
  if (!dataset) return [];
  const total = dataset.totalRows || 0;
  const counts = dataset.capabilityCounts || {};
  return [
    `Rows audited: ${total}`,
    `Inspector-ready: ${counts.inspectorReady ?? 0} of ${total}`,
    `Search-ready: ${counts.searchReady ?? 0} of ${total}`,
    `Point-map-ready: ${counts.pointMapReady ?? 0} of ${total}`,
    `Route-map-ready: ${counts.routeMapReady ?? 0} of ${total}`,
    `Network-ready: ${counts.networkReady ?? 0} of ${total}`,
    `Timeline-ready: ${counts.timelineReady ?? 0} of ${total}`,
    `Chart-ready: ${counts.chartReady ?? 0} of ${total}`,
    `Numeric measure fields: ${dataset.analytics?.numericMeasureFields?.join(', ') || 'none detected'}`,
    `Categorical fields: ${dataset.analytics?.categoricalFields?.join(', ') || 'none detected'}`,
    `Temporal fields: ${dataset.analytics?.temporalFields?.join(', ') || 'none detected'}`,
  ];
}
