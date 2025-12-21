export type HUDSettings = {
  paused: boolean;
  particleCount: number;
  particleEnergy: number;
  particleSize: number;
  repulsionRadius: number;
  repulsionSpring: number;
};

const DEFAULTS: HUDSettings = {
  paused: false,
  particleCount: 250,
  particleEnergy: 50,
  particleSize: 10,
  repulsionRadius: 40,
  repulsionSpring: 1.0,
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
  onRepulsionRadius: (radius: number) => void,
  onRepulsionSpring: (spring: number) => void,
  onReset: () => void,
  settings: HUDSettings
) {
  const pauseBtn = document.getElementById('pauseBtn') as HTMLButtonElement;
  const particleCountSlider = document.getElementById('particleCount') as HTMLInputElement;
  const particleCountValue = document.getElementById('particleCountValue') as HTMLSpanElement;
  const particleSizeSlider = document.getElementById('particleSize') as HTMLInputElement;
  const particleSizeValue = document.getElementById('particleSizeValue') as HTMLSpanElement;
  const particleEnergySlider = document.getElementById('particleEnergy') as HTMLInputElement;
  const particleEnergyValue = document.getElementById('particleEnergyValue') as HTMLSpanElement;
  const repulsionRadiusSlider = document.getElementById('repulsionRadius') as HTMLInputElement;
  const repulsionRadiusValue = document.getElementById('repulsionRadiusValue') as HTMLSpanElement;
  const repulsionSpringSlider = document.getElementById('repulsionSpring') as HTMLInputElement;
  const repulsionSpringValue = document.getElementById('repulsionSpringValue') as HTMLSpanElement;
  const resetBtn = document.getElementById('resetBtn') as HTMLButtonElement;

  pauseBtn.textContent = settings.paused ? 'Resume' : 'Pause';
  particleCountSlider.value = settings.particleCount.toString();
  particleCountValue.textContent = settings.particleCount.toString();
  particleSizeSlider.value = settings.particleSize.toString();
  particleSizeValue.textContent = settings.particleSize.toString();
  particleEnergySlider.value = settings.particleEnergy.toString();
  particleEnergyValue.textContent = settings.particleEnergy.toString();
  repulsionRadiusSlider.value = settings.repulsionRadius.toString();
  repulsionRadiusValue.textContent = settings.repulsionRadius.toString();
  repulsionSpringSlider.value = settings.repulsionSpring.toString();
  repulsionSpringValue.textContent = settings.repulsionSpring.toFixed(1);

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
  particleEnergySlider.oninput = () => {
    settings.particleEnergy = parseInt(particleEnergySlider.value, 10);
    particleEnergyValue.textContent = settings.particleEnergy.toString();
    saveSettings(settings);
    onTimeSpeed(settings.particleEnergy);
  };
  repulsionRadiusSlider.oninput = () => {
    settings.repulsionRadius = parseInt(repulsionRadiusSlider.value, 10);
    repulsionRadiusValue.textContent = settings.repulsionRadius.toString();
    saveSettings(settings);
    onRepulsionRadius(settings.repulsionRadius);
  };
  repulsionSpringSlider.oninput = () => {
    settings.repulsionSpring = parseFloat(repulsionSpringSlider.value);
    repulsionSpringValue.textContent = settings.repulsionSpring.toFixed(1);
    saveSettings(settings);
    onRepulsionSpring(settings.repulsionSpring);
  };
  resetBtn.onclick = () => {
    Object.assign(settings, DEFAULTS);
    pauseBtn.textContent = settings.paused ? 'Resume' : 'Pause';
    particleCountSlider.value = settings.particleCount.toString();
    particleCountValue.textContent = settings.particleCount.toString();
    particleSizeSlider.value = settings.particleSize.toString();
    particleSizeValue.textContent = settings.particleSize.toString();
    particleEnergySlider.value = settings.particleEnergy.toString();
    particleEnergyValue.textContent = settings.particleEnergy.toString();
    repulsionRadiusSlider.value = settings.repulsionRadius.toString();
    repulsionRadiusValue.textContent = settings.repulsionRadius.toString();
    repulsionSpringSlider.value = settings.repulsionSpring.toString();
    repulsionSpringValue.textContent = settings.repulsionSpring.toFixed(1);
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
