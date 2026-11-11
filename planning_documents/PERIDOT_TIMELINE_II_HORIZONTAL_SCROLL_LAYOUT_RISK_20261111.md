# Peridot Timeline II Categories — horizontal scrollbar width constraint and regression note

**Date:** 2026-11-11  
**Status:** Experimental, browser acceptance pending. Do not describe the scrollbar as fixed until the DevTools measurements and mouse interaction are verified.  
**Scope:** Timeline II only; applies to the shared stage-transition wrappers *conditionally* while `selectedTool === VISUALIZATION_TOOLS.TIMELINE_II`.

## Symptom and evidence

The Categories tab has five full-height configuration columns (Source columns, Values to track, Priority, Color, Icons) whose combined fixed-width track is approximately 1,770 px. The UI visibly clips at narrower widths, but the CSS element `.peridot-category-horizontal-scroll` reports `clientWidth = scrollWidth = 1770` and `scrollLeft = 0` in Chrome. Its scrollbar track has no draggable thumb. An ancestor of the editor is approximately 656 px wide with a larger scrollWidth. Chrome is therefore not scrolling inside the intended element: the scroll element itself expands to content width, while a narrower ancestor clips it.

## Experimental correction (v10)

**File:** `src/PeridotVisualizationsWorkspace.jsx`.

Two wrapper elements surrounding `renderWorkspaceBody()` are amended with a **Timeline II-only** `min-w-0` class:

- `.peridot-visualization-stage-transition-shell` (flex wrapper, overflow hidden)
- `.peridot-visualization-stage-transition-content` (nested flex wrapper)

The condition is `selectedTool === VISUALIZATION_TOOLS.TIMELINE_II`. Other visualization selections do not receive the new width constraint. This intends to let the inner Timeline II Categories viewport shrink while the five-column track stays wide and its native horizontal scrollbar acquires a positive scroll range. This does not modify the Timeline II category assignment, colors, icon mapping, chronology, or independent vertical column scrolling. The transition's overflow clipping remains unchanged.

## Potential regression surface

The altered wrappers belong to the **shared Visualize stage**; they are not Timeline II-private components. While conditional scoping limits immediate behavior to Timeline II, this remains a notable coupling. Possible risks:

1. Timeline II chronological and grouped plot widths or SVG sizing may change when the browser narrows or the user enters/exits Categories.
2. Timeline II's orientation switch, zoom, resize, and scrollbar state may reveal unexpected clipping or width measurement timing effects.
3. The stage-transition fade/overlay may expose content at edges when switching between Timeline II and Map, Network, Charts, or Charts II.
4. Future code refactors that broaden the `min-w-0` conditional or move the classes into the CSS selector could unintentionally change Map sizing, Network layout, or in-progress Charts II preview behavior.
5. Existing, uncommitted Charts II changes are deliberately **not** replaced by this patch. Apply against the local current file, never copy an archived full-file version of `PeridotVisualizationsWorkspace.jsx` over the working tree.

## Acceptance and regression checks

1. On Timeline II → Categories, with a narrow browser or DevTools docked, run `const el = document.querySelector('.peridot-category-horizontal-scroll'); console.table({clientWidth: el.clientWidth, scrollWidth: el.scrollWidth, scrollableDistance: el.scrollWidth - el.clientWidth, scrollLeft: el.scrollLeft});`. Expect **scrollableDistance > 0** when the workspace is narrower than the 1,770 px track.
2. Confirm a **visible, draggable native scrollbar thumb** that reaches the full Icons column. Resize the window wider and narrower; confirm normal behavior in both cases.
3. Confirm the five columns keep their existing widths and independent vertical scrolling; no browser-wide horizontal overflow appears.
4. Switch between Timeline/Grouped/Chronological/Categories and check initial zoom, events, playback, and layouts.
5. Check Map, Network, Charts I, and in-progress Charts II after switching away from Timeline II; check transitions, horizontal sizing, and export controls.
6. Run `npm.cmd run build`; review `git diff -- src/PeridotVisualizationsWorkspace.jsx` before committing.

## Rollback

Remove the two conditional `min-w-0` additions in the shared stage-transition wrappers or restore the temporary backup saved by the installer. Do **not** reset the entire `PeridotVisualizationsWorkspace.jsx` file or checkout a prior Git version: this could erase unrelated Charts II work.

## Documentation synchronization

This technical note is intentionally standalone because the latest **current** `/core_documentation` versions and user-confirmed HEAD were not supplied with this experimental implementation. Under Peridot's documentation governance rules, the next approved core-documentation pass should incorporate the active contract and regression risks in `MAINTAINERS_GUIDE.md`, and record the experiment/outcome in `CHANGELOG.md`, after reading all current core documents and the governance protocol in full. Do not assert that the experiment was successful before browser verification.
