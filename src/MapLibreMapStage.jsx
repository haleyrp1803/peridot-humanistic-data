import { useEffect, useMemo, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { getMapLibreStyleConfig } from './mapStyleConfig';

const DEFAULT_CENTER = [12.5, 43.4];
const DEFAULT_ZOOM = 4.8;
const MAX_PROBE_POINTS = 30;
const MAX_GEOJSON_ROUTES = 75;
const ROUTE_SOURCE_ID = 'peridot-route-probe-source';
const ROUTE_LAYER_ID = 'peridot-route-probe-layer';

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

function hasUsableLngLat(node) {
  return (
    Number.isFinite(node?.lon) &&
    Number.isFinite(node?.lat) &&
    !(node.lat === 0 && node.lon === 0)
  );
}

function buildProjectableNodeMap(graph) {
  const nodeMap = new Map();

  if (!Array.isArray(graph?.nodes)) return nodeMap;

  graph.nodes.forEach((node) => {
    if (node?.id && hasUsableLngLat(node)) {
      nodeMap.set(node.id, node);
    }
  });

  return nodeMap;
}

function buildProjectionProbePoints(map, graph) {
  if (!map || !Array.isArray(graph?.nodes)) return [];

  return graph.nodes
    .filter(hasUsableLngLat)
    .slice(0, MAX_PROBE_POINTS)
    .map((node) => {
      const point = map.project([node.lon, node.lat]);

      return {
        id: node.id,
        label: node.label || node.id,
        degree: Number(node.degree) || 0,
        lng: node.lon,
        lat: node.lat,
        x: point.x,
        y: point.y,
      };
    });
}

function buildRouteProbeFeatureCollection(graph) {
  const emptyCollection = {
    type: 'FeatureCollection',
    features: [],
  };

  if (!Array.isArray(graph?.edges)) return emptyCollection;

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
    ...emptyCollection,
    features,
  };
}

function countProjectableRoutes(graph) {
  if (!Array.isArray(graph?.edges)) return 0;

  const nodeMap = buildProjectableNodeMap(graph);

  return graph.edges.filter((edge) => {
    const sourceId = edge?.sourcePlaceId || edge?.source;
    const targetId = edge?.targetPlaceId || edge?.target;
    return nodeMap.has(sourceId) && nodeMap.has(targetId);
  }).length;
}

function ensureRouteProbeLayer(map, featureCollection) {
  if (!map || !map.isStyleLoaded()) return false;

  const existingSource = map.getSource(ROUTE_SOURCE_ID);

  if (existingSource) {
    existingSource.setData(featureCollection);
    return true;
  }

  map.addSource(ROUTE_SOURCE_ID, {
    type: 'geojson',
    data: featureCollection,
  });

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

  return true;
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
  onMapReady,
  onViewChange,
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const frameRef = useRef(null);
  const pendingRouteDataRef = useRef(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [viewState, setViewState] = useState(() => ({
    center,
    zoom,
    bearing: 0,
    pitch: 0,
    loaded: false,
  }));
  const [probePoints, setProbePoints] = useState([]);
  const [routeFeatureCount, setRouteFeatureCount] = useState(0);

  const styleConfig = useMemo(() => getMapLibreStyleConfig(styleId), [styleId]);

  const routeFeatureCollection = useMemo(() => buildRouteProbeFeatureCollection(graph), [graph]);

  const projectableNodeCount = useMemo(
    () => (Array.isArray(graph?.nodes) ? graph.nodes.filter(hasUsableLngLat).length : 0),
    [graph],
  );

  const projectableRouteCount = useMemo(() => countProjectableRoutes(graph), [graph]);

  const updateProjectionProbePoints = () => {
    const map = mapRef.current;
    setProbePoints(buildProjectionProbePoints(map, graph));
  };

  const updateRouteLayer = (featureCollection = routeFeatureCollection) => {
    const map = mapRef.current;
    pendingRouteDataRef.current = featureCollection;
    setRouteFeatureCount(featureCollection.features.length);

    if (!map) return;

    ensureRouteProbeLayer(map, featureCollection);
  };

  useEffect(() => {
    updateProjectionProbePoints();
    updateRouteLayer(routeFeatureCollection);
  }, [graph, routeFeatureCollection]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return undefined;

    const reportViewChange = () => {
      const map = mapRef.current;
      if (!map) return;

      const nextViewState = readMapViewState(map);
      setViewState(nextViewState);
      setProbePoints(buildProjectionProbePoints(map, graph));
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
        reportViewChange();
      });

      map.on('styledata', () => {
        ensureRouteProbeLayer(map, pendingRouteDataRef.current || routeFeatureCollection);
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
  }, [center, graph, interactive, onMapReady, onViewChange, routeFeatureCollection, styleConfig, zoom]);

  return (
    <div className={`relative h-full min-h-[420px] w-full overflow-hidden bg-slate-950 ${className}`}>
      <div ref={containerRef} className="absolute inset-0" aria-label="MapLibre preview map" />

      <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
        {probePoints.map((point) => (
          <g key={point.id} transform={`translate(${point.x}, ${point.y})`}>
            <circle r="5" fill="#8af06b" stroke="#123524" strokeWidth="1.5" opacity="0.95" />
            <text
              x="8"
              y="-8"
              fill="#d9fdd3"
              stroke="#123524"
              strokeWidth="2"
              paintOrder="stroke"
              fontSize="11"
              fontWeight="700"
            >
              {point.label}
            </text>
          </g>
        ))}
      </svg>

      {showDiagnostics ? (
        <div className="absolute left-4 top-4 z-10 max-w-sm rounded-2xl border border-white/20 bg-slate-950/88 p-4 text-xs text-white shadow-2xl backdrop-blur">
          <div className="mb-2 text-sm font-semibold text-emerald-200">MapLibre GeoJSON route preview</div>
          <p className="mb-3 leading-relaxed text-slate-200">
            Development-only test path. Gold routes are now rendered by a MapLibre GeoJSON
            source/layer. Green points remain SVG projection probes.
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
            <dt className="text-slate-400">Points</dt>
            <dd>
              {probePoints.length} / {projectableNodeCount} shown
            </dd>
            <dt className="text-slate-400">Routes</dt>
            <dd>
              {routeFeatureCount} / {projectableRouteCount} rendered
            </dd>
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
