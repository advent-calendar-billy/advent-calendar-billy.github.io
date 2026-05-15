/*
  Búsqueda de los Tesoros — content data.

  EVERY stop has TWO locks both required to advance:
    1. Selfie  — Fede must take a photo with ≥2 faces detected (validated via face-api).
    2. Password — text answer by default, OR a photo with ≥1 smiling face for "photo-smile" stops.

  Stop schema:

  {
    id:    "01",
    type:  "sight",                  // "sight" or "taste" (informational chip)
    lang:  "es",                     // "es" or "en"
    name:  "El Faro",                // shown only AFTER solving
    coord: [lat, lng],               // real coordinates of the spot
    circle: {
      radius: 220,                    // metres of the mystery circle
      offset: [0.0008, -0.0006]       // [latΔ, lngΔ] from coord — shifts circle so pin isn't centered
    },
    clue:   "Pista en el lugar...",  // shown when this stop is active
    passwordType: "text",            // "text" (default) or "photo-smile"
    answer: "1716",                  // for text type only — case-/accent-/punct-insensitive
    altAnswers: [...],               // optional extra acceptable text answers
    reward: {
      title: "Boston Light",
      body:  "El faro más antiguo de Estados Unidos.",
      food:  null
    }
  }

  -----------------------------------------------------------------
  Order matches the suggested walking route:
   Day 1 — from Park St, Thursday evening:
     01 Edgar Allan Poe statue       (SW corner of Common, ~5 min)
     02 Steaming Tea Kettle          (N to City Hall Plaza, ~10 min)
     03 Faneuil Hall grasshopper     (E next door, ~1 min)
     04 Boston Stone                 (N just past Faneuil, ~1 min)
     05 Christopher Columbus Park    (E to the Greenway, finale at night)
   Day 2 — from Gloucester station, Saturday:
     06 Hammond Castle               (Uber south)
     07 Gloucester Fisherman's Memorial  (back to downtown)
     08 Rocky Neck Art Colony        (E from downtown — photo-smile pwd)
     09 Halibut Point State Park     (commuter rail to Rockport, then walk)
  -----------------------------------------------------------------
*/

export const HUNT = {
  title: "Búsqueda de los Tesoros",
  subtitle: "para Fede",
  stops: [
    // ============ Day 1 — Thursday evening, walking from Park St ============

    {
      id: "01",
      type: "sight",
      lang: "es",
      name: "Edgar Allan Poe statue",
      coord: [42.3535, -71.0660],
      circle: { radius: 220, offset: [-0.0006, -0.0008] },
      clue: "Hay un corazón en Beacon Hill. ¿Sobre qué descansa?",
      passwordType: "text",
      answer: "libros",
      altAnswers: ["libro", "books", "book"],
      reward: {
        title: "Poe Returning to Boston (2014)",
        body: "Poe nació acá en 1809 pero detestaba Boston — llamaba 'frogpondians' a sus habitantes. 'Tamerlane and Other Poems' (1827) fue su primer libro, impreso anónimamente. Solo se conocen 12 ejemplares en el mundo.",
        food: null
      }
    },

    {
      id: "02",
      type: "sight",
      lang: "es",
      name: "Steaming Tea Kettle",
      coord: [42.3603, -71.0593],
      circle: { radius: 220, offset: [-0.0007, 0.0008] },
      clue: "Cerca del ayuntamiento, algo de cobre lleva más de un siglo echando vapor sobre la vereda. ¿Cuántos galones dice contener?",
      passwordType: "text",
      answer: "227",
      altAnswers: ["doscientos veintisiete", "227 gallons"],
      reward: {
        title: "227 GALLONS 2 QUARTS 1 PINT 3 GILLS",
        body: "La hizo la Oriental Tea Company en 1873. El día que la inauguraron, hicieron un concurso para adivinar la capacidad — y para crear suspenso metieron a 8 niños y un sombrerero adentro antes de revelar el número.",
        food: null
      }
    },

    {
      id: "03",
      type: "sight",
      lang: "es",
      name: "El saltamontes de Faneuil Hall",
      coord: [42.3601, -71.0568],
      circle: { radius: 200, offset: [0.0008, 0.0007] },
      clue: "Encima del mercado más viejo del barrio, algo dorado lleva posado desde 1742. ¿Qué es?",
      passwordType: "text",
      answer: "saltamontes",
      altAnswers: ["grasshopper", "langosta"],
      reward: {
        title: "El saltamontes de Shem Drowne",
        body: "52 pulgadas de cobre dorado, 38 libras, ojos de pomos de cristal. En la guerra de 1812 los bostonianos identificaban espías preguntándoles qué había arriba de Faneuil Hall — si no podían pronunciar 'grasshopper' bien, los detenían.",
        food: null
      }
    },

    {
      id: "04",
      type: "sight",
      lang: "es",
      name: "Boston Stone",
      coord: [42.3611, -71.0566],
      circle: { radius: 200, offset: [0.0008, -0.0006] },
      clue: "A pocos pasos, en una pared de ladrillo de Marshall Street, alguien empotró una piedra redonda. Es el punto cero de la ciudad. ¿Qué año tiene grabado?",
      passwordType: "text",
      answer: "1737",
      altAnswers: ["mil setecientos treinta y siete"],
      reward: {
        title: "Boston Stone",
        body: "Durante 100 años fue el punto cero de Boston — toda distancia 'desde Boston' se medía desde acá. La leyenda dice que la esfera era una piedra de molino que un par de mercaderes encontraron y le pusieron fecha falsa para venderla.",
        food: null
      }
    },

    {
      id: "05",
      type: "sight",
      lang: "es",
      name: "Christopher Columbus Park",
      coord: [42.3608, -71.0510],
      circle: { radius: 250, offset: [0.0007, -0.0008] },
      clue: "Cerca del puerto, un jardín honra a una madre famosa de nueve hijos: un rosal por cada año que vivió. ¿En qué año lo dedicaron?",
      passwordType: "text",
      answer: "1987",
      altAnswers: ["mil novecientos ochenta y siete"],
      reward: {
        title: "Rose Kennedy Rose Garden",
        body: "Dedicado en julio de 1987. Las 104 rosas son los 104 años de Rose Fitzgerald Kennedy (1890–1995), madre de JFK. También honra a las Gold Star Mothers. De noche la pérgola se ilumina de azul.",
        food: null
      }
    },

    // ============ Day 2 — Saturday, Cape Ann ============

    {
      id: "06",
      type: "sight",
      lang: "es",
      name: "Hammond Castle",
      coord: [42.5793, -70.6803],
      circle: { radius: 350, offset: [0.0010, 0.0009] },
      clue: "Sobre el mar, un castillo medieval que no es medieval. Lo levantó un inventor con más de 800 patentes. ¿En qué año empezó?",
      passwordType: "text",
      answer: "1929",
      altAnswers: ["mil novecientos veintinueve"],
      reward: {
        title: "Hammond Castle",
        body: "John Hays Hammond Jr. construyó este castillo entre 1929 y 1931 para vivir en él. Tiene piscina cubierta romana, órgano gigante, secret passages, manos momificadas en exhibición, y una tumba para su gato.",
        food: null
      }
    },

    {
      id: "07",
      type: "sight",
      lang: "es",
      name: "Gloucester Fisherman's Memorial",
      coord: [42.6068, -70.6712],
      circle: { radius: 250, offset: [-0.0007, 0.0009] },
      clue: "Frente al mar, un hombre de bronce sostiene un timón. La placa cuenta cuándo nació este pueblo. Solo el año.",
      passwordType: "text",
      answer: "1623",
      altAnswers: ["mil seiscientos veintitres", "mil seiscientos veintitrés"],
      reward: {
        title: "They That Go Down to the Sea in Ships",
        body: "Gloucester fue fundada en 1623, una de las primeras colonias inglesas en Nueva Inglaterra. El monumento (1923, su tercer centenario) honra a los miles de pescadores perdidos en el mar. La frase es del Salmo 107.",
        food: null
      }
    },

    {
      id: "08",
      type: "taste",
      lang: "es",
      name: "Rocky Neck Art Colony",
      coord: [42.6066, -70.6586],
      circle: { radius: 300, offset: [0.0009, -0.0008] },
      clue: "Acá pintaron Hopper, Homer y muchos otros desde hace casi dos siglos. Buscá una pieza chica que creas que a Billy le va a fascinar. La contraseña es una foto de Billy, sonriendo, con el regalo.",
      passwordType: "photo-smile",
      reward: {
        title: "Rocky Neck",
        body: "Funciona como colonia de artistas desde los 1850s. Hopper, Homer, Hassam — todos pintaron acá. Hoy elegiste tu propia pieza.",
        food: null
      }
    },

    {
      id: "09",
      type: "sight",
      lang: "es",
      name: "Halibut Point State Park",
      coord: [42.6917, -70.6291],
      circle: { radius: 350, offset: [-0.0008, 0.0008] },
      clue: "Al final del camino, un pozo profundo lleno de agua de lluvia te espera en lo alto de un acantilado. ¿Cómo se llamaba? (dos palabras en inglés)",
      passwordType: "text",
      answer: "babson farm",
      altAnswers: ["babson"],
      reward: {
        title: "Babson Farm Quarry",
        body: "Cuando operaba (1840s–1929), de acá salía granito para todo USA — incluido el monumento de Bunker Hill. Hoy es un pozo de 60 pies lleno de agua de lluvia, en la cima de un acantilado oceánico. Spare and dramatic.",
        food: null
      }
    }
  ],
  finale: {
    title: "Encontraste todos los tesoros",
    body: "Mis tesoros son nuestros momentos juntos (hagamos más fotos!)",
    pics: [
      "01.jpeg", "02.jpeg", "03.jpeg", "04.jpeg", "05.jpeg",
      "06.jpeg", "07.jpeg", "08.jpeg", "09.jpeg", "10.jpeg",
      "11.jpeg", "12.jpeg", "13.jpeg", "14.jpeg", "15.jpeg",
      "16.jpeg", "17.jpeg", "18.jpeg", "19.jpeg", "20.jpeg",
      "21.jpeg", "22.jpeg", "23.jpeg", "24.jpeg", "25.jpeg",
      "26.jpeg", "27.jpeg", "28.jpeg", "29.jpeg", "30.jpeg",
      "31.jpeg", "32.jpeg", "33.jpeg", "34.jpeg", "35.jpeg"
    ]
  }
};
