import { useState, useCallback } from "react";
import { API, renkler, turAdlari, alanYaz, mesafeYaz } from "../config";

function geometridenMerkezCikar(geometry) {
  if (!geometry) return null;
  if (geometry.type === "Point") return geometry.coordinates;

  const halka =
    geometry.type === "Polygon"
      ? geometry.coordinates[0]
      : geometry.coordinates[0][0];

  const toplam = halka.reduce(
    (acc, [lon, lat]) => [acc[0] + lon, acc[1] + lat],
    [0, 0],
  );
  return [toplam[0] / halka.length, toplam[1] / halka.length];
}

export function useDetayPaneli() {
  const [acik, setAcik] = useState(false);
  const [icerikHtml, setIcerikHtml] = useState(
    '<p class="yukleniyor-yazi">Yükleniyor...</p>',
  );
  const [kopyalandi, setKopyalandi] = useState(false);

  const goster = useCallback(async (parkId, merkezLatLng) => {
    setAcik(true);
    setKopyalandi(false);
    setIcerikHtml('<p class="yukleniyor-yazi">Yükleniyor...</p>');

    const detay = await fetch(`${API}/yesil-alanlar/${parkId}`).then((r) =>
      r.json(),
    );
    const o = detay.tesis_ozeti;
    const ek = detay.ek_ozellikler || {};

    const [lon, lat] = merkezLatLng ||
      geometridenMerkezCikar(detay.geometry) || [35.4787, 38.7312];
    const yolTarifiUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`;

    const turler = [
      "tuvalet",
      "cocuk_oyun_alani",
      "spor_sahasi",
      "cesme",
      "kafeterya",
      "otopark",
    ];
    const satirlar = [];
    let varOlanSayisi = 0;

    for (const tur of turler) {
      const adet = o[tur] || 0;
      const renk = renkler[tur];

      if (adet > 0) {
        varOlanSayisi++;
        satirlar.push(`
          <div class="madde-satir var-durum">
            <span class="madde-nokta" style="background:${renk}"></span>
            <div class="madde-metin"><b>${turAdlari[tur]} var</b>${adet > 1 ? `<span class="alt-bilgi">${adet} tane</span>` : ""}</div>
          </div>`);
      } else {
        const alternatif = await fetch(
          `${API}/tesisler/en-yakin?lon=${lon}&lat=${lat}&tur=${tur}&limit=1`,
        ).then((r) => r.json());
        const altYazi =
          alternatif.length > 0
            ? `<span class="alt-bilgi">En yakını ${alternatif[0].park_adi ? alternatif[0].park_adi : alternatif[0].ad || turAdlari[tur]} · ${mesafeYaz(alternatif[0].mesafe_m)}</span>`
            : "";
        satirlar.push(`
          <div class="madde-satir yok-durum">
            <span class="madde-nokta" style="background:${renk}; opacity:0.3"></span>
            <div class="madde-metin"><b>${turAdlari[tur]} yok</b>${altYazi}</div>
          </div>`);
      }
    }

    const ekSatirlar = [];
    if (ek.aydinlatma)
      ekSatirlar.push(
        `<div class="madde-satir var-durum"><span class="madde-nokta" style="background:#B5651D"></span><div class="madde-metin"><b>Aydınlatma var</b></div></div>`,
      );

    const durumEtiketleri = {
      acik: "Ziyarete açık",
      bakimda: "Geçici bakım çalışması var",
      proje: "İyileştirme projesi sürüyor",
    };
    const durum = ek.bakim_durumu || "acik";
    const etiketler = Array.isArray(ek.etiketler) ? ek.etiketler.filter(Boolean) : [];
    const guncelleme = ek.son_guncelleme || "Belediye envanterinden güncellenir";
    if (ek.engelli_erisimi)
      ekSatirlar.push(
        `<div class="madde-satir var-durum"><span class="madde-nokta" style="background:#5C7A8A"></span><div class="madde-metin"><b>Engelli erişimi var</b></div></div>`,
      );

    setIcerikHtml(`
      <div class="detay-ust">${detay.mahalle || "Kayseri"}</div>
      <div class="detay-baslik">${detay.ad}</div>
      <div class="detay-alt">${ek.acilis_saatleri ? ek.acilis_saatleri + " · " : ""}${alanYaz(detay.alan_m2)}</div>

      <div class="detay-durum ${durum}"><span></span>${durumEtiketleri[durum] || durumEtiketleri.acik}</div>
      ${ek.kisa_aciklama ? `<p class="detay-aciklama">${ek.kisa_aciklama}</p>` : ""}
      ${etiketler.length ? `<div class="detay-etiketler">${etiketler.map((etiket) => `<span>${etiket}</span>`).join("")}</div>` : ""}

      <div class="detay-ozet-satiri">
        <span class="detay-ozet-rozet">${varOlanSayisi}/${turler.length} tesis türü mevcut</span>
      </div>

      <div class="neler-yapabilirsin">Burada neler yapabilirsin</div>
      ${satirlar.join("")}
      ${ekSatirlar.join("")}

      <div class="detay-buton-satiri">
        <a class="yol-tarifi-btn" href="${yolTarifiUrl}" target="_blank" rel="noopener">Yol tarifini aç</a>
        <button id="detay-paylas-btn" data-park-id="${parkId}" class="paylas-btn">Bağlantıyı kopyala</button>
        <a class="bildirim-btn" href="https://www.kayseri.bel.tr/beyaz-masa" target="_blank" rel="noopener">Eksik ya da sorun bildir</a>
      </div>
      <p class="detay-guncelleme">Envanter notu: ${guncelleme}</p>
    `);
  }, []);

  // Tekil bir tesise (tuvalet, çeşme vb.) tıklanınca açılan sade kart.
  // Parkın tam detayından farklı olarak burada sadece o tek nokta bilgisi var,
  // ama görünüm/his aynı — kullanıcı hangisine tıklarsa tıklasın tutarlı bir deneyim yaşıyor.
  const gosterTesis = useCallback((tesis) => {
    setAcik(true);
    setKopyalandi(false);
    const yolTarifiUrl = `https://www.google.com/maps/dir/?api=1&destination=${tesis.lat},${tesis.lon}`;
    const renk = renkler[tesis.tur] || "#5C7A8A";

    setIcerikHtml(`
      <div class="detay-ust">${turAdlari[tesis.tur] || "Tesis"}</div>
      <div class="detay-baslik">${tesis.ad || "İsimsiz " + (turAdlari[tesis.tur] || "tesis")}</div>
      <div class="detay-alt">${tesis.parkAdi ? "Bağlı olduğu park: " + tesis.parkAdi : "Bağımsız nokta"}</div>

      <div class="madde-satir var-durum">
        <span class="madde-nokta" style="background:${renk}"></span>
        <div class="madde-metin"><b>${turAdlari[tesis.tur] || "Tesis"}</b><span class="alt-bilgi">Bu noktada mevcut</span></div>
      </div>

      <div class="detay-buton-satiri">
        <a class="yol-tarifi-btn" href="${yolTarifiUrl}" target="_blank" rel="noopener">Yol tarifini aç</a>
      </div>
    `);
  }, []);

  const kapat = useCallback(() => setAcik(false), []);

  return {
    acik,
    icerikHtml,
    goster,
    gosterTesis,
    kapat,
    kopyalandi,
    setKopyalandi,
  };
}
