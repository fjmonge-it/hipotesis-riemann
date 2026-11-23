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
      <text x="176" y="164">0</text>
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

function zeroReading(zero, index) {
  return 'Cero ' + (index + 1) + ' · Parte real: ' + display(zero.real)
    + ' · Parte imaginaria: ≈ ' + zero.imaginary.toFixed(6).replace('.', ',') + '.';
}

export function zeroScale(highest) {
  const step = [5, 10, 20, 30, 50].find(value => 5 * value > highest);
  return { step, max: (Math.floor(highest / step) + 1) * step };
}

export function initZeroExplorer(root) {
  const count = root.querySelector('#cantidad-ceros');
  const selected = root.querySelector('#cero-elegido');
  const chart = root.querySelector('svg');
  const summary = root.querySelector('[data-summary]');
  let visible;
  let scale;
  const frame = { left: 48, top: 24, width: 268, height: 370 };
  const position = (a, b) => project(a, b, { xMin: -.15, xMax: 1.15, yMin: 0, yMax: scale.max }, frame);
  chart.setAttribute('viewBox', '0 0 350 446');
  function draw() {
    const active = Number(selected.value);
    summary.textContent = zeroReading(visible[active], active);
    const left = position(0, 0).x;
    const right = position(1, 0).x;
    const middle = position(criticalStrip.line, 0).x;
    const bottom = position(0, 0).y;
    const ticks = Array.from({ length: scale.max / scale.step }, (_, i) => (i + 1) * scale.step);
    const selection = position(visible[active].real, visible[active].imaginary);
    chart.setAttribute('aria-label', 'Primeros ' + visible.length + ' ceros sobre la recta crítica. ' + summary.textContent);
    chart.innerHTML = `
      <rect class="strip-fill" x="${left}" y="${frame.top}" width="${right - left}" height="${frame.height}"/>
      <g class="plane-labels">
        ${ticks.map(n => {
          const { y } = position(0, n);
          return '<path class="grid" d="M48 ' + y + 'H316"/><text x="42" y="' + (y+4) + '" text-anchor="end">' + n + '</text>';
        }).join('')}
        <text x="48" y="17">Im(s)</text>
        <path class="axis" d="M48 ${bottom}H316M${left} 24V${bottom}"/>
        <path class="critical" d="M${middle} 24V${bottom}"/>
        <text x="${left}" y="416" text-anchor="middle">0</text><text x="${middle}" y="416" text-anchor="middle">½</text>
        <text x="${right}" y="416" text-anchor="middle">1</text><text x="316" y="438" text-anchor="end">Re(s)</text>
      </g>
      ${visible.map((zero, index) => {
        const p = position(zero.real, zero.imaginary);
        return '<circle data-zero="' + index + '" fill="var(--accent)" r="' + (visible.length > 20 ? 1.9 : 3.6)
          + '" cx="' + p.x + '" cy="' + p.y + '"/>';
      }).join('')}
      <circle class="selected-ring" r="6" cx="${selection.x}" cy="${selection.y}"/>`;
  }
  function update() {
    visible = nontrivialZeros.slice(0, Number(count.value));
    scale = zeroScale(visible.at(-1).imaginary);
    const keep = Math.min(Number(selected.value), visible.length - 1);
    selected.replaceChildren(...visible.map((_, i) => new Option('Cero ' + (i + 1), i)));
    selected.value = keep;
    draw();
  }
  count.addEventListener('change', update);
  selected.addEventListener('change', draw);
  chart.addEventListener('click', event => {
    const p = new DOMPoint(event.clientX, event.clientY).matrixTransform(chart.getScreenCTM().inverse());
    selected.value = visible.reduce((best, zero, i) => Math.abs(position(zero.real, zero.imaginary).y - p.y)
      < Math.abs(position(visible[best].real, visible[best].imaginary).y - p.y) ? i : best, 0);
    draw();
  });
  update();
  root.hidden = false;
  root.parentElement.querySelector('#ejemplo-ceros').hidden = true;
}

export function initZeroMap(root) {
  const control = root.querySelector('select');
  const svg = root.querySelector('[data-overview]');
  const detail = root.querySelector('[data-strip-detail]');
  const detailSvg = detail.querySelector('svg');
  const summary = root.querySelector('[role=status]');
  const mapBounds = { xMin: -9, xMax: 4, yMin: -4, yMax: 36 };
  const mapFrame = { left: 20, top: 18, width: 304, height: 166 };
  const point = (a, b) => project(a, b, mapBounds, mapFrame);
  const axis = point(0, 0);
  const convergence = point(1, 0).x;
  const detailFrame = { left: 48, top: 20, width: 270, height: 151 };
  const detailBounds = { xMin: -.1, xMax: 1.1, yMin: 0, yMax: 36 };
  const zoom = (real, imaginary) => project(real, imaginary, detailBounds, detailFrame);
  const left = zoom(criticalStrip.left, 0).x;
  const right = zoom(criticalStrip.right, 0).x;
  const bottom = zoom(0, 0).y;
  const selector = detail.querySelector('[data-map-point]');
  const reading = detail.querySelector('[data-map-reading]');
  selector.replaceChildren(...nontrivialZeros.slice(0, 5).map((_, i) => new Option('Cero ' + (i + 1), i)));
  function updateDetail() {
    const index = Number(selector.value);
    const dot = zoom(nontrivialZeros[index].real, nontrivialZeros[index].imaginary);
    reading.textContent = zeroReading(nontrivialZeros[index], index);
  detailSvg.innerHTML = `
    <rect class="strip-fill" x="${left}" y="20" width="${right - left}" height="${detailFrame.height}"/>
    <g class="plane-labels">
      <text x="48" y="16">Im(s)</text>
      <text x="318" y="208" text-anchor="end">Re(s)</text>
      ${[10, 20, 30].map(n => {
        const { y } = zoom(0, n);
        return '<path class="grid" d="M' + left + ' ' + y + 'H' + right + '"/><text x="46" y="' + (y + 4) + '" text-anchor="end">' + n + '</text>';
      }).join('')}
      <path class="axis" d="M48 ${bottom}H318M${left} 20V${bottom}"/>
      <text x="${left}" y="190" text-anchor="middle">0</text>
      <text x="${right}" y="190" text-anchor="middle">1</text>
    </g>
    ${nontrivialZeros.slice(0, 5).map(zero => {
      const p = zoom(zero.real, zero.imaginary);
      return '<circle class="example-point" r="4" cx="' + p.x + '" cy="' + p.y + '"/>';
    }).join('')}
    <circle class="selected-ring" r="7" cx="${dot.x}" cy="${dot.y}"/>`;
  }
  selector.addEventListener('change', updateDetail);

  function update() {
    const trivial = control.value === 'triviales';
    detail.hidden = trivial;
    if (!trivial) updateDetail();
    const points = trivial ? [-8, -6, -4, -2].map(real => ({ real, imaginary: 0 })) : nontrivialZeros.slice(0, 5);
    summary.textContent = trivial ? 'Ceros triviales sobre el eje real: −8, −6, −4 y −2.'
      : 'Los cinco primeros ceros con parte imaginaria positiva están dentro de la banda crítica. La ampliación permite examinarlos.';
    svg.setAttribute('aria-label', summary.textContent + ' La serie converge a la derecha de la parte real 1.');
    svg.innerHTML = `
      <defs><pattern id="zona-convergencia" width="7" height="7" patternUnits="userSpaceOnUse">
        <path d="M0 7L7 0" stroke="#536962"/>
      </pattern></defs>
      <rect fill="#b7d8bc" x="${axis.x}" y="18" width="${convergence - axis.x}" height="166"/>
      <rect fill="url(#zona-convergencia)" x="${convergence}" y="18" width="${324 - convergence}" height="166"/>
      <path class="axis" d="M20 ${axis.y}H324M${axis.x} 18V184"/>
      <g class="plane-labels">
        <text x="${axis.x - 6}" y="15" text-anchor="end">Im(s)</text><text x="324" y="219" text-anchor="end">Re(s)</text>
        ${[-8, -6, -4, -2, 0, 1, 3].map(a => '<text x="' + point(a, 0).x + '" y="201" text-anchor="middle">' + display(a) + '</text>').join('')}
        ${[10, 20, 30].map(b => '<text x="' + (axis.x - 5) + '" y="' + (point(0, b).y + 4) + '" text-anchor="end">' + b + '</text>').join('')}
      </g>
      ${points.map(({ real, imaginary }) => {
        const p = point(real, imaginary);
        return '<circle class="example-point" r="5" cx="' + p.x + '" cy="' + p.y + '"/>';
      }).join('')}`;
  }
  control.addEventListener('change', update);
  update();
  root.hidden = false;
}
