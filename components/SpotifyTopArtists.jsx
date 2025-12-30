import AutoScrollList from '@/components/AutoScrollList';

export default function SpotifyTopArtists({ artists = [], ...props }) {
  const items = artists.slice(0, 10).map((artist, index) => ({
    id: artist.url || artist.name || `artist-${index}`,
    title: artist.name,
    image: artist.image,
    url: artist.url,
  }));

  return (
    <AutoScrollList
      items={items}
      ariaLabel="Top Spotify Artists"
      emptyMessage="No top artists yet"
      {...props}
    />
  );
}

