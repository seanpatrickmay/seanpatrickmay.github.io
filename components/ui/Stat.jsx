export default function Stat({ value, label }) {
  return (
    <div className="flex flex-col items-center justify-center gap-1">
      <div className="text-3xl font-extrabold">{value}</div>
      <div className="text-sm opacity-70 h-10 flex items-center justify-center text-center">
        {label}
      </div>
    </div>
  );
}
