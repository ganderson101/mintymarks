// Renders a layered avatar fully driven by catalog render hints.
// Layer z-order: background → frame → clothes (z:0) → character (z:1) → colour tint → hair (z:2) → accessory → hat (z:3) → held → pet → effect
// No hardcoded emoji or colour values — all rendering comes from the catalog returned by GET /avatar/me.

export function buildRenderMap(catalog) {
  const map = {};
  if (catalog) catalog.forEach((item) => { map[item.id] = item.render; });
  return map;
}

function emojiLayer(hint) {
  return hint?.kind === "emoji" && hint.value ? hint.value : null;
}

// Resolves a hint to a visual for layers that can be either an emoji or a
// CSS fill (colour/gradient) — used by hair & clothes, where most items are
// coloured shapes rather than emoji. Returns { type: "emoji"|"css", value }.
export function layerVisual(hint) {
  if (!hint || !hint.value) return null;
  if (hint.kind === "emoji") return { type: "emoji", value: hint.value };
  if (hint.kind === "color" || hint.kind === "gradient")
    return { type: "css", value: hint.value };
  return null;
}

// equipped: { character|base: itemId, colour: itemId, background: itemId, clothes: itemId,
//             hair: itemId, hat: itemId, accessory: itemId, held: itemId, pet: itemId, effect: itemId }
// catalog:  array of items from GET /avatar/me (each has a render hint)
// size:     diameter in px
export default function AvatarDisplay({ equipped = {}, catalog = [], size = 48 }) {
  const map = buildRenderMap(catalog);
  const h = (category) => {
    const id = equipped[category];
    return id ? map[id] : null;
  };

  // Background layer (scene — colour/gradient)
  const bgHint = h("background");
  let bgValue = "var(--soft, #eef2ff)";
  if (bgHint?.kind === "gradient" && bgHint.value) bgValue = bgHint.value;
  else if (bgHint?.kind === "color" && bgHint.value && bgHint.value !== "#ffffff") bgValue = bgHint.value;

  // Frame layer (border ring)
  const frameHint = h("frame");
  const frameBorder =
    frameHint?.kind === "frame" && frameHint.value
      ? `3px ${frameHint.style === "double" ? "double" : "solid"} ${frameHint.value}`
      : undefined;
  const frameGlow =
    frameHint?.kind === "frame" && frameHint.style === "glow"
      ? `0 0 8px 2px ${frameHint.value}`
      : undefined;

  // Character — support legacy "base" key for existing users pre-migration
  const charHint = h("character") ?? h("base");
  const charEmoji = charHint?.kind === "emoji" && charHint.value ? charHint.value : "🙂";

  // Colour tint overlay (rendered on top of background, under character in z but over in DOM)
  const tintHint = h("colour");
  const tintColor = tintHint?.kind === "color" && tintHint.value ? tintHint.value : null;

  // Overlay layers. hair & clothes may be emoji OR a CSS shape (colour/gradient);
  // hat/accessory/held/pet are emoji-only categories.
  const clothes = layerVisual(h("clothes"));
  const hair    = layerVisual(h("hair"));
  const hatEmoji   = emojiLayer(h("hat"));
  const accEmoji   = emojiLayer(h("accessory"));
  const heldEmoji  = emojiLayer(h("held"));
  const petEmoji   = emojiLayer(h("pet"));
  const effectHint = h("effect");
  const effectEmoji = effectHint?.kind === "effect" && effectHint.value ? effectHint.value : null;

  const charSize  = Math.round(size * 0.58);
  const smallSize = Math.round(size * 0.40);
  const tinySize  = Math.round(size * 0.35);

  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        borderRadius: "50%",
        background: bgValue,
        border: frameBorder,
        boxShadow: frameGlow,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        overflow: "visible",
      }}
    >
      {/* Colour tint — sits between background and character */}
      {tintColor && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            background: tintColor,
            opacity: 0.18,
            pointerEvents: "none",
          }}
        />
      )}

      {/* Clothes — body/lower area, behind character (z:0). Emoji or CSS torso shape. */}
      {clothes?.type === "emoji" && (
        <span
          style={{
            position: "absolute",
            bottom: -Math.round(size * 0.05),
            left: "50%",
            transform: "translateX(-50%)",
            fontSize: Math.round(size * 0.45),
            lineHeight: 1,
            userSelect: "none",
            zIndex: 0,
          }}
        >
          {clothes.value}
        </span>
      )}
      {clothes?.type === "css" && (
        <div
          data-testid="clothes-shape"
          style={{
            position: "absolute",
            bottom: -Math.round(size * 0.04),
            left: "50%",
            transform: "translateX(-50%)",
            width: Math.round(size * 0.52),
            height: Math.round(size * 0.30),
            background: clothes.value,
            borderRadius: "40% 40% 22% 22% / 55% 55% 22% 22%",
            zIndex: 0,
            pointerEvents: "none",
          }}
        />
      )}

      {/* Character */}
      <span
        style={{
          fontSize: charSize,
          lineHeight: 1,
          userSelect: "none",
          position: "relative",
          zIndex: 1,
        }}
      >
        {charEmoji}
      </span>

      {/* Hair — head area, above character (z:2), below hat (z:3). Emoji or CSS cap shape. */}
      {hair?.type === "emoji" && (
        <span
          style={{
            position: "absolute",
            top: -Math.round(size * 0.08),
            left: "50%",
            transform: "translateX(-50%)",
            fontSize: tinySize,
            lineHeight: 1,
            userSelect: "none",
            zIndex: 2,
          }}
        >
          {hair.value}
        </span>
      )}
      {hair?.type === "css" && (
        <div
          data-testid="hair-shape"
          style={{
            position: "absolute",
            top: Math.round(size * 0.04),
            left: "50%",
            transform: "translateX(-50%)",
            width: Math.round(size * 0.50),
            height: Math.round(size * 0.30),
            background: hair.value,
            borderRadius: "50% 50% 38% 38% / 70% 70% 38% 38%",
            zIndex: 2,
            pointerEvents: "none",
          }}
        />
      )}

      {/* Hat — top-centre, above hair (z:3) */}
      {hatEmoji && (
        <span
          style={{
            position: "absolute",
            top: -Math.round(size * 0.22),
            left: "50%",
            transform: "translateX(-50%)",
            fontSize: smallSize,
            lineHeight: 1,
            userSelect: "none",
            zIndex: 3,
          }}
        >
          {hatEmoji}
        </span>
      )}

      {/* Accessory — bottom-right */}
      {accEmoji && (
        <span
          style={{
            position: "absolute",
            bottom: -Math.round(size * 0.12),
            right: -Math.round(size * 0.12),
            fontSize: smallSize,
            lineHeight: 1,
            userSelect: "none",
            background: "white",
            borderRadius: "50%",
            padding: 1,
          }}
        >
          {accEmoji}
        </span>
      )}

      {/* Held item — bottom-left */}
      {heldEmoji && (
        <span
          style={{
            position: "absolute",
            bottom: -Math.round(size * 0.18),
            left: -Math.round(size * 0.12),
            fontSize: tinySize,
            lineHeight: 1,
            userSelect: "none",
          }}
        >
          {heldEmoji}
        </span>
      )}

      {/* Pet — right side */}
      {petEmoji && (
        <span
          style={{
            position: "absolute",
            bottom: -Math.round(size * 0.12),
            right: -Math.round(size * 0.30),
            fontSize: tinySize,
            lineHeight: 1,
            userSelect: "none",
          }}
        >
          {petEmoji}
        </span>
      )}

      {/* Effect — top-right overlay */}
      {effectEmoji && (
        <span
          style={{
            position: "absolute",
            top: -Math.round(size * 0.18),
            right: -Math.round(size * 0.10),
            fontSize: tinySize,
            lineHeight: 1,
            userSelect: "none",
            animation: effectHint?.anim
              ? `avatar-${effectHint.anim} 1.5s ease-in-out infinite`
              : undefined,
          }}
        >
          {effectEmoji}
        </span>
      )}
    </div>
  );
}
