// Isolated MapLibre map-stage shell for Peridot.
//
// This component is part of the MapLibre migration foothold. It is deliberately
// not wired into the production app map yet. Its job is to prove that MapLibre
// can be installed, imported, initialized, resized, and cleaned up safely inside
// a React/Vite component before any existing D3/SVG map behavior is replaced.

import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

import { getMapLibreStyleConfig } from './mapStyleConfig';

const DEFAULT_CENTER = [12.5, 43.4];
const DEFAULT_ZOOM = 4.8;

export function MapLibreMapStage({
  className = '',
  styleId,
  center = DEFAULT_CENTER,
  zoom = DEFAULT_ZOOM,
  interactive = true,
  onMapReady,
  onViewChange,
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return undefined;

    const styleConfig = getMapLibreStyleConfig(styleId);

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

      const reportViewChange = () => {
        if (!onViewChange) return;
        const currentCenter = map.getCenter();
        onViewChange({
          center: [currentCenter.lng, currentCenter.lat],
          zoom: map.getZoom(),
          bearing: map.getBearing(),
          pitch: map.getPitch(),
        });
      };

      map.on('load', () => {
        setErrorMessage('');
        onMapReady?.({ map, styleConfig });
        reportViewChange();
      });

      map.on('moveend', reportViewChange);
      map.on('zoomend', reportViewChange);
      map.on('error', (event) => {
        const message = event?.error?.message || 'MapLibre reported a map loading error.';
        setErrorMessage(message);
      });

      const resizeObserver = new ResizeObserver(() => {
        map.resize();
      });
      resizeObserver.observe(containerRef.current);

      return () => {
        resizeObserver.disconnect();
        map.remove();
        mapRef.current = null;
      };
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : String(error));
      return undefined;
    }
  }, [center, interactive, onMapReady, onViewChange, styleId, zoom]);

  return (
    <div className={`relative h-full min-h-[420px] w-full overflow-hidden rounded-2xl ${className}`}>
      <div ref={containerRef} className="h-full w-full" aria-label="MapLibre test map" />
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
