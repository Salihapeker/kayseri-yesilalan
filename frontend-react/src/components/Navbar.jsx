import { Link, useLocation } from "react-router-dom";

const MEVSIMLER = [
  { id: "ilkbahar", etiket: "İlkbahar", renk: "#79ae48" },
  { id: "yaz", etiket: "Yaz", renk: "#e0b52f" },
  { id: "sonbahar", etiket: "Sonbahar", renk: "#d78b43" },
  { id: "kis", etiket: "Kış", renk: "#78a0a0" },
];

export default function Navbar({ mevsim, onMevsimSec }) {
  const location = useLocation();

  return (
    <div id="navbar">
      <Link to="/" id="navbar-logo">
        <img id="navbar-kbb-logo" src="/kbb-logo.png" alt="Kayseri Büyükşehir Belediyesi" />
        <span id="navbar-logo-yazi">
          yeşil<span>alanlar</span><small>Kayseri CBS</small>
        </span>
      </Link>

      <nav id="navbar-menu">
        <Link
          to="/"
          className={`navbar-link ${location.pathname === "/" ? "navbar-link-aktif" : ""}`}
        >
          Anasayfa
        </Link>
        <Link
          to="/harita"
          className={`navbar-link ${location.pathname === "/harita" ? "navbar-link-aktif" : ""}`}
        >
          Harita
        </Link>
        <span className="navbar-link navbar-link-pasif" title="Yakında">
          Mahalleler
        </span>
        <span className="navbar-link navbar-link-pasif" title="Yakında">
          Veriler
        </span>
      </nav>

      <div id="navbar-sag">
        <div id="navbar-mevsimler">
          {MEVSIMLER.map((m) => (
            <button
              key={m.id}
              className={m.id === mevsim ? "aktif" : ""}
              onClick={() => onMevsimSec(m.id)}
              title={m.etiket}
              aria-label={m.etiket}
              style={{ "--mevsim-rengi": m.renk }}
            >
              {m.etiket}
            </button>
          ))}
        </div>
        <Link to="/harita" className="navbar-cta">
          Yakınımda
        </Link>
      </div>
    </div>
  );
}
