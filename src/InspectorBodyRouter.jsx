/*
 * Inspector selection router.
 * 
 * This component receives a resolved Inspector selection and chooses the correct body view: empty state, cluster, route/edge, person/place/node profile, linked record, or other supported evidence target.
 * 
 * Important relationships:
 * - Selection shapes are constructed in `interactionHelpers.js` and coordinated by `App.jsx`.
 * - Detailed rendering is delegated to `InspectorClusterView`, `InspectorEdgeView`, and `InspectorNodeView`.
 * 
 * Maintenance cautions:
 * - New selection types require updates here and should be tested with Back history in both compact and full Inspector modes.
 */

import React from 'react';

export function InspectorBodyRouter({
  inspectorState,
  letterState,
  viewComponents,
  presentation = 'compact',
}) {
  const {
    selectedProps,
    selectedKind,
    clearSelection,
    viewMode,
    onOpenPersonDetail,
    onOpenPlaceDetail,
    onOpenLetterDetail,
    onOpenRouteDetail,
    onBackInspector,
    onExpandInspector,
  } = inspectorState;

  const {
    linkedLettersToShow,
    selectedLetterMetadata,
    showAllLinkedLetters,
    setShowAllLinkedLetters,
    isLetterSectionExpanded,
    toggleLetterSection,
  } = letterState;

  const {
    InspectorEmptyState,
    InspectorClusterView,
    InspectorNodeView,
    InspectorEdgeView,
    InspectorLetterView,
  } = viewComponents;

  const isCompact = presentation === 'compact';

  const clusterViewProps = {
    selectedProps,
    clearSelection,
    viewMode,
    onOpenPersonDetail,
    onOpenPlaceDetail,
    onOpenLetterDetail,
    onOpenRouteDetail,
    onExpandInspector,
    isCompact,
  };

  const nodeViewProps = {
    selectedProps,
    clearSelection,
    viewMode,
    linkedLettersToShow,
    selectedLetterMetadata,
    showAllLinkedLetters,
    setShowAllLinkedLetters,
    isLetterSectionExpanded,
    toggleLetterSection,
    onOpenPersonDetail,
    onOpenPlaceDetail,
    onOpenLetterDetail,
    onOpenRouteDetail,
    onExpandInspector,
    isCompact,
  };

  const edgeViewProps = {
    selectedProps,
    clearSelection,
    linkedLettersToShow,
    selectedLetterMetadata,
    showAllLinkedLetters,
    setShowAllLinkedLetters,
    isLetterSectionExpanded,
    toggleLetterSection,
    onOpenLetterDetail,
    onOpenRouteDetail,
    onExpandInspector,
    isCompact,
  };

  if (!selectedProps) return <InspectorEmptyState />;
  if (selectedKind === 'cluster') return <InspectorClusterView {...clusterViewProps} />;
  if (selectedKind === 'node' || selectedKind === 'person-detail' || selectedKind === 'place-detail') {
    return <InspectorNodeView {...nodeViewProps} />;
  }
  if (selectedKind === 'edge') return <InspectorEdgeView {...edgeViewProps} />;
  if (selectedKind === 'letter-detail') {
    return (
      <InspectorLetterView
        selectedProps={selectedProps}
        letter={selectedProps?.letter}
        index={selectedProps?.index || 0}
        onBack={onBackInspector}
        onOpenPersonDetail={onOpenPersonDetail}
        onOpenPlaceDetail={onOpenPlaceDetail}
      />
    );
  }
  return null;
}
