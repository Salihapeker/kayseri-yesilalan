import express from "express";
import cors from "cors";
import "dotenv/config";

import yesilAlanRoutes from "./routes/yesilAlanRoutes.js";
import tesisRoutes from "./routes/tesisRoutes.js";
import * as TesisController from "./controllers/tesisController.js";

const app = express();
app.use(cors());
app.use(express.json());

// Dağıtım kontrolü: Bu endpoint veritabanına sorgu yapmaz.
// 200 dönüyorsa Render üzerindeki Express uygulaması çalışıyordur.
app.get("/api/saglik", (_req, res) => {
  res.json({ durum: "calisiyor", zaman: new Date().toISOString() });
});

app.use("/api/yesil-alanlar", yesilAlanRoutes);
app.use("/api/tesisler", tesisRoutes);
app.get("/api/yakinimdakiler", TesisController.yakinimdakiler);
app.get("/api/son-eklenenler", TesisController.sonEklenenler);

app.listen(process.env.PORT, () => {
  console.log(`API çalışıyor: http://localhost:${process.env.PORT}`);
});
