/*
 * Search-result helpers for Peridot's Advanced Search workspace.
 *
 * Phase 1 scope:
 * - derive lightweight result-card records from the already filtered active rows;
 * - explain which applied search terms appear to have matched a row;
 * - keep the helper pure so Search UI and Inspector routing remain separate.
 *
 * This helper deliberately does not introduce a new query language. The active
 * dataset is still defined by App.jsx's existing Search & Filter state and the
 * existing draft/apply workflow. Later phases can extend this file with facets,
 * capability filters, browse indexes, or a structured criteria builder.
 */

const FIELD_LABELS = {
  date: 'Date',
  displayDate: 'Display date',
  sourcePerson: 'Source entity',
  targetPerson: 'Target entity',
  sourcePlaceLabel: 'Source place',
  targetPlaceLabel: 'Target place',
  sourcePlace: 'Source place',
  targetPlace: 'Target place',
  relationshipType: 'Relationship',
  topic: 'Topic',
  language: 'Language',
  title: 'Title',
  citation: 'Citation',
  notes: 'Notes',
};

const TITLE_FIELDS = ['title', 'recordTitle', 'Title', 'Record_Title', 'Letter_Title', 'label'];
const DATE_FIELDS = ['displayDate', 'date', 'Date', 'Date*', 'dateDisplay', 'dateLabel'];
const SOURCE_PERSON_FIELDS = ['sourcePerson', 'Source', 'Source_Person', 'Source_Entity', 'sender', 'Sender'];
const TARGET_PERSON_FIELDS = ['targetPerson', 'Target', 'Target_Person', 'Target_Entity', 'recipient', 'Recipient'];
const SOURCE_PLACE_FIELDS = ['sourcePlaceLabel', 'sourcePlace', 'Source_Loc', 'Source_Place', 'sourceLocation'];
const TARGET_PLACE_FIELDS = ['targetPlaceLabel', 'targetPlace', 'Target_Inferred_Loc', 'Target_Loc', 'Target_Place', 'targetLocation'];

function asText(value) {
  return String(value ?? '').trim();
}

function firstText(row, fields) {
  for (const field of fields) {
    const value = asText(row?.[field]);
    if (value) return value;
  }
  return '';
}

function includesNeedle(value, needle) {
  const cleanNeedle = asText(needle).toLowerCase();
  if (!cleanNeedle) return false;
  return asText(value).toLowerCase().includes(cleanNeedle);
}

function collectSearchableFields(row) {
  return Object.entries(row || {})
    .filter(([, value]) => value !== null && value !== undefined && asText(value))
    .map(([key, value]) => ({
      key,
      label: FIELD_LABELS[key] || key.replace(/_/g, ' '),
      value: asText(value),
    }));
}

function findFirstFieldMatch(row, query, preferredKeys = []) {
  const cleanQuery = asText(query);
  if (!cleanQuery) return null;
  const fields = collectSearchableFields(row);
  const preferred = fields.filter((field) => preferredKeys.includes(field.key));
  const remaining = fields.filter((field) => !preferredKeys.includes(field.key));
  return [...preferred, ...remaining].find((field) => includesNeedle(field.value, cleanQuery)) || null;
}

function compactRouteLabel(source, target) {
  const cleanSource = asText(source) || 'Unknown source';
  const cleanTarget = asText(target) || 'Unknown target';
  return `${cleanSource} → ${cleanTarget}`;
}

function buildResultTitle(row, index) {
  const explicitTitle = firstText(row, TITLE_FIELDS);
  if (explicitTitle) return explicitTitle;

  const sourcePerson = firstText(row, SOURCE_PERSON_FIELDS);
  const targetPerson = firstText(row, TARGET_PERSON_FIELDS);
  if (sourcePerson || targetPerson) return compactRouteLabel(sourcePerson, targetPerson);

  const sourcePlace = firstText(row, SOURCE_PLACE_FIELDS);
  const targetPlace = firstText(row, TARGET_PLACE_FIELDS);
  if (sourcePlace || targetPlace) return compactRouteLabel(sourcePlace, targetPlace);

  return `Record ${index + 1}`;
}

function buildMatchedFields(row, appliedFilters) {
  const matches = [];
  const keywordMatch = findFirstFieldMatch(row, appliedFilters.search, []);
  if (keywordMatch) {
    matches.push({
      label: `Keyword in ${keywordMatch.label}`,
      value: keywordMatch.value,
    });
  }

  const personMatch = findFirstFieldMatch(row, appliedFilters.personFilter, SOURCE_PERSON_FIELDS.concat(TARGET_PERSON_FIELDS));
  if (personMatch) {
    matches.push({ label: `Person in ${personMatch.label}`, value: personMatch.value });
  }

  const placeMatch = findFirstFieldMatch(row, appliedFilters.placeFilter, SOURCE_PLACE_FIELDS.concat(TARGET_PLACE_FIELDS));
  if (placeMatch) {
    matches.push({ label: `Place in ${placeMatch.label}`, value: placeMatch.value });
  }

  const routePlaceQuery = asText(appliedFilters.routePlaceFilter);
  if (routePlaceQuery) {
    const placeRoute = compactRouteLabel(firstText(row, SOURCE_PLACE_FIELDS), firstText(row, TARGET_PLACE_FIELDS));
    if (includesNeedle(placeRoute, routePlaceQuery)) {
      matches.push({ label: 'Route place', value: placeRoute });
    }
  }

  const routePeopleQuery = asText(appliedFilters.routePeopleFilter);
  if (routePeopleQuery) {
    const peopleRoute = compactRouteLabel(firstText(row, SOURCE_PERSON_FIELDS), firstText(row, TARGET_PERSON_FIELDS));
    if (includesNeedle(peopleRoute, routePeopleQuery)) {
      matches.push({ label: 'Route entities', value: peopleRoute });
    }
  }

  return matches.slice(0, 4);
}

function buildCapabilityBadges(row) {
  const badges = [];
  const hasPeople = Boolean(firstText(row, SOURCE_PERSON_FIELDS) || firstText(row, TARGET_PERSON_FIELDS));
  const hasPlaces = Boolean(firstText(row, SOURCE_PLACE_FIELDS) || firstText(row, TARGET_PLACE_FIELDS));
  const hasDate = Boolean(firstText(row, DATE_FIELDS));
  const hasCoordinates = Boolean(row?.mappable || row?.sourceLat || row?.targetLat || row?.lat || row?.latitude);

  if (hasPeople || hasPlaces) badges.push('Inspector-ready');
  if (hasPlaces || hasCoordinates) badges.push('Map-relevant');
  if (hasPeople) badges.push('Entity-linked');
  if (hasDate) badges.push('Timeline-ready');

  return badges.slice(0, 4);
}

export function buildPeridotSearchResults(rows = [], appliedFilters = {}, options = {}) {
  const limit = Math.max(1, options.limit ?? 50);
  return rows.slice(0, limit).map((row, index) => {
    const sourcePerson = firstText(row, SOURCE_PERSON_FIELDS);
    const targetPerson = firstText(row, TARGET_PERSON_FIELDS);
    const sourcePlace = firstText(row, SOURCE_PLACE_FIELDS);
    const targetPlace = firstText(row, TARGET_PLACE_FIELDS);
    const displayDate = firstText(row, DATE_FIELDS) || 'Undated';
    const matchedFields = buildMatchedFields(row, appliedFilters);

    return {
      id: row?.id || row?.recordId || row?.Record_ID || row?.Letter_ID || `search-result-${index}`,
      index,
      row,
      title: buildResultTitle(row, index),
      displayDate,
      peopleRoute: compactRouteLabel(sourcePerson, targetPerson),
      placeRoute: compactRouteLabel(sourcePlace, targetPlace),
      sourcePerson,
      targetPerson,
      sourcePlace,
      targetPlace,
      matchedFields,
      capabilityBadges: buildCapabilityBadges(row),
    };
  });
}
