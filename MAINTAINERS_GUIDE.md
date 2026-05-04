# Maintainer's Guide

## Purpose

This document is the architectural reference for the Peridot correspondence visualizer app. It should stay aligned with the committed source of truth in the repository and with the workflow rules in `PROJECT_WORKFLOW_CHARTER.md`.

This guide is updated on committed architectural changes and should be sufficient to hand off work into a fresh chat session without depending on older conversation context.

---

## Source of truth and working assumptions

Current source of truth folder:

- `C:\Users\haley\OneDrive\Desktop\CorrespondenceVisualizer\`

Current clean safe baseline:

- **`4a17d1c` — `Make inspector panel content-only`**

Current GitHub repository:

- `https://github.com/haleyrp1803/correspondence-visualizer`

When the local folder and GitHub are confirmed aligned by the sync ritual, treat the current Git commit as the source of truth.

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

Current panel / inspector boundaries in `src/`:

- `src/LeftControlPanel.jsx`
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

- `src/mapLayoutHelpers.js`
- `src/mapStageComponents.jsx`
- `src/interactionHelpers.js`
- `src/mapInteractionHandlers.js`
- `src/timelinePlaybackHelpers.js`
- `src/timelinePlaybackComponents.jsx`
- `src/exportHelpers.js`
- `src/personForceLayoutHelpers.js`

Maintainer/workflow documents at repo root:

- `README.md`
- `MAINTAINERS_GUIDE.md`
- `PROJECT_WORKFLOW_CHARTER.md`
- `CHANGELOG.md`
- `CONTROL_PANEL_DEPENDENCY_MAP.md`
- `VIEWPORT_TIMELINE_AUDIT.md`

---

## Architectural summary

Peridot is a Vite/React/Tailwind correspondence visualizer with three user-facing visualization choices:

- **People**
- **Place**
- **Force-Directed**

Internally, the app still uses the geographic/person view split plus person layout mode, but the user-facing control model uses direct view buttons.

The app includes:

- CSV ingestion and normalization
- graph derivation
- interactive SVG-based rendering
- year-based timeline filtering and playback
- shared side-panel inspection workflow
- theme presets and visual controls
- export tools for image and tabular outputs

The main maintenance challenge remains structural concentration in `src/App.jsx`, but that concentration has been reduced through bounded extraction passes.

The current person-network layouts are:

- **geographic-anchor**
- **force-directed** using pre-settled `d3-force`

The force-directed person view renders on a clean theme-driven background rather than on top of the geographic map backdrop.

---

## Current module responsibilities

### `src/App.jsx`

Main orchestration file. It owns top-level state, derived data wiring, workspace composition, theme token definitions, side-panel contract building, timeline state, inspector navigation state, and export wiring.

### `src/LeftControlPanel.jsx`

Owns the shared side-panel shell. The shell includes:

- collapsed left rail with Controls and Inspector openers
- open/close shell behavior
- Controls / Inspector tab switcher
- Controls content rendering
- Inspector content rendering through `InspectorPanelContent`

This file currently remains named `LeftControlPanel.jsx`, but it is now conceptually the shared side-panel shell.

### `src/InspectorPanel.jsx`

Owns inspector content only. It no longer owns the outer panel shell. It renders:

- inspector header
- inspector-internal Back button
- `InspectorBodyRouter`

### `src/InspectorBodyRouter.jsx`

Routes resolved inspector state to the appropriate extracted view.

### `src/InspectorEmptyState.jsx`

Owns the empty inspector state.

### `src/InspectorClusterView.jsx`

Owns the cluster inspector view. Current behavior groups contained members by place and sorts groups/members by represented visible volume.

### `src/InspectorEdgeView.jsx`

Owns the edge inspector state boundary.

### `src/InspectorNodeView.jsx`

Owns the node / person-detail / place-detail inspector boundary.

### `src/mapLayoutHelpers.js`

Pure map/layout helper logic, including viewport construction, clustering, cluster radius calculation, label visibility, and geometric calculations.

### `src/mapStageComponents.jsx`

Map-stage-adjacent UI/chrome components.

### `src/interactionHelpers.js`

Pure interaction-resolution and selection-building helpers. This file owns helper logic for:

- nearby candidate generation
- selection resolution
- cluster selection payload building
- connected-correspondent ordering
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

Inspector-internal Back button. It uses a small local history model for inspector-internal navigation only and does not track ordinary map clicks as navigation history.

---

## Current functional state

### Visualization modes

- Place view
- People view
- Force-Directed view

### Person-network layouts

- geographic-anchor layout
- pre-settled force-directed layout

### Side-panel capabilities

- one shared left-side panel shell
- Controls and Inspector as tabs inside that shell
- collapsed left rail with Controls and Inspector icons
- shell-level open/close behavior
- Inspector auto-opens from node, edge, and cluster interactions

### Inspector capabilities

- hover and click inspection
- linked records browsing
- internal navigation between people and places
- Back button support for inspector-internal navigation
- actionable cluster inspector views
- cluster members grouped by place and ordered by visible volume

### Timeline capabilities

- year-based date filtering
- playback controls
- timeline panel UI extracted into supporting components/helpers
- month selectors removed in favor of start-year / end-year controls

### Map and sizing capabilities

- dynamic node radius contrast based on visible active data
- volume-based zoom-responsive cluster sizing
- zoom-responsive proximity clustering for nearby nodes/places
- edge sizing unchanged by the recent node/cluster sizing work

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

- current top-level grouping uses **DATA** and **OPTIONS**
- key sections include:
  1. Data Inputs
  2. Visualization Type
  3. Display Controls
  4. Timeline
  5. Theme
  6. Export
  7. Summary and Diagnostics

Recent committed behavior includes:

- direct view buttons for **People**, **Place**, and **Force-Directed**
- **People** as the default startup view
- committed minimum-weight numeric input with **Enter** / **Update** apply behavior
- removal of the old **Show all dates** shortcut
- year-only timeline selectors

---

## Recent development trajectory

### Cluster and sizing sequence

#### `ed39e55` — Make cluster nodes open actionable inspector views

Made cluster nodes clickable and made contained cluster members navigable through the inspector.

#### `3187d05` — Increase dynamic node radius contrast

Introduced stronger dynamic node radius contrast based on active data while preserving caps.

#### `fed4b5b` — Use volume-based zoom-responsive cluster sizing

Made cluster sizing reflect represented letter volume and made clustering respond more appropriately to zoom/proximity.

#### `63003c1` — Group cluster inspector members by place

Grouped cluster inspector members by place and ordered groups/members by volume.

### Shared side-panel sequence

#### `0063145` — Use menu icon for inspector toggle

Changed the collapsed Inspector toggle icon from magnifying glass to menu/hamburger.

#### `17cf020` — Enforce single active side panel

Ensured only one side panel could be open at a time.

#### `df4075a` — Move side panel toggles to left rail

Moved both panel opener icons to the left rail.

#### `f98b3e5` — Add panel mode switcher tabs

Added Controls / Inspector tabs inside the open panel.

#### `2126c9b` — Open inspector in left panel dock

Moved the inspector to the left-side panel area.

#### `88b0c19` — Rename inspector panel shell for left dock

Renamed `RightInspectorPanel.jsx` to `InspectorPanel.jsx`.

#### `e41d8bc` — Split side panel open state from active tab

Separated side-panel open/closed state from active tab state.

#### `b62c74b` — Use shared side panel shell

Created one shared side-panel shell for both Controls and Inspector.

#### `4a17d1c` — Make inspector panel content-only

Removed obsolete shell/tab code from `InspectorPanel.jsx`.

---

## Deferred / rolled-back work

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

- map viewport centering/reset behavior
- dense map hover/click interaction
- selection persistence across filters
- timeline/playback state coupling
- export rendering/state coupling
- broad orchestration work in `src/App.jsx`
- shared side-panel shell and inspector-open interactions
- cluster grouping and cluster inspector navigation

---

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

- source of truth folder: `C:\Users\haley\OneDrive\Desktop\CorrespondenceVisualizer\`
- clean baseline: **`4a17d1c` — `Make inspector panel content-only`**

A future chat should also be told that:

- the app identity is **Peridot**
- the fixed basemap is `countries50m`
- itch.io packaging support is already committed
- the current shared side panel is committed
- `InspectorPanel.jsx` is content-only
- `LeftControlPanel.jsx` owns the shared panel shell
- current cluster features are committed, not deferred
- documentation should preserve the full commit trajectory carefully
