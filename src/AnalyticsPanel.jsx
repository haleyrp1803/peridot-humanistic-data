import React, { useMemo, useRef, useState } from 'react';
import { ANALYTICS_CHART_DEFINITIONS, ANALYTICS_TOP_N_OPTIONS, getAnalyticsChartDefinition } from './analyticsConfig';
import { AnalyticsChartPreview } from './analyticsChartComponents';

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
  if (chartType === 'line') {
    return (
      <svg viewBox="0 0 48 48" className="h-14 w-14" aria-hidden="true">
        <rect x="5" y="5" width="38" height="38" rx="10" fill="currentColor" opacity="0.08" />
        <polyline points="9,33 18,25 27,29 39,15" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="9" cy="33" r="3" fill="currentColor" />
        <circle cx="18" cy="25" r="3" fill="currentColor" />
        <circle cx="27" cy="29" r="3" fill="currentColor" />
        <circle cx="39" cy="15" r="3" fill="currentColor" />
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
        'aspect-square rounded-2xl border p-3 text-center transition-all',
        'flex flex-col items-center justify-center gap-2',
        active
          ? 'border-[var(--button-primary-active-border)] bg-[var(--button-primary-active-bg)] text-[var(--button-primary-text)] shadow-[0_10px_22px_rgba(0,0,0,0.22)]'
          : 'border-[var(--section-border)] bg-[var(--section-bg)] text-[var(--text-main)] hover:bg-[var(--button-secondary-hover)]',
      ].join(' ')}
      aria-pressed={active}
    >
      <ChartTypeIcon chartType={option.key} />
      <span className="text-sm font-semibold">{option.label}</span>
    </button>
  );
}

function ChartUseDescription({ chartDefinition }) {
  return (
    <div className="rounded-xl bg-[var(--utility-tint-bg)] p-3 text-sm">
      <div className="font-semibold text-[var(--panel-card-text)]">{chartDefinition.label}</div>
      <div className="mt-1 text-[var(--panel-card-muted-text)]">{chartDefinition.descriptor}</div>
      <div className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--panel-card-muted-text)]">Example questions</div>
      <div className="mt-2 space-y-1 text-xs text-[var(--panel-card-muted-text)]">
        {chartDefinition.exampleQuestions.map((question) => (
          <div key={question}>{question}</div>
        ))}
      </div>
    </div>
  );
}

export function AnalyticsPanelContent({
  analyticsState,
}) {
  const chartSvgRef = useRef(null);
  const [exportStatus, setExportStatus] = useState(null);

  const {
    chartType,
    setChartType,
    barGroupBy,
    setBarGroupBy,
    topN,
    setTopN,
    availableFields,
    chartData,
  } = analyticsState;

  const chartDefinition = getAnalyticsChartDefinition(chartType);
  const availableBarFields = availableFields?.barGroupOptions || [];
  const canRenderBarControls = chartType === 'bar' && availableBarFields.length > 0;
  const canRenderLine = chartType === 'line' && availableFields?.hasYearData;

  const selectedBarField = useMemo(() => {
    return availableBarFields.find((field) => field.key === barGroupBy) || availableBarFields[0];
  }, [availableBarFields, barGroupBy]);

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

  return (
    <div className="space-y-5">
      <div>
        <div className="text-sm text-[var(--muted-text)]">
          Build compact charts from the current Peridot data. This first version supports ranked bar charts and yearly line charts.
        </div>
      </div>

      <section className="space-y-3">
        <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--panel-card-muted-text)]">Choose a chart</div>
        <div className="grid grid-cols-2 gap-3">
          <ChartTypeButton
            option={ANALYTICS_CHART_DEFINITIONS.bar}
            active={chartType === 'bar'}
            onSelect={() => setChartType('bar')}
          />
          <ChartTypeButton
            option={ANALYTICS_CHART_DEFINITIONS.line}
            active={chartType === 'line'}
            onSelect={() => setChartType('line')}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--section-border)] bg-[var(--section-bg)] p-4">
        <div className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--panel-card-muted-text)]">Configure chart</div>
        <ChartUseDescription chartDefinition={chartDefinition} />

        {chartType === 'bar' ? (
          <div className="mt-4 space-y-3">
            {canRenderBarControls ? (
              <>
                <label className="block text-sm">
                  <span className="mb-1 block font-medium text-[var(--panel-card-text)]">Group by</span>
                  <select
                    value={selectedBarField?.key || ''}
                    onChange={(event) => setBarGroupBy(event.target.value)}
                    className="w-full rounded-xl border border-[var(--input-border)]/80 bg-[var(--input-bg)] px-3 py-2 text-[var(--input-text)]"
                  >
                    {availableBarFields.map((field) => (
                      <option key={field.key} value={field.key}>{field.label}</option>
                    ))}
                  </select>
                  {selectedBarField?.description ? (
                    <span className="mt-1 block text-xs text-[var(--panel-card-muted-text)]">{selectedBarField.description}</span>
                  ) : null}
                </label>

                <label className="block text-sm">
                  <span className="mb-1 block font-medium text-[var(--panel-card-text)]">Show</span>
                  <select
                    value={topN}
                    onChange={(event) => setTopN(Number(event.target.value))}
                    className="w-full rounded-xl border border-[var(--input-border)]/80 bg-[var(--input-bg)] px-3 py-2 text-[var(--input-text)]"
                  >
                    {ANALYTICS_TOP_N_OPTIONS.map((value) => (
                      <option key={value} value={value}>Top {value}</option>
                    ))}
                  </select>
                </label>
              </>
            ) : (
              <div className="rounded-xl border border-dashed border-[var(--panel-card-border)] p-3 text-sm text-[var(--panel-card-muted-text)]">
                No supported categorical fields are available in the current data.
              </div>
            )}
          </div>
        ) : (
          <div className="mt-4 space-y-2 text-sm text-[var(--panel-card-muted-text)]">
            <div>X-axis: Year</div>
            <div>Metric: Letter count</div>
            {!canRenderLine ? (
              <div className="rounded-xl border border-dashed border-[var(--panel-card-border)] p-3">
                No usable year values are available in the current data.
              </div>
            ) : null}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--panel-card-muted-text)]">Preview</div>
        <AnalyticsChartPreview chartData={chartData} svgRef={chartSvgRef} />
        <button
          type="button"
          onClick={handleExportPng}
          className={buttonClassName()}
          disabled={!chartData?.data?.length}
        >
          Export chart PNG
        </button>
        {exportStatus ? (
          <div
            className={[
              'rounded-xl border p-3 text-sm',
              exportStatus.type === 'error'
                ? 'border-red-300 bg-red-50 text-red-800'
                : 'border-[var(--panel-card-border)] bg-[var(--utility-tint-bg)] text-[var(--panel-card-text)]',
            ].join(' ')}
          >
            {exportStatus.message}
          </div>
        ) : null}
      </section>
    </div>
  );
}
