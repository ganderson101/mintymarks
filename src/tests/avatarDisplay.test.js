import { describe, it, expect } from "vitest";
import { buildRenderMap } from "../components/AvatarDisplay.jsx";

// Minimal catalog slice mirroring the real backend schema.
const SAMPLE_CATALOG = [
  { id: "base_default",  category: "character",  render: { kind: "emoji",    value: "👦" } },
  { id: "char_fox",      category: "character",  render: { kind: "emoji",    value: "🦊" } },
  { id: "colour_blue",   category: "colour",     render: { kind: "color",    value: "#3b82f6" } },
  { id: "bg_none",       category: "background", render: { kind: "color",    value: "#ffffff" } },
  { id: "bg_sunset",     category: "background", render: { kind: "gradient", value: "linear-gradient(180deg,#ff7f50,#ffb347)" } },
  { id: "hat_none",      category: "hat",        render: { kind: "emoji",    value: "" } },
  { id: "hat_crown",     category: "hat",        render: { kind: "emoji",    value: "👑" } },
  { id: "acc_none",      category: "accessory",  render: { kind: "emoji",    value: "" } },
  { id: "held_none",     category: "held",       render: { kind: "emoji",    value: "" } },
  { id: "held_wand",     category: "held",       render: { kind: "emoji",    value: "🪄" } },
  { id: "pet_none",      category: "pet",        render: { kind: "emoji",    value: "" } },
  { id: "pet_cat",       category: "pet",        render: { kind: "emoji",    value: "🐱" } },
  { id: "effect_none",   category: "effect",     render: { kind: "effect",   value: "",   anim: "sparkle" } },
  { id: "effect_stars",  category: "effect",     render: { kind: "effect",   value: "✨", anim: "float" } },
];

describe("buildRenderMap", () => {
  it("maps item ids to their render hints", () => {
    const map = buildRenderMap(SAMPLE_CATALOG);
    expect(map["base_default"]).toEqual({ kind: "emoji", value: "👦" });
    expect(map["colour_blue"]).toEqual({ kind: "color", value: "#3b82f6" });
    expect(map["bg_sunset"]).toEqual({ kind: "gradient", value: "linear-gradient(180deg,#ff7f50,#ffb347)" });
  });

  it("returns an empty map for empty catalog", () => {
    expect(buildRenderMap([])).toEqual({});
    expect(buildRenderMap(null)).toEqual({});
  });

  it("covers all 8 categories in the full sample", () => {
    const map = buildRenderMap(SAMPLE_CATALOG);
    const categories = new Set(SAMPLE_CATALOG.map((i) => i.category));
    expect(categories).toContain("character");
    expect(categories).toContain("colour");
    expect(categories).toContain("background");
    expect(categories).toContain("hat");
    expect(categories).toContain("accessory");
    expect(categories).toContain("held");
    expect(categories).toContain("pet");
    expect(categories).toContain("effect");
    // All ids present in map
    SAMPLE_CATALOG.forEach((item) => expect(map[item.id]).toBeDefined());
  });

  it("empty-value emoji items are in map but have empty value", () => {
    const map = buildRenderMap(SAMPLE_CATALOG);
    expect(map["hat_none"]).toEqual({ kind: "emoji", value: "" });
    expect(map["effect_none"]).toEqual({ kind: "effect", value: "", anim: "sparkle" });
  });

  it("resolves legacy base_* ids via the character category", () => {
    // base_default was renamed to character category — id preserved, render hint present
    const map = buildRenderMap(SAMPLE_CATALOG);
    expect(map["base_default"].kind).toBe("emoji");
    expect(map["base_default"].value).toBeTruthy();
  });

  it("character equipped renders emoji value", () => {
    const map = buildRenderMap(SAMPLE_CATALOG);
    const equipped = { character: "char_fox" };
    const hint = map[equipped.character];
    expect(hint.kind).toBe("emoji");
    expect(hint.value).toBe("🦊");
  });

  it("hat_none and pet_none have empty-string value so overlay is suppressed", () => {
    const map = buildRenderMap(SAMPLE_CATALOG);
    expect(map["hat_none"].value).toBe("");
    expect(map["pet_none"].value).toBe("");
  });

  it("effect item carries anim field", () => {
    const map = buildRenderMap(SAMPLE_CATALOG);
    expect(map["effect_stars"].anim).toBe("float");
  });

  it("gradient background has full CSS value", () => {
    const map = buildRenderMap(SAMPLE_CATALOG);
    expect(map["bg_sunset"].value).toMatch(/linear-gradient/);
  });

  it("new item added to catalog appears in map without frontend code change", () => {
    const extended = [
      ...SAMPLE_CATALOG,
      { id: "char_dino", category: "character", render: { kind: "emoji", value: "🦕" } },
    ];
    const map = buildRenderMap(extended);
    expect(map["char_dino"]).toEqual({ kind: "emoji", value: "🦕" });
  });
});
