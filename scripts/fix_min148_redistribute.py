"""
MIN-148: Redistribute answer-key B-bias + fix Nepal plate-boundary wording.
Run once from the repo root:  python scripts/fix_min148_redistribute.py
"""
import json
import re
import sys
from collections import Counter

LETTERS = ['A', 'B', 'C', 'D']
BANK_FILE = 'backend/questions.json'

with open(BANK_FILE, encoding='utf-8') as f:
    qs = json.load(f)

cs_qs  = [q for q in qs if q.get('subject') == 'comp-sci']
geo_qs = [q for q in qs if q.get('subject') == 'geography']
print(f'Loaded: {len(cs_qs)} CS, {len(geo_qs)} Geo  (total bank: {len(qs)})')


def redistribute(bank, label):
    """Cycle A/B/C/D: for question i, target = ABCD[i%4].
    Swap the correct option text into the target slot."""
    changed = 0
    for i, q in enumerate(bank):
        target  = LETTERS[i % 4]
        current = q['correct']
        if current == target:
            continue
        q['options'][current], q['options'][target] = (
            q['options'][target], q['options'][current]
        )
        q['correct'] = target
        changed += 1
    print(f'{label}: {changed} questions reshuffled')


redistribute(cs_qs,  'CS J277')
redistribute(geo_qs, 'Geography 8035')


# ── Fix letter references in solutions ──────────────────────────────────────

# 1. gcse_cs_memstor_0025 — solution says "option D are reversed"
#    D held "HDDs use flash memory; SSDs use spinning magnetic discs" (wrong).
#    After swap (B↔target) that text may have moved.
for q in qs:
    if q['id'] == 'gcse_cs_memstor_0025':
        for letter, text in q['options'].items():
            if 'flash memory' in text and 'spinning' in text:
                q['solution'] = re.sub(
                    r'[Oo]ption D', lambda m: m.group(0).replace('D', letter),
                    q['solution']
                )
                print(f'memstor_0025: solution "option D" -> "option {letter}"')
        break

# 2. gcse_cs_algo_0015 — solution says "answer is B" / "Option B" for [2,5,1,7,8]
#    (the correct option).  After redistribution q['correct'] already holds the
#    new letter.
for q in qs:
    if q['id'] == 'gcse_cs_algo_0015':
        new_letter = q['correct']
        sol = q['solution']
        sol = re.sub(r'\bOption B\b',           f'Option {new_letter}', sol)
        sol = re.sub(r'\banswer is B\b',         f'answer is {new_letter}', sol)
        sol = re.sub(r'\bcorrect answer is B\b', f'correct answer is {new_letter}', sol)
        q['solution'] = sol
        print(f'algo_0015: solution letter refs updated to {new_letter}')
        break


# ── Fix Defect 2: gcse_geo_hazards_0029 plate-boundary wording ───────────────
for q in qs:
    if q['id'] == 'gcse_geo_hazards_0029':
        for letter, text in q['options'].items():
            if 'subducting under' in text:
                q['options'][letter] = text.replace(
                    'The Indian tectonic plate is subducting under the Eurasian plate '
                    'at the Himalayan collision zone, building enormous stress that '
                    'periodically releases as major earthquakes',
                    'The Indian tectonic plate is colliding with (and being underthrust '
                    'beneath) the Eurasian plate at the Himalayan convergent boundary, '
                    'building enormous stress that periodically releases as major earthquakes'
                )
                print(f'geo_hazards_0029: fixed "subducting under" -> "colliding with" at option {letter}')
        break


# ── Write back ────────────────────────────────────────────────────────────────
with open(BANK_FILE, 'w', encoding='utf-8') as f:
    json.dump(qs, f, ensure_ascii=False, indent=2)
print('Written to', BANK_FILE)


# ── Verify ────────────────────────────────────────────────────────────────────
with open(BANK_FILE, encoding='utf-8') as f:
    qs2 = json.load(f)

cs2  = [q for q in qs2 if q.get('subject') == 'comp-sci']
geo2 = [q for q in qs2 if q.get('subject') == 'geography']

cs_dist  = Counter(q['correct'] for q in cs2)
geo_dist = Counter(q['correct'] for q in geo2)

print()
print('=== POST-FIX DISTRIBUTION ===')
print(f'CS  (n={len(cs2)}):  {dict(sorted(cs_dist.items()))}')
print(f'Geo (n={len(geo2)}): {dict(sorted(geo_dist.items()))}')

# Duplicate options check
dup_errors = []
for q in cs2 + geo2:
    vals = list(q['options'].values())
    if len(vals) != len(set(vals)):
        dup_errors.append(q['id'])
print(f'Duplicate-option errors: {len(dup_errors)} {dup_errors or ""}')

# Count unchanged
total_ids = {q['id'] for q in qs2 if q.get('subject') in ('comp-sci','geography')}
print(f'Total new-subject question IDs: {len(total_ids)} (expect 1140)')

# Nepal fix check
for q in qs2:
    if q['id'] == 'gcse_geo_hazards_0029':
        correct_text = q['options'][q['correct']]
        print(f'geo_hazards_0029 correct ({q["correct"]}): {correct_text[:120]}')

# Letter-ref check after fix
lref_remaining = []
letter_pat = re.compile(r'\b[Oo]ption [A-D]\b|\banswer is [A-D]\b')
for q in cs2 + geo2:
    sol = q.get('solution', '')
    m = letter_pat.search(sol)
    if m:
        lref_remaining.append((q['id'], m.group(0)))
print(f'Remaining raw letter refs: {lref_remaining}')

print()
print('DONE — verify distribution above is 20–30% per letter in each bank.')
