/* Dataset-driven Timeline category source projection (integration pass C).
 * Inventory is advisory. Memberships require an explicit researcher-selected
 * field and one of the bounded association policies; no inferred joins.
 * Never mutate canonical events or their Evidence memberships.
 */
import {buildPeridotTimelineCategorySourceInventory} from './peridotTimelineCategorySourceInventory.js';
import {resolvePeridotTimelineCategoryAssociation} from './peridotTimelineCategoryAssociationResolver.js';
import {reconcileTimelineCategoryConfiguration} from './peridotTimelineCategoryConfiguration.js';

const list = v => Array.isArray(v) ? v : [];
const string = v => String(v ?? '').trim();
const normalized = v => v == null || typeof v === 'object' ? '' : string(v);
const sourceKey = source => `mapped-source:${source.id}`;
const same = (a,b) => string(a) === string(b);
// Workbook mapping source keys can be sheet-qualified internally. These keys
// remain untouched for provenance and matching; display the researcher's actual
// column header, not the encoded sheet/column key.
export function timelineSourceColumnLabel(sourceColumn, sourceSheet = '') {
  const key = string(sourceColumn);
  const sheet = string(sourceSheet);
  if (sheet && key.startsWith(`${sheet}::`)) return key.slice(sheet.length + 2);
  const separator = key.indexOf('::');
  return separator >= 0 ? key.slice(separator + 2) : key;
}

// Only domain-neutral source roles are displayed. Raw columns require the
// researcher's explicit selection; no arbitrary data is classified on load.
export function buildPeridotGeneralizedCategoryFields(events = []) {
  return Object.freeze(buildPeridotTimelineCategorySourceInventory(events)
    .filter(s => s.domain !== 'evidence')
    .filter(s => s.values.length > 0)
    .map(s => {
      const subjectScoped = s.subject.startsWith('participant:');
      const scopes = s.domain === 'temporal' ? ['assertion','record'] :
        subjectScoped ? ['subject','record'] : ['record'];
      // Record association is the predictable default for ordinary record-level
      // date assertions (e.g. letters), even when a mapped place has a sender
      // participant association. Subject scope remains an explicit choice for
      // genuinely subject-owned temporal events (e.g. family-tree births).
      const primary = s.domain === 'temporal' ? 'assertion' : 'record';
      const columnLabel = timelineSourceColumnLabel(s.sourceColumn, s.sourceSheet);
      return Object.freeze({
        id: sourceKey(s), key: sourceKey(s), source: s,
        label: columnLabel,
        sourceColumn:s.sourceColumn, sourceSheet:s.sourceSheet,
        sourceRole:s.role, domain:s.domain,
        associationScopes:Object.freeze(scopes), defaultAssociationScope:primary,
        requiresExplicitRawAuthorization:s.mapped === false,
        eventCount:s.observedOriginEventCount,
        values:Object.freeze(s.values.map(v=>Object.freeze({value:v.value,eventCount:v.observedRecordCount}))),
      });
    })
    .sort((a,b)=>a.label.localeCompare(b.label)||a.key.localeCompare(b.key)));
}

// These are the observed values for a source in this event's own record.
// First narrow by source column/role/subject, then let the Pass B resolver
// confirm identity and policy. This avoids N(events)*N(all distinct values).
function observedValues(event, source) {
  const o=event?.row?.generalizedObservation || event?.generalizedObservation;
  if (!o) return [];
  let values=[];
  const domain=source.domain;
  if (domain==='participant') values=list(o.participants).filter((v,i)=>
    same(v.sourceColumn,source.sourceColumn)&&same(v.role,source.role)&&
    same(`participant:${Number.isInteger(v.index)?v.index:i}`,source.subject)).map(v=>v.value);
  if (domain==='place') values=list(o.places).filter(v=>
    same(v.sourceColumn,source.sourceColumn)&&same(v.role,source.role)&&
    same(Number.isInteger(v.subjectParticipantIndex)?`participant:${v.subjectParticipantIndex}`:'record',source.subject)).map(v=>v.label);
  if (domain==='relationship') values=[o.relationship?.[source.role]].filter(Boolean);
  if (domain==='raw') values=[o.originalUploadedRow?.[source.sourceColumn]];
  if (domain==='temporal') values=list(o.temporal?.assertions).filter(v=>
    same(v.fieldKey,source.sourceColumn)&&same(v.role,source.role)&&
    same(Number.isInteger(v.subjectParticipantIndex)?`participant:${v.subjectParticipantIndex}`:'record',source.subject)).map(v=>v.sourceText);
  return [...new Set(values.map(normalized).filter(Boolean))];
}

export function projectPeridotGeneralizedCategoryEvents(events=[], availableFields=[], configuration=null) {
  const fields=list(availableFields).filter(f=>f.source);
  const config=reconcileTimelineCategoryConfiguration(configuration,availableFields);
  const chosen=config.fields.map(sel=>{
    const field=fields.find(f=>f.key===sel.key);
    if (!field) return null;
    const allowed=new Set((sel.mode==='all'?field.values.map(v=>v.value):sel.values));
    const scope=config.fieldScopes?.[field.key] || field.defaultAssociationScope;
    return {field,allowed,scope};
  }).filter(Boolean);
  if (!chosen.length) return Object.freeze([...list(events)]);
  return Object.freeze(list(events).map(event=>{
    const memberships=[];
    for (const {field,allowed,scope} of chosen) {
      for (const value of observedValues(event,field.source)) {
        if (!allowed.has(value)) continue;
        const result=resolvePeridotTimelineCategoryAssociation(event,field.source,value,{
          scope,allowUnmapped:field.requiresExplicitRawAuthorization,
        });
        if (result.status==='matched') memberships.push(Object.freeze({
          fieldKey:field.key, fieldLabel:field.label, value,sourceColumn:field.sourceColumn,
        }));
      }
    }
    if (!memberships.length) return event;
    return Object.freeze({...event, categoryMemberships:Object.freeze([...list(event.categoryMemberships),...memberships])});
  }));
}
