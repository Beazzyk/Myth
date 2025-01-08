import React from 'react';

interface ProgressBarProps {
  value: number;
  max: number;
  color: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ value, max, color }) => {
  const percentage = Math.floor((value / max) * 100);
  
  return (
    <div className="relative w-full h-4 bg-gray-800 rounded-full overflow-hidden">
      <div className={`absolute left-0 top-0 h-full ${color}`} style={{ width: `${percentage}%` }}></div>
      <span className="absolute inset-0 flex justify-center items-center text-white text-xs">{percentage}%</span>
    </div>
  );
};

export default ProgressBar;
