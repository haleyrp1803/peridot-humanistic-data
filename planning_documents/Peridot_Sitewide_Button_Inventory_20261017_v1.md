# Peridot — Sitewide Button Ownership and Migration Audit

**Date:** 2026-10-17  
**Classification:** Source-level structural/visual audit, no source changes  
**Target decision:** Two standard *action-button appearances*: Primary (forest default, oxblood hover) and Secondary (light surface default, parchment hover), using existing semantic theme roles and `src/styles/components/buttons.css`. Flat fills, no gradients. Preserve action behavior, state semantics, accessibility, and positioning.

## Source and confidence

Inspected supplied `src(20261016-141912).zip`, the delivered Visualize styling replacements through the latest playback button and `Peridot_Shared_Primary_Button_Consolidation_20261017_Pass6.zip`, assembled into the working source tree for this audit. The user has verified newer changes locally at Git checkpoint `9e12305`, but this assembled tree is **not independently verified against their local working tree**. Confirm exact affected files before modifying any one of them. The count below is a **textual inventory** (not a browser-rendered element count or AST-based deduplication): 219 literal `<button>` occurrences in 31 JSX files of 42 scanned JSX files. Some belong to prototypes, hidden panels, or conditional states, and some are navigation, icon, mode, or timeline controls rather than normal action buttons.

## A. Core design contract

| Concern | Primary | Secondary |
|---|---|---|
| Default fill | `--peridot-role-button-primary-bg` (editorial forest) | `--peridot-role-button-secondary-bg` (light surface) |
| Hover fill | `--peridot-role-button-primary-hover-bg` (editorial oxblood) | `--peridot-role-button-secondary-hover-bg` (parchment) |
| Text/border | Semantic primary text/border roles | Semantic secondary text/border roles |
| Effects | No background gradients; standard accessible focus, disabled, active | Same |
| Local customization | Layout, size, shape, icon placement only | Layout, size, shape, icon placement only |

Keep color tokens in the existing theme authority, component appearances in `styles/components/buttons.css`, and positioning in existing workspace owners. Do **not** force the same background onto tabs, links, disclosure toggles, zoom controls, close buttons, draggable handles, or destructive warnings without classifying their roles. These can inherit the same semantic **colors** where suitable, but their selected/pressed/disabled/accessibility state must remain legible and functionally distinct.

## B. Action-button family inventory and migration recommendations

| Surface | Source/ownership | Current conflict (verified in inspected source) | Proposed appearance mapping | Risk |
|---|---|---|---|---|
| Shared `.peridot-button-primary` | `styles/components/buttons.css` | Pass 6 already removed gradient, but inherited decorative diamond `::before` and shared shadow/lift remain | **Primary**; remove decorative diamond and optionally reduce heavy shadow in a separate reviewed pass | Low–medium |
| Shared `.peridot-button-secondary` | same | Old legacy declaration and semantic override coexist; legacy secondary hover gold with shadow/lift | **Secondary**; replace hover with semantic secondary role, remove legacy gradient/gold dependency and diamond | Medium |
| Shared `.peridot-button-cream` | same | Third visual variant with old gold hover | Retire *appearance variant*; migrate call sites individually to **Secondary** or **Primary** by action priority | Medium |
| Home hero CTAs and gateway actions | `PeridotHomeWorkspace.jsx`, `styles/workspaces/home.css` | Local `pd-home-editorial__primary/secondary` and other Home-specific action styles | Primary for main entry action, Secondary for alternate; retain editorial sizes and hero geometry | Medium, protect composition |
| Data three entry actions | `PeridotDataWorkspace.jsx`, `styles/workspaces/data.css` | `.peridot-button-cream`, `peridot-data-entry-action`, `!bg`, `!text`, `!border`, and explicit gradient hover override shared button appearance | Choose **one Primary** emphasis and two **Secondary** or equal-priority treatment after design review; preserve exact labels, handlers, widths and sample-menu behavior | **High** (important overrides) |
| Data mapping-edit and sample chooser actions | `PeridotDataWorkspace.jsx` | Mix of shared styles, cream variant and custom menu-item presentation | Primary for commit/continue action; Secondary for cancel/clear/alternate; menu items retain menu interaction styling | Medium |
| Empty-dataset Explore and Visualize navigation | `PeridotDatasetRequiredWorkspace.jsx`, `PeridotExploreWorkspace.jsx` | Some already use shared primary/secondary; screenshots show other fallbacks with gold | Match semantic Primary and Secondary directly; inspect route-specific call sites | Low–medium |
| Explore Search / Query / Refine action buttons | `PeridotSearchWorkspace.jsx`, `PeridotSearchWorkspace.css` | Dedicated `peridot-search-button-primary/secondary/dark`; primary and dark have gold/forest gradients and overrides | Replace **action** variants with the shared pair; classify Apply/Run vs Reset/Clear/Cancel; keep filters, chips and mode tabs as stateful selectors | **High** (large cascade, many interactive modes) |
| Upload mapping footer/actions | `PeridotColumnMappingModal.jsx`, `PeridotColumnMappingModal.css`, `PeridotMappingFieldControls.jsx` | Local Tailwind/button colors, important overrides, gold gradients, many wizard state styles | Primary for Next/Review/Accept/Upload; Secondary for Back/Cancel/add/edit; separately style step rail as navigation | **High** (mapping correctness and wizard states) |
| Visualize controls and Export | `PeridotVisualizationsWorkspace.jsx`, `mapStageComponents.jsx`, `styles/components/panels.css`, `index.css` | Inline legacy token utilities for Apply/Reset, local Export, zoom/settings controls | Primary for affirmative Apply; Secondary for Reset/Export; icon zoom/settings can use shared colors with preserved compact geometry | Medium–high, overlays |
| Playback Play and Reset | `timelinePlaybackComponents.jsx`, `styles/components/panels.css` | Play already uses primary button roles; Reset retains local presentation | Play **Primary**, Reset **Secondary**; keep circle/toolbar geometry and all three temporal inputs untouched | Medium, playback interaction |
| Timeline view operations | `PeridotTimelineWorkspace.jsx`, existing workspace styles | Local zoom/category/orientation/Reset controls | Primary for affirmative actions only; Secondary for ordinary actions; segmented orientation/category toggles keep selection semantics | High, zoom/pan |
| Analytics / Charts | `AnalyticsPanel.jsx`, `AnalyticsPanel.css`, `analyticsChartComponents.jsx`, `index.css` | Mixed inline role colors, local chart-builder tabs and action controls; styling overlaps index.css | Shared action styles, preserve chart tabs/series and data color encodings | Medium–high |
| Inspector actions | `InspectorPanel.jsx`, `InspectorNodeView.jsx`, `InspectorClusterView.jsx`, `InspectorEdgeView.jsx`, `InspectorBackButton.jsx`, `InspectorPersonPlaces.jsx`, `InspectorTimelineEventView.jsx`, `InspectorConnectedCorrespondents.jsx` | Local inspector semantic vars and inline styles | Shared Primary/Secondary for affirmative/back actions; icon disclosure and dossier navigation remain distinct controls | Medium, overlays |
| Tutorial callouts/dialogs | `PeridotTutorial.jsx`, `PeridotTutorial.css`, `PeridotTutorialsWorkspace.jsx` | `.peridot-tutorial-button.is-primary/.is-secondary` use old gold gradients and dark-surface secondary | Migrate action buttons to shared two-variant colors, but maintain contrast over tutorial overlay and keyboard/spotlight behavior | **High** (overlay accessibility) |
| About / Feedback | `PeridotLearnMoreWorkspace.jsx`, `PeridotFeedbackForm.jsx`, respective CSS | Already use shared variants for some actions; text disclosure links are separate | Map submit/continue to Primary and cancel/alternate to Secondary; keep text disclosure as link-like action | Low–medium |
| Theme & accessibility workspace | `PeridotThemeWorkspace.jsx` | Mix of primary/secondary shared classes and palette-oriented local controls | Shared buttons for Save/Import/Reset; maintain semantic color previews and dangerous reset confirmation | Medium |
| Legacy/prototype components | `PeridotUniversalUploadPrototype.jsx`, `PeridotUniversalUploadTestHarness.jsx`, `PeridotHamburgerMenu.jsx` | Additional nonproduction/prototype buttons | Determine live reachability before edits; don't migrate or delete blindly | Unknown |

## C. Nonstandard control categories (not third/fourth button themes)

- **Navigation:** global header links, Map/Network/Timeline/Charts tabs, mapping and Explore step tabs. These convey *which view is active*, requiring `aria-current`, pressed/selected styles, and keyboard focus. Their visual tokens should be consistent, but not filled primary buttons.
- **Icon/disclosure utilities:** legend collapse, zoom, map settings, Inspector close, expand/minimize, menus. May use secondary surfaces and shared focus treatment while retaining shape, hit target and accessibility labels.
- **Segmented/toggle choices:** timeline orientation, event mode, chart builder tabs, facet chips and multi-select categories. Need explicit selected state in addition to hover; cannot safely be reduced to a plain primary/secondary class without complementary selection semantics.
- **Destructive/irreversible actions:** map to Primary/Secondary layout where sensible but retain a separate *semantic warning/confirmation treatment* as necessary (not an alternative brand style).
- **Data encoding markers and draggable controls:** network node colors, graph edges, temporal clamps/scrubber, and chart series are **not action buttons** and are not part of this migration.

## D. CSS ownership and key conflicts

1. **`styles/components/buttons.css`** should become the sole shared owner of `.peridot-button-primary` and `.peridot-button-secondary` appearance and interaction feedback. Its cream variant needs consumer migration before removal. Diamond pseudo-elements are shared here and should be explicitly removed if the simplified visual target stands.
2. **`PeridotDataWorkspace.jsx`** forces button colors with Tailwind `!` utilities and an explicit hover gradient, defeating the shared contract. **`styles/workspaces/data.css`** supplies aliases for those colors; remove only once consumers migrate.
3. **`PeridotSearchWorkspace.css`** defines independent gold-gradient primary/dark controls and gold-selected step navigation. Separate action styling from selection styling.
4. **`PeridotColumnMappingModal.css`** contains mapping-specific gold gradients and `!important` overrides, some legitimately protecting layout. Update footer action appearances without altering wizard navigation geometry.
5. **`PeridotTutorial.css`** has independent `.is-primary` and `.is-secondary` schemes for actions displayed over a dark overlay; contrast and focus need tests.
6. **`PeridotVisualizationsWorkspace.jsx`, `AnalyticsPanel.jsx`, `timelinePlaybackComponents.jsx`** still include arbitrary-value utility styling that competes with shared colors. Migrate *static appearances* only, not computed interaction geometry or chart marks.
7. **`index.css`, `styles/components/panels.css`, and local component CSS** still contain older overrides. Do not add an application-wide `button { ... }` rule or blanket `!important`; reconcile owner-specific selectors in source order.

## E. Migration order and acceptance

**S-B1 — Shared design contract (visual):** Finish Primary and Secondary in `buttons.css`, remove gradients and decorative diamond only for the shared classes, specify normal/hover/pressed/focus/disabled with semantic roles. Search call sites of `.peridot-button-cream` before retiring. Test the no-dataset and feedback paths.

**S-B2 — Page entry actions (visual):** Home, Data, and no-dataset fallbacks. These are the high-visibility inconsistencies in user screenshots. Preserve position, text, click behavior, and exact sample/upload choices.

**S-B3 — Functional workspaces (visual, bounded):** Explore, Mapping, Visualize/Timeline, Charts, and Inspector, grouped into manageable owner-specific replacements. Leave nav tabs, chips, radio/segmented controls, and icon-only utilities functionally intact even when harmonizing colors.

**S-B4 — Overlays and audit (visual/verification):** Tutorial, About, Feedback, theme controls; check hidden/disabled/hover/focus states at 1536px and wider desktop widths, keyboard tabbing, reduced motion, browser zoom, overlay stacking and theme overrides. Finally remove **only verified dead** rules and deprecated variants in a separate structural cleanup pass.

### Regression checks

- Nav routing, Home sample/upload and Data three entry paths; sample menu; no-dataset fallbacks.
- Mapping Cancel/Back/Next and Review/Accept, errors, disabled states, step selection.
- Explore Run/Apply, Clear/Reset, Browse/Refine, query chips and step tabs.
- Visualize tabs/Export, Map/Network overlays, zoom/pan, Timeline controls, Charts builder.
- Playback Play/Pause/Reset, temporal clamps, scrubber and all range-input geometry.
- Inspector Back/Close/selection, Tutorial spotlight/docking, Feedback submission.
- Theme customization, alternate palettes, contrast and `:focus-visible` states.
- `npm.cmd run dev`, `npm.cmd run build`, and `git diff --check` after each edit pass.

**Status:** Audit complete at source level; no edits made. Final migration assignments for competing peer-level entry actions (e.g., Data's three choices) should be approved before implementation. The user-approved restriction is *two shared visual families*, not a requirement to change action semantics.
