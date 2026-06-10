/**
 * checkBankIntegrity.mjs — MIN-107 acceptance check
 *
 * Verifies that backend/questions.json:
 *  1. Still has exactly 23,417 questions total
 *  2. Subject counts match expected values (chem/bio/maths unchanged)
 *  3. All physics questions with a `solution` field have a non-empty string
 *  4. No non-physics question gained a solution field
 *  5. Reports the exact physics solution count
 *
 * Usage:  node scripts/checkBankIntegrity.mjs
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const bankPath = resolve(__dirname, "..", "backend", "questions.json");

const bank = JSON.parse(readFileSync(bankPath, "utf-8"));

const EXPECTED = {
  total: 23417,
  physics: 4679,
  maths: 14638,
  chemistry: 2320,
  biology: 1780,
};

let pass = true;
const fail = (msg) => { console.error(`  ✗ ${msg}`); pass = false; };
const ok   = (msg) => console.log(`  ✓ ${msg}`);

console.log(`\nBank: ${bankPath}\n`);

// 1. Count by subject
const counts = { physics: 0, maths: 0, chemistry: 0, biology: 0 };
for (const q of bank) {
  const s = q.subject ?? "unknown";
  counts[s] = (counts[s] ?? 0) + 1;
}

const total = bank.length;
if (total === EXPECTED.total) ok(`Total: ${total}`); else fail(`Total: ${total} (expected ${EXPECTED.total})`);
for (const subj of ["physics", "maths", "chemistry", "biology"]) {
  if (counts[subj] === EXPECTED[subj]) ok(`${subj}: ${counts[subj]}`);
  else fail(`${subj}: ${counts[subj]} (expected ${EXPECTED[subj]})`);
}

// 2. Solution field integrity
let physicsSolutionCount = 0;
let nonPhysicsSolutionCount = 0;
let emptySolution = 0;

for (const q of bank) {
  if ("solution" in q) {
    if (q.subject === "physics") {
      physicsSolutionCount++;
      if (typeof q.solution !== "string" || q.solution.trim() === "") emptySolution++;
    } else {
      nonPhysicsSolutionCount++;
    }
  }
}

if (physicsSolutionCount > 0) ok(`Physics with solution: ${physicsSolutionCount}`);
else fail("Physics with solution: 0 (expected > 0)");

if (nonPhysicsSolutionCount === 0) ok("No non-physics questions have solution field");
else fail(`${nonPhysicsSolutionCount} non-physics questions have solution field`);

if (emptySolution === 0) ok("All solution strings are non-empty");
else fail(`${emptySolution} solution strings are empty or non-string`);

// 3. Core field check (spot-check first/last 5 physics questions with solutions)
const CORE = ["id", "level", "subject", "category", "text", "options", "correct", "difficulty"];
let missingCore = 0;
for (const q of bank) {
  for (const field of CORE) {
    if (!(field in q)) { missingCore++; break; }
  }
}
if (missingCore === 0) ok("All questions have required core fields");
else fail(`${missingCore} questions missing at least one core field`);

// Summary
console.log(`\n── Summary ───────────────────────────────────────────────────────`);
console.log(`  Physics questions with solution: ${physicsSolutionCount} / ${counts.physics}`);
console.log(`  Physics questions without solution: ${counts.physics - physicsSolutionCount}`);
console.log(`\n${pass ? "✓ ALL CHECKS PASSED" : "✗ SOME CHECKS FAILED"}`);
process.exit(pass ? 0 : 1);
