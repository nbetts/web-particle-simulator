export const vsSource = `
  attribute vec2 aPosition;
  uniform vec2 uCenter;
  uniform float uRadius;
  uniform vec2 uResolution;
  void main() {
    vec2 pos = uCenter + aPosition * uRadius;
    vec2 clip = (pos / uResolution) * 2.0 - 1.0;
    gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
  }
`;

export const fsSource = `
  precision mediump float;
  uniform vec3 uColor;
  void main() {
    gl_FragColor = vec4(uColor, 1.0);
  }
`;
