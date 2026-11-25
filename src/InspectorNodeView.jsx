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

import React, { useState } from 'react';
import { buildPeridotInspectorEntityProfile } from './peridotInspectorSemantics.js';
import { filterPeridotCanonicalEntityEvidenceToRows } from './peridotEntityEvidence.js';
import { omitRedundantCompactRelationshipEntries } from './peridotInspectorCompactGrouping.js';
import { PeridotRecordStructure } from './PeridotRecordStructure.jsx';
import { CompactEvidenceRows, CompactGroupedValues, CompactFactGrid, CompactEvidenceReveal, CompactRecordPreview, CompactRecordMore, CompactMetricStrip } from './InspectorCompactEvidence.jsx';

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

function ReferenceLead({ selectedProps, profile }) {
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
          <h2 className="mt-1 break-words [font-family:Georgia,'Palatino_Linotype','Book_Antiqua',Palatino,serif] text-2xl font-semibold leading-tight tracking-[-0.025em] text-[var(--panel-card-text)]">
            {title || 'Selected entity'}
          </h2>
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
  onExpandInspector,
  isCompact = false,
  selectionEvidence = null,
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
    const compactOwnedEntries = omitRedundantCompactRelationshipEntries(ownedEntries);
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
              {compactOwnedEntries.length ? <CompactGroupedValues entries={compactOwnedEntries} initialLimit={20}/> : null}
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
                  <CompactGroupedValues initialLimit={4} moreLabel="Show other displayed connections" entries={networkCounterparts.map((edge) => ({
                    label: edge.relationshipLabel || 'Connected with',
                    value: `${edge.label}${edge.count != null ? ` · ${edge.count} occurrence${edge.count === 1 ? '' : 's'}` : ''}`,
                  }))}/>
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
              {compactOwnedEntries.length ? <CompactGroupedValues entries={compactOwnedEntries} initialLimit={20}/> : null}
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
        {compactOwnedEntries.length ? (
          <>
            <div className="peridot-inspector-compact-subheading">{entityType === 'place' ? 'Mapped associations with this place' : 'Mapped assertions about this entity'}</div>
            <CompactGroupedValues entries={compactOwnedEntries.slice(0, 3)} initialLimit={3}/>
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
          <CompactGroupedValues entries={compactOwnedEntries.slice(3)} initialLimit={20}/>
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

  return (
    <article className="space-y-3">
      <ReferenceLead selectedProps={selectedProps} profile={profile} />
      <div className="grid gap-3 lg:grid-cols-2">
        <CountSectionCard
          title="Connected places"
          sections={profile.relatedPlacesSections}
          emptyMessage="No connected places were found in related records for this profile."
          onOpenItem={onOpenPlaceDetail}
        />

        <CountSectionCard
          title="Connected people"
          sections={profile.relatedPeopleSections}
          emptyMessage="No connected people were found in related records for this profile."
          onOpenItem={onOpenPersonDetail}
        />
      </div>

      <CountSectionCard
        title="Directed place connections"
        sections={profile.routeSections}
        emptyMessage="No explicit directed place pairs were found in related records for this profile."
        onOpenItem={onOpenRouteDetail}
      />

      <LinkedLettersPanelComponent
        linkedLettersToShow={linkedLettersToShow}
        selectedLetterMetadata={selectedLetterMetadata}
        showAllLinkedLetters={showAllLinkedLetters}
        setShowAllLinkedLetters={setShowAllLinkedLetters}
        isLetterSectionExpanded={isLetterSectionExpanded}
        toggleLetterSection={toggleLetterSection}
        onOpenLetterDetail={onOpenLetterDetail}
      />

      <PeridotRecordStructure
        structure={entityMappedStructure}
        title={entityType === 'place' ? 'Mapped information about this place' : 'Mapped information about this person / entity'}
        onOpenPersonDetail={onOpenPersonDetail}
        onOpenPlaceDetail={onOpenPlaceDetail}
      />

      <div className="flex justify-end">
        <InspectorClearSelectionButtonComponent onClear={clearSelection} />
      </div>
    </article>
  );
}
