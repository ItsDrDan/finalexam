#!/usr/bin/env node
/* Merge the audit's fix proposals into one reviewed file, one fix per (id, field), by priority:
   rigor upgrades (hand-written) > first-pass reviewers > calibration reviewers. raw fixes are kept unless the same old text
   is already covered. Writes tools/fixes/2026-11-18-acs-audit.json and prints the conflicts it resolved. */
const fs = require('fs'), path = require('path');
const A = path.join(__dirname), ROOT = path.join(A, '..', '..');
const read = f => JSON.parse(fs.readFileSync(f, 'utf8'));
const src = [['rigor', [path.join(ROOT, 'tools/fixes/2026-11-18-acs-rigor-upgrades.json')]],
  ['first', fs.readdirSync(path.join(A, 'fixes-proposed')).map(f => path.join(A, 'fixes-proposed', f))],
  ['calib', ['fixes_A.json', 'fixes_B.json'].map(f => path.join(A, 'calibration', f))]];
const rigorIds = new Set(read(src[0][1][0]).map(f => f.id));
const out = [], seen = new Map(), log = [];
for (const [tag, files] of src) for (const f of files) for (const x of read(f)) {
  if (tag !== 'rigor' && rigorIds.has(x.id)) { log.push(`skip ${tag} ${x.id} ${x.field}: item rewritten in rigor upgrades`); continue; }
  const key = x.id + '|' + x.field + (x.field === 'raw' ? '|' + x.old : '');
  if (seen.has(key)) { log.push(`skip ${tag} ${x.id} ${x.field}: already fixed by ${seen.get(key)}`); continue; }
  seen.set(key, tag); out.push({ ...x, src: tag });
}
fs.writeFileSync(path.join(ROOT, 'tools/fixes/2026-11-18-acs-audit.json'), JSON.stringify(out, null, 1));
log.forEach(l => console.log(l)); console.log(out.length + ' fixes written');

/* Part 2: whole-item replacements (reviewer rewrites that I checked by hand) and near-twin group tags, as raw fixes. */
const APPROVED_REWRITES = ['28B-65', '28B-68', '28B-76', '28B-145', '28B-182'];
const L = {}; for (const f of fs.readdirSync(path.join(A, 'ledger'))) for (const line of fs.readFileSync(path.join(A, 'ledger', f), 'utf8').split('\n')) if (line.trim()) { const r = JSON.parse(line); L[r.id] = r; }
const bank = c => JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'bank-' + c + '.json'), 'utf8'));
const B = {}; const item = id => { const [c, i] = id.split('-'); B[c] = B[c] || bank(c); return B[c][+i]; };
const extra = [];
for (const id of APPROVED_REWRITES) {
  const old = item(id), rw = L[id] && L[id].rewrite; if (!rw) throw new Error('no rewrite for ' + id);
  const nw = { t: rw.t || old.t, q: rw.q, c: rw.c, h: rw.h, w: rw.w, x: rw.x, k: rw.k ?? 0, d: rw.d ?? old.d };
  if (nw.c.length !== 4 || nw.x.length !== 4) throw new Error('bad rewrite ' + id);
  /* drop every fix already queued for this item: the whole item is replaced */
  for (let i = out.length - 1; i >= 0; i--) if (out[i].id === id) { console.log('drop', out[i].src, id, out[i].field, '(item replaced)'); out.splice(i, 1); }
  extra.push({ id, field: 'raw', old: JSON.stringify(old), new: JSON.stringify(nw), why: 'Exact duplicate of another item (' + (L[id].defects || []).join('; ') + '); replaced by a new question on a different compound, checked by hand', src: 'rewrite' });
}
const G = JSON.parse(fs.readFileSync(path.join(A, 'twin_groups.json'), 'utf8')).groups;
G.forEach((g, n) => g.forEach(id => {
  const s = JSON.stringify(item(id)); if (!s.startsWith('{"t":"')) throw new Error('item does not start with t: ' + id);
  if (APPROVED_REWRITES.includes(id)) throw new Error('twin group on a rewritten item ' + id);
  if (out.some(f => f.id === id && f.field === 'raw' && f.old.includes('"t":'))) throw new Error('twin tag collides with a topic fix on ' + id);
  extra.push({ id, field: 'raw', old: '{"t":"', new: '{"g":"tw' + (n + 1) + '","t":"', why: 'Near-twin of ' + g.filter(x => x !== id).join(', ') + ': at most one per Boss Battle', src: 'twins' });
}));
fs.writeFileSync(path.join(ROOT, 'tools/fixes/2026-11-18-acs-audit.json'), JSON.stringify(out.concat(extra), null, 1));
console.log((out.length + extra.length) + ' fixes written (' + extra.length + ' replacements and twin tags)');
