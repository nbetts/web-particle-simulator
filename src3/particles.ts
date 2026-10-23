import { createFloatTexture, createFramebuffer } from './webgl';

const NUM_PARTICLES = 10000;
const TEXTURE_SIZE = Math.ceil(Math.sqrt(NUM_PARTICLES));

function generateInitialTextureData() {
  // RGBA32F: [x, y, vx, vy] per texel
  const data = new Float32Array(TEXTURE_SIZE * TEXTURE_SIZE * 4);
  for (let i = 0; i < NUM_PARTICLES; ++i) {
    data[i * 4 + 0] = Math.random() * 2 - 1; // x
    data[i * 4 + 1] = Math.random() * 2 - 1; // y
    data[i * 4 + 2] = (Math.random() * 2 - 1) * 0.1; // vx
    data[i * 4 + 3] = (Math.random() * 2 - 1) * 0.1; // vy
  }
  // Remaining texels are zero
  return data;
}

export function initParticles(gl: WebGL2RenderingContext) {
  // Two textures for ping-ponging: [pos, vel] packed in RGBA
  const texA = createFloatTexture(gl, TEXTURE_SIZE, TEXTURE_SIZE, generateInitialTextureData());
  const texB = createFloatTexture(gl, TEXTURE_SIZE, TEXTURE_SIZE);
  const fboA = createFramebuffer(gl, texA);
  const fboB = createFramebuffer(gl, texB);
  return {
    textures: [texA, texB],
    fbos: [fboA, fboB],
    textureSize: TEXTURE_SIZE,
    numParticles: NUM_PARTICLES,
  };
}
