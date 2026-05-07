/*
  Búsqueda de los Tesoros — content data.

  Edit this file to set the hunt. Each stop has the schema:

  {
    id:    "01",            // any unique string, used as the storage key for the photo
    type:  "sight",         // "sight" or "taste". "taste" means a food gem.
    lang:  "es",            // "es" or "en". Language of the clue text.
    name:  "El Faro",       // shown only AFTER solving (the "true name" of the spot)
    coord: [lat, lng],      // real coordinates of the spot
    circle: {
      radius: 220,           // metres of the mystery circle
      offset: [0.0008, -0.0006]  // [latΔ, lngΔ] from coord — shifts the circle so the pin isn't centered
    },
    clue:   "Pista en el lugar...",  // shown when this stop is the active one
    answer: "1716",                  // expected answer; matched case-, accent-, punctuation-insensitive
    altAnswers: [...],               // optional additional acceptable answers
    reward: {
      title: "Boston Light",
      body:  "El faro más antiguo de Estados Unidos.",
      food:  null                    // sight stop → null. taste stop → { place, order, priceUSD }
    }
  }

  A taste stop reward looks like:
    food: { place: "Taquería del Sol", order: "2 al pastor + horchata", priceUSD: 9 }

  The mystery circle's offset moves its CENTER away from the true coord, so the true pin
  sits off-center inside the circle. Negative values shift south / west.
  ~0.0009 degrees ≈ 100 m at this latitude.
*/

export const HUNT = {
  title: "Búsqueda de los Tesoros",
  subtitle: "para Fede",
  stops: [
    {
      id: "01",
      type: "sight",
      lang: "es",
      name: "Acorn Street",
      coord: [42.3592, -71.0680],
      circle: { radius: 220, offset: [0.0008, -0.0007] },
      clue: "La calle adoquinada más fotografiada de la ciudad. Contá las puertas rojas que se ven desde la entrada. ¿Cuántas?",
      answer: "3",
      altAnswers: ["tres"],
      reward: {
        title: "Acorn Street",
        body: "Beacon Hill, sus piedras y sus farolas de gas. Sigue siendo de las calles más antiguas de Boston.",
        food: null
      }
    },
    {
      id: "02",
      type: "taste",
      lang: "es",
      name: "Tacos escondidos",
      coord: [42.3398, -71.1011],
      circle: { radius: 200, offset: [-0.0007, 0.0009] },
      clue: "Pregunta cuánto sale el taco al pastor de hoy. Solo el número.",
      answer: "3",
      altAnswers: ["tres", "$3", "3 dolares", "3 dólares"],
      reward: {
        title: "El secreto del estacionamiento",
        body: "Billy va a confirmar el lugar y el precio antes del día.",
        food: {
          place: "Taquería (placeholder)",
          order: "2 al pastor + horchata",
          priceUSD: 9
        }
      }
    },
    {
      id: "03",
      type: "sight",
      lang: "es",
      name: "Make Way for Ducklings",
      coord: [42.3559, -71.0703],
      circle: { radius: 240, offset: [0.0006, 0.0008] },
      clue: "En el Public Garden hay una familia de bronce caminando en fila. ¿Cuántos patitos siguen a la mamá?",
      answer: "8",
      altAnswers: ["ocho"],
      reward: {
        title: "Make Way for Ducklings",
        body: "Mamá Mallard y sus ocho patitos: Jack, Kack, Lack, Mack, Nack, Ouack, Pack y Quack.",
        food: null
      }
    }
  ],
  finale: {
    title: "Encontraste todos los tesoros",
    body: "Mensaje final acá. Billy lo va a escribir antes del día — quizás una dirección, una hora, una sorpresa final."
  }
};
