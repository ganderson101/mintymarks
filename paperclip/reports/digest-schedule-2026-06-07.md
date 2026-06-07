# Nightly Digest — Schedule & Email Setup Runbook
**Date:** 2026-06-07  
**Issue:** MIN-28  
**Relates to:** MIN-25 (nightly updates) | See MIN-41 thread for full NAS rebuild runbook

---

## What this adds to the stack

A new `digest-cron` Docker service in `docker-compose.nas.yml` runs
`scripts/nightly-digest.mjs` every night at **21:00 Europe/London**.  
It sends one plain-text summary email to `DIGEST_TO` (defaults to
`ganderson101@gmail.com`) via Gmail SMTP using an App Password you set once in
`.env`.

No extra NAS software needed — everything is self-contained in the container.

---

## Step 1 — Create a Gmail App Password

Gmail App Passwords are 16-character one-time codes that let an app send mail
on your behalf without exposing your main password.

1. Go to [https://myaccount.google.com/security](https://myaccount.google.com/security)
2. Ensure **2-Step Verification** is ON (required for App Passwords)
3. Search for **"App passwords"** or navigate to:  
   Google Account → Security → 2-Step Verification → App passwords
4. Create a new app password: name it **"MintyMarks digest"**, select **Mail**
5. Copy the 16-character password shown (e.g. `abcd efgh ijkl mnop` — omit spaces)

---

## Step 2 — Add email env vars to `.env` on the NAS

SSH into the NAS and edit the `.env` file:

```bash
ssh your-username@192.168.x.x
cd /volume1/docker/mintymarks
nano .env
```

Add or update these lines (replace placeholders with your actual values):

```dotenv
# Email — nightly digest
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-gmail@gmail.com
SMTP_PASS=abcdefghijklmnop
EMAIL_FROM=your-gmail@gmail.com
DIGEST_TO=ganderson101@gmail.com
FRONTEND_URL=https://app.mintymarks.com
```

> **Never commit `.env` to git** — it contains your app password.

---

## Step 3 — Rebuild and redeploy the stack

```bash
cd /volume1/docker/mintymarks
git pull
docker compose -f docker-compose.nas.yml up -d --build
```

The `digest-cron` service is a new container; the first build downloads
`node:20-alpine` and installs `nodemailer` (~60 MB, one-time). Subsequent
rebuilds use Docker's layer cache.

Verify all four services are running:

```bash
docker compose -f docker-compose.nas.yml ps
# Expected: backend, frontend, cloudflared, digest-cron — all "running"
```

---

## Step 4 — Trigger a test digest immediately

Run one digest right now (outside of the 21:00 schedule) to confirm the email
arrives in your inbox:

```bash
docker compose -f docker-compose.nas.yml exec digest-cron \
  sh -c '. /tmp/digest-env; cd /app && node scripts/nightly-digest.mjs'
```

Check `ganderson101@gmail.com` within a minute. Subject will be:
`MintyMarks nightly — YYYY-MM-DD`

If the email doesn't arrive:
- Check spam/junk folder
- Inspect logs: `docker compose -f docker-compose.nas.yml logs digest-cron`
- Verify `.env` values with: `docker compose -f docker-compose.nas.yml exec digest-cron env | grep -E "SMTP|DIGEST"`

---

## Step 5 — Confirm schedule is active

```bash
docker compose -f docker-compose.nas.yml exec digest-cron crontab -l
# Expected: 0 21 * * *   . /tmp/digest-env; cd /app && node scripts/nightly-digest.mjs >> ...
```

Logs from each nightly run accumulate in the `digest_logs` Docker volume:

```bash
docker compose -f docker-compose.nas.yml exec digest-cron \
  tail -50 /var/log/mintymarks/digest.log
```

---

## DNS (app.mintymarks.com)

This runbook does **not** repeat the NAS / Cloudflare Tunnel setup.  
See the **MIN-41 thread** for the full Cloudflare Tunnel + DNS runbook.

Quick summary of what must already be set:
- Cloudflare Tunnel pointing `app.mintymarks.com` → `frontend:80` on the NAS
- `.env` contains `CLOUDFLARE_TUNNEL_TOKEN`, `ALLOWED_ORIGINS=https://app.mintymarks.com`, `MINTYMARKS_SECRET`

Once those are in place, `FRONTEND_URL=https://app.mintymarks.com` in the digest
emails will produce clickable links.

---

## Fail-safe behaviour

- `restart: unless-stopped` — the container restarts on crash; it does **not**
  restart if you explicitly stop it with `docker compose stop digest-cron`.
- The cron job is a one-shot script (not a long-lived process); a failure exits
  with a non-zero code that is captured in `digest.log` without crashing the
  container.
- SMTP errors are logged to `digest.log` and the script exits 1; no retry loop,
  no crash loop.

---

## Variables summary

| Variable | Required | Value |
|---|---|---|
| `EMAIL_PROVIDER` | yes | `smtp` |
| `SMTP_HOST` | yes | `smtp.gmail.com` |
| `SMTP_PORT` | yes | `587` |
| `SMTP_USER` | yes | your Gmail address |
| `SMTP_PASS` | yes | Gmail App Password (16 chars) |
| `EMAIL_FROM` | no | defaults to `SMTP_USER` |
| `DIGEST_TO` | no | defaults to `ganderson101@gmail.com` |
| `FRONTEND_URL` | no | defaults to `https://app.mintymarks.com` |
| `PAPERCLIP_API_URL` | no | omit — section skipped gracefully if absent |
