/**
 * portSolutions.mjs — MIN-107
 *
 * Runs the generator into a scratch directory (so the live bank is never
 * touched during generation), then patches backend/questions.json in-place:
 *   - Adds `solution` to every physics question whose template emits one.
 *   - Leaves all other fields byte-identical and preserves question order.
 *   - Does NOT touch maths / chemistry / biology questions.
 *
 * Usage:  node scripts/portSolutions.mjs
 */

import { mkdirSync, copyFileSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");

// ── 1. Create a scratch directory tree that mimics the project layout ─────────
const scratchRoot = join(projectRoot, "_port_scratch");
const scratchScripts = join(scratchRoot, "scripts");
const scratchBackend = join(scratchRoot, "backend");
const scratchSrcData = join(scratchRoot, "src", "data");

for (const dir of [scratchScripts, scratchBackend, scratchSrcData]) {
  mkdirSync(dir, { recursive: true });
}

// Copy the (already-fixed) generator into the scratch scripts dir
const genSrc = join(__dirname, "generateQuestions.mjs");
const genDst = join(scratchScripts, "generateQuestions.mjs");
copyFileSync(genSrc, genDst);

console.log("Running generator into scratch directory…");
try {
  execFileSync(process.execPath, [genDst], { stdio: "inherit" });
} catch (err) {
  console.error("Generator failed:", err.message);
  process.exit(1);
}

// ── 2. Build id → solution map from scratch output ────────────────────────────
const scratchBankPath = join(scratchBackend, "questions.json");
const scratchBank = JSON.parse(readFileSync(scratchBankPath, "utf-8"));

const solutionMap = new Map();
let scratchPhysicsTotal = 0;
let scratchWithSolution = 0;

for (const q of scratchBank) {
  if (q.subject !== "physics") continue;
  scratchPhysicsTotal++;
  if (q.solution != null) {
    solutionMap.set(q.id, q.solution);
    scratchWithSolution++;
  }
}

console.log(`\nScratch bank: ${scratchBank.length} questions total`);
console.log(`  Physics: ${scratchPhysicsTotal}, with solution: ${scratchWithSolution}`);
console.log(`  Solution map size: ${solutionMap.size}`);

// ── 3. Patch the live bank ─────────────────────────────────────────────────────
const liveBankPath = join(projectRoot, "backend", "questions.json");
const liveBank = JSON.parse(readFileSync(liveBankPath, "utf-8"));

const before = {
  total: liveBank.length,
  physics: liveBank.filter(q => q.subject === "physics").length,
  maths:   liveBank.filter(q => q.subject === "maths").length,
  chemistry: liveBank.filter(q => q.subject === "chemistry").length,
  biology:  liveBank.filter(q => q.subject === "biology").length,
};

let patched = 0;
let alreadyHad = 0;
let notFound = 0;

for (const q of liveBank) {
  if (q.subject !== "physics") continue;
  if (q.solution != null) { alreadyHad++; continue; }

  const sol = solutionMap.get(q.id);
  if (sol != null) {
    q.solution = sol;
    patched++;
  } else {
    notFound++;
  }
}

// ── 4. Verify integrity ────────────────────────────────────────────────────────
const after = {
  total: liveBank.length,
  physics: liveBank.filter(q => q.subject === "physics").length,
  maths:   liveBank.filter(q => q.subject === "maths").length,
  chemistry: liveBank.filter(q => q.subject === "chemistry").length,
  biology:  liveBank.filter(q => q.subject === "biology").length,
  withSolution: liveBank.filter(q => q.subject === "physics" && q.solution != null).length,
};

console.log("\n── Integrity check ────────────────────────────────────────────────");
let ok = true;
const check = (label, got, expected) => {
  const pass = got === expected;
  if (!pass) ok = false;
  console.log(`  ${pass ? "✓" : "✗"} ${label}: ${got} (expected ${expected})`);
};
check("Total questions", after.total, before.total);
check("Physics count", after.physics, before.physics);
check("Maths count", after.maths, before.maths);
check("Chemistry count", after.chemistry, before.chemistry);
check("Biology count", after.biology, before.biology);

if (!ok) {
  console.error("\n✗ Integrity check FAILED — aborting, live bank NOT written.");
  process.exit(1);
}

// ── 5. Write the patched bank ──────────────────────────────────────────────────
writeFileSync(liveBankPath, JSON.stringify(liveBank));
console.log(`\n✓ Wrote patched bank to ${liveBankPath}`);
console.log(`  Physics questions now with solution: ${after.withSolution}`);
console.log(`  Newly patched: ${patched}`);
console.log(`  Already had solution: ${alreadyHad}`);
console.log(`  Physics without solution (no template match): ${notFound}`);

// ── 6. Clean up scratch ────────────────────────────────────────────────────────
rmSync(scratchRoot, { recursive: true, force: true });
console.log("\n✓ Scratch directory cleaned up.");
console.log("\nDone. Next step: run integrity check script, npx vitest run, npm run build.");
