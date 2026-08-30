import { useState } from "react";

export default function Arama({
  aramaIndeksi,
  map,
  onParkGorunurYap,
  onSonucSecildi,
}) {
  const [sorgu, setSorgu] = useState("");

  const eslesenler =
    sorgu.trim().length < 2
      ? []
      : aramaIndeksi
          .filter(
            (p) =>
              p.ad
                .toLocaleLowerCase("tr-TR")
                .includes(sorgu.toLocaleLowerCase("tr-TR")) ||
              p.mahalle
                .toLocaleLowerCase("tr-TR")
                .includes(sorgu.toLocaleLowerCase("tr-TR")),
          )
          .slice(0, 6);

  function sonucaTikla(p) {
    onParkGorunurYap();
    map.setView(p.merkez, 16);
    onSonucSecildi(p.id, [p.merkez.lng, p.merkez.lat]);
    setSorgu("");
  }

  return (
    <div id="panel-arama">
      <input
        type="text"
        id="arama-kutu"
        placeholder="Park veya mahalle ara..."
        value={sorgu}
        onChange={(e) => setSorgu(e.target.value)}
      />
      {eslesenler.length > 0 && (
        <div id="arama-sonuc">
          {eslesenler.map((p) => (
            <div key={p.id} onClick={() => sonucaTikla(p)}>
              {p.mahalle ? `${p.ad} — ${p.mahalle}` : p.ad}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
