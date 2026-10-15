-- =====================================================================
-- Triggers Juan
-- =====================================================================
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

-- Trigger #2: Control de aforo total en salas
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


-- =====================================================================
-- Triggers Isabella
-- =====================================================================
/* 
Trigger #3: controla que solo el staff de taquillero pueda realizar ventas
Tablas usadas: ventas, staff
*/
CREATE OR REPLACE FUNCTION venta_taquillero_fn()
RETURNS trigger AS $$
DECLARE 
  rol_empleado INTEGER; --Variable donde se almacena el rol del Staff que realiza la venta
BEGIN
    -- Se almacena el id del rol del staff en la variable declarada
    SELECT Id_Rol_Staff
    INTO rol_empleado
    FROM Staff
    WHERE Id_Staff = NEW.Staff_Id_Staff;

    -- En caso de que el id del empleado no exista, lanza la siguiente excepción
    IF NOT FOUND THEN
        RAISE EXCEPTION 'El empleado no existe.';
    END IF;

   -- En caso de que el el rol sea diferente a 'Taquillero' (1), lanza la siguiente excepción
    IF rol_empleado <> 1 THEN
        RAISE EXCEPTION
            'No se puede registrar la venta: solo el personal con rol Taquillero puede realizar ventas.';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- El trigger se realiza antes de la inserción de venta verificando cada fila isertada
CREATE TRIGGER trg_venta_taquillero
BEFORE INSERT ON Venta
FOR EACH ROW
EXECUTE FUNCTION venta_taquillero_fn();

-- Caso exitoso: el staff que realiza la venta es 'Taquillero'
INSERT INTO Venta (Fecha, Precio_Unitario, Metodo_pago, Cantidad,Staff_Id_Staff, Espectador_Id_Espectador, Tipo_Boleta_Id_Tipo_Boleta, Funcion_Id_Funcion) 
VALUES('2026-10-12', 18000, 'Tarjeta', 2, 1, 1, 1, 1);

-- Caso exitoso: el staff que realiza la venta es 'Taquillero'
INSERT INTO Venta (Fecha, Precio_Unitario, Metodo_pago, Cantidad,Staff_Id_Staff, Espectador_Id_Espectador, Tipo_Boleta_Id_Tipo_Boleta, Funcion_Id_Funcion) 
VALUES('2026-10-12', 18000, 'Tarjeta', 2, 10, 1, 1, 1);

/*
Trigger #4: el stock del producto de confiteria se actualiza luego de realizar una venta
Tablas utilizadas: producto_confiteria y Ven_Pro
*/

CREATE OR REPLACE FUNCTION descontar_stock_fn()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Actualiza la tabla Producto_confiteria con el nuevo stock 
    UPDATE Producto_Confiteria
       SET Stock = Stock - NEW.Cantidad
     WHERE Id_Producto = NEW.Prod_Conf_Id_Prod
       AND Stock >= NEW.Cantidad;

    -- Si no encuentra el producto o hay stock insuficiente, lanza la siguiguiente excepción
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Stock insuficiente (o producto inexistente) para el producto % al registrar la venta %.',
                        NEW.Prod_Conf_Id_Prod, NEW.Venta_Id_Venta;
    END IF;
 
    RETURN NULL;
END;
$$;

-- El trigger se ejecta luego de insertar una venta 
CREATE TRIGGER trg_descontar_stock
BEFORE INSERT ON Ven_Pro
FOR EACH ROW
EXECUTE FUNCTION descontar_stock_fn();

-- Caso exitoso: se solicita una cantidad de 3 unidades del producto con id 1
INSERT INTO Ven_Pro (Venta_Id_Venta, Prod_Conf_Id_Prod, Cantidad, Precio_unitario)
VALUES (1, 1, 3, 16500.00);

-- Caso fallido: se solicita una cantidad de 60 unidades del producto con id 1, lo cual excede la cantidad disponible
INSERT INTO Ven_Pro (Venta_Id_Venta, Prod_Conf_Id_Prod, Cantidad, Precio_unitario)
VALUES (2, 1, 61, 16500.00);

-- Caso fallido: se solicita una cantidad de 2 unidades del producto con id 13 (un producto no existente)
INSERT INTO Ven_Pro (Venta_Id_Venta, Prod_Conf_Id_Prod, Cantidad, Precio_unitario)
VALUES (2, 13, 1, 16500.00);

-- =====================================================================
-- Triggers Javier
-- =====================================================================
/*
Trigger #5: Controla que no se puedan agregar o actualizar productos de confitería si el colaborador
se encuentra en estado 'Inactivo' (por ejemplo, si su temporada de alianza terminó).

Tablas usadas: Producto_Confiteria, Colaborador
*/

-- Se crea la función del trigger para verificar el estado del colaborador
CREATE OR REPLACE FUNCTION fn_verificar_estado_colaborador()
RETURNS TRIGGER AS $$
DECLARE
    v_estado_colaborador VARCHAR(20);
    v_nombre_negocio VARCHAR(100);
BEGIN
    -- Se consulta el estado y el nombre del colaborador de un producto
    SELECT Estado, Nombre_negocio 
    INTO v_estado_colaborador, v_nombre_negocio
    FROM Colaborador
    WHERE Id_Colaborador = NEW.Colaborador_Id_Colaborador;

    -- Se valida que el colaborador exista
    IF v_estado_colaborador IS NULL THEN
        RAISE EXCEPTION 'El colaborador con ID % no se encuentra registrado.', 
            NEW.Colaborador_Id_Colaborador;
    END IF;

    -- Se valida que el colaborador esté activo
    IF v_estado_colaborador <> 'Activo' THEN
        RAISE EXCEPTION 'No se puede registrar o actualizar el producto para el colaborador "%" (ID %) porque su estado actual es Inactivo.',
            v_nombre_negocio, NEW.Colaborador_Id_Colaborador;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Se crea el Trigger
CREATE TRIGGER trg_verificar_estado_colaborador
    BEFORE INSERT OR UPDATE ON Producto_Confiteria
    FOR EACH ROW
    EXECUTE FUNCTION fn_verificar_estado_colaborador();

-- Pruebas:
-- Caso exitoso (Se registra un producto con colaborador activo.)
BEGIN;
INSERT INTO Producto_Confiteria (Precio, Nombre, Stock, Categoria, Colaborador_Id_Colaborador)
VALUES (14500.00, 'Crepe con Arequipe y Helado', 40, 'Postres', 1);
ROLLBACK;

-- Caso fallido (Se registra un producto con colaborador inactivo.)
BEGIN;
INSERT INTO Producto_Confiteria (Precio, Nombre, Stock, Categoria, Colaborador_Id_Colaborador)
VALUES (8000.00, 'Combo Pizza Personal Cinepolitana', 25, 'Combos', 4);
ROLLBACK;

-- Caso fallido (El colaborador no existe.)
BEGIN;
INSERT INTO Producto_Confiteria (Precio, Nombre, Stock, Categoria, Colaborador_Id_Colaborador)
VALUES (12000.00, 'Capuchino Nevado Especial', 30, 'Bebidas', 99);
ROLLBACK;

/*
Trigger #6: Controla la inserción y actualización de espectadores. Verifica que la fecha de nacimiento 
no sea una fecha en el futuro y valida que el correo electrónico ingresado tenga un formato válido.

Tablas usadas: Espectador
*/

-- Se crea la función del trigger para los espectadores
CREATE OR REPLACE FUNCTION fn_validar_espectador()
RETURNS TRIGGER AS $$
BEGIN
    -- Se verifica que la fecha de nacimiento no esté en el futuro
    IF NEW.Fecha_Nacimiento IS NOT NULL AND NEW.Fecha_Nacimiento > CURRENT_DATE THEN
        RAISE EXCEPTION 'La fecha de nacimiento del espectador (%) no puede ser una fecha en el futuro.',
            NEW.Fecha_Nacimiento;
    END IF;

    -- Se valida que el correo tenga un formato válido con '@'
    IF NEW.Correo NOT SIMILAR TO '%@%.%' THEN
        RAISE EXCEPTION 'El correo electrónico "%" no es válido. Debe tener el formato correo@dominio.prefijo',
            NEW.Correo;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Se crea el Trigger
CREATE TRIGGER trg_validar_espectador
    BEFORE INSERT OR UPDATE ON Espectador
    FOR EACH ROW
    EXECUTE FUNCTION fn_validar_espectador();

-- Pruebas:
-- Caso exitoso (Se registra un espectador válido.)
BEGIN;
INSERT INTO Espectador (Nombre, Documento, Fecha_Nacimiento, Telefono, Correo)
VALUES ('Javier García', '1234567890', '2006-11-22', '1234567890', 'javier.garcia@gmail.com');
ROLLBACK;

-- Caso fallido (Se registra un espectador con fecha de nacimiento inválida.)
BEGIN;
INSERT INTO Espectador (Nombre, Documento, Fecha_Nacimiento, Telefono, Correo)
VALUES ('Juan Orjuela', '1357924680', '2030-01-01', '3157924068', 'juan.orjuela@gmail.com');
ROLLBACK;

-- Caso fallido (El correo del espectador no es válido, no contiene @.)
BEGIN;
INSERT INTO Espectador (Nombre, Documento, Fecha_Nacimiento, Telefono, Correo)
VALUES ('Alejandro Ferrer', '137954826', '1990-05-06', '3105554433', 'alejandro-ferrer.com');
ROLLBACK;

-- Caso fallido (El correo del espectador no es válido, ya que está incompleto.)
BEGIN;
INSERT INTO Espectador (Nombre, Documento, Fecha_Nacimiento, Telefono, Correo)
VALUES ('Isabella Rodríguez', '1016789450', '2010-12-24', '3151112233', 'isabella.rodriguez@dominio');
ROLLBACK;
