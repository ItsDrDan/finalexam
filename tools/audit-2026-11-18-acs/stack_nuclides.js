#!/usr/bin/env node
/* Nuclide symbols must show the mass number directly above the atomic number (stacked, flush against the symbol).
   The game's style for that is <span class="nw"><span class="ss pre"><sup>A</sup><sub>Z</sub></span>Sym</span>.
   This finds side-by-side prescripts (<sup>A</sup><sub>Z</sub>Sym) anywhere in a
   question, wraps them, and writes a fix file for tools/apply_fixes.js. Usage: node stack_nuclides.js [--check] */
const fs = require('fs'), path = require('path'), ROOT = path.join(__dirname, '..', '..');
const SYM = '(?:[A-Z][a-z]?|[nepdt](?![a-z])|[αβγ]|&(?:alpha|beta|gamma);)';
const NUM = '([0-9]{1,3}m?|(?:&minus;|[−+\\-])?[0-9]{1,3})';
/* only mass-then-number order: "<sub>7</sub><sup>35</sup>Cl" is a formula subscript followed by an isotope label (C3H7 35Cl) */
const RE = new RegExp('(<span class="ss pre">)?<sup>' + NUM + '</sup><sub>' + NUM + '</sub>(' + SYM + ')', 'g');
const fix = s => s.replace(RE, (all, wrapped, a, z, sym) => wrapped ? all :
  '<span class="nw"><span class="ss pre"><sup>' + a + '</sup><sub>' + z + '</sub></span>' + sym + '</span>');
const out = [];
for (const c of ['3A', '3B', '1A', '1B', '28A', '28B']) {
  const b = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'bank-' + c + '.json')));
  b.forEach((q, i) => {
    const id = c + '-' + i, why = 'Stacked nuclide symbol: mass number directly above atomic number';
    for (const f of ['q', 'h', 'w']) { const n = fix(q[f]); if (n !== q[f]) out.push({ id, field: f, old: q[f], new: n, why }); }
    q.c.forEach((s, k) => { const n = fix(s); if (n !== s) out.push({ id, field: 'c[' + k + ']', old: s, new: n, why }); });
    (q.x || []).forEach((s, k) => { if (!s) return; const n = fix(s); if (n !== s) out.push({ id, field: 'x[' + k + ']', old: s, new: n, why }); });
    if (q.f) { const o = JSON.stringify(q.f), n = JSON.stringify(JSON.parse(o, (k, v) => typeof v === 'string' ? fix(v) : v)); if (n !== o) out.push({ id, field: 'raw', old: o.slice(1, -1), new: n.slice(1, -1), why }); }
  });
}
/* Unicode prescripts (⁴₂He) cannot stack: report them for hand conversion */
const UNI = /[⁰¹²³⁴⁵⁶⁷⁸⁹]+[₀₁₂₃₄₅₆₇₈₉₋₊]+[A-Za-zαβγ]/;
for (const c of ['3A', '3B', '1A', '1B', '28A', '28B']) JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'bank-' + c + '.json'))).forEach((q, i) => { if (UNI.test(JSON.stringify(q))) out.push({ id: c + '-' + i, field: 'unicode', why: 'Unicode nuclide prescript: rewrite with <span class="ss pre">' }); });
if (process.argv.includes('--check')) { console.log(out.length ? out.length + ' unstacked nuclide fields' : 'all nuclide symbols stacked'); process.exit(out.length ? 1 : 0); }
out.filter(f => f.field === 'unicode').forEach(f => console.log('fix by hand: ' + f.id + ' ' + f.why));
fs.writeFileSync(path.join(ROOT, 'tools/fixes/stacked-nuclides-new.json'), JSON.stringify(out.filter(f => f.field !== 'unicode'), null, 1));
console.log(out.length + ' field edits in ' + new Set(out.map(f => f.id)).size + ' questions');
