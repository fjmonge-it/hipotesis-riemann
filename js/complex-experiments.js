import { complexLabel, criticalStrip, project } from './coordinates.js';
import { nontrivialZeros } from './zeta.js';

const range = [-4, -3, -2, -1, 0, 1, 2, 3, 4];
const frame = { left: 43, top: 20, width: 254, height: 254 };
const bounds = { xMin: -4.5, xMax: 4.5, yMin: -4.5, yMax: 4.5 };
const display = n => String(n).replace('-', '−').replace('.', ',');

export function initComplexPlane(root) {
  const real = root.querySelector('#plano-real');
  const imaginary = root.querySelector('#plano-imaginario');
  for (const [input, initial] of [[real, 2], [imaginary, 3]]) {
    input.replaceChildren(...range.map(n => new Option(display(n), n, n === initial, n === initial)));
  }
  const chart = root.querySelector('svg');
  const summary = root.querySelector('[data-summary]');
  const origin = project(0, 0, bounds, frame);
  const grid = range.map(n => {
    const p = project(n, n, bounds, frame);
    return '<path class="grid" d="M' + p.x + ' 20V274M43 ' + p.y + 'H297"/>'
      + (n === 0 ? '' : '<text x="' + p.x + '" y="164" text-anchor="middle">' + display(n)
      + '</text><text x="162" y="' + (p.y + 4) + '" text-anchor="end">' + display(n) + '</text>');
  }).join('');
  chart.innerHTML = `
    <g class="plane-labels">
      ${grid}
      <path class="axis" d="M39 ${origin.y}H301M${origin.x} 16V278"/>
      <text x="162" y="164" text-anchor="end">0</text>
      <text x="303" y="151">Real</text><text x="170" y="14" text-anchor="middle">Imaginaria</text>
    </g>
    <path class="coordinate-guide"/><circle class="example-point" r="6"/>`;
  const point = chart.querySelector('circle');
  const guides = chart.querySelector('.coordinate-guide');

  function update() {
    const a = Number(real.value);
    const b = Number(imaginary.value);
    const p = project(a, b, bounds, frame);
    point.setAttribute('cx', p.x);
    point.setAttribute('cy', p.y);
    guides.setAttribute('d', 'M' + origin.x + ' ' + p.y + 'H' + p.x + 'V' + origin.y);
    chart.setAttribute('aria-label', 'Plano complejo con un punto en las coordenadas ' + a + ', ' + b);
    const name = root.querySelector('[data-complex]');
    name.textContent = complexLabel(a, b);
    const moves = [];
    if (a) moves.push(Math.abs(a) + (a > 0 ? ' a la derecha' : ' a la izquierda'));
    if (b) moves.push(Math.abs(b) + (b > 0 ? ' hacia arriba' : ' hacia abajo'));
    summary.textContent = moves.length ? 'Desde el origen: ' + moves.join(' y ') + '.' : 'El punto está en el origen.';
  }

  real.addEventListener('change', update);
  imaginary.addEventListener('change', update);
  update();
  root.hidden = false;
  root.parentElement.querySelector('#ejemplo-complejo').hidden = true;
}

export function initZeroExplorer(root) {
  const count = root.querySelector('#cantidad-ceros');
  const selected = root.querySelector('#cero-elegido');
  const showBand = root.querySelector('#mostrar-banda');
  const showLine = root.querySelector('#mostrar-recta');
  const chart = root.querySelector('svg');
  const summary = root.querySelector('[data-summary]');
  const zeroBounds = { xMin: -0.25, xMax: 1.25, yMin: 0, yMax: 36 };
  const zeroFrame = { left: 43, top: 22, width: 266, height: 242 };
  const position = (a, b) => project(a, b, zeroBounds, zeroFrame);
  const left = position(criticalStrip.left, 0).x;
  const right = position(criticalStrip.right, 0).x;
  const middle = position(criticalStrip.line, 0).x;
  const grid = [0, 10, 20, 30].map(n => {
    const { y } = position(0, n);
    return '<path class="grid" d="M43 ' + y + 'H309"/><text x="36" y="' + (y + 4)
      + '" text-anchor="end">' + n + '</text>';
  }).join('');
  chart.innerHTML = `
    <rect class="band" data-band x="${left}" y="22" width="${right - left}" height="242"/>
    <g class="plane-labels">
      ${grid}
      <path class="axis" d="M43 264H309M${left} 22V264"/>
      <path class="critical" data-line d="M${middle} 22V264"/>
      <text x="43" y="15">Im(s)</text><text x="309" y="301" text-anchor="end">Re(s)</text>
      <text x="${left}" y="283" text-anchor="middle">0</text>
      <text x="${middle}" y="283" text-anchor="middle">½</text>
      <text x="${right}" y="283" text-anchor="middle">1</text>
    </g><g data-points></g>`;
  const points = chart.querySelector('[data-points]');

  function update() {
    const active = Number(selected.value);
    const visible = nontrivialZeros.slice(0, Number(count.value));
    chart.querySelector('[data-band]').classList.toggle('plot-hidden', !showBand.checked);
    chart.querySelector('[data-line]').classList.toggle('plot-hidden', !showLine.checked);
    points.innerHTML = visible.map(({ real, imaginary }, index) => {
      const p = position(real, imaginary);
      return '<circle class="example-point" cx="' + p.x + '" cy="' + p.y + '" r="4"/>'
        + (active === index ? '<circle class="selected-ring" cx="' + p.x + '" cy="' + p.y + '" r="8"/>' : '');
    }).join('');
    const zero = visible[active];
    chart.setAttribute('aria-label', 'Plano de los primeros ' + visible.length + ' ceros mostrados, todos con parte real un medio.');
    summary.textContent = 'Cero ' + (active + 1) + ': s ≈ ' + complexLabel(zero.real, zero.imaginary, 6)
      + '. La parte real es exactamente ½. La parte imaginaria está redondeada.';
  }

  function updateOptions() {
    const keep = Math.min(Number(selected.value), Number(count.value) - 1);
    selected.replaceChildren(...nontrivialZeros.slice(0, Number(count.value)).map((_, index) => (
      new Option('Cero ' + (index + 1), index)
    )));
    selected.value = keep;
    update();
  }

  count.addEventListener('change', updateOptions);
  for (const input of [selected, showBand, showLine]) input.addEventListener('change', update);
  updateOptions();
  root.hidden = false;
  root.parentElement.querySelector('#ejemplo-ceros').hidden = true;
}
