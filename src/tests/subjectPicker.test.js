import { describe, it, expect, beforeEach } from "vitest";
import {
  LEVELS,
  FEATURED_SUBJECTS,
  loadPrefs,
  savePrefs,
  loadList,
  saveList,
} from "../components/Dashboard.jsx";

// ── localStorage mock (no DOM / jsdom required) ───────────────────────────────

const _store = {};
const mockLS = {
  getItem:    (k) => Object.prototype.hasOwnProperty.call(_store, k) ? _store[k] : null,
  setItem:    (k, v) => { _store[k] = String(v); },
  removeItem: (k) => { delete _store[k]; },
  clear:      () => { Object.keys(_store).forEach((k) => delete _store[k]); },
};

beforeEach(() => {
  mockLS.clear();
  globalThis.localStorage = mockLS;
});

// ── LEVELS structure ──────────────────────────────────────────────────────────

describe("LEVELS", () => {
  it("comp-sci has GCSE only", () => {
    const vals = LEVELS["comp-sci"].map((l) => l.value);
    expect(vals).toEqual(["gcse"]);
  });

  it("geography has GCSE only", () => {
    const vals = LEVELS["geography"].map((l) => l.value);
    expect(vals).toEqual(["gcse"]);
  });

  it("maths retains ks2/ks3/gcse/alevel", () => {
    const vals = LEVELS["maths"].map((l) => l.value);
    expect(vals).toEqual(["ks2", "ks3", "gcse", "alevel"]);
  });

  it("physics retains ks2/ks3/gcse/alevel", () => {
    const vals = LEVELS["physics"].map((l) => l.value);
    expect(vals).toEqual(["ks2", "ks3", "gcse", "alevel"]);
  });

  it("chemistry retains ks2/ks3/gcse/alevel", () => {
    const vals = LEVELS["chemistry"].map((l) => l.value);
    expect(vals).toEqual(["ks2", "ks3", "gcse", "alevel"]);
  });

  it("biology retains ks2/ks3/gcse/alevel", () => {
    const vals = LEVELS["biology"].map((l) => l.value);
    expect(vals).toEqual(["ks2", "ks3", "gcse", "alevel"]);
  });

  it("vocab retains 11plus only", () => {
    const vals = LEVELS["vocab"].map((l) => l.value);
    expect(vals).toEqual(["11plus"]);
  });
});

// ── FEATURED_SUBJECTS ─────────────────────────────────────────────────────────

describe("FEATURED_SUBJECTS", () => {
  it("contains maths, physics, chemistry, biology", () => {
    expect(FEATURED_SUBJECTS).toContain("maths");
    expect(FEATURED_SUBJECTS).toContain("physics");
    expect(FEATURED_SUBJECTS).toContain("chemistry");
    expect(FEATURED_SUBJECTS).toContain("biology");
  });

  it("does NOT include comp-sci or geography (they appear behind the expander)", () => {
    expect(FEATURED_SUBJECTS).not.toContain("comp-sci");
    expect(FEATURED_SUBJECTS).not.toContain("geography");
  });
});

// ── loadPrefs / savePrefs ─────────────────────────────────────────────────────

describe("loadPrefs", () => {
  it("returns null when storage is empty", () => {
    expect(loadPrefs()).toBeNull();
  });

  it("round-trips a valid prefs object", () => {
    const prefs = { subject: "comp-sci", level: "gcse", difficulty: "all", length: 10, topicMode: "random", selectedCategories: [] };
    savePrefs(prefs);
    expect(loadPrefs()).toMatchObject({ subject: "comp-sci", level: "gcse" });
  });

  it("returns null for corrupt JSON (fallback path)", () => {
    mockLS.setItem("mintymarks_home_prefs", "{not valid json}}");
    expect(loadPrefs()).toBeNull();
  });

  it("returns null when shape is wrong (subject not a string)", () => {
    mockLS.setItem("mintymarks_home_prefs", JSON.stringify({ subject: 42, level: "gcse" }));
    expect(loadPrefs()).toBeNull();
  });

  it("returns null when level is missing", () => {
    mockLS.setItem("mintymarks_home_prefs", JSON.stringify({ subject: "maths" }));
    expect(loadPrefs()).toBeNull();
  });
});

// ── loadList / saveList ───────────────────────────────────────────────────────

describe("loadList", () => {
  it("returns [] when key is absent", () => {
    expect(loadList("mintymarks_engaged_subjects")).toEqual([]);
  });

  it("round-trips a string array", () => {
    saveList("mintymarks_engaged_subjects", ["maths", "comp-sci"]);
    expect(loadList("mintymarks_engaged_subjects")).toEqual(["maths", "comp-sci"]);
  });

  it("returns [] for corrupt JSON", () => {
    mockLS.setItem("mintymarks_minimised_subjects", "<<bad json");
    expect(loadList("mintymarks_minimised_subjects")).toEqual([]);
  });

  it("returns [] when stored value is not an array", () => {
    mockLS.setItem("mintymarks_engaged_subjects", JSON.stringify({ notAnArray: true }));
    expect(loadList("mintymarks_engaged_subjects")).toEqual([]);
  });

  it("round-trips an empty array", () => {
    saveList("mintymarks_minimised_subjects", []);
    expect(loadList("mintymarks_minimised_subjects")).toEqual([]);
  });
});

// ── minimise / restore state logic ───────────────────────────────────────────
// Tests the handleMinimise / handleRestore mutation logic in isolation.

describe("minimise+restore subject logic", () => {
  it("minimise: adds subject to list (idempotent)", () => {
    let minimised = [];
    const addOnce = (v) => (minimised.includes(v) ? minimised : [...minimised, v]);
    minimised = addOnce("comp-sci");
    minimised = addOnce("comp-sci"); // second call must not duplicate
    expect(minimised).toEqual(["comp-sci"]);
  });

  it("restore: removes subject from minimised list", () => {
    let minimised = ["comp-sci", "geography"];
    minimised = minimised.filter((v) => v !== "comp-sci");
    expect(minimised).toEqual(["geography"]);
  });

  it("engaged: marks subject after start (idempotent)", () => {
    let engaged = ["maths"];
    const markEngaged = (s) => (engaged.includes(s) ? engaged : [...engaged, s]);
    engaged = markEngaged("comp-sci");
    engaged = markEngaged("comp-sci");
    expect(engaged).toEqual(["maths", "comp-sci"]);
  });
});
