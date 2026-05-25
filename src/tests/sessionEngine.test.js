import { describe, it, expect } from "vitest";
import { SessionEngine } from "../engines/sessionEngine.js";
import { createQuestionEngine } from "../engines/questionEngine.js";
import { seededRng } from "./seededRng.js";

function newSession(overrides = {}) {
  return new SessionEngine({
    config: { length: 6, categories: null, ...overrides },
    questionEngine: createQuestionEngine(),
    rng: seededRng(42),
  });
}

function runSession(s, pick) {
  s.next();
  while (!s.isComplete()) {
    s.submit(pick(s.current));
    if (!s.isComplete()) s.next();
  }
  return s.getResults();
}

describe("SessionEngine config", () => {
  it("throws without a numeric length (length is never hardcoded)", () => {
    expect(
      () =>
        new SessionEngine({
          config: {},
          questionEngine: createQuestionEngine(),
        }),
    ).toThrow();
  });

  it("respects configurable session length", () => {
    const s = newSession({ length: 4 });
    const r = runSession(s, () => "A");
    expect(r.total).toBe(4);
  });
});

describe("SessionEngine full loop", () => {
  it("scores a perfect run", () => {
    const s = newSession({ length: 6 });
    const r = runSession(s, (q) => q.correct);
    expect(r.score).toBe(6);
    expect(r.percent).toBe(100);
    expect(r.weakCategories).toEqual([]);
  });

  it("flags weak topics on an all-wrong run", () => {
    const s = newSession({ length: 6 });
    const r = runSession(s, (q) => (q.correct === "A" ? "B" : "A"));
    expect(r.score).toBe(0);
    expect(r.weakCategories.length).toBeGreaterThan(0);
    expect(r.weakCategories.every((t) => t.weakness >= 0.5)).toBe(true);
  });

  it("never repeats a question within a session", () => {
    const s = newSession({ length: 6 });
    runSession(s, () => "A");
    const ids = s.answers.map((a) => a.questionId);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("completes early and safely if the bank runs out", () => {
    const tinyBank = [
      { id: "t1", level: "ks3", subject: "maths", category: "Number", text: "q1", options: { A: "1", B: "2", C: "3", D: "4" }, correct: "A", difficulty: 1 },
      { id: "t2", level: "ks3", subject: "maths", category: "Number", text: "q2", options: { A: "1", B: "2", C: "3", D: "4" }, correct: "B", difficulty: 1 },
      { id: "t3", level: "ks3", subject: "maths", category: "Number", text: "q3", options: { A: "1", B: "2", C: "3", D: "4" }, correct: "C", difficulty: 1 }
    ];
    const s = new SessionEngine({
      config: { length: 999 },
      questionEngine: createQuestionEngine(null, tinyBank),
      rng: seededRng(42)
    });
    const r = runSession(s, () => "A");
    expect(s.isComplete()).toBe(true);
    expect(r.total).toBe(3);
  });
});
