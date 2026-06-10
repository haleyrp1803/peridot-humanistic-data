/*
 * Node, person-profile, place-profile, and linked-record Inspector view.
 * 
 * This component renders the richest Inspector evidence pages: entity summaries, related people/places, directed routes, date spans, selected custom fields, linked-letter/detail records, and compact summary affordances.
 * 
 * Important relationships:
 * - Selection/detail payloads come from `interactionHelpers.js`, `App.jsx`, and workbook/custom-field metadata.
 * - Navigation actions call back into App-owned Inspector history so compact and full modes remain synchronized.
 * 
 * Maintenance cautions:
 * - This is a dense evidence UI file. Test person profile, place profile, linked record, route row, compact summary tile, and Back behavior after edits.
 */

import React from 'react';

function detailLabelClassName() {
  return '[font-family:Georgia,"Palatino_Linotype","Book_Antiqua",Palatino,serif] text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--detail-label-text)]';
}

function DetailRow({ label, value }) {
  return (
    <div className="border-b border-[var(--section-border)]/80 py-2 last:border-b-0">
      <div className={detailLabelClassName()}>{label}</div>
      <div className="mt-1 break-words text-sm text-[var(--text-main)]">{value || '—'}</div>
    </div>
  );
}

function normalizeEntityText(value) {
  return String(value ?? '').trim();
}

function normalizeComparable(value) {
  return normalizeEntityText(value).toLowerCase();
}

function getSelectedEntityLabel(selectedProps) {
  return normalizeEntityText(selectedProps?.detailLabel || selectedProps?.label);
}

function getSelectedEntityType(selectedProps, viewMode) {
  if (selectedProps?.__kind === 'person-detail') return 'person';
  if (selectedProps?.__kind === 'place-detail') return 'place';
  if (selectedProps?.entityType === 'place') return 'place';
  if (selectedProps?.entityType === 'person') return 'person';
  return viewMode === 'geographic' ? 'place' : 'person';
}

function letterMatchesSelectedEntity(letter, selectedProps, viewMode) {
  const label = getSelectedEntityLabel(selectedProps);
  if (!label) return false;

  const normalizedLabel = normalizeComparable(label);
  const entityType = getSelectedEntityType(selectedProps, viewMode);

  if (entityType === 'person') {
    return [
      letter?.source,
      letter?.target,
      letter?.sourcePerson,
      letter?.targetPerson,
    ].some((value) => normalizeComparable(value) === normalizedLabel);
  }

  return [letter?.sourceLoc, letter?.targetLoc].some((value) => normalizeComparable(value) === normalizedLabel);
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

function buildEntityCustomFieldSummaries(selectedProps, selectedLetterMetadata = [], viewMode) {
  const matchingLetters = selectedLetterMetadata.filter((letter) => letterMatchesSelectedEntity(letter, selectedProps, viewMode));
  const fieldMap = new Map();

  matchingLetters.forEach((letter) => {
    normalizeLetterCustomFields(letter).forEach((field) => {
      if (!fieldMap.has(field.label)) {
        fieldMap.set(field.label, {
          label: field.label,
          values: new Map(),
          recordCount: 0,
        });
      }

      const entry = fieldMap.get(field.label);
      entry.recordCount += 1;
      entry.values.set(field.value, (entry.values.get(field.value) || 0) + 1);
    });
  });

  return Array.from(fieldMap.values())
    .map((field) => ({
      label: field.label,
      recordCount: field.recordCount,
      values: Array.from(field.values.entries())
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value))
        .slice(0, 8),
      additionalValueCount: Math.max(0, field.values.size - 8),
    }))
    .filter((field) => field.values.length)
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

function getUniqueDates(letters = []) {
  return Array.from(new Set(letters.map((letter) => normalizeEntityText(letter.date || letter.Date)).filter(Boolean))).sort();
}

function getDateSpan(letters = []) {
  const dates = getUniqueDates(letters);
  if (!dates.length) return '';
  if (dates.length === 1) return dates[0];
  return `${dates[0]} → ${dates[dates.length - 1]}`;
}

function makeRoleSections(sourceTitle, sourceItems, targetTitle, targetItems) {
  return [
    { title: sourceTitle, items: sortCountMap(sourceItems).slice(0, 12) },
    { title: targetTitle, items: sortCountMap(targetItems).slice(0, 12) },
  ];
}

function sectionItemCount(sections = []) {
  return sections.reduce((sum, section) => sum + (section.items?.length || 0), 0);
}

function buildEntityProfile(selectedProps, selectedLetterMetadata = [], viewMode) {
  const entityType = getSelectedEntityType(selectedProps, viewMode);
  const entityLabel = getSelectedEntityLabel(selectedProps);
  const normalizedEntityLabel = normalizeComparable(entityLabel);
  const matchingLetters = selectedLetterMetadata.filter((letter) => letterMatchesSelectedEntity(letter, selectedProps, viewMode));
  const routesWhenSource = new Map();
  const routesWhenTarget = new Map();

  const peopleWhenSource = new Map();
  const peopleWhenTarget = new Map();
  const placesWhenSource = new Map();
  const placesWhenTarget = new Map();

  matchingLetters.forEach((letter) => {
    const sourcePerson = normalizeEntityText(letter.source || letter.sourcePerson);
    const targetPerson = normalizeEntityText(letter.target || letter.targetPerson);
    const sourcePlace = normalizeEntityText(letter.sourceLoc);
    const targetPlace = normalizeEntityText(letter.targetLoc);
    const isSelectedSourcePerson = normalizeComparable(sourcePerson) === normalizedEntityLabel;
    const isSelectedTargetPerson = normalizeComparable(targetPerson) === normalizedEntityLabel;
    const isSelectedSourcePlace = normalizeComparable(sourcePlace) === normalizedEntityLabel;
    const isSelectedTargetPlace = normalizeComparable(targetPlace) === normalizedEntityLabel;

    if (entityType === 'person') {
      if (isSelectedSourcePerson) {
        countMapIncrement(peopleWhenSource, targetPerson);
        countMapIncrement(placesWhenSource, sourcePlace);
      }

      if (isSelectedTargetPerson) {
        countMapIncrement(peopleWhenTarget, sourcePerson);
        countMapIncrement(placesWhenTarget, targetPlace);
      }
    } else {
      if (isSelectedSourcePlace) {
        countMapIncrement(peopleWhenSource, sourcePerson);
        if (targetPlace && normalizeComparable(targetPlace) !== normalizedEntityLabel) countMapIncrement(placesWhenSource, targetPlace);
      }

      if (isSelectedTargetPlace) {
        countMapIncrement(peopleWhenTarget, targetPerson);
        if (sourcePlace && normalizeComparable(sourcePlace) !== normalizedEntityLabel) countMapIncrement(placesWhenTarget, sourcePlace);
      }
    }

    if (sourcePlace || targetPlace) {
      const routeLabel = `${sourcePlace || 'Unknown'} → ${targetPlace || 'Unknown'}`;

      if (entityType === 'person') {
        if (isSelectedSourcePerson) countMapIncrement(routesWhenSource, routeLabel);
        if (isSelectedTargetPerson) countMapIncrement(routesWhenTarget, routeLabel);
      } else {
        if (isSelectedSourcePlace) countMapIncrement(routesWhenSource, routeLabel);
        if (isSelectedTargetPlace) countMapIncrement(routesWhenTarget, routeLabel);
      }
    }
  });

  const relatedPeopleSections = entityType === 'person'
    ? makeRoleSections('When this person is source', peopleWhenSource, 'When this person is target', peopleWhenTarget)
    : makeRoleSections('When this place is source', peopleWhenSource, 'When this place is target', peopleWhenTarget);
  const relatedPlacesSections = entityType === 'person'
    ? makeRoleSections('Source-side places', placesWhenSource, 'Target-side places', placesWhenTarget)
    : makeRoleSections('Routes from this place', placesWhenSource, 'Routes to this place', placesWhenTarget);
  const routeSections = entityType === 'person'
    ? makeRoleSections('When this person is source', routesWhenSource, 'When this person is target', routesWhenTarget)
    : makeRoleSections('Routes from this place', routesWhenSource, 'Routes to this place', routesWhenTarget);

  return {
    entityType,
    entityLabel,
    matchingLetters,
    dateSpan: getDateSpan(matchingLetters),
    relatedPeopleSections,
    relatedPlacesSections,
    routeSections,
    relatedPeopleCount: sectionItemCount(relatedPeopleSections),
    relatedPlacesCount: sectionItemCount(relatedPlacesSections),
    routeCount: sectionItemCount(routeSections),
    dateCount: getUniqueDates(matchingLetters).length,
  };
}

function CountListCard({ title, description, items, emptyMessage, onOpenItem }) {
  if (!items?.length) {
    return (
      <div className="rounded-2xl border border-[var(--panel-card-border)]/70 bg-[var(--utility-panel-bg)] p-4 text-sm text-[var(--panel-card-muted-text)] shadow-[0_8px_24px_var(--peridot-color-rgba-rgba-87-58-46-0-06)]">
        <div className="font-semibold uppercase tracking-[0.16em] text-[var(--panel-card-muted-text)]">{title}</div>
        <div className="mt-2">{emptyMessage}</div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[var(--panel-card-border)]/70 bg-[var(--utility-panel-bg)] p-4 shadow-[0_8px_24px_var(--peridot-color-rgba-rgba-87-58-46-0-06)]">
      <div className="font-semibold uppercase tracking-[0.16em] text-[var(--panel-card-muted-text)]">{title}</div>
      {description ? <div className="mt-1 text-xs text-[var(--panel-card-muted-text)]">{description}</div> : null}
      <div className="mt-3 space-y-2">
        {items.map((item) => {
          const content = (
            <div
              className={`flex items-start justify-between gap-3 rounded-xl border px-3 py-2 text-sm transition-colors ${
                onOpenItem
                  ? 'border-[var(--inspector-clickable-border)] bg-[var(--inspector-clickable-bg)] text-[var(--inspector-clickable-text)] group-hover:border-[var(--inspector-clickable-hover-border)] group-hover:bg-[var(--inspector-clickable-hover-bg)] group-hover:text-[var(--inspector-clickable-hover-text)]'
                  : 'border-[var(--section-border)]/70 bg-[var(--section-bg)]/70 text-[var(--panel-card-text)]'
              }`}
            >
              <span className="break-words text-inherit">{item.label}</span>
              <span className="shrink-0 rounded-full bg-[var(--inspector-clickable-badge-bg)] px-2 py-0.5 text-[11px] text-[var(--inspector-clickable-badge-text)]">
                {item.count}
              </span>
            </div>
          );

          return onOpenItem ? (
            <button
              type="button"
              key={item.label}
              onClick={() => onOpenItem(item.label)}
              className="group block w-full text-left transition focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/35"
            >
              {content}
            </button>
          ) : (
            <div key={item.label}>{content}</div>
          );
        })}
      </div>
    </div>
  );
}

function CountSectionCard({ title, description, sections, emptyMessage, onOpenItem }) {
  const populatedSections = (sections || []).filter((section) => section.items?.length);

  if (!populatedSections.length) {
    return (
      <div className="rounded-2xl border border-[var(--panel-card-border)]/70 bg-[var(--utility-panel-bg)] p-4 text-sm text-[var(--panel-card-muted-text)] shadow-[0_8px_24px_var(--peridot-color-rgba-rgba-87-58-46-0-06)]">
        <div className="font-semibold uppercase tracking-[0.16em] text-[var(--panel-card-muted-text)]">{title}</div>
        <div className="mt-2">{emptyMessage}</div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[var(--panel-card-border)]/70 bg-[var(--utility-panel-bg)] p-4 shadow-[0_8px_24px_var(--peridot-color-rgba-rgba-87-58-46-0-06)]">
      <div className="font-semibold uppercase tracking-[0.16em] text-[var(--panel-card-muted-text)]">{title}</div>
      {description ? <div className="mt-1 text-xs text-[var(--panel-card-muted-text)]">{description}</div> : null}
      <div className="mt-3 space-y-4">
        {populatedSections.map((section) => (
          <div key={section.title}>
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--detail-label-text)]">
              {section.title}
            </div>
            <div className="space-y-2">
              {section.items.map((item) => {
                const content = (
                  <div
                    className={`flex items-start justify-between gap-3 rounded-xl border px-3 py-2 text-sm transition-colors ${
                      onOpenItem
                        ? 'border-[var(--inspector-clickable-border)] bg-[var(--inspector-clickable-bg)] text-[var(--inspector-clickable-text)] group-hover:border-[var(--inspector-clickable-hover-border)] group-hover:bg-[var(--inspector-clickable-hover-bg)] group-hover:text-[var(--inspector-clickable-hover-text)]'
                        : 'border-[var(--section-border)]/70 bg-[var(--section-bg)]/70 text-[var(--panel-card-text)]'
                    }`}
                  >
                    <span className="break-words text-inherit">{item.label}</span>
                    <span className="shrink-0 rounded-full bg-[var(--inspector-clickable-badge-bg)] px-2 py-0.5 text-[11px] text-[var(--inspector-clickable-badge-text)]">
                      {item.count}
                    </span>
                  </div>
                );

                return onOpenItem ? (
                  <button
                    type="button"
                    key={`${section.title}:${item.label}`}
                    onClick={() => onOpenItem(item.label)}
                    className="group block w-full text-left transition focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/35"
                  >
                    {content}
                  </button>
                ) : (
                  <div key={`${section.title}:${item.label}`}>{content}</div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EntityProfileSummaryCard({ selectedProps, selectedLetterMetadata, viewMode }) {
  const profile = buildEntityProfile(selectedProps, selectedLetterMetadata, viewMode);

  return (
    <div className="rounded-2xl border border-[var(--panel-card-border)]/70 bg-[var(--utility-panel-bg)] p-4 shadow-[0_8px_24px_var(--peridot-color-rgba-rgba-87-58-46-0-06)]">
      <div className="font-semibold uppercase tracking-[0.16em] text-[var(--panel-card-muted-text)]">
        {profile.entityType === 'person' ? 'Person profile summary' : 'Place profile summary'}
      </div>
      <div className="mt-3 divide-y divide-[var(--section-border)]/80 rounded-xl border border-[var(--section-border)]/80 bg-[var(--section-bg)]/75 px-3">
        <DetailRow label="Linked letters" value={profile.matchingLetters.length || selectedProps?.linkedLetterCount} />
        <DetailRow label="Date span" value={profile.dateSpan || [selectedProps?.earliestDate, selectedProps?.latestDate].filter(Boolean).join(' → ')} />
        <DetailRow label="Distinct dates" value={profile.dateCount} />
        <DetailRow label="Related people" value={profile.relatedPeopleCount} />
        <DetailRow label="Related places" value={profile.relatedPlacesCount} />
        <DetailRow label="Directed routes" value={profile.routeCount} />
      </div>
    </div>
  );
}

function EntityCustomFieldsCard({ selectedProps, selectedLetterMetadata, viewMode }) {
  const fields = buildEntityCustomFieldSummaries(selectedProps, selectedLetterMetadata, viewMode);
  if (!fields.length) return null;

  const entityType = getSelectedEntityType(selectedProps, viewMode);
  const entityLabel = getSelectedEntityLabel(selectedProps);
  const title = entityType === 'person' ? 'User-selected fields for this person' : 'User-selected fields for this place';
  const note = entityType === 'person'
    ? 'Aggregated from linked records where this exact person name appears as source or target.'
    : 'Aggregated from linked records where this exact place name appears as source or target location.';

  return (
    <div className="rounded-2xl border border-[var(--panel-card-border)]/70 bg-[var(--utility-panel-bg)] p-4 shadow-[0_8px_24px_var(--peridot-color-rgba-rgba-87-58-46-0-06)]">
      <div className="font-semibold uppercase tracking-[0.16em] text-[var(--panel-card-muted-text)]">
        {title}
      </div>
      <div className="mt-1 text-xs text-[var(--panel-card-muted-text)]">
        {note} {entityLabel ? `Current exact-match key: ${entityLabel}.` : ''}
      </div>
      <div className="mt-3 divide-y divide-[var(--section-border)]/80 rounded-xl border border-[var(--section-border)]/80 bg-[var(--section-bg)]/75 px-3">
        {fields.map((field) => (
          <div key={field.label} className="py-3 first:pt-3 last:pb-3">
            <div className={detailLabelClassName()}>{field.label}</div>
            <div className="mt-1 space-y-1 text-sm text-[var(--text-main)]">
              {field.values.map((item) => (
                <div key={`${field.label}:${item.value}`} className="flex items-start justify-between gap-3">
                  <span className="break-words">{item.value}</span>
                  {item.count > 1 ? (
                    <span className="shrink-0 rounded-full bg-[var(--stat-card-bg)] px-2 py-0.5 text-[11px] text-[var(--panel-card-muted-text)]">
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
    </div>
  );
}


function CompactSummaryTile({ count, label, actionLabel, onOpenFullInspector }) {
  return (
    <button
      type="button"
      onClick={onOpenFullInspector}
      className="group rounded-xl border border-[var(--inspector-clickable-border)] bg-[var(--inspector-clickable-bg)] px-3 py-2 text-left text-xs text-[var(--inspector-clickable-text)] transition hover:border-[var(--inspector-clickable-hover-border)] hover:bg-[var(--inspector-clickable-hover-bg)] hover:text-[var(--inspector-clickable-hover-text)] focus:outline-none focus:ring-2 focus:ring-[var(--button-primary-bg)]/70"
    >
      <div className="font-semibold text-[var(--inspector-clickable-text)] group-hover:text-[var(--inspector-clickable-hover-text)]">
        {count || 0}
      </div>
      <div className="text-[var(--inspector-clickable-muted-text)] group-hover:text-[var(--inspector-clickable-hover-text)]">
        {label}
      </div>
      <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--inspector-clickable-muted-text)] opacity-85 group-hover:text-[var(--inspector-clickable-hover-text)]">
        {actionLabel}
      </div>
    </button>
  );
}

function CompactDossierPrompt({
  entityType,
  linkedLetterCount,
  relatedPeopleCount,
  relatedPlacesCount,
  routeCount,
  onOpenFullInspector,
}) {
  const entityLabel = entityType === 'place' ? 'place' : 'person';

  return (
    <div className="rounded-2xl border border-[var(--section-border)] bg-[var(--section-bg)] p-4 text-sm text-[var(--text-main)] shadow-sm">
      <div className="font-semibold uppercase tracking-[0.14em] text-[var(--detail-label-text)]">
        At-a-glance summary
      </div>
      <p className="mt-2 leading-relaxed text-[var(--text-muted)]">
        This compact Inspector shows the key profile facts for the selected {entityLabel}. Use these buttons to open the full
        Inspector dossier for linked letters, related people, related places, and routes.
      </p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <CompactSummaryTile
          count={linkedLetterCount}
          label="linked letters"
          actionLabel="View evidence"
          onOpenFullInspector={onOpenFullInspector}
        />
        <CompactSummaryTile
          count={relatedPeopleCount}
          label="related people"
          actionLabel="View people"
          onOpenFullInspector={onOpenFullInspector}
        />
        <CompactSummaryTile
          count={relatedPlacesCount}
          label="related places"
          actionLabel="View places"
          onOpenFullInspector={onOpenFullInspector}
        />
        <CompactSummaryTile
          count={routeCount}
          label="routes"
          actionLabel="View routes"
          onOpenFullInspector={onOpenFullInspector}
        />
      </div>
    </div>
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
}) {
  const entityType = getSelectedEntityType(selectedProps, viewMode);
  const profile = buildEntityProfile(selectedProps, selectedLetterMetadata, viewMode);

  if (isCompact) {
    return (
      <div className="space-y-4">
        <InspectorSummaryCardComponent>
          <DetailRow label={entityType === 'place' ? 'Place' : 'Person'} value={getSelectedEntityLabel(selectedProps)} />
          <DetailRow label="Linked letters" value={selectedProps.linkedLetterCount || profile.matchingLetters.length} />
          <DetailRow label="Date span" value={[selectedProps.earliestDate, selectedProps.latestDate].filter(Boolean).join(' → ') || profile.dateSpan} />
          {selectedProps.anchorLabel ? <DetailRow label="Anchor location" value={selectedProps.anchorLabel} /> : null}
          <DetailRow label="Weighted degree" value={selectedProps.degree} />
        </InspectorSummaryCardComponent>

        <CompactDossierPrompt
          entityType={entityType}
          linkedLetterCount={selectedProps.linkedLetterCount || profile.matchingLetters.length}
          relatedPeopleCount={profile.relatedPeopleCount}
          relatedPlacesCount={profile.relatedPlacesCount}
          routeCount={profile.routeCount}
          onOpenFullInspector={onExpandInspector}
        />

        <InspectorClearSelectionButtonComponent onClear={clearSelection} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <InspectorSummaryCardComponent>
        <DetailRow label={entityType === 'place' ? 'Place' : 'Person'} value={getSelectedEntityLabel(selectedProps)} />
        <DetailRow label="Latitude" value={selectedProps.lat} />
        <DetailRow label="Longitude" value={selectedProps.lon} />
        <DetailRow label="Weighted degree" value={selectedProps.degree} />
        <DetailRow label="Incident edges" value={selectedProps.incidentEdgeCount} />
        <DetailRow label="Linked letters" value={selectedProps.linkedLetterCount || profile.matchingLetters.length} />
        <DetailRow label="Date span" value={[selectedProps.earliestDate, selectedProps.latestDate].filter(Boolean).join(' → ') || profile.dateSpan} />
        {selectedProps.anchorLabel ? <DetailRow label="Anchor location" value={selectedProps.anchorLabel} /> : null}
      </InspectorSummaryCardComponent>

      <EntityProfileSummaryCard
        selectedProps={selectedProps}
        selectedLetterMetadata={selectedLetterMetadata}
        viewMode={viewMode}
      />

      <CountSectionCard
        title="Related people"
        description="Exact names appearing in linked records, grouped by whether this profile appears on the source or target side."
        sections={profile.relatedPeopleSections}
        emptyMessage="No related people were found in linked records for this profile."
        onOpenItem={onOpenPersonDetail}
      />

      <CountSectionCard
        title="Related places"
        description="Exact place labels appearing in linked records, grouped by source-side and target-side role."
        sections={profile.relatedPlacesSections}
        emptyMessage="No related places were found in linked records for this profile."
        onOpenItem={onOpenPlaceDetail}
      />

      <CountSectionCard
        title="Directed routes represented"
        description="Source → target place pairs from linked records, grouped by this profile’s source-side or target-side role."
        sections={profile.routeSections}
        emptyMessage="No directed route pairs were found in linked records for this profile."
        onOpenItem={onOpenRouteDetail}
      />

      <EntityCustomFieldsCard
        selectedProps={selectedProps}
        selectedLetterMetadata={selectedLetterMetadata}
        viewMode={viewMode}
      />

      <InspectorClearSelectionButtonComponent onClear={clearSelection} />

      <LinkedLettersPanelComponent
        linkedLettersToShow={linkedLettersToShow}
        selectedLetterMetadata={selectedLetterMetadata}
        showAllLinkedLetters={showAllLinkedLetters}
        setShowAllLinkedLetters={setShowAllLinkedLetters}
        isLetterSectionExpanded={isLetterSectionExpanded}
        toggleLetterSection={toggleLetterSection}
        onOpenLetterDetail={onOpenLetterDetail}
      />
    </div>
  );
}
