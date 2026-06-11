/*
 * Themes and Accessibility workspace.
 *
 * This component presents appearance-related settings, including map/interface
 * theme presets, the semantic site-wide palette switcher used for palette
 * experiments, and a role-based palette dashboard for broad creative control.
 *
 * Important relationships:
 * - Map style presets are still owned by `App.jsx` through `themeTuning`.
 * - Site-wide semantic palettes are owned by `peridotTheme.js` and persisted in
 *   localStorage so a full page reload can rehydrate every CSS variable and
 *   module-level visualization token from the selected palette.
 * - Human-facing role labels and usage descriptions live in
 *   `peridotThemeRoleMetadata.js`; actual color values remain in
 *   `peridotTheme.js`.
 *
 * Maintenance cautions:
 * - Keep appearance/accessibility settings grouped here rather than scattering
 *   them across visualization components.
 * - Palette switching intentionally reloads the app. Some visualization values
 *   are imported as module constants, so a reload is the safest way to test a
 *   palette consistently across interface and chart/map rendering.
 */

import React, { useMemo, useState } from 'react';
import {
  ACTIVE_PERIDOT_PALETTE_ID,
  PERIDOT_BASE_THEME,
  DEFAULT_PERIDOT_PALETTE_ID,
  PERIDOT_APP_THEME_DEFAULTS,
  PERIDOT_CUSTOM_THEME_OVERRIDES,
  PERIDOT_PALETTE_OPTIONS,
  PERIDOT_PALETTE_IMPORT_TARGETS,
  PERIDOT_THEME,
  buildPeridotPaletteImportOverrides,
  clearPeridotCustomThemeOverrides,
  resetActivePeridotPaletteId,
  setPeridotCustomThemeOverrides,
  setActivePeridotPaletteId,
} from './peridotTheme.js';
import { PERIDOT_THEME_ROLE_GROUPS } from './peridotThemeRoleMetadata.js';

function readThemePath(source, path) {
  return String(path || '')
    .split('.')
    .filter(Boolean)
    .reduce((current, key) => (current && Object.prototype.hasOwnProperty.call(current, key) ? current[key] : undefined), source);
}

function getColorPreviewItems(value) {
  if (Array.isArray(value)) {
    return value.map((item, index) => ({ id: `${index}-${item}`, value: item, label: String(index + 1) }));
  }
  if (typeof value === 'string') {
    return [{ id: value, value, label: '' }];
  }
  return [];
}

function isDisplayableColor(value) {
  const text = String(value || '').trim();
  return /^#[0-9a-fA-F]{6}$/.test(text) || /^rgba?\(/i.test(text) || text === 'transparent';
}

function ColorSwatch({ value, label }) {
  const color = String(value || '').trim();
  return (
    <span className="flex min-w-0 items-center gap-2">
      <span
        className="h-7 w-7 shrink-0 rounded-full border border-[var(--peridot-role-interface-border-subtle)] shadow-[0_5px_16px_var(--peridot-role-card-shadow)]"
        style={{ backgroundColor: isDisplayableColor(color) ? color : 'transparent' }}
        title={color}
        aria-hidden="true"
      />
      <span className="min-w-0 font-mono text-[0.72rem] font-semibold text-[var(--peridot-role-interface-text-muted-on-dark)]">
        {label ? `${label}: ` : ''}{color}
      </span>
    </span>
  );
}

function getEditableText(value) {
  if (Array.isArray(value)) return value.join('\n');
  return String(value ?? '');
}

function parseEditableText(text, previousValue) {
  if (Array.isArray(previousValue)) {
    return String(text || '')
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return String(text || '').trim();
}

function isHexColor(value) {
  return /^#[0-9a-fA-F]{6}$/.test(String(value || '').trim());
}

function deepClone(value) {
  if (Array.isArray(value)) return value.map((item) => deepClone(item));
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, deepClone(item)]));
  }
  return value;
}

function mergeObjects(baseValue, overrideValue) {
  if (Array.isArray(overrideValue)) return deepClone(overrideValue);
  if (!overrideValue || typeof overrideValue !== 'object') {
    return overrideValue === undefined ? deepClone(baseValue) : overrideValue;
  }
  const merged = baseValue && typeof baseValue === 'object' && !Array.isArray(baseValue) ? deepClone(baseValue) : {};
  Object.entries(overrideValue).forEach(([key, value]) => {
    merged[key] = mergeObjects(merged[key], value);
  });
  return merged;
}

function writeThemePath(source, path, value) {
  const keys = String(path || '').split('.').filter(Boolean);
  if (!keys.length) return source;
  const next = deepClone(source || {});
  let cursor = next;
  keys.forEach((key, index) => {
    if (index === keys.length - 1) {
      cursor[key] = value;
      return;
    }
    if (!cursor[key] || typeof cursor[key] !== 'object' || Array.isArray(cursor[key])) cursor[key] = {};
    cursor = cursor[key];
  });
  return next;
}

function removeThemePath(source, path) {
  const keys = String(path || '').split('.').filter(Boolean);
  if (!keys.length) return source;
  const next = deepClone(source || {});
  const parents = [];
  let cursor = next;
  for (const key of keys.slice(0, -1)) {
    if (!cursor[key] || typeof cursor[key] !== 'object' || Array.isArray(cursor[key])) return next;
    parents.push([cursor, key]);
    cursor = cursor[key];
  }
  delete cursor[keys[keys.length - 1]];
  for (let index = parents.length - 1; index >= 0; index -= 1) {
    const [parent, key] = parents[index];
    if (parent[key] && typeof parent[key] === 'object' && !Array.isArray(parent[key]) && !Object.keys(parent[key]).length) {
      delete parent[key];
    }
  }
  return next;
}

function countOverrideLeaves(value) {
  if (!value || typeof value !== 'object') return 0;
  if (Array.isArray(value)) return value.length ? 1 : 0;
  return Object.values(value).reduce((total, item) => total + countOverrideLeaves(item), 0);
}

function buildExportPayload(overrides) {
  return {
    peridotPaletteExportVersion: 1,
    activeBasePaletteId: ACTIVE_PERIDOT_PALETTE_ID,
    note: 'Paste the customThemeOverrides object into src/peridotTheme.js or import it through a future palette workflow.',
    customThemeOverrides: overrides,
  };
}


function normalizeImageHex({ r, g, b }) {
  return `#${[r, g, b].map((part) => Math.max(0, Math.min(255, Math.round(part))).toString(16).padStart(2, '0')).join('')}`;
}

function imageHexToRgb(hex) {
  const clean = String(hex || '').replace('#', '');
  return {
    r: parseInt(clean.slice(0, 2), 16) || 0,
    g: parseInt(clean.slice(2, 4), 16) || 0,
    b: parseInt(clean.slice(4, 6), 16) || 0,
  };
}

function imageColorDistance(hexA, hexB) {
  const a = imageHexToRgb(hexA);
  const b = imageHexToRgb(hexB);
  return Math.hypot(a.r - b.r, a.g - b.g, a.b - b.b);
}

function imageColorLuminance(hex) {
  const { r, g, b } = imageHexToRgb(hex);
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

function imageColorSaturation({ r, g, b }) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return max === 0 ? 0 : (max - min) / max;
}

function quantizeColor(channel, step = 24) {
  return Math.max(0, Math.min(255, Math.round(channel / step) * step));
}

function extractPaletteColorsFromImage(file, options = {}) {
  const maxColors = options.maxColors || 10;
  const sampleSize = options.sampleSize || 420;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read the selected image.'));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error('Could not load the selected image.'));
      image.onload = () => {
        const scale = Math.min(1, sampleSize / Math.max(image.width, image.height));
        const width = Math.max(1, Math.round(image.width * scale));
        const height = Math.max(1, Math.round(image.height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext('2d', { willReadFrequently: true });
        if (!context) {
          reject(new Error('Could not create a canvas context for palette extraction.'));
          return;
        }

        context.drawImage(image, 0, 0, width, height);
        const pixels = context.getImageData(0, 0, width, height).data;
        const pixelCount = width * height;
        const mask = new Uint8Array(pixelCount);
        const visited = new Uint8Array(pixelCount);

        for (let pixelIndex = 0; pixelIndex < pixelCount; pixelIndex += 1) {
          const dataIndex = pixelIndex * 4;
          const alpha = pixels[dataIndex + 3];
          if (alpha < 180) continue;

          const raw = { r: pixels[dataIndex], g: pixels[dataIndex + 1], b: pixels[dataIndex + 2] };
          const luminance = (0.2126 * raw.r + 0.7152 * raw.g + 0.0722 * raw.b) / 255;
          const saturation = imageColorSaturation(raw);

          // Prefer large colored swatch rectangles over generic frequency buckets.
          // Adobe palette exports include white page margins and small dark labels;
          // those pixels can be frequent after downsampling, but they are not palette
          // swatches. A connected-component pass keeps muted swatches while rejecting
          // small text, footer marks, and the surrounding page.
          const nearWhitePage = luminance > 0.94 && saturation < 0.18;
          const lightNeutralPage = luminance > 0.88 && saturation < 0.05;
          const darkNeutralText = luminance < 0.12 && saturation < 0.10;
          if (!nearWhitePage && !lightNeutralPage && !darkNeutralText) {
            mask[pixelIndex] = 1;
          }
        }

        const minimumComponentArea = Math.max(24, Math.floor(pixelCount * 0.0018));
        const components = [];
        const stack = [];

        for (let seed = 0; seed < pixelCount; seed += 1) {
          if (!mask[seed] || visited[seed]) continue;

          stack.length = 0;
          stack.push(seed);
          visited[seed] = 1;

          let area = 0;
          let minX = width;
          let maxX = 0;
          let minY = height;
          let maxY = 0;
          let sumR = 0;
          let sumG = 0;
          let sumB = 0;

          while (stack.length) {
            const current = stack.pop();
            const x = current % width;
            const y = Math.floor(current / width);
            const dataIndex = current * 4;

            area += 1;
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
            sumR += pixels[dataIndex];
            sumG += pixels[dataIndex + 1];
            sumB += pixels[dataIndex + 2];

            const left = current - 1;
            const right = current + 1;
            const up = current - width;
            const down = current + width;

            if (x > 0 && mask[left] && !visited[left]) {
              visited[left] = 1;
              stack.push(left);
            }
            if (x < width - 1 && mask[right] && !visited[right]) {
              visited[right] = 1;
              stack.push(right);
            }
            if (y > 0 && mask[up] && !visited[up]) {
              visited[up] = 1;
              stack.push(up);
            }
            if (y < height - 1 && mask[down] && !visited[down]) {
              visited[down] = 1;
              stack.push(down);
            }
          }

          if (area < minimumComponentArea) continue;
          const boxWidth = maxX - minX + 1;
          const boxHeight = maxY - minY + 1;
          if (boxWidth < 8 || boxHeight < 8) continue;

          const density = area / (boxWidth * boxHeight);
          if (density < 0.42) continue;

          components.push({
            area,
            minX,
            minY,
            maxX,
            maxY,
            hex: normalizeImageHex({ r: sumR / area, g: sumG / area, b: sumB / area }),
          });
        }

        const largeComponents = components
          .sort((a, b) => b.area - a.area)
          .slice(0, Math.max(maxColors * 2, maxColors));

        const selected = [];
        largeComponents
          .sort((a, b) => (a.minY === b.minY ? a.minX - b.minX : a.minY - b.minY))
          .forEach((candidate) => {
            if (selected.length >= maxColors) return;
            if (selected.every((existing) => imageColorDistance(existing, candidate.hex) >= 22)) {
              selected.push(candidate.hex);
            }
          });

        // Fallback for non-grid images: use a quantized histogram if the connected
        // component detector cannot find enough large swatches.
        if (selected.length < Math.min(3, maxColors)) {
          const buckets = new Map();
          for (let index = 0; index < pixels.length; index += 16) {
            const alpha = pixels[index + 3];
            if (alpha < 180) continue;
            const raw = { r: pixels[index], g: pixels[index + 1], b: pixels[index + 2] };
            const luminance = (0.2126 * raw.r + 0.7152 * raw.g + 0.0722 * raw.b) / 255;
            const saturation = imageColorSaturation(raw);
            if (luminance > 0.94 && saturation < 0.18) continue;
            if (luminance < 0.08 && saturation < 0.18) continue;

            const hex = normalizeImageHex({
              r: quantizeColor(raw.r),
              g: quantizeColor(raw.g),
              b: quantizeColor(raw.b),
            });
            const bucket = buckets.get(hex) || { hex, count: 0, r: 0, g: 0, b: 0 };
            bucket.count += 1;
            bucket.r += raw.r;
            bucket.g += raw.g;
            bucket.b += raw.b;
            buckets.set(hex, bucket);
          }

          Array.from(buckets.values())
            .map((bucket) => ({
              hex: normalizeImageHex({ r: bucket.r / bucket.count, g: bucket.g / bucket.count, b: bucket.b / bucket.count }),
              count: bucket.count,
            }))
            .sort((a, b) => b.count - a.count)
            .forEach((candidate) => {
              if (selected.length >= maxColors) return;
              if (selected.every((existing) => imageColorDistance(existing, candidate.hex) >= 28)) {
                selected.push(candidate.hex);
              }
            });
        }

        resolve(selected);
      };
      image.src = String(reader.result || '');
    };
    reader.readAsDataURL(file);
  });
}

function flattenOverrideLeaves(value, prefix = '', output = []) {
  if (Array.isArray(value)) {
    output.push({ path: prefix, value });
    return output;
  }
  if (value && typeof value === 'object') {
    Object.entries(value).forEach(([key, nested]) => {
      flattenOverrideLeaves(nested, prefix ? `${prefix}.${key}` : key, output);
    });
    return output;
  }
  if (prefix) output.push({ path: prefix, value });
  return output;
}

function downloadJsonFile(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function PaletteRoleRow({ role, value, draftOverrides, onChangeRole, onClearRole }) {
  const previewItems = getColorPreviewItems(value);
  const editable = !String(role.path || '').startsWith('appDefaults.');
  const overridden = readThemePath(draftOverrides, role.path) !== undefined;
  const editableText = getEditableText(value);
  const firstValue = Array.isArray(value) ? value[0] : value;
  const canUseColorPicker = editable && isHexColor(firstValue);

  return (
    <div className="grid gap-3 border-t border-[var(--peridot-role-interface-border-subtle)] py-3 first:border-t-0 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)_minmax(0,1.15fr)_minmax(0,1.05fr)] xl:items-center">
      <div>
        <p className="text-sm font-extrabold text-[var(--peridot-role-interface-text-on-dark)]">{role.label}</p>
        <p className="mt-1 font-mono text-[0.68rem] text-[var(--peridot-role-interface-text-muted-on-dark)]">{role.path}</p>
        {overridden ? (
          <p className="mt-1 text-[0.68rem] font-black uppercase tracking-[0.16em] text-[var(--peridot-role-button-primary-hover-bg)]">Draft override</p>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-2">
        {previewItems.length ? (
          previewItems.map((item) => <ColorSwatch key={item.id} value={item.value} label={Array.isArray(value) ? item.label : ''} />)
        ) : (
          <span className="font-mono text-[0.72rem] text-[var(--peridot-role-interface-text-muted-on-dark)]">{String(value ?? 'Not assigned')}</span>
        )}
      </div>
      <p className="text-sm leading-relaxed text-[var(--peridot-role-interface-text-muted-on-dark)]">{role.usage}</p>
      <div className="rounded-2xl border border-[var(--peridot-role-interface-border-subtle)] bg-[var(--peridot-role-card-dark-surface-bg)] p-3">
        {editable ? (
          <div className="space-y-2">
            {Array.isArray(value) ? (
              <textarea
                value={editableText}
                onChange={(event) => onChangeRole(role.path, parseEditableText(event.target.value, value))}
                className="min-h-[5.5rem] w-full rounded-xl border border-[var(--peridot-role-form-border)] bg-[var(--peridot-role-form-bg-dark)] px-3 py-2 font-mono text-[0.72rem] text-[var(--peridot-role-form-text-dark)] outline-none focus:ring-2 focus:ring-[var(--peridot-role-interface-focus-ring)]"
                aria-label={`Edit ${role.label}`}
              />
            ) : (
              <div className="flex items-center gap-2">
                {canUseColorPicker ? (
                  <input
                    type="color"
                    value={String(firstValue).trim()}
                    onChange={(event) => onChangeRole(role.path, event.target.value)}
                    className="h-9 w-12 cursor-pointer rounded-lg border border-[var(--peridot-role-interface-border-subtle)] bg-transparent p-1"
                    aria-label={`Pick ${role.label}`}
                  />
                ) : null}
                <input
                  type="text"
                  value={editableText}
                  onChange={(event) => onChangeRole(role.path, parseEditableText(event.target.value, value))}
                  className="min-w-0 flex-1 rounded-xl border border-[var(--peridot-role-form-border)] bg-[var(--peridot-role-form-bg-dark)] px-3 py-2 font-mono text-[0.72rem] text-[var(--peridot-role-form-text-dark)] outline-none focus:ring-2 focus:ring-[var(--peridot-role-interface-focus-ring)]"
                  aria-label={`Edit ${role.label}`}
                />
              </div>
            )}
            <button
              type="button"
              onClick={() => onClearRole(role.path)}
              disabled={!overridden}
              className="rounded-full border border-[var(--peridot-role-interface-border-subtle)] px-3 py-1.5 text-[0.68rem] font-black uppercase tracking-[0.15em] text-[var(--peridot-role-interface-text-muted-on-dark)] disabled:cursor-not-allowed disabled:opacity-45"
            >
              Clear role override
            </button>
          </div>
        ) : (
          <p className="text-xs leading-relaxed text-[var(--peridot-role-interface-text-muted-on-dark)]">
            Derived from theme roles. Edit the underlying role listed in its usage group instead.
          </p>
        )}
      </div>
    </div>
  );
}


function MiniThemePreview({ theme }) {
  const chartSeries = Array.isArray(theme.analytics?.series) && theme.analytics.series.length
    ? theme.analytics.series
    : theme.visualization?.series || [];
  const previewSeries = chartSeries.slice(0, 5);

  return (
    <aside
      className="rounded-[26px] border p-4 shadow-[0_18px_46px_var(--peridot-role-card-shadow)]"
      style={{
        borderColor: theme.interface.borderSubtle,
        color: theme.interface.textOnDark,
        background: `linear-gradient(135deg, ${theme.interface.panelBackgroundStrong}, ${theme.interface.panelBackground})`,
      }}
      aria-label="Live theme preview examples"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[0.64rem] font-black uppercase tracking-[0.22em]" style={{ color: theme.interface.textMutedOnDark }}>
            Live examples
          </p>
          <h3 className="mt-1 text-lg font-extrabold" style={{ color: theme.interface.textOnDark }}>
            Preview objects
          </h3>
        </div>
        <span
          className="rounded-full px-3 py-1 text-[0.62rem] font-black uppercase tracking-[0.16em]"
          style={{
            background: theme.button.primaryHoverBg,
            color: theme.button.primaryText,
            border: `1px solid ${theme.button.primaryBorder}`,
          }}
        >
          Sample
        </span>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-1 2xl:grid-cols-2">
        <div
          className="rounded-2xl border p-3"
          style={{
            background: theme.card.creamBg,
            borderColor: theme.card.border,
            color: theme.card.creamText,
          }}
        >
          <p className="text-[0.66rem] font-black uppercase tracking-[0.18em]" style={{ color: theme.interface.textMutedOnLight }}>
            Interface card
          </p>
          <p className="mt-2 text-sm font-extrabold" style={{ color: theme.interface.textOnLight }}>
            Correspondence set
          </p>
          <p className="mt-1 text-xs leading-relaxed" style={{ color: theme.interface.textMutedOnLight }}>
            Light surface, body text, muted text, border, and card background.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-full px-3 py-1.5 text-xs font-extrabold"
              style={{
                background: theme.button.primaryBg,
                color: theme.button.primaryText,
                border: `1px solid ${theme.button.primaryBorder}`,
              }}
            >
              Primary
            </button>
            <button
              type="button"
              className="rounded-full px-3 py-1.5 text-xs font-extrabold"
              style={{
                background: theme.button.creamBg,
                color: theme.button.creamText,
                border: `1px solid ${theme.button.creamBorder}`,
              }}
            >
              Cream
            </button>
          </div>
        </div>

        <div
          className="relative min-h-[10rem] overflow-hidden rounded-2xl border"
          style={{
            background: theme.visualization.canvasBg,
            borderColor: theme.visualization.frameBorder,
          }}
        >
          <div
            className="absolute left-4 top-4 h-12 w-24 rounded-[55%_45%_48%_52%]"
            style={{ background: theme.visualization.landFill, border: `1px solid ${theme.visualization.landStroke}` }}
          />
          <div
            className="absolute bottom-4 right-5 h-14 w-28 rounded-[42%_58%_55%_45%]"
            style={{ background: theme.visualization.landActiveFill, border: `1px solid ${theme.visualization.landStroke}` }}
          />
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 260 150" role="img" aria-label="Map and network preview">
            <line x1="52" y1="55" x2="134" y2="82" stroke={theme.visualization.edge} strokeWidth="4" strokeLinecap="round" opacity="0.86" />
            <line x1="134" y1="82" x2="207" y2="112" stroke={theme.visualization.edgeSelected} strokeWidth="5" strokeLinecap="round" opacity="0.92" />
            <circle cx="52" cy="55" r="11" fill={theme.visualization.node} stroke={theme.visualization.nodeStroke} strokeWidth="2" />
            <circle cx="134" cy="82" r="15" fill={theme.visualization.nodeSelected} stroke={theme.visualization.nodeStroke} strokeWidth="2" />
            <circle cx="207" cy="112" r="12" fill={theme.visualization.nodeCluster} stroke={theme.visualization.nodeStroke} strokeWidth="2" />
            <text x="22" y="132" fill={theme.visualization.labelText} stroke={theme.visualization.labelStroke} strokeWidth="2" paintOrder="stroke" fontSize="12" fontWeight="700">
              map / nodes / edges
            </text>
          </svg>
        </div>

        <div
          className="rounded-2xl border p-3"
          style={{
            background: theme.analytics.chartBg,
            borderColor: theme.card.border,
            color: theme.analytics.chartText,
          }}
        >
          <p className="text-[0.66rem] font-black uppercase tracking-[0.18em]" style={{ color: theme.analytics.chartMutedText }}>
            Chart series
          </p>
          <div className="mt-4 flex h-20 items-end gap-2">
            {previewSeries.map((color, index) => (
              <span
                key={`${color}-${index}`}
                className="flex-1 rounded-t-lg"
                style={{ background: color, height: `${35 + index * 11}%` }}
                title={`Series ${index + 1}: ${color}`}
              />
            ))}
          </div>
          <div className="mt-3 border-t" style={{ borderColor: theme.analytics.grid }} />
        </div>

        <div
          className="rounded-2xl border p-3"
          style={{
            background: theme.inspector.chromeBg,
            borderColor: theme.card.border,
            color: theme.inspector.headingText,
          }}
        >
          <p className="text-[0.66rem] font-black uppercase tracking-[0.18em]" style={{ color: theme.interface.textMutedOnDark }}>
            Inspector chip
          </p>
          <div
            className="mt-3 rounded-xl border p-3"
            style={{
              background: theme.inspector.cardBg,
              borderColor: theme.inspector.cardBorder,
              color: theme.inspector.bodyText,
            }}
          >
            <p className="text-sm font-extrabold">Selected correspondent</p>
            <p className="mt-1 text-xs leading-relaxed">Inspector card, clickable chip, and selected state.</p>
            <span
              className="mt-3 inline-flex rounded-full px-3 py-1 text-xs font-extrabold"
              style={{ background: theme.inspector.clickableBg, color: theme.inspector.clickableText }}
            >
              Linked place
            </span>
          </div>
        </div>
      </div>

      <p className="mt-3 text-xs leading-relaxed" style={{ color: theme.interface.textMutedOnDark }}>
        These examples use draft values immediately. Apply edited roles to reload the full app with the same overrides.
      </p>
    </aside>
  );
}


function ImagePaletteImportPanel({
  detectedColors,
  targetId,
  status,
  assignmentPreview,
  onChangeTarget,
  onImageUpload,
  onApplyDetectedPalette,
}) {
  const selectedTarget = PERIDOT_PALETTE_IMPORT_TARGETS.find((target) => target.id === targetId) || PERIDOT_PALETTE_IMPORT_TARGETS[0];
  return (
    <section className="mt-5 rounded-[24px] border border-[var(--peridot-role-interface-border-subtle)] bg-[var(--peridot-role-card-dark-bg)] p-4">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] xl:items-start">
        <div>
          <p className="text-[0.68rem] font-black uppercase tracking-[0.22em] text-[var(--peridot-role-interface-text-muted-on-dark)]">Palette image import</p>
          <h3 className="mt-1 text-lg font-extrabold text-[var(--peridot-role-interface-text-on-dark)]">Apply a screenshot palette to one app area</h3>
          <p className="mt-2 text-sm leading-relaxed text-[var(--peridot-role-interface-text-muted-on-dark)]">
            Upload a palette image, choose a target group, and Peridot will map the detected swatches into draft role edits for that part of the app. This does not overwrite source code; it fills the local draft editor so you can adjust the assignments before applying them site-wide.
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <label className="block rounded-2xl border border-[var(--peridot-role-interface-border-subtle)] bg-[var(--peridot-role-card-dark-surface-bg)] p-3">
              <span className="text-xs font-black uppercase tracking-[0.16em] text-[var(--peridot-role-interface-text-muted-on-dark)]">Palette image</span>
              <input
                type="file"
                accept="image/*"
                onChange={onImageUpload}
                className="mt-2 block w-full text-sm text-[var(--peridot-role-interface-text-muted-on-dark)] file:mr-3 file:rounded-full file:border file:border-[var(--peridot-role-button-secondary-border)] file:bg-[var(--peridot-role-button-secondary-bg)] file:px-3 file:py-2 file:text-xs file:font-black file:uppercase file:tracking-[0.12em] file:text-[var(--peridot-role-button-secondary-text)]"
              />
            </label>
            <label className="block rounded-2xl border border-[var(--peridot-role-interface-border-subtle)] bg-[var(--peridot-role-card-dark-surface-bg)] p-3">
              <span className="text-xs font-black uppercase tracking-[0.16em] text-[var(--peridot-role-interface-text-muted-on-dark)]">Apply to</span>
              <select
                value={targetId}
                onChange={(event) => onChangeTarget(event.target.value)}
                className="mt-2 w-full rounded-xl border border-[var(--peridot-role-form-border)] bg-[var(--peridot-role-form-bg-dark)] px-3 py-2 text-sm font-semibold text-[var(--peridot-role-form-text-dark)] outline-none focus:ring-2 focus:ring-[var(--peridot-role-interface-focus-ring)]"
              >
                {PERIDOT_PALETTE_IMPORT_TARGETS.map((target) => (
                  <option key={target.id} value={target.id}>{target.label}</option>
                ))}
              </select>
              <p className="mt-2 text-xs leading-relaxed text-[var(--peridot-role-interface-text-muted-on-dark)]">{selectedTarget.description}</p>
            </label>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={onApplyDetectedPalette} className="peridot-button-primary" disabled={!detectedColors.length}>
              Apply detected palette to draft roles
            </button>
          </div>
          {status ? <p className="mt-3 text-sm font-semibold text-[var(--peridot-role-interface-text-muted-on-dark)]">{status}</p> : null}
        </div>

        <div className="rounded-2xl border border-[var(--peridot-role-interface-border-subtle)] bg-[var(--peridot-role-card-dark-surface-bg)] p-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-extrabold text-[var(--peridot-role-interface-text-on-dark)]">Detected swatches</p>
              <p className="mt-1 text-xs leading-relaxed text-[var(--peridot-role-interface-text-muted-on-dark)]">Large swatches in the image should dominate this row; page whites and small text labels are filtered out.</p>
            </div>
            <span className="rounded-full border border-[var(--peridot-role-interface-border-subtle)] px-3 py-1 text-xs font-black text-[var(--peridot-role-interface-text-muted-on-dark)]">{detectedColors.length} colors</span>
          </div>
          <div className="mt-3 grid grid-cols-5 overflow-hidden rounded-2xl border border-[var(--peridot-role-interface-border-subtle)]">
            {(detectedColors.length ? detectedColors : ['transparent', 'transparent', 'transparent', 'transparent', 'transparent']).map((color, index) => (
              <span key={`${color}-${index}`} className="h-12 border-r border-[var(--peridot-role-interface-border-subtle)] last:border-r-0" style={{ background: color }} title={color} aria-hidden="true" />
            ))}
          </div>
          <div className="mt-4 max-h-[14rem] overflow-auto rounded-2xl border border-[var(--peridot-role-interface-border-subtle)] bg-[var(--peridot-role-card-dark-bg)] p-3">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[var(--peridot-role-interface-text-muted-on-dark)]">Draft assignment preview</p>
            {assignmentPreview.length ? (
              <div className="mt-2 space-y-2">
                {assignmentPreview.slice(0, 18).map((item) => (
                  <div key={item.path} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 text-xs">
                    <span className="min-w-0 truncate font-mono text-[var(--peridot-role-interface-text-muted-on-dark)]" title={item.path}>{item.path}</span>
                    {Array.isArray(item.value) ? (
                      <span className="flex max-w-[12rem] overflow-hidden rounded-full border border-[var(--peridot-role-interface-border-subtle)]">
                        {item.value.slice(0, 8).map((color, index) => <span key={`${item.path}-${color}-${index}`} className="h-5 w-5" style={{ background: color }} title={color} />)}
                      </span>
                    ) : (
                      <span className="flex items-center gap-2 font-mono text-[var(--peridot-role-interface-text-muted-on-dark)]">
                        <span className="h-5 w-5 rounded-full border border-[var(--peridot-role-interface-border-subtle)]" style={{ background: item.value }} aria-hidden="true" />
                        {String(item.value)}
                      </span>
                    )}
                  </div>
                ))}
                {assignmentPreview.length > 18 ? <p className="text-xs text-[var(--peridot-role-interface-text-muted-on-dark)]">+ {assignmentPreview.length - 18} more role assignments</p> : null}
              </div>
            ) : (
              <p className="mt-2 text-sm text-[var(--peridot-role-interface-text-muted-on-dark)]">Upload an image to preview target-group assignments.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function PaletteRoleGroup({ group, themeLookup, draftOverrides, onChangeRole, onClearRole }) {
  return (
    <section className="rounded-[24px] border border-[var(--peridot-role-interface-border-subtle)] bg-[var(--peridot-role-card-dark-bg)] p-4 shadow-[0_14px_34px_var(--peridot-role-card-shadow)]">
      <div className="mb-2">
        <p className="text-[0.68rem] font-black uppercase tracking-[0.22em] text-[var(--peridot-role-interface-text-muted-on-dark)]">{group.label}</p>
        <p className="mt-2 text-sm leading-relaxed text-[var(--peridot-role-interface-text-muted-on-dark)]">{group.description}</p>
      </div>
      <div>
        {group.roles.map((role) => (
          <PaletteRoleRow
            key={role.path}
            role={role}
            value={readThemePath(themeLookup, role.path)}
            draftOverrides={draftOverrides}
            onChangeRole={onChangeRole}
            onClearRole={onClearRole}
          />
        ))}
      </div>
    </section>
  );
}

export function PeridotThemeWorkspace({ themePresetKey, applyThemePreset, resetTheme, onOpenVisualizations }) {
  const [draftOverrides, setDraftOverrides] = useState(() => deepClone(PERIDOT_CUSTOM_THEME_OVERRIDES || {}));
  const [copyStatus, setCopyStatus] = useState('');
  const [paletteImageStatus, setPaletteImageStatus] = useState('');
  const [detectedImageColors, setDetectedImageColors] = useState([]);
  const [paletteImportTargetId, setPaletteImportTargetId] = useState('charts');
  const draftOverrideCount = countOverrideLeaves(draftOverrides);
  const themeOptions = [
    { key: 'peridot', title: 'Peridot default', description: 'Return to the current mossy green Peridot interface and map palette.', action: resetTheme },
    { key: 'preModern', title: 'Early modern map', description: 'Use the warmer historical-map palette for geographic exploration.', action: () => applyThemePreset('preModern') },
    { key: 'modern', title: 'Modern map', description: 'Use the higher-contrast modern map palette.', action: () => applyThemePreset('modern') },
  ];

  const draftTheme = useMemo(() => mergeObjects(PERIDOT_THEME, draftOverrides), [draftOverrides]);
  const themeLookup = useMemo(() => ({
    ...draftTheme,
    appDefaults: PERIDOT_APP_THEME_DEFAULTS,
  }), [draftTheme]);
  const imageImportOverrides = useMemo(
    () => (detectedImageColors.length ? buildPeridotPaletteImportOverrides(detectedImageColors, paletteImportTargetId) : {}),
    [detectedImageColors, paletteImportTargetId]
  );
  const imageImportPreviewLeaves = useMemo(() => flattenOverrideLeaves(imageImportOverrides), [imageImportOverrides]);

  const updateRoleOverride = (path, value) => {
    setDraftOverrides((current) => writeThemePath(current, path, value));
    setCopyStatus('');
  };

  const clearRoleOverride = (path) => {
    setDraftOverrides((current) => removeThemePath(current, path));
    setCopyStatus('');
  };

  const resetDraftToApplied = () => {
    setDraftOverrides(deepClone(PERIDOT_CUSTOM_THEME_OVERRIDES || {}));
    setCopyStatus('');
  };

  const applyDraftOverrides = () => {
    setPeridotCustomThemeOverrides(draftOverrides);
  };

  const clearAppliedOverrides = () => {
    clearPeridotCustomThemeOverrides();
  };

  const exportPayload = buildExportPayload(draftOverrides);
  const exportText = JSON.stringify(exportPayload, null, 2);

  const copyExportJson = async () => {
    try {
      await navigator.clipboard.writeText(exportText);
      setCopyStatus('Copied override JSON to clipboard.');
    } catch (_error) {
      setCopyStatus('Clipboard copy failed; use Download JSON instead.');
    }
  };

  const downloadExportJson = () => {
    downloadJsonFile(`peridot-theme-overrides-${ACTIVE_PERIDOT_PALETTE_ID}.json`, exportPayload);
  };

  async function handlePaletteImageUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setPaletteImageStatus('Reading palette image...');
    try {
      const colors = await extractPaletteColorsFromImage(file, { maxColors: 10 });
      setDetectedImageColors(colors);
      setPaletteImageStatus(colors.length ? `Detected ${colors.length} candidate colors from ${file.name}.` : 'No usable palette colors were detected. Try a screenshot with larger swatches.');
    } catch (error) {
      setDetectedImageColors([]);
      setPaletteImageStatus(error?.message || 'Could not extract colors from the selected image.');
    } finally {
      event.target.value = '';
    }
  }

  function applyDetectedPaletteToDraft() {
    if (!detectedImageColors.length) {
      setPaletteImageStatus('Upload a palette image before applying detected colors.');
      return;
    }
    const nextOverrides = buildPeridotPaletteImportOverrides(detectedImageColors, paletteImportTargetId);
    setDraftOverrides((current) => mergeObjects(current, nextOverrides));
    const targetLabel = PERIDOT_PALETTE_IMPORT_TARGETS.find((target) => target.id === paletteImportTargetId)?.label || paletteImportTargetId;
    setPaletteImageStatus(`Applied detected colors to draft roles for ${targetLabel}. Review the preview objects, then apply edited roles to test site-wide.`);
  }

  return (
    <section className="peridot-workspace-field text-[var(--peridot-color-hex-fbf7ea)]">
      <div className="peridot-workspace-frame">
        <div className="peridot-hero-card">
          <div className="peridot-workspace-header-row">
            <div>
              <p className="peridot-kicker">Themes and accessibility</p>
              <h1 className="peridot-title-medium">Choose Peridot&apos;s appearance</h1>
              <p className="peridot-lede">
                Themes and accessibility holds Peridot appearance settings. These controls adjust map styles and the site-wide semantic palette without changing loaded data, filters, timeline, Inspector, or export scope.
              </p>
            </div>
            <button type="button" onClick={onOpenVisualizations} className="peridot-button-secondary shrink-0">
              Return to visualizations
            </button>
          </div>
        </div>

        <div className="mt-6 rounded-[28px] border border-[var(--peridot-role-interface-border-subtle)] bg-[var(--peridot-role-card-dark-surface-bg)] p-5 text-[var(--peridot-role-interface-text-on-dark)] shadow-[0_18px_46px_var(--peridot-role-card-shadow)]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="peridot-kicker text-[11px]">Site-wide palette</p>
              <h2 className="[font-family:Georgia,'Palatino_Linotype','Book_Antiqua',Palatino,serif] text-2xl font-bold tracking-[-0.035em] text-[var(--peridot-role-interface-text-on-dark)]">
                Test interface and visualization palettes
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[var(--peridot-role-interface-text-muted-on-dark)]">
                These palette choices route through the semantic theme system. Selecting one saves it locally and reloads Peridot so cards, buttons, Inspector, charts, map colors, and export styling can rehydrate from the same palette source.
              </p>
            </div>
            <button
              type="button"
              onClick={() => resetActivePeridotPaletteId()}
              className="peridot-button-secondary shrink-0"
              disabled={ACTIVE_PERIDOT_PALETTE_ID === DEFAULT_PERIDOT_PALETTE_ID}
            >
              Reset site palette
            </button>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {PERIDOT_PALETTE_OPTIONS.map((palette) => {
              const active = ACTIVE_PERIDOT_PALETTE_ID === palette.id;
              return (
                <button
                  key={palette.id}
                  type="button"
                  onClick={() => setActivePeridotPaletteId(palette.id)}
                  className={[
                    'rounded-[22px] border p-4 text-left transition-all duration-150 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[var(--peridot-role-interface-focus-ring)]',
                    active
                      ? 'border-[var(--peridot-role-button-primary-hover-bg)] bg-[var(--peridot-role-button-secondary-hover-bg)] text-[var(--peridot-role-button-secondary-text)] shadow-[0_14px_32px_var(--peridot-role-card-shadow)]'
                      : 'border-[var(--peridot-role-interface-border-subtle)] bg-[var(--peridot-role-card-dark-bg)] text-[var(--peridot-role-interface-text-on-dark)] hover:border-[var(--peridot-role-button-primary-hover-bg)] hover:bg-[var(--peridot-role-card-dark-surface-bg)]',
                  ].join(' ')}
                >
                  <span className="text-[0.68rem] font-black uppercase tracking-[0.22em] text-[var(--peridot-role-interface-text-muted-on-dark)]">
                    {active ? 'Active site palette' : 'Palette candidate'}
                  </span>
                  <span className="mt-2 block text-lg font-extrabold text-[var(--peridot-role-interface-text-on-dark)]">
                    {palette.label}
                  </span>
                  <span className="mt-3 grid grid-cols-5 overflow-hidden rounded-2xl border border-[var(--peridot-role-interface-border-subtle)]">
                    {palette.swatches.map((swatch) => (
                      <span
                        key={`${palette.id}-${swatch}`}
                        className="h-9 border-r border-[var(--peridot-role-interface-border-subtle)] last:border-r-0"
                        style={{ backgroundColor: swatch }}
                        aria-hidden="true"
                      />
                    ))}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-6 rounded-[28px] border border-[var(--peridot-role-interface-border-subtle)] bg-[var(--peridot-role-card-dark-surface-bg)] p-5 text-[var(--peridot-role-interface-text-on-dark)] shadow-[0_18px_46px_var(--peridot-role-card-shadow)]">
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(22rem,0.85fr)] xl:items-start">
            <div>
              <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="peridot-kicker text-[11px]">Palette edit and export</p>
                  <h2 className="[font-family:Georgia,'Palatino_Linotype','Book_Antiqua',Palatino,serif] text-2xl font-bold tracking-[-0.035em] text-[var(--peridot-role-interface-text-on-dark)]">
                    Try role-level edits without opening source files
                  </h2>
                  <p className="mt-2 max-w-4xl text-sm leading-relaxed text-[var(--peridot-role-interface-text-muted-on-dark)]">
                    Edit role colors in the dashboard below, then apply them as local custom overrides. Applying reloads Peridot so imported visualization constants, CSS variables, charts, maps, and exports all read from the same edited palette. Export saves the overrides as JSON for later conversion into a permanent named palette.
                  </p>
                </div>
                <div className="rounded-2xl border border-[var(--peridot-role-interface-border-subtle)] bg-[var(--peridot-role-card-dark-bg)] px-4 py-3 text-sm text-[var(--peridot-role-interface-text-muted-on-dark)]">
                  Draft overrides: <span className="font-extrabold text-[var(--peridot-role-interface-text-on-dark)]">{draftOverrideCount}</span>
                </div>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <button type="button" onClick={applyDraftOverrides} className="peridot-button-primary">
                  Apply edited roles
                </button>
                <button type="button" onClick={resetDraftToApplied} className="peridot-button-secondary">
                  Revert draft edits
                </button>
                <button type="button" onClick={clearAppliedOverrides} className="peridot-button-secondary">
                  Clear applied custom roles
                </button>
                <button type="button" onClick={downloadExportJson} className="peridot-button-secondary">
                  Download override JSON
                </button>
              </div>
            </div>
            <MiniThemePreview theme={draftTheme} />
          </div>

          <ImagePaletteImportPanel
            detectedColors={detectedImageColors}
            targetId={paletteImportTargetId}
            status={paletteImageStatus}
            assignmentPreview={imageImportPreviewLeaves}
            onChangeTarget={setPaletteImportTargetId}
            onImageUpload={handlePaletteImageUpload}
            onApplyDetectedPalette={applyDetectedPaletteToDraft}
          />

          <div className="mt-4 rounded-2xl border border-[var(--peridot-role-interface-border-subtle)] bg-[var(--peridot-role-card-dark-bg)] p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-extrabold text-[var(--peridot-role-interface-text-on-dark)]">Export preview</p>
                <p className="mt-1 text-sm leading-relaxed text-[var(--peridot-role-interface-text-muted-on-dark)]">
                  This JSON is the portable record of your current role-level changes.
                </p>
              </div>
              <button type="button" onClick={copyExportJson} className="peridot-button-secondary shrink-0">
                Copy override JSON
              </button>
            </div>
            {copyStatus ? <p className="mt-3 text-sm font-semibold text-[var(--peridot-role-interface-text-on-dark)]">{copyStatus}</p> : null}
            <textarea
              readOnly
              value={exportText}
              className="mt-3 min-h-[9rem] w-full rounded-2xl border border-[var(--peridot-role-form-border)] bg-[var(--peridot-role-form-bg-dark)] px-3 py-2 font-mono text-[0.72rem] leading-relaxed text-[var(--peridot-role-form-text-dark)] outline-none"
              aria-label="Current palette override JSON"
            />
          </div>
        </div>

        <div className="mt-6 rounded-[28px] border border-[var(--peridot-role-interface-border-subtle)] bg-[var(--peridot-role-card-dark-surface-bg)] p-5 text-[var(--peridot-role-interface-text-on-dark)] shadow-[0_18px_46px_var(--peridot-role-card-shadow)]">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="peridot-kicker text-[11px]">Palette roles</p>
              <h2 className="[font-family:Georgia,'Palatino_Linotype','Book_Antiqua',Palatino,serif] text-2xl font-bold tracking-[-0.035em] text-[var(--peridot-role-interface-text-on-dark)]">
                Broad color controls for creative editing
              </h2>
              <p className="mt-2 max-w-4xl text-sm leading-relaxed text-[var(--peridot-role-interface-text-muted-on-dark)]">
                This dashboard shows and edits the role-based color assignments behind the active palette. Use these broad roles instead of hunting for individual hex values throughout the app.
              </p>
            </div>
            <div className="rounded-2xl border border-[var(--peridot-role-interface-border-subtle)] bg-[var(--peridot-role-card-dark-bg)] px-4 py-3 text-sm text-[var(--peridot-role-interface-text-muted-on-dark)]">
              Active palette: <span className="font-extrabold text-[var(--peridot-role-interface-text-on-dark)]">{PERIDOT_PALETTE_OPTIONS.find((palette) => palette.id === ACTIVE_PERIDOT_PALETTE_ID)?.label || ACTIVE_PERIDOT_PALETTE_ID}</span>
            </div>
          </div>

          <div className="mt-5 grid gap-4">
            {PERIDOT_THEME_ROLE_GROUPS.map((group) => (
              <PaletteRoleGroup
                key={group.id}
                group={group}
                themeLookup={themeLookup}
                draftOverrides={draftOverrides}
                onChangeRole={updateRoleOverride}
                onClearRole={clearRoleOverride}
              />
            ))}
          </div>
        </div>

        <div className="mt-6 peridot-card-grid peridot-card-grid-3">
          {themeOptions.map((option) => {
            const active = themePresetKey === option.key;
            return (
              <button
                key={option.key}
                type="button"
                onClick={option.action}
                className={[
                  'peridot-card-inner text-left transition-all duration-150 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[var(--peridot-role-interface-focus-ring)]',
                  active ? 'peridot-gold-active ring-2 ring-[var(--peridot-role-button-primary-border)]' : 'peridot-surface-card peridot-gold-hover',
                ].join(' ')}
              >
                <span className="peridot-section-label block">{active ? 'Active map style' : 'Map style preset'}</span>
                <span className="mt-3 block text-2xl font-bold text-[var(--peridot-role-interface-text-on-dark)]">{option.title}</span>
                <span className="mt-3 block text-sm leading-7 text-[var(--peridot-role-interface-text-muted-on-dark)]">{option.description}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-6 rounded-[28px] border border-[var(--peridot-role-interface-border-subtle)] bg-[var(--peridot-role-button-secondary-bg)] p-5 text-[var(--peridot-role-interface-text-on-dark)] shadow-[0_18px_46px_var(--peridot-role-card-shadow)]">
          <p className="peridot-kicker text-[11px]">Accessibility settings</p>
          <h2 className="[font-family:Georgia,'Palatino_Linotype','Book_Antiqua',Palatino,serif] text-2xl font-bold tracking-[-0.035em] text-[var(--peridot-role-interface-text-on-dark)]">
            More controls can live here later.
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[var(--peridot-role-interface-text-muted-on-dark)]">
            This workspace now owns appearance-related settings. Future passes can add contrast, density, motion, or label-display preferences here without changing the main visualization workflow.
          </p>
        </div>
      </div>
    </section>
  );
}
