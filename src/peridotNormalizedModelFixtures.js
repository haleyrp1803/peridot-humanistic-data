/*
 * Deterministic fixtures and callable self-audit for the canonical model.
 *
 * Peridot has no test runner at checkpoint 619bab0. These fixtures provide
 * dependency-free verification without changing package.json or runtime wiring.
 */

import {
  makePeridotCanonicalId,
  makePeridotEntity,
  makePeridotEvent,
  makePeridotEvidenceSource,
  makePeridotNormalizedDataset,
  makePeridotParticipation,
  makePeridotPlace,
  makePeridotRecord,
  makePeridotRelationship,
  PERIDOT_ENTITY_TYPES,
  PERIDOT_RELATIONSHIP_DIRECTIONS,
  PERIDOT_TARGET_TYPES,
} from './peridotNormalizedModel.js';
import { makePeridotProvenance, PERIDOT_PROVENANCE_STATUS } from './peridotNormalizationProvenance.js';
import { parsePeridotTemporalRange, parsePeridotTemporalValue } from './peridotTemporalAssertions.js';
import { validatePeridotNormalizedDataset } from './peridotNormalizedValidation.js';

const DATASET_ID = 'fixture-correspondence';

function provenance(rowNumber, columns, status = PERIDOT_PROVENANCE_STATUS.TRANSFORMED) {
  return makePeridotProvenance({
    source: {
      sourceFileId: 'fixture.csv',
      sourceFileName: 'fixture.csv',
      sourceSheet: 'Uploaded table',
      sourceRowNumber: rowNumber,
      sourceColumns: columns,
    },
    mappingProfileId: 'correspondence-profile',
    mappingProfileVersion: '1',
    transformation: 'fixture normalization',
    status,
    userConfirmed: true,
  });
}

export function buildValidPeridotNormalizedFixture() {
  const sourceId = makePeridotCanonicalId({ itemType: 'agent', datasetId: DATASET_ID, sourceId: 'person-1' });
  const targetId = makePeridotCanonicalId({ itemType: 'agent', datasetId: DATASET_ID, sourceId: 'person-2' });
  const sourcePlaceId = makePeridotCanonicalId({ itemType: 'place', datasetId: DATASET_ID, sourceId: 'florence' });
  const targetPlaceId = makePeridotCanonicalId({ itemType: 'place', datasetId: DATASET_ID, sourceId: 'siena' });
  const evidenceId = makePeridotCanonicalId({ itemType: 'evidence', datasetId: DATASET_ID, sourceSheet: 'Uploaded table', sourceRowNumber: 2, role: 'citation' });
  const recordId = makePeridotCanonicalId({ itemType: 'record', datasetId: DATASET_ID, sourceSheet: 'Uploaded table', sourceRowNumber: 2 });
  const relationshipId = makePeridotCanonicalId({ itemType: 'relationship', datasetId: DATASET_ID, sourceSheet: 'Uploaded table', sourceRowNumber: 2, role: 'correspondence' });
  const sourceParticipationId = makePeridotCanonicalId({ itemType: 'participation', datasetId: DATASET_ID, sourceSheet: 'Uploaded table', sourceRowNumber: 2, role: 'sender' });
  const targetParticipationId = makePeridotCanonicalId({ itemType: 'participation', datasetId: DATASET_ID, sourceSheet: 'Uploaded table', sourceRowNumber: 2, role: 'recipient' });

  return makePeridotNormalizedDataset({
    datasetId: DATASET_ID,
    datasetLabel: 'Valid correspondence fixture',
    sourceManifest: { files: ['fixture.csv'] },
    mappingProfile: { id: 'correspondence-profile', version: '1' },
    entities: [
      makePeridotEntity({ id: sourceId, entityType: PERIDOT_ENTITY_TYPES.AGENT, subtype: 'person', label: 'Person One', provenance: provenance(2, ['Source_Name']) }),
      makePeridotEntity({ id: targetId, entityType: PERIDOT_ENTITY_TYPES.AGENT, subtype: 'person', label: 'Person Two', provenance: provenance(2, ['Target_Name']) }),
    ],
    places: [
      makePeridotPlace({ id: sourcePlaceId, label: 'Florence', latitude: 43.7696, longitude: 11.2558, provenance: provenance(2, ['Source_Location', 'Source_Latitude', 'Source_Longitude']) }),
      makePeridotPlace({ id: targetPlaceId, label: 'Siena', latitude: 43.3188, longitude: 11.3308, provenance: provenance(2, ['Target_Location', 'Target_Latitude', 'Target_Longitude']) }),
    ],
    evidenceSources: [
      makePeridotEvidenceSource({ id: evidenceId, sourceType: 'archive', archive: 'Fixture Archive', collection: 'Fixture Collection', pages: '1r', provenance: provenance(2, ['Archive', 'Collection', 'Page(s)'], PERIDOT_PROVENANCE_STATUS.IMPORTED_DIRECTLY) }),
    ],
    records: [
      makePeridotRecord({ id: recordId, recordType: 'letter', label: 'Letter from Person One to Person Two', temporalAssertion: parsePeridotTemporalValue('1608/03/03'), participantIds: [sourceId, targetId], placeReferenceIds: [sourcePlaceId, targetPlaceId], evidenceSourceIds: [evidenceId], provenance: provenance(2, ['Date', 'Source_Name', 'Target_Name']) }),
    ],
    relationships: [
      makePeridotRelationship({ id: relationshipId, relationshipType: 'correspondence', direction: PERIDOT_RELATIONSHIP_DIRECTIONS.DIRECTED, participantAId: sourceId, participantBId: targetId, participantARole: 'sender', participantBRole: 'recipient', evidenceSourceIds: [evidenceId], provenance: provenance(2, ['Source_Name', 'Target_Name']) }),
    ],
    participations: [
      makePeridotParticipation({ id: sourceParticipationId, subjectId: sourceId, targetType: PERIDOT_TARGET_TYPES.RECORD, targetId: recordId, role: 'sender', provenance: provenance(2, ['Source_Name']) }),
      makePeridotParticipation({ id: targetParticipationId, subjectId: targetId, targetType: PERIDOT_TARGET_TYPES.RECORD, targetId: recordId, role: 'recipient', provenance: provenance(2, ['Target_Name']) }),
    ],
  });
}

export function buildInvalidPeridotNormalizedFixture() {
  const missingEntityId = 'agent:fixture:missing';
  const duplicateId = 'agent:fixture:duplicate';
  return makePeridotNormalizedDataset({
    datasetId: 'fixture-invalid',
    entities: [
      makePeridotEntity({ id: duplicateId, entityType: PERIDOT_ENTITY_TYPES.AGENT, label: 'Duplicate One' }),
      makePeridotEntity({ id: duplicateId, entityType: PERIDOT_ENTITY_TYPES.AGENT, label: 'Duplicate Two' }),
    ],
    places: [makePeridotPlace({ id: 'place:fixture:bad', label: 'Bad Coordinates', latitude: 120, longitude: null })],
    events: [makePeridotEvent({ id: 'event:fixture:birth', eventType: '', participantIds: [missingEntityId], temporalAssertion: parsePeridotTemporalRange({ startValue: '1700', endValue: '1600' }) })],
    relationships: [makePeridotRelationship({ id: 'relationship:fixture:self', relationshipType: 'parent', direction: PERIDOT_RELATIONSHIP_DIRECTIONS.DIRECTED, participantAId: duplicateId, participantBId: duplicateId })],
  });
}

export function runPeridotNormalizedModelSelfAudit() {
  const validFixture = buildValidPeridotNormalizedFixture();
  const invalidFixture = buildInvalidPeridotNormalizedFixture();
  const validReport = validatePeridotNormalizedDataset(validFixture);
  const invalidReport = validatePeridotNormalizedDataset(invalidFixture);

  const checks = Object.freeze({
    validFixturePasses: validReport.valid === true,
    invalidFixtureFails: invalidReport.valid === false,
    invalidFixtureBlocksCommit: invalidReport.canCommit === false,
    duplicateIdDetected: invalidReport.issues.some((item) => item.code === 'duplicate_id'),
    unresolvedReferenceDetected: invalidReport.issues.some((item) => item.code === 'unresolved_event_participant'),
    invalidCoordinateDetected: invalidReport.issues.some((item) => item.code === 'invalid_latitude'),
    reversedRangeDetected: invalidReport.issues.some((item) => item.code === 'reversed_temporal_range'),
    selfRelationshipDetected: invalidReport.issues.some((item) => item.code === 'self_relationship'),
  });

  return Object.freeze({
    passed: Object.values(checks).every(Boolean),
    checks,
    validReport,
    invalidReport,
  });
}
