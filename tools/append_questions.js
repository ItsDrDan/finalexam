#!/usr/bin/env node
/* Append new questions to the END of a course bank in index.html (ids are course + position,
   so existing questions keep their ids and saved progress).

   node tools/append_questions.js 1A new-1A.json [1B new-1B.json ...] [--dry]

   Each JSON file is an array of question objects (t, q, c with c[0] = key, h, w, x, k, d, optional f/src/lo).
   Checks the shape of every new question, then verifies that every existing question in all four banks
   is byte-for-byte unchanged and that the new ones parse back identically. */
const fs = require('fs'), path = require('path');
const FILE = process.env.BANK_FILE || path.join(__dirname, '..', 'index.html');
const args = process.argv.slice(2), dry = args.includes('--dry');
const pairs = args.filter(a => a !== '--dry');
if (!pairs.length || pairs.length % 2) { console.error('usage: append_questions.js COURSE file.json [COURSE file.json ...] [--dry]'); process.exit(1); }

const TOPICS = {};
const html0 = fs.readFileSync(FILE, 'utf8');
for (const c of ['3A', '3B', '1A', '1B']) {
  const m = html0.match(new RegExp(`'${c}':\\{name:[\\s\\S]*?topics:\\[(\\[[\\s\\S]*?\\])\\]\\}`));
  TOPICS[c] = m ? [...m[1].matchAll(/\['([a-z_]+)'/g)].map(x => x[1]) : null;
}
const bankRe = c => new RegExp(`(<script type="application/json" id="bank-${c}">)([\\s\\S]*?)(</script>)`);
const ALLOWED = new Set(['t', 'q', 'c', 'h', 'w', 'x', 'k', 'd', 'f', 's', 'cs', 'src', 'lo']);

function check(c, q, i) {
  const where = `${c} new #${i + 1}`;
  for (const k of Object.keys(q)) if (!ALLOWED.has(k)) throw new Error(`${where}: unknown field ${k}`);
  for (const k of ['t', 'q', 'c', 'h', 'w', 'x', 'k', 'd']) if (q[k] === undefined) throw new Error(`${where}: missing ${k}`);
  if (TOPICS[c] && !TOPICS[c].includes(q.t)) throw new Error(`${where}: topic ${q.t} is not a ${c} topic`);
  if (!Array.isArray(q.c) || q.c.length !== 4) throw new Error(`${where}: needs 4 choices`);
  if (!Array.isArray(q.x) || q.x.length !== 4 || q.x[0]) throw new Error(`${where}: x must be ["", fb1, fb2, fb3]`);
  if (new Set(q.c).size !== 4) throw new Error(`${where}: duplicate choices`);
  if (![0, 1].includes(q.k) || ![1, 2, 3].includes(q.d)) throw new Error(`${where}: k must be 0/1, d 1/2/3`);
}

let html = html0;
const added = {};
for (let p = 0; p < pairs.length; p += 2) {
  const c = pairs[p], list = JSON.parse(fs.readFileSync(pairs[p + 1], 'utf8'));
  list.forEach((q, i) => check(c, q, i));
  const m = html.match(bankRe(c));
  if (!m) throw new Error('bank not found: ' + c);
  const body = m[2].trimEnd();
  if (!body.endsWith(']')) throw new Error('bank does not end with ]');
  const add = list.map(q => JSON.stringify(q)).join(',');
  html = html.replace(bankRe(c), (all, a, b, z) => a + body.slice(0, -1) + ',' + add + ']' + z);
  added[c] = (added[c] || []).concat(list);
}

// verify
for (const c of ['3A', '3B', '1A', '1B']) {
  const before = JSON.parse(html0.match(bankRe(c))[2]), after = JSON.parse(html.match(bankRe(c))[2]);
  const n = (added[c] || []).length;
  if (after.length !== before.length + n) throw new Error(`${c}: count ${after.length} != ${before.length}+${n}`);
  before.forEach((q, i) => { if (JSON.stringify(q) !== JSON.stringify(after[i])) throw new Error(`${c}-${i} changed`); });
  (added[c] || []).forEach((q, i) => { if (JSON.stringify(q) !== JSON.stringify(after[before.length + i])) throw new Error(`${c} new #${i + 1} did not round-trip`); });
  if (n) console.log(`${c}: ${before.length} → ${after.length} (new ids ${c}-${before.length} to ${c}-${after.length - 1})`);
}
const outside = s => s.replace(/<script type="application\/json" id="bank-[^"]+">[\s\S]*?<\/script>/g, '');
if (outside(html0) !== outside(html)) throw new Error('text outside the banks changed');
if (!dry) fs.writeFileSync(FILE, html);
console.log(dry ? 'dry run: nothing written' : 'written');
