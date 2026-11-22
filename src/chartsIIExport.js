/* Charts II PNG export. Captures the currently rendered, configured SVG,
 * never the Builder's controls or another visualization. */
import { civilFromDay } from './peridotChronologyWindow.js';
import { renderSvgElementToPngBlob, slugifyFilenamePart, makeDownloadUrl, revokeObjectUrl } from './exportHelpers.js';

export function formatChartsIIChronologyDay(day) {
  if (!Number.isFinite(day)) return null;
  const { year, month, day: date } = civilFromDay(day);
  const yearText = year <= 0 ? `${1 - year} BCE` : String(year).padStart(4, '0');
  return `${yearText}-${String(month).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
}

export function buildChartsIIPngDescriptor({ family, chartTitle, scopeCount, exploreCount, chronologyRange, chronologyEnabled = false, dateAxis = false, includeProvenance = true, includeFootnotes = false, footnotes = '', localFilterCount = 0, excludedByLocalFilters = 0 } = {}) {
  const familyName = String(family || 'Chart').trim();
  const first = formatChartsIIChronologyDay(chronologyRange?.start);
  const last = formatChartsIIChronologyDay(chronologyRange?.end);
  const footerLines = [];
  if (includeProvenance) {
    footerLines.push(`Peridot Charts II | ${familyName}`);
    footerLines.push(`Chart input: ${Number.isFinite(scopeCount) ? scopeCount.toLocaleString('en-US') : 'unknown'} records | Explore scope: ${Number.isFinite(exploreCount) ? exploreCount.toLocaleString('en-US') : 'unknown'} records`);
    if (localFilterCount > 0) footerLines.push(`Chart-local filters: ${localFilterCount} active | ${Math.max(0, excludedByLocalFilters)} records excluded from current chart scope`);
    if (chronologyEnabled && first && last) {
      footerLines.push(`${dateAxis ? 'Visible date-axis range' : 'Selected chronology window'}: ${first} to ${last} (Gregorian)`);
    } else {
      footerLines.push('Chronology: not active for this chart');
    }
  }
  if (includeFootnotes) {
    footerLines.push(...wrapChartsIIFootnotes(footnotes));
  }
  return {
    filename: `peridot-charts-ii-${slugifyFilenamePart(familyName, 'chart')}-${slugifyFilenamePart(chartTitle || 'visualization', 'visualization')}.png`,
    footerLines,
  };
}


// Preserve researcher-authored notes; wrap long lines to stay within the export frame.
export function wrapChartsIIFootnotes(notes, maxLength = 94) {
  const result = [];
  for (const rawLine of String(notes || '').split(/\r?\n/)) {
    const words = rawLine.trim().split(/\s+/).filter(Boolean);
    if (!words.length) continue;
    let line = '';
    for (const word of words) {
      if (line && (line.length + 1 + word.length) > maxLength) {
        result.push(line); line = '';
      }
      // Hard-wrap unusually long uninterrupted strings as well.
      let part = word;
      while (part.length > maxLength) {
        if (line) { result.push(line); line = ''; }
        result.push(part.slice(0, maxLength));
        part = part.slice(maxLength);
      }
      line = line ? `${line} ${part}` : part;
    }
    if (line) result.push(line);
  }
  return result.slice(0, 16);
}

// Chart-only export composition: white page, consistently available typeface,
// and physical space for rotated axis labels. Never mutate the live SVG.
export const CHARTS_II_EXPORT_FONT = 'Georgia, Palatino, serif';
export const CHARTS_II_EXPORT_BACKGROUND = '#ffffff';

export function chartsIIExportLayout({ width, height, hasRotatedLabels = false, xAxisLabel = '', yAxisLabel = '', footerLines = [] } = {}) {
  const left = yAxisLabel ? 80 : 24;
  const right = 24;
  const top = 16;
  const bottom = (hasRotatedLabels ? 112 : 34) + (xAxisLabel ? 42 : 0);
  // Footer bands are internal to the export so they cannot inherit shared
  // map/network export type treatments or paint over the labels.
  const footer = footerLines.length ? 26 + footerLines.length * 25 + 18 : 0;
  return { left, right, top, bottom, footer,
    width: width + left + right, height: height + top + bottom + footer };
}

export function createChartsIIAnnotatedSvg(svgElement, options = {}) {
  const ns = 'http://www.w3.org/2000/svg';
  const source = svgElement.cloneNode(true);
  const viewBox = svgElement.viewBox?.baseVal;
  const width = Math.max(1, viewBox?.width || svgElement.clientWidth || 1100);
  const height = Math.max(1, viewBox?.height || svgElement.clientHeight || 760);
  const xText = options.includeXAxis ? String(options.xAxisLabel || '').trim() : '';
  const yText = options.includeYAxis ? String(options.yAxisLabel || '').trim() : '';
  const footers = Array.isArray(options.footerLines) ? options.footerLines : [];
  const hasRotatedLabels = Boolean(source.querySelector('text[transform*="rotate"]'));
  const layout = chartsIIExportLayout({ width, height, hasRotatedLabels, xAxisLabel: xText, yAxisLabel: yText, footerLines: footers });
  const outer = document.createElementNS(ns, 'svg');
  outer.setAttribute('xmlns', ns);
  outer.setAttribute('viewBox', `0 0 ${layout.width} ${layout.height}`);
  outer.setAttribute('width', String(layout.width));
  outer.setAttribute('height', String(layout.height));

  const white = document.createElementNS(ns, 'rect');
  white.setAttribute('width', String(layout.width));
  white.setAttribute('height', String(layout.height));
  white.setAttribute('fill', CHARTS_II_EXPORT_BACKGROUND);
  outer.appendChild(white);

  const headingNodes = Array.from(source.children).filter(node => node.tagName?.toLowerCase() === 'text');
  if (headingNodes[0]) {
    headingNodes[0].textContent = options.includeTitle === false ? '' : String(options.title || options.sourceTitle || '');
  }
  // The autogenerated subtitle is deliberately never exported. It is a
  // Builder interpretation hint, not a researcher-authored figure caption.
  if (headingNodes[1]) headingNodes[1].remove();

  // Replace the chart's full-frame parchment rectangle, but preserve the
  // color encoding of actual marks and the legend's muted panels.
  const frame = Array.from(source.children).find(node => node.tagName?.toLowerCase() === 'rect');
  if (frame) frame.setAttribute('fill', CHARTS_II_EXPORT_BACKGROUND);

  // Lift the original SVG's children into a group rather than inserting a
  // nested SVG. A nested viewport clips rotated tick labels at its old height.
  const chartGroup = document.createElementNS(ns, 'g');
  chartGroup.setAttribute('transform', `translate(${layout.left} ${layout.top})`);
  while (source.firstChild) chartGroup.appendChild(source.firstChild);
  outer.appendChild(chartGroup);

  // Apply the same installed serif fallback to every exported label, mark,
  // heading, and legend value; do not depend on external font downloads.
  for (const node of chartGroup.querySelectorAll('text, tspan')) {
    node.setAttribute('font-family', CHARTS_II_EXPORT_FONT);
    // Remove CSS-backed font declarations that would override the attribute.
    if (node.style?.fontFamily) node.style.fontFamily = CHARTS_II_EXPORT_FONT;
  }
  const addText = (value, x, y, opts = {}) => {
    const node = document.createElementNS(ns, 'text');
    node.setAttribute('x', String(x)); node.setAttribute('y', String(y));
    node.setAttribute('font-size', String(opts.size || 17));
    node.setAttribute('font-weight', String(opts.weight || 600));
    node.setAttribute('font-family', CHARTS_II_EXPORT_FONT);
    node.setAttribute('fill', '#263b35');
    node.setAttribute('text-anchor', opts.anchor || 'middle');
    if (opts.rotate) node.setAttribute('transform', `rotate(-90 ${x} ${y})`);
    node.textContent = value;
    outer.appendChild(node);
  };
  if (xText) addText(xText, layout.left + width / 2,
    layout.top + height + (hasRotatedLabels ? 88 : 23));
  if (yText) addText(yText, 28, layout.top + height / 2, { rotate: true });
  if (footers.length) {
    const firstY = layout.top + height + layout.bottom + 25;
    footers.forEach((line, index) => {
      addText(String(line), layout.left, firstY + index * 25,
        { size: 16, weight: 400, anchor: 'start' });
    });
  }
  return outer;
}

export async function downloadChartsIIPng(svgElement, descriptor, options = {}) {
  if (!svgElement || svgElement.tagName?.toLowerCase() !== 'svg') {
    throw new Error('No live Charts II SVG is available to export.');
  }
  const annotated = createChartsIIAnnotatedSvg(svgElement, { ...options, footerLines: descriptor.footerLines });
  const blob = await renderSvgElementToPngBlob(annotated, { backgroundColor: CHARTS_II_EXPORT_BACKGROUND });
  const url = makeDownloadUrl(blob);
  try {
    const link = document.createElement('a');
    link.href = url;
    link.download = descriptor.filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
  } finally {
    // Defer revocation to the next task so the browser can begin the download.
    setTimeout(() => revokeObjectUrl(url), 1000);
  }
}
