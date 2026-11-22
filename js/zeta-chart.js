const whole = new Intl.NumberFormat('es-ES', { useGrouping: 'always' });
export const formatCount = value => whole.format(value);
const decimals = new Intl.NumberFormat('es-ES', { maximumFractionDigits: 9 });
const scientific = new Intl.NumberFormat('es-ES', { notation: 'scientific', maximumFractionDigits: 3 });
export const formatValue = value => decimals.format(value);
export const formatGap = value => value < 1e-8 ? scientific.format(value) : formatValue(value);

export function renderZetaChart(figure, { sums, products, reference, compare, caption }) {
  const limit = sums.length;
  const left = 66;
  const right = 456;
  const top = 28;
  const bottom = 176;
  const x = n => left + Math.log(n) / Math.log(limit) * (right - left);
  const y = value => bottom - (value - 1) / (reference - 1) * (bottom - top);
  const coord = value => value.toFixed(2);
  const ticks = [1, 2, 5, 10, 25, 50, 100, 250, 500]
    .filter(n => n < limit && right - x(n) > 42);
  ticks.push(limit);
  const horizontal = [1, 1 + (reference - 1) / 2, reference];
  const yLabels = new Intl.NumberFormat('es-ES', { maximumFractionDigits: 4 });
  const grid = horizontal.map((value, i) => {
    const row = coord(y(value));
    const lineClass = i === 2 ? 'line-limit' : 'grid';
    return '<path class="' + lineClass + '" d="M' + left + ' ' + row + 'H' + right + '"/>'
      + '<text text-anchor="end" x="57" y="' + (Number(row) + 5) + '">' + yLabels.format(value) + '</text>';
  }).join('');
  const marks = ticks.map(n => {
    const column = coord(x(n));
    return '<path class="axis" d="M' + column + ' 176v5"/>'
      + '<text text-anchor="middle" x="' + column + '" y="198">' + formatCount(n) + '</text>';
  }).join('');
  const sumPath = sums.map((value, index) => (
    (index === 0 ? 'M' : 'H') + coord(x(index + 1)) + (index === 0 ? ' ' : 'V') + coord(y(value))
  )).join('');
  const productPath = 'M' + left + ' ' + bottom + products.map(({ n, value }) => (
    'H' + coord(x(n)) + 'V' + coord(y(value))
  )).join('') + 'H' + right;
  const label = compare ? 'Evolución de la suma y del producto hasta N' : 'Evolución de la suma hasta N';
  figure.innerHTML = `
    <ul class="legend" aria-label="Leyenda">
      <li>Suma parcial</li>
      ${compare ? '<li class="legend-li">Producto parcial</li>' : ''}
      <li class="legend-limit">Límite ζ(s)</li>
    </ul>
    <svg viewBox="0 0 480 232" role="img" aria-label="${label}">
      <g class="plot-text">
        <text x="66" y="17">Valor</text>
        ${grid}${marks}
        <text x="261" y="224" text-anchor="middle">Límite N · escala logarítmica</text>
      </g>
      <path class="axis" d="M66 28V176H456"/>
      <path class="line-primes" d="${sumPath}"/>
      ${compare ? '<path class="line-li" d="' + productPath + '"/>' : ''}
      <circle class="prime-dots" cx="456" cy="${coord(y(sums.at(-1)))}" r="3.5"/>
    </svg>
    <figcaption>${caption} El eje horizontal deja más espacio a los primeros pasos.</figcaption>`;
}
