-- =====================================================================
-- J'IDA Cinema - AVANCE 1 - 02_datos_prueba.sql
-- Datos de prueba coherentes con 01_creacion_tablas.sql
--
-- IMPORTANTE: ejecutar sobre una base de datos recién creada (vacía).
-- Las PK son GENERATED ALWAYS AS IDENTITY, por lo que las llaves foráneas
-- de este script asumen que los IDs se generan en orden desde 1.
--
-- Identidad que reflejan los datos:
--   * 2 sedes (Bogotá, Sibaté)
--   * 7 salas: 6 generales (80 puestos) + 1 de eventos (45 puestos) = 525
--   * 36 actores/directores registrados (10 directores + 26 actores)
--   * Fecha de referencia: 2026-10-08 (hay funciones pasadas y futuras)
-- Cantidades: 36 actores/directores, 35 espectadores, 36 funciones,
--             41 ventas (mínimo exigido: 30 en cada uno).
--
-- Valores de dominio usados (coinciden con los CHECK de 01_creacion_tablas.sql):
--   Tipo_Sala: 'General' / 'Eventos'     Clasificacion: TP, 7+, 12+, 15+, 18+
--   Metodo_pago: Efectivo, Tarjeta, Transferencia
--   Estado Contrato: Vigente, Finalizado, Cancelado
--   Estado Colaborador: Activo, Inactivo
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. SEDE (2)
-- ---------------------------------------------------------------------
INSERT INTO Sede (Nombre, Direccion, Telefono) VALUES
('J''IDA Cinema Bogotá',  'Calle 80 # 69-30, Bogotá',      '6015550101'),
('J''IDA Cinema Sibaté',  'Carrera 8 # 10-25, Sibaté',     '6015550102');

-- ---------------------------------------------------------------------
-- 2. SALA (7): ids 1-4 Bogotá generales, 5 Bogotá eventos, 6-7 Sibaté generales
-- ---------------------------------------------------------------------
INSERT INTO Sala (Numero, Capacidad, Tipo_Sala, Sede_Id_Sede) VALUES
(1, 80, 'General', 1),
(2, 80, 'General', 1),
(3, 80, 'General', 1),
(4, 80, 'General', 1),
(5, 45, 'Eventos', 1),
(1, 80, 'General', 2),
(2, 80, 'General', 2);

-- ---------------------------------------------------------------------
-- 3. ROL_STAFF (5)
-- ---------------------------------------------------------------------
INSERT INTO Rol_Staff (Nombre, Salario) VALUES
('Taquillero',             1800000.00),   -- 1
('Confitero',              1700000.00),   -- 2
('Proyeccionista',         2300000.00),   -- 3
('Acomodador',             1600000.00),   -- 4
('Coordinador de eventos', 3200000.00);   -- 5

-- ---------------------------------------------------------------------
-- 4. STAFF (12): ids 1,2 taquilleros Bogotá; 3,11 taquilleros Sibaté
-- ---------------------------------------------------------------------
INSERT INTO Staff (Documento, Nombre, Id_Rol_Staff, Sede_Id_Sede) VALUES
('1012345601', 'Carlos Andrés Ruiz',      1, 1),   -- Taquillero
('1012345602', 'Diana Marcela Peña',      1, 1),   -- Taquillero
('1012345603', 'Jhon Alexander Ortiz',    1, 2),   -- Taquillero
('1012345604', 'Luisa Fernanda Castro',   2, 1),   -- Confitero
('1012345605', 'Pedro Pablo Vargas',      2, 2),   -- Confitero
('1012345606', 'Wilson Hernández',        3, 1),   -- Proyeccionista
('1012345607', 'Miguel Ángel Suárez',     3, 2),   -- Proyeccionista
('1012345608', 'Karen Johana Molina',     4, 1),   -- Acomodador
('1012345609', 'Brayan Steven Torres',    4, 2),   -- Acomodador
('1012345610', 'Adriana Lucía Camacho',   5, 1),   -- Coordinador de eventos
('1012345611', 'Yesica Paola Ramírez',    1, 2),   -- Taquillero
('1012345612', 'Héctor Fabio Mora',       4, 1);   -- Acomodador

-- ---------------------------------------------------------------------
-- 5. TIPO_BOLETA (5)
-- ---------------------------------------------------------------------
INSERT INTO Tipo_Boleta (Nombre, Aplica_para, Precio) VALUES
('General',       'Público general',          18000.00),
('Niño',          'Menores de 12 años',       12000.00),
('Estudiante',    'Estudiantes con carné',    14000.00),
('Adulto mayor',  'Mayores de 60 años',       12000.00),
('Día del cine',  'Todos los miércoles',       9000.00);

-- ---------------------------------------------------------------------
-- 6. ACTOR_DIRECTOR (36): Fechas de nacimiento completadas
-- ---------------------------------------------------------------------
INSERT INTO ACTOR_DIRECTOR (Nombre, Nacionalidad, Fecha_Nacimiento, Idioma) VALUES
-- Directores
('Christopher Nolan',          'Británica',          '1970-07-30', 'Inglés'),   -- 1
('Destin Daniel Cretton',      'Estadounidense',     '1978-11-23', 'Inglés'),   -- 2
('Zach Cregger',               'Estadounidense',     '1981-03-01', 'Inglés'),   -- 3
('Alejandro G. Iñárritu',      'Mexicana',           '1963-08-15', 'Español'),  -- 4
('Michael Showalter',          'Estadounidense',     '1970-06-17', 'Inglés'),   -- 5
('Kitao Sakurai',              'Japonesa',           '1983-01-15', 'Inglés'),   -- 6
('James Watkins',              'Británica',          '1973-05-20', 'Inglés'),   -- 7
('Travis Knight',              'Estadounidense',     '1973-08-13', 'Inglés'),   -- 8
('Will Becher',                'Británica',          '1980-09-10', 'Inglés'),   -- 9
('Georgia Oakley',             'Británica',          '1988-11-04', 'Inglés'),   -- 10
-- Actores
('Matt Damon',                  'Estadounidense',     '1970-10-08', 'Inglés'),   -- 11
('Anne Hathaway',              'Estadounidense',     '1982-11-12', 'Inglés'),   -- 12
('Tom Holland',                'Británica',          '1996-06-01', 'Inglés'),   -- 13
('Zendaya',                    'Estadounidense',     '1996-09-01', 'Inglés'),   -- 14
('Robert Pattinson',           'Británica',          '1986-05-13', 'Inglés'),   -- 15
('Charlize Theron',            'Sudafricana',        '1975-08-07', 'Inglés'),   -- 16
('Lupita Nyong''o',            'Keniana-mexicana',   '1983-03-01', 'Inglés'),   -- 17
('Sadie Sink',                 'Estadounidense',     '2002-04-16', 'Inglés'),   -- 18
('Jon Bernthal',               'Estadounidense',     '1976-09-20', 'Inglés'),   -- 19
('Austin Abrams',              'Estadounidense',     '1996-09-02', 'Inglés'),   -- 20
('Paul Walter Hauser',         'Estadounidense',     '1986-10-15', 'Inglés'),   -- 21
('Tom Cruise',                 'Estadounidense',     '1962-07-03', 'Inglés'),   -- 22
('Sandra Hüller',              'Alemana',            '1978-04-30', 'Alemán'),   -- 23
('Jesse Plemons',              'Estadounidense',     '1988-04-02', 'Inglés'),   -- 24
('Riz Ahmed',                  'Británica',          '1982-12-01', 'Inglés'),   -- 25
('Dakota Johnson',             'Estadounidense',     '1989-10-04', 'Inglés'),   -- 26
('Josh Hartnett',              'Estadounidense',     '1978-07-21', 'Inglés'),   -- 27
('Justin Fletcher',            'Británica',          '1970-06-15', 'Inglés'),   -- 28
('Jason Momoa',                'Estadounidense',     '1979-08-01', 'Inglés'),   -- 29
('Noah Centineo',              'Estadounidense',     '1996-05-09', 'Inglés'),   -- 30
('Tom Rhys Harries',           'Británica',          '1990-10-08', 'Inglés'),   -- 31
('Eddie Marsan',               'Británica',          '1968-06-05', 'Inglés'),   -- 32
('Mckenna Grace',              'Estadounidense',     '2006-06-25', 'Inglés'),   -- 33
('Jacob Tremblay',             'Canadiense',         '2006-10-05', 'Inglés'),   -- 34
('Daisy Edgar-Jones',          'Británica',          '1998-05-24', 'Inglés'),   -- 35
('Daisy Ridley',               'Británica',          '1992-04-10', 'Inglés');   -- 36

-- ---------------------------------------------------------------------
-- 7. PELICULA (10)
-- ---------------------------------------------------------------------
INSERT INTO Pelicula (Nombre, Fecha_Estreno, Fecha_Retiro, Duracion_Minutos, Clasificacion) VALUES
('La Odisea',                                   '2026-07-16', '2026-10-05', 170, '12+'),   -- 1
('Spider-Man: Un Nuevo Día',                    '2026-07-30', NULL,         135, '12+'),   -- 2
('Resident Evil',                               '2026-09-17', NULL,         105, '18+'),   -- 3
('Digger',                                      '2026-10-01', NULL,         135, '15+'),   -- 4
('Verity: La Sombra de un Engaño',              '2026-10-01', NULL,         110, '15+'),   -- 5
('Shaun el Cordero: El Monstruo de Mossy Bottom','2026-10-01', NULL,          85, 'TP'),    -- 6
('Street Fighter',                              '2026-10-15', NULL,         125, '15+'),   -- 7
('Clayface',                                    '2026-10-22', NULL,         105, '15+'),   -- 8
('El Bosque Olvidado: Wildwood',                '2026-10-29', NULL,         100, '7+'),    -- 9
('Sensatez y Sentimiento',                      '2026-10-29', NULL,         120, '12+');   -- 10

-- ---------------------------------------------------------------------
-- 8. PELICULA_GENERO (19)
-- ---------------------------------------------------------------------
INSERT INTO Pelicula_Genero (Genero, Pelicula_Id_Pelicula) VALUES
('Aventura', 1),  ('Drama', 1),
('Acción', 2),    ('Ciencia ficción', 2),
('Terror', 3),    ('Acción', 3),
('Drama', 4),
('Suspenso', 5),  ('Romance', 5),
('Animación', 6), ('Familiar', 6), ('Comedia', 6),
('Acción', 7),
('Terror', 8),    ('Acción', 8),
('Animación', 9), ('Fantasía', 9),
('Drama', 10),    ('Romance', 10);

-- ---------------------------------------------------------------------
-- 9. ACT_DIR_PEL (40 participaciones)
-- ---------------------------------------------------------------------
INSERT INTO Act_Dir_Pel (Act_Dir_Id_Actor_Director, Pelicula_Id_Pelicula, Rol) VALUES
-- Directores
(1, 1,  'Director'), (2, 2,  'Director'), (3, 3,  'Director'), (4, 4,  'Director'),
(5, 5,  'Director'), (9, 6,  'Director'), (6, 7,  'Director'), (7, 8,  'Director'),
(8, 9,  'Director'), (10, 10,'Director'),
-- Actores
(11, 1, 'Protagonista'), (12, 1, 'Reparto'), (13, 1, 'Reparto'), (14, 1, 'Reparto'),
(15, 1, 'Reparto'),      (16, 1, 'Reparto'), (17, 1, 'Reparto'), (19, 1, 'Reparto'),
(13, 2, 'Protagonista'), (14, 2, 'Reparto'), (18, 2, 'Reparto'), (19, 2, 'Reparto'),
(20, 3, 'Protagonista'), (21, 3, 'Reparto'),
(22, 4, 'Protagonista'), (23, 4, 'Reparto'), (24, 4, 'Reparto'), (25, 4, 'Reparto'),
(12, 5, 'Protagonista'), (26, 5, 'Protagonista'), (27, 5, 'Reparto'),
(28, 6, 'Voz principal'),
(29, 7, 'Reparto'), (30, 7, 'Reparto'),
(31, 8, 'Protagonista'), (32, 8, 'Reparto'),
(33, 9, 'Voz principal'), (34, 9, 'Voz principal'),
(35, 10, 'Protagonista'), (36, 10, 'Protagonista');

-- ---------------------------------------------------------------------
-- 10. FUNCION (36)
-- ---------------------------------------------------------------------
INSERT INTO Funcion (Fecha_Hora_Inicio, Idioma, Pelicula_Id_Pelicula, Sala_Id_Sala) VALUES
-- Pasadas
('2026-09-26 15:00', 'Español',             1, 1),   -- 1
('2026-09-27 17:30', 'Español',             3, 2),   -- 2
('2026-09-27 20:00', 'Español',             2, 3),   -- 3
('2026-09-28 14:00', 'Español',             1, 4),   -- 4
('2026-09-30 19:00', 'Español',             1, 6),   -- 5
('2026-10-01 20:30', 'Inglés subtitulado',   2, 7),   -- 6
('2026-10-02 16:00', 'Español',             1, 6),   -- 7
('2026-10-02 18:30', 'Español',             3, 1),   -- 8
('2026-10-03 21:00', 'Español',             3, 2),   -- 9
('2026-10-03 11:00', 'Español',             6, 3),   -- 10
('2026-10-03 14:00', 'Español',             6, 7),   -- 11
('2026-10-04 21:30', 'Español',             3, 4),   -- 12
('2026-10-04 16:00', 'Español',             1, 1),   -- 13
('2026-10-05 20:00', 'Español',             2, 6),   -- 14
('2026-10-06 18:00', 'Español',             3, 7),   -- 15
('2026-10-06 21:00', 'Español',             3, 3),   -- 16
('2026-10-07 15:00', 'Español',             6, 2),   -- 17
('2026-10-07 19:30', 'Español',             4, 4),   -- 18
-- Futuras
('2026-10-09 17:00', 'Español',             5, 1),   -- 19
('2026-10-09 20:00', 'Español',             4, 2),   -- 20
('2026-10-09 20:30', 'Español',             2, 3),   -- 21
('2026-10-10 11:00', 'Español',             6, 4),   -- 22
('2026-10-10 22:00', 'Español',             3, 6),   -- 23
('2026-10-10 19:00', 'Español',             5, 7),   -- 24
('2026-10-11 16:00', 'Inglés subtitulado',   4, 1),   -- 25
('2026-10-11 18:00', 'Español',             3, 6),   -- 26
('2026-10-12 14:00', 'Español',             6, 2),   -- 27
('2026-10-14 19:00', 'Español',             4, 3),   -- 28
('2026-10-15 20:00', 'Español',             7, 1),   -- 29
('2026-10-16 15:00', 'Español',             6, 2),   -- 30
('2026-10-16 21:00', 'Español',             7, 6),   -- 31
('2026-10-17 11:30', 'Español',             6, 4),   -- 32
('2026-10-17 19:30', 'Español',             4, 7),   -- 33
('2026-10-23 18:00', 'Español',             8, 3),   -- 34
('2026-10-30 21:00', 'Español',            10, 1),   -- 35
('2026-10-30 22:00', 'Español',             9, 6);   -- 36

-- ---------------------------------------------------------------------
-- 11. ESPECTADOR (35)
-- ---------------------------------------------------------------------
INSERT INTO espectador
    (nombre, Documento, fecha_nacimiento, telefono, correo)
VALUES
('Laura Camila Rodríguez', '1023456781', '1995-03-12', '3001000001', 'laura.rodriguez@correo.com'),
('Carlos Eduardo Martínez', '1023456782', '1988-07-25', '3001000002', 'carlos.martinez@correo.com'),
('Ana María López', '1023456783', '2004-11-02', '3001000003', 'ana.lopez@correo.com'),
('Jorge Enrique Díaz', '1023456784', '1979-01-30', '3001000004', 'jorge.diaz@correo.com'),
('Paola Andrea Moreno', '1023456785', '1992-09-18', '3001000005', 'paola.moreno@correo.com'),
('Sergio Alejandro Vega', '1023456786', '2005-05-21', '3001000006', 'sergio.vega@correo.com'),
('Rosa Elena Cortés', '1023456787', '1958-04-09', '3001000007', 'rosa.cortes@correo.com'),
('Mauricio Giraldo', '1023456788', '1985-12-14', '3001000008', 'mauricio.giraldo@correo.com'),
('Diana Carolina Sánchez', '1023456789', '1990-06-03', '3001000009', 'diana.sanchez@correo.com'),
('Empresa Eventos SAS', '1023456790', '1983-02-17', '3001000010', 'julian.rios@empresaeventos.com'),
('Valeria Gutiérrez', '1023456791', '2006-08-28', '3001000011', 'valeria.gutierrez@correo.com'),
('Fabián Ortega', '1023456792', '1991-10-05', '3001000012', 'fabian.ortega@correo.com'),
('Natalia Bermúdez', '1023456793', '1996-01-22', '3001000013', 'natalia.bermudez@correo.com'),
('Andrés Mauricio Prada', '1023456794', '1987-03-15', '3001000014', 'andres.prada@correo.com'),
('Claudia Patricia Niño', '1023456795', '1982-11-27', '3001000015', 'claudia.nino@correo.com'),
('Iván Darío Cubillos', '1023456796', '1993-07-08', '3001000016', 'ivan.cubillos@correo.com'),
('Camila Alejandra Rueda', '1023456797', '2004-02-19', '3001000017', 'camila.rueda@correo.com'),
('Héctor Julio Barrera', '1023456798', '1975-09-01', '3001000018', 'hector.barrera@correo.com'),
('Gloria Inés Salazar', '1023456799', '1960-05-30', '3001000019', 'gloria.salazar@correo.com'),
('Esteban Ramírez', '1023456800', '1994-12-11', '3001000020', 'esteban.ramirez@correo.com'),
('Marcela Forero', '1023456801', '1989-04-26', '3001000021', 'marcela.forero@correo.com'),
('Wilmer Alexis Pinzón', '1023456802', '1986-08-13', '3001000022', 'wilmer.pinzon@correo.com'),
('Tatiana Lozano', '1023456803', '1998-06-17', '3001000023', 'tatiana.lozano@correo.com'),
('Raúl Antonio Mendoza', '1023456804', '1981-10-29', '3001000024', 'raul.mendoza@correo.com'),
('Lina Marcela Arévalo', '1023456805', '1997-02-04', '3001000025', 'lina.arevalo@correo.com'),
('Oscar Iván Linares', '1023456806', '1984-05-16', '3001000026', 'oscar.linares@correo.com'),
('Daniela Quiroga', '1023456807', '2005-09-23', '3001000027', 'daniela.quiroga@correo.com'),
('Freddy Alonso Cárdenas', '1023456808', '1978-12-07', '3001000028', 'freddy.cardenas@correo.com'),
('Yuliana Patricia Mora', '1023456809', '1993-03-31', '3001000029', 'yuliana.mora@correo.com'),
('Hernán David Acosta', '1023456810', '1990-11-19', '3001000030', 'hernan.acosta@correo.com'),
('Sandra Milena Vargas', '1023456811', '1992-01-09', '3001000031', 'sandra.vargas@correo.com'),
('Luis Fernando Cely', '1023456812', '1955-07-14', '3001000032', 'luis.cely@correo.com'),
('Mateo Alejandro Peña', '1023456813', '2014-04-12', '3001000033', 'acudiente.mateo@correo.com'),
('Isabella Suárez', '1023456814', '2012-10-03', '3001000034', 'acudiente.isabella@correo.com'),
('Juan José Herrera', '1023456815', '2010-06-20', '3001000035', 'acudiente.juan@correo.com');

-- ---------------------------------------------------------------------
-- 12. VENTA (41)
-- ---------------------------------------------------------------------
INSERT INTO Venta (Fecha, Precio_Unitario, Metodo_pago, Cantidad,
                   Staff_Id_Staff, Espectador_Id_Espectador,
                   Tipo_Boleta_Id_Tipo_Boleta, Funcion_Id_Funcion) VALUES
-- Funciones pasadas
('2026-09-26', 18000, 'Tarjeta',        2,  1,  1, 1, 1),   -- 1
('2026-09-26', 18000, 'Efectivo',       1,  2,  2, 1, 1),   -- 2
('2026-09-27', 18000, 'Tarjeta',        3,  1,  3, 1, 2),   -- 3
('2026-09-27', 12000, 'Efectivo',       2,  2,  4, 2, 2),   -- 4
('2026-09-27', 18000, 'Transferencia',  2,  1,  5, 1, 3),   -- 5
('2026-09-28', 14000, 'Tarjeta',        1,  2,  6, 3, 4),   -- 6
('2026-09-28', 12000, 'Efectivo',       2,  1,  7, 4, 4),   -- 7 (Adulto Mayor)
('2026-09-30',  9000, 'Efectivo',       2,  3,  8, 5, 5),   -- 8 (Miércoles)
('2026-09-30',  9000, 'Tarjeta',        4, 11,  9, 5, 5),   -- 9 (Miércoles)
('2026-10-01', 18000, 'Tarjeta',        2,  3, 10, 1, 6),   -- 10
('2026-10-02', 14000, 'Efectivo',       1, 11, 11, 3, 7),   -- 11 (Estudiante)
('2026-10-02', 18000, 'Tarjeta',        3,  1, 12, 1, 8),   -- 12
('2026-10-03', 18000, 'Tarjeta',        2,  2, 13, 1, 9),   -- 13
('2026-10-03', 12000, 'Efectivo',       3,  1, 33, 2, 10),  -- 14 (Niño - Mateo)
('2026-10-03', 18000, 'Transferencia',  2, 11, 15, 1, 11),  -- 15
('2026-10-04', 18000, 'Tarjeta',        2,  2, 16, 1, 12),  -- 16
('2026-10-04', 14000, 'Efectivo',       1,  1, 17, 3, 13),  -- 17 (Estudiante)
('2026-10-05', 18000, 'Tarjeta',        4,  3, 18, 1, 14),  -- 18
('2026-10-06', 12000, 'Efectivo',       2, 11, 19, 4, 15),  -- 19 (Adulto Mayor - Gloria)
('2026-10-06', 18000, 'Tarjeta',        2,  1, 20, 1, 16),  -- 20
('2026-10-07', 12000, 'Efectivo',       3,  2, 34, 2, 17),  -- 21 (Niño - Isabella)
('2026-10-07',  9000, 'Tarjeta',        2,  1, 22, 5, 18),  -- 22 (Miércoles)
('2026-10-07',  9000, 'Efectivo',       1,  2, 23, 5, 18),  -- 23 (Miércoles)
-- Preventa de funciones futuras
('2026-10-07', 18000, 'Tarjeta',        2,  1, 24, 1, 19),  -- 24
('2026-10-08', 18000, 'Transferencia',  4,  2, 25, 1, 19),  -- 25
('2026-10-08', 18000, 'Tarjeta',        2,  1, 26, 1, 20),  -- 26
('2026-10-08', 14000, 'Efectivo',       2,  2, 27, 3, 20),  -- 27 (Estudiante)
('2026-10-08', 18000, 'Tarjeta',        3,  1, 28, 1, 21),  -- 28
('2026-10-08', 12000, 'Efectivo',       2,  2, 35, 2, 22),  -- 29 (Niño - Juan José)
('2026-10-07', 18000, 'Tarjeta',        2,  3, 30, 1, 23),  -- 30
('2026-10-08', 18000, 'Tarjeta',        2, 11, 31, 1, 24),  -- 31
('2026-10-08', 12000, 'Efectivo',       1,  3, 32, 4, 26),  -- 32 (Adulto Mayor - Luis Cely)
('2026-10-08', 12000, 'Transferencia',  3,  2, 33, 2, 27),  -- 33 (Niño)
('2026-10-08', 18000, 'Tarjeta',        2,  1,  1, 1, 29),  -- 34
('2026-10-08', 18000, 'Tarjeta',        2,  2,  2, 1, 30),  -- 35
('2026-10-08', 14000, 'Efectivo',       2,  1,  3, 3, 30),  -- 36
('2026-10-08', 18000, 'Tarjeta',        2,  3,  4, 1, 31),  -- 37
('2026-10-08', 18000, 'Tarjeta',        3, 11,  5, 1, 33),  -- 38
('2026-10-08', 18000, 'Tarjeta',        2,  1,  6, 1, 35),  -- 39
-- Función 25 casi agotada (40 + 38 = 78 de 80 puestos)
('2026-10-08', 18000, 'Transferencia', 40,  1, 10, 1, 25),  -- 40
('2026-10-08', 18000, 'Transferencia', 38,  2, 10, 1, 25);  -- 41

-- ---------------------------------------------------------------------
-- 13. COLABORADOR (4)
-- ---------------------------------------------------------------------
INSERT INTO Colaborador (Nombre_negocio, Nit, Correo, Telefono, Estado) VALUES
('Crepes & Waffles',  '900000001-1', 'alianzas@ejemplo.com', '3105550001', 'Activo'),    -- 1
('Juan Valdez Café',  '900000002-2', 'alianzas@ejemplo.com', '3105550002', 'Activo'),    -- 2
('Sushi Itto',        '900000003-3', 'alianzas@ejemplo.com', '3105550003', 'Activo'),    -- 3
('Cinepolitana',      '900000004-4', 'alianzas@ejemplo.com', '3105550004', 'Inactivo');  -- 4

-- ---------------------------------------------------------------------
-- 14. SED_COL (6)
-- ---------------------------------------------------------------------
INSERT INTO Sed_Col (Sede_Id_Sede, Colaborador_Id_Colaborador) VALUES
(1, 1), (1, 2), (1, 3), (1, 4),
(2, 2), (2, 3);

-- ---------------------------------------------------------------------
-- 15. PRODUCTO_CONFITERIA (12)
-- ---------------------------------------------------------------------
INSERT INTO Producto_Confiteria (Precio, Nombre, Stock, Categoria, Colaborador_Id_Colaborador) VALUES
(16500, 'Waffle con helado y arequipe', 60, 'Postre',        1),   -- 1
(14500, 'Crepe de arequipe y banano',   40, 'Postre',        1),   -- 2
(13500, 'Brownie con helado',           50, 'Postre',        1),   -- 3
( 5500, 'Café americano',              100, 'Bebida',        2),   -- 4
( 7500, 'Cappuccino',                   80, 'Bebida',        2),   -- 5
(11500, 'Frappé de café',               70, 'Bebida',        2),   -- 6
(24000, 'Roll California x8',           45, 'Sushi',         3),   -- 7
(18000, 'Gyozas x6',                    60, 'Sushi',         3),   -- 8
(28000, 'Roll de camarón tempura x8',   35, 'Sushi',         3),   -- 9
( 9000, 'Perro caliente',               90, 'Comida rápida', 4),   -- 10
(11000, 'Nachos con queso',             55, 'Comida rápida', 4),   -- 11
(17000, 'Combo nachos + gaseosa',       30, 'Combo',         4);   -- 12

-- ---------------------------------------------------------------------
-- 16. VEN_PRO (25)
-- ---------------------------------------------------------------------
INSERT INTO Ven_Pro (Venta_Id_Venta, Prod_Conf_Id_Prod, Cantidad, Precio_unitario) VALUES
( 1,  4, 2,  5500), ( 1,  1, 1, 16500),
( 3,  7, 1, 24000), ( 3,  3, 1, 13500),
( 5,  5, 2,  7500),
( 6,  4, 1,  5500),
( 8,  8, 2, 18000),
( 9,  1, 4, 16500),
(10,  6, 2, 11500),
(12,  9, 1, 28000),
(13,  2, 2, 14500),
(14, 10, 3,  9000), (14, 11, 1, 11000),
(16, 10, 2,  9000),
(17,  4, 1,  5500),
(18, 12, 4, 17000),
(20, 11, 2, 11000),
(21, 10, 3,  9000),
(22,  5, 2,  7500),
(24,  3, 2, 13500),
(26,  2, 2, 14500),
(28,  9, 2, 28000),
(30,  6, 2, 11500),
(31,  1, 2, 16500),
(33,  8, 3, 18000);

-- ---------------------------------------------------------------------
-- 17. CONTRATO (12)
-- ---------------------------------------------------------------------
INSERT INTO Contrato (Estado, Fecha_inicio, Fecha_fin, Act_Dir_Id_Actor_Dir, Funcion_Id_Funcion) VALUES
('Finalizado', '2026-09-25', '2026-09-27',  1,  1),   -- Nolan, La Odisea
('Finalizado', '2026-09-26', '2026-09-28',  3,  2),   -- Cregger, Resident Evil
('Finalizado', '2026-09-26', '2026-09-28', 13,  3),   -- Tom Holland, Spider-Man
('Finalizado', '2026-10-02', '2026-10-04', 20,  9),   -- Austin Abrams, Resident Evil
('Finalizado', '2026-10-02', '2026-10-04',  9, 10),   -- Will Becher, Shaun el Cordero
('Finalizado', '2026-10-03', '2026-10-05', 21, 12),   -- Paul Walter Hauser, Resident Evil
('Vigente',    '2026-10-08', '2026-10-10', 26, 19),   -- Dakota Johnson, Verity
('Vigente',    '2026-10-08', '2026-10-10',  4, 20),   -- Iñárritu, Digger
('Vigente',    '2026-10-14', '2026-10-16', 29, 29),   -- Jason Momoa, Street Fighter
('Vigente',    '2026-10-16', '2026-10-18', 28, 32),   -- Justin Fletcher, Shaun el Cordero
('Cancelado',  '2026-10-22', '2026-10-24', 31, 34),   -- Tom Rhys Harries, Clayface
('Vigente',    '2026-10-29', '2026-10-31', 36, 35);   -- Daisy Ridley, Sensatez y Sentimiento

-- ---------------------------------------------------------------------
-- VERIFICACIÓN: Conteo final por tabla
-- ---------------------------------------------------------------------
SELECT 'Sede' AS tabla, COUNT(*) AS registros FROM Sede
UNION ALL SELECT 'Sala', COUNT(*) FROM Sala
UNION ALL SELECT 'Rol_Staff', COUNT(*) FROM Rol_Staff
UNION ALL SELECT 'Staff', COUNT(*) FROM Staff
UNION ALL SELECT 'Tipo_Boleta', COUNT(*) FROM Tipo_Boleta
UNION ALL SELECT 'ACTOR_DIRECTOR', COUNT(*) FROM ACTOR_DIRECTOR
UNION ALL SELECT 'Pelicula', COUNT(*) FROM Pelicula
UNION ALL SELECT 'Pelicula_Genero', COUNT(*) FROM Pelicula_Genero
UNION ALL SELECT 'Act_Dir_Pel', COUNT(*) FROM Act_Dir_Pel
UNION ALL SELECT 'Funcion', COUNT(*) FROM Funcion
UNION ALL SELECT 'Espectador', COUNT(*) FROM Espectador
UNION ALL SELECT 'Venta', COUNT(*) FROM Venta
UNION ALL SELECT 'Colaborador', COUNT(*) FROM Colaborador
UNION ALL SELECT 'Sed_Col', COUNT(*) FROM Sed_Col
UNION ALL SELECT 'Producto_Confiteria', COUNT(*) FROM Producto_Confiteria
UNION ALL SELECT 'Ven_Pro', COUNT(*) FROM Ven_Pro
UNION ALL SELECT 'Contrato', COUNT(*) FROM Contrato;
