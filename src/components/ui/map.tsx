'use client';

import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default Leaflet marker icons in Next.js
const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface MapProps {
  location: [number, number]; // [lat, lng]
  onChange?: (location: [number, number]) => void;
  readOnly?: boolean;
  geocodeQuery?: string; // address + city + pincode string to auto-geocode
}

/** Flies to a new center when `target` prop changes */
function FlyToController({ target }: { target: [number, number] }) {
  const map = useMap();
  const prevRef = useRef<[number, number] | null>(null);

  useEffect(() => {
    if (!target) return;
    const [lat, lng] = target;
    const prev = prevRef.current;
    // Only fly if coords actually changed
    if (!prev || Math.abs(prev[0] - lat) > 0.0001 || Math.abs(prev[1] - lng) > 0.0001) {
      map.flyTo([lat, lng], 15, { duration: 1.2 });
      prevRef.current = target;
    }
  }, [target, map]);

  return null;
}

function LocationMarker({
  position,
  setPosition,
  readOnly,
}: {
  position: [number, number];
  setPosition: (pos: [number, number]) => void;
  readOnly?: boolean;
}) {
  useMapEvents({
    click(e) {
      if (!readOnly) {
        setPosition([e.latlng.lat, e.latlng.lng]);
      }
    },
  });

  return position === null ? null : <Marker position={position} icon={customIcon} />;
}

export default function Map({ location, onChange, readOnly = false, geocodeQuery }: MapProps) {
  const [mounted, setMounted] = useState(false);
  const [geocodedLocation, setGeocodedLocation] = useState<[number, number] | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const geocodeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastQuery = useRef<string>('');

  useEffect(() => {
    setMounted(true);
  }, []);

  // Debounced geocoding when address query changes
  useEffect(() => {
    if (!geocodeQuery || geocodeQuery.trim().length < 8) return;
    if (geocodeQuery === lastQuery.current) return;

    if (geocodeTimer.current) clearTimeout(geocodeTimer.current);

    geocodeTimer.current = setTimeout(async () => {
      if (geocodeQuery === lastQuery.current) return;
      lastQuery.current = geocodeQuery;
      setIsGeocoding(true);
      try {
        const encoded = encodeURIComponent(geocodeQuery + ', India');
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&limit=1`,
          { headers: { 'Accept-Language': 'en' } }
        );
        const data = await res.json();
        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lng = parseFloat(data[0].lon);
          const newLoc: [number, number] = [lat, lng];
          setGeocodedLocation(newLoc);
          onChange?.(newLoc);
        }
      } catch {
        // silently fail — user can still drag pin manually
      } finally {
        setIsGeocoding(false);
      }
    }, 900); // 900ms debounce

    return () => {
      if (geocodeTimer.current) clearTimeout(geocodeTimer.current);
    };
  }, [geocodeQuery, onChange]);

  const activeLocation = geocodedLocation || location;

  if (!mounted) {
    return <div className="w-full h-full bg-slate-100 dark:bg-slate-800 animate-pulse rounded-xl" />;
  }

  return (
    <div className="w-full h-full rounded-xl overflow-hidden z-0 relative isolate">
      {/* Geocoding spinner overlay */}
      {isGeocoding && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-[9999] bg-white dark:bg-slate-800 text-xs font-medium px-3 py-1.5 rounded-full shadow-md border border-[var(--border)] flex items-center gap-2">
          <span className="w-3 h-3 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          Locating address…
        </div>
      )}
      <MapContainer
        center={activeLocation}
        zoom={13}
        scrollWheelZoom={!readOnly}
        style={{ height: '100%', width: '100%', zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FlyToController target={activeLocation} />
        <LocationMarker
          position={activeLocation}
          setPosition={(pos) => {
            setGeocodedLocation(pos);
            onChange?.(pos);
          }}
          readOnly={readOnly}
        />
      </MapContainer>
    </div>
  );
}
