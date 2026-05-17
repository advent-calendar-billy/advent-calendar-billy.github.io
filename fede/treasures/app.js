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
{
  const _p = new URLSearchParams(location.search);
  if (_p.has('debug')) localStorage.setItem('tesoros:debug', '1');
  if (_p.has('nodebug')) localStorage.setItem('tesoros:debug', '0');
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
// debug mode is ON by default during pre-launch development.
// to ship: change this to `=== '1'` (off unless explicitly enabled) before sharing with Fede.
let debugMode = localStorage.getItem(DEBUG_KEY) !== '0';

let spoofPos = null;            // [lat, lng] set by the debug GPS spoofer
let spoofActive = false;        // when true, currentPos returns spoofPos
function currentPos() { return (spoofActive && spoofPos) ? spoofPos : realPos; }

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
const RADAR_INNER_R = 14;      // SVG units: closer than this stacks at center
const RADAR_EDGE_R = 96;       // SVG units: out-of-range blip clamps here

const radarBlip = document.getElementById('radarBlip');
const radarBlipHalo = radarBlip?.querySelector('.radar-blip-halo');
const radarStatus = document.getElementById('radarStatus');
const radarForward = document.getElementById('radarForward');

// blip in absolute (north-up) coordinates; screen position computed each frame
let blipBearingAbs = null;       // 0 = north, clockwise
let blipDistance = null;         // metres
let blipOutOfRange = false;
let blipFound = false;

// device heading, smoothed; null when no compass available
let heading = null;
let compassRequested = false;

function attachCompass() {
  if (typeof DeviceOrientationEvent === 'undefined') return;
  if ('ondeviceorientationabsolute' in window) {
    window.addEventListener('deviceorientationabsolute', onOrientation);
  }
  window.addEventListener('deviceorientation', onOrientation);
}

function requestCompass() {
  if (compassRequested) return;
  compassRequested = true;
  if (typeof DeviceOrientationEvent === 'undefined') return;
  if (typeof DeviceOrientationEvent.requestPermission === 'function') {
    DeviceOrientationEvent.requestPermission()
      .then(s => { if (s === 'granted') attachCompass(); })
      .catch(() => {});
  } else {
    attachCompass();
  }
}

function onOrientation(e) {
  let h;
  if (typeof e.webkitCompassHeading === 'number') {
    h = e.webkitCompassHeading;
  } else if (typeof e.alpha === 'number') {
    h = (360 - e.alpha) % 360;
  } else {
    return;
  }
  if (heading == null) { heading = h; return; }
  let diff = h - heading;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;
  heading = (heading + diff * 0.18 + 360) % 360;
}

function fmtDist(m) {
  if (m == null) return '—';
  if (m < 1000) return `${Math.round(m)} m`;
  return `${(m / 1000).toFixed(2)} km`;
}

function blipRadiusPx() {
  if (blipDistance == null) return null;
  if (blipOutOfRange) return RADAR_EDGE_R;
  const t = Math.max(0, Math.min(1, blipDistance / RADAR_MAX_M));
  return RADAR_INNER_R + (RADAR_EDGE_R - RADAR_INNER_R) * Math.pow(t, 0.85);
}

function updateRadar() {
  const idx = state.activeIndex;
  const here = currentPos();
  const target = activeStopCoord();

  if (idx < 0) {
    radarBlip.style.display = 'none';
    blipBearingAbs = null;
    radarStatus.textContent = '· objetivo alcanzado ·';
    return;
  }
  if (!here) {
    radarBlip.style.display = 'none';
    blipBearingAbs = null;
    radarStatus.textContent = gpsErr ? `gps · ${gpsErr}` : 'esperando posición…';
    return;
  }
  if (!target) {
    radarBlip.style.display = 'none';
    radarStatus.textContent = '';
    return;
  }

  blipDistance = haversine(here, target);
  const b = bearingRad(here, target);
  blipBearingAbs = (b * 180 / Math.PI + 360) % 360;
  blipOutOfRange = blipDistance > RADAR_MAX_M;
  blipFound = blipDistance < 5;

  radarBlip.style.display = '';
  radarBlip.classList.toggle('edge', blipOutOfRange);
  radarBlip.classList.toggle('found', blipFound);

  const num = String(idx + 1).padStart(2, '0');
  let s;
  if (blipFound) s = `· ${num} · LLEGASTE ·`;
  else if (blipOutOfRange) s = `parada ${num} · ${fmtDist(blipDistance)} · fuera del radar`;
  else s = `parada ${num} · ${fmtDist(blipDistance)}`;
  if (heading != null) s += ` · ${Math.round(heading)}°`;
  radarStatus.textContent = s;
}

// rAF loop: position blip at true bearing (north-up), rotate the "facing"
// arrow with the phone's heading, and brighten the halo as the sweep passes.
// The radar disc itself never rotates — N stays at the top.
function radarTick(t) {
  if (radarForward) {
    if (heading != null) {
      radarForward.style.display = '';
      radarForward.setAttribute('transform', `rotate(${heading.toFixed(1)})`);
    } else {
      radarForward.style.display = 'none';
    }
  }

  const sweepDeg = ((t / 4000) * 360) % 360;

  if (blipBearingAbs != null && radarBlip.style.display !== 'none') {
    const r = blipRadiusPx();
    if (r != null) {
      const rad = blipBearingAbs * Math.PI / 180;
      const x = Math.sin(rad) * r;
      const y = -Math.cos(rad) * r;
      radarBlip.setAttribute('transform', `translate(${x.toFixed(2)} ${y.toFixed(2)})`);
    }
    if (radarBlipHalo) {
      // sweep and blip are both in absolute (north-up) frame
      const behind = (sweepDeg - blipBearingAbs + 360) % 360;
      const win = 60;
      const glow = behind <= win ? (1 - behind / win) : 0.15;
      radarBlipHalo.style.setProperty('--blip-glow', (0.25 + glow * 0.75).toFixed(3));
    }
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

document.getElementById('sonarToggle')?.addEventListener('click', () => { requestCompass(); setSonar(!sonarOn); });
document.getElementById('radar')?.addEventListener('click', requestCompass);

document.getElementById('restartBtn')?.addEventListener('click', async () => {
  if (!confirm('¿Borrar todo el progreso y las fotos y empezar de cero?')) return;
  clearProgress();
  await clearAllPhotos();
  location.reload();
});

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
  if (on) ensureGpsSpoofer();
  else hideGpsSpoofer();
}

// ---------- debug GPS spoofer (lazy-loaded Leaflet, debug-only) ----------
const gpsSpoofEl = document.getElementById('gpsSpoof');
const gpsSpoofMapEl = document.getElementById('gpsSpoofMap');
const gpsSpoofInfoEl = document.getElementById('gpsSpoofInfo');
const gpsSpoofToggleBtn = document.getElementById('gpsSpoofToggle');
const gpsSpoofJumpBtn = document.getElementById('gpsSpoofJump');
const gpsSpoofCollapseBtn = document.getElementById('gpsSpoofCollapse');

let spoofMap = null;
let spoofMarker = null;
let leafletLoading = null;

function loadLeaflet() {
  if (window.L) return Promise.resolve();
  if (leafletLoading) return leafletLoading;
  leafletLoading = new Promise((resolve, reject) => {
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    css.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
    css.crossOrigin = '';
    document.head.appendChild(css);
    const s = document.createElement('script');
    s.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    s.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
    s.crossOrigin = '';
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('leaflet load failed'));
    document.head.appendChild(s);
  });
  return leafletLoading;
}

function spoofStartingPos() {
  const target = activeStopCoord();
  if (target) return [target[0] + 0.0008, target[1] + 0.0009]; // ~100m offset
  return [42.3601, -71.0589]; // Boston Common fallback
}

function updateSpoofInfo() {
  if (!gpsSpoofInfoEl) return;
  if (!spoofPos) {
    gpsSpoofInfoEl.textContent = 'arrastrá el pin';
    return;
  }
  const [lat, lng] = spoofPos;
  const d = distanceToActive();
  const dStr = d == null ? '—' : fmtDist(d);
  gpsSpoofInfoEl.textContent = `${lat.toFixed(5)}, ${lng.toFixed(5)} · ${dStr}`;
}

function setSpoofActive(on) {
  spoofActive = on;
  if (gpsSpoofToggleBtn) {
    gpsSpoofToggleBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
    gpsSpoofToggleBtn.textContent = on ? 'desactivar' : 'activar';
  }
  if (sonarOn) scheduleNextBeep();
  updateRadar();
}

async function ensureGpsSpoofer() {
  if (!gpsSpoofEl) return;
  gpsSpoofEl.hidden = false;
  if (spoofMap) return;
  try { await loadLeaflet(); } catch { return; }
  if (spoofMap) return;
  const start = spoofStartingPos();
  spoofPos = start;
  spoofMap = L.map(gpsSpoofMapEl, { zoomControl: true, attributionControl: true })
    .setView(start, 15);
  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OSM &copy; CARTO',
    subdomains: 'abcd', maxZoom: 19
  }).addTo(spoofMap);
  const icon = L.divIcon({
    className: 'gps-spoof-pin-wrap',
    html: '<div class="gps-spoof-pin"></div>',
    iconSize: [18, 18], iconAnchor: [9, 9]
  });
  spoofMarker = L.marker(start, { icon, draggable: true, autoPan: true }).addTo(spoofMap);

  // plot every stop as a small reference marker so the user can sanity-check coords
  HUNT.stops.forEach((stop, i) => {
    const stopIcon = L.divIcon({
      className: 'gps-spoof-stop-wrap',
      html: `<div class="gps-spoof-stop">${i + 1}</div>`,
      iconSize: [18, 18], iconAnchor: [9, 9]
    });
    L.marker(stop.coord, { icon: stopIcon, interactive: true, title: stop.name })
      .addTo(spoofMap)
      .bindTooltip(`${i + 1}. ${stop.name}`, { direction: 'top', offset: [0, -8] });
  });

  const sync = () => {
    const p = spoofMarker.getLatLng();
    spoofPos = [p.lat, p.lng];
    updateSpoofInfo();
    updateRadar();
    if (sonarOn) scheduleNextBeep();
  };
  spoofMarker.on('drag', sync);
  spoofMarker.on('dragend', sync);
  spoofMap.on('click', (e) => {
    spoofMarker.setLatLng(e.latlng);
    sync();
  });
  updateSpoofInfo();
}

function hideGpsSpoofer() {
  if (gpsSpoofEl) gpsSpoofEl.hidden = true;
  if (spoofActive) setSpoofActive(false);
}

gpsSpoofToggleBtn?.addEventListener('click', () => setSpoofActive(!spoofActive));
gpsSpoofJumpBtn?.addEventListener('click', () => {
  if (!spoofMap || !spoofMarker) return;
  const target = activeStopCoord();
  if (!target) return;
  const here = [target[0] + 0.0008, target[1] + 0.0009];
  spoofMarker.setLatLng(here);
  spoofMap.setView(here, Math.max(spoofMap.getZoom(), 15));
  spoofPos = here;
  updateSpoofInfo();
  updateRadar();
  if (sonarOn) scheduleNextBeep();
});
gpsSpoofCollapseBtn?.addEventListener('click', () => {
  gpsSpoofEl?.classList.toggle('is-collapsed');
  if (spoofMap && !gpsSpoofEl?.classList.contains('is-collapsed')) {
    setTimeout(() => spoofMap.invalidateSize(), 50);
  }
});

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
  clearFinaleBlobs();
  renderProgressLabel();
  const idx = state.activeIndex;

  if (idx < 0) {
    renderFinale();
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
  document.getElementById('galleryBtn').addEventListener('click', () => renderFinale());

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
const finaleBlobUrls = [];
function clearFinaleBlobs() {
  while (finaleBlobUrls.length) URL.revokeObjectURL(finaleBlobUrls.pop());
}

function renderFinale() {
  renderProgressLabel();
  cluePanel.innerHTML = `
    <article class="clue-card done">
      <h2>${escapeHtml(HUNT.finale.title)}</h2>
      <p>${escapeHtml(HUNT.finale.body)}</p>
      <div class="gallery" id="finaleGallery"><p class="muted">cargando fotos…</p></div>
    </article>
  `;
  fillFinaleGallery();
}

async function fillFinaleGallery() {
  clearFinaleBlobs();
  const tiles = [];
  const addTile = (src, extra = '') => {
    const i = tiles.length;
    tiles.push(`<figure class="pic${extra}" style="--i:${i}"><img src="${src}" alt="" loading="lazy" onerror="this.closest('figure').remove()"></figure>`);
  };

  for (const id of await listSelfieIds()) {
    const rec = await loadSelfie(id);
    if (rec) {
      const url = URL.createObjectURL(rec.blob);
      finaleBlobUrls.push(url);
      addTile(url, ' pic-game');
    }
  }
  for (const id of await listPwdPhotoIds()) {
    const rec = await loadPwdPhoto(id);
    if (rec) {
      const url = URL.createObjectURL(rec.blob);
      finaleBlobUrls.push(url);
      addTile(url, ' pic-game');
    }
  }
  for (const fname of HUNT.finale.pics || []) {
    addTile(`pics/${encodeURIComponent(fname)}`);
  }

  const gallery = document.getElementById('finaleGallery');
  if (!gallery) return;
  gallery.innerHTML = tiles.length
    ? tiles.join('')
    : '<p class="muted">Sin fotos guardadas.</p>';
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
