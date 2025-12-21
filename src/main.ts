import { PARTICLE_RADIUS, TIME_STEP } from './constants';
import { createWorld, createBoundaries, stepWorld } from './physics';
import { createParticles, getParticleSpeeds, speedToColor, setParticleRadius } from './particles';
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
  let timeSpeed = settings.timeSpeed;
  let particleSize = settings.particleSize;

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
    (speed) => { timeSpeed = speed; },
    (size) => {
      particleSize = size;
      // Change the radius of all current particles in-place
      setParticleRadius(particles, particleSize);
    },
    () => {
      paused = DEFAULTS.paused;
      particleCount = DEFAULTS.particleCount;
      timeSpeed = DEFAULTS.timeSpeed;
      particleSize = DEFAULTS.particleSize;
      // Only recreate particles if count changed, otherwise just update radius
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
    // Compute speeds and colors
    const speeds = getParticleSpeeds(particles);
    const minSpeed = Math.min(...speeds);
    const maxSpeed = Math.max(...speeds);
    const circles = particles.map((body, i) => {
      const pos = body.getPosition();
      const color = speedToColor(speeds[i], minSpeed, maxSpeed);
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
      const speed = Math.pow(5, (timeSpeed - 50) / 25);
      dt *= speed;
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
