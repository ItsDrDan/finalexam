#!/usr/bin/env python3
"""Tables for FINAL-BOSS-ACS-RIGOR-AUDIT.md from the ledger, the fix file and the simulations."""
import json, glob, collections, os
H = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.join(H, '..', '..')
L = {}
for p in glob.glob(os.path.join(H, 'ledger', '*.jsonl')):
    for l in open(p):
        if l.strip(): r = json.loads(l); L[r['id']] = r
fx = json.load(open(os.path.join(ROOT, 'tools', 'fixes', '2026-11-18-acs-audit.json')))
fixed = collections.defaultdict(set)
for f in fx: fixed[f['id']].add(f['src'])
C = ['3A', '3B', '1A', '1B', '28A', '28B']
print('| Course | Items | Reviewed | Key wrong | Science error | Ambiguous | Figure error | Out of scope | Borderline | KEEP | REVISE | REPLACE | REMOVE | Items edited |')
print('|---|---|---|---|---|---|---|---|---|---|---|---|---|---|')
for c in C:
    n = len(json.load(open(os.path.join(ROOT, 'data', 'bank-%s.json' % c))))
    rs = [L[k] for k in L if k.startswith(c + '-')]
    cnt = lambda k, v: sum(1 for r in rs if str(r.get(k)) == v)
    edited = sum(1 for i in fixed if i.startswith(c + '-') and fixed[i] - {'twins'})
    print('| %s | %d | %d | %d | %d | %d | %d | %d | %d | %d | %d | %d | %d | %d |' % (c, n, len(rs), cnt('key', 'wrong'), cnt('sci', 'error'), cnt('sci', 'ambiguous'), cnt('figure', 'error'), cnt('scope', 'out'), cnt('scope', 'borderline'), cnt('action', 'KEEP'), cnt('action', 'REVISE'), cnt('action', 'REPLACE'), cnt('action', 'REMOVE'), edited))
print()
print('| Course | Level 1 recall | Level 2 understanding | Level 3 application | Level 4 integration | difficulty tag d=1/2/3 |')
print('|---|---|---|---|---|---|')
for c in C:
    b = json.load(open(os.path.join(ROOT, 'data', 'bank-%s.json' % c)))
    rs = [L[k] for k in L if k.startswith(c + '-')]
    n = len(rs); g = collections.Counter(int(r.get('cog', 0)) for r in rs)
    dd = collections.Counter(q['d'] for q in b)
    print('| %s | %d%% | %d%% | %d%% | %d%% | %d%% / %d%% / %d%% |' % (c, *(round(100 * g[k] / n) for k in (1, 2, 3, 4)), *(round(100 * dd[k] / len(b)) for k in (1, 2, 3))))
print()
q = collections.Counter(); 
for r in L.values():
    for k in ('distractors', 'feedback', 'hint'): q[(k, str(r.get(k)))] += 1
print(sorted(q.items()))
print('fix sources', collections.Counter(f['src'] for f in fx), 'items touched', len(fixed))
