import React, { useMemo, useState } from 'react';

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
      className="pointer-events-none absolute z-20 max-w-[220px] rounded-xl border border-[var(--panel-card-border)] bg-[var(--panel-card-bg)] px-3 py-2 text-xs text-[var(--panel-card-text)] shadow-[0_12px_28px_rgba(0,0,0,0.22)]"
      style={{
        left: tooltip.x,
        top: tooltip.y,
        transform: 'translate(-50%, calc(-100% - 10px))',
      }}
    >
      <div className="font-semibold">{tooltip.label}</div>
      {tooltip.secondary ? <div className="text-[var(--panel-card-muted-text)]">{tooltip.secondary}</div> : null}
      <div>{formatNumber(tooltip.count)} letters</div>
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
  };
}

function polarToCartesian(cx, cy, radius, angleDegrees) {
  const angleRadians = ((angleDegrees - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(angleRadians),
    y: cy + radius * Math.sin(angleRadians),
  };
}

function describeArc(cx, cy, radius, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, radius, endAngle);
  const end = polarToCartesian(cx, cy, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

  return [
    `M ${cx} ${cy}`,
    `L ${start.x} ${start.y}`,
    `A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`,
    'Z',
  ].join(' ');
}

export function AnalyticsBarChart({ data = [], title, subtitle, svgRef }) {
  const [tooltip, setTooltip] = useState(null);

  if (!data.length) return <EmptyChartState />;

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
    <div className="relative overflow-x-auto rounded-2xl border border-[var(--panel-card-border)] bg-[var(--panel-card-bg)] p-3">
      <ChartTooltip tooltip={tooltip} />
      <svg ref={svgRef} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={title} className="h-auto w-full min-w-[520px]" xmlns="http://www.w3.org/2000/svg">
        <rect width={width} height={height} rx="24" fill={CHART_COLORS.chartBg} />
        <text x="28" y="34" fontSize="22" fontWeight="700" fill={CHART_COLORS.text}>{title}</text>
        <text x="28" y="56" fontSize="13" fill={CHART_COLORS.mutedText}>{subtitle}</text>
        <line x1={left} y1={top - 12} x2={left} y2={height - bottom + 8} stroke={CHART_COLORS.grid} />
        {data.map((row, index) => {
          const y = top + index * rowHeight;
          const barWidth = Math.max(2, (row.count / maxValue) * plotWidth);
          const safeLabel = row.label.length > 28 ? `${row.label.slice(0, 25)}...` : row.label;

          return (
            <g key={row.label}>
              <text x={left - 12} y={y + 17} textAnchor="end" fontSize="12" fill={CHART_COLORS.text}>{safeLabel}</text>
              <rect x={left} y={y} width={barWidth} height="22" rx="8" fill={tooltip?.label === row.label ? CHART_COLORS.hoverFill : CHART_COLORS.accent} opacity="0.9" onMouseMove={(event) => setTooltip(buildTooltip(event, row))} onMouseLeave={() => setTooltip(null)} style={{ cursor: 'default' }}>
                <title>{`${row.label}: ${formatNumber(row.count)} letters`}</title>
              </rect>
              <text x={Math.min(left + barWidth + 8, width - 38)} y={y + 16} fontSize="12" fontWeight="700" fill={CHART_COLORS.text}>{formatNumber(row.count)}</text>
            </g>
          );
        })}
        <text x={left} y={height - 14} fontSize="12" fill={CHART_COLORS.mutedText}>Letter count</text>
      </svg>
    </div>
  );
}

export function AnalyticsLineChart({ data = [], title, subtitle, svgRef }) {
  const [tooltip, setTooltip] = useState(null);

  if (!data.length) return <EmptyChartState message="No year data is available for the current selection." />;

  const width = 720;
  const height = 340;
  const left = 56;
  const right = 30;
  const top = 76;
  const bottom = 52;
  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;
  const maxValue = Math.max(...data.map((row) => row.count), 1);
  const points = data.map((row, index) => {
    const x = data.length === 1 ? left + plotWidth / 2 : left + (index / (data.length - 1)) * plotWidth;
    const y = top + plotHeight - (row.count / maxValue) * plotHeight;
    return { ...row, x, y };
  });
  const path = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`).join(' ');
  const labelEvery = Math.max(1, Math.ceil(data.length / 6));
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((ratio) => ({ value: Math.round(maxValue * ratio), y: top + plotHeight - ratio * plotHeight }));

  return (
    <div className="relative overflow-x-auto rounded-2xl border border-[var(--panel-card-border)] bg-[var(--panel-card-bg)] p-3">
      <ChartTooltip tooltip={tooltip} />
      <svg ref={svgRef} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={title} className="h-auto w-full min-w-[520px]" xmlns="http://www.w3.org/2000/svg">
        <rect width={width} height={height} rx="24" fill={CHART_COLORS.chartBg} />
        <text x="28" y="34" fontSize="22" fontWeight="700" fill={CHART_COLORS.text}>{title}</text>
        <text x="28" y="56" fontSize="13" fill={CHART_COLORS.mutedText}>{subtitle}</text>
        {yTicks.map((tick) => (
          <g key={tick.value}>
            <line x1={left} x2={width - right} y1={tick.y} y2={tick.y} stroke={CHART_COLORS.grid} opacity="0.8" />
            <text x={left - 10} y={tick.y + 4} textAnchor="end" fontSize="11" fill={CHART_COLORS.mutedText}>{formatNumber(tick.value)}</text>
          </g>
        ))}
        <line x1={left} x2={width - right} y1={top + plotHeight} y2={top + plotHeight} stroke={CHART_COLORS.grid} />
        <line x1={left} x2={left} y1={top} y2={top + plotHeight} stroke={CHART_COLORS.grid} />
        <path d={path} fill="none" stroke={CHART_COLORS.accent} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((point, index) => (
          <g key={point.label}>
            <circle cx={point.x} cy={point.y} r={tooltip?.label === point.label ? 7 : 4.8} fill={tooltip?.label === point.label ? CHART_COLORS.hoverFill : CHART_COLORS.accent} stroke={CHART_COLORS.chartBg} strokeWidth="2" onMouseMove={(event) => setTooltip(buildTooltip(event, point))} onMouseLeave={() => setTooltip(null)} style={{ cursor: 'default' }}>
              <title>{`${point.label}: ${formatNumber(point.count)} letters`}</title>
            </circle>
            {index % labelEvery === 0 || index === points.length - 1 ? (
              <text x={point.x} y={top + plotHeight + 22} textAnchor="middle" fontSize="11" fill={CHART_COLORS.mutedText}>{point.label}</text>
            ) : null}
          </g>
        ))}
        <text x={left} y={height - 14} fontSize="12" fill={CHART_COLORS.mutedText}>Year</text>
      </svg>
    </div>
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

  return (
    <div className="relative overflow-x-auto rounded-2xl border border-[var(--panel-card-border)] bg-[var(--panel-card-bg)] p-3">
      <ChartTooltip tooltip={tooltip} />
      <svg ref={svgRef} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={title} className="h-auto w-full min-w-[520px]" xmlns="http://www.w3.org/2000/svg">
        <rect width={width} height={height} rx="24" fill={CHART_COLORS.chartBg} />
        <text x="28" y="34" fontSize="22" fontWeight="700" fill={CHART_COLORS.text}>{title}</text>
        <text x="28" y="56" fontSize="13" fill={CHART_COLORS.mutedText}>{subtitle}</text>
        {data.map((row, index) => {
          const angle = (row.count / total) * 360;
          const startAngle = currentAngle;
          const endAngle = currentAngle + angle;
          currentAngle = endAngle;
          const color = PALETTE[index % PALETTE.length];
          const percent = Math.round((row.count / total) * 1000) / 10;

          return (
            <path
              key={row.label}
              d={describeArc(cx, cy, radius, startAngle, endAngle)}
              fill={tooltip?.label === row.label ? CHART_COLORS.hoverFill : color}
              stroke={CHART_COLORS.chartBg}
              strokeWidth="2"
              onMouseMove={(event) => setTooltip(buildTooltip(event, { ...row, secondary: `${percent}% of shown total` }))}
              onMouseLeave={() => setTooltip(null)}
            >
              <title>{`${row.label}: ${formatNumber(row.count)} letters (${percent}%)`}</title>
            </path>
          );
        })}
        {data.map((row, index) => (
          <g key={`legend-${row.label}`}>
            <rect x="400" y={100 + index * 24} width="14" height="14" rx="4" fill={PALETTE[index % PALETTE.length]} />
            <text x="424" y={112 + index * 24} fontSize="12" fill={CHART_COLORS.text}>{row.label.length > 28 ? `${row.label.slice(0, 25)}...` : row.label}</text>
            <text x="648" y={112 + index * 24} textAnchor="end" fontSize="12" fontWeight="700" fill={CHART_COLORS.text}>{formatNumber(row.count)}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

export function AnalyticsStackedBarChart({ data = [], series = [], title, subtitle, svgRef }) {
  const [tooltip, setTooltip] = useState(null);

  if (!data.length || !series.length) return <EmptyChartState message="No year and category data is available for the current selection." />;

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
    <div className="relative overflow-x-auto rounded-2xl border border-[var(--panel-card-border)] bg-[var(--panel-card-bg)] p-3">
      <ChartTooltip tooltip={tooltip} />
      <svg ref={svgRef} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={title} className="h-auto w-full min-w-[560px]" xmlns="http://www.w3.org/2000/svg">
        <rect width={width} height={height} rx="24" fill={CHART_COLORS.chartBg} />
        <text x="28" y="34" fontSize="22" fontWeight="700" fill={CHART_COLORS.text}>{title}</text>
        <text x="28" y="56" fontSize="13" fill={CHART_COLORS.mutedText}>{subtitle}</text>
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
                return (
                  <rect
                    key={segment.label}
                    x={x}
                    y={yCursor}
                    width={barWidth}
                    height={Math.max(1, segmentHeight)}
                    fill={PALETTE[segmentIndex % PALETTE.length]}
                    stroke={CHART_COLORS.chartBg}
                    strokeWidth="0.8"
                    onMouseMove={(event) => setTooltip(buildTooltip(event, { label: segment.label, secondary: row.label, count: segment.count }))}
                    onMouseLeave={() => setTooltip(null)}
                  >
                    <title>{`${row.label} — ${segment.label}: ${formatNumber(segment.count)} letters`}</title>
                  </rect>
                );
              })}
              {index % labelEvery === 0 || index === data.length - 1 ? (
                <text x={x + barWidth / 2} y={top + plotHeight + 22} textAnchor="middle" fontSize="11" fill={CHART_COLORS.mutedText}>{row.label}</text>
              ) : null}
            </g>
          );
        })}
        {series.slice(0, 6).map((label, index) => (
          <g key={label}>
            <rect x={left + index * 112} y={height - 28} width="12" height="12" rx="3" fill={PALETTE[index % PALETTE.length]} />
            <text x={left + 18 + index * 112} y={height - 18} fontSize="10" fill={CHART_COLORS.mutedText}>{label.length > 14 ? `${label.slice(0, 11)}...` : label}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

export function AnalyticsMultiLineChart({ series = [], years = [], title, subtitle, svgRef }) {
  const [tooltip, setTooltip] = useState(null);

  if (!series.length || !years.length) return <EmptyChartState message="No year and category data is available for the current selection." />;

  const width = 760;
  const height = 390;
  const left = 58;
  const right = 32;
  const top = 76;
  const bottom = 74;
  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;
  const maxValue = Math.max(...series.flatMap((item) => item.points.map((point) => point.count)), 1);
  const labelEvery = Math.max(1, Math.ceil(years.length / 7));

  return (
    <div className="relative overflow-x-auto rounded-2xl border border-[var(--panel-card-border)] bg-[var(--panel-card-bg)] p-3">
      <ChartTooltip tooltip={tooltip} />
      <svg ref={svgRef} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={title} className="h-auto w-full min-w-[560px]" xmlns="http://www.w3.org/2000/svg">
        <rect width={width} height={height} rx="24" fill={CHART_COLORS.chartBg} />
        <text x="28" y="34" fontSize="22" fontWeight="700" fill={CHART_COLORS.text}>{title}</text>
        <text x="28" y="56" fontSize="13" fill={CHART_COLORS.mutedText}>{subtitle}</text>
        <line x1={left} x2={width - right} y1={top + plotHeight} y2={top + plotHeight} stroke={CHART_COLORS.grid} />
        <line x1={left} x2={left} y1={top} y2={top + plotHeight} stroke={CHART_COLORS.grid} />
        {series.map((item, seriesIndex) => {
          const points = item.points.map((point, index) => {
            const x = years.length === 1 ? left + plotWidth / 2 : left + (index / (years.length - 1)) * plotWidth;
            const y = top + plotHeight - (point.count / maxValue) * plotHeight;
            return { ...point, x, y, seriesLabel: item.label };
          });
          const path = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`).join(' ');
          return (
            <g key={item.label}>
              <path d={path} fill="none" stroke={PALETTE[seriesIndex % PALETTE.length]} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              {points.map((point) => (
                <circle
                  key={`${item.label}-${point.label}`}
                  cx={point.x}
                  cy={point.y}
                  r={tooltip?.label === item.label && tooltip?.secondary === point.label ? 6 : 3.6}
                  fill={PALETTE[seriesIndex % PALETTE.length]}
                  stroke={CHART_COLORS.chartBg}
                  strokeWidth="1.6"
                  onMouseMove={(event) => setTooltip(buildTooltip(event, { label: item.label, secondary: point.label, count: point.count }))}
                  onMouseLeave={() => setTooltip(null)}
                >
                  <title>{`${item.label}, ${point.label}: ${formatNumber(point.count)} letters`}</title>
                </circle>
              ))}
            </g>
          );
        })}
        {years.map((year, index) => (
          index % labelEvery === 0 || index === years.length - 1 ? (
            <text key={year} x={years.length === 1 ? left + plotWidth / 2 : left + (index / (years.length - 1)) * plotWidth} y={top + plotHeight + 22} textAnchor="middle" fontSize="11" fill={CHART_COLORS.mutedText}>{year}</text>
          ) : null
        ))}
        {series.slice(0, 6).map((item, index) => (
          <g key={`legend-${item.label}`}>
            <rect x={left + index * 112} y={height - 28} width="12" height="12" rx="3" fill={PALETTE[index % PALETTE.length]} />
            <text x={left + 18 + index * 112} y={height - 18} fontSize="10" fill={CHART_COLORS.mutedText}>{item.label.length > 14 ? `${item.label.slice(0, 11)}...` : item.label}</text>
          </g>
        ))}
      </svg>
    </div>
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
    <div className="relative overflow-x-auto rounded-2xl border border-[var(--panel-card-border)] bg-[var(--panel-card-bg)] p-3">
      <ChartTooltip tooltip={tooltip} />
      <svg ref={svgRef} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={title} className="h-auto w-full min-w-[560px]" xmlns="http://www.w3.org/2000/svg">
        <rect width={width} height={height} rx="24" fill={CHART_COLORS.chartBg} />
        <text x="28" y="34" fontSize="22" fontWeight="700" fill={CHART_COLORS.text}>{title}</text>
        <text x="28" y="56" fontSize="13" fill={CHART_COLORS.mutedText}>{subtitle}</text>
        {columns.map((column, index) => (
          <text key={column} x={left + index * cellSize + cellSize / 2} y={top - 10} textAnchor="end" fontSize="10" fill={CHART_COLORS.mutedText} transform={`rotate(-42 ${left + index * cellSize + cellSize / 2} ${top - 10})`}>
            {column.length > 18 ? `${column.slice(0, 15)}...` : column}
          </text>
        ))}
        {rows.map((row, rowIndex) => (
          <g key={row}>
            <text x={left - 10} y={top + rowIndex * cellSize + cellSize / 2 + 4} textAnchor="end" fontSize="11" fill={CHART_COLORS.text}>
              {row.length > 24 ? `${row.slice(0, 21)}...` : row}
            </text>
            {columns.map((column, columnIndex) => {
              const cell = cellMap.get(`${row}__${column}`) || { rowLabel: row, columnLabel: column, count: 0 };
              const opacity = cell.count ? 0.2 + (cell.count / maxValue) * 0.75 : 0.08;
              return (
                <rect
                  key={`${row}-${column}`}
                  x={left + columnIndex * cellSize}
                  y={top + rowIndex * cellSize}
                  width={cellSize - 2}
                  height={cellSize - 2}
                  rx="7"
                  fill={CHART_COLORS.accent}
                  opacity={opacity}
                  stroke={tooltip?.label === row && tooltip?.secondary === column ? CHART_COLORS.accentDark : CHART_COLORS.chartBg}
                  strokeWidth="2"
                  onMouseMove={(event) => setTooltip(buildTooltip(event, { label: row, secondary: column, count: cell.count }))}
                  onMouseLeave={() => setTooltip(null)}
                >
                  <title>{`${row} × ${column}: ${formatNumber(cell.count)} letters`}</title>
                </rect>
              );
            })}
          </g>
        ))}
      </svg>
    </div>
  );
}

export function AnalyticsChartPreview({ chartData, svgRef }) {
  if (chartData?.chartType === 'line') {
    return <AnalyticsLineChart data={chartData.data} title={chartData.title} subtitle={chartData.subtitle} svgRef={svgRef} />;
  }

  if (chartData?.chartType === 'pie') {
    return <AnalyticsPieChart data={chartData.data} title={chartData.title} subtitle={chartData.subtitle} svgRef={svgRef} />;
  }

  if (chartData?.chartType === 'stackedBar') {
    return <AnalyticsStackedBarChart data={chartData.data} series={chartData.series} title={chartData.title} subtitle={chartData.subtitle} svgRef={svgRef} />;
  }

  if (chartData?.chartType === 'multiLine') {
    return <AnalyticsMultiLineChart series={chartData.series} years={chartData.years} title={chartData.title} subtitle={chartData.subtitle} svgRef={svgRef} />;
  }

  if (chartData?.chartType === 'heatmap') {
    return <AnalyticsHeatmap rows={chartData.rows} columns={chartData.columns} cells={chartData.cells} title={chartData.title} subtitle={chartData.subtitle} svgRef={svgRef} />;
  }

  return <AnalyticsBarChart data={chartData?.data || []} title={chartData?.title || 'Analytics chart'} subtitle={chartData?.subtitle || 'Current filtered data.'} svgRef={svgRef} />;
}
