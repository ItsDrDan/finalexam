#!/usr/bin/env python3
"""S20: re-check simple arithmetic written out in explanations and why-wrong feedback.
Finds chains like "0.0300 L × 0.200 M = 0.00600 mol", "45.0 × 4.184 × 10.5 = 1977 J", "755 − 24 = 731"
and flags results that do not match the stated inputs (beyond rounding of the shown digits).
Also S21: hydrogen-atom wavelengths/energies vs E_n = -2.179e-18/n^2 (1A-713 truncation pattern).
Usage: python3 tools/audit-2026-11-18-acs/sweep/arith.py   (writes hits/S20_*.tsv, hits/S21_*.tsv)"""
import json, re, os, math, html
ROOT = os.path.join(os.path.dirname(__file__), '..', '..', '..')
OUT = os.path.join(os.path.dirname(__file__), 'hits')
SUP = str.maketrans('⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺', '0123456789-+')

def norm(s):
    s = s or ''
    s = re.sub(r'<sup>(.*?)</sup>', lambda m: '^' + m.group(1), s)
    s = re.sub(r'<[^>]+>', '', s)
    s = html.unescape(s)
    s = re.sub(r'[⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺]+', lambda m: '^' + m.group(0).translate(SUP), s)
    s = s.replace('−', '-').replace('–', '-').replace(' ', ' ').replace(' ', ' ').replace('\xa0', ' ')
    return s

NUM = r'(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d*)?(?:\s*[×x]\s*10\s*\^\s*\(?[-+]?\d+\)?)?|\.\d+(?:\s*[×x]\s*10\s*\^\s*\(?[-+]?\d+\)?)?'
UNIT = r'(?:\s*(?:[A-Za-zμ°%Å][A-Za-zμ°%Å0-9^\-·]*(?:/[A-Za-zμ°%Å0-9^\-·]+)?|\([A-Za-z0-9 ·/°]+\))){0,3}'
PAREN = re.compile(r'(?<![\w.^/)])((?:\(\s*-?(?:' + NUM + r')' + UNIT + r'\s*\)\s*){2,5})\s*(?:=|≈)\s*(-?(?:' + NUM + r'))(?![\d^])')
OPS = r'\s*([×x*÷/+\-])\s*'
CHAIN = re.compile(r'(?<![\w.^/])(-?(?:' + NUM + r'))' + UNIT + r'((?:' + OPS + r'\(?-?(?:' + NUM + r')\)?' + UNIT + r'){1,5})\s*(?:=|≈)\s*(-?(?:' + NUM + r'))(?![\d^])')

def val(s):
    s = s.replace(',', '').replace(' ', '')
    m = re.match(r'^(-?)([\d.]+)(?:[×x]10\^\(?([-+]?\d+)\)?)?$', s)
    if not m: return None, None
    mant = m.group(2); e = int(m.group(3)) if m.group(3) else 0
    v = float(mant) * 10 ** e * (-1 if m.group(1) else 1)
    # half unit of the last shown digit
    dec = len(mant.split('.')[1]) if '.' in mant else 0
    if '.' not in mant and mant.rstrip('0') != mant and len(mant) > 1:
        half = 0.5 * 10 ** (len(mant) - len(mant.rstrip('0'))) * 10 ** e  # trailing zeros ambiguous: be lenient
    else:
        half = 0.5 * 10 ** (-dec) * 10 ** e
    return v, half

STATS = {'chains': 0, 'paren': 0}
def check(text):
    out = []
    for m in PAREN.finditer(text):
        post = text[m.end():].lstrip()[:1]
        if post and post in '×x*/÷^(': continue
        pre = text[:m.start()].rstrip()[-1:]
        if pre and pre in '/÷+-': continue
        facs = re.findall(r'\(\s*(-?(?:' + NUM + r'))', m.group(1)); rv, rh = val(m.group(2))
        vs = [val(f) for f in facs]
        if rv is None or any(v[0] is None for v in vs): continue
        STATS['paren'] += 1
        tot = 1.0; rel = 0
        for v, h in vs: tot *= v; rel += h / abs(v) if v else 0
        if rv and any(abs(abs(tot) * k - abs(rv)) <= rh + abs(tot) * rel * k for k in (1, 100, 0.01, 1000, 0.001)): continue
        out.append((m.group(0).strip(), tot, rv))
    for m in CHAIN.finditer(text):
        first = m.group(1); rest = m.group(2); res = m.group(m.lastindex)
        pre = text[:m.start()].rstrip()[-1:]; post = text[m.end():].lstrip()[:1]
        if pre and (pre in '^()/×x*÷+-·[{' or pre.isdigit()): continue
        if '(' in m.group(0) or ')' in m.group(0): continue
        if post and post in '×x*/÷^(': continue
        if re.search(r'\d\s*[A-Za-z]\s*(?:[=+\-]|$)', m.group(0)) and re.search(r'\d(?:T|x|y|n)\b', m.group(0)): continue
        pairs = re.findall(OPS + r'\(?(-?(?:' + NUM + r'))\)?' + UNIT, rest)
        ops = [p[0] for p in pairs]; nums = [first] + [p[1] for p in pairs]
        if any(o in '+-' for o in ops) and any(o not in '+-' for o in ops): continue
        if 'x' in ops and not re.search(r'\d\s*x\s*\d', m.group(0)): pass
        vals = [val(n) for n in nums]; rv, rh = val(res)
        if rv is None or any(v[0] is None for v in vals): continue
        # skip things like "2 : 1", "10^-3", years, ranges "2500-3300"
        if '-' in ops and re.search(r'\d-\d', m.group(0)) and not re.search(r'\d\s-\s\d', m.group(0)): continue
        try:
            if all(o in '+-' for o in ops):
                tot = vals[0][0]; err = vals[0][1]
                for o, (v, h) in zip(ops, vals[1:]):
                    tot = tot + v if o == '+' else tot - v; err += h
            else:
                tot = vals[0][0]; rel = vals[0][1] / abs(vals[0][0]) if vals[0][0] else 0
                for o, (v, h) in zip(ops, vals[1:]):
                    if v == 0: raise ZeroDivisionError
                    tot = tot * v if o in '×x*' else tot / v; rel += h / abs(v)
                err = abs(tot) * rel
        except ZeroDivisionError:
            continue
        if rv and any(abs(tot * k - rv) <= rh + err * abs(k) for k in (100, 0.01, 1000, 0.001)): continue
        STATS['chains'] += 1
        diff = abs(tot - rv)
        if diff > rh + err + 1e-12 * max(1, abs(rv)) and not (rv != 0 and abs(abs(tot) - abs(rv)) <= rh + err):
            out.append((m.group(0).strip(), tot, rv))
    return out

def main():
    os.makedirs(OUT, exist_ok=True)
    hits20, hits21 = [], []
    E1 = 2.179e-18; h = 6.626e-34; c = 2.998e8
    lam = {}
    for hi in range(2, 8):
        for lo in range(1, hi):
            dE = E1 * (1 / lo ** 2 - 1 / hi ** 2); lam[(hi, lo)] = (h * c / dE * 1e9, dE)
    for course in ['3A', '3B', '1A', '1B', '28A', '28B']:
        bank = json.load(open(os.path.join(ROOT, 'data', f'bank-{course}.json')))
        for i, q in enumerate(bank):
            if course == '1B' and q.get('t') == 'nuclear': continue
            iid = f'{course}-{i}'
            fields = [('w', q.get('w')), ('h', q.get('h'))] + [(f'x{j}', s) for j, s in enumerate(q.get('x') or []) if j]
            for f, s in fields:
                for expr, tot, rv in check(norm(s)):
                    hits20.append(f'{iid}\t{q.get("t")}\t{f}: {expr}  → computes {tot:.6g}, states {rv:g}')
            # S21 hydrogen transitions
            alltext = ' '.join(norm(x) for x in [q.get('q'), q.get('w')] + list(q.get('c') or []) + list(q.get('x') or []))
            if re.search(r'hydrogen|H atom|Bohr|Balmer|Lyman|Paschen', alltext, re.I) and re.search(r'\bnm\b', alltext):
                for m in re.finditer(r'(\d+(?:\.\d+)?)\s*nm', alltext):
                    v = float(m.group(1)); best = min(lam.items(), key=lambda kv: abs(kv[1][0] - v) / kv[1][0])
                    rel = abs(best[1][0] - v) / best[1][0]
                    dec = len(m.group(1).split('.')[1]) if '.' in m.group(1) else 0
                    if rel < 0.01 and abs(best[1][0] - v) > 0.5 * 10 ** (-dec) * 1.0001:
                        hits21.append(f'{iid}\t{q.get("t")}\t{m.group(0)} vs {best[0][0]}→{best[0][1]} = {best[1][0]:.2f} nm (E_n data-sheet)')
    open(os.path.join(OUT, 'S20_arithmetic_in_feedback.tsv'), 'w').write('\n'.join(hits20) + '\n')
    open(os.path.join(OUT, 'S21_hydrogen_wavelengths.tsv'), 'w').write('\n'.join(sorted(set(hits21))) + '\n')
    print('evaluated', STATS)
    print('S20_arithmetic_in_feedback', len(hits20), 'items', len({x.split('\t')[0] for x in hits20}))
    print('S21_hydrogen_wavelengths', len(set(hits21)), 'items', len({x.split('\t')[0] for x in hits21}))

if __name__ == '__main__':
    main()
