/* Sala de control — Billy's one-handed director console. */

const $ = (id) => document.getElementById(id);
let state = {};
let lastVerdictNonce = 0;

/* ---------- helpers ---------- */
function toast(msg, ms = 1800) {
  const t = $('toast');
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => { t.hidden = true; }, ms);
}

function nowHM() {
  const d = new Date();
  return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
}

function num(v, fallback = 0) {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : fallback;
}

function effectiveHappiness(s, now = Date.now()) {
  const level = num(s.happiness_level, 100);
  const rate = num(s.happiness_rate, 2);
  const anchor = num(s.happiness_anchor_ts, now);
  const mode = s.happiness_mode || 'paused';
  if (mode === 'flatline') return 0;
  if (mode === 'paused') return Math.max(0, Math.min(100, level));
  const eff = level - (rate * (now - anchor)) / 60000;
  if (mode === 'hold_critical') return Math.max(8, Math.min(100, eff));
  return Math.max(0, Math.min(100, eff));
}

function derivedCctvFrame(s, now = Date.now()) {
  /* mirrors the cctv page: loops every 15 min by default; only 'paused' freezes */
  const frame = num(s.cctv_frame, 0);
  if (s.cctv_mode === 'paused') return frame % 10;
  const interval = Math.max(1, num(s.cctv_interval_s, 900)) * 1000;
  return (frame + Math.floor((now - num(s.cctv_frame_ts, now)) / interval)) % 10;
}

function factorTitle(id) {
  if (typeof FACTORS !== 'undefined') {
    const f = FACTORS.find((x) => x.id === id);
    if (f) return f.title;
  }
  return id;
}

async function guarded(btn, fn, okMsg) {
  btn.disabled = true;
  try {
    await fn();
    if (okMsg) toast(okMsg);
  } catch (e) {
    console.error(e);
    toast('ERROR: ' + e.message, 3200);
  } finally {
    btn.disabled = false;
  }
}

/* ---------- render ---------- */
function render() {
  const eff = Math.round(effectiveHappiness(state));
  $('pillHappiness').textContent = 'FLOR ' + eff + (state.happiness_mode === 'normal' ? '↓' : ' ' + (state.happiness_mode || ''));
  $('pillCctv').textContent = 'CCTV ' + (state.cctv_mode || '--') + ' #' + (derivedCctvFrame(state) + 1);

  const pending = state.tenfa_pending || '';
  const pillT = $('pillTenfa');
  pillT.textContent = pending ? '10FA PENDIENTE' : '10FA f' + (num(state.tenfa_current) + 1);
  pillT.classList.toggle('hot', !!pending);

  $('pendingCard').hidden = !pending;
  $('noPending').style.display = pending ? 'none' : '';
  if (pending) {
    $('pendingTitle').textContent = factorTitle(pending);
    $('pendingAnswer').textContent = state.tenfa_answer || '(sin texto)';
  }
  $('completeBanner').hidden = state.tenfa_complete !== '1';
  $('stealthDot').hidden = !pending;

  document.querySelectorAll('#frameGrid button').forEach((b, i) => {
    b.classList.toggle('current', i === derivedCctvFrame(state));
  });

  renderNextPreview();
}

function scriptPtr() { return parseInt(localStorage.getItem('esc_script_ptr') || '0', 10); }
function renderNextPreview() {
  const ptr = scriptPtr();
  const next = CONSOLE_SCRIPT[ptr];
  $('nextPreview').textContent = next
    ? `siguiente (${ptr + 1}/${CONSOLE_SCRIPT.length}) — ${next.sender}: ${next.content}`
    : 'guion agotado';
  $('btnSendNext').disabled = !next;
  $('btnSkipNext').disabled = !next;
}

/* ---------- actions ---------- */
function sendChat(msg) {
  return ES.appendRow('grindr', [String(Date.now()), msg.sender, msg.type, msg.content, nowHM(), 'live']);
}

function verdict(kind) {
  const id = state.tenfa_pending;
  if (!id) return;
  state.tenfa_pending = '';
  render();
  ES.setState('tenfa_verdict', `${kind}:${id}:${Date.now()}`)
    .then(() => ES.logEvent('consola', 'verdict', kind + ':' + id))
    .catch((e) => toast('ERROR: ' + e.message, 3200));
}

$('btnApprove').addEventListener('click', () => verdict('approve'));
$('btnReject').addEventListener('click', () => verdict('reject'));

$('btnCall').addEventListener('click', (e) =>
  guarded(e.target, async () => {
    await ES.setState('call_requested', String(Date.now()));
    await ES.logEvent('consola', 'llamada_solicitada');
  }, 'llamada solicitada — suena en ~15s'));

$('btnExitLine').addEventListener('click', (e) =>
  guarded(e.target, () => sendChat(EXIT_LINE), 'mensaje final enviado'));

$('btnReveal').addEventListener('click', (e) =>
  guarded(e.target, () => ES.setState('grindr_backstory', 'revealed'), 'historial revelado'));
$('btnHide').addEventListener('click', (e) =>
  guarded(e.target, () => ES.setState('grindr_backstory', 'hidden'), 'historial oculto'));

$('btnSendNext').addEventListener('click', (e) =>
  guarded(e.target, async () => {
    const next = CONSOLE_SCRIPT[scriptPtr()];
    if (!next) return;
    await sendChat(next);
    localStorage.setItem('esc_script_ptr', String(scriptPtr() + 1));
    renderNextPreview();
  }, 'enviado'));
$('btnSkipNext').addEventListener('click', () => {
  localStorage.setItem('esc_script_ptr', String(scriptPtr() + 1));
  renderNextPreview();
});

AUDIO_FILES.forEach((file) => {
  const b = document.createElement('button');
  b.className = 'ghost';
  b.type = 'button';
  b.textContent = 'audio: ' + file;
  b.addEventListener('click', () =>
    guarded(b, () => sendChat({ sender: 'maxim', type: 'audio', content: file }), 'audio enviado'));
  $('audioList').appendChild(b);
});

$('freeForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const text = $('freeText').value.trim();
  if (!text) return;
  guarded(e.submitter || $('freeForm').querySelector('button'), async () => {
    await sendChat({ sender: $('freeSender').value, type: 'text', content: text });
    $('freeText').value = '';
  }, 'enviado');
});

/* FLOR */
function writeHappiness(level, mode) {
  return ES.setStateBlock('happiness_level', [
    Math.round(Math.max(0, Math.min(100, level))),
    Date.now(),
    mode,
  ]);
}

$('btnKiss').addEventListener('click', (e) =>
  guarded(e.target, async () => {
    const s = await ES.readState();
    await writeHappiness(effectiveHappiness(s) + 10, 'normal');
    await ES.logEvent('consola', 'beso');
  }, 'beso registrado'));

$('btnPetal').addEventListener('click', (e) =>
  guarded(e.target, async () => {
    const s = await ES.readState();
    const eff = effectiveHappiness(s);
    if (eff <= 0) return;
    /* drop exactly one petal: land just below the next 10-point threshold */
    const target = Math.max(0, (Math.ceil(eff / 10) - 1) * 10);
    const mode = s.happiness_mode === 'flatline' ? 'flatline'
      : (s.happiness_mode === 'paused' ? 'paused' : s.happiness_mode || 'paused');
    await writeHappiness(target, mode);
    await ES.logEvent('consola', 'petalo', String(target));
  }, 'pétalo suelto'));

$('btnHold').addEventListener('click', (e) =>
  guarded(e.target, async () => {
    const s = await ES.readState();
    await writeHappiness(effectiveHappiness(s), 'hold_critical');
  }, 'retenido en crítico'));

$('btnResume').addEventListener('click', (e) =>
  guarded(e.target, async () => {
    const s = await ES.readState();
    await writeHappiness(effectiveHappiness(s), 'normal');
  }, 'drenando'));

$('btnPause').addEventListener('click', (e) =>
  guarded(e.target, async () => {
    const s = await ES.readState();
    await writeHappiness(effectiveHappiness(s), 'paused');
  }, 'pausado'));

$('btnFlatline').addEventListener('click', (e) =>
  guarded(e.target, () => ES.setState('happiness_mode', 'flatline'), 'flatline'));

/* CCTV */
function writeCctv(mode, frame, intervalS) {
  return ES.setStateBlock('cctv_mode', [
    mode,
    frame,
    Date.now(),
    intervalS !== undefined ? intervalS : Math.max(1, num(state.cctv_interval_s, 900)),
  ]);
}

$('btnCctvStart').addEventListener('click', (e) =>
  guarded(e.target, () => writeCctv('running', 0), 'cctv corriendo'));
$('btnCctvPause').addEventListener('click', (e) =>
  guarded(e.target, () => writeCctv('paused', derivedCctvFrame(state)), 'cctv pausado'));
$('btnCctvAdvance').addEventListener('click', (e) =>
  guarded(e.target, () => writeCctv(state.cctv_mode === 'paused' ? 'paused' : 'running',
    (derivedCctvFrame(state) + 1) % 10), 'frame adelantado'));
$('btnCctvFailure').addEventListener('click', (e) =>
  guarded(e.target, () => ES.setState('cctv_mode', 'failure'), 'FALLA'));
$('btnCctvGetaway').addEventListener('click', (e) =>
  guarded(e.target, () => writeCctv('getaway', 9), 'fuga'));
$('btnCctvReset').addEventListener('click', (e) =>
  guarded(e.target, () => writeCctv('idle', 0), 'cctv reseteado'));

for (let i = 0; i < 10; i++) {
  const b = document.createElement('button');
  b.type = 'button';
  b.textContent = String(i + 1);
  b.addEventListener('click', () =>
    guarded(b, () => writeCctv(state.cctv_mode === 'running' ? 'running' : 'paused', i), 'frame ' + (i + 1)));
  $('frameGrid').appendChild(b);
}

/* Reset partida */
$('btnResetGame').addEventListener('click', (e) =>
  guarded(e.target, async () => {
    if (!confirm('¿Reiniciar TODA la partida?')) return;
    const now = Date.now();
    await ES.updateValues('state!B2:B15', [
      ['100'], [String(now)], ['paused'], ['2'],
      ['hidden'],
      ['0'], [''], [''], [''], ['0'],
      ['idle'], ['0'], [String(now)], ['900'],
    ]);
    /* wipe live chat rows (keep header + backstory) */
    const rows = await ES.getValues('grindr!A2:F1000');
    const firstLive = rows.findIndex((r) => r[5] === 'live');
    if (firstLive >= 0) await ES.clearRange('grindr!A' + (firstLive + 2) + ':F1000');
    localStorage.setItem('esc_script_ptr', '0');
    renderNextPreview();
    await ES.logEvent('consola', 'reset');
  }, 'partida reiniciada'));

/* ---------- stealth mode ---------- */
let wakeLock = null;
async function keepAwake() {
  try { wakeLock = await navigator.wakeLock.request('screen'); } catch (_) {}
}
document.addEventListener('visibilitychange', () => {
  if (!$('stealth').hidden && document.visibilityState === 'visible') keepAwake();
});

$('stealthBtn').addEventListener('click', () => {
  $('stealth').hidden = false;
  document.documentElement.requestFullscreen().catch(() => {});
  keepAwake();
});

let cornerTaps = [];
$('stealth').addEventListener('pointerdown', (ev) => {
  const h = window.innerHeight;
  const inCorner = ev.clientX < 90 && ev.clientY < 90;
  if (inCorner) {
    const now = Date.now();
    cornerTaps = cornerTaps.filter((t) => now - t < 900).concat(now);
    if (cornerTaps.length >= 3) {
      cornerTaps = [];
      $('stealth').hidden = true;
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
      if (wakeLock) { wakeLock.release().catch(() => {}); wakeLock = null; }
    }
    return;
  }
  if (!state.tenfa_pending) return;
  const el = $('stealth');
  if (ev.clientY < h * 0.45) {
    verdict('approve');
    el.classList.remove('flashOk'); void el.offsetWidth; el.classList.add('flashOk');
  } else if (ev.clientY > h * 0.55) {
    verdict('reject');
    el.classList.remove('flashBad'); void el.offsetWidth; el.classList.add('flashBad');
  }
});

function tickClock() {
  const d = new Date();
  $('clockTime').textContent =
    String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  $('clockDate').textContent = d.toLocaleDateString('es-AR', {
    weekday: 'long', day: 'numeric', month: 'long',
  });
}
setInterval(tickClock, 5000);
tickClock();

/* Local re-render between polls so FLOR/CCTV pills stay live. */
setInterval(render, 1000);

/* ---------- boot ---------- */
(async () => {
  try {
    await ES.init();
    ES.poll(ESC_CONFIG.POLL_MS, async () => {
      state = await ES.readState();
      $('pillHealth').className = 'pill ok';
      render();
    }, () => { $('pillHealth').className = 'pill bad'; });
  } catch (e) {
    console.error(e);
    toast('SIN CONEXIÓN: ' + e.message, 6000);
    $('pillHealth').className = 'pill bad';
  }
})();
