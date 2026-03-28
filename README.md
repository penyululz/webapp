# Webapp Hub

Webapp Hub is a centralized self-hosted app platform that brings multiple tools into one branded experience. Instead of treating each service as a separate local project, this repo turns them into a single portal with shared navigation, theming, launch flows, and deployment planning.

The project is designed to work as both:

- a portfolio-ready frontend experience
- a practical personal control center for self-hosted services

## What it does

Webapp Hub provides a unified interface for launching and organizing services such as:

- Immich
- Seafile
- Standard Notes
- Stirling PDF
- WordPress
- WhisperX

It also includes a standalone WhisperX web experience so transcription feels like a real product instead of only a backend utility.

## Core ideas

- One branded frontend for multiple self-hosted apps
- A cleaner portfolio-style experience instead of a generic admin panel
- Public demo surface plus protected/private app access
- Deployment-ready architecture for Cloudflare, Vercel, or VPS-based setups

## Stack

- React 18
- Vite
- Docker Compose
- Cloudflare Workers / Tunnel / Access
- Tailscale

## Project structure

- `src/` contains the main frontend application
- `public/` contains brand assets, icons, and background media
- `whisperX (transcription ready linux)/whisperX/` contains the standalone WhisperX service and web app
- the other app folders contain the Docker-based service integrations

## Local development

Install dependencies:

```bat
cmd /c npm install
```

Run the frontend:

```bat
cmd /c npm run dev
```

Or use the launcher:

```bat
start-hub.bat
```

To build for production:

```bat
cmd /c npm run build
```

## Deployment options

This repo supports two main deployment styles.

### 1. Free hybrid setup

Recommended for personal use and portfolio presentation:

- public frontend on Cloudflare Workers static assets
- local apps exposed with Cloudflare Tunnel
- protected app access through Cloudflare Access
- private owner/admin access through Tailscale

See [CLOUDFLARE_SETUP.md](./CLOUDFLARE_SETUP.md).

If you do not have a domain yet, use [FREE_LAUNCH.md](./FREE_LAUNCH.md) for the fastest `workers.dev + Tailscale` launch path.

### 2. VPS / full-service setup

Recommended if you want the services to live on a dedicated server instead of your own machine:

- frontend on Vercel or Cloudflare
- Docker apps on a Linux VPS

See [DEPLOYMENT.md](./DEPLOYMENT.md).

## Public vs private access model

The intended production model is:

- public hub for project presentation
- optional public demo app, such as WhisperX
- protected app access for sensitive services
- private owner/admin access for maintenance tasks

This gives the project a strong public portfolio presence while keeping personal or admin-sensitive services under control.

## Security note

This repository is meant to be public, so production secrets, private credentials, and personal environment files should not be committed.

Before publishing a real deployment:

- use your own environment variables
- rotate any local development passwords
- protect sensitive apps behind Cloudflare Access or Tailscale
- avoid exposing phpMyAdmin or admin-only routes publicly

## Status

This project is an actively integrated multi-app workspace, not a single standalone SaaS app. Some services are best treated as protected/private infrastructure, while the hub itself is intended to be the polished public-facing layer.

## Author

Created by Mohamad Faris Danial

- Portfolio: [portfolio-nine-sandy-ysts5ij3xd.vercel.app](https://portfolio-nine-sandy-ysts5ij3xd.vercel.app)
- GitHub: [github.com/penyululz](https://github.com/penyululz)
- LinkedIn: [linkedin.com/in/mohamad-faris-danial-abdul-malek-497246294](https://www.linkedin.com/in/mohamad-faris-danial-abdul-malek-497246294)
