/*
 * Dependency-free fixtures for the Pass 2B correspondence profile.
 *
 * These fixtures verify canonical transformation without changing the active
 * Peridot import or application pipeline.
 */

import { normalizePeridotCorrespondenceRows } from './peridotCorrespondenceProfile.js';

export const PERIDOT_CORRESPONDENCE_PROFILE_FIXTURE_ROWS = Object.freeze([
  Object.freeze({
    Archive: 'Archivio di Stato di Firenze',
    Collection: 'Mediceo del Principato',
    'Page(s)': 'f. 12r',
    Date: '1608/03/03',
    Source_Name: 'de’ Medici, Cosimo II',
    Source_Title: 'Grand Duke of Tuscany',
    Source_Location: 'Pisa',
    Source_Latitude: '43.7225',
    Source_Longitude: '10.3961',
    Target_Name: 'de’ Medici, Caterina',
    Target_Title: 'Duchess of Mantua',
    Target_Location: 'Siena',
    Target_Latitude: '43.3185',
    Target_Longitude: '11.3311',
    Relationship: 'Sibling correspondence',
    Topic: 'Family',
    Language: 'Italian',
    Transcription: 'Fixture transcription',
    Notes: 'Fixture note',
    'Link(s)': 'https://example.invalid/letter-1',
    originalUploadedRow: {
      Date: '1608/03/03',
      Sender: 'de’ Medici, Cosimo II',
      Recipient: 'de’ Medici, Caterina',
    },
    customInspectorFields: [
      {
        key: 'Cipher',
        sourceColumn: 'Cipher?',
        label: 'Cipher',
        value: 'No',
        analyticsEligible: true,
      },
    ],
    ignoredUploadedColumns: ['Unused column'],
  }),
  Object.freeze({
    Date_Start: '1609',
    Date_End: '1610',
    Date_Display: '1609–1610',
    Source_Name: 'de’ Medici, Cosimo II',
    Target_Name: 'von Habsburg, Maria Magdalena',
    Point_Place: 'Florence',
    Point_Coordinates: '43.7696, 11.2558',
    Topic: 'Government',
    Language: 'Italian',
    Notes: 'Interval and point fixture',
  }),
  Object.freeze({
    Date: 'undated',
    Archive: 'Archivio di Stato di Firenze',
    Collection: 'Mediceo del Principato',
    'Page(s)': 'f. 13v',
    Notes: 'Evidence-only accepted row',
  }),
]);

export function buildPeridotCorrespondenceProfileFixtureDataset() {
  return normalizePeridotCorrespondenceRows(
    PERIDOT_CORRESPONDENCE_PROFILE_FIXTURE_ROWS,
    {
      datasetId: 'fixture-correspondence',
      datasetLabel: 'Pass 2B correspondence fixture',
      sourceFileId: 'fixture-file',
      sourceFileName: 'fixture-correspondence.csv',
      sourceSheet: 'Letters',
      importedAt: '2026-07-24T00:00:00.000Z',
    }
  );
}

export function runPeridotCorrespondenceProfileSelfAudit() {
  const dataset = buildPeridotCorrespondenceProfileFixtureDataset();

  const checks = Object.freeze({
    validationPasses: dataset.validation?.valid === true,
    commitAllowed: dataset.validation?.canCommit === true,
    threeRecordsCreated: dataset.records.length === 3,
    threeEntitiesCreated: dataset.entities.length === 3,
    threePlacesCreated: dataset.places.length === 3,
    fourParticipationsCreated: dataset.participations.length === 4,
    twoEvidenceSourcesCreated: dataset.evidenceSources.length === 2,
    sourceAndTargetPlaceAssertionsCreated: dataset.assertions.some(
      (item) => item.predicate === 'source-place'
    ) && dataset.assertions.some(
      (item) => item.predicate === 'target-place'
    ),
    pointPlaceAssertionCreated: dataset.assertions.some(
      (item) => item.predicate === 'point-place'
    ),
    titlesRemainContextualAssertions: dataset.assertions.filter(
      (item) => item.predicate === 'source-title' || item.predicate === 'target-title'
    ).length === 2,
    noPersistentRelationshipsInvented: dataset.relationships.length === 0,
    noEventsInvented: dataset.events.length === 0,
    routeCapabilityDetected: dataset.capabilities?.routeMapReady === true,
    networkCapabilityDetected: dataset.capabilities?.networkReady === true,
    timelineCapabilityDetected: dataset.capabilities?.timelineReady === true,
    sourceManifestPreserved: dataset.sourceManifest?.totalRowCount === 3
      && dataset.sourceManifest?.acceptedRowCount === 3,
  });

  return Object.freeze({
    passed: Object.values(checks).every(Boolean),
    checks,
    counts: Object.freeze({
      entities: dataset.entities.length,
      places: dataset.places.length,
      records: dataset.records.length,
      events: dataset.events.length,
      relationships: dataset.relationships.length,
      participations: dataset.participations.length,
      evidenceSources: dataset.evidenceSources.length,
      assertions: dataset.assertions.length,
    }),
    validation: dataset.validation,
    capabilities: dataset.capabilities,
  });
}
