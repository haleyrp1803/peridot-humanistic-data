// Isolated MapLibre map-stage shell for Peridot.
//
// This component is part of the MapLibre migration foothold. It is deliberately
// gated behind the development-only MapLibre preview path and does not replace
// the production D3/SVG map. Its job is to prove that MapLibre can be installed,
// imported, initialized, resized, cleaned up, and inspected safely inside the
// real Peridot workspace before any existing map behavior is migrated.

import { useEffect, useMemo, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

import { getMapLibreStyleConfig } from './mapStyleConfig';

const DEFAULT_CENTER = [12.5, 43.4];
const DEFAULT_ZOOM = 4.8;

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

export function MapLibreMapStage({
  className = '',
  styleId,
  center = DEFAULT_CENTER,
  zoom = DEFAULT_ZOOM,
  interactive = true,
  showDiagnostics = true,
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

  const styleConfig = useMemo(() => getMapLibreStyleConfig(styleId), [styleId]);

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
  }, [center, interactive, onMapReady, onViewChange, styleConfig, zoom]);

  return (
    <div className={`relative h-full min-h-[420px] w-full overflow-hidden rounded-2xl ${className}`}>
      <div ref={containerRef} className="h-full w-full" aria-label="MapLibre test map" />

      {showDiagnostics ? (
        <div className="pointer-events-none absolute left-4 top-4 max-w-sm rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-xs text-slate-800 shadow-lg backdrop-blur">
          <div className="text-sm font-semibold text-slate-950">MapLibre preview</div>
          <div className="mt-1 text-[11px] uppercase tracking-[0.18em] text-slate-500">
            Development-only map substrate test
          </div>
          <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
            <dt className="font-medium text-slate-500">Style</dt>
            <dd>{styleConfig.label}</dd>
            <dt className="font-medium text-slate-500">Loaded</dt>
            <dd>{viewState.loaded ? 'yes' : 'loading'}</dd>
            <dt className="font-medium text-slate-500">Center</dt>
            <dd>
              {formatNumber(viewState.center?.[0])}, {formatNumber(viewState.center?.[1])}
            </dd>
            <dt className="font-medium text-slate-500">Zoom</dt>
            <dd>{formatNumber(viewState.zoom, 2)}</dd>
            <dt className="font-medium text-slate-500">Bearing</dt>
            <dd>{formatNumber(viewState.bearing, 1)}°</dd>
            <dt className="font-medium text-slate-500">Pitch</dt>
            <dd>{formatNumber(viewState.pitch, 1)}°</dd>
          </dl>
          <div className="mt-3 border-t border-slate-200 pt-2 text-[11px] leading-snug text-slate-500">
            This preview does not render Peridot routes, nodes, clusters, labels, or inspector hit targets yet.
          </div>
        </div>
      ) : null}

      {errorMessage ? (
        <div className="absolute left-4 top-4 max-w-md rounded-xl border border-red-300 bg-white/95 px-4 py-3 text-sm text-red-900 shadow-lg">
          <div className="font-semibold">MapLibre test map error</div>
          <div className="mt-1">{errorMessage}</div>
        </div>
      ) : null}
    </div>
  );
}

export default MapLibreMapStage;
