# v61: 295 original CHEM 1A/1B questions modeled on the ACS General Chemistry Official Guide (2026-11-18)

**What it is.** New questions written to match what the ACS General Chemistry exam tests and how it asks it,
using *Preparing for Your ACS Examination in General Chemistry: The Official Guide* as the model.
- Nothing is copied from the guide. Writers logged a fingerprint for every Study and Practice Question, and no new
  item reuses one. The fingerprints and the guide pages stay outside the repo.
- Every item is original chemistry, numbers and drawings.

**Files.**
- `w-1A-ch01…ch08.json` (155 questions, appended as 1A-676 to 1A-830) follow guide chapters 1–8.
- `w-1B-ch09…ch16.json` (140 questions, appended as 1B-604 to 1B-743) follow guide chapters 9–16.
- `FIGURES.md` documents every figure and structure format, including the three new ones.
- `existing-1A.txt` and `existing-1B.txt` are the bank before this batch, used for the duplicate checks.

**Drawings.** About 90% of the new items carry a figure, Lewis structures or structure choices. The new figure
types in index.html are:
- `lattice`: sc, bcc, fcc, NaCl and CsCl unit cells;
- `hybrid`: sp to sp³d² hybrid orbital sets, with unhybridized p orbitals;
- `vsepr`: all 11 shapes, drawn with wedges, dashes and lone pairs.

The batch also uses MO pictures and diagrams, orbital boxes, particle drawings, graphs (titration, phase,
heating, Maxwell–Boltzmann, kinetics, decay), galvanic cells, spectra, written equations and tables.

**Checks.**
1. **Writers:** eight writers worked two guide chapters each, and every number, particle count and electron count
   was checked in code.
2. **Originality audit:** two independent auditors compared every item with the guide and the bank. 29 items were
   cut (copies of a guide item, or duplicates of a bank or batch item), and one was rewritten.
3. **Blind solve:** all 322 drafts were solved blind. There were 3 key mismatches; on review all 3 were solver
   errors, and the keys stand. Two flags led to wording or drawing fixes.
4. **Game:** `tools/validate_bank.js` reports 0 errors and 0 warnings. Every new item was clicked through in the
   game at 1440, 375 and 320 px, and the full 1A/1B banks were rescanned at 320 px. Lattice, hybrid and VSEPR items
   were checked with real taps on the iPhone simulator.

**Shared drawing fixes in this release.**
- On wide screens, labels drawn past a graph's frame now widen the frame instead of being cut off. Phones already
  did this.
- Line spectra leave more room between the tick numbers and the axis title.
- The salt-bridge ion labels on a cell no longer overlap each other.
