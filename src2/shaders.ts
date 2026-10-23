// Instanced rendering shaders for high-performance particles
export const particleVertexShader = `#version 300 es
precision highp float;
layout(location = 0) in vec2 aQuad;
layout(location = 1) in vec2 aPos;
uniform float uRadius;
uniform vec2 uResolution;
out vec2 vLocalPos;
void main() {
  vLocalPos = aQuad;
  vec2 pos = aPos + aQuad * uRadius;
  vec2 clip = (pos / uResolution) * 2.0 - 1.0;
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
}
`;

export const particleFragmentShader = `#version 300 es
precision highp float;
in vec2 vLocalPos;
out vec4 outColor;
void main() {
  float dist = length(vLocalPos);
  float edge = 1.0;
  float alpha = 1.0 - smoothstep(edge - 0.05, edge + 0.05, dist);
  outColor = vec4(1.0, 0.8, 0.2, alpha);
  if (alpha < 0.01) discard;
}
`;
