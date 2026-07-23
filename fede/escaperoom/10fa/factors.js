/* Verificación Reforzada — factor config. Reorder / disable freely.
   CONTENT NOTES (Billy):
   - Answers are stored as SHA-256 of the normalized answer (lowercased, trimmed,
     single spaces). To regenerate:  printf '%s' "respuesta" | shasum -a 256
   - Emotion list, T&C text, ad copy and the phone target are PLACEHOLDERS. */

const BANK = {
  name: 'Chase',                       /* locked (Billy, Jul 21) */
  tagline: 'Banca en línea',
  supportCode: 'AV-407',
  holder: 'PLACEHOLDER TITULAR',       /* account holder shown in the top bar */
  accountMask: '•••• 4821',            /* PLACEHOLDER */
  supportPhone: '(000) 000-0000',      /* PLACEHOLDER — the number Fede must call (phone tree) */
};

/* The operation Fede is racing to cancel. Amount is canon (IOU 400K). */
const TRANSFER = {
  amount: 'USD 400.000,00',
  dest: 'PLACEHOLDER — cuenta destino',
  status: 'EN PROCESO',
};

/* PLACEHOLDER ads — late-stage-capitalism genre, Billy rewrites. */
const ADS = [
  { head: '¿Fundido?', body: 'PLACEHOLDER de publicidad — préstamo instantáneo.', cta: 'Pedir ya' },
  { head: 'PLACEHOLDER', body: 'Segundo anuncio de ejemplo para chequear el estilo.', cta: 'Ver más' },
  { head: 'PLACEHOLDER', body: 'Tercer anuncio de ejemplo.', cta: 'Aplicar' },
];

const EMOTIONS = [
  /* PLACEHOLDER — expandir a ~40. Solo la marcada con ok:true pasa. */
  { label: 'CONFORME' },
  { label: 'RAZONABLEMENTE PREOCUPADO' },
  { label: 'TRAICIONADO PERO ESPERANZADO', ok: true },
  { label: 'FURIOSO CON DIGNIDAD' },
  { label: 'NOSTÁLGICO SIN MOTIVO' },
  { label: 'ILUSIONADO CONTRA TODA EVIDENCIA' },
  { label: 'SERENO (FALSO)' },
  { label: 'DESPECHADO PRODUCTIVO' },
  { label: 'VULNERABLE PERO ELEGANTE' },
  { label: 'OPTIMISTA FINANCIERO' },
  { label: 'EN NEGACIÓN ACTIVA' },
  { label: 'DOLIDO PERO PRESENTABLE' },
];

const FACTORS = [
  {
    id: 'robot', type: 'widget', widget: 'dropdown',
    title: 'Verificación de humanidad',
    prompt: '¿Es usted un robot?',
    options: ['Seleccionar...', 'SÍ', 'NO', 'PREFIERO NO DECIRLO'],
    correct: 'NO',
    errorMsg: 'Su respuesta no permite descartar que sea un robot.',
  },
  {
    id: 'emotion', type: 'widget', widget: 'emotion',
    title: 'Estado emocional del titular',
    prompt: 'Seleccione su estado emocional actual. Sea preciso: la exactitud emocional es un requisito regulatorio.',
    errorMsg: 'El estado declarado no coincide con nuestros registros biométricos.',
  },
  {
    id: 'captcha', type: 'widget', widget: 'captcha',
    title: 'Identificación visual del sospechoso',
    prompt: 'Seleccione todas las imágenes donde aparece el sospechoso.',
    images: 9, correct: [5],             /* c6.jpg = Maxim (white tank, smoothie) */
    errorMsg: 'Selección incorrecta. El sospechoso permanece sin identificar.',
  },
  {
    id: 'hold', type: 'widget', widget: 'hold',
    title: 'Prueba de compromiso',
    prompt: 'Mantenga presionado el botón durante 10 segundos para demostrar compromiso con sus fondos.',
    seconds: 10, slipAt: 9,
    errorMsg: 'Compromiso insuficiente.',
  },
  {
    id: 'phone', type: 'widget', widget: 'phoneslider',
    title: 'Número de contacto',
    prompt: 'Ingrese su número de teléfono.',
    digits: 10, expected: null,          /* null = acepta cualquier número confirmado */
  },
  {
    id: 'name', type: 'answer', input: 'text',
    title: 'Identificación del sospechoso',
    prompt: 'Ingrese el nombre legal completo del sospechoso.',
    hash: '49a0733fd3ce44056c83de858e6964d15474386e70ab2803f251d41a3d2991b8', /* maxim sekuestrov */
    errorMsg: 'El nombre no figura en el registro de sospechosos.',
  },
  {
    id: 'password', type: 'answer', input: 'password',
    title: 'Credencial del titular',
    prompt: 'Ingrese la contraseña de su cuenta.',
    hash: 'ca5f4d55e7492b56c1b85fd5ed45fadd25edf91e111899049829f55df546f9ac', /* PLACEHOLDER: contrasena-placeholder */
    errorMsg: 'Contraseña incorrecta.',
  },
  {
    id: 'code', type: 'answer', input: 'text',
    title: 'Código de verificación',
    prompt: 'Ingrese el código enviado a su teléfono registrado.',
    hash: '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', /* PLACEHOLDER: 123456 */
    errorMsg: 'Código inválido o vencido.',
  },
  {
    id: 'voice', type: 'attest',
    title: 'Verificación de voz',
    prompt: 'Lea en voz alta, con claridad: "YO NUNCA LE DARÍA MI CLAVE A UN DESCONOCIDO DEL GRINDR".',
    button: 'YA LO DIJE',
  },
  {
    id: 'tc', type: 'widget', widget: 'terms',
    title: 'Términos y condiciones',
    prompt: 'Lea y acepte los términos actualizados.',
    checkbox: 'Acepto que en parte fue mi culpa.',
  },
  {
    id: 'heart', type: 'widget', widget: 'signature',
    title: 'Firma digital',
    prompt: 'Dibuje un corazón roto en el recuadro para certificar la operación.',
  },
  {
    id: 'higado', type: 'billy',
    title: 'Verificación biométrica de órgano',
    prompt: 'Coloque un (1) hígado humano refrigerado sobre el sensor e inicie el escaneo.',
    button: 'INICIAR ESCANEO',
    errorMsg: 'Órgano no reconocido o a temperatura inadecuada.',
  },
];
