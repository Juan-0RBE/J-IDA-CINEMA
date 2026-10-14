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

-- =====================================================================
-- Procedimientos Deivid
-- =====================================================================
-- Procedimiento de registrar un contrato
-- Tablas usadas: Contrato, Actor_Director
CREATE OR REPLACE PROCEDURE registrar_contrato(
    actor_director_id INTEGER,
    funcion_id        INTEGER,
    inicio_contrato   DATE,
    fin_contrato      DATE,
    estado_contrato   VARCHAR DEFAULT 'Vigente'
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_id      INTEGER;
    v_nombre  VARCHAR(100);
BEGIN
    -- Se valida que los campos de la fecha no sean nulos
    IF inicio_contrato IS NULL OR fin_contrato IS NULL THEN
        RAISE EXCEPTION 'Las fechas de inicio y fin son obligatorias';
    END IF;

    -- Validación para que la fecha de finalización no sea previa a la fecha en la que se inicia ese contrato
    IF fin_contrato < inicio_contrato THEN
        RAISE EXCEPTION 'La fecha fin (%) no puede ser anterior a la fecha inicio (%)',
            fin_contrato, inicio_contrato;
    END IF;

    -- Verificar que el actor o el director escogido exista
    SELECT Nombre INTO v_nombre FROM actor_director
    WHERE Id_Actor_Director = actor_director_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'El actor o el director: % no existe', actor_director_id;
    END IF;

    -- Verificar que la función existe
    SELECT Id_Funcion INTO v_id FROM funcion WHERE Id_Funcion = funcion_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'La función escogida % no existe', funcion_id;
    END IF;

    -- Se hace el registro de un contrato
    INSERT INTO Contrato (Fecha_inicio, Fecha_fin, Estado, Act_Dir_Id_Actor_Dir, Funcion_Id_Funcion) 
  VALUES (inicio_contrato, fin_contrato, estado_contrato, actor_director_id, funcion_id);

    RAISE NOTICE 'Contrato registrado para "%", de la función %, desde % hasta %',
        v_nombre, funcion_id, inicio_contrato, fin_contrato;
EXCEPTION
      WHEN OTHERS THEN
        RAISE EXCEPTION 'No se pudo registrar el contrato: %', SQLERRM;
END;
$$;
-- Caso exitoso 
CALL registrar_contrato(1, 5, '2026-10-01', '2026-10-31');

-- Caso de fallo: Actor o director que no se encuentra en la base de datos (No existe)
CALL registrar_contrato(9999, 25, '2026-10-01', '2026-10-31');

-- Caso de fallo: Fecha de inicio mayor a la de finalización
CALL registrar_contrato(1, 25, '2026-10-31', '2026-10-01');
