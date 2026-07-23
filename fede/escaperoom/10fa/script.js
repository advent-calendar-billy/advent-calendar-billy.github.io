/* Verificación Reforzada — sequential factor engine. */

const card = document.getElementById('factorCard');

/* ---------- bank chrome ---------- */
document.getElementById('brandName').textContent = BANK.name;
document.getElementById('userChip').textContent = BANK.holder;
document.getElementById('acctMask').textContent = BANK.accountMask;
document.getElementById('tAmount').textContent = TRANSFER.amount;
document.getElementById('tDest').textContent = 'Destino: ' + TRANSFER.dest;
document.getElementById('tStatus').textContent = TRANSFER.status;
document.getElementById('helpPhone').textContent = BANK.supportPhone;
(() => {
  const y = new Date(Date.now() - 86400000);
  document.getElementById('lastLogin').textContent =
    'Último acceso: ' + y.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' }) +
    ', 21:14\nDispositivo reconocido';
  document.getElementById('footLegal').textContent =
    BANK.name + ' N.A. Todos los derechos reservados. Miembro FDIC. Prestamista de igualdad ' +
    'de oportunidades. Las operaciones en línea están sujetas a verificación y pueden demorar. ' +
    'La entidad no se responsabiliza por daños emocionales derivados del proceso de verificación. ' +
    'Cód. de soporte ' + BANK.supportCode + '.';
})();

let idx = parseInt(localStorage.getItem('esc_10fa_idx') || '0', 10);
let lastNonce = parseInt(localStorage.getItem('esc_10fa_nonce') || '0', 10);
let waitingFactor = null;   /* id of factor in VERIFYING state */

/* ---------- utils ---------- */
function normalize(s) {
  return s.toLowerCase().trim().replace(/\s+/g, ' ');
}
async function sha256(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}
function elh(tag, cls, html) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (html !== undefined) n.innerHTML = html;
  return n;
}
function factorCode(i) {
  return 'Formulario ' + BANK.supportCode + '-' + String(i + 1).padStart(2, '0');
}

/* ---------- ads ---------- */
const adCol = document.getElementById('adCol');
ADS.forEach((ad) => {
  const box = elh('div', 'ad');
  box.append(
    elh('div', 'tagLine', 'Publicidad'),
    elh('h3', '', ad.head),
    elh('p', '', ad.body),
    elh('button', 'cta', ad.cta)
  );
  box.querySelector('.cta').addEventListener('click', () => {});
  adCol.appendChild(box);
});

/* ---------- steps rail ---------- */
function renderStepper() {
  const rail = document.getElementById('stepsRail');
  rail.innerHTML = '';
  FACTORS.forEach((f, i) => {
    const li = elh('li', i < idx ? 'done' : i === idx ? 'now' : '');
    li.append(elh('span', 'dot'), document.createTextNode(f.title));
    rail.appendChild(li);
  });
  document.getElementById('stepLabel').textContent =
    idx < FACTORS.length ? 'Factor ' + (idx + 1) + ' de ' + FACTORS.length : 'Verificación completa';
}

/* ---------- pass / fail ---------- */
function persist() {
  localStorage.setItem('esc_10fa_idx', String(idx));
  ES.setState('tenfa_current', idx).catch(() => {});
}

function pass() {
  waitingFactor = null;
  idx += 1;
  persist();
  if (idx >= FACTORS.length) return complete();
  /* brief bank-grade processing shim between factors */
  renderStepper();
  card.innerHTML = '';
  const shim = elh('div', 'processing');
  shim.append(elh('div', 'pbar', '<i></i>'), elh('div', '', 'Factor verificado. Cargando el siguiente paso...'));
  card.appendChild(shim);
  setTimeout(renderFactor, 700);
}

function fail(factor, msg) {
  waitingFactor = null;
  renderFactor();
  const box = elh('div', 'errorBox',
    (msg || factor.errorMsg || 'No fue posible validar el factor.') +
    '<div class="eCode">Código ' + BANK.supportCode + '-' + Math.floor(100 + Math.random() * 900) + '. Reintente.</div>');
  card.appendChild(box);
}

function complete() {
  renderStepper();
  ES.setState('tenfa_complete', '1').catch(() => {});
  ES.logEvent('10fa', 'complete');
  document.getElementById('doneRef').textContent =
    'Ref. ' + Date.now().toString(36).toUpperCase() + '-' + BANK.supportCode;
  document.getElementById('doneOverlay').hidden = false;
}

/* ---------- widget renderers ---------- */
const WIDGETS = {
  dropdown(f, mount) {
    const sel = elh('select', 'fInput');
    f.options.forEach((o) => sel.appendChild(new Option(o, o)));
    const btn = elh('button', 'primary', 'Verificar');
    btn.addEventListener('click', () => {
      if (sel.value === f.correct) pass();
      else fail(f);
    });
    mount.append(sel, btn);
  },

  emotion(f, mount) {
    const list = elh('div', 'emotionList');
    EMOTIONS.forEach((e, i) => {
      const label = elh('label');
      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = 'emotion';
      radio.value = String(i);
      label.append(radio, document.createTextNode(e.label));
      list.appendChild(label);
    });
    const btn = elh('button', 'primary', 'Declarar estado');
    btn.addEventListener('click', () => {
      const chosen = list.querySelector('input:checked');
      if (chosen && EMOTIONS[+chosen.value].ok) pass();
      else fail(f);
    });
    mount.append(list, btn);
  },

  captcha(f, mount) {
    const grid = elh('div', 'capGrid');
    const selected = new Set();
    for (let i = 0; i < f.images; i++) {
      const b = elh('button', '', '');
      b.type = 'button';
      b.style.backgroundImage = "url('img/captcha/c" + (i + 1) + ".jpg')";
      b.textContent = '';
      const probe = new Image();
      probe.onerror = () => { b.textContent = 'FOTO ' + (i + 1); };
      probe.src = 'img/captcha/c' + (i + 1) + '.jpg';
      b.addEventListener('click', () => {
        if (selected.has(i)) { selected.delete(i); b.classList.remove('sel'); }
        else { selected.add(i); b.classList.add('sel'); }
      });
      grid.appendChild(b);
    }
    const btn = elh('button', 'primary', 'Confirmar selección');
    btn.addEventListener('click', () => {
      const ok = f.correct.length === selected.size && f.correct.every((i) => selected.has(i));
      if (ok) pass();
      else fail(f);
    });
    mount.append(grid, btn);
  },

  hold(f, mount) {
    const btn = elh('button', 'holdBtn', 'MANTENER PRESIONADO');
    const ring = elh('div', 'holdRing');
    const bar = elh('i');
    ring.appendChild(bar);
    let timer = null;
    let t0 = 0;

    const stop = (reached) => {
      if (timer === null) return;
      clearInterval(timer);
      timer = null;
      if (reached) {
        pass();
      } else {
        bar.style.width = '0%';
        fail(f);
      }
    };

    btn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      btn.setPointerCapture(e.pointerId);
      t0 = Date.now();
      timer = setInterval(() => {
        const s = (Date.now() - t0) / 1000;
        bar.style.width = Math.min(100, (s / f.seconds) * 100) + '%';
        if (s >= f.seconds) stop(true);
      }, 90);
    });
    btn.addEventListener('pointerup', () => stop((Date.now() - t0) / 1000 >= f.seconds));
    btn.addEventListener('pointercancel', () => stop(false));
    mount.append(btn, ring);
  },

  phoneslider(f, mount) {
    const digits = f.digits || 10;
    const max = Math.pow(10, digits) - 1;
    let v = 0;
    const clamp = (n) => Math.max(0, Math.min(max, n));

    const val = elh('div', 'phoneVal', '');
    const show = () => {
      val.textContent = String(v).padStart(digits, '0').replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
      slider.value = String(v);
    };

    /* coarse slider (steps of a million just for flinging into the ballpark) */
    const slider = document.createElement('input');
    slider.type = 'range';
    slider.className = 'phoneSlider';
    slider.min = '0';
    slider.max = String(max);
    slider.step = '1000000';
    slider.value = '0';
    slider.addEventListener('input', () => { v = clamp(+slider.value); show(); });

    /* place-value nudge grid: reach any exact number in ≈(sum of digits) taps */
    const mags = [1000000000, 100000000, 10000000, 1000000, 100000, 10000, 1000, 100, 10, 1];
    const label = (m) => (m >= 1e9 ? (m / 1e9) + 'MM' : m >= 1e6 ? (m / 1e6) + 'M' : m >= 1e3 ? (m / 1e3) + 'k' : String(m));
    const grid = elh('div', 'phoneGrid');
    ['+', '−'].forEach((sign) => {
      mags.forEach((m) => {
        const b = elh('button', 'nudge', sign + label(m));
        b.type = 'button';
        b.addEventListener('click', () => { v = clamp(v + (sign === '+' ? m : -m)); show(); });
        grid.appendChild(b);
      });
    });

    show();

    const btn = elh('button', 'primary', 'Confirmar número');
    btn.addEventListener('click', () => {
      if (f.expected == null || v === f.expected) pass();
      else fail(f, 'El número no coincide con el registrado.');
    });
    mount.append(val, slider, grid, btn);
  },

  phonecall(f, mount) {
    /* password-gated "call me" trigger (writes call_requested; the laptop daemon
       dials Billy's phone). The password (Billy's birthday) stops random abuse. */
    const callBox = elh('div', 'callBox');
    const bdayLabel = elh('span', 'bdayLabel', 'Cumpleaños del titular:');
    const pw = elh('input', 'fInput');
    pw.type = 'date';
    const callBtn = elh('button', 'primary', 'Llamarme');
    const callMsg = elh('div', 'callMsg');
    const requestCall = async () => {
      if (!pw.value) { callMsg.textContent = 'Elija una fecha.'; return; }
      const [, mm, dd] = pw.value.split('-');   /* YYYY-MM-DD → MMDD, ignora el año */
      const h = await sha256(mm + dd);
      if (h !== f.callHash) { callMsg.textContent = 'Fecha incorrecta.'; return; }
      callBtn.disabled = true;
      callMsg.textContent = 'Solicitando la llamada... atienda su teléfono en unos segundos.';
      try {
        await ES.setState('call_requested', String(Date.now()));
        ES.logEvent('10fa', 'call_requested');
      } catch (e) {
        callMsg.textContent = 'No se pudo solicitar la llamada. Reintente.';
        callBtn.disabled = false;
        return;
      }
      setTimeout(() => { callBtn.disabled = false; callMsg.textContent += ' (Puede reintentar.)'; }, 25000);
    };
    callBtn.addEventListener('click', requestCall);
    pw.addEventListener('keydown', (e) => { if (e.key === 'Enter') requestCall(); });
    callBox.append(bdayLabel, pw, callBtn);
    mount.append(callBox, callMsg);

    /* code entry (the code the phone tree dictates at the end) */
    const codeLabel = elh('div', 'fPrompt', 'Ingrese el código que le dictaron por teléfono:');
    codeLabel.style.marginTop = '14px';
    const input = elh('input', 'fInput');
    input.type = 'text';
    input.autocomplete = 'off';
    const btn = elh('button', 'primary', 'Verificar');
    const submit = async () => {
      const h = await sha256(normalize(input.value));
      if (h === f.hash) pass();
      else fail(f);
    };
    btn.addEventListener('click', submit);
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') submit(); });
    mount.append(codeLabel, input, btn);
  },

  party(f, mount) {
    const wrap = elh('div', 'partyForm');
    const inputs = [];
    f.fields.forEach((fld) => {
      const row = elh('label', 'partyRow');
      row.appendChild(elh('span', 'partyLabel', fld.label));
      const inp = elh('input', 'fInput');
      inp.type = 'text';
      inp.autocomplete = 'off';
      row.appendChild(inp);
      inputs.push(inp);
      wrap.appendChild(row);
    });
    const btn = elh('button', 'primary', 'Continuar');
    btn.addEventListener('click', () => {
      if (inputs.every((i) => i.value.trim())) pass();   /* no se valida el contenido */
      else fail(f, f.errorMsg || 'Complete los campos.');
    });
    mount.append(wrap, btn);
  },

  terms(f, mount) {
    const box = elh('div', 'termsBox');
    const clauses = (typeof TERMS_CLAUSES !== 'undefined') ? TERMS_CLAUSES : [];
    clauses.forEach((text, i) => {
      box.appendChild(elh('p', '', '<b>Cláusula ' + (i + 1) + '.</b> ' + text));
    });
    if (typeof TERMS_FINE !== 'undefined') {
      /* the fine-print clause: deliberately tiny and near-illegible */
      const fine = elh('p', '', '<b>Cláusula ' + (clauses.length + 1) + '.</b> ' + TERMS_FINE);
      fine.style.fontSize = '5px';
      fine.style.color = '#aaa';
      fine.style.lineHeight = '1.1';
      box.appendChild(fine);
    }
    const check = elh('label', 'termsCheck');
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.disabled = true;
    check.append(cb, document.createTextNode(f.checkbox));
    box.addEventListener('scroll', () => {
      if (box.scrollTop + box.clientHeight >= box.scrollHeight - 8) cb.disabled = false;
    });
    const btn = elh('button', 'primary', 'Aceptar');
    btn.addEventListener('click', () => {
      if (cb.checked) pass();
      else fail(f, 'Debe leer los términos hasta el final y aceptar la declaración.');
    });
    mount.append(box, check, btn);
  },

  signature(f, mount) {
    const canvas = elh('canvas', 'sigPad');
    let drawing = false;
    let ink = 0;
    const sizeCanvas = () => {
      const r = canvas.getBoundingClientRect();
      canvas.width = r.width * devicePixelRatio;
      canvas.height = r.height * devicePixelRatio;
      const ctx = canvas.getContext('2d');
      ctx.scale(devicePixelRatio, devicePixelRatio);
      ctx.lineWidth = 2.4;
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#17212e';
    };
    requestAnimationFrame(sizeCanvas);

    const pos = (e) => {
      const r = canvas.getBoundingClientRect();
      return [e.clientX - r.left, e.clientY - r.top];
    };
    canvas.addEventListener('pointerdown', (e) => {
      drawing = true;
      canvas.setPointerCapture(e.pointerId);
      const ctx = canvas.getContext('2d');
      ctx.beginPath();
      ctx.moveTo(...pos(e));
    });
    canvas.addEventListener('pointermove', (e) => {
      if (!drawing) return;
      const ctx = canvas.getContext('2d');
      ctx.lineTo(...pos(e));
      ctx.stroke();
      ink += 1;
    });
    canvas.addEventListener('pointerup', () => { drawing = false; });

    const actions = elh('div', 'sigActions');
    const clear = elh('button', 'ghost', 'Borrar');
    clear.addEventListener('click', () => { sizeCanvas(); ink = 0; });
    const btn = elh('button', 'primary', 'Certificar firma');
    btn.addEventListener('click', () => {
      if (ink > 60) pass();
      else fail(f, 'La firma no presenta el trazo mínimo requerido.');
    });
    actions.append(btn, clear);
    mount.append(canvas, actions);
  },
};

/* ---------- factor card ---------- */
function renderFactor() {
  renderStepper();
  card.innerHTML = '';
  const f = FACTORS[idx];
  if (!f) return;

  card.append(
    elh('h2', 'fTitle', f.title),
    elh('div', 'fCode', factorCode(idx)),
    elh('p', 'fPrompt', f.prompt)
  );
  const mount = elh('div');
  card.appendChild(mount);

  if (f.type === 'widget') {
    WIDGETS[f.widget](f, mount);
  } else if (f.type === 'answer') {
    const input = elh('input', 'fInput');
    input.type = f.input;
    input.autocomplete = 'off';
    const btn = elh('button', 'primary', 'Verificar');
    const submit = async () => {
      const h = await sha256(normalize(input.value));
      if (h === f.hash) pass();
      else fail(f);
    };
    btn.addEventListener('click', submit);
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') submit(); });
    mount.append(input, btn);
    input.focus();
  } else if (f.type === 'attest') {
    const btn = elh('button', 'primary', f.button);
    btn.addEventListener('click', () => pass());
    mount.appendChild(btn);
  } else if (f.type === 'billy') {
    const btn = elh('button', 'primary', f.button || 'Verificar');
    btn.addEventListener('click', () => startVerifying(f, mount));
    mount.appendChild(btn);
  }
}

function startVerifying(f, mount) {
  waitingFactor = f.id;
  mount.innerHTML = '';
  const wrap = elh('div', 'verifying');
  if (f.id === 'higado') wrap.appendChild(elh('div', 'scanZone'));
  else wrap.appendChild(elh('div', 'spinner'));
  wrap.appendChild(elh('div', 'fPrompt', f.id === 'higado'
    ? 'Validando constancia fotográfica. No recupere el residuo.'
    : 'Verificando. Aguarde.'));
  mount.appendChild(wrap);
  ES.setStateBlock('tenfa_pending', [f.id, '—']).catch(() => {
    waitingFactor = null;
    fail(f, 'No fue posible contactar al centro de verificación.');
  });
  ES.logEvent('10fa', 'pending', f.id);
}

/* ---------- verdict + remote-reset polling ---------- */
async function syncState() {
  const state = await ES.readState();

  /* remote reset from the console */
  if (state.tenfa_current === '0' && idx > 0 && !state.tenfa_pending && state.tenfa_complete === '0') {
    idx = 0;
    waitingFactor = null;
    lastNonce = 0;
    localStorage.setItem('esc_10fa_nonce', '0');
    localStorage.setItem('esc_10fa_idx', '0');
    document.getElementById('doneOverlay').hidden = true;
    renderFactor();
    return;
  }

  if (!waitingFactor) return;
  const m = /^(approve|reject):([^:]+):(\d+)$/.exec(state.tenfa_verdict || '');
  if (!m) return;
  const [, kind, fid, nonceS] = m;
  const nonce = parseInt(nonceS, 10);
  if (fid !== waitingFactor || nonce <= lastNonce) return;

  lastNonce = nonce;
  localStorage.setItem('esc_10fa_nonce', String(nonce));
  const f = FACTORS[idx];
  ES.setStateBlock('tenfa_pending', ['', '']).catch(() => {});
  if (kind === 'approve') pass();
  else fail(f);
}

/* ---------- boot ---------- */
(async () => {
  try {
    await ES.init();
    renderFactor();
    if (idx >= FACTORS.length) complete();
    ES.poll(ESC_CONFIG.POLL_MS, syncState);
  } catch (e) {
    console.error(e);
    card.innerHTML = '<div class="errorBox">Servicio momentáneamente no disponible.</div>';
  }
})();
