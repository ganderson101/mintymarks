// Session Engine -- flow controller. UI-free, fully testable headless.
// Owns session state; delegates category choice to the Adaptation Engine and
// question storage to the Question Engine. Session length and level come from config.
import { computeWeakness, recordAnswer, selectTopic, selectTopicUniform } from "./adaptationEngine.js";

const WEAK_THRESHOLD = 0.33; // categories at/above this weakness are flagged

// -- Dynamic difficulty constants ---------------------------------------------
const STREAK_UP  = 3; // consecutive correct answers before stepping difficulty up
const DIFF_MIN   = 1;
const DIFF_MAX   = 4;
const DIFF_START = 2; // medium -- baseline when user selects "all"

export class SessionEngine {
  constructor({ config, questionEngine, rng = Math.random }) {
    if (!config || typeof config.length !== "number") {
      throw new Error("SessionEngine requires config.length (not hardcoded)");
    }
    this.config = config; // { length, level?, categories?, difficulties?, topicMode?, initialPerformance? }
    this.qe = questionEngine;
    this.rng = rng;
    this.level = config.level !== undefined ? config.level : null;
    this.difficulties = config.difficulties !== undefined ? config.difficulties : null;

    this.askedIds = [];
    this.answers  = [];

    // -- Cross-session seeding ------------------------------------------------
    // config.initialPerformance = { byTopic: { category: { attempts, correct } } }
    // Fetched from /progress/topics before the session starts. Makes "Weak topics"
    // mode useful from question 1 rather than starting blind every session.
    this.performance = config.initialPerformance || { byTopic: {} };

    // -- Dynamic difficulty tracking ------------------------------------------
    // Only active when user selects "All" difficulty (this.difficulties === null).
    // topicDifficulty: current difficulty number per category (DIFF_MIN..DIFF_MAX)
    // topicStreak:     consecutive correct answers per category
    this.topicDifficulty = {};
    this.topicStreak     = {};

    this.current = null;
    this.status  = "active"; // "active" | "complete"
  }

  get categories() {
    return this.config.categories || this.qe.getCategories(this.level);
  }

  // Returns the effective difficulties array for a given topic.
  // Dynamic difficulty only activates when user chose "all" (difficulties === null).
  _effectiveDifficulties(category) {
    if (this.difficulties !== null) return this.difficulties; // user pinned a tier
    const d = this.topicDifficulty[category];
    return d !== undefined ? [d] : [DIFF_START];
  }

  // Pick + set the next question. Returns it, or null when the session ends.
  next() {
    if (this.answers.length >= this.config.length) {
      this.status  = "complete";
      this.current = null;
      return null;
    }

    const topicMode = this.config.topicMode !== undefined ? this.config.topicMode : "adaptive";
    const weakness  = topicMode === "random" ? null : computeWeakness(this.performance, this.categories);
    let pool  = [];
    let guard = 0;
    while (pool.length === 0 && guard++ < 10) {
      const category = topicMode === "random"
        ? selectTopicUniform(this.categories, this.rng)
        : selectTopic(weakness, this.categories, this.rng);

      const diffs = this._effectiveDifficulties(category);
      pool = this.qe.getAvailableByCategory(category, this.askedIds, this.level, diffs);

      // Dynamic difficulty fallback: if no questions at the stepped difficulty,
      // widen to the user-allowed range (null = all).
      if (pool.length === 0 && diffs !== this.difficulties) {
        pool = this.qe.getAvailableByCategory(category, this.askedIds, this.level, this.difficulties);
      }
    }
    if (pool.length === 0) pool = this.qe.getAvailable(this.askedIds, this.level, this.difficulties);
    if (pool.length === 0) {
      this.status  = "complete";
      this.current = null;
      return null;
    }

    this.current = pool[Math.floor(this.rng() * pool.length)];
    return this.current;
  }

  // selectedKey: chosen option letter. timeTakenMs: ms spent on this question (optional).
  submit(selectedKey, timeTakenMs = 0) {
    if (!this.current || this.status === "complete") return;
    const q         = this.current;
    const isCorrect = selectedKey === q.correct;

    this.answers.push({
      questionId: q.id,
      category:   q.category,
      selected:   selectedKey,
      correct:    q.correct,
      isCorrect,
      timeTakenMs,
    });
    this.askedIds.push(q.id);

    // Pass timeTakenMs so Bayesian weakness uses timing quality weights.
    this.performance = recordAnswer(this.performance, q.category, isCorrect, timeTakenMs);

    // -- Dynamic difficulty update --------------------------------------------
    // Only runs when user has selected "all" difficulties.
    if (this.difficulties === null) {
      const category    = q.category;
      const currentDiff = this.topicDifficulty[category] !== undefined ? this.topicDifficulty[category] : DIFF_START;
      const streak      = this.topicStreak[category]     !== undefined ? this.topicStreak[category]     : 0;

      if (isCorrect) {
        const newStreak = streak + 1;
        if (newStreak >= STREAK_UP) {
          this.topicDifficulty[category] = Math.min(DIFF_MAX, currentDiff + 1);
          this.topicStreak[category]     = 0;
        } else {
          this.topicStreak[category] = newStreak;
        }
      } else {
        this.topicDifficulty[category] = Math.max(DIFF_MIN, currentDiff - 1);
        this.topicStreak[category]     = 0;
      }
    }
  }

  isComplete() {
    return this.status === "complete" || this.answers.length >= this.config.length;
  }

  getResults() {
    const correct = this.answers.filter((a) => a.isCorrect).length;
    // Report weakness only for categories actually attempted this session.
    const attempted = Object.keys(this.performance.byTopic);
    const weakness  = computeWeakness(this.performance, attempted);
    const weakCategories = Object.entries(weakness)
      .filter(([, w]) => w >= WEAK_THRESHOLD)
      .sort((a, b) => b[1] - a[1])
      .map(([category, w]) => ({ category, weakness: w }));
    return {
      score:           correct,
      total:           this.answers.length,
      percent:         this.answers.length ? Math.round((correct / this.answers.length) * 100) : 0,
      weakCategories,
      answers:         this.answers,
      performance:     this.performance,
      topicDifficulty: Object.assign({}, this.topicDifficulty),
    };
  }
}
