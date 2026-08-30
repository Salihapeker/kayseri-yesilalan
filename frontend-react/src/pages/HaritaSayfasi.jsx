import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Harita from "../components/Harita";
import Arama from "../components/Arama";
import Yakinimdakiler from "../components/Yakinimdakiler";
import { useKatmanlar } from "../hooks/useHarita";
import { useVeriYukle } from "../hooks/useVeri";
import { useDetayPaneli } from "../components/DetayPaneli";
import { API, renkler, turAdlari } from "../config";
import "./HaritaSayfasi.css";

const KATMAN_SIRASI = [
  "tuvalet",
  "cocuk_oyun_alani",
  "spor_sahasi",
  "cesme",
  "otopark",
  "kafeterya",
  "bank",
  "piknik_alani",
];

const ONCELIKLI_KATMANLAR = ["park", "cocuk_oyun_alani", "spor_sahasi", "piknik_alani"];
const DIGER_KATMANLAR = KATMAN_SIRASI.filter(
  (tur) => !ONCELIKLI_KATMANLAR.includes(tur),
);

const MEVSIMLER = [
  { id: "ilkbahar", etiket: "İlkbahar" },
  { id: "yaz", etiket: "Yaz" },
  { id: "sonbahar", etiket: "Sonbahar" },
  { id: "kis", etiket: "Kış" },
];

const KESIF_MODLARI = [
  { id: "aile", etiket: "Ailece keşfet", aciklama: "Oyun, dinlenme ve ihtiyaç noktaları", katmanlar: ["park", "cocuk_oyun_alani", "tuvalet", "cesme"] },
  { id: "spor", etiket: "Hareket et", aciklama: "Spor alanları ve park rotaları", katmanlar: ["park", "spor_sahasi", "cesme"] },
  { id: "piknik", etiket: "Piknik planla", aciklama: "Piknik, kafe ve otopark", katmanlar: ["park", "piknik_alani", "kafeterya", "otopark"] },
  { id: "erisilebilir", etiket: "Erişilebilir seç", aciklama: "Erişim bilgisi olan parklar", katmanlar: ["park", "tuvalet", "otopark"] },
];

function KatmanKarti({ tur, acik, adet, onToggle }) {
  const simgeler = { park: "⌂", tuvalet: "WC", cocuk_oyun_alani: "●", spor_sahasi: "⚽", cesme: "≈", otopark: "P", kafeterya: "☕", bank: "▰", piknik_alani: "⌂" };
  return (
    <button
      type="button"
      className={`panel-katman-kart ${acik ? "aktif" : ""}`}
      onClick={onToggle}
      aria-pressed={acik}
    >
      <span
        className="panel-katman-nokta"
        style={{ background: renkler[tur], opacity: acik ? 1 : 0.45 }}
      />
      <span className="panel-katman-simge" aria-hidden="true">{simgeler[tur] || "•"}</span>
      <span className="panel-katman-icerik">
        <b>{tur === "park" ? "Parklar" : turAdlari[tur]}</b>
        <small>{adet ?? "—"} nokta</small>
      </span>
      <span className="panel-katman-durum" aria-hidden="true">
        {acik ? "✓" : "+"}
      </span>
    </button>
  );
}

export default function HaritaSayfasi({ mevsim, onMevsimSec }) {
  const [map, setMap] = useState(null);
  const { katmanlar, toggleLayer } = useKatmanlar(map);
  const {
    acik: detayAcik,
    icerikHtml,
    goster,
    gosterTesis,
    kapat,
    kopyalandi,
    setKopyalandi,
  } = useDetayPaneli();
  const { aramaIndeksi, tesisSayilari, veriDurumu } = useVeriYukle(
    map,
    katmanlar,
    goster,
    gosterTesis,
  );
  const [searchParams] = useSearchParams();

  const [panelOpen, setPanelOpen] = useState(true);
  const [acikKatmanlar, setAcikKatmanlar] = useState({ park: true });
  const [digerTesislerAcik, setDigerTesislerAcik] = useState(false);
  const [sahaDurumlariAcik, setSahaDurumlariAcik] = useState(false);
  const [aktifKesif, setAktifKesif] = useState(null);
  const [seciliMahalle, setSeciliMahalle] = useState("");
  const [panelSekmesi, setPanelSekmesi] = useState("kesfet");

  useEffect(() => {
    if (!katmanlar) return;
    Object.entries(acikKatmanlar).forEach(([tur, acik]) =>
      toggleLayer(tur, !!acik),
    );
    KATMAN_SIRASI.forEach((tur) => {
      if (!(tur in acikKatmanlar)) toggleLayer(tur, false);
    });
    toggleLayer("calisma", sahaDurumlariAcik);
  }, [acikKatmanlar, sahaDurumlariAcik, katmanlar]);

  useEffect(() => {
    if (!katmanlar?.park) return;
    const kokStil = getComputedStyle(document.documentElement);
    const mevsimVurgu = kokStil.getPropertyValue("--accent").trim();
    const mevsimKoyu = kokStil.getPropertyValue("--dark").trim();
    katmanlar.park.eachLayer((layer) => {
      if (layer.setStyle)
        layer.setStyle({ fillColor: mevsimVurgu, color: mevsimKoyu });
    });
  }, [mevsim, katmanlar]);

  useEffect(() => {
    const parkId = searchParams.get("park");
    if (parkId) {
      setPanelOpen(true);
      goster(parkId, null);
    }
  }, [searchParams]);

  function katmanToggle(tur) {
    setAcikKatmanlar((s) => ({ ...s, [tur]: !s[tur] }));
  }

  function parkGorunurYap() {
    setAcikKatmanlar((s) => ({ ...s, park: true }));
  }

  // Hızlı filtreleme: tek tuşla "sadece parklar" ya da "hepsini göster"
  function sadeceParklariGoster() {
    setAcikKatmanlar({ park: true });
  }
  function tumunuGoster() {
    const hepsi = { park: true };
    KATMAN_SIRASI.forEach((tur) => {
      hepsi[tur] = true;
    });
    setAcikKatmanlar(hepsi);
    setDigerTesislerAcik(true);
  }

  function kesifSec(mod) {
    const sonraki = aktifKesif === mod.id ? null : mod.id;
    setAktifKesif(sonraki);
    if (!sonraki) return sadeceParklariGoster();
    const durum = {};
    mod.katmanlar.forEach((tur) => { durum[tur] = true; });
    setAcikKatmanlar(durum);
    setDigerTesislerAcik(false);
  }

  const acikSayisi = Object.values(acikKatmanlar).filter(Boolean).length;
  const mahalleler = [...new Set(aramaIndeksi.map((park) => park.mahalle).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, "tr"));

  function mahalleyeOdaklan(mahalle) {
    setSeciliMahalle(mahalle);
    if (!mahalle || !map) return;
    const parklar = aramaIndeksi.filter((park) => park.mahalle === mahalle);
    if (parklar.length === 1) {
      map.flyTo(parklar[0].merkez, 15, { duration: 0.55 });
    } else if (parklar.length > 1) {
      map.fitBounds(parklar.map((park) => [park.merkez.lat, park.merkez.lng]), { padding: [55, 55], maxZoom: 15 });
    }
    parkGorunurYap();
  }

  function panelIcerikTiklandi(e) {
    const buton = e.target.closest("#detay-paylas-btn");
    if (!buton) return;
    const parkId = buton.dataset.parkId;
    const link = `${window.location.origin}${window.location.pathname}#/harita?park=${parkId}`;
    navigator.clipboard.writeText(link).then(() => {
      setKopyalandi(true);
      setTimeout(() => setKopyalandi(false), 2000);
    });
  }

  return (
    <div id="harita-sayfasi">
      <Harita onMapReady={setMap} />

      <div id="harita-ustbar">
        <div id="harita-ustbar-sol">
          <img id="harita-kbb-logo" src="/kbb-logo.png" alt="Kayseri Büyükşehir Belediyesi" />
          <span id="harita-ustbar-logo">
            yeşil<span>alanlar</span>
          </span>
          <span id="harita-ustbar-ayrac" />
          <span id="harita-ustbar-etiket">Harita</span>
        </div>
        <div id="harita-ustbar-sag">
          <button
            id="harita-panel-toggle"
            onClick={() => setPanelOpen((o) => !o)}
          >
            {panelOpen ? "Paneli kapat ›" : "‹ Paneli aç"}
          </button>
          <Link to="/" id="harita-anasayfa-btn">
            Anasayfaya dön
          </Link>
        </div>
      </div>

      {panelOpen && (
        <aside id="harita-panel" onClick={panelIcerikTiklandi}>
          {!detayAcik && (
            <>
              <div className="panel-karsilama">
                <span>HARİTA REHBERİ</span>
                <strong>Keşif katmanları</strong>
                <p>İhtiyacına göre haritayı sadeleştir veya zenginleştir.</p>
              </div>
              <Arama
                aramaIndeksi={aramaIndeksi}
                map={map}
                onParkGorunurYap={parkGorunurYap}
                onSonucSecildi={goster}
              />
              {veriDurumu === "yukleniyor" && <div className="veri-bilgi">Harita kayıtları yükleniyor…</div>}
              {veriDurumu === "hazir" && aramaIndeksi.length === 0 && (
                <div className="veri-bilgi bos">
                  <b>Henüz kayıtlı park yok.</b>
                  <span>Yönetim panelinden alan eklediğinizde burada görünür.</span>
                </div>
              )}
              {veriDurumu === "hata" && (
                <div className="veri-bilgi hata">
                  <b>Park verisine erişilemedi.</b>
                  <span>Bağlantıyı kontrol edip sayfayı yenileyin.</span>
                </div>
              )}
              <div className="panel-sekmeler" role="tablist">
                <button className={panelSekmesi === "kesfet" ? "aktif" : ""} onClick={() => setPanelSekmesi("kesfet")}>Keşfet</button>
                <button className={panelSekmesi === "filtre" ? "aktif" : ""} onClick={() => setPanelSekmesi("filtre")}>Filtrele</button>
              </div>

              {panelSekmesi === "kesfet" && <>
                <section className="kesif-modlari" aria-label="İhtiyaca göre keşif">
                  <div className="panel-bolum-baslik">BUGÜN NE YAPMAK İSTERSİN?</div>
                  <div className="kesif-modlari-izgara">
                    {KESIF_MODLARI.map((mod) => (
                      <button type="button" key={mod.id} className={`kesif-modu ${aktifKesif === mod.id ? "aktif" : ""}`} onClick={() => kesifSec(mod)}>
                        <b>{mod.etiket}</b><small>{mod.aciklama}</small>
                      </button>
                    ))}
                  </div>
                </section>
                {mahalleler.length > 0 && (
                  <section className="mahalle-odak">
                    <div className="panel-bolum-baslik">MAHALLEDE KEŞFET</div>
                    <select value={seciliMahalle} onChange={(e) => mahalleyeOdaklan(e.target.value)}>
                      <option value="">Mahalle seçin</option>
                      {mahalleler.map((mahalle) => {
                        const adet = aramaIndeksi.filter((park) => park.mahalle === mahalle).length;
                        return <option key={mahalle} value={mahalle}>{mahalle} · {adet} park</option>;
                      })}
                    </select>
                  </section>
                )}
                <Yakinimdakiler map={map} />
              </>}

              {panelSekmesi === "filtre" && <section className="panel-katman-bolumu">
                <div className="panel-katman-ust-satir">
                  <div className="panel-bolum-baslik">
                    HIZLI KEŞİF · {acikSayisi} açık
                  </div>
                  <div className="panel-hizli-filtre">
                    <button onClick={sadeceParklariGoster}>
                      Sadece parklar
                    </button>
                    <button onClick={tumunuGoster}>Tümünü göster</button>
                  </div>
                </div>
                <div className="panel-oncelikli-katmanlar">
                  {ONCELIKLI_KATMANLAR.map((tur) => (
                    <KatmanKarti
                      key={tur}
                      tur={tur}
                      acik={!!acikKatmanlar[tur]}
                      adet={tesisSayilari[tur]}
                      onToggle={() => katmanToggle(tur)}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  className="diger-tesisler-toggle"
                  onClick={() => setDigerTesislerAcik((acik) => !acik)}
                  aria-expanded={digerTesislerAcik}
                >
                  <span>Diğer tesisler</span>
                  <span>{DIGER_KATMANLAR.length} kategori · {digerTesislerAcik ? "−" : "+"}</span>
                </button>
                {digerTesislerAcik && (
                  <div className="panel-diger-katmanlar">
                    {DIGER_KATMANLAR.map((tur) => (
                      <KatmanKarti
                        key={tur}
                        tur={tur}
                        acik={!!acikKatmanlar[tur]}
                        adet={tesisSayilari[tur]}
                        onToggle={() => katmanToggle(tur)}
                      />
                    ))}
                  </div>
                )}
                <button
                  type="button"
                  className={`saha-durum-karti ${sahaDurumlariAcik ? "aktif" : ""}`}
                  onClick={() => setSahaDurumlariAcik((acik) => !acik)}
                >
                  <span className="saha-durum-isaret">◌</span>
                  <span><b>Saha durumları</b><small>{tesisSayilari.calisma || 0} bakım veya iyileştirme kaydı</small></span>
                  <em>{sahaDurumlariAcik ? "Gizle" : "Göster"}</em>
                </button>
              </section>}

              {panelSekmesi === "filtre" && <div>
                <div className="panel-bolum-baslik">MEVSİM</div>
                <div className="panel-mevsim-izgara">
                  {MEVSIMLER.map((m) => (
                    <button
                      key={m.id}
                      className={`panel-mevsim-btn ${m.id === mevsim ? "aktif" : ""}`}
                      onClick={() => onMevsimSec(m.id)}
                    >
                      {m.etiket}
                    </button>
                  ))}
                </div>
              </div>}
            </>
          )}

          {detayAcik && (
            <div>
              <button id="panel-geri-btn" onClick={kapat}>
                ← Katmanlara dön
              </button>
              <div dangerouslySetInnerHTML={{ __html: icerikHtml }} />
              {kopyalandi && <div id="paylas-onay">Bağlantı kopyalandı ✓</div>}
            </div>
          )}
        </aside>
      )}
    </div>
  );
}
