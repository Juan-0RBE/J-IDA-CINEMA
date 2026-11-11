/* ============================================================================
   J'IDA Cinema - 03_consultas.js

   CONTENIDO
     Consulta 1. Top 5 películas por calificación promedio    (aggregate)
     Consulta 2. Fallas técnicas por equipo en sede 1, sala 3 (aggregate)
     Consulta 3. Top 5 actores/directores con más películas   (aggregate)
     Consulta 4. Funciones con observaciones anotadas         (find)
     Consulta 5. Resumen de funciones especiales por formato  (aggregate)
     Consulta 6. Incidentes altos o críticos abiertos         (find)
   ============================================================================ */

use("jida_cinema");


/* ============================================================================
   CONSULTA 1: Top 5 películas por calificación promedio
   Colección: resenas_peliculas
   ============================================================================ */
print("\n=== Consulta 1: Top 5 películas por calificación promedio ===");
printjson(
  db.resenas_peliculas.aggregate([
    // Se agrupa por peliculas
    {
      $group: {
        _id: "$id_pelicula",
        promedio: { $avg: "$calificacion" }
      }
    },
    // Se ordena de mayor a menor
    {
      $sort: {
        promedio: -1
      }
    },
    // Se limita a las 5 mejores
    {
      $limit: 5
    }
  ]).toArray()
);


/* ============================================================================
   CONSULTA 2: Fallas técnicas por equipo en la sala 3 de la sede 1
   Colección: reportes_incidentes
   ============================================================================ */
print("\n=== Consulta 2: Fallas técnicas por equipo (sede 1, sala 3) ===");
printjson(
  db.reportes_incidentes.aggregate([
    // Se filtra por la sede y la sala, así mismo se filtra por el tipo de fallas técnicas
    {
      $match: {
        id_sede: 1,
        id_sala: 3,
        tipo: "falla_tecnica"
      }
    },
    // Se agrupa por el equipo afectado
    {
      $group: {
        _id: "$detalle.equipo",
        total_minutos_interrupcion: { $sum: "$detalle.minutos_interrupcion" },
        total_fallas: { $sum: 1 },
        codigos_error: { $addToSet: "$detalle.codigo_error" } // Acumula los códigos únicos que se presentaron
      }
    },
    // Se ordena de mayor a menor según los minutos totales de interrupción
    {
      $sort: {
        total_minutos_interrupcion: -1
      }
    },
    // Se ajusta la salida para que sea más legible
    {
      $project: {
        _id: 0,
        equipo: "$_id",
        total_minutos_interrupcion: 1,
        total_fallas: 1,
        codigos_error: 1
      }
    }
  ]).toArray()
);


/* ============================================================================
   CONSULTA 3: Top 5 actores/directores con más películas
   Colección: fichas_tecnicas_peliculas
   ============================================================================ */
print("\n=== Consulta 3: Top 5 actores/directores con más películas ===");
printjson(
  db.fichas_tecnicas_peliculas.aggregate([
    // Se desglosa el array de elenco para tratar a cada actor/director individualmente
    {
      $unwind: "$elenco"
    },
    // Se agrupa por el ID
    {
      $group: {
        _id: "$elenco.id_actor_director",
        nombre: { $first: "$elenco.nombre" },
        roles: { $addToSet: "$elenco.rol" },
        total_peliculas: { $sum: 1 },
        titulos_peliculas: { $push: "$titulo" } // Se crea un array con los nombres de las películas en las que aparece
      }
    },
    // Se ordena de mayor a menor según la cantidad de películas, y en caso de empate por nombre
    {
      $sort: {
        total_peliculas: -1,
        nombre: 1
      }
    },
    // Se filtran solo los 5 principales, es decir, los que tienen mayor número de participaciones
    {
      $limit: 5
    },
    // Se ajusta la salida
    {
      $project: {
        _id: 0,
        actor_director: "$nombre",
        roles: 1,
        total_peliculas: 1,
        titulos_peliculas: 1
      }
    }
  ]).toArray()
);


/* ============================================================================
   CONSULTA 4: Funciones con observaciones anotadas
   Colección: requisitos_proyeccion
   ============================================================================ */
print("\n=== Consulta 4: Funciones con observaciones anotadas ===");
printjson(
  db.requisitos_proyeccion.find(
    // Se filtran por las funciones que tienen observaciones anotadas
    {
      observaciones: { $exists: true, $ne: null }
    },
    // Se ajusta la salida
    {
      _id: 0,
      id_funcion: 1,
      id_sala: 1,
      formato: 1,
      observaciones: 1
    }
  ).sort({ id_funcion: 1 }).toArray()
);

/* ============================================================================
   CONSULTA 5: Conteo de funciones especiales por formato y su estado
   Colección: requisitos_proyeccion
   Descripción: Utiliza un aggregation pipeline para agrupar por formato de función
                especial, contando cuántas existen y cuántos ítems de checklist 
                han sido verificados en total.
   ============================================================================ */
print("\n=== Consulta 5: Resumen de funciones especiales por formato (Aggregate) ===");
printjson(
  db.requisitos_proyeccion.aggregate([
    // Se desglosa el array de checklist para analizar item por item
    {
      $unwind: "$checklist"
    },
    // Se filtran solo los ítems que son obligatorios
    {
      $match: {
        "checklist.obligatorio": true
      }
    },
    // Se agrupa por el formato de la proyección
    {
      $group: {
        _id: "$formato",
        total_funciones_formato: { $addToSet: "$id_funcion" },
        total_checks_obligatorios: { $sum: 1 },
        checks_verificados: {
          $sum: {
            $cond: [{ $eq: ["$checklist.verificado", true] }, 1, 0]
          }
        }
      }
    },
    // Se proyecta la salida para calcular el total de funciones
    {
      $project: {
        _id: 0,
        formato: "$_id",
        total_funciones: { $size: "$total_funciones_formato" },
        total_checks_obligatorios: 1,
        checks_verificados: 1,
        porcentaje_verificacion: {
          $cond: [
            { $eq: ["$total_checks_obligatorios", 0] },
            0,
            { $multiply: [{ $divide: ["$checks_verificados", "$total_checks_obligatorios"] }, 100] }
          ]
        }
      }
    },
    // Se ordena por la cantidad de funciones de mayor a menor
    {
      $sort: {
        total_funciones: -1
      }
    }
  ]).toArray()
);

/* ============================================================================
   CONSULTA 6: Reportes de incidentes críticos o de alta severidad abiertos
   Colección: reportes_incidentes
   Descripción: Busca mediante una consulta find los incidentes con severidad
                crítica que aún se encuentran en estado abierto.
   ============================================================================ */
print("\n=== Consulta 6: Incidentes críticos o altos pendientes de resolver ===");
printjson(
  db.reportes_incidentes.find(
    // Filtros por severidad alta/crítica y estado abierto
    {
      severidad: { $in: ["alta", "critica"] },
      estado: "abierto"
    },
    // Proyección de los campos relevantes
    {
      _id: 0,
      tipo: 1,
      severidad: 1,
      estado: 1,
      id_sede: 1,
      id_sala: 1,
      descripcion: 1,
      fecha_hora: 1
    }
  ).sort({ fecha_hora: 1 }).toArray()
);

// FIN DEL SCRIPT
