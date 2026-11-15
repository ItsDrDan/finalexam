#!/usr/bin/env node
/* Fischer/Haworth screen-reader labels (2026-11-14): node tools/check-fbx-a11y.js [path/to/fbx-source]
   Draws every Fischer and Haworth figure in the Final Boss bank (and, if given, the textbook bank) with the FBX code
   and checks each label: describes the drawing (ring size, carbons, groups), never the generic "Fischer projection" or
   "Haworth projection", never a sugar name unless that name is printed in the figure's own caption. */
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
/* Final Boss holds the original drawing code; js/fbx.js in the textbook repo is a verbatim copy. Draw with the textbook copy,
   and check that Final Boss carries the same label block and the same two call sites. */
const TB = process.argv[2] || path.join(ROOT, '..', 'textbook');
const fbxSrc = fs.readFileSync(path.join(TB, 'js', 'fbx.js'), 'utf8');
const blockOf = t => { const i = t.indexOf('/* FBX-A11Y-START'), j = t.indexOf('/* FBX-A11Y-END */'); return i >= 0 && j > i ? t.slice(i, j) : null; };
{ const fb = blockOf(html), tbb = blockOf(fbxSrc); if (!fb) { console.log('FAIL: Final Boss has no FBX-A11Y block'); process.exit(1); } if (fb !== tbb) { console.log('FAIL: Final Boss and textbook label blocks differ'); process.exit(1); }
  for (const call of ["fbSvg(o,b,f.cap,fbAriaFischer(f))", "fbSvg(o,b,f.cap,fbAriaHaworth(f),8,fz)"]) if (!html.includes(call) || !fbxSrc.includes(call)) { console.log('FAIL: call site missing: ' + call); process.exit(1); } }
const ctx = { document: { addEventListener() {}, getElementById: () => null }, console }; ctx.window = ctx; vm.createContext(ctx); vm.runInContext(fbxSrc, ctx);
const F = ctx.window.FBX;
const figsIn = text => { const out = []; const re = /"f":(\[[^\]]*?"type":"(?:fischer|haworth)"[\s\S]*?\])(?=,"src"|,"x"|,"k"|\})/g; let m; while ((m = re.exec(text))) { try { JSON.parse(m[1]).forEach(g => { if (g && (g.type === 'fischer' || g.type === 'haworth')) out.push(g); }); } catch (e) {} } return out; };
let figs = figsIn(html).map(g => ['finalexam', g]);
const tb = TB; if (fs.existsSync(path.join(tb, 'bank'))) { const bank = path.join(tb, 'bank'); for (const f of fs.readdirSync(bank).filter(x => x.endsWith('.json'))) { const walk = o => { if (Array.isArray(o)) o.forEach(walk); else if (o && typeof o === 'object') { if (o.type === 'fischer' || o.type === 'haworth') figs.push(['textbook/' + f, o]); else Object.values(o).forEach(walk); } }; walk(JSON.parse(fs.readFileSync(path.join(bank, f), 'utf8'))); } }
const SUGARS = /\b(glucose|galactose|mannose|fructose|ribose|deoxyribose|lactose|sucrose|maltose|cellobiose|ribulose|glyceraldehyde|erythrose|threose|xylose|arabinose)\b/i;
let fails = 0, n = 0, items = 0; const bad = m => { fails++; if (fails < 25) console.log('FAIL', m); };
for (const [src, g] of figs) {
  const parts = g.items ? g.items.map(it => Object.assign({}, g, it, { items: null })) : [g];
  let out = ''; try { out = F.figBlock([g]); } catch (e) { bad(src + ': figBlock threw ' + e.message); continue; }
  const labels = [...out.matchAll(/role="img" aria-label="([^"]*)"/g)].map(m => m[1]);
  n++; items += parts.length;
  if (labels.length < parts.length) bad(`${src}: ${parts.length} panels but ${labels.length} labels`);
  labels.forEach((L, i) => {
    if (/^(Fischer|Haworth) projection$/.test(L)) bad(`${src}: generic label (${g.type} ${g.sugar || ''})`);
    if (g.type === 'haworth' && !/(six|five)-membered/.test(L)) bad(`${src}: Haworth label without ring size: ${L.slice(0, 80)}`);
    if (g.type === 'fischer' && !/top to bottom: C1/.test(L)) bad(`${src}: Fischer label without carbons: ${L.slice(0, 80)}`);
    const cap = String((parts[i] || g).cap || '') + String(g.cap || '');
    const m = L.replace(/Caption: .*$/, '').match(SUGARS); if (m && !new RegExp(m[0], 'i').test(cap)) bad(`${src}: label names "${m[0]}": ${L.slice(0, 90)}`);
  });
}
console.log(`${n} figures (${items} panels) labelled`);
console.log(fails ? fails + ' problem(s)' : 'all checks pass'); process.exit(fails ? 1 : 0);
