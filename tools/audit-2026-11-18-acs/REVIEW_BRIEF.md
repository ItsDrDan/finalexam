# Final Boss item review brief (ACS-rigor audit, 2026-11-18)

You are one reviewer in a full, item-by-item audit of **every** question in the Final Boss chemistry exam-review game
(repo: `/Users/dan/Desktop/Study Games/github/finalexam`). Each reviewer gets packets of 100 questions. Review **every
item in your packets**. No sampling, no skipping, no "looks fine" without checking.

You review as a university chemistry professor and an assessment specialist would. Scientific correctness comes
first, then assessment validity, then teaching value. Do not trust earlier reviews, the keyed answer or the
explanation. **Solve each item yourself first, then compare with the key.**

## What a packet line means

```
=== 1B-400 | topic=solubility | d=3 | calc=1 | lo
Q: stem (HTML: <sub>, <sup>, <b> ...)
  STEM-STRUCT: DRAWN <SMILES of the drawing students see>   (wedges/E-Z read from the drawing; :1=a, :2=b labels)
  FIG: {figure JSON: table, plot, particles, nmr, ir, ms, newman, chair, energy, fischer, haworth, cell ...}
KEY c0: the keyed answer (choice 0 is ALWAYS the key; the game shuffles positions)
c1  c1: distractor            why-wrong x1: feedback shown when a student picks c1
      DRAWN-CHOICE: DRAWN <SMILES>  (structure drawn under that choice; "§A" choice text means structure only)
HINT: hint shown before answering   EXPL: explanation shown after answering
```
- `calc=1` means the question shows a calculator chip. `lo` = low-priority (at most one per mock exam).
- `d` = difficulty metadata 1/2/3.
- `LEWIS[...]` lists lone pairs and charges for Lewis (non-skeletal) drawings. `{...}` notes come from the converter
  (e.g. "valence problem" = the drawing itself has an impossible valence; decide if it is a deliberate wrong choice).
- A `DRAWN` SMILES with `/` `\` shows the E/Z geometry the drawing implies even if the author did not intend it.
- To see an item's exact stored JSON: `node -e 'console.log(JSON.stringify(require("./data/bank-1B.json")[400],null,1))'`
  (run from the repo root). Use it whenever you write a fix: `old` must be the exact stored text.
- RDKit is available: `/private/tmp/claude-501/-Users-dan--claude-spares-spare-oMXxAY/7017404f-fd9c-440d-a81d-a72fa67209e9/scratchpad/venv/bin/python`
  (formulas, MW, degrees of unsaturation, R/S via `rdkit.Chem.rdCIPLabeler`, E/Z, symmetry classes for NMR signal counts).

## Data the student has (use these values when recomputing)
- Periodic table masses as in the game: H 1.008, C 12.01, N 14.01, O 16.00, Na 22.99, Mg 24.31, Al 26.98, P 30.97,
  S 32.07, Cl 35.45, K 39.10, Ca 40.08, Fe 55.85, Cu 63.55, Zn 65.39, Br 79.90, Ag 107.9, I 126.9, Ba 137.3, Pb 207.2 ...
- Constants (1A/1B): R = 8.314 J/(mol·K) = 0.0821 L·atm/(mol·K), N_A = 6.022×10²³, h = 6.626×10⁻³⁴ J·s,
  c = 2.998×10⁸ m/s, 0 °C = 273.15 K, 1 atm = 760 torr, F = 96,485 C/mol.
- 1A data sheet also gives: E_n = −2.179×10⁻¹⁸ J/n², λ = h/mv, d = PM/RT, Graham's law, u_rms, ΔT = iKm, Π = iMRT,
  Raoult, Henry, Hess ΔH°f sums. 1B: integrated rate laws, t½ = 0.693/k, Arrhenius two-point, Kp = Kc(RT)^Δn,
  Henderson–Hasselbalch, ΔG = ΔH − TΔS, ΔG° = −RT ln K, ΔG° = −nFE°, Nernst (0.0592/n), E = mc².
- 3A/3B: periodic table only (3A sheet also lists d = m/V, K = °C + 273.15, q = mcΔT, gas laws with R = 0.0821,
  M, M₁V₁ = M₂V₂, % m/v, pH relations, half-life fraction). Anything else must be given in the stem or be expected memory.

## Course scope (judge each item against ITS course)
- **3A** intro/preparatory chemistry (allied-health; first half of a GOB sequence): measurement, sig figs, atoms,
  basic electron arrangement, nomenclature, moles, bonding/VSEPR/IMFs at intro level, energy/heat/states, gases,
  solutions, reactions/redox basics, stoichiometry, acids/bases/pH, rates/equilibrium (qualitative + simple K),
  nuclear. NOT 1A depth (no quantum numbers beyond basic, no ICE-table quadratics, no Hess's-law cycles beyond simple).
  Scope notes: `/Users/dan/Desktop/Study Games/Quantum Chemistry/COURSES.md`.
- **3B** GOB organic + biochemistry (allied-health): functional groups, naming, IMFs/properties, isomers,
  intro stereochemistry, simple reaction patterns (3B uses [O]/[H] for oxidation/reduction, no detailed mechanisms),
  carbohydrates, lipids, proteins, enzymes, nucleic acids, metabolism. COR: `/Users/dan/Desktop/Study Games/textbook/tools/COR_outline.md`.
  No majors-level mechanisms, synthesis, or Michaelis–Menten math beyond the qualitative.
- **1A** gen chem I for STEM (OpenStax Chemistry 2e Ch 1–11, includes solutions/colligative properties, IMFs, liquids
  and solids, hybridization and MO theory). **1B** gen chem II (Ch 12–17, 19, 21: kinetics, equilibrium, acid–base,
  buffers/titrations, Ksp, thermodynamics, electrochemistry, coordination, nuclear). Settled by the instructor, do not
  re-raise: 1B keeps a few IMF/water and coordination items; 1B colligative is practice-only.
  Earlier scope notes: `tools/audit-2026-11-13-cor/SCOPE.md`.
- **28A** organic I for majors (ACS first-term organic: structure, nomenclature, acid–base, conformations, stereo,
  SN1/SN2/E1/E2, additions, alkynes, radicals, alcohols/ethers, IR/MS/NMR, synthesis). **28B** organic II (conjugation,
  Diels–Alder, aromaticity, EAS, carbonyl chemistry, acid derivatives, enolates, amines, spectroscopy, synthesis,
  biomolecules). Spec: `tools/organic/AUTHORING.md`. Reference text level: OpenStax Organic Chemistry / Klein.

## For EVERY item check
1. Prompt scientifically correct; 2. right course; 3. topic tag right; 4. exactly one defensible answer;
5. key correct; 6. each distractor wrong for an identifiable reason; 7. needed data supplied or legitimately expected;
8. units, sig figs, rounding right; 9. difficulty `d` reasonable; 10. explanation supports the key (and is itself correct);
11. each why-wrong correctly diagnoses that choice's error (and does not mis-describe the choice);
12. hint helps without giving the answer away; 13. figure/structure/spectrum matches the text (count particles,
check every drawn SMILES, stereo, charges, NMR signal counts/splitting/integration vs structure, IR/MS peaks vs structure);
14. near-duplicate of another item in your packets (note the id); 15. wording clear and accessible.

**Every quantitative item (calc=1, or any item whose answer is a number): recompute it independently in Python**
from the stem data (do not parse the key and back-solve). Check the stoichiometry, logs, signs, units and that
the keyed number is what correct work gives with the game's masses/constants, and that no distractor is ALSO
correct under a reasonable rounding or assumption. Batch several items per Python run to save time.

Roman-numeral (I/II/III) items: judge each statement's truth independently; confirm the keyed combination.

Classify cognitive demand (our working scale, not an ACS taxonomy):
1 recall/recognition · 2 understanding/interpretation · 3 application/analysis (unfamiliar system, compare conditions)
· 4 higher-order integration (combine several ideas, evaluate evidence, justified prediction).

## Output (write both files; do not edit anything in the repo)
1. Ledger, one JSON object per line for EVERY item, to `tools/audit-2026-11-18-acs/ledger/<packet name>.jsonl`:
```
{"id":"1B-400","cog":3,"sci":"ok","key":"ok","scope":"in","topic":"ok","d":"ok","distractors":"strong",
 "feedback":"good","hint":"good","figure":"ok","dup":"","calc":"Q=1.0e-12 vs Ksp: only Mn(OH)2 precipitates; verified",
 "action":"KEEP","defects":[]}
```
 - sci: ok | minor (wording/precision issue, answer still right) | error (something stated is false) | ambiguous (2+ defensible answers or missing info)
 - key: ok | wrong (keyed answer is not the best answer) ; scope: in | borderline | out ; topic: ok | <better topic key>
 - d: ok | <suggested 1/2/3> ; distractors: strong | ok | weak (implausible/giveaway) | flawed (a distractor is also right)
 - feedback (EXPL + why-wrong): good | ok | weak (restates, no reasoning) | wrong (contains an error or mis-describes a choice)
 - hint: good | ok | leaks (gives the answer or does the whole setup) | weak ; figure: ok | na | error
 - calc: your independent check result (short), or "na"
 - action: KEEP | REVISE | REPLACE | REMOVE ; defects: short specific strings with evidence
2. Proposed fixes for every REVISE you can fix by text edits, as a JSON array in `tools/audit-2026-11-18-acs/fixes-proposed/<packet name>.json`:
```
[{"id":"1B-400","field":"w","old":"<exact stored text>","new":"<corrected text>","why":"<evidence>"}]
```
 field: q, h, w, c[0]..c[3], x[1]..x[3] (full-field replacement, exact stored HTML), or `raw` (old/new = a substring
 of the item's stored JSON, for figures, d, t). Keep the key in c[0]. Keep HTML style (<sub>, <sup>, <b>, &lt;).
 Keep choices parallel in length/form (the key must not stand out as longest). Keep the voice: plain, direct, teaching.
 For items needing a new key, a rewritten stem, or replacement, do NOT force it into text fixes: put a complete
 proposed replacement item in the ledger line as `"rewrite": {t,q,c,h,w,x,k,d,...}` with c[0] correct.
 Do not "fix" style preferences; fix real defects (wrong science, wrong numbers, ambiguity, mis-diagnosing feedback,
 leaking hints, mismatched figures, giveaway distractors, scope problems). Improving a weak (recall-only, giveaway)
 item into a sharper application item is welcome when you can do it safely, as a `rewrite`.
3. Final message (short): counts by action, every key=wrong / sci=error / ambiguous / figure=error item with one line
 each, and anything you could not check.

Be thorough and honest. If you could not verify something, say "unverified" in the ledger rather than "ok".
