/* 
  Trigger #1: No permitir cruces de horario en una misma sala 
  (usando la duración de la película)
  Tablas usadas: Funcion, pelicula, sala y sede
*/
CREATE OR REPLACE FUNCTION horario_funcion_fn()
RETURNS trigger AS $$
  DECLARE
  duracion_pelicula INT;
  hora_fin TIMESTAMP;
  num_sala INT;
  nombre_sede VARCHAR(100);
  BEGIN
  -- Se consulta inicialmente la duración de la pelicula de la nueva función
  SELECT Duracion_Minutos
  INTO duracion_pelicula
  FROM Pelicula
  WHERE Id_Pelicula = NEW.Pelicula_Id_Pelicula;

  -- Se calcula la hora en que termina la función
  hora_fin := NEW.Fecha_Hora_Inicio + (duracion_pelicula * INTERVAL '1 minute'); 

  -- Se verifica si existe otra función en la misma sala que se cruce con la nueva función 
  -- Se excluye la propia fila en caso de UPDATE
  
  IF EXISTS (
    SELECT 1
    FROM Funcion f INNER JOIN Pelicula p
    ON p.Id_Pelicula = f.Pelicula_Id_Pelicula
    WHERE f.Sala_Id_Sala = NEW.Sala_Id_Sala
    AND f.Id_Funcion <> NEW.Id_Funcion 
    AND NEW.Fecha_Hora_Inicio < f.Fecha_Hora_Inicio + (p.Duracion_Minutos * INTERVAL '1 minute')
    AND hora_fin > f.Fecha_Hora_Inicio
  ) THEN
  -- Se trae el número de la sala y el nombre de la sede para especificar
      SELECT s.Numero, se.Nombre
      INTO num_sala, nombre_sede
      FROM Sala s INNER JOIN Sede se 
      ON se.Id_Sede = s.Sede_Id_Sede
      WHERE  s.Id_Sala = NEW.Sala_Id_Sala;
  
      RAISE EXCEPTION 'La sala % de % ya tiene una función que se cruza con el horario de la nueva función (% a %)',
      num_sala, nombre_sede, NEW.Fecha_Hora_Inicio, hora_fin;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER horario_funcion_tgr
BEFORE INSERT OR UPDATE ON Funcion
FOR EACH ROW
EXECUTE FUNCTION horario_funcion_fn();

-- Pruebas
-- Caso fallido (se cruza con la función 19)
BEGIN;
INSERT INTO Funcion (Fecha_Hora_Inicio, Idioma, Pelicula_Id_Pelicula, Sala_Id_Sala)
VALUES ('2026-10-09 18:00', 'Español', 6, 1);
ROLLBACK;

-- Caso exitoso (Empieza después de la función 19)
BEGIN;
INSERT INTO Funcion (Fecha_Hora_Inicio, Idioma, Pelicula_Id_Pelicula, Sala_Id_Sala)
VALUES ('2026-10-09 18:50', 'Español', 6, 1);
ROLLBACK;

-- =====================================================================
-- Triggers Deivid
-- =====================================================================

-- TRIGGER 1: Control de aforo total en salas
-- Tabla: Venta 
-- Se hace uso de: BEFORE INSERT
CREATE OR REPLACE FUNCTION validar_boletas_disponibles_fn()
RETURNS TRIGGER AS $$
DECLARE
    v_capacidad_sala INT;
    v_boletas_vendidas INT;
BEGIN
    -- Se obtiene la capacidad máxima de la sala de acuerdo a la función
    SELECT s.Capacidad INTO v_capacidad_sala FROM Funcion f JOIN Sala s ON f.Sala_Id_Sala = s.Id_Sala
    WHERE f.Id_Funcion = NEW.Funcion_Id_Funcion;

    -- Se valida que la función exista en la base de datos
    IF v_capacidad_sala IS NULL THEN 
        RAISE EXCEPTION 'La función % no existe.', NEW.Funcion_Id_Funcion;
    END IF;

    -- Se suman las boletas previamente vendidas para esa función
    SELECT SUM(Cantidad) INTO v_boletas_vendidas  FROM Venta
    WHERE Funcion_Id_Funcion = NEW.Funcion_Id_Funcion;

    -- Si no hay ventas registradas aún, el acumulado es 0
    IF v_boletas_vendidas IS NULL THEN  
  v_boletas_vendidas := 0;
    END IF;

    -- Se valida si la nueva venta sobrepasa la capacidad total de la sala
    IF (v_boletas_vendidas + NEW.Cantidad) > v_capacidad_sala THEN
        RAISE EXCEPTION 'La cantidad de boletas que quiere comprar (%) supera el aforo. La cantidad de boletas disponibles son: %.',
            NEW.Cantidad, (v_capacidad_sala - v_boletas_vendidas);
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validar_boletas_disponibles
BEFORE INSERT ON Venta
FOR EACH ROW
EXECUTE FUNCTION validar_boletas_disponibles_fn();

-- Caso de fallo
INSERT INTO Venta (Fecha, Precio_Unitario, Metodo_pago, Cantidad, Staff_Id_Staff, Espectador_Id_Espectador, Tipo_Boleta_Id_Tipo_Boleta, Funcion_Id_Funcion)
VALUES ('2026-10-08', 18000.00, 'Efectivo', 3, 1, 1, 1, 25);

-- Caso exitoso
INSERT INTO Venta (Fecha, Precio_Unitario, Metodo_pago, Cantidad, Staff_Id_Staff, Espectador_Id_Espectador, Tipo_Boleta_Id_Tipo_Boleta, Funcion_Id_Funcion)
VALUES ('2026-10-08', 18000.00, 'Tarjeta', 2, 1, 2, 1, 25);
