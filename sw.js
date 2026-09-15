/* thebilly.dev vault service worker (v3)
   Serves the encrypted /vault area: once the AES key is in IndexedDB
   (put there by unlock.html), any request whose path is in the encrypted
   manifest is answered by fetching the blob and decrypting in-flight.
   Everything else passes through to the network untouched. */

const IDB_NAME = 'tbd-vault';
const IDB_STORE = 'keys';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

function idbGetKey() {
  return new Promise((resolve) => {
    const open = indexedDB.open(IDB_NAME, 1);
    open.onupgradeneeded = () => open.result.createObjectStore(IDB_STORE);
    open.onerror = () => resolve(null);
    open.onsuccess = () => {
      const db = open.result;
      const tx = db.transaction(IDB_STORE, 'readonly');
      const req = tx.objectStore(IDB_STORE).get('aes');
      req.onsuccess = () => { resolve(req.result || null); db.close(); };
      req.onerror = () => { resolve(null); db.close(); };
    };
  });
}

async function decrypt(cryptoKey, buf) {
  const u8 = new Uint8Array(buf);
  return crypto.subtle.decrypt({ name: 'AES-GCM', iv: u8.slice(0, 12) }, cryptoKey, u8.slice(12));
}

let manifestPromise = null;

/* Decrypted-blob cache. Safari probes <video> sources with tiny Range
   requests (bytes=0-1) and then streams with more; without this cache each
   one would re-download and re-decrypt the whole file. Bounded, oldest-first
   eviction; lives only as long as this SW instance. */
const plainCache = new Map(); // blob name -> Promise<ArrayBuffer>
const PLAIN_CACHE_LIMIT = 128 * 1024 * 1024;
let plainCacheBytes = 0;

function cachedPlain(man, blobName) {
  if (plainCache.has(blobName)) return plainCache.get(blobName);
  const p = (async () => {
    const res = await fetch('/vault/b/' + blobName + '.bin');
    if (!res.ok) throw new Error('blob missing');
    const plain = await decrypt(man.key, await res.arrayBuffer());
    plainCacheBytes += plain.byteLength;
    for (const [k, v] of plainCache) {
      if (plainCacheBytes <= PLAIN_CACHE_LIMIT || k === blobName) break;
      plainCache.delete(k);
      v.then((buf) => { plainCacheBytes -= buf.byteLength; }, () => {});
    }
    return plain;
  })();
  plainCache.set(blobName, p);
  p.catch(() => plainCache.delete(blobName));
  return p;
}

function getManifest() {
  if (!manifestPromise) {
    manifestPromise = (async () => {
      const cryptoKey = await idbGetKey();
      if (!cryptoKey) return null;
      const res = await fetch('/vault/manifest.bin', { cache: 'no-cache' });
      if (!res.ok) return null;
      try {
        const plain = await decrypt(cryptoKey, await res.arrayBuffer());
        return { key: cryptoKey, files: JSON.parse(new TextDecoder().decode(plain)) };
      } catch (e) {
        return null; // wrong/stale key
      }
    })();
    manifestPromise.then((m) => { if (!m) manifestPromise = null; }, () => { manifestPromise = null; });
  }
  return manifestPromise;
}

self.addEventListener('message', (e) => {
  if (e.data === 'vault-reset') { manifestPromise = null; plainCache.clear(); plainCacheBytes = 0; }
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  if (event.request.method !== 'GET') return;
  if (url.pathname.startsWith('/vault/')) return;
  event.respondWith(handle(event.request, url).catch(() => fetch(event.request)));
});

async function handle(request, url) {
  const man = await getManifest();
  if (!man) return fetch(request);

  let p;
  try { p = decodeURIComponent(url.pathname).normalize('NFC').replace(/^\/+/, ''); }
  catch (e) { return fetch(request); }
  if (p === '') return fetch(request);
  if (p.endsWith('/')) p += 'index.html';

  let entry = man.files[p];
  if (!entry) {
    // /fede/holdem -> /fede/holdem/ so relative asset URLs resolve
    if (man.files[p + '/index.html']) return Response.redirect(url.pathname + '/' + url.search, 301);
    return fetch(request);
  }

  let plain;
  try { plain = await cachedPlain(man, entry[0]); }
  catch (e) { return fetch(request); }

  const headers = {
    'Content-Type': entry[1],
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  };

  const range = request.headers.get('range');
  if (range) {
    const m = range.match(/bytes=(\d*)-(\d*)/);
    if (m) {
      const total = plain.byteLength;
      let start = m[1] === '' ? Math.max(0, total - Number(m[2])) : Number(m[1]);
      let end = m[1] !== '' && m[2] !== '' ? Math.min(Number(m[2]), total - 1) : total - 1;
      if (start <= end && start < total) {
        headers['Content-Range'] = `bytes ${start}-${end}/${total}`;
        headers['Content-Length'] = String(end - start + 1);
        return new Response(plain.slice(start, end + 1), { status: 206, headers });
      }
    }
  }

  headers['Content-Length'] = String(plain.byteLength);
  return new Response(plain, { status: 200, headers });
}
