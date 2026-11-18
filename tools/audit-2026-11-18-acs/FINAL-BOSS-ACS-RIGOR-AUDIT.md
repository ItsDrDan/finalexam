# Final Boss: ACS-level rigor audit (2026-11-18)

Repo `github/finalexam`, branch `audit/2026-11-18-acs-rigor`, starting from `main` at **9d5c1e3 (v61)**. Nothing here is pushed or live yet.

Final Boss is independent practice. It is not affiliated with, endorsed by, certified by, or psychometrically equated to the ACS Examinations Institute or any ACS exam. "ACS-level" in this report means one thing: the items were judged against the publicly described scope and style of ACS general, organic and GOB exams. No ACS item, key or norm was used or reproduced.

---

## 1. Executive summary

**The answer keys are sound.** Every one of the 5,521 questions was solved independently and checked against its key, and every calculation question was recomputed in code. No wrong key was found. A blind second review of 180 hard items also found none. The bank has now had two full independent key checks: this one and the November 13 audit of the first 2,510 items. After both, a wrong key is unlikely but not impossible (see section 9 for the bound).

**Most of the remaining defects are in what students read after they answer.** That was also true on November 13. This audit made 304 edits: content changes to 143 questions, plus near-twin tags on 73. The content changes were:
- 22 wrong-answer explanations named a mistake the student did not make, or contained an error.
- 9 hints gave the answer away.
- 14 explanations told students to see a "§B" drawing that does not exist, because the choices are shuffled.
- Rounding, significant-figure and mass-value slips.
- 3 explanations stated something false (28A-970, 28B-882, 1A-104).
- 2 stems were missing data or wording a student needs: h and c in 3A-489, and a sign ambiguity in 3A-669.

**The question pool was sound, but the exam builder was not fair.** Topic counts were fixed, but difficulty was random within each topic. Two students taking the same CHEM 3A final could get anywhere from 10 to 20 easy questions and from 5 to 14 hard ones (5th to 95th percentile over 2,000 simulated exams). The builder now gives every exam the same difficulty mix. It also never puts two near-identical questions in one exam; 73 such questions are tagged. Topic counts are unchanged.

**On rigor, the STEM-major banks are in the intended range; the GOB banks lean more on recall.** By the reviewers' cognitive classification:
- **1A:** 21% recall, 51% understanding, 29% application or integration.
- **1B, 28A, 28B:** 50–55% application or integration.
- **3A and 3B:** 17–21% recall. That is appropriate for allied-health courses, but 3B's difficulty tags overstate its difficulty: several one-step recall items were tagged d=3.

Three recall items were rebuilt as reasoning items as worked examples (section 10). The bank as a whole does not need a mass rewrite.

**What this audit cannot claim:**
- There is almost no student response data: 50 items have any responses at all, and none has 15 or more. Item difficulty, discrimination and reliability (KR-20) cannot be estimated yet, and nothing here should be read as psychometric evidence.
- The reviewers are AI models, not a faculty committee. The calibration sample shows that about 5% of items still carry a small undetected defect, almost all in feedback wording or rounding (section 9).

**Readiness:** all six courses are **ready for student practice, with listed nonblocking items** (section 14). No course is ready for any claim of equivalence to an ACS exam, and none should make one.

---

## 2. Method and evidence sources

| Layer | Coverage | How |
|---|---|---|
| Baseline | all | Commit 9d5c1e3, `validate_bank.js` 0 errors / 0 warnings, inventory below, 2,000-exam simulation per course |
| Structure → SMILES | all 6,305 drawings | New `struct2smi.py` (RDKit) turns each stored drawing into the SMILES students actually see, wedges and E/Z included. Validated on 4,994 organic drawings against their source SMILES: 4,933 exact, 60 where the drawing fixes an E/Z the source left open, 1 explicit-H water mismatch |
| First-pass item review | **all 5,521, one by one** | 30 reviewers (Claude Opus), 100–239 items each, shared brief `REVIEW_BRIEF.md`. Each solved the item first, then checked key, every distractor, explanation, hint, figure, scope, topic, difficulty, duplication and cognitive level. Every quantitative item was recomputed in Python; stereo, formulas and NMR symmetry were checked with RDKit |
| Blind calibration | 180 items (30 per course, weighted to d=3, calculation and figure items) | Two separate adversarial reviewers who never saw the first-pass ledger. Purpose: estimate what the first pass missed |
| Code sweeps | all | Feedback that names the key before the retry (validator), sign/wording mismatch, choices whose unit alone rules them out, "§" placeholders, near-duplicate text |
| Adjudication | every proposed fix | I read each proposed fix. Rewrites of whole items were checked by hand: the 5 duplicate replacements and the 3 rigor upgrades. Conflicting proposals were merged by a script with fixed priority (`merge_fixes.js`) |
| Application | all edits | `tools/apply_fixes.js`: an edit applies only if its old text matches exactly, and every untouched question is compared to the original. Validator re-run: 0 errors, 0 warnings |
| Game testing | builder, scoring, Exam Day, Weak Spots | New `tools/test_exam.js` (53,718 checks over 300 exams per course, exam and length). Exam Day run end-to-end in the browser (70 questions, keyed answers scored 10/70 = 14% correctly through the shuffle). iPhone 17 simulator: Boss Battle setup, start, answer and next with real taps. Changed figures re-rendered at desktop and 375 px |
| Course outlines | | 3B COR (`textbook/tools/COR_outline.md`); 3A, 1A and 1B scope from `tools/audit-2026-11-13-cor/SCOPE.md` (condensed from the CORs); 28A/28B from `tools/organic/AUTHORING.md` and the 28A/28B CORs. The ACS outline was used as the public chapter outline of the Official Guides only |

Everything is in `tools/audit-2026-11-18-acs/`:
- `ledger/*.jsonl`: one line per question, 5,521 lines. Fields: cognitive level, science, key, scope, topic, difficulty, distractors, feedback, hint, figure, duplicates, calculation check, action, defects.
- `calibration/`: the second-review sample and its results.
- `fixes-proposed/`: the raw proposals.
- `tools/fixes/2026-11-18-acs-audit.json` and `-audit-b.json`: the applied edits, with old text, new text and the reason for each.

---

## 3. Baseline inventory (v61, before changes)

| Course | Items | Topics | d=1 / 2 / 3 | Calculator items | Figures or drawings | I/II/III items | Low-priority (`lo`) |
|---|---|---|---|---|---|---|---|
| 3A | 839 | 15 | 242 / 433 / 164 | 238 | 180 | 9 | 3 |
| 3B | 1,136 | 16 | 383 / 554 / 199 | 65 | 494 | 13 | 25 |
| 1A | 831 | 12 | 265 / 391 / 175 | 258 | 395 | 75 | 16 |
| 1B | 744 | 11 | 225 / 363 / 156 | 309 | 399 | 81 | 15 |
| 28A | 1,075 | 16 | 219 / 544 / 312 | 31 | 920 | 58 | 0 |
| 28B | 896 | 12 | 169 / 460 / 267 | 9 | 779 | 29 | 0 |

Every item already had a hint, an explanation and a "why wrong" line for each distractor. The validator reported 0 errors before this audit.

**What earlier audits verified, and what they assumed:**
- **2026-11-13:**
  - Blind solve of 2,510 items, with 1 real key error found.
  - Code recheck of 583 calculation items.
  - Lighter reading of 1,927 concept explanations.
  - Rendered figures, scope, difficulty tags and topic tags were not reviewed.
- **2026-11-17:**
  - 28A/28B items: a blind solve of 1,200, with 3 mismatches, all of them solver errors.
  - Since then, about 1,800 items have been added: v54–v61 organic, the 3A import, ACS-modeled 1A/1B items, and I/II/III items. Each batch was blind-solved when added. None had been through a feedback, scope or difficulty review like this one.

---

## 4. Course-by-course findings

The ledger counts for each course follow. "Items edited" counts content edits and leaves out the 73 twin tags.

| Course | Items | Reviewed | Key wrong | Science error | Ambiguous | Figure error | Out of scope | Borderline | KEEP | REVISE | REPLACE | REMOVE | Items edited |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 3A | 839 | 839 | 0 | 0 | 1 | 0 | 0 | 5 | 821 | 18 | 0 | 0 | 21 |
| 3B | 1136 | 1136 | 0 | 0 | 0 | 0 | 0 | 7 | 1098 | 38 | 0 | 0 | 39 |
| 1A | 831 | 831 | 0 | 1 | 0 | 0 | 0 | 0 | 810 | 21 | 0 | 0 | 24 |
| 1B | 744 | 744 | 0 | 0 | 0 | 0 | 0 | 5 | 731 | 13 | 0 | 0 | 14 |
| 28A | 1075 | 1075 | 0 | 1 | 0 | 1 | 0 | 4 | 1053 | 22 | 0 | 0 | 23 |
| 28B | 896 | 896 | 0 | 1 | 0 | 0 | 0 | 1 | 873 | 17 | 5 | 1 | 22 |

Calibration and code sweeps added 6 more edited items. The two REMOVE/REPLACE groups in 28B were handled without deleting anything, so question IDs and item statistics stay valid (section 10).

**CHEM 3A:**
- **Strengths:** keys clean; strong clinical contexts.
- **Defects fixed:**
  - 3A-489 needed h and c, which are not on the 3A sheet; they are now given.
  - 3A-669 asked how much heat was "released" but keyed a negative q.
  - 3A-251's bracket labels ("4−" on the key, "2−" on the rest) gave the answer away.
  - Explanations pointed to textbook sections and a "green sheet" that students don't have.
  - Several why-wrong lines now name the real slip (for example, 488 mL is the water added).
- **Borderline scope:** 3A-26 (Fe configuration), 249, 327, 333, 369. All kept; several already have the `lo` flag.

**CHEM 3B:**
- **Defects fixed:**
  - 14 items (3B-570–578, 750–757, 924, 940) showed students a literal "§B", "§C" or "§D" in their feedback.
  - 3B-394 printed its own molecular formula in two distractors.
  - 4 hints leaked the answer.
  - 3B-1099 said "ten essential amino acids" (adults have nine; arginine is conditional). The stem no longer depends on the count.
  - 3B-741's feedback argued against a claim the choice doesn't make.
- **Difficulty tags:** 3B-37, 91, 97, 135, 1042 and 1045 go from d=3 to d=2.
- **Borderline scope:** aromatic substitution items (414, 525, 526), Zaitsev (505), and 3B-782/794, which ask students to rotate wedge drawings in their head. All are close to 28A level.
- **Blueprint note:** the aromatic pool has only 31 items, but the midterm draws about 7 from it, so a student starts repeating them after about 4 battles. The COR gives aromatic compounds their own unit, so the weight itself is defensible.

**CHEM 1A:**
- **Science error fixed:** 1A-104's feedback said three N=O double bonds put 10 electrons around N; the correct count is 12.
- **Ambiguity fixed:** 1A-713's wavelengths were truncated, not rounded (102.56 nm was shown as 102.5), so a student who calculated correctly found no matching choice.
- **Other fixes:**
  - 1A-232 now gives water's specific heat.
  - 1A-482's figure label "H" sat on fluorine, so a choice read "H⁻" (hydride); it is now "J".
  - 1A-699's level labels now support 3 significant figures.
  - 1A-701's hint gave the answer away.
  - Several explanations used S = 32.06 or Zn = 65.38, not the game's table values.

**CHEM 1B:**
- **Fixes:** 5 why-wrong lines described the wrong error (1B-52, 618, 682, 738, and the "linear" error in 738's explanation). 1B-249 called (Ksp/27)^¼ the pure-water solubility while ignoring water's own OH⁻. 1B-668 got the chemistry of HCO₃⁻ → CO₂ wrong.
- **Not changed:**
  - 6 electrolysis calculations need F, but the stem doesn't give it. The data panel tells students to memorize F, so this counts as expected knowledge; 7 similar items give F anyway.
  - The 1B IMF and coordination items were kept, per your earlier decision.

**CHEM 28A:**
- **Science error fixed:** 28A-970's explanation said both bromides give the trans product. Inversion of the trans bromide gives the cis sulfide.
- **Figure error fixed:** in 28A-759, the keyed resonance form had O and CH₃ swapped relative to the starting structure, so it read as a different conformer. Re-rendered and now consistent.
- **Feedback fixes:**
  - 28A-300 and 303 used wrong carbon counts.
  - 28A-344 gave the wrong arithmetic source for a distractor.
  - 28A-274 and 381 contradicted their own orbital geometry.
  - 28A-647 blamed a hydride shift; the real problem is an impossible carbon count.
  - 28A-789's eclipsing count was wrong.
  - 28A-401's 1,5-H shift counted "five carbons back".
  - 3 hints leaked the answer (29, 809, 1042).
- **Near-identical pairs:** 220/343 and 622/684.

**CHEM 28B:**
- **Science error fixed:** 28B-882 said all the Haworth OH groups of β-D-allopyranose point up. The C2–C4 OH groups point down.
- **Duplicates:** five exact duplicates (65 of 44, 68 of 33, 76 of 34, 145 of 29, 182 of 162) were each replaced by a new question on a different compound. 28B-308 duplicates 382; the pair is now tagged so they never appear together.
- **Feedback fixes:**
  - 28B-53 got the ketene formula wrong.
  - 28B-107 blamed a hydride shift; the real problem is a carbon count.
  - 28B-223 gave the wrong xylose argument.
  - 28B-729 accepted a propyl radical that does not exist.
  - 28B-812 and 876 used the wrong terms.
  - 28B-466 gave an octahydro name for a hexahydro enone.
- **Dangling letters:** "A/B/C/D" references in feedback were removed from 252, 375, 395 and 396.

---

## 5. Scientific errors found and corrected

None of these changed a key. Every one is in `tools/fixes/2026-11-18-acs-audit.json` with its evidence.

| Item | What was wrong | Now |
|---|---|---|
| 28A-970 | "both give trans product with inversion" | Cis bromide → trans sulfide; trans bromide → cis sulfide |
| 28B-882 | Haworth: "all four ring OH groups ... point up" | C1-OH and CH₂OH up; C2, C3 and C4 OH down |
| 1A-104 | Three N=O double bonds = "10 electrons" | 12 electrons |
| 28B-53 | Methylketene "would require losing water" | C₃H₄O vs C₃H₆O: it would need loss of CO₂ plus H₂ |
| 1B-668 | HCO₃⁻ → CO₂ "lost an O and an OH" | Lost one OH⁻ |
| 28A-759 | Keyed resonance drawing had the wrong atom positions | Matches structure I |
| 3A-669 | "How much heat did the iron release?" with a negative key | "What is q for the iron?" |
| 3A-489 | Needed h and c, which were not supplied | Both given in the stem |
| 1A-713 | Truncated wavelengths, so no choice matched correct work | Correctly rounded |
| 28A-274, 28A-381 | Vinyl cation's empty p orbital put "in the plane of the π bond" | Perpendicular |
| 28B-466 | "Octahydronaphthalen-2-one" for an enone | 4,4a,5,6,7,8-hexahydronaphthalen-2(3H)-one |
| 3B-1099 | "Ten essential amino acids" | The stem no longer depends on the count (nine for adults) |
| 3A-321 | I-131 β range "a few millimeters" | About 1–2 mm |

**About 22 why-wrong lines named the wrong student error.** Examples:
- 1B-52: 1.3% does not come from leaving 0.25 M out of the square root.
- 1B-618: 0.025 is ppm being read as ppb.
- 1B-682: the distractor is √(Ksp/Kf), not Ksp/Kf.
- 28A-344: the distractor comes from adding Cl, not ignoring it.

These matter because this feedback appears before the student's retry.

---

## 6. Cognitive difficulty analysis

The levels are our working audit scale, not an ACS taxonomy. They come from the reviewers' classification of every item.

| Course | Level 1 recall | Level 2 understanding | Level 3 application | Level 4 integration | Difficulty tags d=1 / 2 / 3 |
|---|---|---|---|---|---|
| 3A | 21% | 53% | 26% | 0% | 29% / 52% / 20% |
| 3B | 17% | 49% | 33% | 0% | 34% / 49% / 17% |
| 1A | 21% | 51% | 28% | 1% | 32% / 47% / 21% |
| 1B | 11% | 41% | 46% | 1% | 30% / 49% / 21% |
| 28A | 8% | 42% | 43% | 7% | 20% / 51% / 29% |
| 28B | 10% | 39% | 45% | 6% | 19% / 51% / 30% |

Against the provisional target for STEM-major exams (20–30% foundational, 40–50% application, 20–30% integrated reasoning):
- **1A** fits.
- **1B, 28A and 28B** lean harder, with more application than recall. That matches majors-level ACS exams, which do little pure recall.
- **3A and 3B** are about a fifth recall. That is reasonable for allied-health GOB courses. Taking them to majors-level reasoning would break the request not to turn 3A into 1A.

Level 4 (integration across several ideas) is thin everywhere, at 0–7%. It is the clearest place to add rigor without leaving course scope. Section 13 has a plan.

**Difficulty tags vs. reviewer judgment:** in 1B, 28A and 28B the tags (d=1 at about 20–30%) are more conservative than the cognitive levels (recall at 8–11%). Tags were left alone unless clearly wrong. About 25 were changed, mostly recall items tagged d=3. Tags should eventually be replaced by real first-try difficulty from student data (section 9).

---

## 7. Distractors and misconceptions

- **Reviewer grades (whole bank):** 5,233 strong, 284 adequate, 4 weak. Most distractors map to a named student error, and every why-wrong line was checked against the distractor it describes.
- **Distractors no student could reach:** about 15 calculation distractors match no traceable mistake (for example 1B-11's 26.5 kJ, 1B-236 and 1A-214). They are listed in the ledger with feedback rated "ok". They are wrong, but they teach nothing.
- **Unit giveaways (code sweep):** in 9 items, one choice carries a unit that alone rules it out, such as "mol" offered for a question asking for grams or mL: 3A-563, 626, 628, 633 (fixed), 634, 635, 653, 740, and 1A-50 (g O₂ vs g Mg, a real error). These represent a real mistake (stopping at moles), but a test-wise student can eliminate them without doing the chemistry. **Your call:** keep them as they are, or restate each with the asked-for unit.
- **Length cue:** the key is strictly the longest choice in 11–18% of items and strictly the shortest in 8–12%. Both are below chance, so there is no length giveaway.
- **Answer position:** all positions are shuffled per student. The exam test confirms each order is a true permutation and that scoring follows the stored key through the shuffle.
- **I/II/III items:**
  - 1A and 1B have a good spread of keyed combinations (no combination above 20%).
  - 28A is skewed: "I and III only" is the key in 18 of 58 (31%).
  - 28B: "I and II only" is the key in 10 of 29.
  - A student who always guesses those combinations gains a few points. **Recommendation:** rebalance about 10 28A items when the next organic batch is written.
  - The wording "I, II and III only" (with a redundant "only") appears in a few 28A/28B items; it should be standardized.

---

## 8. Exam blueprint

**How Boss Battles are built:**
- Topic weights: `TOPIC_W` in `index.html`.
  - 1A/1B and 28A/28B are weighted by ACS Official Guide chapter length.
  - 3A uses equal topic weights.
  - 3B uses COR units.
  - 28B mixes in first-term topics from the 28A bank for the full-year exam.
- Counts per topic are fixed, using a largest-remainder rule.
- Questions within a topic were random, with unseen items first.

**Before: difficulty was a lottery.** 5th–95th percentile over 2,000 simulated full exams per course:

| Exam | d=1 count | d=3 count |
|---|---|---|
| 3A (50 questions) | 10–20 | 5–14 |
| 3B midterm | 13–23 | 5–12 |
| 3B final | 11–21 | 5–13 |
| 1A (70 questions) | 17–29 | 9–20 |
| 1B (70 questions) | 15–27 | 9–20 |
| 28A | 9–20 | 14–27 |
| 28B | 9–19 | 14–26 |

**After (implemented):**
- Each exam gets the d=1/2/3 mix its topic pools give on average. Slots are filled one at a time, from the topic with the most slots left, at the difficulty level furthest below its target.
- The spread is now 0–1 question per level: for 3A, d=1 = 15 every time and d=3 = 9–10.
- Topic counts are identical to before; this was verified on all 2,000 simulated exams per course.
- Unseen-first and the one-`lo`-per-topic rules are kept.
- **Near-twin rule:** 73 items in 32 groups (same molecule, spectrum or figure, same idea) are tagged `g`, and a Boss Battle uses at most one per group.
- The tag is outside the question fingerprint (stem + choices), so item statistics stay attached to their questions.

**Coverage per exam:** topic counts are in `sim_balanced.json`.
- Every topic appears on every exam, so no essential topic is ever missing.
- The calculator count still varies (3A: 9–17). That is acceptable, since calculation is spread across topics.

**Timing:**

| Exam | Estimate | Limit |
|---|---|---|
| 3A | ~70 min | 60 min |
| 3B midterm | ~66 min | 60 min |
| 3B final | ~67 min | 60 min |
| 1A | ~105 min | 110 min |
| 1B | ~111 min | 110 min |
| 28A | ~109 min | 110 min |
| 28B | ~108 min | 110 min |

These are rough estimates (45/75/110 s by difficulty, plus calculation, figure and reading time), not measured times. They suggest the 3A/3B mock finals may be tight. No time limits were changed, since there is no real timing data. **Recommendation:** collect time per item (section 9) before deciding.

**Pool depth:** a student can take about 8–20 full exams before topics start repeating. The exception is 3B aromatic, at about 4. The 28B mixed exam has the deepest pools.

**Coverage against the course outlines:** every COR unit of 3B maps to a topic; 1A/1B/28A/28B map to ACS chapters through `ACS_CH`. No item was found out of scope. 22 are borderline and kept (listed in the ledger).

---

## 9. Psychometrics: findings and limits

- **Response data:**
  - `tools/item_analysis.py` was run against the live stats endpoint (365 days).
  - **50 questions have any first-try responses.**
  - **0 have the 15 needed to judge them.**
  - 3 responses were to older wording.
  - Output: `item-analysis-2026-11-18.md`.
- **Why some statistics cannot be computed:** the tracking sends anonymous per-answer records (item, pick, key, version). There is no student or session identifier that would let answers be grouped into a person-by-item matrix. So **item discrimination (point-biserial) and exam reliability (KR-20 / α) cannot be computed**, however much data comes in. Only item difficulty and distractor frequencies can.
- **Recommendation:** to make discrimination and reliability possible, add an anonymous, random per-exam ID to each Boss Battle submission. Send it only for Boss Battles, never with names. Then:
  - After about 100 completed full battles per course, compute corrected item-total correlations and KR-20.
  - Retire or rewrite items with negative discrimination.
  - Replace author difficulty tags with observed p-values.

  This is a privacy-relevant change, so it needs your decision.
- **Calibration of the AI review itself:** the blind second review of 180 items (weighted to hard calculation and figure items) found:
  - **0 major defects:** no wrong key, no false science that matters, no ambiguity it judged major.
  - **10 minor defects:** 4 had already been flagged by the first pass; 6 had not (3A-633, 3A-669, 1A-47, 1A-713, 1A-747, 28A-320). All are fixed.
  - **What it suggests:** about 3–6% of items still carry a small undetected defect, mostly feedback wording or rounding. By the rule of three, the true rate of major defects is below about 1.7% with 95% confidence. That is a bound, not a measurement.
  - **Recommendation:** run the next round of fixes from student "Report a problem" submissions and from the item statistics, not from another full AI pass.

No ACS percentiles, score equivalences or norms are claimed or implied anywhere in the game or in this report.

---

## 10. Changes implemented (branch `audit/2026-11-18-acs-rigor`)

**Questions** (304 edits in `tools/fixes/2026-11-18-acs-audit.json` and `-audit-b.json`: content changes to 143 questions plus group tags on 73; all IDs preserved, nothing deleted):

| Kind | Count |
|---|---|
| First-pass reviewer fixes (text, rounding, feedback, hints, tags, figures) | 174 |
| Blind-calibration fixes | 14 |
| Rigor upgrades (3A-495, 1B-440, 3B-979; whole stem, choices and feedback) | 32 edits |
| Exact-duplicate replacements (28B-65, 68, 76, 145, 182), checked by hand | 5 |
| Validator follow-ups (feedback leaking the key, long hints) | 6 |
| Near-twin tags (`g`) | 73 |

**Game code** (`index.html`):
1. **Boss Battle difficulty balance:** same d mix on every exam; topic counts unchanged.
2. **Near-twin rule:** at most one question per `g` group per Boss Battle.
3. **Weak Spots:** a missed question now stays until it is answered right twice (field `fx`). One lucky right answer no longer counts as mastery. Older saved records are treated as already fixed, so returning students don't get a flood of old misses. The in-game text says "until you get it right twice".

**Docs:**
- README is now v62, with the Boss Battle and Weak Spots descriptions updated.
- INSTRUCTORS.md describes the balanced exams and the twin rule, and adds a plain independence disclaimer.

**New reusable tools** (`tools/` and `tools/audit-2026-11-18-acs/`):
- `test_exam.js`: Boss Battle invariants, answer and key mapping through the shuffle, bank shape, Weak Spots rule.
- `simulate_exams.js`: blueprint simulation that runs the shipped builder.
- `struct2smi.py`: drawing to SMILES with stereo.
- `make_packets.py`: review packets.
- `near_dups.py`.
- `summarize_ledger.py` and `report_tables.py`.
- `merge_fixes.js`.

### Before and after: question improvements

1. **3A-495 (rigor).**
   - *Before:* "Which electron jump gives off a photon?" Choices were 4→2 (key), 1→3, 2→5, and "n = 2 to n = 2". The last one is a giveaway, and the question is recall.
   - *After:* "Which jump gives off the photon with the **most** energy?" Choices: 3→1 (key), 4→2, 1→3, 5→3.
   - *Why better:* students must reject the upward jump (absorption) and also reason that hydrogen's levels crowd together as n rises: gaps of 0.89, 0.19 and 0.07 of the ionization energy. Now d=2, still within the 3A Bohr scope.
2. **1B-440 (rigor).**
   - *Before:* "An unsaturated solution: which Q/Ksp relation holds?" A definition, with a nonsense choice "Ksp < Q < 1".
   - *After:* [Ca²⁺] = 2.0×10⁻⁵ M, [C₂O₄²⁻] = 3.0×10⁻⁵ M, Ksp = 2.3×10⁻⁹. Choices: Q < Ksp, unsaturated, more solid dissolves (key); Q > Ksp, precipitates; Q < Ksp but "supersaturated"; Q = Ksp, saturated.
   - *Answer:* Q = 6.0×10⁻¹⁰ < Ksp.
   - *Why better:* students compute Q, then interpret it. One distractor targets the common unsaturated/supersaturated mix-up.
3. **3B-979 (rigor).**
   - *Before:* the stem said the group "is protonated (–NH₃⁺)", which names the answer (amine).
   - *After:* "Which group do all four share, **and why is it charged** at pH 7.4?" Key: an amine, which accepts H⁺. Distractors: an amide accepting H⁺ (amides are not basic); an amine giving up H⁺ (wrong direction); a carboxylic acid giving up H⁺ (that would make it negative).
   - *Why better:* it ties structure to acid–base behavior and the sign of the charge.
4. **3B-394.**
   - *Before:* two distractors printed their own formulas, "C₆H₁₀ (cyclohexene)" and "C₆H₆ (benzene)".
   - *After:* they are written as condensed structures, CH₂=CHCH₂CH₂CH=CH₂ and HC≡CCH₂CH₂CH₂CH₃.
   - *Why better:* students now have to count H and recognize that two C=C bonds or one C≡C remove the same number of H.
5. **3A-251.**
   - *Before:* the keyed carbonate drawing was bracketed "4−" and the others "2−".
   - *After:* there are no bracket labels, so students must count electrons, as the hint intends.
6. **3A-669.**
   - *Before:* "How much heat did the iron release?" with key −1.98×10³ J. A strong student could defend +1.98×10³ J.
   - *After:* "What is q for the iron, the heat it gained or lost?" Now exactly one answer is defensible.
7. **1A-713.**
   - *Before:* choices showed 102.5 nm and 1281 nm, truncated values, while correct work gives 102.6 and 1282.
   - *After:* correctly rounded, so careful work matches a choice exactly.
8. **1A-701 (hint).**
   - *Before:* "The drops from n = 2, 3, 4 and 5 grow in that order." With four lines shown, that points straight to the third line.
   - *After:* "Find ΔE for the drop from n = 4 to n = 1, then λ = hc/ΔE." The student does the reasoning.
9. **28B-65 (duplicate replaced).**
   - *Before:* an exact copy of 28B-44 (NaBH₄ with a keto ester, same four choices).
   - *After:* NaBH₄ with ethyl 4-oxocyclohexane-1-carboxylate. Key: the hydroxy ester. Distractors: the reversed selectivity, over-reduction (the LiAlH₄ result), and ester hydrolysis.
   - *Why better:* same chemoselectivity idea on a new substrate, so practice doesn't reward memorizing one answer.
10. **28B-182 (duplicate replaced).**
    - *Before:* a copy of 28B-162.
    - *After:* "Which pyridine is the strongest base?" Choices: DMAP (pKaH 9.6, key), 4-methoxypyridine (6.6), pyridine (5.2), 4-cyanopyridine (1.9).
    - *Why better:* it tests resonance donation into the pyridinium ion and why N donates better than O, not recall of one molecule.
11. **28A-970 (explanation).**
    - *Before:* "both give trans product with inversion."
    - *After:* "the cis bromide gives the trans sulfide, and the trans bromide gives the cis sulfide." The old text contradicted the stereochemistry the item teaches.
12. **1B-618 (feedback).**
    - *Before:* "This leaves the lead in milligrams while the water is in grams." That error actually gives 2.5×10⁴.
    - *After:* "0.025 is the concentration in mg/L, which is ppm, not ppb."
    - *Why better:* the feedback now names the mistake the student actually made.

---

## 11. Tests and results

| Test | Result |
|---|---|
| `node tools/validate_bank.js` | 5,521 questions, 6,305 drawings, 167 equations, 78 molar masses checked by code: **0 errors, 0 warnings** (61 reviewed warnings allow-listed, as before) |
| `node tools/test_exam.js 300` | **53,718 checks passed.** Every course, exam and length gives the right count, no repeats, no practice-only or other-exam topics, a true answer permutation, keyed answer scored right through the shuffle, identical topic counts, difficulty spread ≤ 2, and the Weak Spots rule |
| `simulate_exams.js` (2,000 exams per course) | Topic counts unchanged; difficulty sd dropped from about 0.09 to about 0.01 |
| `apply_fixes.js` | 303 edits applied, 1 already in place, 0 failed; every untouched question byte-identical |
| Browser (in-app, desktop and 375 px) | 1A Exam Day run end-to-end: 70 questions, no hint, topic chips or mode buttons, timer at 109:59, bubble answers, 10 keyed answers → 10/70 = 14%. Changed figures re-rendered: 28A-759, 1A-482, 1A-699, 3A-251. 3B-866 enzyme cartoon checked against its choice wording |
| iPhone 17 simulator, real taps | 3A Boss Battle: choose Half, start, answer, next; 25 questions, timer counts down |

**Not tested in this audit:**
- A full WCAG pass. Prior audits covered the shared feedback widget and focus styles. This audit changed no interface.
- Offline and service-worker behavior. Bank file stamps change with content, as designed.
- Canvas iframe embedding.
- Blitz and Quick 10. Their code was read but not changed.
- Weak Spots in a live browser. It is checked by unit test only.

---

## 12. Remaining unresolved issues (nonblocking)

1. **Residual minor defects.** About 3–6% of items probably still have a small wording, rounding or feedback slip (section 9).
2. **Your decisions needed:**
   - Unit-giveaway distractors (9 items, section 7).
   - Rebalancing 28A I/II/III keys.
   - The 3B aromatic pool depth.
   - The F constant in 6 1B items.
   - Whether to add an anonymous exam ID to tracking (section 9).
3. **Generic feedback:** about 15 calculation distractors have no traceable error and generic feedback (listed in the ledger with feedback "ok").
4. **Concept-level near-duplicates** (same skill, different question) are common: for example several K↔°C conversions in 3A. A short exam can include two. Only near-identical items are kept apart.
5. **Rendering checked from data only:** for about 5 items (1A-295, 299, 496, 3B-761, 866), choice wording depends on how the drawing looks. Each was checked from the figure data or viewed once; none looked wrong.
6. **Literature values from memory:** some organic literature values (pKa, NMR shifts, enol %) were checked against reviewer memory, not a database.
7. **28A-759 charge mark:** the keyed drawing shows N⁺ as a plain "+" below NH, while distractor B uses a circled ⊕. This was already there before the fix. A cosmetic inconsistency, not a giveaway, but worth unifying.

---

## 13. Recommendations

1. **Push v62** after your review. These are content fixes, the exam-balance change and the Weak Spots change.
2. **Integration items (Level 4).** Add about 40 for 1A/1B and about 30 for 28A/28B: two-concept items that combine, for example, Ksp with the common-ion effect and pH, or a spectrum with a mechanism outcome. Replace weak recall items rather than growing the banks.
3. **3B aromatic.** Add about 25 items (o/m/p naming, EAS products at GOB level, properties) so the midterm stops repeating them.
4. **Item statistics.** Turn on the anonymous exam ID (privacy decision). Then rerun `item_analysis.py` monthly and extend it with point-biserial and KR-20 once the data allows.
5. **Time per item.** Record time per item in Boss Battles, then check the 60-minute 3A/3B limits against real data.
6. **Before adding any new batch,** run `validate_bank.js`, `test_exam.js` and a calibration sample of 30 items reviewed blind. Tag near-twins with `g` as items are written.

---

## 14. Readiness verdict by course

Release criteria (prompt Part 13), applied:
- Every item has a documented result: **yes** (ledger, 5,521 lines).
- No known wrong keys: **yes**.
- No unresolved ambiguous items in scored battles: **yes** (3A-489, 3A-669 and 1A-713 fixed).
- No known wrong diagrams or spectra: **yes** (28A-759 fixed).
- No out-of-scope items on exams: **yes** (22 borderline items are documented and kept).
- Every item has reasoning, and every distractor was evaluated: **yes**.
- Exams follow a documented blueprint: **yes** (`TOPIC_W` and the INSTRUCTORS docs), with the difficulty balance now enforced.
- Randomization keeps keys and feedback correct: **yes**, tested.
- Exam Day gives no extra help: **yes**, tested.
- No accessibility or offline regression: **no interface change.** These were not retested.
- ACS similarity claims are qualified: **yes**.
- Missing evidence is reported as missing: **yes** (psychometrics, rendering, timing).

| Course | Verdict | Reasons and conditions |
|---|---|---|
| CHEM 3A | **Ready for practice** | Nonblocking: unit-giveaway distractors (8 items); 60-minute timing unvalidated |
| CHEM 3B | **Ready for practice** | Nonblocking: thin aromatic pool (repeats after about 4 midterms); a few 28A-level stereo items are borderline |
| CHEM 1A | **Ready for practice** | Nonblocking: Level 4 items thin |
| CHEM 1B | **Ready for practice** | Nonblocking: F is not given in 6 items (expected knowledge per the data panel) |
| CHEM 28A | **Ready for practice** | Nonblocking: I/II/III key skew; one charge-mark style inconsistency (28A-759) |
| CHEM 28B | **Ready for practice** | Nonblocking: I/II/III key skew |
| All | **Not ready for any claim of ACS equivalence, percentiles or validity evidence** | No person-level response data exists; discrimination and reliability are unmeasured |

---

## 15. Follow-up (v63, same day): your five decisions and the nuclide fix

1. **Wrong choices fail by size, not by unit.** As you said, real exams keep units consistent, so each "stopped at moles" choice in the 8 CHEM 3A items now has the asked-for unit and a number from a real mistake. Where possible, the mistake gives an impossible size:
   - 3A-628: 150. g of ethanol from 75.0 g of glucose.
   - 3A-653: 5.78 × 10⁵ g of methane, more than half a tonne.
   - 3A-421: 0.0870 g/mL, where a size check gives about 1.
   - Also 3A-563, 626, 634, 635 and 740.

   1A-50 (g O₂ vs g Mg) was kept, because there the label is the chemistry being tested.
2. **I/II/III keys are no longer predictable.**
   - **How:** 20 items in 1B, 28A and 28B had their statements renumbered, with every reference in the choices, feedback and explanation remapped to match. The chemistry is unchanged. Items with oxidation states, iodine or captioned drawings were left alone.
   - **28A:** "I and III only" went from 27 to 19 of 87 keys, and the three pair answers are now 19/18/18.
   - **3A, 3B and 1A** were already even.
   - **Remaining pattern:** two-statement answers are still the most common key type in 28A/28B (about 55%), because changing that needs new statements, not renumbering.
   - **Script:** `tools/audit-2026-11-18-acs/rebalance_roman.js`.
3. **Thin 3B aromatic pool:** 25 new CHEM 3B aromatic questions (3B-1136 to 1160).
   - **How they were made:** one reviewer wrote 30 and checked every structure with RDKit. A second, blind reviewer then caught three kinds of problems:
     - Most drawings used lowercase aromatic SMILES, which the game draws as saturated rings with "c" labels. All were converted to Kekulé form.
     - Six answer leaks, now fixed.
     - Five near-duplicates of existing items, which were dropped.
   - **Two more fixes:** shaking benzene in a test tube became toluene (a safer practice), and the layer answer was corrected.
   - **One drawing check:** the resonance item's two Kekulé forms were redrawn explicitly, because the game redraws both rings with the same bond pattern.
   - **Rendering:** all 25 render at phone width with no overflow, and each shows feedback on a wrong pick.
   - **Pool size:** it goes from 31 to 56, so a student can take about 8 midterms before aromatic questions repeat.
4. **Faraday constant** is now printed on the 1A/1B data sheet (F = 96,485 C·mol⁻¹).
5. **More data.**
   - **What's sent:** every answer now sends the seconds spent on it. Boss Battle answers also carry a random code for that one exam, which is all that's needed for item discrimination and approximate KR-20. A persistent device ID was *not* added, because the privacy page promises students a code that is "new every time you open a tab".
   - **Files:** `games/track.js` and the privacy page are updated.
   - **Analysis:** `tools/item_analysis.py` reports low-discrimination questions, approximate KR-20 and time per question once 30+ battles exist. It also now includes 28A/28B.
   - **Still needed:** the receiver update (`tools/apps-script/item_stats_v2.gs`) must be pasted into the Apps Script project. Until then the new fields are sent but not stored.

**Correction to section 9:** the tracker already sent an anonymous per-tab session code, and the Items sheet stores it. The new per-exam code is cleaner than the session code, because one tab can hold several battles plus practice.

**Nuclide symbols (your report).**
- **The fix:** 57 nuclide symbols in 17 questions, mostly the imported 3A items, showed the mass and atomic numbers side by side. They now use the game's stacked style, with the mass number directly above the atomic number and both flush against the symbol, the standard notation.
- **Also caught:** one Unicode-typed nuclide (⁴₂He in 1B-503), and minus signs written as `&minus;`.
- **Kept intact:** formula subscripts followed by isotope labels (C₃H₇³⁵Cl), which are not nuclides.
- **Guard against repeats:** `tools/test_exam.js` now fails if a side-by-side nuclide is ever added again.
- **Mass-only symbols:** nuclear equations written with mass numbers only (²³⁵U + ¹n → …, used in some 1B fission items) were left as they are. Adding the atomic numbers there is a content choice.
