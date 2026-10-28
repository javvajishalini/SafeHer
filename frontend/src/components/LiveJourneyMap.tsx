import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, Compass, AlertCircle } from 'lucide-react';

declare const L: any; // Loaded via index.html Leaflet script

export interface LiveJourneyMapProps {
  startCoords?: [number, number];       // [lat, lng]
  destCoords?: [number, number];        // [lat, lng]
  currentCoords?: [number, number];     // [lat, lng] (live GPS)
  startAddress?: string;
  destAddress?: string;
  interactive?: boolean;                // Allows clicking on map to pick destination
  onDestinationSelect?: (lat: number, lng: number, address?: string) => void;
  height?: string;
}

export const LiveJourneyMap: React.FC<LiveJourneyMapProps> = ({
  startCoords,
  destCoords,
  currentCoords,
  startAddress = 'Starting Location',
  destAddress = 'Destination',
  interactive = false,
  onDestinationSelect,
  height = '380px'
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const routeLayerRef = useRef<any>(null);
  const currentMarkerRef = useRef<any>(null);
  const startMarkerRef = useRef<any>(null);
  const destMarkerRef = useRef<any>(null);

  const [routeStats, setRouteStats] = useState<{ distanceKm: string; durationMins: number } | null>(null);
  const [loadingRoute, setLoadingRoute] = useState<boolean>(false);
  const [routeError, setRouteError] = useState<string | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (typeof L === 'undefined') {
      console.warn('Leaflet (L) is not loaded yet');
      return;
    }

    if (!mapInstanceRef.current) {
      // Default center: India or coordinates
      const initialCenter = currentCoords || startCoords || destCoords || [15.8281, 78.0373]; // default Kurnool / AP
      const map = L.map(mapContainerRef.current, {
        center: initialCenter,
        zoom: 13,
        zoomControl: true
      });

      // CartoDB Positron or OpenStreetMap tiles (clean, modern, high-contrast)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        maxZoom: 19
      }).addTo(map);

      mapInstanceRef.current = map;

      // Handle interactive destination click
      if (interactive && onDestinationSelect) {
        map.on('click', async (e: any) => {
          const { lat, lng } = e.latlng;
          // Reverse geocode via Nominatim
          let resolvedAddress = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
          try {
            const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`, {
              headers: { 'Accept': 'application/json' }
            });
            const data = await resp.json();
            if (data?.display_name) {
              resolvedAddress = data.display_name.split(',').slice(0, 3).join(',').trim();
            }
          } catch (err) {
            // quiet fallback
          }
          onDestinationSelect(lat, lng, resolvedAddress);
        });
      }
    }

    return () => {
      // Cleanup on unmount
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Markers and Route when coordinates change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || typeof L === 'undefined') return;

    // Helper: Custom HTML marker icons
    const createPulseIcon = (label: string, color: string) => {
      return L.divIcon({
        className: 'custom-pulse-marker',
        html: `
          <div style="position: relative; display: flex; align-items: center; justify-content: center;">
            <div style="width: 22px; height: 22px; border-radius: 50%; background: ${color}; box-shadow: 0 0 12px ${color}; border: 3px solid #ffffff;"></div>
            <div style="position: absolute; width: 44px; height: 44px; border-radius: 50%; background: ${color}; opacity: 0.3; animation: mapPulse 2s infinite ease-out;"></div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });
    };

    const createPinIcon = (color: string) => {
      return L.divIcon({
        className: 'custom-pin-marker',
        html: `
          <div style="color: ${color}; filter: drop-shadow(0 2px 5px rgba(0,0,0,0.4)); transform: translate(-50%, -100%);">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="${color}" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3" fill="#ffffff"></circle>
            </svg>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32]
      });
    };

    // 1. Current / Live Location Marker ("You are here")
    const livePos = currentCoords || startCoords;
    if (livePos && livePos[0] && livePos[1]) {
      if (currentMarkerRef.current) {
        currentMarkerRef.current.setLatLng(livePos);
      } else {
        currentMarkerRef.current = L.marker(livePos, {
          icon: createPulseIcon('You', '#6366f1'),
          zIndexOffset: 1000
        }).addTo(map);
      }
      currentMarkerRef.current.bindPopup(`<strong>📍 You are here</strong><br/>${startAddress}`);
    }

    // 2. Destination Marker
    if (destCoords && destCoords[0] && destCoords[1]) {
      if (destMarkerRef.current) {
        destMarkerRef.current.setLatLng(destCoords);
      } else {
        destMarkerRef.current = L.marker(destCoords, {
          icon: createPinIcon('#ef4444')
        }).addTo(map);
      }
      destMarkerRef.current.bindPopup(`<strong>🏁 Destination</strong><br/>${destAddress}`);
    } else if (destMarkerRef.current) {
      map.removeLayer(destMarkerRef.current);
      destMarkerRef.current = null;
    }

    // 3. Fetch Real Street Route via OSRM
    const origin = currentCoords || startCoords;
    if (origin && origin[0] && origin[1] && destCoords && destCoords[0] && destCoords[1]) {
      setLoadingRoute(true);
      setRouteError(null);

      const [lat1, lng1] = origin;
      const [lat2, lng2] = destCoords;

      const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${lng1},${lat1};${lng2},${lat2}?overview=full&geometries=geojson`;

      fetch(osrmUrl)
        .then((res) => res.json())
        .then((data) => {
          if (data && data.routes && data.routes.length > 0) {
            const route = data.routes[0];
            const coordinates = route.geometry.coordinates.map((c: [number, number]) => [c[1], c[0]]); // Swap [lng,lat] to [lat,lng]

            // Clear previous route layer
            if (routeLayerRef.current) {
              map.removeLayer(routeLayerRef.current);
            }

            // Draw Real Road Route Line
            const polyline = L.polyline(coordinates, {
              color: '#6366f1',
              weight: 5,
              opacity: 0.85,
              lineCap: 'round',
              lineJoin: 'round'
            }).addTo(map);

            routeLayerRef.current = polyline;

            // Fit map view to show both points and the route
            map.fitBounds(polyline.getBounds(), { padding: [40, 40] });

            // Calculate metrics
            const distanceKm = (route.distance / 1000).toFixed(1);
            const durationMins = Math.round(route.duration / 60);
            setRouteStats({ distanceKm, durationMins });
          } else {
            // Draw direct fallback line if no driving route returned
            fallbackStraightLine(map, origin, destCoords);
          }
        })
        .catch((err) => {
          console.warn('OSRM routing API error, falling back to straight path:', err);
          fallbackStraightLine(map, origin, destCoords);
        })
        .finally(() => {
          setLoadingRoute(false);
        });
    } else if (livePos) {
      map.setView(livePos, 14);
    }
  }, [startCoords, destCoords, currentCoords]);

  const fallbackStraightLine = (map: any, origin: [number, number], dest: [number, number]) => {
    if (routeLayerRef.current) map.removeLayer(routeLayerRef.current);
    const line = L.polyline([origin, dest], {
      color: '#818cf8',
      weight: 3,
      dashArray: '8, 8',
      opacity: 0.8
    }).addTo(map);
    routeLayerRef.current = line;
    map.fitBounds(line.getBounds(), { padding: [40, 40] });
    setRouteStats(null);
  };

  const centerOnUser = () => {
    if (!mapInstanceRef.current) return;
    const target = currentCoords || startCoords;
    if (target) {
      mapInstanceRef.current.flyTo(target, 15, { animate: true });
    }
  };

  const fitFullRoute = () => {
    if (!mapInstanceRef.current || !routeLayerRef.current) return;
    mapInstanceRef.current.fitBounds(routeLayerRef.current.getBounds(), { padding: [40, 40] });
  };

  return (
    <div style={{ position: 'relative', width: '100%', borderRadius: '14px', overflow: 'hidden', border: '1px solid var(--border-color)', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
      {/* Map Canvas */}
      <div ref={mapContainerRef} style={{ width: '100%', height, background: '#f1f5f9' }} />

      {/* Pulsing CSS Animation */}
      <style>{`
        @keyframes mapPulse {
          0% { transform: scale(0.6); opacity: 0.8; }
          100% { transform: scale(2.2); opacity: 0; }
        }
      `}</style>

      {/* Floating Route Metrics Card */}
      {routeStats && (
        <div style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          zIndex: 800,
          background: 'rgba(255, 255, 255, 0.94)',
          backdropFilter: 'blur(8px)',
          borderRadius: '10px',
          padding: '0.6rem 1rem',
          boxShadow: '0 4px 15px rgba(0,0,0,0.12)',
          border: '1px solid rgba(0,0,0,0.08)',
          display: 'flex',
          gap: '1.25rem',
          alignItems: 'center'
        }}>
          <div>
            <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Road Distance</span>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>{routeStats.distanceKm} km</div>
          </div>
          <div style={{ width: '1px', height: '24px', background: '#e2e8f0' }} />
          <div>
            <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Estimated ETA</span>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#6366f1' }}>~{routeStats.durationMins} mins</div>
          </div>
        </div>
      )}

      {/* Interactive Destination Picker Notice */}
      {interactive && (
        <div style={{
          position: 'absolute',
          bottom: '12px',
          left: '12px',
          zIndex: 800,
          background: 'rgba(15, 23, 42, 0.85)',
          color: '#ffffff',
          borderRadius: '8px',
          padding: '0.4rem 0.85rem',
          fontSize: '0.8rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem'
        }}>
          <MapPin size={14} color="#f43f5e" /> Click on the map to set destination pin
        </div>
      )}

      {/* Floating Controls */}
      <div style={{
        position: 'absolute',
        top: '12px',
        right: '12px',
        zIndex: 800,
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
      }}>
        <button
          type="button"
          onClick={centerOnUser}
          title="Center on my location"
          style={{
            background: 'white',
            border: '1px solid rgba(0,0,0,0.15)',
            borderRadius: '8px',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            color: '#6366f1'
          }}
        >
          <Navigation size={18} />
        </button>

        {routeStats && (
          <button
            type="button"
            onClick={fitFullRoute}
            title="Fit complete route"
            style={{
              background: 'white',
              border: '1px solid rgba(0,0,0,0.15)',
              borderRadius: '8px',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              color: '#334155'
            }}
          >
            <Compass size={18} />
          </button>
        )}
      </div>
    </div>
  );
};
