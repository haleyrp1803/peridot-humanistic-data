# Peridot Routing Contract Audit

**Draft status:** Routing and workspace transition audit updated after commit `82178c5` — `Promote Search to full workspace`.

**Purpose:** Document how Peridot’s current navigation and workspace routing works, how it should ideally work after the interface redesign, and how to transition safely from the current hybrid state to the intended workspace-first architecture.

**Scope:** Navigation model, workspace modes, hamburger menu routing, side-panel dependencies, current/ideal route contracts, migration sequence, fragile zones, and acceptance tests.

**Not in scope:** This document does not implement code changes. It does not redesign the Inspector, generalize Timeline playback, extract components, or update README / Maintainer’s Guide / Changelog. Those documentation updates should occur after implementation milestones.

---

## 1. Executive summary

Peridot is currently in a successful but transitional interface state. The app has moved away from the persistent icon rail and toward a hamburger-triggered menu plus full-window workspaces. However, it still depends on the older shared side-panel system for only a small number of workflows.

The current architecture has two overlapping navigation systems:

```text
New routing system:
Hamburger menu → App.jsx workspace mode → full-window workspace or side-panel bridge

Legacy routing system:
LeftControlPanel.jsx → shared side panel → active side-panel view → panel content
```

This overlap is acceptable during migration. It has allowed Home, Data, Theme, Visualizations, Export, and Search & Filter to become full workspaces without breaking Timeline or Inspector. The cost is that some routing paths are now hybrid, and several old Controls/rail concepts remain in the code even though they are no longer part of the intended user-facing interface.

The next stage should not be a broad deletion pass. It should be a staged transition that preserves current functionality while gradually moving remaining side-panel workflows into full workspaces or explicitly retained lightweight panels.

---

## 2. Current source-of-truth state

Current verified baseline:

```text
82178c5 — Promote Search to full workspace
```

Recent redesign sequence:

```text
82178c5 Promote Search to full workspace
2c53796 Promote Export to full workspace
8fc96b3 Extract Peridot workspace config
9cd3f3f Clean workspace routing comments
9240745 Fix Visualizations workspace export
25fc046 Extract Peridot visualizations workspace
fcf6bb6 Extract Peridot data workspace
9428766 Extract Peridot theme workspace
18c2912 Extract Peridot home workspace
6c16403 Extract Peridot hamburger menu
30b114b Add Peridot routing contract audit
8384dee Fit Analytics workspace preview
```

Current source-of-truth branch:

```text
main
```

Current intentionally untracked folder:

```text
itch_upload/
```

---

## 3. Current routing architecture

### 3.1 Workspace modes

`App.jsx` currently defines the following workspace modes:

```text
home
data
visualizations
search
inspector
timeline
theme
export
```

The default workspace mode is currently `home`.

These workspace modes are future-facing and now mostly correspond to full-window workspaces. Timeline and Inspector remain transitional: their workspace labels exist, but their visible UI still routes through legacy side-panel content.

### 3.2 Current full-window workspaces

The following are already implemented as full-window workspaces in `App.jsx`:

| Workspace | Current implementation status | Notes |
|---|---|---|
| Home | Full workspace | Startup landing page with Upload my data / Use sample data paths. |
| Data | Full workspace | Unified table/workbook upload path for CSV / TSV / XLSX / XLS. |
| Visualizations | Full workspace | Hosts Place Map, People Network, Force-Directed, and Analytics. |
| Theme | Full workspace | Appearance presets and return-to-visualizations path. |
| Search & Filter | Full workspace | Advanced-search/filter scope controls moved out of the side panel. |
| Export | Full workspace | Export controls moved out of the side panel, with a live visualization preview preserved for SVG/PNG export. |

### 3.3 Current side-panel-dependent workflows

The following are still routed through the existing `LeftControlPanel.jsx` shared side-panel content:

| Workflow | Current route | Notes |
|---|---|---|
| Timeline | Hamburger → side-panel tab | Still panel-based and date/playback-coupled. The intended direction is now a bottom visualizations timeline/scrubber, not a standalone full workspace. |
| Inspector | Selection click or hamburger → side-panel tab | Most fragile remaining side-panel workflow. |

Analytics is now conceptually part of the Visualizations workspace. It should no longer be treated as primarily side-panel-based, even though old side-panel Analytics code remains in `LeftControlPanel.jsx`.

### 3.4 Legacy side-panel system still present

`LeftControlPanel.jsx` still contains:

- old shared side-panel shell;
- old icon rail component;
- old Controls fallback path;
- old Data Inputs path;
- Search & Filter panel content;
- Timeline panel content;
- Export panel content;
- Analytics panel path;
- Inspector content routing.

Some of this code is now obsolete from the user’s visible hamburger workflow, but it remains structurally relevant because the app still uses the legacy shell for Timeline and Inspector.

---

## 4. Current menu routing contract

The hamburger menu should be treated as the current primary user-facing navigation surface.

### 4.1 Current routing table

| Menu item | Current visible destination | Current technical route | Current status |
|---|---|---|---|
| Home | Home workspace | `workspaceMode = home`; side panel closed | Stable |
| Data | Data workspace | `workspaceMode = data`; side panel closed | Stable |
| Visualizations | Visualizations workspace | `workspaceMode = visualizations`; visualization panel defaults to Place Map | Stable after viewport fixes |
| Search & Filter | Search workspace | `workspaceMode = search`; side panel closed | Stable after promotion |
| Timeline | Legacy side panel | `workspaceMode = visualizations`; `activePanelTab = timeline`; side panel open | Transitional |
| Analytics | Visualizations workspace | `workspaceMode = visualizations`; `visualizationsWorkspacePanel = analytics`; side panel closed | Stable after sizing fixes |
| Inspector | Legacy side panel | `workspaceMode = inspector`; `activePanelTab = inspector`; side panel open | Transitional and fragile |
| Theme | Theme workspace | `workspaceMode = theme`; side panel closed | Stable |
| Export | Export workspace | `workspaceMode = export`; side panel closed | Stable after promotion |

### 4.2 Important current inconsistency

Timeline currently sets the workspace mode to `visualizations` while opening a side panel. This is acceptable temporarily because Timeline still operates over the active visualization/data scope. Search and Export have already been promoted to full workspaces.

The more accurate future model is now:

```text
Search & Filter → Search workspace
Timeline → bottom visualizations timeline / global scrubber controller
Export → Export workspace
Inspector → Inspector workspace / evidence dossier
```

### 4.3 Inspector special case

Inspector is different from other menu items. It can be opened intentionally from the hamburger menu, but it is also opened automatically by interactions in the visualization layer:

- node click;
- edge/route click;
- cluster click;
- linked person/place/letter navigation.

Any routing transition involving Inspector must preserve automatic Inspector opening from map/network interaction. This is the highest-risk remaining routing path.

---

## 5. Current visualization routing contract

### 5.1 Visualizations workspace structure

The Visualizations workspace currently hosts four modes:

| Visualization panel | State behavior | Visible behavior |
|---|---|---|
| Place Map | `viewMode = geographic`; `personLayoutMode = geographic`; `visualizationsWorkspacePanel = place-map` | Renders geographic route/map view. |
| People Network | `viewMode = person`; `personLayoutMode = geographic`; `visualizationsWorkspacePanel = people-network` | Renders geography-anchored person network. |
| Force-Directed | `viewMode = person`; `personLayoutMode = force`; `visualizationsWorkspacePanel = force-directed` | Renders force-directed person network. |
| Analytics | `visualizationsWorkspacePanel = analytics` | Renders Analytics workspace content instead of map stage. |

### 5.2 Viewport measurement dependency

Map/network rendering depends on viewport measurement. Because Analytics and map/network modes now switch inside the same `visualizations` workspace, viewport initialization must respond to:

- workspace mode;
- active visualization panel;
- view mode;
- person layout mode.

This was already corrected after Analytics caused map/network views to stop rendering on return. Future changes should avoid regressing this dependency.

### 5.3 Ideal visualization contract

In the final model, Visualizations should own all chart/map/network mode choices. It should not rely on old Controls panel state for visualization selection.

Ideal long-term visualizations model:

```text
Visualizations workspace
  → Network/map views
      → Place Map
      → People Network
      → Force-Directed
  → Chart views
      → Bar Chart
      → Grouped Bar Chart
      → Stacked Bar Chart
      → Line Chart
      → Multi-Line Chart
      → Histogram
      → Pie Chart
      → Sunburst Chart
      → Heatmap
```

The current implementation has moved the concept in this direction but has not yet fully redesigned Analytics as a first-class chart workspace. It embeds the existing Analytics UI into the Visualizations workspace with sizing constraints.

---

## 6. Current data routing contract

### 6.1 Home to Data

Current route:

```text
Home → Upload my data → Data workspace
```

The Data workspace is now the primary public data-ingestion surface.

### 6.2 Data upload path

Current route:

```text
Data workspace
  → Download CSV template, if needed
  → Upload table or workbook
  → Stage CSV / TSV / XLSX / XLS
  → Open mapping workspace
  → Confirm mapping/import
  → Visualizations workspace, defaulting to Place Map
```

### 6.3 Data path principle

There should no longer be a separate “Upload completed CSV” control in the new Data workspace. CSV and TSV are accepted through the same xlsx-inclusive table/workbook uploader.

### 6.4 Current legacy issue

The old Data Inputs panel in `LeftControlPanel.jsx` may still contain older copy and upload assumptions. It is no longer the primary path from the hamburger menu, but it should eventually be removed or reconciled to prevent stale UI if reached accidentally.

---

## 7. Current Theme routing contract

### 7.1 Current route

```text
Hamburger → Theme → Theme workspace
```

Theme no longer opens through the old Controls side panel.

### 7.2 Current behavior

The Theme workspace offers:

- Peridot default;
- Early modern map;
- Modern map;
- return to Visualizations.

### 7.3 Ideal behavior

Theme can remain a full workspace. It is low-risk and relatively self-contained.

Future additions may include:

- contrast/accessibility options;
- chart theme options;
- export preview styling;
- reset-to-default confirmation.

---

## 8. Current Search & Filter routing contract

### 8.1 Current route

```text
Hamburger → Search & Filter → full Search workspace
```

### 8.2 Current role

Search & Filter defines the active filtered dataset consumed by:

- Visualizations;
- Analytics;
- Timeline;
- Inspector;
- Export.

### 8.3 Current risk

Search & Filter has been promoted to a full workspace. It remains behaviorally sensitive because it defines the active filtered dataset consumed by the rest of the app.

### 8.4 Ideal route

```text
Hamburger → Search → full Search workspace
```

Current behavior now matches this route. Possible future enhancements:

- Search results table/list in main workspace;
- advanced filters in a spacious layout;
- current active dataset summary;
- actions to open matching records in Inspector;
- actions to send filtered data to Visualizations or Analytics.

### 8.5 Transition recommendation

Search has already been promoted. Future Search work should be treated as refinement rather than routing migration. Do not combine Search refinement with Inspector promotion or Timeline redesign.

---

## 9. Current Timeline routing contract

### 9.1 Current route

```text
Hamburger → Timeline → legacy side panel Timeline view
```

### 9.2 Current role

Timeline currently controls date range and playback for the active correspondence data, but it is still primarily shaped by the older map/network playback model.

### 9.3 Ideal route

The preferred long-term direction is no longer a separate full Timeline workspace. The intended model is a timeline controller integrated into the active visualization context:

```text
Visualizations workspace
  → bottom timeline strip / scrubber
  → toggled on or off by the user
  → animates the currently active visualization
```

The timeline should eventually be a long horizontal control at the bottom of the Visualizations workspace, letting users scrub or animate while still seeing the active map, network, chart, histogram, or other visualization.

### 9.4 Transition recommendation

Do not generalize Timeline yet. Keep the current side-panel Timeline bridge until the Visualizations workspace is ready to host a bottom timeline/scrubber. Treat future Timeline work as part of the visualization-stage interaction design, not as an ordinary workspace promotion.

---

## 10. Current Export routing contract

### 10.1 Current route

```text
Hamburger → Export → full Export workspace
```

### 10.2 Current role

Export now saves visualization and derived data outputs from a full workspace. It is scope-sensitive and must clearly indicate whether it is exporting:

- loaded data;
- filtered data;
- visible data;
- selected data;
- charted data.

### 10.3 Ideal route

```text
Hamburger → Export → full Export workspace
```

The full Export workspace now exists and should continue to show format controls, scope labels, and a live visualization preview for SVG/PNG export.

### 10.4 Transition recommendation

Export has already moved out of the legacy panel. Future Export work should be refinement only, not routing migration.

---

## 11. Current Inspector routing contract

### 11.1 Current route

Inspector currently opens in two ways:

```text
User-driven:
Hamburger → Inspector → legacy side panel Inspector view

Interaction-driven:
Node / edge / cluster click → Inspector side panel auto-opens
```

### 11.2 Current role

Inspector is now the evidence-reading system for:

- selected people;
- selected places;
- routes/edges;
- clusters;
- linked letters;
- person/place navigation;
- internal Back navigation.

### 11.3 Current risk

Inspector is the most fragile remaining workflow because it depends on old shared-panel compatibility paths. A previous attempt to rename or clean up old left/right sidebar naming broke Inspector auto-open behavior. Therefore, Inspector routing must be treated as high-risk.

### 11.4 Ideal route

The long-term model should be:

```text
Selection in visualization
  → compact selection affordance, if needed
  → full Inspector workspace / evidence dossier
```

and:

```text
Hamburger → Inspector → full Inspector workspace
```

The full Inspector workspace should support:

- profile header;
- entity-type badge;
- key metrics row;
- related people;
- related places;
- directed routes;
- linked-letter records;
- selected custom uploaded fields;
- breadcrumbs or navigation context;
- Back behavior;
- possible later “filter to this entity” actions.

### 11.5 Transition recommendation

Do not promote Inspector until after one or more low-risk routing/component extractions. The recommended sequence is:

1. document routing contract;
2. extract hamburger menu from `App.jsx`;
3. optionally remove safely unreachable Controls exposure;
4. then design the full Inspector workspace;
5. then implement Inspector promotion in a narrow behavior + visual pass.

---

## 12. Obsolete or transitional paths

### 12.1 Legacy Controls path

Current status:

- no longer exposed directly through hamburger menu;
- still present in `LeftControlPanel.jsx` fallback rendering;
- still supported by old state variables in `App.jsx`.

Ideal status:

- remove as visible user-facing path;
- preserve only any underlying controls that remain useful in their new workspaces;
- eventually delete dead state and render branches after confirming nothing depends on them.

### 12.2 Legacy icon rail

Current status:

- visually replaced by hamburger menu;
- code still exists in `LeftControlPanel.jsx`;
- suppressed from the new visible interface.

Ideal status:

- remove the old icon rail component after confirming all routing is covered by hamburger/workspace logic;
- do this only after Search/Timeline/Export/Inspector side-panel dependencies are understood.

### 12.3 Old Data Inputs panel

Current status:

- no longer the primary Data route;
- code and copy still exist in `LeftControlPanel.jsx`.

Ideal status:

- remove or reconcile with the new Data workspace;
- ensure no user-facing stale copy remains.

### 12.4 Old Analytics side-panel path

Current status:

- Analytics now lives in Visualizations workspace;
- old Analytics panel route likely remains in `LeftControlPanel.jsx`.

Ideal status:

- either remove old side-panel route or ensure it simply forwards to Visualizations → Analytics;
- avoid duplicate Analytics surfaces.

---

## 13. Ideal final routing architecture

The target architecture should be workspace-first:

```text
Hamburger menu
  → Home workspace
  → Data workspace
  → Visualizations workspace
  → Search workspace
  → Inspector workspace
  → Timeline controller/workspace
  → Theme workspace
  → Export workspace
```

### 13.1 Ideal route table

| Menu item | Ideal destination | Ideal state owner | Notes |
|---|---|---|---|
| Home | Full workspace | `App.jsx` or extracted Home component | Landing / onboarding. |
| Data | Full workspace | Data workspace component | Upload, staging, mapping, validation. |
| Visualizations | Full workspace | Visualizations workspace component | Maps, networks, charts. |
| Search | Full workspace | Search workspace component | Advanced search and filter scope. |
| Inspector | Full workspace | Inspector workspace component | Evidence dossier. |
| Timeline | Global controller or full workspace | Timeline controller/workspace | Animate active visualization. |
| Theme | Full workspace | Theme workspace component | Appearance presets. |
| Export | Full workspace | Export workspace component | Output formats and scopes. |

### 13.2 What should remain as a panel?

Long-term, the old side panel should not remain the primary home for major workflows. However, the app may still need smaller drawers or overlays for:

- lightweight settings;
- contextual quick actions;
- compact selection previews;
- map controls;
- temporary modal workflows.

The design goal is not “no panels ever.” The goal is to stop placing major application areas inside one cramped side panel.

---

## 14. Transition plan

### Phase R1 — Preserve current state as the routing baseline

**Type:** documentation / audit

**Goal:** Treat `8384dee` as the current routing baseline and document current/ideal paths.

**Status:** This document fulfills that phase.

**Acceptance test:** The team can describe where each hamburger item currently routes and where it should eventually route.

### Phase R2 — Extract hamburger menu component

**Type:** structural

**Files likely in scope:**

```text
src/App.jsx
src/PeridotHamburgerMenu.jsx
```

**Goal:** Reduce `App.jsx` bulk without changing routing behavior.

**Out of scope:**

- side-panel cleanup;
- Inspector redesign;
- Search promotion;
- Timeline generalization;
- Analytics refactor.

**Acceptance test:**

```text
Hamburger opens/closes.
All menu items route exactly as before extraction.
Search/Timeline/Export/Inspector still open.
Home/Data/Visualizations/Theme still open full workspaces.
Map/network/Analytics switching remains stable.
Node/edge/cluster clicks still open Inspector.
```

### Phase R3 — Remove or hard-disable unreachable Controls exposure

**Type:** structural cleanup

**Files likely in scope:**

```text
src/App.jsx
src/LeftControlPanel.jsx
```

**Goal:** Remove stale Controls path from visible UI and reduce obsolete state, but only after full-file review.

**Out of scope:**

- rewriting side-panel shell;
- changing Inspector auto-open;
- changing Search/Timeline/Export behavior.

**Acceptance test:**

```text
No visible Controls path exists.
Theme remains full workspace.
Search/Timeline/Export/Inspector still open.
Node/edge/cluster clicks still open Inspector.
Build passes.
```

### Phase R4 — Extract low-risk full workspaces

**Type:** structural

Recommended order:

```text
1. PeridotHomeWorkspace.jsx
2. PeridotThemeWorkspace.jsx
3. PeridotHamburgerMenu.jsx, if not already extracted
4. PeridotDataWorkspace.jsx
5. PeridotVisualizationsWorkspace.jsx
```

**Goal:** Reduce `App.jsx` pressure while preserving behavior.

**Acceptance test:** Each extracted component behaves exactly as before extraction.

### Phase R5 — Search promotion

**Type:** structural + behavior

**Goal:** Promote Search & Filter to a full workspace.

**Status:** Complete as of `82178c5` — `Promote Search to full workspace`.

### Phase R6 — Promote Inspector to full workspace

**Type:** behavior + visual

**Goal:** Move the Inspector from side panel into a full evidence-dossier workspace while preserving auto-open from map/network clicks.

**Highest-risk acceptance tests:**

```text
Node click opens Inspector workspace.
Edge click opens Inspector workspace.
Cluster click opens Inspector workspace.
Contained cluster member opens detail.
Linked person/place/letter navigation works.
Back behavior works.
Returning to visualization preserves map/network state.
```

### Phase R7 — Generalize Timeline as bottom visualizations controller

**Type:** behavior + visual

**Goal:** Add a long bottom timeline/scrubber to the Visualizations workspace so users can animate or scrub the active visualization while still seeing the map, network, or chart.

**Do not start until:** Visualizations and routing model are stable.

### Phase R8 — Export promotion

**Type:** behavior + visual

**Goal:** Move export controls into a full workspace with clearer format/scope cards.

**Status:** Complete as of `2c53796` — `Promote Export to full workspace`.

---

## 15. Do-not-break list

During all routing work, preserve:

```text
Home opens by default.
Upload my data opens Data workspace.
Use sample data opens Visualizations workspace.
Mapped imports route to Visualizations workspace, defaulting to Place Map.
Place Map renders.
People Network renders.
Force-Directed renders.
Analytics renders in Visualizations workspace.
Switching from Analytics back to map/network views still renders.
Search & Filter opens as a full workspace and applies/clears filters.
Timeline opens through the current bridge and playback still works.
Export opens as a full workspace and exports current scope.
Theme opens full workspace and applies presets.
Node clicks open Inspector.
Edge clicks open Inspector.
Cluster clicks open Inspector.
Inspector internal navigation works.
Inspector Back works.
```

---

## 16. Open design questions

### 16.1 What should happen to the remaining Timeline bridge?

Timeline should eventually become a bottom visualizations timeline/scrubber rather than a standalone full workspace. The remaining design question is how it should behave across maps, networks, and charts.

Recommended default: defer this until after the Visualizations and Inspector workspaces stabilize.

### 16.2 How should Inspector promotion work?

Inspector remains the highest-risk and highest-value remaining migration. It should be planned as a full evidence-dossier workspace before code promotion begins.

### 16.3 Should the old side panel be deleted?

Not yet. It still carries Search, Timeline, Export, and Inspector. The correct approach is gradual functional migration, then code removal after no critical path depends on it.

---

## 17. Current recommended next implementation pass

The next implementation pass should not be another easy workspace promotion. The remaining major side-panel workflow is Inspector, and that needs a design contract before code changes. Timeline should also be deferred because the preferred design is a bottom Visualizations timeline/scrubber, not a direct workspace promotion.

Recommended next pass:

```text
Draft Inspector Workspace Design Contract
```

### Classification

```text
Planning / design contract
```

### Why this next

- Inspector is the most fragile remaining routing path.
- It opens both from the hamburger menu and automatically from visualization interactions.
- It contains multiple view types: person, place, route, cluster, linked letter, and empty state.
- It has internal navigation and Back behavior that must be preserved.
- It should become a full evidence-dossier workspace, not merely a wider copy of the current side-panel view.

### Out of scope

```text
Timeline bottom-scrubber implementation
LeftControlPanel.jsx deletion
Search refinement
Export refinement
Analytics refactor
Aesthetic overhaul
```

### Acceptance test for the planning pass

```text
The team can describe how each Inspector selection type should render in a full workspace, how map/network clicks should open it, how Back/breadcrumb behavior should work, and which current side-panel behaviors must be preserved during migration.
```

---

## 18. Summary recommendation

Peridot’s routing is now substantially cleaner than when this audit was first drafted. Home, Data, Visualizations, Search & Filter, Theme, and Export are full workspaces. The old side panel should now be treated primarily as a compatibility layer for Timeline and Inspector.

The correct immediate path is conservative:

```text
Keep Timeline deferred until the bottom visualizations timeline/scrubber design is ready
→ plan Inspector workspace carefully
→ promote Inspector only after its evidence-dossier contract is approved
→ remove legacy side-panel code only after no critical workflow depends on it
```

The old side panel should not be broadly deleted yet. It still carries Timeline and Inspector, and Inspector remains a fragile auto-open interaction path.
