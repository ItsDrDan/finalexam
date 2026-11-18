# Final Boss! Final Exam Review (ItsDrDan)

Practice for standardized multiple-choice chemistry finals in **CHEM 3A, 3B, 1A, 1B, 28A and 28B** at Fresno City College, and for chemistry students anywhere.

**Play:** https://itsdrdan.github.io/finalexam/ (add `?course=3A`, `3B`, `1A`, `1B`, `28A` or `28B`)

- 👾 **Living boss logo:** eight pieces of glassware (flask, beaker, test tube, Erlenmeyer, cylinder, volumetric flask, sep funnel, buret) with 12 rotating liquids; the boss takes a hit and loses HP on every correct answer, taunts on misses, gets worried when low, and KOs then respawns stronger.
- ⏱️ **Boss Battle:** timed practice exam. Practice style (Boss HP, pace meter) or 🎓 Exam Day style (directions, bubble sheet, data sheet only).
- 🎯 **Topic Training:** pick a topic; hints and step-by-step explanations.
- 🩹 **Weak Spots:** brings back what you missed.
- ⚡ **Quick 10:** ten mixed questions.
- 💥 **Blitz:** beat the clock (90, 60 or 30 s per question), 3 lives, speed bonus and streak multiplier. After each answer the clock stops and shows why your pick is right or wrong, the explanation, and why the other choices are wrong.
- 🧮 **Practice calculator:** TI-36X Pro style, for practicing the keystrokes you'll use on exam day.
- 💬 **Every wrong answer explained:** pick a wrong choice and see why it's wrong, plus a list of why the other choices are wrong.

**Courses:** 3A = intro chem · 3B = organic midterm + biochem final · 1A = gen chem I · 1B = gen chem II · 28A = organic chemistry I (majors) · 28B = organic chemistry II (majors). About 5,200 questions in all, including ACS-style I/II/III statement items in every course.

- 🧪 **Organic (28A/28B):** skeletal structures with wedges and dashes, curved-arrow mechanisms with lone pairs, Newman projections, chair conformations, energy diagrams, and ¹H/¹³C NMR, IR and mass spectra drawn in the game, using real measured peaks (NIST WebBook IR and MS, literature NMR shifts; sources in tools/organic/SPECTRA_SOURCES_28A.md and _28B.md). Combined-spectra unknowns.

- 📶 **Fast and offline:** each course's questions are their own file (`data/bank-<course>.json`), so a phone downloads only the course it opens. After one visit, a course works offline.

All questions are original. Not affiliated with or endorsed by any exam publisher.

Current version: v60

For editors: the question banks live in `data/`. The tools in `tools/` (append_questions.js, apply_fixes.js, validate_bank.js, organic/install_banks.js) read and write them through `tools/bankio.js`, which also refreshes the version stamps in index.html so browsers and the offline cache fetch updated files.
