import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ANALYTICS_CHART_DEFINITIONS, ANALYTICS_TOP_N_OPTIONS, getAnalyticsChartDefinition } from './analyticsConfig';
import { AnalyticsChartPreview } from './analyticsChartComponents';
import { buildAnalyticsChartData, getAnalyticsYearRange } from './analyticsDerivationHelpers';

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

    context.fillStyle = '#fbf8f1';
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
  if (chartType === 'line' || chartType === 'multiLine') {
    const secondLine = chartType === 'multiLine';
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
    return (
      <svg viewBox="0 0 48 48" className="h-14 w-14" aria-hidden="true">
        <rect x="5" y="5" width="38" height="38" rx="10" fill="currentColor" opacity="0.08" />
        {[12, 22, 32].map((x, index) => (
          <g key={x}>
            <rect x={x} y={26 - index * 3} width="5" height="11" rx="1.5" fill="currentColor" opacity={chartType === 'groupedBar' ? '0.72' : '0.35'} />
            <rect x={chartType === 'groupedBar' ? x + 5 : x} y={17 - index * 3} width="5" height="9" rx="1.5" fill="currentColor" opacity="0.62" />
            {chartType === 'stackedBar' ? <rect x={x} y={11 - index * 2} width="5" height="6" rx="1.5" fill="currentColor" /> : null}
          </g>
        ))}
      </svg>
    );
  }

  if (chartType === 'histogram') {
    return (
      <svg viewBox="0 0 48 48" className="h-14 w-14" aria-hidden="true">
        <rect x="5" y="5" width="38" height="38" rx="10" fill="currentColor" opacity="0.08" />
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

function SelectControl({ label, value, onChange, options, description, disabled = false }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium text-[var(--panel-card-text)]">{label}</span>
      <select
        value={value || ''}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        className="w-full rounded-xl border border-[var(--input-border)]/80 bg-[var(--input-bg)] px-3 py-2 text-[var(--input-text)] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {options.map((field) => (
          <option key={field.key ?? field} value={field.key ?? field}>{field.label ?? field}</option>
        ))}
      </select>
      {description ? <span className="mt-1 block text-xs text-[var(--panel-card-muted-text)]">{description}</span> : null}
    </label>
  );
}

function VariableControlsShell({ children }) {
  return (
    <div className="mt-4 space-y-3">
      <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--panel-card-muted-text)]">Variables</div>
      {children}
    </div>
  );
}

export function AnalyticsPanelContent({
  analyticsState,
}) {
  const chartSvgRef = useRef(null);
  const [exportStatus, setExportStatus] = useState(null);
  const [barOrientation, setBarOrientation] = useState('vertical');
  const [pieGroupBy, setPieGroupBy] = useState('language');
  const [histogramGroupBy, setHistogramGroupBy] = useState('sourcePerson');
  const [stackSegmentBy, setStackSegmentBy] = useState('sourcePerson');
  const [groupedBarGroupBy, setGroupedBarGroupBy] = useState('sourcePerson');
  const [multiLineGroupBy, setMultiLineGroupBy] = useState('sourcePerson');
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
    if (!yearRange.years.length) return;
    setStartYear((current) => current || String(yearRange.minYear));
    setEndYear((current) => current || String(yearRange.maxYear));
  }, [yearRange.maxYear, yearRange.minYear, yearRange.years.length]);

  const chartDefinition = getAnalyticsChartDefinition(chartType);
  const availableBarFields = availableFields?.barGroupOptions || [];
  const availablePieFields = availableFields?.pieGroupOptions || availableBarFields;
  const availableSegmentFields = availableFields?.segmentGroupOptions || [];
  const availableHeatmapRows = availableFields?.heatmapRowOptions || [];
  const availableHeatmapColumns = availableFields?.heatmapColumnOptions || [];
  const canRenderBarControls = chartType === 'bar' && availableBarFields.length > 0;
  const canRenderLine = chartType === 'line' && availableFields?.hasYearData;

  const selectedBarField = useMemo(() => availableBarFields.find((field) => field.key === barGroupBy) || availableBarFields[0], [availableBarFields, barGroupBy]);
  const selectedPieField = useMemo(() => availablePieFields.find((field) => field.key === pieGroupBy) || availablePieFields[0], [availablePieFields, pieGroupBy]);
  const selectedHistogramField = useMemo(() => availableSegmentFields.find((field) => field.key === histogramGroupBy) || availableSegmentFields[0], [availableSegmentFields, histogramGroupBy]);
  const selectedStackField = useMemo(() => availableSegmentFields.find((field) => field.key === stackSegmentBy) || availableSegmentFields[0], [availableSegmentFields, stackSegmentBy]);
  const selectedGroupedBarField = useMemo(() => availableSegmentFields.find((field) => field.key === groupedBarGroupBy) || availableSegmentFields[0], [availableSegmentFields, groupedBarGroupBy]);
  const selectedMultiLineField = useMemo(() => availableSegmentFields.find((field) => field.key === multiLineGroupBy) || availableSegmentFields[0], [availableSegmentFields, multiLineGroupBy]);
  const selectedHeatmapRowField = useMemo(() => availableHeatmapRows.find((field) => field.key === heatmapRowBy) || availableHeatmapRows[0], [availableHeatmapRows, heatmapRowBy]);
  const selectedHeatmapColumnField = useMemo(() => availableHeatmapColumns.find((field) => field.key === heatmapColumnBy) || availableHeatmapColumns[1] || availableHeatmapColumns[0], [availableHeatmapColumns, heatmapColumnBy]);
  const selectedSunburstParentField = useMemo(() => availableSegmentFields.find((field) => field.key === sunburstParentBy) || availableSegmentFields.find((field) => field.key === 'sourceLoc') || availableSegmentFields[0], [availableSegmentFields, sunburstParentBy]);
  const selectedSunburstChildField = useMemo(() => availableSegmentFields.find((field) => field.key === sunburstChildBy) || availableSegmentFields.find((field) => field.key === 'sourcePerson') || availableSegmentFields[1] || availableSegmentFields[0], [availableSegmentFields, sunburstChildBy]);

  const chartData = useMemo(
    () => buildAnalyticsChartData({
      rows,
      chartType,
      barGroupBy,
      barOrientation,
      pieGroupBy: selectedPieField?.key || pieGroupBy,
      histogramGroupBy: selectedHistogramField?.key || histogramGroupBy,
      stackSegmentBy: selectedStackField?.key || stackSegmentBy,
      groupedBarGroupBy: selectedGroupedBarField?.key || groupedBarGroupBy,
      heatmapRowBy: selectedHeatmapRowField?.key || heatmapRowBy,
      heatmapColumnBy: selectedHeatmapColumnField?.key || heatmapColumnBy,
      multiLineGroupBy: selectedMultiLineField?.key || multiLineGroupBy,
      sunburstParentBy: selectedSunburstParentField?.key || sunburstParentBy,
      sunburstChildBy: selectedSunburstChildField?.key || sunburstChildBy,
      topN,
      startYear: startYear || yearRange.minYear,
      endYear: endYear || yearRange.maxYear,
    }),
    [barGroupBy, barOrientation, chartType, groupedBarGroupBy, heatmapColumnBy, heatmapRowBy, histogramGroupBy, multiLineGroupBy, pieGroupBy, rows, selectedGroupedBarField, selectedHeatmapColumnField, selectedHeatmapRowField, selectedHistogramField, selectedMultiLineField, selectedPieField, selectedStackField, selectedSunburstChildField, selectedSunburstParentField, stackSegmentBy, sunburstChildBy, sunburstParentBy, topN, startYear, endYear, yearRange.maxYear, yearRange.minYear]
  );

  const handleExportPng = async () => {
    setExportStatus(null);
    try {
      const filename = `${slugifyFilenamePart(chartData?.title, 'peridot-analytics-chart')}.png`;
      await exportSvgElementToPng(chartSvgRef.current, filename);
      setExportStatus({ type: 'success', message: `Exported ${filename}` });
    } catch (error) {
      setExportStatus({ type: 'error', message: error.message || 'Unable to export chart PNG.' });
    }
  };

  const renderDateRangeControls = () => {
    if (!yearRange.years.length) return null;

    return (
      <div className="rounded-2xl border border-[var(--panel-card-border)] bg-[var(--panel-card-bg)] p-3">
        <div className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--panel-card-muted-text)]">Date range</div>
        <div className="grid grid-cols-2 gap-3">
          <SelectControl label="Start year" value={startYear || String(yearRange.minYear)} onChange={setStartYear} options={yearRange.years.map((year) => ({ key: String(year), label: String(year) }))} />
          <SelectControl label="End year" value={endYear || String(yearRange.maxYear)} onChange={setEndYear} options={yearRange.years.map((year) => ({ key: String(year), label: String(year) }))} />
        </div>
        <div className="mt-2 text-xs text-[var(--panel-card-muted-text)]">
          Periods automatically adjust: year, half-year, quarter, or month depending on range length.
        </div>
      </div>
    );
  };

  const renderChartControls = () => {
    if (chartType === 'bar') {
      return (
        <VariableControlsShell>
          {canRenderBarControls ? (
            <>
              <SelectControl label="Variable 1: category to rank" value={selectedBarField?.key || ''} onChange={setBarGroupBy} options={availableBarFields} description={selectedBarField?.description} />
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
          <SelectControl label="Variable 1: x-axis" value="timePeriod" onChange={() => {}} options={[{ key: 'timePeriod', label: 'Time period' }]} description="The period automatically switches from year to half-year, quarter, or month based on the selected date range." disabled />
          <div className="rounded-xl bg-[var(--utility-tint-bg)] p-3 text-xs text-[var(--panel-card-muted-text)]">Metric: letter count.</div>
          {!canRenderLine ? <div className="rounded-xl border border-dashed border-[var(--panel-card-border)] p-3 text-sm text-[var(--panel-card-muted-text)]">No usable date values are available in the current data.</div> : null}
        </VariableControlsShell>
      );
    }

    if (chartType === 'pie') {
      return (
        <VariableControlsShell>
          {availablePieFields.length ? (
            <>
              <SelectControl label="Variable 1: slice category" value={selectedPieField?.key || ''} onChange={setPieGroupBy} options={availablePieFields} description={selectedPieField?.description} />
              <SelectControl label="Limit displayed slices" value={topN} onChange={(value) => setTopN(Number(value))} options={ANALYTICS_TOP_N_OPTIONS} />
            </>
          ) : <div className="rounded-xl border border-dashed border-[var(--panel-card-border)] p-3 text-sm text-[var(--panel-card-muted-text)]">No supported part-to-whole fields are available in the current data.</div>}
        </VariableControlsShell>
      );
    }

    if (chartType === 'histogram') {
      return (
        <VariableControlsShell>
          {availableSegmentFields.length ? (
            <SelectControl label="Variable 1: entity to distribute by letter volume" value={selectedHistogramField?.key || ''} onChange={setHistogramGroupBy} options={availableSegmentFields} description={selectedHistogramField?.description} />
          ) : <div className="rounded-xl border border-dashed border-[var(--panel-card-border)] p-3 text-sm text-[var(--panel-card-muted-text)]">No supported histogram fields are available in the current data.</div>}
        </VariableControlsShell>
      );
    }

    if (chartType === 'groupedBar') {
      return (
        <VariableControlsShell>
          {availableSegmentFields.length ? (
            <>
              <SelectControl label="Variable 1: x-axis" value="timePeriod" onChange={() => {}} options={[{ key: 'timePeriod', label: 'Time period' }]} description="Time periods are grouped along the x-axis." disabled />
              <SelectControl label="Variable 2: side-by-side group field" value={selectedGroupedBarField?.key || ''} onChange={setGroupedBarGroupBy} options={availableSegmentFields} description={selectedGroupedBarField?.description} />
              <SelectControl label="Limit displayed groups" value={topN} onChange={(value) => setTopN(Number(value))} options={ANALYTICS_TOP_N_OPTIONS} />
            </>
          ) : <div className="rounded-xl border border-dashed border-[var(--panel-card-border)] p-3 text-sm text-[var(--panel-card-muted-text)]">No supported grouping fields are available in the current data.</div>}
        </VariableControlsShell>
      );
    }

    if (chartType === 'stackedBar') {
      return (
        <VariableControlsShell>
          {availableSegmentFields.length ? (
            <>
              <SelectControl label="Variable 1: x-axis" value="timePeriod" onChange={() => {}} options={[{ key: 'timePeriod', label: 'Time period' }]} description="Time periods are grouped along the x-axis." disabled />
              <SelectControl label="Variable 2: segment field" value={selectedStackField?.key || ''} onChange={setStackSegmentBy} options={availableSegmentFields} description={selectedStackField?.description} />
              <SelectControl label="Limit displayed segments" value={topN} onChange={(value) => setTopN(Number(value))} options={ANALYTICS_TOP_N_OPTIONS} />
            </>
          ) : <div className="rounded-xl border border-dashed border-[var(--panel-card-border)] p-3 text-sm text-[var(--panel-card-muted-text)]">No supported split fields are available in the current data.</div>}
        </VariableControlsShell>
      );
    }

    if (chartType === 'multiLine') {
      return (
        <VariableControlsShell>
          {availableSegmentFields.length ? (
            <>
              <SelectControl label="Variable 1: x-axis" value="timePeriod" onChange={() => {}} options={[{ key: 'timePeriod', label: 'Time period' }]} description="Time periods place every line on a common chronological scale." disabled />
              <SelectControl label="Variable 2: line grouping" value={selectedMultiLineField?.key || ''} onChange={setMultiLineGroupBy} options={availableSegmentFields} description={selectedMultiLineField?.description} />
              <SelectControl label="Limit displayed lines" value={topN} onChange={(value) => setTopN(Number(value))} options={ANALYTICS_TOP_N_OPTIONS} />
            </>
          ) : <div className="rounded-xl border border-dashed border-[var(--panel-card-border)] p-3 text-sm text-[var(--panel-card-muted-text)]">No supported line-splitting fields are available in the current data.</div>}
        </VariableControlsShell>
      );
    }

    if (chartType === 'heatmap') {
      return (
        <VariableControlsShell>
          {availableHeatmapRows.length && availableHeatmapColumns.length ? (
            <>
              <SelectControl label="Variable 1: rows" value={selectedHeatmapRowField?.key || ''} onChange={setHeatmapRowBy} options={availableHeatmapRows} description={selectedHeatmapRowField?.description} />
              <SelectControl label="Variable 2: columns" value={selectedHeatmapColumnField?.key || ''} onChange={setHeatmapColumnBy} options={availableHeatmapColumns} description={selectedHeatmapColumnField?.description} />
              <SelectControl label="Limit displayed rows/columns" value={topN} onChange={(value) => setTopN(Number(value))} options={ANALYTICS_TOP_N_OPTIONS} />
            </>
          ) : <div className="rounded-xl border border-dashed border-[var(--panel-card-border)] p-3 text-sm text-[var(--panel-card-muted-text)]">No supported heat-map fields are available in the current data.</div>}
        </VariableControlsShell>
      );
    }

    if (chartType === 'sunburst') {
      return (
        <VariableControlsShell>
          {availableSegmentFields.length ? (
            <>
              <SelectControl label="Variable 1: inner-ring parent category" value={selectedSunburstParentField?.key || ''} onChange={setSunburstParentBy} options={availableSegmentFields} description={selectedSunburstParentField?.description} />
              <SelectControl label="Variable 2: outer-ring child category" value={selectedSunburstChildField?.key || ''} onChange={setSunburstChildBy} options={availableSegmentFields} description={selectedSunburstChildField?.description} />
              <SelectControl label="Limit displayed categories" value={topN} onChange={(value) => setTopN(Number(value))} options={ANALYTICS_TOP_N_OPTIONS} />
            </>
          ) : <div className="rounded-xl border border-dashed border-[var(--panel-card-border)] p-3 text-sm text-[var(--panel-card-muted-text)]">No supported hierarchy fields are available in the current data.</div>}
        </VariableControlsShell>
      );
    }

    return null;
  };

  return (
    <div className="space-y-5">
      <div>
        <div className="text-sm text-[var(--muted-text)]">
          Build compact charts from the current Peridot data. Charts reflect the current filtered data where applicable.
        </div>
      </div>

      <section className="space-y-3">
        <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--panel-card-muted-text)]">Choose a chart</div>
        <div className="grid grid-cols-3 gap-3">
          {Object.values(ANALYTICS_CHART_DEFINITIONS).map((option) => (
            <ChartTypeButton
              key={option.key}
              option={option}
              active={chartType === option.key}
              onSelect={() => setChartType(option.key)}
            />
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--section-border)] bg-[var(--section-bg)] p-4">
        <div className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--panel-card-muted-text)]">Configure chart</div>
        <ChartUseDescription chartDefinition={chartDefinition} />
        <div className="mt-4 space-y-4">
          {renderDateRangeControls()}
          {renderChartControls()}
        </div>
      </section>

      <section className="space-y-3">
        <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--panel-card-muted-text)]">Preview</div>
        <AnalyticsChartPreview chartData={chartData} svgRef={chartSvgRef} />
        <button type="button" onClick={handleExportPng} className={buttonClassName()} disabled={!chartData}>
          Export chart PNG
        </button>
        {exportStatus ? (
          <div className={['rounded-xl border p-3 text-sm', exportStatus.type === 'error' ? 'border-red-300 bg-red-50 text-red-800' : 'border-[var(--panel-card-border)] bg-[var(--utility-tint-bg)] text-[var(--panel-card-text)]'].join(' ')}>
            {exportStatus.message}
          </div>
        ) : null}
      </section>
    </div>
  );
}
