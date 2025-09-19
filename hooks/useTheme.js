import { useEffect, useState } from "react";

export function useTheme() {
  const [mounted, setMounted] = useState(false);
  const isDark = () => typeof document !== "undefined" && document.documentElement.classList.contains("dark");

  useEffect(() => { setMounted(true); }, []);

  const setTheme = (mode) => {
    if (mode === "dark") document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
    localStorage.setItem("theme", mode);
  };

  return { mounted, dark: isDark(), setTheme, toggle: () => setTheme(isDark() ? "light" : "dark") };
}

