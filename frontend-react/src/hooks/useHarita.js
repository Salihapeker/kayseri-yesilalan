import { useRef } from 'react';
import L from 'leaflet';
import { renkler } from '../config';

// Eski harita.js'deki kumeOlustur ve noktaCiz fonksiyonlarıyla birebir aynı
export function kumeOlustur(renk) {
  return L.markerClusterGroup({
    iconCreateFunction: cluster => L.divIcon({
      html: `<div style="background:${renk}; color:#fff; width:34px; height:34px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:600; border:2px solid #fff; box-shadow:0 2px 8px rgba(0,0,0,0.25);">${cluster.getChildCount()}</div>`,
      className: '', iconSize: [34, 34]
    })
  });
}

const tesisSimgeleri = {
  tuvalet: "WC",
  cocuk_oyun_alani: "●",
  spor_sahasi: "⚽",
  cesme: "≈",
  otopark: "P",
  kafeterya: "☕",
  bank: "▰",
  piknik_alani: "⌂",
};

export function noktaCiz(latlng, renk, tur) {
  if (tur && tesisSimgeleri[tur]) {
    return L.marker(latlng, {
      icon: L.divIcon({
        className: "tesis-sembol-ikon",
        html: `<span class="tesis-sembol" style="--tesis-rengi:${renk}">${tesisSimgeleri[tur]}</span>`,
        iconSize: [27, 27],
        iconAnchor: [13, 13],
      }),
      title: tur,
    });
  }
  return L.circleMarker(latlng, {
    radius: 6,
    fillColor: renk,
    color: '#fff',
    weight: 1.5,
    fillOpacity: 0.95,
  });
}

// Bir haritaya bağlı, tüm tesis türleri için katmanları oluşturup tutan hook.
// Eski koddaki "const katmanlar = {...}" nesnesinin React'e taşınmış hali.
export function useKatmanlar(map) {
  const katmanlarRef = useRef(null);

  if (!katmanlarRef.current && map) {
    katmanlarRef.current = {
      park: L.layerGroup().addTo(map),
      tuvalet: kumeOlustur(renkler.tuvalet),
      cocuk_oyun_alani: kumeOlustur(renkler.cocuk_oyun_alani),
      spor_sahasi: kumeOlustur(renkler.spor_sahasi),
      cesme: kumeOlustur(renkler.cesme),
      otopark: kumeOlustur(renkler.otopark),
      kafeterya: kumeOlustur(renkler.kafeterya),
      bank: kumeOlustur(renkler.bank),
      piknik_alani: kumeOlustur(renkler.piknik_alani)
      ,calisma: L.layerGroup()
    };
  }

  function toggleLayer(tur, acik) {
    const katman = katmanlarRef.current?.[tur];
    if (!katman || !map) return;
    if (acik) map.addLayer(katman);
    else map.removeLayer(katman);
  }

  return { katmanlar: katmanlarRef.current, toggleLayer };
}
