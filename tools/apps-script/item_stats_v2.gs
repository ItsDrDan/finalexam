/**
 * ItsDrDan study games: per-question stats, version 2 (2026-11-18). Replaces the "items" add-on file
 * (version 1 is MCAT/tools/item_stats_apps_script.gs). Everything version 1 did still works the same way.
 *
 * New in version 2
 *   - Two more columns in the Items sheet: ex (a random code for one Final Boss practice exam) and sec (seconds
 *     spent on the question). games/track.js sends them; older rows simply leave them blank.
 *   - <your /exec URL>?items=1&rows=1&game=finalboss&days=365 returns the anonymous answer rows themselves
 *     (question, version, pick, right/wrong, mode, exam code, seconds), so tools/item_analysis.py can compute
 *     item discrimination and exam reliability. No names, emails or student IDs exist in the sheet.
 *
 * How to install (about 3 minutes; no change to doPost or doGet is needed if version 1 is installed)
 *   1. Open the Apps Script project behind the stats URL in games/track.js (script.google.com → the project).
 *   2. Open the file that holds ddLogItems_ (version 1), select all, and paste this whole file over it.
 *   3. Deploy → Manage deployments → pencil on the current web-app deployment → Version: New version → Deploy.
 *      Editing the existing deployment keeps the same /exec URL.
 *   4. Check: <your /exec URL>?items=1&rows=1&game=finalboss&days=7 shows {"rows":[...]} JSON.
 */
var DD_SHEET_ID = '';          // leave empty if this script is bound to the stats spreadsheet
var DD_ITEMS_SHEET = 'Items';

function ddItemsBook_() {
  return DD_SHEET_ID ? SpreadsheetApp.openById(DD_SHEET_ID) : SpreadsheetApp.getActiveSpreadsheet();
}

/** Append one row per event that names a question. Safe to call with any parsed batch. */
function ddLogItems_(events) {
  if (!events || !events.length) return;
  var rows = [];
  for (var i = 0; i < events.length; i++) {
    var e = events[i];
    if (!e || !e.item) continue;
    rows.push([
      new Date(),
      String(e.game || '').slice(0, 40),
      String(e.item).slice(0, 40),
      String(e.ver || '').slice(0, 12),
      (e.key === 0 || e.key > 0) ? Number(e.key) : '',
      (e.pick === 0 || e.pick > 0) ? Number(e.pick) : '',
      e.correct === true || e.correct === 'true',
      String(e.mode || '').slice(0, 60),
      String(e.session || '').slice(0, 16),
      String(e.ex || '').replace(/[^a-z0-9]/gi, '').slice(0, 12),
      (e.sec >= 0 && e.sec <= 3600) ? Math.round(Number(e.sec)) : ''
    ]);
  }
  if (!rows.length) return;
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var book = ddItemsBook_();
    var sh = book.getSheetByName(DD_ITEMS_SHEET);
    if (!sh) {
      sh = book.insertSheet(DD_ITEMS_SHEET);
      sh.appendRow(['time', 'game', 'item', 'ver', 'key', 'pick', 'correct', 'mode', 'session', 'ex', 'sec']);
      sh.setFrozenRows(1);
    } else if (sh.getRange(1, 10).getValue() !== 'ex') {
      sh.getRange(1, 10, 1, 2).setValues([['ex', 'sec']]);   /* upgrade a version-1 sheet in place */
    }
    sh.getRange(sh.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);
  } finally {
    lock.releaseLock();
  }
}

/** Aggregate the Items sheet: one entry per (item, ver). */
function ddItemSummary_(game, days) {
  var sh = ddItemsBook_().getSheetByName(DD_ITEMS_SHEET);
  if (!sh || sh.getLastRow() < 2) return [];
  var data = sh.getRange(2, 1, sh.getLastRow() - 1, 9).getValues();
  var since = new Date(Date.now() - days * 864e5);
  var agg = {};
  for (var i = 0; i < data.length; i++) {
    var r = data[i];
    if (r[0] < since || (game && r[1] !== game)) continue;
    var k = r[2] + '|' + r[3];
    var a = agg[k] || (agg[k] = {item: r[2], ver: r[3], key: r[4], n: 0, correct: 0, picks: [0, 0, 0, 0], sessions: {}});
    a.n++;
    if (r[6] === true || r[6] === 'TRUE') a.correct++;
    if (r[5] !== '' && r[5] >= 0 && r[5] <= 3) a.picks[r[5]]++;
    a.sessions[r[8]] = 1;
  }
  var out = [];
  for (var key in agg) {
    var a = agg[key];
    out.push({item: a.item, ver: a.ver, key: a.key, n: a.n, correct: a.correct, picks: a.picks, sessions: Object.keys(a.sessions).length});
  }
  return out;
}

/** Anonymous answer rows for one game: [item, ver, pick, correct(1/0), mode, session, ex, sec]. At most 60,000 newest. */
function ddItemRows_(game, days) {
  var sh = ddItemsBook_().getSheetByName(DD_ITEMS_SHEET);
  if (!sh || sh.getLastRow() < 2) return [];
  var width = Math.min(11, sh.getLastColumn());
  var data = sh.getRange(2, 1, sh.getLastRow() - 1, width).getValues();
  var since = new Date(Date.now() - days * 864e5), out = [];
  for (var i = data.length - 1; i >= 0 && out.length < 60000; i--) {
    var r = data[i];
    if (r[0] < since || (game && r[1] !== game)) continue;
    out.push([r[2], r[3], r[5], (r[6] === true || r[6] === 'TRUE') ? 1 : 0, r[7], r[8], width > 9 ? r[9] : '', width > 10 ? r[10] : '']);
  }
  return out.reverse();
}

function ddItemsResponse_(e) {
  var game = e.parameter.game || 'mcat';
  var days = Math.max(1, Math.min(3650, Number(e.parameter.days) || 365));
  var body = {generated: new Date().toISOString(), game: game, days: days};
  if (e.parameter.rows) body.rows = ddItemRows_(game, days); else body.items = ddItemSummary_(game, days);
  return ContentService.createTextOutput(JSON.stringify(body)).setMimeType(ContentService.MimeType.JSON);
}

/* INSTALLED 2026-11-18 as version 7 of "ItsDrDan Game Stats Receiver" (itsdrdantv account, same /exec URL).
   The live project keeps everything in one Code.gs with its own names (logItems_, itemsResponse_, itemsSheet_),
   so the same four changes were made there in place instead of pasting this file:
   ITEMS_HEADERS gained 'ex','sec'; itemsSheet_ upgrades an older header row; logItems_ stores ex and sec;
   itemsResponse_ hands ?rows=1 to a new itemRowsResponse_ that returns [item, ver, pick, correct, mode, session, ex, sec]. */
