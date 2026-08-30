import { useEffect, useState } from "react";
import { API } from "../config";

// Backend'de ayrı bir "mahalle karnesi" ucu yok, o yüzden zaten çektiğimiz
// park listesinden mahalle bazında sayarak gerçek bir sıralama çıkarıyoruz.
export function useMahalleSiralamasi() {
  const [siralama, setSiralama] = useState(null);

  useEffect(() => {
    fetch(`${API}/yesil-alanlar`)
      .then((r) => r.json())
      .then((data) => {
        const sayaç = {};
        data.features.forEach((f) => {
          const mahalle = f.properties.mahalle;
          if (!mahalle) return;
          sayaç[mahalle] = (sayaç[mahalle] || 0) + 1;
        });

        const siraliListe = Object.entries(sayaç)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 4);

        const enYuksek = siraliListe[0]?.[1] || 1;
        setSiralama(
          siraliListe.map(([ad, adet]) => ({
            ad,
            adet,
            yuzde: Math.round((adet / enYuksek) * 100),
          })),
        );
      })
      .catch(() => setSiralama([]));
  }, []);

  return siralama;
}
