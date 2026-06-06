# Peridot Interface Redesign Plan

**Draft status:** Planning document with implementation-status notes through `08b628b` — `Use include and ignore checkboxes for evidence fields`.  
**Prepared after:** Baseline `0f72182` — `Remove redundant Inspector correspondents summary row`.  
**Scope:** Interface architecture, information architecture, workspace model, side-panel reduction, visualization reorganization, Inspector redesign, timeline generalization, and phased implementation plan.  
**Implementation note:** Major early phases have now been implemented: Home, Data, Visualizations, Search & Filter, Theme, Export, and the dual-mode Inspector workspace are implemented; the hamburger menu replaced the visible persistent rail; Timeline remains the major deferred workspace redesign target. Data upload has also shifted to role-based mapping for broader humanistic datasets.

---

## 1. Purpose

This document records the planned redesign of Peridot's interface from a map-centered application with many side-panel tools into a multimodal correspondence data exploration workspace.

The current Peridot interface is functional and has accumulated major capabilities: one-file CSV upload, arbitrary CSV/TSV mapping, Excel workbook import with unique-ID joins, Search & Filter, timeline playback, Analytics, export, cluster inspection, and rich Inspector person/place/linked-letter navigation. However, the interface now relies too heavily on the shared left-side panel. The side panel has become responsible for navigation, setup, filtering, visualization selection, charting, timeline control, theme selection, export, and evidence inspection.

That concentration is no longer the right product model. Peridot should no longer present itself primarily as a map with supporting tools. It should present itself as a multimodal research environment for exploring correspondence records through maps, networks, charts, timelines, search, and evidence dossiers.

This plan defines the intended interface direction before implementation begins, so the redesign can be executed through bounded, testable passes rather than broad speculative refactors.


---

## Implementation status after `08b628b`

Implemented from this plan:

- internal workspace state and extracted workspace configuration;
- Home / welcome workspace;
- hamburger-triggered labeled menu;
- full Data workspace;
- full Theme workspace;
- full Visualizations workspace with Place Map, People Network, Force-Directed, and Analytics;
- full Export workspace;
- full Search & Filter workspace;
- dual-mode Inspector with compact visualization summaries and a full evidence-dossier workspace;
- Home-style visual system applied across full workspaces;
- role-based data mapping inside the Data workflow, organized around record identity, time, places, relationships, evidence/analysis, and capability review;
- point/site datasets that can render on Place Map without requiring people/network relationships;
- generic chart/evidence datasets that can enter the active dataset without map or network roles;
- capability-aware Visualizations workspace menus for Mapping Visualizations, Network Visualizations, Chart Visualizations, and Explore Your Data;
- direct chart-type selection from the Chart Visualizations menu;
- flexible Analytics chart controls with explicit record-count and numeric-metric paths;
- broader user-facing language oriented around records, entities, evidence, and humanistic datasets;
- evidence/analysis field inclusion as explicit Include and Ignore checkboxes defaulting to Include.

Still deferred:

- Timeline redesign as a bottom Visualizations timeline/scrubber;
- deeper visual-differentiation pass beyond the Home-style workspace system;
- eventual cleanup/removal of legacy side-panel code after Timeline and compact Inspector dependencies are fully resolved;
- broader generic-record Inspector dossiers and deeper chart polish for chart-first datasets.

The original plan below remains useful as the product-design reference, but several “future” phases are now completed and should be read in light of this status note.

---

## 2. Current interface problem

### 2.1 Current model

The current app uses a shared left-side panel shell with a persistent icon rail. The rail exposes major panel tabs:

- Controls
- Data Inputs
- Search & Filter
- Export
- Timeline
- Analytics
- Inspector

The shared shell is functionally useful. It helped consolidate scattered UI and removed the older split between Controls and Inspector panel shells. `LeftControlPanel.jsx` owns the shared shell, while `InspectorPanel.jsx` is now content-only.

The current model can be summarized as:

```text
map/network stage
+ persistent side-panel rail
+ side-panel tabs for nearly every workflow
```

### 2.2 Why this model has reached its limit

The current side panel is overloaded. It contains or gives access to too many categories of app functionality:

```text
navigation
+ app setup
+ data upload
+ visualization selection
+ display controls
+ search/filter scope
+ analytics configuration
+ chart preview
+ timeline playback
+ theme controls
+ export
+ evidence inspection
```

This creates three related problems.

#### Problem 1 — semantic flatness

All rail icons are treated as equivalent destinations, even though the underlying workflows have very different conceptual roles. Data upload, visualization choice, advanced search, timeline playback, evidence inspection, and export are not equivalent tasks. The interface currently makes them feel like interchangeable tabs in a tool drawer.

#### Problem 2 — cramped high-value workflows

The Inspector has become a rich research environment in miniature. It now supports person/place profile pages, related people, related places, directed routes, linked letters, selected custom fields, cluster inspection, and internal Back navigation. This is too much interpretive material for a narrow side panel to handle gracefully.

Analytics has a similar issue. Charts currently live inside a side-panel tab with an expanded overlay option. That was a good intermediate solution, but as Peridot shifts toward multimodal data visualization, chart views should no longer feel secondary to the map.

#### Problem 3 — outdated map-first assumptions

The current main workspace is still implicitly the map/network stage. The side panel is where most non-map work happens. This reinforces the idea that Peridot is mainly a mapping tool, even though its actual feature set now supports a broader model: maps, networks, force-directed graphs, charts, search, timelines, and evidence records.

---

## 3. New product frame

### 3.1 Old frame

```text
Peridot is a correspondence map with side-panel tools.
```

### 3.2 New frame

```text
Peridot is a multimodal correspondence data exploration workspace.
```

Maps remain important, but they are one visualization mode among several. Peridot should support historical correspondence research through multiple coordinated modes of inquiry:

- data ingestion and validation;
- advanced search and filtering;
- map-based geographic exploration;
- person/place network exploration;
- force-directed relationship exploration;
- chart-based Analytics;
- timeline animation;
- full evidence inspection;
- export of visual and tabular outputs.

### 3.3 Design principle

The main workspace should render the user's current task, not always a map.

The app should be able to show one major workspace mode at a time:

- Home / welcome screen
- Data Inputs / upload workflow
- Visualization workspace
- Advanced Search workspace
- Timeline workspace or timeline overlay/control mode
- Full Inspector / evidence dossier workspace
- Theme & Appearance workspace
- Export workspace

The side panel should stop being the app's primary room. It should become a navigational menu and possibly a lightweight drawer for secondary controls.

---

## 4. Redesign goals

### Goal 1 — Introduce a proper welcome / landing page

Peridot should open with a welcome screen, not directly inside a dense map-and-panel interface.

The welcome page should provide:

- app name and identity;
- brief description of what Peridot does;
- explanation that users can explore sample data or upload their own correspondence data;
- two primary action buttons:
  - **Upload my data**
  - **Use sample data**

The landing page should make the tool legible to a first-time user before they encounter panels, filters, maps, charts, or metadata language.

### Goal 2 — Replace the persistent icon rail with a hamburger menu

The hamburger stack should become the primary button that opens the app menu.

The current persistent icon rail should be removed. There is no need for it to be permanently visible. When the user clicks the hamburger button, they should see a more conventional menu with horizontal labeled options.

The menu should use text-first choices rather than relying on icon recognition.

Possible first version menu structure:

```text
Home
Data
Visualizations
Search
Inspector
Timeline
Theme
Export
```

Or a more descriptive version:

```text
Start
Data Inputs
Explore Visualizations
Search Records
Inspect Evidence
Timeline
Theme & Appearance
Export
```

The final labels should be chosen for clarity and should not require prior knowledge of the app's internal architecture.

### Goal 3 — Reclassify People, Place, and Force-Directed as visualization modes

The current People, Place, and Force-Directed options are not merely display controls. They are data visualization tools.

They should eventually live with Analytics chart types inside a unified **Visualizations** workspace.

Current model:

```text
Controls
  → Visualization Type
    → People
    → Place
    → Force-Directed

Analytics
  → Chart Type
    → Bar Chart
    → Histogram
    → Heatmap
    → etc.
```

Target model:

```text
Visualizations
  → Network / Map Views
    → People Network
    → Place Map / Place Network
    → Force-Directed Network

  → Charts
    → Bar Chart
    → Grouped Bar Chart
    → Stacked Bar Chart
    → Line Chart
    → Multi-Line Chart
    → Histogram
    → Pie Chart
    → Sunburst
    → Heatmap
```

This change moves Peridot away from being map-first and toward being a multimodal visualization environment.

### Goal 4 — Remove obsolete Controls content

The existing **Display Controls** and **Summary and Diagnostics** sections are no longer necessary for the ordinary user-facing interface.

They should be removed from the public workflow unless a specific still-needed function is identified during full-file review.

If any diagnostic information remains necessary for development, it should be hidden behind an explicit development/debug mode rather than shown to ordinary users.

### Goal 5 — Make Theme its own section

Theme should become its own menu/workspace section rather than living inside generic Controls.

Potential label:

```text
Theme & Appearance
```

This section can eventually contain:

- Peridot default theme;
- Early modern map theme;
- Modern map theme;
- chart appearance settings;
- contrast/accessibility options;
- map/stage background options;
- saved custom presets, if later desired.

Theme should be treated as a cross-app appearance layer, not a map-only setting.

### Goal 6 — Make the main workspace flexible

The central workspace should no longer be assumed to be a map.

It should be a flexible stage that can render whichever major mode the user is currently using:

```text
Home
Data Upload / Mapping
Visualization
Advanced Search
Full Inspector / Evidence Dossier
Theme
Export
```

The map is still a key visualization, but it is no longer the default container for every other workflow.

### Goal 7 — Promote Inspector to a first-class evidence workspace

The Inspector currently contains too much functionality for the narrow panel. It should eventually support a full-window evidence dossier mode.

The future Inspector model should distinguish between:

1. a compact selection summary, useful when the user is actively working inside a visualization; and
2. a full Inspector workspace for deep reading and analysis.

The full Inspector should support:

- person profile pages;
- place profile pages;
- route/edge profile pages;
- linked-letter detail pages;
- cluster detail pages;
- internal Back behavior;
- breadcrumb or context labels;
- related people;
- related places;
- directed routes;
- linked records;
- selected uploaded metadata fields;
- possible future actions such as “filter to this person/place/route” or “show this in visualization.”

The Inspector should feel like an archival dossier or catalogue record environment, not a cramped tooltip.

### Goal 8 — Make Timeline animate the active visualization

Timeline should become a global temporal controller that can animate whichever visualization the user is currently viewing.

Target model:

```text
loaded records
→ active filtered records
→ active temporal slice / playback state
→ active visualization renderer
```

The active renderer may be:

- a map;
- a people network;
- a force-directed graph;
- a bar chart;
- a histogram;
- a heatmap;
- another chart type;
- a search-results view.

Timeline should not be treated only as a map playback widget.

### Goal 9 — Reduce visual monotony

The current peridot/green/cream visual identity should remain, but the interface needs stronger visual hierarchy and more differentiated workspace styles.

The redesign should avoid making every part of the app feel like the same green card stack.

Different app areas should have distinct visual characters:

| Workspace | Desired visual character |
|---|---|
| Home | spacious, introductory, polished |
| Data | procedural, checklist-like, reassuring |
| Visualizations | stage-first, low-chrome, exploratory |
| Search | database/library advanced-search style |
| Inspector | archival dossier / catalogue card style |
| Timeline | temporal control strip / animation console |
| Theme | swatch and preset gallery |
| Export | output checklist / format cards |

---

## 5. Proposed information architecture

### 5.1 Top-level workspace areas

Recommended initial top-level structure:

| Area | Purpose | Likely initial implementation |
|---|---|---|
| **Home** | Welcome, tool description, sample/upload choice | New landing page / workspace mode |
| **Data** | Upload, template, mapping, validation | Existing Data Inputs workflow, moved out of narrow side-panel dependence over time |
| **Visualizations** | Maps, networks, charts | Merge current People/Place/Force-Directed choices with Analytics chart selection |
| **Search** | Advanced search and global filtering | Existing Search & Filter model, potentially expanded into full workspace |
| **Inspector** | Evidence dossier for selections and linked records | Initially existing Inspector content; later full-window dossier |
| **Timeline** | Temporal playback and date scope | Existing Timeline controls, later global animation controller |
| **Theme** | Appearance and visual presets | Existing Theme controls, moved into dedicated section |
| **Export** | Save visualizations and data | Existing Export controls, potentially workspace or modal |

### 5.2 Main menu model

The hamburger menu should open a labeled menu. First implementation can be simple. The menu does not need to solve every workspace redesign immediately.

Recommended menu layout:

```text
☰ Menu

Home
Data
Visualizations
Search
Inspector
Timeline
Theme
Export
```

Each item should be a horizontal row or box with:

- optional icon;
- text label;
- short description if there is room;
- active-state styling;
- keyboard/focus state.

Example row:

```text
[icon] Visualizations
       Maps, networks, charts, and analytical views
```

### 5.3 Initial route-free implementation

This can be implemented without adding a routing library. The app can use an internal workspace state:

```text
activeWorkspace = "home" | "data" | "visualizations" | "search" | "inspector" | "timeline" | "theme" | "export"
```

The central workspace renderer can switch on this state.

A later pass can decide whether URL routes are needed. They are not required for the first redesign.

---

## 6. Workspace definitions

### 6.1 Home workspace

#### Purpose

The Home workspace introduces Peridot and gives users a clear starting choice.

#### Required content

- App title: **Peridot**
- One- or two-sentence description
- Primary action: **Upload my data**
- Secondary action: **Use sample data**
- Optional supporting links:
  - Download template
  - View data requirements
  - Learn what Peridot can visualize

#### Suggested copy draft

```text
Peridot

Explore correspondence data through maps, networks, timelines, charts, and evidence records.

Start with your own correspondence dataset, or open the sample data to explore how Peridot works.

[Upload my data]    [Use sample data]
```

#### Functional behavior

- **Upload my data** opens the Data workspace.
- **Use sample data** loads or confirms the embedded/sample dataset and opens the Visualizations workspace.
- The user should still be able to reach all workspaces from the hamburger menu.

#### Acceptance test

On app load, the user sees the Home workspace with a short description and two clear buttons. Clicking **Upload my data** opens the Data workflow. Clicking **Use sample data** opens a visualization using sample data.

---

### 6.2 Data workspace

#### Purpose

The Data workspace manages data loading, templates, mapping, workbook joins, validation, and upload feedback.

#### Current assets to preserve

- Peridot CSV template download
- one-file completed CSV upload
- arbitrary CSV/TSV upload staging
- Excel workbook staging for `.xlsx` and `.xls`
- workbook/sheet summary
- role-based mapping for record identity, time, places, relationships, evidence/analysis, and capability review
- primary sheet selection
- unique-ID join configuration
- core field mapping
- selected custom Inspector/Analytics fields
- validation popup
- persistent latest-upload summary
- data tips

#### Redesign direction

Data should eventually be less cramped than the current side-panel form. Workbook mapping in particular deserves large workspace treatment.

The Data workspace should feel procedural and reassuring:

```text
1. Choose data source
2. Upload or use sample data
3. Map columns if needed
4. Review validation summary
5. Start exploring
```

#### Acceptance test

Template download works, a valid template CSV updates app data, arbitrary CSV/TSV and workbook uploads still stage correctly, validation appears, and the latest upload summary remains available after the popup closes.

---

### 6.3 Visualizations workspace

#### Purpose

The Visualizations workspace becomes the primary exploration area for maps, networks, and charts.

#### Current assets to consolidate

Network/map views:

- People
- Place
- Force-Directed

Chart views:

- Bar Chart
- Grouped Bar Chart
- Stacked Bar Chart
- Line Chart
- Multi-Line Chart
- Histogram
- Pie Chart
- Sunburst Chart
- Heatmap

#### Target structure

```text
Visualizations

Network and map views
- People network
- Place map / place network
- Force-directed network

Charts
- Bar chart
- Grouped bar chart
- Stacked bar chart
- Line chart
- Multi-line chart
- Histogram
- Pie chart
- Sunburst chart
- Heatmap
```

#### Display model

The workspace should include:

- visualization picker;
- active visualization stage;
- relevant configuration controls;
- clear indication of the active filtered dataset;
- optional compact timeline controls or link to Timeline workspace;
- optional compact Inspector summary when an item is selected.

#### Acceptance test

The user can select People, Place, Force-Directed, or a chart type from one Visualizations area. The selected visualization renders in the main workspace. Existing map/network interactions still work for network/map visualizations.

---

### 6.4 Search workspace

#### Purpose

The Search workspace defines the active filtered dataset and may later support record-level database browsing.

#### Current assets to preserve

- keyword search
- person filter
- place filter
- Route Filter (Place)
- Route Filter (People)
- minimum correspondence weight
- date range
- predictive suggestions
- Apply Filters
- Clear Filters
- pre-update status feedback
- current applied scope display

#### Redesign direction

Search should remain a database/library-style advanced search interface. It should not become part of Analytics or Inspector. It defines the active dataset that other workspaces consume.

Long-term, Search may become a full workspace with:

- advanced filters;
- record table or result list;
- sortable/filterable fields;
- saved searches, possibly later;
- actions to inspect or visualize search results.

#### Acceptance test

Typing in fields does not recompute on every keystroke. Suggestions fill draft fields only. Apply commits all filters together. Clear resets filters and playback. Visualizations, Timeline, Analytics/charts, Inspector, and Export consume the intended filtered scope.

---

### 6.5 Inspector workspace

#### Purpose

The Inspector workspace presents evidence, profiles, linked records, relationships, and navigable research context.

#### Current assets to preserve

- click/hover inspection
- node/person detail
- place detail
- route/edge detail
- cluster detail
- linked-letter detail pages
- internal navigation
- Back button
- related people
- related places
- directed routes
- date spans
- linked-letter counts
- selected uploaded fields
- custom fields from joined workbook sheets

#### Redesign direction

Inspector should become a full evidence dossier workspace, while still allowing compact selection summaries from visualization contexts.

Recommended two-level model:

```text
Compact Inspector Summary
- appears while viewing a visualization
- shows selected entity title, type, key counts, and “Open full Inspector” action

Full Inspector Workspace
- full-window dossier
- supports deep reading, linked-letter pages, profile sections, and navigation history
```

#### Person profile target structure

```text
Person profile header
- name
- role in dataset: source, target, or both
- linked letters
- date span
- principal places
- selected uploaded fields

Sections
- Related people
- Places this person sent letters to
- Places where this person received letters
- Directed routes
- Linked letters
- Additional uploaded metadata
```

#### Place profile target structure

```text
Place profile header
- place name
- linked people
- linked letters
- incoming routes
- outgoing routes
- date span

Sections
- People associated with this place
- Incoming correspondence
- Outgoing correspondence
- Linked letters
- Additional uploaded metadata
```

#### Route profile target structure

```text
Route profile header
- source → target
- direction
- represented letter count
- date span
- people involved

Sections
- Linked letters
- repeated correspondents
- topics / relationships / languages where available
- related places
- selected uploaded metadata
```

#### Linked-letter target structure

```text
Linked letter detail
- source person
- target person
- source place
- target place
- date
- archive / collection / pages
- transcription
- notes
- links
- selected custom fields
```

#### Cluster target structure

```text
Cluster detail
- cluster label or generated title
- contained members
- represented visible volume
- grouped by place
- member list with click-through to detail
```

#### Acceptance test

Clicking a node, edge, and cluster still creates a valid Inspector selection. The user can open a full Inspector workspace from a compact selection summary. Internal person/place/linked-letter navigation works. Back returns to the previous internal Inspector state.

---

### 6.6 Timeline workspace

#### Purpose

Timeline should become a global temporal controller for the active visualization, not just a map/network side-panel widget.

#### Current assets to preserve

- year-based start/end controls
- playback controls
- date filtering / temporal scope
- playback reset behavior when filters are applied

#### Target model

```text
loaded data
→ active filtered data
→ active temporal slice
→ active visualization
```

#### Behavior by visualization type

| Visualization type | Timeline behavior |
|---|---|
| Place map/network | reveal or animate routes/nodes by date/year |
| People network | reveal or animate people/edges by date/year |
| Force-directed network | update visible nodes/edges over time without unnecessary layout instability if possible |
| Bar chart | animate category counts over time or update selected temporal slice |
| Histogram | update distribution for active temporal slice |
| Line chart | may use timeline range as chart extent rather than animation frame |
| Heatmap | update values for selected temporal slice or cumulative range |
| Search results | filter visible records to active temporal slice |

#### Open question

Some chart types may need different timeline semantics:

- cumulative over time;
- current slice only;
- selected range;
- animated frame.

The first implementation should choose a simple consistent rule and document it.

#### Acceptance test

Timeline playback changes the active visualization state for the currently selected visualization, not only for map/network views. Existing timeline filtering and playback behavior remains stable for current map/network views during the transition.

---

### 6.7 Theme workspace

#### Purpose

Theme controls app appearance across maps, charts, panels, and workspace surfaces.

#### Current assets to preserve

- Peridot-inspired default theme
- Early modern map theme
- Modern map theme
- theme token system
- mode-sensitive stage rendering

#### Redesign direction

Theme should become a clear, standalone section.

Potential structure:

```text
Theme & Appearance

Presets
- Peridot
- Early modern map
- Modern map

Preview
- small visualization/card preview

Advanced appearance later
- map background
- chart palette
- contrast mode
- typography scale
```

#### Acceptance test

Changing theme still updates the expected visual surfaces without breaking map/network/chart rendering. Force-Directed still uses a clean themed background while geographic modes retain the intended map backdrop.

---

### 6.8 Export workspace

#### Purpose

Export should help users save visualizations and derived data clearly.

#### Current assets to preserve

- SVG export
- PNG export
- nodes CSV export
- edges/routes CSV export
- Analytics chart PNG export

#### Redesign direction

Export should clearly state what scope is being exported:

- loaded data;
- filtered data;
- visible visualization;
- selected entity;
- charted data;
- current timeline slice/range.

Export should feel like an output checklist rather than a settings drawer.

#### Acceptance test

Existing export functions continue to work. Export labels correctly identify whether the output reflects loaded, filtered, visible, selected, charted, or time-sliced data.

---

## 7. Visual design direction

### 7.1 Preserve Peridot identity

The peridot/moss/cream identity should remain. It gives the app a distinctive archival and botanical character.

### 7.2 Reduce monotony

The current interface risks visual monotony because many panels use similar green/cream surfaces. The redesign should use the Peridot palette more hierarchically:

- dark moss/peridot for navigation and strong structural anchors;
- cream/off-white for evidence cards and reading surfaces;
- muted neutrals for dense metadata or procedural areas;
- stronger accent colors only for primary actions, active states, warnings, and status indicators.

### 7.3 Distinguish workspace genres

Each major workspace should have a different visual genre:

| Workspace | Visual treatment |
|---|---|
| Home | open, spacious, low-density, introductory |
| Data | step-based, checklist/progress, validation-focused |
| Visualizations | stage-forward, minimal chrome, high visual priority |
| Search | compact advanced-search form, database/library style |
| Inspector | archival dossier, catalogue card, evidence reader |
| Timeline | horizontal temporal control system, animation console |
| Theme | swatches, previews, preset cards |
| Export | format cards, scope labels, action checklist |

### 7.4 Inspector visual style

The Inspector should receive the most careful visual design treatment. It should not look like a generic settings panel.

Desired qualities:

- clear entity title;
- entity type badge;
- concise metrics row;
- visible evidence counts;
- strong section hierarchy;
- readable linked-letter cards;
- tables only where useful;
- restrained decorative elements;
- archival/dossier feeling without fake parchment clutter.

---

## 8. Implementation strategy

This redesign should not be implemented in one large pass. It touches fragile zones: `App.jsx`, shared side-panel shell behavior, Inspector-open interactions, Search & Filter state, Timeline playback, Analytics rendering, and export scope.

Implementation should proceed through narrow, tested phases.

### Phase 0 — Preserve current baseline and document intent — Complete

**Change type:** documentation  
**Goal:** Add this redesign plan as a planning document without changing app behavior.  
**In scope:** new documentation file only.  
**Out of scope:** README, Maintainer's Guide, Changelog, app code.  
**Acceptance test:** The new redesign plan exists in the repository and does not alter app behavior.

### Phase 1 — Add workspace state without changing visible UI substantially — Complete

**Change type:** structural  
**Goal:** Introduce a safe internal workspace model that can later support Home, Data, Visualizations, Search, Inspector, Timeline, Theme, and Export.  
**Likely in scope:** `App.jsx`, possibly a small workspace helper/component file.  
**Out of scope:** visual redesign, Inspector restructuring, timeline generalization.  
**Acceptance test:** Current UI still works exactly as before, but workspace state exists and can switch between placeholder workspace modes if needed.

### Phase 2 — Create Home / welcome workspace — Complete

**Change type:** behavior + visual  
**Goal:** Make Peridot open to a welcome page with Upload my data and Use sample data choices.  
**In scope:** Home workspace component, startup workspace behavior, navigation from Home to Data/Visualizations.  
**Out of scope:** hamburger redesign, Inspector redesign, Timeline generalization.  
**Acceptance test:** App opens to Home. Upload button opens Data workflow. Sample-data button opens Visualizations with sample data.

### Phase 3 — Replace persistent icon rail with hamburger menu — Complete

**Change type:** structural + visual  
**Goal:** Remove ever-present rail and replace it with a hamburger-triggered labeled menu.  
**Likely in scope:** `LeftControlPanel.jsx` or successor menu component; shell/menu state; current tab labels.  
**Out of scope:** moving all workflows to full-window workspaces.  
**Acceptance test:** Hamburger opens menu. Menu contains labeled options. User can navigate to existing functional areas. Inspector still auto-opens from node, edge, and cluster clicks.

### Phase 4 — Remove obsolete Controls sections and isolate Theme — Mostly complete

**Change type:** visual/content cleanup  
**Goal:** Remove Display Controls and Summary/Diagnostics from ordinary UI; move Theme to its own menu destination.  
**In scope:** Controls content; Theme content boundary.  
**Out of scope:** theme redesign beyond relocation; data/filter/timeline behavior.  
**Acceptance test:** Obsolete sections are gone from user-facing UI. Theme remains accessible and functional.

### Phase 5 — Build unified Visualizations workspace — Complete for first implementation and capability-aware menus

**Change type:** structural + behavior + visual  
**Goal:** Put People, Place, Force-Directed, and chart visualizations under one Visualizations workspace.  
**In scope:** visualization picker, current network/map stage integration, Analytics chart selection integration.  
**Out of scope:** global timeline animation across all charts unless specifically included in a later subpass.  
**Acceptance test:** User can select network/map views and chart views from one Visualizations workspace. Existing map/network behavior and chart rendering remain functional.

### Phase 6 — Promote Inspector to full evidence dossier workspace — Complete for first implementation

**Change type:** structural + visual  
**Goal:** Add full-window Inspector workspace while preserving selection-driven Inspector behavior.  
**In scope:** Inspector workspace layout, compact selection summary, profile visual hierarchy, linked-letter detail presentation.  
**Out of scope:** broad map interaction rewrites; filter-to-selection actions unless explicitly included.  
**Acceptance test:** Node, edge, cluster, and linked-letter selections can be inspected in full workspace. Internal navigation and Back still work.

### Phase 7 — Integrate Timeline as bottom Visualizations scrubber — Deferred

**Change type:** behavior  
**Goal:** Replace the current side-panel Timeline bridge with a long bottom timeline/scrubber integrated into Visualizations, so users can toggle, scrub, or animate while still seeing the active map, network, or chart.  
**In scope:** timeline state model, active visualization adapter behavior, chart update semantics.  
**Out of scope:** major chart redesign unless necessary for animation semantics.  
**Acceptance test:** Timeline changes affect the currently active visualization. Existing map/network timeline behavior remains stable.

### Phase 8 — Visual differentiation and polish

**Change type:** visual  
**Goal:** Reduce monotony and create distinct visual treatments for Home, Data, Visualizations, Search, Inspector, Timeline, Theme, and Export.  
**In scope:** workspace-level styling, cards, typography, spacing, action hierarchy.  
**Out of scope:** new behavior.  
**Acceptance test:** Each workspace is visually distinct but still part of the Peridot design system.

### Phase 9 — Documentation update milestone

**Status:** Revisited after the data-capability and role-based upload-mapping milestone.

**Change type:** documentation  
**Goal:** Update README, Maintainer's Guide, Changelog, and possibly Workflow Charter to reflect implemented redesign milestones.  
**In scope:** documentation after implemented changes.  
**Out of scope:** code changes.  
**Acceptance test:** Documentation accurately describes the implemented interface and preserves full commit history in Changelog.

---

## 9. Fragile zones and cautions

The redesign must respect known fragile zones.

### 9.1 Inspector auto-open path

The current code still contains old compatibility naming around left/right panel visibility. Although misleading, that path preserves Inspector auto-open behavior. Prior semantic cleanup broke node/edge/cluster click-to-Inspector behavior.

Do not casually rename compatibility-sensitive side-panel props or setters during menu or Inspector redesign.

Any pass touching this area must test:

- node click opens Inspector;
- edge click opens Inspector;
- cluster click opens Inspector;
- contained cluster member opens detail;
- Back behavior still works.

### 9.2 Shared side-panel shell behavior

The side-panel shell is a fragile UI boundary. Replacing the persistent rail with a hamburger menu should be done without simultaneously redesigning Inspector, Search, Timeline, and Analytics internals.

### 9.3 Responsive layout

A prior universal responsive-panel positioning attempt was rolled back because it disrupted normal full-size landscape layout. Future responsive work should be narrow-window-specific, not a universal replacement.

### 9.4 Search & Filter active-dataset state

Search & Filter defines the active filtered dataset. It should not recompute on every keystroke. Predictive suggestions should fill draft fields only. Apply should commit filters together. Clear should reset filters and playback.

Do not combine Search redesign with broad `App.jsx` refactoring unless explicitly planned as a structural pass.

### 9.5 Timeline state coupling

Timeline currently has year-based filtering and playback. Generalizing it across visualization types should happen after the Visualizations workspace model is stable.

### 9.6 Analytics chart rendering and export

Charts already have compact and expanded states plus PNG export. Moving chart types into Visualizations should preserve chart rendering and export behavior.

### 9.7 Data Inputs workflow

The current Data Inputs workflow supports one-file CSV, arbitrary CSV/TSV mapping, workbook mapping, unique-ID joins, validation, and persistent upload summary. Do not regress this while moving Data into a larger workspace.

### 9.8 Dormant MapLibre code

MapLibre preview files remain dormant. The redesign should not remove, revive, or refactor MapLibre code unless a future pass explicitly resumes MapLibre work.

---

## 10. Decisions recorded by this plan

### Decision 1 — Peridot becomes multimodal, not map-first

**Chosen:** Reframe Peridot as a multimodal correspondence exploration workspace.  
**Rejected:** Continue treating the map/network stage as the permanent main view and everything else as side-panel support.  
**Reason:** Current features now exceed a map-centered model. Charts, search, workbook data, timeline, and Inspector dossiers deserve first-class workspace treatment.

### Decision 2 — Persistent icon rail should be removed

**Chosen:** Use a hamburger button to open a labeled menu.  
**Rejected:** Keep an ever-present icon rail.  
**Reason:** The rail is semantically flat, icon-dependent, and visually persistent even when not needed.

### Decision 3 — Visualization options should be consolidated

**Chosen:** People, Place, Force-Directed, and chart types should eventually live together in Visualizations.  
**Rejected:** Keep People/Place/Force-Directed inside Controls while charts live separately in Analytics.  
**Reason:** All of these are visualization modes. Separating them reinforces an obsolete map-first model.

### Decision 4 — Inspector should become a full workspace

**Chosen:** Promote Inspector toward a full evidence dossier workspace with compact summary support.  
**Rejected:** Keep all Inspector functionality confined to a narrow side panel.  
**Reason:** Inspector now contains rich profile, linked-letter, cluster, route, and custom-metadata content that needs more space and stronger hierarchy.

### Decision 5 — Timeline should become visualization-agnostic

**Chosen:** Timeline should eventually animate or temporally scope whichever visualization is active.  
**Rejected:** Keep Timeline as a map/network-specific side-panel control.  
**Reason:** A multimodal visualization tool needs a global temporal model.

### Decision 6 — Theme should be independent

**Chosen:** Theme becomes its own section.  
**Rejected:** Keep Theme as a subsection of generic Controls.  
**Reason:** Theme affects the whole app and should not be treated as a residual display control.

### Decision 7 — Display Controls and Summary/Diagnostics should be removed from ordinary UI

**Chosen:** Remove these from the public interface unless a still-needed function is identified.  
**Rejected:** Keep them as legacy Controls sections.  
**Reason:** They contribute to clutter and prototype feel.

---

## 11. Open questions

These should be resolved during implementation planning, not guessed prematurely.

### 11.1 Menu labels

Should the top-level menu use short labels:

```text
Home / Data / Visualizations / Search / Inspector / Timeline / Theme / Export
```

or more descriptive labels:

```text
Start / Data Inputs / Explore Visualizations / Search Records / Inspect Evidence / Timeline / Theme & Appearance / Export
```

Recommendation: use shorter labels with descriptive subtitles in the menu.

### 11.2 Home behavior after first use

Should Peridot always open to Home, or remember the user's last workspace?

Recommendation for first implementation: always open to Home. Later, consider remembering last workspace only if it does not confuse new users.

### 11.3 Sample data semantics

Should **Use sample data** explicitly reload/reset to the embedded sample dataset, or simply continue with the built-in baseline already loaded?

Recommendation: make the action explicit. The button should open the sample dataset and make clear that sample data is active.

### 11.4 Compact Inspector summary

Should a compact Inspector summary appear as an overlay, drawer, or small side card while the user is in Visualizations?

Recommendation: defer until full Inspector workspace is designed. In the short term, use menu navigation to Inspector and preserve existing auto-open behavior.

### 11.5 Timeline semantics for charts

Should timeline animation be cumulative, frame-based, or range-based for each chart type?

Recommendation: start with one simple rule and document exceptions. For charts, selected temporal range may be safer than frame-by-frame animation in the first implementation.

### 11.6 Workspace URL routes

Should workspace state be reflected in the URL?

Recommendation: not in the first pass. Internal state is safer. URL routing can be considered later.

---

## 12. Current next design priorities after initial implementation

The first implementation sequence has already been completed through the current routing milestone. Peridot now has full workspaces for Home, Data, Visualizations, Search & Filter, Theme, and Export.

Recommended next planning/design priorities:

1. **Inspector Workspace Design Contract** — define the full evidence-dossier model before code promotion.
2. **Timeline bottom-scrubber design contract** — define how Timeline should live at the bottom of Visualizations and interact with maps, networks, and charts.
3. **Visual differentiation pass** — after the remaining routing/design contracts are stable, refine each workspace’s visual character.
4. **Legacy side-panel cleanup** — only after Timeline and Inspector no longer depend on the legacy bridge.

## 13. Proposed acceptance-test suite for the redesign sequence

As the redesign proceeds, each milestone should repeatedly test the following baseline behaviors:

### Data

- Template download works.
- Valid Peridot CSV upload updates app data.
- Arbitrary CSV/TSV mapping still works.
- XLSX/XLS workbook staging and unique-ID joins still work.
- Validation popup appears.
- Persistent latest-upload summary remains available.

### Search

- Typing in filter fields does not recompute on every keystroke.
- Suggestions fill draft fields only.
- Apply commits filters.
- Clear resets filters and playback.
- Applied scope is clear.

### Visualizations

- People view renders.
- Place view renders.
- Force-Directed view renders.
- Chart views render.
- Active filtered dataset is respected.

### Inspector

- Node click opens Inspector.
- Edge click opens Inspector.
- Cluster click opens Inspector.
- Cluster member click opens detail.
- Linked-letter detail opens.
- Back works.
- Person/place profile sections remain available.
- Selected custom fields remain visible.

### Timeline

- Year controls work.
- Playback works.
- Applying filters resets or coordinates playback as intended.
- Timeline does not use stale date scope after upload.

### Export

- SVG export works.
- PNG export works.
- nodes CSV export works.
- edges/routes CSV export works.
- chart PNG export works.
- export scope labels remain accurate.

### Layout

- Hamburger menu opens and closes reliably.
- Main workspace does not force unwanted full-page scrolling in normal landscape layout.
- Narrow-window behavior does not break full-size desktop behavior.

---

## 14. Summary

Peridot has outgrown its current side-panel-heavy interface. The existing shared shell and rail were useful transitional architecture, but the app now needs a broader workspace model.

The redesign should move Peridot toward:

```text
Home
→ Data
→ Search
→ Visualizations
→ Timeline
→ Inspector
→ Theme
→ Export
```

The main workspace should no longer be synonymous with a map. Maps, networks, charts, advanced search, and evidence dossiers should all be valid central workspace modes.

The hamburger menu should replace the persistent icon rail. Visualization choices should be consolidated. Theme should become independent. Obsolete display/diagnostic controls should be removed. Inspector should become a full evidence dossier workspace. Timeline should eventually animate the active visualization, not only maps/networks.

The redesign should be implemented in bounded passes, with special care around `App.jsx`, shared side-panel behavior, Inspector auto-open behavior, Search & Filter state, Timeline coupling, Data Inputs, Analytics chart rendering, and export scope.
