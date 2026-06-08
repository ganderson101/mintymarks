#!/usr/bin/env python3
"""MIN-98 wave 2: KS2 Biology - Animals including humans (20 new, 0021-0040)
Target dist: A=8 B=5 C=0 D=7
"""
import json, sys
from collections import Counter

NEW_Q = [
  # 0021=A
  {
    "id": "ks2_bio_aih_0021",
    "level": "ks2",
    "subject": "biology",
    "category": "Animals including humans",
    "text": "What do arteries do?",
    "options": {
      "A": "Carry blood away from the heart",
      "B": "Carry blood back to the heart",
      "C": "Filter waste from the blood",
      "D": "Absorb food from the gut"
    },
    "correct": "A",
    "difficulty": 1
  },
  # 0022=D
  {
    "id": "ks2_bio_aih_0022",
    "level": "ks2",
    "subject": "biology",
    "category": "Animals including humans",
    "text": "What do veins do?",
    "options": {
      "A": "Carry blood away from the heart",
      "B": "Pump blood around the body",
      "C": "Break down food in the stomach",
      "D": "Carry blood back to the heart"
    },
    "correct": "D",
    "difficulty": 1
  },
  # 0023=B
  {
    "id": "ks2_bio_aih_0023",
    "level": "ks2",
    "subject": "biology",
    "category": "Animals including humans",
    "text": "How many chambers does the human heart have?",
    "options": {
      "A": "2",
      "B": "4",
      "C": "3",
      "D": "6"
    },
    "correct": "B",
    "difficulty": 1
  },
  # 0024=A
  {
    "id": "ks2_bio_aih_0024",
    "level": "ks2",
    "subject": "biology",
    "category": "Animals including humans",
    "text": "What is the job of molar teeth?",
    "options": {
      "A": "To crush and grind food",
      "B": "To cut food into pieces",
      "C": "To taste sweet foods",
      "D": "To push food into the throat"
    },
    "correct": "A",
    "difficulty": 1
  },
  # 0025=D
  {
    "id": "ks2_bio_aih_0025",
    "level": "ks2",
    "subject": "biology",
    "category": "Animals including humans",
    "text": "What does the diaphragm do?",
    "options": {
      "A": "It pumps blood to the lungs",
      "B": "It breaks down food in the stomach",
      "C": "It filters waste from the blood",
      "D": "It helps you breathe in and out"
    },
    "correct": "D",
    "difficulty": 1
  },
  # 0026=A
  {
    "id": "ks2_bio_aih_0026",
    "level": "ks2",
    "subject": "biology",
    "category": "Animals including humans",
    "text": "What does the trachea (windpipe) do?",
    "options": {
      "A": "It carries air from the mouth and nose down to the lungs",
      "B": "It pumps blood around the body",
      "C": "It digests food in the stomach",
      "D": "It removes waste from the blood"
    },
    "correct": "A",
    "difficulty": 1
  },
  # 0027=B
  {
    "id": "ks2_bio_aih_0027",
    "level": "ks2",
    "subject": "biology",
    "category": "Animals including humans",
    "text": "Why do humans need to drink water every day?",
    "options": {
      "A": "Water gives us vitamins and minerals",
      "B": "Water keeps cells working, helps digestion and helps make urine",
      "C": "Water helps us see better in the dark",
      "D": "Water builds strong bones and teeth"
    },
    "correct": "B",
    "difficulty": 1
  },
  # 0028=D
  {
    "id": "ks2_bio_aih_0028",
    "level": "ks2",
    "subject": "biology",
    "category": "Animals including humans",
    "text": "What is the job of the stomach?",
    "options": {
      "A": "To carry oxygen to cells around the body",
      "B": "To filter waste products out of the blood",
      "C": "To absorb water back into the blood",
      "D": "To churn food and start breaking down protein"
    },
    "correct": "D",
    "difficulty": 1
  },
  # 0029=A
  {
    "id": "ks2_bio_aih_0029",
    "level": "ks2",
    "subject": "biology",
    "category": "Animals including humans",
    "text": "Fruits and vegetables are a good source of which type of nutrients?",
    "options": {
      "A": "Vitamins and minerals",
      "B": "Proteins and fats",
      "C": "Starch and fibre only",
      "D": "Calcium and iron only"
    },
    "correct": "A",
    "difficulty": 1
  },
  # 0030=B
  {
    "id": "ks2_bio_aih_0030",
    "level": "ks2",
    "subject": "biology",
    "category": "Animals including humans",
    "text": "What does calcium do for your body?",
    "options": {
      "A": "It helps your heart pump faster",
      "B": "It builds strong bones and teeth",
      "C": "It carries oxygen in the blood",
      "D": "It gives you quick energy"
    },
    "correct": "B",
    "difficulty": 1
  },
  # 0031=A
  {
    "id": "ks2_bio_aih_0031",
    "level": "ks2",
    "subject": "biology",
    "category": "Animals including humans",
    "text": "What happens to your heart rate when you exercise?",
    "options": {
      "A": "It gets faster",
      "B": "It stays exactly the same",
      "C": "It gets slower",
      "D": "It stops for a short time"
    },
    "correct": "A",
    "difficulty": 1
  },
  # 0032=D
  {
    "id": "ks2_bio_aih_0032",
    "level": "ks2",
    "subject": "biology",
    "category": "Animals including humans",
    "text": "What is the circulatory system?",
    "options": {
      "A": "The system that breaks down food in your body",
      "B": "The system that controls your thoughts and movements",
      "C": "The system of bones that supports your body",
      "D": "The system of the heart and blood vessels that pumps blood around the body"
    },
    "correct": "D",
    "difficulty": 2
  },
  # 0033=B
  {
    "id": "ks2_bio_aih_0033",
    "level": "ks2",
    "subject": "biology",
    "category": "Animals including humans",
    "text": "Where does gas exchange happen in the body?",
    "options": {
      "A": "In the stomach",
      "B": "In the lungs",
      "C": "In the kidneys",
      "D": "In the small intestine"
    },
    "correct": "B",
    "difficulty": 1
  },
  # 0034=A
  {
    "id": "ks2_bio_aih_0034",
    "level": "ks2",
    "subject": "biology",
    "category": "Animals including humans",
    "text": "What is the muscular system?",
    "options": {
      "A": "All the muscles in the body that allow it to move",
      "B": "The bones and joints that hold the body up",
      "C": "The organs that digest food",
      "D": "The heart and blood vessels"
    },
    "correct": "A",
    "difficulty": 2
  },
  # 0035=D
  {
    "id": "ks2_bio_aih_0035",
    "level": "ks2",
    "subject": "biology",
    "category": "Animals including humans",
    "text": "Which list shows the stages of the human life cycle in the correct order?",
    "options": {
      "A": "Child, baby, teenager, adult, old age",
      "B": "Teenager, baby, child, adult, old age",
      "C": "Adult, child, baby, teenager, old age",
      "D": "Baby, child, teenager, adult, old age"
    },
    "correct": "D",
    "difficulty": 1
  },
  # 0036=B
  {
    "id": "ks2_bio_aih_0036",
    "level": "ks2",
    "subject": "biology",
    "category": "Animals including humans",
    "text": "What do the kidneys produce?",
    "options": {
      "A": "Bile",
      "B": "Urine",
      "C": "Saliva",
      "D": "Blood"
    },
    "correct": "B",
    "difficulty": 1
  },
  # 0037=A
  {
    "id": "ks2_bio_aih_0037",
    "level": "ks2",
    "subject": "biology",
    "category": "Animals including humans",
    "text": "What substance inside red blood cells carries oxygen around the body?",
    "options": {
      "A": "Haemoglobin",
      "B": "Glucose",
      "C": "Calcium",
      "D": "Bile"
    },
    "correct": "A",
    "difficulty": 2
  },
  # 0038=D
  {
    "id": "ks2_bio_aih_0038",
    "level": "ks2",
    "subject": "biology",
    "category": "Animals including humans",
    "text": "What is a joint in the body?",
    "options": {
      "A": "A type of muscle that makes the heart beat",
      "B": "A blood vessel that carries blood to the heart",
      "C": "A part of the digestive system",
      "D": "A place where two bones meet, allowing movement"
    },
    "correct": "D",
    "difficulty": 1
  },
  # 0039=A
  {
    "id": "ks2_bio_aih_0039",
    "level": "ks2",
    "subject": "biology",
    "category": "Animals including humans",
    "text": "What is the digestive system?",
    "options": {
      "A": "The group of organs that break down food so the body can use it",
      "B": "The heart and blood vessels that move blood around the body",
      "C": "The bones and muscles that help the body move",
      "D": "The lungs and airways that help the body breathe"
    },
    "correct": "A",
    "difficulty": 2
  },
  # 0040=D
  {
    "id": "ks2_bio_aih_0040",
    "level": "ks2",
    "subject": "biology",
    "category": "Animals including humans",
    "text": "Why is eating too much sugar harmful to the body?",
    "options": {
      "A": "Sugar stops the lungs from working properly",
      "B": "Sugar makes the heart beat too slowly",
      "C": "Sugar prevents bones from growing",
      "D": "Too much sugar can lead to tooth decay and cause health problems like diabetes"
    },
    "correct": "D",
    "difficulty": 2
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
    assert dist == {'A':8,'B':5,'D':7}, f"Distribution wrong: {dict(dist)}"
    combined = existing + NEW_Q
    save_json(json_path, combined)
    update_js(js_path, NEW_Q)
    print(f"backend: {len(existing)} -> {len(combined)} | JS updated")

if __name__ == '__main__':
    main()
