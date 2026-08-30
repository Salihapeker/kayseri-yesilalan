import { HashRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Anasayfa from "./pages/Anasayfa";
import HaritaSayfasi from "./pages/HaritaSayfasi";
import { useMevsim } from "./hooks/useMevsim";
import "./App.css";

function MobilAltMenu() {
  const location = useLocation();
  return (
    <nav id="mobil-alt-menu" aria-label="Mobil navigasyon">
      <Link to="/" className={location.pathname === "/" ? "aktif" : ""}><span>⌂</span>Ana sayfa</Link>
      <Link to="/harita" className={location.pathname === "/harita" ? "aktif" : ""}><span>⌖</span>Harita</Link>
      <Link to="/harita" className="mobil-cta"><span>＋</span>Keşfet</Link>
    </nav>
  );
}

function Uygulama() {
  const { mevsim, setMevsim } = useMevsim();

  return (
    <div id="uygulama-govde">
        <Navbar mevsim={mevsim} onMevsimSec={setMevsim} />

        <div id="sayfa-govde">
          <Routes>
            <Route path="/" element={<Anasayfa />} />
            <Route
              path="/harita"
              element={
                <HaritaSayfasi mevsim={mevsim} onMevsimSec={setMevsim} />
              }
            />
          </Routes>
        </div>
        <MobilAltMenu />
    </div>
  );
}

function App() {
  return <HashRouter><Uygulama /></HashRouter>;
}

export default App;
