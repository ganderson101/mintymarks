import { describe, it, expect } from "vitest";
import { recordAnswer, computeWeakness, selectTopic } from "../engines/adaptationEngine.js";
import { scriptedRng } from "./seededRng.js";

describe("recordAnswer", () => {
  it("is immutable and tallies attempts/correct", () => {
    const p0 = { byTopic: {} };
    const p1 = recordAnswer(p0, "algebra", true);
    const p2 = recordAnswer(p1, "algebra", false);

    expect(p0.byTopic).toEqual({}); // original untouched
    expect(p1.byTopic.algebra).toEqual({ attempts: 1, correct: 1 });
    expect(p2.byTopic.algebra).toEqual({ attempts: 2, correct: 1 });
  });
});

describe("computeWeakness", () => {
  it("returns 1 for untried topics", () => {
    const w = computeWeakness({ byTopic: {} }, ["arithmetic", "algebra"]);
    expect(w).toEqual({ arithmetic: 1, algebra: 1 });
  });

  it("computes 1 - accuracy", () => {
    const perf = { byTopic: { arithmetic: { attempts: 4, correct: 3 } } };
    const w = computeWeakness(perf, ["arithmetic"]);
    expect(w.arithmetic).toBeCloseTo(0.25);
  });
});

describe("selectTopic 70/30 bias", () => {
  const topics = ["arithmetic", "algebra"];
  // arithmetic is strong (low weakness), algebra is weak (high weakness)
  const weakness = { arithmetic: 0, algebra: 1 };

  it("picks the weak topic when first roll < 0.7", () => {
    // roll 0.5 -> weak branch; second roll selects within weighted pool
    const rng = scriptedRng([0.5, 0.5]);
    expect(selectTopic(weakness, topics, rng)).toBe("algebra");
  });

  it("falls through to uniform random when first roll >= 0.7", () => {
    // roll 0.9 -> random branch; 0.0 -> index 0
    const rng = scriptedRng([0.9, 0.0]);
    expect(selectTopic(weakness, topics, rng)).toBe("arithmetic");
  });

  it("uses uniform random when all weakness is 0 even in weak branch", () => {
    const rng = scriptedRng([0.1, 0.99]); // weak branch, but total weakness 0
    expect(selectTopic({ arithmetic: 0, algebra: 0 }, topics, rng)).toBe("algebra");
  });
});
