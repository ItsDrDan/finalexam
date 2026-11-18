#!/usr/bin/env node
/* Simulate many Boss Battles per course/exam with the game's own buildExam allocation (copied from index.html at
   run time, so it tests the shipped code). Reports topic counts, difficulty mix, calc share, estimated time and
   how much two random students' exams differ. Usage: node simulate_exams.js [N=2000] [--json out.json] */
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..', '..');
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const grab = (re) => { const m = html.match(re); if (!m) throw new Error('not found ' + re); return m[0]; };
const N = +(process.argv[2] || 2000);
const src = [grab(/const COURSES=\{[\s\S]*?\nconst MODES=/).replace(/\nconst MODES=$/, ''),
  grab(/const TOPIC_W=\{[\s\S]*?\};\n/), grab(/function buildExam\(len\)\{[\s\S]*?\nfunction bossStart/).replace(/\nfunction bossStart$/, '')].join('\n');
const ctx = {};
const BANK = {}; for (const c of ['3A', '3B', '1A', '1B', '28A', '28B']) { BANK[c] = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'bank-' + c + '.json'))); BANK[c].forEach((q, i) => { q.id = c + '-' + i; q.course = c; }); }
const BYID = {}; Object.values(BANK).flat().forEach(q => BYID[q.id] = q);
const shuf = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const state = { course: '' }; let curExamId = null; const R = {};
const fn = new Function('BANK', 'state', 'shuf', 'R', 'examDefIn', 'curExamIn', src.replace(/\nconst MODES=[\s\S]*$/, '') + `
 const C=()=>COURSES[state.course];
 const examDef=(c,e)=>{const cfg=COURSES[c];if(!cfg.exams)return {id:'final',topics:cfg.topics.map(t=>t[0]).filter(t=>!(cfg.noExam||[]).includes(t))};return cfg.exams.find(x=>x.id===e)||cfg.exams[0]};
 const curExam=()=>curExamIn();
 return {COURSES,TOPIC_W,buildExam};`);
const G = fn(BANK, state, shuf, R, null, () => curExamId);
/* seconds per item: base by difficulty, + calc, + figure/structure reading */
const est = q => (q.d === 1 ? 45 : q.d === 2 ? 75 : 110) + (q.k ? 30 : 0) + ((q.f || q.s || q.cs) ? 15 : 0) + Math.min(60, Math.max(0, (q.q.replace(/<[^>]+>/g, '').length - 250) / 8));
const out = {};
for (const c of Object.keys(G.COURSES)) {
  const cfg = G.COURSES[c]; const exams = cfg.exams ? cfg.exams.map(e => e.id) : ['final'];
  for (const e of exams) {
    state.course = c; curExamId = e; const runs = [];
    for (let r = 0; r < N; r++) runs.push(G.buildExam('full'));
    const topicCounts = {}, dMeans = [], calcN = [], times = [], d3 = [], d1 = [], roman = [], figs = [];
    runs.forEach(ex => {
      const qs = ex.qids.map(id => BYID[id]); const tc = {};
      qs.forEach(q => { const key = (q.course !== c ? q.course + ':' : '') + q.t; tc[key] = (tc[key] || 0) + 1; });
      Object.entries(tc).forEach(([k, v]) => { (topicCounts[k] = topicCounts[k] || []).push(v); });
      dMeans.push(qs.reduce((s, q) => s + q.d, 0) / qs.length); calcN.push(qs.filter(q => q.k).length);
      d3.push(qs.filter(q => q.d === 3).length); d1.push(qs.filter(q => q.d === 1).length);
      roman.push(qs.filter(q => /\bI\b.*\bII\b.*\bIII\b/s.test(q.q.replace(/<[^>]+>/g, ''))).length);
      figs.push(qs.filter(q => q.f || q.s || q.cs).length);
      times.push(qs.reduce((s, q) => s + est(q), 0) / 60);
    });
    const st = a => { const m = a.reduce((s, x) => s + x, 0) / a.length, sd = Math.sqrt(a.reduce((s, x) => s + (x - m) ** 2, 0) / a.length); const so = a.slice().sort((x, y) => x - y); return { mean: +m.toFixed(2), sd: +sd.toFixed(2), p5: so[Math.floor(.05 * a.length)], p95: so[Math.floor(.95 * a.length)] }; };
    const tops = {}; Object.entries(topicCounts).forEach(([k, v]) => { const full = v.concat(Array(N - v.length).fill(0)); tops[k] = { mean: +(full.reduce((s, x) => s + x, 0) / N).toFixed(2), min: Math.min(...full), max: Math.max(...full) }; });
    out[c + ':' + e] = { n: runs[0].qids.length, minutes: cfg.min, dMean: st(dMeans), d1: st(d1), d3: st(d3), calc: st(calcN), roman: st(roman), figs: st(figs), estMinutes: st(times), topics: tops };
  }
}
if (process.argv.includes('--json')) fs.writeFileSync(process.argv[process.argv.indexOf('--json') + 1], JSON.stringify(out, null, 1));
for (const [k, v] of Object.entries(out)) {
  console.log(`\n## ${k}: ${v.n} Qs / ${v.minutes} min | mean d ${v.dMean.mean} (sd ${v.dMean.sd}, 5–95%: ${v.dMean.p5.toFixed(2)}–${v.dMean.p95.toFixed(2)}) | d1 ${v.d1.mean} [${v.d1.p5}-${v.d1.p95}] d3 ${v.d3.mean} [${v.d3.p5}-${v.d3.p95}] | calc ${v.calc.mean} [${v.calc.p5}-${v.calc.p95}] | I/II/III ${v.roman.mean} | figs ${v.figs.mean} | est. time ${v.estMinutes.mean} min [${v.estMinutes.p5.toFixed(0)}-${v.estMinutes.p95.toFixed(0)}]`);
  console.log('   ' + Object.entries(v.topics).map(([t, s]) => `${t} ${s.mean}${s.min !== s.max ? ` (${s.min}-${s.max})` : ''}`).join(' · '));
}
