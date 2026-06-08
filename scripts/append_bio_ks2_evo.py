#!/usr/bin/env python3
"""MIN-98 wave 2: KS2 Biology - Evolution & inheritance (20 new, 0021-0040)
Target dist: A=7 B=0 C=7 D=6
"""
import json, sys
from collections import Counter

NEW_Q = [
  # 0021 -> correct=A | Topic: Mary Anning, famous fossil hunter
  {
    "id": "ks2_bio_evo_0021",
    "level": "ks2",
    "subject": "biology",
    "category": "Evolution & inheritance",
    "text": "Mary Anning was a famous fossil hunter. Which creature's fossil did she find on the cliffs at Lyme Regis?",
    "options": {
      "A": "Ichthyosaur",
      "B": "Triceratops",
      "C": "Woolly mammoth",
      "D": "Dodo"
    },
    "correct": "A",
    "difficulty": 2
  },
  # 0022 -> correct=C | Topic: Fossils form in sedimentary rock
  {
    "id": "ks2_bio_evo_0022",
    "level": "ks2",
    "subject": "biology",
    "category": "Evolution & inheritance",
    "text": "In which type of rock are most fossils found?",
    "options": {
      "A": "Igneous rock",
      "B": "Lava rock",
      "C": "Sedimentary rock",
      "D": "Magnetic rock"
    },
    "correct": "C",
    "difficulty": 1
  },
  # 0023 -> correct=D | Topic: 'Survival of the fittest' in simple terms
  {
    "id": "ks2_bio_evo_0023",
    "level": "ks2",
    "subject": "biology",
    "category": "Evolution & inheritance",
    "text": "What does 'survival of the fittest' mean in simple terms?",
    "options": {
      "A": "Only the strongest animals can run fast",
      "B": "Animals that go to the gym survive longer",
      "C": "Every animal has the same chance of surviving",
      "D": "Animals that are best suited to their environment are more likely to survive and have young"
    },
    "correct": "D",
    "difficulty": 1
  },
  # 0024 -> correct=A | Topic: What happened to the dinosaurs?
  {
    "id": "ks2_bio_evo_0024",
    "level": "ks2",
    "subject": "biology",
    "category": "Evolution & inheritance",
    "text": "What do many scientists believe caused the dinosaurs to become extinct?",
    "options": {
      "A": "A large asteroid or meteorite hit the Earth",
      "B": "Dinosaurs all swam into the sea",
      "C": "Humans hunted them all",
      "D": "They ran out of water to drink"
    },
    "correct": "A",
    "difficulty": 1
  },
  # 0025 -> correct=C | Topic: What is an endangered species?
  {
    "id": "ks2_bio_evo_0025",
    "level": "ks2",
    "subject": "biology",
    "category": "Evolution & inheritance",
    "text": "What does it mean when an animal is described as 'endangered'?",
    "options": {
      "A": "The animal is very dangerous to humans",
      "B": "The animal has just been discovered for the first time",
      "C": "The animal is at risk of becoming extinct",
      "D": "The animal only lives in zoos"
    },
    "correct": "C",
    "difficulty": 1
  },
  # 0026 -> correct=D | Topic: Why do animals have helpful features? (natural selection)
  {
    "id": "ks2_bio_evo_0026",
    "level": "ks2",
    "subject": "biology",
    "category": "Evolution & inheritance",
    "text": "A polar bear has thick white fur. Why do polar bears have features like this that help them survive?",
    "options": {
      "A": "They chose to grow thick fur when they felt cold",
      "B": "A scientist designed polar bears to have white fur",
      "C": "All animals in cold places automatically grow thick fur",
      "D": "Over many generations, bears with features that helped them survive had more young"
    },
    "correct": "D",
    "difficulty": 2
  },
  # 0027 -> correct=A | Topic: What is a species in simple terms?
  {
    "id": "ks2_bio_evo_0027",
    "level": "ks2",
    "subject": "biology",
    "category": "Evolution & inheritance",
    "text": "In simple terms, what is a 'species'?",
    "options": {
      "A": "A group of living things that are very similar and can breed together to produce young",
      "B": "Any animal that lives in the wild",
      "C": "A type of plant found in a rainforest",
      "D": "A group of animals that all look exactly the same"
    },
    "correct": "A",
    "difficulty": 1
  },
  # 0028 -> correct=C | Topic: How long does evolution take?
  {
    "id": "ks2_bio_evo_0028",
    "level": "ks2",
    "subject": "biology",
    "category": "Evolution & inheritance",
    "text": "How long does evolution usually take?",
    "options": {
      "A": "A few days",
      "B": "About one year",
      "C": "Many generations, often millions of years",
      "D": "About 100 years"
    },
    "correct": "C",
    "difficulty": 1
  },
  # 0029 -> correct=D | Topic: Inherited vs acquired characteristics
  {
    "id": "ks2_bio_evo_0029",
    "level": "ks2",
    "subject": "biology",
    "category": "Evolution & inheritance",
    "text": "Which of these is an ACQUIRED characteristic (not inherited from parents)?",
    "options": {
      "A": "Eye colour",
      "B": "Blood group",
      "C": "Natural hair colour",
      "D": "A scar from an injury"
    },
    "correct": "D",
    "difficulty": 2
  },
  # 0030 -> correct=A | Topic: Why bacteria become resistant to antibiotics
  {
    "id": "ks2_bio_evo_0030",
    "level": "ks2",
    "subject": "biology",
    "category": "Evolution & inheritance",
    "text": "Some bacteria are not killed by antibiotics. They survive, reproduce, and pass on this resistance. What process is this an example of?",
    "options": {
      "A": "Natural selection",
      "B": "Selective breeding",
      "C": "Fossilisation",
      "D": "Extinction"
    },
    "correct": "A",
    "difficulty": 2
  },
  # 0031 -> correct=C | Topic: What is a mutation in simple terms?
  {
    "id": "ks2_bio_evo_0031",
    "level": "ks2",
    "subject": "biology",
    "category": "Evolution & inheritance",
    "text": "In simple terms, what is a mutation?",
    "options": {
      "A": "When an animal changes colour in winter",
      "B": "When a fossil is found in rock",
      "C": "A random change in the characteristics of a living thing",
      "D": "When an animal learns a new skill"
    },
    "correct": "C",
    "difficulty": 2
  },
  # 0032 -> correct=D | Topic: What happened to the dodo?
  {
    "id": "ks2_bio_evo_0032",
    "level": "ks2",
    "subject": "biology",
    "category": "Evolution & inheritance",
    "text": "What happened to the dodo bird?",
    "options": {
      "A": "It evolved into a different bird",
      "B": "It flew to a remote island and is still there",
      "C": "It went into a very deep sleep underground",
      "D": "It was hunted to extinction by humans"
    },
    "correct": "D",
    "difficulty": 1
  },
  # 0033 -> correct=A | Topic: How do fossils form?
  {
    "id": "ks2_bio_evo_0033",
    "level": "ks2",
    "subject": "biology",
    "category": "Evolution & inheritance",
    "text": "How do most fossils form?",
    "options": {
      "A": "A dead organism is buried in sediment, which slowly turns to rock over millions of years",
      "B": "Scientists make models of old animals out of clay",
      "C": "Animals are frozen in ice and dug up later",
      "D": "Living animals are kept in museums for people to see"
    },
    "correct": "A",
    "difficulty": 1
  },
  # 0034 -> correct=C | Topic: What does 'adapted' mean for an organism?
  {
    "id": "ks2_bio_evo_0034",
    "level": "ks2",
    "subject": "biology",
    "category": "Evolution & inheritance",
    "text": "What does it mean to say an animal is 'adapted' to its environment?",
    "options": {
      "A": "The animal was moved to a new home by a scientist",
      "B": "The animal has learned to speak a new language",
      "C": "The animal has features that help it survive in the place where it lives",
      "D": "The animal looks exactly like all other animals of its kind"
    },
    "correct": "C",
    "difficulty": 1
  },
  # 0035 -> correct=D | Topic: What is a living fossil?
  {
    "id": "ks2_bio_evo_0035",
    "level": "ks2",
    "subject": "biology",
    "category": "Evolution & inheritance",
    "text": "What is a 'living fossil'?",
    "options": {
      "A": "A fossil that scientists have brought back to life",
      "B": "A rock that looks like an animal",
      "C": "An animal that lived alongside dinosaurs and is now extinct",
      "D": "An animal that is still alive today and looks almost the same as its ancient fossils"
    },
    "correct": "D",
    "difficulty": 2
  },
  # 0036 -> correct=A | Topic: Alfred Russel Wallace's contribution
  {
    "id": "ks2_bio_evo_0036",
    "level": "ks2",
    "subject": "biology",
    "category": "Evolution & inheritance",
    "text": "Alfred Russel Wallace was a scientist who lived at the same time as Charles Darwin. What is he famous for?",
    "options": {
      "A": "He also independently came up with the idea of evolution by natural selection",
      "B": "He discovered the first dinosaur fossil",
      "C": "He invented the microscope",
      "D": "He created the first zoo"
    },
    "correct": "A",
    "difficulty": 2
  },
  # 0037 -> correct=C | Topic: Why did the woolly mammoth become extinct?
  {
    "id": "ks2_bio_evo_0037",
    "level": "ks2",
    "subject": "biology",
    "category": "Evolution & inheritance",
    "text": "Scientists think the woolly mammoth became extinct because of which two main reasons?",
    "options": {
      "A": "Too much rain and competition from elephants",
      "B": "Dinosaurs ate them and the seas rose",
      "C": "Climate change as the Earth warmed up, and being overhunted by humans",
      "D": "They grew too large to find food and moved underground"
    },
    "correct": "C",
    "difficulty": 2
  },
  # 0038 -> correct=D | Topic: Term for when a species no longer exists anywhere on Earth
  {
    "id": "ks2_bio_evo_0038",
    "level": "ks2",
    "subject": "biology",
    "category": "Evolution & inheritance",
    "text": "What is the word for when a species has completely died out and no longer exists anywhere on Earth?",
    "options": {
      "A": "Endangered",
      "B": "Adapted",
      "C": "Hibernating",
      "D": "Extinct"
    },
    "correct": "D",
    "difficulty": 1
  },
  # 0039 -> correct=A | Topic: How can humans help prevent animal extinction?
  {
    "id": "ks2_bio_evo_0039",
    "level": "ks2",
    "subject": "biology",
    "category": "Evolution & inheritance",
    "text": "Which of these is a good way for humans to help prevent animals from becoming extinct?",
    "options": {
      "A": "Protecting wild habitats and making laws against hunting endangered animals",
      "B": "Moving all wild animals into city parks",
      "C": "Teaching animals to live in houses",
      "D": "Feeding wild animals the same food that humans eat"
    },
    "correct": "A",
    "difficulty": 1
  },
  # 0040 -> correct=C | Topic: What happens to organisms NOT well adapted over many generations?
  {
    "id": "ks2_bio_evo_0040",
    "level": "ks2",
    "subject": "biology",
    "category": "Evolution & inheritance",
    "text": "Over many generations, what tends to happen to animals that are NOT well adapted to their environment?",
    "options": {
      "A": "They grow larger so they can compete better",
      "B": "They move to a warmer country and start again",
      "C": "They are less likely to survive and have young, so their numbers decrease",
      "D": "They quickly change their features within a few weeks"
    },
    "correct": "C",
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
    assert dist == {'A':7,'C':7,'D':6}, f"Distribution wrong: {dict(dist)}"
    combined = existing + NEW_Q
    save_json(json_path, combined)
    update_js(js_path, NEW_Q)
    print(f"backend: {len(existing)} -> {len(combined)} | JS updated")

if __name__ == '__main__':
    main()
