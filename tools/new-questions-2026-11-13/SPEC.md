# Writing new Final Boss questions (CHEM 1A / CHEM 1B): spec

You are a general chemistry professor writing new multiple-choice questions for Dr. Dan's "Final Boss" final-exam review game at Fresno City College (California community college; many first-generation and multilingual students). The 1A and 1B finals are 70 questions in 110 minutes with a periodic table and a data sheet, in the style of the ACS General Chemistry exams. The goal of this batch is more practice in two ACS-style formats that the bank lacks:

- **Statement items ("I, II, III")**: the stem gives three numbered statements and asks which are true (or correct, or would increase X...). Choices are combinations.
- **Particle drawings**: boxes of drawn atoms/molecules (particulate level) that the student must read: mixtures, limiting reactant, before/after reactions, equilibrium mixtures, strong vs weak electrolytes, phases, gas samples, buffers, precipitation, etc.

Write questions at real ACS-exam level: conceptual, one clear best answer, distractors built from real student misconceptions. Mix difficulty: about 30% d=1 (easy), 45% d=2 (medium), 25% d=3 (hard).

Files in this folder:
- `existing-1A.txt`, `existing-1B.txt`: every existing question (id, topic, stem, key). **Do not duplicate one.** Read the lines for your topics before writing.
- `example-particles-1A.json`, `example-particles-1B.json`: real particle questions from the bank, exact format.

## Output
Write a JSON array to the file named in your task. One object per question, these fields only:

```
{"t":"equilibrium","q":"...","c":["KEY","wrong 1","wrong 2","wrong 3"],"h":"...","w":"...","x":["","feedback for c[1]","feedback for c[2]","feedback for c[3]"],"k":0,"d":2,"f":[...optional figures...],"src":"acs-style"}
```

- `t`: topic key. 1A: measure, atoms, composition, reactions, thermo, quantum, periodic, bonding, advanced, gases, liquids, solutions. 1B: kinetics, equilibrium, acidbase, buffers, solubility, thermo, electro, coordination, imf, colligative, nuclear.
- `q`: the stem. HTML allowed: `<sub>`, `<sup>`, `<b>`, `<br>`. Formulas as H<sub>2</sub>O, charges as SO<sub>4</sub><sup>2−</sup>, use the real minus sign − and arrow →, ⇌.
- `c`: exactly 4 choices, **c[0] is always the correct answer** (the game shuffles them). Similar length and style; the key must not be the longest or most detailed choice. No "all of the above"/"none of the above". Never refer to positions or letters ("choice A", "the first answer"), because choices are shuffled.
- `h`: hint shown before answering: one or two sentences, true, points to the idea, does not state the answer.
- `w`: explanation shown after answering: says why the key is right and, briefly, why the main wrong choices are wrong. Bold the answer with `<b>...</b>`. 2 to 5 sentences.
- `x`: x[0] is "". x[1..3] are the feedback lines for c[1..3], shown when a student picks that wrong choice before retrying. One or two short sentences each, true, about **that** choice's mistake, plain words, **must not state the correct answer or leave only one possible choice**. Plain text with Unicode formulas (H₂O, CO₃²⁻, 10⁻³), no HTML, no semicolons, no dashes as punctuation.
- `k`: 1 if the student must calculate a number, else 0.
- `d`: 1, 2 or 3.
- `f`: optional list of figures (only when needed). `src`: always "acs-style".

## Statement-item format
Stem example:
`Which statements about a catalyst are true?<br>I. It lowers the activation energy of the forward reaction.<br>II. It increases the equilibrium constant.<br>III. It speeds up the reverse reaction as well as the forward reaction.`
Choices are combinations such as "I only", "III only", "I and II only", "I and III only", "II and III only", "I, II and III". Pick 4. Each wrong choice must be wrong because of a specific statement; its x line names which statement was misjudged and why (e.g. "Statement II is false: a catalyst does not change K." is fine, it does not reveal the full key). Vary which combination is right across your set (not always "I and III only"). Each statement must be clearly true or clearly false at the course level.

## Particle figure format
```
{"type":"particles","seed":12,"arrow":true,
 "key":{"A":{"c":"#e0675a","n":"A atom"},"B":{"c":"#3b82b4","n":"B atom","r":8},"H":{"c":"#e8edf1","n":"H","r":7}},
 "boxes":[{"cap":"Before","mols":[["A","A"],["B","B"],["B","B"]]},{"cap":"After","mols":[["A","B"],["A","B"],["B","B"]]}]}
```
- `key`: one entry per atom kind. `c` fill color, `n` legend name (omit `n` to keep it out of the legend), optional `r` radius (default about 11; use 7–8 for H), optional `q` one-character label drawn on the atom (e.g. "+" or "−" for ions).
- `mols`: each molecule is a list of atom keys drawn bonded together: ["A"] single atom, ["A","B"] diatomic, ["O","H","H"] bent triatomic (first atom in the middle). Add `"lin":true` to the central atom's key entry to draw its 3-atom molecules straight (CO₂: key "C":{"c":"#555","n":"C","lin":true}, molecule ["C","O","O"]); a `lin` key applies to every molecule centered on that atom kind. 4–5 atom molecules (["N","H","H","H"]) are drawn with the rest spread around the first atom. Keep molecules to at most 5 atoms. Ions: single atoms with a `q` label, e.g. "Na":{"c":"#9b7fd1","n":"Na⁺","q":"+"}.
- `boxes`: 1 to 4 boxes. `cap` caption under each box (e.g. "Before", "After", "I", "II", "t = 0", "Equilibrium"). `"water":true` tints a box light blue (solution). `"arrow":true` draws arrows between boxes (reaction before/after); leave it out for side-by-side comparisons.
- Keep each box to at most 20 particles. Count every particle you place: the explanation and choices must match the drawing exactly.
- Colors: use clearly different colors: #e0675a (red), #3b82b4 (blue), #f2c14e (yellow), #5aa469 (green), #9b7fd1 (purple), #e8edf1 (white-gray, for H), #555 (dark gray).
- Other figure types you may use: `{"type":"eq","text":"2 NO(g) + O<sub>2</sub>(g) ⇌ 2 NO<sub>2</sub>(g)"}` for an equation line, `{"type":"table","head":["A","B"],"rows":[["1","2"]]}` for a small table.

## Checking (required)
- Use code (`node -e` or `python3 -c` through Bash) for every number and every particle count. Recount atoms on both sides of every before/after drawing (atoms are conserved).
- Re-read each question as a student: exactly one choice is defensible, no distractor is also correct, the stem says what is asked.
- Stay within a standard two-semester general chemistry course (OpenStax Chemistry 2e level). 1A: measurement through solutions (including colligative properties, gases, IMFs of liquids/solids, bonding, MO and hybridization). 1B: kinetics, equilibrium, acids/bases, buffers/titrations, Ksp, thermodynamics (entropy, free energy), electrochemistry, coordination, nuclear, IMFs and water.
- Validate the file: `node -e "const a=JSON.parse(require('fs').readFileSync('FILE','utf8'));for(const q of a){if(q.c.length!==4||q.x.length!==4||q.x[0]!=='')throw new Error(q.q)};console.log(a.length)"`.
- Touch no other files.

Final message: number written, how many of each format, count per topic, and any question you are unsure about.
