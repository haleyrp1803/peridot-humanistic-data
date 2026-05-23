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
      className="pointer-events-none absolute z-20 rounded-xl border border-[var(--panel-card-border)] bg-[var(--panel-card-bg)] px-3 py-2 text-xs text-[var(--panel-card-text)] shadow-[0_12px_28px_rgba(0,0,0,0.22)]"
      style={{
        left: tooltip.x,
        top: tooltip.y,
        transform: 'translate(-50%, calc(-100% - 10px))',
      }}
    >
      <div className="font-semibold">{tooltip.label}</div>
      <div>{formatNumber(tooltip.count)} letters</div>
    </div>
  );
}

function buildTooltip(event, row) {
  const container = event.currentTarget.ownerSVGElement?.parentElement;
  const containerRect = container?.getBoundingClientRect();
  const x = containerRect ? event.clientX - containerRect.left : event.clientX;
  const y = containerRect ? event.clientY - containerRect.top : event.clientY;

  return {
    x,
    y,
    label: row.label,
    count: row.count,
  };
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
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={title}
        className="h-auto w-full min-w-[520px]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width={width} height={height} rx="24" fill={CHART_COLORS.chartBg} />
        <text x="28" y="34" fontSize="22" fontWeight="700" fill={CHART_COLORS.text}>
          {title}
        </text>
        <text x="28" y="56" fontSize="13" fill={CHART_COLORS.mutedText}>
          {subtitle}
        </text>
        <line x1={left} y1={top - 12} x2={left} y2={height - bottom + 8} stroke={CHART_COLORS.grid} />
        {data.map((row, index) => {
          const y = top + index * rowHeight;
          const barWidth = Math.max(2, (row.count / maxValue) * plotWidth);
          const safeLabel = row.label.length > 28 ? `${row.label.slice(0, 25)}...` : row.label;

          return (
            <g key={row.label}>
              <text x={left - 12} y={y + 17} textAnchor="end" fontSize="12" fill={CHART_COLORS.text}>
                {safeLabel}
              </text>
              <rect
                x={left}
                y={y}
                width={barWidth}
                height="22"
                rx="8"
                fill={tooltip?.label === row.label ? CHART_COLORS.hoverFill : CHART_COLORS.accent}
                opacity="0.9"
                onMouseMove={(event) => setTooltip(buildTooltip(event, row))}
                onMouseLeave={() => setTooltip(null)}
                style={{ cursor: 'default' }}
              >
                <title>{`${row.label}: ${formatNumber(row.count)} letters`}</title>
              </rect>
              <text x={Math.min(left + barWidth + 8, width - 38)} y={y + 16} fontSize="12" fontWeight="700" fill={CHART_COLORS.text}>
                {formatNumber(row.count)}
              </text>
            </g>
          );
        })}
        <text x={left} y={height - 14} fontSize="12" fill={CHART_COLORS.mutedText}>
          Letter count
        </text>
      </svg>
    </div>
  );
}

export function AnalyticsLineChart({ data = [], title, subtitle, svgRef }) {
  const [tooltip, setTooltip] = useState(null);

  const lineData = useMemo(() => data || [], [data]);

  if (!lineData.length) return <EmptyChartState message="No year data is available for the current selection." />;

  const width = 720;
  const height = 340;
  const left = 56;
  const right = 30;
  const top = 76;
  const bottom = 52;
  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;
  const maxValue = Math.max(...lineData.map((row) => row.count), 1);
  const points = lineData.map((row, index) => {
    const x = lineData.length === 1 ? left + plotWidth / 2 : left + (index / (lineData.length - 1)) * plotWidth;
    const y = top + plotHeight - (row.count / maxValue) * plotHeight;
    return { ...row, x, y };
  });
  const path = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`).join(' ');

  const labelEvery = Math.max(1, Math.ceil(lineData.length / 6));
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((ratio) => ({
    value: Math.round(maxValue * ratio),
    y: top + plotHeight - ratio * plotHeight,
  }));

  return (
    <div className="relative overflow-x-auto rounded-2xl border border-[var(--panel-card-border)] bg-[var(--panel-card-bg)] p-3">
      <ChartTooltip tooltip={tooltip} />
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={title}
        className="h-auto w-full min-w-[520px]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width={width} height={height} rx="24" fill={CHART_COLORS.chartBg} />
        <text x="28" y="34" fontSize="22" fontWeight="700" fill={CHART_COLORS.text}>
          {title}
        </text>
        <text x="28" y="56" fontSize="13" fill={CHART_COLORS.mutedText}>
          {subtitle}
        </text>
        {yTicks.map((tick) => (
          <g key={tick.value}>
            <line x1={left} x2={width - right} y1={tick.y} y2={tick.y} stroke={CHART_COLORS.grid} opacity="0.8" />
            <text x={left - 10} y={tick.y + 4} textAnchor="end" fontSize="11" fill={CHART_COLORS.mutedText}>
              {formatNumber(tick.value)}
            </text>
          </g>
        ))}
        <line x1={left} x2={width - right} y1={top + plotHeight} y2={top + plotHeight} stroke={CHART_COLORS.grid} />
        <line x1={left} x2={left} y1={top} y2={top + plotHeight} stroke={CHART_COLORS.grid} />
        <path d={path} fill="none" stroke={CHART_COLORS.accent} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((point, index) => (
          <g key={point.label}>
            <circle
              cx={point.x}
              cy={point.y}
              r={tooltip?.label === point.label ? 7 : 4.8}
              fill={tooltip?.label === point.label ? CHART_COLORS.hoverFill : CHART_COLORS.accent}
              stroke={CHART_COLORS.chartBg}
              strokeWidth="2"
              onMouseMove={(event) => setTooltip(buildTooltip(event, point))}
              onMouseLeave={() => setTooltip(null)}
              style={{ cursor: 'default' }}
            >
              <title>{`${point.label}: ${formatNumber(point.count)} letters`}</title>
            </circle>
            {index % labelEvery === 0 || index === points.length - 1 ? (
              <text x={point.x} y={top + plotHeight + 22} textAnchor="middle" fontSize="11" fill={CHART_COLORS.mutedText}>
                {point.label}
              </text>
            ) : null}
          </g>
        ))}
        <text x={left} y={height - 14} fontSize="12" fill={CHART_COLORS.mutedText}>
          Year
        </text>
      </svg>
    </div>
  );
}

export function AnalyticsChartPreview({ chartData, svgRef }) {
  if (chartData?.chartType === 'line') {
    return (
      <AnalyticsLineChart
        data={chartData.data}
        title={chartData.title}
        subtitle={chartData.subtitle}
        svgRef={svgRef}
      />
    );
  }

  return (
    <AnalyticsBarChart
      data={chartData?.data || []}
      title={chartData?.title || 'Analytics chart'}
      subtitle={chartData?.subtitle || 'Current filtered data.'}
      svgRef={svgRef}
    />
  );
}
