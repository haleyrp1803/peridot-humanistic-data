# Peridot Visualize — Component, State, Geometry and Styling Ownership Audit

**Date:** 17 October 2026  
**Classification:** Exploratory architecture audit; **no application source changes**.

## Provenance and scope

This audit uses the user's `src(20261016-141912).zip` archive and overlays the delivered replacement files in order: V7a, V7b, Playback Oxblood, V7c Single Editorial Frame. These are the latest source versions available to this audit, **not a verified checkout of the user's current Windows working tree**. Previous passes have not been independently browser-tested in this environment. Current screenshots corroborate visible effects, but do not establish every computed CSS property or interaction. No Git commit or other local change is made by this report.

The Visualize workspace's four tabs are Map, Network, Timeline and Charts. This report covers their main controls, common playback, Inspector and contextual Export, including empty/unavailable states.

## 1. Visual and functional component tree

```text
src/main.jsx                            application entry and CSS import sequence
└── src/App.jsx                          EuropeNetworkMapApp: top-level application state
    ├── PeridotGlobalHeader.jsx         site navigation, active route
    └── AppMainWorkspace                active workspace, persistent/hidden mounts
        └── PeridotVisualizationsWorkspace.jsx
            ├── visualization header    Map | Network | Timeline | Charts tabs
            │   └── VisualizationExportMenu    contextual export (menu/portal/options)
            ├── stage transition shell  lightweight stage veil; stable mounts
            │   └── chosen body
            │       ├── Map or Network
            │       │   ├── outer div: peridot-map-plate peridot-visualize-map-plate
            │       │   ├── MapStage (App.jsx) -> LegacyD3MapStage -> SvgMap
            │       │   │   ├── SVG defs, textures, clip path, projection/force content
            │       │   │   ├── SVG nodes, edges, clusters, selection and labels
            │       │   │   ├── MapLegendOverlay (mapStageComponents.jsx)
            │       │   │   ├── MapControlsOverlay (mapStageComponents.jsx)
            │       │   │   └── HoverCardOverlay (mapStageComponents.jsx)
            │       │   └── GeographicMapSettingsPanel (Map tab only)
            │       ├── Timeline
            │       │   └── PeridotTimelineWorkspace.jsx
            │       │       ├── scrollable vertical/horizontal temporal plot
            │       │       ├── axis/ticks, interval spans, relationship lines
            │       │       ├── EventCard and category markers
            │       │       └── OrientationControl, ZoomControl, CategoryControls
            │       ├── Charts
            │       │   └── AnalyticsPanelContent (AnalyticsPanel.jsx)
            │       │       ├── chart-builder tabs/types, variables, field selectors
            │       │       ├── category/aggregation controls
            │       │       └── AnalyticsChartPreview (analyticsChartComponents.jsx)
            │       └── UnavailableVisualizationState (if capability absent)
            └── VisualizationTimelineScrubber (timelinePlaybackComponents.jsx)
                ├── time-type checkbox menu
                ├── event mode selector
                ├── left/right temporal range clamps (two range inputs)
                ├── playback-position scrubber (third range input)
                └── play/pause, reset, speed selector

AppMainWorkspace also mounts InspectorContent as a workspace overlay over Visualize
on the appropriate presentation state, using InspectorPanel.jsx and Inspector
node/edge/cluster/timeline event components passed from App.
```

## 2. State/data flow

1. `App.jsx` receives normalized active dataset and applied Explore/Search filters, and derives scoped rows, geographic/force graph(s), temporal assertions, events, chart data and availability.
2. `App.jsx` constructs `mapStageProps`, `visualizationWorkspaceProps`, `timelineWorkspaceProps`, `timelineControlsProps`, `exportControls`, and inspector state/handlers.
3. `PeridotVisualizationsWorkspace.jsx` chooses which child to render. Local `selectedTool` coordinates visual tabs with callbacks to App (the workspace also observes its `visualizationsWorkspacePanel` prop). A short transition veil is managed locally.
4. Playback UI changes App-owned range, active records, playback index, mode, speed and play/pause. App re-derives the displayed scope; Map/Network/Timeline/Charts receive updated props. **Playback is not an independent second dataset.**
5. Selecting a map/network item or Timeline event routes through App's interaction/selection logic and Inspector presentation/history. Filtering and selected state must remain synchronized.
6. Contextual Export uses App's SVG/PNG/CSV handlers for Map/Network and registered chart-export handlers from Analytics for Charts. `exportHelpers.js` serializes SVG or rasterizes/export rows.

### Which code is safe to style versus behavior-sensitive?

| Region | Visual/presentational owner | Behavioral/geometry owner | Main regression risk |
|---|---|---|---|
| Global nav | `PeridotGlobalHeader.css` | `PeridotGlobalHeader.jsx`, App routing | route/state persistence |
| Visualize tabs, Export placement, shell | `PeridotVisualizationsWorkspace.jsx`, `styles/components/panels.css` | same component + App callbacks | selected-state cascade, overlay stacking |
| Map/Network outer plate | `index.css`, `styles/components/panels.css`, JSX utility classes | `PeridotVisualizationsWorkspace.jsx` | stage dimension and overflow |
| Map/Network SVG and internal viewport | theme CSS variables and `App.jsx` SVG presentation | `App.jsx` `SvgMap`, `mapLayoutHelpers.js`, `mapInteractionHandlers.js`, network/force helpers | zoom/pan/clipping/projection/export |
| Legend | `mapStageComponents.jsx`, shared panel CSS | `MapLegendOverlay` local open/closed state | clipping, readability, counts |
| Zoom/reset and hover | `mapStageComponents.jsx`, shared CSS | `SvgMap` view and animations, `MapControlsOverlay` pointer handlers | hold-to-zoom, reset, hover position |
| Geographic Map Settings | `GeographicMapSettingsPanel` in `PeridotVisualizationsWorkspace.jsx` | App-provided `geographicAnchorControls` | anchors and available options |
| Timeline canvas, axis, cards, controls | `PeridotTimelineWorkspace.jsx`, `styles/workspaces/timeline-contrast.css`, theme roles | `PeridotTimelineWorkspace.jsx`, `peridotTimelineWorkspaceModel.js` | zoom/scroll, card connections, orientation, categories |
| Charts | `AnalyticsPanel.jsx`, `AnalyticsPanel.css`, `analyticsChartComponents.jsx` | `analyticsConfig.js`, `analyticsDerivationHelpers.js`, App chart state | metrics, aggregation, chart export |
| Playback toolbar | `timelinePlaybackComponents.jsx`, `styles/components/panels.css`, `index.css` | `timelinePlaybackComponents.jsx`, `timelinePlaybackHelpers.js`, App state | clamps, scrubber, timer, selection/filter |
| Inspector | `InspectorPanel.css` and corresponding inspector components | App Inspector state, `interactionHelpers.js` | selection, history, overlay stacking |
| Export | `VisualizationExportMenu` in workspace, `exportHelpers.js` | App handlers, chart handler registration | actual exported data/surface |
| No-capability views | `UnavailableVisualizationState`, `CapabilitySummaryWorkspace` | availability derived by App | correct explanation/actions |

## 3. The invisible map/network boundary — confirmed source cause

`App.jsx`'s `SvgMap` uses full SVG dimensions `width` and `height`, **but defines the drawing frame separately**:

```js
const frame = { x: 20, y: 20, w: width - 40, h: height - 40 };
```

It defines `<clipPath id="map-frame-clip"><rect x={frame.x} y={frame.y} width={frame.w} height={frame.h} rx="16" /></clipPath>`, then renders the main geographic/network artwork in `<g clipPath="url(#map-frame-clip)">`. Separate background rectangles fill (a) the full SVG and (b) the inset frame. The clipping group includes zoomed/panned map content and data marks. Map labels also have explicit `inFrame` checks against `frame.x` through `frame.x + frame.w` and the equivalent Y bounds. The viewport's dimension/pointer and default-fit calculations also matter.

**Result:** Deleting the visible SVG outline does *not* remove the `20px` inset, the rounded SVG clip, or the label visibility tests. The screenshots' exposed surround and sharp map stop are explained by this arrangement. A true edge-to-edge plotting viewport requires inspecting and coordinating these uses of `frame`, not just removing its stroke. The outer CSS plate's border, inset shadow and `overflow-hidden` are separate mechanisms.

Practical safe plan for an eventual geometry pass: enumerate all `frame.*` uses and corresponding clip/label guards; choose whether the desired plot should extend to inner border or maintain an intentional content padding; ensure nonzero width/height; then run geographic and force views at reset, pan, zoom and hover. Coordinate changes are **behavior-adjacent** and deserve dedicated testing, not an incidental appearance fix.

## 4. Playback controls — explicit construction

`VisualizationTimelineScrubber` accepts App-owned props (time entries, rangeStart/rangeEnd and setters, selectedRowsForPlayback, playback index/setter, play state/setter, mode/speed, temporal roles). It holds local **preview interaction** state to avoid prematurely applying partially dragged range changes. It distinguishes pointer start/preview/commit, keyboard edits and blur commits.

- **Two temporal clamps:** independent native `type="range"` inputs, start and end. Their ARIA labels are `Timeline start year` and `Timeline end year`; handlers coordinate preview and commit.
- **Playback notch/scrubber:** a third `type="range"`, class `peridot-playback-scrubber`, constrained visually to the selected window through inline `left`, `right`, `width` styles and indexed against `selectedRowsForPlayback`.
- **Track:** decorative background and active selection segment; segment `left`/`right` follow range percentages. Colors are themed; dimensions and hit areas should be guarded.
- **Play/Pause:** one button, `className="peridot-playback-play ..."`; `aria-label` and visible icon switch based on `isPlaying`. CSS in `panels.css` targets `.peridot-playback-play`, its `:hover`, and `[aria-label="Pause timeline playback"]`. The JSX also applies Tailwind/arbitrary classes for default, hover, border, text and disabled states. This distributed ownership is the likely reason the observed default/playing/hover appearance differs from the intended design. **Do not change playback logic just to fix colors.**
- **Reset/Speed:** same component, speed select and reset callbacks; field styles are a mixture of JSX utilities and shared CSS.
- **Time types:** dropdown of checkbox-controlled enabled temporal roles, with an option to restore all.
- **Event mode:** cumulative/co-current select, which also stops playback on change.

`timelinePlaybackHelpers.js` owns temporal calculations and row-window filtering; playback component owns interaction/UI; App owns cross-view playback state. Retain distinct clamp and scrubber inputs and accessible keyboard editing.

## 5. Timeline workspace (different from the bottom playback bar)

`PeridotTimelineWorkspace.jsx` directly owns its horizontal/vertical scroller and interactive axis, timeline zoom, orientation, event-card geometry, connection drawing, category filter menu, viewport measurement, wheel and pointer panning, scroll synchronization, and virtualization. It derives event connections using `buildPeridotTimelineConnections` from `peridotTimelineWorkspaceModel.js`. The model builds events from canonical temporal assertions, evidence categories and relationship rows.

Its canvas itself uses `peridot-map-plate` (a **shared old class**) but not the Map-specific `.peridot-visualize-map-plate`, so CSS changes scoped to Map/Network may not affect the Timeline shell. Timeline palette-specific presentation is imported locally from `styles/workspaces/timeline-contrast.css`. Its toolbar groups, event cards and category popup also have substantial JSX-local utility classes. Distinguish **Timeline view controls** (orientation, zoom, categories) from **shared timeline playback controls** (bottom range bar).

## 6. Charts workspace

`AnalyticsPanelContent` owns chart-builder controls, selections, variables, categorical filters and export registration. `analyticsChartComponents.jsx` draws actual chart types. `analyticsConfig.js` holds chart definitions/defaults; `analyticsDerivationHelpers.js` aggregates/scopes rows and computes chart-ready data. Styles are distributed through `AnalyticsPanel.css`, `index.css` and JSX. Chart data colors are analytical encodings, not brand chrome, and must not be recolored through a blanket editorial palette rewrite.

## 7. CSS/theme cascade and ownership

`main.jsx` imports in order: `index.css` -> `styles/foundations/tokens.css` -> `styles/foundations/typography.css` -> `styles/components/buttons.css`, `forms.css`, `cards.css`, `panels.css` -> `InspectorPanel.css` -> `AnalyticsPanel.css` -> `PeridotSearchWorkspace.css` -> mapping/About/tutorial/feedback CSS. `PeridotTimelineWorkspace.jsx` imports `timeline-contrast.css` locally; Header/other modules have component CSS imports. JSX utility classes and inline styles are an additional layer. Theme variable injection comes from `peridotTheme.js` and compatibility `peridotColorPalette.js`.

**Existing accumulation to inspect:** `index.css` has `.peridot-map-plate` rules; `panels.css` has original shared plate ornament rules plus V7a/V7b/V7c additions. Repeated later selectors, old JSX Tailwind classes, and SVG-native geometry together determine appearance. The current V7c CSS even adds `!important` for the plate border color; consolidation should reconcile declarations at ownership sites rather than keep appending overrides. Theme roles remain authoritative for interface colors; record-encoded values are separate.

## 8. Recommended safe editing sequence after this audit

1. **Decide viewport contract:** whether map/network artwork and labels can extend exactly to the single border, and what padding/rounded clip (if any) remains. Implement as a *bounded geometry/visual* correction with Map/Network regression checks.
2. **Reconcile playback Play states** at `timelinePlaybackComponents.jsx` + existing CSS owner: CSS for resting/hover/running/disabled/focus, no conflicting JSX utility colors. Keep button sizing, handlers, clamps, notch and range input geometry identical.
3. **Consolidate shared stage/plate styles:** identify actual computed winners from `index.css`, `panels.css` and JSX. Remove *verified* redundant treatments, avoiding new folders, new theme engines, or blanket CSS deletions.
4. **Check all four tabs and overlays:** default/reset/zoom/pan, hover and selection, legend expand/collapse, Map Settings, Timeline orientation and scrolling, category popover, Charts controls and chart export, contextual export, Inspector compact/full, and playback modes with filtered data.
5. **Test accessibility and persistence:** keyboard focus, drag/keyboard clamp & scrubber, browser zoom, reduced motion, active visualization switching, persistent viewport/state, unavailable modes.

## 9. Source scope and verification status

Files directly inspected for this report: `App.jsx`, `PeridotVisualizationsWorkspace.jsx`, `mapStageComponents.jsx`, `timelinePlaybackComponents.jsx`, `PeridotTimelineWorkspace.jsx`, `AnalyticsPanel.jsx`, `main.jsx`, `index.css`, `styles/components/panels.css`, `styles/workspaces/timeline-contrast.css`, and named helper module imports. This is a **source-level architecture assessment**; no build, browser DOM/computed-style capture, performance measurement, or live Git working-tree comparison was performed. Before replacement code, read the **exact current complete file(s)** and reconcile with any local changes after V7c.
