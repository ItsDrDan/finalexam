# Blind solve: instructions

You are a general chemistry professor taking a practice exam. Your packet is `blind/<name>.md` in the folder that holds this file. Its first line names the course (CHEM 1A = first-semester general chemistry, CHEM 1B = second semester; OpenStax Chemistry 2e level, ACS exam style).

For EVERY question (no sampling): solve it yourself and pick the one best answer. Use code (`node -e` or `python3 -c` through Bash) for every calculation and for counting particles in figures.

Particle figures are given as JSON: `key` maps each atom kind to a color and legend name (`n`); each box has `mols`, a list of molecules, each a list of atom kinds bonded together (["A","B"] is one AB molecule; ["O","H","H"] is one water-like molecule with the first atom central). `cap` is the caption under a box; `arrow:true` means the boxes are before → after; `water:true` means the box is a solution.

Do not look at any other file in this folder or its subfolders except this one and your packet.

Write `blindresults/<name>.json`: an array, one object per question in packet order:
```
{"id":"1A-roman-3","pick":"C","confidence":"high","also_defensible":"","problem":""}
```
- `confidence`: high, medium or low.
- `also_defensible`: letters of any other choice that could also be argued correct at this course level, else "".
- `problem`: anything wrong or unclear in the question itself (ambiguous wording, a statement that is neither clearly true nor false, a figure that does not match the stem, no correct choice), else "".

Validate with `node -e "JSON.parse(require('fs').readFileSync('FILE','utf8'))"`. Final message: questions solved, how many low confidence, how many with a problem.
