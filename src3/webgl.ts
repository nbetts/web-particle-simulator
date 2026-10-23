// Creates a VAO for a fullscreen quad (for texture-based simulation passes)
export function createFullscreenQuadVAO(gl: WebGL2RenderingContext) {
  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  const vbo = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  // 2D positions for a quad covering [-1,1]x[-1,1]
  const verts = new Float32Array([
    -1, -1,  1, -1,  -1, 1,
    -1,  1,  1, -1,   1, 1
  ]);
  gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  gl.bindVertexArray(null);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  return vao;
}
// Utility to create a floating-point RGBA texture
export function createFloatTexture(gl: WebGL2RenderingContext, width: number, height: number, data?: Float32Array) {
  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(
    gl.TEXTURE_2D, 0, gl.RGBA32F, width, height, 0,
    gl.RGBA, gl.FLOAT, data || null
  );
  gl.bindTexture(gl.TEXTURE_2D, null);
  return tex;
}

// Utility to create a framebuffer for a texture
export function createFramebuffer(gl: WebGL2RenderingContext, tex: WebGLTexture) {
  const fbo = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  return fbo;
}
export function initWebGL(canvas: HTMLCanvasElement): WebGL2RenderingContext {
  resizeCanvasToDisplaySize(canvas);
  const gl = canvas.getContext('webgl2', { antialias: false });
  if (!gl) throw new Error('WebGL2 not supported');
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  // Enable float color buffer support for RGBA32F rendering
  const ext = gl.getExtension('EXT_color_buffer_float');
  if (!ext) {
    throw new Error('EXT_color_buffer_float not supported: required for rendering to RGBA32F textures');
  }
  return gl;
}

// Ensures the canvas drawing buffer matches the displayed size (for HiDPI/Retina)
export function resizeCanvasToDisplaySize(canvas: HTMLCanvasElement) {
  const dpr = window.devicePixelRatio || 1;
  const displayWidth = Math.round(canvas.clientWidth * dpr);
  const displayHeight = Math.round(canvas.clientHeight * dpr);
  if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
    canvas.width = displayWidth;
    canvas.height = displayHeight;
  }
}
export function createShader(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error('Shader compile failed: ' + gl.getShaderInfoLog(shader));
  }
  return shader;
}

export function createProgram(gl: WebGL2RenderingContext, vsSource: string, fsSource: string, feedbackVaryings?: string[]): WebGLProgram {
  const vs = createShader(gl, gl.VERTEX_SHADER, vsSource);
  const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
  const program = gl.createProgram()!;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  if (feedbackVaryings) {
    gl.transformFeedbackVaryings(program, feedbackVaryings, gl.SEPARATE_ATTRIBS);
  }
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error('Program link failed: ' + gl.getProgramInfoLog(program));
  }
  return program;
}

export function createVAO(gl: WebGL2RenderingContext, buffer: WebGLBuffer) {
  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  // Attribute 0: position (vec2), Attribute 1: velocity (vec2)
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 16, 0);
  gl.enableVertexAttribArray(1);
  gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 16, 8);
  gl.bindVertexArray(null);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  return vao;
}
