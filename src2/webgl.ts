// Instanced rendering for high-performance particle drawing
import { PARTICLE_RADIUS, WORLD_WIDTH, WORLD_HEIGHT, MAX_PARTICLES } from './constants';

export function createWebGLContext(canvas: HTMLCanvasElement): WebGL2RenderingContext {
  const gl = canvas.getContext('webgl2', { antialias: false })!;
  gl.clearColor(0, 0, 0, 1);
  gl.viewport(0, 0, canvas.width, canvas.height);
  return gl;
}

export function createParticleProgram(gl: WebGL2RenderingContext, vsSource: string, fsSource: string): WebGLProgram {
  function compile(type: number, src: string) {
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, src);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader)!);
    return shader;
  }
  const vs = compile(gl.VERTEX_SHADER, vsSource);
  const fs = compile(gl.FRAGMENT_SHADER, fsSource);
  const prog = gl.createProgram()!;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog)!);
  return prog;
}

export function createParticleBuffers(gl: WebGL2RenderingContext) {
  // Quad for instancing
  const quad = new Float32Array([
    -1, -1,
    1, -1,
    -1, 1,
    -1, 1,
    1, -1,
    1, 1,
  ]);
  const quadVBO = gl.createBuffer()!;
  gl.bindBuffer(gl.ARRAY_BUFFER, quadVBO);
  gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW);
  // Per-instance attributes
  const posVBO = gl.createBuffer()!;
  gl.bindBuffer(gl.ARRAY_BUFFER, posVBO);
  gl.bufferData(gl.ARRAY_BUFFER, MAX_PARTICLES * 2 * 4, gl.DYNAMIC_DRAW);
  return { quadVBO, posVBO };
}

export function updateInstanceBuffer(gl: WebGL2RenderingContext, posVBO: WebGLBuffer, x: Float32Array, y: Float32Array, count: number) {
  const data = new Float32Array(count * 2);
  for (let i = 0; i < count; ++i) {
    data[2 * i] = x[i];
    data[2 * i + 1] = y[i];
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, posVBO);
  gl.bufferSubData(gl.ARRAY_BUFFER, 0, data);
}

export function drawParticles(gl: WebGL2RenderingContext, program: WebGLProgram, quadVBO: WebGLBuffer, posVBO: WebGLBuffer, count: number, radius: number, width: number, height: number) {
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.useProgram(program);
  // Quad geometry
  gl.bindBuffer(gl.ARRAY_BUFFER, quadVBO);
  const aQuad = gl.getAttribLocation(program, 'aQuad');
  gl.enableVertexAttribArray(aQuad);
  gl.vertexAttribPointer(aQuad, 2, gl.FLOAT, false, 0, 0);
  // Per-instance position
  gl.bindBuffer(gl.ARRAY_BUFFER, posVBO);
  const aPos = gl.getAttribLocation(program, 'aPos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
  (gl as any).vertexAttribDivisor(aPos, 1);
  // Uniforms
  gl.uniform1f(gl.getUniformLocation(program, 'uRadius'), radius);
  gl.uniform2f(gl.getUniformLocation(program, 'uResolution'), width, height);
  // Draw
  (gl as any).drawArraysInstanced(gl.TRIANGLES, 0, 6, count);
  // Cleanup
  (gl as any).vertexAttribDivisor(aPos, 0);
}
