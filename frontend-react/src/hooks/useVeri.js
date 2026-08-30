import { useEffect, useState } from "react";
import L from "leaflet";
import { API, renkler, turAdlari } from "../config";
import { noktaCiz } from "./useHarita";

export function useVeriYukle(map, katmanlar, onParkTikla, onTesisTikla) {
  const [aramaIndeksi, setAramaIndeksi] = useState([]);
  const [tesisSayilari, setTesisSayilari] = useState({});

  useEffect(() => {
    if (!map || !katmanlar) return;

    // --- Parklar ---
    fetch(`${API}/yesil-alanlar`)
      .then((r) => r.json())
      .then((data) => {
        const kokStil = getComputedStyle(document.documentElement);
        const mevsimVurgu =
          kokStil.getPropertyValue("--accent").trim() || "#63A87C";
        const mevsimKoyu =
          kokStil.getPropertyValue("--dark").trim() || "#25402F";

        const parkLayer = L.geoJSON(data, {
          style: {
            color: mevsimKoyu,
            weight: 1.5,
            fillColor: mevsimVurgu,
            fillOpacity: 0.45,
          },
          pointToLayer: (feature, latlng) => noktaCiz(latlng, mevsimVurgu),
        });

        const yeniIndeks = [];
        const sayaçCozum = {};
        parkLayer.eachLayer((layer) => {
          const props = layer.feature.properties;
          const merkez = layer.getBounds
            ? layer.getBounds().getCenter()
            : layer.getLatLng();

          layer.on("click", () => {
            if (layer.getBounds && layer.getBounds().isValid()) {
              map.fitBounds(layer.getBounds(), { padding: [80, 80], maxZoom: 16, animate: true, duration: 0.55 });
            } else {
              map.flyTo(merkez, 16, { animate: true, duration: 0.55 });
            }
            onParkTikla(props.id, [merkez.lng, merkez.lat]);
          });
          katmanlar.park.addLayer(layer);

          const ek = props.ozellikler || {};
          if (ek.bakim_durumu && ek.bakim_durumu !== "acik") {
            const durumRengi = ek.bakim_durumu === "bakimda" ? "#d97706" : "#2563eb";
            const calismaLayer = L.geoJSON(layer.feature, {
              style: { color: durumRengi, weight: 3, dashArray: "7 5", fillOpacity: 0.08 },
              pointToLayer: (_feature, latlng) => noktaCiz(latlng, durumRengi),
            });
            calismaLayer.eachLayer((durumKatmani) => {
              durumKatmani.on("click", () => onParkTikla(props.id, [merkez.lng, merkez.lat]));
            });
            katmanlar.calisma.addLayer(calismaLayer);
            sayaçCozum.calisma = (sayaçCozum.calisma || 0) + 1;
          }

          yeniIndeks.push({
            ad: props.ad,
            mahalle: props.mahalle || "",
            layer,
            merkez,
            id: props.id,
          });
        });
        setAramaIndeksi(yeniIndeks);
        setTesisSayilari((s) => ({ ...s, park: yeniIndeks.length, ...sayaçCozum }));
      });

    // --- Tesisler (artık tıklanınca panel açıyor, eski Leaflet balonu yok) ---
    fetch(`${API}/tesisler`)
      .then((r) => r.json())
      .then((data) => {
        const sayaç = {};
        data.features.forEach((f) => {
          const [lon, lat] = f.geometry.coordinates;
          const tur = f.properties.tur;
          const renk = renkler[tur];
          if (!renk) return;

          const marker = noktaCiz([lat, lon], renk, tur);
          marker.on("click", () =>
            onTesisTikla({
              tur,
              ad: f.properties.ad,
              parkAdi: f.properties.park_adi,
              lon,
              lat,
            }),
          );
          katmanlar[tur].addLayer(marker);
          sayaç[tur] = (sayaç[tur] || 0) + 1;
        });
        setTesisSayilari((s) => ({ ...s, ...sayaç }));
      });
  }, [map, katmanlar]);

  return { aramaIndeksi, tesisSayilari };
}
