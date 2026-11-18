# Writing CHEM 28A / 28B questions for Final Boss

CHEM 28A and 28B are the two-semester **organic chemistry for chemistry majors** sequence at Fresno City College
(prerequisite CHEM 1B). Each course ends with a required **ACS standardized exam** (28A: ACS first-term organic,
Official Guide chapters 1–10; 28B: the full-year organic exam, whose added material is chapters 11–16).
These banks are practice for those finals. Pitch: a strong sophomore organic course (Klein / McMurry / OpenStax
Organic Chemistry level), the reasoning depth of an ACS organic exam. This is **much harder than CHEM 3B**
(the GOB course in the same game): use real reagents (NaBH₄, LiAlH₄, PCC, mCPBA, OsO₄, BH₃·THF, LDA, …), stereo-
chemistry, mechanisms, multistep synthesis and spectra.

**Reference text:** OpenStax *Organic Chemistry* (McMurry, 10th ed., the OER text on both CORs, https://openstax.org/details/books/organic-chemistry). Use it to check scope, reagent conventions, typical values (pK<sub>a</sub>, IR/NMR ranges, A-values) and naming, so questions match what students read. Do not copy its worked examples or end-of-chapter problems.

**Every question must be original.** Do not copy or lightly reword items from ACS materials, textbooks or the
web. You may use any standard chemistry fact. Keep the ACS *style*: four choices, one best answer, often a drawn
structure, a reaction scheme, a ranking (I < II < III), or a Roman-numeral statement set.

## File format

Write a JSON array to `tools/organic/src/<course>-<topic>-<n>.json` (e.g. `28A-subst-1.json`, `28A-subst-2.json`;
about 15–20 questions per file). Each question:

| field | meaning |
|---|---|
| `t` | topic id (below) |
| `q` | stem. HTML allowed: `<b> <i> <sub> <sup> <br>`. Use real subscripts: CH<sub>3</sub>, S<sub>N</sub>2, <sup>1</sup>H, <sup>13</sup>C |
| `c` | 4 choices, **`c[0]` is the correct answer** (the game shuffles). Text, or `"§A"…"§D"` for structure-only choices |
| `cs` | optional: 4 structures drawn under the choices, `{"smi": "..."}` each (use `null` for a choice without one) |
| `s` | optional: structures / reaction scheme drawn under the stem (see below) |
| `f` | optional: figures (Newman, chair, energy diagram, NMR/IR/MS spectrum, table, Fischer) |
| `h` | hint: a nudge toward the method, never the answer |
| `w` | explanation shown after answering: full reasoning, the answer in `<b>…</b>`, and why the tempting traps fail |
| `x` | `["", why c[1] is wrong, why c[2] is wrong, why c[3] is wrong]` — specific to that choice, 1–2 sentences each |
| `k` | 1 only if a calculator is needed (optical rotation / ee, radical product ratios, M+2 ratios); else 0 |
| `d` | difficulty 1 (direct recall/one step), 2 (typical exam item), 3 (multi-step reasoning). Aim ≈ 20% / 50% / 30% |
| `id` | optional short id for your own tracking, e.g. `"subst-07"` (stripped at build) |

Style rules
- Stems are one clear question. No "all of the above", no "none of the above".
- Distractors must be the mistakes students actually make (wrong regiochemistry, wrong stereochemistry, SN1 vs SN2
  mix-up, Markovnikov vs anti-Markovnikov, carbocation rearrangement missed, wrong ring size, over-oxidation…).
- Make choices parallel in form and length so the key does not stand out.
- `w` and `x` are teaching text: name the rule, then apply it to this molecule. Don't say "obviously".
- Numbers: plain numbers, sig figs sensible; scientific notation only when tiny/huge.
- Use "(" "°" "→" "⇌" "δ" "ppm" "cm<sup>−1</sup>" "m/z" consistently. Write alkyl halide reactions with real reagents.
- Reagent sequences: `1. BH<sub>3</sub>·THF  2. H<sub>2</sub>O<sub>2</sub>, NaOH` (numbered steps).
- At least **half of each topic's questions should show structures** (`s` or `cs`), because the real exam is drawn.

## Structures: SMILES

Every drawn structure is a SMILES string; the build turns it into a skeletal (bond-line) drawing with wedges and
dashes. **Stereochemistry you write in the SMILES is exactly what students will see**, so check it.

- Stereocenters `[C@H]` / `[C@@H]`, alkenes `C/C=C/C` (E) and `C/C=C\C` (Z). Aromatic rings `c1ccccc1` are fine.
- Charges: `[O-]`, `[NH3+]`, carbocation `[CH+]`, `[C+]`, carbanion `[CH2-]` (drawn as a circled + or − on the carbon).
- Radicals: `[CH2]`, `[CH]`, `[C]` with the right number of missing H, e.g. tert-butyl radical `C[C](C)C`, allyl radical `C=C[CH2]` (drawn with a dot). Check with `chem.py info`.
- Tag atoms for "which atom/hydrogen" questions with atom maps: `C[CH2:1]C(=O)[CH3:2]` draws orange circled
  **a** and **b** on those carbons. Refer to them in the stem as <i>a</i>, <i>b</i>…
- Abbreviations: write `[1*]`, `[2*]` and give `"ab": ["OTs", "Ph"]` in the same part: `{"smi": "C[C@H]([1*])CC", "ab": ["OTs"]}`.
  Prefer full structures except for OTs/OMs/Ph/Bn/Boc/TMS/TBS/OAc.
- Optional per structure: `"cap": "I"` caption under it, `"flip": true` mirror the drawing left↔right (does NOT
  change the molecule), `"rot": 30` rotate the drawing.

`s` reaction scheme: a list of parts, each a structure `{"smi": ...}`, a string (`"+"`, `"?"`), or an arrow
`{"arrow": "1. O<sub>3</sub>", "below": "2. (CH<sub>3</sub>)<sub>2</sub>S"}`.
Example: `"s": [{"smi": "CC(C)=C"}, {"arrow": "HBr", "below": "ROOR, hν"}, "?"]`.

## Figures (`f`, a list)

- **Newman** `{"type":"newman","front":["CH<sub>3</sub>","H","H"],"back":["Br","H","H"],"rot":60,"cap":"I"}`
  front[0] points straight up, front[1] lower-left, front[2] lower-right. Each back[i] sits at front[i]'s position
  turned **clockwise** by `rot` degrees: 60 = staggered (back[0] upper-right, back[1] upper-left, back[2] down),
  0 = eclipsed, 180 puts back[0] straight down (anti to front[0]). Several: `{"type":"newman","items":[{...},{...}]}`.
- **Chair** `{"type":"chair","subs":[[1,"up","CH<sub>3</sub>"],[3,"down","OH"]],"flip":false,"nums":true,"cap":"I"}`
  You give only up/down (wedge/dash sense) per ring carbon; the drawing puts it axial or equatorial. Convention:
  chair A (`flip:false`) has axial **up** at C1, C3, C5 and axial **down** at C2, C4, C6; `flip:true` is the ring-
  flipped chair. Check with `chem.py chair "1:up:CH3,3:down:OH"`. Use `items` for two chairs side by side.
- **Energy diagram** `{"type":"energy","levels":[0,24,6,14,-8],"tags":["","A","B","C",""],"labels":["reactants","","","","products"]}`
  levels alternate minimum, maximum, minimum… (relative energies, no units shown).
- **¹H NMR** `{"type":"nmr","nuc":"1H","peaks":[{"ppm":4.12,"mult":"q","int":2},{"ppm":2.05,"mult":"s","int":3},{"ppm":1.26,"mult":"t","int":3}]}`
  `mult`: s, d, t, q, quint, sext, sept, dd, m, br s. `int` = relative integration (shown as "2H").
- **¹³C NMR** `{"type":"nmr","nuc":"13C","peaks":[{"ppm":171.1},{"ppm":60.4,"lab":"CH<sub>2</sub>"}]}` (optional DEPT `lab`).
- **IR** `{"type":"ir","bands":[{"cm":3350,"shape":"broad","str":"s"},{"cm":2960,"str":"m"},{"cm":1715,"str":"s"}]}`
  `shape` broad|sharp (default sharp), `str` s|m|w. The curve shows 4000–500 cm<sup>−1</sup>.
- **Mass spectrum** `{"type":"ms","peaks":[[43,100],[58,22],[15,8]],"labels":{"58":"M<sup>+</sup>"}}` (m/z, relative %).
- **Table** `{"type":"table","head":["Compound","pK<sub>a</sub>"],"rows":[["I","4.8"],["II","16"]]}`.
- **Fischer** `{"type":"fischer","top":"CHO","rows":[["H","OH"],["HO","H"]],"bottom":"CH<sub>2</sub>OH"}` (rows = [left,right]).
- **Equation text** `{"type":"eq","text":"CH<sub>3</sub>Br + CN<sup>−</sup> → ..."}`.

## Curved arrows (mechanisms)

A structure part (in `s` or `cs`) can carry electron-pushing arrows and lone pairs:

    {"smi": "[OH-:51].[CH3:52][Br:53]", "lp": true,
     "arrows": [{"from": 51, "to": 52}, {"from": [52, 53], "to": 53}]}

- **Anchors:** give every atom an arrow touches an atom map **51–99** (`[CH3:52]`, `[O-:51]`, `[C:60]`). Maps 51+ are
  invisible; maps 1–26 still draw lettered tags (a, b, …) and can also be arrow ends.
- **Arrow ends:** a number = that atom; `[m1, m2]` = the middle of the bond between those two atoms.
  - from a **lone pair**: `"from": 51` (the atom must show lone pairs, see `lp`); the arrow starts at the lone pair facing the target.
  - from a **bond** (σ or π): `"from": [52, 53]`.
  - to an **atom** (new bond to it, or the bond's electrons land on it as a lone pair): `"to": 52`.
  - to a **bond** (a π bond forms there): `"to": [52, 53]`; the two atoms must already be bonded in the drawing.
  - `"half": true` = fishhook (one electron, radicals). `"side": 1` or `-1` flips which way an arrow bows if the default looks wrong.
- **Lone pairs:** `"lp": true` draws every lone pair on N, O, S, halogens and carbanions (counted from the structure);
  `"lp": [51, 53]` draws them only on those mapped atoms. Arrows from a lone pair need it drawn.
- **Explicit hydrogens:** in a part with arrows, `[H:54]` is kept as a drawn H (needed for E2, acid–base and
  deprotonation arrows): `CC[O-:51].[H:54][CH2:52][CH:53](C)[Br:55]`.
- **Fragments:** separate species with `.`; they are drawn left to right in the order written (put the nucleophile
  or base on the side it attacks from: for S<sub>N</sub>2 write the nucleophile first and the C–LG with LG last).
- **Cyclic transition states** (Diels–Alder, Cope, Claisen, β-keto acid decarboxylation, any six-electron ring of
  arrows): add `"layout": [[m1, m2], [m3, m4]]`, the pairs of mapped atoms whose bonds are FORMING. The drawing is laid
  out as if those bonds existed, so the six reacting atoms sit on a ring the way textbooks draw it; the bonds themselves
  are not drawn. Example (Diels–Alder): `"smi": "[CH2:51]=[CH:52][CH:53]=[CH2:54].[CH2:55]=[CH:56]C(=O)C",
  "layout": [[54, 55], [56, 51]]`.
- Draw **one step** per drawing (the step the question is about). Show the intermediate or product of that step as a
  separate structure if needed, e.g. `"s": [{...with arrows...}, {"arrow": ""}, {"smi": "product"}]`.
- **"Which arrows are correct?"** items: four `cs` drawings of the same species with different arrows. The check accepts
  identical molecules there as long as the arrows differ. Good wrong versions are the classic mistakes: an arrow
  starting at the electrophile or a positive charge, the arrow drawn backwards, attack at the wrong atom, a missing
  leaving-group arrow (five bonds to carbon), a full arrow where a fishhook belongs, deprotonating the wrong H.
- Keep drawings small (≤ ~20 heavy atoms per part). `build_bank.py check` reports bad anchors, bond ends that are
  not bonds, and correct-looking arrows that start on a heteroatom with no drawn lone pair. (An arrow starting at a
  carbon with no lone pair is allowed, because wrong choices need it.)
- A mechanism question should still read without the arrows for screen readers: the stem says in words what
  happens (the drawings carry an automatic description of each arrow).

Mechanism questions can also ask through intermediates, the rate-determining step, energy diagrams, or
"which species is the electrophile".

## Check your chemistry with the tools (required)

Python with RDKit: `PY=/private/tmp/claude-501/-Users-dan--claude-spares-spare-wY9kSg/ff198a12-f1d3-4c8e-8fe3-95ef508a8f17/scratchpad/venv/bin/python`

    $PY tools/organic/chem.py info "C[C@@H](Br)CC"        # formula, MW, DBE, R/S per atom, E/Z, 13C and 1H signal counts
    $PY tools/organic/chem.py rel  "SMILES1" "SMILES2"    # identical / enantiomers / diastereomers / constitutional
    $PY tools/organic/chem.py chair "1:up:CH3,2:down:Br"   # axial/equatorial in each chair
    $PY tools/organic/chem.py ring "C[C@H]1CCC[C@@H](C)C1" # cis/trans of ring substituents (3D model)
    $PY tools/organic/build_bank.py check tools/organic/src/28A-subst-1.json

- Every R/S, E/Z, isomer-relationship, molecular formula, DBE and NMR-signal-count claim must be confirmed with
  `chem.py`. (The 1H count treats diastereotopic CH₂ protons as one signal; say so in the question if it matters,
  or avoid such cases.)
- For reaction products with stereochemistry (SN2 inversion, anti addition, syn addition, E2 anti-periplanar,
  epoxide opening…), work out the product SMILES and confirm its R/S and relation to the wrong choices with
  `chem.py` before writing the explanation.
- Two structure choices must never be the same compound (the check catches this).
- Bridged bicyclics (norbornanes) draw flat: don't make endo vs exo or other bridged-ring stereochemistry depend on reading the drawing; name it in words instead.
- Run `build_bank.py check` on every file until it reports 0 problems.

## Topics

**28A** (ACS first-term chapters in brackets)
- `structure` Structure, bonding & resonance [Ch 1]: Lewis/line/3D structures, formal charge, hybridization and geometry,
  localized vs delocalized lone pairs, resonance forms and major contributor, curved-arrow bookkeeping in words, MO ideas
  (σ/π, HOMO/LUMO of simple systems), bond lengths/strengths, polarity, IMFs and physical properties.
- `nomenclature` Nomenclature & functional groups [Ch 2]: IUPAC names (alkanes, cycloalkanes, alkenes with E/Z, alkynes,
  alkyl halides, alcohols, ethers, amines, simple bicyclics), functional-group ID in complex molecules, degrees of unsaturation.
- `acidbase` Acids & bases [Ch 4]: ARIO (atom, resonance, induction, orbital), pKa values and Keq direction, solvent and
  leveling, counterions, Lewis acids/bases, choosing a base, carbon acids (alkynes).
- `conform` Alkanes & conformations [Ch 3]: Newman projections, torsional/steric strain, gauche/anti, ring strain,
  chair conformations, A-values, mono- and disubstituted cyclohexanes, cis/trans ring isomers, sources & uses of alkanes.
- `stereo` Stereochemistry [Ch 3]: CIP R/S, chirality, enantiomers/diastereomers/meso, Fischer projections, optical
  rotation, specific rotation and ee calculations, resolution, number of stereoisomers, erythro/threo.
- `mechanism` Reactivity & mechanisms: ΔH, ΔS, ΔG, Keq, kinetics and rate laws, energy diagrams (TS vs intermediate,
  Hammond postulate), nucleophiles/electrophiles, carbocation stability and rearrangements (hydride/methyl shifts),
  kinetic vs thermodynamic control.
- `subst` Substitution [Ch 5]: SN1 vs SN2 (substrate, nucleophile, leaving group, solvent), rate laws, stereochemistry
  (inversion, racemization), functional-group transformations, intramolecular cases, leaving-group conversion (TsCl, PBr₃, SOCl₂).
- `elim` Elimination & alkenes [Ch 6]: E1/E2, Zaitsev vs Hofmann (bulky base), anti-periplanar requirement in chairs,
  E/Z of the product, alkene stability (heats of hydrogenation), SN/E competition charts, dehydration with rearrangement.
- `addition` Alkene additions [Ch 7]: HX (with rearrangement), acid hydration, oxymercuration, hydroboration–oxidation,
  hydrogenation, X₂ and halohydrins, anti (epoxide + H₃O⁺) and syn (OsO₄) dihydroxylation, ozonolysis, KMnO₄
  cleavage, stereochemical outcome (syn/anti, racemic/meso), regiochemistry.
- `alkynes` Alkynes [Ch 7]: nomenclature, acidity and acetylide alkylation, preparation by double elimination,
  reduction (H₂/Lindlar → cis, Na/NH₃ → trans, H₂/Pt), HX, hydration (HgSO₄ → Markovnikov ketone; R₂BH → aldehyde),
  X₂, ozonolysis, synthesis.
- `radical` Radical reactions [Ch 10]: initiation/propagation/termination, radical stability, chlorination vs
  bromination selectivity (product-ratio calculations with relative rates), stereochemistry at a radical center,
  anti-Markovnikov HBr/ROOR, NBS allylic bromination, radical polymerization.
- `synthesis` Synthesis (28A reactions): one-step reagents, functional-group interconversions, C–C bond formation with
  acetylides, retrosynthesis, order of steps, erythro/threo or meso/racemic targets.
- `irms` IR & mass spectrometry [Ch 9]: IR wavenumber/intensity/shape (O–H, N–H, C≡N, C≡C, C=O, C=C, sp/sp²/sp³ C–H),
  identifying functional groups from spectra, M⁺, M+1 (carbon count), M+2 (Cl 3:1, Br 1:1), common fragments
  (α-cleavage, McLafferty, loss of water), GC-MS.
- `nmr` NMR [Ch 9]: number of ¹H signals (homotopic/enantiotopic/diastereotopic), chemical shift, integration, n+1
  multiplicity, coupling patterns, ¹³C signal count and shifts, DEPT, matching a structure to a spectrum,
  solving from formula + DBE + spectra.

**28B** (ACS full-year chapters in brackets)
- `alcohols` Alcohols & phenols [Ch 8]: properties and acidity (phenols vs alcohols), preparation by substitution,
  addition, reduction (NaBH₄, LiAlH₄), Grignard/organolithium additions to aldehydes, ketones, esters and epoxides;
  activation (TsCl, PBr₃, SOCl₂), protecting groups (TMS/TBS ethers), oxidation (PCC, DMP, Swern, H₂CrO₄), diols, pinacol.
- `ethers` Ethers, epoxides, thiols & sulfides [Ch 8]: nomenclature, Williamson synthesis (and when it fails), acid
  cleavage with HX, crown ethers, epoxide formation (mCPBA, halohydrin + base), epoxide opening under acid vs base
  (regio- and stereochemistry), thiols/disulfides, sulfides and sulfoxides.
- `conjugated` Conjugated π systems & pericyclic reactions [Ch 11]: diene stability, 1,2- vs 1,4-addition (kinetic vs
  thermodynamic), allylic systems, π MO diagrams (HOMO/LUMO, nodes), Diels–Alder (s-cis, endo rule, regio- and stereo-
  chemistry, retro), electrocyclic (con/disrotatory, thermal vs photochemical), sigmatropic (Cope, Claisen), UV-Vis λmax trends.
- `aromatic` Aromaticity & aromatic compounds [Ch 11]: Hückel 4n+2, aromatic/antiaromatic/nonaromatic ions and
  heterocycles (pyridine, pyrrole, furan, thiophene: lone-pair participation and basicity), nomenclature (o/m/p),
  benzylic reactions (KMnO₄ oxidation, NBS), Birch and catalytic ring reduction, aromatic NMR/IR.
- `eas` Aromatic substitution [Ch 12]: EAS mechanism (arenium ion), halogenation, nitration, sulfonation, Friedel–Crafts
  alkylation (rearrangement, polyalkylation) and acylation, activating/deactivating and o/p vs m directors with
  resonance reasons, multiple substituents, synthesis order (blocking groups, nitro → amine, acyl → Clemmensen/
  Wolff–Kishner), SNAr (EWG o/p), benzyne (elimination–addition).
- `carbonyl` Aldehydes & ketones [Ch 13]: nomenclature, preparation, nucleophilic addition (hydrate, cyanohydrin,
  acetal/hemiacetal, imine/enamine, Wittig, Grignard, hydride), mechanisms under acid vs base, acetals as protecting
  groups, Baeyer–Villiger, Wolff–Kishner/Clemmensen, reactivity ranking, IR/NMR of C=O and CHO.
- `acidderiv` Carboxylic acids & derivatives [Ch 13]: acidity (inductive effects), reactivity ladder (acid chloride >
  anhydride > ester ≈ acid > amide), nucleophilic acyl substitution mechanism, Fischer esterification, saponification,
  amide formation, nitriles (hydrolysis, reduction, Grignard), LiAlH₄ vs DIBAL-H, Grignard + ester → 3° alcohol,
  spectroscopy of derivatives.
- `enolates` Enols & enolates [Ch 14]: keto–enol tautomerism, α-acidity (pKa of ketones, β-dicarbonyls), kinetic vs
  thermodynamic enolates (LDA vs NaOEt), α-halogenation (acid vs base, haloform), alkylation, aldol addition/
  condensation (crossed, intramolecular ring size), Claisen and Dieckmann, malonic ester and acetoacetic ester
  synthesis, Michael addition, Robinson annulation, enamines (Stork).
- `amines` Amines & heterocycles [ACS ch 16 applications]: nomenclature, basicity (alkyl vs aryl vs amide, pKa of
  conjugate acids), preparation (Gabriel, reductive amination, reduction of nitriles/amides/nitro), acylation,
  Hofmann elimination (least substituted alkene), nitrous acid (diazonium), Sandmeyer and arenediazonium reactions,
  azo coupling, heterocycle basicity and aromaticity, spectroscopy of amines.
- `spectro` Structure determination [Ch 9 + 28B]: combined MS/IR/¹H/¹³C problems for aromatic, carbonyl and amine
  compounds; DBE from formula; para-disubstituted patterns; aldehyde H, carboxylic acid OH, conjugation effects on
  C=O stretch, UV-Vis.
- `synthesis` Multistep synthesis & protecting groups [Ch 15]: retrosynthesis, order of events, choosing reagents,
  protecting groups (acetals, silyl ethers, Boc/Cbz), chemoselectivity (NaBH₄ vs LiAlH₄), C–C bond formation planning.
- `biomol` Biomolecules [Ch 16]: carbohydrates (D/L, Fischer↔Haworth, anomers, mutarotation, reducing sugars,
  glycosides, Kiliani–Fischer/Wohl, aldaric acids), amino acids (pI, charge at pH, Fischer/zwitterion), peptide
  synthesis (DCC, protecting groups, Edman), lipids (triglyceride melting points, saponification, terpenes/isoprene,
  steroids), nucleic acid bases (aromaticity, tautomers, H-bonding).

## Roman-numeral (I, II, III) items

The ACS's favourite format. Stem lists three statements, reagents, structures (caption them `"cap": "I"`) or
conditions labeled I, II, III, and the choices are combinations: `"I only"`, `"III only"`, `"I and II only"`,
`"I, II, and III"` (or rankings `"II < I < III"`).
- Write each statement so it is clearly true or false on its own; no hedged wording.
- The four choices must be combinations a student could reach by misjudging exactly one statement.
- `w` must judge **every** statement (I true because…, II false because…, III true because…).
- `x` explains, per wrong combination, which statement it gets wrong and why.
- Balance keys: don't make "I, II, and III" or "I and II only" the answer more than about a quarter of the time.

## Spectra items

- Draw real-looking data with `f` (`nmr`, `ir`, `ms`); every peak list must match the structure you claim (check
  signal counts and splitting with `chem.py info`; use standard shift/wavenumber ranges from OpenStax).
- Useful formats: combined unknowns (formula + IR + ¹H NMR, or MS + ¹³C), "which technique best tells X from Y",
  ppm ↔ Hz (Δν = δ × spectrometer MHz; J in Hz is field-independent), coupling-constant reading, DEPT, M+2 and
  M+1 math, UV-vis λ<sub>max</sub> and conjugation (28B).
- A **set** of 2–4 questions may share one spectrum: repeat the same `f` in each so every question stands alone.
