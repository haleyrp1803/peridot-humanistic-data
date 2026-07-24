/*
 * Reusable temporal assertion helpers for the canonical Peridot model.
 *
 * This module preserves original humanistic date values while exposing
 * conservative sortable bounds for exact dates, partial dates, ranges, and
 * common scholarly qualifiers. It does not replace the existing runtime date
 * parser during Pass 2A.
 */

export const PERIDOT_TEMPORAL_PRECISION = Object.freeze({
  DAY: 'day',
  MONTH: 'month',
  YEAR: 'year',
  RANGE: 'range',
  TEXT: 'text',
  UNKNOWN: 'unknown',
});

export const PERIDOT_TEMPORAL_QUALIFIER = Object.freeze({
  EXACT: 'exact',
  CIRCA: 'circa',
  BEFORE: 'before',
  AFTER: 'after',
  BETWEEN: 'between',
  UNCERTAIN: 'uncertain',
  UNKNOWN: 'unknown',
});

function asText(value) {
  return String(value ?? '').trim();
}

function isLeapYear(year) {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

function daysInMonth(year, month) {
  if (month === 2) return isLeapYear(year) ? 29 : 28;
  return [4, 6, 9, 11].includes(month) ? 30 : 31;
}

function validDateParts(year, month = null, day = null) {
  if (!Number.isInteger(year) || year < 1 || year > 9999) return false;
  if (month === null) return day === null;
  if (!Number.isInteger(month) || month < 1 || month > 12) return false;
  if (day === null) return true;
  return Number.isInteger(day) && day >= 1 && day <= daysInMonth(year, month);
}

function dateKey(year, month, day) {
  return year * 10000 + month * 100 + day;
}

function parseMachineDate(value) {
  const raw = asText(value).replace(/-/g, '/');
  const match = raw.match(/^(\d{1,4})(?:\/(\d{1,2}))?(?:\/(\d{1,2}))?$/);
  if (!match) return null;

  const year = Number(match[1]);
  const month = match[2] ? Number(match[2]) : null;
  const day = match[3] ? Number(match[3]) : null;
  if (!validDateParts(year, month, day)) return null;

  const startMonth = month ?? 1;
  const endMonth = month ?? 12;
  const startDay = day ?? 1;
  const endDay = day ?? daysInMonth(year, endMonth);
  const precision = day !== null
    ? PERIDOT_TEMPORAL_PRECISION.DAY
    : month !== null
      ? PERIDOT_TEMPORAL_PRECISION.MONTH
      : PERIDOT_TEMPORAL_PRECISION.YEAR;

  return Object.freeze({
    year,
    month,
    day,
    precision,
    startSort: dateKey(year, startMonth, startDay),
    endSort: dateKey(year, endMonth, endDay),
  });
}

function normalizeOriginalValues(values) {
  const source = values && typeof values === 'object' && !Array.isArray(values) ? values : {};
  return Object.freeze({ ...source });
}

export function makePeridotTemporalAssertion({
  display = '',
  start = null,
  end = null,
  precision = PERIDOT_TEMPORAL_PRECISION.UNKNOWN,
  qualifier = PERIDOT_TEMPORAL_QUALIFIER.UNKNOWN,
  certainty = 'unknown',
  calendar = 'gregorian-or-source-unspecified',
  sortBounds = {},
  originalValues = {},
  parseWarnings = [],
} = {}) {
  const startSort = Number(sortBounds?.start);
  const endSort = Number(sortBounds?.end);
  return Object.freeze({
    display: asText(display),
    start: start ? Object.freeze({ ...start }) : null,
    end: end ? Object.freeze({ ...end }) : null,
    precision: Object.values(PERIDOT_TEMPORAL_PRECISION).includes(precision) ? precision : PERIDOT_TEMPORAL_PRECISION.UNKNOWN,
    qualifier: Object.values(PERIDOT_TEMPORAL_QUALIFIER).includes(qualifier) ? qualifier : PERIDOT_TEMPORAL_QUALIFIER.UNKNOWN,
    certainty: asText(certainty) || 'unknown',
    calendar: asText(calendar) || 'gregorian-or-source-unspecified',
    sortBounds: Object.freeze({
      start: Number.isFinite(startSort) ? startSort : null,
      end: Number.isFinite(endSort) ? endSort : null,
    }),
    originalValues: normalizeOriginalValues(originalValues),
    parseWarnings: Object.freeze((Array.isArray(parseWarnings) ? parseWarnings : []).map(asText).filter(Boolean)),
  });
}

export function parsePeridotTemporalValue(rawValue, options = {}) {
  const raw = asText(rawValue);
  const unknownValues = new Set(['', '0', '0000', '0000/00/00', 'unknown', 'undated', 'n.d.']);
  if (unknownValues.has(raw.toLowerCase())) {
    return makePeridotTemporalAssertion({
      display: raw || 'Unknown date',
      qualifier: PERIDOT_TEMPORAL_QUALIFIER.UNKNOWN,
      originalValues: { raw: rawValue ?? '' },
    });
  }

  let qualifier = PERIDOT_TEMPORAL_QUALIFIER.EXACT;
  let certainty = 'certain';
  let candidate = raw;

  const qualifierPatterns = [
    [PERIDOT_TEMPORAL_QUALIFIER.CIRCA, /^(?:c\.?|ca\.?|circa)\s*/i],
    [PERIDOT_TEMPORAL_QUALIFIER.BEFORE, /^(?:before|pre)\s*/i],
    [PERIDOT_TEMPORAL_QUALIFIER.AFTER, /^(?:after|post)\s*/i],
  ];
  qualifierPatterns.some(([nextQualifier, pattern]) => {
    if (!pattern.test(candidate)) return false;
    qualifier = nextQualifier;
    certainty = nextQualifier === PERIDOT_TEMPORAL_QUALIFIER.CIRCA ? 'approximate' : 'bounded';
    candidate = candidate.replace(pattern, '').trim();
    return true;
  });

  if (/\?$/.test(candidate)) {
    qualifier = PERIDOT_TEMPORAL_QUALIFIER.UNCERTAIN;
    certainty = 'uncertain';
    candidate = candidate.replace(/\?+$/, '').trim();
  }

  const parsed = parseMachineDate(candidate);
  if (!parsed) {
    return makePeridotTemporalAssertion({
      display: raw,
      precision: PERIDOT_TEMPORAL_PRECISION.TEXT,
      qualifier,
      certainty,
      originalValues: { raw: rawValue },
      parseWarnings: ['Temporal value was preserved as text because Peridot could not parse conservative sortable bounds.'],
    });
  }

  let startSort = parsed.startSort;
  let endSort = parsed.endSort;
  if (qualifier === PERIDOT_TEMPORAL_QUALIFIER.BEFORE) startSort = null;
  if (qualifier === PERIDOT_TEMPORAL_QUALIFIER.AFTER) endSort = null;

  return makePeridotTemporalAssertion({
    display: raw,
    start: { year: parsed.year, month: parsed.month, day: parsed.day },
    end: { year: parsed.year, month: parsed.month, day: parsed.day },
    precision: parsed.precision,
    qualifier,
    certainty,
    calendar: options.calendar,
    sortBounds: { start: startSort, end: endSort },
    originalValues: { raw: rawValue },
  });
}

export function parsePeridotTemporalRange({ startValue = '', endValue = '', displayValue = '', calendar } = {}) {
  const start = parsePeridotTemporalValue(startValue, { calendar });
  const end = parsePeridotTemporalValue(endValue, { calendar });
  const hasStart = start.sortBounds.start !== null || start.sortBounds.end !== null;
  const hasEnd = end.sortBounds.start !== null || end.sortBounds.end !== null;
  const display = asText(displayValue)
    || (asText(startValue) && asText(endValue) ? `${asText(startValue)}–${asText(endValue)}` : asText(startValue) || asText(endValue));

  if (!hasStart && !hasEnd) {
    return makePeridotTemporalAssertion({
      display,
      precision: display ? PERIDOT_TEMPORAL_PRECISION.TEXT : PERIDOT_TEMPORAL_PRECISION.UNKNOWN,
      qualifier: PERIDOT_TEMPORAL_QUALIFIER.UNKNOWN,
      calendar,
      originalValues: { startValue, endValue, displayValue },
      parseWarnings: [...start.parseWarnings, ...end.parseWarnings],
    });
  }

  const startBound = hasStart ? (start.sortBounds.start ?? start.sortBounds.end) : null;
  const endBound = hasEnd ? (end.sortBounds.end ?? end.sortBounds.start) : null;
  const warnings = [...start.parseWarnings, ...end.parseWarnings];
  if (startBound !== null && endBound !== null && startBound > endBound) {
    warnings.push('Temporal range start occurs after its end.');
  }

  return makePeridotTemporalAssertion({
    display,
    start: start.start,
    end: end.end,
    precision: PERIDOT_TEMPORAL_PRECISION.RANGE,
    qualifier: PERIDOT_TEMPORAL_QUALIFIER.BETWEEN,
    certainty: 'bounded',
    calendar,
    sortBounds: { start: startBound, end: endBound },
    originalValues: { startValue, endValue, displayValue },
    parseWarnings: warnings,
  });
}

export function isPeridotTemporalSortable(temporalAssertion) {
  return Number.isFinite(temporalAssertion?.sortBounds?.start)
    || Number.isFinite(temporalAssertion?.sortBounds?.end);
}
