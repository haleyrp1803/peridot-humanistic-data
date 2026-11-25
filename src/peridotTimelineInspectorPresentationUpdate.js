/** Refresh an existing Timeline Inspector selection after category configuration edits.
 * Never create a new selection or change the Inspector's visibility/history.
 * Both an exact event id and a supporting row are required.
 */
export function refreshSelectedTimelinePresentation(selection, event) {
  if (selection?.kind !== 'timeline-event' || !event?.row) return selection;
  if (String(selection.event?.id ?? '') !== String(event.id ?? '')) return selection;
  return { ...selection, event, row: event.row };
}
