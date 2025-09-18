import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

export default function ThemeToggle() {
  const { mounted, dark, toggle } = useTheme();
  if (!mounted) return null;
  return (
    <button onClick={toggle} aria-label="Toggle theme"
      className="pill-accent">
      {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      <span className="hidden sm:inline">{dark ? "Light" : "Dark"}</span>
    </button>
  );
}

