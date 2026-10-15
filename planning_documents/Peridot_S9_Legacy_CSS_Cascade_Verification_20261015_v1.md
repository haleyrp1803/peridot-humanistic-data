# Peridot S9 — Legacy CSS & Cascade Verification

**Date:** 2026-10-15  
**Classification:** Structural architecture audit / documentation; **no source changes**  
**Confirmed repository checkpoint (user-provided):** `f667329` (`main`, clean and synchronized).  
**Effective audited source:** exact `src(20261014-235531).zip` plus the accepted S1–S6, S8 Home, and S8b Data replacement files, overlaid in chronological order. S7 was an audit only. The accepted S8 changes correspond to Git checkpoint `f667329`; no independent Git checkout/build of this checkpoint was available.

## Executive verdict

**Proceed with the visual redesign after documenting the cascade contract; no high-confidence dead-rule deletion is required as a blocker.** Styling ownership is substantially improved, but S1–S8 did *not* fully consolidate inline JSX styling or historical overrides. The principal risks are (a) distributed stylesheet import ownership, (b) old workspace-specific cascade layers, and (c) two-way theme consumption by CSS and React. Treat these as migration constraints, not permission to delete rules by selector count.

### Audited inventory

17 CSS files; **8,392 combined physical lines**. This includes `styles/foundations/tokens.css`, four shared component CSS files, and two new workspace CSS files. `src/index.css` now contains 812 lines. Simple `!important` occurrence counts are *diagnostic*, not estimates of removable rules.

| File | Lines | `!important` occurrences | Role / action |
|---|---:|---:|---|
| `src/index.css` | 812 | 32 | Global primitives, broad structural presentation and retained legacy overrides; gradually partition during visual passes |
| `src/styles/foundations/tokens.css` | 61 | 0 | Central non-color design scales |
| `src/styles/components/buttons.css` | 112 | 0 | Shared button base + theme overrides |
| `src/styles/components/forms.css` | 57 | 0 | Shared form base + theme overrides |
| `src/styles/components/cards.css` | 106 | 0 | Shared cards and responsive grids |
| `src/styles/components/panels.css` | 87 | 0 | Shared workspace frames and cross-component ornamental surfaces |
| `src/styles/workspaces/home.css` | 14 | 0 | Home-owned static geometry, migrated in S8 |
| `src/styles/workspaces/data.css` | 11 | 0 | Data entry-action CSS variables, migrated in S8b |
| `src/InspectorPanel.css` | 195 | 0 | Inspector-specific UI |
| `src/AnalyticsPanel.css` | 238 | 22 | Analytics-specific presentation |
| `src/PeridotSearchWorkspace.css` | 3,276 | 85 | Explore/Search, multiple accumulated refinements |
| `src/PeridotColumnMappingModal.css` | 860 | 128 | Mapping workflow; high-risk legacy specificity |
| `src/PeridotLearnMoreWorkspace.css` | 375 | 0 | About workspace |
| `src/PeridotTutorial.css` | 1,662 | 20 | Tutorial overlays, anchoring and state-dependent views |
| `src/PeridotFeedbackForm.css` | 363 | 0 | Feedback modal/form |
| `src/PeridotGlobalHeader.css` | 105 | 0 | Header-owned styling, component import |
| `src/PeridotTransitionOverlay.css` | 58 | 0 | Transition-owned styling, component import |

## 1. Verified cascade and import contract

`src/main.jsx` imports styles in this order:

1. `index.css`
2. `styles/foundations/tokens.css`
3. `styles/components/buttons.css`
4. `styles/components/forms.css`
5. `styles/components/cards.css`
6. `styles/components/panels.css`
7. `InspectorPanel.css`
8. `AnalyticsPanel.css`
9. `PeridotSearchWorkspace.css`
10. `PeridotColumnMappingModal.css`
11. `PeridotLearnMoreWorkspace.css`
12. `PeridotTutorial.css`
13. `PeridotFeedbackForm.css`

**Additional component-owned imports:** `PeridotGlobalHeader.jsx` imports `PeridotGlobalHeader.css`; `PeridotTransitionOverlay.jsx` imports `PeridotTransitionOverlay.css`; `PeridotHomeWorkspace.jsx` imports `styles/workspaces/home.css`; `PeridotDataWorkspace.jsx` imports `styles/workspaces/data.css`. Those stylesheets are *not* listed in `main.jsx` and should not be assumed to obey a simple directory-based cascade hierarchy. Module evaluation and bundler stylesheet extraction can affect their relative precedence. Verify **actual production CSS order** before attempting specificity simplification or moving them into a global entrypoint.

**Observed pattern:** original base selectors often coexist with later semantic role overrides. This is expected. Source order, media queries, selector specificity and pseudo-state collectively determine behavior. CSS has not been converted to `@layer`; introducing cascade layers would be a distinct, high-risk structural project and is **not recommended as a prerequisite** for the redesign.

## 2. Theme ownership contract

- `peridotTheme.js` (1,433 lines in supplied source) is the semantic theme/palette authority and supports runtime application.
- `peridotColorPalette.js` (974 lines) is a compatibility adapter and should remain functional during transition. It is **not** a second destination for new visual-design colors.
- `peridotThemeRoleMetadata.js` (281 lines) documents / exposes theme role metadata.
- `styles/foundations/tokens.css` owns typography scales, spacing, radii, shadow and motion values (non-color). Current values should be preserved until an explicit visual pass.
- React legitimately owns per-record/per-category data colors, calculated visualization geometry and interaction-driven style updates; such values should not be naively hoisted into static CSS.
- Workspace-specific decorative colors should preferentially consume **semantic theme roles**. New brand constants should not be copied directly into `Home.jsx`, `Data.jsx`, and the header independently.
- Brand color semantics are **separate from categorical, geographic, network and temporal visualization encodings**.

The theme architecture has both CSS and JavaScript consumers. Do not remove a role solely because a search of `.css` files finds no usages: inspect JSX/JS imports and style objects as well.

## 3. Repetition / specificity findings

The following are **investigation targets**, not safe-deletion lists:

| Area | Concrete examples | Interpretation |
|---|---|---|
| Global styles | `index.css` `.peridot-workspace-field` at lines 37 and 666; `.peridot-kicker` at 59 and 683; `.peridot-home-logo` at 99 and 108 | Rules appear in different contexts/eras; compare declaration sets and breakpoint applicability before deciding whether to consolidate |
| Explore | `.peridot-search-workspace .peridot-search-refine-grid` at lines 555, 1575, 1629, 1653, 1696, 1756 | Multiple layout refinements/media states; inspect containing `@media`, cascade order and specificity in full |
| Mapping | `.peridot-mapping-step-button` appears at lines 74, 301, 348, 373, 419 and in more qualified transition selectors | Mapping's 128 `!important` occurrences and repeated controls require an isolated regression pass |
| Tutorial | `.peridot-tutorial-callout` and step-qualified variants occur across tutorial and placement sections | Tutorial positioning and state handling make selector repetition potentially intentional |
| Shared component CSS | Buttons, forms and cards intentionally contain both base rules and theme-role overrides | Not duplicates to delete blindly |

**No selector has been verified dead.** A declaration appearing multiple times may be additive, media-specific, a legitimate override or dependent on an application state not visible in a static scan. A rigorous dead-code verdict requires class usage inventory *and* rendered-state coverage (including tutorial steps, Mapping wizard states, data sample switching, visualization switching and viewport variants).

## 4. Explicit style ownership for new work

| Visual decision | Destination / owner | Not permitted as a default |
|---|---|---|
| Global semantic colors | Existing theme engine and documented roles | New competing palette engine |
| Non-color scales | `styles/foundations/tokens.css` | Repeating global spacing/typography constants across JSX |
| Shared button, input, card, frame appearances | `styles/components/` | Reimplementing global variants in each workspace |
| Header composition | `PeridotGlobalHeader.css` pending later deliberate relocation | Additional global overrides to tune header appearance |
| Home editorial composition | `styles/workspaces/home.css` | Expanding large JSX inline static style literals |
| Data entry layout/actions | `styles/workspaces/data.css` | Repeating action styles or relocating animation-state calculations blindly |
| Explore / Mapping / Tutorial layout | Their existing workspaces pending their dedicated redesign | Generic panel abstractions that alter semantic UI states |
| Graphics provenance | Versioned asset manifest with license / source / use | Undocumented stock or historical map imagery |
| Dynamic coordinates, panning, playback and computed visualization dimensions | React / dedicated visualizations | Static tokens that cannot express data-dependent geometry |

## 5. Cleanup triage

**Must do before visual implementation:**
- Keep an authoritative record of the current import order (above) and the four component-local stylesheet imports.
- Confirm that style guide and audit documents in `planning_documents/` are clearly named and contain no contradictory final authority assertions; style guide is a design proposal, theme roles remain implementation authority.
- Preserve a clean Git checkpoint after each structural or visual pass; do not mix behavior, structural, visual and documentation changes in one pass without explicitly agreeing to an exception.

**Do when redesigning that surface (safe deferral):**
- Move remaining Home static visual presentation out of JSX while introducing editorial typography and collage layout.
- Migrate Data menu/action appearance without moving React state-dependent animations.
- Centralize Header presentation as part of Header redesign, resolving literal color overrides into semantic roles.
- Consolidate Explore, Mapping and Tutorial override stacks within isolated workspace passes with visual comparisons and state-specific tests.
- Consider a static class-usage inventory before any large deletion.

**Do *not* attempt as a precondition:**
- Remove all `!important` declarations globally.
- Delete repeated selectors because their names recur.
- Replace semantic theme/legacy adapter wholesale.
- Add `@layer` to the entire CSS architecture without targeted cascade tests.
- Convert all Tailwind utilities and inline React styles to static CSS.

## 6. Verification and regression protocol

The reported tests for S1–S8 were user visual acceptance checks; this S9 audit includes **no runtime/browser or Vite production build**. Before a future styling edit, inspect the exact file(s) to be changed **in full**, establish which version reflects current Git `HEAD`, and compare computed styles at matched viewport and theme settings. Include default/hover/focus/disabled controls, navigation page switching, active sample, Data mapping entry, Inspector open/closed, Explore filtering, Timeline/Map/Network, Tutorial overlays and Feedback modal as applicable. Pay particular attention to wide and narrow desktop widths; mobile support is not currently the project target.

A strong regression check additionally validates `npm.cmd run dev`, ideally `npm.cmd run build`, and `git diff --check`. Failure to run those locally must be reported, not silently treated as success.

## 7. Recommended checkpoint / next action

**S9 conclusion: architecture ready for an initial bounded visual pass.** S9 is documentation-only; no source files need replacing and there is nothing to test for visual changes. Checkpoint this audit as a planning document if desired. Then introduce the editorial palette through **existing semantic roles** (one visual change pass) before adjusting typography or Header. Audit which semantic roles drive visualization data encoding before enabling the palette globally; roll back or narrow roles if chart semantics change unexpectedly.

The S9 findings should remain a living reference for subsequent visual passes, rather than treating the remaining 8,392 CSS lines as a mandatory refactor backlog.
