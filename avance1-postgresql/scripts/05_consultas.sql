-- =====================================================================
-- Consultas Juan
-- =====================================================================

/*
  Consulta: Películas más vistas por sede.
  Tablas usadas: Venta, Funcion, Pelicula, Sala y Sede.
*/

/* 
  Inicialmente, en un CTE se obtienen boletas vendidas por película en cada sede, 
  solo de funciones ya proyectadas 
*/
WITH vistas_por_sede AS (
  SELECT 
    se.Id_Sede AS id_sede, 
    se.Nombre AS nombre_sede, 
    p.Id_Pelicula AS id_pelicula, 
    p.Nombre AS nombre_pelicula, 
    SUM(v.Cantidad) AS cantidad_vistas 
  FROM Venta v INNER JOIN Funcion f
  ON v.Funcion_Id_Funcion = f.Id_Funcion
  INNER JOIN Pelicula p
  ON p.Id_Pelicula = f.Pelicula_Id_Pelicula
  INNER JOIN Sala s
  ON s.Id_Sala = f.Sala_Id_Sala
  INNER JOIN Sede se
  ON s.Sede_Id_Sede = se.Id_Sede
  -- Se filtran solo funciones ya proyectadas
  WHERE f.Fecha_Hora_Inicio < NOW()
  GROUP BY se.Id_Sede, se.Nombre, p.Id_Pelicula, p.Nombre
)
/*
  Se hace un ranking, que se ajusta por cada sede, teniendo en cuenta puestos 
  iguales en caso de que dos o más películas tengan la misma cantidad de vistas
*/
SELECT nombre_sede, nombre_pelicula, cantidad_vistas, RANK() OVER (PARTITION BY id_Sede ORDER BY cantidad_vistas DESC) AS posicion
FROM vistas_por_sede
ORDER BY nombre_sede, posicion;

-- =====================================================================
-- Consulta Deivid
-- =====================================================================
--Consulta: consultar los ingresos de cada colaborador para identificar mayores ganancias
-- Tipo ventana: uso de RANK
WITH ingresos_colaborador AS (
  SELECT c.Id_Colaborador AS id_colaborador, c.Nombre_negocio AS colaborador,c.Estado AS estado,
  --Se calcula el total de unidades vendidas (productos)
    SUM(vp.Cantidad) AS unidades_vendidas,
  -- Se calcula el total de ingresos multiplicando la cantidad vendida por el precio unitario de cada producto.
    SUM(vp.Cantidad * vp.Precio_unitario) AS ingresos FROM Ven_Pro vp JOIN Producto_Confiteria pc ON pc.Id_Producto = vp.Prod_Conf_Id_Prod JOIN Colaborador c
  ON c.Id_Colaborador = pc.Colaborador_Id_Colaborador GROUP BY c.Id_Colaborador, c.Nombre_negocio, c.Estado
  )
  --Se establece un ranking entre los colaboradores con respecto a las unidades de sus productos vendidas
SELECT colaborador,estado, unidades_vendidas, ingresos, RANK() OVER (ORDER BY ingresos DESC) AS posicion,
  ROUND(ingresos * 100.0 / SUM(ingresos) OVER (), 2) AS porcentaje_total FROM ingresos_colaborador ORDER BY posicion, colaborador;

-- =====================================================================
-- Consulta Javier
-- =====================================================================

/*
  Consulta: Rendimiento y recaudo total por empleado en cada sede.
  Tablas usadas: Staff, Sede y Venta.
*/
-- En un CTE, se consulta toda la información de las sedes, staff y ventas.
-- Se hace LEFT y no INNER JOIN con Staff para que los empleados sin ventas también aparezcan.
WITH rendimiento_staff AS (
  SELECT 
    se.Id_Sede AS id_sede,
    se.Nombre AS nombre_sede,
    st.Id_Staff AS id_staff,
    st.Nombre AS nombre_staff,
    rs.Nombre AS rol,
    COUNT(v.Id_Venta) AS total_transacciones,
    COALESCE(SUM(v.Cantidad), 0) AS total_boletas_vendidas,
    COALESCE(SUM(v.Cantidad * v.Precio_Unitario), 0.00) AS recaudo_total
  FROM Staff st
  INNER JOIN Sede se ON st.Sede_Id_Sede = se.Id_Sede
  INNER JOIN Rol_Staff rs ON st.Id_Rol_Staff = rs.Id_Rol_Staff
  LEFT JOIN Venta v ON st.Id_Staff = v.Staff_Id_Staff
  GROUP BY se.Id_Sede, se.Nombre, st.Id_Staff, st.Nombre, rs.Nombre
)
-- Se consultan los datos de Sede, Staff y Venta desde el CTE y se 
-- ordena por sede de forma descendente.
SELECT nombre_sede, nombre_staff, rol, total_transacciones, total_boletas_vendidas, recaudo_total
FROM rendimiento_staff
ORDER BY nombre_sede, recaudo_total DESC;


-- =====================================================================
-- Consulta Isabella
-- =====================================================================
/*
  Consulta: Ingresos totales por película (boletas + confitería).
  Tipo: Reporte con agregación.
  Tablas usadas: Pelicula, Funcion, Venta y Ven_Pro.
*/

-- CTE 1: ingresos por boletas, agrupados por película.
WITH boletas AS (
    SELECT f.Pelicula_Id_Pelicula AS id_pelicula,
           -- Total de boletas vendidas de la película
           SUM(v.Cantidad)                     AS boletas_vendidas,
           -- Dinero de boletas
           SUM(v.Cantidad * v.Precio_Unitario) AS ingresos_boletas
    FROM Venta v
    JOIN Funcion f ON f.Id_Funcion = v.Funcion_Id_Funcion
    GROUP BY f.Pelicula_Id_Pelicula
),

-- CTE 2: ingresos por confitería, agrupados por película.
confiteria AS (
    SELECT f.Pelicula_Id_Pelicula AS id_pelicula,
           -- Dinero de productos (se usa el precio congelado en Ven_Pro)
           SUM(vp.Cantidad * vp.Precio_unitario) AS ingresos_confiteria
    FROM Ven_Pro vp
    JOIN Venta   v ON v.Id_Venta   = vp.Venta_Id_Venta
    JOIN Funcion f ON f.Id_Funcion = v.Funcion_Id_Funcion
    GROUP BY f.Pelicula_Id_Pelicula
)

-- Consulta final: une las dos agregaciones con la tabla de películas.
SELECT p.Id_Pelicula,
       p.Nombre                               AS pelicula,
       -- COALESCE: si la película no tiene ventas, muestra 0 en vez de NULL
       COALESCE(b.boletas_vendidas, 0)        AS boletas_vendidas,
       COALESCE(b.ingresos_boletas, 0)        AS ingresos_boletas,
       COALESCE(c.ingresos_confiteria, 0)     AS ingresos_confiteria,
       -- Total = boletas + confitería
       COALESCE(b.ingresos_boletas, 0) + COALESCE(c.ingresos_confiteria, 0) AS ingresos_totales
FROM Pelicula p
-- LEFT JOIN: incluye también las películas que no han vendido nada
LEFT JOIN boletas    b ON b.id_pelicula = p.Id_Pelicula
LEFT JOIN confiteria c ON c.id_pelicula = p.Id_Pelicula
-- Las películas que más ingresos generan aparecen primero
ORDER BY ingresos_totales DESC;
