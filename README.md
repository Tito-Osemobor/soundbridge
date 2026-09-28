# SoundBridge

SoundBridge helps you copy a playlist between Spotify, YouTube Music-compatible YouTube playlists, and Apple Music. It creates a **new private playlist** and lets you review uncertain track matches before writing anything. The public site is an interactive demo with sample data; real transfers run in a local-only installation using your own provider developer apps.

## Try the demo

The public demo is at [soundbridge-five.vercel.app](https://soundbridge-five.vercel.app/demo).

Run the frontend without provider credentials:

```sh
cd frontend
npm ci
NEXT_PUBLIC_DEMO_ONLY=1 npm run dev
```

Open [http://127.0.0.1:3000/demo](http://127.0.0.1:3000/demo). The demo supports both transfer directions and Apple Music examples; it never connects to a provider or writes a playlist.

For Vercel, import this repository with **Root Directory** set to `frontend` and set `NEXT_PUBLIC_DEMO_ONLY=1`. The `frontend/vercel.json` settings publish the static export. The demo needs no backend, database, OAuth credentials, or public signup.

## Run real transfers

You need Docker Compose, Spotify and Google OAuth applications, and accounts allowed to use their APIs. Apple Music additionally needs an Apple Developer Program membership, a MusicKit media key, and an Apple Music subscriber account.

1. Copy `.env.example` to `.env` and set a long random `POSTGRES_PASSWORD`.
2. Copy `backend/.env.example` to `backend/.env`. Generate `ENCRYPTION_KEY` with `openssl rand -base64 32`; keep this key and your database backup together. Losing the key makes saved provider tokens unreadable.
3. Register these exact callback URLs in your developer dashboards:

   | Provider | Authorized redirect URL |
   | --- | --- |
   | Spotify | `http://127.0.0.1:3000/api/connections/callback/SPOTIFY` |
   | Google | `http://127.0.0.1:3000/api/connections/callback/YOUTUBE_MUSIC` |

4. Put the Spotify and Google client IDs and secrets in `backend/.env`. For Apple Music, also set `APPLE_TEAM_ID`, `APPLE_KEY_ID`, and `APPLE_PRIVATE_KEY` to the contents of the MusicKit `.p8` key with newlines represented as `\n`.
5. Start the stack:

```sh
docker compose up --build
```

Open [http://127.0.0.1:3000/hub](http://127.0.0.1:3000/hub). Docker publishes only the web port on loopback; the API and PostgreSQL stay on the internal Compose network. There is no SoundBridge account login. **Do not expose this installation to the public internet without a separate access gate and HTTPS.**

To back up the database:

```sh
docker compose exec -T db pg_dump -U soundbridge soundbridge > soundbridge-backup.sql
```

Save `ENCRYPTION_KEY` securely with the backup. Provider tokens are encrypted in PostgreSQL with AES-256-GCM; provider app secrets remain in the local environment file. No credentials belong in the public demo or source control.

### Provider limits

- Spotify development mode currently allows up to five allowlisted Spotify users, and its app owner needs Premium. [Spotify quota modes](https://developer.spotify.com/documentation/web-api/concepts/quota-modes)
- Google OAuth Testing mode has a test-user limit and short-lived authorizations. [Google app audience](https://support.google.com/cloud/answer/15549945?hl=en)
- The YouTube Data API works with YouTube playlists and videos. YouTube Music may display only the music videos in such playlists. [YouTube Music playlists](https://support.google.com/youtubemusic/answer/7205933?hl=en-GB)
- YouTube projects commonly get 100 searches per day. SoundBridge limits concurrent searches, saves matching progress, and lets you retry after a quota pause. [YouTube quota calculator](https://developers.google.com/youtube/v3/determine_quota_cost)
- Apple Music web access requires a signed developer token and listener authorization. [Apple Music API](https://developer.apple.com/documentation/applemusicapi/)

## Development

Use Node.js 22 or later. The frontend proxies `/api` to the backend in real mode, so the browser uses one origin. The backend binds to `127.0.0.1` outside Docker.

```sh
cd backend
npm ci
npm run build
npm run lint
npm test
```

```sh
cd frontend
npm ci
npm run lint
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

The backend API exposes `GET /api/connections`, `GET /api/playlists?provider=...`, `POST /api/transfers`, `GET /api/transfers/:id`, `POST /api/transfers/:id/confirm`, and `POST /api/transfers/:id/retry`. A transfer first searches for candidates and waits for review. Confirmation creates a new private destination playlist; progress and failed items remain in PostgreSQL for recovery after restart.

## Project layout

- `backend/src/features`: connection, playlist, and transfer behavior.
- `backend/src/providers`: Spotify, YouTube, and Apple Music API adapters.
- `frontend/src/features`: the guided workspace, demo data, and provider connection UI.
- `frontend/src/pages`: public landing, interactive demo, and local workspace.

The first milestone is Spotify ↔ YouTube. Apple Music builds on the same transfer flow and must be verified with a live subscriber account and MusicKit credentials before release.
