#!/usr/bin/env python3
"""Check and build the CHEM 28A / 28B question files.

  build_bank.py check src/28A-subst.json [...]   check files, print problems (run this on every file you write)
  build_bank.py build 28A                        build tools/organic/build/28A.json from all src/28A-*.json (sorted by name)

Authoring format: see AUTHORING.md.
"""
import sys, json, glob, os, re
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import chem

HERE = os.path.dirname(os.path.abspath(__file__))
TOPICS = {
 '28A': ['structure', 'nomenclature', 'acidbase', 'conform', 'stereo', 'mechanism', 'subst', 'elim', 'addition', 'alkynes', 'radical', 'synthesis', 'irms', 'nmr'],
 '28B': ['alcohols', 'ethers', 'conjugated', 'aromatic', 'eas', 'carbonyl', 'acidderiv', 'enolates', 'amines', 'spectro', 'synthesis', 'biomol'],
}
FIGS = {'table', 'eq', 'plot', 'fischer', 'haworth', 'newman', 'chair', 'energy', 'nmr', 'ir', 'ms'}
ALLOWED = {'t', 'q', 'c', 'h', 'w', 'x', 'k', 'd', 'f', 's', 'cs', 'lo', 'src', 'id'}
TAGRE = re.compile(r'</?([a-zA-Z]+)[^>]*>')
OKTAGS = {'b', 'i', 'sub', 'sup', 'br', 'u', 'em', 'strong', 'span'}

def mol_part(p, where, probs):
    try:
        d = chem.skel(p['smi'], ab=p.get('ab'), flip=p.get('flip', False), rot=p.get('rot', 0))
    except Exception as e:
        probs.append('%s: %s' % (where, e)); return None
    if p.get('cap'): d['cap'] = p['cap']
    return d

def html_ok(s, where, probs):
    for m in TAGRE.finditer(s):
        if m.group(1).lower() not in OKTAGS: probs.append('%s: tag <%s> not allowed' % (where, m.group(1)))
    if s.count('<b>') != s.count('</b>'): probs.append(where + ': unbalanced <b>')

def convert(q, course, n, probs):
    W = '%s %s' % (q.get('id', '#%d' % n), q.get('t', '?'))
    for k in q:
        if k not in ALLOWED: probs.append('%s: unknown field %s' % (W, k))
    for k in ['t', 'q', 'c', 'h', 'w', 'x', 'k', 'd']:
        if k not in q: probs.append('%s: missing %s' % (W, k))
    if probs and probs[-1].startswith(W + ': missing'): return None
    if q['t'] not in TOPICS[course]: probs.append('%s: topic %s is not a %s topic' % (W, q['t'], course))
    c = q['c']
    if not isinstance(c, list) or len(c) != 4 or len(set(c)) != 4: probs.append(W + ': c must be 4 different choices (c[0] is the key)')
    x = q['x']
    if not isinstance(x, list) or len(x) != 4 or x[0] != '' or not all(isinstance(v, str) and len(v) > 15 for v in x[1:]):
        probs.append(W + ': x must be ["", why-c1-is-wrong, why-c2-is-wrong, why-c3-is-wrong] with real sentences')
    if q['k'] not in (0, 1) or q['d'] not in (1, 2, 3): probs.append(W + ': k must be 0/1 and d 1/2/3')
    for fld in ['q', 'h', 'w']:
        if not isinstance(q[fld], str) or len(q[fld]) < 12: probs.append('%s: %s too short' % (W, fld))
        else: html_ok(q[fld], W + ' ' + fld, probs)
    for i, v in enumerate(c): html_ok(str(v), '%s c[%d]' % (W, i), probs)
    out = {k: q[k] for k in ['t', 'q', 'c', 'h', 'w', 'x', 'k', 'd']}
    lt = lambda v: re.sub(r'<(?![a-zA-Z/])', '&lt;', v) if isinstance(v, str) else v   # bare "<" in rankings (I < II) is text, not a tag
    for k in ['q', 'h', 'w']: out[k] = lt(out[k])
    out['c'] = [lt(v) for v in out['c']]; out['x'] = [lt(v) for v in out['x']]
    for k in ['lo', 'src']:
        if k in q: out[k] = q[k]
    if 'f' in q:
        for f in q['f']:
            if f.get('type') not in FIGS and not f.get('items'): probs.append('%s: figure type %s unknown' % (W, f.get('type')))
        out['f'] = q['f']
    if 's' in q:
        S = []
        for i, p in enumerate(q['s']):
            if isinstance(p, str) or 'arrow' in p: S.append(p)
            elif 'smi' in p:
                d = mol_part(p, '%s s[%d]' % (W, i), probs)
                if d: S.append(d)
            else: probs.append('%s s[%d]: part must be a string, {"arrow":..}, or {"smi":..}' % (W, i))
        out['s'] = S
    struct_only = [str(v).startswith('§') for v in c]
    if 'cs' in q:
        cs = q['cs']
        if len(cs) != 4: probs.append(W + ': cs needs 4 entries (use null for a text-only choice)')
        CS, cans = [], []
        for i, p in enumerate(cs):
            if p is None: CS.append(None); continue
            d = mol_part(p, '%s cs[%d]' % (W, i), probs); CS.append(d)
            try: cans.append(chem.canon(p['smi']) + '|' + json.dumps(p.get('ab')))
            except Exception: pass
        if len(set(cans)) != len(cans): probs.append(W + ': two structure choices are the same compound (check stereo)')
        out['cs'] = CS
        for i, so in enumerate(struct_only):
            if so and (len(cs) <= i or cs[i] is None): probs.append('%s: c[%d] is structure-only but cs[%d] is empty' % (W, i, i))
    elif any(struct_only): probs.append(W + ': § choices need cs')
    return out

def load(path):
    with open(path) as fh: return json.load(fh)

def check(paths):
    bad = 0; total = 0
    for p in paths:
        course = os.path.basename(p)[:3]
        if course not in TOPICS: print(p, ': file name must start with 28A- or 28B-'); bad += 1; continue
        try: qs = load(p)
        except Exception as e: print(p, ': not valid JSON:', e); bad += 1; continue
        probs = []; seen = set()
        for n, q in enumerate(qs):
            convert(q, course, n, probs)
            key = re.sub(r'\W+', '', q.get('q', '').lower())[:160]
            if key in seen and not q.get('s') and not q.get('f'): probs.append('#%d: duplicate question stem' % n)
            seen.add(key)
        total += len(qs)
        print('%s: %d questions, %d problems' % (p, len(qs), len(probs)))
        for x in probs: print('  -', x)
        bad += len(probs)
    print('TOTAL', total, 'questions;', bad, 'problems')
    return bad

def build(course):
    files = sorted(glob.glob(os.path.join(HERE, 'src', course + '-*.json')))
    out, probs = [], []
    for p in files:
        for n, q in enumerate(load(p)):
            d = convert(q, course, n, probs)
            if d: out.append(d)
    if probs:
        print('\n'.join(probs)); sys.exit(1)
    os.makedirs(os.path.join(HERE, 'build'), exist_ok=True)
    with open(os.path.join(HERE, 'build', course + '.json'), 'w') as fh: json.dump(out, fh, ensure_ascii=False, separators=(',', ':'))
    print(course, len(out), 'questions from', len(files), 'files')

if __name__ == '__main__':
    if sys.argv[1] == 'check': sys.exit(1 if check(sys.argv[2:]) else 0)
    elif sys.argv[1] == 'build': build(sys.argv[2])
    else: print(__doc__)
