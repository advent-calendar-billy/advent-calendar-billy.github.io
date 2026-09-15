// Encrypts everything under _private/site/ into vault/ for thebilly.dev.
//
//   node tools/build-vault.mjs            (prompts for key)
//   VAULT_KEY=... node tools/build-vault.mjs
//
// Output:
//   vault/meta.json      { salt, iterations }        (public)
//   vault/manifest.bin   encrypted JSON: { "rel/path": [blob, mime, size] }
//   vault/b/<name>.bin   iv(12) || ciphertext || gcm-tag(16), per file
//
// Key = PBKDF2-SHA256(passphrase, salt, iterations) -> AES-256-GCM.
// Incremental: unchanged files (mtime+size) are not re-encrypted.

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const SRC = path.join(ROOT, '_private', 'site');
const OUT = path.join(ROOT, 'vault');
const BLOBS = path.join(OUT, 'b');
const CACHE_FILE = path.join(ROOT, '_private', '.vault-cache.json');
const ITERATIONS = 600000;

const MIME = {
  html: 'text/html; charset=utf-8', htm: 'text/html; charset=utf-8',
  js: 'text/javascript', mjs: 'text/javascript', css: 'text/css',
  json: 'application/json', md: 'text/plain; charset=utf-8', txt: 'text/plain; charset=utf-8',
  csv: 'text/csv', xml: 'application/xml', pdf: 'application/pdf',
  png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif',
  svg: 'image/svg+xml', webp: 'image/webp', ico: 'image/x-icon', bmp: 'image/bmp',
  mp3: 'audio/mpeg', wav: 'audio/wav', ogg: 'audio/ogg', m4a: 'audio/mp4',
  mp4: 'video/mp4', webm: 'video/webm', mov: 'video/quicktime',
  woff: 'font/woff', woff2: 'font/woff2', ttf: 'font/ttf', otf: 'font/otf',
};

function mimeOf(p) {
  const ext = p.split('.').pop().toLowerCase();
  return MIME[ext] || 'application/octet-stream';
}

async function askKey() {
  if (process.env.VAULT_KEY) return process.env.VAULT_KEY;
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((res) => rl.question('vault key: ', (a) => { rl.close(); res(a); }));
}

function walk(dir, base, list) {
  for (const name of fs.readdirSync(dir)) {
    if (name === '.DS_Store' || name === 'node_modules' || name === '.git') continue;
    const full = path.join(dir, name);
    const st = fs.lstatSync(full);
    if (st.isSymbolicLink()) continue;
    if (st.isDirectory()) walk(full, base, list);
    else list.push({ full, rel: path.relative(base, full).split(path.sep).join('/').normalize('NFC'), st });
  }
  return list;
}

const passphrase = await askKey();
if (!passphrase) { console.error('no key given'); process.exit(1); }

fs.mkdirSync(BLOBS, { recursive: true });

let meta;
const metaPath = path.join(OUT, 'meta.json');
if (fs.existsSync(metaPath)) {
  meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
} else {
  meta = { salt: crypto.randomBytes(16).toString('base64'), iterations: ITERATIONS };
  fs.writeFileSync(metaPath, JSON.stringify(meta) + '\n');
}

const key = crypto.pbkdf2Sync(passphrase, Buffer.from(meta.salt, 'base64'), meta.iterations, 32, 'sha256');
const keyCheck = crypto.createHash('sha256').update(key).digest('hex');

let cache = { keyCheck: '', files: {} };
if (fs.existsSync(CACHE_FILE)) {
  try { cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8')); } catch {}
}
if (cache.keyCheck !== keyCheck) {
  console.log('key changed (or first run): re-encrypting everything');
  cache = { keyCheck, files: {} };
}

function encrypt(buf) {
  const iv = crypto.randomBytes(12);
  const c = crypto.createCipheriv('aes-256-gcm', key, iv);
  const ct = Buffer.concat([c.update(buf), c.final()]);
  return Buffer.concat([iv, ct, c.getAuthTag()]);
}

if (!fs.existsSync(SRC)) { console.error('missing ' + SRC); process.exit(1); }
const files = walk(SRC, SRC, []);
const manifest = {};
let encrypted = 0, skipped = 0, bytes = 0;

for (const f of files) {
  const blob = crypto.createHash('sha256').update(f.rel).digest('hex').slice(0, 20);
  const blobPath = path.join(BLOBS, blob + '.bin');
  manifest[f.rel] = [blob, mimeOf(f.rel), f.st.size];
  bytes += f.st.size;
  const c = cache.files[f.rel];
  if (c && c.m === f.st.mtimeMs && c.s === f.st.size && fs.existsSync(blobPath)) { skipped++; continue; }
  fs.writeFileSync(blobPath, encrypt(fs.readFileSync(f.full)));
  cache.files[f.rel] = { m: f.st.mtimeMs, s: f.st.size };
  encrypted++;
}

// prune cache entries and blobs for deleted files
const liveBlobs = new Set(Object.values(manifest).map((e) => e[0] + '.bin'));
for (const rel of Object.keys(cache.files)) if (!manifest[rel]) delete cache.files[rel];
let pruned = 0;
for (const name of fs.readdirSync(BLOBS)) {
  if (!liveBlobs.has(name)) { fs.unlinkSync(path.join(BLOBS, name)); pruned++; }
}

fs.writeFileSync(path.join(OUT, 'manifest.bin'), encrypt(Buffer.from(JSON.stringify(manifest))));
fs.writeFileSync(CACHE_FILE, JSON.stringify(cache));

console.log(`vault: ${files.length} files (${(bytes / 1e6).toFixed(1)} MB plaintext) — ${encrypted} encrypted, ${skipped} unchanged, ${pruned} pruned`);
