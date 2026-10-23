// Performance-tuned constants for the new particle simulator
export const PARTICLE_RADIUS = 2;
export const PARTICLE_COUNT = 15000;
export const TIME_STEP = 1 / 60;
export const WORLD_WIDTH = 960;
export const WORLD_HEIGHT = 540;
export const MAX_PARTICLES = 100000;
export const GRID_CELL_SIZE = PARTICLE_RADIUS * 2; // Tuned for neighbor search
