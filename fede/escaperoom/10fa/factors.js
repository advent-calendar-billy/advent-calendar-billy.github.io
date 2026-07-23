/* Verificación Reforzada — factor config. Reorder / disable freely.
   CONTENT NOTES (Billy):
   - Answers are stored as SHA-256 of the normalized answer (lowercased, trimmed,
     single spaces). To regenerate:  printf '%s' "respuesta" | shasum -a 256
   - Emotion list, T&C text, ad copy and the phone target are PLACEHOLDERS. */

const BANK = {
  name: 'Chase',                       /* locked (Billy, Jul 21) */
  tagline: 'Banca en línea',
  supportCode: 'AV-407',
  holder: 'G Mosse',                   /* account holder shown in the top bar (Billy, Jul 23) */
  accountMask: '•••• 4821',
  supportPhone: 'La entidad lo llamará.',  /* the bank calls YOU (Bland via console + daemon) */
};

/* The operation Fede is racing to cancel. Amount is canon (IOU 400K). */
const TRANSFER = {
  amount: 'USD 400.000,00',
  dest: 'Maxim S.',                    /* Billy, Jul 23 */
  status: 'EN PROCESO',
};

/* Ads — ad1 from Billy (tarjeta con descuentos a Japón); ad2/ad3 camp, Claude. */
const ADS = [
  { head: '¿Japón te llama?', body: 'Tarjeta Sakura Platinum: 40% off en vuelos a Tokio y ramen ilimitado en el lounge. Sin límite de gastos, sin límite de vos.', cta: 'Pedir la mía' },
  { head: '¿Arrugas de estrés financiero?', body: 'Financiá tu bótox en 12 cuotas sin interés. Porque la crisis no tiene por qué notarse en la frente.', cta: 'Congelar gesto' },
  { head: 'Invertí con el corazón', body: 'MaximCoin: la única cripto que sube cuando la mirás con deseo. Resultados no garantizados; emociones, sí.', cta: 'Minar amor' },
];

/* Emotion selector — reframed per Billy (Jul 23): relación abierta, así que
   NO va por el desamor sino por el pánico financiero. Solo ok:true pasa. */
const EMOTIONS = [
  { label: 'CONFORME' },
  { label: 'RAZONABLEMENTE PREOCUPADO' },
  { label: 'CON MIEDO A PERDER DINERO', ok: true },
  { label: 'FURIOSO CON DIGNIDAD' },
  { label: 'ESTAFADO PERO FABULOSO' },
  { label: 'POBRE PERO ELEGANTE' },
  { label: 'OPTIMISTA FINANCIERO' },
  { label: 'EN NEGACIÓN ACTIVA' },
  { label: 'PREOCUPADO POR MIS AHORROS' },
  { label: 'INDIGNADO CON ESTILO' },
  { label: 'SÓLIDO, PERO LÍQUIDO NO' },
  { label: 'CALCULANDO PÉRDIDAS' },
  { label: 'SERENO (FALSO)' },
  { label: 'DRAMÁTICO PERO SOLVENTE' },
  { label: 'VANIDOSO EN CRISIS' },
  { label: 'APEGADO A MIS BIENES' },
  { label: 'MODERADAMENTE ARRUINADO' },
  { label: 'DIGNO ANTE LA BANCARROTA' },
  { label: 'CON LA TARJETA AL LÍMITE' },
  { label: 'ESPIRITUALMENTE RICO' },
  { label: 'CODICIOSO PERO SENSIBLE' },
  { label: 'ANSIOSO POR EL DÓLAR' },
  { label: 'MELODRAMÁTICO FINANCIERO' },
  { label: 'ORGULLOSO Y ENDEUDADO' },
  { label: 'TENSO PERO BRONCEADO' },
  { label: 'PARANOICO CON MOTIVO' },
  { label: 'RESIGNADO A MEDIAS' },
  { label: 'HISTÉRICO PERO PRESENTABLE' },
];

/* T&C clauses (Billy, Jul 23). FINE renders in tiny type, near-illegible. */
const TERMS_CLAUSES = [
  'El titular declara ser una persona sumamente linda, con músculos visibles y nivel avanzado de bouldering.',
  'El solicitante acepta desarrollar, a partir de la fecha, una adicción al casino de grado moderado a severo.',
  'El solicitante reconoce que el titular siempre tuvo razón.',
  'El solicitante renuncia a todo reclamo estético sobre el titular.',
];
const TERMS_FINE = 'El solicitante acepta tener hijos.';

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
    hash: 'a351028868cadf39b4d6f993efe2c4e443a8e150dbe06f7a9d59897b04c737d2', /* set by Billy (steam mirror) */
    errorMsg: 'Contraseña incorrecta.',
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
    prompt: 'VERIFICACIÓN FINAL. Para autorizar la cancelación, deposite un (1) hígado humano ' +
      'refrigerado en el cesto de residuos y tome una (1) fotografía como constancia. ' +
      'Un operador validará la imagen. El órgano no será restituido.',
    button: 'INICIAR VERIFICACIÓN',
    errorMsg: 'Órgano no reconocido o a temperatura inadecuada.',
  },
];
