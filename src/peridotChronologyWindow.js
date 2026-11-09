/*
 * Shared Peridot chronology window geometry.
 *
 * All values are continuous proleptic-Gregorian day ordinals. This module is
 * deliberately independent of React, DOM coordinates, playback eligibility,
 * Search scope, temporal precision, and any particular visualization.
 *
 * A calendar position is a navigation coordinate, NOT a claim that an
 * imprecise source assertion happened on that exact day.
 */

export function civilDay(year, month = 1, day = 1) {
  if (![year, month, day].every(Number.isInteger)) throw new TypeError('Gregorian date parts must be integers');
  if (month < 1 || month > 12) throw new RangeError('Gregorian month outside 1–12');
  const y = year - (month <= 2 ? 1 : 0);
  const era = Math.floor(y / 400);
  const yoe = y - era * 400;
  const mp = month + (month > 2 ? -3 : 9);
  return era * 146097 + yoe * 365 + Math.floor(yoe / 4)
    - Math.floor(yoe / 100) + Math.floor((153 * mp + 2) / 5) + day - 1;
}

// Retain Timeline II's established inverse rather than using JS Date, UTC,
// or the host timezone. Input may be fractional; display resolves to a day.
export function civilFromDay(ordinalDay) {
  if (!Number.isFinite(ordinalDay)) throw new TypeError('Day ordinal must be finite');
  const dayOrdinal = Math.floor(ordinalDay);
  let year = Math.floor(dayOrdinal / 365.2425);
  while (civilDay(year + 1) <= dayOrdinal) year++;
  while (civilDay(year) > dayOrdinal) year--;
  let month = 1;
  while (month < 12 && civilDay(year, month + 1) <= dayOrdinal) month++;
  return {year, month, day: Math.floor(dayOrdinal - civilDay(year, month)) + 1};
}

export function clampChronologyValue(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

// Domain derives ONLY from source-supported endpoints supplied by its caller.
// The caller decides which canonical assertions are positionable and which
// dataset (unfiltered) establishes the domain.
export function createChronologyDomain(sourceMin, sourceMax, {paddingFraction = 0.1, minimumSpanDays = 7} = {}) {
  if (![sourceMin, sourceMax, paddingFraction, minimumSpanDays].every(Number.isFinite)
    || sourceMax < sourceMin || paddingFraction < 0 || minimumSpanDays <= 0) {
    throw new RangeError('Invalid chronology source domain');
  }
  const sourceSpan = sourceMax - sourceMin;
  const span = Math.max(minimumSpanDays, sourceSpan * (1 + paddingFraction * 2));
  const center = (sourceMin + sourceMax) / 2;
  return {sourceMin, sourceMax, sourceSpan, min:center-span/2, max:center+span/2, span, center};
}

// Keeps window size within the full padded domain, then constrains its center.
export function clampChronologyWindow(start, end, domain, {minimumSpanDays = 7} = {}) {
  if (![start, end, domain?.min, domain?.max].every(Number.isFinite)) throw new RangeError('Invalid chronology window');
  const span = clampChronologyValue(end - start, Math.min(minimumSpanDays, domain.span), domain.span);
  const lower = clampChronologyValue(start, domain.min, domain.max - span);
  return {start:lower, end:lower+span, span, center:lower+span/2};
}

export function chronologyPosition(day, start, end, pixelStart, pixelLength) {
  if (end <= start || pixelLength <= 0) return pixelStart;
  return pixelStart + (day - start)/(end - start) * pixelLength;
}

export function chronologyDayAtPosition(pixel, start, end, pixelStart, pixelLength) {
  if (pixelLength <= 0 || end <= start) return start;
  return start + (pixel - pixelStart)/pixelLength * (end - start);
}

// The shared chronology navigator uses ONE tick policy, regardless of which
// visualization supplies the window. A deliberately denser sequence of minor
// strokes is allowed; collisions suppress labels, not date coordinates.
export function chronologyOverviewTicks(min, max, pixelLength, {horizontal = true} = {}) {
  if (![min,max,pixelLength].every(Number.isFinite) || max <= min || pixelLength <= 0) return [];
  const span=max-min;
  const rawStep=span/Math.max(1,pixelLength/23);
  const steps=[1,2,5,10,20,50,100,200,500,1000,2000,5000,10000,20000,50000];
  const step=steps.find(value=>value*365.2425>=rawStep)||50000;
  const firstYear=Math.ceil(civilFromDay(Math.floor(min)).year/step)*step;
  const lastYear=civilFromDay(Math.ceil(max)).year;
  const result=[];
  let lastLabelEnd=-Infinity;
  for(let year=firstYear;year<=lastYear && result.length<240;year+=step){
    const day=civilDay(year);
    if(day<min||day>max)continue;
    const pixel=(day-min)/span*pixelLength;
    const label=String(year);
    const gap=horizontal?label.length*7+14:24;
    const showLabel=pixel-gap/2>=lastLabelEnd+9&&pixel+gap/2<=pixelLength;
    if(showLabel)lastLabelEnd=pixel+gap/2;
    result.push({day,label:showLabel?label:'',major:showLabel});
  }
  return result;
}

// Domain endpoint reader for the complete mapped Timeline event collection.
// It mirrors Timeline II's plotting anchors (not its broader playback
// uncertainty bounds), so the same source evidence yields the same ruler.
export function chronologySourceBoundsFromEvents(events) {
  let min=Infinity,max=-Infinity;
  for(const event of Array.isArray(events)?events:[]){
    const endpoint=side=>{
      const ep=event?.temporalPresentationContract?.[side]||event?.assertion?.[side];
      if(ep&&Number.isInteger(ep.year))return ep;
      const raw=side==='start'?(event?.windowStart??event?.playbackSortKey):event?.windowEnd;
      const match=String(raw??'').match(/^(-?\d{1,6})[-/](\d\d)[-/](\d\d)/);
      if(!match)return null;
      const year=Number(match[1]),month=Number(match[2]),day=Number(match[3]);
      return {year,month:month>=1&&month<=12?month:null,day:day>=1&&day<=31?day:null};
    };
    const ord=ep=>ep&&Number.isInteger(ep.year)?civilDay(ep.year,ep.month||1,ep.day||1):null;
    const a=ord(endpoint('start'))??ord(endpoint('end'));
    if(a===null)continue;
    const b=ord(endpoint('end'))??a;
    const period=event?.temporalPresentationContract?.kind==='period'||['interval','openInterval'].includes(event?.temporalKind);
    min=Math.min(min,a,b);
    max=Math.max(max,period?Math.max(a,b):a);
  }
  return Number.isFinite(min)&&Number.isFinite(max)?{min,max}:null;
}


// Convert continuous selected calendar bounds to inclusive day-precision sort
// keys consumed by canonical temporal assertions. Do not round a user's start
// backward or their end forward, which would admit out-of-window evidence.
// Missing whole calendar days indicate a genuinely empty range.
export function chronologyWindowSortBounds(startDay, endDay) {
  if (!Number.isFinite(startDay) || !Number.isFinite(endDay) || endDay < startDay) return null;
  const first = Math.ceil(startDay);
  const last = Math.floor(endDay);
  if (last < first) return null;
  const toKey = ordinal => {
    const {year,month,day} = civilFromDay(ordinal);
    return year * 10000 + month * 100 + day;
  };
  return {start:toKey(first), end:toKey(last)};
}

// Use the complete mapped assertion-level playback entries, not the event
// plotting subset, to derive the authoritative dataset's chronological extent.
// Canonical sortBounds already reflect temporal precision and period endpoints.
export function chronologySourceBoundsFromEntries(entries) {
  let min = Infinity, max = -Infinity;
  const keyToDay = key => {
    if (!Number.isFinite(key)) return null;
    const value = Math.trunc(key);
    const year = Math.trunc(value / 10000);
    const month = Math.trunc(Math.abs(value) % 10000 / 100);
    const day = Math.abs(value) % 100;
    if (!Number.isInteger(year) || month < 1 || month > 12 || day < 1 || day > 31) return null;
    return civilDay(year, month, day);
  };
  for (const entry of Array.isArray(entries) ? entries : []) {
    const first = keyToDay(entry?.windowStart) ?? keyToDay(entry?.windowEnd);
    const last = keyToDay(entry?.windowEnd) ?? first;
    if (first === null || last === null) continue;
    min = Math.min(min, first, last);
    max = Math.max(max, first, last);
  }
  return Number.isFinite(min) && Number.isFinite(max) ? {min,max} : null;
}
