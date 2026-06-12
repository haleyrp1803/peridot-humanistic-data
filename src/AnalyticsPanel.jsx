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
import { ANALYTICS_AGGREGATION_OPTIONS, ANALYTICS_CHART_DEFINITIONS, ANALYTICS_TOP_N_OPTIONS, getAnalyticsChartDefinition } from './analyticsConfig';
import { AnalyticsChartPreview } from './analyticsChartComponents';
import { buildAnalyticsChartData, getAnalyticsYearRange } from './analyticsDerivationHelpers';
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
  return (
    <label className="block text-sm">
      <span className={[
        'mb-1.5 block text-[10px] font-extrabold uppercase tracking-[0.14em]',
        emphasis ? 'text-[var(--peridot-role-ornament-line)]' : 'text-[var(--peridot-role-analytics-chart-text)]',
      ].join(' ')}
      >
        {label}
      </span>
      <select
        value={value || ''}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        className={[
          'w-full rounded-xl border px-3 text-sm font-semibold transition',
          emphasis
            ? 'border-[var(--peridot-role-ornament-line)] bg-[var(--peridot-role-button-primary-bg)] py-2.5 text-[var(--peridot-role-button-primary-text)] shadow-[0_8px_18px_rgba(86,52,22,0.18),inset_0_1px_0_rgba(255,255,255,0.28)]'
            : 'border-[var(--peridot-role-form-border)] bg-[var(--peridot-role-form-bg-light)] py-2 text-[var(--peridot-role-form-text-light)] shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]',
          'focus:border-[var(--peridot-role-ornament-line)] focus:outline-none focus:ring-2 focus:ring-[var(--peridot-role-interface-focus-ring)]',
          'disabled:cursor-not-allowed disabled:opacity-70',
        ].join(' ')}
      >
        {options.map((field) => (
          <option key={field.key ?? field} value={field.key ?? field}>{field.label ?? field}</option>
        ))}
      </select>
      {description ? <span className="mt-1 block text-[11px] leading-relaxed text-[var(--peridot-role-analytics-chart-muted-text)]">{description}</span> : null}
    </label>
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
  const [xField, setXField] = useState('timePeriod');
  const [yField, setYField] = useState('recordCount');
  const [aggregation, setAggregation] = useState('count');
  const [pieGroupBy, setPieGroupBy] = useState('language');
  const [histogramValueField, setHistogramValueField] = useState('recordCount');
  const [histogramGroupBy, setHistogramGroupBy] = useState('sourcePerson');
  const [stackSegmentBy, setStackSegmentBy] = useState('sourcePerson');
  const [groupedBarGroupBy, setGroupedBarGroupBy] = useState('sourcePerson');
  const [multiLineMode, setMultiLineMode] = useState('recordCount');
  const [multiLineGroupBy, setMultiLineGroupBy] = useState('sourcePerson');
  const [wideSeriesPreset, setWideSeriesPreset] = useState('selected');
  const [selectedWideSeriesKeys, setSelectedWideSeriesKeys] = useState([]);
  const [heatmapRowBy, setHeatmapRowBy] = useState('sourcePerson');
  const [heatmapColumnBy, setHeatmapColumnBy] = useState('targetPerson');
  const [sunburstParentBy, setSunburstParentBy] = useState('sourceLoc');
  const [sunburstChildBy, setSunburstChildBy] = useState('sourcePerson');

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
  const availableDateFields = availableFields?.dateFieldOptions || [];
  const availableMeasureFields = availableFields?.numericMeasureOptions || [];
  const yMetricOptions = availableFields?.yMetricOptions || [{ key: 'recordCount', label: 'Record count', description: 'Count records in each group.' }];
  const aggregationOptions = ANALYTICS_AGGREGATION_OPTIONS.filter((option) => yField !== 'recordCount' || option.key === 'count');

  useEffect(() => {
    if (!availableXAxisFields.length) return;
    if (!availableXAxisFields.some((field) => field.key === xField)) {
      setXField(availableDateFields[0]?.key || availableXAxisFields[0].key);
    }
  }, [availableDateFields, availableXAxisFields, xField]);

  useEffect(() => {
    if (!yMetricOptions.some((field) => field.key === yField)) {
      setYField(yMetricOptions[0]?.key || 'recordCount');
    }
  }, [yField, yMetricOptions]);

  useEffect(() => {
    if (yField === 'recordCount') setAggregation('count');
  }, [yField]);

  const selectedBarField = useMemo(() => availableBarFields.find((field) => field.key === barGroupBy) || availableBarFields[0], [availableBarFields, barGroupBy]);
  const selectedPieField = useMemo(() => availablePieFields.find((field) => field.key === pieGroupBy) || availablePieFields[0], [availablePieFields, pieGroupBy]);
  const histogramFieldOptions = yMetricOptions;
  const selectedHistogramField = useMemo(() => histogramFieldOptions.find((field) => field.key === histogramValueField) || histogramFieldOptions[0], [histogramFieldOptions, histogramValueField]);
  const selectedHistogramGroupField = useMemo(() => availableBarFields.find((field) => field.key === histogramGroupBy) || availableBarFields[0], [availableBarFields, histogramGroupBy]);
  const selectedStackField = useMemo(() => availableSegmentFields.find((field) => field.key === stackSegmentBy) || availableSegmentFields[0], [availableSegmentFields, stackSegmentBy]);
  const selectedGroupedBarField = useMemo(() => availableSegmentFields.find((field) => field.key === groupedBarGroupBy) || availableSegmentFields[0], [availableSegmentFields, groupedBarGroupBy]);
  const selectedMultiLineField = useMemo(() => availableSegmentFields.find((field) => field.key === multiLineGroupBy) || availableSegmentFields[0], [availableSegmentFields, multiLineGroupBy]);
  const selectedHeatmapRowField = useMemo(() => availableHeatmapRows.find((field) => field.key === heatmapRowBy) || availableHeatmapRows[0], [availableHeatmapRows, heatmapRowBy]);
  const selectedHeatmapColumnField = useMemo(() => availableHeatmapColumns.find((field) => field.key === heatmapColumnBy) || availableHeatmapColumns[1] || availableHeatmapColumns[0], [availableHeatmapColumns, heatmapColumnBy]);
  const selectedSunburstParentField = useMemo(() => availableSegmentFields.find((field) => field.key === sunburstParentBy) || availableSegmentFields[0], [availableSegmentFields, sunburstParentBy]);
  const selectedSunburstChildField = useMemo(() => availableSegmentFields.find((field) => field.key === sunburstChildBy) || availableSegmentFields[1] || availableSegmentFields[0], [availableSegmentFields, sunburstChildBy]);
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
      startYear: startYear || yearRange.minYear,
      endYear: endYear || yearRange.maxYear,
    }),
    [aggregation, barGroupBy, barOrientation, chartType, groupedBarGroupBy, heatmapColumnBy, heatmapRowBy, histogramGroupBy, histogramValueField, multiLineGroupBy, multiLineMode, pieGroupBy, rows, selectedBarField, selectedGroupedBarField, selectedHeatmapColumnField, selectedHeatmapRowField, selectedHistogramField, selectedHistogramGroupField, selectedMultiLineField, selectedPieField, selectedStackField, selectedSunburstChildField, selectedSunburstParentField, selectedWideSeriesFields, resolvedMultiLineMetricField, resolvedMultiLineAggregation, stackSegmentBy, sunburstChildBy, sunburstParentBy, topN, xField, yField, startYear, endYear, yearRange.maxYear, yearRange.minYear]
  );

  const handleExportPng = useCallback(async () => {
    setExportStatus(null);
    try {
      const filename = `${slugifyFilenamePart(chartData?.title, 'peridot-analytics-chart')}.png`;
      await exportSvgElementToPng(chartSvgRef.current, filename);
      setExportStatus({ type: 'success', message: `Exported ${filename}` });
    } catch (error) {
      setExportStatus({ type: 'error', message: error.message || 'Unable to export chart PNG.' });
    }
  }, [chartData?.title]);

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
      chartTitle: chartData?.title || 'Chart',
      chartRowCount: Number.isFinite(chartData?.rowCount) ? chartData.rowCount : null,
    });

    return () => {
      onChartExportControlsChange(null);
    };
  }, [chartData?.rowCount, chartData?.title, exportStatus, handleExportPng, onChartExportControlsChange]);

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
              <SelectControl label="Limit displayed categories" value={topN} onChange={(value) => setTopN(Number(value))} options={ANALYTICS_TOP_N_OPTIONS} />
            </>
          ) : <div className="rounded-xl border border-dashed border-[var(--panel-card-border)] p-3 text-sm text-[var(--panel-card-muted-text)]">No supported categorical fields are available in the current data.</div>}
        </VariableControlsShell>
      );
    }
    if (chartType === 'line') {
      return (
        <VariableControlsShell>
          {availableXAxisFields.length ? <SelectControl label="X-axis" value={xField} onChange={setXField} options={availableXAxisFields} /> : null}
          {renderMetricControls()}
          {!availableXAxisFields.length ? <div className="rounded-xl border border-dashed border-[var(--panel-card-border)] p-3 text-sm text-[var(--panel-card-muted-text)]">No x-axis fields are available in the current data.</div> : null}
        </VariableControlsShell>
      );
    }
    if (chartType === 'multiLine') {
      return (
        <VariableControlsShell>
          {availableXAxisFields.length ? <SelectControl label="X-axis" value={xField} onChange={setXField} options={availableXAxisFields} /> : null}
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
              <SelectControl label="Limit displayed series" value={topN} onChange={(value) => setTopN(Number(value))} options={ANALYTICS_TOP_N_OPTIONS} />
            </>
          ) : (
            <>
              {multiLineMode === 'groupedMetric' ? renderMetricControls({ allowRecordCount: false }) : null}
              {multiLineMode === 'recordCount' ? <div className="rounded-xl bg-[var(--utility-tint-bg)] p-3 text-xs text-[var(--panel-card-muted-text)]">Y-axis / metric: Record count.</div> : null}
              <SelectControl label="Series / grouping field" value={selectedMultiLineField?.key || ''} onChange={setMultiLineGroupBy} options={availableSegmentFields} description={selectedMultiLineField?.description} />
              <SelectControl label="Limit displayed lines" value={topN} onChange={(value) => setTopN(Number(value))} options={ANALYTICS_TOP_N_OPTIONS} />
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
          {renderMetricControls()}
          <SelectControl label="Limit displayed slices" value={topN} onChange={(value) => setTopN(Number(value))} options={ANALYTICS_TOP_N_OPTIONS} />
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
          <SelectControl label="Limit displayed groups" value={topN} onChange={(value) => setTopN(Number(value))} options={ANALYTICS_TOP_N_OPTIONS} />
        </VariableControlsShell>
      );
    }
    if (chartType === 'stackedBar') {
      return (
        <VariableControlsShell>
          {availableXAxisFields.length ? <SelectControl label="X-axis / category" value={xField} onChange={setXField} options={availableXAxisFields} /> : null}
          <SelectControl label="Segment field" value={selectedStackField?.key || ''} onChange={setStackSegmentBy} options={availableSegmentFields} description={selectedStackField?.description} />
          {renderMetricControls()}
          <SelectControl label="Limit displayed segments" value={topN} onChange={(value) => setTopN(Number(value))} options={ANALYTICS_TOP_N_OPTIONS} />
        </VariableControlsShell>
      );
    }
    if (chartType === 'heatmap') {
      return (
        <VariableControlsShell>
          <SelectControl label="Rows" value={selectedHeatmapRowField?.key || ''} onChange={setHeatmapRowBy} options={availableHeatmapRows} description={selectedHeatmapRowField?.description} />
          <SelectControl label="Columns" value={selectedHeatmapColumnField?.key || ''} onChange={setHeatmapColumnBy} options={availableHeatmapColumns} description={selectedHeatmapColumnField?.description} />
          {renderMetricControls()}
          <SelectControl label="Limit displayed rows/columns" value={topN} onChange={(value) => setTopN(Number(value))} options={ANALYTICS_TOP_N_OPTIONS} />
        </VariableControlsShell>
      );
    }
    if (chartType === 'sunburst') {
      return (
        <VariableControlsShell>
          <SelectControl label="Parent category" value={selectedSunburstParentField?.key || ''} onChange={setSunburstParentBy} options={availableSegmentFields} description={selectedSunburstParentField?.description} />
          <SelectControl label="Child category" value={selectedSunburstChildField?.key || ''} onChange={setSunburstChildBy} options={availableSegmentFields} description={selectedSunburstChildField?.description} />
          {renderMetricControls()}
          <SelectControl label="Limit displayed categories" value={topN} onChange={(value) => setTopN(Number(value))} options={ANALYTICS_TOP_N_OPTIONS} />
        </VariableControlsShell>
      );
    }
    return null;
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

        <div className="min-h-0 flex-1 space-y-3 overflow-auto px-5 py-3.5">
          <ControlSection
            eyebrow="Step 1"
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

          <ControlSection
            eyebrow="Step 3"
            title="Choose variables"
            description={chartDefinition.variableCountLabel}
          >
            {renderChartControls()}
          </ControlSection>

        </div>
      </aside>

      <main className="flex min-h-0 min-w-0 flex-1 flex-col bg-[var(--peridot-role-analytics-chart-bg)]">
        <div className="min-h-0 flex-1 overflow-hidden p-3 md:p-4">
          <div className="mx-auto flex h-full min-h-0 w-full max-w-[1320px] items-stretch">
            <div className="flex h-full min-h-0 w-full rounded-[26px] border border-[var(--peridot-role-interface-border-subtle)] bg-[var(--peridot-role-analytics-chart-bg)] p-3 shadow-[0_18px_42px_var(--peridot-role-card-shadow)] md:p-4">
              <AnalyticsChartPreview chartData={chartData} svgRef={chartSvgRef} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
