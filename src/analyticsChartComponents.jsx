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

const CHART_COLORS = {
  cardBg: '#fbf8f1',
  chartBg: '#fbf8f1',
  text: '#2f372f',
  mutedText: '#6a7263',
  grid: '#d8d0bf',
  accent: '#6f8a4f',
  accentDark: '#435b31',
  accentLight: '#cfe0b6',
  hoverFill: '#9aae75',
  white: '#ffffff',
};

const PALETTE = ['#6f8a4f', '#9aae75', '#435b31', '#c4a15a', '#8f6f4e', '#607d8b', '#8a6f9e', '#b7796b', '#4f8277', '#a8a05f'];

function formatNumber(value) {
  return Number(value || 0).toLocaleString();
}

function truncateLabel(label, maxLength = 18) {
  const text = String(label || '');
  return text.length > maxLength ? `${text.slice(0, maxLength - 3)}...` : text;
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
      className="pointer-events-none absolute z-30 max-w-[260px] rounded-xl border border-[#4d6046] bg-[#6e8475] px-3 py-2 text-xs text-[#fbf8f1] shadow-[0_16px_34px_rgba(0,0,0,0.36)]"
      style={{
        left: tooltip.x,
        top: tooltip.y,
        transform: 'translate(-50%, calc(-100% - 10px))',
      }}
    >
      <div className="font-semibold text-[#fff9ed]">{tooltip.label}</div>
      {tooltip.secondary ? <div className="text-[#edf2df]">{tooltip.secondary}</div> : null}
      <div className="text-[#fbf8f1]">{formatNumber(tooltip.count)} {tooltip.unit || 'records'}</div>
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
    <div className="relative flex h-full min-h-[320px] w-full min-w-0 items-center justify-center overflow-hidden rounded-2xl border border-[var(--panel-card-border)] bg-[var(--panel-card-bg)] p-3">
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
        <text x="28" y="34" fontSize="22" fontWeight="700" fill={CHART_COLORS.text}>{title}</text>
        <text x="28" y="56" fontSize="13" fill={CHART_COLORS.mutedText}>{subtitle}</text>
        {children.chart}
      </svg>
    </div>
  );
}

export function AnalyticsBarChart({ data = [], title, subtitle, svgRef, orientation = 'vertical' }) {
  const [tooltip, setTooltip] = useState(null);

  if (!data.length) return <EmptyChartState />;

  if (orientation === 'horizontal') {
    const width = 720;
    const rowHeight = 34;
    const top = 72;
    const right = 54;
    const bottom = 42;
    const left = 210;
    const height = Math.max(300, top + bottom + data.length * rowHeight);
    const maxValue = Math.max(...data.map((row) => row.count), 1);
    const plotWidth = width - left - right;

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
                    <text x={left - 12} y={y + 17} textAnchor="end" fontSize="12" fill={CHART_COLORS.text}>{truncateLabel(row.label, 28)}</text>
                    <rect x={left} y={y} width={barWidth} height="22" rx="8" fill={tooltip?.label === row.label ? CHART_COLORS.hoverFill : CHART_COLORS.accent} opacity="0.9" onMouseMove={(event) => setTooltip(buildTooltip(event, row))} onMouseLeave={() => setTooltip(null)} style={{ cursor: 'default' }} />
                    <text x={Math.min(left + barWidth + 8, width - 38)} y={y + 16} fontSize="12" fontWeight="700" fill={CHART_COLORS.text}>{formatNumber(row.count)}</text>
                  </g>
                );
              })}
              <text x={left} y={height - 14} fontSize="12" fill={CHART_COLORS.mutedText}>Value</text>
            </>
          ),
        }}
      </ChartFrame>
    );
  }

  const width = 760;
  const height = 390;
  const left = 58;
  const right = 28;
  const top = 76;
  const bottom = 86;
  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;
  const maxValue = Math.max(...data.map((row) => row.count), 1);
  const barWidth = Math.max(16, Math.min(48, plotWidth / Math.max(data.length, 1) - 10));
  const labelEvery = Math.max(1, Math.ceil(data.length / 8));

  return (
    <ChartFrame title={title} subtitle={subtitle} svgRef={svgRef} width={width} height={height} minWidth={560}>
      {{
        tooltip: <ChartTooltip tooltip={tooltip} />,
        chart: (
          <>
            <line x1={left} x2={width - right} y1={top + plotHeight} y2={top + plotHeight} stroke={CHART_COLORS.grid} />
            <line x1={left} x2={left} y1={top} y2={top + plotHeight} stroke={CHART_COLORS.grid} />
            {data.map((row, index) => {
              const x = data.length === 1 ? left + plotWidth / 2 - barWidth / 2 : left + (index / Math.max(1, data.length - 1)) * (plotWidth - barWidth);
              const barHeight = (row.count / maxValue) * plotHeight;
              const y = top + plotHeight - barHeight;
              return (
                <g key={row.label}>
                  <rect x={x} y={y} width={barWidth} height={Math.max(2, barHeight)} rx="8" fill={tooltip?.label === row.label ? CHART_COLORS.hoverFill : CHART_COLORS.accent} opacity="0.9" onMouseMove={(event) => setTooltip(buildTooltip(event, row))} onMouseLeave={() => setTooltip(null)} />
                  <text x={x + barWidth / 2} y={y - 6} textAnchor="middle" fontSize="11" fontWeight="700" fill={CHART_COLORS.text}>{formatNumber(row.count)}</text>
                  {index % labelEvery === 0 || index === data.length - 1 ? (
                    <text x={x + barWidth / 2} y={top + plotHeight + 20} textAnchor="end" fontSize="10" fill={CHART_COLORS.mutedText} transform={`rotate(-35 ${x + barWidth / 2} ${top + plotHeight + 20})`}>{truncateLabel(row.label, 16)}</text>
                  ) : null}
                </g>
              );
            })}
          </>
        ),
      }}
    </ChartFrame>
  );
}

export function AnalyticsLineChart({ data = [], title, subtitle, svgRef }) {
  const [tooltip, setTooltip] = useState(null);
  if (!data.length) return <EmptyChartState message="No time data is available for the current selection." />;

  const width = 760;
  const height = 390;
  const left = 58;
  const right = 32;
  const top = 76;
  const bottom = 74;
  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;
  const maxValue = Math.max(...data.map((row) => row.count), 1);
  const points = data.map((row, index) => {
    const x = data.length === 1 ? left + plotWidth / 2 : left + (index / (data.length - 1)) * plotWidth;
    const y = top + plotHeight - (row.count / maxValue) * plotHeight;
    return { ...row, x, y };
  });
  const path = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`).join(' ');
  const labelEvery = Math.max(1, Math.ceil(data.length / 7));

  return (
    <ChartFrame title={title} subtitle={subtitle} svgRef={svgRef} width={width} height={height} minWidth={560}>
      {{
        tooltip: <ChartTooltip tooltip={tooltip} />,
        chart: (
          <>
            <line x1={left} x2={width - right} y1={top + plotHeight} y2={top + plotHeight} stroke={CHART_COLORS.grid} />
            <line x1={left} x2={left} y1={top} y2={top + plotHeight} stroke={CHART_COLORS.grid} />
            <path d={path} fill="none" stroke={CHART_COLORS.accent} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            {points.map((point, index) => (
              <g key={point.label}>
                <circle cx={point.x} cy={point.y} r={tooltip?.label === point.label ? 7 : 4.8} fill={tooltip?.label === point.label ? CHART_COLORS.hoverFill : CHART_COLORS.accent} stroke={CHART_COLORS.chartBg} strokeWidth="2" onMouseMove={(event) => setTooltip(buildTooltip(event, point))} onMouseLeave={() => setTooltip(null)} />
                {index % labelEvery === 0 || index === points.length - 1 ? <text x={point.x} y={top + plotHeight + 22} textAnchor="middle" fontSize="11" fill={CHART_COLORS.mutedText}>{point.label}</text> : null}
              </g>
            ))}
          </>
        ),
      }}
    </ChartFrame>
  );
}

export function AnalyticsPieChart({ data = [], title, subtitle, svgRef }) {
  const [tooltip, setTooltip] = useState(null);
  if (!data.length) return <EmptyChartState />;

  const width = 720;
  const height = 380;
  const cx = 230;
  const cy = 205;
  const radius = 120;
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
            {data.map((row, index) => (
              <g key={`legend-${row.label}`}>
                <rect x="400" y={100 + index * 24} width="14" height="14" rx="4" fill={PALETTE[index % PALETTE.length]} />
                <text x="424" y={112 + index * 24} fontSize="12" fill={CHART_COLORS.text}>{truncateLabel(row.label, 28)}</text>
                <text x="648" y={112 + index * 24} textAnchor="end" fontSize="12" fontWeight="700" fill={CHART_COLORS.text}>{formatNumber(row.count)}</text>
              </g>
            ))}
          </>
        ),
      }}
    </ChartFrame>
  );
}

export function AnalyticsGroupedBarChart({ data = [], series = [], title, subtitle, svgRef }) {
  const [tooltip, setTooltip] = useState(null);
  if (!data.length || !series.length) return <EmptyChartState message="No period and category data is available for the current selection." />;

  const width = 800;
  const height = 420;
  const left = 58;
  const right = 32;
  const top = 76;
  const bottom = 86;
  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;
  const maxValue = Math.max(...data.flatMap((row) => row.groups.map((group) => group.count)), 1);
  const clusterWidth = Math.max(44, plotWidth / Math.max(data.length, 1) - 10);
  const barWidth = Math.max(4, Math.min(14, clusterWidth / Math.max(series.length, 1) - 2));
  const labelEvery = Math.max(1, Math.ceil(data.length / 7));

  return (
    <ChartFrame title={title} subtitle={subtitle} svgRef={svgRef} width={width} height={height} minWidth={620}>
      {{
        tooltip: <ChartTooltip tooltip={tooltip} />,
        chart: (
          <>
            <line x1={left} x2={width - right} y1={top + plotHeight} y2={top + plotHeight} stroke={CHART_COLORS.grid} />
            <line x1={left} x2={left} y1={top} y2={top + plotHeight} stroke={CHART_COLORS.grid} />
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
                  {index % labelEvery === 0 || index === data.length - 1 ? <text x={clusterX + clusterWidth / 2} y={top + plotHeight + 20} textAnchor="middle" fontSize="11" fill={CHART_COLORS.mutedText}>{row.label}</text> : null}
                </g>
              );
            })}
            {series.slice(0, 6).map((label, index) => (
              <g key={label}>
                <rect x={left + index * 116} y={height - 28} width="12" height="12" rx="3" fill={PALETTE[index % PALETTE.length]} />
                <text x={left + 18 + index * 116} y={height - 18} fontSize="10" fill={CHART_COLORS.mutedText}>{truncateLabel(label, 14)}</text>
              </g>
            ))}
          </>
        ),
      }}
    </ChartFrame>
  );
}

export function AnalyticsStackedBarChart({ data = [], series = [], title, subtitle, svgRef }) {
  const [tooltip, setTooltip] = useState(null);
  if (!data.length || !series.length) return <EmptyChartState message="No period and category data is available for the current selection." />;

  const width = 760;
  const height = 390;
  const left = 60;
  const right = 28;
  const top = 76;
  const bottom = 74;
  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;
  const maxTotal = Math.max(...data.map((row) => row.total), 1);
  const barWidth = Math.max(18, Math.min(52, plotWidth / Math.max(data.length, 1) - 10));
  const labelEvery = Math.max(1, Math.ceil(data.length / 7));

  return (
    <ChartFrame title={title} subtitle={subtitle} svgRef={svgRef} width={width} height={height} minWidth={560}>
      {{
        tooltip: <ChartTooltip tooltip={tooltip} />,
        chart: (
          <>
            <line x1={left} x2={width - right} y1={top + plotHeight} y2={top + plotHeight} stroke={CHART_COLORS.grid} />
            <line x1={left} x2={left} y1={top} y2={top + plotHeight} stroke={CHART_COLORS.grid} />
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
                  {index % labelEvery === 0 || index === data.length - 1 ? <text x={x + barWidth / 2} y={top + plotHeight + 22} textAnchor="middle" fontSize="11" fill={CHART_COLORS.mutedText}>{row.label}</text> : null}
                </g>
              );
            })}
            {series.slice(0, 6).map((label, index) => (
              <g key={label}>
                <rect x={left + index * 112} y={height - 28} width="12" height="12" rx="3" fill={PALETTE[index % PALETTE.length]} />
                <text x={left + 18 + index * 112} y={height - 18} fontSize="10" fill={CHART_COLORS.mutedText}>{truncateLabel(label, 14)}</text>
              </g>
            ))}
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

  const width = 760;
  const height = 390;
  const left = 58;
  const right = 32;
  const top = 76;
  const bottom = 74;
  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;
  const maxValue = Math.max(...series.flatMap((item) => item.points.map((point) => point.count)), 1);
  const labelEvery = Math.max(1, Math.ceil(xLabels.length / 7));

  return (
    <ChartFrame title={title} subtitle={subtitle} svgRef={svgRef} width={width} height={height} minWidth={560}>
      {{
        tooltip: <ChartTooltip tooltip={tooltip} />,
        chart: (
          <>
            <line x1={left} x2={width - right} y1={top + plotHeight} y2={top + plotHeight} stroke={CHART_COLORS.grid} />
            <line x1={left} x2={left} y1={top} y2={top + plotHeight} stroke={CHART_COLORS.grid} />
            {series.map((item, seriesIndex) => {
              const points = item.points.map((point, index) => {
                const x = xLabels.length === 1 ? left + plotWidth / 2 : left + (index / (xLabels.length - 1)) * plotWidth;
                const y = top + plotHeight - (point.count / maxValue) * plotHeight;
                return { ...point, x, y };
              });
              const path = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`).join(' ');
              return (
                <g key={item.label}>
                  <path d={path} fill="none" stroke={PALETTE[seriesIndex % PALETTE.length]} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  {points.map((point) => <circle key={`${item.label}-${point.label}`} cx={point.x} cy={point.y} r={tooltip?.label === item.label && tooltip?.secondary === point.label ? 6 : 3.6} fill={PALETTE[seriesIndex % PALETTE.length]} stroke={CHART_COLORS.chartBg} strokeWidth="1.6" onMouseMove={(event) => setTooltip(buildTooltip(event, { label: item.label, secondary: point.label, count: point.count, unit: point.unit }))} onMouseLeave={() => setTooltip(null)} />)}
                </g>
              );
            })}
            {xLabels.map((label, index) => (index % labelEvery === 0 || index === xLabels.length - 1 ? <text key={label} x={xLabels.length === 1 ? left + plotWidth / 2 : left + (index / (xLabels.length - 1)) * plotWidth} y={top + plotHeight + 22} textAnchor="middle" fontSize="11" fill={CHART_COLORS.mutedText}>{label}</text> : null))}
            {series.slice(0, 6).map((item, index) => (
              <g key={`legend-${item.label}`}>
                <rect x={left + index * 112} y={height - 28} width="12" height="12" rx="3" fill={PALETTE[index % PALETTE.length]} />
                <text x={left + 18 + index * 112} y={height - 18} fontSize="10" fill={CHART_COLORS.mutedText}>{truncateLabel(item.label, 14)}</text>
              </g>
            ))}
          </>
        ),
      }}
    </ChartFrame>
  );
}

export function AnalyticsHeatmap({ rows = [], columns = [], cells = [], title, subtitle, svgRef }) {
  const [tooltip, setTooltip] = useState(null);
  if (!rows.length || !columns.length) return <EmptyChartState message="No paired categorical data is available for the current selection." />;

  const cellSize = 36;
  const left = 190;
  const top = 98;
  const right = 36;
  const bottom = 116;
  const width = Math.max(720, left + columns.length * cellSize + right);
  const height = Math.max(360, top + rows.length * cellSize + bottom);
  const maxValue = Math.max(...cells.map((cell) => cell.count), 1);
  const cellMap = new Map(cells.map((cell) => [`${cell.rowLabel}__${cell.columnLabel}`, cell]));

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
                  return <rect key={`${row}-${column}`} x={left + columnIndex * cellSize} y={top + rowIndex * cellSize} width={cellSize - 2} height={cellSize - 2} rx="7" fill={CHART_COLORS.accent} opacity={opacity} stroke={tooltip?.label === row && tooltip?.secondary === column ? CHART_COLORS.accentDark : CHART_COLORS.chartBg} strokeWidth="2" onMouseMove={(event) => setTooltip(buildTooltip(event, { label: row, secondary: column, count: cell.count, unit: cell.unit }))} onMouseLeave={() => setTooltip(null)} />;
                })}
              </g>
            ))}
          </>
        ),
      }}
    </ChartFrame>
  );
}

export function AnalyticsHistogram({ data = [], title, subtitle, svgRef }) {
  return <AnalyticsBarChart data={data} title={title} subtitle={subtitle} svgRef={svgRef} orientation="vertical" />;
}

export function AnalyticsSunburst({ parents = [], total = 0, title, subtitle, svgRef }) {
  const [tooltip, setTooltip] = useState(null);
  if (!parents.length || !total) return <EmptyChartState message="No hierarchical data is available for the current selection." />;

  const width = 720;
  const height = 430;
  const cx = 250;
  const cy = 235;
  const innerRadius = 74;
  const outerInnerRadius = 96;
  const outerRadius = 148;
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
                  <path d={ringArc(parentStart, parentEnd, innerRadius, outerInnerRadius)} fill={PALETTE[parentIndex % PALETTE.length]} stroke={CHART_COLORS.chartBg} strokeWidth="2" onMouseMove={(event) => setTooltip(buildTooltip(event, parent))} onMouseLeave={() => setTooltip(null)} />
                  {parent.children.map((child, childIndex) => {
                    const childSpan = parentSpan * (child.count / Math.max(1, parent.count));
                    const childStart = childAngle;
                    const childEnd = childAngle + childSpan;
                    childAngle = childEnd;
                    return <path key={`${parent.label}-${child.label}`} d={ringArc(childStart, childEnd, outerInnerRadius, outerRadius)} fill={PALETTE[(parentIndex + childIndex + 1) % PALETTE.length]} opacity="0.82" stroke={CHART_COLORS.chartBg} strokeWidth="1.4" onMouseMove={(event) => setTooltip(buildTooltip(event, { label: child.label, secondary: parent.label, count: child.count, unit: child.unit }))} onMouseLeave={() => setTooltip(null)} />;
                  })}
                </g>
              );
            })}
            {parents.slice(0, 6).map((parent, index) => (
              <g key={`legend-${parent.label}`}>
                <rect x="455" y={110 + index * 24} width="14" height="14" rx="4" fill={PALETTE[index % PALETTE.length]} />
                <text x="478" y={122 + index * 24} fontSize="12" fill={CHART_COLORS.text}>{truncateLabel(parent.label, 24)}</text>
              </g>
            ))}
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
