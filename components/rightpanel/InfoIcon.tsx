import React from 'react';

interface InfoIconProps {
  icon: React.ReactNode;
  onClick: () => void;
  isActive: boolean;
}

const InfoIcon: React.FC<InfoIconProps> = ({ icon, onClick, isActive }) => (
  <div
    className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer ${isActive ? 'bg-green-500' : 'bg-green-800'} hover:bg-green-700`}
    onClick={onClick}
  >
    {icon}
  </div>
);

export default InfoIcon;
