#!/usr/bin/env python3
"""Near-duplicate finder: word-trigram Jaccard on stem + key (HTML stripped), same course, same topic.
Usage: near_dups.py [threshold=0.6] > near_dups.tsv"""
import json, re, sys, os, itertools
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')
th = float(sys.argv[1]) if len(sys.argv) > 1 else 0.6
def toks(s):
    s = re.sub(r'<[^>]+>', ' ', s).lower(); w = re.findall(r'[a-z0-9.]+', s)
    return set(zip(w, w[1:], w[2:]))
pairs = []
for c in ['3A', '3B', '1A', '1B', '28A', '28B']:
    b = json.load(open(os.path.join(ROOT, 'data', 'bank-%s.json' % c)))
    by = {}
    for i, q in enumerate(b): by.setdefault(q['t'], []).append((i, toks(q['q'] + ' ' + q['c'][0]), q))
    for t, L in by.items():
        for (i, a, qa), (j, bb, qb) in itertools.combinations(L, 2):
            if not a or not bb: continue
            if json.dumps([qa.get('s'),qa.get('cs'),qa.get('f')]) != json.dumps([qb.get('s'),qb.get('cs'),qb.get('f')]): continue  # different drawing = different question
            jac = len(a & bb) / len(a | bb)
            if jac >= th: pairs.append((c, t, i, j, round(jac, 2), qa['q'] == qb['q'] and qa.get('s') == qb.get('s') and qa.get('f') == qb.get('f')))
for p in pairs: print('%s\t%s\t%s-%d\t%s-%d\t%.2f\t%s' % (p[0], p[1], p[0], p[2], p[0], p[3], p[4], 'IDENTICAL-STEM' if p[5] else ''))
