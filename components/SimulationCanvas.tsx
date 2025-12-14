import React, { useRef, useEffect, useCallback } from 'react';
import { ParticleType } from '../types';
import { CONFIG, PARTICLE_COLORS } from '../constants';

interface SimulationCanvasProps {
  selectedMaterial: ParticleType;
  brushSize: number;
  isPaused?: boolean;
  onClearTrigger?: number;
}

const SimulationCanvas: React.FC<SimulationCanvasProps> = ({
  selectedMaterial,
  brushSize,
  isPaused = false,
  onClearTrigger,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Simulation State Refs (Mutable for performance)
  const gridRef = useRef<number[][]>([]);
  const isStaticRef = useRef<boolean[][]>([]);
  const colorNoiseRef = useRef<number[][]>([]);
  const requestRef = useRef<number>(0);
  
  // Input State Refs
  const isMouseDownRef = useRef(false);
  const mousePosRef = useRef({ x: 0, y: 0 });

  const initGrid = useCallback(() => {
    const grid: number[][] = [];
    const isStatic: boolean[][] = [];
    const colorNoise: number[][] = [];

    for (let y = 0; y < CONFIG.height; y++) {
      grid[y] = [];
      isStatic[y] = [];
      colorNoise[y] = [];
      for (let x = 0; x < CONFIG.width; x++) {
        grid[y][x] = ParticleType.VOID;
        isStatic[y][x] = false;
        colorNoise[y][x] = (Math.random() - 0.5) * 20;
      }
    }
    gridRef.current = grid;
    isStaticRef.current = isStatic;
    colorNoiseRef.current = colorNoise;
  }, []);

  // Watch for clear trigger
  useEffect(() => {
    if (onClearTrigger !== undefined && onClearTrigger > 0) {
      initGrid();
    }
  }, [onClearTrigger, initGrid]);

  // Initial setup
  useEffect(() => {
    initGrid();
  }, [initGrid]);

  // Game Logic Functions (Ported and optimized)
  const inBounds = (x: number, y: number) => {
    return x >= 0 && x < CONFIG.width && y >= 0 && y < CONFIG.height;
  };

  const isEmpty = (x: number, y: number) => {
    return inBounds(x, y) && gridRef.current[y][x] === ParticleType.VOID;
  };

  const isWater = (x: number, y: number) => {
    return inBounds(x, y) && gridRef.current[y][x] === ParticleType.WATER;
  };

  const swapCells = (x1: number, y1: number, x2: number, y2: number) => {
    const grid = gridRef.current;
    const noise = colorNoiseRef.current;
    const stat = isStaticRef.current;

    const tempType = grid[y1][x1];
    const tempNoise = noise[y1][x1];
    const tempStatic = stat[y1][x1];

    grid[y1][x1] = grid[y2][x2];
    noise[y1][x1] = noise[y2][x2];
    stat[y1][x1] = stat[y2][x2];

    grid[y2][x2] = tempType;
    noise[y2][x2] = tempNoise;
    stat[y2][x2] = tempStatic;
  };

  const moveCell = (fromX: number, fromY: number, toX: number, toY: number) => {
    const grid = gridRef.current;
    const noise = colorNoiseRef.current;
    const stat = isStaticRef.current;

    grid[toY][toX] = grid[fromY][fromX];
    noise[toY][toX] = noise[fromY][fromX];
    stat[toY][toX] = stat[fromY][fromX];

    grid[fromY][fromX] = ParticleType.VOID;
    stat[fromY][fromX] = false;
  };

  const updateSand = (x: number, y: number) => {
    const below = y + 1;
    if (below >= CONFIG.height) return false;

    // Fall straight
    if (isEmpty(x, below)) {
      moveCell(x, y, x, below);
      return true;
    }
    if (isWater(x, below)) {
      swapCells(x, y, x, below);
      return true;
    }

    const dir = Math.random() < 0.5 ? -1 : 1;
    const diag1 = x + dir;
    const diag2 = x - dir;

    // Diagonals
    if (inBounds(diag1, below)) {
      if (isEmpty(diag1, below)) {
        moveCell(x, y, diag1, below);
        return true;
      }
      if (isWater(diag1, below)) {
        swapCells(x, y, diag1, below);
        return true;
      }
    }

    if (inBounds(diag2, below)) {
      if (isEmpty(diag2, below)) {
        moveCell(x, y, diag2, below);
        return true;
      }
      if (isWater(diag2, below)) {
        swapCells(x, y, diag2, below);
        return true;
      }
    }
    return false;
  };

  const updateWater = (x: number, y: number) => {
    const below = y + 1;
    
    // Fall
    if (below < CONFIG.height && isEmpty(x, below)) {
      moveCell(x, y, x, below);
      return true;
    }

    // Diagonal Fall
    const dir = Math.random() < 0.5 ? -1 : 1;
    if (below < CONFIG.height) {
      if (isEmpty(x + dir, below)) {
        moveCell(x, y, x + dir, below);
        return true;
      }
      if (isEmpty(x - dir, below)) {
        moveCell(x, y, x - dir, below);
        return true;
      }
    }

    // Spread
    const spreadDir = Math.random() < 0.5 ? -1 : 1;
    const canSpreadPrimary = isEmpty(x + spreadDir, y);
    const canSpreadSecondary = isEmpty(x - spreadDir, y);

    if (canSpreadPrimary && canSpreadSecondary) {
      moveCell(x, y, x + spreadDir, y);
      return true;
    } else if (canSpreadPrimary) {
      moveCell(x, y, x + spreadDir, y);
      return true;
    } else if (canSpreadSecondary) {
      moveCell(x, y, x - spreadDir, y);
      return true;
    }

    return false;
  };

  const updateStone = (x: number, y: number) => {
    if (isStaticRef.current[y][x]) return false;

    const below = y + 1;
    if (below < CONFIG.height) {
      if (isEmpty(x, below)) {
        moveCell(x, y, x, below);
        return true;
      }
      if (isWater(x, below)) {
        swapCells(x, y, x, below);
        return true;
      }
    }

    isStaticRef.current[y][x] = true;
    return false;
  };

  const updateSimulation = useCallback(() => {
    const grid = gridRef.current;
    const leftToRight = Math.random() < 0.5;

    for (let y = CONFIG.height - 2; y >= 0; y--) {
      if (leftToRight) {
        for (let x = 0; x < CONFIG.width; x++) {
            const type = grid[y][x];
            if (type === ParticleType.SAND) updateSand(x, y);
            else if (type === ParticleType.WATER) updateWater(x, y);
            else if (type === ParticleType.STONE) updateStone(x, y);
        }
      } else {
        for (let x = CONFIG.width - 1; x >= 0; x--) {
            const type = grid[y][x];
            if (type === ParticleType.SAND) updateSand(x, y);
            else if (type === ParticleType.WATER) updateWater(x, y);
            else if (type === ParticleType.STONE) updateStone(x, y);
        }
      }
    }
  }, []);

  const paintParticles = useCallback(() => {
    if (!isMouseDownRef.current) return;

    const { x: centerX, y: centerY } = mousePosRef.current;
    const radiusSq = brushSize * brushSize;
    const grid = gridRef.current;
    const isStatic = isStaticRef.current;
    const colorNoise = colorNoiseRef.current;

    for (let dy = -brushSize; dy <= brushSize; dy++) {
      for (let dx = -brushSize; dx <= brushSize; dx++) {
        if (dx * dx + dy * dy > radiusSq) continue;

        const x = centerX + dx;
        const y = centerY + dy;

        if (!inBounds(x, y)) continue;
        if (Math.random() > 0.75) continue; // Noise for natural brush

        if (selectedMaterial === ParticleType.VOID) {
          grid[y][x] = ParticleType.VOID;
          isStatic[y][x] = false;
        } else if (grid[y][x] === ParticleType.VOID) {
          grid[y][x] = selectedMaterial;
          isStatic[y][x] = false;
          colorNoise[y][x] = (Math.random() - 0.5) * 25;
        }
      }
    }
  }, [brushSize, selectedMaterial]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear background - white for retro feel
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const grid = gridRef.current;
    const noise = colorNoiseRef.current;

    for (let y = 0; y < CONFIG.height; y++) {
      for (let x = 0; x < CONFIG.width; x++) {
        const type = grid[y][x];
        if (type !== ParticleType.VOID) {
          const base = PARTICLE_COLORS[type];
          if (base) {
            const n = noise[y][x];
            const l = Math.max(25, Math.min(75, base.l + n));
            const s = Math.max(0, Math.min(100, base.s + n * 0.5));
            ctx.fillStyle = `hsl(${base.h}, ${s}%, ${l}%)`;
            ctx.fillRect(x * CONFIG.cellSize, y * CONFIG.cellSize, CONFIG.cellSize, CONFIG.cellSize);
          }
        }
      }
    }
  }, []);

  // Main Loop
  const loop = useCallback(() => {
    if (!isPaused) {
        paintParticles();
        updateSimulation();
        draw();
    }
    requestRef.current = requestAnimationFrame(loop);
  }, [isPaused, paintParticles, updateSimulation, draw]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(loop);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [loop]);

  // Input Handling Helpers
  const getGridPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    const scaleX = CONFIG.width / rect.width;
    const scaleY = CONFIG.height / rect.height;

    const x = Math.floor((clientX - rect.left) * scaleX);
    const y = Math.floor((clientY - rect.top) * scaleY);

    return { 
        x: Math.max(0, Math.min(CONFIG.width - 1, x)), 
        y: Math.max(0, Math.min(CONFIG.height - 1, y)) 
    };
  };

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault(); // Prevent scrolling on touch
    isMouseDownRef.current = true;
    mousePosRef.current = getGridPos(e);
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    // e.preventDefault(); 
    mousePosRef.current = getGridPos(e);
  };

  const handleEnd = () => {
    isMouseDownRef.current = false;
  };

  return (
    <canvas
      ref={canvasRef}
      width={CONFIG.width * CONFIG.cellSize}
      height={CONFIG.height * CONFIG.cellSize}
      onMouseDown={handleStart}
      onMouseMove={handleMove}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onTouchStart={handleStart}
      onTouchMove={handleMove}
      onTouchEnd={handleEnd}
      // Added white background specifically for the canvas content area, though draw() handles it
      className="w-full max-w-[800px] h-auto cursor-crosshair touch-none image-pixelated bg-white"
      style={{ imageRendering: 'pixelated' }}
    />
  );
};

export default SimulationCanvas;