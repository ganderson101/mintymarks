// Customise/shop screen — browse catalog by category, buy + equip cosmetic items.
// No dark patterns: items are described plainly; no countdowns, pressure, or FOMO copy.
import { useState, useEffect, useCallback } from "react";
import { getAvatarMe, purchaseItem, equipItem } from "../api/avatar.js";
import AvatarDisplay, { assetFor } from "./AvatarDisplay.jsx";

const CATEGORY_ORDER  = ["base", "colour", "hat", "accessory"];
const CATEGORY_LABELS = { base: "Character", colour: "Colour", hat: "Hat", accessory: "Accessory" };

export default function CustomiseScreen() {
  const [data, setData]         = useState(null);   // { coins, equipped, owned, catalog }
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [busyItem, setBusyItem] = useState(null);   // itemId currently being acted on
  const [notice, setNotice]     = useState(null);   // { ok: bool, msg: string }

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
      // Re-fetch full state so coins, owned, and any side-effects are in sync.
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

  // Group catalog by category in display order.
  const byCategory = {};
  CATEGORY_ORDER.forEach((c) => { byCategory[c] = []; });
  (catalog || []).forEach((item) => {
    if (byCategory[item.category]) byCategory[item.category].push(item);
  });

  return (
    <div>
      {/* Coin balance */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
        <span style={{ fontSize: "1.4rem" }}>🪙</span>
        <span style={{ fontWeight: 700, fontSize: "1.1rem" }}>{coins ?? 0} coins</span>
        <span style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
          (earn coins by answering correctly)
        </span>
      </div>

      {/* Live avatar preview */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
        <AvatarDisplay equipped={equipped} size={96} />
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

      {/* Catalog grid per category */}
      {CATEGORY_ORDER.map((cat) => {
        const items = byCategory[cat] || [];
        if (!items.length) return null;
        return (
          <div key={cat} style={{ marginBottom: 22 }}>
            <p className="section-label">{CATEGORY_LABELS[cat] || cat}</p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 8,
              }}
            >
              {items.map((item) => {
                const isEquipped = equipped?.[item.category] === item.id;
                const isOwned    = ownedSet.has(item.id);
                const canAfford  = (coins ?? 0) >= item.price;
                const isBusy     = busyItem === item.id;
                const asset      = assetFor(item.id);
                const isColour   = item.category === "colour";
                const isCssColor = isColour && asset && asset.startsWith("#");

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
                    {/* Asset preview */}
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
                      {isCssColor ? (
                        <span
                          style={{
                            display: "inline-block",
                            width: 28,
                            height: 28,
                            borderRadius: "50%",
                            background: asset,
                            border: "2px solid rgba(0,0,0,0.1)",
                          }}
                        />
                      ) : asset ? (
                        asset
                      ) : (
                        <span style={{ color: "var(--muted)", fontSize: "0.8rem" }}>—</span>
                      )}
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
                        title={canAfford ? `Buy for ${item.price} coins` : `Need ${item.price - (coins ?? 0)} more coins`}
                      >
                        {isBusy ? "…" : "Buy"}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {(!catalog || catalog.length === 0) && (
        <p className="subtitle">No items in the catalog yet.</p>
      )}
    </div>
  );
}
