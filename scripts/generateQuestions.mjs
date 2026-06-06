// ============================================================================
// MintyMarks — Question Bank Generator  (build-time, Node ESM)
// ----------------------------------------------------------------------------
// WHY THIS EXISTS
//   Hand-authoring tens of thousands of questions is infeasible and
//   unmaintainable. Maths is highly parameterisable, so we define a small set
//   of templates per (level, category) and expand them into a large static
//   bank. The RUNTIME stays 100% data-driven (CLAUDE.md): this script is the
//   only place "logic" about question content lives, and it runs at build time.
//
// OUTPUT
//   ../src/data/questions.js  ->  export const QUESTIONS = [ ...plain objects ]
//   Each row matches the existing schema exactly:
//     { id, level, category, text, options:{A,B,C,D}, correct, difficulty }
//   We additionally tag `subject` ("maths") for future multi-subject support;
//   the engines ignore unknown fields, so this is backwards-compatible.
//
// DETERMINISM
//   A seeded RNG (mulberry32) makes output reproducible: same seed => identical
//   bank => clean diffs and stable tests. Bump SEED or COUNT scale to refresh.
//
// SCALING
//   Tune SCALE (global multiplier) or a template's `count` to grow/shrink the
//   bank. Generation dedupes by question text, so constrained templates (e.g.
//   times tables) self-cap; wide-range templates (multi-digit arithmetic) give
//   effectively unlimited unique questions.
//
//   Run:  node scripts/generateQuestions.mjs
// ============================================================================

import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT     = join(__dirname, "..", "src", "data", "questions.js");
const OUT_JSON = join(__dirname, "..", "backend", "questions.json");

const SEED = 20260524;          // change to reshuffle the whole bank
const SCALE = 1;                // global multiplier on every template count

// ── Seeded RNG (mulberry32) ────────────────────────────────────────────────
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rng = mulberry32(SEED);

const randInt = (lo, hi) => lo + Math.floor(rng() * (hi - lo + 1));
const pick = (arr) => arr[Math.floor(rng() * arr.length)];
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Option builder ──────────────────────────────────────────────────────────
function* padCandidates(correctStr) {
  const asNum = Number(correctStr);
  if (correctStr.trim() !== "" && Number.isFinite(asNum)) {
    for (const o of [1, -1, 2, -2, 3, -3, 4, -4, 5, -5, 10, -10]) yield String(asNum + o);
    return;
  }
  const fr = correctStr.match(/^(-?\d+)\/(\d+)$/);
  if (fr) {
    const n = +fr[1], d = +fr[2];
    for (const [a, b] of [[n + 1, d], [n - 1, d], [n, d + 1], [n, d - 1], [n + 1, d + 1], [n + 2, d], [n, d + 2]]) {
      if (b !== 0) yield `${a}/${b}`;
    }
    return;
  }
  const runs = correctStr.match(/-?\d+/g);
  if (runs && runs.length === 1) {
    for (const o of [1, -1, 2, -2, 3, -3, 4, -4, 5, -5]) {
      yield correctStr.replace(/-?\d+/, String(+runs[0] + o));
    }
    return;
  }
  if (runs && runs.length > 1) {
    const last = runs[runs.length - 1];
    const idx = correctStr.lastIndexOf(last);
    for (const o of [1, -1, 2, -2, 3, -3]) {
      yield correctStr.slice(0, idx) + String(+last + o) + correctStr.slice(idx + last.length);
    }
  }
}

function buildOptions(correct, distractorPool, { positive = false } = {}) {
  const correctStr = String(correct);
  const seen = new Set([correctStr]);
  const distractors = [];
  const consider = (raw) => {
    if (raw === null || raw === undefined) return;
    const s = String(raw);
    if (seen.has(s)) return;
    if (positive) { const n = Number(s); if (Number.isFinite(n) && n < 0) return; }
    seen.add(s);
    distractors.push(s);
  };
  for (const d of distractorPool) { consider(d); if (distractors.length === 3) break; }
  if (distractors.length < 3) {
    for (const cand of padCandidates(correctStr)) { consider(cand); if (distractors.length === 3) break; }
  }
  if (distractors.length < 3) {
    throw new Error(`buildOptions: could not build 3 distinct distractors for "${correctStr}"`);
  }
  const all = shuffle([correctStr, ...distractors]);
  const keys = ["A", "B", "C", "D"];
  const options = {};
  let correctKey = "A";
  all.forEach((v, i) => {
    options[keys[i]] = v;
    if (v === correctStr) correctKey = keys[i];
  });
  return { options, correct: correctKey };
}

// Generic numeric misconception distractors around a value.
function numDistractors(correct, { positive = false, offsets = [1, -1, 2, -2, 3, -3, 10, -10, 5, -5] } = {}) {
  return shuffle(offsets.map((o) => correct + o)).filter((v) => !positive || v >= 0);
}

// Helpers used by several templates
const gcd = (a, b) => (b === 0 ? Math.abs(a) : gcd(b, a % b));
const isPrime = (n) => {
  if (n < 2) return false;
  for (let i = 2; i * i <= n; i++) if (n % i === 0) return false;
  return true;
};
const lcm = (a, b) => Math.abs(a * b) / gcd(a, b);
function factorisePair(a, b) {
  // returns "(x + a)(x + b)" with correct signs
  const f = (n) => (n < 0 ? `(x - ${-n})` : `(x + ${n})`);
  return `${f(a)}${f(b)}`;
}

// ============================================================================
// TEMPLATE REGISTRY
// Each template: { id, level, category, difficulty, count, gen() }
// gen() -> { text, correct, distractors[], opts? }  (opts.positive for counts)
// `subject` is "maths" for all current templates.
// ============================================================================
const T = [];
const add = (t) => T.push(t);

const KS2 = "ks2", KS3 = "ks3", GCSE = "gcse";

// ─────────────────────────────────────────────────────────────────────────
// KS2  (Years 3–6, National Curriculum)
// ─────────────────────────────────────────────────────────────────────────
const KS2_NPV = "Number & place value";
const KS2_AS = "Addition & subtraction";
const KS2_MD = "Multiplication & division";
const KS2_FDP = "Fractions, decimals & percentages";
const KS2_MEAS = "Measurement";
const KS2_GEO = "Geometry – shapes";
const KS2_POS = "Geometry – position & direction";
const KS2_STAT = "Statistics";
const KS2_RP = "Ratio & proportion";
const KS2_ALG = "Algebra";

// Number & place value
add({ id: "ks2_npv_round", level: KS2, category: KS2_NPV, difficulty: 1, count: 250, gen() {
  const n = randInt(11, 9999);
  const to = pick([10, 100, 1000]);
  const r = Math.round(n / to) * to;
  return { text: `Round ${n} to the nearest ${to}.`, correct: r, distractors: [r + to, r - to, Math.floor(n / to) * to + (r === Math.floor(n / to) * to ? to : 0)], opts: { positive: true } };
}});
add({ id: "ks2_npv_place", level: KS2, category: KS2_NPV, difficulty: 1, count: 200, gen() {
  const digits = randInt(3, 4);
  const n = randInt(digits === 3 ? 100 : 1000, digits === 3 ? 999 : 9999);
  const s = String(n);
  const idx = randInt(0, s.length - 1);
  const place = Math.pow(10, s.length - 1 - idx);
  const names = { 1: "ones", 10: "tens", 100: "hundreds", 1000: "thousands" };
  const val = Number(s[idx]) * place;
  return { text: `In the number ${n}, what is the value of the digit ${s[idx]} (in the ${names[place]} place)?`, correct: val, distractors: [Number(s[idx]), val * 10, val / 10].filter((x) => Number.isFinite(x) && x !== val), opts: { positive: true } };
}});
add({ id: "ks2_npv_neg", level: KS2, category: KS2_NPV, difficulty: 2, count: 150, gen() {
  const a = randInt(-20, -1);
  const b = randInt(1, 15);
  return { text: `What is ${a} + ${b}?`, correct: a + b, distractors: [a - b, b - a, a + b + 1] };
}});
add({ id: "ks2_npv_order", level: KS2, category: KS2_NPV, difficulty: 1, count: 120, gen() {
  const nums = Array.from({ length: 4 }, () => randInt(100, 9999));
  const max = Math.max(...nums);
  return { text: `Which is the largest number: ${nums.join(", ")}?`, correct: max, distractors: nums.filter((n) => n !== max) };
}});

// Addition & subtraction
add({ id: "ks2_as_add", level: KS2, category: KS2_AS, difficulty: 1, count: 400, gen() {
  const a = randInt(100, 9999), b = randInt(100, 9999);
  return { text: `What is ${a} + ${b}?`, correct: a + b, distractors: [a + b + 10, a + b - 10, a + b + 100], opts: { positive: true } };
}});
add({ id: "ks2_as_sub", level: KS2, category: KS2_AS, difficulty: 1, count: 400, gen() {
  const a = randInt(200, 9999), b = randInt(100, a - 1);
  return { text: `What is ${a} − ${b}?`, correct: a - b, distractors: [a - b + 10, a - b - 10, a - b + 1], opts: { positive: true } };
}});
add({ id: "ks2_as_missing", level: KS2, category: KS2_AS, difficulty: 2, count: 200, gen() {
  const a = randInt(50, 900), res = a + randInt(20, 500);
  return { text: `${a} + ? = ${res}. What is the missing number?`, correct: res - a, distractors: [res + a, res - a + 10, res - a - 10], opts: { positive: true } };
}});

// Multiplication & division
add({ id: "ks2_md_tables", level: KS2, category: KS2_MD, difficulty: 1, count: 144, gen() {
  const a = randInt(2, 12), b = randInt(2, 12);
  return { text: `What is ${a} × ${b}?`, correct: a * b, distractors: [a * b + a, a * b - b, a * b + 1], opts: { positive: true } };
}});
add({ id: "ks2_md_short", level: KS2, category: KS2_MD, difficulty: 2, count: 250, gen() {
  const a = randInt(12, 99), b = randInt(2, 9);
  return { text: `What is ${a} × ${b}?`, correct: a * b, distractors: [a * b + b, a * b - a, a * b + 10], opts: { positive: true } };
}});
add({ id: "ks2_md_div", level: KS2, category: KS2_MD, difficulty: 1, count: 200, gen() {
  const b = randInt(2, 12), q = randInt(2, 12), a = b * q;
  return { text: `What is ${a} ÷ ${b}?`, correct: q, distractors: [q + 1, q - 1, q + 2], opts: { positive: true } };
}});
add({ id: "ks2_md_rem", level: KS2, category: KS2_MD, difficulty: 2, count: 200, gen() {
  const b = randInt(3, 9), q = randInt(3, 12), r = randInt(1, b - 1), a = b * q + r;
  return { text: `What is ${a} ÷ ${b}? Give the remainder.`, correct: r, distractors: [r + 1, r - 1, b - r].filter((x) => x >= 0), opts: { positive: true } };
}});
add({ id: "ks2_md_factor", level: KS2, category: KS2_MD, difficulty: 2, count: 120, gen() {
  const n = randInt(12, 60);
  let f = 2; while (n % f !== 0 && f < n) f++;
  const notFactor = (() => { let x = randInt(2, 11); while (n % x === 0) x = randInt(2, 11); return x; })();
  return { text: `Which of these is a factor of ${n}?`, correct: f, distractors: [notFactor, notFactor + 1, n + 1] };
}});

// Fractions, decimals & percentages
add({ id: "ks2_fdp_frac_of", level: KS2, category: KS2_FDP, difficulty: 2, count: 200, gen() {
  const den = pick([2, 3, 4, 5, 10]); const num = randInt(1, den - 1);
  const whole = den * randInt(2, 12);
  const ans = (whole / den) * num;
  return { text: `What is ${num}/${den} of ${whole}?`, correct: ans, distractors: [whole / den, ans + num, whole - ans], opts: { positive: true } };
}});
add({ id: "ks2_fdp_equiv", level: KS2, category: KS2_FDP, difficulty: 2, count: 120, gen() {
  const num = randInt(1, 4), den = randInt(num + 1, 6), k = randInt(2, 5);
  return { text: `Which fraction is equivalent to ${num}/${den}?`, correct: `${num * k}/${den * k}`, distractors: [`${num + k}/${den + k}`, `${num * k}/${den}`, `${num}/${den * k}`] };
}});
add({ id: "ks2_fdp_dec", level: KS2, category: KS2_FDP, difficulty: 1, count: 120, gen() {
  const map = [["1/2", "0.5"], ["1/4", "0.25"], ["3/4", "0.75"], ["1/10", "0.1"], ["1/5", "0.2"], ["3/10", "0.3"], ["1/100", "0.01"]];
  const [f, d] = pick(map);
  return { text: `Write ${f} as a decimal.`, correct: d, distractors: map.filter(([, x]) => x !== d).slice(0, 3).map(([, x]) => x) };
}});
add({ id: "ks2_fdp_pct", level: KS2, category: KS2_FDP, difficulty: 2, count: 150, gen() {
  const pct = pick([10, 20, 25, 50]); const whole = pick([20, 40, 50, 60, 80, 100, 200]);
  const ans = (pct / 100) * whole;
  return { text: `What is ${pct}% of ${whole}?`, correct: ans, distractors: [ans + 5, ans - 5, whole - ans], opts: { positive: true } };
}});
add({ id: "ks2_fdp_addsame", level: KS2, category: KS2_FDP, difficulty: 2, count: 100, gen() {
  const den = randInt(5, 12), a = randInt(1, den - 2), b = randInt(1, den - a - 1);
  return { text: `What is ${a}/${den} + ${b}/${den}?`, correct: `${a + b}/${den}`, distractors: [`${a + b}/${den + den}`, `${a + b}/${den - 1}`, `${a * b}/${den}`] };
}});

// Measurement
add({ id: "ks2_meas_len", level: KS2, category: KS2_MEAS, difficulty: 1, count: 150, gen() {
  const cm = randInt(2, 500);
  return { text: `How many millimetres (mm) are in ${cm} cm?`, correct: cm * 10, distractors: [cm, cm * 100, cm + 10], opts: { positive: true } };
}});
add({ id: "ks2_meas_mass", level: KS2, category: KS2_MEAS, difficulty: 1, count: 120, gen() {
  const kg = randInt(1, 20);
  return { text: `How many grams (g) are in ${kg} kg?`, correct: kg * 1000, distractors: [kg * 100, kg * 10, kg], opts: { positive: true } };
}});
add({ id: "ks2_meas_area", level: KS2, category: KS2_MEAS, difficulty: 2, count: 150, gen() {
  const w = randInt(2, 20), h = randInt(2, 20);
  return { text: `A rectangle is ${w} cm by ${h} cm. What is its area in cm²?`, correct: w * h, distractors: [2 * (w + h), w + h, w * h + w], opts: { positive: true } };
}});
add({ id: "ks2_meas_perim", level: KS2, category: KS2_MEAS, difficulty: 1, count: 150, gen() {
  const w = randInt(2, 20), h = randInt(2, 20);
  return { text: `A rectangle is ${w} cm by ${h} cm. What is its perimeter in cm?`, correct: 2 * (w + h), distractors: [w * h, w + h, 2 * (w + h) + 2], opts: { positive: true } };
}});
add({ id: "ks2_meas_time", level: KS2, category: KS2_MEAS, difficulty: 2, count: 120, gen() {
  const h = randInt(1, 5), m = pick([0, 15, 30, 45]);
  const total = h * 60 + m;
  return { text: `How many minutes are there in ${h} hour${h > 1 ? "s" : ""}${m ? ` and ${m} minutes` : ""}?`, correct: total, distractors: [h * 100 + m, total + 10, total - 10], opts: { positive: true } };
}});
add({ id: "ks2_meas_money", level: KS2, category: KS2_MEAS, difficulty: 1, count: 120, gen() {
  const p = randInt(105, 999);
  return { text: `How many pence are in £${(p / 100).toFixed(2)}?`, correct: p, distractors: [p + 10, p - 10, p / 10], opts: { positive: true } };
}});

// Geometry – shapes
add({ id: "ks2_geo_sides", level: KS2, category: KS2_GEO, difficulty: 1, count: 60, gen() {
  const shapes = [["triangle", 3], ["square", 4], ["pentagon", 5], ["hexagon", 6], ["heptagon", 7], ["octagon", 8], ["decagon", 10]];
  const [name, sides] = pick(shapes);
  return { text: `How many sides does a ${name} have?`, correct: sides, distractors: shapes.filter(([, s]) => s !== sides).map(([, s]) => s) };
}});
add({ id: "ks2_geo_3d", level: KS2, category: KS2_GEO, difficulty: 2, count: 40, gen() {
  const solids = [["cube", 6, 12, 8], ["cuboid", 6, 12, 8], ["square-based pyramid", 5, 8, 5], ["triangular prism", 5, 9, 6], ["cylinder", 3, 2, 0], ["cone", 2, 1, 1]];
  const [name, faces, edges, verts] = pick(solids);
  const prop = pick([["faces", faces], ["edges", edges], ["vertices", verts]]);
  return { text: `How many ${prop[0]} does a ${name} have?`, correct: prop[1], distractors: [prop[1] + 1, prop[1] - 1, prop[1] + 2].filter((x) => x >= 0) };
}});
add({ id: "ks2_geo_angle", level: KS2, category: KS2_GEO, difficulty: 2, count: 80, gen() {
  const angles = [["acute", randInt(10, 89)], ["a right angle", 90], ["obtuse", randInt(91, 179)], ["reflex", randInt(181, 350)]];
  const [type, deg] = pick(angles);
  if (type === "a right angle") return { text: `How many degrees are in a right angle?`, correct: 90, distractors: [180, 45, 60] };
  return { text: `An angle of ${deg}° is which type of angle?`, correct: type, distractors: ["acute", "obtuse", "reflex", "right"].filter((x) => x !== type).slice(0, 3) };
}});

// Geometry – position & direction
add({ id: "ks2_pos_coord", level: KS2, category: KS2_POS, difficulty: 2, count: 150, gen() {
  const x = randInt(0, 10), y = randInt(0, 10), dx = randInt(1, 5), dy = randInt(1, 5);
  return { text: `A point at (${x}, ${y}) is translated ${dx} right and ${dy} up. What are its new coordinates?`, correct: `(${x + dx}, ${y + dy})`, distractors: [`(${x - dx}, ${y - dy})`, `(${x + dy}, ${y + dx})`, `(${x + dx}, ${y - dy})`] };
}});
add({ id: "ks2_pos_quad", level: KS2, category: KS2_POS, difficulty: 1, count: 60, gen() {
  const x = randInt(1, 9), y = randInt(1, 9);
  return { text: `In the point (${x}, ${y}), what is the x-coordinate?`, correct: x, distractors: [y, x + y, Math.abs(x - y)] };
}});

// Statistics
add({ id: "ks2_stat_mean", level: KS2, category: KS2_STAT, difficulty: 2, count: 150, gen() {
  const n = randInt(3, 4); const base = randInt(2, 8);
  const vals = Array.from({ length: n }, () => base * randInt(1, 6));
  const sum = vals.reduce((a, b) => a + b, 0);
  if (sum % n !== 0) { vals[0] += n - (sum % n); }
  const sum2 = vals.reduce((a, b) => a + b, 0);
  const mean = sum2 / n;
  return { text: `What is the mean (average) of ${vals.join(", ")}?`, correct: mean, distractors: [mean + 1, mean - 1, sum2], opts: { positive: true } };
}});
add({ id: "ks2_stat_total", level: KS2, category: KS2_STAT, difficulty: 1, count: 120, gen() {
  const vals = Array.from({ length: randInt(3, 5) }, () => randInt(2, 20));
  const sum = vals.reduce((a, b) => a + b, 0);
  return { text: `A pictogram shows these counts: ${vals.join(", ")}. What is the total?`, correct: sum, distractors: [sum + 1, sum - 2, Math.max(...vals)], opts: { positive: true } };
}});
add({ id: "ks2_stat_range", level: KS2, category: KS2_STAT, difficulty: 1, count: 120, gen() {
  const vals = Array.from({ length: randInt(3, 5) }, () => randInt(1, 40));
  const r = Math.max(...vals) - Math.min(...vals);
  return { text: `What is the range of ${vals.join(", ")}?`, correct: r, distractors: [r + 1, r - 1, Math.max(...vals)], opts: { positive: true } };
}});

// Ratio & proportion (Y6)
add({ id: "ks2_rp_simplify", level: KS2, category: KS2_RP, difficulty: 1, count: 120, gen() {
  const g = randInt(2, 6), a = g * randInt(1, 5), b = g * randInt(1, 5);
  const d = gcd(a, b);
  if (a / d === b / d) return this.gen();
  return { text: `Simplify the ratio ${a} : ${b}`, correct: `${a / d} : ${b / d}`, distractors: [`${b / d} : ${a / d}`, `${a} : ${b}`, `${a / d} : ${b / d + 1}`] };
}});
add({ id: "ks2_rp_recipe", level: KS2, category: KS2_RP, difficulty: 2, count: 120, gen() {
  const per = randInt(2, 6), people = randInt(2, 8), target = people * randInt(2, 4);
  const ans = (target / people) * per;
  return { text: `A recipe uses ${per} eggs for ${people} people. How many eggs for ${target} people?`, correct: ans, distractors: [ans + per, ans - per, per * target], opts: { positive: true } };
}});

// Algebra (Y6 — simple)
add({ id: "ks2_alg_seq", level: KS2, category: KS2_ALG, difficulty: 2, count: 150, gen() {
  const start = randInt(1, 9), step = randInt(2, 9);
  const seq = [start, start + step, start + 2 * step, start + 3 * step];
  return { text: `What is the next number in the sequence: ${seq.join(", ")}, ...?`, correct: start + 4 * step, distractors: [start + 4 * step + 1, start + 5 * step, start + 4 * step - step + 1], opts: { positive: true } };
}});
add({ id: "ks2_alg_formula", level: KS2, category: KS2_ALG, difficulty: 2, count: 150, gen() {
  const m = randInt(2, 6), c = randInt(1, 10), x = randInt(2, 9);
  return { text: `If y = ${m}x + ${c}, what is y when x = ${x}?`, correct: m * x + c, distractors: [m * x, m + x + c, m * (x + c)], opts: { positive: true } };
}});

// ─────────────────────────────────────────────────────────────────────────
// KS3  (Years 7–9). Categories MUST match existing data exactly.
// ─────────────────────────────────────────────────────────────────────────
const KS3_NU = "Number", KS3_AL = "Algebra", KS3_RP = "Ratio & proportion",
      KS3_GM = "Geometry & measures", KS3_SP = "Statistics & probability";

// Number
add({ id: "ks3_nu_pct", level: KS3, category: KS3_NU, difficulty: 2, count: 250, gen() {
  const pct = pick([5, 10, 15, 20, 25, 30, 40, 50, 75]); const whole = pick([40, 60, 80, 120, 160, 200, 240, 300, 400, 500]);
  const ans = (pct / 100) * whole;
  return { text: `What is ${pct}% of ${whole}?`, correct: ans, distractors: [ans + pct, ans - pct, whole / pct].filter(Number.isFinite), opts: { positive: true } };
}});
add({ id: "ks3_nu_arith", level: KS3, category: KS3_NU, difficulty: 1, count: 200, gen() {
  const a = randInt(120, 999), b = randInt(120, 999), op = pick(["+", "−"]);
  const ans = op === "+" ? a + b : Math.max(a, b) - Math.min(a, b);
  const txt = op === "+" ? `${a} + ${b}` : `${Math.max(a, b)} − ${Math.min(a, b)}`;
  return { text: `What is ${txt}?`, correct: ans, distractors: [ans + 10, ans - 10, ans + 1], opts: { positive: true } };
}});
add({ id: "ks3_nu_bodmas", level: KS3, category: KS3_NU, difficulty: 2, count: 150, gen() {
  const a = randInt(2, 9), b = randInt(2, 9), c = randInt(2, 9);
  const ans = a + b * c;
  return { text: `Work out: ${a} + ${b} × ${c}`, correct: ans, distractors: [(a + b) * c, a * b + c, ans + 1] };
}});
add({ id: "ks3_nu_power", level: KS3, category: KS3_NU, difficulty: 2, count: 150, gen() {
  const mode = pick(["sq", "cube", "root"]);
  if (mode === "sq") { const n = randInt(2, 30); return { text: `What is ${n}²?`, correct: n * n, distractors: [n * 2, n * n + 1, n * n - 1], opts: { positive: true } }; }
  if (mode === "cube") { const n = randInt(2, 12); return { text: `What is ${n}³?`, correct: n ** 3, distractors: [n * 3, n * n, n ** 3 + 1], opts: { positive: true } }; }
  const n = randInt(2, 20); return { text: `What is the square root of ${n * n}?`, correct: n, distractors: [n + 1, n - 1, n * n / 2], opts: { positive: true } };
}});
add({ id: "ks3_nu_hcflcm", level: KS3, category: KS3_NU, difficulty: 2, count: 150, gen() {
  const a = randInt(4, 40), b = randInt(4, 40);
  const which = pick(["HCF", "LCM"]);
  const ans = which === "HCF" ? gcd(a, b) : lcm(a, b);
  return { text: `Find the ${which} of ${a} and ${b}.`, correct: ans, distractors: which === "HCF" ? [lcm(a, b), gcd(a, b) + 1, a] : [gcd(a, b), a * b, lcm(a, b) + a], opts: { positive: true } };
}});
add({ id: "ks3_nu_prime", level: KS3, category: KS3_NU, difficulty: 1, count: 120, gen() {
  const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97];
  const p = pick(primes);
  const nonPrimes = [];
  while (nonPrimes.length < 3) { const x = randInt(4, 99); if (!isPrime(x) && !nonPrimes.includes(x)) nonPrimes.push(x); }
  return { text: `Which of these is a prime number?`, correct: p, distractors: nonPrimes };
}});

// Algebra
add({ id: "ks3_al_solve1", level: KS3, category: KS3_AL, difficulty: 2, count: 250, gen() {
  const a = randInt(2, 9), x = randInt(2, 12), b = randInt(1, 20);
  const c = a * x + b;
  return { text: `Solve for x: ${a}x + ${b} = ${c}`, correct: x, distractors: [c / a, x + 1, c - b] };
}});
add({ id: "ks3_al_solve_sub", level: KS3, category: KS3_AL, difficulty: 2, count: 200, gen() {
  const a = randInt(2, 9), x = randInt(3, 12), b = randInt(1, 15);
  const c = a * x - b;
  return { text: `Solve for x: ${a}x − ${b} = ${c}`, correct: x, distractors: [x + 1, x - 1, c / a] };
}});
add({ id: "ks3_al_expand", level: KS3, category: KS3_AL, difficulty: 2, count: 150, gen() {
  const a = randInt(2, 9), b = randInt(1, 12);
  return { text: `Expand: ${a}(x + ${b})`, correct: `${a}x + ${a * b}`, distractors: [`${a}x + ${b}`, `${a}x + ${a + b}`, `${a + b}x + ${a * b}`] };
}});
add({ id: "ks3_al_simplify", level: KS3, category: KS3_AL, difficulty: 1, count: 100, gen() {
  const a = randInt(2, 9), b = randInt(2, 9);
  return { text: `Simplify: ${a}x + ${b}x`, correct: `${a + b}x`, distractors: [`${a * b}x`, `${a + b}`, `${a + b}x²`] };
}});
add({ id: "ks3_al_sub", level: KS3, category: KS3_AL, difficulty: 2, count: 150, gen() {
  const m = randInt(2, 6), c = randInt(1, 10), x = randInt(2, 9);
  return { text: `If y = ${m}x + ${c} and x = ${x}, find y.`, correct: m * x + c, distractors: [m * x, m + x + c, m * (x + c)], opts: { positive: true } };
}});
add({ id: "ks3_al_nth", level: KS3, category: KS3_AL, difficulty: 3, count: 120, gen() {
  const d = randInt(2, 6), a = randInt(1, 6);
  const seq = [a + d, a + 2 * d, a + 3 * d, a + 4 * d];
  const c = a; // since term1 = d*1 + (a) where a here is a+... rework: nth = d*n + (first - d)
  const first = a + d; const offset = first - d;
  const sign = offset >= 0 ? `+ ${offset}` : `− ${-offset}`;
  const correct = offset === 0 ? `${d}n` : `${d}n ${sign}`;
  return { text: `Find the nth term of the sequence: ${seq.join(", ")}`, correct, distractors: [`${d + 1}n`, `${d}n + ${offset + 1}`, `${d}n − ${Math.abs(offset) + 1}`] };
}});

// Ratio & proportion
add({ id: "ks3_rp_share2", level: KS3, category: KS3_RP, difficulty: 2, count: 200, gen() {
  const p1 = randInt(1, 4), p2 = randInt(1, 5), parts = p1 + p2;
  const total = parts * randInt(2, 12);
  const small = (total / parts) * Math.min(p1, p2);
  return { text: `Share £${total} in the ratio ${p1} : ${p2}. How much is the smaller share?`, correct: small, distractors: [(total / parts) * Math.max(p1, p2), total / 2, small + parts], opts: { positive: true } };
}});
add({ id: "ks3_rp_simplify", level: KS3, category: KS3_RP, difficulty: 1, count: 100, gen() {
  const g = randInt(2, 8), a = g * randInt(1, 6), b = g * randInt(1, 6);
  const d = gcd(a, b);
  if (a / d === b / d) return this.gen();
  return { text: `Simplify the ratio ${a} : ${b}`, correct: `${a / d} : ${b / d}`, distractors: [`${b / d} : ${a / d}`, `${a} : ${b}`, `${a / d} : ${b / d + 1}`] };
}});
add({ id: "ks3_rp_unitary", level: KS3, category: KS3_RP, difficulty: 2, count: 150, gen() {
  const n = randInt(2, 6), cost = n * randInt(2, 9), m = randInt(2, 9);
  const unit = cost / n;
  return { text: `${n} pens cost £${cost}. How much do ${m} pens cost?`, correct: unit * m, distractors: [unit * m + 1, unit * (m + 1), cost + m], opts: { positive: true } };
}});
add({ id: "ks3_rp_direct", level: KS3, category: KS3_RP, difficulty: 3, count: 120, gen() {
  const k = randInt(2, 6), x1 = randInt(2, 5), y1 = k * x1, x2 = randInt(2, 9);
  return { text: `y is directly proportional to x. When x = ${x1}, y = ${y1}. Find y when x = ${x2}.`, correct: k * x2, distractors: [k * x2 + k, y1 + x2, k * x2 - 1], opts: { positive: true } };
}});

// Geometry & measures
add({ id: "ks3_gm_rectarea", level: KS3, category: KS3_GM, difficulty: 1, count: 120, gen() {
  const w = randInt(3, 25), h = randInt(3, 25);
  return { text: `A rectangle is ${w} cm by ${h} cm. What is its area in cm²?`, correct: w * h, distractors: [2 * (w + h), w + h, w * h + w], opts: { positive: true } };
}});
add({ id: "ks3_gm_triarea", level: KS3, category: KS3_GM, difficulty: 2, count: 120, gen() {
  let b = randInt(2, 20), h = randInt(2, 20);
  if ((b * h) % 2 !== 0) b += 1;
  return { text: `A triangle has base ${b} cm and height ${h} cm. What is its area in cm²?`, correct: (b * h) / 2, distractors: [b * h, (b * h) / 2 + 1, b + h], opts: { positive: true } };
}});
add({ id: "ks3_gm_straight", level: KS3, category: KS3_GM, difficulty: 2, count: 100, gen() {
  const a = randInt(20, 160);
  return { text: `Two angles lie on a straight line. One is ${a}°. What is the other?`, correct: 180 - a, distractors: [360 - a, 90 - a, 180 - a + 1].filter((x) => x > 0), opts: { positive: true } };
}});
add({ id: "ks3_gm_tri", level: KS3, category: KS3_GM, difficulty: 2, count: 120, gen() {
  const a = randInt(30, 90), b = randInt(20, 180 - a - 10);
  return { text: `A triangle has angles ${a}° and ${b}°. What is the third angle?`, correct: 180 - a - b, distractors: [180 - a, a + b, 180 - a - b + 1], opts: { positive: true } };
}});
add({ id: "ks3_gm_vol", level: KS3, category: KS3_GM, difficulty: 2, count: 120, gen() {
  const a = randInt(2, 8), b = randInt(2, 8), c = randInt(2, 8);
  return { text: `A cuboid is ${a} × ${b} × ${c} cm. What is its volume in cm³?`, correct: a * b * c, distractors: [a + b + c, 2 * (a * b + b * c + a * c), a * b * c + 1], opts: { positive: true } };
}});

// Statistics & probability
add({ id: "ks3_sp_mean", level: KS3, category: KS3_SP, difficulty: 2, count: 150, gen() {
  const n = randInt(3, 5), base = randInt(2, 6);
  const vals = Array.from({ length: n }, () => base * randInt(1, 7));
  let sum = vals.reduce((a, b) => a + b, 0);
  vals[0] += (n - (sum % n)) % n; sum = vals.reduce((a, b) => a + b, 0);
  return { text: `What is the mean of ${vals.join(", ")}?`, correct: sum / n, distractors: [sum / n + 1, sum / n - 1, sum], opts: { positive: true } };
}});
add({ id: "ks3_sp_range", level: KS3, category: KS3_SP, difficulty: 1, count: 100, gen() {
  const vals = Array.from({ length: randInt(3, 5) }, () => randInt(1, 30));
  const r = Math.max(...vals) - Math.min(...vals);
  return { text: `What is the range of ${vals.join(", ")}?`, correct: r, distractors: [r + 1, r - 1, Math.max(...vals)], opts: { positive: true } };
}});
add({ id: "ks3_sp_mode", level: KS3, category: KS3_SP, difficulty: 1, count: 100, gen() {
  const m = randInt(1, 9);
  const vals = shuffle([m, m, randInt(1, 9), randInt(1, 9)]);
  return { text: `What is the mode of ${vals.join(", ")}?`, correct: m, distractors: [m + 1, m - 1, m + 2].filter((x) => x >= 0) };
}});
add({ id: "ks3_sp_prob", level: KS3, category: KS3_SP, difficulty: 2, count: 120, gen() {
  const r = randInt(1, 5), b = randInt(1, 5), tot = r + b, g = gcd(r, tot);
  return { text: `A bag has ${r} red and ${b} blue counters. What is the probability of picking red?`, correct: `${r / g}/${tot / g}`, distractors: [`${b}/${tot}`, `${r}/${b}`, `${r / g}/${b}`] };
}});

// ─────────────────────────────────────────────────────────────────────────
// GCSE  (Edexcel). Categories MUST match existing data exactly.
// ─────────────────────────────────────────────────────────────────────────
const G_NU = "Number", G_AL = "Algebra",
      G_RP = "Ratio, proportion & rates of change", G_GM = "Geometry & measures",
      G_PR = "Probability", G_ST = "Statistics";

// Number
add({ id: "gcse_nu_stdform", level: GCSE, category: G_NU, difficulty: 2, count: 150, gen() {
  const mant = randInt(11, 99) / 10; const exp = randInt(2, 6);
  const n = mant * Math.pow(10, exp);
  return { text: `Write ${n} in standard form.`, correct: `${mant} × 10^${exp}`, distractors: [`${mant} × 10^${exp + 1}`, `${mant} × 10^${exp - 1}`, `${mant * 10} × 10^${exp - 1}`] };
}});
add({ id: "gcse_nu_hcflcm", level: GCSE, category: G_NU, difficulty: 2, count: 150, gen() {
  const a = randInt(8, 40), b = randInt(8, 40);
  const which = pick(["HCF", "LCM"]);
  const ans = which === "HCF" ? gcd(a, b) : lcm(a, b);
  return { text: `Find the ${which} of ${a} and ${b}.`, correct: ans, distractors: which === "HCF" ? [lcm(a, b), gcd(a, b) + 1, a] : [gcd(a, b), a * b, lcm(a, b) + 1], opts: { positive: true } };
}});
add({ id: "gcse_nu_pctchange", level: GCSE, category: G_NU, difficulty: 2, count: 250, gen() {
  const base = 20 * randInt(1, 25); const pct = pick([5, 10, 15, 20, 25, 30, 40, 50, 75]);
  const dir = pick(["increase", "decrease"]);
  const delta = (pct / 100) * base; // integer because base is a multiple of 20
  const ans = dir === "increase" ? base + delta : base - delta;
  return { text: `${dir === "increase" ? "Increase" : "Decrease"} ${base} by ${pct}%.`, correct: ans, distractors: [dir === "increase" ? base - delta : base + delta, ans + pct, base + pct], opts: { positive: true } };
}});
add({ id: "gcse_nu_indices", level: GCSE, category: G_NU, difficulty: 2, count: 120, gen() {
  const base = randInt(2, 6), p = randInt(1, 4), q = randInt(1, 3);
  return { text: `Simplify: ${base}^${p} × ${base}^${q} (give as a power of ${base}).`, correct: `${base}^${p + q}`, distractors: [`${base}^${p * q}`, `${base * base}^${p + q}`, `${base}^${p + q + 1}`] };
}});
add({ id: "gcse_nu_fracop", level: GCSE, category: G_NU, difficulty: 2, count: 120, gen() {
  const num = randInt(1, 4), den = pick([2, 3, 4, 5, 6]); const whole = den * randInt(3, 15);
  if (num >= den) return this.gen();
  return { text: `What is ${num}/${den} of ${whole}?`, correct: (whole / den) * num, distractors: [whole / den, (whole / den) * num + 1, whole - (whole / den) * num], opts: { positive: true } };
}});

// Algebra
add({ id: "gcse_al_expand2", level: GCSE, category: G_AL, difficulty: 3, count: 200, gen() {
  const a = randInt(1, 9), b = randInt(1, 9);
  return { text: `Expand and simplify: (x + ${a})(x + ${b})`, correct: `x^2 + ${a + b}x + ${a * b}`, distractors: [`x^2 + ${a * b}x + ${a + b}`, `x^2 + ${a + b}x + ${a + b}`, `x^2 + ${a}x + ${b}`] };
}});
add({ id: "gcse_al_factorise", level: GCSE, category: G_AL, difficulty: 3, count: 200, gen() {
  const a = randInt(1, 9), b = randInt(1, 9);
  return { text: `Factorise: x^2 + ${a + b}x + ${a * b}`, correct: factorisePair(a, b), distractors: [factorisePair(-a, -b), factorisePair(a + b, a * b), factorisePair(a, b + 1)] };
}});
add({ id: "gcse_al_quad", level: GCSE, category: G_AL, difficulty: 3, count: 150, gen() {
  const r1 = randInt(1, 8), r2 = randInt(1, 8);
  // x^2 - (r1+r2)x + r1r2 = 0, roots r1,r2
  return { text: `Solve x² − ${r1 + r2}x + ${r1 * r2} = 0. Give the smaller root.`, correct: Math.min(r1, r2), distractors: [Math.max(r1, r2), -Math.min(r1, r2), r1 + r2].filter((x, i, arr) => arr.indexOf(x) === i) };
}});
add({ id: "gcse_al_nth", level: GCSE, category: G_AL, difficulty: 3, count: 150, gen() {
  const d = randInt(2, 7), first = randInt(1, 9);
  const seq = [first, first + d, first + 2 * d, first + 3 * d];
  const offset = first - d;
  const correct = offset === 0 ? `${d}n` : offset > 0 ? `${d}n + ${offset}` : `${d}n − ${-offset}`;
  return { text: `Find the nth term of: ${seq.join(", ")}`, correct, distractors: [`${d + 1}n`, `${d}n + ${offset + 1}`, `${d}n − ${Math.abs(offset) + 1}`] };
}});
add({ id: "gcse_al_simul", level: GCSE, category: G_AL, difficulty: 3, count: 150, gen() {
  const x = randInt(1, 6), y = randInt(1, 6);
  const s = x + y, d = (2 * x) + y;
  return { text: `Solve: x + y = ${s} and 2x + y = ${d}. What is x?`, correct: x, distractors: [y, s - x, d - s + 1] };
}});
add({ id: "gcse_al_rearrange", level: GCSE, category: G_AL, difficulty: 2, count: 100, gen() {
  const x = randInt(2, 9); const a = randInt(2, 6); const b = randInt(1, 10);
  const val = (a * x + b);
  return { text: `Make x the subject and evaluate: ${a}x + ${b} = ${val}. What is x?`, correct: x, distractors: [val / a, x + 1, val - b] };
}});

// Ratio, proportion & rates of change
add({ id: "gcse_rp_share3", level: GCSE, category: G_RP, difficulty: 2, count: 150, gen() {
  const p = [randInt(1, 3), randInt(1, 4), randInt(2, 5)]; const parts = p[0] + p[1] + p[2];
  const total = parts * randInt(3, 12);
  const largest = (total / parts) * Math.max(...p);
  return { text: `Share £${total} in the ratio ${p.join(" : ")}. What is the largest share?`, correct: largest, distractors: [(total / parts) * Math.min(...p), total / 3, largest + parts], opts: { positive: true } };
}});
add({ id: "gcse_rp_speed", level: GCSE, category: G_RP, difficulty: 2, count: 150, gen() {
  const speed = pick([40, 45, 50, 60, 70, 80]); const time = randInt(2, 5);
  const dist = speed * time;
  return { text: `A car travels ${dist} km in ${time} hours. What is its average speed in km/h?`, correct: speed, distractors: [dist, speed + 5, speed - 5], opts: { positive: true } };
}});
add({ id: "gcse_rp_profit", level: GCSE, category: G_RP, difficulty: 3, count: 120, gen() {
  const cost = pick([20, 25, 40, 50, 80, 100]); const pct = pick([10, 20, 25, 50]);
  const sell = cost * (1 + pct / 100);
  return { text: `An item is bought for £${cost} and sold for £${sell}. What is the percentage profit?`, correct: `${pct}%`, distractors: [`${pct + 5}%`, `${pct - 5}%`, `${pct * 2}%`] };
}});
add({ id: "gcse_rp_density", level: GCSE, category: G_RP, difficulty: 3, count: 120, gen() {
  const d = randInt(2, 9), v = randInt(2, 9), m = d * v;
  return { text: `An object has mass ${m} g and volume ${v} cm³. What is its density in g/cm³?`, correct: d, distractors: [m, v, d + 1], opts: { positive: true } };
}});
add({ id: "gcse_rp_inverse", level: GCSE, category: G_RP, difficulty: 3, count: 100, gen() {
  const k = pick([12, 24, 36, 48, 60]); const x1 = pick([2, 3, 4, 6]);
  let x2 = pick([2, 3, 4, 6]); if (x2 === x1) x2 = x1 === 2 ? 3 : 2;
  const y1 = k / x1, y2 = k / x2;
  return { text: `y is inversely proportional to x. When x = ${x1}, y = ${y1}. Find y when x = ${x2}.`, correct: y2, distractors: [y2 + 1, k, y1], opts: { positive: true } };
}});

// Geometry & measures
add({ id: "gcse_gm_pyth", level: GCSE, category: G_GM, difficulty: 3, count: 200, gen() {
  const base = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29], [9, 40, 41], [12, 35, 37], [28, 45, 53]];
  const k = randInt(1, 9);
  let [a, b, c] = pick(base).map((v) => v * k);
  if (rng() < 0.5) {
    return { text: `A right-angled triangle has shorter sides ${a} cm and ${b} cm. Find the hypotenuse in cm.`, correct: c, distractors: [a + b, c + k, c - k], opts: { positive: true } };
  }
  return { text: `A right-angled triangle has hypotenuse ${c} cm and one shorter side ${a} cm. Find the other shorter side in cm.`, correct: b, distractors: [c - a, b + k, b - k], opts: { positive: true } };
}});
add({ id: "gcse_gm_circarea", level: GCSE, category: G_GM, difficulty: 3, count: 120, gen() {
  const r = randInt(2, 30);
  return { text: `Find the area of a circle with radius ${r} cm, in terms of π (cm²).`, correct: `${r * r}π`, distractors: [`${2 * r}π`, `${r}π`, `${r * r * 2}π`] };
}});
add({ id: "gcse_gm_circumf", level: GCSE, category: G_GM, difficulty: 3, count: 120, gen() {
  const r = randInt(2, 30);
  return { text: `Find the circumference of a circle with radius ${r} cm, in terms of π (cm).`, correct: `${2 * r}π`, distractors: [`${r * r}π`, `${r}π`, `${2 * r + 1}π`] };
}});
add({ id: "gcse_gm_cylinder", level: GCSE, category: G_GM, difficulty: 3, count: 150, gen() {
  const r = randInt(1, 12), h = randInt(1, 15);
  return { text: `Find the volume of a cylinder with radius ${r} cm and height ${h} cm, in terms of π (cm³).`, correct: `${r * r * h}π`, distractors: [`${2 * r * h}π`, `${r * h}π`, `${r * r + h}π`] };
}});
add({ id: "gcse_gm_triarea", level: GCSE, category: G_GM, difficulty: 2, count: 150, gen() {
  let b = randInt(3, 30), h = randInt(3, 30);
  if ((b * h) % 2 !== 0) b += 1;
  return { text: `A triangle has base ${b} cm and height ${h} cm. Find its area in cm².`, correct: (b * h) / 2, distractors: [b * h, (b * h) / 2 + 1, b + h], opts: { positive: true } };
}});
add({ id: "gcse_gm_trapezium", level: GCSE, category: G_GM, difficulty: 3, count: 150, gen() {
  let a = randInt(2, 20), b = randInt(2, 20), h = randInt(2, 16);
  if (((a + b) * h) % 2 !== 0) h += 1;
  return { text: `A trapezium has parallel sides ${a} cm and ${b} cm, and height ${h} cm. Find its area in cm².`, correct: ((a + b) * h) / 2, distractors: [(a + b) * h, a * b, ((a + b) * h) / 2 + 1], opts: { positive: true } };
}});
add({ id: "gcse_gm_prism", level: GCSE, category: G_GM, difficulty: 3, count: 150, gen() {
  const csa = randInt(4, 40), len = randInt(2, 15);
  return { text: `A prism has cross-sectional area ${csa} cm² and length ${len} cm. Find its volume in cm³.`, correct: csa * len, distractors: [csa + len, 2 * csa * len, csa * len + len], opts: { positive: true } };
}});
add({ id: "gcse_gm_extangle", level: GCSE, category: G_GM, difficulty: 2, count: 60, gen() {
  const sides = pick([3, 4, 5, 6, 8, 9, 10, 12, 15, 18, 20, 24, 30, 36]);
  const ext = 360 / sides;
  return { text: `A regular polygon has ${sides} sides. What is the size of each exterior angle?`, correct: `${ext}°`, distractors: [`${(sides - 2) * 180 / sides}°`, `${ext + 1}°`, `${360 - ext}°`] };
}});
add({ id: "gcse_gm_surface", level: GCSE, category: G_GM, difficulty: 3, count: 150, gen() {
  const a = randInt(2, 12), b = randInt(2, 12), c = randInt(2, 12);
  const sa = 2 * (a * b + b * c + a * c);
  return { text: `A cuboid measures ${a} × ${b} × ${c} cm. Find its total surface area in cm².`, correct: sa, distractors: [a * b * c, sa / 2, sa + 2], opts: { positive: true } };
}});
add({ id: "gcse_gm_polygon", level: GCSE, category: G_GM, difficulty: 2, count: 80, gen() {
  const sides = randInt(3, 12);
  const sum = (sides - 2) * 180;
  const names = { 3: "triangle", 4: "quadrilateral", 5: "pentagon", 6: "hexagon", 7: "heptagon", 8: "octagon", 9: "nonagon", 10: "decagon", 11: "hendecagon", 12: "dodecagon" };
  return { text: `What is the sum of the interior angles of a ${names[sides]} (${sides} sides)?`, correct: `${sum}°`, distractors: [`${sum + 180}°`, `${sum - 180}°`, `${360}°`] };
}});
add({ id: "gcse_gm_trig", level: GCSE, category: G_GM, difficulty: 3, count: 80, gen() {
  const triples = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17]];
  const [a, b, c] = pick(triples); // a=opp, b=adj, c=hyp
  const ratio = pick(["sin", "cos", "tan"]);
  const ans = ratio === "sin" ? `${a}/${c}` : ratio === "cos" ? `${b}/${c}` : `${a}/${b}`;
  return { text: `In a right-angled triangle, the side opposite angle θ is ${a}, adjacent is ${b}, hypotenuse is ${c}. What is ${ratio}(θ)?`, correct: ans, distractors: [`${b}/${c}`, `${a}/${b}`, `${c}/${a}`].filter((x) => x !== ans).slice(0, 3) };
}});

// Probability
add({ id: "gcse_pr_complement", level: GCSE, category: G_PR, difficulty: 2, count: 150, gen() {
  const p = randInt(1, 99) / 100;
  return { text: `The probability of an event is ${p}. What is the probability it does NOT happen?`, correct: Number((1 - p).toFixed(2)), distractors: [p, Number((1 + p).toFixed(2)), 1] };
}});
add({ id: "gcse_pr_spinner", level: GCSE, category: G_PR, difficulty: 2, count: 150, gen() {
  const n = randInt(4, 12), fav = randInt(1, n - 1), g = gcd(fav, n);
  return { text: `A spinner has ${n} equal sections, ${fav} of them red. What is the probability of landing on red?`, correct: `${fav / g}/${n / g}`, distractors: [`${(n - fav)}/${n}`, `${fav}/${n - fav}`, `${fav + 1}/${n}`] };
}});
add({ id: "gcse_pr_expected", level: GCSE, category: G_PR, difficulty: 3, count: 150, gen() {
  const denom = pick([2, 3, 4, 5, 6, 10]); const trials = denom * randInt(2, 20);
  return { text: `The probability of winning a game is 1/${denom}. If it is played ${trials} times, how many wins are expected?`, correct: trials / denom, distractors: [trials, trials / denom + 1, denom], opts: { positive: true } };
}});
add({ id: "gcse_pr_twodice", level: GCSE, category: G_PR, difficulty: 3, count: 80, gen() {
  // P(sum = s) for two dice
  const s = randInt(2, 12);
  const ways = 6 - Math.abs(7 - s);
  const g = gcd(ways, 36);
  return { text: `Two fair dice are rolled. What is the probability the total is ${s}?`, correct: `${ways / g}/${36 / g}`, distractors: [`${ways}/12`, `1/${s}`, `${ways + 1}/36`] };
}});
add({ id: "gcse_pr_die", level: GCSE, category: G_PR, difficulty: 1, count: 60, gen() {
  const faces = [["an even number", "1/2"], ["an odd number", "1/2"], ["a number greater than 4", "1/3"], ["a multiple of 3", "1/3"], ["a 6", "1/6"], ["a prime number", "1/2"]];
  const [desc, ans] = pick(faces);
  return { text: `A fair six-sided die is rolled. What is the probability of rolling ${desc}?`, correct: ans, distractors: ["1/6", "1/3", "2/3", "5/6"].filter((x) => x !== ans).slice(0, 3) };
}});
add({ id: "gcse_pr_independent", level: GCSE, category: G_PR, difficulty: 3, count: 100, gen() {
  const a = pick([2, 3, 4, 5]), b = pick([2, 3, 4, 5]);
  const num = 1, den = a * b, g = gcd(num, den);
  return { text: `Two independent events have P(A) = 1/${a} and P(B) = 1/${b}. What is P(A and B)?`, correct: `${num / g}/${den / g}`, distractors: [`1/${a + b}`, `${2}/${a + b}`, `1/${Math.max(a, b)}`] };
}});
add({ id: "gcse_pr_bag", level: GCSE, category: G_PR, difficulty: 2, count: 120, gen() {
  const r = randInt(1, 4), gr = randInt(1, 4), bl = randInt(1, 5), tot = r + gr + bl;
  const g = gcd(gr, tot);
  return { text: `A bag has ${r} red, ${gr} green and ${bl} blue counters. What is the probability of green?`, correct: `${gr / g}/${tot / g}`, distractors: [`${r}/${tot}`, `${bl}/${tot}`, `${gr}/${r + bl}`] };
}});

// Statistics
add({ id: "gcse_st_mean", level: GCSE, category: G_ST, difficulty: 2, count: 150, gen() {
  const n = randInt(3, 6), base = randInt(2, 5);
  const vals = Array.from({ length: n }, () => base * randInt(1, 8));
  let sum = vals.reduce((a, b) => a + b, 0);
  vals[0] += (n - (sum % n)) % n; sum = vals.reduce((a, b) => a + b, 0);
  return { text: `Calculate the mean of ${vals.join(", ")}.`, correct: sum / n, distractors: [sum / n + 1, sum / n - 1, sum], opts: { positive: true } };
}});
add({ id: "gcse_st_median", level: GCSE, category: G_ST, difficulty: 2, count: 120, gen() {
  const n = pick([5, 7]);
  const vals = Array.from({ length: n }, () => randInt(1, 30));
  const sorted = [...vals].sort((a, b) => a - b);
  const median = sorted[Math.floor(n / 2)];
  return { text: `Find the median of: ${vals.join(", ")}`, correct: median, distractors: [sorted[0], sorted[n - 1], sorted[Math.floor(n / 2) - 1]], opts: { positive: true } };
}});
add({ id: "gcse_st_iqr", level: GCSE, category: G_ST, difficulty: 3, count: 100, gen() {
  const vals = Array.from({ length: 8 }, () => randInt(2, 40));
  const s = [...vals].sort((a, b) => a - b);
  const q1 = s[1], q3 = s[6], iqr = q3 - q1;
  return { text: `The ordered data set is: ${s.join(", ")}. Find the IQR (Q3 − Q1).`, correct: iqr, distractors: [s[7] - s[0], iqr + 2, q3], opts: { positive: true } };
}});
add({ id: "gcse_st_pie", level: GCSE, category: G_ST, difficulty: 2, count: 80, gen() {
  const total = pick([36, 60, 72, 90, 120, 180, 360]);
  const freq = randInt(1, total / 4);
  const angle = Math.round((freq / total) * 360);
  return { text: `In a pie chart of ${total} people, one sector has ${freq} people. What is the angle of that sector?`, correct: `${angle}°`, distractors: [`${angle + 10}°`, `${angle - 10}°`, `${360 - angle}°`] };
}});

// ─────────────────────────────────────────────────────────────────────────
// A-LEVEL MATHS  (Years 12–13, Edexcel / AQA)
// ─────────────────────────────────────────────────────────────────────────
const ALEVEL = "alevel";
const AL_ALG  = "Algebra & Functions";
const AL_CALC = "Calculus";
const AL_TRIG = "Trigonometry";
const AL_EL   = "Exponentials & Logarithms";
const AL_VEC  = "Vectors";
const AL_STAT = "Statistics";
const AL_MECH = "Mechanics";
const AL_PROOF = "Proof & Binomial";
const AL_COORD = "Coordinate Geometry";

function comb(n, r) {
  if (r < 0 || r > n) return 0;
  if (r === 0 || r === n) return 1;
  let result = 1;
  for (let i = 0; i < r; i++) result = (result * (n - i)) / (i + 1);
  return Math.round(result);
}

// ── Algebra & Functions ───────────────────────────────────────────────────

// Completing the square: x² + bx + c → (x + b/2)² + (c − (b/2)²)
add({ id: "alevel_alg_ctsk", level: ALEVEL, category: AL_ALG, difficulty: 3, count: 150, gen() {
  const b = pick([-10, -8, -6, -4, -2, 2, 4, 6, 8, 10]);
  const c = randInt(-8, 15);
  const h = b / 2;
  const k = c - h * h;
  const bStr = b >= 0 ? `+ ${b}` : `- ${-b}`;
  const cStr = c >= 0 ? `+ ${c}` : `- ${-c}`;
  return { text: `Complete the square: x² ${bStr}x ${cStr} = (x + p)² + q. What is q?`, correct: k, distractors: [k + 1, k - 1, c] };
}});

// Discriminant: b² − 4ac
add({ id: "alevel_alg_disc", level: ALEVEL, category: AL_ALG, difficulty: 3, count: 150, gen() {
  const a = randInt(1, 3), b = pick([-8, -6, -4, -2, 2, 4, 6, 8]), c = randInt(1, 8);
  const disc = b * b - 4 * a * c;
  return { text: `Find the discriminant of ${a}x² ${b >= 0 ? "+" + b : b}x + ${c}.`, correct: disc, distractors: [disc + 4, b * b, 4 * a * c] };
}});

// Partial fractions: (px + q)/((x+a)(x+b)) = A/(x+a) + B/(x+b)
add({ id: "alevel_alg_parfrac", level: ALEVEL, category: AL_ALG, difficulty: 4, count: 120, gen() {
  const A = randInt(1, 6), B = randInt(1, 6), a = randInt(1, 5), b = a + randInt(1, 4);
  // f(x) = (A(x+b) + B(x+a)) / ((x+a)(x+b))
  const p = A + B, q = A * b + B * a;
  return {
    text: `Express (${p}x + ${q}) / ((x + ${a})(x + ${b})) as partial fractions. Find A where the expression = A/(x+${a}) + B/(x+${b}).`,
    correct: A,
    distractors: [B, A + 1, A - 1].filter((x, i, arr) => arr.indexOf(x) === i && x !== A)
  };
}});

// Solve quadratic inequality
add({ id: "alevel_alg_ineq", level: ALEVEL, category: AL_ALG, difficulty: 3, count: 120, gen() {
  const r1 = randInt(-5, 0), r2 = randInt(1, 6);
  // (x - r1)(x - r2) > 0 → x < r1 or x > r2
  return {
    text: `Solve (x − ${r1})(x − ${r2}) > 0. Give the larger boundary.`,
    correct: r2,
    distractors: [r1, r2 + 1, r2 - 1]
  };
}});

// Factor theorem
add({ id: "alevel_alg_factor", level: ALEVEL, category: AL_ALG, difficulty: 3, count: 150, gen() {
  const r = randInt(-4, 4);
  if (r === 0) return this.gen();
  const a = randInt(1, 3), b = randInt(-6, 6), c = -(a * r * r + b * r); // f(r) = 0
  const fr = a * r * r + b * r + c;
  if (fr !== 0) return this.gen();
  const bStr = b >= 0 ? `+ ${b}` : `- ${-b}`;
  const cStr = c >= 0 ? `+ ${c}` : `- ${-c}`;
  return {
    text: `Given f(x) = ${a}x² ${bStr}x ${cStr}, verify that (x − ${r}) is a factor. What is f(${r})?`,
    correct: 0,
    distractors: [1, -1, r]
  };
}});

// ── Coordinate Geometry ───────────────────────────────────────────────────

// Gradient between two points (integer slope for clean answers)
add({ id: "alevel_coord_grad", level: ALEVEL, category: AL_COORD, difficulty: 3, count: 150, gen() {
  const m = randInt(-6, 6); if (m === 0) return this.gen();
  const x1 = randInt(-4, 4), y1 = randInt(-5, 5), dx = randInt(1, 4);
  const x2 = x1 + dx, y2 = y1 + m * dx;
  return { text: `Find the gradient of the line passing through (${x1}, ${y1}) and (${x2}, ${y2}).`, correct: m, distractors: [m + 1, m - 1, -m].filter((x, i, a) => x !== m && a.indexOf(x) === i) };
}});

// y-intercept from two points
add({ id: "alevel_coord_yint", level: ALEVEL, category: AL_COORD, difficulty: 3, count: 120, gen() {
  const m = randInt(-4, 4); if (m === 0) return this.gen();
  const c = randInt(-8, 8);
  const x1 = randInt(1, 5), y1 = m * x1 + c;
  return { text: `A line has gradient ${m} and passes through (${x1}, ${y1}). Find the y-intercept.`, correct: c, distractors: [c + m, y1, c + 1] };
}});

// Midpoint of two points
add({ id: "alevel_coord_mid", level: ALEVEL, category: AL_COORD, difficulty: 2, count: 100, gen() {
  const x1 = randInt(-6, 6), y1 = randInt(-6, 6);
  const x2 = x1 + 2 * randInt(-4, 4); if (x2 === x1) return this.gen();
  const y2 = y1 + 2 * randInt(-4, 4);
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  return { text: `Find the x-coordinate of the midpoint of (${x1}, ${y1}) and (${x2}, ${y2}).`, correct: mx, distractors: [mx + 1, mx - 1, x1] };
}});

// ── Calculus ──────────────────────────────────────────────────────────────

// Differentiation power rule: d/dx(ax^n) = nax^(n-1)
add({ id: "alevel_calc_diffpow", level: ALEVEL, category: AL_CALC, difficulty: 3, count: 200, gen() {
  const a = randInt(1, 8), n = randInt(2, 6);
  const coeff = a * n, power = n - 1;
  const ans = power === 1 ? `${coeff}x` : `${coeff}x^${power}`;
  return {
    text: `Differentiate ${a}x^${n} with respect to x.`,
    correct: ans,
    distractors: [power === 1 ? `${coeff + 1}x` : `${coeff + 1}x^${power}`, `${a}x^${n - 1}`, power === 1 ? `${coeff}x^2` : `${coeff}x^${power - 1}`]
  };
}});

// Differentiation: constant disappears, coefficient of x^0
add({ id: "alevel_calc_diffconst", level: ALEVEL, category: AL_CALC, difficulty: 3, count: 120, gen() {
  const a = randInt(2, 8), n = randInt(2, 5), c = randInt(1, 10);
  const coeff = a * n, power = n - 1;
  const ans = power === 1 ? `${coeff}x` : `${coeff}x^${power}`;
  return {
    text: `Differentiate f(x) = ${a}x^${n} + ${c}. What is f'(x)?`,
    correct: ans,
    distractors: [power === 1 ? `${coeff}x + ${c}` : `${coeff}x^${power} + ${c}`, `${coeff}x^${power + 1}`, power === 1 ? `${a}x` : `${a}x^${power}`]
  };
}});

// Integration power rule: ∫ax^n dx = ax^(n+1)/(n+1)
// Use multiples of (n+1) for a to guarantee integer coefficient
add({ id: "alevel_calc_intpow", level: ALEVEL, category: AL_CALC, difficulty: 3, count: 200, gen() {
  const n = randInt(1, 5), np1 = n + 1;
  const k = randInt(1, 5); const a = k * np1;
  const resultCoeff = k, resultPow = np1;
  const ans = resultPow === 2 ? `${resultCoeff}x^2` : `${resultCoeff}x^${resultPow}`;
  return {
    text: `Find ∫${a}x^${n} dx. What is the coefficient of x^${resultPow} in the result (ignore + C)?`,
    correct: resultCoeff,
    distractors: [a, resultCoeff + 1, resultCoeff * 2],
    opts: { positive: true }
  };
}});

// Definite integral: ∫[a,b] kx dx = k/2(b²-a²)
add({ id: "alevel_calc_defint", level: ALEVEL, category: AL_CALC, difficulty: 4, count: 150, gen() {
  const k = randInt(1, 6), lo = randInt(0, 3), hi = lo + randInt(1, 4);
  const val = (k / 2) * (hi * hi - lo * lo);
  if (val !== Math.floor(val)) return this.gen();
  return {
    text: `Evaluate ∫[${lo} to ${hi}] ${k}x dx.`,
    correct: val,
    distractors: [val + k, val - k, k * hi * hi / 2],
    opts: { positive: true }
  };
}});

// Stationary point: f'(x) = 0, f(x) = ax² + bx + c → f'(x) = 2ax + b = 0 → x = -b/(2a)
add({ id: "alevel_calc_stat", level: ALEVEL, category: AL_CALC, difficulty: 4, count: 120, gen() {
  const a = pick([1, 2, 3]); const b = pick([-8, -6, -4, -2, 2, 4, 6, 8]);
  const x_stat = -b / (2 * a);
  if (x_stat !== Math.floor(x_stat)) return this.gen();
  const c = randInt(-5, 10);
  const bStr = b >= 0 ? `+ ${b}` : `- ${-b}`;
  return {
    text: `Find the x-coordinate of the stationary point of y = ${a}x² ${bStr}x + ${c}.`,
    correct: x_stat,
    distractors: [x_stat + 1, x_stat - 1, b / a]
  };
}});

// ── Trigonometry ──────────────────────────────────────────────────────────

// Exact trig values
const TRIG_EXACT = [
  [0,  "sin", "0"], [0,  "cos", "1"], [0,  "tan", "0"],
  [30, "sin", "0.5"],  [30, "cos", "√3/2"], [30, "tan", "1/√3"],
  [45, "sin", "1/√2"], [45, "cos", "1/√2"], [45, "tan", "1"],
  [60, "sin", "√3/2"], [60, "cos", "0.5"],  [60, "tan", "√3"],
  [90, "sin", "1"],    [90, "cos", "0"],
];
const ALL_TRIG_ANS = [...new Set(TRIG_EXACT.map(([,,v]) => v))];
add({ id: "alevel_trig_exact", level: ALEVEL, category: AL_TRIG, difficulty: 3, count: 140, gen() {
  const [deg, fn, ans] = pick(TRIG_EXACT);
  const wrong = shuffle(ALL_TRIG_ANS.filter(v => v !== ans));
  return { text: `What is the exact value of ${fn}(${deg}°)?`, correct: ans, distractors: wrong.slice(0, 3) };
}});

// Sine rule: a/sin A = b/sin B
add({ id: "alevel_trig_sine", level: ALEVEL, category: AL_TRIG, difficulty: 4, count: 100, gen() {
  const triples = [[3,4,5],[5,12,13],[8,15,17]];
  const k = randInt(1, 4), [a, b, c] = pick(triples).map(v => v * k);
  // angle A opposite side a; using sin A / a = sin B / b
  // with known sides a, b and angle B = 90°
  const sinAoverA = `${a}/${c}`; // sin A = a/c for right triangle
  return {
    text: `In a right-angled triangle, the hypotenuse is ${c} and one side is ${a}. What is sin(A) where A is the angle opposite the side of length ${a}?`,
    correct: `${a}/${c}`,
    distractors: [`${b}/${c}`, `${a}/${b}`, `${c}/${a}`]
  };
}});

// Cosine rule: c² = a² + b² − 2ab cos C
add({ id: "alevel_trig_cosine", level: ALEVEL, category: AL_TRIG, difficulty: 4, count: 100, gen() {
  const a = randInt(3, 10), b = randInt(3, 10), cosC = pick([0, 0.5, -0.5]);
  const c2 = a * a + b * b - 2 * a * b * cosC;
  if (c2 <= 0 || c2 !== Math.floor(c2)) return this.gen();
  const cosStr = cosC === 0 ? "90°" : cosC === 0.5 ? "60°" : "120°";
  return {
    text: `In a triangle, a = ${a}, b = ${b}, C = ${cosStr}. Find c² using the cosine rule.`,
    correct: c2,
    distractors: [a * a + b * b, c2 + a, a * a + b * b + 2 * a * b * cosC],
    opts: { positive: true }
  };
}});

// Area of triangle = ½ab sin C
add({ id: "alevel_trig_area", level: ALEVEL, category: AL_TRIG, difficulty: 3, count: 120, gen() {
  const a = randInt(2, 12), b = randInt(2, 12);
  const sinC = pick([[1, "90°"], [0.5, "30°"], [0.5, "150°"]]);
  const area = 0.5 * a * b * sinC[0];
  if (area !== Math.floor(area)) return this.gen();
  return {
    text: `A triangle has sides a = ${a} cm and b = ${b} cm, and the included angle C = ${sinC[1]}. Find its area in cm².`,
    correct: area,
    distractors: [a * b, area * 2, area + a],
    opts: { positive: true }
  };
}});

// ── Exponentials & Logarithms ─────────────────────────────────────────────

// log power law: n log a = log(a^n)
add({ id: "alevel_el_power", level: ALEVEL, category: AL_EL, difficulty: 3, count: 150, gen() {
  const base = randInt(2, 5), exp = randInt(2, 5);
  const val = Math.pow(base, exp);
  return { text: `Write ${exp}log(${base}) as a single logarithm.`, correct: `log(${val})`, distractors: [`log(${base * exp})`, `log(${base + exp})`, `log(${val - 1})`] };
}});

// log product law: log a + log b = log(ab)
add({ id: "alevel_el_product", level: ALEVEL, category: AL_EL, difficulty: 3, count: 120, gen() {
  const a = randInt(2, 8), b = randInt(2, 8);
  return { text: `Simplify log(${a}) + log(${b}) as a single logarithm.`, correct: `log(${a * b})`, distractors: [`log(${a + b})`, `log(${a * b + 1})`, `log(${a - b})`] };
}});

// log quotient law: log a − log b = log(a/b) — use divisible pairs
add({ id: "alevel_el_quotient", level: ALEVEL, category: AL_EL, difficulty: 3, count: 120, gen() {
  const b = randInt(2, 6), k = randInt(2, 6), a = b * k;
  return { text: `Simplify log(${a}) − log(${b}) as a single logarithm.`, correct: `log(${k})`, distractors: [`log(${a - b})`, `log(${a * b})`, `log(${k + 1})`] };
}});

// Solve e^(ax) = b → x = ln(b)/a
add({ id: "alevel_el_solve_exp", level: ALEVEL, category: AL_EL, difficulty: 4, count: 120, gen() {
  const a = pick([1, 2, 3]); const b = pick([2, 3, 5, 10, 20, 50]);
  return {
    text: `Solve e^(${a === 1 ? "" : a}x) = ${b}. Give the exact value of x.`,
    correct: a === 1 ? `ln(${b})` : `ln(${b})/${a}`,
    distractors: [a === 1 ? `ln(${b - 1})` : `ln(${b})/${a + 1}`, `ln(${b * a})`, `${b}/${a}`]
  };
}});

// Exponential growth/decay: N = N₀ e^(kt)
add({ id: "alevel_el_growth", level: ALEVEL, category: AL_EL, difficulty: 4, count: 100, gen() {
  const N0 = pick([100, 200, 500, 1000]);
  const k = pick([0.1, 0.2, 0.5]);
  const t = pick([2, 5, 10]);
  const ratio = Math.exp(k * t);
  const rounded = parseFloat(ratio.toFixed(1));
  return {
    text: `A population grows as N = ${N0}e^(${k}t). After t = ${t}, by what factor has N multiplied? (Give to 1 d.p.)`,
    correct: rounded,
    distractors: [rounded + 0.5, rounded - 0.5, Math.round(ratio)].filter((x, i, a) => a.indexOf(x) === i && x !== rounded),
    opts: { positive: true }
  };
}});

// ── Vectors ───────────────────────────────────────────────────────────────

// Magnitude: |v| = √(a² + b²) using Pythagorean triples
add({ id: "alevel_vec_mag", level: ALEVEL, category: AL_VEC, difficulty: 3, count: 120, gen() {
  const triples = [[3,4,5],[5,12,13],[6,8,10],[8,15,17],[20,21,29]];
  const k = randInt(1, 3), [a, b, c] = pick(triples).map(v => v * k);
  const sign = pick([1,-1]);
  return { text: `Find the magnitude of vector (${a}, ${sign * b}).`, correct: c, distractors: [a + b, c + k, c - k], opts: { positive: true } };
}});

// Scalar (dot) product: a·b = a₁b₁ + a₂b₂
add({ id: "alevel_vec_dot", level: ALEVEL, category: AL_VEC, difficulty: 3, count: 120, gen() {
  const a = [randInt(-4, 5), randInt(-4, 5)], b = [randInt(-4, 5), randInt(-4, 5)];
  const dot = a[0] * b[0] + a[1] * b[1];
  return { text: `Find the dot product of vectors (${a[0]}, ${a[1]}) and (${b[0]}, ${b[1]}).`, correct: dot, distractors: [dot + 1, dot - 1, a[0] * b[1] + a[1] * b[0]] };
}});

// 3D magnitude
add({ id: "alevel_vec_mag3d", level: ALEVEL, category: AL_VEC, difficulty: 4, count: 100, gen() {
  const triples3d = [[1,2,2,3],[2,6,9,11],[1,4,8,9],[2,4,4,6],[3,4,12,13]];
  const k = randInt(1, 3), [a, b, c, mag] = pick(triples3d).map(v => v * k);
  return { text: `Find the magnitude of the vector (${a}, ${b}, ${c}).`, correct: mag, distractors: [a + b + c, mag + k, mag - k], opts: { positive: true } };
}});

// ── Proof & Binomial ──────────────────────────────────────────────────────

// Binomial coefficient C(n,r)
add({ id: "alevel_proof_binom_coeff", level: ALEVEL, category: AL_PROOF, difficulty: 3, count: 120, gen() {
  const n = randInt(4, 10), r = randInt(1, n - 1);
  const coeff = comb(n, r);
  return {
    text: `Find the coefficient of x^${r} in the expansion of (1 + x)^${n}.`,
    correct: coeff,
    distractors: [comb(n, r - 1), comb(n, r + 1), coeff + 1].filter((x, i, a) => a.indexOf(x) === i && x !== coeff)
  };
}});

// Binomial expansion: term in (a + bx)^n
add({ id: "alevel_proof_binom_term", level: ALEVEL, category: AL_PROOF, difficulty: 4, count: 120, gen() {
  const n = randInt(4, 8), r = randInt(1, 3);
  const a = 1, b = randInt(1, 4);
  // coefficient of x^r = C(n,r) * b^r
  const coeff = comb(n, r) * Math.pow(b, r);
  return {
    text: `Find the coefficient of x^${r} in the expansion of (1 + ${b}x)^${n}.`,
    correct: coeff,
    distractors: [comb(n, r), coeff + comb(n, r), coeff - 1].filter((x, i, a) => a.indexOf(x) === i && x !== coeff),
    opts: { positive: true }
  };
}});

// ── Statistics ────────────────────────────────────────────────────────────

// Binomial distribution mean and variance: E(X) = np, Var(X) = np(1-p)
add({ id: "alevel_stat_binom_mean", level: ALEVEL, category: AL_STAT, difficulty: 3, count: 150, gen() {
  const n = pick([8, 10, 12, 15, 20, 25]); const pArr = [[1,2],[1,4],[3,4],[1,5],[2,5],[3,5],[1,10],[3,10]];
  const [pN, pD] = pick(pArr); const mean = n * pN / pD;
  if (mean !== Math.floor(mean)) return this.gen();
  return { text: `X ~ B(${n}, ${pN}/${pD}). Find E(X).`, correct: mean, distractors: [mean + 1, mean - 1, n - mean].filter((x, i, a) => a.indexOf(x) === i && x !== mean), opts: { positive: true } };
}});
add({ id: "alevel_stat_binom_var", level: ALEVEL, category: AL_STAT, difficulty: 3, count: 120, gen() {
  const n = pick([10, 20, 25, 40, 50]); const pArr = [[1,2],[1,4],[3,4],[1,5],[2,5]];
  const [pN, pD] = pick(pArr); const p = pN / pD; const variance = n * p * (1 - p);
  if (variance * 4 !== Math.floor(variance * 4)) return this.gen();
  return { text: `X ~ B(${n}, ${pN}/${pD}). Find Var(X).`, correct: variance, distractors: [variance + 1, n * p, variance - 0.5].filter((x, i, a) => a.indexOf(x) === i && x !== variance), opts: { positive: true } };
}});

// Normal distribution: standardise X ~ N(μ, σ²) → Z = (x − μ)/σ
add({ id: "alevel_stat_normal_z", level: ALEVEL, category: AL_STAT, difficulty: 4, count: 150, gen() {
  const mu = pick([50, 60, 70, 80, 100, 120]); const sigma = pick([5, 8, 10, 12, 15, 20]);
  const z_int = pick([-2, -1, 0, 1, 2]); const x = mu + z_int * sigma;
  return { text: `X ~ N(${mu}, ${sigma}²). Find the standardised value Z when X = ${x}.`, correct: z_int, distractors: [z_int + 1, z_int - 1, x - mu] };
}});

// Hypothesis testing: critical region concept (z-value)
add({ id: "alevel_stat_hyp_sig", level: ALEVEL, category: AL_STAT, difficulty: 4, count: 100, gen() {
  const levels = [["5%", 1.645], ["1%", 2.326], ["10%", 1.282], ["2.5%", 1.960]];
  const [level, zCrit] = pick(levels);
  const zObs = parseFloat((zCrit + randInt(1, 4) * 0.1).toFixed(3));
  return {
    text: `A one-tailed test at the ${level} significance level has critical value z = ${zCrit}. The observed test statistic is z = ${zObs}. What is the conclusion?`,
    correct: "Reject H₀",
    distractors: ["Accept H₀", "Inconclusive", "Test is invalid"]
  };
}});

// Correlation coefficient interpretation
add({ id: "alevel_stat_corr", level: ALEVEL, category: AL_STAT, difficulty: 3, count: 80, gen() {
  const r = parseFloat((randInt(-99, 99) / 100).toFixed(2));
  const strength = Math.abs(r) > 0.7 ? "strong" : Math.abs(r) > 0.3 ? "moderate" : "weak";
  const dir = r > 0 ? "positive" : "negative";
  return {
    text: `A correlation coefficient of r = ${r} indicates which type of linear relationship?`,
    correct: `${strength} ${dir}`,
    distractors: [
      `${strength === "strong" ? "weak" : "strong"} ${dir}`,
      `${strength} ${dir === "positive" ? "negative" : "positive"}`,
      `${strength === "moderate" ? "strong" : "moderate"} ${dir === "positive" ? "negative" : "positive"}`
    ]
  };
}});

// ── Mechanics ─────────────────────────────────────────────────────────────

// SUVAT: v = u + at
add({ id: "alevel_mech_suvat_v", level: ALEVEL, category: AL_MECH, difficulty: 3, count: 200, gen() {
  const u = randInt(0, 20), a = randInt(1, 10), t = randInt(1, 8);
  const v = u + a * t;
  return { text: `A particle starts with velocity ${u} m/s and has acceleration ${a} m/s². Find its velocity after ${t} s.`, correct: `${v} m/s`, distractors: [`${v + a} m/s`, `${u * t} m/s`, `${v - 1} m/s`] };
}});

// SUVAT: s = ut + ½at²
add({ id: "alevel_mech_suvat_s", level: ALEVEL, category: AL_MECH, difficulty: 3, count: 150, gen() {
  const u = randInt(0, 10), a = pick([2, 4, 6, 8, 10]), t = randInt(1, 6);
  const s = u * t + 0.5 * a * t * t;
  if (s !== Math.floor(s)) return this.gen();
  return { text: `A particle starts with velocity ${u} m/s and acceleration ${a} m/s². Find the displacement after ${t} s.`, correct: `${s} m`, distractors: [`${s + a} m`, `${u * t} m`, `${s - t} m`] };
}});

// v² = u² + 2as (finding v²)
add({ id: "alevel_mech_suvat_v2", level: ALEVEL, category: AL_MECH, difficulty: 3, count: 120, gen() {
  const u = randInt(0, 8), a = randInt(1, 6), s = randInt(2, 10);
  const v2 = u * u + 2 * a * s;
  return { text: `A particle has initial velocity ${u} m/s and acceleration ${a} m/s² over a distance of ${s} m. Find v².`, correct: `${v2} m²/s²`, distractors: [`${v2 + 2 * a} m²/s²`, `${u * u} m²/s²`, `${v2 - 1} m²/s²`] };
}});

// Newton's second law: F = ma
add({ id: "alevel_mech_newton", level: ALEVEL, category: AL_MECH, difficulty: 3, count: 200, gen() {
  const mode = pick(["F", "a", "m"]);
  if (mode === "F") {
    const m = randInt(1, 20), a = randInt(1, 15);
    return { text: `A mass of ${m} kg has acceleration ${a} m/s². Find the resultant force.`, correct: `${m * a} N`, distractors: [`${m + a} N`, `${m * a + m} N`, `${m * a - 1} N`] };
  } else if (mode === "a") {
    const m = randInt(1, 20), F = randInt(10, 200);
    const a = F / m;
    if (a !== Math.floor(a)) return this.gen();
    return { text: `A force of ${F} N acts on a mass of ${m} kg. Find the acceleration.`, correct: `${a} m/s²`, distractors: [`${a + 1} m/s²`, `${m * F} m/s²`, `${a - 1} m/s²`] };
  } else {
    const a = randInt(1, 10), F = randInt(10, 100);
    const m = F / a;
    if (m !== Math.floor(m)) return this.gen();
    return { text: `A force of ${F} N causes acceleration ${a} m/s². Find the mass.`, correct: `${m} kg`, distractors: [`${m + 1} kg`, `${F * a} kg`, `${m - 1} kg`] };
  }
}});

// Conservation of momentum: m₁u₁ + m₂u₂ = (m₁ + m₂)v (perfectly inelastic)
add({ id: "alevel_mech_momentum", level: ALEVEL, category: AL_MECH, difficulty: 4, count: 150, gen() {
  const m1 = randInt(1, 6), u1 = randInt(2, 10), m2 = randInt(1, 6);
  const v = randInt(1, 8);
  const u2 = 0; // target at rest
  const v_final = (m1 * u1) / (m1 + m2);
  if (v_final !== Math.floor(v_final)) return this.gen();
  return { text: `A ${m1} kg object moving at ${u1} m/s collides and sticks to a stationary ${m2} kg object. Find the final velocity.`, correct: `${v_final} m/s`, distractors: [`${v_final + 1} m/s`, `${u1} m/s`, `${m1 * u1} m/s`] };
}});

// Moments: moment = force × perpendicular distance
add({ id: "alevel_mech_moments", level: ALEVEL, category: AL_MECH, difficulty: 3, count: 120, gen() {
  const F = randInt(5, 40), d = randInt(1, 6);
  const M = F * d;
  return { text: `A force of ${F} N acts at a perpendicular distance of ${d} m from a pivot. Find the moment.`, correct: `${M} N m`, distractors: [`${M + F} N m`, `${F + d} N m`, `${M - d} N m`] };
}});


// ─────────────────────────────────────────────────────────────────────────
// PHYSICS  KS3  (Years 7–9, NC Physics)  subject: "physics"
// ─────────────────────────────────────────────────────────────────────────
const PKS3_FOR = "Forces";
const PKS3_EN  = "Energy";
const PKS3_WAV = "Waves";
const PKS3_EL  = "Electricity";
const PKS3_MAT = "Matter & Space";

// Forces: weight = mass × g (g = 10 N/kg at KS3)
add({ id: "ks3_ph_forces_weight", level: KS3, subject: "physics", category: PKS3_FOR, difficulty: 1, count: 150, gen() {
  const mass = randInt(1, 50);
  const mode = pick(["weight", "mass"]);
  if (mode === "weight") {
    return { text: `An object has a mass of ${mass} kg. What is its weight on Earth? (g = 10 N/kg)`, correct: `${mass * 10} N`, distractors: [`${mass} N`, `${mass * 100} N`, `${mass * 10 + 10} N`] };
  }
  const weight = mass * 10;
  return { text: `An object has a weight of ${weight} N on Earth. (g = 10 N/kg) What is its mass?`, correct: `${mass} kg`, distractors: [`${weight} kg`, `${mass * 2} kg`, `${mass + 5} kg`] };
}});

// Resultant force
add({ id: "ks3_ph_forces_result", level: KS3, subject: "physics", category: PKS3_FOR, difficulty: 2, count: 150, gen() {
  const F1 = randInt(5, 40), F2 = randInt(1, F1 - 1);
  const mode = pick(["same", "opposite"]);
  if (mode === "same") {
    return { text: `Two forces of ${F1} N and ${F2} N act in the same direction. What is the resultant force?`, correct: `${F1 + F2} N`, distractors: [`${F1 - F2} N`, `${F1} N`, `${F1 * F2} N`] };
  }
  return { text: `Two forces of ${F1} N and ${F2} N act in opposite directions. What is the resultant force?`, correct: `${F1 - F2} N`, distractors: [`${F1 + F2} N`, `${F2} N`, `${F1} N`] };
}});

// Speed: v = d/t
add({ id: "ks3_ph_forces_speed", level: KS3, subject: "physics", category: PKS3_FOR, difficulty: 1, count: 150, gen() {
  const speed = randInt(2, 30), time = randInt(2, 10), dist = speed * time;
  const mode = pick(["speed", "dist", "time"]);
  if (mode === "speed") return { text: `An object travels ${dist} m in ${time} s. What is its speed?`, correct: `${speed} m/s`, distractors: [`${speed + 1} m/s`, `${dist + time} m/s`, `${speed - 1} m/s`] };
  if (mode === "dist") return { text: `An object moves at ${speed} m/s for ${time} s. How far does it travel?`, correct: `${dist} m`, distractors: [`${dist + speed} m`, `${speed + time} m`, `${dist - time} m`] };
  return { text: `An object travels ${dist} m at ${speed} m/s. How long does it take?`, correct: `${time} s`, distractors: [`${time + 1} s`, `${dist + speed} s`, `${time - 1} s`] };
}});

// Energy: P = E/t
add({ id: "ks3_ph_energy_power", level: KS3, subject: "physics", category: PKS3_EN, difficulty: 2, count: 150, gen() {
  const P = pick([10, 20, 25, 40, 50, 60, 100, 200, 500, 1000]);
  const t = randInt(2, 20), E = P * t;
  const mode = pick(["P", "E", "t"]);
  if (mode === "P") return { text: `A device transfers ${E} J of energy in ${t} s. What is its power?`, correct: `${P} W`, distractors: [`${P + 10} W`, `${E} W`, `${P - 5} W`] };
  if (mode === "E") return { text: `A ${P} W device runs for ${t} s. How much energy does it transfer?`, correct: `${E} J`, distractors: [`${E + P} J`, `${P * (t + 1)} J`, `${E - t} J`] };
  return { text: `A device uses ${E} J at a power of ${P} W. How long does it run?`, correct: `${t} s`, distractors: [`${t + 1} s`, `${E} s`, `${t - 1} s`] };
}});

// Efficiency = useful output / total input × 100%
add({ id: "ks3_ph_energy_eff", level: KS3, subject: "physics", category: PKS3_EN, difficulty: 2, count: 120, gen() {
  const eff = pick([20, 25, 40, 50, 60, 75, 80]);
  const total = pick([100, 200, 400, 500, 1000]);
  const useful = (eff / 100) * total;
  return { text: `A machine takes in ${total} J and outputs ${useful} J of useful energy. What is its efficiency?`, correct: `${eff}%`, distractors: [`${eff + 10}%`, `${100 - eff}%`, `${eff - 5}%`] };
}});

// Energy stores: kinetic, gravitational, thermal, chemical, elastic
add({ id: "ks3_ph_energy_stores", level: KS3, subject: "physics", category: PKS3_EN, difficulty: 1, count: 80, gen() {
  const scenarios = [
    ["A moving car", "kinetic energy store"],
    ["A book on a high shelf", "gravitational potential energy store"],
    ["A stretched spring", "elastic potential energy store"],
    ["A battery", "chemical energy store"],
    ["A hot cup of tea", "thermal energy store"],
  ];
  const [scenario, ans] = pick(scenarios);
  const others = scenarios.filter(([, v]) => v !== ans).map(([, v]) => v);
  return { text: `${scenario} has energy mainly in which store?`, correct: ans, distractors: shuffle(others).slice(0, 3) };
}});

// Waves: v = fλ
add({ id: "ks3_ph_waves_speed", level: KS3, subject: "physics", category: PKS3_WAV, difficulty: 2, count: 150, gen() {
  const f = pick([2, 4, 5, 8, 10, 20, 50, 100, 200, 440, 1000]);
  const lam = pick([0.5, 1, 2, 5, 10, 100]);
  const v = f * lam;
  const mode = pick(["v", "f", "lam"]);
  if (mode === "v") return { text: `A wave has frequency ${f} Hz and wavelength ${lam} m. What is its speed?`, correct: `${v} m/s`, distractors: [`${v + f} m/s`, `${f + lam} m/s`, `${v - lam} m/s`] };
  if (mode === "f") return { text: `A wave travels at ${v} m/s with wavelength ${lam} m. What is its frequency?`, correct: `${f} Hz`, distractors: [`${f + 1} Hz`, `${v} Hz`, `${f - 1} Hz`] };
  return { text: `A wave has speed ${v} m/s and frequency ${f} Hz. What is its wavelength?`, correct: `${lam} m`, distractors: [`${lam + 1} m`, `${v} m`, `${lam / 2} m`] };
}});

// Wave type: transverse vs longitudinal
add({ id: "ks3_ph_waves_type", level: KS3, subject: "physics", category: PKS3_WAV, difficulty: 1, count: 80, gen() {
  const examples = [
    ["Light waves", "transverse"],
    ["Sound waves in air", "longitudinal"],
    ["Water surface waves", "transverse"],
    ["Seismic P-waves", "longitudinal"],
    ["Seismic S-waves", "transverse"],
    ["Microwaves", "transverse"],
  ];
  const [ex, ans] = pick(examples);
  return { text: `${ex} are which type of wave?`, correct: ans, distractors: [ans === "transverse" ? "longitudinal" : "transverse", "standing", "electromagnetic"].filter(x => x !== ans).slice(0, 3) };
}});

// Electricity: V = IR (Ohm's law)
add({ id: "ks3_ph_elec_ohm", level: KS3, subject: "physics", category: PKS3_EL, difficulty: 2, count: 200, gen() {
  const R = pick([2, 4, 5, 8, 10, 20, 50, 100]), I = pick([1, 2, 4, 5, 10]);
  const V = I * R;
  const mode = pick(["V", "I", "R"]);
  if (mode === "V") return { text: `A resistor of ${R} Ω carries a current of ${I} A. What is the voltage across it?`, correct: `${V} V`, distractors: [`${V + R} V`, `${I + R} V`, `${V - I} V`] };
  if (mode === "I") return { text: `A voltage of ${V} V is applied across a ${R} Ω resistor. What is the current?`, correct: `${I} A`, distractors: [`${I + 1} A`, `${V} A`, `${I - 0.5} A`] };
  return { text: `A current of ${I} A flows when ${V} V is applied. What is the resistance?`, correct: `${R} Ω`, distractors: [`${R + 5} Ω`, `${V * I} Ω`, `${R - 1} Ω`] };
}});

// Series circuits: total resistance, shared current
add({ id: "ks3_ph_elec_series", level: KS3, subject: "physics", category: PKS3_EL, difficulty: 2, count: 100, gen() {
  const R1 = pick([2, 4, 5, 6, 8, 10]), R2 = pick([2, 4, 5, 6, 8, 10]);
  const Rtot = R1 + R2, V = randInt(2, 6) * Rtot, I = V / Rtot;
  return { text: `Two resistors (${R1} Ω and ${R2} Ω) are connected in series to a ${V} V supply. What is the current?`, correct: `${I} A`, distractors: [`${I + 0.5} A`, `${V / R1} A`, `${I - 0.5} A`] };
}});

// Parallel circuits: combined resistance (two resistors)
add({ id: "ks3_ph_elec_parallel", level: KS3, subject: "physics", category: PKS3_EL, difficulty: 2, count: 100, gen() {
  const R1 = pick([4, 6, 8, 10, 12, 20]), R2 = R1;
  const Rpar = R1 / 2;
  return { text: `Two identical ${R1} Ω resistors are connected in parallel. What is the combined resistance?`, correct: `${Rpar} Ω`, distractors: [`${R1 * 2} Ω`, `${R1} Ω`, `${Rpar + 1} Ω`] };
}});

// Matter: density = mass / volume
add({ id: "ks3_ph_matter_density", level: KS3, subject: "physics", category: PKS3_MAT, difficulty: 2, count: 150, gen() {
  const rho = randInt(1, 10), V = randInt(2, 20), m = rho * V;
  const mode = pick(["rho", "V", "m"]);
  if (mode === "rho") return { text: `An object has mass ${m} g and volume ${V} cm³. What is its density?`, correct: `${rho} g/cm³`, distractors: [`${rho + 1} g/cm³`, `${m * V} g/cm³`, `${rho - 1} g/cm³`] };
  if (mode === "V") return { text: `An object of density ${rho} g/cm³ has mass ${m} g. What is its volume?`, correct: `${V} cm³`, distractors: [`${V + 5} cm³`, `${m * rho} cm³`, `${V - 2} cm³`] };
  return { text: `An object of density ${rho} g/cm³ has volume ${V} cm³. What is its mass?`, correct: `${m} g`, distractors: [`${m + rho} g`, `${V} g`, `${m - V} g`] };
}});

// States of matter
add({ id: "ks3_ph_matter_states", level: KS3, subject: "physics", category: PKS3_MAT, difficulty: 1, count: 80, gen() {
  const facts = [
    ["In which state do particles have fixed positions and vibrate in place?", "solid"],
    ["In which state do particles flow freely but maintain fixed volume?", "liquid"],
    ["In which state do particles move randomly and fill any container?", "gas"],
    ["Which state of matter is the least dense?", "gas"],
    ["Which state has the most ordered particle arrangement?", "solid"],
    ["Which change of state is liquid → gas called?", "evaporation/boiling"],
    ["Which change of state is gas → liquid called?", "condensation"],
    ["Which change of state is solid → liquid called?", "melting"],
  ];
  const [q, ans] = pick(facts);
  const allAns = ["solid", "liquid", "gas", "evaporation/boiling", "condensation", "melting", "sublimation"];
  return { text: q, correct: ans, distractors: shuffle(allAns.filter(a => a !== ans)).slice(0, 3) };
}});

// ─────────────────────────────────────────────────────────────────────────
// PHYSICS  GCSE  (Edexcel/AQA)  subject: "physics"
// ─────────────────────────────────────────────────────────────────────────
const PGCSE_FM  = "Forces & Motion";
const PGCSE_EN  = "Energy";
const PGCSE_EL  = "Electricity";
const PGCSE_WAV = "Waves";
const PGCSE_MAG = "Magnetism & Electromagnetism";
const PGCSE_AT  = "Atomic Structure";
const PGCSE_SP  = "Space Physics";

// SUVAT v = u + at
add({ id: "gcse_ph_fm_suvat_v", level: GCSE, subject: "physics", category: PGCSE_FM, difficulty: 3, count: 150, gen() {
  const u = randInt(0, 20), a = randInt(1, 10), t = randInt(1, 8), v = u + a * t;
  return { text: `A car starts at ${u} m/s and accelerates at ${a} m/s² for ${t} s. What is its final velocity?`, correct: `${v} m/s`, distractors: [`${v + a} m/s`, `${u * t} m/s`, `${v - 1} m/s`] };
}});

// v² = u² + 2as
add({ id: "gcse_ph_fm_suvat_v2", level: GCSE, subject: "physics", category: PGCSE_FM, difficulty: 3, count: 120, gen() {
  const u = randInt(0, 8), a = randInt(1, 6), s = randInt(2, 10);
  const v2 = u * u + 2 * a * s;
  return { text: `Initial velocity ${u} m/s, acceleration ${a} m/s², distance ${s} m. Find v².`, correct: `${v2} m²/s²`, distractors: [`${v2 + 2 * a} m²/s²`, `${u * u + a * s} m²/s²`, `${v2 - 1} m²/s²`] };
}});

// F = ma
add({ id: "gcse_ph_fm_fma", level: GCSE, subject: "physics", category: PGCSE_FM, difficulty: 2, count: 200, gen() {
  const mode = pick(["F", "a", "m"]);
  if (mode === "F") { const m = randInt(1, 30), a = randInt(1, 15); return { text: `A ${m} kg object accelerates at ${a} m/s². Find the resultant force.`, correct: `${m * a} N`, distractors: [`${m + a} N`, `${m * a + m} N`, `${m * a - 1} N`] }; }
  if (mode === "a") { const m = randInt(2, 20), F = randInt(10, 200); const a = F / m; if (a !== Math.floor(a)) return this.gen(); return { text: `A ${F} N force acts on a ${m} kg mass. Find acceleration.`, correct: `${a} m/s²`, distractors: [`${a + 1} m/s²`, `${F * m} m/s²`, `${a - 1} m/s²`] }; }
  const a = randInt(1, 10), F = randInt(10, 100); const m = F / a; if (m !== Math.floor(m)) return this.gen();
  return { text: `A force of ${F} N causes acceleration ${a} m/s². Find the mass.`, correct: `${m} kg`, distractors: [`${m + 1} kg`, `${F + a} kg`, `${m - 1} kg`] };
}});

// Momentum p = mv
add({ id: "gcse_ph_fm_momentum", level: GCSE, subject: "physics", category: PGCSE_FM, difficulty: 2, count: 150, gen() {
  const m = randInt(1, 20), v = randInt(1, 30), p = m * v;
  const mode = pick(["p", "m", "v"]);
  if (mode === "p") return { text: `A ${m} kg object moves at ${v} m/s. Find its momentum.`, correct: `${p} kg m/s`, distractors: [`${p + v} kg m/s`, `${m + v} kg m/s`, `${p - m} kg m/s`] };
  if (mode === "m") return { text: `An object has momentum ${p} kg m/s and velocity ${v} m/s. Find its mass.`, correct: `${m} kg`, distractors: [`${m + 1} kg`, `${p} kg`, `${m - 1} kg`] };
  return { text: `An object of mass ${m} kg has momentum ${p} kg m/s. Find its velocity.`, correct: `${v} m/s`, distractors: [`${v + 1} m/s`, `${p} m/s`, `${v - 1} m/s`] };
}});

// Work done W = Fs
add({ id: "gcse_ph_fm_work", level: GCSE, subject: "physics", category: PGCSE_FM, difficulty: 2, count: 120, gen() {
  const F = pick([5, 10, 20, 40, 50, 100, 200, 500]), s = randInt(2, 20), W = F * s;
  return { text: `A force of ${F} N is applied over a distance of ${s} m. Calculate the work done.`, correct: `${W} J`, distractors: [`${W + F} J`, `${F + s} J`, `${W - s} J`] };
}});

// KE = ½mv²
add({ id: "gcse_ph_energy_ke", level: GCSE, subject: "physics", category: PGCSE_EN, difficulty: 3, count: 150, gen() {
  const m = randInt(1, 20), v = pick([2, 4, 6, 8, 10]), KE = 0.5 * m * v * v;
  return { text: `An object of mass ${m} kg moves at ${v} m/s. Find its kinetic energy.`, correct: `${KE} J`, distractors: [`${m * v} J`, `${KE + m} J`, `${0.5 * m * v} J`] };
}});

// GPE = mgh (g = 10 N/kg at GCSE)
add({ id: "gcse_ph_energy_gpe", level: GCSE, subject: "physics", category: PGCSE_EN, difficulty: 2, count: 150, gen() {
  const m = randInt(1, 50), h = randInt(1, 20), g = 10, GPE = m * g * h;
  return { text: `An object of mass ${m} kg is lifted ${h} m. Find the gain in gravitational potential energy. (g = 10 N/kg)`, correct: `${GPE} J`, distractors: [`${m * h} J`, `${GPE + m} J`, `${g * h} J`] };
}});

// Specific heat capacity: Q = mcΔT
add({ id: "gcse_ph_energy_shc", level: GCSE, subject: "physics", category: PGCSE_EN, difficulty: 3, count: 120, gen() {
  const m = randInt(1, 5), dT = pick([5, 10, 15, 20, 25, 50]);
  const c = pick([400, 500, 2000, 4200]);
  const Q = m * c * dT;
  return { text: `Calculate the energy needed to raise ${m} kg of a substance (c = ${c} J/kg°C) by ${dT}°C.`, correct: `${Q} J`, distractors: [`${m * c} J`, `${Q + c} J`, `${m * dT * c / 2} J`] };
}});

// Power: P = E/t or P = W/t
add({ id: "gcse_ph_energy_power", level: GCSE, subject: "physics", category: PGCSE_EN, difficulty: 2, count: 150, gen() {
  const P = pick([100, 200, 400, 500, 1000, 2000, 3000]), t = randInt(10, 60), E = P * t;
  const mode = pick(["P", "E", "t"]);
  if (mode === "P") return { text: `A device transfers ${E} J in ${t} s. What is its power?`, correct: `${P} W`, distractors: [`${P + 50} W`, `${E} W`, `${P / 2} W`] };
  if (mode === "E") return { text: `A ${P} W device runs for ${t} s. How much energy does it transfer?`, correct: `${E} J`, distractors: [`${P + t} J`, `${E + P} J`, `${E - t} J`] };
  return { text: `A device uses ${E} J at a power of ${P} W. How long does it run?`, correct: `${t} s`, distractors: [`${t + 10} s`, `${E} s`, `${t - 5} s`] };
}});

// Electricity: P = IV
add({ id: "gcse_ph_elec_power", level: GCSE, subject: "physics", category: PGCSE_EL, difficulty: 2, count: 150, gen() {
  const I = randInt(1, 15), V = pick([6, 9, 12, 24, 120, 230]), P = I * V;
  const mode = pick(["P", "I"]);
  if (mode === "P") return { text: `A device draws a current of ${I} A from a ${V} V supply. What is its power?`, correct: `${P} W`, distractors: [`${P + V} W`, `${I + V} W`, `${P - I} W`] };
  return { text: `A ${P} W device is connected to a ${V} V supply. What current does it draw?`, correct: `${I} A`, distractors: [`${I + 1} A`, `${P} A`, `${I - 1} A`] };
}});

// Charge Q = It
add({ id: "gcse_ph_elec_charge", level: GCSE, subject: "physics", category: PGCSE_EL, difficulty: 2, count: 120, gen() {
  const I = randInt(1, 10), t = randInt(5, 60), Q = I * t;
  return { text: `A current of ${I} A flows for ${t} s. How much charge passes?`, correct: `${Q} C`, distractors: [`${Q + I} C`, `${I + t} C`, `${Q - t} C`] };
}});

// Electrical energy E = Pt
add({ id: "gcse_ph_elec_energy", level: GCSE, subject: "physics", category: PGCSE_EL, difficulty: 2, count: 100, gen() {
  const P = pick([1000, 2000, 3000, 6000]), t = randInt(1, 4) * 3600;
  const E = P * t;
  const t_hrs = t / 3600;
  return { text: `A ${P / 1000} kW device runs for ${t_hrs} hour${t_hrs > 1 ? "s" : ""}. Find the energy used in joules.`, correct: `${E} J`, distractors: [`${E + P} J`, `${P * t_hrs} J`, `${E / 2} J`] };
}});

// Waves: v = fλ
add({ id: "gcse_ph_waves_speed", level: GCSE, subject: "physics", category: PGCSE_WAV, difficulty: 2, count: 150, gen() {
  const f = pick([2, 5, 10, 50, 100, 440, 1000, 20000]);
  const lam = pick([0.1, 0.5, 1, 2, 5, 10]);
  const v = f * lam;
  const mode = pick(["v", "f", "lam"]);
  if (mode === "v") return { text: `A wave has frequency ${f} Hz and wavelength ${lam} m. What is its speed?`, correct: `${v} m/s`, distractors: [`${v + f} m/s`, `${f + lam} m/s`, `${v / 2} m/s`] };
  if (mode === "f") return { text: `A wave travels at ${v} m/s with wavelength ${lam} m. What is its frequency?`, correct: `${f} Hz`, distractors: [`${f + 1} Hz`, `${v * lam} Hz`, `${f - 1} Hz`] };
  return { text: `A wave travels at ${v} m/s with frequency ${f} Hz. What is its wavelength?`, correct: `${lam} m`, distractors: [`${lam * 2} m`, `${v} m`, `${lam + 1} m`] };
}});

// EM spectrum order
add({ id: "gcse_ph_waves_em", level: GCSE, subject: "physics", category: PGCSE_WAV, difficulty: 2, count: 80, gen() {
  const questions = [
    ["Which EM wave has the shortest wavelength?", "gamma rays"],
    ["Which EM wave has the longest wavelength?", "radio waves"],
    ["Which EM waves are used in TV remote controls?", "infrared"],
    ["Which EM waves are used in medical X-ray imaging?", "X-rays"],
    ["Which EM waves cause sunburn?", "ultraviolet"],
    ["Mobile phones use which type of EM wave?", "microwaves"],
    ["Which EM waves can we see with our eyes?", "visible light"],
  ];
  const [q, ans] = pick(questions);
  const allAns = ["gamma rays", "X-rays", "ultraviolet", "visible light", "infrared", "microwaves", "radio waves"];
  return { text: q, correct: ans, distractors: shuffle(allAns.filter(a => a !== ans)).slice(0, 3) };
}});

// Snell's law (qualitative / basic)
add({ id: "gcse_ph_waves_refract", level: GCSE, subject: "physics", category: PGCSE_WAV, difficulty: 3, count: 80, gen() {
  const n = pick([1.3, 1.4, 1.5, 1.6, 1.7]);
  const angleI = pick([20, 30, 40, 45, 50, 60]);
  const sinR = parseFloat((Math.sin(angleI * Math.PI / 180) / n).toFixed(4));
  const angleR = Math.round(Math.asin(sinR) * 180 / Math.PI);
  return {
    text: `Light passes from air (n=1) into glass (n=${n}) at an angle of incidence of ${angleI}°. The angle of refraction is approximately ${angleR}°. Which law relates these?`,
    correct: "Snell's law: n₁ sin θ₁ = n₂ sin θ₂",
    distractors: ["Huygens' principle", "Newton's law of reflection", "Bragg's law"]
  };
}});

// Atomic structure: mass number = protons + neutrons
add({ id: "gcse_ph_atomic_mn", level: GCSE, subject: "physics", category: PGCSE_AT, difficulty: 1, count: 150, gen() {
  const Z = randInt(1, 90), N = randInt(0, Z + 20), A = Z + N;
  const mode = pick(["A", "N", "Z"]);
  if (mode === "A") return { text: `An atom has ${Z} protons and ${N} neutrons. What is its mass number?`, correct: A, distractors: [A + 1, Z, N], opts: { positive: true } };
  if (mode === "N") return { text: `An atom has mass number ${A} and atomic number ${Z}. How many neutrons does it have?`, correct: N, distractors: [N + 1, A, Z], opts: { positive: true } };
  return { text: `An atom has mass number ${A} and ${N} neutrons. What is its atomic number?`, correct: Z, distractors: [Z + 1, A, N], opts: { positive: true } };
}});

// Alpha, beta, gamma decay
add({ id: "gcse_ph_atomic_decay", level: GCSE, subject: "physics", category: PGCSE_AT, difficulty: 2, count: 100, gen() {
  const facts = [
    ["Alpha (α) decay emits a helium nucleus. How does the mass number change?", "decreases by 4"],
    ["Alpha (α) decay. How does the atomic number change?", "decreases by 2"],
    ["Beta (β⁻) decay emits an electron. How does the atomic number change?", "increases by 1"],
    ["Beta (β⁻) decay. How does the mass number change?", "stays the same"],
    ["Gamma (γ) radiation. How do the mass and atomic numbers change?", "neither changes"],
    ["Which decay has the greatest penetrating power?", "gamma (γ)"],
    ["Which decay is the most ionising?", "alpha (α)"],
    ["Which decay is stopped by a thin sheet of aluminium?", "beta (β)"],
    ["Which decay is stopped by a sheet of paper?", "alpha (α)"],
  ];
  const [q, ans] = pick(facts);
  const all = ["decreases by 4", "decreases by 2", "increases by 1", "stays the same", "neither changes", "gamma (γ)", "alpha (α)", "beta (β)"];
  return { text: q, correct: ans, distractors: shuffle(all.filter(a => a !== ans)).slice(0, 3) };
}});

// Half-life
add({ id: "gcse_ph_atomic_halflife", level: GCSE, subject: "physics", category: PGCSE_AT, difficulty: 3, count: 120, gen() {
  const t_half = pick([2, 3, 5, 6, 8, 10, 12, 24]);
  const n_halflives = pick([1, 2, 3, 4]);
  const initial = pick([800, 1600, 3200, 6400]);
  const remaining = initial / Math.pow(2, n_halflives);
  const time = n_halflives * t_half;
  const mode = pick(["remaining", "halflives", "fraction"]);
  if (mode === "remaining") return { text: `A sample starts with ${initial} counts/s and has a half-life of ${t_half} s. What is the count rate after ${time} s?`, correct: `${remaining} counts/s`, distractors: [`${remaining * 2} counts/s`, `${remaining + t_half} counts/s`, `${remaining / 2} counts/s`] };
  if (mode === "fraction") return { text: `A radioactive source has a half-life of ${t_half} minutes. After ${time} minutes, what fraction of the original activity remains?`, correct: `1/${Math.pow(2, n_halflives)}`, distractors: [`1/${Math.pow(2, n_halflives - 1)}`, `1/${Math.pow(2, n_halflives + 1)}`, `${n_halflives}/${Math.pow(2, n_halflives)}`] };
  return { text: `A source decays from ${initial} to ${remaining} counts/s. Each half-life is ${t_half} s. How many half-lives have passed?`, correct: n_halflives, distractors: [n_halflives + 1, n_halflives - 1, time], opts: { positive: true } };
}});

// Magnetism: motor effect, force on wire F = BIL
add({ id: "gcse_ph_mag_force", level: GCSE, subject: "physics", category: PGCSE_MAG, difficulty: 3, count: 100, gen() {
  const B = pick([0.2, 0.5, 1, 1.5, 2]), I = randInt(1, 10), L = randInt(1, 5);
  const F = B * I * L;
  return { text: `A wire of length ${L} m carries current ${I} A in a magnetic field of flux density ${B} T. Find the force on the wire.`, correct: `${F} N`, distractors: [`${F + 1} N`, `${B * I} N`, `${F + B} N`] };
}});

// Electromagnetic induction: induced EMF = BLv
add({ id: "gcse_ph_mag_emf", level: GCSE, subject: "physics", category: PGCSE_MAG, difficulty: 3, count: 80, gen() {
  const B = pick([0.5, 1, 1.5, 2]), L = randInt(1, 4), v = randInt(1, 10);
  const emf = B * L * v;
  return { text: `A wire of length ${L} m moves at ${v} m/s perpendicular to a magnetic field of ${B} T. Find the induced EMF.`, correct: `${emf} V`, distractors: [`${emf + L} V`, `${B * v} V`, `${emf - 1} V`] };
}});

// Space: orbital speed v = 2πr/T
add({ id: "gcse_ph_space_orbit", level: GCSE, subject: "physics", category: PGCSE_SP, difficulty: 3, count: 80, gen() {
  const T = pick([3600, 7200, 86400]), r_Mm = randInt(5, 30);
  const r = r_Mm * 1e6;
  const v = parseFloat(((2 * Math.PI * r) / T).toFixed(0));
  const T_hrs = T === 3600 ? "1 hour" : T === 7200 ? "2 hours" : "24 hours";
  return {
    text: `A satellite orbits at radius ${r_Mm} × 10⁶ m with period ${T_hrs}. Find the orbital speed (to nearest m/s).`,
    correct: `${v} m/s`,
    distractors: [`${v + 1000} m/s`, `${Math.round(v / 2)} m/s`, `${v - 1000} m/s`]
  };
}});

// Gravitational field strength g = GM/r²  (conceptual)
add({ id: "gcse_ph_space_grav", level: GCSE, subject: "physics", category: PGCSE_SP, difficulty: 2, count: 60, gen() {
  const q = [
    ["What is the gravitational field strength at Earth's surface? (use g = 9.8 N/kg)", "9.8 N/kg"],
    ["What is the gravitational field strength on the Moon (approximately)?", "1.6 N/kg"],
    ["If you travel to a planet twice Earth's mass and same radius, g becomes?", "19.6 N/kg"],
    ["If you travel to a planet with twice Earth's radius and same mass, g becomes?", "2.45 N/kg"],
    ["If a person weighs 700 N on Earth (g = 10 N/kg), what is their weight on the Moon (g = 1.6 N/kg)?", "112 N"],
    ["A 60 kg astronaut is on the Moon (g = 1.6 N/kg). What is their weight?", "96 N"],
  ];
  const [question, ans] = pick(q);
  const allAns = ["9.8 N/kg", "1.6 N/kg", "19.6 N/kg", "2.45 N/kg", "112 N", "96 N", "700 N", "600 N"];
  return { text: question, correct: ans, distractors: shuffle(allAns.filter(a => a !== ans)).slice(0, 3) };
}});

// ─────────────────────────────────────────────────────────────────────────
// PHYSICS  A-LEVEL  (Edexcel / AQA, Years 12–13)  subject: "physics"
// ─────────────────────────────────────────────────────────────────────────
const PAL_MECH = "Mechanics";
const PAL_MAT  = "Materials";
const PAL_EL   = "Electricity";
const PAL_WAV  = "Waves & Optics";
const PAL_QM   = "Quantum Physics";
const PAL_NUC  = "Nuclear Physics";
const PAL_FLD  = "Fields";
const PAL_THM  = "Thermal Physics";

// Circular motion: a = v²/r = ω²r, F = mv²/r
add({ id: "alevel_ph_mech_circ", level: ALEVEL, subject: "physics", category: PAL_MECH, difficulty: 4, count: 150, gen() {
  const m = randInt(1, 10), r = randInt(2, 10), v = randInt(2, 10);
  const F = parseFloat((m * v * v / r).toFixed(2));
  if (F !== Math.floor(F)) return this.gen();
  return { text: `A ${m} kg object moves in a circle of radius ${r} m at ${v} m/s. Find the centripetal force.`, correct: `${F} N`, distractors: [`${F + m} N`, `${m * v / r} N`, `${F - 1} N`] };
}});

// Angular velocity ω = 2π/T
add({ id: "alevel_ph_mech_omega", level: ALEVEL, subject: "physics", category: PAL_MECH, difficulty: 3, count: 100, gen() {
  const T = pick([1, 2, 4, 5, 10]);
  const omega = parseFloat((2 * Math.PI / T).toFixed(2));
  return { text: `A wheel has period ${T} s. What is its angular velocity ω? (Give to 2 d.p., in rad/s)`, correct: `${omega} rad/s`, distractors: [`${(omega + 0.5).toFixed(2)} rad/s`, `${(2 * Math.PI * T).toFixed(2)} rad/s`, `${(omega - 0.5).toFixed(2)} rad/s`] };
}});

// SHM: a = −ω²x, T = 2π√(m/k) for spring
add({ id: "alevel_ph_mech_shm", level: ALEVEL, subject: "physics", category: PAL_MECH, difficulty: 4, count: 120, gen() {
  const k = pick([1, 4, 9, 16, 25, 36, 100]), m = randInt(1, 4);
  const T = parseFloat((2 * Math.PI * Math.sqrt(m / k)).toFixed(3));
  return {
    text: `A mass of ${m} kg is attached to a spring (k = ${k} N/m). Find the period of oscillation to 3 d.p.`,
    correct: `${T} s`,
    distractors: [`${parseFloat((T + 0.1).toFixed(3))} s`, `${parseFloat((2 * Math.PI * Math.sqrt(k / m)).toFixed(3))} s`, `${parseFloat((T - 0.1).toFixed(3))} s`]
  };
}});

// Projectile: time of flight (vertical: h = ½gt²)
add({ id: "alevel_ph_mech_proj", level: ALEVEL, subject: "physics", category: PAL_MECH, difficulty: 4, count: 100, gen() {
  const g = 10, t = pick([1, 2, 3, 4, 5]), h = 0.5 * g * t * t;
  return { text: `A projectile is launched horizontally from height ${h} m. How long does it take to reach the ground? (g = 10 m/s²)`, correct: `${t} s`, distractors: [`${t + 0.5} s`, `${t - 0.5} s`, `${Math.sqrt(h)} s`] };
}});

// Materials: stress = F/A, strain = ΔL/L, Young's modulus E = stress/strain
add({ id: "alevel_ph_mat_stress", level: ALEVEL, subject: "physics", category: PAL_MAT, difficulty: 3, count: 120, gen() {
  const F = pick([100, 200, 500, 1000, 5000]), A = pick([1e-4, 2e-4, 5e-4, 1e-3]);
  const stress = F / A;
  const A_str = A < 1e-3 ? `${A * 1e4} × 10⁻⁴ m²` : `${A * 1e3} × 10⁻³ m²`;
  return {
    text: `A wire carries a force of ${F} N and has cross-sectional area ${A_str}. Find the stress in Pa.`,
    correct: `${stress.toExponential(1)} Pa`,
    distractors: [`${(stress * 2).toExponential(1)} Pa`, `${(F * A).toExponential(1)} Pa`, `${(stress / 2).toExponential(1)} Pa`]
  };
}});

// Young's modulus E = σ/ε
add({ id: "alevel_ph_mat_young", level: ALEVEL, subject: "physics", category: PAL_MAT, difficulty: 4, count: 100, gen() {
  const E_GPa = pick([70, 100, 130, 200, 210]); // GPa - realistic for metals
  const stress_MPa = randInt(100, 400);
  const strain = parseFloat((stress_MPa / (E_GPa * 1000)).toFixed(6));
  return {
    text: `A material has Young's modulus ${E_GPa} GPa. Under stress ${stress_MPa} MPa, what is the strain?`,
    correct: `${strain}`,
    distractors: [`${parseFloat((strain * 2).toFixed(6))}`, `${parseFloat((stress_MPa * E_GPa).toFixed(6))}`, `${parseFloat((strain / 2).toFixed(6))}`]
  };
}});

// Electricity: resistivity ρ = RA/L
add({ id: "alevel_ph_elec_resistivity", level: ALEVEL, subject: "physics", category: PAL_EL, difficulty: 4, count: 120, gen() {
  const rho = pick([1e-7, 2e-8, 5e-8, 1e-6]); // Ω·m
  const L = randInt(1, 5), A = pick([1e-6, 2e-6, 4e-6, 5e-6]);
  const R = parseFloat((rho * L / A).toFixed(4));
  const rhoStr = rho.toExponential(0);
  const AStr = A.toExponential(0);
  return {
    text: `A wire has resistivity ${rhoStr} Ω·m, length ${L} m, cross-sectional area ${AStr} m². Find its resistance.`,
    correct: `${R} Ω`,
    distractors: [`${parseFloat((R * 2).toFixed(4))} Ω`, `${parseFloat((R / 2).toFixed(4))} Ω`, `${parseFloat((R + 0.01).toFixed(4))} Ω`]
  };
}});

// Capacitance: C = Q/V, E = ½CV²
add({ id: "alevel_ph_elec_cap_charge", level: ALEVEL, subject: "physics", category: PAL_EL, difficulty: 3, count: 120, gen() {
  const C_uF = pick([10, 20, 50, 100, 200, 470, 1000]), V = pick([5, 10, 12, 24, 50]);
  const C = C_uF * 1e-6; const Q = C * V;
  return { text: `A ${C_uF} μF capacitor is charged to ${V} V. Find the charge stored.`, correct: `${Q.toFixed(4)} C`, distractors: [`${(Q * 2).toFixed(4)} C`, `${(C_uF * V).toFixed(4)} C`, `${(Q / 2).toFixed(4)} C`] };
}});
add({ id: "alevel_ph_elec_cap_energy", level: ALEVEL, subject: "physics", category: PAL_EL, difficulty: 4, count: 100, gen() {
  const C_uF = pick([10, 20, 50, 100, 200]), V = pick([10, 20, 50, 100]);
  const C = C_uF * 1e-6; const E = 0.5 * C * V * V;
  return { text: `A ${C_uF} μF capacitor is charged to ${V} V. Find the energy stored.`, correct: `${E.toFixed(4)} J`, distractors: [`${(C * V).toFixed(4)} J`, `${(E * 2).toFixed(4)} J`, `${(E / 2).toFixed(4)} J`] };
}});

// Waves: Young's double slit: fringe spacing w = λD/s
add({ id: "alevel_ph_wav_ydse", level: ALEVEL, subject: "physics", category: PAL_WAV, difficulty: 4, count: 100, gen() {
  const lam_nm = pick([400, 500, 550, 600, 650, 700]);
  const D_m = pick([1, 1.5, 2, 2.5, 3]), s_mm = pick([0.2, 0.4, 0.5, 1]);
  const lam = lam_nm * 1e-9, s = s_mm * 1e-3;
  const w = parseFloat((lam * D_m / s * 1e3).toFixed(2)); // mm
  return {
    text: `In Young's double slit experiment, λ = ${lam_nm} nm, slit separation = ${s_mm} mm, screen distance = ${D_m} m. Find the fringe spacing in mm.`,
    correct: `${w} mm`,
    distractors: [`${(w * 2).toFixed(2)} mm`, `${(w / 2).toFixed(2)} mm`, `${(w + 0.5).toFixed(2)} mm`]
  };
}});

// Diffraction grating: nλ = d sin θ
add({ id: "alevel_ph_wav_grating", level: ALEVEL, subject: "physics", category: PAL_WAV, difficulty: 4, count: 100, gen() {
  const N = pick([300, 400, 500, 600]); // lines/mm
  const d = 1e-3 / N; // m
  const lam_nm = pick([400, 500, 550, 600, 650]);
  const lam = lam_nm * 1e-9;
  const n = 1; const sinT = n * lam / d;
  if (sinT > 1) return this.gen();
  const theta = parseFloat((Math.asin(sinT) * 180 / Math.PI).toFixed(1));
  return {
    text: `Light of wavelength ${lam_nm} nm is incident on a diffraction grating with ${N} lines/mm. Find the angle of the first-order maximum.`,
    correct: `${theta}°`,
    distractors: [`${(theta + 2).toFixed(1)}°`, `${(theta - 2).toFixed(1)}°`, `${(theta * 2).toFixed(1)}°`]
  };
}});

// Quantum: photoelectric effect E = hf − φ
add({ id: "alevel_ph_qm_photo", level: ALEVEL, subject: "physics", category: PAL_QM, difficulty: 4, count: 120, gen() {
  const h = 6.63e-34; const f_PHz = pick([0.8, 1.0, 1.2, 1.5, 2.0]); // 10^15 Hz
  const phi_eV = pick([1, 2, 3, 4]); // work function in eV
  const phi = phi_eV * 1.6e-19;
  const Ek = h * f_PHz * 1e15 - phi;
  if (Ek <= 0) return this.gen();
  const Ek_eV = parseFloat((Ek / 1.6e-19).toFixed(2));
  return {
    text: `A photon with frequency ${f_PHz} × 10¹⁵ Hz hits a metal with work function ${phi_eV} eV. Find the max kinetic energy of the emitted electron in eV. (h = 6.63 × 10⁻³⁴ J·s)`,
    correct: `${Ek_eV} eV`,
    distractors: [`${(Ek_eV + 1).toFixed(2)} eV`, `${(Ek_eV - 0.5).toFixed(2)} eV`, `${phi_eV} eV`]
  };
}});

// de Broglie wavelength λ = h/p = h/(mv)
add({ id: "alevel_ph_qm_debroglie", level: ALEVEL, subject: "physics", category: PAL_QM, difficulty: 4, count: 100, gen() {
  const h = 6.63e-34;
  const m_me = randInt(1, 5); // multiples of electron mass
  const m = m_me * 9.11e-31;
  const v = pick([1e6, 2e6, 5e6]);
  const lam = parseFloat((h / (m * v)).toExponential(2));
  const lam_pm = parseFloat((h / (m * v) * 1e12).toFixed(1));
  return {
    text: `A particle of mass ${m_me} × 9.11 × 10⁻³¹ kg moves at ${v.toExponential(0)} m/s. Find its de Broglie wavelength in pm. (h = 6.63 × 10⁻³⁴ J·s)`,
    correct: `${lam_pm} pm`,
    distractors: [`${(lam_pm * 2).toFixed(1)} pm`, `${(lam_pm / 2).toFixed(1)} pm`, `${(lam_pm + 50).toFixed(1)} pm`]
  };
}});

// Nuclear: mass-energy E = mc²
add({ id: "alevel_ph_nuc_emc2", level: ALEVEL, subject: "physics", category: PAL_NUC, difficulty: 4, count: 80, gen() {
  const m_u = parseFloat((randInt(1, 10) * 0.001).toFixed(3)); // fraction of u
  const m_kg = m_u * 1.66e-27;
  const c = 3e8; const E = m_kg * c * c;
  const E_MeV = parseFloat((E / 1.6e-13).toFixed(1));
  return {
    text: `A mass defect of ${m_u} u is converted to energy. Find the energy released in MeV. (1 u = 1.66 × 10⁻²⁷ kg, c = 3 × 10⁸ m/s)`,
    correct: `${E_MeV} MeV`,
    distractors: [`${(E_MeV + 10).toFixed(1)} MeV`, `${(E_MeV / 2).toFixed(1)} MeV`, `${(E_MeV * 2).toFixed(1)} MeV`]
  };
}});

// Fields: Coulomb's law F = kq₁q₂/r²
add({ id: "alevel_ph_fld_coulomb", level: ALEVEL, subject: "physics", category: PAL_FLD, difficulty: 4, count: 100, gen() {
  const k = 9e9, q1 = pick([1e-6, 2e-6, 3e-6]), q2 = pick([1e-6, 2e-6, 3e-6]), r = randInt(1, 5) * 0.1;
  const F = k * q1 * q2 / (r * r);
  const q1_uC = (q1 * 1e6).toFixed(0), q2_uC = (q2 * 1e6).toFixed(0);
  return {
    text: `Two charges of ${q1_uC} μC and ${q2_uC} μC are ${(r * 100).toFixed(0)} cm apart. Find the force between them. (k = 9 × 10⁹ N m² C⁻²)`,
    correct: `${F.toFixed(2)} N`,
    distractors: [`${(F * 2).toFixed(2)} N`, `${(F / 2).toFixed(2)} N`, `${(F + 1).toFixed(2)} N`]
  };
}});

// Gravitational field: g = GM/r²
add({ id: "alevel_ph_fld_grav", level: ALEVEL, subject: "physics", category: PAL_FLD, difficulty: 4, count: 80, gen() {
  const G = 6.67e-11, M_E = 6e24, R_E = 6.4e6;
  const mult = pick([1, 2, 4]); // multiples of Earth radius
  const r = R_E * mult;
  const g = parseFloat((G * M_E / (r * r)).toFixed(2));
  return {
    text: `Calculate the gravitational field strength at ${mult === 1 ? "Earth's surface" : `${mult}R_E` } from Earth's centre. (G = 6.67 × 10⁻¹¹, M_E = 6 × 10²⁴ kg, R_E = 6.4 × 10⁶ m)`,
    correct: `${g} N/kg`,
    distractors: [`${(g * mult * mult).toFixed(2)} N/kg`, `${(g + 1).toFixed(2)} N/kg`, `${(g / 2).toFixed(2)} N/kg`]
  };
}});

// Thermal: ideal gas pV = nRT
add({ id: "alevel_ph_thm_gas", level: ALEVEL, subject: "physics", category: PAL_THM, difficulty: 4, count: 100, gen() {
  const R = 8.31, n = pick([1, 2, 3, 4, 5]), T = pick([273, 300, 350, 400, 500]), V_L = randInt(2, 20);
  const V = V_L * 1e-3, p = parseFloat((n * R * T / V).toFixed(0));
  return {
    text: `An ideal gas occupies ${V_L} L at ${T} K. There are ${n} mol. Find the pressure. (R = 8.31 J mol⁻¹ K⁻¹)`,
    correct: `${p} Pa`,
    distractors: [`${p + 1000} Pa`, `${Math.round(p / 2)} Pa`, `${p - 500} Pa`]
  };
}});

// Thermal: internal energy and specific heat
add({ id: "alevel_ph_thm_shc", level: ALEVEL, subject: "physics", category: PAL_THM, difficulty: 3, count: 100, gen() {
  const m = randInt(1, 5), dT = pick([10, 20, 30, 50, 100]);
  const c = pick([386, 447, 900, 2090, 4200]); // c for copper/iron/Al/ethanol/water
  const materials = { 386: "copper", 447: "iron", 900: "aluminium", 2090: "ethanol", 4200: "water" };
  const Q = m * c * dT;
  return { text: `Find the energy needed to heat ${m} kg of ${materials[c]} (c = ${c} J/kg K) by ${dT} K.`, correct: `${Q} J`, distractors: [`${Q + c} J`, `${m * dT} J`, `${Q * 2} J`] };
}});


// ─────────────────────────────────────────────────────────────────────────
// EXPAND templates → question rows, then write output
// ─────────────────────────────────────────────────────────────────────────

function expand(template) {
  const { id, level, subject = "maths", category, difficulty, count, gen } = template;
  const seen = new Set();
  const rows = [];
  let attempts = 0;
  const target = Math.ceil(count * SCALE);
  while (rows.length < target && attempts < target * 30) {
    attempts++;
    try {
      const raw = gen.call(template);
      if (!raw) continue;
      const textKey = String(raw.text).toLowerCase().replace(/\s+/g, " ").trim();
      if (seen.has(textKey)) continue;
      seen.add(textKey);
      const { options, correct } = buildOptions(raw.correct, raw.distractors ?? [], raw.opts ?? {});
      const n = String(rows.length + 1).padStart(4, "0");
      rows.push({ id: `${id}_${n}`, level, subject, category, text: raw.text, options, correct, difficulty });
    } catch (_) { /* skip bad generations silently */ }
  }
  return rows;
}

const ALL = T.flatMap(expand);

const fileLines = [
  "// AUTO-GENERATED by scripts/generateQuestions.mjs — DO NOT EDIT BY HAND.",
  "// Regenerate with:  node scripts/generateQuestions.mjs   (tune SEED / SCALE there)",
  "// Pure data. No logic. Levels: ks2, ks3, gcse, alevel; subjects: maths, physics.",
  "// `category` = topic strand used for adaptivity. `subject` drives subject-switcher in UI.",
  "export const QUESTIONS = [",
  ALL.map((q) => "  " + JSON.stringify(q)).join(",\n"),
  "];",
];

writeFileSync(OUT, fileLines.join("\n") + "\n");
console.log(`✓ Wrote ${ALL.length} questions to ${OUT}`);

// Also write the backend JSON file so FastAPI can serve questions without
// bundling them into the client. This is the canonical source at runtime.
writeFileSync(OUT_JSON, JSON.stringify(ALL));
console.log(`✓ Wrote ${ALL.length} questions to ${OUT_JSON}`);

// Summary by subject/level
const tally = {};
for (const q of ALL) {
  const key = `${q.subject}/${q.level}`;
  tally[key] = (tally[key] ?? 0) + 1;
}
console.log("\nBreakdown:");
for (const [k, v] of Object.entries(tally).sort()) {
  console.log(`  ${k.padEnd(22)}: ${v}`);
}
