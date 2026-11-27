import { PeridotInvestigateFurther } from './PeridotInvestigateFurther.jsx';
/*
 * Node, person-profile, place-profile, and linked-record Inspector view.
 *
 * This component renders entity reference pages for Inspector selections. The
 * full workspace view uses a scholarly reference-entry structure: a compact
 * lead section, a divider, connected entities, connected records, and selected
 * fields. The compact view remains a summary surface for quick inspection.
 *
 * Important relationships:
 * - Selection/detail payloads come from `interactionHelpers.js`, `App.jsx`, and
 *   workbook/custom-field metadata.
 * - Navigation actions call back into App-owned Inspector history so compact and
 *   full modes remain synchronized.
 *
 * Maintenance cautions:
 * - Use universal language such as "records", "connected people", and
 *   "connected places" rather than correspondence-only wording.
 * - Test person profile, place profile, record detail, route row, compact
 *   summary tile, and Back behavior after edits.
 */

import React, { useMemo, useState } from 'react';
import { buildPeridotInspectorEntityProfile } from './peridotInspectorSemantics.js';
import { filterPeridotCanonicalEntityEvidenceToRows } from './peridotEntityEvidence.js';
import { PeridotRecordStructure } from './PeridotRecordStructure.jsx';
import { buildPeridotRecordStructure } from './peridotRecordStructure.js';
import { buildPeridotRelationshipRegister } from './peridotRelationshipRegister.mjs';
import { PeridotContributingRecordsLedger } from './PeridotContributingRecordsLedger.jsx';
import { CompactEvidenceRows, CompactFactGrid, CompactEvidenceReveal, CompactRecordPreview, CompactRecordMore, CompactMetricStrip } from './InspectorCompactEvidence.jsx';

function detailLabelClassName() {
  return '[font-family:Georgia,"Palatino_Linotype","Book_Antiqua",Palatino,serif] text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--detail-label-text)]';
}

function DetailRow({ label, value }) {
  return (
    <div className="border-b border-[var(--section-border)]/80 py-1.5 last:border-b-0">
      <div className={detailLabelClassName()}>{label}</div>
      <div className="mt-0.5 break-words text-sm text-[var(--text-main)]">{value || '—'}</div>
    </div>
  );
}

function normalizeEntityText(value) {
  return String(value ?? '').trim();
}

function normalizeComparable(value) {
  return normalizeEntityText(value).toLowerCase();
}

function normalizePlaceLabel(value) {
  return normalizeEntityText(value) || 'Unknown';
}

function getSelectedEntityLabel(selectedProps) {
  return normalizeEntityText(selectedProps?.detailLabel || selectedProps?.label);
}

function getSelectedEntityId(selectedProps) {
  return normalizeEntityText(
    selectedProps?.entityId
    || selectedProps?.personMetadata?.canonicalEntityId
    || selectedProps?.personMetadata?.id,
  );
}

function getSelectedEntityType(selectedProps, viewMode) {
  if (selectedProps?.__kind === 'person-detail') return 'person';
  if (selectedProps?.__kind === 'place-detail') return 'place';
  if (selectedProps?.entityType === 'place') return 'place';
  if (selectedProps?.entityType === 'person') return 'person';
  return viewMode === 'geographic' ? 'place' : 'person';
}

function normalizeLetterCustomFields(letter) {
  const fields = Array.isArray(letter?.customInspectorFields) ? letter.customInspectorFields : [];

  return fields
    .map((field) => {
      const label = normalizeEntityText(field?.label || field?.sourceColumn || field?.key);
      const value = normalizeEntityText(field?.value);
      return { label, value };
    })
    .filter((field) => field.label && field.value);
}

function buildEntityCustomFieldSummaries(selectedProps, viewMode) {
  /*
   * Entity profiles must describe the selected entity, not its entire record
   * neighborhood.  `customInspectorFields` on linked records can describe a
   * spouse, parent, child, event, or the record as a whole, so aggregating those
   * values here causes unrelated attributes to leak into the selected profile.
   *
   * Person-centered canonical imports already project entity-owned attributes
   * through `selectedProps.personMetadata.customInspectorFields`.  Those are the
   * only custom fields safe to present as attributes of a selected person.
   * Record-level evidence remains available in linked-record detail through the
   * generalized `PeridotRecordStructure` reader.
   *
   * Place-specific arbitrary attributes do not yet have an equivalent canonical
   * projection.  Until that ownership exists, a place profile intentionally
   * shows no generic custom-field card rather than borrowing values from related
   * records or people.
   */
  const entityType = getSelectedEntityType(selectedProps, viewMode);
  if (entityType !== 'person') return [];

  const fields = normalizeLetterCustomFields(selectedProps?.personMetadata || {});
  return fields
    .map((field) => ({
      label: field.label,
      recordCount: 1,
      values: [{ value: field.value, count: 1 }],
      additionalValueCount: 0,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

function countMapIncrement(map, key, amount = 1) {
  const normalized = normalizeEntityText(key);
  if (!normalized) return;
  map.set(normalized, (map.get(normalized) || 0) + amount);
}

function sortCountMap(map) {
  return Array.from(map.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

function buildEntityProfile(selectedProps, selectedLetterMetadata = [], viewMode) {
  const entityType = getSelectedEntityType(selectedProps, viewMode);
  const entityLabel = getSelectedEntityLabel(selectedProps);
  const entityId = getSelectedEntityId(selectedProps);
  const canonicalEntityEvidence = filterPeridotCanonicalEntityEvidenceToRows(
    Array.isArray(selectedProps?.canonicalEntityEvidence) ? selectedProps.canonicalEntityEvidence : [],
    selectedLetterMetadata,
  );
  const compatibilityEntityEvidence = entityType === 'person'
    ? normalizeLetterCustomFields(selectedProps?.personMetadata || {})
    : [];
  const entityEvidence = [...compatibilityEntityEvidence, ...canonicalEntityEvidence];
  const semanticProfile = buildPeridotInspectorEntityProfile(selectedLetterMetadata, {
    entityType,
    entityLabel,
    entityId,
    entityEvidence,
  });

  return {
    ...semanticProfile,
    matchingLetters: semanticProfile.matchingRows,
  };
}

function SectionShell({ title, children, emptyMessage }) {
  return (
    <section className="rounded-2xl border border-[var(--panel-card-border)]/70 bg-[var(--utility-panel-bg)] p-3 shadow-[0_8px_24px_var(--peridot-color-rgba-rgba-87-58-46-0-06)]">
      <div className="mb-2 font-semibold uppercase tracking-[0.16em] text-[var(--panel-card-muted-text)]">
        {title}
      </div>
      {children || <div className="text-sm text-[var(--panel-card-muted-text)]">{emptyMessage}</div>}
    </section>
  );
}

const DEFAULT_REFERENCE_LIST_LIMIT = 10;

function CountSectionCard({ title, sections, emptyMessage, onOpenItem }) {
  const [expandedSections, setExpandedSections] = useState({});
  const normalizedSections = (sections || []).filter((section) => section);
  const hasItems = normalizedSections.some((section) => section.items?.length);

  if (!normalizedSections.length) {
    return <SectionShell title={title} emptyMessage={emptyMessage} />;
  }

  const toggleSection = (sectionTitle) => {
    setExpandedSections((prev) => ({ ...prev, [sectionTitle]: !prev[sectionTitle] }));
  };

  return (
    <SectionShell title={title}>
      {hasItems ? (
        <div className="grid gap-3 lg:grid-cols-2">
          {normalizedSections.map((section) => {
            const items = section.items || [];
            const isExpanded = Boolean(expandedSections[section.title]);
            const visibleItems = isExpanded ? items : items.slice(0, DEFAULT_REFERENCE_LIST_LIMIT);
            const hiddenCount = Math.max(0, items.length - visibleItems.length);

            return (
              <div key={section.title} className="min-w-0">
                <div className="mb-1.5 flex items-center justify-between gap-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--detail-label-text)]">
                  <span>{section.title}</span>
                  {items.length ? <span className="text-[var(--panel-card-muted-text)]">{items.length}</span> : null}
                </div>
                {items.length ? (
                  <div className="space-y-1.5">
                    {visibleItems.map((item) => {
                      const content = (
                        <div
                          className={`grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-lg border px-2.5 py-1.5 text-sm transition-colors ${
                            onOpenItem
                              ? 'border-[var(--inspector-clickable-border)] bg-[var(--inspector-clickable-bg)] text-[var(--inspector-clickable-text)] group-hover:border-[var(--inspector-clickable-hover-border)] group-hover:bg-[var(--inspector-clickable-hover-bg)] group-hover:text-[var(--inspector-clickable-hover-text)]'
                              : 'border-[var(--section-border)] bg-[#e1d1aa] text-[#102515]'
                          }`}
                        >
                          <span className="truncate font-medium text-inherit">{item.label}</span>
                          <span className="shrink-0 rounded-full bg-[var(--button-bg)] px-2 py-0.5 text-[10px] font-bold text-[var(--button-text)] shadow-sm">
                            {item.count}
                          </span>
                        </div>
                      );

                      return onOpenItem ? (
                        <button
                          type="button"
                          key={`${section.title}:${item.label}`}
                          onClick={() => onOpenItem(item.label, item.entityId || '')}
                          className="group block w-full text-left transition focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/35"
                        >
                          {content}
                        </button>
                      ) : (
                        <div key={`${section.title}:${item.label}`}>{content}</div>
                      );
                    })}
                    {items.length > DEFAULT_REFERENCE_LIST_LIMIT ? (
                      <button
                        type="button"
                        onClick={() => toggleSection(section.title)}
                        className="w-full rounded-lg border border-[var(--button-border)] bg-[var(--button-bg)] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-[var(--button-text)] transition hover:bg-[var(--button-hover-bg)] hover:text-[var(--button-hover-text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/35"
                      >
                        {isExpanded ? 'Show fewer' : `Show ${hiddenCount} more`}
                      </button>
                    ) : null}
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-[var(--section-border)] bg-[var(--utility-panel-bg)] px-3 py-2 text-xs text-[var(--panel-card-muted-text)]">
                    No records in this role.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-sm text-[var(--panel-card-muted-text)]">{emptyMessage}</div>
      )}
    </SectionShell>
  );
}

/*
 * Dedicated connected-evidence sheets use complete participant/place names and
 * source-backed field roles instead of putting ambiguous fragments such as
 * "target relationship with" in the position of a claim. The selected
 * subject and linked object are always identified separately. The raw source
 * relationship type and mapped direction are displayed only when supplied.
 *
 * Counts here are grouped appearances from the entity-profile projection;
 * they are not relabeled as distinct archival documents or visual weights.
 */
function ConnectedEvidenceSheet({ kind, selectedLabel, sections, relationships = [], onOpenItem, emptyMessage }) {
  const [expandedGroups, setExpandedGroups] = useState({});
  const groups = (sections || []).filter((section) => section?.items?.length);
  const isPeople = kind === 'people';
  const selectedName = normalizeEntityText(selectedLabel) || 'Selected subject';

  if (!groups.length) {
    return <section className="peridot-evidence-connected-empty">{emptyMessage}</section>;
  }

  return <div className="peridot-evidence-connected-groups">
    <p className="peridot-evidence-connected-context">
      <strong>Selected {isPeople ? 'person / entity' : 'subject'}:</strong> {selectedName}
      <span>{!isPeople && groups.some((group) => /mapped connections/i.test(group.title))
        ? ' · Connected places are endpoints of explicitly mapped geographic pairs in the current record scope.'
        : ' · Names and roles come from mapped records; appearing together does not by itself establish a directed relationship.'}</span>
    </p>
    {groups.map((group) => {
      const expanded = Boolean(expandedGroups[group.title]);
      const items = expanded ? group.items : group.items.slice(0, DEFAULT_REFERENCE_LIST_LIMIT);
      const remaining = group.items.length - items.length;
      return <section className="peridot-evidence-connected-group" key={group.title}>
        <header className="peridot-evidence-connected-group-heading">
          <h3>{isPeople ? 'People in related records'
            : group.title === 'Outgoing mapped connections' ? 'Target places in related records'
            : group.title === 'Incoming mapped connections' ? 'Source places in related records'
            : 'Places in related records'}</h3>
          <span>{group.items.length} {group.items.length === 1 ? 'entry' : 'entries'}</span>
        </header>
        {!isPeople && <p className="peridot-evidence-connected-group-role">{
          group.title === 'Outgoing mapped connections'
            ? `Outgoing connections from ${selectedName} to the places listed below.`
            : group.title === 'Incoming mapped connections'
              ? `Incoming connections to ${selectedName} from the places listed below.`
              : <><strong>Mapped place role:</strong> {group.title}</>
        }</p>}
        <div className="peridot-evidence-connected-rows">
          {items.map((item) => {
            const matchedRelationships = isPeople ? relationships.filter((relation) => {
              const sameIdentity = item.entityId && relation.counterpartId
                ? item.entityId === relation.counterpartId
                : normalizeComparable(item.label) === normalizeComparable(relation.counterpart);
              return sameIdentity && relation.label === group.title;
            }) : [];
            const details = Array.from(new Map(matchedRelationships.map((relation) => [
              [relation.relationshipType, relation.direction].join('::'),
              { type: relation.relationshipType, direction: relation.direction },
            ])).values());
            const label = normalizeEntityText(item.label);
            const content = <>
              <div className="peridot-evidence-connected-row-main">
                <span className="peridot-evidence-connected-row-kind">{isPeople ? 'Connected person / entity' : 'Connected place'}</span>
                <span className="peridot-evidence-connected-row-name">{label}</span>
                {!isPeople && /mapped connections/i.test(group.title) ? <span className="peridot-evidence-connected-row-evidence">
                  {group.title.startsWith('Outgoing') ? `${selectedName} → ${label}` : `${label} → ${selectedName}`} · Explicit mapped geographic pair
                </span> : null}
                {isPeople && details.length ? <span className="peridot-evidence-connected-row-evidence">
                  {details.map((detail, index) => <span key={`${detail.type}-${detail.direction}-${index}`}>
                    {detail.type ? `Mapped relationship: ${detail.type}` : 'Relationship type not specified'}
                    {' · '}{detail.direction === 'directed' ? 'Directed in mapped data' : 'Undirected in mapped data'}
                  </span>)}
                </span> : null}
                {isPeople && !details.length ? <span className="peridot-evidence-connected-row-evidence">Associated through mapped records; examine the Relationships sheet for role and direction.</span> : null}
              </div>
              <span className="peridot-evidence-connected-row-count" aria-label={`${item.count} grouped occurrences`}>
                {item.count} <span>{item.count === 1 ? 'appearance' : 'appearances'}</span>
              </span>
              {onOpenItem ? <span className="peridot-evidence-connected-row-arrow" aria-hidden="true">›</span> : null}
            </>;
            return onOpenItem
              ? <button type="button" className="peridot-evidence-connected-row is-linked" key={`${group.title}:${item.entityId || item.label}`} onClick={() => onOpenItem(item.label, item.entityId || '')}>{content}</button>
              : <div className="peridot-evidence-connected-row" key={`${group.title}:${item.entityId || item.label}`}>{content}</div>;
          })}
        </div>
        {group.items.length > DEFAULT_REFERENCE_LIST_LIMIT ? <button type="button" className="peridot-evidence-connected-more" onClick={() => setExpandedGroups((previous) => ({...previous, [group.title]: !expanded}))}>
          {expanded ? 'Show fewer' : `Show ${remaining} more`}
        </button> : null}
      </section>;
    })}
  </div>;
}

/*
 * The relationship register is source-row backed. Only mapped assertions
 * become entries: co-occurrence in one record is not invented as a relation.
 * Expansion does not change Inspector history; navigation to a different
 * source record or entity uses the existing App-owned callbacks.
 */
function RelationshipRegisterSheet({ selectedLabel, entityType, entityId, rows, onOpenPersonDetail, onOpenPlaceDetail, onOpenLetterDetail, onOpenRouteDetail, onOpenMappedConnection }) {
  const [query, setQuery] = useState('');
  const [groupFilter, setGroupFilter] = useState('all');
  const [showAll, setShowAll] = useState(false);
  const model = useMemo(() => buildPeridotRelationshipRegister(rows, { entityLabel: selectedLabel, entityId, entityType }, buildPeridotRecordStructure), [rows, selectedLabel, entityId, entityType]);
  const combined = [
    ...model.entities.map((item, i) => ({ ...item, key: `person:${i}`, group: 'entity' })),
    ...model.places.map((item, i) => ({ ...item, key: `place:${i}`, group: 'place' })),
  ];
  const lowerQuery = query.trim().toLocaleLowerCase();
  const filtered = combined.filter((entry) => {
    if (groupFilter !== 'all' && entry.group !== groupFilter) return false;
    return !lowerQuery || [entry.source, entry.target, entry.relationshipType, entry.sourceRole, entry.targetRole]
      .some((text) => String(text || '').toLocaleLowerCase().includes(lowerQuery));
  });
  const shown = showAll ? filtered : filtered.slice(0, 30);
  const supportingRowCount = new Set(combined.flatMap((entry) => entry.records)).size;
  const totalOccurrences = combined.reduce((sum, entry) => sum + entry.occurrences, 0);
  const canOpenParticipant = typeof onOpenPersonDetail === 'function';
  const canOpenPlace = typeof onOpenPlaceDetail === 'function';
  const navigate = (name, id, isPlace) => (isPlace ? onOpenPlaceDetail : onOpenPersonDetail)?.(name, ...(isPlace ? [] : [id || '']));

  return <section className="peridot-evidence-relationship-register" aria-label="Mapped relationship register">
    <div className="peridot-evidence-relationship-intro">
      <span><strong>Selected subject:</strong> {selectedLabel || 'Unnamed subject'}</span>
      <p>This register contains explicit mapped relationships and geographic origin–destination pairs associated with the selected subject. Source records and relationship occurrences are counted separately.</p>
    </div>
    <div className="peridot-evidence-relationship-metrics" aria-label="Relationship register summary">
      <div><strong>{combined.length}</strong><span>Mapped entries</span></div>
      <div><strong>{totalOccurrences}</strong><span>Represented occurrences</span></div>
      <div><strong>{supportingRowCount}</strong><span>Distinct contributing rows</span></div>
    </div>
    <div className="peridot-evidence-relationship-controls">
      <label>Find a connection
        <input type="search" value={query} onChange={(event) => { setQuery(event.target.value); setShowAll(false); }} placeholder="Person, place, or relationship type" />
      </label>
      <label>Show
        <select value={groupFilter} onChange={(event) => { setGroupFilter(event.target.value); setShowAll(false); }}>
          <option value="all">All mapped connections</option>
          <option value="entity">People and entities</option>
          <option value="place">Directed place pairs</option>
        </select>
      </label>
    </div>
    <div className="peridot-evidence-relationship-list">
      {shown.map((entry) => {
        const isPlace = entry.group === 'place';
        const connector = entry.direction === 'directed' ? '→' : '—';
        const canFollow = isPlace ? canOpenPlace : canOpenParticipant;
        return <article className="peridot-evidence-relationship-entry" key={entry.key}>
          <div className="peridot-evidence-relationship-entry-head">
            <div className="peridot-evidence-relationship-entry-main">
              <div className="peridot-evidence-relationship-kind">{isPlace ? 'Mapped geographic pair' : 'Mapped participant relationship'}</div>
              <div className="peridot-evidence-relationship-pair">
                {canFollow ? <button type="button" className="peridot-evidence-relationship-entity-link" onClick={() => navigate(entry.source, entry.sourceId, isPlace)}>{entry.source}</button> : <span>{entry.source}</span>}
                <span className="peridot-evidence-relationship-direction-symbol" aria-hidden="true">{connector}</span>
                {canFollow ? <button type="button" className="peridot-evidence-relationship-entity-link" onClick={() => navigate(entry.target, entry.targetId, isPlace)}>{entry.target}</button> : <span>{entry.target}</span>}
              </div>
              <div className="peridot-evidence-relationship-facts">
                {!isPlace ? <span><strong>Relationship type:</strong> {entry.relationshipType || 'Not specified in mapped data'}</span> : null}
                <span><strong>Direction:</strong> {entry.direction === 'directed' ? 'Directed' : 'Undirected'}</span>
                {entry.sourceRole ? <span><strong>{isPlace ? 'Origin field' : 'First participant role'}:</strong> {entry.sourceRole}</span> : null}
                {entry.targetRole ? <span><strong>{isPlace ? 'Destination field' : 'Second participant role'}:</strong> {entry.targetRole}</span> : null}
              </div>
            </div>
            <div className="peridot-evidence-relationship-entry-side">
              <div className="peridot-evidence-relationship-count"><strong>{entry.occurrences}</strong><span>occurrence{entry.occurrences === 1 ? '' : 's'}</span></div>
              <div className="peridot-evidence-relationship-count"><strong>{entry.records.length}</strong><span>source row{entry.records.length === 1 ? '' : 's'}</span></div>
              {typeof onOpenMappedConnection === 'function' ? <button type="button" className="peridot-evidence-relationship-expand" onClick={() => onOpenMappedConnection(entry)} aria-label={`Inspect connection ${entry.source} ${connector} ${entry.target}`}>Inspect connection <span aria-hidden="true">›</span></button> : null}
            </div>
          </div>
        </article>;
      })}
      {!filtered.length ? <p className="peridot-evidence-relationship-empty">{combined.length ? 'No mapped connections match these search criteria.' : 'No explicit mapped relationships or directed place pairs are available for this selection.'}</p> : null}
      {!showAll && filtered.length > shown.length ? <button type="button" className="peridot-evidence-relationship-show-more" onClick={() => setShowAll(true)}>Show {filtered.length - shown.length} more entries</button> : null}
    </div>
  </section>;
}

function EntityCustomFieldsCard({ selectedProps, viewMode }) {
  const fields = buildEntityCustomFieldSummaries(selectedProps, viewMode);
  if (!fields.length) return null;

  return (
    <SectionShell title="Entity fields">
      <div className="grid gap-3 md:grid-cols-2">
        {fields.map((field) => (
          <div key={field.label} className="min-w-0 rounded-xl border border-[var(--section-border)]/75 bg-[var(--section-bg)]/75 px-3 py-2">
            <div className={detailLabelClassName()}>{field.label}</div>
            <div className="mt-1 space-y-1 text-sm text-[var(--text-main)]">
              {field.values.map((item) => (
                <div key={`${field.label}:${item.value}`} className="flex items-start justify-between gap-3">
                  <span className="min-w-0 break-words">{item.value}</span>
                  {item.count > 1 ? (
                    <span className="shrink-0 rounded-full bg-[var(--stat-card-bg)] px-2 py-0.5 text-[10px] text-[var(--panel-card-muted-text)]">
                      {item.count}
                    </span>
                  ) : null}
                </div>
              ))}
              {field.additionalValueCount > 0 ? (
                <div className="text-xs text-[var(--panel-card-muted-text)]">
                  + {field.additionalValueCount} more value{field.additionalValueCount === 1 ? '' : 's'}
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

function getProfileRecordCount(selectedProps, profile) {
  return selectedProps?.linkedLetterCount || profile.matchingLetters.length || 0;
}


function formatCoordinateValue(value) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return '';
  return numericValue.toFixed(6).replace(/0+$/, '').replace(/\.$/, '');
}

function getCoordinateSummary(selectedProps) {
  const latitude = selectedProps?.latitude ?? selectedProps?.lat ?? selectedProps?.Latitude ?? selectedProps?.LATITUDE;
  const longitude = selectedProps?.longitude ?? selectedProps?.lng ?? selectedProps?.lon ?? selectedProps?.Longitude ?? selectedProps?.LONGITUDE;
  const formattedLatitude = formatCoordinateValue(latitude);
  const formattedLongitude = formatCoordinateValue(longitude);
  if (!formattedLatitude || !formattedLongitude) return '';
  return `${formattedLatitude}, ${formattedLongitude}`;
}

function getMostAssociatedPlace(profile) {
  const placeCounts = new Map();
  (profile.relatedPlacesSections || []).forEach((section) => {
    (section.items || []).forEach((item) => {
      countMapIncrement(placeCounts, item.label, item.count || 1);
    });
  });
  return sortCountMap(placeCounts)[0] || null;
}

function buildLeadSentence(selectedProps, profile) {
  const label = profile.entityLabel || getSelectedEntityLabel(selectedProps) || 'This selection';
  const typeLabel = profile.entityType === 'place' ? 'place' : 'person/entity';
  const recordCount = getProfileRecordCount(selectedProps, profile);
  const degree = Number(selectedProps?.degree);
  const edgeCount = Number(selectedProps?.incidentEdgeCount);
  const visibleRecordDates = profile.dateSpan;
  const coordinates = getCoordinateSummary(selectedProps);
  const associatedPlace = profile.entityType === 'place' ? null : getMostAssociatedPlace(profile);

  const networkParts = [];
  if (Number.isFinite(degree) && degree > 0) networkParts.push(`a network weight of ${degree}`);
  if (Number.isFinite(edgeCount) && edgeCount > 0) networkParts.push(`${edgeCount} connection${edgeCount === 1 ? '' : 's'}`);

  return (
    <>
      <span className="font-semibold text-[var(--panel-card-text)]">{label}</span>
      {' '}is a {typeLabel} in the current Inspector scope
      {networkParts.length ? ` with ${networkParts.join(' and ')}` : ''}. It represents{' '}
      <span className="font-semibold text-[var(--panel-card-text)]">{recordCount}</span>
      {' '}related record{recordCount === 1 ? '' : 's'}
      {visibleRecordDates ? <>. Dates of visible records: <span className="font-semibold text-[var(--panel-card-text)]">{visibleRecordDates}</span></> : null}
      {coordinates ? <> and is mapped at <span className="font-semibold text-[var(--panel-card-text)]">{coordinates}</span></> : null}
      {associatedPlace ? <>. It is most often associated with <span className="font-semibold text-[var(--panel-card-text)]">{associatedPlace.label}</span> in related records</> : null}.
    </>
  );
}

function ReferenceLead({ selectedProps, profile, showTitle = true }) {
  const imageUrl = selectedProps?.personMetadata?.imageCreativeCommons || '';
  const title = profile.entityLabel || getSelectedEntityLabel(selectedProps);
  const typeLabel = profile.entityType === 'place' ? 'Place' : 'Person / entity';
  const placeholderInitial = (title || '?').slice(0, 1).toUpperCase();

  return (
    <section className="rounded-2xl border border-[var(--panel-card-border)]/70 bg-[var(--utility-panel-bg)] p-3 shadow-[0_8px_24px_var(--peridot-color-rgba-rgba-87-58-46-0-06)]">
      <div className="grid gap-4 md:grid-cols-[13rem_minmax(0,1fr)]">
        <div className="overflow-hidden rounded-xl border border-[var(--section-border)]/80 bg-[var(--section-bg)]">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={`${title} reference image`}
              className="h-44 w-full object-cover"
              onError={(event) => {
                event.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="flex h-44 items-center justify-center bg-[var(--section-bg)] text-center">
              <div>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[var(--section-border)] bg-[var(--panel-bg)] text-3xl font-semibold text-[var(--detail-label-text)]">
                  {placeholderInitial}
                </div>
                <div className="mt-3 px-4 text-xs uppercase tracking-[0.16em] text-[var(--panel-card-muted-text)]">
                  Image if available
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="min-w-0">
          <div className={detailLabelClassName()}>{typeLabel}</div>
          {showTitle ? (
            <h2 className="mt-1 break-words [font-family:Georgia,'Palatino_Linotype','Book_Antiqua',Palatino,serif] text-2xl font-semibold leading-tight tracking-[-0.025em] text-[var(--panel-card-text)]">
              {title || 'Selected entity'}
            </h2>
          ) : null}
          <p className="mt-3 max-w-3xl text-base leading-relaxed text-[var(--text-main)]">
            {buildLeadSentence(selectedProps, profile)}
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            <div className="rounded-lg border border-[var(--section-border)]/70 bg-[var(--section-bg)]/80 px-3 py-2">
              <div className={detailLabelClassName()}>Connected places</div>
              <div className="mt-0.5 text-sm font-semibold text-[var(--text-main)]">{profile.relatedPlacesCount}</div>
            </div>
            <div className="rounded-lg border border-[var(--section-border)]/70 bg-[var(--section-bg)]/80 px-3 py-2">
              <div className={detailLabelClassName()}>Connected people</div>
              <div className="mt-0.5 text-sm font-semibold text-[var(--text-main)]">{profile.relatedPeopleCount}</div>
            </div>
            <div className="rounded-lg border border-[var(--section-border)]/70 bg-[var(--section-bg)]/80 px-3 py-2">
              <div className={detailLabelClassName()}>Dates represented</div>
              <div className="mt-0.5 text-sm font-semibold text-[var(--text-main)]">{profile.dateCount || '—'}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/** A purely presentational image slot. No source image is inferred from unrelated records. */
function PeridotOverviewPortrait({ imageUrl, subjectLabel, entityType }) {
  const [failedImage, setFailedImage] = useState(false);
  const showsImage = Boolean(imageUrl) && !failedImage;
  return (
    <figure className="peridot-evidence-overview-portrait" aria-label={`${entityType === 'place' ? 'Place' : 'Person'} reference image`}>
      {showsImage ? (
        <img src={imageUrl} alt={`Mapped reference image for ${subjectLabel}`} loading="lazy" referrerPolicy="no-referrer" onError={() => setFailedImage(true)} />
      ) : (
        <div className="peridot-evidence-overview-silhouette" role="img" aria-label={entityType === 'place' ? 'No mapped place image: landscape placeholder' : 'No mapped person image: silhouette placeholder'}>
          {entityType === 'place' ? (
            <svg viewBox="0 0 128 128" aria-hidden="true" focusable="false">
              <circle cx="95" cy="34" r="13" fill="currentColor" opacity=".64" />
              <path d="M10 102 43 53 69 84 85 64 119 102Z" fill="currentColor" opacity=".85" />
              <path d="M10 102h109" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
            </svg>
          ) : (
            <svg viewBox="0 0 128 128" aria-hidden="true" focusable="false">
              <circle cx="64" cy="43" r="23" fill="currentColor" />
              <path d="M20 115c1-30 17-45 44-45s43 15 44 45Z" fill="currentColor" />
            </svg>
          )}
        </div>
      )}
      <figcaption>{showsImage ? 'Mapped image' : 'No image mapped'}</figcaption>
    </figure>
  );
}

export function InspectorNodeView({
  InspectorSummaryCardComponent,
  PersonMetadataCardComponent,
  MissingPersonMetadataCardComponent,
  InspectorConnectedCorrespondentsComponent,
  InspectorPersonPlacesComponent,
  LinkedLettersPanelComponent,
  InspectorClearSelectionButtonComponent,

  selectedProps,
  clearSelection,
  viewMode,
  linkedLettersToShow,
  selectedLetterMetadata,
  showAllLinkedLetters,
  setShowAllLinkedLetters,
  isLetterSectionExpanded,
  toggleLetterSection,
  onOpenPersonDetail,
  onOpenPlaceDetail,
  onOpenLetterDetail,
  onOpenRouteDetail,
  onOpenMappedConnection,
  onExpandInspector,
  isCompact = false,
  selectionEvidence = null,
  dossierSheet = 'overview',
  onOpenExplore = null,
}) {
  const entityType = getSelectedEntityType(selectedProps, viewMode);
  const profile = buildEntityProfile(selectedProps, selectedLetterMetadata, viewMode);
  const selectedLabel = getSelectedEntityLabel(selectedProps);
  const entityMappedStructure = profile.structure;

  if (isCompact) {
    // The attributed structure is deliberately narrower than all fields in
    // related records. Present the former as entity-owned assertions; preview
    // the latter explicitly as evidence from contributing records.
    const ownedEntries = entityType === 'place'
      ? [...entityMappedStructure.places, ...entityMappedStructure.participants]
      : [...entityMappedStructure.temporal, ...entityMappedStructure.places, ...entityMappedStructure.relationships, ...entityMappedStructure.evidence];
    const records = profile.matchingLetters || [];
    // Pass B: only the verified selected-mark contract can supply mark evidence.
    // Entity-profile records remain broader context, even when they share a subject.
    const isGeographicMark = selectionEvidence?.representation?.markType === 'geographic-entity-anchor'
      && selectionEvidence?.support?.status === 'verified';
    const isNetworkMark = selectionEvidence?.representation?.markType === 'network-entity-node';
    const networkMark = isNetworkMark ? selectedProps.networkMarkEvidence : null;
    const networkMarkRows = isNetworkMark ? (selectionEvidence.support.records || []) : [];
    const networkEdges = networkMark?.edges || [];
    const networkCounterparts = networkEdges.map((edge) => ({
      label: edge.sourceLabel === selectedLabel ? edge.targetLabel : edge.sourceLabel,
      count: edge.count,
      relationshipLabel: edge.relationshipLabel,
      direction: edge.direction,
    })).filter((edge) => edge.label);
    const markRecords = isGeographicMark ? selectionEvidence.support.records : [];
    const markReasons = isGeographicMark ? selectionEvidence.representation.details : [];
    const anchorReasonLabel = markReasons
      .filter((item) => item.kind === 'mapped-role' || item.kind === 'derived-anchor')
      .map((item) => item.value).join(' · ');
    const broaderRecordCount = getProfileRecordCount(selectedProps, profile);
    return (
      <div className="peridot-inspector-compact-data-flow">
        {isGeographicMark ? (
          <>
            <div className="peridot-inspector-evidence-tier peridot-inspector-evidence-tier--support">
              <div className="peridot-inspector-compact-subheading">Evidence supporting this mark</div>
              <p className="peridot-inspector-compact-muted">These mapped place observations and source records specifically support the selected visual node in the displayed Map scope.</p>
              <CompactFactGrid entries={[
                { label: 'Mapped place', value: selectedProps.anchorLabel },
                ...(anchorReasonLabel ? [{ label: 'Mapped role or Map calculation', value: anchorReasonLabel }] : []),
                { label: 'Distinct supporting source records', value: String(selectionEvidence.support.recordCount) },
              ]}/>
              <CompactRecordPreview rows={markRecords} maxRecords={1}/>
              {markRecords.length > 1 ? <CompactRecordMore rows={markRecords} maxRecords={3}/> : null}
            </div>
            <div className="peridot-inspector-evidence-tier peridot-inspector-evidence-tier--context">
              <div className="peridot-inspector-compact-subheading">Broader evidence about this {entityType === 'place' ? 'place' : 'entity'}</div>
              <p className="peridot-inspector-compact-muted">Other associated records and assertions in the applied search scope. These do not necessarily produce the selected geographic mark.</p>
              <CompactFactGrid entries={[{ label: 'Associated records · applied search scope', value: String(broaderRecordCount) }]}/>
            </div>
            <CompactEvidenceReveal title="Explore broader mapped information and counts">
              {ownedEntries.length ? <CompactEvidenceRows entries={ownedEntries} limit={20}/> : null}
              <CompactRecordPreview rows={records} maxRecords={1}/>
              <CompactMetricStrip entries={[
                { label: 'Connected people / entities', shortLabel: 'Connected entities', value: profile.relatedPeopleCount },
                { label: 'Connected places', shortLabel: 'Connected places', value: profile.relatedPlacesCount },
                ...(profile.routeCount ? [{ label: 'Directed place connections', shortLabel: 'Directed links', value: profile.routeCount }] : []),
                ...(selectedProps.degree != null ? [{ label: 'Visualized network weight', shortLabel: 'Network weight', value: selectedProps.degree }] : []),
              ]}/>
              <CompactRecordMore rows={records} maxRecords={2}/>
              {profile.dateSpan ? <CompactFactGrid entries={[{ label: 'Date range across related records', value: profile.dateSpan }]}/> : null}
            </CompactEvidenceReveal>
          </>
        ) : isNetworkMark ? (
          <>
            <div className="peridot-inspector-evidence-tier peridot-inspector-evidence-tier--support">
              <div className="peridot-inspector-compact-subheading">Evidence supporting this Network mark</div>
              <p className="peridot-inspector-compact-muted">These connections belong to the selected node in the displayed Network. Relationship occurrences are not necessarily distinct source records.</p>
              {networkMark ? <CompactFactGrid entries={[
                { label: 'Displayed connections', value: String(networkMark.edgeCount) },
                ...(networkMark.representedWeight !== null ? [{ label: 'Represented relationship occurrences', value: String(networkMark.representedWeight) }] : []),
                ...(selectionEvidence.support.status === 'verified' ? [{ label: 'Distinct supporting source records', value: String(selectionEvidence.support.recordCount) }] : []),
              ]}/> : <p className="peridot-inspector-compact-muted">Mark-level connection provenance is unavailable for this selection.</p>}
              {networkCounterparts.length ? (
                <>
                  <div className="peridot-inspector-compact-subheading">Connected participants in this Network</div>
                  <CompactFactGrid entries={networkCounterparts.slice(0, 4).map((edge) => ({
                    label: edge.relationshipLabel || 'Connected with',
                    value: `${edge.label}${edge.count !== null ? ` · ${edge.count} occurrence${edge.count === 1 ? '' : 's'}` : ''}`,
                  }))}/>
                  {networkCounterparts.length > 4 ? <CompactEvidenceReveal title="Show other displayed connections">
                    <CompactFactGrid entries={networkCounterparts.slice(4).map((edge) => ({
                      label: edge.relationshipLabel || 'Connected with',
                      value: `${edge.label}${edge.count !== null ? ` · ${edge.count} occurrence${edge.count === 1 ? '' : 's'}` : ''}`,
                    }))}/>
                  </CompactEvidenceReveal> : null}
                </>
              ) : null}
              {selectionEvidence.support.status === 'partial' ? <p className="peridot-inspector-compact-muted">Some displayed edges lack record provenance; the distinct-record count may be incomplete.</p> : null}
              {networkMarkRows.length ? <CompactRecordPreview rows={networkMarkRows} maxRecords={1}/> : null}
            </div>
            <div className="peridot-inspector-evidence-tier peridot-inspector-evidence-tier--context">
              <div className="peridot-inspector-compact-subheading">Broader evidence about this {entityType === 'place' ? 'place' : 'entity'}</div>
              <p className="peridot-inspector-compact-muted">Other mapped assertions and records associated with this entity in the applied search scope. They are not necessarily the evidence producing the displayed connections.</p>
              <CompactFactGrid entries={[{ label: 'Associated records · applied search scope', value: String(broaderRecordCount) }]}/>
            </div>
            <CompactEvidenceReveal title="Explore broader mapped information and counts">
              {ownedEntries.length ? <CompactEvidenceRows entries={ownedEntries} limit={20}/> : null}
              <CompactRecordPreview rows={records} maxRecords={1}/>
              <CompactMetricStrip entries={[
                { label: 'Connected people / entities', shortLabel: 'Connected entities', value: profile.relatedPeopleCount },
                { label: 'Connected places', shortLabel: 'Connected places', value: profile.relatedPlacesCount },
                ...(profile.routeCount ? [{ label: 'Directed place connections', shortLabel: 'Directed links', value: profile.routeCount }] : []),
                ...(selectedProps.degree != null ? [{ label: 'Visualized network weight', shortLabel: 'Network weight', value: selectedProps.degree }] : []),
              ]}/>
              <CompactRecordMore rows={records} maxRecords={2}/>
              {profile.dateSpan ? <CompactFactGrid entries={[{ label: 'Date range across related records', value: profile.dateSpan }]}/> : null}
            </CompactEvidenceReveal>
          </>
        ) : (
          <>
        <CompactFactGrid entries={[{ label: 'Related records · applied scope', value: String(broaderRecordCount) }]}/>
        {ownedEntries.length ? (
          <>
            <div className="peridot-inspector-compact-subheading">{entityType === 'place' ? 'Mapped associations with this place' : 'Mapped assertions about this entity'}</div>
            <CompactEvidenceRows entries={ownedEntries} limit={3}/>
          </>
        ) : null}
        {selectedProps.anchorLabel && !ownedEntries.some((entry) => entry.value === selectedProps.anchorLabel) ? (
          <CompactFactGrid entries={[{ label: 'Visualized map anchor', value: selectedProps.anchorLabel }]}/>
        ) : null}
        {!ownedEntries.length && profile.dateSpan ? <DetailRow label="Dates of related records" value={profile.dateSpan} /> : null}
        <CompactRecordPreview rows={records} maxRecords={1}/>
        <CompactMetricStrip entries={[
          { label: 'Connected people / entities', shortLabel: 'Connected entities', value: profile.relatedPeopleCount },
          { label: 'Connected places', shortLabel: 'Connected places', value: profile.relatedPlacesCount },
          ...(profile.routeCount ? [{ label: 'Directed place connections', shortLabel: 'Directed links', value: profile.routeCount }] : []),
          ...(selectedProps.degree != null ? [{ label: 'Visualized network weight', shortLabel: 'Network weight', value: selectedProps.degree }] : []),
        ]}/>
        <CompactEvidenceReveal title="Show more mapped information">
          <CompactEvidenceRows entries={ownedEntries.slice(3)} limit={20}/>
          <CompactRecordMore rows={records} maxRecords={2}/>
          {profile.dateSpan ? <CompactFactGrid entries={[{ label: 'Date range across related records', value: profile.dateSpan }]}/> : null}
          <p className="peridot-inspector-compact-muted">Record-level fields describe their source records, not automatically this entity. Complete source text and navigation remain in the full dossier.</p>
        </CompactEvidenceReveal>
          </>
        )}
        {/* Clear selection is available in compact Next steps. */}
      </div>
    );
  }

  // The folder's leaf pages reorganize existing source-backed components,
  // not their calculations. A sheet switch never follows a new research object.
  const leaf = {
    places: {
      title: 'Connected places',
      description: profile.entityType === 'place'
        ? 'Places linked to the selected place by explicit mapped origin–destination pairs in the current Inspector scope.'
        : 'Places associated with this selection in its related records, grouped by mapped roles.',
      content: <ConnectedEvidenceSheet kind="places" selectedLabel={profile.entityLabel} sections={profile.relatedPlacesSections}
        emptyMessage={profile.entityType === 'place' ? 'No explicit mapped geographic pairs connect this place to another place in the current Inspector scope.' : 'No connected places were found in related records for this profile.'} onOpenItem={onOpenPlaceDetail} />,
    },
    people: {
      title: 'Connected people',
      description: 'Connected entities appear in the selected subject’s mapped records. Names are separated from relationship evidence so the direction and nature of a connection are not implied by an ambiguous label.',
      content: <ConnectedEvidenceSheet kind="people" selectedLabel={profile.entityLabel} sections={profile.relatedPeopleSections}
        relationships={entityMappedStructure.relationships}
        emptyMessage="No connected people were found in related records for this profile." onOpenItem={onOpenPersonDetail} />,
    },
    relationships: {
      title: 'Relationships',
      description: 'Recorded connections and directed place pairs. A mapped participant role is not, by itself, a claim of historical agency.',
      content: <RelationshipRegisterSheet key={`${profile.entityId || profile.entityLabel}:relationships`} selectedLabel={profile.entityLabel} entityId={profile.entityId}
        entityType={profile.entityType} rows={profile.matchingLetters} onOpenPersonDetail={onOpenPersonDetail}
        onOpenPlaceDetail={onOpenPlaceDetail} onOpenLetterDetail={onOpenLetterDetail} onOpenRouteDetail={onOpenRouteDetail} onOpenMappedConnection={onOpenMappedConnection} />,
    },
    records: {
      title: 'Contributing records',
      description: 'Records associated with this subject in the current Inspector scope. They do not necessarily support every individual visual mark.',
      content: <PeridotContributingRecordsLedger rows={profile.matchingLetters}
        subjectLabel={profile.entityLabel} entityId={profile.entityId} entityType={profile.entityType}
        onOpenRecord={onOpenLetterDetail} />,
    },
    investigate: {
      title: 'Investigate further',
      description: 'Move from a particular dossier to a new question without changing the existing research trail.',
      content: <PeridotInvestigateFurther key={`${profile.entityId || profile.entityLabel}:investigate`}
        subjectLabel={profile.entityLabel} subjectType={profile.entityType} />,
    },
  };
  const active = Object.prototype.hasOwnProperty.call(leaf, dossierSheet) ? dossierSheet : 'overview';
  // The sheet index identifies the page; this heading consistently identifies
  // its research subject. Switching sheets must not add a breadcrumb.
  const subjectHeading = (
    <header className="peridot-evidence-subject-heading">
      <h2>{profile.entityLabel || selectedLabel || 'Selected entity'}</h2>
    </header>
  );
  if (active !== 'overview') {
    const page = leaf[active];
    return <article className="peridot-evidence-leaf-page">
      {subjectHeading}
      <div className="peridot-evidence-leaf-body">{page.content}</div>
    </article>;
  }

  // Overview is an orientation sheet. Its mapped assertions, records and
  // counterpart inventories remain available in the other sheets. Never infer
  // mark-level support from broader records about the selected entity.
  const markType = selectionEvidence?.representation?.markType;
  const isGeographicMark = markType === 'geographic-entity-anchor' && selectionEvidence?.support?.status === 'verified';
  const isNetworkMark = markType === 'network-entity-node';
  const markReasonDetails = isGeographicMark ? (selectionEvidence?.representation?.details || []) : [];
  const isMostFrequentAnchor = markReasonDetails.some((item) => item.kind === 'derived-anchor' && item.value === 'Most frequent place');
  const geographicRoleNames = markReasonDetails.filter((item) => item.kind === 'mapped-role').map((item) => item.value).filter(Boolean);
  const anchorLabel = normalizeEntityText(selectedProps?.anchorLabel);
  const supportingRecordCount = selectionEvidence?.support?.status === 'verified' ? selectionEvidence?.support?.recordCount : null;
  const networkMark = isNetworkMark ? selectedProps?.networkMarkEvidence : null;
  const relatedCount = getProfileRecordCount(selectedProps, profile);
  const imageUrl = normalizeEntityText(selectedProps?.personMetadata?.imageCreativeCommons);
  const explanation = isGeographicMark
    ? isMostFrequentAnchor
      ? `The Map positions this entity at ${anchorLabel} using the enabled Most frequent place calculation, based on mapped place observations in the displayed scope.`
      : geographicRoleNames.length
        ? `The Map positions this entity at ${anchorLabel} because ${geographicRoleNames.join(' and ')} ${geographicRoleNames.length === 1 ? 'is an enabled mapped place role' : 'are enabled mapped place roles'}.`
        : `The current Map anchor settings position this entity at ${anchorLabel}.`
    : isNetworkMark && networkMark
      ? `The current Network displays this entity through ${networkMark.edgeCount} incident connection${networkMark.edgeCount === 1 ? '' : 's'}.${networkMark.representedWeight != null ? ` These represent ${networkMark.representedWeight} mapped relationship occurrences, not necessarily distinct records.` : ''}`
      : isNetworkMark
        ? 'This entity appears in the Network, but verified mark-level connection provenance is not available for this selection.'
        : `This ${entityType === 'place' ? 'place' : 'entity'} dossier summarizes mapped records associated with the selected subject in the current Inspector scope. These associations do not necessarily produce any particular visual mark.`;
  return <article className="peridot-evidence-overview-sheet">
    {subjectHeading}
    <section className="peridot-evidence-overview-intro" aria-label="Subject orientation">
      <div className="peridot-evidence-overview-intro-text">
        <div className="peridot-evidence-overview-eyebrow">{entityType === 'place' ? 'Place dossier' : 'Person / entity dossier'}</div>
        <p>
          This {entityType === 'place' ? 'place' : 'person/entity'} is represented by mapped records in the current Inspector scope.
          {profile.dateSpan ? <> The associated records span <strong>{profile.dateSpan}</strong>.</> : null}
          {' '}The counts below summarize broader associated evidence, which is not necessarily the evidence producing a particular visual mark.
        </p>
        <div className="peridot-evidence-overview-stats" aria-label="Related evidence at a glance">
          <div><span>Related records</span><strong>{relatedCount}</strong></div>
          <div><span>Connected people</span><strong>{profile.relatedPeopleCount}</strong></div>
          <div><span>Connected places</span><strong>{profile.relatedPlacesCount}</strong></div>
          <div><span>Dates represented</span><strong>{profile.dateCount || '—'}</strong></div>
        </div>
      </div>
      <PeridotOverviewPortrait key={`${entityType}:${imageUrl}`} imageUrl={imageUrl} subjectLabel={profile.entityLabel || selectedLabel} entityType={entityType} />
    </section>
    <section className="peridot-evidence-overview-interpretation" aria-labelledby="peridot-overview-representation-heading">
      <h3 id="peridot-overview-representation-heading">Why this {isGeographicMark || isNetworkMark ? 'mark' : 'subject'} appears</h3>
      <p>{explanation}</p>
      {isGeographicMark ? <div className="peridot-evidence-overview-scope">
        <span>Mapped location: <strong>{anchorLabel}</strong></span>
        <span>Supporting source records for this Map mark: <strong>{supportingRecordCount}</strong></span>
        <p>Map placement follows the researcher’s mapped place roles and enabled anchor settings. These supporting records need not include every record associated with this entity.</p>
      </div> : null}
      {isNetworkMark ? <div className="peridot-evidence-overview-scope">
        {selectionEvidence?.support?.status === 'verified' ? <span>Distinct source records supporting displayed connections: <strong>{supportingRecordCount}</strong></span> : null}
        <p>{selectionEvidence?.support?.status === 'partial' ? 'Some displayed edges do not supply record-level provenance, so a complete distinct-record total is unavailable.' : 'The Network is constructed from researcher-mapped participants and relationships in the current displayed scope. Broader records associated with the entity are not automatically evidence for the displayed edges.'}</p>
      </div> : null}
    </section>
    {entityMappedStructure && (
      <section className="peridot-evidence-overview-mapped" aria-label="Selected subject mapped attributes">
        <h3>Mapped information</h3>
        <p>These are mapped assertions associated with the selected subject. See the other sheets for the complete connected-object lists and source records.</p>
        <div className="peridot-evidence-overview-assertions">
          <PeridotRecordStructure structure={entityMappedStructure}
            presentation="overview-ledger"
            title={entityType === 'place' ? 'Mapped information about this place' : 'Mapped information about this person / entity'}
            onOpenPersonDetail={onOpenPersonDetail} onOpenPlaceDetail={onOpenPlaceDetail} />
        </div>
      </section>
    )}
  </article>;
}
