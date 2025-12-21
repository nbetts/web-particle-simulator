export function resizeCanvasToDisplaySize(canvas: HTMLCanvasElement) {
  const width = Math.floor(window.innerWidth);
  const height = Math.floor(window.innerHeight);
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
    return true;
  }
  return false;
}

export function createCircleVertices(radius: number, segments = 32) {
  const verts = [];
  for (let i = 0; i <= segments; ++i) {
    const theta = (i / segments) * 2 * Math.PI;
    verts.push(Math.cos(theta) * radius, Math.sin(theta) * radius);
  }
  return new Float32Array(verts);
}
