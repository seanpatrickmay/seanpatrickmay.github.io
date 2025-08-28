import React from 'react';

export default function SpotifyTopTracks({ tracks = [] }) {
  if (!tracks.length) return null;
  return (
    <ul className="space-y-2">
      {tracks.map((t) => (
        <li key={t.name} className="flex items-center gap-2">
          {t.image && (
            <img
              src={t.image}
              alt=""
              className="w-8 h-8 rounded"
            />
          )}
          <a
            href={t.url}
            target="_blank"
            rel="noreferrer"
            className="text-sm leading-tight"
          >
            <span className="font-medium block">{t.name}</span>
            {t.artist && (
              <span className="text-slate-500 dark:text-slate-400 block">
                {t.artist}
              </span>
            )}
          </a>
        </li>
      ))}
    </ul>
  );
}
