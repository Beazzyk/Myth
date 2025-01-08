-- Postacie
INSERT INTO characters (name, level, x_coord, y_coord, map_id, health_current, health_max, mana_current, mana_max, backpack_slots) 
VALUES 
('Hero', 10, 100, 200, 1, 100, 100, 50, 50, 20),
('Warrior', 5, 150, 250, 1, 80, 80, 30, 30, 15);

-- NPC
INSERT INTO npcs (id, name, position_x, position_y, map_id) 
VALUES 
(1, 'Blacksmith', 50, 75, 1),
(2, 'Shopkeeper', 80, 120, 1);

-- Mapy
INSERT INTO maps (id, name, width, height) 
VALUES 
(1, 'Starting Zone', 500, 500),
(2, 'Dungeon Entrance', 300, 300);

-- Przedmioty
INSERT INTO items (id, name, type) 
VALUES 
(1, 'Sword of Valor', 'weapon'),
(2, 'Healing Potion', 'consumable'),
(3, 'Leather Armor', 'armor');