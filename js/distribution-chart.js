import { simpleEstimate } from './distribution.js';
import { project } from './coordinates.js';

const integer = new Intl.NumberFormat('es-ES', { useGrouping: 'always', maximumFractionDigits: 0 });
export const formatInteger = n => integer.format(n);
const coordinate = n => n.toFixed(2);

export function drawDistributionChart(figure, { limit, samples, sampled }) {
  const width = Math.max(242, figure.clientWidth);
  const frame = { left: 54, top: 24, width: width - 90, height: 136 };
  const bottom = frame.top + frame.height;
  const right = frame.left + frame.width;
  const last = samples.at(-1);
  const step = Math.ceil(Math.max(last.estimate, last.count, simpleEstimate(last.x)) / 3);
  const bounds = { xMin: 2, xMax: limit, yMin: 0, yMax: 3 * step };
  const position = (x, y) => project(x, y, bounds, frame);
  const axes = [0, step, 2 * step, 3 * step].map(n => {
    const { y } = position(2, n);
    return '<path class="grid" d="M54 ' + y + 'H' + right + '"/>'
      + '<text x="49" y="' + (y + 4) + '" text-anchor="end">' + formatInteger(n) + '</text>';
  }).join('');
  const xTicks = width < 445 ? [2, limit / 2, limit] : [2, limit / 4, limit / 2, 3 * limit / 4, limit];
  const horizontal = xTicks.map(n => {
    const { x } = position(n, 0);
    return '<path class="axis" d="M' + x + ' ' + bottom + 'v4"/>'
      + '<text x="' + x + '" y="' + (bottom + 19) + '" text-anchor="middle">' + formatInteger(n) + '</text>';
  }).join('');

  const countPath = [];
  const estimatePath = [];
  const simplePath = [];
  for (const [index, sample] of samples.entries()) {
    const x = coordinate(position(sample.x, 0).x);
    const y = value => coordinate(position(sample.x, value).y);
    const start = index === 0 ? 'M' : 'L';
    estimatePath.push(start + x + ' ' + y(sample.estimate));
    simplePath.push(start + x + ' ' + y(simpleEstimate(sample.x)));
    if (sampled || index === 0) countPath.push(start + x + ' ' + y(sample.count));
    else if (sample.jump || sample.x === limit) countPath.push('H' + x + 'V' + y(sample.count));
  }
  const svg = figure.querySelector('svg');
  svg.setAttribute('viewBox', '0 0 ' + width + ' 207');
  svg.setAttribute('aria-label', 'Recuento real y dos estimaciones hasta ' + formatInteger(limit)
    + (sampled ? '. El trazado une muestras del recuento.' : '. El recuento se muestra en escalones.'));
  svg.innerHTML = `
    <g class="plane-labels">
      <text x="54" y="17">Cantidad de primos</text>
      ${axes}${horizontal}
      <path class="axis" d="M54 24V${bottom}H${right}"/>
      <text x="${width / 2}" y="202" text-anchor="middle">Números estudiados</text>
    </g>
    <path class="line-primes" d="${countPath.join('')}"/>
    <path class="line-simple" d="${simplePath.join('')}"/>
    <path class="line-li" d="${estimatePath.join('')}"/>`;
}
