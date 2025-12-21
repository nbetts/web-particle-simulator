// Change the radius of all particles in-place
export function setParticleRadius(particles: planck.Body[], radius: number) {
  for (const body of particles) {
    // Remove all existing fixtures
    let fixture = body.getFixtureList();
    while (fixture) {
      const next = fixture.getNext();
      body.destroyFixture(fixture);
      fixture = next;
    }
    // Add new fixture with new radius
    body.createFixture(planck.Circle(radius), {
      restitution: 1,
      friction: 0,
      density: 1,
    });
  }
}
import planck from 'planck-js';
import { PARTICLE_RADIUS, VELOCITY_RANGE } from './constants';

export function randomBetween(a: number, b: number) {
  return a + Math.random() * (b - a);
}

export function createParticles(world: planck.World, width: number, height: number, count: number, radius: number = PARTICLE_RADIUS): planck.Body[] {
  const particles: planck.Body[] = [];
  for (let i = 0; i < count; ++i) {
    const x = randomBetween(radius, width - radius);
    const y = randomBetween(radius, height - radius);
    const vx = randomBetween(-VELOCITY_RANGE, VELOCITY_RANGE);
    const vy = randomBetween(-VELOCITY_RANGE, VELOCITY_RANGE);
    const body = world.createDynamicBody(planck.Vec2(x, y));
    body.createFixture(planck.Circle(radius), {
      restitution: 1,
      friction: 0,
      density: 1,
    });
    body.setLinearVelocity(planck.Vec2(vx, vy));
    particles.push(body);
  }
  return particles;
}

export function getParticleSpeeds(particles: planck.Body[]): number[] {
  return particles.map(body => {
    const v = body.getLinearVelocity();
    return Math.sqrt(v.x * v.x + v.y * v.y);
  });
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function speedToColor(speed: number, minSpeed: number, maxSpeed: number): [number, number, number] {
  // Normalize speed to [0, 1]
  const t = Math.max(0, Math.min(1, (speed - minSpeed) / (maxSpeed - minSpeed)));
  if (t < 0.5) {
    // Blue (0,0,1) to Red (1,0,0)
    const tt = t / 0.5;
    return [lerp(0, 1, tt), 0, lerp(1, 0, tt)];
  } else {
    // Red (1,0,0) to Yellow (1,1,0)
    const tt = (t - 0.5) / 0.5;
    return [1, lerp(0, 1, tt), 0];
  }
}
