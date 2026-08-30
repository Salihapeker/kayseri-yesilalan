import { API } from './config.js';
import { map, cizimKatmani } from './admin-harita.js';
import { parklariYenidenYukle, parkSec } from './admin-duzenle.js';
import { tesisleriYukle } from './admin-harita.js';

let sayac = 0;

map.on(L.Draw.Event.CREATED, (e) => {
  const layer = e.layer;
  const tip = e.layerType;
  const kimlik = 'sekil-' + (sayac++);

  cizimKatmani.addLayer(layer);

  const formHtml = tip === 'polygon'
    ? `
      <div class="mini-form cbs-ekleme-karti" data-id="${kimlik}">
        <span class="ekleme-kicker">YENİ YEŞİL ALAN</span>
        <b>Park sınırı ekle</b>
        <p>Çizdiğiniz alan envantere yeni park olarak kaydedilir.</p>
        <label>İsim</label>
        <input type="text" id="isim-${kimlik}" placeholder="Park adı" />
        <label>Mahalle</label>
        <input type="text" id="mahalle-${kimlik}" placeholder="Opsiyonel" />
        <button id="kaydet-${kimlik}">Parkı kaydet</button>
        <div class="durum" id="durum-${kimlik}"></div>
      </div>`
    : `
      <div class="mini-form cbs-ekleme-karti" data-id="${kimlik}">
        <span class="ekleme-kicker">TESİS EKLE</span>
        <b>Yeni tesis noktası</b>
        <p>Park sınırı içindeki tesisler, ilgili parkın detaylarına otomatik eklenir.</p>
        <label>Tür</label>
        <select id="tur-${kimlik}">
          <option value="tuvalet">Tuvalet</option>
          <option value="cocuk_oyun_alani">Çocuk oyun alanı</option>
          <option value="spor_sahasi">Spor sahası</option>
          <option value="cesme">Çeşme</option>
          <option value="otopark">Otopark</option>
          <option value="kafeterya">Kafeterya</option>
          <option value="bank">Bank</option>
          <option value="piknik_alani">Piknik alanı</option>
        </select>
        <label>İsim</label>
        <input type="text" id="isim-${kimlik}" placeholder="Opsiyonel" />
        <button id="kaydet-${kimlik}">Tesisi kaydet</button>
        <div class="durum" id="durum-${kimlik}"></div>
      </div>`;

  layer.on('popupopen', () => {
    const kaydetBtn = document.getElementById(`kaydet-${kimlik}`);
    if (!kaydetBtn || kaydetBtn.dataset.baglandi) return;
    kaydetBtn.dataset.baglandi = '1';

    kaydetBtn.addEventListener('click', async () => {
      const durum = document.getElementById(`durum-${kimlik}`);
      const isim = document.getElementById(`isim-${kimlik}`).value.trim();

      try {
        if (tip === 'polygon') {
          if (!isim) { durum.textContent = 'İsim gerekli.'; durum.style.color = 'crimson'; return; }
          const mahalle = document.getElementById(`mahalle-${kimlik}`).value.trim();
          const geojson = layer.toGeoJSON().geometry;
          await fetch(`${API}/yesil-alanlar`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ad: isim, mahalle, geojson })
          });
          cizimKatmani.removeLayer(layer);
          parklariYenidenYukle();
        } else {
          const tur = document.getElementById(`tur-${kimlik}`).value;
          const latlng = layer.getLatLng();
          const yanit = await fetch(`${API}/tesisler`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tur, ad: isim || null, lon: latlng.lng, lat: latlng.lat })
          });
          if (!yanit.ok) throw new Error('Tesis kaydedilemedi');
          const sonuc = await yanit.json();
          cizimKatmani.removeLayer(layer);
          tesisleriYukle(API);
          if (sonuc.yesil_alan_id) {
            durum.textContent = 'Tesis parka eklendi. Düzenleme paneli açılıyor…';
            durum.style.color = 'var(--basari)';
            document.dispatchEvent(new CustomEvent('kayseri:veri-degisti'));
            setTimeout(() => parkSec(sonuc.yesil_alan_id), 500);
            return;
          }
          durum.textContent = 'Tesis kaydedildi; bu nokta bir park sınırı içinde değil.';
          durum.style.color = '#9a6507';
          document.dispatchEvent(new CustomEvent('kayseri:veri-degisti'));
          return;
        }

        durum.textContent = 'Kaydedildi ✓';
        document.dispatchEvent(new CustomEvent('kayseri:veri-degisti'));
      } catch (err) {
        durum.textContent = 'Hata: ' + err.message;
        durum.style.color = 'crimson';
      }
    });
  });

  layer.bindPopup(formHtml, { closeOnClick: false, autoClose: false, minWidth: 310, maxWidth: 310 });
  layer.openPopup();
});
