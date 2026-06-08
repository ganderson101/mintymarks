#!/usr/bin/env python3
"""MIN-98 wave 2: KS2 Biology - Living things & their habitats (20 new, 0021-0040)
Target dist: A=9 B=0 C=1 D=10
"""
import json, sys
from collections import Counter

NEW_Q = [
  {
    "id": "ks2_bio_lth_0021",
    "level": "ks2",
    "subject": "biology",
    "category": "Living things & their habitats",
    "text": "What is a carnivore?",
    "options": {
      "A": "An animal that eats only meat",
      "B": "An animal that eats only plants",
      "C": "An animal that eats both plants and meat",
      "D": "An animal that eats only insects"
    },
    "correct": "A",
    "difficulty": 1
  },
  {
    "id": "ks2_bio_lth_0022",
    "level": "ks2",
    "subject": "biology",
    "category": "Living things & their habitats",
    "text": "What is a consumer in a food chain?",
    "options": {
      "A": "A plant that makes its own food from sunlight",
      "B": "A tiny organism that breaks down dead matter",
      "C": "The sun, which provides energy for all life",
      "D": "An animal that eats other living things to get energy"
    },
    "correct": "D",
    "difficulty": 1
  },
  {
    "id": "ks2_bio_lth_0023",
    "level": "ks2",
    "subject": "biology",
    "category": "Living things & their habitats",
    "text": "What is the main difference between a vertebrate and an invertebrate?",
    "options": {
      "A": "Vertebrates have a backbone; invertebrates do not have a backbone",
      "B": "Vertebrates live in water; invertebrates live on land",
      "C": "Vertebrates are small; invertebrates are large",
      "D": "Vertebrates eat plants; invertebrates eat meat"
    },
    "correct": "A",
    "difficulty": 1
  },
  {
    "id": "ks2_bio_lth_0024",
    "level": "ks2",
    "subject": "biology",
    "category": "Living things & their habitats",
    "text": "Which of these describes reptiles?",
    "options": {
      "A": "They are warm-blooded and feed their young with milk",
      "B": "They live in water and breathe through gills",
      "C": "They have feathers and lay eggs in nests",
      "D": "They are cold-blooded, have scaly skin, and lay eggs on land"
    },
    "correct": "D",
    "difficulty": 1
  },
  {
    "id": "ks2_bio_lth_0025",
    "level": "ks2",
    "subject": "biology",
    "category": "Living things & their habitats",
    "text": "Which of these best describes amphibians?",
    "options": {
      "A": "They can live both on land and in water, and have smooth, moist skin",
      "B": "They live only in the sea and breathe through gills",
      "C": "They have dry, scaly skin and never go near water",
      "D": "They have feathers and can fly long distances"
    },
    "correct": "A",
    "difficulty": 1
  },
  {
    "id": "ks2_bio_lth_0026",
    "level": "ks2",
    "subject": "biology",
    "category": "Living things & their habitats",
    "text": "How are insects classified?",
    "options": {
      "A": "They have 8 legs and 2 body parts",
      "B": "They have 4 legs and 1 body part",
      "C": "They have 6 legs and 1 body part",
      "D": "They have 6 legs, 3 body parts, and often have wings"
    },
    "correct": "D",
    "difficulty": 1
  },
  {
    "id": "ks2_bio_lth_0027",
    "level": "ks2",
    "subject": "biology",
    "category": "Living things & their habitats",
    "text": "What are the seven life processes that all living things share? (Remember: MRS NERG)",
    "options": {
      "A": "Movement, Respiration, Sensitivity, Nutrition, Excretion, Reproduction, Growth",
      "B": "Moving, Running, Swimming, Nutrition, Eating, Resting, Growing",
      "C": "Migration, Reproduction, Sleeping, Nutrition, Energy, Resting, Grazing",
      "D": "Movement, Relaxation, Sensing, Nesting, Eating, Running, Growing"
    },
    "correct": "A",
    "difficulty": 2
  },
  {
    "id": "ks2_bio_lth_0028",
    "level": "ks2",
    "subject": "biology",
    "category": "Living things & their habitats",
    "text": "What does 'nocturnal' mean when describing an animal?",
    "options": {
      "A": "The animal only lives in very cold places",
      "B": "The animal travels very long distances each year",
      "C": "The animal only eats plants and never eats meat",
      "D": "The animal is active at night and sleeps during the day"
    },
    "correct": "D",
    "difficulty": 1
  },
  {
    "id": "ks2_bio_lth_0029",
    "level": "ks2",
    "subject": "biology",
    "category": "Living things & their habitats",
    "text": "What is camouflage in animals?",
    "options": {
      "A": "When an animal's colour or pattern helps it blend in with its surroundings",
      "B": "When an animal changes its diet with the seasons",
      "C": "When an animal travels to a warmer place in winter",
      "D": "When an animal grows extra thick fur in cold weather"
    },
    "correct": "A",
    "difficulty": 1
  },
  {
    "id": "ks2_bio_lth_0030",
    "level": "ks2",
    "subject": "biology",
    "category": "Living things & their habitats",
    "text": "What is a food web?",
    "options": {
      "A": "A single straight line showing what one animal eats",
      "B": "A list of all the plants found in one habitat",
      "C": "A diagram showing only producers and decomposers",
      "D": "Many food chains linked together to show how animals in a habitat are connected"
    },
    "correct": "D",
    "difficulty": 2
  },
  {
    "id": "ks2_bio_lth_0031",
    "level": "ks2",
    "subject": "biology",
    "category": "Living things & their habitats",
    "text": "What are cold-blooded animals?",
    "options": {
      "A": "Animals whose body temperature changes with the temperature of their surroundings",
      "B": "Animals that always feel cold to the touch",
      "C": "Animals that only live in freezing cold habitats like the Arctic",
      "D": "Animals that keep their body temperature the same all the time"
    },
    "correct": "A",
    "difficulty": 2
  },
  {
    "id": "ks2_bio_lth_0032",
    "level": "ks2",
    "subject": "biology",
    "category": "Living things & their habitats",
    "text": "What are warm-blooded animals?",
    "options": {
      "A": "Animals that only live in hot desert habitats",
      "B": "Animals that feel warm when you touch them",
      "C": "Animals whose body temperature rises and falls with the weather",
      "D": "Animals that keep their body temperature at a steady level no matter how hot or cold it is outside"
    },
    "correct": "D",
    "difficulty": 2
  },
  {
    "id": "ks2_bio_lth_0033",
    "level": "ks2",
    "subject": "biology",
    "category": "Living things & their habitats",
    "text": "What is a primary consumer?",
    "options": {
      "A": "An animal that eats plants or producers to get its energy",
      "B": "A plant that uses sunlight to make its own food",
      "C": "An animal that eats other animals",
      "D": "A tiny organism that breaks down dead plants and animals"
    },
    "correct": "A",
    "difficulty": 2
  },
  {
    "id": "ks2_bio_lth_0034",
    "level": "ks2",
    "subject": "biology",
    "category": "Living things & their habitats",
    "text": "What is a secondary consumer?",
    "options": {
      "A": "A plant that produces food using sunlight",
      "B": "An organism that breaks down dead material in the soil",
      "C": "An animal that eats only plants",
      "D": "An animal that eats primary consumers (plant-eating animals)"
    },
    "correct": "D",
    "difficulty": 2
  },
  {
    "id": "ks2_bio_lth_0035",
    "level": "ks2",
    "subject": "biology",
    "category": "Living things & their habitats",
    "text": "How do desert plants adapt to survive in very dry conditions?",
    "options": {
      "A": "They store water in their stems or leaves, grow deep roots, and often have thick waxy skin",
      "B": "They grow very quickly and produce huge amounts of fruit",
      "C": "They drop all their leaves in summer and go to sleep underground",
      "D": "They drink large amounts of water during heavy rainstorms and store none"
    },
    "correct": "A",
    "difficulty": 2
  },
  {
    "id": "ks2_bio_lth_0036",
    "level": "ks2",
    "subject": "biology",
    "category": "Living things & their habitats",
    "text": "What is an endangered species?",
    "options": {
      "A": "An animal that is very common and found all over the world",
      "B": "A plant that grows very quickly in most habitats",
      "C": "An animal that has already completely died out",
      "D": "A living thing that is at serious risk of dying out because there are very few left"
    },
    "correct": "D",
    "difficulty": 1
  },
  {
    "id": "ks2_bio_lth_0037",
    "level": "ks2",
    "subject": "biology",
    "category": "Living things & their habitats",
    "text": "What is conservation?",
    "options": {
      "A": "Protecting natural habitats and wildlife so they are not lost or destroyed",
      "B": "Cutting down forests to make room for new buildings",
      "C": "Studying animals only in laboratories and zoos",
      "D": "Using up natural resources as quickly as possible"
    },
    "correct": "A",
    "difficulty": 1
  },
  {
    "id": "ks2_bio_lth_0038",
    "level": "ks2",
    "subject": "biology",
    "category": "Living things & their habitats",
    "text": "What is a parasite?",
    "options": {
      "A": "An animal that helps plants to grow by spreading pollen",
      "B": "A plant that makes its own food from sunlight",
      "C": "An organism that cleans up dead matter from the forest floor",
      "D": "An organism that lives on or inside another living thing and harms it"
    },
    "correct": "D",
    "difficulty": 2
  },
  {
    "id": "ks2_bio_lth_0039",
    "level": "ks2",
    "subject": "biology",
    "category": "Living things & their habitats",
    "text": "Which of these is an example of symbiosis where both organisms benefit from living closely together?",
    "options": {
      "A": "A fox eating a rabbit",
      "B": "A plant losing its leaves in autumn",
      "C": "A bee collecting nectar from a flower while spreading the flower's pollen",
      "D": "A fish being eaten by a shark"
    },
    "correct": "C",
    "difficulty": 2
  },
  {
    "id": "ks2_bio_lth_0040",
    "level": "ks2",
    "subject": "biology",
    "category": "Living things & their habitats",
    "text": "What group are spiders classified in?",
    "options": {
      "A": "Insects, because they have wings and antennae",
      "B": "Reptiles, because they have dry skin and lay eggs",
      "C": "Mammals, because they are warm-blooded",
      "D": "Arachnids, because they have 8 legs and 2 body parts"
    },
    "correct": "D",
    "difficulty": 1
  },
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
    assert dist == {'A':9,'C':1,'D':10}, f"Distribution wrong: {dict(dist)}"
    combined = existing + NEW_Q
    save_json(json_path, combined)
    update_js(js_path, NEW_Q)
    print(f"backend: {len(existing)} -> {len(combined)} | JS updated")

if __name__ == '__main__':
    main()
