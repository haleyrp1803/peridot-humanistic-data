/*
 * Charts II — parallel development foundation (structural pass 1).
 *
 * B3.3 reuses the existing Charts I renderers for Bar, Line, Multi-Line, Grouped Bar, Stacked Bar, Pie, Histogram, Heatmap, and Sunburst via the B1 derivation adapter.
 * It supplies two distinct navigation surfaces without modifying Charts I UI/state. The persistent parent owns the
 * selected chart key; this component receives it as a controlled input.
 *
 * Suitability is advisory and derived from applied Explore scope, separate from
 * playback-visible rendering. Export remains pending;
 * do not represent placeholder content as research results.
 */
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CHARTS_II_TIME_INTERVALS } from './chartsIITemporalAggregation.js';
import { chartsIISlopePeriods } from './chartsIISlopeData.js';
import { buildChartsIIDataProfile, assessChartsIISuitability } from './chartsIIDataProfile.js';
import { createChartsIIBuilderConfiguration, updateChartsIIBuilderConfiguration, validateChartsIIBuilderConfiguration, getChartsIIBuilderFieldInventory, deriveChartsIIBuilderData } from './chartsIIBuilderContract.js';
import { AnalyticsBarChart, AnalyticsLineChart, AnalyticsMultiLineChart, AnalyticsGroupedBarChart, AnalyticsStackedBarChart, AnalyticsPieChart, AnalyticsHistogram, AnalyticsHeatmap, AnalyticsSunburst, AnalyticsAreaChart, AnalyticsStackedAreaChart, AnalyticsScatterChart, AnalyticsBoxPlotChart, AnalyticsDotPlotChart, AnalyticsSlopeChart, AnalyticsTreemapChart } from './analyticsChartComponents.jsx';

// The provisional 15-family inventory is shared by search, purpose browsing,
// suitability ranking, and thumbnails. Variations are not separate renderers yet.
const CHART_FAMILIES = Object.freeze([
  { key: 'line', name: 'Line / Multi-Line', group: 'Change over time', description: 'Follow one value or compare several series through time.', terms: 'trend chronology dates time series comparison' },
  { key: 'area', name: 'Area', group: 'Change over time', description: 'Emphasize how a quantity changes through time.', terms: 'magnitude temporal trend' },
  { key: 'stacked-area', name: 'Stacked Area', group: 'Change over time', description: 'See how contributions to a total change over time.', terms: 'composition cumulative proportions' },
  { key: 'bar', name: 'Bar / Column', group: 'Compare values', description: 'Compare quantities across categories.', terms: 'rank count categories horizontal vertical' },
  { key: 'grouped-bar', name: 'Grouped Bar', group: 'Compare values', description: 'Compare several groups within each category.', terms: 'side by side categories' },
  { key: 'dot', name: 'Dot Plot', group: 'Compare values', description: 'Compare values precisely across categories.', terms: 'cleveland dot ranking' },
  { key: 'slope', name: 'Slope Chart', group: 'Compare values', description: 'Compare change between two points or periods.', terms: 'before after difference' },
  { key: 'stacked-bar', name: 'Stacked Bar / 100% Stacked', group: 'Parts of a whole', description: 'Compare category totals and their composition.', terms: 'percentage proportion shares segments' },
  { key: 'pie', name: 'Pie / Donut', group: 'Parts of a whole', description: 'Show the shares of a single whole.', terms: 'percentage slices proportions circle' },
  { key: 'treemap', name: 'Treemap', group: 'Parts of a whole', description: 'Compare proportional sizes using rectangles.', terms: 'hierarchical tiles sizes' },
  { key: 'sunburst', name: 'Sunburst', group: 'Parts of a whole', description: 'Explore proportions across levels of a hierarchy.', terms: 'nested circular hierarchy' },
  { key: 'histogram', name: 'Histogram', group: 'Distribution', description: 'See how frequently numerical values occur.', terms: 'bins frequencies numerical' },
  { key: 'box', name: 'Box Plot', group: 'Distribution', description: 'Compare spreads, medians, and possible outliers.', terms: 'quartiles whisker statistical' },
  { key: 'scatter', name: 'Scatter / Bubble', group: 'Relationships and patterns', description: 'Explore relationships between numerical variables.', terms: 'correlation x y bubble points' },
  { key: 'heatmap', name: 'Heatmap', group: 'Relationships and patterns', description: 'Find patterns across two categorical dimensions.', terms: 'matrix grid intensity cross tab' },
]);

const PURPOSES = Object.freeze([
  { label: 'Change over time', question: 'When and how did something change?' },
  { label: 'Compare values', question: 'How do people, groups, or quantities differ?' },
  { label: 'Parts of a whole', question: 'What proportion does each part contribute?' },
  { label: 'Distribution', question: 'How are values spread out?' },
  { label: 'Relationships and patterns', question: 'Which variables vary together?' },
]);

const panel = 'rounded-xl border border-[#d9c8a9] bg-[#fffaf0]';
const recommendationPanel = 'rounded-xl border border-[#d9bc80] bg-[#f9f0de]';
const heading = "[font-family:Georgia,'Palatino_Linotype','Book_Antiqua',Palatino,serif]";
const INK = '#4b5644';
const OXBLOOD = '#8b3026';
const GOLD = '#bf902e';
const SAGE = '#7b8d6e';
const TEAL = '#28747b';
const BLUE = '#5f7e9e';
const PURPLE = '#80517b';
const chartColors = [OXBLOOD, GOLD, SAGE, TEAL, BLUE, PURPLE];

// Static, illustrative SVGs: these are NOT plots derived from the current dataset.
// They make chart types visually identifiable without expensive per-card derivation.
function ChartThumbnail({ type }) {
  const bars = (values, group = 0) => values.map((v, i) => <rect key={i} x={20 + i * (group ? 23 : 28)} y={75 - v} width={group ? 9 : 20} height={v} rx="1" fill={chartColors[i % 4]} opacity="0.88" />);
  const dots = [[25, 61], [46, 51], [66, 56], [85, 36], [106, 43], [127, 24], [147, 31], [171, 15]];
  const axis = <path d="M13 12V77H187" fill="none" stroke="#9b9c89" strokeWidth="1" />;
  let marks;
  switch (type) {
    case 'line':
      marks = <><polyline points="16,68 42,56 67,61 92,43 119,48 144,25 184,18" fill="none" stroke={OXBLOOD} strokeWidth="2.7"/><polyline points="16,57 42,60 67,44 92,50 119,29 144,38 184,24" fill="none" stroke={BLUE} strokeWidth="2.4"/><polyline points="16,71 42,64 67,65 92,57 119,54 144,62 184,45" fill="none" stroke={SAGE} strokeWidth="2.4"/></>;
      break;
    case 'area': marks = <path d="M16 73 L42 62 L67 67 L92 42 L115 48 L143 29 L184 17 L184 76 L16 76Z" fill={SAGE} opacity="0.72"/>; break;
    case 'stacked-area': marks = <><path d="M16 69L46 65L78 63L111 57L143 53L184 47V76H16Z" fill={GOLD} opacity="0.9"/><path d="M16 54L46 48L78 54L111 40L143 43L184 26V47L143 53L111 57L78 63L46 65L16 69Z" fill={SAGE} opacity="0.85"/><path d="M16 44L46 35L78 41L111 25L143 30L184 13V26L143 43L111 40L78 54L46 48L16 54Z" fill={BLUE} opacity="0.85"/></>; break;
    case 'bar': marks = bars([20, 37, 48, 59, 34]); break;
    case 'grouped-bar': marks = <>{[0, 1, 2, 3].map(i => <g key={i}><rect x={26 + i * 40} y={75 - [25, 35, 38, 52][i]} width="13" height={[25, 35, 38, 52][i]} fill={GOLD}/><rect x={40 + i * 40} y={75 - [44, 49, 57, 64][i]} width="13" height={[44, 49, 57, 64][i]} fill={BLUE}/></g>)}</>; break;
    case 'dot': marks = <>{[26, 45, 69, 91, 112].map((x, i) => <g key={i}><path d={`M16 ${18 + i * 13}H185`} stroke="#ded7c5" strokeWidth="1"/><circle cx={x + (i % 2) * 24} cy={18 + i * 13} r="4.1" fill={i % 2 ? GOLD : OXBLOOD}/></g>)}</>; break;
    case 'slope': marks = <>{[[25, 65, OXBLOOD], [48, 32, BLUE], [65, 52, GOLD], [32, 22, SAGE]].map(([left, right, color], i) => <g key={i}><path d={`M40 ${left} L163 ${right}`} stroke={color} strokeWidth="2.4"/><circle cx="40" cy={left} r="3" fill={color}/><circle cx="163" cy={right} r="3" fill={color}/></g>)}</>; break;
    case 'stacked-bar': marks = <>{[0,1,2,3,4].map((i) => <g key={i}><rect x={22 + i * 32} y={75 - [22,34,40,33,42][i]} width="22" height={[22,34,40,33,42][i]} fill={OXBLOOD}/><rect x={22 + i * 32} y={75 - [41,53,62,56,65][i]} width="22" height={[19,19,22,23,23][i]} fill={GOLD}/><rect x={22 + i * 32} y={75 - [54,63,71,67,76][i]} width="22" height={[13,10,9,11,11][i]} fill={SAGE}/></g>)}</>; break;
    case 'pie': case 'sunburst': {
      const ring = type === 'sunburst';
      marks = <g transform="translate(99 45)"><circle r="31" fill="none" stroke={GOLD} strokeWidth="29" strokeDasharray="52 195" transform="rotate(-90)"/><circle r="31" fill="none" stroke={OXBLOOD} strokeWidth="29" strokeDasharray="64 195" strokeDashoffset="-52" transform="rotate(-90)"/><circle r="31" fill="none" stroke={SAGE} strokeWidth="29" strokeDasharray="48 195" strokeDashoffset="-116" transform="rotate(-90)"/><circle r="31" fill="none" stroke={BLUE} strokeWidth="29" strokeDasharray="31 195" strokeDashoffset="-164" transform="rotate(-90)"/>{ring && <><circle r="21" fill="none" stroke="#f9f3e9" strokeWidth="3"/><circle r="17" fill="none" stroke={TEAL} strokeWidth="9" strokeDasharray="31 107" transform="rotate(-90)"/><circle r="17" fill="none" stroke={PURPLE} strokeWidth="9" strokeDasharray="34 107" strokeDashoffset="-31" transform="rotate(-90)"/><circle r="17" fill="none" stroke={GOLD} strokeWidth="9" strokeDasharray="42 107" strokeDashoffset="-65" transform="rotate(-90)"/></>}</g>;
      break;
    }
    case 'treemap': marks = <g transform="translate(20 12)"><rect width="97" height="62" fill={SAGE}/><rect x="100" width="66" height="35" fill={GOLD}/><rect x="100" y="38" width="35" height="24" fill={OXBLOOD}/><rect x="138" y="38" width="28" height="24" fill={BLUE}/><path d="M0 32H97" stroke="#f8f2e8" strokeWidth="2"/><path d="M43 32V62" stroke="#f8f2e8" strokeWidth="2"/></g>; break;
    case 'histogram': marks = <>{[12,19,31,48,64,50,32,21,10].map((v,i) => <rect key={i} x={18+i*18} y={75-v} width="17.5" height={v} fill={SAGE} opacity="0.94"/>)}</>; break;
    case 'box': marks = <><path d="M20 45H177M20 35V55M177 35V55" stroke={INK} strokeWidth="2"/><rect x="54" y="28" width="75" height="34" fill={SAGE} opacity="0.7" stroke={INK} strokeWidth="2"/><path d="M92 28V62" stroke={OXBLOOD} strokeWidth="3"/><circle cx="185" cy="20" r="3.5" fill={OXBLOOD}/></>; break;
    case 'scatter': marks = <>{dots.map(([x,y],i) => <circle key={i} cx={x} cy={y} r={[3.5,4,5,3,4.2,5.5,4,4.2][i]} fill={i%2 ? GOLD : TEAL} opacity="0.9"/>)}</>; break;
    case 'heatmap': marks = <>{Array.from({ length: 30 }, (_,i) => <rect key={i} x={24+(i%6)*27} y={10+Math.floor(i/6)*13} width="25" height="11" fill={[SAGE, '#cfb66e', BLUE, '#c47d4a', OXBLOOD][(i*7+Math.floor(i/6))%5]} opacity={0.43+(i%4)*0.15}/>)}</>; break;
    default: marks = null;
  }
  return <svg viewBox="0 0 200 88" role="img" aria-label={`Illustrative ${type} chart thumbnail`} className="h-[82px] w-full" preserveAspectRatio="xMidYMid meet">
    {['line', 'area', 'stacked-area', 'bar', 'grouped-bar', 'dot', 'slope', 'stacked-bar', 'histogram', 'scatter', 'box'].includes(type) && axis}
    {marks}
  </svg>;
}

// The label itself is keyboard-focusable. No separate 'Why?' link; the tooltip
// appears on pointer hover and focus, with native title as a fallback.
function SuitabilityLabel({ chart }) {
  if (chart.suitability === 'neutral') return null;
  const likely = chart.suitability === 'likely';
  const explanation = chart.explanation.split(' This is a suggestion')[0].split(' You can still choose')[0];
  const evidence = chart.evidence ? chart.evidence.replace(' · ', '; ') : '';
  const tooltip = [explanation, evidence ? `Detected: ${evidence}` : ''].filter(Boolean).join(' ');
  return (
    <span className="group/fit relative inline-flex max-w-full">
      <span tabIndex={0} aria-describedby={`charts2-tip-${chart.key}`} aria-label={`${likely ? 'Likely fit' : 'May not work well'}. ${tooltip}`}
        className={`inline-flex cursor-help items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold outline-none focus-visible:ring-2 focus-visible:ring-[var(--peridot-color-hex-b58b42)] ${likely
          ? 'bg-[var(--peridot-color-hex-edf4df)] text-[var(--peridot-color-hex-173120)]'
          : 'border border-[var(--peridot-color-hex-d5c7a8)] bg-[var(--peridot-color-hex-f9f0e4)] text-[var(--peridot-color-hex-8b2e23)]'}`}>
        <span aria-hidden="true">{likely ? '✓' : '!'}</span>{likely ? 'Likely fit' : 'May not work well'}
      </span>
      <span role="tooltip" id={`charts2-tip-${chart.key}`} className="pointer-events-none absolute bottom-full left-0 z-30 mb-2 hidden w-60 max-w-[min(75vw,15rem)] rounded-lg border border-[var(--peridot-color-hex-d5c7a8)] bg-[var(--peridot-color-hex-fffaf0)] p-2.5 text-left text-xs font-normal leading-relaxed text-[var(--peridot-color-hex-24382d)] shadow-lg group-hover/fit:block group-focus-within/fit:block">
        {tooltip}
      </span>
    </span>
  );
}

// Gallery tiles are compact and uniform across all browse modes. The same
// presentation is reused in the recommendation shelf to avoid duplicate UI
// contracts; only the enclosing shelf communicates editorial priority.
function ChartChoiceCard({ chart, onSelectChart }) {
  return (
    <article className="group/card relative flex min-w-0 flex-col rounded-[10px] border border-[#deceb3] bg-[#fffcf6] p-[9px] transition-[border-color,background-color,box-shadow] duration-150 hover:border-[#b99453] hover:bg-[#fff8e8] hover:shadow-[0_2px_9px_rgba(63,44,26,0.08)] focus-within:border-[#b99453] focus-within:ring-1 focus-within:ring-[#b99453]">
      <button type="button" onClick={() => onSelectChart(chart.key)}
        className="flex min-w-0 flex-1 flex-col text-left outline-none focus-visible:ring-2 focus-visible:ring-[var(--peridot-color-hex-b58b42)]"
        aria-label={`Build a ${chart.name} chart`}>
        <div className="flex h-[88px] w-full items-center justify-center overflow-hidden rounded-[6px] bg-[#f4eddf] px-1.5 ring-1 ring-inset ring-[#eee3d0]">
          <ChartThumbnail type={chart.key}/>
        </div>
        <span className={`${heading} mt-2 text-[16px] font-semibold leading-[1.13] text-[#263e2f]`}>{chart.name}</span>
        <span className="mt-1 min-h-[2.5em] text-[12px] leading-[1.35] text-[#526255]">{chart.description}</span>
      </button>
      <div className="mt-1.5 flex min-h-[23px] items-center justify-start gap-2">
        <SuitabilityLabel chart={chart}/>
      </div>
    </article>
  );
}

// Browser controls persist while the application remains open, including when
// the parent temporarily unmounts Charts II during navigation to Map/Network.
// They do not modify canonical data or share state with the Charts I builder.
let catalogueBrowseSession = { query: '', order: 'question', purpose: 'all', fitOnly: false };

function FoundationCatalogue({ onSelectChart, charts, profile }) {
  const [query, setQuery] = React.useState(() => catalogueBrowseSession.query);
  const [order, setOrder] = React.useState(() => catalogueBrowseSession.order);
  const [purpose, setPurpose] = React.useState(() => catalogueBrowseSession.purpose);
  const [fitOnly, setFitOnly] = React.useState(() => catalogueBrowseSession.fitOnly);
  React.useEffect(() => { catalogueBrowseSession = { query, order, purpose, fitOnly }; }, [query, order, purpose, fitOnly]);
  const recommended = useMemo(() => charts.filter(chart => chart.suitability === 'likely')
    .sort((a,b) => b.score - a.score || a.name.localeCompare(b.name)).slice(0,4), [charts]);
  const visible = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    return charts.filter(chart => (!fitOnly || chart.suitability === 'likely')
      && (purpose === 'all' || chart.group === purpose)
      && (!normalized || `${chart.name} ${chart.group} ${chart.description} ${chart.terms}`.toLocaleLowerCase().includes(normalized)));
  }, [charts, query, purpose, fitOnly]);
  const ordered = useMemo(() => [...visible].sort((a,b) => {
    if (order === 'az') return a.name.localeCompare(b.name);
    if (order === 'matches') return b.score-a.score || a.name.localeCompare(b.name);
    return PURPOSES.findIndex(p=>p.label===a.group)-PURPOSES.findIndex(p=>p.label===b.group) || a.name.localeCompare(b.name);
  }), [visible, order]);
  // "By question" keeps the families next to one another in a continuous
  // four-column gallery. The chart-level purpose caption makes group changes
  // legible without tall nested group panels or half-empty rows.
  return (
    <div className="mx-auto flex w-full max-w-[1560px] flex-col gap-3.5">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
        <div>
          <p className={`${heading} text-[21px] italic leading-tight text-[#842b20]`}>Find a visualization for your research data.</p>
        </div>
        <div className="flex max-w-[430px] items-center gap-2 rounded-lg border border-[#dfceb0] bg-[#fffaf0] px-3 py-2 text-[#294334]">
          <span aria-hidden="true" className="text-[21px] leading-none text-[#6d835d]">▤</span>
          <div className="text-[12px] leading-[1.4]">
            <span className="font-semibold">Current dataset</span> · {profile.rowCount.toLocaleString()} Explore-filtered records
            <p className="text-[11px] text-[#5a6b5c]">Suggestions use fields Peridot identifies in your mapping.</p>
          </div>
        </div>
      </div>
      {/* Catalogue wayfinding: group the search icon, explicit labels and sorting
          in one compact toolbar. These controls do not change chart eligibility. */}
      <div className="flex flex-wrap items-end gap-x-3 gap-y-2 rounded-lg border border-[#d6bd91] bg-[#f8efdd] px-3 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]" role="search" aria-label="Find and organize charts">
        <div className="min-w-[215px] flex-[1_1_380px]">
          <label htmlFor="charts2-find" className="mb-1 block text-[12px] font-bold tracking-[0.025em] text-[#713326]">Search charts</label>
          <div className="relative">
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="pointer-events-none absolute left-3 top-1/2 h-[17px] w-[17px] -translate-y-1/2 text-[#756344]">
              <circle cx="10.8" cy="10.8" r="6.6"/><path d="m16 16 5 5"/>
            </svg>
            <input id="charts2-find" type="search" placeholder="Find a chart (e.g., time, comparison…)" value={query} onChange={event=>setQuery(event.target.value)}
              className="w-full rounded-md border border-[#cdb48b] bg-[#fffdf7] py-2 pl-10 pr-3 text-[13px] text-[#24382d] outline-none focus:ring-2 focus:ring-[#b78b40]"/>
          </div>
        </div>
        <div className="min-w-[175px] flex-[0_1_215px]">
          <label htmlFor="charts2-order" className="mb-1 block text-[12px] font-bold tracking-[0.025em] text-[#713326]">Organize by</label>
          <select id="charts2-order" value={order} onChange={event=>setOrder(event.target.value)} className="w-full rounded-md border border-[#cdb48b] bg-[#fffdf7] px-3 py-2 text-[13px] font-medium text-[#294334] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#b58b42]">
            <option value="question">By question</option><option value="matches">Best matches first</option><option value="az">A–Z</option>
          </select>
        </div>
      </div>
      <section className="overflow-visible rounded-xl border border-[#d9bd7e] bg-[#f6ead0] p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]" aria-label="Recommended charts">
        <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#f1dba7] text-[23px] text-[#b78a30]">★</div>
            <div>
              <h3 className={`${heading} text-[23px] font-semibold leading-tight text-[#243c2a]`}>Recommended for your data</h3>
              <p className="text-[12px] leading-relaxed text-[#536052]">Based on mapped fields, not a judgment about your research question.</p>
            </div>
          </div>
          <span className="text-[11px] font-medium text-[#725b38]">Every chart remains selectable</span>
        </div>
        {recommended.length ? <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
          {recommended.map(chart => <ChartChoiceCard key={chart.key} chart={chart} onSelectChart={onSelectChart}/>) }
        </div> : <div className="rounded-md border border-[#e1ceac] bg-[#fffaf0] px-3 py-2 text-[12px] text-[#536052]">
          No strong matches identified from the currently supplied mapped fields. Browse every chart below.
        </div>}
      </section>
      <section aria-label="All Charts II chart families" className="min-w-0">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <h3 className={`${heading} text-[23px] font-semibold text-[#243c2a]`}>Browse all charts</h3>
          <span className="text-[12px] text-[#596958]">{ordered.length} of {charts.length} chart families</span>
        </div>
        {/* Purpose filters orient browsing by research question without changing
            the continuous gallery or creating separate groups of chart cards. */}
        <div className="mb-2.5 rounded-lg border border-[#e0cda9] bg-[#f7efdf] px-3 py-2.5" aria-label="Filter charts by analytical question">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[#713326]">Explore by question</p>
          <div className="flex flex-wrap items-center gap-2">
            {[{label:'All charts'},...PURPOSES].map(item => <button type="button" key={item.label} onClick={()=>setPurpose(item.label==='All charts'?'all':item.label)}
              aria-pressed={purpose===(item.label==='All charts'?'all':item.label)}
              className={`rounded-full border px-3.5 py-[7px] text-[12px] font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#b58b42] ${purpose===(item.label==='All charts'?'all':item.label)
                ? 'border-[#243d2e] bg-[#243d2e] text-white shadow-[0_1px_3px_rgba(36,61,46,0.2)]'
                : 'border-[#cbb38a] bg-[#fffdf7] text-[#294334] hover:border-[#8b6d3f] hover:bg-[#f1e1c4]'}`}>
              {item.label}
            </button>)}
            <label className="ml-auto flex cursor-pointer items-center gap-1.5 rounded-full border border-[#cbb38a] bg-[#fffdf7] px-3.5 py-[7px] text-[12px] font-semibold text-[#294334]">
              <input type="checkbox" checked={fitOnly} onChange={event=>setFitOnly(event.target.checked)} className="accent-[#2f4a3e]"/> Likely fits only
            </label>
          </div>
        </div>
        {ordered.length ? <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3 xl:grid-cols-4">
          {ordered.map(chart => <div key={chart.key} className="min-w-0">
            {order === 'question' && <p className="mb-1.5 truncate border-l-[3px] border-[#aa7d42] pl-2 text-[11px] font-bold uppercase tracking-[0.075em] text-[#713326]">{chart.group}</p>}
            <ChartChoiceCard chart={chart} onSelectChart={onSelectChart}/>
          </div>)}
        </div> : <p className="rounded-lg border border-[#dfceb6] bg-[#fffaf2] p-4 text-sm text-[#52675a]">No charts match these filters. Clear the search or select another question to see the complete catalogue.</p>}
      </section>
    </div>
  );
}

function InfoPopover({ label, compact = false, align = 'end', children }) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState(null);
  const triggerRef = useRef(null);
  const popoverRef = useRef(null);
  const dismissTimer = useRef(null);
  const keepOpen = () => {
    if (dismissTimer.current !== null) clearTimeout(dismissTimer.current);
    dismissTimer.current = null;
    setOpen(true);
  };
  const dismissIfOutside = event => {
    if (triggerRef.current?.contains(event.relatedTarget) || popoverRef.current?.contains(event.relatedTarget)) return;
    // Give the pointer time to cross the small gap between trigger and portal.
    if (dismissTimer.current !== null) clearTimeout(dismissTimer.current);
    dismissTimer.current = setTimeout(() => setOpen(false), 160);
  };
  useEffect(() => () => {
    if (dismissTimer.current !== null) clearTimeout(dismissTimer.current);
  }, []);
  useLayoutEffect(() => {
    if (!open || !triggerRef.current || !popoverRef.current) return;
    const anchor = triggerRef.current.getBoundingClientRect();
    const content = popoverRef.current.getBoundingClientRect();
    const margin = 8;
    // Use viewport-fixed portal coordinates. The configuration aside has
    // overflow-y:auto; an absolute tooltip inside it is clipped regardless
    // of whether it opens leftward or rightward.
    const wantedX = align === 'right' ? anchor.right + margin : anchor.right - content.width;
    const wantedY = align === 'right' ? anchor.top : anchor.bottom + 4;
    setPosition({
      left: Math.max(margin, Math.min(wantedX, window.innerWidth - content.width - margin)),
      top: Math.max(margin, Math.min(wantedY, window.innerHeight - content.height - margin)),
    });
  }, [open, align]);
  return <span ref={triggerRef} className="relative inline-flex shrink-0"
    onMouseEnter={keepOpen} onMouseLeave={dismissIfOutside}
    onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget) && !popoverRef.current?.contains(event.relatedTarget)) setOpen(false); }}
    onKeyDown={event => { if (event.key === 'Escape') { setOpen(false); event.stopPropagation(); } }}>
    <button type="button" aria-label={label} aria-expanded={open} aria-haspopup="dialog"
      onFocus={keepOpen} onClick={keepOpen}
      className={`flex items-center justify-center rounded-full border border-[#cdb48b] bg-[#fff9eb] text-[#8b3026] hover:bg-[#f5ecd2] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#b58b42] ${compact ? 'h-5 w-5 text-[11px]' : 'h-8 w-8 text-sm'}`}>i</button>
    {open && createPortal(<div ref={popoverRef} role="dialog" aria-label={label}
      onMouseEnter={keepOpen} onMouseLeave={dismissIfOutside}
      className="fixed z-[9999] w-[min(22rem,calc(100vw-1rem))] rounded-lg border border-[#d9c8a9] bg-[#fffaf0] p-3 text-left text-[12px] font-normal leading-relaxed text-[#52675a] shadow-[0_8px_24px_rgba(52,42,27,0.18)]"
      style={{ left: position?.left ?? -9999, top: position?.top ?? -9999 }}>
      {children}
    </div>, document.body)}
  </span>;
}

function FoundationBuilder({ chart, onBackToCatalogue, profileRows, previewRows, chronologyDragging = false, scatterChronologyAvailable = true, scatterDateRange = null }) {
  // Stable Explore rows define the available fields; playback rows define
  // the plotted data. Charts I state and the recommendations remain independent.
  const [lineMode, setLineMode] = useState('single');
  const [pieMode, setPieMode] = useState('pie');
  const [stackedBarMode, setStackedBarMode] = useState('absolute');
  const [scatterMode, setScatterMode] = useState('scatter');
  const [scatterXAxisMode, setScatterXAxisMode] = useState('numeric');
  const numericScatterXAxisRef = useRef('');
  const [bubbleSizeField, setBubbleSizeField] = useState('');
  const [wideSeriesFields, setWideSeriesFields] = useState([]);
  const [dotMode, setDotMode] = useState('category');
  const [dotFields, setDotFields] = useState(() => (getChartsIIBuilderFieldInventory(profileRows).numericMeasureOptions || []).slice(0,5).map(item => item.key));
  const [dotMeasureField, setDotMeasureField] = useState('recordCount');
  const [dotGroupField, setDotGroupField] = useState(() => getChartsIIBuilderFieldInventory(profileRows).barGroupOptions?.[0]?.key || '');
  const [dotAggregation, setDotAggregation] = useState('average');
  const [dotOrder, setDotOrder] = useState('value');
  const [treemapHierarchy, setTreemapHierarchy] = useState(false);
  const [treemapParentField, setTreemapParentField] = useState(() => getChartsIIBuilderFieldInventory(profileRows).barGroupOptions?.[0]?.key || '');
  const [treemapChildField, setTreemapChildField] = useState(() => getChartsIIBuilderFieldInventory(profileRows).barGroupOptions?.[1]?.key || '');
  const [treemapMeasureField, setTreemapMeasureField] = useState('recordCount');
  const [slopeMode, setSlopeMode] = useState('category');
  const [slopeInterval, setSlopeInterval] = useState('year');
  const [slopeFirstPeriod, setSlopeFirstPeriod] = useState('');
  const [slopeSecondPeriod, setSlopeSecondPeriod] = useState('');
  const [slopeFields, setSlopeFields] = useState(() => (getChartsIIBuilderFieldInventory(profileRows).numericMeasureOptions || []).slice(0,5).map(item=>item.key));
  const [slopeMeasureField, setSlopeMeasureField] = useState('recordCount');
  const [slopeGroupField, setSlopeGroupField] = useState(() => getChartsIIBuilderFieldInventory(profileRows).barGroupOptions?.[0]?.key || '');
  const [slopeAggregation, setSlopeAggregation] = useState('average');
  const [boxMode, setBoxMode] = useState('columns');
  const [boxScale, setBoxScale] = useState('full');
  const [boxFields, setBoxFields] = useState(() => (getChartsIIBuilderFieldInventory(profileRows).numericMeasureOptions || []).slice(0, 5).map(field => field.key));
  const [boxMeasureField, setBoxMeasureField] = useState(() => getChartsIIBuilderFieldInventory(profileRows).numericMeasureOptions?.[0]?.key || '');
  const [boxGroupField, setBoxGroupField] = useState(() => getChartsIIBuilderFieldInventory(profileRows).barGroupOptions?.[0]?.key || '');
  const [gapDisplay, setGapDisplay] = useState('connect'); // Presentation only; never changes derived records.
  const [contract, setContract] = useState(() => createChartsIIBuilderConfiguration(chart?.key, profileRows));
  const [settings, setSettings] = useState({ aggregation: 'count', topN: 10, interval: 'year' });
  // Freeze only the expensive Builder preview during a chronology pointer drag.
  // The shared dock continues moving; its final playback scope is adopted
  // immediately upon pointer release. Playback, filter and field changes
  // outside drag remain live.
  const settledPreviewRows = useRef(previewRows);
  if (!chronologyDragging) settledPreviewRows.current = previewRows;
  const renderedPreviewRows = chronologyDragging ? settledPreviewRows.current : previewRows;
  // The dock moves immediately; a date-based chart adopts its new viewport
  // when the gesture finishes, alongside its settled row scope.
  const settledScatterDateRange = useRef(scatterDateRange);
  if (!chronologyDragging) settledScatterDateRange.current = scatterDateRange;
  const renderedScatterDateRange = chronologyDragging ? settledScatterDateRange.current : scatterDateRange;

  // Presentation modes belong to the selected chart, not to the changing
  // row arrays. Chronology updates may refresh data without resetting Donut.
  useEffect(() => {
    setLineMode('single');
    setPieMode('pie');
    setStackedBarMode('absolute');
    setScatterMode('scatter');
    setScatterXAxisMode('numeric');
    numericScatterXAxisRef.current = '';
    setBubbleSizeField('');
    setWideSeriesFields([]);
    setDotMode('category');
    setDotFields((getChartsIIBuilderFieldInventory(profileRows).numericMeasureOptions || []).slice(0,5).map(item=>item.key));
    setDotMeasureField('recordCount');
    setDotGroupField(getChartsIIBuilderFieldInventory(profileRows).barGroupOptions?.[0]?.key || '');
    setDotAggregation('average');
    setDotOrder('value');
    setTreemapHierarchy(false);
    setTreemapParentField(getChartsIIBuilderFieldInventory(profileRows).barGroupOptions?.[0]?.key || '');
    setTreemapChildField(getChartsIIBuilderFieldInventory(profileRows).barGroupOptions?.[1]?.key || '');
    setTreemapMeasureField('recordCount');
    setSlopeMode('category');
    setSlopeInterval('year');
    setSlopeFirstPeriod('');
    setSlopeSecondPeriod('');
    setSlopeFields((getChartsIIBuilderFieldInventory(profileRows).numericMeasureOptions || []).slice(0,5).map(item=>item.key));
    setSlopeMeasureField('recordCount');
    setSlopeGroupField(getChartsIIBuilderFieldInventory(profileRows).barGroupOptions?.[0]?.key || '');
    setSlopeAggregation('average');
    setBoxMode('columns');
    setBoxScale('full');
    setBoxFields((getChartsIIBuilderFieldInventory(profileRows).numericMeasureOptions || []).slice(0, 5).map(field => field.key));
    setBoxMeasureField(getChartsIIBuilderFieldInventory(profileRows).numericMeasureOptions?.[0]?.key || '');
    setBoxGroupField(getChartsIIBuilderFieldInventory(profileRows).barGroupOptions?.[0]?.key || '');
    setGapDisplay('connect');
  }, [chart?.key]);
  // Changing chart families resets the field contract and aggregation defaults.
  // A changing playback/Explore scope must not discard an existing field choice.
  useEffect(() => {
    setContract(createChartsIIBuilderConfiguration(chart?.key, profileRows));
    setSettings({ aggregation: 'count', topN: 10, interval: 'year' });
  }, [chart?.key]);
  useEffect(() => {
    setContract(previous => {
      if (!previous?.supported) return createChartsIIBuilderConfiguration(previous?.chartKey || chart?.key, profileRows);
      // A temporary inventory change must never silently replace researcher's
      // axis/size choices with defaults. An unavailable choice is displayed as
      // such until it becomes available again or is explicitly changed.
      return validateChartsIIBuilderConfiguration(previous.chartKey, previous.values, getChartsIIBuilderFieldInventory(profileRows));
    });
  }, [profileRows]);
  const temporalFamily = ['line','area','stacked-area'].includes(chart?.key);
  const isLiveFamily = ['scatter', 'box', 'dot', 'slope', 'treemap', 'bar', 'line', 'grouped-bar', 'stacked-bar', 'pie', 'histogram', 'heatmap', 'sunburst', 'area', 'stacked-area'].includes(chart?.key);
  // The dock is the sole chronology filter. Undated datasets have no active
  // chronology and retain the complete Explore-scope record set.
  const scatterRows = chart?.key === 'scatter' && (scatterXAxisMode === 'date' || !scatterChronologyAvailable) ? profileRows : renderedPreviewRows;
  const slopePeriods = useMemo(() => chart?.key === 'slope' ? chartsIISlopePeriods(profileRows, slopeInterval) : [], [chart?.key, profileRows, slopeInterval]);
  const slopeKeys = new Set(slopePeriods.map(period => String(period.start)));
  const effectiveSlopeFirst = slopeKeys.has(slopeFirstPeriod) ? slopeFirstPeriod : String(slopePeriods[0]?.start ?? '');
  const effectiveSlopeSecond = slopeKeys.has(slopeSecondPeriod) ? slopeSecondPeriod : String(slopePeriods[slopePeriods.length-1]?.start ?? '');
  const slopeFirstLabel = slopePeriods.find(period => String(period.start) === effectiveSlopeFirst)?.label || '';
  const slopeSecondLabel = slopePeriods.find(period => String(period.start) === effectiveSlopeSecond)?.label || '';
  // A chronology gesture must not recalculate an already displayed Slope Chart.
  // Freezing its row-array input alone is insufficient: upstream scope changes
  // can also invalidate the Builder's derivation dependencies. Keep the last
  // committed comparison visible until pointer release, then derive once from
  // the settled chronology scope. This is presentation-only; source dates and
  // independently chosen comparison periods are not modified.
  const settledSlopeResult = useRef(null);
  // Scatter must freeze the complete derived result as well as the numeric
  // record scope / date-axis viewport. An upstream scope refresh can otherwise
  // invalidate derivation while the chronology handle is still moving.
  const settledScatterResult = useRef(null);
  const chartResult = useMemo(() => {
    if (chart?.key === 'slope' && chronologyDragging && settledSlopeResult.current !== null) {
      return settledSlopeResult.current;
    }
    if (chart?.key === 'scatter' && chronologyDragging && settledScatterResult.current !== null) {
      return settledScatterResult.current;
    }
    const next = isLiveFamily
      ? deriveChartsIIBuilderData(contract, scatterRows, { ...settings, scatterMode, bubbleSizeField, wideSeriesFields, profileRows, boxMode, boxFields, boxMeasureField, boxGroupField, dotMode, dotFields, dotMeasureField, dotGroupField, dotAggregation, dotOrder, treemapHierarchy, treemapParentField, treemapChildField, treemapMeasureField, slopeMode, slopeFields, slopeMeasureField, slopeGroupField, slopeAggregation, slopeInterval, slopeFirstPeriod:effectiveSlopeFirst, slopeSecondPeriod:effectiveSlopeSecond, slopeFirstLabel, slopeSecondLabel })
      : null;
    if (chart?.key === 'slope' && !chronologyDragging) settledSlopeResult.current = next;
    if (chart?.key === 'scatter' && !chronologyDragging) settledScatterResult.current = next;
    return next;
  }, [chart?.key, chronologyDragging, isLiveFamily, contract, scatterRows, settings, scatterMode, bubbleSizeField, wideSeriesFields, profileRows, boxMode, boxFields, boxMeasureField, boxGroupField, dotMode, dotFields, dotMeasureField, dotGroupField, dotAggregation, dotOrder, treemapHierarchy, treemapParentField, treemapChildField, treemapMeasureField, slopeMode, slopeFields, slopeMeasureField, slopeGroupField, slopeAggregation, slopeInterval, effectiveSlopeFirst, effectiveSlopeSecond, slopeFirstLabel, slopeSecondLabel]);
  const isResultPopulated = chartResult?.status === 'ready' && (() => {
    const result = chartResult.chart;
    if (!result) return false;
    if (result.chartType === 'treemap') return Number(result.total) > 0 && Array.isArray(result.parents) && result.parents.length > 0;
    if (result.chartType === 'slope') return Array.isArray(result.series) && result.series.length > 0;
    if (result.chartType === 'dot') return Array.isArray(result.points) && result.points.length > 0;
    if (result.chartType === 'box') return Array.isArray(result.boxes) && result.boxes.length > 0;
    if (result.chartType === 'scatter') return Array.isArray(result.points) && result.points.length > 0;
    if (result.chartType === 'sunburst') return Number(result.total) > 0 && Array.isArray(result.parents) && result.parents.some(parent => Number(parent.count) > 0 && Array.isArray(parent.children) && parent.children.some(child => Number(child.count) > 0));
    if (result.chartType === 'heatmap') return Array.isArray(result.rows) && result.rows.length > 0 && Array.isArray(result.columns) && result.columns.length > 0 && Array.isArray(result.cells) && result.cells.some(cell => Number(cell.count) > 0);
    if (result.chartType === 'pie') return Array.isArray(result.data) && result.data.some(slice => Number(slice.count) > 0);
    if (result.chartType === 'stackedArea') return Array.isArray(result.periods) && result.periods.length > 0 && Array.isArray(result.series) && result.series.some(series => series.points.some(point => point.count > 0));
    if (result.chartType === 'multiLine') return Array.isArray(result.periods) && result.periods.length > 0 && Array.isArray(result.series) && result.series.length > 0;
    if (result.chartType === 'groupedBar' || result.chartType === 'stackedBar') return Array.isArray(result.data) && result.data.length > 0 && Array.isArray(result.series) && result.series.length > 0;
    return Array.isArray(result.data) && result.data.length > 0;
  })();
  const visibleScatterCount = chartResult?.chart?.chartType === 'scatter' && scatterXAxisMode === 'date'
    && Number.isFinite(renderedScatterDateRange?.start) && Number.isFinite(renderedScatterDateRange?.end)
      ? chartResult.chart.points.filter(point => point.x >= renderedScatterDateRange.start
        && point.x <= renderedScatterDateRange.end).length
      : null;
  const recordCountMeasure = contract.values?.yField === 'recordCount';
  const fixedAdditive = chart?.key === 'stacked-bar' || chart?.key === 'stacked-area';
  const isHistogram = chart?.key === 'histogram';
  const isScatter = chart?.key === 'scatter';
  const isBox = chart?.key === 'box';
  const isDot = chart?.key === 'dot';
  const isSlope = chart?.key === 'slope';
  const isTreemap = chart?.key === 'treemap';
  const dotGroupOptions = getChartsIIBuilderFieldInventory(profileRows).barGroupOptions || [];
  const dotMeasureOptions = getChartsIIBuilderFieldInventory(profileRows).yMetricOptions || [];
  const boxGroupOptions = getChartsIIBuilderFieldInventory(profileRows).barGroupOptions || [];
  const scatterNumericFields = getChartsIIBuilderFieldInventory(profileRows).numericMeasureOptions || [];
  const wideLine = chart?.key === 'line' && lineMode === 'wide';
  // A variable may legitimately encode both an axis and Bubble size; do not
  // silently clear a previously chosen size when another axis changes.
  const scatterSizeOptions = scatterNumericFields;
  const effectiveAggregation = recordCountMeasure ? 'count' : fixedAdditive ? 'sum' : settings.aggregation === 'count' ? 'sum' : settings.aggregation;
  const inputClass = 'mt-1 w-full min-w-0 rounded-md border border-[#cdb48b] bg-[#fffdf7] px-2 py-2 text-[12px] text-[#24382d]';
  return (
    <div className="flex h-full min-h-0 flex-col overflow-y-auto lg:overflow-hidden">
      <p className="sr-only">Charts II Builder · Treemap, Slope Chart, Dot Plot, Box Plot, Scatter/Bubble, Bar, Line, Grouped Bar, Stacked Bar, Pie/Donut, Histogram, Heatmap, Sunburst, Area, and Stacked Area live previews; export pending</p>
      <div className="grid min-h-0 flex-1 gap-4 lg:overflow-hidden lg:grid-cols-[minmax(220px,20%)_minmax(0,1fr)]">
        <aside className={`${panel} min-h-0 overflow-y-auto overscroll-contain p-4`} aria-label="Chart configuration foundation">
          <h3 className="text-xs font-bold uppercase tracking-[0.13em] text-[var(--peridot-color-hex-8b2e23)]">Data &amp; Interpretation</h3>
          {!contract.supported ? (
            <p className="mt-3 text-sm text-[#695b49]">Chart-specific field and derivation support is pending for this family. The Catalogue remains available.</p>
          ) : (
            <div className="mt-3 space-y-3">
              {chart?.key === 'line' && (
                <label className="block text-[12px] font-semibold text-[#344b39]">Lines
                  <select className={inputClass} aria-label="Line series mode" value={lineMode}
                    onChange={(event) => {
                      const mode = event.target.value;
                      setLineMode(mode);
                      setContract(createChartsIIBuilderConfiguration(mode === 'multi' ? 'line-multi' : mode === 'wide' ? 'line-wide' : 'line', profileRows));
                      if (mode === 'wide') {
                        setWideSeriesFields(scatterNumericFields.slice(0, Math.min(2, scatterNumericFields.length)).map(field => field.key));
                        setSettings(previous => ({ ...previous, aggregation: 'average' }));
                      }
                    }}>
                    <option value="single">Single line</option>
                    <option value="multi">Multiple lines by category</option>
                    <option value="wide">Selected numerical columns</option>
                  </select>
                </label>
              )}
              {isTreemap && <div className="space-y-3 text-[12px] text-[#344b39]">
                <label className="block font-semibold">Structure
                  <select className={inputClass} value={treemapHierarchy ? 'hierarchy' : 'single'} onChange={event => setTreemapHierarchy(event.target.value === 'hierarchy')}>
                    <option value="single">Single-level categories</option><option value="hierarchy">Hierarchical categories</option>
                  </select>
                </label>
                <label className="block font-semibold">{treemapHierarchy ? 'Parent category' : 'Group by'}
                  <select className={inputClass} value={treemapParentField} onChange={event => setTreemapParentField(event.target.value)}>
                    <option value="">Choose a category</option>{dotGroupOptions.map(item => <option key={item.key} value={item.key}>{item.label}</option>)}
                  </select>
                </label>
                {treemapHierarchy && <label className="block font-semibold">Child category
                  <select className={inputClass} value={treemapChildField} onChange={event => setTreemapChildField(event.target.value)}>
                    <option value="">Choose a different category</option>{dotGroupOptions.filter(item => item.key !== treemapParentField).map(item => <option key={item.key} value={item.key}>{item.label}</option>)}
                  </select>
                </label>}
                <label className="block font-semibold">Size rectangles by
                  <select className={inputClass} value={treemapMeasureField} onChange={event => setTreemapMeasureField(event.target.value)}>
                    <option value="recordCount">Record count</option>{scatterNumericFields.map(item => <option key={item.key} value={item.key}>{item.label} (sum)</option>)}
                  </select>
                  <span className="mt-1 block text-[10px] font-normal text-[#52675a]">Only counts and nonnegative sums are additive. Negative values are excluded; missing values are never zero.</span>
                </label>
                <label className="block font-semibold">Maximum categories per level
                  <select className={inputClass} value={settings.topN} onChange={event => setSettings(old => ({ ...old, topN: Number(event.target.value) }))}>
                    {[5,10,15,20].map(value => <option key={value} value={value}>{value}</option>)}
                  </select>
                  <span className="mt-1 block text-[10px] font-normal text-[#52675a]">Remaining categories are combined in labeled Other tiles, preserving their totals.</span>
                </label>
                <p className="text-[10px] leading-relaxed text-[#52675a]">Each rectangle's area represents its share of the selected additive total. Chronology filters contributing records.</p>
              </div>}
              {isSlope && <div className="space-y-3 text-[12px] text-[#344b39]">
                <label className="block font-semibold">Compare values
                  <select className={inputClass} value={slopeMode} onChange={event=>setSlopeMode(event.target.value)}>
                    <option value="category">One measure by category</option>
                    <option value="columns">Selected numerical columns</option>
                  </select>
                </label>
                {slopeMode === 'columns' ? <fieldset className="space-y-2 rounded-md border border-[#dccbab] p-2">
                  <legend className="px-1 font-semibold">Numerical columns</legend>
                  <div className="flex gap-3 text-[11px]"><button type="button" className="underline" onClick={()=>setSlopeFields(scatterNumericFields.map(item=>item.key))}>Select all</button><button type="button" className="underline" onClick={()=>setSlopeFields([])}>Clear</button></div>
                  <div className="max-h-36 space-y-1 overflow-y-auto">{scatterNumericFields.map(field=><label key={field.key} className="flex items-start gap-2 font-normal"><input type="checkbox" className="mt-0.5" checked={slopeFields.includes(field.key)} onChange={event=>setSlopeFields(previous=>event.target.checked?[...previous,field.key]:previous.filter(key=>key!==field.key))}/><span>{field.label}</span></label>)}</div>
                </fieldset> : <>
                  <label className="block font-semibold">Measure
                    <select className={inputClass} value={slopeMeasureField} onChange={event=>setSlopeMeasureField(event.target.value)}>
                      {(getChartsIIBuilderFieldInventory(profileRows).yMetricOptions || []).map(item=><option key={item.key} value={item.key}>{item.label}</option>)}
                    </select>
                  </label>
                  <label className="block font-semibold">Group by
                    <select className={inputClass} value={slopeGroupField} onChange={event=>setSlopeGroupField(event.target.value)}>
                      {(getChartsIIBuilderFieldInventory(profileRows).barGroupOptions || []).map(item=><option key={item.key} value={item.key}>{item.label}</option>)}
                    </select>
                  </label>
                  <label className="block font-semibold">Maximum categories
                    <select className={inputClass} value={settings.topN} onChange={event=>setSettings(previous=>({...previous,topN:Number(event.target.value)}))}>
                      {[5,10,15,20].map(value=><option key={value} value={value}>{value}</option>)}
                    </select>
                  </label>
                </>}
                {(slopeMode === 'columns' || slopeMeasureField !== 'recordCount') && <label className="block font-semibold">Aggregate observations
                  <select className={inputClass} value={slopeAggregation} onChange={event=>setSlopeAggregation(event.target.value)}>
                    <option value="average">Average</option><option value="median">Median</option><option value="sum">Sum</option><option value="min">Minimum</option><option value="max">Maximum</option>
                  </select>
                </label>}
                <label className="block font-semibold">Calendar interval
                  <select className={inputClass} value={slopeInterval} onChange={event=>{setSlopeInterval(event.target.value);setSlopeFirstPeriod('');setSlopeSecondPeriod('');}}>
                    {CHARTS_II_TIME_INTERVALS.map(item=><option key={item.value} value={item.value}>{item.label}</option>)}
                  </select>
                </label>
                <label className="block font-semibold">First comparison period
                  <select className={inputClass} value={effectiveSlopeFirst} onChange={event=>setSlopeFirstPeriod(event.target.value)}>
                    {!slopePeriods.length && <option value="">No precisely assignable periods</option>}
                    {slopePeriods.map(item=><option key={item.start} value={String(item.start)}>{item.label}</option>)}
                  </select>
                </label>
                <label className="block font-semibold">Second comparison period
                  <select className={inputClass} value={effectiveSlopeSecond} onChange={event=>setSlopeSecondPeriod(event.target.value)}>
                    {!slopePeriods.length && <option value="">No precisely assignable periods</option>}
                    {slopePeriods.map(item=><option key={item.start} value={String(item.start)}>{item.label}</option>)}
                  </select>
                </label>
                <p className="text-[10px] leading-relaxed text-[#52675a]">Periods are independently selected from canonical dates. The chronology window filters both periods. A category absent from one period remains missing, never zero.</p>
              </div>}
              {isDot && <div className="space-y-3 text-[12px] text-[#344b39]">
                <label className="block font-semibold">Compare values
                  <select className={inputClass} value={dotMode} aria-label="Dot Plot data mode" onChange={event => setDotMode(event.target.value)}>
                    <option value="category">One measure by category</option>
                    <option value="columns">Selected numerical columns</option>
                  </select>
                </label>
                {dotMode === 'columns' ? <fieldset className="space-y-2 rounded-md border border-[#dccbab] p-2">
                  <legend className="px-1 font-semibold">Numerical columns</legend>
                  <div className="flex gap-3 text-[11px]"><button type="button" className="underline" onClick={()=>setDotFields(scatterNumericFields.map(item=>item.key))}>Select all</button><button type="button" className="underline" onClick={()=>setDotFields([])}>Clear</button></div>
                  <div className="max-h-44 space-y-1 overflow-y-auto">{scatterNumericFields.map(field => <label key={field.key} className="flex items-start gap-2 font-normal">
                    <input type="checkbox" className="mt-0.5" checked={dotFields.includes(field.key)} onChange={event=>setDotFields(previous=>event.target.checked?[...previous,field.key]:previous.filter(key=>key!==field.key))}/><span>{field.label}</span>
                  </label>)}</div>
                  <p className="text-[10px] text-[#52675a]">One dot per selected column; blank cells are excluded, never zero.</p>
                </fieldset> : <>
                  <label className="block font-semibold">Measure
                    <select className={inputClass} value={dotMeasureField} onChange={event=>setDotMeasureField(event.target.value)}>
                      <option value="">Choose a measure</option>{dotMeasureOptions.map(field=><option key={field.key} value={field.key}>{field.label}</option>)}
                    </select>
                  </label>
                  <label className="block font-semibold">Group by
                    <select className={inputClass} value={dotGroupField} onChange={event=>setDotGroupField(event.target.value)}>
                      <option value="">Choose a category</option>{dotGroupOptions.map(field=><option key={field.key} value={field.key}>{field.label}</option>)}
                    </select>
                  </label>
                  <label className="block font-semibold">Maximum categories
                    <select className={inputClass} value={settings.topN} onChange={event=>setSettings(previous=>({...previous,topN:Number(event.target.value)}))}>
                      {[5,10,15,20].map(value=><option key={value} value={value}>{value}</option>)}
                    </select>
                  </label>
                </>}
                {(dotMode === 'columns' || dotMeasureField !== 'recordCount') && <label className="block font-semibold">Aggregate observations
                  <select className={inputClass} value={dotAggregation} onChange={event=>setDotAggregation(event.target.value)}>
                    <option value="average">Average</option><option value="median">Median</option><option value="sum">Sum</option><option value="min">Minimum</option><option value="max">Maximum</option>
                  </select>
                </label>}
                <label className="block font-semibold">Order categories
                  <select className={inputClass} value={dotOrder} onChange={event=>setDotOrder(event.target.value)}>
                    <option value="value">Highest value first</option><option value="label">Alphabetical</option>
                  </select>
                </label>
                <p className="text-[10px] leading-relaxed text-[#52675a]">Each dot is one aggregated value, not an individual observation. The chronology dock filters contributing records.</p>
              </div>}
              {isBox && <div className="space-y-3 text-[12px] text-[#344b39]">
                <label className="block font-semibold">Compare distributions
                  <select className={inputClass} aria-label="Box Plot data mode" value={boxMode} onChange={event => setBoxMode(event.target.value)}>
                    <option value="columns">Selected numerical columns</option>
                    <option value="category">One measure grouped by category</option>
                  </select>
                </label>
                {boxMode === 'columns' ? <fieldset className="space-y-2 rounded-md border border-[#dccbab] p-2">
                  <legend className="px-1 font-semibold">Numerical columns</legend>
                  <div className="flex gap-3 text-[11px]">
                    <button type="button" className="underline" onClick={() => setBoxFields(scatterNumericFields.map(field => field.key))}>Select all</button>
                    <button type="button" className="underline" onClick={() => setBoxFields([])}>Clear</button>
                  </div>
                  <div className="max-h-44 space-y-1 overflow-y-auto">
                    {scatterNumericFields.map(field => <label key={field.key} className="flex items-start gap-2 font-normal">
                      <input type="checkbox" className="mt-0.5" checked={boxFields.includes(field.key)}
                        onChange={event => setBoxFields(previous => event.target.checked ? [...previous, field.key] : previous.filter(key => key !== field.key))}/>
                      <span>{field.label}</span>
                    </label>)}
                  </div>
                  <p className="text-[10px] text-[#52675a]">Each selected column is a distribution; blank cells do not become zeros.</p>
                </fieldset> : <>
                  <label className="block font-semibold">Numeric measure
                    <select className={inputClass} value={boxMeasureField} onChange={event => setBoxMeasureField(event.target.value)}>
                      <option value="">Choose a measure</option>
                      {scatterNumericFields.map(field => <option key={field.key} value={field.key}>{field.label}</option>)}
                    </select>
                  </label>
                  <label className="block font-semibold">Group by
                    <select className={inputClass} value={boxGroupField} onChange={event => setBoxGroupField(event.target.value)}>
                      <option value="">Choose a category</option>
                      {boxGroupOptions.map(field => <option key={field.key} value={field.key}>{field.label}</option>)}
                    </select>
                  </label>
                  <label className="block font-semibold">Maximum categories
                    <select className={inputClass} value={settings.topN} onChange={event => setSettings(previous => ({...previous, topN: Number(event.target.value)}))}>
                      {[5,10,15,20].map(value => <option key={value} value={value}>{value}</option>)}
                    </select>
                  </label>
                </>}
                <label className="block font-semibold">Vertical scale
                  <select className={inputClass} aria-label="Box Plot vertical scale" value={boxScale} onChange={event => setBoxScale(event.target.value)}>
                    <option value="full">Full range (all values)</option>
                    <option value="focus">Focus on distributions (whiskers)</option>
                  </select>
                </label>
                <p className="text-[10px] leading-relaxed text-[#52675a]">Focused scale keeps statistics unchanged and marks outliers beyond the visible axis.</p>
                <p className="text-[10px] leading-relaxed text-[#52675a]">Quartiles use linear interpolation. Whiskers extend to the most extreme measurements within 1.5×IQR; outliers remain visible and included in the distribution.</p>
              </div>}
              {wideLine && <fieldset className="space-y-2 rounded-md border border-[#dccbab] p-2 text-[12px] text-[#344b39]">
                <legend className="px-1 font-semibold">Numerical columns to compare</legend>
                <div className="flex items-center gap-3 text-[11px]">
                  <button type="button" className="underline" onClick={() => setWideSeriesFields(scatterNumericFields.map(field => field.key))}>Select all</button>
                  <button type="button" className="underline" onClick={() => setWideSeriesFields([])}>Clear</button>
                </div>
                <div className="max-h-36 space-y-1 overflow-y-auto">
                  {scatterNumericFields.map(field => <label key={field.key} className="flex items-start gap-2 font-normal">
                    <input type="checkbox" className="mt-0.5" checked={wideSeriesFields.includes(field.key)}
                      onChange={event => setWideSeriesFields(previous => event.target.checked ? [...previous, field.key] : previous.filter(key => key !== field.key))}/>
                    <span>{field.label}</span>
                  </label>)}
                </div>
                <p className="text-[10px] font-normal text-[#52675a]">Each chosen column becomes a line. Blank prices remain missing; aggregation uses observed values only.</p>
              </fieldset>}
              {isScatter && <div className="space-y-3">
                <p className="text-[11px] leading-relaxed text-[#52675a]">{scatterChronologyAvailable
                  ? scatterXAxisMode === 'date'
                    ? 'The chronology dock navigates the visible date axis. Its full extent shows the whole mapped period.'
                    : 'The chronology dock filters plotted records. Reset restores the full mapped period.'
                  : 'Chronology inactive: no usable mapped dates. Numerical comparisons still include eligible Explore-scope records.'}</p>
                <label className="block text-[12px] font-semibold text-[#344b39]">X-axis
                  <select className={inputClass} aria-label="Scatter X-axis" value={scatterXAxisMode === 'date' ? '__canonicalDate__' : (contract.values.scatterXField || '')}
                    onChange={event => {
                      const selection = event.target.value;
                      const dateMode = selection === '__canonicalDate__';
                      const newKey = dateMode ? 'scatter-date' : 'scatter';
                      const base = createChartsIIBuilderConfiguration(newKey, profileRows);
                      if (!dateMode) numericScatterXAxisRef.current = selection;
                      else if (contract.chartKey === 'scatter' && contract.values.scatterXField) numericScatterXAxisRef.current = contract.values.scatterXField;
                      const values = { ...base.values };
                      if (base.slots.some(slot => slot.key === 'scatterYField' && slot.options.some(opt => opt.key === contract.values.scatterYField))) values.scatterYField = contract.values.scatterYField;
                      if (!dateMode) values.scatterXField = selection;
                      setContract(validateChartsIIBuilderConfiguration(newKey, values, getChartsIIBuilderFieldInventory(profileRows)));
                      setScatterXAxisMode(dateMode ? 'date' : 'numeric');
                    }}>
                    <option value="__canonicalDate__" disabled={!scatterChronologyAvailable}>Date</option>
                    {scatterNumericFields.map(option => <option key={option.key} value={option.key}>{option.label}</option>)}
                  </select>
                  {scatterXAxisMode === 'date' && <span className="mt-1 block text-[10px] font-normal text-[#52675a]">Uses mapped canonical dates. Only precisely assignable days are plotted; the chronology dock navigates the visible date range.</span>}
                </label>
                <label className="block text-[12px] font-semibold text-[#344b39]">Display
                  <select className={inputClass} aria-label="Scatter or bubble display" value={scatterMode} onChange={event => setScatterMode(event.target.value)}>
                    <option value="scatter">Scatter</option><option value="bubble">Bubble</option>
                  </select>
                </label>
                {scatterMode === 'bubble' && <label className="block text-[12px] font-semibold text-[#344b39]">Bubble size (numeric)
                  <select className={inputClass} value={scatterSizeOptions.some(option => option.key === bubbleSizeField) ? bubbleSizeField : ''}
                    onChange={event => setBubbleSizeField(event.target.value)} aria-label="Bubble size field">
                    <option value="">Choose a numerical field</option>
                    {scatterSizeOptions.map(option => <option key={option.key} value={option.key}>{option.label}</option>)}
                  </select>
                  <span className="mt-1 block text-[10px] font-normal text-[#52675a]">Bubble sizes use nonnegative values. Records lacking a usable size are excluded.</span>
                </label>}
              </div>}
              {chart?.key === 'pie' && (
                <label className="block text-[12px] font-semibold text-[#344b39]">Display
                  <select className={inputClass} aria-label="Pie or donut display" value={pieMode} onChange={(event) => setPieMode(event.target.value)}>
                    <option value="pie">Pie</option>
                    <option value="donut">Donut</option>
                  </select>
                </label>
              )}
              {chart?.key === 'stacked-bar' && <label className="block text-[12px] font-semibold text-[#344b39]">Stacked display
                <select aria-label="Stacked display" className={inputClass} value={stackedBarMode} onChange={event => setStackedBarMode(event.target.value)}>
                  <option value="absolute">Stacked — absolute totals</option>
                  <option value="percent">100% Stacked — within-category percentages</option>
                </select>
                <span className="mt-1 block text-[10px] font-normal text-[#52675a]">100% Stacked divides each category's additive segments by that category's total. Original counts or sums remain available on hover.</span>
              </label>}
              {temporalFamily && <div className="relative text-[12px] font-semibold text-[#344b39]">
                <div className="flex items-center gap-1.5">Ordered x-axis
                  <InfoPopover label="About chronological intervals" compact>
                    <p>Records are grouped into fixed calendar intervals. Peridot uses mapped canonical dates, not raw uploaded date strings.</p>
                    <p className="mt-2">A record is included only when its source date can be assigned unambiguously to one interval. A month-only date cannot be assigned to a particular week. Exclusions are reported separately in Peridot's Interpretation.</p>
                  </InfoPopover>
                </div>
                <select className={inputClass} aria-label="Ordered x-axis interval" value={settings.interval}
                  onChange={event => setSettings(old => ({ ...old, interval: event.target.value }))}>
                  {CHARTS_II_TIME_INTERVALS.map(item => <option value={item.value} key={item.value}>{item.label}</option>)}
                </select>
              </div>}
              {contract.slots.map((slot) => slot.optional || (temporalFamily && slot.key === 'xField') || (isScatter && slot.key === 'scatterXField') ? null : (
                <label key={slot.key} className="block text-[12px] font-semibold text-[#344b39]">
                  {slot.label}
                  <select aria-label={slot.label} className={inputClass} value={contract.values[slot.key] || ''}
                    onChange={(event) => setContract(updateChartsIIBuilderConfiguration(contract, slot.key, event.target.value, profileRows))}>
                    {!slot.options.length && <option value="">No usable fields</option>}
                    {slot.options.map(option => <option key={option.key} value={option.key}>{option.label}</option>)}
                  </select>
                </label>
              ))}
              {!contract.additive && !isHistogram && !isScatter && !isBox && !isDot && !isSlope && !isTreemap && <label className="block text-[12px] font-semibold text-[#344b39]">Aggregation
                <select className={inputClass} value={wideLine ? (settings.aggregation === 'count' ? 'average' : settings.aggregation) : effectiveAggregation}
                  disabled={recordCountMeasure || fixedAdditive}
                  onChange={(event) => setSettings(old => ({ ...old, aggregation: event.target.value }))}>
                  {!wideLine && <option value="count">Count</option>}<option value="sum">Sum</option><option value="average">Average</option><option value="min">Minimum</option><option value="max">Maximum</option>
                </select>
                {wideLine && <span className="mt-1 block text-[10px] font-normal text-[#52675a]">Average is recommended for prices; Sum adds price observations and is generally not meaningful for stock values.</span>}
                {recordCountMeasure && <span className="mt-1 block text-[10px] font-normal text-[#52675a]">Record count uses Count; choose a numeric measure for other aggregations.</span>}
                {fixedAdditive && !recordCountMeasure && <span className="mt-1 block text-[10px] font-normal text-[#52675a]">Stacked values use Sum to preserve additive segment totals.</span>}
              </label>}
              {!isHistogram && !isScatter && !isBox && !isDot && !isSlope && !isTreemap && !wideLine && <label className="block text-[12px] font-semibold text-[#344b39]">Maximum categories
                <select className={inputClass} value={settings.topN} onChange={(event) => setSettings(old => ({ ...old, topN: Number(event.target.value) }))}>
                  {[5,10,15,20].map(value => <option key={value} value={value}>{value}</option>)}
                </select>
              </label>}
              <p className="text-[11px] leading-relaxed text-[#52675a]">{contract.ready
                ? isLiveFamily
                  ? `${profileRows.length} records in Explore scope · ${isScatter ? scatterRows.length : previewRows.length} in chart scope.`
                  : `Field contract ready · ${profileRows.length} records in Explore scope. Live preview pending for this chart family.`
                : contract.problems.join(' ')}</p>
            </div>
          )}
          <div className="my-4 border-t border-[var(--peridot-color-hex-d5c7a8)]" />
          <details className="group" aria-label="Chart filters">
            <summary className="cursor-pointer text-xs font-bold uppercase tracking-[0.13em] text-[var(--peridot-color-hex-8b2e23)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#b58b42]">Filters</summary>
            <p className="mt-2 text-sm text-[var(--peridot-color-hex-52675a)]">Chart-local scope controls are pending.</p>
          </details>
          <div className="my-4 border-t border-[var(--peridot-color-hex-d5c7a8)]" />
          <details className="group" aria-label="Chart appearance">
            <summary className="cursor-pointer text-xs font-bold uppercase tracking-[0.13em] text-[var(--peridot-color-hex-8b2e23)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#b58b42]">Appearance</summary>
            {temporalFamily && <fieldset className="mt-3 space-y-2 text-[12px] text-[#344b39]">
              <legend className="flex items-center gap-2 font-semibold">Data gap display
                <InfoPopover label="About connecting observations" compact align="right">
                  <p><strong>Connect observations</strong> joins recorded values across intervals without observations. These connections are visual interpolation, not additional records or measured values.</p>
                  <p className="mt-2"><strong>Show data gaps</strong> leaves unobserved intervals visibly disconnected.</p>
                  <p className="mt-2">Neither option changes the underlying dataset, aggregation, record inclusion, or precision-based exclusions. Missing numerical values are never fabricated.</p>
                </InfoPopover>
              </legend>
              <label className="flex items-center gap-2"><input type="radio" name="chartsII-gap-display" value="connect" checked={gapDisplay === 'connect'} onChange={() => setGapDisplay('connect')} />Connect observations (default)</label>
              <label className="flex items-center gap-2"><input type="radio" name="chartsII-gap-display" value="gaps" checked={gapDisplay === 'gaps'} onChange={() => setGapDisplay('gaps')} />Show data gaps</label>
            </fieldset>}
            <p className="mt-2 text-sm text-[var(--peridot-color-hex-52675a)]">Palette and other presentation controls are pending.</p>
          </details>
        </aside>
        <section className="flex min-h-0 min-w-0 flex-col gap-3" aria-label="Chart preview foundation">
          <div className={`${panel} flex min-h-0 flex-1 flex-col overflow-hidden p-5`}>
            <div className="flex min-w-0 shrink-0 items-start justify-between gap-3">
              <h3 className={`${heading} min-w-0 text-2xl font-semibold text-[var(--peridot-color-hex-173120)]`}>{chart?.name || 'Choose a chart type'}</h3>
              <InfoPopover label="Peridot's Interpretation">
                <h4 className={`${heading} mb-2 text-[16px] font-semibold text-[#8b3026]`}>Peridot's Interpretation</h4>
                {isTreemap && chartResult?.reporting ? <>
                  <p>Treemap area represents <strong>{chartResult.reporting.aggregation}</strong> of {chartResult.reporting.measureField}. Total: {chartResult.reporting.total.toLocaleString()} across {chartResult.reporting.displayedParents} displayed parent groups.</p>
                  <p className="mt-2">Included records: {chartResult.reporting.includedRecords} of {chartResult.reporting.scope}. Missing category: {chartResult.reporting.excluded.missingCategory}; missing numerical measure: {chartResult.reporting.excluded.missingMeasure}; invalid: {chartResult.reporting.excluded.invalidMeasure}; negative: {chartResult.reporting.excluded.negativeMeasure}; zero: {chartResult.reporting.excluded.zeroMeasure}.</p>
                  <p className="mt-2">Records outside the displayed hierarchy: {chartResult.reporting.scope - chartResult.reporting.includedRecords}. These are accounted for by the detailed missing/invalid/negative/zero exclusions above, not as zero-size tiles.</p>
                  <p className="mt-2">Consolidated categories: {chartResult.reporting.omittedParents} parents, {chartResult.reporting.omittedChildren} children. Values are not changed when combined under Other. The shared chronology dock controls the contributing scope.</p>
                </> : isSlope && chartResult?.reporting ? <>
                  <p>Comparison: <strong>{slopeFirstLabel}</strong> versus <strong>{slopeSecondLabel}</strong>; aggregation: {chartResult.reporting.aggregation}.</p>
                  <p className="mt-2">{chartResult.reporting.pairedGroups} paired groups of {chartResult.reporting.plottedGroups} shown. Missing first: {chartResult.reporting.missingFirst}; missing second: {chartResult.reporting.missingSecond}. These endpoints are missing, never zero.</p>
                  <p className="mt-2">Contributing records: {chartResult.reporting.includedRecords.join(' / ')} in the two periods. Unassigned temporal precision: {chartResult.reporting.excluded.insufficientPrecision}; missing date: {chartResult.reporting.excluded.missingDate}; invalid date: {chartResult.reporting.excluded.invalidDate}.</p>
                  <p className="mt-2">Excluded measurements: missing {chartResult.reporting.excluded.missingMeasure}, invalid {chartResult.reporting.excluded.invalidMeasure}; missing categories {chartResult.reporting.excluded.missingCategory}; groups omitted by display limit {chartResult.reporting.groupsOmitted}.</p>
                </> : isDot && chartResult?.reporting ? <>
                  <p>Dot Plot shows <strong>{chartResult.reporting.plottedGroups}</strong> values, each summarizing a {chartResult.reporting.mode === 'columns' ? 'numerical column' : 'category'} using {chartResult.reporting.aggregation}.</p>
                  <p className="mt-2">Included measurements: {chartResult.reporting.includedMeasurements}; missing: {chartResult.reporting.excluded.missingMeasure}; invalid: {chartResult.reporting.excluded.invalidMeasure}; missing category: {chartResult.reporting.excluded.missingCategory}.</p>
                  <p className="mt-2">Omitted categories due to display limit: {chartResult.reporting.groupsOmitted}. A dot represents a summary, not a source record. Chronology changes which records contribute to each summary.</p>
                </> : isBox && chartResult?.reporting ? <>
                  <p>Box Plot compares {chartResult.reporting.mode === 'columns' ? 'selected numerical columns' : 'one numerical measure across categories'}. {chartResult.reporting.plottedGroups} distributions displayed; {chartResult.reporting.groupsOmitted} categories omitted by the limit.</p>
                  <p className="mt-2">Valid numerical measurements: <strong>{chartResult.reporting.includedMeasurements}</strong>. Missing: {chartResult.reporting.excluded.missingMeasure}; invalid: {chartResult.reporting.excluded.invalidMeasure}; missing category: {chartResult.reporting.excluded.missingCategory}.</p>
                  <p className="mt-2">Outlying observations displayed: {chartResult.reporting.outliers}. Quartiles use linear interpolation (type 7); whiskers extend to the most extreme values within 1.5 × IQR. Outliers are not deleted or excluded from quartile calculations.</p>
                  <p className="mt-2">Vertical scale: {boxScale === 'focus' ? 'focus on distributions (whiskers)' : 'full range'}. Focused scaling only changes the visible axis; off-scale outliers are counted and indicated at the plot boundary, not removed from calculations.</p>
                  <p className="mt-2">Chronology filters the records included in each distribution when mapped dates are available.</p>
                </> : wideLine && chartResult?.reporting ? <>
                  <p>Selected numerical columns: {chartResult.reporting.selectedFields.join(', ')}. Interval: {chartResult.reporting.interval}; aggregation: {chartResult.reporting.aggregation}.</p>
                  <p className="mt-2">Records in scope: {chartResult.reporting.scope}; date-eligible: {chartResult.reporting.eligibleRecords}; periods shown: {chartResult.reporting.assignedPeriods}.</p>
                  <p className="mt-2">Excluded dates: missing {chartResult.reporting.excluded.missingDate}, invalid {chartResult.reporting.excluded.invalidDate}, insufficient precision {chartResult.reporting.excluded.insufficientPrecision}.</p>
                  <p className="mt-2">Measurements by column: {Object.entries(chartResult.reporting.fields).map(([name,item]) => `${name} ${item.included} valid / ${item.missingOrInvalid} unavailable`).join('; ')}.</p>
                  <p className="mt-2">An empty price cell is never zero. The gap display controls visual interpolation only.</p>
                </> : isScatter && chartResult?.reporting ? <>
                  <p>Eligible: <strong>{chartResult.reporting.plotted}</strong> of {chartResult.reporting.scope} {scatterXAxisMode === 'date' || !scatterChronologyAvailable ? 'Explore-scope' : 'chronology-window'} records. {visibleScatterCount !== null ? `${visibleScatterCount} visible in the selected date window. ` : ''}Each point represents one record; values are not aggregated.</p>
                  <p className="mt-2">{scatterChronologyAvailable ? scatterXAxisMode === 'date' ? 'Chronology navigates the horizontal date axis; changing its window does not modify the full Explore dataset.' : 'Chronology filters the plotted numerical observations; Reset restores the full time extent.' : 'Chronology inactive because mapped temporal observations are unavailable.'}</p>
                  <p className="mt-2">Excluded: missing X {chartResult.reporting.excluded.missingX}, invalid X {chartResult.reporting.excluded.invalidX}; missing Y {chartResult.reporting.excluded.missingY}, invalid Y {chartResult.reporting.excluded.invalidY}.</p>
                  {scatterMode === 'bubble' && <p className="mt-2">Bubble size exclusions: missing {chartResult.reporting.excluded.missingSize}, invalid {chartResult.reporting.excluded.invalidSize}, negative {chartResult.reporting.excluded.negativeSize}.</p>}
                  {scatterXAxisMode === 'date' && <p className="mt-2">Date exclusions due to insufficient precision: {chartResult.reporting.excluded.insufficientDatePrecision}. Only exact canonical days receive x-axis coordinates.</p>}
                  <p className="mt-2">Overlapping coordinates: {chartResult.reporting.overlappingCoordinates} locations, {chartResult.reporting.overlappingRecords} additional records. Small display-only offsets distinguish coincident observations; their underlying values are unchanged.</p>
                </> : temporalFamily && chartResult?.reporting ? <>
                  <p>Interval: <strong>{CHARTS_II_TIME_INTERVALS.find(item => item.value === chartResult.reporting.interval)?.label}</strong>. Measure: {chartResult.reporting.measure}. Aggregation: {chartResult.reporting.aggregation}.</p>
                  <p className="mt-2">Included: <strong>{chartResult.reporting.included}</strong> of {chartResult.reporting.scope} playback-scope records. Plotted intervals: {chartResult.reporting.assignedPeriods}.</p>
                  <p className="mt-2">Excluded for insufficient date precision: <strong>{chartResult.reporting.excluded.insufficientPrecision}</strong>.</p>
                  <p>Missing date: {chartResult.reporting.excluded.missingDate}; invalid or unusable date: {chartResult.reporting.excluded.invalidDate}; unavailable numeric measure: {chartResult.reporting.excluded.missingMeasure}; unavailable grouping: {chartResult.reporting.excluded.missingGrouping}.</p>
                  <p className="mt-2">Source dates must fit wholly within the selected interval. A missing numeric observation is never assigned zero.</p>
                  <p className="mt-2"><strong>Gap display:</strong> {gapDisplay === 'connect' ? 'Connect observations — lines or areas visually interpolate across unobserved intervals. No records or measurements are created.' : 'Show data gaps — unobserved intervals remain disconnected.'} Exclusions for date precision and missing values are unchanged.</p>
                </> : <p>Chart-specific computational interpretation will be added during the Builder's interpretation pass.</p>}
              </InfoPopover>
            </div>
            {isLiveFamily ? (
              <div className="min-h-0 min-w-0 flex-1 overflow-auto pt-3" aria-label={`Live ${chart.name} chart preview`} aria-live="polite">
                {!contract.ready ? (
                  <div className="flex h-full items-center justify-center p-4 text-center text-sm text-[#52675a]">{contract.problems.join(' ') || 'Choose valid fields to render this chart.'}</div>
                ) : chartResult?.status === 'unavailable' ? (
                  <div className="flex h-full items-center justify-center p-4 text-center text-sm text-[#52675a]">{chartResult.problems?.join(' ')}</div>
                ) : !(isScatter ? scatterRows : previewRows).length ? (
                  <div className="flex h-full items-center justify-center p-4 text-center text-sm text-[#52675a]">No records are available in the current playback scope.</div>
                ) : isResultPopulated ? (
                  <div className="h-full min-h-[320px] min-w-0">
                    {chartResult.chart.chartType === 'treemap' && <AnalyticsTreemapChart key={`${treemapHierarchy ? "h" : "s"}:${treemapParentField}:${treemapChildField}:${treemapMeasureField}`} parents={chartResult.chart.parents} total={chartResult.chart.total} title={chartResult.chart.title} subtitle={chartResult.chart.subtitle} measureLabel={chartResult.chart.measureLabel} />}
                    {chartResult.chart.chartType === 'slope' && <AnalyticsSlopeChart series={chartResult.chart.series} title={chartResult.chart.title} subtitle={chartResult.chart.subtitle} firstLabel={chartResult.chart.firstLabel} secondLabel={chartResult.chart.secondLabel} />}
                    {chartResult.chart.chartType === 'dot' && <AnalyticsDotPlotChart points={chartResult.chart.points} title={chartResult.chart.title} subtitle={chartResult.chart.subtitle} valueLabel={chartResult.chart.valueLabel} />}
                    {chartResult.chart.chartType === 'box' && <AnalyticsBoxPlotChart boxes={chartResult.chart.boxes} title={chartResult.chart.title} subtitle={chartResult.chart.subtitle} scaleMode={boxScale} />}
                    {chartResult.chart.chartType === 'scatter' && <AnalyticsScatterChart dateRange={chartResult.chart.xAxisDate ? renderedScatterDateRange : null} points={chartResult.chart.points} title={chartResult.chart.title} subtitle={chartResult.chart.subtitle} xLabel={chartResult.chart.xLabel} xAxisDate={chartResult.chart.xAxisDate} yLabel={chartResult.chart.yLabel} sizeLabel={chartResult.chart.sizeLabel} />}
                    {chartResult.chart.chartType === 'bar' && <AnalyticsBarChart data={chartResult.chart.data} title={chartResult.chart.title} subtitle={chartResult.chart.subtitle} orientation={chartResult.chart.orientation} />}
                    {chartResult.chart.chartType === 'area' && <AnalyticsAreaChart data={chartResult.chart.data} title={chartResult.chart.title} subtitle={chartResult.chart.subtitle} temporalAxis={chartResult.chart.temporalAxis} gapDisplay={gapDisplay} />}
                    {chartResult.chart.chartType === 'stackedArea' && <AnalyticsStackedAreaChart series={chartResult.chart.series} periods={chartResult.chart.periods} totals={chartResult.chart.totals} title={chartResult.chart.title} subtitle={chartResult.chart.subtitle} temporalAxis={chartResult.chart.temporalAxis} gapDisplay={gapDisplay} />}
                    {chartResult.chart.chartType === 'line' && <AnalyticsLineChart data={chartResult.chart.data} title={chartResult.chart.title} subtitle={chartResult.chart.subtitle} temporalAxis={chartResult.chart.temporalAxis} gapDisplay={gapDisplay} />}
                    {chartResult.chart.chartType === 'multiLine' && <AnalyticsMultiLineChart series={chartResult.chart.series} periods={chartResult.chart.periods} title={chartResult.chart.title} subtitle={chartResult.chart.subtitle} temporalAxis={chartResult.chart.temporalAxis} gapDisplay={gapDisplay} />}
                    {chartResult.chart.chartType === 'groupedBar' && <AnalyticsGroupedBarChart data={chartResult.chart.data} series={chartResult.chart.series} title={chartResult.chart.title} subtitle={chartResult.chart.subtitle} />}
                    {chartResult.chart.chartType === 'stackedBar' && <AnalyticsStackedBarChart data={chartResult.chart.data} series={chartResult.chart.series} title={chartResult.chart.title} subtitle={chartResult.chart.subtitle} mode={stackedBarMode} />}
                    {chartResult.chart.chartType === 'pie' && <AnalyticsPieChart data={chartResult.chart.data} title={chartResult.chart.title} subtitle={chartResult.chart.subtitle} donut={pieMode === 'donut'} />}
                    {chartResult.chart.chartType === 'histogram' && <AnalyticsHistogram data={chartResult.chart.data} title={chartResult.chart.title} subtitle={chartResult.chart.subtitle} />}
                    {chartResult.chart.chartType === 'heatmap' && <AnalyticsHeatmap rows={chartResult.chart.rows} columns={chartResult.chart.columns} cells={chartResult.chart.cells} title={chartResult.chart.title} subtitle={chartResult.chart.subtitle} />}
                    {chartResult.chart.chartType === 'sunburst' && <AnalyticsSunburst parents={chartResult.chart.parents} total={chartResult.chart.total} title={chartResult.chart.title} subtitle={chartResult.chart.subtitle} />}
                  </div>
                ) : (
                  <div className="flex h-full items-center justify-center p-4 text-center text-sm text-[#52675a]">No chartable values were found for these selections in the current playback scope.</div>
                )}
              </div>
            ) : chart ? (
              <div className="flex flex-1 items-center justify-center p-4 text-center text-sm text-[var(--peridot-color-hex-52675a)]">
                Live preview for this chart family is not yet implemented. Bar / Column, Line / Multi-Line, Grouped Bar, Stacked Bar, Pie / Donut, Histogram, Heatmap, Sunburst, Area, Stacked Area, Scatter / Bubble, Box Plot, Dot Plot, Slope Chart, and Treemap are available now.
              </div>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 p-4 text-center">
                <p className="max-w-lg text-sm text-[var(--peridot-color-hex-52675a)]">
                  Select a chart type from the catalogue to begin configuring your visualization.
                </p>
                <button type="button" onClick={onBackToCatalogue} className="rounded-lg border border-[var(--peridot-color-hex-b58b42)] px-4 py-2 text-sm font-semibold text-[var(--peridot-color-hex-8b2e23)] transition hover:bg-[var(--peridot-color-hex-f5ecd2)] focus:outline-none focus:ring-2 focus:ring-[var(--peridot-color-hex-b58b42)]">
                  Browse chart types
                </button>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export function PeridotChartsIIFoundation({ selectedChartKey, currentPage, onSelectChart, onNavigatePage, profileRows = [], previewRows = [], chronologyDragging = false, scatterChronologyAvailable = true, scatterDateRange = null }) {
  // Profile is derived from the stable applied Explore scope. Playback changes
  // should not reorder recommendations while a researcher uses the scrubber.
  const profile = useMemo(() => buildChartsIIDataProfile(profileRows), [profileRows]);
  const charts = useMemo(() => assessChartsIISuitability(profile, CHART_FAMILIES), [profile]);
  const chart = charts.find((item) => item.key === selectedChartKey);
  const showingBuilder = currentPage === 'builder';
  return (
    <div className={`min-h-0 flex-1 rounded-xl px-4 pb-4 text-[var(--peridot-color-hex-24382d)] sm:px-5 sm:pb-5 ${showingBuilder ? "overflow-hidden bg-[var(--peridot-color-hex-f8f4e6)] pt-1" : "overflow-auto bg-[#f9f4e9] pt-9"}`}>
      {showingBuilder
        ? <FoundationBuilder chart={chart} profileRows={profileRows} previewRows={previewRows} chronologyDragging={chronologyDragging} scatterChronologyAvailable={scatterChronologyAvailable} scatterDateRange={scatterDateRange} onBackToCatalogue={() => onNavigatePage('catalogue')} />
        : <FoundationCatalogue onSelectChart={onSelectChart} charts={charts} profile={profile} />}
    </div>
  );
}
