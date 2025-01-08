// types.ts

export enum ItemQuality {
  Common = 'common',
  Uncommon = 'uncommon',
  Rare = 'rare',
  Epic = 'epic',
  Legendary = 'legendary'
}

export interface CharacterData {
  id: number;
  name: string;
  level: number;
  profession: string;
  battle_position: number;
  health: {
    current: number;
    max: number;
  };
  mana: {
    current: number;
    max: number;
  };
  energy: {
    current: number;
    max: number;
  };
  experience: {
    current: number;
    max: number;
  };
  gold: number;
  premiumCurrency: number;
  stats: {
    strength: number;
    dexterity: number;
    intelligence: number;
    charisma: number;
  };
  combat: {
    attack: number;
    armor: number;
    speed: number;
    resistances: number[];
  };
  position: {
    x: number;
    y: number;
    mapId: number;
  };
  equipment: {
    helmet: Item | null;
    ring: Item | null;
    necklace: Item | null;
    gloves: Item | null;
    mainHand: Item | null;
    armor: Item | null;
    offHand: Item | null;
    socket: Item | null;
    boots: Item | null;
  };
  backpacks: BackpackItem[][];
  skills: Array<{ name: string; level: number }>;
  backpack_slots: number;
  free_slots: number;
}

export interface BackpackItem {
  id: number;
  name: string;
  // Możesz dodać więcej pól, jeśli są potrzebne
}

export interface EnemyData {
  id: number;
  name: string;
  level: number;
  profession: string;
  health: number;
  maxHealth: number;
  battle_position: number;
  x_coord?: number;
  y_coord?: number;
  combat: {
    attack: number;
    armor: number;
    speed: number;
  };
}

export interface MapData {
  id: number;
  name: string;
  width: number;
  height: number;
  collisions: { x_coord: number; y_coord: number }[];
  npcs: { npc_id: number; name: string; x_coord: number; y_coord: number }[];
  monsters: { id: number; name: string; level: number; profession: string; health: number; maxHealth: number; battle_position: number; x_coord: number; y_coord: number }[];
  transitions: { id: number; from_x_coord: number; from_y_coord: number; to_map_id: number; to_x_coord: number; to_y_coord: number }[];
  boundaries?: {
    x_min: number;
    x_max: number;
    y_min: number;
    y_max: number;
  };
}

export interface Item {
  id: number;
  name: string;
  rarity: ItemQuality;
  item_type_id: number;
  strength: number;
  dexterity: number;
  intelligence: number;
  defense: number;
  magic_defense: number;
  speed: number;
  critical_hit_chance: number;
  magic_critical_hit_chance: number;
  dodge_chance: number;
  fire_resistance: number;
  air_resistance: number;
  cold_resistance: number;
  poison_resistance: number;
  crit_resistance: number;
  enemy_speed_reduction: number;
  armor_reduction: number;
  mana_reduction: number;
  health_regeneration: number;
  mana_regeneration: number;
  slow_resistance: number;
  crit_damage_reduction: number;
  life_drain_protection: number;
  vampirism: number;
  armor: number;
  attack: number;
  life: number;
  elemental_damage_type: 'fire' | 'air' | 'cold' | 'poison' | 'none';
  physical_crit_damage: number;
  magic_crit_damage: number;
  divine_bonus_id: number | null;
  required_level: number;
  profession_id: number | null;
  icon: string | null;
}

export interface LootItem {
  id: number;
  name: string;
  rarity: ItemQuality;
  type: string;
  value: number;
  icon: string | null;
  required_level: number;
  profession_id: number | null;
  strength?: number;
  dexterity?: number;
  intelligence?: number;
  defense?: number;
  attack?: number;
  life?: number;
  armor?: number;
}

export type LootItems = LootItem[];