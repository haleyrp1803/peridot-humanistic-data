# Peridot — Voluntary Support Integration Plan

**Date:** 2026-11-25 (America/New_York)  
**Revision:** 01  
**Status:** Design approved; implementation authorized in principle after a clean Inspector checkpoint; public funding activation deferred.  
**Intended location:** `planning_documents/PERIDOT_VOLUNTARY_SUPPORT_INTEGRATION_PLAN_20261125.md`

## Executive summary

Peridot will provide an understated, voluntary financial-support mechanism through its persistent global header. A muted sage-green **Support** button with a fine-line faceted gemstone opens a compact, nonmodal popover offering GitHub Sponsors and Ko-fi as equally weighted alternatives. Peridot remains free and open source; contributions confer no additional access, preferential treatment, or service obligations.

The feature will be implemented and tested after the concurrent Inspector development reaches a clean checkpoint. The complete interface will initially be available for local development preview only, with no live funding URLs or payment navigation. Production will remain unchanged until an explicitly authorized activation pass. This document preserves the approved design, proposed source architecture, implementation sequence, and acceptance criteria. It is a planning record, not evidence of implemented or deployed functionality.

## 1. Decision record and design rationale

| Decision | Context and rationale | Status |
|---|---|---|
| Offer GitHub Sponsors and Ko-fi | GitHub aligns with open-source maintenance; Ko-fi provides a lower-friction option for nontechnical humanities users. | Accepted |
| Use voluntary support, not pricing or paywalls | Peridot's scholarly and open-source identity should not depend on payment. | Accepted |
| Use Option C | The muted sage-green utility pill is recognizable without competing with research navigation. | Accepted |
| Use the faceted gemstone | A custom fine-line gem is project-specific and avoids generic fundraising imagery. | Accepted |
| Place immediately before Tutorials | Support belongs with secondary project utilities, not the research destinations. | Accepted |
| Use an anchored nonmodal popover | A small disclosure preserves research context and avoids a new route or intrusive dialog. | Accepted |
| Keep the full label wherever feasible | Use an icon-only fallback only when required to preserve existing navigation. | Accepted |
| Implement before funding activation | Allows local visual and functional acceptance without requiring payment accounts or exposing unfinished links publicly. | Accepted |
| Use hosted funding pages | No payment processing, credentials, third-party widgets, or supporter accounts inside Peridot. | Accepted direction |
| Add repository funding metadata | GitHub's native funding configuration can expose both destinations after activation. | Proposed for deferred activation |
| Additional About-page support section | Not necessary for this feature; may be considered separately. | Deferred |

Rejected alternatives include prominent primary-navigation fundraising, a dedicated support workspace, a modal or unsolicited prompt, repeated contribution reminders, branded embedded checkout widgets, and rewards or feature access contingent on payment. The maintenance consequence is that support must remain an optional, independently removable shell utility.

## 2. Approved visual and content specification

### Header

- Visible text: **Support**; accessible name: **Support Peridot**.
- Rounded pill, muted sage-green fill, restrained olive/sage border, dark forest-green foreground.
- Fine-line faceted gemstone to the left of the text; preserve the approved reference geometry rather than substituting a heart or coffee cup.
- Smaller visual weight than the main editorial navigation. Maintain the existing masthead height and whitespace.
- Position before Tutorials in the right-hand project-information group, without adding a route or active-navigation underline.
- Subtle hover/open treatments, visible keyboard focus, reduced-motion compatibility.
- Retain the label for as long as possible; only hide the visible text when space genuinely requires it. Preserve the accessible name and adequate hit area in icon-only mode.

### Popover

Use the approved November 25 interactive prototype and screenshot as the visual acceptance reference. Suggested repository reference filename: `planning_documents/PERIDOT_VOLUNTARY_SUPPORT_APPROVED_MOCKUP_20261125.png` (not yet established in the repository). Original supplied screenshot: `image(20261125-155155).png`; original small gemstone reference: `image(20261125-154607).png`.

The panel opens beneath the trigger, overlays existing content rather than pushing it down, and uses an ivory/light-parchment surface, fine muted border, modest rounding, restrained shadow, and existing Peridot typography. The header contains the same gem, title, and close control. Both provider rows use matching outline treatments, recognizable restrained icons, title/subtitle hierarchy, and external-link indicators when live. Neither is designated the preferred provider.

Approved copy:

> **Support Peridot**
>
> Peridot is free and open source. If you find it useful in your research, teaching, or exploration, you may choose to support its continued development.
>
> **GitHub Sponsors**  
> One-time or recurring sponsorship
>
> **Ko-fi**  
> Pay what you can · Guest-friendly
>
> *Financial support is entirely optional and does not affect access to Peridot.*

In local preview only, provider rows must be visibly and accessibly identified as inactive (e.g. disabled controls with a concise preview notice). Do not provide dummy hyperlinks or imply that payment can be made. Preserve the approved design as closely as possible; the exact preview-only cue is a proposed implementation detail to review during acceptance. Remove it upon live activation. The mockup colors are illustrative, not newly approved global design tokens.

## 3. Source authority and concurrent development

Planning evidence: `src(20261125-154831).zip` (244 archive entries), the five core Markdown uploads timestamped `20261125-154739`, the supplied November 25 Git status, and the approved design conversation/screenshots. The exact current local project is `C:\Users\haley\OneDrive\Desktop\Peridot\`, branch `main`.

The supplied core documents record historical synchronized checkpoint `9f63175` (November 22). The November 25 status instead reports an aligned local/remote branch with a dirty working tree; it does not identify the current HEAD hash. Concurrent Inspector changes include `App.jsx`, Inspector modules, Explore, Timeline, Charts, visualization orchestration, related helpers/tests, and two core documents. Do not overwrite, stage, restore, or reconcile those changes as part of Support development.

The supplied header JSX and CSS were inspected in full for this planning record; the relevant `App.jsx` regions were rechecked against the archive. This is not a full audit of all source modules or a runtime verification. The repository root, `.github/`, separate style guide, assets, and installed dependency environment were not supplied in that archive. No source or core documentation has been changed.

Before implementation:

1. Finish the independent Inspector milestone and obtain the user-confirmed clean sync ritual (Git status, recent log, root and source inventories).
2. Apply the Charter's source-authority and applied-file continuity rules. Inventory already available exact files and subsequent applied replacements; request only specific newer files that cannot be verified. Do not assume that a clean checkpoint alone proves raw-file equivalence.
3. Read each exact current affected file in full, plus relevant current contracts and style references. Recheck shell, Escape handling, and overlay layering after Inspector changes.
4. Establish the bounded pass type, permitted paths, exclusions, acceptance check, and delivery artifact. If an unexpected dependency requires expanding scope, stop that edit and obtain approval.

Planning outcome: **Proceed with planning. Implementation deferred until checkpoint and source preflight.** Live activation is a separate future authorization.

## 4. Source architecture and ownership

The November 25 source snapshot establishes the following:

- `src/PeridotGlobalHeader.jsx` is a dedicated persistent header with `PRIMARY_NAV_ITEMS` (Data, Visualize, Explore), `SECONDARY_NAV_ITEMS` (Tutorials, About), and `GlobalNavGroup`. Its route buttons use `activeSection`, `aria-current`, and existing routing callbacks.
- `src/PeridotGlobalHeader.css` is imported by the header component. Its secondary group uses `margin-left: auto`; the editorial header has a 66px minimum height/flex basis, while legacy styling has a 62px baseline. Header stacking level is 220. Existing editorial breakpoints are 951–1200px and at most 950px.
- `App.jsx` mounts `PeridotGlobalHeader` at lines 7309–7317 in this snapshot and supplies navigation callbacks and the active section. The shell has significant research-state and Inspector responsibilities.
- `src/styles/foundations/tokens.css` and semantic theme roles provide established presentation foundations. Reuse existing typography, radii, focus, shadow and motion conventions.

### Proposed file inventory

| Path | Action | Responsibility |
|---|---|---|
| `src/PeridotGlobalHeader.jsx` | Narrow modification | Mount Support beside secondary navigation, not inside navigation arrays. |
| `src/PeridotGlobalHeader.css` | Narrow modification | Right-hand grouping, spacing and responsive accommodation. |
| `src/PeridotSupportPopover.jsx` | New | Trigger, custom SVG gem, local disclosure state, focus/dismissal and provider presentation. |
| `src/PeridotSupportPopover.css` | New | Scoped component presentation (`peridot-support-` selectors). |
| `src/peridotSupportConfig.js` | New | Centralized provider URLs, availability and preview/live gating. |
| `src/peridotSupportConfig.test.mjs` | Proposed new | Focused configuration/availability tests using existing test conventions. |
| `.github/FUNDING.yml` | Deferred | Inspect existing file before creating/updating with verified destinations. |

Keep Support out of `PRIMARY_NAV_ITEMS` and `SECONDARY_NAV_ITEMS`. Introduce a right-hand wrapper for the support component and existing secondary navigation, moving the automatic left margin to that wrapper. Preserve the original group internals, route callbacks, active styling, wordmark action and header height. When support is not visible, retain the current layout; verify that any wrapper introduced does not alter baseline geometry.

The support component owns only local disclosure and presentation state. It may receive minimal navigation context (e.g. active section) or an explicit dismissal signal from the header to close on navigation; do not subscribe to research data or introduce application-level funding state. Same-section navigation should also dismiss where applicable. Render the gemstone as a small inline SVG using `currentColor`, hidden from assistive technology when accompanied by the accessible button name. No raster asset or icon dependency is required; document its human–AI design provenance. Use a separate reusable asset only if future reuse warrants it.

Avoid changes to `App.jsx` unless keyboard coordination proves necessary; avoid `peridotWorkspaceConfig.js`, `main.jsx`, `index.css`, global theme definitions, package/lock files, Inspector, mapping, Explore, chronology, visualization and export modules. No new directories or dependencies are proposed. Use existing theme tokens and scoped overrides; preserve legacy theme compatibility and reduced motion. Consult the current Editorial Interface Style Guide before finalizing styling if available.

## 5. Operational states and deferred activation

| State | Conditions | Visible behavior |
|---|---|---|
| Disabled | Production before activation; no valid enabled funding destinations | No Support button, no provider links, no external traffic. |
| Development preview | Explicit preview enabled and Vite development mode; URLs not required | Complete button/popover; both provider rows present but inactive and identified as preview-only. |
| Live | Explicit activation plus valid verified enabled URLs | Support button and available provider links; actual contribution navigation only after deliberate activation. |

Proposed configuration shape (illustrative, not implemented):

```js
export const PERIDOT_SUPPORT = {
  enabled: false,
  previewInDevelopment: true,
  githubSponsorsUrl: null,
  kofiUrl: null,
};
```

Use Vite's development-mode mechanism (e.g. `import.meta.env.DEV`) to prevent preview controls from leaking into a production build. Keep pure configuration resolution testable independently of the Vite runtime. Fail closed: an absent or invalid URL must never become a live clickable placeholder; if neither provider is available, hide the public control. A single valid provider may remain available if the other is disabled, but the intended initial live launch offers both. Use verified HTTPS provider profile URLs; no generic homepages, speculative usernames, secrets, payment credentials, or automatic URL fetching.

Local preview is not a public setting or a hidden public route. No production activation, `.github/FUNDING.yml` change, or account setup is required for the dormant implementation checkpoint. Future activation should need only verified configuration values, repository funding metadata, and appropriate verification, not another redesign.

## 6. Interaction and accessibility contract

| Action | Expected behavior |
|---|---|
| Activate Support | Toggle the anchored disclosure; no route transition or loading overlay. |
| Activate close control | Dismiss and restore focus appropriately to trigger. |
| Click outside | Dismiss without swallowing the user's intended workspace interaction or stealing focus. |
| Press Escape | Close Support first, without closing the Inspector or another underlying surface. Restore trigger focus where appropriate. |
| Tab / Shift+Tab | Natural document focus order, usable links when live, no focus trap. |
| Navigate | Dismiss without resetting the active dataset or workspace session. |
| Resize | Keep trigger and panel usable and inside viewport; preserve primary navigation. |
| Activate live provider link | Open in a new tab; preserve original Peridot session. |

Use a native `button` with `type="button"`, accessible name, `aria-expanded` and `aria-controls`; ordinary links inside a labelled nonmodal disclosure, not menu/menuitem semantics or a modal dialog. Ensure keyboard focus is visible and the icon is decorative. Use stable IDs, cleanup for event listeners, and predictable focus return; do not trap focus or introduce a backdrop. If a preview option is inactive, ensure it cannot trigger navigation with mouse or keyboard.

### Escape coordination — explicit fragile-zone preflight

In the November 25 snapshot, `App.jsx:5485–5506` registers `handleInspectorEscape` on `window` in the normal event phase. It closes the dossier/empty dossier or compact Inspector and does not check `event.defaultPrevented`. A naïve second listener could dismiss both Support and Inspector on a single Escape press.

First investigate component-contained handling that consumes Escape before the global Inspector listener (including when focus is outside the disclosure while it remains open). Verify against actual current listeners, focus paths and any blocking modal. Do not indiscriminately suppress Escape outside the relevant interaction or interfere with higher-priority dialogs. If a shell-level consumed-event guard or shared dismissal policy is required, it is an explicit scope expansion: review the latest complete `App.jsx`, obtain authorization, and isolate the change after Inspector checkpoint. Preserve existing Inspector Escape behavior when Support is closed. Test compact and full dossier independently.

### Overlay layering and responsive constraints

Start with a header-local positioned disclosure if clipping and stacking tests permit. A portal is a fallback only if necessary; it requires verified positioning, theme inheritance, focus, cleanup and layering. The existing header z-index is 220; other visualization and loading layers may be higher. A large child z-index cannot escape its parent's stacking context. Do not indiscriminately raise the whole header or change unrelated overlay z-indices. Support must appear above ordinary content, not supersede blocking dialogs or loading transitions. Verify collisions with map controls, export/settings menus, Inspector, mapping and loading surfaces. Any shared layer change requires separate scope approval.

Retain 66px editorial masthead baseline and existing legacy height. Test both existing responsive ranges, narrower supported widths, browser zoom, and actual viewport edges. First reduce support-specific spacing, then use icon-only fallback if necessary; do not arbitrarily choose a breakpoint without measuring. Keep existing primary navigation accessible and avoid introducing page-width overflow. A broad mobile-header redesign is out of scope. Constrain panel width and height to available viewport and allow internal scrolling when necessary.

## 7. Privacy, scholarly access and financial boundaries

- No funding-related access restrictions, rewards, exclusive features, priority support, or influence over research/development decisions.
- No unsolicited prompts, reminders, fundraising counters, or payment prompts during research or export.
- No embedded payment scripts, widgets, automatic prefetch or provider requests before intentional user navigation. No supporter tracking or identity collection in Peridot.
- No research data, active selections, query values or user-uploaded information passed to a funding platform.
- Live links use ordinary HTTPS anchors with `target="_blank" rel="noopener noreferrer"`. Preserve the original tab and existing research state; do not introduce funding-specific playback pausing. Browser background throttling remains normal browser behavior.
- No backend, payment API, authentication system, payment status callbacks, credentials or dependency additions.
- Public funding language must remain transparent about optional support and the recipient. Do not imply charitable tax deductibility without an established basis. Account eligibility, fees, payout/privacy settings, institutional restrictions and tax treatment are not resolved by this technical plan and should be checked before activation.

## 8. Bounded implementation sequence

Follow the Project Workflow Charter; each implementation pass has one change type. Pass-specific exact file scope and artifact membership must be re-established against current source before editing.

| Pass | Type | Scope | Acceptance and exclusions |
|---|---|---|---|
| 0 | Planning | Approved design, architecture and staged activation plan. | This record; no source changes. |
| 1 | Behavior | Configuration resolution, preview gate, new disclosure component and narrow header mount; minimal styling needed for functional testing. | Preview opens/closes; no live URLs; production hidden. No routing or research state changes. |
| 2 | Visual | Scoped support styles, gem, right-group layout, responsive label fallback, focus/hover presentation. | Matches approved prototype; existing header dimensions and navigation retained. No unrelated restyling. |
| 3 | Behavior | Accessibility, dismissal, Escape priority, overlay and navigation regression checks; configuration tests. | Support coexists with Inspector and all workspaces. Shared shell changes only if separately authorized. |
| 4 | Documentation | Record actual dormant implementation, ownership, decision rationale and verification in core docs at coherent milestone. | No claim of live funding; preserve Inspector documentation and authored disclosure. |
| Dormant checkpoint | — | Accepted implementation, independent commit(s), synchronized documentation. | Local preview usable, production unchanged, no live destinations. |
| 5 (deferred) | Behavior | Establish verified funding URLs and explicitly enable public support; inspect/update funding YAML; integrated build and deployment checks. | Both approved destinations correct, original session preserved. No redesign. |
| 6 (deferred) | Documentation | Record activation, verified links, commit and actual deployment evidence. | Distinguish local implementation, production build, deployment and acceptance. |

Use versioned ordinary replacement ZIP bundles for implementation passes, with inspected archive members and precise PowerShell 5.1 extraction/copy instructions. Include `npm.cmd run dev` after source installation. Do not use executable patch scripts by default, broad staging, or destructive resets. Build when new imports/production gating or other concrete build risks warrant it; minor subsequent styling passes can use focused browser checks. Do not request routine successful logs. Commit only intended paths, independently from Inspector work; sync after actual checkpoint. No commands to apply source changes are necessary for this planning file.

## 9. Verification matrix (pending)

| Area | Required checks |
|---|---|
| Configuration | Disabled production, development preview without URLs, live configuration with both/one/no valid destinations, missing or invalid URL fails closed. Preview controls cannot navigate. |
| Header | Home wordmark and all five navigation buttons; correct active underline; unchanged editorial/legacy header geometry when disabled; no overlap at existing breakpoints. |
| Appearance | Approved Option C and faceted gemstone; two equivalent provider rows; compact panel; legible type, focus and contrast; reduced motion. |
| Responsive | Full text retained wherever feasible; icon-only accessible name and hit area; no viewport clipping or horizontal overflow; browser zoom. |
| Disclosure | Toggle, close control, outside click without swallowing action, Escape, focus return, Tab/Shift+Tab, route changes, resize. |
| Inspector | Compact and full/empty dossier remain open on Support dismissal; existing Escape behavior works when Support closed; history and selection preserved. |
| Overlay | Map settings, export menu, chart controls, mapping surfaces, loading and blocking dialogs maintain appropriate priority. |
| Research continuity | No-data startup; sample/uploaded dataset; mapping draft; Map/Network viewports; Timeline/Charts configuration; chronology/playback; Explore draft/applied scope; Inspector selection/history. Opening/closing Support changes none of these. |
| Privacy | No automatic requests to funding providers; no data or query information attached to links; no third-party scripts or credentials. |
| Build | Relevant focused tests; production build verifies preview is hidden and imports resolve; local browser acceptance separately recorded. |
| Deferred live launch | Verify actual provider links and repository metadata, new-tab behavior, production build and deployed GitHub Pages behavior. Do not make a test payment without explicit permission. |

Use existing sample datasets where practical; do not invent new fixtures unless required for a concrete test. Record actual results and unresolved risks; a build is not browser acceptance, and a clean Git tree is not a deployment test.

## 10. Documentation ownership and handoff

This planning document preserves design rationale and intended architecture. It does not supersede the current core documents. At the dormant implementation checkpoint, use the latest complete documents and apply the Core Documentation Governance Protocol:

| Document | Intended update |
|---|---|
| `README.md` | Concise user-facing support information when live; do not describe a dormant preview as publicly available. Preserve the personally authored AI disclosure verbatim. |
| `MAINTAINERS_GUIDE.md` | Shell/navigation Level 1 reference, Level 2 support ownership/behavior/invariants and Level 3 module/configuration/regression references, with standardized fields as applicable. Explain preview vs live. |
| `PROJECT_WORKFLOW_CHARTER.md` | Non-obvious decision record on voluntary access, external payment boundary and staged activation, if appropriate; do not duplicate technical contract. |
| `CHANGELOG.md` | Actual implementation and later activation commits, scope, verification and limitations; distinguish accepted design, dormant implementation and public deployment. |
| `PERIDOT_CORE_DOCUMENTATION_GOVERNANCE_PROTOCOL.md` | No change anticipated. |

Cross-reference this plan and the approved screenshot after their actual repository paths have been verified. No core-document update is included in this planning delivery; preserve concurrent Inspector edits and reconcile only at the appropriate authorized checkpoint.

## 11. Outstanding matters and review limitations

- Next clean Inspector checkpoint and exact current source verification remain prerequisites for implementation.
- Final gemstone vector geometry, exact responsive threshold, preview-only inactive cue, overlay strategy and Escape coordination are implementation details subject to verification; the approved visual design is not reopened by default.
- Funding account setup, final profile URLs and actual payment terms are deliberately deferred. Existing `.github/FUNDING.yml` status is not verified.
- No production build, browser tests, deployment verification or payment testing has occurred for this feature. No source changes, Git operations or core documentation revisions have been made in this planning pass.

**Completion target for the next development series:** a fully accepted, independently maintainable Support control, locally previewable without funding accounts, dormant on the public site, and documented accurately. Activation is a later explicit decision.
