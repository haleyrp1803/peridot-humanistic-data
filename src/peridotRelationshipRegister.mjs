/*
 * Evidence Workspace relationship register presentation model.
 * Read-only grouping of mapped, row-level relationship assertions. The caller
 * supplies the authoritative shared row-structure reader; no relationships,
 * participant roles, or source records are inferred from co-occurrence.
 */
const clean = (value) => String(value ?? '').trim();
const compare = (value) => clean(value).toLocaleLowerCase();
const normalizedRole = (role) => compare(role).replace(/[_-]+/g, ' ');

function sameParticipant(label, id, selectedLabel, selectedId) {
  if (clean(selectedId) && clean(id)) return clean(selectedId) === clean(id);
  return Boolean(compare(label) && compare(label) === compare(selectedLabel));
}

function placeDirection(role) {
  const token = normalizedRole(role);
  if (/\b(source|origin|originating|from|sent from|departure)\b/.test(token)) return 'source';
  if (/\b(target|destination|to|sent to|received at|arrival)\b/.test(token)) return 'target';
  return '';
}

function addOccurrence(groups, key, definition, row) {
  let group = groups.get(key);
  if (!group) {
    group = { ...definition, occurrences: 0, records: [] };
    groups.set(key, group);
  }
  group.occurrences += 1;
  if (!group.records.includes(row)) group.records.push(row);
}

/** Each row is already filtered for the selected entity by InspectorSemantics. */
export function buildPeridotRelationshipRegister(rows = [], options = {}, readStructure) {
  const entityGroups = new Map();
  const placeGroups = new Map();
  const selectedLabel = clean(options.entityLabel);
  const selectedId = clean(options.entityId);
  const entityType = options.entityType === 'place' ? 'place' : 'person';
  if (typeof readStructure !== 'function') throw new TypeError('A mapped record-structure reader is required');

  for (const row of rows || []) {
    if (!row) continue;
    const structure = readStructure(row);
    if (entityType === 'person') {
      for (const relation of structure.relationships || []) {
        const isSource = sameParticipant(relation.source, relation.sourceId, selectedLabel, selectedId);
        const isTarget = sameParticipant(relation.target, relation.targetId, selectedLabel, selectedId);
        if (!isSource && !isTarget) continue;
        if (!clean(relation.source) || !clean(relation.target)) continue;
        const direction = relation.direction === 'directed' ? 'directed' : 'undirected';
        const type = clean(relation.relationshipLabel || relation.relationshipType);
        const definition = {
          kind: 'entity', source: clean(relation.source), target: clean(relation.target),
          sourceId: clean(relation.sourceId), targetId: clean(relation.targetId),
          sourceRole: clean(relation.sourceRole), targetRole: clean(relation.targetRole),
          relationshipType: type, direction,
        };
        const key = [definition.sourceId || compare(definition.source), definition.targetId || compare(definition.target),
          compare(type), direction, compare(definition.sourceRole), compare(definition.targetRole)].join('::');
        addOccurrence(entityGroups, key, definition, row);
      }
    }
    // Geographic pairs must have an explicitly mapped origin/destination and
    // must involve the selected place (or a place owned by the selected person).
    const places = structure.places || [];
    const origin = places.find((entry) => placeDirection(entry.label) === 'source');
    const destination = places.find((entry) => placeDirection(entry.label) === 'target');
    const originLabel = clean(origin?.value);
    const destinationLabel = clean(destination?.value);
    if (!originLabel || !destinationLabel || compare(originLabel) === 'unknown' || compare(destinationLabel) === 'unknown') continue;
    const pertains = entityType === 'place'
      ? compare(originLabel) === compare(selectedLabel) || compare(destinationLabel) === compare(selectedLabel)
      : [origin, destination].some((place) => sameParticipant(place.subject, place.subjectId, selectedLabel, selectedId));
    if (!pertains) continue;
    const definition = { kind: 'place', source: originLabel, target: destinationLabel,
      sourceRole: clean(origin.label), targetRole: clean(destination.label), direction: 'directed' };
    addOccurrence(placeGroups, `${compare(originLabel)}→${compare(destinationLabel)}`, definition, row);
  }
  const sort = (a, b) => b.occurrences - a.occurrences || a.source.localeCompare(b.source) || a.target.localeCompare(b.target);
  return { entities: [...entityGroups.values()].sort(sort), places: [...placeGroups.values()].sort(sort) };
}
