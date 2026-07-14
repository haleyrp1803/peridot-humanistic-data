/*
 * Peridot guided-tutorial callout.
 *
 * App.jsx owns session progression and workspace routing. Step copy and anchor
 * metadata live in `peridotTutorialConfig.js`. Interaction-aware steps observe
 * existing controls without replacing or duplicating their canonical state.
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';

import { PERIDOT_TUTORIAL_TOTAL_STEPS } from './peridotTutorialConfig.js';
import { useDraggableTutorialPanel } from './useDraggableTutorialPanel.js';

import tutorialFiligreeDivider from '../assets/Adobe Stock Filigree 3.png';

function isTimelineInteractionTarget(target, anchorElement) {
  if (!target || !anchorElement || !anchorElement.contains(target)) return false;

  if (target.matches?.('input[type="range"], select')) return true;

  const button = target.closest?.('button');
  if (!button || !anchorElement.contains(button) || button.disabled) return false;

  const label = `${button.textContent || ''} ${button.getAttribute('aria-label') || ''}`
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

  return [
    'play',
    'pause',
    'reset',
    'all dates',
  ].some((token) => label.includes(token));
}

function getTimelineAvailability(anchorElement) {
  if (!anchorElement) {
    return {
      available: false,
      reason: 'The Timeline is not currently visible. You can continue without changing it.',
    };
  }

  const interactiveControls = Array.from(
    anchorElement.querySelectorAll('input[type="range"], select, button'),
  ).filter((control) => !control.disabled);

  if (!interactiveControls.length) {
    return {
      available: false,
      reason: 'This dataset does not provide usable dated records for the Timeline controls. The tutorial can continue without changing the view.',
    };
  }

  return { available: true, reason: '' };
}


function findVisibleButtonByText(text) {
  if (typeof document === 'undefined') return null;
  const needle = String(text || '').trim().toLowerCase();
  return Array.from(document.querySelectorAll('button')).find((button) => {
    if (button.disabled) return false;
    const rect = button.getBoundingClientRect();
    if (!rect.width || !rect.height) return false;
    return String(button.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase().includes(needle);
  }) || null;
}

function isBrowseIndexChoice(button) {
  if (!button) return false;
  const excludedLabels = [
    'build search',
    'browse',
    'results',
    'refine',
    'capabilities',
    'apply filters',
    'clear filters',
    'open visualizations',
  ];
  const label = String(button.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();
  if (!label || excludedLabels.some((excluded) => label === excluded || label.includes(excluded))) return false;

  let current = button.parentElement;
  while (current && current !== document.body) {
    const text = String(current.textContent || '').replace(/\s+/g, ' ').toLowerCase();
    if (text.includes('browse uses the full loaded dataset')) return true;
    current = current.parentElement;
  }
  return false;
}


const TUTORIAL_HIGHLIGHT_TERMS = Object.freeze([
  'Apply Filters',
  'Open Export',
  'Open Browse',
  'Explore Your Data',
  'Continue',
  'Back',
  'Timeline',
  'Inspector',
  'Explore',
  'Browse',
  'Results',
  'Export',
  'working set',
  'applied search',
  'data visualization',
  'visualization',
  'map',
  'maps',
  'network',
  'networks',
  'records',
  'record',
]);

function renderTutorialSentence(sentence) {
  const source = String(sentence || '');
  if (!source) return null;

  const escapedTerms = TUTORIAL_HIGHLIGHT_TERMS
    .map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .sort((a, b) => b.length - a.length);

  const matcher = new RegExp(`(${escapedTerms.join('|')})`, 'gi');
  const parts = source.split(matcher);

  return parts.map((part, index) => {
    const isHighlighted = TUTORIAL_HIGHLIGHT_TERMS.some(
      (term) => term.toLowerCase() === part.toLowerCase(),
    );

    return isHighlighted ? (
      <span key={`${part}-${index}`} className="peridot-tutorial-keyword">
        {part}
      </span>
    ) : (
      part
    );
  });
}

export function PeridotTutorial({
  step,
  canGoBack = true,
  isLastStep = false,
  inspectorSelection = null,
  inspectorPresentationMode = 'closed',
  workspaceMode = '',
  tutorialCapabilities = {},
  isMainMenuOpen = false,
  onReturnToStepWorkspace,
  onOpenMainMenu,
  onOpenExplore,
  onCloseInspector,
  onExpandInspector,
  onRestartTutorial,
  onOpenData,
  onBack,
  onClose,
  onContinue,
}) {
  const dialogRef = useRef(null);
  const primaryButtonRef = useRef(null);
  const [hasCompletedInteraction, setHasCompletedInteraction] = useState(false);
  const [searchTutorialPhase, setSearchTutorialPhase] = useState('browse');
  const [exportTutorialPhase, setExportTutorialPhase] = useState('closed');
  const [hasActivatedExploreRoute, setHasActivatedExploreRoute] = useState(false);
  const [dialogueFrameIndex, setDialogueFrameIndex] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);
  const isTimelineStep = step?.interactionType === 'timeline';
  const isInspectorStep = step?.interactionType === 'inspector';
  const isExploreNavigationStep = step?.interactionType === 'explore-navigation';
  const isSearchBrowseApplyStep = step?.interactionType === 'search-browse-apply';
  const isWorkingSetExplanationStep = step?.interactionType === 'working-set-explanation';
  const isExportCompletionStep = step?.interactionType === 'export-completion';
  const dialogueFrames = Array.isArray(step?.frames) && step.frames.length
    ? step.frames
    : [step?.description, step?.note].filter(Boolean);
  const hasDialogueInteractionStage = Boolean(
    isTimelineStep
    || isInspectorStep
    || isExploreNavigationStep
    || isSearchBrowseApplyStep
    || isWorkingSetExplanationStep
    || isExportCompletionStep
  );
  const isDialogueIntro = dialogueFrameIndex < dialogueFrames.length;
  const isDialogueAnchorReady = hasDialogueInteractionStage
    ? dialogueFrameIndex >= dialogueFrames.length
    : dialogueFrameIndex >= Math.max(0, dialogueFrames.length - 1);
  const expectedWorkspace = step?.workspace || '';
  const isWorkspaceMismatch = Boolean(
    expectedWorkspace
    && workspaceMode
    && expectedWorkspace !== workspaceMode
    && !(isExploreNavigationStep && ['visualizations', 'explore', 'search'].includes(workspaceMode))
  );
  const isCapabilityUnavailable = Boolean(
    (isTimelineStep && tutorialCapabilities.hasTimelineDates === false)
    || (isInspectorStep && tutorialCapabilities.hasSelectableVisualization === false)
    || (isSearchBrowseApplyStep && tutorialCapabilities.hasSearchRows === false)
    || (isExportCompletionStep
      && exportTutorialPhase === 'closed'
      && tutorialCapabilities.hasExportableVisualization === false)
  );
  const isInspectorOpenDuringExplore = isExploreNavigationStep
    && ['compact', 'workspace', 'empty-workspace'].includes(inspectorPresentationMode);
  const hasReachedExplore = isExploreNavigationStep
    && !isInspectorOpenDuringExplore
    && (
      hasActivatedExploreRoute
      || ['explore', 'search'].includes(workspaceMode)
    );
  const isCompactInspectorOpen = isInspectorStep
    && inspectorPresentationMode === 'compact'
    && Boolean(inspectorSelection);
  const isFullInspectorOpen = isInspectorStep
    && ['workspace', 'empty-workspace'].includes(inspectorPresentationMode)
    && Boolean(inspectorSelection);
  const hasActiveInspectorSelection = isCompactInspectorOpen || isFullInspectorOpen;

  const activeAnchorConfig = isMinimized
    || !isDialogueAnchorReady
    || isWorkspaceMismatch
    || isCapabilityUnavailable
    ? { selector: '', placement: 'center' }
    : isExportCompletionStep
    ? exportTutorialPhase === 'menu-open'
      ? {
          selector: step?.openAnchorSelector,
          matchText: step?.openAnchorMatchText,
          ancestorText: step?.openAnchorAncestorText,
          ancestorMinWidthRatio: step?.openAnchorAncestorMinWidthRatio,
          placement: step?.openAnchorPlacement,
        }
      : exportTutorialPhase === 'complete'
        ? {
            selector: '',
            placement: 'center',
          }
        : {
            selector: step?.closedAnchorSelector,
            matchText: step?.closedAnchorMatchText,
            placement: step?.closedAnchorPlacement,
          }
    : isSearchBrowseApplyStep
    ? searchTutorialPhase === 'applied'
      ? {
          selector: step?.resultsAnchorSelector,
          matchText: step?.resultsAnchorMatchText,
          placement: step?.resultsAnchorPlacement,
        }
      : searchTutorialPhase === 'draft'
        ? {
            selector: step?.applyAnchorSelector,
            matchText: step?.applyAnchorMatchText,
            placement: step?.applyAnchorPlacement,
          }
        : {
            selector: step?.browseAnchorSelector,
            matchText: step?.browseAnchorMatchText,
            placement: step?.browseAnchorPlacement,
          }
    : isExploreNavigationStep
    ? isInspectorOpenDuringExplore
      ? ['workspace', 'empty-workspace'].includes(inspectorPresentationMode)
        ? {
            selector: step?.inspectorFullAnchorSelector,
            placement: step?.inspectorFullAnchorPlacement,
          }
        : {
            selector: step?.inspectorCompactAnchorSelector,
            matchText: step?.inspectorCompactAnchorMatchText,
            ancestorText: step?.inspectorCompactAnchorAncestorText,
            ancestorMinWidthRatio: step?.inspectorCompactAnchorAncestorMinWidthRatio,
            placement: step?.inspectorCompactAnchorPlacement,
          }
      : hasReachedExplore
        ? {
          selector: ['explore', 'search'].includes(workspaceMode)
            ? step?.reachedAnchorSelector
            : '',
          placement: step?.reachedAnchorPlacement,
        }
      : isMainMenuOpen
        ? {
            selector: step?.openAnchorSelector,
            matchText: step?.openAnchorMatchText,
            placement: step?.openAnchorPlacement,
          }
          : {
              selector: step?.closedAnchorSelector,
              matchText: step?.closedAnchorMatchText,
              placement: step?.closedAnchorPlacement,
            }
    : isInspectorStep
      ? isFullInspectorOpen
      ? {
          selector: step?.fullAnchorSelector,
          placement: step?.fullAnchorPlacement,
        }
      : isCompactInspectorOpen
        ? {
            selector: step?.compactAnchorSelector,
            matchText: step?.compactAnchorMatchText,
            ancestorText: step?.compactAnchorAncestorText,
            ancestorMinWidthRatio: step?.compactAnchorAncestorMinWidthRatio,
            placement: step?.compactAnchorPlacement,
          }
        : {
            selector: step?.selectionAnchorSelector,
            placement: step?.selectionAnchorPlacement,
          }
    : {
        selector: step?.anchorSelector,
        matchText: step?.anchorMatchText,
        closestSelector: step?.anchorClosestSelector,
        ancestorText: step?.anchorAncestorText,
        ancestorMinWidthRatio: step?.anchorAncestorMinWidthRatio,
        placement: step?.anchorPlacement,
      };

  const {
    panelRef,
    panelStyle,
    dragHandleProps,
    anchorElement,
    isAnchorAvailable,
  } = useDraggableTutorialPanel({
    anchorSelector: activeAnchorConfig.selector,
    anchorMatchText: activeAnchorConfig.matchText,
    anchorClosestSelector: activeAnchorConfig.closestSelector,
    anchorAncestorText: activeAnchorConfig.ancestorText,
    anchorAncestorMinWidthRatio: activeAnchorConfig.ancestorMinWidthRatio,
    anchorPlacement: activeAnchorConfig.placement,
    highlightAnchor: !isMinimized && isDialogueAnchorReady && step?.highlightAnchor,
    describedById: 'peridot-tutorial-description',
    resetKey: `${step?.id}:${dialogueFrameIndex}:${isMinimized ? 'minimized' : 'open'}:${inspectorPresentationMode}:${hasActiveInspectorSelection ? 'selected' : 'unselected'}:${workspaceMode}:${isMainMenuOpen ? 'menu-open' : 'menu-closed'}:${hasActivatedExploreRoute ? 'explore-activated' : 'explore-pending'}:${isCapabilityUnavailable ? 'unavailable' : 'available'}`,
  });

  const timelineAvailability = useMemo(() => {
    if (!isTimelineStep) return { available: true, reason: '' };
    if (tutorialCapabilities.hasTimelineDates === false) {
      return { available: false, reason: step?.unavailableText || 'Timeline data is unavailable.' };
    }
    return getTimelineAvailability(anchorElement);
  }, [anchorElement, isTimelineStep, step?.unavailableText, tutorialCapabilities.hasTimelineDates]);

  useEffect(() => {
    setHasCompletedInteraction(false);
    setSearchTutorialPhase('browse');
    setExportTutorialPhase('closed');
    setHasActivatedExploreRoute(false);
    setDialogueFrameIndex(0);
    setIsMinimized(false);

    window.requestAnimationFrame(() => {
      (primaryButtonRef.current || dialogRef.current)?.focus();
    });
  }, [step?.id]);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key !== 'Escape') return;
      if (isInspectorStep && ['compact', 'workspace', 'empty-workspace'].includes(inspectorPresentationMode)) {
        return;
      }
      event.preventDefault();
      onClose?.();
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [inspectorPresentationMode, isInspectorStep, onClose]);

  useEffect(() => {
    if (isWorkspaceMismatch || isCapabilityUnavailable || !isTimelineStep || !anchorElement || !timelineAvailability.available) return undefined;

    const markInteractionComplete = (event) => {
      if (!isTimelineInteractionTarget(event.target, anchorElement)) return;
      setHasCompletedInteraction(true);
    };

    anchorElement.addEventListener('input', markInteractionComplete, true);
    anchorElement.addEventListener('change', markInteractionComplete, true);
    anchorElement.addEventListener('click', markInteractionComplete, true);

    return () => {
      anchorElement.removeEventListener('input', markInteractionComplete, true);
      anchorElement.removeEventListener('change', markInteractionComplete, true);
      anchorElement.removeEventListener('click', markInteractionComplete, true);
    };
  }, [anchorElement, isCapabilityUnavailable, isTimelineStep, isWorkspaceMismatch, timelineAvailability.available]);

  useEffect(() => {
    if (!isExploreNavigationStep || isInspectorOpenDuringExplore) return undefined;

    const handleExploreRouteClick = (event) => {
      const button = event.target?.closest?.('button');
      if (!button) return;

      const label = String(
        button.getAttribute('aria-label')
        || button.textContent
        || ''
      )
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase();

      if (label === 'explore' || label.includes('explore your data')) {
        setHasActivatedExploreRoute(true);
      }
    };

    document.addEventListener('click', handleExploreRouteClick, true);
    return () => document.removeEventListener('click', handleExploreRouteClick, true);
  }, [isExploreNavigationStep, isInspectorOpenDuringExplore]);

  useEffect(() => {
    if (isWorkspaceMismatch || isCapabilityUnavailable || !isSearchBrowseApplyStep) return undefined;

    const handleSearchTutorialClick = (event) => {
      const button = event.target?.closest?.('button');
      if (!button) return;

      const label = String(button.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();

      if (isBrowseIndexChoice(button)) {
        window.setTimeout(() => setSearchTutorialPhase('draft'), 0);
        return;
      }

      if (label.includes('apply filters')) {
        window.setTimeout(() => {
          setSearchTutorialPhase('applied');
          setHasCompletedInteraction(true);
        }, 0);
      }
    };

    document.addEventListener('click', handleSearchTutorialClick, true);
    return () => document.removeEventListener('click', handleSearchTutorialClick, true);
  }, [isCapabilityUnavailable, isSearchBrowseApplyStep, isWorkspaceMismatch]);

  useEffect(() => {
    if (isWorkspaceMismatch || isCapabilityUnavailable || !isExportCompletionStep) return undefined;

    const handleExportTutorialClick = (event) => {
      const button = event.target?.closest?.('button');
      if (!button) return;
      const label = String(button.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();
      const ariaLabel = String(button.getAttribute('aria-label') || '').trim().toLowerCase();

      if (label === 'export' || ariaLabel.startsWith('export ')) {
        window.setTimeout(() => setExportTutorialPhase('menu-open'), 0);
      }
    };

    document.addEventListener('click', handleExportTutorialClick, true);
    return () => document.removeEventListener('click', handleExportTutorialClick, true);
  }, [isCapabilityUnavailable, isExportCompletionStep, isWorkspaceMismatch]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return undefined;

    const handleDialogKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose?.();
        return;
      }

      if (event.key !== 'Tab') return;

      const focusable = Array.from(
        dialog.querySelectorAll(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => {
        const rect = element.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      });

      if (!focusable.length) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    dialog.addEventListener('keydown', handleDialogKeyDown);
    return () => dialog.removeEventListener('keydown', handleDialogKeyDown);
  }, [onClose, step?.id]);

  if (!step) return null;

  const isExportComplete = isExportCompletionStep && exportTutorialPhase === 'complete';
  const displayTitle = isExportComplete ? step.completeTitle : step.title;

  const currentSentence = (() => {
    if (isWorkspaceMismatch) {
      return 'This tutorial step belongs to another workspace, and returning will preserve your current work.';
    }

    if (isCapabilityUnavailable) {
      return step.unavailableText || 'This tutorial activity is unavailable for the current dataset.';
    }

    if (isExportComplete) return step.completeText;

    if (isDialogueIntro) {
      return dialogueFrames[dialogueFrameIndex] || step.description || '';
    }

    if (isTimelineStep) {
      return hasCompletedInteraction
        ? step.interactionCompleteText
        : step.interactionPrompt;
    }

    if (isInspectorStep) {
      if (isFullInspectorOpen) return step.expandedText;
      if (isCompactInspectorOpen) return step.interactionCompleteText;
      return step.interactionPrompt;
    }

    if (isExploreNavigationStep) {
      if (isInspectorOpenDuringExplore) return step.inspectorPrompt;
      if (hasReachedExplore) return step.reachedText;
      return isMainMenuOpen ? step.menuOpenPrompt : step.menuClosedPrompt;
    }

    if (isSearchBrowseApplyStep) {
      if (searchTutorialPhase === 'draft') return step.draftPrompt;
      if (searchTutorialPhase === 'applied') return step.appliedText;
      return step.browsePrompt;
    }

    if (isWorkingSetExplanationStep) {
      return 'The applied search sits between the full collection and the research tools that use the resulting working set.';
    }

    if (isExportCompletionStep) {
      return exportTutorialPhase === 'menu-open' ? step.openText : step.closedPrompt;
    }

    return dialogueFrames.at(-1) || step.description || '';
  })();

  const canAdvanceDialogue = isDialogueIntro && (
    dialogueFrameIndex < dialogueFrames.length - 1
    || hasDialogueInteractionStage
  );

  const showGenericAnchorFallback = isDialogueAnchorReady
    && !isAnchorAvailable
    && activeAnchorConfig.selector
    && !isTimelineStep
    && !isInspectorStep
    && !isExploreNavigationStep
    && !isSearchBrowseApplyStep
    && !isWorkingSetExplanationStep
    && !isExportCompletionStep;

  const showTimelineUnavailable = isDialogueAnchorReady
    && !isWorkspaceMismatch
    && isTimelineStep
    && !timelineAvailability.available;

  const primaryLabel = isWorkspaceMismatch
    ? 'Return to this tutorial step'
    : isCapabilityUnavailable
      ? isExportCompletionStep ? 'Finish tutorial' : 'Continue'
      : canAdvanceDialogue
        ? 'Continue'
        : isExportCompletionStep
          ? exportTutorialPhase === 'closed'
            ? 'Open Export'
            : exportTutorialPhase === 'menu-open'
              ? 'Finish tutorial'
              : 'Continue exploring'
          : isLastStep
            ? 'Finish tutorial'
            : isTimelineStep && !hasCompletedInteraction && timelineAvailability.available
              ? step.skipLabel || 'Continue without changing it'
              : isInspectorStep && !hasActiveInspectorSelection
                ? step.skipLabel || 'Continue without selecting'
                : isInspectorStep && isCompactInspectorOpen
                  ? 'Continue with summary'
                  : isExploreNavigationStep && isInspectorOpenDuringExplore
                    ? step.inspectorCloseLabel || 'Close Inspector'
                    : isExploreNavigationStep && !hasReachedExplore
                      ? step.fallbackLabel || 'Open Explore directly'
                      : isSearchBrowseApplyStep && searchTutorialPhase === 'browse'
                        ? step.useCurrentResultsLabel || 'Use current results'
                        : isSearchBrowseApplyStep && searchTutorialPhase === 'draft'
                          ? step.applyLabel || 'Apply Filters'
                          : 'Next';

  const handleBackAction = () => {
    if (dialogueFrameIndex > 0 && !isExportComplete) {
      setDialogueFrameIndex((current) => Math.max(0, current - 1));
      return;
    }
    onBack?.();
  };

  const handlePrimaryAction = () => {
    if (isWorkspaceMismatch) {
      onReturnToStepWorkspace?.();
      return;
    }

    if (isCapabilityUnavailable) {
      if (isExportCompletionStep) setExportTutorialPhase('complete');
      else onContinue?.();
      return;
    }

    if (canAdvanceDialogue) {
      setDialogueFrameIndex((current) => current + 1);
      return;
    }

    if (isExploreNavigationStep && isInspectorOpenDuringExplore) {
      onCloseInspector?.();
      return;
    }

    if (isExploreNavigationStep && !hasReachedExplore) {
      onOpenExplore?.();
      return;
    }

    if (isSearchBrowseApplyStep && searchTutorialPhase === 'browse') {
      setSearchTutorialPhase('applied');
      setHasCompletedInteraction(true);
      return;
    }

    if (isSearchBrowseApplyStep && searchTutorialPhase === 'draft') {
      findVisibleButtonByText(step.applyAnchorMatchText)?.click();
      return;
    }

    if (isExportCompletionStep && exportTutorialPhase === 'closed') {
      findVisibleButtonByText(step.closedAnchorMatchText)?.click();
      return;
    }

    if (isExportCompletionStep && exportTutorialPhase === 'menu-open') {
      setExportTutorialPhase('complete');
      return;
    }

    if (isExportComplete) {
      onClose?.();
      return;
    }

    if (isExploreNavigationStep && hasReachedExplore && workspaceMode === 'explore') {
      onOpenExplore?.();
      onContinue?.();
      return;
    }

    onContinue?.();
  };

  if (isMinimized) {
    return (
      <aside
        ref={(element) => {
          dialogRef.current = element;
          panelRef.current = element;
        }}
        className="peridot-tutorial-minimized"
        role="dialog"
        aria-label={`Tutorial minimized during ${displayTitle}`}
      >
        <button
          type="button"
          className="peridot-tutorial-minimized-restore"
          onClick={() => setIsMinimized(false)}
          aria-label={`Restore tutorial at ${displayTitle}`}
          title={`Restore tutorial: ${displayTitle}`}
        >
          <span className="peridot-tutorial-minimized-mark" aria-hidden="true">◆</span>
          <span>Tutorial</span>
        </button>
        <button
          type="button"
          className="peridot-tutorial-minimized-close"
          onClick={onClose}
          aria-label="Close tutorial"
          title="Close tutorial"
        >
          ×
        </button>
      </aside>
    );
  }

  return (
    <aside
      ref={(element) => {
        dialogRef.current = element;
        panelRef.current = element;
      }}
      style={panelStyle}
      className="peridot-tutorial-callout"
      role="dialog"
      aria-modal="false"
      aria-labelledby="peridot-tutorial-heading"
      aria-describedby="peridot-tutorial-description peridot-tutorial-status"
      data-peridot-tutorial-step={step.id}
      data-peridot-tutorial-dialogue-frame={dialogueFrameIndex}
      data-peridot-tutorial-anchor-available={isAnchorAvailable ? 'true' : 'false'}
      data-peridot-tutorial-interaction-complete={hasCompletedInteraction ? 'true' : 'false'}
      data-peridot-tutorial-inspector-presentation={isInspectorStep ? inspectorPresentationMode : undefined}
      data-peridot-tutorial-navigation-state={
        isExploreNavigationStep
          ? isInspectorOpenDuringExplore
            ? 'inspector-open'
            : hasReachedExplore
              ? 'reached'
              : isMainMenuOpen
                ? 'menu-open'
                : 'menu-closed'
          : undefined
      }
      data-peridot-tutorial-search-phase={isSearchBrowseApplyStep ? searchTutorialPhase : undefined}
      data-peridot-tutorial-concept={isWorkingSetExplanationStep ? 'working-set' : undefined}
      data-peridot-tutorial-export-phase={isExportCompletionStep ? exportTutorialPhase : undefined}
      data-peridot-tutorial-interrupted={isWorkspaceMismatch ? 'true' : 'false'}
      data-peridot-tutorial-capability-unavailable={isCapabilityUnavailable ? 'true' : 'false'}
      tabIndex={-1}
    >
      <header className="peridot-tutorial-header">
        <div
          className="peridot-tutorial-title-drag"
          {...dragHandleProps}
          aria-label="Move tutorial panel with pointer dragging or arrow keys"
        >
          <h2 id="peridot-tutorial-heading">{displayTitle}</h2>
        </div>

        <div className="peridot-tutorial-window-controls">
          <button
            type="button"
            className="peridot-tutorial-window-button"
            onClick={() => setIsMinimized(true)}
            aria-label="Minimize tutorial"
            title="Minimize tutorial"
          >
            −
          </button>
          <button
            type="button"
            className="peridot-tutorial-window-button is-close"
            onClick={onClose}
            aria-label="Close tutorial and return focus to where the tutorial started"
            title="Close tutorial"
          >
            ×
          </button>
        </div>
      </header>

      <div className="peridot-tutorial-divider" aria-hidden="true">
        <img
          src={tutorialFiligreeDivider}
          alt=""
          className="peridot-tutorial-divider-image"
          draggable="false"
        />
      </div>

      <div className="peridot-tutorial-dialogue" key={`${step.id}:${dialogueFrameIndex}:${currentSentence}`}>
        <p id="peridot-tutorial-description">{renderTutorialSentence(currentSentence)}</p>
      </div>

      <div
        id="peridot-tutorial-status"
        className="peridot-tutorial-sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {`Tutorial step ${step.number} of ${PERIDOT_TUTORIAL_TOTAL_STEPS}: ${displayTitle}. ${currentSentence}`}
      </div>

      {!isDialogueIntro && !isWorkspaceMismatch && !isCapabilityUnavailable && isInspectorStep && isCompactInspectorOpen ? (
        <button
          type="button"
          className="peridot-tutorial-inline-action"
          onClick={onExpandInspector}
        >
          Expand Inspector
        </button>
      ) : null}

      {!isDialogueIntro && !isWorkspaceMismatch && !isCapabilityUnavailable && isExploreNavigationStep && isInspectorOpenDuringExplore ? (
        <button
          type="button"
          className="peridot-tutorial-inline-action"
          onClick={onCloseInspector}
        >
          {step.inspectorCloseLabel || 'Close Inspector'}
        </button>
      ) : null}

      {!isDialogueIntro && !isWorkspaceMismatch && !isCapabilityUnavailable && isExploreNavigationStep && !isInspectorOpenDuringExplore && !hasReachedExplore && !isMainMenuOpen ? (
        <button
          type="button"
          className="peridot-tutorial-inline-action"
          onClick={onOpenMainMenu}
        >
          Open main menu
        </button>
      ) : null}

      {!isDialogueIntro && !isWorkspaceMismatch && !isCapabilityUnavailable && isSearchBrowseApplyStep && searchTutorialPhase === 'browse' ? (
        <button
          type="button"
          className="peridot-tutorial-inline-action"
          onClick={() => findVisibleButtonByText(step.browseAnchorMatchText)?.click()}
        >
          {step.openBrowseLabel || 'Open Browse'}
        </button>
      ) : null}

      {!isDialogueIntro && !isWorkspaceMismatch && !isCapabilityUnavailable && isWorkingSetExplanationStep ? (
        <div
          className="peridot-tutorial-working-set-flow"
          aria-label={`${step.flowStart}, then ${step.flowMiddle}, then ${step.flowEnd}`}
        >
          <div className="peridot-tutorial-working-set-node">
            <span className="peridot-tutorial-working-set-number" aria-hidden="true">1</span>
            <strong>{step.flowStart}</strong>
          </div>
          <div className="peridot-tutorial-working-set-arrow" aria-hidden="true">↓</div>
          <div className="peridot-tutorial-working-set-node is-applied">
            <span className="peridot-tutorial-working-set-number" aria-hidden="true">2</span>
            <strong>{step.flowMiddle}</strong>
          </div>
          <div className="peridot-tutorial-working-set-arrow" aria-hidden="true">↓</div>
          <div className="peridot-tutorial-working-set-node is-tools">
            <span className="peridot-tutorial-working-set-number" aria-hidden="true">3</span>
            <strong>{step.flowEnd}</strong>
          </div>
        </div>
      ) : null}

      {!isDialogueIntro && !isWorkspaceMismatch && !isCapabilityUnavailable && isExportCompletionStep && exportTutorialPhase === 'closed' ? (
        <button
          type="button"
          className="peridot-tutorial-inline-action"
          onClick={() => findVisibleButtonByText(step.closedAnchorMatchText)?.click()}
        >
          Open Export
        </button>
      ) : null}

      {isExportComplete ? (
        <div className="peridot-tutorial-completion">
          <div className="peridot-tutorial-completion-grid" aria-label="Peridot tutorial workflow summary">
            {[
              'Load records',
              'Choose a view',
              'Explore time',
              'Inspect evidence',
              'Search the collection',
              'Save a result',
            ].map((label, index) => (
              <div key={label} className="peridot-tutorial-completion-item">
                <span aria-hidden="true">{index + 1}</span>
                <strong>{label}</strong>
              </div>
            ))}
          </div>
          <div className="peridot-tutorial-completion-actions">
            <button type="button" className="peridot-tutorial-button is-primary" onClick={onClose}>
              Continue exploring
            </button>
            <button type="button" className="peridot-tutorial-button is-secondary" onClick={onRestartTutorial}>
              Restart tutorial
            </button>
            <button type="button" className="peridot-tutorial-button is-secondary" onClick={onOpenData}>
              Upload my data
            </button>
          </div>
        </div>
      ) : null}

      {showTimelineUnavailable ? (
        <p className="peridot-tutorial-anchor-fallback" role="status">
          {timelineAvailability.reason}
        </p>
      ) : null}

      {showGenericAnchorFallback ? (
        <p className="peridot-tutorial-anchor-fallback" role="status">
          The related control is unavailable in this view, so the guide remains in a safe screen position.
        </p>
      ) : null}

      {!isExportComplete ? (
        <footer className="peridot-tutorial-actions">
          <button
            type="button"
            className="peridot-tutorial-button is-secondary"
            onClick={handleBackAction}
            disabled={!canGoBack && dialogueFrameIndex === 0}
            aria-label={
              dialogueFrameIndex > 0
                ? 'Back to the previous tutorial sentence'
                : `Back to tutorial step ${Math.max(1, step.number - 1)}`
            }
          >
            Back
          </button>

          <p className="peridot-tutorial-progress">
            {step.number} / {PERIDOT_TUTORIAL_TOTAL_STEPS}
          </p>

          <button
            ref={primaryButtonRef}
            type="button"
            className="peridot-tutorial-button is-primary"
            aria-label={`${primaryLabel}. Tutorial step ${step.number} of ${PERIDOT_TUTORIAL_TOTAL_STEPS}.`}
            onClick={handlePrimaryAction}
          >
            {primaryLabel}
          </button>
        </footer>
      ) : (
        <p className="peridot-tutorial-progress is-complete">Tour complete</p>
      )}
    </aside>
  );
}
