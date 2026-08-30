import pool from "../db.js";

export async function tumunuGetir() {
  const { rows } = await pool.query(`
    SELECT id, ad, tur, mahalle, ozellikler,
           guncelleme_tarihi,
           ST_AsGeoJSON(COALESCE(sinir, konum))::json AS geometry
    FROM yesil_alanlar
    WHERE durum = 'aktif'
  `);
  return rows;
}

export async function idIleGetir(id) {
  const { rows } = await pool.query(
    `SELECT id, ad, mahalle, ozellikler AS ek_ozellikler,
            ST_AsGeoJSON(COALESCE(sinir, konum))::json AS geometry,
            ROUND(ST_Area(sinir::geography)) AS alan_m2
     FROM yesil_alanlar WHERE id = $1 AND durum = 'aktif'`,
    [id],
  );
  return rows[0] || null;
}

export async function tesisOzetiGetir(parkId) {
  const { rows } = await pool.query(
    `SELECT t.id, t.tur, t.ad
     FROM tesisler t
     JOIN yesil_alanlar y ON y.id = $1
     WHERE t.durum = 'aktif'
       AND (
         t.yesil_alan_id = $1
         OR (y.sinir IS NOT NULL AND ST_Covers(y.sinir, t.konum))
       )
     ORDER BY t.tur`,
    [parkId],
  );
  const ozellikler = {
    tuvalet: 0,
    cocuk_oyun_alani: 0,
    spor_sahasi: 0,
    cesme: 0,
    otopark: 0,
    kafeterya: 0,
    bank: 0,
    piknik_alani: 0,
  };
  rows.forEach((r) => {
    ozellikler[r.tur] = (ozellikler[r.tur] || 0) + 1;
  });
  return { ozellikler, liste: rows };
}

export async function guncelle(id, { ad, mahalle }) {
  await pool.query(
    `UPDATE yesil_alanlar SET ad = $1, mahalle = $2, guncelleme_tarihi = now() WHERE id = $3`,
    [ad, mahalle || null, id],
  );
}

export async function ozellikleriGuncelle(id, ozellikler) {
  await pool.query(`UPDATE yesil_alanlar SET ozellikler = $1 WHERE id = $2`, [
    JSON.stringify(ozellikler),
    id,
  ]);
}

export async function sil(id) {
  await pool.query(`UPDATE yesil_alanlar SET durum = 'silindi' WHERE id = $1`, [
    id,
  ]);
}

export async function olustur({ ad, mahalle, geojson }) {
  const { rows } = await pool.query(
    `INSERT INTO yesil_alanlar (ad, mahalle, sinir, konum)
     VALUES ($1, $2, ST_SetSRID(ST_GeomFromGeoJSON($3), 4326), ST_Centroid(ST_SetSRID(ST_GeomFromGeoJSON($3), 4326)))
     RETURNING id`,
    [ad, mahalle || null, JSON.stringify(geojson)],
  );
  return rows[0].id;
}
export async function hizliTesisEkle(parkId, tur) {
  const { rows } = await pool.query(
    `INSERT INTO tesisler (tur, yesil_alan_id, konum)
     SELECT $2, $1, konum FROM yesil_alanlar WHERE id = $1
     RETURNING id`,
    [parkId, tur],
  );
  return rows[0]?.id;
}
export async function tesisSilBirTane(parkId, tur) {
  const { rows } = await pool.query(
    `SELECT id FROM tesisler WHERE yesil_alan_id = $1 AND tur = $2 AND durum = 'aktif' ORDER BY id DESC LIMIT 1`,
    [parkId, tur],
  );
  if (rows.length === 0) return null;
  await pool.query(`UPDATE tesisler SET durum = 'silindi' WHERE id = $1`, [
    rows[0].id,
  ]);
  return rows[0].id;
}

export async function istatistikleriGetir() {
  const { rows } = await pool.query(`
    SELECT
      (SELECT count(*) FROM yesil_alanlar WHERE durum = 'aktif') AS park_sayisi,
      (SELECT count(*) FROM tesisler WHERE durum = 'aktif') AS tesis_sayisi,
      (SELECT COALESCE(SUM(ST_Area(sinir::geography)), 0) FROM yesil_alanlar WHERE durum = 'aktif') AS toplam_alan_m2,
      (SELECT count(*) FROM tesisler WHERE tur = 'cocuk_oyun_alani' AND durum = 'aktif') AS oyun_alani_sayisi,
      (SELECT count(DISTINCT mahalle) FROM yesil_alanlar WHERE mahalle IS NOT NULL AND durum = 'aktif') AS mahalle_sayisi
  `);
  const r = rows[0];
  return {
    toplam_nokta: Number(r.park_sayisi) + Number(r.tesis_sayisi),
    toplam_alan_hektar:
      Math.round((Number(r.toplam_alan_m2) / 10000) * 10) / 10,
    oyun_alani_sayisi: Number(r.oyun_alani_sayisi),
    mahalle_sayisi: Number(r.mahalle_sayisi),
    park_sayisi: Number(r.park_sayisi),
  };
}
