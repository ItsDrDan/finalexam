#!/usr/bin/env node
/* Minor-defect sweep (2026-11-18). Mechanical scans modeled on the 10 blind-calibration defects.
   Usage: node tools/audit-2026-11-18-acs/sweep/scan.js  → writes hits/<scan>.tsv and prints counts.
   Read-only: never touches the banks. 1B "nuclear" items are skipped (concurrent edit). */
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..', '..', '..');
const out = path.join(__dirname, 'hits'); fs.mkdirSync(out, { recursive: true });
const courses = ['3A', '3B', '1A', '1B', '28A', '28B'];
const items = [];
for (const c of courses) require(path.join(root, 'data', 'bank-' + c + '.json')).forEach((q, i) => {
  if (c === '1B' && q.t === 'nuclear') return;
  items.push({ id: c + '-' + i, c, ...q });
});

const SUP = { '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9', '⁻': '-', '⁺': '+' };
const plain = s => String(s || '').replace(/<sup>(.*?)<\/sup>/g, '^$1').replace(/<[^>]+>/g, '')
  .replace(/&nbsp;/g, ' ').replace(/&times;/g, '×').replace(/&minus;/g, '−').replace(/&deg;/g, '°').replace(/&middot;/g, '·').replace(/&mu;/g, 'μ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
const norm = s => plain(s).replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺]+/g, m => '^' + [...m].map(ch => SUP[ch]).join(''))
  .replace(/[−–]/g, '-').replace(/ | | /g, ' ');
/* numbers with their mantissa string and value; "1.98 × 10^3" → value 1980 */
function nums(s) {
  const t = norm(s), outN = [];
  const re = /(-?)(\d{1,3}(?:,\d{3})+(?:\.\d+)?|\d+\.?\d*|\.\d+)(?:\s*[×x]\s*10\s*\^\s*\(?([-+]?\d+)\)?)?/g;
  let m;
  while ((m = re.exec(t))) {
    const prev = t[m.index - 1] || '';
    if (/[A-Za-z_^]/.test(prev)) continue;          // subscripts like H2O, C6, n^2 exponents
    const mant = m[2].replace(/,/g, '');
    const v = parseFloat(mant) * (m[3] ? Math.pow(10, +m[3]) : 1);
    outN.push({ s: m[0].trim(), mant, v: (m[1] ? -1 : 1) * v, abs: v, exp: m[3] });
  }
  return outN;
}
const isNumericChoice = s => { const t = norm(s).trim(); return /^[-+]?\(?[\d.,]/.test(t) && nums(t).length > 0; };
const hits = {};
const hit = (scan, it, info) => (hits[scan] = hits[scan] || []).push([it.id, it.t, info]);
const close = (a, b, tol) => a !== 0 && Math.abs(a - b) / Math.abs(a) <= tol;
const sameVal = (a, b) => a === b || (a !== 0 && Math.abs(a - b) / Math.abs(a) < 1e-9);

for (const it of items) {
  const C = it.c.map(norm), X = (it.x || []).map(s => norm(s || '')), W = norm(it.w), H = norm(it.h), Q = norm(it.q);
  const numKey = isNumericChoice(it.c[0]) && it.c.every(isNumericChoice);
  const cn = it.c.map(nums);

  /* S01 explanation number near (but not equal to) a key number: rounding / stale-number slip (1A-713) */
  if (numKey) {
    const wn = nums(it.w);
    for (const kn of cn[0]) {
      if (kn.abs === 0) continue;
      const exact = wn.some(n => sameVal(n.abs, kn.abs));
      const near = wn.filter(n => !sameVal(n.abs, kn.abs) && close(kn.abs, n.abs, 0.012) && !cn.slice(1).some(o => o.some(z => sameVal(z.abs, n.abs))));
      if (!exact && near.length) hit('S01_w_number_near_key', it, `key ${kn.s} | w has ${near.map(n => n.s).join(', ')}`);
    }
    /* S02 key number missing from w entirely */
    const miss = cn[0].filter(kn => kn.abs !== 0 && !wn.some(n => close(kn.abs, n.abs, 0.012)));
    if (miss.length && wn.length) hit('S02_key_number_absent_from_w', it, `key "${C[0]}" | missing ${miss.map(n => n.s).join(', ')}`);
  }
  /* S03 why-wrong number near (but not equal) to its own choice number (1A-713 x3 1281 vs 1282) */
  for (let i = 1; i < 4; i++) {
    if (!X[i] || !isNumericChoice(it.c[i])) continue;
    const xn = nums(it.x[i]);
    for (const n of cn[i]) {
      if (n.abs === 0) continue;
      if (xn.some(z => sameVal(z.abs, n.abs))) continue;
      const near = xn.filter(z => close(n.abs, z.abs, 0.012) && !cn.some((o, j) => j !== i && o.some(y => sameVal(y.abs, z.abs))));
      if (near.length) hit('S03_x_number_near_own_choice', it, `c${i} ${n.s} | x${i} has ${near.map(z => z.s).join(', ')}`);
    }
    /* S04 x[i] quotes another distractor's value but not its own (feedback for the wrong choice) */
    const own = cn[i].some(n => xn.some(z => sameVal(z.abs, n.abs)));
    const other = [1, 2, 3].filter(j => j !== i && cn[j].length && cn[j].every(n => n.abs !== 0 && xn.some(z => sameVal(z.abs, n.abs)) && !cn[i].some(y => sameVal(y.abs, n.abs))));
    if (!own && other.length) hit('S04_x_quotes_other_choice', it, `x${i}: "${X[i]}" | c${i}="${C[i]}" | matches c${other.join(',c')}="${other.map(j => C[j]).join('" / "')}"`);
  }
  /* S05 why-wrong affirms the choice */
  for (let i = 1; i < 4; i++) if (X[i] && /\b(this is (the )?(correct|right)|is correct\b|correct answer|you('| a)re right|well done|great job)/i.test(X[i]) && !/\bnot correct|isn't correct|is not correct|would be correct if|only correct|correct for|correct formula|correct but|correct, but|correct only/i.test(X[i]))
    hit('S05_x_affirms', it, `x${i}: ${X[i]}`);
  /* S06 hint contains the key text (non-trivial keys only) */
  const k0 = C[0].trim();
  if (k0.length >= 4 && !numKey && H.toLowerCase().includes(k0.toLowerCase()) && !C.slice(1).some(d => d.trim().length >= 4 && H.toLowerCase().includes(d.trim().toLowerCase())))
    hit('S06_hint_contains_key', it, `key "${k0}" | h: ${H}`);
  if (numKey && cn[0].length === 1 && cn[0][0].abs !== 0 && nums(it.h).some(n => sameVal(n.abs, cn[0][0].abs) && n.mant.replace(/^0+/, '').replace('.', '').length >= 3) && !nums(it.q).some(n => sameVal(n.abs, cn[0][0].abs)))
    hit('S06_hint_contains_key', it, `key number "${k0}" in h: ${H}`);
  /* S07 stem contains the key text (3B-979 giveaway), only when no distractor appears in the stem */
  if (k0.length >= 5 && !numKey && !/^(all|none|both|neither|I |I,|I and|II|III)/i.test(k0)) {
    const rx = new RegExp('(^|[^A-Za-z0-9])' + k0.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '($|[^A-Za-z0-9])', 'i');
    if (rx.test(Q) && !C.slice(1).some(d => d.trim().length >= 3 && Q.toLowerCase().includes(d.trim().toLowerCase())))
      hit('S07_stem_contains_key', it, `key "${k0}" | q: ${Q.slice(0, 220)}`);
  }
  /* S08 duplicate choices after stripping HTML / case / spaces */
  const cs = C.map(s => s.toLowerCase().replace(/\s+/g, '').replace(/[.,;]$/, ''));
  if (new Set(cs).size < 4 && !it.cs && !(it.c.some(s => /§/.test(s)))) hit('S08_duplicate_choices', it, C.join(' | '));
  /* S09 unbalanced tags in any text field */
  const fields = [['q', it.q], ['h', it.h], ['w', it.w], ...it.c.map((s, i) => ['c' + i, s]), ...(it.x || []).map((s, i) => ['x' + i, s || ''])];
  for (const [f, s] of fields) {
    for (const tag of ['sub', 'sup', 'b', 'i', 'em', 'strong', 'span', 'u']) {
      const o = (s.match(new RegExp('<' + tag + '(\\s[^>]*)?>', 'g')) || []).length, cl = (s.match(new RegExp('</' + tag + '>', 'g')) || []).length;
      if (o !== cl) hit('S09_unbalanced_tags', it, `${f} <${tag}> ${o}/${cl}: ${s.slice(0, 160)}`);
    }
    /* S10 typography: &amp;amp;, double spaces, space before punctuation, doubled words, empty sub/sup */
    if (/&amp;amp;|&amp;(lt|gt|nbsp);/.test(s)) hit('S10_typography', it, `${f} entity: ${s.slice(0, 160)}`);
    if (/\S {2,}\S/.test(plain(s))) hit('S10_typography', it, `${f} double space: ${plain(s).replace(/ {2,}/g, '⎵⎵').slice(0, 160)}`);
    if (/\s[.,;:](\s|$)/.test(plain(s)) && !/\s\.\d/.test(plain(s))) hit('S10_typography', it, `${f} space before punct: ${plain(s).slice(0, 160)}`);
    const dw = /\b([A-Za-z]{2,})\s+\1\b/i.exec(plain(s));
    if (dw && !/^(that|had|is|no|so|very|many|bye|ha|do)$/i.test(dw[1])) hit('S10_typography', it, `${f} doubled word "${dw[0]}": ${plain(s).slice(0, 160)}`);
    if (/<(sub|sup|b)>\s*<\/\1>/.test(s)) hit('S10_typography', it, `${f} empty tag: ${s.slice(0, 160)}`);
    if (/\.\.(?!\.)|,,|\?\?/.test(plain(s))) hit('S10_typography', it, `${f} doubled punct: ${plain(s).slice(0, 160)}`);
    if (/\bundefined\b|\bnull\b|\bNaN\b|TODO|FIXME|\bXXX\b/.test(s)) hit('S10_typography', it, `${f} placeholder: ${s.slice(0, 160)}`);
    /* S11 ACS claims in student-facing text */
    if (/\bACS\b/.test(s)) hit('S11_ACS_claim', it, `${f}: ${plain(s).slice(0, 160)}`);
  }
  /* S12 units differ between the key and a distractor (3A-633 0.00375 mol in a volume question):
     only "number unit" choices; flag the odd one out when the other three share the key's unit */
  {
    const NU = /^\s*[-+−]?\d[\d.,]*\s*(?:[×x]\s*10\s*\^\s*[-+−]?\d+)?\s*([A-Za-zμ°%Å][A-Za-zμ°%Å·/^\-−0-9 ()]{0,18})\s*$/;
    const U = C.map(s => { const m = NU.exec(s); return m ? m[1].replace(/\s+/g, '').replace(/−/g, '-') : null; });
    if (U.every(u => u !== null)) {
      for (let i = 1; i < 4; i++) {
        const same = U.filter((u, j) => j !== i && u === U[0]).length;
        if (U[i] !== U[0] && same === 3) hit('S12_unit_mismatch_choices', it, `c0 "${C[0]}" vs c${i} "${C[i]}"`);
      }
    }
  }
  /* S13 calc flag: k=1 with no digits in stem or choices; k=0 with a numeric answer computed from stem numbers */
  const digitsQ = /\d/.test(Q.replace(/[A-Za-z]\d+|\^\-?\d+|n = \d/g, ''));
  if (it.k === 1 && !numKey && !it.c.some(isNumericChoice) && !digitsQ) hit('S13_calc_flag', it, `k=1 but no numbers: ${Q.slice(0, 160)}`);
  if (it.k === 0 && numKey && nums(it.q).filter(n => n.abs !== 0).length >= 2 && !/sig(nificant)? ?fig|how many (significant|digits)|round/i.test(Q) && !it.c.some(s => /^\s*\d\s*$/.test(norm(s))))
    hit('S13_calc_flag', it, `k=0 numeric key "${C[0]}" | q: ${Q.slice(0, 160)}`);
  /* S14 sign vs wording: stem asks for heat released/absorbed/given off (a magnitude) but key carries a sign (3A-669) */
  if (numKey && /(how much (heat|energy)|what (amount|quantity) of heat|heat (is |was )?(released|absorbed|given off|evolved|gained|lost))/i.test(Q) && /^\s*[-+]/.test(C[0]) && !/\bq\b|ΔH|sign|ΔE/.test(Q))
    hit('S14_sign_wording', it, `key "${C[0]}" | q: ${Q.slice(0, 200)}`);
  /* S15 why-wrong talks about "the spectrum/graph/data shows" (28A-320: describes another compound's data as the given one) */
  for (let i = 1; i < 4; i++) if (X[i] && /\bthe (given |actual )?(spectrum|spectra|data|graph|plot|table|figure|diagram) (shows|has|gives|indicates)\b/i.test(X[i]))
    hit('S15_x_the_data_shows', it, `x${i}: ${X[i]} | c${i}="${C[i]}"`);
  /* S22 sig-fig count of the key differs from all three distractors (key stands out by formatting, or a rounding slip) */
  if (numKey && cn.every(a => a.length === 1) && !/sig(nificant)?\s*fig|significant|decimal place|round|report|record|measur|ruler|buret|read/i.test(Q)) {
    const sf = n => { let m = n.mant.replace(/^0+\.?0*/, ''); if (!n.mant.includes('.')) m = m.replace(/0+$/, ''); return m.replace('.', '').length; };
    const S = cn.map(a => sf(a[0]));
    if (S[1] === S[2] && S[2] === S[3] && S[0] !== S[1]) hit('S22_key_sigfigs_odd_one_out', it, `sf ${S.join('/')} | ${C.join(' | ')}`);
    else if ([1, 2, 3].some(i => [1, 2, 3].filter(j => j !== i).every(j => S[j] === S[0]) && S[i] !== S[0])) {
      const i = [1, 2, 3].find(i => S[i] !== S[0]); hit('S22b_distractor_sigfigs_odd', it, `sf ${S.join('/')} | c${i} | ${C.join(' | ')}`);
    }
  }
  /* S23 explanation bolds a number that is not the key's number */
  if (numKey) {
    const bnums = [...String(it.w).matchAll(/<b>(.*?)<\/b>/g)].flatMap(m => nums(m[1]));
    if (bnums.length && !bnums.some(n => cn[0].some(k => sameVal(k.abs, n.abs))) ) hit('S23_w_bold_number_not_key', it, `bold ${bnums.map(n => n.s).join(', ')} | key "${C[0]}"`);
    else if (bnums.length && cn[0].length === 1 && cn[0][0].v < 0 && bnums.every(n => n.v > 0) && !/-|−/.test(String(it.w).match(/<b>(.*?)<\/b>/)[1])) hit('S23_w_bold_number_not_key', it, `sign: bold ${bnums.map(n => n.s).join(', ')} | key "${C[0]}"`);
  }
  /* S16 identical why-wrong texts within an item (copy-paste, describes another choice) */
  const xs = (it.x || []).slice(1).map(s => (s || '').trim()).filter(Boolean);
  if (new Set(xs).size < xs.length) hit('S16_duplicate_x', it, xs.join(' || '));
  /* S17 empty or missing why-wrong / explanation / hint */
  for (let i = 1; i < 4; i++) if (!X[i] || X[i].trim().length < 8) hit('S17_empty_feedback', it, `x${i} empty`);
  if (!W.trim()) hit('S17_empty_feedback', it, 'w empty');
  /* S18 explanation bolds a distractor's text instead of the key */
  const bolds = [...String(it.w).matchAll(/<b>(.*?)<\/b>/g)].map(m => norm(m[1]).trim().toLowerCase());
  for (let i = 1; i < 4; i++) { const d = C[i].trim().toLowerCase(); if (d.length >= 2 && bolds.includes(d) && !bolds.includes(k0.toLowerCase())) hit('S18_w_bolds_distractor', it, `bold "${C[i]}" | key "${k0}"`); }
  /* S19 x[i] mentions another distractor's (word) text and not its own: feedback may describe the wrong choice */
  if (!numKey) for (let i = 1; i < 4; i++) {
    if (!X[i]) continue;
    const own = C[i].trim(), xl = X[i].toLowerCase();
    if (own.length < 3 || own.length > 40) continue;
    const others = [1, 2, 3].filter(j => j !== i && C[j].trim().length >= 4 && C[j].trim().length <= 40 && !C[i].toLowerCase().includes(C[j].trim().toLowerCase()) && new RegExp('(^|[^a-z0-9])' + C[j].trim().toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '($|[^a-z0-9])').test(xl));
    if (others.length && !xl.includes(own.toLowerCase()) && !/\b(this|it|that)\b/.test(xl.slice(0, 40)))
      hit('S19_x_names_other_choice', it, `x${i}: ${X[i]} | c${i}="${own}" | names c${others.join(',c')}`);
  }
}
let total = 0;
for (const [k, v] of Object.entries(hits).sort()) {
  fs.writeFileSync(path.join(out, k + '.tsv'), v.map(r => r.join('\t')).join('\n') + '\n');
  console.log(k.padEnd(34), v.length, '(items: ' + new Set(v.map(r => r[0])).size + ')'); total += v.length;
}
console.log('scanned', items.length, 'items; total hits', total);
