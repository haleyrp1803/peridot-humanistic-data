/*
 * Visible edge hit-test coordinates for Map and Network.
 *
 * Renderer curves are in map/force-layout coordinates. The screen-space hit
 * test must use the same viewport translation, scale, and wrapped-world copy
 * as the clipped SVG segment. Only edges with visible clipped paths are
 * candidates; the returned original edge identity/provenance stays intact.
 */
export function projectVisibleEdgeHitCandidates(visiblePaths, view, worldWidth) {
  if (!Array.isArray(visiblePaths) || !view || !Number.isFinite(view.scale) || view.scale <= 0) return [];
  const scale = view.scale;
  return visiblePaths.flatMap(({ edge, copy }) => {
    const curve = edge?.curve;
    if (!curve) return [];
    const tx = view.tx + copy * worldWidth * scale;
    const ty = view.ty;
    const screenCurve = {
      ax: curve.ax * scale + tx,
      ay: curve.ay * scale + ty,
      cx: curve.cx * scale + tx,
      cy: curve.cy * scale + ty,
      bx: curve.bx * scale + tx,
      by: curve.by * scale + ty,
    };
    if (!Object.values(screenCurve).every(Number.isFinite)) return [];
    return [{ ...edge, curve: screenCurve }];
  });
}
