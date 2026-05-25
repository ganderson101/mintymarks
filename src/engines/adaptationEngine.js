// Adaptation Engine — pure functions only. No UI, no module-level state.
// `rng` is injected everywhere randomness is used so behaviour is testable.

// Returns a NEW performance object (never mutates the input).
export function recordAnswer(perf, topic, isCorrect) {
  const prev = perf.byTopic[topic] || { attempts: 0, correct: 0 };
  return {
    byTopic: {
      ...perf.byTopic,
      [topic]: {
        attempts: prev.attempts + 1,
        correct: prev.correct + (isCorrect ? 1 : 0)
      }
    }
  };
}

// Weakness map { topic: 0..1 }. Untried topics default to 1 (prioritise unknowns).
export function computeWeakness(perf, allTopics) {
  const map = {};
  for (const topic of allTopics) {
    const t = perf.byTopic[topic];
    map[topic] = !t || t.attempts === 0 ? 1 : 1 - t.correct / t.attempts;
  }
  return map;
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
