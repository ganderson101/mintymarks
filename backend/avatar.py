"""Avatar router — cosmetic items + coin economy (MIN-77).

Endpoints (all scoped to the authenticated user):
  GET  /avatar/me                      — current state: coins, equipped, owned, catalog
  POST /avatar/purchase {itemId}       — buy a paid item; deducts coins
  POST /avatar/equip    {category, itemId} — equip an owned item
"""
import json

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from auth import get_current_user
from avatar_catalog import CATALOG, FREE_IDS, CATEGORIES, default_avatar, get_item
from database import get_conn

router = APIRouter(prefix="/avatar", tags=["avatar"])


class PurchaseIn(BaseModel):
    itemId: str


class EquipIn(BaseModel):
    category: str
    itemId: str


def _load_state(conn, user_id: int) -> tuple:
    """Return (coins, equipped_dict, owned_set) for the user — within a conn."""
    row = conn.execute(
        "SELECT coins, avatar FROM users WHERE id = ?", (user_id,)
    ).fetchone()
    coins = row["coins"]
    equipped = json.loads(row["avatar"]) if row["avatar"] else default_avatar()

    rows = conn.execute(
        "SELECT item_id FROM avatar_unlocks WHERE user_id = ?", (user_id,)
    ).fetchall()
    purchased = {r["item_id"] for r in rows}
    owned = FREE_IDS | purchased
    return coins, equipped, owned


@router.get("/me")
def get_avatar(user=Depends(get_current_user)):
    with get_conn() as conn:
        coins, equipped, owned = _load_state(conn, user["id"])
    return {
        "coins":    coins,
        "equipped": equipped,
        "owned":    sorted(owned),
        "catalog":  CATALOG,
    }


@router.post("/purchase", status_code=status.HTTP_200_OK)
def purchase_item(body: PurchaseIn, user=Depends(get_current_user)):
    item = get_item(body.itemId)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    if item["price"] == 0:
        raise HTTPException(status_code=400, detail="Item is free — no purchase needed")

    with get_conn() as conn:
        coins, _, owned = _load_state(conn, user["id"])

        if body.itemId in owned:
            raise HTTPException(status_code=409, detail="Item already owned")
        if coins < item["price"]:
            raise HTTPException(status_code=402, detail="Insufficient coins")

        conn.execute(
            "UPDATE users SET coins = coins - ? WHERE id = ?",
            (item["price"], user["id"]),
        )
        conn.execute(
            "INSERT INTO avatar_unlocks (user_id, item_id) VALUES (?, ?)",
            (user["id"], body.itemId),
        )
        new_coins = conn.execute(
            "SELECT coins FROM users WHERE id = ?", (user["id"],)
        ).fetchone()["coins"]

    # Guard: coins must never go negative (belt-and-suspenders)
    if new_coins < 0:
        raise HTTPException(status_code=500, detail="Coin underflow — transaction rolled back")

    return {"ok": True, "coins": new_coins}


@router.post("/equip", status_code=status.HTTP_200_OK)
def equip_item(body: EquipIn, user=Depends(get_current_user)):
    item = get_item(body.itemId)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    if item["category"] != body.category:
        raise HTTPException(status_code=400, detail="Category mismatch")
    if body.category not in CATEGORIES:
        raise HTTPException(status_code=400, detail="Unknown category")

    with get_conn() as conn:
        _, equipped, owned = _load_state(conn, user["id"])

        if body.itemId not in owned:
            raise HTTPException(status_code=403, detail="Item not owned — purchase it first")

        equipped[body.category] = body.itemId
        conn.execute(
            "UPDATE users SET avatar = ? WHERE id = ?",
            (json.dumps(equipped), user["id"]),
        )

    return {"ok": True, "equipped": equipped}
