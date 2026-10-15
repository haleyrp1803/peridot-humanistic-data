# Peridot — Complete Styling Ownership Map and Migration Strategy

**Audit date:** 14 October 2026  
**Audit input:** `src(20261014-235531).zip` (exact uploaded source); clean Git checkpoint reported as `2024897` (`main`, HEAD/origin aligned).  
**Change type:** Structural audit / planning only. No application source has been changed.  
**Design direction:** Cartographic Editorial v0.2, real historical cartography and properly licensed stock accents.

## Executive conclusion

The current interface's appearance is produced by (1) the semantic JavaScript theme, (2) a legacy token adapter, (3) shared/global styles, (4) imported component stylesheets, and (5) JSX-local Tailwind/arbitrary values, inline styles and assets. A stylesheet-only overhaul cannot migrate the visual language. Conversely, a sweeping reorganization will risk established cascade order and functional overlay/scroll behavior. The recommended destination is **one token authority plus narrowly owned shared components, workspace compositions, visualization styling, and editorial/asset treatments**, migrated in bounded **structural** and **visual** passes rather than combined refactors.

## 1. Inventory and methodology

The uploaded `src/` archive was extracted and the full directory enumerated. All ten CSS files were mechanically scanned for lines, rule-selector occurrences, `!important`, token references and hardcoded hex literals. JSX/JS files were scanned for `className`, `style`, color-token, font and gradient occurrences. Key ownership boundaries were checked against `main.jsx`, current components and the refreshed Maintainer's Guide. These counts are **textual diagnostics, not an AST-based determination of dead CSS**. In particular, a selector appearing in two files is a candidate for review, not proof of a conflict; different specificity, media rules and pseudo-states may be intentional. Hex counts below exclude Tailwind color utilities and some SVG values.

### Stylesheet census

| Stylesheet | Lines | Selector occurrences (approx.) | `!important` | Current owner / migration target |
|---|---:|---:|---:|---|
| `PeridotSearchWorkspace.css` | 3,276 | 801 | 85 | Explore/Browse/Advanced Query/Refine; preserve search-specific scroll and overlay behavior; eventually split by region |
| `PeridotTutorial.css` | 1,662 | 263 | 20 | Guided tutorial overlay, spotlight, dock, animation; not the public Tutorials page |
| `index.css` | 1,126 | 337 | 32 | Tailwind/global/shared primitives, stage and animation rules; narrow to foundations + shared exceptions |
| `PeridotColumnMappingModal.css` | 860 | 173 | 128 | **Full-page mapping** despite legacy filename; separate mapping form/rail/shell and keep the workflow behavior |
| `PeridotLearnMoreWorkspace.css` | 375 | 65 | 0 | About reading pages and local navigation |
| `PeridotFeedbackForm.css` | 363 | 63 | 0 | Inline Feedback and backward-compatible modal styling |
| `AnalyticsPanel.css` | 238 | 69 | 22 | Chart configuration controls and reveal choreography; compare with `index.css` |
| `InspectorPanel.css` | 195 | 36 | 0 | Compact/full evidence dossier, overlay and linked-navigation chrome |
| `PeridotGlobalHeader.css` | 105 | 14 | 0 | Persistent site navigation (component-imported rather than in `main.jsx`) |
| `PeridotTransitionOverlay.css` | 58 | 7 | 0 | Heavy navigation/mapping transitions (component-imported) |
| **Total** | **8,258** | | **287** | |

### Active cascade / import ownership

`main.jsx` imports CSS in this order: `index.css` → `InspectorPanel.css` → `AnalyticsPanel.css` → `PeridotSearchWorkspace.css` → `PeridotColumnMappingModal.css` → `PeridotLearnMoreWorkspace.css` → `PeridotTutorial.css` → `PeridotFeedbackForm.css`. It then invokes `applyPeridotThemeVariables()` followed by `applyPeridotColorVariables()`. Component-imported CSS includes `PeridotGlobalHeader.css` from the global-header component and `PeridotTransitionOverlay.css` from the transition component; these must also be accounted for in the effective cascade. **Do not alter this order in the first implementation pass.** It is a functional contract. Note: `PeridotTutorial.css` is present in current `main.jsx` even where older documentation's illustrative list omitted it.

## 2. Color and theme ownership

| Layer | Existing source | Authority / problem | Target treatment |
|---|---|---|---|
| Palette candidates | `peridotTheme.js` / `PERIDOT_SOURCE_PALETTES` | Only built-in `legacyCurrent` currently shown; forest/gold palette | Add editorial palette as a carefully tested distinct palette, preserve fallback and user overrides |
| Semantic assignments | `peridotTheme.js` / `buildSemanticTheme` and emitted `--peridot-role-*` | Theme knows about UI/visualization meaning | Preserve as **canonical semantic color authority** |
| Metadata / custom themes | `peridotThemeRoleMetadata.js`, `PeridotThemeWorkspace.jsx` | Editable/custom role descriptions and imported themes; public route hidden | Update role documentation without breaking saved override shape |
| Compatibility raw tokens | `peridotColorPalette.js` / `--peridot-color-*` | Large generated legacy palette; old components reference literal source-hex token names | Keep adapter until consumers migrate; **do not rename/remove token identifiers wholesale** |
| CSS consumer styles | 10 CSS files | Mix of semantic roles, legacy names and hardcoded colors | Replace with role-based references where role correctly describes purpose |
| JSX utility consumers | especially Home, Visualize, Timeline, playback, header | Tailwind arbitrary color strings and component-local visual rules bypass shared styling | Migrate per workspace to shared semantic classes, retaining behavior/layout classes |
| Graph/chart encodings | `peridotTheme.js`, `analyticsChartComponents.jsx`, visualization components | Analytics series, map marks and selected state are data encodings | Distinct role contract; never blindly remap brand reds/greens to categorical data |

**Critical detail:** `peridotColorPalette.js` contains 465 source occurrences of `--peridot-color-` and numerous literals; these reflect definitions and uses inside an adapter, **not 465 separate CSS variables**. Component counts similarly report textual occurrences, not unique values.

## 3. JSX-local styling ownership (high-impact files)

| Source | Diagnostic evidence | Present ownership | Migration action |
|---|---|---|---|
| `PeridotHomeWorkspace.jsx` | 30 legacy color references; 7 gradient occurrences; 2 inline styles; embedded logo/filigree | Entire branded fixed-ratio Home composition and CTAs | First editorial case study; keep routing/CTA handlers; move display, button and background treatments into Home/editorial styles; review fixed ratio as an explicit design decision |
| `PeridotDataWorkspace.jsx` | 38 semantic role references, 9 legacy colors, 7 hardcoded hex literals | Data landing cards, sample chooser, upload affordances | Second case study; shared action/card styles but keep data-state conditions intact |
| `PeridotGlobalHeader.jsx` + CSS | 105 CSS lines; brand image; nav typography and active underline | Persistent header and navigation | Migrate into shared navigation contract without modifying routes/state |
| `PeridotVisualizationsWorkspace.jsx` | 217 legacy token references; 21 semantic roles; 123 `className` occurrences | Visualize tabs, stage shell, export, settings + playback positioning | Separate chrome from visualization marks; preserve stage geometry and state |
| `PeridotTimelineWorkspace.jsx` | 85 legacy refs; 46 semantic refs; 14 inline-style attributes | Timeline viewport, ticks, cards, categories, interaction marks | Distinguish semantic visualization encoding from chrome; no zoom/pan logic edits |
| `timelinePlaybackComponents.jsx` | 55 legacy references | Shared temporal scrubber / handle state | Treat as high-risk independent visual pass |
| `PeridotSearchWorkspace.jsx` + CSS | 2,441 JSX lines; 3,276 CSS lines; 85 `!important` declarations | Explore query, facets, results, scroll containment | Later staged migration by Browse / Query / Refine; no blanket selector replacement |
| `PeridotColumnMappingModal.jsx` + CSS | 3,489 JSX lines; 860 CSS lines; 128 `!important` | **Current full-page** data mapping, section rail, forms, footer | Separate mapping shell, controls and validation surfaces, preserve workflow |
| `InspectorPanel.jsx` + CSS | 124 role refs and 45 hardcoded hex literals in JSX; 195 CSS lines | Inspector chrome, dossier interactions | Distinguish severity/status colors from decorative palette; preserve layering |
| `AnalyticsPanel.jsx` + CSS | 83 semantic roles; 238 CSS lines | Chart controls, chart-builder styling | Shared forms/tabs plus chart-specific styles; preserve chart export |
| `PeridotThemeWorkspace.jsx` | 125 semantic role refs; 27 inline styles | Hidden-but-retained Themes/Accessibility | Migration compatibility / custom theme regression testing |
| `PeridotLearnMoreWorkspace.jsx` + CSS | 375 CSS lines | About editorial reading, imagery and feedback links | Natural early-to-middle editorial adoption after Home/Data |
| `PeridotTutorial.jsx` + CSS | 1,662 CSS lines | Guided overlay, spotlight/docking/animations | Dedicated late pass; do not conflate with public Tutorials route |

**Additional component families needing review:** `PeridotMappingFieldControls.jsx` (375 `className` occurrences), `PeridotExploreWorkspace.jsx`, `PeridotDatasetRequiredWorkspace.jsx`, `PeridotFeedbackForm.jsx`, `mapStageComponents.jsx`, `InspectorNodeView.jsx`, `InspectorClusterView.jsx`, `InspectorEdgeView.jsx`, `analyticsChartComponents.jsx`, and `PeridotHamburgerMenu.jsx` (compatibility navigation). The older universal upload prototype/harness should be classified as development/compatibility before any restyle or removal.

## 4. Repeated design concerns and risky overlap

- **Chart builder**: The selector families `.peridot-chart-builder-controls`, `.peridot-chart-builder-step`, and `.peridot-chart-builder-tab-button` appear in both `index.css` and `AnalyticsPanel.css`. Inspect each rule's chronology/media context, decide a single long-term owner, and preserve reveal/dropdown focus/z-index behavior.
- **Global form elements**: `input`, `select` and related generic descendants are used in global styles and workspace-specific CSS. Namespace shared form styles and retain intentional local modifications.
- **Search**: `PeridotSearchWorkspace.css` contains 801 approximate selector occurrences across 3,276 lines, with 85 important declarations. This is an ownership/specificity audit priority rather than a safe first rewrite.
- **Mapping**: 128 `!important` declarations in 860 lines indicate an elevated cascade risk. Do not strip flags mechanically; classify each by reason and overlapping selector.
- **Home**: A large part of visual identity is a Tailwind string within JSX; editing only `index.css` will leave the existing ornament/gradients in place.
- **Header**: Component-level CSS import and current source make global-header behavior partially independent of `main.jsx`'s listed imports.
- **Assets**: Current Home/header reference `../assets/Peridot Logo Gilded Transparent.png`, and Home/Data reference licensed Adobe filigree. New imagery must be controlled through tracked original assets, not image-generation outputs.
- **Motion and portals**: `index.css`, tutorial styles, Analytics styles, transition CSS and component-scoped layers contain entry animations, focus/portal stacking and reduced-motion rules. Keep existing accessibility and timing until a later deliberate pass.

## 5. Proposed long-term file ownership (not yet implemented)

```text
src/
  styles/
    foundations/
      tokens.css             # non-color foundations: typography, space, radius, elevation, motion
      typography.css         # font-face or authorized font imports, text roles
      global.css             # document reset/base and global shared defaults
    components/
      buttons.css            # primary / secondary / editorial / destructive
      forms.css              # input/select/checkbox and associated states
      navigation.css         # nav and tabs shared contracts
      panels.css             # reusable card/section/toolbar surfaces
      tables.css             # row, header, selected/hover data states
    editorial/
      collage.css            # layered paper/image treatments (noninteractive)
      cartography.css        # decorative rules, routes, engraving treatments
    workspaces/
      home.css
      data.css
      mapping.css
      visualize.css
      explore.css
      inspector.css
      about.css
      tutorials.css
```

**Keep JavaScript theme authority:** `peridotTheme.js`, `peridotThemeRoleMetadata.js` and (temporarily) `peridotColorPalette.js`; semantic color tokens should be emitted into CSS variables from one controlled path. Avoid adding a parallel hardcoded palette to `tokens.css`. `tokens.css` may define stable non-color values and semantic fallbacks if explicitly scoped, but must not overwrite user theme customizations. Existing CSS files need not all be renamed: structure represents ownership boundaries, not a mandated rename pass. No dependency, tooling, Vite or Tailwind configuration change is proposed.

## 6. Ownership rules to adopt

1. **Only foundations define design scales and semantic font assignments.** Workspace files consume them; avoid independent font stacks and arbitrary heading sizes unless editorial exception documented.
2. **Only semantic theme owns UI color roles.** Legacy adapter may translate them for old consumers until retirement.
3. **Shared components own component appearance; workspaces own composition.** Example: a Home card may size/place a shared primary button but cannot redefine its global hover language.
4. **Editorial artwork is a separate layer** from usable data surfaces. Decorative images are non-interactive, accessible as decoration when appropriate, and never carry required instructions.
5. **Visualization colors are analytical encodings**, never implicitly brand colors.
6. **Avoid new `!important`** without a documented reason; eliminate existing ones only when safe with selector/cascade tests.
7. **Keep motion/accessibility centralized**, preserving reduced-motion, keyboard/focus and overlay stacking.
8. **Maintain an asset manifest**: filename, source URL/collection, date, creator, rights/licence, attribution text, allowed use, placements, accessible description, and any required reproduction limits.

## 7. Bounded migration roadmap

| Pass | Change type | Scope | Deliverable and acceptance |
|---|---|---|---|
| S0 — audited baseline | Structural/documentation planning | This report, exact current source | No code modifications; file ownership identified |
| S1 — non-color foundations | Structural | Add foundation stylesheet for typography/spacing/radius/motion tokens; import without replacing visuals | Existing appearance and behavior remain equivalent in Home/Data/Visualize/Explore/About |
| S2 — theme-role specification | Structural | Map old semantic roles, define editorial roles and compatibility rules in JS theme + metadata | Theme selection/customization, chart-specific palette isolation still work |
| V1 — editorial palette | Visual | Change palette through semantic system with controlled legacy bridge | All workspaces load; no illegible panels, chart/map encoding integrity retained |
| S3 — shared UI contracts | Structural | Buttons, tabs, forms and panels; source-verified extracts and ownership | No layout or behavior regressions; reduced duplicated styling |
| V2 — persistent header | Visual | Header typography, surfaces, interaction states, brand asset treatment | Top-level routing/state persists, active/focus states readable |
| V3 — Home | Visual | Editorial typography/collage, real historical artwork, CTA composition | Sample/upload actions and no-dataset state retained |
| V4 — Data landing | Visual | 3 entry actions, sample chooser, templates/upload with consistent editorial framing | Sample Use/Edit/Download/Details and repeated switching functional |
| V5 — mapping shell | Visual | Full-page mapping controls, section rail, preview, footer | Direct section access; Review and Upload; Cancel/Back/Next; workbook mapping intact |
| V6 — Explore | Visual | Browse then Query then Refine | Explicit draft/Apply, results, facets and Inspector handoff unchanged |
| V7 — Visualize | Visual | Stage/nav/controls then individual Map/Network/Timeline/Charts | Pan/zoom, playback, Inspector, export and stage height unchanged |
| V8 — About/Tutorials/Inspector | Visual | Editorial text/imagery, dossiers and tutorial overlay (separate passes) | Reading/scroll, feedback, dossier history, guided flow correct |
| S4 — cleanup | Structural | Remove verified superseded selectors/legacy consumers in narrowly tested batches | Fewer overrides, no regressions, updated ownership documentation |

**Tonight's most valuable safe sequence:** finish S0; then S1 (small structural addition); then V1 or V2 after test approval; then V3 and V4 as standalone visual passes. Never mix a broad structural migration with a broad visual replacement in one pass. The mockups serve as visual targets, **not** source for altered behavior or invented interface controls.

## 8. Regression checkpoints

- **Navigation:** global logo/Home; Data/Visualize/Explore/Tutorials/About; active dataset and workspace state preserved.
- **Home/Data:** no implicit sample; upload and sample buttons; sample switching; existing mapping/edit actions.
- **Mapping:** full-page entry and Cancel; Preview, Sheets, Relations, Time, Places, Evidence, Review and Upload; direct local navigation; unique-ID joins; warnings and review.
- **Explore:** Browse, Advanced Query, Refine; draft/apply; result pages; scrolling; Inspector overlay return.
- **Visualize:** geographic/force/timeline/charts; viewport zoom/pan, timeline scrubber, category panel, stage height; export.
- **Inspector:** node/edge/cluster, compact/expanded, linked history and Back; overlay z-index.
- **Themes:** palette updates and saved user overrides; import targeting Whole app / Interface / Map and network / Charts; theme reset.
- **Accessibility:** contrast, keyboard focus, reduced motion, input usability and zoom at desktop targets.

## 9. Explicit implementation prerequisites

- The uploaded `src` is sufficient for **source-level styling ownership analysis**, but not for production asset integration or build testing. Obtain/inspect repository-root `package.json`, Tailwind/Vite configuration, and actual `assets/` only when the relevant implementation pass needs them.
- Before any file edit, read its **entire exact current source**; do not implement from search excerpts or reconstructed snapshots.
- For any visual pass, state exact files, explicit out-of-scope behaviors, one acceptance test and uniquely named replacement artifacts.
- Delivery: ZIP containing ordinary reviewed replacement files, verified archive paths, explicit PowerShell `Expand-Archive` and `Copy-Item` commands, then user-side `npm.cmd run dev`, checks and commit.
- The refreshed core documents are authoritative for architecture and workflow; this file is a planning document, not a substitute or an unsolicited core-documentation rewrite.

## 10. Decision requests before substantial visual work

1. Approve **source of design authority**: semantic JS theme for colors, foundation CSS for non-color scales, shared component owners, editorial workspace treatment.
2. Approve **display/body/UI font candidates and licensing**; do not distribute proprietary font files.
3. Select historical map/stock artwork after confirming permission and asset paths; generated mockup art remains reference only.
4. Approve Home composition's departure from its historical fixed-ratio title card, if required by final design.

**Audit status:** Source-level ownership map complete; declaration-level collision analysis and runtime visual regression remain follow-on checks. No production CSS/JS has been modified.
