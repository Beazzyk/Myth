const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { Pool } = require('pg');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Konfiguracja połączenia z bazą danych PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT, 10),
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Testowe połączenie z bazą danych
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Error connecting to the database', err.stack);
  } else {
    console.log('Successfully connected to the database');
  }
});

// Endpoint do pobierania danych postaci z bazy danych
app.get('/api/characters/:playerId', async (req, res) => {
  const { playerId } = req.params;
  try {
    // Pobieranie danych postaci
    const characterQuery = `
      SELECT 
        c.id, 
        c.name, 
        c.level, 
        p.name AS profession,
        p.battle_position,
        c.x_coord, 
        c.y_coord, 
        c.map_id,
        c.health_current, 
        c.health_max,
        c.mana_current, 
        c.mana_max, 
        c.energy_current, 
        c.energy_max,
        c.experience_current, 
        c.experience_max, 
        c.gold, 
        c.premium_currency,
        c.strength, 
        c.dexterity, 
        c.intelligence, 
        c.charisma, 
        c.attack, 
        c.armor, 
        c.speed,
        c.resistance_1,
        c.resistance_2,
        c.resistance_3,
        c.resistance_4,
        c.backpack_slots
      FROM characters c
      JOIN professions p ON c.profession_id = p.id
      WHERE c.id = $1;
    `;
    const characterResult = await pool.query(characterQuery, [playerId]);
    const character = characterResult.rows[0];

    if (!character) {
      return res.status(404).json({ error: 'Character not found' });
    }

    // Pobieranie ekwipunku postaci
    const equipmentQuery = `
      SELECT eq.slot, it.name 
      FROM equipment eq
      LEFT JOIN loot l ON eq.unique_item_id = l.unique_item_id
      LEFT JOIN items it ON l.item_id = it.id
      WHERE eq.character_id = $1;
    `;
    const equipmentResult = await pool.query(equipmentQuery, [playerId]);

    // Pobieranie przedmiotów z plecaka
    const backpackQuery = `
      SELECT bi.backpack_number, bi.slot_number, l.item_id, it.name AS item_name
      FROM backpack_items bi
      LEFT JOIN loot l ON bi.unique_item_id = l.unique_item_id
      LEFT JOIN items it ON l.item_id = it.id
      WHERE bi.character_id = $1
      ORDER BY bi.backpack_number, bi.slot_number;
    `;
    const backpackResult = await pool.query(backpackQuery, [playerId]);

    // Obliczanie wolnych slotów
    const usedSlots = backpackResult.rows.length;
    const freeSlots = character.backpack_slots - usedSlots;

    // Tworzenie obiektu danych postaci
    const characterData = {
      id: character.id,
      name: character.name,
      level: character.level,
      profession: character.profession,
      battle_position: character.battle_position,
      health: {
        current: character.health_current,
        max: character.health_max,
      },
      mana: {
        current: character.mana_current,
        max: character.mana_max,
      },
      energy: {
        current: character.energy_current,
        max: character.energy_max,
      },
      experience: {
        current: character.experience_current,
        max: character.experience_max,
      },
      gold: character.gold,
      premiumCurrency: character.premium_currency,
      stats: {
        strength: character.strength,
        dexterity: character.dexterity,
        intelligence: character.intelligence,
        charisma: character.charisma,
      },
      combat: {
        attack: character.attack,
        armor: character.armor,
        speed: character.speed,
        resistances: [
          character.resistance_1,
          character.resistance_2,
          character.resistance_3,
          character.resistance_4,
        ],
      },
      position: {
        x: character.x_coord,
        y: character.y_coord,
        mapId: character.map_id,
      },
      equipment: equipmentResult.rows.reduce((acc, item) => {
        acc[item.slot] = item.name;
        return acc;
      }, {}),
      backpacks: backpackResult.rows.reduce((acc, item) => {
        if (!acc[item.backpack_number - 1]) acc[item.backpack_number - 1] = [];
        acc[item.backpack_number - 1][item.slot_number - 1] = { id: item.item_id, name: item.item_name };
        return acc;
      }, [[], [], []]),
      backpack_slots: character.backpack_slots,
      free_slots: freeSlots
    };

    res.json(characterData);
  } catch (error) {
    console.error('Error fetching character data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Nowy endpoint do pobierania informacji o wolnych slotach
app.get('/api/characters/:playerId/free-slots', async (req, res) => {
  const { playerId } = req.params;
  try {
    // Pobieranie całkowitej liczby slotów plecaka
    const totalSlotsQuery = `
      SELECT backpack_slots
      FROM characters
      WHERE id = $1;
    `;
    const totalSlotsResult = await pool.query(totalSlotsQuery, [playerId]);
    const totalSlots = totalSlotsResult.rows[0]?.backpack_slots;

    if (totalSlots === undefined) {
      return res.status(404).json({ error: 'Character not found' });
    }

    // Pobieranie liczby zajętych slotów
    const usedSlotsQuery = `
      SELECT COUNT(*) as used_slots
      FROM backpack_items
      WHERE character_id = $1;
    `;
    const usedSlotsResult = await pool.query(usedSlotsQuery, [playerId]);
    const usedSlots = usedSlotsResult.rows[0]?.used_slots;

    // Obliczanie wolnych slotów
    const freeSlots = totalSlots - usedSlots;

    res.json({ totalSlots, usedSlots, freeSlots });
  } catch (error) {
    console.error('Error fetching free slots data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Endpoint do dodawania przedmiotu do plecaka
app.post('/api/backpack/add-item', async (req, res) => {
  const { playerId, backpackNumber, itemId, itemName, uniqueItemId } = req.body;

  try {
    // Sprawdzenie liczby wolnych slotów w wybranym plecaku
    const freeSlotQuery = `
      SELECT slot_number
      FROM backpack_items
      WHERE character_id = $1 AND backpack_number = $2 AND item_name IS NULL
      ORDER BY slot_number
      LIMIT 1;
    `;
    const freeSlotResult = await pool.query(freeSlotQuery, [playerId, backpackNumber]);

    if (freeSlotResult.rows.length === 0) {
      return res.status(400).json({ error: 'No free slots available in this backpack' });
    }

    const freeSlot = freeSlotResult.rows[0].slot_number;

    // Dodawanie nowego przedmiotu do plecaka
    const insertItemQuery = `
      UPDATE backpack_items
      SET item_name = $1, unique_item_id = $2
      WHERE character_id = $3 AND backpack_number = $4 AND slot_number = $5
    `;
    await pool.query(insertItemQuery, [itemName, uniqueItemId, playerId, backpackNumber, freeSlot]);

    res.json({ message: 'Item added successfully to backpack', slot_number: freeSlot });
  } catch (error) {
    console.error('Error adding item to backpack:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint do pobierania wiadomości czatu
app.get('/api/chat/:mapId', async (req, res) => {
  const { mapId } = req.params;
  try {
    const chatQuery = `
      SELECT cm.id, c.name as character_name, cm.message, cm.timestamp as created_at
      FROM chat_messages cm
      JOIN characters c ON cm.character_id = c.id
      WHERE cm.map_id = $1
      ORDER BY cm.timestamp DESC
      LIMIT 50
    `;
    const chatResult = await pool.query(chatQuery, [mapId]);

    if (chatResult.rows.length === 0) {
      return res.status(404).json({ error: 'No chat messages found' });
    }

    res.json(chatResult.rows.reverse());
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint do wysyłania wiadomości czatu
app.post('/api/chat', async (req, res) => {
  const { mapId, characterId, message } = req.body;
  try {
    const insertQuery = `
      INSERT INTO chat_messages (character_id, map_id, message, timestamp)
      VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
      RETURNING id, message, timestamp
    `;
    const result = await pool.query(insertQuery, [characterId, mapId, message]);
    const newMessage = result.rows[0];

    const characterQuery = `SELECT name FROM characters WHERE id = $1`;
    const characterResult = await pool.query(characterQuery, [characterId]);
    const characterName = characterResult.rows[0]?.name;

    res.json({
      id: newMessage.id,
      character_name: characterName,
      message: newMessage.message,
      created_at: newMessage.timestamp
    });
  } catch (error) {
    console.error('Error sending chat message:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint do pobierania umiejętności postaci
app.get('/api/skills/:characterId', async (req, res) => {
  const { characterId } = req.params;
  try {
    const skillsQuery = `
      SELECT sd.name, s.skill_level 
      FROM skills s
      JOIN skill_definitions sd ON s.skill_name = sd.name
      WHERE s.character_id = $1
    `;
    const skillsResult = await pool.query(skillsQuery, [characterId]);
    res.json(skillsResult.rows);
  } catch (error) {
    console.error('Error fetching skills:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint do pobierania danych mapy, w tym transitions i boundaries
app.get('/api/maps/:mapId', async (req, res) => {
  const { mapId } = req.params;
  try {
    // Pobieranie informacji o mapie
    const mapQuery = `
      SELECT id, name, width, height
      FROM maps
      WHERE id = $1
    `;
    const mapResult = await pool.query(mapQuery, [mapId]);
    const map = mapResult.rows[0];

    if (!map) {
      return res.status(404).json({ error: 'Map not found' });
    }

    // Pobieranie kolizji
    const collisionsQuery = `
      SELECT x_coord, y_coord
      FROM map_collisions
      WHERE map_id = $1
    `;
    const collisionsResult = await pool.query(collisionsQuery, [mapId]);

    // Pobieranie NPC
    const npcQuery = `
      SELECT np.npc_id, n.name, np.x_coord, np.y_coord
      FROM npc_positions np
      JOIN npc n ON np.npc_id = n.id
      WHERE np.map_id = $1
    `;
    const npcResult = await pool.query(npcQuery, [mapId]);

    // Pobieranie potworów
    const monstersQuery = `
      SELECT id, name, x_coord, y_coord
      FROM monsters
      WHERE map_id = $1
    `;
    const monstersResult = await pool.query(monstersQuery, [mapId]);

    // Pobieranie przejść
    const transitionsQuery = `
      SELECT id, from_x_coord, from_y_coord, to_map_id, to_x_coord, to_y_coord
      FROM map_transitions
      WHERE from_map_id = $1
    `;
    const transitionsResult = await pool.query(transitionsQuery, [mapId]);

    // Pobieranie granic mapy (boundaries)
    const boundariesQuery = `
      SELECT x_min, x_max, y_min, y_max
      FROM map_boundaries
      WHERE map_id = $1
    `;
    const boundariesResult = await pool.query(boundariesQuery, [mapId]);

    const mapData = {
      ...map,
      collisions: collisionsResult.rows,
      npcs: npcResult.rows,
      monsters: monstersResult.rows,
      transitions: transitionsResult.rows,
      boundaries: boundariesResult.rows[0] || { x_min: 0, x_max: 100, y_min: 0, y_max: 100 }, // Zakładamy domyślne granice mapy
    };

    res.json(mapData);
  } catch (error) {
    console.error('Error fetching map data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint do ruchu postaci, z obsługą transitions
app.post('/api/characters/move', async (req, res) => {
  const { characterId, x, y, mapId } = req.body;
  
  try {
    // Sprawdzanie, czy postać wchodzi w obszar przejścia (transition)
    const transitionQuery = `
      SELECT to_map_id, to_x_coord, to_y_coord
      FROM map_transitions
      WHERE from_map_id = $1 AND from_x_coord = $2 AND from_y_coord = $3
    `;
    const transitionResult = await pool.query(transitionQuery, [mapId, x, y]);

    if (transitionResult.rows.length > 0) {
      const transition = transitionResult.rows[0];
      const newMapId = transition.to_map_id;
      const newX = transition.to_x_coord;
      const newY = transition.to_y_coord;

      // Aktualizacja mapy oraz współrzędnych postaci po przejściu
      const updateQuery = `
        UPDATE characters
        SET x_coord = $1, y_coord = $2, map_id = $3
        WHERE id = $4
      `;
      await pool.query(updateQuery, [newX, newY, newMapId, characterId]);
      return res.json({ success: true, newMapId, newX, newY });
    }

    // Jeśli nie ma przejścia, zaktualizuj tylko współrzędne postaci
    const updateQuery = `
      UPDATE characters
      SET x_coord = $1, y_coord = $2, map_id = $3
      WHERE id = $4
    `;
    await pool.query(updateQuery, [x, y, mapId, characterId]);

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating player position:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint do pobierania danych potwora
app.get('/api/monsters/:monsterId', async (req, res) => {
  const { monsterId } = req.params;
  try {
    const monsterQuery = `
      SELECT 
        m.id, 
        m.name, 
        m.health, 
        m.attack, 
        m.speed, 
        m.level, 
        p.name AS profession,
        p.battle_position
      FROM monsters m
      JOIN professions p ON m.profession_id = p.id
      WHERE m.id = $1;
    `;
    
    const result = await pool.query(monsterQuery, [monsterId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Monster not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching monster data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint do pobierania łupu potwora
app.post('/api/loot', async (req, res) => {
  const { playerId, monsterId, mapId } = req.body;

  try {
    // Pobierz kategorię lootu potwora
    const lootCategoryQuery = `
      SELECT *
      FROM monster_loot_categories
      WHERE monster_id = $1
    `;
    const lootCategoryResult = await pool.query(lootCategoryQuery, [monsterId]);
    const lootCategory = lootCategoryResult.rows[0];

    if (!lootCategory) {
      return res.status(404).json({ error: 'Loot category not found for this monster' });
    }

    // Losowanie lootu na podstawie kategorii
    const random = Math.random() * 100;
    console.log('Losowanie lootu:', random, lootCategory);
    let lootCategoryType = 'empty'; // domyślnie brak lootu

    if (random <= lootCategory.divine_chance) {
      lootCategoryType = 'divine';
    } else if (random <= lootCategory.heroic_chance) {
      lootCategoryType = 'heroic';
    } else if (random <= lootCategory.unique_chance) {
      lootCategoryType = 'unique';
    } else if (random <= lootCategory.common_chance) {
      lootCategoryType = 'common';
    }

    if (lootCategoryType === 'empty') {
      return res.json({ message: 'No loot found', loot: null });
    }

    // Pobierz przedmioty na podstawie wylosowanej kategorii
    const lootQuery = `
      SELECT it.id, it.name
      FROM monster_loot ml
      JOIN items it ON ml.item_id = it.id
      WHERE ml.monster_id = $1 AND ml.loot_category = $2
    `;
    const lootResult = await pool.query(lootQuery, [monsterId, lootCategoryType]);

    // Losowanie jednego przedmiotu z listy
    const selectedItem = lootResult.rows[Math.floor(Math.random() * lootResult.rows.length)];

    // Dodaj loot do tabeli `loot`
    const insertLootQuery = `
      INSERT INTO loot (unique_item_id, player_id, item_id, monster_id, map_id, obtained_at)
      VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW())
      RETURNING *;
    `;
    const newLootResult = await pool.query(insertLootQuery, [playerId, selectedItem.id, monsterId, mapId]);

    res.json({ message: 'Loot found', loot: newLootResult.rows[0] });
  } catch (error) {
    console.error('Error fetching loot:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Ustawienie portu
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


// Endpoint do pobierania informacji o przedmiotach
app.get('/api/items/:itemId', async (req, res) => {
  const { itemId } = req.params;
  try {
    const itemQuery = `
      SELECT * 
      FROM items
      WHERE id = $1
    `;
    const { rows } = await pool.query(itemQuery, [itemId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching item data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});