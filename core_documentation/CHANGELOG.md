# Changelog

## Current documented safe baseline

- **`08b628b` — `Use include and ignore checkboxes for evidence fields`** on branch **`main`**

This baseline records the active legacy D3/SVG Peridot path after the workspace-routing milestone, the completed dual-mode Inspector implementation cluster, the Home-style workspace visual pass, and the expanded humanistic-data capability milestone. The current app is workspace-first for Home, Data, Visualizations, Search & Filter, Theme, Export, and the full Inspector workspace, while retaining compact side-panel Inspector summaries for visualization clicks and retaining Timeline as a transitional side-panel bridge. Recent milestones include capability-aware visualization menus, flexible chart-variable controls, record-count support across aggregate charts, generalized user-facing language, generic chart/evidence row admission, and include/ignore checkbox handling for evidence fields. Earlier milestones include Search & Filter implementation, Analytics feature and visual-polish work, standardized Peridot CSV workflow, arbitrary CSV/TSV mapping, full workbook/Excel import support, Inspector profile/navigation refinement, and the shift from correspondence-only import assumptions toward role-based humanistic-data mapping.

The current Data Inputs / import workflow now provides:

- downloadable Peridot CSV template plus one unified CSV/TSV/XLSX/XLS table-workbook upload path;
- permissive database-first upload handling for incomplete historical correspondence records;
- validation/capability reporting and persistent upload summaries;
- a pure data-capability audit helper for Inspector, Search, point-map, route-map, network, timeline, chart, and export readiness;
- role-based upload mapping organized around records, time, places, relationships, evidence/analysis, and capability review;
- explicit temporal roles for single date, date start, date end, and display date;
- point-location roles for point/site datasets that have one location per record;
- route coordinate roles that support separated latitude/longitude columns and combined source/target coordinate-pair columns;
- latitude-first coordinate-pair guidance, including `POINT(latitude longitude)` strings;
- successful point/site dataset mapping and Place Map rendering without requiring people/network relationships;
- generic chart/evidence rows accepted into the active dataset without requiring map or network roles;
- evidence/analysis field inclusion controls using explicit Include and Ignore checkboxes that default to Include;
- arbitrary CSV/TSV staging and column mapping;
- Excel workbook parsing for `.xlsx` and `.xls` files through the isolated workbook parser helper;
- multi-sheet workbook staging with workbook and sheet summaries;
- workbook-aware mapping for primary record sheet selection, core Peridot field mapping, and selected custom Inspector fields;
- user-configured unique-ID joins across multiple workbook sheets;
- multi-sheet workbook import assembly into Peridot rows;
- selected custom Inspector/Analytics metadata from primary and joined workbook sheets;
- clearer mapping cancel/import actions;
- removal of the public legacy Geography / Raw Data / Person Metadata three-file upload workflow.

The current Inspector workflow now provides a dual-mode evidence system:

- visualization clicks open a compact side-panel Inspector for at-a-glance evidence;
- hamburger **Inspector** and compact **Expand** open the full evidence-dossier workspace;
- compact and full modes share the same selected Inspector state and multi-step Back history;
- `[x]`, Escape, and blank-map click close the appropriate Inspector surface and return to Visualizations;
- compact summary tiles open the full workspace for the selected person/place;
- linked person/place navigation opens the full workspace and resolves against the correct people/place graph;
- linked-letter detail pages participate in the shared Inspector history;
- linked-letter source/target people and places are clickable and return through Back;
- directed route rows open route/edge dossier views with linked letters;
- person/place profile pages show summary metrics, related people, related places, directed routes, linked-letter counts, selected uploaded fields, and dedicated linked-letter detail pages.

The current Search & Filter workflow uses a compact database-style advanced-search layout with current applied scope at the top, draft/apply global filtering, predictive suggestions, route-place and route-people filters, year text inputs with suggestions, and pre-update status feedback. Analytics has chart controls, dynamic variable options, compact and expanded chart views, higher-contrast tooltips, and a dark green translucent expanded-view backdrop with the chart itself retained on a white/cream card.


The current interface/workspace workflow now provides:

- Home / welcome workspace with Upload my data and Use sample data start paths;
- hamburger-triggered labeled menu replacing the persistent icon rail as the primary visible navigation surface;
- full-window workspaces for Home, Data, Visualizations, Search & Filter, Theme, and Export;
- Visualizations workspace containing Place Map, People Network, Force-Directed, and Analytics;
- Search & Filter promoted to a full workspace while preserving draft/apply filtering behavior;
- Export promoted to a full workspace with a live visualization preview preserved for SVG/PNG export;
- Theme promoted to a full workspace;
- Data workspace using the unified CSV/TSV/XLSX/XLS uploader;
- Timeline retained as a transitional side-panel bridge pending a later bottom Visualizations timeline/scrubber design;
- Inspector now implemented as a dual-mode system: compact side-panel summaries for visualization clicks plus a full evidence-dossier workspace from hamburger/Expand, sharing selection and history.
- capability-aware Visualizations menus grouping tools as Mapping Visualizations, Network Visualizations, Chart Visualizations, and Explore Your Data;
- unavailable-state explanations for visualization types that the active dataset cannot support;
- direct chart-type selection from the Chart Visualizations menu;
- flexible chart variable controls for x-axis, y-axis/metric, grouping/series, aggregation, and selected wide numeric series;
- explicit Record count support for bar, grouped bar, stacked bar, line, multi-line, histogram, pie, sunburst, and heatmap charts;
- generic chart/evidence records accepted into the active dataset even when they have no map or network roles;
- evidence/analysis field inclusion controls using explicit Include and Ignore checkboxes, defaulting to Include.

The early MapLibre preview code remains present and gated behind `?maplibrePreview=1`, but it is dormant for ordinary use. The later `maplibre-native-geographic-view` experiment remains set aside rather than merged into the active implementation path.

---

## Current milestone notes

### Visualization capability and flexible Analytics milestone

- Added capability-aware Visualizations workspace menus for Mapping Visualizations, Network Visualizations, Chart Visualizations, and Explore Your Data.
- Added readable availability labels, forgiving hover behavior, and unavailable-state explanations when a dataset cannot support a selected map, network, or chart view.
- Changed Chart Visualizations so the dropdown lists chart types directly rather than a broad Analytics entry.
- Generalized Analytics chart controls around user-selected x-axis/category fields, y-axis/metric fields, aggregation, grouping/series fields, heatmap rows/columns, histogram distributions, and selected wide numeric series.
- Made **Record count** an explicit metric for aggregate chart types, including histogram and sunburst.
- Cleaned chart language so generic record/metric charts no longer imply that all values are letters.
- Current implemented flexible-Analytics baseline: **`ab7affa` — `Clean up flexible Analytics chart controls`**.

### Generic chart/evidence record and mapping-field inclusion milestone

- Generalized user-facing app language beyond correspondence-only wording while preserving compatibility terms and legacy internal names where still required.
- Added generic chart/evidence row admission so chart-first and evidence-first datasets can enter the active dataset without map or network roles.
- Kept map and network availability capability-based: generic chart records can be chart-ready and export-ready while remaining unmappable and non-network-ready.
- Replaced the Evidence and analysis include/ignore dropdown control with explicit **Include** and **Ignore** checkboxes per field, defaulting to Include.
- Current implemented generic-record and evidence-field UI baseline: **`08b628b` — `Use include and ignore checkboxes for evidence fields`**.

### Data capability and role-based mapping milestone

- Added `planning_documents/PERIDOT_DATA_CAPABILITY_MODEL_PLAN.md` to define Peridot's broader humanistic-data capability model.
- Added `src/peridotDataCapabilityAudit.js` as a pure helper for field-role inference and dataset capability reporting.
- Moved the data capability audit to the mapping-review decision point instead of leaving it as a post-cancel Data workspace status card.
- Reorganized the mapping modal away from **Map Peridot variables** and **Choose Inspector fields** toward role-based stages: **Identify records**, **Time**, **Places**, **Relationships**, **Evidence and analysis**, and **Review capabilities**.
- Added explicit temporal mapping roles for single date, date start, date end, and display date.
- Added point-location mapping roles for datasets with one location per record.
- Added combined coordinate-pair mapping roles for point records and source/target route records, using latitude-first pairs.
- Preserved existing correspondence route/network behavior while allowing non-network point/site datasets to import and render in Place Map.
- Confirmed that point/site datasets without source-target relationships correctly do not populate People Network or Force-Directed views.
- Current implemented data-capability baseline: **`e7c3b57` — `Add point-location role mapping`**.

### Home/workspace visual-system milestone

- Refined the Home workspace layout and menu access.
- Removed Home navigation from active workspaces.
- Applied the Home-style visual system to full workspaces.
- Standardized most workspace button hover/highlight states around the existing gold-brown accent.

### Dual-mode Inspector workspace milestone

- Added `planning_documents/PERIDOT_INSPECTOR_WORKSPACE_CONTRACT.md` to define the compact/full Inspector model.
- Prepared `InspectorPanel.jsx` as a reusable Inspector content boundary.
- Added Inspector presentation modes for `closed`, `compact`, `workspace`, and `empty-workspace`.
- Changed visualization clicks so nodes, edges, and clusters open the compact side-panel Inspector.
- Changed hamburger **Inspector** so it opens the full Inspector workspace rather than the compact side panel.
- Added compact **Expand Inspector** behavior and `[x]`/Escape close behavior for compact and full modes.
- Kept the most recently used Visualizations state mounted underneath the full Inspector workspace.
- Refined the dual-mode Inspector visual treatment with a Peridot/moss/cream palette.
- Reduced compact Inspector content so it functions as an at-a-glance summary rather than a full dossier.
- Moved linked-letter detail into shared Inspector state/history.
- Made linked-letter source/target people and places clickable.
- Made compact summary tiles open the full Inspector workspace for the same selected entity.
- Made directed route rows open route/edge Inspector dossiers with linked letters.
- Current implemented Inspector baseline: **`b24e19a` — `Link Inspector directed route rows`**.

### Interface redesign and workspace-routing milestone

- Added `PERIDOT_INTERFACE_REDESIGN_PLAN.md` to define the shift from a map-first side-panel app toward a multimodal correspondence data exploration workspace.
- Added internal workspace state and extracted workspace configuration into `src/peridotWorkspaceConfig.js`.
- Added Home / welcome startup behavior and routed users into Data or Visualizations from the landing page.
- Replaced the visible persistent icon rail with a hamburger-triggered labeled menu.
- Promoted Theme to a full workspace.
- Created and extracted full workspace components for Home, Data, Theme, Visualizations, Export, and Search & Filter.
- Added `src/PeridotHamburgerMenu.jsx`, `src/PeridotHomeWorkspace.jsx`, `src/PeridotDataWorkspace.jsx`, `src/PeridotThemeWorkspace.jsx`, `src/PeridotVisualizationsWorkspace.jsx`, `src/PeridotExportWorkspace.jsx`, `src/PeridotSearchWorkspace.jsx`, and `src/peridotWorkspaceConfig.js`.
- Moved Analytics into the Visualizations workspace while preserving compact preview sizing and expanded chart behavior.
- Promoted Export to a full workspace with a live visualization preview preserved for SVG/PNG export.
- Promoted Search & Filter to a full workspace while preserving existing keyword/person/place/route/date/weight controls and predictive suggestions.
- Updated `PERIDOT_ROUTING_CONTRACT_AUDIT.md` after Search and Export were promoted.
- Deferred Timeline promotion; the preferred future design is now a bottom timeline/scrubber integrated with Visualizations.
- Deferred Inspector promotion pending a careful full evidence-dossier design contract.

### Workbook / Excel import and Inspector profile milestone

- Added workbook-aware staging and parsing for CSV, TSV, XLSX, and XLS files.
- Added workbook mapping helpers that model primary record sheets, sheet/column references, core Peridot field mappings, and unique-ID joins.
- Added a workbook mapping workspace for multi-sheet Excel files.
- Let users manually add multiple joined sheets and choose arbitrary unique-ID columns on the primary and joined sheets.
- Assembled multi-sheet workbook rows into Peridot-shaped records using configured unique-ID joins.
- Let users choose custom Inspector/Analytics fields from primary and joined workbook sheets.
- Displayed user-selected custom fields in linked letter cards.
- Reworked person and place Inspector views into profile summaries with related people, related places, directed routes, date spans, linked-letter counts, and selected uploaded fields.
- Added dedicated linked-letter detail pages inside the Inspector rather than expanding long records inline.
- Fixed place-profile fallback behavior so places clicked from profile lists can resolve from linked-record metadata.
- Removed redundant top-level Inspector fields once the richer profile sections covered the same information.

### Arbitrary column mapping and workbook-parsing milestone

- Added `src/peridotColumnMapping.js` to define column-mapping helpers for mapping user-uploaded tables into Peridot’s internal field model.
- Added `src/PeridotColumnMappingModal.jsx` as the large mapping workspace for arbitrary CSV/TSV imports.
- Staged arbitrary CSV and TSV uploads for mapping rather than assuming incoming files already match the Peridot template.
- Imported mapped arbitrary CSV/TSV data into the active Peridot data pipeline.
- Clarified cancel/import actions so the mapping workflow is less ambiguous.
- Added `src/peridotWorkbookParsing.js` as the workbook parsing helper for the planned Excel path.
- Removed the ordinary legacy three-file upload workflow after the one-file/mapped-import direction became the active public data-ingestion model.

### Standardized single-CSV Data Inputs milestone

- Added `src/peridotCsvSchema.js` to define the public template columns, field groupings, minimum record rule, capability labels, and upload tips.
- Added `src/peridotCsvNormalizer.js` to convert the public one-file template into existing internal geography, letter metadata, person metadata, and place row shapes.
- Added `src/peridotCsvValidation.js` to build validation summaries and row-capability reports.
- Simplified the ordinary Data Inputs panel to foreground **Download CSV template**, **Upload completed CSV**, latest upload summary, and concise data tips.
- Added an upload validation popup and kept the same information accessible after close through a persistent side-panel summary.
- Established the database-first upload policy: accepted rows may be incomplete; coordinates and parseable dates are capability-enabling fields rather than upload-admission requirements; Peridot does not clean, standardize, merge, or enforce controlled vocabularies for uploaded user data.

### Search & Filter implementation and layout milestone

- Implemented the dedicated **Search & Filter** rail tab and promoted it from planning contract to active global-filtering UI.
- Search & Filter owns draft/apply controls for keyword search, person filter, place filter, **Route Filter (Place)**, **Route Filter (People)**, minimum correspondence weight, and date range.
- Predictive suggestion menus appear after at least two typed characters, are capped visually to about five visible suggestions, allow scrolling for more matches, and fill draft fields only.
- **Apply Filters** commits all active filter controls together.
- **Clear Filters** clears keyword/person/place/route filters, restores minimum weight to `1`, restores the full available date range, and resets playback.
- Pre-update status feedback appears before expensive full-dataset recomputation begins.
- Later visual refinements converted Search & Filter from stacked explanatory cards into a compact advanced-search form.

### Analytics feature and visual-polish milestone

- Added the Analytics side-panel tab with chart previews, chart controls, chart descriptions, and PNG export.
- Added multiple chart types, expanded chart controls, dynamic variable detection, route-place/route-person variables, and an expanded chart overlay.
- Improved Analytics chart hover-tooltip contrast.
- Refined the expanded Analytics view: dark green translucent backdrop, cool off-white text/borders, preserved blurred-map effect, and white/cream chart card.

### Side-panel and cluster milestones

- Consolidated the app around a shared left-side panel shell with a persistent rail.
- Added dedicated rail tabs for Data Inputs, Search & Filter, Export, Timeline, Analytics, Controls, and Inspector.
- Made the Inspector content-only inside the shared panel shell.
- Made clusters actionable in the inspector, grouped cluster members by place, and made cluster sizing reflect represented letter volume.

---

## Current branch status

- **`08b628b` — `Use include and ignore checkboxes for evidence fields`** is the current documented `main` baseline and current head in the provided sync ritual.
- **`231ccde` — `Accept generic chart records`** accepts chart/evidence rows into the active dataset without requiring map or network roles.
- **`b19019e` — `Generalize user-facing language beyond correspondence`** updates visible language toward humanistic records, entities, and data roles.
- **`ab7affa` — `Clean up flexible Analytics chart controls`** stabilizes flexible chart variables and multi-line chart modes.
- **`ec6a70e` — `Support record-count sunburst charts`** adds explicit record-count support to sunburst charts.
- **`596b958` — `Support record-count histograms`** adds record-count distribution support to histograms.
- **`b2dcde5` — `Add flexible Analytics chart variables`** introduces flexible chart axis, metric, aggregation, and series controls.
- **`6d0b37c` — `Wire visualization availability state`** wires dataset capability state into the Visualizations workspace.
- **`b273a27` — `Make visualization menu hover more forgiving`** improves the visualization menu hover boundary.
- **`aae209a` — `Document data capability mapping milestone`** documents the implemented data-capability mapping milestone.
- **`85f3d46` — `Move data capability audit to mapping review`** places capability reporting at the import decision point.
- **`eef9cfe` — `Show read-only data capability summaries`** first surfaced data-capability summaries in the UI.
- **`1889b95` — `Add data capability audit helper`** adds the pure capability-audit helper.
- **`bfc8872` — `Add Peridot data capability model plan`** adds the capability-model planning document.
- **`4f280a0` — `Use gold accent for workspace button hover states`** completes the gold-accent hover-state pass.
- **`737a970` — `Apply Home-style visual system to full workspaces`** applies the Home-style visual system to the full workspaces.
- **`c0ea2ab` — `Refine Home workspace layout and menu access`** refines Home and menu access.
- **`a9a25f1` — `Remove Home navigation from active workspaces`** removes redundant Home navigation inside active workspaces.
- **`88ab302` — `Refine Home workspace card styling`** refines Home card styling.
- **`b24e19a` — `Link Inspector directed route rows`** is the preceding documented Inspector baseline.
- **`ed0f2c7` — `Make compact Inspector summary tiles open workspace`** makes compact person/place summary tiles visibly open the full Inspector workspace.
- **`ace7f52` — `Fix linked letter person and place navigation`** fixes linked-letter source/target person/place navigation and Back placement.
- **`0a1b57a` — `Link letter detail people and places`** makes linked-letter source/target people and places clickable.
- **`6f67ac7` — `Move linked letters into Inspector history`** moves linked-letter detail into shared Inspector state/history.
- **`6c38fac` — `Open Inspector person and place links in workspace`** makes Inspector-internal person/place links open the full workspace.
- **`6994b35` — `Reduce compact Inspector content`** makes the compact side-panel Inspector summary-oriented.
- **`f2336f8` — `Apply Inspector shell palette refinements`** applies Inspector shell palette refinements.
- **`45d1c8b` — `Adjust Inspector clickable object palette`** adjusts the nested Inspector clickable-object palette.
- **`e02a4a3` — `Refine dual-mode Inspector visual treatment`** refines compact/full Inspector visual treatment.
- **`224bf5d` — `Refine dual-mode Inspector close and expand behavior`** refines Inspector close, Escape, blank-map, and Expand behavior.
- **`7a9e310` — `Route menu Inspector away from compact panel`** changes hamburger Inspector routing away from the compact side panel.
- **`99c0b99` — `Track compact Inspector presentation mode`** tracks compact Inspector presentation state.
- **`c2808ce` — `Add inert Inspector presentation mode state`** adds Inspector presentation-mode state.
- **`3377274` — `Prepare shared Inspector content boundary`** prepares the reusable Inspector content boundary.
- **`b7e3edd` — `Add Inspector workspace design contract`** adds the Inspector workspace contract.
- **`82178c5` — `Promote Search to full workspace`** promoted Search & Filter out of the legacy side-panel bridge.
- **`2c53796` — `Promote Export to full workspace`** promoted Export into a full workspace with a live export preview.
- **`8fc96b3` — `Extract Peridot workspace config`** moved workspace constants/helpers out of `App.jsx`.
- **`9cd3f3f` — `Clean workspace routing comments`** updated routing comments and removed an obsolete Analytics side-panel handler.
- **`9240745` — `Fix Visualizations workspace export`** fixed the named export for `PeridotVisualizationsWorkspace`.
- **`25fc046` — `Extract Peridot visualizations workspace`** extracted the Visualizations workspace component.
- **`fcf6bb6` — `Extract Peridot data workspace`** extracted the Data workspace component.
- **`9428766` — `Extract Peridot theme workspace`** extracted the Theme workspace component.
- **`18c2912` — `Extract Peridot home workspace`** extracted the Home workspace component.
- **`6c16403` — `Extract Peridot hamburger menu`** extracted the hamburger menu component.
- **`30b114b` — `Add Peridot routing contract audit`** added the routing transition audit.
- **`8384dee` — `Fit Analytics workspace preview`** stabilized Analytics preview sizing in Visualizations.
- **`7a8ed7d` — `Compact Visualizations workspace controls`** compacted Visualizations controls.
- **`9b67d28` — `Move Theme to full workspace`** moved Theme to a full workspace.
- **`bb0c0ed` — `Refine hamburger menu visual layout`** refined hamburger menu styling.
- **`2336915` — `Route mapped imports to visualization workspace`** routed completed mapped imports to Visualizations.
- **`576bb72` — `Fix visualization workspace viewport initialization`** fixed map viewport measurement after Home/Data startup.
- **`56f2a49` — `Add internal workspace state model`** introduced internal workspace state.
- **`b42f6fd` — `Add Peridot interface redesign plan`** added the interface redesign plan.
- **`10017ec` — `Document workbook import and Inspector profile milestone`** documented the preceding workbook/import/Inspector milestone.
- **`0f72182` — `Remove redundant Inspector correspondents summary row`** is the preceding safe baseline from before the interface-redesign sequence.
- **`2d76839` — `Fix linked letter encoding display`** is the paused `maplibre-native-geographic-view` branch head shown in the earlier full commit log.

## Deferred / rolled-back work

### MapLibre migrated-overlay work paused

The later MapLibre migrated-overlay branch is paused. It should be retained as an archived experiment, not deleted. The current continuation branch keeps early gated MapLibre preview files dormant while active development proceeds on the legacy D3/SVG app. If MapLibre is revisited later, start from a fresh audit and do not assume the experimental branch can be merged wholesale.

### Force-Directed fallback issue on MapLibre experiment

During the later MapLibre experiment, Force-Directed was intended to bypass MapLibre and use the legacy D3/SVG force-directed view. That routing was partly established, but the force view still blanked after briefly rendering. Several speculative sizing fixes were rolled back, and the branch was set aside. Future work should diagnose the legacy force-render path directly before attempting new fixes.

### Shared-panel prop rename attempt, after `4a17d1c`

A cleanup attempt was made to rename the old `showLeftSidebar` / `showRightSidebar` compatibility prop path to newer shared-panel naming. This was rolled back because it broke Inspector auto-open behavior when clicking nodes, edges, or clusters.

Future work should treat this path as fragile. If the old names are renamed later, the pass must explicitly test node click, edge click, cluster click, contained cluster-member click, and Back behavior.

### Panel responsive sizing attempt, after `b62c74b`

A responsive panel-sizing experiment attempted to make the shared side panel absolutely positioned at all viewport sizes. It was rolled back because it disrupted the full-size landscape layout and forced scrolling before the map. Future responsive-panel work should be designed as a narrow-window override rather than a universal positioning replacement.

---

# Full development history

This is the single authoritative place in the documentation for the cumulative commit trajectory. The table below is transcribed from the full commit log provided for this documentation pass, newest first. The newest rows reflect the sync ritual ending at `e7c3b57`.

| Date | Commit | Branch/tag decoration | Message |
|---|---|---|---|
| 2026-06-06 | `08b628b` | (HEAD -> main, origin/main, origin/HEAD) | Use include and ignore checkboxes for evidence fields |
| 2026-06-06 | `231ccde` |  | Accept generic chart records |
| 2026-06-06 | `b19019e` |  | Generalize user-facing language beyond correspondence |
| 2026-06-06 | `ab7affa` |  | Clean up flexible Analytics chart controls |
| 2026-06-06 | `ec6a70e` |  | Support record-count sunburst charts |
| 2026-06-06 | `596b958` |  | Support record-count histograms |
| 2026-06-06 | `b2dcde5` |  | Add flexible Analytics chart variables |
| 2026-06-06 | `6d0b37c` |  | Wire visualization availability state |
| 2026-06-06 | `b273a27` |  | Make visualization menu hover more forgiving |
| 2026-06-06 | `aae209a` |  | Document data capability mapping milestone |
| 2026-06-06 | `e7c3b57` |  | Add point-location role mapping |
| 2026-06-06 | `85f3d46` |  | Move data capability audit to mapping review |
| 2026-06-06 | `eef9cfe` |  | Show read-only data capability summaries |
| 2026-06-06 | `1889b95` |  | Add data capability audit helper |
| 2026-06-06 | `bfc8872` |  | Add Peridot data capability model plan |
| 2026-06-05 | `4f280a0` |  | Use gold accent for workspace button hover states |
| 2026-06-05 | `737a970` |  | Apply Home-style visual system to full workspaces |
| 2026-06-05 | `c0ea2ab` |  | Refine Home workspace layout and menu access |
| 2026-06-05 | `a9a25f1` |  | Remove Home navigation from active workspaces |
| 2026-06-05 | `88ab302` |  | Refine Home workspace card styling |
| 2026-06-04 | `b24e19a` |  | Link Inspector directed route rows |
| 2026-06-04 | `ed0f2c7` |  | Make compact Inspector summary tiles open workspace |
| 2026-06-04 | `ace7f52` |  | Fix linked letter person and place navigation |
| 2026-06-04 | `0a1b57a` |  | Link letter detail people and places |
| 2026-06-04 | `6f67ac7` |  | Move linked letters into Inspector history |
| 2026-06-04 | `6c38fac` |  | Open Inspector person and place links in workspace |
| 2026-06-04 | `6994b35` |  | Reduce compact Inspector content |
| 2026-06-04 | `f2336f8` |  | Apply Inspector shell palette refinements |
| 2026-06-04 | `45d1c8b` |  | Adjust Inspector clickable object palette |
| 2026-06-04 | `e02a4a3` |  | Refine dual-mode Inspector visual treatment |
| 2026-06-04 | `224bf5d` |  | Refine dual-mode Inspector close and expand behavior |
| 2026-06-04 | `7a9e310` |  | Route menu Inspector away from compact panel |
| 2026-06-04 | `99c0b99` |  | Track compact Inspector presentation mode |
| 2026-06-04 | `c2808ce` |  | Add inert Inspector presentation mode state |
| 2026-06-04 | `aa90665` |  | Organize project documentation |
| 2026-06-04 | `3377274` |  | Prepare shared Inspector content boundary |
| 2026-06-04 | `b7e3edd` |  | Add Inspector workspace design contract |
| 2026-06-04 | `b47fda2` |  | Refresh documentation for workspace routing milestone |
| 2026-06-02 | `55fae50` |  | Update routing contract after workspace promotions |
| 2026-06-02 | `82178c5` |  | Promote Search to full workspace |
| 2026-06-02 | `2c53796` |  | Promote Export to full workspace |
| 2026-06-02 | `8fc96b3` |  | Extract Peridot workspace config |
| 2026-06-02 | `9cd3f3f` |  | Clean workspace routing comments |
| 2026-06-02 | `9240745` |  | Fix Visualizations workspace export |
| 2026-06-02 | `25fc046` |  | Extract Peridot visualizations workspace |
| 2026-06-02 | `fcf6bb6` |  | Extract Peridot data workspace |
| 2026-06-02 | `9428766` |  | Extract Peridot theme workspace |
| 2026-06-02 | `18c2912` |  | Extract Peridot home workspace |
| 2026-06-02 | `6c16403` |  | Extract Peridot hamburger menu |
| 2026-06-02 | `30b114b` |  | Add Peridot routing contract audit |
| 2026-06-02 | `8384dee` |  | Fit Analytics workspace preview |
| 2026-06-02 | `7a8ed7d` |  | Compact Visualizations workspace controls |
| 2026-06-02 | `9b67d28` |  | Move Theme to full workspace |
| 2026-06-02 | `bb0c0ed` |  | Refine hamburger menu visual layout |
| 2026-06-02 | `2336915` |  | Route mapped imports to visualization workspace |
| 2026-06-02 | `576bb72` |  | Fix visualization workspace viewport initialization |
| 2026-06-02 | `56f2a49` |  | Add internal workspace state model |
| 2026-06-02 | `b42f6fd` |  | Add Peridot interface redesign plan |
| 2026-06-02 | `10017ec` |  | Document workbook import and Inspector profile milestone |
| 2026-06-02 | `0f72182` |  | Remove redundant Inspector correspondents summary row |
| 2026-06-02 | `8564e33` |  | Fix place profiles and split directed route summaries |
| 2026-06-02 | `b1ef30a` |  | Refine Inspector profile relationship sections |
| 2026-06-02 | `d9f0090` |  | Improve Inspector person place profiles and linked letter navigation |
| 2026-06-02 | `9c8971b` |  | Display custom Inspector fields in linked letters |
| 2026-06-02 | `5f25322` |  | Select custom Inspector fields from joined workbook sheets |
| 2026-06-02 | `964ce57` |  | Import multi-sheet workbooks by unique ID joins |
| 2026-06-02 | `ac31c38` |  | Configure workbook sheet joins by unique ID |
| 2026-06-02 | `77b1575` |  | Preview multi-sheet workbook mapping |
| 2026-06-02 | `2a800b3` |  | Add Peridot workbook mapping model helper |
| 2026-06-02 | `dd22abc` |  | Stabilize multi-sheet workbook staging |
| 2026-06-02 | `f503df6` |  | Refresh documentation with full commit history |
| 2026-06-02 | `4d11cb3` |  | Add Peridot workbook parsing helper |
| 2026-06-02 | `212d689` |  | Clarify column mapping cancel and import actions |
| 2026-06-02 | `d270c9d` |  | Import mapped arbitrary CSV and TSV data |
| 2026-06-02 | `a058730` |  | Add Peridot column mapping workspace |
| 2026-06-02 | `a4062ba` |  | Stage arbitrary CSV and TSV column mapping uploads |
| 2026-06-02 | `bba50e1` |  | Add Peridot column mapping helper |
| 2026-06-02 | `f432ccc` |  | Remove legacy three-file upload workflow |
| 2026-06-02 | `44d2042` |  | Document single Peridot CSV upload workflow |
| 2026-06-02 | `930c807` |  | Persist Peridot upload summary in Data Inputs |
| 2026-06-02 | `cbc35d0` |  | Add single Peridot CSV upload workflow |
| 2026-06-01 | `61f3c4b` |  | Add Peridot CSV validation summary helper |
| 2026-06-01 | `3d5fb79` |  | Add Peridot CSV template normalizer |
| 2026-06-01 | `8e7a8a4` |  | Add Peridot CSV schema contract |
| 2026-05-23 | `9453232` |  | Document Search and Filter layout and Analytics polish |
| 2026-05-23 | `bdd0843` |  | Refine expanded analytics backdrop contrast |
| 2026-05-23 | `64d44f2` |  | Improve analytics tooltip contrast |
| 2026-05-23 | `e02c1de` |  | Move filter status above action buttons |
| 2026-05-23 | `8bfd422` |  | Refine compact Search and Filter layout |
| 2026-05-23 | `b2147bb` |  | Consolidate Search and Filter layout |
| 2026-05-23 | `1ae3f03` |  | Document Search and Filter milestone |
| 2026-05-23 | `01de3d8` |  | Show filter update status before applying changes |
| 2026-05-23 | `c98c242` |  | Split route filters by place and people |
| 2026-05-23 | `1578d10` |  | Add route filter |
| 2026-05-23 | `ea19fc8` |  | Improve predictive suggestion menu scrolling |
| 2026-05-23 | `9c179f7` |  | Add predictive suggestions for person and place filters |
| 2026-05-23 | `cc26530` |  | Add person and place filters |
| 2026-05-23 | `019acef` |  | Add clear filters and reset playback on apply |
| 2026-05-23 | `d5e7667` |  | Apply Search and Filter changes on request |
| 2026-05-23 | `8912b8f` |  | Strengthen full-file review workflow rule |
| 2026-05-23 | `b348f12` |  | Move date range controls into Search and Filter |
| 2026-05-23 | `a890b13` |  | Move minimum weight filter into Search and Filter |
| 2026-05-23 | `e6b477d` |  | Add Search and Filter panel shell |
| 2026-05-23 | `2eb3461` |  | Document Search and Filter panel contract |
| 2026-05-23 | `9d24fbf` |  | Document Analytics feature milestone |
| 2026-05-23 | `3352403` |  | Fix Analytics expanded overlay and variable options |
| 2026-05-23 | `4b631be` |  | Refine Analytics variables and expanded chart overlay |
| 2026-05-23 | `416dced` |  | Refine Analytics chart icons and expanded view |
| 2026-05-23 | `2320bfe` |  | Expand Analytics chart controls |
| 2026-05-23 | `961bf45` |  | Clarify Analytics chart variable controls |
| 2026-05-23 | `4b90e4e` |  | Add additional Analytics chart types |
| 2026-05-23 | `caddd3c` |  | Refine Analytics chart panel interactions |
| 2026-05-23 | `04d95a7` |  | Add Analytics side panel charts |
| 2026-05-14 | `b5dc2b5` |  | Document legacy continuation after pausing MapLibre work |
| 2026-05-14 | `2d76839` | (tag: checkpoint-maplibre-migrated-overlay-paused, origin/maplibre-native-geographic-view, maplibre-native-geographic-view) | Fix linked letter encoding display |
| 2026-05-14 | `2c0be03` |  | Make MapLibre people view and force-directed fallback work |
| 2026-05-14 | `5762d0e` |  | Refresh documentation for MapLibre migrated overlay milestone |
| 2026-05-14 | `268b18c` |  | Add MapLibre hover feedback |
| 2026-05-14 | `8137db7` |  | Curve MapLibre aggregated routes |
| 2026-05-13 | `c0a4b8a` |  | Restore MapLibre migrated overlay after extraction regression |
| 2026-05-13 | `dd148e1` |  | Extract MapLibre cluster and aggregate IDs |
| 2026-05-13 | `57d3cc1` |  | Add MapLibre cluster count labels |
| 2026-05-13 | `c7da28c` |  | Add MapLibre cluster selection feedback |
| 2026-05-13 | `2ccaaeb` |  | Show MapLibre aggregated route details in inspector |
| 2026-05-13 | `084ce9d` |  | Enrich MapLibre aggregated route inspector payload |
| 2026-05-13 | `526534a` |  | Aggregate MapLibre routes between visible endpoints |
| 2026-05-13 | `8a563cc` |  | Hide MapLibre cluster member nodes |
| 2026-05-13 | `be7d9ae` |  | Route MapLibre cluster clicks to inspector |
| 2026-05-13 | `1e8456f` |  | Add dynamic MapLibre cluster diagnostic |
| 2026-05-13 | `bb11f6a` |  | Add static MapLibre cluster lifecycle diagnostic |
| 2026-05-13 | `3f26cc2` |  | Broaden MapLibre lifecycle diagnostics |
| 2026-05-13 | `3646cc6` |  | Refresh documentation for MapLibre native branch handoff |
| 2026-05-13 | `4c9ed6f` |  | Extract MapLibre layer configuration |
| 2026-05-13 | `c420a5d` |  | Extract MapLibre feature builders |
| 2026-05-13 | `b7fb244` |  | Add MapLibre native geographic view plan |
| 2026-05-13 | `10051c0` | (tag: checkpoint-maplibre-preview-prototype) | Add MapLibre selected filter layers |
| 2026-05-13 | `b7c61a2` |  | Add MapLibre route hit layer |
| 2026-05-13 | `f2fdcf9` |  | Add cursor-only MapLibre hover detection |
| 2026-05-13 | `5f3f053` |  | Route MapLibre feature clicks to inspector |
| 2026-05-13 | `2597462` |  | Remove MapLibre SVG node probe overlay |
| 2026-05-13 | `7eebdee` |  | Add simple MapLibre node layer probe |
| 2026-05-13 | `1f0d322` |  | Render MapLibre route probes as GeoJSON layer |
| 2026-05-13 | `443d7ac` |  | Add MapLibre route projection probe |
| 2026-05-12 | `6096069` |  | Add MapLibre projection probe |
| 2026-05-12 | `33afaae` |  | Add MapLibre preview diagnostics |
| 2026-05-12 | `da1463f` |  | Add MapLibre workspace preview path |
| 2026-05-12 | `93f0961` |  | Add isolated MapLibre map stage |
| 2026-05-12 | `1d816a5` |  | Add MapLibre hybrid map-system audit |
| 2026-05-12 | `4e08720` |  | Direct workflow charter baseline reference to changelog |
| 2026-05-12 | `d893050` |  | Refresh documentation for side panel rail tabs |
| 2026-05-12 | `8539c68` |  | Clarify timeline rail icon |
| 2026-05-12 | `def4265` |  | Add timeline side panel tab |
| 2026-05-12 | `6a672d9` |  | Add export side panel tab |
| 2026-05-12 | `f1394c6` |  | Add data inputs side panel tab |
| 2026-05-12 | `5b38c4e` |  | Update shared panel rail icons |
| 2026-05-04 | `dcce703` |  | Style shared panel icon rail |
| 2026-05-04 | `2acdb91` |  | Remove obsolete side panel top tabs |
| 2026-05-04 | `6142817` |  | Anchor shared panel icon rail to panel shell |
| 2026-05-04 | `4653f20` |  | Remove obsolete audit documentation listings |
| 2026-05-04 | `8882b69` |  | Remove obsolete audit documentation references |
| 2026-05-04 | `06c1843` |  | Clean shared side panel source comments |
| 2026-05-04 | `f7407eb` |  | Refresh documentation for shared panel baseline |
| 2026-05-04 | `4a17d1c` |  | Make inspector panel content-only |
| 2026-05-04 | `b62c74b` |  | Use shared side panel shell |
| 2026-05-04 | `e41d8bc` |  | Split side panel open state from active tab |
| 2026-05-04 | `88b0c19` |  | Rename inspector panel shell for left dock |
| 2026-05-04 | `2126c9b` |  | Open inspector in left panel dock |
| 2026-05-04 | `f98b3e5` |  | Add panel mode switcher tabs |
| 2026-05-04 | `df4075a` |  | Move side panel toggles to left rail |
| 2026-05-04 | `17cf020` |  | Enforce single active side panel |
| 2026-05-04 | `0063145` |  | Use menu icon for inspector toggle |
| 2026-05-02 | `63003c1` |  | Group cluster inspector members by place |
| 2026-05-02 | `fed4b5b` |  | Use volume-based zoom-responsive cluster sizing |
| 2026-05-02 | `3187d05` |  | Increase dynamic node radius contrast |
| 2026-05-02 | `ed39e55` |  | Make cluster nodes open actionable inspector views |
| 2026-05-02 | `04eb8b5` |  | Refresh documentation for safe year-based baseline |
| 2026-05-02 | `57b946e` |  | Make timeline year-based |
| 2026-04-30 | `79d5ae1` |  | Remove show all dates shortcut |
| 2026-04-30 | `3fedd97` |  | Tighten minimum weight helper text |
| 2026-04-30 | `96064e2` |  | Set people as default view and simplify view buttons |
| 2026-04-30 | `fa486b8` |  | Remove orphaned panel helper functions |
| 2026-04-30 | `2d627e2` |  | Remove legacy inspector bodies from App |
| 2026-04-30 | `149315a` |  | Extract inspector node view |
| 2026-04-30 | `003fae1` |  | Split empty cluster and edge inspector views |
| 2026-04-30 | `c0a15fd` |  | Extract inspector shell and router |
| 2026-04-30 | `6a32004` |  | Harden inspector contract in place |
| 2026-04-30 | `86ad35f` |  | Extract left control panel component |
| 2026-04-30 | `113fb84` |  | Harden control panel contract in place |
| 2026-04-22 | `4236952` |  | Append full development history to changelog |
| 2026-04-22 | `391174a` |  | Refresh Peridot documentation for publication baseline |
| 2026-04-22 | `951b450` |  | Replace embedded sample data with current publication dataset |
| 2026-04-22 | `f859595` |  | Add itch.io HTML5 build packaging support |
| 2026-04-22 | `f959fac` |  | Use countries50m as the fixed basemap |
| 2026-04-21 | `b1fdbd5` |  | Update maintainer handoff documentation |
| 2026-04-21 | `dd12281` |  | Normalize summary panel spacing |
| 2026-04-21 | `4fdaf73` |  | Rename timeline panel heading |
| 2026-04-21 | `db5bb1f` |  | Tighten left panel organization |
| 2026-04-21 | `ba746b1` |  | Simplify theme panel text |
| 2026-04-21 | `c0fc600` | (tag: checkpoint-map-theme-c0fc600) | Retune active country fills for peridot and modern maps |
| 2026-04-21 | `56f0080` |  | Highlight countries containing visible nodes |
| 2026-04-21 | `5cbe9c3` |  | Refine early modern node hover and selected colors |
| 2026-04-21 | `850176f` |  | Refine hovered and selected node states |
| 2026-04-21 | `3e43dc9` |  | Add hovered node color feedback |
| 2026-04-21 | `919ea5f` |  | Increase green layering in peridot map theme |
| 2026-04-21 | `c666d29` |  | Add peridot default app theme |
| 2026-04-20 | `9be5f4a` |  | Tighten maintainer docs audit fixes |
| 2026-04-20 | `43403c3` |  | Restore detail to maintainer documentation |
| 2026-04-20 | `02ecb11` |  | Document inspector navigation feature set |
| 2026-04-20 | `5af819b` |  | Add inspector back navigation |
| 2026-04-20 | `b3e6fe8` |  | Add place navigation sections to person inspector |
| 2026-04-20 | `6772c1d` |  | Clarify connected correspondents count label |
| 2026-04-20 | `ab0e1fe` |  | Show relationship counts in connected correspondents buttons |
| 2026-04-20 | `06e0b3b` |  | Sort connected correspondents by relationship weight |
| 2026-04-20 | `17be829` |  | Add connected correspondents inspector navigation section |
| 2026-04-20 | `cfa6d63` |  | Add inspector selection plumbing for person and place detail targets |
| 2026-04-20 | `2b3c265` |  | Document person force layout and force-view background behavior |
| 2026-04-20 | `ffb5a30` |  | Hide map backdrop in force-directed person view |
| 2026-04-20 | `225c7e4` |  | Wire person force layout into App graph builder |
| 2026-04-20 | `3480858` |  | Add pre-settled d3-force person network layout |
| 2026-04-20 | `81a75d0` |  | Add d3-force dependency for person-network layout work |
| 2026-04-20 | `5a17721` |  | Replace README with current repository overview |
| 2026-04-20 | `8241ae1` |  | Add screenshots and standardize image paths |
| 2026-04-20 | `99584a9` |  | Document completed export behavior fixes |
| 2026-04-20 | `5575007` |  | Reflect visible date range in export metadata |
| 2026-04-20 | `c9f010e` |  | Fix PNG export color rendering |
| 2026-04-20 | `248833a` |  | Document completed timeline behavior fixes |
| 2026-04-20 | `1b2655e` |  | Preserve viewport during timeline playback interactions |
| 2026-04-20 | `fd0d77a` |  | Add viewport timeline reset audit |
| 2026-04-20 | `6c41fce` |  | Constrain timeline end date to selected start date |
| 2026-04-20 | `099882a` |  | Add control panel dependency map |
| 2026-04-20 | `a53ccbf` |  | Add maintainer comments for control panel architecture |
| 2026-04-20 | `c526e6c` |  | Document deferred export panel extraction |
| 2026-04-20 | `4ddf444` |  | Document deferred PNG export issue |
| 2026-04-20 | `5bbdad8` |  | Extract export helpers from App |
| 2026-04-20 | `897e06a` |  | Document step 2 timeline work and deferred follow-ups |
| 2026-04-20 | `383ecc0` | (tag: checkpoint-pre-step-2c) | Extract timeline playback panel from App |
| 2026-04-20 | `b2dbe35` |  | Extract timeline playback helpers from App |
| 2026-04-17 | `dad15a4` | (tag: checkpoint-between-step-1-and-step-2) | Update maintainer guide and add changelog |
| 2026-04-17 | `145cfc2` |  | Extract map interaction handlers from App |
| 2026-04-17 | `30e5b1b` |  | Extract interaction resolution helpers from App |
| 2026-04-17 | `181a63e` | (tag: checkpoint-pre-step-1c) | Extract map stage components from App |
| 2026-04-17 | `02dcfc4` |  | Extract pure map layout helpers from App |
| 2026-04-17 | `7742149` |  | Update README to reflect current app and workflow |
| 2026-04-17 | `c3f856f` |  | Add maintainer guide and project workflow charter |
| 2026-04-17 | `8e07339` |  | Use dark navy modern node labels with white outline |
| 2026-04-17 | `0791ffd` |  | Strengthen modern node label typography |
| 2026-04-17 | `100d3fb` |  | Refine modern theme colors and label contrast |
| 2026-04-17 | `b7e4749` |  | Use clean themed canvas for force-directed person view |
| 2026-04-17 | `f207a37` |  | Implement true force-directed person layout |
| 2026-04-17 | `e4f64c6` |  | Remove stray project folders from repo root |
| 2026-04-17 | `80bbb97` |  | Adjust shared edge multiplier to 5 |
| 2026-04-17 | `db38072` |  | Checkpoint before applying person scaling update |
| 2026-04-17 | `eb3ba4b` |  | Initial rebuilt app baseline |
