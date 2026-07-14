/*
 * Shared drag, anchor, and target-highlight behavior for tutorial surfaces.
 *
 * Pointer dragging is constrained to the visible browser viewport. The drag
 * handle also supports arrow-key movement. When an anchor selector is supplied,
 * the panel starts near that element and falls back to a safe viewport position
 * when the target is unavailable. A step may resolve a small control to its
 * nearest semantic container, such as the Visualizations header, before
 * positioning and highlighting it.
 */

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

const KEYBOARD_DRAG_STEP = 18;
const VIEWPORT_MARGIN = 20;
const ANCHOR_GAP = 18;
const TUTORIAL_HIGHLIGHT_CLASS = 'peridot-tutorial-target-highlight';

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function getFallbackPosition(panelRect, placement) {
  const maxLeft = Math.max(VIEWPORT_MARGIN, window.innerWidth - panelRect.width - VIEWPORT_MARGIN);
  const maxTop = Math.max(VIEWPORT_MARGIN, window.innerHeight - panelRect.height - VIEWPORT_MARGIN);

  if (placement === 'top-left') return { left: VIEWPORT_MARGIN, top: VIEWPORT_MARGIN };
  if (placement === 'top-right') return { left: maxLeft, top: VIEWPORT_MARGIN };
  if (placement === 'center-left') return { left: VIEWPORT_MARGIN, top: (window.innerHeight - panelRect.height) / 2 };
  if (placement === 'center-right') return { left: maxLeft, top: (window.innerHeight - panelRect.height) / 2 };
  if (placement === 'bottom-left') return { left: VIEWPORT_MARGIN, top: maxTop };
  return { left: maxLeft, top: maxTop };
}

function getAnchoredPosition(anchorRect, panelRect, placement) {
  const rightOfAnchor = anchorRect.right + ANCHOR_GAP;
  const leftOfAnchor = anchorRect.left - panelRect.width - ANCHOR_GAP;
  const alignedRight = anchorRect.right - panelRect.width;
  const centeredTop = anchorRect.top + (anchorRect.height - panelRect.height) / 2;

  const candidates = {
    'top-left': { left: anchorRect.left, top: anchorRect.top - panelRect.height - ANCHOR_GAP },
    'top-right': { left: alignedRight, top: anchorRect.top - panelRect.height - ANCHOR_GAP },
    'center-left': { left: leftOfAnchor, top: centeredTop },
    'center-right': { left: rightOfAnchor, top: centeredTop },
    'bottom-left': { left: anchorRect.left, top: anchorRect.bottom + ANCHOR_GAP },
    'bottom-right': { left: alignedRight, top: anchorRect.bottom + ANCHOR_GAP },
  };

  const requested = candidates[placement] || candidates['bottom-right'];
  return {
    left: clamp(requested.left, VIEWPORT_MARGIN, Math.max(VIEWPORT_MARGIN, window.innerWidth - panelRect.width - VIEWPORT_MARGIN)),
    top: clamp(requested.top, VIEWPORT_MARGIN, Math.max(VIEWPORT_MARGIN, window.innerHeight - panelRect.height - VIEWPORT_MARGIN)),
  };
}

function normalizeAnchorText(value) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function isRenderedAnchorCandidate(element) {
  if (!element || typeof window === 'undefined') return false;

  const rect = element.getBoundingClientRect();
  if (!rect.width || !rect.height) return false;

  const style = window.getComputedStyle(element);
  return style.display !== 'none'
    && style.visibility !== 'hidden'
    && style.opacity !== '0'
    && !element.hidden
    && element.getAttribute('aria-hidden') !== 'true';
}

function getAnchorCandidateText(element) {
  if (!element) return '';

  return normalizeAnchorText([
    element.getAttribute('aria-label'),
    element.getAttribute('title'),
    element.innerText,
    element.textContent,
  ].filter(Boolean).join(' '));
}

function resolveTextAncestor(element, ancestorText, minWidthRatio = 0) {
  const normalizedNeedle = normalizeAnchorText(ancestorText);
  if (!element || !normalizedNeedle || typeof window === 'undefined') return null;

  let current = element;
  while (current && current !== document.body) {
    const normalizedText = normalizeAnchorText(current.innerText || current.textContent);
    const rect = current.getBoundingClientRect();
    const meetsWidth = !minWidthRatio || rect.width >= window.innerWidth * minWidthRatio;

    if (
      normalizedText.includes(normalizedNeedle)
      && meetsWidth
      && isRenderedAnchorCandidate(current)
    ) {
      return current;
    }
    current = current.parentElement;
  }

  return null;
}

function resolveAnchorElement({
  anchorSelector,
  anchorMatchText,
  anchorClosestSelector,
  anchorAncestorText,
  anchorAncestorMinWidthRatio,
}) {
  if (!anchorSelector || typeof document === 'undefined') return null;

  const normalizedMatchText = normalizeAnchorText(anchorMatchText);
  const candidates = Array.from(document.querySelectorAll(anchorSelector))
    .filter(isRenderedAnchorCandidate);

  const matchedElement = normalizedMatchText
    ? candidates.find((candidate) => getAnchorCandidateText(candidate).includes(normalizedMatchText))
    : candidates[0];

  if (!matchedElement) return null;

  if (anchorClosestSelector) {
    const closestElement = matchedElement.closest(anchorClosestSelector);
    if (closestElement && isRenderedAnchorCandidate(closestElement)) return closestElement;
  }

  if (anchorAncestorText) {
    const textAncestor = resolveTextAncestor(
      matchedElement,
      anchorAncestorText,
      anchorAncestorMinWidthRatio,
    );
    if (textAncestor) return textAncestor;
  }

  return matchedElement;
}

export function useDraggableTutorialPanel({
  anchorSelector = '',
  anchorMatchText = '',
  anchorClosestSelector = '',
  anchorAncestorText = '',
  anchorAncestorMinWidthRatio = 0,
  anchorPlacement = 'bottom-right',
  highlightAnchor = false,
  describedById = '',
  resetKey = '',
} = {}) {
  const panelRef = useRef(null);
  const dragStateRef = useRef(null);
  const hasManualPositionRef = useRef(false);
  const highlightedElementRef = useRef(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [anchorPosition, setAnchorPosition] = useState({ left: null, top: null });
  const [anchorElement, setAnchorElement] = useState(null);

  const clearAnchorDecoration = useCallback(() => {
    if (typeof document === 'undefined') return;

    document.querySelectorAll(`.${TUTORIAL_HIGHLIGHT_CLASS}`).forEach((element) => {
      element.classList.remove(TUTORIAL_HIGHLIGHT_CLASS);
      if (describedById && element.getAttribute('aria-describedby') === describedById) {
        element.removeAttribute('aria-describedby');
      }
    });
    highlightedElementRef.current = null;
  }, [describedById]);

  const decorateAnchor = useCallback((element) => {
    clearAnchorDecoration();
    if (!element || !highlightAnchor) return;

    element.classList.add(TUTORIAL_HIGHLIGHT_CLASS);
    if (describedById) element.setAttribute('aria-describedby', describedById);
    highlightedElementRef.current = element;
  }, [clearAnchorDecoration, describedById, highlightAnchor]);

  const positionPanel = useCallback(() => {
    if (typeof window === 'undefined') return;

    const panel = panelRef.current;
    if (!panel) return;

    const resolvedAnchor = resolveAnchorElement({
      anchorSelector,
      anchorMatchText,
      anchorClosestSelector,
      anchorAncestorText,
      anchorAncestorMinWidthRatio,
    });
    setAnchorElement(resolvedAnchor);
    decorateAnchor(resolvedAnchor);

    const panelRect = panel.getBoundingClientRect();
    const nextPosition = resolvedAnchor
      ? getAnchoredPosition(resolvedAnchor.getBoundingClientRect(), panelRect, anchorPlacement)
      : getFallbackPosition(panelRect, anchorPlacement);

    setAnchorPosition(nextPosition);
  }, [
    anchorAncestorMinWidthRatio,
    anchorAncestorText,
    anchorClosestSelector,
    anchorMatchText,
    anchorPlacement,
    anchorSelector,
    decorateAnchor,
  ]);

  useLayoutEffect(() => {
    hasManualPositionRef.current = false;
    setOffset({ x: 0, y: 0 });
    positionPanel();
  }, [positionPanel, resetKey]);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return undefined;

    let frameId = null;
    const schedulePositionUpdate = () => {
      if (frameId) window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(() => {
        frameId = null;
        if (!hasManualPositionRef.current) positionPanel();
      });
    };

    const observer = new MutationObserver(schedulePositionUpdate);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true });
    const handleVisibilityChange = () => {
      if (document.hidden) {
        clearAnchorDecoration();
        return;
      }
      schedulePositionUpdate();
    };
    const handlePageHide = () => clearAnchorDecoration();

    window.addEventListener('resize', schedulePositionUpdate);
    window.addEventListener('scroll', schedulePositionUpdate, true);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', handlePageHide);

    return () => {
      if (frameId) window.cancelAnimationFrame(frameId);
      observer.disconnect();
      window.removeEventListener('resize', schedulePositionUpdate);
      window.removeEventListener('scroll', schedulePositionUpdate, true);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handlePageHide);
      clearAnchorDecoration();
    };
  }, [clearAnchorDecoration, positionPanel]);

  useEffect(() => {
    const keepManuallyPositionedPanelVisible = () => {
      if (!hasManualPositionRef.current) return;

      const element = panelRef.current;
      if (!element) return;
      const rect = element.getBoundingClientRect();
      const correctionX = rect.left < VIEWPORT_MARGIN
        ? VIEWPORT_MARGIN - rect.left
        : rect.right > window.innerWidth - VIEWPORT_MARGIN
          ? window.innerWidth - VIEWPORT_MARGIN - rect.right
          : 0;
      const correctionY = rect.top < VIEWPORT_MARGIN
        ? VIEWPORT_MARGIN - rect.top
        : rect.bottom > window.innerHeight - VIEWPORT_MARGIN
          ? window.innerHeight - VIEWPORT_MARGIN - rect.bottom
          : 0;

      if (correctionX || correctionY) {
        setOffset((current) => ({ x: current.x + correctionX, y: current.y + correctionY }));
      }
    };

    window.addEventListener('resize', keepManuallyPositionedPanelVisible);
    return () => window.removeEventListener('resize', keepManuallyPositionedPanelVisible);
  }, []);

  const moveBy = useCallback((deltaX, deltaY) => {
    const element = panelRef.current;
    if (!element) return;

    const rect = element.getBoundingClientRect();
    const constrainedX = clamp(
      deltaX,
      VIEWPORT_MARGIN - rect.left,
      window.innerWidth - VIEWPORT_MARGIN - rect.right,
    );
    const constrainedY = clamp(
      deltaY,
      VIEWPORT_MARGIN - rect.top,
      window.innerHeight - VIEWPORT_MARGIN - rect.bottom,
    );

    hasManualPositionRef.current = true;
    setOffset((current) => ({
      x: current.x + constrainedX,
      y: current.y + constrainedY,
    }));
  }, []);

  const handlePointerDown = useCallback((event) => {
    if (event.button !== 0) return;

    dragStateRef.current = {
      pointerId: event.pointerId,
      lastClientX: event.clientX,
      lastClientY: event.clientY,
    };

    hasManualPositionRef.current = true;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    event.preventDefault();
  }, []);

  const handlePointerMove = useCallback((event) => {
    const dragState = dragStateRef.current;
    if (!dragState || dragState.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - dragState.lastClientX;
    const deltaY = event.clientY - dragState.lastClientY;
    dragState.lastClientX = event.clientX;
    dragState.lastClientY = event.clientY;
    moveBy(deltaX, deltaY);
  }, [moveBy]);

  const endPointerDrag = useCallback((event) => {
    const dragState = dragStateRef.current;
    if (!dragState || dragState.pointerId !== event.pointerId) return;
    dragStateRef.current = null;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
  }, []);

  const handleKeyDown = useCallback((event) => {
    const movements = {
      ArrowLeft: [-KEYBOARD_DRAG_STEP, 0],
      ArrowRight: [KEYBOARD_DRAG_STEP, 0],
      ArrowUp: [0, -KEYBOARD_DRAG_STEP],
      ArrowDown: [0, KEYBOARD_DRAG_STEP],
    };
    const movement = movements[event.key];
    if (!movement) return;

    event.preventDefault();
    moveBy(movement[0], movement[1]);
  }, [moveBy]);

  return {
    panelRef,
    panelStyle: {
      '--peridot-tutorial-anchor-left': anchorPosition.left === null ? 'auto' : `${anchorPosition.left}px`,
      '--peridot-tutorial-anchor-top': anchorPosition.top === null ? 'auto' : `${anchorPosition.top}px`,
      '--peridot-tutorial-drag-x': `${offset.x}px`,
      '--peridot-tutorial-drag-y': `${offset.y}px`,
    },
    anchorElement,
    isAnchorAvailable: Boolean(anchorElement),
    dragHandleProps: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: endPointerDrag,
      onPointerCancel: endPointerDrag,
      onKeyDown: handleKeyDown,
      tabIndex: 0,
      role: 'button',
      'aria-label': 'Drag tutorial box. Use arrow keys to reposition it.',
      title: 'Drag to move this tutorial box',
    },
  };
}
