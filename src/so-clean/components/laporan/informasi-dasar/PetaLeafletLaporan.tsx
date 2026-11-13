"use client";

import { useEffect, useRef, useState } from "react";
import { divIcon, type Marker as LeafletMarker, type TileLayer as LeafletTileLayer } from "leaflet";
import { MapContainer, Marker, Rectangle, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { WILAYAH } from "@/lib/wilayah";
import { rapikanKoordinat } from "@/lib/informasi-dasar";
import type { PropsPetaLaporan } from "./PetaLaporan";
import "leaflet/dist/leaflet.css";

const PUSAT_AWAL = { latitude: -6.885514, longitude: 107.6069045 };
const IKON_PIN = divIcon({
  className: "soclean-pin",
  iconSize: [28, 38], iconAnchor: [14, 38],
  html: '<svg viewBox="0 0 28 38" width="28" height="38" xmlns="http://www.w3.org/2000/svg"><path d="M14 37S1 24 1 14a13 13 0 0 1 26 0c0 10-13 23-13 23Z" fill="#094542" stroke="white" stroke-width="2"/><circle cx="14" cy="14" r="5" fill="white"/></svg>',
});

function PerilakuPeta({ pusat, interaktif, onPilih }: PropsPetaLaporan) {
  const map = useMap();
  const latitude = pusat?.latitude ?? PUSAT_AWAL.latitude;
  const longitude = pusat?.longitude ?? PUSAT_AWAL.longitude;
  useMapEvents({
    click: (event) => { if (interaktif) onPilih?.(rapikanKoordinat(event.latlng.lat, event.latlng.lng)); },
    keypress: (event) => {
      if (interaktif && event.originalEvent.key === "Enter") {
        event.originalEvent.preventDefault();
        const center = map.getCenter();
        onPilih?.(rapikanKoordinat(center.lat, center.lng));
      }
    },
  });
  useEffect(() => { map.setView([latitude, longitude], 15, { animate: false }); }, [map, latitude, longitude]);
  useEffect(() => {
    map.attributionControl.setPrefix(false);
    const container = map.getContainer();
    container.setAttribute("aria-label", interaktif ? "Peta pilih lokasi pencemaran" : "Peta lokasi pencemaran terpilih");
    container.setAttribute("role", "region");
    const observer = new ResizeObserver(() => map.invalidateSize({ pan: false }));
    observer.observe(container);
    const frame = requestAnimationFrame(() => map.invalidateSize({ pan: false }));
    return () => { observer.disconnect(); cancelAnimationFrame(frame); };
  }, [map, interaktif]);
  return null;
}

export default function PetaLeafletLaporan({ koordinat, pusat, interaktif = false, onPilih }: PropsPetaLaporan) {
  const [gagal, setGagal] = useState(false);
  const layer = useRef<LeafletTileLayer>(null);
  const center = pusat ?? koordinat ?? PUSAT_AWAL;
  return (
    <div className="relative h-full min-h-28 w-full overflow-hidden rounded-button bg-surface">
      <MapContainer
        center={[center.latitude, center.longitude]} zoom={15} minZoom={3} maxZoom={19}
        dragging={interaktif} touchZoom={interaktif} doubleClickZoom={interaktif} scrollWheelZoom={false}
        zoomControl={interaktif} keyboard={interaktif} boxZoom={interaktif}
        className="z-0 h-full min-h-28 w-full"
      >
        <TileLayer
          ref={layer} url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" maxZoom={19}
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'
          eventHandlers={{ tileerror: () => setGagal(true) }}
        />
        {WILAYAH.map((w) => <Rectangle key={w.kode} bounds={[[w.latMin, w.lngMin], [w.latMax, w.lngMax]]} interactive={false} pathOptions={{ color: "#05c274", weight: 1.5, fillOpacity: 0.06 }} />)}
        {koordinat && <Marker
          position={[koordinat.latitude, koordinat.longitude]} icon={IKON_PIN} draggable={interaktif}
          keyboard={interaktif} title="Titik lokasi pencemaran"
          eventHandlers={{ dragend: (event) => {
            const point = (event.target as LeafletMarker).getLatLng();
            onPilih?.(rapikanKoordinat(point.lat, point.lng));
          } }}
        />}
        <PerilakuPeta koordinat={koordinat} pusat={center} interaktif={interaktif} onPilih={onPilih} />
      </MapContainer>
      {gagal && <div role="status" className="absolute top-2 right-2 left-2 z-10 rounded-lg border border-border bg-white/95 p-2 text-xs text-dark-teal">
        Peta dasar gagal dimuat. Koordinat tetap dapat dipilih.
        <button type="button" className="ml-2 font-semibold underline" onClick={() => { setGagal(false); layer.current?.redraw(); }}>Coba lagi</button>
      </div>}
    </div>
  );
}
