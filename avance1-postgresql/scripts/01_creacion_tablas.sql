/* ============================================================================
   BASES DE DATOS 2
   Creacion de tablas

   CONTENIDO
     0. Limpieza (En caso necesario)
     1. Creación de tablas
     2. Llaves primarias (PK)
     3. Llaves foráneas (FK)
     4. Restricciones de unicidad (UNIQUE)
     5. Restricciones de dominio y validación (CHECK)
     6. Índices

   NOTAS GENERALES
     - Las columnas ID usan GENERATED ALWAYS AS IDENTITY: en los INSERT de
       02_datos_prueba.sql NO se debe incluir el ID (lo genera la BD).
     - Los precios congelados (Venta.Precio_Unitario, Ven_Pro.Precio_unitario)
       guardan el valor vigente al momento de la venta; no cambian después.
     - Los valores permitidos en los CHECK de dominio (sección 5) deben
       coincidir con los usados en 02_datos_prueba.sql.
   ============================================================================ */


/* ============================================================================
   0. LIMPIEZA OPCIONAL
   Descomentar solo si se necesita borrar y recrear todo el esquema.
   ============================================================================ */
/*
DROP TABLE IF EXISTS Ven_Pro, Venta, Contrato, Act_Dir_Pel, Pelicula_Genero,
                     Sed_Col, Producto_Confiteria, Funcion, Staff, Sala,
                     Tipo_Boleta, Espectador, Colaborador, ACTOR_DIRECTOR,
                     Pelicula, Rol_Staff, Sede CASCADE;
*/


/* ============================================================================
   1. CREACIÓN DE TABLAS
   Orden: catálogos y entidades independientes primero, luego las que dependen
   de ellas, y al final las tablas intermedias de relaciones M:N.
   ============================================================================ */

-- ---------------------------------------------------------------------------
-- 1.1 Entidades independientes (no dependen de otras tablas)
-- ---------------------------------------------------------------------------

-- Sede: cada sucursal física del cine.
CREATE TABLE Sede
(
    Id_Sede   INTEGER GENERATED ALWAYS AS IDENTITY NOT NULL,
    Nombre    VARCHAR(100) NOT NULL,   -- Nombre comercial de la sede
    Direccion VARCHAR(150) NOT NULL,
    Telefono  VARCHAR(20)
);

-- Pelicula: cartelera del cine.
CREATE TABLE Pelicula
(
    Id_Pelicula      INTEGER GENERATED ALWAYS AS IDENTITY NOT NULL,
    Nombre           VARCHAR(150) NOT NULL,
    Fecha_Estreno    DATE NOT NULL,
    Fecha_Retiro     DATE,                  -- NULL = aún en cartelera
    Duracion_Minutos INTEGER NOT NULL,
    Clasificacion    VARCHAR(10) NOT NULL   -- Clasificación por edad
);

-- ACTOR_DIRECTOR: personas que participan en películas y dan charlas (contratos).
CREATE TABLE ACTOR_DIRECTOR
(
    Id_Actor_Director INTEGER GENERATED ALWAYS AS IDENTITY NOT NULL,
    Nombre            VARCHAR(100) NOT NULL,
    Nacionalidad      VARCHAR(50),
    Fecha_Nacimiento  DATE,
    Idioma            VARCHAR(50)
);

-- Espectador: clientes registrados. No hay ventas sin espectador registrado.
CREATE TABLE Espectador
(
    Id_Espectador    INTEGER GENERATED ALWAYS AS IDENTITY NOT NULL,
    Nombre           VARCHAR(100) NOT NULL,
    Documento        VARCHAR(20) NOT NULL,  -- Único por espectador (ver sección 4)
    Fecha_Nacimiento DATE,                  -- Usada para validar la clasificación por edad
    Telefono         VARCHAR(20),
    Correo           VARCHAR(100) NOT NULL  
);

-- Colaborador: marcas aliadas que venden productos de confitería dentro del cine.
CREATE TABLE Colaborador
(
    Id_Colaborador INTEGER GENERATED ALWAYS AS IDENTITY NOT NULL,
    Nombre_negocio VARCHAR(100) NOT NULL,
    Nit            VARCHAR(20) NOT NULL,    -- Único por colaborador (ver sección 4)
    Correo         VARCHAR(100),
    Telefono       VARCHAR(20),
    Estado         VARCHAR(20) NOT NULL     -- Activo / Inactivo (colaboración por temporadas)
);

-- Tipo_Boleta: solo existen dos tipos (general y de evento).
CREATE TABLE Tipo_Boleta
(
    Id_Tipo_Boleta INTEGER GENERATED ALWAYS AS IDENTITY NOT NULL,
    Nombre         VARCHAR(50) NOT NULL,
    Aplica_para    VARCHAR(50) NOT NULL,    -- Público al que aplica (texto descriptivo, ej. 'Menores de 12 años')
    Precio         NUMERIC(10,2) NOT NULL
);

-- Rol_Staff: catálogo de cargos con su salario base.
CREATE TABLE Rol_Staff
(
    Nombre  VARCHAR(50) NOT NULL,           -- El nombre del rol es la llave primaria
    Salario NUMERIC(10,2) NOT NULL
);

-- ---------------------------------------------------------------------------
-- 1.2 Entidades que dependen de las anteriores
-- ---------------------------------------------------------------------------

-- Sala: pertenece a una sede. Incluye la sala especial para eventos
-- (aforo reducido, área más grande, reservada con anticipación).
CREATE TABLE Sala
(
    Id_Sala      INTEGER GENERATED ALWAYS AS IDENTITY NOT NULL,
    Numero       INTEGER NOT NULL,          -- Número de sala dentro de la sede
    Capacidad    INTEGER NOT NULL,          -- Aforo máximo (boletas por función)
    Tipo_Sala    VARCHAR(30) NOT NULL,      -- General / Eventos
    Sede_Id_Sede INTEGER NOT NULL
);

-- Staff: empleados del cine, asignados a una sede y con un rol.
CREATE TABLE Staff
(
    Id_Staff         INTEGER GENERATED ALWAYS AS IDENTITY NOT NULL,
    Documento        VARCHAR(20) NOT NULL,  -- Único por empleado (ver sección 4)
    Nombre           VARCHAR(100) NOT NULL,
    Rol_Staff_Nombre VARCHAR(50) NOT NULL,
    Sede_Id_Sede     INTEGER NOT NULL
);

-- Funcion: proyección de una película en una sala a una hora determinada.
-- El tipo de función se deduce del tipo de su sala.
CREATE TABLE Funcion
(
    Id_Funcion           INTEGER GENERATED ALWAYS AS IDENTITY NOT NULL,
    Fecha_Hora_Inicio    TIMESTAMP NOT NULL,
    Idioma               VARCHAR(50) NOT NULL,
    Pelicula_Id_Pelicula INTEGER NOT NULL,
    Sala_Id_Sala         INTEGER NOT NULL
);

-- Producto_Confiteria: productos vendidos por los colaboradores.
CREATE TABLE Producto_Confiteria
(
    Id_Producto                INTEGER GENERATED ALWAYS AS IDENTITY NOT NULL,
    Precio                     NUMERIC(10,2) NOT NULL,
    Nombre                     VARCHAR(100) NOT NULL,
    Stock                      INTEGER NOT NULL,
    Categoria                  VARCHAR(50) NOT NULL,
    Colaborador_Id_Colaborador INTEGER NOT NULL
);

-- Contrato: un actor/director es contratado para dar una charla antes o
-- después de una función. Todo contrato requiere una función.
CREATE TABLE Contrato
(
    Id_Contrato          INTEGER GENERATED ALWAYS AS IDENTITY NOT NULL,
    Estado               VARCHAR(20) NOT NULL,
    Fecha_inicio         DATE NOT NULL,
    Fecha_fin            DATE NOT NULL,
    Act_Dir_Id_Actor_Dir INTEGER NOT NULL,
    Funcion_Id_Funcion   INTEGER NOT NULL
);

-- Venta: compra de boletas de una función por un espectador, atendida por un
-- empleado. Total = Cantidad * Precio_Unitario (atributo derivado, no se guarda).
CREATE TABLE Venta
(
    Id_Venta                   INTEGER GENERATED ALWAYS AS IDENTITY NOT NULL,
    Fecha                      DATE NOT NULL,
    Precio_Unitario            NUMERIC(10,2) NOT NULL,  -- Precio congelado al momento de la venta
    Metodo_pago                VARCHAR(30) NOT NULL,
    Cantidad                   INTEGER NOT NULL,        -- Número de boletas compradas
    Staff_Id_Staff             INTEGER NOT NULL,
    Espectador_Id_Espectador   INTEGER NOT NULL,
    Tipo_Boleta_Id_Tipo_Boleta INTEGER NOT NULL,
    Funcion_Id_Funcion         INTEGER NOT NULL
);

-- ---------------------------------------------------------------------------
-- 1.3 Tablas intermedias (relaciones M:N)
-- ---------------------------------------------------------------------------

-- Act_Dir_Pel (Participar): actores/directores que participan en películas.
CREATE TABLE Act_Dir_Pel
(
    Act_Dir_Id_Actor_Director INTEGER NOT NULL,
    Pelicula_Id_Pelicula      INTEGER NOT NULL,
    Rol                       VARCHAR(50)       -- Actor, director, etc.
);

-- Pelicula_Genero: atributo multivaluado "género" de Pelicula.
CREATE TABLE Pelicula_Genero
(
    Genero               VARCHAR(50) NOT NULL,
    Pelicula_Id_Pelicula INTEGER NOT NULL
);

-- Sed_Col (Relacionar): sedes en las que opera cada colaborador.
CREATE TABLE Sed_Col
(
    Sede_Id_Sede               INTEGER NOT NULL,
    Colaborador_Id_Colaborador INTEGER NOT NULL
);

-- Ven_Pro (Pertenecer): productos de confitería incluidos en una venta.
CREATE TABLE Ven_Pro
(
    Venta_Id_Venta    INTEGER NOT NULL,
    Prod_Conf_Id_Prod INTEGER NOT NULL,
    Cantidad          INTEGER NOT NULL,
    Precio_unitario   NUMERIC(10,2) NOT NULL    -- Precio congelado al momento de la venta
);


/* ============================================================================
   2. LLAVES PRIMARIAS
   ============================================================================ */

ALTER TABLE Sede                ADD CONSTRAINT Sede_PK                PRIMARY KEY ( Id_Sede );
ALTER TABLE Pelicula            ADD CONSTRAINT Pelicula_PK            PRIMARY KEY ( Id_Pelicula );
ALTER TABLE ACTOR_DIRECTOR      ADD CONSTRAINT ACTOR_DIRECTOR_PK      PRIMARY KEY ( Id_Actor_Director );
ALTER TABLE Espectador          ADD CONSTRAINT Espectador_PK          PRIMARY KEY ( Id_Espectador );
ALTER TABLE Colaborador         ADD CONSTRAINT Colaborador_PK         PRIMARY KEY ( Id_Colaborador );
ALTER TABLE Tipo_Boleta         ADD CONSTRAINT Tipo_Boleta_PK         PRIMARY KEY ( Id_Tipo_Boleta );
ALTER TABLE Rol_Staff           ADD CONSTRAINT Rol_Staff_PK           PRIMARY KEY ( Nombre );
ALTER TABLE Sala                ADD CONSTRAINT Sala_PK                PRIMARY KEY ( Id_Sala );
ALTER TABLE Staff               ADD CONSTRAINT Staff_PK               PRIMARY KEY ( Id_Staff );
ALTER TABLE Funcion             ADD CONSTRAINT Funcion_PK             PRIMARY KEY ( Id_Funcion );
ALTER TABLE Producto_Confiteria ADD CONSTRAINT Producto_Confiteria_PK PRIMARY KEY ( Id_Producto );
ALTER TABLE Contrato            ADD CONSTRAINT Contrato_PK            PRIMARY KEY ( Id_Contrato );
ALTER TABLE Venta               ADD CONSTRAINT Venta_PK               PRIMARY KEY ( Id_Venta );

-- PK compuestas de las tablas intermedias
ALTER TABLE Act_Dir_Pel         ADD CONSTRAINT Participar_PK          PRIMARY KEY ( Act_Dir_Id_Actor_Director, Pelicula_Id_Pelicula );
ALTER TABLE Pelicula_Genero     ADD CONSTRAINT Pelicula_Genero_PK     PRIMARY KEY ( Genero, Pelicula_Id_Pelicula );
ALTER TABLE Sed_Col             ADD CONSTRAINT Relacionar_PK          PRIMARY KEY ( Sede_Id_Sede, Colaborador_Id_Colaborador );
ALTER TABLE Ven_Pro             ADD CONSTRAINT Pertenecer_PK          PRIMARY KEY ( Venta_Id_Venta, Prod_Conf_Id_Prod );


/* ============================================================================
   3. LLAVES FORÁNEAS
   ============================================================================ */

-- Sala -> Sede
ALTER TABLE Sala
    ADD CONSTRAINT Sala_Sede_FK FOREIGN KEY ( Sede_Id_Sede )
    REFERENCES Sede ( Id_Sede );

-- Staff -> Rol_Staff, Sede
ALTER TABLE Staff
    ADD CONSTRAINT Staff_Rol_Staff_FK FOREIGN KEY ( Rol_Staff_Nombre )
    REFERENCES Rol_Staff ( Nombre );

ALTER TABLE Staff
    ADD CONSTRAINT Staff_Sede_FK FOREIGN KEY ( Sede_Id_Sede )
    REFERENCES Sede ( Id_Sede );

-- Funcion -> Pelicula, Sala
ALTER TABLE Funcion
    ADD CONSTRAINT Funcion_Pelicula_FK FOREIGN KEY ( Pelicula_Id_Pelicula )
    REFERENCES Pelicula ( Id_Pelicula );

ALTER TABLE Funcion
    ADD CONSTRAINT Funcion_Sala_FK FOREIGN KEY ( Sala_Id_Sala )
    REFERENCES Sala ( Id_Sala );

-- Producto_Confiteria -> Colaborador
ALTER TABLE Producto_Confiteria
    ADD CONSTRAINT Prod_Conf_Colaborador_FK FOREIGN KEY ( Colaborador_Id_Colaborador )
    REFERENCES Colaborador ( Id_Colaborador );

-- Contrato -> ACTOR_DIRECTOR, Funcion
ALTER TABLE Contrato
    ADD CONSTRAINT Contrato_ACTOR_DIRECTOR_FK FOREIGN KEY ( Act_Dir_Id_Actor_Dir )
    REFERENCES ACTOR_DIRECTOR ( Id_Actor_Director );

ALTER TABLE Contrato
    ADD CONSTRAINT Contrato_Funcion_FK FOREIGN KEY ( Funcion_Id_Funcion )
    REFERENCES Funcion ( Id_Funcion );

-- Venta -> Staff, Espectador, Tipo_Boleta, Funcion
ALTER TABLE Venta
    ADD CONSTRAINT Venta_Staff_FK FOREIGN KEY ( Staff_Id_Staff )
    REFERENCES Staff ( Id_Staff );

ALTER TABLE Venta
    ADD CONSTRAINT Venta_Espectador_FK FOREIGN KEY ( Espectador_Id_Espectador )
    REFERENCES Espectador ( Id_Espectador );

ALTER TABLE Venta
    ADD CONSTRAINT Venta_Tipo_Boleta_FK FOREIGN KEY ( Tipo_Boleta_Id_Tipo_Boleta )
    REFERENCES Tipo_Boleta ( Id_Tipo_Boleta );

ALTER TABLE Venta
    ADD CONSTRAINT Venta_Funcion_FK FOREIGN KEY ( Funcion_Id_Funcion )
    REFERENCES Funcion ( Id_Funcion );

-- Act_Dir_Pel -> ACTOR_DIRECTOR, Pelicula
ALTER TABLE Act_Dir_Pel
    ADD CONSTRAINT Participar_ACTOR_DIRECTOR_FK FOREIGN KEY ( Act_Dir_Id_Actor_Director )
    REFERENCES ACTOR_DIRECTOR ( Id_Actor_Director );

ALTER TABLE Act_Dir_Pel
    ADD CONSTRAINT Participar_Pelicula_FK FOREIGN KEY ( Pelicula_Id_Pelicula )
    REFERENCES Pelicula ( Id_Pelicula );

-- Pelicula_Genero -> Pelicula
ALTER TABLE Pelicula_Genero
    ADD CONSTRAINT Pelicula_Genero_Pelicula_FK FOREIGN KEY ( Pelicula_Id_Pelicula )
    REFERENCES Pelicula ( Id_Pelicula );

-- Sed_Col -> Sede, Colaborador
ALTER TABLE Sed_Col
    ADD CONSTRAINT Relacionar_Sede_FK FOREIGN KEY ( Sede_Id_Sede )
    REFERENCES Sede ( Id_Sede );

ALTER TABLE Sed_Col
    ADD CONSTRAINT Relacionar_Colaborador_FK FOREIGN KEY ( Colaborador_Id_Colaborador )
    REFERENCES Colaborador ( Id_Colaborador );

-- Ven_Pro -> Venta, Producto_Confiteria
ALTER TABLE Ven_Pro
    ADD CONSTRAINT Pertenecer_Venta_FK FOREIGN KEY ( Venta_Id_Venta )
    REFERENCES Venta ( Id_Venta );

ALTER TABLE Ven_Pro
    ADD CONSTRAINT Pertenecer_Prod_Conf_FK FOREIGN KEY ( Prod_Conf_Id_Prod )
    REFERENCES Producto_Confiteria ( Id_Producto );


/* ============================================================================
   4. RESTRICCIONES DE UNICIDAD (UNIQUE)
   Evitan duplicados de datos que identifican de forma natural a una entidad.
   ============================================================================ */

-- No pueden existir dos espectadores con el mismo documento
ALTER TABLE Espectador  ADD CONSTRAINT Espectador_Cedula_UQ   UNIQUE ( Documento );

-- No pueden existir dos empleados con el mismo documento
ALTER TABLE Staff       ADD CONSTRAINT Staff_Documento_UQ     UNIQUE ( Documento );

-- No pueden existir dos colaboradores con el mismo NIT
ALTER TABLE Colaborador ADD CONSTRAINT Colaborador_Nit_UQ     UNIQUE ( Nit );

-- Los nombres de sede y de tipo de boleta no se repiten
ALTER TABLE Sede        ADD CONSTRAINT Sede_Nombre_UQ         UNIQUE ( Nombre );
ALTER TABLE Tipo_Boleta ADD CONSTRAINT Tipo_Boleta_Nombre_UQ  UNIQUE ( Nombre );

-- Dentro de una sede no se repite el número de sala
ALTER TABLE Sala        ADD CONSTRAINT Sala_Sede_Numero_UQ    UNIQUE ( Sede_Id_Sede, Numero );

-- Una sala no puede tener dos funciones que inicien a la misma hora
ALTER TABLE Funcion     ADD CONSTRAINT Funcion_Sala_Inicio_UQ UNIQUE ( Sala_Id_Sala, Fecha_Hora_Inicio );


/* ============================================================================
   5. RESTRICCIONES DE DOMINIO Y VALIDACIÓN (CHECK)
   Reglas simples de integridad a nivel de fila. Las reglas que involucran
   varias tablas (aforo, cruces de horario, edad, etc.) van en los triggers.
   ============================================================================ */

-- Pelicula
ALTER TABLE Pelicula
    ADD CONSTRAINT Pelicula_Duracion_CK CHECK ( Duracion_Minutos > 0 );
ALTER TABLE Pelicula
    ADD CONSTRAINT Pelicula_Fechas_CK   CHECK ( Fecha_Retiro IS NULL OR Fecha_Retiro >= Fecha_Estreno );
ALTER TABLE Pelicula
    ADD CONSTRAINT Pelicula_Clasif_CK   CHECK ( Clasificacion IN ('TP', '7+', '12+', '15+', '18+') );

-- Sala
ALTER TABLE Sala
    ADD CONSTRAINT Sala_Capacidad_CK CHECK ( Capacidad > 0 );
ALTER TABLE Sala
    ADD CONSTRAINT Sala_Numero_CK    CHECK ( Numero > 0 );
ALTER TABLE Sala
    ADD CONSTRAINT Sala_Tipo_CK      CHECK ( Tipo_Sala IN ('General', 'Eventos') );

-- Tipo_Boleta
ALTER TABLE Tipo_Boleta
    ADD CONSTRAINT Tipo_Boleta_Precio_CK CHECK ( Precio >= 0 );

-- Rol_Staff
ALTER TABLE Rol_Staff
    ADD CONSTRAINT Rol_Staff_Salario_CK CHECK ( Salario >= 0 );

-- Contrato
ALTER TABLE Contrato
    ADD CONSTRAINT Contrato_Fechas_CK CHECK ( Fecha_fin >= Fecha_inicio );
ALTER TABLE Contrato
    ADD CONSTRAINT Contrato_Estado_CK CHECK ( Estado IN ('Vigente', 'Finalizado', 'Cancelado') );

-- Colaborador
ALTER TABLE Colaborador
    ADD CONSTRAINT Colaborador_Estado_CK CHECK ( Estado IN ('Activo', 'Inactivo') );

-- Producto_Confiteria
ALTER TABLE Producto_Confiteria
    ADD CONSTRAINT Prod_Conf_Precio_CK CHECK ( Precio >= 0 );
ALTER TABLE Producto_Confiteria
    ADD CONSTRAINT Prod_Conf_Stock_CK  CHECK ( Stock >= 0 );

-- Venta
ALTER TABLE Venta
    ADD CONSTRAINT Venta_Cantidad_CK CHECK ( Cantidad > 0 );
ALTER TABLE Venta
    ADD CONSTRAINT Venta_Precio_CK   CHECK ( Precio_Unitario >= 0 );
ALTER TABLE Venta
    ADD CONSTRAINT Venta_Metodo_CK   CHECK ( Metodo_pago IN ('Efectivo', 'Tarjeta', 'Transferencia') );

-- Ven_Pro
ALTER TABLE Ven_Pro
    ADD CONSTRAINT Ven_Pro_Cantidad_CK CHECK ( Cantidad > 0 );
ALTER TABLE Ven_Pro
    ADD CONSTRAINT Ven_Pro_Precio_CK   CHECK ( Precio_unitario >= 0 );


/* ============================================================================
   6. ÍNDICES
   PostgreSQL crea índices automáticamente para PK y UNIQUE, pero NO para las
   columnas de FK. Se crean sobre las FK usadas en JOIN y filtros frecuentes.
   (Las FK que ya quedan cubiertas por una PK o UNIQUE compuesta cuya primera
   columna es esa FK no necesitan índice adicional: Sala.Sede (Sala_Sede_Numero_UQ),
   Funcion.Sala (Funcion_Sala_Inicio_UQ), Act_Dir_Pel.Actor, Sed_Col.Sede y
   Ven_Pro.Venta. Por eso solo se indexa el otro lado de las tablas intermedias.)
   ============================================================================ */

-- Venta: tabla con más consultas y joins
CREATE INDEX Idx_Venta_Funcion      ON Venta ( Funcion_Id_Funcion );
CREATE INDEX Idx_Venta_Espectador   ON Venta ( Espectador_Id_Espectador );
CREATE INDEX Idx_Venta_Staff        ON Venta ( Staff_Id_Staff );
CREATE INDEX Idx_Venta_Tipo_Boleta  ON Venta ( Tipo_Boleta_Id_Tipo_Boleta );
CREATE INDEX Idx_Venta_Fecha        ON Venta ( Fecha );                  -- Reportes por período

-- Funcion
CREATE INDEX Idx_Funcion_Pelicula   ON Funcion ( Pelicula_Id_Pelicula );
CREATE INDEX Idx_Funcion_Inicio     ON Funcion ( Fecha_Hora_Inicio );    -- Búsqueda por fecha/horario

-- Contrato
CREATE INDEX Idx_Contrato_Actor     ON Contrato ( Act_Dir_Id_Actor_Dir );
CREATE INDEX Idx_Contrato_Funcion   ON Contrato ( Funcion_Id_Funcion );

-- Staff
CREATE INDEX Idx_Staff_Sede         ON Staff ( Sede_Id_Sede );
CREATE INDEX Idx_Staff_Rol          ON Staff ( Rol_Staff_Nombre );

-- Producto_Confiteria
CREATE INDEX Idx_Prod_Conf_Colab    ON Producto_Confiteria ( Colaborador_Id_Colaborador );

-- Tablas intermedias: lado que no encabeza la PK compuesta
CREATE INDEX Idx_Act_Dir_Pel_Peli   ON Act_Dir_Pel ( Pelicula_Id_Pelicula );
CREATE INDEX Idx_Pel_Genero_Peli    ON Pelicula_Genero ( Pelicula_Id_Pelicula );
CREATE INDEX Idx_Sed_Col_Colab      ON Sed_Col ( Colaborador_Id_Colaborador );
CREATE INDEX Idx_Ven_Pro_Prod       ON Ven_Pro ( Prod_Conf_Id_Prod );

-- FIN DEL SCRIPT
