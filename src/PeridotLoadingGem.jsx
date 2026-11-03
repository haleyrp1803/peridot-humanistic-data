/*
 * Peridot loading emblem lifecycle boundary.
 * React owns the canvas DOM node; the worker owns its OffscreenCanvas context.
 * A transferred canvas is never re-used for a fallback. Failure instead causes
 * React to mount a fresh canvas using a different key.
 *
 * Worker setup is deferred one browser task so React StrictMode's synchronous
 * development effect setup/cleanup replay cannot transfer the same node twice.
 * The active prop pauses or restarts the existing worker without unmounting
 * its Canvas. Mapping, Timeline, and app transition state remain untouched.
 */
import React, { useEffect, useRef, useState } from 'react';
import { createGemRenderer, PALETTES } from './PeridotLoadingGemRenderer.js';
import './PeridotLoadingGem.css';

export const DEFAULT_PERIDOT_LOADER_THEME = 'forest';

export function PeridotLoadingGem({ theme = DEFAULT_PERIDOT_LOADER_THEME, active = true }) {
  const selectedTheme = Object.prototype.hasOwnProperty.call(PALETTES, theme)
    ? theme : DEFAULT_PERIDOT_LOADER_THEME;
  const canvasRef = useRef(null);
  const workerRef = useRef(null);
  const fallbackRef = useRef(null);
  const themeRef = useRef(selectedTheme);
  const activeRef = useRef(active);
  themeRef.current = selectedTheme;
  activeRef.current = active;
  const [canvasVersion, setCanvasVersion] = useState(0);
  const [disableWorker, setDisableWorker] = useState(false);

  // Palette updates do not retrigger the one-way OffscreenCanvas transfer.
  useEffect(() => {
    workerRef.current?.postMessage({ type: 'theme', theme: selectedTheme });
    if (fallbackRef.current) {
      fallbackRef.current.renderer = createGemRenderer(fallbackRef.current.context, selectedTheme);
    }
  }, [selectedTheme]);

  // Do not restart the transferred Canvas when the overlay changes visibility.
  // A ready worker receives a resume/reset or pause command; before readiness,
  // activeRef provides the latest desired state to the initialization handshake.
  useEffect(() => {
    if (workerRef.current) {
      workerRef.current.postMessage({ type: 'active', active });
    } else if (fallbackRef.current) {
      if (active) fallbackRef.current.resume();
      else fallbackRef.current.pause();
    }
  }, [active]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    let active = true;
    let worker = null;
    let animationFrame = 0;
    let startupTimer = 0;
    let readyTimer = 0;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const workerSupported = !disableWorker && typeof Worker !== 'undefined'
      && typeof canvas.transferControlToOffscreen === 'function';

    const motionChanged = () => {
      if (worker) worker.postMessage({ type: 'motion', reducedMotion: media.matches });
      else if (fallbackDraw) {
        window.cancelAnimationFrame(animationFrame);
        fallbackDraw(window.performance.now(), true);
      }
    };
    const visibilityChanged = () => {
      if (worker) worker.postMessage({ type: 'visibility', hidden: document.hidden });
    };
    let fallbackDraw = null;

    function beginFallback() {
      if (!active) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      fallbackRef.current = { context: ctx, renderer: createGemRenderer(ctx, themeRef.current) };
      let elapsed = 0;
      let lastFrame = null;
      let frameCount = 0;
      let longestGap = 0;
      let initialFrameDispatched = false;
      fallbackDraw = (now, reset = false) => {
        if (!active || !activeRef.current) return;
        if (reset) { lastFrame = null; elapsed = 0; }
        if (lastFrame !== null) {
          const gap = now - lastFrame;
          longestGap = Math.max(longestGap, gap);
          elapsed += Math.min(gap / 1000, .07);
        }
        lastFrame = now;
        frameCount += 1;
        fallbackRef.current?.renderer(elapsed, media.matches);
        if (!initialFrameDispatched) {
          initialFrameDispatched = true;
          window.dispatchEvent(new Event('peridot:loader-first-frame'));
        }
        if (!media.matches && activeRef.current) {
          animationFrame = window.requestAnimationFrame(fallbackDraw);
        }
      };
      fallbackRef.current.resume = () => {
        window.cancelAnimationFrame(animationFrame);
        fallbackDraw(window.performance.now(), true);
      };
      fallbackRef.current.pause = () => {
        window.cancelAnimationFrame(animationFrame);
        animationFrame = 0;
      };
      if (activeRef.current) fallbackRef.current.resume();
      // The legacy main-thread renderer can still stall; retain its telemetry.
      return () => {
        if (import.meta.env.DEV && frameCount > 1 && longestGap >= 100) {
          console.info('[Peridot loader frames]', {
            frames: frameCount,
            longestFrameGapMs: Math.round(longestGap),
            likelyMainThreadStall: true,
            renderingMode: 'main-thread fallback',
          });
        }
      };
    }

    let finishFallback = null;
    function abandonWorker(reason) {
      if (!active || !workerSupported) return;
      window.clearTimeout(readyTimer);
      if (worker) worker.terminate();
      worker = null;
      workerRef.current = null;
      if (import.meta.env.DEV) {
        console.warn('[Peridot loader] Worker unavailable; using main-thread fallback.', reason);
      }
      // React replaces the transferred canvas. Never call getContext on it.
      setDisableWorker(true);
      setCanvasVersion(version => version + 1);
    }

    media.addEventListener?.('change', motionChanged);
    document.addEventListener('visibilitychange', visibilityChanged);

    startupTimer = window.setTimeout(() => {
      if (!active) return;
      if (!workerSupported) {
        finishFallback = beginFallback();
        return;
      }
      try {
        worker = new Worker(new URL('./PeridotLoadingGem.worker.js', import.meta.url), {
          type: 'module',
        });
        workerRef.current = worker;
        worker.onerror = (event) => {
          event.preventDefault?.();
          abandonWorker(event.message || 'Worker script error');
        };
        worker.onmessageerror = () => abandonWorker('Worker message error');
        worker.onmessage = ({ data }) => {
          if (!active) return;
          if (data?.type === 'first-frame') {
            window.dispatchEvent(new Event('peridot:loader-first-frame'));
          } else if (data?.type === 'ready') {
            window.clearTimeout(readyTimer);
            worker.postMessage({ type: 'theme', theme: themeRef.current });
            worker.postMessage({ type: 'active', active: activeRef.current });
          } else if (data?.type === 'error') {
            abandonWorker(data.message || 'Worker renderer error');
          }
        };
        const offscreen = canvas.transferControlToOffscreen();
        worker.postMessage({
          type: 'init', canvas: offscreen, theme: themeRef.current,
          reducedMotion: media.matches, hidden: document.hidden,
          active: activeRef.current,
        }, [offscreen]);
        // An unresponsive worker must not strand a blank canvas indefinitely.
        readyTimer = window.setTimeout(() => abandonWorker('Initialization timeout'), 2500);
      } catch (error) {
        abandonWorker(error?.message || String(error));
      }
    }, 0);

    return () => {
      active = false;
      window.clearTimeout(startupTimer);
      window.clearTimeout(readyTimer);
      window.cancelAnimationFrame(animationFrame);
      media.removeEventListener?.('change', motionChanged);
      document.removeEventListener('visibilitychange', visibilityChanged);
      if (finishFallback) finishFallback();
      fallbackRef.current = null;
      if (worker) worker.terminate();
      workerRef.current = null;
    };
  }, [canvasVersion, disableWorker]);

  return (
    <canvas key={canvasVersion} ref={canvasRef} width={800} height={800}
      className="peridot-loading-gem" aria-hidden="true" />
  );
}
