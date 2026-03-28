# Deployment Guide

This file documents the server-hosted deployment model for Webapp Hub.

Use this path if you want the app stack to live on a VPS instead of your own machine.

## Recommended architecture

- public frontend on Vercel or Cloudflare
- Docker services on a Linux VPS
- optional reverse proxy / app manager such as Coolify or Dokploy

Example domain layout:

- `hub.example.com` -> Webapp Hub frontend
- `immich.example.com` -> Immich
- `files.example.com` -> Seafile
- `pdf.example.com` -> Stirling PDF
- `notes.example.com` -> Standard Notes web
- `notes-api.example.com` -> Standard Notes sync server
- `whisper.example.com` -> WhisperX web
- `whisper-api.example.com` -> WhisperX API

## Best fit

Choose this path when:

- you want the services online even when your own PC is off
- you want a cleaner production environment
- you are ready to manage a server or use a tool like Coolify

## Frontend deploy

The frontend can be hosted on:

- Vercel
- Cloudflare Workers static assets

Set the public service URLs with the `VITE_*` environment variables before building.

## Docker service deploy

The included service folders can be deployed as separate Compose-based apps on a VPS.

Main considerations:

- persistent storage for app data
- HTTPS on every public service
- strong passwords and rotated secrets
- protected admin routes
- service-specific hostname config where required

## App-specific notes

### Immich

- needs persistent storage
- benefits from more RAM than the lighter services
- best kept protected unless you explicitly want public remote access

### Seafile

- requires correct public hostname configuration in production
- should run behind HTTPS

### Stirling PDF

- can be public or protected depending on your use case
- consider enabling stronger security settings for production

### WordPress

- public site can be exposed
- admin access should stay protected
- phpMyAdmin should stay private

### Standard Notes

- requires correct sync/web configuration for production domains
- should be protected because it stores sensitive personal content

### WhisperX

- can work well as a public demo app
- private mode is still better if uploaded media is sensitive

## Production checklist

- HTTPS enabled
- public hostnames configured correctly
- persistent volumes mounted
- development secrets rotated
- sensitive apps behind auth
- admin tools not exposed publicly

## Recommendation

For portfolio use, the best practical split is often:

- public frontend
- optional public WhisperX demo
- protected/private access for sensitive services

That gives you a strong public showcase without turning your personal infrastructure into an openly exposed stack.
