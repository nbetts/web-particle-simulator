import { TIME_STEP } from './constants';
import { createWorld, createBoundaries, stepWorld } from './physics';
import { createParticles, setParticleRadius, getParticleNeighbors, applySoftRepulsion, getParticleEnergies, getParticleColorsByEnergy } from './particles';
import { resizeCanvasToDisplaySize } from './window';
import { particleVertexShader, particleFragmentShaders } from './shaders';
import { initWebGL, drawCircles } from './webgl';
import { type HUDSettings, loadSettings, setupHUD, updateFpsCounter } from './hud';

function main() {
  const canvas = document.getElementById('glcanvas') as HTMLCanvasElement;
  let width = window.innerWidth;
  let height = window.innerHeight;

  // HUD state
  let settings: HUDSettings = loadSettings();
  let paused = settings.paused;
  let particleCount = settings.particleCount;
  let particleSize = settings.particleSize;
  let repulsionRadius = settings.repulsionRadius;
  let repulsionSpring = settings.repulsionSpring;
  let shader = particleFragmentShaders[settings.shader];

  // WebGL setup
  let webgl = initWebGL(canvas, particleVertexShader, shader);

  // Planck.js world
  let world = createWorld();
  createBoundaries(world, width, height);
  let particles = createParticles(world, width, height, particleCount);

  // HUD logic
  setupHUD(
    (p) => { paused = p; },
    (count) => {
      particleCount = count;
      // Adjust particle count dynamically
      const current = particles.length;
      if (particleCount > current) {
        const newParticles = createParticles(world, width, height, particleCount - current, particleSize);
        particles.push(...newParticles);
      } else if (particleCount < current) {
        for (let i = current - 1; i >= particleCount; --i) {
          world.destroyBody(particles[i]);
          particles.pop();
        }
      }
    },
    (size) => {
      particleSize = size;
      setParticleRadius(particles, particleSize);
    },
    (radius) => { repulsionRadius = radius; },
    (spring) => { repulsionSpring = spring; },
    () => {
      // Randomise all particles: destroy and recreate
      for (let i = particles.length - 1; i >= 0; --i) world.destroyBody(particles[i]);
      particles = createParticles(world, width, height, particleCount, particleSize);
    },
    (shader) => {
      webgl = initWebGL(canvas, particleVertexShader, particleFragmentShaders[shader]);
    },
    settings
  );

  function render() {
    resizeCanvasToDisplaySize(canvas);
    width = canvas.width;
    height = canvas.height;
    // Compute neighbors for energy calculation
    const absRepulsionRadius = repulsionRadius * particleSize;
    const neighbors = getParticleNeighbors(particles, absRepulsionRadius, width, height);
    // Compute total energy (kinetic + potential) for each particle
    const energies = getParticleEnergies(particles, neighbors, absRepulsionRadius, repulsionSpring);
    // Use a fixed energy range for color mapping
    const minEnergy = 0;
    const maxEnergy = 100000; // Adjust as needed for your simulation's expected max energy
    const colors = getParticleColorsByEnergy(energies, minEnergy, maxEnergy);
    const circles = particles.map((body, i) => {
      const pos = body.getPosition();
      const color = colors[i];
      return { x: pos.x, y: pos.y, radius: particleSize, color };
    });
    drawCircles(webgl, circles, width, height);
  }

  // Decoupled simulation time
  let lastSimTime = performance.now();
  function step() {
    const now = performance.now();
    let dt = (now - lastSimTime) / 1000;
    let frameDt = dt;
    lastSimTime = now;
    if (!paused) {
      // --- Soft repulsion ---
      // Repulsion radius is now a multiplier of particle size
      const absRepulsionRadius = repulsionRadius * particleSize;
      const neighbors = getParticleNeighbors(particles, absRepulsionRadius, width, height);
      applySoftRepulsion(particles, neighbors, absRepulsionRadius, repulsionSpring);
      // Step simulation in fixed increments for stability
      let simSteps = Math.floor(dt / TIME_STEP);
      let simRemainder = dt % TIME_STEP;
      for (let i = 0; i < simSteps; ++i) {
        stepWorld(world, TIME_STEP);
      }
      if (simRemainder > 0) {
        stepWorld(world, simRemainder);
      }
    }
    render();
    updateFpsCounter(frameDt);
    requestAnimationFrame(step);
  }

  window.addEventListener('resize', () => {
    width = window.innerWidth;
    height = window.innerHeight;
    createBoundaries(world, width, height);
  });

  step();
}

main();
