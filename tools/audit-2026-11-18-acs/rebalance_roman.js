#!/usr/bin/env node
/* Make the keyed combination of I/II/III statement items unpredictable: renumber the statements of some items
   (a permutation of I, II, III applied to the stem, choices, feedback, hint and explanation) so that within each course
   the keys spread evenly over I only / II only / III only / I and II / I and III / II and III. The chemistry is unchanged.
   Items where a numeral could mean something else (oxidation states, iodine, captioned drawings) are left alone.
   Writes tools/fixes/2026-11-18-roman-rebalance.json (apply with tools/apply_fixes.js). */
const fs = require('fs'), path = require('path'), ROOT = path.join(__dirname, '..', '..');
let seed = 20261118; const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
const strip = s => String(s).replace(/<[^>]+>/g, '').trim();
const CH = /^(I|II|III)((?:, | and |, and )(?:I|II|III))*( only)?$/;
const isRoman = q => q.c.every(x => CH.test(strip(x)));
const TOK = /(?<![A-Za-z0-9])(III|II|I)(?![A-Za-z0-9<−⁻+–\-])/g;
const risky = q => { const all = [q.q, q.w, q.h, ...q.c, ...(q.x || []).filter(Boolean)].join(' ');
  return /[A-Za-z]\s?\((?:I{1,3}|IV|V|VI)\)|iod|[–\-]I\b|\bI atom|\bHI\b|\bI<su|\bI[−⁻]/.test(all) || JSON.stringify([q.s || [], q.f || [], q.cs || []]).match(/"cap":"(I|II|III)"/); };
const STEM = /^([\s\S]*?)<br>\s*I\.\s([\s\S]*?)<br>\s*II\.\s([\s\S]*?)<br>\s*III\.\s([^]*)$/;
const PERMS = [['I', 'II', 'III'], ['I', 'III', 'II'], ['II', 'I', 'III'], ['II', 'III', 'I'], ['III', 'I', 'II'], ['III', 'II', 'I']];
const ORD = { I: 1, II: 2, III: 3 };
const keyOf = s => { const t = strip(s); const n = t.match(/III|II|I/g); return [...new Set(n)].sort((a, b) => ORD[a] - ORD[b]).join('+'); };
function remapChoice(s, m) {             /* "I and III only" -> numerals mapped, then written in order */
  const t = strip(s), only = / only$/.test(t), nums = keyOf(t).split('+').map(x => m[x]).sort((a, b) => ORD[a] - ORD[b]);
  if (nums.length === 3) return s;          /* all three: unchanged */
  return (nums.length === 1 ? nums[0] : nums.join(' and ')) + (only || nums.length < 3 ? ' only' : '');
}
const out = [], report = {};
for (const c of ['3A', '3B', '1A', '1B', '28A', '28B']) {
  const b = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'bank-' + c + '.json')));
  const items = b.map((q, i) => [i, q]).filter(([i, q]) => isRoman(q));
  const cnt = {}; items.forEach(([i, q]) => { const k = keyOf(q.c[0]); cnt[k] = (cnt[k] || 0) + 1; });
  const before = { ...cnt }; let changed = 0, skipped = 0;
  const movable = items.filter(([i, q]) => keyOf(q.c[0]).split('+').length < 3 && STEM.test(q.q) && !risky(q));
  skipped = items.length - movable.length;
  /* greedy: visit movable items in a fixed shuffled order; move one only if it makes the spread more even */
  const order = movable.map(x => [rnd(), x]).sort((a, b) => a[0] - b[0]).map(x => x[1]);
  for (let pass = 0; pass < 3; pass++) for (const [i, q] of order) {
    const k0 = keyOf(q.c[0]); let best = null;
    for (const p of PERMS) { const m = { I: p[0], II: p[1], III: p[2] }; const k1 = k0.split('+').map(x => m[x]).sort((a, b) => ORD[a] - ORD[b]).join('+');
      const gain = (cnt[k0] - 1) - (cnt[k1] || 0); if (k1 !== k0 && gain >= 2 && (!best || gain > best.gain)) best = { m, k1, gain }; }
    if (!best || q._moved) continue;
    const m = best.m; q._moved = 1; cnt[k0]--; cnt[best.k1] = (cnt[best.k1] || 0) + 1; changed++;
    const sm = STEM.exec(q.q), cut = sm[4].search(/<br>/), s3 = cut < 0 ? sm[4] : sm[4].slice(0, cut), tail = cut < 0 ? '' : sm[4].slice(cut);
    const st = { I: sm[2], II: sm[3], III: s3 }, inv = {}; Object.entries(m).forEach(([o, n]) => inv[n] = o);
    const nq = sm[1] + '<br>I. ' + st[inv.I] + '<br>II. ' + st[inv.II] + '<br>III. ' + st[inv.III] + tail;
    const id = c + '-' + i, why = 'Statements renumbered (' + Object.entries(m).filter(([o, n]) => o !== n).map(([o, n]) => o + '→' + n).join(', ') + ') so I/II/III keys are not predictable; chemistry unchanged';
    const sub = s => s.replace(TOK, t => m[t]);
    out.push({ id, field: 'q', old: q.q, new: nq, why });
    q.c.forEach((s, k) => { const n = remapChoice(s, m); if (n !== s) out.push({ id, field: 'c[' + k + ']', old: s, new: n, why }); });
    for (const f of ['w', 'h']) { const n = sub(q[f]); if (n !== q[f]) out.push({ id, field: f, old: q[f], new: n, why }); }
    (q.x || []).forEach((s, k) => { if (!s) return; const n = sub(s); if (n !== s) out.push({ id, field: 'x[' + k + ']', old: s, new: n, why }); });
  }
  report[c] = { items: items.length, movable: movable.length, changed, before, after: { ...cnt } };
}
fs.writeFileSync(path.join(ROOT, 'tools/fixes/2026-11-18-roman-rebalance.json'), JSON.stringify(out, null, 1));
for (const [c, r] of Object.entries(report)) console.log(c, 'items', r.items, 'movable', r.movable, 'renumbered', r.changed, '\n  before', JSON.stringify(r.before), '\n  after ', JSON.stringify(r.after));
console.log(out.length + ' field edits');
