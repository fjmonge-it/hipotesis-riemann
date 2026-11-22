import { project } from './coordinates.js';

const integer = new Intl.NumberFormat('es-ES', { useGrouping: 'always' });
export const formatInteger = n => integer.format(n);
const coordinate = n => n.toFixed(2);

export function drawDistributionChart(figure, model, errorChart) {
  const { limit, samples } = model;
  const width = Math.max(242, figure.clientWidth);
  const frame = { left: 49, top: 22, width: width - 74, height: 136 };
  const bottom = frame.top + frame.height;
  const right = frame.left + frame.width;
  const bounds = { xMin: 2, xMax: limit, yMin: 0, yMax: 1 };
  let yTicks;
  if (errorChart) {
    for (const { error, jump, x } of samples) {
      bounds.yMin = Math.min(bounds.yMin, error - (x === 2 ? 0 : jump));
      bounds.yMax = Math.max(bounds.yMax, error);
    }
    bounds.yMin = Math.floor(bounds.yMin);
    bounds.yMax = Math.ceil(bounds.yMax);
    yTicks = [bounds.yMin, Math.round(bounds.yMin / 2), 0];
    if (bounds.yMax * frame.height / (bounds.yMax - bounds.yMin) >= 22) yTicks.push(bounds.yMax);
    yTicks = [...new Set(yTicks)];
  } else {
    const last = samples.at(-1);
    const step = Math.ceil(Math.max(last.estimate, last.count) / 3);
    bounds.yMax = 3 * step;
    yTicks = [0, step, 2 * step, 3 * step];
  }
  const position = (x, y) => project(x, y, bounds, frame);
  const axes = yTicks.map(n => {
    const { y } = position(2, n);
    const style = errorChart && n === 0 ? 'zero-axis' : 'grid';
    return '<path class="' + style + '" d="M49 ' + y + 'H' + right + '"/>'
      + '<text x="43" y="' + (y + 4) + '" text-anchor="end">' + formatInteger(n) + '</text>';
  }).join('');
  const xTicks = width < 425 ? [2, limit / 2, limit] : [2, limit / 4, limit / 2, 3 * limit / 4, limit];
  const horizontal = xTicks.map(n => {
    const { x } = position(n, 0);
    return '<path class="axis" d="M' + x + ' ' + bottom + 'v4"/>'
      + '<text x="' + x + '" y="' + (bottom + 19) + '" text-anchor="middle">' + formatInteger(n) + '</text>';
  }).join('');

  let previous = samples[0].count;
  const staircase = [];
  const estimatePath = [];
  const errorPath = [];
  for (const [index, sample] of samples.entries()) {
    const x = coordinate(position(sample.x, 0).x);
    const ordinate = value => coordinate(position(sample.x, value).y);
    const start = index === 0 ? 'M' : 'L';
    if (errorChart) {
      errorPath.push(start + x + ' ' + ordinate(previous - sample.estimate));
      if (sample.count !== previous) errorPath.push('V' + ordinate(sample.error));
    } else {
      estimatePath.push(start + x + ' ' + ordinate(sample.estimate));
      if (index === 0) staircase.push('M' + x + ' ' + ordinate(sample.count));
      else if (sample.jump || sample.x === limit) {
        staircase.push('H' + x + 'V' + ordinate(sample.count));
      }
    }
    previous = sample.count;
  }
  const svg = figure.querySelector('svg');
  svg.setAttribute('viewBox', '0 0 ' + width + ' 203');
  svg.innerHTML = `
    <g class="plane-labels">
      <text x="49" y="16">${errorChart ? 'Desviación E(x)' : 'Cantidad acumulada'}</text>
      ${axes}${horizontal}
      <path class="axis" d="M49 22V${bottom}H${right}"/>
      <text x="${width / 2}" y="198" text-anchor="middle">Límite del recuento, x</text>
    </g>
    ${errorChart ? '<path class="line-error" d="' + errorPath.join('') + '"/>'
      : '<path class="line-li" d="' + estimatePath.join('') + '"/><path class="line-primes" d="' + staircase.join('') + '"/>'}
    <path class="coordinate-guide" data-cursor/>
    <circle class="example-point" r="4" data-reading-point/>
    ${errorChart ? '' : '<circle class="estimate-point" r="4" data-estimate-point/>'}`;

  const cursor = svg.querySelector('[data-cursor]');
  const countPoint = svg.querySelector('[data-reading-point]');
  const estimatePoint = svg.querySelector('[data-estimate-point]');
  function move(point, x, y) {
    const p = position(x, y);
    point.setAttribute('cx', p.x);
    point.setAttribute('cy', p.y);
  }
  return reading => {
    const { x } = position(reading.x, 0);
    cursor.setAttribute('d', 'M' + x + ' 22V' + bottom);
    move(countPoint, reading.x, errorChart ? reading.error : reading.count);
    if (estimatePoint) move(estimatePoint, reading.x, reading.estimate);
  };
}
