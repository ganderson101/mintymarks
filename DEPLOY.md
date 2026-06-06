# MintyMarks — Synology DS420+ Deployment Guide

## Prerequisites

- Synology DS420+ running DSM 7.x
- **Container Manager** installed (DSM Package Center → search "Container Manager")
- SSH enabled on the NAS (Control Panel → Terminal & SNMP → Enable SSH service)
- Git installed on the NAS, or the repo files transferred via File Station
- A domain name added to Cloudflare (for internet access via Cloudflare Tunnel)

---

## One-time setup on the NAS

### 1. SSH into your NAS
```bash
ssh your-username@192.168.x.x
```

### 2. Clone the repo
```bash
git clone https://github.com/ganderson101/mintymarks.git /volume1/docker/mintymarks
```

### 3. Create a Cloudflare Tunnel

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com) → **Zero Trust** → **Networks** → **Tunnels**
2. Click **Create a tunnel** → choose **Cloudflared** → name it `mintymarks`
3. Copy the **token** (the long string after `--token` in the install command shown)
4. Add a **Public Hostname**:
   - Subdomain: `app`
   - Domain: your domain (e.g. `yourdomain.com`)
   - Service type: `HTTP`, URL: `frontend:80`
5. Save the tunnel

### 4. Create your .env file
```bash
cd /volume1/docker/mintymarks
cp .env.example .env
nano .env
```

Fill in three values:

```
MINTYMARKS_SECRET=<generate with: openssl rand -hex 32>
ALLOWED_ORIGINS=https://app.yourdomain.com
CLOUDFLARE_TUNNEL_TOKEN=<paste token from step 3>
```

### 4. Build and start
```bash
cd /volume1/docker/mintymarks
docker compose -f docker-compose.nas.yml up -d --build
```

The first build takes 3–5 minutes (downloads Node + Python base images, installs deps).

### 5. Verify it's running
```bash
docker compose -f docker-compose.nas.yml ps
# Both services should show status "running (healthy)"
```

Open a browser: `http://<NAS-IP>:3000`

---

## Updating the app

```bash
cd /volume1/docker/mintymarks
git pull
docker compose -f docker-compose.nas.yml up -d --build
```

Your data (SQLite in named volume `mintymarks_db_data`) survives updates automatically.

---

## Optional: Synology reverse proxy (clean URL on port 80)

To access MintyMarks at `http://mintymarks.local` instead of `http://IP:3000`:

1. DSM → Control Panel → Login Portal → Advanced → **Reverse Proxy**
2. Click **Create**
3. Fill in:
   - **Source**: Protocol `HTTP`, hostname `mintymarks.local` (or your NAS hostname), port `80`
   - **Destination**: Protocol `HTTP`, hostname `localhost`, port `3000`
4. In `.env`, set `ALLOWED_ORIGINS=http://mintymarks.local`
5. Restart the backend: `docker compose -f docker-compose.nas.yml restart backend`

For HTTPS, first enable a Let's Encrypt certificate in DSM (Control Panel → Security → Certificate), then set source protocol to `HTTPS` in the reverse proxy rule.

---

## PWA install ("Add to Home Screen") requires HTTPS

MintyMarks is built as a Progressive Web App so the kids can install it on tablets/phones as if it were a native app. **This only works over HTTPS or `localhost`** — it will not work over a plain `http://192.168.x.x` LAN address.

Browsers block service workers on plain HTTP for security reasons, so the "Add to Home Screen" prompt will never appear without HTTPS.

**How to enable it on the NAS:**

1. Get a TLS certificate. Two options:
   - **Let's Encrypt via DSM** (easiest, requires a domain name reachable from the internet):
     DSM → Control Panel → Security → Certificate → Add → *Get a certificate from Let's Encrypt*
   - **Self-signed cert via DSM** (no domain needed, but browsers will show a warning once; after accepting it, installs work fine):
     DSM → Control Panel → Security → Certificate → Add → *Create self-signed certificate*

2. Set up a reverse proxy with HTTPS source (see section above), pointing to `localhost:3000`.

3. In `.env`, update `ALLOWED_ORIGINS` to your HTTPS address (e.g. `https://mintymarks.local` or `https://192.168.x.x`).

4. Restart the backend: `docker compose -f docker-compose.nas.yml restart backend`

5. Visit the HTTPS address in the browser — the "Add to Home Screen" prompt will now appear.

---

## Backup the database

```bash
docker run --rm \
  -v mintymarks_db_data:/data \
  -v /volume1/backups:/backup \
  alpine \
  tar czf /backup/mintymarks-$(date +%Y%m%d).tar.gz /data
```

---

## Useful commands

```bash
# Stream logs from both services
docker compose -f docker-compose.nas.yml logs -f

# Stop everything (data preserved)
docker compose -f docker-compose.nas.yml down

# Stop and wipe all data — IRREVERSIBLE
docker compose -f docker-compose.nas.yml down -v

# Rebuild after code changes
docker compose -f docker-compose.nas.yml up -d --build
```

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| API calls fail (login/save won't work) | Check `ALLOWED_ORIGINS` in `.env` matches your browser URL |
| Container crashes on start | Run `docker compose logs backend` to read the error |
| Port 3000 already in use | Change `MINTYMARKS_PORT` in `.env` and redeploy |
| DSM shows build error | Ensure **Container Manager** (not the legacy Docker package) is installed |
| `permission denied` errors in SSH | Prefix commands with `sudo` or log in as an admin account |
| Question bank not updating | Rebuild after regenerating: `docker compose -f docker-compose.nas.yml up -d --build` |
