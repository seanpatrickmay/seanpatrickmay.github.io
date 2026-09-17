/**
 * Spotify re-consent helper, driven entirely from GitHub Actions.
 *
 * Spotify refresh tokens die for reasons no script can prevent — password
 * change, app removed from the account, Spotify-side revocation. Recovering
 * always needs one human browser consent. This keeps the rest in the cloud.
 *
 * Modes:
 *   url      print the authorize URL to open in a browser
 *   exchange trade the ?code= from the redirect for a refresh token
 *
 * Environment variables:
 *   SPOTIFY_CLIENT_ID      required
 *   SPOTIFY_CLIENT_SECRET  required for `exchange`
 *   SPOTIFY_REDIRECT_URI   defaults to the site's callback path
 *   SPOTIFY_AUTH_CODE      required for `exchange`
 */

const DEFAULT_REDIRECT_URI = 'https://seanpatrickmay.github.io/spotify-callback';
const SCOPE = 'user-top-read';

function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function redirectUri() {
  return process.env.SPOTIFY_REDIRECT_URI || DEFAULT_REDIRECT_URI;
}

function printAuthorizeUrl() {
  const params = new URLSearchParams({
    client_id: requireEnv('SPOTIFY_CLIENT_ID'),
    response_type: 'code',
    redirect_uri: redirectUri(),
    scope: SCOPE,
    show_dialog: 'true',
  });
  const url = `https://accounts.spotify.com/authorize?${params}`;

  console.log('');
  console.log('1. Open this URL and approve access:');
  console.log('');
  console.log(`   ${url}`);
  console.log('');
  console.log('2. You will land on a URL that looks like:');
  console.log(`   ${redirectUri()}?code=AQD...`);
  console.log('   (the page itself 404s — that is fine, only the URL matters)');
  console.log('');
  console.log('3. Copy everything after `code=` and re-run this workflow with it');
  console.log('   pasted into the `auth_code` input.');
  console.log('');
}

async function exchangeCode() {
  const clientId = requireEnv('SPOTIFY_CLIENT_ID');
  const clientSecret = requireEnv('SPOTIFY_CLIENT_SECRET');
  const code = requireEnv('SPOTIFY_AUTH_CODE').trim();

  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri(),
    }),
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(
      `Token exchange failed: ${res.status} ${text}\n` +
        'Authorization codes are single-use and expire in about a minute — ' +
        'generate a fresh one and try again.',
    );
  }

  const data = JSON.parse(text);
  if (!data.refresh_token) {
    throw new Error(`Token exchange returned no refresh_token: ${text}`);
  }

  // stdout is captured by the workflow and piped straight into `gh secret set`,
  // so it must contain the token and nothing else.
  process.stdout.write(data.refresh_token);
}

const mode = process.argv[2];
if (mode === 'url') {
  printAuthorizeUrl();
} else if (mode === 'exchange') {
  await exchangeCode();
} else {
  console.error(`Usage: node scripts/spotify_authorize.mjs <url|exchange>`);
  process.exitCode = 1;
}
