-- =====================================================================
-- Triggers Juan
-- =====================================================================

/*
  Procedimiento: Reservar la sala de eventos con anticipación: 
  validar que esté libre y crear la función.
  Tipo: Mantenimiento / operación
  Tablas usadas: Sala, Sede, Funcion y Pelicula.
*/

CREATE OR REPLACE PROCEDURE reservar_evento(
  p_id_pelicula INT,
  p_hora_inicio TIMESTAMP,
  p_idioma VARCHAR,
  p_num_sala INT,
  p_nom_sede VARCHAR
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_dias_anticipacion CONSTANT INT := 7;
  v_id_sala INT;
  v_tipo_sala VARCHAR(30);
  v_duracion INT;
  v_hora_fin TIMESTAMP;
BEGIN
  -- Primero se verifica que la sala exista en la sede indicada
  SELECT s.Id_Sala, s.Tipo_Sala
  INTO v_id_sala, v_tipo_sala
  FROM Sala s INNER JOIN Sede se
  ON s.Sede_Id_Sede = se.Id_Sede
  WHERE s.Numero = p_num_sala
  AND se.Nombre = p_nom_sede
  FOR UPDATE OF s;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Sala % no encontrada en la sede %', p_num_sala, p_nom_sede;
  END IF;

  -- Segundo, se verifica que la sala realmente sea una sala de eventos

  IF v_tipo_sala <> 'Eventos' THEN
    RAISE EXCEPTION 'La sala % de la sede % no es una sala de eventos', p_num_sala, p_nom_sede;
  END IF;

  -- Tercero, se verifica que la pelicula exista

  SELECT Duracion_Minutos
  INTO v_duracion
  FROM Pelicula
  WHERE Id_Pelicula = p_id_pelicula;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'La pelicula con id % no existe', p_id_pelicula;
  END IF;

  -- Cuarto, se verifica que se cumpla con la anticipación mínima

  IF p_hora_inicio < NOW() + v_dias_anticipacion * INTERVAL '1 day' THEN
    RAISE EXCEPTION 'Se debe reservar la sala con % días de anticipación', v_dias_anticipacion;
  END IF;
  
  -- Quinto, se verifica que la sala esté libre en el horario
  
  v_hora_fin := p_hora_inicio + (v_duracion * INTERVAL '1 minute');

  IF EXISTS (
    SELECT 1
    FROM Funcion f
    JOIN Pelicula p ON p.Id_Pelicula = f.Pelicula_Id_Pelicula
    WHERE f.Sala_Id_Sala = v_id_sala
    AND p_hora_inicio < f.Fecha_Hora_Inicio + (p.Duracion_Minutos * INTERVAL '1 minute')
    AND v_hora_fin > f.Fecha_Hora_Inicio
  ) THEN
    RAISE EXCEPTION 'La sala % de % ya tiene una función que se cruza con el horario de % a %',
    p_num_sala, p_nom_sede, p_hora_inicio, v_hora_fin;
  END IF;

  -- Se crea la funcion
  
  INSERT INTO Funcion (Fecha_Hora_Inicio, Idioma, Pelicula_Id_Pelicula, Sala_Id_Sala)
  VALUES (p_hora_inicio, p_idioma, p_id_pelicula, v_id_sala);
  
  RAISE NOTICE 'Reserva creada exitosamente';
  EXCEPTION
    WHEN raise_exception THEN
      RAISE;   -- Deja pasar los mensajes de validación (incluidos los del trigger)
    WHEN OTHERS THEN
      RAISE EXCEPTION 'Error inesperado al reservar la sala de eventos: %', SQLERRM;
END;
$$;



-- Casos de prueba

-- Reserva ya hecha en un horario que se cruza
BEGIN;
-- Caso exitoso
CALL reservar_evento(4, '2026-10-20 18:00', 'Español', 5, 'J''IDA Cinema Bogotá');
-- Caso fallido, se cruza con la reserva anterior
CALL reservar_evento(4, '2026-10-20 19:00', 'Español', 5, 'J''IDA Cinema Bogotá');
ROLLBACK;

-- Caso fallido, la sala es una sala general
CALL reservar_evento(4, '2026-10-20 18:00', 'Español', 1, 'J''IDA Cinema Bogotá');
-- Caso fallido, es una sala inexistente en esa sede
CALL reservar_evento(4, '2026-10-20 18:00', 'Español', 5, 'J''IDA Cinema Sibaté');
-- Caso fallido, no se reserva con el tiempo de anticipación establecido
CALL reservar_evento(4, '2026-10-09 18:00', 'Español', 5, 'J''IDA Cinema Bogotá');