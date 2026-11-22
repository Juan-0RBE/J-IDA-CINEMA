# ============================================================================
# J'IDA Cinema - API de integración PostgreSQL + MongoDB
#
# Misma lógica del script de integración (script-integracion/), expuesta como
# API REST (FastAPI) para la página Angular. Las funciones devuelven datos en
# vez de imprimirlos.
#
#   Instalar:  pip install fastapi "uvicorn[standard]" psycopg2-binary "pymongo[srv]" python-dotenv
#   Ejecutar:  python jida_cinema_api.py
#   Swagger:   http://localhost:8000/docs
#
# CONTENIDO
#   0. Configuración y conexiones
#   1. Caso de uso 1: Función con sus reseñas
#   2. Caso de uso 2: Película con su ficha técnica y requisitos técnicos
#   3. Caso de uso 3: Cruce de ventas con incidentes por sala
#   4. Transacción cruzada 1: venta (PostgreSQL) + comprobante (MongoDB)
#   5. Transacción cruzada 2: reserva de evento (PostgreSQL) + requisitos (MongoDB)
#   6. API REST (endpoints que consume Angular)
#   7. Arranque del servidor
#
# Manejo de errores: si un motor no responde, las consultas devuelven lo que
# sí se pudo obtener del otro, con un aviso. Las transacciones hacen ROLLBACK
# en PostgreSQL si MongoDB falla, y borran el documento de MongoDB si el
# COMMIT de PostgreSQL falla.
# ============================================================================
import os
import uuid
from datetime import datetime
from pathlib import Path

import psycopg2
import uvicorn
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from pymongo import MongoClient
from pymongo.errors import PyMongoError


# ============================================================================ 
# 0. CONFIGURACIÓN Y CONEXIONES
#    Archivo .env (en la misma carpeta de este archivo):
#      PG_HOST=ep-xxxxx-pooler.c-7.us-east-2.aws.neon.tech
#      PG_DATABASE=neondb
#      PG_USER=neondb_owner
#      PG_PASSWORD=tu_password
#      MONGO_URL=mongodb+srv://usuario:password@cluster.xxxxx.mongodb.net/
#      MONGO_DB=jida_cinema
# ============================================================================

RUTA_ENV = Path(__file__).resolve().with_name(".env")
load_dotenv(RUTA_ENV)

_faltantes = [v for v in ("PG_HOST", "PG_USER", "PG_PASSWORD", "MONGO_URL") if not os.getenv(v)]
if _faltantes:
    print("=" * 70)
    print(f"Faltan variables de entorno: {', '.join(_faltantes)}")
    print(f"Se buscó el archivo: {RUTA_ENV} (existe: {RUTA_ENV.exists()})")
    print("Sin ellas, PostgreSQL y MongoDB intentarán conectarse a localhost.")
    print("=" * 70)

config_pg = {
    "host": os.getenv("PG_HOST"),
    "database": os.getenv("PG_DATABASE", "neondb"),
    "user": os.getenv("PG_USER"),
    "password": os.getenv("PG_PASSWORD"),
    "port": int(os.getenv("PG_PORT", "5432")),
    "sslmode": os.getenv("PG_SSLMODE", "require"),
}

url_mongo = os.getenv("MONGO_URL")
nombre_bd_mongo = os.getenv("MONGO_DB", "jida_cinema")

AVISO_PG = "PostgreSQL no disponible"
AVISO_MONGO = "MongoDB no disponible"


def conectar_postgres():
    """Abre una conexión a PostgreSQL."""
    return psycopg2.connect(**config_pg)


def conectar_mongo():
    """Abre una conexión a MongoDB y verifica que responda (ping)."""
    cliente = MongoClient(url_mongo, serverSelectionTimeoutMS=5000)
    cliente.admin.command("ping")
    return cliente


def consultar_postgres(query, params=None):
    """Ejecuta un SELECT. Devuelve lista de filas ([] si no hay) o None si hubo error."""
    conn = None
    try:
        conn = conectar_postgres()
        cursor = conn.cursor()
        cursor.execute(query, params or ())
        filas = cursor.fetchall()
        cursor.close()
        return filas
    except Exception as e:
        print(f"Error en PostgreSQL: {e}")
        return None
    finally:
        if conn is not None:
            conn.close()


def consultar_mongo(coleccion, filtro=None, proyeccion=None, orden=None):
    """Ejecuta un find. Devuelve lista ([] si no hay) o None si hubo error."""
    cliente = None
    try:
        cliente = conectar_mongo()
        cursor = cliente[nombre_bd_mongo][coleccion].find(filtro or {}, proyeccion)
        if orden:
            cursor = cursor.sort(orden)
        return list(cursor)
    except Exception as e:
        print(f"Error en MongoDB: {e}")
        return None
    finally:
        if cliente is not None:
            cliente.close()


def consultar_mongo_aggregate(coleccion, pipeline):
    """Ejecuta un aggregate. Devuelve lista o None si hubo error."""
    cliente = None
    try:
        cliente = conectar_mongo()
        return list(cliente[nombre_bd_mongo][coleccion].aggregate(pipeline))
    except Exception as e:
        print(f"Error en MongoDB: {e}")
        return None
    finally:
        if cliente is not None:
            cliente.close()


def contar_postgres(tabla):
    """COUNT(*) de una tabla. Devuelve el número o None si hubo error.
    (tabla es un nombre fijo del código, nunca un dato del usuario)."""
    filas = consultar_postgres(f"SELECT COUNT(*) FROM {tabla};")
    return filas[0][0] if filas else None


def contar_mongo(coleccion):
    """count_documents de una colección. Devuelve el número o None si hubo error."""
    cliente = None
    try:
        cliente = conectar_mongo()
        return cliente[nombre_bd_mongo][coleccion].count_documents({})
    except Exception as e:
        print(f"Error en MongoDB: {e}")
        return None
    finally:
        if cliente is not None:
            cliente.close()


def mensaje_de_error(e):
    """Texto legible de una excepción (usa el mensaje de PostgreSQL si lo hay)."""
    return getattr(getattr(e, "diag", None), "message_primary", None) or str(e)


def probar_conexiones():
    resultado = {"postgres": {}, "mongo": {}}
    try:
        conn = conectar_postgres()
        cursor = conn.cursor()
        cursor.execute("SELECT (SELECT COUNT(*) FROM pelicula), (SELECT COUNT(*) FROM funcion), "
                       "(SELECT COUNT(*) FROM venta);")
        peliculas, funciones, ventas = cursor.fetchone()
        cursor.close()
        conn.close()
        resultado["postgres"] = {"ok": True, "peliculas": peliculas, "funciones": funciones, "ventas": ventas}
    except Exception as e:
        resultado["postgres"] = {"ok": False, "error": str(e)}

    try:
        cliente = conectar_mongo()
        db = cliente[nombre_bd_mongo]
        resultado["mongo"] = {
            "ok": True,
            "fichas": db.fichas_tecnicas_peliculas.count_documents({}),
            "resenas": db.resenas_peliculas.count_documents({}),
            "incidentes": db.reportes_incidentes.count_documents({}),
            "comprobantes": db.comprobantes_venta.count_documents({}),
        }
        cliente.close()
    except Exception as e:
        resultado["mongo"] = {"ok": False, "error": str(e)}

    return resultado


def obtener_catalogo():
    """Listas para los formularios de la página. None si PostgreSQL falla."""
    peliculas = consultar_postgres("SELECT id_pelicula, nombre FROM pelicula ORDER BY id_pelicula;")
    funciones = consultar_postgres("""
        SELECT f.id_funcion, f.fecha_hora_inicio, p.nombre
        FROM funcion f
        JOIN pelicula p ON p.id_pelicula = f.pelicula_id_pelicula
        ORDER BY f.id_funcion;
    """)
    sedes = consultar_postgres("SELECT nombre FROM sede ORDER BY nombre;")
    productos = consultar_postgres(
        "SELECT id_producto, nombre FROM producto_confiteria ORDER BY id_producto;")
    if None in (peliculas, funciones, sedes, productos):
        return None
    return {
        "peliculas": [{"id_pelicula": r[0], "nombre": r[1]} for r in peliculas],
        "funciones": [{"id_funcion": r[0], "fecha_hora": r[1], "pelicula": r[2]} for r in funciones],
        "sedes": [r[0] for r in sedes],
        "productos": [{"id_producto": r[0], "nombre": r[1]} for r in productos],
    }


# ============================================================================
# 1. CASO DE USO 1: FUNCIÓN CON SUS RESEÑAS
#    Patrón secuencial dependiente: PostgreSQL -> MongoDB -> PostgreSQL
# ============================================================================

def obtener_funcion_postgres(id_funcion):
    """None = error | {} = la función no existe."""
    filas = consultar_postgres("""
        SELECT f.id_funcion, f.fecha_hora_inicio, p.id_pelicula, p.nombre,
               se.nombre, s.numero, s.capacidad,
               COALESCE(SUM(v.cantidad), 0) AS boletas_vendidas
        FROM funcion f
        JOIN pelicula p ON p.id_pelicula = f.pelicula_id_pelicula
        JOIN sala s     ON s.id_sala     = f.sala_id_sala
        JOIN sede se    ON se.id_sede    = s.sede_id_sede
        LEFT JOIN venta v ON v.funcion_id_funcion = f.id_funcion
        WHERE f.id_funcion = %s
        GROUP BY f.id_funcion, p.id_pelicula, se.nombre, s.numero, s.capacidad;
    """, (id_funcion,))
    if filas is None:
        return None
    if not filas:
        return {}
    f = filas[0]
    return {"id_funcion": f[0], "fecha_hora": f[1], "id_pelicula": f[2], "pelicula": f[3],
            "sede": f[4], "sala": f[5], "capacidad": f[6], "boletas_vendidas": f[7]}


def obtener_resenas_funcion_mongo(id_funcion):
    """None = error | [] = sin reseñas."""
    return consultar_mongo(
        "resenas_peliculas",
        {"id_funcion": id_funcion},
        {"_id": 0, "id_espectador": 1, "calificacion": 1, "texto": 1, "fecha": 1},
        orden=[("fecha", -1)]
    )


def obtener_nombres_espectadores(ids_espectadores):
    """{id_espectador: nombre}. Si falla devuelve {} (se muestra el id)."""
    if not ids_espectadores:
        return {}
    filas = consultar_postgres(
        "SELECT id_espectador, nombre FROM espectador WHERE id_espectador = ANY(%s);",
        (list(ids_espectadores),))
    return {i: n for i, n in filas} if filas else {}


def caso_1_funcion_resenas(id_funcion):
    """Devuelve (codigo, datos). codigo: 'ok' | 'pg_error' | 'no_existe'."""
    funcion = obtener_funcion_postgres(id_funcion)
    if funcion is None:
        return "pg_error", None
    if not funcion:
        return "no_existe", None

    avisos = []
    resenas = obtener_resenas_funcion_mongo(id_funcion)
    if resenas is None:
        avisos.append(f"{AVISO_MONGO}: no se pudieron cargar las reseñas.")
    else:
        nombres = obtener_nombres_espectadores({r["id_espectador"] for r in resenas})
        for r in resenas:
            r["calificacion"] = int(r["calificacion"])
            r["nombre_espectador"] = nombres.get(r["id_espectador"], f"Espectador {r['id_espectador']}")

    promedio = (round(sum(r["calificacion"] for r in resenas) / len(resenas), 1)
                if resenas else None)
    return "ok", {"funcion": funcion, "resenas": resenas, "promedio": promedio, "avisos": avisos}


# ============================================================================
# 2. CASO DE USO 2: PELÍCULA CON SU FICHA TÉCNICA Y REQUISITOS TÉCNICOS
#    Patrón secuencial dependiente: PostgreSQL (película + funciones) -> MongoDB
# ============================================================================

def obtener_pelicula_postgres(id_pelicula):
    """None = error | {} = la película no existe."""
    filas = consultar_postgres("""
        SELECT id_pelicula, nombre, clasificacion, duracion_minutos
        FROM pelicula WHERE id_pelicula = %s;
    """, (id_pelicula,))
    if filas is None:
        return None
    if not filas:
        return {}
    f = filas[0]
    return {"id_pelicula": f[0], "nombre": f[1], "clasificacion": f[2], "duracion": f[3]}


def obtener_funciones_pelicula_postgres(id_pelicula):
    """None = error | [] = sin funciones."""
    filas = consultar_postgres("""
        SELECT f.id_funcion, f.fecha_hora_inicio, se.nombre, s.numero
        FROM funcion f
        JOIN sala s  ON s.id_sala  = f.sala_id_sala
        JOIN sede se ON se.id_sede = s.sede_id_sede
        WHERE f.pelicula_id_pelicula = %s
        ORDER BY f.fecha_hora_inicio;
    """, (id_pelicula,))
    if filas is None:
        return None
    return [{"id_funcion": r[0], "fecha_hora": r[1], "sede": r[2], "sala": r[3]} for r in filas]


def obtener_ficha_mongo(id_pelicula):
    """None = error | {} = la película no tiene ficha."""
    docs = consultar_mongo("fichas_tecnicas_peliculas", {"id_pelicula": id_pelicula}, {"_id": 0})
    if docs is None:
        return None
    return docs[0] if docs else {}


def obtener_requisitos_mongo(ids_funciones):
    """{id_funcion: documento}. None = error | {} = ninguna función con requisitos."""
    docs = consultar_mongo(
        "requisitos_proyeccion",
        {"id_funcion": {"$in": ids_funciones}},
        {"_id": 0, "id_funcion": 1, "formato": 1, "checklist": 1}
    )
    if docs is None:
        return None
    return {d["id_funcion"]: d for d in docs}


def caso_2_pelicula_requisitos(id_pelicula):
    """Devuelve (codigo, datos). codigo: 'ok' | 'pg_error' | 'no_existe'."""
    pelicula = obtener_pelicula_postgres(id_pelicula)
    if pelicula is None:
        return "pg_error", None
    if not pelicula:
        return "no_existe", None

    funciones = obtener_funciones_pelicula_postgres(id_pelicula)
    if funciones is None:
        return "pg_error", None

    avisos = []
    ficha = obtener_ficha_mongo(id_pelicula)
    requisitos = obtener_requisitos_mongo([f["id_funcion"] for f in funciones])

    ficha_salida = None
    if ficha is None:
        avisos.append(f"{AVISO_MONGO}: no se pudo cargar la ficha técnica.")
    elif ficha:
        elenco = ficha.get("elenco", [])
        ficha_salida = {
            "titulo_original": ficha.get("titulo_original"),
            "directores": [e["nombre"] for e in elenco if e.get("rol") == "Director"],
            "elenco": elenco,
            "versiones": ficha.get("versiones", []),
        }

    if requisitos is None:
        avisos.append(f"{AVISO_MONGO}: no se pudieron cargar los requisitos de proyección.")
    for f in funciones:
        req = (requisitos or {}).get(f["id_funcion"])
        if req:
            checklist = req.get("checklist", [])
            obligatorios = [c for c in checklist if c.get("obligatorio")]
            verificados = [c for c in obligatorios if c.get("verificado")]
            f["requisitos"] = {"formato": req.get("formato"), "obligatorios": len(obligatorios),
                               "verificados": len(verificados), "checklist": checklist}
        else:
            f["requisitos"] = None   # Estándar (o no disponible si Mongo falló)

    return "ok", {"pelicula": pelicula, "ficha": ficha_salida,
                  "ficha_disponible": ficha is not None,
                  "requisitos_disponibles": requisitos is not None,
                  "funciones": funciones, "avisos": avisos}


# ============================================================================
# 3. CASO DE USO 3: CRUCE DE VENTAS CON INCIDENTES POR SALA
#    Patrón de agregación combinada: cada motor agrega y Python calcula la métrica
# ============================================================================

def ventas_por_sala_postgres():
    """Boletas e ingresos por sala. None = error.
    Solo cuenta funciones ya realizadas (la condición está en el JOIN para no perder
    salas sin funciones)."""
    filas = consultar_postgres("""
        SELECT s.id_sala, se.nombre, s.numero,
               COALESCE(SUM(v.cantidad), 0)                     AS boletas,
               COALESCE(SUM(v.cantidad * v.precio_unitario), 0) AS ingresos
        FROM sala s
        JOIN sede se ON se.id_sede = s.sede_id_sede
        LEFT JOIN funcion f ON f.sala_id_sala = s.id_sala AND f.fecha_hora_inicio < NOW()
        LEFT JOIN venta v   ON v.funcion_id_funcion = f.id_funcion
        GROUP BY s.id_sala, se.nombre, s.numero
        ORDER BY s.id_sala;
    """)
    if filas is None:
        return None
    return [{"id_sala": r[0], "sede": r[1], "sala": r[2], "boletas": r[3], "ingresos": float(r[4])}
            for r in filas]


def incidentes_por_sala_mongo():
    """({id_sala: {total, fallas, quejas, seguridad}}, incidentes_sin_sala) o None si hay error."""
    resultado = consultar_mongo_aggregate("reportes_incidentes", [
        {"$group": {
            "_id": "$id_sala",
            "total": {"$sum": 1},
            "fallas": {"$sum": {"$cond": [{"$eq": ["$tipo", "falla_tecnica"]}, 1, 0]}},
            "quejas": {"$sum": {"$cond": [{"$eq": ["$tipo", "queja_servicio"]}, 1, 0]}},
            "seguridad": {"$sum": {"$cond": [{"$eq": ["$tipo", "incidente_seguridad"]}, 1, 0]}}
        }}
    ])
    if resultado is None:
        return None
    por_sala = {r["_id"]: r for r in resultado if r["_id"] is not None}
    sin_sala = sum(r["total"] for r in resultado if r["_id"] is None)
    return por_sala, sin_sala


def caso_3_ventas_incidentes():
    """Devuelve (codigo, datos). codigo: 'ok' | 'pg_error'."""
    salas = ventas_por_sala_postgres()
    if salas is None:
        return "pg_error", None

    info = incidentes_por_sala_mongo()
    mongo_ok = info is not None
    incidentes, sin_sala = info if mongo_ok else ({}, None)
    vacio = {"total": 0, "fallas": 0, "quejas": 0, "seguridad": 0}

    filas = []
    for s in salas:
        inc = incidentes.get(s["id_sala"], vacio)
        tasa = round(inc["total"] * 1000 / s["boletas"], 1) if (mongo_ok and s["boletas"] > 0) else None
        filas.append({
            **s,
            "incidentes": inc["total"] if mongo_ok else None,
            "fallas": inc["fallas"] if mongo_ok else None,
            "quejas": inc["quejas"] if mongo_ok else None,
            "seguridad": inc["seguridad"] if mongo_ok else None,
            "tasa_x1000": tasa,
        })
    filas.sort(key=lambda x: (x["tasa_x1000"] is None, -(x["tasa_x1000"] or 0)))  # mayor tasa primero

    avisos = [] if mongo_ok else [f"{AVISO_MONGO}: se muestran solo las ventas."]
    return "ok", {"salas": filas, "incidentes_sin_sala": sin_sala, "avisos": avisos}


# ============================================================================
# 4. TRANSACCIÓN CRUZADA 1: VENTA EN POSTGRESQL + COMPROBANTE EN MONGODB
#    Paso 1. PostgreSQL: se bloquean las sillas escogidas, CALL registrar_venta_boletas
#            (dispara los triggers de taquillero, sede y aforo), se asignan las sillas
#            y se registran los productos de confitería (registrar_ven_pro, que
#            descuenta el stock). TODAVÍA NO SE HACE COMMIT.
#    Paso 2. MongoDB: se inserta el comprobante de la venta.
#    Paso 3. Si MongoDB funcionó -> COMMIT en PostgreSQL.
#            Si MongoDB falló    -> ROLLBACK en PostgreSQL (boletas, sillas y stock).
#            Si el COMMIT falla  -> se borra el comprobante de MongoDB (compensación).
# ============================================================================

def crear_coleccion_comprobantes():
    """Crea la colección comprobantes_venta con validación $jsonSchema (solo la primera vez)."""
    cliente = None
    try:
        cliente = conectar_mongo()
        db = cliente[nombre_bd_mongo]
        if "comprobantes_venta" not in db.list_collection_names():
            db.create_collection("comprobantes_venta", validator={
                "$jsonSchema": {
                    "bsonType": "object",
                    "required": ["id_venta", "id_funcion", "id_espectador", "pelicula",
                                 "asientos", "total", "codigo", "fecha_emision"],
                    "properties": {
                        "id_venta":      {"bsonType": "number", "minimum": 1},
                        "id_funcion":    {"bsonType": "number", "minimum": 1},
                        "id_espectador": {"bsonType": "number", "minimum": 1},
                        "pelicula":      {"bsonType": "string"},
                        "asientos":      {"bsonType": "array", "minItems": 1},
                        "total":         {"bsonType": "number", "minimum": 0},
                        "codigo":        {"bsonType": "string"},
                        "fecha_emision": {"bsonType": "date"}
                    }
                }
            })
            db.comprobantes_venta.create_index("id_venta", unique=True)
    except Exception as e:
        print(f"Error en MongoDB: {e}")
    finally:
        if cliente is not None:
            cliente.close()


def contar_ventas_y_comprobantes():
    """Cada conteo es independiente: si un motor falla, su valor es None."""
    return {"ventas": contar_postgres("venta"), "comprobantes": contar_mongo("comprobantes_venta")}


def obtener_asientos_funcion(id_funcion):
    """Mapa de sillas de la sala de una función, marcando las vendidas.
    Devuelve (codigo, datos). codigo: 'ok' | 'pg_error' | 'no_existe'."""
    funcion = obtener_funcion_postgres(id_funcion)
    if funcion is None:
        return "pg_error", None
    if not funcion:
        return "no_existe", None
    filas = consultar_postgres("""
        SELECT a.id_asiento, a.fila, a.numero,
               EXISTS (SELECT 1 FROM venta_asiento va
                       WHERE va.asiento_id_asiento = a.id_asiento
                         AND va.funcion_id_funcion = f.id_funcion) AS ocupado
        FROM asiento a
        JOIN funcion f ON f.sala_id_sala = a.sala_id_sala
        WHERE f.id_funcion = %s
        ORDER BY a.fila, a.numero;
    """, (id_funcion,))
    if filas is None:
        return "pg_error", None
    asientos = [{"id_asiento": r[0], "fila": r[1], "numero": r[2], "ocupado": r[3]} for r in filas]
    return "ok", {"funcion": funcion, "asientos": asientos}


def realizar_venta_cruzada(id_espectador, id_staff, id_funcion, id_tipo_boleta,
                           ids_asientos, metodo_pago, productos=None):
    """Registra la venta de las sillas escogidas (y productos de confitería).
    productos: lista de (id_producto, cantidad).
    Devuelve un diccionario con el resultado y la bitácora de pasos."""
    productos = productos or []
    ids_asientos = list(dict.fromkeys(ids_asientos))
    cantidad = len(ids_asientos)
    pasos = []
    conn = None
    cliente = None
    db = None
    comprobante_guardado = False
    codigo = str(uuid.uuid4()).replace("-", "")[:12].upper()

    try:
        conn = conectar_postgres()
        cliente = conectar_mongo()
        db = cliente[nombre_bd_mongo]
        cursor = conn.cursor()

        cursor.execute("""
            SELECT a.id_asiento, a.fila, a.numero
            FROM asiento a
            JOIN funcion f ON f.sala_id_sala = a.sala_id_sala
            WHERE f.id_funcion = %s
              AND a.id_asiento = ANY(%s)
              AND NOT EXISTS (SELECT 1 FROM venta_asiento va
                              WHERE va.funcion_id_funcion = f.id_funcion
                                AND va.asiento_id_asiento = a.id_asiento)
            ORDER BY a.fila, a.numero
            FOR UPDATE OF a;
        """, (id_funcion, ids_asientos))
        sillas = cursor.fetchall()
        if len(sillas) < cantidad:
            raise ValueError("Alguna de las sillas escogidas ya fue vendida o no pertenece a la sala "
                             "de esta función. Actualiza el mapa y vuelve a escoger.")
        asientos = [f"{fila}{numero}" for _, fila, numero in sillas]

        cursor.execute("CALL registrar_venta_boletas(%s, %s, %s, %s, %s, %s);",
                       (id_espectador, id_staff, id_funcion, id_tipo_boleta, cantidad, metodo_pago))
        cursor.execute("SELECT currval(pg_get_serial_sequence('venta', 'id_venta'));")
        id_venta = cursor.fetchone()[0]
        pasos.append(f"PostgreSQL: CALL registrar_venta_boletas, venta {id_venta} creada (sin COMMIT)")

        cursor.executemany("""
            INSERT INTO venta_asiento (venta_id_venta, asiento_id_asiento, funcion_id_funcion)
            VALUES (%s, %s, %s);
        """, [(id_venta, id_asiento, id_funcion) for id_asiento, _, _ in sillas])
        pasos.append(f"PostgreSQL: sillas reservadas {', '.join(asientos)}")

        for id_producto, cant_producto in productos:
            cursor.execute("CALL registrar_ven_pro(%s, %s, %s, NULL);",
                           (id_venta, id_producto, cant_producto))
        if productos:
            pasos.append(f"PostgreSQL: CALL registrar_ven_pro, {len(productos)} producto(s) registrados")

        cursor.execute("""
            SELECT p.nombre, se.nombre, s.numero, f.fecha_hora_inicio, v.precio_unitario, v.metodo_pago
            FROM venta v
            JOIN funcion f  ON f.id_funcion  = v.funcion_id_funcion
            JOIN pelicula p ON p.id_pelicula = f.pelicula_id_pelicula
            JOIN sala s     ON s.id_sala     = f.sala_id_sala
            JOIN sede se    ON se.id_sede    = s.sede_id_sede
            WHERE v.id_venta = %s;
        """, (id_venta,))
        pelicula, sede, sala, fecha_funcion, precio, pago = cursor.fetchone()
        total_boletas = float(precio * cantidad)

        cursor.execute("""
            SELECT vp.prod_conf_id_prod, pc.nombre, vp.cantidad, vp.precio_unitario
            FROM ven_pro vp
            JOIN producto_confiteria pc ON pc.id_producto = vp.prod_conf_id_prod
            WHERE vp.venta_id_venta = %s
            ORDER BY vp.prod_conf_id_prod;
        """, (id_venta,))
        lista_productos = [
            {"id_producto": r[0], "nombre": r[1], "cantidad": r[2],
             "precio_unitario": float(r[3]), "subtotal": float(r[2] * r[3])}
            for r in cursor.fetchall()
        ]
        total_productos = sum(p["subtotal"] for p in lista_productos)
        total = total_boletas + total_productos

        comprobante = {
            "id_venta": id_venta,
            "id_funcion": id_funcion,
            "id_espectador": id_espectador,
            "pelicula": pelicula,
            "sede": sede,
            "sala": sala,
            "fecha_funcion": fecha_funcion,
            "asientos": asientos,
            "productos": lista_productos,
            "total_boletas": total_boletas,
            "total_productos": total_productos,
            "metodo_pago": pago,
            "total": total,
            "codigo": codigo,
            "fecha_emision": datetime.now(),
        }
        db.comprobantes_venta.insert_one(comprobante)
        comprobante.pop("_id", None)
        comprobante_guardado = True
        pasos.append(f"MongoDB: comprobante {codigo} insertado")

        conn.commit()
        pasos.append("PostgreSQL: COMMIT")

        return {"ok": True, "origen": None, "mensaje": f"Venta {id_venta} registrada.",
                "id_venta": id_venta, "comprobante": comprobante, "pasos": pasos}

    except Exception as e:
        if conn is not None:
            conn.rollback()
            pasos.append("PostgreSQL: ROLLBACK, la venta no quedó guardada")
        if comprobante_guardado:
            try:
                db.comprobantes_venta.delete_one({"codigo": codigo})
                pasos.append("MongoDB: comprobante eliminado (compensación)")
            except Exception as error_mongo:
                pasos.append(f"MongoDB: no se pudo eliminar el comprobante ({error_mongo})")

        if isinstance(e, ValueError):
            origen = "validacion"
        elif isinstance(e, psycopg2.Error):
            origen = "postgresql"
        elif isinstance(e, PyMongoError):
            origen = "mongodb"
        else:
            origen = "otro"
        return {"ok": False, "origen": origen, "mensaje": mensaje_de_error(e),
                "id_venta": None, "comprobante": None, "pasos": pasos}

    finally:
        if conn is not None:
            conn.close()
        if cliente is not None:
            cliente.close()


# ============================================================================
# 5. TRANSACCIÓN CRUZADA 2: RESERVA DE EVENTO
#    PostgreSQL: CALL reservar_evento crea la función (sin commit)
#    MongoDB:    documento en requisitos_proyeccion (con su $jsonSchema existente,
#                que valida, entre otras cosas, la anticipación de la reserva)
#    Si MongoDB rechaza el documento -> ROLLBACK en PostgreSQL.
# ============================================================================

def contar_funciones_y_requisitos():
    """Cada conteo es independiente: si un motor falla, su valor es None."""
    return {"funciones": contar_postgres("funcion"), "requisitos": contar_mongo("requisitos_proyeccion")}


def reservar_evento_cruzado(id_pelicula, hora_inicio, idioma, num_sala, nombre_sede,
                            id_espectador, id_proyeccionista, montaje):
    """hora_inicio: datetime de la función. montaje: dict con los datos del montaje.
    Devuelve un diccionario con el resultado y la bitácora de pasos."""
    pasos = []
    conn = None
    cliente = None
    db = None
    requisitos_guardado = False
    id_funcion = None

    try:
        conn = conectar_postgres()
        cliente = conectar_mongo()
        db = cliente[nombre_bd_mongo]
        cursor = conn.cursor()

        cursor.execute("""
            SELECT EXISTS (SELECT 1 FROM espectador WHERE id_espectador = %s),
                   EXISTS (SELECT 1 FROM staff WHERE id_staff = %s AND id_rol_staff = 3);
        """, (id_espectador, id_proyeccionista))
        existe_espectador, es_proyeccionista = cursor.fetchone()
        if not existe_espectador:
            raise ValueError(f"El espectador {id_espectador} no existe.")
        if not es_proyeccionista:
            raise ValueError(f"El staff {id_proyeccionista} no existe o no es proyeccionista.")
        pasos.append("PostgreSQL: espectador y proyeccionista validados")

        cursor.execute("CALL reservar_evento(%s, %s, %s, %s, %s);",
                       (id_pelicula, hora_inicio, idioma, num_sala, nombre_sede))
        cursor.execute("""
            SELECT id_funcion, sala_id_sala
            FROM funcion
            WHERE id_funcion = currval(pg_get_serial_sequence('funcion', 'id_funcion'));
        """)
        id_funcion, id_sala = cursor.fetchone()
        pasos.append(f"PostgreSQL: CALL reservar_evento, función {id_funcion} creada (sin COMMIT)")

        ahora = datetime.now()
        anticipacion = (hora_inicio.date() - ahora.date()).days
        requisitos = {
            "id_funcion": id_funcion,
            "id_sala": id_sala,
            "formato": "Evento",
            "requisitos": {"montaje": montaje},
            "checklist": [
                {"item": "Verificar micrófonos", "obligatorio": True, "verificado": False},
                {"item": "Probar proyector y pantalla", "obligatorio": True, "verificado": False},
                {"item": "Montar tarima y distribución de sillas", "obligatorio": True, "verificado": False}
            ],
            "id_proyeccionista": id_proyeccionista,
            "reserva": {
                "id_espectador_solicitante": id_espectador,
                "fecha_solicitud": ahora,
                "fecha_evento": hora_inicio,
                "anticipacion_dias": anticipacion
            }
        }
        db.requisitos_proyeccion.insert_one(requisitos)
        requisitos_guardado = True
        pasos.append("MongoDB: documento de requisitos insertado")

        conn.commit()
        pasos.append("PostgreSQL: COMMIT")

        return {"ok": True, "origen": None,
                "mensaje": f"Evento reservado: función {id_funcion}, sala {num_sala} de {nombre_sede}, "
                           f"{anticipacion} días de anticipación.",
                "id_funcion": id_funcion, "anticipacion_dias": anticipacion, "pasos": pasos}

    except Exception as e:
        if conn is not None:
            conn.rollback()
            pasos.append("PostgreSQL: ROLLBACK, la función no quedó creada")
        if requisitos_guardado:
            try:
                db.requisitos_proyeccion.delete_one({"id_funcion": id_funcion})
                pasos.append("MongoDB: documento de requisitos eliminado (compensación)")
            except Exception as error_mongo:
                pasos.append(f"MongoDB: no se pudo eliminar el documento ({error_mongo})")

        if isinstance(e, ValueError):
            origen = "validacion"
        elif isinstance(e, psycopg2.Error):
            origen = "postgresql"
        elif isinstance(e, PyMongoError):
            origen = "mongodb"
        else:
            origen = "otro"
        mensaje = mensaje_de_error(e)
        if origen == "mongodb":
            mensaje = f"MongoDB rechazó el documento de requisitos: {mensaje}"
        return {"ok": False, "origen": origen, "mensaje": mensaje,
                "id_funcion": None, "anticipacion_dias": None, "pasos": pasos}

    finally:
        if conn is not None:
            conn.close()
        if cliente is not None:
            cliente.close()


# ============================================================================
# 6. API REST (endpoints que consume Angular)
#    404: el registro no existe | 422: datos de entrada inválidos (FastAPI)
#    503: PostgreSQL no responde | 200 con "avisos": MongoDB no respondió,
#    se devuelve lo que sí se obtuvo de PostgreSQL.
# ============================================================================

app = FastAPI(title="J'IDA Cinema - Integración PostgreSQL + MongoDB")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200", "http://127.0.0.1:4200"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(psycopg2.Error)
async def error_postgres(_: Request, e: psycopg2.Error):
    return JSONResponse(status_code=503, content={"detail": f"Error en PostgreSQL: {mensaje_de_error(e)}"})


@app.exception_handler(PyMongoError)
async def error_mongo(_: Request, e: PyMongoError):
    return JSONResponse(status_code=503, content={"detail": f"Error en MongoDB: {e}"})


def responder(codigo, datos, que, id_):
    """Traduce el código de las funciones de consulta a una respuesta HTTP."""
    if codigo == "pg_error":
        raise HTTPException(503, f"{AVISO_PG}: no se pudo consultar {que}.")
    if codigo == "no_existe":
        raise HTTPException(404, f"{que.capitalize()} {id_} no existe.")
    return datos


@app.get("/api/conexiones")
def api_conexiones():
    return probar_conexiones()


@app.get("/api/catalogo")
def api_catalogo():
    datos = obtener_catalogo()
    if datos is None:
        raise HTTPException(503, f"{AVISO_PG}: no se pudo cargar el catálogo.")
    return datos


# ---------- Caso de uso 1 ----------
@app.get("/api/funciones/{id_funcion}/resenas")
def api_funcion_con_resenas(id_funcion: int):
    return responder(*caso_1_funcion_resenas(id_funcion), "la función", id_funcion)


# ---------- Caso de uso 2 ----------
@app.get("/api/peliculas/{id_pelicula}/requisitos")
def api_pelicula_con_requisitos(id_pelicula: int):
    return responder(*caso_2_pelicula_requisitos(id_pelicula), "la película", id_pelicula)


# ---------- Caso de uso 3 ----------
@app.get("/api/salas/ventas-incidentes")
def api_ventas_vs_incidentes():
    return responder(*caso_3_ventas_incidentes(), "las ventas", None)


# ---------- Transacción cruzada 1: venta ----------
class ProductoEntrada(BaseModel):
    id_producto: int = Field(gt=0)
    cantidad: int = Field(gt=0, le=20)


class VentaEntrada(BaseModel):
    id_espectador: int = Field(gt=0)
    id_staff: int = Field(gt=0)
    id_funcion: int = Field(gt=0)
    id_tipo_boleta: int = Field(gt=0)
    asientos: list[int] = Field(min_length=1, max_length=10)   # id_asiento de cada silla escogida
    metodo_pago: str = "Tarjeta"
    productos: list[ProductoEntrada] = []


@app.get("/api/funciones/{id_funcion}/asientos")
def api_asientos_funcion(id_funcion: int):
    return responder(*obtener_asientos_funcion(id_funcion), "la función", id_funcion)


@app.get("/api/ventas/conteo")
def api_conteo_ventas():
    return contar_ventas_y_comprobantes()


@app.post("/api/ventas")
def api_registrar_venta(venta: VentaEntrada):
    crear_coleccion_comprobantes()
    antes = contar_ventas_y_comprobantes()
    resultado = realizar_venta_cruzada(
        venta.id_espectador, venta.id_staff, venta.id_funcion, venta.id_tipo_boleta,
        venta.asientos, venta.metodo_pago,
        [(p.id_producto, p.cantidad) for p in venta.productos])
    despues = contar_ventas_y_comprobantes()
    return {**resultado, "antes": antes, "despues": despues}


# ---------- Transacción cruzada 2: reserva de evento ----------
class MontajeEntrada(BaseModel):
    area_montaje_m2: float = Field(gt=0)
    distribucion: str
    tarima: bool
    microfonos: int = Field(ge=0)
    pantalla: str


class EventoEntrada(BaseModel):
    id_pelicula: int = Field(gt=0)
    hora_inicio: datetime
    idioma: str
    num_sala: int = Field(gt=0)
    nombre_sede: str
    id_espectador: int = Field(gt=0)
    id_proyeccionista: int = Field(gt=0)
    montaje: MontajeEntrada


@app.get("/api/eventos/conteo")
def api_conteo_eventos():
    return contar_funciones_y_requisitos()


@app.post("/api/eventos")
def api_reservar_evento(evento: EventoEntrada):
    antes = contar_funciones_y_requisitos()
    resultado = reservar_evento_cruzado(
        evento.id_pelicula, evento.hora_inicio.replace(tzinfo=None), evento.idioma,
        evento.num_sala, evento.nombre_sede, evento.id_espectador, evento.id_proyeccionista,
        evento.montaje.model_dump())
    despues = contar_funciones_y_requisitos()
    return {**resultado, "antes": antes, "despues": despues}


# ============================================================================
# 7. ARRANQUE DEL SERVIDOR
# ============================================================================

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
