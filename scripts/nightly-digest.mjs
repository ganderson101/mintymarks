#!/usr/bin/env node
/**
 * MintyMarks nightly digest generator.
 *
 * Usage:
 *   node scripts/nightly-digest.mjs              # prod: sends via Python send_digest (SMTP)
 *   node scripts/nightly-digest.mjs --dry-run    # prints to stdout only
 *   EMAIL_PROVIDER=console node scripts/nightly-digest.mjs
 *
 * Prod mode delegates sending to backend/email_sender.py via subprocess so the
 * same provider routing (console → smtp) is shared with the magic-link flow.
 *
 * Required env vars for prod (smtp) mode:
 *   EMAIL_PROVIDER=smtp
 *   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
 *   DIGEST_TO (defaults to ganderson101@gmail.com)
 *   FRONTEND_URL (defaults to https://app.mintymarks.com)
 *
 * Optional — Paperclip section is omitted gracefully if unset/unreachable:
 *   PAPERCLIP_API_URL, PAPERCLIP_API_KEY, PAPERCLIP_COMPANY_ID
 */

import { execSync, spawnSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const DRY_RUN =
  process.argv.includes('--dry-run') ||
  process.env.EMAIL_PROVIDER === 'console';

const DIGEST_TO = process.env.DIGEST_TO || 'ganderson101@gmail.com';
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://app.mintymarks.com';

// ── Date / subject ────────────────────────────────────────────────────────────

const now = new Date();
const isoDate = now.toISOString().slice(0, 10);
const dateStr = now.toLocaleDateString('en-GB', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  timeZone: 'Europe/London',
});
const subject = `MintyMarks nightly — ${isoDate}`;

// ── Helpers ───────────────────────────────────────────────────────────────────

function run(cmd, fallback = '') {
  try {
    return execSync(cmd, {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    }).trim();
  } catch {
    return fallback;
  }
}

const HR = '─'.repeat(60);
function section(title) {
  return `\n${HR}\n${title}\n${HR}\n`;
}

// ── Git activity ──────────────────────────────────────────────────────────────

function gitSection() {
  const branch = run('git rev-parse --abbrev-ref HEAD', 'unknown');
  const recent24h =
    run("git log --since='24 hours ago' --all --oneline") ||
    '(no commits in the last 24 h)';
  const ahead = run('git log origin/main..HEAD --oneline');
  const unmergedRaw = run('git branch --no-merged main');
  const unmerged = unmergedRaw
    ? unmergedRaw
        .split('\n')
        .map((b) => b.trim())
        .filter(Boolean)
        .join(', ')
    : '';

  let out = section('GIT ACTIVITY');
  out += `Current branch : ${branch}\n`;
  out += '\nCommits in the last 24 h (all local branches):\n';
  out +=
    recent24h
      .split('\n')
      .map((l) => `  ${l}`)
      .join('\n') + '\n';

  if (ahead) {
    out += '\nCommits ahead of origin/main (not yet pushed):\n';
    out +=
      ahead
        .split('\n')
        .map((l) => `  ${l}`)
        .join('\n') + '\n';
  }

  if (unmerged) {
    out += `\nFeature branches not yet merged to main: ${unmerged}\n`;
  }

  return out;
}

// ── Paperclip issues ──────────────────────────────────────────────────────────

async function issuesSection() {
  const apiUrl = process.env.PAPERCLIP_API_URL;
  const apiKey = process.env.PAPERCLIP_API_KEY;
  const companyId = process.env.PAPERCLIP_COMPANY_ID;

  const header = section(`PAPERCLIP ISSUES — ${isoDate} (UTC)`);

  if (!apiUrl || !apiKey || !companyId) {
    return header + '(PAPERCLIP_API_URL/KEY/COMPANY_ID not set — section skipped)\n';
  }

  try {
    const resp = await fetch(
      `${apiUrl}/api/companies/${companyId}/issues?limit=200`,
      {
        headers: { Authorization: `Bearer ${apiKey}` },
        signal: AbortSignal.timeout(10_000),
      }
    );
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();
    const issues = Array.isArray(data) ? data : (data.issues ?? []);

    const groups = {
      opened: [],
      done: [],
      in_progress: [],
      in_review: [],
      blocked: [],
    };

    for (const issue of issues) {
      const label = `${issue.identifier} — ${issue.title}`;
      if (issue.createdAt?.slice(0, 10) === isoDate) groups.opened.push(label);
      if (issue.completedAt?.slice(0, 10) === isoDate) groups.done.push(label);
      if (issue.status === 'in_progress') groups.in_progress.push(label);
      if (issue.status === 'in_review') groups.in_review.push(label);
      if (issue.status === 'blocked') groups.blocked.push(label);
    }

    const fmt = (label, list) =>
      list.length
        ? `${label} (${list.length}):\n${list
            .slice(0, 15)
            .map((l) => `  ${l}`)
            .join('\n')}\n`
        : '';

    let out = header;
    out += fmt('Opened today', groups.opened);
    out += fmt('Completed today', groups.done);
    out += fmt('In progress', groups.in_progress);
    out += fmt('In review', groups.in_review);
    out += fmt('Blocked', groups.blocked);
    if (Object.values(groups).every((g) => g.length === 0)) {
      out += '(No issue activity to report)\n';
    }
    return out;
  } catch (err) {
    return header + `(Unavailable: ${err.message})\n`;
  }
}

// ── Roadmap ───────────────────────────────────────────────────────────────────

function roadmapSection() {
  const roadmapPath = join(ROOT, 'paperclip', 'roadmap.md');
  if (!existsSync(roadmapPath)) return '';
  const lines = readFileSync(roadmapPath, 'utf8')
    .split('\n')
    .filter((l) => l.trim())
    .slice(0, 25);
  return section('ROADMAP (from paperclip/roadmap.md)') + lines.join('\n') + '\n';
}

// ── Build digest ──────────────────────────────────────────────────────────────

async function buildDigest() {
  const gitOut = gitSection();
  const issuesOut = await issuesSection();
  const roadmapOut = roadmapSection();

  const doneCount = (issuesOut.match(/Completed today \((\d+)\)/) || [])[1] ?? '?';
  const inProgCount = (issuesOut.match(/In progress \((\d+)\)/) || [])[1] ?? '?';
  const blockedCount = (issuesOut.match(/Blocked \((\d+)\)/) || [])[1] ?? '?';
  const headline = `${doneCount} issues closed today; ${inProgCount} in progress, ${blockedCount} blocked. App: ${FRONTEND_URL}`;

  return [
    `MINTYMARKS NIGHTLY — ${dateStr}`,
    '='.repeat(60),
    '',
    `HEADLINE: ${headline}`,
    gitOut,
    issuesOut,
    roadmapOut,
    '',
    HR,
    `End of digest.  View the app: ${FRONTEND_URL}`,
    HR,
  ].join('\n');
}

// ── Send via Python backend/email_sender.py ───────────────────────────────────

function sendViaPython(to, subj, body) {
  // Delegates to backend/email_sender.py so smtp/console routing is shared
  // with the magic-link flow. Requires python3 in PATH and SMTP_* env vars.
  const result = spawnSync(
    'python3',
    [
      '-c',
      // Pass to/subject as argv so no shell-escaping issues with body
      'import sys; sys.path.insert(0,"backend"); from email_sender import send_digest; send_digest(sys.argv[1], sys.argv[2], sys.stdin.read())',
      to,
      subj,
    ],
    { input: body, encoding: 'utf8', cwd: ROOT, stdio: ['pipe', 'pipe', 'pipe'] }
  );

  if (result.stdout) process.stdout.write(result.stdout);
  if (result.status !== 0) {
    throw new Error(
      `email_sender.send_digest failed (exit ${result.status}): ${result.stderr || '(no stderr)'}`
    );
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

try {
  const body = await buildDigest();

  if (DRY_RUN) {
    console.log(`To:      ${DIGEST_TO}`);
    console.log(`Subject: ${subject}`);
    console.log('');
    console.log(body);
  } else {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.error(
        '[digest] ERROR: SMTP_USER and SMTP_PASS must be set for production mode.\n' +
          '  Use --dry-run or set EMAIL_PROVIDER=console for testing.'
      );
      process.exit(1);
    }
    sendViaPython(DIGEST_TO, subject, body);
  }
} catch (err) {
  console.error(`[digest] FATAL: ${err.message}`);
  process.exit(1);
}
