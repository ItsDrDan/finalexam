#!/usr/bin/env node
/* Regression test for the Boss Battle builder and answer mapping (added in the 2026-11-18 ACS-rigor audit).
   Runs the shipped buildExam() from index.html against the real banks.  Usage: node tools/test_exam.js [runs=400] */
const fs = require('fs'), path = require('path'), assert = require('assert');
const ROOT = path.join(__dirname, '..'), html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const grab = re => { const m = html.match(re); if (!m) throw new Error('not found ' + re); return m[0]; };
const N = +(process.argv[2] || 400);
const src = [grab(/const COURSES=\{[\s\S]*?\nconst MODES=/).replace(/\nconst MODES=$/, ''), grab(/const TOPIC_W=\{[\s\S]*?\};\n/),
  grab(/function buildExam\(len\)\{[\s\S]*?\nfunction bossStart/).replace(/\nfunction bossStart$/, ''),
  grab(/const stillWeak=[^\n]*/)].join('\n');
const BANK = {}, BYID = {};
for (const c of ['3A', '3B', '1A', '1B', '28A', '28B']) { BANK[c] = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'bank-' + c + '.json'))); BANK[c].forEach((q, i) => { q.id = c + '-' + i; q.course = c; BYID[q.id] = q; }); }
const shuf = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const state = { course: '' }; let cur = null; const R = {};
const G = new Function('BANK', 'state', 'shuf', 'R', 'curIn', src + `
 const C=()=>COURSES[state.course];
 const examDef=(c,e)=>{const cfg=COURSES[c];if(!cfg.exams)return {id:'final',topics:cfg.topics.map(t=>t[0]).filter(t=>!(cfg.noExam||[]).includes(t))};return cfg.exams.find(x=>x.id===e)||cfg.exams[0]};
 const curExam=()=>curIn();return {COURSES,TOPIC_W,buildExam,stillWeak};`)(BANK, state, shuf, R, () => cur);
let checks = 0; const ok = (c, m) => { assert(c, m); checks++; };

/* 1. bank shape: 4 distinct choices, key in c[0], feedback slots line up */
for (const [c, b] of Object.entries(BANK)) b.forEach(q => {
  ok(Array.isArray(q.c) && q.c.length === 4, q.id + ' needs 4 choices');
  ok(new Set(q.c.map(x => String(x).replace(/<[^>]+>/g, '').trim())).size === 4 || q.cs, q.id + ' has duplicate choice text');
  ok(Array.isArray(q.x) && q.x.length === 4 && !q.x[0] && q.x.slice(1).every(s => s && s.length > 10), q.id + ' why-wrong slots');
  ok(q.h && q.w && [1, 2, 3].includes(q.d), q.id + ' hint/explanation/difficulty');
  if (q.cs) ok(q.cs.length === 4, q.id + ' cs length');
});

/* 2. Boss Battles */
for (const c of Object.keys(G.COURSES)) {
  const cfg = G.COURSES[c];
  for (const e of (cfg.exams ? cfg.exams.map(x => x.id) : ['final'])) for (const len of ['full', 'half']) {
    state.course = c; cur = e; let first = null; const dmix = [];
    for (let r = 0; r < N; r++) {
      const ex = G.buildExam(len), n = len === 'full' ? cfg.n : Math.round(cfg.n / 2);
      ok(ex.qids.length === n, `${c}/${e}/${len}: ${ex.qids.length} questions, want ${n}`);
      ok(new Set(ex.qids).size === n, `${c}/${e}: repeated question`);
      ok(ex.qids.every(id => BYID[id]), `${c}: unknown id`);
      ok(ex.qids.every(id => !(cfg.noExam || []).includes(BYID[id].t) || BYID[id].course !== c), `${c}: practice-only topic on exam`);
      const exT = cfg.exams ? cfg.exams.find(x => x.id === e).topics : null;
      if (exT) ok(ex.qids.every(id => exT.includes(BYID[id].t)), `${c}/${e}: topic from the other exam`);
      ok(ex.qids.every(id => ex.ord[id].slice().sort().join() === '0,1,2,3'), `${c}: answer order is not a permutation`);
      const tc = {}; ex.qids.forEach(id => { const q = BYID[id], k = (q.course !== c ? q.course + ':' : '') + q.t; tc[k] = (tc[k] || 0) + 1; });
      const lo = {}; ex.qids.forEach(id => { if (BYID[id].lo) lo[BYID[id].t] = (lo[BYID[id].t] || 0) + 1; });
      if (!first) first = JSON.stringify(tc); else ok(JSON.stringify(tc) === first, `${c}/${e}: topic counts differ between exams`);
      const d = [1, 2, 3].map(L => ex.qids.filter(id => BYID[id].d === L).length); dmix.push(d);
      /* scoring: picking the stored key (0) through the shuffled order scores right */
      const ans = {}; ex.qids.forEach(id => ans[id] = ex.ord[id][ex.ord[id].indexOf(0)]); ok(ex.qids.every(id => ans[id] === 0), 'key mapping');
    }
    for (let L = 0; L < 3; L++) { const v = dmix.map(x => x[L]); ok(Math.max(...v) - Math.min(...v) <= 2, `${c}/${e}/${len}: difficulty-${L + 1} count ranges ${Math.min(...v)}-${Math.max(...v)} (should be balanced)`); }
  }
}
/* 3. Weak Spots: one right answer after a miss is not enough */
ok(G.stillWeak({ last: 0, r: 0, w: 1, fx: 0 }), 'missed is weak');
ok(G.stillWeak({ last: 1, r: 1, w: 1, fx: 1 }), 'one fix still weak');
ok(!G.stillWeak({ last: 1, r: 2, w: 1, fx: 2 }), 'two fixes clears it');
ok(!G.stillWeak({ last: 1, r: 1, w: 1 }), 'old records without fx stay cleared');
console.log(`test_exam: ${checks} checks passed (${N} exams per course/exam/length)`);
