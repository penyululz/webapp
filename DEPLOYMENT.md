# Deployment Guide

This project deploys cleanly when split into two parts:

1. `F:\webapp` portal frontend on Vercel
2. Docker app stacks on a Linux VPS with Coolify or Dokploy

## Recommended architecture

Use one public domain for the portal and separate subdomains for the heavy apps:

- `hub.example.com` -> React + Vite portal on Vercel
- `immich.example.com` -> Immich
- `files.example.com` -> Seafile
- `pdf.example.com` -> Stirling PDF
- `blog.example.com` -> WordPress
- `notes.example.com` -> Standard Notes web
- `notes-api.example.com` -> Standard Notes sync server
- `whisper.example.com` -> WhisperX web
- `whisper-api.example.com` -> WhisperX API

Do not publish phpMyAdmin publicly unless you protect it behind access controls.

## Best host choice

For the Docker apps, use one of:

- Coolify
- Dokploy
- A plain Linux VPS with Docker Compose and a reverse proxy

Coolify and Dokploy are the easiest because they handle domains, SSL, restarts, and env vars without extra glue.

## Portal on Vercel

Deploy the root folder `F:\webapp` to Vercel as a Vite project.

Build settings:

- Install command: `npm install`
- Build command: `npm run build`
- Output directory: `dist`

Set these environment variables in Vercel to point the portal at your public app URLs:

- `VITE_IMMICH_URL=https://immich.example.com`
- `VITE_SEAFILE_URL=https://files.example.com`
- `VITE_STIRLING_URL=https://pdf.example.com`
- `VITE_WORDPRESS_URL=https://blog.example.com`
- `VITE_STANDARDNOTES_URL=https://notes.example.com`
- `VITE_STANDARDNOTES_SYNC_URL=https://notes-api.example.com`
- `VITE_WHISPERX_URL=https://whisper.example.com`
- `VITE_WHISPERX_API_URL=https://whisper-api.example.com`

`VITE_PHPMYADMIN_URL` should usually be left unset for public deployments.

## Docker apps on VPS

Use the existing Compose folders from this repo as separate services/apps in Coolify or Dokploy.

### Immich

Folder:

- `F:\webapp\immich-app(done)`

Important env:

- `IMMICH_HTTP_PORT`

Notes:

- Keep persistent storage for `UPLOAD_LOCATION`
- Keep persistent storage for `DB_DATA_LOCATION`
- Give this service enough RAM

### Seafile

Folder:

- `F:\webapp\seafile(done)`

Important env:

- `SEAFILE_HTTP_PORT`
- `SEAFILE_DB_ROOT_PASSWORD`
- `SEAFILE_ADMIN_EMAIL`
- `SEAFILE_ADMIN_PASSWORD`
- `SEAFILE_SERVER_HOSTNAME`
- `SEAFILE_SERVER_LETSENCRYPT`
- `SEAFILE_TIME_ZONE`

Notes:

- `SEAFILE_SERVER_HOSTNAME` must be your real public hostname in production
- The current compose file still uses host-mounted `/opt/...` paths, so set those up on the server before first boot

### Stirling PDF

Folder:

- `F:\webapp\stirling-pdf(done)`

Important env:

- `STIRLING_HTTP_PORT`

Notes:

- If you want login/security in production, enable the security settings instead of keeping the current lightweight local mode

### WordPress

Folder:

- `F:\webapp\wordpress (done)`

Important env:

- `WORDPRESS_HTTP_PORT`
- `WORDPRESS_PHPMYADMIN_PORT`

Notes:

- Do not expose phpMyAdmin publicly unless protected
- Complete the WordPress install wizard after first deploy

### Standard Notes

Folder:

- `F:\webapp\standardnotes(done)`

Important env:

- `STANDARDNOTES_WEB_PORT`
- `STANDARDNOTES_SERVER_PORT`
- `STANDARDNOTES_WS_PORT`

Important files:

- `F:\webapp\standardnotes(done)\web\config.js`
- `F:\webapp\standardnotes(done)\web\config.example.js`

Before production, replace `web\config.js` with production values like:

```js
window.STANDARD_NOTES_CONFIG = {
  syncServer: "https://notes-api.example.com",
  filesHost: "https://notes-api.example.com",
  websocketUrl: "wss://notes-api.example.com"
};
```

Notes:

- The local `localhost` Standard Notes config will not work online
- The app now supports a simple runtime config file so you can deploy cleanly without editing the bundled app each time

### WhisperX

Folder:

- `F:\webapp\whisperX (transcription ready linux)\whisperX`

Important env:

- `WHISPERX_WEB_PORT`
- `WHISPERX_API_PORT`
- `WHISPERX_HF_TOKEN`

Notes:

- The web app already uses same-origin `/api`, so it is deployment-friendly
- Add `WHISPERX_HF_TOKEN` only if you want diarization support
- CPU mode works, but GPU-backed deployment is much better if your server supports it

## Deployment order

1. Deploy the Docker apps on the VPS first
2. Confirm each app works on its public domain
3. Put the final public URLs into Vercel env vars
4. Deploy the portal
5. Verify every `Open app` link from the portal

## Post-deploy checklist

- Each app has HTTPS
- Each app has persistent storage
- Seafile hostname matches the public domain
- Standard Notes `web/config.js` points to the public sync server
- WhisperX web can reach `/api/health`
- Portal buttons open public domains instead of `localhost`
- Admin passwords are rotated away from local defaults

## What should stay private

These should be private or behind auth even if the portal is public:

- phpMyAdmin
- database ports
- admin backends you do not need public

The safest pattern is:

- public portal on Vercel
- private Docker services behind login, Cloudflare Access, Tailscale, or VPN if this is a personal stack
