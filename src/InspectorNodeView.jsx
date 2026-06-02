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

function buildEntityProfile(selectedProps, selectedLetterMetadata = [], viewMode) {
  const entityType = getSelectedEntityType(selectedProps, viewMode);
  const entityLabel = getSelectedEntityLabel(selectedProps);
  const matchingLetters = selectedLetterMetadata.filter((letter) => letterMatchesSelectedEntity(letter, selectedProps, viewMode));
  const relatedPeople = new Map();
  const relatedPlaces = new Map();
  const routes = new Map();

  matchingLetters.forEach((letter) => {
    const sourcePerson = normalizeEntityText(letter.source || letter.sourcePerson);
    const targetPerson = normalizeEntityText(letter.target || letter.targetPerson);
    const sourcePlace = normalizeEntityText(letter.sourceLoc);
    const targetPlace = normalizeEntityText(letter.targetLoc);

    if (entityType === 'person') {
      if (sourcePerson && normalizeComparable(sourcePerson) !== normalizeComparable(entityLabel)) countMapIncrement(relatedPeople, sourcePerson);
      if (targetPerson && normalizeComparable(targetPerson) !== normalizeComparable(entityLabel)) countMapIncrement(relatedPeople, targetPerson);
      countMapIncrement(relatedPlaces, sourcePlace);
      countMapIncrement(relatedPlaces, targetPlace);
    } else {
      countMapIncrement(relatedPeople, sourcePerson);
      countMapIncrement(relatedPeople, targetPerson);
      if (sourcePlace && normalizeComparable(sourcePlace) !== normalizeComparable(entityLabel)) countMapIncrement(relatedPlaces, sourcePlace);
      if (targetPlace && normalizeComparable(targetPlace) !== normalizeComparable(entityLabel)) countMapIncrement(relatedPlaces, targetPlace);
    }

    if (sourcePlace || targetPlace) {
      const routeLabel = `${sourcePlace || 'Unknown'} → ${targetPlace || 'Unknown'}`;
      countMapIncrement(routes, routeLabel);
    }
  });

  return {
    entityType,
    entityLabel,
    matchingLetters,
    dateSpan: getDateSpan(matchingLetters),
    relatedPeople: sortCountMap(relatedPeople).slice(0, 12),
    relatedPlaces: sortCountMap(relatedPlaces).slice(0, 12),
    routes: sortCountMap(routes).slice(0, 12),
    dateCount: getUniqueDates(matchingLetters).length,
  };
}

function CountListCard({ title, description, items, emptyMessage, onOpenItem }) {
  if (!items?.length) {
    return (
      <div className="rounded-2xl border border-[var(--panel-card-border)]/70 bg-[var(--utility-panel-bg)] p-4 text-sm text-[var(--panel-card-muted-text)] shadow-[0_8px_24px_rgba(87,58,46,0.06)]">
        <div className="font-semibold uppercase tracking-[0.16em] text-[var(--panel-card-muted-text)]">{title}</div>
        <div className="mt-2">{emptyMessage}</div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[var(--panel-card-border)]/70 bg-[var(--utility-panel-bg)] p-4 shadow-[0_8px_24px_rgba(87,58,46,0.06)]">
      <div className="font-semibold uppercase tracking-[0.16em] text-[var(--panel-card-muted-text)]">{title}</div>
      {description ? <div className="mt-1 text-xs text-[var(--panel-card-muted-text)]">{description}</div> : null}
      <div className="mt-3 space-y-2">
        {items.map((item) => {
          const content = (
            <div className="flex items-start justify-between gap-3 rounded-xl border border-[var(--section-border)]/70 bg-[var(--section-bg)]/70 px-3 py-2 text-sm">
              <span className="break-words text-[var(--panel-card-text)]">{item.label}</span>
              <span className="shrink-0 rounded-full bg-[var(--stat-card-bg)] px-2 py-0.5 text-[11px] text-[var(--panel-card-muted-text)]">
                {item.count}
              </span>
            </div>
          );

          return onOpenItem ? (
            <button
              type="button"
              key={item.label}
              onClick={() => onOpenItem(item.label)}
              className="block w-full text-left transition hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/35"
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

function EntityProfileSummaryCard({ selectedProps, selectedLetterMetadata, viewMode }) {
  const profile = buildEntityProfile(selectedProps, selectedLetterMetadata, viewMode);

  return (
    <div className="rounded-2xl border border-[var(--panel-card-border)]/70 bg-[var(--utility-panel-bg)] p-4 shadow-[0_8px_24px_rgba(87,58,46,0.06)]">
      <div className="font-semibold uppercase tracking-[0.16em] text-[var(--panel-card-muted-text)]">
        {profile.entityType === 'person' ? 'Person profile summary' : 'Place profile summary'}
      </div>
      <div className="mt-3 divide-y divide-[var(--section-border)]/80 rounded-xl border border-[var(--section-border)]/80 bg-[var(--section-bg)]/75 px-3">
        <DetailRow label="Linked letters" value={profile.matchingLetters.length || selectedProps?.linkedLetterCount} />
        <DetailRow label="Date span" value={profile.dateSpan || [selectedProps?.earliestDate, selectedProps?.latestDate].filter(Boolean).join(' → ')} />
        <DetailRow label="Distinct dates" value={profile.dateCount} />
        <DetailRow label="Related people" value={profile.relatedPeople.length} />
        <DetailRow label="Related places" value={profile.relatedPlaces.length} />
        <DetailRow label="Routes represented" value={profile.routes.length} />
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
    <div className="rounded-2xl border border-[var(--panel-card-border)]/70 bg-[var(--utility-panel-bg)] p-4 shadow-[0_8px_24px_rgba(87,58,46,0.06)]">
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
}) {
  const entityType = getSelectedEntityType(selectedProps, viewMode);
  const profile = buildEntityProfile(selectedProps, selectedLetterMetadata, viewMode);

  return (
    <div className="space-y-4">
      <InspectorSummaryCardComponent>
        <DetailRow label={entityType === 'place' ? 'Place' : 'Person'} value={getSelectedEntityLabel(selectedProps)} />
        <DetailRow label="Latitude" value={selectedProps.lat} />
        <DetailRow label="Longitude" value={selectedProps.lon} />
        <DetailRow label="Weighted degree" value={selectedProps.degree} />
        <DetailRow label="Incident edges" value={selectedProps.incidentEdgeCount} />
        <DetailRow label="Linked letters" value={selectedProps.linkedLetterCount || profile.matchingLetters.length} />
        <DetailRow label={entityType === 'place' ? 'Connected entities' : 'Correspondents'} value={(selectedProps.counterpartLabels || []).join('; ')} />
        <DetailRow label="Date span" value={[selectedProps.earliestDate, selectedProps.latestDate].filter(Boolean).join(' → ') || profile.dateSpan} />
        {selectedProps.anchorLabel ? <DetailRow label="Anchor location" value={selectedProps.anchorLabel} /> : null}
        {entityType === 'person' && selectedProps.personMetadata ? (
          <PersonMetadataCardComponent selectedProps={selectedProps} />
        ) : entityType === 'person' ? (
          <MissingPersonMetadataCardComponent />
        ) : null}
      </InspectorSummaryCardComponent>

      <EntityProfileSummaryCard
        selectedProps={selectedProps}
        selectedLetterMetadata={selectedLetterMetadata}
        viewMode={viewMode}
      />

      <CountListCard
        title="Related people"
        description="Exact names appearing in linked records with this profile."
        items={profile.relatedPeople}
        emptyMessage="No related people were found in linked records for this profile."
        onOpenItem={onOpenPersonDetail}
      />

      <CountListCard
        title="Related places"
        description="Exact place labels appearing in linked records with this profile."
        items={profile.relatedPlaces}
        emptyMessage="No related places were found in linked records for this profile."
        onOpenItem={onOpenPlaceDetail}
      />

      <CountListCard
        title="Routes represented"
        description="Source and target place pairs represented by linked records."
        items={profile.routes}
        emptyMessage="No route pairs were found in linked records for this profile."
      />

      <EntityCustomFieldsCard
        selectedProps={selectedProps}
        selectedLetterMetadata={selectedLetterMetadata}
        viewMode={viewMode}
      />

      {entityType === 'person' ? (
        <InspectorConnectedCorrespondentsComponent
          names={selectedProps.counterpartLabels || []}
          onOpenPerson={onOpenPersonDetail}
        />
      ) : null}

      {entityType === 'person' ? (
        <InspectorPersonPlacesComponent
          sentPlaces={selectedProps.sentPlaceLabels || []}
          receivedPlaces={selectedProps.receivedPlaceLabels || []}
          onOpenPlace={onOpenPlaceDetail}
        />
      ) : null}

      <InspectorClearSelectionButtonComponent onClear={clearSelection} />

      <LinkedLettersPanelComponent
        linkedLettersToShow={linkedLettersToShow}
        selectedLetterMetadata={selectedLetterMetadata}
        showAllLinkedLetters={showAllLinkedLetters}
        setShowAllLinkedLetters={setShowAllLinkedLetters}
        isLetterSectionExpanded={isLetterSectionExpanded}
        toggleLetterSection={toggleLetterSection}
      />
    </div>
  );
}
