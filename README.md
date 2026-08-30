# Kayseri Yeşil Alanlar CBS

Kayseri Büyükşehir Belediyesi Coğrafi Bilgi Sistemleri Şube Müdürlüğü ile geliştirilen, parklar ve açık alan tesislerini vatandaşlar ile yönetim birimi için haritada sunan uygulama.

## Uygulamalar

| Konum             | Amaç                                                           | Yerel adres |
| ----------------- | -------------------------------------------------------------- | ----------- |
| `frontend-react/` | Vatandaş arayüzü: keşif, arama, park detayı, tesis filtreleri  |
| `frontend/`       | Yönetim arayüzü: alan/tesis ekleme ve park envanteri düzenleme |
| `backend/`        | Express + PostGIS API                                          |

## Özellikler

- Park sınırları ve tesis katmanları
- Park, mahalle ve tesis bazlı arama
- Tesis simgeleri: WC, otopark, çeşme, spor alanı, kafe, piknik vb.
- Park ayrıntıları, erişilebilirlik ve bakım durumu
- Yakındaki tesisleri bulma ve yol tarifi
- Yönetimde çizim araçları ile yeşil alan veya tesis ekleme
- Park sınırı içindeki yeni tesislerin ilgili parka otomatik bağlanması
- Mevsim vurguları ve mobil kullanım için PWA yapılandırması
- Resmî Kayseri Büyükşehir Belediyesi logosu

## Gereksinimler

- Node.js 20 veya üzeri
- PostgreSQL + PostGIS
- `backend/.env` içinde bağlantı bilgileri

Örnek `backend/.env`:

```env
DATABASE_URL=postgresql://kullanici:sifre@localhost:5432/kayseri_cbs
PORT=3000
```

## Yerelde çalıştırma

Üç terminal açın.

```powershell
# 1. API
cd backend
npm install
node server.js
```

```powershell
# 2. Vatandaş arayüzü
cd frontend-react
npm install
npm run dev -- --host 127.0.0.1
```

```powershell
# 3. Yönetim arayüzü (statik dosya sunucusu)
cd frontend
..\frontend-react\node_modules\.bin\vite.cmd --host 127.0.0.1 --port 5174
```

## Üretim derlemesi

```powershell
cd frontend-react
npm run build
```

Derlenmiş vatandaş arayüzü `frontend-react/dist/` altında oluşur.

## API özeti

| Yöntem | Adres                               | Açıklama                        |
| ------ | ----------------------------------- | ------------------------------- |
| `GET`  | `/api/yesil-alanlar`                | Park/yeşil alan GeoJSON listesi |
| `GET`  | `/api/yesil-alanlar/:id`            | Park ayrıntısı ve tesis özeti   |
| `POST` | `/api/yesil-alanlar`                | Yeni park alanı ekleme          |
| `PUT`  | `/api/yesil-alanlar/:id`            | Park adı ve mahalle güncelleme  |
| `PUT`  | `/api/yesil-alanlar/:id/ozellikler` | Ek özellikleri güncelleme       |
| `GET`  | `/api/tesisler`                     | Tesis GeoJSON listesi           |
| `POST` | `/api/tesisler`                     | Yeni tesis ekleme               |
| `GET`  | `/api/yakinimdakiler`               | Konuma göre yakın kayıtlar      |

## Proje yapısı

```text
kayseri-cbs-yeni/
├── backend/          API, veri modelleri ve rotalar
├── frontend/         Yönetim paneli
├── frontend-react/   Vatandaş arayüzü
├── docker-compose.yml
└── README.md
```

## Notlar

- Belediye logosu, resmî sayfasındaki yayınlanan paketten alınmıştır.
- Tesisin park sayacına girmesi için tesis noktasının park sınırı içinde olması gerekir.
- `node_modules/`, `dist/` ve Vite önbellekleri kaynak kod değildir; gerektiğinde komutlarla tekrar üretilir.
