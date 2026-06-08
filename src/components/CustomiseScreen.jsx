// Customise/shop screen — browse catalog by category, buy + equip cosmetic items.
// No dark patterns: items are described plainly; no countdowns, pressure, or FOMO copy.
import { useState, useEffect, useCallback } from "react";
import { getAvatarMe, purchaseItem, equipItem } from "../api/avatar.js";
import AvatarDisplay from "./AvatarDisplay.jsx";

const CATEGORY_ORDER = [
  "character", "colour", "background", "hat", "accessory", "held", "pet", "effect",
];
const CATEGORY_LABELS = {
  character:  "Character",
  colour:     "Colour",
  background: "Background",
  hat:        "Hat",
  accessory:  "Accessory",
  held:       "Held",
  pet:        "Pet",
  effect:     "Effect",
};

export default function CustomiseScreen() {
  const [data, setData]           = useState(null);   // { coins, equipped, owned, catalog }
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [activeTab, setActiveTab] = useState(CATEGORY_ORDER[0]);
  const [busyItem, setBusyItem]   = useState(null);   // itemId currently being acted on
  const [notice, setNotice]       = useState(null);   // { ok: bool, msg: string }

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    getAvatarMe()
      .then(setData)
      .catch(() => setError("Couldn't load — check your connection."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleBuy(itemId) {
    setBusyItem(itemId);
    setNotice(null);
    try {
      await purchaseItem(itemId);
      const fresh = await getAvatarMe();
      setData(fresh);
      setNotice({ ok: true, msg: "Unlocked!" });
    } catch (err) {
      const msg =
        err.status === 402 ? "Not enough coins yet." :
        err.status === 409 ? "You already have this." :
        "Something went wrong — try again.";
      setNotice({ ok: false, msg });
    } finally {
      setBusyItem(null);
    }
  }

  async function handleEquip(category, itemId) {
    setBusyItem(itemId);
    setNotice(null);
    try {
      const res = await equipItem(category, itemId);
      setData((prev) => ({ ...prev, equipped: res.equipped }));
    } catch (err) {
      setNotice({ ok: false, msg: err.message || "Couldn't equip — try again." });
    } finally {
      setBusyItem(null);
    }
  }

  if (loading) return <p className="subtitle">Loading avatar…</p>;

  if (error || !data) {
    return (
      <div>
        <p style={{ color: "var(--danger, #e55)" }}>{error || "Couldn't load avatar."}</p>
        <button className="btn-ghost" onClick={load}>Retry</button>
      </div>
    );
  }

  const { coins, equipped, owned, catalog } = data;
  const ownedSet = new Set(owned || []);

  // Group catalog by category (unknown categories are silently dropped)
  const byCategory = {};
  CATEGORY_ORDER.forEach((c) => { byCategory[c] = []; });
  (catalog || []).forEach((item) => {
    if (byCategory[item.category] !== undefined) byCategory[item.category].push(item);
  });

  const tabItems = byCategory[activeTab] || [];

  return (
    <div>
      {/* Coin balance */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <span style={{ fontSize: "1.4rem" }}>🪙</span>
        <span style={{ fontWeight: 700, fontSize: "1.1rem" }}>{coins ?? 0} coins</span>
        <span style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
          (earn coins by answering correctly)
        </span>
      </div>

      {/* Live avatar preview */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
        <AvatarDisplay equipped={equipped} catalog={catalog} size={96} />
      </div>

      {/* Feedback notice */}
      {notice && (
        <div
          style={{
            marginBottom: 14,
            padding: "8px 12px",
            borderRadius: 8,
            background: notice.ok ? "#ecfdf5" : "#fef2f2",
            color:      notice.ok ? "#047857" : "#b91c1c",
            fontSize: "0.9rem",
          }}
        >
          {notice.msg}
        </div>
      )}

      {/* Category tabs — horizontally scrollable */}
      <div
        style={{
          display: "flex",
          gap: 6,
          overflowX: "auto",
          marginBottom: 16,
          paddingBottom: 4,
          WebkitOverflowScrolling: "touch",
        }}
      >
        {CATEGORY_ORDER.map((cat) => (
          <button
            key={cat}
            onClick={() => { setActiveTab(cat); setNotice(null); }}
            style={{
              flexShrink: 0,
              padding: "6px 12px",
              borderRadius: 20,
              border: "2px solid",
              borderColor: activeTab === cat ? "var(--indigo, #4f46e5)" : "var(--line, #e5e7eb)",
              background: activeTab === cat ? "var(--soft, #eef2ff)" : "#fff",
              color: activeTab === cat ? "var(--indigo, #4f46e5)" : "var(--text, #111)",
              fontWeight: activeTab === cat ? 700 : 400,
              fontSize: "0.85rem",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Item grid for active tab — scrollable */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 8,
          maxHeight: 420,
          overflowY: "auto",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {tabItems.map((item) => {
          const isEquipped = equipped?.[item.category] === item.id;
          const isOwned    = ownedSet.has(item.id);
          const canAfford  = (coins ?? 0) >= item.price;
          const isBusy     = busyItem === item.id;

          return (
            <div
              key={item.id}
              style={{
                border: `2px solid ${isEquipped ? "var(--indigo, #4f46e5)" : "var(--line, #e5e7eb)"}`,
                borderRadius: 12,
                padding: "10px 6px",
                textAlign: "center",
                background: isEquipped ? "var(--soft, #eef2ff)" : "#fff",
              }}
            >
              {/* Render preview driven by catalog hint */}
              <div
                style={{
                  fontSize: "1.8rem",
                  lineHeight: 1,
                  marginBottom: 4,
                  height: 36,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <RenderPreview hint={item.render} />
              </div>

              <div style={{ fontSize: "0.78rem", fontWeight: 600, marginBottom: 2 }}>
                {item.name}
              </div>
              <div style={{ fontSize: "0.74rem", color: "var(--muted)", marginBottom: 6 }}>
                {item.price === 0 ? "Free" : `🪙 ${item.price}`}
              </div>

              {isEquipped ? (
                <span
                  style={{
                    display: "inline-block",
                    fontSize: "0.7rem",
                    background: "var(--indigo, #4f46e5)",
                    color: "white",
                    borderRadius: 6,
                    padding: "2px 6px",
                  }}
                >
                  Equipped
                </span>
              ) : isOwned ? (
                <button
                  className="btn-ghost"
                  style={{ fontSize: "0.76rem", padding: "3px 8px", width: "100%" }}
                  onClick={() => handleEquip(item.category, item.id)}
                  disabled={isBusy}
                >
                  {isBusy ? "…" : "Equip"}
                </button>
              ) : (
                <button
                  className="btn-primary"
                  style={{
                    fontSize: "0.76rem",
                    padding: "3px 8px",
                    width: "100%",
                    opacity: canAfford ? 1 : 0.45,
                    cursor: canAfford ? "pointer" : "not-allowed",
                  }}
                  onClick={() => canAfford && handleBuy(item.id)}
                  disabled={!canAfford || isBusy}
                  title={
                    canAfford
                      ? `Buy for ${item.price} coins`
                      : `Need ${item.price - (coins ?? 0)} more coins`
                  }
                >
                  {isBusy ? "…" : "Buy"}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {(!catalog || catalog.length === 0) && (
        <p className="subtitle">No items in the catalog yet.</p>
      )}
    </div>
  );
}

// Renders an item preview swatch from its render hint — used in the grid.
function RenderPreview({ hint }) {
  if (!hint) return <span style={{ color: "var(--muted)", fontSize: "0.8rem" }}>—</span>;

  switch (hint.kind) {
    case "emoji":
      return hint.value
        ? <span>{hint.value}</span>
        : <span style={{ color: "var(--muted)", fontSize: "0.8rem" }}>None</span>;

    case "color":
      return (
        <span
          style={{
            display: "inline-block",
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: hint.value,
            border: "2px solid rgba(0,0,0,0.1)",
          }}
        />
      );

    case "gradient":
      return (
        <span
          style={{
            display: "inline-block",
            width: 28,
            height: 28,
            borderRadius: 6,
            background: hint.value,
            border: "2px solid rgba(0,0,0,0.1)",
          }}
        />
      );

    case "frame":
      return (
        <span
          style={{
            display: "inline-block",
            width: 24,
            height: 24,
            borderRadius: "50%",
            border: `3px solid ${hint.value}`,
            boxShadow: hint.style === "glow" ? `0 0 6px ${hint.value}` : undefined,
          }}
        />
      );

    case "effect":
      return hint.value
        ? <span>{hint.value}</span>
        : <span style={{ color: "var(--muted)", fontSize: "0.8rem" }}>None</span>;

    default:
      return <span style={{ color: "var(--muted)", fontSize: "0.8rem" }}>—</span>;
  }
}
