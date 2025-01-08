import React from 'react';
import GameLayout from '../components/GameLayout';

const HomePage: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <GameLayout />
    </div>
  );
};

export default HomePage;