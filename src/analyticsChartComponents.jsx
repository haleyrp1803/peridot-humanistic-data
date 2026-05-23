import React from 'react';

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

export function AnalyticsBarChart({ data = [], title, subtitle, svgRef }) {
  if (!data.length) return <EmptyChartState />;

  const width = 720;
  const rowHeight = 34;
  const top = 72;
  const right = 44;
  const bottom = 42;
  const left = 210;
  const height = Math.max(300, top + bottom + data.length * rowHeight);
  const maxValue = Math.max(...data.map((row) => row.count), 1);
  const plotWidth = width - left - right;

  return (
    <div className="overflow-x-auto rounded-2xl border border-[var(--panel-card-border)] bg-[var(--panel-card-bg)] p-3">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={title}
        className="h-auto w-full min-w-[520px]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width={width} height={height} rx="24" fill="var(--panel-card-bg)" />
        <text x="28" y="34" fontSize="22" fontWeight="700" fill="var(--panel-card-text)">
          {title}
        </text>
        <text x="28" y="56" fontSize="13" fill="var(--panel-card-muted-text)">
          {subtitle}
        </text>
        <line x1={left} y1={top - 12} x2={left} y2={height - bottom + 8} stroke="var(--panel-card-border)" />
        {data.map((row, index) => {
          const y = top + index * rowHeight;
          const barWidth = Math.max(2, (row.count / maxValue) * plotWidth);
          const safeLabel = row.label.length > 28 ? `${row.label.slice(0, 25)}...` : row.label;

          return (
            <g key={row.label}>
              <text x={left - 12} y={y + 17} textAnchor="end" fontSize="12" fill="var(--panel-card-text)">
                {safeLabel}
              </text>
              <rect x={left} y={y} width={barWidth} height="22" rx="8" fill="var(--accent)" opacity="0.86" />
              <text x={Math.min(left + barWidth + 8, width - 38)} y={y + 16} fontSize="12" fontWeight="700" fill="var(--panel-card-text)">
                {formatNumber(row.count)}
              </text>
            </g>
          );
        })}
        <text x={left} y={height - 14} fontSize="12" fill="var(--panel-card-muted-text)">
          Letter count
        </text>
      </svg>
    </div>
  );
}

export function AnalyticsLineChart({ data = [], title, subtitle, svgRef }) {
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
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((ratio) => ({
    value: Math.round(maxValue * ratio),
    y: top + plotHeight - ratio * plotHeight,
  }));

  return (
    <div className="overflow-x-auto rounded-2xl border border-[var(--panel-card-border)] bg-[var(--panel-card-bg)] p-3">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={title}
        className="h-auto w-full min-w-[520px]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width={width} height={height} rx="24" fill="var(--panel-card-bg)" />
        <text x="28" y="34" fontSize="22" fontWeight="700" fill="var(--panel-card-text)">
          {title}
        </text>
        <text x="28" y="56" fontSize="13" fill="var(--panel-card-muted-text)">
          {subtitle}
        </text>
        {yTicks.map((tick) => (
          <g key={tick.value}>
            <line x1={left} x2={width - right} y1={tick.y} y2={tick.y} stroke="var(--panel-card-border)" opacity="0.7" />
            <text x={left - 10} y={tick.y + 4} textAnchor="end" fontSize="11" fill="var(--panel-card-muted-text)">
              {formatNumber(tick.value)}
            </text>
          </g>
        ))}
        <line x1={left} x2={width - right} y1={top + plotHeight} y2={top + plotHeight} stroke="var(--panel-card-border)" />
        <line x1={left} x2={left} y1={top} y2={top + plotHeight} stroke="var(--panel-card-border)" />
        <path d={path} fill="none" stroke="var(--accent)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((point, index) => (
          <g key={point.label}>
            <circle cx={point.x} cy={point.y} r="4.5" fill="var(--accent)" stroke="var(--panel-card-bg)" strokeWidth="2" />
            {index % labelEvery === 0 || index === points.length - 1 ? (
              <text x={point.x} y={top + plotHeight + 22} textAnchor="middle" fontSize="11" fill="var(--panel-card-muted-text)">
                {point.label}
              </text>
            ) : null}
          </g>
        ))}
        <text x={left} y={height - 14} fontSize="12" fill="var(--panel-card-muted-text)">
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
