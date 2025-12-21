// Vertex shader for impostor circle rendering (draws a quad per particle)
export const particleVertexShader = `
  precision mediump float;
  attribute vec2 aPosition;
  uniform vec2 uCenter;
  uniform float uRadius;
  uniform vec2 uResolution;
  varying vec2 vLocalPos;
  void main() {
    // aPosition in [-1,1], quad
    vLocalPos = aPosition;
    // Scale quad to particle size and move to center
    vec2 pos = uCenter + aPosition * uRadius;
    vec2 clip = (pos / uResolution) * 2.0 - 1.0;
    gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
  }
`;

export const particleFragmentShaders: { [key: string]: string } = {
  'Basic':  `
    precision mediump float;
    uniform vec3 uColor;
    varying vec2 vLocalPos;
    uniform vec2 uResolution;
    uniform float uRadius;
    void main() {
      float dist = length(vLocalPos);
      float edgeWidth = 1.5 / (uRadius * min(uResolution.x, uResolution.y));
      float alpha = 1.0 - smoothstep(1.0 - edgeWidth, 1.0 + edgeWidth, dist);
      gl_FragColor = vec4(uColor, alpha);
    }
  `,
  'Glow': `
    precision mediump float;
    varying vec2 vLocalPos;
    uniform vec3 uColor;
    uniform float uRadius;
    void main() {
      // Compute distance from center in screen space
      float dist = length((vLocalPos - 0.5) * 2.0) * uRadius;
      float edge = uRadius;
      float glowStart = edge;
      float glowEnd = 2.0 * uRadius;
      float alpha = 1.0;
      if (dist > edge) {
        // Exponential fade for glow
        float t = clamp((dist - glowStart) / (glowEnd - glowStart), 0.0, 1.0);
        alpha = exp(-4.0 * t); // sharper exponential falloff
      }
      if (dist > glowEnd) discard;
      gl_FragColor = vec4(uColor, alpha);
    }
  `,
};
