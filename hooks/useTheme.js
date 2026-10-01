import { useEffect, useState } from "react";

const isDark = () => document.documentElement.classList.contains("dark");

export function useTheme() {
  const [mounted, setMounted] = useState(false);
  const [dark, setDark] = useState(() =>
    typeof document !== "undefined" && isDark()
  );

  // The class on <html> is the only source of truth. There is a toggle in the
  // sidebar and another in the mobile header, each with its own copy of this
  // state; without watching the class, flipping one left the other stale
  // across a resize — wrong icon, and its first click re-applied the current
  // theme instead of switching.
  useEffect(() => {
    setMounted(true);
    if (typeof document === "undefined") return;
    setDark(isDark());
    const observer = new MutationObserver(() => setDark(isDark()));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const setTheme = (mode) => {
    if (typeof document === "undefined") return;
    if (mode === "dark") document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
    try { localStorage.setItem("theme", mode); } catch {}
    setDark(mode === "dark");
  };

  const toggle = () => setTheme(isDark() ? "light" : "dark");

  return { mounted, dark, setTheme, toggle };
}
