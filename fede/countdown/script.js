/* ---------- CONFIG ---------- */
const PASSWORD = 'fede';
const CREDENTIALS_FILE = 'fede_credentials.hex';

/* Fill in once the sheet is created & shared with the service account */
const SPREADSHEET_ID = '1sspBS6b_js3uZGa4G-fD4YMwE7U7jUK2yHAk98k-bOQ';
const SHEET_NAME = 'Sheet1';
const DATA_RANGE = `${SHEET_NAME}!A:A`;
const APPEND_RANGE = `${SHEET_NAME}!A1`;

/* Fri 07/24/2026, 5:30 PM Boston time (EDT, UTC-4) */
const TARGET_DATE = new Date('2026-07-24T17:30:00-04:00');

const REFRESH_INTERVAL_MS = 10 * 60 * 1000; // re-read the sheet every ~10 min
const CAROUSEL_INTERVAL_MS = 5500; // how long each fun fact stays on screen
const TRANSITION_MS = 400;
const EXPLODE_DURATION_MS = 750;
const EXPLODE_GRID_STEP = 5; // px between sampled particle cells
const EXPLODE_MAX_PARTICLES = 2200;
const STORAGE_KEY = 'fedeCountdown_unlocked';

/* ---------- STATE ---------- */
let serviceAccountCredentials = null;
let credentialsHexCache = null;
let accessToken = null;
let tokenExpiryTime = 0;

let factPool = [];
let factBag = [];
let lastShownIndex = null;
let carouselTimer = null;
let refreshTimer = null;

/* ---------- DOM ---------- */
const numDays = document.getElementById('numDays');
const numHours = document.getElementById('numHours');
const numMinutes = document.getElementById('numMinutes');
const numSeconds = document.getElementById('numSeconds');
const numCentis = document.getElementById('numCentis');
const clockTarget = document.getElementById('clockTarget');

const lockedView = document.getElementById('lockedView');
const unlockedView = document.getElementById('unlockedView');
const unlockForm = document.getElementById('unlockForm');
const passwordInput = document.getElementById('passwordInput');
const lockedError = document.getElementById('lockedError');

const tickerSlide = document.getElementById('tickerSlide');
const tickerText = document.getElementById('tickerText');
const tickerCanvas = document.getElementById('tickerCanvas');
const tickerStatus = document.getElementById('tickerStatus');

const addFactForm = document.getElementById('addFactForm');
const newFactInput = document.getElementById('newFactInput');
const addFactButton = document.getElementById('addFactButton');
const addFactStatus = document.getElementById('addFactStatus');

/* ---------- COUNTDOWN ---------- */
function pad(n, len = 2) {
  return String(Math.max(0, Math.floor(n))).padStart(len, '0');
}

function tickCountdown() {
  const diff = TARGET_DATE.getTime() - Date.now();

  if (diff <= 0) {
    numDays.textContent = '00';
    numHours.textContent = '00';
    numMinutes.textContent = '00';
    numSeconds.textContent = '00';
    numCentis.textContent = '00';
    clockTarget.textContent = 'TARGET LOCK ACHIEVED — FEDE IS HERE';
    return;
  }

  const totalCentis = Math.floor(diff / 10);
  const days = Math.floor(totalCentis / (100 * 60 * 60 * 24));
  const hours = Math.floor(totalCentis / (100 * 60 * 60)) % 24;
  const minutes = Math.floor(totalCentis / (100 * 60)) % 60;
  const seconds = Math.floor(totalCentis / 100) % 60;
  const centis = totalCentis % 100;

  numDays.textContent = pad(days, days > 99 ? 3 : 2);
  numHours.textContent = pad(hours);
  numMinutes.textContent = pad(minutes);
  numSeconds.textContent = pad(seconds);
  numCentis.textContent = pad(centis);

  requestAnimationFrame(tickCountdown);
}

/* ---------- XOR ---------- */
function xorDecrypt(hex, key) {
  const bytes = new Uint8Array(hex.match(/.{1,2}/g).map((b) => parseInt(b, 16)));
  const keyB = new TextEncoder().encode(key);
  const plain = bytes.map((b, i) => b ^ keyB[i % keyB.length]);
  return new TextDecoder().decode(plain);
}

/* ---------- CREDENTIALS ---------- */
async function loadServiceAccount(password) {
  if (serviceAccountCredentials) return { ok: true };

  if (!credentialsHexCache) {
    try {
      const res = await fetch(CREDENTIALS_FILE);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      credentialsHexCache = await res.text();
    } catch (e) {
      console.error('credentials file fetch failed', e);
      return { ok: false, reason: 'fetch' };
    }
  }

  try {
    const json = xorDecrypt(credentialsHexCache, password);
    serviceAccountCredentials = JSON.parse(json);
    return { ok: true };
  } catch (e) {
    console.error('credential decrypt failed', e);
    serviceAccountCredentials = null;
    return { ok: false, reason: 'decrypt' };
  }
}

/* ---------- GOOGLE AUTH ---------- */
async function getAccessToken() {
  if (accessToken && Date.now() < tokenExpiryTime) return accessToken;
  if (!serviceAccountCredentials) throw new Error('not unlocked');

  const header = { alg: 'RS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const claims = {
    iss: serviceAccountCredentials.client_email,
    scope: 'https://www.googleapis.com/auth/spreadsheets',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3500,
    iat: now,
  };
  const sJWT = KJUR.jws.JWS.sign(
    'RS256',
    JSON.stringify(header),
    JSON.stringify(claims),
    serviceAccountCredentials.private_key
  );

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=' + sJWT,
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error('token exchange failed: ' + JSON.stringify(err));
  }
  const data = await res.json();
  accessToken = data.access_token;
  tokenExpiryTime = Date.now() + data.expires_in * 1000 - 60000;
  return accessToken;
}

/* ---------- SHEET I/O ---------- */
async function readFactsFromSheet() {
  const token = await getAccessToken();
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${DATA_RANGE}`,
    { headers: { Authorization: 'Bearer ' + token } }
  );
  if (!res.ok) throw new Error('sheet read failed: ' + res.status);
  const data = await res.json();
  const rows = data.values || [];
  return rows.map((r) => (r[0] || '').trim()).filter(Boolean);
}

async function appendFactToSheet(text) {
  const token = await getAccessToken();
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${APPEND_RANGE}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
    {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
      body: JSON.stringify({ values: [[text]] }),
    }
  );
  if (!res.ok) throw new Error('sheet append failed: ' + res.status);
}

/* ---------- SHUFFLE BAG (no-repeat random rotation) ---------- */
function reshuffleBag() {
  factBag = factPool.map((_, i) => i);
  for (let i = factBag.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [factBag[i], factBag[j]] = [factBag[j], factBag[i]];
  }
  if (factBag.length > 1 && lastShownIndex !== null && factBag[factBag.length - 1] === lastShownIndex) {
    [factBag[factBag.length - 1], factBag[0]] = [factBag[0], factBag[factBag.length - 1]];
  }
}

function nextFact() {
  if (factPool.length === 0) return null;
  if (factBag.length === 0) reshuffleBag();
  const idx = factBag.pop();
  lastShownIndex = idx;
  return factPool[idx];
}

/* ---------- CAROUSEL (powerpoint-style transitions) ---------- */
const TRANSITION_VARIANTS = ['tv-fade', 'tv-push-left', 'tv-push-right', 'tv-wipe', 'tv-zoom', 'tv-flip', 'tv-explode'];
const TRANSITION_DURATIONS = { 'tv-push-left': 500, 'tv-push-right': 500 }; // must match styles.css transition-duration overrides
let lastTransitionVariant = null;

function pickTransitionVariant() {
  const choices = TRANSITION_VARIANTS.filter((v) => v !== lastTransitionVariant);
  const variant = choices[Math.floor(Math.random() * choices.length)];
  lastTransitionVariant = variant;
  return variant;
}

/* Renders the current phrase to an offscreen canvas and samples a particle
   at every ink-bearing grid cell, so the explosion is built from the actual
   glyph pixels rather than generic confetti. */
function buildExplodeParticles(text, canvas, w, h) {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  canvas.style.width = w + 'px';
  canvas.style.height = h + 'px';

  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);

  const computed = getComputedStyle(tickerText);
  const fontSize = parseFloat(computed.fontSize);
  ctx.font = `${fontSize}px ${computed.fontFamily}`;
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';
  ctx.fillStyle = '#ffffff';

  const paddingX = 20;
  const maxLineWidth = Math.max(20, w - paddingX * 2);
  const words = text.split(/\s+/).filter(Boolean);
  const lines = [];
  let current = '';
  for (const word of words) {
    const test = current ? current + ' ' + word : word;
    if (current && ctx.measureText(test).width > maxLineWidth) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);

  const lineHeight = fontSize * 1.3;
  const totalHeight = lines.length * lineHeight;
  const startY = (h - totalHeight) / 2 + fontSize * 0.85;

  lines.forEach((line, i) => {
    const lineWidth = ctx.measureText(line).width;
    ctx.fillText(line, (w - lineWidth) / 2, startY + i * lineHeight);
  });

  // getImageData ALWAYS reads raw physical backing-store pixels and ignores
  // ctx.setTransform, so it must be read at the canvas's true (dpr-scaled)
  // size — reading it at the logical w/h would only capture a top-left
  // sub-rectangle of the bitmap on any devicePixelRatio > 1 display.
  const bitmapW = canvas.width;
  const bitmapH = canvas.height;
  const imageData = ctx.getImageData(0, 0, bitmapW, bitmapH);
  const particles = [];
  const step = EXPLODE_GRID_STEP;
  const stepPhysical = Math.max(1, Math.round(step * dpr));
  for (let py = 0; py < bitmapH; py += stepPhysical) {
    for (let px = 0; px < bitmapW; px += stepPhysical) {
      const alpha = imageData.data[(py * bitmapW + px) * 4 + 3];
      if (alpha > 100) {
        particles.push({
          x: px / dpr,
          y: py / dpr,
          vx: (Math.random() - 0.5) * 420,
          vy: (Math.random() - 0.5) * 420 - 60,
          size: step * (0.7 + Math.random() * 0.6),
          rotation: Math.random() * Math.PI,
          vr: (Math.random() - 0.5) * 8,
        });
      }
    }
  }

  ctx.clearRect(0, 0, w, h);

  if (particles.length > EXPLODE_MAX_PARTICLES) {
    const keepEvery = Math.ceil(particles.length / EXPLODE_MAX_PARTICLES);
    return particles.filter((_, i) => i % keepEvery === 0);
  }
  return particles;
}

function runExplodeAnimation(particles, canvas, w, h) {
  return new Promise((resolve) => {
    const ctx = canvas.getContext('2d');
    const gravity = 500;
    const color = getComputedStyle(tickerText).color;
    let startTime = null;
    let lastTime = null;

    function frame(now) {
      if (startTime === null) startTime = now;
      if (lastTime === null) lastTime = now;
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;
      const progress = Math.min(1, (now - startTime) / EXPLODE_DURATION_MS);

      ctx.clearRect(0, 0, w, h);
      ctx.shadowColor = 'rgba(255, 46, 166, 0.9)';
      ctx.shadowBlur = 6;
      ctx.fillStyle = color;

      for (const p of particles) {
        p.vy += gravity * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.rotation += p.vr * dt;

        ctx.save();
        ctx.globalAlpha = Math.max(0, 1 - progress);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      }

      if (progress < 1) {
        requestAnimationFrame(frame);
      } else {
        ctx.clearRect(0, 0, w, h);
        resolve();
      }
    }
    requestAnimationFrame(frame);
  });
}

async function runExplodeTransition() {
  const frame = document.querySelector('.ticker-frame');
  const rect = frame.getBoundingClientRect();
  const w = Math.round(rect.width);
  const h = Math.round(rect.height);

  const particles = buildExplodeParticles(tickerText.textContent, tickerCanvas, w, h);

  tickerCanvas.classList.add('active');
  tickerSlide.style.visibility = 'hidden';

  await runExplodeAnimation(particles, tickerCanvas, w, h);

  tickerCanvas.classList.remove('active');
  const fact = nextFact();
  tickerText.textContent = fact || 'no fun facts yet — add the first one below!';
  tickerSlide.style.visibility = '';
  tickerSlide.classList.add('tv-fade-in');
  void tickerSlide.offsetWidth; // force reflow so the transition replays
  tickerSlide.classList.remove('tv-fade-in');
}

function showNextFact() {
  const variant = pickTransitionVariant();

  if (variant === 'tv-explode') {
    runExplodeTransition();
    return;
  }

  tickerSlide.classList.add(variant + '-out');
  const delay = TRANSITION_DURATIONS[variant] || TRANSITION_MS;

  setTimeout(() => {
    const fact = nextFact();
    tickerText.textContent = fact || 'no fun facts yet — add the first one below!';
    tickerSlide.classList.remove(variant + '-out');
    tickerSlide.classList.add(variant + '-in');
    void tickerSlide.offsetWidth; // force reflow so the transition replays
    tickerSlide.classList.remove(variant + '-in');
  }, delay);
}

function startCarousel() {
  if (carouselTimer) clearInterval(carouselTimer);
  showNextFact();
  carouselTimer = setInterval(showNextFact, CAROUSEL_INTERVAL_MS);
}

/* ---------- REFRESH ---------- */
async function refreshFacts(silent = false) {
  if (!SPREADSHEET_ID) {
    tickerStatus.textContent = 'sheet not configured yet';
    return;
  }
  try {
    if (!silent) tickerStatus.textContent = 'reading fun facts...';
    factPool = await readFactsFromSheet();
    factBag = [];
    if (!silent) tickerStatus.textContent = '';
  } catch (e) {
    console.error('refresh failed', e);
    tickerStatus.textContent = 'could not reach the sheet — will retry';
  }
}

function startAutoRefresh() {
  if (refreshTimer) clearInterval(refreshTimer);
  refreshTimer = setInterval(() => refreshFacts(true), REFRESH_INTERVAL_MS);
}

/* ---------- UNLOCK FLOW ---------- */
async function unlock(password, { silent = false } = {}) {
  const result = await loadServiceAccount(password);
  if (!result.ok) {
    if (!silent) {
      lockedError.textContent =
        result.reason === 'fetch'
          ? 'could not load credentials — open this page through a web server, not by double-clicking the file.'
          : 'wrong password.';
    }
    return false;
  }
  lockedError.textContent = '';
  lockedView.hidden = true;
  unlockedView.hidden = false;
  localStorage.setItem(STORAGE_KEY, 'true');

  await refreshFacts();
  startCarousel();
  startAutoRefresh();
  return true;
}

unlockForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const value = passwordInput.value;
  if (value !== PASSWORD) {
    lockedError.textContent = 'wrong password.';
    passwordInput.classList.remove('shake');
    void passwordInput.offsetWidth;
    passwordInput.classList.add('shake');
    return;
  }
  await unlock(value);
});

addFactForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const text = newFactInput.value.trim();
  if (!text) return;

  addFactButton.disabled = true;
  addFactStatus.textContent = 'saving...';
  try {
    await appendFactToSheet(text);
    newFactInput.value = '';
    addFactStatus.textContent = 'saved! refreshing...';
    await refreshFacts(true);
    addFactStatus.textContent = 'saved.';
    setTimeout(() => { addFactStatus.textContent = ''; }, 2500);
  } catch (err) {
    console.error('append failed', err);
    addFactStatus.textContent = 'could not save — try again.';
  } finally {
    addFactButton.disabled = false;
  }
});

/* ---------- INIT ---------- */
window.addEventListener('load', () => {
  requestAnimationFrame(tickCountdown);

  if (localStorage.getItem(STORAGE_KEY) === 'true') {
    unlock(PASSWORD, { silent: true }).then((ok) => {
      if (!ok) localStorage.removeItem(STORAGE_KEY);
    });
  }
});
