import { HUNT } from './data.js';
import { ICON } from './icons.js';
import {
  loadProgress, saveProgress, clearProgress,
  saveSelfie, loadSelfie, listSelfieIds,
  savePwdPhoto, loadPwdPhoto, listPwdPhotoIds,
  clearAllPhotos
} from './storage.js';
import { exportZip } from './export.js';
import { detectFaces, hasSmile, summarize, ensureFaceModels, SMILE_THRESHOLD } from './faces.js';

const TEST_MODE = new URLSearchParams(location.search).has('test');
if (TEST_MODE) {
  clearProgress();
  await clearAllPhotos();
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

// ---------- map ----------
const map = L.map('map', { zoomControl: true, attributionControl: true, scrollWheelZoom: true });
L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
  subdomains: 'abcd', maxZoom: 20
}).addTo(map);

const stopLayers = new Map();
function pinIcon(label, solved) {
  return L.divIcon({
    className: 'pin-icon',
    html: `<span class="pin-num${solved ? ' is-solved' : ''}">${escapeHtml(label)}</span>`,
    iconSize: [28, 28], iconAnchor: [14, 14]
  });
}
function offsetCenter(stop) {
  return [stop.coord[0] + stop.circle.offset[0], stop.coord[1] + stop.circle.offset[1]];
}

function renderMap() {
  for (const layer of stopLayers.values()) {
    if (layer.circle) layer.circle.remove();
    if (layer.marker) layer.marker.remove();
  }
  stopLayers.clear();
  const bounds = [];
  HUNT.stops.forEach((stop, i) => {
    const isSolved = state.solvedIds.has(stop.id);
    const isActive = i === state.activeIndex;
    if (isSolved) {
      const marker = L.marker(stop.coord, {
        icon: pinIcon(String(i + 1), true), keyboard: false, title: stop.name
      }).addTo(map);
      marker.on('click', () => map.flyTo(stop.coord, 16, { duration: 0.5 }));
      stopLayers.set(stop.id, { marker });
      bounds.push(stop.coord);
    } else {
      const center = offsetCenter(stop);
      const className = `mystery${isActive ? ' is-active' : ''}`;
      const circle = L.circle(center, {
        radius: stop.circle.radius, className,
        color: '#C58A3A', weight: 2,
        opacity: isActive ? 0.85 : 0.55,
        fillColor: '#C58A3A', fillOpacity: isActive ? 0.22 : 0.12,
        dashArray: isActive ? '0' : '5 6', interactive: false
      }).addTo(map);
      stopLayers.set(stop.id, { circle });
      const latPad = stop.circle.radius / 111000;
      const lngPad = stop.circle.radius / (111000 * Math.cos(center[0] * Math.PI / 180));
      bounds.push([center[0] + latPad, center[1] + lngPad]);
      bounds.push([center[0] - latPad, center[1] - lngPad]);
    }
  });
  if (bounds.length) map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16, animate: false });
}

function focusActiveStop() {
  const idx = state.activeIndex;
  if (idx < 0) return;
  const stop = HUNT.stops[idx];
  map.flyTo(offsetCenter(stop), Math.max(map.getZoom(), 15), { duration: 0.5 });
}

// you-are-here
let meMarker = null;
if ('geolocation' in navigator) {
  navigator.geolocation.watchPosition(
    pos => {
      const ll = [pos.coords.latitude, pos.coords.longitude];
      if (!meMarker) {
        meMarker = L.circleMarker(ll, {
          radius: 7, color: '#2A2520', weight: 2,
          fillColor: '#FAF6EE', fillOpacity: 1, className: 'me-dot'
        }).addTo(map);
      } else { meMarker.setLatLng(ll); }
    },
    () => {},
    { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
  );
}

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

  cluePanel.innerHTML = `
    <article class="clue-card" data-stop="${escapeHtml(stop.id)}" data-pwd-type="${pwdType}">
      <header class="clue-head">
        <span class="chip${typeClass}">${typeLabel}</span>
      </header>
      <p class="clue-text" lang="${escapeHtml(stop.lang)}">${escapeHtml(stop.clue)}</p>

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

  refreshLocksFromStorage(stop);
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
    renderMap();
    renderClue();
    focusActiveStop();
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
  const ids = await listSelfieIds();
  const items = [];
  for (const id of ids) {
    const rec = await loadSelfie(id);
    const meta = HUNT.stops.find(s => s.id === id);
    if (rec && meta) items.push({ id, name: meta.name, blob: rec.blob });
  }
  const photoUrls = items.map(p => URL.createObjectURL(p.blob));
  const tiles = items.length
    ? items.map((p, i) => `<figure><img src="${photoUrls[i]}" alt=""><figcaption>${escapeHtml(p.name)}</figcaption></figure>`).join('')
    : '<p class="muted">Sin fotos guardadas.</p>';

  dlg.innerHTML = `
    <article class="finale-content">
      <h2>${escapeHtml(HUNT.finale.title)}</h2>
      <p>${escapeHtml(HUNT.finale.body)}</p>
      <div class="gallery">${tiles}</div>
      <div class="actions">
        <button class="btn primary" id="zipBtn"><span class="ic">${ICON.send}</span><span>Enviar a Billy</span></button>
        <button class="btn ghost" id="closeFinaleBtn">Cerrar</button>
      </div>
    </article>
  `;

  document.getElementById('zipBtn').addEventListener('click', async () => {
    try { await exportZip(); } catch (e) { alert('No se pudo crear el zip: ' + e.message); }
  });
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
renderMap();
renderClue();
