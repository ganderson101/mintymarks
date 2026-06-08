import { describe, it, expect } from "vitest";
import { buildRenderMap, layerVisual } from "../components/AvatarDisplay.jsx";

// Minimal catalog slice mirroring the real backend schema.
const SAMPLE_CATALOG = [
  { id: "base_default",   category: "character",  render: { kind: "emoji",    value: "👦" } },
  { id: "char_fox",       category: "character",  render: { kind: "emoji",    value: "🦊" } },
  { id: "hair_default",   category: "hair",       render: { kind: "emoji",    value: "" } },
  { id: "hair_curly",     category: "hair",       render: { kind: "emoji",    value: "👩‍🦱" } },
  { id: "clothes_default",category: "clothes",    render: { kind: "emoji",    value: "" } },
  { id: "clothes_tshirt", category: "clothes",    render: { kind: "emoji",    value: "👕" } },
  { id: "colour_blue",    category: "colour",     render: { kind: "color",    value: "#3b82f6" } },
  { id: "bg_none",        category: "background", render: { kind: "color",    value: "#ffffff" } },
  { id: "bg_sunset",      category: "background", render: { kind: "gradient", value: "linear-gradient(180deg,#ff7f50,#ffb347)" } },
  { id: "hat_none",       category: "hat",        render: { kind: "emoji",    value: "" } },
  { id: "hat_crown",      category: "hat",        render: { kind: "emoji",    value: "👑" } },
  { id: "acc_none",       category: "accessory",  render: { kind: "emoji",    value: "" } },
  { id: "held_none",      category: "held",       render: { kind: "emoji",    value: "" } },
  { id: "held_wand",      category: "held",       render: { kind: "emoji",    value: "🪄" } },
  { id: "pet_none",       category: "pet",        render: { kind: "emoji",    value: "" } },
  { id: "pet_cat",        category: "pet",        render: { kind: "emoji",    value: "🐱" } },
  { id: "effect_none",    category: "effect",     render: { kind: "effect",   value: "",   anim: "sparkle" } },
  { id: "effect_stars",   category: "effect",     render: { kind: "effect",   value: "✨", anim: "float" } },
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

  it("covers all 10 categories including hair and clothes", () => {
    const map = buildRenderMap(SAMPLE_CATALOG);
    const categories = new Set(SAMPLE_CATALOG.map((i) => i.category));
    expect(categories).toContain("character");
    expect(categories).toContain("hair");
    expect(categories).toContain("clothes");
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

  // Hair layer — z:2 (above character z:1, below hat z:3)
  it("hair item resolves to emoji render hint", () => {
    const map = buildRenderMap(SAMPLE_CATALOG);
    expect(map["hair_curly"]).toEqual({ kind: "emoji", value: "👩‍🦱" });
  });

  it("hair_default has empty value so hair layer is suppressed", () => {
    const map = buildRenderMap(SAMPLE_CATALOG);
    expect(map["hair_default"].value).toBe("");
  });

  it("hair equipped item renders via character key lookup", () => {
    const map = buildRenderMap(SAMPLE_CATALOG);
    const equipped = { hair: "hair_curly" };
    const hint = map[equipped.hair];
    expect(hint.kind).toBe("emoji");
    expect(hint.value).toBe("👩‍🦱");
  });

  // Clothes layer — z:0 (behind character z:1)
  it("clothes item resolves to emoji render hint", () => {
    const map = buildRenderMap(SAMPLE_CATALOG);
    expect(map["clothes_tshirt"]).toEqual({ kind: "emoji", value: "👕" });
  });

  it("clothes_default has empty value so clothes layer is suppressed", () => {
    const map = buildRenderMap(SAMPLE_CATALOG);
    expect(map["clothes_default"].value).toBe("");
  });

  it("clothes equipped item renders via category key lookup", () => {
    const map = buildRenderMap(SAMPLE_CATALOG);
    const equipped = { clothes: "clothes_tshirt" };
    const hint = map[equipped.clothes];
    expect(hint.kind).toBe("emoji");
    expect(hint.value).toBe("👕");
  });

  // Regression: hair & clothes are mostly colour/gradient items, NOT emoji.
  // The first build rendered these layers via emoji-only logic, so 13/14 hair
  // and 4/16 clothes items equipped to an empty layer. layerVisual must resolve
  // every render kind to a VISIBLE layer (emoji span or CSS shape).
  describe("layerVisual resolves all render kinds to a visible layer", () => {
    it("emoji hint -> emoji visual", () => {
      expect(layerVisual({ kind: "emoji", value: "👕" })).toEqual({ type: "emoji", value: "👕" });
    });
    it("colour hint -> css visual (was previously dropped)", () => {
      const v = layerVisual({ kind: "color", value: "#6b3a2a" });
      expect(v).toEqual({ type: "css", value: "#6b3a2a" });
    });
    it("gradient hint -> css visual (was previously dropped)", () => {
      const v = layerVisual({ kind: "gradient", value: "linear-gradient(180deg,#444,#888)" });
      expect(v.type).toBe("css");
      expect(v.value).toMatch(/linear-gradient/);
    });
    it("empty / null hint -> no layer", () => {
      expect(layerVisual({ kind: "emoji", value: "" })).toBeNull();
      expect(layerVisual(null)).toBeNull();
    });
    it("EVERY render kind used by hair/clothes produces a visible layer", () => {
      // mirrors the real backend catalog: hair = emoji+color+gradient, clothes = emoji+color+gradient
      const kinds = [
        { kind: "emoji", value: "👩‍🦱" },
        { kind: "color", value: "#1a1a1a" },
        { kind: "gradient", value: "linear-gradient(180deg,#ff0,#f0f)" },
      ];
      kinds.forEach((hint) => {
        const v = layerVisual(hint);
        expect(v).not.toBeNull();
        expect(v.value).toBeTruthy();
      });
    });
  });

  it("z-order: hair and clothes are separate categories from hat", () => {
    // hair renders at z:2 (head, below hat z:3); clothes at z:0 (body, below character z:1)
    const map = buildRenderMap(SAMPLE_CATALOG);
    expect(map["hair_curly"].kind).toBe("emoji");
    expect(map["clothes_tshirt"].kind).toBe("emoji");
    expect(map["hat_crown"].kind).toBe("emoji");
    // All three are distinct ids / distinct categories
    expect(SAMPLE_CATALOG.find(i => i.id === "hair_curly").category).toBe("hair");
    expect(SAMPLE_CATALOG.find(i => i.id === "clothes_tshirt").category).toBe("clothes");
    expect(SAMPLE_CATALOG.find(i => i.id === "hat_crown").category).toBe("hat");
  });

  // Regression: MIN-121 — Dashboard header avatar showed 🙂 because catalog prop was omitted.
  // When catalog + equipped character are supplied, the equipped emoji must render, not the fallback.
  it("MIN-121 regression: equipped character renders emoji from catalog, not fallback 🙂", () => {
    const map = buildRenderMap(SAMPLE_CATALOG);
    const equipped = { character: "char_fox" };
    const charHint = map[equipped.character] ?? map[equipped.base];
    const charEmoji = charHint?.kind === "emoji" && charHint.value ? charHint.value : "🙂";
    expect(charEmoji).toBe("🦊");
    expect(charEmoji).not.toBe("🙂");
  });

  it("MIN-121 regression: empty catalog causes character to fall back to 🙂", () => {
    const map = buildRenderMap([]);
    const equipped = { character: "char_fox" };
    const charHint = map[equipped.character];
    const charEmoji = charHint?.kind === "emoji" && charHint.value ? charHint.value : "🙂";
    expect(charEmoji).toBe("🙂");
  });
});
