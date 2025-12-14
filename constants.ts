import { ParticleType, ParticleColor, SimulationConfig } from './types';

export const CONFIG: SimulationConfig = {
  width: 160,
  height: 120,
  cellSize: 5,
};

export const PARTICLE_COLORS: Record<ParticleType, ParticleColor | null> = {
  [ParticleType.VOID]: null,
  [ParticleType.SAND]: { h: 48, s: 85, l: 55 },
  [ParticleType.WATER]: { h: 210, s: 75, l: 58 },
  [ParticleType.STONE]: { h: 220, s: 5, l: 55 },
};

export const CANVAS_WIDTH = CONFIG.width * CONFIG.cellSize;
export const CANVAS_HEIGHT = CONFIG.height * CONFIG.cellSize;