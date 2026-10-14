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



