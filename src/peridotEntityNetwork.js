/*
 * Canonical/generalized entity-network derivation.
 *
 * Network semantics contract:
 * - edges are created only from relationships explicitly asserted by mapped data;
 * - generalized multipart mappings connect Part A to each additional mapped part;
 * - mere co-occurrence never creates an edge;
 * - direction is preserved only when the source data/model explicitly provides it;
 * - distinct relationship semantics remain distinct even when endpoints match;
 * - repeated observations of the same semantic relationship may aggregate as count.
 *
 * Layout is deliberately out of scope. App.jsx feeds this semantic graph into
 * geographic or force-directed layout after derivation.
 */

import { getRowPrimaryTemporalDisplay } from './timelinePlaybackHelpers.js';
import { resolvePeridotCanonicalEntityDisplayLabel } from './peridotEntityDisplayLabels.js';

const DIRECTED = 'directed';
const UNDIRECTED = 'undirected';
const TYPED_INVERSE = 'typed-inverse';

function asText(value) {
  return String(value ?? '').trim();
}

function asFiniteNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function validCoordinatePair(latitude, longitude) {
  const lat = asFiniteNumber(latitude);
  const lon = asFiniteNumber(longitude);
  return lat !== null && lon !== null && !(lat === 0 && lon === 0);
}

function normalizeDirection(value, fallback = UNDIRECTED) {
  const normalized = asText(value).toLowerCase();
  if (normalized === DIRECTED || normalized === TYPED_INVERSE) return DIRECTED;
  if (normalized === UNDIRECTED) return UNDIRECTED;
  return fallback;
}

function semanticRelationshipKey({
  source,
  target,
  sourceId,
  targetId,
  direction,
  relationshipType,
  relationshipLabel,
  sourceRole,
  targetRole,
  relationshipIdentity = '',
}) {
  if (relationshipIdentity) return `relationship:${relationshipIdentity}`;
  return [
    asText(sourceId) || asText(source),
    asText(targetId) || asText(target),
    normalizeDirection(direction),
    asText(relationshipType),
    asText(relationshipLabel),
    asText(sourceRole),
    asText(targetRole),
  ].join('::');
}

function addLocation(locations, person, label, latitude, longitude, role = '', sourceRow = null, personId = '') {
  const personLabel = asText(person);
  const placeLabel = asText(label);
  if (!personLabel || !validCoordinatePair(latitude, longitude)) return;
  locations.push({
    person: personLabel,
    personId: asText(personId),
    label: placeLabel,
    latitude: Number(latitude),
    longitude: Number(longitude),
    role: asText(role),
    sourceRow,
  });
}

function generalizedRelationshipsFromRow(row, rowIndex) {
  const observation = row?.generalizedObservation;
  const participants = Array.isArray(observation?.participants)
    ? observation.participants.filter((participant) => asText(participant?.value))
    : [];
  if (participants.length < 2) return [];

  const relationship = observation?.relationship || {};
  const direction = normalizeDirection(relationship.direction, UNDIRECTED);
  const relationshipType = asText(relationship.type);
  const relationshipLabel = asText(relationship.label);
  const focal = participants[0];

  return participants.slice(1).map((participant, index) => ({
    source: asText(focal.value),
    target: asText(participant.value),
    sourceId: asText(focal.entityId || focal.canonicalEntityId || focal.id),
    targetId: asText(participant.entityId || participant.canonicalEntityId || participant.id),
    direction,
    relationshipType,
    relationshipLabel,
    sourceRole: asText(focal.role),
    targetRole: asText(participant.role),
    relationshipIdentity: '',
    sourceRow: row,
    rowIndex,
    participantPair: [0, index + 1],
    semanticSource: 'generalized-mapped-relationship',
  }));
}

function canonicalRelationshipFromRow(row, rowIndex) {
  const canonical = row?.originalCanonicalItem;
  if (!canonical?.participantAId || !canonical?.participantBId) return null;
  const source = asText(row.sourcePerson || row.source || canonical.participantAId);
  const target = asText(row.targetPerson || row.target || canonical.participantBId);
  if (!source || !target) return null;

  return {
    source,
    target,
    sourceId: asText(row.sourceEntityId || canonical.participantAId),
    targetId: asText(row.targetEntityId || canonical.participantBId),
    direction: normalizeDirection(canonical.direction || row.relationshipDirection, UNDIRECTED),
    relationshipType: asText(canonical.relationshipType || row.relationshipType || row.relationship),
    relationshipLabel: asText(canonical.label),
    sourceRole: asText(canonical.participantARole || row.sourceRole),
    targetRole: asText(canonical.participantBRole || row.targetRole),
    relationshipIdentity: asText(canonical.id || row.id),
    sourceRow: row,
    rowIndex,
    semanticSource: 'canonical-relationship',
  };
}

function legacyRelationshipFromRow(row, rowIndex) {
  const source = asText(row?.sourcePerson);
  const target = asText(row?.targetPerson);
  if (!source || !target) return null;
  return {
    source,
    target,
    sourceId: asText(row.sourceEntityId),
    targetId: asText(row.targetEntityId),
    direction: normalizeDirection(row.relationshipDirection, DIRECTED),
    relationshipType: asText(row.relationshipType || row.relationship),
    relationshipLabel: '',
    sourceRole: asText(row.sourceRole || 'source'),
    targetRole: asText(row.targetRole || 'target'),
    relationshipIdentity: '',
    sourceRow: row,
    rowIndex,
    semanticSource: 'legacy-directed-record',
  };
}

function locationsFromRow(row) {
  const locations = [];
  const observation = row?.generalizedObservation;

  if (observation) {
    const participants = Array.isArray(observation.participants) ? observation.participants : [];
    (observation.places || []).forEach((place) => {
      if (!Number.isInteger(place?.subjectParticipantIndex)) return;
      const participant = participants[place.subjectParticipantIndex];
      if (!participant) return;
      addLocation(
        locations,
        participant.value,
        place.label,
        place.latitude,
        place.longitude,
        place.role,
        row,
        participant.entityId || participant.canonicalEntityId || participant.id || '',
      );
    });
    return locations;
  }

  // Genealogy event projections carry a single person and place without an edge.
  if (asText(row?.recordType) === 'genealogy-event') {
    addLocation(
      locations,
      row.sourcePerson || row.person || row.entity,
      row.sourceLoc || row.location,
      row.sourceLat,
      row.sourceLon,
      row.eventType,
      row,
      row.entityId || row.personEntityId || row.sourceEntityId || '',
    );
    return locations;
  }

  addLocation(locations, row?.sourcePerson, row?.sourceLoc, row?.sourceLat, row?.sourceLon, row?.sourceRole, row, row?.sourceEntityId);
  addLocation(locations, row?.targetPerson, row?.targetLoc, row?.targetLat, row?.targetLon, row?.targetRole, row, row?.targetEntityId);
  return locations;
}

/**
 * Convert the currently visible row scope into layout-neutral entity-network
 * semantics. This function intentionally does not infer relationships from
 * arbitrary row co-occurrence.
 */
export function derivePeridotEntityNetworkSemantics(rows = [], options = {}) {
  const relationshipMap = new Map();
  const locations = [];
  const entityLabelById = options?.entityLabelById || null;
  const defaultRows = Array.isArray(rows) ? rows : [];
  const relationshipRows = Array.isArray(options.relationshipRows) ? options.relationshipRows : defaultRows;
  const locationRows = Array.isArray(options.locationRows) ? options.locationRows : defaultRows;

  // Geographic person/entity views sometimes need two related scopes:
  // structural relationship rows may be undated (for example genealogy parent/partner
  // assertions), while participant place/event rows are date-bearing and should follow
  // the active Timeline/playback scope. Keeping the inputs separate preserves explicit
  // relationship semantics without inventing dates for structural relationships.
  locationRows.forEach((row = {}) => {
    locationsFromRow(row).forEach((location) => {
      locations.push({
        ...location,
        person: resolvePeridotCanonicalEntityDisplayLabel(
          entityLabelById,
          location.personId,
          location.person,
        ),
      });
    });
  });

  relationshipRows.forEach((row = {}, rowIndex) => {
    let relationshipDrafts = [];
    if (row?.generalizedObservation) {
      relationshipDrafts = generalizedRelationshipsFromRow(row, rowIndex);
    } else {
      const canonical = canonicalRelationshipFromRow(row, rowIndex);
      const legacy = canonical || legacyRelationshipFromRow(row, rowIndex);
      relationshipDrafts = legacy ? [legacy] : [];
    }

    relationshipDrafts.forEach((draft) => {
      if (!draft.source || !draft.target) return;
      const canonicalDraft = {
        ...draft,
        source: resolvePeridotCanonicalEntityDisplayLabel(entityLabelById, draft.sourceId, draft.source),
        target: resolvePeridotCanonicalEntityDisplayLabel(entityLabelById, draft.targetId, draft.target),
      };
      const key = semanticRelationshipKey(canonicalDraft);
      if (!relationshipMap.has(key)) {
        relationshipMap.set(key, {
          id: `entity-edge:${key}`,
          source: canonicalDraft.source,
          target: canonicalDraft.target,
          sourceId: canonicalDraft.sourceId || '',
          targetId: canonicalDraft.targetId || '',
          direction: canonicalDraft.direction,
          relationshipType: canonicalDraft.relationshipType,
          relationshipLabel: canonicalDraft.relationshipLabel,
          sourceRole: canonicalDraft.sourceRole,
          targetRole: canonicalDraft.targetRole,
          semanticSource: canonicalDraft.semanticSource,
          count: 0,
          dates: new Set(),
          rows: [],
        });
      }
      const edge = relationshipMap.get(key);
      edge.count += 1;
      edge.rows.push(draft.sourceRow);
      const date = asText(getRowPrimaryTemporalDisplay(draft.sourceRow));
      if (date) edge.dates.add(date);
    });
  });

  return {
    relationships: Array.from(relationshipMap.values()).map((relationship) => ({
      ...relationship,
      dates: Array.from(relationship.dates),
    })),
    locations,
  };
}

/**
 * Geographic entity networks intentionally separate relationship structure
 * from currently visible participant-place assertions. This is especially
 * important for genealogy, where canonical family relationships are structural
 * rows while birth/death event rows carry the geographic anchors.
 */
export function derivePeridotGeographicEntityNetworkSemantics(relationshipRows = [], locationRows = [], options = {}) {
  return derivePeridotEntityNetworkSemantics(relationshipRows, {
    ...options,
    relationshipRows,
    locationRows,
  });
}

function geographicAnchorPersonKey(location = {}) {
  return asText(location.personId) || asText(location.person);
}

function geographicAnchorCoordinateKey(location = {}) {
  if (!validCoordinatePair(location.latitude, location.longitude)) return '';
  return `${Number(location.latitude)}__${Number(location.longitude)}`;
}

/**
 * Return the explicit place roles currently available for person/entity anchors.
 * Role matching is case-insensitive, while the first source spelling is retained
 * for researcher-facing labels. Unlabelled places remain eligible for the
 * derived "Most frequent place" rule but do not become a selectable role.
 */
export function getPeridotGeographicAnchorRoles(locations = []) {
  const roleByKey = new Map();
  (Array.isArray(locations) ? locations : []).forEach((location) => {
    const role = asText(location?.role);
    if (!role) return;
    const key = role.toLowerCase();
    if (!roleByKey.has(key)) roleByKey.set(key, role);
  });
  return Array.from(roleByKey.values()).sort((a, b) => a.localeCompare(b));
}

/**
 * Resolve person/entity geographic anchors independently from relationship-line
 * geography. Multiple selected place roles may produce multiple anchor instances
 * for one canonical entity. "Most frequent place" is an independent derived rule
 * and may be enabled alongside any role selection.
 *
 * Identical coordinates for the same person are deduplicated. The resulting
 * anchor preserves every qualifying reason so later hover/Inspector consumers can
 * explain why the location is visible. A tie for most-frequent place is preserved
 * honestly: every location tied at the maximum occurrence count qualifies.
 */
export function derivePeridotGeographicPersonAnchors(locations = [], options = {}) {
  const selectedRoleKeys = new Set(
    (Array.isArray(options?.selectedRoles) ? options.selectedRoles : [])
      .map((role) => asText(role).toLowerCase())
      .filter(Boolean),
  );
  const includeMostFrequent = Boolean(options?.includeMostFrequent);
  const people = new Map();

  (Array.isArray(locations) ? locations : []).forEach((location) => {
    const personKey = geographicAnchorPersonKey(location);
    const coordinateKey = geographicAnchorCoordinateKey(location);
    if (!personKey || !coordinateKey) return;

    if (!people.has(personKey)) {
      people.set(personKey, {
        personKey,
        person: asText(location.person) || personKey,
        personId: asText(location.personId),
        places: new Map(),
      });
    }

    const person = people.get(personKey);
    if (!person.personId && asText(location.personId)) person.personId = asText(location.personId);
    if ((!person.person || person.person === personKey) && asText(location.person)) person.person = asText(location.person);

    if (!person.places.has(coordinateKey)) {
      person.places.set(coordinateKey, {
        coordinateKey,
        label: asText(location.label),
        latitude: Number(location.latitude),
        longitude: Number(location.longitude),
        occurrenceCount: 0,
        labels: new Map(),
        roles: new Map(),
        sourceRows: [],
      });
    }

    const place = person.places.get(coordinateKey);
    place.occurrenceCount += 1;
    const label = asText(location.label);
    if (label) place.labels.set(label, (place.labels.get(label) || 0) + 1);
    const role = asText(location.role);
    if (role) {
      const roleKey = role.toLowerCase();
      if (!place.roles.has(roleKey)) {
        place.roles.set(roleKey, { label: role, occurrenceCount: 0 });
      }
      place.roles.get(roleKey).occurrenceCount += 1;
    }
    if (location.sourceRow && !place.sourceRows.includes(location.sourceRow)) {
      place.sourceRows.push(location.sourceRow);
    }
  });

  const anchors = [];
  people.forEach((person) => {
    const places = Array.from(person.places.values());
    const maxOccurrenceCount = places.reduce(
      (maximum, place) => Math.max(maximum, place.occurrenceCount),
      0,
    );

    places.forEach((place) => {
      const roleReasons = Array.from(place.roles.entries())
        .filter(([roleKey]) => selectedRoleKeys.has(roleKey))
        .map(([, role]) => ({
          type: 'place-role',
          role: role.label,
          occurrenceCount: role.occurrenceCount,
        }));
      const isMostFrequentPlace = includeMostFrequent
        && maxOccurrenceCount > 0
        && place.occurrenceCount === maxOccurrenceCount;
      const reasons = [...roleReasons];
      if (isMostFrequentPlace) {
        reasons.push({
          type: 'most-frequent-place',
          occurrenceCount: place.occurrenceCount,
          tied: places.filter((candidate) => candidate.occurrenceCount === maxOccurrenceCount).length > 1,
        });
      }
      if (!reasons.length) return;

      const preferredLabel = Array.from(place.labels.entries())
        .sort((a, b) => b[1] - a[1])[0]?.[0] || place.label || `${place.latitude}, ${place.longitude}`;
      anchors.push({
        id: `geo-anchor:${person.personKey}:${place.coordinateKey}`,
        personKey: person.personKey,
        person: person.person,
        personId: person.personId,
        label: preferredLabel,
        latitude: place.latitude,
        longitude: place.longitude,
        occurrenceCount: place.occurrenceCount,
        roles: Array.from(place.roles.values()).map((role) => role.label),
        roleOccurrenceCounts: Object.fromEntries(
          Array.from(place.roles.values()).map((role) => [role.label, role.occurrenceCount]),
        ),
        reasons,
        isMostFrequentPlace,
        sourceRows: place.sourceRows.slice(),
      });
    });
  });

  return anchors;
}

/**
 * Resolve one runtime row through the same relationship semantics used by the
 * People and Force-Directed network builders. Search, Inspector, playback, and
 * other consumers should use this boundary instead of reinterpreting
 * sourcePerson/targetPerson independently.
 */
export function getPeridotRowEntityRelationships(row = {}) {
  if (row?.generalizedObservation) {
    return generalizedRelationshipsFromRow(row, 0);
  }
  const canonical = canonicalRelationshipFromRow(row, 0);
  const legacy = canonical || legacyRelationshipFromRow(row, 0);
  return legacy ? [legacy] : [];
}

export function getPeridotRowEntityParticipantEntries(row = {}) {
  const participants = new Map();
  const addParticipant = (label, id = '', role = '') => {
    const normalizedLabel = asText(label);
    const normalizedId = asText(id);
    if (!normalizedLabel && !normalizedId) return;
    const key = normalizedId ? `id:${normalizedId}` : `label:${normalizedLabel}`;
    if (!participants.has(key)) {
      participants.set(key, {
        id: normalizedId,
        label: normalizedLabel || normalizedId,
        role: asText(role),
      });
    }
  };

  getPeridotRowEntityRelationships(row).forEach((relationship) => {
    addParticipant(relationship.source, relationship.sourceId, relationship.sourceRole);
    addParticipant(relationship.target, relationship.targetId, relationship.targetRole);
  });

  // A row may carry a person/entity without asserting an edge (for example a
  // genealogy event). Preserve its canonical identity when available without
  // inventing a relationship.
  if (!participants.size) {
    addParticipant(
      row?.person || row?.entity || row?.sourcePerson,
      row?.personEntityId || row?.entityId || row?.sourceEntityId,
      row?.eventType || row?.sourceRole,
    );
    addParticipant(row?.targetPerson, row?.targetEntityId, row?.targetRole);
  }

  return Array.from(participants.values());
}

export function getPeridotRowEntityParticipants(row = {}) {
  return getPeridotRowEntityParticipantEntries(row).map((participant) => participant.label);
}

export function formatPeridotEntityRelationshipLabel(relationship = {}) {
  const source = asText(relationship.source);
  const target = asText(relationship.target);
  if (!source && !target) return '';
  if (!target) return source;
  const connector = normalizeDirection(relationship.direction) === DIRECTED ? '→' : '—';
  return `${source} ${connector} ${target}`;
}

export function getPeridotRowEntityRelationshipLabels(row = {}) {
  return getPeridotRowEntityRelationships(row)
    .map(formatPeridotEntityRelationshipLabel)
    .filter(Boolean);
}

export function rowHasPeridotEntityRelationship(row = {}) {
  return getPeridotRowEntityRelationships(row).length > 0;
}

export const PERIDOT_ENTITY_NETWORK_DIRECTIONS = Object.freeze({
  DIRECTED,
  UNDIRECTED,
});
