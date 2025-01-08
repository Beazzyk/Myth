import React from 'react';

interface PlayerCoordinatesProps {
  x: number;
  y: number;
  mapName: string;
}

const PlayerCoordinates: React.FC<PlayerCoordinatesProps> = ({ x, y, mapName }) => {
  return (
    <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white p-2 rounded">
      <p>X: {x}, Y: {y}</p>
      <p>Mapa: {mapName}</p>
    </div>
  );
};

export default PlayerCoordinates;