export type HUDSettings = {
  paused: boolean;
  particleCount: number;
  timeSpeed: number;
  particleSize: number;
};

const DEFAULTS: HUDSettings = {
  paused: false,
  particleCount: 100,
  timeSpeed: 50,
  particleSize: 10,
};

export function loadSettings(): HUDSettings {
  try {
    const s = localStorage.getItem('particleSimSettings');
    if (!s) return { ...DEFAULTS };
    return { ...DEFAULTS, ...JSON.parse(s) };
  } catch {
    return { ...DEFAULTS };
  }
}

export function saveSettings(settings: HUDSettings) {
  localStorage.setItem('particleSimSettings', JSON.stringify(settings));
}

export function setupHUD(
  onPause: (paused: boolean) => void,
  onParticleCount: (count: number) => void,
  onTimeSpeed: (speed: number) => void,
  onParticleSize: (size: number) => void,
  onReset: () => void,
  settings: HUDSettings
) {
  const pauseBtn = document.getElementById('pauseBtn') as HTMLButtonElement;
  const particleCountSlider = document.getElementById('particleCount') as HTMLInputElement;
  const particleCountValue = document.getElementById('particleCountValue') as HTMLSpanElement;
  const particleSizeSlider = document.getElementById('particleSize') as HTMLInputElement;
  const particleSizeValue = document.getElementById('particleSizeValue') as HTMLSpanElement;
  const timeSpeedSlider = document.getElementById('timeSpeed') as HTMLInputElement;
  const timeSpeedValue = document.getElementById('timeSpeedValue') as HTMLSpanElement;
  const resetBtn = document.getElementById('resetBtn') as HTMLButtonElement;

  pauseBtn.textContent = settings.paused ? 'Resume' : 'Pause';
  particleCountSlider.value = settings.particleCount.toString();
  particleCountValue.textContent = settings.particleCount.toString();
  particleSizeSlider.value = settings.particleSize.toString();
  particleSizeValue.textContent = settings.particleSize.toString();
  timeSpeedSlider.value = settings.timeSpeed.toString();
  timeSpeedValue.textContent = settings.timeSpeed.toString();

  pauseBtn.onclick = () => {
    settings.paused = !settings.paused;
    pauseBtn.textContent = settings.paused ? 'Resume' : 'Pause';
    saveSettings(settings);
    onPause(settings.paused);
  };
  particleCountSlider.oninput = () => {
    settings.particleCount = parseInt(particleCountSlider.value, 10);
    particleCountValue.textContent = settings.particleCount.toString();
    saveSettings(settings);
    onParticleCount(settings.particleCount);
  };
  particleSizeSlider.oninput = () => {
    settings.particleSize = parseInt(particleSizeSlider.value, 10);
    particleSizeValue.textContent = settings.particleSize.toString();
    saveSettings(settings);
    onParticleSize(settings.particleSize);
  };
  timeSpeedSlider.oninput = () => {
    settings.timeSpeed = parseInt(timeSpeedSlider.value, 10);
    timeSpeedValue.textContent = settings.timeSpeed.toString();
    saveSettings(settings);
    onTimeSpeed(settings.timeSpeed);
  };
  resetBtn.onclick = () => {
    Object.assign(settings, DEFAULTS);
    pauseBtn.textContent = settings.paused ? 'Resume' : 'Pause';
    particleCountSlider.value = settings.particleCount.toString();
    particleCountValue.textContent = settings.particleCount.toString();
    particleSizeSlider.value = settings.particleSize.toString();
    particleSizeValue.textContent = settings.particleSize.toString();
    timeSpeedSlider.value = settings.timeSpeed.toString();
    timeSpeedValue.textContent = settings.timeSpeed.toString();
    saveSettings(settings);
    onReset();
  };
}

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

export { DEFAULTS };
