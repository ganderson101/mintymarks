# Paperclip + Claude Code (Max-only) — Setup Checklist

Goal: run Paperclip locally and have it drive Claude Code using **your Max subscription**, not paid API credits.

Work top to bottom. Don't skip the verify steps — they catch 90% of problems early.

---

## A few terms first (read once)

- **PowerShell** — Windows' command-line app. You type one command, press Enter, it runs. That's it.
- **Terminal / command line / shell** — all the same idea: a text box you type commands into. PowerShell is one.
- **Directory** — just a folder. "Change directory" = move the command line's focus into a folder so commands act on it.
- **`cd`** — "change directory." `cd C:\some\path` moves you there.
- **Node.js** — the runtime that runs JavaScript tools outside a browser. Claude Code and Paperclip are both built on it. Installing Node also gives you `npm` and `npx`.
- **`npm`** — Node's package installer. Think pip, but for JavaScript.
- **`-g`** — "global." `npm i -g X` installs tool X for your whole machine, so you can run it from any folder. Without `-g` it installs only into the current folder.
- **`npx`** — "run a package once, without installing it permanently." Handy for tools you run occasionally.
- **`--version`** — almost every CLI tool responds to this. It's how you confirm a thing installed correctly.

> Tip: in PowerShell, **right-click pastes**. Ctrl+C/Ctrl+V doesn't always work in the terminal.

---

## Step 0 — Open PowerShell

- [ ] Press the **Windows key**, type `powershell`, press **Enter**.
- [ ] A dark window opens with a prompt ending in `>`. You're in.

You do **not** need "Administrator" PowerShell for any of this. Regular is fine.

---

## Step 1 — Install Node.js (the foundation)

First check if you already have it:

- [ ] Run:
  ```powershell
  node --version
  ```
- [ ] If it prints something like `v20.x` or higher → skip to Step 2.
- [ ] If it says *"not recognized"* or shows v18 or lower, install/update it:
  ```powershell
  winget install OpenJS.NodeJS.LTS
  ```
  (`winget` is Windows' built-in installer. It downloads and installs Node for you.)

- [ ] **Close PowerShell completely and reopen it** (installs only take effect in a fresh window — this catches people constantly).
- [ ] Verify:
  ```powershell
  node --version
  npm --version
  ```
  Both should print version numbers. If they do, your foundation is set.

---

## Step 2 — Install Claude Code and log in with Max

This is the piece that uses your subscription.

- [ ] Install it globally:
  ```powershell
  npm install -g @anthropic-ai/claude-code
  ```
  (`-g` = available everywhere. This is correct here — you want `claude` usable from any folder.)

- [ ] Verify:
  ```powershell
  claude --version
  ```

- [ ] **Check no API key is hijacking billing.** Run:
  ```powershell
  echo $env:ANTHROPIC_API_KEY
  ```
  - If it prints **nothing / a blank line** → good, you're set to use Max.
  - If it prints a key (starts with `sk-ant-`), clear it for this session:
    ```powershell
    $env:ANTHROPIC_API_KEY=""
    ```
    > Why this matters: if that key is set, Claude Code silently bills the paid API instead of your Max plan. Blank = Max.

- [ ] Log in. From any folder, run:
  ```powershell
  claude
  ```
  Then type:
  ```
  /login
  ```
  A browser opens. **Sign in with the account that has your Max subscription.** Approve, return to the terminal.

- [ ] You're now in an interactive Claude Code session. Type `/help` to see commands. Type `/exit` (or close the window) when done.

---

## Step 3 — Learn Claude Code in your real project (10 minutes)

Before orchestrating it, drive it by hand once so you understand what Paperclip is automating.

- [ ] Move into your MintyMarks project:
  ```powershell
  cd C:\Users\G\Documents\Claude\Projects\MintyMarks
  ```
  (Now the command line is "inside" MintyMarks. Anything `claude` does happens here.)

- [ ] Start it:
  ```powershell
  claude
  ```
- [ ] Try a few things to build intuition:
  - Ask: `what files are in this project?`
  - Ask: `explain what this project does` (it'll read your CLAUDE.md)
  - Try a slash command: `/help`, then `/clear` to reset context.
- [ ] `/exit` when done.

> What you just learned: Claude Code = the same agent as Cowork, but in a terminal, scoped to whatever folder you `cd` into. Paperclip's job is to run this *for you*, on a schedule, across multiple agents.

---

## Step 4 — Run Paperclip (no clone needed)

You do **not** need to download Paperclip's source to use it.

- [ ] Pick a home for it that is **NOT inside MintyMarks**. Go to your Projects folder:
  ```powershell
  cd C:\Users\G\Documents\Claude\Projects
  ```
- [ ] Launch it:
  ```powershell
  npx paperclipai onboard --yes
  ```
  - `npx` downloads and runs Paperclip without a permanent install.
  - First run sets up an embedded database automatically — no DB work for you.
  - It starts a server at **http://localhost:3100**.

- [ ] Open a browser and go to **http://localhost:3100**. You should see the Paperclip dashboard.

> Leave that PowerShell window open — closing it stops the server. To run Claude Code separately later, open a **second** PowerShell window.

---

## Step 5 — Wire Claude Code into Paperclip as an agent

In the Paperclip dashboard (http://localhost:3100):

- [ ] Create/add an **agent** and choose the **Claude Code** adapter.
- [ ] Point it at the `claude` binary (it's global from Step 2, so just `claude` usually works).
- [ ] Set its **working directory / workspace** to your MintyMarks path:
  ```
  C:\Users\G\Documents\Claude\Projects\MintyMarks
  ```
- [ ] Give it a small first task (e.g. "list the files and summarise the project"). Confirm it runs and the work shows in the dashboard.

Because that `claude` is logged in with Max (Step 2) and no API key is set, the agent draws from **your subscription quota**.

---

## Step 6 — Sanity check on cost/limits

- [ ] Start with **one** agent, not a fleet. One Max subscription is a single shared quota with rolling 5-hour and weekly caps.
- [ ] In Paperclip, set a **budget / heartbeat schedule** conservatively at first so an agent can't loop unattended for hours.
- [ ] Watch the dashboard's activity/cost view for the first few runs before trusting it to run on its own.

---

## If something breaks

| Symptom | Fix |
|---|---|
| `node` / `claude` / `npx` "not recognized" | Close and reopen PowerShell. If still broken, the install in Step 1 didn't complete — rerun it. |
| `claude` opens but asks for an API key | You skipped `/login`, or `ANTHROPIC_API_KEY` is set. Re-do Step 2's key check, then `/login`. |
| Billing hitting the API instead of Max | `ANTHROPIC_API_KEY` is set somewhere permanent. Search Windows "Environment Variables" and delete it, then reopen PowerShell. |
| http://localhost:3100 won't load | The PowerShell window running `npx paperclipai` was closed. Re-run Step 4. |
| `winget` not recognized | You're on an older Windows. Install Node manually from nodejs.org (pick the LTS button). |

---

## The mental model (so this all makes sense)

- **Cowork** (what you've been using) = friendly desktop app, mounted folders, built on Claude Code.
- **Claude Code** = the same agent in a terminal. More control. This is what Paperclip drives.
- **Paperclip** = a manager sitting *above* Claude Code. It assigns tasks, schedules runs, tracks cost, and coordinates multiple agents — so you manage goals instead of babysitting terminals.

You log into Claude Code once with Max → Paperclip reuses that login → your subscription powers the agents.
