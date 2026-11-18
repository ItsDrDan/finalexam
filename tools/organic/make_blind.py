#!/usr/bin/env python3
"""Blind-solve packets: make_blind.py OUTDIR  -> OUTDIR/<course>-<topic>.json (no keys, shuffled) + OUTDIR/keys.json"""
import sys, json, glob, os, random, re
HERE = os.path.dirname(os.path.abspath(__file__))
out = sys.argv[1]; os.makedirs(out, exist_ok=True)
keys = {}; packs = {}
rng = random.Random(2811)
for p in sorted(glob.glob(os.path.join(HERE, 'src', '28*-*.json'))):
    base = os.path.basename(p)[:-5]; course = base[:3]
    for i, q in enumerate(json.load(open(p))):
        qid = '%s#%d' % (base, i)
        order = list(range(4)); random.Random(qid).shuffle(order)
        ch = {}
        for L, k in zip('ABCD', order):
            txt = q['c'][k]
            item = {}
            if not str(txt).startswith('§'): item['text'] = txt
            if q.get('cs') and q['cs'][k]: item['structure_smiles'] = q['cs'][k]['smi'] + ((' ab=' + ','.join(q['cs'][k]['ab'])) if q['cs'][k].get('ab') else '')
            ch[L] = item
        keys[qid] = 'ABCD'[order.index(0)]
        item = {'id': qid, 'question': q['q'], 'choices': ch}
        if q.get('s'): item['scheme'] = [x if isinstance(x, str) else (x.get('smi') and ('SMILES ' + x['smi'] + ((' ab=' + ','.join(x['ab'])) if x.get('ab') else '') + ((' caption ' + x['cap']) if x.get('cap') else ''))) or ('ARROW ' + x.get('arrow', '') + ' / ' + x.get('below', '')) for x in q['s']]
        if q.get('f'): item['figures'] = q['f']
        topic = course + '-' + q['t']
        packs.setdefault(topic, []).append(item)
for t, items in packs.items(): json.dump(items, open(os.path.join(out, t + '.json'), 'w'), ensure_ascii=False, indent=0)
json.dump(keys, open(os.path.join(out, 'keys.json'), 'w'), indent=0)
print({t: len(v) for t, v in packs.items()})
