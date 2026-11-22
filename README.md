# J'IDA Cinema

Proyecto de Bases de Datos 2: Un sistema de información para una cadena de cines que combina
**PostgreSQL** para los datos transaccionales y **MongoDB** para los documentos, integrados mediante un API en Python y una interfaz web en Angular.

## Empresa

**J'IDA Cinema** es <!-- TODO: descripción breve de la empresa: qué es, cuántas sedes tiene, qué ofrece (funciones, eventos privados, confitería) -->.

## Grupo 5

| Integrante | Usuario de GitHub |
| --- | --- |
| Paulo Alejandro Ferrer Carreño | LeNot-T |
| Javier Alejandro García Ospina | Jgarciaos |
| Juan Andrés Orjuela Bello | Juan-0RBE |
| Isabella Rodríguez Mendoza | isabellard |
| Deivid Esteban Rodríguez Pinzón | Deivid012-12 |

---

## Estructura del repositorio

```
.
├── avance1-postgresql/                   Fase 1: modelo relacional en PostgreSQL
|   ├── evidencias
|   ├── modelo-er
|   ├── modelo-relacional
|   ├── scripts                        
├── avance2-mongodb/                      Fase 2: modelo documental en MongoDB
|   ├── diagrama-arquitectura-poliglota
|   ├── evidencias
|   ├── scripts                         
├── entrega-final/                        Fase 3: integración
│   ├── script-integracion/
│   ├── modulo-api/
│   ├── informe-final-consolidado.pdf
│   └── portafolio-individual/
└── README.md
```

## Arquitectura

Cada motor guarda lo que mejor maneja, y la capa de integración en Python cruza la información.

| Motor | Qué guarda |
| --- | --- |
| PostgreSQL | Películas, sedes, salas, asientos, funciones, espectadores, staff, ventas, confitería y stock. Procedimientos y triggers de negocio (`registrar_venta_boletas`, `registrar_ven_pro`, `reservar_evento`). |
| MongoDB | Fichas técnicas (`fichas_tecnicas_peliculas`), reseñas (`resenas_peliculas`), reportes de incidentes (`reportes_incidentes`), requisitos de proyección (`requisitos_proyeccion`) y comprobantes de venta (`comprobantes_venta`). |

---

## Requisitos

- Python 3.10 o superior
- Node.js 20.19 o superior (solo para el frontend)
- Acceso a la base de datos en Neon y al clúster de MongoDB Atlas.

## Ejecución

### Fase 1: PostgreSQL

<!-- TODO: pasos de la fase 1. Ejemplo: -->

```bash
psql "<cadena de conexión de Neon>" -f avance-1/<script-creacion>.sql
psql "<cadena de conexión de Neon>" -f avance-1/<script-datos>.sql
```

### Fase 2: MongoDB

<!-- TODO: pasos de la fase 2. Ejemplo: -->

```bash
mongosh "<cadena de conexión de Atlas>" avance-2/<script-colecciones>.js
```

### Fase 3: Integración

**1. Variables de entorno.** En `entrega-final/modulo-api/` copiar `.env.example` como `.env` y llenar
los datos de conexión. El archivo `.env` no se sube al repositorio.

```
PG_HOST=ep-xxxxx-pooler.c-7.us-east-2.aws.neon.tech
PG_DATABASE=neondb
PG_USER=neondb_owner
PG_PASSWORD=
PG_PORT=5432
PG_SSLMODE=require
MONGO_URL=mongodb+srv://usuario:password@cluster.xxxxx.mongodb.net/
MONGO_DB=jida_cinema
```

**2. Script de integración.**

```bash
cd entrega-final/script-integracion
pip install -r ../modulo-api/requirements.txt
python <!-- TODO: nombre del script -->.py
```

**3. API.**

```bash
cd entrega-final/modulo-api
pip install -r requirements.txt
python jida_cinema_api.py
```

El API queda en `http://localhost:8000` y su documentación interactiva (Swagger) en
`http://localhost:8000/docs`.

**4. Frontend.** Con el API en ejecución, en otra terminal:

```bash
cd entrega-final/modulo-api/frontend
npm install
npm start
```

Abrir `http://localhost:4200`.
---

## Entregables

- [Informe final consolidado](entrega-final/informe-final-consolidado.pdf)
- [Reflexiones individuales](entrega-final/portafolio-individual/)
