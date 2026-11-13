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
import React, { useEffect, useMemo, useState } from 'react';
import { buildChartsIIDataProfile, assessChartsIISuitability } from './chartsIIDataProfile.js';
import { createChartsIIBuilderConfiguration, updateChartsIIBuilderConfiguration, deriveChartsIIBuilderData } from './chartsIIBuilderContract.js';
import { AnalyticsBarChart, AnalyticsLineChart, AnalyticsMultiLineChart, AnalyticsGroupedBarChart, AnalyticsStackedBarChart, AnalyticsPieChart, AnalyticsHistogram, AnalyticsHeatmap, AnalyticsSunburst } from './analyticsChartComponents.jsx';

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

function FoundationBuilder({ chart, onBackToCatalogue, profileRows, previewRows }) {
  // Stable Explore rows define the available fields; playback rows define
  // the plotted data. Charts I state and the recommendations remain independent.
  const [lineMode, setLineMode] = useState('single');
  const [pieMode, setPieMode] = useState('pie');
  const [contract, setContract] = useState(() => createChartsIIBuilderConfiguration(chart?.key, profileRows));
  const [settings, setSettings] = useState({ aggregation: 'count', topN: 10 });
  // Presentation modes belong to the selected chart, not to the changing
  // row arrays. Chronology updates may refresh data without resetting Donut.
  useEffect(() => {
    setLineMode('single');
    setPieMode('pie');
  }, [chart?.key]);
  useEffect(() => {
    setContract(createChartsIIBuilderConfiguration(chart?.key, profileRows));
    setSettings({ aggregation: 'count', topN: 10 });
  }, [chart?.key, profileRows]);
  const isLiveFamily = ['bar', 'line', 'grouped-bar', 'stacked-bar', 'pie', 'histogram', 'heatmap', 'sunburst'].includes(chart?.key);
  const chartResult = useMemo(() => isLiveFamily
    ? deriveChartsIIBuilderData(contract, previewRows, settings)
    : null, [isLiveFamily, contract, previewRows, settings]);
  const isResultPopulated = chartResult?.status === 'ready' && (() => {
    const result = chartResult.chart;
    if (!result) return false;
    if (result.chartType === 'sunburst') return Number(result.total) > 0 && Array.isArray(result.parents) && result.parents.some(parent => Number(parent.count) > 0 && Array.isArray(parent.children) && parent.children.some(child => Number(child.count) > 0));
    if (result.chartType === 'heatmap') return Array.isArray(result.rows) && result.rows.length > 0 && Array.isArray(result.columns) && result.columns.length > 0 && Array.isArray(result.cells) && result.cells.some(cell => Number(cell.count) > 0);
    if (result.chartType === 'pie') return Array.isArray(result.data) && result.data.some(slice => Number(slice.count) > 0);
    if (result.chartType === 'multiLine') return Array.isArray(result.periods) && result.periods.length > 0 && Array.isArray(result.series) && result.series.length > 0;
    if (result.chartType === 'groupedBar' || result.chartType === 'stackedBar') return Array.isArray(result.data) && result.data.length > 0 && Array.isArray(result.series) && result.series.length > 0;
    return Array.isArray(result.data) && result.data.length > 0;
  })();
  const recordCountMeasure = contract.values?.yField === 'recordCount';
  const fixedAdditive = chart?.key === 'stacked-bar';
  const isHistogram = chart?.key === 'histogram';
  const effectiveAggregation = recordCountMeasure ? 'count' : fixedAdditive ? 'sum' : settings.aggregation === 'count' ? 'sum' : settings.aggregation;
  const inputClass = 'mt-1 w-full min-w-0 rounded-md border border-[#cdb48b] bg-[#fffdf7] px-2 py-2 text-[12px] text-[#24382d]';
  return (
    <div className="flex h-full min-h-0 flex-col overflow-y-auto lg:overflow-hidden">
      <p className="sr-only">Charts II Builder · Bar, Line, Grouped Bar, Stacked Bar, Pie/Donut, Histogram, Heatmap, and Sunburst live previews; export pending</p>
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
                      setContract(createChartsIIBuilderConfiguration(mode === 'multi' ? 'line-multi' : 'line', profileRows));
                    }}>
                    <option value="single">Single line</option>
                    <option value="multi">Multiple lines by category</option>
                  </select>
                </label>
              )}
              {chart?.key === 'pie' && (
                <label className="block text-[12px] font-semibold text-[#344b39]">Display
                  <select className={inputClass} aria-label="Pie or donut display" value={pieMode} onChange={(event) => setPieMode(event.target.value)}>
                    <option value="pie">Pie</option>
                    <option value="donut">Donut</option>
                  </select>
                </label>
              )}
              {contract.slots.map((slot) => slot.optional ? null : (
                <label key={slot.key} className="block text-[12px] font-semibold text-[#344b39]">
                  {slot.label}
                  <select aria-label={slot.label} className={inputClass} value={contract.values[slot.key] || ''}
                    onChange={(event) => setContract(updateChartsIIBuilderConfiguration(contract, slot.key, event.target.value, profileRows))}>
                    {!slot.options.length && <option value="">No usable fields</option>}
                    {slot.options.map(option => <option key={option.key} value={option.key}>{option.label}</option>)}
                  </select>
                </label>
              ))}
              {!contract.additive && !isHistogram && <label className="block text-[12px] font-semibold text-[#344b39]">Aggregation
                <select className={inputClass} value={effectiveAggregation}
                  disabled={recordCountMeasure || fixedAdditive}
                  onChange={(event) => setSettings(old => ({ ...old, aggregation: event.target.value }))}>
                  <option value="count">Count</option><option value="sum">Sum</option><option value="average">Average</option><option value="min">Minimum</option><option value="max">Maximum</option>
                </select>
                {recordCountMeasure && <span className="mt-1 block text-[10px] font-normal text-[#52675a]">Record count uses Count; choose a numeric measure for other aggregations.</span>}
                {fixedAdditive && !recordCountMeasure && <span className="mt-1 block text-[10px] font-normal text-[#52675a]">Stacked values use Sum to preserve additive segment totals.</span>}
              </label>}
              {!isHistogram && <label className="block text-[12px] font-semibold text-[#344b39]">Maximum categories
                <select className={inputClass} value={settings.topN} onChange={(event) => setSettings(old => ({ ...old, topN: Number(event.target.value) }))}>
                  {[5,10,15,20].map(value => <option key={value} value={value}>{value}</option>)}
                </select>
              </label>}
              <p className="text-[11px] leading-relaxed text-[#52675a]">{contract.ready
                ? isLiveFamily
                  ? `${profileRows.length} records in Explore scope · ${previewRows.length} in current playback scope.`
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
            <p className="mt-2 text-sm text-[var(--peridot-color-hex-52675a)]">Palette and presentation controls are pending.</p>
          </details>
        </aside>
        <section className="flex min-h-0 min-w-0 flex-col gap-3" aria-label="Chart preview foundation">
          <div className={`${panel} flex min-h-0 flex-1 flex-col overflow-hidden p-5`}>
            <div className="flex min-w-0 shrink-0 items-start justify-between gap-3">
              <h3 className={`${heading} min-w-0 text-2xl font-semibold text-[var(--peridot-color-hex-173120)]`}>{chart?.name || 'Choose a chart type'}</h3>
              {/* Native details/summary is clickable and keyboard-operable. The
                  interpretation floats over the preview rather than taking
                  height away from the chart. */}
              <details className="group relative z-20 shrink-0">
                <summary aria-label="Peridot's Interpretation" title="Peridot's Interpretation"
                  className="flex h-8 w-8 cursor-pointer list-none items-center justify-center rounded-full border border-[#cdb48b] bg-[#fff9eb] text-[#8b3026] transition hover:border-[#b58b42] hover:bg-[#f5ecd2] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b58b42] [&::-webkit-details-marker]:hidden">
                  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px]">
                    <circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>
                  </svg>
                </summary>
                <div className="absolute right-0 top-full z-30 mt-2 w-[min(21rem,70vw)] rounded-lg border border-[#d9c8a9] bg-[#fffaf0] p-4 text-left shadow-[0_8px_24px_rgba(52,42,27,0.18)]">
                  <h4 className={`${heading} text-[17px] font-semibold text-[#8b3026]`}>Peridot's Interpretation</h4>
                  <p className="mt-2 text-[13px] leading-relaxed text-[#52675a]">Computational scope, field choices, aggregation, and missing-value handling will be described here when a real chart is available.</p>
                </div>
              </details>
            </div>
            {isLiveFamily ? (
              <div className="min-h-0 min-w-0 flex-1 overflow-auto pt-3" aria-label={`Live ${chart.name} chart preview`} aria-live="polite">
                {!contract.ready ? (
                  <div className="flex h-full items-center justify-center p-4 text-center text-sm text-[#52675a]">{contract.problems.join(' ') || 'Choose valid fields to render this chart.'}</div>
                ) : !previewRows.length ? (
                  <div className="flex h-full items-center justify-center p-4 text-center text-sm text-[#52675a]">No records are available in the current playback scope.</div>
                ) : isResultPopulated ? (
                  <div className="h-full min-h-[320px] min-w-0">
                    {chartResult.chart.chartType === 'bar' && <AnalyticsBarChart data={chartResult.chart.data} title={chartResult.chart.title} subtitle={chartResult.chart.subtitle} orientation={chartResult.chart.orientation} />}
                    {chartResult.chart.chartType === 'line' && <AnalyticsLineChart data={chartResult.chart.data} title={chartResult.chart.title} subtitle={chartResult.chart.subtitle} />}
                    {chartResult.chart.chartType === 'multiLine' && <AnalyticsMultiLineChart series={chartResult.chart.series} periods={chartResult.chart.periods} title={chartResult.chart.title} subtitle={chartResult.chart.subtitle} />}
                    {chartResult.chart.chartType === 'groupedBar' && <AnalyticsGroupedBarChart data={chartResult.chart.data} series={chartResult.chart.series} title={chartResult.chart.title} subtitle={chartResult.chart.subtitle} />}
                    {chartResult.chart.chartType === 'stackedBar' && <AnalyticsStackedBarChart data={chartResult.chart.data} series={chartResult.chart.series} title={chartResult.chart.title} subtitle={chartResult.chart.subtitle} />}
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
                Live preview for this chart family is not yet implemented. Bar / Column, Line / Multi-Line, Grouped Bar, Stacked Bar, Pie / Donut, Histogram, Heatmap, and Sunburst are available now.
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

export function PeridotChartsIIFoundation({ selectedChartKey, currentPage, onSelectChart, onNavigatePage, profileRows = [], previewRows = [] }) {
  // Profile is derived from the stable applied Explore scope. Playback changes
  // should not reorder recommendations while a researcher uses the scrubber.
  const profile = useMemo(() => buildChartsIIDataProfile(profileRows), [profileRows]);
  const charts = useMemo(() => assessChartsIISuitability(profile, CHART_FAMILIES), [profile]);
  const chart = charts.find((item) => item.key === selectedChartKey);
  const showingBuilder = currentPage === 'builder';
  return (
    <div className={`min-h-0 flex-1 rounded-xl px-4 pb-4 text-[var(--peridot-color-hex-24382d)] sm:px-5 sm:pb-5 ${showingBuilder ? "overflow-hidden bg-[var(--peridot-color-hex-f8f4e6)] pt-1" : "overflow-auto bg-[#f9f4e9] pt-9"}`}>
      {showingBuilder
        ? <FoundationBuilder chart={chart} profileRows={profileRows} previewRows={previewRows} onBackToCatalogue={() => onNavigatePage('catalogue')} />
        : <FoundationCatalogue onSelectChart={onSelectChart} charts={charts} profile={profile} />}
    </div>
  );
}
