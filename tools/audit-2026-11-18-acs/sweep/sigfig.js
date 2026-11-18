#!/usr/bin/env node
/* S24: sig-fig sanity of numeric keys (3A-97 pattern: key 18.0 L from 0.50 mol data).
   Flags single-number keys whose significant figures exceed the fewest significant figures among the
   decimal-point measured values in the stem (multiplication/division rule), and keys with fewer than that minus one.
   Heuristic only: addition/subtraction, logs, exact counts and conversion factors need a human check. */
const path = require('path'), fs = require('fs');
const root = path.join(__dirname, '..', '..', '..');
const norm = s => String(s || '').replace(/<sup>(.*?)<\/sup>/g, '^$1').replace(/<[^>]+>/g, '').replace(/&minus;/g, '-').replace(/&times;/g, '×').replace(/[−]/g, '-');
const sf = m => { let t = m.replace(/^[-+]/, ''); const dot = t.includes('.'); t = t.replace('.', '').replace(/^0+/, ''); if (!dot) t = t.replace(/0+$/, ''); return t.length; };
const out = [];
for (const c of ['3A', '3B', '1A', '1B', '28A', '28B']) require(path.join(root, 'data', 'bank-' + c + '.json')).forEach((q, i) => {
  if (c === '1B' && q.t === 'nuclear') return;
  if (!q.k) return;
  const k = norm(q.c[0]).trim();
  const km = /^([-+]?\d[\d,]*\.?\d*)\s*(?:×\s*10\s*\^\s*[-+]?\d+)?\s*([A-Za-zμ°%\/^\-0-9 ·()]*)$/.exec(k);
  if (!km || /[a-z]{4,}/i.test(km[2]) && !/times|drops|tablets|molecules|atoms|days|hours|min/.test(km[2])) return;
  const Q = norm(q.q);
  if (/pH|pOH|pKa|log|ln|ratio|times|percent|%|ee\b|half-li|E°|V\b/.test(Q + ' ' + k)) return;   // log/decimal-place rules
  const stem = [...Q.replace(/[A-Za-z]\d+/g, '').matchAll(/(?<![\w^.])(\d+\.\d*|\.\d+|\d{1,3}(?:,\d{3})+\.\d*)(?![\d^])/g)].map(m => m[1].replace(/,/g, ''));
  if (stem.length < 1) return;
  const mins = Math.min(...stem.map(sf)), ks = sf(km[1].replace(/,/g, ''));
  if (ks > mins || ks < mins - 1) out.push(`${c}-${i}\t${q.t}\tkey ${k} (${ks} sf) | stem decimals ${stem.join(', ')} (min ${mins})`);
});
fs.writeFileSync(path.join(__dirname, 'hits', 'S24_key_sigfigs_vs_stem.tsv'), out.join('\n') + '\n');
console.log('S24_key_sigfigs_vs_stem', out.length);
