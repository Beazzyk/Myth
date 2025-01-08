import React from 'react';

interface InterfaceIconProps {
  icon: React.ReactNode;
  onClick: () => void;
}

const InterfaceIcon: React.FC<InterfaceIconProps> = ({ icon, onClick }) => (
  <div className="bg-green-800 w-10 h-10 rounded-full flex items-center justify-center cursor-pointer hover:bg-green-700" onClick={onClick}>
    {icon}
  </div>
);

export default InterfaceIcon;
