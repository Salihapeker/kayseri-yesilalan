import { Link } from "react-router-dom";
import { useIstatistikler } from "../hooks/useIstatistikler";
import { useMahalleSiralamasi } from "../hooks/useMahalleSiralamasi";
import Footer from "../components/Footer";
import HaritaOnizleme from "../components/HaritaOnizleme";
import "./Anasayfa.css";

const DUYURU = {
  baslik: "Mimarsinan Parkı’nda modern aydınlatma çalışması sürüyor",
  link: "/harita",
};

const HABERLER = [
  {
    tur: "PARK VE BAHÇELER",
    tarih: "18 Temmuz 2026",
    baslik: "Lavanta Bahçesi, Erciyes manzarasıyla ziyaretçilerini büyülüyor",
    aciklama: "Millet Bahçesi’ndeki lavanta bahçesi yaz döneminde doğayla iç içe bir buluşma alanı sunuyor.",
    link: "https://www.kayseri.bel.tr/haberler/buyuksehirin-lavanta-bahcesi-erciyes-manzarasiyla-ziyaretcilerini-buyuluyor32683",
    tema: "mor",
  },
  {
    tur: "YEŞİL ALANLAR",
    tarih: "24 Mayıs 2026",
    baslik: "Mimarsinan Parkı’na modern aydınlatma hamlesi",
    aciklama: "Parkın enerji altyapısı yenilenirken daha güvenli ve verimli bir sosyal yaşam alanı hedefleniyor.",
    link: "https://www.kayseri.bel.tr/haberler/buyuksehirden-mimarsinan-parkina-modern-aydinlatma-hamlesi3153831540",
    tema: "sari",
  },
  {
    tur: "AKILLI ŞEHİRCİLİK",
    tarih: "26 Nisan 2026",
    baslik: "Ağaçlara karekodlu bilgilendirme uygulaması",
    aciklama: "Millet Bahçesi ve Kadir Has Kültür Parkı’nda ağaç bilgileri artık mobil cihazlardan erişilebiliyor.",
    link: "https://www.kayseri.bel.tr/haberler/buyuksehirden-dogaya-dijital-dokunus-agaclara-karekodlu-bilgilendirme3140331413",
    tema: "mavi",
  },
];

export default function Anasayfa() {
  const ist = useIstatistikler();
  const mahalleler = useMahalleSiralamasi();

  return (
    <main id="anasayfa">
      <section id="hero">
        <div id="hero-metin">
          <div className="pill-etiket" style={{ color: "#C9DE6A" }}>
            KAYSERİ · CANLI VERİ
          </div>
          <h1 id="hero-baslik">Her mahallenin bir nefes noktası var</h1>
          <p id="hero-aciklama">
            {ist
              ? `${ist.park_sayisi.toLocaleString("tr-TR")} park, ${ist.oyun_alani_sayisi.toLocaleString("tr-TR")} oyun alanı`
              : "Yükleniyor"}{" "}
            ve mahalle bazlı erişim verisi — hepsi tek haritada.
          </p>
          <div id="hero-cta-satiri">
            <Link to="/harita" id="hero-cta">
              Haritayı aç <span>→</span>
            </Link>
            <span id="hero-cta-alt">Tam ekran, filtreli</span>
          </div>
        </div>
        <div id="hero-gorsel"><HaritaOnizleme /></div>
      </section>

      <section id="istatistik-satiri">
        <div className="istatistik-kart istatistik-kart-yesil">
          <div className="pill-etiket" style={{ color: "#3E7A55" }}>
            TOPLAM YEŞİL ALAN
          </div>
          <div className="istatistik-sayi">
            {ist ? `${ist.toplam_alan_hektar.toLocaleString("tr-TR")} ha` : "—"}
          </div>
          <div className="istatistik-alt">
            Kayseri geneli, kayıtlı park sınırları
          </div>
        </div>
        <div className="istatistik-kart istatistik-kart-amber">
          <div className="pill-etiket" style={{ color: "#C58A2E" }}>
            OYUN ALANI
          </div>
          <div className="istatistik-sayi istatistik-sayi-amber">
            {ist ? ist.oyun_alani_sayisi.toLocaleString("tr-TR") : "—"}
          </div>
          <div className="istatistik-alt istatistik-alt-amber">
            çocuklara yönelik nokta sayısı
          </div>
        </div>
        <div className="istatistik-kart istatistik-kart-koyu">
          <div className="pill-etiket" style={{ color: "#9CC7A9" }}>
            BU HAFTA
          </div>
          <div id="duyuru-baslik">{DUYURU.baslik}</div>
          <Link to={DUYURU.link} id="duyuru-oku">
            Oku →
          </Link>
        </div>
      </section>

      <section id="haberler" aria-labelledby="haberler-baslik">
        <div className="bolum-ust">
          <div>
            <span className="pill-etiket">KAYSERİ BÜYÜKŞEHİR BELEDİYESİ</span>
            <h2 id="haberler-baslik">Şehirden haberler</h2>
          </div>
          <a className="bolum-aciklama" href="https://www.kayseri.bel.tr/park-bahceler-ve-agaclandirma" target="_blank" rel="noreferrer">Tüm Park ve Bahçeler haberleri ↗</a>
        </div>
        <div className="haber-kartlari">
          {HABERLER.map((haber) => (
            <article className={`haber-kart haber-${haber.tema}`} key={haber.baslik}>
              <div className="haber-gorsel" aria-hidden="true"><span /><span /><span /></div>
              <div className="haber-icerik">
                <div className="haber-meta"><span>{haber.tur}</span><time>{haber.tarih}</time></div>
                <h3>{haber.baslik}</h3>
                <p>{haber.aciklama}</p>
                <a href={haber.link} target="_blank" rel="noreferrer" className="haber-link">Haberi oku <span>↗</span></a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="alt-satir">
        <div id="mahalle-karnesi-kart">
          <div id="mahalle-karnesi-baslik">Mahalle karnesi</div>
          <div id="mahalle-karnesi-liste">
            {mahalleler === null && (
              <div className="mahalle-yukleniyor">Yükleniyor...</div>
            )}
            {mahalleler?.map((m) => (
              <div className="mahalle-satir" key={m.ad}>
                <span className="mahalle-adi">{m.ad}</span>
                <span className="mahalle-cubuk">
                  <span style={{ width: `${m.yuzde}%` }} />
                </span>
                <span className="mahalle-deger">{m.adet}</span>
              </div>
            ))}
          </div>
        </div>

        <Link to="/harita" id="harita-onizleme-kart">
          <span className="pill-etiket">HARİTA ERİŞİMİ</span>
          <strong>Mahallendeki yeşil alanları incele</strong>
          <p>Park, oyun alanı ve tesis bilgilerini tek haritada filtreleyin.</p>
          <div id="harita-onizleme-btn">Haritayı aç <span>→</span></div>
        </Link>
      </section>

      <Footer />
    </main>
  );
}
