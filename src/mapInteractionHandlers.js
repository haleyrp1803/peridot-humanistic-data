/*
 * Event-handler factory for the SVG map/network stage.
 * 
 * This file centralizes hover/click behavior so rendered map-stage elements do not each need to know how to resolve selections or update application state. It delegates semantic selection construction to `interactionHelpers.js`.
 * 
 * Maintenance cautions:
 * - Keep event-handling thin here. Complex selection semantics belong in `interactionHelpers.js`.
 * - Test dense-map hover, node click, edge click, cluster click, blank-map click, and Inspector auto-open when editing this file.
 */

export function buildMapInteractionHandlers({
  clearSelection,
  setHoverCard,
  setHoveredEdgeId,
  setSelectedSelection,
  setShowAllLinkedLetters,
  setShowRightSidebar,
  buildHoverCardState,
  buildNodeHoverSummary,
  viewMode,
}) {
  const handleBlankMapClick = () => {
    setHoverCard(null);
    setHoveredEdgeId('');
    clearSelection();
  };

  const handleEdgeClick = (edge, point) => {
    setShowRightSidebar(true);
    setSelectedSelection({ kind: 'edge', id: edge.id });
    setShowAllLinkedLetters(false);
    setHoverCard(
      buildHoverCardState(
        `${edge.sourceLabel} → ${edge.targetLabel}`,
        `Weight: ${edge.count}`,
        point
      )
    );
  };

  const handleNodeHover = (node, point) => {
    setHoverCard(
      buildHoverCardState(node.label, buildNodeHoverSummary(node, viewMode), point)
    );
  };

  const handleNodeClick = (node, point) => {
    setShowRightSidebar(true);
    setHoverCard(
      buildHoverCardState(node.label, buildNodeHoverSummary(node, viewMode), point)
    );
    setSelectedSelection({
      kind: node.isCluster ? 'cluster' : 'node',
      id: node.id,
      clusterNode: node.isCluster ? node : null,
    });
    setShowAllLinkedLetters(false);
  };

  return {
    handleBlankMapClick,
    handleEdgeClick,
    handleNodeHover,
    handleNodeClick,
  };
}
