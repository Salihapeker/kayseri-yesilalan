import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer id="site-footer">
      <div id="footer-ust">
        <div className="footer-sutun">
          <div id="footer-logo">
            <span id="footer-logo-nokta" />
            <span id="footer-logo-yazi">
              yeşil<span>alanlar</span>
            </span>
          </div>
          <p className="footer-aciklama">
            Kayseri'deki park ve yeşil alan tesislerini tek haritada gösteren
            açık veri projesi.
          </p>
        </div>

        <div className="footer-sutun footer-kurum-imzasi">
          <img className="kbb-amblem" src="/kbb-logo.png" alt="Kayseri Büyükşehir Belediyesi" />
          <div>
            <div className="footer-baslik">PROJE PAYDAŞI</div>
            <strong>Kayseri Büyükşehir Belediyesi</strong>
            <span>Coğrafi Bilgi Sistemleri Şube Müdürlüğü</span>
          </div>
        </div>

        <div className="footer-sutun">
          <div className="footer-baslik">Site</div>
          <Link to="/" className="footer-link">
            Anasayfa
          </Link>
          <Link to="/harita" className="footer-link">
            Harita
          </Link>
        </div>

        <div className="footer-sutun">
          <div className="footer-baslik">Kaynaklar</div>
          <span className="footer-link footer-link-pasif">
            Açık veri (yakında)
          </span>
          <span className="footer-link footer-link-pasif">
            API dokümantasyonu (yakında)
          </span>
        </div>

        <div className="footer-sutun">
          <div className="footer-baslik">İletişim</div>
          <a className="footer-link" href="https://cbs.kayseri.bel.tr" target="_blank" rel="noreferrer">Kent Bilgi Sistemi ↗</a>
          <a className="footer-link" href="https://www.kayseri.bel.tr/cografi-bilgi-sistemleri-sube-mudurlugu" target="_blank" rel="noreferrer">CBS Şube Müdürlüğü ↗</a>
        </div>
      </div>

      <div id="footer-alt">
        <span>© {new Date().getFullYear()} Kayseri Büyükşehir Belediyesi</span>
        <span>
          Veriler OpenStreetMap ve belediye kayıtlarından derlenmiştir.
        </span>
      </div>
    </footer>
  );
}
