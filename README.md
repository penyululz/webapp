# Webapp Control Center

This root folder is now a React + Vite portal that organizes the other projects in the workspace.
It now uses a cleaner split:

- `Home` for the landing page
- `Dashboard` for the operational app view
- `Workspace` for deployment and project notes

App-specific setup notes and credentials are documented here instead of being shown directly in the UI.

## Run locally

Install dependencies once:

```bat
cmd /c npm install
```

Start the frontend:

```bat
cmd /c npm run dev
```

Or use:

```bat
F:\webapp\start-hub.bat
```

The Vite app runs at `http://127.0.0.1:5173` by default.

To start both the React portal and the Docker-backed services together:

```bat
F:\webapp\start-centralized-webapp.bat
```

## Build for production

```bat
cmd /c npm run build
```

The production output is written to `dist\`.

## Deploy to Vercel

Deploy the root `F:\webapp` folder as a Vite project.

For the full public stack, read [DEPLOYMENT.md](./DEPLOYMENT.md). The short version is:

- deploy the portal to Vercel
- deploy the Docker apps to a Linux VPS with Coolify or Dokploy
- then point the portal `VITE_*_URL` variables at the public app domains

If you have public app deployments, add these environment variables in Vercel:

- `VITE_IMMICH_URL`
- `VITE_SEAFILE_URL`
- `VITE_STIRLING_URL`
- `VITE_WORDPRESS_URL`
- `VITE_PHPMYADMIN_URL`
- `VITE_STANDARDNOTES_URL`
- `VITE_STANDARDNOTES_SYNC_URL`
- `VITE_WHISPERX_URL`
- `VITE_WHISPERX_API_URL`

See [.env.example](./.env.example) for the local defaults.

## WhisperX app

WhisperX now has its own standalone local web app:

- Web app: `http://localhost:3030`
- API: `http://localhost:3020`
- API docs: `http://localhost:3020/docs`

The app lets you:

- select audio or video files
- choose transcription presets and output format
- submit jobs to the local WhisperX API

## App notes

### Immich

- URL: `http://localhost:2283`
- Start: `cd "F:\webapp\immich-app(done)" && docker compose up -d`
- First use: create the first account in the browser; that first user becomes admin
- Extra note: if the page feels slow right after startup, give Postgres and the ML service another minute

### Seafile

- URL: `http://localhost:8082`
- Start: `cd "F:\webapp\seafile(done)" && docker compose up -d`
- Default admin email: `me@example.com`
- Default admin password: `asecret`
- DB root password: `faristest`

### Stirling PDF

- URL: `http://localhost:8083`
- Start: `cd "F:\webapp\stirling-pdf(done)" && docker compose up -d`
- Default username: `admin`
- Default password: `stirling`
- Settings file: `F:\webapp\stirling-pdf(done)\extraConfigs\settings.yml`
- Note: this app blocks iframe embedding by default

### WordPress

- URL: `http://localhost:8084`
- phpMyAdmin: `http://localhost:8085`
- Start: `cd "F:\webapp\wordpress (done)" && docker compose up -d`
- First use: complete the WordPress install wizard in the browser
- DB name: `wordpress`
- DB user: `satusky`
- DB password: `faristest`
- DB root password: `faristest`

### Standard Notes

- Web app: `http://localhost:3007`
- Sync server: `http://localhost:3004`
- Start: `cd "F:\webapp\standardnotes(done)" && docker compose up -d`
- Note: the local web build is already wired to the local sync server
- Deployment note: update `F:\webapp\standardnotes(done)\web\config.js` for your public sync domain
- DB user: `std_notes_user`
- DB password: `faristest`

### WhisperX

- Web app: `http://localhost:3030`
- API: `http://localhost:3020`
- API docs: `http://localhost:3020/docs`
- Start: `cd "F:\webapp\whisperX (transcription ready linux)\whisperX" && docker compose up -d`
- Default runtime: CPU with `int8` compute
- Optional: add `WHISPERX_HF_TOKEN` later if you want speaker diarization

## New local services

- Standard Notes web app: `http://localhost:3007`
- Standard Notes sync server: `http://localhost:3004`
- WhisperX web app: `http://localhost:3030`
- WhisperX API: `http://localhost:3020`
- WhisperX API docs: `http://localhost:3020/docs`

The Standard Notes web container is overridden locally so it defaults to your self-hosted sync server and websocket ports instead of the public Standard Notes cloud.

## Important limit

Vercel can host the portal frontend, but it cannot host Immich, Seafile, Stirling PDF, or WordPress themselves. Those still need their own backend/runtime.

## Optional Docker services

If you later install Docker Desktop, you can still use these scripts:

```bat
F:\webapp\start-services.bat
F:\webapp\stop-services.bat
```

## Local service URLs

- Immich: `http://localhost:2283`
- Seafile: `http://localhost:8082`
- Stirling PDF: `http://localhost:8083`
- WordPress: `http://localhost:8084`
- phpMyAdmin for WordPress: `http://localhost:8085`
- Standard Notes web app: `http://localhost:3007`
- Standard Notes sync server: `http://localhost:3004`
- WhisperX API: `http://localhost:3020`
