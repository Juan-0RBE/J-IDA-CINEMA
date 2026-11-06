/* ============================================================================
   J'IDA Cinema - AVANCE 2 - 02_datos_prueba.js
   Datos de prueba de la capa documental (MongoDB)

   EJECUCIÓN (mongosh), DESPUÉS de 01_creacion_colecciones.js:


   COHERENCIA CON POSTGRESQL (01_creacion_tablas.sql, 02_datos_prueba.sql y
   03_datos_adicionales_avance2.sql ya ejecutados)
     fichas_tecnicas_peliculas  30 documentos  -> id_pelicula 1 a 30 (una ficha por película)
     requisitos_proyeccion      35 documentos  -> id_funcion de funciones con formato especial
                                                   (sala 4 es general y no tiene requisitos)
     resenas_peliculas          44 documentos  -> id_pelicula / id_espectador / id_funcion
     reportes_incidentes        36 documentos  -> 12 fallas, 12 quejas y 12 incidentes de seguridad

   Notas:
     - Formato por sala: sala 1 IMAX, sala 2 y 7 Dolby Atmos, sala 3 y 6 3D,
       sala 5 Evento. Las funciones en inglés subtitulado usan formato Subtitulado.
     - Los 4 eventos (funciones 37 a 40) tienen su reserva con 9, 10, 13 y 17 días
       de anticipación (mínimo 7), igual que las ventas 42 a 45 de PostgreSQL.
     - Las horas se guardan como están en PostgreSQL (hora local) con sufijo Z.
   ============================================================================ */

use("jida_cinema");

// Permite volver a ejecutar el script sin duplicar datos
db.fichas_tecnicas_peliculas.deleteMany({});
db.requisitos_proyeccion.deleteMany({});
db.resenas_peliculas.deleteMany({});
db.reportes_incidentes.deleteMany({});

/* ============================================================================
   1. fichas_tecnicas_peliculas
   ============================================================================ */
db.fichas_tecnicas_peliculas.insertMany([
  {
    id_pelicula: 1,
    titulo: "La Odisea",
    titulo_original: "The Odyssey",
    sinopsis: "Adaptación del poema épico de Homero sobre el largo y accidentado regreso de Odiseo a Ítaca.",
    elenco: [
      { id_actor_director: 1, nombre: "Christopher Nolan", rol: "Director" },
      { id_actor_director: 11, nombre: "Matt Damon", rol: "Protagonista" },
      { id_actor_director: 12, nombre: "Anne Hathaway", rol: "Reparto" },
      { id_actor_director: 13, nombre: "Tom Holland", rol: "Reparto" },
      { id_actor_director: 14, nombre: "Zendaya", rol: "Reparto" },
      { id_actor_director: 15, nombre: "Robert Pattinson", rol: "Reparto" },
      { id_actor_director: 16, nombre: "Charlize Theron", rol: "Reparto" },
      { id_actor_director: 17, nombre: "Lupita Nyong'o", rol: "Reparto" },
      { id_actor_director: 19, nombre: "Jon Bernthal", rol: "Reparto" }
    ],
    versiones: [
      {
        idioma: "Español",
        formato: "2D",
        duracion_minutos: 170,
        subtitulos: []
      },
      {
        idioma: "Español",
        formato: "IMAX",
        duracion_minutos: 172,
        subtitulos: []
      },
      {
        idioma: "Español",
        formato: "3D",
        duracion_minutos: 170,
        subtitulos: []
      }
    ],
    clasificacion_por_pais: [
      { pais: "CO", clasificacion: "12+" },
      { pais: "US", clasificacion: "PG-13" },
      { pais: "MX", clasificacion: "B" },
      { pais: "ES", clasificacion: "12" }
    ]
  },
  {
    id_pelicula: 2,
    titulo: "Spider-Man: Un Nuevo Día",
    titulo_original: "Spider-Man: Brand New Day",
    sinopsis: "Peter Parker enfrenta un nuevo capítulo de su vida como Spider-Man.",
    elenco: [
      { id_actor_director: 2, nombre: "Destin Daniel Cretton", rol: "Director" },
      { id_actor_director: 13, nombre: "Tom Holland", rol: "Protagonista" },
      { id_actor_director: 14, nombre: "Zendaya", rol: "Reparto" },
      { id_actor_director: 18, nombre: "Sadie Sink", rol: "Reparto" },
      { id_actor_director: 19, nombre: "Jon Bernthal", rol: "Reparto" }
    ],
    versiones: [
      {
        idioma: "Español",
        formato: "2D",
        duracion_minutos: 135,
        subtitulos: []
      },
      {
        idioma: "Español",
        formato: "3D",
        duracion_minutos: 135,
        subtitulos: []
      },
      {
        idioma: "Inglés",
        formato: "2D",
        duracion_minutos: 135,
        subtitulos: ["Español"]
      }
    ],
    clasificacion_por_pais: [
      { pais: "CO", clasificacion: "12+" },
      { pais: "US", clasificacion: "PG-13" },
      { pais: "MX", clasificacion: "B" },
      { pais: "ES", clasificacion: "12" }
    ]
  },
  {
    id_pelicula: 3,
    titulo: "Resident Evil",
    titulo_original: "Resident Evil",
    sinopsis: "Nueva entrega de terror y acción basada en la franquicia de videojuegos Resident Evil.",
    elenco: [
      { id_actor_director: 3, nombre: "Zach Cregger", rol: "Director" },
      { id_actor_director: 20, nombre: "Austin Abrams", rol: "Protagonista" },
      { id_actor_director: 21, nombre: "Paul Walter Hauser", rol: "Reparto" }
    ],
    versiones: [
      {
        idioma: "Español",
        formato: "2D",
        duracion_minutos: 105,
        subtitulos: []
      },
      {
        idioma: "Español",
        formato: "Dolby Atmos",
        duracion_minutos: 105,
        subtitulos: []
      },
      {
        idioma: "Español",
        formato: "IMAX",
        duracion_minutos: 107,
        subtitulos: []
      },
      {
        idioma: "Español",
        formato: "3D",
        duracion_minutos: 105,
        subtitulos: []
      },
      {
        idioma: "Inglés",
        formato: "2D",
        duracion_minutos: 105,
        subtitulos: ["Español"]
      }
    ],
    clasificacion_por_pais: [
      { pais: "CO", clasificacion: "18+" },
      { pais: "US", clasificacion: "R" },
      { pais: "MX", clasificacion: "C" }
    ]
  },
  {
    id_pelicula: 4,
    titulo: "Digger",
    titulo_original: "Digger",
    sinopsis: "Drama dirigido por Alejandro G. Iñárritu.",
    elenco: [
      { id_actor_director: 4, nombre: "Alejandro G. Iñárritu", rol: "Director" },
      { id_actor_director: 22, nombre: "Tom Cruise", rol: "Protagonista" },
      { id_actor_director: 23, nombre: "Sandra Hüller", rol: "Reparto" },
      { id_actor_director: 24, nombre: "Jesse Plemons", rol: "Reparto" },
      { id_actor_director: 25, nombre: "Riz Ahmed", rol: "Reparto" }
    ],
    versiones: [
      {
        idioma: "Español",
        formato: "2D",
        duracion_minutos: 135,
        subtitulos: []
      },
      {
        idioma: "Español",
        formato: "Dolby Atmos",
        duracion_minutos: 135,
        subtitulos: []
      },
      {
        idioma: "Español",
        formato: "3D",
        duracion_minutos: 135,
        subtitulos: []
      },
      {
        idioma: "Inglés",
        formato: "2D",
        duracion_minutos: 135,
        subtitulos: ["Español"]
      }
    ],
    clasificacion_por_pais: [
      { pais: "CO", clasificacion: "15+" },
      { pais: "US", clasificacion: "R" },
      { pais: "MX", clasificacion: "B15" }
    ]
  },
  {
    id_pelicula: 5,
    titulo: "Verity: La Sombra de un Engaño",
    titulo_original: "Verity",
    sinopsis: "Thriller psicológico basado en la novela de Colleen Hoover.",
    elenco: [
      { id_actor_director: 5, nombre: "Michael Showalter", rol: "Director" },
      { id_actor_director: 12, nombre: "Anne Hathaway", rol: "Protagonista" },
      { id_actor_director: 26, nombre: "Dakota Johnson", rol: "Protagonista" },
      { id_actor_director: 27, nombre: "Josh Hartnett", rol: "Reparto" }
    ],
    versiones: [
      {
        idioma: "Español",
        formato: "2D",
        duracion_minutos: 110,
        subtitulos: []
      },
      {
        idioma: "Español",
        formato: "IMAX",
        duracion_minutos: 112,
        subtitulos: []
      },
      {
        idioma: "Español",
        formato: "Dolby Atmos",
        duracion_minutos: 110,
        subtitulos: []
      }
    ],
    clasificacion_por_pais: [
      { pais: "CO", clasificacion: "15+" },
      { pais: "US", clasificacion: "R" },
      { pais: "MX", clasificacion: "B15" }
    ]
  },
  {
    id_pelicula: 6,
    titulo: "Shaun el Cordero: El Monstruo de Mossy Bottom",
    titulo_original: "Shaun the Sheep: The Beast of Mossy Bottom",
    sinopsis: "Nueva aventura animada de Shaun el Cordero y su rebaño en la granja Mossy Bottom.",
    elenco: [
      { id_actor_director: 9, nombre: "Will Becher", rol: "Director" },
      { id_actor_director: 28, nombre: "Justin Fletcher", rol: "Voz principal" }
    ],
    versiones: [
      {
        idioma: "Español",
        formato: "2D",
        duracion_minutos: 85,
        subtitulos: []
      },
      {
        idioma: "Español",
        formato: "3D",
        duracion_minutos: 85,
        subtitulos: []
      },
      {
        idioma: "Español",
        formato: "Dolby Atmos",
        duracion_minutos: 85,
        subtitulos: []
      }
    ],
    clasificacion_por_pais: [
      { pais: "CO", clasificacion: "TP" },
      { pais: "US", clasificacion: "G" },
      { pais: "MX", clasificacion: "AA" }
    ]
  },
  {
    id_pelicula: 7,
    titulo: "Street Fighter",
    titulo_original: "Street Fighter",
    sinopsis: "Adaptación cinematográfica de la célebre serie de videojuegos de lucha.",
    elenco: [
      { id_actor_director: 6, nombre: "Kitao Sakurai", rol: "Director" },
      { id_actor_director: 29, nombre: "Jason Momoa", rol: "Reparto" },
      { id_actor_director: 30, nombre: "Noah Centineo", rol: "Reparto" }
    ],
    versiones: [
      {
        idioma: "Español",
        formato: "2D",
        duracion_minutos: 125,
        subtitulos: []
      },
      {
        idioma: "Español",
        formato: "IMAX",
        duracion_minutos: 127,
        subtitulos: []
      },
      {
        idioma: "Español",
        formato: "3D",
        duracion_minutos: 125,
        subtitulos: []
      }
    ],
    clasificacion_por_pais: [
      { pais: "CO", clasificacion: "15+" },
      { pais: "US", clasificacion: "R" },
      { pais: "MX", clasificacion: "B15" }
    ]
  },
  {
    id_pelicula: 8,
    titulo: "Clayface",
    titulo_original: "Clayface",
    sinopsis: "Película de terror y acción del universo DC protagonizada por el villano Clayface.",
    elenco: [
      { id_actor_director: 7, nombre: "James Watkins", rol: "Director" },
      { id_actor_director: 31, nombre: "Tom Rhys Harries", rol: "Protagonista" },
      { id_actor_director: 32, nombre: "Eddie Marsan", rol: "Reparto" }
    ],
    versiones: [
      {
        idioma: "Español",
        formato: "2D",
        duracion_minutos: 105,
        subtitulos: []
      },
      {
        idioma: "Español",
        formato: "3D",
        duracion_minutos: 105,
        subtitulos: []
      }
    ],
    clasificacion_por_pais: [
      { pais: "CO", clasificacion: "15+" },
      { pais: "US", clasificacion: "R" },
      { pais: "MX", clasificacion: "B15" }
    ]
  },
  {
    id_pelicula: 9,
    titulo: "El Bosque Olvidado: Wildwood",
    titulo_original: "Wildwood",
    sinopsis: "Aventura animada de fantasía basada en la novela Wildwood.",
    elenco: [
      { id_actor_director: 8, nombre: "Travis Knight", rol: "Director" },
      { id_actor_director: 33, nombre: "Mckenna Grace", rol: "Voz principal" },
      { id_actor_director: 34, nombre: "Jacob Tremblay", rol: "Voz principal" }
    ],
    versiones: [
      {
        idioma: "Español",
        formato: "2D",
        duracion_minutos: 100,
        subtitulos: []
      },
      {
        idioma: "Español",
        formato: "3D",
        duracion_minutos: 100,
        subtitulos: []
      }
    ],
    clasificacion_por_pais: [
      { pais: "CO", clasificacion: "7+" },
      { pais: "US", clasificacion: "PG" },
      { pais: "MX", clasificacion: "A" }
    ]
  },
  {
    id_pelicula: 10,
    titulo: "Sensatez y Sentimiento",
    titulo_original: "Sense and Sensibility",
    sinopsis: "Nueva adaptación de la novela clásica de Jane Austen.",
    elenco: [
      { id_actor_director: 10, nombre: "Georgia Oakley", rol: "Director" },
      { id_actor_director: 35, nombre: "Daisy Edgar-Jones", rol: "Protagonista" },
      { id_actor_director: 36, nombre: "Daisy Ridley", rol: "Protagonista" }
    ],
    versiones: [
      {
        idioma: "Español",
        formato: "2D",
        duracion_minutos: 120,
        subtitulos: []
      },
      {
        idioma: "Español",
        formato: "IMAX",
        duracion_minutos: 122,
        subtitulos: []
      }
    ],
    clasificacion_por_pais: [
      { pais: "CO", clasificacion: "12+" },
      { pais: "US", clasificacion: "PG-13" },
      { pais: "MX", clasificacion: "B" }
    ]
  },
  {
    id_pelicula: 11,
    titulo: "Oppenheimer",
    titulo_original: "Oppenheimer",
    sinopsis: "Biografía del físico J. Robert Oppenheimer y su papel en el desarrollo de la bomba atómica.",
    elenco: [
      { id_actor_director: 1, nombre: "Christopher Nolan", rol: "Director" },
      {
        id_actor_director: 37,
        nombre: "Cillian Murphy",
        rol: "Protagonista",
        personaje: "J. Robert Oppenheimer"
      },
      { id_actor_director: 11, nombre: "Matt Damon", rol: "Reparto", personaje: "Leslie Groves" },
      {
        id_actor_director: 27,
        nombre: "Josh Hartnett",
        rol: "Reparto",
        personaje: "Ernest Lawrence"
      }
    ],
    versiones: [
      {
        idioma: "Español",
        formato: "2D",
        duracion_minutos: 180,
        subtitulos: []
      },
      {
        idioma: "Español",
        formato: "IMAX",
        duracion_minutos: 182,
        subtitulos: []
      },
      {
        idioma: "Inglés",
        formato: "2D",
        duracion_minutos: 180,
        subtitulos: ["Español"]
      }
    ],
    clasificacion_por_pais: [
      { pais: "CO", clasificacion: "15+" },
      { pais: "US", clasificacion: "R" },
      { pais: "MX", clasificacion: "B15" },
      { pais: "ES", clasificacion: "16" }
    ]
  },
  {
    id_pelicula: 12,
    titulo: "Dune: Parte Dos",
    titulo_original: "Dune: Part Two",
    sinopsis: "Paul Atreides se une a los Fremen para vengar a su familia y enfrentar un destino que puede cambiar el universo.",
    elenco: [
      { id_actor_director: 38, nombre: "Denis Villeneuve", rol: "Director" },
      {
        id_actor_director: 39,
        nombre: "Timothée Chalamet",
        rol: "Protagonista",
        personaje: "Paul Atreides"
      },
      { id_actor_director: 14, nombre: "Zendaya", rol: "Reparto", personaje: "Chani" }
    ],
    versiones: [
      {
        idioma: "Español",
        formato: "2D",
        duracion_minutos: 166,
        subtitulos: []
      },
      {
        idioma: "Español",
        formato: "IMAX",
        duracion_minutos: 168,
        subtitulos: []
      },
      {
        idioma: "Español",
        formato: "Dolby Atmos",
        duracion_minutos: 166,
        subtitulos: []
      },
      {
        idioma: "Inglés",
        formato: "2D",
        duracion_minutos: 166,
        subtitulos: ["Español", "Portugués"]
      }
    ],
    clasificacion_por_pais: [
      { pais: "CO", clasificacion: "12+" },
      { pais: "US", clasificacion: "PG-13" },
      { pais: "MX", clasificacion: "B" },
      { pais: "ES", clasificacion: "12" }
    ]
  },
  {
    id_pelicula: 13,
    titulo: "Interstellar",
    titulo_original: "Interstellar",
    sinopsis: "Un grupo de exploradores viaja a través de un agujero de gusano en busca de un nuevo hogar para la humanidad.",
    elenco: [
      { id_actor_director: 1, nombre: "Christopher Nolan", rol: "Director" },
      {
        id_actor_director: 40,
        nombre: "Matthew McConaughey",
        rol: "Protagonista",
        personaje: "Cooper"
      },
      { id_actor_director: 11, nombre: "Matt Damon", rol: "Reparto", personaje: "Dr. Mann" },
      { id_actor_director: 12, nombre: "Anne Hathaway", rol: "Reparto", personaje: "Brand" }
    ],
    versiones: [
      {
        idioma: "Español",
        formato: "2D",
        duracion_minutos: 169,
        subtitulos: []
      },
      {
        idioma: "Español",
        formato: "IMAX",
        duracion_minutos: 171,
        subtitulos: []
      },
      {
        idioma: "Inglés",
        formato: "2D",
        duracion_minutos: 169,
        subtitulos: ["Español"]
      }
    ],
    clasificacion_por_pais: [
      { pais: "CO", clasificacion: "12+" },
      { pais: "US", clasificacion: "PG-13" },
      { pais: "MX", clasificacion: "B" },
      { pais: "ES", clasificacion: "12" }
    ]
  },
  {
    id_pelicula: 14,
    titulo: "The Batman",
    titulo_original: "The Batman",
    sinopsis: "En su segundo año como justiciero, Batman investiga a un asesino serial que aterroriza Gotham.",
    elenco: [
      { id_actor_director: 41, nombre: "Matt Reeves", rol: "Director" },
      {
        id_actor_director: 15,
        nombre: "Robert Pattinson",
        rol: "Protagonista",
        personaje: "Bruce Wayne / Batman"
      }
    ],
    versiones: [
      {
        idioma: "Español",
        formato: "2D",
        duracion_minutos: 176,
        subtitulos: []
      },
      {
        idioma: "Español",
        formato: "Dolby Atmos",
        duracion_minutos: 176,
        subtitulos: []
      },
      {
        idioma: "Inglés",
        formato: "2D",
        duracion_minutos: 176,
        subtitulos: ["Español"]
      }
    ],
    clasificacion_por_pais: [
      { pais: "CO", clasificacion: "15+" },
      { pais: "US", clasificacion: "R" },
      { pais: "MX", clasificacion: "B15" }
    ]
  },
  {
    id_pelicula: 15,
    titulo: "Mad Max: Furia en el Camino",
    titulo_original: "Mad Max: Fury Road",
    sinopsis: "En un desierto postapocalíptico, Max se une a Furiosa en una huida a toda velocidad contra un tirano.",
    elenco: [
      { id_actor_director: 42, nombre: "George Miller", rol: "Director" },
      { id_actor_director: 16, nombre: "Charlize Theron", rol: "Protagonista", personaje: "Furiosa" },
      {
        id_actor_director: 43,
        nombre: "Tom Hardy",
        rol: "Protagonista",
        personaje: "Max Rockatansky"
      }
    ],
    versiones: [
      {
        idioma: "Español",
        formato: "2D",
        duracion_minutos: 120,
        subtitulos: []
      },
      {
        idioma: "Español",
        formato: "Dolby Atmos",
        duracion_minutos: 120,
        subtitulos: []
      },
      {
        idioma: "Inglés",
        formato: "2D",
        duracion_minutos: 120,
        subtitulos: ["Español"]
      }
    ],
    clasificacion_por_pais: [
      { pais: "CO", clasificacion: "18+" },
      { pais: "US", clasificacion: "R" },
      { pais: "MX", clasificacion: "C" }
    ]
  },
  {
    id_pelicula: 16,
    titulo: "Nosotros",
    titulo_original: "Us",
    sinopsis: "Una familia en vacaciones es atacada por sus dobles misteriosos.",
    elenco: [
      { id_actor_director: 44, nombre: "Jordan Peele", rol: "Director" },
      {
        id_actor_director: 17,
        nombre: "Lupita Nyong'o",
        rol: "Protagonista",
        personaje: "Adelaide Wilson / Red"
      },
      { id_actor_director: 45, nombre: "Winston Duke", rol: "Reparto", personaje: "Gabe Wilson" }
    ],
    versiones: [
      {
        idioma: "Español",
        formato: "2D",
        duracion_minutos: 116,
        subtitulos: []
      },
      {
        idioma: "Inglés",
        formato: "2D",
        duracion_minutos: 116,
        subtitulos: ["Español"]
      }
    ],
    clasificacion_por_pais: [
      { pais: "CO", clasificacion: "18+" },
      { pais: "US", clasificacion: "R" },
      { pais: "MX", clasificacion: "C" }
    ]
  },
  {
    id_pelicula: 17,
    titulo: "Wicked",
    titulo_original: "Wicked",
    sinopsis: "La historia de la amistad entre Elphaba y Glinda antes de convertirse en la Bruja Mala y la Bruja Buena del Oeste.",
    elenco: [
      { id_actor_director: 46, nombre: "Jon M. Chu", rol: "Director" },
      { id_actor_director: 47, nombre: "Cynthia Erivo", rol: "Protagonista", personaje: "Elphaba" }
    ],
    versiones: [
      {
        idioma: "Español",
        formato: "2D",
        duracion_minutos: 160,
        subtitulos: []
      },
      {
        idioma: "Inglés",
        formato: "2D",
        duracion_minutos: 160,
        subtitulos: ["Español"]
      }
    ],
    clasificacion_por_pais: [
      { pais: "CO", clasificacion: "7+" },
      { pais: "US", clasificacion: "PG" },
      { pais: "MX", clasificacion: "A" },
      { pais: "ES", clasificacion: "7" }
    ]
  },
  {
    id_pelicula: 18,
    titulo: "Intensamente 2",
    titulo_original: "Inside Out 2",
    sinopsis: "Riley entra en la adolescencia y llegan nuevas emociones a su mente, entre ellas la Ansiedad.",
    elenco: [
      { id_actor_director: 48, nombre: "Kelsey Mann", rol: "Director" },
      { id_actor_director: 49, nombre: "Amy Poehler", rol: "Voz principal", personaje: "Alegría" }
    ],
    versiones: [
      {
        idioma: "Español",
        formato: "2D",
        duracion_minutos: 96,
        subtitulos: []
      },
      {
        idioma: "Español",
        formato: "3D",
        duracion_minutos: 96,
        subtitulos: []
      }
    ],
    clasificacion_por_pais: [
      { pais: "CO", clasificacion: "TP" },
      { pais: "US", clasificacion: "G" },
      { pais: "MX", clasificacion: "AA" },
      { pais: "ES", clasificacion: "TP" }
    ]
  },
  {
    id_pelicula: 19,
    titulo: "Spider-Man: Sin Camino a Casa",
    titulo_original: "Spider-Man: No Way Home",
    sinopsis: "Peter Parker pide ayuda al Doctor Strange para que el mundo olvide su identidad, con consecuencias para el multiverso.",
    elenco: [
      { id_actor_director: 50, nombre: "Jon Watts", rol: "Director" },
      {
        id_actor_director: 13,
        nombre: "Tom Holland",
        rol: "Protagonista",
        personaje: "Peter Parker"
      },
      { id_actor_director: 14, nombre: "Zendaya", rol: "Reparto", personaje: "MJ" }
    ],
    versiones: [
      {
        idioma: "Español",
        formato: "2D",
        duracion_minutos: 148,
        subtitulos: []
      },
      {
        idioma: "Español",
        formato: "3D",
        duracion_minutos: 148,
        subtitulos: []
      },
      {
        idioma: "Inglés",
        formato: "2D",
        duracion_minutos: 148,
        subtitulos: ["Español"]
      }
    ],
    clasificacion_por_pais: [
      { pais: "CO", clasificacion: "12+" },
      { pais: "US", clasificacion: "PG-13" },
      { pais: "MX", clasificacion: "B" }
    ]
  },
  {
    id_pelicula: 20,
    titulo: "Barbie",
    titulo_original: "Barbie",
    sinopsis: "Barbie abandona Barbieland para descubrir el mundo real y qué significa ser humana.",
    elenco: [
      { id_actor_director: 51, nombre: "Greta Gerwig", rol: "Director" },
      { id_actor_director: 52, nombre: "Margot Robbie", rol: "Protagonista", personaje: "Barbie" }
    ],
    versiones: [
      {
        idioma: "Español",
        formato: "2D",
        duracion_minutos: 114,
        subtitulos: []
      },
      {
        idioma: "Inglés",
        formato: "2D",
        duracion_minutos: 114,
        subtitulos: ["Español"]
      }
    ],
    clasificacion_por_pais: [
      { pais: "CO", clasificacion: "12+" },
      { pais: "US", clasificacion: "PG-13" },
      { pais: "MX", clasificacion: "B" },
      { pais: "ES", clasificacion: "12" }
    ]
  },
  {
    id_pelicula: 21,
    titulo: "Anora",
    titulo_original: "Anora",
    sinopsis: "Una trabajadora sexual de Brooklyn se casa impulsivamente con el hijo de un oligarca ruso.",
    elenco: [
      { id_actor_director: 53, nombre: "Sean Baker", rol: "Director" },
      { id_actor_director: 54, nombre: "Mikey Madison", rol: "Protagonista", personaje: "Ani" }
    ],
    versiones: [
      {
        idioma: "Español",
        formato: "2D",
        duracion_minutos: 139,
        subtitulos: []
      },
      {
        idioma: "Inglés",
        formato: "2D",
        duracion_minutos: 139,
        subtitulos: ["Español"]
      }
    ],
    clasificacion_por_pais: [
      { pais: "CO", clasificacion: "18+" },
      { pais: "US", clasificacion: "R" },
      { pais: "MX", clasificacion: "C" }
    ]
  },
  {
    id_pelicula: 22,
    titulo: "El Brutalista",
    titulo_original: "The Brutalist",
    sinopsis: "Un arquitecto húngaro sobreviviente del Holocausto emigra a Estados Unidos y reconstruye su vida.",
    elenco: [
      { id_actor_director: 55, nombre: "Brady Corbet", rol: "Director" },
      {
        id_actor_director: 56,
        nombre: "Adrien Brody",
        rol: "Protagonista",
        personaje: "László Tóth"
      }
    ],
    versiones: [
      {
        idioma: "Español",
        formato: "2D",
        duracion_minutos: 215,
        subtitulos: []
      },
      {
        idioma: "Inglés",
        formato: "2D",
        duracion_minutos: 215,
        subtitulos: ["Español", "Portugués"]
      }
    ],
    clasificacion_por_pais: [
      { pais: "CO", clasificacion: "18+" },
      { pais: "US", clasificacion: "R" },
      { pais: "MX", clasificacion: "C" }
    ]
  },
  {
    id_pelicula: 23,
    titulo: "Pecadores",
    titulo_original: "Sinners",
    sinopsis: "Dos hermanos gemelos regresan al Misisipi de los años 30 para abrir un bar y enfrentan una amenaza sobrenatural.",
    elenco: [
      { id_actor_director: 57, nombre: "Ryan Coogler", rol: "Director" },
      {
        id_actor_director: 58,
        nombre: "Michael B. Jordan",
        rol: "Protagonista",
        personaje: "Smoke y Stack"
      }
    ],
    versiones: [
      {
        idioma: "Español",
        formato: "2D",
        duracion_minutos: 137,
        subtitulos: []
      },
      {
        idioma: "Inglés",
        formato: "2D",
        duracion_minutos: 137,
        subtitulos: ["Español"]
      }
    ],
    clasificacion_por_pais: [
      { pais: "CO", clasificacion: "18+" },
      { pais: "US", clasificacion: "R" },
      { pais: "MX", clasificacion: "C" }
    ]
  },
  {
    id_pelicula: 24,
    titulo: "Misión Imposible: Sentencia Final",
    titulo_original: "Mission: Impossible – The Final Reckoning",
    sinopsis: "Ethan Hunt y su equipo se enfrentan a una inteligencia artificial que amenaza al mundo.",
    elenco: [
      { id_actor_director: 59, nombre: "Christopher McQuarrie", rol: "Director" },
      { id_actor_director: 22, nombre: "Tom Cruise", rol: "Protagonista", personaje: "Ethan Hunt" }
    ],
    versiones: [
      {
        idioma: "Español",
        formato: "2D",
        duracion_minutos: 169,
        subtitulos: []
      },
      {
        idioma: "Inglés",
        formato: "2D",
        duracion_minutos: 169,
        subtitulos: ["Español"]
      }
    ],
    clasificacion_por_pais: [
      { pais: "CO", clasificacion: "12+" },
      { pais: "US", clasificacion: "PG-13" },
      { pais: "MX", clasificacion: "B" },
      { pais: "ES", clasificacion: "12" }
    ]
  },
  {
    id_pelicula: 25,
    titulo: "Cómo Entrenar a tu Dragón",
    titulo_original: "How to Train Your Dragon",
    sinopsis: "Hipo, un joven vikingo, entabla amistad con un dragón y desafía las tradiciones de su aldea.",
    elenco: [
      { id_actor_director: 60, nombre: "Dean DeBlois", rol: "Director" },
      { id_actor_director: 61, nombre: "Mason Thames", rol: "Protagonista", personaje: "Hipo" }
    ],
    versiones: [
      {
        idioma: "Español",
        formato: "2D",
        duracion_minutos: 125,
        subtitulos: []
      },
      {
        idioma: "Español",
        formato: "3D",
        duracion_minutos: 125,
        subtitulos: []
      }
    ],
    clasificacion_por_pais: [
      { pais: "CO", clasificacion: "7+" },
      { pais: "US", clasificacion: "PG" },
      { pais: "MX", clasificacion: "A" },
      { pais: "ES", clasificacion: "7" }
    ]
  },
  {
    id_pelicula: 26,
    titulo: "Superman",
    titulo_original: "Superman",
    sinopsis: "Superman equilibra su herencia kryptoniana y su vida como Clark Kent mientras enfrenta a Lex Luthor.",
    elenco: [
      { id_actor_director: 62, nombre: "James Gunn", rol: "Director" },
      {
        id_actor_director: 63,
        nombre: "David Corenswet",
        rol: "Protagonista",
        personaje: "Superman / Clark Kent"
      }
    ],
    versiones: [
      {
        idioma: "Español",
        formato: "2D",
        duracion_minutos: 129,
        subtitulos: []
      },
      {
        idioma: "Español",
        formato: "IMAX",
        duracion_minutos: 131,
        subtitulos: []
      },
      {
        idioma: "Inglés",
        formato: "2D",
        duracion_minutos: 129,
        subtitulos: ["Español"]
      }
    ],
    clasificacion_por_pais: [
      { pais: "CO", clasificacion: "12+" },
      { pais: "US", clasificacion: "PG-13" },
      { pais: "MX", clasificacion: "B" },
      { pais: "ES", clasificacion: "12" }
    ]
  },
  {
    id_pelicula: 27,
    titulo: "Armas",
    titulo_original: "Weapons",
    sinopsis: "Una noche, casi todos los niños de un mismo salón de clases desaparecen y un pueblo busca respuestas.",
    elenco: [
      { id_actor_director: 3, nombre: "Zach Cregger", rol: "Director" },
      {
        id_actor_director: 64,
        nombre: "Julia Garner",
        rol: "Protagonista",
        personaje: "Justine Gandy"
      }
    ],
    versiones: [
      {
        idioma: "Español",
        formato: "2D",
        duracion_minutos: 128,
        subtitulos: []
      },
      {
        idioma: "Inglés",
        formato: "2D",
        duracion_minutos: 128,
        subtitulos: ["Español"]
      }
    ],
    clasificacion_por_pais: [
      { pais: "CO", clasificacion: "18+" },
      { pais: "US", clasificacion: "R" },
      { pais: "MX", clasificacion: "C" }
    ]
  },
  {
    id_pelicula: 28,
    titulo: "Lilo y Stitch",
    titulo_original: "Lilo & Stitch",
    sinopsis: "Una niña hawaiana adopta a un extraterrestre fugitivo al que cree un perro.",
    elenco: [
      { id_actor_director: 65, nombre: "Dean Fleischer Camp", rol: "Director" },
      { id_actor_director: 66, nombre: "Maia Kealoha", rol: "Voz principal" }
    ],
    versiones: [
      {
        idioma: "Español",
        formato: "2D",
        duracion_minutos: 108,
        subtitulos: []
      },
      {
        idioma: "Español",
        formato: "3D",
        duracion_minutos: 108,
        subtitulos: []
      }
    ],
    clasificacion_por_pais: [
      { pais: "CO", clasificacion: "TP" },
      { pais: "US", clasificacion: "G" },
      { pais: "MX", clasificacion: "AA" },
      { pais: "ES", clasificacion: "TP" }
    ]
  },
  {
    id_pelicula: 29,
    titulo: "Gladiador II",
    titulo_original: "Gladiator II",
    sinopsis: "Lucio, hijo de Máximo, es llevado a Roma como gladiador y enfrenta a los emperadores.",
    elenco: [
      { id_actor_director: 67, nombre: "Ridley Scott", rol: "Director" },
      { id_actor_director: 68, nombre: "Paul Mescal", rol: "Protagonista", personaje: "Lucio" }
    ],
    versiones: [
      {
        idioma: "Español",
        formato: "2D",
        duracion_minutos: 148,
        subtitulos: []
      },
      {
        idioma: "Inglés",
        formato: "2D",
        duracion_minutos: 148,
        subtitulos: ["Español", "Portugués"]
      }
    ],
    clasificacion_por_pais: [
      { pais: "CO", clasificacion: "15+" },
      { pais: "US", clasificacion: "R" },
      { pais: "MX", clasificacion: "B15" },
      { pais: "ES", clasificacion: "16" }
    ]
  },
  {
    id_pelicula: 30,
    titulo: "Moana 2",
    titulo_original: "Moana 2",
    sinopsis: "Moana recibe un llamado de sus ancestros y emprende un viaje por los mares remotos de Oceanía.",
    elenco: [
      { id_actor_director: 69, nombre: "David Derrick Jr.", rol: "Director" },
      { id_actor_director: 70, nombre: "Auli'i Cravalho", rol: "Voz principal", personaje: "Moana" }
    ],
    versiones: [
      {
        idioma: "Español",
        formato: "2D",
        duracion_minutos: 100,
        subtitulos: []
      },
      {
        idioma: "Español",
        formato: "3D",
        duracion_minutos: 100,
        subtitulos: []
      }
    ],
    clasificacion_por_pais: [
      { pais: "CO", clasificacion: "TP" },
      { pais: "US", clasificacion: "G" },
      { pais: "MX", clasificacion: "AA" },
      { pais: "ES", clasificacion: "TP" }
    ]
  }
]);

/* ============================================================================
   2. requisitos_proyeccion
   ============================================================================ */
db.requisitos_proyeccion.insertMany([
  {
    id_funcion: 1,
    id_sala: 1,
    formato: "IMAX",
    requisitos: {
      tipo_proyector: "IMAX con láser dual 4K",
      tamano_pantalla_m: 18,
      relacion_aspecto: "1.90:1",
      canales_audio: "12 canales"
    },
    checklist: [
      { item: "Verificar alineación del proyector IMAX", obligatorio: true, verificado: true },
      {
        item: "Confirmar contenido IMAX cargado en el servidor",
        obligatorio: true,
        verificado: true
      },
      { item: "Probar audio de 12 canales", obligatorio: true, verificado: true },
      { item: "Limpiar lentes y pantalla", obligatorio: false, verificado: true }
    ],
    id_proyeccionista: 6
  },
  {
    id_funcion: 2,
    id_sala: 2,
    formato: "Dolby Atmos",
    requisitos: {
      canales_audio: "9.1.4",
      calibracion_audio: "Calibración Dolby cada 90 días",
      parlantes_techo: 8
    },
    checklist: [
      { item: "Calibrar parlantes de techo", obligatorio: true, verificado: true },
      { item: "Prueba de sonido con tráiler", obligatorio: true, verificado: true },
      { item: "Revisar nivel de volumen", obligatorio: false, verificado: false }
    ],
    id_proyeccionista: 6
  },
  {
    id_funcion: 3,
    id_sala: 3,
    formato: "3D",
    requisitos: { sistema_3d: "RealD", gafas_requeridas: true, brillo_minimo_fl: 14, gafas_por_asiento: 1 },
    checklist: [
      { item: "Verificar sistema 3D activo", obligatorio: true, verificado: true },
      { item: "Contar y desinfectar gafas", obligatorio: true, verificado: true },
      { item: "Revisar brillo mínimo de proyección", obligatorio: true, verificado: true },
      { item: "Reponer gafas de repuesto", obligatorio: false, verificado: true }
    ],
    id_proyeccionista: 6
  },
  {
    id_funcion: 5,
    id_sala: 6,
    formato: "3D",
    requisitos: { sistema_3d: "Dolby 3D", gafas_requeridas: true, brillo_minimo_fl: 12, gafas_por_asiento: 1 },
    checklist: [
      { item: "Verificar sistema 3D activo", obligatorio: true, verificado: true },
      { item: "Contar y desinfectar gafas", obligatorio: true, verificado: true },
      { item: "Revisar brillo mínimo de proyección", obligatorio: true, verificado: true },
      { item: "Reponer gafas de repuesto", obligatorio: false, verificado: true }
    ],
    id_proyeccionista: 7
  },
  {
    id_funcion: 6,
    id_sala: 7,
    formato: "Subtitulado",
    requisitos: {
      idioma_subtitulos: "Español",
      archivo_subtitulos: "spider_man_brand_new_day_ES.srt",
      fuente: "Arial 32",
      posicion: "Inferior centrada"
    },
    checklist: [
      { item: "Cargar archivo de subtítulos .srt", obligatorio: true, verificado: true },
      { item: "Verificar sincronía con el audio", obligatorio: true, verificado: true },
      { item: "Revisar tamaño y fuente del subtítulo", obligatorio: false, verificado: false }
    ],
    id_proyeccionista: 7
  },
  {
    id_funcion: 7,
    id_sala: 6,
    formato: "3D",
    requisitos: { sistema_3d: "Dolby 3D", gafas_requeridas: true, brillo_minimo_fl: 12, gafas_por_asiento: 1 },
    checklist: [
      { item: "Verificar sistema 3D activo", obligatorio: true, verificado: true },
      { item: "Contar y desinfectar gafas", obligatorio: true, verificado: true },
      { item: "Revisar brillo mínimo de proyección", obligatorio: true, verificado: true },
      { item: "Reponer gafas de repuesto", obligatorio: false, verificado: true }
    ],
    id_proyeccionista: 7
  },
  {
    id_funcion: 8,
    id_sala: 1,
    formato: "IMAX",
    requisitos: {
      tipo_proyector: "IMAX con láser dual 4K",
      tamano_pantalla_m: 18,
      relacion_aspecto: "1.90:1",
      canales_audio: "12 canales"
    },
    checklist: [
      { item: "Verificar alineación del proyector IMAX", obligatorio: true, verificado: true },
      {
        item: "Confirmar contenido IMAX cargado en el servidor",
        obligatorio: true,
        verificado: true
      },
      { item: "Probar audio de 12 canales", obligatorio: true, verificado: true },
      { item: "Limpiar lentes y pantalla", obligatorio: false, verificado: false }
    ],
    id_proyeccionista: 6
  },
  {
    id_funcion: 9,
    id_sala: 2,
    formato: "Dolby Atmos",
    requisitos: {
      canales_audio: "9.1.4",
      calibracion_audio: "Calibración Dolby cada 90 días",
      parlantes_techo: 8
    },
    checklist: [
      { item: "Calibrar parlantes de techo", obligatorio: true, verificado: true },
      { item: "Prueba de sonido con tráiler", obligatorio: true, verificado: true },
      { item: "Revisar nivel de volumen", obligatorio: false, verificado: true }
    ],
    id_proyeccionista: 6
  },
  {
    id_funcion: 10,
    id_sala: 3,
    formato: "3D",
    requisitos: { sistema_3d: "RealD", gafas_requeridas: true, brillo_minimo_fl: 14, gafas_por_asiento: 1 },
    checklist: [
      { item: "Verificar sistema 3D activo", obligatorio: true, verificado: true },
      { item: "Contar y desinfectar gafas", obligatorio: true, verificado: true },
      { item: "Revisar brillo mínimo de proyección", obligatorio: true, verificado: true },
      { item: "Reponer gafas de repuesto", obligatorio: false, verificado: false }
    ],
    id_proyeccionista: 6
  },
  {
    id_funcion: 11,
    id_sala: 7,
    formato: "Dolby Atmos",
    requisitos: {
      canales_audio: "7.1.2",
      calibracion_audio: "Calibración Dolby cada 90 días",
      parlantes_techo: 4
    },
    checklist: [
      { item: "Calibrar parlantes de techo", obligatorio: true, verificado: true },
      { item: "Prueba de sonido con tráiler", obligatorio: true, verificado: true },
      { item: "Revisar nivel de volumen", obligatorio: false, verificado: true }
    ],
    id_proyeccionista: 7
  },
  {
    id_funcion: 13,
    id_sala: 1,
    formato: "IMAX",
    requisitos: {
      tipo_proyector: "IMAX con láser dual 4K",
      tamano_pantalla_m: 18,
      relacion_aspecto: "1.90:1",
      canales_audio: "12 canales"
    },
    checklist: [
      { item: "Verificar alineación del proyector IMAX", obligatorio: true, verificado: true },
      {
        item: "Confirmar contenido IMAX cargado en el servidor",
        obligatorio: true,
        verificado: true
      },
      { item: "Probar audio de 12 canales", obligatorio: true, verificado: true },
      { item: "Limpiar lentes y pantalla", obligatorio: false, verificado: true }
    ],
    id_proyeccionista: 6,
    observaciones: "Función IMAX con alta demanda; se recomienda reforzar el personal de acomodación."
  },
  {
    id_funcion: 14,
    id_sala: 6,
    formato: "3D",
    requisitos: { sistema_3d: "Dolby 3D", gafas_requeridas: true, brillo_minimo_fl: 12, gafas_por_asiento: 1 },
    checklist: [
      { item: "Verificar sistema 3D activo", obligatorio: true, verificado: true },
      { item: "Contar y desinfectar gafas", obligatorio: true, verificado: true },
      { item: "Revisar brillo mínimo de proyección", obligatorio: true, verificado: true },
      { item: "Reponer gafas de repuesto", obligatorio: false, verificado: false }
    ],
    id_proyeccionista: 7
  },
  {
    id_funcion: 15,
    id_sala: 7,
    formato: "Dolby Atmos",
    requisitos: {
      canales_audio: "7.1.2",
      calibracion_audio: "Calibración Dolby cada 90 días",
      parlantes_techo: 4
    },
    checklist: [
      { item: "Calibrar parlantes de techo", obligatorio: true, verificado: true },
      { item: "Prueba de sonido con tráiler", obligatorio: true, verificado: true },
      { item: "Revisar nivel de volumen", obligatorio: false, verificado: true }
    ],
    id_proyeccionista: 7
  },
  {
    id_funcion: 16,
    id_sala: 3,
    formato: "3D",
    requisitos: { sistema_3d: "RealD", gafas_requeridas: true, brillo_minimo_fl: 14, gafas_por_asiento: 1 },
    checklist: [
      { item: "Verificar sistema 3D activo", obligatorio: true, verificado: true },
      { item: "Contar y desinfectar gafas", obligatorio: true, verificado: true },
      { item: "Revisar brillo mínimo de proyección", obligatorio: true, verificado: true },
      { item: "Reponer gafas de repuesto", obligatorio: false, verificado: false }
    ],
    id_proyeccionista: 6
  },
  {
    id_funcion: 17,
    id_sala: 2,
    formato: "Dolby Atmos",
    requisitos: {
      canales_audio: "9.1.4",
      calibracion_audio: "Calibración Dolby cada 90 días",
      parlantes_techo: 8
    },
    checklist: [
      { item: "Calibrar parlantes de techo", obligatorio: true, verificado: true },
      { item: "Prueba de sonido con tráiler", obligatorio: true, verificado: true },
      { item: "Revisar nivel de volumen", obligatorio: false, verificado: true }
    ],
    id_proyeccionista: 6
  },
  {
    id_funcion: 19,
    id_sala: 1,
    formato: "IMAX",
    requisitos: {
      tipo_proyector: "IMAX con láser dual 4K",
      tamano_pantalla_m: 18,
      relacion_aspecto: "1.90:1",
      canales_audio: "12 canales"
    },
    checklist: [
      { item: "Verificar alineación del proyector IMAX", obligatorio: true, verificado: false },
      {
        item: "Confirmar contenido IMAX cargado en el servidor",
        obligatorio: true,
        verificado: false
      },
      { item: "Probar audio de 12 canales", obligatorio: true, verificado: false },
      { item: "Limpiar lentes y pantalla", obligatorio: false, verificado: false }
    ],
    id_proyeccionista: 6
  },
  {
    id_funcion: 20,
    id_sala: 2,
    formato: "Dolby Atmos",
    requisitos: {
      canales_audio: "9.1.4",
      calibracion_audio: "Calibración Dolby cada 90 días",
      parlantes_techo: 8
    },
    checklist: [
      { item: "Calibrar parlantes de techo", obligatorio: true, verificado: false },
      { item: "Prueba de sonido con tráiler", obligatorio: true, verificado: false },
      { item: "Revisar nivel de volumen", obligatorio: false, verificado: false }
    ],
    id_proyeccionista: 6
  },
  {
    id_funcion: 21,
    id_sala: 3,
    formato: "3D",
    requisitos: { sistema_3d: "RealD", gafas_requeridas: true, brillo_minimo_fl: 14, gafas_por_asiento: 1 },
    checklist: [
      { item: "Verificar sistema 3D activo", obligatorio: true, verificado: false },
      { item: "Contar y desinfectar gafas", obligatorio: true, verificado: false },
      { item: "Revisar brillo mínimo de proyección", obligatorio: true, verificado: false },
      { item: "Reponer gafas de repuesto", obligatorio: false, verificado: false }
    ],
    id_proyeccionista: 6
  },
  {
    id_funcion: 23,
    id_sala: 6,
    formato: "3D",
    requisitos: { sistema_3d: "Dolby 3D", gafas_requeridas: true, brillo_minimo_fl: 12, gafas_por_asiento: 1 },
    checklist: [
      { item: "Verificar sistema 3D activo", obligatorio: true, verificado: false },
      { item: "Contar y desinfectar gafas", obligatorio: true, verificado: false },
      { item: "Revisar brillo mínimo de proyección", obligatorio: true, verificado: false },
      { item: "Reponer gafas de repuesto", obligatorio: false, verificado: false }
    ],
    id_proyeccionista: 7,
    observaciones: "Revisar lámparas del sistema 3D antes de la función nocturna."
  },
  {
    id_funcion: 24,
    id_sala: 7,
    formato: "Dolby Atmos",
    requisitos: {
      canales_audio: "7.1.2",
      calibracion_audio: "Calibración Dolby cada 90 días",
      parlantes_techo: 4
    },
    checklist: [
      { item: "Calibrar parlantes de techo", obligatorio: true, verificado: false },
      { item: "Prueba de sonido con tráiler", obligatorio: true, verificado: false },
      { item: "Revisar nivel de volumen", obligatorio: false, verificado: false }
    ],
    id_proyeccionista: 7
  },
  {
    id_funcion: 25,
    id_sala: 1,
    formato: "Subtitulado",
    requisitos: {
      idioma_subtitulos: "Español",
      archivo_subtitulos: "digger_ES.srt",
      fuente: "Arial 32",
      posicion: "Inferior centrada"
    },
    checklist: [
      { item: "Cargar archivo de subtítulos .srt", obligatorio: true, verificado: false },
      { item: "Verificar sincronía con el audio", obligatorio: true, verificado: false },
      { item: "Revisar tamaño y fuente del subtítulo", obligatorio: false, verificado: false }
    ],
    id_proyeccionista: 6
  },
  {
    id_funcion: 26,
    id_sala: 6,
    formato: "3D",
    requisitos: { sistema_3d: "Dolby 3D", gafas_requeridas: true, brillo_minimo_fl: 12, gafas_por_asiento: 1 },
    checklist: [
      { item: "Verificar sistema 3D activo", obligatorio: true, verificado: false },
      { item: "Contar y desinfectar gafas", obligatorio: true, verificado: false },
      { item: "Revisar brillo mínimo de proyección", obligatorio: true, verificado: false },
      { item: "Reponer gafas de repuesto", obligatorio: false, verificado: false }
    ],
    id_proyeccionista: 7
  },
  {
    id_funcion: 27,
    id_sala: 2,
    formato: "Dolby Atmos",
    requisitos: {
      canales_audio: "9.1.4",
      calibracion_audio: "Calibración Dolby cada 90 días",
      parlantes_techo: 8
    },
    checklist: [
      { item: "Calibrar parlantes de techo", obligatorio: true, verificado: false },
      { item: "Prueba de sonido con tráiler", obligatorio: true, verificado: false },
      { item: "Revisar nivel de volumen", obligatorio: false, verificado: false }
    ],
    id_proyeccionista: 6
  },
  {
    id_funcion: 28,
    id_sala: 3,
    formato: "3D",
    requisitos: { sistema_3d: "RealD", gafas_requeridas: true, brillo_minimo_fl: 14, gafas_por_asiento: 1 },
    checklist: [
      { item: "Verificar sistema 3D activo", obligatorio: true, verificado: false },
      { item: "Contar y desinfectar gafas", obligatorio: true, verificado: false },
      { item: "Revisar brillo mínimo de proyección", obligatorio: true, verificado: false },
      { item: "Reponer gafas de repuesto", obligatorio: false, verificado: false }
    ],
    id_proyeccionista: 6
  },
  {
    id_funcion: 29,
    id_sala: 1,
    formato: "IMAX",
    requisitos: {
      tipo_proyector: "IMAX con láser dual 4K",
      tamano_pantalla_m: 18,
      relacion_aspecto: "1.90:1",
      canales_audio: "12 canales"
    },
    checklist: [
      { item: "Verificar alineación del proyector IMAX", obligatorio: true, verificado: false },
      {
        item: "Confirmar contenido IMAX cargado en el servidor",
        obligatorio: true,
        verificado: false
      },
      { item: "Probar audio de 12 canales", obligatorio: true, verificado: false },
      { item: "Limpiar lentes y pantalla", obligatorio: false, verificado: false }
    ],
    id_proyeccionista: 6
  },
  {
    id_funcion: 30,
    id_sala: 2,
    formato: "Dolby Atmos",
    requisitos: {
      canales_audio: "9.1.4",
      calibracion_audio: "Calibración Dolby cada 90 días",
      parlantes_techo: 8
    },
    checklist: [
      { item: "Calibrar parlantes de techo", obligatorio: true, verificado: false },
      { item: "Prueba de sonido con tráiler", obligatorio: true, verificado: false },
      { item: "Revisar nivel de volumen", obligatorio: false, verificado: false }
    ],
    id_proyeccionista: 6
  },
  {
    id_funcion: 31,
    id_sala: 6,
    formato: "3D",
    requisitos: { sistema_3d: "Dolby 3D", gafas_requeridas: true, brillo_minimo_fl: 12, gafas_por_asiento: 1 },
    checklist: [
      { item: "Verificar sistema 3D activo", obligatorio: true, verificado: false },
      { item: "Contar y desinfectar gafas", obligatorio: true, verificado: false },
      { item: "Revisar brillo mínimo de proyección", obligatorio: true, verificado: false },
      { item: "Reponer gafas de repuesto", obligatorio: false, verificado: false }
    ],
    id_proyeccionista: 7
  },
  {
    id_funcion: 33,
    id_sala: 7,
    formato: "Dolby Atmos",
    requisitos: {
      canales_audio: "7.1.2",
      calibracion_audio: "Calibración Dolby cada 90 días",
      parlantes_techo: 4
    },
    checklist: [
      { item: "Calibrar parlantes de techo", obligatorio: true, verificado: false },
      { item: "Prueba de sonido con tráiler", obligatorio: true, verificado: false },
      { item: "Revisar nivel de volumen", obligatorio: false, verificado: false }
    ],
    id_proyeccionista: 7
  },
  {
    id_funcion: 34,
    id_sala: 3,
    formato: "3D",
    requisitos: { sistema_3d: "RealD", gafas_requeridas: true, brillo_minimo_fl: 14, gafas_por_asiento: 1 },
    checklist: [
      { item: "Verificar sistema 3D activo", obligatorio: true, verificado: false },
      { item: "Contar y desinfectar gafas", obligatorio: true, verificado: false },
      { item: "Revisar brillo mínimo de proyección", obligatorio: true, verificado: false },
      { item: "Reponer gafas de repuesto", obligatorio: false, verificado: false }
    ],
    id_proyeccionista: 6
  },
  {
    id_funcion: 35,
    id_sala: 1,
    formato: "IMAX",
    requisitos: {
      tipo_proyector: "IMAX con láser dual 4K",
      tamano_pantalla_m: 18,
      relacion_aspecto: "1.90:1",
      canales_audio: "12 canales"
    },
    checklist: [
      { item: "Verificar alineación del proyector IMAX", obligatorio: true, verificado: false },
      {
        item: "Confirmar contenido IMAX cargado en el servidor",
        obligatorio: true,
        verificado: false
      },
      { item: "Probar audio de 12 canales", obligatorio: true, verificado: false },
      { item: "Limpiar lentes y pantalla", obligatorio: false, verificado: false }
    ],
    id_proyeccionista: 6
  },
  {
    id_funcion: 36,
    id_sala: 6,
    formato: "3D",
    requisitos: { sistema_3d: "Dolby 3D", gafas_requeridas: true, brillo_minimo_fl: 12, gafas_por_asiento: 1 },
    checklist: [
      { item: "Verificar sistema 3D activo", obligatorio: true, verificado: false },
      { item: "Contar y desinfectar gafas", obligatorio: true, verificado: false },
      { item: "Revisar brillo mínimo de proyección", obligatorio: true, verificado: false },
      { item: "Reponer gafas de repuesto", obligatorio: false, verificado: false }
    ],
    id_proyeccionista: 7
  },
  {
    id_funcion: 37,
    id_sala: 5,
    formato: "Evento",
    requisitos: {
      montaje: {
        area_montaje_m2: 120,
        distribucion: "Auditorio",
        tarima: true,
        microfonos: 2,
        pantalla: "4K de 6 m"
      },
      charla: {
        id_contrato: 13,
        momento: "Antes de la función",
        duracion_minutos: 20,
        requiere_camerino: false,
        podio: true
      }
    },
    checklist: [
      { item: "Verificar micrófonos", obligatorio: true, verificado: true },
      { item: "Probar proyector y pantalla", obligatorio: true, verificado: true },
      { item: "Montar tarima y distribución de sillas", obligatorio: true, verificado: true },
      { item: "Confirmar camerino para el invitado", obligatorio: false, verificado: true }
    ],
    id_proyeccionista: 6,
    reserva: {
      id_espectador_solicitante: 10,
      fecha_solicitud: ISODate("2026-09-25T00:00:00Z"),
      fecha_evento: ISODate("2026-10-04T00:00:00Z"),
      anticipacion_dias: 9
    }
  },
  {
    id_funcion: 38,
    id_sala: 5,
    formato: "Evento",
    requisitos: {
      montaje: {
        area_montaje_m2: 120,
        distribucion: "Auditorio con mesa de panel",
        tarima: true,
        microfonos: 3,
        pantalla: "4K de 6 m"
      },
      charla: {
        id_contrato: 14,
        momento: "Después de la función",
        duracion_minutos: 30,
        requiere_camerino: true,
        podio: true
      }
    },
    checklist: [
      { item: "Verificar micrófonos", obligatorio: true, verificado: false },
      { item: "Probar proyector y pantalla", obligatorio: true, verificado: false },
      { item: "Montar tarima y distribución de sillas", obligatorio: true, verificado: false },
      { item: "Confirmar camerino para el invitado", obligatorio: false, verificado: false }
    ],
    id_proyeccionista: 6,
    reserva: {
      id_espectador_solicitante: 10,
      fecha_solicitud: ISODate("2026-10-08T00:00:00Z"),
      fecha_evento: ISODate("2026-10-18T00:00:00Z"),
      anticipacion_dias: 10
    }
  },
  {
    id_funcion: 39,
    id_sala: 5,
    formato: "Evento",
    requisitos: {
      montaje: {
        area_montaje_m2: 120,
        distribucion: "Auditorio",
        tarima: false,
        microfonos: 2,
        pantalla: "4K de 6 m"
      },
      charla: {
        id_contrato: 15,
        momento: "Antes de la función",
        duracion_minutos: 15,
        requiere_camerino: true,
        podio: false
      }
    },
    checklist: [
      { item: "Verificar micrófonos", obligatorio: true, verificado: false },
      { item: "Probar proyector y pantalla", obligatorio: true, verificado: false },
      { item: "Montar tarima y distribución de sillas", obligatorio: true, verificado: false },
      { item: "Confirmar camerino para el invitado", obligatorio: false, verificado: false }
    ],
    id_proyeccionista: 6,
    reserva: {
      id_espectador_solicitante: 14,
      fecha_solicitud: ISODate("2026-10-08T00:00:00Z"),
      fecha_evento: ISODate("2026-10-21T00:00:00Z"),
      anticipacion_dias: 13
    }
  },
  {
    id_funcion: 40,
    id_sala: 5,
    formato: "Evento",
    requisitos: {
      montaje: {
        area_montaje_m2: 120,
        distribucion: "Mesa redonda",
        tarima: true,
        microfonos: 2,
        pantalla: "4K de 6 m",
        catering: true
      },
      charla: {
        id_contrato: 16,
        momento: "Después de la función",
        duracion_minutos: 25,
        requiere_camerino: true,
        podio: true
      }
    },
    checklist: [
      { item: "Verificar micrófonos", obligatorio: true, verificado: false },
      { item: "Probar proyector y pantalla", obligatorio: true, verificado: false },
      { item: "Montar tarima y distribución de sillas", obligatorio: true, verificado: false },
      { item: "Confirmar camerino para el invitado", obligatorio: false, verificado: false }
    ],
    id_proyeccionista: 6,
    reserva: {
      id_espectador_solicitante: 20,
      fecha_solicitud: ISODate("2026-10-08T00:00:00Z"),
      fecha_evento: ISODate("2026-10-25T00:00:00Z"),
      anticipacion_dias: 17
    }
  }
]);

/* ============================================================================
   3. resenas_peliculas
   ============================================================================ */
db.resenas_peliculas.insertMany([
  {
    id_pelicula: 1,
    id_espectador: 1,
    id_funcion: 1,
    calificacion: 5,
    texto: "Una experiencia épica. La sala estaba llena y el sonido te metía de lleno en el viaje de Odiseo.",
    fecha: ISODate("2026-09-27T10:20:00Z"),
    etiquetas: ["épica", "sonido"],
    recomienda: true,
    util_votos: 12,
    respuesta_empresa: {
      texto: "¡Gracias por acompañarnos, Laura! Nos alegra que hayas disfrutado la función.",
      fecha: ISODate("2026-09-27T15:00:00Z"),
      id_staff: 10
    }
  },
  {
    id_pelicula: 1,
    id_espectador: 2,
    id_funcion: 1,
    calificacion: 4,
    texto: "Muy buena adaptación, aunque se me hizo un poco larga hacia el final.",
    fecha: ISODate("2026-09-27T18:40:00Z"),
    recomienda: true
  },
  {
    id_pelicula: 3,
    id_espectador: 3,
    id_funcion: 2,
    calificacion: 3,
    texto: "Buenos sustos pero el guion es predecible. Esperaba más del final.",
    fecha: ISODate("2026-09-28T12:00:00Z"),
    etiquetas: ["terror", "predecible"]
  },
  {
    id_pelicula: 3,
    id_espectador: 4,
    id_funcion: 2,
    calificacion: 2,
    texto: "No me gustó. Demasiado gore y poca historia.",
    fecha: ISODate("2026-09-28T20:30:00Z"),
    util_votos: 4,
    respuesta_empresa: {
      texto: "Lamentamos que la película no cumpliera tus expectativas, Jorge. Tu opinión nos ayuda a mejorar la programación.",
      fecha: ISODate("2026-09-29T09:00:00Z"),
      id_staff: 10
    }
  },
  {
    id_pelicula: 2,
    id_espectador: 5,
    id_funcion: 3,
    calificacion: 5,
    texto: "Increíble. Tom Holland y Zendaya están en su mejor momento y la acción no para.",
    fecha: ISODate("2026-09-28T09:10:00Z"),
    recomienda: true,
    util_votos: 20
  },
  {
    id_pelicula: 1,
    id_espectador: 6,
    id_funcion: 4,
    calificacion: 4,
    texto: "Muy buena, la fotografía es espectacular.",
    fecha: ISODate("2026-09-29T11:00:00Z")
  },
  {
    id_pelicula: 1,
    id_espectador: 7,
    id_funcion: 4,
    calificacion: 5,
    texto: "Pasé una gran tarde con mi esposo, la historia me conmovió mucho.",
    fecha: ISODate("2026-09-29T16:20:00Z"),
    recomienda: true
  },
  {
    id_pelicula: 1,
    id_espectador: 8,
    id_funcion: 5,
    calificacion: 4,
    texto: "Excelente sonido, la sala de Sibaté está muy bien equipada.",
    fecha: ISODate("2026-10-01T13:00:00Z"),
    etiquetas: ["sonido", "Sibaté"]
  },
  {
    id_pelicula: 1,
    id_espectador: 9,
    id_funcion: 5,
    calificacion: 3,
    texto: "Interesante pero muy extensa, necesitaba un intermedio.",
    fecha: ISODate("2026-10-01T14:30:00Z")
  },
  {
    id_pelicula: 2,
    id_espectador: 10,
    id_funcion: 6,
    calificacion: 4,
    texto: "Vimos la versión subtitulada y el audio original suma mucho a la película.",
    fecha: ISODate("2026-10-02T09:00:00Z"),
    etiquetas: ["subtitulada"],
    recomienda: true
  },
  {
    id_pelicula: 1,
    id_espectador: 11,
    id_funcion: 7,
    calificacion: 4,
    texto: "Buena película, la tarifa de estudiante ayuda mucho.",
    fecha: ISODate("2026-10-03T10:00:00Z")
  },
  {
    id_pelicula: 3,
    id_espectador: 12,
    id_funcion: 8,
    calificacion: 3,
    texto: "Entretenida pero nada nuevo dentro del género.",
    fecha: ISODate("2026-10-03T12:00:00Z")
  },
  {
    id_pelicula: 3,
    id_espectador: 13,
    id_funcion: 9,
    calificacion: 4,
    texto: "Mucha tensión durante toda la función.",
    fecha: ISODate("2026-10-04T10:30:00Z"),
    recomienda: true
  },
  {
    id_pelicula: 6,
    id_espectador: 33,
    id_funcion: 10,
    calificacion: 5,
    texto: "A mi hijo le encantó, se rió toda la función. Súper recomendada para niños.",
    fecha: ISODate("2026-10-04T09:00:00Z"),
    util_votos: 8,
    recomienda: true,
    respuesta_empresa: {
      texto: "¡Gracias, Mateo y familia! Los esperamos pronto en J'IDA Cinema.",
      fecha: ISODate("2026-10-04T12:00:00Z"),
      id_staff: 10
    }
  },
  {
    id_pelicula: 6,
    id_espectador: 15,
    id_funcion: 11,
    calificacion: 4,
    texto: "Divertida y tierna, ideal para ir en familia.",
    fecha: ISODate("2026-10-04T08:30:00Z")
  },
  {
    id_pelicula: 3,
    id_espectador: 16,
    id_funcion: 12,
    calificacion: 2,
    texto: "La función de las 9:30 terminó muy tarde y la película no valió la pena.",
    fecha: ISODate("2026-10-05T08:00:00Z")
  },
  {
    id_pelicula: 1,
    id_espectador: 17,
    id_funcion: 13,
    calificacion: 5,
    texto: "La vi en una sala impecable. Mi película favorita del año.",
    fecha: ISODate("2026-10-05T10:00:00Z"),
    recomienda: true,
    util_votos: 5
  },
  {
    id_pelicula: 2,
    id_espectador: 18,
    id_funcion: 14,
    calificacion: 4,
    texto: "Gran película, aunque algo recargada de efectos.",
    fecha: ISODate("2026-10-06T09:30:00Z")
  },
  {
    id_pelicula: 3,
    id_espectador: 19,
    id_funcion: 15,
    calificacion: 1,
    texto: "Aburrida y muy violenta. No la recomiendo.",
    fecha: ISODate("2026-10-07T08:00:00Z"),
    util_votos: 2,
    respuesta_empresa: {
      texto: "Gracias por tu comentario, Gloria. Lamentamos que la película no fuera de tu agrado.",
      fecha: ISODate("2026-10-07T15:00:00Z"),
      id_staff: 10
    }
  },
  {
    id_pelicula: 3,
    id_espectador: 20,
    id_funcion: 16,
    calificacion: 3,
    texto: "Buena ambientación, final flojo.",
    fecha: ISODate("2026-10-07T11:00:00Z")
  },
  {
    id_pelicula: 6,
    id_espectador: 34,
    id_funcion: 17,
    calificacion: 5,
    texto: "Mi hija la disfrutó muchísimo, se quedó cantando todo el camino a casa.",
    fecha: ISODate("2026-10-08T09:00:00Z")
  },
  {
    id_pelicula: 4,
    id_espectador: 22,
    id_funcion: 18,
    calificacion: 5,
    texto: "Una película profunda y muy bien actuada. Salí sin palabras.",
    fecha: ISODate("2026-10-08T09:15:00Z"),
    etiquetas: ["drama", "actuaciones"],
    recomienda: true,
    util_votos: 9
  },
  {
    id_pelicula: 4,
    id_espectador: 23,
    id_funcion: 18,
    calificacion: 4,
    texto: "Muy buena aunque emocionalmente pesada.",
    fecha: ISODate("2026-10-08T10:00:00Z")
  },
  {
    id_pelicula: 6,
    id_espectador: 10,
    id_funcion: 37,
    calificacion: 4,
    texto: "El evento con la charla estuvo muy bien organizado para nuestro equipo.",
    fecha: ISODate("2026-10-05T09:00:00Z"),
    etiquetas: ["evento", "charla"],
    recomienda: true,
    respuesta_empresa: {
      texto: "¡Gracias por confiar en nosotros para su evento!",
      fecha: ISODate("2026-10-05T11:00:00Z"),
      id_staff: 10
    }
  },
  {
    id_pelicula: 11,
    id_espectador: 1,
    calificacion: 5,
    texto: "Nolan en su mejor versión. Cillian Murphy está monumental.",
    fecha: ISODate("2026-02-02T11:00:00Z"),
    etiquetas: ["biografía", "actuaciones"],
    util_votos: 15
  },
  {
    id_pelicula: 12,
    id_espectador: 2,
    calificacion: 5,
    texto: "Una obra visual impresionante; la vi en IMAX y valió cada peso.",
    fecha: ISODate("2026-02-10T19:30:00Z"),
    etiquetas: ["IMAX"],
    recomienda: true
  },
  {
    id_pelicula: 13,
    id_espectador: 4,
    calificacion: 5,
    texto: "Volver a verla en pantalla grande fue emocionante. Sigue envejeciendo muy bien.",
    fecha: ISODate("2026-02-20T16:00:00Z"),
    util_votos: 7
  },
  {
    id_pelicula: 14,
    id_espectador: 8,
    calificacion: 4,
    texto: "Oscura y atmosférica. Pattinson funciona muy bien como Batman.",
    fecha: ISODate("2026-03-01T21:00:00Z")
  },
  {
    id_pelicula: 15,
    id_espectador: 12,
    calificacion: 5,
    texto: "Acción pura de principio a fin. Charlize Theron es lo mejor.",
    fecha: ISODate("2026-03-08T20:10:00Z"),
    recomienda: true
  },
  {
    id_pelicula: 16,
    id_espectador: 13,
    calificacion: 4,
    texto: "Terror inteligente con un gran trabajo de Lupita Nyong'o.",
    fecha: ISODate("2026-03-15T22:00:00Z")
  },
  {
    id_pelicula: 17,
    id_espectador: 24,
    calificacion: 5,
    texto: "Las voces y los números musicales son una maravilla.",
    fecha: ISODate("2026-03-20T18:00:00Z"),
    etiquetas: ["musical"],
    util_votos: 11,
    respuesta_empresa: {
      texto: "¡Qué alegría, Lina! Gracias por tu comentario.",
      fecha: ISODate("2026-03-21T09:00:00Z"),
      id_staff: 10
    }
  },
  {
    id_pelicula: 18,
    id_espectador: 35,
    calificacion: 5,
    texto: "Mi hijo se identificó con las emociones; muy bonita y divertida.",
    fecha: ISODate("2026-04-01T15:00:00Z")
  },
  {
    id_pelicula: 19,
    id_espectador: 6,
    calificacion: 4,
    texto: "Nostalgia pura, el final conmueve.",
    fecha: ISODate("2026-04-10T20:00:00Z"),
    recomienda: true
  },
  {
    id_pelicula: 20,
    id_espectador: 9,
    calificacion: 3,
    texto: "Divertida y colorida, aunque el mensaje queda algo diluido.",
    fecha: ISODate("2026-04-12T17:00:00Z"),
    etiquetas: ["comedia"]
  },
  {
    id_pelicula: 21,
    id_espectador: 14,
    calificacion: 4,
    texto: "Sorprendente mezcla de comedia y drama. Gran actuación de Mikey Madison.",
    fecha: ISODate("2026-04-25T19:00:00Z")
  },
  {
    id_pelicula: 22,
    id_espectador: 20,
    calificacion: 2,
    texto: "Demasiado larga y lenta para mi gusto, aunque es bella visualmente.",
    fecha: ISODate("2026-05-02T14:00:00Z"),
    util_votos: 3
  },
  {
    id_pelicula: 23,
    id_espectador: 28,
    calificacion: 5,
    texto: "Música, terror y una historia con mucha personalidad. Imperdible.",
    fecha: ISODate("2026-05-10T21:00:00Z"),
    recomienda: true,
    util_votos: 14,
    respuesta_empresa: {
      texto: "Gracias, Freddy. ¡Nos alegra que Pecadores te haya gustado!",
      fecha: ISODate("2026-05-11T10:00:00Z"),
      id_staff: 10
    }
  },
  {
    id_pelicula: 24,
    id_espectador: 26,
    calificacion: 4,
    texto: "Una despedida a la altura, con escenas de acción increíbles.",
    fecha: ISODate("2026-05-18T20:30:00Z")
  },
  {
    id_pelicula: 25,
    id_espectador: 27,
    calificacion: 5,
    texto: "La vi con mi sobrina y salimos fascinadas. Los dragones se ven espectaculares.",
    fecha: ISODate("2026-06-01T16:00:00Z"),
    etiquetas: ["familiar"]
  },
  {
    id_pelicula: 26,
    id_espectador: 29,
    calificacion: 3,
    texto: "Entretenida, pero la trama se siente apurada.",
    fecha: ISODate("2026-06-10T19:00:00Z")
  },
  {
    id_pelicula: 27,
    id_espectador: 30,
    calificacion: 4,
    texto: "Un misterio que mantiene la tensión hasta el final.",
    fecha: ISODate("2026-06-18T21:30:00Z")
  },
  {
    id_pelicula: 28,
    id_espectador: 31,
    calificacion: 3,
    texto: "Correcta para los niños, pero no aporta nada nuevo.",
    fecha: ISODate("2026-06-25T15:30:00Z")
  },
  {
    id_pelicula: 29,
    id_espectador: 32,
    calificacion: 4,
    texto: "Épica y bien filmada, con un reparto sólido.",
    fecha: ISODate("2026-07-05T20:00:00Z"),
    util_votos: 1
  },
  {
    id_pelicula: 30,
    id_espectador: 21,
    calificacion: 5,
    texto: "Una secuela divertida con muy buena música. Mis hijos la amaron.",
    fecha: ISODate("2026-07-15T14:30:00Z"),
    etiquetas: ["familiar", "música"]
  }
]);

/* ============================================================================
   4. reportes_incidentes
   ============================================================================ */
db.reportes_incidentes.insertMany([
  {
    tipo: "falla_tecnica",
    fecha_hora: ISODate("2026-09-26T15:10:00Z"),
    id_sede: 1,
    id_sala: 1,
    id_funcion: 1,
    id_staff_reporta: 6,
    severidad: "media",
    estado: "resuelto",
    descripcion: "Sonido distorsionado en la escena inicial.",
    detalle: { equipo: "Procesador de audio", codigo_error: "A-117", minutos_interrupcion: 5 },
    seguimiento: [
      {
        fecha: ISODate("2026-09-26T15:20:00Z"),
        accion: "Se reinició el procesador de audio",
        id_staff: 6
      },
      {
        fecha: ISODate("2026-09-26T16:10:00Z"),
        accion: "Se verificó el sonido con el tráiler de prueba",
        id_staff: 10
      }
    ]
  },
  {
    tipo: "falla_tecnica",
    fecha_hora: ISODate("2026-09-27T17:50:00Z"),
    id_sede: 1,
    id_sala: 2,
    id_funcion: 2,
    id_staff_reporta: 6,
    severidad: "alta",
    estado: "resuelto",
    descripcion: "El proyector se apagó a mitad de la función.",
    detalle: { equipo: "Proyector", codigo_error: "E-204", minutos_interrupcion: 12 },
    seguimiento: [
      {
        fecha: ISODate("2026-09-27T18:00:00Z"),
        accion: "Se reinició la lámpara del proyector",
        id_staff: 6
      },
      {
        fecha: ISODate("2026-09-27T18:50:00Z"),
        accion: "Se reanudó la función y se ofreció disculpa al público",
        id_staff: 10
      }
    ]
  },
  {
    tipo: "falla_tecnica",
    fecha_hora: ISODate("2026-09-29T09:15:00Z"),
    id_sede: 1,
    id_staff_reporta: 1,
    severidad: "media",
    estado: "resuelto",
    descripcion: "Terminal de boletería sin conexión al sistema de ventas.",
    detalle: { equipo: "Terminal de boletería", minutos_interrupcion: 40 },
    seguimiento: [
      {
        fecha: ISODate("2026-09-29T09:25:00Z"),
        accion: "Se vendió de forma manual con registro en papel",
        id_staff: 1
      },
      {
        fecha: ISODate("2026-09-29T10:15:00Z"),
        accion: "Se restableció la conexión de red y se digitaron las ventas",
        id_staff: 10
      }
    ]
  },
  {
    tipo: "falla_tecnica",
    fecha_hora: ISODate("2026-09-30T19:20:00Z"),
    id_sede: 2,
    id_sala: 6,
    id_funcion: 5,
    id_staff_reporta: 7,
    severidad: "media",
    estado: "resuelto",
    descripcion: "Volumen inestable durante los primeros minutos.",
    detalle: { equipo: "Procesador de audio", codigo_error: "A-090", minutos_interrupcion: 6 },
    seguimiento: [
      {
        fecha: ISODate("2026-09-30T19:30:00Z"),
        accion: "Se ajustó la ganancia del procesador de audio",
        id_staff: 7
      }
    ]
  },
  {
    tipo: "falla_tecnica",
    fecha_hora: ISODate("2026-10-01T20:45:00Z"),
    id_sede: 2,
    id_sala: 7,
    id_funcion: 6,
    id_staff_reporta: 7,
    severidad: "media",
    estado: "resuelto",
    descripcion: "Los subtítulos aparecían desfasados respecto al audio.",
    detalle: { equipo: "Servidor de subtítulos", minutos_interrupcion: 15 },
    seguimiento: [
      {
        fecha: ISODate("2026-10-01T20:55:00Z"),
        accion: "Se volvió a cargar el archivo de subtítulos",
        id_staff: 7
      },
      {
        fecha: ISODate("2026-10-01T21:45:00Z"),
        accion: "Se verificó la sincronía y se reanudó la función",
        id_staff: 7
      }
    ]
  },
  {
    tipo: "falla_tecnica",
    fecha_hora: ISODate("2026-10-02T13:00:00Z"),
    id_sede: 2,
    id_sala: 6,
    id_staff_reporta: 11,
    severidad: "baja",
    estado: "cerrado",
    descripcion: "Lector de códigos de boletas no reconocía algunos códigos.",
    detalle: { equipo: "Lector de boletas", minutos_interrupcion: 0 },
    seguimiento: [
      {
        fecha: ISODate("2026-10-02T13:10:00Z"),
        accion: "Se limpió el lector y se actualizó su firmware",
        id_staff: 11
      }
    ]
  },
  {
    tipo: "falla_tecnica",
    fecha_hora: ISODate("2026-10-03T11:30:00Z"),
    id_sede: 1,
    id_sala: 3,
    id_funcion: 10,
    id_staff_reporta: 6,
    severidad: "media",
    estado: "resuelto",
    descripcion: "El canal izquierdo del audio no funcionaba.",
    detalle: { equipo: "Sistema de audio", codigo_error: "A-032", minutos_interrupcion: 8 },
    seguimiento: [
      {
        fecha: ISODate("2026-10-03T11:40:00Z"),
        accion: "Se revisó el cableado del canal izquierdo",
        id_staff: 6
      },
      {
        fecha: ISODate("2026-10-03T12:30:00Z"),
        accion: "Se reemplazó el conector defectuoso",
        id_staff: 10
      }
    ]
  },
  {
    tipo: "falla_tecnica",
    fecha_hora: ISODate("2026-10-04T16:20:00Z"),
    id_sede: 1,
    id_sala: 1,
    id_funcion: 13,
    id_staff_reporta: 6,
    severidad: "baja",
    estado: "en_proceso",
    descripcion: "Píxeles muertos en una zona de la pantalla IMAX.",
    detalle: { equipo: "Pantalla", minutos_interrupcion: 0 },
    seguimiento: [
      {
        fecha: ISODate("2026-10-04T16:30:00Z"),
        accion: "Se documentó la falla con fotografías",
        id_staff: 6
      },
      {
        fecha: ISODate("2026-10-04T17:20:00Z"),
        accion: "Se solicitó visita del proveedor para revisión",
        id_staff: 10
      }
    ]
  },
  {
    tipo: "falla_tecnica",
    fecha_hora: ISODate("2026-10-05T20:05:00Z"),
    id_sede: 2,
    id_sala: 6,
    id_funcion: 14,
    id_staff_reporta: 7,
    severidad: "alta",
    estado: "resuelto",
    descripcion: "Falla de la lámpara durante el inicio de la función.",
    detalle: { equipo: "Proyector", codigo_error: "L-410", minutos_interrupcion: 18 },
    seguimiento: [
      {
        fecha: ISODate("2026-10-05T20:15:00Z"),
        accion: "Se cambió la lámpara del proyector",
        id_staff: 7
      },
      {
        fecha: ISODate("2026-10-05T21:05:00Z"),
        accion: "Se reinició la función desde el inicio",
        id_staff: 7
      }
    ]
  },
  {
    tipo: "falla_tecnica",
    fecha_hora: ISODate("2026-10-06T18:10:00Z"),
    id_sede: 2,
    id_sala: 7,
    id_funcion: 15,
    id_staff_reporta: 9,
    severidad: "baja",
    estado: "resuelto",
    descripcion: "Aire acondicionado de la sala sin funcionar correctamente.",
    detalle: { equipo: "Aire acondicionado", minutos_interrupcion: 0 },
    seguimiento: [
      {
        fecha: ISODate("2026-10-06T18:20:00Z"),
        accion: "Se reinició el equipo desde el panel de control",
        id_staff: 9
      }
    ]
  },
  {
    tipo: "falla_tecnica",
    fecha_hora: ISODate("2026-10-07T19:40:00Z"),
    id_sede: 1,
    id_sala: 4,
    id_funcion: 18,
    id_staff_reporta: 12,
    severidad: "critica",
    estado: "resuelto",
    descripcion: "Corte de energía en la sala durante la función.",
    detalle: { equipo: "Suministro eléctrico", codigo_error: "P-001", minutos_interrupcion: 25 },
    seguimiento: [
      {
        fecha: ISODate("2026-10-07T19:50:00Z"),
        accion: "Se activó la iluminación de emergencia y se atendió al público",
        id_staff: 12
      },
      {
        fecha: ISODate("2026-10-07T20:40:00Z"),
        accion: "Se restableció el suministro y se reanudó la función",
        id_staff: 10
      }
    ]
  },
  {
    tipo: "falla_tecnica",
    fecha_hora: ISODate("2026-10-08T10:30:00Z"),
    id_sede: 1,
    id_sala: 5,
    id_funcion: 38,
    id_staff_reporta: 10,
    severidad: "baja",
    estado: "abierto",
    descripcion: "Micrófono inalámbrico con interferencia durante la prueba previa del evento.",
    detalle: { equipo: "Micrófono inalámbrico", minutos_interrupcion: 0 },
    seguimiento: [
      {
        fecha: ISODate("2026-10-08T10:40:00Z"),
        accion: "Se registró la falla y se programó revisión antes del evento",
        id_staff: 10
      }
    ]
  },
  {
    tipo: "queja_servicio",
    fecha_hora: ISODate("2026-09-26T15:30:00Z"),
    id_sede: 1,
    id_sala: 1,
    id_funcion: 1,
    id_staff_reporta: 8,
    id_espectador: 2,
    severidad: "baja",
    estado: "cerrado",
    descripcion: "Espectadores hablando en voz alta durante la película.",
    detalle: { categoria: "sala", compensacion: "Boleta de cortesía" },
    seguimiento: [
      {
        fecha: ISODate("2026-09-26T15:40:00Z"),
        accion: "Se habló con los espectadores involucrados",
        id_staff: 8
      },
      {
        fecha: ISODate("2026-09-27T15:30:00Z"),
        accion: "Se entregó una boleta de cortesía",
        id_staff: 10
      }
    ]
  },
  {
    tipo: "queja_servicio",
    fecha_hora: ISODate("2026-09-27T20:15:00Z"),
    id_sede: 1,
    id_sala: 3,
    id_funcion: 3,
    id_staff_reporta: 8,
    id_espectador: 5,
    severidad: "media",
    estado: "resuelto",
    descripcion: "Asiento dañado que se hundía.",
    detalle: { categoria: "sala", compensacion: "Cambio de asiento" },
    seguimiento: [
      {
        fecha: ISODate("2026-09-27T20:25:00Z"),
        accion: "Se reubicó al espectador en otro asiento",
        id_staff: 8
      },
      {
        fecha: ISODate("2026-09-27T21:15:00Z"),
        accion: "Se reportó el asiento a mantenimiento",
        id_staff: 10
      }
    ]
  },
  {
    tipo: "queja_servicio",
    fecha_hora: ISODate("2026-09-28T14:50:00Z"),
    id_sede: 1,
    id_sala: 4,
    id_funcion: 4,
    id_staff_reporta: 12,
    id_espectador: 7,
    severidad: "media",
    estado: "resuelto",
    descripcion: "Persona mayor sin apoyo del acomodador para ubicar su asiento.",
    detalle: { categoria: "atencion", compensacion: "Disculpa y bebida de cortesía" },
    seguimiento: [
      {
        fecha: ISODate("2026-09-28T15:00:00Z"),
        accion: "Se presentó disculpa personal",
        id_staff: 12
      },
      {
        fecha: ISODate("2026-09-28T15:50:00Z"),
        accion: "Se reforzó el protocolo de apoyo a personas mayores",
        id_staff: 10
      }
    ]
  },
  {
    tipo: "queja_servicio",
    fecha_hora: ISODate("2026-09-30T19:40:00Z"),
    id_sede: 2,
    id_sala: 6,
    id_funcion: 5,
    id_staff_reporta: 5,
    id_espectador: 9,
    id_colaborador: 3,
    id_producto: 7,
    severidad: "alta",
    estado: "en_proceso",
    descripcion: "Roll de sushi con sabor extraño; se sospecha mala refrigeración.",
    detalle: { categoria: "confiteria", compensacion: "Reembolso del producto" },
    seguimiento: [
      {
        fecha: ISODate("2026-09-30T19:50:00Z"),
        accion: "Se retiró el lote del punto de venta",
        id_staff: 5
      },
      {
        fecha: ISODate("2026-09-30T20:40:00Z"),
        accion: "Se notificó al colaborador y se pidió revisión de la cadena de frío",
        id_staff: 5
      }
    ]
  },
  {
    tipo: "queja_servicio",
    fecha_hora: ISODate("2026-10-02T18:45:00Z"),
    id_sede: 1,
    id_sala: 1,
    id_funcion: 8,
    id_staff_reporta: 2,
    id_espectador: 12,
    severidad: "media",
    estado: "resuelto",
    descripcion: "Cobro duplicado de boletas en la taquilla.",
    detalle: { categoria: "precio", compensacion: "Reembolso de una boleta" },
    seguimiento: [
      {
        fecha: ISODate("2026-10-02T18:55:00Z"),
        accion: "Se verificó el cobro en el sistema",
        id_staff: 2
      },
      {
        fecha: ISODate("2026-10-02T19:45:00Z"),
        accion: "Se reembolsó el valor cobrado de más",
        id_staff: 10
      }
    ]
  },
  {
    tipo: "queja_servicio",
    fecha_hora: ISODate("2026-10-03T11:20:00Z"),
    id_sede: 1,
    id_sala: 3,
    id_funcion: 10,
    id_staff_reporta: 8,
    id_espectador: 33,
    severidad: "baja",
    estado: "cerrado",
    descripcion: "Sala con restos de palomitas antes de la función.",
    detalle: { categoria: "limpieza" },
    seguimiento: [
      {
        fecha: ISODate("2026-10-03T11:30:00Z"),
        accion: "Se realizó limpieza inmediata de la sala",
        id_staff: 8
      }
    ]
  },
  {
    tipo: "queja_servicio",
    fecha_hora: ISODate("2026-10-04T21:55:00Z"),
    id_sede: 1,
    id_sala: 4,
    id_funcion: 12,
    id_staff_reporta: 12,
    id_espectador: 16,
    severidad: "baja",
    estado: "abierto",
    descripcion: "Temperatura de la sala demasiado fría.",
    detalle: { categoria: "sala" },
    seguimiento: [
      {
        fecha: ISODate("2026-10-04T22:05:00Z"),
        accion: "Se registró la queja para revisar el aire acondicionado",
        id_staff: 12
      }
    ]
  },
  {
    tipo: "queja_servicio",
    fecha_hora: ISODate("2026-10-05T20:20:00Z"),
    id_sede: 2,
    id_sala: 6,
    id_funcion: 14,
    id_staff_reporta: 11,
    id_espectador: 18,
    severidad: "media",
    estado: "resuelto",
    descripcion: "Trato poco amable por parte del personal de taquilla.",
    detalle: { categoria: "atencion", compensacion: "Disculpa por escrito" },
    seguimiento: [
      {
        fecha: ISODate("2026-10-05T20:30:00Z"),
        accion: "Se habló con el empleado involucrado",
        id_staff: 11
      },
      {
        fecha: ISODate("2026-10-05T21:20:00Z"),
        accion: "Se envió disculpa por escrito al espectador",
        id_staff: 11
      }
    ]
  },
  {
    tipo: "queja_servicio",
    fecha_hora: ISODate("2026-10-06T18:30:00Z"),
    id_sede: 2,
    id_sala: 7,
    id_funcion: 15,
    id_staff_reporta: 5,
    id_espectador: 19,
    id_colaborador: 2,
    id_producto: 5,
    severidad: "baja",
    estado: "resuelto",
    descripcion: "Cappuccino servido frío.",
    detalle: { categoria: "confiteria", compensacion: "Cambio del producto" },
    seguimiento: [
      {
        fecha: ISODate("2026-10-06T18:40:00Z"),
        accion: "Se cambió el producto por uno nuevo",
        id_staff: 5
      }
    ]
  },
  {
    tipo: "queja_servicio",
    fecha_hora: ISODate("2026-10-07T15:40:00Z"),
    id_sede: 1,
    id_sala: 2,
    id_funcion: 17,
    id_staff_reporta: 4,
    id_espectador: 34,
    id_colaborador: 4,
    id_producto: 12,
    severidad: "media",
    estado: "resuelto",
    descripcion: "Combo de nachos entregado sin la gaseosa.",
    detalle: { categoria: "confiteria", compensacion: "Entrega de la gaseosa faltante" },
    seguimiento: [
      {
        fecha: ISODate("2026-10-07T15:50:00Z"),
        accion: "Se entregó la gaseosa faltante",
        id_staff: 4
      },
      {
        fecha: ISODate("2026-10-07T16:40:00Z"),
        accion: "Se recordó al personal verificar los combos",
        id_staff: 10
      }
    ]
  },
  {
    tipo: "queja_servicio",
    fecha_hora: ISODate("2026-10-07T19:50:00Z"),
    id_sede: 1,
    id_sala: 4,
    id_funcion: 18,
    id_staff_reporta: 1,
    id_espectador: 22,
    severidad: "media",
    estado: "resuelto",
    descripcion: "Se cobró tarifa general en miércoles, día del cine.",
    detalle: { categoria: "precio", compensacion: "Reembolso de la diferencia" },
    seguimiento: [
      { fecha: ISODate("2026-10-07T20:00:00Z"), accion: "Se verificó la venta", id_staff: 1 },
      {
        fecha: ISODate("2026-10-07T20:50:00Z"),
        accion: "Se reembolsó la diferencia de precio",
        id_staff: 10
      }
    ]
  },
  {
    tipo: "queja_servicio",
    fecha_hora: ISODate("2026-10-08T12:00:00Z"),
    id_sede: 2,
    id_staff_reporta: 3,
    id_espectador: 32,
    severidad: "baja",
    estado: "abierto",
    descripcion: "Falta señalización de parqueadero para personas mayores.",
    detalle: { categoria: "otro" },
    seguimiento: [
      {
        fecha: ISODate("2026-10-08T12:10:00Z"),
        accion: "Se registró la sugerencia para la administración de la sede",
        id_staff: 3
      }
    ]
  },
  {
    tipo: "incidente_seguridad",
    fecha_hora: ISODate("2026-09-27T21:40:00Z"),
    id_sede: 1,
    id_sala: 3,
    id_funcion: 3,
    id_staff_reporta: 8,
    id_espectador: 5,
    severidad: "alta",
    estado: "resuelto",
    descripcion: "Espectador se desmayó dentro de la sala.",
    detalle: { tipo_evento: "emergencia_medica", autoridades_notificadas: true, personas_afectadas: 1 },
    seguimiento: [
      {
        fecha: ISODate("2026-09-27T21:50:00Z"),
        accion: "Se detuvo la función y se atendió a la persona",
        id_staff: 8
      },
      {
        fecha: ISODate("2026-09-27T22:40:00Z"),
        accion: "Se llamó a una ambulancia y se acompañó a la persona hasta su llegada",
        id_staff: 10
      }
    ]
  },
  {
    tipo: "incidente_seguridad",
    fecha_hora: ISODate("2026-09-28T16:05:00Z"),
    id_sede: 1,
    id_sala: 4,
    id_funcion: 4,
    id_staff_reporta: 12,
    severidad: "alta",
    estado: "resuelto",
    descripcion: "Cortocircuito en un tomacorriente con evacuación parcial de la sala.",
    detalle: { tipo_evento: "evacuacion", autoridades_notificadas: true, personas_afectadas: 25 },
    seguimiento: [
      { fecha: ISODate("2026-09-28T16:15:00Z"), accion: "Se evacuó la zona afectada", id_staff: 12 },
      {
        fecha: ISODate("2026-09-28T17:05:00Z"),
        accion: "Los bomberos revisaron la instalación eléctrica",
        id_staff: 10
      }
    ]
  },
  {
    tipo: "incidente_seguridad",
    fecha_hora: ISODate("2026-09-30T22:10:00Z"),
    id_sede: 2,
    id_staff_reporta: 9,
    severidad: "media",
    estado: "en_proceso",
    descripcion: "Robo de un teléfono celular en el vestíbulo.",
    detalle: { tipo_evento: "robo", autoridades_notificadas: true, personas_afectadas: 1 },
    seguimiento: [
      {
        fecha: ISODate("2026-09-30T22:20:00Z"),
        accion: "Se revisaron las cámaras del vestíbulo",
        id_staff: 9
      },
      {
        fecha: ISODate("2026-09-30T23:10:00Z"),
        accion: "Se entregó el material a las autoridades",
        id_staff: 9
      }
    ]
  },
  {
    tipo: "incidente_seguridad",
    fecha_hora: ISODate("2026-10-01T20:50:00Z"),
    id_sede: 2,
    id_sala: 7,
    id_funcion: 6,
    id_staff_reporta: 9,
    severidad: "baja",
    estado: "cerrado",
    descripcion: "Discusión entre dos espectadores durante la función.",
    detalle: { tipo_evento: "pelea", autoridades_notificadas: false, personas_afectadas: 2 },
    seguimiento: [
      {
        fecha: ISODate("2026-10-01T21:00:00Z"),
        accion: "Se separó a los espectadores y se restableció la calma",
        id_staff: 9
      }
    ]
  },
  {
    tipo: "incidente_seguridad",
    fecha_hora: ISODate("2026-10-02T19:10:00Z"),
    id_sede: 1,
    id_sala: 1,
    id_funcion: 8,
    id_staff_reporta: 8,
    severidad: "media",
    estado: "resuelto",
    descripcion: "Pelea entre dos espectadores en la sala.",
    detalle: { tipo_evento: "pelea", autoridades_notificadas: false, personas_afectadas: 2 },
    seguimiento: [
      {
        fecha: ISODate("2026-10-02T19:20:00Z"),
        accion: "Se retiró a los involucrados de la sala",
        id_staff: 8
      },
      {
        fecha: ISODate("2026-10-02T20:10:00Z"),
        accion: "Se registró el incidente y se vetó el ingreso por el día",
        id_staff: 10
      }
    ]
  },
  {
    tipo: "incidente_seguridad",
    fecha_hora: ISODate("2026-10-03T14:40:00Z"),
    id_sede: 2,
    id_sala: 7,
    id_funcion: 11,
    id_staff_reporta: 9,
    id_espectador: 15,
    severidad: "media",
    estado: "resuelto",
    descripcion: "Niño con un golpe en la cabeza dentro de la sala.",
    detalle: { tipo_evento: "emergencia_medica", autoridades_notificadas: true, personas_afectadas: 1 },
    seguimiento: [
      { fecha: ISODate("2026-10-03T14:50:00Z"), accion: "Se brindó primeros auxilios", id_staff: 9 },
      {
        fecha: ISODate("2026-10-03T15:40:00Z"),
        accion: "Se contactó al servicio de emergencias y a la familia",
        id_staff: 9
      }
    ]
  },
  {
    tipo: "incidente_seguridad",
    fecha_hora: ISODate("2026-10-03T22:00:00Z"),
    id_sede: 1,
    id_sala: 2,
    id_funcion: 9,
    id_staff_reporta: 12,
    severidad: "baja",
    estado: "cerrado",
    descripcion: "Ingreso sin boleta por la salida de emergencia.",
    detalle: { tipo_evento: "acceso_no_autorizado", autoridades_notificadas: false, personas_afectadas: 0 },
    seguimiento: [
      {
        fecha: ISODate("2026-10-03T22:10:00Z"),
        accion: "Se identificó a la persona y se le pidió salir",
        id_staff: 12
      },
      {
        fecha: ISODate("2026-10-04T22:00:00Z"),
        accion: "Se reforzó el control de la puerta de emergencia",
        id_staff: 10
      }
    ]
  },
  {
    tipo: "incidente_seguridad",
    fecha_hora: ISODate("2026-10-04T22:30:00Z"),
    id_sede: 1,
    id_sala: 4,
    id_funcion: 12,
    id_staff_reporta: 8,
    severidad: "alta",
    estado: "resuelto",
    descripcion: "Alarma de incendio activada por error con evacuación de la sala.",
    detalle: { tipo_evento: "evacuacion", autoridades_notificadas: true, personas_afectadas: 60 },
    seguimiento: [
      {
        fecha: ISODate("2026-10-04T22:40:00Z"),
        accion: "Se evacuó la sala por las salidas de emergencia",
        id_staff: 8
      },
      {
        fecha: ISODate("2026-10-04T23:30:00Z"),
        accion: "Los bomberos confirmaron que era una falsa alarma",
        id_staff: 10
      }
    ]
  },
  {
    tipo: "incidente_seguridad",
    fecha_hora: ISODate("2026-10-05T09:00:00Z"),
    id_sede: 2,
    id_staff_reporta: 5,
    severidad: "alta",
    estado: "en_proceso",
    descripcion: "Intento de robo en la caja de la confitería.",
    detalle: { tipo_evento: "robo", autoridades_notificadas: true, personas_afectadas: 0 },
    seguimiento: [
      {
        fecha: ISODate("2026-10-05T09:10:00Z"),
        accion: "Se aseguró la caja y se llamó a las autoridades",
        id_staff: 5
      },
      {
        fecha: ISODate("2026-10-05T10:00:00Z"),
        accion: "Se inició revisión de las cámaras de seguridad",
        id_staff: 5
      }
    ]
  },
  {
    tipo: "incidente_seguridad",
    fecha_hora: ISODate("2026-10-06T21:30:00Z"),
    id_sede: 1,
    id_sala: 3,
    id_funcion: 16,
    id_staff_reporta: 12,
    severidad: "baja",
    estado: "resuelto",
    descripcion: "Espectadora con crisis de ansiedad durante la función.",
    detalle: { tipo_evento: "emergencia_medica", autoridades_notificadas: false, personas_afectadas: 1 },
    seguimiento: [
      {
        fecha: ISODate("2026-10-06T21:40:00Z"),
        accion: "Se acompañó a la persona fuera de la sala",
        id_staff: 12
      },
      {
        fecha: ISODate("2026-10-06T22:30:00Z"),
        accion: "Se verificó que estuviera bien antes de su salida",
        id_staff: 10
      }
    ]
  },
  {
    tipo: "incidente_seguridad",
    fecha_hora: ISODate("2026-10-07T20:15:00Z"),
    id_sede: 1,
    id_sala: 4,
    id_funcion: 18,
    id_staff_reporta: 12,
    severidad: "media",
    estado: "resuelto",
    descripcion: "Menor intentó ingresar a una función 15+ con boleta ajena.",
    detalle: { tipo_evento: "acceso_no_autorizado", autoridades_notificadas: false, personas_afectadas: 1 },
    seguimiento: [
      {
        fecha: ISODate("2026-10-07T20:25:00Z"),
        accion: "Se impidió el ingreso del menor",
        id_staff: 12
      },
      { fecha: ISODate("2026-10-07T21:15:00Z"), accion: "Se informó al acudiente", id_staff: 10 }
    ]
  },
  {
    tipo: "incidente_seguridad",
    fecha_hora: ISODate("2026-10-08T08:45:00Z"),
    id_sede: 1,
    id_sala: 5,
    id_staff_reporta: 10,
    severidad: "critica",
    estado: "abierto",
    descripcion: "Robo de un equipo de sonido de la sala de eventos.",
    detalle: { tipo_evento: "robo", autoridades_notificadas: true, personas_afectadas: 0 },
    seguimiento: [
      {
        fecha: ISODate("2026-10-08T08:55:00Z"),
        accion: "Se denunció el hecho ante las autoridades y se reservó el material de cámaras",
        id_staff: 10
      }
    ]
  }
]);

/* ============================================================================
   5. VERIFICACIÓN: conteo por colección (mínimo exigido: 30)
   ============================================================================ */
print("\n=== Documentos por colección ===");
["fichas_tecnicas_peliculas", "requisitos_proyeccion", "resenas_peliculas", "reportes_incidentes"].forEach(n => {
  print(n + ": " + db.getCollection(n).countDocuments());
});

// FIN DEL SCRIPT
