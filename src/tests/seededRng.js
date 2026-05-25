// Tiny deterministic RNG for tests (mulberry32). Returns a function -> [0, 1).
export function seededRng(seed = 1) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// A scripted RNG that returns each value in sequence, then loops.
export function scriptedRng(values) {
  let i = 0;
  return function () {
    const v = values[i % values.length];
    i += 1;
    return v;
  };
}
