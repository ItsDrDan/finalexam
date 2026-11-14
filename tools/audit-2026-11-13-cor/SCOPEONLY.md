# Course-outline check (CHEM 1A and 1B)

You are a chemistry professor checking whether each question in one packet fits its course's Course Outline of Record (COR). Read `SCOPE.md` in the folder that holds this file first: the CHEM 1A and CHEM 1B sections are condensed from the official CORs, and the note at the end of the 1B section explains the two 1B topics on IMFs and colligative properties. The questions' chemistry, wording and feedback were checked in earlier passes; **this pass only judges scope**.

Your packet is `scope/<name>.md` in the same folder. Its first line names the course. Each question shows its topic tag, stem, figure data if any, and the keyed answer.

For EVERY question (no sampling) decide:
- `in`: everything needed is in that course's COR (or, for 1B topics imf and colligative, in the 1A COR).
- `borderline`: needs a detail or term beyond the COR but is answerable from COR content.
- `out`: needs content the COR does not list or that belongs to the other course (for example an equilibrium constant in a 1A question, or a colligative-property calculation in a 1B kinetics question).
- `wrongtopic`: in scope for the course but tagged with the wrong game topic (name the right topic from the course's topic list in SCOPE.md).

Write `scoperesults/<name>.json`: an array with one object per question in packet order: `{"id":"1A-12","scope":"in"}`, adding `"note":"one line: which COR item is missing or which course it belongs to"` for anything not `in` (and `"topic":"..."` for wrongtopic). Validate with `node -e "JSON.parse(require('fs').readFileSync('FILE','utf8'))"`. Touch no other files. Final message: questions checked and the count of each verdict.
