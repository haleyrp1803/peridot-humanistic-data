# Peridot Inspector Workspace Design Contract

**Document status:** Implemented design contract baseline, with future refinements deferred.  
**Prepared after:** `55fae50` — `Update routing contract after workspace promotions`; updated after `b24e19a` — `Link Inspector directed route rows`.  
**Change type:** Documentation / planning; implementation status update.  
**Purpose:** Define how the current side-panel Inspector should evolve into a dual-mode Inspector system with both compact side-panel summaries and a full evidence-dossier workspace.

---

## 0. Implementation status as of `b24e19a`

The initial dual-mode Inspector design is implemented.

Committed behavior now includes:

- visualization clicks open the compact side-panel Inspector;
- hamburger **Inspector** opens the full Inspector workspace;
- compact **Expand Inspector** opens the full workspace with the same selection;
- compact summary tiles open the full workspace for the same selected person/place;
- compact and full modes share selected Inspector state and multi-step Back history;
- linked-letter detail pages are part of shared Inspector state/history;
- linked-letter source/target people and places open full person/place dossiers;
- directed route rows open route/edge dossiers with linked letters;
- `[x]`, Escape, and blank-map click close the appropriate Inspector surface and return to Visualizations;
- full Inspector opens over the most recently used Visualizations state rather than destructively rebuilding it.

Future refinements should be narrow and may include section anchors for compact summary tiles, breadcrumbs/navigation trails, richer synthetic route dossiers, and selected-entity filter actions through Search & Filter.

---

## 1. Executive summary

The Inspector should use a **dual-mode model**.

The main implementation principle is:

```text
Do not replace the current side-panel Inspector with a full workspace.
Add the full workspace as an expansion of the same Inspector selection state.
```

The current compact side-panel Inspector remains the default response to user interaction with a visualization. Users should be able to click a node, edge, cluster, or linked-data item and immediately see an at-a-glance Inspector in the side panel, exactly as the current workflow already supports.

The full Inspector workspace is opened either:

- by choosing **Inspector** from the hamburger menu;
- by clicking an **Expand Inspector** action from the compact side panel;
- by clicking compact summary tiles; or
- by following linked people, places, letters, or route rows inside the Inspector.

Both modes should inspect the same selected item and should share the same internal navigation/back history.

The full Inspector workspace should behave like an overlay/workspace over the most recently used Visualizations state, not like a destructive route that rebuilds or discards the map/network/chart underneath.

Both the compact side panel and the full Inspector workspace must include an `[x]` close button. Closing either surface should return the user to the most recently used Visualizations workspace state underneath.

---

## 2. Design goals

### Goal 1 — Preserve the current click-and-glance workflow

Clicking objects in the visualization should continue to open a compact Inspector surface.

The side panel remains valuable because it lets users inspect evidence without leaving the visualization context. It should not be removed as part of Inspector promotion.

### Goal 2 — Add a full evidence-dossier workspace

The full workspace should provide enough room for deep reading and research navigation:

- person dossiers;
- place dossiers;
- route / edge dossiers;
- cluster dossiers;
- linked-letter detail pages;
- selected uploaded metadata;
- internal Back behavior;
- breadcrumbs or equivalent navigation context.

### Goal 3 — Use one Inspector state model

Compact Inspector and full Inspector must not become separate systems.

They should share:

- the active selection;
- the selected Inspector route/type;
- linked-data navigation history;
- Back behavior;
- selected custom uploaded fields;
- entity/profile derivations.

### Goal 4 — Preserve the visualization underneath

Opening either Inspector mode should not erase the user's current visualization context.

When the user closes Inspector, they should return to whatever data visualization they were most recently using, including:

- Place Map;
- People Network;
- Force-Directed;
- Analytics chart view, where applicable.

### Goal 5 — Make linked-data navigation reversible

When users follow linked people, places, routes, clusters, or letters, they need to return through several prior inspected items.

The Inspector should support a multi-step Back sequence, not only a single previous state.

A visible back affordance should appear in an intuitive location. It may be:

- a left-arrow button;
- a **Back** text button;
- a combined arrow + label.

The full workspace should also show breadcrumbs or an equivalent context trail when space allows.

---

## 3. Presentation modes

Recommended Inspector presentation modes:

| Mode | Meaning |
|---|---|
| `closed` | No Inspector interface visible. The user sees the current Visualizations workspace. |
| `compact` | Compact side-panel Inspector is visible over/alongside the current Visualizations workspace. |
| `workspace` | Full Inspector workspace is visible, using the same active selection and history. |
| `empty-workspace` | Full Inspector opened from the menu with no current active selection. |

These modes represent presentation only. They should not define separate Inspector content state.

Recommended conceptual state:

```text
inspectorSelection
inspectorHistory
inspectorPresentationMode
lastVisualizationWorkspaceState
```

Where:

- `inspectorSelection` is the currently inspected person/place/route/cluster/letter/empty state;
- `inspectorHistory` stores a multi-step navigation stack;
- `inspectorPresentationMode` controls whether the Inspector is closed, compact, full, or empty;
- `lastVisualizationWorkspaceState` preserves the most recent visualization mode and stage state under the Inspector.

---

## 4. Routing and opening behavior

### Visualization interaction opens compact Inspector

When the user clicks an inspectable object in a visualization:

```text
node / edge / cluster / linked visual object click
→ set inspectorSelection
→ push prior inspector state to inspectorHistory if appropriate
→ set inspectorPresentationMode = compact
→ keep current Visualizations workspace loaded underneath
```

This applies to:

- person nodes;
- place nodes;
- edges/routes;
- clusters;
- cluster members;
- linked visual items that resolve to Inspector state.

### Hamburger menu opens full Inspector workspace

When the user chooses **Inspector** from the hamburger menu:

```text
Hamburger → Inspector
→ set inspectorPresentationMode = workspace or empty-workspace
→ preserve current / most recent Visualizations workspace underneath
```

If there is an active `inspectorSelection`, the full workspace should show it.

If there is no active selection, the workspace should show an empty Inspector state explaining how to inspect something:

```text
Select a person, place, route, cluster, or linked letter from a visualization to inspect it.
```

The hamburger menu should not open the compact side panel.

### Expand action opens full workspace from compact mode

The compact side panel should include a visible action such as:

```text
Expand Inspector
```

Behavior:

```text
compact Inspector
→ full Inspector workspace
→ same inspectorSelection
→ same inspectorHistory
→ same underlying Visualizations state
```

This must not recompute a new Inspector selection or duplicate Inspector state.

### Close action returns to Visualizations

Both compact and full modes must include an `[x]`.

Behavior from compact mode:

```text
compact Inspector [x]
→ inspectorPresentationMode = closed
→ reveal current Visualizations workspace underneath
```

Behavior from full workspace mode:

```text
full Inspector [x]
→ inspectorPresentationMode = closed
→ return to most recent Visualizations workspace state
```

Closing Inspector should not route to Home, Search, Data, Theme, or Export.

Recommended first implementation detail:

- closing Inspector hides the Inspector;
- the selected visual item may remain selected invisibly or visually, depending on current selection behavior;
- do not add a new selection-clearing behavior unless it is explicitly designed and tested.

---

## 5. Navigation and Back behavior

### Core navigation rule

Following linked data now opens the full Inspector workspace while preserving shared Back history.

Examples:

```text
Compact person view → linked letter
→ linked letter opens in full Inspector workspace
→ Back returns to person
```

```text
Full person dossier → related place → linked letter
→ full workspace remains open
→ Back returns to related place
→ Back returns to person
```

### Multi-step history requirement

The Back system must support several sequential steps, not only one previous item.

Recommended model:

```text
inspectorHistory = [
  previousInspectorState1,
  previousInspectorState2,
  previousInspectorState3
]
```

Back behavior:

```text
Back
→ pop most recent prior Inspector state
→ restore it in the current presentation mode
```

### Breadcrumbs

The full workspace should show breadcrumbs or an equivalent context trail when useful.

Example:

```text
Cluster: Siena group → Person: Suor Colomba → Linked letter: 20 Dec. 1621
```

Compact mode may omit full breadcrumbs to save space, but it should still show a prominent Back control when history exists.

### Back button placement

The Back affordance should be visually obvious.

Recommended compact side-panel placement:

```text
Top-left under/near the Inspector title, before the entity content
```

Recommended full-workspace placement:

```text
Top-left in the Inspector workspace header, near breadcrumbs
```

The control may be rendered as:

```text
← Back
```

or as an arrow icon with an accessible label.

---

## 6. Compact side-panel Inspector contract

### Purpose

The compact side panel provides immediate at-a-glance evidence while keeping the user in visualization context.

### Required controls

The compact panel should include:

- entity type badge;
- title;
- short subtitle or context line;
- visible Back button when history exists;
- **Expand Inspector** action;
- `[x]` close button.

### Compact content by selection type

| Selection type | Compact content |
|---|---|
| Person / node | Name, role as source/target/both, linked-letter count, date span, principal places, top related people/places, Expand action. |
| Place | Place name, linked people count, linked letters, incoming/outgoing route counts, top associated people, Expand action. |
| Route / edge | Source → target, direction, represented letter count, date span, people involved, first few linked letters, Expand action. |
| Cluster | Cluster label, contained member count, represented visible volume, grouped-place preview, top members, Expand action. |
| Linked letter | Source, target, date, source/target places, archive/page reference, short metadata preview, Expand action. |
| Empty | Prompt explaining that the user can click visualization objects to inspect them. |

### Compact side panel should avoid

The compact panel should not try to show every available field. Avoid:

- long full transcriptions;
- long custom-field lists;
- large tables;
- full related-people lists;
- deep route breakdowns;
- dense evidence-reading layouts.

These belong in the full workspace.

---

## 7. Full Inspector workspace contract

### Purpose

The full Inspector workspace is an evidence dossier for close reading, navigation, and research interpretation.

### Required controls

The full workspace should include:

- `[x]` close button;
- visible Back control when history exists;
- breadcrumbs or equivalent navigation context;
- entity type badge;
- title;
- subtitle/context line;
- key metrics row;
- evidence sections.

### Recommended full-workspace layout

```text
┌─────────────────────────────────────────────────────────────┐
│ Inspector header, Back, breadcrumbs, [x]                     │
├─────────────────────────────────────────────────────────────┤
│ Entity title, badge, subtitle/context, metrics row           │
├───────────────────────────────┬─────────────────────────────┤
│ Main evidence sections         │ Related/context navigation   │
│ linked letters, routes, notes  │ people, places, routes       │
└───────────────────────────────┴─────────────────────────────┘
```

On narrow screens, the right context column may stack below the main content. Responsive changes should be narrow-window-specific and should not disrupt the normal full-size desktop layout.

### Full workspace by entity type

#### Person dossier

```text
Header
- Person name
- Entity type: Person
- Role: source, target, or both
- Linked letters
- Date span
- Principal places

Sections
1. Overview
2. Related people
3. Places this person sent letters to
4. Places where this person received letters
5. Directed routes
6. Linked letters
7. Selected uploaded fields / custom metadata
```

#### Place dossier

```text
Header
- Place name
- Entity type: Place
- Linked people
- Linked letters
- Incoming routes
- Outgoing routes
- Date span

Sections
1. Overview
2. People associated with this place
3. Incoming correspondence
4. Outgoing correspondence
5. Linked letters
6. Selected uploaded fields / custom metadata
```

#### Route / edge dossier

```text
Header
- Source → Target
- Entity type: Route
- Direction
- Represented letter count
- Date span
- People involved

Sections
1. Route summary
2. Linked letters
3. Repeated correspondents
4. Topics / relationships / languages where available
5. Related places
6. Selected uploaded metadata
```

#### Cluster dossier

```text
Header
- Cluster title or generated label
- Entity type: Cluster
- Contained members
- Represented visible volume
- Dominant place/grouping where available

Sections
1. Cluster overview
2. Members grouped by place
3. Top represented members
4. Linked routes / letters where derivable
5. Click-through member list
```

#### Linked-letter dossier

```text
Header
- Source person → target person
- Date
- Source place → target place
- Archive / collection / pages

Sections
1. Bibliographic / archival reference
2. Correspondence metadata
3. Transcription
4. Notes
5. Links
6. Selected custom fields
7. Related person/place navigation
```

---

## 8. Reuse of existing Inspector components

The full workspace should reuse existing Inspector content logic where possible.

Existing Inspector components already identify useful boundaries:

- `InspectorPanel.jsx`
- `InspectorBodyRouter.jsx`
- `InspectorEmptyState.jsx`
- `InspectorClusterView.jsx`
- `InspectorEdgeView.jsx`
- `InspectorNodeView.jsx`
- `InspectorConnectedCorrespondents.jsx`
- `InspectorPersonPlaces.jsx`
- `InspectorBackButton.jsx`

The preferred implementation is to separate shared Inspector content from presentation shell.

Recommended direction:

```text
Shared Inspector state and body routing
→ compact side-panel shell
→ full workspace shell
```

Avoid duplicating:

- selection-building logic;
- linked-record derivation;
- person/place profile derivation;
- route/edge summary logic;
- cluster member grouping;
- Back history logic.

If content needs different density in compact and full modes, pass a presentation-density prop rather than forking the entire Inspector component tree.

Example conceptual prop:

```text
presentation = "compact" | "workspace"
```

---

## 9. Relationship to Visualizations state

The Inspector should sit above the user's most recent visualization context.

### Required preservation behavior

When Inspector opens:

- current visualization mode remains known;
- current map/network/chart state remains available underneath;
- user can close Inspector and return to the same visualization context.

### Do not treat Inspector as destructive route

Avoid this behavior:

```text
Visualizations → Inspector
→ unmount/rebuild visualization state
→ close Inspector
→ user loses the prior map/network/chart context
```

Target behavior:

```text
Visualizations
→ Inspector overlay/workspace presentation
→ close
→ same Visualizations context
```

This is especially important for map/network viewport, selected filters, Analytics chart state, and timeline state.

---

## 10. Relationship to Search, Timeline, Analytics, and Export

### Search & Filter

Inspector consumes the active filtered dataset but does not own global filtering.

Possible future Inspector actions such as **Filter to this person/place/route** should be treated as later enhancements and routed through Search & Filter state intentionally.

### Timeline

Timeline should remain deferred. Inspector promotion should not redesign Timeline.

The current Timeline bridge must continue to work after Inspector changes.

### Analytics

Analytics is conceptually part of Visualizations. Inspector should preserve Analytics as the most recently used visualization when applicable.

### Export

Inspector promotion should not change Export behavior.

Future selected-entity export can be considered later, but it is out of scope for the initial Inspector workspace migration.

---

## 11. Do-not-break list

During Inspector work, preserve:

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
Node clicks open compact Inspector.
Edge clicks open compact Inspector.
Cluster clicks open compact Inspector.
Cluster member clicks open detail.
Linked person/place/letter navigation works.
Inspector internal navigation works.
Inspector Back works across multiple steps.
Expand Inspector opens full workspace with the same selection.
Hamburger → Inspector opens full workspace, not the side panel.
Compact Inspector [x] closes Inspector and reveals Visualizations.
Full Inspector [x] closes Inspector and reveals Visualizations.
Returning to Visualizations preserves the most recently used visualization state.
```

---

## 12. Fragile zones and cautions

### Inspector auto-open path

The Inspector auto-open path is fragile. Prior cleanup of old shared-panel naming broke click-to-Inspector behavior. Do not casually rename compatibility-sensitive side-panel props or setters.

Any pass touching this path must explicitly test:

- node click opens compact Inspector;
- edge click opens compact Inspector;
- cluster click opens compact Inspector;
- contained cluster-member click opens detail;
- Back behavior still works.

### Shared side-panel shell

The side-panel shell remains necessary for compact Inspector and Timeline. Do not delete `LeftControlPanel.jsx` or old compatibility paths as part of the first Inspector workspace implementation.

### App orchestration

`App.jsx` remains a fragile orchestration boundary. Before code changes, read the full current file from the source of truth and prefer full-file replacement for dense changes.

### Visualization preservation

Inspector should not disrupt:

- viewport centering/reset;
- active visualization panel;
- map/network viewport measurement;
- Analytics preview/expanded state;
- applied Search & Filter scope;
- timeline playback state;
- export preview state.

### Dormant MapLibre files

Do not touch dormant MapLibre files as part of Inspector work.

---

## 13. Six-pass implementation plan

### Pass 1 — Document Inspector workspace contract

**Status:** Complete.

**Type:** Documentation / planning  
**Goal:** Add this contract to the repository before code changes.  
**Files likely in scope:** `PERIDOT_INSPECTOR_WORKSPACE_CONTRACT.md`; optional later references in `README.md`, `MAINTAINERS_GUIDE.md`, `CHANGELOG.md`, and `PERIDOT_ROUTING_CONTRACT_AUDIT.md`.  
**Acceptance test:** The team can describe compact vs full Inspector behavior, hamburger vs visualization-triggered routing, close behavior, expansion behavior, and multi-step Back behavior before code changes.

### Pass 2 — Audit current Inspector code

**Status:** Complete.

**Type:** Structural audit only  
**Goal:** Read current `App.jsx`, `LeftControlPanel.jsx`, `InspectorPanel.jsx`, `InspectorBodyRouter.jsx`, and Inspector view components in full to identify exact state ownership and prop flow.  
**Acceptance test:** The team can identify the exact state variables/functions responsible for selection, side-panel opening, Inspector history, Back behavior, and visualization preservation.

### Pass 3 — Extract reusable Inspector presentation boundary

**Status:** Complete.

**Type:** Structural  
**Goal:** Make current Inspector content reusable by both compact and full modes without changing behavior.  
**Likely files:** Inspector components only, possibly one new shared wrapper.  
**Acceptance test:** Side-panel Inspector still works exactly as before.

### Pass 4 — Add compact/full presentation mode

**Status:** Complete.

**Type:** Behavior  
**Goal:** Add `compact` vs `workspace` Inspector presentation while preserving current selection semantics.  
**Acceptance test:** Node/edge/cluster clicks open compact Inspector; hamburger Inspector opens full workspace; Expand opens full workspace with the same item; `[x]` returns to Visualizations.

### Pass 5 — Add full Inspector workspace layout

**Status:** Complete as an initial minimal workspace shell plus later visual treatment.

**Type:** Visual / behavior, split if needed  
**Goal:** Build full dossier layout using existing Inspector body components first, then progressively improve entity-specific layouts.  
**Acceptance test:** Person, place, route, cluster, and linked-letter selections render in full workspace; Back works; close returns to Visualizations.

### Pass 6 — Refine compact side-panel content

**Status:** Complete as an at-a-glance compact summary. Future section-anchor refinement remains optional.

**Type:** Visual  
**Goal:** Reduce compact side-panel content to at-a-glance summaries while linking to full workspace for deep reading.  
**Acceptance test:** Compact side panel remains useful and readable without becoming the full dossier.

---

## 14. Initial implementation recommendation

Start conservatively.

Do not begin by visually redesigning every Inspector view. The first code goal should be to preserve current Inspector content and add a second presentation shell.

Recommended first implementation sequence after this documentation pass:

1. audit real current files in full;
2. identify current selection and history state;
3. preserve current side-panel Inspector exactly;
4. add presentation mode state;
5. make hamburger Inspector route to full workspace;
6. add Expand action from compact mode;
7. add `[x]` close to both modes;
8. only then refine compact/full visual density.

---

## 15. Decision records

### Decision 1 — Dual-mode Inspector

**Chosen:** Keep compact side-panel Inspector and add full workspace expansion.  
**Rejected:** Replace side-panel Inspector with full workspace only.  
**Reason:** Users need immediate at-a-glance evidence while interacting with visualizations, but deep evidence reading requires more space.

### Decision 2 — Shared Inspector state

**Chosen:** Compact and full Inspector modes share one selection and history model.  
**Rejected:** Separate side-panel and workspace Inspector states.  
**Reason:** Separate states would create mismatch risk and duplicate logic.

### Decision 3 — Hamburger Inspector opens full workspace

**Chosen:** Menu-driven Inspector opens the full workspace.  
**Rejected:** Hamburger menu opens the compact side panel.  
**Reason:** Visualization interaction is the correct trigger for compact context; menu navigation should open the more substantial workspace.

### Decision 4 — Visualization remains underneath

**Chosen:** Inspector opens above the most recently used Visualizations state and closes back to it.  
**Rejected:** Treat Inspector as a destructive route that rebuilds or discards the visualization.  
**Reason:** Users need to resume exactly what they were doing after inspection.

### Decision 5 — Multi-step Back history

**Chosen:** Inspector Back should traverse several linked-data navigation steps.  
**Rejected:** Single-step Back only.  
**Reason:** Users may follow several linked people, places, routes, clusters, or letters and need to return through the sequence.

---

## 16. Fresh-chat handoff note

For future work, explain the Inspector redesign as follows:

```text
The Peridot Inspector should be dual-mode. Visualization clicks open the compact side-panel Inspector. Hamburger → Inspector opens the full evidence-dossier workspace. The compact side panel can expand into the full workspace. Both modes share the same Inspector selection state and multi-step navigation history. Both modes include an [x] close button that returns to the most recently used Visualizations state underneath. The full workspace should reuse existing Inspector content components where possible rather than duplicating Inspector logic.
```


---

## 17. Post-implementation refinement backlog

The following items are intentionally deferred and should be handled as separate bounded passes:

1. **Section anchors from compact summary tiles.** Summary buttons currently open the full dossier; a later pass may scroll/focus the relevant section.
2. **Breadcrumb trail.** Back works through the shared history stack, but a visible breadcrumb trail can improve orientation in the full workspace.
3. **Richer route dossiers.** Directed route rows now open route/edge dossiers; later work can improve route-specific people/place summaries.
4. **Inspector-to-Search actions.** Future actions such as “filter to this person/place/route” should route through Search & Filter state intentionally.
5. **Timeline independence.** Inspector refinements should not disturb the current Timeline bridge or future bottom-scrubber plan.
