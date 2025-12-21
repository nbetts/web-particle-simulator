import { TIME_STEP } from './constants';
import { createWorld, createBoundaries, stepWorld } from './physics';
import { createParticles, setParticleRadius, getParticleNeighbors, getParticleColors, applySoftRepulsion, scaleParticleVelocities } from './particles';
import { resizeCanvasToDisplaySize } from './window';
import { vsSource, fsSource } from './shaders';
import { initWebGL, drawCircles } from './webgl';
import { type HUDSettings, loadSettings, setupHUD, DEFAULTS, updateFpsCounter } from './hud';

function main() {
  const canvas = document.getElementById('glcanvas') as HTMLCanvasElement;
  let width = window.innerWidth;
  let height = window.innerHeight;

  // HUD state
  let settings: HUDSettings = loadSettings();
  let paused = settings.paused;
  let particleCount = settings.particleCount;
  let particleEnergy = settings.particleEnergy;
  let particleSize = settings.particleSize;
  let repulsionRadius = settings.repulsionRadius;
  let repulsionSpring = settings.repulsionSpring;

  // WebGL setup
  const webgl = initWebGL(canvas, vsSource, fsSource);

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
      (energy) => {
        // Compute new energy factor
        const oldEnergy = particleEnergy;
        particleEnergy = energy;
        // Map slider value to energy factor (same as in step)
        const oldFactor = Math.pow(5, (oldEnergy - 50) / 25);
        const newFactor = Math.pow(5, (particleEnergy - 50) / 25);
        // Scale velocities so that kinetic energy matches new energy
        if (oldFactor > 0) {
          const scale = newFactor / oldFactor;
          scaleParticleVelocities(particles, scale);
        }
      },
    (size) => {
      particleSize = size;
      setParticleRadius(particles, particleSize);
    },
    (radius) => { repulsionRadius = radius; },
    (spring) => { repulsionSpring = spring; },
    () => {
      paused = DEFAULTS.paused;
      particleCount = DEFAULTS.particleCount;
      particleEnergy = DEFAULTS.particleEnergy;
      particleSize = DEFAULTS.particleSize;
      repulsionRadius = DEFAULTS.repulsionRadius;
      repulsionSpring = DEFAULTS.repulsionSpring;
      if (particles.length !== particleCount) {
        for (let i = particles.length - 1; i >= 0; --i) world.destroyBody(particles[i]);
        particles = createParticles(world, width, height, particleCount, particleSize);
      } else {
        setParticleRadius(particles, particleSize);
      }
    },
    settings
  );

  // FPS counter handled in hud.ts

  function render() {
    resizeCanvasToDisplaySize(canvas);
    width = canvas.width;
    height = canvas.height;
    // Use a fixed world speed range for color mapping
    const minSpeed = 0;
    const maxSpeed = 500; // Adjust as needed for your simulation's expected max speed
    // Map slider value to energy factor (same as in step)
    const energyFactor = Math.pow(5, (particleEnergy - 50) / 25);
    const colors = getParticleColors(particles, minSpeed, maxSpeed, energyFactor);
    const circles = particles.map((body, i) => {
      const pos = body.getPosition();
      const color = colors[i];
      return { x: pos.x, y: pos.y, radius: particleSize, color };
    });
    drawCircles(webgl, circles, width, height);
    // FPS counter
    updateFpsCounter(1 / 60); // Approximate dt for now, or pass actual dt if available
  }

  // Decoupled simulation time
  let lastSimTime = performance.now();
  function step() {
    const now = performance.now();
    let dt = (now - lastSimTime) / 1000;
    lastSimTime = now;
    if (!paused) {
      const energy = Math.pow(5, (particleEnergy - 50) / 25);
      dt *= energy;
      // --- Soft repulsion ---
      const neighbors = getParticleNeighbors(particles, repulsionRadius, width, height);
      applySoftRepulsion(particles, neighbors, repulsionRadius, repulsionSpring);
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
