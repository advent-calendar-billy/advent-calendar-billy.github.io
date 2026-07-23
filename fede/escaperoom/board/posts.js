/* Cartelera del consorcio.
   Video posts: title = video filename; Depto = the floor the speaker SAYS in
   the video (3A planta, 9B vecina preocupada, 7A me enoje, 6B vendo piso).
   Text-only posts are camouflage; bodies short. No names on the board.
   video: filename inside fede/escaperoom/video/ (mp4), or null for text-only.
   Posts render collapsed (title + meta); a video only appears on expand. */
const POSTS = [
  {
    author: 'Administración', unit: '', date: '01/07',
    title: 'Uso de la cartelera',
    body: 'Se recuerda que la cartelera es únicamente para avisos entre vecinos. ' +
          'Los avisos se retiran a fin de mes.',
    video: null, pinned: true,
  },
  {
    author: '', unit: '2C', date: '10/07',
    title: 'hacemos fiesta en la terraza?',
    body: 'Sábado. Llevo parlante. Confirmen acá abajo.',
    video: null,
  },
  {
    author: '', unit: '3A', date: '11/07',
    title: 'vendo planta',
    body: 'Detalles en el video.',
    video: 'vendo_planta.mp4',
  },
  {
    author: '', unit: '', date: '12/07',
    title: 'al que canta en el baño',
    body: 'Se escucha TODO. No pares.',
    video: null,
  },
  {
    author: '', unit: '7A', date: '14/07',
    title: 'me enoje',
    body: 'Para que quede constancia. Video adjunto.',
    video: 'me_enoje.mp4',
  },
  {
    author: '', unit: '4D', date: '14/07',
    title: 'regalo cama',
    body: 'De una plaza. Casi sin uso. Retirar hoy.',
    video: null,
  },
  {
    author: '', unit: '9B', date: '15/07',
    title: 'vecina preocupada',
    body: 'Dejo un video para los vecinos.',
    video: 'vecina_preocupada.mp4',
  },
  {
    author: '', unit: '8B', date: '15/07',
    title: 'vendo espejo',
    body: 'De cuerpo entero. Funciona.',
    video: null,
  },
  {
    author: '', unit: '1D', date: '16/07',
    title: 'se perdió algo',
    body: 'Se perdió una bufanda gris en el palier de planta baja. ' +
          'Preguntar en portería.',
    video: null,
  },
  {
    author: '', unit: '', date: '16/07',
    title: 'clases de yoga: suspendidas',
    body: 'Hasta nuevo aviso. Ya saben por qué.',
    video: null,
  },
  {
    author: '', unit: '6B', date: '17/07',
    title: 'vendo piso',
    body: 'Consultas en el video.',
    video: 'vendo_piso.mp4',
  },
];
