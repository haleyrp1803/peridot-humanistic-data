// Isolated MapLibre map-stage shell for Peridot.
//
// This component is part of the MapLibre migration foothold. It is deliberately
// gated behind the development-only MapLibre preview path and does not replace
// the production D3/SVG map. Its job is to prove that MapLibre can be installed,
// imported, initialized, resized, cleaned up, inspected, and used for coordinate
// projection safely inside the real Peridot workspace before any existing map
// behavior is migrated.

import { useEffect, useMemo, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { getMapLibreStyleConfig } from './mapStyleConfig';

const DEFAULT_CENTER = [12.5, 43.4];
const DEFAULT_ZOOM = 4.8;
const MAX_PROBE_POINTS = 30;

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
  return Number.isFinite(node?.lon) && Number.isFinite(node?.lat) && !(node.lat === 0 && node.lon === 0);
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
  const styleConfig = useMemo(() => getMapLibreStyleConfig(styleId), [styleId]);
  const projectableNodeCount = useMemo(
    () => (Array.isArray(graph?.nodes) ? graph.nodes.filter(hasUsableLngLat).length : 0),
    [graph],
  );

  const updateProbePoints = () => {
    setProbePoints(buildProjectionProbePoints(mapRef.current, graph));
  };

  useEffect(() => {
    updateProbePoints();
  }, [graph]);

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
    <div className={`relative h-full w-full overflow-hidden ${className}`}>
      <div ref={containerRef} className="absolute inset-0" />

      <svg className="pointer-events-none absolute inset-0 z-10 h-full w-full" aria-hidden="true">
        {probePoints.map((point) => (
          <g key={point.id} transform={`translate(${point.x}, ${point.y})`}>
            <circle r="7" fill="rgba(95, 123, 75, 0.9)" stroke="#fff8ea" strokeWidth="2" />
            <circle r="13" fill="none" stroke="rgba(95, 123, 75, 0.45)" strokeWidth="2" />
            <text
              x="11"
              y="4"
              fontSize="11"
              fontWeight="700"
              fill="#243321"
              stroke="#fff8ea"
              strokeWidth="3"
              paintOrder="stroke"
            >
              {point.label}
            </text>
          </g>
        ))}
      </svg>

      {showDiagnostics ? (
        <div className="pointer-events-none absolute left-4 top-4 z-20 max-w-sm rounded-xl border border-black/15 bg-white/90 p-4 text-xs text-slate-800 shadow-lg backdrop-blur">
          <div className="mb-2 text-sm font-bold">MapLibre projection preview</div>
          <div className="mb-3 text-[11px] leading-snug text-slate-600">
            Development-only test path. Green probe points use MapLibre <code>map.project()</code> against
            Peridot graph nodes that already expose longitude/latitude.
          </div>
          <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
            <dt className="font-semibold">Style</dt>
            <dd>{styleConfig.label}</dd>
            <dt className="font-semibold">Loaded</dt>
            <dd>{viewState.loaded ? 'yes' : 'loading'}</dd>
            <dt className="font-semibold">View</dt>
            <dd>{viewMode || 'n/a'}</dd>
            <dt className="font-semibold">Center</dt>
            <dd>
              {formatNumber(viewState.center?.[0])}, {formatNumber(viewState.center?.[1])}
            </dd>
            <dt className="font-semibold">Zoom</dt>
            <dd>{formatNumber(viewState.zoom, 2)}</dd>
            <dt className="font-semibold">Projected</dt>
            <dd>
              {probePoints.length} / {projectableNodeCount} nodes shown
            </dd>
          </dl>
          <div className="mt-3 text-[11px] leading-snug text-slate-600">
            This is not the migrated Peridot overlay. It is only a coordinate-projection probe. It does not
            render routes, clusters, labels, inspector hit targets, or production styling.
          </div>
        </div>
      ) : null}

      {errorMessage ? (
        <div className="absolute bottom-4 left-4 z-20 max-w-md rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-900 shadow-lg">
          <div className="font-bold">MapLibre test map error</div>
          <div className="mt-1">{errorMessage}</div>
        </div>
      ) : null}
    </div>
  );
}

export default MapLibreMapStage;
