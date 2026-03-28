# Free Launch Guide

This is the fastest way to get Webapp Hub online for free when you do not have a custom domain yet.

## What this setup gives you

- a public frontend on `*.workers.dev`
- private access to your real apps from anywhere through Tailscale
- no paid VPS
- no custom domain required yet

## What stays public

- the Webapp Hub frontend

## What stays private

- your real app/admin access through Tailscale
- WordPress admin
- phpMyAdmin
- any service you do not want strangers opening

## Step 1. Make the frontend public on Cloudflare

1. Create a free Cloudflare account
2. Install Node.js if needed
3. In this project folder, run:

```bash
npm install
npm run deploy:cloudflare
```

4. If prompted, log in with Wrangler
5. Choose or confirm your `workers.dev` subdomain

After deploy, Cloudflare will give you a public URL like:

- `https://webapp-hub.<your-subdomain>.workers.dev`

That becomes your public project link.

## Step 2. Keep private apps off the public internet

Do not make the sensitive apps public yet if you do not have a domain and Cloudflare Access rules ready.

The frontend is now prepared so that when no public app URL is set, it will not fall back to broken `localhost` links in production.

## Step 3. Use Tailscale for your own remote access

1. Create a free Tailscale account
2. Install Tailscale on:
   - the machine running this project
   - your laptop/phone/other personal devices
3. Sign in on each device
4. Open the private apps through the machine's Tailscale IP or MagicDNS name

Examples:

- `http://100.x.x.x:3030` for WhisperX
- `http://100.x.x.x:2283` for Immich
- `http://100.x.x.x:8082` for Seafile
- `http://100.x.x.x:8084` for WordPress

Replace `100.x.x.x` with your actual Tailscale device IP.

## Step 4. Optional future upgrade

When you get a domain later, you can upgrade this free setup to:

- Cloudflare Workers for the hub
- Cloudflare Tunnel for public/protected app URLs
- Cloudflare Access for reviewer/admin login
- Tailscale for your own private maintenance access

## Recommended current portfolio flow

Use this as your public story:

1. share the public `workers.dev` link for the hub
2. let people explore the project visually
3. if an interviewer wants to see the real private apps, show them live during a call
4. use Tailscale yourself to access the full stack from anywhere

This is the cleanest free setup until you buy a domain.
