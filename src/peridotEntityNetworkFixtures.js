import { derivePeridotEntityNetworkSemantics, derivePeridotGeographicEntityNetworkSemantics, derivePeridotGeographicPersonAnchors, derivePeridotGeographicRelationshipLineSegments, getPeridotGeographicAnchorRoles, getPeridotRowEntityParticipantEntries, getPeridotRowEntityParticipants, getPeridotRowEntityRelationshipLabels, rowHasPeridotEntityRelationship } from './peridotEntityNetwork.js';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

export function runPeridotEntityNetworkSelfAudit() {
  const multipart = derivePeridotEntityNetworkSemantics([
    {
      generalizedObservation: {
        participants: [
          { value: 'Person A', role: 'person' },
          { value: 'Father', role: 'father' },
          { value: 'Mother', role: 'mother' },
          { value: 'Partner', role: 'partner' },
        ],
        places: [],
        relationship: { type: 'family', label: '' },
      },
    },
  ]);

  assert(multipart.relationships.length === 3, 'Multipart mapping should create exactly three asserted Part-A relationships.');
  const pairs = new Set(multipart.relationships.map((edge) => `${edge.source}|${edge.target}`));
  assert(pairs.has('Person A|Father'), 'Person A should connect to Father.');
  assert(pairs.has('Person A|Mother'), 'Person A should connect to Mother.');
  assert(pairs.has('Person A|Partner'), 'Person A should connect to Partner.');
  assert(!pairs.has('Father|Mother'), 'Co-participants must not be connected merely by co-occurrence.');
  assert(multipart.relationships.every((edge) => edge.direction === 'undirected'), 'Generalized relationships without explicit direction must remain undirected.');

  const multipartRow = {
    generalizedObservation: {
      participants: [
        { value: 'Person A', role: 'person' },
        { value: 'Father', role: 'father' },
        { value: 'Mother', role: 'mother' },
        { value: 'Partner', role: 'partner' },
      ],
      places: [],
      relationship: { type: 'family', label: '' },
    },
  };
  assert(rowHasPeridotEntityRelationship(multipartRow), 'Multipart row should report network readiness through shared relationship semantics.');
  assert(getPeridotRowEntityParticipants(multipartRow).join('|') === 'Person A|Father|Mother|Partner', 'Shared participant helper should expose every mapped relationship participant.');
  assert(getPeridotRowEntityRelationshipLabels(multipartRow).join('|') === 'Person A — Father|Person A — Mother|Person A — Partner', 'Shared relationship labels should expose every mapped relationship pair and preserve undirected semantics.');

  const genealogy = derivePeridotEntityNetworkSemantics([
    {
      sourcePerson: 'Father',
      targetPerson: 'Child',
      originalCanonicalItem: {
        id: 'rel-parent',
        participantAId: 'father-id',
        participantBId: 'child-id',
        relationshipType: 'parent-child',
        direction: 'directed',
        participantARole: 'father',
        participantBRole: 'child',
      },
    },
    {
      sourcePerson: 'Person A',
      targetPerson: 'Partner',
      originalCanonicalItem: {
        id: 'rel-partner',
        participantAId: 'a-id',
        participantBId: 'partner-id',
        relationshipType: 'partner',
        direction: 'undirected',
        participantARole: 'partner',
        participantBRole: 'partner',
      },
    },
  ]);

  assert(genealogy.relationships.find((edge) => edge.relationshipType === 'parent-child')?.direction === 'directed', 'Canonical directed genealogy relationship should remain directed.');
  assert(genealogy.relationships.find((edge) => edge.relationshipType === 'partner')?.direction === 'undirected', 'Canonical partnership should remain undirected.');


  const duplicateLabelCanonicalRows = [
    {
      sourcePerson: 'Anne von Habsburg',
      targetPerson: 'Child A',
      sourceEntityId: 'anne-1549',
      targetEntityId: 'child-a',
      originalCanonicalItem: {
        id: 'rel-anne-1549-child-a',
        participantAId: 'anne-1549',
        participantBId: 'child-a',
        relationshipType: 'parent-child',
        direction: 'directed',
        participantARole: 'mother',
        participantBRole: 'child',
      },
    },
    {
      sourcePerson: 'Anne von Habsburg',
      targetPerson: 'Child B',
      sourceEntityId: 'anne-1573',
      targetEntityId: 'child-b',
      originalCanonicalItem: {
        id: 'rel-anne-1573-child-b',
        participantAId: 'anne-1573',
        participantBId: 'child-b',
        relationshipType: 'parent-child',
        direction: 'directed',
        participantARole: 'mother',
        participantBRole: 'child',
      },
    },
  ];
  const duplicateLabelSemantics = derivePeridotEntityNetworkSemantics(duplicateLabelCanonicalRows);
  assert(
    duplicateLabelSemantics.relationships.some((edge) => edge.source === 'Anne von Habsburg' && edge.sourceId === 'anne-1549'),
    'Canonical network semantics should preserve the first same-label entity ID.',
  );
  assert(
    duplicateLabelSemantics.relationships.some((edge) => edge.source === 'Anne von Habsburg' && edge.sourceId === 'anne-1573'),
    'Canonical network semantics should preserve the second same-label entity ID.',
  );
  const duplicateParticipantEntries = getPeridotRowEntityParticipantEntries(duplicateLabelCanonicalRows[0]);
  assert(
    duplicateParticipantEntries.some((participant) => participant.id === 'anne-1549' && participant.label === 'Anne von Habsburg'),
    'Structured participant helper should keep canonical identity separate from display label.',
  );

  const distinct = derivePeridotEntityNetworkSemantics([
    { sourcePerson: 'A', targetPerson: 'B', relationshipType: 'letter', relationshipDirection: 'directed' },
    { sourcePerson: 'B', targetPerson: 'A', relationshipType: 'letter', relationshipDirection: 'directed' },
    { sourcePerson: 'A', targetPerson: 'B', relationshipType: 'patronage', relationshipDirection: 'directed' },
    { sourcePerson: 'A', targetPerson: 'B', relationshipType: 'letter', relationshipDirection: 'directed' },
  ]);

  assert(distinct.relationships.length === 3, 'Opposite directions and distinct relationship types must remain separate.');
  const abLetter = distinct.relationships.find((edge) => edge.source === 'A' && edge.target === 'B' && edge.relationshipType === 'letter');
  assert(abLetter?.count === 2, 'Repeated observations of the same directed relationship should aggregate as count.');

  const places = derivePeridotEntityNetworkSemantics([
    {
      generalizedObservation: {
        participants: [{ value: 'A', role: 'person' }, { value: 'B', role: 'relative' }],
        places: [
          { label: 'Florence', latitude: 43.77, longitude: 11.25, role: 'residence', subjectParticipantIndex: 0 },
          { label: 'Rome', latitude: 41.9, longitude: 12.5, role: 'court', subjectParticipantIndex: 1 },
        ],
        relationship: {},
      },
    },
  ]);
  assert(places.locations.length === 2, 'Explicit participant-place associations should survive into network anchors.');
  assert(places.locations.some((location) => location.person === 'A' && location.label === 'Florence'), 'Part A place association should remain attached to Part A.');
  assert(places.locations.some((location) => location.person === 'B' && location.label === 'Rome'), 'Part B place association should remain attached to Part B.');

  // Geographic People Map regression: canonical genealogy relationships may be
  // undated structural rows while birth/death events carry the explicit places.
  // Timeline filtering of event rows must not erase the family relationship itself.
  const splitScopeGeography = derivePeridotGeographicEntityNetworkSemantics(
    [
      {
        sourcePerson: 'Mother',
        targetPerson: 'Person A',
        originalCanonicalItem: {
          id: 'rel-mother-child',
          participantAId: 'mother-id',
          participantBId: 'person-a-id',
          relationshipType: 'parent-child',
          direction: 'directed',
          participantARole: 'mother',
          participantBRole: 'child',
        },
      },
    ],
    [
      { recordType: 'genealogy-event', sourcePerson: 'Mother', sourceLoc: 'Florence', sourceLat: 43.77, sourceLon: 11.25, eventType: 'childbirth' },
      { recordType: 'genealogy-event', sourcePerson: 'Person A', sourceLoc: 'Florence', sourceLat: 43.77, sourceLon: 11.25, eventType: 'birth' },
    ],
  );
  assert(splitScopeGeography.relationships.length === 1, 'Undated genealogy relationship should survive in the geographic structural scope.');
  assert(splitScopeGeography.locations.length === 2, 'Timeline-visible genealogy events should provide geographic anchors independently of relationship rows.');
  assert(splitScopeGeography.relationships[0]?.source === 'Mother' && splitScopeGeography.relationships[0]?.target === 'Person A', 'Geographic relationship endpoints should preserve canonical genealogy direction.');
  assert(splitScopeGeography.locations.some((location) => location.person === 'Mother' && location.role === 'childbirth'), 'Mother childbirth place should remain attached to Mother.');
  assert(splitScopeGeography.locations.some((location) => location.person === 'Person A' && location.role === 'birth'), 'Person A birth place should remain attached to Person A.');

  const anchorLocations = [
    { person: 'Maria', personId: 'maria-id', label: 'Florence', latitude: 43.77, longitude: 11.25, role: 'Residence', sourceRow: { id: 'm1' } },
    { person: 'Maria', personId: 'maria-id', label: 'Florence', latitude: 43.77, longitude: 11.25, role: 'Court', sourceRow: { id: 'm2' } },
    { person: 'Maria', personId: 'maria-id', label: 'Florence', latitude: 43.77, longitude: 11.25, role: 'Residence', sourceRow: { id: 'm3' } },
    { person: 'Maria', personId: 'maria-id', label: 'Vienna', latitude: 48.21, longitude: 16.37, role: 'Court', sourceRow: { id: 'm4' } },
    { person: 'Cristina', personId: 'cristina-id', label: 'Paris', latitude: 48.86, longitude: 2.35, role: 'Residence', sourceRow: { id: 'c1' } },
    { person: 'Cristina', personId: 'cristina-id', label: 'Madrid', latitude: 40.42, longitude: -3.7, role: 'Court', sourceRow: { id: 'c2' } },
  ];
  const anchorRoles = getPeridotGeographicAnchorRoles(anchorLocations);
  assert(anchorRoles.join('|') === 'Court|Residence', 'Anchor-role discovery should preserve mapped role labels without inventing unlabelled roles.');

  const roleAndFrequencyAnchors = derivePeridotGeographicPersonAnchors(anchorLocations, {
    selectedRoles: ['Residence', 'Court'],
    includeMostFrequent: true,
  });
  const mariaFlorence = roleAndFrequencyAnchors.find((anchor) => anchor.personId === 'maria-id' && anchor.label === 'Florence');
  assert(roleAndFrequencyAnchors.filter((anchor) => anchor.personId === 'maria-id').length === 2, 'Multiple selected place roles should allow one canonical entity to resolve to multiple geographic anchors.');
  assert(mariaFlorence?.reasons.some((reason) => reason.type === 'place-role' && reason.role === 'Residence'), 'Deduplicated anchor should preserve Residence provenance.');
  assert(mariaFlorence?.reasons.some((reason) => reason.type === 'place-role' && reason.role === 'Court'), 'Deduplicated anchor should preserve Court provenance at the same physical location.');
  assert(mariaFlorence?.reasons.some((reason) => reason.type === 'most-frequent-place' && reason.occurrenceCount === 3), 'Most-frequent-place provenance should coexist with mapped role provenance.');
  assert(mariaFlorence?.occurrenceCount === 3, 'Anchor occurrence count should represent all mapped assertions at that person-place coordinate.');

  const residenceOnlyAnchors = derivePeridotGeographicPersonAnchors(anchorLocations, {
    selectedRoles: ['Residence'],
    includeMostFrequent: false,
  });
  assert(residenceOnlyAnchors.some((anchor) => anchor.personId === 'maria-id' && anchor.label === 'Florence'), 'Selected mapped roles should resolve their supported person-place anchors.');
  assert(!residenceOnlyAnchors.some((anchor) => anchor.personId === 'maria-id' && anchor.label === 'Vienna'), 'Unselected mapped roles should not create visible anchor instances.');

  const tiedFrequencyAnchors = derivePeridotGeographicPersonAnchors(anchorLocations, {
    selectedRoles: [],
    includeMostFrequent: true,
  });
  const cristinaFrequencyAnchors = tiedFrequencyAnchors.filter((anchor) => anchor.personId === 'cristina-id');
  assert(cristinaFrequencyAnchors.length === 2, 'A true tie for most-frequent place should preserve every tied location rather than choosing one arbitrarily.');
  assert(cristinaFrequencyAnchors.every((anchor) => anchor.reasons.some((reason) => reason.type === 'most-frequent-place' && reason.tied)), 'Tied most-frequent anchors should expose their tie provenance.');

  const explicitEventRow = {
    id: 'event-1',
    generalizedObservation: {
      participants: [
        { value: 'Maria', entityId: 'maria-id', role: 'sender' },
        { value: 'Cristina', entityId: 'cristina-id', role: 'recipient' },
      ],
      places: [
        { label: 'Florence', latitude: 43.77, longitude: 11.25, role: 'Letter sent from', subjectParticipantIndex: 0 },
        { label: 'Graz', latitude: 47.07, longitude: 15.44, role: 'Letter sent to', subjectParticipantIndex: 1 },
      ],
      relationship: { type: 'letter', direction: 'directed' },
    },
  };
  const explicitEventSemantics = derivePeridotEntityNetworkSemantics([explicitEventRow]);
  const fallbackLocations = [
    { person: 'Maria', personId: 'maria-id', label: 'Rome', latitude: 41.9, longitude: 12.5, role: 'Residence' },
    { person: 'Maria', personId: 'maria-id', label: 'Rome', latitude: 41.9, longitude: 12.5, role: 'Residence' },
    { person: 'Cristina', personId: 'cristina-id', label: 'Paris', latitude: 48.86, longitude: 2.35, role: 'Residence' },
    { person: 'Cristina', personId: 'cristina-id', label: 'Paris', latitude: 48.86, longitude: 2.35, role: 'Residence' },
  ];
  const explicitEventSegments = derivePeridotGeographicRelationshipLineSegments(
    explicitEventSemantics.relationships,
    fallbackLocations,
    { lineAnchorRule: 'event-location', fallbackRule: 'most-frequent' },
  );
  assert(explicitEventSegments.length === 1, 'One explicitly located relationship event should create one geographic line segment.');
  assert(explicitEventSegments[0]?.sourceLocation?.label === 'Florence' && explicitEventSegments[0]?.targetLocation?.label === 'Graz', 'Explicit participant-specific event geography should override representative fallback anchors.');
  assert(explicitEventSegments[0]?.geographicSources?.includes('connection-event'), 'Explicit event line segments should preserve their geographic provenance.');

  const incompleteEventRow = {
    id: 'event-2',
    generalizedObservation: {
      participants: [
        { value: 'Maria', entityId: 'maria-id', role: 'sender' },
        { value: 'Cristina', entityId: 'cristina-id', role: 'recipient' },
      ],
      places: [
        { label: 'Vienna', latitude: 48.21, longitude: 16.37, role: 'Letter sent from', subjectParticipantIndex: 0 },
      ],
      relationship: { type: 'letter', direction: 'directed' },
    },
  };
  const incompleteSemantics = derivePeridotEntityNetworkSemantics([incompleteEventRow]);
  const fallbackSegments = derivePeridotGeographicRelationshipLineSegments(
    incompleteSemantics.relationships,
    fallbackLocations,
    { lineAnchorRule: 'event-location', fallbackRule: 'most-frequent' },
  );
  assert(fallbackSegments.length === 1, 'Incomplete event geography should use one explicit fallback pair rather than multiplying anchors.');
  assert(fallbackSegments[0]?.sourceLocation?.label === 'Rome' && fallbackSegments[0]?.targetLocation?.label === 'Paris', 'Fallback geography should apply to both endpoints together when the event pair is incomplete.');
  assert(fallbackSegments[0]?.geographicSources?.includes('fallback:most-frequent'), 'Fallback line segments should preserve fallback provenance.');

  const roleSegments = derivePeridotGeographicRelationshipLineSegments(
    explicitEventSemantics.relationships,
    fallbackLocations,
    { lineAnchorRule: 'role:Residence', fallbackRule: 'none' },
  );
  assert(roleSegments.length === 1 && roleSegments[0]?.sourceLocation?.label === 'Rome' && roleSegments[0]?.targetLocation?.label === 'Paris', 'A selected relationship-line place role should resolve one representative place per endpoint.');

  return {
    multipartEdgeCount: multipart.relationships.length,
    genealogyEdgeCount: genealogy.relationships.length,
    distinctRelationshipCount: distinct.relationships.length,
    locationAssertionCount: places.locations.length,
    splitScopeGeographicRelationshipCount: splitScopeGeography.relationships.length,
    splitScopeGeographicLocationCount: splitScopeGeography.locations.length,
    geographicAnchorRoleCount: anchorRoles.length,
    geographicAnchorInstanceCount: roleAndFrequencyAnchors.length,
  };
}
