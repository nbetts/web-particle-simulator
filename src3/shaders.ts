// Fragment shader for PBD integration step (updates position and velocity)
export const pbdIntegrateFragmentShader = `#version 300 es
precision highp float;
uniform sampler2D u_particleTex;
uniform float u_dt;
in vec2 v_texCoord;
out vec4 outColor;

void main() {
	vec4 state = texture(u_particleTex, v_texCoord);
	vec2 pos = state.xy;
	vec2 vel = state.zw;
	// Integrate
	pos += vel * u_dt;
	outColor = vec4(pos, vel);
}
`;

// Fragment shader for PBD constraint (collision) step (naive, for demo)
export const pbdConstraintFragmentShader = `#version 300 es
precision highp float;
uniform sampler2D u_particleTex;
uniform float u_radius;
uniform float u_textureSize;
in vec2 v_texCoord;
out vec4 outColor;

void main() {
	vec4 state = texture(u_particleTex, v_texCoord);
	vec2 pos = state.xy;
	vec2 vel = state.zw;
	// Naive all-pairs collision (for demo, not scalable)
	for (int y = 0; y < int(u_textureSize); ++y) {
		for (int x = 0; x < int(u_textureSize); ++x) {
			vec2 otherUV = (vec2(x, y) + 0.5) / u_textureSize;
			vec4 other = texture(u_particleTex, otherUV);
			if (all(equal(other.xy, pos))) continue;
			vec2 delta = pos - other.xy;
			float dist = length(delta);
			float minDist = 2.0 * u_radius;
			if (dist < minDist && dist > 0.0) {
				pos += 0.5 * (minDist - dist) * normalize(delta);
			}
		}
	}
	outColor = vec4(pos, vel);
}
`;
// shaders.ts - GLSL shader sources for GPU-only PBD simulation

// Vertex shader for PBD step (integration + local neighborhood collision constraint)
export const pbdVertexShader = `#version 300 es
precision highp float;
layout(location = 0) in vec2 a_position;
layout(location = 1) in vec2 a_velocity;

out vec2 v_position;
out vec2 v_velocity;
out float v_speed;

uniform float u_dt;
uniform float u_radius;
uniform int u_numParticles;

#define GRID_SIZE 64
#define DOMAIN_MIN -1.0
#define DOMAIN_MAX 1.0

int gridHash(vec2 pos) {
  ivec2 cell = ivec2(floor((pos - DOMAIN_MIN) / ((DOMAIN_MAX - DOMAIN_MIN) / float(GRID_SIZE))));
  return cell.y * GRID_SIZE + cell.x;
}

void main() {
  vec2 velocity = a_velocity;
  vec2 position = a_position + velocity * u_dt;

  // Naive local neighborhood collision (for demo, not optimal)
  for (int i = 0; i < u_numParticles; ++i) {
    if (i == gl_VertexID) continue;
    if (abs(i - gl_VertexID) > 8) continue;
  }

  // Boundary constraint
  if (position.x < DOMAIN_MIN + u_radius) { position.x = DOMAIN_MIN + u_radius; velocity.x *= -0.5; }
  if (position.x > DOMAIN_MAX - u_radius) { position.x = DOMAIN_MAX - u_radius; velocity.x *= -0.5; }
  if (position.y < DOMAIN_MIN + u_radius) { position.y = DOMAIN_MIN + u_radius; velocity.y *= -0.5; }
  if (position.y > DOMAIN_MAX - u_radius) { position.y = DOMAIN_MAX - u_radius; velocity.y *= -0.5; }

  v_position = position;
  v_velocity = velocity;
  v_speed = length(velocity);
}
`;

// Fragment shader for rendering particles
export const pbdFragmentShader = `#version 300 es
precision highp float;
in float v_speed;
out vec4 outColor;

// Map speed to infrared color scale (blue-cyan-green-yellow-red)
vec3 infraredColor(float t) {
	// t in [0,1]
	if (t < 0.25) {
		// Blue to Cyan
		float f = t / 0.25;
		return mix(vec3(0.0,0.0,1.0), vec3(0.0,1.0,1.0), f);
	} else if (t < 0.5) {
		// Cyan to Green
		float f = (t-0.25)/0.25;
		return mix(vec3(0.0,1.0,1.0), vec3(0.0,1.0,0.0), f);
	} else if (t < 0.75) {
		// Green to Yellow
		float f = (t-0.5)/0.25;
		return mix(vec3(0.0,1.0,0.0), vec3(1.0,1.0,0.0), f);
	} else {
		// Yellow to Red
		float f = (t-0.75)/0.25;
		return mix(vec3(1.0,1.0,0.0), vec3(1.0,0.0,0.0), f);
	}
}

void main() {
	// Tune maxSpeed for your simulation
	float maxSpeed = 0.2;
	float t = clamp(v_speed / maxSpeed, 0.0, 1.0);
	vec3 color = infraredColor(t);
	outColor = vec4(color, 1.0);
}
`;
