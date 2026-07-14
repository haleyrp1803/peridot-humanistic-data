/*
 * Peridot guided-tutorial callout.
 *
 * The component is deliberately presentation-focused. App.jsx owns session
 * progression and workspace routing; the ordered copy and anchor metadata live
 * in `peridotTutorialConfig.js`.
 */

import React, { useEffect, useRef } from 'react';

import { PERIDOT_TUTORIAL_TOTAL_STEPS } from './peridotTutorialConfig.js';
import { useDraggableTutorialPanel } from './useDraggableTutorialPanel.js';

export function PeridotTutorial({
  step,
  canGoBack = true,
  isLastStep = false,
  onBack,
  onClose,
  onContinue,
}) {
  const dialogRef = useRef(null);
  const {
    panelRef,
    panelStyle,
    dragHandleProps,
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

  useEffect(() => {
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

  if (!step) return null;

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

      {!isAnchorAvailable && step.anchorSelector ? (
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
          {isLastStep ? 'Finish tutorial' : 'Next'}
        </button>
      </div>
    </aside>
  );
}
