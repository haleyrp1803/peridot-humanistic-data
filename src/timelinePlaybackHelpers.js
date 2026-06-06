/*
 * Pure timeline and playback helpers.
 * 
 * This module builds available timeline boundaries, filters rows to a selected timeline window, sorts playback rows, and restricts visible rows to playback progress.
 * 
 * Important relationships:
 * - `App.jsx` uses these helpers to derive visible rows before map/network/chart rendering.
 * - `timelinePlaybackComponents.jsx` renders controls for the state derived here.
 * 
 * Maintenance cautions:
 * - Keep this file pure. UI events belong in components; date/window semantics belong here.
 *
 * Scope contract:
 * - `buildTimelineMonths` derives the selectable global timeline boundaries
 *   from the full normalized row set.
 * - `filterRowsByTimelineWindow` applies the global timeline range before
 *   Search & Filter text/entity narrowing.
 * - `buildPlaybackRows` determines playback order after global filters are
 *   already applied.
 * - `filterRowsForPlayback` is the final row narrowing step before graph
 *   derivation. It should never mutate rows or recompute graph state directly.
 */

export function buildTimelineMonths(rows) {
  return Array.from(
    new Set(
      rows
        .filter((row) => row.parsedDate?.isTimelineUsable && row.parsedDate?.monthKey)
        .map((row) => row.parsedDate.monthKey)
        .filter(Boolean)
    )
  ).sort();
}

// Apply the global timeline range to a candidate row set. The caller controls
// whether this receives all normalized rows or a narrower scope; in current
// App.jsx flow it receives `normalizedRows` before Search & Filter text/entity
// filters are applied.
export function filterRowsByTimelineWindow(rows, timelineMode, timelineMonths, rangeStart, rangeEnd) {
  if (timelineMode === 'all' || !timelineMonths.length) return rows;

  const startIndex = Math.min(rangeStart, rangeEnd);
  const endIndex = Math.max(rangeStart, rangeEnd);
  const startKey = timelineMonths[startIndex];
  const endKey = timelineMonths[endIndex];

  return rows.filter((row) => {
    if (!row.parsedDate?.isTimelineUsable || !row.parsedDate.monthKey) return false;
    return row.parsedDate.monthKey >= startKey && row.parsedDate.monthKey <= endKey;
  });
}

export function buildPlaybackRows(rowsInWindow) {
  return rowsInWindow
    .filter((row) => row.parsedDate?.isTimelineUsable)
    .slice()
    .sort((a, b) => {
      const aSort = a.parsedDate?.sortKey ?? Number.MAX_SAFE_INTEGER;
      const bSort = b.parsedDate?.sortKey ?? Number.MAX_SAFE_INTEGER;
      if (aSort !== bSort) return aSort - bSort;
      return a.date.localeCompare(b.date);
    });
}

// Restrict an already-filtered row set to the current playback prefix. This is
// the last row-scope narrowing step before map/network graph derivation and
// therefore indirectly controls header export scope for graph visualizations.
export function filterRowsForPlayback(baseRows, playbackRows, playbackIndex) {
  if (!playbackRows.length || playbackIndex < 0) return baseRows;
  const visibleIds = new Set(playbackRows.slice(0, playbackIndex + 1).map((row) => row.id));
  return baseRows.filter((row) => visibleIds.has(row.id));
}

export function buildTimelineBoundaryOptions(timelineMonths, rangeStart, rangeEnd) {
  const timelineYears = [...timelineMonths];
  const startYear = timelineMonths[rangeStart] || '';
  const endYear = timelineMonths[rangeEnd] || '';

  return {
    timelineYears,
    startYear,
    endYear,
  };
}

export function resolveTimelineBoundaryIndex(timelineMonths, boundary, year) {
  if (!year) return -1;
  return timelineMonths.indexOf(year);
}
