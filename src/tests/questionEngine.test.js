import { describe, it, expect } from "vitest";
import { createQuestionEngine } from "../engines/questionEngine.js";
import { QUESTIONS } from "../data/questions.js";

// Tests use the full static bank directly. In production the bank is fetched
// from /api/questions, but for unit tests the local import is fine — it's Node,
// not a browser bundle, so the 4MB doesn't matter here.
const qe    = createQuestionEngine(null,    QUESTIONS);
const maths = createQuestionEngine("maths", QUESTIONS);

describe("QuestionEngine levels", () => {
  it("exposes all four levels", () => {
    expect(qe.getLevels().sort()).toEqual(["alevel", "gcse", "ks2", "ks3"]);
  });

  it("KS3 maths categories cover the National Curriculum strands", () => {
    const cats = maths.getCategories("ks3");
    for (const c of [
      "Number",
      "Algebra",
      "Ratio & proportion",
      "Geometry & measures",
      "Statistics & probability"
    ]) {
      expect(cats).toContain(c);
    }
  });

  it("GCSE maths categories match the six Edexcel strands", () => {
    const cats = maths.getCategories("gcse").sort();
    expect(cats).toEqual(
      [
        "Algebra",
        "Geometry & measures",
        "Number",
        "Probability",
        "Ratio, proportion & rates of change",
        "Statistics"
      ].sort()
    );
  });
});

describe("QuestionEngine level filtering", () => {
  it("getAvailable filters by level", () => {
    expect(qe.getAvailable([], "ks3").every((q) => q.level === "ks3")).toBe(true);
    expect(qe.getAvailable([], "gcse").every((q) => q.level === "gcse")).toBe(true);
  });

  it("getAvailableByCategory respects category AND level", () => {
    const ks3Num = qe.getAvailableByCategory("Number", [], "ks3");
    expect(ks3Num.length).toBeGreaterThan(0);
    expect(ks3Num.every((q) => q.level === "ks3" && q.category === "Number")).toBe(true);
  });

  it("excludeIds removes already-asked questions", () => {
    const all = qe.getAvailable([], "gcse");
    const skip = all[0].id;
    expect(qe.getAvailable([skip], "gcse").some((q) => q.id === skip)).toBe(false);
  });
});
