import { HUNT } from './data.js';
import { ICON } from './icons.js';
import {
  loadProgress, saveProgress, clearProgress,
  savePhoto, loadPhoto, listPhotoIds, clearPhotos
} from './storage.js';
import { exportZip } from './export.js';

const TEST_MODE = new URLSearchParams(location.search).has('test');
if (TEST_MODE) {
  clearProgress();
  await clearPhotos();
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

// ---------- map ----------
const map = L.map('map', {
  zoomControl: true,
  attributionControl: true,
  scrollWheelZoom: true
});

L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
  subdomains: 'abcd',
  maxZoom: 20
}).addTo(map);

const stopLayers = new Map();

function pinIcon(label, solved) {
  return L.divIcon({
    className: 'pin-icon',
    html: `<span class="pin-num${solved ? ' is-solved' : ''}">${escapeHtml(label)}</span>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14]
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
        icon: pinIcon(String(i + 1), true),
        keyboard: false,
        title: stop.name
      }).addTo(map);
      marker.on('click', () => map.flyTo(stop.coord, 16, { duration: 0.5 }));
      stopLayers.set(stop.id, { marker });
      bounds.push(stop.coord);
    } else {
      const center = offsetCenter(stop);
      const className = `mystery${isActive ? ' is-active' : ''}`;
      const circle = L.circle(center, {
        radius: stop.circle.radius,
        className,
        color: '#C58A3A',
        weight: 2,
        opacity: isActive ? 0.85 : 0.55,
        fillColor: '#C58A3A',
        fillOpacity: isActive ? 0.22 : 0.12,
        dashArray: isActive ? '0' : '5 6',
        interactive: false
      }).addTo(map);
      stopLayers.set(stop.id, { circle });

      // include the circle's bounding box in fitBounds
      const latPad = stop.circle.radius / 111000;
      const lngPad = stop.circle.radius / (111000 * Math.cos(center[0] * Math.PI / 180));
      bounds.push([center[0] + latPad, center[1] + lngPad]);
      bounds.push([center[0] - latPad, center[1] - lngPad]);
    }
  });

  if (bounds.length) {
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16, animate: false });
  }
}

function focusActiveStop() {
  const idx = state.activeIndex;
  if (idx < 0) return;
  const stop = HUNT.stops[idx];
  const center = offsetCenter(stop);
  map.flyTo(center, Math.max(map.getZoom(), 15), { duration: 0.5 });
}

// "you are here" — silent if denied
let meMarker = null;
if ('geolocation' in navigator) {
  navigator.geolocation.watchPosition(
    pos => {
      const ll = [pos.coords.latitude, pos.coords.longitude];
      if (!meMarker) {
        meMarker = L.circleMarker(ll, {
          radius: 7,
          color: '#2A2520',
          weight: 2,
          fillColor: '#FAF6EE',
          fillOpacity: 1,
          className: 'me-dot'
        }).addTo(map);
      } else {
        meMarker.setLatLng(ll);
      }
    },
    () => { /* silent on denial */ },
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

  cluePanel.innerHTML = `
    <article class="clue-card" data-stop="${escapeHtml(stop.id)}">
      <header class="clue-head">
        <span class="chip${typeClass}">${typeLabel}</span>
      </header>
      <p class="clue-text" lang="${escapeHtml(stop.lang)}">${escapeHtml(stop.clue)}</p>
      <form id="answerForm" class="answer-form" novalidate>
        <input id="answerInput" type="text" placeholder="Tu respuesta"
          autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false"
          inputmode="text" enterkeyhint="go" />
        <button type="submit" class="btn primary">Resolver</button>
      </form>
      <p id="answerHelp" class="answer-help" aria-live="polite"></p>
      <div class="row">
        <label class="btn ghost photo-btn" for="photoInput">
          <span class="ic">${ICON.camera}</span><span id="photoBtnLabel">Foto del lugar</span>
        </label>
        <input type="file" accept="image/*" capture="environment" id="photoInput" hidden />
        <button type="button" class="link-btn" id="giveUpBtn">no me sale</button>
      </div>
      <div id="photoPreview" class="photo-preview" aria-live="polite"></div>
    </article>
  `;

  const form = document.getElementById('answerForm');
  const input = document.getElementById('answerInput');
  const help = document.getElementById('answerHelp');

  form.addEventListener('submit', e => {
    e.preventDefault();
    const v = input.value;
    if (TEST_MODE && (v === '' || v.trim() === '?')) {
      onSolve(stop, false);
      return;
    }
    if (answerMatches(v, stop)) {
      onSolve(stop, false);
    } else {
      help.textContent = 'Sigue buscando…';
      input.classList.remove('shake');
      void input.offsetWidth;
      input.classList.add('shake');
    }
  });

  document.getElementById('photoInput').addEventListener('change', e => {
    const f = e.target.files && e.target.files[0];
    if (f) onPhoto(f, stop);
    e.target.value = '';
  });

  document.getElementById('giveUpBtn').addEventListener('click', () => {
    if (confirm('¿Revelar la respuesta y avanzar?')) onSolve(stop, true);
  });

  refreshPhotoPreview(stop.id);
}

async function refreshPhotoPreview(stopId) {
  const el = document.getElementById('photoPreview');
  if (!el) return;
  const prev = el.querySelector('img');
  if (prev && prev.src.startsWith('blob:')) URL.revokeObjectURL(prev.src);
  const rec = await loadPhoto(stopId);
  const lbl = document.getElementById('photoBtnLabel');
  if (!rec) {
    el.innerHTML = '';
    if (lbl) lbl.textContent = 'Foto del lugar';
    return;
  }
  const url = URL.createObjectURL(rec.blob);
  el.innerHTML = `<img src="${url}" alt="" />`;
  if (lbl) lbl.textContent = 'Cambiar foto';
}

async function onPhoto(file, stop) {
  try {
    const blob = await downscale(file, 1600, 0.86);
    await savePhoto(stop.id, blob);
    refreshPhotoPreview(stop.id);
  } catch (err) {
    console.error('photo error', err);
    alert('No se pudo guardar la foto. Probá de nuevo.');
  }
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
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
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
  btn.addEventListener('click', () => {
    overlay.remove();
    then();
  });
}

// ---------- finale ----------
async function openFinale() {
  const dlg = document.getElementById('finaleDialog');
  const ids = await listPhotoIds();
  const items = [];
  for (const id of ids) {
    const rec = await loadPhoto(id);
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

  if (typeof dlg.showModal === 'function') {
    dlg.showModal();
  } else {
    dlg.setAttribute('open', '');
  }
  dlg.addEventListener('close', () => photoUrls.forEach(u => URL.revokeObjectURL(u)), { once: true });
}

// ---------- boot ----------
renderMap();
renderClue();
