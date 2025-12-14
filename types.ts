export enum ParticleType {
  VOID = 0,
  SAND = 1,
  WATER = 2,
  STONE = 3,
}

export interface ParticleColor {
  h: number;
  s: number;
  l: number;
}

export interface SimulationConfig {
  width: number;
  height: number;
  cellSize: number;
}