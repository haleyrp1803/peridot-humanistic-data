// Workspace-mode constants and guards for Peridot's redesigned routing model.
// Home, Data, Theme, and Visualizations currently render as full workspaces.
// Search, Timeline, Export, and Inspector remain future-facing workspace modes
// while those workflows are bridged through legacy side-panel content.
export const PERIDOT_WORKSPACE_MODES = Object.freeze({
  HOME: 'home',
  DATA: 'data',
  VISUALIZATIONS: 'visualizations',
  SEARCH: 'search',
  INSPECTOR: 'inspector',
  TIMELINE: 'timeline',
  THEME: 'theme',
  EXPORT: 'export',
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
