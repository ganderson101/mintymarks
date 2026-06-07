// Adaptation Engine -- pure functions only. No UI, no module-level state.
// `rng` is injected everywhere randomness is used so behaviour is testable.

// -- Timing quality -----------------------------------------------------------
// Thresholds (ms). Tune as real user data accumulates.
const FAST_MS = 8_000;  // < 8 s = fast response
const SLOW_MS = 20_000; // > 20 s = slow response

// Quality weight applied to correct answers based on response speed.
// Wrong answers always contribute 0 to weightedCorrect.
//
//  fast + correct   -> 1.2  (confident mastery -- relax review pressure)
//  medium + correct -> 1.0  (standard)
//  slow + correct   -> 0.8  (fragile recall -- review sooner)
//  any  + wrong     -> 0.0  (no credit; fast/wrong = misconception tracked in SRS separately)
function answerQuality(isCorrect, timeTakenMs) {
  if (!isCorrect) return 0;
  if (!timeTakenMs || timeTakenMs <= 0) return 1.0; // no timing data -- neutral
  if (timeTakenMs < FAST_MS) return 1.2;
  if (timeTakenMs > SLOW_MS) return 0.8;
  return 1.0;
}

// Returns a NEW performance object (never mutates the input).
// Tracks both raw correct count and timing-weighted correct (weightedCorrect).
export function recordAnswer(perf, topic, isCorrect, timeTakenMs = 0) {
  const prev = perf.byTopic[topic] || { attempts: 0, correct: 0, weightedCorrect: 0 };
  const quality = answerQuality(isCorrect, timeTakenMs);
  // Legacy records without weightedCorrect fall back to raw correct count.
  const prevWeighted = prev.weightedCorrect !== undefined ? prev.weightedCorrect : prev.correct;
  return {
    byTopic: {
      ...perf.byTopic,
      [topic]: {
        attempts:        prev.attempts + 1,
        correct:         prev.correct + (isCorrect ? 1 : 0),
        weightedCorrect: prevWeighted + quality,
      },
    },
  };
}

// -- Weakness computation -----------------------------------------------------
// Uses Laplace (add-one) smoothing so single attempts do not dominate selection.
//
// smoothed_accuracy = (weightedCorrect + 1) / (attempts + 2)
// weakness          = 1 - smoothed_accuracy  in [0, 1]
//
// Effect vs raw accuracy:
//   1/1 correct -> smoothed accuracy 2/3 (0.67) rather than 1.0 -- avoids over-reward
//   0/1 correct -> smoothed accuracy 1/3 (0.33) rather than 0.0 -- avoids over-punish
//   Untried topics -> weakness 1 (highest priority, same as before)
export function computeWeakness(perf, allTopics) {
  const map = {};
  for (const topic of allTopics) {
    const t = perf.byTopic[topic];
    if (!t || t.attempts === 0) {
      map[topic] = 1; // never tried -> highest priority
    } else {
      const weighted = t.weightedCorrect !== undefined ? t.weightedCorrect : t.correct;
      const smoothedAccuracy = (weighted + 1) / (t.attempts + 2);
      map[topic] = Math.max(0, Math.min(1, 1 - smoothedAccuracy));
    }
  }
  return map;
}

// -- Confidence-aware weakness DECLARATION ------------------------------------
// computeWeakness (above) is a Laplace point estimate. It is the right signal for
// *review selection* (be optimistic about practising uncertain topics), but it is
// the wrong signal for *declaring* a weakness to the child: on a tiny sample it
// tips a child into "weak" on almost no evidence -- a single correct answer maps
// to weakness 0.333, which a 0.33 flag threshold then reports as a weak topic.
// Telling a child who scored 100% that they are "weak" is dishonest discouragement.
//
// Before we declare (show / act on) a weakness we additionally require statistical
// confidence that a genuine gap exists, using the lower bound of the Wilson score
// interval on the child's ERROR rate. We only declare weakness when we are
// confident (one-sided ~95%) the true error rate is above zero. A child who has
// only ever answered correctly in a topic is therefore never declared "weak" there,
// while even one genuine miss is still caught. Raw counts are used here (actual
// successes / failures), not the timing-weighted total, because confidence is about
// how much evidence we have, not how fast the child was.
const WILSON_Z = 1.645; // one-sided ~95% confidence

// Lower bound of the Wilson score interval for a proportion (successes / n).
// Returns 0 for n <= 0 and is clamped to [0, 1].
export function wilsonLowerBound(successes, n, z = WILSON_Z) {
  if (n <= 0) return 0;
  const phat = successes / n;
  const z2 = z * z;
  const denom = 1 + z2 / n;
  const center = phat + z2 / (2 * n);
  const margin = z * Math.sqrt((phat * (1 - phat) + z2 / (4 * n)) / n);
  return Math.max(0, Math.min(1, (center - margin) / denom));
}

// True only when we are statistically confident (Wilson lower bound of the error
// rate > 0) that the topic is a genuine weakness rather than an unlucky small
// sample. `correct` / `attempts` are raw counts.
export function isConfidentWeakness(correct, attempts) {
  if (!attempts || attempts <= 0) return false; // no evidence -> never declare weak
  const errors = attempts - correct;
  return wilsonLowerBound(errors, attempts) > 0;
}

// -- Topic selection ----------------------------------------------------------

// Uniform topic pick -- no history bias (used for "random" mode).
export function selectTopicUniform(allTopics, rng = Math.random) {
  if (allTopics.length === 0) return null;
  return allTopics[Math.floor(rng() * allTopics.length)];
}

// 70% weakness-biased pick, 30% pure random. rng() -> [0, 1).
export function selectTopic(weaknessMap, allTopics, rng = Math.random) {
  if (allTopics.length === 0) return null;

  if (rng() < 0.7) {
    const total = allTopics.reduce((s, t) => s + weaknessMap[t], 0);
    if (total > 0) {
      let r = rng() * total;
      for (const t of allTopics) {
        r -= weaknessMap[t];
        if (r <= 0) return t;
      }
      return allTopics[allTopics.length - 1]; // float safety net
    }
  }
  return allTopics[Math.floor(rng() * allTopics.length)];
}
