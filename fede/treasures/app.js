import { HUNT } from './data.js';
import { ICON } from './icons.js';
import {
  loadProgress, saveProgress, clearProgress,
  saveSelfie, loadSelfie, listSelfieIds,
  savePwdPhoto, loadPwdPhoto, listPwdPhotoIds,
  clearAllPhotos
} from './storage.js';
import { detectFaces, hasSmile, summarize, ensureFaceModels, SMILE_THRESHOLD } from './faces.js';

const TEST_MODE = new URLSearchParams(location.search).has('test');
if (TEST_MODE) {
  clearProgress();
  await clearAllPhotos();
}
if (new URLSearchParams(location.search).has('debug')) {
  localStorage.setItem('tesoros:debug', '1');
}

// ---------- helpers ----------
function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function normalize(s) {
  return String(s)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^\p{L}\p{N}]/gu, '');
}

function answerMatches(input, stop) {
  const candidates = [stop.answer, ...(stop.altAnswers || [])];
  const n = normalize(input);
  if (!n) return false;
  return candidates.some(c => normalize(c) === n);
}

function downscale(file, maxEdge, quality) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      try {
        const scale = Math.min(1, maxEdge / Math.max(img.width, img.height));
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        URL.revokeObjectURL(url);
        canvas.toBlob(b => b ? resolve(b) : reject(new Error('toBlob failed')), 'image/jpeg', quality);
      } catch (e) {
        URL.revokeObjectURL(url);
        reject(e);
      }
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('image load failed')); };
    img.src = url;
  });
}

// ---------- state ----------
const initial = loadProgress();
const state = {
  solvedIds: new Set(initial.solvedIds),
  solvedWithHelp: new Set(initial.solvedWithHelp),
  get activeIndex() {
    for (let i = 0; i < HUNT.stops.length; i++) {
      if (!this.solvedIds.has(HUNT.stops[i].id)) return i;
    }
    return -1;
  }
};
function persist() {
  saveProgress({
    solvedIds: [...state.solvedIds],
    solvedWithHelp: [...state.solvedWithHelp]
  });
}

// per-stop lock validation, lives only while a clue is rendered
let activeLocks = null;

// ---------- position source (real GPS or debug override) ----------
const DEBUG_KEY = 'tesoros:debug';
let realPos = null;     // [lat, lng] from GPS
let debugMode = localStorage.getItem(DEBUG_KEY) === '1';

function currentPos() { return realPos; }

let gpsErr = null; // last geolocation error message (shown in radar status when no fix yet)

if ('geolocation' in navigator) {
  navigator.geolocation.watchPosition(
    pos => { realPos = [pos.coords.latitude, pos.coords.longitude]; gpsErr = null; },
    err => {
      const msg = err.code === err.PERMISSION_DENIED ? 'permiso denegado'
                : err.code === err.POSITION_UNAVAILABLE ? 'gps no disponible'
                : err.code === err.TIMEOUT ? 'gps tardando…'
                : 'error de gps';
      gpsErr = msg;
    },
    { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
  );
} else {
  gpsErr = 'gps no soportado';
}

// ---------- distance / bearing ----------
function haversine(a, b) {
  const R = 6371000;
  const toRad = d => d * Math.PI / 180;
  const dLat = toRad(b[0] - a[0]);
  const dLng = toRad(b[1] - a[1]);
  const lat1 = toRad(a[0]);
  const lat2 = toRad(b[0]);
  const h = Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

function bearingRad(from, to) {
  const toRad = d => d * Math.PI / 180;
  const lat1 = toRad(from[0]);
  const lat2 = toRad(to[0]);
  const dLng = toRad(to[1] - from[1]);
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return Math.atan2(y, x); // 0 = north, clockwise
}

function activeStopCoord() {
  const idx = state.activeIndex;
  if (idx < 0) return null;
  return HUNT.stops[idx].coord;
}

function distanceToActive() {
  const here = currentPos();
  const target = activeStopCoord();
  if (!here || !target) return null;
  return haversine(here, target);
}

// ---------- radar ----------
const RADAR_MAX_M = 600;       // matches sonar range
const RADAR_INNER_R = 14;      // px in SVG units: inside this is "very close"
const RADAR_EDGE_R = 96;       // px in SVG units: clamp blip to this radius if out of range

const radarBlip = document.getElementById('radarBlip');
const radarBlipHalo = radarBlip?.querySelector('.radar-blip-halo');
const radarStatus = document.getElementById('radarStatus');
const radarSweep = document.getElementById('radarSweep');

let blipBearingDeg = null;       // 0 = north, clockwise — last computed bearing in screen coords
let blipDistance = null;         // metres
let blipOutOfRange = false;
let blipFound = false;

function fmtDist(m) {
  if (m == null) return '—';
  if (m < 1000) return `${Math.round(m)} m`;
  return `${(m / 1000).toFixed(2)} km`;
}

function updateRadar() {
  const idx = state.activeIndex;
  const here = currentPos();
  const target = activeStopCoord();

  if (idx < 0) {
    // hunt complete
    radarBlip.style.display = 'none';
    blipBearingDeg = null;
    radarStatus.textContent = '· objetivo alcanzado ·';
    return;
  }
  if (!here) {
    radarBlip.style.display = 'none';
    blipBearingDeg = null;
    radarStatus.textContent = gpsErr ? `gps · ${gpsErr}` : 'esperando posición…';
    return;
  }
  if (!target) {
    radarBlip.style.display = 'none';
    radarStatus.textContent = '';
    return;
  }

  const d = haversine(here, target);
  const b = bearingRad(here, target); // radians, 0 = north
  const bDeg = (b * 180 / Math.PI + 360) % 360;
  blipBearingDeg = bDeg;
  blipDistance = d;
  blipOutOfRange = d > RADAR_MAX_M;
  blipFound = d < 5;

  // scale distance to radar radius. Out of range → clamp to edge.
  let r;
  if (blipOutOfRange) {
    r = RADAR_EDGE_R;
  } else {
    const t = Math.max(0, Math.min(1, d / RADAR_MAX_M));
    // ease-out so near targets don't all stack at center
    r = RADAR_INNER_R + (RADAR_EDGE_R - RADAR_INNER_R) * Math.pow(t, 0.85);
  }

  const rad = b; // 0 = north (up)
  const x = Math.sin(rad) * r;
  const y = -Math.cos(rad) * r;

  radarBlip.setAttribute('transform', `translate(${x.toFixed(2)} ${y.toFixed(2)})`);
  radarBlip.style.display = '';
  radarBlip.classList.toggle('edge', blipOutOfRange);
  radarBlip.classList.toggle('found', blipFound);

  // status text under radar
  const stop = HUNT.stops[idx];
  const num = String(idx + 1).padStart(2, '0');
  if (blipFound) {
    radarStatus.textContent = `· ${num} · LLEGASTE ·`;
  } else if (blipOutOfRange) {
    radarStatus.textContent = `parada ${num} · ${fmtDist(d)} · fuera del radar`;
  } else {
    radarStatus.textContent = `parada ${num} · ${fmtDist(d)}`;
  }
}

// rAF loop drives blip-glow based on sweep angle and updates from GPS
function radarTick(t) {
  // sweep angle is driven by SMIL <animateTransform>, period 4s.
  const sweepDeg = ((t / 4000) * 360) % 360;
  if (blipBearingDeg != null && radarBlipHalo) {
    const diff = Math.min(
      Math.abs(blipBearingDeg - sweepDeg),
      360 - Math.abs(blipBearingDeg - sweepDeg)
    );
    // glow window: 0..45 degrees behind the sweep → bright; otherwise dim
    const behind = ((sweepDeg - blipBearingDeg + 360) % 360);
    const window = 60;
    let glow;
    if (behind <= window) {
      glow = 1 - behind / window;
    } else {
      glow = 0.15;
    }
    radarBlipHalo.style.setProperty('--blip-glow', (0.25 + glow * 0.75).toFixed(3));
  }
  requestAnimationFrame(radarTick);
}
requestAnimationFrame(radarTick);

// poll GPS-based radar update at a steady cadence even when GPS is quiet
setInterval(updateRadar, 600);

// ---------- sonar ----------
const SONAR_MAX_M = 600;
const SONAR_FOUND_M = 5;
const SONAR_MIN_INTERVAL = 140;
const SONAR_MAX_INTERVAL = 2500;

function sonarInterval(d) {
  if (d == null || d >= SONAR_MAX_M) return null;
  if (d < SONAR_FOUND_M) return 0; // sentinel: trigger "found"
  const ms = SONAR_MIN_INTERVAL * Math.pow(d / SONAR_FOUND_M, 0.62);
  return Math.max(SONAR_MIN_INTERVAL, Math.min(SONAR_MAX_INTERVAL, ms));
}

let audioCtx = null;
let sonarOn = false;
let sonarTimer = null;
let foundForStopId = null;

function ensureAudio() {
  if (!audioCtx) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    audioCtx = new Ctx();
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function beep(freq = 880, durMs = 110, gain = 0.4) {
  const ctx = audioCtx;
  if (!ctx) return;
  const t0 = ctx.currentTime;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.value = freq;
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(gain, t0 + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + durMs / 1000);
  osc.connect(g).connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + durMs / 1000 + 0.02);
}

function foundCue() {
  beep(1320, 120, 0.5);
  setTimeout(() => beep(1760, 140, 0.5), 130);
}

function armedTick() { beep(440, 50, 0.18); }

function clearSonarTimer() {
  if (sonarTimer) { clearTimeout(sonarTimer); sonarTimer = null; }
}

function scheduleNextBeep() {
  clearSonarTimer();
  refreshDebugBanner();
  if (!sonarOn) return;
  if (document.hidden) return;
  const stopId = HUNT.stops[state.activeIndex]?.id;
  if (!stopId) return;
  const d = distanceToActive();
  const interval = sonarInterval(d);
  if (interval == null) {
    foundForStopId = null;
    armedTick();
    sonarTimer = setTimeout(scheduleNextBeep, 3000);
    return;
  }
  if (interval === 0) {
    if (foundForStopId !== stopId) {
      foundForStopId = stopId;
      foundCue();
    }
    sonarTimer = setTimeout(scheduleNextBeep, 1200);
    return;
  }
  if (foundForStopId === stopId) foundForStopId = null;
  beep();
  sonarTimer = setTimeout(scheduleNextBeep, interval);
}

function setSonar(on) {
  sonarOn = on;
  const btn = document.getElementById('sonarToggle');
  if (btn) btn.setAttribute('aria-pressed', on ? 'true' : 'false');
  if (on) {
    if (!ensureAudio()) return;
    beep(660, 80, 0.3);
    setTimeout(scheduleNextBeep, 200);
  } else {
    clearSonarTimer();
    foundForStopId = null;
  }
}

document.getElementById('sonarToggle')?.addEventListener('click', () => setSonar(!sonarOn));

document.addEventListener('visibilitychange', () => {
  if (document.hidden) clearSonarTimer();
  else if (sonarOn) scheduleNextBeep();
});

// ---------- debug mode ----------
const debugBanner = document.getElementById('debugBanner');

function refreshDebugBanner() {
  if (!debugBanner) return;
  if (!debugMode) { debugBanner.hidden = true; debugBanner.textContent = ''; return; }
  const d = distanceToActive();
  debugBanner.hidden = false;
  debugBanner.textContent = `DEBUG · ${fmtDist(d)}`;
}

function setDebugMode(on) {
  debugMode = on;
  localStorage.setItem(DEBUG_KEY, on ? '1' : '0');
  document.body.classList.toggle('is-debug', on);
  refreshDebugBanner();
  if (sonarOn) scheduleNextBeep();
}

window.addEventListener('keydown', e => {
  if (e.key !== '6') return;
  if (e.target && (e.target.matches?.('input, textarea') || e.target.isContentEditable)) return;
  setDebugMode(!debugMode);
});

if (debugMode) {
  queueMicrotask(() => setDebugMode(true));
}

setInterval(() => { if (debugMode) refreshDebugBanner(); }, 1000);

// ---------- clue panel ----------
const cluePanel = document.getElementById('cluePanel');
const progressLabel = document.getElementById('progressLabel');

function renderProgressLabel() {
  const total = HUNT.stops.length;
  if (state.activeIndex < 0) {
    progressLabel.textContent = `${total} de ${total}`;
  } else {
    progressLabel.textContent = `Parada ${state.activeIndex + 1} de ${total}`;
  }
}

function renderClue() {
  renderProgressLabel();
  const idx = state.activeIndex;

  if (idx < 0) {
    cluePanel.innerHTML = `
      <article class="clue-card done">
        <h2>${escapeHtml(HUNT.finale.title)}</h2>
        <p>${escapeHtml(HUNT.finale.body)}</p>
        <div class="actions">
          <button class="btn primary" id="openFinaleBtn">Ver galería</button>
        </div>
      </article>
    `;
    document.getElementById('openFinaleBtn').addEventListener('click', openFinale);
    updateRadar();
    return;
  }

  const stop = HUNT.stops[idx];
  const typeLabel = stop.type === 'taste' ? 'Sabor' : 'Vista';
  const typeClass = stop.type === 'taste' ? ' taste' : '';
  const pwdType = stop.passwordType || 'text';

  activeLocks = { selfieValid: false, pwdValid: false, pwdType };

  const pwdBlock = pwdType === 'photo-smile'
    ? `
      <div class="lock lock-pwd" data-state="empty">
        <label class="lock-trigger" for="pwdPhotoInput">
          <span class="lock-status" aria-hidden="true">○</span>
          <span class="lock-text">
            <span class="lock-title">Foto del regalo</span>
            <span class="lock-detail">Billy sonriendo · tocá para sacar</span>
          </span>
        </label>
        <input type="file" accept="image/*" capture="environment" id="pwdPhotoInput" hidden />
        <div class="lock-thumb" aria-hidden="true"></div>
      </div>`
    : `
      <div class="lock lock-pwd lock-text" data-state="empty">
        <input id="answerInput" class="lock-input" type="text" placeholder="Contraseña"
          autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false"
          inputmode="text" enterkeyhint="go" />
      </div>`;

  const debugAnswer = pwdType === 'photo-smile'
    ? 'foto sonriente'
    : [stop.answer, ...(stop.altAnswers || [])].join(' · ');

  cluePanel.innerHTML = `
    <article class="clue-card" data-stop="${escapeHtml(stop.id)}" data-pwd-type="${pwdType}">
      <header class="clue-head">
        <span class="chip${typeClass}">${typeLabel}</span>
      </header>
      <p class="clue-text" lang="${escapeHtml(stop.lang)}">${escapeHtml(stop.clue)}</p>
      <p class="debug-answer" aria-hidden="true">key: <span>${escapeHtml(debugAnswer)}</span></p>

      <div class="lock lock-selfie" data-state="empty">
        <label class="lock-trigger" for="selfieInput">
          <span class="lock-status" aria-hidden="true">○</span>
          <span class="lock-text">
            <span class="lock-title">Selfie con Billy</span>
            <span class="lock-detail">tocá para sacar · necesito ver dos caras</span>
          </span>
        </label>
        <input type="file" accept="image/*" capture="user" id="selfieInput" hidden />
        <div class="lock-thumb" aria-hidden="true"></div>
      </div>

      ${pwdBlock}

      <button type="button" class="btn primary submit-btn" id="submitBtn">Resolver</button>
      <p id="answerHelp" class="answer-help" aria-live="polite"></p>
      <button type="button" class="link-btn" id="giveUpBtn">no me sale</button>
      <button type="button" class="link-btn skip-btn" id="skipBtn">skip ▸</button>
      <button type="button" class="link-btn skip-btn" id="galleryBtn">galería ▸</button>
    </article>
  `;

  document.getElementById('selfieInput').addEventListener('change', e => {
    const f = e.target.files && e.target.files[0];
    if (f) onSelfieFile(f, stop);
    e.target.value = '';
  });

  if (pwdType === 'photo-smile') {
    document.getElementById('pwdPhotoInput').addEventListener('change', e => {
      const f = e.target.files && e.target.files[0];
      if (f) onPwdPhotoFile(f, stop);
      e.target.value = '';
    });
  } else {
    const input = document.getElementById('answerInput');
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') { e.preventDefault(); attemptSubmit(stop); }
    });
  }

  document.getElementById('submitBtn').addEventListener('click', () => attemptSubmit(stop));
  document.getElementById('giveUpBtn').addEventListener('click', () => {
    if (confirm('¿Revelar la respuesta y avanzar?')) onSolve(stop, true);
  });
  document.getElementById('skipBtn').addEventListener('click', () => {
    state.solvedIds.add(stop.id);
    state.solvedWithHelp.add(stop.id);
    persist();
    renderClue();
    updateRadar();
  });
  document.getElementById('galleryBtn').addEventListener('click', () => openFinale());

  // pre-fill the answer in debug mode so the user can just click Resolver
  if (debugMode && pwdType !== 'photo-smile') {
    const input = document.getElementById('answerInput');
    if (input) input.value = stop.answer || '';
  }

  refreshLocksFromStorage(stop);
  updateRadar();
}

async function refreshLocksFromStorage(stop) {
  const selfieRec = await loadSelfie(stop.id);
  if (selfieRec && (selfieRec.faces || 0) >= 2) {
    activeLocks.selfieValid = true;
    setLockUI('lock-selfie', 'valid', `✓ ${selfieRec.faces} caras detectadas`);
    showLockThumb('lock-selfie', selfieRec.blob);
  }
  if (stop.passwordType === 'photo-smile') {
    const pwdRec = await loadPwdPhoto(stop.id);
    if (pwdRec && (pwdRec.happiest || 0) >= SMILE_THRESHOLD) {
      activeLocks.pwdValid = true;
      setLockUI('lock-pwd', 'valid', '✓ Sonrisa detectada');
      showLockThumb('lock-pwd', pwdRec.blob);
    }
  }
  refreshSubmitButton();
}

function setLockUI(slotClass, lockState, msg) {
  const slot = document.querySelector('.' + slotClass);
  if (!slot) return;
  slot.dataset.state = lockState;
  const status = slot.querySelector('.lock-status');
  const detail = slot.querySelector('.lock-detail');
  const symbols = { empty: '○', processing: '…', valid: '✓', invalid: '✗' };
  if (status) status.textContent = symbols[lockState] || '○';
  if (detail && msg !== undefined) detail.textContent = msg;
}

function showLockThumb(slotClass, blob) {
  const thumb = document.querySelector('.' + slotClass + ' .lock-thumb');
  if (!thumb) return;
  const prev = thumb.querySelector('img');
  if (prev && prev.src.startsWith('blob:')) URL.revokeObjectURL(prev.src);
  const url = URL.createObjectURL(blob);
  thumb.innerHTML = `<img src="${url}" alt="">`;
}

async function onSelfieFile(file, stop) {
  setLockUI('lock-selfie', 'processing', 'Validando selfie…');
  try {
    const blob = await downscale(file, 1280, 0.86);
    if (TEST_MODE) {
      await saveSelfie(stop.id, blob, { faces: 2, happiest: 0 });
      activeLocks.selfieValid = true;
      setLockUI('lock-selfie', 'valid', '✓ test mode (skipped)');
      showLockThumb('lock-selfie', blob);
      refreshSubmitButton();
      return;
    }
    const detections = await detectFaces(blob);
    const sum = summarize(detections);
    if (sum.faces >= 2) {
      await saveSelfie(stop.id, blob, sum);
      activeLocks.selfieValid = true;
      setLockUI('lock-selfie', 'valid', `✓ ${sum.faces} caras detectadas`);
      showLockThumb('lock-selfie', blob);
    } else {
      activeLocks.selfieValid = false;
      setLockUI('lock-selfie', 'invalid', `Solo vi ${sum.faces} cara${sum.faces === 1 ? '' : 's'}. Necesito dos. Probá de nuevo.`);
    }
  } catch (e) {
    console.error('selfie error', e);
    activeLocks.selfieValid = false;
    setLockUI('lock-selfie', 'invalid', 'Error al validar — ¿hay conexión? Tocá para reintentar.');
  }
  refreshSubmitButton();
}

async function onPwdPhotoFile(file, stop) {
  setLockUI('lock-pwd', 'processing', 'Validando sonrisa…');
  try {
    const blob = await downscale(file, 1280, 0.86);
    if (TEST_MODE) {
      await savePwdPhoto(stop.id, blob, { faces: 1, happiest: 1 });
      activeLocks.pwdValid = true;
      setLockUI('lock-pwd', 'valid', '✓ test mode (skipped)');
      showLockThumb('lock-pwd', blob);
      refreshSubmitButton();
      return;
    }
    const detections = await detectFaces(blob);
    const sum = summarize(detections);
    if (hasSmile(detections)) {
      await savePwdPhoto(stop.id, blob, sum);
      activeLocks.pwdValid = true;
      setLockUI('lock-pwd', 'valid', `✓ Sonrisa detectada (${(sum.happiest * 100) | 0}%)`);
      showLockThumb('lock-pwd', blob);
    } else {
      activeLocks.pwdValid = false;
      const msg = sum.faces === 0
        ? 'No vi ninguna cara. Asegurate de que esté en foco.'
        : `Vi una cara pero no estaba sonriendo (${(sum.happiest * 100) | 0}%). Probá de nuevo.`;
      setLockUI('lock-pwd', 'invalid', msg);
    }
  } catch (e) {
    console.error('pwd photo error', e);
    activeLocks.pwdValid = false;
    setLockUI('lock-pwd', 'invalid', 'Error al validar — ¿hay conexión?');
  }
  refreshSubmitButton();
}

function refreshSubmitButton() {
  const btn = document.getElementById('submitBtn');
  if (!btn || !activeLocks) return;
  const ok = activeLocks.selfieValid && activeLocks.pwdValid;
  btn.classList.toggle('is-ready', ok);
}

function attemptSubmit(stop) {
  const help = document.getElementById('answerHelp');
  if (!activeLocks.selfieValid) {
    help.textContent = 'Necesito la selfie con Billy primero.';
    pulseLock('lock-selfie');
    return;
  }
  if (activeLocks.pwdType === 'photo-smile') {
    if (!activeLocks.pwdValid) {
      help.textContent = 'Necesito la foto de Billy sonriendo.';
      pulseLock('lock-pwd');
      return;
    }
  } else {
    const input = document.getElementById('answerInput');
    const v = input.value;
    if (TEST_MODE && (v === '' || v.trim() === '?')) {
      help.textContent = '';
      onSolve(stop, false);
      return;
    }
    if (!answerMatches(v, stop)) {
      help.textContent = 'Sigue buscando…';
      input.classList.remove('shake');
      void input.offsetWidth;
      input.classList.add('shake');
      return;
    }
  }
  help.textContent = '';
  onSolve(stop, false);
}

function pulseLock(slotClass) {
  const slot = document.querySelector('.' + slotClass);
  if (!slot) return;
  slot.classList.remove('pulse');
  void slot.offsetWidth;
  slot.classList.add('pulse');
}

function onSolve(stop, withHelp) {
  state.solvedIds.add(stop.id);
  if (withHelp) state.solvedWithHelp.add(stop.id);
  persist();
  showRewardThen(stop, () => {
    renderClue();
  });
}

function showRewardThen(stop, then) {
  const reward = stop.reward || {};
  const overlay = document.createElement('div');
  overlay.className = 'reward-overlay';
  const food = reward.food ? `
    <div class="food-card">
      <div class="food-place">${escapeHtml(reward.food.place || '')}</div>
      ${reward.food.order ? `<div class="food-order">${escapeHtml(reward.food.order)}</div>` : ''}
      ${reward.food.priceUSD != null ? `<div class="food-price">~$${escapeHtml(String(reward.food.priceUSD))}</div>` : ''}
    </div>` : '';
  overlay.innerHTML = `
    <div class="reward-card" role="dialog" aria-modal="true" aria-labelledby="rewardTitle">
      <div class="reward-name">${escapeHtml(stop.name)}</div>
      <h3 id="rewardTitle">${escapeHtml(reward.title || '')}</h3>
      ${reward.body ? `<p>${escapeHtml(reward.body)}</p>` : ''}
      ${food}
      <button class="btn primary" id="rewardNext"><span>Siguiente</span><span class="ic">${ICON.arrow}</span></button>
    </div>
  `;
  document.body.appendChild(overlay);
  const btn = overlay.querySelector('#rewardNext');
  btn.focus();
  btn.addEventListener('click', () => { overlay.remove(); then(); });
}

// ---------- finale ----------
async function openFinale() {
  const dlg = document.getElementById('finaleDialog');

  const photoUrls = [];
  const tiles = [];
  const addTile = (src, extra = '') => {
    const i = tiles.length;
    tiles.push(`<figure class="pic${extra}" style="--i:${i}"><img src="${src}" alt="" loading="lazy" onerror="this.closest('figure').remove()"></figure>`);
  };

  const selfieIds = await listSelfieIds();
  for (const id of selfieIds) {
    const rec = await loadSelfie(id);
    if (rec) {
      const url = URL.createObjectURL(rec.blob);
      photoUrls.push(url);
      addTile(url, ' pic-game');
    }
  }
  const pwdIds = await listPwdPhotoIds();
  for (const id of pwdIds) {
    const rec = await loadPwdPhoto(id);
    if (rec) {
      const url = URL.createObjectURL(rec.blob);
      photoUrls.push(url);
      addTile(url, ' pic-game');
    }
  }
  for (const fname of HUNT.finale.pics || []) {
    addTile(`pics/${encodeURIComponent(fname)}`);
  }

  const tilesHtml = tiles.length
    ? tiles.join('')
    : '<p class="muted">Sin fotos guardadas.</p>';

  dlg.innerHTML = `
    <article class="finale-content">
      <h2>${escapeHtml(HUNT.finale.title)}</h2>
      <p>${escapeHtml(HUNT.finale.body)}</p>
      <div class="gallery">${tilesHtml}</div>
      <div class="actions">
        <button class="btn ghost" id="closeFinaleBtn">Cerrar</button>
      </div>
    </article>
  `;

  document.getElementById('closeFinaleBtn').addEventListener('click', () => dlg.close());

  if (typeof dlg.showModal === 'function') dlg.showModal();
  else dlg.setAttribute('open', '');
  dlg.addEventListener('close', () => photoUrls.forEach(u => URL.revokeObjectURL(u)), { once: true });
}

// ---------- preload face models when idle ----------
if (!TEST_MODE) {
  const warm = () => ensureFaceModels().catch(() => {});
  if ('requestIdleCallback' in window) requestIdleCallback(warm, { timeout: 4000 });
  else setTimeout(warm, 2000);
}

// ---------- boot ----------
if (debugMode) document.body.classList.add('is-debug');
renderClue();
updateRadar();
