Dokumentacja Bazy Danych MMORPG

1. Tabela: characters
Przechowuje dane na temat graczy (postaci).

Pola:
id (INT, Primary Key) — Unikalny identyfikator postaci.
name (VARCHAR(255), NOT NULL) — Nazwa postaci.
level (INT, NOT NULL) — Poziom postaci.
health_current (INT, NOT NULL) — Aktualne punkty życia.
health_max (INT, NOT NULL) — Maksymalne punkty życia.
experience_current (INT, NOT NULL) — Aktualne doświadczenie.
experience_max (INT, NOT NULL) — Doświadczenie potrzebne do następnego poziomu.
gold (INT, NOT NULL) — Ilość złota.
premium_currency (INT, NOT NULL) — Waluta premium.
strength (INT, NOT NULL) — Statystyka siły.
dexterity (INT, NOT NULL) — Statystyka zręczności.
intelligence (INT, NOT NULL) — Statystyka inteligencji.
charisma (INT, NOT NULL) — Statystyka charyzmy.
attack (INT, NOT NULL) — Wartość ataku.
armor (INT, NOT NULL) — Wartość pancerza.
speed (DOUBLE PRECISION, NOT NULL) — Wartość szybkości.
resistance_1 (INT, NOT NULL) — Odporność nr 1.
resistance_2 (INT, NOT NULL) — Odporność nr 2.
resistance_3 (INT, NOT NULL) — Odporność nr 3.
resistance_4 (INT, NOT NULL) — Odporność nr 4.
energy_current (INT, DEFAULT 0, NOT NULL) — Aktualna energia.
energy_max (INT, DEFAULT 0, NOT NULL) — Maksymalna energia.
mana_current (INT, NOT NULL) — Aktualna mana.
mana_max (INT, NOT NULL) — Maksymalna mana.
profession_id (INT, FOREIGN KEY professions(id)) — Profesja postaci.

2. Tabela: professions
Przechowuje dane na temat profesji w grze.

Pola:
id (INT, Primary Key) — Unikalny identyfikator profesji.
name (VARCHAR(255), NOT NULL) — Nazwa profesji.
description (TEXT) — Opis profesji.
strength (INT) — Statystyka siły.
dexterity (INT) — Statystyka zręczności.
vitality (INT) — Statystyka żywotności.
intelligence (INT) — Statystyka inteligencji.
charisma (INT) — Statystyka charyzmy.
battle_position (INT) — Pozycja na polu bitwy (zasięg).

3. Tabela: items
Przechowuje informacje o wszystkich przedmiotach w grze.

Pola:
id (INT, Primary Key) — Unikalny identyfikator przedmiotu.
name (VARCHAR(255), NOT NULL) — Nazwa przedmiotu.
rarity (VARCHAR(50), CHECK (rarity IN ('common', 'unique', 'heroic', 'divine'))) — Rzadkość przedmiotu.
item_type_id (INT, FOREIGN KEY item_types(id)) — Typ przedmiotu.
strength (INT, DEFAULT 0) — Bonus do siły.
dexterity (INT, DEFAULT 0) — Bonus do zręczności.
intelligence (INT, DEFAULT 0) — Bonus do inteligencji.
defense (INT, DEFAULT 0) — Obrona.
magic_defense (INT, DEFAULT 0) — Obrona magiczna.
speed (INT, DEFAULT 0) — Bonus do szybkości.
critical_hit_chance (FLOAT, DEFAULT 0) — Szansa na krytyczne uderzenie.
magic_critical_hit_chance (FLOAT, DEFAULT 0) — Szansa na krytyczne magiczne uderzenie.
dodge_chance (FLOAT, DEFAULT 0) — Szansa na unik.
fire_resistance (INT, DEFAULT 0) — Odporność na ogień.
air_resistance (INT, DEFAULT 0) — Odporność na powietrze.
cold_resistance (INT, DEFAULT 0) — Odporność na zimno.
poison_resistance (INT, DEFAULT 0) — Odporność na truciznę.
crit_resistance (FLOAT, DEFAULT 0) — Odporność na ciosy krytyczne.
enemy_speed_reduction (FLOAT, DEFAULT 0) — Redukcja szybkości przeciwnika.
armor_reduction (FLOAT, DEFAULT 0) — Zmniejszenie pancerza przeciwnika.
mana_reduction (FLOAT, DEFAULT 0) — Zmniejszenie many przeciwnika.
health_regeneration (INT, DEFAULT 0) — Regeneracja zdrowia.
mana_regeneration (INT, DEFAULT 0) — Regeneracja many.
slow_resistance (FLOAT, DEFAULT 0) — Odporność na spowolnienie.
crit_damage_reduction (FLOAT, DEFAULT 0) — Redukcja obrażeń krytycznych.
life_drain_protection (FLOAT, DEFAULT 0) — Ochrona przed wyssaniem życia.
vampirism (FLOAT, DEFAULT 0) — Wampiryzm.
armor (INT, DEFAULT 0) — Pancerz.
attack (INT, DEFAULT 0) — Atak (dla broni).
life (INT, DEFAULT 0) — Życie.
elemental_damage_type (VARCHAR(50), DEFAULT 'none', CHECK (elemental_damage_type IN ('fire', 'air', 'cold', 'poison', 'none'))) — Typ obrażeń żywiołowych.
physical_crit_damage (FLOAT, DEFAULT 0) — Siła ciosu krytycznego fizycznego.
magic_crit_damage (FLOAT, DEFAULT 0) — Siła ciosu krytycznego magicznego.
divine_bonus_id (INT) — Id bonusu boskiego (przechowywane w innej tabeli).
required_level (INT, DEFAULT 1) — Wymagany poziom.
profession_id (INT, FOREIGN KEY professions(id)) — Profesja, która może używać przedmiotu.

4. Tabela: item_types
Przechowuje informacje o typach przedmiotów (np. broń, pancerz).

Pola:
id (INT, Primary Key) — Unikalny identyfikator typu przedmiotu.
name (VARCHAR(50), UNIQUE, NOT NULL) — Nazwa typu przedmiotu.

5. Tabela: monsters
Przechowuje informacje o potworach.

Pola:
id (INT, Primary Key) — Unikalny identyfikator potwora.
name (VARCHAR(255), NOT NULL) — Nazwa potwora.
health (INT, NOT NULL) — Punkty zdrowia potwora.
attack (INT, NOT NULL) — Wartość ataku.
speed (INT, NOT NULL) — Szybkość potwora.
level (INT, NOT NULL) — Poziom potwora.
loot_chance_common (FLOAT, DEFAULT 0) — Szansa na pospolity łup.
loot_chance_unique (FLOAT, DEFAULT 0) — Szansa na unikatowy łup.
loot_chance_heroic (FLOAT, DEFAULT 0) — Szansa na heroiczny łup.
loot_chance_divine (FLOAT, DEFAULT 0) — Szansa na boski łup.
loot_chance_empty (FLOAT, DEFAULT 0) — Szansa na brak łupu.
map_id (INT, FOREIGN KEY maps(id)) — Mapa, na której potwór się pojawia.
x_coord (INT, NOT NULL) — Pozycja X potwora na mapie.
y_coord (INT, NOT NULL) — Pozycja Y potwora na mapie.
monster_type_id (INT, FOREIGN KEY monster_types(id)) — Typ potwora.

6. Tabela: monster_types
Przechowuje informacje o typach potworów (np. normalny, elitarny).

Pola:
id (INT, Primary Key) — Unikalny identyfikator typu potwora.
type_name (VARCHAR(50), UNIQUE, NOT NULL) — Nazwa typu potwora.

7. Tabela: npc
Przechowuje informacje o NPC-ach w grze.

Pola:
id (INT, Primary Key) — Unikalny identyfikator NPC-a.
name (VARCHAR(255), NOT NULL) — Nazwa NPC-a.
map_id (INT, FOREIGN KEY maps(id)) — Mapa, na której NPC się pojawia.
x_coord (INT, NOT NULL) — Pozycja X NPC-a.
y_coord (INT, NOT NULL) — Pozycja Y NPC-a.

8. Tabela: maps
Przechowuje informacje o mapach w grze.

Pola:
id (INT, Primary Key) — Unikalny identyfikator mapy.
name (VARCHAR(255), NOT NULL) — Nazwa mapy.

9. Tabela: map_transitions
Przechowuje informacje o przejściach między mapami.

Pola:
from_map_id (INT, FOREIGN KEY maps(id)) — Identyfikator mapy początkowej.
from_x_coord (INT, NOT NULL) — Pozycja X na mapie początkowej.
from_y_coord (INT, NOT NULL) — Pozycja Y na mapie początkowej.
to_map_id (INT, FOREIGN KEY maps(id)) — Identyfikator mapy docelowej.
to_x_coord (INT, NOT NULL) — Pozycja X na mapie docelowej.
to_y_coord (INT, NOT NULL) — Pozycja Y na mapie docelowej.
Primary Key — (from_map_id, from_x_coord, from_y_coord).
10. Tabela: monster_loot_categories
Przechowuje informacje o szansach na łup z potworów.

Pola:
monster_id (INT, FOREIGN KEY monsters(id)) — Identyfikator potwora.
empty_chance (FLOAT, DEFAULT 0) — Szansa na brak łupu.
common_chance (FLOAT, DEFAULT 0) — Szansa na pospolity łup.
unique_chance (FLOAT, DEFAULT 0) — Szansa na unikatowy łup.
heroic_chance (FLOAT, DEFAULT 0) — Szansa na heroiczny łup.
divine_chance (FLOAT, DEFAULT 0) — Szansa na boski łup.
Primary Key — (monster_id).
11. Tabela: loot
Przechowuje informacje o przedmiotach zdobytych z potworów.

Pola:
id (INT, Primary Key) — Unikalny identyfikator rekordu.
unique_item_id (VARCHAR(255), NOT NULL) — Unikalne ID zdobytego przedmiotu.
player_id (INT, FOREIGN KEY characters(id)) — Identyfikator postaci, która zdobyła łup.
item_id (INT, FOREIGN KEY items(id)) — Identyfikator przedmiotu.
monster_id (INT, FOREIGN KEY monsters(id)) — Identyfikator potwora, z którego przedmiot został zdobyty.
map_id (INT, FOREIGN KEY maps(id)) — Identyfikator mapy, na której przedmiot został zdobyty.
obtained_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP) — Data i czas zdobycia przedmiotu.
12. Tabela: equipment
Przechowuje informacje o przedmiotach noszonych przez postać.

Pola:
character_id (INT, FOREIGN KEY characters(id)) — Identyfikator postaci.
slot (VARCHAR(50), NOT NULL) — Slot, w którym przedmiot jest noszony (np. hełm, zbroja).
unique_item_id (VARCHAR(255), FOREIGN KEY loot(unique_item_id)) — Unikalny identyfikator przedmiotu noszonego przez postać.
Primary Key — (character_id, slot).
13. Tabela: backpack_items
Przechowuje informacje o przedmiotach w plecaku postaci.

Pola:
character_id (INT, FOREIGN KEY characters(id)) — Identyfikator postaci.
backpack_number (INT, NOT NULL) — Numer plecaka.
slot_number (INT, NOT NULL) — Slot w plecaku.
unique_item_id (VARCHAR(255), FOREIGN KEY loot(unique_item_id)) — Unikalny identyfikator przedmiotu.
Primary Key — (character_id, backpack_number, slot_number).