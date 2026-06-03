import React, { useEffect, useMemo, useState } from 'react';

function AutocompleteTextInput({
  id,
  label,
  value,
  onChange,
  onKeyDown,
  placeholder,
  suggestions = [],
  helperText,
}) {
  const [isFocused, setIsFocused] = useState(false);
  const query = String(value ?? '').trim().toLowerCase();
  const matchingSuggestions = query.length >= 2
    ? suggestions
      .filter((suggestion) => String(suggestion ?? '').toLowerCase().includes(query))
      .slice(0, 20)
    : [];
  const showSuggestions = isFocused && matchingSuggestions.length > 0;

  const chooseSuggestion = (suggestion) => {
    onChange(suggestion);
    setIsFocused(false);
  };

  return (
    <div className="relative">
      <label htmlFor={id} className="block text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted-text)]">
        {label}
      </label>
      <input
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={onKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          window.setTimeout(() => setIsFocused(false), 120);
        }}
        placeholder={placeholder}
        autoComplete="off"
        className="mt-2 w-full rounded-xl border border-[var(--input-border)]/80 bg-[var(--input-bg)] px-3 py-2 text-sm text-[var(--input-text)] placeholder:text-[var(--input-placeholder)]"
      />
      {showSuggestions ? (
        <div className="absolute left-0 right-0 top-full z-40 mt-2 max-h-56 overflow-y-auto rounded-2xl border border-[var(--panel-card-border)] bg-[var(--panel-card-bg)] shadow-[0_18px_36px_rgba(0,0,0,0.28)]">
          <div className="border-b border-[var(--panel-card-border)]/70 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--muted-text)]">
            Suggestions
          </div>
          {matchingSuggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => chooseSuggestion(suggestion)}
              className="block w-full px-3 py-2 text-left text-sm leading-5 text-[var(--text-main)] transition-colors hover:bg-[var(--panel-card-hover)]"
            >
              {suggestion}
            </button>
          ))}
        </div>
      ) : null}
      {helperText ? (
        <p className="mt-2 text-xs leading-5 text-[var(--muted-text)]">{helperText}</p>
      ) : null}
    </div>
  );
}

function AppliedScopeCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-[var(--section-border)] bg-[var(--section-bg)] px-4 py-3 shadow-[0_10px_24px_rgba(0,0,0,0.18)]">
      <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--muted-text)]">{label}</div>
      <div className="mt-1 text-sm font-semibold text-[var(--heading-text)]">{value}</div>
    </div>
  );
}

export function PeridotSearchWorkspace({
  search,
  setSearch,
  personFilter,
  setPersonFilter,
  placeFilter,
  setPlaceFilter,
  routePlaceFilter,
  setRoutePlaceFilter,
  routePeopleFilter,
  setRoutePeopleFilter,
  personSuggestions = [],
  placeSuggestions = [],
  routePlaceSuggestions = [],
  routePeopleSuggestions = [],
  currentMinCountLabel,
  currentRangeLabel,
  graph,
  rowDiagnostics,
  viewMode,
  minCount,
  setMinCount,
  timelineMonths,
  rangeStart,
  setRangeStart,
  rangeEnd,
  setRangeEnd,
  setTimelineMode,
  setIsPlaying,
  setPlaybackIndex,
  onOpenVisualizations,
}) {
  const getAppliedStartYear = () => String(timelineMonths[rangeStart] || '').slice(0, 4);
  const getAppliedEndYear = () => String(timelineMonths[rangeEnd] || '').slice(0, 4);
  const getDefaultStartYear = () => String(timelineMonths[0] || '').slice(0, 4);
  const getDefaultEndYear = () => String(timelineMonths[Math.max(timelineMonths.length - 1, 0)] || '').slice(0, 4);

  const [draftSearch, setDraftSearch] = useState(search ?? '');
  const [draftPersonFilter, setDraftPersonFilter] = useState(personFilter ?? '');
  const [draftPlaceFilter, setDraftPlaceFilter] = useState(placeFilter ?? '');
  const [draftRoutePlaceFilter, setDraftRoutePlaceFilter] = useState(routePlaceFilter ?? '');
  const [draftRoutePeopleFilter, setDraftRoutePeopleFilter] = useState(routePeopleFilter ?? '');
  const [draftMinCount, setDraftMinCount] = useState(String(minCount ?? 1));
  const [draftStartYear, setDraftStartYear] = useState(getAppliedStartYear());
  const [draftEndYear, setDraftEndYear] = useState(getAppliedEndYear());
  const [filterStatusMessage, setFilterStatusMessage] = useState('');

  useEffect(() => {
    setDraftSearch(search ?? '');
    setDraftPersonFilter(personFilter ?? '');
    setDraftPlaceFilter(placeFilter ?? '');
    setDraftRoutePlaceFilter(routePlaceFilter ?? '');
    setDraftRoutePeopleFilter(routePeopleFilter ?? '');
    setDraftMinCount(String(minCount ?? 1));
    setDraftStartYear(getAppliedStartYear());
    setDraftEndYear(getAppliedEndYear());
  }, [
    search,
    personFilter,
    placeFilter,
    routePlaceFilter,
    routePeopleFilter,
    minCount,
    rangeStart,
    rangeEnd,
    timelineMonths.length,
    timelineMonths[rangeStart],
    timelineMonths[rangeEnd],
  ]);

  useEffect(() => {
    if (!filterStatusMessage) return undefined;
    const timeoutId = window.setTimeout(() => {
      setFilterStatusMessage('');
    }, 2200);
    return () => window.clearTimeout(timeoutId);
  }, [filterStatusMessage]);

  const timelineYearSuggestions = useMemo(() => (
    Array.from(new Set(timelineMonths.map((month) => String(month || '').slice(0, 4)).filter(Boolean)))
      .sort((a, b) => Number(a) - Number(b))
  ), [timelineMonths]);

  const resolveTimelineBoundaryIndexFromYear = (boundary, year) => {
    if (!timelineMonths.length || !year) return -1;
    if (boundary === 'start') {
      return timelineMonths.findIndex((month) => String(month).slice(0, 4) === String(year));
    }
    for (let index = timelineMonths.length - 1; index >= 0; index -= 1) {
      if (String(timelineMonths[index]).slice(0, 4) === String(year)) {
        return index;
      }
    }
    return -1;
  };

  const clearFilters = () => {
    const defaultEndIndex = Math.max(timelineMonths.length - 1, 0);
    setFilterStatusMessage('Filters cleared. Updating view…');
    window.requestAnimationFrame(() => {
      setDraftSearch('');
      setDraftPersonFilter('');
      setDraftPlaceFilter('');
      setDraftRoutePlaceFilter('');
      setDraftRoutePeopleFilter('');
      setDraftMinCount('1');
      setDraftStartYear(getDefaultStartYear());
      setDraftEndYear(getDefaultEndYear());
      setSearch('');
      setPersonFilter('');
      setPlaceFilter('');
      setRoutePlaceFilter('');
      setRoutePeopleFilter('');
      setMinCount(1);
      setTimelineMode('all');
      setRangeStart(0);
      setRangeEnd(defaultEndIndex);
      setIsPlaying(false);
      setPlaybackIndex(-1);
    });
  };

  const applyDraftFilters = () => {
    const parsedMinCount = Number.parseInt(String(draftMinCount).trim(), 10);
    const nextMinCount = Number.isFinite(parsedMinCount) ? Math.max(1, parsedMinCount) : minCount;
    const nextSearch = String(draftSearch ?? '').trim();
    const nextPersonFilter = String(draftPersonFilter ?? '').trim();
    const nextPlaceFilter = String(draftPlaceFilter ?? '').trim();
    const nextRoutePlaceFilter = String(draftRoutePlaceFilter ?? '').trim();
    const nextRoutePeopleFilter = String(draftRoutePeopleFilter ?? '').trim();
    const nextStartIndex = resolveTimelineBoundaryIndexFromYear('start', draftStartYear);
    const nextEndIndex = resolveTimelineBoundaryIndexFromYear('end', draftEndYear);

    setFilterStatusMessage('Updating view…');
    window.requestAnimationFrame(() => {
      setSearch(nextSearch);
      setPersonFilter(nextPersonFilter);
      setPlaceFilter(nextPlaceFilter);
      setRoutePlaceFilter(nextRoutePlaceFilter);
      setRoutePeopleFilter(nextRoutePeopleFilter);
      setMinCount(nextMinCount);
      setDraftMinCount(String(nextMinCount));
      if (nextStartIndex >= 0 && nextEndIndex >= 0) {
        const safeStart = Math.min(nextStartIndex, nextEndIndex);
        const safeEnd = Math.max(nextStartIndex, nextEndIndex);
        setTimelineMode('range');
        setRangeStart(safeStart);
        setRangeEnd(safeEnd);
      } else {
        setTimelineMode('all');
        setRangeStart(0);
        setRangeEnd(Math.max(timelineMonths.length - 1, 0));
      }
      setIsPlaying(false);
      setPlaybackIndex(-1);
    });
  };

  const handleDraftKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      applyDraftFilters();
    }
  };

  return (
    <section className="flex h-full min-h-0 flex-col bg-[var(--shell-bg)] text-[var(--text-main)]">
      <header className="shrink-0 border-b border-[var(--sidebar-border)] bg-[var(--title-input-bg)] px-[76px] py-4 text-[var(--title-input-text)] sm:px-[84px]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--title-input-text)]/70">Search workspace</p>
            <h1 className="mt-1 text-2xl font-bold leading-tight">Advanced Search & Filter</h1>
          </div>
          <button
            type="button"
            onClick={onOpenVisualizations}
            className="rounded-xl border border-[var(--button-primary-border)] bg-[var(--button-primary-bg)] px-4 py-2 text-sm font-semibold text-[var(--button-primary-text)] shadow-[0_8px_18px_rgba(0,0,0,0.22)] hover:bg-[var(--button-primary-hover)]"
          >
            Open visualizations
          </button>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6 sm:px-8 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.5fr)]">
          <aside className="space-y-4">
            <section className="rounded-[28px] border border-[var(--group-border)] bg-[linear-gradient(180deg,var(--group-bg-top),var(--group-bg-bottom))] p-5 shadow-[0_16px_36px_rgba(0,0,0,0.28)]">
              <h2 className="text-lg font-bold text-[var(--heading-text)]">Current applied scope</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--muted-text)]">
                These filters currently define the active dataset used by maps, networks, charts, timeline playback, export, and inspection.
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                <AppliedScopeCard label="Keyword" value={search?.trim() || 'None'} />
                <AppliedScopeCard label="Person" value={personFilter?.trim() || 'None'} />
                <AppliedScopeCard label="Place" value={placeFilter?.trim() || 'None'} />
                <AppliedScopeCard label="Route place" value={routePlaceFilter?.trim() || 'None'} />
                <AppliedScopeCard label="Route people" value={routePeopleFilter?.trim() || 'None'} />
                <AppliedScopeCard label="Minimum weight" value={currentMinCountLabel} />
                <AppliedScopeCard label="Date window" value={currentRangeLabel} />
                <AppliedScopeCard label="Rows" value={rowDiagnostics?.filteredRows ?? 'Unknown'} />
                <AppliedScopeCard label="Nodes" value={graph?.nodes?.length ?? 0} />
                <AppliedScopeCard label="Routes" value={graph?.edges?.length ?? 0} />
              </div>
            </section>
          </aside>

          <section className="rounded-[28px] border border-[var(--group-border)] bg-[linear-gradient(180deg,var(--group-bg-top),var(--group-bg-bottom))] p-5 shadow-[0_16px_36px_rgba(0,0,0,0.28)]">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-[var(--heading-text)]">Advanced search criteria</h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted-text)]">
                  Draft changes are applied only when you choose Apply Filters. Press Enter in any field to apply the current draft.
                </p>
              </div>
              {filterStatusMessage ? (
                <div className="rounded-2xl border border-[var(--accent)]/40 bg-[var(--accent)]/15 px-4 py-2 text-sm font-semibold text-[var(--heading-text)]">
                  {filterStatusMessage}
                </div>
              ) : null}
            </div>

            <div className="mt-6 grid gap-5 xl:grid-cols-2">
              <div className="rounded-2xl border border-[var(--section-border)] bg-[var(--section-bg)] p-4">
                <h3 className="text-base font-bold text-[var(--heading-text)]">Text search</h3>
                <div className="mt-4">
                  <label htmlFor="workspace-keyword-search" className="block text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted-text)]">
                    Keyword search
                  </label>
                  <input
                    id="workspace-keyword-search"
                    value={draftSearch}
                    onChange={(event) => setDraftSearch(event.target.value)}
                    onKeyDown={handleDraftKeyDown}
                    placeholder={viewMode === 'geographic' ? 'e.g. Siena, Maria Magdalena, 1613' : 'e.g. Caterina, Cosimo, Siena'}
                    className="mt-2 w-full rounded-xl border border-[var(--input-border)]/80 bg-[var(--input-bg)] px-3 py-2 text-sm text-[var(--input-text)] placeholder:text-[var(--input-placeholder)]"
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-[var(--section-border)] bg-[var(--section-bg)] p-4">
                <h3 className="text-base font-bold text-[var(--heading-text)]">People and places</h3>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <AutocompleteTextInput
                    id="workspace-person-filter"
                    label="Person filter"
                    value={draftPersonFilter}
                    onChange={setDraftPersonFilter}
                    onKeyDown={handleDraftKeyDown}
                    placeholder="Type a correspondent"
                    suggestions={personSuggestions}
                    helperText="Matches source or target names."
                  />
                  <AutocompleteTextInput
                    id="workspace-place-filter"
                    label="Place filter"
                    value={draftPlaceFilter}
                    onChange={setDraftPlaceFilter}
                    onKeyDown={handleDraftKeyDown}
                    placeholder="Type a place"
                    suggestions={placeSuggestions}
                    helperText="Matches source or target places."
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-[var(--section-border)] bg-[var(--section-bg)] p-4">
                <h3 className="text-base font-bold text-[var(--heading-text)]">Routes</h3>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <AutocompleteTextInput
                    id="workspace-route-place-filter"
                    label="Route filter (place)"
                    value={draftRoutePlaceFilter}
                    onChange={setDraftRoutePlaceFilter}
                    onKeyDown={handleDraftKeyDown}
                    placeholder="e.g. Florence → Siena"
                    suggestions={routePlaceSuggestions}
                    helperText="Matches directed source-place to target-place routes."
                  />
                  <AutocompleteTextInput
                    id="workspace-route-people-filter"
                    label="Route filter (people)"
                    value={draftRoutePeopleFilter}
                    onChange={setDraftRoutePeopleFilter}
                    onKeyDown={handleDraftKeyDown}
                    placeholder="e.g. Sender → Recipient"
                    suggestions={routePeopleSuggestions}
                    helperText="Matches directed source-person to target-person routes."
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-[var(--section-border)] bg-[var(--section-bg)] p-4">
                <h3 className="text-base font-bold text-[var(--heading-text)]">Threshold and date</h3>
                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  <div>
                    <label htmlFor="workspace-min-count" className="block text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted-text)]">
                      Minimum {viewMode === 'geographic' ? 'route weight' : 'connection weight'}
                    </label>
                    <input
                      id="workspace-min-count"
                      type="number"
                      min="1"
                      value={draftMinCount}
                      onChange={(event) => setDraftMinCount(event.target.value)}
                      onKeyDown={handleDraftKeyDown}
                      className="mt-2 w-full rounded-xl border border-[var(--input-border)]/80 bg-[var(--input-bg)] px-3 py-2 text-sm text-[var(--input-text)]"
                    />
                    <p className="mt-2 text-xs text-[var(--muted-text)]">Current applied minimum: {currentMinCountLabel}</p>
                  </div>
                  <AutocompleteTextInput
                    id="workspace-start-year"
                    label="Start year"
                    value={draftStartYear}
                    onChange={setDraftStartYear}
                    onKeyDown={handleDraftKeyDown}
                    placeholder="Start year"
                    suggestions={timelineYearSuggestions}
                  />
                  <AutocompleteTextInput
                    id="workspace-end-year"
                    label="End year"
                    value={draftEndYear}
                    onChange={setDraftEndYear}
                    onKeyDown={handleDraftKeyDown}
                    placeholder="End year"
                    suggestions={timelineYearSuggestions}
                  />
                </div>
                <p className="mt-4 text-xs leading-5 text-[var(--muted-text)]">
                  Available year range: {timelineMonths.length ? `${timelineMonths[0]} to ${timelineMonths[timelineMonths.length - 1]}` : 'none detected'}.
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-end gap-3 border-t border-[var(--section-border)] pt-5">
              <button
                type="button"
                onClick={clearFilters}
                className="rounded-xl border border-[var(--button-secondary-border)] bg-[var(--button-secondary-bg)] px-4 py-2 text-sm font-semibold text-[var(--button-secondary-text)] hover:bg-[var(--button-secondary-hover)]"
              >
                Clear Filters
              </button>
              <button
                type="button"
                onClick={applyDraftFilters}
                className="rounded-xl border border-[var(--button-primary-border)] bg-[var(--button-primary-bg)] px-5 py-2 text-sm font-bold text-[var(--button-primary-text)] shadow-[0_8px_18px_rgba(0,0,0,0.24)] hover:bg-[var(--button-primary-hover)]"
              >
                Apply Filters
              </button>
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}
