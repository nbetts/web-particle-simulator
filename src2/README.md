# src2: High-Performance Particle Simulator

This is a new implementation focused on maximum performance for large particle counts (50,000–100,000+ at 60 FPS).

## Key Features
- **Typed arrays** for all particle data (no Planck.js)
- **Grid-based neighbor search** on the GPU for fast collision candidate lookup
- **CPU-side elastic collision resolution**
- **Instanced rendering** with WebGL2 for minimal draw calls
- **Minimal per-frame allocations**
- **Highly tuned for modern browsers and hardware**

## Main Files
- `main.ts` — Entry point
- `sim.ts` — Simulation loop
- `particles.ts` — Particle data and grid logic
- `collisions.ts` — Elastic collision resolution
- `webgl.ts` — Instanced rendering helpers
- `shaders.ts` — GLSL shaders
- `constants.ts` — Tunable simulation constants
- `types.ts` — Type definitions

## Usage
- Add to your build (e.g. Vite, Webpack)
- Open in a browser supporting WebGL2
- Adjust constants for your hardware
