// High-performance particle data management and grid-based neighbor search
import { PARTICLE_COUNT, WORLD_WIDTH, WORLD_HEIGHT, PARTICLE_RADIUS, GRID_CELL_SIZE, MAX_PARTICLES } from './constants';
import type { ParticleData, Grid } from './types';

export function createParticles(count: number = PARTICLE_COUNT): ParticleData {
  const x = new Float32Array(MAX_PARTICLES);
  const y = new Float32Array(MAX_PARTICLES);
  const vx = new Float32Array(MAX_PARTICLES);
  const vy = new Float32Array(MAX_PARTICLES);
  for (let i = 0; i < count; ++i) {
    x[i] = Math.random() * (WORLD_WIDTH - 2 * PARTICLE_RADIUS) + PARTICLE_RADIUS;
    y[i] = Math.random() * (WORLD_HEIGHT - 2 * PARTICLE_RADIUS) + PARTICLE_RADIUS;
    const angle = Math.random() * 2 * Math.PI;
    const speed = Math.random() * 100 + 50;
    vx[i] = Math.cos(angle) * speed;
    vy[i] = Math.sin(angle) * speed;
  }
  return { x, y, vx, vy, count };
}

export function createGrid(width: number, height: number, cellSize: number): Grid {
  const cols = Math.ceil(width / cellSize);
  const rows = Math.ceil(height / cellSize);
  const cells: Int32Array[] = [];
  for (let i = 0; i < cols * rows; ++i) cells.push(new Int32Array(256)); // up to 256 particles per cell
  return { cellSize, cols, rows, cells };
}

export function clearGrid(grid: Grid) {
  for (const cell of grid.cells) cell[0] = 0;
}

export function insertParticlesToGrid(particles: ParticleData, grid: Grid) {
  clearGrid(grid);
  for (let i = 0; i < particles.count; ++i) {
    const cx = Math.floor(particles.x[i] / grid.cellSize);
    const cy = Math.floor(particles.y[i] / grid.cellSize);
    const idx = cy * grid.cols + cx;
    const cell = grid.cells[idx];
    const n = cell[0]++;
    cell[n + 1] = i;
  }
}

// Returns a list of neighbor indices for a given particle
export function getNeighbors(i: number, particles: ParticleData, grid: Grid, radius: number): number[] {
  const cx = Math.floor(particles.x[i] / grid.cellSize);
  const cy = Math.floor(particles.y[i] / grid.cellSize);
  const neighbors: number[] = [];
  for (let dx = -1; dx <= 1; ++dx) {
    for (let dy = -1; dy <= 1; ++dy) {
      const ncx = cx + dx;
      const ncy = cy + dy;
      if (ncx < 0 || ncy < 0 || ncx >= grid.cols || ncy >= grid.rows) continue;
      const cell = grid.cells[ncy * grid.cols + ncx];
      const count = cell[0];
      for (let k = 1; k <= count; ++k) {
        const j = cell[k];
        if (j !== i) {
          const dx = particles.x[j] - particles.x[i];
          const dy = particles.y[j] - particles.y[i];
          if (dx * dx + dy * dy < 4 * radius * radius) neighbors.push(j);
        }
      }
    }
  }
  return neighbors;
}
