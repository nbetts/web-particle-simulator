export type WebGLCircleProgram = {
  gl: WebGLRenderingContext;
  program: WebGLProgram;
  vbo: WebGLBuffer;
  aPosition: number;
  uCenter: WebGLUniformLocation;
  uRadius: WebGLUniformLocation;
  uResolution: WebGLUniformLocation;
  uColor: WebGLUniformLocation;
};

export function initWebGL(canvas: HTMLCanvasElement, vsSource: string, fsSource: string): WebGLCircleProgram {
  const gl = canvas.getContext('webgl')!;
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  function loadShader(type: number, source: string): WebGLShader {
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      throw new Error('Shader compile failed: ' + gl.getShaderInfoLog(shader));
    }
    return shader;
  }
  const vertexShader = loadShader(gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl.FRAGMENT_SHADER, fsSource);
  const program = gl.createProgram()!;
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error('Program link failed: ' + gl.getProgramInfoLog(program));
  }
  gl.useProgram(program);

  // Quad geometry for impostor circle: covers [-1,-1] to [1,1]
  const quadVerts = new Float32Array([
    -1, -1,
    1, -1,
    -1, 1,
    -1, 1,
    1, -1,
    1, 1,
  ]);
  const vbo = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, quadVerts, gl.STATIC_DRAW);

  const aPosition = gl.getAttribLocation(program, 'aPosition');
  gl.enableVertexAttribArray(aPosition);
  gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

  return {
    gl,
    program,
    vbo,
    aPosition,
    uCenter: gl.getUniformLocation(program, 'uCenter')!,
    uRadius: gl.getUniformLocation(program, 'uRadius')!,
    uResolution: gl.getUniformLocation(program, 'uResolution')!,
    uColor: gl.getUniformLocation(program, 'uColor')!,
  };
}

export function drawCircles(
  webgl: WebGLCircleProgram,
  circles: Array<{ x: number; y: number; radius: number; color: [number, number, number] }>,
  width: number,
  height: number
) {
  const { gl, program, uCenter, uRadius, uResolution, uColor } = webgl;
  gl.viewport(0, 0, width, height);
  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.useProgram(program);
  gl.uniform2f(uResolution, width, height);
  for (const c of circles) {
    gl.uniform2f(uCenter, c.x, c.y);
    gl.uniform1f(uRadius, c.radius);
    gl.uniform3fv(uColor, c.color);
    // Draw the quad (6 vertices)
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }
}
