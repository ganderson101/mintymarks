#!/usr/bin/env python3
"""MIN-98 wave 2: KS3 Biology - Ecosystems & ecology (40 new, 0021-0060)
Target dist: A=13 B=0 C=14 D=13
"""
import json, sys
from collections import Counter

NEW_Q = [
  # 0021 => A
  {
    "id": "ks3_bio_eco_0021",
    "level": "ks3",
    "subject": "biology",
    "category": "Ecosystems & ecology",
    "text": "Which of the following best describes a microhabitat?",
    "options": {
      "A": "A small, specific area within a habitat, such as under a log or in a rock pool",
      "B": "The total number of species living in an ecosystem",
      "C": "The feeding relationships between organisms in an area",
      "D": "The movement of water through the environment"
    },
    "correct": "A",
    "difficulty": 1
  },
  # 0022 => C
  {
    "id": "ks3_bio_eco_0022",
    "level": "ks3",
    "subject": "biology",
    "category": "Ecosystems & ecology",
    "text": "Which of the following is an example of a structural adaptation that helps a cactus survive in a desert?",
    "options": {
      "A": "Being active only at night to avoid heat",
      "B": "Migrating to cooler regions during summer",
      "C": "Having thick, fleshy stems that store water",
      "D": "Producing a chemical that repels predators"
    },
    "correct": "C",
    "difficulty": 2
  },
  # 0023 => D
  {
    "id": "ks3_bio_eco_0023",
    "level": "ks3",
    "subject": "biology",
    "category": "Ecosystems & ecology",
    "text": "A camel can survive in the desert partly because it can store fat in its hump. What type of adaptation is this?",
    "options": {
      "A": "Behavioural adaptation",
      "B": "Ecological adaptation",
      "C": "Structural adaptation relating to camouflage",
      "D": "Physiological adaptation"
    },
    "correct": "D",
    "difficulty": 2
  },
  # 0024 => A
  {
    "id": "ks3_bio_eco_0024",
    "level": "ks3",
    "subject": "biology",
    "category": "Ecosystems & ecology",
    "text": "Being nocturnal (active at night) is an example of which type of adaptation that helps desert animals survive?",
    "options": {
      "A": "Behavioural adaptation",
      "B": "Structural adaptation",
      "C": "Physiological adaptation",
      "D": "Genetic adaptation"
    },
    "correct": "A",
    "difficulty": 2
  },
  # 0025 => C
  {
    "id": "ks3_bio_eco_0025",
    "level": "ks3",
    "subject": "biology",
    "category": "Ecosystems & ecology",
    "text": "Which adaptation helps Arctic animals such as polar bears keep warm in freezing temperatures?",
    "options": {
      "A": "Thin skin to allow heat to escape quickly",
      "B": "Dark fur to absorb as little heat as possible",
      "C": "A thick layer of fat (blubber) under the skin",
      "D": "Sweating more to cool the body down"
    },
    "correct": "C",
    "difficulty": 1
  },
  # 0026 => D
  {
    "id": "ks3_bio_eco_0026",
    "level": "ks3",
    "subject": "biology",
    "category": "Ecosystems & ecology",
    "text": "Many Arctic animals, such as the Arctic hare, have white fur in winter. What is the main advantage of this?",
    "options": {
      "A": "It helps them absorb more sunlight to stay warm",
      "B": "It makes them more visible to attract mates",
      "C": "It reduces water loss in cold conditions",
      "D": "It provides camouflage against the snow so predators cannot easily spot them"
    },
    "correct": "D",
    "difficulty": 1
  },
  # 0027 => A
  {
    "id": "ks3_bio_eco_0027",
    "level": "ks3",
    "subject": "biology",
    "category": "Ecosystems & ecology",
    "text": "In a predator-prey relationship, what typically happens to the prey population when the predator population increases?",
    "options": {
      "A": "The prey population decreases because more prey are eaten",
      "B": "The prey population also increases because both species need each other",
      "C": "The prey population stays exactly the same",
      "D": "The prey population increases because predators bring in more food"
    },
    "correct": "A",
    "difficulty": 1
  },
  # 0028 => C
  {
    "id": "ks3_bio_eco_0028",
    "level": "ks3",
    "subject": "biology",
    "category": "Ecosystems & ecology",
    "text": "In a predator-prey cycle, after the prey population crashes, what usually happens next to the predator population?",
    "options": {
      "A": "The predator population continues to rise indefinitely",
      "B": "The predator population stays at its peak level",
      "C": "The predator population falls because there is less food available",
      "D": "The predator population immediately doubles in size"
    },
    "correct": "C",
    "difficulty": 2
  },
  # 0029 => D
  {
    "id": "ks3_bio_eco_0029",
    "level": "ks3",
    "subject": "biology",
    "category": "Ecosystems & ecology",
    "text": "An oil spill in the sea can harm an ecosystem. What is one direct effect on seabirds?",
    "options": {
      "A": "It improves their ability to fly by making feathers smoother",
      "B": "It has no effect because birds do not enter the water",
      "C": "It provides extra nutrients for the birds to feed on",
      "D": "Oil coats their feathers, reducing insulation and making it harder to fly or swim"
    },
    "correct": "D",
    "difficulty": 2
  },
  # 0030 => A
  {
    "id": "ks3_bio_eco_0030",
    "level": "ks3",
    "subject": "biology",
    "category": "Ecosystems & ecology",
    "text": "Acid rain is caused by air pollutants dissolving in rainwater. What damage can acid rain do to ecosystems?",
    "options": {
      "A": "It can acidify lakes and soils, killing fish and plants that cannot tolerate low pH",
      "B": "It increases the biodiversity of lakes by adding nutrients",
      "C": "It only affects buildings and has no impact on living organisms",
      "D": "It warms rivers, which speeds up decomposition"
    },
    "correct": "A",
    "difficulty": 2
  },
  # 0031 => C
  {
    "id": "ks3_bio_eco_0031",
    "level": "ks3",
    "subject": "biology",
    "category": "Ecosystems & ecology",
    "text": "Lichens are used as indicator species in ecology. What does the presence of lichens on trees and rocks tell us about the air quality?",
    "options": {
      "A": "The air is heavily polluted with sulfur dioxide",
      "B": "The area is regularly flooded",
      "C": "The air is clean and relatively unpolluted",
      "D": "The soil is very acidic"
    },
    "correct": "C",
    "difficulty": 2
  },
  # 0032 => D
  {
    "id": "ks3_bio_eco_0032",
    "level": "ks3",
    "subject": "biology",
    "category": "Ecosystems & ecology",
    "text": "Mayfly larvae are found in clean, well-oxygenated rivers. If a scientist finds many mayfly larvae in a stream, what can she conclude?",
    "options": {
      "A": "The stream is heavily polluted",
      "B": "The stream has very low oxygen levels",
      "C": "The stream contains a large amount of sewage",
      "D": "The stream water is clean and has good oxygen levels"
    },
    "correct": "D",
    "difficulty": 2
  },
  # 0033 => A
  {
    "id": "ks3_bio_eco_0033",
    "level": "ks3",
    "subject": "biology",
    "category": "Ecosystems & ecology",
    "text": "Bloodworms (midge larvae) can survive in water with very little oxygen. Finding large numbers of bloodworms in a river is a sign of what?",
    "options": {
      "A": "Water pollution, as bloodworms tolerate low-oxygen, polluted conditions",
      "B": "Very clean water with high oxygen levels",
      "C": "The river has a high biodiversity",
      "D": "Acid rain has not affected the river"
    },
    "correct": "A",
    "difficulty": 2
  },
  # 0034 => C
  {
    "id": "ks3_bio_eco_0034",
    "level": "ks3",
    "subject": "biology",
    "category": "Ecosystems & ecology",
    "text": "How does a food web differ from a food chain?",
    "options": {
      "A": "A food web only shows producers, while a food chain shows all organisms",
      "B": "A food web has only one pathway of energy flow, unlike a food chain",
      "C": "A food web shows multiple interconnected feeding relationships, while a food chain shows only a single linear pathway",
      "D": "A food web only applies to aquatic ecosystems"
    },
    "correct": "C",
    "difficulty": 1
  },
  # 0035 => D
  {
    "id": "ks3_bio_eco_0035",
    "level": "ks3",
    "subject": "biology",
    "category": "Ecosystems & ecology",
    "text": "In the food chain: grass -> rabbit -> fox, what is the rabbit?",
    "options": {
      "A": "A producer",
      "B": "A tertiary consumer",
      "C": "A secondary consumer",
      "D": "A primary consumer"
    },
    "correct": "D",
    "difficulty": 1
  },
  # 0036 => C
  {
    "id": "ks3_bio_eco_0036",
    "level": "ks3",
    "subject": "biology",
    "category": "Ecosystems & ecology",
    "text": "In the food chain: phytoplankton -> small fish -> tuna -> shark, what trophic level is the tuna at?",
    "options": {
      "A": "First trophic level",
      "B": "Second trophic level",
      "C": "Third trophic level",
      "D": "Fifth trophic level"
    },
    "correct": "C",
    "difficulty": 2
  },
  # 0037 => A
  {
    "id": "ks3_bio_eco_0037",
    "level": "ks3",
    "subject": "biology",
    "category": "Ecosystems & ecology",
    "text": "Which organism would be described as an apex predator?",
    "options": {
      "A": "A killer whale that has no natural predators in the ocean",
      "B": "A rabbit that feeds on grass and leaves",
      "C": "A caterpillar that feeds on plant leaves",
      "D": "A vulture that feeds on the remains of dead animals"
    },
    "correct": "A",
    "difficulty": 1
  },
  # 0038 => D
  {
    "id": "ks3_bio_eco_0038",
    "level": "ks3",
    "subject": "biology",
    "category": "Ecosystems & ecology",
    "text": "What term describes an organism that only eats plants?",
    "options": {
      "A": "Carnivore",
      "B": "Omnivore",
      "C": "Decomposer",
      "D": "Herbivore"
    },
    "correct": "D",
    "difficulty": 1
  },
  # 0039 => A
  {
    "id": "ks3_bio_eco_0039",
    "level": "ks3",
    "subject": "biology",
    "category": "Ecosystems & ecology",
    "text": "What is an omnivore?",
    "options": {
      "A": "An animal that eats both plants and other animals",
      "B": "An animal that only eats meat",
      "C": "An animal that only eats plants",
      "D": "An animal that feeds on dead and decaying matter"
    },
    "correct": "A",
    "difficulty": 1
  },
  # 0040 => C
  {
    "id": "ks3_bio_eco_0040",
    "level": "ks3",
    "subject": "biology",
    "category": "Ecosystems & ecology",
    "text": "Large-scale deforestation (cutting down forests) is likely to cause which of the following?",
    "options": {
      "A": "An increase in biodiversity because more sunlight reaches the ground",
      "B": "A decrease in atmospheric carbon dioxide levels",
      "C": "A loss of habitats for many species and a rise in atmospheric carbon dioxide",
      "D": "An increase in the water-holding capacity of the soil"
    },
    "correct": "C",
    "difficulty": 2
  },
  # 0041 => D
  {
    "id": "ks3_bio_eco_0041",
    "level": "ks3",
    "subject": "biology",
    "category": "Ecosystems & ecology",
    "text": "Climate change is causing ocean temperatures to rise. What is one well-known effect on coral reef ecosystems?",
    "options": {
      "A": "Coral reefs grow faster because warm water provides more energy",
      "B": "The fish in coral reefs become larger and more numerous",
      "C": "Ocean acidification decreases, making conditions better for coral",
      "D": "Coral bleaching occurs as corals expel the algae they depend on, often leading to coral death"
    },
    "correct": "D",
    "difficulty": 2
  },
  # 0042 => A
  {
    "id": "ks3_bio_eco_0042",
    "level": "ks3",
    "subject": "biology",
    "category": "Ecosystems & ecology",
    "text": "As the climate warms, some species are shifting where they live. What general trend is observed?",
    "options": {
      "A": "Many species are moving towards the poles or to higher altitudes to stay in their preferred temperature range",
      "B": "Most species are moving towards the equator to find warmer conditions",
      "C": "Species are becoming smaller to cope with the heat",
      "D": "All species are adapting instantly and populations remain stable"
    },
    "correct": "A",
    "difficulty": 3
  },
  # 0043 => C
  {
    "id": "ks3_bio_eco_0043",
    "level": "ks3",
    "subject": "biology",
    "category": "Ecosystems & ecology",
    "text": "An invasive species is one that is introduced to an ecosystem where it did not naturally occur. Why can invasive species be harmful?",
    "options": {
      "A": "They always bring new diseases that kill every native organism",
      "B": "They cannot reproduce in the new environment so they take up resources unnecessarily",
      "C": "They can outcompete native species for food and space, disrupting food webs and reducing biodiversity",
      "D": "They always eat the top predators, collapsing the food chain from the top"
    },
    "correct": "C",
    "difficulty": 2
  },
  # 0044 => D
  {
    "id": "ks3_bio_eco_0044",
    "level": "ks3",
    "subject": "biology",
    "category": "Ecosystems & ecology",
    "text": "Which of the following is a conservation method used to protect endangered species?",
    "options": {
      "A": "Increasing hunting quotas to raise money for wildlife charities",
      "B": "Removing all predators from an area so that prey species can thrive",
      "C": "Allowing unlimited fishing to boost the fishing industry",
      "D": "Setting up nature reserves where habitats and species are legally protected"
    },
    "correct": "D",
    "difficulty": 1
  },
  # 0045 => A
  {
    "id": "ks3_bio_eco_0045",
    "level": "ks3",
    "subject": "biology",
    "category": "Ecosystems & ecology",
    "text": "Captive breeding programmes breed endangered animals in zoos, with the aim of releasing them into the wild. What is the main conservation goal of these programmes?",
    "options": {
      "A": "To increase the wild population of an endangered species and prevent its extinction",
      "B": "To replace all wild populations with captive ones",
      "C": "To study how animals behave in artificial environments permanently",
      "D": "To provide animals for other zoos around the world"
    },
    "correct": "A",
    "difficulty": 2
  },
  # 0046 => C
  {
    "id": "ks3_bio_eco_0046",
    "level": "ks3",
    "subject": "biology",
    "category": "Ecosystems & ecology",
    "text": "Which of the following is an example of a renewable natural resource?",
    "options": {
      "A": "Coal",
      "B": "Natural gas",
      "C": "Wind energy",
      "D": "Oil"
    },
    "correct": "C",
    "difficulty": 1
  },
  # 0047 => D
  {
    "id": "ks3_bio_eco_0047",
    "level": "ks3",
    "subject": "biology",
    "category": "Ecosystems & ecology",
    "text": "What does 'sustainable development' mean?",
    "options": {
      "A": "Using as many natural resources as possible to develop the economy quickly",
      "B": "Only using resources that come from forests",
      "C": "Stopping all development to protect the environment",
      "D": "Meeting the needs of people today without preventing future generations from meeting their own needs"
    },
    "correct": "D",
    "difficulty": 2
  },
  # 0048 => C
  {
    "id": "ks3_bio_eco_0048",
    "level": "ks3",
    "subject": "biology",
    "category": "Ecosystems & ecology",
    "text": "In the nitrogen cycle, what is the role of nitrogen-fixing bacteria found in the soil and in root nodules of plants such as peas?",
    "options": {
      "A": "They break down dead organisms and release carbon dioxide",
      "B": "They absorb nitrogen compounds from plants and convert them into animal protein",
      "C": "They convert nitrogen gas from the atmosphere into nitrogen compounds that plants can absorb through their roots",
      "D": "They convert nitrates back into nitrogen gas and release it into the air"
    },
    "correct": "C",
    "difficulty": 3
  },
  # 0049 => A
  {
    "id": "ks3_bio_eco_0049",
    "level": "ks3",
    "subject": "biology",
    "category": "Ecosystems & ecology",
    "text": "In the nitrogen cycle, what do decomposers do when an organism dies?",
    "options": {
      "A": "They break down proteins and other nitrogen-containing compounds in dead organisms, releasing nitrogen compounds back into the soil",
      "B": "They convert nitrogen gas into proteins directly",
      "C": "They absorb nitrogen from the air and store it in their cells permanently",
      "D": "They fix carbon dioxide from the air into organic molecules"
    },
    "correct": "A",
    "difficulty": 3
  },
  # 0050 => D
  {
    "id": "ks3_bio_eco_0050",
    "level": "ks3",
    "subject": "biology",
    "category": "Ecosystems & ecology",
    "text": "Burning fossil fuels releases carbon dioxide into the atmosphere. How does this contribute to climate change?",
    "options": {
      "A": "Carbon dioxide blocks sunlight, causing the Earth to cool down",
      "B": "Carbon dioxide reacts with oxygen and produces heat directly",
      "C": "Carbon dioxide is absorbed by the oceans, which then release heat",
      "D": "Carbon dioxide is a greenhouse gas that traps heat in the atmosphere, causing global temperatures to rise"
    },
    "correct": "D",
    "difficulty": 2
  },
  # 0051 => A
  {
    "id": "ks3_bio_eco_0051",
    "level": "ks3",
    "subject": "biology",
    "category": "Ecosystems & ecology",
    "text": "How do plants contribute to the water cycle through a process called transpiration?",
    "options": {
      "A": "Plants absorb water through their roots and release water vapour through tiny pores (stomata) in their leaves",
      "B": "Plants produce liquid water from carbon dioxide and sunlight during photosynthesis",
      "C": "Plants absorb rain and store it in their stems, releasing it slowly back to the ground",
      "D": "Plants take in water vapour from the air and convert it into liquid water in their roots"
    },
    "correct": "A",
    "difficulty": 2
  },
  # 0052 => C
  {
    "id": "ks3_bio_eco_0052",
    "level": "ks3",
    "subject": "biology",
    "category": "Ecosystems & ecology",
    "text": "The clownfish lives among the stinging tentacles of a sea anemone. The clownfish gets shelter and protection, while the anemone gets cleaned of parasites by the clownfish. What type of relationship is this?",
    "options": {
      "A": "Parasitism, because the anemone is harmed by the clownfish",
      "B": "Predation, because the anemone tries to eat the clownfish",
      "C": "Mutualism, because both species benefit from the relationship",
      "D": "Commensalism, because only the clownfish benefits"
    },
    "correct": "C",
    "difficulty": 2
  },
  # 0053 => D
  {
    "id": "ks3_bio_eco_0053",
    "level": "ks3",
    "subject": "biology",
    "category": "Ecosystems & ecology",
    "text": "Fleas live on dogs, feeding on their blood. The fleas benefit, but the dog is irritated and may become unwell. What type of ecological relationship is this?",
    "options": {
      "A": "Mutualism",
      "B": "Commensalism",
      "C": "Competition",
      "D": "Parasitism"
    },
    "correct": "D",
    "difficulty": 1
  },
  # 0054 => A
  {
    "id": "ks3_bio_eco_0054",
    "level": "ks3",
    "subject": "biology",
    "category": "Ecosystems & ecology",
    "text": "A barnacle attaches itself to a whale's skin. The barnacle benefits by getting transported to food-rich waters. The whale is neither helped nor harmed. What type of relationship is this?",
    "options": {
      "A": "Commensalism, because one species benefits and the other is unaffected",
      "B": "Mutualism, because both species gain something",
      "C": "Parasitism, because the barnacle lives on the whale",
      "D": "Competition, because the barnacle and whale compete for space"
    },
    "correct": "A",
    "difficulty": 3
  },
  # 0055 => C
  {
    "id": "ks3_bio_eco_0055",
    "level": "ks3",
    "subject": "biology",
    "category": "Ecosystems & ecology",
    "text": "A scientist walks in a straight line across a habitat, sampling organisms at regular intervals. What ecological technique is this?",
    "options": {
      "A": "Random quadrat sampling",
      "B": "Mark-release-recapture",
      "C": "A transect line survey",
      "D": "Pitfall trapping"
    },
    "correct": "C",
    "difficulty": 2
  },
  # 0056 => D
  {
    "id": "ks3_bio_eco_0056",
    "level": "ks3",
    "subject": "biology",
    "category": "Ecosystems & ecology",
    "text": "Why is it important to place quadrats randomly when sampling plants in a field, rather than choosing spots that look interesting?",
    "options": {
      "A": "Random placement is faster and requires less equipment",
      "B": "Random placement ensures every quadrat contains the same number of species",
      "C": "Random placement guarantees that rare species are always found",
      "D": "Random placement avoids bias, making the sample more representative of the whole field"
    },
    "correct": "D",
    "difficulty": 2
  },
  # 0057 => A
  {
    "id": "ks3_bio_eco_0057",
    "level": "ks3",
    "subject": "biology",
    "category": "Ecosystems & ecology",
    "text": "What does 'species richness' measure?",
    "options": {
      "A": "The number of different species present in an area",
      "B": "The total number of individual organisms in an area",
      "C": "The amount of biomass produced by all species in an area",
      "D": "The rarity of each species found in an area"
    },
    "correct": "A",
    "difficulty": 2
  },
  # 0058 => C
  {
    "id": "ks3_bio_eco_0058",
    "level": "ks3",
    "subject": "biology",
    "category": "Ecosystems & ecology",
    "text": "In a food web, the rabbit, deer, and vole all eat grass. If rabbits are removed from the food web, what is the most likely outcome?",
    "options": {
      "A": "All other organisms in the food web immediately go extinct",
      "B": "The grass population immediately disappears because it has no grazers",
      "C": "Deer and vole populations may increase slightly as there is less competition for grass",
      "D": "The fox population increases because foxes now only eat rabbits"
    },
    "correct": "C",
    "difficulty": 3
  },
  # 0059 => D
  {
    "id": "ks3_bio_eco_0059",
    "level": "ks3",
    "subject": "biology",
    "category": "Ecosystems & ecology",
    "text": "Over-fishing of cod in the North Atlantic has caused cod populations to crash. What is one likely consequence for the ecosystem?",
    "options": {
      "A": "Populations of organisms that cod fed on would also decrease because cod supported them",
      "B": "The ocean ecosystem quickly recovers as other fish take the same role immediately",
      "C": "Fishing boats catch more of other species to make up for the loss of cod",
      "D": "Populations of prey species that cod used to eat, such as smaller fish and invertebrates, may increase dramatically"
    },
    "correct": "D",
    "difficulty": 3
  },
  # 0060 => C
  {
    "id": "ks3_bio_eco_0060",
    "level": "ks3",
    "subject": "biology",
    "category": "Ecosystems & ecology",
    "text": "Wolves were hunted to extinction in Yellowstone National Park, USA, but were reintroduced in 1995. After their return, elk populations were better controlled, riverside vegetation recovered, and rivers changed course due to increased plant roots stabilising banks. What does this show about reintroducing a key species?",
    "options": {
      "A": "Reintroducing predators always harms ecosystems by reducing prey populations to zero",
      "B": "Reintroducing wolves only affects the wolves themselves and has no wider ecosystem impact",
      "C": "Reintroducing a key species can have wide-ranging positive effects throughout the whole ecosystem",
      "D": "Reintroduction programmes only work if the species is artificially fed by conservationists"
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
    assert dist == {'A':13,'C':14,'D':13}, f"Distribution wrong: {dict(dist)}"
    combined = existing + NEW_Q
    save_json(json_path, combined)
    update_js(js_path, NEW_Q)
    print(f"backend: {len(existing)} -> {len(combined)} | JS updated")

if __name__ == '__main__':
    main()
