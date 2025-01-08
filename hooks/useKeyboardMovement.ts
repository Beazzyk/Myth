import { useState, useEffect, useCallback, useRef } from 'react';
import { MapData } from '../types';

interface UseKeyboardMovementProps {
  mapData: Partial<MapData>;
  initialPosition: { x: number; y: number };
}

const useKeyboardMovement = ({ mapData, initialPosition }: UseKeyboardMovementProps) => {
  const [position, setPosition] = useState(initialPosition);
  const [direction, setDirection] = useState(0); // 0: dół, 1: lewo, 2: prawo, 3: góra
  const [isMoving, setIsMoving] = useState(false);

  // Trzymamy informacje o wciśniętym klawiszu
  const heldKeys = useRef<{ [key: string]: boolean }>({});
  const movementInterval = useRef<NodeJS.Timeout | null>(null);

  const isValidMove = useCallback(
    (x: number, y: number) => {
      if (x < 0 || x >= (mapData.width || 0) || y < 0 || y >= (mapData.height || 0)) return false;
      if (mapData.collisions?.some(c => c.x_coord === x && c.y_coord === y)) return false;
      if (mapData.npcs?.some(npc => npc.x_coord === x && npc.y_coord === y)) return false;
      if (mapData.monsters?.some(m => m.x_coord === x && m.y_coord === y)) return false;
      return true;
    },
    [mapData]
  );

  const move = useCallback(
    (dx: number, dy: number) => {
      const newX = position.x + dx;
      const newY = position.y + dy;
      if (
        isValidMove(newX, newY) &&
        newX >= 0 &&
        newX < mapData.width &&
        newY >= 0 &&
        newY < mapData.height
      ) {
        setPosition({ x: newX, y: newY });
        setIsMoving(true);
        setTimeout(() => setIsMoving(false), 20); // Szybkość animacji (można dostosować)
      }
    },
    [position, isValidMove, mapData.width, mapData.height]
  );

  const startMoving = useCallback(() => {
    if (movementInterval.current) return; // Unikaj wielu interwałów na raz

    movementInterval.current = setInterval(() => {
      if (heldKeys.current['ArrowUp'] || heldKeys.current['w']) {
        setDirection(3);
        move(0, -1);
      }
      if (heldKeys.current['ArrowDown'] || heldKeys.current['s']) {
        setDirection(0);
        move(0, 1);
      }
      if (heldKeys.current['ArrowLeft'] || heldKeys.current['a']) {
        setDirection(1);
        move(-1, 0);
      }
      if (heldKeys.current['ArrowRight'] || heldKeys.current['d']) {
        setDirection(2);
        move(1, 0);
      }
    }, 100); // Częstotliwość ruchu
  }, [move]);

  const stopMoving = useCallback(() => {
    if (movementInterval.current) {
      clearInterval(movementInterval.current);
      movementInterval.current = null;
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      heldKeys.current[e.key] = true;

      // Zmieniamy kierunek od razu po krótkim naciśnięciu klawisza
      if (e.key === 'ArrowUp' || e.key === 'w') {
        setDirection(3);
      } else if (e.key === 'ArrowDown' || e.key === 's') {
        setDirection(0);
      } else if (e.key === 'ArrowLeft' || e.key === 'a') {
        setDirection(1);
      } else if (e.key === 'ArrowRight' || e.key === 'd') {
        setDirection(2);
      }

      startMoving();
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      heldKeys.current[e.key] = false;

      // Jeśli żaden klawisz nie jest wciśnięty, zatrzymujemy ruch
      if (
        !heldKeys.current['ArrowUp'] &&
        !heldKeys.current['ArrowDown'] &&
        !heldKeys.current['ArrowLeft'] &&
        !heldKeys.current['ArrowRight'] &&
        !heldKeys.current['w'] &&
        !heldKeys.current['a'] &&
        !heldKeys.current['s'] &&
        !heldKeys.current['d']
      ) {
        stopMoving();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      stopMoving(); // Upewnij się, że interwał zostanie wyczyszczony po odmontowaniu
    };
  }, [startMoving, stopMoving]);

  return { position, direction, isMoving, setPosition };
};

export default useKeyboardMovement;
