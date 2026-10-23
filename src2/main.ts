// Entry point for the high-performance particle simulator
import { WORLD_HEIGHT, WORLD_WIDTH } from './constants';
import { startSimulation } from './sim';

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('glcanvas') as HTMLCanvasElement;
  canvas.width = WORLD_WIDTH;
  canvas.height = WORLD_HEIGHT;
  startSimulation(canvas);
});
