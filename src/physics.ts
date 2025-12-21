import { Edge, Vec2, World } from 'planck-js';

export function createWorld() {
  return new World({ gravity: new Vec2(0, 0) });
}

export function createBoundaries(world: World, width: number, height: number) {
  // Remove all static bodies (walls)
  for (let b = world.getBodyList(); b; ) {
    const next = b.getNext();
    if (b.isStatic() && !b.isDynamic()) world.destroyBody(b);
    b = next;
  }
  // Add new boundaries (edges at full window size)
  const wallDef = [
    [new Vec2(0, 0), new Vec2(0, height)],
    [new Vec2(width, 0), new Vec2(width, height)],
    [new Vec2(0, 0), new Vec2(width, 0)],
    [new Vec2(0, height), new Vec2(width, height)],
  ];
  for (const [a, b] of wallDef) {
    const wall = world.createBody();
    wall.createFixture(new Edge(a, b), { restitution: 1, friction: 0 });
  }
}

export function stepWorld(world: World, timeStep: number) {
  world.step(timeStep);
}
