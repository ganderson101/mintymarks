// Question Engine — data-only. Storage + lookups. No flow, no scoring, no RNG policy.
// Questions carry a `level` (e.g. "ks3", "gcse", "alevel"), a `subject` ("maths"/"physics"),
// and a `category` (the topic strand used for adaptivity).
//
// NOTE: The question bank is NO LONGER imported statically. Callers must fetch
// questions from the API (GET /api/questions?level=...&subject=...) and pass the
// result as the `bank` argument. This keeps the 4MB question data out of the
// client bundle entirely.

// Maps human-readable tier names to difficulty integers.
// "hard" covers 3 and 4 to handle both ks3/gcse (max 3) and alevel (3-4).
// ks2 only has 1 and 2, so "hard" will not appear for ks2 in getAvailableTiers().
export const DIFFICULTY_TIERS = {
  easy:   [1],
  medium: [2],
  hard:   [3, 4],
};

// subject: "maths" | "physics" | null (null = all subjects, for backwards compat)
// bank: question array fetched from GET /api/questions — required, no default.
export function createQuestionEngine(subject = null, bank) {
  if (!bank || !Array.isArray(bank)) {
    throw new Error("createQuestionEngine: bank is required (fetch from /api/questions first)");
  }
  const pool = subject ? bank.filter((q) => q.subject === subject) : bank;
  const inLevel = (q, level) => !level || q.level === level;
  // difficulties: number[] from DIFFICULTY_TIERS, or null/undefined to skip filter
  const inDifficulties = (q, difficulties) => !difficulties || difficulties.includes(q.difficulty);
  return {
    getLevels() {
      return [...new Set(pool.map((q) => q.level))];
    },
    // categories within a level (or across all levels if level is omitted)
    getCategories(level) {
      return [...new Set(pool.filter((q) => inLevel(q, level)).map((q) => q.category))];
    },
    // Returns which tier names ("easy"/"medium"/"hard") have questions for the given level.
    getAvailableTiers(level) {
      const diffs = new Set(pool.filter((q) => inLevel(q, level)).map((q) => q.difficulty));
      return Object.entries(DIFFICULTY_TIERS)
        .filter(([, nums]) => nums.some((n) => diffs.has(n)))
        .map(([tier]) => tier);
    },
    getById(id) {
      return pool.find((q) => q.id === id) || null;
    },
    getAvailableByCategory(category, excludeIds = [], level, difficulties) {
      return pool.filter(
        (q) =>
          q.category === category &&
          inLevel(q, level) &&
          inDifficulties(q, difficulties) &&
          !excludeIds.includes(q.id)
      );
    },
    getAvailable(excludeIds = [], level, difficulties) {
      return pool.filter(
        (q) => inLevel(q, level) && inDifficulties(q, difficulties) && !excludeIds.includes(q.id)
      );
    },
  };
}
