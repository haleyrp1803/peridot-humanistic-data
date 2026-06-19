# Maintainer's Guide

## Purpose

This document is the architectural reference for the Peridot humanistic-data visualizer app. It should stay aligned with the committed source of truth in the repository and with the workflow rules in `PROJECT_WORKFLOW_CHARTER.md`.

This guide is updated on committed architectural changes and should be sufficient to hand off work into a fresh chat session without depending on older conversation context.

The full commit history is intentionally preserved in one place in `CHANGELOG.md`; this guide summarizes architecture and current-state responsibilities rather than duplicating the complete commit log.

---

## Source of truth and working assumptions

Current source of truth folder:

- `C:\Users\haley\OneDrive\Desktop\Peridot\`

Current active branch for continued legacy work:

- **`main`**

Current documented baseline:

- **`e5f832c` — `Animate Explore workspace transitions`**

This baseline records the active D3/SVG Peridot path after the workspace-routing milestone, the completed dual-mode Inspector implementation cluster, the broader data-capability milestone, the visualization workspace/menu/export consolidation pass, the June 2026 structural cleanup/commenting pass, the Advanced Search / Explore consolidation milestone, the theme/color consolidation work, the Analytics chart-layout/theme milestone, the capability-wording cleanup, the map-export options/readability pass, the fixed-ratio Peridot homepage redesign, the Data/workbook mapping-modal redesign, the upload-mapping animation passes, the hidden-theme-menu navigation polish, the Learn More card animation pass, and the Search/Explore workspace redesign. The Inspector has compact side-panel summaries for visualization clicks, a full evidence-dossier workspace from Expand/linked-data navigation, shared selection/history, linked-record detail state, clickable linked people/places/records/routes, and directed route row dossier navigation. The Data workflow supports role-based mapping for records, time, places, relationships, evidence/analysis, and capability review, including point/site records and generic chart/evidence records that do not require people/network relationships. The Visualizations workspace now exposes capability-aware map, network, chart, and data-exploration menus; Chart Visualizations use a large tabbed chart workspace with quarter-width controls, a shared chart/legend card layout, complete simplified legends, anchored titles, vertical Bar Chart defaults, method labels, and theme-routed chart series colors; Timeline is integrated as a bottom scrubber; map overlays start minimized; and map/network/chart export is consolidated into the Visualizations header. Recent UI polish adds staged workspace entrance animations, a solid-green visualization transition, a one-time guided Chart Visualizations reveal, clearer chart-builder tab/control colors, initial force-network centering on the densest cluster, and an Inspector reference-entry visual hierarchy that separates lead summaries, connected-place/person lists, directed connections, and connected-record tables. The full Inspector now overlays Visualizations without remounting the underlying workspace; related-person navigation from geographic contexts is fixed; **Unknown** place values are preserved as first-class place-like buckets; and connected-record tables use sorting, filtering, pagination, and capability-aware columns.



Recent Search/Explore redesign milestones include:

- **`e5f832c` — `Animate Explore workspace transitions`**
- **`d3e4625` — `Open Inspector over Explore workspace`**
- **`7942fda` — `Convert Explore Browse to compact ledgers`**
- **`efd6d95` — `Compact Explore Build and Capabilities layouts`**
- **`a793c06` — `Make Explore Refine facets route-aware`**
- **`3e96f59` — `Refine Explore facet panel behavior`**
- **`7e5df91` — `Polish Explore Results ledger density`**
- **`dd09003` — `Match Explore Results pagination to Inspector`**
- **`1542c04` — `Refine Explore Results ledger`**

Recent upload mapping, workbook, menu, and Learn More polish milestones include:

- **`d04eaf6` — `Hide theme menu entry and animate learn more cards`**
- **`342e606` — `Simplify upload step transitions`**
- **`35946d4` — `Animate upload mapping transitions`**
- **`18419a5` — `Refine workbook sheet assembly layout`**
- **`3d2704e` — `Refine workbook mapping controls`**
- **`e12862c` — `Refine review warning display`**
- **`4330312` — `Refine preview and places mapping details`**
- **`b9c113c` — `Refine relationship mapping layout`**
- **`d3bda6f` — `Refine places mapping layout`**

Recent Inspector reference-layout and record-table milestones include:

- **`74db963` — `Refine Inspector reference layout and record tables`**
- **`d6baedf` — `Refine Inspector reference layout and record tables`**
- **`05fe40f` — `Keep visualizations mounted behind Inspector overlay`**
- **`306650f` — `Fix Inspector person navigation from geographic context`**
- **`dd8e9c5` — `Refresh documentation for animation and inspector milestones`**

Recent animation, chart-builder, force-network, and Inspector styling milestones include:

- **`bd9b807` — `Refine inspector workspace styling`**
- **`2bd6b3a` — `Center force network on dense cluster`**
- **`7c1f9fd` — `Polish chart builder controls`**
- **`6dfd4c6` — `Animate chart workspace reveal`**
- **`7af288f` — `Refine visualization workspace transitions`**
- **`ef8e188` — `Add workspace entrance animations`**
- **`3777fbc` — `Correct filigree asset spelling`**
- **`f8ea541` — `add a filegree asset`**
- **`6f008ce` — `Redesign data workspace landing page`**

Recent homepage, export, branding, and capability-language milestones include:

- **`68f99da` — `add some homepage assets`**
- **`bb971a5` — `Redesign Peridot homepage`**
- **`e0d2399` — `Finalize map export options and ignore design source files`**
- **`499acc7` — `Improve map export annotation readability`**
- **`d835953` — `Clarify capability and availability wording`**
- **`97843c7` — `Refine capability wording for point datasets`**
- **`7d2b888` — `Fix route capability wording for point datasets`**
- **`212fb4a` — `Track Peridot branding and palette assets`**
- **`72bcae7` — `Add Peridot logo branding assets`**
- **`954f553` — `Refresh documentation for analytics layout and theme milestone`**

Recent theme, visualization chrome, map palette, and Analytics milestones include:

- **`e50ebf6` — `Scope chart palette imports to chart series`**
- **`6334840` — `Route remaining analytics chart marks through theme series`**
- **`db2bea6` — `Anchor analytics chart titles and restore vertical bar default`**
- **`a1ce00a` — `Tighten analytics chart canvas spacing`**
- **`69ea23a` — `Simplify analytics legend rows`**
- **`b868bb3` — `Add analytics chart method labels`**
- **`b0a4b65` — `Improve analytics bar labels and metric options`**
- **`8b3ead9` — `Resize analytics builder for quarter-panel layout`**
- **`f9a74fd` — `Refine tabbed analytics builder proportions`**
- **`d7f10c9` — `Add tabbed analytics chart builder`**
- **`e712102` — `Refresh documentation for chart and theme milestones`**
- **`f143de6` — `Refresh documentation for chart and theme milestones`**
- **`10f6e19` — `Polish analytics chart axes and summary panels`**
- **`880cfff` — `Add manual analytics series selection`**
- **`cd7dfff` — `Fix grouped chart count buckets`**
- **`699e33a` — `Default chart date axis to year`**
- **`805f770` — `Harden analytics chart logic`**
- **`8f55a47` — `Add finite chart color library`**
- **`5e895ad` — `Refine chart dropdown and series contrast`**
- **`ab6dc8b` — `Refine chart workspace controls and colors`**
- **`2e57f42` — `Compact chart controls sidebar`**
- **`c5ff6c6` — `Polish chart controls sidebar`**
- **`7396864` — `Add light navy sea map treatment`**
- **`aba420e` — `Rebalance map palette and label density`**
- **`cc21008` — `Polish visualization header tabs`**
- **`15985bf` — `Improve visualization edge handles and map utility buttons`**
- **`cb26bdf` — `Refine visualization bar toggle ornament`**
- **`e643a16` — `Route Inspector colors through theme roles`**
- **`790ec66` — `Clean up theming design audit files`**

Recent Advanced Search / Explore milestones include:

- **`e5f832c` — `Animate Explore workspace transitions`**
- **`d3e4625` — `Open Inspector over Explore workspace`**
- **`7942fda` — `Convert Explore Browse to compact ledgers`**
- **`efd6d95` — `Compact Explore Build and Capabilities layouts`**
- **`a793c06` — `Make Explore Refine facets route-aware`**
- **`3e96f59` — `Refine Explore facet panel behavior`**
- **`7e5df91` — `Polish Explore Results ledger density`**
- **`dd09003` — `Match Explore Results pagination to Inspector`**
- **`1542c04` — `Refine Explore Results ledger`**
- **`10f6e19` — `Polish analytics chart axes and summary panels`**
- **`3d296cb` — `Route Explore directly to advanced search`**
- **`37f2755` — `Clarify structured search Boolean labels`**
- **`13fd533` — `Add Boolean structured search criteria`**
- **`86952c8` — `Improve advanced search moss contrast`**
- **`d7b0e2f` — `Add dataset-wide advanced search browse indexes`**
- **`8104739` — `Wire structured criteria filtering`**
- **`c8cbd5e` — `Add structured search suggestions`**
- **`e3c36e1` — `Condense advanced search results layout`**
- **`a21bbd9` — `Refine advanced search layout and palette`**
- **`e12ed84` — `Add search facets and capability filters`**
- **`4dc1bdf` — `Add search result Inspector handoff`**

Recent structural, data, visualization, and language milestones include:

- **`fcd2e1f` — `Document timeline scope and clamp chart date range`**
- **`84e6a4f` — `Add code structure audit planning document`**
- **`55a368c` — `Remove dormant MapLibre preview code`**
- **`876eb1d` — `Document Analytics chart extension contract`**
- **`0f712b5` — `Add extracted evidence field controls`**
- **`338f204` — `Restore evidence action normalization helper`**
- **`1fe9f82` — `Extract column mapping field controls`**
- **`ce7c092` — `Extract column mapping modal UI config`**
- **`5e8e022` — `Reduce left control panel to compact Inspector shell`**
- **`e8ec660` — `Extract embedded sample data from App`**
- **`133fd91` — `Add developer orientation comments across source`**
- **`cfe8207` — `Refresh documentation for visualization workspace consolidation`**

- **`fcd2e1f` — `Document timeline scope and clamp chart date range`**
- **`aca8f1f` — `Update visualization export wiring`**
- **`b6eb7c0` — `Move chart export into visualization header`**
- **`0b0cacd` — `Simplify hamburger menu and add Explore workspace`**
- **`47aaa03` — `Remove redundant chart workspace header`**
- **`675a655` — `Fit charts to workspace and minimize map overlays`**
- **`b10a68b` — `Compact visualization header and timeline controls`**
- **`b0d83fb` — `Simplify chart workspace and add bottom timeline scrubber`**
- **`7fcb348` — `Document flexible data and chart capability milestone`**

- **`08b628b` — `Use include and ignore checkboxes for evidence fields`**
- **`231ccde` — `Accept generic chart records`**
- **`b19019e` — `Generalize user-facing language beyond correspondence`**
- **`ab7affa` — `Clean up flexible Analytics chart controls`**
- **`ec6a70e` — `Support record-count sunburst charts`**
- **`596b958` — `Support record-count histograms`**
- **`b2dcde5` — `Add flexible Analytics chart variables`**
- **`6d0b37c` — `Wire visualization availability state`**
- **`b273a27` — `Make visualization menu hover more forgiving`**
- **`aae209a` — `Document data capability mapping milestone`**
- **`e7c3b57` — `Add point-location role mapping`**
- **`85f3d46` — `Move data capability audit to mapping review`**
- **`eef9cfe` — `Show read-only data capability summaries`**
- **`1889b95` — `Add data capability audit helper`**
- **`bfc8872` — `Add Peridot data capability model plan`**
- **`9c8971b` — `Display custom Inspector fields in linked letters`**
- **`5f25322` — `Select custom Inspector fields from joined workbook sheets`**
- **`964ce57` — `Import multi-sheet workbooks by unique ID joins`**
- **`ac31c38` — `Configure workbook sheet joins by unique ID`**
- **`77b1575` — `Preview multi-sheet workbook mapping`**
- **`d270c9d` — `Import mapped arbitrary CSV and TSV data`**
- **`a058730` — `Add Peridot column mapping workspace`**
- **`cbc35d0` — `Add single Peridot CSV upload workflow`**

Recent interface-routing milestones include:

- **`b24e19a` — `Link Inspector directed route rows`**
- **`82178c5` — `Promote Search to full workspace`**
- **`2c53796` — `Promote Export to full workspace`**
- **`8fc96b3` — `Extract Peridot workspace config`**
- **`25fc046` — `Extract Peridot visualizations workspace`**
- **`fcf6bb6` — `Extract Peridot data workspace`**
- **`9428766` — `Extract Peridot theme workspace`**
- **`18c2912` — `Extract Peridot home workspace`**
- **`6c16403` — `Extract Peridot hamburger menu`**
- **`30b114b` — `Add Peridot routing contract audit`**
- **`b42f6fd` — `Add Peridot interface redesign plan`**

Current GitHub repository:

- `https://github.com/haleyrp1803/peridot-humanistic-data`

When the local folder and GitHub are confirmed aligned by the sync ritual, treat the current Git commit as the source of truth.

This project should continue to follow the user's bounded-pass workflow:

- one source of truth per pass
- classify each pass as exactly one of: behavior, visual, structural, documentation
- keep one clear goal per pass
- use explicit acceptance tests
- checkpoint before higher-risk work
- separate behavior changes from visual changes
- when runtime issues appear after interaction, check the **F12 browser console early**
- maintain comments thoroughly enough for a new human developer to understand major sections, cross-file relationships, fragile paths, and non-obvious decisions

---

## Repository shape

Current live app surface includes:

- `src/App.jsx`
- `src/index.css`
- `src/main.jsx`

Current workspace / routing boundaries in `src/`:

- `src/peridotWorkspaceConfig.js`
- `src/peridotTheme.js`
- `src/peridotThemeRoleMetadata.js`
- `src/peridotColorPalette.js`
- `src/PeridotHamburgerMenu.jsx`
- `src/PeridotHomeWorkspace.jsx`
- `src/PeridotDataWorkspace.jsx`
- `src/PeridotVisualizationsWorkspace.jsx`
- `src/PeridotSearchWorkspace.jsx`
- `src/PeridotThemeWorkspace.jsx`

Current panel / inspector / Analytics boundaries in `src/`:

- `src/AnalyticsPanel.jsx`
- `src/LeftControlPanel.jsx`
- `src/PeridotColumnMappingModal.jsx`
- `src/InspectorPanel.jsx`
- `src/InspectorBodyRouter.jsx`
- `src/InspectorEmptyState.jsx`
- `src/InspectorClusterView.jsx`
- `src/InspectorEdgeView.jsx`
- `src/InspectorNodeView.jsx`
- `src/InspectorConnectedCorrespondents.jsx`
- `src/InspectorPersonPlaces.jsx`
- `src/InspectorBackButton.jsx`

Extracted support modules in `src/`:

- `src/analyticsChartComponents.jsx`
- `src/analyticsConfig.js`
- `src/analyticsDerivationHelpers.js`
- `src/mapLayoutHelpers.js`
- `src/mapStageComponents.jsx`
- `src/interactionHelpers.js`
- `src/mapInteractionHandlers.js`
- `src/timelinePlaybackHelpers.js`
- `src/timelinePlaybackComponents.jsx`
- `src/exportHelpers.js`
- `src/personForceLayoutHelpers.js`
- `src/peridotCsvSchema.js`
- `src/peridotCsvNormalizer.js`
- `src/peridotCsvValidation.js`
- `src/peridotDataCapabilityAudit.js`
- `src/peridotColumnMapping.js`
- `src/peridotColumnMappingUiConfig.js`
- `src/PeridotMappingFieldControls.jsx`
- `src/PeridotEvidenceFieldControls.jsx`
- `src/peridotWorkbookMapping.js`
- `src/peridotWorkbookParsing.js`
- `src/peridotSampleData.js`
- `src/peridotTheme.js`
- `src/peridotThemeRoleMetadata.js`

Maintainer/workflow documents are currently organized under `core_documentation/` and `planning_documents/`:

- `core_documentation/README.md`
- `core_documentation/MAINTAINERS_GUIDE.md`
- `core_documentation/PROJECT_WORKFLOW_CHARTER.md`
- `core_documentation/CHANGELOG.md`
- `planning_documents/PERIDOT_INTERFACE_REDESIGN_PLAN.md`
- `planning_documents/PERIDOT_ROUTING_CONTRACT_AUDIT.md`
- `planning_documents/PERIDOT_INSPECTOR_WORKSPACE_CONTRACT.md`
- `planning_documents/PERIDOT_CODE_STRUCTURE_AUDIT.md`

Brand and design assets:

- `assets/Peridot Logo.png`
- `assets/Peridot Logo Transparent.png`
- `assets/Peridot Logo Gilded.png`
- `assets/Peridot Logo Gilded Transparent.png`
- `assets/Adobe Stock Filigree 1.png`
- `assets/Adobe Stock Filigree 2.png`
- `assets/Adobe Stock Filigree 3.png`
- `assets/Adobe Stock Filigree Divider Set.png`
- `assets/Adobe Stock Filigree Full Set.png`
- `assets/Homepage Current 2026-06-16.png`
- `assets/Homepage Layout Mockup.png`
- `assets/Homepage Layout Mockup Annotated.png`
- `assets/Chart Colors Base.jpeg`
- `assets/Chart Colors Dark.jpeg`
- `assets/Chart Colors Pale.jpeg`
- `assets/Peridot Palette Upload Guide 1.png`
- `assets/Peridot Palette Upload Guide 2.png`

`assets/Peridot Logo Workspace.psd` may exist locally as a design source file but should remain ignored rather than committed unless there is an explicit design-source archival decision.

## Architectural summary

Peridot is a Vite/React/Tailwind correspondence visualizer that has moved from a map-first side-panel interface toward a workspace-first multimodal exploration environment.

The current top-level interface includes:

- Home / welcome startup path
- Manage Your Data / Data workspace
- Visualize Your Data / Visualizations workspace
- Explore Your Data routing directly into Advanced Search
- Learn More about Peridot placeholder workspace
- Themes and Accessibility workspace
- Advanced Search workspace as the primary Explore surface
- bottom Timeline scrubber integrated with Visualizations
- Inspector dual-mode compact/full evidence system
- in-place Visualizations header Export menu

The current Visualizations workspace includes capability-aware menu groups:

- **Mapping Visualizations** — Point Map and Route Map
- **Network Visualizations** — Entity / People Network and Force-Directed Network
- **Chart Visualizations** — large chart workspace for Bar, grouped bar, stacked bar, line, multi-line, histogram, pie, sunburst, and heatmap charts
- **Explore Your Data** — direct Advanced Search entry point, with capabilities moved into the Advanced Search **Capabilities** tab

Internally, the app still uses the geographic/person view split plus person layout mode, but the user-facing model now groups map, network, force-directed, and chart tools together inside Visualizations.

The app includes:

- standardized one-file Peridot CSV template workflow
- arbitrary CSV/TSV column mapping and mapped import
- workbook/Excel mapping with multi-sheet unique-ID joins
- workbook/Excel parser and workbook-aware mapping/import path
- database-first handling of messy/incomplete historical records
- graph derivation
- interactive SVG-based rendering
- year-based timeline filtering and playback through the bottom Visualizations scrubber
- dual-mode Inspector workflow with compact side-panel summaries and a full evidence-dossier workspace
- implemented Search & Filter consolidation defining one active filtered dataset for map, Inspector, Analytics, Timeline, and Export workflows
- theme presets and visual controls in a full workspace
- export tools for image and tabular outputs through the Visualizations header
- Chart Visualizations embedded in Visualizations

The main maintenance challenge remains structural concentration in `src/App.jsx`, but that concentration has been reduced through bounded extraction passes.

## Current module responsibilities

### `src/App.jsx`

Main orchestration file. It owns top-level state, derived data wiring, workspace composition, theme token definitions, side-panel compatibility contract building, Search & Filter state, timeline state, inspector navigation state, export wiring, the connected-record table renderer, and the live Data workflow. It wires template download, upload parsing, arbitrary CSV/TSV/workbook mapping flow, validation summary state, normalization output, upload-source reset behavior, and modal visibility.

`App.jsx` no longer contains the inline Home, Data, Theme, Visualizations, Explore, Learn More, Search, Export, or hamburger-menu UI components. Those have been extracted into dedicated `Peridot*Workspace` / menu files. It still remains the main state/orchestration boundary.

### `src/LeftControlPanel.jsx`

Compact Inspector side-panel shell. Earlier rail/workflow content has been removed. This file now exists primarily to preserve visualization-click Inspector behavior: node, edge, and cluster clicks still open the compact Inspector while deeper evidence navigation routes into the full Inspector workspace.

The old `showRightSidebar` naming remains semantically stale but compatibility-sensitive. Do not rename this path casually; explicitly test node click, edge click, cluster click, contained member navigation, compact close, Expand, and Back behavior before changing it.

### `src/peridotWorkspaceConfig.js`

Workspace-mode vocabulary and helper functions used by `App.jsx` for Home, Data, Visualizations, Explore, Learn More, Search, Inspector, and Themes/Accessibility routing. Export and Timeline are now Visualizations-integrated features rather than standalone workspace modes.

### `src/PeridotHamburgerMenu.jsx`

Primary visible navigation component. It renders the hamburger button and the simplified task-oriented public menu: Manage Your Data, Visualize Your Data, Explore Your Data, and Learn More about Peridot. Themes and Accessibility is intentionally hidden from the public menu for now, but the component comments preserve the restore point for re-adding that entry later.

### `src/PeridotHomeWorkspace.jsx`

Full Home / welcome workspace implemented as a fixed-ratio title-card composition. It uses the gilded transparent Peridot logo, licensed filigree framing, a single concise sentence, and **Use sample data** / **Upload your data** calls to action. The component intentionally keeps detailed onboarding out of the homepage; longer explanatory material belongs in `PeridotLearnMoreWorkspace.jsx`.

### `src/PeridotDataWorkspace.jsx`

Full Data workspace for CSV template download, unified CSV/TSV/XLSX/XLS upload, staged table/workbook summary, mapping launch, latest-upload summary, and navigation to Visualizations.

### `src/PeridotVisualizationsWorkspace.jsx`

Full Visualizations workspace. It contains capability-aware dropdown groups for mapping, network, chart, and data-exploration views; renders unavailable-state explanations when a dataset cannot support a selected view; hosts the large chart workspace; owns the collapsible visualization header, the bottom Timeline scrubber placement, and the shared header Export menu; and wraps the live map/network stage.

### `src/PeridotSearchWorkspace.jsx`

Full Advanced Search workspace and primary Explore surface. It renders active-scope summary plus the animated **Build Search**, **Browse**, **Results**, **Refine / Inspect**, and **Capabilities** tabs. It owns the UI for keyword/person/place/route/date/weight filters, predictive suggestions, capability filters, structured AND / OR / EXCLUDING criteria, compact dataset-wide Browse ledgers, route-aware Results ledgers, result facets, Apply Filters, Clear Filters, Explore-scoped page animations, and search-result Inspector handoff. Inspect actions from Explore now open the full Inspector above the current Explore page so the researcher returns to the same tab/state when the Inspector closes.

### `src/PeridotThemeWorkspace.jsx`

Themes and Accessibility workspace for Peridot default, Early modern map, Modern map presets, custom palette import, role-targeted palette application, and future accessibility/appearance controls. It remains implemented and route-compatible, but the hamburger menu entry is currently hidden while the page remains more development-facing than user-ready. Theme controls should continue to operate through semantic role targets rather than one-off component overrides. Explicit chart-targeted imports should alter chart series colors without recoloring unrelated app chrome.

### `src/peridotTheme.js`

Semantic theme control surface for the whole app. It defines source palettes, custom theme override storage, palette import targets, the finite 30-color default chart series library, semantic role construction, legacy color adaptation, map/network roles, chart roles, navigation chrome roles, timeline roles, search roles, Inspector/search roles, and CSS-variable export. Chart-targeted palette imports should override only `analytics.series`, while the legacy compatibility adapter should not use chart-only overrides to recolor unrelated chrome.

Future color work should start here unless a component genuinely lacks a theme role. Do not scatter new hardcoded colors through chart, Inspector, map, or workspace components when the correct fix is to extend the semantic theme roles.

### `src/peridotThemeRoleMetadata.js`

Human-facing metadata for theme roles and role groups used by the Themes and Accessibility workspace. This file should stay aligned with `peridotTheme.js` so users can understand what each role controls and so palette imports remain explainable.

### `src/peridotColorPalette.js`

Legacy compatibility palette adapter. Prefer `peridotTheme.js` for new color work; keep this file available for older component paths that still import legacy tokens.

### `src/PeridotExploreWorkspace.jsx`

Compatibility routing boundary for the old Explore workspace. Current Explore entry points should route directly to `PeridotSearchWorkspace.jsx`; the former capability-summary role has moved into the Advanced Search **Capabilities** tab.

### `src/PeridotLearnMoreWorkspace.jsx`

Placeholder workspace for future project information, credits, tutorials, and help content.

### `src/peridotCsvSchema.js`

Owns the public Peridot CSV schema contract. It defines:

- exact template column names
- field groupings
- minimum record rules
- capability labels
- upload tips
- validation summary copy
- small pure helpers for values, coordinates, person-pair/place-pair checks, mappability, machine-readable dates, accepted-record status, and missing-column checks

This file records the product rule that Peridot is database-first and that missing coordinates/dates should be flagged rather than silently rejecting otherwise useful records.

### `src/peridotCsvNormalizer.js`

Owns pure conversion from public one-file template rows into the existing internal row shapes. It creates:

- internal geography rows
- internal letter/Inspector metadata rows
- lightweight exact-name person metadata rows
- map-ready places
- accepted/unsupported row groupings

It does not clean or standardize user-entered values.

### `src/peridotCsvValidation.js`

Owns pure post-upload validation summaries. It produces:

- row-level capability reports
- total uploaded rows
- accepted record counts
- unsupported row counts
- missing-column warnings
- capability counts
- popup-ready summary lines
- persistent side-panel latest-upload summary text

### `src/PeridotColumnMappingModal.jsx`

Owns the large column/workbook-mapping workspace for arbitrary CSV/TSV/XLSX/XLS imports. The current UI is role-based rather than correspondence-template-first: users move through Preview, Sheets for workbooks, Time, Places, Relations, Evidence, and Review. It still produces Peridot-compatible rows for the existing visualization pipeline, but it now exposes explicit temporal roles, point-location roles, route coordinate-pair roles, workbook primary-sheet selection, multi-sheet unique-ID joins, and selected evidence/Analytics metadata from primary and joined sheets.

This file has been partially decomposed. Static UI labels/step groupings live in `peridotColumnMappingUiConfig.js`; repeated mapping table controls live in `PeridotMappingFieldControls.jsx`; evidence/analysis Include/Ignore controls live in `PeridotEvidenceFieldControls.jsx`. The modal should continue to own state transitions, workbook state, import/cancel behavior, final mapping assembly, upload-mapping entrance animation hooks, and the accepted opacity-only step transition. Avoid reintroducing carousel/slide/scale/blur transitions for step changes unless a new motion pass explicitly chooses that direction.

### `src/peridotColumnMappingUiConfig.js`

Static UI configuration for the mapping modal: single-table/workbook step sequences, display labels, field groupings, capability labels, and formatting helpers. It intentionally contains no React state and no import/application logic.

### `src/PeridotMappingFieldControls.jsx`

Presentational mapping-table controls used by the mapping modal for temporal fields, core relationship/place roles, and workbook-aware field-role rows. Workbook role controls now use combined sheet-column selectors rather than stacked Sheet and Column dropdowns, while preserving the internal workbook reference shape. It should remain stateless and receive current values plus callbacks from `PeridotColumnMappingModal.jsx`.

### `src/PeridotEvidenceFieldControls.jsx`

Presentational evidence/analysis Include/Ignore controls for single-table and workbook imports. Workbook Evidence remains grouped by sheet, but default display labels use the column name only so the sheet name is not duplicated in every label. The modal owns the state and update handlers; this file owns the repeated row rendering, display labels, and checkbox layout.

### `src/peridotColumnMapping.js`

Owns helper logic for arbitrary table column mapping, including common-name suggestions, core-field mapping rules, temporal-role mapping, point-location role mapping, route coordinate-pair mapping, and selected evidence/Analytics metadata handling. It preserves the existing correspondence-compatible route/network fields while adding role mappings for point/site datasets, start/end/display dates, and latitude-first combined coordinate pairs.

### `src/peridotWorkbookMapping.js`

Owns workbook-aware mapping and import assembly helpers. It models primary record sheets, sheet/column references, arbitrary unique-ID joins, workbook validation, joined-row context construction, Peridot-shaped row assembly, temporal/point/route role mappings, and selected evidence/Analytics field handling from primary and joined sheets.

### `src/peridotDataCapabilityAudit.js`

Pure UI-agnostic helper for inspecting uploaded rows and reporting field roles, row capabilities, and dataset-level readiness for Inspector, Search, point maps, route maps, networks, timelines, charts, and export. It supports temporal intervals, latitude-first coordinate pairs, point/site records, route records, time-series-like numeric fields, and generic evidence records.

### `src/peridotWorkbookParsing.js`

Owns workbook parsing helper logic for CSV, TSV, XLSX, and XLS inputs. It isolates the `xlsx` dependency, parses all sheets into a shared workbook model, ignores formatting/merged-cell styling, and reads saved/displayed cell values only.

### `src/AnalyticsPanel.jsx`

Owns the Analytics / Chart Visualizations control UI. It renders chart type selection, tabbed Chart/Fields/Categories/Present controls, chart descriptions/example questions, date controls, variable controls, manual category/series selection controls, selection-mode and comparison-total controls, optional presentation-title editing, and the large chart workspace. It preserves compatible chart settings as users switch chart types where possible, defaults Bar Chart orientation to Vertical, and registers chart PNG export with the Visualizations header Export menu rather than rendering a separate export control in the chart rail.

### `src/analyticsConfig.js`

Owns Analytics chart configuration, including chart labels/descriptions, example research questions, default Analytics state, aggregation options, top-N display options, manual-selection defaults, curated variable definitions, and **Route (Place)** / **Route (Person)** definitions.

### `src/analyticsDerivationHelpers.js`

Owns Analytics data derivation, including available variable detection, numeric measure detection, conservative filtering of dynamic metadata fields, Year and Full date bucketing, flexible chart data construction, record-count aggregation, manual selected-category filtering, selected-only/Other/dataset-total comparison behavior, grouped/stacked/multi-line count buckets, and semantic alias handling for curated fields such as Language and Relationship.

Dynamic variable detection should exclude technical or non-categorical fields such as IDs, latitude/longitude fields, date fields, mappability flags, object/array values, purely numeric values, long note-like fields, and near-unique row identifiers.

### `src/analyticsChartComponents.jsx`

Owns SVG chart rendering and shared chart hover tooltip styling for Bar Chart, Grouped Bar Chart, Stacked Bar Chart, Line Chart, Multi-Line Chart, Histogram, Pie Chart, Sunburst Chart, and Heatmap. It also owns shared chart frames, the shared three-quarter chart / one-quarter legend layout, complete simplified summary/legend panels, ranked/segment/line/trend/bin/matrix/slice/sunburst annotation panels, major/minor axis ticks, gridline styling, active theme-series mark colors for every chart type, and the rendered SVG surface used for chart PNG export.

The shared chart tooltip uses a mossy/title-green background with light text for legibility over dense charts such as heatmaps. Axis and panel styling should stay legible against the warm chart-paper background and should not depend on hover-only disclosure for core values. Keep chart-card geometry centralized through the shared layout helper rather than reintroducing unrelated per-chart spacing constants.

### `src/InspectorPanel.jsx`

Owns inspector content only. It no longer owns the outer panel shell. It renders the inspector header, inspector-internal Back button, and `InspectorBodyRouter`.

### `src/InspectorBodyRouter.jsx`

Routes resolved inspector state to the appropriate extracted view.

### `src/InspectorEmptyState.jsx`

Owns the empty inspector state.

### `src/InspectorClusterView.jsx`

Owns the cluster inspector view. Current behavior groups contained members by place and sorts groups/members by represented visible volume.

### `src/InspectorEdgeView.jsx`

Owns the edge inspector state boundary.

### `src/InspectorNodeView.jsx`

Owns the node / person-detail / place-detail inspector boundary. It now renders the scholarly reference-entry Inspector layout: lead summary, optional image/placeholder, compact summary facts, role-grouped connected places and people, directed connections, expandable high-volume lists, selected user-uploaded fields, and connected-record navigation entry points. It also preserves **Unknown** as a place-like bucket when source/target location values are missing or unresolved.

### `src/mapLayoutHelpers.js`

Pure map/layout helper logic, including viewport construction, clustering, cluster radius calculation, label visibility, and geometric calculations.

### `src/mapStageComponents.jsx`

Map-stage-adjacent UI/chrome components.

### `src/interactionHelpers.js`

Pure interaction-resolution and selection-building helpers. This file owns helper logic for nearby candidate generation, selection resolution, cluster selection payload building, connected-correspondent ordering, `person-detail` / `place-detail` payload derivation, Unknown-as-place resolution, person-detail sent/received place-section derivation, and person-graph fallback resolution for related-person navigation from geographic contexts.

### `src/mapInteractionHandlers.js`

Top-level map interaction handlers.

### `src/timelinePlaybackHelpers.js`

Pure timeline/playback derivation helpers.

### `src/timelinePlaybackComponents.jsx`

Timeline/playback panel UI boundary. The timeline is now **year-based**, not month-based.

### `src/exportHelpers.js`

Pure export utilities and export row-builder helpers.

### `src/peridotSampleData.js`

Bundled sample CSV constants used by the Home **Use sample data** path. Keeping sample data out of `App.jsx` reduces top-level orchestration noise and makes future sample replacement safer.

### `src/peridotTheme.js`

Semantic theme and palette control surface. It owns the active Peridot source palette, custom-theme override storage, theme role construction, CSS variable flattening, legacy-token compatibility mapping, map/network palette assignment, chart background/text/grid roles, and the finite Analytics chart series color library. Future color work should prefer this file and its role system over one-off component constants.

### `src/peridotThemeRoleMetadata.js`

Theme-role metadata used by the Themes and Accessibility workspace and palette tooling. Keep it aligned with `peridotTheme.js` when adding, renaming, or documenting roles.

### `src/personForceLayoutHelpers.js`

Pure helper logic for the pre-settled force-directed person-network layout.


### Current dual-mode Inspector architecture

The Inspector now uses a dual-mode model:

- visualization clicks open a compact side-panel Inspector for at-a-glance summaries;
- hamburger **Inspector** and compact **Expand** open the full Inspector workspace;
- compact and full modes share the same selected Inspector state and multi-step Back history;
- `[x]`, Escape, and blank-map click close the appropriate Inspector surface and return to Visualizations;
- person/place links, connected-record detail pages, connected-record source/target people and places, compact summary tiles, and directed route rows all route through the full Inspector workspace where appropriate;
- full Inspector presentation overlays the existing Visualizations workspace without remounting or replaying the underlying visualization;
- connected-record tables use date-first defaults, sort/filter controls, 10/25/50 page sizes, pagination, and capability-aware columns for relational versus point-only datasets;
- **Unknown** is treated as a first-class place-like bucket for unresolved/missing place values.

Important implementation boundaries:

- `App.jsx` owns Inspector presentation mode, selected selection, history, and linked-person/place/letter/route navigation helpers.
- `InspectorPanel.jsx` owns the shared compact/full Inspector content shell and top control row.
- `InspectorBodyRouter.jsx` routes resolved Inspector state, including `letter-detail` and synthetic route/edge detail selections.
- `InspectorNodeView.jsx` renders person/place profile summaries, compact summary buttons, related people/places, directed route rows, and linked-letter entry points.
- `InspectorEdgeView.jsx` renders edge/route dossiers and linked-letter entry points.
- `InspectorClusterView.jsx` renders compact/full cluster evidence and member navigation.

Future Inspector work should preserve compact/full shared state, Back history, and the current visualization mounted underneath. Do not re-split compact and full Inspector into separate state systems.

### `src/InspectorConnectedCorrespondents.jsx`

Inspector navigation component for person-to-person movement.

### `src/InspectorPersonPlaces.jsx`

Inspector navigation component for person-to-place movement. It shows two explicit sections:

- **Places this person sent letters to**
- **Places where this person received letters**

### `src/InspectorBackButton.jsx`

Inspector-internal Back button. It uses a small local history model for inspector-internal navigation only and does not track ordinary map clicks as navigation history.

---

## Current functional state

### Workspace routing

- app opens to the Home workspace
- hamburger menu is the primary visible navigation surface
- hamburger menu exposes Manage Your Data, Visualize Your Data, Explore Your Data, and Learn More about Peridot
- full workspaces exist for Data, Visualizations, Explore, Learn More, the internally retained Themes and Accessibility workspace, Search, and Inspector-compatible evidence review
- Timeline is integrated as a bottom Visualizations scrubber
- Export is integrated as a Visualizations header menu rather than a standalone workspace
- Inspector compact mode remains tied to visualization-click side-panel behavior and auto-opens from node/edge/cluster interactions

### Visualization modes

- Place Map view
- People Network view
- Force-Directed view
- Chart Visualizations inside Visualizations

### Person-network layouts

- geographic-anchor layout
- pre-settled force-directed layout

### Side-panel capabilities

- legacy shared side-panel shell remains available for Inspector bridge behavior
- Inspector auto-opens from node, edge, and cluster interactions
- legacy rail/Controls/Data/Search/Export/Analytics code may still exist in `LeftControlPanel.jsx`, but it is no longer the intended primary user-facing navigation path for workflows already promoted to full workspaces

### Data capabilities

- full Data workspace
- unified CSV / TSV / XLSX / XLS upload path
- compact role-based mapping modal with staged entrance animation and opacity-only step transitions
- downloadable Peridot CSV template
- arbitrary CSV/TSV/Excel role-based mapping workflow
- XLSX/XLS workbook staging, mapping, unique-ID joins, combined sheet-column role selectors, and import assembly
- database-first permissive upload model
- upload validation popup
- persistent latest-upload summary
- capability audit at the mapping-review decision point
- role-based upload mapping for Preview, workbook Sheets, Time, Places, Relations, Evidence, and Review
- explicit temporal roles for single dates, start dates, end dates, and display dates
- point-location roles for datasets with one location per record
- route coordinate roles that accept separated latitude/longitude columns or combined latitude-first coordinate pairs
- successful Place Map rendering for point/site datasets without forcing People Network or Force-Directed network behavior
- generic chart/evidence rows accepted into the active dataset without requiring map or network roles
- Evidence and analysis field controls use explicit Include and Ignore checkboxes, defaulting to Include
- concise data tips explaining row granularity, incomplete data, coordinates, and user responsibility for standardization
- legacy three-file public upload workflow superseded by one-file and mapped-import workflows

### Advanced Search / Explore capabilities

- Explore Your Data routes directly to Advanced Search from the hamburger menu and Visualizations header
- full Advanced Search workspace organized around animated Build Search, compact Browse ledgers, Results ledgers, route-aware Refine / Inspect facets, and Capabilities tabs
- draft/apply global filtering model
- **Apply Filters** commits all filter changes together
- **Clear Filters** clears keyword/person/place/route fields, restores minimum weight to `1`, restores the full date range, and resets playback
- status feedback appears before expensive filter recomputation begins
- current applied filter scope is displayed at the top of the workspace
- compact advanced-search criteria form modeled on database/library advanced-search interfaces
- text filters include keyword search, person filter, place filter, **Route Filter (Place)**, and **Route Filter (People)**
- structured criteria support first-row search plus later **AND**, **OR**, and **EXCLUDING** connectors
- structured criteria support predictive suggestions and a five-row cap
- dataset-wide Browse indexes render as compact ledgers for People / Entities, Places / Locations, and Routes when route data is present
- Results show compact route-aware ledger rows, matched-field context, pagination, page-size controls, and Inspector handoff
- Refine / Inspect shows route-aware facets based on the current applied result set, with compact default cards and Show all / Show less expansion
- Capabilities contains the former "what this data can do" summary inside Advanced Search
- non-text filters include minimum correspondence weight and date range
- predictive suggestions are available for person, place, route-place, route-people, start year, and end year
- suggestion menus show after at least two typed characters, show about five suggestions at once, and scroll for more matches
- selecting a suggestion fills a draft field only; the map/network updates only after **Apply Filters**

### Inspector capabilities

- compact side-panel Inspector auto-opens from visualization node, edge, and cluster clicks
- full Inspector workspace opens from hamburger **Inspector**, compact **Expand**, compact summary buttons, and Inspector-internal linked-data clicks
- shared Inspector selection and multi-step Back history across compact and full modes
- `[x]`, Escape, blank-map close, and Expand behavior
- person/place reference-entry summaries with role-grouped connected people/places, directed connections, connected-record counts, selected uploaded fields, and custom metadata where available
- dedicated connected-record detail pages inside shared Inspector state/history
- linked-letter source/target people and places open full person/place dossiers
- directed route rows open route/edge dossiers with linked letters
- compact summary tiles open the full workspace for linked letters, related people, related places, and routes
- actionable cluster inspector views
- cluster members grouped by place and ordered by visible volume

### Timeline capabilities

- year-based date filtering
- playback controls
- timeline is a compact bottom scrubber inside Visualizations
- dual range handles define start and end years
- collapse/expand behavior preserves workspace space
- month selectors removed in favor of year-based controls

### Map and sizing capabilities

- dynamic node radius contrast based on visible active data
- volume-based zoom-responsive cluster sizing
- zoom-responsive proximity clustering for nearby nodes/places
- edge sizing unchanged by recent node/cluster sizing work

### Export capabilities

- shared Visualizations header Export menu
- SVG export for map/network views
- PNG export for map/network views, with map-only default PNG output and optional title/top annotation plus optional metadata/bottom annotation
- nodes CSV export
- edges/routes CSV export
- Chart Visualizations PNG export
- standalone Export workspace route removed from the active app path

### Analytics capabilities

- Chart Visualizations are shown inside the Visualizations workspace
- chart type selector with Bar, Grouped Bar, Stacked Bar, Line, Multi-Line, Histogram, Pie, Sunburst, and Heatmap chart types
- chart descriptions and example questions
- chart-specific variable controls
- curated semantic variables plus usable dynamically detected categorical metadata fields
- explicit **Route (Place)** and **Route (Person)** variables
- Analytics-local date-range controls for time-based charts
- **Year** is the default ordered date axis; **Full date** is available when the user wants finer date granularity
- large chart workspace with tabbed controls on the left and the full chart canvas on the right
- chart rendering scaled to fit without internal workspace scrolling
- higher-contrast shared chart hover tooltips
- manual category/series selection across chart types
- compatible chart settings persist where possible as users switch chart types
- flexible x-axis/category, y-axis/metric, aggregation, grouping/series, histogram, heatmap, and wide numeric-series controls
- explicit Record count metric support across aggregate chart types
- summary panels for ranked values, segment totals, line totals, trend summaries, bin ranges, matrix combinations, slices/shares, and sunburst parent totals
- major and minor axis ticks/gridlines for axis-based charts
- finite 30-color chart series library sourced from the approved Peridot chart palettes
- shared chart-card layout with left three-fourths for chart marks and right one-fourth for complete simplified legend/summary rows
- anchored title/subtitle placement, tighter internal chart-card spacing, method labels, and vertical Bar Chart default orientation
- default finite 30-color chart series library with explicit chart-targeted palette imports scoped to Analytics series colors
- chart PNG export through the shared Visualizations header Export menu

## Workbook import contract

Peridot supports `.csv`, `.tsv`, `.xlsx`, and `.xls` imports through the Data Inputs workflow.

For workbook imports:

- CSV/TSV files are represented internally as one-sheet workbooks.
- Excel workbooks expose all usable sheets.
- Users choose a primary record sheet.
- Users can add multiple joined sheets.
- Users choose the primary-sheet unique-ID column and the joined-sheet unique-ID column for each join.
- Header names for unique-ID columns do not need to match.
- The user-confirmed join configuration is authoritative.
- Core Peridot fields can be mapped from any sheet available in the joined row context.
- Custom Inspector/Analytics fields can be selected from the primary and joined sheets.
- Person and place names can act as exact-match keys, but Peridot does not normalize variants.

The workbook import path should continue to avoid row-order joining as the primary strategy. If multiple sheets are assembled into letter-level records, use explicit user-confirmed unique-ID joins.

Future workbook work should explicitly test:

- upload does not freeze the app on reasonably sized workbooks;
- workbook summary appears;
- primary sheet can be changed;
- multiple joined sheets can be added;
- unique-ID match summaries update;
- core mappings can use joined-sheet columns;
- selected custom fields from joined sheets appear in linked-letter Inspector detail;
- imported rows still validate through the existing Peridot validation summary.

---

## Search & Filter active-dataset contract

The dedicated **Search & Filter** tab is implemented and is now the owner of global filtering behavior.

### Core model

Peridot distinguishes:

```text
data source
→ active filtered dataset
→ visualization / inspection / analytics / export
```

Search & Filter defines the **active filtered dataset**: the subset of loaded correspondence records that pass all enabled global filters.

### Current responsibilities

- **Data Inputs** defines which data is loaded.
- **Search & Filter** defines which records, people, places, routes, and time/weight scopes are in the active dataset.
- **Controls / View** defines how the active dataset is displayed.
- **Timeline** focuses on chronological playback and temporal navigation through the bottom Visualizations scrubber while consuming the applied date scope.
- **Chart Visualizations** chart the current filtered dataset by default.
- **Inspector** remains selection-driven, with possible later actions to filter to the selected person/place/route.
- **Export** is an in-place Visualizations header action and should label whether it exports loaded, filtered, visible, selected, or charted data.

### Current filters

Implemented Search & Filter controls:

- keyword search
- person filter
- place filter
- **Route Filter (Place)**
- **Route Filter (People)**
- minimum correspondence weight
- date range

Autocomplete/predictive suggestions are implemented for person, place, source-place → target-place routes, and source-person → target-person routes.

### Implementation cautions

Search & Filter is a fragile active-dataset state boundary. Future changes should be narrow and should explicitly test:

- typing in text fields does not recompute on every keystroke
- predictive suggestions fill draft fields only
- Apply Filters commits all filters together
- Clear Filters resets all filters and playback
- timeline playback respects the applied filter/date scope
- inspector clicks still open after filtering
- Analytics and Export still receive the intended filtered scope
- pre-update status appears before expensive full-dataset recomputation begins

Do not use Search & Filter work as an opportunity for broad `App.jsx` refactoring. Do not merge Timeline, Analytics, and Inspector into one panel. Do not make Analytics or Inspector the global filter owner. Do not rename compatibility-sensitive `showLeftSidebar` / `showRightSidebar` paths during this work. Do not touch dormant MapLibre files as part of Search & Filter work.

---

## Data Inputs contract

The dedicated **Data Inputs** tab is now the public owner of the standardized Peridot CSV workflow.

### Core model

```text
template CSV
→ parsed uploaded rows
→ validation/capability summary
→ normalized app data
→ active data source
```

### Current responsibilities

- Provide a downloadable Peridot CSV template.
- Provide one unified CSV / TSV / XLSX / XLS table-workbook upload control.
- Present upload feedback in a popup immediately after upload.
- Keep the latest upload summary visible in the Data Inputs panel after the popup closes.
- Explain that incomplete records may still be preserved even if they are not compatible with every visualization.
- Keep the ordinary public data-entry path focused on one-file template upload plus mapped arbitrary-table import.

### Implementation cautions

Data Inputs is now a fragile data-ingestion boundary. Future changes should explicitly test:

- template download works;
- uploading a valid template CSV updates the app data;
- upload summary popup appears;
- closing the popup does not erase the persistent side-panel summary;
- rows lacking coordinates are not silently discarded if otherwise accepted;
- rows lacking parseable dates are not silently discarded if otherwise accepted;
- Inspector still opens after upload;
- Search & Filter resets or remains coherent after upload;
- Timeline playback does not use stale date scope after upload;
- Analytics receives the intended uploaded/filtered rows;
- Export still labels and exports the intended data scope.

Do not reintroduce the legacy three-file workflow unless there is a specific recovery or compatibility reason. The active public direction is one-file template upload plus mapped arbitrary-table import.

---

## Current brand asset and Home workspace state

The user-designed Peridot logo and related design assets live in `assets/`:

- `assets/Peridot Logo.png` — original solid-background logo for documentation/reference use.
- `assets/Peridot Logo Transparent.png` — original transparent-background logo.
- `assets/Peridot Logo Gilded.png` — revised gilded logo for documentation/reference use.
- `assets/Peridot Logo Gilded Transparent.png` — revised transparent logo used by the current Home workspace.
- `assets/Adobe Stock Filigree 1.png` — selected licensed filigree used as Home workspace framing.
- `assets/Adobe Stock Filigree Divider Set.png`
- `assets/Adobe Stock Filigree Full Set.png` — licensed Adobe Stock filigree set retained as a future design-reference asset.
- `assets/Homepage Current 2026-06-16.png` — current homepage screenshot for documentation.
- `assets/Homepage Layout Mockup.png` and `assets/Homepage Layout Mockup Annotated.png` — user-authored layout references for the homepage redesign.
- `assets/Chart Colors Base.jpeg`, `assets/Chart Colors Dark.jpeg`, and `assets/Chart Colors Pale.jpeg` — chart-palette reference assets.
- `assets/Peridot Palette Upload Guide 1.png` and `assets/Peridot Palette Upload Guide 2.png` — palette-upload guide/reference assets.

`src/PeridotHomeWorkspace.jsx` imports the gilded transparent logo directly from `../assets/Peridot Logo Gilded Transparent.png` and the selected filigree from `../assets/Adobe Stock Filigree 1.png`. Keep these files under version control. The local Photoshop source file, `assets/Peridot Logo Workspace.psd`, should remain ignored unless there is an explicit decision to archive editable design sources in the repository.

### Home title-card layout contract

The Home workspace is intentionally a minimal orientation surface rather than a full onboarding page.

Keep:

- the deep green, multi-tone, striped Peridot background;
- the gilded transparent logo;
- the selected licensed gold filigree asset;
- the CTA pair **Use sample data** and **Upload your data**, with **Upload your data** on the right;
- the concise sentence: “Your go-to tool for exploring, visualizing, and presenting humanistic data.”;
- Georgia / Peridot display-serif typography for the sentence;
- non-scrolling first-screen presentation.

Do not:

- add explanatory cards back to the homepage;
- let filigree overlap the logo, sentence, or buttons;
- let button labels wrap;
- let the sentence dominate the Peridot wordmark;
- turn the homepage back into a dashboard/card-grid layout.

Anchor rules:

- the full homepage composition is one centered fixed-ratio title-card stage;
- the logo is the largest visual object and sits left of center;
- the sentence and buttons form one right-side content unit, vertically centered relative to the logo;
- the sentence is centered over the buttons;
- the left filigree frames the outside of the logo group;
- the right filigree frames the outside of the text/buttons group;
- all homepage elements should scale from the same stage sizing logic so the relative proportions remain stable across browser sizes.


## Current theme and routing state

The default full-app theme remains **Peridot-inspired** and is now controlled primarily through the semantic theme role system in `peridotTheme.js`.

Recent color/theme work centralized the chart color library, routed Inspector colors through theme roles, rebalanced map land/sea roles, and polished the Visualization header/chrome without reintroducing scattered one-off color constants where a theme role exists.

The preceding color/theming conversation produced the following committed palette-system sequence and should be treated as part of the documented theme baseline:

- `034ec67` — Centralize explicit color palette values
- `fed7d2e` — Add semantic palette system and theme toggle
- `6e8dfa6` — Add palette role dashboard
- `e35ab68` — Add image palette import by theme area
- `1ba1682` — Improve palette image swatch detection
- `ee4f75e` — Route whole-app palette imports through foundation tones
- `4747639` — Anchor imported palettes to darkest and lightest roles
- `0a686fe` — Add built-in Peridot palette presets
- `aa00efb` — Apply upload guide design direction
- `81dd7af` — Apply upload guide color direction and dropdown layering
- `d7f10c9` through `db2bea6` — Rework the Analytics builder and chart card around tabs, quarter-panel controls, shared legend layout, simplified complete legends, tightened spacing, anchored titles, and vertical Bar Chart defaults
- `6334840` — Route remaining analytics chart marks through theme series
- `e50ebf6` — Scope chart palette imports to chart series


Other retained presets still function as map-focused alternatives:

- Early modern map
- Modern map

Current routing state:

- Hamburger entries are Manage Your Data, Visualize Your Data, Explore Your Data, and Learn More about Peridot
- Data, Visualizations, Explore, Learn More, Search, and Inspector-compatible evidence review are public workspace paths; Themes and Accessibility remains an internal/development-facing full workspace path
- Export is integrated into the Visualizations header, not a top-level workspace
- hamburger-triggered labeled menu is the intended navigation model
- the persistent rail is no longer the intended primary visible navigation surface
- Timeline is integrated into Visualizations as a bottom scrubber
- Inspector is now dual-mode: compact side panel from visualization clicks plus full workspace from hamburger/Expand/linked-data navigation
- the compact Inspector side-panel shell should be treated as a compatibility layer for visualization-click Inspector behavior

Recent committed behavior includes:

- fixed-ratio Home / welcome title-card workspace with gilded logo, filigree framing, concise description, and **Use sample data** / **Upload your data** entry points
- unified Data workspace upload path for CSV / TSV / XLSX / XLS
- compact Visualizations workspace with Place Map, People Network, Force-Directed, and Analytics
- Search & Filter available as a full workspace through Explore/workflow actions
- Export consolidated into the Visualizations header
- Theme reframed as Themes and Accessibility, then hidden from the public hamburger menu until it is ready as a user-facing page
- routing contract updated after workspace promotions
- Timeline implemented as a bottom Visualizations scrubber
- Inspector full evidence-dossier workspace implemented in dual-mode form; future work should refine content density, breadcrumbs, section anchors, and visual polish

## Deferred / rolled-back work

### MapLibre migrated-overlay branch paused / active preview removed

The later `maplibre-native-geographic-view` branch remains an archived experiment. Active `main` no longer contains the dormant MapLibre preview files or dependency after `55a368c`.

If MapLibre work resumes, begin with a fresh source-of-truth audit and intentionally reintroduce any required package dependencies and stage files. Do not assume the old experiment can be merged directly.

### Shared-panel semantic prop rename

An attempted cleanup of old `showLeftSidebar` / `showRightSidebar` compatibility names was rolled back because it broke inspector auto-open behavior from node, edge, and cluster clicks.

Do not rename this compatibility path casually. If revisited, explicitly test:

- node click opens Inspector
- edge click opens Inspector
- cluster click opens Inspector
- contained cluster member opens detail
- Back behavior still works

### Responsive side-panel sizing

An attempted universal responsive positioning change for the shared side panel was rolled back because it disrupted the normal full-size landscape layout and forced scrolling before the map.

Future responsive work should be a narrow-window-specific override, not a universal replacement of the panel positioning model.

---

## Current fragile zones

These areas still deserve narrow, explicit passes:

- workspace routing and hamburger-menu behavior
- map viewport centering/reset behavior
- map/network viewport measurement after switching between Analytics and map/network modes
- dense map hover/click interaction
- selection persistence across filters
- timeline/playback state coupling
- export rendering/state coupling
- broad orchestration work in `src/App.jsx`
- Data upload state, one-file CSV normalization, arbitrary table mapping, workbook parsing helper, and validation summary behavior
- shared side-panel shell and inspector-open interactions
- cluster grouping and cluster inspector navigation
- Analytics expanded overlay positioning and backdrop contrast above the map area
- Analytics dynamic variable detection from uploaded/current row data
- Analytics SVG-to-PNG chart export rendering
- Search & Filter active-dataset state, especially draft/apply coordination across keyword, person, place, route-place, route-people, date, weight, Timeline, Analytics, Inspector, and Export behavior
- archived MapLibre branch work if it is ever explicitly resumed

## Additional caution

Generated helper scripts and backup files should be removed after use.

Examples of things that should not linger in the repo folder:

- temporary Python patch scripts
- temporary PowerShell patch scripts
- `itch_upload/`
- backup `.jsx` / `.js` files made during local patching

---

## Workflow reminders

Future work should continue to follow the user's established workflow:

- one bounded pass at a time
- classify each pass as **behavior**, **visual**, **structural**, or **documentation**
- one explicit acceptance test per pass
- prefer local/small edits when safe
- use checkpoints before higher-risk changes
- only ask for the sync ritual after an actual checkpoint or commit
- prefer direct file delivery and exact Windows PowerShell commands
- prefer `.txt` delivery for generated source replacements when direct source-file downloads are unreliable
- when runtime issues appear after interaction, check the **F12 browser console early**
- maintain comments thoroughly enough for a new human developer to understand major sections, cross-file relationships, fragile paths, and non-obvious decisions

This recent work also reinforced these process rules:

- trust GitHub/local source when a recent sync ritual confirms they match
- target changes against the exact live file shape
- if a UI change does not appear, verify the live file before stacking more patches
- do behavior pass first, then cleanup pass second
- if a pass starts drifting, restore to the last safe commit rather than continuing to stack speculative fixes
- when a long conversation becomes unreliable or laggy, restore the safe baseline, update docs, and continue in a fresh chat

---

## Fresh-chat handoff note

A future chat should start from:

- source of truth folder: `C:\Users\haley\OneDrive\Desktop\Peridot\`
- active branch: `main`
- current documented baseline: **`e5f832c` — `Animate Explore workspace transitions`**

A future chat should also be told that:

- the app identity is **Peridot**
- the user-designed Peridot logo, gilded logo, selected Adobe Stock filigree, homepage screenshot, and homepage mockup assets are stored in `assets/`; the Home workspace uses `assets/Peridot Logo Gilded Transparent.png` and `assets/Adobe Stock Filigree 1.png`; the additional licensed filigree assets `Adobe Stock Filigree 2.png`, `Adobe Stock Filigree 3.png`, `Adobe Stock Filigree Divider Set.png`, and `Adobe Stock Filigree Full Set.png` are retained for design reference/use
- the fixed basemap is `countries50m`
- itch.io packaging support is already committed
- the simplified hamburger/workspace structure is committed; public menu entries are Manage Your Data, Visualize Your Data, Explore Your Data, and Learn More about Peridot; Themes and Accessibility is hidden from public navigation but retained internally; the shared side panel remains primarily as the compact Inspector surface and compatibility bridge
- `InspectorPanel.jsx` is content-only
- `LeftControlPanel.jsx` owns the compact Inspector side-panel shell; Data/Visualizations/Explore/Learn More/Search are public full workspace paths; Themes and Accessibility remains an internal full workspace path; Export and Timeline are Visualizations-integrated
- `peridotCsvSchema.js`, `peridotCsvNormalizer.js`, `peridotCsvValidation.js`, `peridotColumnMapping.js`, `PeridotColumnMappingModal.jsx`, and `peridotWorkbookParsing.js` own the current template upload, arbitrary table mapping, validation, and workbook-helper boundaries
- current cluster, Inspector profile, dual-mode Inspector, linked-letter history, clickable linked people/places, compact summary tile, and route-row features are committed, not deferred
- MapLibre preview code has been removed from active `main`; the migrated-overlay branch remains archived and should not be treated as active implementation direction
- documentation should preserve the full commit trajectory carefully in `CHANGELOG.md`
- the implemented Search & Filter panel consolidates global filtering and defines the active filtered dataset before Analytics, Timeline, Inspector, and Export consume it
- Search & Filter currently uses a compact advanced-search layout with current applied scope at the top
- Data Inputs currently uses a one-file Peridot CSV workflow, arbitrary CSV/TSV mapping, workbook import with unique-ID joins, downloadable template, validation popup, and persistent upload summary
- Chart Visualizations use a large left-controls/right-chart workspace, manual series/category selection, year-default date axes, summary panels, major/minor axis ticks, finite chart colors, higher-contrast tooltips, fit-to-workspace chart rendering, and header-based chart PNG export


## Code commenting standard

All future implementation work should keep source comments detailed enough for a new human developer to understand what each major section does, how it relates to other app sections and files, and why fragile or non-obvious decisions were made. Comments should identify compatibility bridges, cross-file state coupling, exported helper responsibilities, and retained legacy paths. They should be updated when behavior or routing changes so documentation in the code does not drift from the active app.
