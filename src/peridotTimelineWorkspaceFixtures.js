import {
  buildPeridotTimelineCategoryFields,
  buildPeridotTimelineWorkspaceEvents,
  filterPeridotTimelineEventsByCategories,
} from './peridotTimelineWorkspaceModel.js';

function assertion({
  id,
  role,
  start,
  end = start,
  display,
  sourceText = display,
  shape = 'point',
  subjectParticipantIndex = null,
  boundedness = 'closed',
  precision = 'day',
  qualifier = 'exact',
}) {
  return {
    id,
    role,
    display,
    sourceText,
    temporalShape: shape,
    boundedness,
    precision,
    qualifier,
    consistency: 'valid',
    parsingStatus: 'parsed',
    sortBounds: { start, end },
    visualizationUsability: { timelinePositionable: true },
    subjectParticipantIndex,
  };
}

function evidence({ key, label, value, subjectId = '', subjectType = 'record', assertionId }) {
  return {
    key,
    label,
    value,
    subjectId,
    subjectType,
    subjectLabel: subjectType === 'entity' ? subjectId : 'Record',
    assertionId,
    sourceColumn: key,
  };
}

export function runPeridotTimelineWorkspaceFixtureAudit() {
  const rows = [
    {
      id: 'row_cosimo_siena',
      generalizedObservation: {
        rowIndex: 0,
        recordId: 'record:cosimo-siena',
        participants: [
          { value: 'Cosimo II', entityId: 'entity:cosimo-ii' },
          { value: 'Maria Maddalena', entityId: 'entity:maria-maddalena' },
        ],
      },
      temporalAssertions: [
        assertion({
          id: 'date-1',
          role: 'Letter date',
          start: 16120104,
          display: '4 January 1612',
        }),
        assertion({
          id: 'life-1',
          role: 'Lifespan',
          start: 15900512,
          end: 16210228,
          display: '1590–1621',
          shape: 'interval',
          precision: 'range',
          subjectParticipantIndex: 0,
        }),
      ],
      peridotCanonicalEvidenceFields: [
        evidence({ key: 'Topic', label: 'Topic', value: 'Diplomacy', assertionId: 'evidence:1' }),
        evidence({ key: 'Topic', label: 'Topic', value: 'Travel', assertionId: 'evidence:2' }),
        evidence({ key: 'Place type', label: 'Place type', value: 'Court', assertionId: 'evidence:3' }),
      ],
    },
    {
      id: 'row_cosimo_milano',
      generalizedObservation: {
        rowIndex: 1,
        recordId: 'record:cosimo-milano',
        participants: [{ value: 'Cosimo II', entityId: 'entity:cosimo-ii' }],
      },
      temporalAssertions: [
        assertion({
          id: 'date-2',
          role: 'Letter date',
          start: 16130700,
          end: 16130700,
          display: 'July 1613',
          precision: 'month',
          qualifier: 'circa',
          shape: 'approximatePoint',
        }),
      ],
      peridotCanonicalEvidenceFields: [
        evidence({ key: 'Topic', label: 'Topic', value: 'Diplomacy', assertionId: 'evidence:4' }),
        evidence({ key: 'Faction', label: 'Faction', value: 'Medici', assertionId: 'evidence:5' }),
      ],
    },
    {
      id: 'row_unrelated',
      generalizedObservation: {
        rowIndex: 2,
        recordId: 'record:unrelated',
        participants: [{ value: 'Unrelated Person', entityId: 'entity:unrelated' }],
      },
      temporalAssertions: [
        assertion({ id: 'date-3', role: 'Letter date', start: 16140101, display: '1 January 1614' }),
      ],
      peridotCanonicalEvidenceFields: [
        evidence({ key: 'Topic', label: 'Topic', value: 'Family', assertionId: 'evidence:6' }),
      ],
    },
  ];

  // This subset stands in for the rows returned by Search/Explore for a query
  // such as Cosimo II AND (Siena OR Milano). Timeline must not reintroduce the
  // unrelated row once Search has established visualization scope.
  const appliedSearchScope = rows.slice(0, 2);
  const events = buildPeridotTimelineWorkspaceEvents(appliedSearchScope);
  const fields = buildPeridotTimelineCategoryFields(events);
  const diplomacyOnly = filterPeridotTimelineEventsByCategories(events, [
    { fieldKey: 'Topic', value: 'Diplomacy' },
  ]);
  const travelOrMedici = filterPeridotTimelineEventsByCategories(events, [
    { fieldKey: 'Topic', value: 'Travel' },
    { fieldKey: 'Faction', value: 'Medici' },
  ]);

  const sienaEvents = events.filter((event) => event.rowId === 'row_cosimo_siena');
  const lifespanEvent = sienaEvents.find((event) => event.temporalRole === 'Lifespan');
  const topicField = fields.find((field) => field.key === 'Topic');

  const checks = {
    searchScopeRemainsAuthoritative:
      events.length === 3
      && !events.some((event) => event.rowId === 'row_unrelated'),
    pluralTemporalAssertionsBecomePluralEvents:
      sienaEvents.length === 2,
    temporalSemanticsArePreserved:
      lifespanEvent?.temporalKind === 'interval'
      && lifespanEvent.windowStart === 15900512
      && lifespanEvent.windowEnd === 16210228,
    participantTemporalSubjectIsPreserved:
      lifespanEvent?.subject?.type === 'entity'
      && lifespanEvent.subject.id === 'entity:cosimo-ii'
      && lifespanEvent.subject.participantIndex === 0,
    recordTemporalSubjectIsPreserved:
      sienaEvents.find((event) => event.temporalRole === 'Letter date')?.subject?.type === 'record',
    multipleCategoriesAttachToOneEvent:
      sienaEvents[0]?.categoryMemberships?.filter((membership) => membership.fieldKey === 'Topic').length === 2,
    categoryInventoryIsEvidenceDriven:
      fields.map((field) => field.key).sort().join('|') === 'Faction|Place type|Topic',
    categoryCountsAreEventCounts:
      topicField?.eventCount === 3
      && topicField.values.find((value) => value.value === 'Diplomacy')?.eventCount === 3,
    categoryVisibilityIsOrBased:
      travelOrMedici.length === 3
      && new Set(travelOrMedici.map((event) => event.rowId)).size === 2,
    singleCategoryVisibilityWorks:
      diplomacyOnly.length === 3,
    uncertaintyMetadataSurvivesProjection:
      events.find((event) => event.rowId === 'row_cosimo_milano')?.qualifier === 'circa'
      && events.find((event) => event.rowId === 'row_cosimo_milano')?.precision === 'month',
  };

  return Object.freeze({
    pass: Object.values(checks).every(Boolean),
    checks: Object.freeze(checks),
    summary: Object.freeze({
      scopedRows: appliedSearchScope.length,
      events: events.length,
      categoryFields: fields.length,
    }),
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const result = runPeridotTimelineWorkspaceFixtureAudit();
  console.log(JSON.stringify(result, null, 2));
  if (!result.pass) process.exitCode = 1;
}
