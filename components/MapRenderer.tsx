import React, { useEffect, useRef, useState } from 'react';
import { MapData, CharacterData } from '../types';

interface MapRendererProps {
  mapData: MapData;
  characterData: CharacterData & { direction: number; isMoving: boolean };
  cameraOffset: { x: number; y: number };
  viewportWidth: number;
  viewportHeight: number;
}

const TILE_WIDTH = 32;
const TILE_HEIGHT = 32;
const SPRITE_WIDTH = 32;  // Szerokość pojedynczej klatki sprite'a
const SPRITE_HEIGHT = 48; // Wysokość pojedynczej klatki sprite'a

const MapRenderer: React.FC<MapRendererProps> = ({
  mapData,
  characterData,
  cameraOffset,
  viewportWidth,
  viewportHeight
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentFrame, setCurrentFrame] = useState(0);

  const npcImage = new Image();
  npcImage.src = '/images/npc/tunia.gif';
  
  const monsterImage = new Image();
  monsterImage.src = '/images/monster/wolf.gif';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = viewportWidth;
    canvas.height = viewportHeight;

    const startTileX = Math.floor(cameraOffset.x / TILE_WIDTH);
    const startTileY = Math.floor(cameraOffset.y / TILE_HEIGHT);
    const endTileX = startTileX + Math.ceil(viewportWidth / TILE_WIDTH);
    const endTileY = startTileY + Math.ceil(viewportHeight / TILE_HEIGHT);

    // Czyszczenie canvas przed każdą klatką
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Rysowanie tła
    for (let x = startTileX; x <= endTileX; x++) {
      for (let y = startTileY; y <= endTileY; y++) {
        const drawX = x * TILE_WIDTH - cameraOffset.x;
        const drawY = y * TILE_HEIGHT - cameraOffset.y;
        ctx.fillStyle = 'lightgreen';
        ctx.fillRect(drawX, drawY, TILE_WIDTH, TILE_HEIGHT);
      }
    }

    // Rysowanie kolizji
    mapData.collisions.forEach(collision => {
      const drawX = collision.x_coord * TILE_WIDTH - cameraOffset.x;
      const drawY = collision.y_coord * TILE_HEIGHT - cameraOffset.y;
      ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
      ctx.fillRect(drawX, drawY, TILE_WIDTH, TILE_HEIGHT);
    });

    // Rysowanie NPC
    mapData.npcs.forEach(npc => {
      const drawX = npc.x_coord * TILE_WIDTH - cameraOffset.x;
      const drawY = npc.y_coord * TILE_HEIGHT - cameraOffset.y - (SPRITE_HEIGHT - TILE_HEIGHT); // Przesunięcie o różnicę w wysokości grafiki
      ctx.drawImage(npcImage, drawX, drawY, SPRITE_WIDTH, SPRITE_HEIGHT); // Zmieniamy wysokość na 48, bo grafika ma 48 pikseli
    });

    // Rysowanie potworów
    mapData.monsters.forEach(monster => {
      const drawX = monster.x_coord * TILE_WIDTH - cameraOffset.x;
      const drawY = monster.y_coord * TILE_HEIGHT - cameraOffset.y - (SPRITE_HEIGHT - TILE_HEIGHT); // Przesunięcie o różnicę w wysokości grafiki
      ctx.drawImage(monsterImage, drawX, drawY, SPRITE_WIDTH, SPRITE_HEIGHT); // Zmieniamy wysokość na 48, bo grafika ma 48 pikseli
    });

    // Rysowanie przejść
    mapData.transitions.forEach(transition => {
      const drawX = transition.from_x_coord * TILE_WIDTH - cameraOffset.x;
      const drawY = transition.from_y_coord * TILE_HEIGHT - cameraOffset.y;
      ctx.fillStyle = 'purple';
      ctx.fillRect(drawX, drawY, TILE_WIDTH, TILE_HEIGHT);
    });

    // Rysowanie postaci gracza
    const playerSprite = new Image();
    playerSprite.src = '/images/outfit/bm.gif'; // Zakładamy, że to jest Twój sprite sheet

    playerSprite.onload = () => {
      const spriteX = currentFrame * SPRITE_WIDTH; // Klatka animacji (0-3)
      let spriteY = 0; // Wiersz zależny od kierunku

      // Zmieniamy wiersz sprite sheet'a w zależności od kierunku
      if (characterData.direction === 0) {
        spriteY = 0; // Idzie w dół
      } else if (characterData.direction === 1) {
        spriteY = SPRITE_HEIGHT; // Idzie w lewo (wiersz 1)
      } else if (characterData.direction === 2) {
        spriteY = 2 * SPRITE_HEIGHT; // Idzie w prawo (wiersz 2)
      } else if (characterData.direction === 3) {
        spriteY = 3 * SPRITE_HEIGHT; // Idzie w górę (wiersz 3)
      }

      const drawX = characterData.position.x * TILE_WIDTH - cameraOffset.x;
      const drawY = characterData.position.y * TILE_HEIGHT - cameraOffset.y - (SPRITE_HEIGHT - TILE_HEIGHT); // Przesunięcie o różnicę w wysokości

      ctx.drawImage(
        playerSprite,
        spriteX, spriteY, // Kluczowe: wyciągamy odpowiednią klatkę
        SPRITE_WIDTH, SPRITE_HEIGHT, // Rozmiar wyciętej klatki
        drawX, drawY, // Pozycja na mapie
        SPRITE_WIDTH, SPRITE_HEIGHT // Rozmiar sprite'a na mapie
      );
    };
  }, [mapData, characterData, currentFrame, cameraOffset, viewportWidth, viewportHeight]);

  useEffect(() => {
    if (characterData.isMoving) {
      const interval = setInterval(() => {
        setCurrentFrame(prev => (prev + 1) % 4); // Klatki animacji (0-3)
      }, 1); // Czas między klatkami
      return () => clearInterval(interval);
    } else {
      setCurrentFrame(0); // Resetowanie animacji, gdy postać się zatrzymuje
    }
  }, [characterData.isMoving]);

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />;
};

export default MapRenderer;
