/*
 * Shared drag and anchor behavior for tutorial surfaces.
 *
 * Pointer dragging is constrained to the visible browser viewport. The drag
 * handle also supports arrow-key movement. When an anchor selector is supplied,
 * the panel starts near that element and falls back to a safe viewport position
 * when the target is unavailable.
 */

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

const KEYBOARD_DRAG_STEP = 18;
const VIEWPORT_MARGIN = 20;
const ANCHOR_GAP = 18;

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
  const alignedBottom = anchorRect.bottom - panelRect.height;
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

export function useDraggableTutorialPanel({
  anchorSelector = '',
  anchorPlacement = 'bottom-right',
  resetKey = '',
} = {}) {
  const panelRef = useRef(null);
  const dragStateRef = useRef(null);
  const hasManualPositionRef = useRef(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [anchorPosition, setAnchorPosition] = useState({ left: null, top: null });

  const positionPanel = useCallback(() => {
    if (typeof window === 'undefined') return;

    const panel = panelRef.current;
    if (!panel) return;

    const panelRect = panel.getBoundingClientRect();
    const anchor = anchorSelector ? document.querySelector(anchorSelector) : null;
    const nextPosition = anchor
      ? getAnchoredPosition(anchor.getBoundingClientRect(), panelRect, anchorPlacement)
      : getFallbackPosition(panelRect, anchorPlacement);

    setAnchorPosition(nextPosition);
  }, [anchorPlacement, anchorSelector]);

  useLayoutEffect(() => {
    hasManualPositionRef.current = false;
    setOffset({ x: 0, y: 0 });
    positionPanel();
  }, [positionPanel, resetKey]);

  useEffect(() => {
    const handleViewportChange = () => {
      if (!hasManualPositionRef.current) {
        positionPanel();
        return;
      }

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

    window.addEventListener('resize', handleViewportChange);
    window.addEventListener('scroll', handleViewportChange, true);
    return () => {
      window.removeEventListener('resize', handleViewportChange);
      window.removeEventListener('scroll', handleViewportChange, true);
    };
  }, [positionPanel]);

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
      startClientX: event.clientX,
      startClientY: event.clientY,
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
    isAnchorAvailable: Boolean(anchorSelector && typeof document !== 'undefined' && document.querySelector(anchorSelector)),
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
