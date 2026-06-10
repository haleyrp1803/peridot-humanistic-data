/*
 * Search-result helpers for Peridot's Advanced Search workspace.
 *
 * Phase 2 scope:
 * - derive lightweight result-card records from the already filtered active rows;
 * - explain which applied search terms and capability filters matched a row;
 * - expose capability predicates for App.jsx's global Search & Filter pipeline;
 * - derive result facets/counts for Search refinement without introducing saved-search persistence.
 *
 * Phase 3 scope:
 * - add a small structured-criteria evaluator for App.jsx's global active-row
 *   filtering pipeline;
 * - support simple non-nested Boolean operators: Must match, Can also match, and
 *   Exclude;
 * - keep all helper functions pure and UI-agnostic so the Search workspace can
 *   remain a presentation/control surface rather than a second data pipeline.
 *
 * Phase 4 scope:
 * - support a dataset-wide Browse index by allowing structured criteria to match
 *   evidence/custom field labels, not only evidence field values.
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
  sourceLoc: 'Source place',
  targetLoc: 'Target place',
  relationshipType: 'Relationship',
  relationship: 'Relationship',
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
const SOURCE_PLACE_FIELDS = ['sourcePlaceLabel', 'sourcePlace', 'sourceLoc', 'Source_Loc', 'Source_Place', 'sourceLocation'];
const TARGET_PLACE_FIELDS = ['targetPlaceLabel', 'targetPlace', 'targetLoc', 'Target_Inferred_Loc', 'Target_Loc', 'Target_Place', 'targetLocation'];
const COORDINATE_FIELDS = ['sourceLat', 'sourceLon', 'targetLat', 'targetLon', 'lat', 'lon', 'latitude', 'longitude'];
const EVIDENCE_FIELDS = [
  'archivalCollection',
  'archivalPage',
  'pdfPage',
  'relationship',
  'relationshipType',
  'cipher',
  'topic',
  'language',
  'transcription',
  'translation',
  'notes',
  'citation',
  'sourceTitle',
  'targetTitle',
];

const CORE_FIELDS = new Set([
  'id',
  'recordId',
  'parsedDate',
  ...TITLE_FIELDS,
  ...DATE_FIELDS,
  ...SOURCE_PERSON_FIELDS,
  ...TARGET_PERSON_FIELDS,
  ...SOURCE_PLACE_FIELDS,
  ...TARGET_PLACE_FIELDS,
  ...COORDINATE_FIELDS,
  'sourcePlaceId',
  'targetPlaceId',
  'mappable',
  'personKey',
]);

export const CAPABILITY_FILTER_OPTIONS = Object.freeze([
  {
    id: 'inspector-ready',
    label: 'Inspector-ready',
    shortLabel: 'Inspector',
    description: 'Rows with enough content to open as evidence records.',
  },
  {
    id: 'map-ready',
    label: 'Map-relevant',
    shortLabel: 'Map',
    description: 'Rows with place names or coordinate evidence.',
  },
  {
    id: 'route-ready',
    label: 'Route-ready',
    shortLabel: 'Route',
    description: 'Rows with source/target route evidence.',
  },
  {
    id: 'network-ready',
    label: 'Network-ready',
    shortLabel: 'Network',
    description: 'Rows with source and target people/entities.',
  },
  {
    id: 'timeline-ready',
    label: 'Timeline-ready',
    shortLabel: 'Timeline',
    description: 'Rows with a usable date/display-date value.',
  },
  {
    id: 'evidence-ready',
    label: 'Evidence-rich',
    shortLabel: 'Evidence',
    description: 'Rows with notes, topics, citations, transcription, or custom metadata.',
  },
  {
    id: 'missing-date',
    label: 'Missing date',
    shortLabel: 'No date',
    description: 'Rows without a date/display-date value.',
  },
  {
    id: 'missing-coordinates',
    label: 'Missing coordinates',
    shortLabel: 'No coordinates',
    description: 'Rows without detected route or point coordinates.',
  },
]);

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

function hasFiniteCoordinate(value) {
  if (value === null || value === undefined || value === '') return false;
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric !== 0;
}

function hasAnyCoordinate(row) {
  if (row?.mappable) return true;
  return COORDINATE_FIELDS.some((field) => hasFiniteCoordinate(row?.[field]));
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

function hasAnyEvidenceField(row) {
  if (!row || typeof row !== 'object') return false;
  if (EVIDENCE_FIELDS.some((field) => asText(row[field]))) return true;
  return Object.entries(row).some(([key, value]) => !CORE_FIELDS.has(key) && asText(value));
}

function hasAnySearchableContent(row) {
  return collectSearchableFields(row).length > 0;
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

function addFacetCount(map, rawValue) {
  const value = asText(rawValue);
  if (!value) return;
  map.set(value, (map.get(value) || 0) + 1);
}

function facetItemsFromMap(map, limit = 8) {
  return Array.from(map.entries())
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return a.value.localeCompare(b.value);
    })
    .slice(0, limit);
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

function getRowCapabilityState(row) {
  const sourcePerson = firstText(row, SOURCE_PERSON_FIELDS);
  const targetPerson = firstText(row, TARGET_PERSON_FIELDS);
  const sourcePlace = firstText(row, SOURCE_PLACE_FIELDS);
  const targetPlace = firstText(row, TARGET_PLACE_FIELDS);
  const hasPeople = Boolean(sourcePerson || targetPerson);
  const hasEntityRoute = Boolean(sourcePerson && targetPerson);
  const hasPlaces = Boolean(sourcePlace || targetPlace);
  const hasPlaceRoute = Boolean(sourcePlace && targetPlace);
  const hasDate = Boolean(firstText(row, DATE_FIELDS));
  const hasCoordinates = hasAnyCoordinate(row);
  const hasEvidence = hasAnyEvidenceField(row);
  return {
    hasPeople,
    hasEntityRoute,
    hasPlaces,
    hasPlaceRoute,
    hasDate,
    hasCoordinates,
    hasEvidence,
    inspectorReady: hasAnySearchableContent(row),
    mapReady: hasPlaces || hasCoordinates,
    routeReady: hasPlaceRoute || Boolean(row?.mappable),
    networkReady: hasEntityRoute,
    timelineReady: hasDate,
    evidenceReady: hasEvidence,
    missingDate: !hasDate,
    missingCoordinates: !hasCoordinates,
  };
}

export function rowMatchesSearchCapabilityFilter(row, filterId) {
  const state = getRowCapabilityState(row);
  switch (filterId) {
    case 'inspector-ready':
      return state.inspectorReady;
    case 'map-ready':
      return state.mapReady;
    case 'route-ready':
      return state.routeReady;
    case 'network-ready':
      return state.networkReady;
    case 'timeline-ready':
      return state.timelineReady;
    case 'evidence-ready':
      return state.evidenceReady;
    case 'missing-date':
      return state.missingDate;
    case 'missing-coordinates':
      return state.missingCoordinates;
    default:
      return true;
  }
}

export function getCapabilityFilterLabel(filterId) {
  return CAPABILITY_FILTER_OPTIONS.find((option) => option.id === filterId)?.label || filterId;
}

function valuesForStructuredField(row, field) {
  if (field === 'person') return SOURCE_PERSON_FIELDS.concat(TARGET_PERSON_FIELDS).map((key) => row?.[key]);
  if (field === 'place') return SOURCE_PLACE_FIELDS.concat(TARGET_PLACE_FIELDS).map((key) => row?.[key]);
  if (field === 'routePlace') {
    return [compactRouteLabel(firstText(row, SOURCE_PLACE_FIELDS), firstText(row, TARGET_PLACE_FIELDS))];
  }
  if (field === 'routePeople') {
    return [compactRouteLabel(firstText(row, SOURCE_PERSON_FIELDS), firstText(row, TARGET_PERSON_FIELDS))];
  }
  if (field === 'date') return DATE_FIELDS.map((key) => row?.[key]).concat(row?.parsedDate?.year, row?.parsedDate?.monthKey);
  if (field === 'evidenceFieldPresent') {
    return Object.entries(row || {})
      .filter(([key, value]) => !CORE_FIELDS.has(key) && asText(value))
      .map(([key]) => FIELD_LABELS[key] || key.replace(/_/g, ' '));
  }
  if (field === 'evidence') {
    const explicitEvidence = EVIDENCE_FIELDS.map((key) => row?.[key]);
    const customEvidence = Object.entries(row || {})
      .filter(([key, value]) => !CORE_FIELDS.has(key) && asText(value))
      .map(([, value]) => value);
    return explicitEvidence.concat(customEvidence);
  }
  return collectSearchableFields(row).map((fieldRecord) => fieldRecord.value);
}

function criterionNeedsValue(mode) {
  return mode !== 'isEmpty' && mode !== 'isNotEmpty';
}

function valueMatchesMode(value, mode, query) {
  const text = asText(value);
  const q = asText(query);
  if (mode === 'isEmpty') return !text;
  if (mode === 'isNotEmpty') return Boolean(text);
  if (!q) return true;
  if (mode === 'exact') return text.toLowerCase() === q.toLowerCase();
  if (mode === 'startsWith') return text.toLowerCase().startsWith(q.toLowerCase());
  return text.toLowerCase().includes(q.toLowerCase());
}

function normalizeStructuredOperator(operator) {
  return ['must', 'should', 'exclude'].includes(operator) ? operator : 'must';
}

function normalizeStructuredCriteria(criteria = []) {
  return (Array.isArray(criteria) ? criteria : [])
    .map((criterion) => ({
      operator: normalizeStructuredOperator(criterion?.operator),
      field: criterion?.field || 'any',
      mode: criterion?.mode || 'contains',
      value: asText(criterion?.value),
    }))
    .filter((criterion) => !criterionNeedsValue(criterion.mode) || criterion.value);
}

function rowMatchesStructuredCriterion(row, criterion) {
  if (criterion.field === 'capability') {
    if (!criterionNeedsValue(criterion.mode)) {
      return criterion.mode === 'isNotEmpty';
    }
    const query = asText(criterion.value).toLowerCase();
    const matchingOptions = CAPABILITY_FILTER_OPTIONS.filter((option) => (
      option.id.toLowerCase().includes(query)
      || option.label.toLowerCase().includes(query)
      || option.shortLabel.toLowerCase().includes(query)
    ));
    return matchingOptions.some((option) => rowMatchesSearchCapabilityFilter(row, option.id));
  }
  const values = valuesForStructuredField(row, criterion.field);
  if (criterion.mode === 'isEmpty') return values.every((value) => !asText(value));
  if (criterion.mode === 'isNotEmpty') return values.some((value) => asText(value));
  return values.some((value) => valueMatchesMode(value, criterion.mode, criterion.value));
}

export function rowMatchesStructuredCriteria(row, criteria = []) {
  const normalizedCriteria = normalizeStructuredCriteria(criteria);
  if (!normalizedCriteria.length) return true;

  const mustCriteria = normalizedCriteria.filter((criterion) => criterion.operator === 'must');
  const shouldCriteria = normalizedCriteria.filter((criterion) => criterion.operator === 'should');
  const excludeCriteria = normalizedCriteria.filter((criterion) => criterion.operator === 'exclude');

  const passesMust = mustCriteria.every((criterion) => rowMatchesStructuredCriterion(row, criterion));
  const passesShould = shouldCriteria.length === 0 || shouldCriteria.some((criterion) => rowMatchesStructuredCriterion(row, criterion));
  const passesExclude = excludeCriteria.every((criterion) => !rowMatchesStructuredCriterion(row, criterion));

  return passesMust && passesShould && passesExclude;
}

function structuredOperatorLabel(operator) {
  if (operator === 'should') return 'Can also match';
  if (operator === 'exclude') return 'Exclude';
  return 'Must match';
}

function describeStructuredCriterionMatch(row, criterion) {
  if (criterion.operator === 'exclude') return null;
  if (!rowMatchesStructuredCriterion(row, criterion)) return null;
  const fieldLabel = {
    any: 'Structured criterion',
    person: 'Structured person',
    place: 'Structured place',
    routePlace: 'Structured route place',
    routePeople: 'Structured route people',
    date: 'Structured date',
    evidence: 'Structured evidence',
    evidenceFieldPresent: 'Structured evidence field',
    capability: 'Structured capability',
  }[criterion.field] || 'Structured criterion';
  const operatorPrefix = structuredOperatorLabel(criterion.operator);

  if (criterion.field === 'capability') {
    const matched = CAPABILITY_FILTER_OPTIONS.find((option) => (
      option.id === criterion.value || option.label.toLowerCase() === asText(criterion.value).toLowerCase()
    ));
    return { label: `${operatorPrefix}: ${fieldLabel}`, value: matched?.label || criterion.value || criterion.mode };
  }

  const values = valuesForStructuredField(row, criterion.field);
  if (criterion.mode === 'isEmpty') return { label: `${operatorPrefix}: ${fieldLabel}`, value: 'is empty' };
  if (criterion.mode === 'isNotEmpty') {
    const firstValue = values.find((value) => asText(value));
    return { label: `${operatorPrefix}: ${fieldLabel}`, value: asText(firstValue) || 'is not empty' };
  }
  const matchedValue = values.find((value) => valueMatchesMode(value, criterion.mode, criterion.value));
  return { label: `${operatorPrefix}: ${fieldLabel}`, value: asText(matchedValue) || criterion.value };
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

  const personMatch = findFirstFieldMatch(
    row,
    appliedFilters.personFilter,
    SOURCE_PERSON_FIELDS.concat(TARGET_PERSON_FIELDS),
  );
  if (personMatch) matches.push({ label: `Person in ${personMatch.label}`, value: personMatch.value });

  const placeMatch = findFirstFieldMatch(
    row,
    appliedFilters.placeFilter,
    SOURCE_PLACE_FIELDS.concat(TARGET_PLACE_FIELDS),
  );
  if (placeMatch) matches.push({ label: `Place in ${placeMatch.label}`, value: placeMatch.value });

  const routePlaceQuery = asText(appliedFilters.routePlaceFilter);
  if (routePlaceQuery) {
    const placeRoute = compactRouteLabel(firstText(row, SOURCE_PLACE_FIELDS), firstText(row, TARGET_PLACE_FIELDS));
    if (includesNeedle(placeRoute, routePlaceQuery)) matches.push({ label: 'Route place', value: placeRoute });
  }

  const routePeopleQuery = asText(appliedFilters.routePeopleFilter);
  if (routePeopleQuery) {
    const peopleRoute = compactRouteLabel(firstText(row, SOURCE_PERSON_FIELDS), firstText(row, TARGET_PERSON_FIELDS));
    if (includesNeedle(peopleRoute, routePeopleQuery)) matches.push({ label: 'Route entities', value: peopleRoute });
  }

  const capabilityMatches = (appliedFilters.capabilityFilters || [])
    .filter((filterId) => rowMatchesSearchCapabilityFilter(row, filterId))
    .map((filterId) => ({ label: 'Capability', value: getCapabilityFilterLabel(filterId) }));

  const structuredMatches = normalizeStructuredCriteria(appliedFilters.structuredCriteria)
    .map((criterion) => describeStructuredCriterionMatch(row, criterion))
    .filter(Boolean);

  return matches.concat(capabilityMatches, structuredMatches).slice(0, 5);
}

function buildCapabilityBadges(row) {
  const state = getRowCapabilityState(row);
  const badges = [];
  if (state.inspectorReady) badges.push('Inspector-ready');
  if (state.mapReady) badges.push('Map-relevant');
  if (state.networkReady) badges.push('Network-ready');
  if (state.timelineReady) badges.push('Timeline-ready');
  if (state.evidenceReady) badges.push('Evidence-rich');
  return badges.slice(0, 5);
}

export function buildPeridotSearchFacets(rows = [], options = {}) {
  const limit = Math.max(1, options.limit ?? 8);
  const people = new Map();
  const places = new Map();
  const placeRoutes = new Map();
  const years = new Map();
  const evidenceFields = new Map();

  rows.forEach((row) => {
    const sourcePerson = firstText(row, SOURCE_PERSON_FIELDS);
    const targetPerson = firstText(row, TARGET_PERSON_FIELDS);
    const sourcePlace = firstText(row, SOURCE_PLACE_FIELDS);
    const targetPlace = firstText(row, TARGET_PLACE_FIELDS);
    const year = asText(firstText(row, DATE_FIELDS)).match(/\d{4}/)?.[0] || row?.parsedDate?.year || row?.parsedDate?.monthKey;
    addFacetCount(people, sourcePerson);
    addFacetCount(people, targetPerson);
    addFacetCount(places, sourcePlace);
    addFacetCount(places, targetPlace);
    if (sourcePlace || targetPlace) addFacetCount(placeRoutes, compactRouteLabel(sourcePlace, targetPlace));
    addFacetCount(years, year ? String(year).slice(0, 4) : '');
    Object.entries(row || {}).forEach(([key, value]) => {
      if (!CORE_FIELDS.has(key) && asText(value)) {
        addFacetCount(evidenceFields, FIELD_LABELS[key] || key.replace(/_/g, ' '));
      }
    });
  });

  const capabilityItems = CAPABILITY_FILTER_OPTIONS.map((option) => ({
    value: option.id,
    label: option.label,
    count: rows.filter((row) => rowMatchesSearchCapabilityFilter(row, option.id)).length,
  })).filter((item) => item.count > 0);

  return [
    { id: 'people', label: 'People / entities', type: 'person', items: facetItemsFromMap(people, limit) },
    { id: 'places', label: 'Places', type: 'place', items: facetItemsFromMap(places, limit) },
    { id: 'placeRoutes', label: 'Place routes', type: 'routePlace', items: facetItemsFromMap(placeRoutes, limit) },
    { id: 'years', label: 'Years', type: 'year', items: facetItemsFromMap(years, limit) },
    { id: 'capabilities', label: 'Capabilities', type: 'capability', items: capabilityItems },
    { id: 'evidenceFields', label: 'Evidence fields present', type: 'evidenceField', items: facetItemsFromMap(evidenceFields, limit) },
  ].filter((group) => group.items.length > 0);
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
