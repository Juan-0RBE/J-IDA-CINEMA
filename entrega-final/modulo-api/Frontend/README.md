# J'IDA Cinema - Frontend Angular

Mini frontend para visualizar los casos de prueba de `jida_cinema_api.py`
(integración PostgreSQL en Neon + MongoDB).

## Requisitos

- Node.js 20.19 o superior (o 22.12+)
- El API corriendo en `http://localhost:8000`

## Ejecutar

```bash
# 1. En la carpeta del API (con su .env al lado)
python jida_cinema_api.py

# 2. En esta carpeta
npm install
npm start
```

Abrir `http://localhost:4200`. El API ya permite CORS desde ese origen.

## Estructura

```
src/
  main.ts               arranque (HttpClient, locale es-CO, sin zone.js)
  styles.scss           estilos globales y paleta
  app/
    api.ts              URL del API, tipo del catálogo y formato de errores
    app.component.*     cabecera con estado de conexiones y navegación
    caso1/              Función con sus reseñas
    caso2/              Película con ficha técnica y requisitos
    caso3/              Ventas frente a incidentes por sala
    venta/              Transacción cruzada 1: venta + comprobante
    evento/             Transacción cruzada 2: reserva de evento + requisitos
    resultado/          Bitácora y conteos antes/después de las transacciones
```

Si el API corre en otro puerto, cambia la constante `API` en `src/app/api.ts`.
