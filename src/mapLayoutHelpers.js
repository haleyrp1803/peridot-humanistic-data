/*
 * Pure geometry and map-layout helpers.
 * 
 * This module handles viewport defaults, quadratic edge hit geometry, volume-aware clustering, cluster radius calculation, and label visibility decisions. It is deliberately UI-agnostic so map layout behavior can be tested or reasoned about separately from React rendering.
 * 
 * Important relationships:
 * - `App.jsx` uses these helpers to derive visible nodes/clusters and map geometry.
 * - `mapInteractionHandlers.js` and `interactionHelpers.js` rely on the same geometric assumptions for hover/click resolution.
 * 
 * Maintenance cautions:
 * - Map viewport, clustering, and hit-testing are fragile together. Test zoomed-in and zoomed-out maps after changing any geometry helper.
 */

export function parseQuadraticPath(path) {
  const values = String(path || '').match(/-?\d*\.?\d+/g)?.map(Number) || [];

  if (values.length < 6) return null;

  return {
    ax: values[0],
    ay: values[1],
    cx: values[2],
    cy: values[3],
    bx: values[4],
    by: values[5],
  };
}

function pointToSegmentDistance(px, py, ax, ay, bx, by) {
  const dx = bx - ax;
  const dy = by - ay;
  const lengthSq = dx * dx + dy * dy;

  if (!lengthSq) return Math.hypot(px - ax, py - ay);

  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / lengthSq));
  const x = ax + t * dx;
  const y = ay + t * dy;

  return Math.hypot(px - x, py - y);
}

function quadraticPoint(curve, t) {
  const mt = 1 - t;

  return {
    x: mt * mt * curve.ax + 2 * mt * t * curve.cx + t * t * curve.bx,
    y: mt * mt * curve.ay + 2 * mt * t * curve.cy + t * t * curve.by,
  };
}

export function pointToQuadraticDistance(px, py, curve) {
  let minDistance = Infinity;
  let prev = quadraticPoint(curve, 0);
  const steps = 24;

  for (let i = 1; i <= steps; i += 1) {
    const next = quadraticPoint(curve, i / steps);

    minDistance = Math.min(
      minDistance,
      pointToSegmentDistance(px, py, prev.x, prev.y, next.x, next.y)
    );

    prev = next;
  }

  return minDistance;
}

export function buildDefaultMapView(nodes, width, height, clampScale) {
  const centerX = width / 2;
  const centerY = height / 2;

  if (!nodes.length) return { scale: 1.35, tx: 0, ty: 0 };

  const paddedNodes = nodes.map((node) => ({
    x: node.x,
    y: node.y,
    r: Math.max(8, node.radius || 0),
  }));

  const minX = Math.min(...paddedNodes.map((node) => node.x - node.r));
  const maxX = Math.max(...paddedNodes.map((node) => node.x + node.r));
  const minY = Math.min(...paddedNodes.map((node) => node.y - node.r));
  const maxY = Math.max(...paddedNodes.map((node) => node.y + node.r));

  const weighted = nodes.reduce(
    (acc, node) => {
      const weight = Math.max(1, node.degree || 0, node.radius || 0);
      acc.totalWeight += weight;
      acc.sumX += node.x * weight;
      acc.sumY += node.y * weight;
      return acc;
    },
    { totalWeight: 0, sumX: 0, sumY: 0 }
  );

  const boundsCenterX = (minX + maxX) / 2;
  const boundsCenterY = (minY + maxY) / 2;
  const weightedCenterX = weighted.totalWeight ? weighted.sumX / weighted.totalWeight : boundsCenterX;
  const weightedCenterY = weighted.totalWeight ? weighted.sumY / weighted.totalWeight : boundsCenterY;
  const anchorX = (boundsCenterX + weightedCenterX) / 2;
  const anchorY = (boundsCenterY + weightedCenterY) / 2;
  const clusterWidth = Math.max(80, maxX - minX);
  const clusterHeight = Math.max(80, maxY - minY);
  const contextPadding = 160;
  const fitScaleX = (width - contextPadding * 2) / clusterWidth;
  const fitScaleY = (height - contextPadding * 2) / clusterHeight;
  const fittedScale = Math.min(fitScaleX, fitScaleY);
  const startupScale = clampScale(Math.max(1.6, Math.min(7.5, fittedScale)));

  return {
    scale: startupScale,
    tx: centerX - anchorX * startupScale,
    ty: centerY - anchorY * startupScale,
  };
}

function calculateVolumeClusterRadius(cluster, maxClusterDegree, clusterSingularLabel, clusterPluralLabel) {
  const isPersonCluster = clusterSingularLabel === 'person' || clusterPluralLabel === 'people';
  const minRadius = isPersonCluster ? 5.5 : 5;
  const maxRadius = isPersonCluster ? 34 : 32;
  const totalDegree = Math.max(0, Number(cluster.totalDegree) || 0);

  if (!maxClusterDegree || maxClusterDegree <= 0 || totalDegree <= 0) {
    return minRadius;
  }

  const normalized = Math.log1p(totalDegree) / Math.log1p(maxClusterDegree);
  const contrastedScore = Math.pow(Math.max(0, Math.min(1, normalized)), 1.35);

  return minRadius + contrastedScore * (maxRadius - minRadius);
}

export function buildClusteredNodes(nodes, thresholdPx, clusterSingularLabel, clusterPluralLabel) {
  const clusters = [];

  nodes.forEach((node) => {
    const hit = clusters.find((cluster) => {
      const dx = node.x - cluster.cx;
      const dy = node.y - cluster.cy;
      return Math.sqrt(dx * dx + dy * dy) <= thresholdPx;
    });

    if (hit) {
      hit.members.push(node);
      hit.totalDegree += node.degree || 0;
      hit.cx = hit.members.reduce((sum, member) => sum + member.x, 0) / hit.members.length;
      hit.cy = hit.members.reduce((sum, member) => sum + member.y, 0) / hit.members.length;
    } else {
      clusters.push({
        id: `cluster-${node.id}`,
        cx: node.x,
        cy: node.y,
        members: [node],
        totalDegree: node.degree || 0,
      });
    }
  });

  const multiMemberClusters = clusters.filter((cluster) => cluster.members.length > 1);
  const maxClusterDegree = Math.max(1, ...multiMemberClusters.map((cluster) => cluster.totalDegree || 0));

  return clusters.map((cluster) => {
    if (cluster.members.length === 1) {
      const node = cluster.members[0];

      return {
        ...node,
        clusterSize: 1,
        isCluster: false,
        memberLabels: [node.label],
      };
    }

    const topMember = cluster.members.slice().sort((a, b) => (b.degree || 0) - (a.degree || 0))[0];
    const clusterRadius = calculateVolumeClusterRadius(
      cluster,
      maxClusterDegree,
      clusterSingularLabel,
      clusterPluralLabel
    );
    return {
      id: cluster.id,
      label: `${cluster.members.length} ${cluster.members.length === 1 ? clusterSingularLabel : clusterPluralLabel}`,
      x: cluster.cx,
      y: cluster.cy,
      radius: clusterRadius,
      degree: cluster.totalDegree,
      clusterSize: cluster.members.length,
      isCluster: true,
      members: cluster.members,
      memberLabels: cluster.members.map((member) => member.label),
      topLabel: topMember?.label || '',
      lat: null,
      lon: null,
    };
  });
}

function boxesOverlap(a, b) {
  return !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom);
}

function buildNodeAvoidanceBox(node, padding = 2) {
  const radius = Math.max(0, node.screenRadius || 0) + padding;
  return {
    id: node.id,
    left: node.screenX - radius,
    right: node.screenX + radius,
    top: node.screenY - radius,
    bottom: node.screenY + radius,
  };
}

export function buildVisibleLabelIds(labelCandidates, showLabels, labelDensityThreshold, labelFontSize, labelOffset) {
  if (!showLabels) return new Set();

  const accepted = [];
  const acceptedIds = new Set();
  const nodeAvoidanceBoxes = labelCandidates.map((node) => buildNodeAvoidanceBox(node, node.isCluster ? 4 : 2));

  for (const node of labelCandidates) {
    if ((node.degree || 0) < labelDensityThreshold) continue;

    const textValue = node.isCluster && node.topLabel ? `${node.topLabel} +${node.clusterSize - 1}` : node.label;
    const textWidth = Math.max(18, textValue.length * labelFontSize * 0.54);
    const textHeight = labelFontSize + 3;
    const box = {
      left: node.screenX - textWidth / 2,
      right: node.screenX + textWidth / 2,
      top: node.screenY + (node.screenRadius || 0) + labelOffset,
      bottom: node.screenY + (node.screenRadius || 0) + labelOffset + textHeight,
    };

    const overlapsAcceptedLabel = accepted.some((placed) => boxesOverlap(box, placed));
    const overlapsOtherNode = nodeAvoidanceBoxes.some((placed) => placed.id !== node.id && boxesOverlap(box, placed));

    if (!overlapsAcceptedLabel && !overlapsOtherNode) {
      accepted.push(box);
      acceptedIds.add(node.id);
    }
  }

  return acceptedIds;
}
