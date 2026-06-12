/*
 * Analytics / Chart Visualizations workspace panel.
 * 
 * This component renders the chart-building experience inside Visualizations. It owns the left-side chart controls, derives chart data from the current filtered rows, renders the large chart stage, and registers chart export behavior with the shared Visualizations header export menu.
 * 
 * Important relationships:
 * - Chart definitions and defaults come from `analyticsConfig.js`.
 * - Data shaping comes from `analyticsDerivationHelpers.js`.
 * - SVG chart rendering is delegated to `analyticsChartComponents.jsx`.
 * - Header-level export is coordinated by `PeridotVisualizationsWorkspace.jsx`; chart controls should not create a separate export surface.
 * 
 * Maintenance cautions:
 * - Keep this component focused on chart configuration and presentation; avoid adding global filtering logic here.
 * - If chart refs or export behavior change, test both chart PNG export and map/network export because the header menu switches between those modes.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ANALYTICS_AGGREGATION_OPTIONS, ANALYTICS_CHART_DEFINITIONS, getAnalyticsChartDefinition } from './analyticsConfig';
import { AnalyticsChartPreview } from './analyticsChartComponents';
import { buildAnalyticsChartData, getAnalyticsCategoryValues, getAnalyticsYearRange } from './analyticsDerivationHelpers';
import { PERIDOT_THEME } from './peridotTheme.js';

function buttonClassName({ active = false } = {}) {
  const base = 'rounded-xl px-3 py-2 text-sm font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40 focus:ring-offset-2 focus:ring-offset-[var(--shell-bg)]';
  if (active) {
    return `${base} border border-[var(--button-primary-active-border)] bg-[var(--button-primary-active-bg)] text-[var(--button-primary-text)] shadow-[0_10px_22px_rgba(0,0,0,0.3)] hover:bg-[var(--button-primary-active-hover)]`;
  }
  return `${base} border border-[var(--button-secondary-border)] bg-[var(--button-secondary-bg)] text-[var(--button-secondary-text)] hover:bg-[var(--button-secondary-hover)]`;
}

function slugifyFilenamePart(value, fallback = 'analytics-chart') {
  const cleaned = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return cleaned || fallback;
}

function normalizeFieldKeyForControls(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/["'’‘“”]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function isDateLikeFieldForControls(field) {
  const key = normalizeFieldKeyForControls(field?.key);
  const label = normalizeFieldKeyForControls(field?.label);
  return key === 'timeperiod'
    || key === 'time period'
    || key === 'date'
    || key === 'date start'
    || key === 'date end'
    || key === 'date display'
    || /\b(date|year|period|time)\b/.test(key)
    || /\b(date|year|period|time)\b/.test(label);
}


function withResolvedSvgStyles(svgElement) {
  const clone = svgElement.cloneNode(true);
  const sourceNodes = [svgElement, ...svgElement.querySelectorAll('*')];
  const cloneNodes = [clone, ...clone.querySelectorAll('*')];

  sourceNodes.forEach((sourceNode, index) => {
    const cloneNode = cloneNodes[index];
    if (!cloneNode || !(sourceNode instanceof Element)) return;

    const computed = window.getComputedStyle(sourceNode);
    ['fill', 'stroke', 'color', 'font-family', 'font-size', 'font-weight', 'opacity'].forEach((property) => {
      const value = computed.getPropertyValue(property);
      if (value && value !== 'none' && !value.includes('var(')) {
        cloneNode.style.setProperty(property, value);
      }
    });
  });

  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  return clone;
}

async function exportSvgElementToPng(svgElement, filename) {
  if (!svgElement) throw new Error('No chart SVG is available to export.');

  const exportSvg = withResolvedSvgStyles(svgElement);
  const serializer = new XMLSerializer();
  const svgText = serializer.serializeToString(exportSvg);
  const svgBlob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
  const svgUrl = URL.createObjectURL(svgBlob);

  try {
    const image = new Image();
    const bounds = svgElement.viewBox?.baseVal;
    const width = Math.max(1, Math.round(bounds?.width || svgElement.getBoundingClientRect().width || 720));
    const height = Math.max(1, Math.round(bounds?.height || svgElement.getBoundingClientRect().height || 420));

    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = () => reject(new Error('Unable to render the chart SVG for PNG export.'));
      image.src = svgUrl;
    });

    const canvas = document.createElement('canvas');
    const scale = 2;
    canvas.width = width * scale;
    canvas.height = height * scale;
    const context = canvas.getContext('2d');

    if (!context) throw new Error('Unable to create a canvas context for chart export.');

    context.fillStyle = PERIDOT_THEME.analytics.chartBg;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise((resolve, reject) => {
      canvas.toBlob((pngBlob) => {
        if (pngBlob) resolve(pngBlob);
        else reject(new Error('Unable to create the chart PNG.'));
      }, 'image/png');
    });

    const pngUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = pngUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(pngUrl);
  } finally {
    URL.revokeObjectURL(svgUrl);
  }
}

function ChartTypeIcon({ chartType }) {
  if (chartType === 'line' || chartType === 'multiLine' || chartType === 'measureLine') {
    const secondLine = chartType === 'multiLine' || chartType === 'measureLine';
    return (
      <svg viewBox="0 0 48 48" className="h-14 w-14" aria-hidden="true">
        <rect x="5" y="5" width="38" height="38" rx="10" fill="currentColor" opacity="0.08" />
        <polyline points="9,33 18,25 27,29 39,15" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
        {secondLine ? <polyline points="9,21 18,28 28,18 39,24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" opacity="0.55" /> : null}
        <circle cx="9" cy="33" r="3" fill="currentColor" />
        <circle cx="18" cy="25" r="3" fill="currentColor" />
        <circle cx="27" cy="29" r="3" fill="currentColor" />
        <circle cx="39" cy="15" r="3" fill="currentColor" />
      </svg>
    );
  }

  if (chartType === 'pie' || chartType === 'sunburst') {
    return (
      <svg viewBox="0 0 48 48" className="h-14 w-14" aria-hidden="true">
        <rect x="5" y="5" width="38" height="38" rx="10" fill="currentColor" opacity="0.08" />
        <path d="M24 10 A14 14 0 1 1 11.9 31 L24 24 Z" fill="currentColor" opacity={chartType === 'sunburst' ? '0.28' : '0.35'} />
        <path d="M24 10 A14 14 0 0 1 38 24 L24 24 Z" fill="currentColor" />
        {chartType === 'sunburst' ? <circle cx="24" cy="24" r="7" fill="none" stroke="currentColor" strokeWidth="3" opacity="0.55" /> : <circle cx="24" cy="24" r="5" fill="currentColor" opacity="0.16" />}
      </svg>
    );
  }

  if (chartType === 'heatmap') {
    return (
      <svg viewBox="0 0 48 48" className="h-14 w-14" aria-hidden="true">
        <rect x="5" y="5" width="38" height="38" rx="10" fill="currentColor" opacity="0.08" />
        {[0, 1, 2].map((row) => [0, 1, 2].map((column) => (
          <rect key={`${row}-${column}`} x={13 + column * 8} y={13 + row * 8} width="6" height="6" rx="1.5" fill="currentColor" opacity={0.25 + (row + column) * 0.12} />
        )))}
      </svg>
    );
  }

  if (chartType === 'stackedBar' || chartType === 'groupedBar') {
    const bars = [
      { x: 12, h: 14 },
      { x: 22, h: 22 },
      { x: 32, h: 18 },
    ];
    return (
      <svg viewBox="0 0 48 48" className="h-14 w-14" aria-hidden="true">
        <rect x="5" y="5" width="38" height="38" rx="10" fill="currentColor" opacity="0.08" />
        <line x1="10" y1="37" x2="39" y2="37" stroke="currentColor" strokeWidth="2" opacity="0.28" />
        {chartType === 'groupedBar'
          ? bars.map(({ x, h }, index) => (
            <g key={x}>
              <rect x={x - 2} y={37 - h} width="4" height={h} rx="1.2" fill="currentColor" opacity="0.42" />
              <rect x={x + 3} y={37 - h - 5 + index * 2} width="4" height={h + 5 - index * 2} rx="1.2" fill="currentColor" opacity="0.86" />
            </g>
          ))
          : bars.map(({ x, h }) => {
            const bottom = Math.round(h * 0.42);
            const middle = Math.round(h * 0.34);
            const top = h - bottom - middle;
            return (
              <g key={x}>
                <rect x={x} y={37 - bottom} width="6" height={bottom} rx="1.4" fill="currentColor" opacity="0.35" />
                <rect x={x} y={37 - bottom - middle} width="6" height={middle} rx="1.4" fill="currentColor" opacity="0.62" />
                <rect x={x} y={37 - h} width="6" height={top} rx="1.4" fill="currentColor" opacity="0.9" />
              </g>
            );
          })}
      </svg>
    );
  }

  if (chartType === 'histogram') {
    return (
      <svg viewBox="0 0 48 48" className="h-14 w-14" aria-hidden="true">
        <rect x="5" y="5" width="38" height="38" rx="10" fill="currentColor" opacity="0.08" />
        <line x1="10" y1="37" x2="39" y2="37" stroke="currentColor" strokeWidth="2" opacity="0.28" />
        <rect x="10" y="29" width="4" height="8" rx="1.5" fill="currentColor" opacity="0.45" />
        <rect x="16" y="23" width="4" height="14" rx="1.5" fill="currentColor" opacity="0.7" />
        <rect x="22" y="14" width="4" height="23" rx="1.5" fill="currentColor" />
        <rect x="28" y="19" width="4" height="18" rx="1.5" fill="currentColor" opacity="0.7" />
        <rect x="34" y="31" width="4" height="6" rx="1.5" fill="currentColor" opacity="0.45" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 48 48" className="h-14 w-14" aria-hidden="true">
      <rect x="5" y="5" width="38" height="38" rx="10" fill="currentColor" opacity="0.08" />
      <line x1="10" y1="37" x2="39" y2="37" stroke="currentColor" strokeWidth="2" opacity="0.28" />
      <rect x="12" y="25" width="5" height="12" rx="2" fill="currentColor" />
      <rect x="21.5" y="17" width="5" height="20" rx="2" fill="currentColor" />
      <rect x="31" y="10" width="5" height="27" rx="2" fill="currentColor" />
    </svg>
  );
}

function ChartTypeButton({ option, active, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={[
        'aspect-square rounded-2xl border p-2 text-center transition-all',
        'flex flex-col items-center justify-center gap-1.5',
        active
          ? 'border-[var(--button-primary-active-border)] bg-[var(--button-primary-active-bg)] text-[var(--button-primary-text)] shadow-[0_10px_22px_rgba(0,0,0,0.22)]'
          : 'border-[var(--section-border)] bg-[var(--section-bg)] text-[var(--text-main)] hover:bg-[var(--button-secondary-hover)]',
      ].join(' ')}
      aria-pressed={active}
    >
      <ChartTypeIcon chartType={option.key} />
      <span className="text-xs font-semibold leading-tight">{option.label}</span>
    </button>
  );
}

function ChartUseDescription({ chartDefinition }) {
  return (
    <div className="rounded-xl bg-[var(--utility-tint-bg)] p-3 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="font-semibold text-[var(--panel-card-text)]">{chartDefinition.label}</div>
        <div className="rounded-full border border-[var(--panel-card-border)] bg-[var(--panel-card-bg)] px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--panel-card-muted-text)]">
          {chartDefinition.variableCountLabel}
        </div>
      </div>
      <div className="mt-1 text-[var(--panel-card-muted-text)]">{chartDefinition.descriptor}</div>
      <div className="mt-2 text-xs text-[var(--panel-card-muted-text)]">{chartDefinition.variableSummary}</div>
      <div className="mt-2 text-xs text-[var(--panel-card-muted-text)]">{chartDefinition.defaultUseCase}</div>
      <div className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--panel-card-muted-text)]">Example questions</div>
      <div className="mt-2 space-y-1 text-xs text-[var(--panel-card-muted-text)]">
        {chartDefinition.exampleQuestions.map((question) => (
          <div key={question}>{question}</div>
        ))}
      </div>
    </div>
  );
}

function SelectControl({ label, value, onChange, options, description, disabled = false, emphasis = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find((field) => String(field.key ?? field) === String(value || '')) || options[0];
  const selectedLabel = selectedOption?.label ?? selectedOption ?? '';

  if (emphasis) {
    return (
      <div
        className="relative block text-sm"
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setIsOpen(false);
        }}
      >
        <span className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-[0.14em] text-[var(--peridot-role-ornament-line)]">
          {label}
        </span>
        <button
          type="button"
          disabled={disabled}
          className={[
            'flex w-full items-center justify-between rounded-xl border border-[var(--peridot-role-ornament-line)]',
            'bg-[var(--peridot-role-button-primary-bg)] px-3 py-2.5 text-left text-sm font-bold',
            'text-[var(--peridot-role-button-primary-text)] shadow-[0_8px_18px_rgba(86,52,22,0.14),inset_0_1px_0_rgba(255,255,255,0.18)]',
            'transition duration-150 hover:border-[var(--peridot-role-ornament-corner)] hover:bg-[var(--peridot-role-button-primary-hover-bg)]',
            'focus:outline-none focus:ring-2 focus:ring-[var(--peridot-role-interface-focus-ring)] disabled:cursor-not-allowed disabled:opacity-70',
          ].join(' ')}
          onClick={() => setIsOpen((current) => !current)}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <span>{selectedLabel}</span>
          <span
            aria-hidden="true"
            className="ml-3 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[rgba(255,248,232,0.22)] text-[var(--peridot-role-button-primary-text)]"
          >
            <svg viewBox="0 0 12 12" className={`h-3 w-3 transition ${isOpen ? 'rotate-180' : ''}`}>
              <path d="M3 4.5L6 7.5L9 4.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </button>
        {isOpen ? (
          <div
            className={[
              'absolute left-0 top-[calc(100%+0.45rem)] z-[1200] w-full overflow-hidden rounded-[18px]',
              'border border-[var(--peridot-role-ornament-line)] bg-[var(--peridot-role-workspace-chrome-dropdown-bg)]',
              'p-1.5 text-[var(--peridot-role-workspace-chrome-dropdown-text)] shadow-[0_16px_34px_rgba(0,0,0,0.24)]',
            ].join(' ')}
            role="listbox"
          >
            {options.map((field) => {
              const optionValue = field.key ?? field;
              const optionLabel = field.label ?? field;
              const isSelected = String(optionValue) === String(value || '');
              return (
                <button
                  key={optionValue}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  className={[
                    'flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition',
                    isSelected
                      ? 'bg-[color-mix(in_srgb,var(--peridot-role-button-primary-bg)_58%,var(--peridot-role-workspace-chrome-dropdown-bg)_42%)] font-extrabold text-[var(--peridot-role-interface-text-on-light)] shadow-[inset_4px_0_0_var(--peridot-role-ornament-line)]'
                      : 'text-[var(--peridot-role-workspace-chrome-dropdown-text)] hover:bg-[color-mix(in_srgb,var(--peridot-role-button-primary-bg)_42%,var(--peridot-role-workspace-chrome-dropdown-bg)_58%)] hover:text-[var(--peridot-role-interface-text-on-light)] hover:shadow-[inset_4px_0_0_var(--peridot-role-ornament-line)]',
                  ].join(' ')}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    onChange(optionValue);
                    setIsOpen(false);
                  }}
                >
                  <span>{optionLabel}</span>
                  {isSelected ? (
                    <span aria-hidden="true" className="ml-3 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[var(--peridot-role-ornament-line)]">Selected</span>
                  ) : null}
                </button>
              );
            })}
          </div>
        ) : null}
        {description ? <span className="mt-1 block text-[11px] leading-relaxed text-[var(--peridot-role-analytics-chart-muted-text)]">{description}</span> : null}
      </div>
    );
  }

  return (
    <label className="block text-sm">
      <span className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-[0.14em] text-[var(--peridot-role-analytics-chart-text)]">
        {label}
      </span>
      <span className="relative block">
        <select
          value={value || ''}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          className={[
            'w-full appearance-none rounded-xl border border-[var(--peridot-role-form-border)] bg-[var(--peridot-role-form-bg-light)]',
            'px-3 py-2 pr-10 text-sm font-semibold text-[var(--peridot-role-form-text-light)] shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]',
            'transition hover:border-[var(--peridot-role-ornament-line-muted)] hover:bg-[var(--peridot-role-interface-card-background-warm)]',
            'focus:border-[var(--peridot-role-ornament-line)] focus:outline-none focus:ring-2 focus:ring-[var(--peridot-role-interface-focus-ring)]',
            'disabled:cursor-not-allowed disabled:opacity-70',
          ].join(' ')}
        >
          {options.map((field) => (
            <option key={field.key ?? field} value={field.key ?? field}>{field.label ?? field}</option>
          ))}
        </select>
        <span
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full bg-[rgba(10,38,22,0.05)] text-[var(--peridot-role-analytics-chart-text)]"
        >
          <svg viewBox="0 0 12 12" className="h-3 w-3">
            <path d="M3 4.5L6 7.5L9 4.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </span>
      {description ? <span className="mt-1 block text-[11px] leading-relaxed text-[var(--peridot-role-analytics-chart-muted-text)]">{description}</span> : null}
    </label>
  );
}

function NumberStepperControl({ label, value, onChange, min = 1, max = 100, description }) {
  const numericValue = Number.isFinite(Number(value)) ? Number(value) : min;
  const clamp = (nextValue) => Math.max(min, Math.min(max, Number.isFinite(Number(nextValue)) ? Number(nextValue) : min));
  const commit = (nextValue) => onChange(clamp(nextValue));

  return (
    <label className="block text-sm">
      <span className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-[0.14em] text-[var(--peridot-role-analytics-chart-text)]">{label}</span>
      <span className="grid grid-cols-[2.4rem_minmax(0,1fr)_2.4rem] overflow-hidden rounded-xl border border-[var(--peridot-role-form-border)] bg-[var(--peridot-role-form-bg-light)] shadow-[inset_0_1px_0_rgba(255,255,255,0.45)] focus-within:border-[var(--peridot-role-ornament-line)] focus-within:ring-2 focus-within:ring-[var(--peridot-role-interface-focus-ring)]">
        <button
          type="button"
          className="flex items-center justify-center border-r border-[var(--peridot-role-form-border)] bg-[color-mix(in_srgb,var(--peridot-role-interface-card-background-warm)_82%,transparent)] text-lg font-bold text-[var(--peridot-role-analytics-chart-text)] transition hover:bg-[var(--peridot-role-button-primary-bg)] hover:text-[var(--peridot-role-button-primary-text)] focus:outline-none"
          onClick={() => commit(numericValue - 1)}
          aria-label={`Decrease ${label}`}
        >
          −
        </button>
        <input
          type="number"
          min={min}
          max={max}
          step="1"
          value={String(numericValue)}
          onChange={(event) => commit(event.target.value)}
          className="min-w-0 bg-transparent px-3 py-2 text-center text-sm font-bold text-[var(--peridot-role-form-text-light)] outline-none"
        />
        <button
          type="button"
          className="flex items-center justify-center border-l border-[var(--peridot-role-form-border)] bg-[color-mix(in_srgb,var(--peridot-role-interface-card-background-warm)_82%,transparent)] text-lg font-bold text-[var(--peridot-role-analytics-chart-text)] transition hover:bg-[var(--peridot-role-button-primary-bg)] hover:text-[var(--peridot-role-button-primary-text)] focus:outline-none"
          onClick={() => commit(numericValue + 1)}
          aria-label={`Increase ${label}`}
        >
          +
        </button>
      </span>
      {description ? <span className="mt-1 block text-[11px] leading-relaxed text-[var(--peridot-role-analytics-chart-muted-text)]">{description}</span> : null}
    </label>
  );
}

function ManualCategorySelectionControls({
  enabled,
  selectionMode,
  onSelectionModeChange,
  comparisonMode,
  onComparisonModeChange,
  options = [],
  selectedValues = [],
  onSelectedValuesChange,
  searchValue,
  onSearchValueChange,
  noun = 'categories',
}) {
  if (!enabled) return null;

  const selectedSet = new Set(selectedValues);
  const filteredOptions = options.filter((option) => option.label.toLowerCase().includes(String(searchValue || '').toLowerCase()));
  const visibleOptions = filteredOptions.slice(0, 80);
  const toggleValue = (value) => {
    const nextSet = new Set(selectedValues);
    if (nextSet.has(value)) nextSet.delete(value);
    else nextSet.add(value);
    onSelectedValuesChange(Array.from(nextSet));
  };

  return (
    <div className="rounded-xl border border-[var(--panel-card-border)] bg-[color-mix(in_srgb,var(--peridot-role-interface-card-background-warm)_78%,transparent)] p-3">
      <SelectControl
        label="Selection mode"
        value={selectionMode}
        onChange={onSelectionModeChange}
        options={[
          { key: 'topN', label: 'Top N automatically' },
          { key: 'manual', label: 'Manually choose categories' },
        ]}
        description={selectionMode === 'manual' ? `Choose exact ${noun} to compare.` : `Automatically rank and show the top ${noun}.`}
      />

      {selectionMode === 'manual' ? (
        <div className="mt-3 space-y-3">
          <SelectControl
            label="Comparison total"
            value={comparisonMode}
            onChange={onComparisonModeChange}
            options={[
              { key: 'selectedOnly', label: 'Selected categories only' },
              { key: 'selectedPlusOther', label: 'Selected categories + Other' },
              { key: 'selectedPlusTotal', label: 'Selected categories + dataset total' },
            ]}
            description="Use Other to preserve the selected range total without choosing every category."
          />

          <label className="block text-sm">
            <span className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-[0.14em] text-[var(--peridot-role-analytics-chart-text)]">Find categories</span>
            <input
              type="search"
              value={searchValue}
              onChange={(event) => onSearchValueChange(event.target.value)}
              placeholder={`Search ${noun}…`}
              className="w-full rounded-xl border border-[var(--peridot-role-form-border)] bg-[var(--peridot-role-form-bg-light)] px-3 py-2 text-sm font-semibold text-[var(--peridot-role-form-text-light)] outline-none transition focus:border-[var(--peridot-role-ornament-line)] focus:ring-2 focus:ring-[var(--peridot-role-interface-focus-ring)]"
            />
          </label>

          <div className="max-h-[28rem] space-y-1 overflow-y-auto pr-1">
            {visibleOptions.length ? visibleOptions.map((option) => (
              <label
                key={option.key}
                className={[
                  'flex items-start gap-2 rounded-lg border px-2.5 py-2 text-sm transition',
                  selectedSet.has(option.key)
                    ? 'border-[var(--peridot-role-ornament-line)] bg-[color-mix(in_srgb,var(--peridot-role-button-primary-bg)_28%,var(--peridot-role-interface-card-background-warm)_72%)] text-[var(--panel-card-text)]'
                    : 'border-[var(--panel-card-border)] bg-[var(--utility-tint-bg)] text-[var(--panel-card-text)] hover:bg-[color-mix(in_srgb,var(--peridot-role-button-primary-bg)_18%,var(--peridot-role-interface-card-background-warm)_82%)]',
                ].join(' ')}
              >
                <input
                  type="checkbox"
                  className="mt-0.5"
                  checked={selectedSet.has(option.key)}
                  onChange={() => toggleValue(option.key)}
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">{option.label}</span>
                  <span className="block text-[11px] text-[var(--panel-card-muted-text)]">{option.count} records in current date window</span>
                </span>
              </label>
            )) : (
              <div className="rounded-lg border border-dashed border-[var(--panel-card-border)] p-3 text-sm text-[var(--panel-card-muted-text)]">
                No matching categories in the current date window.
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--panel-card-muted-text)]">
            <button
              type="button"
              className="rounded-full border border-[var(--panel-card-border)] px-2.5 py-1 font-bold transition hover:bg-[var(--peridot-role-button-primary-bg)] hover:text-[var(--peridot-role-button-primary-text)]"
              onClick={() => onSelectedValuesChange(visibleOptions.map((option) => option.key))}
            >
              Select visible
            </button>
            <button
              type="button"
              className="rounded-full border border-[var(--panel-card-border)] px-2.5 py-1 font-bold transition hover:bg-[var(--peridot-role-button-primary-bg)] hover:text-[var(--peridot-role-button-primary-text)]"
              onClick={() => onSelectedValuesChange([])}
            >
              Clear
            </button>
            <span>{selectedValues.length} selected</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}


function ControlSection({ eyebrow, title, description, children, compact = false }) {
  return (
    <section
      className={[
        'rounded-[20px] border border-[var(--peridot-role-ornament-paper-rule)]',
        'bg-[linear-gradient(135deg,var(--peridot-role-analytics-chart-bg),var(--peridot-role-interface-card-background-warm))]',
        'shadow-[0_8px_20px_rgba(0,0,0,0.10),inset_0_1px_0_rgba(255,255,255,0.50)]',
        compact ? 'p-3' : 'p-3.5',
      ].join(' ')}
    >
      {eyebrow ? (
        <div className="mb-0.5 flex items-center gap-2 text-[9px] font-extrabold uppercase tracking-[0.18em] text-[var(--peridot-role-ornament-line)]">
          <span aria-hidden="true">◆</span>
          <span>{eyebrow}</span>
          <span aria-hidden="true">◆</span>
        </div>
      ) : null}
      {title ? (
        <h3 className="text-[15px] font-extrabold leading-tight text-[var(--peridot-role-analytics-chart-text)]">
          {title}
        </h3>
      ) : null}
      {description ? (
        <p className="mt-0.5 text-[11px] leading-relaxed text-[var(--peridot-role-analytics-chart-muted-text)]">
          {description}
        </p>
      ) : null}
      <div className={title || description || eyebrow ? 'mt-2.5 space-y-2.5' : 'space-y-2.5'}>
        {children}
      </div>
    </section>
  );
}

function VariableControlsShell({ children }) {
  return (
    <div className="space-y-2.5">
      {children}
    </div>
  );
}


function ChartBuilderTabButton({ tab, active, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(tab.key)}
      className={[
        'rounded-full border px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.12em] transition',
        active
          ? 'border-[var(--peridot-role-ornament-corner)] bg-[var(--peridot-role-button-primary-bg)] text-[var(--peridot-role-button-primary-text)] shadow-[0_8px_18px_rgba(86,52,22,0.20)]'
          : 'border-[var(--peridot-role-button-secondary-border)] bg-[var(--peridot-role-button-secondary-bg)] text-[var(--peridot-role-button-secondary-text)] hover:border-[var(--peridot-role-ornament-line)] hover:bg-[var(--peridot-role-button-secondary-hover)]',
      ].join(' ')}
      aria-pressed={active}
    >
      <span>{tab.label}</span>
      {tab.badge ? <span className="ml-1.5 rounded-full bg-[rgba(255,248,232,0.24)] px-1.5 py-0.5 text-[10px]">{tab.badge}</span> : null}
    </button>
  );
}

export function AnalyticsPanelContent({
  analyticsState,
  onChartExportControlsChange,
}) {
  // Analytics receives rows from the visualization workspace/App state and then
  // applies chart-local derivation settings. Do not read from raw uploaded rows
  // here; doing so would bypass Search/Timeline scope and make chart export
  // disagree with the visible chart.
  const chartSvgRef = useRef(null);
  const [exportStatus, setExportStatus] = useState(null);
  const [barOrientation, setBarOrientation] = useState('vertical');
  const [xField, setXField] = useState('year');
  const [yField, setYField] = useState('recordCount');
  const [aggregation, setAggregation] = useState('count');
  const [pieGroupBy, setPieGroupBy] = useState('language');
  const [histogramValueField, setHistogramValueField] = useState('recordCount');
  const [histogramGroupBy, setHistogramGroupBy] = useState('sourcePerson');
  const [stackSegmentBy, setStackSegmentBy] = useState('sourcePerson');
  const [groupedBarGroupBy, setGroupedBarGroupBy] = useState('sourcePerson');
  const [multiLineMode, setMultiLineMode] = useState('recordCount');
  const [multiLineGroupBy, setMultiLineGroupBy] = useState('sourcePerson');
  const [lineFilterBy, setLineFilterBy] = useState('sourcePerson');
  const [wideSeriesPreset, setWideSeriesPreset] = useState('selected');
  const [selectedWideSeriesKeys, setSelectedWideSeriesKeys] = useState([]);
  const [heatmapRowBy, setHeatmapRowBy] = useState('sourcePerson');
  const [heatmapColumnBy, setHeatmapColumnBy] = useState('targetPerson');
  const [sunburstParentBy, setSunburstParentBy] = useState('sourceLoc');
  const [sunburstChildBy, setSunburstChildBy] = useState('sourcePerson');
  const [categorySelectionMode, setCategorySelectionMode] = useState('topN');
  const [manualCategoryValuesByField, setManualCategoryValuesByField] = useState({});
  const [manualComparisonMode, setManualComparisonMode] = useState('selectedPlusOther');
  const [manualCategorySearch, setManualCategorySearch] = useState('');
  const [activeBuilderTab, setActiveBuilderTab] = useState('chart');
  const [presentationTitle, setPresentationTitle] = useState('');

  const {
    chartType,
    setChartType,
    barGroupBy,
    setBarGroupBy,
    topN,
    setTopN,
    availableFields,
    rows = [],
  } = analyticsState;

  const yearRange = useMemo(() => getAnalyticsYearRange(rows), [rows]);
  const [startYear, setStartYear] = useState('');
  const [endYear, setEndYear] = useState('');

  useEffect(() => {
    if (!yearRange.years.length) {
      setStartYear('');
      setEndYear('');
      return;
    }

    const availableYears = new Set(yearRange.years.map((year) => String(year)));
    const fallbackStartYear = String(yearRange.minYear);
    const fallbackEndYear = String(yearRange.maxYear);

    setStartYear((current) => {
      const currentYear = String(current || '');
      return availableYears.has(currentYear) ? currentYear : fallbackStartYear;
    });
    setEndYear((current) => {
      const currentYear = String(current || '');
      return availableYears.has(currentYear) ? currentYear : fallbackEndYear;
    });
  }, [yearRange.maxYear, yearRange.minYear, yearRange.years]);

  const chartDefinition = getAnalyticsChartDefinition(chartType);
  const availableBarFields = availableFields?.barGroupOptions || [];
  const availablePieFields = availableFields?.pieGroupOptions || availableBarFields;
  const availableSegmentFields = availableFields?.segmentGroupOptions || [];
  const availableHeatmapRows = availableFields?.heatmapRowOptions || [];
  const availableHeatmapColumns = availableFields?.heatmapColumnOptions || [];
  const availableXAxisFields = availableFields?.xAxisOptions || [];
  const availableOrderedXAxisFields = availableFields?.orderedXAxisOptions || [];
  const availableDateFields = availableFields?.dateFieldOptions || [];
  const availableMeasureFields = availableFields?.numericMeasureOptions || [];
  const yMetricOptions = availableFields?.yMetricOptions || [{ key: 'recordCount', label: 'Record count', description: 'Count records in each group.' }];
  const aggregationOptions = ANALYTICS_AGGREGATION_OPTIONS.filter((option) => yField !== 'recordCount' || option.key === 'count');
  const lineChartTypes = ['line', 'multiLine'];
  const activeXAxisFields = lineChartTypes.includes(chartType) ? availableOrderedXAxisFields : availableXAxisFields;
  const numericMeasureKeys = useMemo(() => new Set(availableMeasureFields.map((field) => field.key)), [availableMeasureFields]);
  const multiLineGroupFields = useMemo(
    () => availableSegmentFields.filter((field) => (
      field.key !== xField
      && !isDateLikeFieldForControls(field)
      && !numericMeasureKeys.has(field.key)
    )),
    [availableSegmentFields, numericMeasureKeys, xField]
  );

  useEffect(() => {
    if (!activeXAxisFields.length) return;
    if (!activeXAxisFields.some((field) => field.key === xField)) {
      setXField(availableDateFields.find((field) => activeXAxisFields.some((candidate) => candidate.key === field.key))?.key || activeXAxisFields[0].key);
    }
  }, [activeXAxisFields, availableDateFields, xField]);

  useEffect(() => {
    if (chartType !== 'multiLine' || multiLineMode === 'wide') return;
    if (!multiLineGroupFields.length) return;
    if (!multiLineGroupFields.some((field) => field.key === multiLineGroupBy)) {
      setMultiLineGroupBy(multiLineGroupFields[0].key);
    }
  }, [chartType, multiLineGroupBy, multiLineGroupFields, multiLineMode]);

  useEffect(() => {
    if (!yMetricOptions.some((field) => field.key === yField)) {
      setYField(yMetricOptions[0]?.key || 'recordCount');
    }
  }, [yField, yMetricOptions]);

  useEffect(() => {
    if (yField === 'recordCount') setAggregation('count');
  }, [yField]);

  useEffect(() => {
    if (!['pie', 'stackedBar', 'sunburst'].includes(chartType)) return;
    if (yField !== 'recordCount' && aggregation !== 'sum') setAggregation('sum');
  }, [aggregation, chartType, yField]);

  const selectedBarField = useMemo(() => availableBarFields.find((field) => field.key === barGroupBy) || availableBarFields[0], [availableBarFields, barGroupBy]);
  const selectedLineFilterField = useMemo(() => availableBarFields.find((field) => field.key === lineFilterBy) || availableBarFields[0], [availableBarFields, lineFilterBy]);
  const selectedPieField = useMemo(() => availablePieFields.find((field) => field.key === pieGroupBy) || availablePieFields[0], [availablePieFields, pieGroupBy]);
  const histogramFieldOptions = yMetricOptions;
  const selectedHistogramField = useMemo(() => histogramFieldOptions.find((field) => field.key === histogramValueField) || histogramFieldOptions[0], [histogramFieldOptions, histogramValueField]);
  const selectedHistogramGroupField = useMemo(() => availableBarFields.find((field) => field.key === histogramGroupBy) || availableBarFields[0], [availableBarFields, histogramGroupBy]);
  const selectedStackField = useMemo(() => availableSegmentFields.find((field) => field.key === stackSegmentBy) || availableSegmentFields[0], [availableSegmentFields, stackSegmentBy]);
  const selectedGroupedBarField = useMemo(() => availableSegmentFields.find((field) => field.key === groupedBarGroupBy) || availableSegmentFields[0], [availableSegmentFields, groupedBarGroupBy]);
  const selectedMultiLineField = useMemo(() => multiLineGroupFields.find((field) => field.key === multiLineGroupBy) || multiLineGroupFields[0], [multiLineGroupFields, multiLineGroupBy]);
  const selectedHeatmapRowField = useMemo(() => availableHeatmapRows.find((field) => field.key === heatmapRowBy) || availableHeatmapRows[0], [availableHeatmapRows, heatmapRowBy]);
  const selectedHeatmapColumnField = useMemo(() => availableHeatmapColumns.find((field) => field.key === heatmapColumnBy) || availableHeatmapColumns[1] || availableHeatmapColumns[0], [availableHeatmapColumns, heatmapColumnBy]);
  const selectedSunburstParentField = useMemo(() => availableSegmentFields.find((field) => field.key === sunburstParentBy) || availableSegmentFields[0], [availableSegmentFields, sunburstParentBy]);
  const selectedSunburstChildField = useMemo(() => availableSegmentFields.find((field) => field.key === sunburstChildBy) || availableSegmentFields[1] || availableSegmentFields[0], [availableSegmentFields, sunburstChildBy]);
  const manualSelectionField = useMemo(() => {
    if (chartType === 'bar') return selectedBarField;
    if (chartType === 'line') return selectedLineFilterField;
    if (chartType === 'histogram') return selectedHistogramGroupField;
    if (chartType === 'groupedBar') return selectedGroupedBarField;
    if (chartType === 'stackedBar') return selectedStackField;
    if (chartType === 'pie') return selectedPieField;
    if (chartType === 'multiLine' && multiLineMode !== 'wide') return selectedMultiLineField;
    if (chartType === 'heatmap') return selectedHeatmapRowField;
    if (chartType === 'sunburst') return selectedSunburstParentField;
    return null;
  }, [chartType, multiLineMode, selectedBarField, selectedGroupedBarField, selectedHeatmapRowField, selectedHistogramGroupField, selectedLineFilterField, selectedMultiLineField, selectedPieField, selectedStackField, selectedSunburstParentField]);

  const manualSelectionSupported = Boolean(manualSelectionField);
  const manualCategoryOptions = useMemo(
    () => manualSelectionField
      ? getAnalyticsCategoryValues(rows, manualSelectionField.key, startYear || yearRange.minYear, endYear || yearRange.maxYear)
      : [],
    [endYear, manualSelectionField, rows, startYear, yearRange.maxYear, yearRange.minYear]
  );
  const manualSelectionFieldKey = manualSelectionField?.key || '';
  const validManualCategoryKeys = useMemo(() => new Set(manualCategoryOptions.map((option) => option.key)), [manualCategoryOptions]);
  const activeManualCategoryValues = manualSelectionFieldKey ? (manualCategoryValuesByField[manualSelectionFieldKey] || []) : [];
  const selectedManualCategoryValues = useMemo(
    () => activeManualCategoryValues.filter((value) => validManualCategoryKeys.has(value)),
    [activeManualCategoryValues, validManualCategoryKeys]
  );
  const updateManualCategoryValuesForActiveField = useCallback((nextValues) => {
    if (!manualSelectionFieldKey) return;
    setManualCategoryValuesByField((current) => ({
      ...current,
      [manualSelectionFieldKey]: Array.isArray(nextValues) ? nextValues : [],
    }));
  }, [manualSelectionFieldKey]);
  const categorySelection = useMemo(() => ({
    mode: manualSelectionSupported ? categorySelectionMode : 'topN',
    fieldKey: manualSelectionFieldKey,
    values: selectedManualCategoryValues,
    comparisonMode: manualComparisonMode,
  }), [categorySelectionMode, manualComparisonMode, manualSelectionFieldKey, manualSelectionSupported, selectedManualCategoryValues]);

  useEffect(() => {
    if (!manualSelectionFieldKey) return;
    setManualCategoryValuesByField((current) => {
      const currentValues = current[manualSelectionFieldKey] || [];
      const retainedValues = currentValues.filter((value) => validManualCategoryKeys.has(value));
      if (retainedValues.length === currentValues.length) return current;
      return { ...current, [manualSelectionFieldKey]: retainedValues };
    });
  }, [manualSelectionFieldKey, validManualCategoryKeys]);

  useEffect(() => {
    if (!availableMeasureFields.length) {
      setSelectedWideSeriesKeys([]);
      return;
    }

    setSelectedWideSeriesKeys((current) => {
      const availableKeys = new Set(availableMeasureFields.map((field) => field.key));
      const retained = current.filter((key) => availableKeys.has(key));
      if (retained.length) return retained;
      return availableMeasureFields.slice(0, Math.min(5, availableMeasureFields.length)).map((field) => field.key);
    });
  }, [availableMeasureFields]);

  useEffect(() => {
    if (multiLineMode === 'wide' && !availableMeasureFields.length) {
      setMultiLineMode('recordCount');
    }
  }, [availableMeasureFields.length, multiLineMode]);

  const toggleWideSeriesKey = (key) => {
    setSelectedWideSeriesKeys((current) => {
      if (current.includes(key)) return current.filter((item) => item !== key);
      return [...current, key];
    });
  };

  const selectedWideSeriesFields = useMemo(() => {
    if (!availableMeasureFields.length) return [];
    if (wideSeriesPreset === 'all') return availableMeasureFields;

    const selected = availableMeasureFields.filter((field) => selectedWideSeriesKeys.includes(field.key));
    return selected.length ? selected : availableMeasureFields.slice(0, Math.min(5, availableMeasureFields.length));
  }, [availableMeasureFields, selectedWideSeriesKeys, wideSeriesPreset]);

  const resolvedMultiLineMetricField = multiLineMode === 'recordCount' ? 'recordCount' : yField;
  const resolvedMultiLineAggregation = multiLineMode === 'recordCount' ? 'count' : aggregation;

  const chartData = useMemo(
    () => buildAnalyticsChartData({
      rows,
      chartType,
      xField,
      yField: chartType === 'multiLine' ? resolvedMultiLineMetricField : yField,
      lineFilterBy: selectedLineFilterField?.key || lineFilterBy,
      aggregation: chartType === 'multiLine' ? resolvedMultiLineAggregation : aggregation,
      barGroupBy: selectedBarField?.key || barGroupBy,
      barOrientation,
      pieGroupBy: selectedPieField?.key || pieGroupBy,
      histogramValueField: selectedHistogramField?.key || histogramValueField,
      histogramGroupBy: selectedHistogramGroupField?.key || histogramGroupBy,
      stackSegmentBy: selectedStackField?.key || stackSegmentBy,
      groupedBarGroupBy: selectedGroupedBarField?.key || groupedBarGroupBy,
      heatmapRowBy: selectedHeatmapRowField?.key || heatmapRowBy,
      heatmapColumnBy: selectedHeatmapColumnField?.key || heatmapColumnBy,
      multiLineMode: multiLineMode === 'wide' ? 'wide' : 'grouped',
      multiLineGroupBy: selectedMultiLineField?.key || multiLineGroupBy,
      multiLineSeriesFields: selectedWideSeriesFields,
      sunburstParentBy: selectedSunburstParentField?.key || sunburstParentBy,
      sunburstChildBy: selectedSunburstChildField?.key || sunburstChildBy,
      topN,
      categorySelection,
      startYear: startYear || yearRange.minYear,
      endYear: endYear || yearRange.maxYear,
    }),
    [aggregation, barGroupBy, barOrientation, categorySelection, chartType, groupedBarGroupBy, heatmapColumnBy, heatmapRowBy, histogramGroupBy, histogramValueField, lineFilterBy, multiLineGroupBy, multiLineMode, pieGroupBy, rows, selectedBarField, selectedGroupedBarField, selectedHeatmapColumnField, selectedHeatmapRowField, selectedHistogramField, selectedHistogramGroupField, selectedLineFilterField, selectedMultiLineField, selectedPieField, selectedStackField, selectedSunburstChildField, selectedSunburstParentField, selectedWideSeriesFields, resolvedMultiLineMetricField, resolvedMultiLineAggregation, stackSegmentBy, sunburstChildBy, sunburstParentBy, topN, xField, yField, startYear, endYear, yearRange.maxYear, yearRange.minYear]
  );

  const displayChartData = useMemo(() => {
    const customTitle = presentationTitle.trim();
    if (!customTitle) return chartData;
    return {
      ...chartData,
      generatedTitle: chartData?.title,
      title: customTitle,
    };
  }, [chartData, presentationTitle]);

  const handleExportPng = useCallback(async () => {
    setExportStatus(null);
    try {
      const filename = `${slugifyFilenamePart(displayChartData?.title, 'peridot-analytics-chart')}.png`;
      await exportSvgElementToPng(chartSvgRef.current, filename);
      setExportStatus({ type: 'success', message: `Exported ${filename}` });
    } catch (error) {
      setExportStatus({ type: 'error', message: error.message || 'Unable to export chart PNG.' });
    }
  }, [displayChartData?.title]);

  useEffect(() => {
    if (typeof onChartExportControlsChange !== 'function') return undefined;

    onChartExportControlsChange({
      exportStatus: exportStatus
        ? {
          kind: exportStatus.type === 'error' ? 'error' : 'success',
          message: exportStatus.message,
        }
        : null,
      handleExportChartPng: handleExportPng,
      chartTitle: displayChartData?.title || 'Chart',
      chartRowCount: Number.isFinite(displayChartData?.rowCount) ? displayChartData.rowCount : null,
    });

    return () => {
      onChartExportControlsChange(null);
    };
  }, [displayChartData?.rowCount, displayChartData?.title, exportStatus, handleExportPng, onChartExportControlsChange]);

  const renderDateRangeControls = () => {
    if (!yearRange.years.length) return null;
    return (
      <ControlSection
        eyebrow="Step 2"
        title="Set the date window"
        description="Use derived years when available."
        compact
      >
        <div className="grid grid-cols-2 gap-3">
          <SelectControl label="Start year" value={startYear || String(yearRange.minYear)} onChange={setStartYear} options={yearRange.years.map((year) => ({ key: String(year), label: String(year) }))} />
          <SelectControl label="End year" value={endYear || String(yearRange.maxYear)} onChange={setEndYear} options={yearRange.years.map((year) => ({ key: String(year), label: String(year) }))} />
        </div>
      </ControlSection>
    );
  };

  const renderMetricControls = ({ allowRecordCount = true } = {}) => (
    <>
      <SelectControl label="Y-axis / metric" value={yField} onChange={setYField} options={allowRecordCount ? yMetricOptions : availableMeasureFields} description={yField === 'recordCount' ? 'Count records in each group.' : 'Use numeric values from the selected uploaded column.'} />
      {yField !== 'recordCount' ? <SelectControl label="Aggregation" value={aggregation} onChange={setAggregation} options={aggregationOptions} /> : null}
    </>
  );

  const renderAdditiveMetricControls = () => (
    <>
      <SelectControl label="Y-axis / metric" value={yField} onChange={setYField} options={yMetricOptions} description={yField === 'recordCount' ? 'Count records in each group.' : 'Use numeric values from the selected uploaded column.'} />
      {yField !== 'recordCount' ? (
        <div className="rounded-xl bg-[var(--utility-tint-bg)] p-3 text-xs leading-relaxed text-[var(--panel-card-muted-text)]">
          Part-to-whole charts use <strong>Sum</strong> for numeric metrics so slices and stacked segments represent additive totals.
        </div>
      ) : null}
    </>
  );

  const renderCategorySelectionControls = (noun = 'categories') => (
    <ManualCategorySelectionControls
      enabled={manualSelectionSupported}
      selectionMode={categorySelectionMode}
      onSelectionModeChange={setCategorySelectionMode}
      comparisonMode={manualComparisonMode}
      onComparisonModeChange={setManualComparisonMode}
      options={manualCategoryOptions}
      selectedValues={selectedManualCategoryValues}
      onSelectedValuesChange={updateManualCategoryValuesForActiveField}
      searchValue={manualCategorySearch}
      onSearchValueChange={setManualCategorySearch}
      noun={noun}
    />
  );

  /*
   * Render the control surface for the active chart type.
   *
   * This is deliberately kept as UI state/control logic rather than data
   * derivation. When adding a chart, make sure its chartType is represented in
   * `analyticsConfig.js`, its data payload is built in
   * `analyticsDerivationHelpers.js`, and its SVG renderer exists in
   * `analyticsChartComponents.jsx` before adding controls here.
   */
  const renderChartControls = () => {
    if (chartType === 'bar') {
      return (
        <VariableControlsShell>
          {availableBarFields.length ? (
            <>
              <SelectControl label="X-axis / category" value={selectedBarField?.key || ''} onChange={setBarGroupBy} options={availableBarFields} description={selectedBarField?.description} />
              {renderMetricControls()}
              <SelectControl label="Orientation" value={barOrientation} onChange={setBarOrientation} options={[{ key: 'vertical', label: 'Vertical' }, { key: 'horizontal', label: 'Horizontal' }]} />
            </>
          ) : <div className="rounded-xl border border-dashed border-[var(--panel-card-border)] p-3 text-sm text-[var(--panel-card-muted-text)]">No supported categorical fields are available in the current data.</div>}
        </VariableControlsShell>
      );
    }
    if (chartType === 'line') {
      return (
        <VariableControlsShell>
          {activeXAxisFields.length ? <SelectControl label="X-axis" value={xField} onChange={setXField} options={activeXAxisFields} description="Use Year by default, or choose Full date / numeric fields for more granular ordered charts." /> : null}
          {availableBarFields.length ? <SelectControl label="Focus category field" value={selectedLineFilterField?.key || ''} onChange={setLineFilterBy} options={availableBarFields} description="Optionally filter this trend to exact people, places, routes, or categories." /> : null}
          {renderMetricControls()}
          {!activeXAxisFields.length ? <div className="rounded-xl border border-dashed border-[var(--panel-card-border)] p-3 text-sm text-[var(--panel-card-muted-text)]">No date/time or numeric x-axis fields are available for a line chart in the current data.</div> : null}
        </VariableControlsShell>
      );
    }
    if (chartType === 'multiLine') {
      return (
        <VariableControlsShell>
          {activeXAxisFields.length ? <SelectControl label="X-axis" value={xField} onChange={setXField} options={activeXAxisFields} description="Use Year by default, or choose Full date / numeric fields for more granular ordered charts." /> : null}
          <SelectControl
            label="Series mode"
            value={multiLineMode}
            onChange={setMultiLineMode}
            options={[
              { key: 'recordCount', label: 'Record count by grouping field' },
              { key: 'groupedMetric', label: 'Numeric metric by grouping field' },
              { key: 'wide', label: 'Multiple numeric columns' },
            ]}
            description="Choose whether each line represents record count by group, a selected numeric metric by group, or separate numeric columns from a wide table."
          />
          {multiLineMode === 'wide' ? (
            <>
              <SelectControl label="Series selection" value={wideSeriesPreset} onChange={setWideSeriesPreset} options={[{ key: 'selected', label: 'Selected numeric fields' }, { key: 'all', label: 'All numeric fields' }]} />
              {wideSeriesPreset === 'selected' ? (
                <div className="rounded-xl border border-[var(--panel-card-border)] bg-[var(--panel-card-bg)] p-3">
                  <div className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--panel-card-muted-text)]">Y-series columns</div>
                  {availableMeasureFields.length ? (
                    <div className="grid gap-2 sm:grid-cols-2">
                      {availableMeasureFields.map((field) => (
                        <label key={field.key} className="flex items-center gap-2 rounded-lg border border-[var(--panel-card-border)] bg-[var(--utility-tint-bg)] px-3 py-2 text-sm text-[var(--panel-card-text)]">
                          <input
                            type="checkbox"
                            checked={selectedWideSeriesKeys.includes(field.key)}
                            onChange={() => toggleWideSeriesKey(field.key)}
                          />
                          <span>{field.label}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-[var(--panel-card-muted-text)]">No numeric measure fields are available.</div>
                  )}
                  <div className="mt-2 text-xs text-[var(--panel-card-muted-text)]">Selected: {selectedWideSeriesFields.map((field) => field.label).join(', ') || 'none'}.</div>
                </div>
              ) : null}
              {wideSeriesPreset === 'all' ? <div className="rounded-xl bg-[var(--utility-tint-bg)] p-3 text-xs text-[var(--panel-card-muted-text)]">Y-series: {selectedWideSeriesFields.map((field) => field.label).join(', ') || 'none available'}.</div> : null}
            </>
          ) : (
            <>
              {multiLineMode === 'groupedMetric' ? renderMetricControls({ allowRecordCount: false }) : null}
              {multiLineMode === 'recordCount' ? <div className="rounded-xl bg-[var(--utility-tint-bg)] p-3 text-xs text-[var(--panel-card-muted-text)]">Y-axis / metric: Record count.</div> : null}
              {multiLineGroupFields.length ? (
                <SelectControl
                  label="Series / grouping field"
                  value={selectedMultiLineField?.key || ''}
                  onChange={setMultiLineGroupBy}
                  options={multiLineGroupFields}
                  description={selectedMultiLineField?.description}
                />
              ) : (
                <div className="rounded-xl border border-dashed border-[var(--panel-card-border)] p-3 text-sm text-[var(--panel-card-muted-text)]">
                  Multi-line grouped mode needs a categorical series field that is not the selected x-axis, not a date field, and not a numeric measure.
                </div>
              )}
            </>
          )}
          {!availableMeasureFields.length && multiLineMode === 'wide' ? <div className="rounded-xl border border-dashed border-[var(--panel-card-border)] p-3 text-sm text-[var(--panel-card-muted-text)]">This mode needs at least one numeric measure field.</div> : null}
          {!availableMeasureFields.length && multiLineMode === 'groupedMetric' ? <div className="rounded-xl border border-dashed border-[var(--panel-card-border)] p-3 text-sm text-[var(--panel-card-muted-text)]">Numeric metric mode needs at least one numeric measure field. Use Record count by grouping field instead.</div> : null}
        </VariableControlsShell>
      );
    }
    if (chartType === 'pie') {
      return (
        <VariableControlsShell>
          {availablePieFields.length ? <SelectControl label="Slice category" value={selectedPieField?.key || ''} onChange={setPieGroupBy} options={availablePieFields} description={selectedPieField?.description} /> : null}
          {renderAdditiveMetricControls()}
        </VariableControlsShell>
      );
    }
    if (chartType === 'histogram') {
      const histogramUsesRecordCount = selectedHistogramField?.key === 'recordCount';
      return (
        <VariableControlsShell>
          <SelectControl
            label="Value to distribute"
            value={selectedHistogramField?.key || 'recordCount'}
            onChange={setHistogramValueField}
            options={histogramFieldOptions}
            description={histogramUsesRecordCount ? 'Bin categories by how many records each category contains.' : selectedHistogramField?.description}
          />
          {histogramUsesRecordCount ? (
            availableBarFields.length ? (
              <SelectControl
                label="Group record counts by"
                value={selectedHistogramGroupField?.key || ''}
                onChange={setHistogramGroupBy}
                options={availableBarFields}
                description={selectedHistogramGroupField?.description || 'Choose the category whose record-count distribution should be binned.'}
              />
            ) : (
              <div className="rounded-xl border border-dashed border-[var(--panel-card-border)] p-3 text-sm text-[var(--panel-card-muted-text)]">Record-count histograms need at least one categorical field to group records before binning the counts.</div>
            )
          ) : null}
        </VariableControlsShell>
      );
    }
    if (chartType === 'groupedBar') {
      return (
        <VariableControlsShell>
          {availableXAxisFields.length ? <SelectControl label="X-axis / category" value={xField} onChange={setXField} options={availableXAxisFields} /> : null}
          <SelectControl label="Side-by-side grouping field" value={selectedGroupedBarField?.key || ''} onChange={setGroupedBarGroupBy} options={availableSegmentFields} description={selectedGroupedBarField?.description} />
          {renderMetricControls()}
        </VariableControlsShell>
      );
    }
    if (chartType === 'stackedBar') {
      return (
        <VariableControlsShell>
          {availableXAxisFields.length ? <SelectControl label="X-axis / category" value={xField} onChange={setXField} options={availableXAxisFields} /> : null}
          <SelectControl label="Segment field" value={selectedStackField?.key || ''} onChange={setStackSegmentBy} options={availableSegmentFields} description={selectedStackField?.description} />
          {renderAdditiveMetricControls()}
        </VariableControlsShell>
      );
    }
    if (chartType === 'heatmap') {
      return (
        <VariableControlsShell>
          <SelectControl label="Rows" value={selectedHeatmapRowField?.key || ''} onChange={setHeatmapRowBy} options={availableHeatmapRows} description={selectedHeatmapRowField?.description} />
          <SelectControl label="Columns" value={selectedHeatmapColumnField?.key || ''} onChange={setHeatmapColumnBy} options={availableHeatmapColumns} description={selectedHeatmapColumnField?.description} />
          {renderMetricControls()}
        </VariableControlsShell>
      );
    }
    if (chartType === 'sunburst') {
      return (
        <VariableControlsShell>
          <SelectControl label="Parent category" value={selectedSunburstParentField?.key || ''} onChange={setSunburstParentBy} options={availableSegmentFields} description={selectedSunburstParentField?.description} />
          <SelectControl label="Child category" value={selectedSunburstChildField?.key || ''} onChange={setSunburstChildBy} options={availableSegmentFields} description={selectedSunburstChildField?.description} />
          {renderAdditiveMetricControls()}
        </VariableControlsShell>
      );
    }
    return null;
  };


  const limitControlLabel = useMemo(() => {
    if (chartType === 'multiLine') return multiLineMode === 'wide' ? 'Limit displayed series' : 'Limit displayed lines';
    if (chartType === 'pie') return 'Limit displayed slices';
    if (chartType === 'groupedBar') return 'Limit displayed groups';
    if (chartType === 'stackedBar') return 'Limit displayed segments';
    if (chartType === 'heatmap') return 'Limit displayed rows/columns';
    return 'Limit displayed categories';
  }, [chartType, multiLineMode]);

  const categoryNoun = useMemo(() => {
    if (chartType === 'line') return 'records';
    if (chartType === 'multiLine') return 'lines';
    if (chartType === 'pie') return 'slices';
    if (chartType === 'groupedBar') return 'groups';
    if (chartType === 'stackedBar') return 'segments';
    if (chartType === 'heatmap') return 'rows';
    if (chartType === 'sunburst') return 'parent categories';
    return 'categories';
  }, [chartType]);

  const renderCategoryTabControls = () => {
    const showTopNControl = chartType !== 'histogram' || selectedHistogramField?.key === 'recordCount';
    const showTopNForSelection = categorySelectionMode === 'topN' && showTopNControl;
    const showWideSeriesLimit = chartType === 'multiLine' && multiLineMode === 'wide';

    return (
      <VariableControlsShell>
        {showWideSeriesLimit || showTopNForSelection ? (
          <NumberStepperControl label={limitControlLabel} value={topN} onChange={setTopN} />
        ) : null}
        {manualSelectionSupported ? renderCategorySelectionControls(categoryNoun) : (
          <div className="rounded-xl border border-dashed border-[var(--panel-card-border)] p-3 text-sm leading-relaxed text-[var(--panel-card-muted-text)]">
            This chart type does not need a separate manual category picker for the current field configuration.
          </div>
        )}
        {manualSelectionSupported && categorySelectionMode === 'manual' ? (
          <div className="rounded-xl bg-[var(--utility-tint-bg)] p-3 text-xs leading-relaxed text-[var(--panel-card-muted-text)]">
            Category choices apply to <strong>{manualSelectionField?.label || 'the active category field'}</strong> in the current date window.
          </div>
        ) : null}
      </VariableControlsShell>
    );
  };

  const resetChartSettings = () => {
    setChartType('bar');
    setBarGroupBy(availableBarFields[0]?.key || 'sourcePerson');
    setTopN(10);
    setBarOrientation('vertical');
    setXField(availableDateFields[0]?.key || availableXAxisFields[0]?.key || 'year');
    setYField('recordCount');
    setAggregation('count');
    setPieGroupBy(availablePieFields[0]?.key || 'language');
    setHistogramValueField('recordCount');
    setHistogramGroupBy(availableBarFields[0]?.key || 'sourcePerson');
    setStackSegmentBy(availableSegmentFields[0]?.key || 'sourcePerson');
    setGroupedBarGroupBy(availableSegmentFields[0]?.key || 'sourcePerson');
    setMultiLineMode('recordCount');
    setMultiLineGroupBy(multiLineGroupFields[0]?.key || 'sourcePerson');
    setLineFilterBy(availableBarFields[0]?.key || 'sourcePerson');
    setWideSeriesPreset('selected');
    setSelectedWideSeriesKeys(availableMeasureFields.slice(0, Math.min(5, availableMeasureFields.length)).map((field) => field.key));
    setHeatmapRowBy(availableHeatmapRows[0]?.key || 'sourcePerson');
    setHeatmapColumnBy(availableHeatmapColumns[1]?.key || availableHeatmapColumns[0]?.key || 'targetPerson');
    setSunburstParentBy(availableSegmentFields[0]?.key || 'sourceLoc');
    setSunburstChildBy(availableSegmentFields[1]?.key || availableSegmentFields[0]?.key || 'sourcePerson');
    setCategorySelectionMode('topN');
    setManualCategoryValuesByField({});
    setManualComparisonMode('selectedPlusOther');
    setManualCategorySearch('');
    setPresentationTitle('');
    setStartYear(yearRange.minYear ? String(yearRange.minYear) : '');
    setEndYear(yearRange.maxYear ? String(yearRange.maxYear) : '');
    setActiveBuilderTab('chart');
  };

  const chartBuilderTabs = [
    { key: 'chart', label: 'Chart' },
    { key: 'fields', label: 'Fields' },
    { key: 'categories', label: 'Categories', badge: selectedManualCategoryValues.length ? selectedManualCategoryValues.length : '' },
    { key: 'present', label: 'Present', badge: presentationTitle.trim() ? 'Title' : '' },
  ];

  const renderActiveBuilderTab = () => {
    if (activeBuilderTab === 'fields') {
      return (
        <ControlSection
          eyebrow="Fields"
          title="Choose variables"
          description={chartDefinition.variableCountLabel}
        >
          {renderChartControls()}
        </ControlSection>
      );
    }

    if (activeBuilderTab === 'categories') {
      return (
        <ControlSection
          eyebrow="Categories"
          title="Choose visible categories"
          description="Rank automatically or manually choose the categories used by the active chart."
        >
          {renderCategoryTabControls()}
        </ControlSection>
      );
    }

    if (activeBuilderTab === 'present') {
      return (
        <ControlSection
          eyebrow="Present"
          title="Prepare for presentation"
          description="Set an optional title for screenshots and chart export. Leave blank to use the generated analytical title."
        >
          <label className="block text-sm">
            <span className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-[0.14em] text-[var(--peridot-role-analytics-chart-text)]">Presentation title</span>
            <textarea
              value={presentationTitle}
              onChange={(event) => setPresentationTitle(event.target.value)}
              placeholder={chartData?.title || 'Use the generated chart title'}
              rows={3}
              className="w-full resize-none rounded-xl border border-[var(--peridot-role-form-border)] bg-[var(--peridot-role-form-bg-light)] px-3 py-2 text-sm font-semibold leading-relaxed text-[var(--peridot-role-form-text-light)] outline-none transition focus:border-[var(--peridot-role-ornament-line)] focus:ring-2 focus:ring-[var(--peridot-role-interface-focus-ring)]"
            />
          </label>
          <div className="rounded-xl bg-[var(--utility-tint-bg)] p-3 text-xs leading-relaxed text-[var(--panel-card-muted-text)]">
            Generated title: <strong>{chartData?.title || 'Chart'}</strong>
          </div>
          <div className="grid gap-2">
            <button
              type="button"
              className={buttonClassName()}
              onClick={() => setPresentationTitle('')}
            >
              Reset title
            </button>
            <button
              type="button"
              className={buttonClassName()}
              onClick={resetChartSettings}
            >
              Reset chart settings
            </button>
          </div>
        </ControlSection>
      );
    }

    return (
      <>
        <ControlSection
          eyebrow="Chart"
          title="Choose a view"
          description={chartDefinition.descriptor}
        >
          <SelectControl
            label="Chart type"
            value={chartType}
            onChange={setChartType}
            options={Object.values(ANALYTICS_CHART_DEFINITIONS)}
            emphasis
          />
        </ControlSection>

        {renderDateRangeControls()}

        <ChartUseDescription chartDefinition={chartDefinition} />
      </>
    );
  };

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden rounded-[28px] border border-[var(--peridot-role-interface-border-subtle)] bg-[var(--peridot-role-analytics-shell-bg)] text-[var(--peridot-role-analytics-chart-text)] shadow-[0_22px_60px_var(--peridot-role-card-shadow)] lg:flex-row">
      <aside className="flex max-h-[42vh] shrink-0 flex-col overflow-hidden border-b border-[var(--peridot-role-ornament-line-muted)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--peridot-role-analytics-sidebar-bg)_78%,var(--peridot-role-interface-panel-background)_22%),var(--peridot-role-interface-card-background-muted))] lg:max-h-none lg:w-[360px] lg:border-b-0 lg:border-r">
        <div className="shrink-0 border-b border-[var(--peridot-role-ornament-line-muted)] bg-[linear-gradient(135deg,var(--peridot-role-interface-panel-background),var(--peridot-role-interface-panel-background-strong))] px-5 py-3 text-[var(--peridot-role-interface-text-on-dark)] shadow-[inset_0_-1px_0_rgba(255,255,255,0.04)]">
          <h2 className="[font-family:Georgia,'Palatino_Linotype','Book_Antiqua',Palatino,serif] text-[25px] font-bold leading-none tracking-[-0.035em] text-[var(--peridot-role-interface-text-on-dark)]">
            Build Your Chart
          </h2>
          <p className="mt-1.5 text-[11px] leading-snug text-[var(--peridot-role-interface-text-muted-on-dark)]">
            Choose a view, set dates, and map fields.
          </p>
        </div>

        <div className="shrink-0 border-b border-[var(--peridot-role-ornament-line-muted)] bg-[color-mix(in_srgb,var(--peridot-role-analytics-sidebar-bg)_72%,var(--peridot-role-interface-panel-background)_28%)] px-5 py-3">
          <div className="grid grid-cols-2 gap-2" role="tablist" aria-label="Chart builder sections">
            {chartBuilderTabs.map((tab) => (
              <ChartBuilderTabButton
                key={tab.key}
                tab={tab}
                active={activeBuilderTab === tab.key}
                onSelect={setActiveBuilderTab}
              />
            ))}
          </div>
        </div>

        <div className="min-h-0 flex-1 space-y-3 overflow-auto px-5 py-3.5">
          {renderActiveBuilderTab()}
        </div>
      </aside>

      <main className="flex min-h-0 min-w-0 flex-1 flex-col bg-[var(--peridot-role-analytics-shell-bg)]">
        <div className="min-h-0 flex-1 overflow-hidden p-3 md:p-4">
          <div className="mx-auto flex h-full min-h-0 w-full max-w-[1320px] items-stretch">
            <div className="flex h-full min-h-0 w-full rounded-[28px] border border-[var(--peridot-role-ornament-paper-rule)] bg-[var(--peridot-role-analytics-chart-bg)] p-3 shadow-[0_22px_54px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.48)] md:p-4">
              <AnalyticsChartPreview chartData={displayChartData} svgRef={chartSvgRef} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
