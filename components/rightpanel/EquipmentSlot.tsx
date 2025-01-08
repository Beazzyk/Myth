import React, { useState } from 'react';
import { Item } from '../../types'; // Upewnij się, że importujesz Item z types.ts

interface EquipmentSlotProps {
  item: Item | null;
}

const EquipmentSlot: React.FC<EquipmentSlotProps> = ({ item }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div
      className="relative bg-green-800 w-10 h-10 border border-green-700 flex items-center justify-center text-xs text-white"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {item ? item.name : '-'}

      {/* Tooltip z informacjami o przedmiocie */}
      {showTooltip && item && (
        <div className="absolute z-10 bg-black text-white p-2 rounded-lg shadow-lg text-sm w-48 top-12 left-0">
          <p><strong>Nazwa:</strong> {item.name}</p>
          <p><strong>Typ:</strong> {item.item_type_id}</p>
          <p><strong>Poziom:</strong> {item.required_level}</p>
          <p><strong>Rzadkość:</strong> {item.rarity}</p>
          <p><strong>Atak:</strong> {item.attack}</p>
          <p><strong>Obrona:</strong> {item.armor}</p>
          <p><strong>Życie:</strong> {item.life}</p>
          <p><strong>Prędkość:</strong> {item.speed}</p>
          {/* Dodaj inne właściwości przedmiotu */}
        </div>
      )}
    </div>
  );
};

export default EquipmentSlot;
