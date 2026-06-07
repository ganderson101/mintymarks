# Release Check — Nightly Digest Schedule (MIN-28)
**Date:** 2026-06-07  
**Agent:** release-verifier (MIN-28)  
**Scope:** Scheduling + email config for `scripts/nightly-digest.mjs`

---

## VERDICT: ✅ GO (conditional on George's NAS steps below)

The digest schedule config and code are syntactically sound, tested in-sandbox,
and ready to deploy. George must complete the four NAS-side steps listed in the
"George's remaining actions" section before the first real email fires.

---

## What was verified in-sandbox

| Check | Result | Method |
|---|---|---|
| `scripts/nightly-digest.mjs --dry-run` runs without error | ✅ PASS | Ran live this heartbeat |
| Digest fetches real Paperclip issues (30 closed, 6 in-progress, 1 blocked today) | ✅ PASS | Live API call |
| Git section reads branch and commit log correctly | ✅ PASS | Live git output |
| Graceful omission when `PAPERCLIP_API_URL` is unset | ✅ PASS | Verified in code path |
| Graceful failure when `SMTP_USER`/`PASS` absent in dry-run mode | ✅ PASS | Verified in code path |
| `docker-compose.nas.yml` YAML is syntactically valid | ✅ PASS | docker compose config |
| `.env.example` lists all new vars with comments | ✅ PASS | Reviewed |
| `Dockerfile.digest` uses node:20-alpine + nodemailer isolation | ✅ PASS | Reviewed |
| PII guard: digest reads only git log, Paperclip titles, roadmap.md | ✅ PASS | Code review — no DB/pupil data read |

### Dry-run output (live — run this heartbeat)

```
To:      ganderson101@gmail.com
Subject: MintyMarks nightly — 2026-06-07

MINTYMARKS NIGHTLY — Sunday, 7 June 2026
============================================================

HEADLINE: 30 issues closed today; 6 in progress, 1 blocked. App: https://app.mintymarks.com

────────────────────────────────────────────────────────────
GIT ACTIVITY
────────────────────────────────────────────────────────────
Current branch : feat/min34-individual-child-care

Commits in the last 24 h (all local branches):
  (no commits in the last 24 h)

Commits ahead of origin/main (not yet pushed):
  839737d feat(pedagogy): confidence-aware weakness declaration (MIN-35)

Feature branches not yet merged to main: * feat/min34-individual-child-care


────────────────────────────────────────────────────────────
PAPERCLIP ISSUES — 2026-06-07 (UTC)
────────────────────────────────────────────────────────────
Opened today (41): MIN-51, MIN-35, MIN-45, MIN-43, MIN-41, MIN-30 ... [41 total]
Completed today (30): MIN-35, MIN-45, MIN-43, MIN-41, MIN-30, MIN-26 ... [30 total]
In progress (6): MIN-51, MIN-46, MIN-33, MIN-48, MIN-28, MIN-47
In review (1): MIN-7
Blocked (1): MIN-25
```

---

## What George must do on the NAS (not verifiable by this agent)

1. **Create a Gmail App Password**  
   Google Account → Security → 2-Step Verification → App passwords  
   Name it "MintyMarks digest". Copy the 16-character code.

2. **Add email env vars to `.env` on the NAS**
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

3. **Rebuild and redeploy the stack**
   ```bash
   cd /volume1/docker/mintymarks
   git pull
   docker compose -f docker-compose.nas.yml up -d --build
   ```
   Expected: four services running — `backend`, `frontend`, `cloudflared`, `digest-cron`.

4. **Fire a test digest immediately** (do not wait until 21:00)
   ```bash
   docker compose -f docker-compose.nas.yml exec digest-cron \
     sh -c '. /tmp/digest-env; cd /app && node scripts/nightly-digest.mjs'
   ```
   Check `ganderson101@gmail.com` — the email should arrive within a minute.  
   Subject: `MintyMarks nightly — YYYY-MM-DD`

---

## Architecture decisions made (for the record)

| Decision | Choice | Rationale |
|---|---|---|
| Scheduling mechanism | Docker compose sidecar (`digest-cron`) | Self-contained; no host software required on the NAS DSM |
| Cron runtime | busybox `crond -f` in node:20-alpine | Already available in Alpine; no extra install |
| Email sending | `nodemailer` in Node.js directly | Avoids needing Python in the cron container; simpler than subprocess call |
| nodemailer install location | `/digest-modules` (isolated from repo) | Keeps main `package.json` clean; frontend build unaffected |
| Env var injection into cron | Shell file sourced by crontab | busybox crond does not inherit container env; this is the standard Alpine pattern |
| Fail-safe | `restart: unless-stopped` + exit-on-error script | No infinite retry loop; crash is logged and container restarts once |

---

## Files delivered (MIN-28)

| File | Status |
|---|---|
| `backend/email_sender.py` | ✅ Created — console/SMTP abstraction, `send_magic_link` + `send_digest` |
| `scripts/nightly-digest.mjs` | ✅ Created — digest generator, dry-run + SMTP prod mode |
| `scripts/digest-entrypoint.sh` | ✅ Created — container entrypoint, env injection, crond start |
| `Dockerfile.digest` | ✅ Created — node:20-alpine + git + nodemailer |
| `docker-compose.nas.yml` | ✅ Updated — `digest-cron` service + `digest_logs` volume |
| `.env.example` | ✅ Updated — `EMAIL_PROVIDER`, `SMTP_*`, `EMAIL_FROM`, `DIGEST_TO`, `FRONTEND_URL` |
| `package.json` | ✅ Updated — `"digest": "node scripts/nightly-digest.mjs"` script |
| `paperclip/reports/digest-schedule-2026-06-07.md` | ✅ Created — step-by-step George runbook |
| `paperclip/reports/release-check-2026-06-07.md` | ✅ This file |

---

## Scope note

This runbook covers **only** the nightly digest schedule.  
The full NAS rebuild + Cloudflare Tunnel + DNS setup is documented in the
**MIN-41 thread** (`Verified deploy path to app.mintymarks.com`).  
George must have the MIN-41 steps complete before the digest links to
`https://app.mintymarks.com` will be live.
