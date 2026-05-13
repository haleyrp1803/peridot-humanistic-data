import { useEffect, useMemo, useRef, useState } from 'react';

import maplibregl from 'maplibre-gl';

import 'maplibre-gl/dist/maplibre-gl.css';

import { getMapLibreStyleConfig } from './mapStyleConfig';
import {
  buildNodeProbeFeatureCollection,
  buildRouteProbeFeatureCollection,
  countProjectableRoutes,
  hasUsableLngLat,
} from './mapLibreFeatureBuilders';
import {
  EMPTY_SELECTED_FILTER,
  AGGREGATED_ROUTE_HIT_LAYER_ID,
  AGGREGATED_ROUTE_LAYER_ID,
  AGGREGATED_ROUTE_SOURCE_ID,
  DYNAMIC_CLUSTER_LABEL_LAYER_ID,
  DYNAMIC_CLUSTER_LAYER_ID,
  DYNAMIC_CLUSTER_SOURCE_ID,
  NODE_LAYER_ID,
  NODE_SOURCE_ID,
  ROUTE_HIT_LAYER_ID,
  ROUTE_LAYER_ID,
  ROUTE_SOURCE_ID,
  SELECTED_AGGREGATED_ROUTE_LAYER_ID,
  SELECTED_DYNAMIC_CLUSTER_LAYER_ID,
  SELECTED_NODE_LAYER_ID,
  SELECTED_ROUTE_LAYER_ID,
  buildNodeLayerDefinition,
  buildRouteHitLayerDefinition,
  buildRouteLayerDefinition,
  buildSelectedNodeLayerDefinition,
  buildSelectedRouteLayerDefinition,
  selectedIdFilter,
} from './mapLibreLayerConfig';

const DEFAULT_CENTER = [12.5, 43.4];
const DEFAULT_ZOOM = 4.8;

const MAX_CLUSTER_LEAVES_FOR_NODE_HIDING = 5000;

const EMPTY_FEATURE_COLLECTION = {
  type: 'FeatureCollection',
  features: [],
};

function formatNumber(value, digits = 4) {
  if (!Number.isFinite(value)) return 'n/a';
  return value.toFixed(digits);
}

function readStyleLoaded(map) {
  if (!map) return false;
  try {
    return Boolean(map.isStyleLoaded());
  } catch {
    return false;
  }
}

function hasMapStyle(map) {
  if (!map) return false;
  try {
    return Boolean(map.getStyle());
  } catch {
    return false;
  }
}

function queryRenderedFeatureCount(map, layerId) {
  if (!map || !map.getLayer(layerId)) return 0;

  try {
    return map.queryRenderedFeatures({ layers: [layerId] }).length;
  } catch {
    return 0;
  }
}

function featureCollectionFeatures(featureCollection) {
  return Array.isArray(featureCollection?.features) ? featureCollection.features : [];
}

function routeEndpointId(feature, key) {
  const value = feature?.properties?.[key];
  return value === undefined || value === null ? '' : String(value);
}

function readRouteCount(feature) {
  return Number(feature?.properties?.count) || Number(feature?.properties?.weight) || 0;
}

function normalizePropertyArray(value) {
  if (Array.isArray(value)) return value;

  if (typeof value === 'string' && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  if (value && typeof value === 'object') {
    return Object.keys(value)
      .sort((a, b) => Number(a) - Number(b))
      .map((key) => value[key]);
  }

  return [];
}

function summarizeRouteFeature(feature) {
  const properties = feature?.properties || {};
  const id = routeEndpointId(feature, 'id') || String(feature?.id || stableFeatureKey(feature));
  const sourceId = routeEndpointId(feature, 'sourceId');
  const targetId = routeEndpointId(feature, 'targetId');

  return {
    id,
    sourceId,
    targetId,
    sourceLabel: properties.sourceLabel || sourceId,
    targetLabel: properties.targetLabel || targetId,
    count: readRouteCount(feature),
    label: `${properties.sourceLabel || sourceId || 'Source'} → ${properties.targetLabel || targetId || 'Target'}`,
  };
}

function readCoordinates(feature) {
  const coordinates = feature?.geometry?.coordinates;
  if (!Array.isArray(coordinates) || coordinates.length < 2) return null;
  const lon = Number(coordinates[0]);
  const lat = Number(coordinates[1]);
  if (!Number.isFinite(lon) || !Number.isFinite(lat)) return null;
  return [lon, lat];
}

function buildNodeEndpointMap(nodeFeatureCollection) {
  const nodeEndpointMap = new Map();

  featureCollectionFeatures(nodeFeatureCollection).forEach((feature) => {
    const id = routeEndpointId(feature, 'id') || String(feature?.id || '');
    const coordinates = readCoordinates(feature);

    if (!id || !coordinates) return;

    nodeEndpointMap.set(id, {
      id,
      label: routeEndpointId(feature, 'label') || id,
      coordinates,
      isCluster: false,
    });
  });

  return nodeEndpointMap;
}

function endpointForNodeId(nodeId, nodeEndpointMap, clusteredEndpointByNodeId) {
  return clusteredEndpointByNodeId?.get(nodeId) || nodeEndpointMap.get(nodeId) || null;
}

function stableFeatureKey(feature) {
  const id = routeEndpointId(feature, 'id') || String(feature?.id || '');
  const count = readRouteCount(feature);
  return `${id}:${count}`;
}

function buildVisibleAggregatedRouteFeatureCollection({
  routeFeatureCollection,
  nodeFeatureCollection,
  clusteredEndpointByNodeId = new Map(),
}) {
  const nodeEndpointMap = buildNodeEndpointMap(nodeFeatureCollection);
  const routeGroups = new Map();
  let internalRouteCount = 0;

  featureCollectionFeatures(routeFeatureCollection).forEach((feature) => {
    const sourceOriginalId = routeEndpointId(feature, 'sourceId');
    const targetOriginalId = routeEndpointId(feature, 'targetId');
    const sourceEndpoint = endpointForNodeId(sourceOriginalId, nodeEndpointMap, clusteredEndpointByNodeId);
    const targetEndpoint = endpointForNodeId(targetOriginalId, nodeEndpointMap, clusteredEndpointByNodeId);

    if (!sourceEndpoint || !targetEndpoint) return;

    if (sourceEndpoint.id === targetEndpoint.id) {
      internalRouteCount += 1;
      return;
    }

    const groupId = `${sourceEndpoint.id}-->${targetEndpoint.id}`;
    const routeId = routeEndpointId(feature, 'id') || String(feature?.id || stableFeatureKey(feature));
    const count = readRouteCount(feature);

    if (!routeGroups.has(groupId)) {
      routeGroups.set(groupId, {
        id: groupId,
        sourceId: sourceEndpoint.id,
        targetId: targetEndpoint.id,
        sourceLabel: sourceEndpoint.label || sourceEndpoint.id,
        targetLabel: targetEndpoint.label || targetEndpoint.id,
        sourceCoordinates: sourceEndpoint.coordinates,
        targetCoordinates: targetEndpoint.coordinates,
        sourceIsCluster: Boolean(sourceEndpoint.isCluster),
        targetIsCluster: Boolean(targetEndpoint.isCluster),
        count: 0,
        memberRouteCount: 0,
        memberRouteIds: [],
        memberRouteSummaries: [],
        originalSourceIds: new Set(),
        originalTargetIds: new Set(),
      });
    }

    const group = routeGroups.get(groupId);
    group.count += count;
    group.memberRouteCount += 1;
    group.memberRouteIds.push(routeId);
    group.memberRouteSummaries.push(summarizeRouteFeature(feature));
    if (sourceOriginalId) group.originalSourceIds.add(sourceOriginalId);
    if (targetOriginalId) group.originalTargetIds.add(targetOriginalId);
  });

  const features = Array.from(routeGroups.values())
    .sort((a, b) => {
      const countDelta = (Number(b.count) || 0) - (Number(a.count) || 0);
      if (countDelta) return countDelta;
      return String(a.id).localeCompare(String(b.id));
    })
    .map((group) => ({
      type: 'Feature',
      id: group.id,
      properties: {
        id: group.id,
        sourceId: group.sourceId,
        targetId: group.targetId,
        sourceLabel: group.sourceLabel,
        targetLabel: group.targetLabel,
        count: group.count,
        memberRouteCount: group.memberRouteCount,
        memberRouteIds: group.memberRouteIds,
        memberRouteSummaries: group.memberRouteSummaries,
        memberRouteSummariesJson: JSON.stringify(group.memberRouteSummaries),
        originalSourceIds: Array.from(group.originalSourceIds),
        originalTargetIds: Array.from(group.originalTargetIds),
        sourceIsCluster: group.sourceIsCluster,
        targetIsCluster: group.targetIsCluster,
        isAggregatedRoute: group.memberRouteCount > 1 || group.sourceIsCluster || group.targetIsCluster,
      },
      geometry: {
        type: 'LineString',
        coordinates: [group.sourceCoordinates, group.targetCoordinates],
      },
    }));

  return {
    featureCollection: {
      type: 'FeatureCollection',
      features,
    },
    internalRouteCount,
  };
}

function serializeAggregatedRouteFeatures(featureCollection) {
  return featureCollectionFeatures(featureCollection)
    .map((feature) => `${routeEndpointId(feature, 'id')}:${readRouteCount(feature)}`)
    .sort()
    .join('\u001f');
}

function readMapViewState(map) {
  if (!map) {
    return {
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      bearing: 0,
      pitch: 0,
      loaded: false,
    };
  }

  const currentCenter = map.getCenter();

  return {
    center: [currentCenter.lng, currentCenter.lat],
    zoom: map.getZoom(),
    bearing: map.getBearing(),
    pitch: map.getPitch(),
    loaded: map.loaded(),
  };
}

function ensureRouteProbeLayer(map, featureCollection) {
  if (!hasMapStyle(map)) return false;

  const existingSource = map.getSource(ROUTE_SOURCE_ID);

  if (existingSource) {
    existingSource.setData(featureCollection);
  } else {
    map.addSource(ROUTE_SOURCE_ID, {
      type: 'geojson',
      data: featureCollection,
    });
  }

  if (!map.getLayer(ROUTE_LAYER_ID)) {
    map.addLayer(buildRouteLayerDefinition());
  }


  if (!map.getLayer(ROUTE_HIT_LAYER_ID)) {
    map.addLayer(buildRouteHitLayerDefinition());
  }

  return Boolean(
    map.getSource(ROUTE_SOURCE_ID) && map.getLayer(ROUTE_LAYER_ID) && map.getLayer(ROUTE_HIT_LAYER_ID),
  );
}


function ensureAggregatedRouteLayers(map, featureCollection = EMPTY_FEATURE_COLLECTION) {
  if (!hasMapStyle(map)) return false;

  const existingSource = map.getSource(AGGREGATED_ROUTE_SOURCE_ID);

  if (existingSource) {
    existingSource.setData(featureCollection);
  } else {
    map.addSource(AGGREGATED_ROUTE_SOURCE_ID, {
      type: 'geojson',
      data: featureCollection,
    });
  }

  if (!map.getLayer(AGGREGATED_ROUTE_LAYER_ID)) {
    map.addLayer({
      id: AGGREGATED_ROUTE_LAYER_ID,
      type: 'line',
      source: AGGREGATED_ROUTE_SOURCE_ID,
      paint: {
        'line-color': '#f5b942',
        'line-opacity': 0.88,
        'line-width': [
          'interpolate',
          ['linear'],
          ['coalesce', ['get', 'count'], 1],
          1,
          1.5,
          10,
          3,
          50,
          7,
          150,
          12,
          300,
          18,
        ],
      },
    });
  }

  if (!map.getLayer(SELECTED_AGGREGATED_ROUTE_LAYER_ID)) {
    map.addLayer({
      id: SELECTED_AGGREGATED_ROUTE_LAYER_ID,
      type: 'line',
      source: AGGREGATED_ROUTE_SOURCE_ID,
      filter: EMPTY_SELECTED_FILTER,
      paint: {
        'line-color': '#fff7a8',
        'line-opacity': 0.98,
        'line-width': 14,
      },
    });
  }

  if (!map.getLayer(AGGREGATED_ROUTE_HIT_LAYER_ID)) {
    map.addLayer({
      id: AGGREGATED_ROUTE_HIT_LAYER_ID,
      type: 'line',
      source: AGGREGATED_ROUTE_SOURCE_ID,
      paint: {
        'line-color': '#ffffff',
        'line-opacity': 0.01,
        'line-width': 28,
      },
    });
  }

  if (map.getLayer(AGGREGATED_ROUTE_LAYER_ID)) {
    map.moveLayer(AGGREGATED_ROUTE_LAYER_ID);
  }

  if (map.getLayer(SELECTED_AGGREGATED_ROUTE_LAYER_ID)) {
    map.moveLayer(SELECTED_AGGREGATED_ROUTE_LAYER_ID);
  }

  if (map.getLayer(AGGREGATED_ROUTE_HIT_LAYER_ID)) {
    map.moveLayer(AGGREGATED_ROUTE_HIT_LAYER_ID);
  }

  return Boolean(
    map.getSource(AGGREGATED_ROUTE_SOURCE_ID) &&
      map.getLayer(AGGREGATED_ROUTE_LAYER_ID) &&
      map.getLayer(AGGREGATED_ROUTE_HIT_LAYER_ID),
  );
}

function hideOriginalRouteLayersForAggregation(map) {
  if (!map) return;

  if (map.getLayer(ROUTE_LAYER_ID)) {
    map.setFilter(ROUTE_LAYER_ID, EMPTY_SELECTED_FILTER);
  }

  if (map.getLayer(ROUTE_HIT_LAYER_ID)) {
    map.setFilter(ROUTE_HIT_LAYER_ID, EMPTY_SELECTED_FILTER);
  }

  if (map.getLayer(SELECTED_ROUTE_LAYER_ID)) {
    map.setFilter(SELECTED_ROUTE_LAYER_ID, EMPTY_SELECTED_FILTER);
  }
}

function ensureNodeProbeLayer(map, featureCollection) {
  if (!hasMapStyle(map)) return false;

  const existingSource = map.getSource(NODE_SOURCE_ID);

  if (existingSource) {
    existingSource.setData(featureCollection);
  } else {
    map.addSource(NODE_SOURCE_ID, {
      type: 'geojson',
      data: featureCollection,
    });
  }

  if (!map.getLayer(NODE_LAYER_ID)) {
    map.addLayer(buildNodeLayerDefinition());
  }

  if (map.getLayer(NODE_LAYER_ID)) {
    map.moveLayer(NODE_LAYER_ID);
  }

  return Boolean(map.getSource(NODE_SOURCE_ID) && map.getLayer(NODE_LAYER_ID));
}

function ensureDynamicClusterLayer(map, featureCollection = EMPTY_FEATURE_COLLECTION) {
  if (!hasMapStyle(map)) return false;

  const clusterData = featureCollection || EMPTY_FEATURE_COLLECTION;
  const existingSource = map.getSource(DYNAMIC_CLUSTER_SOURCE_ID);

  if (existingSource) {
    existingSource.setData(clusterData);
  } else {
    map.addSource(DYNAMIC_CLUSTER_SOURCE_ID, {
      type: 'geojson',
      data: clusterData,
      cluster: true,
      clusterMaxZoom: 9,
      clusterRadius: 44,
    });
  }

  if (!map.getLayer(DYNAMIC_CLUSTER_LAYER_ID)) {
    const layerDefinition = {
      id: DYNAMIC_CLUSTER_LAYER_ID,
      type: 'circle',
      source: DYNAMIC_CLUSTER_SOURCE_ID,
      filter: ['has', 'point_count'],
      paint: {
        'circle-radius': [
          'step',
          ['get', 'point_count'],
          14,
          3,
          18,
          8,
          23,
          20,
          30,
        ],
        'circle-color': '#f472b6',
        'circle-opacity': 0.82,
        'circle-stroke-color': '#111827',
        'circle-stroke-width': 3,
      },
    };

    if (map.getLayer(NODE_LAYER_ID)) {
      map.addLayer(layerDefinition, NODE_LAYER_ID);
    } else {
      map.addLayer(layerDefinition);
    }
  }

  if (!map.getLayer(DYNAMIC_CLUSTER_LABEL_LAYER_ID)) {
    const labelLayerDefinition = {
      id: DYNAMIC_CLUSTER_LABEL_LAYER_ID,
      type: 'symbol',
      source: DYNAMIC_CLUSTER_SOURCE_ID,
      filter: ['has', 'point_count'],
      layout: {
        'text-field': ['get', 'point_count_abbreviated'],
        'text-size': [
          'step',
          ['get', 'point_count'],
          12,
          8,
          13,
          20,
          14,
        ],
        'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
        'text-allow-overlap': true,
        'text-ignore-placement': true,
      },
      paint: {
        'text-color': '#111827',
        'text-halo-color': '#ffffff',
        'text-halo-width': 1.5,
      },
    };

    if (map.getLayer(NODE_LAYER_ID)) {
      map.addLayer(labelLayerDefinition, NODE_LAYER_ID);
    } else {
      map.addLayer(labelLayerDefinition);
    }
  }

  if (!map.getLayer(SELECTED_DYNAMIC_CLUSTER_LAYER_ID)) {
    map.addLayer({
      id: SELECTED_DYNAMIC_CLUSTER_LAYER_ID,
      type: 'circle',
      source: DYNAMIC_CLUSTER_SOURCE_ID,
      filter: EMPTY_SELECTED_FILTER,
      paint: {
        'circle-radius': [
          'step',
          ['get', 'point_count'],
          20,
          3,
          24,
          8,
          30,
          20,
          38,
        ],
        'circle-color': '#fff7a8',
        'circle-opacity': 0.96,
        'circle-stroke-color': '#111827',
        'circle-stroke-width': 4,
      },
    });
  }

  if (map.getLayer(DYNAMIC_CLUSTER_LAYER_ID) && map.getLayer(NODE_LAYER_ID)) {
    map.moveLayer(DYNAMIC_CLUSTER_LAYER_ID, NODE_LAYER_ID);
  }

  if (map.getLayer(DYNAMIC_CLUSTER_LABEL_LAYER_ID) && map.getLayer(NODE_LAYER_ID)) {
    map.moveLayer(DYNAMIC_CLUSTER_LABEL_LAYER_ID, NODE_LAYER_ID);
  }

  if (map.getLayer(SELECTED_DYNAMIC_CLUSTER_LAYER_ID)) {
    map.moveLayer(SELECTED_DYNAMIC_CLUSTER_LAYER_ID);
  }

  return Boolean(
    map.getSource(DYNAMIC_CLUSTER_SOURCE_ID) &&
      map.getLayer(DYNAMIC_CLUSTER_LAYER_ID) &&
      map.getLayer(DYNAMIC_CLUSTER_LABEL_LAYER_ID),
  );
}

function ensureSelectedFilterLayers(map) {
  if (!hasMapStyle(map)) return false;

  if (map.getSource(ROUTE_SOURCE_ID) && !map.getLayer(SELECTED_ROUTE_LAYER_ID)) {
    map.addLayer(buildSelectedRouteLayerDefinition());
  }

  if (map.getSource(NODE_SOURCE_ID) && !map.getLayer(SELECTED_NODE_LAYER_ID)) {
    map.addLayer(buildSelectedNodeLayerDefinition());
  }

  if (map.getLayer(SELECTED_ROUTE_LAYER_ID)) {
    map.moveLayer(SELECTED_ROUTE_LAYER_ID);
  }

  if (map.getLayer(ROUTE_HIT_LAYER_ID)) {
    map.moveLayer(ROUTE_HIT_LAYER_ID);
  }

  if (map.getLayer(NODE_LAYER_ID)) {
    map.moveLayer(NODE_LAYER_ID);
  }

  if (map.getLayer(SELECTED_NODE_LAYER_ID)) {
    map.moveLayer(SELECTED_NODE_LAYER_ID);
  }

  return Boolean(map.getLayer(SELECTED_ROUTE_LAYER_ID) || map.getLayer(SELECTED_NODE_LAYER_ID));
}

function clearSelectedFilterLayers(map) {
  if (!map) return;

  if (map.getLayer(SELECTED_ROUTE_LAYER_ID)) {
    map.setFilter(SELECTED_ROUTE_LAYER_ID, EMPTY_SELECTED_FILTER);
  }

  if (map.getLayer(SELECTED_AGGREGATED_ROUTE_LAYER_ID)) {
    map.setFilter(SELECTED_AGGREGATED_ROUTE_LAYER_ID, EMPTY_SELECTED_FILTER);
  }

  if (map.getLayer(SELECTED_DYNAMIC_CLUSTER_LAYER_ID)) {
    map.setFilter(SELECTED_DYNAMIC_CLUSTER_LAYER_ID, EMPTY_SELECTED_FILTER);
  }

  if (map.getLayer(SELECTED_NODE_LAYER_ID)) {
    map.setFilter(SELECTED_NODE_LAYER_ID, EMPTY_SELECTED_FILTER);
  }
}

function setSelectedNodeFilter(map, id) {
  if (!ensureSelectedFilterLayers(map)) return;

  if (map.getLayer(SELECTED_NODE_LAYER_ID)) {
    map.setFilter(SELECTED_NODE_LAYER_ID, selectedIdFilter(id));
  }

  if (map.getLayer(SELECTED_ROUTE_LAYER_ID)) {
    map.setFilter(SELECTED_ROUTE_LAYER_ID, EMPTY_SELECTED_FILTER);
  }

  if (map.getLayer(SELECTED_AGGREGATED_ROUTE_LAYER_ID)) {
    map.setFilter(SELECTED_AGGREGATED_ROUTE_LAYER_ID, EMPTY_SELECTED_FILTER);
  }

  if (map.getLayer(SELECTED_DYNAMIC_CLUSTER_LAYER_ID)) {
    map.setFilter(SELECTED_DYNAMIC_CLUSTER_LAYER_ID, EMPTY_SELECTED_FILTER);
  }
}

function setSelectedDynamicClusterFilter(map, clusterId) {
  if (map.getLayer(SELECTED_DYNAMIC_CLUSTER_LAYER_ID)) {
    map.setFilter(SELECTED_DYNAMIC_CLUSTER_LAYER_ID, selectedClusterIdFilter(clusterId));
  }

  if (map.getLayer(SELECTED_ROUTE_LAYER_ID)) {
    map.setFilter(SELECTED_ROUTE_LAYER_ID, EMPTY_SELECTED_FILTER);
  }

  if (map.getLayer(SELECTED_AGGREGATED_ROUTE_LAYER_ID)) {
    map.setFilter(SELECTED_AGGREGATED_ROUTE_LAYER_ID, EMPTY_SELECTED_FILTER);
  }

  if (map.getLayer(SELECTED_NODE_LAYER_ID)) {
    map.setFilter(SELECTED_NODE_LAYER_ID, EMPTY_SELECTED_FILTER);
  }
}

function setSelectedAggregatedRouteFilter(map, id) {
  if (map.getLayer(SELECTED_AGGREGATED_ROUTE_LAYER_ID)) {
    map.setFilter(SELECTED_AGGREGATED_ROUTE_LAYER_ID, selectedIdFilter(id));
  }

  if (map.getLayer(SELECTED_ROUTE_LAYER_ID)) {
    map.setFilter(SELECTED_ROUTE_LAYER_ID, EMPTY_SELECTED_FILTER);
  }

  if (map.getLayer(SELECTED_NODE_LAYER_ID)) {
    map.setFilter(SELECTED_NODE_LAYER_ID, EMPTY_SELECTED_FILTER);
  }

  if (map.getLayer(SELECTED_DYNAMIC_CLUSTER_LAYER_ID)) {
    map.setFilter(SELECTED_DYNAMIC_CLUSTER_LAYER_ID, EMPTY_SELECTED_FILTER);
  }
}

function setSelectedRouteFilter(map, id) {
  if (!ensureSelectedFilterLayers(map)) return;

  if (map.getLayer(SELECTED_ROUTE_LAYER_ID)) {
    map.setFilter(SELECTED_ROUTE_LAYER_ID, selectedIdFilter(id));
  }

  if (map.getLayer(SELECTED_NODE_LAYER_ID)) {
    map.setFilter(SELECTED_NODE_LAYER_ID, EMPTY_SELECTED_FILTER);
  }

  if (map.getLayer(SELECTED_AGGREGATED_ROUTE_LAYER_ID)) {
    map.setFilter(SELECTED_AGGREGATED_ROUTE_LAYER_ID, EMPTY_SELECTED_FILTER);
  }

  if (map.getLayer(SELECTED_DYNAMIC_CLUSTER_LAYER_ID)) {
    map.setFilter(SELECTED_DYNAMIC_CLUSTER_LAYER_ID, EMPTY_SELECTED_FILTER);
  }
}

function readMapLibreLayerDiagnostics(map, setupDiagnostics = {}) {
  if (!map) {
    return {
      styleLoaded: false,
      lastSetupPhase: setupDiagnostics.phase || 'not-started',
      setupAttempts: setupDiagnostics.attempts || 0,
      setupError: setupDiagnostics.error || '',
      routeSourceExists: false,
      routeLayerExists: false,
      routeHitLayerExists: false,
      selectedRouteLayerExists: false,
      nodeSourceExists: false,
      nodeLayerExists: false,
      selectedNodeLayerExists: false,
      dynamicClusterSourceExists: false,
      dynamicClusterLayerExists: false,
      dynamicClusterLabelLayerExists: false,
      selectedDynamicClusterLayerExists: false,
      renderedDynamicClusterCount: 0,
      renderedDynamicClusterLabelCount: 0,
      hiddenClusterMemberCount: 0,
      aggregatedRouteSourceExists: false,
      aggregatedRouteLayerExists: false,
      aggregatedRouteHitLayerExists: false,
      selectedAggregatedRouteLayerExists: false,
      aggregatedRouteCount: 0,
      renderedAggregatedRouteCount: 0,
      renderedAggregatedRouteHitCount: 0,
      internalClusterRouteCount: 0,
      lastClusterClickId: '',
      lastClusterClickPointCount: 0,
      lastClusterClickLeafCount: 0,
      lastClusterClickError: '',
      renderedRouteCount: 0,
      renderedRouteHitCount: 0,
      renderedNodeCount: 0,
    };
  }

  const routeLayerExists = Boolean(map.getLayer(ROUTE_LAYER_ID));
  const routeHitLayerExists = Boolean(map.getLayer(ROUTE_HIT_LAYER_ID));
  const aggregatedRouteLayerExists = Boolean(map.getLayer(AGGREGATED_ROUTE_LAYER_ID));
  const aggregatedRouteHitLayerExists = Boolean(map.getLayer(AGGREGATED_ROUTE_HIT_LAYER_ID));
  const nodeLayerExists = Boolean(map.getLayer(NODE_LAYER_ID));
  const dynamicClusterLayerExists = Boolean(map.getLayer(DYNAMIC_CLUSTER_LAYER_ID));
  const dynamicClusterLabelLayerExists = Boolean(map.getLayer(DYNAMIC_CLUSTER_LABEL_LAYER_ID));

  return {
    styleLoaded: readStyleLoaded(map),
    lastSetupPhase: setupDiagnostics.phase || 'unknown',
    setupAttempts: setupDiagnostics.attempts || 0,
    setupError: setupDiagnostics.error || '',
    routeSourceExists: Boolean(map.getSource(ROUTE_SOURCE_ID)),
    routeLayerExists,
    routeHitLayerExists,
    selectedRouteLayerExists: Boolean(map.getLayer(SELECTED_ROUTE_LAYER_ID)),
    nodeSourceExists: Boolean(map.getSource(NODE_SOURCE_ID)),
    nodeLayerExists,
    selectedNodeLayerExists: Boolean(map.getLayer(SELECTED_NODE_LAYER_ID)),
    dynamicClusterSourceExists: Boolean(map.getSource(DYNAMIC_CLUSTER_SOURCE_ID)),
    dynamicClusterLayerExists,
    dynamicClusterLabelLayerExists,
    selectedDynamicClusterLayerExists: Boolean(map.getLayer(SELECTED_DYNAMIC_CLUSTER_LAYER_ID)),
    renderedDynamicClusterCount: dynamicClusterLayerExists
      ? queryRenderedFeatureCount(map, DYNAMIC_CLUSTER_LAYER_ID)
      : 0,
    renderedDynamicClusterLabelCount: dynamicClusterLabelLayerExists
      ? queryRenderedFeatureCount(map, DYNAMIC_CLUSTER_LABEL_LAYER_ID)
      : 0,
    hiddenClusterMemberCount: setupDiagnostics.hiddenClusterMemberCount || 0,
    aggregatedRouteSourceExists: Boolean(map.getSource(AGGREGATED_ROUTE_SOURCE_ID)),
    aggregatedRouteLayerExists,
    aggregatedRouteHitLayerExists,
    selectedAggregatedRouteLayerExists: Boolean(map.getLayer(SELECTED_AGGREGATED_ROUTE_LAYER_ID)),
    aggregatedRouteCount: setupDiagnostics.aggregatedRouteCount || 0,
    renderedAggregatedRouteCount: aggregatedRouteLayerExists
      ? queryRenderedFeatureCount(map, AGGREGATED_ROUTE_LAYER_ID)
      : 0,
    renderedAggregatedRouteHitCount: aggregatedRouteHitLayerExists
      ? queryRenderedFeatureCount(map, AGGREGATED_ROUTE_HIT_LAYER_ID)
      : 0,
    internalClusterRouteCount: setupDiagnostics.internalClusterRouteCount || 0,
    lastClusterClickId: setupDiagnostics.lastClusterClickId || '',
    lastClusterClickPointCount: setupDiagnostics.lastClusterClickPointCount || 0,
    lastClusterClickLeafCount: setupDiagnostics.lastClusterClickLeafCount || 0,
    lastClusterClickError: setupDiagnostics.lastClusterClickError || '',
    renderedRouteCount: routeLayerExists ? queryRenderedFeatureCount(map, ROUTE_LAYER_ID) : 0,
    renderedRouteHitCount: routeHitLayerExists ? queryRenderedFeatureCount(map, ROUTE_HIT_LAYER_ID) : 0,
    renderedNodeCount: nodeLayerExists ? queryRenderedFeatureCount(map, NODE_LAYER_ID) : 0,
  };
}


function ensureAndReportNodeProbeLayer(map, featureCollection, setLayerDiagnostics, setupDiagnostics = {}) {
  const ready = ensureNodeProbeLayer(map, featureCollection);
  setLayerDiagnostics(readMapLibreLayerDiagnostics(map, setupDiagnostics));
  return ready;
}

function buildMapLibreClickPoint(event) {
  return {
    x: event?.point?.x ?? 24,
    y: event?.point?.y ?? 24,
    clientX: event?.originalEvent?.clientX ?? event?.point?.x ?? 0,
    clientY: event?.originalEvent?.clientY ?? event?.point?.y ?? 0,
  };
}

function featureProperty(feature, key) {
  const value = feature?.properties?.[key];
  return value === undefined || value === null ? '' : String(value);
}

function featureId(feature) {
  return featureProperty(feature, 'id') || String(feature?.id || '');
}

function serializeHiddenNodeIds(hiddenNodeIds) {
  if (!hiddenNodeIds?.size) return '';
  return Array.from(hiddenNodeIds).sort().join('\u001f');
}

function buildVisibleNodeFilter(hiddenNodeIds) {
  if (!hiddenNodeIds?.size) return null;
  return ['!', ['in', ['get', 'id'], ['literal', Array.from(hiddenNodeIds)]]];
}

function selectedClusterIdFilter(clusterId) {
  const numericClusterId = Number(clusterId);
  if (!Number.isFinite(numericClusterId)) return EMPTY_SELECTED_FILTER;
  return ['all', ['has', 'point_count'], ['==', ['get', 'cluster_id'], numericClusterId]];
}

function findGraphNodeForFeature(graph, feature) {
  const nodeId = featureId(feature);
  if (!nodeId || !Array.isArray(graph?.nodes)) return null;

  return graph.nodes.find((node) => String(node?.id || '') === nodeId) || null;
}

function findGraphEdgeForFeature(graph, feature) {
  if (!Array.isArray(graph?.edges)) return null;

  const edgeId = featureProperty(feature, 'id') || String(feature?.id || '');

  if (edgeId) {
    const directMatch = graph.edges.find((edge) => String(edge?.id || '') === edgeId);
    if (directMatch) return directMatch;
  }

  const sourceId = featureProperty(feature, 'sourceId');
  const targetId = featureProperty(feature, 'targetId');

  if (!sourceId || !targetId) return null;

  return (
    graph.edges.find((edge) => {
      const edgeSource = String(edge?.sourcePlaceId || edge?.source || '');
      const edgeTarget = String(edge?.targetPlaceId || edge?.target || '');
      return edgeSource === sourceId && edgeTarget === targetId;
    }) || null
  );
}


function normalizeClusterLeafFeature(graph, leafFeature, fallbackIndex = 0) {
  const graphNode = findGraphNodeForFeature(graph, leafFeature);

  if (graphNode) {
    return graphNode;
  }

  const properties = leafFeature?.properties || {};
  const id = String(properties.id || leafFeature?.id || `maplibre-cluster-leaf:${fallbackIndex}`);
  const label = String(properties.label || id);
  const degree = Number(properties.degree) || Number(properties.weight) || 0;
  const coordinates = Array.isArray(leafFeature?.geometry?.coordinates)
    ? leafFeature.geometry.coordinates
    : [];

  return {
    id,
    label,
    degree,
    weight: Number(properties.weight) || degree,
    lon: Number(coordinates[0]),
    lat: Number(coordinates[1]),
    anchorLabel: properties.anchorLabel || properties.placeLabel || label,
  };
}

function buildClusterNodeFromLeaves(clusterFeature, leaves, graph) {
  const properties = clusterFeature?.properties || {};
  const clusterId = String(properties.cluster_id ?? clusterFeature?.id ?? 'unknown');
  const pointCount = Number(properties.point_count) || leaves.length;
  const coordinates = Array.isArray(clusterFeature?.geometry?.coordinates)
    ? clusterFeature.geometry.coordinates
    : DEFAULT_CENTER;
  const memberNodes = leaves
    .map((leaf, index) => normalizeClusterLeafFeature(graph, leaf, index))
    .filter((member) => member?.label)
    .sort((a, b) => {
      const degreeDelta = (Number(b.degree) || 0) - (Number(a.degree) || 0);
      if (degreeDelta) return degreeDelta;
      return String(a.label || '').localeCompare(String(b.label || ''));
    });
  const totalDegree = memberNodes.reduce((sum, member) => sum + (Number(member.degree) || 0), 0);
  const topMember = memberNodes[0] || null;
  const memberCount = Math.max(pointCount, memberNodes.length);

  return {
    id: `maplibre-dynamic-cluster:${clusterId}`,
    label: topMember ? `${topMember.label} +${Math.max(0, memberCount - 1)}` : `MapLibre cluster ${clusterId}`,
    isCluster: true,
    clusterSize: memberCount,
    degree: totalDegree,
    count: totalDegree,
    radius: 10,
    lon: Number(coordinates[0]),
    lat: Number(coordinates[1]),
    topLabel: topMember?.label || '',
    memberLabels: memberNodes.map((member) => member.label),
    members: memberNodes.map((member) => ({
      ...member,
      anchorLabel: member.anchorLabel || member.placeLabel || member.locationLabel || member.label,
    })),
  };
}

function graphEdgeLabel(edge, fallback = '') {
  return (
    edge?.label ||
    `${edge?.sourceLabel || edge?.source || edge?.sourcePlaceId || 'Source'} → ${
      edge?.targetLabel || edge?.target || edge?.targetPlaceId || 'Target'
    }` ||
    fallback
  );
}

function summarizeGraphEdge(edge, fallback = {}) {
  if (!edge) return fallback;

  const sourceLabel = edge.sourceLabel || edge.source || edge.sourcePlaceId || fallback.sourceLabel || '';
  const targetLabel = edge.targetLabel || edge.target || edge.targetPlaceId || fallback.targetLabel || '';
  const count = Number(edge.count) || Number(edge.weight) || Number(fallback.count) || 0;

  return {
    id: String(edge.id || fallback.id || `${sourceLabel}-->${targetLabel}`),
    sourceId: String(edge.sourcePlaceId || edge.source || fallback.sourceId || ''),
    targetId: String(edge.targetPlaceId || edge.target || fallback.targetId || ''),
    sourceLabel,
    targetLabel,
    count,
    weight: count,
    label: graphEdgeLabel(edge, fallback.label),
    originalEdge: edge,
  };
}

function buildMemberRouteSummaries(graph, memberRouteIds, fallbackSummaries) {
  const graphEdges = Array.isArray(graph?.edges) ? graph.edges : [];
  const summariesById = new Map(
    normalizePropertyArray(fallbackSummaries)
      .filter((summary) => summary?.id)
      .map((summary) => [String(summary.id), summary]),
  );

  const ids = memberRouteIds.length ? memberRouteIds : Array.from(summariesById.keys());
  const seen = new Set();

  return ids
    .map((routeId) => {
      const id = String(routeId || '');
      if (!id || seen.has(id)) return null;
      seen.add(id);

      const fallback = summariesById.get(id) || { id };
      const graphEdge = graphEdges.find((edge) => String(edge?.id || '') === id);
      return summarizeGraphEdge(graphEdge, fallback);
    })
    .filter(Boolean)
    .sort((a, b) => {
      const countDelta = (Number(b.count) || 0) - (Number(a.count) || 0);
      if (countDelta) return countDelta;
      return String(a.label || '').localeCompare(String(b.label || ''));
    });
}

function buildAggregatedEdgeFromFeature(graph, feature) {
  const properties = feature?.properties || {};
  const id = String(properties.id || feature?.id || 'maplibre-aggregated-route');
  const memberRouteIds = normalizePropertyArray(properties.memberRouteIds).map((routeId) => String(routeId));
  const fallbackSummaries = normalizePropertyArray(properties.memberRouteSummaries).length
    ? normalizePropertyArray(properties.memberRouteSummaries)
    : normalizePropertyArray(properties.memberRouteSummariesJson);
  const memberRoutes = buildMemberRouteSummaries(graph, memberRouteIds, fallbackSummaries);

  if (memberRouteIds.length === 1 && Array.isArray(graph?.edges)) {
    const directMatch = graph.edges.find((edge) => String(edge?.id || '') === memberRouteIds[0]);
    if (directMatch && !properties.sourceIsCluster && !properties.targetIsCluster) return directMatch;
  }

  const sourceLabel = properties.sourceLabel || properties.sourceId || 'Visible source';
  const targetLabel = properties.targetLabel || properties.targetId || 'Visible target';
  const count = Number(properties.count) || memberRoutes.reduce((sum, route) => sum + (Number(route.count) || 0), 0);
  const memberRouteCount = Number(properties.memberRouteCount) || memberRoutes.length || memberRouteIds.length;
  const label = `${sourceLabel} → ${targetLabel}`;

  return {
    id,
    source: properties.sourceId || '',
    target: properties.targetId || '',
    sourcePlaceId: properties.sourceId || '',
    targetPlaceId: properties.targetId || '',
    sourceLabel,
    targetLabel,
    count,
    weight: count,
    isAggregatedRoute: true,
    aggregateKind: 'maplibre-visible-endpoint-route',
    aggregateLabel: label,
    aggregateSummary: `${memberRouteCount} underlying ${memberRouteCount === 1 ? 'route' : 'routes'} · ${count} visible ${count === 1 ? 'letter' : 'letters'}`,
    sourceIsCluster: Boolean(properties.sourceIsCluster),
    targetIsCluster: Boolean(properties.targetIsCluster),
    memberRouteCount,
    memberRouteIds,
    linkedRouteIds: memberRouteIds,
    memberRoutes,
    routeMembers: memberRoutes,
    members: memberRoutes.map((route) => ({
      id: route.id,
      label: route.label,
      degree: Number(route.count) || 0,
      sourceLabel: route.sourceLabel,
      targetLabel: route.targetLabel,
      anchorLabel: `${route.sourceLabel || route.sourceId || 'Source'} → ${route.targetLabel || route.targetId || 'Target'}`,
    })),
    memberLabels: memberRoutes.map((route) => route.label),
    label,
  };
}

async function readClusterLeaves(source, clusterId, limit) {
  if (!source || typeof source.getClusterLeaves !== 'function') {
    return [];
  }

  const result = source.getClusterLeaves(clusterId, limit, 0);

  if (result && typeof result.then === 'function') {
    return result;
  }

  if (Array.isArray(result)) {
    return result;
  }

  return [];
}

export function MapLibreMapStage({
  className = '',
  styleId,
  center = DEFAULT_CENTER,
  zoom = DEFAULT_ZOOM,
  interactive = true,
  showDiagnostics = true,
  graph,
  viewMode,
  handleNodeClick,
  handleEdgeClick,
  handleBlankMapClick,
  onMapReady,
  onViewChange,
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const frameRef = useRef(null);
  const pendingRouteDataRef = useRef(null);
  const pendingNodeDataRef = useRef(null);
  const selectedFeatureRef = useRef({ kind: null, id: null });
  const layerSetupDiagnosticsRef = useRef({
    attempts: 0,
    phase: 'not-started',
    error: '',
    lastClusterClickId: '',
    lastClusterClickPointCount: 0,
    lastClusterClickLeafCount: 0,
    lastClusterClickError: '',
    aggregatedRouteCount: 0,
    internalClusterRouteCount: 0,
  });
  const clickHandlersRef = useRef({
    graph,
    handleNodeClick,
    handleEdgeClick,
    handleBlankMapClick,
  });
  const featureClickInProgressRef = useRef(false);
  const hiddenClusterMemberIdsRef = useRef(new Set());
  const hiddenClusterMemberKeyRef = useRef('');
  const clusteredEndpointByNodeIdRef = useRef(new Map());
  const aggregatedRouteFeatureKeyRef = useRef('');
  const nodeVisibilityUpdateTokenRef = useRef(0);

  const [errorMessage, setErrorMessage] = useState('');
  const [viewState, setViewState] = useState(() => ({
    center,
    zoom,
    bearing: 0,
    pitch: 0,
    loaded: false,
  }));
  const [routeFeatureCount, setRouteFeatureCount] = useState(0);
  const [nodeFeatureCount, setNodeFeatureCount] = useState(0);
  const [layerDiagnostics, setLayerDiagnostics] = useState(() =>
    readMapLibreLayerDiagnostics(null, layerSetupDiagnosticsRef.current),
  );

  const styleConfig = useMemo(() => getMapLibreStyleConfig(styleId), [styleId]);
  const routeFeatureCollection = useMemo(() => buildRouteProbeFeatureCollection(graph), [graph]);
  const nodeFeatureCollection = useMemo(() => buildNodeProbeFeatureCollection(graph), [graph]);
  const projectableNodeCount = useMemo(
    () => (Array.isArray(graph?.nodes) ? graph.nodes.filter(hasUsableLngLat).length : 0),
    [graph],
  );
  const projectableRouteCount = useMemo(() => countProjectableRoutes(graph), [graph]);

  const reportLayerDiagnostics = (map = mapRef.current) => {
    setLayerDiagnostics(readMapLibreLayerDiagnostics(map, layerSetupDiagnosticsRef.current));
  };

  const markLayerSetupPhase = (phase) => {
    layerSetupDiagnosticsRef.current = {
      ...layerSetupDiagnosticsRef.current,
      attempts: layerSetupDiagnosticsRef.current.attempts + 1,
      phase,
      error: '',
    };
  };

  const markLayerSetupError = (phase, error) => {
    layerSetupDiagnosticsRef.current = {
      ...layerSetupDiagnosticsRef.current,
      phase,
      error: error instanceof Error ? error.message : String(error),
    };
  };


  const markClusterClickDiagnostics = ({ clusterId = '', pointCount = 0, leafCount = 0, error = '' }) => {
    layerSetupDiagnosticsRef.current = {
      ...layerSetupDiagnosticsRef.current,
      lastClusterClickId: clusterId,
      lastClusterClickPointCount: pointCount,
      lastClusterClickLeafCount: leafCount,
      lastClusterClickError: error,
    };
  };

  const markAggregatedRouteClickDiagnostics = ({ routeId = '', memberRouteCount = 0, count = 0 }) => {
    layerSetupDiagnosticsRef.current = {
      ...layerSetupDiagnosticsRef.current,
      lastAggregatedRouteClickId: routeId,
      lastAggregatedRouteClickMemberCount: memberRouteCount,
      lastAggregatedRouteClickWeight: count,
    };
  };

  const markHiddenClusterMemberCount = (hiddenClusterMemberCount) => {
    layerSetupDiagnosticsRef.current = {
      ...layerSetupDiagnosticsRef.current,
      hiddenClusterMemberCount,
    };
  };


  const markAggregatedRouteStats = ({ aggregatedRouteCount = 0, internalClusterRouteCount = 0 }) => {
    layerSetupDiagnosticsRef.current = {
      ...layerSetupDiagnosticsRef.current,
      aggregatedRouteCount,
      internalClusterRouteCount,
    };
  };

  const updateAggregatedRoutesForVisibleEndpoints = (
    map,
    clusteredEndpointByNodeId = clusteredEndpointByNodeIdRef.current,
  ) => {
    if (!map) return;

    const { featureCollection, internalRouteCount } = buildVisibleAggregatedRouteFeatureCollection({
      routeFeatureCollection: pendingRouteDataRef.current || routeFeatureCollection,
      nodeFeatureCollection: pendingNodeDataRef.current || nodeFeatureCollection,
      clusteredEndpointByNodeId,
    });
    const aggregatedRouteFeatureKey = serializeAggregatedRouteFeatures(featureCollection);

    if (
      aggregatedRouteFeatureKey === aggregatedRouteFeatureKeyRef.current &&
      map.getLayer(AGGREGATED_ROUTE_LAYER_ID)
    ) {
      markAggregatedRouteStats({
        aggregatedRouteCount: featureCollection.features.length,
        internalClusterRouteCount: internalRouteCount,
      });
      hideOriginalRouteLayersForAggregation(map);
      return;
    }

    aggregatedRouteFeatureKeyRef.current = aggregatedRouteFeatureKey;
    markAggregatedRouteStats({
      aggregatedRouteCount: featureCollection.features.length,
      internalClusterRouteCount: internalRouteCount,
    });
    ensureAggregatedRouteLayers(map, featureCollection);
    hideOriginalRouteLayersForAggregation(map);
  };

  const updateNodeVisibilityForVisibleClusters = async (phase = 'node-visibility-update') => {
    const map = mapRef.current;

    if (!map || !map.getLayer(NODE_LAYER_ID) || !map.getLayer(DYNAMIC_CLUSTER_LAYER_ID)) {
      return;
    }

    const clusterSource = map.getSource(DYNAMIC_CLUSTER_SOURCE_ID);

    if (!clusterSource || typeof clusterSource.getClusterLeaves !== 'function') {
      return;
    }

    const updateToken = nodeVisibilityUpdateTokenRef.current + 1;
    nodeVisibilityUpdateTokenRef.current = updateToken;

    try {
      const renderedClusters = map.queryRenderedFeatures({ layers: [DYNAMIC_CLUSTER_LAYER_ID] });
      const hiddenNodeIds = new Set();
      const clusteredEndpointByNodeId = new Map();

      for (const clusterFeature of renderedClusters) {
        if (nodeVisibilityUpdateTokenRef.current !== updateToken) return;

        const clusterId = clusterFeature?.properties?.cluster_id;
        const pointCount = Number(clusterFeature?.properties?.point_count) || 0;

        if (clusterId === undefined || clusterId === null || pointCount <= 0) {
          continue;
        }

        const leafLimit = Math.min(Math.max(pointCount, 1), MAX_CLUSTER_LEAVES_FOR_NODE_HIDING);
        const leaves = await readClusterLeaves(clusterSource, clusterId, leafLimit);

        if (nodeVisibilityUpdateTokenRef.current !== updateToken) return;

        const coordinates = readCoordinates(clusterFeature);
        const clusterEndpoint = coordinates
          ? {
              id: `maplibre-cluster:${clusterId}`,
              label: `Cluster (${pointCount})`,
              coordinates,
              isCluster: true,
              pointCount,
            }
          : null;

        leaves.forEach((leafFeature) => {
          const id = featureId(leafFeature);
          if (!id) return;
          hiddenNodeIds.add(id);
          if (clusterEndpoint) clusteredEndpointByNodeId.set(id, clusterEndpoint);
        });
      }

      if (nodeVisibilityUpdateTokenRef.current !== updateToken) return;

      const nextHiddenKey = serializeHiddenNodeIds(hiddenNodeIds);

      if (nextHiddenKey === hiddenClusterMemberKeyRef.current) {
        clusteredEndpointByNodeIdRef.current = clusteredEndpointByNodeId;
        markHiddenClusterMemberCount(hiddenClusterMemberIdsRef.current.size);
        updateAggregatedRoutesForVisibleEndpoints(map, clusteredEndpointByNodeId);
        reportLayerDiagnostics(map);
        return;
      }

      hiddenClusterMemberIdsRef.current = hiddenNodeIds;
      hiddenClusterMemberKeyRef.current = nextHiddenKey;
      clusteredEndpointByNodeIdRef.current = clusteredEndpointByNodeId;
      markHiddenClusterMemberCount(hiddenNodeIds.size);
      map.setFilter(NODE_LAYER_ID, buildVisibleNodeFilter(hiddenNodeIds));
      updateAggregatedRoutesForVisibleEndpoints(map, clusteredEndpointByNodeId);
      reportLayerDiagnostics(map);
    } catch (error) {
      markLayerSetupError(phase, error);
      reportLayerDiagnostics(map);
      setErrorMessage(error instanceof Error ? error.message : String(error));
    }
  };

  const reapplySelectedFilters = (map) => {
    const selection = selectedFeatureRef.current;

    if (!selection?.kind || !selection?.id) {
      clearSelectedFilterLayers(map);
      return;
    }

    if (selection.kind === 'node') {
      setSelectedNodeFilter(map, selection.id);
      return;
    }

    if (selection.kind === 'cluster') {
      setSelectedDynamicClusterFilter(map, selection.id);
      return;
    }

    if (selection.kind === 'aggregatedRoute') {
      setSelectedAggregatedRouteFilter(map, selection.id);
      return;
    }

    if (selection.kind === 'route') {
      setSelectedRouteFilter(map, selection.id);
    }
  };

  const updateRouteLayer = (featureCollection = routeFeatureCollection) => {
    const map = mapRef.current;
    pendingRouteDataRef.current = featureCollection;
    setRouteFeatureCount(featureCollection.features.length);

    if (!map) {
      reportLayerDiagnostics(null);
      return;
    }

    markLayerSetupPhase('route-data-update');

    try {
      ensureRouteProbeLayer(map, featureCollection);
      updateAggregatedRoutesForVisibleEndpoints(map);
      ensureSelectedFilterLayers(map);
      reapplySelectedFilters(map);
      reportLayerDiagnostics(map);
    } catch (error) {
      markLayerSetupError('route-data-update', error);
      reportLayerDiagnostics(map);
      setErrorMessage(error instanceof Error ? error.message : String(error));
    }
  };

  const updateNodeLayer = (featureCollection = nodeFeatureCollection) => {
    const map = mapRef.current;
    pendingNodeDataRef.current = featureCollection;
    setNodeFeatureCount(featureCollection.features.length);

    if (!map) {
      reportLayerDiagnostics(null);
      return;
    }

    markLayerSetupPhase('node-data-update');

    try {
      ensureAndReportNodeProbeLayer(
        map,
        featureCollection,
        setLayerDiagnostics,
        layerSetupDiagnosticsRef.current,
      );
      ensureDynamicClusterLayer(map, featureCollection);
      void updateNodeVisibilityForVisibleClusters('node-data-update-node-visibility');
      ensureSelectedFilterLayers(map);
      reapplySelectedFilters(map);
      reportLayerDiagnostics(map);
    } catch (error) {
      markLayerSetupError('node-data-update', error);
      reportLayerDiagnostics(map);
      setErrorMessage(error instanceof Error ? error.message : String(error));
    }
  };

  useEffect(() => {
    clickHandlersRef.current = {
      graph,
      handleNodeClick,
      handleEdgeClick,
      handleBlankMapClick,
    };
  }, [graph, handleNodeClick, handleEdgeClick, handleBlankMapClick]);

  useEffect(() => {
    updateRouteLayer(routeFeatureCollection);
    updateNodeLayer(nodeFeatureCollection);
  }, [graph, routeFeatureCollection, nodeFeatureCollection]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return undefined;

    const reportViewChange = () => {
      const map = mapRef.current;
      if (!map) return;

      const nextViewState = readMapViewState(map);
      setViewState(nextViewState);
      onViewChange?.(nextViewState);
    };

    const scheduleReportViewChange = () => {
      if (frameRef.current) return;

      frameRef.current = window.requestAnimationFrame(() => {
        frameRef.current = null;
        reportViewChange();
      });
    };

    try {
      const map = new maplibregl.Map({
        container: containerRef.current,
        style: styleConfig.styleUrl,
        center,
        zoom,
        interactive,
        attributionControl: true,
      });

      mapRef.current = map;

      map.addControl(
        new maplibregl.NavigationControl({
          visualizePitch: false,
          showCompass: true,
          showZoom: true,
        }),
        'top-right',
      );

      map.on('load', () => {
        setErrorMessage('');
        onMapReady?.({ map, styleConfig });
        markLayerSetupPhase('load');

        try {
          ensureRouteProbeLayer(map, pendingRouteDataRef.current || routeFeatureCollection);
          ensureAndReportNodeProbeLayer(
            map,
            pendingNodeDataRef.current || nodeFeatureCollection,
            setLayerDiagnostics,
            layerSetupDiagnosticsRef.current,
          );
          ensureDynamicClusterLayer(map, pendingNodeDataRef.current || nodeFeatureCollection);
          updateAggregatedRoutesForVisibleEndpoints(map);
          void updateNodeVisibilityForVisibleClusters('lifecycle-node-visibility');
          ensureSelectedFilterLayers(map);
          reapplySelectedFilters(map);
          reportLayerDiagnostics(map);
        } catch (error) {
          markLayerSetupError('load', error);
          reportLayerDiagnostics(map);
          setErrorMessage(error instanceof Error ? error.message : String(error));
        }

        reportViewChange();
      });

      map.on('styledata', () => {
        markLayerSetupPhase('styledata');

        try {
          ensureRouteProbeLayer(map, pendingRouteDataRef.current || routeFeatureCollection);
          ensureAndReportNodeProbeLayer(
            map,
            pendingNodeDataRef.current || nodeFeatureCollection,
            setLayerDiagnostics,
            layerSetupDiagnosticsRef.current,
          );
          ensureDynamicClusterLayer(map, pendingNodeDataRef.current || nodeFeatureCollection);
          updateAggregatedRoutesForVisibleEndpoints(map);
          void updateNodeVisibilityForVisibleClusters('lifecycle-node-visibility');
          ensureSelectedFilterLayers(map);
          reapplySelectedFilters(map);
          reportLayerDiagnostics(map);
        } catch (error) {
          markLayerSetupError('styledata', error);
          reportLayerDiagnostics(map);
          setErrorMessage(error instanceof Error ? error.message : String(error));
        }
      });

      const markFeatureClick = () => {
        featureClickInProgressRef.current = true;

        window.setTimeout(() => {
          featureClickInProgressRef.current = false;
        }, 0);
      };

      const handleMapLibreClusterClick = async (event) => {
        const feature = event?.features?.[0];
        const clusterId = feature?.properties?.cluster_id;
        const pointCount = Number(feature?.properties?.point_count) || 0;
        const { graph: currentGraph, handleNodeClick: currentHandleNodeClick } = clickHandlersRef.current;

        if (clusterId === undefined || clusterId === null || typeof currentHandleNodeClick !== 'function') {
          return;
        }

        markFeatureClick();
        event?.preventDefault?.();
        event?.originalEvent?.stopPropagation?.();

        try {
          const clusterSource = map.getSource(DYNAMIC_CLUSTER_SOURCE_ID);
          const leafLimit = Math.max(1000, pointCount || 0);
          const leaves = await readClusterLeaves(clusterSource, clusterId, leafLimit);
          const clusterNode = buildClusterNodeFromLeaves(feature, leaves, currentGraph);

          selectedFeatureRef.current = { kind: 'cluster', id: clusterId };
          setSelectedDynamicClusterFilter(map, clusterId);
          markClusterClickDiagnostics({
            clusterId: String(clusterId),
            pointCount,
            leafCount: leaves.length,
            error: '',
          });
          reportLayerDiagnostics(map);
          currentHandleNodeClick(clusterNode, buildMapLibreClickPoint(event));
        } catch (error) {
          markClusterClickDiagnostics({
            clusterId: String(clusterId),
            pointCount,
            leafCount: 0,
            error: error instanceof Error ? error.message : String(error),
          });
          reportLayerDiagnostics(map);
          setErrorMessage(error instanceof Error ? error.message : String(error));
        }
      };

      const handleMapLibreNodeClick = (event) => {
        const feature = event?.features?.[0];
        const { graph: currentGraph, handleNodeClick: currentHandleNodeClick } = clickHandlersRef.current;
        const node = findGraphNodeForFeature(currentGraph, feature);
        const selectedId = featureProperty(feature, 'id') || String(feature?.id || '');

        if (!node || !selectedId || typeof currentHandleNodeClick !== 'function') return;

        markFeatureClick();
        selectedFeatureRef.current = { kind: 'node', id: selectedId };
        setSelectedNodeFilter(map, selectedId);
        reportLayerDiagnostics(map);
        event?.preventDefault?.();
        event?.originalEvent?.stopPropagation?.();
        currentHandleNodeClick(node, buildMapLibreClickPoint(event));
      };

      const handleMapLibreRouteClick = (event) => {
        const nodeHits = map.queryRenderedFeatures(event.point, {
          layers: [NODE_LAYER_ID, DYNAMIC_CLUSTER_LAYER_ID].filter((layerId) => map.getLayer(layerId)),
        });

        if (nodeHits.length) return;

        const feature = event?.features?.[0];
        const { graph: currentGraph, handleEdgeClick: currentHandleEdgeClick } = clickHandlersRef.current;
        const edge = buildAggregatedEdgeFromFeature(currentGraph, feature) || findGraphEdgeForFeature(currentGraph, feature);
        const selectedId = featureProperty(feature, 'id') || String(feature?.id || '');

        if (!edge || !selectedId || typeof currentHandleEdgeClick !== 'function') return;

        markFeatureClick();
        markAggregatedRouteClickDiagnostics({
          routeId: selectedId,
          memberRouteCount: Number(edge.memberRouteCount) || 0,
          count: Number(edge.count) || 0,
        });
        selectedFeatureRef.current = { kind: 'aggregatedRoute', id: selectedId };
        setSelectedAggregatedRouteFilter(map, selectedId);
        reportLayerDiagnostics(map);
        event?.preventDefault?.();
        event?.originalEvent?.stopPropagation?.();
        currentHandleEdgeClick(edge, buildMapLibreClickPoint(event));
      };

      const handleMapLibreBlankClick = (event) => {
        if (featureClickInProgressRef.current) return;

        const { handleBlankMapClick: currentHandleBlankMapClick } = clickHandlersRef.current;

        if (typeof currentHandleBlankMapClick !== 'function') return;

        const hitFeatures = map.queryRenderedFeatures(event.point, {
          layers: [DYNAMIC_CLUSTER_LAYER_ID, NODE_LAYER_ID, AGGREGATED_ROUTE_HIT_LAYER_ID, AGGREGATED_ROUTE_LAYER_ID].filter((layerId) =>
            map.getLayer(layerId),
          ),
        });

        if (hitFeatures.length) return;

        selectedFeatureRef.current = { kind: null, id: null };
        clearSelectedFilterLayers(map);
        reportLayerDiagnostics(map);
        currentHandleBlankMapClick();
      };

      map.on('click', DYNAMIC_CLUSTER_LAYER_ID, handleMapLibreClusterClick);
      map.on('click', NODE_LAYER_ID, handleMapLibreNodeClick);
      map.on('click', AGGREGATED_ROUTE_HIT_LAYER_ID, handleMapLibreRouteClick);
      map.on('click', handleMapLibreBlankClick);

      const setPointerCursor = () => {
        map.getCanvas().style.cursor = 'pointer';
      };

      const clearPointerCursor = () => {
        map.getCanvas().style.cursor = '';
      };

      map.on('mouseenter', DYNAMIC_CLUSTER_LAYER_ID, setPointerCursor);
      map.on('mouseleave', DYNAMIC_CLUSTER_LAYER_ID, clearPointerCursor);
      map.on('mouseenter', NODE_LAYER_ID, setPointerCursor);
      map.on('mouseleave', NODE_LAYER_ID, clearPointerCursor);
      map.on('mouseenter', AGGREGATED_ROUTE_HIT_LAYER_ID, setPointerCursor);
      map.on('mouseleave', AGGREGATED_ROUTE_HIT_LAYER_ID, clearPointerCursor);

      map.on('idle', () => {
        markLayerSetupPhase('idle');

        try {
          ensureAndReportNodeProbeLayer(
            map,
            pendingNodeDataRef.current || nodeFeatureCollection,
            setLayerDiagnostics,
            layerSetupDiagnosticsRef.current,
          );
          ensureDynamicClusterLayer(map, pendingNodeDataRef.current || nodeFeatureCollection);
          updateAggregatedRoutesForVisibleEndpoints(map);
          void updateNodeVisibilityForVisibleClusters('lifecycle-node-visibility');
          ensureSelectedFilterLayers(map);
          reapplySelectedFilters(map);
          reportLayerDiagnostics(map);
        } catch (error) {
          markLayerSetupError('idle', error);
          reportLayerDiagnostics(map);
          setErrorMessage(error instanceof Error ? error.message : String(error));
        }
      });

      map.on('move', scheduleReportViewChange);
      map.on('zoom', scheduleReportViewChange);
      map.on('rotate', scheduleReportViewChange);
      map.on('pitch', scheduleReportViewChange);
      map.on('moveend', () => {
        reportViewChange();
        void updateNodeVisibilityForVisibleClusters('moveend-node-visibility');
      });
      map.on('zoomend', () => {
        reportViewChange();
        void updateNodeVisibilityForVisibleClusters('zoomend-node-visibility');
      });
      map.on('resize', reportViewChange);

      map.on('error', (event) => {
        const message = event?.error?.message || 'MapLibre reported a map loading error.';
        markLayerSetupError('map-error', message);
        reportLayerDiagnostics(map);
        setErrorMessage(message);
      });

      const resizeObserver = new ResizeObserver(() => {
        map.resize();
        reportViewChange();
      });

      resizeObserver.observe(containerRef.current);

      return () => {
        if (frameRef.current) {
          window.cancelAnimationFrame(frameRef.current);
          frameRef.current = null;
        }

        resizeObserver.disconnect();
        map.remove();
        mapRef.current = null;
      };
    } catch (error) {
      markLayerSetupError('construction-error', error);
      setErrorMessage(error instanceof Error ? error.message : String(error));
      return undefined;
    }
  }, [center, graph, interactive, nodeFeatureCollection, onMapReady, onViewChange, routeFeatureCollection, styleConfig, zoom]);

  return (
    <div className={`relative h-full min-h-[420px] w-full overflow-hidden bg-slate-950 ${className}`}>
      <div ref={containerRef} className="absolute inset-0" aria-label="MapLibre preview map" />

      {showDiagnostics ? (
        <div className="absolute left-4 top-4 z-10 max-w-sm rounded-2xl border border-white/20 bg-slate-950/88 p-4 text-xs text-white shadow-2xl backdrop-blur">
          <div className="mb-2 text-sm font-semibold text-emerald-200">
            MapLibre source/layer lifecycle diagnostics
          </div>
          <p className="mb-3 leading-relaxed text-slate-200">
            Development-only test path. Gold routes and cyan nodes are rendered by MapLibre
            GeoJSON sources/layers.
          </p>

          <dl className="grid grid-cols-[auto,1fr] gap-x-3 gap-y-1 leading-relaxed">
            <dt className="text-slate-400">Style</dt>
            <dd>{styleConfig.label}</dd>

            <dt className="text-slate-400">Loaded</dt>
            <dd>{viewState.loaded ? 'yes' : 'loading'}</dd>

            <dt className="text-slate-400">Style loaded</dt>
            <dd>{layerDiagnostics.styleLoaded ? 'yes' : 'no'}</dd>

            <dt className="text-slate-400">Setup phase</dt>
            <dd>{layerDiagnostics.lastSetupPhase}</dd>

            <dt className="text-slate-400">Setup attempts</dt>
            <dd>{layerDiagnostics.setupAttempts}</dd>

            <dt className="text-slate-400">Setup error</dt>
            <dd>{layerDiagnostics.setupError || 'none'}</dd>

            <dt className="text-slate-400">View</dt>
            <dd>{viewMode || 'n/a'}</dd>

            <dt className="text-slate-400">Center</dt>
            <dd>
              {formatNumber(viewState.center?.[0])}, {formatNumber(viewState.center?.[1])}
            </dd>

            <dt className="text-slate-400">Zoom</dt>
            <dd>{formatNumber(viewState.zoom, 2)}</dd>

            <dt className="text-slate-400">Route features</dt>
            <dd>
              {routeFeatureCount} / {projectableRouteCount} source
            </dd>

            <dt className="text-slate-400">Route source</dt>
            <dd>{layerDiagnostics.routeSourceExists ? 'yes' : 'no'}</dd>

            <dt className="text-slate-400">Route layer</dt>
            <dd>{layerDiagnostics.routeLayerExists ? 'yes' : 'no'}</dd>

            <dt className="text-slate-400">Route hit layer</dt>
            <dd>{layerDiagnostics.routeHitLayerExists ? 'yes' : 'no'}</dd>

            <dt className="text-slate-400">Selected route layer</dt>
            <dd>{layerDiagnostics.selectedRouteLayerExists ? 'yes' : 'no'}</dd>

            <dt className="text-slate-400">Routes rendered</dt>
            <dd>{layerDiagnostics.renderedRouteCount}</dd>

            <dt className="text-slate-400">Route hits rendered</dt>
            <dd>{layerDiagnostics.renderedRouteHitCount}</dd>

            <dt className="text-slate-400">Aggregated route source</dt>
            <dd>{layerDiagnostics.aggregatedRouteSourceExists ? 'yes' : 'no'}</dd>

            <dt className="text-slate-400">Aggregated route layer</dt>
            <dd>{layerDiagnostics.aggregatedRouteLayerExists ? 'yes' : 'no'}</dd>

            <dt className="text-slate-400">Aggregated route hit layer</dt>
            <dd>{layerDiagnostics.aggregatedRouteHitLayerExists ? 'yes' : 'no'}</dd>

            <dt className="text-slate-400">Selected aggregated route layer</dt>
            <dd>{layerDiagnostics.selectedAggregatedRouteLayerExists ? 'yes' : 'no'}</dd>

            <dt className="text-slate-400">Aggregated routes</dt>
            <dd>{layerDiagnostics.aggregatedRouteCount || 0}</dd>

            <dt className="text-slate-400">Aggregated routes rendered</dt>
            <dd>{layerDiagnostics.renderedAggregatedRouteCount || 0}</dd>

            <dt className="text-slate-400">Aggregated route hits rendered</dt>
            <dd>{layerDiagnostics.renderedAggregatedRouteHitCount || 0}</dd>

            <dt className="text-slate-400">Internal clustered routes skipped</dt>
            <dd>{layerDiagnostics.internalClusterRouteCount || 0}</dd>

            <dt className="text-slate-400">Last aggregated route click</dt>
            <dd>{layerDiagnostics.lastAggregatedRouteClickId || 'none'}</dd>

            <dt className="text-slate-400">Aggregated click members</dt>
            <dd>{layerDiagnostics.lastAggregatedRouteClickMemberCount || 0}</dd>

            <dt className="text-slate-400">Aggregated click weight</dt>
            <dd>{layerDiagnostics.lastAggregatedRouteClickWeight || 0}</dd>

            <dt className="text-slate-400">Node features</dt>
            <dd>
              {nodeFeatureCount} / {projectableNodeCount} source
            </dd>

            <dt className="text-slate-400">Node source</dt>
            <dd>{layerDiagnostics.nodeSourceExists ? 'yes' : 'no'}</dd>

            <dt className="text-slate-400">Node layer</dt>
            <dd>{layerDiagnostics.nodeLayerExists ? 'yes' : 'no'}</dd>

            <dt className="text-slate-400">Selected node layer</dt>
            <dd>{layerDiagnostics.selectedNodeLayerExists ? 'yes' : 'no'}</dd>

            <dt className="text-slate-400">Nodes rendered</dt>
            <dd>{layerDiagnostics.renderedNodeCount}</dd>

            <dt className="text-slate-400">Dynamic cluster features</dt>
            <dd>{nodeFeatureCount} node source features</dd>

            <dt className="text-slate-400">Dynamic cluster source</dt>
            <dd>{layerDiagnostics.dynamicClusterSourceExists ? 'yes' : 'no'}</dd>

            <dt className="text-slate-400">Dynamic cluster layer</dt>
            <dd>{layerDiagnostics.dynamicClusterLayerExists ? 'yes' : 'no'}</dd>

            <dt className="text-slate-400">Dynamic cluster labels</dt>
            <dd>{layerDiagnostics.dynamicClusterLabelLayerExists ? 'yes' : 'no'}</dd>

            <dt className="text-slate-400">Selected cluster layer</dt>
            <dd>{layerDiagnostics.selectedDynamicClusterLayerExists ? 'yes' : 'no'}</dd>

            <dt className="text-slate-400">Dynamic clusters rendered</dt>
            <dd>{layerDiagnostics.renderedDynamicClusterCount}</dd>

            <dt className="text-slate-400">Cluster labels rendered</dt>
            <dd>{layerDiagnostics.renderedDynamicClusterLabelCount || 0}</dd>

            <dt className="text-slate-400">Aggregated route width basis</dt>
            <dd>total represented letters</dd>

            <dt className="text-slate-400">Hidden clustered nodes</dt>
            <dd>{layerDiagnostics.hiddenClusterMemberCount || 0}</dd>

            <dt className="text-slate-400">Last cluster click</dt>
            <dd>{layerDiagnostics.lastClusterClickId || 'none'}</dd>

            <dt className="text-slate-400">Cluster point count</dt>
            <dd>{layerDiagnostics.lastClusterClickPointCount || 0}</dd>

            <dt className="text-slate-400">Cluster leaves read</dt>
            <dd>{layerDiagnostics.lastClusterClickLeafCount || 0}</dd>

            <dt className="text-slate-400">Cluster click error</dt>
            <dd>{layerDiagnostics.lastClusterClickError || 'none'}</dd>
          </dl>

          <p className="mt-3 leading-relaxed text-slate-300">
            This is still not the migrated production overlay. It now reports MapLibre source,
            layer, selected-layer, setup-phase, and rendered-feature diagnostics. The pink dynamic cluster circles are generated from the current MapLibre node features; cluster clicks now attempt to read MapLibre cluster leaves and open the existing Inspector. Node hiding is now diagnostic and based on currently rendered MapLibre clusters. Routes are now rebuilt into diagnostic visible-endpoint aggregate routes, so edges combine between visible nodes and cluster centers instead of being merely de-emphasized. Playback highlighting, hover cards, final route styling, route labels, and production export parity remain out of scope.
          </p>
        </div>
      ) : null}

      {errorMessage ? (
        <div className="absolute bottom-4 left-4 z-10 max-w-md rounded-xl border border-red-300/60 bg-red-950/90 p-3 text-sm text-red-100 shadow-xl">
          <div className="font-semibold">MapLibre test map error</div>
          <div>{errorMessage}</div>
        </div>
      ) : null}
    </div>
  );
}

export default MapLibreMapStage;
