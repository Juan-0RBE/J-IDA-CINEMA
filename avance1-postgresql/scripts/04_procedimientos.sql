-- =====================================================================
-- Procedimiento Juan
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
-- Procedimiento Deivid
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

-- =====================================================================
-- Procedimiento Javier
-- =====================================================================

/*
  Procedimiento: Registrar Venta de Boletas y Calcular Total Automáticamente.
  Tipo: Cálculo / Transacción.
  Tablas usadas: Venta, Espectador, Staff, Funcion y Tipo_Boleta.
*/
-- Se crea el procedimiento para registrar las ventas.
CREATE OR REPLACE PROCEDURE registrar_venta_boletas(
    p_id_espectador INT,
    p_id_staff INT,
    p_id_funcion INT,
    p_id_tipo_boleta INT,
    p_cantidad INT,
    p_metodo_pago VARCHAR
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_precio_unitario NUMERIC(10,2);
    v_existencia_espectador INT;
    v_existencia_staff INT;
    v_existencia_funcion INT;
BEGIN
    -- Se valida que la cantidad de boletas sea mayor a cero
    IF p_cantidad <= 0 THEN
        RAISE EXCEPTION 'La cantidad de boletas debe ser mayor a 0.';
    END IF;

    -- Se verifica que el espectador exista
    SELECT Id_Espectador INTO v_existencia_espectador
    FROM Espectador
    WHERE Id_Espectador = p_id_espectador;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'El espectador con ID % no se encuentra registrado.', p_id_espectador;
    END IF;

    -- Se verifica que el miembro del staff exista
    SELECT Id_Staff INTO v_existencia_staff
    FROM Staff
    WHERE Id_Staff = p_id_staff;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'El empleado de staff con ID % no existe.', p_id_staff;
    END IF;

    -- Se verifica que la función exista
    SELECT Id_Funcion INTO v_existencia_funcion
    FROM Funcion
    WHERE Id_Funcion = p_id_funcion;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'La función con ID % no existe.', p_id_funcion;
    END IF;

    -- Se obtiene el precio unitario del tipo de boleta
    SELECT Precio INTO v_precio_unitario
    FROM Tipo_Boleta
    WHERE Id_Tipo_Boleta = p_id_tipo_boleta;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'El tipo de boleta con ID % no existe.', p_id_tipo_boleta;
    END IF;

    -- Se inserta la venta
    INSERT INTO Venta (Fecha, Precio_Unitario, Metodo_pago, Cantidad, Staff_Id_Staff, Espectador_Id_Espectador, Tipo_Boleta_Id_Tipo_Boleta, Funcion_Id_Funcion)
    VALUES (CURRENT_DATE, v_precio_unitario, p_metodo_pago, p_cantidad, p_id_staff, p_id_espectador, p_id_tipo_boleta, p_id_funcion);
    RAISE NOTICE 'Venta registrada con éxito. Total a pagar: %', (p_cantidad * v_precio_unitario);

EXCEPTION
    WHEN raise_exception THEN
        RAISE;
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error inesperado al registrar la venta de boletas: %', SQLERRM;
END;
$$;

-- Caso exitoso (La venta es completamente válida.)
BEGIN;
CALL registrar_venta_boletas(
    p_id_espectador := 1, 
    p_id_staff := 1, 
    p_id_funcion := 1, 
    p_id_tipo_boleta := 1, 
    p_cantidad := 2, 
    p_metodo_pago := 'Tarjeta'
);
ROLLBACK;

-- Caso fallido (El espectador no existe.)
BEGIN;
CALL registrar_venta_boletas(
    p_id_espectador := 999, 
    p_id_staff := 1, 
    p_id_funcion := 1, 
    p_id_tipo_boleta := 1, 
    p_cantidad := 2, 
    p_metodo_pago := 'Efectivo'
);
ROLLBACK;

-- Caso fallido (Cantidad de boletas inválida.)
BEGIN;
CALL registrar_venta_boletas(
    p_id_espectador := 1, 
    p_id_staff := 1, 
    p_id_funcion := 1, 
    p_id_tipo_boleta := 1, 
    p_cantidad := 0, 
    p_metodo_pago := 'Efectivo'
);
ROLLBACK;

-- =====================================================================
-- Procedimiento Isabella
-- =====================================================================
/*
  Procedimiento: Realizar venta de confiteria sobre una venta ya realizada
  Tipo: Calculo/Transacción
  Tablas usadas: Venta, producto_confiteria, Vent_pro
*/

CREATE OR REPLACE PROCEDURE registrar_ven_pro(
    p_id_venta          INT,
    p_id_producto       INT,
    p_cantidad          INT,
    INOUT p_total_venta NUMERIC
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_precio NUMERIC(10,2);  -- Variable donde se almacena el precio del producto actualmente
    v_stock  INT;            -- Variable que contiene el stock del producto
    v_nombre VARCHAR(100);   -- Variable con el nombre del producto
    v_id_venta INT;          -- Variable con el id de la venta
BEGIN
   
    -- Verifica que los id de venta y producto no sean nulos
    IF p_id_venta IS NULL OR p_id_producto IS NULL THEN
        RAISE EXCEPTION 'La venta y el producto son obligatorios.';
    END IF;

    -- Verifica que la cantidad sea valida
    IF p_cantidad IS NULL OR p_cantidad <= 0 THEN
        RAISE EXCEPTION 'La cantidad debe ser mayor a 0.';
    END IF;

    -- Almacena el id de la venta en la variable declarada en caso de que lo encuentre
    SELECT Id_Venta INTO v_id_venta 
    FROM Venta 
    WHERE Id_Venta = p_id_venta 
    FOR UPDATE;

    -- Si la variable queda vacía (NULL), significa que no se encontró
    IF v_id_venta IS NULL THEN 
        RAISE EXCEPTION 'La venta % no existe.', p_id_venta; 
    END IF;
 
    -- El producto debe existir. Se toma su precio actual
    SELECT Precio, Stock, Nombre
      INTO v_precio, v_stock, v_nombre
      FROM Producto_Confiteria
     WHERE Id_Producto = p_id_producto
       FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'El producto % no existe.', p_id_producto;
    END IF;

    -- Se verifica que el stock sea suficinte para la cantidad solicitada
    IF v_stock < p_cantidad THEN
        RAISE EXCEPTION 'Stock insuficiente de "%": disponible %, solicitado %.',
                        v_nombre, v_stock, p_cantidad;
    END IF;

    -- Verifica si ese producto ya se encuentra en la venta para no repetirlo
    IF EXISTS (SELECT 1 FROM Ven_Pro
                WHERE Venta_Id_Venta = p_id_venta
                  AND Prod_Conf_Id_Prod = p_id_producto) THEN
        RAISE EXCEPTION 'El producto "%" ya está en la venta %.', v_nombre, p_id_venta;
    END IF;

    -- Por ultimo, hace la incersión de la Ven_pro a la venta realizada
    INSERT INTO Ven_Pro (Venta_Id_Venta, Prod_Conf_Id_Prod, Cantidad, Precio_unitario)
    VALUES (p_id_venta, p_id_producto, p_cantidad, v_precio);
 
    -- Almacena en la variable p_total_venta el total actual de la venta (boletas + todos sus productos)
    SELECT v.Cantidad * v.Precio_Unitario
           + COALESCE((SELECT SUM(vp.Cantidad * vp.Precio_unitario)
                         FROM Ven_Pro vp
                        WHERE vp.Venta_Id_Venta = v.Id_Venta), 0)
      INTO p_total_venta
      FROM Venta v
      WHERE v.Id_Venta = p_id_venta;
END;
$$;

-- Casos exitosos 
-- Por cada venta ya existente se genera una venta de productos de confiteria con stock suficiente
-- Venta 1 del producto 1 con cantidad de 3
CALL registrar_ven_pro(1, 1, 3, NULL);
-- Venta 1 del producto 1 con cantidad de 3
CALL registrar_ven_pro(1, 2, 1, NULL);
-- Venta 2 del prudcto 
CALL registrar_ven_pro(2, 2, 1, NULL);

-- Casos fallidos
-- Tanto el id de venta como el de producto son obligatorios
CALL registrar_ven_pro(NULL, 1, 1, NULL);
CALL registrar_ven_pro(1, NULL, 1, NULL);

-- El valor de la cantidad no puede ser igual o menor a 0
CALL registrar_ven_pro(3, 1, 0, NULL);
CALL registrar_ven_pro(3, 1, -2, NULL);
CALL registrar_ven_pro(3, 1, NULL, NULL);

-- Se debe ingresar un id válido tanto de la venta como del producto
CALL registrar_ven_pro(999999, 1, 1, NULL);
CALL registrar_ven_pro(3, 999999, 1, NULL);

-- Debe haber stock suficiente para que se realice la venta
CALL registrar_ven_pro(3, 1, 500, NULL);

-- La venta con id 1 ya cuenta con este producto
CALL registrar_ven_pro(1, 1, 1, NULL);
