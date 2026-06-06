/**
 * Peridot single-CSV data contract.
 *
 * This module records the agreed schema and capability model for the
 * standardized Peridot CSV upload workflow.
 *
 * Pass 1 scope:
 * - define the template column names;
 * - classify fields by purpose;
 * - document the minimum record rules;
 * - provide small pure helpers that later importer/validation passes can reuse;
 * - do not wire this file into the UI yet;
 * - do not remove the legacy three-file upload path yet.
 *
 * Product rule:
 * Peridot should behave as a database with strong visualization capabilities.
 * Messy or incomplete historical data should be accepted when it contains
 * enough source/target information to be a meaningful record. Rows that cannot
 * support a given visualization should be flagged for the user, not silently
 * discarded.
 *
 * Data-cleaning rule:
 * Peridot does not standardize person names, place names, dates, titles,
 * relationships, topics, languages, or controlled vocabularies. Users are
 * responsible for cleaning and standardizing their data outside the app.
 */

import { parsePeridotCoordinatePair, parsePeridotTemporalRange, parsePeridotTemporalValue } from './peridotDataCapabilityAudit.js';

/**
 * The public template column names are intentionally preserved exactly as
 * supplied in the current Peridot CSV template.
 */
export const PERIDOT_TEMPLATE_COLUMNS = Object.freeze([
  "Archive",
  "Collection",
  "Page(s)",
  "Date",
  "Source_Name",
  "Source_Title",
  "Source_Location",
  "Source_Latitude",
  "Source_Longitude",
  "Target_Name",
  "Target_Title",
  "Target_Location",
  "Target_Latitude",
  "Target_Longitude",
  "Relationship",
  "Topic",
  "Language",
  "Transcription",
  "Notes",
  "Link(s)",
]);

/**
 * Field groupings for user-facing documentation, validation summaries,
 * and later upload-page guidance.
 */
export const PERIDOT_FIELD_GROUPS = Object.freeze({
  networkLogic: Object.freeze({
    label: "Network logic",
    fields: Object.freeze(["Date", "Source_Name", "Target_Name"]),
    note:
      "These fields help Peridot build people, relationships, timelines, and correspondence edges when available.",
  }),

  mapping: Object.freeze({
    label: "Mapping",
    fields: Object.freeze([
      "Source_Location",
      "Source_Latitude",
      "Source_Longitude",
      "Target_Location",
      "Target_Latitude",
      "Target_Longitude",
    ]),
    note:
      "Coordinates are not required for upload, but rows need usable source and target coordinates to appear as mappable geographic routes.",
  }),

  recommendedResearchMetadata: Object.freeze({
    label: "Recommended research metadata",
    fields: Object.freeze([
      "Archive",
      "Collection",
      "Page(s)",
      "Source_Title",
      "Target_Title",
      "Relationship",
      "Topic",
      "Language",
    ]),
    note:
      "These fields make Inspector views, Analytics charts, Search & Filter, and exports more useful.",
  }),

  optionalRichMetadata: Object.freeze({
    label: "Optional rich metadata",
    fields: Object.freeze(["Transcription", "Notes", "Link(s)"]),
    note:
      "These fields support close reading, citation, documentation, and external-reference workflows.",
  }),
});

/**
 * Later validation should treat a row as an accepted Peridot record if it has
 * either:
 *
 * 1. source and target person names; or
 * 2. some source and target place information, where place information may be
 *    a place name, a coordinate pair, or both.
 *
 * Date and coordinates are capability-enabling fields, not admission criteria.
 */
export const PERIDOT_MINIMUM_RECORD_RULES = Object.freeze({
  acceptedRecord:
    "A row is accepted when it has either Source_Name + Target_Name, or source-side and target-side place information.",
  personPair: Object.freeze(["Source_Name", "Target_Name"]),
  sourcePlaceFields: Object.freeze([
    "Source_Location",
    "Source_Latitude",
    "Source_Longitude",
  ]),
  targetPlaceFields: Object.freeze([
    "Target_Location",
    "Target_Latitude",
    "Target_Longitude",
  ]),
});

/**
 * Capability labels used by the post-upload validation summary.
 *
 * A single row may support some capabilities and not others.
 * This makes incomplete data legible without rejecting it unnecessarily.
 */
export const PERIDOT_ROW_CAPABILITIES = Object.freeze({
  inspectorReady: Object.freeze({
    label: "Inspector-ready",
    note:
      "The row is accepted as a Peridot record and should remain available in Inspector and Export where possible.",
  }),

  peopleNetworkReady: Object.freeze({
    label: "People-network-ready",
    note:
      "The row has source and target names and can contribute to person-based graph views.",
  }),

  placeNetworkReady: Object.freeze({
    label: "Place-network-ready",
    note:
      "The row has source-side and target-side place information and can contribute to place-based relationship views.",
  }),

  pointMapReady: Object.freeze({
    label: "Point-map-ready",
    note:
      "The row has one valid point coordinate pair and can render as a point-location record.",
  }),

  routeMapReady: Object.freeze({
    label: "Route-map-ready",
    note:
      "The row has valid source and target coordinate pairs and can render as a geographic route.",
  }),

  mapReady: Object.freeze({
    label: "Map-ready",
    note:
      "The row has valid point coordinates or valid source and target coordinates for map rendering.",
  }),

  timelineReady: Object.freeze({
    label: "Timeline-ready",
    note:
      "The row has a date value or date range Peridot can parse for sorting, filtering, or playback.",
  }),

  analyticsReady: Object.freeze({
    label: "Analytics-ready",
    note:
      "The row has accepted metadata that Analytics may summarize exactly as entered.",
  }),

  exportReady: Object.freeze({
    label: "Export-ready",
    note:
      "The accepted uploaded row can be included in export workflows.",
  }),
});

/**
 * Column mapping from public template fields to the internal concepts later
 * importer passes should normalize toward.
 */
export const PERIDOT_TEMPLATE_TO_INTERNAL_MEANING = Object.freeze({
  Source_Name: "source correspondent",
  Target_Name: "target correspondent",
  Source_Location: "source place",
  Target_Location: "target/inferred target place",
  Source_Latitude: "source latitude",
  Source_Longitude: "source longitude",
  Target_Latitude: "target latitude",
  Target_Longitude: "target longitude",
  Date: "sortable/displayable correspondence date when parseable",
  Relationship: "relationship metadata",
  Topic: "topic metadata",
  Language: "language metadata",
  Archive: "citation/provenance metadata",
  Collection: "citation/provenance metadata",
  "Page(s)": "citation/provenance metadata",
  Source_Title: "source role/title metadata",
  Target_Title: "target role/title metadata",
  Transcription: "Inspector display metadata",
  Notes: "Inspector display metadata",
  "Link(s)": "Inspector display metadata or external-reference metadata",
});

/**
 * Upload-page tips. These should remain concise enough for the Data Inputs
 * panel, with longer guidance deferred to documentation if needed.
 */
export const PERIDOT_UPLOAD_TIPS = Object.freeze([
  "Each row should represent one letter, document, or correspondence record.",
  "Peridot accepts incomplete research data, but some rows may not appear in every visualization.",
  "Coordinates are not required, but rows need valid source and target coordinates to appear on the geographic map.",
  "Peridot treats names, places, topics, relationships, and languages exactly as entered.",
  "For cleaner networks and charts, standardize names and categories before upload.",
  "Rows with unparseable or missing dates can still be preserved, but they may not participate in timeline playback; simple year ranges are recognized as temporal intervals.",
]);

export const PERIDOT_VALIDATION_SUMMARY_COPY = Object.freeze({
  uploadAcceptedHeading: "Upload complete.",
  preservedRecordsNotice:
    "Records that are incomplete or incompatible with a visualization are still preserved where possible and remain available in Inspector and Export.",
  noCleaningNotice:
    "Peridot does not clean or standardize uploaded values. Charts and filters use the values exactly as entered.",
});

/**
 * Return true when a cell-like value contains non-whitespace content.
 */
export function hasValue(value) {
  return value !== null && value !== undefined && String(value).trim() !== "";
}

/**
 * Return true when a value can be treated as a latitude.
 */
export function isValidLatitude(value) {
  if (!hasValue(value)) return false;
  const number = Number(value);
  return Number.isFinite(number) && number >= -90 && number <= 90;
}

/**
 * Return true when a value can be treated as a longitude.
 */
export function isValidLongitude(value) {
  if (!hasValue(value)) return false;
  const number = Number(value);
  return Number.isFinite(number) && number >= -180 && number <= 180;
}

/**
 * Return true when a row has source and target person names.
 */
export function hasPersonPair(row) {
  return hasValue(row?.Source_Name) && hasValue(row?.Target_Name);
}

/**
 * Return true when a row has a valid coordinate pair for one endpoint.
 */
export function hasCoordinatePair(row, latitudeField, longitudeField) {
  return isValidLatitude(row?.[latitudeField]) && isValidLongitude(row?.[longitudeField]);
}

/**
 * Return true when a row has any usable place information for one endpoint.
 * Place names and coordinate pairs both count as place information.
 */
export function hasEndpointPlaceInformation(row, locationField, latitudeField, longitudeField) {
  return (
    hasValue(row?.[locationField]) ||
    hasCoordinatePair(row, latitudeField, longitudeField)
  );
}

/**
 * Return true when a row has a valid combined coordinate-pair field.
 * Peridot coordinate-pair uploads are latitude-first, longitude-second.
 */
export function hasCoordinatePairField(row, coordinateField) {
  return Boolean(parsePeridotCoordinatePair(row?.[coordinateField]));
}

/**
 * Return true when a row has any usable place information for a point/site record.
 */
export function hasPointPlaceInformation(row) {
  return (
    hasValue(row?.Point_Place) ||
    hasCoordinatePair(row, "Point_Latitude", "Point_Longitude") ||
    hasCoordinatePairField(row, "Point_Coordinates")
  );
}

/**
 * Return true when a row has source-side and target-side place information.
 */
export function hasPlacePair(row) {
  return (
    hasEndpointPlaceInformation(
      row,
      "Source_Location",
      "Source_Latitude",
      "Source_Longitude"
    ) || hasCoordinatePairField(row, "Source_Coordinates")
  ) && (
    hasEndpointPlaceInformation(
      row,
      "Target_Location",
      "Target_Latitude",
      "Target_Longitude"
    ) || hasCoordinatePairField(row, "Target_Coordinates")
  );
}

/**
 * Return true when a row has valid point coordinates.
 */
export function hasMappablePointCoordinate(row) {
  return (
    hasCoordinatePair(row, "Point_Latitude", "Point_Longitude") ||
    hasCoordinatePairField(row, "Point_Coordinates")
  );
}

/**
 * Return true when a row has valid source and target coordinate pairs.
 * This is the stricter route-rendering capability, not the upload-admission rule.
 */
export function hasMappableRouteCoordinatePair(row) {
  return (
    (hasCoordinatePair(row, "Source_Latitude", "Source_Longitude") || hasCoordinatePairField(row, "Source_Coordinates")) &&
    (hasCoordinatePair(row, "Target_Latitude", "Target_Longitude") || hasCoordinatePairField(row, "Target_Coordinates"))
  );
}

/**
 * Return true when a row has valid point or route coordinates.
 */
export function hasMappableCoordinatePair(row) {
  return hasMappablePointCoordinate(row) || hasMappableRouteCoordinatePair(row);
}

/**
 * Return true when a row satisfies the minimum Peridot record rule.
 */
export function isAcceptedPeridotRecord(row) {
  return hasPersonPair(row) || hasPlacePair(row) || hasPointPlaceInformation(row);
}

/**
 * Return normalized temporal information for the public Peridot Date field.
 *
 * This accepts exact dates, year/month precision, year-only values, circa years,
 * and simple year ranges. Unparseable values are preserved as display evidence
 * but are not timeline-ready.
 */
export function getPeridotDateCapability(row) {
  const hasStartOrEnd = hasValue(row?.Date_Start) || hasValue(row?.Date_End);

  const temporal = hasStartOrEnd
    ? parsePeridotTemporalRange({
        startValue: row?.Date_Start,
        endValue: row?.Date_End,
        displayValue: row?.Date_Display || row?.Date,
      })
    : parsePeridotTemporalValue(row?.Date || row?.Date_Display);

  return Object.freeze({
    timelineReady: temporal.isSortable,
    hasInterval: temporal.isInterval,
    hasClosedRange: temporal.rangeKind === 'closedRange',
    temporal,
  });
}

/**
 * Return true when a row has a Date value Peridot can sort/filter.
 */
export function hasMachineReadableDate(row) {
  return getPeridotDateCapability(row).timelineReady;
}

/**
 * Return row-level visualization capabilities under the agreed permissive model.
 */
export function getPeridotRowCapabilities(row) {
  const accepted = isAcceptedPeridotRecord(row);

  return Object.freeze({
    inspectorReady: accepted,
    peopleNetworkReady: hasPersonPair(row),
    placeNetworkReady: hasPlacePair(row),
    pointMapReady: hasMappablePointCoordinate(row),
    routeMapReady: hasMappableRouteCoordinatePair(row),
    mapReady: hasMappableCoordinatePair(row),
    timelineReady: hasMachineReadableDate(row),
    analyticsReady: accepted,
    exportReady: accepted,
  });
}

/**
 * Return any public template columns missing from a parsed CSV header.
 */
export function getMissingPeridotTemplateColumns(headers) {
  const provided = new Set((headers || []).map((header) => String(header).trim()));

  return PERIDOT_TEMPLATE_COLUMNS.filter((column) => !provided.has(column));
}
