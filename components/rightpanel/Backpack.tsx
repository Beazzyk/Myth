import React from 'react';
import EquipmentSlot from './EquipmentSlot';
import { BackpackItem } from '../../types';

interface BackpackProps {
  backpack: (BackpackItem | null)[];
  isLocked: boolean;
  totalSlots: number;
}

const Backpack: React.FC<BackpackProps> = ({ backpack, isLocked, totalSlots }) => (
  <div className={`grid grid-cols-6 gap-0.5 ${isLocked ? 'opacity-50' : ''}`}>
    {Array(totalSlots).fill(null).map((_, i) => (
      <div key={i} className="bg-green-800 w-8 h-8 border border-green-700 flex items-center justify-center text-xs">
        {isLocked ? (
          <span className="w-4 h-4 text-gray-400">🔒</span>
        ) : (
          backpack && backpack[i] ? <EquipmentSlot item={backpack[i]} /> : '-'
        )}
      </div>
    ))}
  </div>
);

export default Backpack;