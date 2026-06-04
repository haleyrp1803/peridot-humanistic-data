# Peridot Data Exploration Workspace Contract

**Document status:** Planning / design contract for merging the current Inspector and Search & Filter workflows.  
**Prepared after:** `c9b0c46` — `Document dual-mode Inspector milestone`.  
**Change type:** Documentation / planning.  
**Purpose:** Define how Peridot should combine evidence inspection and advanced search into a shared **Data Exploration** workspace while preserving the compact side-panel Inspector workflow and the existing Search & Filter active-dataset model.

---

## 1. Executive summary

Peridot should add a combined **Data Exploration** workspace that hosts two closely related research workflows:

```text
Data Exploration
  ├─ Inspector
  └─ Advanced Search
```

The workspace should not erase the current Inspector or Search systems. It should provide a shared shell around them so researchers can move quickly between close inspection and dataset-wide querying.

The hamburger menu entry should be named:

```text
Data Exploration
```

Recommended menu subtitle:

```text
Inspect selected evidence and run advanced searches across the active dataset.
```

The full workspace should have two tabs:

```text
Inspector | Advanced Search
```

The compact side panel should eventually mirror this pattern with two smaller tabs:

```text
Summary | Quick Search
```

The immediate implementation should be conservative: add the Data Exploration shell and full workspace tabs first, reuse the existing full Inspector and Search components, and defer Quick Search until the shared workspace is stable.

---

## 2. Design goals

### Goal 1 — Support a researcher’s exploration loop

Researchers often move between two actions:

```text
Find candidates
→ inspect evidence
→ follow linked data
→ refine the search
→ inspect more evidence
```

Data Exploration should make that loop fast and legible.

### Goal 2 — Preserve the current dual-mode Inspector

The recently implemented Inspector model should remain intact:

```text
Visualization click → compact Inspector summary
Hamburger / Expand / linked data → full Inspector workspace
```

Data Exploration should wrap or host that full Inspector workspace, not replace its selection/history model.

### Goal 3 — Preserve Search & Filter as the active-dataset owner

Search & Filter currently defines the active filtered dataset consumed by Visualizations, Inspector, Timeline, Analytics, and Export. Data Exploration should reuse this existing search/filter state rather than duplicating it.

### Goal 4 — Keep Inspector and Search state separate

Inspector and Search should share a workspace shell, but their state should remain separate:

```text
Inspector state:
  selectedSelection
  selectedProps
  inspectorHistory
  inspectorPresentationMode

Search state:
  draft filters
  applied filters
  suggestions
  active filtered dataset
  filter update status

Shared Data Exploration shell state:
  dataExplorationTab = "inspector" | "search"
  dataExplorationSidePanelTab = "summary" | "quick-search"
```

This prevents the Search system from destabilizing the recently stabilized Inspector system.

---

## 3. Naming and menu contract

### Workspace name

Use:

```text
Data Exploration
```

### Hamburger menu subtitle

Recommended menu subtitle:

```text
Inspect selected evidence and run advanced searches across the active dataset.
```

Alternative shorter subtitle if the menu needs compact copy:

```text
Inspection and advanced search for correspondence evidence.
```

### Current menu implications

The current top-level menu includes separate Inspector and Search & Filter paths. During migration, both can remain as compatibility routes if needed, but the intended user-facing destination is:

```text
Hamburger → Data Exploration
```

with internal tabs:

```text
Inspector | Advanced Search
```

Long-term, the menu should avoid three separate entries for overlapping research workflows. The final public menu should likely keep Data Exploration and remove or hide separate Inspector/Search entries after compatibility is verified.

---

## 4. Full workspace contract

### 4.1 Data Exploration shell

The full Data Exploration workspace should provide:

- workspace title: **Data Exploration**;
- subtitle explaining inspection + advanced search;
- two main tabs: **Inspector** and **Advanced Search**;
- close/return behavior consistent with the current Inspector workspace when opened over Visualizations;
- stable preservation of the most recent Visualizations state underneath where applicable.

Recommended conceptual structure:

```text
┌──────────────────────────────────────────────────────────┐
│ Data Exploration                                          │
│ Inspect selected evidence and search across the dataset.  │
│ [Inspector] [Advanced Search]                         [x] │
├──────────────────────────────────────────────────────────┤
│ Active tab content                                        │
└──────────────────────────────────────────────────────────┘
```

### 4.2 Inspector tab

The Inspector tab should reuse the current full Inspector workspace content.

It should preserve:

- selected person/place/route/cluster/letter dossiers;
- linked people/place navigation;
- linked-letter detail navigation;
- directed route-row linking;
- compact summary tile expansion into the full workspace;
- shared multi-step Back history;
- `[x]` and Escape close behavior;
- return to Visualizations underneath.

The Inspector tab answers:

```text
What am I looking at?
What evidence belongs to this person, place, route, cluster, or letter?
What linked evidence can I follow next?
```

### 4.3 Advanced Search tab

The Advanced Search tab should reuse the current full Search & Filter workspace behavior.

It should preserve:

- keyword search;
- person filter;
- place filter;
- route-place filter;
- route-people filter;
- date range;
- minimum correspondence weight;
- predictive suggestions;
- current applied scope summary;
- Apply Filters;
- Clear Filters;
- pre-update status feedback.

The Advanced Search tab answers:

```text
What records, people, places, routes, or time ranges am I looking for?
What should be included in the active filtered dataset?
```

### 4.4 Advanced Search result behavior — future extension

The first implementation may simply embed the existing Search workspace. A later pass can add result lists:

```text
Matching people
Matching places
Matching routes
Matching letters
```

Clicking a result should open the Inspector tab with the selected item loaded.

---

## 5. Compact side-panel contract

The compact side panel should eventually become a small version of the same exploration model:

```text
Research side panel / Data Exploration side panel
  ├─ Summary
  └─ Quick Search
```

### 5.1 Summary tab

This is the compact Inspector summary already implemented.

It should remain the default after visualization clicks:

```text
Node / edge / cluster click
→ compact side panel opens
→ Summary tab active
```

The Summary tab should keep:

- at-a-glance summary;
- summary tiles that open the full workspace;
- Expand action;
- `[x]` close;
- Back where relevant.

### 5.2 Quick Search tab

Quick Search should be deliberately lighter than Advanced Search.

Recommended first version:

- one search input;
- simple suggestions/results preview;
- result click opens the full Data Exploration workspace → Inspector tab;
- button/link to open **Advanced Search** tab.

Recommended distinction:

```text
Quick Search finds inspectable things.
Advanced Search defines the active filtered dataset.
```

This distinction avoids making the compact side panel too powerful or ambiguous.

---

## 6. Routing contract

### 6.1 Hamburger → Data Exploration

```text
Hamburger → Data Exploration
→ full Data Exploration workspace
```

Default tab rule:

```text
If there is an active Inspector selection:
  open Data Exploration → Inspector tab

If there is no active Inspector selection:
  open Data Exploration → Advanced Search tab
```

### 6.2 Hamburger → Advanced Search compatibility

During migration, a separate Search & Filter menu item may remain, but it should route to:

```text
Data Exploration → Advanced Search tab
```

### 6.3 Hamburger → Inspector compatibility

During migration, a separate Inspector menu item may remain, but it should route to:

```text
Data Exploration → Inspector tab
```

### 6.4 Visualization click

Visualization clicks should continue to open compact Inspector Summary, not the full workspace:

```text
Visualization object click
→ compact side panel
→ Summary tab
```

### 6.5 Expand from compact Inspector

```text
Compact Inspector Summary → Expand
→ Data Exploration workspace
→ Inspector tab
→ same selection and history
```

### 6.6 Quick Search result click — future

```text
Quick Search result click
→ Data Exploration workspace
→ Inspector tab
→ clicked result loaded
```

### 6.7 Apply Filters

```text
Advanced Search → Apply Filters
→ active filtered dataset updates
→ remain in Advanced Search tab
```

The app should not unexpectedly navigate away from Search after applying filters.

---

## 7. State contract

### Preserve existing Inspector state

Do not duplicate or fork:

- `selectedSelection`;
- `selectedProps`;
- `inspectorHistory`;
- linked-letter selection/history behavior;
- route-detail selection behavior.

### Preserve existing Search state

Do not duplicate or fork:

- draft search/filter inputs;
- applied filters;
- predictive suggestion state;
- active filtered dataset derivation;
- pre-update filter status.

### Add minimal shared shell state

Recommended state names:

```text
dataExplorationWorkspaceTab = "inspector" | "search"
dataExplorationSidePanelTab = "summary" | "quick-search"
```

The tab state should control presentation only. It should not own data filtering or Inspector selection.

---

## 8. Implementation sequence

### Pass 1 — Add this design contract

**Type:** Documentation / planning.  
**Goal:** Record the agreed Data Exploration model before implementation.  
**Files:** `planning_documents/PERIDOT_DATA_EXPLORATION_WORKSPACE_CONTRACT.md`; optional references in core docs later.  
**Acceptance test:** The team can describe how Inspector and Search will share a workspace without merging their internal state systems.

### Pass 2 — Add inert tab state

**Type:** Structural / behavior-neutral.  
**Goal:** Add Data Exploration tab state without changing visible behavior.  
**Acceptance test:** App looks and behaves exactly as before.

### Pass 3 — Create Data Exploration workspace shell

**Type:** Structural.  
**Goal:** Add `src/PeridotDataExplorationWorkspace.jsx` with tab UI shell. Initially render current Inspector content in the Inspector tab only.  
**Acceptance test:** Hamburger or existing Inspector route can render the Data Exploration shell without breaking compact Inspector clicks.

### Pass 4 — Embed Advanced Search tab

**Type:** Structural / behavior.  
**Goal:** Render existing `PeridotSearchWorkspace.jsx` inside the Advanced Search tab. Route Search & Filter menu action into Data Exploration → Advanced Search tab.  
**Acceptance test:** Existing Search & Filter controls work unchanged inside the Data Exploration workspace.

### Pass 5 — Route Inspector menu and Expand into Data Exploration

**Type:** Behavior.  
**Goal:** Hamburger Inspector and compact Expand should open Data Exploration → Inspector tab.  
**Acceptance test:** Existing Inspector full workspace behavior remains intact under the new workspace shell.

### Pass 6 — Add compact side-panel tabs

**Type:** Visual / behavior.  
**Goal:** Add Summary / Quick Search tabs to the compact side panel. Summary renders the current compact Inspector. Quick Search initially renders a placeholder or simple shell.  
**Acceptance test:** Visualization clicks still open Summary; switching to Quick Search does not disturb selection.

### Pass 7 — Implement Quick Search

**Type:** Behavior.  
**Goal:** Add lightweight search input/results preview. Result clicks open Data Exploration → Inspector tab.  
**Acceptance test:** Quick Search can find/open people, places, routes, or letters without applying global filters unintentionally.

### Pass 8 — Cleanup / menu consolidation

**Type:** Structural / documentation.  
**Goal:** After the shared workspace is stable, consolidate menu labels and update docs.  
**Acceptance test:** Public menu no longer presents confusing duplicate routes for Inspector/Search unless intentionally retained.

---

## 9. Do-not-break list

Preserve:

```text
Home opens by default.
Data opens upload/mapping workflow.
Visualizations opens map/network/Analytics workspace.
Search controls still apply/clear active filters.
Visualization clicks open compact Inspector Summary.
Compact Summary tiles open the full Inspector view.
Expand opens the full Inspector/Data Exploration workspace.
Linked people, places, letters, and routes open full Inspector views.
Back traverses multi-step Inspector history.
[x] and Escape close the active Inspector/Data Exploration surface.
Timeline bridge still opens and playback works.
Export workspace still exports current visualization state.
Theme workspace still applies presets.
No old Control Panel interface reappears.
```

---

## 10. Fragile zones

This merger touches two sensitive systems:

```text
Inspector selection/history and compact/full presentation
Search & Filter active-dataset state
```

Implementation must avoid:

- duplicating Inspector selection state;
- duplicating Search filter state;
- changing filter application semantics;
- opening the full workspace automatically on ordinary visualization click;
- breaking compact Inspector Summary;
- breaking Back history;
- breaking route-row or linked-letter navigation;
- reintroducing the old persistent rail / Control Panel interface.

---

## 11. Decision records

### Decision 1 — Workspace name

**Chosen:** `Data Exploration`.  
**Rejected:** `Research`, `Inspector`, `Search`, or `Inspector & Search` as the primary workspace name.  
**Reason:** Data Exploration describes the broader research workflow while leaving Inspector and Advanced Search as peer tabs.

### Decision 2 — Inspector and Search as peer tabs

**Chosen:** Full workspace tabs: `Inspector` and `Advanced Search`.  
**Rejected:** Making Search a subpanel inside Inspector.  
**Reason:** Search defines active dataset scope while Inspector reads selected evidence. They are related but not hierarchical.

### Decision 3 — Compact side panel mirrors the workspace at lower density

**Chosen:** Compact tabs: `Summary` and `Quick Search`.  
**Rejected:** Putting the full advanced-search form in the side panel.  
**Reason:** The side panel should support fast discovery and at-a-glance inspection, not become a cramped duplicate of Advanced Search.

### Decision 4 — Reuse existing systems first

**Chosen:** Reuse current full Inspector and Search components before building new result-list or Quick Search behavior.  
**Rejected:** Redesigning both systems at once.  
**Reason:** Inspector and Search are both fragile, recently modified state systems. The safest first step is a shared shell around working components.

---

## 12. Fresh-chat handoff note

For future work, explain the Data Exploration plan as follows:

```text
Peridot should merge the current Inspector and Search & Filter workflows into a shared Data Exploration workspace. The full workspace should have Inspector and Advanced Search tabs. Inspector continues to use the recently implemented dual-mode selection/history model. Advanced Search reuses the existing Search & Filter active-dataset controls. The compact side panel should eventually have Summary and Quick Search tabs, where Summary is the current compact Inspector and Quick Search is a lightweight discovery surface. The systems should share a workspace shell but not duplicate or merge their internal state.
```
