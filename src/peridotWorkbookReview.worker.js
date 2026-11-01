/* Workbook Review & Upload diagnostic computation, off the browser UI thread.
 * Does not change join semantics, source rows, or validation rules.
 */
import { buildPeridotRowsFromWorkbookMapping } from './peridotWorkbookMapping.js';
import { auditPeridotDataCapabilities } from './peridotDataCapabilityAudit.js';
import { normalizePeridotGeneralizedMappedRows } from './peridotCorrespondenceProfile.js';

function summarizeTemporalAssertionsForReview(rows = [], datasetId = 'workbook-temporal-review') {
  const canonical = normalizePeridotGeneralizedMappedRows(rows, { datasetId });
  const records = canonical.records || [];
  const assertions = records.flatMap(record => record.temporalAssertions || (record.temporalAssertion ? [record.temporalAssertion] : []));
  const count = predicate => assertions.filter(predicate).length;
  const positionable = item => item.visualizationUsability?.timelinePositionable && item.parsingStatus !== 'unrecognized' && item.consistency !== 'backwards';
  const inconsistent = count(item => item.consistency === 'backwards');
  const unrecognized = count(item => item.parsingStatus === 'unrecognized');
  const positionableRecords = records.filter(record => (record.temporalAssertions || []).some(positionable)).length;
  const recordsWithTemporalEvidence = records.filter(record => (record.temporalAssertions || []).length > 0).length;
  const recordsWithoutTemporalEvidence = Math.max(0, records.length - recordsWithTemporalEvidence);
  const warnings = [];
  if (recordsWithoutTemporalEvidence) warnings.push({ message: `${recordsWithoutTemporalEvidence} record${recordsWithoutTemporalEvidence === 1 ? '' : 's'} contain no mapped date or period. ${recordsWithoutTemporalEvidence === 1 ? 'It will not' : 'They will not'} participate in timeline playback or date-range filtering.` });
  if (inconsistent) warnings.push({ message: `${inconsistent} temporal value${inconsistent === 1 ? '' : 's'} contain a start after the end. Peridot preserved the source order and marked ${inconsistent === 1 ? 'it' : 'them'} unsafe for ordinary interval visualization.` });
  if (unrecognized) warnings.push({ message: `${unrecognized} temporal value${unrecognized === 1 ? '' : 's'} could not be interpreted safely. The original text will still be preserved in Inspector/export.` });
  return {
    total: assertions.length, recordCount: records.length, positionableRecords,
    recordsWithTemporalEvidence, recordsWithoutTemporalEvidence,
    fullyPositionable: count(positionable),
    reducedPrecision: count(item => item.parsingStatus === 'partial'),
    approximate: count(item => String(item.temporalShape || '').startsWith('approximate')),
    openEnded: count(item => item.temporalShape === 'openInterval'),
    noKnownYear: count(item => item.parsingStatus !== 'unrecognized' && !item.visualizationUsability?.hasKnownYear),
    inconsistent, unrecognized, warnings,
  };
}

self.onmessage = ({ data }) => {
  const started = performance.now();
  try {
    const rows = buildPeridotRowsFromWorkbookMapping(data.workbookModel, data.workbookMapping);
    const assembledMs = performance.now() - started;
    const capabilityAudit = auditPeridotDataCapabilities(rows, { headers: Object.keys(rows[0] || {}) });
    const auditMs = performance.now() - started - assembledMs;
    const temporalReviewSummary = summarizeTemporalAssertionsForReview(rows);
    self.postMessage({ type: 'ready', result: { capabilityAudit, temporalReviewSummary, recordCount: rows.length, timings: { assembledMs, auditMs, totalMs: performance.now() - started } } });
  } catch (error) {
    self.postMessage({ type: 'error', message: error?.message || String(error) });
  }
};
