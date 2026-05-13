const MAX_GEOJSON_ROUTES = 75;
const MAX_GEOJSON_NODES = 150;

function emptyFeatureCollection() {
  return {
    type: 'FeatureCollection',
    features: [],
  };
}

export function hasUsableLngLat(node) {
  return (
    Number.isFinite(node?.lon)
    && Number.isFinite(node?.lat)
    && !(node.lat === 0 && node.lon === 0)
  );
}

export function buildProjectableNodeMap(graph) {
  const nodeMap = new Map();

  if (!Array.isArray(graph?.nodes)) return nodeMap;

  graph.nodes.forEach((node) => {
    if (node?.id && hasUsableLngLat(node)) {
      nodeMap.set(node.id, node);
    }
  });

  return nodeMap;
}

export function readNodeWeight(node) {
  return (
    Number(node?.count)
    || Number(node?.weight)
    || Number(node?.degree)
    || Number(node?.totalLetters)
    || 0
  );
}

export function buildNodeProbeFeatureCollection(graph) {
  if (!Array.isArray(graph?.nodes)) return emptyFeatureCollection();

  const features = graph.nodes
    .filter(hasUsableLngLat)
    .map((node) => {
      const weight = readNodeWeight(node);

      return {
        type: 'Feature',
        id: node.id,
        properties: {
          id: node.id,
          label: node.label || node.name || node.id,
          weight,
          degree: Number(node.degree) || 0,
        },
        geometry: {
          type: 'Point',
          coordinates: [node.lon, node.lat],
        },
      };
    })
    .sort((a, b) => (b.properties.weight || 0) - (a.properties.weight || 0))
    .slice(0, MAX_GEOJSON_NODES);

  return {
    type: 'FeatureCollection',
    features,
  };
}

export function buildRouteProbeFeatureCollection(graph) {
  if (!Array.isArray(graph?.edges)) return emptyFeatureCollection();

  const projectableNodes = buildProjectableNodeMap(graph);

  const features = graph.edges
    .map((edge) => {
      const sourceId = edge?.sourcePlaceId || edge?.source;
      const targetId = edge?.targetPlaceId || edge?.target;
      const source = projectableNodes.get(sourceId);
      const target = projectableNodes.get(targetId);

      if (!source || !target) return null;

      const count = Number(edge.count) || Number(edge.weight) || 0;

      return {
        type: 'Feature',
        id: edge.id || `${sourceId}-->${targetId}`,
        properties: {
          id: edge.id || `${sourceId}-->${targetId}`,
          sourceId,
          targetId,
          sourceLabel: edge.sourceLabel || source.label || sourceId,
          targetLabel: edge.targetLabel || target.label || targetId,
          count,
        },
        geometry: {
          type: 'LineString',
          coordinates: [
            [source.lon, source.lat],
            [target.lon, target.lat],
          ],
        },
      };
    })
    .filter(Boolean)
    .sort((a, b) => (b.properties.count || 0) - (a.properties.count || 0))
    .slice(0, MAX_GEOJSON_ROUTES);

  return {
    type: 'FeatureCollection',
    features,
  };
}

export function countProjectableRoutes(graph) {
  if (!Array.isArray(graph?.edges)) return 0;

  const nodeMap = buildProjectableNodeMap(graph);

  return graph.edges.filter((edge) => {
    const sourceId = edge?.sourcePlaceId || edge?.source;
    const targetId = edge?.targetPlaceId || edge?.target;
    return nodeMap.has(sourceId) && nodeMap.has(targetId);
  }).length;
}
