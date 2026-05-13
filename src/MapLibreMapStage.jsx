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
  NODE_LAYER_ID,
  NODE_SOURCE_ID,
  ROUTE_HIT_LAYER_ID,
  ROUTE_LAYER_ID,
  ROUTE_SOURCE_ID,
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

function queryRenderedFeatureCount(map, layerId) {
  if (!map || !map.getLayer(layerId)) return 0;

  try {
    return map.queryRenderedFeatures({ layers: [layerId] }).length;
  } catch {
    return 0;
  }
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
  if (!map || !readStyleLoaded(map)) return false;

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

function ensureNodeProbeLayer(map, featureCollection) {
  if (!map || !readStyleLoaded(map)) return false;

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

function ensureSelectedFilterLayers(map) {
  if (!map || !readStyleLoaded(map)) return false;

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
}

function setSelectedRouteFilter(map, id) {
  if (!ensureSelectedFilterLayers(map)) return;

  if (map.getLayer(SELECTED_ROUTE_LAYER_ID)) {
    map.setFilter(SELECTED_ROUTE_LAYER_ID, selectedIdFilter(id));
  }

  if (map.getLayer(SELECTED_NODE_LAYER_ID)) {
    map.setFilter(SELECTED_NODE_LAYER_ID, EMPTY_SELECTED_FILTER);
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
      renderedRouteCount: 0,
      renderedRouteHitCount: 0,
      renderedNodeCount: 0,
    };
  }

  const routeLayerExists = Boolean(map.getLayer(ROUTE_LAYER_ID));
  const routeHitLayerExists = Boolean(map.getLayer(ROUTE_HIT_LAYER_ID));
  const nodeLayerExists = Boolean(map.getLayer(NODE_LAYER_ID));

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
  const layerSetupDiagnosticsRef = useRef({ attempts: 0, phase: 'not-started', error: '' });
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

    if (!map) {
      reportLayerDiagnostics(null);
      return;
    }

    markLayerSetupPhase('route-data-update');

    try {
      ensureRouteProbeLayer(map, featureCollection);
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
          layers: [NODE_LAYER_ID, ROUTE_HIT_LAYER_ID, ROUTE_LAYER_ID].filter((layerId) =>
            map.getLayer(layerId),
          ),
        });

        if (hitFeatures.length) return;

        selectedFeatureRef.current = { kind: null, id: null };
        clearSelectedFilterLayers(map);
        reportLayerDiagnostics(map);
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
        markLayerSetupPhase('idle');

        try {
          ensureAndReportNodeProbeLayer(
            map,
            pendingNodeDataRef.current || nodeFeatureCollection,
            setLayerDiagnostics,
            layerSetupDiagnosticsRef.current,
          );
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
      map.on('moveend', reportViewChange);
      map.on('zoomend', reportViewChange);
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
          </dl>

          <p className="mt-3 leading-relaxed text-slate-300">
            This is still not the migrated production overlay. It now reports MapLibre source,
            layer, selected-layer, setup-phase, and rendered-feature diagnostics; clusters,
            playback highlighting, hover cards, and final route styling remain out of scope.
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
