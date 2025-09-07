// components/RecentActivities.jsx
import AutoScrollList from "@/components/AutoScrollList";

function activityEmoji(type = "") {
  const t = type.toLowerCase();
  if (t.includes("swim")) return "🏊";
  if (t.includes("bike") || t.includes("cycl") || t.includes("ride")) return "🚴";
  if (t.includes("run")) return "🏃";
  return "🏋";
}

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
      subtitle: "",
      info: `${duration}mins - ` + `${distance}km`,
      url: a.id ? `https://connect.garmin.com/modern/activity/${a.id}` : undefined,
      emoji: activityEmoji((a.type || "").toLowerCase()) || "🏃",
      trailing:
	daysAgo >= 62 ?
	    `${Math.floor(daysAgo/31)}m`
	: daysAgo >= 7 ? 
	    `${Math.floor(daysAgo/7)}w`
        : `${daysAgo}d`

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
