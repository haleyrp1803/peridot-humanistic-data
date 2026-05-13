import { useEffect, useMemo, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { getMapLibreStyleConfig } from './mapStyleConfig';

const DEFAULT_CENTER = [12.5, 43.4];
const DEFAULT_ZOOM = 4.8;
const MAX_PROBE_POINTS = 30;
const MAX_PROBE_ROUTES = 30;

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

function buildProjectionProbeRoutes(map, graph) {
  if (!map || !Array.isArray(graph?.edges)) return [];

  const projectableNodes = buildProjectableNodeMap(graph);

  return graph.edges
    .map((edge) => {
      const sourceId = edge?.sourcePlaceId || edge?.source;
      const targetId = edge?.targetPlaceId || edge?.target;
      const source = projectableNodes.get(sourceId);
      const target = projectableNodes.get(targetId);

      if (!source || !target) return null;

      const a = map.project([source.lon, source.lat]);
      const b = map.project([target.lon, target.lat]);

      return {
        id: edge.id || `${sourceId}-->${targetId}`,
        sourceLabel: edge.sourceLabel || source.label || sourceId,
        targetLabel: edge.targetLabel || target.label || targetId,
        count: Number(edge.count) || 0,
        x1: a.x,
        y1: a.y,
        x2: b.x,
        y2: b.y,
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.count - a.count)
    .slice(0, MAX_PROBE_ROUTES);
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
  const [errorMessage, setErrorMessage] = useState('');
  const [viewState, setViewState] = useState(() => ({
    center,
    zoom,
    bearing: 0,
    pitch: 0,
    loaded: false,
  }));
  const [probePoints, setProbePoints] = useState([]);
  const [probeRoutes, setProbeRoutes] = useState([]);

  const styleConfig = useMemo(() => getMapLibreStyleConfig(styleId), [styleId]);

  const projectableNodeCount = useMemo(
    () => (Array.isArray(graph?.nodes) ? graph.nodes.filter(hasUsableLngLat).length : 0),
    [graph],
  );

  const projectableRouteCount = useMemo(() => {
    if (!Array.isArray(graph?.edges)) return 0;
    const nodeMap = buildProjectableNodeMap(graph);
    return graph.edges.filter((edge) => {
      const sourceId = edge?.sourcePlaceId || edge?.source;
      const targetId = edge?.targetPlaceId || edge?.target;
      return nodeMap.has(sourceId) && nodeMap.has(targetId);
    }).length;
  }, [graph]);

  const updateProjectionProbes = () => {
    const map = mapRef.current;
    setProbePoints(buildProjectionProbePoints(map, graph));
    setProbeRoutes(buildProjectionProbeRoutes(map, graph));
  };

  useEffect(() => {
    updateProjectionProbes();
  }, [graph]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return undefined;

    const reportViewChange = () => {
      const map = mapRef.current;
      if (!map) return;

      const nextViewState = readMapViewState(map);
      setViewState(nextViewState);
      setProbePoints(buildProjectionProbePoints(map, graph));
      setProbeRoutes(buildProjectionProbeRoutes(map, graph));
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
        reportViewChange();
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
  }, [center, graph, interactive, onMapReady, onViewChange, styleConfig, zoom]);

  return (
    <div className={`relative h-full w-full overflow-hidden bg-[#101c1b] ${className}`}>
      <div ref={containerRef} className="absolute inset-0" />

      <svg
        className="pointer-events-none absolute inset-0 z-10 h-full w-full"
        aria-hidden="true"
      >
        <g opacity="0.78">
          {probeRoutes.map((route) => (
            <line
              key={route.id}
              x1={route.x1}
              y1={route.y1}
              x2={route.x2}
              y2={route.y2}
              stroke="#f3d78f"
              strokeWidth={Math.max(1.4, Math.min(5.2, 1.4 + Math.sqrt(route.count || 1) * 0.34))}
              strokeLinecap="round"
            />
          ))}
        </g>

        <g>
          {probePoints.map((point) => (
            <g key={point.id} transform={`translate(${point.x}, ${point.y})`}>
              <circle r="6" fill="#8be36d" stroke="#102016" strokeWidth="2" />
              <text
                x="9"
                y="4"
                fill="#f8fff2"
                stroke="#102016"
                strokeWidth="3"
                paintOrder="stroke"
                fontSize="11"
                fontWeight="700"
              >
                {point.label}
              </text>
            </g>
          ))}
        </g>
      </svg>

      {showDiagnostics ? (
        <div className="pointer-events-none absolute left-4 top-4 z-20 max-w-sm rounded-2xl border border-white/20 bg-slate-950/82 p-4 text-xs leading-relaxed text-white shadow-2xl backdrop-blur">
          <div className="mb-2 text-sm font-semibold uppercase tracking-[0.24em] text-emerald-200">
            MapLibre route projection preview
          </div>
          <p className="mb-3 text-slate-200">
            Development-only test path. Gold lines and green points use MapLibre projection against Peridot graph records that already preserve longitude/latitude.
          </p>
          <dl className="grid grid-cols-[5.75rem_1fr] gap-x-3 gap-y-1">
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
              {probeRoutes.length} / {projectableRouteCount} shown
            </dd>
          </dl>
          <p className="mt-3 text-slate-300">
            This is still not the migrated production overlay. It does not provide inspector hit targets, clusters, playback highlighting, or final route styling.
          </p>
        </div>
      ) : null}

      {errorMessage ? (
        <div className="absolute bottom-4 left-4 z-20 max-w-md rounded-2xl border border-red-300/40 bg-red-950/85 p-4 text-sm text-red-50 shadow-2xl">
          <div className="font-semibold">MapLibre test map error</div>
          <div className="mt-1 opacity-90">{errorMessage}</div>
        </div>
      ) : null}
    </div>
  );
}

export default MapLibreMapStage;
