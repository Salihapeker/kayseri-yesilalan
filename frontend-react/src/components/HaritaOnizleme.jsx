import { useNavigate } from "react-router-dom";
import Harita from "./Harita";

export default function HaritaOnizleme() {
  const navigate = useNavigate();

  function haritayiAc() {
    const hero = document.getElementById("hero");
    hero?.classList.add("harita-aciliyor");
    window.setTimeout(() => navigate("/harita"), 340);
  }

  return (
    <button className="gercek-harita-onizleme" type="button" onClick={haritayiAc} aria-label="Haritayı tam ekranda aç">
      <Harita id="ana-sayfa-mini-harita" options={{ zoomControl: false, attributionControl: false, dragging: false, scrollWheelZoom: false, doubleClickZoom: false, boxZoom: false, keyboard: false, touchZoom: false }} />
      <span className="mini-harita-karartma" />
      <span className="mini-harita-etiket">CANLI HARİTA ÖNİZLEMESİ</span>
      <span className="mini-harita-cta"><small>Kayseri yeşil alanları</small><strong>Haritayı tam ekran aç <b>↗</b></strong></span>
    </button>
  );
}
