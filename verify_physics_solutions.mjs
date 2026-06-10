// QA verification script for MIN-69
// Verifies physics Energy/Waves/Electricity/Matter&Space solutions
import { QUESTIONS } from './src/data/questions.js';

const TARGET_CATEGORIES = [
  // KS3
  'Energy', 'Waves', 'Electricity', 'Matter',
  // GCSE
  'Space',
  // A-level (same names)
];

// Filter physics questions with solutions, in the target categories
const physicsWithSolutions = QUESTIONS.filter(q =>
  q.subject === 'physics' &&
  q.solution &&
  TARGET_CATEGORIES.some(cat => q.category && q.category.toLowerCase().includes(cat.toLowerCase()))
);

console.log(`\nTotal physics questions with solutions in target categories: ${physicsWithSolutions.length}`);

// Group by level+category
const groups = {};
for (const q of physicsWithSolutions) {
  const key = `${q.level}|${q.category}`;
  if (!groups[key]) groups[key] = [];
  groups[key].push(q);
}

console.log('\nGroups found:');
for (const [key, qs] of Object.entries(groups)) {
  console.log(`  ${key}: ${qs.length} questions`);
}

// Sample up to 5 per group for detailed display, then verify
const SAMPLE_PER_GROUP = 5;
const failures = [];
const passes = [];
let totalSampled = 0;

// Parse solution string: "Formula = numbers = result. So the answer is KEY (value)."
function parseAndVerify(q) {
  const sol = q.solution;
  if (!sol) return { pass: false, reason: 'No solution field' };

  // Extract "So the answer is KEY (value)"
  const answerMatch = sol.match(/So the answer is ([A-D])\s*\(([^)]+)\)/i);
  if (!answerMatch) return { pass: false, reason: `Cannot parse answer from: "${sol}"` };

  const claimedKey = answerMatch[1];
  const claimedValue = answerMatch[2].trim();

  // Check that the claimed key matches q.correct
  if (claimedKey !== q.correct) {
    return {
      pass: false,
      reason: `Answer key mismatch: solution says ${claimedKey} but correct=${q.correct}`
    };
  }

  // Check that the claimed value matches the option for that key
  const optionValue = q.options[claimedKey];
  if (!optionValue) return { pass: false, reason: `Option ${claimedKey} not found in options` };

  // Normalize for comparison (strip trailing spaces/units for numeric comparison)
  const normalizeNum = (s) => {
    // Try to extract numeric value
    const m = s.match(/^(-?\d+(?:\.\d+)?(?:e[+-]?\d+)?)/i);
    return m ? parseFloat(m[1]) : null;
  };

  const solNum = normalizeNum(claimedValue);
  const optNum = normalizeNum(optionValue);

  if (solNum !== null && optNum !== null) {
    const relErr = Math.abs(solNum - optNum) / (Math.abs(optNum) || 1);
    if (relErr > 0.001) {
      return {
        pass: false,
        reason: `Value mismatch: solution says ${claimedValue} but option ${claimedKey}="${optionValue}"`
      };
    }
  } else {
    // String comparison (strip trailing whitespace)
    if (claimedValue.replace(/\s+/g, ' ').trim() !== optionValue.replace(/\s+/g, ' ').trim()) {
      return {
        pass: false,
        reason: `Value mismatch: solution says "${claimedValue}" but option ${claimedKey}="${optionValue}"`
      };
    }
  }

  return { pass: true };
}

// For each group, sample and verify
for (const [key, qs] of Object.entries(groups)) {
  const sample = qs.slice(0, SAMPLE_PER_GROUP);
  totalSampled += sample.length;

  for (const q of sample) {
    const result = parseAndVerify(q);
    if (result.pass) {
      passes.push(q.id);
    } else {
      failures.push({ id: q.id, category: q.category, level: q.level, reason: result.reason, solution: q.solution, options: q.options, correct: q.correct });
    }
  }
}

console.log(`\n=== VERIFICATION SUMMARY ===`);
console.log(`Total sampled: ${totalSampled}`);
console.log(`Pass: ${passes.length}`);
console.log(`Fail: ${failures.length}`);

if (failures.length > 0) {
  console.log(`\n=== FAILURES ===`);
  for (const f of failures) {
    console.log(`\nID: ${f.id}`);
    console.log(`  Level/Category: ${f.level} / ${f.category}`);
    console.log(`  Reason: ${f.reason}`);
    console.log(`  Solution: ${f.solution}`);
    console.log(`  Options: ${JSON.stringify(f.options)}`);
    console.log(`  Correct: ${f.correct}`);
  }
} else {
  console.log(`\nAll sampled questions PASS.`);
}

// Now do a deeper arithmetic spot-check for a wider sample
// We'll do all questions (up to 200 per group) and just check key/value consistency
console.log(`\n=== FULL CONSISTENCY CHECK (key+value match for all questions) ===`);
let fullPass = 0, fullFail = 0;
const fullFailures = [];

for (const q of physicsWithSolutions) {
  const result = parseAndVerify(q);
  if (result.pass) {
    fullPass++;
  } else {
    fullFail++;
    fullFailures.push({ id: q.id, category: q.category, level: q.level, reason: result.reason });
  }
}

console.log(`Total checked: ${physicsWithSolutions.length}`);
console.log(`Pass: ${fullPass}`);
console.log(`Fail: ${fullFail}`);

if (fullFailures.length > 0) {
  console.log(`\n=== ALL FAILURES ===`);
  for (const f of fullFailures.slice(0, 50)) {
    console.log(`  ${f.id} [${f.level}/${f.category}]: ${f.reason}`);
  }
  if (fullFailures.length > 50) {
    console.log(`  ... and ${fullFailures.length - 50} more`);
  }
}
