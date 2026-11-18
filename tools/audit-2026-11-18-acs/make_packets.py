#!/usr/bin/env python3
"""Write one plain-text review packet per chunk of each bank: every field a student sees, structures as the SMILES
of the drawing actually shown (struct2smi.py), figures as compact JSON. Usage: make_packets.py OUTDIR [chunk]"""
import json, sys, os, re
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from struct2smi import smiles_of
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')
out = sys.argv[1]; size = int(sys.argv[2]) if len(sys.argv) > 2 else 200
os.makedirs(out, exist_ok=True)
def st(s):
    if not isinstance(s, dict): return json.dumps(s, ensure_ascii=False)
    if 'a' in s:
        smi, notes = smiles_of(s)
        extra = ''
        if not s.get('skel'):
            lps = ['%s%d:lp%d%s' % (re.sub('<[^>]+>', '', str(a[0])), i, a[3] if len(a) > 3 else 0, ('/ch%+d' % a[4]) if len(a) > 4 and a[4] else '') for i, a in enumerate(s['a']) if str(a[0]) != 'H']
            extra = ' LEWIS[' + ' '.join(lps) + ']'
        lab = [str(a[5]) for a in s['a'] if len(a) > 5 and a[5]]
        cap = (' cap=' + re.sub('<[^>]+>', '', str(s.get('cap')))) if s.get('cap') else ''
        return 'DRAWN ' + (smi or '??') + extra + (' labels=' + ','.join(lab) + ' (atom map :1=a, :2=b, :3=c ... marks the labeled atom)' if lab else '') + cap + ((' {' + '; '.join(notes) + '}') if notes else '')
    if 'arrow' in s: return '--[' + str(s.get('arrow', '')) + (' / ' + str(s.get('below')) if s.get('below') else '') + ']-->'
    if 'smi' in s: return 'SMI ' + s['smi']
    d = dict(s); return json.dumps(d, ensure_ascii=False)
def fig(f):
    f = dict(f)
    for key in ('items',):
        pass
    return json.dumps(f, ensure_ascii=False, separators=(',', ':'))
manifest = []
for c in ['3A', '3B', '1A', '1B', '28A', '28B']:
    bank = json.load(open(os.path.join(ROOT, 'data', 'bank-%s.json' % c)))
    for start in range(0, len(bank), size):
        lines = []
        for i in range(start, min(start + size, len(bank))):
            q = bank[i]
            lines.append('=== %s-%d | topic=%s | d=%s | calc=%s%s' % (c, i, q['t'], q.get('d'), q.get('k'), ' | lo' if q.get('lo') else ''))
            lines.append('Q: ' + q['q'])
            for s_ in (q.get('s') or []): lines.append('  STEM-STRUCT: ' + st(s_))
            for f in (q.get('f') or []): lines.append('  FIG: ' + fig(f))
            for k, ch in enumerate(q['c']):
                lines.append(('KEY ' if k == 0 else 'c%d  ' % k) + 'c%d: %s' % (k, ch))
                if q.get('cs') and k < len(q['cs']) and q['cs'][k]: lines.append('      DRAWN-CHOICE: ' + st(q['cs'][k]))
                if k and q.get('x') and k < len(q['x']): lines.append('      why-wrong x%d: %s' % (k, q['x'][k]))
            lines.append('HINT: ' + q.get('h', ''))
            lines.append('EXPL: ' + q.get('w', ''))
        name = '%s_%04d-%04d.txt' % (c, start, min(start + size, len(bank)) - 1)
        open(os.path.join(out, name), 'w').write('\n'.join(lines) + '\n')
        manifest.append((name, os.path.getsize(os.path.join(out, name))))
for n, s in manifest: print(n, s)
