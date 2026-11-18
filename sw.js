/* Final Boss offline support.
   - The page (index.html): network first, so updates show up right away; the saved copy is used offline or when
     the network is very slow.
   - Question banks (data/bank-<course>.json?v=<stamp>): the stamp changes whenever a bank changes, so a saved copy
     is always the right one: saved copy first. Only courses a student actually opens are saved, and an older
     version of the same bank is deleted when a new one is saved.
   - Pictures (assets/, logo): saved copy first.
   Answer stats, reports and fonts always go to the network. */
const CACHE = "finalboss-1";
const CORE = ["./", "index.html"];
const SLOW_MS = 4000;

self.addEventListener("install", e => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    try { await c.addAll(CORE.map(u => new Request(u, {cache: "reload"}))); } catch (err) { /* saved on first use */ }
    await self.skipWaiting();
  })());
});
self.addEventListener("activate", e => {
  e.waitUntil((async () => {
    const ks = await caches.keys();
    await Promise.all(ks.filter(k => k.startsWith("finalboss-") && k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

const offlineReply = () => new Response("Offline, and this file is not saved on this device yet.", {status: 503, statusText: "Offline", headers: {"Content-Type": "text/plain; charset=utf-8"}});
const okToKeep = res => res && res.ok && (res.type === "basic" || res.type === "default");

async function savedFirst(req, opts) {
  const cache = await caches.open(CACHE);
  const hit = await cache.match(req, opts);
  if (hit) return hit;
  let res;
  try { res = await fetch(req); } catch (err) { return offlineReply(); }
  if (okToKeep(res)) {
    const cp = res.clone(), url = new URL(req.url);
    (async () => {
      /* drop older versions of this same file (same path, different ?v=) */
      for (const k of await cache.keys()) { const u = new URL(k.url); if (u.pathname === url.pathname && u.search !== url.search) await cache.delete(k); }
      await cache.put(req, cp);
    })().catch(() => {});
  }
  return res;
}

async function networkFirst(req) {
  const cache = await caches.open(CACHE);
  const saved = async () => (await cache.match(req, {ignoreSearch: true})) || (await cache.match("./")) || (await cache.match("index.html"));
  const net = fetch(req.url, {cache: "no-cache", credentials: "same-origin"}).then(res => {
    if (okToKeep(res)) { const cp = res.clone(); cache.put(new URL(req.url).pathname.endsWith("/") ? "./" : "index.html", cp).catch(() => {}); }
    return res;
  });
  const slow = new Promise(r => setTimeout(r, SLOW_MS)).then(saved);
  try { const first = await Promise.race([net, slow]); return first || await net; }
  catch (err) { return (await saved()) || offlineReply(); }
}

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin || !url.href.startsWith(self.registration.scope)) return;
  if (url.pathname.includes("/data/bank-")) { e.respondWith(savedFirst(req)); return; }
  if (req.mode === "navigate" || url.pathname.endsWith("/") || url.pathname.endsWith("/index.html")) { e.respondWith(networkFirst(req)); return; }
  if (/\.(png|svg|webp|jpg|jpeg|gif|ico)$/i.test(url.pathname)) { e.respondWith(savedFirst(req, {ignoreSearch: true})); return; }
});
