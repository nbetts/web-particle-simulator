// Types for the new high-performance particle simulator
export type ParticleData = {
  x: Float32Array;
  y: Float32Array;
  vx: Float32Array;
  vy: Float32Array;
  count: number;
};

export type Grid = {
  cellSize: number;
  cols: number;
  rows: number;
  cells: Int32Array[];
};
