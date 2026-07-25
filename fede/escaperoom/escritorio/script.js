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
  { id: 'cartelera', label: 'Cartelera del consorcio', icon: 'board', deleted: true,
    url: '../board/',     fakeUrl: 'http://www.consorcioenlinea.com.ar/cartelera/index.php?ed=1247' },
  { id: 'grindr',    label: 'Grindr Web',              icon: 'grindr',
    url: '../grindr/',    fakeUrl: 'https://web.grindr.com/chat' },
  { id: 'youtube',   label: 'YouTube',                 icon: 'youtube',
    url: '../youtube/',   fakeUrl: 'http://www.youtube.com/watch?v=4o645IYFQDU' },
  { id: 'buscaminas', label: 'Buscaminas',             icon: 'mine',
    url: '../buscaminas/', program: true, w: 190, h: 276 },
];

/* System icons. mipc opens a (decorative) drives window; papelera opens the
   Recycle Bin, which is where the deleted "Cartelera del consorcio" now lives. */
const SYSTEM_ICONS = [
  { id: 'mipc',     label: 'Mi PC',                  icon: 'mypc',  sys: 'mipc' },
  { id: 'papelera', label: 'Papelera de reciclaje',  icon: 'trash', sys: 'papelera' },
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
  hdd: '<svg viewBox="0 0 32 32"><rect x="3" y="9" width="26" height="15" rx="2" fill="#c9c4bb" stroke="#404040"/><rect x="3" y="9" width="26" height="8" rx="2" fill="#dcd8d0"/><rect x="6" y="19" width="14" height="2" fill="#9a948a"/><rect x="6" y="22" width="10" height="1.6" fill="#9a948a"/><circle cx="24" cy="21" r="1.6" fill="#2f9e50"/><rect x="10" y="25" width="12" height="3" fill="#c9c4bb" stroke="#404040"/></svg>',
  floppy: '<svg viewBox="0 0 32 32"><path d="M5 5 H24 L28 9 V27 H5 Z" fill="#2f3d6b" stroke="#1a2340"/><rect x="9" y="5" width="12" height="8" fill="#c9c4bb"/><rect x="16" y="6" width="3" height="6" fill="#4a5a8a"/><rect x="9" y="16" width="15" height="9" fill="#e6e3db"/><rect x="11" y="18" width="11" height="1.4" fill="#9a948a"/><rect x="11" y="20.5" width="11" height="1.4" fill="#9a948a"/></svg>',
  cd: '<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="12" fill="#cfd6dc" stroke="#808080"/><circle cx="16" cy="16" r="12" fill="none" stroke="#a9b6c2" stroke-width="1"/><path d="M16 4 A12 12 0 0 1 27 12 L21 15 A6 6 0 0 0 16 10 Z" fill="#bfe0f2" opacity="0.7"/><circle cx="16" cy="16" r="4" fill="#eef1f4" stroke="#808080"/><circle cx="16" cy="16" r="1.6" fill="#8a9098"/></svg>',
  ctrl: '<svg viewBox="0 0 32 32"><rect x="4" y="6" width="24" height="20" rx="2" fill="#d4d0c8" stroke="#404040"/><circle cx="11" cy="14" r="3.2" fill="#3a6ea5"/><rect x="17" y="11" width="8" height="2.4" fill="#808080"/><rect x="17" y="15" width="8" height="2.4" fill="#808080"/><circle cx="21" cy="21" r="3.2" fill="#c8a814"/></svg>',
  folderIcon: '<svg viewBox="0 0 32 32"><path d="M3 8 H13 L16 11 H29 V25 H3 Z" fill="#f6d873" stroke="#a98a2a"/><path d="M3 8 H13 L16 11 H29 V13 H3 Z" fill="#fce9a8"/></svg>',
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

/* ---------- desktop icons (absolute, draggable, persisted) ---------- */
let suppressDeselect = false;          /* guards the "click clears selection" after a drag */
const ICON_POS_KEY = 'esc_desk_icons';
const ICON_W = 82, ICON_ROW = 76, ICON_COL = 92, ICON_PAD = 6;

function selectOnly(el) {
  document.querySelectorAll('.dIcon.sel').forEach((n) => n.classList.remove('sel'));
  if (el) { el.classList.add('sel'); el.focus(); }
}

function openIcon(app) {
  if (app.sys) openSpecial(app.sys);
  else openApp(app.id);
}

function makeIcon(app) {
  const d = document.createElement('div');
  d.className = 'dIcon';
  d.tabIndex = 0;
  d.dataset.iid = app.id;

  const art = document.createElement('div');
  art.className = 'art';
  art.innerHTML = ICONS[app.icon] || ICONS.page;
  if (!app.sys) {                       /* shortcut overlay only on launchable apps */
    const lnk = document.createElement('span');
    lnk.className = 'lnk';
    lnk.innerHTML = ICONS.arrow;
    art.appendChild(lnk);
  }

  const cap = document.createElement('div');
  cap.className = 'cap';
  cap.textContent = app.label;

  d.append(art, cap);
  d.addEventListener('click', () => selectOnly(d));
  d.addEventListener('dblclick', () => openIcon(app));

  /* drag to reposition — threshold keeps click/dblclick working */
  d.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    const sx = e.clientX, sy = e.clientY;
    const l0 = parseInt(d.style.left) || 0, t0 = parseInt(d.style.top) || 0;
    let dragging = false;
    const move = (ev) => {
      if (!dragging && Math.hypot(ev.clientX - sx, ev.clientY - sy) < 4) return;
      if (!dragging) { dragging = true; selectOnly(d); d.classList.add('dragging'); }
      const host = iconsHost.getBoundingClientRect();
      d.style.left = Math.max(0, Math.min(host.width - ICON_W, l0 + ev.clientX - sx)) + 'px';
      d.style.top = Math.max(0, Math.min(host.height - 40, t0 + ev.clientY - sy)) + 'px';
    };
    const up = () => {
      removeEventListener('pointermove', move);
      removeEventListener('pointerup', up);
      if (dragging) { d.classList.remove('dragging'); saveIconPos(); suppressDeselect = true; }
    };
    addEventListener('pointermove', move);
    addEventListener('pointerup', up);
  });

  iconsHost.appendChild(d);
}

function defaultLayout() {
  const els = [...iconsHost.querySelectorAll('.dIcon')];
  const areaH = iconsHost.clientHeight || (innerHeight - 60);
  const perCol = Math.max(1, Math.floor((areaH - ICON_PAD) / ICON_ROW));
  els.forEach((el, i) => {
    el.style.left = (ICON_PAD + Math.floor(i / perCol) * ICON_COL) + 'px';
    el.style.top = (ICON_PAD + (i % perCol) * ICON_ROW) + 'px';
  });
}
function saveIconPos() {
  const pos = {};
  iconsHost.querySelectorAll('.dIcon').forEach((el) => {
    pos[el.dataset.iid] = { l: parseInt(el.style.left) || 0, t: parseInt(el.style.top) || 0 };
  });
  try { localStorage.setItem(ICON_POS_KEY, JSON.stringify(pos)); } catch (e) { /* ignore */ }
}
function restoreIconPos() {
  defaultLayout();
  let pos = null;
  try { pos = JSON.parse(localStorage.getItem(ICON_POS_KEY)); } catch (e) { /* ignore */ }
  if (!pos) return;
  iconsHost.querySelectorAll('.dIcon').forEach((el) => {
    const p = pos[el.dataset.iid];
    if (p) { el.style.left = p.l + 'px'; el.style.top = p.t + 'px'; }
  });
}

SYSTEM_ICONS.forEach(makeIcon);
APPS.filter((a) => !a.deleted).forEach(makeIcon);
restoreIconPos();

document.getElementById('desktop').addEventListener('click', (e) => {
  if (suppressDeselect) { suppressDeselect = false; return; }
  if (e.target.id === 'desktop' || e.target.id === 'icons') {
    document.querySelectorAll('.dIcon.sel').forEach((n) => n.classList.remove('sel'));
  }
});

/* ---------- rubber-band (marquee) selection ---------- */
(() => {
  const desktopEl = document.getElementById('desktop');
  const box = document.createElement('div');
  box.id = 'marquee';
  box.hidden = true;
  desktopEl.appendChild(box);

  desktopEl.addEventListener('pointerdown', (e) => {
    /* only left-drag from empty desktop (never from an icon or a window) */
    if (e.button !== 0) return;
    if (e.target.id !== 'desktop' && e.target.id !== 'icons') return;

    const rect = desktopEl.getBoundingClientRect();
    const x0 = e.clientX - rect.left, y0 = e.clientY - rect.top;
    const icons = [...document.querySelectorAll('.dIcon')];
    const additive = e.ctrlKey || e.shiftKey;   /* keep existing selection, like Windows */
    const already = new Set(additive ? document.querySelectorAll('.dIcon.sel') : []);
    if (!additive) document.querySelectorAll('.dIcon.sel').forEach((n) => n.classList.remove('sel'));
    let moved = false;

    const move = (ev) => {
      const x = ev.clientX - rect.left, y = ev.clientY - rect.top;
      const L = Math.min(x0, x), T = Math.min(y0, y), W = Math.abs(x - x0), H = Math.abs(y - y0);
      if (!moved && W < 4 && H < 4) return;
      moved = true;
      box.hidden = false;
      box.style.left = L + 'px'; box.style.top = T + 'px';
      box.style.width = W + 'px'; box.style.height = H + 'px';
      const bl = rect.left + L, bt = rect.top + T, br = bl + W, bb = bt + H;
      icons.forEach((ic) => {
        const r = ic.getBoundingClientRect();
        const hit = r.left < br && r.right > bl && r.top < bb && r.bottom > bt;
        ic.classList.toggle('sel', hit || already.has(ic));
      });
    };
    const up = () => {
      removeEventListener('pointermove', move);
      removeEventListener('pointerup', up);
      box.hidden = true;
      box.style.width = box.style.height = '0px';
      if (moved) suppressDeselect = true;   /* don't let the click clear what we just marqueed */
    };
    addEventListener('pointermove', move);
    addEventListener('pointerup', up);
  });
})();

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
APPS.filter((a) => !a.deleted).forEach((app) => {
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

/* ---------- special system windows (Mi PC, Papelera, Propiedades de Pantalla) ---------- */
function makeDraggable(w, handle) {
  handle.style.touchAction = 'none';
  handle.addEventListener('pointerdown', (e) => {
    if (e.target.closest('.tbtn')) return;
    const r = w.getBoundingClientRect();
    const dx = e.clientX - r.left, dy = e.clientY - r.top;
    const move = (ev) => {
      w.style.left = Math.max(-r.width + 60, Math.min(innerWidth - 60, ev.clientX - dx)) + 'px';
      w.style.top = Math.max(0, Math.min(innerHeight - 60, ev.clientY - dy)) + 'px';
    };
    const up = () => { removeEventListener('pointermove', move); removeEventListener('pointerup', up); };
    addEventListener('pointermove', move);
    addEventListener('pointerup', up);
  });
}

function buildShellWindow(id, titleText, iconKey, bodyNode, opts) {
  opts = opts || {};
  const w = document.createElement('div');
  w.className = 'win raised program';
  w.dataset.app = id;

  const title = document.createElement('div');
  title.className = 'titleBar';
  title.innerHTML = '<span class="tIcon">' + (ICONS[iconKey] || ICONS.page) + '</span>' +
    '<span class="tText">' + titleText + '</span>';
  const btnMin = tbtn('<svg viewBox="0 0 10 10"><rect x="1" y="7" width="7" height="2" fill="currentColor"/></svg>', 'Minimizar');
  const btnClose = tbtn('<svg viewBox="0 0 10 10"><path d="M1.5 1.5 L8.5 8.5 M8.5 1.5 L1.5 8.5" stroke="currentColor" stroke-width="1.6"/></svg>', 'Cerrar');
  title.append(btnMin, btnClose);

  const body = document.createElement('div');
  body.className = 'winBody shellBody';
  body.appendChild(bodyNode);

  const cascade = (Object.keys(wins).length % 6) * 20;
  w.style.width = (opts.w || 440) + 'px';
  w.style.height = (opts.h || 320) + 'px';
  w.style.left = 'max(10px, calc(50% - ' + Math.round((opts.w || 440) / 2) + 'px + ' + cascade + 'px))';
  w.style.top = (72 + cascade) + 'px';

  makeDraggable(w, title);
  btnMin.addEventListener('click', () => minimizeApp(id));
  btnClose.addEventListener('click', () => closeApp(id));
  w.addEventListener('pointerdown', () => focusApp(id));

  w.append(title, body);
  return w;
}

function folderView(items, statusText) {
  const wrap = document.createElement('div');
  wrap.className = 'folder';
  const grid = document.createElement('div');
  grid.className = 'folderGrid';
  items.forEach((it) => {
    const cell = document.createElement('div');
    cell.className = 'fItem';
    cell.tabIndex = 0;
    cell.innerHTML = '<div class="fArt">' + (ICONS[it.icon] || ICONS.page) + '</div>' +
      '<div class="fCap">' + it.label + '</div>';
    cell.addEventListener('click', () => {
      grid.querySelectorAll('.fItem.sel').forEach((n) => n.classList.remove('sel'));
      cell.classList.add('sel');
    });
    cell.addEventListener('dblclick', () => it.open && it.open());
    grid.appendChild(cell);
  });
  const status = document.createElement('div');
  status.className = 'folderStatus';
  status.textContent = statusText || (items.length + ' objeto(s)');
  wrap.append(grid, status);
  return wrap;
}

function buildMiPc(id) {
  const items = [
    { icon: 'floppy', label: 'Disco de 3½ (A:)', open: () => showDialog('Disco de 3½ (A:)', 'No hay ningún disco en la unidad. Inserte un disco e intente de nuevo.') },
    { icon: 'hdd', label: 'Disco local (C:)', open: () => showDialog('C:', 'Acceso denegado. No tiene permisos para explorar esta unidad.') },
    { icon: 'cd', label: 'Unidad de CD (D:)', open: () => showDialog('Unidad de CD (D:)', 'La unidad no está lista. Compruebe que haya un disco insertado.') },
    { icon: 'ctrl', label: 'Panel de control', open: () => showDialog('Panel de control', 'El administrador del sistema deshabilitó el Panel de control.') },
  ];
  return buildShellWindow(id, 'Mi PC', 'mypc', folderView(items, '4 objetos'), { w: 470, h: 300 });
}

function buildPapelera(id) {
  const cart = APPS.find((a) => a.id === 'cartelera');
  const items = cart ? [{ icon: cart.icon, label: cart.label, open: () => openApp('cartelera') }] : [];
  const status = items.length ? items.length + ' objeto' : 'La Papelera de reciclaje está vacía';
  return buildShellWindow(id, 'Papelera de reciclaje', 'trash', folderView(items, status), { w: 470, h: 300 });
}

function buildDisplayProps(id) {
  const body = document.createElement('div');
  body.className = 'dispProps';
  body.innerHTML =
    '<div class="dispMon"><div class="dispScreen"></div><div class="dispNeck"></div><div class="dispBase"></div></div>' +
    '<div class="dispRows">' +
    '<div class="dispRow"><b>Fondo:</b> Colinas</div>' +
    '<div class="dispRow"><b>Combinación de colores:</b> Windows estándar</div>' +
    '<div class="dispRow"><b>Resolución de pantalla:</b> 1024 × 768</div>' +
    '<div class="dispRow"><b>Calidad del color:</b> Color verdadero (32 bits)</div>' +
    '</div>';
  return buildShellWindow(id, 'Propiedades de Pantalla', 'mypc', body, { w: 300, h: 320 });
}

function openSpecial(kind) {
  const id = 'sys:' + kind;
  if (wins[id]) { focusApp(id); return; }
  let el, taskIcon;
  if (kind === 'mipc') { el = buildMiPc(id); taskIcon = 'mypc'; }
  else if (kind === 'papelera') { el = buildPapelera(id); taskIcon = 'trash'; }
  else if (kind === 'display') { el = buildDisplayProps(id); taskIcon = 'mypc'; }
  else return;
  winHost.appendChild(el);
  const tb = document.createElement('button');
  tb.className = 'taskBtn';
  tb.type = 'button';
  tb.innerHTML = ICONS[taskIcon] + '<span>' + el.querySelector('.tText').textContent + '</span>';
  tb.addEventListener('click', () => {
    if (wins[id] && !wins[id].el.hidden && wins[id].el === topWin()) minimizeApp(id);
    else focusApp(id);
  });
  taskHost.appendChild(tb);
  wins[id] = { el, taskBtn: tb };
  focusApp(id);
}

/* ---------- desktop right-click context menu ---------- */
(() => {
  const desktopEl = document.getElementById('desktop');
  const menu = document.createElement('div');
  menu.id = 'ctxMenu';
  menu.hidden = true;
  document.body.appendChild(menu);
  const hide = () => { menu.hidden = true; };
  addEventListener('click', hide);
  addEventListener('blur', hide);
  addEventListener('resize', hide);

  function show(x, y, items) {
    menu.innerHTML = '';
    items.forEach((it) => {
      if (it.sep) { menu.appendChild(Object.assign(document.createElement('div'), { className: 'ctxSep' })); return; }
      const el = document.createElement('div');
      el.className = 'ctxItem' + (it.disabled ? ' disabled' : '');
      el.textContent = it.label;
      if (!it.disabled) el.addEventListener('click', () => { hide(); it.fn && it.fn(); });
      menu.appendChild(el);
    });
    menu.hidden = false;
    menu.style.left = Math.min(x, innerWidth - menu.offsetWidth - 4) + 'px';
    menu.style.top = Math.min(y, innerHeight - menu.offsetHeight - 4) + 'px';
  }

  desktopEl.addEventListener('contextmenu', (e) => {
    const icon = e.target.closest('.dIcon');
    const onDesk = e.target.id === 'desktop' || e.target.id === 'icons';
    if (!icon && !onDesk) return;       /* over a window → native menu */
    e.preventDefault();
    if (icon) {
      selectOnly(icon);
      show(e.clientX, e.clientY, [
        { label: 'Abrir', fn: () => icon.dispatchEvent(new MouseEvent('dblclick', { bubbles: true })) },
        { sep: true },
        { label: 'Cortar', disabled: true },
        { label: 'Crear acceso directo', disabled: true },
        { label: 'Eliminar', disabled: true },
        { sep: true },
        { label: 'Propiedades', disabled: true },
      ]);
    } else {
      show(e.clientX, e.clientY, [
        { label: 'Actualizar', fn: refreshDesktop },
        { sep: true },
        { label: 'Organizar iconos', fn: () => { try { localStorage.removeItem(ICON_POS_KEY); } catch (err) { /* ignore */ } defaultLayout(); } },
        { label: 'Pegar', disabled: true },
        { sep: true },
        { label: 'Propiedades', fn: () => openSpecial('display') },
      ]);
    }
  });
})();

function refreshDesktop() {
  iconsHost.style.visibility = 'hidden';
  setTimeout(() => { iconsHost.style.visibility = ''; }, 70);
}

/* ---------- keyboard: arrows move selection, Enter opens, type-to-jump ---------- */
function center(el) { const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }
function nearestIcon(cur, key, icons) {
  const c = center(cur);
  let best = null, bestD = Infinity;
  icons.forEach((ic) => {
    if (ic === cur) return;
    const p = center(ic), dx = p.x - c.x, dy = p.y - c.y;
    let ok = false;
    if (key === 'ArrowRight') ok = dx > 4 && Math.abs(dy) <= Math.abs(dx) + 44;
    else if (key === 'ArrowLeft') ok = dx < -4 && Math.abs(dy) <= Math.abs(dx) + 44;
    else if (key === 'ArrowDown') ok = dy > 4 && Math.abs(dx) <= Math.abs(dy) + 44;
    else if (key === 'ArrowUp') ok = dy < -4 && Math.abs(dx) <= Math.abs(dy) + 44;
    if (!ok) return;
    const dist = dx * dx + dy * dy;
    if (dist < bestD) { bestD = dist; best = ic; }
  });
  return best;
}
document.addEventListener('keydown', (e) => {
  const tag = (e.target.tagName || '').toLowerCase();
  if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
  if (!startMenu.hidden) return;
  if (!document.getElementById('dlgShade').hidden) return;
  if (topWin()) return;                 /* a window is open → let the app own the keys */

  const icons = [...iconsHost.querySelectorAll('.dIcon')];
  if (!icons.length) return;
  const cur = iconsHost.querySelector('.dIcon.sel');

  if (e.key === 'Enter') {
    if (cur) { e.preventDefault(); cur.dispatchEvent(new MouseEvent('dblclick', { bubbles: true })); }
  } else if (e.key.indexOf('Arrow') === 0) {
    e.preventDefault();
    selectOnly(cur ? (nearestIcon(cur, e.key, icons) || cur) : icons[0]);
  } else if (e.key.length === 1 && /[a-z0-9]/i.test(e.key)) {
    const k = e.key.toLowerCase();
    const start = Math.max(0, icons.indexOf(cur));
    const order = icons.slice(start + 1).concat(icons.slice(0, start + 1));
    const hit = order.find((ic) => ic.querySelector('.cap').textContent.trim().toLowerCase().startsWith(k));
    if (hit) selectOnly(hit);
  }
});

/* ---------- idle screensaver (Mystify) ---------- */
(() => {
  const IDLE_MS = 90000;
  let timer = null, active = false, raf = 0, cv = null, onResize = null;

  const schedule = () => { clearTimeout(timer); timer = setTimeout(start, IDLE_MS); };
  const wake = () => { if (active) stop(); schedule(); };
  ['pointermove', 'pointerdown', 'keydown', 'wheel', 'touchstart'].forEach((ev) =>
    addEventListener(ev, wake, { passive: true }));

  function start() {
    if (active || document.hidden) { schedule(); return; }
    active = true;
    cv = document.createElement('canvas');
    cv.id = 'saver';
    document.body.appendChild(cv);
    const ctx = cv.getContext('2d');
    const fit = () => { cv.width = innerWidth; cv.height = innerHeight; };
    fit();
    onResize = fit; addEventListener('resize', onResize);

    const shapes = [320, 200].map((hue) => ({
      hue,
      pts: Array.from({ length: 4 }, () => ({
        x: Math.random() * cv.width, y: Math.random() * cv.height,
        vx: (1 + Math.random() * 2.4) * (Math.random() < 0.5 ? -1 : 1),
        vy: (1 + Math.random() * 2.4) * (Math.random() < 0.5 ? -1 : 1),
      })),
      trail: [],
    }));

    const step = () => {
      ctx.fillStyle = 'rgba(0,0,0,0.26)';
      ctx.fillRect(0, 0, cv.width, cv.height);
      shapes.forEach((s) => {
        s.pts.forEach((p) => {
          p.x += p.vx; p.y += p.vy;
          if (p.x <= 0 || p.x >= cv.width) { p.vx *= -1; p.x = Math.max(0, Math.min(cv.width, p.x)); }
          if (p.y <= 0 || p.y >= cv.height) { p.vy *= -1; p.y = Math.max(0, Math.min(cv.height, p.y)); }
        });
        s.trail.push(s.pts.map((p) => ({ x: p.x, y: p.y })));
        if (s.trail.length > 16) s.trail.shift();
        s.trail.forEach((poly, ti) => {
          ctx.beginPath();
          poly.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
          ctx.closePath();
          ctx.strokeStyle = 'hsla(' + s.hue + ',85%,62%,' + (((ti + 1) / s.trail.length) * 0.7) + ')';
          ctx.lineWidth = 1.6;
          ctx.stroke();
        });
      });
      raf = requestAnimationFrame(step);
    };
    step();
  }

  function stop() {
    active = false;
    cancelAnimationFrame(raf);
    if (onResize) { removeEventListener('resize', onResize); onResize = null; }
    if (cv) { cv.remove(); cv = null; }
  }

  schedule();
})();
