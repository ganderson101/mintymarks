// Deeper arithmetic spot-check for MIN-69
// Parses formula steps in solution strings and verifies the arithmetic
import { QUESTIONS } from './src/data/questions.js';

const TARGET_CATEGORIES = ['Energy', 'Waves', 'Electricity', 'Matter', 'Space'];

const physicsWithSolutions = QUESTIONS.filter(q =>
  q.subject === 'physics' &&
  q.solution &&
  TARGET_CATEGORIES.some(cat => q.category && q.category.toLowerCase().includes(cat.toLowerCase()))
);

// Show samples from each group
const groups = {};
for (const q of physicsWithSolutions) {
  const key = `${q.level}|${q.category}`;
  if (!groups[key]) groups[key] = [];
  groups[key].push(q);
}

// Print 3 full examples per group for manual review
console.log('\n=== SAMPLE QUESTIONS FOR MANUAL REVIEW ===\n');
for (const [key, qs] of Object.entries(groups)) {
  console.log(`\n--- ${key} (${qs.length} total) ---`);
  const sample = qs.slice(0, 3);
  for (const q of sample) {
    console.log(`ID: ${q.id}`);
    console.log(`Q:  ${q.text}`);
    console.log(`Sol: ${q.solution}`);
    console.log(`Opts: ${JSON.stringify(q.options)} correct=${q.correct}`);
    console.log();
  }
}

// Arithmetic spot-check: parse "X = Y = Z" chains in solution
// e.g. "P = E/t = 600/30 = 20 W. So the answer is B (20 W)."
// We'll find expressions like "num op num = result" and verify
function checkArithmetic(sol) {
  // Strip the "So the answer is..." tail
  const body = sol.replace(/\.\s*So the answer is.*$/, '').trim();

  // Find all "a op b = c" patterns where op is / * + -
  const arithPattern = /(-?\d+(?:\.\d+)?(?:e[+-]?\d+)?)\s*([×÷\*\/])\s*(-?\d+(?:\.\d+)?(?:e[+-]?\d+)?)\s*=\s*(-?\d+(?:\.\d+)?(?:e[+-]?\d+)?)/g;

  const errors = [];
  let match;
  while ((match = arithPattern.exec(body)) !== null) {
    const a = parseFloat(match[1]);
    const op = match[2];
    const b = parseFloat(match[3]);
    const claimed = parseFloat(match[4]);
    let computed;
    if (op === '/' || op === '÷') computed = a / b;
    else if (op === '*' || op === '×') computed = a * b;
    else if (op === '+') computed = a + b;
    else if (op === '-') computed = a - b;

    if (computed !== undefined) {
      const relErr = Math.abs(computed - claimed) / (Math.abs(claimed) || 1);
      if (relErr > 0.02) { // 2% tolerance for rounding
        errors.push(`${a} ${op} ${b} = ${claimed} (computed: ${computed.toFixed(4)})`);
      }
    }
  }
  return errors;
}

// Check a random sample of 30 per group
const SAMPLE_SIZE = 30;
const arithFailures = [];
let totalChecked = 0;
let totalExpressions = 0;
let errorExpressions = 0;

for (const [key, qs] of Object.entries(groups)) {
  // Spread sample across the group
  const step = Math.max(1, Math.floor(qs.length / SAMPLE_SIZE));
  const sample = [];
  for (let i = 0; i < qs.length && sample.length < SAMPLE_SIZE; i += step) {
    sample.push(qs[i]);
  }

  for (const q of sample) {
    totalChecked++;
    const errors = checkArithmetic(q.solution);
    // Count expressions
    const body = q.solution.replace(/\.\s*So the answer is.*$/, '');
    const matches = [...body.matchAll(/(-?\d+(?:\.\d+)?)\s*([×÷\*\/])\s*(-?\d+(?:\.\d+)?)\s*=/g)];
    totalExpressions += matches.length;

    if (errors.length > 0) {
      errorExpressions += errors.length;
      arithFailures.push({ id: q.id, level: q.level, category: q.category, errors, solution: q.solution });
    }
  }
}

console.log('\n=== ARITHMETIC SPOT-CHECK RESULTS ===');
console.log(`Questions checked: ${totalChecked}`);
console.log(`Arithmetic expressions found: ${totalExpressions}`);
console.log(`Expression errors (>2% tolerance): ${errorExpressions}`);

if (arithFailures.length > 0) {
  console.log('\n=== ARITHMETIC FAILURES ===');
  for (const f of arithFailures) {
    console.log(`\nID: ${f.id} [${f.level}/${f.category}]`);
    console.log(`  Errors: ${f.errors.join('; ')}`);
    console.log(`  Solution: ${f.solution}`);
  }
} else {
  console.log('\nAll arithmetic expressions PASS within 2% tolerance.');
}

// Also check: does the final result match the answer option?
// Already done in verify_physics_solutions.mjs, but double-check here
console.log('\n=== FINAL VALUE CONSISTENCY (sampled) ===');
let valPass = 0, valFail = 0;
for (const [key, qs] of Object.entries(groups)) {
  const step = Math.max(1, Math.floor(qs.length / SAMPLE_SIZE));
  const sample = [];
  for (let i = 0; i < qs.length && sample.length < SAMPLE_SIZE; i += step) sample.push(qs[i]);

  for (const q of sample) {
    const answerMatch = q.solution.match(/So the answer is ([A-D])\s*\(([^)]+)\)/i);
    if (!answerMatch) { valFail++; continue; }
    const key2 = answerMatch[1];
    if (key2 !== q.correct) { valFail++; continue; }
    const optVal = q.options[key2];
    const solVal = answerMatch[2].trim();
    const norm = s => s.replace(/\s+/g, ' ').trim();
    if (norm(optVal) === norm(solVal)) valPass++;
    else {
      // numeric check
      const n1 = parseFloat(solVal), n2 = parseFloat(optVal);
      if (!isNaN(n1) && !isNaN(n2) && Math.abs(n1-n2)/Math.max(Math.abs(n2),1) < 0.001) valPass++;
      else valFail++;
    }
  }
}
console.log(`Pass: ${valPass}, Fail: ${valFail}`);
