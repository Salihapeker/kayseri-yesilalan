import { useEffect, useState } from "react";
import { API } from "../config";

export function useIstatistikler() {
  const [istatistikler, setIstatistikler] = useState(null);

  useEffect(() => {
    fetch(`${API}/yesil-alanlar/istatistikler`)
      .then((r) => r.json())
      .then(setIstatistikler)
      .catch(() => setIstatistikler(null));
  }, []);

  return istatistikler;
}
