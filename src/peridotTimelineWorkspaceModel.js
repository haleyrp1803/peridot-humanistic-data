/*
 * Canonical Timeline workspace projection.
 *
 * The Timeline workspace consumes the same already-filtered row scope used by
 * Peridot's other visualization workspaces. Search/Explore owns query logic;
 * this module never re-evaluates query syntax or broadens that scope.
 *
 * Canonical temporal assertions remain the sole chronology authority. Existing
 * timeline playback helpers provide the positionable assertion-level entries;
 * this projection enriches those entries with subject and Evidence provenance
 * needed by the standalone Timeline visualization.
 */

import { buildTimelineEntries } from './timelinePlaybackHelpers.js';
import {
  derivePeridotEntityNetworkSemantics,
  getPeridotRowEntityParticipantEntries,
} from './peridotEntityNetwork.js';

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function asText(value) {
  return String(value ?? '').trim();
}

function freezeArray(values = []) {
  return Object.freeze(values.map((value) => Object.freeze({ ...value })));
}

function sourceRowNumberForRow(row) {
  const rowIndex = Number(row?.generalizedObservation?.rowIndex);
  return Number.isFinite(rowIndex) ? rowIndex + 2 : null;
}

function recordIdForRow(row) {
  return asText(
    row?.generalizedObservation?.recordId
    || row?.recordId
    || row?.id,
  );
}

function participantForAssertion(row, assertion) {
  const participantIndex = Number.isInteger(assertion?.subjectParticipantIndex)
    ? assertion.subjectParticipantIndex
    : null;
  if (participantIndex === null) return null;
  return asArray(row?.generalizedObservation?.participants)[participantIndex] || null;
}

function eventSubject(row, assertion) {
  const participant = participantForAssertion(row, assertion);
  if (participant) {
    return Object.freeze({
      type: 'entity',
      id: asText(participant?.entityId),
      label: asText(participant?.value || participant?.label),
      participantIndex: assertion.subjectParticipantIndex,
    });
  }

  return Object.freeze({
    type: 'record',
    id: recordIdForRow(row),
    label: 'Record',
    participantIndex: null,
  });
}

function canonicalEvidenceFields(row) {
  if (Array.isArray(row?.peridotCanonicalEvidenceFields)) {
    return row.peridotCanonicalEvidenceFields;
  }

  // Compatibility fallback for generalized mapped rows that have not yet been
  // enriched with Search's canonical Evidence projection. These fields still
  // originate from researcher-mapped Evidence selections.
  return asArray(row?.customInspectorFields).map((field) => ({
    key: asText(field?.sourceColumn || field?.key || field?.label),
    label: asText(field?.label || field?.sourceColumn || field?.key),
    value: field?.value,
    subjectId: '',
    subjectType: '',
    subjectLabel: '',
    assertionId: '',
    sourceColumn: asText(field?.sourceColumn),
    sourceRowNumber: sourceRowNumberForRow(row),
  }));
}

function normalizeEvidenceMembership(field, index) {
  const key = asText(field?.key || field?.sourceColumn || field?.label);
  const label = asText(field?.label || field?.sourceColumn || field?.key) || 'Evidence';
  const value = asText(field?.value);
  if (!key || !value) return null;

  return Object.freeze({
    id: asText(field?.assertionId) || `${key}::${value}::${index}`,
    fieldKey: key,
    fieldLabel: label,
    value,
    subjectId: asText(field?.subjectId),
    subjectType: asText(field?.subjectType),
    subjectLabel: asText(field?.subjectLabel),
    sourceColumn: asText(field?.sourceColumn) || key,
    sourceRowNumber: Number(field?.sourceRowNumber) || null,
  });
}

function evidenceMembershipsForRow(row) {
  const deduped = new Map();

  canonicalEvidenceFields(row).forEach((field, index) => {
    const membership = normalizeEvidenceMembership(field, index);
    if (!membership) return;
    const identity = [
      membership.fieldKey,
      membership.value,
      membership.subjectId,
      membership.subjectType,
    ].join('\u0000');
    if (!deduped.has(identity)) deduped.set(identity, membership);
  });

  return Object.freeze(Array.from(deduped.values()));
}

function temporalShapeKind(assertion) {
  const shape = asText(assertion?.temporalShape);
  if (shape === 'interval' || shape === 'approximateInterval' || shape === 'partialInterval') return 'interval';
  if (shape === 'openInterval') return 'openInterval';
  return 'point';
}

export function buildPeridotTimelineWorkspaceEvents(rows = [], options = {}) {
  const entries = buildTimelineEntries(rows, options);

  return Object.freeze(entries.map((entry) => {
    const row = entry.row || {};
    const assertion = entry.assertion || {};
    return Object.freeze({
      id: entry.id,
      rowId: asText(entry.rowId || row?.id),
      recordId: recordIdForRow(row),
      sourceRowNumber: sourceRowNumberForRow(row),
      row,
      assertion,
      temporalRole: entry.role,
      temporalShape: asText(assertion?.temporalShape) || 'unknown',
      temporalKind: temporalShapeKind(assertion),
      boundedness: asText(assertion?.boundedness),
      precision: asText(assertion?.precision),
      qualifier: asText(assertion?.qualifier),
      consistency: asText(assertion?.consistency),
      parsingStatus: asText(assertion?.parsingStatus),
      displayLabel: asText(entry.displayLabel),
      sourceText: asText(assertion?.sourceText),
      playbackSortKey: entry.playbackSortKey,
      windowStart: entry.windowStart,
      windowEnd: entry.windowEnd,
      subject: eventSubject(row, assertion),
      categoryMemberships: evidenceMembershipsForRow(row),
    });
  }));
}

export function buildPeridotTimelineCategoryFields(events = []) {
  const fields = new Map();

  asArray(events).forEach((event) => {
    asArray(event?.categoryMemberships).forEach((membership) => {
      const fieldIdentity = membership.fieldKey || membership.fieldLabel;
      if (!fieldIdentity) return;

      if (!fields.has(fieldIdentity)) {
        fields.set(fieldIdentity, {
          id: `timeline-category-field:${fieldIdentity}`,
          key: membership.fieldKey,
          label: membership.fieldLabel,
          sourceColumn: membership.sourceColumn,
          eventIds: new Set(),
          values: new Map(),
        });
      }

      const field = fields.get(fieldIdentity);
      field.eventIds.add(event.id);
      if (!field.values.has(membership.value)) {
        field.values.set(membership.value, {
          value: membership.value,
          eventIds: new Set(),
        });
      }
      field.values.get(membership.value).eventIds.add(event.id);
    });
  });

  return Object.freeze(Array.from(fields.values())
    .map((field) => Object.freeze({
      id: field.id,
      key: field.key,
      label: field.label,
      sourceColumn: field.sourceColumn,
      eventCount: field.eventIds.size,
      values: freezeArray(Array.from(field.values.values())
        .map((value) => ({
          value: value.value,
          eventCount: value.eventIds.size,
        }))
        .sort((a, b) => a.value.localeCompare(b.value))),
    }))
    .sort((a, b) => a.label.localeCompare(b.label)));
}

export function filterPeridotTimelineEventsByCategories(events = [], visibleCategories = []) {
  const selected = asArray(visibleCategories)
    .map((category) => ({
      fieldKey: asText(category?.fieldKey || category?.key),
      value: asText(category?.value),
    }))
    .filter((category) => category.fieldKey && category.value);

  if (!selected.length) return Object.freeze([...asArray(events)]);

  // Category visibility is intentionally OR-based: an event remains visible
  // when it belongs to at least one selected field/value category.
  return Object.freeze(asArray(events).filter((event) => (
    asArray(event?.categoryMemberships).some((membership) => (
      selected.some((category) => (
        membership.fieldKey === category.fieldKey
        && membership.value === category.value
      ))
    ))
  )));
}


function normalizedEndpointKeys(id, label) {
  const keys = [];
  const normalizedId = asText(id);
  const normalizedLabel = asText(label).toLowerCase();
  if (normalizedId) keys.push(`id:${normalizedId}`);
  if (normalizedLabel) keys.push(`label:${normalizedLabel}`);
  return keys;
}

function eventOwnedEndpointKeys(event) {
  const keys = new Set();

  // Timeline relationship endpoints must belong to the temporal assertion's
  // actual subject. Do not treat every participant on the source row as an
  // endpoint candidate: genealogy rows often contain both the person and one
  // or more relatives, which can otherwise collapse A → B into B birth → B
  // lifespan.
  if (event?.subject?.type === 'entity') {
    normalizedEndpointKeys(event.subject.id, event.subject.label).forEach((key) => keys.add(key));
    return keys;
  }

  // Compatibility fallback for older/single-entity rows that predate explicit
  // subject attribution. Only accept the row when it resolves to exactly one
  // entity, so ambiguous multipart records cannot manufacture endpoints.
  const participants = getPeridotRowEntityParticipantEntries(event?.row || {});
  const unique = new Map();
  participants.forEach((participant) => {
    const participantKeys = normalizedEndpointKeys(participant?.id, participant?.label);
    const identity = participantKeys[0] || participantKeys[1];
    if (identity && !unique.has(identity)) unique.set(identity, participant);
  });
  if (unique.size === 1) {
    const participant = Array.from(unique.values())[0];
    normalizedEndpointKeys(participant?.id, participant?.label).forEach((key) => keys.add(key));
  }
  return keys;
}

function rowIdentity(row = {}) {
  return asText(row?.generalizedObservation?.recordId || row?.recordId || row?.id);
}

function eventRepScore(event, endpointId, endpointLabel) {
  const role = asText(event?.temporalRole).toLowerCase();
  const endpointKeys = new Set(normalizedEndpointKeys(endpointId, endpointLabel));
  const subjectKeys = new Set(normalizedEndpointKeys(event?.subject?.id, event?.subject?.label));
  let score = 0;
  if ([...endpointKeys].some((key) => subjectKeys.has(key))) score += 120;
  if (role.includes('lifespan')) score += 80;
  else if (role.includes('birth')) score += 45;
  else if (role.includes('death')) score += 35;
  if (event?.temporalKind === 'interval') score += 25;
  return score;
}

function representativeEventForEndpoint(events, endpointId, endpointLabel, excludedEventId = '') {
  const endpointKeys = new Set(normalizedEndpointKeys(endpointId, endpointLabel));
  const candidates = asArray(events)
    .filter((event) => event?.id !== excludedEventId)
    .filter((event) => {
      const keys = eventOwnedEndpointKeys(event);
      return [...endpointKeys].some((key) => keys.has(key));
    })
    .map((event) => ({ event, score: eventRepScore(event, endpointId, endpointLabel) }))
    .sort((a, b) => (
      b.score - a.score
      || Number(a.event?.playbackSortKey || a.event?.windowStart || 0) - Number(b.event?.playbackSortKey || b.event?.windowStart || 0)
      || String(a.event?.id || '').localeCompare(String(b.event?.id || ''))
    ));
  return candidates[0]?.event || null;
}

/**
 * Project explicit mapped entity relationships into Timeline event-to-event
 * connections without inferring links from co-occurrence or shared categories.
 *
 * A relationship row that already produces a Timeline event is considered
 * event-native and is not reinterpreted as a line between other events. For
 * structural/undated relationships, one representative visible event is chosen
 * per endpoint (preferring a subject-owned Lifespan assertion when available).
 */
export function buildPeridotTimelineConnections(events = [], relationshipRows = []) {
  const timelineEvents = asArray(events);
  if (!timelineEvents.length) return Object.freeze([]);

  const semantics = derivePeridotEntityNetworkSemantics(asArray(relationshipRows));
  const eventRowIds = new Set(timelineEvents.map((event) => rowIdentity(event?.row)).filter(Boolean));
  const connections = [];

  asArray(semantics?.relationships).forEach((relationship) => {
    const rows = asArray(relationship?.rows);
    const isEventNative = rows.some((row) => eventRowIds.has(rowIdentity(row)));
    if (isEventNative) return;

    const sourceEvent = representativeEventForEndpoint(
      timelineEvents,
      relationship?.sourceId,
      relationship?.source,
    );
    if (!sourceEvent) return;
    const targetEvent = representativeEventForEndpoint(
      timelineEvents,
      relationship?.targetId,
      relationship?.target,
      sourceEvent.id,
    );
    if (!targetEvent || sourceEvent.id === targetEvent.id) return;

    const dated = asArray(relationship?.dates).some((value) => asText(value));
    connections.push(Object.freeze({
      id: `timeline-connection:${relationship.id}`,
      sourceEventId: sourceEvent.id,
      targetEventId: targetEvent.id,
      source: asText(relationship?.source),
      target: asText(relationship?.target),
      sourceId: asText(relationship?.sourceId),
      targetId: asText(relationship?.targetId),
      direction: asText(relationship?.direction) || 'undirected',
      relationshipType: asText(relationship?.relationshipType),
      relationshipLabel: asText(relationship?.relationshipLabel),
      temporalGrounding: dated ? 'dated' : 'structural',
      dates: Object.freeze([...asArray(relationship?.dates)]),
      count: Number(relationship?.count) || 1,
      semanticEdgeId: asText(relationship?.id),
    }));
  });

  return Object.freeze(connections);
}
