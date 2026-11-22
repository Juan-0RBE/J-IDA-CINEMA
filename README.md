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
- Dirigirse a la carpeta `avance1-postgresql`.
- Ejecutar el script `01_creacion_tablas.sql` en un entorno como Neon para crear las tablas que se usan en PostgreSQL.
- Ejecutar el script `02_datos_prueba.sql` para cargar los datos correspondientes en las tablas.
- Ejecutar el script `03_triggers.sql` para observar ejemplos de aplicación de *triggers* sobre las tablas creadas.
- Ejecutar el script `04_procedimientos.sql` para observar ejemplos de aplicación de procedimientos sobre las tablas creadas.
- Ejecutar el script `05_consultas.sql` para observar ejemplos de aplicación de consultas sobre las tablas creadas.

### Fase 2: MongoDB
- Dirigirse a la carpeta `avance2-mongodb`.
- Ejecutar el script `01_creacion_colecciones.js` en un entorno como MongoDB Compass para crear las colecciones que se usan en MongoDB.
- Ejecutar el script `02_datos_prueba.js` para cargar los datos correspondientes en las colecciones creadas.
- Ejecutar el script `03_consultas.js` para observar ejemplos de aplicación de consultas sobre las colecciones creadas.

### Fase 3: Integración
- Dirigirse a la carpeta `entrega-final`.
- Descargar el script de integración `jida_cinema_api.py`, que contiene la integración políglota entre las bases de datos.
- En el archivo `env.example` (o `.env.example`), reemplazar las credenciales de ejemplo por las propias para llevar a cabo las pruebas.
- Descargar la carpeta `Frontend` que se encuentra dentro de la carpeta `modulo-api` para usar la interfaz que se conecta con el código de Python.
- Para ejecutar el código de Python, usar el botón **Run** en un editor de código como VS Code.
- Para ejecutar la interfaz, usar el comando correspondiente en la terminal de VS Code según el *framework* del proyecto (`npm start` o `ng serve`).

### Verificaciones

Para poder comparar los resultados obtenidos, puede apoyarse de las evidencias que se encuentran en cada carpeta mencionada durante el proceso.

Abrir `http://localhost:4200`.
---

## Entregables

- [Informe final consolidado](entrega-final/informe-final-consolidado.pdf)
- [Reflexiones individuales](entrega-final/portafolio-individual/)
