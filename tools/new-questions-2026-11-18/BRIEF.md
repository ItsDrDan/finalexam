# Batch 2026-11-18: ACS-style Roman-numeral (I, II, III) items for CHEM 1A, 1B, 3A, 3B

Read `../new-questions-2026-11-13/SPEC.md` first and follow it exactly: the JSON fields, choice rules, `x` rules,
checking and the "Statement-item format" section. This batch writes **statement items only**. Particle drawings
are optional, inside an item, when they help.

What's in this folder:
- `existing-<course>.txt`: every current question (id, topic, stem, key). Don't duplicate one; read your
  topics first.
- `example-roman-<course>.json`: real I/II/III items already in the bank, in the exact format.

Item variety (aim for a mix):
- **Statements:** "Which statements are true?"
- **Conditions:** "Which changes would increase X?"
- **Species:** three formulas or structures labeled I–III, asking "Which are polar / are buffers / are
  aromatic…?"
- **Rankings:** order three items. Choices are orders like "II < I < III".

Rules:
- Use the house style "I, II and III" (no Oxford comma), as the existing 1A/1B items do.
- Spread the keys. "I, II and III" plus "I and II only" may be the answer at most 25% of the time, and no single
  combination may be the answer more than 30% of the time.
- `w` must judge **every** numbered statement: I true because…, II false because…, III true because….
- Each `x[k]` names the statement that choice misjudges, and why. It must not reveal the full key.

Level per course:
- **1A / 1B:** ACS General Chemistry exam level, as in SPEC.md.
- **3A:** intro (preparatory) chemistry, the general-chemistry part of a GOB course. Topics: measure, atoms,
  electrons, matter, naming, moles, bonding, energy, gases, solutions, reactions, stoich, acids, equilibrium,
  nuclear. Keep statements simpler (one idea each) and the reading load light.
- **3B:** GOB organic + biochemistry. Topics: structure, hydrocarbons, aromatic, alcohols, carbonyls, chirality,
  acids_esters, amines, carbs, lipids, proteins, enzymes, nucleic, metabolism, isomers, properties.
  - Structures may go in `s` as `{"smi":"SMILES","cap":"I"}` parts (the game draws SMILES). Grep index.html for
    `"smi"` inside bank-3B to see the format used there.
  - Keep it at the CHEM 3B level: no majors-level mechanisms.

Write only your own file, named in your task. Don't edit index.html or any other file.

Validate your file with the command in SPEC.md. Then report:
- the count per topic;
- the key spread;
- any item you are unsure about.
