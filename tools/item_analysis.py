#!/usr/bin/env python3
"""Per-question report from real student answers (Final Boss).

    python3 tools/item_analysis.py                    # fetch the last 365 days from the live stats URL
    python3 tools/item_analysis.py --days 60          # e.g. this semester only
    python3 tools/item_analysis.py --file items.json  # use a saved copy of <stats URL>?items=1&game=finalboss
    python3 tools/item_analysis.py --min 15           # answers needed before a question is judged (default 15)

The game (v47+) sends item, pick, key and ver with each first-try answer through games/track.js.
Writes item-analysis.md with two parts:
  1. Most-missed questions per course (lowest first-try % correct): what to reteach before the final.
  2. Flags for the CURRENT wording of each question (answers to older wording are skipped):
     POSSIBLE MIS-KEY   a wrong choice is picked more often than the keyed answer
     TOO HARD           fewer than 30% correct (4-choice chance is 25%): check key, wording, data
     TOO EASY           97%+ correct with 30+ answers: the distractors may be implausible
     DEAD DISTRACTOR    a wrong choice almost nobody picks (under 3% with 40+ answers)
Choice numbers are the bank's stored order: choice 0 is always the key.
"""
import json, re, sys, argparse, urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
# Exam codes of staff test battles, left out of the exam statistics.
# j5sgmbx9: 2026-11-18 check that the receiver stores ex and sec (35 CHEM 1A rows, 2 answered, 33 blank).
TEST_EX = {"j5sgmbx9"}
STATS_URL = "https://script.google.com/macros/s/AKfycbylSKoW9GE6AkN4HiC1uts3Y5Z4oUPHY7OQ88vXrjpcanooloYRTIGW9cS5n0dulp4vQg/exec"

ap = argparse.ArgumentParser()
ap.add_argument("--days", type=int, default=365)
ap.add_argument("--file")
ap.add_argument("--min", type=int, default=15)
ap.add_argument("--top", type=int, default=25, help="most-missed questions listed per course")
ap.add_argument("--rows", help="saved copy of <stats URL>?items=1&rows=1&game=finalboss (answer rows; fetched if omitted)")
ap.add_argument("--min-battles", type=int, default=30, help="Boss Battles needed before exam statistics are reported")
args = ap.parse_args()


def qver(q):
    """Same fingerprint the game sends: FNV-1a over stem|choices, one unit per code point (JS charCodeAt(0)), base 36."""
    s = str(q["q"]) + "|" + "|".join(q["c"])
    h = 2166136261
    for ch in s:
        cp = ord(ch)
        unit = cp if cp < 0x10000 else 0xD800 + ((cp - 0x10000) >> 10)
        h ^= unit
        h = (h * 16777619) & 0xFFFFFFFF
    digits = "0123456789abcdefghijklmnopqrstuvwxyz"
    out = ""
    while True:
        h, r = divmod(h, 36)
        out = digits[r] + out
        if h == 0:
            return out


def exam_stats():
    """Exam-level statistics from the anonymous answer rows (receiver version 2): one Boss Battle = one exam code (ex).
    Item discrimination = corrected point-biserial (item vs the rest of that battle's score). Reliability = KR-20 per
    course, approximate because every student gets a different random form. Time = seconds on each question."""
    import statistics as st
    try:
        if args.rows:
            rows = json.loads(Path(args.rows).read_text(encoding="utf-8")).get("rows", [])
        else:
            with urllib.request.urlopen(f"{STATS_URL}?items=1&rows=1&game=finalboss&days={args.days}", timeout=90) as r:
                rows = json.loads(r.read().decode("utf-8")).get("rows")
    except Exception as e:
        return ["", "## Exam statistics", "", f"Not available: {e}"]
    if rows is None:
        return ["", "## Exam statistics", "", "Not available yet: the stats receiver is still version 1 (install tools/apps-script/item_stats_v2.gs)."]
    out = ["", "## Exam statistics (Boss Battles)", ""]
    battles = {}
    secs = {}
    for item, ver, pick, ok, mode, session, ex, sec in rows:
        q = bank.get(item)
        if not q or (ver and ver != qver(q)) or ex in TEST_EX:
            continue
        if sec not in ("", None):
            secs.setdefault(item, []).append(float(sec))
        if ex:
            battles.setdefault(ex, {})[item] = int(ok)
    by_course = {}
    for ex, ans in battles.items():
        c = next(iter(ans)).split("-")[0]
        if len(ans) >= 20:
            by_course.setdefault(c, []).append(ans)
    if not by_course:
        out.append(f"No complete Boss Battles with exam codes yet ({len(battles)} codes seen).")
    for c, bl in sorted(by_course.items()):
        out += [f"### CHEM {c}: {len(bl)} Boss Battles", ""]
        if len(bl) < args.min_battles:
            out += [f"Fewer than {args.min_battles} battles: too few for discrimination or reliability.", ""]
            continue
        p = {}
        for ans in bl:
            for i, v in ans.items():
                p.setdefault(i, []).append(v)
        pbar = {i: sum(v) / len(v) for i, v in p.items()}
        totals = [sum(a.values()) for a in bl]
        ks = [len(a) for a in bl]
        k = st.median(ks)
        var = st.pvariance(totals) if len(totals) > 1 else 0
        sum_pq = st.mean([sum(pbar[i] * (1 - pbar[i]) for i in a) for a in bl])
        kr20 = (k / (k - 1)) * (1 - sum_pq / var) if var > 0 and k > 1 else float("nan")
        out += [f"Mean score {st.mean(totals) / k:.0%}, SD {var ** 0.5:.1f} questions, approximate KR-20 = {kr20:.2f} "
                "(random forms: read as a rough consistency check, not a formal reliability).", ""]
        disc = []
        for i, v in p.items():
            if len(v) < 15:
                continue
            xs, ys = [], []
            for a in bl:
                if i in a:
                    xs.append(a[i]); ys.append(sum(a.values()) - a[i])
            if len(set(xs)) < 2 or len(set(ys)) < 2:
                continue
            mx, my = st.mean(xs), st.mean(ys)
            cov = sum((x - mx) * (y - my) for x, y in zip(xs, ys)) / len(xs)
            r = cov / ((st.pvariance(xs) ** 0.5) * (st.pvariance(ys) ** 0.5))
            disc.append((r, i, len(v), pbar[i]))
        disc.sort()
        out += ["Lowest discrimination (corrected point-biserial; under 0.10 = check the key, wording or difficulty):", "",
                "| Question | Battles | Correct | r | Stem |", "|---|---|---|---|---|"]
        for r, i, n, pp in disc[:15]:
            out.append(f"| {i} | {n} | {pp:.0%} | {r:.2f} | {strip(bank[i]['q'])[:90].replace('|', '/')} |")
        out.append("")
    timed = [(st.median(v), i, len(v)) for i, v in secs.items() if len(v) >= 10]
    if timed:
        out += ["### Time per question (median seconds, 10+ answers)", "",
                "| Course | Questions timed | Median of medians | Slowest |", "|---|---|---|---|"]
        for c in ("3A", "3B", "1A", "1B", "28A", "28B"):
            t = sorted((m, i) for m, i, n in timed if i.startswith(c + "-"))
            if t:
                out.append(f"| {c} | {len(t)} | {st.median(m for m, _ in t):.0f} s | " + ", ".join(f"{i} ({m:.0f} s)" for m, i in t[-5:][::-1]) + " |")
    return out


bank = {}
for c in ("3A", "3B", "1A", "1B", "28A", "28B"):
    for i, q in enumerate(json.loads((ROOT / "data" / f"bank-{c}.json").read_text(encoding="utf-8"))):
        bank[f"{c}-{i}"] = q

if args.file:
    data = json.loads(Path(args.file).read_text(encoding="utf-8"))
else:
    url = f"{STATS_URL}?items=1&game=finalboss&days={args.days}"
    with urllib.request.urlopen(url, timeout=60) as r:
        data = json.loads(r.read().decode("utf-8"))
items = data.get("items", data if isinstance(data, list) else [])
if not items:
    sys.exit("No per-question data yet. Students need to answer on v47 or later of the live game.")

strip = lambda h: re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", str(h))).strip()
flags, old, unknown, judged = [], 0, 0, 0
by_course = {}
for it in items:
    q = bank.get(it["item"])
    if not q:
        unknown += 1
        continue
    if it.get("ver") and it["ver"] != qver(q):
        old += 1
        continue
    n = it["n"]
    if n < args.min:
        continue
    judged += 1
    p = it["correct"] / n
    picks = (it.get("picks") or [0, 0, 0, 0]) + [0, 0, 0, 0]
    picks = picks[:len(q["c"])]
    tot = sum(picks) or 1
    by_course.setdefault(it["item"].split("-")[0], []).append((p, it["item"], n, picks, q))
    wrong = [(picks[i], i) for i in range(1, len(q["c"]))]
    top_wrong = max(wrong)
    reasons = []
    if top_wrong[0] > picks[0]:
        reasons.append(f"POSSIBLE MIS-KEY: '{strip(q['c'][top_wrong[1]])[:60]}' picked {top_wrong[0]}× vs key {picks[0]}×")
    if p < 0.30:
        reasons.append(f"TOO HARD: {p:.0%} correct")
    if p >= 0.97 and n >= 30:
        reasons.append(f"TOO EASY: {p:.0%} correct")
    if tot >= 40:
        for cnt, i in wrong:
            if cnt / tot < 0.03:
                reasons.append(f"DEAD DISTRACTOR: '{strip(q['c'][i])[:50]}' ({cnt}/{tot})")
    if reasons:
        rank = 0 if reasons[0].startswith("POSSIBLE") else 1 if reasons[0].startswith("TOO HARD") else 2
        flags.append((rank, it["item"], n, p, strip(q["q"])[:110], reasons))

lines = [f"# Final Boss item analysis ({data.get('days', args.days)} days, generated {data.get('generated', '')})", "",
         f"Questions with data: {len(items)} · judged (≥{args.min} answers, current wording): {judged} · flagged: {len(flags)} · "
         f"answers to older wording (skipped): {old} · IDs no longer in the bank: {unknown}", ""]
lines += ["## Most-missed questions (reteach these)", ""]
for c in ("3A", "3B", "1A", "1B", "28A", "28B"):
    rows = sorted(by_course.get(c, []))[:args.top]
    if not rows:
        continue
    lines += [f"### CHEM {c}", "", "| Question | Answers | Correct | Topic | Stem | Most common wrong pick |", "|---|---|---|---|---|---|"]
    for p, iid, n, picks, q in rows:
        cnt, i = max((picks[i], i) for i in range(1, len(q["c"])))
        lines.append(f"| {iid} | {n} | {p:.0%} | {q['t']} | {strip(q['q'])[:100].replace('|', '/')} | "
                     f"{strip(q['c'][i])[:50].replace('|', '/')} ({cnt}) |")
    lines.append("")
lines += ["## Flags", "", "| Question | Answers | Correct | Stem | Why flagged |", "|---|---|---|---|---|"]
for _, iid, n, p, stem, reasons in sorted(flags):
    lines.append(f"| {iid} | {n} | {p:.0%} | {stem.replace('|', '/')} | {'; '.join(reasons).replace('|', '/')} |")
lines += exam_stats()
(ROOT / "item-analysis.md").write_text("\n".join(lines) + "\n", encoding="utf-8")
print("\n".join(lines[:3]))
print(f"Report written to {ROOT / 'item-analysis.md'}")
