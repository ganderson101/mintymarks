import { describe, it, expect } from "vitest";
import {
  recordAnswer,
  computeWeakness,
  selectTopic,
  wilsonLowerBound,
  isConfidentWeakness,
} from "../engines/adaptationEngine.js";
import { scriptedRng } from "./seededRng.js";

describe("recordAnswer — usedHelp (assisted attempt)", () => {
  it("correct-after-help: isCorrect=true in record but weightedCorrect stays 0 (quality=0)", () => {
    const p0 = { byTopic: {} };
    const p1 = recordAnswer(p0, "vocab", true, 5000, true); // helped, fast, correct
    expect(p1.byTopic.vocab.attempts).toBe(1);
    expect(p1.byTopic.vocab.correct).toBe(1);          // raw score stays correct
    expect(p1.byTopic.vocab.weightedCorrect).toBe(0);  // no weakness credit
  });

  it("wrong-after-help: same as unaided wrong (correct=0, weightedCorrect=0)", () => {
    const p0 = { byTopic: {} };
    const p1 = recordAnswer(p0, "vocab", false, 5000, true);
    expect(p1.byTopic.vocab.correct).toBe(0);
    expect(p1.byTopic.vocab.weightedCorrect).toBe(0);
  });

  it("assisted correct then unaided correct: second answer adds to weightedCorrect", () => {
    const p0 = { byTopic: {} };
    const p1 = recordAnswer(p0, "vocab", true, 0, true);   // helped -> quality 0
    const p2 = recordAnswer(p1, "vocab", true, 0, false);  // unaided -> quality 1.0
    expect(p2.byTopic.vocab.weightedCorrect).toBeCloseTo(1.0);
    expect(p2.byTopic.vocab.correct).toBe(2);
  });

  it("weakness is higher for assisted correct vs unaided correct", () => {
    const pHelped   = recordAnswer({ byTopic: {} }, "vocab", true, 0, true);
    const pUnaided  = recordAnswer({ byTopic: {} }, "vocab", true, 0, false);
    const wHelped   = computeWeakness(pHelped,  ["vocab"]);
    const wUnaided  = computeWeakness(pUnaided, ["vocab"]);
    expect(wHelped.vocab).toBeGreaterThan(wUnaided.vocab);
  });
});

describe("recordAnswer", () => {
  it("is immutable and tallies attempts/correct/weightedCorrect", () => {
    const p0 = { byTopic: {} };
    const p1 = recordAnswer(p0, "algebra", true);         // correct, no timing -> quality 1.0
    const p2 = recordAnswer(p1, "algebra", false);        // wrong -> quality 0
    const p3 = recordAnswer(p2, "algebra", true, 5000);   // fast correct (<8s) -> quality 1.2
    const p4 = recordAnswer(p3, "algebra", true, 25000);  // slow correct (>20s) -> quality 0.8

    expect(p0.byTopic).toEqual({}); // original untouched

    expect(p1.byTopic.algebra).toMatchObject({ attempts: 1, correct: 1, weightedCorrect: 1.0 });
    expect(p2.byTopic.algebra).toMatchObject({ attempts: 2, correct: 1, weightedCorrect: 1.0 }); // wrong adds 0
    expect(p3.byTopic.algebra).toMatchObject({ attempts: 3, correct: 2 });
    expect(p3.byTopic.algebra.weightedCorrect).toBeCloseTo(2.2); // 1.0 + 1.2
    expect(p4.byTopic.algebra.weightedCorrect).toBeCloseTo(3.0); // 1.0 + 1.2 + 0.8
  });

  it("handles legacy records without weightedCorrect (falls back to correct count)", () => {
    const legacy = { byTopic: { algebra: { attempts: 4, correct: 3 } } };
    const p = recordAnswer(legacy, "algebra", true);
    // prevWeighted = prev.correct = 3; +quality 1.0 = 4
    expect(p.byTopic.algebra.weightedCorrect).toBeCloseTo(4.0);
  });
});

describe("computeWeakness", () => {
  it("returns 1 for untried topics", () => {
    const w = computeWeakness({ byTopic: {} }, ["arithmetic", "algebra"]);
    expect(w).toEqual({ arithmetic: 1, algebra: 1 });
  });

  it("applies Laplace smoothing -- 3/4 correct gives ~0.333 weakness, not 0.25", () => {
    // Raw: 1 - 3/4 = 0.25. Smoothed: 1 - (3+1)/(4+2) = 1 - 4/6 ~= 0.333
    const perf = { byTopic: { arithmetic: { attempts: 4, correct: 3, weightedCorrect: 3 } } };
    const w = computeWeakness(perf, ["arithmetic"]);
    expect(w.arithmetic).toBeCloseTo(0.333, 2);
  });

  it("uses weightedCorrect -- slow answers inflate weakness vs raw accuracy", () => {
    // All correct but slow (quality 0.8 each): weightedCorrect = 3.2
    const perfSlow = { byTopic: { algebra: { attempts: 4, correct: 4, weightedCorrect: 3.2 } } };
    // All correct and fast (quality 1.2 each): weightedCorrect = 4.8
    const perfFast = { byTopic: { algebra: { attempts: 4, correct: 4, weightedCorrect: 4.8 } } };
    const wSlow = computeWeakness(perfSlow, ["algebra"]);
    const wFast = computeWeakness(perfFast, ["algebra"]);
    // Slow correct answers should show higher weakness (less confident mastery)
    expect(wSlow.algebra).toBeGreaterThan(wFast.algebra);
  });

  it("single wrong answer -- weakness < 1 (smoothing prevents over-punishment)", () => {
    const perf = { byTopic: { algebra: { attempts: 1, correct: 0, weightedCorrect: 0 } } };
    const w = computeWeakness(perf, ["algebra"]);
    // smoothed = (0+1)/(1+2) = 1/3, weakness = 2/3 ~= 0.667
    expect(w.algebra).toBeCloseTo(0.667, 2);
    expect(w.algebra).toBeLessThan(1);
  });

  it("single correct answer -- weakness ~0.333 (smoothing prevents over-confidence)", () => {
    const perf = { byTopic: { algebra: { attempts: 1, correct: 1, weightedCorrect: 1 } } };
    const w = computeWeakness(perf, ["algebra"]);
    // smoothed = (1+1)/(1+2) = 2/3, weakness = 1/3 ~= 0.333
    expect(w.algebra).toBeCloseTo(0.333, 2);
    expect(w.algebra).toBeLessThan(0.5);
  });
});

describe("confidence-aware weakness declaration (Wilson lower bound)", () => {
  it("wilsonLowerBound is 0 when there are no observed events", () => {
    expect(wilsonLowerBound(0, 0)).toBe(0); // no attempts
    expect(wilsonLowerBound(0, 1)).toBe(0); // 0 errors out of 1 -> no evidence of error
    expect(wilsonLowerBound(0, 5)).toBe(0); // 0 errors out of 5 -> still no evidence
  });

  it("wilsonLowerBound is positive once an event is observed and grows with sample size", () => {
    const oneOfOne   = wilsonLowerBound(1, 1);
    const fiveOfFive = wilsonLowerBound(5, 5);
    expect(oneOfOne).toBeGreaterThan(0);
    expect(fiveOfFive).toBeGreaterThan(oneOfOne); // more evidence -> tighter, higher floor
    expect(fiveOfFive).toBeLessThanOrEqual(1);
  });

  it("does NOT declare weakness for an all-correct topic, however small the sample", () => {
    // The core 'encourage honestly' guarantee: a child who only ever got it right
    // is never told they are weak at it.
    expect(isConfidentWeakness(1, 1)).toBe(false); // 1/1 correct
    expect(isConfidentWeakness(3, 3)).toBe(false); // 3/3 correct
  });

  it("DOES declare weakness once a genuine miss is seen, even on one attempt", () => {
    expect(isConfidentWeakness(0, 1)).toBe(true);  // 0/1 -> real miss
    expect(isConfidentWeakness(1, 3)).toBe(true);  // 1/3 -> clearly struggling
  });

  it("never declares weakness without any evidence", () => {
    expect(isConfidentWeakness(0, 0)).toBe(false);
    expect(isConfidentWeakness(undefined, undefined)).toBe(false);
  });
});

describe("selectTopic 70/30 bias", () => {
  const topics = ["arithmetic", "algebra"];
  const weakness = { arithmetic: 0, algebra: 1 };

  it("picks the weak topic when first roll < 0.7", () => {
    const rng = scriptedRng([0.5, 0.5]);
    expect(selectTopic(weakness, topics, rng)).toBe("algebra");
  });

  it("falls through to uniform random when first roll >= 0.7", () => {
    const rng = scriptedRng([0.9, 0.0]);
    expect(selectTopic(weakness, topics, rng)).toBe("arithmetic");
  });

  it("uses uniform random when all weakness is 0 even in weak branch", () => {
    const rng = scriptedRng([0.1, 0.99]);
    expect(selectTopic({ arithmetic: 0, algebra: 0 }, topics, rng)).toBe("algebra");
  });
});
