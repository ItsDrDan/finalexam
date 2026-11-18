# Screen: which CHEM 3A textbook practice questions belong in Final Boss (CHEM 3A)

**Goal.** Final Boss is final-exam review. CHEM 3A's final is the general-chemistry part of a general, organic and
biochemistry (GOB) course. The standard to screen against is the general-chemistry half of the **ACS General,
Organic & Biological Chemistry exam**: four-choice, single best answer, conceptual or applied, typically one or two
reasoning steps. Allied-health context is welcome (about 75% of students are nursing/allied health).

The textbook questions are already four-choice. Many are textbook practice drills: good for learning, but too
repetitive or too elementary for an exam-review bank. Pick the ones that read like real standardized-exam items.

## Inputs (this folder)
- `candidates-<group>.json`. Each candidate has:
  - `id`, `sub` (textbook subsection), `topic` (Final Boss topic), `d`, `calc`;
  - `q`, `key` (the correct answer), `wrong` (three distractors), `explanation`;
  - `has_figure` (figure types the question carries).
- `existing-3A.txt`: the 402 questions already in Final Boss 3A (id, topic, stem, key).

## KEEP a question only if all of these hold
1. **Exam-like:** it tests a concept, or an application in one or two steps, the way an ACS-style item would.
   Plain recall is fine only when the fact matters on such exams (e.g. which particle sets the element, the meaning
   of a buffer). Trivial vocabulary does not qualify.
2. **One best answer:** the key is right, every distractor is clearly wrong, and the distractors are plausible
   mistakes. Do the math or the reasoning yourself. **If you find any error, REJECT** and say what is wrong.
3. **Self-contained:** all data needed is in the stem or the figure. Reject anything that refers to the textbook
   ("in Example 3", "from the simulation", "the table above" with no table in `has_figure`).
4. **Not a duplicate** of an existing Final Boss question (check `existing-3A.txt`), and not a near-copy of another
   candidate you are keeping. When several candidates drill the same skill, **keep the best one or two** and reject
   the rest as "drill repeat".
5. **In scope** for an intro/GOB general chemistry final. Reject anything that only makes sense in a lab or classroom
   activity.

Expect to keep roughly **35–50%**. Use your judgment: never keep a weak item to hit a number. Aim for no more than
about **6 per textbook subsection**, and spread difficulty. ACS-level items are mostly d2, plus some d1 and d3.

## Output
Write a JSON array to the file named in your task, one entry per candidate, in the same order:

    {"id":"c1-001","keep":true,"reason":"applies quantitative vs qualitative to a clinical observation","dup_of":null}
    {"id":"c1-002","keep":false,"reason":"drill repeat of c1-001","dup_of":"c1-001"}

- `dup_of` is the existing Final Boss id ("3A-57") or the candidate id it duplicates, otherwise null.
- For rejects, the `reason` is short: "trivial recall", "drill repeat", "error: key should be 2.50 g", "refers to
  textbook", "duplicate of 3A-57", "classroom-only".

Don't edit any question. Write only your output file. Finish with:
- kept vs total, per topic;
- every **error** you found (id and what's wrong), so the textbook can be fixed too.
