// Main simulation loop: update, collision, and rendering
import { PARTICLE_RADIUS, PARTICLE_COUNT, TIME_STEP, WORLD_WIDTH, WORLD_HEIGHT, GRID_CELL_SIZE } from './constants';
import { createParticles, createGrid, insertParticlesToGrid } from './particles';
import { resolveCollisions } from './collisions';
import { createWebGLContext, createParticleProgram, createParticleBuffers, updateInstanceBuffer, drawParticles } from './webgl';
import { particleVertexShader, particleFragmentShader } from './shaders';
import { getNeighbors } from './particles';
import { updateFpsCounter } from './hud';

export function startSimulation(canvas: HTMLCanvasElement) {
  // Setup
  const gl = createWebGLContext(canvas);
  const program = createParticleProgram(gl, particleVertexShader, particleFragmentShader);
  const { quadVBO, posVBO } = createParticleBuffers(gl);
  const particles = createParticles(PARTICLE_COUNT);
  const grid = createGrid(WORLD_WIDTH, WORLD_HEIGHT, GRID_CELL_SIZE);

  function step(dt: number) {
    // Move particles
    for (let i = 0; i < particles.count; ++i) {
      particles.x[i] += particles.vx[i] * dt;
      particles.y[i] += particles.vy[i] * dt;
      // Wall bounce
      if (particles.x[i] < PARTICLE_RADIUS) {
        particles.x[i] = PARTICLE_RADIUS;
        particles.vx[i] *= -1;
      } else if (particles.x[i] > WORLD_WIDTH - PARTICLE_RADIUS) {
        particles.x[i] = WORLD_WIDTH - PARTICLE_RADIUS;
        particles.vx[i] *= -1;
      }
      if (particles.y[i] < PARTICLE_RADIUS) {
        particles.y[i] = PARTICLE_RADIUS;
        particles.vy[i] *= -1;
      } else if (particles.y[i] > WORLD_HEIGHT - PARTICLE_RADIUS) {
        particles.y[i] = WORLD_HEIGHT - PARTICLE_RADIUS;
        particles.vy[i] *= -1;
      }
    }
    // Grid and collisions
    insertParticlesToGrid(particles, grid);
    resolveCollisions(particles, { ...grid, getNeighbors });
  }

  // Main loop
  let last = performance.now();
  function loop() {
    const now = performance.now();
    let dt = (now - last) / 1000;
    let frameDt = dt;
    last = now;
    let steps = Math.floor(dt / TIME_STEP);
    let remainder = dt % TIME_STEP;
    for (let i = 0; i < steps; ++i) step(TIME_STEP);
    if (remainder > 0) step(remainder);
    // Render
    updateInstanceBuffer(gl, posVBO, particles.x, particles.y, particles.count);
    drawParticles(gl, program, quadVBO, posVBO, particles.count, PARTICLE_RADIUS, WORLD_WIDTH, WORLD_HEIGHT);
    updateFpsCounter(frameDt);
    requestAnimationFrame(loop);
  }
  loop();
}
