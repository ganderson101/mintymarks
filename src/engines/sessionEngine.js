// Session Engine — flow controller. UI-free, fully testable headless.
// Owns session state; delegates category choice to the Adaptation Engine and
// question storage to the Question Engine. Session length and level come from config.
import { computeWeakness, recordAnswer, selectTopic, selectTopicUniform } from "./adaptationEngine.js";

const WEAK_THRESHOLD = 0.33; // categories at/above this weakness are flagged

export class SessionEngine {
  constructor({ config, questionEngine, rng = Math.random }) {
    if (!config || typeof config.length !== "number") {
      throw new Error("SessionEngine requires config.length (not hardcoded)");
    }
    this.config = config; // { length, level?: string, categories?: string[], difficulties?: number[] }
    this.qe = questionEngine;
    this.rng = rng;
    this.level = config.level ?? null;
    this.difficulties = config.difficulties ?? null; // null = no filter (all difficulties)

    this.askedIds = [];
    this.answers = [];
    this.performance = { byTopic: {} };
    this.current = null;
    this.status = "active"; // "active" | "complete"
  }

  get categories() {
    return this.config.categories || this.qe.getCategories(this.level);
  }

  // Pick + set the next question. Returns it, or null when the session ends.
  next() {
    if (this.answers.length >= this.config.length) {
      this.status = "complete";
      this.current = null;
      return null;
    }

    const topicMode = this.config.topicMode ?? "adaptive";
    const weakness = topicMode === "random" ? null : computeWeakness(this.performance, this.categories);
    let pool = [];
    let guard = 0;
    while (pool.length === 0 && guard++ < 10) {
      const category = topicMode === "random"
        ? selectTopicUniform(this.categories, this.rng)
        : selectTopic(weakness, this.categories, this.rng);
      pool = this.qe.getAvailableByCategory(category, this.askedIds, this.level, this.difficulties);
    }
    if (pool.length === 0) pool = this.qe.getAvailable(this.askedIds, this.level, this.difficulties);
    if (pool.length === 0) {
      this.status = "complete";
      this.current = null;
      return null;
    }

    this.current = pool[Math.floor(this.rng() * pool.length)];
    return this.current;
  }

  // selectedKey: chosen option letter. timeTakenMs: ms spent on this question (optional).
  submit(selectedKey, timeTakenMs = 0) {
    if (!this.current || this.status === "complete") return;
    const q = this.current;
    const isCorrect = selectedKey === q.correct;
    this.answers.push({
      questionId: q.id,
      category: q.category,
      selected: selectedKey,
      correct: q.correct,
      isCorrect,
      timeTakenMs
    });
    this.askedIds.push(q.id);
    this.performance = recordAnswer(this.performance, q.category, isCorrect);
  }

  isComplete() {
    return this.status === "complete" || this.answers.length >= this.config.length;
  }

  getResults() {
    const correct = this.answers.filter((a) => a.isCorrect).length;
    // Report weakness only for categories actually attempted this session.
    const attempted = Object.keys(this.performance.byTopic);
    const weakness = computeWeakness(this.performance, attempted);
    const weakCategories = Object.entries(weakness)
      .filter(([, w]) => w >= WEAK_THRESHOLD)
      .sort((a, b) => b[1] - a[1])
      .map(([category, w]) => ({ category, weakness: w }));
    return {
      score: correct,
      total: this.answers.length,
      percent: this.answers.length ? Math.round((correct / this.answers.length) * 100) : 0,
      weakCategories,
      answers: this.answers, // full per-answer rows (used for saving + timing display)
      performance: this.performance
    };
  }
}
