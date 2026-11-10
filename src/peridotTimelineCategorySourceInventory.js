/*
 * Peridot Timeline — category source inventory (discovery only, v1).
 *
 * Pure projection of the generalized mapped observations attached to Timeline
 * workspace events. This module does not assign memberships, select categories,
 * mutate input data, infer linked-sheet joins, or change chronology/filtering.
 *
 * A discovered field is not automatically eligible for event-level coloring.
 * Availability explicitly distinguishes mapped source evidence from a proven
 * event association. The next pass will define that association separately.
 */

const array = (value) => Array.isArray(value) ? value : [];
const string = (value) => String(value ?? '').trim();
const nonempty = (value) => value !== null && value !== undefined && string(value) !== '';
const own = (value, key) => Object.prototype.hasOwnProperty.call(value || {}, key);
const ordered = (values) => [...values].sort((a, b) => a.localeCompare(b));
const asKey = (parts) => JSON.stringify(parts.map((part) => String(part ?? '')));

// Sheet identity must be supplied by a trusted ingestion/mapping source. The
// existing single-table generalized observation does not currently guarantee it.
function sourceContext(observation) {
  const sheet = string(observation?.sourceSheet || observation?.sheetName || observation?.source?.sheetName);
  const workbook = string(observation?.sourceWorkbook || observation?.workbookName || observation?.source?.workbookName);
  return { workbook, sheet, provenanceComplete: Boolean(sheet) };
}

function normalizedValue(value) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return string(value);
  return ''; // Never invent categories by stringifying arrays/objects.
}

function fieldType(value) {
  if (typeof value === 'boolean') return 'boolean';
  if (typeof value === 'number' && Number.isFinite(value)) return 'number';
  return 'text'; // Parse dates only when the researcher has mapped them as dates.
}

function observationOf(event) {
  return event?.row?.generalizedObservation || event?.generalizedObservation || null;
}

/**
 * @param {Array<object>} events Existing assertion-level Timeline workspace events.
 * @returns {ReadonlyArray<object>} Source candidates with observed values,
 * provenance, cardinality and explicitly unresolved association semantics.
 */
export function buildPeridotTimelineCategorySourceInventory(events = []) {
  const sources = new Map();
  const rowsSeen = new Set();

  function record({ event, observation, domain, column, role = '', subject = '', label = '', value,
    mapped = true, type = null, occurrence = null }) {
    const sourceColumn = string(column);
    if (!sourceColumn || !nonempty(value)) return;
    const valueText = normalizedValue(value);
    if (!valueText) return;
    const context = sourceContext(observation);
    const sourceId = asKey(['timeline-source-v1', context.workbook, context.sheet, domain, sourceColumn, role, subject]);
    const source = sources.get(sourceId) || {
      id: sourceId, domain, sourceColumn, role, subject,
      label: string(label) || sourceColumn,
      sourceWorkbook: context.workbook, sourceSheet: context.sheet,
      sheetIdentityKnown: context.provenanceComplete,
      mapped, association: 'unresolved',
      availability: mapped ? 'mapped-needs-event-association' : 'raw-needs-mapping-and-event-association',
      valueTypes: new Set(), values: new Map(), eventIds: new Set(), recordIds: new Set(),
    };
    source.valueTypes.add(type || fieldType(value));
    source.eventIds.add(string(event?.id));
    source.recordIds.add(string(observation?.recordId || event?.recordId));
    const val = source.values.get(valueText) || {
      value: valueText, eventIds: new Set(), recordIds: new Set(), occurrences: new Set(),
    };
    val.eventIds.add(string(event?.id));
    val.recordIds.add(string(observation?.recordId || event?.recordId));
    if (occurrence !== null) val.occurrences.add(asKey([string(observation?.recordId || event?.recordId), occurrence]));
    source.values.set(valueText, val);
    sources.set(sourceId, source);
  }

  array(events).forEach((event) => {
    const observation = observationOf(event);
    if (!observation) return;
    // Project each unique observation only once. Its full source value inventory
    // must not be inflated by the number of temporal assertions/events.
    const rowKey = asKey([
      sourceContext(observation).workbook, sourceContext(observation).sheet,
      string(observation?.recordId), string(observation?.rowIndex),
    ]);
    if (rowsSeen.has(rowKey)) return;
    rowsSeen.add(rowKey);

    array(observation.evidenceFields).forEach((field, i) => record({
      event, observation, domain: 'evidence', column: field?.sourceColumn,
      role: '', subject: Number.isInteger(field?.subjectParticipantIndex)
        ? `participant:${field.subjectParticipantIndex}` : 'record',
      label: field?.label, value: field?.value, occurrence: `${i}:${field?.occurrenceIndex ?? ''}`,
    }));
    array(observation.participants).forEach((part, i) => record({
      event, observation, domain: 'participant', column: part?.sourceColumn,
      role: part?.role, subject: `participant:${part?.index ?? i}`,
      label: part?.role, value: part?.value, occurrence: `${i}:${part?.occurrenceIndex ?? ''}`,
    }));
    array(observation.places).forEach((place, i) => record({
      event, observation, domain: 'place', column: place?.sourceColumn,
      role: place?.role,
      subject: Number.isInteger(place?.subjectParticipantIndex)
        ? `participant:${place.subjectParticipantIndex}` : 'record',
      label: place?.role, value: place?.label, occurrence: `${i}:${place?.occurrenceIndex ?? ''}`,
    }));
    const relationship = observation.relationship || {};
    for (const kind of ['type', 'label']) {
      record({ event, observation, domain: 'relationship',
        column: relationship?.sourceColumns?.[kind], role: kind,
        subject: 'record', label: kind === 'type' ? 'Relationship type' : 'Relationship label',
        value: relationship?.[kind],
      });
    }
    // Temporal descriptors are discoverable, but never auto-grouped into
    // date ranges, centuries or inferred time periods.
    array(observation?.temporal?.assertions).forEach((assertion, i) => {
      const column = string(assertion?.fieldKey);
      if (!column) return;
      record({ event, observation, domain: 'temporal', column,
        role: assertion?.role,
        subject: Number.isInteger(assertion?.subjectParticipantIndex)
          ? `participant:${assertion.subjectParticipantIndex}` : 'record',
        label: assertion?.role, value: assertion?.sourceText,
        type: 'mapped-temporal', occurrence: `${i}:${assertion?.occurrenceIndex ?? ''}`,
      });
    });
    // Raw/unmapped fields remain visible for discovery only. Do not imply that
    // row-level contents are automatically categories on each Timeline event.
    const raw = observation.originalUploadedRow || {};
    if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
      Object.keys(raw).forEach((column) => record({
        event, observation, domain: 'raw', column, subject: 'record',
        value: own(raw, column) ? raw[column] : '', mapped: false,
      }));
    }
  });

  return Object.freeze([...sources.values()].map((source) => Object.freeze({
    id: source.id, domain: source.domain, sourceColumn: source.sourceColumn,
    role: source.role, subject: source.subject, label: source.label,
    sourceWorkbook: source.sourceWorkbook, sourceSheet: source.sourceSheet,
    sheetIdentityKnown: source.sheetIdentityKnown, mapped: source.mapped,
    association: source.association, availability: source.availability,
    valueTypes: Object.freeze(ordered(source.valueTypes)),
    observedRecordCount: source.recordIds.size,
    // Not a membership count: events are merely observation provenance here.
    observedOriginEventCount: source.eventIds.size,
    distinctValueCount: source.values.size,
    values: Object.freeze([...source.values.values()].map((item) => Object.freeze({
      value: item.value, observedRecordCount: item.recordIds.size,
      observedOriginEventCount: item.eventIds.size,
    })).sort((a,b) => a.value.localeCompare(b.value))),
  })).sort((a,b) => a.id.localeCompare(b.id)));
}
