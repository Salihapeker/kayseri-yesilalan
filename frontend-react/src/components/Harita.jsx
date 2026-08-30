import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet.markercluster";
import { kayseriSinirlari } from "../config";

export default function Harita({ onMapReady, id = "map", options = {} }) {
  const mapRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (mapRef.current) return; // harita zaten kurulmuşsa tekrar kurma

    const map = L.map(containerRef.current, options).setView([38.7312, 35.4787], 12);
    map.setMaxBounds(L.latLngBounds(kayseriSinirlari));
    map.setMinZoom(9);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap katkıda bulunanlar",
    }).addTo(map);

    mapRef.current = map;
    if (onMapReady) onMapReady(map);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  return (
    <div
      id={id}
      ref={containerRef}
      style={{ width: "100%", height: "100%" }}
    />
  );
}
