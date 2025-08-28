import React from 'react';

export default function SpotifyTopArtists({ artists = [] }) {
  if (!artists.length) return null;
  return (
    <div className="flex justify-center gap-4">
      {artists.map((a) => (
        <a
          key={a.name}
          href={a.url}
          className="text-center space-y-2"
          target="_blank"
          rel="noreferrer"
        >
          {a.image && (
            <img
              src={a.image}
              alt={a.name}
              className="w-24 h-24 object-cover rounded-full"
            />
          )}
          <div className="text-sm font-medium">{a.name}</div>
        </a>
      ))}
    </div>
  );
}
