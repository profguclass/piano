// Network first so updates show up right away; the cache keeps the app working offline.
const CACHE = 'piano-reader-v29';
const FILES = ['./', './index.html', './opensheetmusicdisplay.min.js', './manifest.webmanifest', './icon-192.png', './icon-512.png', './lessons/lessons.json'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(async c => {
    await c.addAll(FILES);
    const course = await (await c.match('./lessons/lessons.json')).json();     // every lesson score, for practice offline
    await Promise.allSettled(course.lessons.filter(l => l.file).map(l => c.add('./lessons/' + l.file)));   // one failure must not block the update
  }));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  e.respondWith(fetch(r, {cache: 'no-cache'}).then(res => {     // always ask the server, so updates are never hidden by the browser cache
    if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(r, copy)); }
    return res;
  }).catch(() => caches.match(r, {ignoreSearch: true}).then(m => m || caches.match('./'))));
});
