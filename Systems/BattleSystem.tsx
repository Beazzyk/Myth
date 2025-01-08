import React, { useState, useEffect } from 'react';
import { CharacterData, EnemyData, LootItem } from '../types';
import BattleWindow from '../components/BattleWindow';
import LootWindow from './LootWindow';

interface BattleSystemProps {
  playerData: CharacterData;
  enemyId: number;
  onBattleEnd: () => void;
  onCharacterDataUpdate: (updatedData: CharacterData) => void;
}

const BattleSystem: React.FC<BattleSystemProps> = ({ 
  playerData, 
  enemyId, 
  onBattleEnd, 
  onCharacterDataUpdate
}) => {
  const [enemyData, setEnemyData] = useState<EnemyData | null>(null);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [currentTurn, setCurrentTurn] = useState<'player' | 'enemy'>('player');
  const [playerHealth, setPlayerHealth] = useState(playerData.health.current);
  const [enemyHealth, setEnemyHealth] = useState(0);
  const [playerPosition, setPlayerPosition] = useState(1);
  const [enemyPosition, setEnemyPosition] = useState(3);
  const [isBattleOver, setIsBattleOver] = useState(false);
  const [turnTimeLeft, setTurnTimeLeft] = useState(15);
  const [playerEnergy, setPlayerEnergy] = useState(playerData.energy.current);
  const [playerMana, setPlayerMana] = useState(playerData.mana.current);
  const [loot, setLoot] = useState<LootItem[]>([]);
  const [showLootWindow, setShowLootWindow] = useState(false);

  useEffect(() => {
    const fetchEnemyData = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/monsters/${enemyId}`);
        const data = await response.json();
        setEnemyData(data);
        setEnemyHealth(data.health);
        setBattleLog(prevLog => [
          ...prevLog,
          `Rozpoczęła się walka pomiędzy ${playerData.name} (${playerData.level} ${playerData.profession}) a ${data.name} (${data.level} ${data.profession})`
        ]);
      } catch (error) {
        console.error('Error fetching enemy data:', error);
      }
    };
    fetchEnemyData();
  }, [enemyId, playerData.name, playerData.level, playerData.profession]);

  useEffect(() => {
    if (currentTurn === 'player') {
      const timer = setInterval(() => {
        setTurnTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            handlePlayerTurnEnd();
            return 15;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [currentTurn]);

  useEffect(() => {
    if (currentTurn === 'enemy' && enemyData) {
      setTimeout(handleEnemyTurn, 1000);
    }
  }, [currentTurn, enemyData]);

  const calculateDamage = (attacker: CharacterData | EnemyData, defender: CharacterData | EnemyData, distance: number) => {
    const baseDamage = attacker.combat?.attack 
      ? Math.floor(Math.random() * (attacker.combat.attack.max - attacker.combat.attack.min + 1)) + attacker.combat.attack.min
      : 0;
  
    const defense = defender.combat?.armor ?? 0;
    
    // Modyfikator obrażeń bazujący na dystansie
    let distanceModifier = 1;
    if (distance === 0) distanceModifier = 1.2; // Bonus za walkę w zwarciu
    else if (distance >= 2) distanceModifier = 0.8; // Kara za walkę z dużej odległości

    const finalDamage = Math.max(1, Math.floor((baseDamage - defense) * distanceModifier));
  
    return finalDamage;
  };

  const handlePlayerAttack = () => {
    if (currentTurn !== 'player' || !enemyData || playerEnergy < 10) return;

    const distance = Math.abs(playerPosition - enemyPosition);
    const damage = calculateDamage(playerData, enemyData, distance);
    const newEnemyHealth = Math.max(0, enemyHealth - damage);
    setEnemyHealth(newEnemyHealth);
    setPlayerEnergy(prev => Math.max(0, prev - 10));
    
    setBattleLog(prevLog => [
      ...prevLog,
      `${playerData.name} zadaje ${damage} obrażeń przeciwnikowi z dystansu ${distance}!`
    ]);

    if (newEnemyHealth <= 0) {
      endBattle();
    } else {
      handlePlayerTurnEnd();
    }
  };

  const handleEnemyTurn = () => {
    if (!enemyData) return;

    // Logika ruchu przeciwnika
    if (Math.abs(playerPosition - enemyPosition) > 1) {
      const direction = playerPosition > enemyPosition ? 1 : -1;
      setEnemyPosition(prev => prev + direction);
      setBattleLog(prevLog => [...prevLog, `${enemyData.name} przemieszcza się w kierunku gracza.`]);
    } else {
      const distance = Math.abs(playerPosition - enemyPosition);
      const damage = calculateDamage(enemyData, playerData, distance);
      const newPlayerHealth = Math.max(0, playerHealth - damage);
      setPlayerHealth(newPlayerHealth);

      setBattleLog(prevLog => [
        ...prevLog,
        `${enemyData.name} zadaje ${damage} obrażeń graczowi z dystansu ${distance}!`
      ]);

      if (newPlayerHealth <= 0) {
        setBattleLog(prevLog => [...prevLog, `Zostałeś pokonany przez ${enemyData.name}!`]);
        setTimeout(() => setIsBattleOver(true), 2000);
        return;
      }
    }

    setCurrentTurn('player');
    setTurnTimeLeft(15);
    setPlayerEnergy(prev => Math.min(playerData.energy.max, prev + 5));
    setPlayerMana(prev => Math.min(playerData.mana.max, prev + 5));
  };

  const handleMove = (direction: 'forward' | 'backward') => {
    if (currentTurn !== 'player' || playerEnergy < 5) return;
    
    if (direction === 'forward' && playerPosition < 3) {
      setPlayerPosition(prev => prev + 1);
      setPlayerEnergy(prev => Math.max(0, prev - 5));
      setBattleLog(prevLog => [...prevLog, `${playerData.name} robi krok do przodu.`]);
    } else if (direction === 'backward' && playerPosition > 1) {
      setPlayerPosition(prev => prev - 1);
      setPlayerEnergy(prev => Math.max(0, prev - 5));
      setBattleLog(prevLog => [...prevLog, `${playerData.name} cofa się o krok.`]);
    }
    
    handlePlayerTurnEnd();
  };

  const handleUseSkill = (skill: string) => {
    // Implementacja użycia umiejętności
    console.log(`Użyto umiejętności: ${skill}`);
    // Tu dodaj logikę zużycia many/energii i efektów umiejętności
    handlePlayerTurnEnd();
  };

  const handlePlayerTurnEnd = () => {
    setCurrentTurn('enemy');
    setTurnTimeLeft(15);
  };

  const endBattle = async () => {
    setBattleLog(prevLog => [...prevLog, `Pokonałeś ${enemyData?.name}!`]);

    try {
      const response = await fetch(`http://localhost:3001/api/loot`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playerId: playerData.id,
          monsterId: enemyId,
          mapId: playerData.position.mapId,
        }),
      });
      const lootData = await response.json();

      if (lootData.loot && lootData.loot.length > 0) {
        setLoot(lootData.loot);
        setShowLootWindow(true);
      } else {
        setIsBattleOver(true);
      }
    } catch (error) {
      console.error('Error fetching loot:', error);
      setIsBattleOver(true);
    }
  };

  const handleLootWindowClose = () => {
    setShowLootWindow(false);
    setIsBattleOver(true);
  };

  if (isBattleOver) {
    onBattleEnd();
    return null;
  }

  return (
    <>
      {enemyData && (
        <BattleWindow
          playerData={{
            ...playerData, 
            health: {current: playerHealth, max: playerData.health.max},
            energy: {current: playerEnergy, max: playerData.energy.max},
            mana: {current: playerMana, max: playerData.mana.max}
          }}
          enemyData={{...enemyData, health: enemyHealth}}
          onAttack={handlePlayerAttack}
          onMoveForward={() => handleMove('forward')}
          onMoveBackward={() => handleMove('backward')}
          onUseSkill={handleUseSkill}
          onClose={onBattleEnd}
          battleLog={battleLog}
          currentTurn={currentTurn}
          playerPosition={playerPosition}
          enemyPosition={enemyPosition}
          timeLeft={turnTimeLeft}
        />
      )}
      {showLootWindow && (
        <LootWindow
          loot={loot}
          onClose={handleLootWindowClose}
          onLootTake={(item) => {
            // Logika dodawania przedmiotu do ekwipunku gracza
            console.log("Dodano przedmiot do ekwipunku:", item);
          }}
        />
      )}
    </>
  );
};

export default BattleSystem;