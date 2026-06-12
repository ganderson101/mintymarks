# Answer Audit — MIN-147 Gate Review
**Date:** 2026-06-11  
**Auditor:** answer-verifier (b3edc17c)  
**Branch:** feat/min133-subjects-cs-geography  
**Commit:** 1211cb0 (feat(MIN-135))

---

## Summary

| Subject | Questions | Sampled | Content Defects | Structural Defect | Verdict |
|---------|-----------|---------|-----------------|-------------------|---------|
| CS J277 GCSE | 660 | 20 | 0 | **B-bias 76.7%** | **FAIL** |
| AQA Geography 8035 GCSE | 480 | 20 | 1 | **B-bias 96.2%** | **FAIL** |

---

## FAIL Reason 1 — Critical: Systematic Answer-Key Bias (both banks)

The correct-answer distribution is severely skewed toward option B in both banks:

| Bank | A | B | C | D |
|------|---|---|---|---|
| CS J277 (n=660) | 47 (7.1%) | **506 (76.7%)** | 99 (15.0%) | 8 (1.2%) |
| Geography 8035 (n=480) | 10 (2.1%) | **462 (96.2%)** | 6 (1.2%) | 2 (0.4%) |

**Expected distribution:** ~25% per option (acceptable range: ~15–40% per letter).

**Impact:** A student who always selects B would score **77%** on CS and **96%** on Geography — entirely from pattern exploitation, zero subject knowledge required. This destroys assessment validity and makes both banks unusable for real examination practice. This is almost certainly a systematic defect in the question-generation prompt that did not randomise answer position.

**Required fix:** Shuffle correct-answer positions uniformly across A/B/C/D for all 1,140 questions, adjusting option text order and `correct` key accordingly. Each letter should appear as the answer approximately 25% of the time per bank.

---

## FAIL Reason 2 — Content Error: Geography gcse_geo_hazards_0029

**Question ID:** `gcse_geo_hazards_0029`  
**Text:** "Explain the geological cause of the Nepal 2015 earthquake."  
**Stored correct:** B  
**Option B text (stored):** "The Indian tectonic plate is **subducting** under the Eurasian plate at the Himalayan collision zone, building enormous stress that periodically releases as major earthquakes"

**Issue:** The word "subducting" is factually incorrect. The India–Eurasia boundary is a **continental-continental convergent (collision)** boundary. Subduction requires an oceanic plate; the absence of volcanoes in the Himalayas is the diagnostic evidence that no subduction occurs here. The AQA 8035 specification and approved textbooks (Hodder Education AQA GCSE Geography) describe this as a "collision zone" not a "subduction zone."

The solution text correctly says *"colliding with the Eurasian plate"* — directly contradicting the answer option text. Students who learn "subducting" from this answer would lose marks in AQA examinations.

**Required fix for gcse_geo_hazards_0029, option B:** Replace "subducting under" → "converging with / being underthrust beneath"  
Corrected text: *"The Indian tectonic plate is converging with the Eurasian plate at the Himalayan collision zone, building enormous stress that periodically releases as major earthquakes"*

---

## Sampled Questions Verified (40 total)

### CS J277 — 20 questions, all answer keys correct

| ID | Category | Diff | Correct | Verified |
|----|----------|------|---------|---------|
| gcse_cs_algo_0001 | Algorithms | 1 | B | ✓ |
| gcse_cs_algo_0060 | Algorithms | 3 | B | ✓ |
| gcse_cs_bool_0001 | Boolean Logic | 1 | B | ✓ |
| gcse_cs_bool_0060 | Boolean Logic | 3 | B | ✓ De Morgan's: NOT(A AND B)=NOT A OR NOT B |
| gcse_cs_networks_0001 | Computer Networks | 1 | B | ✓ |
| gcse_cs_networks_0060 | Computer Networks | 3 | B | ✓ |
| gcse_cs_ethics_0001 | Ethical and Legal Issues | 1 | B | ✓ CMA 1990 correct |
| gcse_cs_ethics_0060 | Ethical and Legal Issues | 3 | B | ✓ |
| gcse_cs_memstor_0001 | Memory and Storage | 1 | C | ✓ RAM is volatile |
| gcse_cs_memstor_0060 | Memory and Storage | 3 | B | ✓ 32-bit→max ~4GB |
| gcse_cs_netsec_0001 | Network Security | 1 | B | ✓ |
| gcse_cs_netsec_0060 | Network Security | 3 | B | ✓ |
| gcse_cs_robust_0001 | Producing Robust Programs | 1 | B | ✓ |
| gcse_cs_robust_0060 | Producing Robust Programs | 3 | B | ✓ |
| gcse_cs_progfund_0001 | Programming Fundamentals | 1 | B | ✓ |
| gcse_cs_progfund_0060 | Programming Fundamentals | 3 | B | ✓ |
| gcse_cs_ides_0001 | Programming Languages and IDEs | 1 | B | ✓ |
| gcse_cs_ides_0060 | Programming Languages and IDEs | 3 | B | ✓ |
| gcse_cs_sysarch_0001 | Systems Architecture | 1 | B | ✓ ALU correct |
| gcse_cs_syssw_0001 | Systems Software | 1 | B | ✓ |

### Geography 8035 — 20 questions, 1 content error

| ID | Category | Diff | Correct | Verified |
|----|----------|------|---------|---------|
| gcse_geo_coasts_0001 | Coastal Landscapes | 1 | B | ✓ |
| gcse_geo_coasts_0030 | Coastal Landscapes | 2 | B | ✓ |
| gcse_geo_coasts_0060 | Coastal Landscapes | 3 | B | ✓ |
| gcse_geo_skills_0001 | Geographical Skills | 1 | B | ✓ Eastings first |
| gcse_geo_skills_0030 | Geographical Skills | 2 | B | ✓ |
| gcse_geo_skills_0060 | Geographical Skills | 3 | B | ✓ |
| gcse_geo_living_0001 | Living World | 1 | A | ✓ |
| gcse_geo_living_0028 | Living World | 2 | B | ✓ |
| gcse_geo_living_0060 | Living World | 3 | B | ✓ |
| gcse_geo_hazards_0001 | Natural Hazards | 1 | A | ✓ |
| **gcse_geo_hazards_0029** | **Natural Hazards** | **2** | **B** | **⚠ answer key B is best available but option text says "subducting" — factually wrong for continental collision** |
| gcse_geo_hazards_0060 | Natural Hazards | 3 | B | ✓ |
| gcse_geo_resource_0001 | Resource Management | 1 | B | ✓ FAO definition correct |
| gcse_geo_resource_0060 | Resource Management | 3 | B | ✓ |
| gcse_geo_rivers_0001 | River Landscapes | 1 | B | ✓ Abrasion correct |
| gcse_geo_rivers_0060 | River Landscapes | 3 | B | ✓ |
| gcse_geo_economic_0001 | Changing Economic World | 1 | B | ✓ GNI definition correct |
| gcse_geo_economic_0060 | Changing Economic World | 3 | B | ✓ |
| gcse_geo_urban_0001 | Urban Issues | 1 | B | ✓ |
| gcse_geo_urban_0060 | Urban Issues | 3 | B | ✓ |

---

## Non-Issues Confirmed

- **Encoding:** Clean — 1,393 em-dashes all stored as U+2014; no garbled sequences, no replacement characters.
- **Duplicate IDs:** None across either bank.
- **Missing answer keys:** None — all `correct` values present in `options`.
- **Content quality (outside items above):** Questions are well-crafted, factually accurate, appropriately levelled for GCSE, and distractors are plausible-but-wrong. The underlying content work is good; the failures are structural (bias) and one isolated wording error.

---

## Required Corrections Before PASS

1. **Both banks:** Shuffle answer positions uniformly across A/B/C/D. Expected distribution after fix: 25% ± reasonable variance per letter. This requires re-generating or remapping option order + `correct` key for all 1,140 questions.
2. **gcse_geo_hazards_0029:** Change "subducting under" → "converging with / being underthrust beneath" in option B text to match the solution and the AQA specification.
