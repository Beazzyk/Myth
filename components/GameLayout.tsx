import React, { useState, useEffect } from 'react';
import Chat from './Chat';
import RightPanel from './RightPanel';
import GameMap from './GameMap';
import LootWindow from '../Systems/LootWindow';
import BattleSystem from '../Systems/BattleSystem';
import { CharacterData, LootItem, ItemQuality } from '../types';
import { useCharacterData } from '../utils/DataFetcher';

const GameLayout: React.FC = () => {
  const [currentCharacterId, setCurrentCharacterId] = useState(1);
  const [currentCharacterName, setCurrentCharacterName] = useState("Player");
  const [currentMapId, setCurrentMapId] = useState(1);
  const [currentMapName, setCurrentMapName] = useState("Default Map");
  const [isLootWindowOpen, setIsLootWindowOpen] = useState(false);
  const [lootItems, setLootItems] = useState<LootItem[]>([]);
  const [characterData, setCharacterData] = useState<CharacterData | null>(null);
  const [isBattleActive, setIsBattleActive] = useState(false);
  const [currentEnemyId, setCurrentEnemyId] = useState<number | null>(null);
  const { characterData: fetchedCharacterData } = useCharacterData(currentCharacterId);
  const [pendingLoot, setPendingLoot] = useState<LootItem[] | null>(null);

  useEffect(() => {
    if (fetchedCharacterData) {
      setCharacterData(fetchedCharacterData);
      setCurrentCharacterName(fetchedCharacterData.name);
    }
  }, [fetchedCharacterData]);

  useEffect(() => {
    if (pendingLoot) {
      setIsLootWindowOpen(true);
      setLootItems(pendingLoot);
      setPendingLoot(null);
    }
  }, [pendingLoot]);

  const handleMapChange = (newMapId: number, newMapName: string) => {
    setCurrentMapId(newMapId);
    setCurrentMapName(newMapName);
  };

  const handleBattleStart = (enemy: any) => {
    setCurrentEnemyId(enemy.id);
    setIsBattleActive(true);
  };

  const handleLootOpen = (items: LootItem[]) => {
    console.log('handleLootOpen called with items:', items);
    setPendingLoot(items);
  };

  const handleCharacterDataUpdate = (updatedData: CharacterData) => {
    setCharacterData(updatedData);
  };

  const handleBattleEnd = () => {
    setIsBattleActive(false);
    setCurrentEnemyId(null);
  };

  const handleLootClose = () => {
    setIsLootWindowOpen(false);
    setLootItems([]);
  };

  return (
    <div className="relative flex w-screen h-screen bg-green-950">
      <div className="w-64 min-w-[240px] h-full flex-shrink-0">
        <Chat 
          mapId={currentMapId} 
          characterId={currentCharacterId} 
          characterName={currentCharacterName}
          mapName={currentMapName}
        />
      </div>

      <div className="flex-grow h-full relative overflow-hidden">
        <GameMap 
          playerId={currentCharacterId} 
          mapId={currentMapId} 
          onMapChange={handleMapChange}
          onBattleStart={handleBattleStart}
          onLootOpen={handleLootOpen}
          onCharacterDataUpdate={handleCharacterDataUpdate}
        />
        {isBattleActive && characterData && currentEnemyId !== null && (
          <BattleSystem
            playerData={characterData}
            enemyId={currentEnemyId}
            onBattleEnd={handleBattleEnd}
            onCharacterDataUpdate={handleCharacterDataUpdate}
            onLootOpen={handleLootOpen}
          />
        )}
        {isLootWindowOpen && (
          <LootWindow 
            lootItems={lootItems}
            onAcceptLoot={(acceptedItems) => {
              console.log('Accepted items:', acceptedItems);
              handleLootClose();
            }}
            onRejectLoot={() => {
              console.log('Loot rejected');
              handleLootClose();
            }}
            availableBagSlots={characterData?.free_slots || 0}
          />
        )}
      </div>

      <div className="w-64 min-w-[240px] h-full flex-shrink-0">
        <RightPanel playerId={currentCharacterId} characterData={characterData} />
      </div>
    </div>
  );
};

export default GameLayout;