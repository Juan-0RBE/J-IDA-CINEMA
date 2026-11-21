# ============================================================================
# J'IDA Cinema - ENTREGA FINAL - Script de integración PostgreSQL + MongoDB
#
# PostgreSQL (Neon)  -> datos transaccionales del Avance 1
# MongoDB (Atlas)    -> documentos del Avance 2
# Los dos motores se unen por los Id compartidos (id_funcion, id_pelicula,
# id_sala, id_espectador...).
#
# CONTENIDO
#   0. Configuración y conexiones
#   1. Caso de uso 1: Función con sus reseñas
#   2. Caso de uso 2: Película con su ficha técnica y requisitos técnicos
#   3. Caso de uso 3: Cruce de ventas con incidentes por sala
#   4. Transacción cruzada: venta en PostgreSQL + comprobante en MongoDB
#   5. Main (demo)
#
# En Colab: primero  !pip install psycopg2-binary pymongo
# ============================================================================

import psycopg2
from pymongo import MongoClient
from pymongo.errors import PyMongoError
from datetime import datetime
import uuid


# ============================================================================
# 0. CONFIGURACIÓN Y CONEXIONES
# ============================================================================

# Credenciales de conexión a Neon (PostgreSQL en la nube)
config_pg = {
    "host": "ep-quiet-block-b5xspcqb-pooler.c-7.us-east-2.aws.neon.tech",
    "database": "neondb",
    "user": "neondb_owner",
    "password": "npg_vc37xUZMFELl",
    "port": 5432
}

# Cadena de conexión a MongoDB Atlas
url_mongo = "mongodb+srv://cinema:cinema@cluster.4i01kab.mongodb.net/"
nombre_bd_mongo = "jida_cinema"   # la misma del use("jida_cinema") del Avance 2


def conectar_postgres():
    """Abre una conexión a PostgreSQL."""
    return psycopg2.connect(**config_pg)


def conectar_mongo():
    """Abre una conexión a MongoDB y verifica que responda (ping)."""
    cliente = MongoClient(url_mongo, serverSelectionTimeoutMS=5000)
    cliente.admin.command("ping")
    return cliente


def probar_conexiones():
    """Verifica que los dos motores respondan y muestra cuántos datos hay."""
    print("=" * 60)
    print("PRUEBA DE CONEXIONES")
    print("=" * 60)
    try:
        conn = conectar_postgres()
        cursor = conn.cursor()
        cursor.execute("SELECT (SELECT COUNT(*) FROM pelicula), (SELECT COUNT(*) FROM funcion), (SELECT COUNT(*) FROM venta);")
        peliculas, funciones, ventas = cursor.fetchone()
        cursor.close()
        conn.close()
        print(f"✅ PostgreSQL: {peliculas} películas, {funciones} funciones, {ventas} ventas")
    except Exception as e:
        print(f"❌ Error en PostgreSQL: {e}")

    try:
        cliente = conectar_mongo()
        db = cliente[nombre_bd_mongo]
        print(f"✅ MongoDB: {db.fichas_tecnicas_peliculas.count_documents({})} fichas, "
              f"{db.resenas_peliculas.count_documents({})} reseñas, "
              f"{db.reportes_incidentes.count_documents({})} incidentes")
        cliente.close()
    except Exception as e:
        print(f"❌ Error en MongoDB: {e}")


# ============================================================================
# 1. CASO DE USO 1: FUNCIÓN CON SUS RESEÑAS
#    PostgreSQL: datos de la función y boletas vendidas
#    MongoDB:    reseñas de esa función
#    PostgreSQL: nombre de cada espectador que dejó reseña
# ============================================================================

def obtener_funcion_postgres(id_funcion):
    """Trae la función, su película, sala, sede y boletas vendidas."""
    try:
        conn = conectar_postgres()
        cursor = conn.cursor()
        cursor.execute("""
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
        fila = cursor.fetchone()
        cursor.close()
        conn.close()

        if fila is None:
            return None

        return {
            "id_funcion": fila[0],
            "fecha_hora": fila[1],
            "id_pelicula": fila[2],
            "pelicula": fila[3],
            "sede": fila[4],
            "sala": fila[5],
            "capacidad": fila[6],
            "boletas_vendidas": fila[7]
        }
    except Exception as e:
        print(f"❌ Error en PostgreSQL: {e}")
        return None


def obtener_resenas_funcion_mongo(id_funcion):
    """Trae las reseñas que se hicieron sobre una función."""
    try:
        cliente = conectar_mongo()
        db = cliente[nombre_bd_mongo]
        resenas = list(db.resenas_peliculas.find(
            {"id_funcion": id_funcion},
            {"_id": 0, "id_espectador": 1, "calificacion": 1, "texto": 1, "fecha": 1}
        ).sort("fecha", -1))
        cliente.close()
        return resenas
    except Exception as e:
        print(f"❌ Error en MongoDB: {e}")
        return []


def obtener_nombres_espectadores(ids_espectadores):
    """Devuelve un diccionario {id_espectador: nombre} desde PostgreSQL."""
    if not ids_espectadores:
        return {}
    try:
        conn = conectar_postgres()
        cursor = conn.cursor()
        cursor.execute("SELECT id_espectador, nombre FROM espectador WHERE id_espectador = ANY(%s);",
                       (list(ids_espectadores),))
        nombres = {id_esp: nombre for id_esp, nombre in cursor.fetchall()}
        cursor.close()
        conn.close()
        return nombres
    except Exception as e:
        print(f"❌ Error en PostgreSQL: {e}")
        return {}


def reporte_funcion_con_resenas(id_funcion):
    funcion = obtener_funcion_postgres(id_funcion)
    if funcion is None:
        print(f"⚠️  La función {id_funcion} no existe en PostgreSQL")
        return

    resenas = obtener_resenas_funcion_mongo(id_funcion)
    nombres = obtener_nombres_espectadores({r["id_espectador"] for r in resenas})

    print("=" * 60)
    print(f"🎬 FUNCIÓN {funcion['id_funcion']} · {funcion['pelicula']}")
    print("=" * 60)
    print(f"   Fecha: {funcion['fecha_hora']}")
    print(f"   Lugar: {funcion['sede']}, sala {funcion['sala']}")
    print(f"   Boletas vendidas: {funcion['boletas_vendidas']} de {funcion['capacidad']}")

    if not resenas:
        print("\n(No hay reseñas para esta función)")
        return

    print(f"\n💬 {len(resenas)} reseñas:\n")
    for r in resenas:
        estrellas = "⭐" * r["calificacion"]
        nombre = nombres.get(r["id_espectador"], "Espectador desconocido")
        print(f"   {estrellas} {nombre}")
        print(f'   "{r["texto"]}"\n')


# ============================================================================
# 2. CASO DE USO 2: PELÍCULA CON SU FICHA TÉCNICA Y REQUISITOS TÉCNICOS
#    PostgreSQL: película y sus funciones programadas
#    MongoDB:    ficha técnica (elenco, versiones) y requisitos de cada función
# ============================================================================

def obtener_pelicula_postgres(id_pelicula):
    """Trae los datos básicos de una película."""
    try:
        conn = conectar_postgres()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id_pelicula, nombre, clasificacion, duracion_minutos
            FROM pelicula WHERE id_pelicula = %s;
        """, (id_pelicula,))
        fila = cursor.fetchone()
        cursor.close()
        conn.close()

        if fila is None:
            return None

        return {"id_pelicula": fila[0], "nombre": fila[1], "clasificacion": fila[2], "duracion": fila[3]}
    except Exception as e:
        print(f"❌ Error en PostgreSQL: {e}")
        return None


def obtener_funciones_pelicula_postgres(id_pelicula):
    """Trae las funciones programadas de una película."""
    try:
        conn = conectar_postgres()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT f.id_funcion, f.fecha_hora_inicio, se.nombre, s.numero
            FROM funcion f
            JOIN sala s  ON s.id_sala  = f.sala_id_sala
            JOIN sede se ON se.id_sede = s.sede_id_sede
            WHERE f.pelicula_id_pelicula = %s
            ORDER BY f.fecha_hora_inicio;
        """, (id_pelicula,))
        funciones = [
            {"id_funcion": r[0], "fecha_hora": r[1], "sede": r[2], "sala": r[3]}
            for r in cursor.fetchall()
        ]
        cursor.close()
        conn.close()
        return funciones
    except Exception as e:
        print(f"❌ Error en PostgreSQL: {e}")
        return []


def obtener_ficha_y_requisitos_mongo(id_pelicula, ids_funciones):
    """Trae la ficha técnica de la película y los requisitos de sus funciones."""
    try:
        cliente = conectar_mongo()
        db = cliente[nombre_bd_mongo]
        ficha = db.fichas_tecnicas_peliculas.find_one({"id_pelicula": id_pelicula}, {"_id": 0})
        requisitos = list(db.requisitos_proyeccion.find(
            {"id_funcion": {"$in": ids_funciones}},
            {"_id": 0, "id_funcion": 1, "formato": 1, "checklist": 1}
        ))
        cliente.close()
        # Diccionario {id_funcion: documento} para buscarlo fácil
        return ficha, {r["id_funcion"]: r for r in requisitos}
    except Exception as e:
        print(f"❌ Error en MongoDB: {e}")
        return None, {}


def reporte_pelicula_con_requisitos(id_pelicula):
    pelicula = obtener_pelicula_postgres(id_pelicula)
    if pelicula is None:
        print(f"⚠️  La película {id_pelicula} no existe en PostgreSQL")
        return

    funciones = obtener_funciones_pelicula_postgres(id_pelicula)
    ids_funciones = [f["id_funcion"] for f in funciones]
    ficha, requisitos = obtener_ficha_y_requisitos_mongo(id_pelicula, ids_funciones)

    print("=" * 60)
    print(f"🎬 {pelicula['nombre']} ({pelicula['clasificacion']}, {pelicula['duracion']} min)")
    print("=" * 60)

    if ficha:
        directores = [e["nombre"] for e in ficha["elenco"] if e["rol"] == "Director"]
        print(f"   Título original: {ficha.get('titulo_original', '-')}")
        print(f"   Director: {', '.join(directores)}")
        print("   Versiones: " + "; ".join(f"{v['idioma']} {v['formato']}" for v in ficha["versiones"]))
    else:
        print("   (No tiene ficha técnica en MongoDB)")

    print(f"\n📅 {len(funciones)} funciones:\n")
    for f in funciones:
        req = requisitos.get(f["id_funcion"])
        if req:
            obligatorios = [c for c in req["checklist"] if c["obligatorio"]]
            verificados = [c for c in obligatorios if c["verificado"]]
            detalle = f"{req['formato']} · checklist {len(verificados)}/{len(obligatorios)}"
        else:
            detalle = "Estándar (sin requisitos especiales)"
        print(f"   Función {f['id_funcion']} | {f['fecha_hora']} | {f['sede']} sala {f['sala']} | {detalle}")


# ============================================================================
# 3. CASO DE USO 3: CRUCE DE VENTAS CON INCIDENTES POR SALA
#    PostgreSQL: boletas e ingresos por sala
#    MongoDB:    cantidad de incidentes por sala
# ============================================================================

def ventas_por_sala_postgres():
    """Devuelve boletas e ingresos de cada sala."""
    try:
        conn = conectar_postgres()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT s.id_sala, se.nombre, s.numero,
                   COALESCE(SUM(v.cantidad), 0)                     AS boletas,
                   COALESCE(SUM(v.cantidad * v.precio_unitario), 0) AS ingresos
            FROM sala s
            JOIN sede se ON se.id_sede = s.sede_id_sede
            LEFT JOIN funcion f ON f.sala_id_sala = s.id_sala
            LEFT JOIN venta v   ON v.funcion_id_funcion = f.id_funcion
            GROUP BY s.id_sala, se.nombre, s.numero
            ORDER BY s.id_sala;
        """)
        salas = [
            {"id_sala": r[0], "sede": r[1], "sala": r[2], "boletas": r[3], "ingresos": r[4]}
            for r in cursor.fetchall()
        ]
        cursor.close()
        conn.close()
        return salas
    except Exception as e:
        print(f"❌ Error en PostgreSQL: {e}")
        return []


def incidentes_por_sala_mongo():
    """Devuelve {id_sala: {total, fallas, quejas, seguridad}} desde MongoDB."""
    try:
        cliente = conectar_mongo()
        db = cliente[nombre_bd_mongo]
        resultado = list(db.reportes_incidentes.aggregate([
            {"$match": {"id_sala": {"$exists": True}}},
            {"$group": {
                "_id": "$id_sala",
                "total": {"$sum": 1},
                "fallas": {"$sum": {"$cond": [{"$eq": ["$tipo", "falla_tecnica"]}, 1, 0]}},
                "quejas": {"$sum": {"$cond": [{"$eq": ["$tipo", "queja_servicio"]}, 1, 0]}},
                "seguridad": {"$sum": {"$cond": [{"$eq": ["$tipo", "incidente_seguridad"]}, 1, 0]}}
            }}
        ]))
        cliente.close()
        return {r["_id"]: r for r in resultado}
    except Exception as e:
        print(f"❌ Error en MongoDB: {e}")
        return {}


def reporte_ventas_vs_incidentes():
    salas = ventas_por_sala_postgres()
    incidentes = incidentes_por_sala_mongo()

    print("=" * 75)
    print("📊 VENTAS (PostgreSQL) vs INCIDENTES (MongoDB) POR SALA")
    print("=" * 75)
    print(f"   {'Sede':<22}{'Sala':>5}{'Boletas':>9}{'Ingresos':>12}{'Incid.':>8}{'x1000 bol.':>12}")

    for s in salas:
        inc = incidentes.get(s["id_sala"], {"total": 0, "fallas": 0, "quejas": 0, "seguridad": 0})
        # Incidentes por cada 1000 boletas vendidas
        tasa = round(inc["total"] * 1000 / s["boletas"], 1) if s["boletas"] > 0 else 0
        print(f"   {s['sede']:<22}{s['sala']:>5}{s['boletas']:>9}{int(s['ingresos']):>12,}"
              f"{inc['total']:>8}{tasa:>12}")
        print(f"      fallas: {inc['fallas']} | quejas: {inc['quejas']} | seguridad: {inc['seguridad']}")


# ============================================================================
# 4. TRANSACCIÓN CRUZADA: VENTA EN POSTGRESQL + COMPROBANTE EN MONGODB
#
#    Un mismo evento (la venta) se guarda en los dos motores:
#      Paso 1. PostgreSQL: CALL registrar_venta_boletas (procedimiento del
#              Avance 1, que dispara los triggers de taquillero, sede y aforo)
#              y se asignan las sillas. TODAVÍA NO SE HACE COMMIT.
#      Paso 2. MongoDB: se inserta el comprobante de la venta.
#      Paso 3. Si MongoDB funcionó -> COMMIT en PostgreSQL.
#              Si MongoDB falló    -> ROLLBACK en PostgreSQL (la venta se deshace).
#    Así nunca queda una venta en un motor que no esté en el otro.
#
#    Por eso aquí la conexión a PostgreSQL se mantiene abierta durante los
#    tres pasos (a diferencia de las funciones de consulta).
# ============================================================================

def crear_coleccion_comprobantes():
    """Crea la colección comprobantes_venta con validación $jsonSchema (solo la primera vez)."""
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
            print("Colección comprobantes_venta creada")
        cliente.close()
    except Exception as e:
        print(f"❌ Error en MongoDB: {e}")


def registrar_venta_con_comprobante(id_espectador, id_staff, id_funcion, id_tipo_boleta,
                                    cantidad, metodo_pago, error_en_mongo=False):
    """Registra la venta en PostgreSQL y su comprobante en MongoDB.
    error_en_mongo=True manda un total negativo para que MongoDB lo rechace
    y se vea el ROLLBACK en PostgreSQL (solo para la demo)."""
    conn = None
    cliente = None
    try:
        # ---------- Paso 1: PostgreSQL (sin commit) ----------
        conn = conectar_postgres()
        cursor = conn.cursor()

        cursor.execute("CALL registrar_venta_boletas(%s, %s, %s, %s, %s, %s);",
                       (id_espectador, id_staff, id_funcion, id_tipo_boleta, cantidad, metodo_pago))

        # Id de la venta que se acaba de crear
        cursor.execute("SELECT currval(pg_get_serial_sequence('venta', 'id_venta'));")
        id_venta = cursor.fetchone()[0]

        # Primeras sillas libres de la sala de esa función
        cursor.execute("""
            SELECT a.id_asiento, a.fila, a.numero
            FROM asiento a
            JOIN funcion f ON f.sala_id_sala = a.sala_id_sala
            WHERE f.id_funcion = %s
              AND a.id_asiento NOT IN (SELECT asiento_id_asiento FROM venta_asiento
                                       WHERE funcion_id_funcion = %s)
            ORDER BY a.fila, a.numero
            LIMIT %s;
        """, (id_funcion, id_funcion, cantidad))
        sillas = cursor.fetchall()
        if len(sillas) < cantidad:
            raise Exception("No hay suficientes sillas libres")

        for id_asiento, fila, numero in sillas:
            cursor.execute("""
                INSERT INTO venta_asiento (venta_id_venta, asiento_id_asiento, funcion_id_funcion)
                VALUES (%s, %s, %s);
            """, (id_venta, id_asiento, id_funcion))

        # Datos para armar el comprobante
        cursor.execute("""
            SELECT p.nombre, se.nombre, s.numero, f.fecha_hora_inicio, v.precio_unitario
            FROM venta v
            JOIN funcion f  ON f.id_funcion  = v.funcion_id_funcion
            JOIN pelicula p ON p.id_pelicula = f.pelicula_id_pelicula
            JOIN sala s     ON s.id_sala     = f.sala_id_sala
            JOIN sede se    ON se.id_sede    = s.sede_id_sede
            WHERE v.id_venta = %s;
        """, (id_venta,))
        pelicula, sede, sala, fecha_hora, precio = cursor.fetchone()
        total = float(precio) * cantidad

        # ---------- Paso 2: MongoDB ----------
        comprobante = {
            "id_venta": id_venta,
            "id_funcion": id_funcion,
            "id_espectador": id_espectador,
            "pelicula": pelicula,
            "sede": sede,
            "sala": sala,
            "fecha_funcion": fecha_hora,
            "asientos": [f"{fila}{numero}" for _, fila, numero in sillas],
            "metodo_pago": metodo_pago,
            "total": -1 if error_en_mongo else total,
            "codigo": uuid.uuid4().hex[:10].upper(),
            "fecha_emision": datetime.now()
        }
        cliente = conectar_mongo()
        db = cliente[nombre_bd_mongo]
        resultado = db.comprobantes_venta.insert_one(comprobante)

        # ---------- Paso 3: confirmar PostgreSQL ----------
        try:
            conn.commit()
        except Exception:
            # Si el commit falla, se borra el comprobante para no dejar datos huérfanos
            db.comprobantes_venta.delete_one({"_id": resultado.inserted_id})
            raise

        print(f"✅ Venta {id_venta} registrada en PostgreSQL y comprobante {comprobante['codigo']} en MongoDB")
        print(f"   {pelicula} · {sede} sala {sala} · sillas {', '.join(comprobante['asientos'])} · total ${total:,.0f}")
        return id_venta

    except psycopg2.Error as e:
        if conn:
            conn.rollback()
        mensaje = e.diag.message_primary if e.diag.message_primary else str(e)
        print(f"❌ PostgreSQL rechazó la venta: {mensaje}")
        return None
    except PyMongoError as e:
        if conn:
            conn.rollback()
        print(f"❌ MongoDB rechazó el comprobante: {e}")
        print("   → Se hizo ROLLBACK: la venta NO quedó guardada en PostgreSQL")
        return None
    except Exception as e:
        if conn:
            conn.rollback()
        print(f"❌ Error inesperado: {e}")
        return None
    finally:
        if conn:
            conn.close()
        if cliente:
            cliente.close()


def contar_ventas_y_comprobantes():
    """Cuenta ventas en PostgreSQL y comprobantes en MongoDB (para comparar)."""
    conn = conectar_postgres()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM venta;")
    ventas = cursor.fetchone()[0]
    cursor.close()
    conn.close()

    cliente = conectar_mongo()
    comprobantes = cliente[nombre_bd_mongo].comprobantes_venta.count_documents({})
    cliente.close()
    return ventas, comprobantes


# ============================================================================
# 5. MAIN
# ============================================================================

def main():
    probar_conexiones()

    print("\n\n### CASO DE USO 1 ###")
    reporte_funcion_con_resenas(1)
    reporte_funcion_con_resenas(9999)          # caso de error: no existe

    print("\n\n### CASO DE USO 2 ###")
    reporte_pelicula_con_requisitos(1)
    reporte_pelicula_con_requisitos(9999)      # caso de error: no existe

    print("\n\n### CASO DE USO 3 ###")
    reporte_ventas_vs_incidentes()

    print("\n\n### TRANSACCIÓN CRUZADA ###")
    crear_coleccion_comprobantes()
    ventas, comprobantes = contar_ventas_y_comprobantes()
    print(f"Antes  -> ventas en PostgreSQL: {ventas} | comprobantes en MongoDB: {comprobantes}\n")

    print("1) Venta correcta (taquillero 1, función 1, 2 boletas):")
    registrar_venta_con_comprobante(1, 1, 1, 1, 2, "Tarjeta")

    print("\n2) Venta hecha por un confitero (staff 4) -> la rechaza el trigger:")
    registrar_venta_con_comprobante(1, 4, 1, 1, 1, "Efectivo")

    print("\n3) Espectador que no existe (999) -> la rechaza el procedimiento:")
    registrar_venta_con_comprobante(999, 1, 1, 1, 1, "Efectivo")

    print("\n4) MongoDB rechaza el comprobante -> PostgreSQL hace ROLLBACK:")
    registrar_venta_con_comprobante(1, 1, 1, 1, 1, "Efectivo", error_en_mongo=True)

    ventas, comprobantes = contar_ventas_y_comprobantes()
    print(f"\nDespués -> ventas en PostgreSQL: {ventas} | comprobantes en MongoDB: {comprobantes}")
    print("(solo aumentan en 1 cada uno: la venta correcta)")


if __name__ == "__main__":
    main()
