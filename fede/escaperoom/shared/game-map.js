/* AUTO-USED BY produccion.html AND consola — single source of the game map. */
const CHAIN = { tub:'#1D9E75', diary:'#D4537E', test:'#D85A30', hub:'#7F77DD', choice:'#A32D2D', misc:'#8a8780' };
const NODES = [
  // --- diary lane ---
  { id:'magnets', x:0, y:0, c:'diary', t:'thing', label:'Imanes de la heladera', sub:'LONG KISS → SILKSONG',
    idea:'Los imanes deletrean LONG KISS. Reordenado se lee SILKSONG (Hollow Knight 2), que apunta a tu peluche de Hollow Knight: la llave del diario está debajo. Doble sentido con el beso.',
    todo:'DECIDIDO (tu idea). FÍSICO: armá "LONG KISS" con los imanes (letras L,O,N,G,K,I,S,S — verificar el pack) y poné la llave bajo el peluche de HK.', sec:'lugares' },
  { id:'vicky', x:1, y:0, c:'diary', t:'thing', label:'Video de Vicky', sub:'en la cartelera',
    idea:'En la cartelera del consorcio, la "vecina preocupada" del 9B cuenta que vio un tipo raro, se le cayó algo, y dejó tu diario en el buzón. Es el video útil escondido entre los señuelos.',
    todo:'LISTO: el video ya está en la cartelera.' },
  { id:'a_decode', x:0, y:1, c:'diary', t:'act', label:'Fede decodifica', sub:'el anagrama', deps:['magnets'],
    idea:'Fede desordena cada palabra del anagrama de la heladera y lee la ubicación de la llave. Es un rompecabezas a la vista, sin candado.',
    todo:'RUNTIME: pasa en el juego. Depende de que definas la frase.' },
  { id:'a_getdiary', x:1, y:1, c:'diary', t:'act', label:'Fede saca el diario', sub:'del buzón', deps:['vicky'],
    idea:'Guiado por el video de Vicky, Fede va al buzón y encuentra el diario cerrado con llave. Es un blocker duro: adentro está el orden de los patos.',
    todo:'RUNTIME. FÍSICO: dejá el diario cerrado en el buzón.' },
  { id:'diarykey', x:0, y:2, c:'diary', t:'thing', label:'Llave del diario', sub:'bajo el peluche de HK', deps:['a_decode'],
    idea:'La llave del diario está debajo de tu peluche de Hollow Knight. Los imanes (LONG KISS → SILKSONG = HK2) apuntan ahí.',
    todo:'DECIDIDO: bajo el peluche de HK. FÍSICO: dejala ahí.', sec:'lugares' },
  { id:'a_opendiary', x:1, y:3, c:'diary', t:'act', label:'Fede abre el diario', sub:'lee la prosa de patos', deps:['a_getdiary','diarykey'],
    idea:'Con el diario y su llave, Fede lo abre y lee tu prosa insufriblemente erótica sobre los patos. La innuendo codifica el orden de llegada (Tim primero, etc.).',
    todo:'LISTO: el diario ya está escrito (CAGIE). Texto en el Doc "sala de escape" / pestaña Patitos.', sec:'diario' },
  // --- tub (flor a 0 → baño; sin testamento) ---
  { id:'kiss', x:4, y:0, c:'tub', t:'thing', label:'Beso olvidado', sub:'la flor llega a 0',
    idea:'La app de la felicidad drena sola; le dijiste a Fede que besarte la recarga. Si se olvida, llega a cero y "morís". Ahí, en vez de dictar un testamento, simplemente pedís que te llenen la bañera. (El testamento se canceló, Jul 23.)',
    todo:'DISPARÁS vos desde la consola (CAER PÉTALO / FLATLINE) hacia la mitad del juego; después pedís el baño.' },
  { id:'plug', x:2, y:0, c:'tub', t:'thing', label:'Tapón de la bañera', sub:'en el ajedrez',
    idea:'Maxim se llevó el tapón "para que no te ahogues, tan considerado". Fede lo encuentra dentro de tu tablero de ajedrez.',
    todo:'DECIDIDO: dentro del ajedrez. FÍSICO: ponelo ahí.', sec:'lugares' },
  { id:'vase', x:3, y:0, c:'tub', t:'thing', label:'Florero verde', sub:'flota la PrEP',
    idea:'El florero verde tiene la píldora PrEP sellada en un pedazo de pajita; el aire atrapado la hace flotar. Fede llena el florero de agua hasta que la píldora sube.',
    todo:'ARMÁS: pastilla en pajita sellada, florero pegado al mostrador con masilla. Probar que flote en un vaso.' },
  { id:'a_filltub', x:3, y:2, c:'tub', t:'act', label:'Fede llena la bañera', sub:'tapón + PrEP + flor a 0', deps:['plug','vase','kiss'],
    idea:'Con el tapón encontrado, la PrEP recuperada y la flor en cero (ahí pedís el baño), arranca la secuencia de la bañera. Sin testamento de por medio.',
    todo:'RUNTIME / GATILLO: cuando la flor llega a cero, pedís que te llenen la bañera.' },
  { id:'a_ducks', x:3, y:3, c:'tub', t:'act', label:'Aparecen los patos', sub:'anunciás la carrera', deps:['a_filltub'],
    idea:'Bañera llena, sacás los patos de goma (con nombre en sharpie) y anunciás que vas a hacerlos correr. Ahí el diario "hace clic".',
    todo:'ESCRIBÍS: los números en cada pato (Tim=4 Dave=2 Dick=5 James=1 Jack=3).', sec:'patos' },
  { id:'code', x:3, y:4, c:'tub', t:'thing', label:'Código de patos', sub:'4-2-5-1-3', deps:['a_ducks','a_opendiary'],
    idea:'El orden de llegada (del diario) leído como los números de los patos da el PIN del teléfono: 4-2-5-1-3. Es la llave del factor telefónico.',
    todo:'LISTO: el árbol de Bland ya usa 4-2-5-1-3.', sec:'patos' },
  // --- liver lane (una sola cerradura) ---
  { id:'acrylickey', x:2, y:2, c:'test', t:'thing', label:'Llave del candado', sub:'en un condón abierto',
    idea:'La llave del único candado está dentro de un paquete de condón abierto (la dejás ahí). Lugar difícil/incómodo de revisar: la ruta alternativa al picking.',
    todo:'DECIDIDO: dentro de un paquete de condón abierto. FÍSICO: dejá la llave ahí.', sec:'lugares' },
  { id:'picks', x:5, y:2, c:'test', t:'thing', label:'Púas FNG', sub:'entre otras herramientas',
    idea:'El set de púas FNG para picar el único candado. Van mezcladas con herramientas irrelevantes, así que Fede tiene que reconocer cuáles sirven. Lugar fácil; la dificultad está en usarlas.',
    todo:'DECIDIDO: mezcladas con herramientas irrelevantes. FÍSICO: armá el set con distractores.', sec:'lugares' },
  { id:'a_padlock', x:5, y:3, c:'test', t:'act', label:'Fede abre el candado', sub:'púas O llave', deps:['picks','acrylickey'],
    idea:'El candado acrílico sella la bolsa del hígado — es la ÚNICA cerradura del juego. Fede elige UNA ruta: picarlo con las púas (fáciles de encontrar, difícil de usar; lo coacheás desde el toallero) o abrir con la llave (escondida difícil). Nunca abre las esposas.',
    todo:'FÍSICO: candado acrílico sellando la bolsa del hígado.' },
  { id:'liver', x:5, y:4, c:'test', t:'act', label:'Fede guarda el hígado', sub:'al freezer', deps:['a_padlock'],
    idea:'Fede saca el hígado (la mejor pieza del set Lansian) y lo guarda en el freezer, a salvo... por ahora. Los otros órganos son señuelos repartidos.',
    todo:'DECIDÍS: los escondites de los órganos señuelo (me los pasás). FÍSICO: bolsa colgada en el placard.', sec:'lugares' },
  // --- 10FA: los factores reales (fila 1) ---
  { id:'captcha', x:0, y:5, c:'hub', t:'thing', label:'Factor: captcha', sub:'REAL · identificar a Maxim',
    idea:'El banco pide "seleccione al sospechoso" en una grilla 3×3 de tipos igual de camp. Fede reconoce a Maxim porque lo vio en el CCTV.',
    todo:'LISTO: grilla instalada, la respuesta es la ficha 6.' },
  { id:'gym', x:1, y:5, c:'hub', t:'thing', label:'Factor: nombre', sub:'REAL · carnet John Greed',
    idea:'El banco pide el nombre legal del sospechoso: Maxim Sekuestrov, que sale del carnet del gimnasio John Greed.',
    todo:'LISTO: carnet en el Doc. FÍSICO: va bajo el mousepad.' },
  { id:'mirror', x:2, y:5, c:'hub', t:'thing', label:'Factor: contraseña', sub:'REAL · espejo empañado',
    idea:'Tu "sistema de seguridad infalible": la contraseña "fedeteamo" en el espejo, invisible hasta que se empaña. La escribís EN VIVO con jabón (Dove) cuando te bañás durante la secuencia de la bañera; no está pre-escrita, aparece con el vapor.',
    todo:'LISTO: clave "fedeteamo". EN VIVO: la escribís con jabón mientras te bañás (aparece con el vapor).' },
  { id:'f_phone', x:3, y:5, c:'hub', t:'act', label:'Factor: verificación telefónica', sub:'REAL · decís los patos', deps:['code'],
    idea:'El banco te llama al celular y navegás el árbol diciendo los números de los patos en orden. Al llegar al final, la voz DICTA un código de 5 dígitos (40719). Fede lo escucha y lo escribe en el factor "Código de verificación telefónica" de la app. Las opciones equivocadas te mandan a música de espera.',
    todo:'LISTO Y CABLEADO: la llamada dicta "40719" y hay un factor en la app que pide ese código. Botón LLAMADA en la consola + daemon en la laptop.' },
  // --- 10FA: los factores cómicos (fila 2) ---
  { id:'robot', x:4, y:5, c:'hub', t:'thing', label:'Factor: ¿es un robot?', sub:'cómico',
    idea:'Dropdown "¿Es usted un robot?". Solo "NO" pasa; "SÍ" y "PREFIERO NO DECIRLO" fallan.',
    todo:'LISTO.' },
  { id:'emotion', x:0, y:6, c:'hub', t:'thing', label:'Factor: emoción', sub:'cómico',
    idea:'Elegís tu estado emocional entre ~28 (en clave de pánico financiero, no de desamor). Solo "CON MIEDO A PERDER DINERO" pasa.',
    todo:'LISTO (cableado).', sec:'emociones' },
  { id:'hold', x:1, y:6, c:'hub', t:'thing', label:'Factor: compromiso', sub:'cómico',
    idea:'Mantené el botón 10 segundos para "demostrar compromiso con tus fondos". La primera vez el banco "pierde la lectura" en el segundo 9 y arrancás de nuevo.',
    todo:'LISTO.' },
  { id:'party', x:6, y:5, c:'hub', t:'thing', label:'Factor: las partes', sub:'cómico · nombres',
    idea:'Paso previo al teléfono: Fede escribe el nombre del TITULAR y del SOLICITANTE (no se valida). Sirve para que después entienda las cláusulas ("el solicitante acepta que el titular...").',
    todo:'LISTO: dos campos de texto sin validación.' },
  { id:'phoneslider', x:2, y:6, c:'hub', t:'thing', label:'Factor: teléfono del titular', sub:'cómico',
    idea:'"Ingrese el número de teléfono del titular" con un slider imposible + botones de valor posicional (+1M, +100, etc.). Pide EXACTAMENTE tu número (781-323-9630); Fede lo sabe, entrarlo con el slider es el castigo. Se puede en <1 min pero es tedioso.',
    todo:'LISTO: pide 7813239630, con botones para que sea posible en menos de un minuto.' },
  { id:'tc', x:3, y:6, c:'hub', t:'thing', label:'Factor: T&C', sub:'cómico',
    idea:'Scrolleás los términos absurdos y aceptás "Acepto que en parte fue mi culpa". Las cláusulas camp ya están cableadas (incl. "acepto tener hijos" en letra minúscula).',
    todo:'LISTO (cláusulas cableadas).', sec:'terms' },
  { id:'heart', x:4, y:6, c:'hub', t:'thing', label:'Factor: firma', sub:'cómico',
    idea:'Dibujás un corazón roto en el recuadro para "certificar la operación".',
    todo:'LISTO.' },
  { id:'phonecode', x:5, y:6, c:'hub', t:'thing', label:'Factor: verificación telefónica', sub:'REAL · botón llamarme + código', deps:['f_phone'],
    idea:'Fede toca "Llamarme" (con una clave para que internet no abuse: tu cumple, 2111 / 21-11) y la app dispara la llamada Bland a tu teléfono. Navega el árbol con los patos, la voz dicta 40719, y lo escribe acá. Ya no hace falta la consola para llamar.',
    todo:'LISTO Y CABLEADO: botón Llamarme (clave 2111) + código 40719.' },
  { id:'tenfa', x:3, y:7, c:'hub', t:'thing', label:'10FA casi completo', sub:'falta el hígado',
    deps:['captcha','gym','mirror','f_phone','phonecode','robot','emotion','hold','party','phoneslider','tc','heart'],
    idea:'El hub del juego: junta los factores de arriba (reales + cómicos). Queda uno solo: el hígado. El nombre "10 Factores" es marketing del banco; el conteo real puede variar (un banco que sobre-cuenta su seguridad es on-brand).',
    todo:'RUNTIME: se completa cuando Fede pasa cada factor.' },
  // --- clímax ---
  { id:'choice', x:5, y:8, c:'choice', t:'thing', label:'Inserte un hígado', sub:'LA elección', deps:['tenfa','liver'],
    idea:'El clímax: el factor final pide una foto del hígado en la basura para cancelar la transferencia. Fede tiene que sacar el hígado del freezer (deshacer su buena acción) y tirarlo. Salvar la plata arruina el hígado.',
    todo:'LISTO: texto del factor cargado. Vos aprobás la foto desde la consola.' },
  { id:'final', x:5, y:9, c:'misc', t:'thing', label:'Mensaje final de Maxim', sub:'se transfiere', deps:['choice'],
    idea:'Cuando Fede cancela, llega en vivo el último mensaje de Maxim al chat: "el amor no se roba. se transfiere."',
    todo:'LISTO: botón en la consola.' },
];

/* ---------- shared game dependency map (produccion.html + consola) ---------- */
window.GameMap = (function () {
  const SVGNS = 'http://www.w3.org/2000/svg';
  const NW = 138, NH = 50, GAPX = 22, GAPY = 34, PADX = 14, PADY = 14;
  const byId = Object.fromEntries(NODES.map(n => [n.id, n]));
  const nx = n => PADX + n.x * (NW + GAPX);
  const ny = n => PADY + n.y * (NH + GAPY);
  const el = (t, a) => { const e = document.createElementNS(SVGNS, t); for (const k in a) e.setAttribute(k, a[k]); return e; };
  const fill = c => ({ tub:'#E1F5EE', diary:'#FBEAF0', test:'#FAECE7', hub:'#EEEDFE', choice:'#FCEBEB', misc:'#F1EFE8' }[c]);
  const ink = c => ({ tub:'#085041', diary:'#72243E', test:'#712B13', hub:'#3C3489', choice:'#791F1F', misc:'#444441' }[c]);
  const DOT = { ready:'#1D9E75', pending:'#d98da8', runtime:'#b9b6ad' };
  const defaultStatus = n => /^LISTO/.test(n.todo) ? 'ready' : (n.t === 'act' ? 'runtime' : 'pending');

  function render(opts) {
    const svg = opts.svg, detail = opts.detail, statusFn = opts.statusFn || defaultStatus;
    const cols = Math.max(...NODES.map(n => n.x)) + 1;
    const maxRow = Math.max(...NODES.map(n => n.y));
    const W = PADX * 2 + cols * NW + (cols - 1) * GAPX;
    const H = PADY * 2 + (maxRow + 1) * NH + maxRow * GAPY;
    svg.innerHTML = '';
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.setAttribute('width', W); svg.setAttribute('height', H);

    const defs = el('defs', {});
    for (const k in CHAIN) {
      const m = el('marker', { id: 'arw-' + k, viewBox: '0 0 8 8', refX: 7, refY: 4, markerWidth: 6, markerHeight: 6, orient: 'auto-start-reverse' });
      m.appendChild(el('path', { d: 'M0 0 L8 4 L0 8 Z', fill: CHAIN[k] }));
      defs.appendChild(m);
    }
    svg.appendChild(defs);

    NODES.forEach(n => (n.deps || []).forEach(dep => {
      const a = byId[dep], b = n;
      const x1 = nx(a) + NW / 2, y1 = ny(a) + NH, x2 = nx(b) + NW / 2, y2 = ny(b) - 2, my = (y1 + y2) / 2;
      svg.appendChild(el('path', { d: `M${x1} ${y1} C ${x1} ${my}, ${x2} ${my}, ${x2} ${y2}`, fill: 'none', stroke: CHAIN[b.c], 'stroke-width': 1.5, opacity: 0.5, 'marker-end': `url(#arw-${b.c})` }));
    }));

    NODES.forEach(n => {
      const g = el('g', { class: 'dnode' }); g.dataset.id = n.id;
      const st = statusFn(n), isAct = n.t === 'act';
      const rect = el('rect', { x: nx(n), y: ny(n), width: NW, height: NH, rx: 8,
        fill: st === 'ready' ? '#E4F6EE' : (isAct ? '#ffffff' : fill(n.c)),
        stroke: st === 'ready' ? '#1D9E75' : CHAIN[n.c], 'stroke-width': isAct ? 1.3 : 1 });
      if (isAct) rect.setAttribute('stroke-dasharray', '4 3');
      const t1 = el('text', { x: nx(n) + NW / 2, y: ny(n) + 21, 'text-anchor': 'middle', class: 'dt', fill: ink(n.c) }); t1.textContent = n.label;
      const t2 = el('text', { x: nx(n) + NW / 2, y: ny(n) + 37, 'text-anchor': 'middle', class: 'ds', fill: CHAIN[n.c] }); t2.textContent = n.sub;
      const dot = el('circle', { cx: nx(n) + NW - 12, cy: ny(n) + 12, r: 4, fill: DOT[st] });
      g.append(rect, t1, t2, dot);
      g.addEventListener('click', () => select(n.id, svg, detail, statusFn, opts.onSelect));
      svg.appendChild(g);
    });
  }

  function select(id, svg, detail, statusFn, onSelect) {
    const n = byId[id];
    statusFn = statusFn || defaultStatus;
    svg.querySelectorAll('.dnode').forEach(g => g.classList.toggle('sel', g.dataset.id === id));
    const st = statusFn(n);
    const badge = st === 'ready' ? ['LISTO', '#eaf6f0', '#1d9e75'] : st === 'runtime' ? ['EN VIVO', '#f1efe8', '#6a675f'] : ['FALTA', '#fbeceb', '#a32d2d'];
    const deps = (n.deps || []).map(d => byId[d].label);
    const unlocks = NODES.filter(x => (x.deps || []).includes(id)).map(x => x.label);
    if (detail) detail.innerHTML =
      '<h3>' + n.label + '<span class="badge" style="background:' + badge[1] + ';color:' + badge[2] + '">' + badge[0] + '</span></h3>' +
      '<div class="idea">' + n.idea + '</div>' +
      '<div class="todo' + (st === 'ready' ? ' ready' : '') + '">' + n.todo + '</div>' +
      (deps.length ? '<div class="rel"><b>Necesita antes:</b> ' + deps.join(' · ') + '</div>' : '') +
      (unlocks.length ? '<div class="rel"><b>Desbloquea:</b> ' + unlocks.join(' · ') + '</div>' : '') +
      (n.sec ? '<div class="rel"><a class="jump" href="#' + n.sec + '">→ ir a la sección</a></div>' : '');
    if (onSelect) onSelect(n);
  }

  /* touch-first pan/zoom: 1 finger = pan, 2 fingers = pinch zoom, wheel = zoom,
     plus zoomIn/zoomOut for on-screen +/- buttons (mobile without a wheel). */
  function enableZoom(svg) {
    let vb = svg.getAttribute('viewBox').split(' ').map(Number);
    const base = [...vb];
    const set = () => svg.setAttribute('viewBox', vb.join(' '));
    svg.style.cursor = 'grab'; svg.style.touchAction = 'none';

    const clientVb = (cx, cy) => {
      const r = svg.getBoundingClientRect();
      return [vb[0] + (cx - r.left) / r.width * vb[2], vb[1] + (cy - r.top) / r.height * vb[3]];
    };
    function zoomAt(cx, cy, f) {
      const [mx, my] = clientVb(cx, cy);
      const nw = Math.min(base[2] * 1.3, Math.max(base[2] * 0.10, vb[2] * f));
      const nh = nw * base[3] / base[2];
      vb[0] = mx - (mx - vb[0]) * (nw / vb[2]);
      vb[1] = my - (my - vb[1]) * (nh / vb[3]);
      vb[2] = nw; vb[3] = nh; set();
    }
    const center = () => { const r = svg.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; };

    svg.addEventListener('wheel', e => { e.preventDefault(); zoomAt(e.clientX, e.clientY, e.deltaY < 0 ? 0.85 : 1.18); }, { passive: false });

    const pts = new Map();
    let pinch = 0;
    svg.addEventListener('pointerdown', e => {
      svg.setPointerCapture(e.pointerId);
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      svg.style.cursor = 'grabbing';
      if (pts.size === 2) { const p = [...pts.values()]; pinch = Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y); }
    });
    svg.addEventListener('pointermove', e => {
      const prev = pts.get(e.pointerId);
      if (!prev) return;
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pts.size >= 2) {
        const p = [...pts.values()];
        const dist = Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y);
        const mid = [(p[0].x + p[1].x) / 2, (p[0].y + p[1].y) / 2];
        if (pinch && dist) zoomAt(mid[0], mid[1], pinch / dist);
        pinch = dist;
      } else {
        const r = svg.getBoundingClientRect();
        vb[0] -= (e.clientX - prev.x) / r.width * vb[2];
        vb[1] -= (e.clientY - prev.y) / r.height * vb[3];
        set();
      }
    });
    const up = e => { pts.delete(e.pointerId); if (pts.size < 2) pinch = 0; if (!pts.size) svg.style.cursor = 'grab'; };
    svg.addEventListener('pointerup', up);
    svg.addEventListener('pointercancel', up);

    return {
      reset() { vb = [...base]; set(); },
      zoomIn() { const [cx, cy] = center(); zoomAt(cx, cy, 0.7); },
      zoomOut() { const [cx, cy] = center(); zoomAt(cx, cy, 1.43); },
    };
  }

  return { CHAIN, NODES, render, select, enableZoom };
})();
