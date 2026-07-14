/*
 * Peridot guided-tutorial step configuration.
 *
 * This module is the single ordered source of truth for tutorial progression.
 * Later bounded passes can add target-specific availability checks and action
 * completion rules without redistributing tutorial copy or routing decisions
 * through App.jsx.
 */

export const PERIDOT_TUTORIAL_STEPS = Object.freeze([
  {
    id: 'welcome',
    number: 1,
    workspace: 'home',
    title: 'Learn Peridot with sample data',
    description: 'Begin with sample data so you can learn the interface before uploading your own file.',
    note: 'A record is one item in a collection—for example, a letter, event, location, person, object, or observation.',
    anchorSelector: '[data-peridot-workspace-mode="home"]',
    anchorPlacement: 'bottom-right',
  },
  {
    id: 'visualizations',
    number: 2,
    workspace: 'visualizations',
    title: 'See the collection from different angles',
    description: 'A visualization arranges the same records in a different way so patterns are easier to notice. Maps show locations and routes, while networks show relationships between people or other entities.',
    note: 'Changing the view does not change the records. It changes how Peridot presents them.',
    anchorSelector: '[data-peridot-workspace-mode="visualizations"] button[aria-label^="Export "]',
    anchorAncestorText: 'Visualization workspace',
    anchorAncestorMinWidthRatio: 0.72,
    anchorPlacement: 'bottom-right',
    highlightAnchor: true,
  },
  {
    id: 'timeline',
    number: 3,
    workspace: 'visualizations',
    title: 'Focus on a period of time',
    description: 'The timeline lets you focus on records from a particular period. Later tutorial work will connect this step directly to the range and playback controls.',
    note: 'The timeline changes what is currently visible. It does not remove records from the collection.',
    anchorSelector: '[data-peridot-workspace-mode="visualizations"] input[type="range"]',
    anchorAncestorText: 'Timeline',
    anchorAncestorMinWidthRatio: 0.72,
    anchorPlacement: 'top-right',
    highlightAnchor: true,
  },
  {
    id: 'inspector',
    number: 4,
    workspace: 'visualizations',
    title: 'Move from a pattern to evidence',
    description: 'Select a place, person, connection, or group to investigate what it represents. A later pass will connect this step to selection and Inspector actions.',
    note: 'A visualization helps you notice a pattern. The Inspector helps you check the records behind it.',
    anchorSelector: '[data-peridot-tutorial-anchor="map-stage"]',
    anchorPlacement: 'center-right',
  },
  {
    id: 'explore',
    number: 5,
    workspace: 'search',
    title: 'Find a smaller group of records',
    description: 'Explore helps you search or browse the collection and prepare conditions that records must match.',
    note: 'A search does not take effect until its conditions are applied.',
    anchorSelector: '[data-peridot-tutorial-anchor="search-workspace"]',
    anchorPlacement: 'top-right',
  },
  {
    id: 'working-set',
    number: 6,
    workspace: 'search',
    title: 'Your search becomes the working set',
    description: 'After you apply a search, the matching records become the smaller group you work with across Peridot.',
    note: 'Some views also have their own controls, such as the timeline or chart settings.',
    anchorSelector: '[data-peridot-tutorial-anchor="search-results"]',
    anchorPlacement: 'bottom-right',
  },
  {
    id: 'export',
    number: 7,
    workspace: 'visualizations',
    title: 'Save a result for use elsewhere',
    description: 'Export lets you save a map, network, chart, or table for a presentation, report, or further analysis.',
    note: 'Available export formats depend on the current view.',
    anchorSelector: '[data-peridot-tutorial-anchor="visualizations-workspace"]',
    anchorPlacement: 'top-right',
  },
]);

export const PERIDOT_TUTORIAL_TOTAL_STEPS = PERIDOT_TUTORIAL_STEPS.length;
export const PERIDOT_TUTORIAL_START_INDEX = 1;

export function getPeridotTutorialStep(stepIndex) {
  const safeIndex = Math.min(
    Math.max(0, Number.isInteger(stepIndex) ? stepIndex : PERIDOT_TUTORIAL_START_INDEX),
    PERIDOT_TUTORIAL_STEPS.length - 1,
  );

  return PERIDOT_TUTORIAL_STEPS[safeIndex];
}

export function getPeridotTutorialStepIndex(stepId) {
  const index = PERIDOT_TUTORIAL_STEPS.findIndex((step) => step.id === stepId);
  return index >= 0 ? index : PERIDOT_TUTORIAL_START_INDEX;
}
