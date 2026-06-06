# Peridot Code Structure Audit

## Scope reviewed

This audit is based on the uploaded `src.zip` containing all 44 files in the current `src/` folder. I read the full source set and produced a comment-only replacement bundle. The replacement bundle adds developer-orientation comments to every source file and does not intentionally change runtime logic, imports, exports, JSX structure, data processing, or behavior.

## High-level architecture

Peridot is now organized around a workspace-first React application, but the architecture still shows the history of a map-first side-panel prototype. The current source has three broad layers:

1. **Top-level orchestration** — `App.jsx` remains the dominant application shell. It coordinates data ingestion, normalized row state, graph derivation, filters, timeline/playback, Inspector selection/history, export handlers, workspace routing, and theme state.
2. **Workspace and UI boundaries** — `Peridot*Workspace.jsx`, Inspector components, Analytics components, map-stage components, and the hamburger menu render the major user-facing surfaces.
3. **Pure helper modules** — data normalization, workbook parsing/mapping, capability auditing, chart data derivation, export helpers, timeline helpers, map layout helpers, and force-layout helpers contain much of the non-UI logic.

This is a functional structure. The major issue is not that the code is disorganized everywhere; the issue is that several historically central files remain too broad for easy maintenance.

## Most important structural pain points

### 1. `App.jsx` is still the primary bottleneck

`App.jsx` is the largest and most fragile file. It owns too many cross-cutting concerns: embedded sample data, parsing helpers, upload state, normalization, graph derivation, search/filter state, timeline state, Inspector state/history, workspace composition, export handlers, theme tokens, and compatibility routing.

This concentration makes many changes feel riskier than they should be. A small feature often requires touching `App.jsx` because the relevant state or handler lives there, even when the UI itself is already extracted.

High-value safe direction:

- Extract embedded sample data into `sampleData.js` or a `sampleData/` folder.
- Extract route/workspace handler construction into a small hook or helper after the current routing model stabilizes.
- Extract upload/import orchestration into a `usePeridotDataImport` hook only after the upload flow is fully stable.
- Extract Inspector navigation/history helpers into a dedicated hook only after confirming compact/full behavior remains unchanged.

Recommended sequencing: sample data first, then export/import/state hooks later.

### 2. `LeftControlPanel.jsx` is a legacy compatibility file

`LeftControlPanel.jsx` still contains the older side-panel/rail architecture. Some sections are no longer the main product path, but the file still matters because it preserves compact Inspector and remaining compatibility behavior.

The risk is that a future developer may see obsolete UI labels or dead-looking panel code and delete something that still protects Inspector auto-open behavior.

High-value safe direction:

- Add stronger internal comments marking active versus legacy sections.
- Identify which tabs are no longer reachable from the hamburger menu.
- Remove dead panel sections only after explicit tests show they are unreachable and not needed by compatibility paths.
- Avoid renaming old `showLeftSidebar` / `showRightSidebar`-style compatibility props until node/edge/cluster Inspector behavior is tested.

Recommended sequencing: comment/mark first, then remove one obsolete section at a time.

### 3. `PeridotColumnMappingModal.jsx` is too large

This file is a second major complexity center. It owns a sophisticated workflow: single-table mapping, workbook mapping, step navigation, preview tables, field-role controls, include/ignore controls, capability review, and validation messaging.

The underlying pure helpers are already extracted, which is good. The remaining pain is UI concentration.

High-value safe direction:

- Extract step components into files such as `MappingIdentifyRecordsStep.jsx`, `MappingTimeStep.jsx`, `MappingPlacesStep.jsx`, `MappingRelationshipsStep.jsx`, `MappingEvidenceStep.jsx`, and `MappingReviewStep.jsx`.
- Keep the current props/data contract stable during extraction.
- Do not change mapping behavior during extraction.

Recommended sequencing: one step component per commit, with upload/mapping acceptance tests after each.

### 4. Analytics is now conceptually sound, but has three coupled files

Analytics has a sensible split:

- `analyticsConfig.js` — chart vocabulary and curated field definitions.
- `analyticsDerivationHelpers.js` — chart data preparation.
- `analyticsChartComponents.jsx` — SVG rendering.
- `AnalyticsPanel.jsx` — control and chart workspace composition.

The coupling is expected, but any new chart type currently requires changes in multiple files. That is acceptable for now, but the pattern should be documented.

High-value safe direction:

- Add a short “how to add a chart type” comment or maintainer doc section.
- Keep dynamic field detection conservative.
- Consider chart-data unit tests later, especially for record count, grouping, wide numeric series, and date bucketing.

### 5. Export is in a better place after the recent cleanup

Export is now contextual in the Visualizations header, which matches the current UI model. `exportHelpers.js` is well isolated. The old standalone Export workspace has been removed.

Remaining concern: export still depends on mounted SVG refs and browser APIs. That is normal, but it means export should always be tested manually after stage/layout changes.

High-value safe direction:

- Add clear comments where chart export registers with the header export menu.
- Add a lightweight export smoke-test checklist to documentation.
- Consider adding chart-data CSV export later, but only as a separate feature pass.

### 6. Timeline is now in the right UI location, but state coupling remains fragile

The bottom Visualizations scrubber is a better product fit than the old side-panel timeline. However, timeline state still interacts with Search & Filter, playback rows, visible rows, maps, networks, charts, and export.

High-value safe direction:

- Keep pure date/window logic in `timelinePlaybackHelpers.js`.
- Keep scrubber rendering in `timelinePlaybackComponents.jsx`.
- Avoid adding timeline-specific filtering logic inside Analytics or map-stage components.
- Add comments or docs clarifying the order: loaded rows → Search & Filter scope → Timeline scope/playback → visualized/exported rows.

### 7. Dormant MapLibre code should remain quarantined

`MapLibreMapStage.jsx` and `mapStyleConfig.js` are dormant experimental code. They should not be cleaned up as part of ordinary D3/SVG Peridot work because they represent a paused branch/preview path.

High-value safe direction:

- Leave dormant MapLibre files alone unless MapLibre is explicitly resumed.
- If resumed, start with a new branch and source-of-truth audit.

## Outdated or potentially misleading areas

1. **Legacy side-panel concepts** remain in `LeftControlPanel.jsx` and could confuse future maintainers.
2. **Some route/mode names** remain internal compatibility concepts even though the public menu has changed.
3. **Timeline panel remnants** exist alongside the new bottom scrubber.
4. **Search exists as a workspace but not as a hamburger item**, which is correct but needs clear comments.
5. **Inspector exists as compact/full workflow rather than a simple menu route**, which is correct but easy to misunderstand without comments.
6. **MapLibre preview code** looks substantial enough to seem active, but it is dormant.

## Safest high-value cleanup candidates

### Candidate A — Extract sample data from `App.jsx`

Risk: low.

Why it helps: removes a large non-behavioral block from the primary orchestration file and makes `App.jsx` easier to scan.

Suggested approach:

- Create `src/sampleData.js` or `src/sampleData/peridotSampleData.js`.
- Move `SAMPLE_GEOGRAPHY_CSV`, `SAMPLE_LETTERS_CSV`, and `SAMPLE_PERSON_METADATA_CSV` there.
- Import them into `App.jsx`.
- No behavior changes.

Acceptance test:

- App starts with sample data.
- Use sample data opens Visualizations.
- Map/network/chart views still render.

### Candidate B — Mark and then remove unreachable legacy panel sections

Risk: medium.

Why it helps: reduces confusion in `LeftControlPanel.jsx`.

Suggested approach:

- First pass: add explicit comments marking active compatibility sections versus legacy sections.
- Second pass: remove one confirmed-unreachable legacy section at a time.
- Do not touch Inspector compatibility naming in the same pass.

Acceptance test:

- Node click opens compact Inspector.
- Edge click opens compact Inspector.
- Cluster click opens compact Inspector.
- Expand opens full Inspector.
- Timeline scrubber still works.

### Candidate C — Split `PeridotColumnMappingModal.jsx` into step files

Risk: medium.

Why it helps: makes the mapping workflow easier to maintain and review.

Suggested approach:

- Extract one step component per pass.
- Preserve prop names and behavior.
- Avoid changing mapping logic.

Acceptance test:

- CSV upload stages for mapping.
- Workbook upload stages for mapping.
- Primary sheet can be selected.
- Unique-ID joins still work.
- Capability review still appears.
- Import still produces rows.

### Candidate D — Add a small maintainer guide section for chart-type additions

Risk: low.

Why it helps: Analytics has a multi-file change pattern that should be explicit.

Suggested content:

- Add chart definition to `analyticsConfig.js`.
- Add data derivation in `analyticsDerivationHelpers.js` if needed.
- Add renderer in `analyticsChartComponents.jsx`.
- Add controls in `AnalyticsPanel.jsx` if the chart needs new variable choices.
- Test header export.

### Candidate E — Add tests later for pure helpers

Risk: medium because it touches tooling.

Why it helps: many of the most important behaviors are in pure helpers and could be tested without browser rendering.

Best first test targets:

- `peridotDataCapabilityAudit.js`
- `peridotCsvValidation.js`
- `peridotWorkbookMapping.js`
- `analyticsDerivationHelpers.js`
- `timelinePlaybackHelpers.js`

This should wait until the user explicitly wants test/tooling work.

## Comment quality after this pass

The replacement bundle adds a developer-orientation comment to every source file. These comments explain:

- what the file owns;
- how it relates to neighboring modules;
- which state/data flows depend on it;
- which parts are fragile or compatibility-sensitive;
- what a future developer should avoid changing casually.

This is not a substitute for all future inline comments. A few files would still benefit from deeper internal comments during future refactors:

- `App.jsx` — around cross-workflow derived state and Inspector history.
- `LeftControlPanel.jsx` — around active versus legacy panel sections.
- `PeridotColumnMappingModal.jsx` — around each workflow step.
- `PeridotVisualizationsWorkspace.jsx` — around header export, timeline, and capability-menu coordination.
- `timelinePlaybackComponents.jsx` — around dual-handle constraints and playback semantics.

I recommend adding deeper inline comments opportunistically when those files are next edited for behavior or structure.

## Recommended next structural move

The safest next cleanup is **extracting sample data from `App.jsx`**. It has clear boundaries, low behavior risk, and immediate readability payoff.

The highest-value cleanup after that is **splitting `PeridotColumnMappingModal.jsx`**, but only in small extraction passes.
