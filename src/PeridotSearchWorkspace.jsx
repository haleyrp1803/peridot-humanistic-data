/*
 * Search & Filter workspace.
 *
 * This component renders the global active-dataset filtering surface. It separates draft filter input from applied filter state so expensive graph/data recomputation only happens when the user chooses Apply Filters.
 *
 * Important relationships:
 * - `App.jsx` owns draft/applied filter state and recomputation status.
 * - Visualizations, Timeline, Analytics, Inspector, and Export should consume the active filtered dataset defined here.
 *
 * Maintenance cautions:
 * - Do not make text inputs recompute data on every keystroke.
 * - Predictive suggestions should fill draft fields only; Apply Filters should commit global state.
 *
 * Scope contract:
 * - Text/entity inputs here update draft state only. They must not recompute
 * graph data while the user is typing.
 * - Apply commits Search & Filter fields and resets playback so the next
 * visual/export scope starts at the beginning of the newly filtered row set.
 * - Clear resets Search & Filter fields and timeline boundaries together,
 * because the global visible dataset is the intersection of timeline window
 * and committed Search & Filter criteria.
 *
 * Phase 1 Advanced Search rework:
 * - This workspace now also renders a result-card list for the current applied
 * active rows and hands individual records to the full Inspector workspace.
 * - The result cards are intentionally downstream of Apply Filters. They do
 * not create a new live-filtering path while the user is typing.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { buildPeridotSearchResults } from './peridotSearchResultHelpers.js';

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
      <label htmlFor={id} className="block text-xs font-bold uppercase tracking-[0.12em] text-[#dfe9c8]/72">
        {label}
      </label>
      <input
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={onKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => { window.setTimeout(() => setIsFocused(false), 120); }}
        placeholder={placeholder}
        autoComplete="off"
        className="peridot-form-input mt-2 text-sm"
      />
      {showSuggestions ? (
        <div className="absolute left-0 right-0 top-full z-40 mt-2 max-h-56 overflow-y-auto rounded-2xl border border-[#dfe9c8]/35 bg-[#082719] shadow-[0_18px_36px_rgba(0,0,0,0.34)]">
          <div className="border-b border-[#dfe9c8]/20 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#dfe9c8]/72">Suggestions</div>
          {matchingSuggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => chooseSuggestion(suggestion)}
              className="block w-full px-3 py-2 text-left text-sm leading-5 text-[#fbf7ea] transition-colors hover:bg-[#b58b42] hover:text-[#fff8e8]"
            >
              {suggestion}
            </button>
          ))}
        </div>
      ) : null}
      {helperText ? <p className="mt-2 text-xs leading-5 text-[#f7f2df]/68">{helperText}</p> : null}
    </div>
  );
}

function AppliedScopeCard({ label, value }) {
  return (
    <div className="rounded-[20px] border border-[#dfe9c8]/25 bg-[#dfe9c8]/10 px-4 py-3 shadow-[0_10px_24px_rgba(0,0,0,0.18)]">
      <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#dfe9c8]/68">{label}</div>
      <div className="mt-1 text-sm font-semibold text-[#fbf7ea]">{value}</div>
    </div>
  );
}

function CriteriaCard({ title, children }) {
  return (
    <div className="rounded-[24px] border border-[#dfe9c8]/26 bg-[#dfe9c8]/10 p-4">
      <h3 className="text-base font-bold text-[#fbf7ea]">{title}</h3>
      {children}
    </div>
  );
}

function SearchResultCard({ result, onInspectSearchResult }) {
  return (
    <article className="rounded-[22px] border border-[#dfe9c8]/24 bg-[#071f16]/55 p-4 shadow-[0_12px_26px_rgba(0,0,0,0.18)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#dfe9c8]/64">Search result</p>
          <h3 className="mt-1 text-base font-bold leading-6 text-[#fbf7ea]">{result.title}</h3>
          <p className="mt-1 text-xs font-semibold text-[#f7f2df]/70">{result.displayDate}</p>
        </div>
        <button
          type="button"
          onClick={() => onInspectSearchResult?.(result)}
          className="rounded-full border border-[#dfe9c8]/45 bg-[#dfe9c8]/12 px-3 py-1.5 text-xs font-bold text-[#fbf7ea] transition-colors hover:bg-[#b58b42] hover:text-[#fff8e8]"
        >
          Inspect
        </button>
      </div>

      <dl className="mt-3 grid gap-2 text-xs text-[#f7f2df]/72 sm:grid-cols-2">
        <div>
          <dt className="font-bold uppercase tracking-[0.12em] text-[#dfe9c8]/58">Entities</dt>
          <dd className="mt-1 leading-5">{result.peopleRoute}</dd>
        </div>
        <div>
          <dt className="font-bold uppercase tracking-[0.12em] text-[#dfe9c8]/58">Places</dt>
          <dd className="mt-1 leading-5">{result.placeRoute}</dd>
        </div>
      </dl>

      {result.matchedFields.length ? (
        <div className="mt-3 rounded-2xl border border-[#dfe9c8]/16 bg-[#dfe9c8]/8 p-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#dfe9c8]/64">Why this matched</p>
          <ul className="mt-2 space-y-1 text-xs leading-5 text-[#f7f2df]/76">
            {result.matchedFields.map((match) => (
              <li key={`${match.label}:${match.value}`}>
                <span className="font-semibold text-[#fbf7ea]">{match.label}:</span> {match.value}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="mt-3 text-xs leading-5 text-[#f7f2df]/60">
          This row is in the current applied dataset. It may match through date, weight, or another active scope condition.
        </p>
      )}

      {result.capabilityBadges.length ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {result.capabilityBadges.map((badge) => (
            <span key={badge} className="rounded-full border border-[#dfe9c8]/24 bg-[#dfe9c8]/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#dfe9c8]/76">
              {badge}
            </span>
          ))}
        </div>
      ) : null}
    </article>
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
  searchRows = [],
  onInspectSearchResult,
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
    const timeoutId = window.setTimeout(() => { setFilterStatusMessage(''); }, 2200);
    return () => window.clearTimeout(timeoutId);
  }, [filterStatusMessage]);

  const timelineYearSuggestions = useMemo(() => (
    Array.from(new Set(timelineMonths.map((month) => String(month || '').slice(0, 4)).filter(Boolean)))
      .sort((a, b) => Number(a) - Number(b))
  ), [timelineMonths]);

  const searchResultCards = useMemo(() => buildPeridotSearchResults(
    searchRows,
    { search, personFilter, placeFilter, routePlaceFilter, routePeopleFilter },
    { limit: 50 },
  ), [searchRows, search, personFilter, placeFilter, routePlaceFilter, routePeopleFilter]);

  const hiddenSearchResultCount = Math.max(0, (searchRows?.length || 0) - searchResultCards.length);

  const resolveTimelineBoundaryIndexFromYear = (boundary, year) => {
    if (!timelineMonths.length || !year) return -1;
    if (boundary === 'start') return timelineMonths.findIndex((month) => String(month).slice(0, 4) === String(year));
    for (let index = timelineMonths.length - 1; index >= 0; index -= 1) {
      if (String(timelineMonths[index]).slice(0, 4) === String(year)) return index;
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
    <section className="peridot-workspace-field text-[#fbf7ea]">
      <div className="peridot-workspace-frame-wide">
        <div className="peridot-hero-card pl-[76px] sm:pl-[84px]">
          <div className="peridot-workspace-header-row">
            <div>
              <p className="peridot-kicker">Search workspace</p>
              <h1 className="peridot-title-medium">Advanced Search &amp; Filter</h1>
              <p className="peridot-lede">
                Define the active dataset used by maps, networks, charts, timeline playback, export, and inspection. Draft changes apply only when you choose Apply Filters.
              </p>
            </div>
            <button type="button" onClick={onOpenVisualizations} className="peridot-button-primary shrink-0">Open visualizations</button>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.55fr)]">
          <aside className="peridot-surface-card peridot-card-inner">
            <h2 className="text-xl font-bold text-[#fbf7ea]">Current applied scope</h2>
            <p className="mt-2 text-sm leading-6 text-[#f7f2df]/76">
              These filters currently define the active dataset used by maps, networks, charts, timeline playback, export, and inspection.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <AppliedScopeCard label="Keyword" value={search?.trim() || 'None'} />
              <AppliedScopeCard label="Person" value={personFilter?.trim() || 'None'} />
              <AppliedScopeCard label="Place" value={placeFilter?.trim() || 'None'} />
              <AppliedScopeCard label="Route place" value={routePlaceFilter?.trim() || 'None'} />
              <AppliedScopeCard label="Route entities" value={routePeopleFilter?.trim() || 'None'} />
              <AppliedScopeCard label="Minimum weight" value={currentMinCountLabel} />
              <AppliedScopeCard label="Date window" value={currentRangeLabel} />
              <AppliedScopeCard label="Rows" value={rowDiagnostics?.filteredRows ?? 'Unknown'} />
              <AppliedScopeCard label="Nodes" value={graph?.nodes?.length ?? 0} />
              <AppliedScopeCard label="Routes" value={graph?.edges?.length ?? 0} />
            </div>
          </aside>

          <section className="space-y-6">
            <div className="peridot-surface-card peridot-card-inner">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-bold text-[#fbf7ea]">Advanced search criteria</h2>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-[#f7f2df]/76">Press Enter in any field to apply the current draft.</p>
                </div>
                {filterStatusMessage ? (
                  <div className="rounded-full border border-[#dfe9c8]/40 bg-[#dfe9c8]/16 px-4 py-2 text-sm font-semibold text-[#fbf7ea]">{filterStatusMessage}</div>
                ) : null}
              </div>

              <div className="mt-6 grid gap-5 xl:grid-cols-2">
                <CriteriaCard title="Text search">
                  <div className="mt-4">
                    <label htmlFor="workspace-keyword-search" className="block text-xs font-bold uppercase tracking-[0.12em] text-[#dfe9c8]/72">Keyword search</label>
                    <input
                      id="workspace-keyword-search"
                      value={draftSearch}
                      onChange={(event) => setDraftSearch(event.target.value)}
                      onKeyDown={handleDraftKeyDown}
                      placeholder={viewMode === 'geographic' ? 'e.g. Siena, Maria Magdalena, 1613' : 'e.g. Caterina, Cosimo, Siena'}
                      className="peridot-form-input mt-2 text-sm"
                    />
                  </div>
                </CriteriaCard>

                <CriteriaCard title="People and places">
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <AutocompleteTextInput id="workspace-person-filter" label="Person filter" value={draftPersonFilter} onChange={setDraftPersonFilter} onKeyDown={handleDraftKeyDown} placeholder="Type a person or entity" suggestions={personSuggestions} helperText="Matches source or target entity names." />
                    <AutocompleteTextInput id="workspace-place-filter" label="Place filter" value={draftPlaceFilter} onChange={setDraftPlaceFilter} onKeyDown={handleDraftKeyDown} placeholder="Type a place" suggestions={placeSuggestions} helperText="Matches source or target places." />
                  </div>
                </CriteriaCard>

                <CriteriaCard title="Routes">
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <AutocompleteTextInput id="workspace-route-place-filter" label="Route filter (place)" value={draftRoutePlaceFilter} onChange={setDraftRoutePlaceFilter} onKeyDown={handleDraftKeyDown} placeholder="e.g. Florence → Siena" suggestions={routePlaceSuggestions} helperText="Matches directed source-place to target-place routes." />
                    <AutocompleteTextInput id="workspace-route-people-filter" label="Route filter (entities)" value={draftRoutePeopleFilter} onChange={setDraftRoutePeopleFilter} onKeyDown={handleDraftKeyDown} placeholder="e.g. Source entity → Target entity" suggestions={routePeopleSuggestions} helperText="Matches directed source-entity to target-entity routes." />
                  </div>
                </CriteriaCard>

                <CriteriaCard title="Threshold and date">
                  <div className="mt-4 grid gap-4 sm:grid-cols-3">
                    <div>
                      <label htmlFor="workspace-min-count" className="block text-xs font-bold uppercase tracking-[0.12em] text-[#dfe9c8]/72">Minimum {viewMode === 'geographic' ? 'route weight' : 'connection weight'}</label>
                      <input id="workspace-min-count" type="number" min="1" value={draftMinCount} onChange={(event) => setDraftMinCount(event.target.value)} onKeyDown={handleDraftKeyDown} className="peridot-form-input mt-2 text-sm" />
                      <p className="mt-2 text-xs text-[#f7f2df]/68">Current applied minimum: {currentMinCountLabel}</p>
                    </div>
                    <AutocompleteTextInput id="workspace-start-year" label="Start year" value={draftStartYear} onChange={setDraftStartYear} onKeyDown={handleDraftKeyDown} placeholder="Start year" suggestions={timelineYearSuggestions} />
                    <AutocompleteTextInput id="workspace-end-year" label="End year" value={draftEndYear} onChange={setDraftEndYear} onKeyDown={handleDraftKeyDown} placeholder="End year" suggestions={timelineYearSuggestions} />
                  </div>
                  <p className="mt-4 text-xs leading-5 text-[#f7f2df]/68">
                    Available year range: {timelineMonths.length ? `${timelineMonths[0]} to ${timelineMonths[timelineMonths.length - 1]}` : 'none detected'}.
                  </p>
                </CriteriaCard>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-end gap-3 border-t border-[#dfe9c8]/22 pt-5">
                <button type="button" onClick={clearFilters} className="peridot-button-secondary">Clear Filters</button>
                <button type="button" onClick={applyDraftFilters} className="peridot-button-primary">Apply Filters</button>
              </div>
            </div>

            <div className="peridot-surface-card peridot-card-inner">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-bold text-[#fbf7ea]">Search results</h2>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-[#f7f2df]/76">
                    Result cards reflect the current applied dataset. Use Inspect to open the selected record in the full Inspector workspace.
                  </p>
                </div>
                <div className="rounded-full border border-[#dfe9c8]/35 bg-[#dfe9c8]/12 px-4 py-2 text-sm font-bold text-[#fbf7ea]">
                  {searchRows?.length || 0} records
                </div>
              </div>

              {searchResultCards.length ? (
                <div className="mt-5 grid gap-4">
                  {searchResultCards.map((result) => (
                    <SearchResultCard key={result.id} result={result} onInspectSearchResult={onInspectSearchResult} />
                  ))}
                  {hiddenSearchResultCount > 0 ? (
                    <p className="rounded-2xl border border-[#dfe9c8]/20 bg-[#dfe9c8]/8 px-4 py-3 text-sm leading-6 text-[#f7f2df]/72">
                      Showing the first {searchResultCards.length} records. {hiddenSearchResultCount} additional records are in the active result set.
                    </p>
                  ) : null}
                </div>
              ) : (
                <div className="mt-5 rounded-[22px] border border-[#dfe9c8]/24 bg-[#071f16]/55 p-5 text-sm leading-6 text-[#f7f2df]/72">
                  No records are currently in scope. Clear filters or broaden the date window to restore results.
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}
