import test from 'node:test';
import assert from 'node:assert/strict';
import { buildChartsIIPngDescriptor, formatChartsIIChronologyDay } from './chartsIIExport.js';
import { civilDay } from './peridotChronologyWindow.js';

test('metadata names active chronology, both scopes, and chart family', () => {
  const result = buildChartsIIPngDescriptor({ family: 'Line / Multi-Line', chartTitle: 'Trends by Month', scopeCount: 380, exploreCount: 500,
    chronologyEnabled: true, chronologyRange: {start: civilDay(1711, 9, 1), end: civilDay(1712, 1, 1)} });
  assert.match(result.filename, /line-multi-line/);
  assert.match(result.footerLines[1], /380 records.*500 records/);
  assert.match(result.footerLines[2], /1711-09-01 to 1712-01-01/);
});

test('date x-axis is described as viewport, not an exclusion filter', () => {
  const result = buildChartsIIPngDescriptor({ family: 'Scatter / Bubble', scopeCount: 300, exploreCount: 300,
    dateAxis: true, chronologyEnabled: true, chronologyRange: {start: civilDay(1715), end: civilDay(1716)} });
  assert.match(result.footerLines[2], /Visible date-axis range/);
});

test('inactive chronology is not falsely described as a filter', () => {
  const result = buildChartsIIPngDescriptor({ family: 'Box Plot', scopeCount: 20, exploreCount: 20, chronologyEnabled: false });
  assert.match(result.footerLines[2], /not active/);
});

test('canonical dates do not use local timezone or JS Date', () => {
  assert.equal(formatChartsIIChronologyDay(civilDay(1609, 12, 31)), '1609-12-31');
  assert.equal(formatChartsIIChronologyDay(null), null);
});

// Export notes and provenance are independently optional.
test('custom notes can be exported without Peridot footer', () => {
  const result = buildChartsIIPngDescriptor({ family: 'Heatmap', includeProvenance: false, includeFootnotes: true, footnotes: 'Sources: archival ledger\nTranscription caveats apply.' });
  assert.deepEqual(result.footerLines, ['Sources: archival ledger', 'Transcription caveats apply.']);
});
test('export can contain no footer at all', () => {
  assert.deepEqual(buildChartsIIPngDescriptor({ includeProvenance: false, includeFootnotes: false }).footerLines, []);
});

// B4.2.2: chart-only white export and layout reservation.
import { chartsIIExportLayout, CHARTS_II_EXPORT_FONT, CHARTS_II_EXPORT_BACKGROUND } from './chartsIIExport.js';
test('export uses white canvas and one consistent available typeface', () => {
  assert.equal(CHARTS_II_EXPORT_BACKGROUND, '#ffffff');
  assert.match(CHARTS_II_EXPORT_FONT, /^Georgia/);
});
test('rotated tick labels and custom axes reserve independent space', () => {
  const basic = chartsIIExportLayout({width: 950, height: 428});
  const detailed = chartsIIExportLayout({width: 950, height: 428, hasRotatedLabels: true, xAxisLabel: 'Sender', yAxisLabel: 'Records', footerLines: ['Sources: archive']});
  assert.ok(detailed.height > basic.height + 100);
  assert.ok(detailed.width > basic.width);
  assert.ok(detailed.bottom >= 154);
});
