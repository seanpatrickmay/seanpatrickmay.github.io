// components/ui/UnitToggle.jsx
export default function UnitToggle({ unit = "mi", onChange }) {
  const isMi = unit === "mi";
  return (
    <button
      type="button"
      onClick={() => onChange(isMi ? "km" : "mi")}
      className="inline-flex items-center gap-2 px-2 py-1 rounded-full border text-xs hover:bg-white dark:hover:bg-slate-800"
      aria-label="Toggle miles/kilometers"
      title="Toggle miles/kilometers"
    >
      <span className={`px-2 py-0.5 rounded-full ${isMi ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900" : ""}`}>
        mi
      </span>
      <span className={`px-2 py-0.5 rounded-full ${!isMi ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900" : ""}`}>
        km
      </span>
    </button>
  );
}

