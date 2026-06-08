#!/usr/bin/env python3
"""MIN-98 wave 2: KS3 Biology - Reproduction (40 new, 0021-0060)
Target dist: A=13 B=5 C=8 D=14
"""
import json, sys
from collections import Counter

NEW_Q = [
  # 0021 correct=A
  {
    "id": "ks3_bio_repro_0021",
    "level": "ks3",
    "subject": "biology",
    "category": "Reproduction",
    "text": "Which part of a flower produces pollen?",
    "options": {
      "A": "The anther",
      "B": "The stigma",
      "C": "The ovary",
      "D": "The sepal"
    },
    "correct": "A",
    "difficulty": 1
  },
  # 0022 correct=D
  {
    "id": "ks3_bio_repro_0022",
    "level": "ks3",
    "subject": "biology",
    "category": "Reproduction",
    "text": "Which part of a flower receives pollen during pollination?",
    "options": {
      "A": "The anther",
      "B": "The petal",
      "C": "The ovule",
      "D": "The stigma"
    },
    "correct": "D",
    "difficulty": 1
  },
  # 0023 correct=B
  {
    "id": "ks3_bio_repro_0023",
    "level": "ks3",
    "subject": "biology",
    "category": "Reproduction",
    "text": "What is self-pollination?",
    "options": {
      "A": "Pollen moving from one plant species to a different plant species",
      "B": "Pollen from a flower landing on the stigma of the same plant",
      "C": "Pollen moving from one plant to a different plant of the same species",
      "D": "Pollen being carried by insects between two separate plants"
    },
    "correct": "B",
    "difficulty": 2
  },
  # 0024 correct=A
  {
    "id": "ks3_bio_repro_0024",
    "level": "ks3",
    "subject": "biology",
    "category": "Reproduction",
    "text": "After fertilisation in a plant, what does the ovary develop into?",
    "options": {
      "A": "A fruit",
      "B": "A seed",
      "C": "A pollen grain",
      "D": "A new root"
    },
    "correct": "A",
    "difficulty": 2
  },
  # 0025 correct=D
  {
    "id": "ks3_bio_repro_0025",
    "level": "ks3",
    "subject": "biology",
    "category": "Reproduction",
    "text": "Which of the following is a method of seed dispersal by wind?",
    "options": {
      "A": "Coconut floating on water",
      "B": "Berries eaten by birds",
      "C": "Burrs clinging to animal fur",
      "D": "Dandelion seeds carried on a feathery parachute"
    },
    "correct": "D",
    "difficulty": 1
  },
  # 0026 correct=C
  {
    "id": "ks3_bio_repro_0026",
    "level": "ks3",
    "subject": "biology",
    "category": "Reproduction",
    "text": "The sycamore tree produces seeds with wing-like structures. What is the main method of dispersal for these seeds?",
    "options": {
      "A": "Water",
      "B": "Animals eating them",
      "C": "Wind",
      "D": "Explosive pods"
    },
    "correct": "C",
    "difficulty": 1
  },
  # 0027 correct=A
  {
    "id": "ks3_bio_repro_0027",
    "level": "ks3",
    "subject": "biology",
    "category": "Reproduction",
    "text": "Why is it important for seeds to be dispersed away from the parent plant?",
    "options": {
      "A": "To reduce competition for light, water, and nutrients",
      "B": "So that animals can find them more easily",
      "C": "Because seeds can only germinate in shade",
      "D": "So that the parent plant can produce more flowers"
    },
    "correct": "A",
    "difficulty": 2
  },
  # 0028 correct=D
  {
    "id": "ks3_bio_repro_0028",
    "level": "ks3",
    "subject": "biology",
    "category": "Reproduction",
    "text": "Which of the following is NOT needed for a seed to germinate?",
    "options": {
      "A": "Water",
      "B": "Warmth",
      "C": "Oxygen",
      "D": "Light"
    },
    "correct": "D",
    "difficulty": 2
  },
  # 0029 correct=C
  {
    "id": "ks3_bio_repro_0029",
    "level": "ks3",
    "subject": "biology",
    "category": "Reproduction",
    "text": "What is the role of oestrogen during female puberty?",
    "options": {
      "A": "It causes the voice to deepen",
      "B": "It triggers sperm production",
      "C": "It causes breast development and the start of the menstrual cycle",
      "D": "It increases muscle mass in females to the same level as males"
    },
    "correct": "C",
    "difficulty": 2
  },
  # 0030 correct=A
  {
    "id": "ks3_bio_repro_0030",
    "level": "ks3",
    "subject": "biology",
    "category": "Reproduction",
    "text": "Which of the following is a change that happens to males during puberty?",
    "options": {
      "A": "The voice deepens and facial hair grows",
      "B": "The hips widen and breast tissue develops",
      "C": "The menstrual cycle begins",
      "D": "Oestrogen levels rise sharply"
    },
    "correct": "A",
    "difficulty": 1
  },
  # 0031 correct=B
  {
    "id": "ks3_bio_repro_0031",
    "level": "ks3",
    "subject": "biology",
    "category": "Reproduction",
    "text": "Which hormone stimulates the development of an egg (follicle) in the ovary each month?",
    "options": {
      "A": "Testosterone",
      "B": "FSH (follicle-stimulating hormone)",
      "C": "Progesterone",
      "D": "Adrenaline"
    },
    "correct": "B",
    "difficulty": 2
  },
  # 0032 correct=D
  {
    "id": "ks3_bio_repro_0032",
    "level": "ks3",
    "subject": "biology",
    "category": "Reproduction",
    "text": "What is the main role of progesterone during pregnancy?",
    "options": {
      "A": "To trigger ovulation",
      "B": "To produce sperm",
      "C": "To stimulate the growth of facial hair",
      "D": "To maintain the uterus lining so the embryo stays implanted"
    },
    "correct": "D",
    "difficulty": 2
  },
  # 0033 correct=A
  {
    "id": "ks3_bio_repro_0033",
    "level": "ks3",
    "subject": "biology",
    "category": "Reproduction",
    "text": "What happens to the uterus lining if a fertilised egg does not implant?",
    "options": {
      "A": "It is shed during menstruation",
      "B": "It grows thicker ready for next month",
      "C": "It is absorbed back into the bloodstream",
      "D": "It turns into the placenta"
    },
    "correct": "A",
    "difficulty": 2
  },
  # 0034 correct=C
  {
    "id": "ks3_bio_repro_0034",
    "level": "ks3",
    "subject": "biology",
    "category": "Reproduction",
    "text": "Through which tube does a sperm cell travel to reach the egg after ovulation?",
    "options": {
      "A": "The urethra",
      "B": "The cervix",
      "C": "The oviduct (fallopian tube)",
      "D": "The ureter"
    },
    "correct": "C",
    "difficulty": 2
  },
  # 0035 correct=D
  {
    "id": "ks3_bio_repro_0035",
    "level": "ks3",
    "subject": "biology",
    "category": "Reproduction",
    "text": "Where does a fertilised egg implant so that it can develop into a baby?",
    "options": {
      "A": "The ovary",
      "B": "The oviduct",
      "C": "The cervix",
      "D": "The wall of the uterus"
    },
    "correct": "D",
    "difficulty": 1
  },
  # 0036 correct=A
  {
    "id": "ks3_bio_repro_0036",
    "level": "ks3",
    "subject": "biology",
    "category": "Reproduction",
    "text": "What is the function of the umbilical cord?",
    "options": {
      "A": "To connect the foetus to the placenta so nutrients and waste can pass between them",
      "B": "To hold the foetus in a fixed position inside the womb",
      "C": "To allow the foetus to breathe air before birth",
      "D": "To produce amniotic fluid around the foetus"
    },
    "correct": "A",
    "difficulty": 2
  },
  # 0037 correct=D
  {
    "id": "ks3_bio_repro_0037",
    "level": "ks3",
    "subject": "biology",
    "category": "Reproduction",
    "text": "What is the role of amniotic fluid during pregnancy?",
    "options": {
      "A": "To provide oxygen directly to the foetus",
      "B": "To carry nutrients from the mother to the foetus",
      "C": "To stimulate contractions during labour",
      "D": "To cushion and protect the developing foetus from knocks and bumps"
    },
    "correct": "D",
    "difficulty": 2
  },
  # 0038 correct=C
  {
    "id": "ks3_bio_repro_0038",
    "level": "ks3",
    "subject": "biology",
    "category": "Reproduction",
    "text": "Which substances pass from the mother to the foetus through the placenta?",
    "options": {
      "A": "Carbon dioxide and urea",
      "B": "Only water and minerals",
      "C": "Oxygen, glucose, and antibodies",
      "D": "Hormones and red blood cells"
    },
    "correct": "C",
    "difficulty": 2
  },
  # 0039 correct=A
  {
    "id": "ks3_bio_repro_0039",
    "level": "ks3",
    "subject": "biology",
    "category": "Reproduction",
    "text": "Which waste products pass from the foetus to the mother through the placenta?",
    "options": {
      "A": "Carbon dioxide and urea",
      "B": "Oxygen and glucose",
      "C": "Antibodies and hormones",
      "D": "Nitrogen and lactic acid"
    },
    "correct": "A",
    "difficulty": 2
  },
  # 0040 correct=D
  {
    "id": "ks3_bio_repro_0040",
    "level": "ks3",
    "subject": "biology",
    "category": "Reproduction",
    "text": "Which of the following is an advantage of asexual reproduction?",
    "options": {
      "A": "It produces offspring with greater genetic variation",
      "B": "Offspring are more resistant to disease",
      "C": "It requires a partner to reproduce",
      "D": "It is faster and all offspring can reproduce, so populations grow quickly"
    },
    "correct": "D",
    "difficulty": 2
  },
  # 0041 correct=B
  {
    "id": "ks3_bio_repro_0041",
    "level": "ks3",
    "subject": "biology",
    "category": "Reproduction",
    "text": "Which of the following is a disadvantage of asexual reproduction?",
    "options": {
      "A": "It takes too long compared to sexual reproduction",
      "B": "All offspring are genetically identical, so a single disease can wipe out the whole population",
      "C": "It requires two parents, which is not always possible",
      "D": "Offspring produced are always weaker than the parent"
    },
    "correct": "B",
    "difficulty": 2
  },
  # 0042 correct=A
  {
    "id": "ks3_bio_repro_0042",
    "level": "ks3",
    "subject": "biology",
    "category": "Reproduction",
    "text": "Strawberry plants can reproduce by sending out runners that grow into new plants. What type of reproduction is this?",
    "options": {
      "A": "Vegetative propagation (asexual reproduction)",
      "B": "Sexual reproduction involving fertilisation",
      "C": "Cross-pollination",
      "D": "Germination"
    },
    "correct": "A",
    "difficulty": 2
  },
  # 0043 correct=D
  {
    "id": "ks3_bio_repro_0043",
    "level": "ks3",
    "subject": "biology",
    "category": "Reproduction",
    "text": "Which of the following plants reproduces using bulbs as a form of vegetative propagation?",
    "options": {
      "A": "Strawberry",
      "B": "Potato",
      "C": "Dandelion",
      "D": "Tulip"
    },
    "correct": "D",
    "difficulty": 2
  },
  # 0044 correct=C
  {
    "id": "ks3_bio_repro_0044",
    "level": "ks3",
    "subject": "biology",
    "category": "Reproduction",
    "text": "Tissue culture is a method used to clone plants artificially. What does tissue culture involve?",
    "options": {
      "A": "Cross-pollinating two plants to produce seeds",
      "B": "Grafting a branch from one plant onto another plant",
      "C": "Growing new plants from a small group of cells taken from a parent plant",
      "D": "Collecting seeds and planting them in special conditions"
    },
    "correct": "C",
    "difficulty": 3
  },
  # 0045 correct=D
  {
    "id": "ks3_bio_repro_0045",
    "level": "ks3",
    "subject": "biology",
    "category": "Reproduction",
    "text": "Dolly the sheep was famous because she was the first mammal to be cloned from an adult body cell. Which type of reproduction does cloning represent?",
    "options": {
      "A": "Sexual reproduction",
      "B": "Cross-pollination",
      "C": "Fertilisation",
      "D": "Asexual reproduction"
    },
    "correct": "D",
    "difficulty": 2
  },
  # 0046 correct=A
  {
    "id": "ks3_bio_repro_0046",
    "level": "ks3",
    "subject": "biology",
    "category": "Reproduction",
    "text": "Which of the following is an ethical concern about human cloning?",
    "options": {
      "A": "Cloned humans might not be treated as individuals with their own rights",
      "B": "Clones would always be smarter than normal humans",
      "C": "Human cloning would make sexual reproduction unnecessary",
      "D": "Clones cannot survive past childhood"
    },
    "correct": "A",
    "difficulty": 3
  },
  # 0047 correct=C
  {
    "id": "ks3_bio_repro_0047",
    "level": "ks3",
    "subject": "biology",
    "category": "Reproduction",
    "text": "Which of the following best describes how a physical barrier method of contraception works?",
    "options": {
      "A": "It uses hormones to stop ovulation",
      "B": "It destroys sperm cells using heat",
      "C": "It prevents sperm from reaching the egg",
      "D": "It prevents the uterus lining from thickening"
    },
    "correct": "C",
    "difficulty": 2
  },
  # 0048 correct=D
  {
    "id": "ks3_bio_repro_0048",
    "level": "ks3",
    "subject": "biology",
    "category": "Reproduction",
    "text": "How do hormonal methods of contraception (such as the pill) generally work?",
    "options": {
      "A": "They physically block sperm from entering the uterus",
      "B": "They kill sperm cells in the vagina",
      "C": "They cause the egg to be released more frequently",
      "D": "They use hormones to stop ovulation or prevent implantation"
    },
    "correct": "D",
    "difficulty": 2
  },
  # 0049 correct=B
  {
    "id": "ks3_bio_repro_0049",
    "level": "ks3",
    "subject": "biology",
    "category": "Reproduction",
    "text": "What is the purpose of the menstrual cycle?",
    "options": {
      "A": "To produce testosterone in the ovaries each month",
      "B": "To prepare the uterus for a possible pregnancy each month",
      "C": "To trigger the release of FSH from the uterus",
      "D": "To cause puberty to begin in teenage girls"
    },
    "correct": "B",
    "difficulty": 1
  },
  # 0050 correct=A
  {
    "id": "ks3_bio_repro_0050",
    "level": "ks3",
    "subject": "biology",
    "category": "Reproduction",
    "text": "A woman struggling to get pregnant is given FSH injections as a fertility treatment. What does FSH do in this context?",
    "options": {
      "A": "It stimulates the ovaries to develop and release eggs",
      "B": "It thickens the cervix to improve chances of implantation",
      "C": "It increases progesterone levels to maintain pregnancy",
      "D": "It triggers sperm production in her partner"
    },
    "correct": "A",
    "difficulty": 3
  },
  # 0051 correct=D
  {
    "id": "ks3_bio_repro_0051",
    "level": "ks3",
    "subject": "biology",
    "category": "Reproduction",
    "text": "Insect-pollinated flowers are usually brightly coloured and produce sweet nectar. What is the purpose of these features?",
    "options": {
      "A": "To protect the flower from strong winds",
      "B": "To store extra food for the plant during winter",
      "C": "To produce large amounts of lightweight pollen",
      "D": "To attract insects so they transfer pollen between flowers"
    },
    "correct": "D",
    "difficulty": 1
  },
  # 0052 correct=C
  {
    "id": "ks3_bio_repro_0052",
    "level": "ks3",
    "subject": "biology",
    "category": "Reproduction",
    "text": "Compared to insect-pollinated flowers, wind-pollinated flowers tend to produce pollen that is:",
    "options": {
      "A": "Sticky and large so it clings to insect bodies",
      "B": "Brightly coloured to be visible in the wind",
      "C": "Small, light, and smooth so it can be carried long distances by the wind",
      "D": "Produced in very small quantities to save energy"
    },
    "correct": "C",
    "difficulty": 2
  },
  # 0053 correct=D
  {
    "id": "ks3_bio_repro_0053",
    "level": "ks3",
    "subject": "biology",
    "category": "Reproduction",
    "text": "What is cross-pollination?",
    "options": {
      "A": "Pollen moving from the anther to the stigma of the same flower",
      "B": "An insect eating the pollen of a flower",
      "C": "A seed being carried away from the parent plant by the wind",
      "D": "Pollen from one plant being transferred to the stigma of a different plant of the same species"
    },
    "correct": "D",
    "difficulty": 2
  },
  # 0054 correct=A
  {
    "id": "ks3_bio_repro_0054",
    "level": "ks3",
    "subject": "biology",
    "category": "Reproduction",
    "text": "Which part of a flower contains the ovules, which can develop into seeds after fertilisation?",
    "options": {
      "A": "The ovary",
      "B": "The anther",
      "C": "The stigma",
      "D": "The petal"
    },
    "correct": "A",
    "difficulty": 1
  },
  # 0055 correct=D
  {
    "id": "ks3_bio_repro_0055",
    "level": "ks3",
    "subject": "biology",
    "category": "Reproduction",
    "text": "The coconut is a large, buoyant fruit. Which method of seed dispersal does the coconut use?",
    "options": {
      "A": "Wind",
      "B": "Animals eating the fruit",
      "C": "Explosive seed pods",
      "D": "Water"
    },
    "correct": "D",
    "difficulty": 1
  },
  # 0056 correct=B
  {
    "id": "ks3_bio_repro_0056",
    "level": "ks3",
    "subject": "biology",
    "category": "Reproduction",
    "text": "Burdock plants produce seeds covered in tiny hooks. How are these seeds dispersed?",
    "options": {
      "A": "They float on water",
      "B": "They cling to the fur or clothing of passing animals and humans",
      "C": "They are carried away by the wind",
      "D": "They are launched explosively from the seed pod"
    },
    "correct": "B",
    "difficulty": 1
  },
  # 0057 correct=A
  {
    "id": "ks3_bio_repro_0057",
    "level": "ks3",
    "subject": "biology",
    "category": "Reproduction",
    "text": "Which of the following changes occurs in females during puberty?",
    "options": {
      "A": "The hips widen and pubic hair grows",
      "B": "The voice deepens significantly",
      "C": "Sperm production begins",
      "D": "Testosterone becomes the dominant sex hormone"
    },
    "correct": "A",
    "difficulty": 1
  },
  # 0058 correct=C
  {
    "id": "ks3_bio_repro_0058",
    "level": "ks3",
    "subject": "biology",
    "category": "Reproduction",
    "text": "What happens to the uterus lining in the days before ovulation each month?",
    "options": {
      "A": "It is shed through menstruation",
      "B": "It shrinks to make room for the growing egg",
      "C": "It thickens to prepare for a possible fertilised egg to implant",
      "D": "It produces FSH to trigger egg release"
    },
    "correct": "C",
    "difficulty": 2
  },
  # 0059 correct=D
  {
    "id": "ks3_bio_repro_0059",
    "level": "ks3",
    "subject": "biology",
    "category": "Reproduction",
    "text": "Which of the following is a change that happens in males during puberty?",
    "options": {
      "A": "The menstrual cycle begins",
      "B": "Breast tissue develops significantly",
      "C": "Oestrogen becomes the main sex hormone",
      "D": "Sperm production begins in the testes"
    },
    "correct": "D",
    "difficulty": 1
  },
  # 0060 correct=A
  {
    "id": "ks3_bio_repro_0060",
    "level": "ks3",
    "subject": "biology",
    "category": "Reproduction",
    "text": "A potato plant reproduces using underground tubers. What type of reproduction is this an example of?",
    "options": {
      "A": "Vegetative propagation (asexual reproduction)",
      "B": "Sexual reproduction",
      "C": "Pollination",
      "D": "Germination"
    },
    "correct": "A",
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
    assert dist == {'A':13,'B':5,'C':8,'D':14}, f"Distribution wrong: {dict(dist)}"
    combined = existing + NEW_Q
    save_json(json_path, combined)
    update_js(js_path, NEW_Q)
    print(f"backend: {len(existing)} -> {len(combined)} | JS updated")

if __name__ == '__main__':
    main()
