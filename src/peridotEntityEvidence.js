/*
 * Canonical subject-aware Evidence projection for entity-facing consumers.
 *
 * Attribution Pass 2B creates atomic canonical assertions for mapped Evidence
 * fields. This helper is the single projection boundary that turns those
 * assertions into human-readable entity fields for Inspector consumption.
 * Record-level assertions are deliberately excluded because their subject is a
 * Record, not a canonical Entity.
 */

function asText(value) {
  return String(value ?? '').trim();
}

function isMappedEvidenceAssertion(assertion = {}) {
  return asText(assertion?.predicate).startsWith('mapped-evidence:');
}

function mappedEvidenceLabel(assertion = {}) {
  return asText(assertion?.attributes?.mappedLabel)
    || asText(assertion?.attributes?.sourceColumn)
    || asText(assertion?.predicate).replace(/^mapped-evidence:/, '').replace(/-/g, ' ')
    || 'Evidence';
}

function mappedEvidenceValue(assertion = {}) {
  if (assertion?.value === null || assertion?.value === undefined) return '';
  return asText(assertion.value);
}

/**
 * Build canonical entity-owned Evidence fields keyed by canonical Entity id.
 *
 * Only subjects present in canonicalDataset.entities are eligible. This strict
 * ownership boundary prevents record-level Evidence from leaking onto every
 * entity connected to a Record.
 */
export function buildPeridotCanonicalEntityEvidenceMap(canonicalDataset = null) {
  const entityIds = new Set(
    (canonicalDataset?.entities || [])
      .map((entity) => asText(entity?.id))
      .filter(Boolean),
  );
  const evidenceByEntityId = new Map();

  (canonicalDataset?.assertions || []).forEach((assertion) => {
    if (!isMappedEvidenceAssertion(assertion)) return;
    const subjectId = asText(assertion?.subjectId);
    if (!subjectId || !entityIds.has(subjectId)) return;

    const label = mappedEvidenceLabel(assertion);
    const value = mappedEvidenceValue(assertion);
    if (!label || !value) return;

    if (!evidenceByEntityId.has(subjectId)) evidenceByEntityId.set(subjectId, []);
    evidenceByEntityId.get(subjectId).push(Object.freeze({
      label,
      value,
      sourceColumn: asText(assertion?.attributes?.sourceColumn),
      assertionId: asText(assertion?.id),
      evidenceSourceIds: Object.freeze([...(assertion?.evidenceSourceIds || [])]),
      sourceRowNumber: Number(assertion?.provenance?.source?.sourceRowNumber) || null,
      sourceSheet: asText(assertion?.provenance?.source?.sourceSheet),
    }));
  });

  evidenceByEntityId.forEach((fields, entityId) => {
    const seen = new Set();
    const uniqueFields = fields.filter((field) => {
      const key = `${field.label.toLowerCase()}::${field.value}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    evidenceByEntityId.set(entityId, Object.freeze(uniqueFields));
  });

  return evidenceByEntityId;
}

export function getPeridotCanonicalEntityEvidence(evidenceByEntityId, entityId) {
  const key = asText(entityId);
  if (!key || !(evidenceByEntityId instanceof Map)) return [];
  return evidenceByEntityId.get(key) || [];
}

/**
 * Build canonical mapped-Evidence fields keyed by their source-row number for
 * record-oriented consumers such as Search.
 *
 * Unlike the entity projection above, this keeps both Record-owned and
 * Entity-owned assertions from the same imported row. Subject attribution is
 * preserved on each field so Search can remain record-oriented without
 * flattening participant-owned Evidence back into generic row metadata.
 */
export function buildPeridotCanonicalSearchEvidenceBySourceRow(canonicalDataset = null) {
  const entityLabelsById = new Map(
    (canonicalDataset?.entities || [])
      .map((entity) => [asText(entity?.id), asText(entity?.label || entity?.displayLabel || entity?.name)])
      .filter(([id]) => Boolean(id)),
  );
  const recordIds = new Set(
    (canonicalDataset?.records || [])
      .map((record) => asText(record?.id))
      .filter(Boolean),
  );
  const evidenceBySourceRow = new Map();

  (canonicalDataset?.assertions || []).forEach((assertion) => {
    if (!isMappedEvidenceAssertion(assertion)) return;

    const sourceRowNumber = Number(assertion?.provenance?.source?.sourceRowNumber);
    if (!Number.isFinite(sourceRowNumber)) return;

    const label = mappedEvidenceLabel(assertion);
    const value = mappedEvidenceValue(assertion);
    if (!label || !value) return;

    const subjectId = asText(assertion?.subjectId);
    const subjectType = entityLabelsById.has(subjectId)
      ? 'entity'
      : recordIds.has(subjectId)
        ? 'record'
        : 'unknown';
    const subjectLabel = subjectType === 'entity'
      ? entityLabelsById.get(subjectId)
      : subjectType === 'record'
        ? 'Record'
        : '';

    if (!evidenceBySourceRow.has(sourceRowNumber)) evidenceBySourceRow.set(sourceRowNumber, []);
    evidenceBySourceRow.get(sourceRowNumber).push(Object.freeze({
      key: asText(assertion?.attributes?.sourceColumn) || label,
      label,
      value,
      subjectId,
      subjectType,
      subjectLabel,
      sourceColumn: asText(assertion?.attributes?.sourceColumn),
      assertionId: asText(assertion?.id),
      evidenceSourceIds: Object.freeze([...(assertion?.evidenceSourceIds || [])]),
      sourceRowNumber,
      sourceSheet: asText(assertion?.provenance?.source?.sourceSheet),
    }));
  });

  evidenceBySourceRow.forEach((fields, sourceRowNumber) => {
    const seen = new Set();
    const uniqueFields = fields.filter((field) => {
      const key = [
        field.key.toLowerCase(),
        field.label.toLowerCase(),
        field.value,
        field.subjectId,
      ].join('::');
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    evidenceBySourceRow.set(sourceRowNumber, Object.freeze(uniqueFields));
  });

  return evidenceBySourceRow;
}


export function filterPeridotCanonicalEntityEvidenceToRows(fields = [], rows = []) {
  const visibleSourceRowNumbers = new Set(
    (rows || [])
      .map((row) => Number(row?.generalizedObservation?.rowIndex) + 2)
      .filter((rowNumber) => Number.isFinite(rowNumber)),
  );

  return (fields || []).filter((field) => (
    !Number.isFinite(Number(field?.sourceRowNumber))
    || visibleSourceRowNumbers.has(Number(field.sourceRowNumber))
  ));
}
