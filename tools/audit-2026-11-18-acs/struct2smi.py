#!/usr/bin/env python3
"""Turn a Final Boss drawn structure ({a:[[label,x,y,lp,ch,lab,rad]...], b:[[i,j,order]...]}, order 4 = wedge, 5 = dash,
0 = dotted) into an isomeric SMILES with RDKit, so a reviewer can check what students actually SEE.
Wedge stereo is read from the drawing (y axis flipped from SVG to math orientation); E/Z from the 2D coordinates.
Labels that are groups (CO2H, OCH3, Ph ...) are expanded; anything unknown becomes a dummy atom [*] and is listed.
Usage as a module: smiles_of(struct) -> (smiles, notes)"""
import re
from rdkit import Chem, RDLogger
from rdkit.Chem import rdDepictor
from rdkit.Geometry import Point3D
RDLogger.DisableLog('rdApp.*')

SUBS = str.maketrans('₀₁₂₃₄₅₆₇₈₉⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻−', '01234567890123456789+--')
def clean(lbl):
    s = re.sub(r'<[^>]+>', '', str(lbl)).translate(SUBS).replace('&minus;', '-').replace('\u200b', '').strip()
    return s
GROUPS = {  # label -> SMILES fragment; first atom bonds to the drawing
 'COOH':'C(=O)O','CO2H':'C(=O)O','HOOC':'C(=O)O','HO2C':'C(=O)O','COO-':'C(=O)[O-]','CO2-':'C(=O)[O-]','-OOC':'C(=O)[O-]','-O2C':'C(=O)[O-]',
 'OCH3':'OC','H3CO':'OC','CH3O':'OC','MeO':'OC','OMe':'OC','CH2OH':'CO','HOCH2':'CO','HOH2C':'CO','CHO':'C=O','OHC':'C=O','CN':'C#N','NC':'C#N',
 'NO2':'[N+](=O)[O-]','O2N':'[N+](=O)[O-]','OCH2CH3':'OCC','OEt':'OCC','CH2CH3':'CC','Et':'CC','CH3CH2':'CC','NHCH3':'NC','N(CH3)2':'N(C)C','(CH3)2N':'N(C)C',
 'SCH3':'SC','CH3S':'SC','Ph':'c1ccccc1','C6H5':'c1ccccc1','OAc':'OC(C)=O','AcO':'OC(C)=O','COCH3':'C(C)=O','CH3CO':'C(C)=O','Ac':'C(C)=O',
 'CONH2':'C(N)=O','H2NOC':'C(N)=O','COOCH3':'C(=O)OC','CO2CH3':'C(=O)OC','CO2Me':'C(=O)OC','CO2Et':'C(=O)OCC','COOEt':'C(=O)OCC','COCl':'C(Cl)=O',
 'SO3H':'S(=O)(=O)O','HO3S':'S(=O)(=O)O','SO3-':'S(=O)(=O)[O-]','CF3':'C(F)(F)F','F3C':'C(F)(F)F','tBu':'C(C)(C)C','t-Bu':'C(C)(C)C','C(CH3)3':'C(C)(C)C','(CH3)3C':'C(C)(C)C',
 'iPr':'C(C)C','i-Pr':'C(C)C','CH(CH3)2':'C(C)C','(CH3)2CH':'C(C)C','Me':'C','CH3':'C','H3C':'C','CH2':'C','CH':'C','C':'C',
 'OPO3 2-':'OP(=O)([O-])[O-]','OPO32-':'OP(=O)([O-])[O-]','OPO3H-':'OP(=O)([O-])O','OPO3H2':'OP(=O)(O)O','PO3 2-':'P(=O)([O-])[O-]','PO32-':'P(=O)([O-])[O-]',
 'NH3+':'[NH3+]','+H3N':'[NH3+]','H3N+':'[NH3+]','NH2':'N','H2N':'N','NH':'N','HN':'N','OH':'O','HO':'O','SH':'S','HS':'S','O-':'[O-]','-O':'[O-]',
 'Bn':'Cc1ccccc1','CH2Ph':'Cc1ccccc1','OTs':'OS(=O)(=O)c1ccc(C)cc1','TsO':'OS(=O)(=O)c1ccc(C)cc1','OMs':'OS(C)(=O)=O','MsO':'OS(C)(=O)=O',
 'MgBr':'[Mg]Br','BrMg':'[Mg]Br','MgCl':'[Mg]Cl','Li':'[Li]','Na+':'[Na+]','K+':'[K+]','Cl-':'[Cl-]','Br-':'[Br-]','I-':'[I-]',
}
ELEM = re.compile(r'^(Cl|Br|Si|Se|Na|Li|Mg|Al|Sn|Zn|Cu|Fe|Hg|Pd|Os|Cr|Mn|B|C|N|O|F|P|S|I|K|H|D)$')
SIMPLE = re.compile(r'^(?:(H)(\d?))?(Cl|Br|Si|Se|Pt|Xe|Na|Mg|Li|Al|Zn|Cu|Fe|Hg|Pd|Os|Cr|Mn|Sn|Ca|K|B|C|N|O|F|P|S|I|D|H)(?:H(\d?))?([+-]?)$')

def smiles_of(m):
    notes = []
    atoms = m.get('a', []); bonds = m.get('b', [])
    rw = Chem.RWMol(); pos = []; idx = {}; lp = []
    for i, a in enumerate(atoms):
        lbl = clean(a[0]); x, y = a[1], -a[2]; ch = (a[4] if len(a) > 4 and a[4] else 0)
        rad = (a[6] if len(a) > 6 and a[6] else 0)
        mm = SIMPLE.match(lbl)
        if lbl == '' and m.get('skel'): lbl = 'C'; mm = SIMPLE.match('C')
        if mm and not (lbl in GROUPS and len(GROUPS[lbl]) > 4):
            el = mm.group(3); hs = int(mm.group(2) or mm.group(4) or (1 if (mm.group(1) or (len(lbl) > len(el) and 'H' in lbl)) else 0))
            if mm.group(1) and not mm.group(2): hs = 1
            if mm.group(4) == '' and 'H' in lbl.replace(el, '', 1): hs = max(hs, 1)
            at = Chem.Atom('H' if el == 'D' else el)
            if el == 'D': at.SetIsotope(2)
            if el == 'H': hs = 0
            sign = mm.group(5)
            if sign and not ch: ch = 1 if sign == '+' else -1
            at.SetFormalCharge(int(ch))
            if el != 'C' or not m.get('skel') or lbl != 'C':
                if m.get('skel') and el != 'H': at.SetNumExplicitHs(hs); at.SetNoImplicit(True)
                elif not m.get('skel'): at.SetNoImplicit(True)
            if el == 'C' and m.get('skel') and lbl == 'C' and (ch or rad):
                at.SetNoImplicit(False)
            if rad: at.SetNumRadicalElectrons(int(rad))
            if len(a) > 5 and a[5] and re.fullmatch(r'[a-z]', clean(a[5])): at.SetAtomMapNum(ord(clean(a[5])) - 96)
            k = rw.AddAtom(at); idx[i] = k; pos.append((k, x, y))
        elif lbl in GROUPS:
            frag = Chem.MolFromSmiles(GROUPS[lbl])
            base = rw.GetNumAtoms(); amap = {}
            for fa in frag.GetAtoms():
                na = Chem.Atom(fa.GetAtomicNum()); na.SetFormalCharge(fa.GetFormalCharge()); na.SetIsAromatic(fa.GetIsAromatic())
                amap[fa.GetIdx()] = rw.AddAtom(na)
            for fb in frag.GetBonds():
                rw.AddBond(amap[fb.GetBeginAtomIdx()], amap[fb.GetEndAtomIdx()], fb.GetBondType())
            if ch: rw.GetAtomWithIdx(amap[0]).SetFormalCharge(int(ch))
            if len(a) > 5 and a[5] and re.fullmatch(r'[a-z]', clean(a[5])): rw.GetAtomWithIdx(amap[0]).SetAtomMapNum(ord(clean(a[5])) - 96)
            idx[i] = amap[0]; pos.append((amap[0], x, y))
            for k2 in amap.values():
                if k2 != amap[0]: pos.append((k2, x + 0.01 * k2, y))
        else:
            at = Chem.Atom(0); at.SetProp('lbl', lbl); k = rw.AddAtom(at); idx[i] = k; pos.append((k, x, y)); notes.append('unknown label ' + repr(lbl))
    wedges = []
    for b in bonds:
        i, j, o = b[0], b[1], (b[2] if len(b) > 2 else 1)
        if i not in idx or j not in idx: continue
        if o == 0: notes.append('dotted line %s...%s' % (clean(atoms[i][0]), clean(atoms[j][0]))); continue
        bt = {1: Chem.BondType.SINGLE, 2: Chem.BondType.DOUBLE, 3: Chem.BondType.TRIPLE, 4: Chem.BondType.SINGLE, 5: Chem.BondType.SINGLE,
              1.5: Chem.BondType.AROMATIC, 6: Chem.BondType.SINGLE, 7: Chem.BondType.SINGLE}.get(o, Chem.BondType.SINGLE)
        if rw.GetBondBetweenAtoms(idx[i], idx[j]) is None:
            rw.AddBond(idx[i], idx[j], bt)
            if o in (4, 5): wedges.append((idx[i], idx[j], o))
    mol = rw.GetMol()
    conf = Chem.Conformer(mol.GetNumAtoms())
    for k, x, y in pos: conf.SetAtomPosition(k, Point3D(x, y, 0))
    mol.AddConformer(conf, assignId=True)
    for (i, j, o) in wedges:
        bd = mol.GetBondBetweenAtoms(i, j)
        if bd.GetBeginAtomIdx() != i: notes.append('wedge stored reversed'); 
        bd.SetBondDir(Chem.BondDir.BEGINWEDGE if o == 4 else Chem.BondDir.BEGINDASH)
    try:
        Chem.SanitizeMol(mol)
    except Exception as e:
        try:
            mol.UpdatePropertyCache(strict=False); Chem.SanitizeMol(mol, Chem.SanitizeFlags.SANITIZE_ALL ^ Chem.SanitizeFlags.SANITIZE_PROPERTIES)
            notes.append('valence problem: ' + str(e).split('\n')[0][:80])
        except Exception as e2:
            return None, notes + ['could not read drawing: ' + str(e2)[:80]]
    try:
        Chem.AssignChiralTypesFromBondDirs(mol)
        Chem.DetectBondStereochemistry(mol)
        Chem.AssignStereochemistry(mol, cleanIt=True, force=True)
        from rdkit.Chem import rdCIPLabeler
        rdCIPLabeler.AssignCIPLabels(mol)
        cip = [a.GetProp('_CIPCode') for a in mol.GetAtoms() if a.HasProp('_CIPCode')]
        if cip: notes.append('CIP ' + ','.join(cip))
    except Exception as e:
        notes.append('stereo error ' + str(e)[:60])
    try:
        h = Chem.RemoveHs(mol, sanitize=False) if not m.get('skel') else mol
        smi = Chem.MolToSmiles(h)
    except Exception:
        smi = Chem.MolToSmiles(mol)
    return smi, notes

def smiles_any(s):
    """s may be {smi:...} (organic src) or a drawn {a,b}"""
    if isinstance(s, dict) and 'smi' in s: return s['smi'], ['src smiles']
    if isinstance(s, dict) and 'a' in s: return smiles_of(s)
    return None, []
