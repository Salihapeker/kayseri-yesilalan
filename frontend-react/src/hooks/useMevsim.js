import { useEffect, useState } from "react";

function gercekMevsim() {
  const ay = new Date().getMonth(); // 0 = Ocak
  if (ay >= 2 && ay <= 4) return "ilkbahar";
  if (ay >= 5 && ay <= 7) return "yaz";
  if (ay >= 8 && ay <= 10) return "sonbahar";
  return "kis";
}

export function useMevsim() {
  const [mevsim, setMevsimState] = useState(() => {
    return localStorage.getItem("kayseri-mevsim") || gercekMevsim();
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-mevsim", mevsim);
  }, [mevsim]);

  function setMevsim(id) {
    setMevsimState(id);
    localStorage.setItem("kayseri-mevsim", id);
  }

  return { mevsim, setMevsim };
}
