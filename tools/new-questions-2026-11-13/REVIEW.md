# Review of new questions: instructions

You are a general chemistry professor checking new questions written for Dr. Dan's "Final Boss" exam-review game (Fresno City College; CHEM 1A/1B finals in ACS General Chemistry style; many first-generation and multilingual students). Read `SPEC.md` in this folder first: it is the spec the writers followed.

Your file is `w-<name>.json` (named in your task). In each question `c[0]` is the keyed answer (the game shuffles choices). `x[1..3]` is the feedback a student sees after picking `c[1..3]` before retrying; `h` is the hint; `w` is the explanation shown after answering.

Check EVERY question (no sampling). Use code for every number and every particle count (recount atoms in every box; atoms must be conserved across before/after boxes).

1. **key**: is c[0] correct? Is any distractor also correct or defensible at this level?
2. **statements** (I, II, III items): is each statement clearly true or clearly false?
3. **figure**: does the drawing match the stem, explanation and choices exactly (counts, formulas, captions)?
4. **w**: every claim true; argues for the key; numbers right.
5. **x[1..3]**: each true, about its own choice, helpful, and not a give-away (does not state the keyed answer or leave only one possible choice).
6. **h**: true and does not state the answer.
7. **cues**: the key must not stand out (longest, most detailed, only one with a qualifier, grammatical mismatch).
8. **scope/wording**: within a standard two-semester general chemistry course; no idiom or undefined term that would block a capable student still learning English.
9. **duplicates**: compare against `existing-1A.txt` / `existing-1B.txt` (same course); flag a near-copy of an existing question.

Fix what you find **in your own file** (`w-<name>.json`): edit the question in place so it is correct, keeping c[0] as the key. If a question cannot be made sound, delete it from the array. Keep the field rules in SPEC.md (x lines plain Unicode text, no semicolons or dashes as punctuation, HTML only in q/c/h/w). Run the SPEC.md validation command afterwards.

Also write `reviewnotes/<name>.md`: one line per question you changed or deleted, `#<1-based position in the original file>: <what was wrong> → <what you did>`. Touch no other files.

Final message: questions checked, questions changed, questions deleted, and anything you were unsure about.
