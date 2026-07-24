/* YouTube 2008 — one video, canned comments and related list.
   Comments are content: Billy edits freely. The CovertInstruments reply about
   handcuffs is load-bearing (canon: the picks NEVER open the cuffs). */

const COMMENTS = [
  { u: 'ganzua_master88', ago: 'hace 2 días',
    t: 'el rastrillo es lo mejor para empezar, con el gancho me frustré al toque. buen video', up: 12 },
  { u: 'CandadoAbierto', ago: 'hace 5 días',
    t: 'lo probé con el candado transparente que viene y salió a la tercera!!! gracias xD', up: 8 },
  { u: 'sk8er_boi_2007', ago: 'hace 1 semana',
    t: 'primer comentario? jaja', up: -4 },
  { u: 'seguridad_hogar', ago: 'hace 1 semana',
    t: 'muy educativo. recuerden que esto es solo para candados PROPIOS.', up: 21 },
  { u: 'pibe_curioso', ago: 'hace 2 semanas',
    t: 'esto funciona con esposas??', up: 3 },
  { u: 'CovertInstruments', ago: 'hace 2 semanas', op: true,
    t: 'No. Las esposas usan otro mecanismo completamente distinto: las ganzúas NO abren esposas. Para esposas se usa la llave. Siempre la llave.', up: 45 },
  { u: 'pibe_curioso', ago: 'hace 2 semanas',
    t: 'ok ok era pregunta nomas jaja', up: 2 },
  { u: 'toolman_dave', ago: 'hace 3 semanas',
    t: 'great video, greetings from ohio. the FNG tensioner is criminally underrated', up: 9 },
  { u: 'lauri_tuc', ago: 'hace 1 mes',
    t: 'no me anda, hace 40 minutos que estoy. EDIT: era al revés el tensor. salió', up: 14 },
  { u: 'xXdark_angelXx', ago: 'hace 1 mes',
    t: '5 estrellas por la musica de fondo', up: 1 },
  { u: 'cerrajero_jubilado', ago: 'hace 1 mes',
    t: '40 años de profesión y este pibe lo explica mejor que mi maestro. tiempos modernos', up: 33 },
  { u: 'romi.bsas', ago: 'hace 2 meses',
    t: 'vine por un candado que perdí la llave y me quedé por el contenido', up: 6 },
  { u: 'el_tio_hector', ago: 'hace 2 meses',
    t: 'alguien mas mira esto sin tener ganzuas ni candado? jaja', up: 18 },
  { u: 'anon_1985', ago: 'hace 3 meses',
    t: 'volvé a subir el de cerraduras de puerta, lo bajaron :(', up: 5 },
];

const RELATED = [
  { t: 'Cómo abrir el corazón de un hombre (tutorial paso a paso)', u: 'divaDIY', v: '892.104', d: '5:33' },
  { t: 'GRWM para robar un banco 💅', u: 'iconic_thief', v: '2.104.667', d: '8:12' },
  { t: 'Me robaron el hígado en una cita de Grindr (STORYTIME)', u: 'suerte_la_mia', v: '1.556.203', d: '14:20' },
  { t: 'ASMR: te abro el cajón de la ropa interior susurrando', u: 'quiet_picks', v: '703.918', d: '41:08' },
  { t: 'Reaccionando a mi ex abriendo MI caja fuerte', u: 'dramaHD', v: '445.010', d: '11:47' },
  { t: 'Intenté picar un candado con uñas de gel (terminó MAL)', u: 'las_unias_de_wanda', v: '1.203.556', d: '6:02' },
  { t: 'POV: sos el candado y él tiene las ganzúas', u: 'thirst_traps_ok', v: '98.441', d: '2:15' },
];

const cWrap = document.getElementById('comments');

function commentNode(c) {
  const div = document.createElement('div');
  div.className = 'comment' + (c.op ? ' op' : '');
  const votes = c.up >= 0 ? '+' + c.up : String(c.up);
  div.innerHTML =
    '<div class="cAvatar"></div>' +
    '<div class="cBody">' +
      '<div class="cMeta"><a href="#" class="user"></a><span class="ago">' + c.ago + '</span></div>' +
      '<div class="cText"></div>' +
      '<div class="cFoot"><span class="cVotes">' + votes + '</span>' +
        '<a href="#">Responder</a> · <a href="#">Marcar como spam</a></div>' +
    '</div>';
  div.querySelector('.user').textContent = c.u;
  div.querySelector('.cText').textContent = c.t;
  return div;
}

/* user comments persist in localStorage (survive refresh) */
const YT_KEY = 'esc_yt_comments';
function loadMine() {
  try { return JSON.parse(localStorage.getItem(YT_KEY)) || []; } catch (e) { return []; }
}
function renderComments() {
  const mine = loadMine();
  cWrap.innerHTML = '';
  mine.forEach((c) => cWrap.appendChild(commentNode(c)));   /* newest of mine on top */
  COMMENTS.forEach((c) => cWrap.appendChild(commentNode(c)));
  document.getElementById('commentsCount').textContent =
    'Comentarios de texto (' + (COMMENTS.length + mine.length) + ')';
}
renderComments();

document.getElementById('cPost').addEventListener('click', () => {
  const text = document.getElementById('cText').value.trim();
  if (!text) return;
  const name = document.getElementById('cName').value.trim() || 'usuario' + Math.floor(Math.random() * 900 + 100);
  const mine = loadMine();
  mine.unshift({ u: name, ago: 'hace un momento', t: text, up: 0 });
  localStorage.setItem(YT_KEY, JSON.stringify(mine));
  document.getElementById('cText').value = '';
  renderComments();
});

const rWrap = document.getElementById('related');
RELATED.forEach((r) => {
  const div = document.createElement('div');
  div.className = 'rel';
  div.innerHTML =
    '<a href="#" class="thumb"><span class="dur">' + r.d + '</span></a>' +
    '<div class="relInfo"><a href="#" class="relTitle"></a>' +
      '<div class="quietTxt">De: ' + r.u + '<br>' + r.v + ' reproducciones</div></div>';
  div.querySelector('.relTitle').textContent = r.t;
  rWrap.appendChild(div);
});

/* video: play/pause + skip forward/back (native scrubber can be finicky) */
(function () {
  const v = document.getElementById('ytVideo');
  if (!v) return;
  const seek = (d) => { v.currentTime = Math.max(0, Math.min((v.duration || 1e9), v.currentTime + d)); };
  document.getElementById('ytBack').addEventListener('click', () => seek(-10));
  document.getElementById('ytFwd').addEventListener('click', () => seek(10));
  document.getElementById('ytPlay').addEventListener('click', () => { v.paused ? v.play() : v.pause(); });
})();
