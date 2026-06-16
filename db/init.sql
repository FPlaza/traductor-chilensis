-- ============================================
-- TRADUCTOR CHILENSIS - Inicialización de DBs
-- ============================================

-- Crear bases de datos separadas para cada microservicio
CREATE DATABASE db_traductor;
CREATE DATABASE db_diccionario;
CREATE DATABASE db_contexto;
CREATE DATABASE db_sugerencias;

-- ============================================
-- DB DICCIONARIO
-- ============================================
\c db_diccionario;

CREATE TABLE IF NOT EXISTS terminos (
    id SERIAL PRIMARY KEY,
    palabra VARCHAR(100) NOT NULL UNIQUE,
    traduccion VARCHAR(255) NOT NULL,
    descripcion TEXT,
    ejemplo_uso TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categorias (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT
);

CREATE TABLE IF NOT EXISTS termino_categoria (
    termino_id INT REFERENCES terminos(id) ON DELETE CASCADE,
    categoria_id INT REFERENCES categorias(id) ON DELETE CASCADE,
    PRIMARY KEY (termino_id, categoria_id)
);

-- Datos semilla
INSERT INTO categorias (nombre, descripcion) VALUES
    ('saludo', 'Expresiones de saludo'),
    ('insulto', 'Garabatos y expresiones fuertes'),
    ('cotidiano', 'Expresiones del día a día'),
    ('comida', 'Términos relacionados con comida'),
    ('emociones', 'Expresiones de emoción');

INSERT INTO terminos (palabra, traduccion, descripcion, ejemplo_uso) VALUES
    ('al tiro', 'inmediatamente / ahora mismo', 'Expresión para indicar que algo se hará de inmediato', 'Voy al tiro para allá'),
    ('bacán', 'genial / excelente', 'Adjetivo positivo para describir algo muy bueno', 'Eso estuvo bacán'),
    ('cachar', 'entender / darse cuenta', 'Verbo que significa comprender algo', '¿Cachái lo que te digo?'),
    ('fome', 'aburrido / sin gracia', 'Adjetivo para algo sin interés', 'Qué película más fome'),
    ('huevón', 'amigo / tonto (según contexto)', 'Término muy versátil, puede ser cariñoso o insulto', 'Oye huevón, ¿cómo estás?'),
    ('pololo', 'novio / pareja', 'Término para referirse a la pareja romántica', 'Ese es mi pololo'),
    ('pololear', 'salir con alguien / ser novios', 'Verbo que indica estar en una relación', 'Estamos pololeando hace un mes'),
    ('caleta', 'mucho / bastante', 'Adverbio de cantidad', 'Tengo caleta de trabajo'),
    ('cuático', 'impresionante / increíble', 'Adjetivo para algo sorprendente', 'Qué cuático lo que pasó'),
    ('achuntar', 'acertar / dar en el clavo', 'Verbo para indicar que algo fue correcto', 'Achuntaste con la respuesta'),
    ('pega', 'trabajo / empleo', 'Sustantivo para referirse al trabajo', 'Tengo mucha pega hoy'),
    ('taco', 'embotellamiento de tráfico', 'Sustantivo para tráfico congestionado', 'Hay un taco terrible en la Alameda'),
    ('lucas', 'pesos chilenos (miles)', 'Término para referirse al dinero', 'Me costó diez lucas'),
    ('carrete', 'fiesta / salida nocturna', 'Sustantivo para referirse a una celebración', 'Vamos al carrete esta noche'),
    ('pituto', 'contacto / palanca', 'Sustantivo para referirse a una influencia o contacto', 'Entré por pituto al trabajo'),
    ('garabato', 'palabrota / groserías', 'Término para palabras obscenas', 'No digas garabatos'),
    ('al lote', 'desordenado / al azar', 'Expresión para algo sin orden', 'Hizo el trabajo al lote'),
    ('choro', 'valiente / audaz / excelente', 'Adjetivo positivo múltiple uso', 'Ese cabro es bien choro'),
    ('copuchento', 'chismoso / entrometido', 'Adjetivo para alguien metiche', 'No seas tan copuchento'),
    ('weá', 'cosa / asunto (genérico)', 'Sustantivo comodín muy versátil', 'Pásame esa weá');

-- Asignar categorías
INSERT INTO termino_categoria (termino_id, categoria_id) VALUES
    (1, 3), (2, 3), (3, 3), (4, 5), (5, 3),
    (6, 3), (7, 3), (8, 3), (9, 5), (10, 3),
    (11, 3), (12, 3), (13, 3), (14, 3), (15, 3);

-- ============================================
-- DB CONTEXTO
-- ============================================
\c db_contexto;

CREATE TABLE IF NOT EXISTS regiones (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT
);

CREATE TABLE IF NOT EXISTS variaciones_regionales (
    id SERIAL PRIMARY KEY,
    termino_original VARCHAR(100) NOT NULL,
    variacion VARCHAR(100) NOT NULL,
    region_id INT REFERENCES regiones(id),
    notas TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Datos semilla
INSERT INTO regiones (nombre, descripcion) VALUES
    ('Norte', 'Regiones de Arica, Tarapacá, Antofagasta, Atacama'),
    ('Centro', 'Regiones de Coquimbo, Valparaíso, Metropolitana, O''Higgins'),
    ('Sur', 'Regiones de Maule, Biobío, La Araucanía, Los Lagos y más');

INSERT INTO variaciones_regionales (termino_original, variacion, region_id, notas) VALUES
    ('bacán', 'bacán', 1, 'Uso estándar en el norte'),
    ('bacán', 'bacán', 2, 'Uso más frecuente en el centro'),
    ('bacán', 'la raja', 3, 'En el sur se prefiere "la raja"'),
    ('huevón', 'hue''ón', 1, 'Pronunciación más corta en el norte'),
    ('huevón', 'huevón', 2, 'Pronunciación estándar'),
    ('huevón', 'wn', 3, 'Forma coloquial escrita en el sur'),
    ('carrete', 'carrete', 1, 'Término estándar'),
    ('carrete', 'carrete', 2, 'Término estándar'),
    ('carrete', 'joda', 3, 'En el sur también se dice "joda"');

-- ============================================
-- DB TRADUCTOR
-- ============================================
\c db_traductor;

CREATE TABLE IF NOT EXISTS traducciones (
    id SERIAL PRIMARY KEY,
    texto_original TEXT NOT NULL,
    texto_traducido TEXT NOT NULL,
    region VARCHAR(50) DEFAULT 'Centro',
    palabras_detectadas JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_traducciones_created_at ON traducciones(created_at DESC);

-- ============================================
-- DB SUGERENCIAS
-- ============================================
\c db_sugerencias;

CREATE TABLE IF NOT EXISTS sugerencias (
    id SERIAL PRIMARY KEY,
    palabra VARCHAR(100) NOT NULL,
    traduccion_propuesta VARCHAR(255) NOT NULL,
    descripcion TEXT,
    ejemplo_uso TEXT,
    region VARCHAR(50),
    estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aprobada', 'rechazada')),
    usuario_email VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO sugerencias (palabra, traduccion_propuesta, descripcion, estado) VALUES
    ('filete', 'excelente / muy bueno', 'Adjetivo positivo usado principalmente en Santiago', 'pendiente'),
    ('al peo', 'borracho / ebrio', 'Expresión para referirse a alguien en estado de ebriedad', 'pendiente');

-- Agregar variantes de modismos comunes
\c db_diccionario;
INSERT INTO terminos (palabra, traduccion, descripcion, ejemplo_uso) VALUES
    ('weon', 'amigo / tonto (según contexto)', 'Forma escrita coloquial de huevón', 'Oye weon, ¿cómo estás?'),
    ('wn', 'amigo / tonto (según contexto)', 'Forma abreviada de huevón', 'Oye wn qué pasó'),
    ('weón', 'amigo / tonto (según contexto)', 'Variante ortográfica de huevón', 'Qué hace ese weón'),
    ('po', 'pues', 'Partícula enfática chilena, contracción de pues', 'Ya po, vamos'),
    ('poh', 'pues', 'Variante ortográfica de po', 'Ya poh, no seas así'),
    ('sipo', 'sí pues', 'Afirmación enfática', 'Sipo, tienes razón'),
    ('nopo', 'no pues', 'Negación enfática', 'Nopo, eso no fue así'),
    ('cachai', 'entiendes / te das cuenta', 'Forma interrogativa de cachar', '¿Cachai lo que te digo?'),
    ('altiro', 'inmediatamente', 'Forma compuesta de al tiro', 'Voy altiro para allá'),
    ('la raja', 'excelente / genial', 'Expresión muy positiva usada especialmente en el sur', 'Eso estuvo la raja'),
    ('filete', 'excelente / muy bueno', 'Adjetivo positivo popular en Santiago', 'Quedó filete el trabajo'),
    ('penca', 'malo / aburrido / de mala calidad', 'Adjetivo negativo', 'Qué penca esa película'),
    ('jote', 'persona que molesta buscando pareja', 'Sustantivo peyorativo', 'No seas jote'),
    ('polola', 'novia / pareja', 'Forma femenina de pololo', 'Ella es mi polola'),
    ('curado', 'borracho / ebrio', 'Estado de ebriedad', 'Llegó todo curado'),
    ('copete', 'bebida alcohólica / trago', 'Sustantivo para bebida con alcohol', 'Vamos a tomar un copete'),
    ('al lote', 'al azar / desordenado / sin cuidado', 'Expresión para algo hecho sin esfuerzo', 'Lo hizo todo al lote'),
    ('rato', 'momento / instante', 'Período corto de tiempo', 'Espera un rato'),
    ('cabro', 'niño / chico / joven', 'Sustantivo informal para persona joven', 'Ese cabro es muy listo'),
    ('cabra', 'niña / chica / joven', 'Forma femenina de cabro', 'La cabra llegó tarde')
ON CONFLICT (palabra) DO NOTHING;