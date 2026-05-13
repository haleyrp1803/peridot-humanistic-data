# Project Workflow Charter

## Purpose

This document defines how changes should be made to the Peridot correspondence visualizer app. Its purpose is to reduce risk, prevent version drift, keep source-of-truth discipline, and make changes easier to review and maintain.

This charter should be consulted before every implementation pass.

---

## 1. Source-of-truth rule

At the start of any pass, establish one authoritative source of truth.

During active editing, the source of truth must be exactly one of the following:

- one specific local project folder
- one specific pasted/exported file
- one recently synced Git commit when the user has confirmed local and GitHub alignment through the sync ritual

GitHub, canvas copies, temporary zips, downloaded replacements, and other artifacts may be references, but they must not be treated as co-equal authoritative sources during the same pass unless that divergence is explicitly acknowledged.

Current project source of truth folder:

```text
C:\Users\haley\OneDrive\Desktop\CorrespondenceVisualizer\
```

For the current documented safe baseline, consult `CHANGELOG.md`. The current MapLibre-native development branch at this handoff is:

```text
maplibre-native-geographic-view
4c9ed6f — Extract MapLibre layer configuration
```

Rollback landmarks are recorded in `CHANGELOG.md` and `MAINTAINERS_GUIDE.md`.

---

## 2. Bounded-pass rule

Before each coding pass, state:

- change type: exactly one of **behavior**, **visual**, **structural**, or **documentation**
- goal
- in-scope files/regions
- out-of-scope files/regions
- one plain-language acceptance test
- expected artifact: pasted diff, full file, `.txt` replacement, zip, or commit-ready instructions

Do not mix functional changes, visual redesign, broad refactors, and documentation updates in a single implementation pass unless the user explicitly chooses that scope.

---

## 3. Fragile-zones preflight

Before touching a fragile zone, state:

- affected fragile zone
- what might break
- what is intentionally not being touched
- how the result will be verified afterward

Current fragile zones include:

- map viewport centering/reset behavior
- dense-map hover/click interaction
- selection persistence across filters
- playback/timeline state coupling
- export rendering/state coupling
- broad orchestration work inside `src/App.jsx`
- shared side-panel shell behavior
- inspector-open interactions after map clicks
- cluster grouping and cluster inspector navigation
- MapLibre source/layer lifecycle
- MapLibre cluster source/layer setup
- MapLibre zoom/move state that could trigger map reconstruction/reset

---

## 4. Checkpoint and commit distinction

A **checkpoint** is a tested intermediate state that may still be revised soon.

A **commit** is a coherent completed pass with one clear outcome.

Use commits for coherent completed passes. Use checkpoints when the user wants recoverability before additional risky work.

---

## 5. Delivery format rule

Use the safest delivery mode for the current pass.

Preferred modes:

- small local edit: targeted replacement block with clear anchors
- medium bounded file area: replacement block or full replacement file
- fragile/high-risk file: full replacement from the current source of truth
- generated source replacement: provide a `.txt` file that the user can copy into place

When delivering files, include exact Windows PowerShell copy commands.

Do not use `git add .` while `itch_upload/` or other generated artifacts are untracked. Use targeted adds or `git add -A src` only when a source-file rename/deletion is intentional.

### Special delivery mode for `src/MapLibreMapStage.jsx`

When GitHub/local alignment has been confirmed by the sync ritual and the change is confined to `src/MapLibreMapStage.jsx`, default to the following protocol:

1. Read the exact current committed file from GitHub.
2. Treat that file as the source of truth.
3. Generate a complete replacement file from that exact source.
4. Make only the planned bounded changes.
5. Provide `.txt` and `.jsx` versions.
6. The user copies the `.txt` into place.
7. Build/test.
8. Commit if accepted.

This protocol was adopted after patch scripts repeatedly failed on `MapLibreMapStage.jsx` anchors, while a full replacement generated from the exact current file succeeded for `10051c0`.

Patch scripts remain appropriate for `App.jsx` or other large/high-risk files when a full replacement would be riskier.

---

## 6. Recovery protocol

When something goes wrong:

1. Stop further edits.
2. Identify the current source of truth.
3. Restore the last good checkpoint/commit.
4. Restate the goal in one sentence.
5. Make one bounded fix only.
6. Rerun the acceptance test.

Do not stack speculative fixes on top of an unstable state.

Recent examples reinforced this rule:

- a responsive shared-panel sizing attempt was rolled back after it disrupted the normal landscape layout
- a semantic shared-panel prop rename was rolled back after it broke inspector auto-open behavior
- a selected-feedback attempt that used `App.jsx` selected props was restored after it caused MapLibre map flash/reset
- several MapLibre cluster attempts were restored after cluster source/layer setup failed or zoom/pan caused map reset behavior

---

## 7. Sync ritual

Run the sync ritual after actual commits or major checkpoints, not after discussion-only turns.

Canonical sync ritual:

```powershell
git status
git log --oneline -5
Get-ChildItem -Name
Get-ChildItem src -Name
```

After the user provides a clean sync showing local `HEAD`, `origin/main`, and `origin/HEAD` aligned, trust the synced Git state as the current source of truth. On feature branches, use the same principle for `HEAD` and the corresponding `origin/<branch>`.

---

## 8. Documentation policy

Do not update documentation after every small code commit. That slows development.

Instead, defer README / Maintainer Guide / Changelog updates until:

- a meaningful batch of changes has accumulated
- a milestone has been reached
- a fresh-chat handoff is needed
- the current conversation is becoming laggy or unreliable

When documentation is updated, preserve the full development history in `CHANGELOG.md`.

Default to additive documentation updates. Do not delete or overwrite historical information unless it is clearly obsolete, duplicated by a more accurate retained entry, or actively misleading.

---

## 9. Dependency and tooling freeze

Do not change dependencies, package manager files, Vite config, Tailwind config, lint/format rules, filenames, or folder structure unless the pass is explicitly about tooling or architecture.

Generated artifacts such as `itch_upload/` should not be committed during ordinary source-development passes.

---

## 10. Modularization roadmap

Maintain a modularization roadmap for eventual `App.jsx` decomposition, but do not execute it casually.

Preferred order:

1. pure data helpers
2. export helpers
3. theme/constants
4. small reusable UI pieces
5. map interaction helpers
6. panel and inspector content components
7. app orchestration last

For the MapLibre-native subsystem, the preferred current order is:

1. preserve working preview behavior
2. extract pure MapLibre feature builders
3. extract MapLibre layer/source configuration
4. instrument map lifecycle/source setup before cluster work
5. add cluster rendering only after source/layer lifecycle is proven
6. only then add cluster click routing, node hiding, and route behavior decisions

Stop structural cleanup once the file is stable unless there is a concrete bug, a planned architectural pass, or a specific maintenance pain point.

---

## 11. Decision records

For non-obvious implementation choices, record:

- what was chosen
- what alternative was rejected
- why

Current notable decisions:

- The production map remains dynamic rather than fixed to a canonical live stage for now.
- Panel standardization focused on a shared side panel instead of freezing the whole viewport.
- The Inspector is now content inside the shared side panel, not a separate right-side shell.
- Cluster sizing now reflects represented letter volume in the production D3/SVG path.
- Cluster grouping is zoom-responsive in the production D3/SVG path.
- Cluster inspector members are grouped by place.
- MapLibre migration has pivoted from incremental adaptation to a MapLibre-native geographic subsystem plan.
- The MapLibre preview prototype is preserved at `10051c0` and tagged as `checkpoint-maplibre-preview-prototype`.
- The pre-MapLibre rollback point is `4e08720`.

---

## 12. Project-specific cautions

### Shared side-panel compatibility path

The app still contains old compatibility naming around left/right panel visibility in some places. Although the names are misleading, that path currently preserves Inspector auto-open behavior.

Do **not** casually rename these props or setters. If revisited, explicitly test:

- node click opens Inspector
- edge click opens Inspector
- cluster click opens Inspector
- contained cluster member opens detail
- Back behavior still works

### Responsive panel sizing

A prior attempt to make the shared side panel absolutely positioned at all viewport sizes was rolled back because it disrupted normal full-size landscape layout.

Future responsive panel work should be a narrow-window-specific override, not a universal positioning replacement.

### Cluster behavior

Production D3/SVG cluster behavior is committed and functional. Future production cluster changes should preserve:

- cluster click opens Inspector
- cluster inspector lists contained members
- members are grouped by place
- member click opens detail
- Back returns to the cluster view
- cluster sizing remains visually meaningful

### MapLibre cluster work

MapLibre cluster work is not yet solved. Future work should not begin with node hiding, route rerouting, or zoom-responsive cluster behavior. Start with lifecycle/source setup instrumentation inside `MapLibreMapStage.jsx` and prove that the MapLibre map receives a cluster source/layer before adding cluster behavior.

---

## 13. Standard delivery summary

Each implementation pass should end with:

- what changed
- exact files changed
- one acceptance test
- whether the result is a checkpoint or commit
- exact Git commands
- exact copy commands if files are being moved
- known residual risks

---

## 14. Fresh-chat handoff

For a new chat, start with:

```text
Source of truth folder:
C:\Users\haley\OneDrive\Desktop\CorrespondenceVisualizer\

Active branch:
maplibre-native-geographic-view

Current branch baseline:
4c9ed6f — Extract MapLibre layer configuration

Main / MapLibre preview checkpoint:
10051c0 — Add MapLibre selected filter layers
Tag: checkpoint-maplibre-preview-prototype

Pre-MapLibre clean rollback point:
4e08720 — Direct workflow charter baseline reference to changelog
```

The new chat should be told:

- Peridot is the current app identity.
- The current fixed production basemap is `countries50m`.
- The app uses a shared left-side panel with a persistent icon rail.
- `LeftControlPanel.jsx` owns the shared side-panel shell.
- `InspectorPanel.jsx` is content-only.
- Cluster interaction, volume-based cluster sizing, and grouped cluster inspector behavior are committed in the production D3/SVG path.
- The MapLibre-native branch currently has extracted feature builders and layer configuration.
- `MapLibreMapStage.jsx` has a special full-file replacement delivery protocol.
- MapLibre cluster source/layer setup is unresolved and should be handled through lifecycle instrumentation before new rendering attempts.
- Documentation updates are batched and additive by default.
