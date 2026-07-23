/* Buscaminas — full classic rules: first click always safe, flood reveal,
   flag/question cycle on right click, chord on double click, LED counters,
   smiley states. Runs standalone or inside the escritorio (it announces its
   size to the parent via postMessage). */

const DIFFS = {
  principiante: { r: 9, c: 9, m: 10 },
  intermedio:   { r: 16, c: 16, m: 40 },
  experto:      { r: 16, c: 30, m: 99 },
};
let diffName = 'principiante';

const board = document.getElementById('board');
const face = document.getElementById('face');
const ledMines = document.getElementById('ledMines');
const ledTime = document.getElementById('ledTime');

const FACES = {
  ok: '<svg viewBox="0 0 26 26"><circle cx="13" cy="13" r="10.5" fill="#ffd800" stroke="#000"/><circle cx="9.5" cy="10.5" r="1.5" fill="#000"/><circle cx="16.5" cy="10.5" r="1.5" fill="#000"/><path d="M8.5 16 Q13 20 17.5 16" fill="none" stroke="#000" stroke-width="1.4"/></svg>',
  oh: '<svg viewBox="0 0 26 26"><circle cx="13" cy="13" r="10.5" fill="#ffd800" stroke="#000"/><circle cx="9.5" cy="10" r="1.5" fill="#000"/><circle cx="16.5" cy="10" r="1.5" fill="#000"/><circle cx="13" cy="16.5" r="2.6" fill="none" stroke="#000" stroke-width="1.3"/></svg>',
  dead: '<svg viewBox="0 0 26 26"><circle cx="13" cy="13" r="10.5" fill="#ffd800" stroke="#000"/><path d="M7.5 8.5 L11.5 12.5 M11.5 8.5 L7.5 12.5 M14.5 8.5 L18.5 12.5 M18.5 8.5 L14.5 12.5" stroke="#000" stroke-width="1.3"/><path d="M8.5 18.5 Q13 14.5 17.5 18.5" fill="none" stroke="#000" stroke-width="1.4"/></svg>',
  cool: '<svg viewBox="0 0 26 26"><circle cx="13" cy="13" r="10.5" fill="#ffd800" stroke="#000"/><path d="M5.5 9 H20.5 L19 13 Q17.5 14.5 15.5 13 L14.5 10.5 H11.5 L10.5 13 Q8.5 14.5 7 13 Z" fill="#000"/><path d="M9 18 Q13 21 17 18" fill="none" stroke="#000" stroke-width="1.4"/></svg>',
};
const FLAG_SVG =
  '<svg viewBox="0 0 16 16"><path d="M9 2 L9 12 M9 2 L4 4.5 L9 7" fill="#f00" stroke="#f00" stroke-width="1.6"/><path d="M5 13 H13 M7 12 H11" stroke="#000" stroke-width="1.6"/></svg>';
const MINE_SVG =
  '<svg viewBox="0 0 16 16"><path d="M8 2 V14 M2 8 H14 M4 4 L12 12 M12 4 L4 12" stroke="#000" stroke-width="1.4"/><circle cx="8" cy="8" r="3.6" fill="#000"/><rect x="6.4" y="6.4" width="1.6" height="1.6" fill="#fff"/></svg>';
const MINE_X_SVG =
  '<svg viewBox="0 0 16 16"><path d="M8 2 V14 M2 8 H14 M4 4 L12 12 M12 4 L4 12" stroke="#000" stroke-width="1.4"/><circle cx="8" cy="8" r="3.6" fill="#000"/><path d="M2.5 2.5 L13.5 13.5 M13.5 2.5 L2.5 13.5" stroke="#f00" stroke-width="1.8"/></svg>';

let R, C, M;
let cells;          /* [{mine, open, mark(0 none|1 flag|2 ?), el, n}] */
let placed, dead, won, openCount, flagCount;
let t0 = null, timerId = null, secs = 0;

const idx = (r, c) => r * C + c;
function neighbors(i) {
  const r = Math.floor(i / C), c = i % C, out = [];
  for (let dr = -1; dr <= 1; dr++)
    for (let dc = -1; dc <= 1; dc++) {
      if (!dr && !dc) continue;
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < R && nc >= 0 && nc < C) out.push(idx(nr, nc));
    }
  return out;
}

function led(el, v) {
  const neg = v < 0;
  const s = String(Math.min(999, Math.abs(v))).padStart(neg ? 2 : 3, '0');
  el.textContent = (neg ? '-' : '') + s;
}

function setFace(kind) { face.innerHTML = FACES[kind]; }

function stopTimer() { clearInterval(timerId); timerId = null; }
function startTimer() {
  t0 = Date.now();
  timerId = setInterval(() => {
    secs = Math.min(999, Math.floor((Date.now() - t0) / 1000));
    led(ledTime, secs);
  }, 250);
}

function newGame() {
  ({ r: R, c: C, m: M } = DIFFS[diffName]);
  placed = false; dead = false; won = false;
  openCount = 0; flagCount = 0; secs = 0;
  stopTimer();
  led(ledMines, M);
  led(ledTime, 0);
  setFace('ok');

  cells = [];
  board.innerHTML = '';
  board.style.gridTemplateColumns = `repeat(${C}, 16px)`;
  for (let i = 0; i < R * C; i++) {
    const el = document.createElement('div');
    el.className = 'cell';
    el.dataset.i = i;
    board.appendChild(el);
    cells.push({ mine: false, open: false, mark: 0, n: 0, el });
  }
  postSize();
}

function placeMines(safeI) {
  const pool = [];
  for (let i = 0; i < R * C; i++) if (i !== safeI) pool.push(i);
  for (let k = 0; k < M; k++) {
    const j = k + Math.floor(Math.random() * (pool.length - k));
    [pool[k], pool[j]] = [pool[j], pool[k]];
    cells[pool[k]].mine = true;
  }
  for (let i = 0; i < R * C; i++)
    cells[i].n = neighbors(i).filter((j) => cells[j].mine).length;
  placed = true;
  startTimer();
}

function reveal(i) {
  const c = cells[i];
  if (c.open || c.mark === 1 || dead || won) return;
  if (!placed) placeMines(i);
  c.open = true;
  c.mark = 0;
  openCount++;
  c.el.classList.add('open');
  c.el.classList.remove('q');
  c.el.innerHTML = '';

  if (c.mine) return lose(i);
  if (c.n) {
    c.el.textContent = c.n;
    c.el.classList.add('n' + c.n);
  } else {
    neighbors(i).forEach(reveal);
  }
  checkWin();
}

function chord(i) {
  const c = cells[i];
  if (!c.open || !c.n) return;
  const around = neighbors(i);
  const flags = around.filter((j) => cells[j].mark === 1).length;
  if (flags !== c.n) return;
  around.forEach((j) => { if (!cells[j].open && cells[j].mark !== 1) reveal(j); });
}

function lose(boomI) {
  dead = true;
  stopTimer();
  setFace('dead');
  cells.forEach((c, i) => {
    if (c.mine && c.mark !== 1) {
      c.el.classList.add('open');
      c.el.innerHTML = MINE_SVG;
    }
    if (!c.mine && c.mark === 1) {
      c.el.classList.add('open');
      c.el.innerHTML = MINE_X_SVG;
    }
  });
  cells[boomI].el.classList.add('boom');
  cells[boomI].el.innerHTML = MINE_SVG;
}

function checkWin() {
  if (dead || won || openCount !== R * C - M) return;
  won = true;
  stopTimer();
  setFace('cool');
  cells.forEach((c) => {
    if (c.mine && c.mark !== 1) { c.mark = 1; c.el.innerHTML = FLAG_SVG; }
  });
  led(ledMines, 0);
}

/* ---------- input ---------- */
board.addEventListener('contextmenu', (e) => e.preventDefault());

board.addEventListener('pointerdown', (e) => {
  if (dead || won) return;
  if (e.button === 0 && e.target.classList.contains('cell') && !e.target.classList.contains('open')) {
    setFace('oh');
  }
});
addEventListener('pointerup', () => { if (!dead && !won) setFace('ok'); });

board.addEventListener('click', (e) => {
  const t = e.target.closest('.cell');
  if (!t) return;
  reveal(+t.dataset.i);
});

board.addEventListener('dblclick', (e) => {
  const t = e.target.closest('.cell');
  if (!t) return;
  chord(+t.dataset.i);
});

board.addEventListener('mousedown', (e) => {
  if (e.button !== 2) return;
  const t = e.target.closest('.cell');
  if (!t || dead || won) return;
  const c = cells[+t.dataset.i];
  if (c.open) return;
  c.mark = (c.mark + 1) % 3;
  if (c.mark === 1) { c.el.innerHTML = FLAG_SVG; flagCount++; }
  else if (c.mark === 2) { c.el.innerHTML = ''; c.el.textContent = '?'; c.el.classList.add('q'); flagCount--; }
  else { c.el.textContent = ''; c.el.classList.remove('q'); }
  led(ledMines, M - flagCount);
});

face.addEventListener('click', newGame);
addEventListener('keydown', (e) => { if (e.key === 'F2') { e.preventDefault(); newGame(); } });

/* ---------- menus ---------- */
function bindMenu(topId, dropId) {
  const top = document.getElementById(topId);
  const drop = document.getElementById(dropId);
  top.addEventListener('click', (e) => {
    e.stopPropagation();
    const wasHidden = drop.hidden;
    closeMenus();
    if (wasHidden) {
      drop.hidden = false;
      top.classList.add('open');
      const r = top.getBoundingClientRect();
      drop.style.left = r.left + 'px';
      drop.style.top = r.bottom + 'px';
    }
  });
}
function closeMenus() {
  document.querySelectorAll('.drop').forEach((d) => { d.hidden = true; });
  document.querySelectorAll('.menuTop').forEach((t) => t.classList.remove('open'));
}
bindMenu('menuJuego', 'menuJuegoDrop');
bindMenu('menuAyuda', 'menuAyudaDrop');
document.addEventListener('click', closeMenus);

document.getElementById('menuJuegoDrop').addEventListener('click', (e) => {
  const it = e.target.closest('.dItem');
  if (!it || it.classList.contains('disabled')) return;
  if (it.dataset.act === 'nuevo') newGame();
  if (it.dataset.diff) { diffName = it.dataset.diff; syncChecks(); newGame(); }
});
function syncChecks() {
  document.querySelectorAll('#menuJuegoDrop .dItem[data-diff]').forEach((it) => {
    it.classList.toggle('checked', it.dataset.diff === diffName);
  });
}
syncChecks();

/* ---------- tell the escritorio our size ---------- */
function postSize() {
  const app = document.getElementById('app');
  requestAnimationFrame(() => {
    try {
      parent.postMessage({ type: 'esc-resize', w: app.offsetWidth, h: app.offsetHeight }, '*');
    } catch (_) {}
  });
}

newGame();
