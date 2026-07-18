/* CAM 07 — rooftop feed. The console is the only writer; this page derives
   the current frame from cctv_frame + elapsed time and never writes. */

const FRAME_COUNT = 10;

/* End cards are content — Billy edits. FONDOS line is bible-approved. */
const END_CARDS = {
  failure: 'FONDOS TRANSFERIDOS\nGRACIAS POR SU PREFERENCIA',
  getaway: 'PLACEHOLDER — placa final de fuga',
};

/* Fake clock: the timestamp starts at this wall-clock time on boot and ticks. */
const CAM_START = new Date();

const frameImg = document.getElementById('frame');
const noSignal = document.getElementById('noSignal');
const endCard = document.getElementById('endCard');
const endInner = document.getElementById('endInner');
const sting = document.getElementById('sting');

let state = null;
let shownFrame = -1;
let booted = false;

function num(v, fb) { const n = parseFloat(v); return Number.isFinite(n) ? n : fb; }

function derivedFrame(now = Date.now()) {
  if (!state) return 0;
  const frame = num(state.cctv_frame, 0);
  if (state.cctv_mode !== 'running') return frame;
  const interval = Math.max(1, num(state.cctv_interval_s, 360)) * 1000;
  return Math.min(FRAME_COUNT - 1, frame + Math.floor((now - num(state.cctv_frame_ts, now)) / interval));
}

function showFrame(i, silent) {
  if (i === shownFrame) return;
  shownFrame = i;

  const src = 'img/frame' + String(i + 1).padStart(2, '0') + '.jpg';
  const probe = new Image();
  probe.onload = () => {
    noSignal.hidden = true;
    frameImg.src = src;
    frameImg.classList.remove('swap');
    void frameImg.offsetWidth;
    frameImg.classList.add('swap');
  };
  probe.onerror = () => {
    frameImg.removeAttribute('src');
    noSignal.hidden = false;
  };
  probe.src = src;

  if (!silent && booted) {
    sting.currentTime = 0;
    sting.play().catch(() => {});
    const tear = document.getElementById('tear');
    tear.classList.remove('go');
    void tear.offsetWidth;
    tear.classList.add('go');
  }
}

function render() {
  if (!state || !booted) return;
  const mode = state.cctv_mode || 'idle';

  if (mode === 'failure' || mode === 'getaway') {
    endInner.textContent = END_CARDS[mode];
    endCard.hidden = false;
    if (mode === 'getaway') showFrame(FRAME_COUNT - 1, true);
    return;
  }
  endCard.hidden = true;
  showFrame(derivedFrame(), shownFrame === -1);
}

/* ticking timestamp */
function tickClock() {
  const d = new Date(CAM_START.getTime() + (Date.now() - CAM_START.getTime()));
  const p = (n) => String(n).padStart(2, '0');
  document.getElementById('timestamp').textContent =
    p(d.getDate()) + '/' + p(d.getMonth() + 1) + '/' + d.getFullYear() + ' ' +
    p(d.getHours()) + ':' + p(d.getMinutes()) + ':' + p(d.getSeconds());
}
setInterval(tickClock, 1000);
tickClock();

/* occasional tear glitch */
setInterval(() => {
  if (!booted || Math.random() > 0.3) return;
  const tear = document.getElementById('tear');
  tear.classList.remove('go');
  void tear.offsetWidth;
  tear.classList.add('go');
}, 9000);

document.getElementById('bootBtn').addEventListener('click', () => {
  /* user gesture unlocks audio for later stings */
  sting.play().then(() => { sting.pause(); sting.currentTime = 0; }).catch(() => {});
  document.getElementById('boot').hidden = true;
  document.getElementById('monitor').hidden = false;
  booted = true;
  render();
});

setInterval(render, 1000);

(async () => {
  try {
    await ES.init();
    ES.poll(ESC_CONFIG.POLL_MS, async () => {
      state = await ES.readState();
      render();
    });
  } catch (e) {
    console.error('cctv sin conexión', e);
  }
})();
