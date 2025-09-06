// components/RecentActivities.jsx
import AutoScrollList from "@/components/AutoScrollList";

function activityEmoji(type = "") {
  const t = type.toLowerCase();
  if (t.includes("swim")) return "🏊";
  if (t.includes("bike") || t.includes("cycl")) return "🚴";
  return "🏃";
}

export default function RecentActivities({ activities = [] }) {
  const items = activities.slice(0, 10).map((a) => ({
    id: a.id,
    title: a.name || a.type || "Activity",
    subtitle: `${a.start} • ${a.distance_km} km in ${a.duration_min} min`,
    url: a.id ? `https://connect.garmin.com/modern/activity/${a.id}` : undefined,
    emoji: activityEmoji(a.type),
  }));

  return (
    <AutoScrollList
      items={items}
      visibleCount={5}
      ariaLabel="Recent Activities"
      emptyMessage="No recent activities"
    />
  );
}
