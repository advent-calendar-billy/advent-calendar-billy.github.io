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
// debug off for shipping; ?debug or pressing '6' opt-in (in-session only)
const DEBUG_FROM_URL = new URLSearchParams(location.search).has('debug');
// one-time cleanup: an earlier build defaulted debug ON and persisted it.
// clear that flag so existing testers don't accidentally play with cheats on.
localStorage.removeItem('tesoros:debug');

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
// debug-only navigation override: when set, state.activeIndex returns this
// instead of being derived from solvedIds. -1 = gallery, 0..N-1 = stop index.
let debugActiveOverride = null;
const state = {
  solvedIds: new Set(initial.solvedIds),
  solvedWithHelp: new Set(initial.solvedWithHelp),
  get activeIndex() {
    if (debugActiveOverride !== null) return debugActiveOverride;
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
const DEBUG_KEY = 'tesoros:debug'; // kept for reference / future migrations; not read anymore
let realPos = null;     // [lat, lng] from GPS
// debug is off in production; opt in with ?debug URL param or '6' key toggle (in-session only)
let debugMode = DEBUG_FROM_URL;

let spoofPos = null;            // [lat, lng] set by the debug GPS spoofer
let spoofActive = false;        // when true, currentPos returns spoofPos
function currentPos() { return (spoofActive && spoofPos) ? spoofPos : realPos; }

let gpsErr = null; // last geolocation error message (shown in the compass status line when no fix yet)

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

// ---------- compass ----------
const needleRotor = document.getElementById('needleRotor');
const faceRose = document.getElementById('faceRose');
const compassStatus = document.getElementById('compassStatus');

// last computed target bearing/distance (in absolute world coords)
let targetBearingAbs = null;     // 0 = north, clockwise
let targetDistance = null;       // metres
let targetFound = false;

// device heading, smoothed; null when no compass available
let realHeading = null;          // from device orientation
let spoofHeading = null;         // from the debug heading slider; overrides realHeading when set
function effectiveHeading() {
  return spoofHeading != null ? spoofHeading : (realHeading != null ? realHeading : 0);
}
function haveHeading() {
  return spoofHeading != null || realHeading != null;
}

let compassRequested = false;
function attachCompass() {
  if (typeof DeviceOrientationEvent === 'undefined') return;
  // Prefer absolute orientation (Android Chrome) — `deviceorientation`'s alpha is
  // relative to the page-load orientation, not true north, so we ignore it on Android.
  // iOS doesn't expose deviceorientationabsolute; it uses webkitCompassHeading on the
  // regular deviceorientation event (which IS compass-aligned).
  if ('ondeviceorientationabsolute' in window) {
    window.addEventListener('deviceorientationabsolute', onOrientation);
  } else {
    window.addEventListener('deviceorientation', onOrientation);
  }
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
  } else if (typeof e.alpha === 'number' && e.absolute) {
    // Only trust alpha when the platform marks the reading as absolute (i.e. earth-fixed
    // frame). Relative orientation drifts and gives a "compass" pinned to whatever way
    // the phone happened to be facing at page load — wrong.
    h = (360 - e.alpha) % 360;
  } else {
    return;
  }
  if (realHeading == null) { realHeading = h; return; }
  let diff = h - realHeading;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;
  realHeading = (realHeading + diff * 0.18 + 360) % 360;
}

function fmtDist(m) {
  if (m == null) return '—';
  if (m < 1000) return `${Math.round(m)} m`;
  return `${(m / 1000).toFixed(2)} km`;
}

function updateRadar() {
  // Re-render the clue panel if the lock-state flipped (entered or left Cape Ann).
  const wantsLock = shouldShowDay2Lock();
  const hasLock = !!document.querySelector('.clue-card.day-lock');
  if (wantsLock !== hasLock) {
    renderClue();
    return;
  }

  const idx = state.activeIndex;
  const here = currentPos();
  const target = activeStopCoord();

  if (idx < 0) {
    if (needleRotor) needleRotor.style.display = 'none';
    targetBearingAbs = null;
    compassStatus.textContent = '· encontraste todos los tesoros ·';
    return;
  }
  if (wantsLock) {
    if (needleRotor) needleRotor.style.display = 'none';
    targetBearingAbs = null;
    const n = nearestDay2();
    compassStatus.textContent = n ? `bloqueado · ${fmtDist(n.d)} a ${n.stop.name.split(/[ ,]/)[0]}` : 'bloqueado · llegá a Cape Ann';
    // also refresh the live distance in the lock card itself
    const lockDist = document.querySelector('.day-lock .lock-dist');
    if (lockDist && n) {
      lockDist.innerHTML = `<span class="lock-num">${fmtDist(n.d)}</span> hasta ${escapeHtml(n.stop.name)}`;
    }
    return;
  }
  if (!here) {
    if (needleRotor) needleRotor.style.display = 'none';
    targetBearingAbs = null;
    compassStatus.textContent = gpsErr ? `gps · ${gpsErr}` : 'esperando posición…';
    return;
  }
  if (!target) {
    if (needleRotor) needleRotor.style.display = 'none';
    compassStatus.textContent = '';
    return;
  }

  targetDistance = haversine(here, target);
  const b = bearingRad(here, target);
  targetBearingAbs = (b * 180 / Math.PI + 360) % 360;
  targetFound = targetDistance < 5;

  if (needleRotor) needleRotor.style.display = '';

  const num = String(idx + 1).padStart(2, '0');
  let s;
  if (targetFound) s = `· ${num} · llegaste ·`;
  else s = `parada ${num} · ${fmtDist(targetDistance)}`;
  if (haveHeading()) s += ` · ${Math.round(effectiveHeading())}°`;
  compassStatus.textContent = s;
}

// rAF loop: rotate the rose face by -heading (so N points to true world-north),
// rotate the needle by (bearing - heading) (so red tip points at the target).
// Both transitions are CSS-driven; we just update the target transforms here.
let needleRotAcc = 0;
let faceRotAcc = 0;
function shortestStep(current, target) {
  target = ((target % 360) + 360) % 360;
  let delta = target - (((current % 360) + 360) % 360);
  if (delta > 180) delta -= 360;
  if (delta < -180) delta += 360;
  return current + delta;
}
function compassTick() {
  const h = haveHeading() ? effectiveHeading() : 0;

  // face: rotate by -heading so the N label tracks true north in the world
  const faceTarget = (-h + 360) % 360;
  faceRotAcc = shortestStep(faceRotAcc, faceTarget);
  if (faceRose) faceRose.setAttribute('transform', `rotate(${faceRotAcc.toFixed(1)})`);

  // needle: rotate to (bearing - heading) so red tip lands on the target's spot
  if (targetBearingAbs != null && needleRotor && needleRotor.style.display !== 'none') {
    const needleTarget = (targetBearingAbs - h + 360) % 360;
    needleRotAcc = shortestStep(needleRotAcc, needleTarget);
    needleRotor.setAttribute('transform', `rotate(${needleRotAcc.toFixed(1)})`);
  }

  requestAnimationFrame(compassTick);
}
requestAnimationFrame(compassTick);

// build tick marks + degree numbers (only the rotating-face stuff; runs once at boot)
(function buildCompassDecorations() {
  const ticks = document.getElementById('ticks');
  const SVG = 'http://www.w3.org/2000/svg';
  if (ticks) {
    for (let i = 0; i < 72; i++) {
      const a = i * 5;
      const isMajor = a % 30 === 0;
      const isMid = a % 15 === 0;
      const r1 = 122;
      const r2 = isMajor ? 108 : isMid ? 113 : 117;
      const x1 = Math.sin(a * Math.PI / 180) * r1;
      const y1 = -Math.cos(a * Math.PI / 180) * r1;
      const x2 = Math.sin(a * Math.PI / 180) * r2;
      const y2 = -Math.cos(a * Math.PI / 180) * r2;
      const ln = document.createElementNS(SVG, 'line');
      ln.setAttribute('x1', x1.toFixed(2)); ln.setAttribute('y1', y1.toFixed(2));
      ln.setAttribute('x2', x2.toFixed(2)); ln.setAttribute('y2', y2.toFixed(2));
      ln.setAttribute('stroke', '#3a2412');
      ln.setAttribute('stroke-width', isMajor ? 1.4 : isMid ? 1 : 0.7);
      ln.setAttribute('opacity', isMajor ? 0.9 : isMid ? 0.7 : 0.45);
      ticks.appendChild(ln);
    }
    const card = new Set([0, 90, 180, 270]);
    for (let a = 0; a < 360; a += 30) {
      if (card.has(a)) continue;
      const x = Math.sin(a * Math.PI / 180) * 99;
      const y = -Math.cos(a * Math.PI / 180) * 99 + 3.5;
      const t = document.createElementNS(SVG, 'text');
      t.setAttribute('x', x.toFixed(2));
      t.setAttribute('y', y.toFixed(2));
      t.setAttribute('font-family', "'IM Fell English SC', serif");
      t.setAttribute('font-size', 9);
      t.setAttribute('text-anchor', 'middle');
      t.setAttribute('fill', '#5a4427');
      t.textContent = a;
      ticks.appendChild(t);
    }
  }
  const rivets = document.getElementById('rivets');
  if (rivets) {
    for (let i = 0; i < 12; i++) {
      const a = i * 30 + 15;
      const x = Math.sin(a * Math.PI / 180) * 131;
      const y = -Math.cos(a * Math.PI / 180) * 131;
      const c = document.createElementNS(SVG, 'circle');
      c.setAttribute('cx', x.toFixed(2));
      c.setAttribute('cy', y.toFixed(2));
      c.setAttribute('r', 2.2);
      c.setAttribute('fill', '#2a190c');
      c.setAttribute('stroke', '#d9b06a');
      c.setAttribute('stroke-width', 0.5);
      rivets.appendChild(c);
      const h = document.createElementNS(SVG, 'circle');
      h.setAttribute('cx', (x - 0.6).toFixed(2));
      h.setAttribute('cy', (y - 0.6).toFixed(2));
      h.setAttribute('r', 0.7);
      h.setAttribute('fill', '#ffe7a8');
      h.setAttribute('opacity', 0.7);
      rivets.appendChild(h);
    }
  }
})();

// poll GPS-based bearing/distance update at a steady cadence even when GPS is quiet
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
document.getElementById('compass')?.addEventListener('click', requestCompass);

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
  // intentionally NOT persisted to localStorage — debug toggles only live for this session
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

const gpsSpoofHeadingInput = document.getElementById('gpsSpoofHeading');
const gpsSpoofHeadingVal = document.getElementById('gpsSpoofHeadingVal');
gpsSpoofHeadingInput?.addEventListener('input', e => {
  const v = +e.target.value;
  spoofHeading = v;
  if (gpsSpoofHeadingVal) gpsSpoofHeadingVal.textContent = `${v}°`;
});

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

document.getElementById('gpsSpoofCapeAnn')?.addEventListener('click', () => {
  if (!spoofMap || !spoofMarker) return;
  const here = [42.6101, -70.6703]; // downtown Gloucester (Fisherman's Memorial)
  spoofMarker.setLatLng(here);
  spoofMap.setView(here, 13);
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
  if (e.target && (e.target.matches?.('input, textarea') || e.target.isContentEditable)) return;
  if (e.key === '6') {
    setDebugMode(!debugMode);
    return;
  }
  if (!debugMode) return;
  if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
    e.preventDefault();
    const N = HUNT.stops.length;
    const cur = state.activeIndex; // -1 (gallery) or 0..N-1
    let next;
    if (e.key === 'ArrowRight') {
      next = cur === -1 ? 0 : (cur === N - 1 ? -1 : cur + 1);
    } else {
      next = cur === -1 ? N - 1 : (cur === 0 ? -1 : cur - 1);
    }
    debugActiveOverride = next;
    renderClue();
    updateRadar();
  }
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
  const idx = state.activeIndex;
  if (idx < 0) {
    progressLabel.textContent = `${total} de ${total}`;
    return;
  }
  const stop = HUNT.stops[idx];
  if (typeof stop.day === 'number') {
    const dayStops = HUNT.stops.filter(s => s.day === stop.day);
    const posInDay = dayStops.findIndex(s => s.id === stop.id) + 1;
    progressLabel.textContent = `Día ${stop.day} · ${posInDay} de ${dayStops.length}`;
  } else {
    progressLabel.textContent = `Parada ${idx + 1} de ${total}`;
  }
}

// ---------- day-2 location lock ----------
const DAY2_UNLOCK_RADIUS_M = 5000; // ~5 km from any day-2 stop = "arrived in Cape Ann"

function day2Stops() { return HUNT.stops.filter(s => s.day === 2); }
function day1Complete() {
  return HUNT.stops.filter(s => s.day === 1).every(s => state.solvedIds.has(s.id));
}
function nearestDay2() {
  const here = currentPos();
  if (!here) return null;
  let best = null;
  for (const s of day2Stops()) {
    const d = haversine(here, s.coord);
    if (!best || d < best.d) best = { stop: s, d };
  }
  return best;
}
function day2UnlockedByLocation() {
  const n = nearestDay2();
  return n != null && n.d <= DAY2_UNLOCK_RADIUS_M;
}
function shouldShowDay2Lock() {
  // Locked when day-1 is done, day-2 hasn't started, and Fede isn't in Cape Ann yet.
  // Debug arrow-key navigation bypasses this (debugActiveOverride !== null).
  if (debugActiveOverride !== null) return false;
  if (!day1Complete()) return false;
  const idx = state.activeIndex;
  if (idx < 0) return false;
  const stop = HUNT.stops[idx];
  if (stop.day !== 2) return false;
  return !day2UnlockedByLocation();
}

function renderDay2Lock() {
  const n = nearestDay2();
  const here = currentPos();
  const distLine = here && n
    ? `<p class="lock-dist"><span class="lock-num">${fmtDist(n.d)}</span> hasta ${escapeHtml(n.stop.name)}</p>`
    : `<p class="lock-dist">esperando posición…</p>`;
  cluePanel.innerHTML = `
    <article class="clue-card day-lock">
      <div class="lock-mark" aria-hidden="true">
        <svg viewBox="0 0 32 32" width="36" height="36"><path d="M9 14V11a7 7 0 0 1 14 0v3M7 14h18a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V16a2 2 0 0 1 2-2zm9 5v4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </div>
      <h2>Día 2 · Cape Ann</h2>
      <p class="lock-body">El próximo tesoro se desbloquea cuando llegues.<br>Nos vemos el sábado, en Gloucester.</p>
      ${distLine}
    </article>
  `;
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

  if (shouldShowDay2Lock()) {
    renderDay2Lock();
    updateRadar();
    return;
  }

  const stop = HUNT.stops[idx];
  const typeLabel = stop.type === 'taste' ? 'Sabor' : 'Vista';
  const typeClass = stop.type === 'taste' ? ' taste' : '';
  const pwdType = stop.passwordType || 'text';

  activeLocks = { pwdValid: false, pwdType };

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

      ${pwdBlock}

      <button type="button" class="btn primary submit-btn" id="submitBtn">Resolver</button>
      <p id="answerHelp" class="answer-help" aria-live="polite"></p>

      <details class="gps-fallback">
        <summary>¿no funciona el GPS?</summary>
        <p>El próximo tesoro es <strong>${escapeHtml(stop.name)}</strong>. Buscalo en Google Maps y andá. Cuando llegues, respondé la pregunta.</p>
        <button type="button" class="link-btn skip-real" id="skipRealBtn">no llego, saltar esta parada</button>
      </details>

      <button type="button" class="link-btn skip-btn" id="skipBtn">skip ▸</button>
      <button type="button" class="link-btn skip-btn" id="galleryBtn">galería ▸</button>
    </article>
  `;

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
  document.getElementById('skipBtn').addEventListener('click', () => {
    state.solvedIds.add(stop.id);
    state.solvedWithHelp.add(stop.id);
    persist();
    debugActiveOverride = null;
    renderClue();
    updateRadar();
  });
  document.getElementById('galleryBtn').addEventListener('click', () => {
    debugActiveOverride = -1;
    renderClue();
  });
  document.getElementById('skipRealBtn').addEventListener('click', () => {
    if (!confirm(`¿Saltar "${stop.name}" y pasar al próximo tesoro?`)) return;
    state.solvedIds.add(stop.id);
    state.solvedWithHelp.add(stop.id);
    persist();
    debugActiveOverride = null;
    renderClue();
    updateRadar();
  });

  // pre-fill the answer in debug mode so the user can just click Resolver
  if (debugMode && pwdType !== 'photo-smile') {
    const input = document.getElementById('answerInput');
    if (input) input.value = stop.answer || '';
  }

  refreshLocksFromStorage(stop);
  updateRadar();
}

async function refreshLocksFromStorage(stop) {
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
  // Selfie no longer required. Photo-smile stops still need the smile photo;
  // text stops are always click-to-validate.
  const ok = activeLocks.pwdType === 'photo-smile' ? activeLocks.pwdValid : true;
  btn.classList.toggle('is-ready', ok);
}

function attemptSubmit(stop) {
  const help = document.getElementById('answerHelp');
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
  debugActiveOverride = null; // resume normal flow after solving
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
  const titleHtml = HUNT.finale.title ? `<h2>${escapeHtml(HUNT.finale.title)}</h2>` : '';
  const bodyHtml  = HUNT.finale.body  ? `<p>${escapeHtml(HUNT.finale.body)}</p>`   : '';
  cluePanel.innerHTML = `
    <article class="clue-card done">
      ${titleHtml}
      ${bodyHtml}
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

  // Selfies are intentionally NOT shown in the gallery — Fede only had to take the
  // "Billy smiling with the gift" photo (the smile-pwd at stop 08), so that's the
  // only in-game pic we surface here.
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

  // tap to zoom
  gallery.addEventListener('click', e => {
    const img = e.target.closest('.pic img');
    if (img && img.src) openLightbox(img.src);
  });
}

// ---------- lightbox ----------
const lightboxEl = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
function openLightbox(src) {
  if (!lightboxEl || !lightboxImg) return;
  lightboxImg.src = src;
  lightboxEl.hidden = false;
  lightboxEl.setAttribute('aria-hidden', 'false');
}
function closeLightbox() {
  if (!lightboxEl) return;
  lightboxEl.hidden = true;
  lightboxEl.setAttribute('aria-hidden', 'true');
  if (lightboxImg) lightboxImg.removeAttribute('src');
}
lightboxEl?.addEventListener('click', closeLightbox);
document.getElementById('lightboxClose')?.addEventListener('click', e => { e.stopPropagation(); closeLightbox(); });
window.addEventListener('keydown', e => { if (!lightboxEl?.hidden && e.key === 'Escape') closeLightbox(); });

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
