#!/usr/bin/env node
/* Final Boss question-bank validator.
   Usage: node tools/validate_bank.js [index.html] [--json out.json] [--all]
   Reads the four bank-XX JSON blocks straight from index.html (it never writes to it).
   ERROR = must fix before a push. WARN = a person should look. INFO = statistics only (shown with --all).
   A question id is course + "-" + its position in the bank (the same id the game uses), so never insert or delete
   in the middle of a bank: add new questions at the end. */
const fs = require('fs'), path = require('path');
const args = process.argv.slice(2);
const file = args.find(a => !a.startsWith('--') && a.endsWith('.html')) || path.join(__dirname, '..', 'index.html');
const jsonOut = args.includes('--json') ? args[args.indexOf('--json') + 1] : null;
const html = fs.readFileSync(file, 'utf8');

const TOPICS = {
  '3A': ['measure','atoms','electrons','matter','naming','moles','bonding','energy','gases','solutions','reactions','stoich','acids','equilibrium','nuclear'],
  '3B': ['structure','hydrocarbons','isomers','properties','aromatic','alcohols','carbonyls','chirality','acids_esters','amines','carbs','lipids','proteins','enzymes','nucleic','metabolism'],
  '1A': ['measure','atoms','composition','reactions','thermo','quantum','periodic','bonding','advanced','gases','liquids','solutions'],
  '1B': ['kinetics','equilibrium','acidbase','buffers','solubility','thermo','electro','coordination','imf','colligative','nuclear'] };
const FIG = ['table','eq','plot','mo','modiag','particles','cylinder','buret','ruler','balance','targets','cycle','path','fischer','haworth','orbitals','ptgrid','cell','spectrum','enzyme'];
const TAG_OK = /^<\/?(b|i|sub|sup|br|em|strong|u|small)>$|^<span class="(nw|ss|ss pre)">$|^<\/span>$/;
const MASS = {H:1.008,He:4.003,Li:6.941,Be:9.012,B:10.81,C:12.01,N:14.01,O:16.00,F:19.00,Ne:20.18,Na:22.99,Mg:24.31,Al:26.98,Si:28.09,P:30.97,S:32.07,Cl:35.45,Ar:39.95,K:39.10,Ca:40.08,Sc:44.96,Ti:47.88,V:50.94,Cr:52.00,Mn:54.94,Fe:55.85,Co:58.93,Ni:58.69,Cu:63.55,Zn:65.39,Ga:69.72,Ge:72.61,As:74.92,Se:78.96,Br:79.90,Kr:83.80,Rb:85.47,Sr:87.62,Zr:91.22,Mo:95.94,Ag:107.9,Cd:112.4,Sn:118.7,Sb:121.8,Te:127.6,I:126.9,Xe:131.3,Cs:132.9,Ba:137.3,W:183.8,Pt:195.1,Au:197.0,Hg:200.6,Pb:207.2,Bi:209.0,U:238.0};

const bank = {};
for (const c of Object.keys(TOPICS)) {
  const m = html.match(new RegExp('<script type="application/json" id="bank-' + c + '">([\\s\\S]*?)</script>'));
  if (!m) { console.error('ERROR: bank-' + c + ' block not found'); process.exit(2); }
  bank[c] = JSON.parse(m[1]);
}

/* reviewed warnings that are fine as they stand: tools/validate_allow.json holds {"id code": "reason"} */
const allowFile = path.join(__dirname, 'validate_allow.json');
const ALLOW = fs.existsSync(allowFile) ? JSON.parse(fs.readFileSync(allowFile, 'utf8')) : {};
const out = []; let allowed = 0;
const flag = (lvl, id, code, msg) => { if (lvl === 'WARN' && ALLOW[id + ' ' + code]) { allowed++; return; } out.push({ lvl, id, code, msg }); };
const strip = s => String(s).replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/​/g, '');
const norm = s => strip(s).toLowerCase().replace(/[\s ]+/g, ' ').replace(/[.]$/, '').trim();
const SUPS = { '⁰':'0','¹':'1','²':'2','³':'3','⁴':'4','⁵':'5','⁶':'6','⁷':'7','⁸':'8','⁹':'9','⁻':'-','⁺':'+' };
/* plain text with exponents written as ^(...) so 3.9×10<sup>−11</sup> and 3.9×10⁻¹¹ read the same */
const flat = s => strip(String(s).replace(/<sup>(.*?)<\/sup>/g, '^($1)')).replace(/([⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺]+)/g, m => '^(' + [...m].map(ch => SUPS[ch]).join('') + ')').replace(/[−–]/g, '-');
/* first number in a string: handles 1.5×10^(−3), 1.5 × 10^(3), 2,500 */
function numsOf(s) {
  const t = flat(s).replace(/(\d),(\d{3})(?!\d)/g, '$1$2'), res = [];
  const re = /(-?\d+(?:\.\d+)?)(?:\s*[×x]\s*10\^\((-?\+?\d+)\))?|10\^\((-?\d+)\)/g; let m;
  while ((m = re.exec(t))) {
    if (m[3] !== undefined) res.push(Math.pow(10, +m[3]));
    else res.push(m[2] !== undefined ? +m[1] * Math.pow(10, +m[2]) : +m[1]);
  }
  return res;
}
const close = (a, b, rel = 1e-9) => Math.abs(a - b) <= rel * Math.max(Math.abs(a), Math.abs(b), 1e-300);

/* ---------- chemical formula tools ---------- */
function parseFormula(str) {           // "Ca3(PO4)2" (plain, subscripts as digits) → {Ca:3,P:2,O:8} or null
  let i = 0; const s = str;
  function group(end) {
    const cnt = {};
    while (i < s.length && s[i] !== end) {
      let part;
      if (s[i] === '(' || s[i] === '[') { const close = s[i] === '(' ? ')' : ']'; i++; part = group(close); if (part === null || s[i] !== close) return null; i++; }
      else { const m = /^[A-Z][a-z]?/.exec(s.slice(i)); if (!m || !(m[0] in MASS)) return null; i += m[0].length; part = { [m[0]]: 1 }; }
      const n = /^\d+/.exec(s.slice(i)); let k = 1; if (n) { k = +n[0]; i += n[0].length; }
      for (const e in part) cnt[e] = (cnt[e] || 0) + part[e] * k;
    }
    return cnt;
  }
  const r = group(undefined); return (r && i === s.length && Object.keys(r).length) ? r : null;
}
const molarMass = cnt => Object.entries(cnt).reduce((n, [e, k]) => n + MASS[e] * k, 0);
/* species from HTML such as "2 Fe<sup>3+</sup>(aq)" → {coef, atoms, charge} */
function parseSpecies(h) {
  let t = h.replace(/&nbsp;/g, ' ').trim().replace(/^\(/, '').replace(/^½\s*/, '1/2 ').replace(/^¼\s*/, '1/4 ').replace(/^(\d)\/(\d)\s+/, '$1/$2 ');
  let charge = 0;
  t = t.replace(/<sup>\s*(\d*)\s*([+−–-])\s*<\/sup>/g, (m, n, sg) => { charge += (n ? +n : 1) * (sg === '+' ? 1 : -1); return ''; });
  t = t.replace(/([²³⁴]?)([⁺⁻])/g, (m, n, sg) => { charge += (n ? +SUPS[n] : 1) * (sg === '⁺' ? 1 : -1); return ''; });
  t = t.replace(/[₀-₉]/g, ch => String(ch.charCodeAt(0) - 0x2080));
  if (/<sup>/.test(t)) return null;
  t = t.replace(/<\/?sub>/g, '').replace(/<[^>]+>/g, '');
  t = t.replace(/\((aq|s|l|g)\)/g, '').trim();
  const m = /^(\d+(?:\/\d+)?(?:\.\d+)?)?\s*(.+)$/.exec(t); if (!m) return null;
  let coef = 1; if (m[1]) coef = m[1].includes('/') ? (+m[1].split('/')[0]) / (+m[1].split('/')[1]) : +m[1];
  let f = m[2].replace(/\s+/g, '');
  if (f === 'e' || f === 'e-') return { coef, atoms: {}, charge: -1 };
  f = f.replace(/[·•]\d*H2O$/, w => { return w; });
  let extra = null; const hyd = /^(.*)[·•](\d*)H2O$/.exec(f);
  if (hyd) { f = hyd[1]; extra = +(hyd[2] || 1); }
  const atoms = parseFormula(f); if (!atoms) return null;
  if (extra) { atoms.H = (atoms.H || 0) + 2 * extra; atoms.O = (atoms.O || 0) + extra; }
  return { coef, atoms, charge };
}
/* returns null if the text is not a parseable equation; else {ok, diff} */
function checkEquation(h) {
  const parts = h.replace(/\s{2,}.*$/, '').split(/→|⟶|⇌/); if (parts.length !== 2) return null;
  const terms = parts.map(p => p.split(/\s\+\s/).map(t => t.trim()));
  /* the first term may start with words ("In acid: 2 MnO4− ...") and the last may end with them: keep the part that reads as a species */
  const lead = t => { const w = t.replace(/½\s*/, '1/2 ').replace(/¼\s*/, '1/4 ').split(/\s+/); for (let k = Math.min(2, w.length); k >= 1; k--) { const sp = parseSpecies(w.slice(-k).join(' ')); if (sp && (k === 1 || /^\d+(\/\d+)?$/.test(w[w.length - 2]))) return sp; } return null; };
  const tail = t => { const w = t.split(/\s+/); for (let k = Math.min(2, w.length); k >= 1; k--) { if (k === 2 && !/^\d+(\/\d+)?$/.test(w[0])) continue; const sp = parseSpecies(w.slice(0, k).join(' ').replace(/[.,;:)]+$/, '')); if (sp) return sp; } return null; };
  const sides = terms.map((ts, side) => ts.map((t, j) => (side === 0 && j === 0) ? lead(t) : (side === 1 && j === ts.length - 1) ? tail(t) : parseSpecies(t)));
  if (sides.some(s => s.some(x => !x)) || sides[0].length + sides[1].length < 3) return null;   /* "Zn → Zn2+" and "N → C" are not full equations */
  const tot = [{}, {}];
  sides.forEach((s, k) => s.forEach(sp => { for (const e in sp.atoms) tot[k][e] = (tot[k][e] || 0) + sp.coef * sp.atoms[e]; tot[k]['charge'] = (tot[k]['charge'] || 0) + sp.coef * sp.charge; }));
  const diff = []; for (const e of new Set([...Object.keys(tot[0]), ...Object.keys(tot[1])])) if (Math.abs((tot[0][e] || 0) - (tot[1][e] || 0)) > 1e-6) diff.push(e + ' ' + (tot[0][e] || 0) + '→' + (tot[1][e] || 0));
  return { ok: !diff.length, diff };
}

/* ---------- drawn structures ---------- */
const GROUP_H = { OH: ['O', 1], SH: ['S', 1], NH2: ['N', 2], NH: ['N', 1], NH3: ['N', 3], NH4: ['N', 4], CH3: ['C', 3], CH2: ['C', 2], H2O: ['O', 2] };
const VAL = { C: 4, N: 3, O: 2, S: 2, H: 1, F: 1, Cl: 1, Br: 1, I: 1, P: 3, B: 3 };
function structInfo(o) {                 // → {formula, problems[]} for one drawing object
  const problems = [], cnt = {};
  if (!o || !Array.isArray(o.a) || !Array.isArray(o.b)) return { formula: null, problems: ['not a drawing object'] };
  const deg = o.a.map(() => 0), hb = o.a.map(() => 0);
  o.b.forEach(b => {
    if (!(b[0] in o.a) || !(b[1] in o.a) || b[0] === b[1]) { problems.push('bond ' + JSON.stringify(b) + ' points to a missing atom'); return; }
    const ord = b[2] === 4 || b[2] === 5 ? 1 : b[2];
    if (ord === 0) { hb[b[0]]++; hb[b[1]]++; return; }
    deg[b[0]] += ord; deg[b[1]] += ord;
  });
  const seen = {}; o.b.forEach(b => { const k = Math.min(b[0], b[1]) + '-' + Math.max(b[0], b[1]); if (seen[k]) problems.push('bond ' + k + ' listed twice'); seen[k] = 1; });
  const pos = {}; o.a.forEach((a, i) => { const k = a[1] + ',' + a[2]; if (pos[k] !== undefined) problems.push('atoms ' + pos[k] + ' and ' + i + ' at the same spot'); pos[k] = i; });
  let unknown = false;
  o.a.forEach((a, i) => {
    const lab = String(a[0]).replace(/​/g, ''), chg = a[4] || 0;
    let el = lab, h = 0;
    if (GROUP_H[lab]) { el = GROUP_H[lab][0]; h = GROUP_H[lab][1]; }
    if (!(el in MASS)) { unknown = true; return; }
    if (o.skel && el === 'C' && !GROUP_H[lab]) {
      h = 4 - deg[i] - Math.abs(chg);
      if (h < 0) { problems.push('carbon ' + i + ' has ' + deg[i] + ' bonds'); h = 0; }
    } else if (el in VAL && !['P', 'S', 'B'].includes(el)) {
      const want = VAL[el] + (['N', 'O'].includes(el) ? chg : el === 'C' ? -Math.abs(chg) : ['F', 'Cl', 'Br', 'I'].includes(el) ? chg : 0);
      const have = deg[i] + h;
      /* skeletal drawings show every H on a heteroatom in its label (OH, NH2); a bare O or N must already be full */
      if (have > want || (have < want && (o.skel || el === 'C' || el === 'H'))) problems.push(lab + ' (atom ' + i + ', charge ' + chg + ') has ' + have + ' bonds, expected ' + want);
    }
    cnt[el] = (cnt[el] || 0) + 1; if (h) cnt.H = (cnt.H || 0) + h;
  });
  /* connectivity (hydrogen-bond drawings and salts are allowed to be in pieces) */
  const order = ['C', 'H', ...Object.keys(cnt).filter(e => e !== 'C' && e !== 'H').sort()];
  const formula = unknown ? null : order.filter(e => cnt[e]).map(e => e + (cnt[e] > 1 ? cnt[e] : '')).join('');
  return { formula, problems };
}

/* ---------- per-question checks ---------- */
const letterRef = /\b(choice|option|answer)s?\s+\(?[A-D]\)?\b|\bboth\s+\(?[A-D]\)?\s+and\s+\(?[A-D]\)?\b|\b[A-D]\s+and\s+[A-D]\s+only\b|\(([A-D])\)\s+and\s+\(([A-D])\)/;
const posRef = { test: p => posWord.test(p) || posLetter.test(p), exec: p => posWord.exec(p) || posLetter.exec(p) };
const posWord = /\b(the )?(first|second|third|fourth|last|top|bottom) (choice|option|answer|structure|drawing|picture|reaction|pair|mechanism|equation|statement|one listed|two choices|three choices)\b/i;
const posLetter = /\b([Ss]tructure|[Dd]rawing|[Pp]icture|[Cc]hoice|[Oo]ption)s? \(?[A-D]\)?(?![a-z])(?! and)/;
const aota = /\b(all|none|both|neither|two|more than one) of (the|these) (above|below|choices|answers|options)?|\bnone of these\b|\ball of these\b|\bof the above\b/i;
const stats = { total: 0, byCourse: {}, longestIsCorrect: 0, shortestIsCorrect: 0, struct: 0, eqChecked: 0, eqBad: 0, mmChecked: 0 };

for (const c of Object.keys(bank)) {
  const seenStem = new Map();
  stats.byCourse[c] = bank[c].length;
  bank[c].forEach((q, i) => {
    const id = c + '-' + i; stats.total++;
    for (const k of ['t', 'q', 'c', 'h', 'w', 'k', 'd', 'x']) if (q[k] === undefined || q[k] === null || q[k] === '') flag('ERROR', id, 'missing', 'field "' + k + '" is missing or empty');
    if (!TOPICS[c].includes(q.t)) flag('ERROR', id, 'topic', 'unknown topic "' + q.t + '"');
    if (![1, 2, 3].includes(q.d)) flag('ERROR', id, 'difficulty', 'd must be 1, 2 or 3');
    if (![0, 1].includes(q.k)) flag('ERROR', id, 'kflag', 'k must be 0 or 1');
    if (!Array.isArray(q.c) || q.c.length !== 4) { flag('ERROR', id, 'choices', 'needs exactly 4 choices'); return; }
    if (!Array.isArray(q.x) || q.x.length !== 4) flag('ERROR', id, 'x-length', 'x needs 4 entries');
    else {
      if (q.x[0]) flag('ERROR', id, 'x0', 'x[0] (the right answer slot) must be blank');
      q.x.slice(1).forEach((x, j) => { if (!x || !String(x).trim()) flag('ERROR', id, 'x-empty', 'no feedback for wrong choice ' + (j + 1)); });
    }
    const pic = q.c.map(s => /^§/.test(s));
    if (pic.some(Boolean) && (!Array.isArray(q.cs) || q.cs.length !== 4)) flag('ERROR', id, 'cs', 'picture-only choices need 4 drawings in cs');
    if (q.cs && q.cs.length !== 4) flag('ERROR', id, 'cs', 'cs needs 4 entries');

    /* text hygiene */
    const texts = { q: q.q, h: q.h, w: q.w }; q.c.forEach((s, j) => texts['c[' + j + ']'] = s); (q.x || []).forEach((s, j) => { if (j) texts['x[' + j + ']'] = s; });
    (q.f || []).forEach((f, j) => { if (f.text) texts['f[' + j + '].text'] = f.text.replace(/\s{2,}/g, ' '); });   /* equation figures use wide gaps to set K apart */
    for (const [k, v0] of Object.entries(texts)) {
      const v = String(v0 === undefined ? '' : v0);
      const tags = v.match(/<[^>]*>/g) || [];
      tags.forEach(t => { if (!TAG_OK.test(t)) flag('ERROR', id, 'html', k + ': tag ' + t + ' is not allowed'); });
      const stack = []; let bad = false;
      tags.forEach(t => { if (t === '<br>') return; if (t[1] === '/') { const top = stack.pop(); if (top !== t.slice(2, -1)) bad = true; } else stack.push(/^<(\w+)/.exec(t)[1]); });
      if (bad || stack.length) flag('ERROR', id, 'html', k + ': unbalanced tags');
      if (/<(?![a-zA-Z\/])/.test(v.replace(/<[^>]*>/g, '')) && /<\s*[a-zA-Z]/.test(v.replace(/<[^>]*>/g, ''))) flag('WARN', id, 'html', k + ': stray "<"');
      if (/\bundefined\b|\bNaN\b(?![₀-₉\d])|\bnull\b|\[object|TODO|FIXME|lorem ipsum/.test(strip(v))) flag('ERROR', id, 'junk', k + ': contains placeholder text');
      if (/â€|Ã[\x80-\xbf]|�/.test(v)) flag('ERROR', id, 'encoding', k + ': garbled characters');
      const p = strip(v); let depth = 0, pbad = false; for (const ch of p) { if (ch === '(') depth++; if (ch === ')') { depth--; if (depth < 0) pbad = true; } } if (depth !== 0 || pbad) flag('WARN', id, 'parens', k + ': unbalanced parentheses');
      if (/ {2,}/.test(p.trim()) || /\s[,.;:?](\s|$)/.test(p)) flag('INFO', id, 'spacing', k + ': odd spacing');
      if (/\b(\w{3,})\s+\1\b/i.test(p) && !/\b(that that|had had|very very)\b/i.test(p)) { const m = /\b(\w{3,})\s+\1\b/i.exec(p); if (!/^\d+$/.test(m[1])) flag('WARN', id, 'repeat', k + ': repeated word "' + m[1] + '"'); }
      if (letterRef.test(p)) flag('WARN', id, 'letter-ref', k + ': refers to a choice by letter, but choices are shuffled');
      if (k !== 'q' && !/^c\[/.test(k) && posRef.test(p)) flag('WARN', id, 'position-ref', k + ': refers to a choice by its position ("' + posRef.exec(p)[0] + '"), but choices are shuffled');
    }
    q.c.forEach((s, j) => { if (aota.test(strip(s))) flag('WARN', id, 'all-none', 'c[' + j + ']: "all/none of the above" style choice, and choices are shuffled'); });

    /* choices */
    const cn = q.c.map(norm);
    for (let a = 0; a < 4; a++) for (let b = a + 1; b < 4; b++) {
      if (pic[a] || pic[b]) continue;
      if (cn[a] === cn[b]) flag('ERROR', id, 'dup-choice', 'choices ' + a + ' and ' + b + ' are the same text');
      else {
        const fa = flat(q.c[a]).trim(), fb = flat(q.c[b]).trim();
        const whole = /^-?\+?[\d.,]+(\s*[×x]\s*10\^\(-?\+?\d+\))?(\s*[^\d\s].*)?$/;
        const unit = s => s.replace(/^-?\+?[\d.,]+(\s*[×x]\s*10\^\(-?\+?\d+\))?/, '').trim();
        if (whole.test(fa) && whole.test(fb) && unit(fa) === unit(fb) && !/^[-,]/.test(unit(fa))) {
          const na = numsOf(q.c[a]), nb = numsOf(q.c[b]);
          if (na.length && nb.length && close(na[0], nb[0]) && !/sig|figure|round|precision|decimal|scientific notation|record|report|read/i.test(strip(q.q))) flag('WARN', id, 'equal-choice', 'choices ' + a + ' and ' + b + ' have the same value (' + strip(q.c[a]) + ' / ' + strip(q.c[b]) + ')');
        }
      }
    }
    if (q.cs) { const sig = q.cs.map(o => JSON.stringify(o)); for (let a = 0; a < 4; a++) for (let b = a + 1; b < 4; b++) if (sig[a] === sig[b] && cn[a] === cn[b]) flag('ERROR', id, 'dup-choice', 'drawings ' + a + ' and ' + b + ' are identical'); }
    const len = q.c.map(s => strip(s).length);
    if (!pic[0]) {
      const mx = Math.max(...len.slice(1)), mn = Math.min(...len.slice(1));
      if (len[0] > mx) stats.longestIsCorrect++; if (len[0] < mn) stats.shortestIsCorrect++;
      if (len[0] >= 40 && len[0] > 1.6 * mx) flag('WARN', id, 'length-cue', 'right answer is much longer than every wrong one (' + len[0] + ' vs at most ' + mx + ' characters)');
    }

    /* hint and feedback */
    const hw = strip(q.h || '').split(/\s+/).filter(Boolean).length;
    if (hw > 30) flag('WARN', id, 'hint-long', 'hint has ' + hw + ' words (limit 30)');
    const ans = norm(q.c[0]);
    if (!pic[0] && ans.length >= 6 && !/^[\d.,\s×x^()+-]+$/.test(ans)) {
      if (norm(q.h || '').includes(ans) && !norm(q.q).includes(ans)) flag('WARN', id, 'hint-leak', 'hint contains the right answer word for word');
      (q.x || []).forEach((x, j) => { if (j && norm(x).includes(ans) && !norm(q.q).includes(ans) && !cn.slice(1).some(o => o.includes(ans))) flag('WARN', id, 'x-leak', 'x[' + j + '] names the right answer before the retry'); });
    }
    /* feedback shown before the retry must not hand over the keyed number or say how far off the pick is */
    {
      const a0 = numsOf(q.c[0]), numeric = !pic[0] && a0.length === 1 && /^[-+]?[\d.,]/.test(flat(q.c[0]).trim());
      (q.x || []).forEach((x, j) => { if (!j || !x) return;
        const t = strip(x);
        if (/\b(twice|double|half|one-half|\d+ times|a factor of \d+|ten times|100 times|1000 times)\b[^.]*\b(right|correct|true|actual|real) (value|answer)|\b(right|correct) (value|answer) (is|=)|\boff by (a factor of )?\d/i.test(t)) flag('WARN', id, 'x-leak', 'x[' + j + '] says how far the pick is from the right value');
        else if (numeric && q.k === 1) { const stemN = numsOf(q.q), other = q.c.slice(1).flatMap(numsOf); const xn = numsOf(x);
          if (xn.some(v => close(v, a0[0], 1e-9)) && !stemN.some(v => close(v, a0[0], 1e-9)) && !other.some(v => close(v, a0[0], 1e-9)) && Math.abs(a0[0]) > 12 || (xn.some(v => close(v, a0[0], 1e-9)) && /\./.test(strip(q.c[0])) && !stemN.some(v => close(v, a0[0], 1e-9)) && !other.some(v => close(v, a0[0], 1e-9)))) flag('WARN', id, 'x-leak', 'x[' + j + '] contains the keyed value ' + strip(q.c[0])); }
      });
    }
    if (q.k === 1 && !pic[0]) {
      const a = numsOf(q.c[0]);
      if (a.length === 1 && /^[-+]?[\d.,]/.test(flat(q.c[0]).trim())) {
        const wn = numsOf(q.w);
        if (!wn.some(v => close(v, a[0], 1e-9))) flag('WARN', id, 'w-number', 'explanation never shows the keyed value ' + strip(q.c[0]));
      }
    }
    if (strip(q.w || '').length < 40) flag('WARN', id, 'w-short', 'explanation is under 40 characters');
    if (!/<b>/.test(q.w || '')) flag('INFO', id, 'w-nobold', 'explanation does not bold the answer');

    /* figures and drawings */
    (q.f || []).forEach((f, j) => {
      if (!FIG.includes(f.type)) flag('ERROR', id, 'figure', 'f[' + j + ']: unknown figure type ' + f.type);
      if (f.type === 'table') { if (!Array.isArray(f.rows) || !f.rows.length) flag('ERROR', id, 'figure', 'table has no rows'); else { const w = (f.head || f.rows[0]).length; f.rows.forEach(r => { if (r.length !== w) flag('ERROR', id, 'figure', 'table row has ' + r.length + ' cells, expected ' + w); }); } }
      if (f.type === 'plot') (f.series || []).forEach(s => (s.pts || []).forEach(p => { if (!p.every(Number.isFinite)) flag('ERROR', id, 'figure', 'plot has a non-numeric point'); }));
      if (['cylinder', 'buret'].includes(f.type) && !(f.level >= f.lo && f.level <= f.hi)) flag('ERROR', id, 'figure', f.type + ' level is off the scale');
    });
    const needsFig = /\b(shown|below|above|in the (table|figure|graph|plot|diagram|picture|box|boxes|drawing)|pictured|diagram)\b/i.test(strip(q.q));
    if (needsFig && !q.f && !q.s && !q.cs && !/shown (in|by) the (name|formula|equation)|as shown|below (its|the|their|\d)|above (its|the|their|\d|room|or)|(above|below) (which|what)|or (above|below)/i.test(strip(q.q))) flag('WARN', id, 'no-figure', 'stem points to something "shown" but the question has no figure or drawing');
    [['s', q.s], ['cs', q.cs]].forEach(([nm, arr]) => (arr || []).forEach((o, j) => {
      if (o === null || typeof o === 'string' || (o && o.arrow !== undefined)) return;
      stats.struct++;
      if (o.a.some(a => /^(Pt|Co|Cr|Fe|Ni|Cu|Zn|Ag)$/.test(a[0]))) return;          /* coordination complexes: ligand bond counts differ */
      structInfo(o).problems.forEach(p => flag('WARN', id, 'structure', nm + '[' + j + ']: ' + p));
    }));

    /* chemistry that code can check: balanced equations and stated molar masses */
    const eqTexts = [];
    (q.f || []).forEach(f => { if (f.type === 'eq' && f.text) eqTexts.push(['figure', f.text]); });
    [['stem', q.q], ['explanation', q.w], ['answer', q.c[0]]].forEach(([nm, v]) => String(v).split(/<br>|[;:]\s|\.\s|,\s(?=[A-Z0-9])/).forEach(seg => { if (/→|⇌/.test(seg)) eqTexts.push([nm, seg.replace(/<\/?b>/g, '').replace(/[.]\s*$/, '')]); }));
    const unbal = /\bbalanc|coefficient|unbalanced|skeleton/i.test(strip(q.q));
    eqTexts.forEach(([nm, t]) => {
      const r = checkEquation(t); if (!r) return; stats.eqChecked++;
      if (!r.ok && !(unbal && (nm === 'figure' || nm === 'stem'))) { stats.eqBad++; flag('WARN', id, 'equation', nm + ': not balanced (' + r.diff.join(', ') + '): ' + strip(t)); }
    });
    for (const [nm, v] of [['stem', q.q], ['explanation', q.w], ['hint', q.h]]) {
      const t = String(v).replace(/<sub>(\d+)<\/sub>/g, '$1').replace(/<[^>]+>/g, '').replace(/[₀-₉]/g, ch => String(ch.charCodeAt(0) - 0x2080));
      const re = /\b((?:[A-Z][a-z]?\d*|\((?:[A-Z][a-z]?\d*)+\)\d*){2,}|[A-Z][a-z]?\d+)\s*(?:,|\(|is|=|has a molar mass of|;)?\s*(?:molar mass|M|MM|𝑀)?\s*(?:=|of|is|:)?\s*(\d+\.?\d*)\s*g(?:\/mol|\s*mol\^?⁻¹|·mol⁻¹| mol⁻¹)/g; let m;
      while ((m = re.exec(t))) {
        const cnt = parseFormula(m[1]); if (!cnt) continue; stats.mmChecked++;
        const mm = molarMass(cnt), said = +m[2];
        if (Math.abs(mm - said) > Math.max(0.006 * mm, 0.06)) flag('WARN', id, 'molar-mass', nm + ': ' + m[1] + ' given as ' + said + ' g/mol, computed ' + mm.toFixed(2));
      }
    }

    /* duplicates */
    const key = norm(q.q) + '|' + JSON.stringify(q.f || '') + JSON.stringify(q.s || '');
    if (seenStem.has(key)) {
      const other = seenStem.get(key);
      const same = norm(bank[c][other].c[0]) === ans && JSON.stringify(bank[c][other].cs || '') === JSON.stringify(q.cs || '');
      flag(same ? 'ERROR' : 'WARN', id, 'dup-stem', 'same stem as ' + c + '-' + other + (same ? ' with the same answer' : ' (different answer: check the stems really differ)'));
    } else seenStem.set(key, i);
  });
}

/* ---------- report ---------- */
const lv = { ERROR: 0, WARN: 0, INFO: 0 }; out.forEach(o => lv[o.lvl]++);
const byCode = {}; out.forEach(o => { if (o.lvl !== 'INFO') byCode[o.lvl + ' ' + o.code] = (byCode[o.lvl + ' ' + o.code] || 0) + 1; });
if (jsonOut) fs.writeFileSync(jsonOut, JSON.stringify({ stats, out }, null, 1));
out.filter(o => o.lvl !== 'INFO' || args.includes('--all')).forEach(o => console.log(o.lvl.padEnd(5), o.id.padEnd(8), o.code.padEnd(13), o.msg));
console.log('\n' + stats.total + ' questions (' + Object.entries(stats.byCourse).map(([c, n]) => c + ' ' + n).join(', ') + ')');
console.log('checked by code: ' + stats.struct + ' drawings, ' + stats.eqChecked + ' equations, ' + stats.mmChecked + ' stated molar masses');
console.log('right answer is the longest choice in ' + stats.longestIsCorrect + ' questions (' + Math.round(100 * stats.longestIsCorrect / stats.total) + '%; chance is 25%), the shortest in ' + stats.shortestIsCorrect);
console.log(Object.entries(byCode).sort().map(([k, n]) => k + ': ' + n).join('\n'));
console.log(lv.ERROR + ' errors, ' + lv.WARN + ' warnings' + (allowed ? ' (' + allowed + ' reviewed warnings hidden by tools/validate_allow.json)' : ''));
process.exit(lv.ERROR ? 1 : 0);
