import { useState, useEffect } from 'react';
import { MapData, CharacterData } from '../types';

export const useMapData = (mapId: number) => {
  const [mapData, setMapData] = useState<MapData | null>(null);

  useEffect(() => {
    const fetchMapData = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/maps/${mapId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch map data');
        }
        const data = await response.json();
        setMapData(data);
      } catch (error) {
        console.error('Error fetching map data:', error);
      }
    };

    fetchMapData();
  }, [mapId]);

  return { mapData, setMapData };
};

export const useCharacterData = (playerId: number) => {
  const [characterData, setCharacterData] = useState<CharacterData | null>(null);

  useEffect(() => {
    const fetchCharacterData = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/characters/${playerId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch character data');
        }
        const data = await response.json();
        setCharacterData(data);
      } catch (error) {
        console.error('Error fetching character data:', error);
      }
    };

    fetchCharacterData();
  }, [playerId]);

  return { characterData, setCharacterData };
};

export const usePlayerSkills = (playerId: number) => {
  const [playerSkills, setPlayerSkills] = useState<any[]>([]);

  useEffect(() => {
    const fetchPlayerSkills = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/skills/${playerId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch player skills');
        }
        const data = await response.json();
        setPlayerSkills(data);
      } catch (error) {
        console.error('Error fetching player skills:', error);
      }
    };

    fetchPlayerSkills();
  }, [playerId]);

  return playerSkills;
};
