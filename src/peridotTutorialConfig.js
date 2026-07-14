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
    workspace: 'visualizations',
    title: 'Move from a visualization into Explore',
    description: 'Use the main Peridot menu to move between workspaces. Open the menu, then choose Explore Your Data.',
    note: 'Your visualization, timeline range, and applied filters remain available when you move between workspaces.',
    interactionType: 'explore-navigation',
    menuClosedPrompt: 'Open the main menu with the round button at the upper left.',
    menuOpenPrompt: 'The menu is open. Choose Explore Your Data.',
    reachedText: 'Explore is open. This workspace lets you browse the collection and build a focused search.',
    fallbackLabel: 'Open Explore directly',
    inspectorPrompt: 'Close the Inspector before continuing so it does not cover the menu or the next tutorial steps.',
    inspectorCloseLabel: 'Close Inspector',
    inspectorCompactAnchorSelector: 'button',
    inspectorCompactAnchorMatchText: 'Expand',
    inspectorCompactAnchorAncestorText: 'Inspector',
    inspectorCompactAnchorAncestorMinWidthRatio: 0.16,
    inspectorCompactAnchorPlacement: 'center-right',
    inspectorFullAnchorSelector: '[aria-label="Inspector workspace"]',
    inspectorFullAnchorPlacement: 'bottom-right',
    closedAnchorSelector: 'button',
    closedAnchorMatchText: '≡',
    closedAnchorPlacement: 'center-right',
    openAnchorSelector: 'button',
    openAnchorMatchText: 'Explore Your Data',
    openAnchorPlacement: 'center-right',
    reachedAnchorSelector: '[data-peridot-workspace-mode="search"]',
    reachedAnchorPlacement: 'top-right',
    highlightAnchor: true,
  },
  {
    id: 'browse-apply',
    number: 6,
    workspace: 'search',
    title: 'Browse, choose, and apply',
    description: 'Browse the collection, choose any person or place, then apply the draft filter to create a smaller working set.',
    note: 'Choosing an item prepares a draft. Nothing changes across Peridot until you select Apply Filters.',
    interactionType: 'search-browse-apply',
    browsePrompt: 'Open Browse, then choose any person or place that interests you.',
    draftPrompt: 'Your choice is now a draft. Select Apply Filters to update the working set.',
    appliedText: 'The Results tab now shows the applied working set. Maps, networks, charts, Inspector, and exports can use this applied scope.',
    openBrowseLabel: 'Open Browse',
    useCurrentResultsLabel: 'Use current results',
    applyLabel: 'Apply Filters',
    browseAnchorSelector: 'button',
    browseAnchorMatchText: 'Browse',
    browseAnchorPlacement: 'bottom-right',
    applyAnchorSelector: 'button',
    applyAnchorMatchText: 'Apply Filters',
    applyAnchorPlacement: 'center-left',
    resultsAnchorSelector: 'button',
    resultsAnchorMatchText: 'Results',
    resultsAnchorPlacement: 'bottom-right',
    highlightAnchor: true,
  },
  {
    id: 'working-set',
    number: 7,
    workspace: 'search',
    title: 'Understand the working set',
    description: 'The records that match your applied search become the working set Peridot uses across its research tools.',
    note: 'Individual views can narrow what you see further—for example, with the timeline or chart settings—without changing the applied search itself.',
    interactionType: 'working-set-explanation',
    flowStart: 'All loaded records',
    flowMiddle: 'Your applied search',
    flowEnd: 'Maps, networks, charts, Inspector, and exports',
    anchorSelector: 'button',
    anchorMatchText: 'Results',
    anchorPlacement: 'bottom-right',
    highlightAnchor: true,
  },
  {
    id: 'export',
    number: 8,
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
