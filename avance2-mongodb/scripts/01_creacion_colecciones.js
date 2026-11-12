/* ============================================================================
   J'IDA Cinema - AVANCE 2 - 01_creacion_colecciones.js
   Capa documental (MongoDB)

   EJECUCIÓN (mongosh)

   CONTENIDO
     0. Base de datos y limpieza
     1. fichas_tecnicas_peliculas   ($jsonSchema + índices)
     2. requisitos_proyeccion       ($jsonSchema + índices)
     3. resenas_peliculas           ($jsonSchema + índices)
     4. reportes_incidentes         ($jsonSchema + índices)
     5. Verificación y pruebas de validación (inserts que DEBEN fallar)

   IDENTIFICADORES COMPARTIDOS CON POSTGRESQL (sin FK entre motores: la
   integridad referencial la valida la aplicación)
     id_pelicula          -> Pelicula.Id_Pelicula
     id_actor_director    -> Actor_Director.Id_Actor_Director
     id_funcion           -> Funcion.Id_Funcion
     id_sala              -> Sala.Id_Sala
     id_sede              -> Sede.Id_Sede
     id_staff*            -> Staff.Id_Staff
     id_espectador*       -> Espectador.Id_Espectador
     id_colaborador       -> Colaborador.Id_Colaborador
     id_producto          -> Producto_Confiteria.Id_Producto
     id_contrato          -> Contrato.Id_Contrato

   $jsonSchema en las 4 colecciones (grupo de 5).
   ============================================================================ */


/* ============================================================================
   0. BASE DE DATOS Y LIMPIEZA
   ============================================================================ */
use("jida_cinema");

db.fichas_tecnicas_peliculas.drop();
db.requisitos_proyeccion.drop();
db.resenas_peliculas.drop();
db.reportes_incidentes.drop();


/* ============================================================================
   1. fichas_tecnicas_peliculas
   Una ficha por película. Estructura variable: elenco, versiones (idioma /
   formato / duración) y clasificación por país cambian entre películas.
   Embebido: elenco, versiones, clasificacion_por_pais.
   Referenciado: id_pelicula (PostgreSQL), id_actor_director dentro del elenco.
   ============================================================================ */
db.createCollection("fichas_tecnicas_peliculas", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      title: "Ficha técnica de película",
      required: ["id_pelicula", "titulo", "elenco", "versiones", "clasificacion_por_pais"],
      properties: {
        id_pelicula:     { bsonType: "number", minimum: 1, multipleOf: 1, description: "Id_Pelicula en PostgreSQL (identificador compartido)" },
        titulo:          { bsonType: "string", minLength: 1, description: "Título en cartelera" },
        titulo_original: { bsonType: "string", minLength: 1, description: "Título original de la película" },
        sinopsis:        { bsonType: "string", minLength: 1, description: "Resumen de la película" },
        elenco: {
          bsonType: "array", minItems: 1,
          description: "Participantes de la película (embebido)",
          items: {
            bsonType: "object",
            required: ["id_actor_director", "nombre", "rol"],
            properties: {
              id_actor_director: { bsonType: "number", minimum: 1, multipleOf: 1, description: "Id_Actor_Director en PostgreSQL" },
              nombre:    { bsonType: "string", minLength: 1, description: "Nombre del actor o director (copia de lectura)" },
              rol:       { enum: ["Director", "Protagonista", "Reparto", "Voz principal"],
                           description: "Mismos valores usados en Act_Dir_Pel.Rol" },
              personaje: { bsonType: "string", minLength: 1, description: "Personaje interpretado (si aplica)" }
            }
          }
        },
        versiones: {
          bsonType: "array", minItems: 1,
          description: "Versiones disponibles: idioma, formato y duración propia",
          items: {
            bsonType: "object",
            required: ["idioma", "formato", "duracion_minutos"],
            properties: {
              idioma:           { bsonType: "string", minLength: 1, description: "Idioma de audio de la versión" },
              formato:          { enum: ["2D", "3D", "IMAX", "Dolby Atmos"] },
              duracion_minutos: { bsonType: "number", minimum: 1, multipleOf: 1 },
              subtitulos: {
                bsonType: "array",
                description: "Idiomas de subtítulos disponibles (puede ser vacío)",
                items: { bsonType: "string", minLength: 1, description: "Idioma del subtítulo" }
              }
            }
          }
        },
        clasificacion_por_pais: {
          bsonType: "array", minItems: 1,
          description: "Clasificación por edad según cada país",
          items: {
            bsonType: "object",
            required: ["pais", "clasificacion"],
            properties: {
              pais:          { bsonType: "string", pattern: "^[A-Z]{2}$",
                               description: "Código ISO de 2 letras, ej. CO, US" },
              clasificacion: { bsonType: "string", minLength: 1, description: "Clasificación en ese país, ej. 12+, PG-13" }
            }
          }
        }
      }
    }
  },
  validationLevel: "strict",
  validationAction: "error"
});

// Un documento por película
db.fichas_tecnicas_peliculas.createIndex({ id_pelicula: 1 }, { unique: true, name: "uq_ficha_id_pelicula" });
// Búsquedas por persona del elenco
db.fichas_tecnicas_peliculas.createIndex({ "elenco.id_actor_director": 1 }, { name: "idx_ficha_elenco" });
// Búsqueda por título
db.fichas_tecnicas_peliculas.createIndex({ titulo: 1 }, { name: "idx_ficha_titulo" });


/* ============================================================================
   2. requisitos_proyeccion
   Requerimientos técnicos de una función especial. El contenido de
   "requisitos" cambia según el formato (IMAX, 3D, Dolby Atmos, Subtitulado o
   Evento), por eso el esquema usa anyOf: cada formato exige sus propios campos.
   Un Evento (sala de eventos) exige además la reserva con >= 7 días de
   anticipación.
   Embebido: requisitos, checklist, reserva.
   Referenciado: id_funcion, id_sala, id_proyeccionista, id_espectador_solicitante,
                 id_contrato (todos de PostgreSQL).
   ============================================================================ */
db.createCollection("requisitos_proyeccion", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      title: "Requisitos técnicos de función especial",
      required: ["id_funcion", "id_sala", "formato", "requisitos", "checklist", "id_proyeccionista"],
      properties: {
        id_funcion:        { bsonType: "number", minimum: 1, multipleOf: 1, description: "Id_Funcion en PostgreSQL (identificador compartido)" },
        id_sala:           { bsonType: "number", minimum: 1, multipleOf: 1, description: "Id_Sala en PostgreSQL" },
        id_proyeccionista: { bsonType: "number", minimum: 1, multipleOf: 1, description: "Id_Staff del proyeccionista responsable" },
        formato: {
          enum: ["IMAX", "3D", "Dolby Atmos", "Subtitulado", "Evento"],
          description: "Tipo de función especial"
        },
        requisitos: {
          bsonType: "object",
          description: "Campos técnicos variables según el formato (ver anyOf)"
        },
        checklist: {
          bsonType: "array", minItems: 1,
          items: {
            bsonType: "object",
            required: ["item", "obligatorio", "verificado"],
            properties: {
              item:        { bsonType: "string", minLength: 1, description: "Tarea de verificación" },
              obligatorio: { bsonType: "bool" },
              verificado:  { bsonType: "bool" }
            }
          }
        },
        observaciones: {
          bsonType: "string", minLength: 1,
          description: "Nota libre del equipo sobre la función (opcional)"
        },
        reserva: {
          bsonType: "object",
          description: "Solo para formato Evento: reserva de la sala de eventos",
          required: ["id_espectador_solicitante", "fecha_solicitud", "fecha_evento", "anticipacion_dias"],
          properties: {
            id_espectador_solicitante: { bsonType: "number", minimum: 1, multipleOf: 1, description: "Id_Espectador que reserva (cliente o empresa)" },
            fecha_solicitud:  { bsonType: "date" },
            fecha_evento:     { bsonType: "date" },
            anticipacion_dias: {
              bsonType: "number", minimum: 7, multipleOf: 1,
              description: "Regla del negocio: reserva con mínimo 7 días de anticipación"
            }
          }
        }
      },
      // Cada formato exige sus propios campos dentro de "requisitos"
      anyOf: [
        { properties: { formato: { enum: ["IMAX"] },
                        requisitos: { required: ["tipo_proyector", "tamano_pantalla_m"] } } },
        { properties: { formato: { enum: ["3D"] },
                        requisitos: { required: ["sistema_3d", "gafas_requeridas"] } } },
        { properties: { formato: { enum: ["Dolby Atmos"] },
                        requisitos: { required: ["canales_audio", "calibracion_audio"] } } },
        { properties: { formato: { enum: ["Subtitulado"] },
                        requisitos: { required: ["idioma_subtitulos", "archivo_subtitulos"] } } },
        { required: ["reserva"],
          properties: { formato: { enum: ["Evento"] },
                        requisitos: { required: ["montaje"] } } }
      ]
    }
  },
  validationLevel: "strict",
  validationAction: "error"
});

// Un documento de requisitos por función
db.requisitos_proyeccion.createIndex({ id_funcion: 1 }, { unique: true, name: "uq_req_id_funcion" });
db.requisitos_proyeccion.createIndex({ id_sala: 1 },    { name: "idx_req_sala" });
db.requisitos_proyeccion.createIndex({ formato: 1 },    { name: "idx_req_formato" });


/* ============================================================================
   3. resenas_peliculas
   Volumen alto y esquema poco uniforme: solo cinco campos son obligatorios;
   etiquetas, recomienda, util_votos, id_funcion pueden o no existir.
   Embebido: respuesta_empresa (relación 1 a 0..1).
   Referenciado: id_pelicula, id_espectador, id_funcion, id_staff (PostgreSQL).
   NO se embeben dentro de la ficha: crecen sin límite.
   ============================================================================ */
db.createCollection("resenas_peliculas", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      title: "Reseña de película",
      required: ["id_pelicula", "id_espectador", "calificacion", "texto", "fecha"],
      properties: {
        id_pelicula:   { bsonType: "number", minimum: 1, multipleOf: 1, description: "Id_Pelicula en PostgreSQL (identificador compartido)" },
        id_espectador: { bsonType: "number", minimum: 1, multipleOf: 1, description: "Id_Espectador en PostgreSQL (identificador compartido)" },
        id_funcion:    { bsonType: "number", minimum: 1, multipleOf: 1, description: "Función a la que asistió (opcional)" },
        calificacion:  { bsonType: "number", minimum: 1, maximum: 5, multipleOf: 1,
                         description: "Entero de 1 a 5" },
        texto:         { bsonType: "string", minLength: 1, description: "Texto libre de la reseña" },
        fecha:         { bsonType: "date" },
        etiquetas:     { bsonType: "array", items: { bsonType: "string", minLength: 1, description: "Etiqueta libre" } },
        recomienda:    { bsonType: "bool" },
        util_votos:    { bsonType: "number", minimum: 0, multipleOf: 1 },
        respuesta_empresa: {
          bsonType: "object",
          required: ["texto", "fecha"],
          properties: {
            texto:    { bsonType: "string", minLength: 1, description: "Respuesta de la empresa" },
            fecha:    { bsonType: "date" },
            id_staff: { bsonType: "number", minimum: 1, multipleOf: 1, description: "Id_Staff que respondió" }
          }
        }
      }
    }
  },
  validationLevel: "strict",
  validationAction: "error"
});

// Listado de reseñas de una película, más recientes primero
db.resenas_peliculas.createIndex({ id_pelicula: 1, fecha: -1 }, { name: "idx_resena_pelicula_fecha" });
// Reseñas de un espectador
db.resenas_peliculas.createIndex({ id_espectador: 1 },          { name: "idx_resena_espectador" });
// Regla: un espectador reseña una película una sola vez
db.resenas_peliculas.createIndex({ id_pelicula: 1, id_espectador: 1 }, { unique: true, name: "uq_resena_pelicula_espectador" });


/* ============================================================================
   4. reportes_incidentes
   Patrón polimórfico: los campos comunes están en la raíz y "detalle" cambia
   según "tipo" (falla técnica, queja de servicio, incidente de seguridad).
   Embebido: detalle, seguimiento.
   Referenciado: id_sede, id_sala, id_funcion, id_staff_reporta, id_espectador,
                 id_colaborador, id_producto (PostgreSQL). Los dos últimos
                 permiten quejas sobre productos de un colaborador de confitería.
   ============================================================================ */
db.createCollection("reportes_incidentes", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      title: "Reporte de incidente",
      required: ["tipo", "fecha_hora", "id_sede", "severidad", "estado", "descripcion", "detalle"],
      properties: {
        tipo:      { enum: ["falla_tecnica", "queja_servicio", "incidente_seguridad"] },
        fecha_hora: { bsonType: "date" },
        id_sede:   { bsonType: "number", minimum: 1, multipleOf: 1, description: "Id_Sede en PostgreSQL (identificador compartido)" },
        id_sala:   { bsonType: "number", minimum: 1, multipleOf: 1, description: "Id_Sala en PostgreSQL (opcional)" },
        id_funcion: { bsonType: "number", minimum: 1, multipleOf: 1, description: "Id_Funcion en PostgreSQL (opcional)" },
        id_staff_reporta: { bsonType: "number", minimum: 1, multipleOf: 1, description: "Id_Staff que registra el reporte (opcional)" },
        id_espectador:    { bsonType: "number", minimum: 1, multipleOf: 1, description: "Id_Espectador involucrado (opcional)" },
        id_colaborador:   { bsonType: "number", minimum: 1, multipleOf: 1, description: "Id_Colaborador, si el reporte es sobre un producto aliado (opcional)" },
        id_producto:      { bsonType: "number", minimum: 1, multipleOf: 1, description: "Id_Producto de confitería involucrado (opcional)" },
        severidad: { enum: ["baja", "media", "alta", "critica"] },
        estado:    { enum: ["abierto", "en_proceso", "resuelto", "cerrado"] },
        descripcion: { bsonType: "string", minLength: 1, description: "Descripción general del incidente" },
        detalle: {
          bsonType: "object",
          description: "Campos específicos según tipo (ver anyOf)"
        },
        seguimiento: {
          bsonType: "array",
          description: "Historial de acciones tomadas (embebido)",
          items: {
            bsonType: "object",
            required: ["fecha", "accion"],
            properties: {
              fecha:    { bsonType: "date" },
              accion:   { bsonType: "string", minLength: 1, description: "Acción realizada" },
              id_staff: { bsonType: "number", minimum: 1, multipleOf: 1, description: "Id_Staff que realizó la acción" }
            }
          }
        }
      },
      // El contenido de "detalle" depende del tipo de incidente
      anyOf: [
        { properties: {
            tipo: { enum: ["falla_tecnica"] },
            detalle: {
              required: ["equipo", "minutos_interrupcion"],
              properties: {
                equipo:               { bsonType: "string", minLength: 1, description: "Equipo que falló" },
                codigo_error:         { bsonType: "string", minLength: 1, description: "Código de error del equipo" },
                minutos_interrupcion: { bsonType: "number", minimum: 0 }
              } } } },
        { properties: {
            tipo: { enum: ["queja_servicio"] },
            detalle: {
              required: ["categoria"],
              properties: {
                categoria:    { enum: ["atencion", "limpieza", "confiteria", "precio", "sala", "otro"] },
                compensacion: { bsonType: "string", minLength: 1, description: "Compensación ofrecida al espectador" }
              } } } },
        { properties: {
            tipo: { enum: ["incidente_seguridad"] },
            detalle: {
              required: ["tipo_evento", "autoridades_notificadas"],
              properties: {
                tipo_evento: { enum: ["robo", "pelea", "emergencia_medica", "evacuacion", "acceso_no_autorizado"] },
                autoridades_notificadas: { bsonType: "bool" },
                personas_afectadas:      { bsonType: "number", minimum: 0, multipleOf: 1 }
              } } } }
      ]
    }
  },
  validationLevel: "strict",
  validationAction: "error"
});

db.reportes_incidentes.createIndex({ tipo: 1, fecha_hora: -1 }, { name: "idx_inc_tipo_fecha" });
db.reportes_incidentes.createIndex({ id_sede: 1, estado: 1 },    { name: "idx_inc_sede_estado" });
db.reportes_incidentes.createIndex({ id_funcion: 1 },            { name: "idx_inc_funcion", sparse: true });
db.reportes_incidentes.createIndex({ id_colaborador: 1 },        { name: "idx_inc_colaborador", sparse: true });


/* ============================================================================
   5. VERIFICACIÓN Y PRUEBAS DE VALIDACIÓN
   Sirven como evidencia: los inserts inválidos DEBEN ser rechazados.
   No dejan datos (si fallan, no se inserta nada).
   ============================================================================ */
print("\n=== Colecciones creadas ===");
db.getCollectionInfos().forEach(c =>
  print(`${c.name}  | validationLevel=${c.options.validationLevel}  validationAction=${c.options.validationAction}`)
);

print("\n=== Índices ===");
["fichas_tecnicas_peliculas", "requisitos_proyeccion", "resenas_peliculas", "reportes_incidentes"].forEach(n => {
  print(n + ": " + db.getCollection(n).getIndexes().map(i => i.name).join(", "));
});

print("\n=== Pruebas de validación (todas deben ser RECHAZADAS) ===");
const pruebas = [
  ["fichas: falta elenco",
    "fichas_tecnicas_peliculas",
    { id_pelicula: 1, titulo: "X", versiones: [], clasificacion_por_pais: [] }],
  ["requisitos: IMAX sin tipo_proyector",
    "requisitos_proyeccion",
    { id_funcion: 1, id_sala: 1, formato: "IMAX", requisitos: {}, checklist: [{ item: "a", obligatorio: true, verificado: false }], id_proyeccionista: 6 }],
  ["requisitos: Evento con anticipación de 3 días",
    "requisitos_proyeccion",
    { id_funcion: 38, id_sala: 5, formato: "Evento", requisitos: { montaje: { area_m2: 120 } },
      checklist: [{ item: "a", obligatorio: true, verificado: false }], id_proyeccionista: 6,
      reserva: { id_espectador_solicitante: 10, fecha_solicitud: new Date("2026-10-15"), fecha_evento: new Date("2026-10-18"), anticipacion_dias: 3 } }],
  ["resenas: calificación 9",
    "resenas_peliculas",
    { id_pelicula: 1, id_espectador: 1, calificacion: 9, texto: "x", fecha: new Date() }],
  ["incidentes: falla técnica sin minutos_interrupcion",
    "reportes_incidentes",
    { tipo: "falla_tecnica", fecha_hora: new Date(), id_sede: 1, severidad: "alta", estado: "abierto",
      descripcion: "x", detalle: { equipo: "Proyector" } }]
];

pruebas.forEach(([nombre, coleccion, doc]) => {
  try {
    db.getCollection(coleccion).insertOne(doc);
    print("FALLO LA PRUEBA (se insertó): " + nombre);
  } catch (e) {
    print("OK, rechazado -> " + nombre);
  }
});

// FIN DEL SCRIPT
