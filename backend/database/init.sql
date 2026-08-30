-- Kayseri Yeşil Alanlar CBS başlangıç şeması
-- Güvenle tekrar çalıştırılabilir (idempotent).

CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS yesil_alanlar (
  id BIGSERIAL PRIMARY KEY,
  ad TEXT NOT NULL,
  tur TEXT NOT NULL DEFAULT 'park',
  mahalle TEXT,
  sinir geometry(Geometry, 4326),
  konum geometry(Point, 4326),
  durum TEXT NOT NULL DEFAULT 'aktif',
  ozellikler JSONB NOT NULL DEFAULT '{}'::jsonb,
  olusturma_tarihi TIMESTAMPTZ NOT NULL DEFAULT now(),
  guncelleme_tarihi TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT yesil_alanlar_durum_kontrol CHECK (durum IN ('aktif', 'silindi'))
);

CREATE TABLE IF NOT EXISTS tesisler (
  id BIGSERIAL PRIMARY KEY,
  tur TEXT NOT NULL,
  ad TEXT,
  mahalle TEXT,
  yesil_alan_id BIGINT REFERENCES yesil_alanlar(id) ON DELETE SET NULL,
  konum geometry(Point, 4326) NOT NULL,
  durum TEXT NOT NULL DEFAULT 'aktif',
  ozellikler JSONB NOT NULL DEFAULT '{}'::jsonb,
  olusturma_tarihi TIMESTAMPTZ NOT NULL DEFAULT now(),
  guncelleme_tarihi TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT tesisler_durum_kontrol CHECK (durum IN ('aktif', 'silindi'))
);

CREATE INDEX IF NOT EXISTS yesil_alanlar_sinir_gist_idx ON yesil_alanlar USING GIST (sinir);
CREATE INDEX IF NOT EXISTS yesil_alanlar_konum_gist_idx ON yesil_alanlar USING GIST (konum);
CREATE INDEX IF NOT EXISTS tesisler_konum_gist_idx ON tesisler USING GIST (konum);
CREATE INDEX IF NOT EXISTS tesisler_yesil_alan_idx ON tesisler (yesil_alan_id);
CREATE INDEX IF NOT EXISTS tesisler_durum_tur_idx ON tesisler (durum, tur);
