#!/usr/bin/env python3
"""MIN-98 wave 2: KS2 Biology - Plants (20 new, 0021-0040)
Target dist: A=10 B=2 C=0 D=8
"""
import json, sys
from collections import Counter

NEW_Q = [
  {
    "id": "ks2_bio_plants_0021",
    "level": "ks2",
    "subject": "biology",
    "category": "Plants",
    "text": "What is the main job of the stem in a plant?",
    "options": {
      "A": "To support the plant and carry water and nutrients up to the leaves",
      "B": "To absorb sunlight for photosynthesis",
      "C": "To take in water from the soil",
      "D": "To make seeds for the plant"
    },
    "correct": "A",
    "difficulty": 1
  },
  {
    "id": "ks2_bio_plants_0022",
    "level": "ks2",
    "subject": "biology",
    "category": "Plants",
    "text": "What does the phloem carry around a plant?",
    "options": {
      "A": "Water from the roots",
      "B": "Oxygen from the air",
      "C": "Minerals from the soil",
      "D": "Sugar and food made in the leaves"
    },
    "correct": "D",
    "difficulty": 2
  },
  {
    "id": "ks2_bio_plants_0023",
    "level": "ks2",
    "subject": "biology",
    "category": "Plants",
    "text": "After fertilisation, which part of the flower grows into a fruit?",
    "options": {
      "A": "The ovary",
      "B": "The petal",
      "C": "The stamen",
      "D": "The sepal"
    },
    "correct": "A",
    "difficulty": 2
  },
  {
    "id": "ks2_bio_plants_0024",
    "level": "ks2",
    "subject": "biology",
    "category": "Plants",
    "text": "Which set of conditions does a plant need to grow well?",
    "options": {
      "A": "Darkness, cold temperatures, and salty water",
      "B": "Bright light only, with no water needed",
      "C": "Water and warmth, but no light at all",
      "D": "Light, water, warmth, and nutrients from the soil"
    },
    "correct": "D",
    "difficulty": 1
  },
  {
    "id": "ks2_bio_plants_0025",
    "level": "ks2",
    "subject": "biology",
    "category": "Plants",
    "text": "What are the leaves of a plant mainly used for?",
    "options": {
      "A": "Making food by photosynthesis and exchanging gases",
      "B": "Absorbing water from the soil",
      "C": "Storing seeds until they are ready to grow",
      "D": "Carrying water up from the roots"
    },
    "correct": "A",
    "difficulty": 1
  },
  {
    "id": "ks2_bio_plants_0026",
    "level": "ks2",
    "subject": "biology",
    "category": "Plants",
    "text": "What are the two types of pollination?",
    "options": {
      "A": "Wind pollination and water pollination",
      "B": "Self-pollination and cross-pollination",
      "C": "Insect pollination and bird pollination",
      "D": "Night pollination and day pollination"
    },
    "correct": "B",
    "difficulty": 2
  },
  {
    "id": "ks2_bio_plants_0027",
    "level": "ks2",
    "subject": "biology",
    "category": "Plants",
    "text": "How does a bee help a plant with pollination?",
    "options": {
      "A": "It carries pollen from one flower to another as it feeds on nectar",
      "B": "It waters the plant by collecting raindrops",
      "C": "It digs around the roots to loosen the soil",
      "D": "It eats harmful insects that damage the plant"
    },
    "correct": "A",
    "difficulty": 1
  },
  {
    "id": "ks2_bio_plants_0028",
    "level": "ks2",
    "subject": "biology",
    "category": "Plants",
    "text": "What happens to a plant if it does not get enough water?",
    "options": {
      "A": "It grows much taller than normal",
      "B": "It produces more flowers than usual",
      "C": "Its leaves turn bright green and grow bigger",
      "D": "It wilts and droops because its cells lose water"
    },
    "correct": "D",
    "difficulty": 1
  },
  {
    "id": "ks2_bio_plants_0029",
    "level": "ks2",
    "subject": "biology",
    "category": "Plants",
    "text": "Why do plants need minerals from the soil?",
    "options": {
      "A": "For healthy growth and to help make proteins",
      "B": "To help them produce oxygen during the night",
      "C": "To give their petals a bright colour",
      "D": "To help them move towards the light"
    },
    "correct": "A",
    "difficulty": 2
  },
  {
    "id": "ks2_bio_plants_0030",
    "level": "ks2",
    "subject": "biology",
    "category": "Plants",
    "text": "What is the job of the sepals on a flower?",
    "options": {
      "A": "To attract insects with bright colours",
      "B": "To produce pollen for reproduction",
      "C": "To carry water up to the petals",
      "D": "To protect the flower bud before it opens"
    },
    "correct": "D",
    "difficulty": 2
  },
  {
    "id": "ks2_bio_plants_0031",
    "level": "ks2",
    "subject": "biology",
    "category": "Plants",
    "text": "What is the stigma in a flower?",
    "options": {
      "A": "The sticky top part of the carpel that receives pollen",
      "B": "The stalk that holds the anther up",
      "C": "The part of the flower that makes nectar",
      "D": "The outer leaf-like part that covers the bud"
    },
    "correct": "A",
    "difficulty": 2
  },
  {
    "id": "ks2_bio_plants_0032",
    "level": "ks2",
    "subject": "biology",
    "category": "Plants",
    "text": "What is vegetative reproduction in plants?",
    "options": {
      "A": "When a plant produces extra large seeds",
      "B": "When a plant is pollinated by the wind",
      "C": "When a plant uses lots of sunlight to grow quickly",
      "D": "When a new plant grows from a root, stem, or leaf rather than from a seed"
    },
    "correct": "D",
    "difficulty": 2
  },
  {
    "id": "ks2_bio_plants_0033",
    "level": "ks2",
    "subject": "biology",
    "category": "Plants",
    "text": "Why can seeds germinate even when there is no soil nearby?",
    "options": {
      "A": "Because they contain stored food that gives the seedling energy to start growing",
      "B": "Because they take in sunlight through their seed coat",
      "C": "Because they can make their own minerals from the air",
      "D": "Because they absorb water vapour from the air instead"
    },
    "correct": "A",
    "difficulty": 2
  },
  {
    "id": "ks2_bio_plants_0034",
    "level": "ks2",
    "subject": "biology",
    "category": "Plants",
    "text": "How do wind-dispersed seeds travel away from the parent plant?",
    "options": {
      "A": "They sink into the ground and roll along the surface",
      "B": "They are eaten by birds who carry them far away",
      "C": "They shoot out of a pod with a loud pop",
      "D": "They have wings or fluffy parachutes that let them float on the wind"
    },
    "correct": "D",
    "difficulty": 1
  },
  {
    "id": "ks2_bio_plants_0035",
    "level": "ks2",
    "subject": "biology",
    "category": "Plants",
    "text": "How do some seeds use animals to spread to new places?",
    "options": {
      "A": "They are eaten or they have hooks that cling to animal fur",
      "B": "They release a scent that makes animals carry them underground",
      "C": "They attach to an animal and make it run to a new place",
      "D": "They are pushed along the ground by animals walking past"
    },
    "correct": "A",
    "difficulty": 1
  },
  {
    "id": "ks2_bio_plants_0036",
    "level": "ks2",
    "subject": "biology",
    "category": "Plants",
    "text": "What is fertilisation in a plant?",
    "options": {
      "A": "When a plant takes in extra minerals from the soil",
      "B": "When an insect lands on a flower to collect nectar",
      "C": "When water moves up through the xylem to the leaves",
      "D": "When the pollen joins with the egg cell inside the ovule"
    },
    "correct": "D",
    "difficulty": 2
  },
  {
    "id": "ks2_bio_plants_0037",
    "level": "ks2",
    "subject": "biology",
    "category": "Plants",
    "text": "Why are many flowers brightly coloured?",
    "options": {
      "A": "To attract insects so they will carry pollen from flower to flower",
      "B": "To protect the plant from getting too hot in the sun",
      "C": "To warn birds that the plant is poisonous",
      "D": "To help the plant absorb more water through its petals"
    },
    "correct": "A",
    "difficulty": 1
  },
  {
    "id": "ks2_bio_plants_0038",
    "level": "ks2",
    "subject": "biology",
    "category": "Plants",
    "text": "What is the job of the style in a flower?",
    "options": {
      "A": "To make pollen grains for reproduction",
      "B": "To act as a tube connecting the stigma to the ovary",
      "C": "To attract insects with its bright colours",
      "D": "To store water for the flower during dry weather"
    },
    "correct": "B",
    "difficulty": 2
  },
  {
    "id": "ks2_bio_plants_0039",
    "level": "ks2",
    "subject": "biology",
    "category": "Plants",
    "text": "How does a cactus survive in a hot, dry desert?",
    "options": {
      "A": "It stores water in its thick stem and has spines instead of leaves to save water",
      "B": "It only grows during the night when it is cool",
      "C": "It gets all the water it needs from the air around it",
      "D": "It grows very deep roots that reach underground rivers"
    },
    "correct": "A",
    "difficulty": 1
  },
  {
    "id": "ks2_bio_plants_0040",
    "level": "ks2",
    "subject": "biology",
    "category": "Plants",
    "text": "What are the three main parts found inside a seed?",
    "options": {
      "A": "The petal, the stamen, and the root",
      "B": "The xylem, the phloem, and the stem",
      "C": "The anther, the stigma, and the style",
      "D": "The seed coat, the food store, and the tiny embryo plant"
    },
    "correct": "D",
    "difficulty": 2
  }
]

def load_json(path):
    with open(path, encoding='utf-8') as f:
        return json.load(f)

def save_json(path, data):
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def update_js(path, new_qs):
    with open(path, encoding='utf-8') as f:
        content = f.read()
    entries = [json.dumps(q, ensure_ascii=False) for q in new_qs]
    insertion = ',\n  '.join(entries)
    new_content = content.rstrip()
    assert new_content.endswith('];'), "JS file doesn't end with ];"
    new_content = new_content[:-2] + ',\n  ' + insertion + '\n];'
    with open(path, 'w', encoding='utf-8') as f:
        f.write(new_content)

def main():
    json_path = 'backend/questions.json'
    js_path = 'src/data/questions.js'
    existing = load_json(json_path)
    existing_ids = {q['id'] for q in existing}
    existing_texts = {q['text'].lower().strip() for q in existing}
    errors = []
    new_ids, new_texts = set(), set()
    for q in NEW_Q:
        if q['id'] in existing_ids: errors.append(f"Dup id: {q['id']}")
        if q['id'] in new_ids: errors.append(f"Dup new id: {q['id']}")
        if q['text'].lower().strip() in existing_texts: errors.append(f"Dup text: {q['text'][:60]}")
        if q['text'].lower().strip() in new_texts: errors.append(f"Dup new text: {q['text'][:60]}")
        if q['correct'] not in q['options']: errors.append(f"Bad correct key: {q['id']}")
        new_ids.add(q['id']); new_texts.add(q['text'].lower().strip())
    if errors:
        print("ERRORS:"); [print(f"  {e}") for e in errors]; sys.exit(1)
    dist = Counter(q['correct'] for q in NEW_Q)
    print(f"New: {len(NEW_Q)} | dist: {dict(sorted(dist.items()))}")
    assert dist == {'A':10,'B':2,'D':8}, f"Distribution wrong: {dict(dist)}"
    combined = existing + NEW_Q
    save_json(json_path, combined)
    update_js(js_path, NEW_Q)
    print(f"backend: {len(existing)} -> {len(combined)} | JS updated")

if __name__ == '__main__':
    main()
