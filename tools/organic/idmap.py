#!/usr/bin/env python3
"""idmap.py 28A 353 102 ... -> source file#index for game ids (build order = sorted src files)"""
import sys, json, glob, os
HERE = os.path.dirname(os.path.abspath(__file__))
c = sys.argv[1]; want = set(int(x) for x in sys.argv[2:]); n = 0; out = {}
for p in sorted(glob.glob(os.path.join(HERE, 'src', c + '-*.json'))):
    for i, q in enumerate(json.load(open(p))):
        if n in want: out[n] = (os.path.basename(p), i)
        n += 1
for k in sorted(out): print(c + '-' + str(k), out[k][0], out[k][1])
