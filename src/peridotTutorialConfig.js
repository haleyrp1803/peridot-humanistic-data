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
    description: 'Use the range handles to focus on part of the collection, or use playback to reveal dated records in sequence. Try either kind of control to see the visualization update.',
    note: 'The timeline changes what is currently visible. It does not delete records or change your uploaded data.',
    interactionType: 'timeline',
    interactionPrompt: 'Try moving a range handle, choosing All dates, changing playback position, or using a playback control.',
    interactionCompleteText: 'Timeline change detected. Your selected range or playback state will remain in place when you continue.',
    skipLabel: 'Continue without changing it',
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
    description: 'Select any visible place, person, connection, or group in the map or network. Peridot will open the compact Inspector with details about what you selected.',
    note: 'A visualization helps you notice a pattern. The Inspector helps you check the records behind it.',
    interactionType: 'inspector',
    interactionPrompt: 'Select any node, route, or cluster in the visualization. You do not need to choose a particular item.',
    interactionCompleteText: 'Selection detected. The compact Inspector now summarizes the evidence connected to this item.',
    expandedText: 'The full Inspector is open. It uses the same selection and preserves the visualization underneath.',
    skipLabel: 'Continue without selecting',
    selectionAnchorSelector: '[data-peridot-tutorial-anchor="visualization-stage"]',
    selectionAnchorPlacement: 'top-right',
    compactAnchorSelector: 'button',
    compactAnchorMatchText: 'Expand Inspector',
    compactAnchorAncestorText: 'Inspector',
    compactAnchorAncestorMinWidthRatio: 0.16,
    compactAnchorPlacement: 'center-right',
    fullAnchorSelector: '[aria-label="Inspector workspace"]',
    fullAnchorPlacement: 'bottom-right',
    highlightAnchor: true,
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
