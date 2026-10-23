let fps = 0;
let lastFpsUpdate = 0;
let frameCount = 0;

export function updateFpsCounter(dt: number) {
  frameCount++;
  lastFpsUpdate += dt;
  if (lastFpsUpdate >= 1) {
    fps = frameCount / lastFpsUpdate;
    frameCount = 0;
    lastFpsUpdate = 0;
    displayFps(fps);
  }
}

function displayFps(fps: number) {
  const fpsElem = document.getElementById('fps-counter');
  if (fpsElem) {
    fpsElem.textContent = `FPS: ${fps.toFixed(1)}`;
  }
}
