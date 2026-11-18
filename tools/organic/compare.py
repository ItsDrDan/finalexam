#!/usr/bin/env python3
"""compare.py BLINDDIR -> table of blind answers vs keys"""
import sys, json, glob, os
d = sys.argv[1]; keys = json.load(open(os.path.join(d, 'keys.json')))
ans = {}
for f in sorted(glob.glob(os.path.join(d, 'answers', '*.json'))):
    for k, v in json.load(open(f)).items(): ans[k] = (v, os.path.basename(f))
mis, notes = [], []
for k, (v, f) in sorted(ans.items()):
    key = keys.get(k)
    if key is None: continue
    if v.get('a') != key: mis.append((k, key, v))
    elif v.get('conf') != 'high' or v.get('note'): notes.append((k, key, v))
print('answered', len(ans), 'mismatches', len(mis), 'notes', len(notes))
for k, key, v in mis: print('MISMATCH', k, 'key', key, 'solver', v.get('a'), v.get('conf'), '|', v.get('note', ''))
if '--notes' in sys.argv:
    for k, key, v in notes: print('NOTE', k, v.get('conf'), '|', v.get('note', ''))
