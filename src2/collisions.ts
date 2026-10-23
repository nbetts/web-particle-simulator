// Elastic collision resolution for particles using typed arrays
import type { ParticleData } from './types';
import { PARTICLE_RADIUS } from './constants';

// Resolves elastic collisions for all particles using the grid neighbor search
export function resolveCollisions(particles: ParticleData, grid: any) {
  const r = PARTICLE_RADIUS;
  for (let i = 0; i < particles.count; ++i) {
    // Only check each pair once
    const neighbors = grid.getNeighbors(i, particles, grid, r);
    for (const j of neighbors) {
      if (j < i) continue;
      const dx = particles.x[j] - particles.x[i];
      const dy = particles.y[j] - particles.y[i];
      const distSq = dx * dx + dy * dy;
      const minDist = 2 * r;
      if (distSq < minDist * minDist && distSq > 0) {
        const dist = Math.sqrt(distSq);
        // Overlap correction (move apart)
        const overlap = 0.5 * (minDist - dist);
        const nx = dx / dist;
        const ny = dy / dist;
        particles.x[i] -= nx * overlap;
        particles.y[i] -= ny * overlap;
        particles.x[j] += nx * overlap;
        particles.y[j] += ny * overlap;
        // Elastic velocity swap (equal mass)
        const dvx = particles.vx[j] - particles.vx[i];
        const dvy = particles.vy[j] - particles.vy[i];
        const vn = dvx * nx + dvy * ny;
        if (vn < 0) {
          const impulse = vn;
          particles.vx[i] += nx * impulse;
          particles.vy[i] += ny * impulse;
          particles.vx[j] -= nx * impulse;
          particles.vy[j] -= ny * impulse;
        }
      }
    }
  }
}
