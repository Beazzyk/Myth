import React, { useEffect, useRef } from 'react';
import { CharacterData, EnemyData } from '../types';

interface BattleWindowProps {
  playerData: CharacterData;
  enemyData: EnemyData;
  onAttack: () => void;
  onMoveForward: () => void;
  onMoveBackward: () => void;
  onClose: () => void;
  battleLog: string[];
  currentTurn: 'player' | 'enemy';
  playerPosition: number;
  enemyPosition: number;
  timeLeft: number;
}

const BattleWindow: React.FC<BattleWindowProps> = ({
  playerData,
  enemyData,
  onAttack,
  onMoveForward,
  onMoveBackward,
  onClose,
  battleLog,
  currentTurn,
  playerPosition,
  enemyPosition,
  timeLeft,
}) => {
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [battleLog]);

  const calculateHpPercentage = (current: number, max: number) => {
    return Math.round((current / max) * 100);
  };

  const renderBattleField = () => {
    const positions = [1, 2, 3];
    return (
      <div className="flex justify-between items-center h-32 bg-gray-200 my-4">
        {positions.map(pos => (
          <div key={pos} className="w-1/3 h-full flex items-center justify-center">
            {playerPosition === pos && (
              <div className="relative">
                <img src="/images/outfit/bm.gif" alt="player" className="w-16 h-16" />
                <div className="absolute top-full left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1">
                  {playerData.name}
                </div>
              </div>
            )}
            {enemyPosition === pos && (
              <div className="relative">
                <img src="/images/monster/wolf.gif" alt="enemy" className="w-16 h-16" />
                <div className="absolute top-full left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1">
                  {enemyData.name}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-4 rounded-lg w-3/4 h-3/4 flex flex-col">
        <h2 className="text-2xl font-bold mb-4">Walka</h2>
        
        {renderBattleField()}

        <div className="flex justify-between mb-4">
          <div>
            <p>{playerData.name} (HP: {calculateHpPercentage(playerData.health.current, playerData.health.max)}%)</p>
            <p>MANA: {playerData.mana.current} / {playerData.mana.max}</p>
            <p>ENERGIA: {playerData.energy.current} / {playerData.energy.max}</p>
          </div>
          <div>
            <p>{enemyData.name} (HP: {calculateHpPercentage(enemyData.health, enemyData.maxHealth)}%)</p>
          </div>
        </div>

        <div className="flex-grow overflow-y-auto mb-4 p-2 bg-gray-100 rounded" ref={logRef}>
          {battleLog.map((log, index) => (
            <p key={index} className="mb-1">{log}</p>
          ))}
        </div>

        <div className="flex justify-between items-center mb-4">
          <button 
            onClick={onAttack} 
            disabled={currentTurn !== 'player'}
            className="bg-red-500 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            Atak
          </button>
          <button 
            onClick={onMoveForward} 
            disabled={currentTurn !== 'player' || playerPosition >= 3}
            className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            Krok do przodu
          </button>
          <button 
            onClick={onMoveBackward} 
            disabled={currentTurn !== 'player' || playerPosition <= 1}
            className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            Krok do tyłu
          </button>
          <p>Czas na ruch: {timeLeft}s</p>
        </div>

        <button onClick={onClose} className="bg-gray-500 text-white px-4 py-2 rounded">
          Zamknij
        </button>
      </div>
    </div>
  );
};

export default BattleWindow;