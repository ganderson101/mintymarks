"""Avatar item catalog for MintyMarks cosmetics (MIN-77).

12 items across 4 categories: base / colour / hat / accessory.
Each category has at least one free default (price=0) so every new child
gets a complete avatar without spending any coins.
"""

CATALOG = [
    # base — character body
    {"id": "base_default",  "category": "base",      "name": "Classic",      "price": 0},
    {"id": "base_star",     "category": "base",      "name": "Star Kid",     "price": 10},
    {"id": "base_robot",    "category": "base",      "name": "Robot",        "price": 15},
    # colour — colour theme
    {"id": "colour_blue",   "category": "colour",    "name": "Ocean Blue",   "price": 0},
    {"id": "colour_green",  "category": "colour",    "name": "Minty Green",  "price": 10},
    {"id": "colour_purple", "category": "colour",    "name": "Royal Purple", "price": 15},
    # hat — headwear
    {"id": "hat_none",      "category": "hat",       "name": "No Hat",       "price": 0},
    {"id": "hat_cap",       "category": "hat",       "name": "Baseball Cap", "price": 5},
    {"id": "hat_crown",     "category": "hat",       "name": "Crown",        "price": 20},
    # accessory
    {"id": "acc_none",      "category": "accessory", "name": "No Accessory", "price": 0},
    {"id": "acc_glasses",   "category": "accessory", "name": "Glasses",      "price": 5},
    {"id": "acc_bowtie",    "category": "accessory", "name": "Bow Tie",      "price": 10},
]

_BY_ID: dict = {item["id"]: item for item in CATALOG}

# First free item per category — used as the default equipped state
_DEFAULTS: dict = {}
for _item in CATALOG:
    _cat = _item["category"]
    if _cat not in _DEFAULTS and _item["price"] == 0:
        _DEFAULTS[_cat] = _item["id"]

CATEGORIES: list = list(_DEFAULTS.keys())

# Set of all free item IDs — these are "owned" by everyone without purchase
FREE_IDS: frozenset = frozenset(item["id"] for item in CATALOG if item["price"] == 0)


def get_item(item_id: str) -> dict | None:
    """Return catalog entry or None."""
    return _BY_ID.get(item_id)


def default_avatar() -> dict:
    """Return {category: item_id} mapping of free defaults for all categories."""
    return dict(_DEFAULTS)
