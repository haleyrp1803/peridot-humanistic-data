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

  const isCompact = presentation === 'compact';

  const clusterViewProps = {
    selectedProps,
    clearSelection,
    viewMode,
    onOpenPersonDetail,
    onOpenPlaceDetail,
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
    isCompact,
  };

  if (!selectedProps) return <InspectorEmptyState />;
  if (selectedKind === 'cluster') return <InspectorClusterView {...clusterViewProps} />;
  if (selectedKind === 'node' || selectedKind === 'person-detail' || selectedKind === 'place-detail') {
    return <InspectorNodeView {...nodeViewProps} />;
  }
  if (selectedKind === 'edge') return <InspectorEdgeView {...edgeViewProps} />;
  return null;
}
