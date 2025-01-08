import React from 'react';
import { MapData, EnemyData } from '../types';

interface InteractionHandlerProps {
  mapData: MapData | null;
  position: { x: number; y: number };
  cameraOffset: { x: number; y: number };
  onMonsterInteraction: (monster: EnemyData) => void;
  onNpcInteraction: (npc: any) => void;
  onTransition: (newMapId: number) => void;
}

const InteractionHandler: React.FC<InteractionHandlerProps> = ({
  mapData,
  position,
  cameraOffset,
  onMonsterInteraction,
  onNpcInteraction,
  onTransition,
}) => {
  // Handles the logic of clicking on specific map elements (monsters, NPCs, transitions)
  const handleInteractionClick = (clickX: number, clickY: number) => {
    if (mapData) {
      console.log('Interaction at:', clickX, clickY);

      // Check if the player clicked on a monster
      const clickedMonster = mapData.monsters.find(monster => monster.x_coord === clickX && monster.y_coord === clickY);
      // Check if the player clicked on an NPC
      const clickedNpc = mapData.npcs.find(npc => npc.x_coord === clickX && npc.y_coord === clickY);
      // Check if the player clicked on a transition point
      const clickedTransition = mapData.transitions.find(transition => transition.from_x_coord === clickX && transition.from_y_coord === clickY);

      // Handle monster interaction
      if (clickedMonster) {
        console.log('Clicked monster:', clickedMonster);
        const enemyData: EnemyData = {
          id: clickedMonster.id,
          name: clickedMonster.name,
          level: clickedMonster.level,
          profession: clickedMonster.profession,
          health: clickedMonster.health,
          maxHealth: clickedMonster.maxHealth,
          battle_position: clickedMonster.battle_position,
          combat: {
            attack: clickedMonster.attack || 10,
            armor: clickedMonster.armor || 5,
            speed: clickedMonster.speed || 5,
          },
        };
        onMonsterInteraction(enemyData);
      }
      // Handle NPC interaction
      else if (clickedNpc) {
        console.log('Clicked NPC:', clickedNpc);
        onNpcInteraction(clickedNpc);
      }
      // Handle transition to another map
      else if (clickedTransition) {
        console.log('Clicked Transition:', clickedTransition);
        onTransition(clickedTransition.to_map_id);
      }
    }
  };

  // Handles the player clicking on the map
  const handleMapClick = (event: React.MouseEvent) => {
    if (!mapData) return;
  
    const rect = event.currentTarget.getBoundingClientRect();
  
    // Używamy TILE_WIDTH i TILE_HEIGHT do obliczenia pozycji kliknięcia
    const clickX = Math.floor((event.clientX - rect.left + cameraOffset.x) / 32);
    const clickY = Math.floor((event.clientY - rect.top + cameraOffset.y) / 48);
  
    console.log('Clicked at:', clickX, clickY);
  
    handleInteractionClick(clickX, clickY);
  };
  

  return (
    <div 
      className="absolute inset-0" 
      onClick={handleMapClick}
      style={{ pointerEvents: 'all' }}
    />
  );
};

export default InteractionHandler;