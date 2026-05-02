import React from 'react';

export function InspectorBodyRouter({
  inspectorState,
  letterState,
  viewComponents,
}) {
  const {
    selectedProps,
    selectedKind,
    clearSelection,
    viewMode,
    onOpenPersonDetail,
    onOpenPlaceDetail,
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
  } = viewComponents;

  const clusterViewProps = {
    selectedProps,
    clearSelection,
    viewMode,
    onOpenPersonDetail,
    onOpenPlaceDetail,
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
  };

  if (!selectedProps) return <InspectorEmptyState />;
  if (selectedKind === 'cluster') return <InspectorClusterView {...clusterViewProps} />;
  if (selectedKind === 'node' || selectedKind === 'person-detail' || selectedKind === 'place-detail') {
    return <InspectorNodeView {...nodeViewProps} />;
  }
  if (selectedKind === 'edge') return <InspectorEdgeView {...edgeViewProps} />;
  return null;
}
