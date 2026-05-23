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

async function exportSvgElementToPng(svgElement, filename) {
  if (!svgElement) throw new Error('No chart SVG is available to export.');

  const serializer = new XMLSerializer();
  const svgText = serializer.serializeToString(svgElement);
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

function ChartOptionCard({ option, active, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={[
        'w-full rounded-2xl border p-3 text-left transition-all',
        active
          ? 'border-[var(--button-primary-active-border)] bg-[var(--button-primary-active-bg)] text-[var(--button-primary-text)] shadow-[0_10px_22px_rgba(0,0,0,0.22)]'
          : 'border-[var(--section-border)] bg-[var(--section-bg)] text-[var(--text-main)] hover:bg-[var(--button-secondary-hover)]',
      ].join(' ')}
    >
      <div className="text-sm font-semibold">{option.label}</div>
      <div className="mt-1 text-xs opacity-85">{option.descriptor}</div>
      <div className="mt-2 space-y-1 text-xs opacity-80">
        {option.exampleQuestions.map((question) => (
          <div key={question}>{question}</div>
        ))}
      </div>
    </button>
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
          Build compact charts from the current Peridot data. The first version supports ranked bar charts and yearly line charts.
        </div>
      </div>

      <section className="space-y-3">
        <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--panel-card-muted-text)]">Choose a chart</div>
        <ChartOptionCard
          option={ANALYTICS_CHART_DEFINITIONS.bar}
          active={chartType === 'bar'}
          onSelect={() => setChartType('bar')}
        />
        <ChartOptionCard
          option={ANALYTICS_CHART_DEFINITIONS.line}
          active={chartType === 'line'}
          onSelect={() => setChartType('line')}
        />
      </section>

      <section className="rounded-2xl border border-[var(--section-border)] bg-[var(--section-bg)] p-4">
        <div className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--panel-card-muted-text)]">Configure chart</div>
        <div className="mb-3 rounded-xl bg-[var(--utility-tint-bg)] p-3 text-sm">
          <div className="font-semibold text-[var(--panel-card-text)]">{chartDefinition.label}</div>
          <div className="mt-1 text-[var(--panel-card-muted-text)]">{chartDefinition.descriptor}</div>
        </div>

        {chartType === 'bar' ? (
          <div className="space-y-3">
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
          <div className="space-y-2 text-sm text-[var(--panel-card-muted-text)]">
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
          <div className={[
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
