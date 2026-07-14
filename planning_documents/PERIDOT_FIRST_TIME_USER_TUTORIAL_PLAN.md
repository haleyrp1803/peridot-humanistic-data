# Peridot First-Time User Tutorial Plan

**Document type:** Planning document  
**Status:** Approved planning baseline for tutorial development  
**Date:** 2026-07-14  
**Intended repository location:** `planning_documents/PERIDOT_FIRST_TIME_USER_TUTORIAL_PLAN.md`

---

## 1. Tutorial purpose

The tutorial should help a completely new user understand what Peridot does, how to begin exploring data, and how its main workspaces relate to one another.

The audience should not be assumed to know:

- what “humanistic data” means;
- how maps, networks, or charts are built from data;
- what metadata, filtering, or evidence inspection means;
- how historians or digital humanists normally use research software;
- how Peridot’s data scopes or capability model work.

The tutorial should therefore explain concepts through concrete actions and plain-language examples rather than disciplinary terminology.

Its central message should be:

> Peridot helps you look for patterns in a collection of records, investigate the records behind those patterns, and save useful views for further work.

The tutorial should not attempt to teach every feature. Its purpose is orientation, not comprehensive documentation.

---

## 2. Core experience principles

### Immediately visible

A first-time user should notice the tutorial without needing to search for it. It should appear as part of the initial Home experience, but it should not obscure the logo, introductory sentence, or primary calls to action.

### Immediately dismissible

A returning user should be able to dismiss the entire tutorial with one clear action. The dismissal control should appear from the first tutorial surface and remain consistently available throughout the sequence.

Recommended control language:

- **Skip tutorial**
- **Close tutorial**

Avoid ambiguous labels such as **Not now**, which may leave users uncertain about whether the tutorial will reappear during the same session.

### Helpful rather than compulsory

The tutorial should never lock the interface or require every step to be completed. Users should remain able to:

- close it;
- navigate elsewhere;
- use other controls;
- return later;
- restart it from Learn More or a Help entry point.

### Action-oriented

Each stage should ask the user to do one meaningful thing. Avoid long explanatory panels before the user has interacted with the app.

### Contextual

Tutorial guidance should appear close to the interface element it explains. A short callout attached to a relevant control will be easier to understand than a large central modal containing abstract instructions.

### Progressive

Concepts should be introduced only when they become relevant:

1. records;
2. visualizations;
3. timeline;
4. Inspector;
5. Search and Browse;
6. export.

Terms such as “filtered data,” “source,” “target,” or “capability” should not be introduced unless the current step requires them.

### Reversible

The user should be able to move backward to the preceding step. The tutorial should not depend on a perfect sequence of interface actions.

---

## 3. Recommended format

The recommended format is a **hybrid welcome card plus contextual walkthrough**.

### Initial welcome card

A small but prominent tutorial invitation should appear on the Home workspace for first-time users.

It should contain:

**Heading**

> New to Peridot?

**Brief explanation**

> Take a short guided tour using sample data. You will learn how to explore patterns, inspect individual records, search the collection, and export a result.

**Primary action**

> Start tutorial

**Secondary action**

> Explore on my own

A small note may clarify the expected effort without stating an exact duration:

> The tour covers the main workflow and can be closed at any time.

The welcome card should not be a full-screen modal. It should feel integrated with the Home composition—likely beneath or adjacent to the primary Home content—without competing with the Peridot logo.

### Contextual walkthrough

After the user starts the tutorial, guidance should appear through compact callouts anchored to the relevant part of the interface.

Each callout should include:

- a short heading;
- one concise explanatory paragraph;
- one primary action;
- Back;
- Skip tutorial;
- a progress indicator such as **2 of 7**.

The rest of the interface should remain visible. A light focus treatment may highlight the relevant control, but the background should not become so dark or blurred that users lose context.

---

## 4. Suggested tutorial length

The tutorial should have **seven stages**, including the welcome and completion states.

The instructional sequence should cover:

1. Begin with sample data.
2. Understand visualizations.
3. Explore time.
4. Inspect evidence.
5. Search or browse.
6. Understand the current working set.
7. Export and finish.

A seven-stage sequence is long enough to communicate Peridot’s research model but short enough to avoid becoming a product tour of every control.

---

# 5. Detailed tutorial sequence

## Stage 1: Welcome and choose sample data

### Location

Home workspace.

### Visual treatment

Integrated welcome card or compact floating panel that does not cover the Home logo, description, or calls to action.

### Heading

> Learn Peridot with sample data

### Suggested copy

> Peridot helps you explore a collection of records. You can look for patterns in maps, networks, charts, and timelines, then open the records behind those patterns.

> We will begin with sample data so you can learn the interface before uploading your own file.

### Primary action

> Start with sample data

This action should invoke the existing sample-data pathway and move into Visualizations.

### Secondary controls

- Explore on my own
- Skip tutorial

### Concept introduced

**A record**

Plain-language definition:

> A record is one item in a dataset—for example, a letter, event, location, person, object, or observation.

This should be the first and only conceptual definition at this stage.

### What should not be explained yet

- source and target fields;
- workbook mapping;
- metadata;
- data capabilities;
- database-first ingestion;
- filtering scope.

Those belong to later help materials or the upload tutorial.

---

## Stage 2: Understand the Visualizations workspace

### Location

Visualizations workspace after sample data loads.

### Anchor

The main visualization area and the visualization-selection controls in the header.

### Heading

> See the collection from different angles

### Suggested copy

> A visualization is a way of arranging the same records so that patterns are easier to notice.

> Maps show where records are connected. Networks show relationships. Charts summarize values such as dates or categories.

### Primary action

Depending on the default sample-data state:

> Continue with the map

or:

> View the Place Map

The tutorial should not force the user to change visualizations immediately if the Place Map is already visible.

### Optional inline clarification

> Peridot only offers views that the current data can support. Some datasets may not include locations, relationships, dates, or numeric values.

This introduces capability awareness in plain language without using the word “capability.”

### Highlight treatment

Highlight:

- the active visualization name;
- the main visualization canvas;
- optionally the dropdown used to switch visualization types.

Avoid highlighting every header control simultaneously.

### Concept introduced

**Different views do not create new data.**

Suggested wording:

> Changing the view does not change the records. It changes how Peridot presents them.

This is important for non-expert users who may otherwise assume switching views modifies the dataset.

---

## Stage 3: Explore change over time

### Location

Place Map or another timeline-compatible visualization.

### Anchor

The integrated bottom Timeline scrubber.

### Heading

> Focus on a period of time

### Suggested copy

> The timeline lets you focus on records from a particular period. Drag the handles to narrow the range, or use the playback controls to move through time.

> Records outside the selected period may temporarily disappear from the current view. They are not deleted.

### Primary action

> Try changing the date range

The tutorial should observe a successful timeline interaction, but it should also allow the user to continue without performing it.

### Secondary action

> Continue without changing it

### Important plain-language distinction

This is the first place to explain temporary visibility:

> The timeline changes what is currently visible. It does not remove records from the collection.

This should remain deliberately narrower than a full explanation of loaded versus filtered versus timeline-visible scope.

### Interaction behavior

After the user moves a handle or presses a playback control, the tutorial should acknowledge the action:

> The visualization now shows the records within that period.

The callout can then offer **Next**.

### Potential caution

The tutorial should not imply that every dataset has usable dates. If no meaningful date range exists, this step should automatically adapt:

> This sample includes dates, so the timeline is available. Datasets without usable dates will not use this control.

---

## Stage 4: Move from a pattern to evidence

### Location

Active map or network.

### Anchor

A visible clickable node, route, or cluster, followed by the compact Inspector.

### Heading before selection

> Click something to investigate it

### Suggested copy

> Visual patterns are a starting point. Click a place, person, connection, or group to see what it represents.

### Primary action

> Select an item in the visualization

The app should not require one specific node. The tutorial should accept any valid node, route, or cluster selection.

### After selection

The callout should move to the compact Inspector.

### Inspector heading

> The Inspector explains what you selected

### Suggested copy

> The Inspector summarizes the selected item and links it to related people, places, connections, and records.

> Use **Expand Inspector** when you want a fuller view.

### Primary action

> Expand Inspector

### Alternative

> Continue with the summary

The tutorial should explain that opening the Inspector does not lose the visualization:

> The visualization remains underneath, so you can close the Inspector and return to the same view.

### Concepts introduced

**Pattern and evidence**

Suggested wording:

> A visualization helps you notice a pattern. The Inspector helps you check the records behind it.

This should become one of the tutorial’s central conceptual statements.

### Optional explanation of clusters

Only show this when the user selected a cluster:

> A cluster groups several nearby items so the map remains readable. Open it to see what the group contains.

Do not explain clusters unless the user encounters one.

---

## Stage 5: Search and browse the collection

### Location

Explore Your Data / Advanced Search workspace.

### Transition

The tutorial should either:

- direct the user to the hamburger menu and highlight **Explore Your Data**; or
- provide a tutorial action that opens Explore while visually showing the route taken.

The first option teaches navigation more clearly.

### Navigation callout

> Open **Explore Your Data** to find records directly.

### Main heading

> Find a smaller group of records

### Suggested copy

> Explore helps you find records that match a question or topic.

> You can search for a word, browse names and places, combine criteria, or narrow the current results.

### Recommended interaction

The first tutorial should use **Browse**, not a structured Boolean search. Browse is easier for a non-expert and demonstrates available data without requiring the user to know exact terminology.

### Anchor

The Browse tab and one of its ledgers.

### Browse heading

> Browse what the collection contains

### Suggested copy

> Browse lists the people, places, years, and other fields that appear in the data. Select an item when you want to use it as a search condition.

### Primary action

> Open Browse

Then:

> Choose any person or place

### After a Browse selection

The tutorial should explain draft/apply behavior:

> Your choice has been added to the search, but the results will not change until you select **Apply Filters**.

### Primary action

> Apply Filters

### After application

Move the callout to Results.

### Results heading

> These are the matching records

### Suggested copy

> Results shows the records that match your applied search. You can open a result in the Inspector to examine it more closely.

### Concepts introduced

**Search criterion**

> A criterion is simply a condition a record must match.

**Applied search**

> Peridot lets you prepare a search before applying it, so the collection does not change while you are still choosing conditions.

### What should remain outside this tutorial

- AND, OR, and EXCLUDING logic in detail;
- connected-entity pair semantics;
- metadata keyword coverage;
- minimum-weight filtering;
- capability filters;
- complex route filters;
- self-exclusion logic.

Those belong to an Advanced Search tutorial or contextual help.

---

## Stage 6: Explain the relationship between Search and the rest of Peridot

This can be a short conceptual bridge rather than a separate required interaction.

### Location

Results or Refine / Inspect.

### Heading

> Your search becomes the working set

### Suggested copy

> After you apply a search, Peridot uses the matching records as your current working set.

> You can visualize, inspect, chart, and export that smaller group without changing the original uploaded collection.

“Working set” is preferable to “active filtered dataset” for novice users. The formal term can remain available in documentation.

### Optional visual diagram

```text
All loaded records
        ↓
Your applied search
        ↓
Maps, networks, charts, Inspector, and exports
```

### Important qualification

Because Peridot still has active scope-audit considerations, avoid claiming that every interface surface always applies every scope in precisely the same way.

Safer wording:

> Applied searches are intended to define the records you work with across Peridot. Some views may also have their own controls, such as the timeline or chart settings.

This is accurate and understandable without exposing technical uncertainty.

---

## Stage 7: Export and finish

### Location

Return to Visualizations, preferably with the applied search still active.

### Anchor

The Visualizations header Export menu.

### Heading

> Save a result for use elsewhere

### Suggested copy

> Export lets you save a map, network, chart, or table so you can use it in a presentation, report, or further analysis.

> Available formats depend on the current view.

### Primary action

> Open Export

The tutorial should not automatically create a file unless the user explicitly chooses an export option.

### Optional explanation

> Map and network views may offer image and table exports. Charts can be saved as images.

### Final completion panel

After the Export menu opens—or after the user skips export—the tutorial should present a final compact panel.

### Completion heading

> You are ready to explore

### Suggested copy

> You have learned the main Peridot workflow:

> load records, choose a view, explore time, inspect evidence, search the collection, and save a result.

> You can upload your own data from **Manage Your Data**, or continue exploring the sample collection.

### Primary action

> Continue exploring

### Secondary actions

- Upload my data
- Learn how to upload data
- Restart tutorial

The **Learn how to upload data** action may initially link to Learn More rather than beginning another in-app walkthrough until the upload tutorial is built.

---

# 6. Tutorial controls and navigation

Each contextual tutorial card should use the same control arrangement.

## Recommended controls

Left side:

- Back

Right side:

- Skip tutorial
- Next or the current action

The current action should be visually primary. Skip should remain visible but visually secondary.

## Progress indicator

Use:

> Step 3 of 7

This is clearer than dots alone. Dots may accompany the text but should not replace it.

## Close behavior

The top-right of each callout may include an `×`, but it should have an accessible label:

> Close tutorial

Selecting it should either close immediately or show a very small confirmation:

> Close the tutorial? You can restart it later from Learn More.

Recommended actions:

- Close tutorial
- Keep going

A confirmation may be unnecessary if the tutorial is easy to restart. In that case, immediate dismissal is preferable.

## Back behavior

Back should return to the previous tutorial instruction without trying to reverse every user action. For example:

- it should not reset a timeline selection;
- it should not clear an applied search;
- it should not forcibly close a visualization selected by the user.

It changes the guidance state, not the app’s research state.

---

# 7. Persistence and return behavior

## First-time detection

On first use, the Home invitation should appear automatically.

A simple local browser preference could track whether the user has:

- never seen the tutorial;
- started but not completed it;
- completed it;
- dismissed it.

No account system is required.

## Returning users

After completion or dismissal, the automatic Home invitation should no longer appear in its full form.

A small unobtrusive **Tutorial** or **Help** entry should remain accessible through:

- Learn More;
- the hamburger menu, if a general Help entry is eventually added;
- a small help control near the existing feedback control.

The simplest initial placement is Learn More, because that workspace already owns tutorials and help.

## Interrupted tutorial

If the user leaves the page or closes the browser midway through the tutorial, the next visit should not force them directly back into the interrupted step.

Recommended behavior:

> Continue the tutorial where you left off?

Actions:

- Continue
- Start over
- Dismiss

This prompt should appear only once and remain compact.

## Versioning

Tutorial completion state may need a version number. When the interface changes substantially, Peridot could offer:

> Peridot has changed since your last tour. View the updated tutorial?

This should be optional, never automatic full re-enrollment.

---

# 8. Visual design direction

The tutorial should visibly belong to Peridot but remain quieter than the main workspaces.

## Recommended visual language

- dark moss or pine outer frame;
- warm cream content surface;
- restrained gold border or small filigree accent;
- dark green body text;
- clear gold primary action;
- muted green secondary controls;
- minimal shadow;
- rounded corners consistent with Inspector and Explore.

## Avoid

- full-screen onboarding slides;
- bright spotlight effects;
- pulsing highlights;
- large arrows moving around the page;
- repeated animations on every step;
- tutorial mascots;
- long parchment panels;
- light text on light cream surfaces;
- gold text with insufficient contrast;
- blocking overlays that make the interface unusable.

## Highlight treatment

The active target may receive:

- a thin gold outline;
- a subtle warm halo;
- a small anchored pointer from the callout.

Do not dim the rest of the interface more than necessary. The user should always understand where they are.

## Motion

Use one restrained entrance animation for a newly positioned callout:

- short fade;
- very small rise or settle;
- reduced-motion fallback.

Do not animate the tutorial card continuously.

---

# 9. Plain-language terminology guide

The tutorial should use the following terms consistently.

| Technical or disciplinary term | Tutorial language |
|---|---|
| Humanistic data | Collections of records about people, places, events, objects, texts, or other evidence |
| Dataset | Collection of records |
| Record | One item in the collection |
| Visualization | A way of arranging the records so patterns are easier to see |
| Metadata | Information recorded about an item |
| Node | A person, place, or other item shown in a visualization |
| Edge | A connection between two items |
| Cluster | A group of nearby items |
| Filter | A condition used to narrow the collection |
| Criterion | One condition in a search |
| Applied/filtered dataset | Current working set |
| Inspector | A detailed view of the selected item and its related records |
| Capability | A view or feature the current data can support |
| Source and target | Starting item and connected item, only where needed |
| Evidence fields | Additional information included with a record |

Where a technical term appears in the interface itself, the tutorial should mention it once and immediately define it.

Example:

> The **Inspector** is the panel that explains the item you selected.

---

# 10. Accessibility requirements

The tutorial should be fully usable without relying on pointer precision, color, or animation.

## Keyboard behavior

- All tutorial controls must be keyboard reachable.
- Focus should move to the tutorial callout when a new step appears.
- The user should still be able to tab to the highlighted interface control.
- Escape should close or dismiss the current tutorial, with consistent behavior.
- Focus should return to a logical interface control after dismissal.

## Screen-reader behavior

Each callout should announce:

- step number;
- heading;
- instruction;
- available actions.

The highlighted target should be associated with the callout through accessible description where practical.

## Visual requirements

- Do not use color alone to indicate the active target.
- Maintain sufficient contrast on cream, green, and gold surfaces.
- Ensure callouts remain readable at browser zoom.
- Avoid tiny progress labels or dismiss controls.
- Respect reduced-motion preferences.

## Spatial behavior

The callout should reposition when necessary rather than covering the target it explains. On narrow screens, it may become a bottom sheet while preserving access to the highlighted control.

---

# 11. Error and exception handling

The tutorial should not break when the app state differs from the expected path.

## No dates available

Skip or adapt the Timeline step.

Suggested message:

> This collection does not include usable dates, so the timeline is not available. Peridot only shows tools the current data can support.

## No mapped locations

Use a network or chart for the visualization step instead of Place Map.

## No relationships

Do not direct the user to People Network or Force-Directed Network.

## User navigates away

Pause the tutorial and display a small continuation control:

> Continue tutorial

Do not force navigation back automatically.

## User clears or replaces the sample data

Pause the walkthrough and offer:

- Continue with the current data
- Restart with sample data
- End tutorial

## Target control is collapsed

The tutorial may open the relevant header or timeline automatically only when doing so is low-risk and easily reversible. Otherwise, direct the user to open it.

## User performs a different valid action

The tutorial should be tolerant. If the goal is to inspect an item, any valid node, route, or cluster should count. Do not require one exact interaction unless technically necessary.

---

# 12. Scope exclusions for the first tutorial

The first tutorial should deliberately exclude:

- downloading and completing the CSV template;
- arbitrary table mapping;
- workbook sheet joins;
- coordinate formats;
- source and target field mapping;
- evidence-field inclusion settings;
- complex structured search;
- AND, OR, and EXCLUDING logic;
- advanced chart configuration;
- theme customization;
- detailed export settings;
- feedback form usage;
- project history and AI disclosure.

These subjects can be handled through separate tutorials or contextual help.

Recommended future tutorial set:

1. **Getting Started with Peridot**
2. **Uploading and Mapping Your Data**
3. **Searching and Refining Records**
4. **Building and Exporting Charts**
5. **Reading the Inspector**
6. **Understanding Maps, Networks, and Clusters**

---

# 13. Suggested implementation boundaries

The first implementation should be a dedicated behavior pass, not combined with broader redesign or documentation work.

## Likely new tutorial owner

A dedicated component should own tutorial state and presentation rather than embedding separate onboarding logic into each workspace.

Possible structure:

```text
PeridotTutorial.jsx
peridotTutorialConfig.js
PeridotTutorial.css
```

### `PeridotTutorial.jsx`

Potential responsibilities:

- current tutorial status;
- current step;
- opening and closing;
- Back, Next, Skip, Restart;
- target anchoring;
- focus management;
- interruption handling;
- first-time and completed-state persistence.

### `peridotTutorialConfig.js`

Potential responsibilities:

- ordered step definitions;
- headings and copy;
- valid workspace targets;
- optional and skippable steps;
- target selectors or registered target IDs;
- fallback step logic;
- tutorial version.

### `PeridotTutorial.css`

Potential responsibilities:

- callout and welcome-card presentation;
- focus/highlight treatment;
- responsive placement;
- reduced-motion behavior;
- layering above ordinary workspace content but below critical modal states where appropriate.

## App-level responsibilities

`App.jsx` would probably need to expose:

- active workspace;
- tutorial-open state;
- sample-data launch;
- workspace navigation;
- whether Timeline, map, network, Search, and Export controls are available;
- relevant interaction events such as selection and applied search.

Because `App.jsx` is a fragile orchestration boundary, tutorial integration should be narrow and event-based. The tutorial should observe existing actions rather than reimplementing sample-data, navigation, search, Inspector, or export behavior.

---

# 14. Layering and conflict rules

The tutorial should coexist correctly with existing overlays.

Recommended hierarchy:

1. Ordinary workspace content.
2. Tutorial target highlight and callout.
3. Expanded dropdowns required by the tutorial.
4. Full Inspector or other active application modal.
5. Critical confirmation or error modal.

When the user opens the full Inspector, the tutorial callout should move into the Inspector context rather than remain visually above it in the previous workspace.

The tutorial must not cover:

- hamburger navigation options;
- the selected visualization target;
- Timeline handles;
- Inspector primary controls;
- Apply Filters;
- Export options.

---

# 15. Acceptance criteria

The tutorial should be considered successful when a first-time non-expert user can complete it and accurately answer:

1. What is a record?
2. What does changing a visualization do?
3. What does the timeline change?
4. How do I investigate an item I see in a map or network?
5. How do I narrow the collection?
6. When does a search take effect?
7. How do I save a result?
8. How do I close or restart the tutorial?

## Functional acceptance test

Starting from a fresh browser state:

1. Open Peridot.
2. Notice the tutorial invitation without searching for it.
3. Start the tutorial.
4. Load sample data.
5. Reach Visualizations.
6. Interact with or skip the Timeline instruction.
7. Select any valid visualization item.
8. Open the Inspector.
9. Navigate to Explore.
10. Browse and apply one criterion.
11. View matching results.
12. Open or reach the Export control.
13. Complete the tutorial.
14. Reload Peridot.
15. Confirm the tutorial does not reopen automatically.
16. Restart it from Learn More.
17. Dismiss it immediately.
18. Confirm all ordinary app interactions remain available.

## Accessibility acceptance test

Complete the same pathway using:

- keyboard navigation;
- 200% browser zoom;
- reduced-motion mode;
- a screen reader or accessibility-tree inspection.

---

# 16. Recommended first design decisions

## Home invitation

The recommended Home treatment is:

> A compact cream tutorial card integrated beneath the primary Home title-card composition, visible on first use but removable with one click.

It should not float over the logo or turn the Home workspace into a dashboard. Once dismissed, it should be replaced by no permanent Home element; tutorial access should remain in Learn More.

## Progression model

The recommended progression model is a hybrid:

> Detect the requested action and acknowledge it, but always provide a manual Continue option.

This gives users useful feedback without making the tutorial brittle or compulsory.

---

## 17. Project status and future use

This document is the approved planning baseline for the first-time-user tutorial.

During development, it should be used to:

- define the scope of each bounded implementation pass;
- preserve the novice, non-specialist audience;
- review tutorial copy for plain language;
- prevent the first tutorial from expanding into comprehensive feature documentation;
- test dismissibility, accessibility, and state tolerance;
- distinguish the introductory tutorial from future upload, Search, chart, and Inspector tutorials.

Changes to the tutorial plan should be recorded deliberately rather than allowed to emerge implicitly through implementation.
