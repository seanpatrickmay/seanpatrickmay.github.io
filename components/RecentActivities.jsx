// components/RecentActivities.jsx
import AutoScrollList from "@/components/AutoScrollList";

const typeEmoji = {
  running: "🏃",
  cycling: "🚴",
  walking: "🚶",
  swimming: "🏊",
  hiking: "🥾",
  rowing: "🚣",
  skiing: "⛷️",
  strength: "🏋️",
};

export default function RecentActivities({ activities = [] }) {
  const items = activities.slice(0, 10).map((a) => {
    const start = new Date((a.start || "").replace(" ", "T"));
    const msPerDay = 1000 * 60 * 60 * 24;
    const daysAgo = Math.floor((Date.now() - start.getTime()) / msPerDay);
    const distance = Math.round(Number(a.distance_km) || 0);
    const duration = Number.isFinite(Number(a.duration_min)) ? Math.round(a.duration_min) : null;
    return {
      id: a.id,
      title: a.name || a.type || "Activity",
      subtitle: duration != null ? `${duration} min` : undefined,
      info: `${distance} km`,
      url: a.id ? `https://connect.garmin.com/modern/activity/${a.id}` : undefined,
      emoji: typeEmoji[(a.type || "").toLowerCase()] || "🏃",
      trailing:
        daysAgo <= 0
          ? "today"
          : daysAgo === 1
          ? "1d ago"
          : `${daysAgo}d ago`,
    };
  });

  return (
    <AutoScrollList
      items={items}
      visibleCount={5}
      ariaLabel="Recent Activities"
      emptyMessage="No recent activities"
    />
  );
}
