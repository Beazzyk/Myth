import React, { useState } from 'react';
import { DollarSign, Crown, User, Swords, Trophy, Gem, Book, Users, Map, Settings, Menu } from 'lucide-react';
import { CharacterData } from '../types';
import ProgressBar from './rightpanel/ProgressBar';
import InfoIcon from './rightpanel/InfoIcon';
import InterfaceIcon from './rightpanel/InterfaceIcon';
import Backpack from './rightpanel/Backpack';
import EquipmentSlot from './rightpanel/EquipmentSlot';

interface RightPanelProps {
  playerId: number;
  characterData: CharacterData | null;
}

const RightPanel: React.FC<RightPanelProps> = ({ playerId, characterData }) => {
  const [activeInfo, setActiveInfo] = useState<number>(0);
  const [activeBackpack, setActiveBackpack] = useState<number>(0);

  if (!characterData) {
    return <div className="w-64 bg-green-900 p-4 text-white">Loading character data...</div>;
  }

  const renderInfo = () => {
    switch (activeInfo) {
      case 0:
        return (
          <div>
            <div className="flex flex-col text-sm">
              <div className="flex items-center mb-1"><span>SIŁA: {characterData.stats.strength}</span></div>
              <div className="flex items-center mb-1"><span>ZRĘCZNOŚĆ: {characterData.stats.dexterity}</span></div>
              <div className="flex items-center mb-1"><span>INTELEKT: {characterData.stats.intelligence}</span></div>
              <div className="flex items-center mb-1"><span>CHARYZMA: {characterData.stats.charisma}</span></div>
            </div>
          </div>
        );
      case 1:
        return (
          <div>
            <div className="flex flex-col text-sm">
              <div className="flex items-center mb-1"><span>ATAK: {characterData.combat.attack}</span></div>
              <div className="flex items-center mb-1"><span>PANCERZ: {characterData.combat.armor}</span></div>
              <div className="flex items-center mb-1"><span>SZYBKOŚĆ: {characterData.combat.speed}</span></div>
              <div className="flex items-center mb-1"><span>ODPORNOŚĆ: {characterData.combat.resistances.join(' / ')}</span></div>
            </div>
          </div>
        );
      case 2:
      case 3:
        return <div>Informacje o osiągnięciach</div>;
      default:
        return <div>Wybierz ikonę, aby zobaczyć informacje.</div>;
    }
  };

  return (
    <div className="right-panel-container" style={{
      position: 'absolute',
      top: '0',
      right: '0',
      width: '256px',
      height: '100%',
      backgroundColor: 'rgba(0,0,0,0.5)',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      padding: '10px',
      boxSizing: 'border-box',
    }}>
      <div className="mb-4 text-center">
        <h2 className="text-lg font-bold">{`${characterData.name} ${characterData.level} ${characterData.profession}`}</h2>
      </div>

      <ProgressBar 
        value={characterData.health?.current ?? 0} 
        max={characterData.health?.max ?? 1} 
        color="bg-red-600" 
      />
      <ProgressBar 
        value={characterData.experience?.current ?? 0} 
        max={characterData.experience?.max ?? 1} 
        color="bg-yellow-400" 
      />

      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center">
          <DollarSign className="w-5 h-5 mr-2" />
          <span>{characterData.gold.toLocaleString()}</span>
        </div>
        <div className="flex items-center">
          <Crown className="w-5 h-5 mr-2" />
          <span>{(characterData.premiumCurrency ?? 0).toLocaleString()}</span>
        </div>
      </div>

      <div className="flex justify-center mb-4">
        <div className="grid grid-cols-3 gap-1">
          <div></div>
          <EquipmentSlot item={characterData.equipment.helmet} />
          <div></div>
          <EquipmentSlot item={characterData.equipment.ring} />
          <EquipmentSlot item={characterData.equipment.necklace} />
          <EquipmentSlot item={characterData.equipment.gloves} />
          <EquipmentSlot item={characterData.equipment.mainHand} />
          <EquipmentSlot item={characterData.equipment.armor} />
          <EquipmentSlot item={characterData.equipment.offHand} />
          <EquipmentSlot item={characterData.equipment.socket} />
          <EquipmentSlot item={characterData.equipment.boots} />
          <div></div>
        </div>
      </div>

      <div className="mb-4">
        <h3 className="mb-3">Plecak:</h3>
        <Backpack 
          backpack={characterData.backpacks[activeBackpack] || []} 
          isLocked={false} 
          totalSlots={characterData.backpack_slots}
        />
        <div className="flex mt-2">
          {[0, 1, 2].map((index) => (
            <button
              key={index}
              className={`flex-1 py-1 ${activeBackpack === index ? 'bg-green-700' : 'bg-green-800'}`}
              onClick={() => setActiveBackpack(index)}
            >
              Plecak {index + 1}
            </button>
          ))}
        </div>
      </div>

      <div className="flex mb-4 mx-2">
        <div className="flex flex-col">
          <InfoIcon icon={<Swords size={16} />} onClick={() => setActiveInfo(0)} isActive={activeInfo === 0} />
          <InfoIcon icon={<User size={16} />} onClick={() => setActiveInfo(1)} isActive={activeInfo === 1} />
          <InfoIcon icon={<Trophy size={16} />} onClick={() => setActiveInfo(2)} isActive={activeInfo === 2} />
          <InfoIcon icon={<Gem size={16} />} onClick={() => setActiveInfo(3)} isActive={activeInfo === 3} />
        </div>
        <div className="bg-green-800 p-2 rounded flex-1 text-sm">
          {renderInfo()}
        </div>
      </div>

      <div className="flex justify-between mt-auto">
        <InterfaceIcon icon={<Book size={20} />} onClick={() => console.log('Skills')} />
        <InterfaceIcon icon={<Users size={20} />} onClick={() => console.log('Lista znajomych')} />
        <InterfaceIcon icon={<Map size={20} />} onClick={() => console.log('Mapa')} />
        <InterfaceIcon icon={<Settings size={20} />} onClick={() => console.log('Ustawienia')} />
        <InterfaceIcon icon={<Menu size={20} />} onClick={() => console.log('Menu')} />
      </div>
    </div>
  );
};

export default RightPanel;