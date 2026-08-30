// Yönetim paneli yerelde lokal API'yi, Vercel'de Render API'sini kullanır.
const yereldeMi = ["localhost", "127.0.0.1"].includes(window.location.hostname);
export const API = yereldeMi
  ? "http://localhost:3000/api"
  : "https://kayseri-yesilalan.onrender.com/api";
