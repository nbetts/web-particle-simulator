export const particleVertexShader = `
  precision mediump float;
  attribute vec2 aPosition;
  uniform vec2 uCenter;
  uniform float uRadius;
  uniform vec2 uResolution;
  varying vec2 vLocalPos;
  void main() {
    // vLocalPos in [0,1] for fragment shader
    vLocalPos = aPosition * 0.5 + 0.5;
    vec2 pos = uCenter + aPosition * uRadius;
    vec2 clip = (pos / uResolution) * 2.0 - 1.0;
    gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
  }
`;

export const particleFragmentShaders: { [key: string]: string } = {
  'Basic': `
    precision mediump float;
    uniform vec3 uColor;
    void main() {
      gl_FragColor = vec4(uColor, 1.0);
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
