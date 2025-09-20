import { useEffect, useState } from "react";

export function useTheme() {
  const [mounted, setMounted] = useState(false);
  const [dark, setDark] = useState(() =>
    typeof document !== "undefined" && document.documentElement.classList.contains("dark")
  );

  useEffect(() => {
    setMounted(true);
    if (typeof document === "undefined") return;
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const setTheme = (mode) => {
    if (typeof document === "undefined") return;
    if (mode === "dark") document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
    localStorage.setItem("theme", mode);
    setDark(mode === "dark");
  };

  const toggle = () => setTheme(dark ? "light" : "dark");

  return { mounted, dark, setTheme, toggle };
}
