import { API } from './config.js';
import { tesisleriYukle } from './admin-harita.js';
import './admin-duzenle.js';
import './admin-son-eklenenler.js';
import './admin-cizim.js';

tesisleriYukle(API);

async function kayitOzetiniYukle() {
  const kutu = document.getElementById("admin-kayit-sayisi");
  try {
    const veri = await fetch(`${API}/yesil-alanlar`).then((r) => {
      if (!r.ok) throw new Error("API yanıt vermedi");
      return r.json();
    });
    kutu.textContent = `${veri.features?.length || 0} alan`;
  } catch {
    kutu.textContent = "Bağlantı yok";
  }
}

kayitOzetiniYukle();
document.addEventListener("kayseri:veri-degisti", kayitOzetiniYukle);
