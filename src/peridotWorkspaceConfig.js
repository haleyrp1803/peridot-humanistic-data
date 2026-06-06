// Workspace-mode constants and guards for Peridot's redesigned routing model.
// The primary product navigation is now Manage Your Data, Visualize Your Data,
// Explore Your Data, Learn More about Peridot, and Themes and Accessibility.
// Search and Inspector remain available as internal/compatibility routes even
// though they are no longer separate top-level hamburger-menu items.
export const PERIDOT_WORKSPACE_MODES = Object.freeze({
  HOME: 'home',
  DATA: 'data',
  VISUALIZATIONS: 'visualizations',
  EXPLORE: 'explore',
  LEARN_MORE: 'learn-more',
  SEARCH: 'search',
  INSPECTOR: 'inspector',
  THEME: 'theme',
});

export const DEFAULT_PERIDOT_WORKSPACE_MODE = PERIDOT_WORKSPACE_MODES.HOME;

export const PERIDOT_WORKSPACE_MODE_VALUES = Object.freeze(
  Object.values(PERIDOT_WORKSPACE_MODES),
);

export function isPeridotWorkspaceMode(value) {
  return PERIDOT_WORKSPACE_MODE_VALUES.includes(value);
}

export function resolvePeridotWorkspaceMode(
  nextMode,
  currentMode = DEFAULT_PERIDOT_WORKSPACE_MODE,
) {
  const resolvedMode = typeof nextMode === 'function' ? nextMode(currentMode) : nextMode;
  return isPeridotWorkspaceMode(resolvedMode) ? resolvedMode : currentMode;
}
