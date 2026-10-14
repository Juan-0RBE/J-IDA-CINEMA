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

-- TRIGGER #2: Control de aforo total en salas
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
