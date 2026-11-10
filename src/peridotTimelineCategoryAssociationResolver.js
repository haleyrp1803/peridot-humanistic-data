/*
 * Peridot Timeline — explicit category-source event association (Pass B v1).
 * Pure, opt-in evaluation only. No Timeline wiring or canonical data mutation.
 *
 * A category source discovered by the inventory is NOT a membership until
 * the researcher or caller explicitly supplies an association policy.
 */
const array = (v) => Array.isArray(v) ? v : [];
const str = (v) => String(v ?? '').trim();
const index = (v) => Number.isInteger(v) ? v : null;
const observationOf = (e) => e?.row?.generalizedObservation || e?.generalizedObservation || null;
const context = (o) => ({
  workbook: str(o?.sourceWorkbook || o?.workbookName || o?.source?.workbookName),
  sheet: str(o?.sourceSheet || o?.sheetName || o?.source?.sheetName),
});
const subjectKey = (i) => i === null ? 'record' : `participant:${i}`;
const normalized = (v) => (v == null || typeof v === 'object') ? '' : str(v);
const idFor = (o, domain, column, role, subject) => JSON.stringify([
  'timeline-source-v1', context(o).workbook, context(o).sheet, domain, str(column), str(role), subject,
]);
function candidates(o, domain) {
  if (domain === 'evidence') return array(o.evidenceFields).map((v) => ({
    column:v?.sourceColumn, role:'', subject:subjectKey(index(v?.subjectParticipantIndex)), value:v?.value,
  }));
  if (domain === 'participant') return array(o.participants).map((v,i) => ({
    column:v?.sourceColumn, role:v?.role, subject:subjectKey(index(v?.index) ?? i), value:v?.value,
  }));
  if (domain === 'place') return array(o.places).map((v) => ({
    column:v?.sourceColumn, role:v?.role, subject:subjectKey(index(v?.subjectParticipantIndex)), value:v?.label,
  }));
  if (domain === 'relationship') return ['type','label'].map((role) => ({
    column:o?.relationship?.sourceColumns?.[role], role, subject:'record', value:o?.relationship?.[role],
  }));
  if (domain === 'temporal') return array(o?.temporal?.assertions).map((v) => ({
    column:v?.fieldKey, role:v?.role, subject:subjectKey(index(v?.subjectParticipantIndex)), value:v?.sourceText,
    occurrenceIndex: v?.occurrenceIndex ?? null,
  }));
  if (domain === 'raw') return Object.entries(o?.originalUploadedRow || {}).map(([column,value]) => ({
    column, role:'', subject:'record', value,
  }));
  return [];
}
/**
 * Resolve one source/value on one assertion-level Timeline event.
 * policy.scope must be one of: 'record' (intentional propagation of a record
 * attribute to all its events), 'subject' (exact subject ownership), or
 * 'assertion' (only the mapped temporal assertion that generated this event).
 *
 * Result.status is 'matched', 'not-matched', or 'unresolved'. Reasons are
 * diagnostic; unresolved must never be displayed as a positive membership.
 */
export function resolvePeridotTimelineCategoryAssociation(event, source, selectedValue, policy = {}) {
  const fail = (reason, status = 'unresolved') => Object.freeze({ status, reason, eventId: str(event?.id), sourceId: str(source?.id), value: normalized(selectedValue) });
  if (!event || !source || !str(source.id)) return fail('missing-event-or-source');
  if (!['record','subject','assertion'].includes(policy.scope)) return fail('association-policy-required');
  const o = observationOf(event);
  if (!o) return fail('missing-generalized-observation');
  if (!str(o.recordId) || !str(event.recordId) || str(o.recordId) !== str(event.recordId)) return fail('record-identity-unverified');
  if (source.sheetIdentityKnown && (!str(source.sourceSheet) || context(o).sheet !== str(source.sourceSheet))) return fail('sheet-mismatch');
  if (source.sourceWorkbook && context(o).workbook !== str(source.sourceWorkbook)) return fail('workbook-mismatch');
  if (source.mapped === false && policy.allowUnmapped !== true) return fail('unmapped-source-requires-explicit-authorization');
  const eventSubjectIndex = index(event?.subject?.participantIndex);
  const relevant = candidates(o, source.domain).filter((v) => {
    if (!str(v.column) || !normalized(v.value)) return false;
    return idFor(o, source.domain, v.column, v.role, v.subject) === source.id;
  });
  if (!relevant.length) return fail('source-not-present-on-origin-record', 'not-matched');
  if (policy.scope === 'subject') {
    if (eventSubjectIndex === null || source.subject !== `participant:${eventSubjectIndex}`) return fail('subject-mismatch', 'not-matched');
  }
  if (policy.scope === 'assertion') {
    if (source.domain !== 'temporal') return fail('assertion-scope-requires-temporal-source');
    if (!str(event.assertion?.fieldKey) || str(event.assertion.fieldKey) !== str(source.sourceColumn)) return fail('assertion-mismatch', 'not-matched');
    if (source.role && str(event.assertion.role) !== str(source.role)) return fail('assertion-role-mismatch', 'not-matched');
    const temporalSubjectIndex = index(event?.assertion?.subjectParticipantIndex);
    if (source.subject !== subjectKey(temporalSubjectIndex)) return fail('assertion-subject-mismatch', 'not-matched');
    // Do not conflate two occurrences of one mapped temporal field.
    const occurrence = event.assertion?.occurrenceIndex;
    if (occurrence !== undefined && occurrence !== null) {
      if (!relevant.some((v) => String(v.occurrenceIndex ?? '') === String(occurrence) && normalized(v.value) === normalized(selectedValue))) {
        return fail('assertion-occurrence-mismatch', 'not-matched');
      }
    }
  }
  const value = normalized(selectedValue);
  if (!value) return fail('empty-selected-value');
  return fail(relevant.some((v) => normalized(v.value) === value) ? 'explicit-association-match' : 'value-mismatch',
    relevant.some((v) => normalized(v.value) === value) ? 'matched' : 'not-matched');
}

export function evaluatePeridotTimelineCategoryAssociations(events = [], source, selectedValue, policy = {}) {
  return Object.freeze(array(events).map((event) => resolvePeridotTimelineCategoryAssociation(event, source, selectedValue, policy)));
}
