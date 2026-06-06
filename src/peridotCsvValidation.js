/**
 * Peridot CSV validation summary helper.
 *
 * Pass 3 scope:
 * - produce a user-facing validation/capability report for parsed rows from
 *   the standardized one-file Peridot CSV template;
 * - keep the helper pure and unmounted: no UI popup, no upload wiring, no
 *   Data Inputs redesign, and no legacy upload removal yet;
 * - use the Pass 1 schema/capability rules as the source of truth.
 *
 * Product rule:
 * Peridot should accept historically messy data as a database first, then tell
 * users which records can support which visualization tools. Missing dates,
 * missing coordinates, and unstandardized values should be reported clearly,
 * not silently cleaned or discarded.
 */

import {
  PERIDOT_TEMPLATE_COLUMNS,
  PERIDOT_ROW_CAPABILITIES,
  PERIDOT_VALIDATION_SUMMARY_COPY,
  getMissingPeridotTemplateColumns,
  getPeridotDateCapability,
  getPeridotRowCapabilities,
  hasCoordinatePair,
  hasEndpointPlaceInformation,
  hasPersonPair,
  hasPlacePair,
  hasValue,
  isAcceptedPeridotRecord,
  isValidLatitude,
  isValidLongitude,
} from './peridotCsvSchema.js';

function asText(value) {
  return String(value ?? '').trim();
}

function rowNumberFromIndex(index) {
  // Header row is row 1, so the first data row is spreadsheet row 2.
  return index + 2;
}

function makeWarning(code, label, rowNumbers, message) {
  return Object.freeze({
    code,
    label,
    count: rowNumbers.length,
    rowNumbers: Object.freeze(rowNumbers),
    message,
  });
}

function hasSourceCoordinateValue(row) {
  return hasValue(row?.Source_Latitude) || hasValue(row?.Source_Longitude);
}

function hasTargetCoordinateValue(row) {
  return hasValue(row?.Target_Latitude) || hasValue(row?.Target_Longitude);
}

function hasPointCoordinateValue(row) {
  return hasValue(row?.Point_Latitude) || hasValue(row?.Point_Longitude) || hasValue(row?.Point_Coordinates);
}

function hasRouteCoordinatePairValue(row) {
  return hasValue(row?.Source_Coordinates) || hasValue(row?.Target_Coordinates);
}

function hasAnyCoordinateValue(row) {
  return hasSourceCoordinateValue(row) || hasTargetCoordinateValue(row) || hasPointCoordinateValue(row) || hasRouteCoordinatePairValue(row);
}

function hasCompleteSourceCoordinates(row) {
  return hasCoordinatePair(row, 'Source_Latitude', 'Source_Longitude');
}

function hasCompleteTargetCoordinates(row) {
  return hasCoordinatePair(row, 'Target_Latitude', 'Target_Longitude');
}

function hasInvalidSourceCoordinates(row) {
  const hasLat = hasValue(row?.Source_Latitude);
  const hasLon = hasValue(row?.Source_Longitude);

  if (!hasLat && !hasLon) return false;
  return !isValidLatitude(row?.Source_Latitude) || !isValidLongitude(row?.Source_Longitude);
}

function hasInvalidTargetCoordinates(row) {
  const hasLat = hasValue(row?.Target_Latitude);
  const hasLon = hasValue(row?.Target_Longitude);

  if (!hasLat && !hasLon) return false;
  return !isValidLatitude(row?.Target_Latitude) || !isValidLongitude(row?.Target_Longitude);
}

function getRowTemporalCapability(row) {
  return getPeridotDateCapability(row);
}

function hasMachineReadableDateValue(row) {
  return getRowTemporalCapability(row).timelineReady;
}

function describeRows(rowNumbers, maxShown = 8) {
  if (!rowNumbers.length) return '';

  const shown = rowNumbers.slice(0, maxShown).join(', ');
  const remaining = rowNumbers.length - Math.min(rowNumbers.length, maxShown);

  if (remaining <= 0) return `Rows ${shown}`;
  return `Rows ${shown}, and ${remaining} more`;
}

function countCapability(capabilityRows, key) {
  return capabilityRows.filter((item) => item.capabilities[key]).length;
}

function collectRowNumbers(rowReports, predicate) {
  return rowReports
    .filter(predicate)
    .map((report) => report.rowNumber);
}

function buildCapabilityCounts(rowReports) {
  return Object.fromEntries(
    Object.keys(PERIDOT_ROW_CAPABILITIES).map((key) => [
      key,
      countCapability(rowReports, key),
    ])
  );
}

function buildTemporalCounts(rowReports) {
  const accepted = rowReports.filter((report) => report.accepted);
  const rangeReadyRows = accepted.filter((report) => report.temporal?.hasInterval);
  const closedRangeRows = accepted.filter((report) => report.temporal?.temporal?.rangeKind === 'closedRange');

  return Object.freeze({
    timelineReady: accepted.filter((report) => report.temporal?.timelineReady).length,
    intervalReady: rangeReadyRows.length,
    closedRangeReady: closedRangeRows.length,
    precisionCounts: Object.freeze(
      accepted.reduce((acc, report) => {
        const precision = report.temporal?.temporal?.precision || 'unknown';
        acc[precision] = (acc[precision] || 0) + 1;
        return acc;
      }, {})
    ),
  });
}

function buildWarnings(rowReports) {
  const accepted = rowReports.filter((report) => report.accepted);
  const unsupported = rowReports.filter((report) => !report.accepted);

  const unsupportedRows = unsupported.map((report) => report.rowNumber);

  const missingPersonPairRows = collectRowNumbers(
    accepted,
    (report) => !hasPersonPair(report.row)
  );

  const missingPlacePairRows = collectRowNumbers(
    accepted,
    (report) => !hasPlacePair(report.row)
  );

  const notMapReadyRows = collectRowNumbers(
    accepted,
    (report) => !report.capabilities.mapReady
  );

  const missingCoordinatesRows = collectRowNumbers(
    accepted,
    (report) =>
      !report.capabilities.mapReady &&
      (!hasCompleteSourceCoordinates(report.row) || !hasCompleteTargetCoordinates(report.row))
  );

  const invalidCoordinateRows = collectRowNumbers(
    accepted,
    (report) => hasInvalidSourceCoordinates(report.row) || hasInvalidTargetCoordinates(report.row)
  );

  const noCoordinateRows = collectRowNumbers(
    accepted,
    (report) => !hasAnyCoordinateValue(report.row)
  );

  const unparseableDateRows = collectRowNumbers(
    accepted,
    (report) => hasValue(report.row?.Date) && !hasMachineReadableDateValue(report.row)
  );

  const missingDateRows = collectRowNumbers(
    accepted,
    (report) => !hasValue(report.row?.Date)
  );

  const warnings = [];

  if (unsupportedRows.length) {
    warnings.push(
      makeWarning(
        'unsupported_rows',
        'Rows lacking minimum source/target information',
        unsupportedRows,
        `${describeRows(unsupportedRows)} do not have Source_Name + Target_Name or enough source/target place information to be accepted as Peridot records.`
      )
    );
  }

  if (missingPersonPairRows.length) {
    warnings.push(
      makeWarning(
        'missing_person_pairs',
        'Rows missing source/target names',
        missingPersonPairRows,
        `${describeRows(missingPersonPairRows)} are missing Source_Name and/or Target_Name and will not contribute to People view person-to-person relationships.`
      )
    );
  }

  if (missingPlacePairRows.length) {
    warnings.push(
      makeWarning(
        'missing_place_pairs',
        'Rows missing source/target place information',
        missingPlacePairRows,
        `${describeRows(missingPlacePairRows)} are missing source-side and/or target-side place information and will not contribute to place-based relationships.`
      )
    );
  }

  if (notMapReadyRows.length) {
    warnings.push(
      makeWarning(
        'not_map_ready',
        'Rows not mappable',
        notMapReadyRows,
        `${describeRows(notMapReadyRows)} do not have valid source and target coordinate pairs and will not appear as geographic map routes.`
      )
    );
  }

  if (missingCoordinatesRows.length) {
    warnings.push(
      makeWarning(
        'missing_coordinates',
        'Rows missing one or more coordinates',
        missingCoordinatesRows,
        `${describeRows(missingCoordinatesRows)} are missing one or more coordinates required for map rendering.`
      )
    );
  }

  if (invalidCoordinateRows.length) {
    warnings.push(
      makeWarning(
        'invalid_coordinates',
        'Rows with invalid coordinates',
        invalidCoordinateRows,
        `${describeRows(invalidCoordinateRows)} include coordinate values outside valid latitude/longitude ranges or incomplete coordinate pairs.`
      )
    );
  }

  if (noCoordinateRows.length) {
    warnings.push(
      makeWarning(
        'no_coordinates',
        'Rows with no coordinates',
        noCoordinateRows,
        `${describeRows(noCoordinateRows)} include no coordinate values. They can still be preserved where otherwise accepted, but they cannot be mapped.`
      )
    );
  }

  if (missingDateRows.length) {
    warnings.push(
      makeWarning(
        'missing_dates',
        'Rows missing dates',
        missingDateRows,
        `${describeRows(missingDateRows)} are missing Date values and will not participate in timeline playback.`
      )
    );
  }

  if (unparseableDateRows.length) {
    warnings.push(
      makeWarning(
        'unparseable_dates',
        'Rows with unparseable dates',
        unparseableDateRows,
        `${describeRows(unparseableDateRows)} have Date values that Peridot will preserve as entered but cannot use for timeline playback.`
      )
    );
  }

  return Object.freeze(warnings);
}

function buildSummaryLines({ totalRows, acceptedRecordCount, unsupportedRowCount, capabilityCounts, temporalCounts }) {
  return Object.freeze([
    `${PERIDOT_VALIDATION_SUMMARY_COPY.uploadAcceptedHeading}`,
    `Peridot reviewed ${totalRows} uploaded ${totalRows === 1 ? 'row' : 'rows'} and accepted ${acceptedRecordCount} ${acceptedRecordCount === 1 ? 'record' : 'records'}.`,
    `${capabilityCounts.inspectorReady} ${capabilityCounts.inspectorReady === 1 ? 'record is' : 'records are'} available in Inspector and Export where possible.`,
    `${capabilityCounts.peopleNetworkReady} ${capabilityCounts.peopleNetworkReady === 1 ? 'record can' : 'records can'} contribute to People view.`,
    `${capabilityCounts.placeNetworkReady} ${capabilityCounts.placeNetworkReady === 1 ? 'record can' : 'records can'} contribute to place-based relationships.`,
    `${capabilityCounts.mapReady} ${capabilityCounts.mapReady === 1 ? 'record is' : 'records are'} mappable with valid source and target coordinates.`,
    `${capabilityCounts.timelineReady} ${capabilityCounts.timelineReady === 1 ? 'record is' : 'records are'} timeline-ready as sortable dates or intervals${temporalCounts?.intervalReady ? `; ${temporalCounts.intervalReady} ${temporalCounts.intervalReady === 1 ? 'includes' : 'include'} temporal interval information` : ''}.`,
    `${capabilityCounts.analyticsReady} ${capabilityCounts.analyticsReady === 1 ? 'record is' : 'records are'} available to Analytics where fields are usable.`,
    unsupportedRowCount
      ? `${unsupportedRowCount} ${unsupportedRowCount === 1 ? 'row was' : 'rows were'} not accepted because minimum source/target information was missing.`
      : 'No rows were rejected by the minimum Peridot record rule.',
    PERIDOT_VALIDATION_SUMMARY_COPY.preservedRecordsNotice,
    PERIDOT_VALIDATION_SUMMARY_COPY.noCleaningNotice,
  ]);
}

function buildColumnWarnings(missingColumns) {
  if (!missingColumns.length) return Object.freeze([]);

  return Object.freeze([
    makeWarning(
      'missing_template_columns',
      'Missing template columns',
      [],
      `The uploaded CSV is missing ${missingColumns.length} expected ${missingColumns.length === 1 ? 'column' : 'columns'}: ${missingColumns.join(', ')}.`
    ),
  ]);
}

/**
 * Build row-level capability reports from parsed Peridot template rows.
 */
export function buildPeridotRowValidationReports(rows = []) {
  return rows.map((row, index) => {
    const capabilities = getPeridotRowCapabilities(row);
    const accepted = isAcceptedPeridotRecord(row);
    const temporal = getRowTemporalCapability(row);

    return Object.freeze({
      index,
      rowNumber: rowNumberFromIndex(index),
      row,
      accepted,
      capabilities,
      temporal,
      issues: Object.freeze({
        missingPersonPair: !hasPersonPair(row),
        missingPlacePair: !hasPlacePair(row),
        missingSourcePlaceInformation: !hasEndpointPlaceInformation(
          row,
          'Source_Location',
          'Source_Latitude',
          'Source_Longitude'
        ),
        missingTargetPlaceInformation: !hasEndpointPlaceInformation(
          row,
          'Target_Location',
          'Target_Latitude',
          'Target_Longitude'
        ),
        missingMapCoordinates: !capabilities.mapReady,
        invalidSourceCoordinates: hasInvalidSourceCoordinates(row),
        invalidTargetCoordinates: hasInvalidTargetCoordinates(row),
        missingDate: !hasValue(row?.Date),
        unparseableDate: hasValue(row?.Date) && !hasMachineReadableDateValue(row),
      }),
    });
  });
}

/**
 * Build a full upload validation summary for the future post-upload popup.
 *
 * headers should be the parsed CSV header row when available. If omitted, the
 * function infers headers from the first row object.
 */
export function buildPeridotCsvValidationSummary(rows = [], headers = null) {
  const inferredHeaders = headers || Object.keys(rows[0] || {});
  const missingColumns = getMissingPeridotTemplateColumns(inferredHeaders);
  const rowReports = buildPeridotRowValidationReports(rows);
  const acceptedRecordCount = rowReports.filter((report) => report.accepted).length;
  const unsupportedRowCount = rowReports.length - acceptedRecordCount;
  const capabilityCounts = buildCapabilityCounts(rowReports);
  const temporalCounts = buildTemporalCounts(rowReports);
  const rowWarnings = buildWarnings(rowReports);
  const columnWarnings = buildColumnWarnings(missingColumns);
  const warnings = Object.freeze([...columnWarnings, ...rowWarnings]);
  const summaryLines = buildSummaryLines({
    totalRows: rows.length,
    acceptedRecordCount,
    unsupportedRowCount,
    capabilityCounts,
    temporalCounts,
  });

  return Object.freeze({
    expectedColumns: PERIDOT_TEMPLATE_COLUMNS,
    providedColumns: Object.freeze(inferredHeaders.map((header) => String(header).trim())),
    missingColumns: Object.freeze(missingColumns),
    totalRows: rows.length,
    acceptedRecordCount,
    unsupportedRowCount,
    capabilityCounts: Object.freeze(capabilityCounts),
    temporalCounts,
    rowReports: Object.freeze(rowReports),
    warnings,
    summaryLines,
    hasBlockingColumnIssues: missingColumns.some((column) =>
      ['Source_Name', 'Target_Name', 'Source_Location', 'Source_Latitude', 'Source_Longitude', 'Target_Location', 'Target_Latitude', 'Target_Longitude'].includes(column)
    ),
    hasWarnings: warnings.length > 0,
    popup: Object.freeze({
      title: 'Upload summary',
      intro: summaryLines[1],
      capabilityLines: Object.freeze(summaryLines.slice(2, 8)),
      warningLines: Object.freeze(warnings.map((warning) => warning.message)),
      closingLines: Object.freeze(summaryLines.slice(9)),
    }),
  });
}

/**
 * Convert a validation summary into plain text. Useful for temporary tests and
 * for the later popup implementation.
 */
export function formatPeridotCsvValidationSummary(summary) {
  if (!summary) return '';

  const lines = [
    'Upload summary',
    '',
    ...summary.summaryLines,
  ];

  if (summary.missingColumns?.length) {
    lines.push('', `Missing columns: ${summary.missingColumns.join(', ')}`);
  }

  if (summary.warnings?.length) {
    lines.push('', 'Warnings:');
    summary.warnings.forEach((warning) => {
      lines.push(`- ${warning.message}`);
    });
  }

  return lines.join('\n');
}
