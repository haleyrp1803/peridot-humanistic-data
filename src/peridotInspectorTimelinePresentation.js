/* Timeline Inspector presentation: read-only explanation of canonical temporal evidence.
 * Calendar, partial-date bounds and category values are not inferred or normalized.
 * Possible point-date windows are NOT asserted periods or historical duration.
 */
const text = value => String(value ?? '').trim();
const asArray = value => Array.isArray(value) ? value : [];

export function describePeridotTimelineMark(event = {}) {
  const presentation = event.temporalPresentationContract || {};
  const isPeriod = presentation.kind === 'period'
    || ['interval', 'openInterval'].includes(event.temporalKind);
  const isOpen = Boolean(presentation.openStart || presentation.openEnd)
    || event.temporalKind === 'openInterval';
  const role = text(event.temporalRole) || 'Mapped time';
  const subject = text(event.subject?.label);
  const subjectLabel = subject && subject !== 'Record' ? subject : '';
  const display = text(event.displayLabel || presentation.display || event.sourceText) || 'Date unspecified';
  const source = text(event.sourceText || presentation.sourceText);
  const shape = text(presentation.shape || event.temporalShape);
  const precision = text(presentation.precision || event.precision);
  const qualifier = text(presentation.qualifier || event.qualifier);
  const boundedness = text(presentation.boundedness || event.boundedness);
  const certainty = text(presentation.certainty);
  let status = 'Exact / bounded';
  if (shape === 'inconsistent' || text(presentation.consistency || event.consistency) === 'backwards') status = 'Inconsistent range';
  else if (isOpen) status = boundedness === 'openStart' ? 'Open start' : boundedness === 'ongoing' ? 'Ongoing' : 'Open end';
  else if (presentation.approximate || /approximate/i.test(shape) || ['circa', 'uncertain'].includes(qualifier)) status = 'Approximate / uncertain';
  else if (/partial/i.test(shape) || precision === 'partial' || precision === 'month' || precision === 'year') status = 'Partial date';
  if (text(presentation.parsingStatus || event.parsingStatus) === 'unrecognized') status = 'Unrecognized date';
  const markKind = isPeriod ? 'period' : 'point';
  const explanation = isPeriod
    ? `The Timeline draws this ${isOpen ? 'open ' : ''}period from the mapped ${role} assertion${subjectLabel ? ` about ${subjectLabel}` : ''}. Its boundaries and uncertainty follow the mapped date evidence; the display does not establish more precise dates than the source supplies.`
    : `The Timeline positions this point from the mapped ${role} assertion${subjectLabel ? ` about ${subjectLabel}` : ''}. Date precision and uncertainty determine how that position should be interpreted; a possible date window is not an asserted duration.`;
  const details = [
    { label: 'Mapped temporal role', value: role },
    { label: isPeriod ? 'Asserted period' : 'Date represented', value: display },
    ...(subjectLabel ? [{ label: 'Mapped subject', value: subjectLabel }] : []),
    { label: 'Temporal form', value: isPeriod ? (isOpen ? 'Open period' : 'Period') : 'Point event' },
    { label: 'Date status', value: status },
    ...(precision ? [{ label: 'Precision', value: precision }] : []),
  ];
  const detailFields = [
    ...(source && source !== display ? [{ label: 'Original source date', value: source }] : []),
    ...(qualifier && qualifier !== 'unknown' ? [{ label: 'Qualifier', value: qualifier }] : []),
    ...(certainty && certainty !== 'not-specified' ? [{ label: 'Certainty', value: certainty }] : []),
    ...(boundedness && isPeriod ? [{ label: 'Boundary status', value: boundedness }] : []),
    ...(presentation.parseWarnings?.length ? [{ label: 'Date interpretation warnings', value: presentation.parseWarnings.join('; ') }] : []),
  ];
  return { markKind, role, subjectLabel, display, source, status, isOpen, details, detailFields, explanation,
    supportingRecords: event.row ? [event.row] : [],
    categories: asArray(event.categoryMemberships).filter(item => text(item?.value)),
  };
}
