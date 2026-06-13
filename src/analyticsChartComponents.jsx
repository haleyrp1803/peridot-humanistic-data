/*
 * SVG chart-rendering primitives for Analytics.
 * 
 * This module contains the presentational chart components used by `AnalyticsPanel.jsx`. It expects chart-ready data objects from `analyticsDerivationHelpers.js` and focuses on drawing axes, marks, labels, legends, tooltips, and empty states for the supported chart families.
 * 
 * Important relationships:
 * - Do not derive filtered datasets here; this file should remain a rendering layer.
 * - Chart dimensions and SVG behavior affect PNG export, because chart export serializes the rendered SVG.
 * - Tooltip and label choices should remain readable for dense humanities datasets with long names, variant spellings, and uneven category counts.
 * 
 * Maintenance cautions:
 * - Prefer improving shared primitives such as `ChartFrame`, `ChartTooltip`, and formatting helpers before adding one-off styling inside individual chart types.
 * - When changing SVG structure, retest chart PNG export.
 */

import React, { useState } from 'react';
import { PERIDOT_THEME } from './peridotTheme.js';

const CHART_COLORS = {
  cardBg: PERIDOT_THEME.analytics.chartBg,
  chartBg: PERIDOT_THEME.analytics.chartBg,
  text: PERIDOT_THEME.analytics.chartText,
  mutedText: PERIDOT_THEME.analytics.chartMutedText,
  grid: PERIDOT_THEME.analytics.grid,
  accent: PERIDOT_THEME.analytics.accent,
  accentDark: PERIDOT_THEME.analytics.accentDark,
  accentLight: PERIDOT_THEME.analytics.accentLight,
  hoverFill: PERIDOT_THEME.analytics.accentLight,
  tooltipBg: PERIDOT_THEME.analytics.tooltipBg,
  tooltipText: PERIDOT_THEME.analytics.tooltipText,
  white: PERIDOT_THEME.interface.textInverse,
};

const PALETTE = Array.isArray(PERIDOT_THEME.analytics.series) && PERIDOT_THEME.analytics.series.length
  ? PERIDOT_THEME.analytics.series
  : PERIDOT_THEME.visualization.series;

function getSeriesColor(index = 0) {
  if (!Array.isArray(PALETTE) || !PALETTE.length) return CHART_COLORS.accent;
  return PALETTE[Math.abs(index) % PALETTE.length] || CHART_COLORS.accent;
}

function getHeatmapCellColor(value = 0, maxValue = 1) {
  if (!Array.isArray(PALETTE) || !PALETTE.length) return CHART_COLORS.accent;
  const numericValue = Number(value || 0);
  const numericMax = Math.max(Number(maxValue || 1), 1);
  if (!Number.isFinite(numericValue) || numericValue <= 0) return getSeriesColor(0);
  const ratio = Math.max(0, Math.min(1, numericValue / numericMax));
  const index = Math.min(PALETTE.length - 1, Math.floor(ratio * PALETTE.length));
  return getSeriesColor(index);
}


// Axis lines need stronger contrast than decorative panel borders. The values
// below intentionally use chart text/muted text roles with opacity rather than
// the very pale grid role alone, because SVG scaling made the previous ticks
// too faint against the parchment chart surface.
const AXIS_COLORS = {
  majorLine: CHART_COLORS.mutedText,
  minorLine: CHART_COLORS.mutedText,
  tickLabel: CHART_COLORS.text,
};

function formatNumber(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '—';
  return Number(value).toLocaleString();
}

function isFiniteChartValue(value) {
  return Number.isFinite(Number(value));
}

function truncateLabel(label, maxLength = 18) {
  const text = String(label || '');
  return text.length > maxLength ? `${text.slice(0, maxLength - 3)}...` : text;
}

function splitLabelLines(label, maxLineLength = 28, maxLines = 2) {
  const words = String(label || '').split(/\s+/).filter(Boolean);
  if (!words.length) return [''];

  const lines = [];
  let currentLine = '';

  words.forEach((word) => {
    const candidate = currentLine ? `${currentLine} ${word}` : word;
    if (candidate.length <= maxLineLength || !currentLine) {
      currentLine = candidate;
      return;
    }
    lines.push(currentLine);
    currentLine = word;
  });

  if (currentLine) lines.push(currentLine);

  if (lines.length <= maxLines) return lines;
  const visibleLines = lines.slice(0, maxLines);
  visibleLines[maxLines - 1] = truncateLabel(visibleLines[maxLines - 1], maxLineLength);
  return visibleLines;
}

function WrappedAxisLabel({ x, y, label, maxLineLength = 30 }) {
  const lines = splitLabelLines(label, maxLineLength, 2);
  const firstDy = lines.length > 1 ? -4 : 0;

  return (
    <text x={x} y={y + firstDy} textAnchor="end" fontSize="11.2" fontWeight="650" fill={CHART_COLORS.text}>
      {lines.map((line, index) => (
        <tspan key={`${label}-${index}`} x={x} dy={index === 0 ? 0 : 12}>{line}</tspan>
      ))}
    </text>
  );
}

function percentLabel(value, total) {
  if (!Number.isFinite(Number(value)) || !Number.isFinite(Number(total)) || Number(total) <= 0) return '0%';
  const percent = (Number(value) / Number(total)) * 100;
  return `${percent >= 10 ? Math.round(percent) : Math.round(percent * 10) / 10}%`;
}

function sortByCountDesc(rows = []) {
  return [...rows].sort((a, b) => Number(b.count || 0) - Number(a.count || 0) || String(a.label || '').localeCompare(String(b.label || '')));
}

function sumCounts(rows = []) {
  return rows.reduce((sum, row) => sum + Number(row?.count || 0), 0);
}

function getSeriesTotal(data = [], seriesLabel, bucketKey = 'groups') {
  return data.reduce((sum, row) => {
    const bucket = (row?.[bucketKey] || []).find((item) => item.label === seriesLabel);
    return sum + Number(bucket?.count || 0);
  }, 0);
}

function getSeriesPeak(data = [], seriesLabel, bucketKey = 'groups') {
  return data.reduce((best, row) => {
    const bucket = (row?.[bucketKey] || []).find((item) => item.label === seriesLabel);
    const count = Number(bucket?.count || 0);
    if (!best || count > best.count) return { label: row.label, count };
    return best;
  }, null);
}

function getLineTotal(points = []) {
  return points.reduce((sum, point) => sum + (isFiniteChartValue(point.count) ? Number(point.count) : 0), 0);
}

function getLinePeak(points = []) {
  return points.reduce((best, point) => {
    if (!isFiniteChartValue(point.count)) return best;
    const count = Number(point.count);
    if (!best || count > best.count) return { label: point.label, count };
    return best;
  }, null);
}

function SummaryPanel({ x, y, width = 280, height = 300, title = 'Details', rows = [], note }) {
  const panelX = Number(x);
  const panelY = Number(y);
  const panelWidth = Number(width);
  const panelHeight = Number(height);
  const labelX = panelX + 10;
  const valueX = panelX + panelWidth - 10;
  const headerHeight = 38;
  const footerHeight = note ? 18 : 8;
  const shownRows = Array.isArray(rows) ? rows : [];
  const availableRowHeight = Math.max(1, panelHeight - headerHeight - footerHeight);
  const rowHeight = shownRows.length
    ? Math.max(10, Math.min(28, availableRowHeight / shownRows.length))
    : 22;
  const denseRows = rowHeight < 14;
  const compactRows = rowHeight < 18;
  const labelMaxLength = denseRows ? 26 : compactRows ? 32 : 42;

  return (
    <g>
      <rect x={panelX} y={panelY} width={panelWidth} height={panelHeight} rx="16" fill={CHART_COLORS.accentLight} opacity="0.30" stroke={CHART_COLORS.grid} />
      <text x={labelX} y={panelY + 23} fontSize="14" fontWeight="850" fill={CHART_COLORS.text}>{title}</text>
      <line x1={labelX} x2={valueX} y1={panelY + 32} y2={panelY + 32} stroke={CHART_COLORS.grid} opacity="0.78" />
      {shownRows.map((row, index) => {
        const rowTop = panelY + headerHeight + index * rowHeight;
        const textX = labelX + (row.color ? 16 : 0);
        const labelY = rowTop + Math.max(8, Math.min(17, rowHeight * 0.68));
        const fullTitle = [row.label, row.value, row.meta].filter(Boolean).join(' — ');
        return (
          <g key={`${row.label}-${index}`}>
            <title>{fullTitle}</title>
            {row.color ? <rect x={labelX} y={rowTop + Math.max(2, (rowHeight - 10) / 2)} width="10" height="10" rx="3.5" fill={row.color} /> : null}
            <text x={textX} y={labelY} fontSize={denseRows ? '8.6' : compactRows ? '9.8' : '11'} fontWeight="760" fill={CHART_COLORS.text}>{truncateLabel(row.label, row.color ? labelMaxLength - 3 : labelMaxLength)}</text>
            <text x={valueX} y={labelY} textAnchor="end" fontSize={denseRows ? '8.8' : compactRows ? '10' : '11.5'} fontWeight="850" fill={CHART_COLORS.text}>{row.value}</text>
          </g>
        );
      })}
      {note ? (
        <>
          <line x1={labelX} x2={valueX} y1={panelY + panelHeight - 18} y2={panelY + panelHeight - 18} stroke={CHART_COLORS.grid} opacity="0.44" />
          <text x={labelX} y={panelY + panelHeight - 6} fontSize="9.25" fill={CHART_COLORS.mutedText}>{truncateLabel(note, 58)}</text>
        </>
      ) : null}
    </g>
  );
}

function getEvenlySpacedIndexes(length, preferredCount = 7) {
  const count = Math.max(0, Number(length) || 0);
  if (!count) return new Set();
  if (count <= preferredCount) return new Set(Array.from({ length: count }, (_, index) => index));
  const maxIndex = count - 1;
  const indexes = new Set([0, maxIndex]);
  const slots = Math.max(2, preferredCount - 1);
  for (let stepIndex = 1; stepIndex < slots; stepIndex += 1) {
    indexes.add(Math.round((stepIndex / slots) * maxIndex));
  }
  return indexes;
}

function getNiceTicks(maxValue, preferredCount = 5) {
  const max = Math.max(0, Number(maxValue) || 0);
  if (max <= 0) return [0, 1];
  const roughStep = max / Math.max(1, preferredCount - 1);
  const magnitude = 10 ** Math.floor(Math.log10(roughStep));
  const candidates = [1, 2, 2.5, 5, 10].map((value) => value * magnitude);
  const step = candidates.find((value) => value >= roughStep) || candidates[candidates.length - 1];
  const tickMax = Math.max(step, Math.ceil(max / step) * step);
  const ticks = [];
  for (let value = 0; value <= tickMax + step * 0.5; value += step) {
    ticks.push(Math.round(value * 1000000) / 1000000);
  }
  return ticks;
}

function getHalfStepTicks(ticks = []) {
  return ticks
    .map((tick, index) => (index < ticks.length - 1 ? (Number(tick) + Number(ticks[index + 1])) / 2 : null))
    .filter((tick) => Number.isFinite(tick));
}

function renderYAxisTicks({ ticks = [], left, top, plotHeight, plotWidth, scaleMax }) {
  const domainMax = Math.max(Number(scaleMax) || 1, 1);
  const minorTicks = getHalfStepTicks(ticks);

  return (
    <g>
      {minorTicks.map((tick) => {
        const y = top + plotHeight - (Number(tick) / domainMax) * plotHeight;
        return (
          <g key={`y-minor-tick-${tick}`}>
            <line x1={left - 5} x2={left} y1={y} y2={y} stroke={AXIS_COLORS.minorLine} strokeWidth="1.05" opacity="0.58" />
            <line x1={left} x2={left + plotWidth} y1={y} y2={y} stroke={AXIS_COLORS.minorLine} strokeWidth="0.85" opacity="0.24" />
          </g>
        );
      })}
      {ticks.map((tick) => {
        const y = top + plotHeight - (Number(tick) / domainMax) * plotHeight;
        return (
          <g key={`y-tick-${tick}`}>
            <line x1={left - 8} x2={left} y1={y} y2={y} stroke={AXIS_COLORS.majorLine} strokeWidth="1.35" opacity="0.9" />
            <line x1={left} x2={left + plotWidth} y1={y} y2={y} stroke={AXIS_COLORS.majorLine} strokeWidth="1.05" opacity={tick === 0 ? 0.72 : 0.46} />
            <text x={left - 12} y={y + 4} textAnchor="end" fontSize="10.5" fontWeight="600" fill={AXIS_COLORS.tickLabel} opacity="0.78">{formatNumber(tick)}</text>
          </g>
        );
      })}
    </g>
  );
}

function renderXAxisTick({ x, y, label, rotate = false }) {
  return (
    <g>
      <line x1={x} x2={x} y1={y} y2={y + 7} stroke={AXIS_COLORS.majorLine} strokeWidth="1.3" opacity="0.88" />
      <text
        x={x}
        y={y + 21}
        textAnchor={rotate ? 'end' : 'middle'}
        fontSize="10.5"
        fontWeight="600"
        fill={AXIS_COLORS.tickLabel}
        opacity="0.76"
        transform={rotate ? `rotate(-35 ${x} ${y + 21})` : undefined}
      >
        {label}
      </text>
    </g>
  );
}

function renderXAxisMinorTicks({ positions = [], y, top = null, showGuides = false }) {
  const sortedPositions = positions
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value))
    .sort((a, b) => a - b);
  const minorPositions = sortedPositions
    .map((position, index) => (index < sortedPositions.length - 1 ? (position + sortedPositions[index + 1]) / 2 : null))
    .filter((position) => Number.isFinite(position));

  return (
    <g>
      {minorPositions.map((x) => (
        <g key={`x-minor-tick-${x}`}>
          {showGuides && top !== null ? (
            <line x1={x} x2={x} y1={top} y2={y} stroke={AXIS_COLORS.minorLine} strokeWidth="0.65" opacity="0.13" />
          ) : null}
          <line x1={x} x2={x} y1={y} y2={y + 5} stroke={AXIS_COLORS.minorLine} strokeWidth="1.05" opacity="0.62" />
        </g>
      ))}
    </g>
  );
}

const CHART_LAYOUT = Object.freeze({
  width: 1080,
  defaultHeight: 438,
  top: 72,
  bottom: 28,
  legendFraction: 0.25,
  legendGutter: 14,
  legendPaddingX: 8,
});

function getChartCardLayout({
  width = CHART_LAYOUT.width,
  height = CHART_LAYOUT.defaultHeight,
  left = 64,
  top = CHART_LAYOUT.top,
  bottom = CHART_LAYOUT.bottom,
  legendFraction = CHART_LAYOUT.legendFraction,
  gutter = CHART_LAYOUT.legendGutter,
} = {}) {
  const legendOuterWidth = Math.round(width * legendFraction);
  const legendX = width - legendOuterWidth;
  const chartRight = legendX - gutter;
  const plotWidth = Math.max(120, chartRight - left);
  const plotHeight = Math.max(160, height - top - bottom);

  return {
    width,
    height,
    left,
    top,
    bottom,
    chartRight,
    plotWidth,
    plotHeight,
    rightReserve: width - chartRight,
    legend: {
      x: legendX + CHART_LAYOUT.legendPaddingX,
      y: top,
      width: legendOuterWidth - CHART_LAYOUT.legendPaddingX * 2,
      height: plotHeight,
    },
  };
}

function getRadialChartGeometry(layout, { maxRadius = 140, centerYOffset = 6 } = {}) {
  const chartWidth = layout.chartRight - layout.left;
  const radius = Math.max(82, Math.min(maxRadius, chartWidth / 2 - 10, layout.plotHeight / 2 - 6));
  return {
    cx: layout.left + chartWidth / 2,
    cy: layout.top + layout.plotHeight / 2 + centerYOffset,
    radius,
  };
}

function getCenteredPanelLayout(chartWidth, chartHeight, panelWidth = 280, panelHeight = 300, rightMargin = 24) {
  const layout = getChartCardLayout({ width: chartWidth, height: chartHeight });
  return layout.legend;
}

function EmptyChartState({ message = 'No chartable data is available for the current selection.' }) {
  return (
    <div className="flex min-h-[220px] items-center justify-center rounded-2xl border border-dashed border-[var(--panel-card-border)] bg-[var(--panel-card-bg)] p-4 text-center text-sm text-[var(--panel-card-muted-text)]">
      {message}
    </div>
  );
}

function ChartTooltip({ tooltip }) {
  if (!tooltip) return null;

  return (
    <div
      className="pointer-events-none absolute z-30 max-w-[260px] rounded-xl border px-3 py-2 text-xs shadow-[0_16px_34px_var(--peridot-role-card-shadow)]"
      style={{
        left: tooltip.x,
        top: tooltip.y,
        transform: 'translate(-50%, calc(-100% - 10px))',
        background: CHART_COLORS.tooltipBg,
        borderColor: CHART_COLORS.grid,
        color: CHART_COLORS.tooltipText,
      }}
    >
      <div className="font-semibold" style={{ color: CHART_COLORS.tooltipText }}>{tooltip.label}</div>
      {tooltip.secondary ? <div style={{ color: CHART_COLORS.tooltipText, opacity: 0.82 }}>{tooltip.secondary}</div> : null}
      <div style={{ color: CHART_COLORS.tooltipText }}>{formatNumber(tooltip.count)} {tooltip.unit || 'records'}</div>
    </div>
  );
}

function buildTooltip(event, item) {
  const container = event.currentTarget.ownerSVGElement?.parentElement;
  const containerRect = container?.getBoundingClientRect();
  const x = containerRect ? event.clientX - containerRect.left : event.clientX;
  const y = containerRect ? event.clientY - containerRect.top : event.clientY;

  return {
    x,
    y,
    label: item.label,
    secondary: item.secondary,
    count: item.count,
    unit: item.unit,
  };
}

function ChartFrame({ children, title, subtitle, svgRef, width, height }) {
  return (
    <div className="relative flex h-full min-h-[320px] w-full min-w-0 items-center justify-center overflow-hidden rounded-2xl border border-[var(--panel-card-border)] bg-[var(--panel-card-bg)] p-1.5">
      {children.tooltip}
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={title}
        preserveAspectRatio="xMidYMid meet"
        className="block h-full max-h-full w-full max-w-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width={width} height={height} rx="24" fill={CHART_COLORS.chartBg} />
        <text x="24" y="24" fontSize="20.5" fontWeight="760" fill={CHART_COLORS.text}>{title}</text>
        <text x="24" y="43" fontSize="12.5" fill={CHART_COLORS.mutedText}>{subtitle}</text>
        {children.chart}
      </svg>
    </div>
  );
}

export function AnalyticsBarChart({ data = [], title, subtitle, svgRef, orientation = 'vertical' }) {
  const [tooltip, setTooltip] = useState(null);

  if (!data.length) return <EmptyChartState />;

  const rankedRows = sortByCountDesc(data);
  const total = sumCounts(data);

  if (orientation === 'horizontal') {
    const rowHeight = 38;
    const height = Math.max(378, CHART_LAYOUT.top + 38 + data.length * rowHeight);
    const layout = getChartCardLayout({ height, left: 264, top: 72, bottom: 30 });
    const { width, top, bottom, left, plotWidth } = layout;
    const maxValue = Math.max(...data.map((row) => row.count), 1);
    const panelLayout = layout.legend;

    return (
      <ChartFrame title={title} subtitle={subtitle} svgRef={svgRef} width={width} height={height}>
        {{
          tooltip: <ChartTooltip tooltip={tooltip} />,
          chart: (
            <>
              <line x1={left} y1={top - 12} x2={left} y2={height - bottom + 8} stroke={CHART_COLORS.grid} />
              {data.map((row, index) => {
                const y = top + index * rowHeight;
                const barWidth = Math.max(2, (row.count / maxValue) * plotWidth);
                return (
                  <g key={row.label}>
                    <WrappedAxisLabel x={left - 12} y={y + 13} label={row.label} />
                    <rect x={left} y={y} width={barWidth} height="22" rx="8" fill={getSeriesColor(index)} opacity="0.9" onMouseMove={(event) => setTooltip(buildTooltip(event, { ...row, secondary: `${percentLabel(row.count, total)} of shown total` }))} onMouseLeave={() => setTooltip(null)} style={{ cursor: 'default' }} />
                    <text x={Math.min(left + barWidth + 8, layout.chartRight - 10)} y={y + 16} fontSize="12" fontWeight="700" fill={CHART_COLORS.text}>{formatNumber(row.count)}</text>
                  </g>
                );
              })}
              <text x={left} y={height - 14} fontSize="12" fill={CHART_COLORS.mutedText}>Value</text>
              <SummaryPanel
                {...panelLayout}
                title="Ranked values"
                rows={rankedRows.map((row, index) => ({ label: row.label, color: getSeriesColor(index), value: formatNumber(row.count), meta: `${percentLabel(row.count, total)} of shown total` }))}
                note={`Shown total: ${formatNumber(total)} ${data[0]?.unit || 'records'}`}
              />
            </>
          ),
        }}
      </ChartFrame>
    );
  }

  const layout = getChartCardLayout({ height: 428, left: 54, top: 72, bottom: 42 });
  const { width, height, left, top, bottom, plotWidth, plotHeight } = layout;
  const yTicks = getNiceTicks(Math.max(...data.map((row) => row.count), 1));
  const scaleMax = yTicks[yTicks.length - 1] || 1;
  const maxValue = scaleMax;
  const barWidth = Math.max(16, Math.min(44, plotWidth / Math.max(data.length, 1) - 10));
  const xLabelIndexes = getEvenlySpacedIndexes(data.length, 8);
  const panelLayout = layout.legend;

  return (
    <ChartFrame title={title} subtitle={subtitle} svgRef={svgRef} width={width} height={height} minWidth={560}>
      {{
        tooltip: <ChartTooltip tooltip={tooltip} />,
        chart: (
          <>
            <line x1={left} x2={layout.chartRight} y1={top + plotHeight} y2={top + plotHeight} stroke={CHART_COLORS.grid} />
            <line x1={left} x2={left} y1={top} y2={top + plotHeight} stroke={CHART_COLORS.grid} />
            {renderYAxisTicks({ ticks: yTicks, left, top, plotHeight, plotWidth, scaleMax: maxValue })}
            {renderXAxisMinorTicks({ positions: data.map((row, index) => {
              const x = data.length === 1 ? left + plotWidth / 2 - barWidth / 2 : left + (index / Math.max(1, data.length - 1)) * (plotWidth - barWidth);
              return x + barWidth / 2;
            }).filter((_, index) => xLabelIndexes.has(index)), y: top + plotHeight, top, showGuides: true })}
            {data.map((row, index) => {
              const x = data.length === 1 ? left + plotWidth / 2 - barWidth / 2 : left + (index / Math.max(1, data.length - 1)) * (plotWidth - barWidth);
              const barHeight = (row.count / maxValue) * plotHeight;
              const y = top + plotHeight - barHeight;
              return (
                <g key={row.label}>
                  <rect x={x} y={y} width={barWidth} height={Math.max(2, barHeight)} rx="8" fill={getSeriesColor(index)} opacity="0.9" onMouseMove={(event) => setTooltip(buildTooltip(event, { ...row, secondary: `${percentLabel(row.count, total)} of shown total` }))} onMouseLeave={() => setTooltip(null)} />
                  <text x={x + barWidth / 2} y={y - 6} textAnchor="middle" fontSize="11" fontWeight="700" fill={CHART_COLORS.text}>{formatNumber(row.count)}</text>
                  {xLabelIndexes.has(index) ? renderXAxisTick({ x: x + barWidth / 2, y: top + plotHeight, label: truncateLabel(row.label, 16), rotate: true }) : null}
                </g>
              );
            })}
            <SummaryPanel
              {...panelLayout}
              title="Ranked values"
              rows={rankedRows.map((row, index) => ({ label: row.label, color: getSeriesColor(index), value: formatNumber(row.count), meta: `${percentLabel(row.count, total)} of shown total` }))}
              note={`Shown total: ${formatNumber(total)} ${data[0]?.unit || 'records'}`}
            />
          </>
        ),
      }}
    </ChartFrame>
  );
}


export function AnalyticsLineChart({ data = [], title, subtitle, svgRef }) {
  const [tooltip, setTooltip] = useState(null);
  if (!data.length) return <EmptyChartState message="No time data is available for the current selection." />;

  const layout = getChartCardLayout({ height: 428, left: 54, top: 72, bottom: 42 });
  const { width, height, left, top, bottom, plotWidth, plotHeight } = layout;
  const finiteValues = data.map((row) => row.count).filter(isFiniteChartValue);
  const yTicks = getNiceTicks(Math.max(...finiteValues, 1));
  const scaleMax = yTicks[yTicks.length - 1] || 1;
  const maxValue = scaleMax;
  const minValue = finiteValues.length ? Math.min(...finiteValues) : 0;
  const peak = data.reduce((best, row) => isFiniteChartValue(row.count) && (!best || Number(row.count) > best.count) ? { label: row.label, count: Number(row.count) } : best, null);
  const low = data.reduce((best, row) => isFiniteChartValue(row.count) && (!best || Number(row.count) < best.count) ? { label: row.label, count: Number(row.count) } : best, null);
  const first = data.find((row) => isFiniteChartValue(row.count));
  const last = [...data].reverse().find((row) => isFiniteChartValue(row.count));
  const netChange = first && last ? Number(last.count) - Number(first.count) : 0;
  const points = data.map((row, index) => {
    const x = data.length === 1 ? left + plotWidth / 2 : left + (index / (data.length - 1)) * plotWidth;
    const y = isFiniteChartValue(row.count) ? top + plotHeight - (Number(row.count) / maxValue) * plotHeight : null;
    return { ...row, x, y };
  });
  const xLabelIndexes = getEvenlySpacedIndexes(points.length, 7);
  const panelLayout = layout.legend;

  return (
    <ChartFrame title={title} subtitle={subtitle} svgRef={svgRef} width={width} height={height}>
      {{
        tooltip: <ChartTooltip tooltip={tooltip} />,
        chart: (
          <>
            <line x1={left} x2={layout.chartRight} y1={top + plotHeight} y2={top + plotHeight} stroke={CHART_COLORS.grid} />
            <line x1={left} x2={left} y1={top} y2={top + plotHeight} stroke={CHART_COLORS.grid} />
            {renderYAxisTicks({ ticks: yTicks, left, top, plotHeight, plotWidth, scaleMax: maxValue })}
            {renderXAxisMinorTicks({ positions: points.filter((_, index) => xLabelIndexes.has(index)).map((point) => point.x), y: top + plotHeight, top, showGuides: true })}
            <path d={points.filter((point) => point.y !== null).map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`).join(' ')} fill="none" stroke={CHART_COLORS.accentDark} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            {points.map((point, index) => (
              <g key={point.label}>
                {point.y !== null ? <circle cx={point.x} cy={point.y} r="5" fill={CHART_COLORS.accent} stroke={CHART_COLORS.chartBg} strokeWidth="2" onMouseMove={(event) => setTooltip(buildTooltip(event, point))} onMouseLeave={() => setTooltip(null)} /> : null}
                {xLabelIndexes.has(index) ? renderXAxisTick({ x: point.x, y: top + plotHeight, label: point.label }) : null}
              </g>
            ))}
            <SummaryPanel
              {...panelLayout}
              title="Trend summary"
              rows={[
                { label: 'Peak', value: peak ? formatNumber(peak.count) : '—', meta: peak ? peak.label : '' },
                { label: 'Low', value: low ? formatNumber(low.count) : '—', meta: low ? low.label : '' },
                { label: 'First value', value: first ? formatNumber(first.count) : '—', meta: first ? first.label : '' },
                { label: 'Last value', value: last ? formatNumber(last.count) : '—', meta: last ? last.label : '' },
                { label: 'Net change', value: `${netChange >= 0 ? '+' : ''}${formatNumber(netChange)}`, meta: `${data.length} ordered points` },
              ]}
              note={`Range: ${formatNumber(minValue)}–${formatNumber(maxValue)}`}
            />
          </>
        ),
      }}
    </ChartFrame>
  );
}


export function AnalyticsPieChart({ data = [], title, subtitle, svgRef }) {
  const [tooltip, setTooltip] = useState(null);
  if (!data.length) return <EmptyChartState />;

  const layout = getChartCardLayout({ height: 428, left: 54, top: 72, bottom: 30 });
  const { width, height } = layout;
  const { cx, cy, radius } = getRadialChartGeometry(layout, { maxRadius: 170, centerYOffset: 4 });
  const total = data.reduce((sum, row) => sum + row.count, 0) || 1;
  let currentAngle = 0;

  function polarToCartesian(angleDegrees) {
    const angleRadians = ((angleDegrees - 90) * Math.PI) / 180;
    return { x: cx + radius * Math.cos(angleRadians), y: cy + radius * Math.sin(angleRadians) };
  }

  function describeArc(startAngle, endAngle) {
    const start = polarToCartesian(endAngle);
    const end = polarToCartesian(startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
    return [`M ${cx} ${cy}`, `L ${start.x} ${start.y}`, `A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`, 'Z'].join(' ');
  }

  const summaryRows = data.map((row, index) => ({
    label: row.label,
    value: formatNumber(row.count),
    meta: `${percentLabel(row.count, total)} of shown total`,
    color: PALETTE[index % PALETTE.length],
  }));
  const panelLayout = layout.legend;

  return (
    <ChartFrame title={title} subtitle={subtitle} svgRef={svgRef} width={width} height={height}>
      {{
        tooltip: <ChartTooltip tooltip={tooltip} />,
        chart: (
          <>
            {data.map((row, index) => {
              const angle = (row.count / total) * 360;
              const startAngle = currentAngle;
              const endAngle = currentAngle + angle;
              currentAngle = endAngle;
              const percent = Math.round((row.count / total) * 1000) / 10;
              return (
                <path key={row.label} d={describeArc(startAngle, endAngle)} fill={tooltip?.label === row.label ? CHART_COLORS.hoverFill : PALETTE[index % PALETTE.length]} stroke={CHART_COLORS.chartBg} strokeWidth="2" onMouseMove={(event) => setTooltip(buildTooltip(event, { ...row, secondary: `${percent}% of shown total` }))} onMouseLeave={() => setTooltip(null)} />
              );
            })}
            <SummaryPanel {...panelLayout} title="Slices and shares" rows={summaryRows} note={`Shown total: ${formatNumber(total)} records`} />
          </>
        ),
      }}
    </ChartFrame>
  );
}


export function AnalyticsGroupedBarChart({ data = [], series = [], title, subtitle, svgRef }) {
  const [tooltip, setTooltip] = useState(null);
  if (!data.length || !series.length) return <EmptyChartState message="No period and category data is available for the current selection." />;

  const layout = getChartCardLayout({ height: 438, left: 54, top: 72, bottom: 44 });
  const { width, height, left, top, bottom, plotWidth, plotHeight } = layout;
  const yTicks = getNiceTicks(Math.max(...data.flatMap((row) => row.groups.map((group) => group.count)), 1));
  const scaleMax = yTicks[yTicks.length - 1] || 1;
  const maxValue = scaleMax;
  const clusterWidth = Math.max(44, plotWidth / Math.max(data.length, 1) - 10);
  const barWidth = Math.max(4, Math.min(14, clusterWidth / Math.max(series.length, 1) - 2));
  const xLabelIndexes = getEvenlySpacedIndexes(data.length, 7);
  const panelLayout = layout.legend;
  const summaryRows = series.map((label, index) => {
    const total = getSeriesTotal(data, label, 'groups');
    const peak = getSeriesPeak(data, label, 'groups');
    return {
      label,
      value: formatNumber(total),
      meta: peak ? `Peak ${formatNumber(peak.count)} in ${peak.label}` : 'No values',
      color: PALETTE[index % PALETTE.length],
    };
  }).sort((a, b) => Number(String(b.value).replace(/,/g, '')) - Number(String(a.value).replace(/,/g, '')));

  return (
    <ChartFrame title={title} subtitle={subtitle} svgRef={svgRef} width={width} height={height} minWidth={620}>
      {{
        tooltip: <ChartTooltip tooltip={tooltip} />,
        chart: (
          <>
            <line x1={left} x2={layout.chartRight} y1={top + plotHeight} y2={top + plotHeight} stroke={CHART_COLORS.grid} />
            <line x1={left} x2={left} y1={top} y2={top + plotHeight} stroke={CHART_COLORS.grid} />
            {renderYAxisTicks({ ticks: yTicks, left, top, plotHeight, plotWidth, scaleMax: maxValue })}
            {renderXAxisMinorTicks({ positions: data.map((row, index) => {
              const clusterX = data.length === 1 ? left + plotWidth / 2 - clusterWidth / 2 : left + (index / Math.max(1, data.length - 1)) * (plotWidth - clusterWidth);
              return clusterX + clusterWidth / 2;
            }).filter((_, index) => xLabelIndexes.has(index)), y: top + plotHeight, top, showGuides: true })}
            {data.map((row, index) => {
              const clusterX = data.length === 1 ? left + plotWidth / 2 - clusterWidth / 2 : left + (index / Math.max(1, data.length - 1)) * (plotWidth - clusterWidth);
              return (
                <g key={row.label}>
                  {row.groups.map((group, groupIndex) => {
                    const barHeight = (group.count / maxValue) * plotHeight;
                    const x = clusterX + groupIndex * (barWidth + 2);
                    const y = top + plotHeight - barHeight;
                    return (
                      <rect key={group.label} x={x} y={y} width={barWidth} height={Math.max(1, barHeight)} rx="3" fill={PALETTE[groupIndex % PALETTE.length]} onMouseMove={(event) => setTooltip(buildTooltip(event, { label: group.label, secondary: row.label, count: group.count, unit: group.unit }))} onMouseLeave={() => setTooltip(null)} />
                    );
                  })}
                  {xLabelIndexes.has(index) ? renderXAxisTick({ x: clusterX + clusterWidth / 2, y: top + plotHeight, label: row.label }) : null}
                </g>
              );
            })}
            <SummaryPanel {...panelLayout} title="Series totals" rows={summaryRows} note="Missing combinations are shown as zero." />
          </>
        ),
      }}
    </ChartFrame>
  );
}


export function AnalyticsStackedBarChart({ data = [], series = [], title, subtitle, svgRef }) {
  const [tooltip, setTooltip] = useState(null);
  if (!data.length || !series.length) return <EmptyChartState message="No period and category data is available for the current selection." />;

  const layout = getChartCardLayout({ height: 438, left: 56, top: 72, bottom: 42 });
  const { width, height, left, top, bottom, plotWidth, plotHeight } = layout;
  const yTicks = getNiceTicks(Math.max(...data.map((row) => row.total), 1));
  const scaleMax = yTicks[yTicks.length - 1] || 1;
  const maxTotal = scaleMax;
  const grandTotal = data.reduce((sum, row) => sum + Number(row.total || 0), 0);
  const barWidth = Math.max(18, Math.min(52, plotWidth / Math.max(data.length, 1) - 10));
  const xLabelIndexes = getEvenlySpacedIndexes(data.length, 7);
  const panelLayout = layout.legend;
  const summaryRows = series.map((label, index) => {
    const total = getSeriesTotal(data.map((row) => ({ ...row, groups: row.segments })), label, 'groups');
    return {
      label,
      value: formatNumber(total),
      meta: `${percentLabel(total, grandTotal)} of shown total`,
      color: PALETTE[index % PALETTE.length],
    };
  }).sort((a, b) => Number(String(b.value).replace(/,/g, '')) - Number(String(a.value).replace(/,/g, '')));

  return (
    <ChartFrame title={title} subtitle={subtitle} svgRef={svgRef} width={width} height={height} minWidth={560}>
      {{
        tooltip: <ChartTooltip tooltip={tooltip} />,
        chart: (
          <>
            <line x1={left} x2={layout.chartRight} y1={top + plotHeight} y2={top + plotHeight} stroke={CHART_COLORS.grid} />
            <line x1={left} x2={left} y1={top} y2={top + plotHeight} stroke={CHART_COLORS.grid} />
            {renderYAxisTicks({ ticks: yTicks, left, top, plotHeight, plotWidth, scaleMax: maxTotal })}
            {renderXAxisMinorTicks({ positions: data.map((row, index) => {
              const x = data.length === 1 ? left + plotWidth / 2 - barWidth / 2 : left + (index / Math.max(1, data.length - 1)) * (plotWidth - barWidth);
              return x + barWidth / 2;
            }).filter((_, index) => xLabelIndexes.has(index)), y: top + plotHeight, top, showGuides: true })}
            {data.map((row, index) => {
              const x = data.length === 1 ? left + plotWidth / 2 - barWidth / 2 : left + (index / Math.max(1, data.length - 1)) * (plotWidth - barWidth);
              let yCursor = top + plotHeight;
              return (
                <g key={row.label}>
                  {row.segments.map((segment, segmentIndex) => {
                    const segmentHeight = (segment.count / maxTotal) * plotHeight;
                    yCursor -= segmentHeight;
                    if (!segment.count) return null;
                    return <rect key={segment.label} x={x} y={yCursor} width={barWidth} height={Math.max(1, segmentHeight)} fill={PALETTE[segmentIndex % PALETTE.length]} stroke={CHART_COLORS.chartBg} strokeWidth="0.8" onMouseMove={(event) => setTooltip(buildTooltip(event, { label: segment.label, secondary: row.label, count: segment.count, unit: segment.unit }))} onMouseLeave={() => setTooltip(null)} />;
                  })}
                  <text x={x + barWidth / 2} y={top + plotHeight - (row.total / maxTotal) * plotHeight - 7} textAnchor="middle" fontSize="10" fontWeight="700" fill={CHART_COLORS.text}>{formatNumber(row.total)}</text>
                  {xLabelIndexes.has(index) ? renderXAxisTick({ x: x + barWidth / 2, y: top + plotHeight, label: row.label }) : null}
                </g>
              );
            })}
            <SummaryPanel {...panelLayout} title="Segment totals" rows={summaryRows} note={`Stacked total: ${formatNumber(grandTotal)}`} />
          </>
        ),
      }}
    </ChartFrame>
  );
}


export function AnalyticsMultiLineChart({ series = [], periods = [], years = [], title, subtitle, svgRef }) {
  const [tooltip, setTooltip] = useState(null);
  const xLabels = periods?.length ? periods : years;
  if (!series.length || !xLabels.length) return <EmptyChartState message="No period and category data is available for the current selection." />;

  const layout = getChartCardLayout({ height: 438, left: 54, top: 72, bottom: 42 });
  const { width, height, left, top, bottom, plotWidth, plotHeight } = layout;
  const finiteValues = series.flatMap((item) => item.points.map((point) => point.count)).filter(isFiniteChartValue);
  const yTicks = getNiceTicks(Math.max(...finiteValues, 1));
  const scaleMax = yTicks[yTicks.length - 1] || 1;
  const maxValue = scaleMax;
  const xLabelIndexes = getEvenlySpacedIndexes(xLabels.length, 7);
  const panelLayout = layout.legend;
  const summaryRows = series.map((item, index) => {
    const total = getLineTotal(item.points);
    const peak = getLinePeak(item.points);
    const last = [...item.points].reverse().find((point) => isFiniteChartValue(point.count));
    return {
      label: item.label,
      value: formatNumber(total),
      meta: peak ? `Peak ${formatNumber(peak.count)} in ${peak.label}${last ? `; last ${formatNumber(last.count)}` : ''}` : 'No values',
      color: PALETTE[index % PALETTE.length],
    };
  }).sort((a, b) => Number(String(b.value).replace(/,/g, '')) - Number(String(a.value).replace(/,/g, '')));

  return (
    <ChartFrame title={title} subtitle={subtitle} svgRef={svgRef} width={width} height={height} minWidth={560}>
      {{
        tooltip: <ChartTooltip tooltip={tooltip} />,
        chart: (
          <>
            <line x1={left} x2={layout.chartRight} y1={top + plotHeight} y2={top + plotHeight} stroke={CHART_COLORS.grid} />
            <line x1={left} x2={left} y1={top} y2={top + plotHeight} stroke={CHART_COLORS.grid} />
            {renderYAxisTicks({ ticks: yTicks, left, top, plotHeight, plotWidth, scaleMax: maxValue })}
            {renderXAxisMinorTicks({ positions: xLabels.map((label, index) => (
              xLabels.length === 1 ? left + plotWidth / 2 : left + (index / (xLabels.length - 1)) * plotWidth
            )).filter((_, index) => xLabelIndexes.has(index)), y: top + plotHeight, top, showGuides: true })}
            {series.map((item, seriesIndex) => {
              const points = item.points.map((point, index) => {
                const x = xLabels.length === 1 ? left + plotWidth / 2 : left + (index / (xLabels.length - 1)) * plotWidth;
                const y = isFiniteChartValue(point.count) ? top + plotHeight - (Number(point.count) / maxValue) * plotHeight : null;
                return { ...point, x, y };
              });
              const pathSegments = [];
              let currentSegment = [];
              points.forEach((point) => {
                if (point.y === null) {
                  if (currentSegment.length) pathSegments.push(currentSegment);
                  currentSegment = [];
                  return;
                }
                currentSegment.push(point);
              });
              if (currentSegment.length) pathSegments.push(currentSegment);
              return (
                <g key={item.label}>
                  {pathSegments.map((segment, segmentIndex) => (
                    <path
                      key={`${item.label}-segment-${segmentIndex}`}
                      d={segment.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`).join(' ')}
                      fill="none"
                      stroke={PALETTE[seriesIndex % PALETTE.length]}
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  ))}
                  {points.map((point, pointIndex) => point.y !== null ? (
                    <circle key={`${item.label}-${point.label}`} cx={point.x} cy={point.y} r="4" fill={PALETTE[seriesIndex % PALETTE.length]} stroke={CHART_COLORS.chartBg} strokeWidth="1.8" onMouseMove={(event) => setTooltip(buildTooltip(event, { label: item.label, secondary: point.label, count: point.count, unit: point.unit }))} onMouseLeave={() => setTooltip(null)} />
                  ) : null)}
                </g>
              );
            })}
            {xLabels.map((label, index) => (
              xLabelIndexes.has(index) ? <g key={label}>{renderXAxisTick({ x: xLabels.length === 1 ? left + plotWidth / 2 : left + (index / (xLabels.length - 1)) * plotWidth, y: top + plotHeight, label })}</g> : null
            ))}
            <SummaryPanel {...panelLayout} title="Line totals" rows={summaryRows} note="Gaps mean no numeric value was present." />
          </>
        ),
      }}
    </ChartFrame>
  );
}


export function AnalyticsHeatmap({ rows = [], columns = [], cells = [], title, subtitle, svgRef }) {
  const [tooltip, setTooltip] = useState(null);
  if (!rows.length || !columns.length) return <EmptyChartState message="No paired categorical data is available for the current selection." />;

  const left = 190;
  const top = 88;
  const bottom = 116;
  const baseLayout = getChartCardLayout({ height: 420, left, top, bottom });
  const cellSize = Math.max(18, Math.min(36, Math.floor(baseLayout.plotWidth / Math.max(columns.length, 1))));
  const height = Math.max(420, top + rows.length * cellSize + bottom);
  const layout = getChartCardLayout({ height, left, top, bottom });
  const { width } = layout;
  const maxValue = Math.max(...cells.map((cell) => cell.count), 1);
  const total = cells.reduce((sum, cell) => sum + Number(cell.count || 0), 0);
  const cellMap = new Map(cells.map((cell) => [`${cell.rowLabel}__${cell.columnLabel}`, cell]));
  const topCells = cells
    .filter((cell) => Number(cell.count || 0) > 0)
    .sort((a, b) => Number(b.count || 0) - Number(a.count || 0))
    .map((cell) => ({
      label: `${cell.rowLabel} × ${cell.columnLabel}`,
      value: formatNumber(cell.count),
      meta: `${percentLabel(cell.count, total)} of matrix total`,
    }));
  const panelLayout = layout.legend;

  return (
    <ChartFrame title={title} subtitle={subtitle} svgRef={svgRef} width={width} height={height} minWidth={560}>
      {{
        tooltip: <ChartTooltip tooltip={tooltip} />,
        chart: (
          <>
            {columns.map((column, index) => <text key={column} x={left + index * cellSize + cellSize / 2} y={top - 10} textAnchor="end" fontSize="10" fill={CHART_COLORS.mutedText} transform={`rotate(-42 ${left + index * cellSize + cellSize / 2} ${top - 10})`}>{truncateLabel(column, 18)}</text>)}
            {rows.map((row, rowIndex) => (
              <g key={row}>
                <text x={left - 10} y={top + rowIndex * cellSize + cellSize / 2 + 4} textAnchor="end" fontSize="11" fill={CHART_COLORS.text}>{truncateLabel(row, 24)}</text>
                {columns.map((column, columnIndex) => {
                  const cell = cellMap.get(`${row}__${column}`) || { rowLabel: row, columnLabel: column, count: 0 };
                  const opacity = cell.count ? 0.2 + (cell.count / maxValue) * 0.75 : 0.08;
                  return <rect key={`${row}-${column}`} x={left + columnIndex * cellSize} y={top + rowIndex * cellSize} width={cellSize - 2} height={cellSize - 2} rx="7" fill={getHeatmapCellColor(cell.count, maxValue)} opacity={opacity} stroke={tooltip?.label === row && tooltip?.secondary === column ? CHART_COLORS.accentDark : CHART_COLORS.chartBg} strokeWidth="2" onMouseMove={(event) => setTooltip(buildTooltip(event, { label: row, secondary: column, count: cell.count, unit: cell.unit }))} onMouseLeave={() => setTooltip(null)} />;
                })}
              </g>
            ))}
            <SummaryPanel {...panelLayout} title="Top combinations" rows={topCells} note={`Matrix total: ${formatNumber(total)}`} />
          </>
        ),
      }}
    </ChartFrame>
  );
}


export function AnalyticsHistogram({ data = [], title, subtitle, svgRef }) {
  const [tooltip, setTooltip] = useState(null);
  if (!data.length) return <EmptyChartState />;

  const layout = getChartCardLayout({ height: 428, left: 54, top: 72, bottom: 42 });
  const { width, height, left, top, bottom, plotWidth, plotHeight } = layout;
  const yTicks = getNiceTicks(Math.max(...data.map((row) => row.count), 1));
  const scaleMax = yTicks[yTicks.length - 1] || 1;
  const maxValue = scaleMax;
  const total = sumCounts(data);
  const barWidth = Math.max(18, Math.min(56, plotWidth / Math.max(data.length, 1) - 10));
  const panelLayout = layout.legend;

  return (
    <ChartFrame title={title} subtitle={subtitle} svgRef={svgRef} width={width} height={height} minWidth={560}>
      {{
        tooltip: <ChartTooltip tooltip={tooltip} />,
        chart: (
          <>
            <line x1={left} x2={layout.chartRight} y1={top + plotHeight} y2={top + plotHeight} stroke={CHART_COLORS.grid} />
            <line x1={left} x2={left} y1={top} y2={top + plotHeight} stroke={CHART_COLORS.grid} />
            {renderYAxisTicks({ ticks: yTicks, left, top, plotHeight, plotWidth, scaleMax: maxValue })}
            {renderXAxisMinorTicks({ positions: data.map((row, index) => {
              const x = data.length === 1 ? left + plotWidth / 2 - barWidth / 2 : left + (index / Math.max(1, data.length - 1)) * (plotWidth - barWidth);
              return x + barWidth / 2;
            }), y: top + plotHeight, top, showGuides: true })}
            {data.map((row, index) => {
              const x = data.length === 1 ? left + plotWidth / 2 - barWidth / 2 : left + (index / Math.max(1, data.length - 1)) * (plotWidth - barWidth);
              const barHeight = (row.count / maxValue) * plotHeight;
              const y = top + plotHeight - barHeight;
              return (
                <g key={row.label}>
                  <rect x={x} y={y} width={barWidth} height={Math.max(2, barHeight)} rx="8" fill={getSeriesColor(index)} opacity="0.9" onMouseMove={(event) => setTooltip(buildTooltip(event, { ...row, secondary: `${percentLabel(row.count, total)} of binned values` }))} onMouseLeave={() => setTooltip(null)} />
                  <text x={x + barWidth / 2} y={y - 6} textAnchor="middle" fontSize="11" fontWeight="700" fill={CHART_COLORS.text}>{formatNumber(row.count)}</text>
                  {renderXAxisTick({ x: x + barWidth / 2, y: top + plotHeight, label: truncateLabel(row.label, 16), rotate: true })}
                </g>
              );
            })}
            <SummaryPanel
              {...panelLayout}
              title="Bin ranges"
              rows={data.map((row, index) => ({ label: row.label, color: getSeriesColor(index), value: formatNumber(row.count), meta: `${percentLabel(row.count, total)} of binned values` }))}
              note={`Binned total: ${formatNumber(total)} ${data[0]?.unit || 'items'}`}
            />
          </>
        ),
      }}
    </ChartFrame>
  );
}


export function AnalyticsSunburst({ parents = [], total = 0, title, subtitle, svgRef }) {
  const [tooltip, setTooltip] = useState(null);
  if (!parents.length || !total) return <EmptyChartState message="No hierarchical data is available for the current selection." />;

  const layout = getChartCardLayout({ height: 438, left: 54, top: 74, bottom: 30 });
  const { width, height } = layout;
  const radial = getRadialChartGeometry(layout, { maxRadius: 180, centerYOffset: 4 });
  const { cx, cy } = radial;
  const outerRadius = radial.radius;
  const outerInnerRadius = Math.round(outerRadius * 0.64);
  const innerRadius = Math.round(outerRadius * 0.49);
  let parentAngle = 0;

  function polar(radius, angleDegrees) {
    const radians = ((angleDegrees - 90) * Math.PI) / 180;
    return { x: cx + radius * Math.cos(radians), y: cy + radius * Math.sin(radians) };
  }

  function ringArc(startAngle, endAngle, r0, r1) {
    const p1 = polar(r1, endAngle);
    const p2 = polar(r1, startAngle);
    const p3 = polar(r0, startAngle);
    const p4 = polar(r0, endAngle);
    const largeArc = endAngle - startAngle <= 180 ? '0' : '1';
    return [`M ${p1.x} ${p1.y}`, `A ${r1} ${r1} 0 ${largeArc} 0 ${p2.x} ${p2.y}`, `L ${p3.x} ${p3.y}`, `A ${r0} ${r0} 0 ${largeArc} 1 ${p4.x} ${p4.y}`, 'Z'].join(' ');
  }

  const summaryRows = parents.map((parent, index) => {
    const topChild = [...(parent.children || [])].sort((a, b) => Number(b.count || 0) - Number(a.count || 0))[0];
    return {
      label: parent.label,
      value: formatNumber(parent.count),
      meta: `${percentLabel(parent.count, total)}; top child ${topChild ? truncateLabel(topChild.label, 22) : 'none'}`,
      color: PALETTE[index % PALETTE.length],
    };
  });
  const panelLayout = layout.legend;

  return (
    <ChartFrame title={title} subtitle={subtitle} svgRef={svgRef} width={width} height={height}>
      {{
        tooltip: <ChartTooltip tooltip={tooltip} />,
        chart: (
          <>
            <circle cx={cx} cy={cy} r={innerRadius - 12} fill={CHART_COLORS.accentLight} opacity="0.55" />
            <text x={cx} y={cy - 4} textAnchor="middle" fontSize="18" fontWeight="700" fill={CHART_COLORS.text}>{formatNumber(total)}</text>
            <text x={cx} y={cy + 16} textAnchor="middle" fontSize="11" fill={CHART_COLORS.mutedText}>total</text>
            {parents.map((parent, parentIndex) => {
              const parentSpan = (parent.count / total) * 360;
              const parentStart = parentAngle;
              const parentEnd = parentAngle + parentSpan;
              parentAngle = parentEnd;
              let childAngle = parentStart;
              return (
                <g key={parent.label}>
                  <path d={ringArc(parentStart, parentEnd, innerRadius, outerInnerRadius)} fill={PALETTE[parentIndex % PALETTE.length]} stroke={CHART_COLORS.chartBg} strokeWidth="2" onMouseMove={(event) => setTooltip(buildTooltip(event, { ...parent, secondary: `${percentLabel(parent.count, total)} of total` }))} onMouseLeave={() => setTooltip(null)} />
                  {parent.children.map((child, childIndex) => {
                    const childSpan = parentSpan * (child.count / Math.max(1, parent.count));
                    const childStart = childAngle;
                    const childEnd = childAngle + childSpan;
                    childAngle = childEnd;
                    return <path key={`${parent.label}-${child.label}`} d={ringArc(childStart, childEnd, outerInnerRadius, outerRadius)} fill={PALETTE[(parentIndex + childIndex + 1) % PALETTE.length]} opacity="0.82" stroke={CHART_COLORS.chartBg} strokeWidth="1.5" onMouseMove={(event) => setTooltip(buildTooltip(event, { ...child, secondary: parent.label }))} onMouseLeave={() => setTooltip(null)} />;
                  })}
                </g>
              );
            })}
            <SummaryPanel {...panelLayout} title="Parent totals" rows={summaryRows} note="Parent totals equal their visible child totals." />
          </>
        ),
      }}
    </ChartFrame>
  );
}


export function AnalyticsChartPreview({ chartData, svgRef }) {
  if (chartData?.chartType === 'line') {
    return <AnalyticsLineChart data={chartData.data} title={chartData.title} subtitle={chartData.subtitle} svgRef={svgRef} />;
  }

  if (chartData?.chartType === 'pie') {
    return <AnalyticsPieChart data={chartData.data} title={chartData.title} subtitle={chartData.subtitle} svgRef={svgRef} />;
  }

  if (chartData?.chartType === 'groupedBar') {
    return <AnalyticsGroupedBarChart data={chartData.data} series={chartData.series} title={chartData.title} subtitle={chartData.subtitle} svgRef={svgRef} />;
  }

  if (chartData?.chartType === 'stackedBar') {
    return <AnalyticsStackedBarChart data={chartData.data} series={chartData.series} title={chartData.title} subtitle={chartData.subtitle} svgRef={svgRef} />;
  }

  if (chartData?.chartType === 'multiLine') {
    return <AnalyticsMultiLineChart series={chartData.series} periods={chartData.periods} years={chartData.years} title={chartData.title} subtitle={chartData.subtitle} svgRef={svgRef} />;
  }

  if (chartData?.chartType === 'heatmap') {
    return <AnalyticsHeatmap rows={chartData.rows} columns={chartData.columns} cells={chartData.cells} title={chartData.title} subtitle={chartData.subtitle} svgRef={svgRef} />;
  }

  if (chartData?.chartType === 'histogram') {
    return <AnalyticsHistogram data={chartData.data} title={chartData.title} subtitle={chartData.subtitle} svgRef={svgRef} />;
  }

  if (chartData?.chartType === 'sunburst') {
    return <AnalyticsSunburst parents={chartData.parents} total={chartData.total} title={chartData.title} subtitle={chartData.subtitle} svgRef={svgRef} />;
  }

  return <AnalyticsBarChart data={chartData?.data || []} title={chartData?.title || 'Analytics chart'} subtitle={chartData?.subtitle || 'Current filtered data.'} svgRef={svgRef} orientation={chartData?.orientation || 'vertical'} />;
}
