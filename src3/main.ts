import { initWebGL, createProgram, createFullscreenQuadVAO } from './webgl';
import { initParticles } from './particles';
import { pbdIntegrateFragmentShader, pbdConstraintFragmentShader, pbdFragmentShader } from './shaders';

// --- Texture/FBO-based PBD simulation pipeline ---
function main() {
  const canvas = document.getElementById('glcanvas') as HTMLCanvasElement;
  const gl = initWebGL(canvas);
  const { textures, fbos, textureSize, numParticles } = initParticles(gl);

  // Programs for simulation passes
  const quadVS = `#version 300 es
  layout(location=0) in vec2 a_position;
  out vec2 v_texCoord;
  void main() {
    v_texCoord = a_position * 0.5 + 0.5;
    gl_Position = vec4(a_position, 0, 1);
  }`;
  const integrateProgram = createProgram(gl, quadVS, pbdIntegrateFragmentShader);
  const constraintProgram = createProgram(gl, quadVS, pbdConstraintFragmentShader);

  // Fullscreen quad VAO
  const quadVAO = createFullscreenQuadVAO(gl);

  // --- Particle rendering program ---
  // Vertex shader: fetches position/velocity from texture
  const renderVS = `#version 300 es
  precision highp float;
  layout(location=0) in float a_index;
  uniform sampler2D u_particleTex;
  uniform float u_textureSize;
  uniform float u_renderRadius;
  out float v_speed;
  void main() {
    float idx = a_index;
    float x = mod(idx, u_textureSize);
    float y = floor(idx / u_textureSize);
    vec2 uv = (vec2(x, y) + 0.5) / u_textureSize;
    vec4 state = texture(u_particleTex, uv);
    vec2 pos = state.xy;
    vec2 vel = state.zw;
    v_speed = length(vel);
    gl_PointSize = 2.0 * u_renderRadius;
    gl_Position = vec4(pos, 0, 1);
  }`;
  // Use the existing pbdFragmentShader for color
  const renderProgram = createProgram(gl, renderVS, pbdFragmentShader);

  // Buffer of indices for instanced rendering
  const particleIndices = new Float32Array(numParticles);
  for (let i = 0; i < numParticles; ++i) particleIndices[i] = i;
  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, particleIndices, gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  // VAO for rendering particles
  const renderVAO = gl.createVertexArray();
  gl.bindVertexArray(renderVAO);
  gl.bindBuffer(gl.ARRAY_BUFFER, indexBuffer);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 1, gl.FLOAT, false, 0, 0);
  gl.bindVertexArray(null);

  let readIdx = 0, writeIdx = 1;
  const dt = 0.016;
  const particleRadiusPx = 12.0;
  const solverIterations = 2;

  function simPass(program: WebGLProgram, uniforms: Record<string, any>) {
    gl.useProgram(program);
    gl.bindVertexArray(quadVAO);
    for (const [name, value] of Object.entries(uniforms)) {
      const loc = gl.getUniformLocation(program, name);
      if (typeof value === 'number') gl.uniform1f(loc, value);
      else if (value instanceof WebGLTexture) {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, value);
        gl.uniform1i(loc, 0);
      }
    }
    gl.viewport(0, 0, textureSize, textureSize);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    gl.bindVertexArray(null);
    gl.useProgram(null);
  }

  function step() {
    // Integrate
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbos[writeIdx]);
    simPass(integrateProgram, {
      u_particleTex: textures[readIdx],
      u_dt: dt,
    });
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    [readIdx, writeIdx] = [writeIdx, readIdx];

    // Constraint (collision) passes
    for (let iter = 0; iter < solverIterations; ++iter) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbos[writeIdx]);
      simPass(constraintProgram, {
        u_particleTex: textures[readIdx],
        u_radius: (2.0 * particleRadiusPx) / Math.min(canvas.width, canvas.height),
        u_textureSize: textureSize,
      });
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      [readIdx, writeIdx] = [writeIdx, readIdx];
    }
  }

  // Rendering: sample positions/velocities from texture and draw points
  function render() {
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(renderProgram);
    gl.bindVertexArray(renderVAO);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textures[readIdx]);
    gl.uniform1i(gl.getUniformLocation(renderProgram, 'u_particleTex'), 0);
    gl.uniform1f(gl.getUniformLocation(renderProgram, 'u_textureSize'), textureSize);
    gl.uniform1f(gl.getUniformLocation(renderProgram, 'u_renderRadius'), particleRadiusPx);
    gl.drawArrays(gl.POINTS, 0, numParticles);
    gl.bindVertexArray(null);
    gl.useProgram(null);
  }

  function loop() {
    step();
    render();
    requestAnimationFrame(loop);
  }

  loop();
}

document.addEventListener('DOMContentLoaded', main);
