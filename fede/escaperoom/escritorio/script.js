/* Escritorio Win2000 — Fede's launcher. Icons open each game page inside a
   maximized IE-style window; switching happens via icons/taskbar, with a bit
   of era-appropriate friction (double click, hourglass, fake page load).

   APPS is the only thing to edit: labels and fake URLs are PLACEHOLDER
   (Billy owns naming); removing an app = deleting one line. */

const APPS = [
  { id: 'banco',     label: 'Chase',                   icon: 'chase',
    url: '../10fa/',      fakeUrl: 'https://www.chase.com/seguridad/verificacion.asp' },
  { id: 'cctv',      label: 'Monitoreo del edificio',  icon: 'cam',
    url: '../cctv/',      fakeUrl: 'http://192.168.0.107/cam07/live.htm' },
  { id: 'cartelera', label: 'Cartelera del consorcio', icon: 'board',
    url: '../board/',     fakeUrl: 'http://www.consorcioenlinea.com.ar/cartelera/index.php?ed=1247' },
  { id: 'grindr',    label: 'Grindr Web',              icon: 'grindr',
    url: '../grindr/',    fakeUrl: 'https://web.grindr.com/chat' },
  { id: 'felicidad', label: 'Compañero de Felicidad',  icon: 'flower',
    url: '../happiness/', fakeUrl: 'http://localhost:8420/companero' },
  { id: 'youtube',   label: 'YouTube',                 icon: 'youtube',
    url: '../youtube/',   fakeUrl: 'http://www.youtube.com/watch?v=4o645IYFQDU' },
  { id: 'buscaminas', label: 'Buscaminas',             icon: 'mine',
    url: '../buscaminas/', program: true, w: 190, h: 276 },
];

/* Decorative, locked system icons (removable: empty the array). */
const SYSTEM_ICONS = [
  { id: 'mipc',     label: 'Mi PC',                  icon: 'mypc' },
  { id: 'papelera', label: 'Papelera de reciclaje',  icon: 'trash' },
];

const LOCKED_MSG = 'Esta operación se canceló debido a restricciones vigentes en este equipo. ' +
                   'Póngase en contacto con el administrador del sistema.';

/* ---------- pixel-ish icon art ---------- */
const ICONS = {
  bank: '<svg viewBox="0 0 32 32"><rect x="3" y="26" width="26" height="4" fill="#808080"/><rect x="3" y="25" width="26" height="2" fill="#d4d0c8"/><rect x="5" y="13" width="3" height="12" fill="#efede7"/><rect x="10" y="13" width="3" height="12" fill="#d4d0c8"/><rect x="15" y="13" width="3" height="12" fill="#efede7"/><rect x="20" y="13" width="3" height="12" fill="#d4d0c8"/><rect x="25" y="13" width="3" height="12" fill="#efede7"/><path d="M2 12 L16 3 L30 12 Z" fill="#d4d0c8" stroke="#404040" stroke-width="1"/><rect x="2" y="11" width="28" height="2" fill="#808080"/><circle cx="16" cy="8" r="2" fill="#c8a814"/></svg>',
  cam: '<svg viewBox="0 0 32 32"><rect x="2" y="4" width="24" height="18" rx="1" fill="#d4d0c8" stroke="#404040"/><rect x="4" y="6" width="20" height="13" fill="#10281c"/><rect x="5" y="7" width="18" height="11" fill="#183c2a"/><circle cx="14" cy="12" r="3.4" fill="#0a1a12" stroke="#2e6e4e"/><circle cx="13" cy="11" r="1" fill="#67b78f"/><rect x="21" y="7" width="2" height="2" fill="#e04040"/><rect x="10" y="22" width="8" height="3" fill="#808080"/><rect x="6" y="25" width="16" height="3" fill="#d4d0c8" stroke="#404040"/><rect x="27" y="9" width="3" height="8" fill="#808080"/></svg>',
  board: '<svg viewBox="0 0 32 32"><rect x="2" y="3" width="28" height="24" fill="#a97c50" stroke="#5c3a1e"/><rect x="4" y="5" width="24" height="20" fill="#c89966" stroke="#8a6238"/><rect x="6" y="7" width="9" height="7" fill="#fff" stroke="#808080"/><rect x="17" y="8" width="8" height="10" fill="#f6efc2" stroke="#b0a468"/><rect x="7" y="16" width="8" height="7" fill="#dfe8f6" stroke="#8090b0"/><circle cx="10" cy="7.5" r="1.2" fill="#d43c3c"/><circle cx="21" cy="8.5" r="1.2" fill="#3c66d4"/><circle cx="11" cy="16.5" r="1.2" fill="#2f9e50"/></svg>',
  grindr: '<svg viewBox="0 0 32 32"><rect x="3" y="3" width="26" height="26" rx="6" fill="#101010"/><g fill="none" stroke="#fcd51d" stroke-width="1.9" stroke-linecap="round"><path d="M16 6.4 C 10.6 6.4 7.2 9.6 7.2 14.2 C 7.2 20.4 11 25.6 16 25.6 C 21 25.6 24.8 20.4 24.8 14.2 C 24.8 9.6 21.4 6.4 16 6.4 Z"/><circle cx="12.1" cy="14.4" r="3.1"/><circle cx="19.9" cy="14.4" r="3.1"/><path d="M16 17.8 V 21.6"/></g></svg>',
  chase: '<svg viewBox="0 0 32 32"><path d="M10 2 H22 L30 10 V22 L22 30 H10 L2 22 V10 Z" fill="#0f5397"/><rect x="11.5" y="11.5" width="9" height="9" fill="#fff"/><path d="M26 6 L20.5 11.5 M26 26 L20.5 20.5 M6 26 L11.5 20.5 M6 6 L11.5 11.5" stroke="#fff" stroke-width="2"/></svg>',
  youtube: '<svg viewBox="0 0 32 32"><rect x="2" y="6" width="28" height="20" rx="3" fill="#e8e8e8" stroke="#808080"/><rect x="5" y="9" width="22" height="14" rx="2" fill="#c4302b"/><path d="M14 12 L21 16 L14 20 Z" fill="#fff"/></svg>',
  mine: '<svg viewBox="0 0 32 32"><rect x="2" y="2" width="28" height="28" fill="#d4d0c8"/><path d="M2 2 H30 V4 H4 V30 H2 Z" fill="#fff"/><path d="M30 2 V30 H2 V28 H28 V2 Z" fill="#808080"/><path d="M16 5.5 V26.5 M5.5 16 H26.5 M9 9 L23 23 M23 9 L9 23" stroke="#000" stroke-width="2"/><circle cx="16" cy="16" r="7" fill="#000"/><rect x="12.8" y="12.8" width="3" height="3" fill="#fff"/></svg>',
  flower: '<svg viewBox="0 0 32 32"><rect x="15" y="16" width="2" height="10" fill="#2f7e3e"/><path d="M16 22 C12 22 10 24 9 26 C12 26 14 25 16 23 Z" fill="#3f9e50"/><circle cx="16" cy="10" r="3" fill="#e8b400"/><ellipse cx="16" cy="4.5" rx="2.4" ry="3" fill="#e06090"/><ellipse cx="16" cy="15.5" rx="2.4" ry="3" fill="#e06090"/><ellipse cx="10.5" cy="10" rx="3" ry="2.4" fill="#e06090"/><ellipse cx="21.5" cy="10" rx="3" ry="2.4" fill="#e06090"/><ellipse cx="12" cy="6" rx="2.4" ry="2.2" fill="#ee82ac" transform="rotate(-45 12 6)"/><ellipse cx="20" cy="6" rx="2.4" ry="2.2" fill="#ee82ac" transform="rotate(45 20 6)"/><ellipse cx="12" cy="14" rx="2.4" ry="2.2" fill="#ee82ac" transform="rotate(45 12 14)"/><ellipse cx="20" cy="14" rx="2.4" ry="2.2" fill="#ee82ac" transform="rotate(-45 20 14)"/></svg>',
  mypc: '<svg viewBox="0 0 32 32"><rect x="3" y="4" width="18" height="14" fill="#d4d0c8" stroke="#404040"/><rect x="5" y="6" width="14" height="10" fill="#2a5a8a"/><rect x="6" y="7" width="12" height="8" fill="#3a6ea5"/><rect x="9" y="18" width="6" height="2" fill="#808080"/><rect x="6" y="20" width="12" height="2" fill="#d4d0c8" stroke="#404040"/><rect x="22" y="8" width="8" height="20" fill="#d4d0c8" stroke="#404040"/><rect x="24" y="10" width="4" height="1.6" fill="#808080"/><rect x="24" y="13" width="4" height="1.6" fill="#808080"/><circle cx="26" cy="24" r="1.2" fill="#2f7e3e"/></svg>',
  trash: '<svg viewBox="0 0 32 32"><path d="M8 10 L24 10 L22 29 L10 29 Z" fill="none" stroke="#607080" stroke-width="1.4"/><path d="M9.5 12 L22.5 12 M9.8 15 L22.2 15 M10.1 18 L21.9 18 M10.4 21 L21.6 21 M10.7 24 L21.3 24 M11 27 L21 27" stroke="#8fa0b0" stroke-width="1"/><path d="M11 10 L13 29 M16 10 L16 29 M21 10 L19 29" stroke="#8fa0b0" stroke-width="1"/><ellipse cx="16" cy="9.5" rx="8.5" ry="2.6" fill="#d4d0c8" stroke="#607080"/></svg>',
  ie: '<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="11" fill="none" stroke="#1f66c0" stroke-width="3.2"/><circle cx="16" cy="16" r="5" fill="#37a1de"/><path d="M4 21 C10 26 24 26 30 13 L28 10 C24 21 12 23 5 18 Z" fill="#f4c518"/></svg>',
  page: '<svg viewBox="0 0 16 16"><rect x="2.5" y="1.5" width="9" height="13" fill="#fff" stroke="#607080"/><path d="M11.5 1.5 L13.5 3.5 L11.5 3.5 Z" fill="#c0ccd8" stroke="#607080"/><path d="M4.5 5 H10 M4.5 7 H10 M4.5 9 H10 M4.5 11 H8" stroke="#8fa0b0"/></svg>',
  globe: '<svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="6.4" fill="#bfe0f2" stroke="#1f66c0"/><path d="M8 1.6 V14.4 M1.6 8 H14.4 M3 4.2 C6 6 10 6 13 4.2 M3 11.8 C6 10 10 10 13 11.8" fill="none" stroke="#1f66c0" stroke-width="0.9"/></svg>',
  arrow: '<svg viewBox="0 0 8 8"><path d="M1 7 L1 3 C1 1.6 2 1 3.2 1 L5 1 L5 0 L7.4 1.9 L5 3.8 L5 2.8 L3.4 2.8 C2.7 2.8 2.4 3.2 2.4 3.9 L2.4 7 Z" fill="#000"/></svg>',
};

const iconsHost = document.getElementById('icons');
const winHost = document.getElementById('windows');
const taskHost = document.getElementById('taskButtons');
const startMenu = document.getElementById('startMenu');
const startBtn = document.getElementById('startBtn');

const wins = {};          /* id -> { el, taskBtn } */
let opening = false;

/* ---------- dialog ---------- */
function showDialog(title, text) {
  document.getElementById('dlgTitleText').textContent = title;
  document.getElementById('dlgText').textContent = text;
  document.getElementById('dlgShade').hidden = false;
}
document.getElementById('dlgOk').addEventListener('click', () => { document.getElementById('dlgShade').hidden = true; });
document.getElementById('dlgClose').addEventListener('click', () => { document.getElementById('dlgShade').hidden = true; });

/* ---------- desktop icons ---------- */
function makeIcon(app, locked) {
  const d = document.createElement('div');
  d.className = 'dIcon';
  d.tabIndex = 0;

  const art = document.createElement('div');
  art.className = 'art';
  art.innerHTML = ICONS[app.icon] || ICONS.page;
  if (!locked) {
    const lnk = document.createElement('span');
    lnk.className = 'lnk';
    lnk.innerHTML = ICONS.arrow;
    art.appendChild(lnk);
  }

  const cap = document.createElement('div');
  cap.className = 'cap';
  cap.textContent = app.label;

  d.append(art, cap);
  d.addEventListener('click', () => {
    document.querySelectorAll('.dIcon.sel').forEach((n) => n.classList.remove('sel'));
    d.classList.add('sel');
  });
  d.addEventListener('dblclick', () => {
    if (locked) showDialog('Restricciones', LOCKED_MSG);
    else openApp(app.id);
  });
  iconsHost.appendChild(d);
}
SYSTEM_ICONS.forEach((a) => makeIcon(a, true));
APPS.forEach((a) => makeIcon(a, false));

document.getElementById('desktop').addEventListener('click', (e) => {
  if (e.target.id === 'desktop' || e.target.id === 'icons') {
    document.querySelectorAll('.dIcon.sel').forEach((n) => n.classList.remove('sel'));
  }
});

/* ---------- program window (title bar only, centered, draggable) ---------- */
function buildProgramWindow(app) {
  const w = document.createElement('div');
  w.className = 'win raised program';
  w.dataset.app = app.id;

  const title = document.createElement('div');
  title.className = 'titleBar';
  title.innerHTML =
    '<span class="tIcon">' + (ICONS[app.icon] || ICONS.page) + '</span>' +
    '<span class="tText">' + app.label + '</span>';
  const btnMin = tbtn('<svg viewBox="0 0 10 10"><rect x="1" y="7" width="7" height="2" fill="currentColor"/></svg>', 'Minimizar');
  const btnClose = tbtn('<svg viewBox="0 0 10 10"><path d="M1.5 1.5 L8.5 8.5 M8.5 1.5 L1.5 8.5" stroke="currentColor" stroke-width="1.6"/></svg>', 'Cerrar');
  title.append(btnMin, btnClose);

  const body = document.createElement('div');
  body.className = 'winBody';
  const iframe = document.createElement('iframe');
  iframe.src = app.url;
  body.appendChild(iframe);

  const setSize = (cw, ch) => {
    w.style.width = cw + 12 + 'px';
    w.style.height = ch + 22 + 14 + 'px';
  };
  setSize(app.w || 200, app.h || 280);
  w.style.left = 'max(10px, calc(50% - ' + Math.round((app.w || 200) / 2) + 'px))';
  w.style.top = '90px';
  w._setSize = setSize;
  w._iframe = iframe;

  /* drag by the title bar */
  title.addEventListener('pointerdown', (e) => {
    if (e.target.closest('.tbtn')) return;
    const r = w.getBoundingClientRect();
    const dx = e.clientX - r.left;
    const dy = e.clientY - r.top;
    const move = (ev) => {
      w.style.left = Math.max(-r.width + 60, Math.min(innerWidth - 60, ev.clientX - dx)) + 'px';
      w.style.top = Math.max(0, Math.min(innerHeight - 60, ev.clientY - dy)) + 'px';
    };
    const up = () => {
      removeEventListener('pointermove', move);
      removeEventListener('pointerup', up);
    };
    addEventListener('pointermove', move);
    addEventListener('pointerup', up);
  });

  btnMin.addEventListener('click', () => minimizeApp(app.id));
  btnClose.addEventListener('click', () => closeApp(app.id));
  w.addEventListener('pointerdown', () => focusApp(app.id));

  w.append(title, body);
  return w;
}

/* a program page can announce its content size: {type:'esc-resize', w, h} */
addEventListener('message', (e) => {
  if (!e.data || e.data.type !== 'esc-resize') return;
  Object.values(wins).forEach((x) => {
    if (x.el._iframe && x.el._iframe.contentWindow === e.source && x.el._setSize) {
      x.el._setSize(e.data.w, e.data.h);
    }
  });
});

/* ---------- IE window ---------- */
function buildWindow(app) {
  if (app.program) return buildProgramWindow(app);
  const w = document.createElement('div');
  w.className = 'win raised';
  w.dataset.app = app.id;

  const title = document.createElement('div');
  title.className = 'titleBar';
  title.innerHTML =
    '<span class="tIcon">' + ICONS.ie + '</span>' +
    '<span class="tText">' + app.label + ' - Microsoft Internet Explorer</span>';
  const btnMin = tbtn('<svg viewBox="0 0 10 10"><rect x="1" y="7" width="7" height="2" fill="currentColor"/></svg>', 'Minimizar');
  const btnMax = tbtn('<svg viewBox="0 0 10 10"><rect x="1" y="1" width="8" height="8" fill="none" stroke="currentColor" stroke-width="1.4"/><rect x="1" y="1" width="8" height="2.2" fill="currentColor"/></svg>', 'Maximizar');
  btnMax.disabled = true;
  const btnClose = tbtn('<svg viewBox="0 0 10 10"><path d="M1.5 1.5 L8.5 8.5 M8.5 1.5 L1.5 8.5" stroke="currentColor" stroke-width="1.6"/></svg>', 'Cerrar');
  title.append(btnMin, btnMax, btnClose);

  const menu = document.createElement('div');
  menu.className = 'menuBar';
  ['Archivo', 'Edición', 'Ver', 'Favoritos', 'Herramientas', 'Ayuda'].forEach((m) => {
    const s = document.createElement('span');
    s.textContent = m;
    menu.appendChild(s);
  });

  const tools = document.createElement('div');
  tools.className = 'toolBar';
  const back = toolBtn('Atrás', '<svg viewBox="0 0 20 20"><path d="M12 4 L5 10 L12 16" fill="none" stroke="#2f7e3e" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>');
  back.disabled = true;
  const fwd = toolBtn('Adelante', '<svg viewBox="0 0 20 20"><path d="M8 4 L15 10 L8 16" fill="none" stroke="#2f7e3e" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>');
  fwd.disabled = true;
  const stop = toolBtn('Detener', '<svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="7.4" fill="#d43c3c"/><path d="M6.5 6.5 L13.5 13.5 M13.5 6.5 L6.5 13.5" stroke="#fff" stroke-width="1.8"/></svg>');
  const refresh = toolBtn('Actualizar', '<svg viewBox="0 0 20 20"><path d="M15.5 8 A6 6 0 1 0 16 11.5" fill="none" stroke="#2f7e3e" stroke-width="2.2"/><path d="M16.5 4 L16 8.6 L11.5 8" fill="none" stroke="#2f7e3e" stroke-width="2.2" stroke-linejoin="round"/></svg>');
  tools.append(back, fwd, div(), stop, refresh);

  const addr = document.createElement('div');
  addr.className = 'addrBar';
  addr.innerHTML =
    '<label>Dirección</label>' +
    '<span class="addr"><span class="pgIco">' + ICONS.page + '</span><span class="url">' + app.fakeUrl + '</span></span>';

  const body = document.createElement('div');
  body.className = 'winBody';
  const iframe = document.createElement('iframe');
  iframe.src = app.url;
  body.appendChild(iframe);

  const status = document.createElement('div');
  status.className = 'statusBar';
  const stText = document.createElement('div');
  stText.className = 'cell grow';
  stText.textContent = 'Abriendo página ' + app.fakeUrl + '...';
  const stZone = document.createElement('div');
  stZone.className = 'cell';
  stZone.innerHTML = ICONS.globe + '<span>Internet</span>';
  status.append(stText, stZone);

  iframe.addEventListener('load', () => { stText.textContent = 'Listo'; });
  refresh.addEventListener('click', () => {
    stText.textContent = 'Abriendo página ' + app.fakeUrl + '...';
    iframe.src = app.url;
  });
  stop.addEventListener('click', () => { stText.textContent = 'Listo'; });
  btnMin.addEventListener('click', () => minimizeApp(app.id));
  btnClose.addEventListener('click', () => closeApp(app.id));
  w.addEventListener('pointerdown', () => focusApp(app.id));

  w.append(title, menu, tools, addr, body, status);
  return w;
}

function tbtn(svg, label) {
  const b = document.createElement('button');
  b.className = 'tbtn';
  b.type = 'button';
  b.title = label;
  b.setAttribute('aria-label', label);
  b.innerHTML = svg;
  return b;
}
function toolBtn(label, svg) {
  const b = document.createElement('button');
  b.type = 'button';
  b.innerHTML = svg + '<span>' + label + '</span>';
  return b;
}
function div() {
  const d = document.createElement('div');
  d.className = 'tbDiv';
  return d;
}

/* ---------- open / focus / minimize / close ---------- */
function openApp(id) {
  if (opening) return;
  const app = APPS.find((a) => a.id === id);
  if (!app) return;

  if (wins[id]) { focusApp(id); return; }

  /* era-appropriate friction: hourglass, then the window appears */
  opening = true;
  document.body.classList.add('busy');
  setTimeout(() => {
    document.body.classList.remove('busy');
    opening = false;

    const el = buildWindow(app);
    winHost.appendChild(el);

    const tb = document.createElement('button');
    tb.className = 'taskBtn';
    tb.type = 'button';
    tb.innerHTML = (app.program ? ICONS[app.icon] : ICONS.ie) + '<span>' + app.label + '</span>';
    tb.addEventListener('click', () => {
      if (wins[id] && !wins[id].el.hidden && wins[id].el === topWin()) minimizeApp(id);
      else focusApp(id);
    });
    taskHost.appendChild(tb);

    wins[id] = { el, taskBtn: tb };
    focusApp(id);
  }, 650);
}

function topWin() {
  let best = null;
  Object.values(wins).forEach((w) => {
    if (w.el.hidden) return;
    if (!best || +w.el.style.zIndex > +best.style.zIndex) best = w.el;
  });
  return best;
}

function focusApp(id) {
  const w = wins[id];
  if (!w) return;
  w.el.hidden = false;
  const maxZ = Math.max(10, ...Object.values(wins).map((x) => +x.el.style.zIndex || 10));
  w.el.style.zIndex = maxZ + 1;
  Object.entries(wins).forEach(([k, x]) => {
    x.el.classList.toggle('inactive', k !== id);
    x.taskBtn.classList.toggle('active', k === id);
  });
}

function minimizeApp(id) {
  const w = wins[id];
  if (!w) return;
  w.el.hidden = true;
  w.taskBtn.classList.remove('active');
  const t = topWin();
  if (t) focusApp(t.dataset.app);
}

function closeApp(id) {
  const w = wins[id];
  if (!w) return;
  w.el.remove();
  w.taskBtn.remove();
  delete wins[id];
  const t = topWin();
  if (t) focusApp(t.dataset.app);
}

/* ---------- start menu ---------- */
const smItems = document.getElementById('smItems');
APPS.forEach((app) => {
  const it = document.createElement('div');
  it.className = 'smItem';
  it.innerHTML = (ICONS[app.icon] || ICONS.page) + '<span>' + app.label + '</span>';
  it.addEventListener('click', () => { toggleStart(false); openApp(app.id); });
  smItems.appendChild(it);
});
const smSep = document.createElement('div');
smSep.className = 'smDiv';
smItems.appendChild(smSep);
const smOff = document.createElement('div');
smOff.className = 'smItem disabled';
smOff.title = 'No tiene privilegios para apagar este equipo.';
smOff.innerHTML =
  '<svg viewBox="0 0 22 22"><circle cx="11" cy="11" r="8" fill="none" stroke="#a03030" stroke-width="2.2"/><rect x="10" y="2" width="2.4" height="8" fill="#a03030"/></svg>' +
  '<span>Apagar el sistema...</span>';
smOff.addEventListener('click', () => showDialog('Apagar el sistema', 'No tiene privilegios para apagar este equipo. Póngase en contacto con el administrador del sistema.'));
smItems.appendChild(smOff);

function toggleStart(force) {
  const show = force !== undefined ? force : startMenu.hidden;
  startMenu.hidden = !show;
  startBtn.classList.toggle('open', show);
}
startBtn.addEventListener('click', (e) => { e.stopPropagation(); toggleStart(); });
document.addEventListener('click', (e) => {
  if (!startMenu.hidden && !startMenu.contains(e.target)) toggleStart(false);
});

/* ---------- setup helper: ?open=banco pre-opens an app, no friction ---------- */
(() => {
  const id = new URLSearchParams(location.search).get('open');
  const app = APPS.find((a) => a.id === id);
  if (!app) return;
  const el = buildWindow(app);
  winHost.appendChild(el);
  const tb = document.createElement('button');
  tb.className = 'taskBtn';
  tb.type = 'button';
  tb.innerHTML = ICONS.ie + '<span>' + app.label + '</span>';
  tb.addEventListener('click', () => {
    if (wins[id] && !wins[id].el.hidden && wins[id].el === topWin()) minimizeApp(id);
    else focusApp(id);
  });
  taskHost.appendChild(tb);
  wins[id] = { el, taskBtn: tb };
  focusApp(id);
})();

/* ---------- clock ---------- */
function tick() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  const clock = document.getElementById('clock');
  clock.textContent = p(d.getHours()) + ':' + p(d.getMinutes());
  clock.title = d.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}
setInterval(tick, 5000);
tick();
