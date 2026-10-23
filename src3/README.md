# src3: GPU-Only PBD Particle Simulation

This folder implements a true GPU-based Position Based Dynamics (PBD) particle simulation. All particle state and constraint solving (including collisions) are performed entirely on the GPU using WebGL2 transform feedback, with no per-frame CPU upload of particle data.

## Key Features
- All simulation steps (integration, constraint solving, collisions) on the GPU
- No CPU-to-GPU position upload per frame
- Multiple PBD solver passes per frame for stability
- Designed for high particle counts (thousands+)

## Main Files
- `main.ts`: Entry point, simulation loop
- `particles.ts`: Particle system logic, GPU buffer management
- `shaders.ts`: GLSL shader sources for simulation and rendering
- `webgl.ts`: WebGL2 context and helpers
- `types.ts`: Type definitions
