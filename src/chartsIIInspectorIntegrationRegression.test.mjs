import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const builder = readFileSync(new URL('./PeridotChartsIIFoundation.jsx', import.meta.url), 'utf8');
const renderer = readFileSync(new URL('./analyticsChartComponents.jsx', import.meta.url), 'utf8');
const app = readFileSync(new URL('./App.jsx', import.meta.url), 'utf8');

const families = [
  'AnalyticsBarChart', 'AnalyticsPieChart', 'AnalyticsGroupedBarChart', 'AnalyticsStackedBarChart',
  'AnalyticsLineChart', 'AnalyticsMultiLineChart', 'AnalyticsAreaChart', 'AnalyticsStackedAreaChart',
  'AnalyticsScatterChart', 'AnalyticsHistogram', 'AnalyticsHeatmap',
  'AnalyticsBoxPlotChart', 'AnalyticsDotPlotChart', 'AnalyticsSlopeChart',
  'AnalyticsTreemapChart', 'AnalyticsSunburst',
];

test('all Charts II renderer families retain the shared Inspector selection handler',()=>{
  for (const family of families) {
    assert.match(builder, new RegExp(`<${family}\\b[^>]*onSelectMark=\\{inspectCalculatedMark\\}`), family);
    assert.match(renderer, new RegExp(`export function ${family}\\s*\\(`), family);
  }
});
test('chart-selection navigation clears mark state when leaving the viewer',()=>{
  assert.match(app, /const handleExitChartsIIViewer\s*=\s*\(\)\s*=>/);
  assert.match(app, /setInspectorPresentationMode\(INSPECTOR_PRESENTATION_MODES\.CLOSED\)/);
  assert.match(app, /const invalidateChartsIIMarkSelection\s*=\s*useCallback/);
});
test('specialized hierarchy inspection keeps normal Treemap drill-down available',()=>{
  assert.match(renderer,/event\.shiftKey\s*&&\s*onSelectMark/);
  assert.match(renderer,/activate\(event, parent\)/);
});
test('contributing-record display remains searchable and incremental',()=>{
  const view = readFileSync(new URL('./InspectorChartMarkView.jsx', import.meta.url), 'utf8');
  assert.match(view, /filterPeridotChartContributions/);
  assert.match(view, /nextPeridotChartContributionLimit/);
  assert.match(view, /getPeridotChartContributingRecordLabel/);
  assert.doesNotMatch(view, /\.slice\(0,\s*25\)/);
});
