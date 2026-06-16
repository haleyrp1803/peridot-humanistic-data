# Changelog

## Current documented safe baseline

- **`68f99da` — `add some homepage assets`** on branch **`main`**

This baseline records the active D3/SVG Peridot path after the workspace-routing milestone, the completed dual-mode Inspector implementation cluster, the Home-style workspace visual pass, the expanded humanistic-data capability milestone, the visualization-workspace compression/navigation/export consolidation pass, the June 2026 structural cleanup/commenting pass, the Advanced Search / Explore consolidation milestone, the June 2026 theme/color consolidation work, the Analytics chart-layout and chart-theme milestone, the capability-wording cleanup, the map-export options/readability pass, and the fixed-ratio Peridot homepage redesign. The current app is workspace-first around a simplified product menu: **Manage Your Data**, **Visualize Your Data**, **Explore Your Data**, **Learn More about Peridot**, and **Themes and Accessibility**. Visualizations use a collapsible header, a bottom timeline scrubber, minimized map overlays, a dedicated large chart workspace, and in-place header export controls. Chart Visualizations now use a tabbed builder, quarter-width controls, a larger chart card, a shared three-quarter chart / one-quarter legend layout, complete simplified legends, anchored titles/subtitles, method labels, tighter canvas spacing, vertical Bar Chart default behavior, and theme-routed series colors. The curated 30-color Peridot chart library remains the default, but explicit **Charts** palette imports in Themes and Accessibility now override only chart series colors, including bars, histograms, heatmaps, grouped/stacked charts, lines, pies, and sunbursts. The standalone Export workspace route has been removed from the active app path. Explore Your Data opens Advanced Search directly from both the hamburger menu and the Visualizations header, while Advanced Search itself contains Build Search, Browse, Results, Refine / Inspect, and Capabilities tabs. Earlier milestones include direct Explore-to-Advanced-Search routing, a tabbed Advanced Search workspace, Inspector handoff from search results, dataset-wide browse indexes, structured criteria with AND / OR / EXCLUDING logic, capability and facet filtering, workbook import, role-based mapping, and the shift from correspondence-only import assumptions toward role-based humanistic-data mapping.
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

The current Advanced Search workflow is the main Explore Your Data surface. It uses a tabbed research-search layout with Build Search, Browse, Results, Refine / Inspect, and Capabilities tabs. It preserves draft/apply global filtering, current applied scope, predictive suggestions, route-place and route-people filters, year text inputs, minimum-weight filtering, capability filters, dataset-wide browse indexes for people/places/routes/evidence fields, result cards with Inspector handoff, result facets with counts, and structured criteria supporting AND, OR, and EXCLUDING logic. Analytics has chart controls, dynamic variable options, compact and expanded chart views, higher-contrast tooltips, and a dark green translucent expanded-view backdrop with the chart itself retained on a white/cream card.


The current interface/workspace workflow now provides:

- user-designed Peridot logo, gilded-logo, palette, and filigree assets in `assets/`;
- the Home workspace uses the gilded transparent Peridot logo variant and selected licensed Adobe Stock filigree as its visible title-card lockup;
- Home / welcome workspace with a single concise description sentence and **Use sample data** / **Upload your data** start paths;
- hamburger-triggered labeled menu replacing the persistent icon rail as the primary visible navigation surface;
- simplified hamburger stack: **Manage Your Data**, **Visualize Your Data**, **Explore Your Data**, **Learn More about Peridot**, and **Themes and Accessibility**;
- full-window workspaces for Data, Visualizations, Advanced Search, Learn More, Themes and Accessibility, and Inspector-compatible evidence review paths, with Explore Your Data routing directly into Advanced Search and Inspector remaining available through visualization/evidence workflows;
- Visualizations workspace containing Place Map, People Network, Force-Directed, Chart Visualizations, a collapsible visualization header, and a bottom timeline scrubber;
- Chart Visualizations redesigned as a large chart workspace with controls on the left and the chart canvas on the right;
- Chart Visualizations now use a tabbed builder with Chart, Fields, Categories, and Present tabs, plus an optional editable presentation title;
- Analytics chart rendering now reserves the left three-fourths of the chart card for chart marks and the right fourth for a complete simplified legend/summary column;
- chart titles/subtitles are anchored near the top of the card, bar charts default to vertical orientation, and dense chart canvases use reduced whitespace;
- chart export consolidated into the shared Visualizations header Export menu;
- map and network export consolidated into the same Visualizations header Export menu, replacing the standalone Export workspace route;
- map PNG export defaults to map-only output, with optional title text above the map and optional metadata below the map using Peridot typography;
- map legend and map controls minimized by default as bottom-corner buttons;
- Timeline implemented as a compact bottom Visualizations scrubber with dual range handles, playback controls, and collapse/expand behavior;
- Explore Your Data now routes directly to Advanced Search, which contains the data-exploration, capability-summary, Browse, Results, Refine / Inspect, and Inspector-adjacent evidence entry points;
- Learn More about Peridot placeholder workspace added for future project information, credits, tutorials, and help content;
- Theme reframed as **Themes and Accessibility**;
- Data workspace using the unified CSV/TSV/XLSX/XLS uploader;
- Inspector implemented as a dual-mode system: compact side-panel summaries for visualization clicks plus a full evidence-dossier workspace from Expand/linked-data navigation, sharing selection and history;
- capability-aware Visualizations menus grouping tools as Mapping Visualizations, Network Visualizations, Chart Visualizations, and Explore Your Data;
- unavailable-state explanations for visualization types that the active dataset cannot support;
- flexible chart variable controls for x-axis, y-axis/metric, grouping/series, aggregation, and selected wide numeric series;
- explicit Record count support for bar, grouped bar, stacked bar, line, multi-line, histogram, pie, sunburst, and heatmap charts;
- generic chart/evidence records accepted into the active dataset even when they have no map or network roles;
- evidence/analysis field inclusion controls using explicit Include and Ignore checkboxes, defaulting to Include.

Early MapLibre preview code has been removed from active `main`; the later `maplibre-native-geographic-view` experiment remains an archived branch experiment rather than part of the active implementation path.

---

## Current milestone notes

### Home title-card, map export options, branding assets, and capability wording milestone

- Updated the documented safe baseline to **`68f99da` — `add some homepage assets`**.
- Renamed the local source-of-truth folder in documentation to `C:\Users\haley\OneDrive\Desktop\Peridot\`.
- Updated the repository URL in documentation to `https://github.com/haleyrp1803/peridot-humanistic-data`.
- Redesigned the Home workspace as an informative-minimalist fixed-ratio title-card composition.
- Home now centers the app identity around the gilded transparent Peridot logo, a single concise sentence, and two CTAs: **Use sample data** and **Upload your data**.
- Moved detailed onboarding expectations out of Home and into the future **Learn More about Peridot** direction.
- Added and documented the homepage layout contract: the logo is the largest object, the sentence is second-level text, button labels are smallest, and the filigree frames the content without overlapping it.
- Added the selected licensed Adobe Stock filigree to the Home workspace as decorative framing.
- Tracked the larger licensed Adobe Stock filigree set as a future design-reference asset.
- Added homepage mockup and annotated mockup references so future homepage changes preserve the intended proportional layout.
- Added the current homepage screenshot reference for documentation.
- Added gilded Peridot logo variants and palette/design reference assets to `assets/`.
- Preserved `assets/Peridot Logo Workspace.psd` as an ignored local design source rather than a committed runtime/documentation asset.
- Finalized map PNG export options: default output is map-only, with no Peridot branding or extra text.
- Added optional map export title placement above the map image and optional metadata placement below the map image.
- Improved map export annotation readability with larger Peridot typography and tighter whitespace.
- Clarified Data/Advanced Search/Visualizations capability wording: internal capability diagnostics were removed from user-facing review; point and route map readiness language was combined/clarified where appropriate; unavailable visualization language now says the visualization is **not available** for the dataset rather than **limited**.
- Confirmed point/site datasets such as Alaskan Airfields do not incorrectly advertise relational route/network readiness when no source-target relationships are mapped.

### Peridot logo and home-workspace branding milestone

- Added the user-designed Peridot logo assets to `assets/` as `Peridot Logo.png` and `Peridot Logo Transparent.png`.
- Integrated the transparent-background logo into the Home workspace hero while preserving an accessible hidden `h1` for the app name.
- Documented the logo asset locations in README, Maintainer Guide, and Workflow Charter so future branding passes keep the app and documentation synchronized.

### Theme, visualization chrome, map palette, and Analytics chart layout/theme milestone

- Routed Inspector and related evidence surfaces through semantic theme roles so color changes are controlled from the central theme system rather than scattered component constants.
- Preserved the Peridot ornamental folio language while tightening visualization chrome, including header tabs, edge handles, map utility buttons, collapse/expand affordances, and chart control surfaces.
- Reworked the Visualizations header and Timeline collapse/expand controls as ornamental, high-layer edge controls so the buttons remain in front of map/chart surfaces and communicate direction without relying on text-heavy labels.
- Added dropdown/portal layering safeguards for chart and workspace menus so expanded menus do not fall behind visualization layers.
- Added a light navy sea map treatment, dark map frame, muted green land treatment, active-land olive emphasis, and label-density/collision polish.
- Added a finite 30-color Analytics chart series library sourced from the approved green, gold, blue, and pink palettes, with greens/golds dominant and blues/pinks used as supporting contrast. This remains the default chart palette rather than a hard lock.
- Documented the color/theming audit trail in `planning_documents`, including color centralization, theme palette, built-in palette, classic itch palette, theme-control, map-assignment, upload-guide, dropdown-portal, and ornamental-toggle audits.
- Refined the Chart Visualizations control rail, dropdown hover treatment, series contrast, and chart workspace surface colors.
- Defaulted Analytics ordered date charts to **Year**, with **Full date** available as an explicit higher-granularity option.
- Hardened chart derivation logic for record counts, part-to-whole charts, grouped bars, stacked bars, multi-line charts, histograms, heatmaps, and year/full-date handling.
- Fixed grouped bar and multi-line count buckets so grouped yearly values use real counts rather than presence/absence.
- Added manual category/series selection across chart types, with compatible settings preserved as users switch between charts.
- Added persistent chart summary panels for ranked values, segment totals, line totals, trend summaries, bin ranges, matrix combinations, slices/shares, and sunburst parent totals.
- Added stronger major and minor axis ticks/gridlines for axis-based charts and kept chart PNG export using the rendered SVG panel/axis system.
- Rebuilt the Analytics builder as a tabbed control surface with **Chart**, **Fields**, **Categories**, and **Present** tabs.
- Resized the builder/chart composition so controls occupy roughly one-quarter of the workspace and the chart area occupies roughly three-quarters.
- Added custom presentation-title support and kept generated chart titles available as the default reference.
- Improved bar labels, metric choices, and chart-method labeling so chart cards communicate axis/measure/hierarchy semantics without relying only on hover.
- Reworked chart-card geometry around a shared renderer layout: left three-fourths for chart marks, right fourth for complete simplified legend/summary rows.
- Removed folded “x more” legend behavior so legends represent every displayed item, then simplified each row to label/value to avoid metadata clutter.
- Tightened chart-card padding and anchored title/subtitle placement near the top of the card while preserving chart/legend scale.
- Restored Bar Chart default orientation to **Vertical**, while keeping horizontal orientation available.
- Scoped chart-targeted palette imports so **Charts** changes update `analytics.series` without recoloring app chrome.
- Routed remaining bar, histogram, and heatmap marks through the active chart series palette so every chart type responds to explicit chart-palette imports.
- Current implemented Analytics/theme baseline: **`e50ebf6` — `Scope chart palette imports to chart series`**.

### Advanced Search / Explore consolidation milestone

- Routed **Explore Your Data** directly to Advanced Search from both the hamburger menu and the Visualizations header.
- Moved the former "what this data can do" capability summary into a dedicated **Capabilities** tab inside Advanced Search.
- Reworked Search into a tabbed research workflow: **Build Search**, **Browse**, **Results**, **Refine / Inspect**, and **Capabilities**.
- Added result cards with compact record summaries, match explanations, capability badges, and full Inspector handoff.
- Added result facets with counts so users can refine current results by people/entities, places, routes, years, capabilities, and evidence fields.
- Added global capability filters for Inspector/map/route/network/timeline/evidence readiness and missing date/coordinate conditions.
- Added dataset-wide Browse indexes for People / Entities, Places, Routes, and Evidence Fields; Browse items fill draft search criteria and preserve the explicit Apply Filters workflow.
- Added structured criteria rows with predictive suggestions and an increased five-row cap.
- Added Boolean structured-search logic with user-facing connectors: first criterion starts the group, later criteria use **AND**, **OR**, or **EXCLUDING**.
- Preserved the core draft/apply model: typing, suggestions, Browse selections, facet selections, and structured criteria edits change draft state only until **Apply Filters** is pressed.
- Current implemented Advanced Search baseline: **`d52392a` — `Add capabilities tab to advanced search`**.

### Structural cleanup, commenting, and scope-contract milestone

- Added developer-orientation comments across the source tree so a new human developer can understand major sections, cross-file responsibilities, fragile compatibility paths, and non-obvious state coupling.
- Added `planning_documents/PERIDOT_CODE_STRUCTURE_AUDIT.md` as the standing structural audit and cleanup roadmap.
- Extracted embedded sample data from `App.jsx` into `src/peridotSampleData.js`.
- Reduced `src/LeftControlPanel.jsx` to the compact Inspector side-panel shell, removing obsolete rail/workflow content while preserving visualization-click Inspector behavior.
- Extracted column-mapping modal static UI configuration into `src/peridotColumnMappingUiConfig.js`.
- Extracted repeated column-mapping field controls into `src/PeridotMappingFieldControls.jsx`.
- Extracted evidence/analysis Include/Ignore controls into `src/PeridotEvidenceFieldControls.jsx`.
- Documented the Analytics chart-extension contract across config, derivation, rendering, panel, and visualization-header files.
- Removed dormant MapLibre preview files and dependency from active `main`.
- Documented the loaded/filter/timeline/playback/export scope pipeline and clamped chart-local date ranges so chart animation does not get stuck on stale time selections.
- Current implemented structural-cleanup baseline: **`fcd2e1f` — `Document timeline scope and clamp chart date range`**.

### Visualization workspace compression, menu simplification, timeline, and export consolidation milestone

- Redesigned Chart Visualizations from a compact chart-picker panel into a large chart workspace with controls on the left and a full-size chart canvas on the right.
- Removed the redundant chart-workspace header and scaled chart rendering so charts fit the available workspace without internal scrolling.
- Added a collapsible Visualizations header and a collapsible bottom Timeline bar, both starting expanded.
- Implemented the Timeline as a compact bottom scrubber inside Visualizations with dual range handles, playback controls, reset/all-dates controls, and playback position controls.
- Changed map legend and controls to start minimized as bottom-corner buttons that can be opened and minimized in place.
- Simplified the hamburger menu to **Manage Your Data**, **Visualize Your Data**, **Explore Your Data**, **Learn More about Peridot**, and **Themes and Accessibility**.
- Added `src/PeridotExploreWorkspace.jsx` for combined capability summary, Search access, and Inspector-adjacent evidence review.
- Added `src/PeridotLearnMoreWorkspace.jsx` as a placeholder for future project information, credits, tutorials, and help content.
- Reframed Theme as **Themes and Accessibility**.
- Moved map/network export actions into the Visualizations header Export menu.
- Moved chart PNG export out of the chart controls rail and into the same Visualizations header Export menu.
- Removed the obsolete standalone Export workspace route and deleted `src/PeridotExportWorkspace.jsx` from the active source tree.
- Current implemented visualization-workspace/export baseline: **`fcd2e1f` — `Document timeline scope and clamp chart date range`**.

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

- **`68f99da` — `add some homepage assets`** is the current documented `main` baseline and current head in the provided sync ritual.
- **`bb971a5` — `Redesign Peridot homepage`** implements the fixed-ratio Home title-card composition with the gilded logo, filigree framing, concise sentence, and two CTA buttons.
- **`e0d2399` — `Finalize map export options and ignore design source files`** finalizes map-only default PNG export, optional title/metadata annotations, and ignored design-source handling.
- **`499acc7` — `Improve map export annotation readability`** increases annotation readability and anchors title/metadata placement around the exported map image.
- **`d835953` — `Clarify capability and availability wording`** updates user-facing capability language across Data, Advanced Search, and Visualizations.
- **`97843c7` — `Refine capability wording for point datasets`** refines point/site dataset capability messages.
- **`7d2b888` — `Fix route capability wording for point datasets`** prevents point-only datasets from being described as route/relationship-ready.
- **`212fb4a` — `Track Peridot branding and palette assets`** tracks chart-color, palette-upload-guide, and related branding assets.
- **`72bcae7` — `Add Peridot logo branding assets`** adds the initial Peridot logo assets.
- **`954f553` — `Refresh documentation for analytics layout and theme milestone`** is the preceding documentation baseline after the analytics layout/theme pass.
- **`e50ebf6` — `Scope chart palette imports to chart series`** remains the current implemented chart-palette baseline.
- **`6334840` — `Route remaining analytics chart marks through theme series`**
- **`db2bea6` — `Anchor analytics chart titles and restore vertical bar default`**
- **`a1ce00a` — `Tighten analytics chart canvas spacing`**
- **`69ea23a` — `Simplify analytics legend rows`**
- **`b868bb3` — `Add analytics chart method labels`**
- **`b0a4b65` — `Improve analytics bar labels and metric options`**
- **`8b3ead9` — `Resize analytics builder for quarter-panel layout`**
- **`f9a74fd` — `Refine tabbed analytics builder proportions`**
- **`d7f10c9` — `Add tabbed analytics chart builder`**
- **`880cfff` — `Add manual analytics series selection`** adds manual category/series selection across chart types and preserves compatible settings while switching chart views.
- **`cd7dfff` — `Fix grouped chart count buckets`** corrects grouped bar and multi-line record-count buckets.
- **`699e33a` — `Default chart date axis to year`** makes Year the default ordered date axis while keeping Full date available.
- **`805f770` — `Harden analytics chart logic`** hardens chart derivation for grouped, stacked, part-to-whole, histogram, heatmap, and line/multi-line cases.
- **`8f55a47` — `Add finite chart color library`** adds the fixed Peridot chart series palette.
- **`7396864` — `Add light navy sea map treatment`** and the preceding theme/chrome commits rebalance map palette, visualization chrome, and theme-role routing.
- **`10f6e19` — `Polish analytics chart axes and summary panels`** is the prior documented Analytics baseline before the tabbed-builder, shared-layout, and chart-theme override milestone.
- **`3d296cb` — `Route Explore directly to advanced search`** routes Explore entry points from the hamburger menu and Visualizations header directly to Advanced Search.
- **`37f2755` — `Clarify structured search Boolean labels`** updates structured-search terminology to first criterion plus AND / OR / EXCLUDING connectors.
- **`13fd533` — `Add Boolean structured search criteria`** adds Boolean structured criteria logic.
- **`86952c8` — `Improve advanced search moss contrast`** improves Advanced Search visual hierarchy with moss-green card contrast.
- **`d7b0e2f` — `Add dataset-wide advanced search browse indexes`** adds Browse indexes for people/entities, places, routes, and evidence fields.
- **`8104739` — `Wire structured criteria filtering`** connects structured criteria to global filtering and match summaries.
- **`c8cbd5e` — `Add structured search suggestions`** adds predictive suggestions to structured criteria.
- **`e3c36e1` — `Condense advanced search results layout`** condenses the Results tab.
- **`a21bbd9` — `Refine advanced search layout and palette`** converts Advanced Search to a tabbed green layout.
- **`e12ed84` — `Add search facets and capability filters`** adds result facets and capability filters.
- **`4dc1bdf` — `Add search result Inspector handoff`** adds search result cards and Inspector handoff.
- **`2135c1b` — `Refresh documentation for structural cleanup milestone`** is the preceding documentation baseline after the structural-cleanup pass.
- **`fcd2e1f` — `Document timeline scope and clamp chart date range`** is the prior structural-cleanup baseline.
- **`84e6a4f` — `Add code structure audit planning document`** tracks the structural audit as a planning artifact.
- **`55a368c` — `Remove dormant MapLibre preview code`** removes the old MapLibre preview files and dependency from active `main`.
- **`876eb1d` — `Document Analytics chart extension contract`** records the coordinated chart-extension contract across Analytics files.
- **`0f712b5` — `Add extracted evidence field controls`** adds the extracted evidence/analysis Include/Ignore control component.
- **`338f204` — `Restore evidence action normalization helper`** fixes the evidence Include/Ignore action normalization after extraction.
- **`1fe9f82` — `Extract column mapping field controls`** extracts repeated mapping-table field controls from the large modal.
- **`ce7c092` — `Extract column mapping modal UI config`** extracts static mapping-modal step/group/label config.
- **`5e8e022` — `Reduce left control panel to compact Inspector shell`** removes obsolete side-panel content while preserving compact Inspector behavior.
- **`e8ec660` — `Extract embedded sample data from App`** moves bundled sample data out of `App.jsx`.
- **`133fd91` — `Add developer orientation comments across source`** adds the broad source-commenting pass.
- **`cfe8207` — `Refresh documentation for visualization workspace consolidation`** documents the visualization workspace consolidation baseline.
- **`43fa09d` — `Remove obsolete export workspace route`** removed the standalone Export workspace route.
- **`aca8f1f` — `Update visualization export wiring`** completes the App-level wiring for header-based visualization export.
- **`b6eb7c0` — `Move chart export into visualization header`** consolidates chart PNG export into the shared Visualizations header Export menu.
- **`0b0cacd` — `Simplify hamburger menu and add Explore workspace`** adds the simplified product navigation, Explore workspace, Learn More workspace, and Themes and Accessibility framing.
- **`47aaa03` — `Remove redundant chart workspace header`** removes duplicate chart workspace chrome.
- **`675a655` — `Fit charts to workspace and minimize map overlays`** scales charts to the available workspace and starts map overlays minimized.
- **`b10a68b` — `Compact visualization header and timeline controls`** adds collapsible header/timeline controls and the compact dual-handle timeline layout.
- **`b0d83fb` — `Simplify chart workspace and add bottom timeline scrubber`** introduces the large chart workspace and bottom Visualizations timeline scrubber.
- **`7fcb348` — `Document flexible data and chart capability milestone`** documented the preceding flexible data/chart capability milestone.
- Earlier commit history remains preserved in the full development history table below.

## Deferred / rolled-back work

### MapLibre migrated-overlay work paused / active preview removed

The later MapLibre migrated-overlay branch is paused and should be retained as an archived experiment, not treated as active `main` code. The old dormant MapLibre preview files and dependency have now been removed from active `main` in `55a368c`.

If MapLibre is revisited later, start from a fresh branch/source-of-truth audit and reintroduce any needed dependencies intentionally. Do not assume the experimental branch can be merged wholesale.

### Force-Directed fallback issue on MapLibre experiment

During the later MapLibre experiment, Force-Directed was intended to bypass MapLibre and use the legacy D3/SVG force-directed view. That routing was partly established, but the force view still blanked after briefly rendering. Several speculative sizing fixes were rolled back, and the branch was set aside. Future work should diagnose the legacy force-render path directly before attempting new fixes.

### Shared-panel prop rename attempt, after `4a17d1c`

A cleanup attempt was made to rename the old `showLeftSidebar` / `showRightSidebar` compatibility prop path to newer shared-panel naming. This was rolled back because it broke Inspector auto-open behavior when clicking nodes, edges, or clusters.

Future work should treat this path as fragile. If the old names are renamed later, the pass must explicitly test node click, edge click, cluster click, contained cluster-member click, and Back behavior.

### Panel responsive sizing attempt, after `b62c74b`

A responsive panel-sizing experiment attempted to make the shared side panel absolutely positioned at all viewport sizes. It was rolled back because it disrupted the full-size landscape layout and forced scrolling before the map. Future responsive-panel work should be designed as a narrow-window override rather than a universal positioning replacement.

---

# Full development history

This is the single authoritative place in the documentation for the cumulative commit trajectory. The table below is transcribed from the full commit log provided across documentation passes, newest first. The newest rows reflect the sync ritual ending at `e50ebf6`.

| Date | Commit | Message | Branch/tag decoration |
|---|---|---|---|
| 2026-06-16 | `68f99da` | add some homepage assets | (HEAD -> main, origin/main, origin/HEAD) |
| 2026-06-16 | `bb971a5` | Redesign Peridot homepage |  |
| 2026-06-16 | `e0d2399` | Finalize map export options and ignore design source files |  |
| 2026-06-16 | `499acc7` | Improve map export annotation readability |  |
| 2026-06-16 | `d835953` | Clarify capability and availability wording |  |
| 2026-06-16 | `97843c7` | Refine capability wording for point datasets |  |
| 2026-06-16 | `7d2b888` | Fix route capability wording for point datasets |  |
| 2026-06-16 | `212fb4a` | Track Peridot branding and palette assets |  |
| 2026-06-16 | `72bcae7` | Add Peridot logo branding assets |  |
| 2026-06-13 | `954f553` | Refresh documentation for analytics layout and theme milestone |  |
| 2026-06-13 | `e50ebf6` | Scope chart palette imports to chart series | (HEAD -> main, origin/main, origin/HEAD) |
| 2026-06-13 | `6334840` | Route remaining analytics chart marks through theme series |  |
| 2026-06-13 | `db2bea6` | Anchor analytics chart titles and restore vertical bar default |  |
| 2026-06-13 | `a1ce00a` | Tighten analytics chart canvas spacing |  |
| 2026-06-13 | `69ea23a` | Simplify analytics legend rows |  |
| 2026-06-13 | `b868bb3` | Add analytics chart method labels |  |
| 2026-06-13 | `b0a4b65` | Improve analytics bar labels and metric options |  |
| 2026-06-12 | `8b3ead9` | Resize analytics builder for quarter-panel layout |  |
| 2026-06-12 | `f9a74fd` | Refine tabbed analytics builder proportions |  |
| 2026-06-12 | `d7f10c9` | Add tabbed analytics chart builder |  |
| 2026-06-12 | `e712102` | Refresh documentation for chart and theme milestones |  |
| 2026-06-12 | `f143de6` | Refresh documentation for chart and theme milestones |  |
| 2026-06-12 | `10f6e19` | Polish analytics chart axes and summary panels |  |
| 2026-06-12 | `880cfff` | Add manual analytics series selection |  |
| 2026-06-12 | `cd7dfff` | Fix grouped chart count buckets |  |
| 2026-06-12 | `699e33a` | Default chart date axis to year |  |
| 2026-06-12 | `805f770` | Harden analytics chart logic |  |
| 2026-06-12 | `8f55a47` | Add finite chart color library |  |
| 2026-06-12 | `5e895ad` | Refine chart dropdown and series contrast |  |
| 2026-06-12 | `ab6dc8b` | Refine chart workspace controls and colors |  |
| 2026-06-12 | `2e57f42` | Compact chart controls sidebar |  |
| 2026-06-12 | `c5ff6c6` | Polish chart controls sidebar |  |
| 2026-06-11 | `7396864` | Add light navy sea map treatment |  |
| 2026-06-11 | `aba420e` | Rebalance map palette and label density |  |
| 2026-06-11 | `cc21008` | Polish visualization header tabs |  |
| 2026-06-11 | `15985bf` | Improve visualization edge handles and map utility buttons |  |
| 2026-06-11 | `cb26bdf` | Refine visualization bar toggle ornament |  |
| 2026-06-11 | `e643a16` | Route Inspector colors through theme roles |  |
| 2026-06-11 | `790ec66` | Clean up theming design audit files |  |
| 2026-06-11 | `81dd7af` | Apply upload guide color direction and dropdown layering |  |
| 2026-06-11 | `aa00efb` | Apply upload guide design direction |  |
| 2026-06-11 | `0a686fe` | Add built-in Peridot palette presets |  |
| 2026-06-11 | `4747639` | Anchor imported palettes to darkest and lightest roles |  |
| 2026-06-11 | `ee4f75e` | Route whole-app palette imports through foundation tones |  |
| 2026-06-11 | `1ba1682` | Improve palette image swatch detection |  |
| 2026-06-11 | `e35ab68` | Add image palette import by theme area |  |
| 2026-06-11 | `6e8dfa6` | Add palette role dashboard |  |
| 2026-06-11 | `fed7d2e` | Add semantic palette system and theme toggle |  |
| 2026-06-11 | `034ec67` | Centralize explicit color palette values |  |
| 2026-06-10 | `d52392a` | Add capabilities tab to advanced search | (HEAD -> main, origin/main, origin/HEAD) |
| 2026-06-10 | `3d296cb` | Route Explore directly to advanced search |  |
| 2026-06-10 | `37f2755` | Clarify structured search Boolean labels |  |
| 2026-06-10 | `13fd533` | Add Boolean structured search criteria |  |
| 2026-06-10 | `86952c8` | Improve advanced search moss contrast |  |
| 2026-06-10 | `d7b0e2f` | Add dataset-wide advanced search browse indexes |  |
| 2026-06-10 | `8104739` | Wire structured criteria filtering |  |
| 2026-06-10 | `c8cbd5e` | Add structured search suggestions |  |
| 2026-06-10 | `e3c36e1` | Condense advanced search results layout |  |
| 2026-06-10 | `a21bbd9` | Refine advanced search layout and palette |  |
| 2026-06-10 | `e12ed84` | Add search facets and capability filters |  |
| 2026-06-10 | `4dc1bdf` | Add search result Inspector handoff |  |
| 2026-06-10 | `2135c1b` | Refresh documentation for structural cleanup milestone |  |
| 2026-06-06 | `fcd2e1f` | Document timeline scope and clamp chart date range |  |
| 2026-06-06 | `84e6a4f` | Add code structure audit planning document |  |
| 2026-06-06 | `55a368c` | Remove dormant MapLibre preview code |  |
| 2026-06-06 | `876eb1d` | Document Analytics chart extension contract |  |
| 2026-06-06 | `0f712b5` | Add extracted evidence field controls |  |
| 2026-06-06 | `338f204` | Restore evidence action normalization helper |  |
| 2026-06-06 | `1fe9f82` | Extract column mapping field controls |  |
| 2026-06-06 | `ce7c092` | Extract column mapping modal UI config |  |
| 2026-06-06 | `5e8e022` | Reduce left control panel to compact Inspector shell |  |
| 2026-06-06 | `e8ec660` | Extract embedded sample data from App |  |
| 2026-06-06 | `133fd91` | Add developer orientation comments across source |  |
| 2026-06-06 | `cfe8207` | Refresh documentation for visualization workspace consolidation |  |
| 2026-06-06 | `43fa09d` | Remove obsolete export workspace route | (HEAD -> main, origin/main, origin/HEAD) |
| 2026-06-06 | `aca8f1f` | Update visualization export wiring |  |
| 2026-06-06 | `b6eb7c0` | Move chart export into visualization header |  |
| 2026-06-06 | `0b0cacd` | Simplify hamburger menu and add Explore workspace |  |
| 2026-06-06 | `47aaa03` | Remove redundant chart workspace header |  |
| 2026-06-06 | `675a655` | Fit charts to workspace and minimize map overlays |  |
| 2026-06-06 | `b10a68b` | Compact visualization header and timeline controls |  |
| 2026-06-06 | `b0d83fb` | Simplify chart workspace and add bottom timeline scrubber |  |
| 2026-06-06 | `7fcb348` | Document flexible data and chart capability milestone |  |
| 2026-06-06 | `08b628b` | Use include and ignore checkboxes for evidence fields | (HEAD -> main, origin/main, origin/HEAD) |
| 2026-06-06 | `231ccde` | Accept generic chart records |  |
| 2026-06-06 | `b19019e` | Generalize user-facing language beyond correspondence |  |
| 2026-06-06 | `ab7affa` | Clean up flexible Analytics chart controls |  |
| 2026-06-06 | `ec6a70e` | Support record-count sunburst charts |  |
| 2026-06-06 | `596b958` | Support record-count histograms |  |
| 2026-06-06 | `b2dcde5` | Add flexible Analytics chart variables |  |
| 2026-06-06 | `6d0b37c` | Wire visualization availability state |  |
| 2026-06-06 | `b273a27` | Make visualization menu hover more forgiving |  |
| 2026-06-06 | `aae209a` | Document data capability mapping milestone |  |
| 2026-06-06 | `e7c3b57` | Add point-location role mapping |  |
| 2026-06-06 | `85f3d46` | Move data capability audit to mapping review |  |
| 2026-06-06 | `eef9cfe` | Show read-only data capability summaries |  |
| 2026-06-06 | `1889b95` | Add data capability audit helper |  |
| 2026-06-06 | `bfc8872` | Add Peridot data capability model plan |  |
| 2026-06-05 | `4f280a0` | Use gold accent for workspace button hover states |  |
| 2026-06-05 | `737a970` | Apply Home-style visual system to full workspaces |  |
| 2026-06-05 | `c0ea2ab` | Refine Home workspace layout and menu access |  |
| 2026-06-05 | `a9a25f1` | Remove Home navigation from active workspaces |  |
| 2026-06-05 | `88ab302` | Refine Home workspace card styling |  |
| 2026-06-04 | `b24e19a` | Link Inspector directed route rows |  |
| 2026-06-04 | `ed0f2c7` | Make compact Inspector summary tiles open workspace |  |
| 2026-06-04 | `ace7f52` | Fix linked letter person and place navigation |  |
| 2026-06-04 | `0a1b57a` | Link letter detail people and places |  |
| 2026-06-04 | `6f67ac7` | Move linked letters into Inspector history |  |
| 2026-06-04 | `6c38fac` | Open Inspector person and place links in workspace |  |
| 2026-06-04 | `6994b35` | Reduce compact Inspector content |  |
| 2026-06-04 | `f2336f8` | Apply Inspector shell palette refinements |  |
| 2026-06-04 | `45d1c8b` | Adjust Inspector clickable object palette |  |
| 2026-06-04 | `e02a4a3` | Refine dual-mode Inspector visual treatment |  |
| 2026-06-04 | `224bf5d` | Refine dual-mode Inspector close and expand behavior |  |
| 2026-06-04 | `7a9e310` | Route menu Inspector away from compact panel |  |
| 2026-06-04 | `99c0b99` | Track compact Inspector presentation mode |  |
| 2026-06-04 | `c2808ce` | Add inert Inspector presentation mode state |  |
| 2026-06-04 | `aa90665` | Organize project documentation |  |
| 2026-06-04 | `3377274` | Prepare shared Inspector content boundary |  |
| 2026-06-04 | `b7e3edd` | Add Inspector workspace design contract |  |
| 2026-06-04 | `b47fda2` | Refresh documentation for workspace routing milestone |  |
| 2026-06-02 | `55fae50` | Update routing contract after workspace promotions |  |
| 2026-06-02 | `82178c5` | Promote Search to full workspace |  |
| 2026-06-02 | `2c53796` | Promote Export to full workspace |  |
| 2026-06-02 | `8fc96b3` | Extract Peridot workspace config |  |
| 2026-06-02 | `9cd3f3f` | Clean workspace routing comments |  |
| 2026-06-02 | `9240745` | Fix Visualizations workspace export |  |
| 2026-06-02 | `25fc046` | Extract Peridot visualizations workspace |  |
| 2026-06-02 | `fcf6bb6` | Extract Peridot data workspace |  |
| 2026-06-02 | `9428766` | Extract Peridot theme workspace |  |
| 2026-06-02 | `18c2912` | Extract Peridot home workspace |  |
| 2026-06-02 | `6c16403` | Extract Peridot hamburger menu |  |
| 2026-06-02 | `30b114b` | Add Peridot routing contract audit |  |
| 2026-06-02 | `8384dee` | Fit Analytics workspace preview |  |
| 2026-06-02 | `7a8ed7d` | Compact Visualizations workspace controls |  |
| 2026-06-02 | `9b67d28` | Move Theme to full workspace |  |
| 2026-06-02 | `bb0c0ed` | Refine hamburger menu visual layout |  |
| 2026-06-02 | `2336915` | Route mapped imports to visualization workspace |  |
| 2026-06-02 | `576bb72` | Fix visualization workspace viewport initialization |  |
| 2026-06-02 | `56f2a49` | Add internal workspace state model |  |
| 2026-06-02 | `b42f6fd` | Add Peridot interface redesign plan |  |
| 2026-06-02 | `10017ec` | Document workbook import and Inspector profile milestone |  |
| 2026-06-02 | `0f72182` | Remove redundant Inspector correspondents summary row |  |
| 2026-06-02 | `8564e33` | Fix place profiles and split directed route summaries |  |
| 2026-06-02 | `b1ef30a` | Refine Inspector profile relationship sections |  |
| 2026-06-02 | `d9f0090` | Improve Inspector person place profiles and linked letter navigation |  |
| 2026-06-02 | `9c8971b` | Display custom Inspector fields in linked letters |  |
| 2026-06-02 | `5f25322` | Select custom Inspector fields from joined workbook sheets |  |
| 2026-06-02 | `964ce57` | Import multi-sheet workbooks by unique ID joins |  |
| 2026-06-02 | `ac31c38` | Configure workbook sheet joins by unique ID |  |
| 2026-06-02 | `77b1575` | Preview multi-sheet workbook mapping |  |
| 2026-06-02 | `2a800b3` | Add Peridot workbook mapping model helper |  |
| 2026-06-02 | `dd22abc` | Stabilize multi-sheet workbook staging |  |
| 2026-06-02 | `f503df6` | Refresh documentation with full commit history |  |
| 2026-06-02 | `4d11cb3` | Add Peridot workbook parsing helper |  |
| 2026-06-02 | `212d689` | Clarify column mapping cancel and import actions |  |
| 2026-06-02 | `d270c9d` | Import mapped arbitrary CSV and TSV data |  |
| 2026-06-02 | `a058730` | Add Peridot column mapping workspace |  |
| 2026-06-02 | `a4062ba` | Stage arbitrary CSV and TSV column mapping uploads |  |
| 2026-06-02 | `bba50e1` | Add Peridot column mapping helper |  |
| 2026-06-02 | `f432ccc` | Remove legacy three-file upload workflow |  |
| 2026-06-02 | `44d2042` | Document single Peridot CSV upload workflow |  |
| 2026-06-02 | `930c807` | Persist Peridot upload summary in Data Inputs |  |
| 2026-06-02 | `cbc35d0` | Add single Peridot CSV upload workflow |  |
| 2026-06-01 | `61f3c4b` | Add Peridot CSV validation summary helper |  |
| 2026-06-01 | `3d5fb79` | Add Peridot CSV template normalizer |  |
| 2026-06-01 | `8e7a8a4` | Add Peridot CSV schema contract |  |
| 2026-05-23 | `9453232` | Document Search and Filter layout and Analytics polish |  |
| 2026-05-23 | `bdd0843` | Refine expanded analytics backdrop contrast |  |
| 2026-05-23 | `64d44f2` | Improve analytics tooltip contrast |  |
| 2026-05-23 | `e02c1de` | Move filter status above action buttons |  |
| 2026-05-23 | `8bfd422` | Refine compact Search and Filter layout |  |
| 2026-05-23 | `b2147bb` | Consolidate Search and Filter layout |  |
| 2026-05-23 | `1ae3f03` | Document Search and Filter milestone |  |
| 2026-05-23 | `01de3d8` | Show filter update status before applying changes |  |
| 2026-05-23 | `c98c242` | Split route filters by place and people |  |
| 2026-05-23 | `1578d10` | Add route filter |  |
| 2026-05-23 | `ea19fc8` | Improve predictive suggestion menu scrolling |  |
| 2026-05-23 | `9c179f7` | Add predictive suggestions for person and place filters |  |
| 2026-05-23 | `cc26530` | Add person and place filters |  |
| 2026-05-23 | `019acef` | Add clear filters and reset playback on apply |  |
| 2026-05-23 | `d5e7667` | Apply Search and Filter changes on request |  |
| 2026-05-23 | `8912b8f` | Strengthen full-file review workflow rule |  |
| 2026-05-23 | `b348f12` | Move date range controls into Search and Filter |  |
| 2026-05-23 | `a890b13` | Move minimum weight filter into Search and Filter |  |
| 2026-05-23 | `e6b477d` | Add Search and Filter panel shell |  |
| 2026-05-23 | `2eb3461` | Document Search and Filter panel contract |  |
| 2026-05-23 | `9d24fbf` | Document Analytics feature milestone |  |
| 2026-05-23 | `3352403` | Fix Analytics expanded overlay and variable options |  |
| 2026-05-23 | `4b631be` | Refine Analytics variables and expanded chart overlay |  |
| 2026-05-23 | `416dced` | Refine Analytics chart icons and expanded view |  |
| 2026-05-23 | `2320bfe` | Expand Analytics chart controls |  |
| 2026-05-23 | `961bf45` | Clarify Analytics chart variable controls |  |
| 2026-05-23 | `4b90e4e` | Add additional Analytics chart types |  |
| 2026-05-23 | `caddd3c` | Refine Analytics chart panel interactions |  |
| 2026-05-23 | `04d95a7` | Add Analytics side panel charts |  |
| 2026-05-14 | `b5dc2b5` | Document legacy continuation after pausing MapLibre work |  |
| 2026-05-14 | `2d76839` | Fix linked letter encoding display | (tag: checkpoint-maplibre-migrated-overlay-paused, origin/maplibre-native-geographic-view, maplibre-native-geographic-view) |
| 2026-05-14 | `2c0be03` | Make MapLibre people view and force-directed fallback work |  |
| 2026-05-14 | `5762d0e` | Refresh documentation for MapLibre migrated overlay milestone |  |
| 2026-05-14 | `268b18c` | Add MapLibre hover feedback |  |
| 2026-05-14 | `8137db7` | Curve MapLibre aggregated routes |  |
| 2026-05-13 | `c0a4b8a` | Restore MapLibre migrated overlay after extraction regression |  |
| 2026-05-13 | `dd148e1` | Extract MapLibre cluster and aggregate IDs |  |
| 2026-05-13 | `57d3cc1` | Add MapLibre cluster count labels |  |
| 2026-05-13 | `c7da28c` | Add MapLibre cluster selection feedback |  |
| 2026-05-13 | `2ccaaeb` | Show MapLibre aggregated route details in inspector |  |
| 2026-05-13 | `084ce9d` | Enrich MapLibre aggregated route inspector payload |  |
| 2026-05-13 | `526534a` | Aggregate MapLibre routes between visible endpoints |  |
| 2026-05-13 | `8a563cc` | Hide MapLibre cluster member nodes |  |
| 2026-05-13 | `be7d9ae` | Route MapLibre cluster clicks to inspector |  |
| 2026-05-13 | `1e8456f` | Add dynamic MapLibre cluster diagnostic |  |
| 2026-05-13 | `bb11f6a` | Add static MapLibre cluster lifecycle diagnostic |  |
| 2026-05-13 | `3f26cc2` | Broaden MapLibre lifecycle diagnostics |  |
| 2026-05-13 | `3646cc6` | Refresh documentation for MapLibre native branch handoff |  |
| 2026-05-13 | `4c9ed6f` | Extract MapLibre layer configuration |  |
| 2026-05-13 | `c420a5d` | Extract MapLibre feature builders |  |
| 2026-05-13 | `b7fb244` | Add MapLibre native geographic view plan |  |
| 2026-05-13 | `10051c0` | Add MapLibre selected filter layers | (tag: checkpoint-maplibre-preview-prototype) |
| 2026-05-13 | `b7c61a2` | Add MapLibre route hit layer |  |
| 2026-05-13 | `f2fdcf9` | Add cursor-only MapLibre hover detection |  |
| 2026-05-13 | `5f3f053` | Route MapLibre feature clicks to inspector |  |
| 2026-05-13 | `2597462` | Remove MapLibre SVG node probe overlay |  |
| 2026-05-13 | `7eebdee` | Add simple MapLibre node layer probe |  |
| 2026-05-13 | `1f0d322` | Render MapLibre route probes as GeoJSON layer |  |
| 2026-05-13 | `443d7ac` | Add MapLibre route projection probe |  |
| 2026-05-12 | `6096069` | Add MapLibre projection probe |  |
| 2026-05-12 | `33afaae` | Add MapLibre preview diagnostics |  |
| 2026-05-12 | `da1463f` | Add MapLibre workspace preview path |  |
| 2026-05-12 | `93f0961` | Add isolated MapLibre map stage |  |
| 2026-05-12 | `1d816a5` | Add MapLibre hybrid map-system audit |  |
| 2026-05-12 | `4e08720` | Direct workflow charter baseline reference to changelog |  |
| 2026-05-12 | `d893050` | Refresh documentation for side panel rail tabs |  |
| 2026-05-12 | `8539c68` | Clarify timeline rail icon |  |
| 2026-05-12 | `def4265` | Add timeline side panel tab |  |
| 2026-05-12 | `6a672d9` | Add export side panel tab |  |
| 2026-05-12 | `f1394c6` | Add data inputs side panel tab |  |
| 2026-05-12 | `5b38c4e` | Update shared panel rail icons |  |
| 2026-05-04 | `dcce703` | Style shared panel icon rail |  |
| 2026-05-04 | `2acdb91` | Remove obsolete side panel top tabs |  |
| 2026-05-04 | `6142817` | Anchor shared panel icon rail to panel shell |  |
| 2026-05-04 | `4653f20` | Remove obsolete audit documentation listings |  |
| 2026-05-04 | `8882b69` | Remove obsolete audit documentation references |  |
| 2026-05-04 | `06c1843` | Clean shared side panel source comments |  |
| 2026-05-04 | `f7407eb` | Refresh documentation for shared panel baseline |  |
| 2026-05-04 | `4a17d1c` | Make inspector panel content-only |  |
| 2026-05-04 | `b62c74b` | Use shared side panel shell |  |
| 2026-05-04 | `e41d8bc` | Split side panel open state from active tab |  |
| 2026-05-04 | `88b0c19` | Rename inspector panel shell for left dock |  |
| 2026-05-04 | `2126c9b` | Open inspector in left panel dock |  |
| 2026-05-04 | `f98b3e5` | Add panel mode switcher tabs |  |
| 2026-05-04 | `df4075a` | Move side panel toggles to left rail |  |
| 2026-05-04 | `17cf020` | Enforce single active side panel |  |
| 2026-05-04 | `0063145` | Use menu icon for inspector toggle |  |
| 2026-05-02 | `63003c1` | Group cluster inspector members by place |  |
| 2026-05-02 | `fed4b5b` | Use volume-based zoom-responsive cluster sizing |  |
| 2026-05-02 | `3187d05` | Increase dynamic node radius contrast |  |
| 2026-05-02 | `ed39e55` | Make cluster nodes open actionable inspector views |  |
| 2026-05-02 | `04eb8b5` | Refresh documentation for safe year-based baseline |  |
| 2026-05-02 | `57b946e` | Make timeline year-based |  |
| 2026-04-30 | `79d5ae1` | Remove show all dates shortcut |  |
| 2026-04-30 | `3fedd97` | Tighten minimum weight helper text |  |
| 2026-04-30 | `96064e2` | Set people as default view and simplify view buttons |  |
| 2026-04-30 | `fa486b8` | Remove orphaned panel helper functions |  |
| 2026-04-30 | `2d627e2` | Remove legacy inspector bodies from App |  |
| 2026-04-30 | `149315a` | Extract inspector node view |  |
| 2026-04-30 | `003fae1` | Split empty cluster and edge inspector views |  |
| 2026-04-30 | `c0a15fd` | Extract inspector shell and router |  |
| 2026-04-30 | `6a32004` | Harden inspector contract in place |  |
| 2026-04-30 | `86ad35f` | Extract left control panel component |  |
| 2026-04-30 | `113fb84` | Harden control panel contract in place |  |
| 2026-04-22 | `4236952` | Append full development history to changelog |  |
| 2026-04-22 | `391174a` | Refresh Peridot documentation for publication baseline |  |
| 2026-04-22 | `951b450` | Replace embedded sample data with current publication dataset |  |
| 2026-04-22 | `f859595` | Add itch.io HTML5 build packaging support |  |
| 2026-04-22 | `f959fac` | Use countries50m as the fixed basemap |  |
| 2026-04-21 | `b1fdbd5` | Update maintainer handoff documentation |  |
| 2026-04-21 | `dd12281` | Normalize summary panel spacing |  |
| 2026-04-21 | `4fdaf73` | Rename timeline panel heading |  |
| 2026-04-21 | `db5bb1f` | Tighten left panel organization |  |
| 2026-04-21 | `ba746b1` | Simplify theme panel text |  |
| 2026-04-21 | `c0fc600` | Retune active country fills for peridot and modern maps | (tag: checkpoint-map-theme-c0fc600) |
| 2026-04-21 | `56f0080` | Highlight countries containing visible nodes |  |
| 2026-04-21 | `5cbe9c3` | Refine early modern node hover and selected colors |  |
| 2026-04-21 | `850176f` | Refine hovered and selected node states |  |
| 2026-04-21 | `3e43dc9` | Add hovered node color feedback |  |
| 2026-04-21 | `919ea5f` | Increase green layering in peridot map theme |  |
| 2026-04-21 | `c666d29` | Add peridot default app theme |  |
| 2026-04-20 | `9be5f4a` | Tighten maintainer docs audit fixes |  |
| 2026-04-20 | `43403c3` | Restore detail to maintainer documentation |  |
| 2026-04-20 | `02ecb11` | Document inspector navigation feature set |  |
| 2026-04-20 | `5af819b` | Add inspector back navigation |  |
| 2026-04-20 | `b3e6fe8` | Add place navigation sections to person inspector |  |
| 2026-04-20 | `6772c1d` | Clarify connected correspondents count label |  |
| 2026-04-20 | `ab0e1fe` | Show relationship counts in connected correspondents buttons |  |
| 2026-04-20 | `06e0b3b` | Sort connected correspondents by relationship weight |  |
| 2026-04-20 | `17be829` | Add connected correspondents inspector navigation section |  |
| 2026-04-20 | `cfa6d63` | Add inspector selection plumbing for person and place detail targets |  |
| 2026-04-20 | `2b3c265` | Document person force layout and force-view background behavior |  |
| 2026-04-20 | `ffb5a30` | Hide map backdrop in force-directed person view |  |
| 2026-04-20 | `225c7e4` | Wire person force layout into App graph builder |  |
| 2026-04-20 | `3480858` | Add pre-settled d3-force person network layout |  |
| 2026-04-20 | `81a75d0` | Add d3-force dependency for person-network layout work |  |
| 2026-04-20 | `5a17721` | Replace README with current repository overview |  |
| 2026-04-20 | `8241ae1` | Add screenshots and standardize image paths |  |
| 2026-04-20 | `99584a9` | Document completed export behavior fixes |  |
| 2026-04-20 | `5575007` | Reflect visible date range in export metadata |  |
| 2026-04-20 | `c9f010e` | Fix PNG export color rendering |  |
| 2026-04-20 | `248833a` | Document completed timeline behavior fixes |  |
| 2026-04-20 | `1b2655e` | Preserve viewport during timeline playback interactions |  |
| 2026-04-20 | `fd0d77a` | Add viewport timeline reset audit |  |
| 2026-04-20 | `6c41fce` | Constrain timeline end date to selected start date |  |
| 2026-04-20 | `099882a` | Add control panel dependency map |  |
| 2026-04-20 | `a53ccbf` | Add maintainer comments for control panel architecture |  |
| 2026-04-20 | `c526e6c` | Document deferred export panel extraction |  |
| 2026-04-20 | `4ddf444` | Document deferred PNG export issue |  |
| 2026-04-20 | `5bbdad8` | Extract export helpers from App |  |
| 2026-04-20 | `897e06a` | Document step 2 timeline work and deferred follow-ups |  |
| 2026-04-20 | `383ecc0` | Extract timeline playback panel from App | (tag: checkpoint-pre-step-2c) |
| 2026-04-20 | `b2dbe35` | Extract timeline playback helpers from App |  |
| 2026-04-17 | `dad15a4` | Update maintainer guide and add changelog | (tag: checkpoint-between-step-1-and-step-2) |
| 2026-04-17 | `145cfc2` | Extract map interaction handlers from App |  |
| 2026-04-17 | `30e5b1b` | Extract interaction resolution helpers from App |  |
| 2026-04-17 | `181a63e` | Extract map stage components from App | (tag: checkpoint-pre-step-1c) |
| 2026-04-17 | `02dcfc4` | Extract pure map layout helpers from App |  |
| 2026-04-17 | `7742149` | Update README to reflect current app and workflow |  |
| 2026-04-17 | `c3f856f` | Add maintainer guide and project workflow charter |  |
| 2026-04-17 | `8e07339` | Use dark navy modern node labels with white outline |  |
| 2026-04-17 | `0791ffd` | Strengthen modern node label typography |  |
| 2026-04-17 | `100d3fb` | Refine modern theme colors and label contrast |  |
| 2026-04-17 | `b7e4749` | Use clean themed canvas for force-directed person view |  |
| 2026-04-17 | `f207a37` | Implement true force-directed person layout |  |
| 2026-04-17 | `e4f64c6` | Remove stray project folders from repo root |  |
| 2026-04-17 | `80bbb97` | Adjust shared edge multiplier to 5 |  |
| 2026-04-17 | `db38072` | Checkpoint before applying person scaling update |  |
| 2026-04-17 | `eb3ba4b` | Initial rebuilt app baseline |  |
