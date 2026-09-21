// components/SpotifyTopTracks.jsx
import AutoScrollList from "@/components/AutoScrollList";

export default function SpotifyTopTracks({ tracks = [], ...props }) {
  // No `id` in the payload, so keys fell through to the title; url is stable.
  const items = tracks.slice(0, 10).map((t, index) => ({
    id: t.url || `${t.name}-${t.artist}` || `track-${index}`,
    title: `${t.name} – ${t.artist}`,
    image: t.image,
    url: t.url,
  }));

  return (
    <AutoScrollList
      items={items}
      ariaLabel="Top Spotify Tracks"
      emptyMessage="No top tracks yet"
      {...props}
    />
  );
}

