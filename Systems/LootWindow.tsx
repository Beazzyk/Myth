import React from 'react';
import { LootItem } from '../types';

interface LootWindowProps {
  loot: LootItem[];
  onClose: () => void;
  onLootTake: (item: LootItem) => void;
}

const LootWindow: React.FC<LootWindowProps> = ({ loot, onClose, onLootTake }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-4 rounded-lg w-1/2">
        <h2 className="text-2xl font-bold mb-4">Zdobyte łupy</h2>
        {loot.length === 0 ? (
          <p>Nie znaleziono żadnych przedmiotów.</p>
        ) : (
          <ul className="mb-4">
            {loot.map((item, index) => (
              <li key={index} className="flex justify-between items-center mb-2 p-2 bg-gray-100 rounded">
                <div className="flex items-center">
                  {item.icon && <img src={item.icon} alt={item.name} className="w-8 h-8 mr-2" />}
                  <span className={`font-bold ${item.rarity === 'legendary' ? 'text-orange-500' : item.rarity === 'epic' ? 'text-purple-500' : item.rarity === 'rare' ? 'text-blue-500' : item.rarity === 'uncommon' ? 'text-green-500' : 'text-gray-500'}`}>
                    {item.name}
                  </span>
                </div>
                <button 
                  onClick={() => onLootTake(item)} 
                  className="bg-green-500 text-white px-2 py-1 rounded text-sm"
                >
                  Weź
                </button>
              </li>
            ))}
          </ul>
        )}
        <button onClick={onClose} className="bg-blue-500 text-white px-4 py-2 rounded">
          Zamknij
        </button>
      </div>
    </div>
  );
};

export default LootWindow;