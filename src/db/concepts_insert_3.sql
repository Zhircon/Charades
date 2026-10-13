BEGIN;

-- Títulos de películas (category_id = 1)
INSERT INTO concepts (es_description, en_description, image, level, category_id) VALUES
('Titanic', 'Titanic', NULL, 1, 1),
('El rey león', 'The Lion King', NULL, 1, 1),
('Toy Story', 'Toy Story', NULL, 1, 1),
('Shrek', 'Shrek', NULL, 1, 1),
('Harry Potter y la piedra filosofal', 'Harry Potter and the Philosopher''s Stone', NULL, 1, 1),
('El señor de los anillos', 'The Lord of the Rings', NULL, 2, 1),
('Jurassic Park', 'Jurassic Park', NULL, 1, 1),
('Volver al futuro', 'Back to the Future', NULL, 2, 1),
('Star Wars', 'Star Wars', NULL, 1, 1),
('Frozen: Una aventura congelada', 'Frozen', NULL, 1, 1),
('Coco', 'Coco', NULL, 1, 1),
('Up', 'Up', NULL, 2, 1),
('Intensamente', 'Inside Out', NULL, 2, 1),
('Matrix', 'The Matrix', NULL, 2, 1),
('Gladiador', 'Gladiator', NULL, 2, 1),
('Forrest Gump', 'Forrest Gump', NULL, 2, 1),
('El padrino', 'The Godfather', NULL, 3, 1),
('Tiburón', 'Jaws', NULL, 2, 1),
('Piratas del Caribe', 'Pirates of the Caribbean', NULL, 1, 1),
('Los Vengadores', 'The Avengers', NULL, 1, 1),
('Batman', 'Batman', NULL, 1, 1),
('Kung Fu Panda', 'Kung Fu Panda', NULL, 2, 1),
('Madagascar', 'Madagascar', NULL, 2, 1),
('Cars', 'Cars', NULL, 1, 1),
('Mulan', 'Mulan', NULL, 2, 1),
('La Bella y la Bestia', 'Beauty and the Beast', NULL, 1, 1),
('Aladdín', 'Aladdin', NULL, 1, 1),
('Mi pobre angelito', 'Home Alone', NULL, 2, 1),
('Los cazafantasmas', 'Ghostbusters', NULL, 2, 1),
('Karate Kid', 'The Karate Kid', NULL, 2, 1);

-- Títulos de series (category_id = 2)
INSERT INTO concepts (es_description, en_description, image, level, category_id) VALUES
('Los Simpson', 'The Simpsons', NULL, 1, 2),
('Stranger Things', 'Stranger Things', NULL, 1, 2),
('Breaking Bad', 'Breaking Bad', NULL, 1, 2),
('La casa de papel', 'Money Heist', NULL, 1, 2),
('The Office', 'The Office', NULL, 2, 2),
('Merlina', 'Wednesday', NULL, 1, 2),
('The Walking Dead', 'The Walking Dead', NULL, 1, 2),
('Anatomía de Grey', 'Grey''s Anatomy', NULL, 2, 2),
('Dr. House', 'House', NULL, 2, 2),
('Black Mirror', 'Black Mirror', NULL, 2, 2),
('El juego del calamar', 'Squid Game', NULL, 1, 2),
('The Mandalorian', 'The Mandalorian', NULL, 2, 2),
('Lost', 'Lost', NULL, 2, 2),
('Padre de familia', 'Family Guy', NULL, 2, 2),
('Rick y Morty', 'Rick and Morty', NULL, 2, 2),
('Peaky Blinders', 'Peaky Blinders', NULL, 3, 2),
('The Crown', 'The Crown', NULL, 3, 2),
('Prison Break', 'Prison Break', NULL, 2, 2),
('Sherlock', 'Sherlock', NULL, 3, 2),
('Vikingos', 'Vikings', NULL, 3, 2);

PRAGMA user_version = 5;

COMMIT;
