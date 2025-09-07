// components/SpotifyTopTracks.jsx
import AutoScrollList from "@/components/AutoScrollList";

export default function SpotifyTopTracks({ tracks = [], ...props }) {
  const items = tracks.slice(0, 10).map((t) => ({
    id: t.id,
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

