# Nightly Digest — Schedule & Email Setup Runbook
**Date:** 2026-06-07  
**Issue:** MIN-28  
**Relates to:** MIN-25 (nightly updates) | See MIN-41 thread for full NAS rebuild runbook

---

## What this adds

A new `digest-cron` Docker service runs `scripts/nightly-digest.mjs` every night
at **21:00 Europe/London**. It sends one plain-text summary email to `DIGEST_TO`
via Gmail SMTP using an App Password set once in `.env`.

Architecture: Node.js generates the digest → delegates to
`backend/email_sender.py send_digest()` via subprocess (same provider routing as
the magic-link flow; stdlib smtplib only, no new dependencies).

---

## Step 1 — Create a Gmail App Password

1. Go to [https://myaccount.google.com/security](https://myaccount.google.com/security)
2. Ensure **2-Step Verification** is ON (required for App Passwords)
3. Navigate to: Google Account → Security → 2-Step Verification → **App passwords**
4. Create new: name it **"MintyMarks digest"**
5. Copy the 16-character password shown (e.g. `abcd efgh ijkl mnop` — omit spaces)

---

## Step 2 — Add email env vars to `.env` on the NAS

SSH into the NAS:
```bash
ssh your-username@192.168.x.x
cd /volume1/docker/mintymarks
nano .env
```

Add or update these lines:
```dotenv
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-gmail@gmail.com
SMTP_PASS=abcdefghijklmnop
EMAIL_FROM=your-gmail@gmail.com
DIGEST_TO=ganderson101@gmail.com
FRONTEND_URL=https://app.mintymarks.com
```

> **Never commit `.env` to git.** The App Password stays on the NAS only.

---

## Step 3 — Rebuild and redeploy the stack

```bash
cd /volume1/docker/mintymarks
git pull
docker compose -f docker-compose.nas.yml up -d --build
```

The `digest-cron` service is new; first build downloads `node:20-alpine` and
installs `git` and `python3` (~120 MB, one-time). Subsequent rebuilds use
Docker's layer cache.

Verify all four services are running:
```bash
docker compose -f docker-compose.nas.yml ps
# Expected: backend, frontend, cloudflared, digest-cron — all "running"
```

---

## Step 4 — Trigger a test digest immediately

Run one digest now (outside the 21:00 schedule) to confirm the email arrives:

```bash
docker compose -f docker-compose.nas.yml exec digest-cron \
  sh -c '. /tmp/digest-env; cd /app && node scripts/nightly-digest.mjs'
```

Check `ganderson101@gmail.com` within a minute.  
Subject will be: `MintyMarks nightly — YYYY-MM-DD`

If the email does not arrive:
- Check spam/junk
- Inspect container logs: `docker compose -f docker-compose.nas.yml logs digest-cron`
- Verify env vars: `docker compose -f docker-compose.nas.yml exec digest-cron env | grep SMTP`

---

## Step 5 — Confirm schedule is active

```bash
docker compose -f docker-compose.nas.yml exec digest-cron crontab -l
# Expected line: 0 21 * * *   . /tmp/digest-env; cd /app && node scripts/nightly-digest.mjs >> ...
```

Logs from each nightly run accumulate in the `digest_logs` volume:
```bash
docker compose -f docker-compose.nas.yml exec digest-cron \
  tail -50 /var/log/mintymarks/digest.log
```

---

## DNS / app.mintymarks.com

This runbook covers the digest only. For the full Cloudflare Tunnel + DNS setup
see the **MIN-41 thread**. Once that is complete, `FRONTEND_URL=https://app.mintymarks.com`
in the digest emails will produce live clickable links.

---

## Fail-safe behaviour

- `restart: unless-stopped` — container restarts on crash; does not restart if
  you explicitly stop it with `docker compose stop digest-cron`.
- The cron job is a one-shot script; errors are logged to `digest.log` without
  crashing the container or triggering a retry loop.
- SMTP failures exit the script with code 1 — logged, no crash loop.

---

## Variables summary

| Variable | Required | Default/Value |
|---|---|---|
| `EMAIL_PROVIDER` | yes | `smtp` |
| `SMTP_HOST` | yes | `smtp.gmail.com` |
| `SMTP_PORT` | yes | `587` |
| `SMTP_USER` | yes | your Gmail address |
| `SMTP_PASS` | yes | Gmail App Password (16 chars) |
| `EMAIL_FROM` | no | defaults to `SMTP_USER` |
| `DIGEST_TO` | no | `ganderson101@gmail.com` |
| `FRONTEND_URL` | no | `https://app.mintymarks.com` |
| `PAPERCLIP_API_URL` | no | omit — section skipped gracefully |
