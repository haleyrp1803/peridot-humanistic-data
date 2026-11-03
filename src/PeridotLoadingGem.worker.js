/*
 * OffscreenCanvas-owned Peridot loader animation.
 * No React, DOM mutation, mapping, or application-state dependencies.
 * Worker requestAnimationFrame is preferred for display-synchronized updates;
 * a timer is used only where worker requestAnimationFrame is unsupported.
 */
import { createGemRenderer, PALETTES } from './PeridotLoadingGemRenderer.js';

let renderer = null;
let context = null;
let active = false; // Playback state, not Canvas/worker lifetime.
let hidden = false;
let reducedMotion = false;
let elapsed = 0;
let firstFrameSent = false;
let lastFrame = null;
let scheduled = null;
const hasWorkerRAF = typeof self.requestAnimationFrame === 'function';

function cancelFrame() {
  if (scheduled === null) return;
  if (hasWorkerRAF) self.cancelAnimationFrame(scheduled);
  else clearTimeout(scheduled);
  scheduled = null;
}

function frame(timestamp) {
  scheduled = null;
  if (!active || !renderer || hidden) return;
  if (lastFrame !== null) elapsed += Math.min((timestamp - lastFrame) / 1000, .07);
  lastFrame = timestamp;
  try {
    renderer(elapsed, reducedMotion);
    if (!firstFrameSent) {
      firstFrameSent = true;
      self.postMessage({ type: 'first-frame' });
    }
  } catch (error) {
    active = false;
    cancelFrame();
    self.postMessage({ type: 'error', message: error?.message || String(error) });
    return;
  }
  if (!reducedMotion) scheduleFrame();
}

function scheduleFrame() {
  if (!active || hidden || scheduled !== null) return;
  if (hasWorkerRAF) scheduled = self.requestAnimationFrame(frame);
  else scheduled = setTimeout(() => frame(performance.now()), 1000 / 30);
}

function restart() {
  cancelFrame();
  lastFrame = null;
  if (active && !hidden) frame(performance.now());
}

self.onmessage = ({ data }) => {
  try {
    if (data?.type === 'init') {
      cancelFrame();
      const ctx = data.canvas.getContext('2d');
      context = ctx;
      if (!ctx) throw new Error('OffscreenCanvas 2D context unavailable');
      const theme = Object.prototype.hasOwnProperty.call(PALETTES, data.theme)
        ? data.theme : 'forest';
      renderer = createGemRenderer(ctx, theme);
      reducedMotion = !!data.reducedMotion;
      hidden = !!data.hidden;
      elapsed = 0;
      firstFrameSent = false;
      active = !!data.active;
      self.postMessage({ type: 'ready' });
      restart();
    } else if (data?.type === 'active' && renderer) {
      // Resume at animation time zero for each transition. When inactive,
      // release scheduled frames but retain the transferred Canvas and worker.
      const shouldRun = !!data.active;
      if (shouldRun && !active) {
        elapsed = 0;
        active = true;
        restart();
      } else if (!shouldRun && active) {
        active = false;
        cancelFrame();
        lastFrame = null;
      }
    } else if (data?.type === 'theme' && renderer) {
      const theme = Object.prototype.hasOwnProperty.call(PALETTES, data.theme)
        ? data.theme : 'forest';
      // A palette update replaces only the drawing closure, not the canvas.
      renderer = createGemRenderer(context, theme);
      restart();
    } else if (data?.type === 'motion') {
      reducedMotion = !!data.reducedMotion;
      restart();
    } else if (data?.type === 'visibility') {
      hidden = !!data.hidden;
      restart();
    } else if (data?.type === 'stop') {
      active = false;
      cancelFrame();
    }
  } catch (error) {
    active = false;
    cancelFrame();
    self.postMessage({ type: 'error', message: error?.message || String(error) });
  }
};
