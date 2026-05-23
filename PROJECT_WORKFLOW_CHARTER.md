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

Current clean baseline:

```text
See `CHANGELOG.md` for the most recent documented safe baseline.
```

Current branch note:

```text
The current active continuation branch may intentionally differ from experimental branches. As of the legacy-continuation handoff, MapLibre migrated-overlay work is set aside and should not be treated as the active source of truth unless explicitly resumed.
```

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
- Search & Filter active-dataset state, including keyword search, weight filters, date range filters, and future entity/metadata filters
- Analytics expanded overlay positioning
- Analytics dynamic variable detection
- Analytics SVG-to-PNG export rendering

---

## 4. Full-file review and replacement rule

Before writing any code edit or patch script, read and review the complete current affected file or files from the real source of truth.

When the user has confirmed local and GitHub are synced, use the current GitHub files as the source for full-file review unless the user explicitly states that local files have diverged.

For code changes, prefer full-file replacements by default, especially when working in dense or fragile files such as:

- `src/App.jsx`
- `src/LeftControlPanel.jsx`
- `src/timelinePlaybackComponents.jsx`
- inspector components
- map interaction components
- export components
- Analytics components

Do not rely on inferred snippets, broad regex patching, partial excerpts, or assumptions about code shape. Use the knowledge gained from reading the actual file to make grounded changes.

Small targeted replacement blocks are allowed only when all of the following are true:

- the full affected file has already been reviewed;
- the edit is genuinely local;
- the anchor text is unambiguous;
- repeated code patterns or prop names will not make the replacement brittle;
- the risk is lower than a full-file replacement.

If a patch fails, begins to loop, or requires repeated corrective scripts, stop immediately. Roll back to the last clean commit/checkpoint, restate the goal, and switch to a reviewed full-file replacement or a new implementation plan.

This project is grounded in real code and real data. Do not reconstruct likely code from memory, snippets, or expectations when the actual file can be read.

---

## 5. Checkpoint and commit distinction

A **checkpoint** is a tested intermediate state that may still be revised soon.

A **commit** is a coherent completed pass with one clear outcome.

Use commits for coherent completed passes. Use checkpoints when the user wants recoverability before additional risky work.

---

## 6. Delivery format rule

Use the safest delivery mode for the current pass.

Preferred modes:

- documentation-only pass: replacement `.txt` or `.md` file generated from the reviewed current document
- small local edit: targeted replacement block with clear anchors, only after full-file review
- medium bounded file area: full replacement file unless a targeted block is demonstrably safer
- fragile/high-risk file: full replacement from the current source of truth
- generated source replacement: provide a `.txt` file that the user can copy into place

When delivering files, include exact Windows PowerShell copy commands.

Do not use `git add .` while `itch_upload/` or other generated artifacts are untracked.

Use targeted adds or `git add -A src` only when a source-file rename/deletion is intentional.

---

## 7. Recovery protocol

When something goes wrong:

1. Stop further edits.
2. Identify the current source of truth.
3. Restore the last good checkpoint/commit.
4. Restate the goal in one sentence.
5. Make one bounded fix only, or switch delivery mode to full-file replacement after full-file review.
6. Rerun the acceptance test.

Do not stack speculative fixes on top of an unstable state.

Recent examples reinforced this rule:

- a responsive shared-panel sizing attempt was rolled back after it disrupted the normal landscape layout
- a semantic shared-panel prop rename was rolled back after it broke inspector auto-open behavior
- repeated Search & Filter patch-script failures showed that dense UI files should not be edited through brittle snippet assumptions
- the team returned to the last clean baseline before proceeding

---

## 8. Sync ritual

Run the sync ritual after actual commits or major checkpoints, not after discussion-only turns.

Canonical sync ritual:

```powershell
git status
git log --oneline -5
Get-ChildItem -Name
Get-ChildItem src -Name
```

After the user provides a clean sync showing local `HEAD`, `origin/main`, and `origin/HEAD` aligned, trust the synced Git state as the current source of truth. Do not repeatedly ask for uploaded files unless there is a specific reason to believe the file has drifted or the needed file content is not otherwise available.

---

## 9. Documentation policy

Do not update documentation after every small code commit. That slows development.

Instead, defer README / Maintainer Guide / Changelog updates until:

- a meaningful batch of changes has accumulated
- a milestone has been reached
- a fresh-chat handoff is needed
- the current conversation is becoming laggy or unreliable

When documentation is updated, preserve the full development history in `CHANGELOG.md`.

Documentation passes should default to adding new milestone/current-state information where reasonable. Subtract or rewrite existing documentation only when the text is clearly obsolete, duplicated by a more accurate retained entry, or actively misleading.

---

## 10. Dependency and tooling freeze

Do not change dependencies, package manager files, Vite config, Tailwind config, lint/format rules, filenames, or folder structure unless the pass is explicitly about tooling or architecture.

Generated artifacts such as `itch_upload/` should not be committed during ordinary source-development passes.

---

## 11. Modularization roadmap

Maintain a modularization roadmap for eventual `App.jsx` decomposition, but do not execute it casually.

Preferred order:

1. pure data helpers
2. export helpers
3. theme/constants
4. small reusable UI pieces
5. map interaction helpers
6. panel and inspector content components
7. app orchestration last

Stop structural cleanup once the file is stable unless there is a concrete bug, a planned architectural pass, or a specific maintenance pain point.

---

## 12. Decision records

For non-obvious implementation choices, record:

- what was chosen
- what alternative was rejected
- why

Current notable decisions:

- The map remains dynamic rather than fixed to a canonical live stage for now.
- Panel standardization focused on a shared side panel instead of freezing the whole viewport.
- The Inspector is now content inside the shared side panel, not a separate right-side shell.
- Cluster sizing now reflects represented letter volume.
- Cluster grouping is zoom-responsive.
- Cluster inspector members are grouped by place.
- MapLibre migrated-overlay work is paused; legacy D3/SVG Peridot is the active continuation path unless the user explicitly resumes MapLibre.
- Search & Filter is the long-term owner of global dataset filtering.
- Controls / View should govern display, not the active filtered dataset.
- Timeline should focus on chronological playback and consume the active date range.
- Analytics should chart the currently filtered dataset by default.

---

## 13. Project-specific cautions

### Shared side-panel compatibility path

The app still contains old compatibility naming around left/right panel visibility in some places. Although the names are misleading, that path currently preserves Inspector auto-open behavior.

Do **not** casually rename these props or setters.

If revisited, explicitly test:

- node click opens Inspector
- edge click opens Inspector
- cluster click opens Inspector
- contained cluster member opens detail
- Back behavior still works

### Responsive panel sizing

A prior attempt to make the shared side panel absolutely positioned at all viewport sizes was rolled back because it disrupted normal full-size landscape layout.

Future responsive panel work should be a narrow-window-specific override, not a universal positioning replacement.

### Dormant MapLibre work

The repository may contain dormant MapLibre preview files from `main`.

These should not be treated as active production code during legacy Peridot work. Do not remove, revive, or refactor MapLibre code unless the pass is explicitly about MapLibre.

If MapLibre work resumes, first establish the correct branch/source-of-truth and perform a fresh audit.

### Cluster behavior

Cluster behavior is now committed and functional.

Future cluster changes should preserve:

- cluster click opens Inspector
- cluster inspector lists contained members
- members are grouped by place
- member click opens detail
- Back returns to the cluster view
- cluster sizing remains visually meaningful

### Search & Filter behavior

Search & Filter is the intended consolidation point for global filters.

Committed or planned Search & Filter controls include:

- keyword search
- minimum correspondence weight
- date range
- future person/place/route filters
- future language/relationship filters
- future mappability and safe categorical metadata filters

Filter controls should not trigger expensive graph/data recomputation on every keystroke or draft edit. Prefer draft values with an explicit **Apply Filters** action when the filter can affect the active dataset.

When changing Search & Filter, explicitly test:

- typing in a text field does not freeze the app
- filters apply only when intended
- current applied filter scope is clear to the user
- Timeline playback remains functional
- Analytics receives the intended filtered scope
- Export scope remains clear

---

## 14. Standard delivery summary

Each implementation pass should end with:

- what changed
- exact files changed
- one acceptance test
- whether the result is a checkpoint or commit
- exact Git commands
- exact copy commands if files are being moved
- known residual risks

---

## 15. Fresh-chat handoff

For a new chat, start with:

```text
Source of truth folder: C:\Users\haley\OneDrive\Desktop\CorrespondenceVisualizer\
Current documented clean baseline: See `CHANGELOG.md` for the most recent documented safe baseline.
```

The new chat should be told:

- Peridot is the current app identity.
- The current fixed basemap is `countries50m`.
- The app uses a shared left-side panel with Controls and Inspector tabs.
- `LeftControlPanel.jsx` owns the shared side-panel shell.
- `InspectorPanel.jsx` is content-only.
- Cluster interaction, volume-based cluster sizing, and grouped cluster inspector behavior are committed features.
- The compatibility path for inspector auto-open is fragile; do not rename it casually.
- Documentation updates are batched, not performed after every small code commit.
- MapLibre migrated-overlay work is paused while legacy Peridot continuation proceeds.
- Before any code change, fully read/review the complete current affected GitHub file(s) when local and GitHub are synced.
- Use full-file replacements by default for code changes in affected files, especially dense or fragile files.
- Avoid brittle snippet-based patching unless the full file has been reviewed and the edit is clearly unambiguous.
