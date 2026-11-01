/*
 * Phase 1A — Timeline temporal presentation contract.
 *
 * This is a descriptive projection of the already-canonical temporal assertion.
 * It neither reparses user input nor alters Timeline geometry, playback, Evidence,
 * the persisted dataset, or researcher-supplied values. Coordinates continue
 * to be supplied by the established Timeline adapter until later visual passes.
 *
 * Peridot's position calculations use the modern proleptic Gregorian calendar.
 * Researchers normalize any historical-calendar dates before importing data;
 * Peridot does not convert Julian or other calendar systems automatically.
 */

const text = (value) => String(value ?? '').trim();
const numberOrNull = (value) => Number.isFinite(value) ? Number(value) : null;

function endpointDetails(endpoint) {
  if (!endpoint || typeof endpoint !== 'object') return null;
  const year = Number.isInteger(endpoint.year) ? endpoint.year : null;
  const month = Number.isInteger(endpoint.month) ? endpoint.month : null;
  const day = Number.isInteger(endpoint.day) ? endpoint.day : null;
  return Object.freeze({
    year, month, day,
    knownComponents: Object.freeze({
      year: year !== null,
      month: month !== null,
      day: day !== null,
    }),
    precision: text(endpoint.precision) || 'unknown',
    approximation: text(endpoint.approximation) || 'exact',
    sourceText: text(endpoint.sourceText),
    possibleBounds: Object.freeze({
      start: numberOrNull(endpoint.sortBounds?.start),
      end: numberOrNull(endpoint.sortBounds?.end),
    }),
  });
}

export function buildPeridotTimelineTemporalPresentation(assertion) {
  const source = assertion && typeof assertion === 'object' ? assertion : {};
  const shape = text(source.temporalShape) || 'unknown';
  const boundedness = text(source.boundedness) || 'closed';
  const consistency = text(source.consistency) || 'indeterminate';
  const parsingStatus = text(source.parsingStatus) || 'unrecognized';
  const start = endpointDetails(source.start);
  const end = endpointDetails(source.end);
  const isPeriod = ['interval', 'approximateInterval', 'partialInterval', 'openInterval', 'inconsistent'].includes(shape);
  const openStart = boundedness === 'openStart';
  const openEnd = boundedness === 'openEnd' || boundedness === 'ongoing';
  const isOpen = openStart || openEnd || shape === 'openInterval';
  const isPositionable = Boolean(source.visualizationUsability?.timelinePositionable)
    && consistency !== 'backwards';

  return Object.freeze({
    sourceText: text(source.sourceText),
    display: text(source.display),
    sourceCalendar: text(source.calendar) || 'gregorian-or-source-unspecified',
    coordinateCalendar: 'proleptic-gregorian',
    calendarConversionApplied: false,
    shape,
    kind: isPeriod ? 'period' : shape === 'unknown' ? 'unknown' : 'point',
    precision: text(source.precision) || 'unknown',
    qualifier: text(source.qualifier) || 'unknown',
    certainty: text(source.certainty) || 'not-specified',
    parsingStatus,
    consistency,
    boundedness,
    openStart,
    openEnd,
    ongoing: boundedness === 'ongoing',
    approximate: /approximate/i.test(shape)
      || ['circa', 'uncertain'].includes(text(source.qualifier))
      || [start, end].some((point) => point && point.approximation !== 'exact'),
    start,
    end,
    possibleWindow: Object.freeze({
      start: numberOrNull(source.sortBounds?.start),
      end: numberOrNull(source.sortBounds?.end),
      semantic: isPeriod ? 'asserted-period-bounds' : 'possible-occurrence-window',
    }),
    // A partial occurrence window must never be read as asserted event duration.
    // Open intervals have a period assertion, but no fully bounded duration.
    durationAsserted: isPeriod && !isOpen && consistency === 'valid' && Boolean(start && end),
    positionable: isPositionable,
    parseWarnings: Object.freeze(Array.isArray(source.parseWarnings) ? source.parseWarnings.map(text) : []),
  });
}
