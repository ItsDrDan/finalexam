#!/usr/bin/env python3
"""Blind-solve packets: make_blind.py OUTDIR [GLOB]  -> OUTDIR/<course>-<topic>.json (no keys, shuffled) + OUTDIR/keys.json
   GLOB defaults to 28*-*.json (all src files); e.g. '28?-zz-*.json' for one batch."""
import sys, json, glob, os, random, re
HERE = os.path.dirname(os.path.abspath(__file__))
out = sys.argv[1]; os.makedirs(out, exist_ok=True)
pat = sys.argv[2] if len(sys.argv) > 2 else '28*-*.json'
def arr(x):
    """curved arrows in words for a solver who cannot see the drawing (atom maps refer to the SMILES)"""
    if not x.get('arrows'): return ''
    e = lambda v: ('bond %d-%d' % tuple(v)) if isinstance(v, list) else ('atom map %d' % v)
    return ' ARROWS: ' + '; '.join(('fishhook' if a.get('half') else 'arrow') + ' from ' + e(a['from']) + ' to ' + e(a['to']) for a in x['arrows']) + (' (lone pairs drawn)' if x.get('lp') else '')
keys = {}; packs = {}
rng = random.Random(2811)
for p in sorted(glob.glob(os.path.join(HERE, 'src', pat))):
    base = os.path.basename(p)[:-5]; course = base[:3]
    for i, q in enumerate(json.load(open(p))):
        qid = '%s#%d' % (base, i)
        order = list(range(4)); random.Random(qid).shuffle(order)
        ch = {}
        for L, k in zip('ABCD', order):
            txt = q['c'][k]
            item = {}
            if not str(txt).startswith('§'): item['text'] = txt
            if q.get('cs') and q['cs'][k]: item['structure_smiles'] = q['cs'][k]['smi'] + ((' ab=' + ','.join(q['cs'][k]['ab'])) if q['cs'][k].get('ab') else '') + arr(q['cs'][k])
            ch[L] = item
        keys[qid] = 'ABCD'[order.index(0)]
        item = {'id': qid, 'question': q['q'], 'choices': ch}
        if q.get('s'): item['scheme'] = [x if isinstance(x, str) else (x.get('smi') and ('SMILES ' + x['smi'] + ((' ab=' + ','.join(x['ab'])) if x.get('ab') else '') + ((' caption ' + x['cap']) if x.get('cap') else '') + arr(x))) or ('ARROW ' + x.get('arrow', '') + ' / ' + x.get('below', '')) for x in q['s']]
        if q.get('f'): item['figures'] = q['f']
        topic = course + '-' + q['t']
        packs.setdefault(topic, []).append(item)
for t, items in packs.items(): json.dump(items, open(os.path.join(out, t + '.json'), 'w'), ensure_ascii=False, indent=0)
json.dump(keys, open(os.path.join(out, 'keys.json'), 'w'), indent=0)
print({t: len(v) for t, v in packs.items()})
