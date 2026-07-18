/* Flor — petals ARE the level. Read-only: everything derives from the sheet.
   Petal fall = real detachment: the petal leaves its spot on the flower head
   and gravity + a small wind bring it down to rest on the ground. */

const SVG_NS = 'http://www.w3.org/2000/svg';
const scene = document.getElementById('scene');
const PETALS = 10;

const HEAD_X = 200;
const HEAD_Y = 262;
const PETAL_BASE_OFFSET = 18;   /* petal base sits this far above head center */
const GROUND_Y = 552;
const GRAVITY = 300;            /* svg-units / s^2 */
const TERMINAL_VY = 105;        /* leaf-like drag caps the fall speed */

let state = null;
let shownPetals = null;

/* ---------- palette by level ---------- */
const PALETTES = [
  [70, '#fff3e0', '#ffd9c0', '#f2a98e', '#f26d8d', '#d94f72'],
  [40, '#f7e6d8', '#ecc3ae', '#cf8f7c', '#e0668a', '#b84a68'],
  [15, '#e3d3cc', '#c9a89e', '#997269', '#c05f7e', '#94455c'],
  [0,  '#cfc5c2', '#a49691', '#6e5c58', '#9c5a6d', '#6d4250'],
];
function palette(level) {
  for (const p of PALETTES) if (level >= p[0]) return p;
  return PALETTES[PALETTES.length - 1];
}

/* ---------- svg helpers ---------- */
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

el('path', {
  d: 'M200 560 C 206 480, 192 420, 200 330 C 203 300, 200 280, 200 262',
  stroke: 'url(#stemG)', 'stroke-width': 7, fill: 'none', 'stroke-linecap': 'round',
}, sway);
el('path', {
  d: 'M200 470 C 160 462, 138 434, 132 402 C 168 406, 196 430, 202 458 Z',
  fill: '#4c7040', opacity: 0.95,
}, sway);
el('path', {
  d: 'M201 420 C 238 410, 258 384, 262 352 C 228 358, 204 380, 199 406 Z',
  fill: '#557b48', opacity: 0.95,
}, sway);

const head = el('g', { class: 'headGroup', transform: `rotate(0 ${HEAD_X} ${HEAD_Y})` }, sway);
const petalLayer = el('g', {}, head);
const fallLayer = el('g', {}, scene);   /* free petals live outside the sway */

const PETAL_PATH = 'M0 0 C -26 -18, -30 -62, 0 -92 C 30 -62, 26 -18, 0 0 Z';

const petals = [];
for (let i = 0; i < PETALS; i++) {
  const angle = (360 / PETALS) * i;
  const g = el('g', { transform: `rotate(${angle} ${HEAD_X} ${HEAD_Y})` }, petalLayer);
  const p = el('path', {
    d: PETAL_PATH, class: 'petal', fill: 'url(#petalG)',
    stroke: 'rgba(120,30,55,0.25)', 'stroke-width': 1,
    transform: `translate(${HEAD_X} ${HEAD_Y - PETAL_BASE_OFFSET})`,
  }, g);
  petals.push({ g, p, angle, dropped: false, restEl: null });
}

el('circle', { cx: HEAD_X, cy: HEAD_Y, r: 26, fill: 'url(#centerG)' }, head);
for (let i = 0; i < 14; i++) {
  const a = Math.random() * Math.PI * 2;
  const r = Math.random() * 16;
  el('circle', {
    cx: HEAD_X + Math.cos(a) * r, cy: HEAD_Y + Math.sin(a) * r,
    r: 1.4 + Math.random(), fill: 'rgba(130,85,25,0.5)',
  }, head);
}

/* ---------- fall physics ---------- */
/* Where petal i's base sits in scene coordinates (ignoring the +-2deg sway). */
function petalBasePos(i) {
  const rad = (petals[i].angle * Math.PI) / 180;
  return {
    x: HEAD_X + PETAL_BASE_OFFSET * Math.sin(rad),
    y: HEAD_Y - PETAL_BASE_OFFSET * Math.cos(rad),
  };
}

const fliers = [];
let flying = false;

function stepFliers(now) {
  const stillFlying = [];
  for (const f of fliers) {
    const dt = Math.min(0.04, (now - f.last) / 1000);
    f.last = now;
    f.t += dt;

    /* gravity with leaf drag + a small oscillating wind */
    f.vy = Math.min(TERMINAL_VY, f.vy + GRAVITY * dt);
    const wind = 26 * Math.sin(f.t * 1.9 + f.phase) + f.drift;
    f.x += wind * dt + f.vx * dt;
    f.y += f.vy * dt;
    f.vx *= 1 - 0.8 * dt;
    f.rot = f.rot0 + 55 * Math.sin(f.t * 1.6 + f.phase) + f.spin * f.t;

    if (f.y >= f.groundY) {
      /* land and rest */
      f.el.setAttribute('transform',
        `translate(${f.x} ${f.groundY}) rotate(${90 + (Math.random() * 40 - 20)}) scale(0.95)`);
      f.el.setAttribute('opacity', '0.55');
      continue;
    }
    f.el.setAttribute('transform', `translate(${f.x} ${f.y}) rotate(${f.rot})`);
    stillFlying.push(f);
  }
  fliers.length = 0;
  fliers.push(...stillFlying);
  if (fliers.length) requestAnimationFrame(stepFliers);
  else flying = false;
}

function makeFreePetal() {
  return el('path', {
    d: PETAL_PATH, fill: 'url(#petalG)',
    stroke: 'rgba(120,30,55,0.2)', 'stroke-width': 1,
  }, fallLayer);
}

function detachPetal(i, instant) {
  const petal = petals[i];
  if (!petal || petal.dropped) return;
  petal.dropped = true;
  petal.p.classList.add('gone');

  const rest = makeFreePetal();
  petal.restEl = rest;
  const base = petalBasePos(i);

  if (instant) {
    rest.setAttribute('transform',
      `translate(${base.x + (Math.random() * 140 - 70)} ${GROUND_Y + Math.random() * 6}) ` +
      `rotate(${90 + (Math.random() * 60 - 30)}) scale(0.95)`);
    rest.setAttribute('opacity', '0.55');
    return;
  }

  fliers.push({
    el: rest,
    x: base.x, y: base.y,
    vx: Math.random() * 18 - 9,
    vy: -12 - Math.random() * 14,          /* a tiny release "pop" upward */
    rot: petal.angle, rot0: petal.angle,
    spin: Math.random() * 24 - 12,
    phase: Math.random() * Math.PI * 2,
    drift: Math.random() * 14 - 4,          /* the tiny wind leans slightly right */
    groundY: GROUND_Y + Math.random() * 8,
    t: 0, last: performance.now(),
  });
  if (!flying) { flying = true; requestAnimationFrame(stepFliers); }
}

function reattachPetal(i) {
  const petal = petals[i];
  if (!petal || !petal.dropped) return;
  petal.dropped = false;
  petal.p.classList.remove('gone');
  for (let k = fliers.length - 1; k >= 0; k--) {
    if (fliers[k].el === petal.restEl) fliers.splice(k, 1);
  }
  if (petal.restEl) { petal.restEl.remove(); petal.restEl = null; }
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

let dropQueue = 0; /* pending staggered drops */

function apply(instant) {
  const lvl = effective();
  const target = Math.max(0, Math.min(PETALS, Math.ceil(lvl / 10)));

  if (shownPetals === null) shownPetals = target;

  if (target < shownPetals) {
    /* stagger multiple simultaneous losses so they read as individual petals */
    let delay = 0;
    for (let i = shownPetals - 1; i >= target; i--) {
      const idx = i;
      if (instant) detachPetal(idx, true);
      else setTimeout(() => detachPetal(idx, false), delay);
      delay += 420;
    }
  } else if (target > shownPetals) {
    for (let i = 0; i < target; i++) reattachPetal(i);
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

  const droop = lvl >= 30 ? 0 : ((30 - lvl) / 30) * 34;
  document.querySelector('.headGroup').setAttribute('transform', `rotate(${droop} ${HEAD_X} ${HEAD_Y})`);
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
