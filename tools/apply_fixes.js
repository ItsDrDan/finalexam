#!/usr/bin/env node
/* Apply a list of reviewed text fixes to the question banks inside index.html.
   Usage: node tools/apply_fixes.js tools/fixes/<file>.json [--dry]
   Each fix: {"id":"1A-74","field":"x[1]","old":"...","new":"...","why":"..."}
     field: q, h, w, c[0]..c[3], x[1]..x[3]  → old/new are the field's full text (HTML as stored)
            raw                              → old/new are a piece of the question's stored JSON text (for figures, drawings, d, k)
   Safe by design: "old" must match what is stored now, only that question's text is touched (no re-serializing, so
   question order and ids never change), and afterwards every other question is compared with the original. */
const fs = require('fs'), path = require('path');
const fixFile = process.argv[2], dry = process.argv.includes('--dry');
const file = path.join(__dirname, '..', 'index.html');
let html = fs.readFileSync(file, 'utf8');
const fixes = JSON.parse(fs.readFileSync(fixFile, 'utf8'));
const enc = s => JSON.stringify(s);

function spans(text) {              // start/end of each top-level array element
  const out = []; let depth = 0, inStr = false, start = -1;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inStr) { if (ch === '\\') i++; else if (ch === '"') inStr = false; continue; }
    if (ch === '"') inStr = true;
    else if (ch === '{' || ch === '[') { depth++; if (depth === 2 && ch === '{') start = i; }
    else if (ch === '}' || ch === ']') { if (depth === 2 && ch === '}') out.push([start, i + 1]); depth--; }
  }
  return out;
}
let applied = 0, skipped = 0, failed = 0;
const byCourse = {};
fixes.forEach(f => (byCourse[f.id.split('-')[0]] = byCourse[f.id.split('-')[0]] || []).push(f));
for (const c of Object.keys(byCourse)) {
  const re = new RegExp('(<script type="application/json" id="bank-' + c + '">)([\\s\\S]*?)(</script>)');
  const m = re.exec(html); if (!m) { console.error('no bank for ' + c); process.exit(2); }
  let text = m[2]; const before = JSON.parse(text); const want = JSON.parse(text);
  /* work from the last question backwards so earlier spans stay valid */
  const list = byCourse[c].slice().sort((a, b) => (+b.id.split('-')[1]) - (+a.id.split('-')[1]));
  for (const f of list) {
    const i = +f.id.split('-')[1]; const sp = spans(text)[i];
    if (!sp) { console.error('FAIL ' + f.id + ': no such question'); failed++; continue; }
    let seg = text.slice(sp[0], sp[1]); const q = JSON.parse(seg);
    let oldTxt, newTxt;
    if (f.field === 'raw') { oldTxt = f.old; newTxt = f.new; }
    else {
      const fm = /^([a-z]+)(?:\[(\d)\])?$/.exec(f.field); if (!fm) { console.error('FAIL ' + f.id + ': bad field ' + f.field); failed++; continue; }
      const cur = fm[2] === undefined ? q[fm[1]] : q[fm[1]][+fm[2]];
      if (cur === f.new) { skipped++; continue; }
      if (cur !== f.old) { console.error('FAIL ' + f.id + ' ' + f.field + ': stored text differs from "old"\n  stored: ' + cur + '\n  old:    ' + f.old); failed++; continue; }
      if (fm[2] === undefined) { oldTxt = '"' + fm[1] + '":' + enc(f.old); newTxt = '"' + fm[1] + '":' + enc(f.new); }
      else {
        /* one entry of the c or x list: rewrite just that list, so two entries with the same text cannot be confused */
        const a0 = seg.indexOf('"' + fm[1] + '":['); let k = a0 + fm[1].length + 4, d = 0, str = false;
        for (; k < seg.length; k++) { const ch = seg[k]; if (str) { if (ch === '\\') k++; else if (ch === '"') str = false; continue; } if (ch === '"') str = true; else if (ch === '[') d++; else if (ch === ']') { if (d === 0) break; d--; } }
        const arrTxt = seg.slice(a0 + fm[1].length + 3, k + 1); const arr = JSON.parse(arrTxt);
        if (a0 < 0 || arr[+fm[2]] !== f.old) { console.error('FAIL ' + f.id + ' ' + f.field + ': could not locate the list entry'); failed++; continue; }
        arr[+fm[2]] = f.new; oldTxt = '"' + fm[1] + '":' + arrTxt; newTxt = '"' + fm[1] + '":' + JSON.stringify(arr);
      }
    }
    const n = seg.split(oldTxt).length - 1;
    if (n === 0 && seg.includes(newTxt) && f.field === 'raw') { skipped++; continue; }
    if (n !== 1) { console.error('FAIL ' + f.id + ' ' + f.field + ': "old" found ' + n + ' times in the question (need exactly 1)'); failed++; continue; }
    seg = seg.replace(oldTxt, () => newTxt);
    let nq; try { nq = JSON.parse(seg); } catch (e) { console.error('FAIL ' + f.id + ': result is not valid JSON'); failed++; continue; }
    if (f.field !== 'raw') { const exp = JSON.parse(JSON.stringify(q)); const fm2 = /^([a-z]+)(?:\[(\d)\])?$/.exec(f.field); if (fm2[2] === undefined) exp[fm2[1]] = f.new; else exp[fm2[1]][+fm2[2]] = f.new; if (JSON.stringify(exp) !== JSON.stringify(nq)) { console.error('FAIL ' + f.id + ' ' + f.field + ': edit touched more than the named field'); failed++; continue; } }
    text = text.slice(0, sp[0]) + seg + text.slice(sp[1]); want[i] = nq; applied++;
  }
  const after = JSON.parse(text);
  if (after.length !== before.length) { console.error('question count changed in ' + c); process.exit(2); }
  const touched = new Set(byCourse[c].map(f => +f.id.split('-')[1]));
  after.forEach((q, i) => { if (!touched.has(i) && JSON.stringify(q) !== JSON.stringify(before[i])) { console.error('untouched question ' + c + '-' + i + ' changed'); process.exit(2); } });
  html = html.replace(re, (a, p1, p2, p3) => p1 + text + p3);
}
console.log((dry ? '[dry run] ' : '') + applied + ' applied, ' + skipped + ' already in place, ' + failed + ' failed');
if (failed) process.exit(1);
if (!dry) fs.writeFileSync(file, html);
