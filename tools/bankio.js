/* Question banks live in data/bank-<course>.json (one file per course, so the game downloads only the course a
   student opens). index.html carries BANK_V = {course: version stamp}; the stamp is part of each file's URL, so a
   changed bank is never served from an old cache.

   The editing tools were written against the old layout (banks as <script type="application/json" id="bank-XX">
   blocks inside index.html). To keep them simple, loadVirtual() returns index.html with those blocks appended,
   and saveVirtual(text) writes the blocks back out to the bank files, refreshes BANK_V, and writes index.html
   (without blocks) only if the rest of the page changed. A tool can keep using its regexes unchanged. */
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const ROOT = path.join(__dirname, '..');
const PAGE = path.join(ROOT, 'index.html');
const DATA = path.join(ROOT, 'data');
const COURSES = ['3A', '3B', '1A', '1B', '28A', '28B'];
const file = c => path.join(DATA, 'bank-' + c + '.json');
const BLOCK = /<script type="application\/json" id="bank-([0-9A-Z]+)">([\s\S]*?)<\/script>/g;
const stamp = text => crypto.createHash('sha1').update(text).digest('hex').slice(0, 10);

function readBankText(c) { return fs.readFileSync(file(c), 'utf8'); }
function readBank(c) { return JSON.parse(readBankText(c)); }

function loadVirtual() {
  const page = fs.readFileSync(PAGE, 'utf8');
  if (/<script type="application\/json" id="bank-/.test(page)) throw new Error('index.html still has bank blocks; run tools/split_banks.js first');
  return page + '\n' + COURSES.map(c => '<script type="application/json" id="bank-' + c + '">' + readBankText(c) + '</script>').join('\n');
}

/* BANK_V line in index.html: const BANK_V={"3A":"…",…}; */
const VRE = /const BANK_V=\{[^}]*\};/;
function withStamps(page) {
  const v = {}; COURSES.forEach(c => { v[c] = stamp(readBankText(c)) });
  const line = 'const BANK_V=' + JSON.stringify(v) + ';';
  if (!VRE.test(page)) throw new Error('index.html has no BANK_V line');
  return page.replace(VRE, () => line);
}

function saveVirtual(text) {
  const blocks = {};
  const page = text.replace(BLOCK, (all, c, body) => { blocks[c] = body; return ''; }).replace(/\n+$/, '\n');
  fs.mkdirSync(DATA, { recursive: true });
  for (const [c, body] of Object.entries(blocks)) {
    JSON.parse(body);                                     // never write a broken bank
    if (!fs.existsSync(file(c)) || readBankText(c) !== body) fs.writeFileSync(file(c), body);
  }
  const cur = fs.readFileSync(PAGE, 'utf8');
  // the virtual page adds a newline before the blocks; compare the page part only
  const next = withStamps(page.replace(/\n$/, cur.endsWith('\n') ? '\n' : ''));
  if (next !== cur) fs.writeFileSync(PAGE, next);
}

/* refresh the version stamps after bank files were edited directly */
function restamp() { const cur = fs.readFileSync(PAGE, 'utf8'), next = withStamps(cur); if (next !== cur) fs.writeFileSync(PAGE, next); }

module.exports = { COURSES, ROOT, PAGE, DATA, file, readBank, readBankText, loadVirtual, saveVirtual, restamp, stamp };

if (require.main === module) {
  if (process.argv[2] === 'restamp') { restamp(); console.log('BANK_V refreshed'); }
  else console.log('usage: node tools/bankio.js restamp');
}
