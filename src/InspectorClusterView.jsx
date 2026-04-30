import React from 'react';

export function InspectorClusterView({
  InspectorSummaryCardComponent,
  InspectorClearSelectionButtonComponent,
 selectedProps, clearSelection }) {
  return (
    <div className="space-y-4">
      <InspectorSummaryCardComponent>
        <DetailRow label="Cluster" value={selectedProps.label} />
        <DetailRow label="Places represented" value={selectedProps.placeCount} />
        <DetailRow label="Members" value={selectedProps.memberLabelPreview.join('; ')} />
      </InspectorSummaryCardComponent>
      <InspectorClearSelectionButtonComponent onClear={clearSelection} />
    </div>
  );
}
