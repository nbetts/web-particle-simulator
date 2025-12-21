// Scale all particle velocities by a factor
export function scaleParticleVelocities(particles: planck.Body[], factor: number) {
  for (const body of particles) {
    const v = body.getLinearVelocity();
    body.setLinearVelocity(planck.Vec2(v.x * factor, v.y * factor));
  }
}
// Get color for each particle based on absolute speed and a fixed world speed range
// Color by on-screen speed (velocity × energy factor)
export function getParticleColors(
  particles: planck.Body[],
  minSpeed: number,
  maxSpeed: number,
  energyFactor: number = 1
): [number, number, number][] {
  return particles.map(body => {
    const v = body.getLinearVelocity();
    const speed = Math.sqrt(v.x * v.x + v.y * v.y) * energyFactor;
    return speedToColor(speed, minSpeed, maxSpeed);
  });
}
// Apply soft repulsion between overlapping particles
export function applySoftRepulsion(
  particles: planck.Body[],
  neighbors: number[][],
  radius: number,
  k: number = 1000 // spring constant for repulsion
) {
  for (let i = 0; i < particles.length; ++i) {
    const a = particles[i];
    const posA = a.getPosition();
    for (const j of neighbors[i]) {
      if (j < i) continue; // avoid double force
      const b = particles[j];
      const posB = b.getPosition();
      const dx = posB.x - posA.x;
      const dy = posB.y - posA.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const minDist = radius * 2;
      if (dist < minDist && dist > 0.0001) {
        const overlap = minDist - dist;
        // Repulsive force (quadratic/exponential growth)
        const force = k * overlap * overlap;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        // Apply equal and opposite impulses (force * dt, but dt is handled by planck)
        a.applyLinearImpulse(planck.Vec2(-fx, -fy), posA, true);
        b.applyLinearImpulse(planck.Vec2(fx, fy), posB, true);
      }
    }
  }
}
// Uniform grid for neighbor search
export function getParticleNeighbors(
  particles: planck.Body[],
  radius: number,
  width: number,
  height: number
): number[][] {
  // Cell size is 2x the max radius (so neighbors are always in adjacent cells)
  const cellSize = radius * 2;
  const grid = new Map<string, number[]>();
  const getCellKey = (x: number, y: number) => `${Math.floor(x / cellSize)},${Math.floor(y / cellSize)}`;
  // Assign particles to grid cells
  for (let i = 0; i < particles.length; ++i) {
    const pos = particles[i].getPosition();
    const key = getCellKey(pos.x, pos.y);
    if (!grid.has(key)) grid.set(key, []);
    grid.get(key)!.push(i);
  }
  // For each particle, find neighbors in same and adjacent cells
  const neighbors: number[][] = [];
  for (let i = 0; i < particles.length; ++i) {
    const pos = particles[i].getPosition();
    const cx = Math.floor(pos.x / cellSize);
    const cy = Math.floor(pos.y / cellSize);
    const n: number[] = [];
    for (let dx = -1; dx <= 1; ++dx) {
      for (let dy = -1; dy <= 1; ++dy) {
        const key = `${cx + dx},${cy + dy}`;
        const cell = grid.get(key);
        if (cell) {
          for (const j of cell) {
            if (j !== i) n.push(j);
          }
        }
      }
    }
    neighbors.push(n);
  }
  return neighbors;
}
// Change the radius of all particles in-place
export function setParticleRadius(particles: planck.Body[], radius: number) {
  for (const body of particles) {
    // Remove all existing fixtures
    let fixture = body.getFixtureList();
    while (fixture) {
      const next = fixture.getNext();
      body.destroyFixture(fixture);
      fixture = next;
    }
    // Add new fixture with new radius
    body.createFixture(planck.Circle(radius), {
      restitution: 1,
      friction: 0,
      density: 1,
    });
  }
}
import planck from 'planck-js';
import { PARTICLE_RADIUS, VELOCITY_RANGE } from './constants';

export function randomBetween(a: number, b: number) {
  return a + Math.random() * (b - a);
}

export function createParticles(world: planck.World, width: number, height: number, count: number, radius: number = PARTICLE_RADIUS): planck.Body[] {
  const particles: planck.Body[] = [];
  for (let i = 0; i < count; ++i) {
    const x = randomBetween(radius, width - radius);
    const y = randomBetween(radius, height - radius);
    const vx = randomBetween(-VELOCITY_RANGE, VELOCITY_RANGE);
    const vy = randomBetween(-VELOCITY_RANGE, VELOCITY_RANGE);
    const body = world.createDynamicBody(planck.Vec2(x, y));
    body.createFixture(planck.Circle(radius), {
      restitution: 1,
      friction: 0,
      density: 1,
    });
    body.setLinearVelocity(planck.Vec2(vx, vy));
    particles.push(body);
  }
  return particles;
}

export function getParticleSpeeds(particles: planck.Body[]): number[] {
  return particles.map(body => {
    const v = body.getLinearVelocity();
    return Math.sqrt(v.x * v.x + v.y * v.y);
  });
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function speedToColor(speed: number, minSpeed: number, maxSpeed: number): [number, number, number] {
  // Normalize speed to [0, 1]
  const t = Math.max(0, Math.min(1, (speed - minSpeed) / (maxSpeed - minSpeed)));
  if (t < 0.5) {
    // Blue (0,0,1) to Orange (1,0.5,0)
    const tt = t / 0.5;
    return [lerp(0, 1, tt), lerp(0, 0.5, tt), lerp(1, 0, tt)];
  } else {
    // Orange (1,0.5,0) to Yellow (1,1,0)
    const tt = (t - 0.5) / 0.5;
    return [1, lerp(0.5, 1, tt), 0];
  }
}
