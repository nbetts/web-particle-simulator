export type HUDSettings = {
  paused: boolean;
  particleCount: number;
  particleSize: number;
  repulsionRadius: number; // now a multiplier (e.g. 1.0 = 1x particle size)
  repulsionSpring: number;
  shader: string;
};

const DEFAULTS: HUDSettings = {
  paused: false,
  particleCount: 250,
  particleSize: 10,
  repulsionRadius: 3.0,
  repulsionSpring: 1.0,
  shader: 'Basic',
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
  onParticleSize: (size: number) => void,
  onRepulsionRadius: (radius: number) => void,
  onRepulsionSpring: (spring: number) => void,
  onReset: () => void,
  onShader: (shader: string) => void,
  settings: HUDSettings
) {
  const pauseBtn = document.getElementById('pauseBtn') as HTMLButtonElement;
  const particleCountSlider = document.getElementById('particleCount') as HTMLInputElement;
  const particleCountValue = document.getElementById('particleCountValue') as HTMLSpanElement;
  const particleSizeSlider = document.getElementById('particleSize') as HTMLInputElement;
  const particleSizeValue = document.getElementById('particleSizeValue') as HTMLSpanElement;
  const repulsionRadiusSlider = document.getElementById('repulsionRadius') as HTMLInputElement;
  const repulsionRadiusValue = document.getElementById('repulsionRadiusValue') as HTMLSpanElement;
  const repulsionSpringSlider = document.getElementById('repulsionSpring') as HTMLInputElement;
  const repulsionSpringValue = document.getElementById('repulsionSpringValue') as HTMLSpanElement;
  const shaderSelect = document.getElementById('shaderSelect') as HTMLSelectElement;
  const resetBtn = document.getElementById('resetBtn') as HTMLButtonElement;

  pauseBtn.textContent = settings.paused ? 'Resume' : 'Pause';
  particleCountSlider.value = settings.particleCount.toString();
  particleCountValue.textContent = settings.particleCount.toString();
  particleSizeSlider.value = settings.particleSize.toString();
  particleSizeValue.textContent = settings.particleSize.toString();
  repulsionRadiusSlider.value = settings.repulsionRadius.toString();
  repulsionRadiusValue.textContent = settings.repulsionRadius.toFixed(1);
  repulsionSpringSlider.value = settings.repulsionSpring.toString();
  repulsionSpringValue.textContent = settings.repulsionSpring.toFixed(1);
  shaderSelect.value = settings.shader;

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
  repulsionRadiusSlider.oninput = () => {
    settings.repulsionRadius = parseFloat(repulsionRadiusSlider.value);
    repulsionRadiusValue.textContent = settings.repulsionRadius.toFixed(1);
    saveSettings(settings);
    onRepulsionRadius(settings.repulsionRadius);
  };
  repulsionSpringSlider.oninput = () => {
    settings.repulsionSpring = parseFloat(repulsionSpringSlider.value);
    repulsionSpringValue.textContent = settings.repulsionSpring.toFixed(1);
    saveSettings(settings);
    onRepulsionSpring(settings.repulsionSpring);
  };
  shaderSelect.oninput = () => {
    settings.shader = shaderSelect.value;
    shaderSelect.value = settings.shader;
    saveSettings(settings);
    onShader(settings.shader);
  };
  resetBtn.onclick = () => {
    settings = structuredClone(DEFAULTS);
    pauseBtn.textContent = settings.paused ? 'Resume' : 'Pause';
    particleCountSlider.value = settings.particleCount.toString();
    particleCountValue.textContent = settings.particleCount.toString();
    particleSizeSlider.value = settings.particleSize.toString();
    particleSizeValue.textContent = settings.particleSize.toString();
    repulsionRadiusSlider.value = settings.repulsionRadius.toString();
    repulsionRadiusValue.textContent = settings.repulsionRadius.toFixed(1);
    repulsionSpringSlider.value = settings.repulsionSpring.toString();
    repulsionSpringValue.textContent = settings.repulsionSpring.toFixed(1);
    saveSettings(settings);
    onParticleCount(settings.particleCount);
    onParticleSize(settings.particleSize);
    onRepulsionRadius(settings.repulsionRadius);
    onRepulsionSpring(settings.repulsionSpring);
    onShader(settings.shader);
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
