#!/usr/bin/env node
/* Print items compactly for manual review: node show.js 3A-12 1B-40 ... */
const path = require('path');
const root = path.join(__dirname, '..', '..', '..');
const plain = s => String(s || '').replace(/<sup>(.*?)<\/sup>/g, '^$1').replace(/<sub>(.*?)<\/sub>/g, '$1').replace(/<[^>]+>/g, '').replace(/&rarr;/g, '→').replace(/&deg;/g, '°').replace(/&times;/g, '×').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
for (const id of process.argv.slice(2)) {
  const [c, i] = id.split('-'); const q = require(path.join(root, 'data', 'bank-' + c + '.json'))[+i];
  console.log(`=== ${id} t=${q.t} d=${q.d} k=${q.k}${q.f ? ' FIG' : ''}${q.s ? ' STRUCT' : ''}\nQ: ${plain(q.q)}`);
  q.c.forEach((s, j) => console.log(`  c${j}: ${plain(s)}${j ? '   || x: ' + plain(q.x[j]) : '  [KEY]'}`));
  console.log(`  H: ${plain(q.h)}\n  W: ${plain(q.w)}`);
}
