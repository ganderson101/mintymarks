#!/usr/bin/env python3
"""MIN-98 wave 2: KS3 Biology - Photosynthesis (40 new, 0021-0060)
Target dist: A=15 B=1 C=9 D=15
"""
import json, sys
from collections import Counter

NEW_Q = [
  # 0021=A
  {
    "id": "ks3_bio_photo_0021",
    "level": "ks3",
    "subject": "biology",
    "category": "Photosynthesis",
    "text": "What is the main way plants use the glucose made during photosynthesis?",
    "options": {
      "A": "Respiration to release energy for growth and other life processes",
      "B": "To make carbon dioxide for gas exchange",
      "C": "To absorb water from the soil through the roots",
      "D": "To produce oxygen for the surrounding air"
    },
    "correct": "A",
    "difficulty": 1
  },
  # 0022=D
  {
    "id": "ks3_bio_photo_0022",
    "level": "ks3",
    "subject": "biology",
    "category": "Photosynthesis",
    "text": "In which form do plants store glucose for long-term energy reserves?",
    "options": {
      "A": "Cellulose",
      "B": "Sucrose",
      "C": "Protein",
      "D": "Starch"
    },
    "correct": "D",
    "difficulty": 1
  },
  # 0023=C
  {
    "id": "ks3_bio_photo_0023",
    "level": "ks3",
    "subject": "biology",
    "category": "Photosynthesis",
    "text": "What colour does iodine solution turn when starch is present in a leaf?",
    "options": {
      "A": "Red",
      "B": "Green",
      "C": "Blue-black",
      "D": "Yellow"
    },
    "correct": "C",
    "difficulty": 1
  },
  # 0024=A
  {
    "id": "ks3_bio_photo_0024",
    "level": "ks3",
    "subject": "biology",
    "category": "Photosynthesis",
    "text": "A variegated leaf has green and white patches. Which parts can carry out photosynthesis?",
    "options": {
      "A": "Only the green parts, because only they contain chlorophyll",
      "B": "Only the white parts, because they reflect light",
      "C": "Both parts equally",
      "D": "Neither part, because the leaf is not fully green"
    },
    "correct": "A",
    "difficulty": 2
  },
  # 0025=D
  {
    "id": "ks3_bio_photo_0025",
    "level": "ks3",
    "subject": "biology",
    "category": "Photosynthesis",
    "text": "Why do plants need nitrates absorbed from the soil?",
    "options": {
      "A": "To make chlorophyll green",
      "B": "To produce oxygen during photosynthesis",
      "C": "To store energy in starch grains",
      "D": "To make amino acids and proteins needed for growth"
    },
    "correct": "D",
    "difficulty": 2
  },
  # 0026=C
  {
    "id": "ks3_bio_photo_0026",
    "level": "ks3",
    "subject": "biology",
    "category": "Photosynthesis",
    "text": "Which structures on plant roots are specialised to absorb water and mineral ions from the soil?",
    "options": {
      "A": "Guard cells",
      "B": "Stomata",
      "C": "Root hair cells",
      "D": "Palisade cells"
    },
    "correct": "C",
    "difficulty": 1
  },
  # 0027=A
  {
    "id": "ks3_bio_photo_0027",
    "level": "ks3",
    "subject": "biology",
    "category": "Photosynthesis",
    "text": "What is transpiration in plants?",
    "options": {
      "A": "The loss of water vapour from leaves through the stomata",
      "B": "The absorption of carbon dioxide through the roots",
      "C": "The transport of glucose from leaves to roots",
      "D": "The conversion of starch back into glucose"
    },
    "correct": "A",
    "difficulty": 2
  },
  # 0028=D
  {
    "id": "ks3_bio_photo_0028",
    "level": "ks3",
    "subject": "biology",
    "category": "Photosynthesis",
    "text": "Why is the upper epidermis of a leaf transparent?",
    "options": {
      "A": "To prevent water loss from the surface",
      "B": "To allow carbon dioxide to enter the leaf",
      "C": "To stop insects landing on the leaf",
      "D": "To allow light to pass through to the palisade cells below"
    },
    "correct": "D",
    "difficulty": 2
  },
  # 0029=C
  {
    "id": "ks3_bio_photo_0029",
    "level": "ks3",
    "subject": "biology",
    "category": "Photosynthesis",
    "text": "What is the function of the waxy cuticle on the surface of a leaf?",
    "options": {
      "A": "To absorb sunlight for photosynthesis",
      "B": "To allow gas exchange with the air",
      "C": "To prevent excessive water loss from the leaf surface",
      "D": "To transport minerals up the stem"
    },
    "correct": "C",
    "difficulty": 2
  },
  # 0030=A
  {
    "id": "ks3_bio_photo_0030",
    "level": "ks3",
    "subject": "biology",
    "category": "Photosynthesis",
    "text": "Which tissue in a leaf is the main site of photosynthesis?",
    "options": {
      "A": "Mesophyll tissue (palisade and spongy layers)",
      "B": "The waxy cuticle on the upper surface",
      "C": "The lower epidermis containing guard cells",
      "D": "The xylem vessels in the veins"
    },
    "correct": "A",
    "difficulty": 2
  },
  # 0031=D
  {
    "id": "ks3_bio_photo_0031",
    "level": "ks3",
    "subject": "biology",
    "category": "Photosynthesis",
    "text": "What do the veins in a leaf contain that transport substances around the plant?",
    "options": {
      "A": "Guard cells and stomata",
      "B": "Chloroplasts and mesophyll cells",
      "C": "Starch grains and glucose molecules",
      "D": "Xylem to carry water and phloem to carry sugars"
    },
    "correct": "D",
    "difficulty": 2
  },
  # 0032=C
  {
    "id": "ks3_bio_photo_0032",
    "level": "ks3",
    "subject": "biology",
    "category": "Photosynthesis",
    "text": "What happens to guard cells in bright light?",
    "options": {
      "A": "They shrink and close the stomata",
      "B": "They produce starch to store energy",
      "C": "They become turgid and open the stomata",
      "D": "They release carbon dioxide into the air"
    },
    "correct": "C",
    "difficulty": 2
  },
  # 0033=A
  {
    "id": "ks3_bio_photo_0033",
    "level": "ks3",
    "subject": "biology",
    "category": "Photosynthesis",
    "text": "How is glucose transported from the leaves to other parts of the plant?",
    "options": {
      "A": "It is converted to sucrose and transported through the phloem",
      "B": "It moves as starch through the xylem vessels",
      "C": "It diffuses directly through the cell walls of the stem",
      "D": "It is broken down into water and carbon dioxide for transport"
    },
    "correct": "A",
    "difficulty": 2
  },
  # 0034=D
  {
    "id": "ks3_bio_photo_0034",
    "level": "ks3",
    "subject": "biology",
    "category": "Photosynthesis",
    "text": "Plants use glucose and nitrates from the soil to make which biological molecules?",
    "options": {
      "A": "Chlorophyll and water",
      "B": "Starch and cellulose only",
      "C": "Carbon dioxide and oxygen",
      "D": "Amino acids and proteins"
    },
    "correct": "D",
    "difficulty": 2
  },
  # 0035=C
  {
    "id": "ks3_bio_photo_0035",
    "level": "ks3",
    "subject": "biology",
    "category": "Photosynthesis",
    "text": "What is cellulose made from, and what does it do in a plant?",
    "options": {
      "A": "Made from amino acids; it carries water up the stem",
      "B": "Made from starch; it stores energy in the roots",
      "C": "Made from glucose; it forms strong cell walls",
      "D": "Made from carbon dioxide; it absorbs light in leaves"
    },
    "correct": "C",
    "difficulty": 2
  },
  # 0036=A
  {
    "id": "ks3_bio_photo_0036",
    "level": "ks3",
    "subject": "biology",
    "category": "Photosynthesis",
    "text": "Some plants store energy in seeds as oils and fats. Where does the carbon in these fats originally come from?",
    "options": {
      "A": "From carbon dioxide absorbed during photosynthesis",
      "B": "From oxygen released during photosynthesis",
      "C": "From nitrates absorbed through the roots",
      "D": "From water taken up by the root hairs"
    },
    "correct": "A",
    "difficulty": 3
  },
  # 0037=D
  {
    "id": "ks3_bio_photo_0037",
    "level": "ks3",
    "subject": "biology",
    "category": "Photosynthesis",
    "text": "What happens to the rate of photosynthesis as light intensity increases, starting from darkness?",
    "options": {
      "A": "It stays constant regardless of light intensity",
      "B": "It decreases steadily as light intensity increases",
      "C": "It increases for a while then drops sharply to zero",
      "D": "It increases steadily until another factor becomes limiting"
    },
    "correct": "D",
    "difficulty": 2
  },
  # 0038=C
  {
    "id": "ks3_bio_photo_0038",
    "level": "ks3",
    "subject": "biology",
    "category": "Photosynthesis",
    "text": "Increasing carbon dioxide concentration speeds up photosynthesis. What eventually stops the rate from rising further?",
    "options": {
      "A": "The plant runs out of carbon dioxide to absorb",
      "B": "The oxygen produced poisons the chloroplasts",
      "C": "Light intensity or temperature becomes the limiting factor",
      "D": "The stomata permanently close to prevent water loss"
    },
    "correct": "C",
    "difficulty": 3
  },
  # 0039=A
  {
    "id": "ks3_bio_photo_0039",
    "level": "ks3",
    "subject": "biology",
    "category": "Photosynthesis",
    "text": "Photosynthesis is carried out by enzymes. What is the approximate optimum temperature range for these enzymes?",
    "options": {
      "A": "25 to 35 degrees Celsius",
      "B": "0 to 5 degrees Celsius",
      "C": "60 to 70 degrees Celsius",
      "D": "80 to 100 degrees Celsius"
    },
    "correct": "A",
    "difficulty": 2
  },
  # 0040=D
  {
    "id": "ks3_bio_photo_0040",
    "level": "ks3",
    "subject": "biology",
    "category": "Photosynthesis",
    "text": "What happens to the enzymes that control photosynthesis if the temperature rises well above the optimum?",
    "options": {
      "A": "They work faster because there is more thermal energy",
      "B": "They convert to a different enzyme that works at high temperatures",
      "C": "They produce more chlorophyll to compensate",
      "D": "They denature — their shape changes and they stop working"
    },
    "correct": "D",
    "difficulty": 2
  },
  # 0041=C
  {
    "id": "ks3_bio_photo_0041",
    "level": "ks3",
    "subject": "biology",
    "category": "Photosynthesis",
    "text": "Why do farmers sometimes add extra carbon dioxide and artificial lighting inside greenhouses?",
    "options": {
      "A": "To keep insects away from the crops",
      "B": "To lower the temperature inside the greenhouse",
      "C": "To increase the rate of photosynthesis and improve crop yield",
      "D": "To kill bacteria that cause disease in plants"
    },
    "correct": "C",
    "difficulty": 2
  },
  # 0042=A
  {
    "id": "ks3_bio_photo_0042",
    "level": "ks3",
    "subject": "biology",
    "category": "Photosynthesis",
    "text": "How does large-scale deforestation affect the level of carbon dioxide in the atmosphere?",
    "options": {
      "A": "It increases CO2 levels because fewer trees are available to absorb CO2 by photosynthesis",
      "B": "It decreases CO2 levels because burning wood releases oxygen",
      "C": "It has no effect because oceans absorb all the extra CO2",
      "D": "It decreases CO2 levels because the soil absorbs more CO2 without tree roots"
    },
    "correct": "A",
    "difficulty": 2
  },
  # 0043=B  *** THE ONLY B ***
  {
    "id": "ks3_bio_photo_0043",
    "level": "ks3",
    "subject": "biology",
    "category": "Photosynthesis",
    "text": "Which statement correctly describes algae and photosynthesis?",
    "options": {
      "A": "Algae are animals that feed on plants and cannot photosynthesise",
      "B": "Algae are photosynthetic organisms that are important producers in aquatic ecosystems",
      "C": "Algae only photosynthesise in fresh water, not in the sea",
      "D": "Algae photosynthesise using roots to absorb sunlight from the water"
    },
    "correct": "B",
    "difficulty": 2
  },
  # 0044=A
  {
    "id": "ks3_bio_photo_0044",
    "level": "ks3",
    "subject": "biology",
    "category": "Photosynthesis",
    "text": "In a cross-section diagram of a leaf, which layer is found immediately below the upper epidermis?",
    "options": {
      "A": "Palisade mesophyll",
      "B": "Lower epidermis",
      "C": "Spongy mesophyll",
      "D": "Waxy cuticle"
    },
    "correct": "A",
    "difficulty": 2
  },
  # 0045=D
  {
    "id": "ks3_bio_photo_0045",
    "level": "ks3",
    "subject": "biology",
    "category": "Photosynthesis",
    "text": "Why are most leaves broad and flat?",
    "options": {
      "A": "To make it easier for insects to land and pollinate the plant",
      "B": "To reduce the amount of water lost through transpiration",
      "C": "To allow the leaf to bend in the wind and avoid damage",
      "D": "To maximise the surface area exposed to sunlight for photosynthesis"
    },
    "correct": "D",
    "difficulty": 1
  },
  # 0046=D
  {
    "id": "ks3_bio_photo_0046",
    "level": "ks3",
    "subject": "biology",
    "category": "Photosynthesis",
    "text": "Why does the thinness of a leaf help photosynthesis?",
    "options": {
      "A": "It stops the leaf from absorbing too much water",
      "B": "It allows the leaf to float on water",
      "C": "It increases the total mass of chlorophyll in the plant",
      "D": "It reduces the distance that carbon dioxide must diffuse to reach the cells"
    },
    "correct": "D",
    "difficulty": 2
  },
  # 0047=A
  {
    "id": "ks3_bio_photo_0047",
    "level": "ks3",
    "subject": "biology",
    "category": "Photosynthesis",
    "text": "Photosynthesis stores energy in organic molecules. In what form is the energy before it is absorbed by the leaf?",
    "options": {
      "A": "Light energy from the Sun",
      "B": "Electrical energy from the soil",
      "C": "Thermal energy from the air",
      "D": "Chemical energy stored in carbon dioxide"
    },
    "correct": "A",
    "difficulty": 1
  },
  # 0048=D
  {
    "id": "ks3_bio_photo_0048",
    "level": "ks3",
    "subject": "biology",
    "category": "Photosynthesis",
    "text": "What are the two products of photosynthesis?",
    "options": {
      "A": "Carbon dioxide and water",
      "B": "Carbon dioxide and starch",
      "C": "Oxygen and carbon dioxide",
      "D": "Glucose and oxygen"
    },
    "correct": "D",
    "difficulty": 1
  },
  # 0049=C
  {
    "id": "ks3_bio_photo_0049",
    "level": "ks3",
    "subject": "biology",
    "category": "Photosynthesis",
    "text": "Photosynthesis is described as an endothermic reaction. What does this mean?",
    "options": {
      "A": "It releases energy into the surroundings as heat",
      "B": "It only occurs at very high temperatures",
      "C": "It requires an input of energy (from light) to proceed",
      "D": "It produces heat that warms the plant"
    },
    "correct": "C",
    "difficulty": 3
  },
  # 0050=A
  {
    "id": "ks3_bio_photo_0050",
    "level": "ks3",
    "subject": "biology",
    "category": "Photosynthesis",
    "text": "Which statement correctly compares photosynthesis and respiration in terms of gases used and produced?",
    "options": {
      "A": "Photosynthesis takes in CO2 and releases O2; respiration takes in O2 and releases CO2",
      "B": "Both processes take in O2 and release CO2",
      "C": "Photosynthesis takes in O2 and releases CO2; respiration takes in CO2 and releases O2",
      "D": "Both processes take in CO2 and release O2"
    },
    "correct": "A",
    "difficulty": 1
  },
  # 0051=D
  {
    "id": "ks3_bio_photo_0051",
    "level": "ks3",
    "subject": "biology",
    "category": "Photosynthesis",
    "text": "A student places a plant in bright sunlight and measures the gas it releases. Which gas would she detect being released?",
    "options": {
      "A": "Carbon dioxide, because respiration is always faster than photosynthesis",
      "B": "Nitrogen, because leaves absorb nitrogen from the air",
      "C": "Water vapour only, because photosynthesis does not release gases",
      "D": "Oxygen, because photosynthesis in bright light produces more oxygen than respiration uses"
    },
    "correct": "D",
    "difficulty": 2
  },
  # 0052=A
  {
    "id": "ks3_bio_photo_0052",
    "level": "ks3",
    "subject": "biology",
    "category": "Photosynthesis",
    "text": "Before testing a leaf for starch, a student boils it in ethanol. What does this step achieve?",
    "options": {
      "A": "It removes the green chlorophyll colour so the iodine colour change can be seen clearly",
      "B": "It adds iodine to the leaf to test for starch",
      "C": "It kills any bacteria on the leaf surface",
      "D": "It converts starch into glucose so it can be detected"
    },
    "correct": "A",
    "difficulty": 2
  },
  # 0053=D
  {
    "id": "ks3_bio_photo_0053",
    "level": "ks3",
    "subject": "biology",
    "category": "Photosynthesis",
    "text": "A student tests the white part of a variegated leaf with iodine after exposing it to light. What result would she get?",
    "options": {
      "A": "Blue-black colour, showing starch was made by photosynthesis",
      "B": "Red colour, showing glucose is present",
      "C": "Green colour, because chlorophyll reacts with iodine",
      "D": "Yellow-brown colour, showing no starch because there is no chlorophyll to photosynthesise"
    },
    "correct": "D",
    "difficulty": 2
  },
  # 0054=C
  {
    "id": "ks3_bio_photo_0054",
    "level": "ks3",
    "subject": "biology",
    "category": "Photosynthesis",
    "text": "Where exactly in a plant cell is starch stored?",
    "options": {
      "A": "In the nucleus and cell membrane",
      "B": "In the mitochondria and vacuole only",
      "C": "In chloroplasts and starch grains within the cell",
      "D": "In the cell wall and cytoplasm only"
    },
    "correct": "C",
    "difficulty": 3
  },
  # 0055=A
  {
    "id": "ks3_bio_photo_0055",
    "level": "ks3",
    "subject": "biology",
    "category": "Photosynthesis",
    "text": "Guard cells open and close the stomata. What causes them to close at night?",
    "options": {
      "A": "Without light, photosynthesis stops, guard cells lose water and become flaccid, closing the stomata",
      "B": "Lower temperatures at night cause the guard cells to expand and block the stomata",
      "C": "Increased CO2 at night causes guard cells to swell and seal the stomata shut",
      "D": "Guard cells absorb water at night which forces the stomata shut"
    },
    "correct": "A",
    "difficulty": 3
  },
  # 0056=D
  {
    "id": "ks3_bio_photo_0056",
    "level": "ks3",
    "subject": "biology",
    "category": "Photosynthesis",
    "text": "A plant kept at 5 degrees Celsius shows very slow photosynthesis even in bright light. Why?",
    "options": {
      "A": "Cold temperatures cause the stomata to fully open, letting CO2 escape",
      "B": "Light cannot reach chloroplasts when it is cold",
      "C": "Cold temperatures increase the rate at which enzymes denature",
      "D": "Low temperature slows enzyme activity, reducing the rate of the reactions"
    },
    "correct": "D",
    "difficulty": 2
  },
  # 0057=D
  {
    "id": "ks3_bio_photo_0057",
    "level": "ks3",
    "subject": "biology",
    "category": "Photosynthesis",
    "text": "Which tube in a leaf vein carries water from the roots up to the leaf?",
    "options": {
      "A": "Phloem",
      "B": "Stomata",
      "C": "Guard cells",
      "D": "Xylem"
    },
    "correct": "D",
    "difficulty": 1
  },
  # 0058=A
  {
    "id": "ks3_bio_photo_0058",
    "level": "ks3",
    "subject": "biology",
    "category": "Photosynthesis",
    "text": "Why are palisade cells packed with many chloroplasts?",
    "options": {
      "A": "To absorb as much light as possible for photosynthesis",
      "B": "To store large amounts of starch for the plant",
      "C": "To produce carbon dioxide needed for respiration",
      "D": "To anchor the leaf to the stem"
    },
    "correct": "A",
    "difficulty": 1
  },
  # 0059=D
  {
    "id": "ks3_bio_photo_0059",
    "level": "ks3",
    "subject": "biology",
    "category": "Photosynthesis",
    "text": "A gardener wants to increase the yield of tomato plants in a greenhouse. Which combination of conditions would be most effective?",
    "options": {
      "A": "Very high temperature, low light, and low CO2",
      "B": "Very low temperature, high light, and high CO2",
      "C": "High temperature, low light, and high CO2",
      "D": "Optimal temperature (around 25-30 C), high light intensity, and increased CO2"
    },
    "correct": "D",
    "difficulty": 3
  },
  # 0060=A
  {
    "id": "ks3_bio_photo_0060",
    "level": "ks3",
    "subject": "biology",
    "category": "Photosynthesis",
    "text": "Which statement best describes what photosynthesis achieves for a plant overall?",
    "options": {
      "A": "It converts light energy into chemical energy stored in glucose, which the plant can use for all its life processes",
      "B": "It converts glucose into light energy that the plant releases into the environment",
      "C": "It breaks down glucose into carbon dioxide and water, releasing energy",
      "D": "It absorbs oxygen from the air and uses it to produce carbon dioxide for the soil"
    },
    "correct": "A",
    "difficulty": 1
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
    assert dist == {'A':15,'B':1,'C':9,'D':15}, f"Distribution wrong: {dict(dist)}"
    combined = existing + NEW_Q
    save_json(json_path, combined)
    update_js(js_path, NEW_Q)
    print(f"backend: {len(existing)} -> {len(combined)} | JS updated")

if __name__ == '__main__':
    main()
