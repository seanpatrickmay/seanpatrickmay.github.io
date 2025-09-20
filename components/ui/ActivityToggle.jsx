// components/ui/ActivityToggle.jsx
export default function ActivityToggle({ activity = "combined", onChange }) {
  const options = [
    { key: "combined", label: "All" },
    { key: "biking", label: "Biking" },
    { key: "running", label: "Running" },
  ];
  return (
    <div className="inline-flex items-center gap-2 text-xs">
      {options.map(o => (
        <button
          key={o.key}
          type="button"
          onClick={() => onChange(o.key)}
          className={`px-2 py-1 rounded-full border ${
            activity === o.key ?
              "bg-slate-900 text-white dark:bg-white dark:text-slate-900" :
              "hover:bg-white dark:hover:bg-slate-800"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
