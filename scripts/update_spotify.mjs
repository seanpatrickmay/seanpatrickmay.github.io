import fs from 'node:fs/promises';

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.SPOTIFY_REFRESH_TOKEN;
const OUT_PATH = process.env.SPOTIFY_OUT || 'public/spotify.json';

async function getAccessToken() {
  if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
    throw new Error('Missing Spotify credentials');
  }
  const basic = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: REFRESH_TOKEN,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to refresh token: ${res.status} ${text}`);
  }
  const data = await res.json();
  return data.access_token;
}

async function fetchTop(token, type, limit) {
  const res = await fetch(`https://api.spotify.com/v1/me/top/${type}?limit=${limit}&time_range=short_term`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to fetch top ${type}: ${res.status} ${text}`);
  }
  return res.json();
}

async function main() {
  const token = await getAccessToken();
  const [artistsRes, tracksRes] = await Promise.all([
    fetchTop(token, 'artists', 5),
    fetchTop(token, 'tracks', 5),
  ]);

  const artists = (artistsRes.items || []).map(a => ({
    name: a.name,
    image: a.images?.[0]?.url || null,
    url: a.external_urls?.spotify || null,
  }));

  const tracks = (tracksRes.items || []).map(t => ({
    name: t.name,
    artist: t.artists?.map(a => a.name).join(', ') || '',
    image: t.album?.images?.[0]?.url || null,
    url: t.external_urls?.spotify || null,
  }));

  const out = {
    generated_at: new Date().toISOString(),
    artists,
    tracks,
  };

  await fs.writeFile(OUT_PATH, JSON.stringify(out, null, 2));
}

main().catch(err => {
  console.error(err);
  process.exitCode = 1;
});
