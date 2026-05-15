# MapLibre Work Paused — Legacy Peridot Continuation Note

## Current decision

Active development has returned to the legacy D3/SVG Peridot path on branch:

```text
legacy-peridot-continuation
```

The branch currently starts from:

```text
10051c0 — Add MapLibre selected filter layers
```

This is also the current `main` / `origin/main` state at the time of this note. Although this commit includes an early gated MapLibre preview prototype, the normal app URL uses the legacy D3/SVG production renderer.

## What remains dormant

The following files may remain in the repository because they exist on `main`:

```text
src/MapLibreMapStage.jsx
src/mapStyleConfig.js
```

They should be treated as dormant development-preview files unless the user explicitly resumes MapLibre work. Ordinary testing of legacy Peridot should use:

```text
http://localhost:5173/
```

Do not use the MapLibre preview flag for legacy testing:

```text
?maplibrePreview=1
```

## Set-aside experimental branch

The later branch:

```text
maplibre-native-geographic-view
```

explored a fuller MapLibre migrated overlay, including dynamic clusters, cluster labels, hidden cluster-member nodes, curved aggregated routes, aggregated route Inspector details, selected feedback, hover feedback, and People-view coordinate support. That work is intentionally set aside for now.

The branch should be preserved as an experiment, not deleted. It should not be treated as the active implementation baseline unless the user explicitly decides to resume MapLibre work.

## If MapLibre is resumed later

Start with a fresh audit rather than attempting a broad merge. In particular:

- identify the exact branch and commit to use as source of truth;
- read the live files before making edits;
- avoid broad full-file replacements for `src/App.jsx`;
- separate behavior changes from structural cleanup;
- treat Force-Directed fallback and MapLibre lifecycle behavior as fragile;
- document any decision to reactivate or abandon MapLibre explicitly.

## Why legacy continuation is preferred for now

The legacy Peridot app already provides the working research tool surface: People, Place, Force-Directed, inspector workflows, clusters, timeline, playback, themes, and export. Continuing from this path allows development to proceed without being blocked by the unresolved MapLibre Force-Directed fallback and structural fragility issues discovered during the experiment.
