# Cloudflare Setup

This document covers the free hybrid deployment model for Webapp Hub:

1. the public frontend is deployed on Cloudflare Workers static assets
2. local services stay on your machine
3. Cloudflare Tunnel exposes selected apps over HTTPS
4. Cloudflare Access protects sensitive apps behind login
5. Tailscale remains the private admin/owner path

This is the best fit when you want:

- a public portfolio-ready project page
- secure remote access to real apps
- no paid VPS

If you do not have a domain yet, use [FREE_LAUNCH.md](./FREE_LAUNCH.md) first. That path uses a public `workers.dev` frontend and Tailscale for private app access.

## Recommended access split

### Public

- `hub.example.com`
- optionally `whisper.example.com`

### Protected with Cloudflare Access

- `immich.example.com`
- `files.example.com`
- `pdf.example.com`
- `notes.example.com`
- `notes-api.example.com`
- optional reviewer-facing `wp.example.com`

### Private with Tailscale

- WordPress admin
- phpMyAdmin
- private maintenance routes
- personal day-to-day admin access

## Requirements

- a Cloudflare account
- a domain connected to Cloudflare
- `cloudflared` installed on the machine running the Docker apps
- Node.js installed for frontend builds
- optional: Tailscale on your own devices

## Frontend deploy

Build the frontend:

```bash
npm install
npm run build
```

Deploy to Cloudflare:

```bash
npx wrangler deploy
```

The Worker config is already prepared in `wrangler.jsonc`.

## Frontend environment variables

Set these before building so the portal points to your public URLs:

- `VITE_IMMICH_URL=https://immich.example.com`
- `VITE_SEAFILE_URL=https://files.example.com`
- `VITE_STIRLING_URL=https://pdf.example.com`
- `VITE_WORDPRESS_URL=https://wp.example.com`
- `VITE_PHPMYADMIN_URL=https://pma.example.com`
- `VITE_STANDARDNOTES_URL=https://notes.example.com`
- `VITE_STANDARDNOTES_SYNC_URL=https://notes-api.example.com`
- `VITE_WHISPERX_URL=https://whisper.example.com`
- `VITE_WHISPERX_API_URL=https://whisper-api.example.com`
- `VITE_ADMIN_LOGIN_URL=https://admin.example.com`

`VITE_ADMIN_LOGIN_URL` should point to a protected admin entry, such as a Cloudflare Access App Launcher route.

## Cloudflare Tunnel

Use `cloudflare/cloudflared.example.yml` as the starting point for your tunnel configuration.

Typical flow:

1. create a tunnel
2. attach your domain
3. map hostnames to local services
4. keep the machine online

This keeps the real apps on your own hardware while still giving them public HTTPS hostnames.

## Cloudflare Access

Use Cloudflare Access to protect the sensitive apps.

Suggested policy:

- allow only your own email by default
- add an interviewer email temporarily if you want to share a protected app

This works well for portfolio review because:

- the public hub is always visible
- sensitive apps are still real and reachable
- access can be granted only when needed

## Tailscale

Tailscale is still recommended for your own private admin path.

Use it for:

- WordPress admin work
- phpMyAdmin
- maintenance access
- any service you do not want exposed, even behind public DNS

That gives you:

- Cloudflare for public/demo sharing
- Tailscale for personal secure control

## Interviewer flow

Recommended reviewer flow:

1. interviewer opens the public hub
2. they review the product and project structure
3. if they want to inspect a protected app:
   - you temporarily allow their email in Cloudflare Access
   - or you show the app live during a call

## Important notes

- your machine must stay on for tunneled apps to remain available
- phpMyAdmin should remain private
- admin routes should not be openly public
- this setup is ideal for showcasing the project without paying for a VPS
