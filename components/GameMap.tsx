import React, { useState, useEffect, useRef } from 'react';
import MapRenderer from './MapRenderer';
import InteractionHandler from './InteractionHandler';
import PlayerCoordinates from './PlayerCoordinates';
import useKeyboardMovement from '../hooks/useKeyboardMovement';
import { useMapData, useCharacterData } from '../utils/DataFetcher';
import { MapData, CharacterData, EnemyData, LootItem } from '../types';
import DialogueWindow from './DialogueWindow';
import BattleSystem from '../Systems/BattleSystem';

interface GameMapProps {
  playerId: number;
  mapId: number;
  onMapChange: (newMapId: number, newMapName: string) => void;
  onBattleStart: (enemy: EnemyData) => void;
  onLootOpen: (items: LootItem[]) => void;
  onCharacterDataUpdate: (updatedData: CharacterData) => void; 
}

const GameMap: React.FC<GameMapProps> = ({ 
  playerId, 
  mapId, 
  onMapChange, 
  onBattleStart, 
  onLootOpen,
  onCharacterDataUpdate 
}) => {
  const { mapData, setMapData } = useMapData(mapId);
  const { characterData, setCharacterData } = useCharacterData(playerId);
  const [isBattleOpen, setIsBattleOpen] = useState(false);
  const [isDialogueOpen, setIsDialogueOpen] = useState(false);
  const [selectedMonster, setSelectedMonster] = useState<EnemyData | null>(null);
  const [selectedNpc, setSelectedNpc] = useState<any>(null);
  const [cameraOffset, setCameraOffset] = useState({ x: 0, y: 0 });
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const { position, direction, isMoving, setPosition } = useKeyboardMovement({
    mapData: mapData || { width: 0, height: 0, collisions: [], npcs: [], monsters: [], transitions: [] },
    initialPosition: characterData?.position || { x: 0, y: 0 },
  });

  useEffect(() => {
    if (characterData?.position && characterData.position.x !== 0 && characterData.position.y !== 0) {
      console.log('Setting initial position:', characterData.position);
      setPosition(characterData.position);
    }
  }, [characterData?.position, setPosition]);

  useEffect(() => {
    if (characterData && mapData && (characterData.position.x !== position.x || characterData.position.y !== position.y)) {
      setCharacterData(prev => ({
        ...prev,
        position: { ...position, mapId },
      }));

      fetch('http://localhost:3001/api/characters/move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ characterId: playerId, ...position, mapId }),
      });
    }
  }, [position, mapId, characterData, setCharacterData, playerId, mapData]);

  useEffect(() => {
    const updateCameraOffset = () => {
      if (mapContainerRef.current && mapData) {
        const containerWidth = mapContainerRef.current.clientWidth;
        const containerHeight = mapContainerRef.current.clientHeight;
        const tileSize = 32;
  
        const maxOffsetX = Math.max(0, mapData.width * tileSize - containerWidth);
        const maxOffsetY = Math.max(0, mapData.height * tileSize - containerHeight);
  
        let newOffsetX = position.x * tileSize - containerWidth / 2;
        let newOffsetY = position.y * tileSize - containerHeight / 2;
  
        newOffsetX = Math.max(0, Math.min(newOffsetX, maxOffsetX));
        newOffsetY = Math.max(0, Math.min(newOffsetY, maxOffsetY));
  
        setCameraOffset({ x: newOffsetX, y: newOffsetY });
      }
    };
  
    updateCameraOffset();
    window.addEventListener('resize', updateCameraOffset);
    return () => window.removeEventListener('resize', updateCameraOffset);
  }, [position, mapData]);

  const handleBattleStart = (monster: any) => {
    console.log('Starting battle with monster:', monster);
    const enemyData: EnemyData = {
      ...monster,
      combat: {
        attack: monster.attack || 0,
        armor: monster.armor || 0,
        speed: monster.speed || 0,
      }
    };
    setSelectedMonster(enemyData);
    setIsBattleOpen(true);
    onBattleStart(enemyData);
  };

  const handleLootOpen = (items: LootItem[]) => {
    console.log('GameMap: Otwieranie okna lootu z przedmiotami:', items);
    onLootOpen(items);
  };

  const handleDialogueStart = (npc: any) => {
    setSelectedNpc(npc);
    setIsDialogueOpen(true);
  };

  const handleBattleEnd = () => {
    console.log('Battle ended');
    setIsBattleOpen(false);
    setSelectedMonster(null);
  };

  const handleMapClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!mapContainerRef.current || !mapData) return;

    const rect = mapContainerRef.current.getBoundingClientRect();
    const clickX = Math.floor((event.clientX - rect.left + cameraOffset.x) / 32);
    const clickY = Math.floor((event.clientY - rect.top + cameraOffset.y) / 32);

    console.log('Clicked at:', clickX, clickY);

    const clickedNpc = mapData.npcs.find(npc => npc.x_coord === clickX && npc.y_coord === clickY);
    const clickedMonster = mapData.monsters.find(monster => monster.x_coord === clickX && monster.y_coord === clickY);
    const clickedTransition = mapData.transitions.find(t => t.from_x_coord === clickX && t.from_y_coord === clickY);

    if (clickedNpc) {
      console.log('Clicked NPC:', clickedNpc);
      handleDialogueStart(clickedNpc);
    } else if (clickedMonster) {
      console.log('Clicked Monster:', clickedMonster);
      handleBattleStart(clickedMonster);
    } else if (clickedTransition) {
      console.log('Clicked Transition:', clickedTransition);
      onMapChange(clickedTransition.to_map_id, 'New Map');
    }
  };

  if (!mapData || !characterData) return <div>Loading...</div>;

  return (
    <div 
      ref={mapContainerRef}
      className="game-map-container"
      onClick={handleMapClick}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        cursor: 'pointer',
      }}
    >
      <MapRenderer
        mapData={mapData}
        characterData={{
          ...characterData,
          position: { ...position, mapId },
          direction,
          isMoving,
        }}
        cameraOffset={cameraOffset}
        viewportWidth={mapContainerRef.current?.clientWidth || 900}
        viewportHeight={mapContainerRef.current?.clientHeight || 600}
      />
      <InteractionHandler
        mapData={mapData}
        position={position}
        cameraOffset={cameraOffset}
        onMonsterInteraction={handleBattleStart}
        onNpcInteraction={handleDialogueStart}
        onTransition={(newMapId) => onMapChange(newMapId, 'New Map')}
      />
      {isBattleOpen && selectedMonster && characterData && (
        <BattleSystem
          playerData={characterData}
          enemyId={selectedMonster.id}
          onBattleEnd={handleBattleEnd}
          onCharacterDataUpdate={onCharacterDataUpdate}
          onLootOpen={handleLootOpen}
        />
      )}
      {isDialogueOpen && selectedNpc && (
        <DialogueWindow
          npc={selectedNpc}
          onClose={() => setIsDialogueOpen(false)}
        />
      )}
      <PlayerCoordinates 
        x={position.x} 
        y={position.y} 
        mapName={mapData?.name || 'Nieznana'}
      />
    </div>
  );
};

export default GameMap;