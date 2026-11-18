# Final Boss 1A/1B: figure and structure formats (authoring reference)

Every question may carry drawings in two fields:
- **`f`**: a list of figures (the types below);
- **`s`**: structures drawn inside the stem (Lewis or skeletal).

Choices can be drawings too: **`cs`**, one structure per choice in the same order as `c`, with `c[k]` set to a
short text label for screen readers.

Each figure also takes an optional `"cap"` caption. Most take `"items":[…]` to draw several side by side, each item
with its own `cap` ("I", "II", "III", …). Text fields accept `<sub>`, `<sup>` and Unicode (H₂O, ⁻, °, Δ, ⇌, →).

Draw only what the student must read; the stem still has to say in words what is drawn (screen readers).

---

## Structures

### Lewis structure (`s`, or `cs` for structure choices)
```json
{"a":[["O",0,0,2,0,""],["C",1,0,0,0,""],["O",2,0,2,0,""]],"b":[[0,1,2],[1,2,2]],"cap":"I"}
```
- `a`: one entry per atom, `[element, x, y, lonePairs, charge, label]`.
  - `x`, `y` are grid units (1 = one bond length, y grows downward).
  - `lonePairs` 0–4 are drawn as dot pairs.
  - `charge` is a formal charge (−1, +1, …).
  - `label` is "" or a letter tag ("a", "b") the stem can refer to ("atom b").
- `b`: bonds `[i, j, order]` with order 1, 2 or 3.
- `"br":"2−"` draws brackets with that charge (polyatomic ions such as CO₃²⁻).
- **Count every valence electron yourself.** The drawing shows exactly what you write: lone pairs, bonds, charges.
- Resonance: give several structures in `s` with `"cap":"I"` etc. and put `"↔"` strings between them
  (`"s":[{…},"↔",{…}]`).

### Skeletal or condensed organic (`s`)
`{"smi":"CC(=O)O","cap":"acetic acid"}` draws a SMILES string as a skeletal structure (gen chem uses it rarely:
functional-group ID, isomers). Atom maps such as `[CH3:1]` are NOT supported in 1A/1B; to point at a labeled
atom, draw a Lewis structure with the `label` field instead.

---

## New in this batch

### Unit cell / crystal lattice: `lattice`
```json
{"type":"lattice","kind":"fcc","cap":"face-centered cubic"}
{"type":"lattice","kind":"nacl","labels":{"A":"Cl⁻","B":"Na⁺"},"cap":"NaCl"}
{"type":"lattice","items":[{"kind":"sc","cap":"I"},{"kind":"bcc","cap":"II"},{"kind":"fcc","cap":"III"}]}
```
- `kind`: `sc` (simple cubic), `bcc`, `fcc`, `nacl` (rock salt: A at the fcc sites, B at the edge centers and body
  center), `cscl` (A at the corners, B at the body center).
- `labels` names the two ions in the legend for `nacl`/`cscl`. `edge:"a"` labels the cube edge.
- The drawing is a cube with hidden edges dashed and back atoms faded. **It does not show coordination
  numbers or fractions; the student works them out.**
- Use it for: atoms per unit cell (1, 2, 4), coordination number (6, 8, 12), formula from a lattice, edge length
  vs radius (sc a = 2r, bcc 4r = a√3, fcc 4r = a√2), density from a cell, and identifying the lattice type.

### Hybrid orbitals: `hybrid`
```json
{"type":"hybrid","kind":"sp2","p":true,"atom":"C","cap":"sp²"}
{"type":"hybrid","items":[{"kind":"sp","p":true,"atom":"C","cap":"I"},{"kind":"sp3","atom":"N","cap":"II"}]}
```
- `kind`: `sp`, `sp2`, `sp3`, `sp3d`, `sp3d2`. The blue lobes are the hybrids, in the right geometry.
- `"p":true` adds the unhybridized p orbitals in yellow (one for sp², two for sp).
- `atom` is the letter in the center. `"legend":false` hides the blue/yellow legend.
- Use it for: "Which hybridization is shown?", "How many unhybridized p orbitals remain?", σ/π bond formation,
  matching a drawing to a molecule.
- **Orbital box diagrams of hybridization** use `orbitals` with hybrid names (below), e.g. boxes named "sp³".

### 3D molecular shape (VSEPR): `vsepr`
```json
{"type":"vsepr","shape":"seesaw","center":"S","lig":"F","cap":"SF₄"}
{"type":"vsepr","shape":"bent","e":4,"center":"O","lig":"H","angle":"104.5°"}
{"type":"vsepr","items":[{"shape":"trigonal pyramidal","center":"N","lig":"H","cap":"I"},
                         {"shape":"trigonal planar","center":"B","lig":"F","cap":"II"}]}
```
- `shape`: linear, trigonal planar, bent, tetrahedral, trigonal pyramidal, trigonal bipyramidal, seesaw, T-shaped,
  octahedral, square pyramidal, square planar.
- `e`, only when the shape is ambiguous: `bent` with `"e":3` (one lone pair, like SO₂) or `"e":4` (two, like
  H₂O, the default); `linear` with `"e":5` (three equatorial lone pairs, like XeF₂ or I₃⁻; default `"e":2`).
- `center`: the central atom. `lig` is one symbol for every ligand, or a list in drawing order
  (`["Cl","F","F","F"]`) for mixed ligands.
- Lone pairs are drawn in their real positions (equatorial in trigonal bipyramidal, axial in octahedral).
  `"lp":false` hides them, e.g. to ask "how many lone pairs must the central atom have?".
- Wedges come toward the viewer and dashes go away. `angle` prints a bond-angle label.

---

## Existing figure types

### Molecular orbitals
- **One MO picture**: `{"type":"mo","kind":"pi_p","cap":"I"}` or `{"type":"mo","items":[{"kind":"sigma_p","cap":"I"},{"kind":"pistar_p","cap":"II"}]}`.
  - Kinds: `s`, `p_x`, `p_y` (atomic orbitals), `sigma_s`, `sigmastar_s`, `sigma_p`, `sigmastar_p`, `pi_p`, `pistar_p`.
  - The picture shows the lobes, phases and nodes.
- **MO energy diagram, period 2 diatomics**: `{"type":"modiag","order":"N2","e":10,"title":"N<sub>2</sub>"}`.
  - `order`: `"N2"` (π2p below σ2p, for B₂, C₂, N₂) or `"O2"` (σ2p below π2p, for O₂, F₂, Ne₂).
  - `e`: the number of valence electrons (2s + 2p), filled by the game with Hund's rule.
  - Ions: just change `e` (O₂⁻ is `"order":"O2","e":13`). Use it for bond order, magnetism and HOMO questions.

### Orbital box (electron configuration) diagrams: `orbitals`
```json
{"type":"orbitals","subs":[{"name":"4s","boxes":["ud"]},{"name":"3d","boxes":["u","u","u","",""]}]}
{"type":"orbitals","items":[{"subs":[{"name":"sp³","boxes":["ud","u","u","u"]}],"cap":"I"}]}
```
- `boxes`: `"ud"` paired, `"u"` one up, `"d"` one down, `""` empty.
- `"stack":true` draws the subshells as stacked energy levels instead of a row. Crystal-field t₂g/e_g splitting
  diagrams are drawn this way.
- Hund's rule and Pauli violations make good wrong choices: `"uu"` draws two up arrows in one box.

### Equations and tables
- `{"type":"eq","text":"2 Al(s) + 3 Cu<sup>2+</sup>(aq) → 2 Al<sup>3+</sup>(aq) + 3 Cu(s)"}`: one equation line,
  with states. Use ⇌ for equilibria and ΔH° = … after the equation if needed.
- `{"type":"table","head":["Trial","[A] (M)","Rate (M s⁻¹)"],"rows":[["1","0.10","2.0×10⁻³"]]}`: data tables
  (kinetics trials, Ka/Ksp values, E° tables, bond energies, ΔH°f, vapor pressures).

### Graphs: `plot`
```json
{"type":"plot","x":{"label":"Volume of NaOH added (mL)","min":0,"max":50,"ticks":[0,10,20,30,40,50]},
 "y":{"label":"pH","min":0,"max":14,"ticks":[0,2,4,6,8,10,12,14]},
 "series":[{"pts":[[0,2.9],[5,3.8],[12.5,4.74],[20,5.3],[24,6.1],[25,8.7],[26,11.3],[30,12.0],[50,12.5]]}],
 "points":[[12.5,4.74,"A",-14,-8],[25,8.7,"B",8,4]],"grid":true,"mono":true}
```
- `series`: a list of curves, each `{"pts":[[x,y],…]}`. Options: `"label"` (legend), `"dots":true`,
  `"dotsOnly":true`, `"bars":true` with `"barW":0.6`, `"color":"#3b82b4"`.
- `points`: labeled points `[x, y, "A", dx, dy]` (dx, dy shift the label in pixels).
- `marks`: free text labels `[x, y, "text"]` placed in the plot.
- `hlines`/`vlines`: `[{"y":-5.4,"label":"n = 2"}]` / `[{"x":25,"label":"equivalence"}]`.
- `regions`: shaded areas `{"pts":[[x,y],…],"fill":"#…","label":"solid","at":[x,y]}` (phase diagrams).
- `"grid":true` adds gridlines; `"mono":true` keeps it single-color.
- **Use it for:** titration curves, phase diagrams, heating curves, Maxwell–Boltzmann speed distributions,
  [A] vs t, ln[A] vs t and 1/[A] vs t, Arrhenius plots, vapor pressure curves, solubility vs T, PV relations,
  ionization-energy trends, species-fraction plots, hydrogen energy levels with transition arrows.
- **Put enough points on curves** (every 1–2 units on steep parts) so they look smooth. Compute the points with
  code; never sketch them by hand.

### Reaction energy diagram: `energy`
```json
{"type":"energy","levels":[0,80,30,55,-20],"tags":["","A","B","C",""],"labels":["reactants","","intermediate","","products"]}
```
- `levels` alternate minimum, maximum, minimum, … in relative energy.
- `tags` letter-label points; `labels` print text under the points.
- `xlab`/`ylab` override the axis titles (default "Reaction coordinate" / "Potential energy").
- Use it for: Ea vs ΔH, catalyzed vs uncatalyzed paths (two diagrams in `f`), rate-determining step, intermediate
  vs transition state.

### Particle (particulate-level) drawings: `particles`
See `../new-questions-2026-11-13/SPEC.md` ("Particle figure format") for the full rules.
```json
{"type":"particles","arrow":true,"seed":3,
 "key":{"N":{"c":"#3b82b4","n":"N"},"H":{"c":"#e8edf1","n":"H","r":7}},
 "boxes":[{"cap":"Before","mols":[["N","N"],["H","H"],["H","H"],["H","H"]]},{"cap":"After","mols":[["N","H","H","H"],["N","H","H","H"]]}]}
```
- Ions use `"q":"+"`; `"water":true` tints a box (aqueous solution).
- **Count every particle with code.** Atoms are conserved across arrows.

### Electrochemical cell: `cell`
```json
{"type":"cell","left":{"metal":"Zn","sol":"1 M Zn²⁺(aq)","label":"A","color":"#b8c2cc"},
 "right":{"metal":"Ag","sol":"1 M Ag⁺(aq)","label":"B","color":"#d9dde1"},"volt":"?","eflow":"lr","ions":"lr"}
```
- `volt` is the meter text. `"eflow":"lr"` or `"rl"` draws the electron-flow arrow in the wire.
- `"ions":"lr"` labels salt-bridge ion flow (cations → toward the right).
- `"hide":["sol"]` hides the solution labels (ask the student to supply them).

### Others
- **Line spectrum**: `{"type":"spectrum","min":380,"max":720,"lines":[[410,"I"],[486,"II"],[656,"III"]],"visible":true}`.
  Several spectra go in `items`.
- **Periodic-table outline with marked cells**: `{"type":"ptgrid","periods":5,"cells":{"X":[3,2],"Y":[3,17]}}`.
  Cells are `[period, group]`, so the student identifies the elements from their positions.
- **Lab measurement scales**: `cylinder` / `buret` / `ruler` (`lo`, `hi`, `minor`, `major`, `level` or `len`,
  `unit`), `balance` (`read`), `targets` (accuracy vs precision).

---

## Checks
- `node tools/validate_bank.js` reports unknown figure types and field problems after appending.
- Figures are checked visually in the game before release, so keep them inside the formats above. Unknown keys
  are ignored, not drawn.
