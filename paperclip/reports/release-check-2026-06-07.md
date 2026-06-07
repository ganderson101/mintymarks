# Release Check — Nightly Digest Schedule (MIN-28)
**Date:** 2026-06-07  
**Branch:** feat/min25-nightly-digest  
**Agent:** release-verifier (MIN-28)

---

## VERDICT: GO (conditional on George's 4 NAS steps)

The digest schedule config, code, and runbook are committed, pushed, and verified
in-sandbox. George must complete the four NAS steps before the first real email
fires.

---

## In-sandbox verification

| Check | Result | Evidence |
|---|---|---|
| `py -3 -c "import sys; sys.path.insert(0,'backend'); from email_sender import send_digest; print('OK')"` | **PASS** | "OK — send_digest imported" |
| `node scripts/nightly-digest.mjs --dry-run` runs without error | **PASS** | Full output below |
| Dry-run hits live Paperclip API: 35 closed, 7 in-progress, 3 blocked | **PASS** | Real API call this heartbeat |
| `docker compose -f docker-compose.nas.yml config` YAML valid | **PASS** | `config --quiet` exits 0 |
| No pupil/user/DB data in digest | **PASS** | Code reads git log, Paperclip titles/statuses, roadmap.md only |
| `send_digest` delegates to Python `email_sender.py` subprocess | **PASS** | `spawnSync('python3', ['-c', ...send_digest...], {input: body})` |
| `restart: unless-stopped` + no retry loop in script | **PASS** | Script exits on error; container restarts once |

### Dry-run output (live this heartbeat, branch feat/min25-nightly-digest)

```
To:      ganderson101@gmail.com
Subject: MintyMarks nightly — 2026-06-07

MINTYMARKS NIGHTLY — Sunday, 7 June 2026
============================================================

HEADLINE: 35 issues closed today; 7 in progress, 3 blocked. App: https://app.mintymarks.com

────────────────────────────────────────────────────────────
GIT ACTIVITY
────────────────────────────────────────────────────────────
Current branch : feat/min25-nightly-digest
Commits in the last 24 h: (none on this branch)
Commits ahead of origin/main: ffbc045 feat(board): add board portal router...
Feature branches not yet merged to main: feat/min25-nightly-digest, feat/min34-..., feat/min38-...

────────────────────────────────────────────────────────────
PAPERCLIP ISSUES — 2026-06-07 (UTC)
────────────────────────────────────────────────────────────
Completed today (35): MIN-54, MIN-35, MIN-45, MIN-43, MIN-41, MIN-30, MIN-26 ...
In progress (7): MIN-52, MIN-56, MIN-46, MIN-33, MIN-53, MIN-28, MIN-47
In review (1): MIN-7  |  Blocked (3): MIN-25, MIN-55, MIN-51
```

---

## What George must do on the NAS

No agent has NAS credentials — these steps are George-only.

1. **Create Gmail App Password**  
   myaccount.google.com/apppasswords → App passwords → name "MintyMarks digest"

2. **Add email env vars to `/volume1/docker/mintymarks/.env`**
   ```dotenv
   EMAIL_PROVIDER=smtp
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-gmail@gmail.com
   SMTP_PASS=your-16-char-app-password
   EMAIL_FROM=your-gmail@gmail.com
   DIGEST_TO=ganderson101@gmail.com
   FRONTEND_URL=https://app.mintymarks.com
   ```

3. **Rebuild the stack**
   ```bash
   cd /volume1/docker/mintymarks
   git pull && git checkout feat/min25-nightly-digest
   docker compose -f docker-compose.nas.yml up -d --build
   docker compose -f docker-compose.nas.yml ps
   # Expect: backend, frontend, cloudflared, digest-cron — all running
   ```

4. **Fire a test digest immediately**
   ```bash
   docker compose -f docker-compose.nas.yml exec digest-cron \
     sh -c '. /tmp/digest-env; cd /app && node scripts/nightly-digest.mjs'
   ```
   Check `ganderson101@gmail.com` — subject `MintyMarks nightly — YYYY-MM-DD`.

Full step-by-step: `paperclip/reports/digest-schedule-2026-06-07.md`

---

## Files committed on feat/min25-nightly-digest

| File | Change |
|---|---|
| `backend/email_sender.py` | New — console/SMTP abstraction, `send_magic_link` + `send_digest` |
| `scripts/nightly-digest.mjs` | New — generates digest; delegates send to Python subprocess |
| `scripts/digest-entrypoint.sh` | New — busybox crond setup, env injection, 21:00 Europe/London |
| `Dockerfile.digest` | New — node:20-alpine + python3 + git (no external packages) |
| `docker-compose.nas.yml` | Updated — `digest-cron` service + `digest_logs` volume |
| `.env.example` | Updated — `EMAIL_PROVIDER`, `SMTP_*`, `EMAIL_FROM`, `DIGEST_TO`, `FRONTEND_URL` |
| `package.json` | Updated — `"digest": "node scripts/nightly-digest.mjs"` |
| `paperclip/reports/digest-schedule-2026-06-07.md` | New — George's exact runbook |
| `paperclip/reports/release-check-2026-06-07.md` | This file |

---

## Scope note

This branch covers the digest schedule only. The Cloudflare Tunnel + DNS + NAS
rebuild runbook is in the MIN-41 thread. George needs both before the first live
send.
