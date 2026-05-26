// SRS Engine — pure SM-2 functions. No side effects, no API calls.
// The backend is authoritative for persisted SRS state; this module is used
// client-side to check isDue and compute display metadata (days until next review).
//
// SM-2 at topic level (not card level):
//   - accuracy (0-1) maps to quality (0-5)
//   - timing adjusts quality up/down before the SM-2 calculation
//   - quality < 3 -> reset interval, lower ease factor
//   - quality >= 3 -> grow interval by ease factor, adjust ease factor
//
// The backend mirrors this logic in POST /progress/srs.

const FAST_SEC = 8;   // avg seconds/question threshold for "fast" answers
const SLOW_SEC = 20;  // avg seconds/question threshold for "slow" answers

/**
 * Compute the next SM-2 state for a topic given session performance.
 *
 * @param {number} intervalDays - current interval (days)
 * @param {number} easeFactor   - current ease factor (1.3 - 2.5+)
 * @param {number} accuracy     - fraction correct this session for this topic (0-1)
 * @param {number|null} avgTimeSec - average seconds per question for this topic
 * @returns {{ intervalDays, easeFactor, nextDue: Date }}
 */
export function sm2Update(intervalDays, easeFactor, accuracy, avgTimeSec = null) {
  let quality = accuracy * 5.0;

  // Timing signal: fast+correct = confident, slow+correct = fragile recall
  if (avgTimeSec !== null) {
    if (avgTimeSec < FAST_SEC)  quality = Math.min(5.0, quality + 0.3);
    if (avgTimeSec > SLOW_SEC)  quality = Math.max(0.0, quality - 0.5);
  }

  let newInterval, newEase;
  if (quality < 3.0) {
    // Failed: reset to 1 day, reduce ease
    newInterval = 1;
    newEase     = Math.max(1.3, easeFactor - 0.2);
  } else {
    // Passed: grow interval, adjust ease
    newInterval = Math.max(1, Math.round(intervalDays * easeFactor));
    newEase     = Math.max(1.3, easeFactor + 0.1 - (5.0 - quality) * 0.08);
  }

  const nextDue = new Date(Date.now() + newInterval * 24 * 60 * 60 * 1000);
  return {
    intervalDays: newInterval,
    easeFactor:   Math.round(newEase * 100) / 100,
    nextDue,
  };
}

/** True if the topic is due for review now (nextDue is in the past). */
export function isDue(nextDue) {
  return new Date(nextDue) <= new Date();
}

/** Human-readable "due in X days" / "overdue by X days" string. */
export function dueLabel(nextDue) {
  const diff = Math.round((new Date(nextDue) - Date.now()) / (1000 * 60 * 60 * 24));
  if (diff <= 0) return diff === 0 ? "due today" : `overdue by ${-diff}d`;
  return diff === 1 ? "due tomorrow" : `due in ${diff}d`;
}

export const DEFAULT_SRS = { intervalDays: 1, easeFactor: 2.5 };
