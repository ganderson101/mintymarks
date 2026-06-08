"""Avatar item catalog for MintyMarks cosmetics (MIN-77 / MIN-100 / MIN-108).

180 items across 10 categories: character / colour / background / hat /
accessory / held / pet / effect / hair / clothes.

Render-hint schema (single source of truth for the frontend):
  {"kind": "emoji",    "value": "🦊"}
  {"kind": "color",    "value": "#3b82f6"}
  {"kind": "gradient", "value": "linear-gradient(...)"}
  {"kind": "frame",    "value": "#fbbf24", "style": "solid|double|glow"}
  {"kind": "effect",   "value": "✨", "anim": "sparkle|float|pulse"}

Hair render notes (MIN-108):
  - kind="emoji", value=""  → default/no overlay (base character's hair shows)
  - kind="color", value="#hex" → hair colour overlay (frontend tints the hair layer)
  - kind="gradient", value="linear-gradient(...)" → multi-colour hair effect
  Hair sits BELOW hats in z-order; ABOVE the base character layer.

Clothes render notes (MIN-108):
  - kind="emoji", value="👕" → outfit emoji overlaid on the body/lower area
  - kind="color", value="#hex" → solid-colour top overlay
  - kind="gradient", value="linear-gradient(...)" → special-effect outfit
  Clothes sit BELOW the character head layer in z-order (body area).

Economy rules:
  price tiers: 0 (free default), 5 (common), 15 (uncommon), 40 (rare), 100 (legendary)
  Exactly ONE price-0 item per category so every child has a complete free avatar.

Backward-compat: all 12 original IDs are preserved with their original category
key (base_* items now live in the "character" category; existing equipped/
purchased state for those IDs remains valid).
"""

CATALOG = [
    # ── character ──────────────────────────────────────────────────────────────
    # Original base_* IDs kept intact; category renamed base → character.
    {"id": "base_default",    "category": "character", "name": "Classic Kid",      "price":   0, "render": {"kind": "emoji", "value": "👦"}},
    {"id": "base_star",       "category": "character", "name": "Star Kid",         "price":   5, "render": {"kind": "emoji", "value": "⭐"}},
    {"id": "base_robot",      "category": "character", "name": "Robot",            "price":  15, "render": {"kind": "emoji", "value": "🤖"}},
    {"id": "char_girl",       "category": "character", "name": "Cool Girl",        "price":   5, "render": {"kind": "emoji", "value": "👧"}},
    {"id": "char_baby",       "category": "character", "name": "Baby Face",        "price":   5, "render": {"kind": "emoji", "value": "👶"}},
    {"id": "char_ninja",      "category": "character", "name": "Ninja",            "price":  15, "render": {"kind": "emoji", "value": "🥷"}},
    {"id": "char_zombie",     "category": "character", "name": "Zombie",           "price":  15, "render": {"kind": "emoji", "value": "🧟"}},
    {"id": "char_alien",      "category": "character", "name": "Alien",            "price":  15, "render": {"kind": "emoji", "value": "👽"}},
    {"id": "char_clown",      "category": "character", "name": "Clown",            "price":   5, "render": {"kind": "emoji", "value": "🤡"}},
    {"id": "char_ghost",      "category": "character", "name": "Ghost",            "price":   5, "render": {"kind": "emoji", "value": "👻"}},
    {"id": "char_vampire",    "category": "character", "name": "Vampire",          "price":  40, "render": {"kind": "emoji", "value": "🧛"}},
    {"id": "char_fairy",      "category": "character", "name": "Fairy",            "price":  40, "render": {"kind": "emoji", "value": "🧚"}},
    {"id": "char_mage",       "category": "character", "name": "Mage",             "price":  40, "render": {"kind": "emoji", "value": "🧙"}},
    {"id": "char_cat",        "category": "character", "name": "Cat Face",         "price":   5, "render": {"kind": "emoji", "value": "🐱"}},
    {"id": "char_dog",        "category": "character", "name": "Dog Face",         "price":   5, "render": {"kind": "emoji", "value": "🐶"}},
    {"id": "char_fox",        "category": "character", "name": "Fox Face",         "price":  15, "render": {"kind": "emoji", "value": "🦊"}},
    {"id": "char_bear",       "category": "character", "name": "Bear Face",        "price":   5, "render": {"kind": "emoji", "value": "🐻"}},
    {"id": "char_panda",      "category": "character", "name": "Panda Face",       "price":  15, "render": {"kind": "emoji", "value": "🐼"}},
    {"id": "char_lion",       "category": "character", "name": "Lion Face",        "price":  15, "render": {"kind": "emoji", "value": "🦁"}},
    {"id": "char_frog",       "category": "character", "name": "Frog Face",        "price":   5, "render": {"kind": "emoji", "value": "🐸"}},
    {"id": "char_monkey",     "category": "character", "name": "Monkey Face",      "price":   5, "render": {"kind": "emoji", "value": "🐵"}},
    {"id": "char_penguin",    "category": "character", "name": "Penguin",          "price":  15, "render": {"kind": "emoji", "value": "🐧"}},
    {"id": "char_owl",        "category": "character", "name": "Owl",              "price":  15, "render": {"kind": "emoji", "value": "🦉"}},
    {"id": "char_pizza",      "category": "character", "name": "Pizza Face",       "price":   5, "render": {"kind": "emoji", "value": "🍕"}},
    {"id": "char_donut",      "category": "character", "name": "Donut Head",       "price":   5, "render": {"kind": "emoji", "value": "🍩"}},
    {"id": "char_taco",       "category": "character", "name": "Taco Face",        "price":   5, "render": {"kind": "emoji", "value": "🌮"}},
    {"id": "char_detective",  "category": "character", "name": "Detective",        "price":  40, "render": {"kind": "emoji", "value": "🕵️"}},
    {"id": "char_astronaut",  "category": "character", "name": "Astronaut",        "price":  40, "render": {"kind": "emoji", "value": "👨‍🚀"}},
    {"id": "char_dragon",     "category": "character", "name": "Dragon Face",      "price": 100, "render": {"kind": "emoji", "value": "🐲"}},
    {"id": "char_unicorn",    "category": "character", "name": "Unicorn Face",     "price": 100, "render": {"kind": "emoji", "value": "🦄"}},

    # ── colour ─────────────────────────────────────────────────────────────────
    {"id": "colour_blue",     "category": "colour", "name": "Ocean Blue",          "price":   0, "render": {"kind": "color", "value": "#3b82f6"}},
    {"id": "colour_green",    "category": "colour", "name": "Minty Green",         "price":   5, "render": {"kind": "color", "value": "#10b981"}},
    {"id": "colour_purple",   "category": "colour", "name": "Royal Purple",        "price":  15, "render": {"kind": "color", "value": "#8b5cf6"}},
    {"id": "colour_red",      "category": "colour", "name": "Crimson Red",         "price":   5, "render": {"kind": "color", "value": "#ef4444"}},
    {"id": "colour_yellow",   "category": "colour", "name": "Sunny Yellow",        "price":   5, "render": {"kind": "color", "value": "#fbbf24"}},
    {"id": "colour_pink",     "category": "colour", "name": "Bubblegum Pink",      "price":   5, "render": {"kind": "color", "value": "#ec4899"}},
    {"id": "colour_orange",   "category": "colour", "name": "Tangerine",           "price":   5, "render": {"kind": "color", "value": "#f97316"}},
    {"id": "colour_teal",     "category": "colour", "name": "Teal",                "price":  15, "render": {"kind": "color", "value": "#14b8a6"}},
    {"id": "colour_indigo",   "category": "colour", "name": "Deep Indigo",         "price":  15, "render": {"kind": "color", "value": "#6366f1"}},
    {"id": "colour_lime",     "category": "colour", "name": "Lime Zest",           "price":   5, "render": {"kind": "color", "value": "#84cc16"}},
    {"id": "colour_sky",      "category": "colour", "name": "Sky Blue",            "price":   5, "render": {"kind": "color", "value": "#0ea5e9"}},
    {"id": "colour_rose",     "category": "colour", "name": "Rose",                "price":  15, "render": {"kind": "color", "value": "#fb7185"}},
    {"id": "colour_amber",    "category": "colour", "name": "Amber",               "price":  15, "render": {"kind": "color", "value": "#d97706"}},
    {"id": "colour_cyan",     "category": "colour", "name": "Cyan",                "price":   5, "render": {"kind": "color", "value": "#06b6d4"}},
    {"id": "colour_gold",     "category": "colour", "name": "Gold",                "price":  40, "render": {"kind": "color", "value": "#f59e0b"}},
    {"id": "colour_silver",   "category": "colour", "name": "Silver",              "price":  40, "render": {"kind": "color", "value": "#94a3b8"}},

    # ── background (NEW) ───────────────────────────────────────────────────────
    {"id": "bg_none",         "category": "background", "name": "Plain White",     "price":   0, "render": {"kind": "color", "value": "#ffffff"}},
    {"id": "bg_sky",          "category": "background", "name": "Blue Sky",        "price":   5, "render": {"kind": "gradient", "value": "linear-gradient(180deg,#87ceeb,#b0e2ff)"}},
    {"id": "bg_sunset",       "category": "background", "name": "Sunset",          "price":  15, "render": {"kind": "gradient", "value": "linear-gradient(180deg,#ff7f50,#ffb347)"}},
    {"id": "bg_ocean",        "category": "background", "name": "Deep Ocean",      "price":  15, "render": {"kind": "gradient", "value": "linear-gradient(180deg,#1e3a5f,#0ea5e9)"}},
    {"id": "bg_forest",       "category": "background", "name": "Forest",          "price":   5, "render": {"kind": "gradient", "value": "linear-gradient(180deg,#2d5a27,#4ade80)"}},
    {"id": "bg_night",        "category": "background", "name": "Night Sky",       "price":  15, "render": {"kind": "gradient", "value": "linear-gradient(180deg,#0f0c29,#302b63)"}},
    {"id": "bg_candy",        "category": "background", "name": "Candy Land",      "price":  15, "render": {"kind": "gradient", "value": "linear-gradient(135deg,#ff9a9e,#fad0c4)"}},
    {"id": "bg_space",        "category": "background", "name": "Outer Space",     "price":  40, "render": {"kind": "gradient", "value": "linear-gradient(180deg,#000000,#0d0d2b)"}},
    {"id": "bg_lava",         "category": "background", "name": "Lava Flow",       "price":  40, "render": {"kind": "gradient", "value": "linear-gradient(180deg,#ff4500,#8b0000)"}},
    {"id": "bg_aurora",       "category": "background", "name": "Aurora",          "price":  40, "render": {"kind": "gradient", "value": "linear-gradient(135deg,#00c9ff,#92fe9d)"}},
    {"id": "bg_galaxy",       "category": "background", "name": "Galaxy",          "price": 100, "render": {"kind": "gradient", "value": "linear-gradient(135deg,#1a0533,#4776e6,#8e54e9)"}},
    {"id": "bg_rainbow",      "category": "background", "name": "Rainbow",         "price":  40, "render": {"kind": "gradient", "value": "linear-gradient(90deg,#ff0000,#ff7700,#ffff00,#00ff00,#0000ff,#8b00ff)"}},
    {"id": "bg_mint",         "category": "background", "name": "Mint Fresh",      "price":   5, "render": {"kind": "color", "value": "#d1fae5"}},
    {"id": "bg_lavender",     "category": "background", "name": "Lavender",        "price":   5, "render": {"kind": "color", "value": "#ede9fe"}},

    # ── hat ────────────────────────────────────────────────────────────────────
    {"id": "hat_none",        "category": "hat", "name": "No Hat",                 "price":   0, "render": {"kind": "emoji", "value": ""}},
    {"id": "hat_cap",         "category": "hat", "name": "Baseball Cap",           "price":   5, "render": {"kind": "emoji", "value": "🧢"}},
    {"id": "hat_crown",       "category": "hat", "name": "Crown",                  "price":  40, "render": {"kind": "emoji", "value": "👑"}},
    {"id": "hat_tophat",      "category": "hat", "name": "Top Hat",                "price":  15, "render": {"kind": "emoji", "value": "🎩"}},
    {"id": "hat_wizard",      "category": "hat", "name": "Wizard Hat",             "price":  40, "render": {"kind": "emoji", "value": "🧙"}},
    {"id": "hat_party",       "category": "hat", "name": "Party Hat",              "price":   5, "render": {"kind": "emoji", "value": "🎊"}},
    {"id": "hat_graduation",  "category": "hat", "name": "Graduation Cap",         "price":  15, "render": {"kind": "emoji", "value": "🎓"}},
    {"id": "hat_helmet",      "category": "hat", "name": "Hero Helmet",            "price":  15, "render": {"kind": "emoji", "value": "⛑️"}},
    {"id": "hat_cowboy",      "category": "hat", "name": "Cowboy Hat",             "price":   5, "render": {"kind": "emoji", "value": "🤠"}},
    {"id": "hat_beanie",      "category": "hat", "name": "Beanie",                 "price":   5, "render": {"kind": "emoji", "value": "🧶"}},
    {"id": "hat_santa",       "category": "hat", "name": "Santa Hat",              "price":  15, "render": {"kind": "emoji", "value": "🎅"}},
    {"id": "hat_pirate",      "category": "hat", "name": "Pirate Hat",             "price":  15, "render": {"kind": "emoji", "value": "🏴‍☠️"}},
    {"id": "hat_horns",       "category": "hat", "name": "Devil Horns",            "price":  15, "render": {"kind": "emoji", "value": "😈"}},
    {"id": "hat_halo",        "category": "hat", "name": "Angel Halo",             "price":   5, "render": {"kind": "emoji", "value": "😇"}},
    {"id": "hat_flower",      "category": "hat", "name": "Flower Crown",           "price":   5, "render": {"kind": "emoji", "value": "🌸"}},
    {"id": "hat_hardhat",     "category": "hat", "name": "Hard Hat",               "price":   5, "render": {"kind": "emoji", "value": "🪖"}},
    {"id": "hat_fedora",      "category": "hat", "name": "Fedora",                 "price":  15, "render": {"kind": "emoji", "value": "🕵️"}},
    {"id": "hat_tiara",       "category": "hat", "name": "Tiara",                  "price":  40, "render": {"kind": "emoji", "value": "💎"}},
    {"id": "hat_sombrero",    "category": "hat", "name": "Sombrero",               "price":  15, "render": {"kind": "emoji", "value": "🪅"}},
    {"id": "hat_viking",      "category": "hat", "name": "Viking Helmet",          "price":  40, "render": {"kind": "emoji", "value": "⚔️"}},
    {"id": "hat_chef",        "category": "hat", "name": "Chef's Hat",             "price":   5, "render": {"kind": "emoji", "value": "👨‍🍳"}},
    {"id": "hat_space",       "category": "hat", "name": "Space Helmet",           "price": 100, "render": {"kind": "emoji", "value": "🚀"}},

    # ── accessory (face) ───────────────────────────────────────────────────────
    {"id": "acc_none",        "category": "accessory", "name": "No Accessory",     "price":   0, "render": {"kind": "emoji", "value": ""}},
    {"id": "acc_glasses",     "category": "accessory", "name": "Glasses",          "price":   5, "render": {"kind": "emoji", "value": "👓"}},
    {"id": "acc_bowtie",      "category": "accessory", "name": "Bow Tie",          "price":  15, "render": {"kind": "emoji", "value": "🎀"}},
    {"id": "acc_shades",      "category": "accessory", "name": "Cool Shades",      "price":   5, "render": {"kind": "emoji", "value": "🕶️"}},
    {"id": "acc_scarf",       "category": "accessory", "name": "Scarf",            "price":   5, "render": {"kind": "emoji", "value": "🧣"}},
    {"id": "acc_medal",       "category": "accessory", "name": "Gold Medal",       "price":  40, "render": {"kind": "emoji", "value": "🥇"}},
    {"id": "acc_headphones",  "category": "accessory", "name": "Headphones",       "price":  15, "render": {"kind": "emoji", "value": "🎧"}},
    {"id": "acc_monocle",     "category": "accessory", "name": "Monocle",          "price":  15, "render": {"kind": "emoji", "value": "🧐"}},
    {"id": "acc_mask",        "category": "accessory", "name": "Superhero Mask",   "price":  15, "render": {"kind": "emoji", "value": "🦸"}},
    {"id": "acc_eyepatch",    "category": "accessory", "name": "Eye Patch",        "price":  15, "render": {"kind": "emoji", "value": "🏴‍☠️"}},
    {"id": "acc_snorkel",     "category": "accessory", "name": "Snorkel",          "price":   5, "render": {"kind": "emoji", "value": "🤿"}},
    {"id": "acc_vr",          "category": "accessory", "name": "VR Headset",       "price":  40, "render": {"kind": "emoji", "value": "🥽"}},
    {"id": "acc_bandana",     "category": "accessory", "name": "Bandana",          "price":   5, "render": {"kind": "emoji", "value": "🪢"}},
    {"id": "acc_nerd",        "category": "accessory", "name": "Nerd Glasses",     "price":   5, "render": {"kind": "emoji", "value": "🤓"}},
    {"id": "acc_heart_eyes",  "category": "accessory", "name": "Heart Glasses",    "price":  40, "render": {"kind": "emoji", "value": "😍"}},
    {"id": "acc_earring",     "category": "accessory", "name": "Earring",          "price":   5, "render": {"kind": "emoji", "value": "💍"}},
    {"id": "acc_necklace",    "category": "accessory", "name": "Necklace",         "price":  15, "render": {"kind": "emoji", "value": "📿"}},
    {"id": "acc_flower_hair", "category": "accessory", "name": "Flower Hair",      "price":   5, "render": {"kind": "emoji", "value": "💐"}},
    {"id": "acc_lightning",   "category": "accessory", "name": "Lightning Bolt",   "price":  15, "render": {"kind": "emoji", "value": "⚡"}},
    {"id": "acc_star_face",   "category": "accessory", "name": "Star Face Paint",  "price":  40, "render": {"kind": "emoji", "value": "⭐"}},
    {"id": "acc_rose",        "category": "accessory", "name": "Rose",             "price":   5, "render": {"kind": "emoji", "value": "🌹"}},
    {"id": "acc_rainbow",     "category": "accessory", "name": "Rainbow Glasses",  "price": 100, "render": {"kind": "emoji", "value": "🌈"}},

    # ── held (NEW) ─────────────────────────────────────────────────────────────
    {"id": "held_none",       "category": "held", "name": "Empty Hands",           "price":   0, "render": {"kind": "emoji", "value": ""}},
    {"id": "held_wand",       "category": "held", "name": "Magic Wand",            "price":  15, "render": {"kind": "emoji", "value": "🪄"}},
    {"id": "held_book",       "category": "held", "name": "Spell Book",            "price":  15, "render": {"kind": "emoji", "value": "📚"}},
    {"id": "held_ball",       "category": "held", "name": "Ball",                  "price":   5, "render": {"kind": "emoji", "value": "⚽"}},
    {"id": "held_balloon",    "category": "held", "name": "Balloon",               "price":   5, "render": {"kind": "emoji", "value": "🎈"}},
    {"id": "held_trophy",     "category": "held", "name": "Trophy",                "price":  40, "render": {"kind": "emoji", "value": "🏆"}},
    {"id": "held_sword",      "category": "held", "name": "Sword",                 "price":  40, "render": {"kind": "emoji", "value": "⚔️"}},
    {"id": "held_shield",     "category": "held", "name": "Shield",                "price":  15, "render": {"kind": "emoji", "value": "🛡️"}},
    {"id": "held_flower",     "category": "held", "name": "Bouquet",               "price":   5, "render": {"kind": "emoji", "value": "💐"}},
    {"id": "held_potion",     "category": "held", "name": "Magic Potion",          "price":  15, "render": {"kind": "emoji", "value": "⚗️"}},
    {"id": "held_pizza",      "category": "held", "name": "Pizza Slice",           "price":   5, "render": {"kind": "emoji", "value": "🍕"}},
    {"id": "held_ice_cream",  "category": "held", "name": "Ice Cream",             "price":   5, "render": {"kind": "emoji", "value": "🍦"}},
    {"id": "held_phone",      "category": "held", "name": "Phone",                 "price":   5, "render": {"kind": "emoji", "value": "📱"}},
    {"id": "held_camera",     "category": "held", "name": "Camera",                "price":  15, "render": {"kind": "emoji", "value": "📷"}},
    {"id": "held_gem",        "category": "held", "name": "Giant Gem",             "price": 100, "render": {"kind": "emoji", "value": "💎"}},
    {"id": "held_lightning",  "category": "held", "name": "Lightning Strike",      "price":  40, "render": {"kind": "emoji", "value": "⚡"}},

    # ── pet (NEW) ──────────────────────────────────────────────────────────────
    {"id": "pet_none",        "category": "pet", "name": "No Pet",                 "price":   0, "render": {"kind": "emoji", "value": ""}},
    {"id": "pet_dog",         "category": "pet", "name": "Puppy",                  "price":  15, "render": {"kind": "emoji", "value": "🐶"}},
    {"id": "pet_cat",         "category": "pet", "name": "Kitten",                 "price":  15, "render": {"kind": "emoji", "value": "🐱"}},
    {"id": "pet_dragon",      "category": "pet", "name": "Baby Dragon",            "price": 100, "render": {"kind": "emoji", "value": "🐲"}},
    {"id": "pet_unicorn",     "category": "pet", "name": "Unicorn",                "price": 100, "render": {"kind": "emoji", "value": "🦄"}},
    {"id": "pet_dino",        "category": "pet", "name": "Dino",                   "price":  40, "render": {"kind": "emoji", "value": "🦕"}},
    {"id": "pet_rabbit",      "category": "pet", "name": "Bunny",                  "price":   5, "render": {"kind": "emoji", "value": "🐰"}},
    {"id": "pet_hamster",     "category": "pet", "name": "Hamster",                "price":   5, "render": {"kind": "emoji", "value": "🐹"}},
    {"id": "pet_chick",       "category": "pet", "name": "Baby Chick",             "price":   5, "render": {"kind": "emoji", "value": "🐥"}},
    {"id": "pet_turtle",      "category": "pet", "name": "Turtle",                 "price":   5, "render": {"kind": "emoji", "value": "🐢"}},
    {"id": "pet_butterfly",   "category": "pet", "name": "Butterfly",              "price":  15, "render": {"kind": "emoji", "value": "🦋"}},
    {"id": "pet_penguin",     "category": "pet", "name": "Penguin Pal",            "price":  15, "render": {"kind": "emoji", "value": "🐧"}},
    {"id": "pet_fox",         "category": "pet", "name": "Fox Cub",                "price":  40, "render": {"kind": "emoji", "value": "🦊"}},
    {"id": "pet_panda",       "category": "pet", "name": "Panda Cub",              "price":  40, "render": {"kind": "emoji", "value": "🐼"}},
    {"id": "pet_lion_cub",    "category": "pet", "name": "Lion Cub",               "price":  40, "render": {"kind": "emoji", "value": "🦁"}},
    {"id": "pet_octopus",     "category": "pet", "name": "Octopus",                "price":  15, "render": {"kind": "emoji", "value": "🐙"}},
    {"id": "pet_ghost",       "category": "pet", "name": "Ghost Pal",              "price":  15, "render": {"kind": "emoji", "value": "👻"}},
    {"id": "pet_robot",       "category": "pet", "name": "Robot Pet",              "price":  40, "render": {"kind": "emoji", "value": "🤖"}},
    {"id": "pet_alien",       "category": "pet", "name": "Alien Buddy",            "price":  40, "render": {"kind": "emoji", "value": "👽"}},
    {"id": "pet_phoenix",     "category": "pet", "name": "Phoenix",                "price": 100, "render": {"kind": "emoji", "value": "🦅"}},

    # ── effect (NEW) ───────────────────────────────────────────────────────────
    {"id": "effect_none",     "category": "effect", "name": "No Effect",           "price":   0, "render": {"kind": "effect", "value": "",   "anim": "sparkle"}},
    {"id": "effect_sparkles", "category": "effect", "name": "Sparkles",            "price":   5, "render": {"kind": "effect", "value": "✨", "anim": "sparkle"}},
    {"id": "effect_stars",    "category": "effect", "name": "Stars",               "price":  15, "render": {"kind": "effect", "value": "⭐", "anim": "float"}},
    {"id": "effect_hearts",   "category": "effect", "name": "Hearts",              "price":   5, "render": {"kind": "effect", "value": "💕", "anim": "float"}},
    {"id": "effect_fire",     "category": "effect", "name": "Fire Aura",           "price":  40, "render": {"kind": "effect", "value": "🔥", "anim": "pulse"}},
    {"id": "effect_rainbow",  "category": "effect", "name": "Rainbow Aura",        "price": 100, "render": {"kind": "effect", "value": "🌈", "anim": "sparkle"}},
    {"id": "effect_lightning","category": "effect", "name": "Lightning",           "price":  40, "render": {"kind": "effect", "value": "⚡", "anim": "pulse"}},
    {"id": "effect_snow",     "category": "effect", "name": "Snowflakes",          "price":  15, "render": {"kind": "effect", "value": "❄️", "anim": "float"}},
    {"id": "effect_bubbles",  "category": "effect", "name": "Bubbles",             "price":   5, "render": {"kind": "effect", "value": "🫧", "anim": "float"}},
    {"id": "effect_music",    "category": "effect", "name": "Music Notes",         "price":   5, "render": {"kind": "effect", "value": "🎵", "anim": "float"}},

    # ── hair (MIN-108) ─────────────────────────────────────────────────────────
    # Default: empty emoji = no overlay; base character's hair shows through.
    # Paid items use kind="color" (hair-colour overlay) or kind="gradient"
    # (multi-colour effects). Frontend applies these as a hair-layer tint
    # sitting above the character layer but below the hat layer in z-order.
    {"id": "hair_default",    "category": "hair", "name": "Natural",              "price":   0, "render": {"kind": "emoji",    "value": ""}},
    {"id": "hair_brown",      "category": "hair", "name": "Chestnut Brown",       "price":   5, "render": {"kind": "color",    "value": "#6b3a2a"}},
    {"id": "hair_black",      "category": "hair", "name": "Jet Black",            "price":   5, "render": {"kind": "color",    "value": "#1c1c1c"}},
    {"id": "hair_blonde",     "category": "hair", "name": "Golden Blonde",        "price":   5, "render": {"kind": "color",    "value": "#f0c040"}},
    {"id": "hair_red",        "category": "hair", "name": "Fiery Red",            "price":   5, "render": {"kind": "color",    "value": "#c0392b"}},
    {"id": "hair_auburn",     "category": "hair", "name": "Auburn",               "price":  15, "render": {"kind": "color",    "value": "#922b21"}},
    {"id": "hair_grey",       "category": "hair", "name": "Silver Grey",          "price":  15, "render": {"kind": "color",    "value": "#95a5a6"}},
    {"id": "hair_white",      "category": "hair", "name": "Snowy White",          "price":  15, "render": {"kind": "color",    "value": "#ecf0f1"}},
    {"id": "hair_pink",       "category": "hair", "name": "Cotton Candy Pink",    "price":  15, "render": {"kind": "color",    "value": "#ff69b4"}},
    {"id": "hair_blue",       "category": "hair", "name": "Deep Blue",            "price":  15, "render": {"kind": "color",    "value": "#3498db"}},
    {"id": "hair_purple",     "category": "hair", "name": "Violet",               "price":  15, "render": {"kind": "color",    "value": "#9b59b6"}},
    {"id": "hair_green",      "category": "hair", "name": "Emerald",              "price":  40, "render": {"kind": "color",    "value": "#27ae60"}},
    {"id": "hair_rainbow",    "category": "hair", "name": "Rainbow",              "price":  40, "render": {"kind": "gradient", "value": "linear-gradient(90deg,#ff0000,#ff7700,#ffff00,#00ff00,#0000ff,#8b00ff)"}},
    {"id": "hair_galaxy",     "category": "hair", "name": "Galaxy",               "price": 100, "render": {"kind": "gradient", "value": "linear-gradient(135deg,#1a0533,#4776e6,#8e54e9)"}},

    # ── clothes (MIN-108) ──────────────────────────────────────────────────────
    # Default: plain white t-shirt emoji = base outfit; always free.
    # Paid emoji items = distinct outfit types (rendered as emoji overlay on
    # body/lower area). Paid color/gradient items = tinted outfit overlays.
    # Frontend places clothes above the background but below the character head
    # in z-order (body area only).
    {"id": "clothes_default",  "category": "clothes", "name": "Plain White Top",  "price":   0, "render": {"kind": "emoji",    "value": "👕"}},
    {"id": "clothes_polo",     "category": "clothes", "name": "Polo Shirt",       "price":   5, "render": {"kind": "emoji",    "value": "👚"}},
    {"id": "clothes_dress",    "category": "clothes", "name": "Summer Dress",     "price":   5, "render": {"kind": "emoji",    "value": "👗"}},
    {"id": "clothes_vest",     "category": "clothes", "name": "Safety Vest",      "price":   5, "render": {"kind": "emoji",    "value": "🦺"}},
    {"id": "clothes_sporty",   "category": "clothes", "name": "Sporty Top",       "price":   5, "render": {"kind": "emoji",    "value": "🎽"}},
    {"id": "clothes_swimsuit", "category": "clothes", "name": "Swimsuit",         "price":   5, "render": {"kind": "emoji",    "value": "🩱"}},
    {"id": "clothes_coat",     "category": "clothes", "name": "Winter Coat",      "price":  15, "render": {"kind": "emoji",    "value": "🧥"}},
    {"id": "clothes_kimono",   "category": "clothes", "name": "Kimono",           "price":  15, "render": {"kind": "emoji",    "value": "👘"}},
    {"id": "clothes_sari",     "category": "clothes", "name": "Sari",             "price":  15, "render": {"kind": "emoji",    "value": "🥻"}},
    {"id": "clothes_tie",      "category": "clothes", "name": "Shirt & Tie",      "price":  15, "render": {"kind": "emoji",    "value": "👔"}},
    {"id": "clothes_purple",   "category": "clothes", "name": "Purple Top",       "price":  15, "render": {"kind": "color",    "value": "#8b5cf6"}},
    {"id": "clothes_tuxedo",   "category": "clothes", "name": "Tuxedo",           "price":  40, "render": {"kind": "emoji",    "value": "🤵"}},
    {"id": "clothes_lab_coat", "category": "clothes", "name": "Lab Coat",         "price":  40, "render": {"kind": "emoji",    "value": "🥼"}},
    {"id": "clothes_gold",     "category": "clothes", "name": "Gold Outfit",      "price":  40, "render": {"kind": "color",    "value": "#f59e0b"}},
    {"id": "clothes_rainbow",  "category": "clothes", "name": "Rainbow Jacket",   "price": 100, "render": {"kind": "gradient", "value": "linear-gradient(90deg,#ff0000,#ff7700,#ffff00,#00ff00,#0000ff,#8b00ff)"}},
    {"id": "clothes_galaxy",   "category": "clothes", "name": "Galaxy Print",     "price": 100, "render": {"kind": "gradient", "value": "linear-gradient(135deg,#1a0533,#4776e6,#8e54e9)"}},
]

VALID_PRICES: frozenset = frozenset({0, 5, 15, 40, 100})

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
    """Return {category: item_id} mapping of free defaults for all 10 categories."""
    return dict(_DEFAULTS)
