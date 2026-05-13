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

const DEFAULT_CENTER = [12.5, 43.4];
const DEFAULT_ZOOM = 4.8;
const ROUTE_SOURCE_ID = 'peridot-route-probe-source';
const ROUTE_LAYER_ID = 'peridot-route-probe-layer';
const ROUTE_HIT_LAYER_ID = 'peridot-route-probe-hit-layer';
const NODE_SOURCE_ID = 'peridot-node-probe-source';
const NODE_LAYER_ID = 'peridot-node-probe-layer';
const SELECTED_ROUTE_LAYER_ID = 'peridot-selected-route-filter-layer';
const SELECTED_NODE_LAYER_ID = 'peridot-selected-node-filter-layer';

const EMPTY_FILTER = ['==', ['get', 'id'], '__peridot-no-selected-feature__'];

function formatNumber(value, digits = 4) {
  if (!Number.isFinite(value)) return 'n/a';
  return value.toFixed(digits);
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
  if (!map || !map.isStyleLoaded()) return false;

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
    map.addLayer({
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
    });
  }

  if (!map.getLayer(ROUTE_HIT_LAYER_ID)) {
    map.addLayer({
      id: ROUTE_HIT_LAYER_ID,
      type: 'line',
      source: ROUTE_SOURCE_ID,
      paint: {
        'line-color': '#ffffff',
        'line-opacity': 0.01,
        'line-width': 24,
      },
    });
  }

  return Boolean(
    map.getSource(ROUTE_SOURCE_ID)
      && map.getLayer(ROUTE_LAYER_ID)
      && map.getLayer(ROUTE_HIT_LAYER_ID)
  );
}

function ensureNodeProbeLayer(map, featureCollection) {
  if (!map || !map.isStyleLoaded()) return false;

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
    map.addLayer({
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
    });
  }

  if (map.getLayer(NODE_LAYER_ID)) {
    map.moveLayer(NODE_LAYER_ID);
  }

  return Boolean(map.getSource(NODE_SOURCE_ID) && map.getLayer(NODE_LAYER_ID));
}

function ensureSelectedFilterLayers(map) {
  if (!map || !map.isStyleLoaded()) return false;

  if (map.getSource(ROUTE_SOURCE_ID) && !map.getLayer(SELECTED_ROUTE_LAYER_ID)) {
    map.addLayer({
      id: SELECTED_ROUTE_LAYER_ID,
      type: 'line',
      source: ROUTE_SOURCE_ID,
      filter: EMPTY_FILTER,
      paint: {
        'line-color': '#fff7a8',
        'line-opacity': 0.98,
        'line-width': 10,
      },
    });
  }

  if (map.getSource(NODE_SOURCE_ID) && !map.getLayer(SELECTED_NODE_LAYER_ID)) {
    map.addLayer({
      id: SELECTED_NODE_LAYER_ID,
      type: 'circle',
      source: NODE_SOURCE_ID,
      filter: EMPTY_FILTER,
      paint: {
        'circle-radius': 27,
        'circle-color': '#fff7a8',
        'circle-opacity': 0.34,
        'circle-stroke-color': '#ffffff',
        'circle-stroke-width': 5,
        'circle-stroke-opacity': 1,
      },
    });
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

  return Boolean(
    map.getLayer(SELECTED_ROUTE_LAYER_ID)
      || map.getLayer(SELECTED_NODE_LAYER_ID)
  );
}

function selectedIdFilter(id) {
  return ['==', ['get', 'id'], String(id || '')];
}

function clearSelectedFilterLayers(map) {
  if (!map) return;

  if (map.getLayer(SELECTED_ROUTE_LAYER_ID)) {
    map.setFilter(SELECTED_ROUTE_LAYER_ID, EMPTY_FILTER);
  }

  if (map.getLayer(SELECTED_NODE_LAYER_ID)) {
    map.setFilter(SELECTED_NODE_LAYER_ID, EMPTY_FILTER);
  }
}

function setSelectedNodeFilter(map, id) {
  if (!ensureSelectedFilterLayers(map)) return;

  if (map.getLayer(SELECTED_NODE_LAYER_ID)) {
    map.setFilter(SELECTED_NODE_LAYER_ID, selectedIdFilter(id));
  }

  if (map.getLayer(SELECTED_ROUTE_LAYER_ID)) {
    map.setFilter(SELECTED_ROUTE_LAYER_ID, EMPTY_FILTER);
  }
}

function setSelectedRouteFilter(map, id) {
  if (!ensureSelectedFilterLayers(map)) return;

  if (map.getLayer(SELECTED_ROUTE_LAYER_ID)) {
    map.setFilter(SELECTED_ROUTE_LAYER_ID, selectedIdFilter(id));
  }

  if (map.getLayer(SELECTED_NODE_LAYER_ID)) {
    map.setFilter(SELECTED_NODE_LAYER_ID, EMPTY_FILTER);
  }
}

function readNodeProbeLayerDiagnostics(map) {
  if (!map) {
    return {
      sourceExists: false,
      layerExists: false,
      renderedCount: 0,
    };
  }

  const sourceExists = Boolean(map.getSource(NODE_SOURCE_ID));
  const layerExists = Boolean(map.getLayer(NODE_LAYER_ID));
  let renderedCount = 0;

  if (layerExists) {
    try {
      renderedCount = map.queryRenderedFeatures({ layers: [NODE_LAYER_ID] }).length;
    } catch {
      renderedCount = 0;
    }
  }

  return {
    sourceExists,
    layerExists,
    renderedCount,
  };
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

function findGraphNodeForFeature(graph, feature) {
  const nodeId = featureProperty(feature, 'id') || String(feature?.id || '');

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

function ensureAndReportNodeProbeLayer(map, featureCollection, setNodeLayerDiagnostics) {
  const ready = ensureNodeProbeLayer(map, featureCollection);
  setNodeLayerDiagnostics(readNodeProbeLayerDiagnostics(map));
  return ready;
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
  const clickHandlersRef = useRef({
    graph,
    handleNodeClick,
    handleEdgeClick,
    handleBlankMapClick,
  });
  const featureClickInProgressRef = useRef(false);

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
  const [nodeLayerDiagnostics, setNodeLayerDiagnostics] = useState(() => ({
    sourceExists: false,
    layerExists: false,
    renderedCount: 0,
  }));

  const styleConfig = useMemo(() => getMapLibreStyleConfig(styleId), [styleId]);

  const routeFeatureCollection = useMemo(() => buildRouteProbeFeatureCollection(graph), [graph]);
  const nodeFeatureCollection = useMemo(() => buildNodeProbeFeatureCollection(graph), [graph]);

  const projectableNodeCount = useMemo(
    () => (Array.isArray(graph?.nodes) ? graph.nodes.filter(hasUsableLngLat).length : 0),
    [graph],
  );
  const projectableRouteCount = useMemo(() => countProjectableRoutes(graph), [graph]);

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

    if (selection.kind === 'route') {
      setSelectedRouteFilter(map, selection.id);
    }
  };

  const updateRouteLayer = (featureCollection = routeFeatureCollection) => {
    const map = mapRef.current;
    pendingRouteDataRef.current = featureCollection;
    setRouteFeatureCount(featureCollection.features.length);

    if (!map) return;

    ensureRouteProbeLayer(map, featureCollection);
    ensureSelectedFilterLayers(map);
    reapplySelectedFilters(map);
  };

  const updateNodeLayer = (featureCollection = nodeFeatureCollection) => {
    const map = mapRef.current;
    pendingNodeDataRef.current = featureCollection;
    setNodeFeatureCount(featureCollection.features.length);

    if (!map) return;

    ensureAndReportNodeProbeLayer(map, featureCollection, setNodeLayerDiagnostics);
    ensureSelectedFilterLayers(map);
    reapplySelectedFilters(map);
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
        ensureRouteProbeLayer(map, pendingRouteDataRef.current || routeFeatureCollection);
        ensureAndReportNodeProbeLayer(
          map,
          pendingNodeDataRef.current || nodeFeatureCollection,
          setNodeLayerDiagnostics,
        );
        ensureSelectedFilterLayers(map);
        reapplySelectedFilters(map);
        reportViewChange();
      });

      map.on('styledata', () => {
        ensureRouteProbeLayer(map, pendingRouteDataRef.current || routeFeatureCollection);
        ensureAndReportNodeProbeLayer(
          map,
          pendingNodeDataRef.current || nodeFeatureCollection,
          setNodeLayerDiagnostics,
        );
        ensureSelectedFilterLayers(map);
        reapplySelectedFilters(map);
      });

      const markFeatureClick = () => {
        featureClickInProgressRef.current = true;
        window.setTimeout(() => {
          featureClickInProgressRef.current = false;
        }, 0);
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
        event?.preventDefault?.();
        event?.originalEvent?.stopPropagation?.();
        currentHandleNodeClick(node, buildMapLibreClickPoint(event));
      };

      const handleMapLibreRouteClick = (event) => {
        const nodeHits = map.queryRenderedFeatures(event.point, {
          layers: [NODE_LAYER_ID].filter((layerId) => map.getLayer(layerId)),
        });

        if (nodeHits.length) return;

        const feature = event?.features?.[0];
        const { graph: currentGraph, handleEdgeClick: currentHandleEdgeClick } = clickHandlersRef.current;
        const edge = findGraphEdgeForFeature(currentGraph, feature);
        const selectedId = featureProperty(feature, 'id') || String(feature?.id || '');

        if (!edge || !selectedId || typeof currentHandleEdgeClick !== 'function') return;

        markFeatureClick();
        selectedFeatureRef.current = { kind: 'route', id: selectedId };
        setSelectedRouteFilter(map, selectedId);
        event?.preventDefault?.();
        event?.originalEvent?.stopPropagation?.();
        currentHandleEdgeClick(edge, buildMapLibreClickPoint(event));
      };

      const handleMapLibreBlankClick = (event) => {
        if (featureClickInProgressRef.current) return;

        const { handleBlankMapClick: currentHandleBlankMapClick } = clickHandlersRef.current;
        if (typeof currentHandleBlankMapClick !== 'function') return;

        const hitFeatures = map.queryRenderedFeatures(event.point, {
          layers: [NODE_LAYER_ID, ROUTE_HIT_LAYER_ID, ROUTE_LAYER_ID].filter((layerId) =>
            map.getLayer(layerId),
          ),
        });

        if (hitFeatures.length) return;

        selectedFeatureRef.current = { kind: null, id: null };
        clearSelectedFilterLayers(map);
        currentHandleBlankMapClick();
      };

      map.on('click', NODE_LAYER_ID, handleMapLibreNodeClick);
      map.on('click', ROUTE_HIT_LAYER_ID, handleMapLibreRouteClick);
      map.on('click', handleMapLibreBlankClick);

      const setPointerCursor = () => {
        map.getCanvas().style.cursor = 'pointer';
      };

      const clearPointerCursor = () => {
        map.getCanvas().style.cursor = '';
      };

      map.on('mouseenter', NODE_LAYER_ID, setPointerCursor);
      map.on('mouseleave', NODE_LAYER_ID, clearPointerCursor);
      map.on('mouseenter', ROUTE_HIT_LAYER_ID, setPointerCursor);
      map.on('mouseleave', ROUTE_HIT_LAYER_ID, clearPointerCursor);

      map.on('idle', () => {
        ensureAndReportNodeProbeLayer(
          map,
          pendingNodeDataRef.current || nodeFeatureCollection,
          setNodeLayerDiagnostics,
        );
        ensureSelectedFilterLayers(map);
        reapplySelectedFilters(map);
      });

      map.on('move', scheduleReportViewChange);
      map.on('zoom', scheduleReportViewChange);
      map.on('rotate', scheduleReportViewChange);
      map.on('pitch', scheduleReportViewChange);
      map.on('moveend', reportViewChange);
      map.on('zoomend', reportViewChange);
      map.on('resize', reportViewChange);

      map.on('error', (event) => {
        const message = event?.error?.message || 'MapLibre reported a map loading error.';
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
            MapLibre GeoJSON node/route preview + click routing
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
            <dt className="text-slate-400">View</dt>
            <dd>{viewMode || 'n/a'}</dd>
            <dt className="text-slate-400">Center</dt>
            <dd>
              {formatNumber(viewState.center?.[0])}, {formatNumber(viewState.center?.[1])}
            </dd>
            <dt className="text-slate-400">Zoom</dt>
            <dd>{formatNumber(viewState.zoom, 2)}</dd>
            <dt className="text-slate-400">Routes</dt>
            <dd>
              {routeFeatureCount} / {projectableRouteCount} rendered
            </dd>
            <dt className="text-slate-400">GeoJSON nodes</dt>
            <dd>
              {nodeFeatureCount} / {projectableNodeCount} source
            </dd>
            <dt className="text-slate-400">Node source</dt>
            <dd>{nodeLayerDiagnostics.sourceExists ? 'yes' : 'no'}</dd>
            <dt className="text-slate-400">Node layer</dt>
            <dd>{nodeLayerDiagnostics.layerExists ? 'yes' : 'no'}</dd>
            <dt className="text-slate-400">Nodes rendered</dt>
            <dd>{nodeLayerDiagnostics.renderedCount}</dd>
          </dl>
          <p className="mt-3 leading-relaxed text-slate-300">
            This is still not the migrated production overlay. It does not provide inspector hit
            targets, clusters, playback highlighting, or final route styling.
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
