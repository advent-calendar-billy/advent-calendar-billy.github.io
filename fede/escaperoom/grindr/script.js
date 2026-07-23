/* Chat — renders the grindr tab. Empty until the account is "recovered"
   (state.grindr_backstory = revealed); live rows always show. */

/* Profile chrome is content — edit here. */
const PROFILE = {
  name: 'Maxim',
  meta: 'En línea · a 90 m',       /* PLACEHOLDER */
  metaOffline: 'Desconectado',
  onlineUntilExitLine: true,
};

const thread = document.getElementById('thread');
const rendered = new Map(); /* id -> node */
let revealed = false;
let exitLineSeen = false;
let currentAudio = null;

/* Fede can write; Maxim never answers. Sent messages flip to "Visto" after a
   random 5s–3min, and sometimes get a flame reaction a bit after that.
   Timing survives refresh via localStorage. */
const META_KEY = 'esc_grindr_meta';
let meta = (() => {
  try { return JSON.parse(localStorage.getItem(META_KEY)) || {}; } catch (_) { return {}; }
})();
const saveMeta = () => localStorage.setItem(META_KEY, JSON.stringify(meta));

const SEEN_MIN_MS = 30000;
const SEEN_MAX_MS = 240000;
const FIRE_CHANCE = 0.25;

/* Fede can double-tap any message to like it himself (real Grindr behavior:
   flame in the upper-left corner; both liked = two flames). */
const LIKES_KEY = 'esc_grindr_selflikes';
let selfLikes = (() => {
  try { return JSON.parse(localStorage.getItem(LIKES_KEY)) || {}; } catch (_) { return {}; }
})();
const saveLikes = () => localStorage.setItem(LIKES_KEY, JSON.stringify(selfLikes));

function nowHM() {
  const d = new Date();
  return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
}

document.getElementById('profileName').textContent = PROFILE.name;
document.getElementById('profileMeta').textContent = PROFILE.meta;

const PLAY_ICON =
  '<svg viewBox="0 0 24 24"><path d="M8 5.5 L18.5 12 L8 18.5 Z" fill="currentColor"/></svg>';
const PAUSE_ICON =
  '<svg viewBox="0 0 24 24"><rect x="7" y="5.5" width="3.4" height="13" rx="1" fill="currentColor"/><rect x="13.6" y="5.5" width="3.4" height="13" rx="1" fill="currentColor"/></svg>';

function fmtLen(sec) {
  if (!Number.isFinite(sec)) return '·:··';
  return Math.floor(sec / 60) + ':' + String(Math.round(sec % 60)).padStart(2, '0');
}

function buildVoice(bubble, filename) {
  bubble.classList.add('hasVoice');
  const wrap = document.createElement('div');
  wrap.className = 'voice';

  const btn = document.createElement('button');
  btn.className = 'playBtn';
  btn.type = 'button';
  btn.innerHTML = PLAY_ICON;

  const wave = document.createElement('div');
  wave.className = 'wave';
  const bars = [];
  for (let i = 0; i < 24; i++) {
    const bar = document.createElement('i');
    bar.style.height = 22 * (0.25 + Math.abs(Math.sin(i * 1.7)) * 0.75) + 'px';
    wave.appendChild(bar);
    bars.push(bar);
  }

  const len = document.createElement('span');
  len.className = 'vlen';
  len.textContent = '·:··';

  const audio = new Audio('../audio/' + filename);
  audio.preload = 'metadata';
  audio.addEventListener('loadedmetadata', () => { len.textContent = fmtLen(audio.duration); });
  audio.addEventListener('timeupdate', () => {
    const frac = audio.duration ? audio.currentTime / audio.duration : 0;
    bars.forEach((b, i) => b.classList.toggle('played', i / bars.length < frac));
    len.textContent = fmtLen(audio.duration ? audio.duration - audio.currentTime : NaN);
  });
  audio.addEventListener('ended', () => {
    btn.innerHTML = PLAY_ICON;
    bars.forEach((b) => b.classList.remove('played'));
    len.textContent = fmtLen(audio.duration);
    currentAudio = null;
  });

  btn.addEventListener('click', () => {
    if (currentAudio && currentAudio !== audio) {
      currentAudio.pause();
      currentAudio.dispatchEvent(new Event('ended'));
    }
    if (audio.paused) {
      audio.play();
      currentAudio = audio;
      btn.innerHTML = PAUSE_ICON;
    } else {
      audio.pause();
      btn.innerHTML = PLAY_ICON;
    }
  });

  wrap.append(btn, wave, len);
  bubble.appendChild(wrap);
}

function renderRow(row, opts = {}) {
  const [id, sender, type, content, ts] = row;
  if (!id || rendered.has(id)) return;

  const bubble = document.createElement('div');
  bubble.className = 'msg ' + (sender === 'billy' ? 'out' : 'in');
  bubble.dataset.id = id;
  if (opts.delay) bubble.style.animationDelay = opts.delay + 'ms';

  if (type === 'audio') buildVoice(bubble, content);
  else bubble.textContent = content;

  if (ts) {
    const stamp = document.createElement('div');
    stamp.className = 'stamp';
    stamp.textContent = ts;
    bubble.appendChild(stamp);
  }

  thread.appendChild(bubble);
  rendered.set(id, bubble);
  thread.scrollTop = thread.scrollHeight;
}

function addSysChip(text) {
  const chip = document.createElement('div');
  chip.className = 'sysChip';
  chip.textContent = text;
  thread.appendChild(chip);
}

function setOnline(on) {
  document.getElementById('onlineDot').classList.toggle('off', !on);
  document.getElementById('profileMeta').textContent = on ? PROFILE.meta : PROFILE.metaOffline;
}

async function sync() {
  const [stateRows, msgRows] = await Promise.all([
    ES.getValues(ESC_CONFIG.STATE_RANGE),
    ES.getValues('grindr!A2:F1000'),
  ]);
  const state = {};
  for (const r of stateRows) if (r[0]) state[r[0]] = r[1] || '';

  const nowRevealed = state.grindr_backstory === 'revealed';
  if (nowRevealed && !revealed) {
    revealed = true;
    addSysChip('Historial restaurado');
    let delay = 0;
    for (const row of msgRows) {
      if (row[5] === 'backstory') {
        renderRow(row, { delay });
        delay += 130;
      }
    }
  }
  if (!nowRevealed && revealed) {
    /* console re-hid the backstory (rehearsal reset): start over clean */
    revealed = false;
    rendered.clear();
    thread.innerHTML = '';
    exitLineSeen = false;
    meta = {};
    saveMeta();
    selfLikes = {};
    saveLikes();
    setOnline(true);
  }

  for (const row of msgRows) {
    if (row[5] === 'live') {
      renderRow(row);
      if (PROFILE.onlineUntilExitLine && row[1] === 'maxim' &&
          /se transfiere/.test(row[3] || '') && !exitLineSeen) {
        exitLineSeen = true;
        setTimeout(() => setOnline(false), 4000);
      }
    }
  }
}

/* ---------- sending ---------- */
const sendForm = document.getElementById('sendForm');
const sendInput = document.getElementById('sendInput');
const sendBtn = document.getElementById('sendBtn');
const micBtn = document.getElementById('micBtn');

sendInput.addEventListener('input', () => {
  const has = !!sendInput.value.trim();
  sendBtn.hidden = !has;
  micBtn.style.display = has ? 'none' : '';
});

sendForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = sendInput.value.trim();
  if (!text) return;
  const id = 'f' + Date.now();
  const ts = nowHM();
  meta[id] = {
    sent: Date.now(),
    seenMs: SEEN_MIN_MS + Math.floor(Math.random() * (SEEN_MAX_MS - SEEN_MIN_MS)),
    fireMs: Math.random() < FIRE_CHANCE ? 4000 + Math.floor(Math.random() * 26000) : 0,
  };
  saveMeta();
  sendInput.value = '';
  sendInput.dispatchEvent(new Event('input'));
  renderRow([id, 'billy', 'text', text, ts]);
  updateStatus();
  ES.appendRow('grindr', [id, 'billy', 'text', text, ts, 'live']).catch(() => {});
  ES.logEvent('grindr', 'fede_msg', text.slice(0, 60));
});

/* ---------- seen status + flame reactions ---------- */
const statusEl = document.createElement('div');
statusEl.className = 'msgStatus';

function setFlames(bubble, count) {
  let r = bubble.querySelector('.reaction');
  if (!count) {
    if (r) { r.remove(); bubble.classList.remove('hasReaction'); }
    return;
  }
  if (!r) {
    r = document.createElement('span');
    r.className = 'reaction';
    bubble.appendChild(r);
    bubble.classList.add('hasReaction');
  }
  const fires = '🔥'.repeat(count);
  if (r.textContent !== fires) r.textContent = fires;
}

function updateStatus() {
  const now = Date.now();
  let last = null; /* newest sent message that we have meta for */
  rendered.forEach((bubble, id) => {
    const m = meta[id];
    if (m && (!last || m.sent > meta[last].sent)) last = id;
    const maximFire = m && m.fireMs && now >= m.sent + m.seenMs + m.fireMs ? 1 : 0;
    setFlames(bubble, maximFire + (selfLikes[id] ? 1 : 0));
  });
  if (!last) { statusEl.remove(); return; }
  const m = meta[last];
  statusEl.textContent = now >= m.sent + m.seenMs ? 'Visto' : 'Enviado';
  const bubble = rendered.get(last);
  if (bubble.nextSibling !== statusEl) bubble.after(statusEl);
}
setInterval(updateStatus, 1000);

/* double-tap to like, on any bubble */
thread.addEventListener('dblclick', (e) => {
  const bubble = e.target.closest('.msg');
  if (!bubble || !bubble.dataset.id) return;
  const id = bubble.dataset.id;
  if (selfLikes[id]) delete selfLikes[id];
  else selfLikes[id] = 1;
  saveLikes();
  updateStatus();
});

(async () => {
  try {
    await ES.init();
    ES.poll(ESC_CONFIG.POLL_MS, () => sync().then(updateStatus));
  } catch (e) {
    console.error('chat sin conexión', e);
  }
})();
