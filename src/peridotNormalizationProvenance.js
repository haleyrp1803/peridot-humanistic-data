/*
 * Canonical normalization provenance helpers.
 *
 * This pure module records where normalized assertions came from and how
 * Peridot produced them. It intentionally does not read files, mutate rows,
 * or decide whether a historical claim is true.
 */

export const PERIDOT_PROVENANCE_STATUS = Object.freeze({
  IMPORTED_DIRECTLY: 'imported-directly',
  TRANSFORMED: 'transformed',
  DERIVED: 'derived',
  MANUALLY_CORRECTED: 'manually-corrected',
});

export const PERIDOT_PROVENANCE_CONFIDENCE = Object.freeze({
  CERTAIN: 'certain',
  PROBABLE: 'probable',
  POSSIBLE: 'possible',
  UNCERTAIN: 'uncertain',
  UNKNOWN: 'unknown',
});

function asText(value) {
  return String(value ?? '').trim();
}

function asStringArray(value) {
  const items = Array.isArray(value) ? value : value === undefined || value === null ? [] : [value];
  return Object.freeze(items.map(asText).filter(Boolean));
}

function asPlainObject(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return Object.freeze({});
  return Object.freeze({ ...value });
}

export function makePeridotSourceReference({
  sourceFileId = '',
  sourceFileName = '',
  sourceSheet = '',
  sourceRowNumber = null,
  sourceColumns = [],
  sourceValues = {},
} = {}) {
  const rowNumber = Number(sourceRowNumber);
  return Object.freeze({
    sourceFileId: asText(sourceFileId),
    sourceFileName: asText(sourceFileName),
    sourceSheet: asText(sourceSheet),
    sourceRowNumber: Number.isInteger(rowNumber) && rowNumber > 0 ? rowNumber : null,
    sourceColumns: asStringArray(sourceColumns),
    sourceValues: asPlainObject(sourceValues),
  });
}

export function makePeridotProvenance({
  source = {},
  mappingProfileId = '',
  mappingProfileVersion = '',
  transformation = '',
  status = PERIDOT_PROVENANCE_STATUS.IMPORTED_DIRECTLY,
  confidence = PERIDOT_PROVENANCE_CONFIDENCE.UNKNOWN,
  userConfirmed = false,
  derivationInputs = [],
  notes = '',
} = {}) {
  const allowedStatuses = new Set(Object.values(PERIDOT_PROVENANCE_STATUS));
  const allowedConfidence = new Set(Object.values(PERIDOT_PROVENANCE_CONFIDENCE));

  return Object.freeze({
    source: makePeridotSourceReference(source),
    mappingProfileId: asText(mappingProfileId),
    mappingProfileVersion: asText(mappingProfileVersion),
    transformation: asText(transformation),
    status: allowedStatuses.has(status) ? status : PERIDOT_PROVENANCE_STATUS.IMPORTED_DIRECTLY,
    confidence: allowedConfidence.has(confidence) ? confidence : PERIDOT_PROVENANCE_CONFIDENCE.UNKNOWN,
    userConfirmed: Boolean(userConfirmed),
    derivationInputs: asStringArray(derivationInputs),
    notes: asText(notes),
  });
}

export function hasPeridotSourceReference(provenance) {
  const source = provenance?.source;
  return Boolean(
    asText(source?.sourceFileId)
    || asText(source?.sourceFileName)
    || asText(source?.sourceSheet)
    || Number.isInteger(source?.sourceRowNumber)
    || (Array.isArray(source?.sourceColumns) && source.sourceColumns.length)
  );
}

export function describePeridotProvenance(provenance) {
  const source = provenance?.source || {};
  const parts = [];
  if (source.sourceFileName || source.sourceFileId) parts.push(source.sourceFileName || source.sourceFileId);
  if (source.sourceSheet) parts.push(`sheet “${source.sourceSheet}”`);
  if (source.sourceRowNumber) parts.push(`row ${source.sourceRowNumber}`);
  if (source.sourceColumns?.length) parts.push(`column${source.sourceColumns.length === 1 ? '' : 's'} ${source.sourceColumns.join(', ')}`);
  return parts.join(' · ') || 'No source reference recorded';
}
