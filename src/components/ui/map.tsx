'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
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
  shadowSize: [41, 41]
});

interface MapProps {
  location: [number, number]; // [lat, lng]
  onChange?: (location: [number, number]) => void;
  readOnly?: boolean;
}

function LocationMarker({ position, setPosition, readOnly }: { position: [number, number], setPosition: (pos: [number, number]) => void, readOnly?: boolean }) {
  useMapEvents({
    click(e) {
      if (!readOnly) {
        setPosition([e.latlng.lat, e.latlng.lng]);
      }
    },
  });

  return position === null ? null : (
    <Marker position={position} icon={customIcon} />
  );
}

export default function Map({ location, onChange, readOnly = false }: MapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-full h-full bg-slate-100 dark:bg-slate-800 animate-pulse rounded-xl" />;
  }

  return (
    <div className="w-full h-full rounded-xl overflow-hidden z-0 relative isolate">
      <MapContainer
        center={location}
        zoom={13}
        scrollWheelZoom={!readOnly}
        style={{ height: '100%', width: '100%', zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker 
          position={location} 
          setPosition={(pos) => onChange?.(pos)} 
          readOnly={readOnly} 
        />
      </MapContainer>
    </div>
  );
}
