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
  { head: 'Paraguas Eclipse Total', body: 'Bloquea el 100% de la luz solar y te cubre el cuerpo ENTERO, de la cabeza a los pies. Oscuridad garantizada al mediodía. La sombra es un derecho.', cta: 'Comprar oscuridad' },
  { head: '¿Viajero frecuente? Obtenga descuento en vuelos*', body: '*El asiento está en el baño.', cta: 'Reservar' },
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

/* T&C clauses — TODAS en primera del "solicitante" (Fede firma). ~80% legalese
   bancario aburrido y realista, ~20% chistes enterrados entre el relleno (rinde
   más leerlo). La última engancha con el checkbox de cierre. TERMS_FINE va chico. */
const TERMS_CLAUSES = [
  'El solicitante declara que los datos consignados en el presente formulario son veraces, exactos y completos.',
  'El solicitante acepta que las operaciones cursadas a través de los canales electrónicos quedan sujetas a verificación y podrán demorar hasta su acreditación definitiva.',
  'El solicitante autoriza a la entidad a registrar, conservar y auditar la presente sesión con fines de seguridad y prevención del fraude.',
  'El solicitante reconoce haber sido informado de los riesgos asociados al uso de canales digitales, incluyendo el phishing y la suplantación de identidad.',
  'El solicitante acepta recibir notificaciones, resúmenes y comunicaciones contractuales por medios electrónicos, renunciando a su envío en soporte papel.',
  'El solicitante se obliga a mantener la confidencialidad de sus credenciales y a no divulgarlas a terceros bajo ninguna circunstancia.',
  'El solicitante considera que el titular es una persona sumamente linda, con músculos visibles y nivel avanzado de bouldering.',
  'El solicitante acepta los cargos, comisiones, aranceles e impuestos vigentes, así como sus eventuales modificaciones conforme al tarifario publicado.',
  'El solicitante declara conocer que la entidad no solicita claves, códigos ni datos de tarjeta por teléfono, correo electrónico o mensajería.',
  'El solicitante acepta que la entidad podrá suspender preventivamente operaciones ante la detección de actividad inusual, sin responsabilidad alguna.',
  'El solicitante manifiesta que los fondos involucrados provienen de actividades lícitas y se compromete a acreditar su origen cuando le sea requerido.',
  'El solicitante acepta que las grabaciones de las comunicaciones telefónicas constituyen prueba suficiente en caso de controversia.',
  'El solicitante reconoce que el titular siempre tuvo razón, incluso retroactivamente.',
  'El solicitante reconoce que las tasas informadas tienen carácter estimativo y pueden variar según las condiciones del mercado.',
  'El solicitante autoriza el débito automático de las comisiones de mantenimiento sobre la cuenta asociada.',
  'El solicitante declara haber leído la totalidad de los presentes términos, lo cual es falso.',
  'El solicitante acepta que la presente operación se rige por la legislación aplicable y se somete a la jurisdicción de los tribunales competentes.',
  'El solicitante acepta tener una adicción al casino de grado moderado a severo.',
  'El solicitante reconoce que la entidad no garantiza la disponibilidad ininterrumpida de los servicios en línea.',
  'El solicitante acepta que la información provista podrá ser compartida con los organismos de control conforme a la normativa vigente.',
  'El solicitante se compromete a actualizar sus datos de contacto ante cualquier modificación.',
  'El solicitante libera al titular de toda responsabilidad por el hígado faltante.',
  'El solicitante acepta que la falta de objeción dentro de los treinta días corridos implica su conformidad con los presentes términos.',
  'El solicitante acepta que este trámite es, en parte, su culpa.',
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
    seconds: 10,
    errorMsg: 'Compromiso insuficiente.',
  },
  {
    id: 'party', type: 'widget', widget: 'party',
    title: 'Identificación de las partes',
    prompt: 'Antes de continuar, identifique a las partes de esta operación. ' +
      'Estos datos se utilizarán en el resto del proceso.',
    fields: [
      { key: 'titular', label: 'Nombre del TITULAR de la cuenta' },
      { key: 'solicitante', label: 'Nombre del SOLICITANTE' },
    ],
    errorMsg: 'Complete ambos campos para continuar.',
  },
  {
    id: 'phone', type: 'widget', widget: 'phoneslider',
    title: 'Número de contacto',
    prompt: 'Ingrese el número de teléfono del titular.',
    digits: 10, expected: 7813239630,    /* Billy's number; Fede lo sabe, entrarlo es el castigo */
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
    id: 'phonecode', type: 'widget', widget: 'phonecall',
    title: 'Verificación telefónica',
    prompt: 'Solicite la llamada de verificación. La entidad lo llamará y le dictará un código; ingréselo para continuar.',
    hash: 'e25e05d04ff54c16624763307af74c8fb90bcf8f14acfb8dfee49c92df8a0796', /* 40719 — dicho por el árbol Bland */
    callHash: 'f5095cd644fbe157a3ebc71d3e3212530f58e6d8a88c400c811314f217278c59', /* 2111 (cumple 21/11) — evita abuso público */
    errorMsg: 'Código inválido. Complete la verificación telefónica para obtenerlo.',
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
