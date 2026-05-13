export const ROUTE_SOURCE_ID = 'peridot-route-probe-source';
export const ROUTE_LAYER_ID = 'peridot-route-probe-layer';
export const ROUTE_HIT_LAYER_ID = 'peridot-route-probe-hit-layer';

export const NODE_SOURCE_ID = 'peridot-node-probe-source';
export const NODE_LAYER_ID = 'peridot-node-probe-layer';

export const DYNAMIC_CLUSTER_SOURCE_ID = 'peridot-dynamic-cluster-source';
export const DYNAMIC_CLUSTER_LAYER_ID = 'peridot-dynamic-cluster-circles';
export const DYNAMIC_CLUSTER_LABEL_LAYER_ID = 'peridot-dynamic-cluster-labels';

export const AGGREGATED_ROUTE_SOURCE_ID = 'peridot-visible-aggregated-route-source';
export const AGGREGATED_ROUTE_LAYER_ID = 'peridot-visible-aggregated-route-layer';
export const AGGREGATED_ROUTE_HIT_LAYER_ID = 'peridot-visible-aggregated-route-hit-layer';

export const SELECTED_ROUTE_LAYER_ID = 'peridot-selected-route-filter-layer';
export const SELECTED_NODE_LAYER_ID = 'peridot-selected-node-filter-layer';
export const SELECTED_AGGREGATED_ROUTE_LAYER_ID = 'peridot-selected-visible-aggregated-route-layer';
export const SELECTED_DYNAMIC_CLUSTER_LAYER_ID = 'peridot-selected-dynamic-cluster-circles';

export const EMPTY_SELECTED_FILTER = ['==', ['get', 'id'], '__peridot-no-selected-feature__'];

export function selectedIdFilter(id) {
  return ['==', ['get', 'id'], String(id || '')];
}

export function buildRouteLayerDefinition() {
  return {
    id: ROUTE_LAYER_ID,
    type: 'line',
    source: ROUTE_SOURCE_ID,
    paint: {
      'line-color': '#f5b942',
      'line-opacity': 0.82,
      'line-width': [
        'interpolate',
        ['linear'],
        ['coalesce', ['get', 'count'], 1],
        1,
        1,
        10,
        2,
        50,
        4,
        150,
        7,
      ],
    },
  };
}

export function buildRouteHitLayerDefinition() {
  return {
    id: ROUTE_HIT_LAYER_ID,
    type: 'line',
    source: ROUTE_SOURCE_ID,
    paint: {
      'line-color': '#ffffff',
      'line-opacity': 0.01,
      'line-width': 24,
    },
  };
}

export function buildNodeLayerDefinition() {
  return {
    id: NODE_LAYER_ID,
    type: 'circle',
    source: NODE_SOURCE_ID,
    paint: {
      'circle-radius': 18,
      'circle-color': '#00e5ff',
      'circle-opacity': 0.95,
      'circle-stroke-color': '#ffffff',
      'circle-stroke-width': 4,
    },
  };
}

export function buildSelectedRouteLayerDefinition() {
  return {
    id: SELECTED_ROUTE_LAYER_ID,
    type: 'line',
    source: ROUTE_SOURCE_ID,
    filter: EMPTY_SELECTED_FILTER,
    paint: {
      'line-color': '#fff7a8',
      'line-opacity': 0.98,
      'line-width': 10,
    },
  };
}

export function buildSelectedNodeLayerDefinition() {
  return {
    id: SELECTED_NODE_LAYER_ID,
    type: 'circle',
    source: NODE_SOURCE_ID,
    filter: EMPTY_SELECTED_FILTER,
    paint: {
      'circle-radius': 27,
      'circle-color': '#fff7a8',
      'circle-opacity': 0.34,
      'circle-stroke-color': '#ffffff',
      'circle-stroke-width': 5,
      'circle-stroke-opacity': 1,
    },
  };
}
