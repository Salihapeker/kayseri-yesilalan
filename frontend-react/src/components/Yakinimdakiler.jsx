import { useState } from "react";
import L from "leaflet";
import { API, renkler, turAdlari, mesafeYaz } from "../config";

export default function Yakinimdakiler({ map }) {
  const [konumMarker, setKonumMarker] = useState(null);
  const [sonuclar, setSonuclar] = useState(null);

  function butonaTikla() {
    if (!navigator.geolocation)
      return alert("Tarayıcınız konum özelliğini desteklemiyor.");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords;

        if (konumMarker) map.removeLayer(konumMarker);
        const yeniMarker = L.marker([lat, lon])
          .bindPopup("Buradasınız")
          .addTo(map)
          .openPopup();
        setKonumMarker(yeniMarker);
        map.setView([lat, lon], 15);

        const veri = await fetch(
          `${API}/yakinimdakiler?lon=${lon}&lat=${lat}&limit=8`,
        ).then((r) => r.json());
        setSonuclar(veri);
      },
      () => alert("Konumunuza erişilemedi."),
    );
  }

  return (
    <div>
      <button id="panel-yakinim-btn" onClick={butonaTikla}>
        Yakınımdakileri göster
      </button>
      {sonuclar && (
        <div id="yakinimdakiler-liste">
          {sonuclar.map((s, i) => (
            <div className="yakinim-satir" key={i}>
              <span
                className="yakinim-nokta"
                style={{ background: renkler[s.tur] || "#25402F" }}
              />
              <span className="yakinim-isim">{s.ad || turAdlari[s.tur]}</span>
              <span className="yakinim-mesafe">{mesafeYaz(s.mesafe_m)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
