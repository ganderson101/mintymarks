import { describe, it, expect } from "vitest";
import { SessionEngine } from "../engines/sessionEngine.js";
import { createQuestionEngine } from "../engines/questionEngine.js";
import { QUESTIONS } from "../data/questions.js";
import { seededRng } from "./seededRng.js";

function newSession(overrides = {}) {
  return new SessionEngine({
    config: { length: 6, categories: null, ...overrides },
    questionEngine: createQuestionEngine(null, QUESTIONS),
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

// Two-category bank used in cross-session tests. 20 questions per category so
// no category can be exhausted in a short session.
const TINY_BANK = [
  ...Array.from({ length: 20 }, (_, i) => ({
    id: `alg_${i}`, level: "ks3", subject: "maths", category: "Algebra",
    text: `Algebra Q${i}`, options: { A: "1", B: "2", C: "3", D: "4" }, correct: "A", difficulty: 2,
  })),
  ...Array.from({ length: 20 }, (_, i) => ({
    id: `num_${i}`, level: "ks3", subject: "maths", category: "Number",
    text: `Number Q${i}`, options: { A: "1", B: "2", C: "3", D: "4" }, correct: "A", difficulty: 2,
  })),
];

describe("SessionEngine cross-session seeding", () => {
  it("seeds initialPerformance and prioritises the weak topic in adaptive mode", () => {
    // Algebra is weak: 0 correct out of 10. Number is strong: 10/10.
    // Run 15 questions (< 20 per category so neither exhausts) and expect Algebra
    // to dominate selection due to the 70/30 weakness-biased algorithm.
    const initialPerformance = {
      byTopic: {
        Algebra: { attempts: 10, correct: 0 },
        Number:  { attempts: 10, correct: 10 },
      },
    };
    const s = new SessionEngine({
      config: { length: 15, level: "ks3", topicMode: "adaptive", initialPerformance },
      questionEngine: createQuestionEngine("maths", TINY_BANK),
      rng: seededRng(42),
    });
    const counts = { Algebra: 0, Number: 0 };
    s.next();
    while (!s.isComplete()) {
      counts[s.current.category]++;
      s.submit("A");
      if (!s.isComplete()) s.next();
    }
    // With Algebra at near-max weakness (~0.92) and Number near zero (~0.08),
    // the 70/30 bias produces ~12:3 expected split; Algebra should clearly win.
    expect(counts.Algebra).toBeGreaterThan(counts.Number);
  });

  it("SRS boost elevates a topic that is due for spaced review", () => {
    // Number is historically strong (low weakness) but SRS-due — forgotten since
    // last review. Without the boost, Number would rarely appear. With +0.2 boost
    // it becomes competitive and should show up a meaningful number of times.
    const initialPerformance = {
      byTopic: {
        Algebra: { attempts: 5, correct: 0 },
        Number:  { attempts: 5, correct: 5 },
      },
    };
    const srsState = { Number: { isDue: true } };
    const s = new SessionEngine({
      config: { length: 15, level: "ks3", topicMode: "adaptive", initialPerformance, srsState },
      questionEngine: createQuestionEngine("maths", TINY_BANK),
      rng: seededRng(99),
    });
    const counts = { Algebra: 0, Number: 0 };
    s.next();
    while (!s.isComplete()) {
      counts[s.current.category]++;
      s.submit("A");
      if (!s.isComplete()) s.next();
    }
    // Both categories should appear. Number's boosted weakness makes it competitive.
    expect(counts.Number).toBeGreaterThan(1);
    expect(counts.Algebra).toBeGreaterThan(1);
  });
});

describe("SessionEngine config", () => {
  it("throws without a numeric length (length is never hardcoded)", () => {
    expect(
      () =>
        new SessionEngine({
          config: {},
          questionEngine: createQuestionEngine(null, QUESTIONS),
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
  it("scores a perfect run and declares NO weak topics (encourage honestly)", () => {
    const s = newSession({ length: 6 });
    const r = runSession(s, (q) => q.correct);
    expect(r.score).toBe(6);
    expect(r.percent).toBe(100);
    // A child who got every question right must NOT be told they are weak at
    // anything. Laplace still scores each topic ≈ 0.33 (tiny sample), but the
    // confidence gate (Wilson lower bound on error rate) declares no weakness
    // because there is zero observed error evidence.
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

describe("SessionEngine usedHelp (assisted attempt)", () => {
  it("submit records usedHelp=true in the answer", () => {
    const s = new SessionEngine({
      config: { length: 1 },
      questionEngine: createQuestionEngine(null, QUESTIONS),
      rng: seededRng(1),
    });
    s.next();
    s.submit(s.current.correct, 0, true); // helped, answered correctly
    expect(s.answers[0].usedHelp).toBe(true);
    expect(s.answers[0].isCorrect).toBe(true); // score is still correct
  });

  it("assisted question is not added to askedIds — eligible for re-serve", () => {
    const s = new SessionEngine({
      config: { length: 5 },
      questionEngine: createQuestionEngine(null, QUESTIONS),
      rng: seededRng(1),
    });
    s.next();
    const qId = s.current.id;
    s.submit(s.current.correct, 0, true); // helped — should NOT be excluded
    expect(s.askedIds).not.toContain(qId);
  });

  it("unaided correct IS added to askedIds — not re-served", () => {
    const s = new SessionEngine({
      config: { length: 5 },
      questionEngine: createQuestionEngine(null, QUESTIONS),
      rng: seededRng(1),
    });
    s.next();
    const qId = s.current.id;
    s.submit(s.current.correct, 0, false); // unaided — should be excluded
    expect(s.askedIds).toContain(qId);
  });

  it("correct-after-help leaves the topic weaker than unaided correct", () => {
    // Two identical single-question sessions: one with help, one without.
    // The helped session's weakness should be higher.
    const makeSession = () => new SessionEngine({
      config: { length: 1 },
      questionEngine: createQuestionEngine(null, QUESTIONS),
      rng: seededRng(1),
    });

    const sHelped = makeSession();
    sHelped.next();
    const cat = sHelped.current.category;
    sHelped.submit(sHelped.current.correct, 0, true);  // helped
    const wHelped = sHelped.performance.byTopic[cat]?.weightedCorrect ?? 0;

    const sUnaided = makeSession();
    sUnaided.next();
    sUnaided.submit(sUnaided.current.correct, 0, false); // unaided
    const wUnaided = sUnaided.performance.byTopic[cat]?.weightedCorrect ?? 0;

    expect(wHelped).toBeLessThan(wUnaided);
  });
});
