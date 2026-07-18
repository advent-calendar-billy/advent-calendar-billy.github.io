/* Flor — petals ARE the level. Read-only: everything derives from the sheet. */

const SVG_NS = 'http://www.w3.org/2000/svg';
const scene = document.getElementById('scene');
const PETALS = 10;

let state = null;
let shownPetals = null; /* petals currently attached */

/* ---------- palette by level ---------- */
const PALETTES = [
  /* [minLevel, skyTop, skyMid, skyLow, petal, petalDeep] */
  [70, '#fff3e0', '#ffd9c0', '#f2a98e', '#f26d8d', '#d94f72'],
  [40, '#f7e6d8', '#ecc3ae', '#cf8f7c', '#e0668a', '#b84a68'],
  [15, '#e3d3cc', '#c9a89e', '#997269', '#c05f7e', '#94455c'],
  [0,  '#cfc5c2', '#a49691', '#6e5c58', '#9c5a6d', '#6d4250'],
];
function palette(level) {
  for (const p of PALETTES) if (level >= p[0]) return p;
  return PALETTES[PALETTES.length - 1];
}

/* ---------- build the flower ---------- */
function el(name, attrs, parent) {
  const n = document.createElementNS(SVG_NS, name);
  for (const k in attrs) n.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(n);
  return n;
}

const defs = el('defs', {}, scene);
defs.innerHTML = `
  <linearGradient id="stemG" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#5d8a4a"/><stop offset="1" stop-color="#3f6234"/>
  </linearGradient>
  <radialGradient id="centerG" cx="0.4" cy="0.35" r="0.9">
    <stop offset="0" stop-color="#ffd984"/><stop offset="0.7" stop-color="#e8a83e"/>
    <stop offset="1" stop-color="#b97f2a"/>
  </radialGradient>
  <linearGradient id="petalG" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="var(--petal, #f26d8d)"/>
    <stop offset="1" stop-color="var(--petal-deep, #d94f72)"/>
  </linearGradient>
  <linearGradient id="groundG" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="rgba(70,90,55,0.0)"/><stop offset="1" stop-color="rgba(45,60,36,0.55)"/>
  </linearGradient>`;

el('rect', { x: 0, y: 520, width: 400, height: 80, fill: 'url(#groundG)' }, scene);

const sway = el('g', { class: 'swayGroup' }, scene);

/* stem: gentle S-curve down to the ground */
el('path', {
  d: 'M200 560 C 206 480, 192 420, 200 330 C 203 300, 200 280, 200 262',
  stroke: 'url(#stemG)', 'stroke-width': 7, fill: 'none', 'stroke-linecap': 'round',
}, sway);
/* leaves */
el('path', {
  d: 'M200 470 C 160 462, 138 434, 132 402 C 168 406, 196 430, 202 458 Z',
  fill: '#4c7040', opacity: 0.95,
}, sway);
el('path', {
  d: 'M201 420 C 238 410, 258 384, 262 352 C 228 358, 204 380, 199 406 Z',
  fill: '#557b48', opacity: 0.95,
}, sway);

const head = el('g', { class: 'headGroup', transform: 'rotate(0 200 262)' }, sway);
const petalLayer = el('g', {}, head);
const fallLayer = el('g', {}, scene);   /* falling + resting petals, outside the sway */

const PETAL_PATH =
  'M0 0 C -26 -18, -30 -62, 0 -92 C 30 -62, 26 -18, 0 0 Z';

const petals = [];
for (let i = 0; i < PETALS; i++) {
  const angle = (360 / PETALS) * i;
  const g = el('g', { transform: `rotate(${angle} 200 262)` }, petalLayer);
  const p = el('path', {
    d: PETAL_PATH, class: 'petal', fill: 'url(#petalG)',
    stroke: 'rgba(120,30,55,0.25)', 'stroke-width': 1,
    transform: 'translate(200 244)',
  }, g);
  petals.push({ g, p, angle });
}

el('circle', { cx: 200, cy: 262, r: 26, fill: 'url(#centerG)' }, head);
for (let i = 0; i < 14; i++) {
  const a = Math.random() * Math.PI * 2;
  const r = Math.random() * 16;
  el('circle', {
    cx: 200 + Math.cos(a) * r, cy: 262 + Math.sin(a) * r,
    r: 1.4 + Math.random(), fill: 'rgba(130,85,25,0.5)',
  }, head);
}

/* ---------- petal fall ---------- */
function dropPetal(i, instant) {
  const petal = petals[i];
  if (!petal || petal.dropped) return;
  petal.dropped = true;

  const rect = petal.p.getBoundingClientRect();
  const sceneRect = scene.getBoundingClientRect();
  const scale = 600 / sceneRect.height;
  const x = (rect.left + rect.width / 2 - sceneRect.left) * scale;
  const y = (rect.top + rect.height / 2 - sceneRect.top) * scale;

  petal.p.classList.add('gone');

  const rest = el('path', {
    d: PETAL_PATH, fill: 'url(#petalG)', opacity: 0.85,
    stroke: 'rgba(120,30,55,0.2)', 'stroke-width': 1,
  }, fallLayer);

  const restX = x + (Math.random() * 120 - 60);
  const restRot = Math.random() * 300 - 150;

  if (instant) {
    rest.setAttribute('transform', `translate(${restX} ${556 - Math.random() * 10}) rotate(${restRot}) scale(0.9)`);
    rest.setAttribute('opacity', 0.55);
    return;
  }

  const wrap = el('g', { transform: `translate(${x} ${y}) rotate(${petal.angle})` }, fallLayer);
  wrap.appendChild(rest);
  rest.setAttribute('transform', 'translate(0 46)'); /* pivot near petal base */
  wrap.style.setProperty('--dx1', (Math.random() * 60 - 30) + 'px');
  wrap.style.setProperty('--dx2', (Math.random() * 80 - 40) + 'px');
  wrap.style.setProperty('--dx3', (restX - x) + 'px');
  wrap.style.setProperty('--r1', (Math.random() * 80 - 40) + 'deg');
  wrap.style.setProperty('--r2', (Math.random() * 120 - 60) + 'deg');
  wrap.style.setProperty('--r3', restRot + 'deg');
  wrap.style.setProperty('--fall-s', (4.5 + Math.random() * 2.5) + 's');
  wrap.style.setProperty('--floor', (556 - y) + 'px');
  wrap.classList.add('falling');
  wrap.addEventListener('animationend', () => { rest.setAttribute('opacity', 0.55); });
}

/* ---------- level → scene ---------- */
function num(v, fb) { const n = parseFloat(v); return Number.isFinite(n) ? n : fb; }

function effective(now = Date.now()) {
  if (!state) return 100;
  const level = num(state.happiness_level, 100);
  const rate = num(state.happiness_rate, 2);
  const anchor = num(state.happiness_anchor_ts, now);
  const mode = state.happiness_mode || 'paused';
  if (mode === 'flatline') return 0;
  if (mode === 'paused') return Math.max(0, Math.min(100, level));
  const eff = level - (rate * (now - anchor)) / 60000;
  if (mode === 'hold_critical') return Math.max(8, Math.min(100, eff));
  return Math.max(0, Math.min(100, eff));
}

function apply(instant) {
  const lvl = effective();
  const target = Math.max(0, Math.min(PETALS, Math.ceil(lvl / 10)));

  if (shownPetals === null) shownPetals = target;

  /* drop petals down to target (recovering level does NOT re-attach petals mid-scene;
     a full re-sync happens only when the console raises level and we have fewer dropped) */
  for (let i = PETALS - 1; i >= target; i--) dropPetal(i, instant);
  if (target > shownPetals) {
    /* kiss recovered energy: re-attach from the top */
    for (let i = 0; i < target; i++) {
      const petal = petals[i];
      if (petal.dropped) { petal.dropped = false; petal.p.classList.remove('gone'); }
    }
  }
  shownPetals = target;

  const pal = palette(lvl);
  const root = document.documentElement.style;
  root.setProperty('--sky-top', pal[1]);
  root.setProperty('--sky-mid', pal[2]);
  root.setProperty('--sky-low', pal[3]);
  root.setProperty('--petal', pal[4]);
  root.setProperty('--petal-deep', pal[5]);
  root.setProperty('--sat', String(0.35 + (lvl / 100) * 0.65));
  root.setProperty('--bri', String(0.72 + (lvl / 100) * 0.28));
  root.setProperty('--vignette', String(0.12 + (1 - lvl / 100) * 0.5));
  root.setProperty('--sway-s', (5 + (100 - lvl) / 12) + 's');

  /* droop below 30 */
  const droop = lvl >= 30 ? 0 : ((30 - lvl) / 30) * 34;
  document.querySelector('.headGroup').setAttribute('transform', `rotate(${droop} 200 262)`);
  document.body.classList.toggle('critical', lvl > 0 && lvl <= 12);
}

/* ---------- boot ---------- */
(async () => {
  try {
    await ES.init();
    let first = true;
    ES.poll(ESC_CONFIG.POLL_MS, async () => {
      state = await ES.readState();
      apply(first);
      first = false;
    });
    setInterval(() => { if (state) apply(false); }, 1000);
  } catch (e) {
    console.error('flor sin conexión', e);
  }
})();
