#!/usr/bin/env python3
"""MIN-98 wave 2: KS3 Biology - Genes, inheritance & variation (40 new, 0021-0060)
Target dist: A=11 B=7 C=7 D=15
"""
import json, sys
from collections import Counter

NEW_Q = [
  # 0021 correct=A
  {
    "id": "ks3_bio_genes_0021",
    "level": "ks3",
    "subject": "biology",
    "category": "Genes, inheritance & variation",
    "text": "How many chromosomes are found in a normal human body cell?",
    "options": {
      "A": "46",
      "B": "23",
      "C": "48",
      "D": "92"
    },
    "correct": "A",
    "difficulty": 1
  },
  # 0022 correct=D
  {
    "id": "ks3_bio_genes_0022",
    "level": "ks3",
    "subject": "biology",
    "category": "Genes, inheritance & variation",
    "text": "How many chromosomes are found in a human egg or sperm cell?",
    "options": {
      "A": "46",
      "B": "92",
      "C": "48",
      "D": "23"
    },
    "correct": "D",
    "difficulty": 1
  },
  # 0023 correct=C
  {
    "id": "ks3_bio_genes_0023",
    "level": "ks3",
    "subject": "biology",
    "category": "Genes, inheritance & variation",
    "text": "What shape is the DNA molecule?",
    "options": {
      "A": "Single straight strand",
      "B": "Triple helix",
      "C": "Double helix",
      "D": "Circular loop"
    },
    "correct": "C",
    "difficulty": 1
  },
  # 0024 correct=B
  {
    "id": "ks3_bio_genes_0024",
    "level": "ks3",
    "subject": "biology",
    "category": "Genes, inheritance & variation",
    "text": "Genes are sections of DNA that code for what?",
    "options": {
      "A": "Carbohydrates",
      "B": "Proteins",
      "C": "Lipids",
      "D": "Vitamins"
    },
    "correct": "B",
    "difficulty": 1
  },
  # 0025 correct=A
  {
    "id": "ks3_bio_genes_0025",
    "level": "ks3",
    "subject": "biology",
    "category": "Genes, inheritance & variation",
    "text": "Approximately how many genes does each human chromosome contain?",
    "options": {
      "A": "Thousands",
      "B": "Fewer than ten",
      "C": "Exactly one",
      "D": "Millions"
    },
    "correct": "A",
    "difficulty": 2
  },
  # 0026 correct=D
  {
    "id": "ks3_bio_genes_0026",
    "level": "ks3",
    "subject": "biology",
    "category": "Genes, inheritance & variation",
    "text": "Which of the following is an example of inherited variation?",
    "options": {
      "A": "A scar from a childhood accident",
      "B": "The language a person speaks",
      "C": "A suntan from spending time outdoors",
      "D": "Blood group"
    },
    "correct": "D",
    "difficulty": 1
  },
  # 0027 correct=C
  {
    "id": "ks3_bio_genes_0027",
    "level": "ks3",
    "subject": "biology",
    "category": "Genes, inheritance & variation",
    "text": "Which of the following is an example of environmental variation?",
    "options": {
      "A": "Eye colour",
      "B": "Blood group",
      "C": "A scar from a cut",
      "D": "Natural hair colour"
    },
    "correct": "C",
    "difficulty": 1
  },
  # 0028 correct=B
  {
    "id": "ks3_bio_genes_0028",
    "level": "ks3",
    "subject": "biology",
    "category": "Genes, inheritance & variation",
    "text": "A range of heights from 140 cm to 200 cm in a population is an example of which type of variation?",
    "options": {
      "A": "Discontinuous variation",
      "B": "Continuous variation",
      "C": "Environmental variation only",
      "D": "Inherited variation only"
    },
    "correct": "B",
    "difficulty": 2
  },
  # 0029 correct=A
  {
    "id": "ks3_bio_genes_0029",
    "level": "ks3",
    "subject": "biology",
    "category": "Genes, inheritance & variation",
    "text": "Which chromosomes determine that a baby will be male?",
    "options": {
      "A": "XY",
      "B": "XX",
      "C": "YY",
      "D": "XO"
    },
    "correct": "A",
    "difficulty": 1
  },
  # 0030 correct=D
  {
    "id": "ks3_bio_genes_0030",
    "level": "ks3",
    "subject": "biology",
    "category": "Genes, inheritance & variation",
    "text": "Which chromosomes determine that a baby will be female?",
    "options": {
      "A": "XY",
      "B": "YY",
      "C": "XO",
      "D": "XX"
    },
    "correct": "D",
    "difficulty": 1
  },
  # 0031 correct=C
  {
    "id": "ks3_bio_genes_0031",
    "level": "ks3",
    "subject": "biology",
    "category": "Genes, inheritance & variation",
    "text": "When an egg and a sperm join during fertilisation, how many chromosomes does the resulting cell contain?",
    "options": {
      "A": "23",
      "B": "92",
      "C": "46",
      "D": "48"
    },
    "correct": "C",
    "difficulty": 1
  },
  # 0032 correct=D
  {
    "id": "ks3_bio_genes_0032",
    "level": "ks3",
    "subject": "biology",
    "category": "Genes, inheritance & variation",
    "text": "Which scientist is famous for carrying out pea plant experiments that helped us understand inheritance?",
    "options": {
      "A": "Charles Darwin",
      "B": "Louis Pasteur",
      "C": "Isaac Newton",
      "D": "Gregor Mendel"
    },
    "correct": "D",
    "difficulty": 2
  },
  # 0033 correct=A
  {
    "id": "ks3_bio_genes_0033",
    "level": "ks3",
    "subject": "biology",
    "category": "Genes, inheritance & variation",
    "text": "Why do identical twins have the same DNA?",
    "options": {
      "A": "They developed from the same fertilised egg that split into two",
      "B": "They were born at the same time",
      "C": "They share the same mother",
      "D": "They have the same phenotype"
    },
    "correct": "A",
    "difficulty": 2
  },
  # 0034 correct=B
  {
    "id": "ks3_bio_genes_0034",
    "level": "ks3",
    "subject": "biology",
    "category": "Genes, inheritance & variation",
    "text": "Why can siblings from the same parents look different from each other?",
    "options": {
      "A": "Siblings always have different parents",
      "B": "Sexual reproduction shuffles alleles so each child inherits a different combination",
      "C": "Mutations always occur during pregnancy",
      "D": "Environmental factors change a child's DNA"
    },
    "correct": "B",
    "difficulty": 2
  },
  # 0035 correct=D
  {
    "id": "ks3_bio_genes_0035",
    "level": "ks3",
    "subject": "biology",
    "category": "Genes, inheritance & variation",
    "text": "Sickle cell anaemia is caused by which type of allele?",
    "options": {
      "A": "A dominant allele",
      "B": "A co-dominant allele only",
      "C": "An X-linked dominant allele",
      "D": "A recessive allele"
    },
    "correct": "D",
    "difficulty": 2
  },
  # 0036 correct=C
  {
    "id": "ks3_bio_genes_0036",
    "level": "ks3",
    "subject": "biology",
    "category": "Genes, inheritance & variation",
    "text": "Dolly the sheep was cloned from an adult sheep cell. What does this mean about Dolly?",
    "options": {
      "A": "She was bred by crossing two different sheep breeds",
      "B": "Her DNA was changed using genetic engineering techniques",
      "C": "She was genetically identical to the adult sheep that donated the cell",
      "D": "She was the result of selective breeding over many generations"
    },
    "correct": "C",
    "difficulty": 1
  },
  # 0037 correct=A
  {
    "id": "ks3_bio_genes_0037",
    "level": "ks3",
    "subject": "biology",
    "category": "Genes, inheritance & variation",
    "text": "Which of the following is the best example of selective breeding in action?",
    "options": {
      "A": "Choosing the highest-milk-producing cows to breed together to improve milk yield",
      "B": "Releasing captive-bred animals into the wild to increase their numbers",
      "C": "Cloning the best individual in a herd to produce identical copies",
      "D": "Inserting a human gene into a bacterium to produce insulin"
    },
    "correct": "A",
    "difficulty": 1
  },
  # 0038 correct=D
  {
    "id": "ks3_bio_genes_0038",
    "level": "ks3",
    "subject": "biology",
    "category": "Genes, inheritance & variation",
    "text": "In natural selection, which individuals are most likely to survive and reproduce?",
    "options": {
      "A": "The largest individuals",
      "B": "The oldest individuals",
      "C": "Those that reproduce the fastest regardless of environment",
      "D": "Those best adapted to their environment"
    },
    "correct": "D",
    "difficulty": 1
  },
  # 0039 correct=C
  {
    "id": "ks3_bio_genes_0039",
    "level": "ks3",
    "subject": "biology",
    "category": "Genes, inheritance & variation",
    "text": "What can fossils tell us?",
    "options": {
      "A": "The exact DNA sequence of extinct organisms",
      "B": "How organisms will evolve in the future",
      "C": "Evidence for how organisms have changed over time",
      "D": "Which alleles were dominant millions of years ago"
    },
    "correct": "C",
    "difficulty": 2
  },
  # 0040 correct=B
  {
    "id": "ks3_bio_genes_0040",
    "level": "ks3",
    "subject": "biology",
    "category": "Genes, inheritance & variation",
    "text": "Over how many generations does evolution normally occur?",
    "options": {
      "A": "One or two generations",
      "B": "Many generations over a very long time",
      "C": "Within a single organism's lifetime",
      "D": "Exactly one hundred generations"
    },
    "correct": "B",
    "difficulty": 1
  },
  # 0041 correct=A
  {
    "id": "ks3_bio_genes_0041",
    "level": "ks3",
    "subject": "biology",
    "category": "Genes, inheritance & variation",
    "text": "Which scientist proposed the theory of evolution by natural selection?",
    "options": {
      "A": "Charles Darwin",
      "B": "Gregor Mendel",
      "C": "Louis Pasteur",
      "D": "Jean-Baptiste Lamarck"
    },
    "correct": "A",
    "difficulty": 1
  },
  # 0042 correct=D
  {
    "id": "ks3_bio_genes_0042",
    "level": "ks3",
    "subject": "biology",
    "category": "Genes, inheritance & variation",
    "text": "Lamarck suggested that giraffes developed longer necks because they stretched them during their lifetime and passed this on. What does Darwin's theory say instead?",
    "options": {
      "A": "Giraffes chose to grow longer necks",
      "B": "All giraffes were born with the same neck length",
      "C": "Lamarck was correct and Darwin agreed with him",
      "D": "Giraffes with naturally longer necks survived better and passed on their genes"
    },
    "correct": "D",
    "difficulty": 3
  },
  # 0043 correct=C
  {
    "id": "ks3_bio_genes_0043",
    "level": "ks3",
    "subject": "biology",
    "category": "Genes, inheritance & variation",
    "text": "In the binomial naming system, what do the two parts of a species name represent?",
    "options": {
      "A": "Kingdom and phylum",
      "B": "Family and species",
      "C": "Genus and species",
      "D": "Order and class"
    },
    "correct": "C",
    "difficulty": 2
  },
  # 0044 correct=D
  {
    "id": "ks3_bio_genes_0044",
    "level": "ks3",
    "subject": "biology",
    "category": "Genes, inheritance & variation",
    "text": "Which of the following is a vertebrate?",
    "options": {
      "A": "Earthworm",
      "B": "Spider",
      "C": "Beetle",
      "D": "Salmon"
    },
    "correct": "D",
    "difficulty": 1
  },
  # 0045 correct=A
  {
    "id": "ks3_bio_genes_0045",
    "level": "ks3",
    "subject": "biology",
    "category": "Genes, inheritance & variation",
    "text": "A plant grown in deep shade is shorter and has larger leaves than the same type of plant grown in full sunlight. What type of variation is this?",
    "options": {
      "A": "Environmental variation",
      "B": "Genetic variation",
      "C": "Inherited variation",
      "D": "Discontinuous variation"
    },
    "correct": "A",
    "difficulty": 2
  },
  # 0046 correct=B
  {
    "id": "ks3_bio_genes_0046",
    "level": "ks3",
    "subject": "biology",
    "category": "Genes, inheritance & variation",
    "text": "Why does asexual reproduction produce less variation than sexual reproduction?",
    "options": {
      "A": "Asexual organisms have no DNA",
      "B": "Offspring are genetically identical to the single parent, so no new allele combinations are created",
      "C": "Asexual reproduction involves two parents mixing genes",
      "D": "Mutations cannot occur in asexually reproducing organisms"
    },
    "correct": "B",
    "difficulty": 2
  },
  # 0047 correct=D
  {
    "id": "ks3_bio_genes_0047",
    "level": "ks3",
    "subject": "biology",
    "category": "Genes, inheritance & variation",
    "text": "Which of the following is an inherited characteristic?",
    "options": {
      "A": "The language you speak",
      "B": "A pierced ear",
      "C": "A tattoo",
      "D": "Your natural eye colour"
    },
    "correct": "D",
    "difficulty": 1
  },
  # 0048 correct=C
  {
    "id": "ks3_bio_genes_0048",
    "level": "ks3",
    "subject": "biology",
    "category": "Genes, inheritance & variation",
    "text": "Which of the following is a characteristic caused only by the environment?",
    "options": {
      "A": "Blood group",
      "B": "Natural hair colour",
      "C": "The ability to speak French",
      "D": "Whether you can roll your tongue"
    },
    "correct": "C",
    "difficulty": 1
  },
  # 0049 correct=A
  {
    "id": "ks3_bio_genes_0049",
    "level": "ks3",
    "subject": "biology",
    "category": "Genes, inheritance & variation",
    "text": "What was the aim of the Human Genome Project?",
    "options": {
      "A": "To identify and map all the genes in human DNA",
      "B": "To clone a complete human being",
      "C": "To find a cure for all genetic disorders",
      "D": "To create new human chromosomes in a laboratory"
    },
    "correct": "A",
    "difficulty": 2
  },
  # 0050 correct=D
  {
    "id": "ks3_bio_genes_0050",
    "level": "ks3",
    "subject": "biology",
    "category": "Genes, inheritance & variation",
    "text": "Which of the following is a use of genetic testing?",
    "options": {
      "A": "To give a person a new set of chromosomes",
      "B": "To change a person's eye colour",
      "C": "To increase the number of genes a person has",
      "D": "To find out whether a person carries an allele for a genetic disorder"
    },
    "correct": "D",
    "difficulty": 2
  },
  # 0051 correct=D
  {
    "id": "ks3_bio_genes_0051",
    "level": "ks3",
    "subject": "biology",
    "category": "Genes, inheritance & variation",
    "text": "What term describes an organism with two different alleles for the same gene?",
    "options": {
      "A": "Homozygous",
      "B": "Haploid",
      "C": "Diploid",
      "D": "Heterozygous"
    },
    "correct": "D",
    "difficulty": 2
  },
  # 0052 correct=A
  {
    "id": "ks3_bio_genes_0052",
    "level": "ks3",
    "subject": "biology",
    "category": "Genes, inheritance & variation",
    "text": "What is the correct term for the full set of genetic information in an organism?",
    "options": {
      "A": "Genome",
      "B": "Genotype",
      "C": "Phenotype",
      "D": "Allele"
    },
    "correct": "A",
    "difficulty": 2
  },
  # 0053 correct=D
  {
    "id": "ks3_bio_genes_0053",
    "level": "ks3",
    "subject": "biology",
    "category": "Genes, inheritance & variation",
    "text": "Darwin's theory of natural selection includes the idea that organisms produce more offspring than can survive. What is the result of this overproduction?",
    "options": {
      "A": "All offspring survive and evolve",
      "B": "Only the smallest offspring die",
      "C": "Parents stop reproducing once numbers are stable",
      "D": "There is competition for limited resources"
    },
    "correct": "D",
    "difficulty": 2
  },
  # 0054 correct=D
  {
    "id": "ks3_bio_genes_0054",
    "level": "ks3",
    "subject": "biology",
    "category": "Genes, inheritance & variation",
    "text": "How does an organism becoming better adapted to its environment through natural selection affect the next generation?",
    "options": {
      "A": "It has no effect on the next generation",
      "B": "The next generation will be identical to the previous one",
      "C": "Each individual chooses to pass on useful traits",
      "D": "Better-adapted individuals are more likely to survive, reproduce, and pass on their beneficial alleles"
    },
    "correct": "D",
    "difficulty": 2
  },
  # 0055 correct=A
  {
    "id": "ks3_bio_genes_0055",
    "level": "ks3",
    "subject": "biology",
    "category": "Genes, inheritance & variation",
    "text": "In the classification hierarchy, which level groups together the most closely related organisms?",
    "options": {
      "A": "Species",
      "B": "Order",
      "C": "Family",
      "D": "Class"
    },
    "correct": "A",
    "difficulty": 2
  },
  # 0056 correct=B
  {
    "id": "ks3_bio_genes_0056",
    "level": "ks3",
    "subject": "biology",
    "category": "Genes, inheritance & variation",
    "text": "Using the binomial naming system, how is the scientific name of an organism written?",
    "options": {
      "A": "In capital letters only, e.g. HOMO SAPIENS",
      "B": "Genus capitalised, species in lower case, both in italics, e.g. Homo sapiens",
      "C": "All in lower case, e.g. homo sapiens",
      "D": "Species capitalised, genus in lower case, e.g. homo Sapiens"
    },
    "correct": "B",
    "difficulty": 3
  },
  # 0057 correct=D
  {
    "id": "ks3_bio_genes_0057",
    "level": "ks3",
    "subject": "biology",
    "category": "Genes, inheritance & variation",
    "text": "Which of the following is an invertebrate?",
    "options": {
      "A": "Frog",
      "B": "Shark",
      "C": "Sparrow",
      "D": "Snail"
    },
    "correct": "D",
    "difficulty": 1
  },
  # 0058 correct=D
  {
    "id": "ks3_bio_genes_0058",
    "level": "ks3",
    "subject": "biology",
    "category": "Genes, inheritance & variation",
    "text": "A dog breeder selects the fastest dogs each generation to breed together. After many generations, what is the most likely outcome?",
    "options": {
      "A": "The dogs will become slower over time",
      "B": "Speed in the dogs will be unaffected",
      "C": "The dogs will develop new chromosomes",
      "D": "The average speed of the dogs will increase over generations"
    },
    "correct": "D",
    "difficulty": 2
  },
  # 0059 correct=A
  {
    "id": "ks3_bio_genes_0059",
    "level": "ks3",
    "subject": "biology",
    "category": "Genes, inheritance & variation",
    "text": "Eye colour is mainly controlled by genes. A person's eye colour is an example of what?",
    "options": {
      "A": "Inherited variation",
      "B": "Environmental variation",
      "C": "Continuous variation",
      "D": "Acquired variation"
    },
    "correct": "A",
    "difficulty": 1
  },
  # 0060 correct=B
  {
    "id": "ks3_bio_genes_0060",
    "level": "ks3",
    "subject": "biology",
    "category": "Genes, inheritance & variation",
    "text": "Which of the following describes weight (body mass) in humans?",
    "options": {
      "A": "Discontinuous variation because you are either heavy or light",
      "B": "Continuous variation influenced by both genes and environment",
      "C": "Purely inherited variation with no environmental influence",
      "D": "Purely environmental variation with no genetic influence"
    },
    "correct": "B",
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
    assert dist == {'A':11,'B':7,'C':7,'D':15}, f"Distribution wrong: {dict(dist)}"
    combined = existing + NEW_Q
    save_json(json_path, combined)
    update_js(js_path, NEW_Q)
    print(f"backend: {len(existing)} -> {len(combined)} | JS updated")

if __name__ == '__main__':
    main()
