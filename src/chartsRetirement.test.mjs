/* R3: protect the retirement boundary without removing shared analytics infrastructure.
 * Source-level checks only; browser acceptance is still required.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = dirname(fileURLToPath(import.meta.url));
const read = name => readFileSync(join(root, name), 'utf8');

test('the legacy Charts I component has been retired', () => {
  assert.equal(existsSync(join(root, 'AnalyticsPanel.jsx')), false);
  for (const file of ['App.jsx', 'PeridotVisualizationsWorkspace.jsx']) {
    assert.doesNotMatch(read(file), /(?:import|require)\s*.*AnalyticsPanel\.jsx/);
  }
});

test('only Charts II is exposed through the Charts destination', () => {
  const workspace = read('PeridotVisualizationsWorkspace.jsx');
  assert.match(workspace, /\{\s*label:\s*'Charts',\s*tool:\s*VISUALIZATION_TOOLS\.CHARTS_II\s*\}/);
  assert.doesNotMatch(workspace, /CHART_WORKSPACE|chartTypeFromToolKey|AnalyticsPanelContent/);
  assert.match(workspace, /<PeridotChartsIIFoundation\b/);
});

test('Charts II retains both stable Explore scope and chronology-scope records', () => {
  const app = read('App.jsx');
  const workspace = read('PeridotVisualizationsWorkspace.jsx');
  assert.match(app, /chartsIIProfileRows:\s*analyticsAvailabilityRows/);
  assert.match(app, /chartsIIPreviewRows:\s*analyticsRows/);
  assert.match(workspace, /profileRows=\{analyticsWorkspaceProps\?\.chartsIIProfileRows/);
  assert.match(workspace, /previewRows=\{analyticsWorkspaceProps\?\.chartsIIPreviewRows/);
});

test('retirement does not remove required shared styling and export boundaries', () => {
  const main = read('main.jsx');
  const workspace = read('PeridotVisualizationsWorkspace.jsx');
  assert.equal(existsSync(join(root, 'AnalyticsPanel.css')), true);
  assert.match(main, /import '\.\/AnalyticsPanel\.css'/);
  assert.equal(existsSync(join(root, 'analyticsDerivationHelpers.js')), true);
  assert.equal(existsSync(join(root, 'analyticsChartComponents.jsx')), true);
  assert.equal(existsSync(join(root, 'exportHelpers.js')), true);
  assert.match(workspace, /selectedTool === VISUALIZATION_TOOLS\.CHARTS_II\s*\?\s*null\s*:\s*exportControls/);
  assert.match(read('PeridotChartsIIFoundation.jsx'), /downloadChartsIIPng/);
});

test('legacy charts-specific state and routing do not persist in App', () => {
  const app = read('App.jsx');
  assert.doesNotMatch(app, /analyticsChartType|analyticsBarGroupBy|analyticsTopN|analyticsChartData|openChartVisualization|onOpenChartVisualization/);
});
