#!/usr/bin/env python3
"""Organic structure helpers for the CHEM 28A/28B Final Boss banks (needs RDKit).

  chem.py info  "SMILES"            formula, MW, DBE, CIP labels, alkene E/Z, 1H/13C environment counts
  chem.py rel   "SMILES1" "SMILES2"  identical / enantiomers / diastereomers / constitutional isomers / different formulas
  chem.py skel  "SMILES"            the skeletal drawing object the game uses (JSON)
  chem.py png   "SMILES" out.png    picture (atom maps shown as letters) to eyeball a structure

SMILES conventions for the bank:
  [CH3:1]  atom map n  -> orange circled tag letter (1=a, 2=b, ...), for "which atom/proton" questions.
  [1*] [2*] dummy atoms with isotope n -> abbreviation from the question's "ab" list (e.g. ["OTs","Ph"]).
  Stereo with @/@@ and / \\ ; drawn with wedges/dashes automatically.
"""
import sys, json
from rdkit import Chem, RDLogger
from rdkit.Chem import AllChem, Descriptors, rdMolDescriptors, rdDepictor, rdCIPLabeler
RDLogger.DisableLog('rdApp.*')
rdDepictor.SetPreferCoordGen(True)

def mol(smi):
    m = Chem.MolFromSmiles(smi)
    if m is None: raise ValueError('bad SMILES: ' + smi)
    return m

def strip_maps(m):
    m = Chem.Mol(m)
    for a in m.GetAtoms(): a.SetAtomMapNum(0)
    return m

def canon(smi, iso=True):
    return Chem.MolToSmiles(strip_maps(mol(smi)), isomericSmiles=iso)

def formula(m): return rdMolDescriptors.CalcMolFormula(m)

def cip(m):
    m = Chem.Mol(m); rdCIPLabeler.AssignCIPLabels(m)
    out = []
    for a in m.GetAtoms():
        if a.HasProp('_CIPCode'):
            out.append({'idx': a.GetIdx(), 'el': a.GetSymbol(), 'map': a.GetAtomMapNum(), 'cip': a.GetProp('_CIPCode')})
    for b in m.GetBonds():
        if b.HasProp('_CIPCode'):
            out.append({'bond': [b.GetBeginAtomIdx(), b.GetEndAtomIdx()], 'cip': b.GetProp('_CIPCode')})
    return out

def env_counts(m):
    """Topologically distinct C and H environments (13C signals, 1H signals ignoring diastereotopic splitting)."""
    m0 = strip_maps(m)
    mh = Chem.AddHs(m0)
    ranks = list(Chem.CanonicalRankAtoms(mh, breakTies=False, includeChirality=False))
    c = {ranks[a.GetIdx()] for a in mh.GetAtoms() if a.GetSymbol() == 'C'}
    h = {}
    for a in mh.GetAtoms():
        if a.GetSymbol() == 'H':
            h.setdefault(ranks[a.GetIdx()], []).append(a.GetNeighbors()[0].GetSymbol() + str(a.GetNeighbors()[0].GetIdx()))
    return len(c), len(h), sorted(len(v) for v in h.values())

def info(smi):
    m = mol(smi)
    nC, nH, hint = env_counts(m)
    f = formula(strip_maps(m))
    ring = rdMolDescriptors.CalcNumRings(m)
    pi = sum(1 for b in m.GetBonds() if b.GetBondTypeAsDouble() == 2) + 2 * sum(1 for b in m.GetBonds() if b.GetBondTypeAsDouble() == 3)
    return {'canonical': canon(smi), 'formula': f, 'MW': round(Descriptors.MolWt(strip_maps(m)), 2),
            'exact_mass': round(Descriptors.ExactMolWt(strip_maps(m)), 4),
            'DBE': rings_pi(m), 'stereo': cip(m),
            'n_13C_signals': nC, 'n_1H_signals_topological': nH, 'H_per_signal': hint,
            'note': 'Topological counts: diastereotopic H (CH2 next to a stereocenter, =CH2 protons, cis/trans groups on one alkene carbon) are counted as one signal; work those by hand'}

def rings_pi(m):
    c = h = n = x = 0
    for a in Chem.AddHs(strip_maps(m)).GetAtoms():
        s = a.GetSymbol()
        if s == 'C': c += 1
        elif s == 'H': h += 1
        elif s == 'N': n += 1
        elif s in ('F', 'Cl', 'Br', 'I'): x += 1
    return (2 * c + 2 + n - h - x) / 2

def rel(s1, s2):
    m1, m2 = strip_maps(mol(s1)), strip_maps(mol(s2))
    if formula(m1) != formula(m2): return 'different molecular formulas (not isomers)'
    c1, c2 = Chem.MolToSmiles(m1), Chem.MolToSmiles(m2)
    if c1 == c2: return 'identical (same compound)'
    if Chem.MolToSmiles(m1, isomericSmiles=False) != Chem.MolToSmiles(m2, isomericSmiles=False):
        return 'constitutional isomers'
    # mirror image of m1
    mir = Chem.MolFromSmiles(c1.replace('@@', '!!').replace('@', '@@').replace('!!', '@'))
    if mir is not None and Chem.MolToSmiles(mir) == c2: return 'enantiomers'
    return 'diastereomers (stereoisomers, not mirror images; includes cis/trans and E/Z isomers)'

LETTERS = 'abcdefghijklmnopqrstuvwxyz'

def label_for(a, ab):
    s = a.GetSymbol()
    if s == '*':
        iso = a.GetIsotope()
        if not ab or iso < 1 or iso > len(ab): raise ValueError('dummy atom [%d*] has no abbreviation in "ab"' % iso)
        return ab[iso - 1]
    if s == 'C': return 'C'
    if s == 'H': return 'D' if a.GetIsotope() == 2 else ('T' if a.GetIsotope() == 3 else 'H')
    h = a.GetTotalNumHs()
    return s + ('H' + (str(h) if h > 1 else '') if h else '')

VE = {'N': 5, 'O': 6, 'S': 6, 'F': 7, 'Cl': 7, 'Br': 7, 'I': 7, 'C': 4}

def lone_pairs(a):
    """Nonbonding electron pairs on an atom of a Kekulized molecule (heteroatoms; carbon only as a carbanion)."""
    s = a.GetSymbol()
    if s not in VE or (s == 'C' and a.GetFormalCharge() >= 0): return 0
    bonds = sum(int(b.GetBondTypeAsDouble()) for b in a.GetBonds()) + a.GetTotalNumHs()
    nb = VE[s] - a.GetFormalCharge() - bonds - a.GetNumRadicalElectrons()
    return max(0, nb // 2)

def resolve_end(e, idx, where):
    """Arrow end: an anchor map number (atom) or a pair [m1, m2] (the bond between those atoms)."""
    if isinstance(e, list):
        if len(e) != 2: raise ValueError(where + ': a bond end must be [map1, map2]')
        return [resolve_end(e[0], idx, where), resolve_end(e[1], idx, where)]
    if e not in idx: raise ValueError('%s: no atom with map %s in the SMILES' % (where, e))
    return idx[e]

def skel(smi, ab=None, flip=False, rot=0, arrows=None, lp=None, layout=None):
    if arrows:
        # mechanism drawings keep explicit [H] atoms (an E2 base takes a drawn H)
        ps = Chem.SmilesParserParams(); ps.removeHs = False
        m = Chem.MolFromSmiles(smi, ps)
        if m is None: raise ValueError('bad SMILES: ' + smi)
    else:
        m = mol(smi)
    m = Chem.Mol(m)
    Chem.Kekulize(m, clearAromaticFlags=True)
    # bridged rings (norbornane etc.): RDKit's own layout matches the textbook drawing; CoordGen draws them oddly
    bridged = rdMolDescriptors.CalcNumBridgeheadAtoms(m) > 0
    if bridged: rdDepictor.SetPreferCoordGen(False)
    try: rdDepictor.Compute2DCoords(m)
    finally: rdDepictor.SetPreferCoordGen(True)
    if layout:
        # cyclic transition states (Diels-Alder, Cope/Claisen, decarboxylation): lay the drawing out as if the bonds being
        # formed were already there, so the reacting atoms sit on a ring; those bonds are not drawn
        idx = {a.GetAtomMapNum(): a.GetIdx() for a in m.GetAtoms() if a.GetAtomMapNum()}
        rw = Chem.RWMol(m)
        for pr in layout:
            if len(pr) != 2 or pr[0] not in idx or pr[1] not in idx: raise ValueError('layout pair %s: needs two atom maps from the SMILES' % (pr,))
            if rw.GetBondBetweenAtoms(idx[pr[0]], idx[pr[1]]) is None: rw.AddBond(idx[pr[0]], idx[pr[1]], Chem.BondType.SINGLE)
        t = rw.GetMol(); t.UpdatePropertyCache(strict=False); Chem.FastFindRings(t)
        if rdMolDescriptors.CalcNumBridgeheadAtoms(t) > 0: rdDepictor.SetPreferCoordGen(False)
        try: rdDepictor.Compute2DCoords(t)
        finally: rdDepictor.SetPreferCoordGen(True)
        m.RemoveAllConformers(); m.AddConformer(Chem.Conformer(t.GetConformer()), assignId=True)
    if rot:
        import math
        conf = m.GetConformer(); t = math.radians(rot)
        for i in range(m.GetNumAtoms()):
            p = conf.GetAtomPosition(i); conf.SetAtomPosition(i, (p.x*math.cos(t)-p.y*math.sin(t), p.x*math.sin(t)+p.y*math.cos(t), 0))
    Chem.WedgeMolBonds(m, m.GetConformer())
    conf = m.GetConformer()
    # separate fragments (ion pairs, salts) side by side with a clear gap so labels and charges don't touch
    frags = Chem.GetMolFrags(m)
    if len(frags) > 1 and not layout:
        x_end = None
        # mechanism drawings keep SMILES order (left to right) so the attacking species sits where the author put it
        order = list(frags) if arrows else sorted(frags, key=lambda f: min(conf.GetAtomPosition(i).x for i in f))
        for fr in order:
            xs_f = [conf.GetAtomPosition(i).x for i in fr]
            ys_f = [conf.GetAtomPosition(i).y for i in fr]
            cy = (min(ys_f) + max(ys_f)) / 2
            dx = 0 if x_end is None else (x_end + 1.6 - min(xs_f))
            for i in fr:
                q = conf.GetAtomPosition(i); conf.SetAtomPosition(i, (q.x + dx, q.y - cy, 0))
            x_end = max(xs_f) + dx
    xs = [conf.GetAtomPosition(i).x for i in range(m.GetNumAtoms())]
    ys = [conf.GetAtomPosition(i).y for i in range(m.GetNumAtoms())]
    # RDKit bond length is 1.5; the game's skeletal unit is the same scale. Screen y points down.
    sx = -1 if flip else 1
    x0, y0 = min(sx * x for x in xs), min(-y for y in ys)
    A = []
    for a in m.GetAtoms():
        i = a.GetIdx()
        mp = a.GetAtomMapNum()
        if 26 < mp < 51: raise ValueError('atom map %d: use 1-26 for lettered tags or 51-99 for invisible arrow anchors' % mp)
        tag = LETTERS[mp - 1] if 0 < mp <= 26 else ''
        npair = 0
        if lp is True: npair = lone_pairs(a)
        elif isinstance(lp, list) and mp in lp: npair = lone_pairs(a)
        row = [label_for(a, ab), round(1.5 * (sx * xs[i] - x0), 3), round(1.5 * (-ys[i] - y0), 3), npair, a.GetFormalCharge()]
        rad = a.GetNumRadicalElectrons()
        if tag or rad: row.append(tag)
        if rad: row.append(rad)
        A.append(row)
    B = []
    for b in m.GetBonds():
        i, j = b.GetBeginAtomIdx(), b.GetEndAtomIdx()
        o = int(b.GetBondTypeAsDouble())
        d = b.GetBondDir()
        # a left-right mirror of the drawing must swap wedges and dashes, or it would show the enantiomer
        if d == Chem.BondDir.BEGINWEDGE: o = 5 if flip else 4
        elif d == Chem.BondDir.BEGINDASH: o = 4 if flip else 5
        B.append([i, j, o])
    d = {'skel': True, 'a': A, 'b': B}
    if arrows:
        idx = {a.GetAtomMapNum(): a.GetIdx() for a in m.GetAtoms() if a.GetAtomMapNum()}
        bonded = {frozenset((b[0], b[1])) for b in B}
        AR = []
        for k, ar in enumerate(arrows):
            w = 'arrow %d' % (k + 1)
            f, t = resolve_end(ar['from'], idx, w), resolve_end(ar['to'], idx, w)
            for e in (f, t):
                if isinstance(e, list) and frozenset(e) not in bonded: raise ValueError(w + ': [%s] is not a bond in the drawing' % ','.join(map(str, e)))
            if isinstance(f, int) and not isinstance(t, list) and f == t: raise ValueError(w + ': starts and ends on the same atom')
            if isinstance(f, int) and A[f][3] == 0 and A[f][0] != 'C' and not ar.get('half'):
                raise ValueError(w + ': starts on an atom with no drawn lone pair; add "lp" for it or start from a bond')
            r = [f, t, 1 if ar.get('half') else 0, int(ar.get('side', 0)) * (-1 if flip else 1)]
            AR.append(r)
        d['ar'] = AR
    return d

def png(smi, out):
    from rdkit.Chem import Draw
    m = mol(smi)
    for a in m.GetAtoms():
        if a.GetAtomMapNum(): a.SetProp('atomNote', LETTERS[a.GetAtomMapNum() - 1]); a.SetAtomMapNum(0)
    Draw.MolToFile(m, out, size=(500, 350))

if __name__ == '__main__':
    cmd, *rest = sys.argv[1:]
    if cmd == 'info': print(json.dumps(info(rest[0]), indent=1))
    elif cmd == 'rel': print(rel(rest[0], rest[1]))
    elif cmd == 'skel': print(json.dumps(skel(rest[0])))
    elif cmd == 'png': png(rest[0], rest[1]); print('wrote', rest[1])
    elif cmd in ('chair', 'ring'): pass
    else: print(__doc__)

def chair(spec):
    """spec like '1:up:CH3,3:down:OH' -> axial/equatorial in both chairs.
    Drawing convention (figure type 'chair'): in chair A (flip:false) C1, C3, C5 have their axial bond pointing UP and
    C2, C4, C6 pointing DOWN; chair B (flip:true) is the ring-flipped chair, where every axial group becomes equatorial."""
    out = {'A': [], 'B': []}
    for part in spec.split(','):
        n, ud, lab = part.split(':')
        n = int(n); up_ax = (n % 2 == 1)
        ax_A = (ud == 'up') == up_ax
        out['A'].append('C%d %s %s: %s' % (n, ud, lab, 'axial' if ax_A else 'equatorial'))
        out['B'].append('C%d %s %s: %s' % (n, ud, lab, 'equatorial' if ax_A else 'axial'))
    return out

if __name__ == '__main__' and len(sys.argv) > 2 and sys.argv[1] == 'chair':
    print(json.dumps(chair(sys.argv[2]), indent=1))

def ring_faces(smi):
    """For each ring atom carrying one non-H substituent and one H: which face ('up'/'down') the substituent is on,
    measured against that atom's own H in a 3D model (local ring normal), plus cis/trans for every pair in the same ring."""
    import numpy as np
    from rdkit.Chem import AllChem
    m = Chem.AddHs(strip_maps(mol(smi)))
    if AllChem.EmbedMolecule(m, randomSeed=7) != 0: raise ValueError('3D embedding failed')
    AllChem.MMFFOptimizeMolecule(m)
    P = m.GetConformer().GetPositions(); ri = m.GetRingInfo(); out = {'faces': {}, 'pairs': []}
    for ring in ri.AtomRings():
        if len(ring) > 8: continue
        c = P[list(ring)].mean(axis=0); u, s, vt = np.linalg.svd(P[list(ring)] - c); n = vt[2]
        face = {}
        for i in ring:
            a = m.GetAtomWithIdx(i); subs = [x.GetIdx() for x in a.GetNeighbors() if x.GetIdx() not in ring]
            heavy = [j for j in subs if m.GetAtomWithIdx(j).GetSymbol() != 'H']; hs = [j for j in subs if m.GetAtomWithIdx(j).GetSymbol() == 'H']
            if len(heavy) == 1 and len(hs) == 1:
                face[i] = 'up' if np.dot(P[heavy[0]] - P[i], n) > np.dot(P[hs[0]] - P[i], n) else 'down'
                out['faces'][i] = (m.GetAtomWithIdx(heavy[0]).GetSymbol() + str(heavy[0]), face[i])
        ks = sorted(face)
        for x in range(len(ks)):
            for y in range(x + 1, len(ks)):
                out['pairs'].append('ring atoms %d,%d: %s' % (ks[x], ks[y], 'cis' if face[ks[x]] == face[ks[y]] else 'trans'))
    return out

if __name__ == '__main__' and len(sys.argv) > 2 and sys.argv[1] == 'ring':
    print(json.dumps(ring_faces(sys.argv[2]), indent=1))
