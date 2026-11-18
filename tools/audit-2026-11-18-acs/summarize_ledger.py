#!/usr/bin/env python3
"""Check the item ledger covers every bank item exactly once and tally results.
Writes ledger_summary.json and prints a table. Usage: summarize_ledger.py"""
import json, glob, os, collections
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.join(HERE, '..', '..')
L = {}; dups = []
for p in sorted(glob.glob(os.path.join(HERE, 'ledger', '*.jsonl'))):
    for line in open(p):
        line = line.strip()
        if not line: continue
        r = json.loads(line)
        if r['id'] in L: dups.append(r['id'])
        L[r['id']] = r
out = {'courses': {}, 'missing': {}, 'duplicates': dups}
for c in ['3A', '3B', '1A', '1B', '28A', '28B']:
    n = len(json.load(open(os.path.join(ROOT, 'data', 'bank-%s.json' % c))))
    ids = ['%s-%d' % (c, i) for i in range(n)]
    miss = [i for i in ids if i not in L]; out['missing'][c] = miss
    rs = [L[i] for i in ids if i in L]
    tally = {k: dict(collections.Counter(str(r.get(k)) for r in rs)) for k in ['action', 'sci', 'key', 'scope', 'cog', 'distractors', 'feedback', 'hint', 'figure', 'd']}
    out['courses'][c] = {'n': n, 'reviewed': len(rs), **tally}
json.dump(out, open(os.path.join(HERE, 'ledger_summary.json'), 'w'), indent=1)
for c, v in out['courses'].items():
    print(c, 'n', v['n'], 'reviewed', v['reviewed'], 'missing', len(out['missing'][c]))
    for k in ['action', 'sci', 'key', 'scope', 'cog', 'distractors', 'feedback', 'hint', 'figure']:
        print('   %-11s %s' % (k, json.dumps(v[k], sort_keys=True)))
print('duplicates', len(dups))
