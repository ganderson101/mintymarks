#!/usr/bin/env python3
"""MIN-98 wave 2: KS3 Biology - Nutrition & digestion (40 new, 0021-0060)
Target dist: A=15 B=7 C=3 D=15
"""
import json, sys
from collections import Counter

NEW_Q = [
  # 0021 = A
  {
    "id": "ks3_bio_nutr_0021",
    "level": "ks3",
    "subject": "biology",
    "category": "Nutrition & digestion",
    "text": "Which macronutrient provides the most energy per gram?",
    "options": {
      "A": "Fats (lipids)",
      "B": "Carbohydrates",
      "C": "Proteins",
      "D": "Vitamins"
    },
    "correct": "A",
    "difficulty": 2
  },
  # 0022 = D
  {
    "id": "ks3_bio_nutr_0022",
    "level": "ks3",
    "subject": "biology",
    "category": "Nutrition & digestion",
    "text": "Which part of the digestive system is mainly responsible for absorbing water from undigested food?",
    "options": {
      "A": "Small intestine",
      "B": "Stomach",
      "C": "Oesophagus",
      "D": "Large intestine"
    },
    "correct": "D",
    "difficulty": 1
  },
  # 0023 = B
  {
    "id": "ks3_bio_nutr_0023",
    "level": "ks3",
    "subject": "biology",
    "category": "Nutrition & digestion",
    "text": "What is the main role of carbohydrates in the diet?",
    "options": {
      "A": "Building and repairing body tissues",
      "B": "Providing the body with energy",
      "C": "Transporting oxygen in the blood",
      "D": "Making hormones and enzymes"
    },
    "correct": "B",
    "difficulty": 1
  },
  # 0024 = A
  {
    "id": "ks3_bio_nutr_0024",
    "level": "ks3",
    "subject": "biology",
    "category": "Nutrition & digestion",
    "text": "What is the main role of protein in the diet?",
    "options": {
      "A": "Growth and repair of body tissues",
      "B": "Providing a quick source of energy",
      "C": "Insulating the body against cold",
      "D": "Absorbing fat-soluble vitamins"
    },
    "correct": "A",
    "difficulty": 1
  },
  # 0025 = D
  {
    "id": "ks3_bio_nutr_0025",
    "level": "ks3",
    "subject": "biology",
    "category": "Nutrition & digestion",
    "text": "Which vitamin is needed for the body to absorb calcium and maintain healthy bones?",
    "options": {
      "A": "Vitamin A",
      "B": "Vitamin B12",
      "C": "Vitamin C",
      "D": "Vitamin D"
    },
    "correct": "D",
    "difficulty": 2
  },
  # 0026 = C
  {
    "id": "ks3_bio_nutr_0026",
    "level": "ks3",
    "subject": "biology",
    "category": "Nutrition & digestion",
    "text": "A lack of which vitamin leads to night blindness?",
    "options": {
      "A": "Vitamin C",
      "B": "Vitamin D",
      "C": "Vitamin A",
      "D": "Vitamin B12"
    },
    "correct": "C",
    "difficulty": 2
  },
  # 0027 = A
  {
    "id": "ks3_bio_nutr_0027",
    "level": "ks3",
    "subject": "biology",
    "category": "Nutrition & digestion",
    "text": "Which vitamin is needed for the production of red blood cells?",
    "options": {
      "A": "Vitamin B12",
      "B": "Vitamin A",
      "C": "Vitamin C",
      "D": "Vitamin D"
    },
    "correct": "A",
    "difficulty": 2
  },
  # 0028 = D
  {
    "id": "ks3_bio_nutr_0028",
    "level": "ks3",
    "subject": "biology",
    "category": "Nutrition & digestion",
    "text": "Which mineral is important for the healthy functioning of nerves and muscles?",
    "options": {
      "A": "Calcium",
      "B": "Iron",
      "C": "Fluoride",
      "D": "Potassium"
    },
    "correct": "D",
    "difficulty": 2
  },
  # 0029 = B
  {
    "id": "ks3_bio_nutr_0029",
    "level": "ks3",
    "subject": "biology",
    "category": "Nutrition & digestion",
    "text": "Which mineral helps to protect tooth enamel and prevent tooth decay?",
    "options": {
      "A": "Iron",
      "B": "Fluoride",
      "C": "Potassium",
      "D": "Calcium"
    },
    "correct": "B",
    "difficulty": 2
  },
  # 0030 = A
  {
    "id": "ks3_bio_nutr_0030",
    "level": "ks3",
    "subject": "biology",
    "category": "Nutrition & digestion",
    "text": "Which of the following is a health risk associated with obesity?",
    "options": {
      "A": "Type 2 diabetes and heart disease",
      "B": "Rickets and weak bones",
      "C": "Night blindness and dry skin",
      "D": "Scurvy and bleeding gums"
    },
    "correct": "A",
    "difficulty": 2
  },
  # 0031 = D
  {
    "id": "ks3_bio_nutr_0031",
    "level": "ks3",
    "subject": "biology",
    "category": "Nutrition & digestion",
    "text": "Kwashiorkor is a form of malnutrition caused by a severe lack of which nutrient?",
    "options": {
      "A": "Carbohydrate",
      "B": "Fat",
      "C": "Vitamin C",
      "D": "Protein"
    },
    "correct": "D",
    "difficulty": 3
  },
  # 0032 = C
  {
    "id": "ks3_bio_nutr_0032",
    "level": "ks3",
    "subject": "biology",
    "category": "Nutrition & digestion",
    "text": "Which organ in the body produces the hormone insulin?",
    "options": {
      "A": "Liver",
      "B": "Stomach",
      "C": "Pancreas",
      "D": "Kidney"
    },
    "correct": "C",
    "difficulty": 2
  },
  # 0033 = A
  {
    "id": "ks3_bio_nutr_0033",
    "level": "ks3",
    "subject": "biology",
    "category": "Nutrition & digestion",
    "text": "Which glands in the mouth produce saliva containing the enzyme amylase?",
    "options": {
      "A": "Salivary glands",
      "B": "Gastric glands",
      "C": "Lacteals",
      "D": "Lymph glands"
    },
    "correct": "A",
    "difficulty": 1
  },
  # 0034 = D
  {
    "id": "ks3_bio_nutr_0034",
    "level": "ks3",
    "subject": "biology",
    "category": "Nutrition & digestion",
    "text": "What is the tube that carries food from the mouth to the stomach called?",
    "options": {
      "A": "Trachea",
      "B": "Duodenum",
      "C": "Ileum",
      "D": "Oesophagus"
    },
    "correct": "D",
    "difficulty": 1
  },
  # 0035 = B
  {
    "id": "ks3_bio_nutr_0035",
    "level": "ks3",
    "subject": "biology",
    "category": "Nutrition & digestion",
    "text": "What is the role of hydrochloric acid in the stomach?",
    "options": {
      "A": "It neutralises food and makes it alkaline",
      "B": "It kills bacteria and creates the acidic pH needed for pepsin to work",
      "C": "It emulsifies fats into smaller droplets",
      "D": "It absorbs glucose into the bloodstream"
    },
    "correct": "B",
    "difficulty": 2
  },
  # 0036 = A
  {
    "id": "ks3_bio_nutr_0036",
    "level": "ks3",
    "subject": "biology",
    "category": "Nutrition & digestion",
    "text": "Which section of the small intestine receives bile from the liver and digestive juice from the pancreas?",
    "options": {
      "A": "Duodenum",
      "B": "Ileum",
      "C": "Jejunum",
      "D": "Colon"
    },
    "correct": "A",
    "difficulty": 3
  },
  # 0037 = D
  {
    "id": "ks3_bio_nutr_0037",
    "level": "ks3",
    "subject": "biology",
    "category": "Nutrition & digestion",
    "text": "Glucose produced by digestion is absorbed through the wall of the small intestine directly into what?",
    "options": {
      "A": "The lymph vessels",
      "B": "The large intestine",
      "C": "The stomach lining",
      "D": "The bloodstream"
    },
    "correct": "D",
    "difficulty": 2
  },
  # 0038 = D
  {
    "id": "ks3_bio_nutr_0038",
    "level": "ks3",
    "subject": "biology",
    "category": "Nutrition & digestion",
    "text": "Fatty acids and glycerol are absorbed in the small intestine into which structures inside the villi?",
    "options": {
      "A": "Capillaries",
      "B": "Veins",
      "C": "Arteries",
      "D": "Lacteals (lymph vessels)"
    },
    "correct": "D",
    "difficulty": 3
  },
  # 0039 = A
  {
    "id": "ks3_bio_nutr_0039",
    "level": "ks3",
    "subject": "biology",
    "category": "Nutrition & digestion",
    "text": "After glucose is absorbed into the blood, where can it be stored as glycogen for later use?",
    "options": {
      "A": "The liver",
      "B": "The kidneys",
      "C": "The lungs",
      "D": "The stomach"
    },
    "correct": "A",
    "difficulty": 2
  },
  # 0040 = D
  {
    "id": "ks3_bio_nutr_0040",
    "level": "ks3",
    "subject": "biology",
    "category": "Nutrition & digestion",
    "text": "Where is faeces stored before it is eliminated from the body?",
    "options": {
      "A": "Colon",
      "B": "Duodenum",
      "C": "Appendix",
      "D": "Rectum"
    },
    "correct": "D",
    "difficulty": 1
  },
  # 0041 = B
  {
    "id": "ks3_bio_nutr_0041",
    "level": "ks3",
    "subject": "biology",
    "category": "Nutrition & digestion",
    "text": "Which opening in the body is the final exit point for faeces?",
    "options": {
      "A": "Rectum",
      "B": "Anus",
      "C": "Colon",
      "D": "Urethra"
    },
    "correct": "B",
    "difficulty": 1
  },
  # 0042 = A
  {
    "id": "ks3_bio_nutr_0042",
    "level": "ks3",
    "subject": "biology",
    "category": "Nutrition & digestion",
    "text": "An enzyme has an active site that fits only one specific substrate. This is best described as which model?",
    "options": {
      "A": "The lock and key model",
      "B": "The fluid mosaic model",
      "C": "The double helix model",
      "D": "The sliding filament model"
    },
    "correct": "A",
    "difficulty": 2
  },
  # 0043 = D
  {
    "id": "ks3_bio_nutr_0043",
    "level": "ks3",
    "subject": "biology",
    "category": "Nutrition & digestion",
    "text": "What happens to an enzyme if the pH moves far away from its optimum?",
    "options": {
      "A": "It speeds up and works more efficiently",
      "B": "It changes colour but keeps working",
      "C": "It breaks down its substrate faster",
      "D": "Its active site changes shape and it becomes denatured"
    },
    "correct": "D",
    "difficulty": 2
  },
  # 0044 = C
  {
    "id": "ks3_bio_nutr_0044",
    "level": "ks3",
    "subject": "biology",
    "category": "Nutrition & digestion",
    "text": "At approximately what pH does salivary amylase in the mouth work best?",
    "options": {
      "A": "pH 2 (strongly acidic)",
      "B": "pH 4 (mildly acidic)",
      "C": "pH 7 (neutral)",
      "D": "pH 12 (strongly alkaline)"
    },
    "correct": "C",
    "difficulty": 2
  },
  # 0045 = A
  {
    "id": "ks3_bio_nutr_0045",
    "level": "ks3",
    "subject": "biology",
    "category": "Nutrition & digestion",
    "text": "Why does stomach acid create a low pH environment?",
    "options": {
      "A": "So that the enzyme pepsin can work at its optimum pH",
      "B": "To emulsify fats into tiny droplets",
      "C": "To absorb minerals through the stomach wall",
      "D": "To neutralise alkaline food from the mouth"
    },
    "correct": "A",
    "difficulty": 2
  },
  # 0046 = D
  {
    "id": "ks3_bio_nutr_0046",
    "level": "ks3",
    "subject": "biology",
    "category": "Nutrition & digestion",
    "text": "Bile is described as not being an enzyme. What does bile actually do to fats?",
    "options": {
      "A": "Breaks fat molecules apart chemically",
      "B": "Converts fats into fatty acids directly",
      "C": "Neutralises fats so they can be excreted",
      "D": "Emulsifies fats into tiny droplets, increasing the surface area for lipase"
    },
    "correct": "D",
    "difficulty": 2
  },
  # 0047 = A
  {
    "id": "ks3_bio_nutr_0047",
    "level": "ks3",
    "subject": "biology",
    "category": "Nutrition & digestion",
    "text": "The biuret test is used to detect protein. What colour change indicates a positive result?",
    "options": {
      "A": "Blue/purple (violet)",
      "B": "Brick red",
      "C": "Orange/yellow",
      "D": "Blue-black"
    },
    "correct": "A",
    "difficulty": 2
  },
  # 0048 = B
  {
    "id": "ks3_bio_nutr_0048",
    "level": "ks3",
    "subject": "biology",
    "category": "Nutrition & digestion",
    "text": "An athlete training heavily would need more of which nutrient compared to a sedentary person?",
    "options": {
      "A": "Vitamin A",
      "B": "Carbohydrates and protein",
      "C": "Fluoride",
      "D": "Vitamin C only"
    },
    "correct": "B",
    "difficulty": 2
  },
  # 0049 = D
  {
    "id": "ks3_bio_nutr_0049",
    "level": "ks3",
    "subject": "biology",
    "category": "Nutrition & digestion",
    "text": "Marasmus is a severe form of malnutrition in children. What causes it?",
    "options": {
      "A": "Too much protein in the diet",
      "B": "A lack of Vitamin D alone",
      "C": "Eating too many fats and sugars",
      "D": "A severe lack of overall food energy (calories)"
    },
    "correct": "D",
    "difficulty": 3
  },
  # 0050 = A
  {
    "id": "ks3_bio_nutr_0050",
    "level": "ks3",
    "subject": "biology",
    "category": "Nutrition & digestion",
    "text": "Anorexia is an eating disorder in which a person severely restricts food intake. Which of the following is a consequence?",
    "options": {
      "A": "Dangerously low body weight, weak muscles, and nutrient deficiencies",
      "B": "High blood pressure and obesity",
      "C": "Excess fat stored in the liver",
      "D": "Overproduction of insulin"
    },
    "correct": "A",
    "difficulty": 2
  },
  # 0051 = D
  {
    "id": "ks3_bio_nutr_0051",
    "level": "ks3",
    "subject": "biology",
    "category": "Nutrition & digestion",
    "text": "The liver stores energy. In what form does the liver store glucose?",
    "options": {
      "A": "Starch",
      "B": "Cellulose",
      "C": "Sucrose",
      "D": "Glycogen"
    },
    "correct": "D",
    "difficulty": 2
  },
  # 0052 = B
  {
    "id": "ks3_bio_nutr_0052",
    "level": "ks3",
    "subject": "biology",
    "category": "Nutrition & digestion",
    "text": "Which statement correctly describes what happens to absorbed glucose in the body?",
    "options": {
      "A": "It is immediately converted into fat and stored permanently",
      "B": "It is used in cellular respiration to release energy, or stored as glycogen",
      "C": "It passes out of the body unchanged in urine",
      "D": "It is converted into amino acids for building proteins"
    },
    "correct": "B",
    "difficulty": 2
  },
  # 0053 = A
  {
    "id": "ks3_bio_nutr_0053",
    "level": "ks3",
    "subject": "biology",
    "category": "Nutrition & digestion",
    "text": "Which part of the digestive system produces pancreatic juice containing enzymes that digest carbohydrates, proteins, and fats?",
    "options": {
      "A": "Pancreas",
      "B": "Liver",
      "C": "Stomach",
      "D": "Gallbladder"
    },
    "correct": "A",
    "difficulty": 2
  },
  # 0054 = D
  {
    "id": "ks3_bio_nutr_0054",
    "level": "ks3",
    "subject": "biology",
    "category": "Nutrition & digestion",
    "text": "Which of the following best explains why the villi in the small intestine are covered in tiny projections called microvilli?",
    "options": {
      "A": "They produce bile to emulsify fats",
      "B": "They secrete hydrochloric acid",
      "C": "They store glycogen for energy",
      "D": "They massively increase the surface area for absorption of nutrients"
    },
    "correct": "D",
    "difficulty": 2
  },
  # 0055 = A
  {
    "id": "ks3_bio_nutr_0055",
    "level": "ks3",
    "subject": "biology",
    "category": "Nutrition & digestion",
    "text": "A sedentary (inactive) person needs fewer calories than an athlete. Which of the following best explains why?",
    "options": {
      "A": "A sedentary person uses less energy because their muscles are less active",
      "B": "A sedentary person digests food more slowly",
      "C": "A sedentary person has fewer villi in the small intestine",
      "D": "A sedentary person produces more insulin"
    },
    "correct": "A",
    "difficulty": 1
  },
  # 0056 = B
  {
    "id": "ks3_bio_nutr_0056",
    "level": "ks3",
    "subject": "biology",
    "category": "Nutrition & digestion",
    "text": "The enzyme amylase breaks starch down into sugars. Where in the body is amylase produced? (Choose the best answer.)",
    "options": {
      "A": "Stomach and rectum",
      "B": "Salivary glands and pancreas",
      "C": "Liver and gallbladder",
      "D": "Small intestine villi only"
    },
    "correct": "B",
    "difficulty": 2
  },
  # 0057 = D
  {
    "id": "ks3_bio_nutr_0057",
    "level": "ks3",
    "subject": "biology",
    "category": "Nutrition & digestion",
    "text": "What is the correct definition of digestion?",
    "options": {
      "A": "The process by which the body makes glucose from sunlight",
      "B": "The transport of nutrients through the bloodstream",
      "C": "The storage of glycogen in the liver",
      "D": "The breakdown of large food molecules into small, soluble molecules that can be absorbed"
    },
    "correct": "D",
    "difficulty": 1
  },
  # 0058 = A
  {
    "id": "ks3_bio_nutr_0058",
    "level": "ks3",
    "subject": "biology",
    "category": "Nutrition & digestion",
    "text": "Which of the following statements about bile is correct?",
    "options": {
      "A": "Bile is produced in the liver and stored in the gallbladder before being released into the duodenum",
      "B": "Bile is an enzyme produced by the pancreas",
      "C": "Bile is produced in the stomach to digest proteins",
      "D": "Bile is a hormone released by the small intestine"
    },
    "correct": "A",
    "difficulty": 2
  },
  # 0059 = D
  {
    "id": "ks3_bio_nutr_0059",
    "level": "ks3",
    "subject": "biology",
    "category": "Nutrition & digestion",
    "text": "Which of the following describes a long-term health effect of eating a diet with too much saturated fat and sugar?",
    "options": {
      "A": "Kwashiorkor due to protein deficiency",
      "B": "Rickets due to lack of Vitamin D",
      "C": "Night blindness due to lack of Vitamin A",
      "D": "Increased risk of obesity and cardiovascular disease"
    },
    "correct": "D",
    "difficulty": 2
  },
  # 0060 = A
  {
    "id": "ks3_bio_nutr_0060",
    "level": "ks3",
    "subject": "biology",
    "category": "Nutrition & digestion",
    "text": "Which of these correctly describes physical (mechanical) digestion?",
    "options": {
      "A": "Chewing food in the mouth and churning in the stomach to break food into smaller pieces without changing its chemistry",
      "B": "Enzymes chemically breaking large molecules into small soluble ones",
      "C": "Bile chemically splitting fat molecules apart",
      "D": "Glucose being absorbed through the wall of the small intestine"
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
    assert dist == {'A':15,'B':7,'C':3,'D':15}, f"Distribution wrong: {dict(dist)}"
    combined = existing + NEW_Q
    save_json(json_path, combined)
    update_js(js_path, NEW_Q)
    print(f"backend: {len(existing)} -> {len(combined)} | JS updated")

if __name__ == '__main__':
    main()
