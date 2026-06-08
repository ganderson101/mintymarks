#!/usr/bin/env python3
"""MIN-98 wave 2: KS3 Biology - Cells & organisation (40 new, 0021-0060)
Target dist: A=15 B=3 C=9 D=13
"""
import json, sys
from collections import Counter

NEW_Q = [
  # 0021=A diff=1
  {
    "id": "ks3_bio_cells_0021",
    "level": "ks3",
    "subject": "biology",
    "category": "Cells & organisation",
    "text": "Which part of the cell controls what enters and leaves it?",
    "options": {
      "A": "Cell membrane",
      "B": "Cell wall",
      "C": "Nucleus",
      "D": "Vacuole"
    },
    "correct": "A",
    "difficulty": 1
  },
  # 0022=C diff=1
  {
    "id": "ks3_bio_cells_0022",
    "level": "ks3",
    "subject": "biology",
    "category": "Cells & organisation",
    "text": "Which of these is a correct example of the levels of organisation in the human body, from smallest to largest?",
    "options": {
      "A": "Organ -> tissue -> cell -> organ system",
      "B": "Tissue -> cell -> organ -> organ system",
      "C": "Cell -> tissue -> organ -> organ system",
      "D": "Cell -> organ -> tissue -> organ system"
    },
    "correct": "C",
    "difficulty": 1
  },
  # 0023=C diff=1
  {
    "id": "ks3_bio_cells_0023",
    "level": "ks3",
    "subject": "biology",
    "category": "Cells & organisation",
    "text": "The heart is an example of which level of organisation?",
    "options": {
      "A": "A cell",
      "B": "A tissue",
      "C": "An organ",
      "D": "An organ system"
    },
    "correct": "C",
    "difficulty": 1
  },
  # 0024=A diff=1
  {
    "id": "ks3_bio_cells_0024",
    "level": "ks3",
    "subject": "biology",
    "category": "Cells & organisation",
    "text": "The circulatory system is an example of which level of organisation?",
    "options": {
      "A": "An organ system",
      "B": "An organ",
      "C": "A tissue",
      "D": "A cell"
    },
    "correct": "A",
    "difficulty": 1
  },
  # 0025=D diff=2
  {
    "id": "ks3_bio_cells_0025",
    "level": "ks3",
    "subject": "biology",
    "category": "Cells & organisation",
    "text": "Which of these statements about bacterial cells is correct?",
    "options": {
      "A": "Bacterial cells have a nucleus and mitochondria",
      "B": "Bacterial cells have chloroplasts but no nucleus",
      "C": "Bacterial cells have a nucleus but no cell wall",
      "D": "Bacterial cells have no nucleus but do have a cell wall"
    },
    "correct": "D",
    "difficulty": 2
  },
  # 0026=A diff=2
  {
    "id": "ks3_bio_cells_0026",
    "level": "ks3",
    "subject": "biology",
    "category": "Cells & organisation",
    "text": "What is the difference between a prokaryotic cell and a eukaryotic cell?",
    "options": {
      "A": "Prokaryotic cells have no nucleus; eukaryotic cells do have a nucleus",
      "B": "Prokaryotic cells have a nucleus; eukaryotic cells do not",
      "C": "Prokaryotic cells are larger than eukaryotic cells",
      "D": "Prokaryotic cells have mitochondria; eukaryotic cells do not"
    },
    "correct": "A",
    "difficulty": 2
  },
  # 0027=D diff=2
  {
    "id": "ks3_bio_cells_0027",
    "level": "ks3",
    "subject": "biology",
    "category": "Cells & organisation",
    "text": "A student views a cell under a microscope and sees no nucleus, a cell wall, and a flagellum. What type of cell is it most likely to be?",
    "options": {
      "A": "A plant cell",
      "B": "An animal cell",
      "C": "A fungal cell",
      "D": "A bacterial cell"
    },
    "correct": "D",
    "difficulty": 2
  },
  # 0028=C diff=2
  {
    "id": "ks3_bio_cells_0028",
    "level": "ks3",
    "subject": "biology",
    "category": "Cells & organisation",
    "text": "A cell image under a microscope measures 20 mm. The actual cell is 0.02 mm. What is the magnification?",
    "options": {
      "A": "x100",
      "B": "x400",
      "C": "x1000",
      "D": "x2000"
    },
    "correct": "C",
    "difficulty": 2
  },
  # 0029=A diff=2
  {
    "id": "ks3_bio_cells_0029",
    "level": "ks3",
    "subject": "biology",
    "category": "Cells & organisation",
    "text": "A cell appears 4 mm wide under a microscope and its actual width is 0.02 mm. What is the magnification?",
    "options": {
      "A": "x200",
      "B": "x20",
      "C": "x2000",
      "D": "x0.005"
    },
    "correct": "A",
    "difficulty": 2
  },
  # 0030=D diff=1
  {
    "id": "ks3_bio_cells_0030",
    "level": "ks3",
    "subject": "biology",
    "category": "Cells & organisation",
    "text": "What does the eyepiece lens of a light microscope do?",
    "options": {
      "A": "Focuses light onto the slide",
      "B": "Holds the slide in place",
      "C": "Produces the original magnified image",
      "D": "Further magnifies the image produced by the objective lens"
    },
    "correct": "D",
    "difficulty": 1
  },
  # 0031=A diff=1
  {
    "id": "ks3_bio_cells_0031",
    "level": "ks3",
    "subject": "biology",
    "category": "Cells & organisation",
    "text": "Why is iodine solution used when preparing a slide to view plant cells?",
    "options": {
      "A": "It stains starch and makes structures easier to see",
      "B": "It kills the cells so they stop moving",
      "C": "It makes the cell wall transparent",
      "D": "It prevents the cover slip from cracking"
    },
    "correct": "A",
    "difficulty": 1
  },
  # 0032=D diff=1
  {
    "id": "ks3_bio_cells_0032",
    "level": "ks3",
    "subject": "biology",
    "category": "Cells & organisation",
    "text": "What is the purpose of a cover slip when preparing a microscope slide?",
    "options": {
      "A": "To add stain to the sample",
      "B": "To increase the magnification",
      "C": "To kill any bacteria on the slide",
      "D": "To protect the sample and prevent it drying out"
    },
    "correct": "D",
    "difficulty": 1
  },
  # 0033=C diff=1
  {
    "id": "ks3_bio_cells_0033",
    "level": "ks3",
    "subject": "biology",
    "category": "Cells & organisation",
    "text": "Methylene blue stain is used when viewing animal cells under a microscope. What does it help to show?",
    "options": {
      "A": "Chloroplasts",
      "B": "The cell wall",
      "C": "The nucleus",
      "D": "Mitochondria"
    },
    "correct": "C",
    "difficulty": 1
  },
  # 0034=A diff=2
  {
    "id": "ks3_bio_cells_0034",
    "level": "ks3",
    "subject": "biology",
    "category": "Cells & organisation",
    "text": "Nerve cells are very long and have many branched endings. Why is this shape an advantage?",
    "options": {
      "A": "It allows them to carry electrical signals over long distances and connect to many other cells",
      "B": "It helps them absorb more oxygen from the blood",
      "C": "It gives them more space to store glucose",
      "D": "It allows them to divide more quickly"
    },
    "correct": "A",
    "difficulty": 2
  },
  # 0035=D diff=2
  {
    "id": "ks3_bio_cells_0035",
    "level": "ks3",
    "subject": "biology",
    "category": "Cells & organisation",
    "text": "Palisade cells are found near the top of a leaf and are packed with chloroplasts. Why is this an advantage for the plant?",
    "options": {
      "A": "It helps the leaf absorb water from the soil",
      "B": "It allows the leaf to store more sugar",
      "C": "It protects the leaf from insects",
      "D": "It maximises the amount of light absorbed for photosynthesis"
    },
    "correct": "D",
    "difficulty": 2
  },
  # 0036=B diff=2
  {
    "id": "ks3_bio_cells_0036",
    "level": "ks3",
    "subject": "biology",
    "category": "Cells & organisation",
    "text": "Goblet cells are found in the lining of the airways and intestines. What is their main function?",
    "options": {
      "A": "Absorbing nutrients into the bloodstream",
      "B": "Producing and secreting mucus",
      "C": "Carrying out photosynthesis",
      "D": "Carrying oxygen around the body"
    },
    "correct": "B",
    "difficulty": 2
  },
  # 0037=A diff=1
  {
    "id": "ks3_bio_cells_0037",
    "level": "ks3",
    "subject": "biology",
    "category": "Cells & organisation",
    "text": "Liver cells have a very high number of mitochondria. What does this tell us about liver cells?",
    "options": {
      "A": "They need a large amount of energy to carry out their many chemical reactions",
      "B": "They carry out a lot of photosynthesis",
      "C": "They need to store a lot of water",
      "D": "They divide very rapidly"
    },
    "correct": "A",
    "difficulty": 1
  },
  # 0038=D diff=2
  {
    "id": "ks3_bio_cells_0038",
    "level": "ks3",
    "subject": "biology",
    "category": "Cells & organisation",
    "text": "Which of these correctly describes active transport?",
    "options": {
      "A": "Movement of substances from high to low concentration without using energy",
      "B": "Movement of water from a dilute to a concentrated solution",
      "C": "Movement of substances only through the cell wall",
      "D": "Movement of substances from low to high concentration, requiring energy"
    },
    "correct": "D",
    "difficulty": 2
  },
  # 0039=C diff=2
  {
    "id": "ks3_bio_cells_0039",
    "level": "ks3",
    "subject": "biology",
    "category": "Cells & organisation",
    "text": "What is a concentration gradient?",
    "options": {
      "A": "The speed at which particles move through a membrane",
      "B": "The total number of particles in a solution",
      "C": "The difference in concentration of a substance between two areas",
      "D": "The pressure exerted by water on a cell membrane"
    },
    "correct": "C",
    "difficulty": 2
  },
  # 0040=A diff=2
  {
    "id": "ks3_bio_cells_0040",
    "level": "ks3",
    "subject": "biology",
    "category": "Cells & organisation",
    "text": "A plant cell is placed in pure water. What happens to the cell?",
    "options": {
      "A": "Water enters by osmosis and the cell becomes turgid, but the cell wall stops it from bursting",
      "B": "Water leaves by osmosis and the cell shrinks",
      "C": "The cell bursts immediately because plant cells have no protection",
      "D": "Nothing happens because plant cells do not absorb water"
    },
    "correct": "A",
    "difficulty": 2
  },
  # 0041=D diff=2
  {
    "id": "ks3_bio_cells_0041",
    "level": "ks3",
    "subject": "biology",
    "category": "Cells & organisation",
    "text": "An animal cell is placed in a very salty solution. What is most likely to happen?",
    "options": {
      "A": "The cell swells up and bursts",
      "B": "The cell stays exactly the same",
      "C": "The cell takes in salt by active transport",
      "D": "Water leaves the cell by osmosis and the cell shrinks"
    },
    "correct": "D",
    "difficulty": 2
  },
  # 0042=A diff=1
  {
    "id": "ks3_bio_cells_0042",
    "level": "ks3",
    "subject": "biology",
    "category": "Cells & organisation",
    "text": "What is the liquid stored inside the large vacuole of a plant cell called?",
    "options": {
      "A": "Cell sap",
      "B": "Cytoplasm",
      "C": "Chlorophyll",
      "D": "Cell fluid"
    },
    "correct": "A",
    "difficulty": 1
  },
  # 0043=D diff=1
  {
    "id": "ks3_bio_cells_0043",
    "level": "ks3",
    "subject": "biology",
    "category": "Cells & organisation",
    "text": "Which of these is a feature of chloroplasts that helps them carry out photosynthesis?",
    "options": {
      "A": "They contain DNA that controls protein production",
      "B": "They have a double outer membrane only",
      "C": "They store starch to give the plant energy",
      "D": "They contain chlorophyll which absorbs light energy"
    },
    "correct": "D",
    "difficulty": 1
  },
  # 0044=C diff=2
  {
    "id": "ks3_bio_cells_0044",
    "level": "ks3",
    "subject": "biology",
    "category": "Cells & organisation",
    "text": "Which of these is a key difference between plant cells and animal cells?",
    "options": {
      "A": "Animal cells have a cell wall; plant cells do not",
      "B": "Animal cells have chloroplasts; plant cells do not",
      "C": "Plant cells have a permanent large vacuole; animal cells do not",
      "D": "Plant cells have a nucleus; animal cells do not"
    },
    "correct": "C",
    "difficulty": 2
  },
  # 0045=A diff=1
  {
    "id": "ks3_bio_cells_0045",
    "level": "ks3",
    "subject": "biology",
    "category": "Cells & organisation",
    "text": "What is muscle tissue?",
    "options": {
      "A": "A group of muscle cells working together to produce movement",
      "B": "A single muscle cell that can contract",
      "C": "An organ that pumps blood",
      "D": "A system of organs that control movement"
    },
    "correct": "A",
    "difficulty": 1
  },
  # 0046=D diff=2
  {
    "id": "ks3_bio_cells_0046",
    "level": "ks3",
    "subject": "biology",
    "category": "Cells & organisation",
    "text": "Xylem and phloem are both found in plants. What are they examples of?",
    "options": {
      "A": "Organelles",
      "B": "Organs",
      "C": "Organ systems",
      "D": "Tissues"
    },
    "correct": "D",
    "difficulty": 2
  },
  # 0047=A diff=2
  {
    "id": "ks3_bio_cells_0047",
    "level": "ks3",
    "subject": "biology",
    "category": "Cells & organisation",
    "text": "What is the function of epidermal tissue in a leaf?",
    "options": {
      "A": "It forms a protective outer layer on the surface of the leaf",
      "B": "It transports water up through the leaf",
      "C": "It carries out most of the photosynthesis in the leaf",
      "D": "It stores sugar produced during photosynthesis"
    },
    "correct": "A",
    "difficulty": 2
  },
  # 0048=B diff=2
  {
    "id": "ks3_bio_cells_0048",
    "level": "ks3",
    "subject": "biology",
    "category": "Cells & organisation",
    "text": "What is one advantage of being a multicellular organism compared to a unicellular organism?",
    "options": {
      "A": "Multicellular organisms reproduce more quickly",
      "B": "Cells can become specialised to carry out different functions more efficiently",
      "C": "Multicellular organisms do not need as much food",
      "D": "Multicellular organisms do not need to exchange substances with their environment"
    },
    "correct": "B",
    "difficulty": 2
  },
  # 0049=D diff=2
  {
    "id": "ks3_bio_cells_0049",
    "level": "ks3",
    "subject": "biology",
    "category": "Cells & organisation",
    "text": "What is cell specialisation?",
    "options": {
      "A": "When a cell divides to produce identical copies of itself",
      "B": "When cells group together to form a tissue",
      "C": "When a cell grows larger over time",
      "D": "When a cell develops a particular structure suited to its specific function"
    },
    "correct": "D",
    "difficulty": 2
  },
  # 0050=C diff=2
  {
    "id": "ks3_bio_cells_0050",
    "level": "ks3",
    "subject": "biology",
    "category": "Cells & organisation",
    "text": "When a cell divides, what must happen to the chromosomes first?",
    "options": {
      "A": "The chromosomes must be destroyed and new ones made",
      "B": "The chromosomes must move to the cell membrane",
      "C": "The chromosomes must be copied so each new cell gets a full set",
      "D": "The chromosomes must be broken in half"
    },
    "correct": "C",
    "difficulty": 2
  },
  # 0051=A diff=1
  {
    "id": "ks3_bio_cells_0051",
    "level": "ks3",
    "subject": "biology",
    "category": "Cells & organisation",
    "text": "Stem cells are described as unspecialised. What does this mean?",
    "options": {
      "A": "They have not yet developed into a specific cell type and can still become many different kinds of cell",
      "B": "They are too small to be seen under a microscope",
      "C": "They do not contain a nucleus",
      "D": "They cannot divide or reproduce"
    },
    "correct": "A",
    "difficulty": 1
  },
  # 0052=D diff=2
  {
    "id": "ks3_bio_cells_0052",
    "level": "ks3",
    "subject": "biology",
    "category": "Cells & organisation",
    "text": "Why are stem cells considered useful in medicine?",
    "options": {
      "A": "They produce antibodies to fight disease",
      "B": "They can be used to make vaccines",
      "C": "They store glucose for use during illness",
      "D": "They could potentially be used to grow replacement tissues or organs for patients"
    },
    "correct": "D",
    "difficulty": 2
  },
  # 0053=A diff=1
  {
    "id": "ks3_bio_cells_0053",
    "level": "ks3",
    "subject": "biology",
    "category": "Cells & organisation",
    "text": "Algae are simple organisms that can carry out photosynthesis. Which organelle makes this possible?",
    "options": {
      "A": "Chloroplasts",
      "B": "Mitochondria",
      "C": "Ribosomes",
      "D": "Vacuoles"
    },
    "correct": "A",
    "difficulty": 1
  },
  # 0054=D diff=2
  {
    "id": "ks3_bio_cells_0054",
    "level": "ks3",
    "subject": "biology",
    "category": "Cells & organisation",
    "text": "How do bacteria differ from typical body cells in terms of their internal structure?",
    "options": {
      "A": "Bacteria have more mitochondria than body cells",
      "B": "Bacteria have chloroplasts but body cells do not",
      "C": "Bacteria have a larger nucleus than body cells",
      "D": "Bacteria have no membrane-bound nucleus or mitochondria, unlike body cells"
    },
    "correct": "D",
    "difficulty": 2
  },
  # 0055=C diff=2
  {
    "id": "ks3_bio_cells_0055",
    "level": "ks3",
    "subject": "biology",
    "category": "Cells & organisation",
    "text": "A student uses a microscope with an eyepiece magnification of x10 and an objective lens magnification of x40. What is the total magnification?",
    "options": {
      "A": "x50",
      "B": "x400",
      "C": "x400",
      "D": "x4"
    },
    "correct": "C",
    "difficulty": 2
  },
  # 0056=A diff=1
  {
    "id": "ks3_bio_cells_0056",
    "level": "ks3",
    "subject": "biology",
    "category": "Cells & organisation",
    "text": "Diffusion moves substances from an area of high concentration to an area of low concentration. What is this difference called?",
    "options": {
      "A": "The concentration gradient",
      "B": "Active transport",
      "C": "Osmotic pressure",
      "D": "The diffusion barrier"
    },
    "correct": "A",
    "difficulty": 1
  },
  # 0057=D diff=2
  {
    "id": "ks3_bio_cells_0057",
    "level": "ks3",
    "subject": "biology",
    "category": "Cells & organisation",
    "text": "Which of the following statements about osmosis is correct?",
    "options": {
      "A": "Osmosis requires energy and moves water against a concentration gradient",
      "B": "Osmosis only occurs in animal cells, not plant cells",
      "C": "Osmosis moves dissolved minerals across the cell membrane",
      "D": "Osmosis is the movement of water from a dilute solution to a more concentrated solution through a partially permeable membrane"
    },
    "correct": "D",
    "difficulty": 2
  },
  # 0058=A diff=1
  {
    "id": "ks3_bio_cells_0058",
    "level": "ks3",
    "subject": "biology",
    "category": "Cells & organisation",
    "text": "What does it mean when we say the cell membrane is 'partially permeable'?",
    "options": {
      "A": "It allows some substances to pass through but not others",
      "B": "It lets all substances through equally",
      "C": "It completely blocks everything from entering the cell",
      "D": "It only allows water to pass through during active transport"
    },
    "correct": "A",
    "difficulty": 1
  },
  # 0059=B diff=3
  {
    "id": "ks3_bio_cells_0059",
    "level": "ks3",
    "subject": "biology",
    "category": "Cells & organisation",
    "text": "A student places a piece of potato in a very concentrated salt solution and leaves it for 30 minutes. The potato becomes soft and floppy. Which explanation is correct?",
    "options": {
      "A": "Salt entered the potato cells by active transport, making them rigid",
      "B": "Water left the potato cells by osmosis, causing the cells to lose their firmness",
      "C": "Water entered the potato cells by osmosis, causing them to swell and burst",
      "D": "The cell walls of the potato cells dissolved in the salt solution"
    },
    "correct": "B",
    "difficulty": 3
  },
  # 0060=C diff=3
  {
    "id": "ks3_bio_cells_0060",
    "level": "ks3",
    "subject": "biology",
    "category": "Cells & organisation",
    "text": "A student compares a plant cell and an animal cell. Which row correctly identifies features found in one type but not the other?",
    "options": {
      "A": "Plant cell only: nucleus and mitochondria; Animal cell only: cell membrane",
      "B": "Plant cell only: ribosomes; Animal cell only: cytoplasm",
      "C": "Plant cell only: cell wall, chloroplasts, and large permanent vacuole; Animal cell only: none of these",
      "D": "Plant cell only: cell membrane; Animal cell only: cell wall and chloroplasts"
    },
    "correct": "C",
    "difficulty": 3
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
    assert dist == {'A':15,'B':3,'C':9,'D':13}, f"Distribution wrong: {dict(dist)}"
    combined = existing + NEW_Q
    save_json(json_path, combined)
    update_js(js_path, NEW_Q)
    print(f"backend: {len(existing)} -> {len(combined)} | JS updated")

if __name__ == '__main__':
    main()
