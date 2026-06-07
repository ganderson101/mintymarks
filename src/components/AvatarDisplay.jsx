// Cheap layered avatar: coloured circle + emoji layers for base/hat/accessory.
// The catalogue's 'colour' items are CSS colours; base/hat/accessory are emoji.
// asset values are defined here since the backend catalog omits rendering hints.

const ASSETS = {
  base_default:  "🙂",
  base_star:     "⭐",
  base_robot:    "🤖",
  colour_blue:   "#3b82f6",
  colour_green:  "#10b981",
  colour_purple: "#7c3aed",
  hat_cap:       "🧢",
  hat_crown:     "👑",
  acc_glasses:   "👓",
  acc_bowtie:    "🎀",
};

// Returns the visual asset string for an item ID, or null.
export function assetFor(itemId) {
  return ASSETS[itemId] ?? null;
}

// equipped: { base: itemId, colour: itemId, hat: itemId, accessory: itemId }
// size: diameter in px
export default function AvatarDisplay({ equipped = {}, size = 48 }) {
  const base      = equipped.base      ? assetFor(equipped.base)      : "🙂";
  const colourRaw = equipped.colour    ? assetFor(equipped.colour)     : null;
  const hat       = equipped.hat       ? assetFor(equipped.hat)        : null;
  const accessory = equipped.accessory ? assetFor(equipped.accessory)  : null;

  // Colour items are CSS hex strings; others are emoji.
  const isCssColour = colourRaw && colourRaw.startsWith("#");
  const bgColor = isCssColour ? colourRaw : "var(--soft, #eef2ff)";

  const baseSize  = Math.round(size * 0.58);
  const smallSize = Math.round(size * 0.40);

  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        borderRadius: "50%",
        background: bgColor,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        overflow: "visible",
      }}
    >
      {/* Base character */}
      <span style={{ fontSize: baseSize, lineHeight: 1, userSelect: "none" }}>
        {base ?? "🙂"}
      </span>

      {/* Hat — top-centre */}
      {hat && (
        <span
          style={{
            position: "absolute",
            top: -Math.round(size * 0.22),
            left: "50%",
            transform: "translateX(-50%)",
            fontSize: smallSize,
            lineHeight: 1,
            userSelect: "none",
          }}
        >
          {hat}
        </span>
      )}

      {/* Accessory — bottom-right corner */}
      {accessory && (
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
          {accessory}
        </span>
      )}
    </div>
  );
}
