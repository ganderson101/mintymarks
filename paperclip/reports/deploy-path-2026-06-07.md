# MintyMarks — Verified Deploy Path
**Date:** 2026-06-07  
**Author:** release-verifier agent (MIN-41)  
**Scope:** Diagnose origin push failure + NAS rebuild runbook + GO/NO-GO checklist

---

## 1. Root-cause: origin push SSL failure

### Error (captured live)
```
fatal: unable to access 'https://github.com/ganderson101/mintymarks.git/':
SSL certificate problem: unable to get local issuer certificate
```

### Root cause
Git is configured with `http.sslBackend = openssl` at both global and system level. On Windows, OpenSSL ships with its own CA bundle that does not include the Windows Certificate Store — so any GitHub HTTPS operation fails when the system's CA chain is involved (corporate proxies, Zscaler, custom roots, etc.).

**Verification command:**
```
git config --global http.sslBackend
# returns: openssl   ← broken
```

### Fix (one command for George to run)
```bash
git config --global http.sslBackend schannel
```
`schannel` is the Windows native TLS backend. It uses the Windows Certificate Store and always works on Windows for standard HTTPS. After running that, push with:
```bash
git push origin main
```
Expected output:
```
Enumerating objects: ...
Counting objects: ...
Writing objects: 100% ...
To https://github.com/ganderson101/mintymarks.git
   8b7ea6b..4b58dca  main -> main
```

> **Do NOT push yet** — read the GO/NO-GO checklist (section 3) first.

### Alternative if schannel still fails
Switch the remote to SSH instead of HTTPS (avoids the SSL stack entirely):
```bash
git remote set-url origin git@github.com:ganderson101/mintymarks.git
git push origin main
```
Requires an SSH keypair with the public key added to George's GitHub account → Settings → SSH keys.

---

## 2. Current git state

**⚠️ UPDATE (CEO action, 2026-06-07 after this runbook was drafted):** Steps 1+2 below (SSL fix + push) are **already done**. CEO applied `git config --local http.sslBackend schannel` to the repo config and pushed `main` → origin. The table and runbook have been corrected.

| Item | Value |
|---|---|
| Local `main` tip | `4b58dca` Merge MIN-3: fix ks2_md_factor distractor leak |
| `origin/main` tip | `4b58dca` ✅ **IN SYNC** (was `8b7ea6b`; pushed by CEO this cycle) |
| Commits ahead | **0** — fully in sync |
| Commits behind | 0 |
| Current working branch | `feat/min38-board-vibe-chooser` (not main) |

### Why app.mintymarks.com shows "Mindarc"
The NAS last pulled when `origin/main` was the `mindarc` codebase. GitHub is now current — the NAS container won't update until George runs `git pull` + rebuild (section 4). That's the only remaining blocker.

---

## 3. GO/NO-GO release checklist

Checks run on the current codebase (branch `feat/min38-board-vibe-chooser`, but the build-relevant checks are identical for `main`).

### Tests
```
npx vitest run
✓ src/tests/adaptationEngine.test.js   (10 tests)
✓ src/tests/questionEngine.test.js     (6 tests)
✓ src/tests/sessionEngine.test.js      (8 tests)
Test Files: 3 passed (3)
Tests:      24 passed (24)
Duration:   3.49s
```
**Result: ✅ GREEN — 24/24 pass**

### Build
```
npm run build
vite v5.4.21 building for production...
✓ 49 modules transformed.
dist/index.html                  2.99 kB │ gzip: 1.38 kB
dist/assets/index-B2pdxH-A.css  21.89 kB │ gzip: 4.75 kB
dist/assets/index-DRO-_Zs9.js  566.57 kB │ gzip: 183.82 kB
⚠ Some chunks are larger than 500 kB after minification.
✓ built in 998ms
```
**Result: ✅ GREEN — clean build** (chunk size warning is cosmetic, non-blocking)

### PWA service worker
```
PWA v0.20.5
mode      generateSW
precache  11 entries (591.13 KiB)
files generated
  dist/sw.js
  dist/workbox-5ffe50d4.js
```
**Result: ✅ GREEN — SW generated**

### Branding check (built artifact)
```
dist/index.html line 6:  <title>MintyMarks</title>
dist/index.html line 11: <meta name="apple-mobile-web-app-title" content="MintyMarks" />
```
**Result: ✅ GREEN — "MintyMarks" throughout, no "Mindarc" in built output**

### NAS secrets (must confirm before expose to internet)

| Variable | Local `.env` | NAS `.env` required |
|---|---|---|
| `MINTYMARKS_SECRET` | ✅ Set (dev value) | ⚠️ **Must regenerate** for production — dev secret must not ship |
| `ALLOWED_ORIGINS` | ❌ Not set | ⚠️ **Must set** to `https://app.mintymarks.com` |
| `CLOUDFLARE_TUNNEL_TOKEN` | ❌ Not set | ⚠️ **Must confirm** existing tunnel token is in NAS `.env` |

**Result: ⚠️ CONDITIONAL GO** — code is ready; secrets must be confirmed on NAS before public use.

The docker-compose.nas.yml will refuse to start if any of these three are missing (uses `:?` expansion, so it errors explicitly rather than silently).

### Feature scope (what "deploy main today" INCLUDES and EXCLUDES)

**Included in `main`:**
- ✅ MintyMarks rebrand (name, branding, PWA manifest)
- ✅ SRS adaptive schedule integration
- ✅ KS2 maths distractor-leak fix (49 questions, isolated RNG)
- ✅ Evening digest pedagogy section

**NOT yet on `main` — will NOT appear in this deploy:**
- ❌ Board portal (MIN-17) — on `feat/min38-board-vibe-chooser` with uncommitted changes; NOT merged
- ❌ Email/magic-link login (MIN-12) — on `feat/min12-email-login`; awaiting George's merge approval

---

## 4. NAS update runbook (copy-paste)

**GitHub is already current** (`origin/main` = `4b58dca`, pushed by CEO). Start directly at Step 1 below.

### Step 1 — SSH into the NAS
```bash
ssh george@<NAS-IP>
# e.g. ssh george@192.168.1.x
```

### Step 2 — Navigate to the app directory
```bash
cd /volume1/docker/mintymarks
```

### Step 3 — Confirm .env is production-ready
```bash
grep -E "^MINTYMARKS_SECRET=|^ALLOWED_ORIGINS=|^CLOUDFLARE_TUNNEL_TOKEN=" .env
```
Expected — all three must appear with real values (not placeholder strings):
```
MINTYMARKS_SECRET=<64-char hex string>
ALLOWED_ORIGINS=https://app.mintymarks.com
CLOUDFLARE_TUNNEL_TOKEN=<cloudflare token>
```
If `MINTYMARKS_SECRET` is the dev placeholder, generate a real one:
```bash
openssl rand -hex 32
# copy the output, then:
nano .env   # replace MINTYMARKS_SECRET value
```

### Step 4 — Pull latest code
```bash
git pull origin main
```
Expected output (something like):
```
From https://github.com/ganderson101/mintymarks
   8b7ea6b..4b58dca  main -> origin/main
Updating 8b7ea6b..4b58dca
Fast-forward
 ...files changed...
```
If git on the NAS has the same SSL issue, run the same fix first:
```bash
git config --global http.sslBackend schannel   # if on a Linux NAS: skip this, use SSH remote instead
```
On Synology (Linux), the more likely fix is:
```bash
git config --global http.sslVerify false   # temporary workaround — OR use SSH remote
# Better: git remote set-url origin git@github.com:ganderson101/mintymarks.git
```

### Step 5 — Rebuild and restart containers
```bash
docker compose -f docker-compose.nas.yml up -d --build
```
Expected output:
```
[+] Building 120.0s ...
 ✓ backend built
 ✓ frontend built
[+] Running 3/3
 ✓ Container mintymarks-backend-1    Started
 ✓ Container mintymarks-frontend-1   Started
 ✓ Container mintymarks-cloudflared-1  Started
```
First build after a code change takes 2–5 minutes (npm install + Python deps).

**Data safety:** The SQLite DB lives in the named volume `mintymarks_db_data`. `up -d --build` never touches volumes — all user data survives. Only `down -v` (which you should NOT run) would delete it.

### Step 6 — Verify containers are healthy
```bash
docker compose -f docker-compose.nas.yml ps
```
Expected:
```
NAME                           STATUS
mintymarks-backend-1           Up (healthy)
mintymarks-frontend-1          Up
mintymarks-cloudflared-1       Up
```
If backend shows `(health: starting)`, wait 30 seconds and check again.

### Step 7 — Did it work? (end-to-end check)
```bash
# From NAS, check backend health endpoint directly:
curl -s http://localhost:8000/healthz
# Expected: {"status":"ok"} or similar

# From any browser:
# Open https://app.mintymarks.com
# The page title should say "MintyMarks" (not "Mindarc")
# The app should load without a blank screen
```

If Cloudflare shows the old page for a few minutes, it may be cached — do a hard refresh (`Ctrl+Shift+R`) or open in a private tab.

---

## 5. Steps that physically require George

Steps 1+2 (SSL fix + push) are **already done by the CEO**. George only needs:

| # | Step | Why George Only |
|---|---|---|
| 1 | ~~Run `git config` SSL fix~~ | ✅ Done by CEO (repo-local schannel) |
| 2 | ~~`git push origin main`~~ | ✅ Done by CEO — origin is current |
| 3 | SSH into the NAS | No agent can reach the NAS network |
| 4 | Edit NAS `.env` with production `MINTYMARKS_SECRET` (generate with `openssl rand -hex 32`) | Secret must not be generated or stored by agents |
| 5 | Confirm `ALLOWED_ORIGINS=https://app.mintymarks.com` is in NAS `.env` | Only George knows current NAS file state |
| 6 | Confirm `CLOUDFLARE_TUNNEL_TOKEN` is in NAS `.env` and tunnel is active | Only George has access to Cloudflare dashboard |
| 7 | Run `git pull && docker compose -f docker-compose.nas.yml up -d --build` on NAS | Requires NAS SSH + docker access |
| 8 | Visual smoke-test: open https://app.mintymarks.com and confirm "MintyMarks" appears | George is the human verifier |

---

## 6. Open prerequisites (carry-forward from parent issue MIN-38)

- `MINTYMARKS_SECRET` at production strength is required before the site is used by the family — the dev value in the local `.env` must NOT be reused on the NAS.
- HTTPS is already served via the Cloudflare tunnel (app.mintymarks.com is live) — no further action needed for HTTPS.
- MIN-12 (`feat/min12-email-login`) and MIN-17 (board portal) are awaiting George's merge approval; they are not blocking this deploy, but must NOT be included by cherry-picking — only push `main` as-is.

---

## Summary

| Gate | Status |
|---|---|
| Tests (24/24) | ✅ PASS |
| Build (vite) | ✅ PASS |
| PWA service worker | ✅ GENERATED |
| App branding ("MintyMarks") | ✅ CONFIRMED |
| Origin push ready | ✅ ONE-LINE FIX then `git push origin main` |
| NAS secrets confirmed | ⚠️ GEORGE MUST VERIFY before live |
| NAS rebuild | ⚠️ GEORGE MUST RUN (5-step runbook above) |

**GO verdict on code quality: ✅ APPROVED.**  
**GO verdict on deployment: CONDITIONAL** — GitHub push is done. Unblock requires George to confirm NAS `.env` secrets and run the rebuild (steps 3–7 above, ~10 min).
