# Maintainer's Guide

## Purpose

This document is the architectural reference for the correspondence visualizer app. It should stay aligned with the committed source of truth in the repository and with the workflow rules in `PROJECT_WORKFLOW_CHARTER.md`. This guide is updated on committed architectural changes and should be sufficient to hand off work into a fresh chat session without depending on older conversation context.

---

## Source of truth and working assumptions

Current source of truth folder:

- `C:\Users\haley\OneDrive\Desktop\CorrespondenceVisualizer\`

Current clean safe baseline:

- **`57b946e` — `Make timeline year-based`**

This project should continue to follow the user's bounded-pass workflow:

- one source of truth per pass
- classify each pass as exactly one of: behavior, visual, structural, documentation
- keep one clear goal per pass
- use explicit acceptance tests
- checkpoint before higher-risk work
- separate behavior changes from visual changes
- when runtime issues appear after interaction, check the **F12 browser console early**

---

## Repository shape

Current live app surface includes:

- `src/App.jsx`
- `src/index.css`
- `src/main.jsx`

Extracted panel / inspector boundaries now present in `src/`:

- `src/LeftControlPanel.jsx`
- `src/RightInspectorPanel.jsx`
- `src/InspectorBodyRouter.jsx`
- `src/InspectorEmptyState.jsx`
- `src/InspectorClusterView.jsx`
- `src/InspectorEdgeView.jsx`
- `src/InspectorNodeView.jsx`

Extracted support modules now present in `src/`:

- `src/mapLayoutHelpers.js`
- `src/mapStageComponents.jsx`
- `src/interactionHelpers.js`
- `src/mapInteractionHandlers.js`
- `src/timelinePlaybackHelpers.js`
- `src/timelinePlaybackComponents.jsx`
- `src/exportHelpers.js`
- `src/personForceLayoutHelpers.js`
- `src/InspectorConnectedCorrespondents.jsx`
- `src/InspectorPersonPlaces.jsx`
- `src/InspectorBackButton.jsx`

Maintainer/workflow documents at repo root:

- `README.md`
- `MAINTAINERS_GUIDE.md`
- `PROJECT_WORKFLOW_CHARTER.md`
- `CHANGELOG.md`
- `CONTROL_PANEL_DEPENDENCY_MAP.md`
- `VIEWPORT_TIMELINE_AUDIT.md`

---

## Architectural summary

The app is a Vite/React/Tailwind correspondence visualizer with three user-facing visualization choices:

- **People**
- **Place**
- **Force-Directed**

Internally, the app still uses the geographic/person view split plus person layout mode, but the user-facing control model is now simplified through direct view buttons.

The app includes:

- CSV ingestion and normalization
- graph derivation
- interactive SVG-based rendering
- year-based timeline filtering and playback
- right-panel inspection workflow
- theme presets and visual controls
- export tools for image and tabular outputs

The main maintenance challenge remains structural concentration in `src/App.jsx`, but that concentration has been reduced substantially in bounded passes.

The current person-network layouts are:

- **geographic-anchor**
- **force-directed** (pre-settled `d3-force`)

The force-directed person view is intentionally rendered on a clean theme-driven background rather than on top of the geographic map backdrop.

The inspector supports internal navigation between **people** and **places**, with a working Back button for returning to the immediately previous internal inspector panel.

---

## Current module responsibilities

### `src/App.jsx`
Still the main orchestration file. It owns top-level state, derived data wiring, workspace composition, theme token definitions, control-panel contract building, timeline state, and inspector navigation state.

### `src/LeftControlPanel.jsx`
Owns the current left-panel UI boundary and section composition.

### `src/RightInspectorPanel.jsx`
Owns the inspector shell boundary.

### `src/InspectorBodyRouter.jsx`
Routes resolved inspector state to the appropriate extracted view.

### `src/InspectorEmptyState.jsx`
Owns the empty inspector state.

### `src/InspectorClusterView.jsx`
Owns the cluster inspector state boundary.

### `src/InspectorEdgeView.jsx`
Owns the edge inspector state boundary.

### `src/InspectorNodeView.jsx`
Owns the node / person-detail / place-detail inspector boundary.

### `src/mapLayoutHelpers.js`
Pure map/layout helper logic.

### `src/mapStageComponents.jsx`
Map-stage-adjacent UI/chrome components.

### `src/interactionHelpers.js`
Pure interaction-resolution and selection-building helpers. This file owns helper logic for:

- nearby candidate generation
- selection resolution
- weighted connected-correspondent ordering
- `person-detail` and `place-detail` payload derivation
- person-detail sent/received place-section derivation

### `src/mapInteractionHandlers.js`
Top-level map interaction handlers.

### `src/timelinePlaybackHelpers.js`
Pure timeline/playback derivation helpers.

### `src/timelinePlaybackComponents.jsx`
Timeline/playback panel UI boundary. The timeline is now **year-based**, not month-based.

### `src/exportHelpers.js`
Pure export utilities and export row-builder helpers.

### `src/personForceLayoutHelpers.js`
Pure helper logic for the pre-settled force-directed person-network layout.

### `src/InspectorConnectedCorrespondents.jsx`
Inspector navigation component for person-to-person movement.

### `src/InspectorPersonPlaces.jsx`
Inspector navigation component for person-to-place movement. It shows two explicit sections:

- **Places this person sent letters to**
- **Places where this person received letters**

### `src/InspectorBackButton.jsx`
Inspector-internal Back button.

It uses a small local history model for **inspector-internal navigation only** and does not attempt to track ordinary map clicks as navigation history.

---

## Current functional state

### Visualization modes
- Place view
- People view
- Force-Directed view

### Person-network layouts
- geographic-anchor layout
- pre-settled force-directed layout

### Inspector capabilities
- hover and click inspection
- linked records browsing
- internal navigation between people and places
- Back button support for inspector-internal navigation

### Timeline capabilities
- year-based date filtering
- playback controls
- timeline panel UI extracted into supporting components/helpers
- month selectors removed in favor of start-year / end-year controls

### Export capabilities
- SVG export
- PNG export
- nodes CSV export
- edges/routes CSV export

---

## Current theme and panel state

The default full-app theme remains **Peridot-inspired**.

Other retained presets still function as map-focused alternatives:

- Early modern map
- Modern map

Important current control-panel state:

- current top-level left-panel grouping uses **DATA** and **OPTIONS**
- key sections include:
  1. Data Inputs
  2. Visualization Type
  3. Display Controls
  4. Timeline
  5. Theme
  6. Export
  7. Summary and Diagnostics

The current panel state also includes these recent committed behavior changes:

- direct view buttons for **People**, **Place**, and **Force-Directed**
- **People** as the default startup view
- committed minimum-weight numeric input with **Enter** / **Update** apply behavior
- removal of the old **Show all dates** shortcut
- year-only timeline selectors

---

## Recent development trajectory (step by step)

This section is intentionally explicit so a future maintainer can explain how the current state emerged.

### `86ad35f` — Extract left control panel component
Moved the left control panel out of `src/App.jsx` into `src/LeftControlPanel.jsx`.

### `6a32004` — Harden inspector contract in place
Stabilized the inspector selection contract before extraction work continued.

### `c0a15fd` — Extract inspector shell and router
Established the extracted inspector shell and routing boundary.

### `003fae1` — Split empty cluster and edge inspector views
Moved the easier inspector views out of `src/App.jsx`.

### `149315a` — Extract inspector node view
Completed the main inspector-view extraction by moving node/person/place inspector rendering into its own file.

### `2d627e2` — Remove legacy inspector bodies from App
Removed dead in-file inspector bodies after extraction stabilized.

### `fa486b8` — Remove orphaned panel helper functions
Removed now-unused helper/style functions from `src/App.jsx`.

### `96064e2` — Set people as default view and simplify view buttons
Replaced the old two-step visualization selection with direct buttons and made **People** the default startup view.

### `3fedd97` — Tighten minimum weight helper text
Finished the committed minimum-weight control change by simplifying its helper copy after the slider-to-input redesign.

### `79d5ae1` — Remove show all dates shortcut
Removed the old timeline shortcut from Display Controls so date behavior now lives in the Timeline block.

### `57b946e` — Make timeline year-based
Converted the timeline from month-based controls to year-only boundaries while preserving the broader timeline/playback model.

---

## Deferred / rolled-back work

### Cluster drill-down attempt
After `57b946e`, a bounded attempt was made to make cluster indicators drillable through the inspector:

- cluster click should open a cluster-member list
- clicking a represented member should open that member’s detail
- Back should return to the cluster view

That work was **not committed** and was rolled back to preserve the safe baseline. Future work should revisit cluster drill-down in a fresh bounded pass, starting from the clean baseline rather than from the rolled-back experimental state.

---

## Current fragile zones

These areas still deserve narrow, explicit passes:

- map viewport centering/reset behavior
- dense map hover/click interaction
- selection persistence across filters
- timeline/playback state coupling
- export rendering/state coupling
- broad orchestration work in `src/App.jsx`
- control-panel render boundaries
- inspector-open interactions after map clicks

### Additional caution

Generated helper scripts and backup files should be removed after use.

Examples of things that should not linger in the repo folder:

- temporary Python patch scripts
- temporary PowerShell patch scripts
- `itch_upload/`
- backup `.jsx` / `.js` files made during local patching

---

## Workflow reminders

Future work should continue to follow the user’s established workflow:

- one bounded pass at a time
- classify each pass as **behavior**, **visual**, **structural**, or **documentation**
- one explicit acceptance test per pass
- prefer local/small edits when safe
- use checkpoints before higher-risk changes
- only ask for the sync ritual after an actual checkpoint or commit
- prefer direct file delivery and exact Windows PowerShell commands
- prefer `.txt` delivery for generated scripts when direct source-file downloads are unreliable
- when runtime issues appear after interaction, check the **F12 browser console early**

This recent work also reinforced these process rules:

- target patch scripts against the **exact live file shape**
- if a UI change does not appear, verify the live file before stacking more patches
- do **behavior pass first**, then cleanup pass second
- if a pass starts drifting, restore to the last safe commit rather than continuing to stack speculative fixes
- when a long conversation becomes unreliable or laggy, restore the safe baseline, update docs, and continue in a fresh chat

---

## Fresh-chat handoff note

A future chat should start from:

- source of truth folder: `C:\Users\haley\OneDrive\Desktop\CorrespondenceVisualizer\`
- clean baseline: `57b946e`

A future chat should also be told that:

- the app identity is **Peridot**
- the current fixed basemap is `countries50m`
- itch.io packaging support is already committed
- the panel/inspector extraction work is committed
- the current safe baseline includes:
  - direct view buttons
  - People default view
  - minimum-weight input
  - year-based timeline
- cluster drill-down was attempted and rolled back
- documentation should preserve the full commit trajectory meticulously
