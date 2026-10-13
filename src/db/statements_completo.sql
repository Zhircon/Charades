BEGIN;

CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    es_name TEXT NOT NULL,
    en_name TEXT NOT NULL,
    en_description TEXT NOT NULL,
    es_description TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS concepts(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    es_description TEXT NOT NULL,
    en_description TEXT NOT NULL,
    image TEXT NULL,
    level INTEGER NOT NULL, --index
    category_id INTEGER,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE INDEX IF NOT EXISTS idx_concepts_level ON concepts(level);
CREATE INDEX IF NOT EXISTS idx_concepts_category_id ON concepts(category_id);
-- Actualiza la versión de la base de datos al finalizar
PRAGMA user_version = 1;

---POPULIZE THE CATEGORIES TABLE OF THE DB-------------
INSERT INTO categories (es_name, en_name, en_description,es_description) VALUES 
('titulos de peliculas','movie titles','titles of movies','titulos de peliculas'),
('titulos de series','tv shows titles','titles of tv shows','titulos de series de television'),
('famosos','famous people','celebrities','celebridades'),
('frutas y verduras','fruits and vegatables','names of fruits and  and vegatables',''),
('animales','animals','names of animals','nombre de animales'),
('objetos inanimados','inanimate object','objects you will find in a office,classroom or a house','objetos que podrias encontrar en una oficina, salon o casa'),
('acciones','actions','verbs','verbos'),
('emociones y sentimientos','emotions and feelings','happy,sad,angry','feliz,triste,hambre');

PRAGMA user_version = 2;



---POPULATE THE CONCEPTS TABLE---------------------------
-- Títulos de películas (category_id = 1)
INSERT INTO concepts (es_description, en_description, image, level, category_id) VALUES
('El diario de una princesa', 'The Princess Diaries', NULL, 1, 1),
('El diario de Bridget Jones', 'Bridget Jones''s Diary', NULL, 2, 1),
('Buscando a Nemo', 'Finding Nemo', NULL, 1, 1),
('Ratatouille', 'Ratatouille', NULL, 1, 1),
('Valiente', 'Brave', NULL, 1, 1),
('Búsqueda implacable', 'Taken', NULL, 2, 1),
('Iron Man', 'Iron Man', NULL, 1, 1),
('La caída del halcón negro', 'Black Hawk Down', NULL, 3, 1),
('Spider-Man', 'Spider-Man', NULL, 1, 1),
('Los indestructibles', 'The Expendables', NULL, 2, 1),
('Lo que el viento se llevó', 'Gone with the Wind', NULL, 3, 1),
('Cumbres borrascosas', 'Wuthering Heights', NULL, 3, 1),
('Rescatando al soldado Ryan', 'Saving Private Ryan', NULL, 2, 1),
('El día que la Tierra se detuvo', 'The Day the Earth Stood Still', NULL, 3, 1),
('Batalla por Los Ángeles', 'Battle: Los Angeles', NULL, 3, 1),
('Avatar', 'Avatar', NULL, 1, 1),
('Monsters, Inc.', 'Monsters, Inc.', NULL, 1, 1),
('Los Increíbles', 'The Incredibles', NULL, 1, 1),
('Acme vs. Coyote', 'Wile E. Coyote vs. Acme', NULL, 3, 1);

-- Títulos de series (category_id = 2)
INSERT INTO concepts (es_description, en_description, image, level, category_id) VALUES
('Friends', 'Friends', NULL, 1, 2),
('Game of Thrones', 'Game of Thrones', NULL, 1, 2),
('The Blacklist', 'The Blacklist', NULL, 2, 2),
('Bones', 'Bones', NULL, 1, 2),
('Westworld', 'Westworld', NULL, 2, 2),
('El mentalista', 'The Mentalist', NULL, 2, 2),
('Silo', 'Silo', NULL, 3, 2),
('Agentes de S.H.I.E.L.D.', 'Agents of S.H.I.E.L.D.', NULL, 3, 2),
('Cómo conocí a vuestra madre', 'How I Met Your Mother', NULL, 2, 2),
('La teoría del Big Bang', 'The Big Bang Theory', NULL, 1, 2),
('Scorpion', 'Scorpion', NULL, 3, 2),
('Stargate Atlantis', 'Stargate Atlantis', NULL, 3, 2);

PRAGMA user_version = 3;

COMMIT;