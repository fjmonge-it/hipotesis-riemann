// SVG's vertical coordinate increases downwards.
export function project(x, y, bounds, frame) {
  return {
    x: frame.left + (x - bounds.xMin) / (bounds.xMax - bounds.xMin) * frame.width,
    y: frame.top + (bounds.yMax - y) / (bounds.yMax - bounds.yMin) * frame.height,
  };
}

export const criticalStrip = Object.freeze({ left: 0, right: 1, line: 1 / 2 });

export function complexLabel(real, imaginary, digits = 0) {
  const format = new Intl.NumberFormat('es-ES', { minimumFractionDigits: digits, maximumFractionDigits: digits });
  const a = String(real).replace('.', ',').replace('-', '−');
  if (imaginary === 0) return a;
  const b = format.format(Math.abs(imaginary)) + 'i';
  if (real === 0) return (imaginary < 0 ? '−' : '') + b;
  return a + (imaginary < 0 ? ' − ' : ' + ') + b;
}
