# Peridot Routing Contract Audit

**Draft status:** Routing and workspace transition audit after commit `8384dee` — `Fit Analytics workspace preview`.

**Purpose:** Document how Peridot’s current navigation and workspace routing works, how it should ideally work after the interface redesign, and how to transition safely from the current hybrid state to the intended workspace-first architecture.

**Scope:** Navigation model, workspace modes, hamburger menu routing, side-panel dependencies, current/ideal route contracts, migration sequence, fragile zones, and acceptance tests.

**Not in scope:** This document does not implement code changes. It does not redesign the Inspector, generalize Timeline playback, extract components, or update README / Maintainer’s Guide / Changelog. Those documentation updates should occur after implementation milestones.

---

## 1. Executive summary

Peridot is currently in a successful but transitional interface state. The app has moved away from the persistent icon rail and toward a hamburger-triggered menu plus full-window workspaces. However, it still depends on the older shared side-panel system for several workflows.

The current architecture has two overlapping navigation systems:

```text
New routing system:
Hamburger menu → App.jsx workspace mode → full-window workspace or side-panel bridge

Legacy routing system:
LeftControlPanel.jsx → shared side panel → active side-panel view → panel content
```

This overlap is acceptable during migration. It has allowed Home, Data, Theme, and Visualizations to become full workspaces without breaking Search & Filter, Timeline, Export, or Inspector. The cost is that some routing paths are now hybrid, and several old Controls/rail concepts remain in the code even though they are no longer part of the intended user-facing interface.

The next stage should not be a broad deletion pass. It should be a staged transition that preserves current functionality while gradually moving remaining side-panel workflows into full workspaces or explicitly retained lightweight panels.

---

## 2. Current source-of-truth state

Current verified baseline:

```text
8384dee — Fit Analytics workspace preview
```

Recent redesign sequence:

```text
8384dee Fit Analytics workspace preview
7a8ed7d Compact Visualizations workspace controls
9b67d28 Move Theme to full workspace
bb0c0ed Refine hamburger menu visual layout
2336915 Route mapped imports to visualization workspace
576bb72 Fix visualization workspace viewport initialization
56f2a49 Add internal workspace state model
b42f6fd Add Peridot interface redesign plan
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

These workspace modes are future-facing. Some already correspond to full-window workspaces. Others currently act as labels or intermediate state while the visible UI is still rendered through legacy side-panel content.

### 3.2 Current full-window workspaces

The following are already implemented as full-window workspaces in `App.jsx`:

| Workspace | Current implementation status | Notes |
|---|---|---|
| Home | Full workspace | Startup landing page with Upload my data / Use sample data paths. |
| Data | Full workspace | Unified table/workbook upload path for CSV / TSV / XLSX / XLS. |
| Visualizations | Full workspace | Hosts Place Map, People Network, Force-Directed, and Analytics. |
| Theme | Full workspace | Appearance presets and return-to-visualizations path. |

### 3.3 Current side-panel-dependent workflows

The following are still routed through the existing `LeftControlPanel.jsx` shared side-panel content:

| Workflow | Current route | Notes |
|---|---|---|
| Search & Filter | Hamburger → side-panel tab | Still depends on legacy panel shell. |
| Timeline | Hamburger → side-panel tab | Still panel-based and date/playback-coupled. |
| Export | Hamburger → side-panel tab | Still panel-based and scope-sensitive. |
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

Some of this code is now obsolete from the user’s visible hamburger workflow, but it remains structurally relevant because the app still uses the legacy shell for Search, Timeline, Export, and Inspector.

---

## 4. Current menu routing contract

The hamburger menu should be treated as the current primary user-facing navigation surface.

### 4.1 Current routing table

| Menu item | Current visible destination | Current technical route | Current status |
|---|---|---|---|
| Home | Home workspace | `workspaceMode = home`; side panel closed | Stable |
| Data | Data workspace | `workspaceMode = data`; side panel closed | Stable |
| Visualizations | Visualizations workspace | `workspaceMode = visualizations`; visualization panel defaults to Place Map | Stable after viewport fixes |
| Search & Filter | Legacy side panel | `workspaceMode = visualizations`; `activePanelTab = search`; side panel open | Transitional |
| Timeline | Legacy side panel | `workspaceMode = visualizations`; `activePanelTab = timeline`; side panel open | Transitional |
| Analytics | Visualizations workspace | `workspaceMode = visualizations`; `visualizationsWorkspacePanel = analytics`; side panel closed | Stable after sizing fixes |
| Inspector | Legacy side panel | `workspaceMode = inspector`; `activePanelTab = inspector`; side panel open | Transitional and fragile |
| Theme | Theme workspace | `workspaceMode = theme`; side panel closed | Stable |
| Export | Legacy side panel | `workspaceMode = visualizations`; `activePanelTab = export`; side panel open | Transitional |

### 4.2 Important current inconsistency

Search, Timeline, and Export currently set the workspace mode to `visualizations` while opening a side panel. That is acceptable temporarily because these workflows still operate over the active visualization/data scope. However, this should not be treated as the ideal final model.

The more accurate future model is:

```text
Search & Filter → Search workspace
Timeline → Timeline workspace or global timeline controller
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
Hamburger → Search & Filter → legacy side panel Search & Filter view
```

### 8.2 Current role

Search & Filter defines the active filtered dataset consumed by:

- Visualizations;
- Analytics;
- Timeline;
- Inspector;
- Export.

### 8.3 Current risk

Search & Filter is still side-panel-based, but it is conceptually large enough to become a full workspace. It has database-style advanced-search behavior and should not remain trapped in a narrow panel indefinitely.

### 8.4 Ideal route

```text
Hamburger → Search → full Search workspace
```

Possible future behavior:

- Search results table/list in main workspace;
- advanced filters in a spacious layout;
- current active dataset summary;
- actions to open matching records in Inspector;
- actions to send filtered data to Visualizations or Analytics.

### 8.5 Transition recommendation

Search should probably be promoted before Inspector only if we want to stabilize the global data-scope model first. Otherwise, Inspector promotion may come first because it is the highest-value user-facing improvement.

---

## 9. Current Timeline routing contract

### 9.1 Current route

```text
Hamburger → Timeline → legacy side panel Timeline view
```

### 9.2 Current role

Timeline currently controls date range and playback for the active correspondence data, but it is still primarily shaped by the older map/network playback model.

### 9.3 Ideal route

There are two viable long-term options:

#### Option A: Timeline as full workspace

```text
Hamburger → Timeline → full Timeline workspace
```

This would be useful if Timeline becomes a substantial temporal-analysis tool.

#### Option B: Timeline as global controller

```text
Any visualization workspace
  → persistent temporal control strip / drawer
  → animates the active visualization
```

This better matches the user’s stated goal: Timeline should animate whatever visualization the user is currently viewing, including maps, networks, bar charts, histograms, and other charts.

### 9.4 Transition recommendation

Do not generalize Timeline yet. First finish stabilizing workspace routing and decide whether Timeline is a full workspace, a global controller, or both.

---

## 10. Current Export routing contract

### 10.1 Current route

```text
Hamburger → Export → legacy side panel Export view
```

### 10.2 Current role

Export saves visualization and derived data outputs. It is scope-sensitive and must clearly indicate whether it is exporting:

- loaded data;
- filtered data;
- visible data;
- selected data;
- charted data.

### 10.3 Ideal route

```text
Hamburger → Export → full Export workspace
```

The full Export workspace should eventually show format cards and scope labels clearly.

### 10.4 Transition recommendation

Export can remain side-panel-based for now. It is less urgent than Inspector or Search, but it should eventually move out of the legacy panel to reduce side-panel dependency.

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

### Phase R5 — Decide Search promotion timing

**Type:** design + behavior

**Goal:** Determine whether Search should become a full workspace before Inspector.

**Reason to do Search first:** It defines global data scope and would benefit from full-window layout.

**Reason to defer Search:** Inspector is more visibly cramped and user-facing.

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

### Phase R7 — Generalize Timeline

**Type:** behavior

**Goal:** Make Timeline animate whichever visualization is active.

**Do not start until:** Visualizations and routing model are stable.

### Phase R8 — Promote Export to full workspace

**Type:** behavior + visual

**Goal:** Move export controls into a full workspace with clearer format/scope cards.

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
Search & Filter opens and applies/clears filters.
Timeline opens and playback still works.
Export opens and exports current scope.
Theme opens full workspace and applies presets.
Node clicks open Inspector.
Edge clicks open Inspector.
Cluster clicks open Inspector.
Inspector internal navigation works.
Inspector Back works.
```

---

## 16. Open design questions

### 16.1 Should Search become a full workspace before Inspector?

Search is conceptually ready for promotion because it is an advanced database-style interface. Inspector is more urgent visually because it is the evidence-reading surface. Either order can be justified.

Recommended default: clean routing / extract hamburger first, then promote Inspector unless Search becomes a blocker.

### 16.2 Should Timeline be a workspace, a persistent controller, or both?

The user’s stated goal suggests Timeline should eventually be a global controller that animates the active visualization. A full Timeline workspace may still be useful for deeper temporal analysis.

Recommended default: defer this decision until after the Visualizations and Inspector workspaces stabilize.

### 16.3 Should Export remain a side panel until late?

Yes. Export is important but less central to current UI pain than Inspector and Search. It can remain side-panel-based until the main exploration workflows are stabilized.

### 16.4 Should the old side panel be deleted?

Not yet. It still carries Search, Timeline, Export, and Inspector. The correct approach is gradual functional migration, then code removal after no critical path depends on it.

---

## 17. Recommended immediate next implementation pass

The next implementation pass should be:

```text
Extract PeridotHamburgerMenu from App.jsx
```

### Classification

```text
Structural
```

### Why this next

- It reduces `App.jsx` bloat.
- It has a clean prop surface.
- It does not touch fragile side-panel internals.
- It does not change routing behavior.
- It gives the project a cleaner foundation before more ambitious workspace promotions.

### In scope

```text
src/App.jsx
src/PeridotHamburgerMenu.jsx
```

### Out of scope

```text
LeftControlPanel.jsx
Inspector behavior
Search behavior
Timeline behavior
Export behavior
Analytics behavior
Data import behavior
Theme behavior
```

### Acceptance test

```text
Hamburger opens/closes.
All menu items route as before.
Home, Data, Visualizations, and Theme open full workspaces.
Search, Timeline, Export, and Inspector still open current side-panel views.
Analytics remains inside Visualizations workspace.
Place Map, People Network, Force-Directed, and Analytics switching still works.
Node/edge/cluster clicks still open Inspector.
Inspector Back still works.
```

---

## 18. Summary recommendation

Peridot’s current routing is stable enough to continue, but not clean enough to support large additional redesigns without some structural cleanup. The correct immediate path is conservative:

```text
Document routing contract
→ extract low-risk navigation component
→ avoid broad side-panel cleanup
→ promote major remaining workflows one at a time
```

The old side panel should be treated as a compatibility layer, not as the final architecture. It should remain in place until Search, Timeline, Export, and especially Inspector have safe replacement routes.
