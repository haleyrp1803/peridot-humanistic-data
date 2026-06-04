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
