# Changelog

## Current documented safe baselines

### Active MapLibre-native branch baseline

- **`268b18c` — `Add MapLibre hover feedback`** on branch `maplibre-native-geographic-view`

This branch is a MapLibre-native geographic subsystem design branch. The production D3/SVG map remains unchanged; MapLibre work is gated behind `?maplibrePreview=1`. The current migrated MapLibre overlay is functional primarily for **Place** view and now includes dynamic clusters, cluster-member node hiding, cluster labels, curved aggregated visible-endpoint routes, Inspector integration for clusters and aggregated routes, selected feedback, and hover feedback.

### Main / MapLibre preview prototype checkpoint

- **`10051c0` — `Add MapLibre selected filter layers`** on `main`
- Tag: **`checkpoint-maplibre-preview-prototype`**

### Pre-MapLibre clean rollback point

- **`4e08720` — `Direct workflow charter baseline reference to changelog`**

Use this rollback landmark if the project needs to return to the clean pre-MapLibre state.

---

## Recent committed work: MapLibre-native subsystem branch

### `268b18c` — Add MapLibre hover feedback

- Added MapLibre hover feedback for unclustered nodes, dynamic clusters, and aggregated visible-endpoint routes.
- Improved hover responsiveness by using direct hover resolution rather than waiting for slower lifecycle/diagnostic updates.
- Prioritized nodes and clusters over crossing routes during hover resolution, which makes dense areas such as Florence easier to inspect.
- Preserved node, cluster, aggregated-route click routing, selected feedback, curved route rendering, cluster labels, and production D3/SVG behavior.

### `8137db7` — Curve MapLibre aggregated routes

- Changed MapLibre aggregated visible-endpoint routes from straight two-point lines to deterministic curved multi-point `LineString` geometries.
- Preserved source-to-target direction, aggregation behavior, route thickness, Inspector payloads, selected feedback, and cluster behavior.

### `c0a4b8a` — Restore MapLibre migrated overlay after extraction regression

- Restored the working migrated MapLibre overlay after `dd148e1` reintroduced an older preview-stage shape.
- Re-established dynamic clusters, cluster labels, cluster-member node hiding, aggregated visible-endpoint routes, aggregated route Inspector behavior, and selected feedback.
- Recorded that future structural extraction should be much narrower and source-of-truth verified.

### `dd148e1` — Extract MapLibre cluster and aggregate IDs

- Attempted to move cluster and aggregate route ID constants from `src/MapLibreMapStage.jsx` into `src/mapLibreLayerConfig.js`.
- This pass regressed the migrated overlay and was superseded by `c0a4b8a`.
- Keep this entry as a cautionary record: structural extraction around `MapLibreMapStage.jsx` should proceed only in small, directly verified patches.

### `57d3cc1` — Add MapLibre cluster count labels

- Added a MapLibre symbol layer for dynamic cluster count labels using cluster point counts.
- Preserved dynamic clusters, selected cluster feedback, aggregated routes, Inspector routing, and production D3/SVG behavior.

### `c7da28c` — Add MapLibre cluster selection feedback

- Added selected visual feedback for dynamic MapLibre clusters.
- Preserved selected feedback for aggregated routes and existing node/route selection behavior.
- Ensured blank-map clicks clear selected MapLibre visual state.

### `2ccaaeb` — Show MapLibre aggregated route details in inspector

- Taught the edge Inspector to render aggregated MapLibre route details.
- Preserved ordinary edge Inspector behavior for non-aggregated routes.
- Added display of visible source/target endpoints, represented letter totals, underlying route counts, and underlying directed route summaries.

### `084ce9d` — Enrich MapLibre aggregated route inspector payload

- Enriched aggregated route click payloads with member-route metadata, represented weights, endpoint types, linked route IDs, and aggregate summaries.
- Preserved route aggregation, route rendering, and existing click behavior.

### `526534a` — Aggregate MapLibre routes between visible endpoints

- Replaced faded original routes under clusters with aggregated visible-endpoint routes.
- Combined directed routes between visible nodes and visible clusters into thicker lines based on represented letter volume.
- Skipped routes that collapse into the same visible cluster.

### `8a563cc` — Hide MapLibre cluster member nodes

- Hid individual blue node features when they are represented by visible dynamic MapLibre clusters.
- Recalculated hidden node membership as clusters form or break apart during zoom/pan.
- Preserved cluster clicks, node clicks, route clicks, and production D3/SVG behavior.

### `be7d9ae` — Route MapLibre cluster clicks to inspector

- Routed clicks on dynamic MapLibre clusters into the existing Inspector pathway.
- Used MapLibre cluster leaves to recover represented member features and build a cluster-like selection payload.
- Preserved node/route Inspector behavior.

### `1e8456f` — Add dynamic MapLibre cluster diagnostic

- Replaced static diagnostic cluster points with a dynamic MapLibre clustered GeoJSON source derived from current node features.
- Confirmed that MapLibre can form clusters from Peridot node data without replacing the production D3/SVG path.

### `bb11f6a` — Add static MapLibre cluster lifecycle diagnostic

- Added a static diagnostic cluster source/layer to prove MapLibre could receive and render a cluster-like source/layer.
- Helped isolate source/layer lifecycle issues before dynamic cluster behavior was added.

### `3f26cc2` — Broaden MapLibre lifecycle diagnostics

- Broadened MapLibre diagnostics to report route, route-hit, node, selected-layer, source/layer, setup-phase, and rendered-count status.
- The initial implementation was too invasive and was repaired before commit; the committed version preserved route/node rendering while adding passive diagnostics.


### `4c9ed6f` — Extract MapLibre layer configuration

- Added `src/mapLibreLayerConfig.js`.
- Moved MapLibre source IDs, layer IDs, selected filters, selected ID filter helpers, and route/node/selected layer definition builders out of `src/MapLibreMapStage.jsx`.
- Preserved existing MapLibre preview behavior: route rendering, node rendering, route hit layer, Inspector click routing, cursor-only hover, and selected filter layers.
- Preserved production D3/SVG map behavior.

### `c420a5d` — Extract MapLibre feature builders

- Added `src/mapLibreFeatureBuilders.js`.
- Moved pure MapLibre feature-building helpers out of `src/MapLibreMapStage.jsx`.
- Extracted node GeoJSON feature construction, route GeoJSON feature construction, projectable node mapping, node-weight reading, and projectable route counting.
- Preserved MapLibre preview behavior and production D3/SVG behavior.

### `b7fb244` — Add MapLibre native geographic view plan

- Added `docs/MAPLIBRE_NATIVE_GEOGRAPHIC_VIEW_PLAN.md`.
- Recorded the decision to pivot from incremental D3/SVG-to-MapLibre adaptation toward a MapLibre-native geographic subsystem.
- Recorded rollback landmarks:
  - pre-MapLibre clean baseline: `4e08720`
  - MapLibre preview prototype checkpoint: `10051c0` / `checkpoint-maplibre-preview-prototype`
  - active native subsystem branch: `maplibre-native-geographic-view`
- Documented the intended MapLibre-native source/layer/event/selection/cluster architecture and staged migration plan.

---

## Recent committed work: MapLibre preview prototype on main

### `10051c0` — Add MapLibre selected filter layers

- Added selected node and selected route feedback in the MapLibre preview path.
- Reused existing MapLibre node and route GeoJSON sources instead of creating a separate selected GeoJSON source.
- Added selected layers with filters updated on MapLibre node/route click.
- Preserved existing Inspector click routing and avoided passing `selectedProps` from `App.jsx` to prevent map reset/flash.

### `b7c61a2` — Add MapLibre route hit layer

- Added a wide, nearly transparent MapLibre route hit layer above the visible route layer.
- Made route hover/click targeting easier without changing visible route styling.
- Kept node click precedence and preserved existing Inspector routing.

### `f2fdcf9` — Add cursor-only MapLibre hover detection

- Added cursor-only hover feedback for MapLibre node and route layers.
- Preserved click routing and avoided hover cards/diagnostic state after earlier broader hover patches proved too fragile.

### `5f3f053` — Route MapLibre feature clicks to inspector

- Routed clicks on MapLibre-rendered nodes and routes into the existing Peridot Inspector.
- Reused existing `handleNodeClick`, `handleEdgeClick`, and blank-map click behavior from the map-stage prop contract.
- Preserved the production D3/SVG map path.

### `2597462` — Remove MapLibre SVG node probe overlay

- Removed the obsolete SVG node-probe overlay from the MapLibre preview path.
- Left MapLibre-rendered GeoJSON nodes and routes as the preview rendering path.

### `7eebdee` — Add simple MapLibre node layer probe

- Added a simple MapLibre GeoJSON node source/layer to the gated preview path.
- Confirmed MapLibre can render Peridot node points as circle layers.
- Retained route rendering and Inspector-neutral diagnostics.

### `1f0d322` — Render MapLibre route probes as GeoJSON layer

- Moved route probes from SVG into a MapLibre-native GeoJSON source and line layer.
- Kept the MapLibre preview gated behind `?maplibrePreview=1`.
- Preserved production D3/SVG map behavior.

### `443d7ac` — Add MapLibre route projection probe

- Added diagnostic route projection probes to the MapLibre preview path.
- Confirmed Peridot route endpoint coordinates could be projected onto the MapLibre map.

### `6096069` — Add MapLibre projection probe

- Added diagnostic projected node probes to the MapLibre preview path.
- Passed graph/view-mode context into the dev-only MapLibre preview branch.

### `33afaae` — Add MapLibre preview diagnostics

- Added visible MapLibre preview diagnostics, including view state, center, zoom, and loading status.
- Preserved normal production map behavior.

### `da1463f` — Add MapLibre workspace preview path

- Wired the isolated MapLibre stage into the real Peridot workspace behind `?maplibrePreview=1`.
- Left the default production map as the existing D3/SVG path.

### `93f0961` — Add isolated MapLibre map stage

- Installed `maplibre-gl`.
- Added `src/MapLibreMapStage.jsx`.
- Added `src/mapStyleConfig.js`.
- Established an isolated MapLibre shell without replacing production map behavior.

### `1d816a5` — Add MapLibre hybrid map-system audit

- Added a planning/audit document for the initial MapLibre hybrid strategy.
- Recorded risks around projection, export, inspector interactions, cluster behavior, and tile/map-provider concerns.

### `4e08720` — Direct workflow charter baseline reference to changelog

- Updated `PROJECT_WORKFLOW_CHARTER.md` so baseline references point to `CHANGELOG.md` rather than hard-coding an outdated baseline.
- This commit is the clean pre-MapLibre rollback point.

---

## Deferred / rolled-back MapLibre work

### Cluster diagnostics, after `4c9ed6f`

Several uncommitted cluster diagnostic attempts were restored. Observed behavior:

- cluster feature data could be constructed in React-side diagnostics;
- MapLibre cluster source/layer setup repeatedly reported `source no` / `layer no`;
- in a broader attempt, nodes began disappearing at plausible clustering thresholds while clusters did not render and routes did not respond to node disappearance;
- one attempted cluster pass caused zoom/pan flashes and map reset behavior.

Conclusion: cluster work should not continue as a visual styling/layer-order problem. The next cluster pass should first instrument the MapLibre source/layer setup lifecycle directly, then add clusters through the same known-good imperative source/layer path already used by nodes and routes.

### Broad hover diagnostics, before `f2fdcf9`

Earlier hover-card and diagnostic patches were not committed because they either failed to apply cleanly or interfered with route click/hover behavior. The committed `f2fdcf9` intentionally kept the narrower cursor-only hover behavior.

### Selected-feedback attempt using `App.jsx` selected props

An earlier selected-feedback attempt passed selection state through `App.jsx`. It caused screen flash and map center/zoom reset, so it was restored. The successful approach in `10051c0` uses local MapLibre selected filter layers on existing sources.

### Broad MapLibre structural extraction attempt, `dd148e1`

The `dd148e1` constants extraction attempt regressed the migrated overlay by reintroducing an older preview-stage shape. It was superseded by `c0a4b8a`, which restored the migrated overlay. Future `MapLibreMapStage.jsx` structural work should avoid broad full-file rewrites unless the exact current source has been verified, and should prefer very small extraction passes with one acceptance test per pass.

---

## Existing D3/SVG and side-panel committed history

The following history remains relevant and should be preserved. Earlier entries should remain below this point unless clearly superseded by a more accurate retained entry.

### `8539c68` — Clarify timeline rail icon

- Replaced the timeline rail icon after testing several small-format timeline concepts.
- Settled on a simple clock-style icon because earlier horizontal progression concepts lost detail at rail-button size.
- Preserved Timeline tab behavior, playback, and active start/end year controls.

### `def4265` — Add timeline side panel tab

- Added a dedicated **Timeline** icon button to the shared side-panel rail.
- Moved existing year-range and playback controls out of the general Control Panel and into the Timeline tab.
- Preserved year-based filtering, playback behavior, and active start/end year adjustment.

### `6a672d9` — Add export side panel tab

- Added a dedicated **Export** icon button to the shared side-panel rail.
- Moved existing export controls out of the general Control Panel and into the Export tab.
- Preserved SVG, PNG, nodes CSV, and edges/routes CSV export behavior.

### `f1394c6` — Add data inputs side panel tab

- Added a dedicated **Data Inputs** icon button to the shared side-panel rail.
- Moved Geography, Raw Data, and Person Metadata upload controls out of the general Control Panel and into the Data Inputs tab.
- Preserved upload and data-ingestion behavior.

### `5b38c4e` — Update shared panel rail icons

- Updated the Controls rail icon from a cog to a three-line stack.
- Updated the Inspector rail icon from a three-line stack to a magnifying glass.
- Preserved existing Controls and Inspector switching behavior.

### `dcce703` — Style shared panel icon rail

- Styled the persistent side-panel icon rail as its own visual zone.
- Added a mossy/peridot-toned rail background.
- Tuned inactive, hover, and active rail-button colors.

### `2acdb91` — Remove obsolete side panel top tabs

- Removed the redundant horizontal Controls / Inspector tab row.
- Made the persistent icon rail the sole panel-view switcher.
- Preserved Controls, Inspector, close, and map-click auto-open behavior.

### `6142817` — Anchor shared panel icon rail to panel shell

- Changed the persistent icon rail from viewport-anchored positioning to panel-shell anchoring.
- Preserved closed-panel access and open-state close-button placement.

### `4653f20` — Remove obsolete audit documentation listings

- Removed stale listings for obsolete audit documents from active documentation.

### `8882b69` — Remove obsolete audit documentation references

- Deleted obsolete root-level audit documentation files that no longer functioned as active maintainer references.

### `06c1843` — Clean shared side panel source comments

- Removed obsolete source comments and unused import residue.
- Avoided renaming compatibility-sensitive `showLeftSidebar` / `showRightSidebar` state paths.

### `f7407eb` — Refresh documentation for shared panel baseline

- Refreshed documentation after the shared side-panel baseline.

### `4a17d1c` — Make inspector panel content-only

- Removed obsolete inspector shell/tab code from `src/InspectorPanel.jsx`.
- Preserved inspector behavior, including map-click auto-open, cluster inspector grouping, and Back behavior.

### `b62c74b` — Use shared side panel shell

- Converted the prior split panel arrangement into a single shared left-side panel shell.
- Preserved Inspector auto-open behavior.

### `e41d8bc` — Split side panel open state from active tab

- Split whether the side panel is open from which tab is active.

### `88b0c19` — Rename inspector panel shell for left dock

- Renamed the former `RightInspectorPanel.jsx` file to `InspectorPanel.jsx`.

### `2126c9b` — Open inspector in left panel dock

- Changed the inspector shell positioning so the Inspector opens on the left.

### `f98b3e5` — Add panel mode switcher tabs

- Added Controls / Inspector tabs to the open panel.

### `df4075a` — Move side panel toggles to left rail

- Moved both collapsed toggle icons to the left rail.

### `17cf020` — Enforce single active side panel

- Ensured only one side panel could be open at a time.

### `0063145` — Use menu icon for inspector toggle

- Changed the collapsed Inspector toggle icon from magnifying glass to menu/hamburger.

### `63003c1` — Group cluster inspector members by place

- Grouped cluster inspector members by place and ordered groups/members by volume.

### `fed4b5b` — Use volume-based zoom-responsive cluster sizing

- Made cluster sizing reflect represented letter volume and respond to zoom/proximity.

### `3187d05` — Increase dynamic node radius contrast

- Replaced overly compressed node sizing with dynamic log/max sizing.

### `ed39e55` — Make cluster nodes open actionable inspector views

- Made cluster nodes clickable and allowed cluster inspector members to open person/place detail views.

### `57b946e` — Make timeline year-based

- Converted the timeline from month-based controls to year-only controls.

### `79d5ae1` — Remove show all dates shortcut

- Removed the old **Show all dates** shortcut from Display Controls.

### `3fedd97` — Tighten minimum weight helper text

- Simplified minimum-weight helper copy while preserving the numeric input with Enter / Update behavior.

### `96064e2` — Set people as default view and simplify view buttons

- Replaced the old two-step view-selection UI with direct People / Place / Force-Directed buttons.
- Made **People** the default startup view.

---

## Earlier development history

Earlier documented entries should remain part of the repository history. Previously recorded entries include, but are not limited to:

- `391174a` — Refresh Peridot documentation for publication baseline
- `951b450` — Replace embedded sample data with current publication dataset
- `f859595` — Add itch.io HTML5 build packaging support
- `f959fac` — Use countries50m as the fixed basemap
- `b1fdbd5` — Update maintainer handoff documentation
- `dd12281` — Normalize summary panel spacing
- `4fdaf73` — Rename timeline panel heading
- `db5bb1f` — Tighten left panel organization
- `ba746b1` — Simplify theme panel text
- `c0fc600` — Retune active country fills for peridot and modern maps
- `56f0080` — Highlight countries containing visible nodes
- `5cbe9c3` — Refine early modern node hover and selected colors
- `850176f` — Refine hovered and selected node states
- `3e43dc9` — Add hovered node color feedback
- `919ea5f` — Increase green layering in peridot map theme
- `c666d29` — Add peridot default app theme
- `9be5f4a` — Tighten maintainer docs audit fixes
- `43403c3` — Restore detail to maintainer documentation
- `02ecb11` — Document inspector navigation feature set
- `5af819b` — Add inspector back navigation
- `b3e6fe8` — Add place navigation sections to person inspector
- `6772c1d` — Clarify connected correspondents count label
- `ab0e1fe` — Show relationship counts in connected correspondents buttons

Continue preserving older entries already recorded in repository history. Do not delete older documented history unless it is clearly duplicated by a more accurate retained entry.
