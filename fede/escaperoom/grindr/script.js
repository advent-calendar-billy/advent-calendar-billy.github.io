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

(async () => {
  try {
    await ES.init();
    ES.poll(ESC_CONFIG.POLL_MS, sync);
  } catch (e) {
    console.error('chat sin conexión', e);
  }
})();
