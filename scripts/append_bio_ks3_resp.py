#!/usr/bin/env python3
"""MIN-98 wave 2: KS3 Biology - Respiration & gas exchange (40 new, 0021-0060)
Target dist: A=13 B=7 C=6 D=14
"""
import json, sys
from collections import Counter

NEW_Q = [
  # 0021 correct=A
  {
    "id": "ks3_bio_resp_0021",
    "level": "ks3",
    "subject": "biology",
    "category": "Respiration & gas exchange",
    "text": "What is the main purpose of respiration in living organisms?",
    "options": {
      "A": "To release energy from glucose for life processes",
      "B": "To produce glucose from carbon dioxide and water",
      "C": "To absorb oxygen through the skin",
      "D": "To break down food in the stomach"
    },
    "correct": "A",
    "difficulty": 1
  },
  # 0022 correct=D
  {
    "id": "ks3_bio_resp_0022",
    "level": "ks3",
    "subject": "biology",
    "category": "Respiration & gas exchange",
    "text": "Which of the following life processes uses the energy released by respiration?",
    "options": {
      "A": "Photosynthesis only",
      "B": "Digestion only",
      "C": "Excretion only",
      "D": "Movement, growth, and keeping warm"
    },
    "correct": "D",
    "difficulty": 1
  },
  # 0023 correct=B
  {
    "id": "ks3_bio_resp_0023",
    "level": "ks3",
    "subject": "biology",
    "category": "Respiration & gas exchange",
    "text": "Which gas must be present for aerobic respiration to occur?",
    "options": {
      "A": "Carbon dioxide",
      "B": "Oxygen",
      "C": "Nitrogen",
      "D": "Hydrogen"
    },
    "correct": "B",
    "difficulty": 1
  },
  # 0024 correct=A
  {
    "id": "ks3_bio_resp_0024",
    "level": "ks3",
    "subject": "biology",
    "category": "Respiration & gas exchange",
    "text": "What are the two waste products of aerobic respiration?",
    "options": {
      "A": "Carbon dioxide and water",
      "B": "Oxygen and glucose",
      "C": "Lactic acid and carbon dioxide",
      "D": "Ethanol and water"
    },
    "correct": "A",
    "difficulty": 1
  },
  # 0025 correct=C
  {
    "id": "ks3_bio_resp_0025",
    "level": "ks3",
    "subject": "biology",
    "category": "Respiration & gas exchange",
    "text": "What is the main fuel molecule used by cells during respiration?",
    "options": {
      "A": "Protein",
      "B": "Fat",
      "C": "Glucose",
      "D": "Starch"
    },
    "correct": "C",
    "difficulty": 1
  },
  # 0026 correct=D
  {
    "id": "ks3_bio_resp_0026",
    "level": "ks3",
    "subject": "biology",
    "category": "Respiration & gas exchange",
    "text": "What waste product builds up in animal muscles during anaerobic respiration?",
    "options": {
      "A": "Ethanol",
      "B": "Carbon dioxide",
      "C": "Glucose",
      "D": "Lactic acid"
    },
    "correct": "D",
    "difficulty": 2
  },
  # 0027 correct=B
  {
    "id": "ks3_bio_resp_0027",
    "level": "ks3",
    "subject": "biology",
    "category": "Respiration & gas exchange",
    "text": "What two substances are produced when yeast carries out anaerobic respiration?",
    "options": {
      "A": "Lactic acid and oxygen",
      "B": "Ethanol and carbon dioxide",
      "C": "Water and carbon dioxide",
      "D": "Glucose and lactic acid"
    },
    "correct": "B",
    "difficulty": 2
  },
  # 0028 correct=A
  {
    "id": "ks3_bio_resp_0028",
    "level": "ks3",
    "subject": "biology",
    "category": "Respiration & gas exchange",
    "text": "How is yeast used to make wine and beer?",
    "options": {
      "A": "Yeast ferments sugars to produce ethanol and carbon dioxide",
      "B": "Yeast produces oxygen that turns grape juice into wine",
      "C": "Yeast breaks down alcohol into carbon dioxide and water",
      "D": "Yeast adds flavour by producing lactic acid"
    },
    "correct": "A",
    "difficulty": 2
  },
  # 0029 correct=C
  {
    "id": "ks3_bio_resp_0029",
    "level": "ks3",
    "subject": "biology",
    "category": "Respiration & gas exchange",
    "text": "Why does bread dough rise when yeast is added?",
    "options": {
      "A": "Yeast produces lactic acid which expands the dough",
      "B": "Yeast absorbs water and swells up",
      "C": "Yeast produces carbon dioxide gas that gets trapped in the dough",
      "D": "Yeast produces oxygen which makes the dough lighter"
    },
    "correct": "C",
    "difficulty": 2
  },
  # 0030 correct=D
  {
    "id": "ks3_bio_resp_0030",
    "level": "ks3",
    "subject": "biology",
    "category": "Respiration & gas exchange",
    "text": "What is the name of the tube that carries air from the throat down to the lungs?",
    "options": {
      "A": "Oesophagus",
      "B": "Bronchus",
      "C": "Alveolus",
      "D": "Trachea"
    },
    "correct": "D",
    "difficulty": 1
  },
  # 0031 correct=A
  {
    "id": "ks3_bio_resp_0031",
    "level": "ks3",
    "subject": "biology",
    "category": "Respiration & gas exchange",
    "text": "What are the bronchi?",
    "options": {
      "A": "The two main tubes that branch from the trachea into each lung",
      "B": "Tiny air sacs at the end of the airways",
      "C": "Small tubes that lead directly to the alveoli",
      "D": "Muscles that help push air in and out of the lungs"
    },
    "correct": "A",
    "difficulty": 2
  },
  # 0032 correct=B
  {
    "id": "ks3_bio_resp_0032",
    "level": "ks3",
    "subject": "biology",
    "category": "Respiration & gas exchange",
    "text": "What are bronchioles?",
    "options": {
      "A": "Large tubes that carry air from the mouth to the lungs",
      "B": "Smaller branches of the airways that lead to the alveoli",
      "C": "Air sacs where gas exchange takes place",
      "D": "Muscles between the ribs"
    },
    "correct": "B",
    "difficulty": 2
  },
  # 0033 correct=D
  {
    "id": "ks3_bio_resp_0033",
    "level": "ks3",
    "subject": "biology",
    "category": "Respiration & gas exchange",
    "text": "Which muscles, found between the ribs, help with breathing movements?",
    "options": {
      "A": "Bicep muscles",
      "B": "Diaphragm muscles",
      "C": "Abdominal muscles",
      "D": "Intercostal muscles"
    },
    "correct": "D",
    "difficulty": 2
  },
  # 0034 correct=A
  {
    "id": "ks3_bio_resp_0034",
    "level": "ks3",
    "subject": "biology",
    "category": "Respiration & gas exchange",
    "text": "What happens to the diaphragm when you breathe in?",
    "options": {
      "A": "It contracts and moves downward, increasing the volume of the chest",
      "B": "It relaxes and moves upward, decreasing the volume of the chest",
      "C": "It stays still while only the ribs move",
      "D": "It expands outward to push air into the lungs"
    },
    "correct": "A",
    "difficulty": 2
  },
  # 0035 correct=D
  {
    "id": "ks3_bio_resp_0035",
    "level": "ks3",
    "subject": "biology",
    "category": "Respiration & gas exchange",
    "text": "What happens to the volume of the chest when you breathe out?",
    "options": {
      "A": "It increases as the diaphragm contracts",
      "B": "It stays the same",
      "C": "It increases as the ribs move outward",
      "D": "It decreases as the diaphragm relaxes and ribs move inward"
    },
    "correct": "D",
    "difficulty": 2
  },
  # 0036 correct=D
  {
    "id": "ks3_bio_resp_0036",
    "level": "ks3",
    "subject": "biology",
    "category": "Respiration & gas exchange",
    "text": "Why do alveoli have walls that are only one cell thick?",
    "options": {
      "A": "To make the alveoli stronger",
      "B": "To increase the total volume of the lungs",
      "C": "To prevent gases from escaping into the bloodstream",
      "D": "To allow gases to diffuse quickly between the air and the blood"
    },
    "correct": "D",
    "difficulty": 2
  },
  # 0037 correct=B
  {
    "id": "ks3_bio_resp_0037",
    "level": "ks3",
    "subject": "biology",
    "category": "Respiration & gas exchange",
    "text": "Why is it important that alveoli have a rich blood supply?",
    "options": {
      "A": "Blood warms the air inside the alveoli",
      "B": "It maintains a concentration gradient so gases are transported away rapidly",
      "C": "It keeps the alveoli walls moist to prevent tearing",
      "D": "Blood provides glucose directly to the alveoli walls"
    },
    "correct": "B",
    "difficulty": 3
  },
  # 0038 correct=A
  {
    "id": "ks3_bio_resp_0038",
    "level": "ks3",
    "subject": "biology",
    "category": "Respiration & gas exchange",
    "text": "What change in the blood triggers the brain to increase your breathing rate?",
    "options": {
      "A": "A rise in carbon dioxide concentration in the blood",
      "B": "A rise in oxygen concentration in the blood",
      "C": "A fall in glucose levels in the blood",
      "D": "A fall in body temperature"
    },
    "correct": "A",
    "difficulty": 3
  },
  # 0039 correct=C
  {
    "id": "ks3_bio_resp_0039",
    "level": "ks3",
    "subject": "biology",
    "category": "Respiration & gas exchange",
    "text": "During exercise, why does the body need more oxygen delivered to the muscles?",
    "options": {
      "A": "Muscles use oxygen to make glucose",
      "B": "Oxygen removes lactic acid from the muscles directly",
      "C": "More aerobic respiration is needed to release extra energy for movement",
      "D": "Oxygen cools the muscles down to prevent overheating"
    },
    "correct": "C",
    "difficulty": 2
  },
  # 0040 correct=D
  {
    "id": "ks3_bio_resp_0040",
    "level": "ks3",
    "subject": "biology",
    "category": "Respiration & gas exchange",
    "text": "Why does heart rate increase during exercise?",
    "options": {
      "A": "To remove carbon dioxide from the lungs faster",
      "B": "To cool the body down by pumping more blood to the skin",
      "C": "To increase the amount of glucose produced in the liver",
      "D": "To deliver more oxygen and glucose to muscles more quickly"
    },
    "correct": "D",
    "difficulty": 2
  },
  # 0041 correct=D
  {
    "id": "ks3_bio_resp_0041",
    "level": "ks3",
    "subject": "biology",
    "category": "Respiration & gas exchange",
    "text": "After intense exercise has stopped, why does breathing remain faster than normal for a while?",
    "options": {
      "A": "The body continues to produce energy for future activity",
      "B": "Carbon dioxide levels in the blood fall, slowing the heart",
      "C": "The lungs need to cool down after working hard",
      "D": "Extra oxygen is needed to break down the lactic acid that built up"
    },
    "correct": "D",
    "difficulty": 3
  },
  # 0042 correct=A
  {
    "id": "ks3_bio_resp_0042",
    "level": "ks3",
    "subject": "biology",
    "category": "Respiration & gas exchange",
    "text": "What effect does lactic acid build-up in muscles have on the body?",
    "options": {
      "A": "It causes muscle fatigue and cramps",
      "B": "It speeds up aerobic respiration",
      "C": "It increases the amount of ATP produced",
      "D": "It lowers the breathing rate"
    },
    "correct": "A",
    "difficulty": 2
  },
  # 0043 correct=B
  {
    "id": "ks3_bio_resp_0043",
    "level": "ks3",
    "subject": "biology",
    "category": "Respiration & gas exchange",
    "text": "Why does aerobic respiration release much more energy than anaerobic respiration from the same amount of glucose?",
    "options": {
      "A": "Aerobic respiration uses a different type of glucose",
      "B": "Aerobic respiration completely breaks down glucose using oxygen, releasing far more ATP",
      "C": "Anaerobic respiration produces water, which wastes energy",
      "D": "Aerobic respiration takes place in the nucleus where more enzymes are present"
    },
    "correct": "B",
    "difficulty": 3
  },
  # 0044 correct=C
  {
    "id": "ks3_bio_resp_0044",
    "level": "ks3",
    "subject": "biology",
    "category": "Respiration & gas exchange",
    "text": "As well as glucose, which other food types can be broken down to release energy in respiration?",
    "options": {
      "A": "Only vitamins and minerals",
      "B": "Only water and fibre",
      "C": "Fats and proteins",
      "D": "Only starch"
    },
    "correct": "C",
    "difficulty": 3
  },
  # 0045 correct=D
  {
    "id": "ks3_bio_resp_0045",
    "level": "ks3",
    "subject": "biology",
    "category": "Respiration & gas exchange",
    "text": "What molecule is produced during respiration that acts as the cell's energy currency?",
    "options": {
      "A": "DNA",
      "B": "Glucose",
      "C": "Haemoglobin",
      "D": "ATP"
    },
    "correct": "D",
    "difficulty": 3
  },
  # 0046 correct=A
  {
    "id": "ks3_bio_resp_0046",
    "level": "ks3",
    "subject": "biology",
    "category": "Respiration & gas exchange",
    "text": "What is ATP's role in a cell?",
    "options": {
      "A": "It stores and transfers energy so cells can carry out life processes",
      "B": "It carries oxygen from the lungs to body tissues",
      "C": "It is the molecule used directly as fuel in aerobic respiration",
      "D": "It stores genetic information in the nucleus"
    },
    "correct": "A",
    "difficulty": 3
  },
  # 0047 correct=D
  {
    "id": "ks3_bio_resp_0047",
    "level": "ks3",
    "subject": "biology",
    "category": "Respiration & gas exchange",
    "text": "Which type of cell would you expect to contain the most mitochondria and why?",
    "options": {
      "A": "Skin cells, because they are exposed to the environment",
      "B": "Fat cells, because they store large amounts of energy",
      "C": "Root hair cells, because they are in contact with soil water",
      "D": "Muscle cells, because they need a large and continuous supply of energy"
    },
    "correct": "D",
    "difficulty": 3
  },
  # 0048 correct=B
  {
    "id": "ks3_bio_resp_0048",
    "level": "ks3",
    "subject": "biology",
    "category": "Respiration & gas exchange",
    "text": "Do plants carry out respiration?",
    "options": {
      "A": "No, plants only photosynthesise and never respire",
      "B": "Yes, plants respire all the time, day and night",
      "C": "Yes, but only at night when they cannot photosynthesise",
      "D": "Only when they are growing rapidly in spring"
    },
    "correct": "B",
    "difficulty": 2
  },
  # 0049 correct=C
  {
    "id": "ks3_bio_resp_0049",
    "level": "ks3",
    "subject": "biology",
    "category": "Respiration & gas exchange",
    "text": "During a bright sunny day, a plant is both photosynthesising and respiring. What is the overall effect on oxygen levels around the plant?",
    "options": {
      "A": "Oxygen levels fall because respiration uses it all up",
      "B": "Oxygen levels stay exactly the same",
      "C": "Oxygen levels rise because photosynthesis produces more oxygen than respiration uses",
      "D": "Oxygen levels rise because the plant stops respiring in sunlight"
    },
    "correct": "C",
    "difficulty": 3
  },
  # 0050 correct=A
  {
    "id": "ks3_bio_resp_0050",
    "level": "ks3",
    "subject": "biology",
    "category": "Respiration & gas exchange",
    "text": "How does the composition of exhaled air differ from inhaled air?",
    "options": {
      "A": "Exhaled air contains more carbon dioxide and less oxygen than inhaled air",
      "B": "Exhaled air contains more oxygen and less carbon dioxide than inhaled air",
      "C": "Exhaled air contains no nitrogen, unlike inhaled air",
      "D": "Exhaled air and inhaled air have exactly the same composition"
    },
    "correct": "A",
    "difficulty": 2
  },
  # 0051 correct=D
  {
    "id": "ks3_bio_resp_0051",
    "level": "ks3",
    "subject": "biology",
    "category": "Respiration & gas exchange",
    "text": "Which indicator turns yellow or orange in the presence of carbon dioxide?",
    "options": {
      "A": "Universal indicator",
      "B": "Iodine solution",
      "C": "Benedict's solution",
      "D": "Hydrogencarbonate indicator"
    },
    "correct": "D",
    "difficulty": 3
  },
  # 0052 correct=B
  {
    "id": "ks3_bio_resp_0052",
    "level": "ks3",
    "subject": "biology",
    "category": "Respiration & gas exchange",
    "text": "What colour change shows that carbon dioxide has been bubbled through limewater?",
    "options": {
      "A": "It turns blue",
      "B": "It turns milky or cloudy white",
      "C": "It turns orange",
      "D": "It remains colourless and clear"
    },
    "correct": "B",
    "difficulty": 1
  },
  # 0053 correct=D
  {
    "id": "ks3_bio_resp_0053",
    "level": "ks3",
    "subject": "biology",
    "category": "Respiration & gas exchange",
    "text": "What is the correct order of airway structures from the throat to the alveoli?",
    "options": {
      "A": "Alveoli, bronchioles, bronchi, trachea",
      "B": "Trachea, alveoli, bronchi, bronchioles",
      "C": "Bronchi, trachea, bronchioles, alveoli",
      "D": "Trachea, bronchi, bronchioles, alveoli"
    },
    "correct": "D",
    "difficulty": 2
  },
  # 0054 correct=A
  {
    "id": "ks3_bio_resp_0054",
    "level": "ks3",
    "subject": "biology",
    "category": "Respiration & gas exchange",
    "text": "Which statement about anaerobic respiration is correct?",
    "options": {
      "A": "It does not require oxygen and releases less energy than aerobic respiration",
      "B": "It requires oxygen and releases more energy than aerobic respiration",
      "C": "It takes place only in plants and fungi",
      "D": "It produces carbon dioxide and water as its only products in animals"
    },
    "correct": "A",
    "difficulty": 2
  },
  # 0055 correct=C
  {
    "id": "ks3_bio_resp_0055",
    "level": "ks3",
    "subject": "biology",
    "category": "Respiration & gas exchange",
    "text": "What happens to the ribs during inhalation (breathing in)?",
    "options": {
      "A": "The ribs move inward and downward",
      "B": "The ribs stay in the same position",
      "C": "The ribs move outward and upward",
      "D": "The ribs compress the lungs to draw air in"
    },
    "correct": "C",
    "difficulty": 2
  },
  # 0056 correct=D
  {
    "id": "ks3_bio_resp_0056",
    "level": "ks3",
    "subject": "biology",
    "category": "Respiration & gas exchange",
    "text": "Which feature of alveoli increases the rate of gas exchange by providing a large surface?",
    "options": {
      "A": "Their thick muscular walls",
      "B": "Their position at the top of the lungs",
      "C": "The sticky mucus lining their walls",
      "D": "Their very large number and round shape, giving a large total surface area"
    },
    "correct": "D",
    "difficulty": 2
  },
  # 0057 correct=A
  {
    "id": "ks3_bio_resp_0057",
    "level": "ks3",
    "subject": "biology",
    "category": "Respiration & gas exchange",
    "text": "Which process moves oxygen from the alveoli into the blood?",
    "options": {
      "A": "Diffusion, from high to low concentration",
      "B": "Active transport, using energy from ATP",
      "C": "Osmosis, through a partially permeable membrane",
      "D": "Filtration, driven by blood pressure"
    },
    "correct": "A",
    "difficulty": 2
  },
  # 0058 correct=D
  {
    "id": "ks3_bio_resp_0058",
    "level": "ks3",
    "subject": "biology",
    "category": "Respiration & gas exchange",
    "text": "What happens to glucose and oxygen levels in a muscle cell during vigorous exercise?",
    "options": {
      "A": "Glucose increases; oxygen increases",
      "B": "Glucose stays the same; oxygen decreases",
      "C": "Glucose increases; oxygen decreases",
      "D": "Glucose decreases; oxygen decreases"
    },
    "correct": "D",
    "difficulty": 3
  },
  # 0059 correct=A
  {
    "id": "ks3_bio_resp_0059",
    "level": "ks3",
    "subject": "biology",
    "category": "Respiration & gas exchange",
    "text": "Which organ system works together with the respiratory system to deliver oxygen to body cells?",
    "options": {
      "A": "The circulatory system",
      "B": "The digestive system",
      "C": "The nervous system",
      "D": "The excretory system"
    },
    "correct": "A",
    "difficulty": 1
  },
  # 0060 correct=A
  {
    "id": "ks3_bio_resp_0060",
    "level": "ks3",
    "subject": "biology",
    "category": "Respiration & gas exchange",
    "text": "A student breathes through a straw into limewater for 30 seconds. What result would they observe and why?",
    "options": {
      "A": "The limewater turns milky because exhaled air contains carbon dioxide",
      "B": "The limewater turns blue because exhaled air contains oxygen",
      "C": "The limewater stays clear because exhaled air contains no carbon dioxide",
      "D": "The limewater turns yellow because exhaled air is acidic"
    },
    "correct": "A",
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
    assert dist == {'A':13,'B':7,'C':6,'D':14}, f"Distribution wrong: {dict(dist)}"
    combined = existing + NEW_Q
    save_json(json_path, combined)
    update_js(js_path, NEW_Q)
    print(f"backend: {len(existing)} -> {len(combined)} | JS updated")

if __name__ == '__main__':
    main()
