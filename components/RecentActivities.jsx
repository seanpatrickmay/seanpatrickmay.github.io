// components/RecentActivities.jsx
import AutoScrollList from "@/components/AutoScrollList";

function activityEmoji(type = "") {
  const t = type.toLowerCase();
  if (t.includes("bike") || t.includes("cycl") || t.includes("ride")) return "🚴";
  if (t.includes("run")) return "🏃";
  if (t.includes("swim")) return "🏊";
  return "🏋";
}

const THIRTY_DAYS_MS = 1000 * 60 * 60 * 24 * 30;

function formatDistanceKm(value) {
  const distance = Number(value);
  if (!Number.isFinite(distance)) return "—";
  return `${distance.toFixed(distance >= 100 ? 0 : 1)} km`;
}

function formatDurationMinutes(value) {
  const minutes = Number(value);
  if (!Number.isFinite(minutes) || minutes <= 0) return null;
  if (minutes >= 90) {
    const hours = minutes / 60;
    return `${hours.toFixed(hours >= 3 ? 0 : 1)} h`;
  }
  return `${Math.round(minutes)} min`;
}

function formatRelativeDays(startDate) {
  if (!(startDate instanceof Date) || Number.isNaN(startDate.getTime())) return "";
  const diff = Date.now() - startDate.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days >= 62) {
    return `${Math.floor(days / 31)}m`;
  }
  if (days >= 7) {
    return `${Math.floor(days / 7)}w`;
  }
  return `${days}d`;
}

export default function RecentActivities({ activities = [] }) {
  const now = Date.now();

  const items = activities
    .filter(activity => {
      const start = activity?.start ? new Date(activity.start.replace(" ", "T")) : null;
      const durationMin = Number(activity?.duration_min);
      if (!start || Number.isNaN(start.getTime())) return false;
      if (!Number.isFinite(durationMin) || durationMin <= 0) return false;
      return now - start.getTime() <= THIRTY_DAYS_MS;
    })
    .sort((a, b) => (Number(b.duration_min) || 0) - (Number(a.duration_min) || 0))
    .slice(0, 10)
    .map(activity => {
      const start = new Date(activity.start.replace(" ", "T"));
      const duration = formatDurationMinutes(activity.duration_min);
      const distance = formatDistanceKm(activity.distance_km);
      const details = [duration, distance].filter(Boolean).join(" • ");

      return {
        id: activity.id,
        title: activity.name || activity.type || "Activity",
        subtitle: activity.type ? activity.type.replace(/_/g, " ") : "",
        info: details,
        url: activity.id ? `https://connect.garmin.com/modern/activity/${activity.id}` : undefined,
        emoji: activityEmoji(activity.type || ""),
        trailing: formatRelativeDays(start),
      };
    });

  return (
    <AutoScrollList
      items={items}
      visibleCount={7}
      ariaLabel="Longest activities in the last 30 days"
      emptyMessage="No standout efforts yet"
    />
  );
}
