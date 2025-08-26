import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

export default function ThemeToggle() {
  const { mounted, dark, toggle } = useTheme();
  if (!mounted) return null;
  return (
    <button onClick={toggle} aria-label="Toggle theme"
      className="px-3 py-2 rounded-full border hover:bg-white dark:hover:bg-slate-800 flex items-center gap-2">
      {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      <span className="hidden sm:inline">{dark ? "Light" : "Dark"}</span>
    </button>
  );
}

