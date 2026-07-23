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
  { t: 'Cómo funciona un candado por dentro (animación)', u: 'FisicaParaTodos', v: '312.554', d: '4:12' },
  { t: 'Top 10 candados que NADIE puede abrir', u: 'seguridadTOTAL', v: '1.204.881', d: '9:58' },
  { t: 'Mi colección de ganzúas (parte 3)', u: 'ganzua_master88', v: '8.113', d: '12:44' },
  { t: 'Abrir un candado con una lata de gaseosa (REAL)', u: 'trucos_caseros_ar', v: '2.877.410', d: '3:05' },
  { t: 'FNG vs candado de $200 - quién gana?', u: 'CovertInstruments', v: '95.230', d: '7:31' },
  { t: 'ASMR - picking de cerraduras 1 hora sin hablar', u: 'quiet_picks', v: '44.902', d: '58:20' },
  { t: 'Por qué tu candado de valija no sirve de nada', u: 'viajero_paranoico', v: '561.008', d: '6:47' },
];

const cWrap = document.getElementById('comments');
COMMENTS.forEach((c) => {
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
  cWrap.appendChild(div);
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
