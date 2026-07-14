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

export function PeridotTutorial({
  step,
  canGoBack = true,
  isLastStep = false,
  inspectorSelection = null,
  inspectorPresentationMode = 'closed',
  workspaceMode = '',
  isMainMenuOpen = false,
  onOpenMainMenu,
  onOpenExplore,
  onCloseInspector,
  onExpandInspector,
  onBack,
  onClose,
  onContinue,
}) {
  const dialogRef = useRef(null);
  const [hasCompletedInteraction, setHasCompletedInteraction] = useState(false);
  const [searchTutorialPhase, setSearchTutorialPhase] = useState('browse');
  const isInspectorStep = step?.interactionType === 'inspector';
  const isExploreNavigationStep = step?.interactionType === 'explore-navigation';
  const isSearchBrowseApplyStep = step?.interactionType === 'search-browse-apply';
  const isWorkingSetExplanationStep = step?.interactionType === 'working-set-explanation';
  const isInspectorOpenDuringExplore = isExploreNavigationStep
    && ['compact', 'workspace', 'empty-workspace'].includes(inspectorPresentationMode);
  const hasReachedExplore = isExploreNavigationStep
    && !isInspectorOpenDuringExplore
    && workspaceMode === 'search';
  const isCompactInspectorOpen = isInspectorStep
    && inspectorPresentationMode === 'compact'
    && Boolean(inspectorSelection);
  const isFullInspectorOpen = isInspectorStep
    && ['workspace', 'empty-workspace'].includes(inspectorPresentationMode)
    && Boolean(inspectorSelection);
  const hasActiveInspectorSelection = isCompactInspectorOpen || isFullInspectorOpen;

  const activeAnchorConfig = isSearchBrowseApplyStep
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
          selector: step?.reachedAnchorSelector,
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
    highlightAnchor: step?.highlightAnchor,
    describedById: 'peridot-tutorial-description',
    resetKey: `${step?.id}:${inspectorPresentationMode}:${hasActiveInspectorSelection ? 'selected' : 'unselected'}:${workspaceMode}:${isMainMenuOpen ? 'menu-open' : 'menu-closed'}`,
  });

  const isTimelineStep = step?.interactionType === 'timeline';
  const timelineAvailability = useMemo(
    () => (isTimelineStep ? getTimelineAvailability(anchorElement) : { available: true, reason: '' }),
    [anchorElement, isTimelineStep],
  );

  useEffect(() => {
    setHasCompletedInteraction(false);
    setSearchTutorialPhase('browse');
    dialogRef.current?.focus();
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
    if (!isTimelineStep || !anchorElement || !timelineAvailability.available) return undefined;

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
  }, [anchorElement, isTimelineStep, timelineAvailability.available]);

  useEffect(() => {
    if (!isSearchBrowseApplyStep) return undefined;

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
  }, [isSearchBrowseApplyStep]);

  if (!step) return null;

  const showGenericAnchorFallback = !isAnchorAvailable
    && activeAnchorConfig.selector
    && !isTimelineStep
    && !isInspectorStep
    && !isExploreNavigationStep
    && !isSearchBrowseApplyStep
    && !isWorkingSetExplanationStep;
  const showTimelineUnavailable = isTimelineStep && !timelineAvailability.available;
  const primaryLabel = isLastStep
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
      aria-describedby="peridot-tutorial-description"
      data-peridot-tutorial-step={step.id}
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
      tabIndex={-1}
    >
      <div className="peridot-tutorial-drag-handle" {...dragHandleProps}>
        <span className="peridot-tutorial-drag-grip" aria-hidden="true">••••</span>
        <span>Drag to move</span>
      </div>

      <button
        type="button"
        className="peridot-tutorial-close"
        onClick={onClose}
        aria-label="Close tutorial"
        title="Close tutorial"
      >
        ×
      </button>

      <p className="peridot-tutorial-progress">
        Step {step.number} of {PERIDOT_TUTORIAL_TOTAL_STEPS}
      </p>
      <h2 id="peridot-tutorial-heading">{step.title}</h2>
      <p id="peridot-tutorial-description">{step.description}</p>
      {step.note ? <p className="peridot-tutorial-note">{step.note}</p> : null}

      {isTimelineStep && timelineAvailability.available && !hasCompletedInteraction ? (
        <p className="peridot-tutorial-interaction-prompt">
          {step.interactionPrompt}
        </p>
      ) : null}

      {isTimelineStep && hasCompletedInteraction ? (
        <p className="peridot-tutorial-interaction-status" role="status">
          <span aria-hidden="true">✓</span>
          {step.interactionCompleteText}
        </p>
      ) : null}

      {isInspectorStep && !hasActiveInspectorSelection ? (
        <p className="peridot-tutorial-interaction-prompt">
          {step.interactionPrompt}
        </p>
      ) : null}

      {isInspectorStep && isCompactInspectorOpen ? (
        <>
          <p className="peridot-tutorial-interaction-status" role="status">
            <span aria-hidden="true">✓</span>
            {step.interactionCompleteText}
          </p>
          <button
            type="button"
            className="peridot-tutorial-inline-action"
            onClick={onExpandInspector}
          >
            Expand Inspector
          </button>
        </>
      ) : null}

      {isInspectorStep && isFullInspectorOpen ? (
        <p className="peridot-tutorial-interaction-status" role="status">
          <span aria-hidden="true">✓</span>
          {step.expandedText}
        </p>
      ) : null}

      {isExploreNavigationStep && isInspectorOpenDuringExplore ? (
        <>
          <p className="peridot-tutorial-interaction-prompt">
            {step.inspectorPrompt}
          </p>
          <button
            type="button"
            className="peridot-tutorial-inline-action"
            onClick={onCloseInspector}
          >
            {step.inspectorCloseLabel || 'Close Inspector'}
          </button>
        </>
      ) : null}

      {isExploreNavigationStep && !isInspectorOpenDuringExplore && !hasReachedExplore ? (
        <>
          <p className="peridot-tutorial-interaction-prompt">
            {isMainMenuOpen ? step.menuOpenPrompt : step.menuClosedPrompt}
          </p>
          {!isMainMenuOpen ? (
            <button
              type="button"
              className="peridot-tutorial-inline-action"
              onClick={onOpenMainMenu}
            >
              Open main menu
            </button>
          ) : null}
        </>
      ) : null}

      {isExploreNavigationStep && hasReachedExplore ? (
        <p className="peridot-tutorial-interaction-status" role="status">
          <span aria-hidden="true">✓</span>
          {step.reachedText}
        </p>
      ) : null}

      {isSearchBrowseApplyStep && searchTutorialPhase === 'browse' ? (
        <>
          <p className="peridot-tutorial-interaction-prompt">{step.browsePrompt}</p>
          <button
            type="button"
            className="peridot-tutorial-inline-action"
            onClick={() => findVisibleButtonByText(step.browseAnchorMatchText)?.click()}
          >
            {step.openBrowseLabel || 'Open Browse'}
          </button>
        </>
      ) : null}

      {isSearchBrowseApplyStep && searchTutorialPhase === 'draft' ? (
        <p className="peridot-tutorial-interaction-prompt">{step.draftPrompt}</p>
      ) : null}

      {isSearchBrowseApplyStep && searchTutorialPhase === 'applied' ? (
        <p className="peridot-tutorial-interaction-status" role="status">
          <span aria-hidden="true">✓</span>
          {step.appliedText}
        </p>
      ) : null}

      {isWorkingSetExplanationStep ? (
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

      {showTimelineUnavailable ? (
        <p className="peridot-tutorial-anchor-fallback" role="status">
          {timelineAvailability.reason}
        </p>
      ) : null}

      {showGenericAnchorFallback ? (
        <p className="peridot-tutorial-anchor-fallback" role="status">
          The related control is not available in this view, so this guide remains in a safe screen position.
        </p>
      ) : null}

      <div className="peridot-tutorial-actions">
        <button
          type="button"
          className="peridot-tutorial-button is-secondary"
          onClick={onBack}
          disabled={!canGoBack}
        >
          Back
        </button>
        <button type="button" className="peridot-tutorial-button is-quiet" onClick={onClose}>
          End tutorial
        </button>
        <button
          type="button"
          className="peridot-tutorial-button is-primary"
          onClick={
            isExploreNavigationStep && isInspectorOpenDuringExplore
              ? onCloseInspector
              : isExploreNavigationStep && !hasReachedExplore
                ? onOpenExplore
                : isSearchBrowseApplyStep && searchTutorialPhase === 'browse'
                  ? () => {
                      setSearchTutorialPhase('applied');
                      setHasCompletedInteraction(true);
                    }
                  : isSearchBrowseApplyStep && searchTutorialPhase === 'draft'
                    ? () => findVisibleButtonByText(step.applyAnchorMatchText)?.click()
                    : onContinue
          }
        >
          {primaryLabel}
        </button>
      </div>
    </aside>
  );
}
