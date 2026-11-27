/*
 * Research-trail presentation only: never change history identities or infer
 * relationships between successive selections. Always prefer mapped names to
 * opaque internal IDs; keep the latter on the underlying selection payload.
 */
const clean = (value) => typeof value === 'string' ? value.trim() : '';
const first = (...values) => values.map(clean).find(Boolean) || '';
const opaque = (value) => /^(?:geo-anchor:|cluster-geo-anchor:|peridot-entity:|timeline-event:|chart-mark:|node:|edge:|letter-detail:|peridot-record:|peridot_record:)/i.test(value);
const readable = (...values) => values.map(clean).find((value) => value && !opaque(value)) || '';
const shortRecord = (value) => {
  const label = clean(value);
  if (!label) return '';
  if (/^letter-detail:/i.test(label)) return readable(label.slice('letter-detail:'.length).replace(/:\d+$/, ''));
  if (/^peridot[_-]record[_:-]/i.test(label)) return label.replace(/^peridot[_-]record[_:-]/i, 'Record ');
  return opaque(label) ? '' : label;
};

export function getPeridotResearchTrailLabel(item) {
  if (!item) return 'Selection';
  const kind = first(item.kind, item.__kind);
  const name = readable(item.detailLabel, item.name, item.label, item.entityLabel);
  const endpointA = readable(item.sourceLabel, item.source?.label);
  const endpointB = readable(item.targetLabel, item.target?.label);
  const record = shortRecord(first(item.letter?.uniqueId, item.letter?.recordId, item.letter?.id, item.label, item.id));
  if (kind === 'person-detail') return `Person: ${readable(item.name, item.detailLabel, item.label) || 'Selected person'}`;
  if (kind === 'place-detail') return `Place: ${readable(item.label, item.name, item.detailLabel) || 'Selected place'}`;
  if (kind === 'letter-detail') return record ? (/^Record /i.test(record) ? record : `Record: ${record}`) : 'Source record';
  if (kind === 'edge') return endpointA && endpointB ? `Connection: ${endpointA} ${item.direction === 'directed' ? '→' : '—'} ${endpointB}` : (name ? `Connection: ${name}` : 'Selected connection');
  if (kind === 'cluster') {
    const location = readable(item.anchorLabel, item.placeLabel, item.locationLabel);
    const members = Number(item.memberCount ?? item.clusterSize);
    return location ? `Cluster: ${location}` : Number.isFinite(members) && members > 0 ? `Cluster: ${members} items` : 'Map cluster';
  }
  if (kind === 'node') {
    const label = readable(item.label, item.detailLabel, item.name);
    const place = readable(item.anchorLabel);
    return label ? (place ? `${label} · ${place}` : label) : (place ? `Map: ${place}` : 'Map/Network node');
  }
  if (kind === 'timeline-event') {
    const title = readable(item.event?.subjectLabel, item.event?.temporalRole, item.row?.title, item.detailLabel, item.label);
    return title ? `Timeline: ${title}` : 'Timeline event';
  }
  if (kind === 'chart-mark') return name ? `Chart: ${name}` : 'Chart mark';
  return name || (record ? `Record: ${record}` : 'Selected object');
}
