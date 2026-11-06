# Peridot Charts II — Implementation Plan

**Date:** 2026-11-05  
**Status:** Planning document; no implementation authorized  
**Project:** Peridot — Charts II  
**Approach:** Build Charts II alongside Charts I; validate, promote, and retire Charts I in separate bounded passes.

## Project objective

Build Charts II as a parallel replacement for Charts I, following the broad strategy used for Timeline II. The aim is not only to add chart types, but to create a chart-building system that is easier for researchers to use, works with Peridot's generalized data architecture, and produces readable, analytically reliable visualizations.

The design should guide researchers without restricting them: Peridot may recommend charts based on the active dataset and its mapping, but **every chart remains selectable** regardless of its suitability assessment.

## 1. Established design direction

| Element | Direction |
|---|---|
| Architecture | New Charts II implementation alongside Charts I |
| Catalogue | Option B: recommendations-first |
| Visual design | Preserve the approved catalogue mockup's editorial aesthetic |
| Dataset requirements | Active dataset required, following current Peridot behavior |
| Availability | Every chart remains selectable regardless of suitability |
| Recommendations | Based on mapped data and a transparent suitability system |
| Suitability labels | **Likely fit** and **May not work well** only; intermediate cases unflagged |
| Organization | Recommendations, analytical question/type, and alphabetical browsing |
| Discovery | Searchable catalogue with visual chart previews |
| Chart construction | Chart-specific controls, not a complicated question-answering workflow |
| Retirement | Remove Charts I only after Charts II is validated and accepted |

### Conceptual system architecture

1. **Existing Peridot data architecture:** mapped variables, dataset records, Explore filters, and Timeline/playback.
2. **Charts II data profile:** detects usable categorical, numerical, temporal, and relational fields.
3. **Charts II catalogue:** recommendations for the dataset, the complete chart collection, search, organization modes, and suitability indicators.
4. **Chart-specific builder:** field assignments, aggregation, grouping, series, scope, and appearance.
5. **Chart visualization:** interactive chart, clear values and computational explanation, and export.

The recommendation system, chart builder, and rendering system should remain separate architectural concerns.

---

## Phase 1 — Finalize the Charts II design contract

**Change type:** Design only; no source changes.

### 1A. Finalize the catalogue

Use the approved Option B visual direction:

- Header and active-dataset information.
- Prominent **Recommended for your data** section.
- Complete chart catalogue beneath it.
- Search and organization controls.
- Illustrated chart cards.
- Suitability indicators and explanations.

Every chart remains available in the full catalogue. Decide whether recommendation cards also appear in the main catalogue; the proposed preference is to retain a genuinely complete catalogue for alphabetical browsing.

### 1B. Finalize the chart inventory

The provisional inventory is organized by analytical purpose:

| Analytical purpose | Chart families |
|---|---|
| Change over time | Line / Multi-Line; Area; Stacked Area |
| Compare values | Bar / Column; Grouped Bar; Dot Plot; Slope Chart |
| Parts of a whole | Stacked Bar / 100% Stacked Bar; Pie / Donut; Treemap; Sunburst |
| Distribution | Histogram; Box Plot |
| Relationships and patterns | Scatter / Bubble; Heatmap |

This table contains **15 chart families**. An earlier proposal referred approximately to 16; whether variations such as Bubble receive separate catalogue entries is still to be decided. Do not treat the earlier approximate count as a fixed requirement.

For each chart, specify its analytical purpose, required fields, supported aggregations, special controls, and expected behavior when mapped fields appear insufficient.

### 1C. Finalize the builder layout

Design the chart-building experience after selecting a card: allocation of space between preview, field controls, series selection, analytical settings, and presentation options.

**Deliverable:** Written Charts II design specification and approved mockups for catalogue and builder.

**Acceptance:** Researcher flow from chart selection through export is described without unresolved architectural assumptions.

---

## Phase 2 — Build the data and suitability architecture

**Change type:** Structural implementation.

### 2A. Establish a generalized dataset profile

Identify properties relevant to chart selection and construction:

| Property | Examples |
|---|---|
| Temporal | Date fields, chronological coverage, repeated observations |
| Numerical | Measures, usable numeric values, missing values |
| Categorical | Grouping fields, distinct values, category counts |
| Structural | Multiple measures, hierarchy, wide versus long data |
| Data quality | Missing data, inconsistent values, ambiguous interpretations |

Respect researcher-supplied mapping. Do not infer semantics solely from familiar field names. Where appropriate, allow chart-specific corrections or overrides without silently modifying canonical data.

### 2B. Implement chart suitability criteria

Define explicit, explainable suitability signals per chart family:

| Chart | Strong suitability signals |
|---|---|
| Multi-Line | Temporal axis plus multiple numerical measures or identifiable series |
| Scatter | Two usable numerical variables |
| Box Plot | Numerical observations suitable for comparing distributions |
| Heatmap | Two categorical dimensions and an aggregatable measure |
| Treemap | Categorical/hierarchical grouping with meaningful nonnegative values |
| Sunburst | Hierarchical categories with meaningful additive values |

The system should provide an internal ranking score, a researcher-facing explanation, **Likely fit** where justified, **May not work well** where significant requirements appear absent, and no label for intermediate cases. Low suitability must never disable chart selection.

Distinguish uncertain mapping from an intrinsically unsuitable chart.

### 2C. Define a unified chart specification

A single specification should represent:

- Chart family and variation.
- X/Y variables and categorical dimensions.
- Metric and aggregation (count, sum, mean, minimum, maximum, as applicable).
- Grouping and comparison series.
- Data scope, filters, and time bounds.
- Ordering, normalization, and category treatment.
- Titles, labels, legends, notes, and other presentation controls.

**Deliverable:** Tested data profiling, chart metadata, suitability ranking, and chart specification modules.

**Acceptance:** Peridot can explain its dataset-aware recommendations without hiding chart types or altering the researcher's data.

---

## Phase 3 — Implement the catalogue interface

**Change type:** Visual implementation, integrated with the real data profile.

Implement the approved Option B design using reusable components:

- Catalogue header and active-dataset summary.
- Recommended-for-your-data section.
- Search and organization controls.
- Full chart gallery.
- Illustrated chart cards.
- Suitability explanation mechanism.

Use simple static SVG previews initially rather than computing live previews for every catalogue card.

| Organization mode | Behavior |
|---|---|
| By question | Group charts by analytical purpose |
| A–Z | Alphabetize the full catalogue |
| Best matches first | Rank charts by dataset suitability |

Preserve the researcher's organization choice during the session.

**Deliverable:** Functioning catalogue connected to the active dataset profile.

**Acceptance:** Recommendations respond appropriately to different mapped datasets, and every chart remains selectable.

---

## Phase 4 — Implement the chart builder

**Change type:** Behavioral implementation.

Use chart-specific configuration controls rather than one universal form exposing every available setting. A Multi-Line chart, for example, might request:

- Horizontal axis: Month.
- Measure: Average stock price.
- Comparison series: Company A, Company B, Company C.

The chart should update as meaningful settings change and preserve valid selections when the chart type changes. Aggregation should be expressed in accessible, precise language (for example, **Average stock price per month**, not merely **Mean**).

Preserve or improve:

- Record counts alongside numeric measures.
- Year and full-date handling.
- Selected categories and explicit **Other** handling.
- Explore/Search scope and shared chronology.
- Treatment of genuinely undated records.
- Multiple numeric columns and grouped series.
- Data-driven colors and series selection.

**Deliverable:** Builder generating a valid unified chart specification and live chart preview.

**Acceptance:** Researchers can build and revise a chart without restarting or traversing a complicated wizard.

---

## Phase 5 — Implement and refine chart rendering

**Change type:** Behavioral work followed by bounded visual refinement.

First establish common rendering infrastructure: axes, numeric and date scales, labels, tooltips, legends, responsive plotting regions, category/series colors, summaries, and export.

Implement chart types in bounded waves:

| Wave | Chart families | Rationale |
|---|---|---|
| 1 | Bar; Grouped Bar; Line; Multi-Line | Establish categorical and temporal rendering |
| 2 | Stacked Bar; Pie/Donut; Area; Stacked Area | Add additive and proportional representations |
| 3 | Histogram; Dot Plot; Scatter/Bubble; Box Plot | Extend numerical and statistical comparisons |
| 4 | Heatmap; Treemap; Sunburst; Slope Chart | Complete matrix, hierarchy, and specialized comparisons |

The waves describe implementation dependencies, not user-facing importance.

### Presentation requirements

- Avoid allocating a permanent fixed quarter of chart width to summaries.
- Keep category, time, and numerical labels readable where practical.
- Give legends enough space without overwhelming the graph.
- Distinguish missing observations from zero values.
- Expose the fields, calculations, and aggregations underlying a chart.
- Preserve accurate titles, legends, values, and explanatory notes in exports.
- Keep chart-specific geometry modular to avoid unrelated regressions.

**Deliverable:** The complete agreed chart catalogue supported by Charts II rendering.

**Acceptance:** Every chart type renders representative data accurately, legibly, and consistently.

---

## Phase 6 — Regression testing and researcher acceptance

**Change type:** Validation; fixes undertaken in independently bounded passes.

### Required test datasets

| Dataset | Primary test |
|---|---|
| Correspondence sample | Categories, people, dates, record counts |
| Family Tree sample | Generalized categories and hierarchy |
| Cardinals sample | Larger temporal and categorical data |
| Multi-company stock prices | Wide/transposed numerical data, time series, aggregation |
| Sparse/incomplete mapping | Suitability uncertainty, manual field assignment |
| Missing numeric/date values | Missing-data semantics and correctness |

The stock-price case should verify multiple company series, average monthly values, ordered dates, series selection, and transparent aggregation.

### Integration regression areas

- Applied Explore filters.
- Timeline/playback scope.
- Undated-record inclusion/exclusion.
- Navigation and active-dataset persistence.
- Inspector and dataset state.
- Semantic theme palettes.
- Chart export.
- Large-dataset responsiveness.

Compare common Charts I and Charts II outputs. Where totals or aggregations differ, establish whether the difference is an intentional correction or a defect.

**Deliverable:** Tested Charts II candidate, documented issues/resolutions, and acceptance checklist.

**Acceptance:** The new system is sufficiently stable and analytically correct for researcher use.

---

## Phase 7 — Promote Charts II and retire Charts I

**Change type:** Structural retirement, followed by a separate documentation pass.

1. Make Charts II the public Charts workspace.
2. Remove temporary Charts II development navigation.
3. Audit old Analytics components and distinguish obsolete code from still-required shared behavior.
4. Remove unused code, styles, and references in a bounded cleanup.
5. Validate the application after retirement.
6. Update the five core documents under the documentation governance protocol.
7. Commit and synchronize the accepted final state.

**Do not combine promotion with legacy deletion.** Retirement follows accepted replacement and verified integration.

---

## Peridot implementation safeguards

For each coding pass, follow the established Project Workflow Charter:

- Declare a single change type (**behavior**, **visual**, **structural**, or **documentation**), specific goal, in-scope files, out-of-scope regions, expected artifact, and plain-language acceptance test.
- Read the complete exact current affected source files before modifying them.
- Respect the local authoritative source of truth and applied-file continuity.
- Preserve the canonical dataset, Explore, Timeline, and compatibility contracts.
- Deliver uniquely versioned replacement bundles with verified internal paths and explicit installation/verification commands where source changes are made.
- Test the actual behavior before treating a pass as accepted.
- Keep removal of Charts I and core-documentation synchronization as their own bounded steps.

**Core architectural rule:** Charts II shares Peridot's canonical data and filtering contracts, but should not depend on Charts I's old interface or fragmented state architecture.

---

## Recommended immediate next step

Complete **Phase 1**, especially the chart-builder design. Settle the exact chart inventory, catalogue interaction details, builder layout, common and chart-specific controls, and the unified chart-specification requirements before beginning source changes.

## Design-discussion addendum — decisions established after the initial plan

*The following decisions were made in the subsequent Charts II design discussion and are recorded separately to distinguish them from the original seven-phase proposal.*

1. **Two distinct pages:** the Charts Catalogue and the Chart Builder are separate pages within the Charts workspace. Selecting a chart in the catalogue opens its builder.
2. **Builder layout:** persistent configuration panel on the left and a generous live chart preview on the right.
3. **Left-panel sections:** **Data & Interpretation** (open by default), **Filters** (expandable), and **Appearance** (expandable).
4. **Data & Interpretation controls:** chart-specific axes/variables, grouping, aggregation, and missing-value decisions.
5. **Filters:** chart-local narrowing controls, while preserving Peridot's global Explore/Timeline scope contracts.
6. **Appearance:** labels, legends, palette and series/symbol treatment, and relevant presentation settings; approved Peridot color schemes should inform the available palettes.
7. **Peridot's interpretation:** a panel beneath the chart preview describes included records, data transformations, grouping, aggregation, and missing-value treatment. It should **not** automatically interpret the historical significance of results.
8. **Interaction model:** a complete analytical workspace with progressive disclosure inside sections, not a compulsory step-by-step wizard. A structured sentence/autocomplete interaction may remain a possible supplementary method, not a required primary path.
9. **Still open:** precise proportions, detailed control sets, and specific chart-builder presentation choices.

No implementation is authorized by this planning document alone.
