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

export function PeridotTutorial({
  step,
  canGoBack = true,
  isLastStep = false,
  onBack,
  onClose,
  onContinue,
}) {
  const dialogRef = useRef(null);
  const [hasCompletedInteraction, setHasCompletedInteraction] = useState(false);
  const {
    panelRef,
    panelStyle,
    dragHandleProps,
    anchorElement,
    isAnchorAvailable,
  } = useDraggableTutorialPanel({
    anchorSelector: step?.anchorSelector,
    anchorClosestSelector: step?.anchorClosestSelector,
    anchorAncestorText: step?.anchorAncestorText,
    anchorAncestorMinWidthRatio: step?.anchorAncestorMinWidthRatio,
    anchorPlacement: step?.anchorPlacement,
    highlightAnchor: step?.highlightAnchor,
    describedById: 'peridot-tutorial-description',
    resetKey: step?.id,
  });

  const isTimelineStep = step?.interactionType === 'timeline';
  const timelineAvailability = useMemo(
    () => (isTimelineStep ? getTimelineAvailability(anchorElement) : { available: true, reason: '' }),
    [anchorElement, isTimelineStep],
  );

  useEffect(() => {
    setHasCompletedInteraction(false);
    dialogRef.current?.focus();
  }, [step?.id]);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      onClose?.();
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

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

  if (!step) return null;

  const showGenericAnchorFallback = !isAnchorAvailable
    && step.anchorSelector
    && !isTimelineStep;
  const showTimelineUnavailable = isTimelineStep && !timelineAvailability.available;
  const primaryLabel = isLastStep
    ? 'Finish tutorial'
    : isTimelineStep && !hasCompletedInteraction && timelineAvailability.available
      ? step.skipLabel || 'Continue without changing it'
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
        <button type="button" className="peridot-tutorial-button is-primary" onClick={onContinue}>
          {primaryLabel}
        </button>
      </div>
    </aside>
  );
}
