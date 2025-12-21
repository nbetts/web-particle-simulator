export type WebGLCircleProgram = {
  gl: WebGLRenderingContext;
  program: WebGLProgram;
  vbo: WebGLBuffer;
  aPosition: number;
  uCenter: WebGLUniformLocation;
  uRadius: WebGLUniformLocation;
  uResolution: WebGLUniformLocation;
  uColor: WebGLUniformLocation;
  circleVerts: Float32Array;
};

export function initWebGL(canvas: HTMLCanvasElement, vsSource: string, fsSource: string): WebGLCircleProgram {
  const gl = canvas.getContext('webgl')!;
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

  // Circle geometry
  function createCircleVertices(radius: number, segments = 32) {
    const verts = [];
    for (let i = 0; i <= segments; ++i) {
      const theta = (i / segments) * 2 * Math.PI;
      verts.push(Math.cos(theta) * radius, Math.sin(theta) * radius);
    }
    return new Float32Array(verts);
  }
  const circleVerts = createCircleVertices(1, 32);
  const vbo = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, circleVerts, gl.STATIC_DRAW);

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
    circleVerts,
  };
}

export function drawCircles(
  webgl: WebGLCircleProgram,
  circles: Array<{ x: number; y: number; radius: number; color: [number, number, number] }>,
  width: number,
  height: number
) {
  const { gl, program, uCenter, uRadius, uResolution, uColor, circleVerts } = webgl;
  gl.viewport(0, 0, width, height);
  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.useProgram(program);
  gl.uniform2f(uResolution, width, height);
  for (const c of circles) {
    gl.uniform2f(uCenter, c.x, c.y);
    gl.uniform1f(uRadius, c.radius);
    gl.uniform3fv(uColor, c.color);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, circleVerts.length / 2);
  }
}
