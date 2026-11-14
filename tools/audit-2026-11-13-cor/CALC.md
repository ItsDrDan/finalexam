# Calculation questions: wording, hints, feedback and scope

You are a chemistry professor checking one packet of **calculation** multiple-choice questions from a study game used at Fresno City College (a California community college; many students are first-generation, many are multilingual). The keyed answers and every number in these questions were already recomputed with code in an earlier pass and are correct. **This pass checks what the student reads and whether the question fits the course outline.** Do not redo the arithmetic unless something is obviously wrong; if you do suspect a number, check it with code before reporting it.

Your packet is `calc/<name>.md` in the folder that holds this file. Its first line names the course. Read `SCOPE.md` (same folder) first. Each question shows the stem, any figure data, the keyed answer, three distractors each with the feedback line shown when a student picks it (before a retry), the hint (shown before answering) and the explanation (shown after). Text is plain: `SO^2−4` means sulfate; this is only how the packet prints it.

## Check EVERY question (no sampling)
1. **wording**: Flag only wording that would block a capable student who is still learning English or is new to college: an idiom or cultural reference needed to answer, a double negative, a stem that hides what is being asked or which unit/precision is wanted, missing data the student needs (a constant, a molar mass or a condition that is not on a standard data sheet or periodic table), an undefined term the outline does not teach. Do not flag ordinary chemistry vocabulary or suggest stylistic rewrites.
2. **hint**: true; stops short of the answer (it must not give the final number or the full setup with numbers plugged in); does not steer toward a distractor.
3. **feedback 1, 2, 3**: each true, about **that** distractor, helps the student see the mistake, and does not state the keyed value, the full calculation, or how far off the pick is ("half the right value").
4. **explanation**: clear enough to follow step by step; no claim that is false.
5. **scope**: `in`, `borderline` (a detail beyond the outline but answerable from outline content) or `out` (needs content the outline excludes or does not list) for the question's course in SCOPE.md.

Be strict about truth and lenient about style. If you are not sure something is wrong, use severity `check`.

## Output
Write `calcresults/<name>.json`: a JSON array with exactly one object per question, in packet order:
```
{"id":"1B-42","wording":"ok","hint":"ok","fb":{"1":"ok","2":"giveaway","3":"ok"},"expl":"ok","scope":"in",
 "findings":[{"field":"x[2]","severity":"minor","problem":"...","new_text":"..."}]}
```
- `wording`: ok/flag. `hint`: ok/false/giveaway/misleading. `fb` values: ok/false/wrong-choice/giveaway/vague. `expl`: ok/error/unclear. `scope`: in/borderline/out.
- `findings`: one entry for every value that is not ok/in. `field` is one of `q`, `c[0]`..`c[3]`, `h`, `w`, `x[1]`, `x[2]`, `x[3]`, `scope`. `severity`: `error` (false statement, missing data, misled student), `minor` (give-away, vague, unclear wording, borderline/out of scope) or `check`.
- For `x[...]` and `h` give `"new_text"`: the complete replacement line. One or two short sentences, true, plain words, not giving the answer away. Formulas in Unicode (H₂O, CO₃²⁻, 10⁻³); no HTML, no `^`, no dashes as punctuation, no semicolons.
- For `w` and `q` give `"replace"` (exact words now in the text, copied from the packet) and `"with"` (corrected words). Change as little as possible.
- For `scope` borderline/out: a one-line `problem` naming the outline item that is missing or the course it belongs to.

Validate with `node -e "JSON.parse(require('fs').readFileSync('FILE','utf8'))"`. One entry for every `###` id. Touch no other files. Final message: questions checked, questions with error-level findings, questions out of scope, total findings.
